from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150))
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    role: Mapped[str] = mapped_column(String(40), default="kitchen_manager")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Kitchen(Base):
    __tablename__ = "kitchens"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    manager_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class InventoryItem(Base):
    __tablename__ = "inventory_items"
    id: Mapped[int] = mapped_column(primary_key=True)
    kitchen_id: Mapped[int] = mapped_column(ForeignKey("kitchens.id"), index=True)
    ingredient_name: Mapped[str] = mapped_column(String(200))
    quantity: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30))
    expiry_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProductionPlan(Base):
    __tablename__ = "production_plans"
    id: Mapped[int] = mapped_column(primary_key=True)
    kitchen_id: Mapped[int] = mapped_column(ForeignKey("kitchens.id"), index=True)
    menu_item: Mapped[str] = mapped_column(String(200))
    planned_quantity: Mapped[float] = mapped_column(Float)
    recommended_quantity: Mapped[float | None] = mapped_column(Float, nullable=True)
    production_date: Mapped[datetime] = mapped_column(DateTime, index=True)
    model_version: Mapped[str | None] = mapped_column(String(100), nullable=True)


class SurplusBatch(Base):
    __tablename__ = "surplus_batches"
    id: Mapped[int] = mapped_column(primary_key=True)
    kitchen_id: Mapped[int] = mapped_column(ForeignKey("kitchens.id"), index=True)
    food_name: Mapped[str] = mapped_column(String(200))
    quantity_kg: Mapped[float] = mapped_column(Float)
    preparation_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    storage_conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    verification_status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Recipient(Base):
    __tablename__ = "recipients"
    id: Mapped[int] = mapped_column(primary_key=True)
    organization_name: Mapped[str] = mapped_column(String(200))
    location: Mapped[str] = mapped_column(String(300))
    capacity_kg: Mapped[float] = mapped_column(Float, default=0)
    contact_details: Mapped[str | None] = mapped_column(String(300), nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Delivery(Base):
    __tablename__ = "deliveries"
    id: Mapped[int] = mapped_column(primary_key=True)
    surplus_batch_id: Mapped[int] = mapped_column(ForeignKey("surplus_batches.id"))
    recipient_id: Mapped[int] = mapped_column(ForeignKey("recipients.id"))
    route_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    estimated_arrival: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="planned")
    delivered_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class SensorReading(Base):
    __tablename__ = "sensor_readings"
    id: Mapped[int] = mapped_column(primary_key=True)
    kitchen_id: Mapped[int] = mapped_column(ForeignKey("kitchens.id"), index=True)
    sensor_type: Mapped[str] = mapped_column(String(80))
    value: Mapped[float] = mapped_column(Float)
    unit: Mapped[str] = mapped_column(String(30))
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class WasteRecord(Base):
    __tablename__ = "waste_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    kitchen_id: Mapped[int] = mapped_column(ForeignKey("kitchens.id"), index=True)
    food_name: Mapped[str] = mapped_column(String(200))
    quantity_kg: Mapped[float] = mapped_column(Float)
    reason: Mapped[str] = mapped_column(String(200))
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ImpactRecord(Base):
    __tablename__ = "impact_records"
    id: Mapped[int] = mapped_column(primary_key=True)
    food_prevented_kg: Mapped[float] = mapped_column(Float, default=0)
    food_redistributed_kg: Mapped[float] = mapped_column(Float, default=0)
    meals_recovered: Mapped[int] = mapped_column(Integer, default=0)
    estimated_co2e_kg: Mapped[float] = mapped_column(Float, default=0)
    calculation_method: Mapped[str | None] = mapped_column(Text, nullable=True)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ModelVersion(Base):
    __tablename__ = "model_versions"
    id: Mapped[int] = mapped_column(primary_key=True)
    model_name: Mapped[str] = mapped_column(String(150))
    version: Mapped[str] = mapped_column(String(80))
    evaluation_metrics: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    artifact_location: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
