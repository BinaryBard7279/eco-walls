import pytest
from decimal import Decimal
from httpx import AsyncClient, ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_calculate_success():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "gsop": 4378,
            "wall_area": 620.00,
            "layers": [
                {
                    "material_id": 147,
                    "thickness": 0.25
                },
                {
                    "material_id": 30,
                    "thickness": 0.10,
                    "density_override": 100.0
                },
                {
                    "material_id": 145,
                    "thickness": 0.12
                }
            ],
            "reinforcements": [
                {
                    "material_id": 160,
                    "mass": 1.5
                }
            ]
        }
        
        response = await ac.post("/api/v1/calculate", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert "id" in data
        assert Decimal(str(data["total_mass_per_sqm"])) == Decimal("629.5")
        assert Decimal(str(data["total_carbon_per_sqm"])) == Decimal("124.89")
        assert Decimal(str(data["total_energy_per_sqm"])) == Decimal("1514.15")

@pytest.mark.asyncio
async def test_calculate_validation_errors():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Negative thickness
        payload_neg_thickness = {
            "gsop": 4378,
            "wall_area": 620.00,
            "layers": [
                {
                    "material_id": 147,
                    "thickness": -0.1
                }
            ],
            "reinforcements": []
        }
        response = await ac.post("/api/v1/calculate", json=payload_neg_thickness)
        assert response.status_code == 422
        
        # Zero GSOP
        payload_zero_gsop = {
            "gsop": 0,
            "wall_area": 620.00,
            "layers": [
                {
                    "material_id": 147,
                    "thickness": 0.25
                }
            ],
            "reinforcements": []
        }
        response = await ac.post("/api/v1/calculate", json=payload_zero_gsop)
        assert response.status_code == 422

@pytest.mark.asyncio
async def test_list_materials_and_search():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Fetch all materials
        response = await ac.get("/api/v1/materials")
        assert response.status_code == 200
        data = response.json()
        assert len(data) > 0
        
        # Check float/int serialization
        first_material = data[0]
        assert "carbon_emission_factor" in first_material
        assert isinstance(first_material["carbon_emission_factor"], (float, int))
        
        # Search for silicate brick
        response_search = await ac.get("/api/v1/materials", params={"search": "силикатного кирпича"})
        assert response_search.status_code == 200
        search_data = response_search.json()
        assert len(search_data) > 0
        for mat in search_data:
            assert "силикатного кирпича" in mat["name"].lower()
