from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.session import get_async_db
from app.db.models import Material, WallCalculation, WallLayer
from app.schemas.calculations import CalculationRequestDTO, CalculationResponseDTO
from app.services.calculation_service import CalculationService

router = APIRouter()

@router.post(
    "/calculate",
    response_model=CalculationResponseDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Calculate thermal and environmental parameters of a wall structure"
)
async def calculate_wall_parameters(
    request_dto: CalculationRequestDTO,
    db: AsyncSession = Depends(get_async_db)
):
    try:
        result = await CalculationService.process_wall_data(db, request_dto)
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {str(e)}"
        )

@router.get(
    "/materials",
    summary="List all available construction materials"
)
async def list_materials(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_async_db)
):
    try:
        stmt = select(Material)
        if search:
            stmt = stmt.where(Material.name.ilike(f"%{search}%"))
        stmt = stmt.order_by(Material.id)
        result = await db.execute(stmt)
        materials = result.scalars().all()
        return [
            {
                "id": m.id,
                "name": m.name,
                "density": float(m.density) if m.density is not None else None,
                "thermal_conductivity": float(m.thermal_conductivity) if m.thermal_conductivity is not None else None,
                "carbon_emission_factor": float(m.carbon_emission_factor),
                "embodied_energy": float(m.embodied_energy)
            }
            for m in materials
        ]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get(
    "/calculations/{calculation_id}",
    response_model=CalculationResponseDTO,
    summary="Retrieve a specific calculation by its UUID"
)
async def get_calculation(
    calculation_id: UUID,
    db: AsyncSession = Depends(get_async_db)
):
    stmt = (
        select(WallCalculation)
        .options(selectinload(WallCalculation.layers).selectinload(WallLayer.material))
        .where(WallCalculation.id == calculation_id)
    )
    result = await db.execute(stmt)
    calculation = result.scalar_one_or_none()
    if not calculation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Calculation with ID {calculation_id} not found."
        )
    return calculation

