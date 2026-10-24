# 🌿 CropGuard AI

**Crop disease detection and agricultural advisory for Pakistani farmers, with bilingual (Urdu/English) treatment guidance**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-cropguard--ai--pk.vercel.app-green?style=for-the-badge&logo=vercel)](https://cropguard-ai-pk.vercel.app)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

---

## 📌 Overview

CropGuard AI combines computer vision, a large language model, and geospatial reporting to diagnose crop diseases from a leaf photo and give bilingual treatment guidance. It runs in any smartphone browser, with no app installation.

The machine learning work lives in [`notebooks/`](notebooks/): six per-crop EfficientNet classifiers trained on real-field images. The backend and trained weights are private; the frontend and all training notebooks are public.

---

## 📊 Model Performance

Six independent per-crop models, 47 disease classes in total.

| Crop | Backbone | Input | Classes | Images (train / val) | Val accuracy | Macro F1 | Weakest class (F1) |
|---|---|---|---|---|---|---|---|
| Wheat | EfficientNetV2-S | 384 | 15 | 14,117 (11,294 / 2,823) | 90.44% | 0.896 | Tan spot (0.706) |
| Rice | EfficientNetV2-S | 384 | 6 | 9,108 (7,965 / 763 / 380 test) | 97.90% | 0.979 | Leaf Blast (0.960) |
| Cotton | EfficientNet-B0 | 224 | 4 | 8,962 (7,170 / 1,792) | 98.88% | 0.989 | Healthy (0.984) |
| Sugarcane | EfficientNet-B0 | 224 | 6 | 7,111 (5,689 / 1,422) | 97.33% | 0.975 | Mosaic (0.945) |
| Corn | EfficientNetV2-S | 384 | 8 | 6,395 collected (4,436 / 945 after cleaning) | 88.57% | 0.917 | Leaf Blight (0.741) |
| Potato | EfficientNetV2-S | 384 | 8 | 5,228 (4,183 / 1,045) | 92.82% | 0.905 | Nematode (0.813) |
| **Mean of 6 models** | | | **47 total** | | **94.3%** | **0.944** | |

The mean is an unweighted average of the six per-crop validation accuracies, not a single pooled test set. Per-class precision, recall and confusion matrices are in each crop's notebook.

### Classes

| Crop | # | Classes |
|---|---|---|
| Wheat | 15 | Aphid, Black Rust, Blast, Brown Rust, Common Root Rot, Fusarium Head Blight, Healthy, Leaf Blight, Mildew, Mite, Septoria, Smut, Stem fly, Tan spot, Yellow Rust |
| Rice | 6 | Bacterial Leaf Blight, Brown Spot, Healthy Rice Leaf, Leaf Blast, Leaf scald, Sheath Blight |
| Cotton | 4 | Bacterial Blight, Curl Virus, Fusarium Wilt, Healthy |
| Sugarcane | 6 | Bacterial Blight, Healthy, Mosaic, Red Rot, Rust, Yellow Disease |
| Corn | 8 | Bacterial Leaf Streak, Common Rust, Gray Leaf Spot, Healthy, Leaf Blight, Leaf Spot, Maize Chlorotic Mottle Virus, Streak Virus |
| Potato | 8 | Bacteria, Early Blight, Fungi, Healthy, Late Blight, Nematode, Pest, Virus |

### Limitations

- **Validation, not independent test.** Accuracy is measured on a validation split of the same curated data. Only the rice model has a separate held-out test split (380 images). A test on photos from sources the models never saw is still pending, and real-field accuracy may be lower.
- **Weak spots.** Wheat (Tan spot) and corn (Leaf Blight) have the lowest per-class F1 and are the least reliable diagnoses.
- **The farmer picks the crop first.** Each model only knows its own crop's diseases, so a photo sent to the wrong crop's model will still return a (wrong) answer.

---

## 📓 Training Notebooks

All six models were trained in separate notebooks, one per crop (see [`notebooks/`](notebooks/)). Each covers data preparation, training, and evaluation with per-class metrics. Trained weights are not included.

---

## ✨ Features

### 🔬 Disease Detection
Upload a photo of a crop leaf. The system runs that crop's model, shows the top-3 predictions with confidence scores, and generates bilingual treatment guidance using Google Gemini 2.5 Flash.

### 🤖 AI Agriculture Chatbot
Ask farming questions in Urdu or English. The chatbot keeps conversation context and gives Pakistan-specific advice, including local pesticide brand names.

### 🗺️ Disease Warning Map
Community geo-tagged disease reporting on an interactive OpenStreetMap, with outbreak alerts when the same disease is reported across multiple nearby locations.

### 🌦️ Weather & Farming Advisory
City-based 10-day forecasts with AI-generated farming advice: irrigation timing, spray scheduling, frost warnings, and humidity-based disease risk.

### 🐛 Pest Identifier
Upload a photo of an insect found on a crop. Gemini's vision capability identifies the pest and suggests treatment with local pesticide brands.

### 📅 Crop Calendar
Seasonal planting guides for all 6 crops across Punjab, Sindh, KPK, and Balochistan: sowing windows, fertilizer schedules, irrigation intervals, and expected yields.

### 🧮 Fertilizer & Spray Calculator
Enter crop type and land area in acres to get fertilizer quantities (DAP, Urea, Potash) with prices in Pakistani Rupees, plus a crop-specific spray guide.

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React.js 18 | Component-based UI |
| React Router v6 | Client-side routing (9 pages) |
| Tailwind CSS 3 | Responsive styling |
| Fetch API | HTTP calls to the backend |
| Leaflet.js + React-Leaflet | Disease warning map |
| Lucide React | Icons |

### Backend (private repository)
| Technology | Purpose |
|------------|---------|
| FastAPI (Python) | REST API |
| TensorFlow / Keras | CNN inference |
| Google Gemini 2.5 Flash | Bilingual advice and pest identification |
| Docker | Containerized deployment |
| Hugging Face Spaces | Hosting |
| Google Drive + gdown | Model weight storage and download |

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
                      │ REST API
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
cropguard-ai/
├── notebooks/                 # Per-crop training notebooks (6)
├── public/
│   └── index.html
├── src/
│   ├── config.js              # API URL configuration
│   ├── App.js                 # Root component + routing
│   ├── components/
│   │   └── Navbar.js
│   └── pages/
│       ├── Home.js
│       ├── Detect.js          # Disease detection
│       ├── Chat.js            # AI chatbot
│       ├── CropCalendar.js
│       ├── FertilizerCalculator.js
│       ├── DiseaseMap.js      # Warning map
│       ├── Weather.js
│       ├── PestIdentifier.js
│       └── About.js
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
git clone https://github.com/MuhammadAliEjaz1/cropguard-ai.git
cd cropguard-ai
npm install

# Set your backend URL in src/config.js
# export const API_URL = "https://your-backend.hf.space";

npm start
```

### Build for Production

```bash
npm run build
```

> **Note:** The frontend needs the CropGuard backend API to run. The backend and trained weights are not open source.

---

## 🌐 Deployment

The frontend is deployed on **Vercel** with automatic deploys on every push to `main`.

Build command: `CI= react-scripts build`
Output directory: `build/`

---

## 📱 Responsive Design

Tested on Android phones (360–414px), iPhones (375–430px), tablets, and desktop browsers.

---

## 🔑 Key Design Decisions

**Why separate models per crop?**
A single unified model confused diseases across crops (for example, predicting rice leaf blight as wheat leaf blight). With per-crop models the farmer selects their crop first, and only that crop's model runs, which removes that error source. The trade-off is that a wrong crop selection gives a wrong answer.

**Why real-field images over PlantVillage?**
PlantVillage uses white-background lab photos that transfer poorly to real field conditions. The training data here comes from real field images curated across 15+ independent sources.

**Why OpenStreetMap over Google Maps?**
Google Maps requires billing setup. OpenStreetMap via Leaflet.js is free, has no usage limits, and includes Urdu place names for Pakistani cities.

**Why Gemini over open-source LLMs?**
In testing, Gemini 2.5 Flash produced more natural spoken Urdu than the open-source alternatives tried (Llama, Phi), which matters for rural farmer accessibility.

---

## 👥 Team

**Muhammad Ali Ejaz**: ML engineering, backend, dataset curation, system architecture

**Ahmad Siddique**: Frontend development, UI/UX, feature integration

---

## 📄 License

MIT License. See the [LICENSE](LICENSE) file.

> The trained model weights and backend inference engine are proprietary and not included in this repository.

---

<div align="center">
  <a href="https://cropguard-ai-pk.vercel.app">cropguard-ai-pk.vercel.app</a>
</div>
