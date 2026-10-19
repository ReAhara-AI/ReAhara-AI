"""Compare full and ablated models across identical chronological windows."""

import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / "data" / "raw" / "kitchen_demand_dataset.csv"
OUTPUT_PATH = ROOT / "ml" / "models" / "backtest_festival_ablation_metrics.json"

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

REMOVED = ["is_festival"]


def metrics(actual, predicted):
    actual = np.asarray(actual, dtype=float)
    predicted = np.maximum(np.asarray(predicted, dtype=float), 0)
    error = np.abs(actual - predicted)
    denominator = np.abs(actual).sum()

    return {
        "MAE": float(mean_absolute_error(actual, predicted)),
        "RMSE": float(np.sqrt(mean_squared_error(actual, predicted))),
        "WMAPE_percent": (
            float(error.sum() / denominator * 100)
            if denominator > 0 else None
        ),
    }


def fit_and_predict(train, valid, features):
    categorical = [column for column in CATEGORICAL if column in features]

    x_train = pd.get_dummies(
        train[features], columns=categorical, dtype=float
    )
    x_valid = pd.get_dummies(
        valid[features], columns=categorical, dtype=float
    )
    x_valid = x_valid.reindex(columns=x_train.columns, fill_value=0)

    model = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=20,
        l2_regularization=1.0,
        random_state=42,
    )
    model.fit(x_train, train[TARGET])
    return np.maximum(model.predict(x_valid), 0)


def main():
    df = pd.read_csv(DATA_PATH)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
    df = df.dropna(subset=["date", TARGET])
    df = df[df[TARGET] >= 0].sort_values("date").copy()

    missing = set(FEATURES + SERIES_COLS) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    first_observation = df.groupby(SERIES_COLS).cumcount() == 0
    df = df.loc[~first_observation].copy()

    dates = np.sort(df["date"].unique())
    window_days = 28
    number_of_windows = 3
    required_days = window_days * number_of_windows

    if len(dates) <= required_days:
        raise ValueError("Not enough distinct dates for three 28-day windows.")

    first_index = len(dates) - required_days
    all_results = []
    combined = {
        "full_model": {"actual": [], "predicted": []},
        "ablated_model": {"actual": [], "predicted": []},
        "baseline": {"actual": [], "predicted": []},
    }

    for window in range(number_of_windows):
        start = first_index + window * window_days
        validation_dates = dates[start:start + window_days]
        validation_start = pd.Timestamp(validation_dates[0])
        validation_end = pd.Timestamp(validation_dates[-1])

        train = df[df["date"] < validation_start].copy()
        valid = df[df["date"].isin(validation_dates)].copy()

        full_features = FEATURES
        ablated_features = [f for f in FEATURES if f not in REMOVED]

        full_prediction = fit_and_predict(train, valid, full_features)
        ablated_prediction = fit_and_predict(train, valid, ablated_features)
        baseline_prediction = valid["lag_7d_avg_consumption"].to_numpy()
        actual = valid[TARGET].to_numpy()

        result = {
            "window": window + 1,
            "validation_start": str(validation_start.date()),
            "validation_end": str(validation_end.date()),
            "validation_rows": int(len(valid)),
            "baseline_7_day_average": metrics(actual, baseline_prediction),
            "full_model": metrics(actual, full_prediction),
            "without_festival": metrics(
                actual, ablated_prediction
            ),
        }
        all_results.append(result)

        for key, prediction in [
            ("full_model", full_prediction),
            ("ablated_model", ablated_prediction),
            ("baseline", baseline_prediction),
        ]:
            combined[key]["actual"].extend(actual.tolist())
            combined[key]["predicted"].extend(
                np.asarray(prediction).tolist()
            )

    combined_metrics = {
        key: metrics(values["actual"], values["predicted"])
        for key, values in combined.items()
    }

    report = {
        "dataset_type": "synthetic",
        "protocol": (
            "Same three chronological non-overlapping 28-day windows and "
            "model hyperparameters as backtest.py. Both models train only "
            "on dates before each validation window. Evaluation is "
            "one-step-ahead using precomputed historical features, not "
            "recursive multi-day forecasting."
        ),
        "removed_features": REMOVED,
        "windows": all_results,
        "combined_validation_metrics": combined_metrics,
        "caveat": (
            "Results on synthetic data do not establish real-world accuracy "
            "or actual food-waste reduction."
        ),
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    for result in all_results:
        print(f"\nWINDOW {result['window']}: "
              f"{result['validation_start']} to {result['validation_end']}")
        for model_name in [
            "baseline_7_day_average",
            "full_model",
            "without_festival",
        ]:
            print(f"  {model_name}: {result[model_name]}")

    print("\nCOMBINED VALIDATION METRICS")
    for name, values in combined_metrics.items():
        print(f"  {name}: {values}")

    print(f"\nSaved report: {OUTPUT_PATH}")
    print("\nCaveat: synthetic-data experiment, not a real-world performance claim.")


if __name__ == "__main__":
    main()
