const STORE_KEY = "eco-project-v1";
const uid = () => Math.random().toString(36).slice(2);

const defaultState = {
  currentStep: 1,
  hdd: 4500,
  wallArea: 204,
  layers: [],
  reinforcementMass: 2.5,
  calcInsulationClass: 'norm',
  calcInsulationValue: 'req',
  efficiencyVariant: 1,
  activeStep2Tab: 'constructor',
  isManualHdd: false,
  comfortR: null
};

export const state = {
  // Справочники
  materials: [],
  cities: [],
  materialsMap: new Map(),
  materialsByCategory: {},

  // Параметры сессии пользователя
  currentStep: defaultState.currentStep,
  hdd: defaultState.hdd,
  wallArea: defaultState.wallArea,
  layers: [],
  reinforcementMass: defaultState.reinforcementMass,
  prevReinforcementMass: 2.5,
  calcInsulationClass: defaultState.calcInsulationClass,
  calcInsulationValue: defaultState.calcInsulationValue,
  efficiencyVariant: defaultState.efficiencyVariant,
  activeStep2Tab: defaultState.activeStep2Tab,
  isManualHdd: defaultState.isManualHdd,
  comfortR: defaultState.comfortR,
  dbSearchQuery: '',

  initLists(materials, cities) {
    this.materials = materials;
    this.cities = cities;
    this.materialsMap = new Map(materials.map(m => [m.id, m]));
    
    this.materialsByCategory = {};
    materials.forEach((mat) => {
      if (!this.materialsByCategory[mat.category]) {
        this.materialsByCategory[mat.category] = [];
      }
      this.materialsByCategory[mat.category].push(mat);
    });
  },

  loadState() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.keys(defaultState).forEach(key => {
          if (parsed[key] !== undefined) {
            this[key] = parsed[key];
          }
        });
        if (parsed.prevReinforcementMass !== undefined) {
          this.prevReinforcementMass = parsed.prevReinforcementMass;
        }
        // Validate that all loaded layers have valid materials in the database, otherwise reset
        const invalid = this.layers.some(l => !this.materialsMap.has(l.materialId));
        if (invalid || !this.layers.length) {
          console.warn("Detected invalid or old mock material IDs in localStorage, resetting state to defaults.");
          this.resetToDefaults();
        }
      } else {
        this.resetToDefaults();
      }
    } catch (e) {
      console.error("Ошибка чтения локального состояния", e);
      this.resetToDefaults();
    }
  },

  resetToDefaults() {
    this.currentStep = defaultState.currentStep;
    this.hdd = defaultState.hdd;
    this.wallArea = defaultState.wallArea;
    this.layers = [
      { id: uid(), materialId: "144", density: 1600, thickness: 0.2 },
      { id: uid(), materialId: "29", density: 120, thickness: 0.2 }
    ];
    this.reinforcementMass = defaultState.reinforcementMass;
    this.prevReinforcementMass = 2.5;
    this.calcInsulationClass = defaultState.calcInsulationClass;
    this.calcInsulationValue = defaultState.calcInsulationValue;
    this.efficiencyVariant = defaultState.efficiencyVariant;
    this.activeStep2Tab = defaultState.activeStep2Tab;
    this.isManualHdd = defaultState.isManualHdd;
    this.comfortR = defaultState.comfortR;
  },

  saveState() {
    try {
      const toSave = {
        currentStep: this.currentStep,
        hdd: this.hdd,
        wallArea: this.wallArea,
        layers: this.layers,
        reinforcementMass: this.reinforcementMass,
        prevReinforcementMass: this.prevReinforcementMass,
        calcInsulationClass: this.calcInsulationClass,
        calcInsulationValue: this.calcInsulationValue,
        efficiencyVariant: this.efficiencyVariant,
        activeStep2Tab: this.activeStep2Tab,
        isManualHdd: this.isManualHdd,
        comfortR: this.comfortR
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.error("Ошибка сохранения локального состояния", e);
    }
  },

  setStep(stepId) {
    this.currentStep = stepId;
    this.saveState();
  },

  setHdd(val) {
    this.hdd = Number(val);
    this.isManualHdd = true;
  },

  setWallArea(val) {
    this.wallArea = Number(val);
  },

  setComfortR(rVal) {
    this.comfortR = rVal;
    this.saveState();
  },

  setReinforcement(val) {
    this.reinforcementMass = Number(val);
    this.saveState();
  },

  toggleReinforcementSwitch() {
    if (this.reinforcementMass > 0) {
      this.prevReinforcementMass = this.reinforcementMass;
      this.reinforcementMass = 0;
    } else {
      this.reinforcementMass = this.prevReinforcementMass || 2.5;
    }
    this.saveState();
  },

  updateReinforcementFromV1(val) {
    this.reinforcementMass = Math.max(0, Number(val));
    this.saveState();
  },

  addLayer() {
    if (this.layers.length >= 5) return false;
    const m = this.materials[0];
    this.layers.push({ id: uid(), materialId: m.id, density: m.density, thickness: 0.2 });
    this.saveState();
    return true;
  },

  removeLayer(id) {
    if (this.layers.length <= 1) return false;
    this.layers = this.layers.filter(l => l.id !== id);
    this.saveState();
    return true;
  },

  updateLayer(id, updates) {
    this.layers = this.layers.map(l => l.id === id ? { ...l, ...updates } : l);
  },

  moveLayer(id, dir) {
    const i = this.layers.findIndex(l => l.id === id);
    if (i < 0) return false;
    const j = i + dir;
    if (j < 0 || j >= this.layers.length) return false;
    
    const temp = this.layers[i];
    this.layers[i] = this.layers[j];
    this.layers[j] = temp;
    this.saveState();
    return true;
  },

  moveLayerByIndex(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.layers.length || toIndex < 0 || toIndex >= this.layers.length) return false;
    const temp = this.layers[fromIndex];
    this.layers.splice(fromIndex, 1);
    this.layers.splice(toIndex, 0, temp);
    this.saveState();
    return true;
  },

  loadPresetWall(presetId) {
    if (presetId === 'brick_wool') {
      this.layers = [
        { id: uid(), materialId: "147", density: 1800, thickness: 0.25 },
        { id: uid(), materialId: "29", density: 120, thickness: 0.12 }
      ];
    } else if (presetId === 'aerated_concrete') {
      this.layers = [
        { id: uid(), materialId: "133", density: 500, thickness: 0.4 }
      ];
    } else if (presetId === 'eco_wood') {
      this.layers = [
        { id: uid(), materialId: "152", density: 500, thickness: 0.15 },
        { id: uid(), materialId: "30", density: 80, thickness: 0.15 },
        { id: uid(), materialId: "65", density: 800, thickness: 0.012 }
      ];
    }
    this.currentStep = 2;
    this.saveState();
  },

  setStep2Tab(tabId) {
    this.activeStep2Tab = tabId;
    this.saveState();
  },

  selectRegion(name, hdd) {
    if (name === 'manual') {
      this.isManualHdd = true;
    } else {
      this.isManualHdd = false;
      this.hdd = hdd;
    }
    this.saveState();
  },

  reset() {
    this.resetToDefaults();
    this.saveState();
  }
};
