"""
train.py
--------
Trains and validates both RandomForestClassifier and XGBClassifier
for multi-class disaster risk classification (0=Low, 1=Medium, 2=High).
Computes comprehensive validation metrics, feature importances, and confusion matrices.
Persists trained models via joblib.
"""

import json
import os
import sys
from typing import Dict, Any, Tuple

# Ensure repository root is in sys.path
REPO_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if REPO_ROOT not in sys.path:
    sys.path.insert(0, REPO_ROOT)

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
from xgboost import XGBClassifier

from ml_backend.data.dataset_loader import (
    DisasterDatasetLoader,
    FEATURE_COLUMNS,
    CLASS_LABELS,
    ARTIFACTS_DIR,
)


def calculate_metrics(y_true, y_pred, y_probs) -> Dict[str, Any]:
    acc = accuracy_score(y_true, y_pred)
    prec_macro = precision_score(y_true, y_pred, average="macro", zero_division=0)
    rec_macro = recall_score(y_true, y_pred, average="macro", zero_division=0)
    f1_mac = f1_score(y_true, y_pred, average="macro", zero_division=0)

    prec_weighted = precision_score(y_true, y_pred, average="weighted", zero_division=0)
    rec_weighted = recall_score(y_true, y_pred, average="weighted", zero_division=0)
    f1_weight = f1_score(y_true, y_pred, average="weighted", zero_division=0)

    cm = confusion_matrix(y_true, y_pred, labels=[0, 1, 2])
    
    # Class-wise metrics
    class_metrics = {}
    for code, label in CLASS_LABELS.items():
        y_true_binary = (y_true == code).astype(int)
        y_pred_binary = (y_pred == code).astype(int)
        class_metrics[label] = {
            "precision": float(round(precision_score(y_true_binary, y_pred_binary, zero_division=0), 4)),
            "recall": float(round(recall_score(y_true_binary, y_pred_binary, zero_division=0), 4)),
            "f1": float(round(f1_score(y_true_binary, y_pred_binary, zero_division=0), 4)),
            "support": int(np.sum(y_true == code)),
        }

    return {
        "accuracy": float(round(acc, 4)),
        "precision_macro": float(round(prec_macro, 4)),
        "recall_macro": float(round(rec_macro, 4)),
        "f1_macro": float(round(f1_mac, 4)),
        "precision_weighted": float(round(prec_weighted, 4)),
        "recall_weighted": float(round(rec_weighted, 4)),
        "f1_weighted": float(round(f1_weight, 4)),
        "confusion_matrix": {
            "labels": ["Low", "Medium", "High"],
            "matrix": cm.tolist(),
        },
        "class_metrics": class_metrics,
    }


def train_and_evaluate(
    split_strategy: str = "stratified",
    test_size: float = 0.2,
    random_state: int = 42,
    rf_params: Dict[str, Any] = None,
    xgb_params: Dict[str, Any] = None,
) -> Dict[str, Any]:
    print("Initializing DisasterDatasetLoader...", flush=True)
    loader = DisasterDatasetLoader()
    X_train, X_test, y_train, y_test = loader.get_split(
        strategy=split_strategy, test_size=test_size, random_state=random_state
    )

    print(f"Data split ({split_strategy}): Train={len(X_train)} samples, Test={len(X_test)} samples", flush=True)
    print(f"Train class distribution: {dict(y_train.value_counts())}", flush=True)
    print(f"Test class distribution:  {dict(y_test.value_counts())}", flush=True)

    # Configurable parameters
    default_rf_params = {
        "n_estimators": 100,
        "max_depth": 8,
        "min_samples_split": 3,
        "min_samples_leaf": 1,
        "class_weight": "balanced",
        "random_state": random_state,
        "n_jobs": 1,
    }
    if rf_params:
        default_rf_params.update(rf_params)

    default_xgb_params = {
        "n_estimators": 100,
        "max_depth": 5,
        "learning_rate": 0.08,
        "subsample": 0.85,
        "colsample_bytree": 0.85,
        "objective": "multi:softprob",
        "num_class": 3,
        "eval_metric": "mlogloss",
        "random_state": random_state,
        "n_jobs": 1,
    }
    if xgb_params:
        default_xgb_params.update(xgb_params)

    # 1. Train Random Forest
    print("\n--- Training RandomForestClassifier ---", flush=True)
    rf_model = RandomForestClassifier(**default_rf_params)
    rf_model.fit(X_train, y_train)
    print("RandomForestClassifier fit completed.", flush=True)

    rf_train_preds = rf_model.predict(X_train)
    rf_test_preds = rf_model.predict(X_test)
    rf_test_probs = rf_model.predict_proba(X_test)

    rf_metrics = calculate_metrics(y_test, rf_test_preds, rf_test_probs)
    rf_importance = {
        FEATURE_COLUMNS[i]: float(round(rf_model.feature_importances_[i], 4))
        for i in range(len(FEATURE_COLUMNS))
    }
    rf_importance = dict(sorted(rf_importance.items(), key=lambda item: item[1], reverse=True))

    # 2. Train XGBoost
    print("\n--- Training XGBClassifier ---", flush=True)
    xgb_model = XGBClassifier(**default_xgb_params)
    xgb_model.fit(X_train, y_train)
    print("XGBClassifier fit completed.", flush=True)

    xgb_train_preds = xgb_model.predict(X_train)
    xgb_test_preds = xgb_model.predict(X_test)
    xgb_test_probs = xgb_model.predict_proba(X_test)

    xgb_metrics = calculate_metrics(y_test, xgb_test_preds, xgb_test_probs)
    xgb_importance = {
        FEATURE_COLUMNS[i]: float(round(xgb_model.feature_importances_[i], 4))
        for i in range(len(FEATURE_COLUMNS))
    }
    xgb_importance = dict(sorted(xgb_importance.items(), key=lambda item: item[1], reverse=True))

    # 3. Model Comparison and Selection
    rf_score = rf_metrics["f1_macro"]
    xgb_score = xgb_metrics["f1_macro"]

    if xgb_score > rf_score:
        preferred = "XGBoost"
        preferred_rationale = (
            f"XGBoost achieved higher validation Macro F1 ({xgb_score:.4f} vs {rf_score:.4f} for RF) "
            f"with superior gradient-boosted decision boundaries on non-linear hazard interactions."
        )
    elif rf_score > xgb_score:
        preferred = "Random Forest"
        preferred_rationale = (
            f"Random Forest achieved higher validation Macro F1 ({rf_score:.4f} vs {xgb_score:.4f} for XGBoost) "
            f"with balanced bagging resilience against extreme class imbalance."
        )
    else:
        rf_high_recall = rf_metrics["class_metrics"]["High"]["recall"]
        xgb_high_recall = xgb_metrics["class_metrics"]["High"]["recall"]
        if xgb_high_recall >= rf_high_recall:
            preferred = "XGBoost"
            preferred_rationale = f"Tied Macro F1; XGBoost chosen for high-risk sensitivity ({xgb_high_recall:.4f})."
        else:
            preferred = "Random Forest"
            preferred_rationale = f"Tied Macro F1; Random Forest chosen for high-risk sensitivity ({rf_high_recall:.4f})."

    # Save models
    os.makedirs(ARTIFACTS_DIR, exist_ok=True)
    rf_path = os.path.join(ARTIFACTS_DIR, "rf_model.joblib")
    xgb_path = os.path.join(ARTIFACTS_DIR, "xgb_model.joblib")

    joblib.dump(rf_model, rf_path)
    joblib.dump(xgb_model, xgb_path)
    print("Model artifacts saved to joblib.", flush=True)

    comparison_report = {
        "dataset": "Documented Historical Disaster Weather Dataset (ECMWF ERA5 / Open-Meteo Archive)",
        "split_strategy": split_strategy,
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "features": FEATURE_COLUMNS,
        "models": {
            "Random Forest": {
                "parameters": {k: str(v) for k, v in default_rf_params.items()},
                "metrics": rf_metrics,
                "feature_importance": rf_importance,
                "model_artifact": "rf_model.joblib",
            },
            "XGBoost": {
                "parameters": {k: str(v) for k, v in default_xgb_params.items()},
                "metrics": xgb_metrics,
                "feature_importance": xgb_importance,
                "model_artifact": "xgb_model.joblib",
            },
        },
        "preferred_model": preferred,
        "selection_rationale": preferred_rationale,
    }

    comparison_file = os.path.join(ARTIFACTS_DIR, "model_comparison.json")
    with open(comparison_file, "w", encoding="utf-8") as f:
        json.dump(comparison_report, f, indent=2)

    metadata = {
        "status": "trained",
        "preferred_model": preferred,
        "feature_names": FEATURE_COLUMNS,
        "class_labels": CLASS_LABELS,
        "models_available": ["Random Forest", "XGBoost"],
        "artifacts": {
            "random_forest": "rf_model.joblib",
            "xgboost": "xgb_model.joblib",
            "comparison": "model_comparison.json",
            "dataset_summary": "dataset_summary.json",
        },
    }
    with open(os.path.join(ARTIFACTS_DIR, "model_metadata.json"), "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print("\n=== Model Evaluation Complete ===", flush=True)
    print(f"Random Forest - Macro F1: {rf_metrics['f1_macro']:.4f}, Accuracy: {rf_metrics['accuracy']:.4f}", flush=True)
    print(f"XGBoost       - Macro F1: {xgb_metrics['f1_macro']:.4f}, Accuracy: {xgb_metrics['accuracy']:.4f}", flush=True)
    print(f"Preferred Model: {preferred}", flush=True)
    print(f"Rationale: {preferred_rationale}", flush=True)

    return comparison_report


if __name__ == "__main__":
    train_and_evaluate()
