# ML and Data — Owner: Kasaniragini

## Responsibilities
- Dataset sourcing, licensing checks, cleaning and preprocessing
- Demand forecasting and production recommendations
- Food-condition image assessment
- Waste and equipment anomaly detection
- Training, evaluation, experiment tracking and model versions
- Documented inference interfaces for the backend

## Structure
- datasets: dataset documentation and configuration; large data stays untracked
- src/demand_forecasting: demand forecasting
- src/food_assessment: visual condition assessment
- src/anomaly_detection: waste and equipment anomaly detection
- experiments: experiment configurations and evaluation reports
- models: model metadata and version information

Do not duplicate ML training pipelines in the backend.
Do not commit credentials, private datasets or large model binaries.
Visual predictions must not independently certify food as safe to eat.
