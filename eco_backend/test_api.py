import pytest
from decimal import Decimal
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)

def test_calculation():
    # Construct calculation payload based on the technical specification example:
    # 1. Silicate brick masonry (ID 147): delta = 0.25 m (default density 1800 kg/m3)
    # 2. Mineral wool insulation (ID 30): delta = 0.10 m, density override = 100 kg/m3
    # 3. Ceramic brick masonry (ID 145): delta = 0.12 m (default density 1400 kg/m3)
    # 4. Steel reinforcement mesh (ID 160): mass = 1.5 kg per 1 m2
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

    response = client.post("/api/v1/calculate", json=payload)
    assert response.status_code == 201, f"Failed: {response.text}"
    
    data = response.json()
    print("Response Data:")
    import json
    print(json.dumps(data, indent=2))

    # Assertions based on the technical specification example results:
    # Total mass per sqm = 450 + 10 + 168 + 1.5 = 629.5 kg
    assert Decimal(str(data["total_mass_per_sqm"])) == Decimal("629.5")
    
    # Thermal resistance = 0.15841 + 0.25/1.05 + 0.10/0.045 + 0.12/0.58 = 2.8256...
    # Let's assert it is within small tolerance of 2.826
    assert abs(Decimal(str(data["thermal_resistance"])) - Decimal("2.826")) < Decimal("0.001")

    
    # Carbon emissions = 450*0.138 + 10*1.26 + 168*0.28 + 1.5*2.10 = 62.10 + 12.60 + 47.04 + 3.15 = 124.89
    # Wait, the example in the text used slightly different carbon factors (450*0.144 + 10*1.26 + 168*0.28 + 1.5*2.3 = 64.8 + 12.6 + 47.04 + 3.45 = 127.89).
    # But with our database factors (row 147 carbon=0.138, row 160 carbon=2.10):
    # C_A1_A3 = 450*0.138 + 10*1.26 + 168*0.28 + 1.5*2.10 = 62.1 + 12.6 + 47.04 + 3.15 = 124.89 kgCO2/m2.
    assert Decimal(str(data["total_carbon_per_sqm"])) == Decimal("124.89")
    
    # Embodied energy = 450*1.565 + 10*24.5 + 168*3.15 + 1.5*23.8 = 704.25 + 245.0 + 529.2 + 35.7 = 1514.15 MJ/m2
    # Wait, the example in the text used slightly different energy factors (450*1.621 + 10*24.5 + 168*3.15 + 1.5*24.5 = 729.45 + 245 + 529.2 + 36.75 = 1540.4).
    # Let's check our database energy values for row 147 (1.565) and row 160 (23.8):
    # E_A1_A3 = 450*1.565 + 10*24.5 + 168*3.15 + 1.5*23.8 = 1514.15 MJ/m2.
    assert Decimal(str(data["total_energy_per_sqm"])) == Decimal("1514.15")

    # Heat loss per sqm = 0.024 * 4378 * 1 / R_0 = 105.072 / 2.825624... = 37.185...
    # Total heat loss = 37.185... * 620 = 23054.95...
    # Gas consumption per sqm = 37.185... / 8.37 = 4.4427...
    # Total gas = 4.4427... * 620 = 2754.47...
    assert abs(Decimal(str(data["annual_heat_loss_per_sqm"])) - Decimal("37.185")) < Decimal("0.01")
    assert abs(Decimal(str(data["annual_gas_per_sqm"])) - Decimal("4.443")) < Decimal("0.01")

    
    print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    test_calculation()
