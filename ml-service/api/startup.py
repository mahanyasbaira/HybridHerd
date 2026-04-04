import logging
import pathlib
from pathlib import Path

logger = logging.getLogger(__name__)

# Module-level state
_model_loaded = False
_model_load_error = None


def auto_train_if_needed(model_path: str = "weights/brd_model.joblib") -> bool:
    """
    Check if model exists; if not, auto-train from synthetic data.

    Args:
        model_path: Path to model file

    Returns:
        True if model is ready, False otherwise
    """
    global _model_loaded, _model_load_error

    model_file = Path(model_path)

    if model_file.exists():
        logger.info(f"Model found at {model_path}")
        _model_loaded = True
        return True

    logger.info(f"Model not found at {model_path}. Auto-training from synthetic data...")

    try:
        from models.feature_engineer import FeatureEngineer
        from models.brd_classifier import BRDClassifier

        pathlib.Path("weights").mkdir(exist_ok=True)

        fe = FeatureEngineer()
        X, y = fe.build_features_from_simulated()

        clf = BRDClassifier(model_path=model_path)
        clf.train(X, y)

        logger.info(f"Auto-trained model saved to {model_path}")
        _model_loaded = True
        return True

    except Exception as e:
        logger.error(f"Auto-training failed: {e}")
        _model_load_error = str(e)
        _model_loaded = False
        return False


def is_model_ready() -> bool:
    """Check if model is loaded."""
    return _model_loaded


def get_model_error() -> str:
    """Get last model load error."""
    return _model_load_error or "Unknown error"
