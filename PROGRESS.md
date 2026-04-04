# HybridHerd — BRD Early Detection System: Progress Log

## Project Overview
Full-stack predictive monitoring system for Bovine Respiratory Disease (BRD) detection.
Integrates multi-sensor cattle telemetry (Nose Ring, Collar, Ear Tag/SenseHub) to assign risk levels: Low / Medium / High.

## Architecture
```
HybridHerd/
├── backend/          Node.js + PostgreSQL REST/GraphQL API
├── ml-service/       Python FastAPI ML microservice (scikit-learn)
├── frontend/         React Native mobile app (NativeWind/Tailwind)
├── Datasets/         Open-source training data (MmCows, Malga Juribello, CBVD-5)
└── PROGRESS.md       This file
```

---

## Phase Status

| Phase | Owner | Status | Notes |
|-------|-------|--------|-------|
| Phase 1: DB & API Architecture | Backend_Dev | ✅ Complete | 9/9 files syntax-valid |
| Phase 2: ML Pipeline & Dataset Integration | Data_ML_Engineer | ✅ Complete | 11/11 files syntax-valid |
| Phase 3: Alerting & Telehealth Routing | Backend_Dev | ✅ Complete | 6/6 files syntax-valid |
| Phase 4: Frontend Application | Frontend_Dev | ✅ Complete | 16 files, all exports verified |

---

## Phase 1 — Database & API Architecture

**Started:** 2026-04-04  
**Agent:** Backend_Dev

### Deliverables
- [ ] PostgreSQL schema: `animals`, `nose_ring_readings`, `collar_readings`, `ear_tag_readings`, `alerts`, `telehealth_actions`
- [ ] Node.js/Express app with REST endpoints for telemetry ingestion
- [ ] GraphQL layer for dashboard queries
- [ ] JWT authentication middleware
- [ ] `.env.example` and Docker Compose for local DB

### Key Schema Decisions
- All telemetry tables reference `animals(id)` via FK
- Time-series reads indexed on `(animal_id, recorded_at)` for range queries
- `alerts` table tracks risk transitions with `previous_risk` and `current_risk`
- `telehealth_actions` links alert → vet note → action status

---

## Phase 2 — ML Pipeline (pending)
## Phase 3 — Alerting & Telehealth (pending)  
## Phase 4 — Frontend (pending)

---

## Dataset Inventory

| Dataset | Location | Format | Used For |
|---------|----------|--------|----------|
| MmCows sensor_data | `Datasets/sensor_data/` | CSV per cow per modality | Behavioral baseline (accelerometer, CBT, THI) |
| MmCows trained_models | `Datasets/trained_models/` | PyTorch weights | Vision behavior classification |
| CBVD-5 | `Datasets/CBVD-5(Cow Behavior Video Dataset)/` | CSV + frames | Computer vision behavior labels |
| MmCows benchmarks | `Datasets/mmcows-main/` | Python pipeline | Reference architecture |
