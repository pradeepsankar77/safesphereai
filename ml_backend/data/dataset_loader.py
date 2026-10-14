"""
dataset_loader.py
-----------------
Configurable data-loading and preprocessing module for SafeSphere AI.
Inspects data quality, missing values, duplicates, class distributions,
and provides leak-free train/validation splits (chronological or stratified).
"""

import json
import os
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedShuffleSplit, train_test_split

DEFAULT_DATASET_PATH = os.path.join(
    os.path.dirname(__file__), "historical_disaster_weather.csv"
)
ARTIFACTS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "artifacts")
)

FEATURE_COLUMNS = [
    "precipitation_sum",
    "wind_gusts_10m_max",
    "wind_speed_10m_max",
    "surface_pressure_mean",
    "relative_humidity_2m_mean",
    "temperature_mean",
    "temperature_2m_max",
    "temperature_2m_min",
    "latitude",
    "longitude",
]

TARGET_COLUMN = "risk_level"

CLASS_LABELS = {
    0: "Low",
    1: "Medium",
    2: "High"
}


class DisasterDatasetLoader:
    def __init__(self, csv_path: str = DEFAULT_DATASET_PATH):
        self.csv_path = csv_path
        self.df: Optional[pd.DataFrame] = None
        self.quality_report: Dict[str, Any] = {}

    def load_data(self) -> pd.DataFrame:
        if not os.path.exists(self.csv_path):
            raise FileNotFoundError(
                f"Dataset file not found at {self.csv_path}. Run fetch_historical_dataset.py first."
            )
        
        self.df = pd.read_csv(self.csv_path)
        self.inspect_data_quality()
        return self.df

    def inspect_data_quality(self) -> Dict[str, Any]:
        if self.df is None:
            raise ValueError("Data has not been loaded. Call load_data() first.")

        total_rows = len(self.df)
        missing_counts = self.df.isnull().sum().to_dict()
        duplicate_rows = int(self.df.duplicated().sum())

        class_counts = self.df[TARGET_COLUMN].value_counts().to_dict()
        class_distribution = {
            CLASS_LABELS.get(int(k), str(k)): {
                "count": int(v),
                "percentage": round((int(v) / total_rows) * 100, 2)
            }
            for k, v in class_counts.items()
        }

        feature_stats = {}
        for col in FEATURE_COLUMNS:
            if col in self.df.columns:
                feature_stats[col] = {
                    "min": float(self.df[col].min()),
                    "max": float(self.df[col].max()),
                    "mean": float(round(self.df[col].mean(), 2)),
                    "std": float(round(self.df[col].std(), 2)),
                    "missing": int(self.df[col].isnull().sum())
                }

        unique_events = self.df["event_name"].unique().tolist() if "event_name" in self.df.columns else []

        self.quality_report = {
            "dataset_path": self.csv_path,
            "total_records": total_rows,
            "total_features": len(FEATURE_COLUMNS),
            "feature_names": FEATURE_COLUMNS,
            "target_column": TARGET_COLUMN,
            "class_distribution": class_distribution,
            "imbalance_ratio": {
                "majority_to_minority": round(
                    max(class_counts.values()) / max(1, min(class_counts.values())), 2
                )
            },
            "duplicate_records": duplicate_rows,
            "missing_values": missing_counts,
            "feature_statistics": feature_stats,
            "documented_events_count": len(unique_events),
            "documented_events": unique_events,
            "source": "ECMWF ERA5 Reanalysis via Open-Meteo Historical Archive"
        }

        # Save quality report artifact
        os.makedirs(ARTIFACTS_DIR, exist_ok=True)
        summary_path = os.path.join(ARTIFACTS_DIR, "dataset_summary.json")
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(self.quality_report, f, indent=2)

        return self.quality_report

    def get_features_and_target(self) -> Tuple[pd.DataFrame, pd.Series]:
        if self.df is None:
            self.load_data()
        
        # Verify required columns exist
        missing_cols = [c for c in FEATURE_COLUMNS if c not in self.df.columns]
        if missing_cols:
            raise KeyError(f"Dataset missing required feature columns: {missing_cols}")
        if TARGET_COLUMN not in self.df.columns:
            raise KeyError(f"Dataset missing target column: {TARGET_COLUMN}")

        X = self.df[FEATURE_COLUMNS].copy()
        y = self.df[TARGET_COLUMN].copy()
        return X, y

    def get_split(
        self,
        strategy: str = "stratified",
        test_size: float = 0.2,
        random_state: int = 42
    ) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
        """
        Splits data into train and test sets.
        - 'stratified': preserves class proportions while avoiding data leakage.
        - 'chronological': splits on sorted date to assess out-of-time generalization.
        """
        if self.df is None:
            self.load_data()

        if strategy == "chronological":
            if "date" not in self.df.columns:
                raise ValueError("Chronological split requires 'date' column.")
            df_sorted = self.df.sort_values("date").reset_index(drop=True)
            split_idx = int(len(df_sorted) * (1 - test_size))
            train_df = df_sorted.iloc[:split_idx]
            test_df = df_sorted.iloc[split_idx:]
            
            X_train = train_df[FEATURE_COLUMNS]
            y_train = train_df[TARGET_COLUMN]
            X_test = test_df[FEATURE_COLUMNS]
            y_test = test_df[TARGET_COLUMN]
            return X_train, X_test, y_train, y_test
        else:
            X, y = self.get_features_and_target()
            sss = StratifiedShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
            train_idx, test_idx = next(sss.split(X, y))
            return X.iloc[train_idx], X.iloc[test_idx], y.iloc[train_idx], y.iloc[test_idx]


if __name__ == "__main__":
    loader = DisasterDatasetLoader()
    df = loader.load_data()
    print("Dataset loaded successfully.")
    print(f"Total rows: {len(df)}")
    print(json.dumps(loader.quality_report["class_distribution"], indent=2))
