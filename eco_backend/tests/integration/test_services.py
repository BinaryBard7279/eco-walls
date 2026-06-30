import pytest
from decimal import Decimal
from sqlalchemy.future import select
from app.db.models import Material, WallCalculation
from app.schemas.calculations import CalculationRequestDTO, LayerRequestDTO, ReinforcementRequestDTO
from app.services.calculation_service import CalculationService

@pytest.mark.asyncio
async def test_process_wall_data_success(db_session):
    # 1. Silicate brick masonry (ID 147)
    # 2. Ceramic brick masonry (ID 145)
    # 3. Steel weld mesh (ID 160)
    dto = CalculationRequestDTO(
        gsop=4000,
        wall_area=Decimal("100.0"),
        layers=[
            LayerRequestDTO(material_id=147, thickness=Decimal("0.25")),
            LayerRequestDTO(material_id=145, thickness=Decimal("0.12"))
        ],
        reinforcements=[
            ReinforcementRequestDTO(material_id=160, mass=Decimal("2.0"))
        ]
    )
    
    # Process
    calc = await CalculationService.process_wall_data(db_session, dto)
    
    # Verify results in returned object
    # Silicate mass: 1800 * 0.25 = 450 kg
    # Ceramic mass: 1400 * 0.12 = 168 kg
    # Reinforcement mass: 2 kg
    # Total mass: 450 + 168 + 2 = 620 kg
    assert calc.total_mass_per_sqm == Decimal("620.0")
    assert len(calc.layers) == 3
    
    # Verify it is saved in DB
    result = await db_session.execute(
        select(WallCalculation).where(WallCalculation.id == calc.id)
    )
    saved_calc = result.scalar_one_or_none()
    assert saved_calc is not None
    assert saved_calc.total_mass_per_sqm == Decimal("620.0")

@pytest.mark.asyncio
async def test_process_wall_data_override(db_session):
    # Mineral wool (ID 30) default density is 80
    # Let's override to 100
    dto = CalculationRequestDTO(
        gsop=4000,
        wall_area=Decimal("100.0"),
        layers=[
            LayerRequestDTO(material_id=30, thickness=Decimal("0.10"), density_override=Decimal("100.0"))
        ],
        reinforcements=[]
    )
    
    calc = await CalculationService.process_wall_data(db_session, dto)
    
    # Mass must be 100 * 0.10 = 10 kg, not 80 * 0.10 = 8 kg
    assert calc.total_mass_per_sqm == Decimal("10.0")
    assert calc.layers[0].mass == Decimal("10.0")

@pytest.mark.asyncio
async def test_process_wall_data_failure_invalid_material(db_session):
    # Use material ID 999999 (which does not exist)
    dto = CalculationRequestDTO(
        gsop=4000,
        wall_area=Decimal("100.0"),
        layers=[
            LayerRequestDTO(material_id=999999, thickness=Decimal("0.25"))
        ],
        reinforcements=[]
    )
    
    with pytest.raises(ValueError, match="Material with ID 999999 not found in database"):
        await CalculationService.process_wall_data(db_session, dto)

@pytest.mark.asyncio
async def test_db_seed_completeness(db_session):
    result = await db_session.execute(select(Material))
    materials = result.scalars().all()
    assert len(materials) == 174

