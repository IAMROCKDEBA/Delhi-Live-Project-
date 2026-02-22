<p align="center">
  <img src="https://img.shields.io/badge/PWA-ready-00D9FF?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Zero_Dependencies-✓-39FF14?style=for-the-badge" alt="Zero Dependencies" />
  <img src="https://img.shields.io/badge/AI_Powered-Client_Side-FF3864?style=for-the-badge" alt="AI Powered" />
</p>

# ✈️ Smart Seat & Luggage OS

> AI-powered aircraft seat management and luggage optimization system — a futuristic Progressive Web App built with zero dependencies and zero API keys.

---

## 🎯 Overview

**Smart Seat & Luggage OS** (SeatOS) is a client-side PWA that simulates an intelligent airline cabin management dashboard. It features real-time seat mapping, AI-driven luggage scanning, predictive overhead bin optimization, and automated conflict resolution — all running 100% in the browser with no backend required.

The app uses the **AERO-LUXE 2026** design system featuring glassmorphism, aurora backgrounds, particle effects, and micro-animations for a premium, futuristic feel.

---

## ✨ Features

### 📊 Mission Control Dashboard
- Real-time cabin fill rate with sparkline trending
- Bin capacity forecasting using exponential smoothing
- Boarding group progress tracking
- Weight distribution monitoring (Forward / Mid / Aft)
- AI confidence score and sustainability rating

### 🪑 Interactive Seat Map
- Full **Boeing 737-800** cabin layout (30 rows × 6 columns)
- Color-coded seat statuses — Available, Occupied, Selected, Premium
- Click-to-select with shockwave animation and confetti 🎉
- Seat detail cards with features (window, aisle, extra legroom, exit row)
- One-click reservation flow

### 📷 AI Luggage Scanner
- Camera-based scanning with live viewfinder and scan-line overlay
- Demo mode for instant luggage detection simulation
- Dimension analysis (H × W × D), volume, and estimated weight
- Material detection (Hardshell, Nylon, Leather)
- FAA carry-on compliance check (✓ or ✗)

### 🧳 Overhead Bin Optimizer
- Real-time bin capacity ring gauge
- First-Fit Decreasing (FFD) bin packing algorithm
- Visual bin packing layout
- AI packing recommendations
- Add / auto-pack luggage items
- Weight status indicators (green / amber / red)

### ⚖️ Conflict Resolution Center
- Passenger profile comparison with tier badges (Gold / Silver / Standard)
- Compatibility scoring
- AI-suggested seat swaps ranked by benefit score
- One-click swap initiation, incentive offers, and escalation

### 🎙️ Voice Commands
- Navigate between pages using natural language
- Supported commands: *"show seat map"*, *"open scanner"*, *"go to luggage"*, *"conflicts"*, *"dashboard"*

### 🔧 Additional Features
- **PWA / Installable** — works offline via service worker
- **Responsive Design** — adapts to desktop, tablet, and mobile
- **Reduced Motion** — respects `prefers-reduced-motion`
- **Live Ticker** — scrolling flight info, gate, weather, and bin alerts
- **Modal System** — contextual alerts for actions and confirmations
- **Magnetic Buttons** — subtle cursor-following hover effect with ripple animations

---

## 🏗️ Project Structure

```
smart-seat-os/
├── index.html        # Main app shell, full CSS design system, and HTML structure
├── app.js            # All application logic — classes, AI engines, and UI renderer
├── manifest.json     # PWA manifest (app name, icons, theme colors)
├── sw.js             # Service worker — cache-first strategy for offline support
└── README.md         # This file
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, Safari)
- A local HTTP server (required for service worker registration)

### Run Locally

**Option 1 — VS Code Live Server:**
1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **Open with Live Server**

**Option 2 — Python:**
```bash
# Python 3
python -m http.server 8000

# Then open http://localhost:8000
```

**Option 3 — Node.js:**
```bash
npx serve .

# Then open the URL shown in terminal
```

**Option 4 — PowerShell (Windows):**
```powershell
# Quick one-liner using Node's http module
npx -y http-server . -p 8080
```

> **Note:** Opening `index.html` directly as a `file://` URL will prevent the service worker from registering. Always use an HTTP server.

---

## 🏛️ Architecture

The app is structured around five core ES6 classes:

| Class | Responsibility |
|---|---|
| **`SeatManager`** | Generates, manages, and queries the 180-seat cabin layout |
| **`LuggageAI`** | Tracks luggage items, computes volumes, and runs FFD bin packing |
| **`PredictionEngine`** | Exponential smoothing forecasts for bin capacity trends |
| **`ConflictResolver`** | Detects seat conflicts and generates ranked swap suggestions |
| **`UIRenderer`** | Orchestrates the full UI — navigation, rendering, events, and effects |

All intelligence runs **100% client-side** — there are no API calls, no backend, and no external dependencies beyond Google Fonts.

---

## 🎨 Design System — AERO-LUXE 2026

| Token | Value |
|---|---|
| Primary Cyan | `#00D9FF` |
| Rose Accent | `#FF3864` |
| Neon Green | `#39FF14` |
| Background | Radial gradient (`#0B1120` → `#020617` → `#000`) |
| Heading Font | Space Grotesk |
| Mono Font | JetBrains Mono |
| Body Font | Inter |
| Label Font | Syncopate |

Visual effects include: aurora rotation, perspective grid floor, floating orbs, particle drift, glassmorphism cards, and CSS-driven animations throughout.

---

## 📱 PWA Support

SeatOS is a fully installable Progressive Web App:

- **Service Worker** with cache-first strategy and offline fallback
- **Web App Manifest** with standalone display mode
- **Responsive** down to 320px viewport width
- **Installable** via the browser's "Add to Home Screen" prompt

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "Add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ☕ and ✈️ — <strong>Smart Seat & Luggage OS</strong>
</p>
