"""Chronological rolling-origin backtesting for synthetic kitchen demand."""

from pathlib import Path
import json

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / "data" / "raw" / "kitchen_demand_dataset.csv"
OUTPUT_DIR = ROOT / "ml" / "models"
OUTPUT_PATH = OUTPUT_DIR / "backtest_metrics.json"

TARGET = "actual_consumption_qty"
SERIES_COLS = ["kitchen_id", "meal_type", "category"]
CATEGORICAL = ["day_of_week", "kitchen_id", "meal_type", "category", "weather"]

FEATURES = [
    "day_of_week",
    "is_weekend",
    "is_festival",
    "promotion_flag",
    "homepage_featured",
    "discount_pct",
    "unit_price",
    "lag_1d_consumption",
    "lag_7d_avg_consumption",
    "lag_14d_avg_consumption",
    "historical_wastage_pct",
    "kitchen_id",
    "meal_type",
    "category",
    "weather",
]


def calculate_metrics(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.asarray(predicted, dtype=float)
    denominator = np.abs(actual).sum()

    return {
        "mae": float(mean_absolute_error(actual, predicted)),
        "rmse": float(np.sqrt(mean_squared_error(actual, predicted))),
        "wmape_percent": (
            float(np.abs(actual - predicted).sum() / denominator * 100)
            if denominator > 0 else None
        ),
    }


def prepare_features(train, valid):
    x_train = pd.get_dummies(
        train[FEATURES], columns=CATEGORICAL, dtype=float
    )
    x_valid = pd.get_dummies(
        valid[FEATURES], columns=CATEGORICAL, dtype=float
    )
    x_valid = x_valid.reindex(columns=x_train.columns, fill_value=0)
    return x_train, x_valid


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(DATA_PATH)
    required = {"date", TARGET, *FEATURES}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
    df = df.dropna(subset=["date", TARGET]).copy()
    df = df[df[TARGET] >= 0].sort_values("date")

    # Match the first-observation handling in train.py.
    first_observation = df.groupby(SERIES_COLS).cumcount() == 0
    df = df.loc[~first_observation].copy()

    dates = np.sort(df["date"].unique())
    if len(dates) < 20:
        raise ValueError("Not enough distinct dates for rolling backtesting.")

    # Three non-overlapping 28-day validation windows, each trained
    # only on dates preceding that window.
    window_days = 28
    number_of_windows = 3
    required_days = window_days * number_of_windows

    if len(dates) <= required_days:
        raise ValueError(
            f"Need more than {required_days} distinct dates; found {len(dates)}."
        )

    first_validation_index = len(dates) - required_days
    reports = []
    prediction_frames = []

    for window_number in range(number_of_windows):
        start_index = first_validation_index + window_number * window_days
        end_index = start_index + window_days

        validation_dates = dates[start_index:end_index]
        validation_start = pd.Timestamp(validation_dates[0])
        validation_end = pd.Timestamp(validation_dates[-1])

        train = df[df["date"] < validation_start].copy()
        valid = df[df["date"].isin(validation_dates)].copy()

        if train.empty or valid.empty:
            raise ValueError(f"Empty training or validation set in window {window_number + 1}.")

        x_train, x_valid = prepare_features(train, valid)
        model = HistGradientBoostingRegressor(
            max_iter=150,
            learning_rate=0.08,
            max_leaf_nodes=20,
            l2_regularization=1.0,
            random_state=42,
        )
        model.fit(x_train, train[TARGET])

        predictions = np.maximum(model.predict(x_valid), 0)
        baseline = valid["lag_7d_avg_consumption"].to_numpy()
        actual = valid[TARGET].to_numpy()

        reports.append({
            "window": window_number + 1,
            "train_start": str(train["date"].min().date()),
            "train_end": str(train["date"].max().date()),
            "validation_start": str(validation_start.date()),
            "validation_end": str(validation_end.date()),
            "train_rows": int(len(train)),
            "validation_rows": int(len(valid)),
            "baseline_7_day_average": calculate_metrics(actual, baseline),
            "hist_gradient_boosting": calculate_metrics(actual, predictions),
        })

        window_predictions = valid[
            ["date", "kitchen_id", "meal_type", "category", TARGET]
        ].copy()
        window_predictions["window"] = window_number + 1
        window_predictions["baseline_prediction"] = baseline
        window_predictions["ml_prediction"] = predictions
        prediction_frames.append(window_predictions)

    all_predictions = pd.concat(prediction_frames, ignore_index=True)
    overall = {
        "baseline_7_day_average": calculate_metrics(
            all_predictions[TARGET], all_predictions["baseline_prediction"]
        ),
        "hist_gradient_boosting": calculate_metrics(
            all_predictions[TARGET], all_predictions["ml_prediction"]
        ),
    }

    report = {
        "dataset": DATA_PATH.name,
        "dataset_type": "synthetic",
        "protocol": (
            "Three chronological, non-overlapping 28-day validation windows. "
            "Each window trains only on earlier dates. This is one-step-ahead "
            "rolling evaluation using precomputed historical demand features, "
            "not a recursive multi-day forecast."
        ),
        "windows": reports,
        "combined_validation_metrics": overall,
        "caveat": (
            "Synthetic data results do not establish real-world accuracy "
            "or actual food-waste reduction."
        ),
    }

    OUTPUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")
    all_predictions.to_csv(OUTPUT_DIR / "backtest_predictions.csv", index=False)

    print(json.dumps(report, indent=2))
    print(f"\nSaved backtest metrics: {OUTPUT_PATH}")
    print(f"Saved backtest predictions: {OUTPUT_DIR / 'backtest_predictions.csv'}")


if __name__ == "__main__":
    main()
