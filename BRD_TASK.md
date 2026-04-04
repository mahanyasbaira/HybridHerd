Project Name:HybridHerd {Bovine Respiratory Disease (BRD) Early Detection System}

System Objective:
Build a full-stack predictive monitoring system that integrates multi-sensor cattle telemetry to assign BRD risk levels (Low, Medium, High). The goal is to alert ranchers of early disease onset, facilitate telehealth workflows to remote veterinarians, and reduce unnecessary antibiotic usage.

Agent Team Setup:
I require you to spawn an Agent Team consisting of an Orchestrator, a Data_ML_Engineer, a Backend_Dev, and a Frontend_Dev. Work sequentially through the following phases. Do not proceed to the next phase until the current one is fully implemented and tested.

Phase 1: Database & API Architecture (Backend_Dev)

Set up a Node.js/PostgreSQL backend.

Create a highly normalized database schema to handle high-frequency time-series data from three specific hardware sources:

Nose_Ring: fields for temperature and respiratory_rate.

Collar: fields for chew_frequency and cough_count.

Ear_Tag (SenseHub): fields for animal_id and behavior_index.

Build REST/GraphQL endpoints to ingest this telemetry.

Create a specific Alert table and a Telehealth_Action table to handle the routing of data from the Rancher to the Vet.

Phase 2: Machine Learning Pipeline & Dataset Integration (Data_ML_Engineer)

Set up a Python microservice using scikit-learn and pandas.

Dataset Loaders: Write data ingestion scripts to parse the open-source datasets we have downloaded:

Create a loader for the MmCows Dataset (wearable accelerometer data) to train baseline behavioral classifications.

Create a loader for the Malga Juribello Dataset to establish heart rate and temperature baseline thresholds, factoring in the Temperature-Humidity Index to reduce false positives.

Model Construction: Build a Gradient Boosting Classifier (HistGradientBoostingClassifier).

Feature Engineering: Aggregate the simulated hardware data (Nose Ring, Collar, Ear Tag) into 24-hour and 72-hour rolling averages.

Inference: The model must output a specific risk classification: Low, Medium, or High. Expose this via a FastAPI endpoint.

Phase 3: Alerting Logic & Telehealth Routing (Backend_Dev)

Create a cron job or event listener that checks the ML risk output.

If a cow's risk transitions to Medium or High, automatically generate a notification payload for the Rancher.

Implement the Rancher -> Vet workflow: Create an API route where the Rancher can append a text input to the alert and forward the entire physiological data payload to the Vet dashboard for an Action decision.

Phase 4: Frontend Application (Frontend_Dev)

Build a React Native mobile application using Tailwind CSS.

UI Constraints: The UI must be highly accessible with large typography and high contrast, as our primary demographic is an aging customer base with low tech adoption.

Dashboard: Build a master list component showing all cattle and their colored Risk Level badges (Green, Yellow, Red).

Individual View: Build a single-cow dashboard that aggregates the Nose Ring, Collar, and Ear Tag metrics into one unified, easy-to-read screen. Include a prominent "Send to Vet" button for Medium/High risk animals.

Orchestrator, please begin by reviewing this document, creating the initial project scaffolding, and handing off Phase 1 to the Backend_Dev. Log all progress in a PROGRESS.md file.