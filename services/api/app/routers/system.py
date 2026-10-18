from fastapi import APIRouter

router = APIRouter(tags=["System"])


@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "project": "ReAhara AI",
        "version": "0.1.0",
    }


@router.get("/api/v1")
def api_info():
    return {
        "project": "ReAhara AI",
        "api_version": "v1",
        "modules": [
            "demand-forecasting",
            "production-planning",
            "inventory",
            "food-verification",
            "iot-monitoring",
            "waste-detection",
            "recipient-matching",
            "route-optimization",
            "impact-tracking",
            "esg-reporting",
        ],
    }
