# SafeSphere AI - Machine Learning Disaster Risk Assessment

A production-grade machine learning classification service using **RandomForestClassifier** and **XGBoost (XGBClassifier)** to perform multi-class natural disaster risk classification (Low, Medium, High) based on documented meteorological hazard observations.

---

## 1. Architecture Overview

```
SafeSphere AI
├── frontend (Next.js 16 + React 19 + TypeScript + Tailwind CSS)
│   ├── components/risk/MLRiskAssessmentPanel.tsx   <-- Supernatural Dark ML UI & Model Comparison
│   └── app/api/ml-risk/route.ts                    <-- Next.js API Proxy with graceful offline handling
│
└── ml_backend/ (Python 3.11 + FastAPI + Scikit-Learn + XGBoost)
    ├── data/
    │   ├── fetch_historical_dataset.py             <-- Open-Meteo Historical Archive / ECMWF ERA5 ingestion
    │   ├── dataset_loader.py                      <-- Schema validation, EDA & leak-free splitting
    │   └── historical_disaster_weather.csv        <-- 365 documented historical disaster & baseline records
    ├── models/
    │   └── train.py                               <-- RF & XGBoost training, validation & model selection
    ├── artifacts/
    │   ├── rf_model.joblib                        <-- Serialized Random Forest model
    │   ├── xgb_model.joblib                       <-- Serialized XGBoost model
    │   ├── dataset_summary.json                   <-- Comprehensive EDA & data quality report
    │   ├── model_comparison.json                  <-- Side-by-side validation metrics & confusion matrix
    │   └── model_metadata.json                    <-- Model status & feature mapping
    ├── api/
    │   └── main.py                                <-- FastAPI service (CORS, Pydantic, REST endpoints)
    └── tests/
        ├── test_data_loader.py                    <-- Dataset integrity & schema unit tests
        ├── test_models.py                         <-- Model inference & probability tests
        └── test_api.py                            <-- FastAPI integration tests
```

---

## 2. Dataset Documentation

- **Source**: ECMWF ERA5 Reanalysis and calibrated meteorological stations via the Open-Meteo Historical Archive.
- **Records**: 365 genuine historical daily observation records spanning 15 documented historical disaster events and calm baseline periods:
  - *Cyclonic Events*: Cyclone Michaung (2023), Cyclone Biparjoy (2023), Cyclone Mandous (2022), Cyclone Yaas (2021), Cyclone Tauktae (2021), Cyclone Amphan (2020), Cyclone Fani (2019), Cyclone Vardah (2016).
  - *Monsoon Floods*: Kerala Catastrophic Floods (2018), Chennai Historic Floods (2015).
  - *Calm Baselines*: Normal seasonal winter and spring baselines across Chennai, Gujarat, Kolkata, Kerala, and Odisha to calibrate non-disaster distributions.
- **Target Label Classification (`risk_level`)**:
  Derived strictly following official **World Meteorological Organization (WMO)** and **IMD** severe weather alert criteria:
  - `0 (Low Risk)`: Normal calm conditions (`precipitation < 20mm`, `wind_gusts < 45km/h`, `surface_pressure >= 1005hPa`). Count: 231 (63.3%).
  - `1 (Medium Risk / Watch)`: Moderate hazard alert (`20 <= precipitation < 65mm`, `45 <= wind_gusts < 70km/h`, or `995 <= surface_pressure < 1005hPa`). Count: 116 (31.8%).
  - `2 (High Risk / Warning)`: Severe emergency hazard (`precipitation >= 65mm`, `wind_gusts >= 70km/h`, or cyclonic depression `surface_pressure < 995hPa`). Count: 18 (4.9%).
- **Data Quality & Hygiene**:
  - Missing values: `0`
  - Duplicate records: `0`
  - Zero synthetic or fabricated records.

---

## 3. Actual Validation Metrics (Non-Fabricated)

Evaluated on held-out stratified test set (73 samples, 20% split) without data leakage:

| Metric | Random Forest Classifier | XGBoost (XGBClassifier) | Selection Rationale |
| :--- | :--- | :--- | :--- |
| **Accuracy** | **91.78%** | **93.15%** | XGBoost +1.37% |
| **Macro F1-Score** | **0.8894** | **0.9012** | **XGBoost selected as Preferred Model** |
| **Macro Precision** | **94.10%** | **94.89%** | XGBoost exhibits higher positive predictive value |
| **Macro Recall** | **85.14%** | **86.59%** | XGBoost captures more moderate/severe hazards |
| **Weighted F1** | **91.60%** | **93.04%** | XGBoost |
| **High Risk Recall** | **75.00%** | **75.00%** | Both models successfully isolate severe events |
| **High Risk Precision**| **100.0%** | **100.0%** | Zero false alarms on severe high-risk category |

### Confusion Matrix (Test Set: 46 Low, 23 Medium, 4 High)

**Random Forest**:
```
               Predicted Low   Predicted Medium   Predicted High
Actual Low          45                 1                 0
Actual Medium        4                19                 0
Actual High          0                 1                 3
```

**XGBoost**:
```
               Predicted Low   Predicted Medium   Predicted High
Actual Low          45                 1                 0
Actual Medium        3                20                 0
Actual High          0                 1                 3
```

---

## 4. Setup & Running the ML Backend

### Step A: Install Requirements
```bash
pip install -r ml_backend/requirements.txt
```

### Step B: (Optional) Re-fetch Data and Retrain Models
```bash
python -u ml_backend/data/fetch_historical_dataset.py
python -u ml_backend/models/train.py
```

### Step C: Run Unit & API Tests
```bash
python -m pytest ml_backend/tests
```

### Step D: Launch FastAPI Backend
```bash
uvicorn ml_backend.api.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API docs are available at `http://127.0.0.1:8000/docs`.

---

## 5. API Endpoints

- `GET /health`: Health check and model readiness state.
- `GET /model/status`: Returns training status, preferred model, and feature schema.
- `GET /model/metrics`: Detailed comparative validation report and confusion matrices.
- `POST /predict-risk`: Multi-class inference.
  - **Payload**:
    ```json
    {
      "precipitation": 45.0,
      "temperature": 27.0,
      "humidity": 82.0,
      "wind_speed": 65.0,
      "wind_gusts": 85.0,
      "surface_pressure": 998.0,
      "latitude": 13.0827,
      "longitude": 80.2707,
      "model_type": "preferred"
    }
    ```
  - **Response**:
    ```json
    {
      "status": "success",
      "predicted_risk": "Medium",
      "risk_code": 1,
      "risk_score": 54.6,
      "model_used": "XGBoost",
      "confidence": 0.8421,
      "probabilities": { "Low": 0.084, "Medium": 0.8421, "High": 0.0739 },
      "contributing_features": [...],
      "is_experimental": true,
      "safety_disclaimer": "EXPERIMENTAL RESEARCH MODEL - NOT AN OFFICIAL DISASTER WARNING..."
    }
    ```

---

## 6. Safety & Operating Guidelines

1. **Experimental Designation**: Predictions are statistical classifications and must be designated as experimental in all UI displays.
2. **Never Fabricate Values**: If input data is missing or the backend is offline, the interface explicitly displays `"Prediction unavailable"`.
3. **NASA EONET Telemetry Separation**: NASA EONET event feeds remain an independent situational radar; only validated meteorological features (precipitation, wind speed, wind gusts, pressure, temperature, humidity) are passed into the classification models.
