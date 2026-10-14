"""
main.py
-------
FastAPI REST API for SafeSphere AI Machine Learning Disaster Risk Assessment.
Serves RandomForest and XGBoost inference, model status, and comparative validation metrics.
"""

from datetime import datetime, timezone
import json
import os
import sys
from typing import Any, Dict, List, Literal, Optional
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# Ensure repository root is in sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

from ml_backend.data.dataset_loader import (
    FEATURE_COLUMNS,
    CLASS_LABELS,
    ARTIFACTS_DIR,
)

app = FastAPI(
    title="SafeSphere AI - Disaster Risk Assessment ML Service",
    description="Machine learning classification backend using RandomForest and XGBoost for multi-hazard risk assessment.",
    version="1.0.0",
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model state
loaded_models: Dict[str, Any] = {}
model_metadata: Dict[str, Any] = {}
model_comparison: Dict[str, Any] = {}


def load_artifacts():
    global loaded_models, model_metadata, model_comparison

    metadata_file = os.path.join(ARTIFACTS_DIR, "model_metadata.json")
    comparison_file = os.path.join(ARTIFACTS_DIR, "model_comparison.json")
    rf_file = os.path.join(ARTIFACTS_DIR, "rf_model.joblib")
    xgb_file = os.path.join(ARTIFACTS_DIR, "xgb_model.joblib")

    if os.path.exists(metadata_file):
        with open(metadata_file, "r", encoding="utf-8") as f:
            model_metadata = json.load(f)

    if os.path.exists(comparison_file):
        with open(comparison_file, "r", encoding="utf-8") as f:
            model_comparison = json.load(f)

    if os.path.exists(rf_file):
        try:
            loaded_models["rf"] = joblib.load(rf_file)
        except Exception as e:
            print(f"Warning: Failed to load RF model: {e}")

    if os.path.exists(xgb_file):
        try:
            loaded_models["xgb"] = joblib.load(xgb_file)
        except Exception as e:
            print(f"Warning: Failed to load XGBoost model: {e}")


# Load models on module import / startup
load_artifacts()


class PredictRiskRequest(BaseModel):
    precipitation: float = Field(
        ...,
        ge=0.0,
        le=1500.0,
        description="Cumulative precipitation in millimeters (mm).",
    )
    temperature: float = Field(
        ...,
        ge=-60.0,
        le=65.0,
        description="Air temperature in degrees Celsius (°C).",
    )
    humidity: Optional[float] = Field(
        70.0,
        ge=0.0,
        le=100.0,
        description="Relative atmospheric humidity percentage (%).",
    )
    wind_speed: float = Field(
        ...,
        ge=0.0,
        le=400.0,
        description="Sustained 10m wind velocity in km/h.",
    )
    wind_gusts: Optional[float] = Field(
        None,
        ge=0.0,
        le=500.0,
        description="Peak 10m wind gust velocity in km/h. If omitted, estimated from wind_speed * 1.3.",
    )
    surface_pressure: Optional[float] = Field(
        1010.0,
        ge=850.0,
        le=1090.0,
        description="Mean surface atmospheric barometric pressure in hPa.",
    )
    latitude: float = Field(
        ...,
        ge=-90.0,
        le=90.0,
        description="Geographic latitude coordinate.",
    )
    longitude: float = Field(
        ...,
        ge=-180.0,
        le=180.0,
        description="Geographic longitude coordinate.",
    )
    model_type: Optional[Literal["rf", "xgb", "preferred"]] = Field(
        "preferred",
        description="Select specific classifier ('rf', 'xgb', or 'preferred').",
    )

    @field_validator("wind_gusts", mode="before")
    def populate_wind_gusts(cls, v, values):
        return v


class PredictRiskResponse(BaseModel):
    status: str
    predicted_risk: Literal["Low", "Medium", "High"]
    risk_code: int
    risk_score: float
    model_used: str
    confidence: float
    probabilities: Dict[str, float]
    contributing_features: List[Dict[str, Any]]
    input_features: Dict[str, Any]
    timestamp: str
    is_experimental: bool
    safety_disclaimer: str


@app.get("/health", tags=["System"])
def health_check():
    """Returns service health status and loaded model states."""
    return {
        "status": "healthy",
        "service": "SafeSphere ML Backend",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": {
            "random_forest": "rf" in loaded_models,
            "xgboost": "xgb" in loaded_models,
        },
        "artifacts_available": {
            "comparison": os.path.exists(os.path.join(ARTIFACTS_DIR, "model_comparison.json")),
            "metadata": os.path.exists(os.path.join(ARTIFACTS_DIR, "model_metadata.json")),
        },
    }


@app.get("/model/status", tags=["Model"])
def model_status():
    """Returns active model status, available models, and training state."""
    rf_ready = "rf" in loaded_models
    xgb_ready = "xgb" in loaded_models
    is_trained = rf_ready and xgb_ready

    return {
        "is_trained": is_trained,
        "status": "ready" if is_trained else "pending_training",
        "models_available": [
            name
            for name, key in [("Random Forest", "rf"), ("XGBoost", "xgb")]
            if key in loaded_models
        ],
        "preferred_model": model_metadata.get("preferred_model", "XGBoost" if xgb_ready else "None"),
        "features": FEATURE_COLUMNS,
        "class_labels": CLASS_LABELS,
        "artifacts_directory": ARTIFACTS_DIR,
    }


@app.get("/model/metrics", tags=["Model"])
def model_metrics():
    """Returns comparative validation metrics for Random Forest and XGBoost."""
    if not model_comparison:
        load_artifacts()

    if not model_comparison:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Model validation metrics are not yet available. Please execute training pipeline first.",
        )

    return model_comparison


@app.post("/predict-risk", response_model=PredictRiskResponse, tags=["Inference"])
def predict_risk(payload: PredictRiskRequest):
    """
    Performs machine learning disaster risk classification on meteorological observations.
    Returns predicted risk class, confidence, class probabilities, and feature importances.
    """
    # 1. Check model availability
    if not loaded_models:
        load_artifacts()

    if not loaded_models:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Prediction unavailable: ML models are not trained or artifacts are missing.",
        )

    # 2. Select model
    preferred_name = model_metadata.get("preferred_model", "XGBoost")
    target_key = "xgb" if "XGB" in preferred_name else "rf"

    if payload.model_type == "rf":
        target_key = "rf"
    elif payload.model_type == "xgb":
        target_key = "xgb"

    model = loaded_models.get(target_key)
    if model is None:
        # Fall back to whatever is available
        fallback_key = "rf" if target_key == "xgb" else "xgb"
        model = loaded_models.get(fallback_key)
        if model is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Prediction unavailable: Requested model '{payload.model_type}' is not loaded.",
            )
        target_key = fallback_key

    model_display_name = "XGBoost" if target_key == "xgb" else "Random Forest"

    # 3. Assemble feature vector matching FEATURE_COLUMNS exact ordering
    # FEATURE_COLUMNS:
    # 0: precipitation_sum
    # 1: wind_gusts_10m_max
    # 2: wind_speed_10m_max
    # 3: surface_pressure_mean
    # 4: relative_humidity_2m_mean
    # 5: temperature_mean
    # 6: temperature_2m_max
    # 7: temperature_2m_min
    # 8: latitude
    # 9: longitude

    wind_gusts_val = payload.wind_gusts
    if wind_gusts_val is None:
        wind_gusts_val = payload.wind_speed * 1.3

    humidity_val = payload.humidity if payload.humidity is not None else 70.0
    pressure_val = payload.surface_pressure if payload.surface_pressure is not None else 1010.0
    temp_mean = payload.temperature
    temp_max = payload.temperature + 3.0
    temp_min = payload.temperature - 3.0

    feature_dict = {
        "precipitation_sum": payload.precipitation,
        "wind_gusts_10m_max": round(wind_gusts_val, 2),
        "wind_speed_10m_max": round(payload.wind_speed, 2),
        "surface_pressure_mean": round(pressure_val, 2),
        "relative_humidity_2m_mean": round(humidity_val, 2),
        "temperature_mean": round(temp_mean, 2),
        "temperature_2m_max": round(temp_max, 2),
        "temperature_2m_min": round(temp_min, 2),
        "latitude": round(payload.latitude, 4),
        "longitude": round(payload.longitude, 4),
    }

    input_df = pd.DataFrame([feature_dict])[FEATURE_COLUMNS]

    # 4. Perform Inference
    try:
        class_code = int(model.predict(input_df)[0])
        probabilities_raw = model.predict_proba(input_df)[0]
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference computation error: {str(exc)}",
        )

    prob_dict = {
        "Low": float(round(probabilities_raw[0], 4)),
        "Medium": float(round(probabilities_raw[1], 4)),
        "High": float(round(probabilities_raw[2], 4)),
    }

    predicted_label = CLASS_LABELS.get(class_code, "Low")
    confidence = float(round(probabilities_raw[class_code], 4))

    # Calculate 0-100 severity index weighted by probabilities
    # 0 = Low (0-35), 1 = Medium (35-65), 2 = High (65-100)
    risk_score = round(
        (prob_dict["Low"] * 15.0) + (prob_dict["Medium"] * 52.0) + (prob_dict["High"] * 92.0),
        1,
    )

    # 5. Extract feature contributions from model importance
    model_imp = model_comparison.get("models", {}).get(model_display_name, {}).get("feature_importance", {})
    contributing = []
    for feat_name, imp_weight in list(model_imp.items())[:5]:
        val = feature_dict.get(feat_name, 0.0)
        contributing.append({
            "feature": feat_name,
            "value": val,
            "importance": round(imp_weight, 4),
        })

    return PredictRiskResponse(
        status="success",
        predicted_risk=predicted_label,
        risk_code=class_code,
        risk_score=risk_score,
        model_used=model_display_name,
        confidence=confidence,
        probabilities=prob_dict,
        contributing_features=contributing,
        input_features=feature_dict,
        timestamp=datetime.now(timezone.utc).isoformat(),
        is_experimental=True,
        safety_disclaimer=(
            "EXPERIMENTAL RESEARCH MODEL - NOT AN OFFICIAL DISASTER WARNING. "
            "Predictions are statistical classification estimates trained on historical meteorological patterns "
            "and do not supersede advisories from national meteorological agencies."
        ),
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
