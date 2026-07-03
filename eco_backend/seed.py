import json
import re
from decimal import Decimal
from app.db.session import sync_engine, sync_session_maker
from app.db.models import Base, Material

def parse_density(d_str):
    if d_str in ("-", "--", ""):
        return None
    if d_str.startswith("до "):
        return Decimal(d_str[3:].replace(",", "."))
    if "-" in d_str or "–" in d_str:
        # Range, compute average
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

def seed_database():
    # Create tables in the database if they don't exist
    Base.metadata.create_all(bind=sync_engine)
    print("Tables created successfully.")

    # Load parsed JSON
    json_path = "C:/Users/Nick/.gemini/antigravity-cli/brain/901fc9c1-a1e8-4082-87a2-05aaa03b04c3/scratch/parsed_materials_heuristic.json"
    with open(json_path, "r", encoding="utf-8") as f:
        materials_data = json.load(f)

    db = sync_session_maker()
    try:
        for item in materials_data:
            id_str = item["id"]
            if id_str == "133*":
                material_id = 176
            else:
                material_id = int(id_str)
                
            name = item["name"]
            # Clean up LaTeX formulas to make names user-friendly in the UI
            name = name.replace("$150\\text{ г}$ на $1\\text{ м}^2$", "150 г на 1 м²")
            name = name.replace("$V_в = 12\\,\\%$", "Vв=12%")
            name = name.replace("$37\\,\\%$", "37%")
            
            density_raw = item["density_raw"]
            
            # Make the name unique by appending density info if available
            if density_raw not in ("-", "--", ""):
                name = f"{name} (ρ={density_raw})"
                
            density = parse_density(density_raw)
            thermal_conductivity = parse_conductivity(item["conductivity_raw"])
            carbon_emission_factor = parse_val(item["carbon_raw"])
            embodied_energy = parse_val(item["energy_raw"])
            
            # Upsert logic
            existing = db.query(Material).filter(Material.id == material_id).first()
            if existing:
                existing.name = name
                existing.density = density
                existing.thermal_conductivity = thermal_conductivity
                existing.carbon_emission_factor = carbon_emission_factor
                existing.embodied_energy = embodied_energy
            else:
                mat = Material(
                    id=material_id,
                    name=name,
                    density=density,
                    thermal_conductivity=thermal_conductivity,
                    carbon_emission_factor=carbon_emission_factor,
                    embodied_energy=embodied_energy
                )
                db.add(mat)
        db.commit()
        print(f"Database seeded successfully with {len(materials_data)} materials.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
