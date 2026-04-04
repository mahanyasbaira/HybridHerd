import pandas as pd
import numpy as np
import logging
from typing import Optional, Tuple
import os

logger = logging.getLogger(__name__)


class FeatureEngineer:
    """Feature engineering for BRD detection."""

    def __init__(self, db_url: Optional[str] = None) -> None:
        """
        Initialize feature engineer with optional database connection.

        Args:
            db_url: PostgreSQL connection URL
        """
        self.db_url = db_url or os.getenv("DATABASE_URL")
        self.db_connection = None

        if self.db_url:
            try:
                import psycopg2

                self.db_connection = psycopg2.connect(self.db_url)
                logger.info("Connected to database")
            except Exception as e:
                logger.warning(f"Could not connect to database: {e}")
                self.db_connection = None

    def build_features_from_simulated(
        self, n_animals: int = 20, seed: int = 42
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Generate realistic synthetic dataset for model training.

        Simulates 5 sensor metrics with health/sick variation:
        - Nose ring: temperature_c, respiratory_rate
        - Collar: chew_frequency, cough_count
        - Ear tag: behavior_index

        Args:
            n_animals: Number of animals to simulate
            seed: Random seed for reproducibility

        Returns:
            Tuple of (X: feature DataFrame, y: label Series with 0/1/2)
            - 0: Low (healthy)
            - 1: Medium (early BRD signs)
            - 2: High (clear BRD signs)
        """
        np.random.seed(seed)

        rows = []

        for animal_id in range(1, n_animals + 1):
            for day in range(1, 91):  # 90 days
                # 15% of animal-days are sick
                is_sick = np.random.random() < 0.15

                if is_sick:
                    # Sick ranges
                    temperature_c = np.random.uniform(39.5, 41.0)
                    respiratory_rate = np.random.uniform(40, 80)
                    chew_frequency = np.random.uniform(20, 50)
                    cough_count = np.random.uniform(3, 15)
                    behavior_index = np.random.uniform(0.1, 0.4)
                else:
                    # Healthy ranges
                    temperature_c = np.random.uniform(38.0, 39.5)
                    respiratory_rate = np.random.uniform(20, 40)
                    chew_frequency = np.random.uniform(60, 90)
                    cough_count = np.random.uniform(0, 2)
                    behavior_index = np.random.uniform(0.6, 1.0)

                rows.append(
                    {
                        "animal_id": animal_id,
                        "day": day,
                        "temperature_c": temperature_c,
                        "respiratory_rate": respiratory_rate,
                        "chew_frequency": chew_frequency,
                        "cough_count": cough_count,
                        "behavior_index": behavior_index,
                    }
                )

        df = pd.DataFrame(rows)

        # Compute 24h and 72h rolling means
        for animal_id in df["animal_id"].unique():
            mask = df["animal_id"] == animal_id
            animal_df = df[mask].reset_index(drop=True)

            # 24h rolling (approx 1 day)
            for col in [
                "temperature_c",
                "respiratory_rate",
                "chew_frequency",
                "cough_count",
                "behavior_index",
            ]:
                df.loc[mask, f"{col}_24h_mean"] = (
                    animal_df[col].rolling(window=1, min_periods=1).mean().values
                )

            # 72h rolling (approx 3 days)
            for col in [
                "temperature_c",
                "respiratory_rate",
                "chew_frequency",
                "cough_count",
                "behavior_index",
            ]:
                df.loc[mask, f"{col}_72h_mean"] = (
                    animal_df[col].rolling(window=3, min_periods=1).mean().values
                )

        # Create labels based on metrics
        labels = []
        for idx, row in df.iterrows():
            elevated_count = 0

            if row["temperature_c"] > 39.5:
                elevated_count += 1
            if row["respiratory_rate"] > 40:
                elevated_count += 1
            if row["chew_frequency"] < 50:
                elevated_count += 1
            if row["cough_count"] > 2:
                elevated_count += 1
            if row["behavior_index"] < 0.5:
                elevated_count += 1

            if elevated_count == 0:
                label = 0  # Low
            elif elevated_count <= 2:
                label = 1  # Medium
            else:
                label = 2  # High

            labels.append(label)

        df["label"] = labels

        # Feature matrix: raw + rolling features
        feature_cols = [
            "temperature_c",
            "respiratory_rate",
            "chew_frequency",
            "cough_count",
            "behavior_index",
            "temperature_c_24h_mean",
            "respiratory_rate_24h_mean",
            "chew_frequency_24h_mean",
            "cough_count_24h_mean",
            "behavior_index_24h_mean",
            "temperature_c_72h_mean",
            "respiratory_rate_72h_mean",
            "chew_frequency_72h_mean",
            "cough_count_72h_mean",
            "behavior_index_72h_mean",
        ]

        X = df[feature_cols].copy()
        y = df["label"].copy()

        logger.info(
            f"Generated simulated features: {len(X)} samples, {len(feature_cols)} features"
        )
        logger.info(f"Label distribution: {y.value_counts().to_dict()}")

        return X, y

    def build_features_from_db(
        self, animal_id: int, lookback_hours: int = 72
    ) -> pd.DataFrame:
        """
        Query database for animal's recent sensor readings and compute features.

        Args:
            animal_id: Animal ID
            lookback_hours: How many hours of history to retrieve

        Returns:
            Single-row DataFrame with rolling features ready for inference
        """
        if not self.db_connection:
            raise RuntimeError("Database not configured")

        # This is a placeholder implementation
        # In production, would query actual sensor tables

        logger.warning(
            "build_features_from_db not fully implemented; returning placeholder"
        )

        # Return a minimal valid feature frame
        feature_cols = [
            "temperature_c",
            "respiratory_rate",
            "chew_frequency",
            "cough_count",
            "behavior_index",
            "temperature_c_24h_mean",
            "respiratory_rate_24h_mean",
            "chew_frequency_24h_mean",
            "cough_count_24h_mean",
            "behavior_index_24h_mean",
            "temperature_c_72h_mean",
            "respiratory_rate_72h_mean",
            "chew_frequency_72h_mean",
            "cough_count_72h_mean",
            "behavior_index_72h_mean",
        ]

        # Return zeros (should be replaced with actual data)
        return pd.DataFrame(
            {col: [0.0] for col in feature_cols},
        )

    def __del__(self) -> None:
        """Close database connection."""
        if self.db_connection:
            try:
                self.db_connection.close()
            except Exception:
                pass
