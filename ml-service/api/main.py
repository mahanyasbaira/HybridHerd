import logging
import os
import pathlib
from typing import Dict, Any, Optional

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import pandas as pd

from models.brd_classifier import BRDClassifier
from models.feature_engineer import FeatureEngineer
from api.startup import auto_train_if_needed, is_model_ready

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Configuration from environment
MODEL_PATH = os.getenv("MODEL_PATH", "weights/brd_model.joblib")
DATABASE_URL = os.getenv("DATABASE_URL", None)
PORT = int(os.getenv("PORT", "8000"))

# Global classifier instance (lazy-loaded)
_classifier: Optional[BRDClassifier] = None


def get_classifier() -> BRDClassifier:
    """Lazy-load classifier singleton."""
    global _classifier

    if _classifier is None:
        _classifier = BRDClassifier(model_path=MODEL_PATH)
        _classifier.load()

        if _classifier.model is None:
            raise RuntimeError("Failed to load model")

    return _classifier


# FastAPI app
app = FastAPI(
    title="HybridHerd BRD Detection API",
    description="Early detection of Bovine Respiratory Disease using ML",
    version="1.0.0",
)


# Pydantic models
class PredictRequest(BaseModel):
    """Request body for /predict endpoint."""

    animal_id: int = Field(..., description="Animal ID")
    features: Dict[str, float] = Field(
        ..., description="Feature dictionary keyed by feature name"
    )


class PredictFromDbRequest(BaseModel):
    """Request body for /predict-from-db endpoint."""

    animal_id: int = Field(..., description="Animal ID")
    lookback_hours: int = Field(
        default=72, description="Hours of history to retrieve"
    )


class PredictResponse(BaseModel):
    """Response for prediction endpoints."""

    animal_id: int
    risk_level: str
    probabilities: Dict[str, float]


class HealthResponse(BaseModel):
    """Response for /health endpoint."""

    status: str
    model_loaded: bool


class RetrainResponse(BaseModel):
    """Response for /retrain endpoint."""

    status: str
    model_path: str


# Endpoints
@app.on_event("startup")
async def startup_event() -> None:
    """Initialize on startup."""
    logger.info("Starting HybridHerd BRD Detection API...")
    auto_train_if_needed(MODEL_PATH)

    if not is_model_ready():
        logger.warning("Model not ready at startup")
    else:
        logger.info("Model ready")


@app.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    try:
        clf = get_classifier()
        model_loaded = clf.model is not None
    except Exception as e:
        logger.warning(f"Health check: model not loaded: {e}")
        model_loaded = False

    return HealthResponse(status="ok", model_loaded=model_loaded)


@app.post("/predict", response_model=PredictResponse)
async def predict(request: PredictRequest) -> PredictResponse:
    """
    Predict BRD risk level from raw features.

    Example:
    ```json
    {
        "animal_id": 1,
        "features": {
            "temperature_c": 38.5,
            "respiratory_rate": 25,
            ...
        }
    }
    ```
    """
    try:
        clf = get_classifier()

        # Create DataFrame from features
        X = pd.DataFrame([request.features])

        # Predict
        result = clf.predict(X)

        return PredictResponse(
            animal_id=request.animal_id,
            risk_level=result["risk_level"],
            probabilities=result["probabilities"],
        )

    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/predict-from-db", response_model=PredictResponse)
async def predict_from_db(
    request: PredictFromDbRequest,
) -> PredictResponse:
    """
    Predict BRD risk level by querying sensor data from database.

    Returns 503 if database not configured.
    """
    if not DATABASE_URL:
        raise HTTPException(
            status_code=503,
            detail="Database not configured",
        )

    try:
        fe = FeatureEngineer(db_url=DATABASE_URL)
        X = fe.build_features_from_db(
            request.animal_id, request.lookback_hours
        )

        clf = get_classifier()
        result = clf.predict(X)

        return PredictResponse(
            animal_id=request.animal_id,
            risk_level=result["risk_level"],
            probabilities=result["probabilities"],
        )

    except Exception as e:
        logger.error(f"Prediction from DB error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/retrain", response_model=RetrainResponse)
async def retrain() -> RetrainResponse:
    """
    Regenerate synthetic training data and retrain model.

    This endpoint retrains the model in-place and updates the global classifier.
    """
    try:
        global _classifier

        fe = FeatureEngineer()
        X, y = fe.build_features_from_simulated()

        clf = BRDClassifier(model_path=MODEL_PATH)
        clf.train(X, y)

        # Update global instance
        _classifier = clf

        logger.info(f"Model retrained and saved to {MODEL_PATH}")

        return RetrainResponse(status="retrained", model_path=str(MODEL_PATH))

    except Exception as e:
        logger.error(f"Retrain error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=PORT,
        reload=False,
    )
