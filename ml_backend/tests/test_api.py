"""
test_api.py
-----------
API unit and integration tests using FastAPI TestClient.
"""

import pytest
from fastapi.testclient import TestClient
from ml_backend.api.main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["models_loaded"]["random_forest"] is True
    assert data["models_loaded"]["xgboost"] is True


def test_model_status_endpoint():
    response = client.get("/model/status")
    assert response.status_code == 200
    data = response.json()
    assert data["is_trained"] is True
    assert "Random Forest" in data["models_available"]
    assert "XGBoost" in data["models_available"]
    assert data["preferred_model"] in ["XGBoost", "Random Forest"]


def test_model_metrics_endpoint():
    response = client.get("/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "Random Forest" in data["models"]
    assert "XGBoost" in data["models"]
    assert "f1_macro" in data["models"]["XGBoost"]["metrics"]
    assert "confusion_matrix" in data["models"]["Random Forest"]["metrics"]


def test_predict_risk_calm_conditions():
    payload = {
        "precipitation": 2.0,
        "temperature": 27.5,
        "humidity": 60.0,
        "wind_speed": 12.0,
        "wind_gusts": 22.0,
        "surface_pressure": 1012.0,
        "latitude": 13.0827,
        "longitude": 80.2707,
        "model_type": "preferred",
    }
    response = client.post("/predict-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["predicted_risk"] in ["Low", "Medium"]
    assert 0.0 <= data["confidence"] <= 1.0
    assert data["is_experimental"] is True
    assert "safety_disclaimer" in data


def test_predict_risk_severe_cyclone():
    payload = {
        "precipitation": 185.0,
        "temperature": 26.0,
        "humidity": 95.0,
        "wind_speed": 95.0,
        "wind_gusts": 140.0,
        "surface_pressure": 982.0,
        "latitude": 13.0827,
        "longitude": 80.2707,
        "model_type": "xgb",
    }
    response = client.post("/predict-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["predicted_risk"] == "High"
    assert data["risk_code"] == 2
    assert data["risk_score"] > 60.0
    assert data["probabilities"]["High"] > 0.5


def test_predict_risk_validation_error():
    # Temperature 100°C is out of realistic physical bounds (le=65.0)
    payload = {
        "precipitation": 10.0,
        "temperature": 100.0,
        "wind_speed": 20.0,
        "latitude": 13.08,
        "longitude": 80.27,
    }
    response = client.post("/predict-risk", json=payload)
    assert response.status_code == 422
