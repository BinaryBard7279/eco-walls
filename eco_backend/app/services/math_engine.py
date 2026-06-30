from decimal import Decimal

def calculate_layer_mass(density: Decimal, thickness: Decimal) -> Decimal:
    """
    Calculates mass of a layer per 1 m2.
    Formula: M_i = rho_i * delta_i
    """
    return density * thickness

def calculate_thermal_resistance(layers: list[dict], r_surface: Decimal = Decimal('0.15841')) -> Decimal:
    """
    Calculates conditional thermal resistance.
    Formula: R0_usl = r_surface + sum(delta_i / lambda_i)
    """
    sum_val = Decimal("0.0")
    for layer in layers:
        delta = Decimal(str(layer["thickness"]))
        lam = Decimal(str(layer["thermal_conductivity"]))
        sum_val += delta / lam
    return r_surface + sum_val

def calculate_carbon_emissions(components: list[dict]) -> Decimal:
    """
    Calculates carbon emissions per 1 m2.
    Formula: C_A1_A3 = sum(M_i * F_i)
    """
    sum_val = Decimal("0.0")
    for comp in components:
        mass = Decimal(str(comp["mass"]))
        factor = Decimal(str(comp["carbon_emission_factor"]))
        sum_val += mass * factor
    return sum_val

def calculate_embodied_energy(components: list[dict]) -> Decimal:
    """
    Calculates embodied energy per 1 m2.
    Formula: E_A1_A3 = sum(M_i * e_i)
    """
    sum_val = Decimal("0.0")
    for comp in components:
        mass = Decimal(str(comp["mass"]))
        energy = Decimal(str(comp["embodied_energy"]))
        sum_val += mass * energy
    return sum_val

def calculate_heat_loss_per_sqm(gsop: int, r0_usl: Decimal) -> Decimal:
    """
    Calculates annual transmission heat loss per 1 m2.
    Formula: Q_st_god = (0.024 * GSOP * 1) / R0_usl
    """
    if r0_usl <= 0:
        raise ValueError("Thermal resistance must be strictly positive")
    constant = Decimal("0.024")
    return (constant * Decimal(gsop) * Decimal("1.0")) / r0_usl

def calculate_gas_consumption_per_sqm(
    q_year_sqm: Decimal,
    h: Decimal = Decimal('9.3'),
    kpd: Decimal = Decimal('0.9')
) -> Decimal:
    """
    Calculates annual gas consumption per 1 m2.
    Formula: V_1 = Q_st_god / (h * kpd)
    """
    denominator = h * kpd
    return q_year_sqm / denominator

