from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/inventory",
    tags=["Inventory"],
)

# TODO: Implement endpoints, validation and database operations.
# Keep database access in the service layer.
