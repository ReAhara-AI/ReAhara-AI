# ReAhara AI — Demand Forecasting

## Goal
Forecast food demand to help institutional kitchens prevent overproduction
and reduce avoidable food waste.

## Standard input dataset
The processed CSV must be named demand.csv and contain:

- date: date of demand
- kitchen_id: identifier for a kitchen or fulfilment centre
- item_id: identifier for a meal or food item
- demand: observed quantity demanded

Optional columns may include:
- day_of_week
- is_holiday
- planned_attendance
- temperature
- special_event

## Output
Predictions of demand for each kitchen and food item on future dates.

## Evaluation
- MAE: Mean Absolute Error
- RMSE: Root Mean Squared Error
- WMAPE: Weighted Mean Absolute Percentage Error

Use chronological train/validation splits. Do not randomly split time-series
data, because that can leak future information into training.

## Dataset handling
Keep downloaded source files in data/raw/ and processed files in
data/processed/. Do not commit large datasets or private kitchen data.
