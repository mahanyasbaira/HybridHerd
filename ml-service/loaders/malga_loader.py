import pandas as pd
import numpy as np
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class MalgaLoader:
    """Loader for Malga Juribello dataset (or synthetic baseline if unavailable)."""

    def __init__(self, data_path: Optional[str] = None) -> None:
        """
        Initialize loader with optional data path.

        Args:
            data_path: Path to Malga CSV file (if available)
        """
        self.data_path = Path(data_path) if data_path else None
        self.baseline_df = None

        if self.data_path and self.data_path.exists():
            logger.info(f"Malga data file found: {self.data_path}")
        else:
            if data_path:
                logger.warning(f"Malga data file not found: {data_path}")
            logger.info("Will use synthetic baseline data")

    def generate_synthetic_baseline(
        self, n_cows: int = 16, n_days: int = 14
    ) -> pd.DataFrame:
        """
        Generate synthetic resting heart rate baseline data.

        Simulates realistic healthy and elevated heart rate patterns with THI correlation.

        Args:
            n_cows: Number of cows to simulate
            n_days: Number of days to simulate

        Returns:
            DataFrame with columns: cow_id, date, mean_hr_bpm, std_hr_bpm, mean_thi, is_elevated
        """
        np.random.seed(42)
        rows = []

        for cow_num in range(1, n_cows + 1):
            cow_id = f"C{cow_num:02d}"

            # Some cows have elevated HR tendency
            cow_elevation_bias = np.random.choice([0, 1], p=[0.8, 0.2])

            for day in range(n_days):
                date = pd.Timestamp("2023-07-21") + pd.Timedelta(days=day)

                # Simulate THI (higher in later days, 50-85 range)
                mean_thi = 50 + (day / n_days) * 30 + np.random.normal(0, 5)
                mean_thi = np.clip(mean_thi, 50, 85)

                # Base HR depends on cow's baseline
                if cow_elevation_bias:
                    base_hr = np.random.uniform(85, 100)
                else:
                    base_hr = np.random.uniform(60, 80)

                # THI influence: higher THI increases HR
                thi_influence = (mean_thi - 50) * 0.3
                mean_hr_bpm = base_hr + thi_influence + np.random.normal(0, 3)
                mean_hr_bpm = np.clip(mean_hr_bpm, 40, 120)

                std_hr_bpm = np.random.uniform(3, 8)

                is_elevated = 1 if mean_hr_bpm > 85 else 0

                rows.append(
                    {
                        "cow_id": cow_id,
                        "date": date.date(),
                        "mean_hr_bpm": mean_hr_bpm,
                        "std_hr_bpm": std_hr_bpm,
                        "mean_thi": mean_thi,
                        "is_elevated": is_elevated,
                    }
                )

        result = pd.DataFrame(rows)
        logger.info(
            f"Generated synthetic baseline: {len(result)} rows ({n_cows} cows, {n_days} days)"
        )
        return result

    def load(self) -> pd.DataFrame:
        """
        Load Malga data from file or return synthetic baseline.

        Returns:
            DataFrame with heart rate baseline data
        """
        if self.data_path and self.data_path.exists():
            try:
                df = pd.read_csv(self.data_path)
                logger.info(f"Loaded Malga data from {self.data_path}: {len(df)} rows")
                self.baseline_df = df
                return df
            except Exception as e:
                logger.warning(f"Error loading Malga data: {e}. Using synthetic baseline.")

        # Use synthetic baseline
        if self.baseline_df is None:
            self.baseline_df = self.generate_synthetic_baseline()

        return self.baseline_df
