import sys
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "ml" / "src"))

from demand_forecasting.inference import (
    DemandPredictionError,
    _validate_payload,
)


@pytest.fixture
def valid_payload():
    return {
        "day_of_week": "Monday",
        "is_weekend": 0,
        "is_festival": 0,
        "promotion_flag": 0,
        "homepage_featured": 0,
        "discount_pct": 0,
        "unit_price": 45,
        "lag_1d_consumption": 120,
        "lag_7d_avg_consumption": 118,
        "lag_14d_avg_consumption": 117,
        "historical_wastage_pct": 0.03,
        "kitchen_id": "K1_MainCampus",
        "meal_type": "Lunch",
        "category": "Rice",
        "weather": "Sunny",
    }


def test_valid_payload_is_accepted(valid_payload):
    result = _validate_payload(valid_payload)
    assert result["day_of_week"] == "Monday"
    assert result["lag_1d_consumption"] == 120.0


def test_missing_field_is_rejected(valid_payload):
    valid_payload.pop("category")
    with pytest.raises(DemandPredictionError, match="Missing required fields"):
        _validate_payload(valid_payload)


def test_negative_demand_feature_is_rejected(valid_payload):
    valid_payload["lag_1d_consumption"] = -1
    with pytest.raises(DemandPredictionError, match="cannot be negative"):
        _validate_payload(valid_payload)


def test_invalid_weekday_is_rejected(valid_payload):
    valid_payload["day_of_week"] = "Mon"
    with pytest.raises(DemandPredictionError, match="weekday name"):
        _validate_payload(valid_payload)
