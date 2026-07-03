const getMaterial = (id, materialsMap) => {
  return materialsMap.get(id) || Array.from(materialsMap.values())[0];
};

export function calculateTotalWeight(layers, reinforcementMass) {
  return layers.reduce((acc, l) => acc + (l.density * l.thickness), 0) + (reinforcementMass || 0);
}

export function calculateThermalResistance(layers, materialsMap) {
  const rSurfaces = (1 / 8.7) + (1 / 23);
  const rLayers = layers.reduce((acc, l) => {
    const mat = getMaterial(l.materialId, materialsMap);
    return acc + (l.thickness / mat.lambda);
  }, 0);
  return rLayers + rSurfaces;
}

export function calculateCarbonFootprint(layers, reinforcementMass, materialsMap) {
  const layersCO2 = layers.reduce((acc, l) => {
    const mat = getMaterial(l.materialId, materialsMap);
    return acc + (l.density * (l.thickness || 0) * mat.carbon);
  }, 0);
  const reCarbon = (reinforcementMass || 0) * getMaterial('159', materialsMap).carbon;
  return layersCO2 + reCarbon;
}

export function calculateEmbodiedEnergy(layers, reinforcementMass, materialsMap) {
  const layersEnergy = layers.reduce((acc, l) => {
    const mat = getMaterial(l.materialId, materialsMap);
    return acc + (l.density * (l.thickness || 0) * mat.energy);
  }, 0);
  const reEnergy = (reinforcementMass || 0) * getMaterial('159', materialsMap).energy;
  return layersEnergy + reEnergy;
}

export function calculateRequiredR(hdd) {
  return 0.00035 * hdd + 1.4;
}

export function calculatePaybackPeriod(layers, reinforcementMass, hdd, materialsMap) {
  const R0 = calculateThermalResistance(layers, materialsMap);
  const co2 = calculateCarbonFootprint(layers, reinforcementMass, materialsMap);
  if (co2 <= 0) return 0; // Уже в плюсе по экологии

  const q_st_year = 0.024 * hdd * 1 / R0;
  const q_uninsulated = 0.024 * hdd / 0.5;
  const q_saved = Math.max(0, q_uninsulated - q_st_year);
  const gas_saved = q_saved / (9.3 * 0.9);
  const co2_saved_annual = gas_saved * 1.85;
  
  return co2_saved_annual > 0 ? Math.round(co2 / co2_saved_annual) : 999;
}

export function getBreakdownScores(layers, reinforcementMass, hdd, materialsMap) {
  const R0 = calculateThermalResistance(layers, materialsMap);
  const req = calculateRequiredR(hdd);
  const ratio = req > 0 ? R0 / req : 0;
  const co2 = calculateCarbonFootprint(layers, reinforcementMass, materialsMap);
  const energy = calculateEmbodiedEnergy(layers, reinforcementMass, materialsMap);

  // 1. Теплозащита (50 баллов)
  let s_thermal = 0;
  if (ratio < 1.0) {
    s_thermal = 0;
  } else if (ratio <= 1.4) {
    s_thermal = 50;
  } else {
    s_thermal = Math.max(15, 50 - (ratio - 1.4) * 15);
  }

  // 2. Экологический след (30 баллов)
  let s_carbon = 0;
  if (co2 <= 15) {
    s_carbon = 30;
  } else if (co2 >= 120) {
    s_carbon = 0;
  } else {
    s_carbon = 30 - ((co2 - 15) / (120 - 15)) * 30;
  }

  // 3. Энергоемкость производства (20 баллов)
  let s_energy = 0;
  if (energy <= 150) {
    s_energy = 20;
  } else if (energy >= 1500) {
    s_energy = 0;
  } else {
    s_energy = 20 - ((energy - 150) / (1500 - 150)) * 20;
  }

  return { s_thermal, s_carbon, s_energy, ratio, co2, energy, reqR: req };
}

export function calculateEfficiencyScore(layers, reinforcementMass, hdd, materialsMap) {
  const { s_thermal, s_carbon, s_energy } = getBreakdownScores(layers, reinforcementMass, hdd, materialsMap);
  let score = s_thermal + s_carbon + s_energy;

  // 4. Дополнительный штраф за избыточный вес стены (перегрузка фундамента)
  const w = calculateTotalWeight(layers, reinforcementMass);
  if (w > 500) {
    const weightPenalty = Math.min(10, ((w - 500) / 500) * 10);
    score -= weightPenalty;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
