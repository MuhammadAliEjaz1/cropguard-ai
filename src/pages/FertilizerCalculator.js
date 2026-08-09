import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calculator, Leaf, Sprout } from 'lucide-react';
import { API_URL } from '../config';

// Fallback data — used only if the live backend data can't be reached.
// The admin panel (/admin) edits the live version on the server.
const defaultFertilizerData = {
  Wheat: {
    emoji: '🌾',
    urdu: 'گندم',
    perAcre: {
      DAP:   { bags: 1,   kg: 50,  pricePerBag: 14800 },
      Urea:  { bags: 1.5, kg: 75,  pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,   pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At sowing',          fertilizer: 'DAP 1 bag + Urea half bag' },
      { time: 'Tillering (Dec-Jan)', fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Apply DAP and half Urea at sowing. Remaining Urea at tillering stage.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Yellow Rust, Brown Rust, Septoria',  dose: '400g/acre',  price: 2495,  unit: 'per 400g pack' },
      { name: 'Topsin-M',      type: 'Fungicide',   target: 'Loose Smut, Powdery Mildew',         dose: '250g/acre',  price: 2249,  unit: 'per 250g pack' },
      { name: 'Karate',        type: 'Insecticide', target: 'Aphids, Army Worm, Shoot Fly',       dose: '200ml/acre', price: 3400,  unit: 'per 500ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites, Cutworm, Aphids',          dose: '500ml/acre', price: 2480,  unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Grassy weeds, Broad leaf weeds',     dose: '1L/acre',    price: 4000,  unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-sowing weed control',            dose: '700ml/acre', price: 1350,  unit: 'per liter' },
    ]
  },
  Rice: {
    emoji: '🌾',
    urdu: 'چاول',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 1.5, kg: 75, pricePerBag: 4600  },
      Potash:{ bags: 0.5, kg: 25, pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At transplanting',   fertilizer: 'DAP 1 bag + Potash half bag' },
      { time: 'Tillering (30 days)', fertilizer: 'Urea 1 bag' },
      { time: 'Panicle initiation', fertilizer: 'Urea half bag' },
    ],
    notes: 'Potash is important for rice quality. Do not over-apply Urea — causes lodging.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Rice Blast, Brown Spot, Leaf Scald', dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Antracol',      type: 'Fungicide',   target: 'Sheath Blight, Leaf Blast',          dose: '400g/acre',  price: 2780, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Brown Planthopper, Leaf Hopper, Aphids', dose: '80ml/acre', price: 2950, unit: 'per 100ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Stem Borer, Gall Midge',             dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Grassy weeds in nursery and field',  dose: '1L/acre',    price: 4000, unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-transplant weed burndown',       dose: '700ml/acre', price: 1350, unit: 'per liter' },
    ]
  },
  Cotton: {
    emoji: '🌿',
    urdu: 'کپاس',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 1.5, kg: 75, pricePerBag: 4600  },
      Potash:{ bags: 1,   kg: 50, pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At sowing',       fertilizer: 'DAP 1 bag + Potash 1 bag' },
      { time: 'Squaring (45d)',  fertilizer: 'Urea 1 bag' },
      { time: 'Boll formation',  fertilizer: 'Urea half bag' },
    ],
    notes: 'Potash is critical for fiber quality. Do not apply Urea during boll opening.',
    sprays: [
      { name: 'Confidor',      type: 'Insecticide', target: 'Whitefly, Jassid, Aphids, Thrips',   dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Karate',        type: 'Insecticide', target: 'Bollworm, Spodoptera, Pink Bollworm', dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Actara',        type: 'Insecticide', target: 'Whitefly, Jassid (resistant strains)', dose: '60g/acre',  price: 500,  unit: 'per 60g pack' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites, Cutworm at germination',   dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Grassy and broad leaf weeds',        dose: '1L/acre',    price: 4000, unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-sowing weed burndown',           dose: '700ml/acre', price: 1350, unit: 'per liter' },
    ]
  },
  Sugarcane: {
    emoji: '🎋',
    urdu: 'گنا',
    perAcre: {
      DAP:   { bags: 1.5, kg: 75,  pricePerBag: 14800 },
      Urea:  { bags: 2.5, kg: 125, pricePerBag: 4600  },
      Potash:{ bags: 1,   kg: 50,  pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At planting',   fertilizer: 'DAP 1.5 bags + Potash 1 bag' },
      { time: '2 months',      fertilizer: 'Urea 1 bag' },
      { time: '4 months',      fertilizer: 'Urea 1 bag' },
      { time: '6 months',      fertilizer: 'Urea half bag' },
    ],
    notes: 'Sugarcane needs highest fertilizer. Split Urea applications give best results.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Red Rot, Smut, Wilt disease',        dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Sugarcane Pyrilla, Aphids, Mealybug', dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Stem Borer, Root Borer, Termites',   dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Karate',        type: 'Insecticide', target: 'Top Borer, Early Shoot Borer',        dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-emergence weed control',         dose: '700ml/acre', price: 1350, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Post-emergence grassy weeds',        dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Corn: {
    emoji: '🌽',
    urdu: 'مکئی',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 1.5, kg: 75, pricePerBag: 4600  },
      Potash:{ bags: 0.5, kg: 25, pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At sowing',         fertilizer: 'DAP 1 bag' },
      { time: 'Knee height (30d)', fertilizer: 'Urea 1 bag' },
      { time: 'Tasseling',         fertilizer: 'Urea half bag + Potash half bag' },
    ],
    notes: 'Corn responds well to Nitrogen. Critical irrigation at tasseling and silking.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Gray Leaf Spot, Northern Blight, Rust', dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Antracol',      type: 'Fungicide',   target: 'Common Rust, Leaf Blight',              dose: '400g/acre',  price: 2780, unit: 'per 400g pack' },
      { name: 'Karate',        type: 'Insecticide', target: 'Fall Armyworm, Corn Borer, Aphids',     dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites, Cutworm, Root Worm',          dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence grassy and broad weeds',  dose: '1L/acre',    price: 4000, unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-sowing weed burndown',              dose: '700ml/acre', price: 1350, unit: 'per liter' },
    ]
  },
  Potato: {
    emoji: '🥔',
    urdu: 'آلو',
    perAcre: {
      DAP:   { bags: 1.5, kg: 75, pricePerBag: 14800 },
      Urea:  { bags: 1,   kg: 50, pricePerBag: 4600  },
      Potash:{ bags: 1,   kg: 50, pricePerBag: 16500  },
    },
    schedule: [
      { time: 'At planting',       fertilizer: 'DAP 1.5 bags + Potash 1 bag' },
      { time: 'Earthing up (30d)', fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Potash is essential for tuber development. Do not over-apply Nitrogen.',
    sprays: [
      { name: 'Ridomil Gold',  type: 'Fungicide',   target: 'Late Blight (best option)',           dose: '400g/acre',  price: 2200, unit: 'per 400g pack' },
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Late Blight, Early Blight (preventive)', dose: '400g/acre', price: 2495, unit: 'per 400g pack' },
      { name: 'Antracol',      type: 'Fungicide',   target: 'Early Blight, Late Blight',           dose: '400g/acre',  price: 2780, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Aphids, Whitefly, Jassid',            dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Cutworm, Wireworm, Termites',         dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Sunflower: {
    emoji: '🌻',
    urdu: 'گل آفتاب',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 1,   kg: 50, pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing',        fertilizer: 'DAP 1 bag' },
      { time: '30 days',          fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Sunflower needs good boron supply for seed filling. Avoid excess nitrogen before flowering.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Head Rot, Alternaria Leaf Spot',      dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Aphids, Jassid, Whitefly',            dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites, Cutworm',                   dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-sowing weed burndown',            dose: '700ml/acre', price: 1350, unit: 'per liter' },
    ]
  },
  Canola: {
    emoji: '🌼',
    urdu: 'کینولا/سرسوں',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 1,   kg: 50, pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing',        fertilizer: 'DAP 1 bag' },
      { time: '30–35 days',       fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Canola needs sulfur for good oil quality — apply gypsum if soil is sulfur-deficient.',
    sprays: [
      { name: 'Karate',        type: 'Insecticide', target: 'Aphids, Painted Bug',                 dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Alternaria Blight, White Rust',       dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
      { name: 'Gramoxone',     type: 'Herbicide',   target: 'Pre-sowing weed burndown',            dose: '700ml/acre', price: 1350, unit: 'per liter' },
    ]
  },
  Gram: {
    emoji: '🫘',
    urdu: 'چنا',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 0,   kg: 0,  pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing', fertilizer: 'DAP 1 bag (inoculate seed with Rhizobium culture)' },
    ],
    notes: 'Legume crop — fixes its own nitrogen. Avoid Urea, which reduces nodulation and pod set.',
    sprays: [
      { name: 'Topsin-M',      type: 'Fungicide',   target: 'Ascochyta Blight, Wilt',              dose: '250g/acre',  price: 2249, unit: 'per 250g pack' },
      { name: 'Karate',        type: 'Insecticide', target: 'Pod Borer, Cutworm',                  dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Barley: {
    emoji: '🌾',
    urdu: 'جو',
    perAcre: {
      DAP:   { bags: 0.5, kg: 25, pricePerBag: 14800 },
      Urea:  { bags: 0.75,kg: 37.5,pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing',    fertilizer: 'DAP half bag' },
      { time: 'Tillering',    fertilizer: 'Urea 3/4 bag' },
    ],
    notes: 'Barley needs less fertilizer than wheat — over-fertilizing causes lodging.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Leaf Rust, Powdery Mildew',           dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Aphids, Termites',                    dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Grassy and broad leaf weeds',         dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Millet: {
    emoji: '🌾',
    urdu: 'باجرہ',
    perAcre: {
      DAP:   { bags: 0.5, kg: 25, pricePerBag: 14800 },
      Urea:  { bags: 0.5, kg: 25, pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing', fertilizer: 'DAP half bag' },
      { time: '30 days',   fertilizer: 'Urea half bag' },
    ],
    notes: 'Drought-tolerant crop — needs minimal fertilizer input compared to other cereals.',
    sprays: [
      { name: 'Karate',        type: 'Insecticide', target: 'Shoot Fly, Stem Borer',               dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites',                            dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Sorghum: {
    emoji: '🌾',
    urdu: 'جوار',
    perAcre: {
      DAP:   { bags: 0.5, kg: 25, pricePerBag: 14800 },
      Urea:  { bags: 1,   kg: 50, pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing', fertilizer: 'DAP half bag' },
      { time: '30 days',   fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Dual-purpose grain and fodder crop — split Urea gives better tillering.',
    sprays: [
      { name: 'Karate',        type: 'Insecticide', target: 'Stem Borer, Shoot Fly',               dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Termites, Cutworm',                   dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Groundnut: {
    emoji: '🥜',
    urdu: 'مونگ پھلی',
    perAcre: {
      DAP:   { bags: 1,   kg: 50, pricePerBag: 14800 },
      Urea:  { bags: 0,   kg: 0,  pricePerBag: 4600  },
      Potash:{ bags: 0,   kg: 0,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At sowing', fertilizer: 'DAP 1 bag (inoculate seed with Rhizobium culture)' },
    ],
    notes: 'Legume crop — avoid Urea. Apply gypsum at pegging stage for good pod filling.',
    sprays: [
      { name: 'Dithane M-45',  type: 'Fungicide',   target: 'Leaf Spot, Rust',                     dose: '400g/acre',  price: 2495, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Thrips, Jassid',                      dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Karate',        type: 'Insecticide', target: 'Termites, Leaf Miner',                dose: '200ml/acre', price: 3400, unit: 'per 500ml bottle' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
  Onion: {
    emoji: '🧅',
    urdu: 'پیاز',
    perAcre: {
      DAP:   { bags: 1.5, kg: 75,  pricePerBag: 14800 },
      Urea:  { bags: 2,   kg: 100, pricePerBag: 4600  },
      Potash:{ bags: 0.5, kg: 25,  pricePerBag: 16500 },
    },
    schedule: [
      { time: 'At transplanting',        fertilizer: 'DAP 1.5 bags + Potash half bag' },
      { time: '30 days after transplant', fertilizer: 'Urea 1 bag' },
      { time: '60 days after transplant', fertilizer: 'Urea 1 bag' },
    ],
    notes: 'Heavy feeder — split Urea doses to avoid excess leaf growth that delays bulbing.',
    sprays: [
      { name: 'Ridomil Gold',  type: 'Fungicide',   target: 'Purple Blotch, Downy Mildew',         dose: '400g/acre',  price: 2200, unit: 'per 400g pack' },
      { name: 'Antracol',      type: 'Fungicide',   target: 'Purple Blotch, Stemphylium Blight',   dose: '400g/acre',  price: 2780, unit: 'per 400g pack' },
      { name: 'Confidor',      type: 'Insecticide', target: 'Thrips (major onion pest)',           dose: '80ml/acre',  price: 2950, unit: 'per 100ml bottle' },
      { name: 'Chlorpyrifos',  type: 'Insecticide', target: 'Cutworm, Termites',                   dose: '500ml/acre', price: 2480, unit: 'per liter' },
      { name: 'Stomp',         type: 'Herbicide',   target: 'Pre-emergence weed control',          dose: '1L/acre',    price: 4000, unit: 'per liter' },
    ]
  },
};

const typeColors = {
  Fungicide:   'bg-blue-100 text-blue-700',
  Insecticide: 'bg-red-100 text-red-700',
  Herbicide:   'bg-yellow-100 text-yellow-700',
};

// Parse a quantity string like "400g", "200ml", "1L", or "per liter" into { num, unit: 'g'|'ml' }
const parseQty = (str) => {
  if (/per liter/i.test(str) && !/\d/.test(str)) return { num: 1000, unit: 'ml' };
  const m = str.match(/([\d.]+)\s*(ml|g|l)\b/i);
  if (!m) return null;
  let num = parseFloat(m[1]);
  let unit = m[2].toLowerCase();
  if (unit === 'l') { num *= 1000; unit = 'ml'; }
  return { num, unit };
};

// Cost of one spray application scaled to a given number of acres
const sprayCostForAcres = (spray, acres) => {
  const dose = parseQty(spray.dose);
  const pack = parseQty(spray.unit);
  if (!dose || !pack || dose.unit !== pack.unit) return null;
  return Math.round((dose.num / pack.num) * spray.price * acres);
};

function FertilizerCalculator() {
  const [fertilizerData, setFertilizerData] = useState(defaultFertilizerData);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('Wheat');
  const [acres, setAcres]               = useState('');
  const [result, setResult]             = useState(null);
  const [activeTab, setActiveTab]       = useState('fertilizer');

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_URL}/fertilizer-data`);
        if (res.data && Object.keys(res.data).length > 0) {
          setFertilizerData(res.data);
        }
      } catch {
        // Backend unreachable — silently keep using the bundled default data.
      } finally {
        setDataLoading(false);
      }
    })();
  }, []);

  const crops = Object.keys(fertilizerData);

  const calculate = () => {
    const a = parseFloat(acres);
    if (!a || a <= 0) return;
    const data = fertilizerData[selectedCrop];
    const calc = {};
    let totalFertCost = 0;
    Object.entries(data.perAcre).forEach(([fert, info]) => {
      const totalBags = +(info.bags * a).toFixed(2);
      const totalKg   = +(info.kg * a).toFixed(1);
      const cost      = Math.round(totalBags * info.pricePerBag);
      totalFertCost  += cost;
      calc[fert] = { totalBags, totalKg, cost, pricePerBag: info.pricePerBag };
    });
    setResult({ calc, totalFertCost, acres: a });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-8 px-6 py-10 text-center"
           style={{ background: 'linear-gradient(160deg, #14532D 0%, #166534 50%, #15803D 100%)' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
             style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <Calculator size={26} color="#fff" />
        </div>
        <h1 className="text-3xl font-bold text-white">Fertilizer & Spray Guide</h1>
        <p className="text-white/80 mt-2">Calculate fertilizer cost and find the right spray for your crop</p>
        <p className="mt-1" style={{ color: '#86EFAC' }}>کھاد کی مقدار اور فصل کے لیے مناسب سپرے معلوم کریں</p>
        <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
             style={{ background: 'rgba(255,255,255,0.12)', color: '#dcfce7', border: '1px solid rgba(255,255,255,0.2)' }}>
          💰 {crops.length} crops · {dataLoading ? 'Loading latest rates…' : 'Live rates'}
        </div>
      </div>

      {/* Crop Selector */}
      <div className="mb-6">
        <p className="text-sm font-medium text-gray-600 mb-3">Select Crop / فصل منتخب کریں:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {crops.map(crop => (
            <button
              key={crop}
              onClick={() => { setSelectedCrop(crop); setResult(null); }}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-medium border transition text-left ${
                selectedCrop === crop
                  ? 'bg-green-600 text-white border-green-600 shadow-md shadow-green-600/25'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:bg-green-50'
              }`}
            >
              <span className="text-lg">{fertilizerData[crop].emoji}</span>
              <span className="flex flex-col leading-tight">
                <span className="text-sm">{crop}</span>
                <span className={`text-[10px] ${selectedCrop === crop ? 'text-green-100' : 'text-gray-400'}`}>{fertilizerData[crop].urdu}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-gray-100 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('fertilizer')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'fertilizer'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Leaf size={16} /> Fertilizer Calculator
        </button>
        <button
          onClick={() => setActiveTab('spray')}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm transition ${
            activeTab === 'spray'
              ? 'bg-white text-green-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Sprout size={16} /> Spray Guide
        </button>
      </div>

      {/* FERTILIZER TAB */}
      {activeTab === 'fertilizer' && (
        <div>
          <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
            {/* Schedule */}
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <p className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                <Leaf size={16} /> Application Schedule for {selectedCrop}
              </p>
              <div className="space-y-2">
                {fertilizerData[selectedCrop].schedule.map((s, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="bg-green-200 text-green-800 px-2 py-1 rounded font-medium min-w-fit">
                      {s.time}
                    </span>
                    <span className="text-gray-700">{s.fertilizer}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Acres Input */}
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Land Size / زمین کا رقبہ (Acres):
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                value={acres}
                onChange={e => { setAcres(e.target.value); setResult(null); }}
                placeholder="Enter acres e.g. 5"
                min="0.25"
                step="0.25"
                className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:border-green-400 text-lg"
              />
              <button
                onClick={calculate}
                disabled={!acres || parseFloat(acres) <= 0}
                className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
              >
                Calculate
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-gray-800">
                Results for {result.acres} Acre{result.acres > 1 ? 's' : ''} of {selectedCrop}
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(result.calc).map(([fert, info]) => (
                  info.totalBags > 0 && (
                    <div key={fert} className="bg-white rounded-xl shadow-sm border p-5">
                      <div className="text-2xl font-bold text-green-700 mb-3">{fert}</div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Bags / تھیلے</span>
                          <span className="font-bold text-gray-800">{info.totalBags}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Weight / وزن</span>
                          <span className="font-bold text-gray-800">{info.totalKg} kg</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Rate</span>
                          <span>Rs {info.pricePerBag.toLocaleString()}/bag</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-semibold">Total</span>
                          <span className="font-bold text-green-700">Rs {info.cost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Cost breakdown bar */}
              <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="text-sm font-semibold text-gray-700 mb-3">Cost Breakdown / لاگت کی تقسیم</div>
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  {Object.entries(result.calc).filter(([, i]) => i.cost > 0).map(([fert, info]) => (
                    <div
                      key={fert}
                      style={{
                        width: `${(info.cost / result.totalFertCost) * 100}%`,
                        background: fert === 'DAP' ? '#16a34a' : fert === 'Urea' ? '#4ade80' : '#a3e635',
                      }}
                    />
                  ))}
                </div>
                <div className="flex flex-wrap gap-4 mt-3">
                  {Object.entries(result.calc).filter(([, i]) => i.cost > 0).map(([fert, info]) => (
                    <div key={fert} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{
                        background: fert === 'DAP' ? '#16a34a' : fert === 'Urea' ? '#4ade80' : '#a3e635',
                      }} />
                      {fert} — {Math.round((info.cost / result.totalFertCost) * 100)}%
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-600 text-white rounded-xl p-6 flex justify-between items-center">
                <div>
                  <div className="text-green-200 text-sm">Total Fertilizer Cost / کل کھاد لاگت</div>
                  <div className="text-green-100 text-sm mt-1">
                    Rs {Math.round(result.totalFertCost / result.acres).toLocaleString()} per acre
                  </div>
                </div>
                <div className="text-3xl font-bold">Rs {result.totalFertCost.toLocaleString()}</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <span className="font-bold">💡 Note: </span>
                {fertilizerData[selectedCrop].notes}
                <span className="block mt-1 text-yellow-600">
                  DAP: Rs 14,800/bag | Urea: Rs 4,600/bag | SOP (Potash): Rs 16,500/bag | Rates as of Aug 2026 — vary by dealer and city.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SPRAY TAB */}
      {activeTab === 'spray' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Recommended sprays for <span className="font-bold text-green-700">{selectedCrop}</span> — 
            includes fungicides, insecticides and herbicides with current 2026 prices.
          </p>

          {result ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-sm text-green-800">
              💰 Showing cost per application for your <span className="font-bold">{result.acres} acre{result.acres > 1 ? 's' : ''}</span>. Change this on the Fertilizer Calculator tab.
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm text-gray-500">
              Enter your land size on the Fertilizer Calculator tab to see the cost for your own farm here.
            </div>
          )}

          {/* Filter by type */}
          {['Fungicide', 'Insecticide', 'Herbicide'].map(type => {
            const filtered = fertilizerData[selectedCrop].sprays.filter(s => s.type === type);
            if (!filtered.length) return null;
            return (
              <div key={type}>
                <h3 className={`inline-block px-3 py-1 rounded-full text-sm font-bold mb-3 ${typeColors[type]}`}>
                  {type === 'Fungicide'   ? '🔵 Fungicide — پھپھوندی کش' :
                   type === 'Insecticide' ? '🔴 Insecticide — کیڑے مار'  :
                                           '🟡 Herbicide — جڑی بوٹی مار'}
                </h3>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {filtered.map((spray, i) => {
                    const scaled = result ? sprayCostForAcres(spray, result.acres) : null;
                    return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="font-bold text-gray-800 text-lg">{spray.name}</div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[spray.type]}`}>
                            {spray.type}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-700 text-lg">
                            Rs {spray.price.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">{spray.unit}</div>
                        </div>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[70px]">Target:</span>
                          <span>{spray.target}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="font-medium min-w-[70px]">Dose:</span>
                          <span className="text-green-700 font-medium">{spray.dose}</span>
                        </div>
                      </div>
                      {scaled != null && (
                        <div className="mt-3 pt-3 border-t flex justify-between items-center">
                          <span className="text-xs text-gray-500">Cost for {result.acres} acre{result.acres > 1 ? 's' : ''}</span>
                          <span className="font-bold text-green-700">Rs {scaled.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
            <span className="font-bold">⚠️ Important: </span>
            Always wear gloves, mask and goggles when applying sprays. Keep children away from treated fields. 
            Follow label instructions for correct dosage. Prices are approximate 2026 market rates and may vary by region.
          </div>
        </div>
      )}
    </div>
  );
}

export default FertilizerCalculator;
