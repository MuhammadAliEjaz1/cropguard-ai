import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Droplets, Sprout, Wheat, TrendingUp, Lightbulb, Leaf } from 'lucide-react';

/* ─── DATA ─────────────────────────────────────────────────── */
const cropData = {
  Wheat: {
    emoji: '🌾', urdu: 'گندم', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    sowMonth: 10, harvestMonth: 4,
    regions: {
      Punjab: {
        sowing: 'October 15 — November 15', germination: '7–10 days after sowing',
        fertilizer1: 'DAP 1 bag/acre + Urea ½ bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at tillering (Dec–Jan)',
        irrigation: '4–5 irrigations total\n• 1st: 3 weeks after sowing\n• 2nd: Tillering (Dec)\n• 3rd: Jointing (Jan)\n• 4th: Grain filling (Feb–Mar)',
        harvest: 'April 15 — May 15', yield: '40–50', yieldMax: 50,
        varieties: 'Lasani-08, Galaxy-13',
        tips: 'Use certified seed. Every week delay after Nov 15 reduces yield by 1–2 maunds/acre.',
      },
      Sindh: {
        sowing: 'November 1 — November 30', germination: '7–10 days after sowing',
        fertilizer1: 'DAP 1 bag/acre + Urea ½ bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at tillering (Dec–Jan)',
        irrigation: '3–4 irrigations\n• 1st: 3 weeks after sowing\n• 2nd: Tillering stage\n• 3rd: Grain filling',
        harvest: 'March 15 — April 15', yield: '35–45', yieldMax: 45,
        varieties: 'Regional certified varieties',
        tips: 'Sindh has warmer winters. Sow early November for best results.',
      },
      KPK: {
        sowing: 'October 1 — October 31', germination: 'October–November',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at tillering',
        irrigation: '3–4 irrigations (rain-fed may need less)',
        harvest: 'May 1 — June 1', yield: '30–40', yieldMax: 40,
        varieties: 'Rust-resistant varieties',
        tips: 'Cooler climate — sow earlier than Punjab. Watch for wheat rust.',
      },
      Balochistan: {
        sowing: 'October 15 — November 15', germination: 'November',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at tillering',
        irrigation: '3–4 irrigations (limited water)',
        harvest: 'May 1 — June 15', yield: '25–35', yieldMax: 35,
        varieties: 'Drought-tolerant varieties',
        tips: 'Water is scarce. Use drought-tolerant varieties. Karez and tubewell irrigation common.',
      },
    },
  },
  Rice: {
    emoji: '🌾', urdu: 'چاول', season: 'Kharif', seasonLabel: 'Kharif (Summer Crop)',
    regions: {
      Punjab: {
        sowing: 'Nursery: May 15–June 15\nTransplant: June 20–July 10', germination: '5–7 days in nursery',
        fertilizer1: 'DAP 1 bag/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at tillering (30 days)\nUrea ½ bag at panicle initiation',
        irrigation: 'Keep 2–3 inches standing water throughout\nDrain 2 weeks before harvest',
        harvest: 'October 1 — November 15', yield: 'Basmati 20–25 | IRRI 40–50', yieldMax: 50,
        varieties: 'Super Basmati, PK-386',
        tips: 'Transplant on time — late transplanting reduces Basmati quality significantly.',
      },
      Sindh: {
        sowing: 'Nursery: June 1–30\nTransplant: July 1–20', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at tillering',
        irrigation: 'Continuous flooding method',
        harvest: 'November 1 — December 15', yield: '45–55', yieldMax: 55,
        varieties: 'IRRI-6, IRRI-9',
        tips: 'Sindh is a major rice producer. Watch for brown planthopper.',
      },
      KPK: {
        sowing: 'Nursery: May 1–31\nTransplant: June 10–30', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at tillering',
        irrigation: '3–4 inches standing water',
        harvest: 'September 15 — October 31', yield: '25–35', yieldMax: 35,
        varieties: 'Local varieties',
        tips: 'Swat and Peshawar valley are key areas. Shorter season due to early winters.',
      },
      Balochistan: {
        sowing: 'June 1 — July 1', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at tillering',
        irrigation: 'Flood irrigation from dams/canals',
        harvest: 'October 1 — November 30', yield: '20–30', yieldMax: 30,
        varieties: 'Local varieties',
        tips: 'Limited cultivation. Mainly Nasirabad and Jaffarabad districts.',
      },
    },
  },
  Cotton: {
    emoji: '🌿', urdu: 'کپاس', season: 'Kharif', seasonLabel: 'Kharif (Summer Crop)',
    regions: {
      Punjab: {
        sowing: 'April 15 — May 31', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at squaring (45 days)\nUrea ½ bag at boll formation',
        irrigation: '6–8 irrigations\n• 1st: 3 weeks after sowing\n• Every 12–15 days\n• Stop 4 weeks before harvest',
        harvest: 'Sep 15 — Dec 31 (multiple pickings)', yield: '25–35', yieldMax: 35,
        varieties: 'Bt cotton varieties',
        tips: 'Bt cotton reduces pesticide cost. Watch for cotton leaf curl virus.',
      },
      Sindh: {
        sowing: 'April 1 — May 15', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at squaring',
        irrigation: '5–7 irrigations',
        harvest: 'September 1 — December 15', yield: '20–30', yieldMax: 30,
        varieties: 'Bt cotton varieties',
        tips: 'Sanghar, Mirpurkhas, Nawabshah are major cotton districts.',
      },
      KPK: {
        sowing: 'April 15 — May 31', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at squaring',
        irrigation: '5–6 irrigations',
        harvest: 'September — November', yield: '20–25', yieldMax: 25,
        varieties: 'Local varieties',
        tips: 'Cotton limited in KPK. Dera Ismail Khan is main area.',
      },
      Balochistan: {
        sowing: 'April 1 — May 15', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at squaring',
        irrigation: '5–6 irrigations (tube wells)',
        harvest: 'September — November', yield: '20–28', yieldMax: 28,
        varieties: 'Local varieties',
        tips: 'Nasirabad division is main cotton area in Balochistan.',
      },
    },
  },
  Sugarcane: {
    emoji: '🎋', urdu: 'گنا', season: 'Annual', seasonLabel: 'Annual Crop (12–14 months)',
    regions: {
      Punjab: {
        sowing: 'February 15 — March 31', germination: '20–25 days',
        fertilizer1: 'DAP 1.5 bags/acre at planting',
        fertilizer2: 'Urea 1 bag at 2 months\nUrea 1 bag at 4 months\nUrea ½ bag at 6 months',
        irrigation: '8–10 irrigations\n• Every 15–20 days growing season\n• Reduce in winter',
        harvest: 'November — March (next year)', yield: '600–800', yieldMax: 800,
        varieties: 'Healthy ratoon or fresh setts',
        tips: 'Faisalabad, Sargodha, Gujranwala are major areas. Use healthy ratoon or fresh setts.',
      },
      Sindh: {
        sowing: 'October — November (autumn)', germination: '20–25 days',
        fertilizer1: 'DAP 1.5 bags/acre at planting',
        fertilizer2: 'Urea 1 bag at 2 months\nUrea 1 bag at 4 months',
        irrigation: '8–10 irrigations',
        harvest: 'December — April', yield: '500–700', yieldMax: 700,
        varieties: 'Autumn planting varieties',
        tips: 'Tharparkar and Hyderabad areas. Autumn planting common in Sindh.',
      },
      KPK: {
        sowing: 'February — March', germination: '20–25 days',
        fertilizer1: 'DAP 1 bag/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at 2 months',
        irrigation: '6–8 irrigations',
        harvest: 'November — January', yield: '400–600', yieldMax: 600,
        varieties: 'Local varieties',
        tips: 'Charsadda and Mardan are main sugarcane areas in KPK.',
      },
      Balochistan: {
        sowing: 'February — March', germination: '20–25 days',
        fertilizer1: 'DAP 1 bag/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at 2 months',
        irrigation: '6–8 irrigations',
        harvest: 'November — February', yield: '400–500', yieldMax: 500,
        varieties: 'Local varieties',
        tips: 'Limited sugarcane cultivation in Balochistan.',
      },
    },
  },
  Corn: {
    emoji: '🌽', urdu: 'مکئی', season: 'Kharif', seasonLabel: 'Kharif / Spring Crop',
    regions: {
      Punjab: {
        sowing: 'Spring: Feb 15–Mar 15\nKharif: Jun 15–Jul 15', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag at knee-height (30 days)\nUrea ½ bag at tasseling',
        irrigation: '5–6 irrigations\n• 1st: 3 weeks after sowing\n• Critical at tasseling & silking',
        harvest: 'Spring: May–Jun | Kharif: Oct–Nov', yield: '60–80', yieldMax: 80,
        varieties: 'Pioneer 3025, DK-6142',
        tips: 'Hybrid corn gives best yields. Tasseling stage is critical for irrigation.',
      },
      Sindh: {
        sowing: 'Kharif: June — July', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag at knee-height',
        irrigation: '4–5 irrigations',
        harvest: 'October — November', yield: '50–70', yieldMax: 70,
        varieties: 'Hybrid varieties',
        tips: 'Corn cultivation growing in Sindh. Use hybrid varieties for better yield.',
      },
      KPK: {
        sowing: 'April — May (spring)', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag at knee-height',
        irrigation: '4–5 irrigations (rain-fed areas less)',
        harvest: 'August — September', yield: '40–60', yieldMax: 60,
        varieties: 'Local and hybrid varieties',
        tips: 'KPK is major corn producer. Swabi, Nowshera, Mardan are key areas.',
      },
      Balochistan: {
        sowing: 'April — May', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag at knee-height',
        irrigation: '4–5 irrigations',
        harvest: 'August — October', yield: '35–50', yieldMax: 50,
        varieties: 'Local varieties',
        tips: 'Loralai and Zhob districts are main corn areas.',
      },
    },
  },
  Potato: {
    emoji: '🥔', urdu: 'آلو', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    regions: {
      Punjab: {
        sowing: 'October 1 — November 15', germination: '10–15 days',
        fertilizer1: 'DAP 1.5 bags/acre + Potash 1 bag/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at earthing up (30 days)',
        irrigation: '6–8 irrigations\n• 1st: At planting\n• Every 10–12 days\n• Stop 2 weeks before harvest',
        harvest: 'January 15 — March 15', yield: '150–200', yieldMax: 200,
        varieties: 'Certified seed (CRS)',
        tips: 'Okara, Sahiwal, Pakpattan are major areas. Watch for Late Blight in cool wet weather.',
      },
      Sindh: {
        sowing: 'November 1 — December 1', germination: '10–15 days',
        fertilizer1: 'DAP 1.5 bags/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at earthing up',
        irrigation: '5–6 irrigations',
        harvest: 'February — March', yield: '120–160', yieldMax: 160,
        varieties: 'Local varieties',
        tips: 'Sindh has shorter potato season. Plant in November for best results.',
      },
      KPK: {
        sowing: 'Mar–Apr (spring) or Sep–Oct (autumn)', germination: '10–15 days',
        fertilizer1: 'DAP 1.5 bags/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at earthing up',
        irrigation: '5–7 irrigations',
        harvest: 'Jun–Jul (spring) | Dec–Jan (autumn)', yield: '150–200', yieldMax: 200,
        varieties: 'High-altitude varieties',
        tips: 'KPK produces best quality potatoes. Abbottabad and Swat are famous.',
      },
      Balochistan: {
        sowing: 'March — April', germination: '10–15 days',
        fertilizer1: 'DAP 1.5 bags/acre at planting',
        fertilizer2: 'Urea 1 bag/acre at earthing up',
        irrigation: '5–6 irrigations',
        harvest: 'June — July', yield: '120–150', yieldMax: 150,
        varieties: 'Spring varieties',
        tips: 'Mastung and Quetta produce good quality potatoes in spring.',
      },
    },
  },
  Sunflower: {
    emoji: '🌻', urdu: 'گل آفتاب', season: 'Zaid', seasonLabel: 'Spring & Autumn Crop',
    regions: {
      Punjab: {
        sowing: 'Spring: Jan 15 — Feb 28\nAutumn: Aug 1 — Aug 31', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '5–6 irrigations\n• 1st: at sowing\n• Every 15–18 days\n• Critical at flowering & seed filling',
        harvest: 'Apr–May (spring) | Nov–Dec (autumn)', yield: '20–28', yieldMax: 28,
        varieties: 'Hysun-33, FH-331',
        tips: 'Spring crop gives higher yield. Bird damage near harvest is a major issue — netting recommended.',
      },
      Sindh: {
        sowing: 'Spring: Jan 1 — Feb 15\nAutumn: Aug 1 — Aug 31', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '5–7 irrigations (hotter climate needs more frequent watering)',
        harvest: 'Apr (spring) | Nov–Dec (autumn)', yield: '18–25', yieldMax: 25,
        varieties: 'Hysun-33',
        tips: 'Grown as an oilseed alternative to cotton in some Sindh districts.',
      },
      KPK: {
        sowing: 'Feb 1 — Mar 15', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '4–5 irrigations',
        harvest: 'May — June', yield: '15–20', yieldMax: 20,
        varieties: 'Local hybrids',
        tips: 'Limited cultivation — Mardan and Peshawar valley are the main areas.',
      },
      Balochistan: {
        sowing: 'Feb 1 — Mar 15', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '4–5 irrigations (tube wells)',
        harvest: 'May — June', yield: '12–18', yieldMax: 18,
        varieties: 'Local varieties',
        tips: 'Minor crop, grown mostly in Naseerabad division.',
      },
    },
  },
  Canola: {
    emoji: '🌼', urdu: 'کینولا/سرسوں', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    regions: {
      Punjab: {
        sowing: 'September 15 — October 31', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30–35 days',
        irrigation: '3–4 irrigations\n• 1st: 3–4 weeks after sowing\n• Critical at flowering & pod formation',
        harvest: 'February 15 — March 31', yield: '15–22', yieldMax: 22,
        varieties: 'Faisal Canola, Punjab Canola',
        tips: 'Canola-quality varieties give better oil quality than traditional sarson. Avoid waterlogging.',
      },
      Sindh: {
        sowing: 'October 1 — October 31', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '3–4 irrigations',
        harvest: 'February — March', yield: '12–18', yieldMax: 18,
        varieties: 'Local mustard varieties',
        tips: 'Grown as a minor Rabi oilseed, often intercropped with wheat.',
      },
      KPK: {
        sowing: 'September 15 — October 15', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '3–4 irrigations (rain-fed areas need less)',
        harvest: 'March — April', yield: '12–16', yieldMax: 16,
        varieties: 'Local varieties',
        tips: 'Common in Barani (rain-fed) areas as an oilseed and fodder crop.',
      },
      Balochistan: {
        sowing: 'September 1 — October 15', germination: '5–7 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '2–3 irrigations (drought-tolerant)',
        harvest: 'March — April', yield: '8–14', yieldMax: 14,
        varieties: 'Local varieties',
        tips: 'Drought-tolerant oilseed option for Barani Balochistan.',
      },
    },
  },
  Gram: {
    emoji: '🫘', urdu: 'چنا', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    regions: {
      Punjab: {
        sowing: 'Oct 1 — Nov 15 (Barani)\nSept 15 — Oct 15 (irrigated)', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing (legume — no urea needed)',
        fertilizer2: 'None — inoculate seed with Rhizobium culture instead',
        irrigation: 'Rain-fed: usually none needed\nIrrigated: 1–2 irrigations at flowering & pod filling',
        harvest: 'March — April', yield: '12–18', yieldMax: 18,
        varieties: 'Punjab-2011, Noor-2013',
        tips: 'Chakwal, Attock, Mianwali are major Barani gram areas. Avoid excess irrigation — causes vegetative growth over pods.',
      },
      Sindh: {
        sowing: 'October 15 — November 15', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: '1–2 irrigations',
        harvest: 'March', yield: '10–14', yieldMax: 14,
        varieties: 'Local varieties',
        tips: 'Minor crop in Sindh, grown on residual soil moisture.',
      },
      KPK: {
        sowing: 'October 1 — November 1', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: 'Mostly rain-fed — no irrigation',
        harvest: 'April — May', yield: '10–15', yieldMax: 15,
        varieties: 'Local varieties',
        tips: 'Widely grown in Barani KPK districts like Karak and Bannu.',
      },
      Balochistan: {
        sowing: 'October 1 — November 15', germination: '7–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: 'Rain-fed, 0–1 irrigation',
        harvest: 'April — May', yield: '8–12', yieldMax: 12,
        varieties: 'Kaballi (large-seed) types',
        tips: 'Balochistan is a major gram-growing province, especially Kaballi chickpea for export.',
      },
    },
  },
  Barley: {
    emoji: '🌾', urdu: 'جو', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    regions: {
      Punjab: {
        sowing: 'October 15 — November 15', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at tillering',
        irrigation: '2–3 irrigations (needs less water than wheat)',
        harvest: 'March — April', yield: '20–28', yieldMax: 28,
        varieties: 'Jau-87, Frontier-87',
        tips: 'More drought and salinity tolerant than wheat — a good choice for marginal land.',
      },
      Sindh: {
        sowing: 'November 1 — November 30', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at tillering',
        irrigation: '2–3 irrigations',
        harvest: 'March', yield: '18–24', yieldMax: 24,
        varieties: 'Local varieties',
        tips: 'Minor crop, mostly grown for animal feed.',
      },
      KPK: {
        sowing: 'October 15 — November 15', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at tillering',
        irrigation: '1–2 irrigations (mostly rain-fed)',
        harvest: 'April — May', yield: '15–22', yieldMax: 22,
        varieties: 'Local varieties',
        tips: 'Common Barani crop in cooler, higher-elevation areas.',
      },
      Balochistan: {
        sowing: 'October 1 — November 15', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at tillering',
        irrigation: '1–2 irrigations (drought-tolerant)',
        harvest: 'April — May', yield: '12–18', yieldMax: 18,
        varieties: 'Drought-tolerant local types',
        tips: "Well suited to Balochistan's dry Barani tracts.",
      },
    },
  },
  Millet: {
    emoji: '🌾', urdu: 'باجرہ', season: 'Kharif', seasonLabel: 'Kharif (Summer Crop)',
    regions: {
      Punjab: {
        sowing: 'June 15 — July 31', germination: '5–7 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '2–3 irrigations (drought-tolerant, rain-fed in many areas)',
        harvest: 'September — October', yield: '15–20', yieldMax: 20,
        varieties: 'Local & hybrid bajra',
        tips: 'Thal and Cholistan are major bajra tracts — thrives in sandy, low-rainfall soil.',
      },
      Sindh: {
        sowing: 'July 1 — July 31', germination: '5–7 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '2–3 irrigations',
        harvest: 'October', yield: '12–18', yieldMax: 18,
        varieties: 'Local varieties',
        tips: 'Grown mainly in Tharparkar and Sanghar as a drought-resilient staple.',
      },
      KPK: {
        sowing: 'June 15 — July 15', germination: '5–7 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '1–2 irrigations (mostly rain-fed)',
        harvest: 'September', yield: '10–15', yieldMax: 15,
        varieties: 'Local varieties',
        tips: 'Minor crop, grown in southern Barani districts like D.I. Khan.',
      },
      Balochistan: {
        sowing: 'June 1 — July 15', germination: '5–7 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '1–2 irrigations (drought-tolerant)',
        harvest: 'September — October', yield: '8–14', yieldMax: 14,
        varieties: 'Drought-tolerant local types',
        tips: "Well-suited to Balochistan's arid climate — needs minimal water.",
      },
    },
  },
  Sorghum: {
    emoji: '🌾', urdu: 'جوار', season: 'Kharif', seasonLabel: 'Kharif (Summer Crop)',
    regions: {
      Punjab: {
        sowing: 'June 15 — July 31', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '3–4 irrigations',
        harvest: 'September — October', yield: '18–25', yieldMax: 25,
        varieties: 'Grain & fodder varieties',
        tips: 'Widely grown as a dual-purpose grain and green fodder (chari) crop.',
      },
      Sindh: {
        sowing: 'July 1 — July 31', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '3–4 irrigations',
        harvest: 'October', yield: '15–22', yieldMax: 22,
        varieties: 'Local varieties',
        tips: 'Grown for both grain and green fodder across Sindh.',
      },
      KPK: {
        sowing: 'June 15 — July 15', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea 1 bag/acre at 30 days',
        irrigation: '2–3 irrigations',
        harvest: 'September', yield: '12–18', yieldMax: 18,
        varieties: 'Local varieties',
        tips: 'Common fodder crop in southern KPK districts.',
      },
      Balochistan: {
        sowing: 'June 1 — July 15', germination: '6–8 days',
        fertilizer1: 'DAP ½ bag/acre at sowing',
        fertilizer2: 'Urea ½ bag/acre at 30 days',
        irrigation: '2–3 irrigations (drought-tolerant)',
        harvest: 'September — October', yield: '10–16', yieldMax: 16,
        varieties: 'Drought-tolerant local types',
        tips: 'Grown mainly as livestock fodder in Nasirabad and Jaffarabad.',
      },
    },
  },
  Groundnut: {
    emoji: '🥜', urdu: 'مونگ پھلی', season: 'Kharif', seasonLabel: 'Kharif (Summer Crop)',
    regions: {
      Punjab: {
        sowing: 'April 15 — May 31', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing (legume — no urea needed)',
        fertilizer2: 'None — inoculate seed with Rhizobium culture',
        irrigation: '5–6 irrigations\n• Critical at flowering & pegging (pod formation)',
        harvest: 'September — October', yield: '25–35', yieldMax: 35,
        varieties: 'BARI-2000, Golden',
        tips: 'Chakwal and Attock (Barani Punjab) are major groundnut belts. Light, sandy soil is essential for good pod development.',
      },
      Sindh: {
        sowing: 'April 1 — May 15', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: '5–6 irrigations',
        harvest: 'September', yield: '20–28', yieldMax: 28,
        varieties: 'Local varieties',
        tips: 'Minor crop in Sindh, does best in sandy loam soils.',
      },
      KPK: {
        sowing: 'April 15 — May 31', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: '4–5 irrigations',
        harvest: 'September — October', yield: '18–25', yieldMax: 25,
        varieties: 'Local varieties',
        tips: 'Grown in Barani tracts alongside the groundnut belts of northern Punjab.',
      },
      Balochistan: {
        sowing: 'April 15 — May 31', germination: '8–10 days',
        fertilizer1: 'DAP 1 bag/acre at sowing',
        fertilizer2: 'None needed (legume)',
        irrigation: '4–5 irrigations',
        harvest: 'September — October', yield: '15–22', yieldMax: 22,
        varieties: 'Local varieties',
        tips: 'Best suited to well-drained sandy soils in southern Balochistan.',
      },
    },
  },
  Onion: {
    emoji: '🧅', urdu: 'پیاز', season: 'Rabi', seasonLabel: 'Rabi (Winter Crop)',
    regions: {
      Punjab: {
        sowing: 'Nursery: Sept 1–30\nTransplant: Oct 15 – Nov 30', germination: '8–10 days (nursery)',
        fertilizer1: 'DAP 1.5 bags/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at 30 & 60 days after transplanting',
        irrigation: '10–12 irrigations\n• Every 10–12 days\n• Stop 2–3 weeks before harvest',
        harvest: 'March — April', yield: '150–200', yieldMax: 200,
        varieties: 'Phulkara, Swat-1',
        tips: 'Avoid over-irrigation near harvest — causes neck rot and poor storage life.',
      },
      Sindh: {
        sowing: 'Nursery: Aug 15–Sept 15\nTransplant: Oct 1 – Nov 15', germination: '8–10 days',
        fertilizer1: 'DAP 1.5 bags/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at 30 & 60 days',
        irrigation: '10–14 irrigations',
        harvest: 'February — March', yield: '180–250', yieldMax: 250,
        varieties: 'Red globe types',
        tips: "Sindh (Hyderabad, Khairpur, Mirpurkhas) is Pakistan's top onion-producing region.",
      },
      KPK: {
        sowing: 'Nursery: Sept 1–30\nTransplant: Oct 15 – Nov 30', germination: '8–10 days',
        fertilizer1: 'DAP 1.5 bags/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at 30 & 60 days',
        irrigation: '8–10 irrigations',
        harvest: 'April — May', yield: '120–160', yieldMax: 160,
        varieties: 'Local varieties',
        tips: 'Grown mainly in Mardan and Swabi for both fresh use and seed production.',
      },
      Balochistan: {
        sowing: 'Nursery: Sept 1–30\nTransplant: Nov 1 – Nov 30', germination: '8–10 days',
        fertilizer1: 'DAP 1.5 bags/acre at transplanting',
        fertilizer2: 'Urea 1 bag/acre at 30 & 60 days',
        irrigation: '8–10 irrigations',
        harvest: 'April — May', yield: '100–140', yieldMax: 140,
        varieties: 'Local varieties',
        tips: 'Quetta valley onion is known for strong flavor and good storage quality.',
      },
    },
  },
};

const CROPS = Object.keys(cropData);
const REGIONS = ['Punjab', 'Sindh', 'KPK', 'Balochistan'];

/* ─── TIMELINE BAR ─────────────────────────────────────────── */
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Rough month mapping [sowStart, sowEnd, harvStart, harvEnd] per crop/region
const TIMELINES = {
  Wheat:     { Punjab: [10,11,4,5],  Sindh: [11,11,3,4],  KPK: [10,10,5,6],  Balochistan: [10,11,5,6] },
  Rice:      { Punjab: [6,7,10,11],  Sindh: [7,7,11,12],  KPK: [6,6,9,10],   Balochistan: [6,7,10,11] },
  Cotton:    { Punjab: [4,5,9,12],   Sindh: [4,5,9,12],   KPK: [4,5,9,11],   Balochistan: [4,5,9,11] },
  Sugarcane: { Punjab: [2,3,11,3],   Sindh: [10,11,12,4], KPK: [2,3,11,1],   Balochistan: [2,3,11,2] },
  Corn:      { Punjab: [2,7,5,11],   Sindh: [6,7,10,11],  KPK: [4,5,8,9],    Balochistan: [4,5,8,10] },
  Potato:    { Punjab: [10,11,1,3],  Sindh: [11,12,2,3],  KPK: [3,10,6,1],   Balochistan: [3,4,6,7] },
  Sunflower: { Punjab: [1,2,4,5],    Sindh: [1,2,4,4],    KPK: [2,3,5,6],    Balochistan: [2,3,5,6] },
  Canola:    { Punjab: [9,10,2,3],   Sindh: [10,10,2,3],  KPK: [9,10,3,4],   Balochistan: [9,10,3,4] },
  Gram:      { Punjab: [10,11,3,4],  Sindh: [10,11,3,3],  KPK: [10,11,4,5],  Balochistan: [10,11,4,5] },
  Barley:    { Punjab: [10,11,3,4],  Sindh: [11,11,3,3],  KPK: [10,11,4,5],  Balochistan: [10,11,4,5] },
  Millet:    { Punjab: [6,7,9,10],   Sindh: [7,7,10,10],  KPK: [6,7,9,9],    Balochistan: [6,7,9,10] },
  Sorghum:   { Punjab: [6,7,9,10],   Sindh: [7,7,10,10],  KPK: [6,7,9,9],    Balochistan: [6,7,9,10] },
  Groundnut: { Punjab: [4,5,9,10],   Sindh: [4,5,9,9],    KPK: [4,5,9,10],   Balochistan: [4,5,9,10] },
  Onion:     { Punjab: [10,11,3,4],  Sindh: [10,11,2,3],  KPK: [10,11,4,5],  Balochistan: [11,11,4,5] },
};

// Given a range that may wrap around the year (e.g. Nov–Feb), check if a month falls inside it
const monthInRange = (mo, start, end) =>
  end >= start ? (mo >= start && mo <= end) : (mo >= start || mo <= end);

function SeasonTimeline({ crop, region }) {
  const d = cropData[crop].regions[region];
  const [sowStart, sowEnd, harvStart, harvEnd] = TIMELINES[crop][region];

  return (
    <div className="mb-1">
      <div className="flex gap-px mb-1">
        {MONTHS.map((m, i) => {
          const mo = i + 1;
          const isSow = sowEnd >= sowStart
            ? mo >= sowStart && mo <= sowEnd
            : mo >= sowStart || mo <= sowEnd;
          const isHarv = harvEnd >= harvStart
            ? mo >= harvStart && mo <= harvEnd
            : mo >= harvStart || mo <= harvEnd;
          return (
            <div key={m} style={{ flex: 1 }}>
              <div style={{
                height: 8,
                borderRadius: 2,
                background: isSow ? '#16a34a' : isHarv ? '#f59e0b' : '#e5e7eb',
                transition: 'background 0.3s',
              }} />
              <div style={{ fontSize: 8, textAlign: 'center', color: '#9ca3af', marginTop: 2, fontWeight: 500 }}>{m}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6b7280' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#16a34a', display: 'inline-block' }} />
          Sowing
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#6b7280' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: '#f59e0b', display: 'inline-block' }} />
          Harvest
        </span>
      </div>
    </div>
  );
}

/* ─── INFO CARD ────────────────────────────────────────────── */
function InfoCard({ icon, title, urdu, value, delay = 0 }) {
  return (
    <div className="info-card" style={{ animationDelay: `${delay}ms` }}>
      <div className="info-card-header">
        <span className="info-card-icon">{icon}</span>
        <div>
          <span className="info-card-title">{title}</span>
          <span className="info-card-urdu">{urdu}</span>
        </div>
      </div>
      <p className="info-card-value">{value}</p>
    </div>
  );
}

/* ─── THIS MONTH PANEL ────────────────────────────────────── */
function ThisMonthPanel({ region, onPick }) {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const monthName = MONTHS[now.getMonth()];

  const sowNow = [];
  const harvestNow = [];
  CROPS.forEach(c => {
    const range = TIMELINES[c]?.[region];
    if (!range) return;
    const [sowStart, sowEnd, harvStart, harvEnd] = range;
    if (monthInRange(currentMonth, sowStart, sowEnd)) sowNow.push(c);
    if (monthInRange(currentMonth, harvStart, harvEnd)) harvestNow.push(c);
  });

  return (
    <div className="this-month-card">
      <div className="this-month-header">
        <span className="this-month-badge">📅 {monthName} &nbsp;·&nbsp; {region}</span>
        <span className="this-month-title">What To Do This Month</span>
        <span className="this-month-urdu">اس مہینے کیا کریں</span>
      </div>
      <div className="this-month-cols">
        <div className="this-month-col">
          <div className="this-month-col-label sow">🌱 Sow Now &nbsp;·&nbsp; بوائی کا وقت</div>
          {sowNow.length === 0 && <div className="this-month-empty">No major crops to sow in {region} this month.</div>}
          <div className="this-month-chips">
            {sowNow.map(c => (
              <button key={c} className="this-month-chip sow" onClick={() => onPick(c)}>
                <span>{cropData[c].emoji}</span> {c}
              </button>
            ))}
          </div>
        </div>
        <div className="this-month-col">
          <div className="this-month-col-label harvest">🌾 Harvest Now &nbsp;·&nbsp; کٹائی کا وقت</div>
          {harvestNow.length === 0 && <div className="this-month-empty">No major crops to harvest in {region} this month.</div>}
          <div className="this-month-chips">
            {harvestNow.map(c => (
              <button key={c} className="this-month-chip harvest" onClick={() => onPick(c)}>
                <span>{cropData[c].emoji}</span> {c}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN COMPONENT ───────────────────────────────────────── */
export default function CropCalendar() {
  const [crop, setCrop] = useState('Wheat');
  const [region, setRegion] = useState('Punjab');
  const [animKey, setAnimKey] = useState(0);

  const data = cropData[crop].regions[region];
  const meta = cropData[crop];

  const change = (fn) => { fn(); setAnimKey(k => k + 1); };

  const seasonColors = {
    Rabi: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    Kharif: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    Annual: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    Zaid: { bg: '#fef3c7', text: '#a16207', border: '#fde68a' },
  };
  const sc = seasonColors[meta.season];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Serif+Display&display=swap');

        .cc-wrap { font-family: 'DM Sans', system-ui, sans-serif; }

        /* ── HERO ── */
        .cc-hero {
          text-align: center;
          padding: 40px 16px 28px;
          position: relative;
        }
        .cc-hero-icon {
          width: 52px; height: 52px;
          background: linear-gradient(135deg, #16a34a, #4ade80);
          border-radius: 14px;
          display: inline-flex; align-items: center; justify-content: center;
          margin-bottom: 14px;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
        }
        .cc-hero h1 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 2rem; font-weight: 400;
          color: #111827; line-height: 1.2; margin: 0 0 6px;
        }
        .cc-hero-sub { font-size: 0.875rem; color: #6b7280; margin: 0; }
        .cc-hero-urdu {
          font-size: 1rem; color: #16a34a;
          margin-top: 4px; display: block;
          font-weight: 500;
        }

        /* ── SELECTORS ── */
        .selector-label {
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #9ca3af; margin-bottom: 10px;
          display: flex; align-items: center; gap: 6px;
        }
        .crop-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .crop-pill {
          display: flex; align-items: center; gap: 6px;
          padding: 7px 14px; border-radius: 10px;
          font-size: 0.8rem; font-weight: 500;
          border: 1.5px solid #e5e7eb;
          background: #fff; color: #374151;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .crop-pill:hover { border-color: #86efac; background: #f0fdf4; }
        .crop-pill.active {
          background: #16a34a; color: #fff;
          border-color: #16a34a;
          box-shadow: 0 2px 8px rgba(22,163,74,0.3);
        }
        .crop-pill-urdu { font-size: 0.7em; opacity: 0.75; }

        .region-pills { display: flex; gap: 8px; flex-wrap: wrap; }
        .region-pill {
          padding: 7px 18px; border-radius: 8px;
          font-size: 0.78rem; font-weight: 600;
          letter-spacing: 0.04em;
          border: 1.5px solid #e5e7eb;
          background: #fff; color: #6b7280;
          cursor: pointer;
          transition: all 0.18s ease;
          font-family: 'DM Sans', sans-serif;
        }
        .region-pill:hover { border-color: #6ee7b7; background: #f0fdf4; color: #166534; }
        .region-pill.active {
          background: #14532d; color: #fff;
          border-color: #14532d;
          box-shadow: 0 2px 8px rgba(20,83,45,0.2);
        }

        /* ── CROP HEADER ── */
        .crop-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; margin-bottom: 20px;
        }
        .crop-header-left h2 {
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.75rem; font-weight: 400;
          color: #111827; margin: 0 0 6px;
        }
        .crop-header-emoji {
          font-size: 3rem; line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }
        .season-badge {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px;
          font-size: 0.72rem; font-weight: 600; letter-spacing: 0.06em;
          border: 1px solid;
        }

        /* ── INFO CARDS ── */
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        @media (max-width: 500px) { .info-grid { grid-template-columns: 1fr; } }

        .info-card {
          background: #fff;
          border: 1px solid #f0fdf4;
          border-radius: 12px;
          padding: 14px 16px;
          animation: cardIn 0.3s ease both;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px #f0fdf4;
          transition: box-shadow 0.2s;
        }
        .info-card:hover { box-shadow: 0 4px 12px rgba(22,163,74,0.1), 0 0 0 1.5px #bbf7d0; }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .info-card-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 6px; }
        .info-card-icon {
          width: 30px; height: 30px; border-radius: 8px;
          background: #f0fdf4;
          display: flex; align-items: center; justify-content: center;
          color: #16a34a; flex-shrink: 0;
        }
        .info-card-title {
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #374151; display: block;
        }
        .info-card-urdu { font-size: 0.7rem; color: #9ca3af; display: block; margin-top: 1px; }
        .info-card-value { font-size: 0.82rem; color: #374151; white-space: pre-line; line-height: 1.6; margin: 0; padding-left: 40px; }

        /* ── YIELD ── */
        .yield-card {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #bbf7d0;
          border-radius: 14px; padding: 18px 20px;
          margin-bottom: 10px;
          display: flex; align-items: center; gap: 16px;
          animation: cardIn 0.3s ease 0.25s both;
        }
        .yield-label { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #16a34a; margin-bottom: 4px; }
        .yield-value { font-family: 'DM Serif Display', Georgia, serif; font-size: 1.6rem; color: #14532d; line-height: 1; }
        .yield-unit { font-size: 0.75rem; color: #4b7c5e; margin-top: 2px; }
        .yield-varieties { font-size: 0.75rem; color: #6b7280; margin-top: 4px; }
        .yield-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: linear-gradient(135deg, #16a34a, #4ade80);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; box-shadow: 0 2px 8px rgba(22,163,74,0.3);
          font-size: 1.5rem;
        }

        /* ── TIMELINE ── */
        .timeline-card {
          background: #fff;
          border: 1px solid #f0fdf4;
          border-radius: 12px; padding: 16px;
          margin-bottom: 10px;
          animation: cardIn 0.3s ease 0.15s both;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .timeline-title { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #9ca3af; margin-bottom: 10px; }

        /* ── TIP ── */
        .tip-card {
          background: #fffbeb;
          border: 1px solid #fde68a;
          border-left: 4px solid #f59e0b;
          border-radius: 0 12px 12px 0;
          padding: 16px 18px;
          animation: cardIn 0.3s ease 0.3s both;
        }
        .tip-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .tip-header-text { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #b45309; }
        .tip-body { font-size: 0.83rem; color: #78350f; line-height: 1.6; }

        /* ── SECTION WRAPPER ── */
        .section-box { padding: 0 20px 24px; }
        .section-divider { height: 1px; background: #f3f4f6; margin: 0 20px 20px; }

        /* ── THIS MONTH PANEL ── */
        .this-month-card {
          background: linear-gradient(135deg, #14532d 0%, #166534 55%, #15803d 100%);
          border-radius: 16px;
          padding: 20px 22px 22px;
          box-shadow: 0 8px 24px rgba(20,83,45,0.25);
        }
        .this-month-header { margin-bottom: 16px; }
        .this-month-badge {
          display: inline-block;
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.25);
          color: #bbf7d0;
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.06em;
          border-radius: 999px; padding: 4px 12px;
          margin-bottom: 8px;
        }
        .this-month-title {
          display: block;
          font-family: 'DM Serif Display', Georgia, serif;
          font-size: 1.3rem; color: #fff; font-weight: 400;
        }
        .this-month-urdu { display: block; font-size: 0.85rem; color: #86efac; margin-top: 2px; }
        .this-month-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 500px) { .this-month-cols { grid-template-columns: 1fr; } }
        .this-month-col-label {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.05em;
          color: #dcfce7; margin-bottom: 8px;
        }
        .this-month-empty { font-size: 0.78rem; color: rgba(255,255,255,0.55); font-style: italic; }
        .this-month-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .this-month-chip {
          display: flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,0.95);
          border: none; border-radius: 8px;
          padding: 6px 10px; font-size: 0.78rem; font-weight: 600;
          color: #14532d; cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .this-month-chip:hover { transform: translateY(-1px); box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
        .this-month-chip.sow { border-left: 3px solid #16a34a; }
        .this-month-chip.harvest { border-left: 3px solid #f59e0b; }
        .section-head { padding: 20px 20px 12px; }
      `}</style>

      <div className="cc-wrap" style={{ maxWidth: 680, margin: '0 auto' }}>

        {/* HERO */}
        <div className="cc-hero">
          <div className="cc-hero-icon">
            <Calendar size={26} color="#fff" strokeWidth={2} />
          </div>
          <h1>Crop Calendar</h1>
          <p className="cc-hero-sub">Sowing · Irrigation · Fertilizer · Harvest — All Pakistani crops</p>
          <span className="cc-hero-urdu">پاکستانی فصلوں کا زرعی کیلنڈر</span>
        </div>

        {/* THIS MONTH PANEL */}
        <div className="section-box" style={{ paddingTop: 0 }}>
          <ThisMonthPanel region={region} onPick={(c) => change(() => setCrop(c))} />
        </div>

        <div className="section-divider" />

        {/* CROP SELECTOR */}
        <div className="section-box">
          <div className="selector-label">
            <Leaf size={12} /> Select Crop &nbsp;·&nbsp; فصل منتخب کریں
          </div>
          <div className="crop-pills">
            {CROPS.map(c => (
              <button
                key={c}
                className={`crop-pill${crop === c ? ' active' : ''}`}
                onClick={() => change(() => setCrop(c))}
              >
                <span>{cropData[c].emoji}</span>
                <span>{c}</span>
                <span className="crop-pill-urdu">{cropData[c].urdu}</span>
              </button>
            ))}
          </div>
        </div>

        {/* REGION SELECTOR */}
        <div className="section-box" style={{ paddingTop: 0 }}>
          <div className="selector-label">
            <MapPin size={12} /> Province &nbsp;·&nbsp; صوبہ
          </div>
          <div className="region-pills">
            {REGIONS.map(r => (
              <button
                key={r}
                className={`region-pill${region === r ? ' active' : ''}`}
                onClick={() => change(() => setRegion(r))}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="section-divider" />

        {/* DATA PANEL */}
        <div key={animKey} className="section-box">

          {/* Crop identity */}
          <div className="crop-header">
            <div className="crop-header-left">
              <h2>{crop} — {region}</h2>
              <span
                className="season-badge"
                style={{ background: sc.bg, color: sc.text, borderColor: sc.border }}
              >
                <Sprout size={11} /> {meta.seasonLabel}
              </span>
            </div>
            <div className="crop-header-emoji">{meta.emoji}</div>
          </div>

          {/* Season timeline */}
          <div className="timeline-card">
            <div className="timeline-title">Growing Calendar</div>
            <SeasonTimeline crop={crop} region={region} />
          </div>

          {/* Info cards */}
          <div className="info-grid">
            <InfoCard icon={<Sprout size={15} />} title="Sowing Time" urdu="بوائی کا وقت" value={data.sowing} delay={0} />
            <InfoCard icon={<Sprout size={15} />} title="Germination" urdu="انکرت" value={data.germination} delay={40} />
            <InfoCard icon={<Wheat size={15} />} title="First Fertilizer" urdu="پہلی کھاد" value={data.fertilizer1} delay={80} />
            <InfoCard icon={<Wheat size={15} />} title="Follow-up Doses" urdu="بعد کی کھاد" value={data.fertilizer2} delay={120} />
            <InfoCard icon={<Droplets size={15} />} title="Irrigation" urdu="آبپاشی" value={data.irrigation} delay={160} />
            <InfoCard icon={<Calendar size={15} />} title="Harvest Time" urdu="کٹائی" value={data.harvest} delay={200} />
          </div>

          {/* Yield */}
          <div className="yield-card">
            <div className="yield-icon">{meta.emoji}</div>
            <div style={{ flex: 1 }}>
              <div className="yield-label">
                <TrendingUp size={10} style={{ display: 'inline', marginRight: 4 }} />
                Expected Yield &nbsp;·&nbsp; متوقع پیداوار
              </div>
              <div className="yield-value">{data.yield}</div>
              <div className="yield-unit">maunds per acre</div>
              <div className="yield-varieties">Varieties: {data.varieties}</div>
            </div>
          </div>

          {/* Tip */}
          <div className="tip-card">
            <div className="tip-header">
              <span style={{ fontSize: '1rem' }}>💡</span>
              <span className="tip-header-text">Expert Tip — {region}</span>
            </div>
            <p className="tip-body">{data.tips}</p>
          </div>

        </div>
      </div>
    </>
  );
}
