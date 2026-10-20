from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class InventoryItemCreate(BaseModel):
    kitchen_id: int = Field(gt=0)
    ingredient_name: str = Field(min_length=1, max_length=200)
    quantity: float = Field(gt=0, allow_inf_nan=False)
    unit: str = Field(min_length=1, max_length=30)
    expiry_date: datetime | None = None

    @field_validator("ingredient_name", "unit")
    @classmethod
    def strip_text(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("This field cannot be blank")
        return value


class InventoryItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    kitchen_id: int
    ingredient_name: str
    quantity: float
    unit: str
    expiry_date: datetime | None
    updated_at: datetime
