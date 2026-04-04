import pandas as pd
import numpy as np
import logging
import joblib
from pathlib import Path
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import classification_report, confusion_matrix
from typing import Dict, Any

from .feature_engineer import FeatureEngineer

logger = logging.getLogger(__name__)


class BRDClassifier:
    """BRD classifier using HistGradientBoosting."""

    def __init__(self, model_path: str = "weights/brd_model.joblib") -> None:
        """
        Initialize classifier with model path.

        Args:
            model_path: Path to save/load model
        """
        self.model_path = Path(model_path)
        self.model = None
        self.classes = {0: "Low", 1: "Medium", 2: "High"}

    def train(self, X: pd.DataFrame, y: pd.Series) -> None:
        """
        Train HistGradientBoosting model.

        Args:
            X: Feature matrix
            y: Label series (0, 1, or 2)
        """
        logger.info(f"Training model on {len(X)} samples")

        self.model = HistGradientBoostingClassifier(
            random_state=42,
            max_iter=200,
            learning_rate=0.1,
            max_depth=7,
        )

        self.model.fit(X, y)

        # Print classification report
        y_pred = self.model.predict(X)
        logger.info("\n" + classification_report(y, y_pred, zero_division=0))
        logger.info(
            "\nConfusion Matrix:\n" + str(confusion_matrix(y, y_pred))
        )

        # Save model
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        joblib.dump(self.model, self.model_path)
        logger.info(f"Model saved to {self.model_path}")

    def load(self) -> None:
        """Load model from disk."""
        if not self.model_path.exists():
            logger.warning(f"Model file not found: {self.model_path}")
            return

        try:
            self.model = joblib.load(self.model_path)
            logger.info(f"Model loaded from {self.model_path}")
        except Exception as e:
            logger.error(f"Error loading model: {e}")

    def predict(self, X: pd.DataFrame) -> Dict[str, Any]:
        """
        Run inference on feature matrix.

        Args:
            X: Feature matrix (single or multiple rows)

        Returns:
            Dictionary with risk_level and probabilities
        """
        if self.model is None:
            raise RuntimeError("Model not loaded. Call load() or train() first.")

        predictions = self.model.predict(X)
        probabilities = self.model.predict_proba(X)

        # Return first sample's prediction (typical use: single row)
        risk_idx = predictions[0]
        risk_level = self.classes[risk_idx]

        prob_dict = {
            self.classes[i]: float(probabilities[0][i])
            for i in range(len(self.classes))
        }

        return {
            "risk_level": risk_level,
            "probabilities": prob_dict,
        }

    @classmethod
    def train_and_save(cls, model_path: str = "weights/brd_model.joblib") -> "BRDClassifier":
        """
        Convenience classmethod: instantiate, train, and save.

        Args:
            model_path: Path to save model

        Returns:
            Trained classifier instance
        """
        fe = FeatureEngineer()
        X, y = fe.build_features_from_simulated()

        clf = cls(model_path=model_path)
        clf.train(X, y)

        return clf
