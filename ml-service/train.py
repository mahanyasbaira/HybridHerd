#!/usr/bin/env python3
"""Training script for BRD classifier."""

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
    X, y = fe.build_features_from_simulated()

    clf = BRDClassifier()
    clf.train(X, y)

    logger.info("Model saved to weights/brd_model.joblib")
