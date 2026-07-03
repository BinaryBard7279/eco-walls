const CITIES = [
  { name: "Москва", hdd: 4943 },
  { name: "Санкт-Петербург", hdd: 4797 },
  { name: "Новосибирск", hdd: 6180 },
  { name: "Екатеринбург", hdd: 5594 },
  { name: "Нижний Новгород", hdd: 5219 },
  { name: "Казань", hdd: 5066 },
  { name: "Челябинск", hdd: 5602 },
  { name: "Самара", hdd: 5036 },
  { name: "Омск", hdd: 6021 },
  { name: "Ростов-на-Дону", hdd: 3697 },
  { name: "Уфа", hdd: 5312 },
  { name: "Красноярск", hdd: 6135 },
  { name: "Воронеж", hdd: 4643 },
  { name: "Пермь", hdd: 5773 },
  { name: "Брянск", hdd: 4378 },
  { name: "Краснодар", hdd: 3180 },
  { name: "Владивосток", hdd: 5048 },
  { name: "Мурманск", hdd: 6820 },
  { name: "Сочи", hdd: 1473 },
  { name: "Якутск", hdd: 10250 }
];

const BACKEND_URL = "http://localhost:8000/api/v1";

function getMaterialCategory(id, name) {
  const idNum = parseInt(id);
  if (id === '159') {
    return {
      category: "Черные металлы и арматура",
      color: "#787a7c",
      patternClass: "pat-black-metal"
    };
  }
  
  if ((idNum >= 1 && idNum <= 26) || idNum === 71 || idNum === 72 || idNum === 80 || idNum === 175) {
    return {
      category: "Полимерные пены",
      color: idNum % 3 === 0 ? "#f1f5f9" : (idNum % 3 === 1 ? "#c9dae6" : "#ffe3d1"),
      patternClass: "pat-polymer-foam"
    };
  }
  if ((idNum >= 27 && idNum <= 43) || (idNum >= 52 && idNum <= 61) || (idNum >= 75 && idNum <= 79)) {
    return {
      category: "Волокнистые утеплители",
      color: idNum % 2 === 0 ? "#ede2b6" : "#e3dfd5",
      patternClass: "pat-fibrous-wool"
    };
  }
  if ((idNum >= 93 && idNum <= 102) || (idNum >= 135 && idNum <= 137) || idNum === 174) {
    return {
      category: "Тяжелый бетон и растворы",
      color: idNum % 2 === 0 ? "#b9bdc0" : "#c5c9cc",
      patternClass: "pat-heavy-concrete"
    };
  }
  if (idNum >= 103 && idNum <= 132) {
    return {
      category: "Пористые блоки и легкий бетон",
      color: idNum % 2 === 0 ? "#e3e0dc" : "#c8c4bc",
      patternClass: "pat-porous-concrete"
    };
  }
  if (idNum === 133 || idNum === 134 || (idNum >= 141 && idNum <= 150) || idNum === 176) {
    return {
      category: "Кирпич и керамика",
      color: idNum % 2 === 0 ? "#d2a78f" : "#d6d4d2",
      patternClass: "pat-brick-ceramics"
    };
  }
  if ((idNum >= 47 && idNum <= 51) || idNum === 73 || idNum === 74 || (idNum >= 151 && idNum <= 156)) {
    return {
      category: "Натуральное дерево и древесные плиты",
      color: idNum % 2 === 0 ? "#d0b898" : "#dfcaa7",
      patternClass: "pat-natural-wood"
    };
  }
  if ((idNum >= 66 && idNum <= 70) || (idNum >= 83 && idNum <= 92)) {
    return {
      category: "Сыпучие минералы (Гранулы)",
      color: idNum % 2 === 0 ? "#cbbaa9" : "#e8dcbe",
      patternClass: "pat-loose-granules"
    };
  }
  if (idNum === 62 || idNum === 63 || idNum === 64 || idNum === 65 || (idNum >= 138 && idNum <= 140) || idNum === 157 || idNum === 158 || idNum === 172 || idNum === 173) {
    return {
      category: "Гладкие листовые покрытия / Штукатурка",
      color: idNum % 2 === 0 ? "#eae7df" : "#f3f0e8",
      patternClass: "pat-gypsum-plaster"
    };
  }
  if ((idNum >= 159 && idNum <= 163) || (idNum >= 169 && idNum <= 171)) {
    return {
      category: "Черные металлы и арматура",
      color: "#787a7c",
      patternClass: "pat-black-metal"
    };
  }
  if (idNum === 164 || idNum === 167) {
    return {
      category: "Цветные и блестящие металлы",
      color: idNum === 164 ? "#d2d5d8" : "#d98f70",
      patternClass: "pat-shiny-metal"
    };
  }
  if ((idNum >= 44 && idNum <= 46) || idNum === 81 || idNum === 82 || idNum === 168) {
    return {
      category: "Специфические композиты и стекло",
      color: idNum % 2 === 0 ? "#d4e6f1" : "#bfccd6",
      patternClass: "pat-composites-glass"
    };
  }
  
  return {
    category: "Другие материалы",
    color: "#e2e8f0",
    patternClass: "pat-default"
  };
}

export const api = {
  async getMaterials() {
    const response = await fetch(`${BACKEND_URL}/materials`);
    if (!response.ok) {
      throw new Error("Failed to fetch materials from backend");
    }
    const backendMaterials = await response.json();
    
    // Map backend response to the schema expected by frontend
    return backendMaterials.map(m => {
      const visualProps = getMaterialCategory(m.id, m.name);
      return {
        id: String(m.id),
        name: m.name,
        density: m.density,
        lambda: m.thermal_conductivity,
        carbon: m.carbon_emission_factor,
        energy: m.embodied_energy,
        category: visualProps.category,
        color: visualProps.color,
        patternClass: visualProps.patternClass
      };
    });
  },

  async getCities() {
    return Promise.resolve(JSON.parse(JSON.stringify(CITIES)));
  },

  async calculateWallMetrics(stateData) {
    // Construct the payload for backend POST /api/v1/calculate
    const payload = {
      gsop: stateData.hdd,
      wall_area: stateData.wallArea,
      layers: stateData.layers.map(l => ({
        material_id: parseInt(l.materialId),
        thickness: l.thickness,
        density_override: null
      })),
      reinforcements: stateData.reinforcementMass > 0 ? [{
        material_id: 159, // Стальная арматура
        mass: stateData.reinforcementMass
      }] : []
    };

    const response = await fetch(`${BACKEND_URL}/calculate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.detail || "Failed to calculate wall metrics");
    }

    const data = await response.json();

    // Map backend response properties back to frontend formats
    const R0 = Number(data.thermal_resistance);
    const weight = Number(data.total_mass_per_sqm);
    const co2 = Number(data.total_carbon_per_sqm);
    const energy = Number(data.total_energy_per_sqm);
    const reqR = 0.00035 * stateData.hdd + 1.4;
    const meetsNorm = R0 >= reqR;
    const totalCO2 = co2 * (stateData.wallArea || 0);

    // Calculate payback text (equivalent to local calculation logic)
    let paybackText = "Более 100 лет (избыточно)";
    if (co2 > 0) {
      const q_st_year = Number(data.annual_heat_loss_per_sqm);
      const q_uninsulated = 0.024 * stateData.hdd / 0.5;
      const q_saved = Math.max(0, q_uninsulated - q_st_year);
      const gas_saved = q_saved / (9.3 * 0.9);
      const co2_saved_annual = gas_saved * 1.85;
      if (co2_saved_annual > 0) {
        const years = Math.round(co2 / co2_saved_annual);
        if (years <= 100) {
          paybackText = `${years} лет`;
        }
      }
    } else {
      paybackText = "0 лет";
    }

    return {
      R0,
      weight,
      co2,
      energy,
      reqR,
      meetsNorm,
      totalCO2,
      paybackText,
      q_st_year: Number(data.annual_heat_loss_per_sqm),
      q_year: Number(data.total_annual_heat_loss),
      v1: Number(data.annual_gas_per_sqm),
      v_total: Number(data.total_annual_gas)
    };
  }
};
