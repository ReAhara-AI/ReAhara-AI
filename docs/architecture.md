# ReAhara AI — Architecture

## Core workflow
Predict -> Prevent -> Detect -> Verify -> Match -> Route -> Measure -> Learn

## Modules
- apps/web: Next.js frontend and dashboards
- services/api: FastAPI, authentication, database and business APIs
- services/iot: Sensor ingestion and simulated sensor streams
- services/logistics: Recipient matching and route optimization
- ml: Dataset preparation, training, evaluation and model inference
- data: Local data storage; raw data is not committed to Git

## Rules
- PostgreSQL is the primary application database.
- ML training and dataset preparation belong to the ML owner.
- Modules communicate through documented API contracts.
- Food safety decisions require configurable rules and human review.
- Impact metrics must be labelled estimates unless measured.
