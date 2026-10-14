"""
test_data_loader.py
-------------------
Unit tests for DisasterDatasetLoader.
"""

import os
import pytest
import pandas as pd
from ml_backend.data.dataset_loader import (
    DisasterDatasetLoader,
    FEATURE_COLUMNS,
    TARGET_COLUMN,
    CLASS_LABELS,
)


def test_dataset_loader_reads_file():
    loader = DisasterDatasetLoader()
    df = loader.load_data()
    assert isinstance(df, pd.DataFrame)
    assert len(df) > 50, "Dataset should contain historical records"


def test_dataset_schema():
    loader = DisasterDatasetLoader()
    df = loader.load_data()

    for col in FEATURE_COLUMNS:
        assert col in df.columns, f"Feature column '{col}' missing from dataset"

    assert TARGET_COLUMN in df.columns, f"Target column '{TARGET_COLUMN}' missing from dataset"


def test_no_missing_values_in_features():
    loader = DisasterDatasetLoader()
    df = loader.load_data()
    for col in FEATURE_COLUMNS:
        missing_count = df[col].isnull().sum()
        assert missing_count == 0, f"Found {missing_count} missing values in '{col}'"


def test_target_classes_valid():
    loader = DisasterDatasetLoader()
    df = loader.load_data()
    unique_classes = set(df[TARGET_COLUMN].unique())
    assert unique_classes.issubset({0, 1, 2}), f"Unexpected target classes: {unique_classes}"


def test_stratified_split_integrity():
    loader = DisasterDatasetLoader()
    X_train, X_test, y_train, y_test = loader.get_split(strategy="stratified", test_size=0.2)
    assert len(X_train) + len(X_test) == len(loader.df)
    assert set(y_train.unique()) == {0, 1, 2}
    assert set(y_test.unique()) == {0, 1, 2}
