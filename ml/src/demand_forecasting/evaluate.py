"""Reproduce subgroup metrics from saved validation predictions."""

from pathlib import Path
import json

import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
PREDICTIONS_PATH = ROOT / "ml" / "models" / "validation_predictions.csv"
OUTPUT_PATH = ROOT / "ml" / "models" / "subgroup_metrics.json"


def metrics(group):
    actual = group["actual_consumption_qty"]
    prediction = group["ml_prediction"]
    absolute_error = (actual - prediction).abs()

    return pd.Series({
        "rows": len(group),
        "mae": absolute_error.mean(),
        "rmse": ((actual - prediction) ** 2).mean() ** 0.5,
        "wmape_percent": (
            absolute_error.sum() / actual.abs().sum() * 100
            if actual.abs().sum() > 0 else None
        ),
    })


def main():
    if not PREDICTIONS_PATH.exists():
        raise FileNotFoundError(
            f"Validation predictions not found: {PREDICTIONS_PATH}. "
            "Run train.py first."
        )

    df = pd.read_csv(PREDICTIONS_PATH)
    required = {
        "kitchen_id", "meal_type", "category",
        "actual_consumption_qty", "ml_prediction"
    }
    missing = required - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")

    report = {}
    for column in ("kitchen_id", "meal_type", "category"):
        report[column] = {
            str(key): {
                k: (None if pd.isna(v) else float(v) if k != "rows" else int(v))
                for k, v in values.items()
            }
            for key, values in (
                df.groupby(column).apply(metrics, include_groups=False).to_dict("index").items()
            )
        }

    OUTPUT_PATH.write_text(json.dumps(report, indent=2), encoding="utf-8")

    for column, groups in report.items():
        print(f"\n--- {column} ---")
        print(pd.DataFrame.from_dict(groups, orient="index").round(3).to_string())

    print(f"\nSaved subgroup metrics to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
