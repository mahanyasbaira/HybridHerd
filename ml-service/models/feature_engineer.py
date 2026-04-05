import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Optional, Tuple
import os

logger = logging.getLogger(__name__)

DATASETS_DEFAULT = Path(__file__).resolve().parents[2] / "Datasets" / "sensor_data"


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

    def build_features_from_mmcows(
        self, sensor_data_dir: Optional[str] = None, seed: int = 42
    ) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Build training features using real MmCows CBT + ankle activity data.

        Temperature features come from real sensor readings. Respiratory rate,
        chew frequency, and cough count are synthetically generated correlated
        with the temperature readings since MmCows does not include those sensors.
        Behavior index is derived from ankle lying-fraction.

        Args:
            sensor_data_dir: Path to sensor_data/ directory. Defaults to ../../Datasets/sensor_data.
            seed: Random seed.

        Returns:
            Tuple of (X: feature DataFrame, y: label Series 0/1/2)
        """
        np.random.seed(seed)

        data_dir = Path(sensor_data_dir) if sensor_data_dir else DATASETS_DEFAULT
        cbt_dir = data_dir / "main_data" / "cbt"
        ankle_base = data_dir / "main_data" / "ankle"

        if not cbt_dir.exists():
            logger.warning(f"CBT directory not found at {cbt_dir}, falling back to simulated data")
            return self.build_features_from_simulated(seed=seed)

        # --- Load CBT data ---
        cbt_frames = []
        for csv_file in sorted(cbt_dir.glob("C*.csv")):
            try:
                df = pd.read_csv(csv_file)
                df["cow_id"] = csv_file.stem
                df["recorded_at"] = pd.to_datetime(df["timestamp"], unit="s")
                df = df.rename(columns={"temperature_C": "temperature_c"})
                cbt_frames.append(df[["cow_id", "recorded_at", "temperature_c"]])
            except Exception as e:
                logger.warning(f"Could not load {csv_file}: {e}")

        if not cbt_frames:
            logger.warning("No CBT files loaded, falling back to simulated data")
            return self.build_features_from_simulated(seed=seed)

        cbt_df = pd.concat(cbt_frames, ignore_index=True)
        cbt_df["date"] = cbt_df["recorded_at"].dt.date

        # Daily mean temperature per cow
        daily_temp = (
            cbt_df.groupby(["cow_id", "date"])["temperature_c"]
            .mean()
            .reset_index()
            .rename(columns={"temperature_c": "temperature_c"})
        )

        # --- Load ankle lying data for behavior_index ---
        lying_rows = []
        for cow_dir in sorted(ankle_base.iterdir()) if ankle_base.exists() else []:
            cow_id = cow_dir.name
            for csv_file in sorted(cow_dir.glob("*.csv")):
                try:
                    df = pd.read_csv(csv_file)
                    if "lying" not in df.columns:
                        continue
                    df["recorded_at"] = pd.to_datetime(df["timestamp"], unit="s")
                    df["date"] = df["recorded_at"].dt.date
                    daily = (
                        df.groupby("date")["lying"]
                        .mean()
                        .reset_index()
                        .rename(columns={"lying": "lying_fraction"})
                    )
                    daily["cow_id"] = cow_id
                    lying_rows.append(daily)
                except Exception as e:
                    logger.warning(f"Could not load ankle {csv_file}: {e}")

        if lying_rows:
            lying_df = pd.concat(lying_rows, ignore_index=True)
            daily_temp = daily_temp.merge(lying_df, on=["cow_id", "date"], how="left")
        else:
            daily_temp["lying_fraction"] = np.nan

        # Derive behavior_index from lying fraction (0=always lying=sick, 1=never lying=healthy)
        # Healthy cows: lying fraction ~0.3-0.5; sick cows lie more (~0.6-0.8)
        # Invert: behavior_index = 1 - normalized(lying_fraction)
        daily_temp["lying_fraction"] = daily_temp["lying_fraction"].fillna(0.4)
        daily_temp["behavior_index"] = (1.0 - daily_temp["lying_fraction"]).clip(0.1, 0.95)

        # --- Generate synthetic companion features correlated with temperature ---
        rows = []
        for _, row in daily_temp.iterrows():
            temp = row["temperature_c"]
            behavior = row["behavior_index"]
            is_elevated = temp > 39.5

            if is_elevated:
                respiratory_rate = np.random.normal(52, 8)
                chew_frequency = np.random.normal(35, 8)
                cough_count = max(0, np.random.normal(6, 3))
            else:
                respiratory_rate = np.random.normal(28, 5)
                chew_frequency = np.random.normal(70, 10)
                cough_count = max(0, np.random.normal(0.8, 0.6))

            rows.append({
                "animal_id": row["cow_id"],
                "day": str(row["date"]),
                "temperature_c": float(temp),
                "respiratory_rate": float(np.clip(respiratory_rate, 10, 90)),
                "chew_frequency": float(np.clip(chew_frequency, 10, 100)),
                "cough_count": float(np.clip(cough_count, 0, 20)),
                "behavior_index": float(behavior),
            })

        if not rows:
            logger.warning("No real data rows built, falling back to simulated")
            return self.build_features_from_simulated(seed=seed)

        df = pd.DataFrame(rows)

        feature_base = ["temperature_c", "respiratory_rate", "chew_frequency", "cough_count", "behavior_index"]

        # Rolling means per animal (24h ~ 1 row, 72h ~ 3 rows at daily granularity)
        for animal_id in df["animal_id"].unique():
            mask = df["animal_id"] == animal_id
            animal_df = df[mask].reset_index(drop=True)
            for col in feature_base:
                df.loc[mask, f"{col}_24h_mean"] = animal_df[col].rolling(1, min_periods=1).mean().values
                df.loc[mask, f"{col}_72h_mean"] = animal_df[col].rolling(3, min_periods=1).mean().values

        # Labels from threshold counts
        labels = []
        for _, row in df.iterrows():
            n = sum([
                row["temperature_c"] > 39.5,
                row["respiratory_rate"] > 40,
                row["chew_frequency"] < 50,
                row["cough_count"] > 2,
                row["behavior_index"] < 0.5,
            ])
            labels.append(2 if n >= 3 else 1 if n >= 1 else 0)
        df["label"] = labels

        feature_cols = [
            "temperature_c", "respiratory_rate", "chew_frequency", "cough_count", "behavior_index",
            "temperature_c_24h_mean", "respiratory_rate_24h_mean", "chew_frequency_24h_mean",
            "cough_count_24h_mean", "behavior_index_24h_mean",
            "temperature_c_72h_mean", "respiratory_rate_72h_mean", "chew_frequency_72h_mean",
            "cough_count_72h_mean", "behavior_index_72h_mean",
        ]

        X = df[feature_cols].copy()
        y = df["label"].copy()

        logger.info(f"Built features from MmCows real data: {len(X)} samples ({len(df['animal_id'].unique())} cows)")
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
