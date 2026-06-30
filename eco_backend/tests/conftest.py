import pytest
import asyncio
import json
import os
import re
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.config import settings
import app.db.session as db_module
from app.db.models import Base, Material
from app.main import app

def seed_db_sync(connection):
    session = Session(bind=connection)
    try:
        count = session.query(Material).count()
        if count == 174:
            return
            
        # If count is not 174, clear and seed
        session.query(Material).delete()
        
        json_path = "C:/Users/Nick/.gemini/antigravity-cli/brain/901fc9c1-a1e8-4082-87a2-05aaa03b04c3/scratch/parsed_materials_heuristic.json"
        if not os.path.exists(json_path):
            raise FileNotFoundError(f"Parsed materials JSON not found at {json_path}")
            
        with open(json_path, "r", encoding="utf-8") as f:
            materials_data = json.load(f)
            
        def parse_density(d_str):
            if d_str in ("-", "--", ""):
                return None
            if d_str.startswith("до "):
                return Decimal(d_str[3:].replace(",", "."))
            if "-" in d_str or "–" in d_str:
                parts = re.split(r'[-–]', d_str)
                v1 = Decimal(parts[0].replace(",", "."))
                v2 = Decimal(parts[1].replace(",", "."))
                return (v1 + v2) / 2
            return Decimal(d_str.replace(",", "."))

        def parse_conductivity(c_str):
            if c_str in ("-", "--", ""):
                return None
            return Decimal(c_str.replace(",", "."))

        def parse_val(v_str):
            return Decimal(v_str.replace(",", "."))

        for item in materials_data:
            id_str = item["id"]
            material_id = 176 if id_str == "133*" else int(id_str)
            name = item["name"]
            density_raw = item["density_raw"]
            if density_raw not in ("-", "--", ""):
                name = f"{name} (ρ={density_raw})"
                
            density = parse_density(density_raw)
            thermal_conductivity = parse_conductivity(item["conductivity_raw"])
            carbon_emission_factor = parse_val(item["carbon_raw"])
            embodied_energy = parse_val(item["energy_raw"])
            
            mat = Material(
                id=material_id,
                name=name,
                density=density,
                thermal_conductivity=thermal_conductivity,
                carbon_emission_factor=carbon_emission_factor,
                embodied_energy=embodied_energy
            )
            session.add(mat)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

@pytest.fixture(scope="function")
async def db_session():
    # Create a fresh engine and session maker for each test function
    engine = create_async_engine(settings.async_database_url, echo=False)
    session_maker = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    # Patch app.db.session globals
    db_module.async_engine = engine
    db_module.async_session_maker = session_maker
    
    # Ensure tables exist and are seeded
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await conn.run_sync(seed_db_sync)
        
    # Start the transactional test session
    async with session_maker() as session:
        await session.begin()
        
        async def mock_commit():
            await session.flush()
            
        session.commit = mock_commit
        
        yield session
        
        await session.rollback()
        
    await engine.dispose()

@pytest.fixture(scope="function", autouse=True)
def override_db_dependency(db_session):
    async def _get_test_db():
        yield db_session
    app.dependency_overrides[db_module.get_async_db] = _get_test_db
    yield
    app.dependency_overrides.pop(db_module.get_async_db, None)
