
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.system import router as system_router
from app.routers.inventory import router as inventory_router

app = FastAPI(
    title="ReAhara AI API",
    version="0.1.0",
    description="Food waste prevention and sustainable redistribution ecosystem",
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


@app.get("/", tags=["System"])
def root():
    return {"message": "Welcome to ReAhara AI", "docs": "/docs"}
