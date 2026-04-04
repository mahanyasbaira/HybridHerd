import pandas as pd
import logging
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)


class MmCowsLoader:
    """Loader for MmCows sensor dataset."""

    def __init__(self, sensor_data_dir: str) -> None:
        """Initialize loader with sensor data directory path."""
        self.sensor_data_dir = Path(sensor_data_dir)
        logger.info(f"Initialized MmCowsLoader with {self.sensor_data_dir}")

    def load_cbt(self) -> pd.DataFrame:
        """
        Load core body temperature data from all CBT CSV files.

        Returns:
            DataFrame with columns: cow_id, recorded_at (datetime), temperature_c
        """
        cbt_dir = self.sensor_data_dir / "main_data" / "cbt"
        if not cbt_dir.exists():
            logger.warning(f"CBT directory not found: {cbt_dir}")
            return pd.DataFrame(
                columns=["cow_id", "recorded_at", "temperature_c"]
            )

        dfs = []
        for csv_file in sorted(cbt_dir.glob("C*.csv")):
            try:
                cow_id = csv_file.stem  # e.g., "C01" from "C01.csv"
                df = pd.read_csv(csv_file)

                if df.empty:
                    continue

                df["cow_id"] = cow_id
                df.rename(
                    columns={
                        "timestamp": "recorded_at",
                        "temperature_C": "temperature_c",
                    },
                    inplace=True,
                )

                # Convert unix timestamp to datetime
                df["recorded_at"] = pd.to_datetime(
                    df["recorded_at"], unit="s"
                )

                dfs.append(df[["cow_id", "recorded_at", "temperature_c"]])
            except Exception as e:
                logger.warning(f"Error loading {csv_file}: {e}")
                continue

        if not dfs:
            logger.warning("No CBT files loaded")
            return pd.DataFrame(
                columns=["cow_id", "recorded_at", "temperature_c"]
            )

        result = pd.concat(dfs, ignore_index=True)
        logger.info(f"Loaded CBT data: {len(result)} records from {len(dfs)} files")
        return result

    def load_thi(self) -> pd.DataFrame:
        """
        Load Temperature-Humidity Index (THI) data.

        Returns:
            DataFrame with columns: recorded_at (datetime), thi
        """
        thi_file = self.sensor_data_dir / "main_data" / "thi" / "average.csv"
        if not thi_file.exists():
            logger.warning(f"THI file not found: {thi_file}")
            return pd.DataFrame(columns=["recorded_at", "thi"])

        try:
            df = pd.read_csv(thi_file)
            if df.empty:
                return pd.DataFrame(columns=["recorded_at", "thi"])

            df.rename(
                columns={
                    "timestamp": "recorded_at",
                    "THI": "thi",
                },
                inplace=True,
            )

            # Convert unix timestamp to datetime
            df["recorded_at"] = pd.to_datetime(df["recorded_at"], unit="s")

            result = df[["recorded_at", "thi"]]
            logger.info(f"Loaded THI data: {len(result)} records")
            return result
        except Exception as e:
            logger.warning(f"Error loading THI file: {e}")
            return pd.DataFrame(columns=["recorded_at", "thi"])

    def load_ankle_activity(self, cow_id: str) -> pd.DataFrame:
        """
        Load accelerometer/activity data for a specific cow.

        Args:
            cow_id: Cow identifier (e.g., "C01")

        Returns:
            DataFrame with cow_id, recorded_at (datetime), and numeric columns
        """
        ankle_dir = self.sensor_data_dir / "main_data" / "ankle" / cow_id
        if not ankle_dir.exists():
            logger.warning(f"Ankle data directory not found: {ankle_dir}")
            return pd.DataFrame()

        dfs = []
        for csv_file in sorted(ankle_dir.glob("*.csv")):
            try:
                df = pd.read_csv(csv_file)
                if df.empty:
                    continue

                df["cow_id"] = cow_id
                df.rename(
                    columns={"timestamp": "recorded_at", "datetime": "recorded_at"},
                    inplace=True,
                )

                # Convert unix timestamp to datetime if needed
                if pd.api.types.is_numeric_dtype(df["recorded_at"]):
                    df["recorded_at"] = pd.to_datetime(df["recorded_at"], unit="s")
                else:
                    df["recorded_at"] = pd.to_datetime(df["recorded_at"])

                dfs.append(df)
            except Exception as e:
                logger.warning(f"Error loading {csv_file}: {e}")
                continue

        if not dfs:
            logger.warning(f"No ankle activity files loaded for {cow_id}")
            return pd.DataFrame()

        result = pd.concat(dfs, ignore_index=True)
        logger.info(f"Loaded ankle data for {cow_id}: {len(result)} records")
        return result

    def compute_daily_features(self) -> pd.DataFrame:
        """
        Compute daily aggregated features from CBT and THI data.

        Returns:
            DataFrame with columns: cow_id, date, mean_temp_c, std_temp_c, mean_thi, thi_adjusted_temp
        """
        cbt_df = self.load_cbt()
        thi_df = self.load_thi()

        if cbt_df.empty:
            logger.warning("No CBT data available for computing daily features")
            return pd.DataFrame()

        if thi_df.empty:
            logger.warning("No THI data available for computing daily features")
            return pd.DataFrame()

        # Merge CBT and THI on nearest timestamp
        merged = pd.merge_asof(
            cbt_df.sort_values("recorded_at"),
            thi_df.sort_values("recorded_at"),
            on="recorded_at",
            direction="nearest",
        )

        # Group by cow_id and date
        merged["date"] = merged["recorded_at"].dt.date

        daily_features = (
            merged.groupby(["cow_id", "date"])
            .agg(
                mean_temp_c=("temperature_c", "mean"),
                std_temp_c=("temperature_c", "std"),
                mean_thi=("thi", "mean"),
            )
            .reset_index()
        )

        # Compute THI-adjusted temperature
        daily_features["thi_adjusted_temp"] = (
            daily_features["mean_temp_c"]
            / (1 + 0.01 * daily_features["mean_thi"])
        )

        logger.info(f"Computed daily features: {len(daily_features)} rows")
        return daily_features
