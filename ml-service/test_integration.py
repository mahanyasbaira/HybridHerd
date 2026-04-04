#!/usr/bin/env python3
"""Integration test for BRD ML service."""

import sys
import logging
import pathlib
from pathlib import Path

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


def test_feature_engineer() -> bool:
    """Test feature engineering."""
    logger.info("Testing FeatureEngineer...")
    try:
        from models.feature_engineer import FeatureEngineer

        fe = FeatureEngineer()
        X, y = fe.build_features_from_simulated(n_animals=5, seed=42)

        assert len(X) > 0, "No features generated"
        assert len(y) > 0, "No labels generated"
        assert len(X) == len(y), "Feature/label mismatch"

        expected_features = 15
        assert len(X.columns) == expected_features, f"Expected {expected_features} features, got {len(X.columns)}"

        logger.info(f"✓ FeatureEngineer: {len(X)} samples, {len(X.columns)} features")
        return True

    except Exception as e:
        logger.error(f"✗ FeatureEngineer test failed: {e}")
        return False


def test_classifier() -> bool:
    """Test BRD classifier."""
    logger.info("Testing BRDClassifier...")
    try:
        from models.brd_classifier import BRDClassifier
        from models.feature_engineer import FeatureEngineer

        # Generate data
        fe = FeatureEngineer()
        X, y = fe.build_features_from_simulated(n_animals=5, seed=42)

        # Train model
        pathlib.Path("test_weights").mkdir(exist_ok=True)
        clf = BRDClassifier(model_path="test_weights/test_model.joblib")
        clf.train(X, y)

        assert clf.model is not None, "Model not trained"
        assert Path("test_weights/test_model.joblib").exists(), "Model file not saved"

        # Test prediction
        result = clf.predict(X.iloc[:1])
        assert "risk_level" in result, "risk_level not in result"
        assert "probabilities" in result, "probabilities not in result"
        assert result["risk_level"] in ["Low", "Medium", "High"], "Invalid risk level"

        logger.info(f"✓ BRDClassifier: Model trained and prediction works")

        # Cleanup
        import shutil
        shutil.rmtree("test_weights", ignore_errors=True)
        return True

    except Exception as e:
        logger.error(f"✗ BRDClassifier test failed: {e}")
        return False


def test_mmcows_loader() -> bool:
    """Test MmCows dataset loader."""
    logger.info("Testing MmCowsLoader...")
    try:
        from loaders.mmcows_loader import MmCowsLoader

        dataset_path = "/Volumes/Me Things/Claude_code/HybridHerd/Datasets/sensor_data/"
        loader = MmCowsLoader(dataset_path)

        # Test CBT loading
        cbt_df = loader.load_cbt()
        assert not cbt_df.empty, "CBT data is empty"
        assert "cow_id" in cbt_df.columns, "Missing cow_id column"
        assert "recorded_at" in cbt_df.columns, "Missing recorded_at column"
        assert "temperature_c" in cbt_df.columns, "Missing temperature_c column"

        logger.info(f"✓ MmCowsLoader CBT: {len(cbt_df)} records")

        # Test THI loading
        thi_df = loader.load_thi()
        assert not thi_df.empty, "THI data is empty"
        assert "recorded_at" in thi_df.columns, "Missing recorded_at column"
        assert "thi" in thi_df.columns, "Missing thi column"

        logger.info(f"✓ MmCowsLoader THI: {len(thi_df)} records")

        # Test ankle activity loading
        ankle_df = loader.load_ankle_activity("C01")
        assert not ankle_df.empty, "Ankle data is empty for C01"
        assert "cow_id" in ankle_df.columns, "Missing cow_id column in ankle data"

        logger.info(f"✓ MmCowsLoader ankle: {len(ankle_df)} records for C01")

        # Test daily feature computation
        daily_df = loader.compute_daily_features()
        assert not daily_df.empty, "Daily features are empty"
        assert "cow_id" in daily_df.columns, "Missing cow_id in daily features"
        assert "mean_temp_c" in daily_df.columns, "Missing mean_temp_c"

        logger.info(f"✓ MmCowsLoader daily features: {len(daily_df)} rows")

        return True

    except Exception as e:
        logger.error(f"✗ MmCowsLoader test failed: {e}")
        return False


def test_malga_loader() -> bool:
    """Test Malga loader."""
    logger.info("Testing MalgaLoader...")
    try:
        from loaders.malga_loader import MalgaLoader

        loader = MalgaLoader()
        df = loader.load()

        assert not df.empty, "Malga baseline is empty"
        assert "cow_id" in df.columns, "Missing cow_id column"
        assert "mean_hr_bpm" in df.columns, "Missing mean_hr_bpm column"

        logger.info(f"✓ MalgaLoader: {len(df)} baseline records generated")
        return True

    except Exception as e:
        logger.error(f"✗ MalgaLoader test failed: {e}")
        return False


def main() -> int:
    """Run all tests."""
    logger.info("=" * 60)
    logger.info("HybridHerd BRD ML Service Integration Tests")
    logger.info("=" * 60)

    tests = [
        test_feature_engineer,
        test_classifier,
        test_mmcows_loader,
        test_malga_loader,
    ]

    results = []
    for test in tests:
        try:
            results.append(test())
        except Exception as e:
            logger.error(f"Test {test.__name__} raised unexpected error: {e}")
            results.append(False)

    logger.info("=" * 60)
    passed = sum(results)
    total = len(results)
    logger.info(f"Results: {passed}/{total} tests passed")

    if passed == total:
        logger.info("All tests passed!")
        return 0
    else:
        logger.error("Some tests failed")
        return 1


if __name__ == "__main__":
    sys.exit(main())
