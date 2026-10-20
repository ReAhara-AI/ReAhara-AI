from datetime import datetime

from fastapi.testclient import TestClient

from main import app
from app.db.session import get_db
from app.db.models import InventoryItem


class FakeDB:
    def rollback(self):
        pass

    def close(self):
        pass


def fake_inventory_item():
    return InventoryItem(
        id=1,
        kitchen_id=1,
        ingredient_name="Rice",
        quantity=10,
        unit="kg",
        expiry_date=None,
        updated_at=datetime(2026, 1, 1),
    )


def override_get_db():
    yield FakeDB()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def teardown_module():
    app.dependency_overrides.clear()


def test_get_inventory_returns_items(monkeypatch):
    from app.routers import inventory

    monkeypatch.setattr(
        inventory,
        "list_inventory",
        lambda db, kitchen_id=None: [fake_inventory_item()],
    )

    response = client.get("/api/v1/inventory/")

    assert response.status_code == 200
    assert response.json()[0]["ingredient_name"] == "Rice"
    assert response.json()[0]["quantity"] == 10


def test_get_inventory_filters_by_kitchen_id(monkeypatch):
    from app.routers import inventory

    captured = {}

    def fake_list(db, kitchen_id=None):
        captured["kitchen_id"] = kitchen_id
        return []

    monkeypatch.setattr(inventory, "list_inventory", fake_list)

    response = client.get("/api/v1/inventory/?kitchen_id=2")

    assert response.status_code == 200
    assert response.json() == []
    assert captured["kitchen_id"] == 2


def test_get_inventory_rejects_invalid_kitchen_id():
    response = client.get("/api/v1/inventory/?kitchen_id=0")

    assert response.status_code == 422


def test_post_inventory_creates_item(monkeypatch):
    from app.routers import inventory

    def fake_create(db, item_data):
        return InventoryItem(
            id=1,
            kitchen_id=item_data.kitchen_id,
            ingredient_name=item_data.ingredient_name,
            quantity=item_data.quantity,
            unit=item_data.unit,
            expiry_date=item_data.expiry_date,
            updated_at=datetime(2026, 1, 1),
        )

    monkeypatch.setattr(
        inventory,
        "create_inventory_item",
        fake_create,
    )

    response = client.post(
        "/api/v1/inventory/",
        json={
            "kitchen_id": 1,
            "ingredient_name": "Rice",
            "quantity": 10,
            "unit": "kg",
        },
    )

    assert response.status_code == 201
    assert response.json()["ingredient_name"] == "Rice"
    assert response.json()["id"] == 1


def test_post_inventory_rejects_invalid_data():
    response = client.post(
        "/api/v1/inventory/",
        json={
            "kitchen_id": 1,
            "ingredient_name": "Rice",
            "quantity": -5,
            "unit": "kg",
        },
    )

    assert response.status_code == 422
