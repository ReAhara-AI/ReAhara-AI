
import pytest
from pydantic import ValidationError

from app.schemas.inventory import InventoryItemCreate


def test_valid_inventory_item():
    item = InventoryItemCreate(
        kitchen_id=1,
        ingredient_name="Rice",
        quantity=10,
        unit="kg",
    )

    assert item.kitchen_id == 1
    assert item.ingredient_name == "Rice"
    assert item.quantity == 10
    assert item.unit == "kg"


@pytest.mark.parametrize(
    "data",
    [
        {"kitchen_id": -1, "ingredient_name": "Rice", "quantity": 10, "unit": "kg"},
        {"kitchen_id": 1, "ingredient_name": "", "quantity": 10, "unit": "kg"},
        {"kitchen_id": 1, "ingredient_name": "Rice", "quantity": 0, "unit": "kg"},
        {"kitchen_id": 1, "ingredient_name": "Rice", "quantity": -5, "unit": "kg"},
        {"kitchen_id": 1, "ingredient_name": "Rice", "quantity": 10, "unit": ""},
    ],
)
def test_invalid_inventory_item(data):
    with pytest.raises(ValidationError):
        InventoryItemCreate(**data)


def test_text_fields_are_trimmed():
    item = InventoryItemCreate(
        kitchen_id=1,
        ingredient_name="  Rice  ",
        quantity=10,
        unit=" kg ",
    )

    assert item.ingredient_name == "Rice"
    assert item.unit == "kg"


def test_blank_text_after_trimming_is_rejected():
    with pytest.raises(ValidationError):
        InventoryItemCreate(
            kitchen_id=1,
            ingredient_name="   ",
            quantity=10,
            unit="kg",
        )
