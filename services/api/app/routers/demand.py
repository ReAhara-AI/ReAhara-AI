
from fastapi import APIRouter, HTTPException, Request

from demand_forecasting.inference import (
    predict_demand,
    DemandPredictionError,
)

from app.schemas.demand import (
    DemandPredictionRequest,
    DemandPredictionResponse,
)

router = APIRouter(
    prefix="/api/v1/demand",
    tags=["Demand Forecasting"],
)


@router.post(
    "/predict",
    response_model=DemandPredictionResponse,
)
def predict(
    payload: DemandPredictionRequest,
    request: Request,
):
    artifact = getattr(request.app.state, "demand_model", None)

    if artifact is None:
        raise HTTPException(
            status_code=503,
            detail="Demand forecasting model is not available.",
        )

    try:
        return predict_demand(
            payload.model_dump(),
            artifact=artifact,
        )
    except DemandPredictionError as exc:
        raise HTTPException(
            status_code=422,
            detail=str(exc),
        )
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Demand prediction failed.",
        )
