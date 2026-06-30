import pytest
from decimal import Decimal
from app.services import math_engine

# 1. Test calculate_layer_mass
@pytest.mark.parametrize(
    "density, thickness, expected",
    [
        (Decimal("1800"), Decimal("0.25"), Decimal("450")),
        (Decimal("80"), Decimal("0.10"), Decimal("8")),
        (Decimal("1400"), Decimal("0.12"), Decimal("168")),
    ]
)
def test_calculate_layer_mass(density, thickness, expected):
    result = math_engine.calculate_layer_mass(density, thickness)
    assert result == expected
    assert isinstance(result, Decimal)


# 2. Test calculate_thermal_resistance
@pytest.mark.parametrize(
    "layers, r_surface, expected",
    [
        (
            [
                {"thickness": Decimal("0.25"), "thermal_conductivity": Decimal("1.05")},
                {"thickness": Decimal("0.10"), "thermal_conductivity": Decimal("0.045")},
                {"thickness": Decimal("0.12"), "thermal_conductivity": Decimal("0.58")}
            ],
            Decimal("0.15841"),
            Decimal("0.15841") + (Decimal("0.25") / Decimal("1.05")) + (Decimal("0.1") / Decimal("0.045")) + (Decimal("0.12") / Decimal("0.58"))
        ),
        (
            [],
            Decimal("0.15841"),
            Decimal("0.15841")
        )
    ]
)
def test_calculate_thermal_resistance(layers, r_surface, expected):
    result = math_engine.calculate_thermal_resistance(layers, r_surface)
    assert result == expected
    assert isinstance(result, Decimal)


# 3. Test calculate_carbon_emissions
@pytest.mark.parametrize(
    "components, expected",
    [
        (
            [
                {"mass": Decimal("450"), "carbon_emission_factor": Decimal("0.138")},
                {"mass": Decimal("10"), "carbon_emission_factor": Decimal("1.26")},
                {"mass": Decimal("168"), "carbon_emission_factor": Decimal("0.28")},
                {"mass": Decimal("1.5"), "carbon_emission_factor": Decimal("2.10")}
            ],
            Decimal("450") * Decimal("0.138") + Decimal("10") * Decimal("1.26") + Decimal("168") * Decimal("0.28") + Decimal("1.5") * Decimal("2.10")
        ),
        ([], Decimal("0.0"))
    ]
)
def test_calculate_carbon_emissions(components, expected):
    result = math_engine.calculate_carbon_emissions(components)
    assert result == expected
    assert isinstance(result, Decimal)


# 4. Test calculate_embodied_energy
@pytest.mark.parametrize(
    "components, expected",
    [
        (
            [
                {"mass": Decimal("450"), "embodied_energy": Decimal("1.565")},
                {"mass": Decimal("10"), "embodied_energy": Decimal("24.5")},
                {"mass": Decimal("168"), "embodied_energy": Decimal("3.15")},
                {"mass": Decimal("1.5"), "embodied_energy": Decimal("23.8")}
            ],
            Decimal("450") * Decimal("1.565") + Decimal("10") * Decimal("24.5") + Decimal("168") * Decimal("3.15") + Decimal("1.5") * Decimal("23.8")
        ),
        ([], Decimal("0.0"))
    ]
)
def test_calculate_embodied_energy(components, expected):
    result = math_engine.calculate_embodied_energy(components)
    assert result == expected
    assert isinstance(result, Decimal)


# 5. Test calculate_heat_loss_per_sqm
@pytest.mark.parametrize(
    "gsop, r0_usl, expected",
    [
        (4378, Decimal("2.825624"), (Decimal("0.024") * Decimal("4378") * Decimal("1.0")) / Decimal("2.825624")),
        (3000, Decimal("1.5"), (Decimal("0.024") * Decimal("3000") * Decimal("1.0")) / Decimal("1.5")),
    ]
)
def test_calculate_heat_loss_per_sqm(gsop, r0_usl, expected):
    result = math_engine.calculate_heat_loss_per_sqm(gsop, r0_usl)
    assert result == expected
    assert isinstance(result, Decimal)

def test_calculate_heat_loss_negative():
    with pytest.raises(ValueError, match="Thermal resistance must be strictly positive"):
        math_engine.calculate_heat_loss_per_sqm(4378, Decimal("0.0"))
    
    with pytest.raises(ValueError, match="Thermal resistance must be strictly positive"):
        math_engine.calculate_heat_loss_per_sqm(4378, Decimal("-1.5"))


# 6. Test calculate_gas_consumption_per_sqm
@pytest.mark.parametrize(
    "q_year_sqm, h, kpd, expected",
    [
        (Decimal("37.185"), Decimal("9.3"), Decimal("0.9"), Decimal("37.185") / (Decimal("9.3") * Decimal("0.9"))),
        (Decimal("50.0"), Decimal("10.0"), Decimal("0.8"), Decimal("50.0") / (Decimal("10.0") * Decimal("0.8"))),
    ]
)
def test_calculate_gas_consumption_per_sqm(q_year_sqm, h, kpd, expected):
    result = math_engine.calculate_gas_consumption_per_sqm(q_year_sqm, h, kpd)
    assert result == expected
    assert isinstance(result, Decimal)
