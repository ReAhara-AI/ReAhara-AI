from fastapi import APIRouter

router = APIRouter(
    prefix="/api/v1/production",
    tags=["Production"],
)

# TODO: Implement endpoints, validation and database operations.
# Keep database access in the service layer.
