import pytest
from fastapi.testclient import TestClient

import main
from main import app
from app.routers import demand
from demand_forecasting.inference import DemandPredictionError


@pytest.fixture
def client(monkeypatch):
    # Prevent tests from depending on the actual model artifact.
    monkeypatch.setattr(main, "load_model", lambda: {"fake": "model"})

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def valid_payload():
    return {
        "is_weekend": 1,
        "is_festival": 0,
        "promotion_flag": 0,
        "homepage_featured": 1,
        "discount_pct": 10.0,
        "unit_price": 45.0,
        "lag_1d_consumption": 120.0,
        "lag_7d_avg_consumption": 115.0,
        "lag_14d_avg_consumption": 110.0,
        "historical_wastage_pct": 0.05,
        "day_of_week": "Monday",
        "kitchen_id": "1",
        "meal_type": "Lunch",
        "category": "Vegetables",
        "weather": "Sunny",
        "unit": "kg",
    }


def test_demand_prediction_success(client, valid_payload, monkeypatch):
    captured = {}

    def fake_predict(payload, artifact=None):
        captured["payload"] = payload
        captured["artifact"] = artifact

        return {
            "predicted_demand": 109.01,
            "unit": "kg",
            "model": "HistGradientBoosting",
            "dataset_type": "synthetic_training_data",
            "prediction_type": "one_step_ahead",
            "warning": "Prototype estimate.",
        }

    monkeypatch.setattr(demand, "predict_demand", fake_predict)

    response = client.post(
        "/api/v1/demand/predict",
        json=valid_payload,
    )

    assert response.status_code == 200
    assert response.json()["predicted_demand"] == 109.01
    assert response.json()["unit"] == "kg"
    assert captured["payload"]["category"] == "Vegetables"
    assert captured["artifact"] == {"fake": "model"}


def test_demand_prediction_rejects_invalid_data(client, valid_payload):
    valid_payload["day_of_week"] = "Funday"

    response = client.post(
        "/api/v1/demand/predict",
        json=valid_payload,
    )

    assert response.status_code == 422


def test_demand_prediction_model_unavailable(client, valid_payload):
    app.state.demand_model = None

    response = client.post(
        "/api/v1/demand/predict",
        json=valid_payload,
    )

    assert response.status_code == 503


def test_demand_prediction_handles_prediction_error(
    client, valid_payload, monkeypatch
):
    def fake_predict(payload, artifact=None):
        raise DemandPredictionError("Invalid prediction input")

    monkeypatch.setattr(demand, "predict_demand", fake_predict)

    response = client.post(
        "/api/v1/demand/predict",
        json=valid_payload,
    )

    assert response.status_code == 422


def test_demand_prediction_handles_unexpected_error(
    client, valid_payload, monkeypatch
):
    def fake_predict(payload, artifact=None):
        raise RuntimeError("Unexpected failure")

    monkeypatch.setattr(demand, "predict_demand", fake_predict)

    response = client.post(
        "/api/v1/demand/predict",
        json=valid_payload,
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Demand prediction failed."
