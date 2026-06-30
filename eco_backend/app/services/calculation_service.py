from decimal import Decimal
from typing import List, Dict
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.models import Material, WallCalculation, WallLayer
from app.schemas.calculations import CalculationRequestDTO
from app.services import math_engine

class CalculationService:
    @staticmethod
    async def process_wall_data(db: AsyncSession, request_dto: CalculationRequestDTO) -> WallCalculation:
        # 1. Gather all material IDs
        material_ids = set()
        for layer in request_dto.layers:
            material_ids.add(layer.material_id)
        for reinf in request_dto.reinforcements:
            material_ids.add(reinf.material_id)

        # 2. Fetch all materials from DB
        stmt = select(Material).where(Material.id.in_(material_ids))
        result = await db.execute(stmt)
        materials_map: Dict[int, Material] = {m.id: m for m in result.scalars().all()}

        # Validate that all requested materials exist
        for m_id in material_ids:
            if m_id not in materials_map:
                raise ValueError(f"Material with ID {m_id} not found in database.")

        # 3. Process layers and compute their mass and thermal parameters
        db_layers: List[WallLayer] = []
        components_list = []  # For carbon and energy
        resistance_layers = []  # For thermal resistance

        for layer_req in request_dto.layers:
            material = materials_map[layer_req.material_id]
            
            # Density override or default density
            density = layer_req.density_override if layer_req.density_override is not None else material.density
            if density is None:
                raise ValueError(
                    f"Density for material {material.name} (ID {material.id}) is not defined in DB "
                    f"and no override was provided."
                )

            # Mass calculation
            mass = math_engine.calculate_layer_mass(Decimal(str(density)), Decimal(str(layer_req.thickness)))
            
            db_layers.append(
                WallLayer(
                    material_id=layer_req.material_id,
                    thickness=layer_req.thickness,
                    mass=mass,
                    is_reinforcement=False
                )
            )

            # Add to carbon & energy components
            components_list.append({
                "mass": mass,
                "carbon_emission_factor": material.carbon_emission_factor,
                "embodied_energy": material.embodied_energy
            })

            # Add to thermal resistance layers
            if material.thermal_conductivity is None:
                raise ValueError(
                    f"Thermal conductivity for material {material.name} (ID {material.id}) "
                    f"is not defined in DB, but it is used as a thermal layer."
                )
            resistance_layers.append({
                "thickness": layer_req.thickness,
                "thermal_conductivity": material.thermal_conductivity
            })

        # 4. Process reinforcements
        for reinf_req in request_dto.reinforcements:
            material = materials_map[reinf_req.material_id]
            db_layers.append(
                WallLayer(
                    material_id=reinf_req.material_id,
                    thickness=None,
                    mass=reinf_req.mass,
                    is_reinforcement=True
                )
            )

            # Add to carbon & energy components
            components_list.append({
                "mass": reinf_req.mass,
                "carbon_emission_factor": material.carbon_emission_factor,
                "embodied_energy": material.embodied_energy
            })

        # 5. Execute calculations using pure math engine
        thermal_resistance = math_engine.calculate_thermal_resistance(resistance_layers)
        total_carbon_per_sqm = math_engine.calculate_carbon_emissions(components_list)
        total_energy_per_sqm = math_engine.calculate_embodied_energy(components_list)
        
        annual_heat_loss_per_sqm = math_engine.calculate_heat_loss_per_sqm(
            request_dto.gsop, thermal_resistance
        )
        total_annual_heat_loss = annual_heat_loss_per_sqm * request_dto.wall_area
        
        annual_gas_per_sqm = math_engine.calculate_gas_consumption_per_sqm(annual_heat_loss_per_sqm)
        total_annual_gas = annual_gas_per_sqm * request_dto.wall_area
        
        total_mass_per_sqm = sum(layer.mass for layer in db_layers)

        # 6. Save calculation and layers to database
        calculation = WallCalculation(
            gsop=request_dto.gsop,
            wall_area=request_dto.wall_area,
            total_mass_per_sqm=total_mass_per_sqm,
            thermal_resistance=thermal_resistance,
            total_carbon_per_sqm=total_carbon_per_sqm,
            total_energy_per_sqm=total_energy_per_sqm,
            annual_heat_loss_per_sqm=annual_heat_loss_per_sqm,
            total_annual_heat_loss=total_annual_heat_loss,
            annual_gas_per_sqm=annual_gas_per_sqm,
            total_annual_gas=total_annual_gas,
            layers=db_layers
        )

        db.add(calculation)
        await db.commit()
        
        # Refresh and load relationships to return full structure
        stmt = (
            select(WallCalculation)
            .options(selectinload(WallCalculation.layers).selectinload(WallLayer.material))
            .where(WallCalculation.id == calculation.id)
        )
        refresh_result = await db.execute(stmt)
        return refresh_result.scalar_one()
