from datetime import datetime, timezone
import uuid
from sqlalchemy import Column, Integer, String, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class Material(Base):
    __tablename__ = "materials"

    id = Column(Integer, primary_key=True, autoincrement=False)  # We will manually seed exact IDs
    name = Column(String, unique=True, nullable=False)
    density = Column(Numeric(10, 3), nullable=True)
    thermal_conductivity = Column(Numeric(10, 4), nullable=True)
    carbon_emission_factor = Column(Numeric(10, 4), nullable=False)
    embodied_energy = Column(Numeric(10, 4), nullable=False)

    layers = relationship("WallLayer", back_populates="material")


class WallCalculation(Base):
    __tablename__ = "wall_calculations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    gsop = Column(Integer, nullable=False)
    wall_area = Column(Numeric(10, 2), nullable=False)
    total_mass_per_sqm = Column(Numeric(10, 3), nullable=False)
    thermal_resistance = Column(Numeric(10, 4), nullable=False)
    total_carbon_per_sqm = Column(Numeric(10, 3), nullable=False)
    total_energy_per_sqm = Column(Numeric(10, 3), nullable=False)
    annual_heat_loss_per_sqm = Column(Numeric(10, 3), nullable=False)
    total_annual_heat_loss = Column(Numeric(12, 3), nullable=False)
    annual_gas_per_sqm = Column(Numeric(10, 3), nullable=False)
    total_annual_gas = Column(Numeric(12, 3), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc).replace(tzinfo=None), nullable=False)

    layers = relationship("WallLayer", back_populates="calculation", cascade="all, delete-orphan")


class WallLayer(Base):
    __tablename__ = "wall_layers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    calculation_id = Column(UUID(as_uuid=True), ForeignKey("wall_calculations.id", ondelete="CASCADE"), nullable=False)
    material_id = Column(Integer, ForeignKey("materials.id"), nullable=False)
    thickness = Column(Numeric(10, 4), nullable=True)
    mass = Column(Numeric(10, 3), nullable=False)
    is_reinforcement = Column(Boolean, default=False, nullable=False)

    calculation = relationship("WallCalculation", back_populates="layers")
    material = relationship("Material", back_populates="layers")

    @property
    def material_name(self) -> str:
        return self.material.name if self.material else ""

