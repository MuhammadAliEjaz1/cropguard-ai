# 🌿 CropGuard AI

**AI-Powered Crop Disease Detection & Agricultural Advisory Platform for Pakistani Farmers**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cropguard--ai--pk.vercel.app-green?style=for-the-badge&logo=vercel)](https://cropguard-ai-pk.vercel.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📌 Overview

CropGuard AI is a production-grade agricultural intelligence platform built specifically for Pakistani farmers. It combines computer vision, large language models, and geospatial technology to deliver instant crop disease diagnosis with bilingual (Urdu/English) treatment guidance — accessible from any smartphone browser, no app installation required.

> 🇵🇰 پاکستانی کسانوں کے لیے پہلا اردو-انگریزی AI زرعی نظام

---

## 📊 Model Performance

| Crop | Accuracy | Disease Classes | Model Architecture |
|------|----------|-----------------|--------------------|
| 🌱 Rice | 97.90% | 6 | EfficientNetV2S |
| ☁️ Cotton | 97.30% | 4 | EfficientNetB0 |
| 🎋 Sugarcane | 98.20% | 6 | EfficientNetB0 |
| 🌾 Wheat | 90.44% | 15 | EfficientNetV2S |
| 🥔 Potato | 93.21% | 9 | EfficientNetV2S |
| 🌽 Corn | 88.50% | 8 | EfficientNetB0 |
| **Overall** | **94.3%** | **51** | **6 Independent Models** |

> Each crop has its own independently trained model — eliminating cross-crop misclassification entirely by design.

---

## ✨ Features

### 🔬 Disease Detection
Upload a photo of any crop leaf and get an instant AI diagnosis. The system identifies the disease from 51 possible classes across 6 crops, shows top-3 predictions with confidence scores, and generates detailed bilingual treatment guidance using Google Gemini 2.5 Flash.

### 🤖 AI Agriculture Chatbot
Ask any farming question in Urdu or English. The chatbot maintains conversation context, understands disease-specific queries, and provides Pakistan-specific advice including local pesticide brand names and regional recommendations.

### 🗺️ Disease Warning Map
Community-powered geo-tagged disease reporting system. Farmers submit disease sightings with location data, which appear as markers on an interactive OpenStreetMap. Automatic outbreak alerts trigger when the same disease is detected across multiple nearby locations.

### 🌦️ Weather & Farming Advisory
City-based 10-day weather forecasts with AI-generated farming advice tailored to current conditions — irrigation timing, spray scheduling, frost warnings, and humidity-based disease risk alerts.

### 🐛 Pest Identifier
Upload a photo of any insect or pest found on crops. Google Gemini's vision capability identifies the pest, lists affected Pakistani crops, and recommends treatment with local pesticide brands.

### 📅 Crop Calendar
Comprehensive seasonal planting guides for all 6 crops across all 4 Pakistani provinces (Punjab, Sindh, KPK, Balochistan) — covering sowing windows, fertilizer schedules, irrigation intervals, and expected yields in maunds per acre.

### 🧮 Fertilizer & Spray Calculator
Input crop type and land area in acres to get exact fertilizer bag quantities (DAP, Urea, Potash) with current market prices in Pakistani Rupees. Includes a crop-specific spray guide with pesticide brands, dosages, and 2025 pricing.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | Component-based UI framework |
| React Router v6 | Client-side routing (9 pages) |
| Tailwind CSS 3 | Responsive utility-first styling |
| Axios | HTTP client for API communication |
| Leaflet.js + React-Leaflet | Interactive disease warning map |
| Lucide React | Icon library |

### Backend (Private Repository)
| Technology | Purpose |
|------------|---------|
| FastAPI (Python) | REST API framework |
| TensorFlow / Keras | CNN model inference |
| Google Gemini 2.5 Flash | Bilingual NLP & pest identification |
| Docker | Containerized deployment |
| Hugging Face Spaces | Cloud hosting |
| Google Drive + gdown | Model weight storage & download |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│           FARMER (Smartphone Browser)            │
└─────────────────────┬───────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────┐
│         FRONTEND — React.js + Tailwind           │
│         cropguard-ai-pk.vercel.app               │
│         Deployed on Vercel                       │
└─────────────────────┬───────────────────────────┘
                      │ REST API (Axios)
┌─────────────────────▼───────────────────────────┐
│         BACKEND — FastAPI + Python               │
│         Hugging Face Spaces (Docker)             │
│                                                  │
│  ┌─────────────┐   ┌──────────────────────────┐ │
│  │ 6 CNN Models│   │  Google Gemini 2.5 Flash  │ │
│  │ (per crop)  │   │  (Urdu/English Advisory)  │ │
│  └─────────────┘   └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
cropguard-frontend/
├── public/
│   └── index.html
├── src/
│   ├── config.js              # API URL configuration
│   ├── App.js                 # Root component + routing
│   ├── components/
│   │   └── Navbar.js          # Navigation bar
│   └── pages/
│       ├── Home.js            # Landing page
│       ├── Detect.js          # Disease detection
│       ├── Chat.js            # AI chatbot
│       ├── CropCalendar.js    # Crop calendar
│       ├── FertilizerCalculator.js
│       ├── DiseaseMap.js      # Warning map
│       ├── Weather.js         # Weather forecast
│       ├── PestIdentifier.js  # Pest identification
│       └── About.js           # Project info
├── package.json
└── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/MuhammadAliEjaz1/cropguard-frontend.git
cd cropguard-frontend

# Install dependencies
npm install

# Configure API URL
# Edit src/config.js and set your backend URL
# export const API_URL = "https://your-backend.hf.space";

# Start development server
npm start
```

### Build for Production

```bash
npm run build
```

> **Note:** This frontend requires the CropGuard AI backend API to be running. The backend is not open source — it contains proprietary trained models and API configurations.

---

## 🌐 Deployment

The frontend is deployed on **Vercel** with automatic deployments triggered on every push to the `main` branch.

```bash
# Deploy to Vercel (one-time setup)
npm install -g vercel
vercel --prod
```

Build command: `CI= react-scripts build`
Output directory: `build/`

---

## 📱 Responsive Design

CropGuard AI is fully responsive and tested across:
- Android smartphones (360px — 414px viewport)
- iPhone (375px — 430px viewport)
- Tablets and desktop browsers

---

## 🔑 Key Design Decisions

**Why separate models per crop?**
A single unified model caused cross-crop misclassification (e.g. rice leaf blight predicted as wheat leaf blight). Six independent per-crop models eliminate this by design — the farmer selects their crop first, and only that crop's model runs.

**Why real-field images over PlantVillage?**
PlantVillage (the standard benchmark) uses white-background lab photos that perform poorly on real field conditions. All our training data comes from real field images curated across 15+ independent sources.

**Why OpenStreetMap over Google Maps?**
Google Maps API requires billing setup. OpenStreetMap via Leaflet.js is completely free, has no usage limits, and includes Urdu place names for Pakistani cities.

**Why Gemini over open-source LLMs?**
Testing confirmed Gemini 2.5 Flash produces significantly more natural spoken Pakistani Urdu than open-source alternatives (Llama, Phi), which is critical for rural farmer accessibility.

---

## 👥 Team

**Muhammad Ali Ejaz** — ML Engineering, Backend, Dataset Curation, System Architecture

**Ahmad Siddique** — Frontend Development, UI/UX, Feature Integration

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

> **Note:** The trained model weights and backend inference engine are proprietary and not included in this repository.

---

<div align="center">
  <strong>Built for Pakistan's 42 million farmers 🌾</strong><br/>
  <a href="https://cropguard-ai-pk.vercel.app">cropguard-ai-pk.vercel.app</a>
</div>
