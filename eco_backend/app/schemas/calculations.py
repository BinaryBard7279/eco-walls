from decimal import Decimal
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, condecimal, ConfigDict

class LayerRequestDTO(BaseModel):
    material_id: int = Field(..., description="ID of the material from database")
    thickness: condecimal(gt=Decimal('0'), max_digits=10, decimal_places=4) = Field(..., description="Thickness of the layer in meters (δ)")
    density_override: Optional[condecimal(gt=Decimal('0'), max_digits=10, decimal_places=3)] = Field(None, description="Optional density override in kg/m³")

class ReinforcementRequestDTO(BaseModel):
    material_id: int = Field(..., description="ID of the reinforcement material from database")
    mass: condecimal(gt=Decimal('0'), max_digits=10, decimal_places=3) = Field(..., description="Mass of the reinforcement per 1 m² of wall (M, kg)")

class CalculationRequestDTO(BaseModel):
    gsop: int = Field(..., gt=0, description="Gradus-days of heating period (ГСОП)")
    wall_area: condecimal(gt=Decimal('0'), max_digits=10, decimal_places=2) = Field(..., description="Total wall area (S, m²)")
    layers: List[LayerRequestDTO] = Field(..., min_length=1, description="List of wall layers from inside to outside")
    reinforcements: List[ReinforcementRequestDTO] = Field(default=[], description="List of reinforcements (optional)")


class LayerResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    material_id: int
    material_name: str
    thickness: Optional[Decimal] = None
    mass: Decimal
    is_reinforcement: bool

class CalculationResponseDTO(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    gsop: int
    wall_area: Decimal
    total_mass_per_sqm: Decimal
    thermal_resistance: Decimal
    total_carbon_per_sqm: Decimal
    total_energy_per_sqm: Decimal
    annual_heat_loss_per_sqm: Decimal
    total_annual_heat_loss: Decimal
    annual_gas_per_sqm: Decimal
    total_annual_gas: Decimal
    created_at: datetime
    layers: List[LayerResponseDTO]

