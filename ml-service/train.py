#!/usr/bin/env python3
"""Training script for BRD classifier.

Attempts to train on real MmCows dataset (CBT + ankle activity).
Falls back to synthetic data if the dataset is not available.
"""

import pathlib
import logging
from models.feature_engineer import FeatureEngineer
from models.brd_classifier import BRDClassifier

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


if __name__ == "__main__":
    logger.info("Starting BRD model training...")

    pathlib.Path("weights").mkdir(exist_ok=True)

    fe = FeatureEngineer()

    # Try real dataset first, fall back to synthetic
    try:
        X, y = fe.build_features_from_mmcows()
        # Supplement with synthetic to ensure class balance and coverage
        X_synth, y_synth = fe.build_features_from_simulated(n_animals=10, seed=99)
        import pandas as pd
        X = pd.concat([X, X_synth], ignore_index=True)
        y = pd.concat([y, y_synth], ignore_index=True)
        logger.info(f"Combined training set: {len(X)} samples (real + synthetic supplement)")
    except Exception as e:
        logger.warning(f"Could not load real data ({e}), using synthetic only")
        X, y = fe.build_features_from_simulated()

    clf = BRDClassifier()
    clf.train(X, y)

    logger.info("Model saved to weights/brd_model.joblib")
