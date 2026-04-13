# HybridHerd BRD Early Detection ML Microservice

Python ML microservice for Bovine Respiratory Disease (BRD) early detection using sensor telemetry.

## Project Structure

```
ml-service/
├── loaders/                    # Dataset loaders
│   ├── mmcows_loader.py       # MmCows sensor data loader
│   └── malga_loader.py        # Malga heart rate baseline loader
├── models/                     # ML models and feature engineering
│   ├── feature_engineer.py    # Feature generation (synthetic & from DB)
│   └── brd_classifier.py      # HistGradientBoosting classifier
├── api/                        # FastAPI application
│   ├── main.py                # REST API endpoints
│   └── startup.py             # Startup initialization
├── train.py                    # Standalone training script
├── test_integration.py        # Integration tests
├── requirements.txt           # Python dependencies
├── .env.example               # Environment configuration template
└── README.md                  # This file
```

## Installation

```bash
pip install -r requirements.txt
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgres://user:password@localhost:5432/hybridherd
MODEL_PATH=weights/brd_model.joblib
PORT=8000
```

- `DATABASE_URL`: PostgreSQL connection string (optional for `/predict-from-db`)
- `MODEL_PATH`: Path where trained model is saved
- `PORT`: FastAPI server port



Generates synthetic data and trains model to `weights/brd_model.joblib`.

### Using FeatureEngineer Directly

```python
from models.feature_engineer import FeatureEngineer
from models.brd_classifier import BRDClassifier

fe = FeatureEngineer()
X, y = fe.build_features_from_simulated(n_animals=20)

clf = BRDClassifier()
clf.train(X, y)
```

## Running the API

```bash
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
```

Or use the main module directly:

```bash
python3 api/main.py
```

### API Endpoints

**GET `/health`**
- Health check
- Returns: `{ "status": "ok", "model_loaded": true }`

**POST `/predict`**
- Predict from raw features
- Body:
  ```json
  {
    "animal_id": 1,
    "features": {
      "temperature_c": 38.5,
      "respiratory_rate": 25,
      "chew_frequency": 75,
      "cough_count": 0,
      "behavior_index": 0.85,
      "temperature_c_24h_mean": 38.4,
      ...
    }
  }
  ```
- Returns:
  ```json
  {
    "animal_id": 1,
    "risk_level": "Low",
    "probabilities": {
      "Low": 0.92,
      "Medium": 0.07,
      "High": 0.01
    }
  }
  ```

**POST `/predict-from-db`**
- Predict by querying database for recent sensor data
- Body:
  ```json
  {
    "animal_id": 1,
    "lookback_hours": 72
  }
  ```
- Returns: Same as `/predict`
- Error: 503 if database not configured

**POST `/retrain`**
- Regenerate synthetic training data and retrain model
- Returns:
  ```json
  {
    "status": "retrained",
    "model_path": "weights/brd_model.joblib"
  }
  ```

## Testing

Run integration tests:

```bash
python3 test_integration.py
```

Tests cover:
- Feature engineering (synthetic data generation)
- Classifier training and inference
- MmCows dataset loader (CBT, THI, ankle activity, daily aggregations)
- Malga baseline loader

## Data Sources

### MmCows Dataset
Located in `/Volumes/Me Things/Claude_code/HybridHerd/Datasets/sensor_data/main_data/`:

- **cbt/**: Core body temperature (unix timestamp, temperature_C)
- **thi/**: Temperature-Humidity Index (timestamp, temperature_F, humidity_per, THI)
- **ankle/**: Accelerometer/activity data per cow (timestamp, datetime, lying, ...)
- **behavior_labels/**: Ground-truth behavior annotations

### Malga Juribello Dataset
If available at Zenodo, loader can read actual data. Otherwise, generates synthetic baseline with realistic heart rate patterns.

## Features

### Raw Metrics (5 features)
- `temperature_c`: Nose ring core body temperature (°C)
- `respiratory_rate`: Breathing rate (breaths/min)
- `chew_frequency`: Collar chewing frequency
- `cough_count`: Cough frequency
- `behavior_index`: Ear tag behavior index

### Rolling Aggregates (10 features)
- 24-hour rolling means for all 5 metrics
- 72-hour rolling means for all 5 metrics

**Total: 15 features**

## Labels

- **0 - Low**: All metrics in healthy range (no BRD signs)
- **1 - Medium**: 1-2 metrics elevated (early BRD signs)
- **2 - High**: 3+ metrics elevated (clear BRD indicators)

## Model

**Classifier**: HistGradientBoostingClassifier (sklearn)
- Multi-class classification (0, 1, 2)
- Probability calibration for risk stratification

## Robustness

- NaN/missing sensor values: handled with forward-fill then backfill before rolling aggregates
- Dataset not found: loaders return empty DataFrames with warnings
- Database unavailable: `/predict-from-db` returns 503, `/predict` still works
- Model not found: auto-trained on first startup using synthetic data

## Development Notes

All code includes:
- Full type hints
- Comprehensive logging
- Graceful error handling
- No hardcoded credentials
- Configurable file paths via environment

For any updates to the model or features, retrain via `/retrain` endpoint or `train.py`.
