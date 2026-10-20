from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import InventoryItem
from app.schemas.inventory import InventoryItemCreate


def list_inventory(
    db: Session,
    kitchen_id: int | None = None,
) -> list[InventoryItem]:
    statement = select(InventoryItem).order_by(InventoryItem.id)

    if kitchen_id is not None:
        statement = statement.where(
            InventoryItem.kitchen_id == kitchen_id
        )

    return list(db.scalars(statement).all())


def create_inventory_item(
    db: Session,
    item_data: InventoryItemCreate,
) -> InventoryItem:
    item = InventoryItem(**item_data.model_dump())

    db.add(item)
    db.commit()
    db.refresh(item)

    return item
