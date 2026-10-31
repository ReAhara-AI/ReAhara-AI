"""Inference interface for the ReAhara AI demand-forecasting model."""

from pathlib import Path
from datetime import date, datetime
import math

import joblib
import pandas as pd

ROOT = Path(__file__).resolve().parents[3]
DEFAULT_MODEL_PATH = ROOT / "ml" / "models" / "demand_model.joblib"

NUMERIC_FEATURES = [
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
]

CATEGORICAL_FEATURES = [
    "day_of_week",
    "kitchen_id",
    "meal_type",
    "category",
    "weather",
]

REQUIRED_FEATURES = NUMERIC_FEATURES + CATEGORICAL_FEATURES


class DemandPredictionError(ValueError):
    """Raised when prediction input is invalid."""


def load_model(model_path=DEFAULT_MODEL_PATH):
    """Load the saved model and its feature schema."""
    path = Path(model_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Model artifact not found: {path}. "
            "Run train.py first or configure the model artifact path."
        )

    artifact = joblib.load(path)

    if not isinstance(artifact, dict):
        raise ValueError("Unsupported model artifact format.")

    if not {"model", "feature_columns", "features"}.issubset(artifact):
        raise ValueError("Model artifact is missing required metadata.")

    return artifact


def _validate_payload(payload):
    if not isinstance(payload, dict):
        raise DemandPredictionError("Input must be a JSON object.")

    missing = sorted(set(REQUIRED_FEATURES) - set(payload))
    if missing:
        raise DemandPredictionError(
            f"Missing required fields: {', '.join(missing)}"
        )

    row = {}

    for field in NUMERIC_FEATURES:
        value = payload[field]

        if isinstance(value, bool):
            raise DemandPredictionError(f"{field} must be numeric, not boolean.")

        try:
            number = float(value)
        except (TypeError, ValueError):
            raise DemandPredictionError(f"{field} must be numeric.") from None

        if not math.isfinite(number):
            raise DemandPredictionError(f"{field} must be finite.")

        if number < 0:
            raise DemandPredictionError(f"{field} cannot be negative.")

        if field in {
            "is_weekend", "is_festival",
            "promotion_flag", "homepage_featured"
        } and number not in (0, 1):
            raise DemandPredictionError(f"{field} must be 0 or 1.")

        row[field] = number

    for field in CATEGORICAL_FEATURES:
        value = payload[field]
        if not isinstance(value, str) or not value.strip():
            raise DemandPredictionError(f"{field} must be a non-empty string.")
        row[field] = value.strip()

    if row["historical_wastage_pct"] > 1:
        raise DemandPredictionError(
            "historical_wastage_pct must be a fraction between 0 and 1."
        )

    valid_days = {
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    }
    if row["day_of_week"] not in valid_days:
        raise DemandPredictionError(
            "day_of_week must be a full weekday name, such as Monday."
        )

    return row


def predict_demand(payload, model_path=DEFAULT_MODEL_PATH, artifact=None):
    """
    Predict one-step demand from a feature payload.

    Historical lag features must come from observations available at
    prediction time. This function does not forecast future lag values.
    """
    row = _validate_payload(payload)
    if artifact is None:
        artifact = load_model(model_path)

    model_input = pd.DataFrame([row])

    model_input = pd.get_dummies(
        model_input,
        columns=CATEGORICAL_FEATURES,
        dtype=float,
    )

    model_input = model_input.reindex(
        columns=artifact["feature_columns"],
        fill_value=0,
    )

    prediction = float(artifact["model"].predict(model_input)[0])
    prediction = max(0.0, prediction)

    return {
        "predicted_demand": round(prediction, 2),
        "unit": payload.get("unit", "unspecified"),
        "model": "HistGradientBoosting",
        "dataset_type": "synthetic_training_data",
        "prediction_type": "one_step_ahead",
        "warning": (
            "Prototype estimate trained on synthetic data; not validated "
            "for operational food-safety or redistribution decisions."
        ),
    }
