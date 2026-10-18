# ReAhara AI Database Schema

## Users
- id
- full_name
- email
- role
- created_at

## Kitchens
- id
- name
- location
- manager_id
- created_at

## Inventory
- id
- kitchen_id
- ingredient_name
- quantity
- unit
- expiry_date
- updated_at

## Production Plans
- id
- kitchen_id
- menu_item
- planned_quantity
- recommended_quantity
- production_date
- model_version

## Surplus Batches
- id
- kitchen_id
- food_name
- quantity
- preparation_time
- storage_conditions
- verification_status
- created_at

## Recipients
- id
- organization_name
- location
- capacity
- contact_details
- active

## Deliveries
- id
- surplus_batch_id
- recipient_id
- route_details
- estimated_arrival
- status
- delivered_at

## IoT Readings
- id
- kitchen_id
- sensor_type
- value
- recorded_at

## Waste Records
- id
- kitchen_id
- food_name
- quantity
- reason
- recorded_at

## Impact Records
- id
- food_prevented_kg
- food_redistributed_kg
- meals_recovered
- estimated_co2e_kg
- calculation_method
- recorded_at

## Model Versions
- id
- model_name
- version
- evaluation_metrics
- artifact_location
- created_at
