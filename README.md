
<div align="center">

# 🌦️ Weather Analyzer

**A cinematic, full-stack weather data analysis platform with real-time API integration, procedural audio, and immersive physics simulations.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.x-FF6384?style=for-the-badge&logo=chart.js&logoColor=white)](https://chartjs.org)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural-00C7B7?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Live Features](#-live-features)
- [Tech Stack](#-tech-stack)
- [Project Architecture](#-project-architecture)
- [Getting Started](#-getting-started)
- [Data Input Methods](#-data-input-methods)
- [Dashboard & Analytics](#-dashboard--analytics)
- [Zen Mode — Procedural Audio Engine](#-zen-mode--procedural-audio-engine)
- [Weather Physics Engine](#-weather-physics-engine)
- [Functional Programming Design](#-functional-programming-design)
- [API Integration](#-api-integration)
- [Data Persistence](#-data-persistence)
- [Future Scope](#-future-scope)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌐 Overview

**Weather Analyzer** is a premium, full-stack web application that transforms raw weather data into a rich, immersive analytical experience. Whether you're uploading a local CSV, manually entering observations, or pulling live forecast data from the internet, the app instantly renders cinematic dashboards with interactive charts, a physics-accurate particle engine, and a generative ambient audio system that responds to the actual weather conditions being analyzed.

The backend is built in **Python (Flask)** using a purely functional programming style — all data transformations use `map`, `filter`, and `reduce` on immutable tuples. The frontend mirrors this paradigm in **vanilla JavaScript**, making the codebase a cohesive study in functional design across two languages.

---

## ✨ Live Features

### 🗂️ Multi-Source Data Ingestion
| Source | Description |
|--------|-------------|
| 📝 **Manual Entry** | Type-in form with row-by-row validation, inline preview table, and auto-incremented dates |
| 📂 **CSV Upload** | Drag-and-drop or file-picker upload of any CSV with `Date, Temperature, Humidity, Precipitation` columns |
| 🌍 **Live API Fetch** | Pull real or forecast weather for any global city (powered by Open-Meteo — **no API key required**) |
| 🧪 **Sample Data** | One-click sample dataset to instantly demo the full dashboard |

### 📊 Analytics Dashboard
- **9 live KPI cards** — Avg/Max/Min temperature, temperature range, max precipitation, avg humidity, hot days, rainy days, total records
- **4 interactive Chart.js visualizations** — Temperature trend line, humidity/precipitation dual-axis bar+line, temperature distribution histogram, weather condition doughnut chart
- **Day Slider** — Scrub through any day in the dataset to see its specific conditions reflected on the hero card
- **Hourly Timeline** — Horizontal pill-strip timeline for each day (when live API data is used), clickable to update the main weather card
- **Data Table** — Color-coded filterable table with condition badges, temperature badges, and precipitation badges
- **Min-temp filter** — Real-time client-side filter on the data table by minimum temperature

### 🎨 Dynamic Theme Engine
Four adaptive themes triggered by weather classification:

| Theme | Condition | Visual Effect |
|-------|-----------|---------------|
| ☀️ **Hot** | Avg temp ≥ 28°C | Amber/orange gradient, heat shimmer palette |
| 🌧️ **Rainy** | >30% days with precip >5 mm | Deep blue gradient, rain physics enabled |
| ❄️ **Cold** | Avg temp ≤ 18°C | Cool indigo gradient, snowfall physics enabled |
| 🌤️ **Mild** | Default | Teal/green glassmorphism aesthetic |

### 🕊️ Zen Mode — Procedural Audio
Generative ambient soundscapes synthesized entirely in the browser using the **Web Audio API** — no audio files, no downloads, no CORS issues.

### ⚡ Weather Physics Engine
Real-time canvas particle simulation for rain (with splashes) and snow (with oscillation), driven by the active weather theme.

### 🗃️ Session History
- Up to **20 sessions** persisted in `localStorage`
- Each entry stores summary stats, date range, theme, and full dataset rows
- **Restore** any past session with one click — repopulates both the dashboard and manual entry table
- Slide-out **history drawer** with timestamps and a weather icon

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.10+ | Core language |
| **Flask** | 3.x | Web framework & API server |
| **Matplotlib** | 3.x | Server-side chart generation (PNG export) |
| **csv** (stdlib) | — | CSV parsing with immutable tuple output |
| **functools.reduce** | — | Functional aggregation in `analysis.py` |
| **typing** | — | Type annotations (`Tuple`, `Callable`) |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Vanilla JavaScript** | ES2022 | All UI logic, state, and data processing |
| **Chart.js** | 4.x | Interactive line, bar, doughnut charts |
| **Web Audio API** | Native | Procedural ambient audio synthesis |
| **Canvas API** | Native | Real-time weather particle physics engine |
| **CSS Custom Properties** | — | Theme tokens, glassmorphism, animations |
| **localStorage** | — | Session history persistence |

### External APIs (No Key Required)
| API | Purpose |
|-----|---------|
| [Open-Meteo Forecast API](https://open-meteo.com) | Daily & hourly weather forecast/historical data |
| [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) | City name → latitude/longitude resolution |

---

## 🏗️ Project Architecture

```
mppp/
└── weather_analyzer/
    ├── main.py               # Flask app — routes & API server entry point
    ├── data_loader.py        # Pure CSV reader → immutable tuple of WeatherData
    ├── analysis.py           # Functional analysis: filter, map, reduce aggregators
    ├── visualization.py      # Matplotlib chart generators (side-effect isolated)
    ├── weather_data.csv      # Sample local CSV dataset
    ├── requirements.txt      # Python dependencies
    ├── static/
    │   ├── css/
    │   │   └── style.css     # Full design system: tokens, glassmorphism, themes, animations
    │   └── js/
    │       └── main.js       # ~1400 lines — entire frontend: data, charts, audio, physics
    └── templates/
        └── index.html        # Single-page app shell served by Flask
```

### Data Flow Diagram

```
User Input (CSV / Manual / API)
        │
        ▼
  parseCSV() / manualEntries / fetchWeatherData()
        │
        ▼
  freeze() → immutable weatherData[]
        │
        ├──► renderKPIs()         → 9 stat cards
        ├──► buildCharts()        → 4 Chart.js visualizations
        ├──► renderTable()        → filterable data table
        ├──► initSlider()         → day-by-day hero card
        ├──► deriveDatasetTheme() → applyTheme()
        │         │
        │         ├──► CSS class swap (theme-hot/cold/rainy)
        │         ├──► updateAudioTrack() (Zen Mode)
        │         └──► Particle engine re-seeds
        └──► saveToHistory()      → localStorage
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10 or higher
- pip

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/SakshiiiiiJoshi/MPPP.git
cd MPPP

# 2. Install Python dependencies
pip install -r weather_analyzer/requirements.txt

# 3. Run the Flask development server
cd weather_analyzer
python main.py
```

> The app will be available at **http://localhost:5000**

### One-step Quick Start (Windows PowerShell)
```powershell
cd weather_analyzer; python main.py
```

---

## 📥 Data Input Methods

### 1. Manual Entry Tab
- Enter date, temperature (°C), humidity (%), and precipitation (mm)
- Press **Enter** or click **Add Row** — the date auto-advances by one day
- Inline preview table shows condition emoji for each row
- Click **Analyze** when ready

### 2. CSV Upload Tab
- **Drag and drop** any CSV file onto the upload zone, or use the file picker
- Required columns (case-insensitive): `Date`, `Temperature`, `Humidity`, `Precipitation`
- Example format:
  ```csv
  Date,Temperature,Humidity,Precipitation
  2024-01-01,28.5,60.2,0.0
  2024-01-02,31.2,55.1,0.0
  ```

### 3. Live API Tab
- Enter any **city name** (e.g., `Mumbai`, `London`, `New York`)
- Choose **Past** or **Future** weather
- Select 1–16 days
- Click **Fetch Weather** — data flows through a 12-step pipeline:
  1. Input Validation → 2. Geocoding → 3. API Request → 4. Response Handler → 5. Data Cleaning → 6. Metric Processing → 7. Condition Classification → 8. Table Render → 9. Chart Render → 10. KPI Insights → 11. localStorage Cache → 12. UI Update

---

## 📊 Dashboard & Analytics

### KPI Cards
| Card | Metric |
|------|--------|
| 🌡️ Avg Temp | Mean temperature across all records |
| 🔥 Max Temp | Highest recorded temperature |
| 🧊 Min Temp | Lowest recorded temperature |
| 📏 Temp Range | Max minus Min |
| 💧 Max Precipitation | Peak rainfall in mm |
| 💦 Avg Humidity | Mean relative humidity |
| ☀️ Hot Days | Days with temperature > 30°C |
| 🌧️ Rainy Days | Days with precipitation > 5 mm |
| 📅 Total Days | Total records loaded |

### Charts
| Chart | Type | Description |
|-------|------|-------------|
| Temperature Trend | Line | Date-series line with fill; accent color adapts to theme |
| Humidity & Precipitation | Dual-axis Bar+Line | Humidity bars (left axis) + precipitation line (right axis) |
| Temperature Distribution | Grouped Bar | 5 temperature buckets (< 20°C to > 35°C) with distinct colors |
| Weather Conditions | Doughnut | Proportion of each classified condition label |

### Weather Classification
| Condition | Criteria | Emoji |
|-----------|----------|-------|
| Heavy Rain | Precipitation > 10 mm | ⛈️ |
| Rainy | Precipitation > 5 mm | 🌧️ |
| Drizzle | Precipitation > 0 mm | 🌦️ |
| Scorching | Temp ≥ 32°C | 🌋 |
| Hot | Temp ≥ 30°C | ☀️ |
| Warm | Temp ≥ 25°C | ⛅ |
| Mild | Temp ≥ 15°C | 🌤️ |
| Cold | Temp ≥ 5°C | 🧊 |
| Freezing | Temp < 5°C | ❄️ |

---

## 🎵 Zen Mode — Procedural Audio Engine

Zen Mode generates **fully synthetic, looping ambient soundscapes** using the Web Audio API. There are **no audio files** — every sound is created mathematically in real time.

### Sound Design Per Condition

| Condition | Audio Recipe |
|-----------|-------------|
| **Heavy Rain** | White noise band-pass filtered (400–4000 Hz) + Pink noise sub-bass rumble |
| **Rainy** | White noise band-pass (600–3200 Hz) — steady mid-range rainfall |
| **Drizzle** | Light white noise band-pass (900–2200 Hz) — sparse, delicate |
| **Scorching** | Pink noise with LFO-modulated low-pass + cicada oscillator with 18 Hz tremolo |
| **Hot** | Pink noise ambience + two layers of chirping oscillators at 2.4 kHz & 3.1 kHz |
| **Warm** | Pink noise + three chirp layers — denser bird activity |
| **Mild** | Soft pink noise + two gentle chirp layers — serene forest ambience |
| **Cold** | White noise wind with LFO-modulated cutoff and amplitude swell |
| **Freezing** | High-intensity wind noise with fast LFO + deep howl oscillator |

### Audio Primitives Used
- `AudioBufferSourceNode` — looped noise buffers (white & pink)
- `BiquadFilterNode` — low-pass / high-pass / band-pass shaping
- `GainNode` — amplitude control and LFO modulation targets
- `OscillatorNode` — sine/sawtooth tone generation
- LFO (Low-Frequency Oscillator) pattern: oscillator → gain → target parameter

---

## 🌨️ Weather Physics Engine

A real-time **Canvas 2D particle system** simulates atmospheric phenomena:

### Rain Mode
- 250 particles rendered as angled streaks with wind-shear velocity (`vx`, `vy`)
- **Ground collision** spawns expanding ripple splash circles
- Splash physics: outward radius growth + upward arc + alpha fade

### Snow Mode
- 250 snowflake circles with per-particle size (2–5 px)
- **Sinusoidal oscillation** — each flake sways independently using a unique phase offset
- Gentle downward drift, looping back from the top

### Theme Transition
- When the theme changes, the entire particle pool is **instantly reconstructed** — no blending artifacts

---

## 🔧 Functional Programming Design

This project is intentionally designed as a showcase of **functional programming** across Python and JavaScript.

### Python (`analysis.py`, `data_loader.py`)
```python
# All data is immutable
WeatherData = Tuple[str, float, float, float]

# Pure functions using map / filter / reduce
def filter_data(data, condition): return tuple(filter(condition, data))
def map_data(data, transform):   return tuple(map(transform, data))
def calculate_average(values):   return reduce(lambda acc, x: acc + x, values, 0.0) / len(values)
```

### JavaScript (`main.js`)
```javascript
// Immutable frozen dataset
const freeze = arr => Object.freeze(arr.map(r => Object.freeze({ ...r })));

// Functional wrappers
const mapData    = (data, fn) => data.map(fn);
const filterData = (data, fn) => data.filter(fn);
const reduceData = (data, fn, init) => data.reduce(fn, init);

// Pure aggregators
const calcAvg = values => reduceData(values, (acc, x) => acc + x, 0) / (values.length || 1);
const calcMax = values => reduceData(values, (acc, x) => x > acc ? x : acc, -Infinity);
```

---

## 🌐 API Integration

The live weather fetch uses two **completely free, no-key-required** Open-Meteo APIs:

### Step-by-Step Flow
```
1. City name entered by user
        │
        ▼
2. GET geocoding-api.open-meteo.com/v1/search?name=<city>
   → { latitude, longitude }
        │
        ▼
3. GET api.open-meteo.com/v1/forecast
   ?latitude=...&longitude=...
   &daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean
   &hourly=temperature_2m,relative_humidity_2m,precipitation
   &forecast_days=N  (or &past_days=N&forecast_days=0)
        │
        ▼
4. cleanWeatherData()  → removes nulls, organizes hourly by day
5. processWeatherMetrics() → averages max/min into daily temperature
6. classifyDatasetConditions() → applies global theme
7. renderDashboard() → all visualizations updated
```

---

## 💾 Data Persistence

- **Storage**: Browser `localStorage` under the key `wda_history`
- **Capacity**: Up to 20 sessions retained (FIFO eviction)
- **Stored per session**: timestamp, theme, record count, avg/max/min temp, date range, full row data
- **Restore**: Clicking "Restore" on any history card replays the entire dashboard and repopulates the manual entry table

---

## 🔮 Future Scope

| Feature | Description | Priority |
|---------|-------------|----------|
| 🗺️ **Interactive Map** | Leaflet.js map pinning city locations fetched via the API | High |
| 📤 **Export Reports** | PDF/PNG export of the full dashboard using html2canvas or jsPDF | High |
| 🔔 **Alert System** | User-defined threshold alerts (e.g., notify if max temp > 35°C) | High |
| 🌙 **Dark/Light Mode Toggle** | Manual override independent of weather theme | Medium |
| 🤖 **ML Predictions** | Train a simple scikit-learn regression model on uploaded CSV to predict next-day temperature | High |
| 📡 **WebSocket Live Updates** | Real-time weather data streaming for live dashboard refresh | Medium |
| 📱 **Progressive Web App (PWA)** | Service worker, offline mode, and app manifest for mobile installability | Medium |
| 🗄️ **Backend Database** | SQLite/PostgreSQL storage for multi-user history and server-side caching | Medium |
| 🌐 **Multi-language Support** | i18n for UI labels (English, Hindi, Spanish, French) | Low |
| 📈 **Advanced Charts** | Wind rose, heat maps, scatter plots using D3.js or Plotly | Medium |
| 🏙️ **City Comparison Mode** | Analyze and overlay data from two cities side-by-side | High |
| 🎯 **Custom Condition Rules** | Let users define their own temperature/precipitation thresholds for classification | Low |
| ☁️ **Cloud Sync** | Optional Firebase/Supabase backend to sync history across devices | Low |
| 🧪 **Unit Tests** | pytest suite for all Python analysis functions; Jest for JavaScript utilities | High |
| 🐳 **Docker Support** | Containerize Flask app for one-command deployment | Medium |

---

## 🤝 Contributing

Contributions are welcome! To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the existing **functional programming style** in both Python and JavaScript — keep functions pure, avoid global mutations, and use immutable data structures where possible.

---





