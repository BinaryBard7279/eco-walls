import { api } from './api.js';
import { state } from './state.js';
import { ui, DOM } from './ui.js';
import * as Calc from './calculator.js';

function recalculateAndRefreshPreview() {
  const R0 = Calc.calculateThermalResistance(state.layers, state.materialsMap);
  const weight = Calc.calculateTotalWeight(state.layers, state.reinforcementMass);
  const co2 = Calc.calculateCarbonFootprint(state.layers, state.reinforcementMass, state.materialsMap);
  const energy = Calc.calculateEmbodiedEnergy(state.layers, state.reinforcementMass, state.materialsMap);
  const reqR = Calc.calculateRequiredR(state.hdd);

  window._calculatedMetricsForPreview = { R0, weight, co2, energy, reqR };
  ui.renderWallPreview('wall-preview-container-step2', state);
}

function triggerRender(firstPositions = []) {
  // 1. Calculate local metrics synchronously for instant UI updates (prevents drag lag and FLIP animation breakages)
  const R0 = Calc.calculateThermalResistance(state.layers, state.materialsMap);
  const weight = Calc.calculateTotalWeight(state.layers, state.reinforcementMass);
  const co2 = Calc.calculateCarbonFootprint(state.layers, state.reinforcementMass, state.materialsMap);
  const energy = Calc.calculateEmbodiedEnergy(state.layers, state.reinforcementMass, state.materialsMap);
  const reqR = Calc.calculateRequiredR(state.hdd);
  const meetsNorm = R0 >= reqR;
  const totalCO2 = co2 * (state.wallArea || 0);
  const payback_years = Calc.calculatePaybackPeriod(state.layers, state.reinforcementMass, state.hdd, state.materialsMap);
  const paybackText = payback_years > 100 ? "Более 100 лет (избыточно)" : `${payback_years} лет`;

  const q_st_year = 0.024 * state.hdd * 1 / R0;
  const q_year = q_st_year * (state.wallArea || 0);
  const v1 = q_st_year / (9.3 * 0.9);
  const v_total = v1 * (state.wallArea || 0);

  const localMetrics = {
    R0,
    weight,
    co2,
    energy,
    reqR,
    meetsNorm,
    totalCO2,
    paybackText,
    q_st_year,
    q_year,
    v1,
    v_total,
    score: Calc.calculateEfficiencyScore(state.layers, state.reinforcementMass, state.hdd, state.materialsMap)
  };

  window._calculatedMetricsForPreview = localMetrics;

  // Render synchronously
  ui.render(state, firstPositions);

  if (state.currentStep === 3) {
    ui.renderStep3WithMetrics(state, localMetrics);
  }

  // 2. Fetch official backend calculation in the background
  api.calculateWallMetrics(state)
    .then(backendMetrics => {
      backendMetrics.score = Calc.calculateEfficiencyScore(state.layers, state.reinforcementMass, state.hdd, state.materialsMap);
      window._calculatedMetricsForPreview = backendMetrics;

      if (state.currentStep === 3) {
        ui.renderStep3WithMetrics(state, backendMetrics);
      }
    })
    .catch(err => {
      console.warn("Background backend calculation failed, using local metrics:", err);
    });
}

function openEfficiencyModal() {
  const R0 = Calc.calculateThermalResistance(state.layers, state.materialsMap);
  const weight = Calc.calculateTotalWeight(state.layers, state.reinforcementMass);
  const co2 = Calc.calculateCarbonFootprint(state.layers, state.reinforcementMass, state.materialsMap);
  const energy = Calc.calculateEmbodiedEnergy(state.layers, state.reinforcementMass, state.materialsMap);
  const reqR = Calc.calculateRequiredR(state.hdd);
  const score = Calc.calculateEfficiencyScore(state.layers, state.reinforcementMass, state.hdd, state.materialsMap);
  const payback_years = Calc.calculatePaybackPeriod(state.layers, state.reinforcementMass, state.hdd, state.materialsMap);
  const paybackText = payback_years > 100 ? "Более 100 лет (избыточно)" : `${payback_years} лет`;

  const ratio = reqR > 0 ? R0 / reqR : 0;
  const breakdown = Calc.getBreakdownScores(state.layers, state.reinforcementMass, state.hdd, state.materialsMap);

  const tipsList = [];
  if (ratio < 1.0) {
    tipsList.push({
      status: "critical",
      label: "Критический дефицит тепла",
      desc: `Сопротивление R₀ (${R0.toFixed(2)}) ниже нормы (${reqR.toFixed(2)}) на ${Math.round((1 - ratio) * 100)}%. Увеличьте толщину утеплителя.`,
      icon: "alert-triangle",
      color: "text-red-500",
      bg: "bg-red-500/10"
    });
  } else if (ratio > 1.5) {
    tipsList.push({
      status: "warning",
      label: "Избыточное утепление",
      desc: `Толщина утеплителя превышает норму более чем на 50% (R₀ = ${R0.toFixed(2)} при норме ${reqR.toFixed(2)}). Вы можете уменьшить толщину на несколько сантиметров, сэкономив бюджет без ущерба для отопления.`,
      icon: "info",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    });
  } else {
    tipsList.push({
      status: "success",
      label: "Оптимальная теплозащита",
      desc: `Толщина утеплителя идеально подобрана под климатические условия региона (${state.hdd} ГСОП).`,
      icon: "check-circle-2",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    });
  }

  if (breakdown.s_carbon < 15) {
    tipsList.push({
      status: "ecology_critical",
      label: "Высокий углеродный след",
      desc: `Материалы с высоким выбросом CO₂ (${co2.toFixed(1)} кг/м²). Попробуйте заменить полимеры (XPS/PIR) на минеральную вату или уменьшить слой бетона.`,
      icon: "leaf",
      color: "text-orange-500",
      bg: "bg-orange-500/10"
    });
  } else {
    tipsList.push({
      status: "ecology_success",
      label: "Эко-баланс соблюден",
      desc: `Выбранные материалы обладают низким углеродным следом. Климатический след находится в пределах нормы.`,
      icon: "leaf",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    });
  }

  if (weight > 500) {
    tipsList.push({
      status: "weight_warning",
      label: "Избыточный вес конструкции",
      desc: `Общий вес 1 м² стены составляет ${weight.toFixed(0)} кг (порог нормы: 500 кг). Это создает повышенную нагрузку на фундамент здания, удорожая строительство.`,
      icon: "alert-triangle",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    });
  }

  const tipsHTML = tipsList.map(tip => `
    <div class="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-background/40">
      <div class="p-2 rounded-lg ${tip.bg} ${tip.color} shrink-0 mt-0.5">
        <i data-lucide="${tip.icon}" class="w-4 h-4"></i>
      </div>
      <div class="space-y-1">
        <span class="block text-sm font-bold text-foreground leading-tight">${tip.label}</span>
        <p class="text-xs text-muted-foreground leading-relaxed">${tip.desc}</p>
      </div>
    </div>
  `).join('');

  const metricsObj = {
    R0, weight, co2, energy, reqR, paybackText
  };

  ui.openEfficiencyModal(state, score, metricsObj, breakdown, tipsHTML);
}

function calcEstimatedArea() {
  const len = Number(document.getElementById('est-length')?.value || 10);
  const wid = Number(document.getElementById('est-width')?.value || 10);
  const floors = Number(document.getElementById('est-floors')?.value || 2);
  const height = Number(document.getElementById('est-height')?.value || 3);
  const glass = Number(document.getElementById('est-glass')?.value || 15);
  
  const glassLbl = document.getElementById('est-glass-lbl');
  if (glassLbl) glassLbl.innerText = `${glass}%`;
  
  const gross = 2 * (len + wid) * floors * height;
  const net = Math.round(gross * (1 - glass / 100));
  
  const res = document.getElementById('est-result-area');
  if (res) res.innerText = `${net} м²`;
  return net;
}

function initEvents() {
  // 1. Ввод ГСОП и Площади (с дебаунсом записи)
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target.id === 'input-hdd') {
      state.hdd = Number(target.value);
      state.isManualHdd = true;
      ui.renderStep1(state);
    } else if (target.id === 'input-area') {
      state.wallArea = Number(target.value);
      ui.renderStep1(state);
    }
  });

  document.addEventListener('change', (e) => {
    const target = e.target;
    if (target.id === 'input-hdd' || target.id === 'input-area') {
      state.saveState();
      triggerRender();
    }
  });

  document.addEventListener('blur', (e) => {
    const target = e.target;
    if (target.id === 'input-hdd' || target.id === 'input-area') {
      state.saveState();
      triggerRender();
    }
  }, true);

  // 2. Ввод в карточках слоев (Event Delegation + сохранение по изменению)
  document.addEventListener('input', (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (!id) return;

    if (target.classList.contains('layer-thickness')) {
      const thickness = Number(target.value) / 1000;
      state.updateLayer(id, { thickness });
      
      ui.updateSingleLayer(id, state.layers.find(l => l.id === id), state.materialsMap);
      recalculateAndRefreshPreview();
    } else if (target.classList.contains('layer-density')) {
      const density = Number(target.value);
      state.updateLayer(id, { density });
      
      ui.updateSingleLayer(id, state.layers.find(l => l.id === id), state.materialsMap);
      recalculateAndRefreshPreview();
    }
  });

  document.addEventListener('change', (e) => {
    const target = e.target;
    const id = target.dataset.id;
    if (id && (target.classList.contains('layer-thickness') || target.classList.contains('layer-density'))) {
      state.saveState();
      triggerRender(); // Полный перерасчет показателей и обновление таблицы верификации
    }
  });

  // 3. Поиск в выпадающих списках (предотвращение всплытия)
  document.addEventListener('input', (e) => {
    const target = e.target;
    if (target.classList.contains('dropdown-search-input')) {
      e.stopPropagation();
      ui.filterDropdown(target.dataset.id, target.value.toLowerCase());
    } else if (target.id === 'region-dropdown-search') {
      e.stopPropagation();
      ui.filterRegions(target.value.toLowerCase());
    } else if (target.id === 'db-materials-search') {
      e.stopPropagation();
      state.dbSearchQuery = target.value;
      ui.renderDatabaseTable(state, state.dbSearchQuery);
    }
  });

  // 4. Ограничение всплытия кликов внутри поиска, чтобы dropdown не закрывался
  document.addEventListener('click', (e) => {
    if (e.target.closest('.dropdown-search-input') || e.target.id === 'region-dropdown-search') {
      e.stopPropagation();
    }
  });

  // 5. Обработчики кликов (Глобальное делегирование)
  document.addEventListener('click', (e) => {
    const target = e.target;

    // Клик по логотипу или навигации по шагам
    const stepBtn = target.closest('.btn-step-nav');
    const logoLink = target.closest('#logo-link');
    if (logoLink || stepBtn) {
      e.preventDefault();
      const stepId = logoLink ? 1 : Number(stepBtn.getAttribute('data-step'));
      state.setStep(stepId);
      triggerRender();
      return;
    }

    // Свитч армирования
    if (target.closest('#reinforcement-switch-btn')) {
      state.toggleReinforcementSwitch();
      triggerRender();
      return;
    }

    // Вкладки Конструктор / Таблица
    if (target.closest('#tab-constructor')) {
      state.setStep2Tab('constructor');
      triggerRender();
      return;
    }
    if (target.closest('#tab-database')) {
      state.setStep2Tab('database');
      triggerRender();
      return;
    }

    // Начать заново
    if (target.closest('#btn-reset-construct') || target.closest('#btn-reset-results')) {
      state.reset();
      triggerRender();
      return;
    }

    // Добавить слой
    if (target.closest('#btn-add-layer')) {
      state.addLayer();
      triggerRender();
      return;
    }

    // Удалить слой
    const btnRemove = target.closest('.btn-remove-layer');
    if (btnRemove) {
      const id = btnRemove.dataset.id;
      state.removeLayer(id);
      triggerRender();
      return;
    }

    // Переместить слой
    const btnMoveUp = target.closest('.btn-move-layer-up');
    if (btnMoveUp) {
      const id = btnMoveUp.dataset.id;
      const firstPositions = ui.measureLayers();
      state.moveLayer(id, -1);
      triggerRender(firstPositions);
      return;
    }
    const btnMoveDown = target.closest('.btn-move-layer-down');
    if (btnMoveDown) {
      const id = btnMoveDown.dataset.id;
      const firstPositions = ui.measureLayers();
      state.moveLayer(id, 1);
      triggerRender(firstPositions);
      return;
    }

    // Нажатие на кнопку «Далее» Шага 1
    if (target.closest('#btn-next-step-1')) {
      state.setStep(2);
      triggerRender();
      return;
    }

    // Нажатие на кнопку «Назад» Шага 2
    if (target.closest('#btn-back-step-2')) {
      state.setStep(1);
      triggerRender();
      return;
    }

    // Нажатие на кнопку «Далее» Шага 2 (Смотреть результаты)
    if (target.closest('#btn-forward-step-2')) {
      state.setStep(3);
      triggerRender();
      return;
    }

    // Пресеты стен
    const presetBtn = target.closest('[data-preset]');
    if (presetBtn) {
      const presetId = presetBtn.getAttribute('data-preset');
      state.loadPresetWall(presetId);
      triggerRender();
      return;
    }

    // Открытие модального окна оценок
    if (target.closest('#btn-open-efficiency-modal') || target.closest('.efficiency-score-click-trigger')) {
      openEfficiencyModal();
      return;
    }

    // Закрытие модального окна оценок
    if (target.closest('#btn-close-modal') || target.closest('.modal-close-trigger') || target.id === 'efficiency-modal') {
      ui.closeEfficiencyModal();
      return;
    }

    // Кнопка экспорта в PDF
    if (target.closest('#btn-export-pdf')) {
      alert('Экспорт в PDF будет доступен в следующей версии.');
      return;
    }

    // Кнопка «Назад» на Шаге 3
    if (target.closest('#btn-back-step-3')) {
      state.setStep(2);
      triggerRender();
      return;
    }

    // Выпадающий список регионов (климатическая зона)
    if (target.closest('#region-dropdown-trigger')) {
      ui.toggleRegionDropdown();
      return;
    }

    // Выпадающие списки материалов слоев
    const triggerBtn = target.closest('.select-trigger-btn');
    if (triggerBtn) {
      const layerId = triggerBtn.dataset.id;
      ui.toggleDropdown(layerId);
      return;
    }

    // Калькулятор площади стен (Estimator)
    if (target.closest('#btn-apply-est-area')) {
      state.setWallArea(calcEstimatedArea());
      state.saveState();
      triggerRender();
      return;
    }

    // Клик мимо выпадающих списков закрывает их
    if (!target.closest('.custom-dropdown-container')) {
      document.querySelectorAll('.custom-dropdown-menu').forEach(m => m.classList.remove('dropdown-active'));
      document.querySelectorAll('.dropdown-chevron').forEach(c => c.classList.remove('rotate-180'));
    }
    if (!target.closest('.custom-region-dropdown-container')) {
      const menu = document.getElementById('region-dropdown-menu');
      const chevron = document.getElementById('region-dropdown-chevron');
      if (menu) menu.classList.remove('dropdown-active');
      if (chevron) chevron.classList.remove('rotate-180');
    }
  });

  // 6. Estimator inputs oninput
  const estInputs = ['est-length', 'est-width', 'est-floors', 'est-height', 'est-glass'];
  estInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calcEstimatedArea);
    }
  });

  // 7. Армирование (Ввод веса арматуры)
  document.addEventListener('input', (e) => {
    if (e.target.id === 'input-reinforcement-v1') {
      state.reinforcementMass = Math.max(0, Number(e.target.value));
      recalculateAndRefreshPreview();
    }
  });

  document.addEventListener('change', (e) => {
    if (e.target.id === 'input-reinforcement-v1') {
      state.saveState();
      triggerRender();
    }
  });

  // 8. Снятие фокуса с текстовых инпутов по нажатию Enter
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const active = document.activeElement;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) {
        active.blur();
      }
    }
  });
}

async function initApp() {
  try {
    const [materials, cities] = await Promise.all([
      api.getMaterials(),
      api.getCities()
    ]);
    
    state.initLists(materials, cities);
    state.loadState();
    
    // Передаем обратные вызовы для Drag and Drop и Material Selection в UI
    ui.onLayersReordered = (fromIndex, toIndex) => {
      const firstPositions = ui.measureLayers();
      state.moveLayerByIndex(fromIndex, toIndex);
      triggerRender(firstPositions);
    };
    
    ui.onDragCanceled = () => {
      triggerRender();
    };

    ui.onMaterialSelected = (layerId, materialId) => {
      const m = state.materialsMap.get(materialId);
      state.updateLayer(layerId, { materialId: m.id, density: m.density });
      state.saveState();
      triggerRender();
    };
    
    window._onRegionSelect = (name, hdd) => {
      state.selectRegion(name, hdd);
      const menu = document.getElementById('region-dropdown-menu');
      const chevron = document.getElementById('region-dropdown-chevron');
      if (menu) menu.classList.remove('dropdown-active');
      if (chevron) chevron.classList.remove('rotate-180');
      triggerRender();
    };

    initEvents();
    triggerRender();
    calcEstimatedArea(); // Запуск расчета площади во вспомогательном блоке
  } catch (err) {
    console.error("Не удалось инициализировать приложение:", err);
    ui.showFatalError("Не удалось запустить калькулятор. Ошибка загрузки справочников.");
  }
}

initApp();
