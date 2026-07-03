export const DOM = {
  get navMenu() { return document.getElementById('nav-menu'); },
  get headerStepCounter() { return document.getElementById('header-step-counter'); },
  get headerTitle() { return document.getElementById('header-title'); },
  get headerExtra() { return document.getElementById('header-extra'); },
  get step1() { return document.getElementById('step-1'); },
  get step2() { return document.getElementById('step-2'); },
  get step3() { return document.getElementById('step-3'); },
  get regionSelectedName() { return document.getElementById('region-selected-name'); },
  get regionSelectedDesc() { return document.getElementById('region-selected-desc'); },
  get inputHdd() { return document.getElementById('input-hdd'); },
  get inputArea() { return document.getElementById('input-area'); },
  get btnNextStep1() { return document.getElementById('btn-next-step-1'); },
  get step1Warning() { return document.getElementById('step-1-warning'); },
  get step1Status() { return document.getElementById('step-1-status'); },
  get regionsItemsContainer() { return document.getElementById('regions-items-container'); },
  get layersContainer() { return document.getElementById('layers-container'); },
  get reSwitchBtn() { return document.getElementById('reinforcement-switch-btn'); },
  get reSwitchThumb() { return document.getElementById('reinforcement-switch-thumb'); },
  get reSwitchInputContainer() { return document.getElementById('reinforcement-switch-input-container'); },
  get inputReV1() { return document.getElementById('input-reinforcement-v1'); },
  get tabConstructor() { return document.getElementById('tab-constructor'); },
  get tabDatabase() { return document.getElementById('tab-database'); },
  get viewConstructor() { return document.getElementById('step-2-constructor-view'); },
  get viewDatabase() { return document.getElementById('step-2-database-view'); },
  get dbVerificationTableBody() { return document.getElementById('db-verification-table-body'); },
  get resultTitle() { return document.getElementById('result-title'); },
  get resultSubtitle() { return document.getElementById('result-subtitle'); },
  get metricsContainer() { return document.getElementById('metrics-container'); },
  get efficiencyScoreDisplay() { return document.getElementById('efficiency-score-display'); },
  get efficiencyDesc() { return document.getElementById('efficiency-desc'); },
  get efficiencyBar() { return document.getElementById('efficiency-bar'); },
  get wallPreviewContainerStep3() { return document.getElementById('wall-preview-container-step3'); },
  get efficiencyModal() { return document.getElementById('efficiency-modal'); },
  get modalScoreValue() { return document.getElementById('modal-score-value'); },
  get modalScoreCircle() { return document.getElementById('modal-score-circle'); },
  get modalScoreStatus() { return document.getElementById('modal-score-status'); },
  get modalBreakdownContainer() { return document.getElementById('modal-breakdown-container'); }
};

const STEPS = [
  { id: 1, num: "01", label: "Параметры", icon: "sliders", title: "Параметры проекта" },
  { id: 2, num: "02", label: "Конструктор", icon: "layers-3", title: "Конструктор стены" },
  { id: 3, num: "03", label: "Результаты", icon: "bar-chart-3", title: "Результаты расчета" },
];

const Templates = {
  cityItem(c, onSelect) {
    window._selectRegion = onSelect;
    return `
      <div onclick="window._selectRegion('${c.name}', ${c.hdd})" class="px-4 py-2.5 text-xs text-foreground/80 hover:bg-background/80 cursor-pointer flex justify-between items-center transition region-item" data-name="${c.name.toLowerCase()}">
        <span class="font-medium text-foreground">${c.name}</span>
        <span class="text-[10px] text-muted-foreground font-mono">${c.hdd} °С·сут</span>
      </div>
    `;
  },
  cityManualItem(onSelect) {
    window._selectRegion = onSelect;
    return `
      <div onclick="window._selectRegion('manual', null)" class="px-4 py-2.5 text-xs text-accent-strong hover:bg-background/80 cursor-pointer flex justify-between items-center transition region-item border-t border-border/20 font-medium" data-name="вручную">
        <span>Другой город (ввести вручную)</span>
        <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
      </div>
    `;
  },
  layerCard(layer, index, total, dropdownGroupsHTML) {
    const m = layer.material;
    const layerR = (layer.thickness / m.lambda).toFixed(2);
    const layerCO2 = (layer.density * layer.thickness * m.carbon).toFixed(1);
    const layerMass = (layer.density * layer.thickness).toFixed(0);
    const layerEnergy = (layer.density * layer.thickness * m.energy).toFixed(1);

    return `
      <div class="layer-card-transition flex gap-4 items-start bg-background p-5 rounded-xl ring-1 ring-border/60 relative group select-none animate-fadeIn" data-id="${layer.id}">
        
        <div class="flex flex-col items-center gap-2 shrink-0 pt-0.5">
          <!-- Drag Handle Indicator -->
          <div class="drag-handle w-8 h-8 flex items-center justify-center bg-panel/60 rounded-full cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground hover:bg-panel border border-border/40 touch-none" title="Зажмите и тяните для плавной сортировки">
            <svg class="w-4 h-4 text-accent-strong pointer-events-none" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
            </svg>
          </div>
          <div class="w-8 h-8 bg-panel rounded-full flex items-center justify-center font-mono text-xs text-foreground/80">
            ${index + 1}
          </div>
        </div>

        <div class="flex-1 space-y-4">
          
          <div>
            <label class="block text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1.5">Материал слоя</label>
            <div class="relative custom-dropdown-container">
              <button id="dropdown-trigger-${layer.id}" class="w-full bg-panel ring-1 ring-border/60 rounded-md px-3.5 py-2 text-left flex items-center justify-between hover:ring-accent-strong/80 focus:outline-none transition shadow-sm select-trigger-btn" data-id="${layer.id}">
                <div class="flex items-center gap-3 pointer-events-none">
                  <span class="w-3.5 h-3.5 rounded-full ring-1 ring-border/50 shrink-0" style="background-color: ${m.color}"></span>
                  <div class="text-left">
                    <span class="text-sm font-bold text-foreground block leading-tight">${m.name}</span>
                    <span class="text-xs text-foreground/80 font-medium block leading-tight pt-1.5"><b class="font-sans font-bold text-foreground normal-case">&lambda;</b> = ${m.lambda} Вт/(м·°С) · Плотность: ${m.density} кг/м<sup>3</sup></span>
                    <span class="text-xs text-foreground/85 font-semibold block leading-tight pt-1"><b class="font-sans font-bold text-foreground normal-case">R</b> = <span class="layer-r-value" data-id="${layer.id}">${layerR}</span> м<sup>2</sup>·°С/Вт</span>
                  </div>
                </div>
                <i data-lucide="chevron-down" class="w-4 h-4 text-muted-foreground transition-transform duration-200 dropdown-chevron pointer-events-none" id="dropdown-chevron-${layer.id}"></i>
              </button>

              <!-- Dropdown Menu -->
              <div id="dropdown-menu-${layer.id}" class="dropdown-transition absolute left-0 right-0 mt-1 bg-panel ring-1 ring-border shadow-xl rounded-md z-30 overflow-hidden custom-dropdown-menu">
                <!-- Search Input -->
                <div class="p-2 border-b border-border/40 bg-background/50">
                  <div class="relative">
                    <input type="text" id="dropdown-search-${layer.id}" placeholder="Поиск материала..." class="w-full text-xs bg-background ring-1 ring-border/60 rounded-md pl-7 pr-3 py-1.5 focus:outline-none focus:ring-accent-strong text-foreground dropdown-search-input" data-id="${layer.id}">
                    <i data-lucide="search" class="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                  </div>
                </div>

                <!-- Items Grouped -->
                <div class="max-h-48 overflow-y-auto divide-y divide-border/20 dropdown-items-container">
                  ${dropdownGroupsHTML}
                </div>
              </div>
            </div>
          </div>

          <div class="bg-panel/50 rounded-lg p-4 ring-1 ring-border/40 grid grid-cols-1 sm:grid-cols-[1.2fr_auto_1fr] gap-6 items-center">
            
            <div class="space-y-3">
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-medium text-muted-foreground leading-tight">Толщина <br><span class="text-[10px] font-normal">(мм)</span></label>
                <input type="number" step="1" value="${Math.round(layer.thickness * 1000)}" class="w-20 text-center cad-input-small layer-thickness" data-id="${layer.id}" />
              </div>
              <div class="flex items-center justify-between gap-2">
                <label class="text-xs font-medium text-muted-foreground leading-tight">Плотн. <br><span class="text-[10px] font-normal">(кг/м³)</span></label>
                <input type="number" value="${layer.density}" class="w-20 text-center cad-input-small layer-density" data-id="${layer.id}" />
              </div>
            </div>

            <div class="hidden sm:block w-px h-[80%] bg-border/60"></div>

            <div class="space-y-2.5">
              <div class="flex items-center justify-between gap-4">
                <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Вес</span>
                <span class="text-sm font-mono text-foreground font-medium layer-metric-mass" data-id="${layer.id}">${layerMass} <span class="text-[10px] text-muted-foreground font-sans font-normal">кг</span></span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">След CO₂</span>
                <span class="text-sm font-mono text-emerald-600 dark:text-emerald-400 font-medium layer-metric-co2" data-id="${layer.id}">${layerCO2} <span class="text-[10px] text-muted-foreground font-sans font-normal">кг</span></span>
              </div>
              <div class="flex items-center justify-between gap-4">
                <span class="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Энергия</span>
                <span class="text-sm font-mono text-sky-600 dark:text-sky-400 font-medium layer-metric-energy" data-id="${layer.id}">${layerEnergy} <span class="text-[10px] text-muted-foreground font-sans font-normal">МДж</span></span>
              </div>
            </div>

          </div>
        </div>

        <div class="flex flex-col items-center gap-1 shrink-0 ml-1">
          <button class="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors btn-move-layer-up" data-id="${layer.id}" ${index === 0 ? 'disabled' : ''}><i data-lucide="arrow-up" class="w-4 h-4"></i></button>
          <button class="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-colors btn-move-layer-down" data-id="${layer.id}" ${index === total - 1 ? 'disabled' : ''}><i data-lucide="arrow-down" class="w-4 h-4"></i></button>
          <button class="p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-20 disabled:cursor-not-allowed transition-colors btn-remove-layer" data-id="${layer.id}" ${total <= 1 ? 'disabled' : ''}><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        </div>
        
      </div>
    `;
  },
  adviceCard(tip) {
    return `
      <div class="flex items-start gap-4 p-4 rounded-xl border border-border/40 bg-background/40">
        <div class="p-2 rounded-lg ${tip.bg} ${tip.color} shrink-0 mt-0.5">
          <i data-lucide="${tip.icon}" class="w-4 h-4"></i>
        </div>
        <div class="space-y-1">
          <span class="block text-sm font-bold text-foreground leading-tight">${tip.label}</span>
          <p class="text-xs text-muted-foreground leading-relaxed">${tip.desc}</p>
        </div>
      </div>
    `;
  },
  metricCard(m) {
    return `
      <div class="bg-panel p-6 rounded-xl ring-1 ring-border/60 space-y-5 flex flex-col">
        <div class="w-9 h-9 ${m.tone.bg} rounded-md flex items-center justify-center ${m.tone.fg}"><i data-lucide="${m.icon}" class="w-4 h-4"></i></div>
        <div class="space-y-1.5 flex-1">
          <p class="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">${m.label}</p>
          <div class="flex items-baseline gap-2 flex-wrap">
            <span class="text-3xl font-mono font-medium text-accent-strong tracking-tight">${m.val}</span>
            <span class="text-xs text-muted-foreground font-mono">${m.unit}</span>
          </div>
          <p class="text-[11px] text-muted-foreground pt-1 leading-relaxed">${m.hint}</p>
        </div>
      </div>
    `;
  },
  breakdownGrid(s_thermal, s_carbon, s_energy, ratio, reqR, R0, co2, paybackText, w, tipsHTML, energyVal) {
    const getGaugeColor = (val, max) => {
      const pct = val / max;
      if (pct < 0.4) return "#ef4444";
      if (pct < 0.75) return "#f59e0b";
      return "#10b981";
    };

    const tColorHex = getGaugeColor(s_thermal, 50);
    const cColorHex = getGaugeColor(s_carbon, 30);
    const eColorHex = getGaugeColor(s_energy, 20);

    const termPercent = Math.min(Math.max((ratio) * 50, 10), 100);
    const termColor = ratio < 1.0 ? "bg-red-500" : (ratio <= 1.4 ? "bg-emerald-500" : "bg-amber-500");

    const co2Percent = Math.min(Math.max((1 - ((co2 - 15) / (120 - 15))) * 100, 10), 100);
    const co2Color = s_carbon >= 22 ? "bg-emerald-500" : (s_carbon >= 10 ? "bg-amber-500" : "bg-red-500");

    const energyPercent = Math.min(Math.max((1 - ((energyVal - 150) / (1500 - 150))) * 100, 10), 100);
    const energyColor = s_energy >= 15 ? "bg-emerald-500" : (s_energy >= 7 ? "bg-amber-500" : "bg-red-500");

    return `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. Теплозащита -->
        <div class="space-y-5 border border-border/40 p-6 rounded-xl bg-background/20 flex flex-col justify-between shadow-sm">
          <div class="space-y-4">
            <div class="relative w-24 h-24 mx-auto">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-border/40" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="${tColorHex}" stroke-width="8" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * s_thermal) / 50}" stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span class="text-2xl font-mono font-bold text-foreground">${Math.round(s_thermal)}</span>
                <span class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">из 50</span>
              </div>
            </div>
            <div class="text-center space-y-1">
              <span class="font-semibold text-foreground text-sm block leading-tight">1. Теплозащита конструкции</span>
              <span class="text-xs text-muted-foreground block">Сопротивление теплопередаче R₀</span>
            </div>
          </div>

          <div class="space-y-2 pt-3 border-t border-border/20">
            <div class="h-3 bg-background rounded-full relative overflow-hidden ring-1 ring-border/40">
              <div class="absolute top-0 bottom-0 w-0.5 bg-foreground/50 z-10" style="left: 50%"></div>
              <div class="h-full ${termColor}" style="width: ${termPercent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">
              <span>Норма: ${reqR.toFixed(2)}</span>
              <span>Факт: ${R0.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <!-- 2. Экологический баланс -->
        <div class="space-y-5 border border-border/40 p-6 rounded-xl bg-background/20 flex flex-col justify-between shadow-sm">
          <div class="space-y-4">
            <div class="relative w-24 h-24 mx-auto">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-border/40" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="${cColorHex}" stroke-width="8" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * s_carbon) / 30}" stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span class="text-2xl font-mono font-bold text-foreground">${Math.round(s_carbon)}</span>
                <span class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">из 30</span>
              </div>
            </div>
            <div class="text-center space-y-1">
              <span class="font-semibold text-foreground text-sm block leading-tight">2. Экологический след</span>
              <span class="text-xs text-muted-foreground block">Выбросы CO₂ при производстве</span>
            </div>
          </div>

          <div class="space-y-2 pt-3 border-t border-border/20">
            <div class="h-3 bg-background rounded-full relative overflow-hidden ring-1 ring-border/40">
              <div class="h-full ${co2Color}" style="width: ${co2Percent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">
              <span>Факт: ${co2.toFixed(1)} кг</span>
              <span>Предел: 120 кг</span>
            </div>
          </div>
        </div>

        <!-- 3. Первичная энергоемкость -->
        <div class="space-y-5 border border-border/40 p-6 rounded-xl bg-background/20 flex flex-col justify-between shadow-sm">
          <div class="space-y-4">
            <div class="relative w-24 h-24 mx-auto">
              <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="8" class="text-border/40" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="${eColorHex}" stroke-width="8" stroke-dasharray="251.2" stroke-dashoffset="${251.2 - (251.2 * s_energy) / 20}" stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center leading-none">
                <span class="text-2xl font-mono font-bold text-foreground">${Math.round(s_energy)}</span>
                <span class="text-[10px] text-muted-foreground uppercase tracking-widest mt-0.5">из 20</span>
              </div>
            </div>
            <div class="text-center space-y-1">
              <span class="font-semibold text-foreground text-sm block leading-tight">3. Первичная энергоемкость</span>
              <span class="text-xs text-muted-foreground block">Энергия на создание материалов</span>
            </div>
          </div>

          <div class="space-y-2 pt-3 border-t border-border/20">
            <div class="h-3 bg-background rounded-full relative overflow-hidden ring-1 ring-border/40">
              <div class="h-full ${energyColor}" style="width: ${energyPercent}%"></div>
            </div>
            <div class="flex justify-between text-[10px] font-mono text-muted-foreground uppercase tracking-widest leading-none">
              <span>Факт: ${energyVal.toFixed(0)} МДж</span>
              <span>Предел: 1500 МДж</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Дополнительные факторы -->
      <div class="p-5 bg-background/30 ring-1 ring-border/40 rounded-xl space-y-3 shadow-inner">
        <h4 class="font-bold text-foreground text-[10px] uppercase tracking-widest">Дополнительные факторы влияния на оценку</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs">
          <div class="space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Общий вес 1 м² стены:</span>
              <span class="font-mono font-semibold text-foreground">${w.toFixed(0)} кг</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Штраф за перегрузку фундамента:</span>
              <span class="font-mono font-bold ${w > 500 ? 'text-amber-500' : 'text-emerald-500'}">
                ${w > 500 ? `-${Math.min(10, ((w - 500) / 500) * 10).toFixed(1)} баллов` : '0 баллов'}
              </span>
            </div>
          </div>
          <div class="space-y-2.5 border-t md:border-t-0 md:border-l border-border/20 pt-2.5 md:pt-0 md:pl-8">
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Стальная арматурная сетка:</span>
              <span class="font-mono font-semibold text-foreground">${window._reinforcementMass > 0 ? `${window._reinforcementMass} кг/м²` : 'Отсутствует'}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-muted-foreground">Период окупаемости CO₂:</span>
              <span class="font-mono font-bold ${paybackText.includes('избыточно') ? 'text-amber-500' : 'text-emerald-500'}">${paybackText}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Рекомендации инженера -->
      <div class="space-y-4 pt-3">
        <h4 class="font-semibold text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
          <i data-lucide="lightbulb" class="w-4.5 h-4.5 text-accent-strong"></i> Рекомендации инженера
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${tipsHTML}
        </div>
      </div>
    `;
  }
};

export const ui = {
  onLayersReordered: null,
  onDragCanceled: null,
  onMaterialSelected: null,

  init(state) {
    this.render(state);
  },

  render(state) {
    this.renderSidebar(state.currentStep);
    this.renderHeader(state);
    this.toggleViews(state.currentStep);

    if (state.currentStep === 1) this.renderStep1(state);
    if (state.currentStep === 2) this.renderStep2(state);
    if (state.currentStep === 3) this.renderStep3(state);

    lucide.createIcons();
  },

  renderSidebar(currentStep) {
    const navHTML = STEPS.map(s => {
      const active = currentStep === s.id;
      return `
        <a href="#" data-step="${s.id}" class="group flex items-center gap-4 py-3 px-4 rounded-md transition-colors btn-step-nav ${active ? 'bg-panel text-accent-strong' : 'text-muted-foreground hover:bg-panel/60'}">
          <span class="font-mono text-[10px] w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ${active ? 'border-accent-strong/30' : 'border-border'}">${s.num}</span>
          <span class="text-sm font-medium flex-1">${s.label}</span>
          <i data-lucide="${s.icon}" class="w-4 h-4 opacity-60"></i>
        </a>
      `;
    }).join('');
    
    if (DOM.navMenu) DOM.navMenu.innerHTML = navHTML;
  },

  renderHeader(state) {
    const currentStepInfo = STEPS.find(s => s.id === state.currentStep);
    if (DOM.headerStepCounter) DOM.headerStepCounter.innerText = `Шаг 0${state.currentStep} / 03`;
    if (DOM.headerTitle) DOM.headerTitle.innerText = currentStepInfo.title;

    if (DOM.headerExtra) {
      if (state.currentStep === 2) {
        DOM.headerExtra.innerHTML = `<button id="btn-reset-construct" class="mr-4 inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Начать заново</button> ${state.layers.length} / 5 слоев`;
      } else if (state.currentStep === 3) {
        DOM.headerExtra.innerHTML = `<button id="btn-reset-results" class="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"><i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Начать заново</button>`;
      } else {
        DOM.headerExtra.innerHTML = '';
      }
    }
  },

  toggleViews(currentStep) {
    const stepsList = [1, 2, 3];
    stepsList.forEach(num => {
      const el = document.getElementById(`step-${num}`);
      if (el) {
        const isCurrent = currentStep === num;
        if (isCurrent) {
          if (el.classList.contains('hidden')) {
            el.classList.remove('hidden');
            el.classList.add('step-transition');
            void el.offsetHeight;
            el.classList.add('step-active');
          } else {
            el.classList.add('step-transition', 'step-active');
          }
        } else {
          el.classList.add('hidden');
          el.classList.remove('step-active');
        }
      }
    });
  },

  renderStep1(state) {
    const listContainer = DOM.regionsItemsContainer;
    if (listContainer && !listContainer.children.length) {
      const onSelect = 'window._onRegionSelect';
      let citiesHTML = state.cities.map(c => Templates.cityItem(c, onSelect)).join('');
      citiesHTML += Templates.cityManualItem(onSelect);
      listContainer.innerHTML = citiesHTML;
    }

    const areaInput = DOM.inputArea;
    if (areaInput && areaInput !== document.activeElement) {
      areaInput.value = state.wallArea || "";
    }
    
    const activeCity = state.cities.find(c => c.hdd === state.hdd);
    const triggerName = DOM.regionSelectedName;
    const triggerDesc = DOM.regionSelectedDesc;
    const hddInput = DOM.inputHdd;

    if (state.isManualHdd) {
      if (triggerName) triggerName.innerText = "Вручную";
      if (triggerDesc) triggerDesc.innerText = `ГСОП = ${state.hdd || 0} °С·сут`;
      if (hddInput) {
        if (hddInput !== document.activeElement) hddInput.value = state.hdd || "";
        hddInput.disabled = false;
      }
    } else if (activeCity) {
      if (triggerName) triggerName.innerText = activeCity.name;
      if (triggerDesc) triggerDesc.innerText = `ГСОП = ${activeCity.hdd} °С·сут`;
      if (hddInput) {
        if (hddInput !== document.activeElement) hddInput.value = activeCity.hdd;
        hddInput.disabled = true; // Блокировка инпута при автоматическом выборе
      }
    } else {
      if (triggerName) triggerName.innerText = "Выберите город...";
      if (triggerDesc) triggerDesc.innerText = "или задайте ГСОП вручную ниже";
      if (hddInput) {
        if (hddInput !== document.activeElement) hddInput.value = "";
        hddInput.disabled = false;
      }
    }

    const canProceed = state.hdd > 0 && state.wallArea > 0;
    if (DOM.btnNextStep1) DOM.btnNextStep1.disabled = !canProceed;
    if (DOM.step1Warning) DOM.step1Warning.classList.toggle('hidden', canProceed);

    const statusEl = DOM.step1Status;
    if (statusEl) {
      statusEl.innerText = canProceed ? "готово к расчету" : "ожидание ввода";
    }
  },

  renderStep2(state, firstPositions = []) {
    const total = state.layers.length;

    // Вспомогательная функция для рендеринга выпадающих групп
    const getDropdownGroupsHTML = (layerId) => {
      window._selectLayerMaterial = this.onMaterialSelected;
      return Object.keys(state.materialsByCategory).map(catName => {
        const itemsHTML = state.materialsByCategory[catName].map(mat => `
          <div onclick="window._selectLayerMaterial('${layerId}', '${mat.id}')" class="px-3 py-2.5 text-xs text-foreground/80 hover:bg-background/80 cursor-pointer flex justify-between items-center transition dropdown-item" data-name="${mat.name.toLowerCase()}">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ring-1 ring-border/50 shrink-0" style="background-color: ${mat.color}"></span>
              <span class="font-medium text-foreground">${mat.name}</span>
            </div>
            <div class="text-[10px] text-muted-foreground font-mono">
              λ = ${mat.lambda} · ${mat.density} кг/м³
            </div>
          </div>
        `).join('');

        return `
          <div class="px-3 py-1.5 text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider bg-background/30 border-t border-border/10 first:border-t-0">${catName}</div>
          <div class="divide-y divide-border/10">${itemsHTML}</div>
        `;
      }).join('');
    };

    // DOM Recycling: Если количество нод совпадает с количеством слоев в стейте
    const container = DOM.layersContainer;
    let needsFullRender = true;
    
    if (container && container.children.length === total) {
      const cards = Array.from(container.children);
      const allIdsMatch = cards.every((c, idx) => c.getAttribute('data-id') === state.layers[idx].id);
      if (allIdsMatch) {
        needsFullRender = false;
      }
    }

    if (needsFullRender) {
      // Полный рендер через innerHTML (при изменении количества/порядка)
      const enrichedLayers = state.layers.map(l => ({ ...l, material: state.materialsMap.get(l.materialId) }));
      const layersHTML = enrichedLayers.map((layer, index) => {
        return Templates.layerCard(layer, index, total, getDropdownGroupsHTML(layer.id));
      }).join('');
      
      if (container) container.innerHTML = layersHTML;
      
      // Навешиваем Drag events
      if (container) {
        const cards = Array.from(container.children);
        cards.forEach((card, idx) => {
          this.setupPointerDragEvents(card, idx);
        });
      }

      // FLIP анимация при перерендере, если есть старые позиции
      if (firstPositions && firstPositions.length > 0 && container) {
        const newCards = Array.from(container.children);
        newCards.forEach((card) => {
          const id = card.getAttribute('data-id');
          const oldData = firstPositions.find(p => p.id === id);
          if (oldData) {
            const lastPos = card.getBoundingClientRect();
            const deltaY = oldData.rect.top - lastPos.top;
            if (deltaY !== 0) {
              card.style.transform = `translateY(${deltaY}px)`;
              card.style.transition = 'none';
              requestAnimationFrame(() => {
                card.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                card.style.transform = 'translateY(0)';
              });
            }
          }
        });
      }
    } else {
      // DOM-Recycling: Обновление без пересоздания нод
      state.layers.forEach((layer) => {
        this.updateSingleLayer(layer.id, layer, state.materialsMap);
      });
    }

    const addLayerBtn = document.getElementById('btn-add-layer');
    if (addLayerBtn) addLayerBtn.disabled = total >= 5;

    // Свитч армирования
    const reSwitchBtn = DOM.reSwitchBtn;
    const reSwitchThumb = DOM.reSwitchThumb;
    const reSwitchInputContainer = DOM.reSwitchInputContainer;
    const inputReV1 = DOM.inputReV1;
    
    if (reSwitchBtn && reSwitchThumb && reSwitchInputContainer) {
      const isEn = state.reinforcementMass > 0;
      if (isEn) {
        reSwitchBtn.classList.remove('bg-border/60');
        reSwitchBtn.classList.add('bg-accent-strong');
        reSwitchThumb.classList.remove('translate-x-0');
        reSwitchThumb.classList.add('translate-x-5');
        reSwitchInputContainer.classList.add('reinforcement-active');
        if (inputReV1 && inputReV1 !== document.activeElement) {
          inputReV1.value = state.reinforcementMass;
        }
      } else {
        reSwitchBtn.classList.add('bg-border/60');
        reSwitchBtn.classList.remove('bg-accent-strong');
        reSwitchThumb.classList.remove('translate-x-5');
        reSwitchThumb.classList.add('translate-x-0');
        reSwitchInputContainer.classList.remove('reinforcement-active');
      }
    }

    // Вкладки Конструктор / Таблица
    const tabConstructorBtn = DOM.tabConstructor;
    const tabDatabaseBtn = DOM.tabDatabase;
    const viewConstructor = DOM.viewConstructor;
    const viewDatabase = DOM.viewDatabase;

    if (tabConstructorBtn && tabDatabaseBtn && viewConstructor && viewDatabase) {
      const isConstructor = state.activeStep2Tab === 'constructor';
      
      if (isConstructor) {
        if (viewConstructor.classList.contains('hidden')) {
          viewConstructor.classList.remove('hidden');
          viewConstructor.classList.add('step-transition');
          void viewConstructor.offsetHeight;
          viewConstructor.classList.add('step-active');
        } else {
          viewConstructor.classList.add('step-transition', 'step-active');
        }
        viewDatabase.classList.add('hidden');
        viewDatabase.classList.remove('step-active');
      } else {
        if (viewDatabase.classList.contains('hidden')) {
          viewDatabase.classList.remove('hidden');
          viewDatabase.classList.add('step-transition');
          void viewDatabase.offsetHeight;
          viewDatabase.classList.add('step-active');
        } else {
          viewDatabase.classList.add('step-transition', 'step-active');
        }
        viewConstructor.classList.add('hidden');
        viewConstructor.classList.remove('step-active');
      }

      if (isConstructor) {
        tabConstructorBtn.className = "pb-3 text-sm font-semibold border-b-2 border-accent-strong text-foreground transition-all";
        tabDatabaseBtn.className = "pb-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-all";
      } else {
        tabConstructorBtn.className = "pb-3 text-sm font-medium border-b-2 border-transparent text-muted-foreground hover:text-foreground transition-all";
        tabDatabaseBtn.className = "pb-3 text-sm font-semibold border-b-2 border-accent-strong text-foreground transition-all";
      }
    }

    // Заполнение таблицы верификации (Таблица 2)
    const dbTableBody = DOM.dbVerificationTableBody;
    if (dbTableBody) {
      let rowsHTML = state.layers.map((layer, index) => {
        const m = state.materialsMap.get(layer.materialId);
        return `
          <tr class="hover:bg-panel/40 transition">
            <td class="py-3 px-4 text-center font-semibold text-[10px] text-muted-foreground">${index + 1}</td>
            <td class="py-3 px-4 font-semibold text-foreground/90">${m.name}</td>
            <td class="py-3 px-4 text-center font-mono">${Math.round(layer.thickness * 1000)}</td>
            <td class="py-3 px-4 text-center font-mono">${layer.density}</td>
            <td class="py-3 px-4 text-center font-mono">${m.lambda.toFixed(3)}</td>
            <td class="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400">${m.carbon.toFixed(2)}</td>
            <td class="py-3 px-4 text-center font-mono text-sky-600 dark:text-sky-400">${m.energy.toFixed(1)}</td>
          </tr>
        `;
      }).join('');

      if (state.reinforcementMass > 0) {
        const re = state.materialsMap.get('159');
        rowsHTML += `
          <tr class="bg-accent-strong/5 border-t border-dashed border-accent-strong/20">
            <td class="py-3 px-4 text-center font-semibold text-[10px] text-accent-strong">—</td>
            <td class="py-3 px-4 font-semibold text-accent-strong">Арматурная сетка (сталь)</td>
            <td class="py-3 px-4 text-center font-mono text-muted-foreground">—</td>
            <td class="py-3 px-4 text-center font-mono">${re.density}</td>
            <td class="py-3 px-4 text-center font-mono">${re.lambda.toFixed(1)}</td>
            <td class="py-3 px-4 text-center font-mono text-emerald-600 dark:text-emerald-400 font-semibold">${re.carbon.toFixed(2)}</td>
            <td class="py-3 px-4 text-center font-mono text-sky-600 dark:text-sky-400 font-semibold">${re.energy.toFixed(1)}</td>
          </tr>
        `;
      }
      dbTableBody.innerHTML = rowsHTML;
    }

    this.renderWallPreview('wall-preview-container-step2', state);
    lucide.createIcons();
  },

  updateSingleLayer(id, layer, materialsMap) {
    const card = document.querySelector(`.layer-card-transition[data-id="${id}"]`);
    if (!card) return;
    const m = materialsMap.get(layer.materialId);
    
    const layerR = (layer.thickness / m.lambda).toFixed(2);
    const layerCO2 = (layer.density * layer.thickness * m.carbon).toFixed(1);
    const layerMass = (layer.density * layer.thickness).toFixed(0);
    const layerEnergy = (layer.density * layer.thickness * m.energy).toFixed(1);

    const massEl = card.querySelector('.layer-metric-mass');
    if (massEl) massEl.innerHTML = `${layerMass} <span class="text-[10px] text-muted-foreground font-sans font-normal">кг</span>`;
    
    const co2El = card.querySelector('.layer-metric-co2');
    if (co2El) co2El.innerHTML = `${layerCO2} <span class="text-[10px] text-muted-foreground font-sans font-normal">кг</span>`;
    
    const energyEl = card.querySelector('.layer-metric-energy');
    if (energyEl) energyEl.innerHTML = `${layerEnergy} <span class="text-[10px] text-muted-foreground font-sans font-normal">МДж</span>`;
    
    const triggerBtn = card.querySelector(`.select-trigger-btn[data-id="${id}"]`);
    if (triggerBtn) {
      const rValSpan = triggerBtn.querySelector('.layer-r-value');
      if (rValSpan) rValSpan.innerText = layerR;
      
      const labelName = triggerBtn.querySelector('.text-sm.font-bold');
      if (labelName && labelName.innerText !== m.name) {
        triggerBtn.innerHTML = `
          <div class="flex items-center gap-3">
            <span class="w-3.5 h-3.5 rounded-full ring-1 ring-border/50 shrink-0" style="background-color: ${m.color}"></span>
            <div class="text-left">
              <span class="text-sm font-bold text-foreground block leading-tight">${m.name}</span>
              <span class="text-xs text-foreground/80 font-medium block leading-tight pt-1.5"><b class="font-sans font-bold text-foreground normal-case">&lambda;</b> = ${m.lambda} Вт/(м·°С) · Плотность: ${m.density} кг/м<sup>3</sup></span>
              <span class="text-xs text-foreground/85 font-semibold block leading-tight pt-1"><b class="font-sans font-bold text-foreground normal-case">R</b> = <span class="layer-r-value" data-id="${layer.id}">${layerR}</span> м<sup>2</sup>·°С/Вт</span>
            </div>
          </div>
          <i data-lucide="chevron-down" class="w-4 h-4 text-muted-foreground transition-transform duration-200 dropdown-chevron" id="dropdown-chevron-${id}"></i>
        `;
        lucide.createIcons();
      }
    }
    
    const thicknessInput = card.querySelector('.layer-thickness');
    if (thicknessInput && thicknessInput !== document.activeElement) {
      thicknessInput.value = Math.round(layer.thickness * 1000);
    }
    const densityInput = card.querySelector('.layer-density');
    if (densityInput && densityInput !== document.activeElement) {
      densityInput.value = layer.density;
    }
  },

  measureLayers() {
    const container = DOM.layersContainer;
    if (!container) return [];
    const cards = Array.from(container.children);
    return cards.map(c => ({
      id: c.getAttribute('data-id'),
      rect: c.getBoundingClientRect()
    }));
  },

  renderStep3(state) {
    // Импортируем калькулятор динамически или рассчитываем все нужные метрики
    // Мы можем получить значения, рассчитанные оркестратором и прокинутые сюда.
    // Для простоты оркестратор передаст вычисленные параметры или мы вызовем их прямо.
    // Так как calculator импортирован оркестратором, оркестратор вызовет ui.renderStep3(state, calculatedMetrics)
  },

  renderStep3WithMetrics(state, metrics) {
    if (DOM.resultTitle) DOM.resultTitle.innerText = metrics.meetsNorm ? "Конструкция соответствует нормативу теплозащиты" : "Конструкция не дотягивает до норматива";
    if (DOM.resultSubtitle) DOM.resultSubtitle.innerHTML = `При ГСОП <span class="font-mono text-foreground">${state.hdd}</span> требуемое сопротивление — <span class="font-mono text-foreground">${metrics.reqR.toFixed(2)}</span> м²·°С/Вт.<br><span class="block mt-2">Ваш результат: <span class="font-mono text-accent-strong font-bold text-lg">${metrics.R0.toFixed(2)}</span> м²·°С/Вт.</span>`;

    const metricsCards = [
      { label: "Общий вес 1 м²", val: metrics.weight.toFixed(1), unit: "кг/м²", icon: "weight", tone: { bg: "bg-stone-200/60", fg: "text-stone-700" }, hint: `Включая арматуру ${state.reinforcementMass} кг/м²` },
      { label: "Сопротивление R₀", val: metrics.R0.toFixed(2), unit: "м²·°С/Вт", icon: "thermometer", tone: { bg: "bg-orange-100/60", fg: "text-orange-800" }, hint: metrics.meetsNorm ? `+${((metrics.R0 / metrics.reqR - 1) * 100).toFixed(1)}% к нормативу` : `Ниже норматива на ${((1 - metrics.R0 / metrics.reqR) * 100).toFixed(1)}%` },
      { label: "След CO₂", val: metrics.co2.toFixed(1), unit: "кгCO₂экв/м²", icon: "leaf", tone: { bg: "bg-emerald-100/60", fg: "text-emerald-800" }, hint: `≈ ${metrics.totalCO2.toFixed(0)} кг на все стены` },
      { label: "Воплощенная энергия", val: metrics.energy.toFixed(0), unit: "МДж/м²", icon: "zap", tone: { bg: "bg-sky-100/60", fg: "text-sky-800" }, hint: "Совокупные затраты на производство" },
    ];

    if (DOM.metricsContainer) {
      DOM.metricsContainer.innerHTML = metricsCards.map(Templates.metricCard).join('');
    }

    if (DOM.efficiencyScoreDisplay) DOM.efficiencyScoreDisplay.innerText = metrics.score;
    
    const scoreDesc = DOM.efficiencyDesc;
    if (scoreDesc) {
      let explanation = "";
      if (metrics.score <= 40) {
        explanation = `Неэффективная конструкция (${metrics.score}/100). Стены либо холоднее норматива, либо имеют критически высокий вес и углеродный след. Требуется оптимизация утеплителя или материалов.`;
      } else if (metrics.score <= 75) {
        explanation = `Избыточная конструкция (${metrics.score}/100). Теплозащита превышает нормы, но это привело к неоправданному перерасходу ресурсов, удорожанию фундамента и огромному экологическому следу при производстве.`;
      } else {
        explanation = `Оптимальная конструкция (${metrics.score}/100). Достигнут отличный баланс: стена полностью соответствует теплозащитным нормам региона, имея минимальный экологический след, вес и энергоемкость.`;
      }
      scoreDesc.innerText = explanation;
    }

    setTimeout(() => { 
      const bar = DOM.efficiencyBar;
      if (bar) {
        bar.style.width = `${metrics.score}%`;
        if (metrics.score <= 40) {
          bar.style.backgroundColor = "#ef4444";
        } else if (metrics.score <= 75) {
          bar.style.backgroundColor = "#f59e0b";
        } else {
          bar.style.backgroundColor = "#10b981";
        }
      }
    }, 50);

    // Вывод показателей эксплуатации стен
    if (DOM.wallPreviewContainerStep3) {
      DOM.wallPreviewContainerStep3.innerHTML = `
        <div class="bg-panel rounded-2xl ring-1 ring-border/60 p-6 lg:p-8 space-y-6 shadow-sm">
          <div class="flex items-center gap-3 border-b border-border/40 pb-4">
            <div class="w-10 h-10 bg-accent-strong/10 text-accent-strong rounded-xl flex items-center justify-center">
              <i data-lucide="bar-chart-3" class="w-5 h-5"></i>
            </div>
            <div>
              <h3 class="font-bold text-foreground">Энергоэффективность и экология</h3>
              <p class="text-xs text-muted-foreground">Итоговые показатели эксплуатации стен (${state.wallArea || 0} м²)</p>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-5">
            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-orange-500/10 text-orange-500 shrink-0">
                <i data-lucide="activity" class="w-4 h-4"></i>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Удельные теплопотери на 1 м² (<b class="font-sans font-bold text-accent-strong normal-case">Q<sub>ст.год</sub></b>)</span>
                <span class="text-xl font-mono font-semibold text-orange-600 dark:text-orange-400">${metrics.q_st_year.toFixed(2)} <span class="text-xs font-semibold text-muted-foreground">кВт·ч/(м²·год)</span></span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                <i data-lucide="zap" class="w-4 h-4"></i>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Теплопотери через все стены (<b class="font-sans font-bold text-accent-strong normal-case">Q<sub>год</sub></b>)</span>
                <span class="text-xl font-mono font-semibold text-amber-600 dark:text-amber-400">${Math.round(metrics.q_year).toLocaleString()} <span class="text-xs font-semibold text-muted-foreground">кВт·ч/год</span></span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shrink-0">
                <i data-lucide="leaf" class="w-4 h-4"></i>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Выбросы углерода на все стены (<b class="font-sans font-bold text-accent-strong normal-case">CO<sub>2.Общ</sub></b>)</span>
                <span class="text-xl font-mono font-semibold text-emerald-600 dark:text-emerald-400">${Math.round(metrics.totalCO2).toLocaleString()} <span class="text-xs font-semibold text-muted-foreground">кг CO<sub>2</sub>экв</span></span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-sky-500/10 text-sky-500 shrink-0">
                <i data-lucide="flame" class="w-4 h-4"></i>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Расход газа на 1 м² стен (<b class="font-sans font-bold text-accent-strong normal-case">V<sub>1</sub></b>)</span>
                <span class="text-xl font-mono font-semibold text-sky-600 dark:text-sky-400">${metrics.v1.toFixed(2)} <span class="text-xs font-semibold text-muted-foreground">м³/год</span></span>
              </div>
            </div>

            <div class="flex items-center gap-4">
              <div class="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                <i data-lucide="building-2" class="w-4 h-4"></i>
              </div>
              <div class="space-y-0.5">
                <span class="block text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Общий расход газа на все стены (<b class="font-sans font-bold text-accent-strong normal-case">V<sub>Общ</sub></b>)</span>
                <span class="text-xl font-mono font-semibold text-indigo-600 dark:text-indigo-400">${Math.round(metrics.v_total).toLocaleString()} <span class="text-xs font-semibold text-muted-foreground">м³/год</span></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    lucide.createIcons();
  },

  renderWallPreview(containerId, state) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalThick = state.layers.reduce((a, l) => a + (l.thickness || 0), 0) || 1;

    // Инициализация скелета превью при его отсутствии
    if (!container.querySelector('.wall-preview-card')) {
      container.innerHTML = `
        <div class="wall-preview-card rounded-xl bg-panel ring-1 ring-border/60 p-6 w-full relative transition-all duration-300">
          <div class="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4 px-1">
            <span>Разрез стены</span>
            <span class="text-accent-strong flex gap-6 font-semibold">
              <span>&larr; Внутри</span>
              <span>Снаружи &rarr;</span>
            </span>
          </div>
          
          <div class="relative bg-background/60 rounded-lg ring-1 ring-border/40 overflow-hidden">
            <div class="wall-preview-section flex items-stretch h-64 w-full transition-all duration-300 relative" style="background-image: radial-gradient(oklch(var(--border) / 0.5) 1px, transparent 1px); background-size: 16px 16px;">
              <!-- Layers will be inserted here -->
            </div>
          </div>
          
          <div class="flex items-center gap-3 mt-4">
            <div class="flex-1 h-px bg-border/60"></div>
            <span class="font-mono text-xs text-muted-foreground shrink-0 wall-preview-total-mm">0 мм</span>
            <div class="flex-1 h-px bg-border/60"></div>
          </div>
          
          <div class="mt-4">
            <div class="text-[10px] font-mono text-muted-foreground mb-3 tracking-widest uppercase">Экспликация слоев</div>
            <div class="wall-preview-legend flex flex-wrap gap-x-6 gap-y-2.5 text-xs font-mono">
              <!-- Legend items will be inserted here -->
            </div>
          </div>

          <div class="mt-5 pt-4 border-t border-border/40 space-y-3">
            <div class="text-[10px] font-mono text-muted-foreground tracking-widest uppercase">Сводка по конструкции</div>
            <div class="grid grid-cols-3 gap-2.5 text-center">
              <div class="bg-background/40 p-2.5 rounded-lg ring-1 ring-border/40">
                <span class="block text-[9px] font-mono text-muted-foreground uppercase">Тепло R₀</span>
                <span class="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 wall-preview-summary-r">0.00</span>
              </div>
              <div class="bg-background/40 p-2.5 rounded-lg ring-1 ring-border/40">
                <span class="block text-[9px] font-mono text-muted-foreground uppercase">След CO₂</span>
                <span class="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 wall-preview-summary-co2">0.0 кг</span>
              </div>
              <div class="bg-background/40 p-2.5 rounded-lg ring-1 ring-border/40">
                <span class="block text-[9px] font-mono text-muted-foreground uppercase">Масса 1м²</span>
                <span class="text-xs font-mono font-semibold text-foreground wall-preview-summary-mass">0 кг</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    container.querySelector('.wall-preview-total-mm').innerText = `${Math.round(totalThick * 1000)} мм`;

    // Инжектим функции расчетов в превью через оконные вызовы или прокидывая метрики.
    // Так как UI имеет доступ к стейту (передается аргументом), а расчетные метрики посчитаны
    // оркестратором, мы можем взять их. Чтобы UI оставался независим от калькулятора,
    // оркестратор будет вешать готовые значения на превью или передавать их.
    // Давайте для простоты передадим значения.
    if (window._calculatedMetricsForPreview) {
      const metrics = window._calculatedMetricsForPreview;
      container.querySelector('.wall-preview-summary-r').innerText = metrics.R0.toFixed(2);
      container.querySelector('.wall-preview-summary-co2').innerText = `${metrics.co2.toFixed(1)} кг`;
      container.querySelector('.wall-preview-summary-mass').innerText = `${metrics.weight.toFixed(0)} кг`;
    }

    const section = container.querySelector('.wall-preview-section');
    if (!section) return;
    
    const existingBars = Array.from(section.children);

    if (existingBars.length !== state.layers.length) {
      section.innerHTML = state.layers.map((l) => {
        const m = state.materialsMap.get(l.materialId);
        const flexBasis = ((l.thickness || 0) / totalThick) * 100;
        return `
          <div class="layer flex-grow relative pat-overlay ${m.patternClass || ''} transition-all duration-300 ease-out" 
               style="flex: ${flexBasis} 1 0%; background-color: ${m.color};"
               data-id="${l.id}">
            <div class="absolute bottom-1.5 left-1.5 bg-panel/95 text-foreground ring-1 ring-border/50 font-mono text-[9px] px-1.5 py-0.5 rounded shadow-sm select-none transition-opacity duration-200">
              ${Math.round(l.thickness * 1000)} мм
            </div>
          </div>`;
      }).join('');
    } else {
      state.layers.forEach((l, i) => {
        const bar = existingBars[i];
        const m = state.materialsMap.get(l.materialId);
        const flexBasis = ((l.thickness || 0) / totalThick) * 100;
        
        bar.style.flex = `${flexBasis} 1 0%`;
        bar.style.backgroundColor = m.color;
        bar.className = `layer flex-grow relative pat-overlay ${m.patternClass || ''} transition-all duration-300 ease-out`;
        bar.setAttribute('data-id', l.id);

        const badge = bar.querySelector('div');
        if (badge) {
          badge.innerText = `${Math.round(l.thickness * 1000)} мм`;
        }
      });
    }

    const legend = container.querySelector('.wall-preview-legend');
    if (legend) {
      legend.innerHTML = state.layers.map((l, i) => {
        const m = state.materialsMap.get(l.materialId);
        const formattedIndex = String(i + 1).padStart(2, '0');
        return `
          <div class="flex items-center gap-2 select-none">
            <span class="inline-block w-2.5 h-2.5 rounded-full ring-1 ring-border/50 shrink-0" style="background-color: ${m.color}"></span>
            <span class="text-muted-foreground font-bold font-mono">${formattedIndex}</span>
            <span class="text-foreground/90 font-medium">${m.name}</span>
          </div>`;
      }).join('');
    }
  },

  toggleDropdown(layerId) {
    const menu = document.getElementById(`dropdown-menu-${layerId}`);
    const chevron = document.getElementById(`dropdown-chevron-${layerId}`);
    if (!menu) return;

    document.querySelectorAll('.custom-dropdown-menu').forEach(m => {
      if (m.id !== `dropdown-menu-${layerId}`) m.classList.remove('dropdown-active');
    });
    document.querySelectorAll('.dropdown-chevron').forEach(c => {
      if (c.id !== `dropdown-chevron-${layerId}`) c.classList.remove('rotate-180');
    });

    menu.classList.toggle('dropdown-active');
    if (chevron) chevron.classList.toggle('rotate-180');
  },

  filterDropdown(layerId, query) {
    const menu = document.getElementById(`dropdown-menu-${layerId}`);
    if (!menu) return;
    const items = menu.querySelectorAll('.dropdown-item');
    items.forEach(item => {
      const name = item.dataset.name;
      if (name.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  },

  toggleRegionDropdown() {
    const menu = document.getElementById('region-dropdown-menu');
    const chevron = document.getElementById('region-dropdown-chevron');
    if (menu) menu.classList.toggle('dropdown-active');
    if (chevron) chevron.classList.toggle('rotate-180');
  },

  filterRegions(query) {
    const container = DOM.regionsItemsContainer;
    if (!container) return;
    const items = container.querySelectorAll('.region-item');
    items.forEach(item => {
      const name = item.dataset.name;
      if (name.includes(query)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  },

  openEfficiencyModal(state, score, metrics, breakdown, tipsHTML) {
    window._reinforcementMass = state.reinforcementMass;

    const modalVal = DOM.modalScoreValue;
    if (modalVal) modalVal.innerText = score;
    
    const modalCircle = DOM.modalScoreCircle;
    if (modalCircle) {
      modalCircle.style.strokeDashoffset = 251.2 - (251.2 * score) / 100;
      let strokeColor = "#10b981";
      if (score <= 40) strokeColor = "#ef4444";
      else if (score <= 75) strokeColor = "#f59e0b";
      modalCircle.style.stroke = strokeColor;
    }

    let status = "Оптимальный баланс (Идеал)";
    let statusColorClass = "text-emerald-500";
    if (score <= 40) {
      status = "Неэффективная (Низкая)";
      statusColorClass = "text-red-500";
    } else if (score <= 75) {
      status = "Избыточная (Перерасход ресурсов)";
      statusColorClass = "text-amber-500";
    }
    const statusEl = DOM.modalScoreStatus;
    if (statusEl) {
      statusEl.innerText = status;
      statusEl.className = `font-bold ${statusColorClass}`;
    }

    const container = DOM.modalBreakdownContainer;
    if (container) {
      container.innerHTML = Templates.breakdownGrid(
        breakdown.s_thermal,
        breakdown.s_carbon,
        breakdown.s_energy,
        breakdown.ratio,
        breakdown.reqR,
        metrics.R0,
        metrics.co2,
        metrics.paybackText,
        metrics.weight,
        tipsHTML,
        metrics.energy
      );
    }

    const modal = DOM.efficiencyModal;
    if (modal) modal.classList.add('modal-active');
    lucide.createIcons();
  },

  closeEfficiencyModal() {
    const modal = DOM.efficiencyModal;
    if (modal) modal.classList.remove('modal-active');
  },

  showFatalError(message) {
    alert(message); // Простой вывод ошибки при сбое загрузки
  },

  setupPointerDragEvents(card, index) {
    const handle = card.querySelector('.drag-handle');
    if (!handle) return;
    
    let dragActive = false;
    let dragElement = null;
    let draggedIndex = -1;
    let projectedIndex = -1;
    let startY = 0;
    let minDeltaY = 0;
    let maxDeltaY = 0;
    let cardsInDom = [];
    let initialCenters = [];
    let cardHeights = [];
    const cardGap = 12;

    const onPointerMove = (e) => {
      if (!dragActive || !dragElement) return;

      let deltaY = e.clientY - startY;
      deltaY = Math.max(minDeltaY, Math.min(maxDeltaY, deltaY));
      dragElement.style.transform = `translateY(${deltaY}px)`;
      
      const originalCenter = initialCenters[draggedIndex];
      const currentCenter = originalCenter + deltaY;
      
      let newProjected = draggedIndex;
      const draggedHeight = cardHeights[draggedIndex];

      cardsInDom.forEach((c, idx) => {
        if (idx === draggedIndex) return;

        const itemCenter = initialCenters[idx];
        const shiftOffset = draggedHeight + cardGap;

        if (idx < draggedIndex) {
          if (currentCenter < itemCenter) {
            c.style.transform = `translateY(${shiftOffset}px)`;
            if (newProjected > idx) newProjected = Math.min(newProjected, idx);
          } else {
            c.style.transform = 'translateY(0px)';
          }
        } else {
          if (currentCenter > itemCenter) {
            c.style.transform = `translateY(-${shiftOffset}px)`;
            if (newProjected < idx) newProjected = Math.max(newProjected, idx);
          } else {
            c.style.transform = 'translateY(0px)';
          }
        }
      });

      projectedIndex = newProjected;
    };

    const onPointerUp = (e) => {
      if (!dragActive) return;
      dragActive = false;

      handle.releasePointerCapture(e.pointerId);
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', onPointerUp);

      let targetSnapY = 0;
      if (projectedIndex !== draggedIndex) {
        if (projectedIndex < draggedIndex) {
          for (let i = projectedIndex; i < draggedIndex; i++) {
            targetSnapY -= (cardHeights[i] + cardGap);
          }
        } else {
          for (let i = draggedIndex + 1; i <= projectedIndex; i++) {
            targetSnapY += (cardHeights[i] + cardGap);
          }
        }
      }

      dragElement.style.transition = 'transform 0.28s cubic-bezier(0.2, 0.8, 0.2, 1)';
      dragElement.style.transform = `translateY(${targetSnapY}px)`;

      setTimeout(() => {
        if (dragElement) {
          dragElement.style.zIndex = '';
          dragElement.style.transition = '';
          dragElement.style.transform = '';
          dragElement.classList.remove('shadow-2xl', 'ring-accent-strong/80', 'scale-[1.02]', 'bg-panel/90', 'backdrop-blur-sm');
        }
        
        cardsInDom.forEach(c => {
          c.style.transition = '';
          c.style.transform = '';
        });

        if (projectedIndex !== draggedIndex) {
          if (this.onLayersReordered) {
            this.onLayersReordered(draggedIndex, projectedIndex);
          }
        } else {
          if (this.onDragCanceled) {
            this.onDragCanceled();
          }
        }

        dragElement = null;
        draggedIndex = -1;
      }, 280);
    };

    handle.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      
      dragActive = true;
      dragElement = card;
      draggedIndex = index;
      projectedIndex = index;
      startY = e.clientY;
      
      const container = DOM.layersContainer;
      cardsInDom = Array.from(container.children);
      
      const containerRect = container.getBoundingClientRect();
      const cardRect = dragElement.getBoundingClientRect();
      cardHeights = cardsInDom.map(c => c.offsetHeight);
      
      const maxOvershoot = 30;
      minDeltaY = -(cardRect.top - containerRect.top) - maxOvershoot;
      maxDeltaY = (containerRect.bottom - cardRect.bottom) + maxOvershoot;
      
      initialCenters = cardsInDom.map(c => {
        const r = c.getBoundingClientRect();
        return (r.top - containerRect.top) + r.height / 2;
      });

      dragElement.style.zIndex = '50';
      dragElement.style.transition = 'none';
      dragElement.classList.add('shadow-2xl', 'ring-accent-strong/80', 'scale-[1.02]', 'bg-panel/90', 'backdrop-blur-sm');
      
      cardsInDom.forEach((c, idx) => {
        if (idx !== draggedIndex) {
          c.style.transition = 'transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1)';
        }
      });

      handle.addEventListener('pointermove', onPointerMove);
      handle.addEventListener('pointerup', onPointerUp);
    });
  }
};
