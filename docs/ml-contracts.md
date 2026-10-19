# ML Contracts

Owner: designated ML and data team member.

## 1. Demand Forecasting Model

### Model identity
- Model name: ReAhara AI Demand Forecasting
- Algorithm: `HistGradientBoostingRegressor`
- Current configuration: `max_iter=150`, `learning_rate=0.08`,
  `max_leaf_nodes=20`, `l2_regularization=1.0`, `random_state=42`
- Model identifier returned by inference: `HistGradientBoosting`
- Versioning: Git commit identifies code changes. The trained model artifact
  is generated locally and is not currently versioned in Git.

### Purpose
Predict the next demand observation for a kitchen, meal type, and food
category using calendar, operational, pricing, weather, and historical
demand features. The intended long-term use is to support kitchen planning
and surplus prevention.

The current implementation is a prototype trained on synthetic data.
It is not approved as the sole basis for operational production, food-safety,
or redistribution decisions.

### Dataset source and license
- File: `data/raw/kitchen_demand_dataset.csv`
- Dataset type: synthetic
- Coverage: 2025-04-01 through 2026-03-31
- Rows and columns: 26,280 rows and 22 columns before preprocessing
- Structure: 3 kitchens, 3 meal types, and 8 food categories
- License: not applicable to generated synthetic data in the same way as
  a third-party dataset; confirm the generator's provenance and repository
  licensing before external redistribution.
- This is not evidence of performance on real kitchen observations.

Keep raw datasets and generated model artifacts out of Git unless
specifically approved.

### Preprocessing
1. Read the CSV and parse `date` as a datetime.
2. Convert `actual_consumption_qty` to numeric.
3. Drop rows with invalid dates or missing target values.
4. Retain non-negative target values and sort observations by date.
5. Remove the first observation of each
   `(kitchen_id, meal_type, category)` series because its lag features
   do not have previous observations.
6. One-hot encode `day_of_week`, `kitchen_id`, `meal_type`, `category`,
   and `weather`.
7. Align validation features to the training feature columns.
8. Clip negative predictions to zero.

### Training target
`actual_consumption_qty`

### Required inference input schema

`predict_demand(payload)` requires a JSON object containing the following
fields. All fields are required except `unit`, which is optional.

| Field | Type | Validation |
|---|---|---|
| `day_of_week` | string | Full weekday name, e.g. `Monday` |
| `is_weekend` | number | 0 or 1 |
| `is_festival` | number | 0 or 1 |
| `promotion_flag` | number | 0 or 1 |
| `homepage_featured` | number | 0 or 1 |
| `discount_pct` | number | Finite and non-negative |
| `unit_price` | number | Finite and non-negative |
| `lag_1d_consumption` | number | Finite and non-negative |
| `lag_7d_avg_consumption` | number | Finite and non-negative |
| `lag_14d_avg_consumption` | number | Finite and non-negative |
| `historical_wastage_pct` | number | Fraction from 0 to 1 |
| `kitchen_id` | string | Non-empty |
| `meal_type` | string | Non-empty |
| `category` | string | Non-empty |
| `weather` | string | Non-empty |
| `unit` | string | Optional; defaults to `unspecified` in response |

All numeric features must be finite. Boolean values are rejected for numeric
fields. Categorical values are stripped of surrounding whitespace.

**Integration note:** The `unit` value is returned as metadata; it is not
used as a model feature. The current implementation does not verify that
the unit is compatible with the selected category. The caller must ensure
the input unit and historical quantities use consistent units.

### Output schema

A successful call returns a JSON-compatible object:

```json
{
  "predicted_demand": 184.0,
  "unit": "L",
  "model": "HistGradientBoosting",
  "dataset_type": "synthetic_training_data",
  "prediction_type": "one_step_ahead",
  "warning": "Prototype estimate trained on synthetic data; not validated for operational food-safety or redistribution decisions."
}
```

The numerical prediction above is an illustrative example, not a guaranteed
output for a particular input.

Invalid payloads raise `DemandPredictionError`, a `ValueError` subclass.
A missing model artifact raises `FileNotFoundError`. Invalid or unsupported
artifact metadata raises `ValueError`.

### Inference interface
- Python module: `ml/src/demand_forecasting/inference.py`
- Function: `predict_demand(payload, model_path=DEFAULT_MODEL_PATH)`
- Loader: `load_model(model_path=DEFAULT_MODEL_PATH)`
- Default artifact:
  `ml/models/demand_model.joblib`
- The artifact is produced by `train.py` and contains `model`,
  `feature_columns`, and `features`.
- The inference caller must provide historical lag features available at
  prediction time. Inference does not generate future lag values.

The backend should treat the prediction as an estimate, preserve its unit,
and avoid interpreting it as a guarantee of consumption, surplus, or safety.
The model artifact must be available to the process running inference;
it is not committed to Git by default.

### Training and validation protocol
- Training script: `ml/src/demand_forecasting/train.py`
- The standard training script uses an 80/20 chronological split by date.
- The standard validation period follows the training period.
- The standard evaluation is one-step-ahead using precomputed historical
  demand features, not recursive multi-day forecasting.
- Backtesting script: `ml/src/demand_forecasting/backtest.py`
- Backtesting uses three chronological, non-overlapping 28-day validation
  windows. Each window is trained only on earlier dates.
- Backtesting still uses historical demand features already present in the
  dataset. It does not simulate a 28-day forecast without observing new demand.

### Evaluation results

Results below are from the synthetic dataset and should not be presented as
real-world accuracy.

#### Three-window backtesting

| Window | Validation period | Baseline WMAPE | Model WMAPE |
|---|---|---:|---:|
| 1 | 2026-01-07 to 2026-02-03 | 15.73% | 6.46% |
| 2 | 2026-02-04 to 2026-03-03 | 12.90% | 5.83% |
| 3 | 2026-03-04 to 2026-03-31 | 14.97% | 5.90% |
| Combined | All three windows | 14.54% | 6.06% |

Combined metrics:

| Metric | Seven-day-average baseline | HistGradientBoosting |
|---|---:|---:|
| MAE | 23.75 | 9.90 |
| RMSE | 52.03 | 19.39 |
| WMAPE | 14.54% | 6.06% |

The model has approximately 58.3% lower combined WMAPE than the baseline
on these synthetic validation windows. It also has lower MAE and RMSE in
each window. This result does not establish expected performance on real
kitchen data.

#### Subgroup evaluation
`ml/src/demand_forecasting/evaluate.py` calculates MAE, RMSE, and WMAPE by
kitchen, meal type, and category from the standard validation predictions.
These subgroup metrics are also based on synthetic data. MAE values across
different categories may not be directly comparable when their units differ.

### Local artifacts
Generated under `ml/models/`:
- `demand_model.joblib`: serialized model and feature schema
- `metrics.json`: standard chronological validation metrics
- `validation_predictions.csv`: standard validation predictions
- `subgroup_metrics.json`: subgroup evaluation metrics
- `backtest_metrics.json`: metrics for the three backtesting windows
- `backtest_predictions.csv`: row-level backtesting predictions

These artifacts are generated locally and ignored by Git. Regenerate them
with the corresponding scripts when needed. Do not assume that another
developer or the backend environment has these files; arrange artifact
handoff or model training explicitly.

### Tests
Inference tests: `ml/tests/test_inference.py`

Run from the repository root:

```bash
python -m pytest ml/tests/test_inference.py -q
```

The previously executed test run passed four tests covering valid input,
missing fields, negative lag input, and invalid weekday. Rerun tests after
changes to confirm the current result.

### Limitations and next steps
- The dataset is synthetic; performance on real kitchens is unknown.
- The current backtest is one-step-ahead rolling evaluation using
  precomputed lag features, not recursive multi-day forecasting.
- Availability and reliability of weather, promotions, festivals, prices,
  and lag values at actual prediction time must be established.
- The current interface does not validate unit/category compatibility.
- Real kitchen data, operational monitoring, and comparison against actual
  outcomes are required before production use.
- Forecasts do not establish food safety, freshness, or suitability for
  redistribution. Food-safety decisions require separate validated checks.

## 2. Dataset and Artifact Handling

- Keep large datasets, secrets, and generated model artifacts out of Git
  unless specifically approved.
- Do not commit `.env` files or credentials.
- Record dataset provenance, licensing, and preprocessing whenever a
  third-party dataset is introduced.
- Keep reproducible scripts and documentation in Git.
- Never claim food is safe based only on an image model.

## 3. Future Models

For each additional model, document:
- Model name and version
- Dataset source and license
- Preprocessing steps
- Input and output schema
- Training and validation protocol
- Evaluation metrics and limitations
- Artifact location and deployment requirements
- Inference function or API interface

## Feature Ablation Experiment

An ablation experiment compared the full demand-forecasting model against a
model without `is_festival`, `promotion_flag`, `homepage_featured`, and
`discount_pct`.

Both models used the same HistGradientBoostingRegressor configuration and
three chronological, non-overlapping 28-day validation windows. Each model
was trained only on dates before its validation window.

| Validation window | Full model WMAPE | Ablated model WMAPE |
|---|---:|---:|
| 2026-01-07 to 2026-02-03 | 6.46% | 11.00% |
| 2026-02-04 to 2026-03-03 | 5.83% | 8.85% |
| 2026-03-04 to 2026-03-31 | 5.90% | 10.21% |
| Combined | 6.06% | 10.02% |

The full model outperformed the ablated model in all three validation
windows. Its combined WMAPE was approximately 39.5% lower.

The experiment supports retaining these four features in the current
synthetic-data prototype. Because the features were removed together, the
experiment does not measure the individual contribution of each feature.

**Limitations:** The dataset is synthetic. The results do not establish
real-world forecasting accuracy or actual food-waste reduction. Evaluation
uses precomputed historical features and is not a recursive multi-day
forecast.

## Festival-Only Ablation Experiment

A separate experiment removed only `is_festival` while retaining the
other model features. It used the same HistGradientBoostingRegressor
configuration and the same three chronological, non-overlapping
28-day validation windows.

| Validation window | Full model WMAPE | Without festival WMAPE |
|---|---:|---:|
| 2026-01-07 to 2026-02-03 | 6.46% | 8.57% |
| 2026-02-04 to 2026-03-03 | 5.83% | 6.16% |
| 2026-03-04 to 2026-03-31 | 5.90% | 7.52% |
| Combined | 6.06% | 7.41% |

The full model had lower WMAPE in all three validation windows.
Combined WMAPE was approximately 18.3% lower for the full model than
for the model without `is_festival`.

This indicates that the festival flag provides predictive information
within this synthetic dataset and evaluation protocol. It does not
establish that the feature will improve forecasts on real kitchen data.

**Limitations:** Festival-marked observations show unusually high demand
spike rates in this synthetic dataset. The data-generation process
could not be located in the repository, so the origin of this
relationship has not been verified. Feature availability before
production planning must also be confirmed to rule out leakage.
Real kitchen data and independent validation are required before
production use.
