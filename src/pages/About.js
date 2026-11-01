import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Cpu, Database, FlaskConical, Globe, Shield, Zap } from 'lucide-react';

/* ─── DATA ──────────────────────────────────────────────────────────────── */
const team = [
  {
    name: 'Muhammad Ali Ejaz',
    initials: 'MA',
    role: 'ML Engineer · Full-Stack · Research',
    focus: 'End-to-end project lead: per-crop model architecture, transfer learning, dataset curation, FastAPI backend, React frontend, LLM integration, bilingual UI, disease map & full deployment',
    color: 'from-emerald-500 to-green-600',
    highlight: true,
  },
  {
    name: 'Ahmad Siddique',
    initials: 'AS',
    role: 'Data Preprocessing · Frontend',
    focus: 'Dataset cleaning, image validation, preprocessing pipeline, and frontend development support',
    color: 'from-teal-500 to-emerald-600',
  },
];

const gaps = [
  { gap: 'Lab-only images — fail in real fields', improvement: 'Field-condition photos used wherever available — 49,000+ images from public datasets', icon: '🌾' },
  { gap: 'English-only output', improvement: 'Bilingual Urdu + English with natural spoken Pakistani Urdu', icon: '🗣️' },
  { gap: 'Single model — cross-crop confusion', improvement: '6 independent per-crop models — the farmer picks the crop, so models never mix crops', icon: '🧠' },
  { gap: 'CNN diagnosis with no guidance', improvement: 'CNN detection + Gemini LLM treatment education', icon: '💊' },
  { gap: 'No disease spread awareness', improvement: 'Geo-tagged community disease warning map', icon: '🗺️' },
  { gap: 'No integrated farming platform', improvement: 'Detection, expert chat, weather advice, crop calendar and disease map in one platform', icon: '📱' },
];

const crops = [
  {
    emoji: '🌾',
    name: 'Wheat',
    accuracy: '90.39%',
    classes: 15,
    images: '14,154',
    arch: 'EfficientNetV2S',
    sources: ['kushagra3204 (Kaggle)', 'Original train/valid/test folders merged, then split again 80/20'],
    bg: 'bg-amber-50', border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800', dot: 'bg-amber-400',
    accent: 'text-amber-700',
  },
  {
    emoji: '🌱',
    name: 'Rice',
    accuracy: '98.03%',
    classes: 6,
    images: '9,108',
    arch: 'EfficientNetV2S',
    sources: ['afzaalsattar (Kaggle)', 'Original train/valid/test split kept'],
    bg: 'bg-blue-50', border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800', dot: 'bg-blue-400',
    accent: 'text-blue-700',
  },
  {
    emoji: '☁️',
    name: 'Cotton',
    accuracy: '98.83%',
    classes: 4,
    images: '8,962',
    arch: 'EfficientNetB0',
    sources: ['seroshkarim (Kaggle)', 'Roboflow: h-jintr & cottonleafdisease-nvr42', 'Mendeley SAR-CLD-2024 (field survey)'],
    bg: 'bg-purple-50', border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800', dot: 'bg-purple-400',
    accent: 'text-purple-700',
  },
  {
    emoji: '🎋',
    name: 'Sugarcane',
    accuracy: '96.41%',
    classes: 6,
    images: '7,111',
    arch: 'EfficientNetB0',
    sources: ['nirmalsankalana (Kaggle)', 'Roboflow: thayakar-ed3it/sugarcane-aht9u'],
    bg: 'bg-green-50', border: 'border-green-200',
    badge: 'bg-green-100 text-green-800', dot: 'bg-green-400',
    accent: 'text-green-700',
  },
  {
    emoji: '🌽',
    name: 'Corn',
    accuracy: '98.39%',
    classes: 6,
    images: '5,376',
    arch: 'EfficientNetV2S',
    sources: ['Mendeley Seasonal Corn Leaf Disease (Bangladesh)', 'CCMT Dataset — Raw Data (Kaggle)'],
    note: 'Streak Virus is not included. Leaf Blight and Leaf Spot are grouped as one class.',
    bg: 'bg-yellow-50', border: 'border-yellow-200',
    badge: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-400',
    accent: 'text-yellow-700',
  },
  {
    emoji: '🥔',
    name: 'Potato',
    accuracy: '95.82%',
    classes: 6,
    images: '4,549',
    arch: 'EfficientNetV2S',
    sources: ['Field-based potato leaf disease dataset (Kaggle: srkuhin)', 'PlantVillage potato images (Kaggle: aarishasifkhan)'],
    note: 'Only diseases are detected: pests and nematodes are not included. Bacteria, Fungi and Virus are groups of diseases.',
    bg: 'bg-orange-50', border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-800', dot: 'bg-orange-400',
    accent: 'text-orange-700',
  },
];

const tech = [
  { label: 'Architecture', value: 'EfficientNetB0 + EfficientNetV2S (Transfer Learning)', icon: <Cpu size={16} /> },
  { label: 'Models', value: '6 independent per-crop CNN models', icon: <Zap size={16} /> },
  { label: 'Diseases & Pests', value: '37 diseases and pests across 6 crops (plus a Healthy class for each crop)', icon: <FlaskConical size={16} /> },
  { label: 'Images Used', value: '49,000+ images from public datasets', icon: <Database size={16} /> },
  { label: 'Average Accuracy', value: '96.3% mean validation accuracy across 6 crops', icon: <Shield size={16} /> },
  { label: 'LLM', value: 'Google Gemini 2.5 Flash (bilingual)', icon: <Globe size={16} /> },
  { label: 'Backend', value: 'FastAPI · Python 3.11 · Docker', icon: <Cpu size={16} /> },
  { label: 'Frontend', value: 'React.js 18 · Tailwind CSS · Vercel', icon: <Globe size={16} /> },
];

/* ─── FADE-IN HOOK ───────────────────────────────────────────────────────── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function Section({ title, children, className = '' }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-7 mb-8 transition-all duration-700 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      } ${className}`}
    >
      {title && (
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="w-1 h-5 bg-green-600 rounded-full inline-block" />
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

/* ─── MAIN ───────────────────────────────────────────────────────────────── */
function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">

      {/* HERO */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-5 shadow-lg">
          <Leaf size={32} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">About CropGuard AI</h1>
        <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto leading-relaxed">
          A bilingual (Urdu/English) AI crop disease detection platform —
          6 independently trained models, 37 diseases and pests, 96.3% mean validation accuracy.
        </p>
        <p className="text-green-600 mt-2 text-base">
          پاکستانی کسانوں کے لیے اردو-انگریزی AI زرعی نظام
        </p>
      </div>

      {/* STATS BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { value: '96.3%', label: 'Avg Val. Accuracy', sub: 'اوسط درستگی' },
          { value: '37', label: 'Diseases & Pests', sub: 'بیماریاں اور کیڑے' },
          { value: '6', label: 'Crops Covered', sub: 'فصلیں' },
          { value: '49K+', label: 'Images Used', sub: 'استعمال شدہ تصاویر' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
            <div className="text-3xl font-extrabold text-green-600">{s.value}</div>
            <div className="text-sm font-semibold text-gray-700 mt-1">{s.label}</div>
            <div className="text-xs text-green-500 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* OUR STORY */}
      <Section title="Our Story & Motivation">
        <div className="relative pl-5 border-l-2 border-green-200 space-y-4 text-gray-600 leading-relaxed">
          <p>
            Pakistan's agriculture sector employs over{' '}
            <span className="font-semibold text-gray-800">37% of the labor force</span> and contributes
            23.5% to GDP (Pakistan Economic Survey 2024-25) — yet crop diseases cause heavy yield losses every season.
            Not because cures don't exist, but because diagnosis comes too late and advice arrives
            only in English.
          </p>
          <p>
            We built CropGuard AI to close that gap. Instead of a single model covering all crops,
            we trained{' '}
            <span className="font-semibold text-gray-800">6 independent per-crop CNN models</span> —
            so one crop's model never mixes up another crop's diseases. A farmer selects their crop,
            uploads a leaf photo, and receives a quick AI result with bilingual Urdu and English
            treatment guidance written for Pakistani farmers.
          </p>
          <p>
            Every dataset decision, every model trained, every line of code was built for one person:{' '}
            <span className="font-semibold text-green-700">the farmer standing in his field in Punjab or Sindh</span>,
            holding a smartphone and hoping for answers.
          </p>
        </div>
      </Section>

      {/* TEAM */}
      <Section title="The Team">
        <div className="grid md:grid-cols-2 gap-5">
          {team.map((t, i) => (
            <div key={i} className="rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`${t.highlight ? 'h-2' : 'h-1.5'} w-full bg-gradient-to-r ${t.color}`} />
              <div className="p-6 flex gap-4 items-start">
                <div className={`w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center shadow`}>
                  <span className="text-white text-xl font-bold">{t.initials}</span>
                </div>
                <div>
                  <div className={`font-bold text-base ${t.highlight ? 'text-green-900' : 'text-gray-800'}`}>
                    {t.name}
                  </div>
                  <div className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 inline-block mt-1 mb-2">
                    {t.role}
                  </div>
                  <p className="text-gray-500 text-sm leading-snug">{t.focus}</p>
                  <p className="text-gray-400 text-xs mt-2">The Islamia University of Bahawalpur</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-sm mt-5 text-center">
          Final Year Project · BS Data Science · The Islamia University of Bahawalpur · 2025–2026
        </p>
        <p className="text-gray-500 text-sm mt-1 text-center">
          Supervised by <span className="font-semibold text-gray-700">Dr. Faheem Mushtaq</span>
        </p>
      </Section>

      {/* RESEARCH GAP */}
      <Section title="Research Gap & Our Improvements">
        <div className="space-y-3">
          {gaps.map((g, i) => (
            <div
              key={i}
              className="grid grid-cols-[2.5rem_1fr_auto_1fr] items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <span className="text-2xl text-center">{g.icon}</span>
              <div className="flex items-center gap-2">
                <span className="text-red-500 font-bold">✕</span>
                <span className="text-sm text-red-600 font-medium">{g.gap}</span>
              </div>
              <span className="text-gray-300 font-bold text-sm hidden sm:block">→</span>
              <div className="flex items-center gap-2 sm:col-auto col-span-2 sm:ml-0 ml-10">
                <span className="text-green-600 font-bold">✓</span>
                <span className="text-sm text-green-700 font-medium">{g.improvement}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* TECHNICAL DETAILS */}
      <Section title="Technical Details">
        <div className="grid sm:grid-cols-2 gap-3">
          {tech.map((t, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-green-600 shrink-0">{t.icon}</div>
              <div>
                <div className="text-xs text-green-700 font-bold uppercase tracking-wide">{t.label}</div>
                <div className="text-gray-700 text-sm font-medium mt-0.5">{t.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* DATASETS */}
      <Section title="Datasets — Sources & Curation">
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Each crop's dataset was built from public datasets, and some crops combine several sources.
          Every dataset was scanned for corrupt image files before training. For cotton and sugarcane,
          the sources were also checked for exact duplicate files between sources using MD5 hash comparison.
          PlantVillage (lab-condition) images are used only in the potato model, where they provide all
          the Early Blight images and part of the Late Blight and Healthy images.
        </p>
        <p className="text-gray-500 text-sm mb-5 leading-relaxed">
          Accuracy figures are validation accuracy, measured on splits of these public datasets,
          not on independent photos from Pakistani fields, so real-world performance may be lower.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {crops.map((c, i) => (
            <div key={i} className={`rounded-xl border ${c.border} ${c.bg} p-5 hover:shadow-md transition-shadow`}>
              {/* header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{c.emoji}</span>
                  <div>
                    <div className="font-bold text-gray-800">{c.name}</div>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                        {c.classes} classes
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>
                        {c.images} images
                      </span>
                    </div>
                  </div>
                </div>
                {/* accuracy badge */}
                <div className="text-right shrink-0">
                  <div className={`text-xl font-extrabold ${c.accent}`}>{c.accuracy}</div>
                  <div className="text-xs text-gray-400">val. accuracy</div>
                </div>
              </div>
              {/* architecture */}
              <div className="text-xs text-gray-500 mb-2 font-medium">
                Model: <span className="text-gray-700">{c.arch}</span>
              </div>
              {/* sources */}
              <div className="space-y-1">
                <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1">Data Sources</div>
                {c.sources.map((s, j) => (
                  <div key={j} className="flex items-start gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${c.dot} mt-1.5 shrink-0`} />
                    <span className="text-xs text-gray-600">{s}</span>
                  </div>
                ))}
              </div>
              {c.note && (
                <p className="text-xs text-gray-500 mt-3 leading-snug">{c.note}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* SCOPE & LIMITATIONS */}
      <Section title="Scope & Limitations">
        <ul className="space-y-3 text-sm text-gray-600 leading-relaxed list-disc pl-5">
          <li>
            Accuracy is validation accuracy. The same validation data was also used to choose the best
            training checkpoint, and most crops have no separate test set.
          </li>
          <li>
            The models were trained on public datasets that were not collected in Pakistani fields,
            so photos taken by farmers (different lighting, backgrounds and cameras) may give lower accuracy.
          </li>
          <li>
            Some classes come from a single dataset (for example, all Early Blight images in the potato model),
            so a model can partly learn the style of a dataset instead of only the disease.
          </li>
          <li>
            Only diseases that matter for the app are included. For example, the corn model has no Streak Virus
            and the potato model does not detect pests.
          </li>
        </ul>
        <div className="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-center">
          <p className="text-sm text-yellow-900">
            AI results are a guide, not a final diagnosis. For serious problems, contact your local
            agriculture extension officer.
          </p>
          <p className="text-sm text-yellow-800 mt-1">
            اے آئی کے نتائج رہنمائی کے لیے ہیں، حتمی تشخیص نہیں۔
          </p>
        </div>
      </Section>

    </div>
  );
}

export default About;
