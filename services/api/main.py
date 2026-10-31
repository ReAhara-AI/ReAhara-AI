import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from demand_forecasting.inference import load_model

from app.routers.system import router as system_router
from app.routers.inventory import router as inventory_router
from app.routers.demand import router as demand_router


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        app.state.demand_model = load_model()
        logger.info("Demand forecasting model loaded successfully.")
    except Exception:
        app.state.demand_model = None
        logger.exception(
            "Demand forecasting model unavailable. "
            "Demand predictions will be disabled."
        )

    yield

    app.state.demand_model = None


app = FastAPI(
    title="ReAhara AI API",
    version="0.1.0",
    description="Food waste prevention and sustainable redistribution ecosystem",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(system_router)
app.include_router(inventory_router)
app.include_router(demand_router)


@app.get("/", tags=["System"])
def root():
    return {"message": "Welcome to ReAhara AI", "docs": "/docs"}