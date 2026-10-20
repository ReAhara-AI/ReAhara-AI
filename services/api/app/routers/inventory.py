from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.inventory import (
    InventoryItemCreate,
    InventoryItemResponse,
)
from app.services.inventory_service import (
    create_inventory_item,
    list_inventory,
)

router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"],
)


@router.get("/", response_model=list[InventoryItemResponse])
def get_inventory(
    kitchen_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    try:
        return list_inventory(db, kitchen_id)
    except SQLAlchemyError:
        raise HTTPException(
            status_code=503,
            detail="Unable to retrieve inventory right now.",
        )


@router.post(
    "/",
    response_model=InventoryItemResponse,
    status_code=201,
)
def add_inventory_item(
    item_data: InventoryItemCreate,
    db: Session = Depends(get_db),
):
    try:
        return create_inventory_item(db, item_data)
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=503,
            detail="Unable to save inventory right now.",
        )
