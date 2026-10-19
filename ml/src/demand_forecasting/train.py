from pathlib import Path
import json

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

ROOT = Path(__file__).resolve().parents[3]
DATA_PATH = ROOT / "data" / "raw" / "kitchen_demand_dataset.csv"
OUTPUT_DIR = ROOT / "ml" / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "actual_consumption_qty"

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


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Dataset not found: {DATA_PATH}")

    df = pd.read_csv(DATA_PATH)
    required = {"date", TARGET, *FEATURES}
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df[TARGET] = pd.to_numeric(df[TARGET], errors="coerce")
    df = df.dropna(subset=["date", TARGET]).copy()
    df = df[df[TARGET] >= 0].sort_values("date")

    # Ignore the first observation of each series, whose lag features
    # are zero because no previous observation exists.
    series_cols = ["kitchen_id", "meal_type", "category"]
    first_observation = df.groupby(series_cols).cumcount() == 0
    df = df.loc[~first_observation].copy()

    # Split by date so future observations are not used for training.
    dates = np.sort(df["date"].unique())
    if len(dates) < 10:
        raise ValueError("Not enough distinct dates for chronological validation.")

    split_index = int(len(dates) * 0.8)
    split_date = pd.Timestamp(dates[split_index])

    train = df[df["date"] < split_date].copy()
    valid = df[df["date"] >= split_date].copy()

    if train.empty or valid.empty:
        raise ValueError("Chronological split produced an empty partition.")

    # One-hot encode categorical features; align validation to training columns.
    X_train = pd.get_dummies(
        train[FEATURES], columns=["day_of_week", "kitchen_id", "meal_type", "category", "weather"],
        dtype=float
    )
    X_valid = pd.get_dummies(
        valid[FEATURES], columns=["day_of_week", "kitchen_id", "meal_type", "category", "weather"],
        dtype=float
    )
    X_valid = X_valid.reindex(columns=X_train.columns, fill_value=0)

    y_train = train[TARGET]
    y_valid = valid[TARGET]

    model = HistGradientBoostingRegressor(
        max_iter=150,
        learning_rate=0.08,
        max_leaf_nodes=20,
        l2_regularization=1.0,
        random_state=42,
    )
    model.fit(X_train, y_train)
    predictions = np.maximum(model.predict(X_valid), 0)

    # Baseline: average demand from the previous seven days.
    baseline = valid["lag_7d_avg_consumption"].to_numpy()

    metrics = {
        "dataset": DATA_PATH.name,
        "dataset_type": "synthetic",
        "forecast_protocol": (
            "One-step-ahead rolling evaluation using previously observed "
            "demand features; not a recursive multi-day forecast."
        ),
        "target": TARGET,
        "split_date": str(split_date.date()),
        "train_rows": int(len(train)),
        "validation_rows": int(len(valid)),
        "train_start": str(train["date"].min().date()),
        "train_end": str(train["date"].max().date()),
        "validation_start": str(valid["date"].min().date()),
        "validation_end": str(valid["date"].max().date()),
        "baseline_7_day_average": calculate_metrics(y_valid, baseline),
        "hist_gradient_boosting": calculate_metrics(y_valid, predictions),
        "caveat": (
            "Synthetic data results do not establish real-world accuracy "
            "or actual food-waste reduction."
        ),
    }

    results = valid[
        ["date", "kitchen_id", "meal_type", "category", TARGET]
    ].copy()
    results["baseline_prediction"] = baseline
    results["ml_prediction"] = predictions
    results.to_csv(OUTPUT_DIR / "validation_predictions.csv", index=False)

    with open(OUTPUT_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics, f, indent=2)

    # Save the model and its exact feature schema for later integration.
    joblib.dump(
        {"model": model, "feature_columns": list(X_train.columns), "features": FEATURES},
        OUTPUT_DIR / "demand_model.joblib",
    )

    print(json.dumps(metrics, indent=2))
    print(f"\nSaved results in: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
