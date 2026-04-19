// ============================================================
//  PURE FUNCTIONAL UTILITIES (mirrors Python analysis.py)
// ============================================================

// All data stored as frozen (immutable) tuples-of-objects
const freeze = arr => Object.freeze(arr.map(r => Object.freeze({ ...r })));

// map / filter / reduce wrappers (pure, returning new arrays)
const mapData = (data, fn) => data.map(fn);
const filterData = (data, fn) => data.filter(fn);
const reduceData = (data, fn, init) => data.reduce(fn, init);

// Pure aggregation functions
const calcAvg = values => reduceData(values, (acc, x) => acc + x, 0) / (values.length || 1);
const calcMax = values => reduceData(values, (acc, x) => x > acc ? x : acc, -Infinity);
const calcMin = values => reduceData(values, (acc, x) => x < acc ? x : acc, Infinity);

// Immutable dataset reference
let weatherData = freeze([]);

// ============================================================
//  CSV PARSER
// ============================================================
function parseCSV(text) {
  const lines = text.trim().split('\n');
  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1);

  // map each line to an immutable record
  return freeze(
    mapData(rows, row => {
      const cells = row.split(',').map(c => c.trim());
      return {
        date: cells[header.indexOf('date')] ?? '',
        temperature: parseFloat(cells[header.indexOf('temperature')]) ?? 0,
        humidity: parseFloat(cells[header.indexOf('humidity')]) ?? 0,
        precipitation: parseFloat(cells[header.indexOf('precipitation')]) ?? 0,
      };
    }).filter(r => !isNaN(r.temperature))
  );
}

// ============================================================
//  WEATHER CONDITION LOGIC (pure)
// ============================================================
function classifyDay(record) {
  const { temperature: t, precipitation: p } = record;
  if (p > 10) return { label: 'Heavy Rain', emoji: '⛈️', theme: 'rainy' };
  if (p > 5) return { label: 'Rainy', emoji: '🌧️', theme: 'rainy' };
  if (p > 0) return { label: 'Drizzle', emoji: '🌦️', theme: 'rainy' };
  if (t >= 32) return { label: 'Scorching', emoji: '🌋', theme: 'hot' };
  if (t >= 30) return { label: 'Hot', emoji: '☀️', theme: 'hot' };
  if (t >= 25) return { label: 'Warm', emoji: '⛅', theme: 'mild' };
  if (t >= 15) return { label: 'Mild', emoji: '🌤️', theme: 'mild' };
  if (t >= 5) return { label: 'Cold', emoji: '🧊', theme: 'cold' };
  return { label: 'Freezing', emoji: '❄️', theme: 'cold' };
}

function getTempBadgeClass(t) {
  if (t >= 31) return 'temp-hot';
  if (t >= 28) return 'temp-warm';
  if (t >= 20) return 'temp-mild';
  return 'temp-cold';
}

// ============================================================
//  THEME ENGINE
// ============================================================
const THEME_META = {
  hot: { label: '☀️ Hot Mode', icon: '🔆', badge: '🌡️ HOT' },
  cold: { label: '❄️ Cold Mode', icon: '🧊', badge: '🧊 COLD' },
  rainy: { label: '🌧️ Rain Mode', icon: '💧', badge: 'RAINY' },
  mild: { label: '🌤️ Mild Mode', icon: '⛅', badge: '🌤️ MILD' },
};

let currentTheme = 'mild';

function applyTheme(theme) {
  if (theme === currentTheme && document.body.classList.contains(`theme-${theme}`)) return;
  document.body.classList.remove('theme-hot', 'theme-cold', 'theme-rainy');
  if (theme !== 'mild') document.body.classList.add(`theme-${theme}`);
  currentTheme = theme;

  const meta = THEME_META[theme] || THEME_META.mild;
  document.getElementById('theme-badge').innerHTML =
    `<span class="badge-icon">${meta.icon}</span><span id="theme-label">${meta.label}</span>`;

  updateChartColors();

  // ZEN MODE: Switch audio track dynamically!
  if (typeof zenModeEnabled !== 'undefined' && zenModeEnabled && typeof ytPlayer !== 'undefined' && ytPlayer.loadVideoById) {
    const ZEN_TRACKS_INT = { 
      hot: { id: 'lE6RYpe9IT0', start: 25 },    // Summer beat, skips intro
      cold: { id: '4K5O_yO_bI8', start: 10 }, 
      rainy: { id: 'mPZkdNFkNps', start: 5 }, 
      mild: { id: '4xDzrDKgd1U', start: 15 } 
    };
    const tObj = ZEN_TRACKS_INT[theme] || ZEN_TRACKS_INT['mild'];
    ytPlayer.loadVideoById({ videoId: tObj.id, startSeconds: tObj.start });
    setTimeout(() => ytPlayer.playVideo(), 500); // Force play immediately after buffering load
  }
}

// Determine overall theme from entire dataset
function deriveDatasetTheme(data) {
  const temps = mapData(data, r => r.temperature);
  const avgT = calcAvg(temps);

  // If > 30% of days have precipitation > 5mm, classify as rainy dataset
  const rainyDays = filterData(data, r => r.precipitation > 5).length;
  const isMostlyRainy = (data.length > 0) && (rainyDays / data.length) > 0.3;

  if (isMostlyRainy) return 'rainy';
  if (avgT >= 28) return 'hot';
  if (avgT <= 18) return 'cold';
  return 'mild';
}

// ============================================================
//  CHART INSTANCES + RENDERING
// ============================================================
let chartInstances = {};

function getAccentColor() {
  return getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#3b82f6';
}

function getGlassBorder() {
  return getComputedStyle(document.documentElement).getPropertyValue('--glass-border').trim() || 'rgba(255,255,255,0.12)';
}

function buildCharts(data) {
  const labels = mapData(data, r => r.date);
  const temps = mapData(data, r => r.temperature);
  const hums = mapData(data, r => r.humidity);
  const precs = mapData(data, r => r.precipitation);
  const accent = getAccentColor();

  // Destroy existing
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const chartDefaults = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { labels: { color: 'rgba(255,255,255,0.65)', font: { family: 'Inter', size: 12 } } },
      tooltip: {
        backgroundColor: 'rgba(10,14,26,0.9)',
        titleColor: '#fff',
        bodyColor: 'rgba(255,255,255,0.8)',
        borderColor: accent,
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
      }
    },
    scales: {
      x: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: getGlassBorder() } },
      y: { ticks: { color: 'rgba(255,255,255,0.5)', font: { size: 11 } }, grid: { color: getGlassBorder() } }
    }
  };

  // 1. Temperature line chart
  chartInstances.temp = new Chart(document.getElementById('chart-temp'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: temps,
        borderColor: accent,
        backgroundColor: `${accent}28`,
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: accent,
        pointRadius: 5,
        pointHoverRadius: 8,
      }]
    },
    options: { ...chartDefaults }
  });

  // 2. Humidity + Precipitation bar/line
  chartInstances.humPrecip = new Chart(document.getElementById('chart-hum-precip'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Humidity (%)',
          data: hums,
          backgroundColor: `${accent}55`,
          borderColor: accent,
          borderWidth: 1.5,
          borderRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Precipitation (mm)',
          type: 'line',
          data: precs,
          borderColor: '#b0d4f1',
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#b0d4f1',
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      ...chartDefaults,
      scales: {
        x: chartDefaults.scales.x,
        y: { ...chartDefaults.scales.y, position: 'left', title: { display: true, text: 'Humidity %', color: 'rgba(255,255,255,0.5)' } },
        y1: { ...chartDefaults.scales.y, position: 'right', grid: { drawOnChartArea: false }, title: { display: true, text: 'Precip mm', color: 'rgba(255,255,255,0.5)' } }
      }
    }
  });

  // 3. Temperature distribution (stacked histogram via bar)
  const buckets = ['<20°C', '20-25°C', '25-30°C', '30-35°C', '>35°C'];
  const counts = reduceData(temps, (acc, t) => {
    const i = t < 20 ? 0 : t < 25 ? 1 : t < 30 ? 2 : t < 35 ? 3 : 4;
    acc[i]++;
    return acc;
  }, [0, 0, 0, 0, 0]);

  const distColors = ['#60a5fa', '#4ade80', '#facc15', '#fb923c', '#f87171'];
  chartInstances.tempDist = new Chart(document.getElementById('chart-temp-dist'), {
    type: 'bar',
    data: {
      labels: buckets,
      datasets: [{
        label: 'Days',
        data: counts,
        backgroundColor: distColors,
        borderRadius: 8,
        borderWidth: 0,
      }]
    },
    options: {
      ...chartDefaults,
      scales: {
        x: chartDefaults.scales.x,
        y: { ...chartDefaults.scales.y, ticks: { ...chartDefaults.scales.y.ticks, stepSize: 1 } }
      },
      plugins: { ...chartDefaults.plugins, legend: { display: false } }
    }
  });

  // 4. Conditions doughnut
  const condCounts = reduceData(data, (acc, r) => {
    const c = classifyDay(r).label;
    acc[c] = (acc[c] || 0) + 1;
    return acc;
  }, {});

  const condLabels = Object.keys(condCounts);
  const condVals = Object.values(condCounts);
  const condColors = condLabels.map((_, i) => {
    const palette = ['#3b82f6', '#f97316', '#60c0ff', '#b0d4f1', '#fb923c', '#4ade80', '#facc15'];
    return palette[i % palette.length];
  });

  chartInstances.conditions = new Chart(document.getElementById('chart-conditions'), {
    type: 'doughnut',
    data: {
      labels: condLabels,
      datasets: [{ data: condVals, backgroundColor: condColors, borderWidth: 0, hoverOffset: 10 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.65)', font: { family: 'Inter', size: 12 }, padding: 16 } },
        tooltip: chartDefaults.plugins.tooltip
      }
    }
  });
}

function updateChartColors() {
  if (!weatherData.length) return;
  buildCharts(weatherData);
}

// ============================================================
//  KPIs
// ============================================================
function renderKPIs(data) {
  const temps = mapData(data, r => r.temperature);
  const precs = mapData(data, r => r.precipitation);
  const hums = mapData(data, r => r.humidity);

  const hotDays = filterData(data, r => r.temperature > 30).length;
  const rainyDays = filterData(data, r => r.precipitation > 5).length;

  const minT = calcMin(temps);
  const maxT = calcMax(temps);

  document.getElementById('kpi-avg-temp').textContent = `${calcAvg(temps).toFixed(1)}°C`;
  document.getElementById('kpi-max-temp').textContent = `${maxT.toFixed(1)}°C`;
  document.getElementById('kpi-min-temp').textContent = `${minT.toFixed(1)}°C`;
  document.getElementById('kpi-temp-range').textContent = `${(maxT - minT).toFixed(1)}°C`;
  document.getElementById('kpi-max-precip').textContent = `${calcMax(precs).toFixed(1)} mm`;
  document.getElementById('kpi-avg-humidity').textContent = `${calcAvg(hums).toFixed(1)}%`;
  document.getElementById('kpi-hot-days').textContent = hotDays;
  document.getElementById('kpi-rainy-days').textContent = rainyDays;
  document.getElementById('kpi-total-days').textContent = data.length;
}

// ============================================================
//  TABLE
// ============================================================
function renderTable(data) {
  const tbody = document.getElementById('data-table-body');
  tbody.innerHTML = '';

  mapData(data, r => {
    const cond = classifyDay(r);
    const tc = getTempBadgeClass(r.temperature);
    const pc = r.precipitation > 5 ? 'precip-heavy' : 'precip-light';
    return `<tr>
      <td>${r.date}</td>
      <td><span class="temp-badge ${tc}">${cond.emoji} ${r.temperature.toFixed(1)}°C</span></td>
      <td>${r.humidity.toFixed(1)}%</td>
      <td><span class="precip-badge ${pc}">${r.precipitation.toFixed(1)} mm</span></td>
      <td>${cond.label}</td>
    </tr>`;
  }).forEach(html => { tbody.insertAdjacentHTML('beforeend', html); });
}

// ============================================================
//  SLIDER — Today Card
// ============================================================
function updateTodayCard(record) {
  const cond = classifyDay(record);

  document.getElementById('today-temp-val').innerHTML = `${record.temperature.toFixed(1)}<sup>°C</sup>`;
  document.getElementById('today-desc').textContent = cond.label;
  document.getElementById('today-humidity').textContent = `${record.humidity.toFixed(1)}%`;
  document.getElementById('today-precip').textContent = `${record.precipitation.toFixed(1)} mm`;
  document.getElementById('today-condition').textContent = cond.emoji;
  document.getElementById('weather-emoji').textContent = cond.emoji;
  document.getElementById('today-date-label').innerHTML =
    `<span style="font-size:0.88rem;color:var(--text-muted);">${record.date}</span>`;

  applyTheme(cond.theme);
}

function initSlider(data) {
  const slider = document.getElementById('day-slider');
  slider.max = data.length - 1;
  slider.value = 0;

  slider.addEventListener('input', () => {
    const idx = parseInt(slider.value, 10);
    document.getElementById('slider-day-label').textContent = `Day ${idx + 1} of ${data.length}`;
    updateTodayCard(data[idx]);
  });

  document.getElementById('slider-day-label').textContent = `Day 1 of ${data.length}`;
  updateTodayCard(data[0]);
}

// ============================================================
//  TABLE FILTER
// ============================================================
document.getElementById('filter-temp').addEventListener('input', (e) => {
  const minTemp = parseFloat(e.target.value);
  const filtered = isNaN(minTemp)
    ? weatherData
    : filterData(weatherData, r => r.temperature >= minTemp);
  renderTable(filtered);
});

// ============================================================
//  MASTER RENDER
// ============================================================
function renderDashboard(data) {
  weatherData = data;

  document.getElementById('dashboard').classList.add('visible');

  renderKPIs(data);
  buildCharts(data);
  renderTable(data);
  initSlider(data);

  const globalTheme = deriveDatasetTheme(data);
  applyTheme(globalTheme);

  // Save to history
  saveToHistory(data, globalTheme);

  // Scroll to dashboard smoothly
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ============================================================
//  HISTORY — localStorage persistence
// ============================================================
const HISTORY_KEY = 'wda_history';
const HISTORY_MAX = 20;

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
  catch (e) { return []; }
}

function saveHistory(list) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
}

function saveToHistory(data, theme) {
  const list = loadHistory();
  const temps = mapData(data, r => r.temperature);
  const entry = {
    id: Date.now(),
    savedAt: new Date().toISOString(),
    theme,
    records: data.length,
    avgTemp: +calcAvg(temps).toFixed(1),
    maxTemp: +calcMax(temps).toFixed(1),
    minTemp: +calcMin(temps).toFixed(1),
    dateFrom: data[0]?.date || '',
    dateTo: data[data.length - 1]?.date || '',
    rows: data.map(r => ({ ...r })),   // serialisable copy
  };
  list.unshift(entry);
  if (list.length > HISTORY_MAX) list.length = HISTORY_MAX;
  saveHistory(list);
  updateHistoryBadge();
}

function updateHistoryBadge() {
  const list = loadHistory();
  const badge = document.getElementById('hist-count');
  if (list.length > 0) {
    badge.textContent = list.length;
    badge.style.display = 'flex';
  } else {
    badge.style.display = 'none';
  }
}

const THEME_ICONS = { hot: '☀️', cold: '❄️', rainy: '🌧️', mild: '🌤️' };

function renderHistoryList() {
  const list = loadHistory();
  const body = document.getElementById('drawer-body');
  body.innerHTML = '';

  if (!list.length) {
    body.innerHTML = `<div class="history-empty"><span class="he-icon"></span>No history yet.<br>Analyze some data to see entries here.</div>`;
    return;
  }

  list.forEach((entry, idx) => {
    const d = new Date(entry.savedAt);
    const when = d.toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const icon = THEME_ICONS[entry.theme] || '🌤️';
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
          <div class="hc-top">
            <span class="hc-time">${when}</span>
            <span class="hc-theme-badge">${icon} ${entry.theme.toUpperCase()}</span>
          </div>
          <div class="hc-stats">
            <div class="hc-stat"><span class="s-label">Records</span><span class="s-val">${entry.records}</span></div>
            <div class="hc-stat"><span class="s-label">Avg Temp</span><span class="s-val">${entry.avgTemp}°C</span></div>
            <div class="hc-stat"><span class="s-label">Max</span><span class="s-val">${entry.maxTemp}°C</span></div>
            <div class="hc-stat"><span class="s-label">Min</span><span class="s-val">${entry.minTemp}°C</span></div>
          </div>
          ${entry.dateFrom ? `<div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:12px;">${entry.dateFrom} → ${entry.dateTo}</div>` : ''}
          <div class="hc-actions">
            <button class="btn-restore" onclick="restoreSession(${idx})">Restore</button>
            <button class="btn-del-entry" onclick="deleteHistoryEntry(${idx})">✕</button>
          </div>`;
    body.appendChild(card);
  });
}

function openHistory() {
  renderHistoryList();
  document.getElementById('history-overlay').classList.add('open');
  document.getElementById('history-drawer').classList.add('open');
}

function closeHistory() {
  document.getElementById('history-overlay').classList.remove('open');
  document.getElementById('history-drawer').classList.remove('open');
}

function restoreSession(idx) {
  const list = loadHistory();
  if (!list[idx]) return;
  const rows = freeze(list[idx].rows);
  closeHistory();
  renderDashboard(rows);
  // Also repopulate the manual entry table
  manualEntries = list[idx].rows.map(r => ({ ...r }));
  refreshEntryTable();
}

function deleteHistoryEntry(idx) {
  const list = loadHistory();
  list.splice(idx, 1);
  saveHistory(list);
  updateHistoryBadge();
  renderHistoryList();
}

function clearHistory() {
  if (!confirm('Clear all history? This cannot be undone.')) return;
  localStorage.removeItem(HISTORY_KEY);
  updateHistoryBadge();
  renderHistoryList();
}

// Init badge on page load
updateHistoryBadge();

// Close drawer on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeHistory();
});

// ============================================================
//  SAMPLE DATA
// ============================================================
const SAMPLE_CSV = `Date,Temperature,Humidity,Precipitation
2023-08-01,28.5,60.2,0.0
2023-08-02,31.2,55.1,0.0
2023-08-03,32.5,50.0,0.0
2023-08-04,29.8,65.5,5.2
2023-08-05,27.3,75.0,12.5
2023-08-06,26.5,80.2,2.1
2023-08-07,30.1,62.0,0.0
2023-08-08,31.5,55.0,0.0
2023-08-09,33.0,40.5,0.0
2023-08-10,25.4,85.0,20.5`;

// ============================================================
//  TAB SWITCHING
// ============================================================
function switchTab(tab) {
  ['manual', 'csv', 'api'].forEach(t => {
    document.getElementById(`tab-${t}`).classList.toggle('active', t === tab);
    document.getElementById(`panel-${t}`).classList.toggle('active', t === tab);
  });
}

// ============================================================
//  MANUAL ENTRY STATE
// ============================================================
let manualEntries = []; // mutable staging list (converted to frozen on analyze)

function addEntry() {
  const dateEl = document.getElementById('entry-date');
  const tempEl = document.getElementById('entry-temp');
  const humEl = document.getElementById('entry-humidity');
  const precipEl = document.getElementById('entry-precip');

  const statusEl = document.getElementById('manual-status');
  statusEl.style.display = 'none';
  statusEl.innerHTML = '';

  const date = dateEl.value.trim();
  const temp = parseFloat(tempEl.value);
  const hum = parseFloat(humEl.value);
  const precip = parseFloat(precipEl.value);

  // Validate
  let errors = [];
  if (!date) errors.push('Date is required');
  if (isNaN(temp)) errors.push('Temperature must be a number');
  if (isNaN(hum)) errors.push('Humidity must be a number');
  if (isNaN(precip)) errors.push('Precipitation must be a number');

  if (errors.length) {
    statusEl.innerHTML = 'Please fix: ' + errors.join(', ');
    statusEl.style.display = 'block';
    return;
  }

  const entry = { date, temperature: temp, humidity: hum, precipitation: precip };
  manualEntries.push(entry);

  // Clear inputs (keep date incremented by 1 day for convenience)
  try {
    const d = new Date(date + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    dateEl.value = d.toISOString().split('T')[0];
  } catch (e) { dateEl.value = ''; }
  tempEl.value = '';
  humEl.value = '';
  precipEl.value = '';
  tempEl.focus();

  refreshEntryTable();
}

function refreshEntryTable() {
  const noMsg = document.getElementById('no-entries-msg');
  const table = document.getElementById('entry-table');
  const tbody = document.getElementById('entry-tbody');
  const analyzeBtn = document.getElementById('analyze-manual-btn');

  if (manualEntries.length === 0) {
    noMsg.style.display = '';
    table.style.display = 'none';
    analyzeBtn.disabled = true;
    analyzeBtn.style.opacity = '0.45';
    analyzeBtn.style.cursor = 'not-allowed';
    return;
  }

  noMsg.style.display = 'none';
  table.style.display = '';
  analyzeBtn.disabled = false;
  analyzeBtn.style.opacity = '1';
  analyzeBtn.style.cursor = 'pointer';

  tbody.innerHTML = '';
  manualEntries.forEach((r, i) => {
    const cond = classifyDay(r);
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${r.date}</td>
        <td><strong style="color:var(--accent)">${r.temperature.toFixed(1)}°C</strong></td>
        <td>${r.humidity.toFixed(1)}%</td>
        <td>${r.precipitation.toFixed(1)} mm</td>
        <td>${cond.emoji} ${cond.label}</td>
        <td><button class="del-btn" onclick="deleteEntry(${i})" title="Remove row">✕</button></td>
      </tr>`);
  });
}

function deleteEntry(i) {
  manualEntries.splice(i, 1);
  refreshEntryTable();
}

function clearEntries() {
  if (manualEntries.length && !confirm('Clear all entered rows?')) return;
  manualEntries = [];
  refreshEntryTable();
  document.getElementById('dashboard').classList.remove('visible');
}

function analyzeManual() {
  if (!manualEntries.length) return;
  // Sort by date
  const sorted = [...manualEntries].sort((a, b) => a.date.localeCompare(b.date));
  renderDashboard(freeze(sorted));
}

// Allow pressing Enter on inputs to add row
['entry-temp', 'entry-humidity', 'entry-precip'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') addEntry();
  });
});

// Default date to today
(function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('entry-date').value = today;
})();

// ============================================================
//  SAMPLE DATA BUTTON
// ============================================================
document.getElementById('load-sample-btn').addEventListener('click', () => {
  const parsed = parseCSV(SAMPLE_CSV);
  // Populate the manual entry table with sample rows for transparency
  manualEntries = parsed.map(r => ({ ...r }));
  refreshEntryTable();
  renderDashboard(parseCSV(SAMPLE_CSV));
});

// ============================================================
//  CSV FILE UPLOAD
// ============================================================
document.getElementById('csv-file-input').addEventListener('change', function () {
  if (!this.files.length) return;
  const reader = new FileReader();
  reader.onload = e => renderDashboard(parseCSV(e.target.result));
  reader.readAsText(this.files[0]);
});

// Drag & drop on upload zone
const zone = document.getElementById('upload-zone');
zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragging'); });
zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
zone.addEventListener('drop', e => {
  e.preventDefault();
  zone.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) { const r = new FileReader(); r.onload = ev => renderDashboard(parseCSV(ev.target.result)); r.readAsText(file); }
});

// ============================================================
//  OPENWEATHERMAP API
// ============================================================
// Main orchestrator function matching the full requested flow exactly
async function fetchWeatherData() {
  // 1. User enters city (along with tense and days)
  const city = document.getElementById('api-city').value.trim();
  const tense = document.getElementById('api-tense').value;
  const days = parseInt(document.getElementById('api-days').value, 10);

  // 2. Input Validation (check empty city / invalid characters)
  if (!validateWeatherInput(city, days)) return;

  setFetchStatus('Fetching weather data...', true);

  try {
    // 3. API Request Module (fetch calls Weather API)
    const rawResponse = await executeAPIRequest(city, tense, days);

    // 4. API Response Handler (JSON received)
    const jsonData = await handleAPIResponse(rawResponse);

    // 5. Data Cleaning Layer (handle missing rain, convert units, remove null values)
    const cleanedData = cleanWeatherData(jsonData, tense, days);

    // 6. Data Processing Layer (calculate averages, min/max, trends)
    const processedData = processWeatherMetrics(cleanedData);

    // 7. Condition Classifier (warm / hot / rainy / cool)
    const finalData = classifyDatasetConditions(processedData);

    // 8. Table Renderer
    // 9. Visualization Engine
    // 10. Insights Generator
    // 11. Local Storage Cache
    // 12. User Interface Updates
    updateInterfaceAndCache(finalData);

    setFetchStatus(`<span style="color:#4ade80">Successfully loaded ${finalData.length} records for ${city}</span>`, false);
  } catch (error) {
    setFetchStatus(`<span style="color:#f87171">Error: ${error.message}</span>`, false);
  }
}

// ==========================================
// FLOW MODULES
// ==========================================

// 2. Input Validation Layer
function validateWeatherInput(city, days) {
  const statusEl = document.getElementById('api-status');
  if (!city) {
    statusEl.innerHTML = '<span style="color:#f87171">⚠️ City name cannot be empty</span>';
    return false;
  }
  if (!/^[a-zA-Z\s\-\,]+$/.test(city)) {
    statusEl.innerHTML = '<span style="color:#f87171">⚠️ City contains invalid characters</span>';
    return false;
  }
  if (isNaN(days) || days < 1 || days > 16) {
    statusEl.innerHTML = '<span style="color:#f87171">⚠️ Please enter a valid number of days (1-16)</span>';
    return false;
  }
  return true;
}

// 3. API Request Module
async function executeAPIRequest(city, tense, days) {
  // Geocoding request to find latitude and longitude for the given city
  const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  const geoData = await geoRes.json();

  if (!geoData.results || geoData.results.length === 0) {
    throw new Error('City not found. Please try another name.');
  }

  const { latitude, longitude } = geoData.results[0];

  // Weather request based on user's timeline preference
  let url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean&timezone=auto`;

  if (tense === 'future') {
    url += `&forecast_days=${days}`;
  } else {
    // past
    url += `&past_days=${days}&forecast_days=0`;
  }

  return fetch(url);
}

// 4. API Response Handler
async function handleAPIResponse(response) {
  if (!response.ok) {
    throw new Error(`API HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (data.error) throw new Error("API provided an error response");
  return data;
}

// 5. Data Cleaning Layer
function cleanWeatherData(data, tense, days) {
  const daily = data.daily;
  if (!daily) throw new Error("No daily data received");

  const dates = daily.time || [];
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const hums = daily.relative_humidity_2m_mean || [];
  const precips = daily.precipitation_sum || [];

  let cleanedArray = [];

  for (let i = 0; i < dates.length; i++) {
    // Remove null values, convert units if necessary, handle missing rain
    const maxT = maxTemps[i] === null ? 0 : maxTemps[i];
    const minT = minTemps[i] === null ? 0 : minTemps[i];
    const h = hums[i] === null ? 50 : hums[i];
    const p = precips[i] === null ? 0 : precips[i];

    cleanedArray.push({
      date: dates[i],
      maxTemp: maxT,
      minTemp: minT,
      humidity: h,
      precipitation: p
    });
  }

  // Ensure we return exactly the requested number of days
  if (tense === 'past') {
    // Open-Meteo returns past_days + 1 if forecast_days=0 is not strictly respected (sometimes it returns today)
    cleanedArray = cleanedArray.slice(0, days);
  } else {
    cleanedArray = cleanedArray.slice(0, days);
  }
  return cleanedArray;
}

// 6. Data Processing Layer
function processWeatherMetrics(cleanedData) {
  // Calculate averages, mapping the max/min object to the singular expected temp
  return cleanedData.map(day => {
    // We average max and min to get a representative daily temperature
    const avgTemp = (day.maxTemp + day.minTemp) / 2;
    return {
      date: day.date,
      temperature: Number(avgTemp.toFixed(1)),
      humidity: Number(day.humidity.toFixed(1)),
      precipitation: Number(day.precipitation.toFixed(1))
    };
  });
}

// 7. Condition Classifier
function classifyDatasetConditions(processedData) {
  const frozen = freeze(processedData);
  const globalTheme = deriveDatasetTheme(frozen);
  applyTheme(globalTheme);
  // Pure functional logic - return immutable state array after applying side effects
  return frozen;
}

// 8, 9, 10, 11, 12. Interface Updates & Output Generation
function updateInterfaceAndCache(finalData) {
  weatherData = finalData;
  document.getElementById('dashboard').classList.add('visible');

  // 10. Insights Generator
  renderKPIs(finalData);

  // 8. Table Renderer
  renderTable(finalData);

  // 9. Visualization Engine
  buildCharts(finalData);

  // 12. User Interface Updates
  initSlider(finalData);
  document.getElementById('dashboard').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 11. Local Storage Cache
  saveToHistory(finalData, currentTheme);
}

// Status UI Helper
function setFetchStatus(html, isLoading) {
  const statusEl = document.getElementById('api-status');
  statusEl.innerHTML = html;
  const btn = document.getElementById('fetch-api-btn');
  btn.disabled = isLoading;
  btn.style.opacity = isLoading ? '0.5' : '1';
}

// ============================================================
//  REALISTIC WEATHER PHYSICS ENGINE
// ============================================================
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  let splashes = [];
  let W, H;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makeParticle() {
    const isCold = currentTheme === 'cold';
    const isRainy = currentTheme === 'rainy';
    return {
      x: Math.random() * W,
      y: Math.random() * H, // spawn on screen so it doesn't take 5 seconds to fall
      r: isCold ? 2 + Math.random() * 3 : 0.8 + Math.random() * 1.5, // size
      l: isRainy ? 15 + Math.random() * 20 : 0, // length of rain drop
      vx: isRainy ? -1.5 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.5, // wind shear
      vy: isRainy ? 20 + Math.random() * 15 : 0.5 + Math.random() * 1.2, // gravity
      alpha: isCold ? 0.3 + Math.random() * 0.5 : 0.3 + Math.random() * 0.5,
      oscillationSpeed: Math.random() * 0.002,
      oscillationOffset: Math.random() * Math.PI * 2
    };
  }

  function makeSplash(x, y) {
    return {
      x: x,
      y: y,
      r: 1,
      maxR: 4 + Math.random() * 6,
      alpha: 0.4,
      vy: -1 - Math.random() * 2,
      vx: (Math.random() - 0.5) * 2
    };
  }

  // Populate pool initially
  for (let i = 0; i < 250; i++) particles.push(makeParticle());

  let engineActiveTheme = currentTheme;

  function draw() {
    // If the theme changed, instantly reconstruct the physics environment!
    if (engineActiveTheme !== currentTheme) {
      engineActiveTheme = currentTheme;
      particles = [];
      splashes = [];
      for (let i = 0; i < 250; i++) particles.push(makeParticle());
    }

    ctx.clearRect(0, 0, W, H);

    // Only render physics for rain and snow
    if (currentTheme !== 'rainy' && currentTheme !== 'cold') {
      requestAnimationFrame(draw);
      return;
    }

    // Process Splashes
    if (currentTheme === 'rainy') {
      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(200, 230, 255, ${s.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        s.r += 0.3;
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.15; // gravity on splash
        s.alpha -= 0.025;

        if (s.alpha <= 0) splashes.splice(i, 1);
      }
    }

    // Process Falling Particles
    particles.forEach(p => {
      if (currentTheme === 'rainy') {
        // High-velocity rain streaks
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - p.vx * 2, p.y - p.l); // Calculate tail based on velocity vector
        ctx.strokeStyle = `rgba(200, 230, 255, ${p.alpha})`;
        ctx.lineWidth = p.r;
        ctx.lineCap = 'round';
        ctx.stroke();

        p.x += p.vx;
        p.y += p.vy;

        // Ground collision
        if (p.y > H) {
          if (Math.random() > 0.5) splashes.push(makeSplash(p.x, H));
          Object.assign(p, makeParticle());
          p.y = -20;
          p.x = Math.random() * W;
        }
      } else if (currentTheme === 'cold') {
        // Gently drifting snow
        const sway = Math.sin(Date.now() * p.oscillationSpeed + p.oscillationOffset) * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx + sway;
        p.y += p.vy;

        // Loop around
        if (p.y > H + 10) {
          Object.assign(p, makeParticle());
          p.y = -20;
          p.x = Math.random() * W;
        }
      }
    });

    requestAnimationFrame(draw);
  }

  draw(); // Kick off the physics engine!
})();

// ============================================================
//  ZEN MODE (YouTube Ambient Audio)
// ============================================================
let ytPlayer;
let zenModeEnabled = true;

const ZEN_TRACKS = {
  hot: { id: 'lE6RYpe9IT0', start: 25 },    // Instantly skips the intro
  cold: { id: '4K5O_yO_bI8', start: 10 },
  rainy: { id: 'mPZkdNFkNps', start: 5 },
  mild: { id: '4xDzrDKgd1U', start: 15 }
};

// Called automatically by YouTube API once ready
window.onYouTubeIframeAPIReady = function () {
  const tObj = ZEN_TRACKS[currentTheme] || ZEN_TRACKS['mild'];
  ytPlayer = new YT.Player('yt-player', {
    height: '240',
    width: '320',
    playerVars: { 'autoplay': 1, 'controls': 0, 'loop': 1, 'playlist': tObj.id },
    events: {
      'onReady': function (event) {
        if (zenModeEnabled) {
          event.target.loadVideoById({ videoId: tObj.id, startSeconds: tObj.start });
          setTimeout(() => event.target.playVideo(), 200);
        }
      }
    }
  });
};

function toggleZenMode() {
  const btn = document.getElementById('zen-btn');
  const label = document.getElementById('zen-label');

  if (!ytPlayer || !ytPlayer.playVideo) {
    alert("Audio engine is still loading or blocked by your browser. Please wait a second!");
    return;
  }

  zenModeEnabled = !zenModeEnabled;

  if (zenModeEnabled) {
    btn.classList.add('active');
    label.textContent = 'Zen: ON';

    // Play track based on current theme!
    const tObj = ZEN_TRACKS[currentTheme] || ZEN_TRACKS['mild'];
    ytPlayer.loadVideoById({ videoId: tObj.id, startSeconds: tObj.start });
    setTimeout(() => ytPlayer.playVideo(), 200); // Trigger play safely
  } else {
    btn.classList.remove('active');
    label.textContent = 'Zen: OFF';
    ytPlayer.pauseVideo();
  }
}

