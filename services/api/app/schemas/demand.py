
from pydantic import BaseModel, Field, field_validator
from typing import Literal


class DemandPredictionRequest(BaseModel):
    is_weekend: int = Field(ge=0, le=1)
    is_festival: int = Field(ge=0, le=1)
    promotion_flag: int = Field(ge=0, le=1)
    homepage_featured: int = Field(ge=0, le=1)

    discount_pct: float = Field(ge=0, allow_inf_nan=False)
    unit_price: float = Field(ge=0, allow_inf_nan=False)
    lag_1d_consumption: float = Field(ge=0, allow_inf_nan=False)
    lag_7d_avg_consumption: float = Field(ge=0, allow_inf_nan=False)
    lag_14d_avg_consumption: float = Field(ge=0, allow_inf_nan=False)
    historical_wastage_pct: float = Field(ge=0, le=1, allow_inf_nan=False)

    day_of_week: Literal[
        "Monday", "Tuesday", "Wednesday", "Thursday",
        "Friday", "Saturday", "Sunday"
    ]
    kitchen_id: str = Field(min_length=1)
    meal_type: str = Field(min_length=1)
    category: str = Field(min_length=1)
    weather: str = Field(min_length=1)

    unit: str = "unspecified"

    @field_validator("kitchen_id", "meal_type", "category", "weather", "unit")
    @classmethod
    def validate_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class DemandPredictionResponse(BaseModel):
    predicted_demand: float
    unit: str
    model: str
    dataset_type: str
    prediction_type: str
    warning: str
  
##Add demand prediction schemas
