"""
test_models.py
--------------
Unit tests for model persistence, feature importances, and inference logic.
"""

import os
import joblib
import numpy as np
import pandas as pd
import pytest
from ml_backend.data.dataset_loader import FEATURE_COLUMNS, ARTIFACTS_DIR


def test_model_artifacts_exist():
    rf_file = os.path.join(ARTIFACTS_DIR, "rf_model.joblib")
    xgb_file = os.path.join(ARTIFACTS_DIR, "xgb_model.joblib")
    comp_file = os.path.join(ARTIFACTS_DIR, "model_comparison.json")

    assert os.path.exists(rf_file), "rf_model.joblib must exist"
    assert os.path.exists(xgb_file), "xgb_model.joblib must exist"
    assert os.path.exists(comp_file), "model_comparison.json must exist"


def test_random_forest_inference():
    rf_file = os.path.join(ARTIFACTS_DIR, "rf_model.joblib")
    rf_model = joblib.load(rf_file)

    sample = pd.DataFrame([{
        "precipitation_sum": 10.0,
        "wind_gusts_10m_max": 30.0,
        "wind_speed_10m_max": 18.0,
        "surface_pressure_mean": 1012.0,
        "relative_humidity_2m_mean": 65.0,
        "temperature_mean": 28.0,
        "temperature_2m_max": 31.0,
        "temperature_2m_min": 25.0,
        "latitude": 13.08,
        "longitude": 80.27,
    }])[FEATURE_COLUMNS]

    pred = rf_model.predict(sample)
    probs = rf_model.predict_proba(sample)[0]

    assert int(pred[0]) in {0, 1, 2}
    assert len(probs) == 3
    assert abs(sum(probs) - 1.0) < 1e-4


def test_xgboost_inference():
    xgb_file = os.path.join(ARTIFACTS_DIR, "xgb_model.joblib")
    xgb_model = joblib.load(xgb_file)

    sample = pd.DataFrame([{
        "precipitation_sum": 140.0,
        "wind_gusts_10m_max": 115.0,
        "wind_speed_10m_max": 85.0,
        "surface_pressure_mean": 984.0,
        "relative_humidity_2m_mean": 92.0,
        "temperature_mean": 26.0,
        "temperature_2m_max": 28.0,
        "temperature_2m_min": 24.0,
        "latitude": 13.08,
        "longitude": 80.27,
    }])[FEATURE_COLUMNS]

    pred = xgb_model.predict(sample)
    probs = xgb_model.predict_proba(sample)[0]

    # Extreme storm observation should classify as High Risk (2)
    assert int(pred[0]) == 2
    assert probs[2] > 0.5
