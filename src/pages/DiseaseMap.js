import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { MapPin, AlertTriangle, RefreshCw, Send, X, ChevronDown } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Constants ────────────────────────────────────────────────────────────────

const diseaseColors = {
  Wheat:     '#f59e0b',
  Rice:      '#10b981',
  Cotton:    '#8b5cf6',
  Sugarcane: '#06b6d4',
  Corn:      '#f97316',
  Potato:    '#6b7280',
};

const crops = [
  { en: 'Wheat',     ur: 'گندم'    },
  { en: 'Rice',      ur: 'چاول'   },
  { en: 'Cotton',    ur: 'کپاس'   },
  { en: 'Sugarcane', ur: 'گنا'     },
  { en: 'Corn',      ur: 'مکئی'   },
  { en: 'Potato',    ur: 'آلو'    },
];

const severityLevels = [
  { en: 'Mild',     ur: 'ہلکا',     color: '#f59e0b' },
  { en: 'Moderate', ur: 'درمیانہ',  color: '#f97316' },
  { en: 'Severe',   ur: 'شدید',     color: '#ef4444' },
];

const pakistanCities = [
  { name: 'Lahore',         lat: 31.5204, lng: 74.3587 },
  { name: 'Faisalabad',     lat: 31.4180, lng: 73.0790 },
  { name: 'Multan',         lat: 30.1575, lng: 71.5249 },
  { name: 'Bahawalpur',     lat: 29.3956, lng: 71.6836 },
  { name: 'Okara',          lat: 30.8138, lng: 73.4534 },
  { name: 'Hyderabad',      lat: 25.3960, lng: 68.3578 },
  { name: 'Sukkur',         lat: 27.7052, lng: 68.8574 },
  { name: 'Peshawar',       lat: 34.0151, lng: 71.5249 },
  { name: 'Quetta',         lat: 30.1798, lng: 66.9750 },
  { name: 'Islamabad',      lat: 33.6844, lng: 73.0479 },
  { name: 'Gujranwala',     lat: 32.1877, lng: 74.1945 },
  { name: 'Sahiwal',        lat: 30.6706, lng: 73.1064 },
  { name: 'Sargodha',       lat: 32.0836, lng: 72.6711 },
  { name: 'Nawabshah',      lat: 26.2442, lng: 68.4101 },
  { name: 'Mardan',         lat: 34.1986, lng: 72.0404 },
  { name: 'Dera Ghazi Khan',lat: 30.0489, lng: 70.6323 },
  { name: 'Rahim Yar Khan', lat: 28.4212, lng: 70.2957 },
  { name: 'Sialkot',        lat: 32.4945, lng: 74.5229 },
];

// Disease-specific actionable advice
const diseaseAdvice = {
  'yellow rust':        { en: 'Apply fungicide (Propiconazole) immediately. Remove infected leaves.', ur: 'فوری طور پر پھپھوندی کش دوا لگائیں۔ متاثرہ پتے ہٹا دیں۔' },
  'late blight':        { en: 'Spray Mancozeb or Copper fungicide. Avoid overhead irrigation.', ur: 'مینکوزیب یا تانبے کی دوا چھڑکیں۔ اوپر سے پانی دینے سے گریز کریں۔' },
  'bacterial blight':   { en: 'Use copper-based bactericide. Avoid working in wet fields.', ur: 'تانبے پر مبنی دوا استعمال کریں۔ گیلے کھیت میں کام نہ کریں۔' },
  'leaf curl':          { en: 'Control whitefly with imidacloprid. Remove and burn infected plants.', ur: 'سفید مکھی کو کنٹرول کریں۔ متاثرہ پودے جلا دیں۔' },
  'stem borer':         { en: 'Apply Chlorpyrifos at base of stems. Set pheromone traps.', ur: 'تنے کی جڑ میں دوا لگائیں۔ فیرومون پھندے لگائیں۔' },
  'default':            { en: 'Isolate affected area. Consult your local agricultural extension officer.', ur: 'متاثرہ علاقہ الگ کریں۔ زرعی افسر سے رابطہ کریں۔' },
};

const getAdvice = (diseaseName) => {
  if (!diseaseName) return diseaseAdvice.default;
  const key = diseaseName.toLowerCase();
  for (const [k, v] of Object.entries(diseaseAdvice)) {
    if (key.includes(k)) return v;
  }
  return diseaseAdvice.default;
};

// ── Proximity-based outbreak detection (reports within ~100km) ───────────────
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const detectOutbreaks = (reports) => {
  const outbreaks = [];
  const used = new Set();

  reports.forEach((r, i) => {
    if (used.has(i)) return;
    const cluster = [r];
    const clusterIdxs = [i];

    reports.forEach((r2, j) => {
      if (i === j || used.has(j)) return;
      if (r.crop === r2.crop && r.disease?.toLowerCase() === r2.disease?.toLowerCase()) {
        const dist = haversineKm(r.latitude, r.longitude, r2.latitude, r2.longitude);
        if (dist <= 100) {
          cluster.push(r2);
          clusterIdxs.push(j);
        }
      }
    });

    if (cluster.length >= 2) {
      clusterIdxs.forEach(idx => used.add(idx));
      outbreaks.push({
        crop: r.crop,
        disease: r.disease,
        reports: cluster,
        advice: getAdvice(r.disease),
      });
    }
  });
  return outbreaks;
};

// ── Severity badge ───────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const s = severityLevels.find(l => l.en === severity) || severityLevels[0];
  return (
    <span style={{
      background: s.color + '22', color: s.color,
      border: `1px solid ${s.color}55`,
      borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 600,
    }}>
      {s.en} / {s.ur}
    </span>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
function DiseaseMap() {
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,   setShowForm]   = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [form, setForm] = useState({
    crop: 'Wheat',
    disease: '',
    location_name: '',
    latitude: '',
    longitude: '',
    severity: 'Moderate',
  });

  const [locationQuery, setLocationQuery]   = useState('');
  const [locationResults, setLocationResults] = useState([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/reports`);
      setReports(res.data.reports || []);
    } catch {
      console.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  // ── Live village/town/city search via OpenStreetMap Nominatim ──────────────
  useEffect(() => {
    if (locationQuery.trim().length < 3) {
      setLocationResults([]);
      return;
    }
    setSearchingLocation(true);
    const t = setTimeout(async () => {
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            format: 'json',
            countrycodes: 'pk',
            q: locationQuery,
            limit: 8,
            addressdetails: 1,
          },
        });
        setLocationResults(res.data || []);
      } catch {
        setLocationResults([]);
      } finally {
        setSearchingLocation(false);
      }
    }, 500);
    return () => clearTimeout(t);
  }, [locationQuery]);

  const selectLocation = (place) => {
    setForm(p => ({
      ...p,
      location_name: place.display_name,
      latitude: parseFloat(place.lat),
      longitude: parseFloat(place.lon),
    }));
    setLocationQuery(place.display_name);
    setShowResults(false);
    setLocationResults([]);
  };

  const submitReport = async () => {
    if (!form.disease || !form.latitude || !form.longitude) return;
    setSubmitting(true);
    try {
      await axios.post(`${API_URL}/report`, {
        crop: form.crop,
        disease: form.disease,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        location_name: form.location_name,
        severity: form.severity,
      });
      setSubmitted(true);
      setShowForm(false);
      setForm({ crop: 'Wheat', disease: '', location_name: '', latitude: '', longitude: '', severity: 'Moderate' });
      setLocationQuery('');
      setLocationResults([]);
      setTimeout(() => setSubmitted(false), 4000);
      fetchReports();
    } catch {
      alert('رپورٹ جمع نہیں ہو سکی۔ دوبارہ کوشش کریں۔\nFailed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const outbreaks = detectOutbreaks(reports);
  const cropUrdu = Object.fromEntries(crops.map(c => [c.en, c.ur]));

  // ── Styles ──────────────────────────────────────────────────────────────────
  const cardStyle = {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #e5e7eb',
    borderRadius: 10,
    padding: '9px 13px',
    fontSize: 14,
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    background: '#fafafa',
  };

  return (
    <div style={{ background: '#f0fdf4', minHeight: '100vh', fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 20px 60px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
            marginBottom: 16,
          }}>
            <MapPin size={30} color="#fff" />
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#14532d', margin: 0 }}>
            Disease Warning Map
          </h1>
          <p style={{ color: '#6b7280', marginTop: 6, fontSize: 15 }}>
            Real-time crop disease outbreak tracking across Pakistan
          </p>
          <p style={{ color: '#16a34a', marginTop: 4, fontSize: 14, direction: 'rtl' }}>
            پاکستان میں فصلوں کی بیماریوں کی نگرانی — براہِ کرم اپنے علاقے کی رپورٹ کریں
          </p>
        </div>

        {/* ── Outbreak Alerts ── */}
        {outbreaks.length > 0 && (
          <div style={{
            background: '#fff1f2', border: '1.5px solid #fecaca',
            borderRadius: 16, padding: '20px 24px', marginBottom: 24,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <AlertTriangle size={20} color="#dc2626" />
              <span style={{ fontWeight: 700, color: '#dc2626', fontSize: 15 }}>
                Active Outbreak Alerts! / فعال وبائی انتباہات
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {outbreaks.map((o, i) => {
                const advice = o.advice;
                return (
                  <div key={i} style={{
                    background: '#fff', borderRadius: 12, padding: '14px 16px',
                    borderLeft: '4px solid #ef4444',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{
                        width: 8, height: 8, borderRadius: '50%', background: '#ef4444',
                        display: 'inline-block', animation: 'pulse 1.5s infinite',
                      }} />
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: 14 }}>
                        {o.crop} ({cropUrdu[o.crop]}) — {o.disease}
                      </span>
                      <span style={{
                        background: '#fee2e2', color: '#dc2626',
                        borderRadius: 6, padding: '1px 8px', fontSize: 11, fontWeight: 600,
                      }}>
                        {o.reports.length} locations
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>
                      📍 {o.reports.map(r => r.location_name || 'Unknown').join(' · ')}
                    </div>
                    {/* Actionable advice */}
                    <div style={{
                      background: '#fef9c3', borderRadius: 8, padding: '8px 12px',
                      fontSize: 12, color: '#713f12',
                    }}>
                      <div>⚠️ <strong>Action:</strong> {advice.en}</div>
                      <div style={{ direction: 'rtl', textAlign: 'right', marginTop: 4, color: '#92400e' }}>
                        ⚠️ <strong>اقدام:</strong> {advice.ur}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Stats + Actions bar ── */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 20, gap: 12,
        }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { val: reports.length,    label: 'Total Reports', ur: 'کل رپورٹس',   color: '#16a34a' },
              { val: outbreaks.length,  label: 'Outbreaks',     ur: 'وبائی علاقے', color: '#dc2626' },
            ].map(s => (
              <div key={s.label} style={{
                ...cardStyle, padding: '10px 20px', textAlign: 'center', minWidth: 90,
              }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
                <div style={{ fontSize: 11, color: '#6b7280' }}>{s.label}</div>
                <div style={{ fontSize: 11, color: '#9ca3af', direction: 'rtl' }}>{s.ur}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={fetchReports}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: '#fff', border: '1.5px solid #e5e7eb',
                borderRadius: 10, padding: '9px 16px', fontSize: 13,
                cursor: 'pointer', color: '#374151', fontWeight: 500,
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#16a34a'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#e5e7eb'}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh / تازہ کریں
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none', borderRadius: 10, padding: '10px 20px',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(22,163,74,0.35)',
              }}
            >
              {showForm ? <X size={15} /> : <Send size={15} />}
              {showForm ? 'بند کریں / Close' : '🌿 بیماری رپورٹ کریں / Report Disease'}
            </button>
          </div>
        </div>

        {/* ── Success banner ── */}
        {submitted && (
          <div style={{
            background: '#f0fdf4', border: '1.5px solid #86efac',
            borderRadius: 12, padding: '12px 18px', marginBottom: 16,
            fontSize: 14, color: '#15803d', fontWeight: 500,
          }}>
            ✅ Report submitted! Thank you for helping other farmers. &nbsp;|&nbsp;
            <span style={{ direction: 'rtl' }}>رپورٹ جمع ہو گئی! دوسرے کسانوں کی مدد کا شکریہ۔</span>
          </div>
        )}

        {/* ── Report Form ── */}
        {showForm && (
          <div style={{ ...cardStyle, padding: '24px 28px', marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#14532d', marginBottom: 4 }}>
              Report a Disease in Your Area
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20, direction: 'rtl' }}>
              اپنے علاقے میں فصل کی بیماری رپورٹ کریں — یہ معلومات دوسرے کسانوں کی مدد کرے گی
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

              {/* Crop */}
              <div>
                <label style={labelStyle}>Crop / فصل</label>
                <select
                  value={form.crop}
                  onChange={e => setForm(p => ({ ...p, crop: e.target.value }))}
                  style={inputStyle}
                >
                  {crops.map(c => (
                    <option key={c.en} value={c.en}>{c.en} — {c.ur}</option>
                  ))}
                </select>
              </div>

              {/* Disease */}
              <div>
                <label style={labelStyle}>Disease / بیماری کا نام</label>
                <input
                  type="text"
                  value={form.disease}
                  onChange={e => setForm(p => ({ ...p, disease: e.target.value }))}
                  placeholder="e.g. Yellow Rust / پیلا زنگ"
                  style={inputStyle}
                />
              </div>

              {/* Location search */}
              <div style={{ position: 'relative', gridColumn: 'span 2' }}>
                <label style={labelStyle}>Village / Town / City / گاؤں یا شہر تلاش کریں</label>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={e => {
                    setLocationQuery(e.target.value);
                    setShowResults(true);
                    if (form.latitude) {
                      setForm(p => ({ ...p, latitude: '', longitude: '', location_name: '' }));
                    }
                  }}
                  onFocus={() => { if (locationResults.length) setShowResults(true); }}
                  onBlur={() => setTimeout(() => setShowResults(false), 150)}
                  placeholder="Start typing e.g. Chak 45, Okara / لکھنا شروع کریں"
                  style={inputStyle}
                  autoComplete="off"
                />
                {searchingLocation && (
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    تلاش ہو رہی ہے… Searching…
                  </div>
                )}
                {showResults && locationResults.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
                    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
                    marginTop: 4, maxHeight: 220, overflowY: 'auto',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  }}>
                    {locationResults.map((place, idx) => (
                      <div
                        key={idx}
                        onMouseDown={() => selectLocation(place)}
                        style={{
                          padding: '9px 13px', fontSize: 13, cursor: 'pointer',
                          borderBottom: idx < locationResults.length - 1 ? '1px solid #f3f4f6' : 'none',
                          color: '#374151',
                        }}
                      >
                        📍 {place.display_name}
                      </div>
                    ))}
                  </div>
                )}
                {form.latitude && form.location_name && (
                  <div style={{ fontSize: 11, color: '#16a34a', marginTop: 4, fontWeight: 600 }}>
                    ✓ منتخب / Selected: {form.location_name}
                  </div>
                )}
              </div>

              {/* Severity */}
              <div>
                <label style={labelStyle}>Severity / شدت</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {severityLevels.map(s => (
                    <button
                      key={s.en}
                      onClick={() => setForm(p => ({ ...p, severity: s.en }))}
                      style={{
                        flex: 1, padding: '8px 4px', borderRadius: 8, fontSize: 12,
                        fontWeight: form.severity === s.en ? 700 : 400,
                        border: `1.5px solid ${form.severity === s.en ? s.color : '#e5e7eb'}`,
                        background: form.severity === s.en ? s.color + '18' : '#fff',
                        color: form.severity === s.en ? s.color : '#6b7280',
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}
                    >
                      <div>{s.en}</div>
                      <div style={{ fontSize: 10, direction: 'rtl' }}>{s.ur}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', gap: 10 }}>
              <button
                onClick={submitReport}
                disabled={submitting || !form.disease || !form.latitude}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  border: 'none', borderRadius: 10, padding: '10px 24px',
                  color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  opacity: (submitting || !form.disease || !form.latitude) ? 0.5 : 1,
                }}
              >
                <Send size={15} />
                {submitting ? 'جمع ہو رہا ہے…' : 'جمع کریں / Submit Report'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  border: '1.5px solid #e5e7eb', background: '#fff',
                  borderRadius: 10, padding: '10px 20px', fontSize: 14,
                  color: '#6b7280', cursor: 'pointer',
                }}
              >
                Cancel / منسوخ
              </button>
            </div>
          </div>
        )}

        {/* ── Map ── */}
        <div style={{
          borderRadius: 18, overflow: 'hidden',
          border: '1.5px solid #d1fae5',
          boxShadow: '0 4px 20px rgba(22,163,74,0.12)',
          marginBottom: 24, height: 680,
          maxWidth: 720, margin: '0 auto 24px',
        }}>
          <MapContainer
            center={[30.3753, 69.3451]}
            zoom={6}
            minZoom={5}
            maxZoom={12}
            maxBounds={[[20.0, 57.0], [39.0, 80.0]]}
            maxBoundsViscosity={0.8}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap contributors'
            />
            {reports.map((r, i) => {
              const sev = severityLevels.find(s => s.en === r.severity) || severityLevels[1];
              const color = diseaseColors[r.crop] || '#ef4444';
              const advice = getAdvice(r.disease);
              const cropUr = cropUrdu[r.crop] || r.crop;
              return (
                <React.Fragment key={i}>
                  <Marker position={[r.latitude, r.longitude]}>
                    <Popup>
                      <div style={{ fontFamily: 'Segoe UI, sans-serif', minWidth: 180 }}>
                        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                          {r.crop} ({cropUr}) — {r.disease}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: 12, marginBottom: 4 }}>
                          📍 {r.location_name || 'نامعلوم مقام / Unknown'}
                        </div>
                        {r.severity && (
                          <div style={{ marginBottom: 6 }}>
                            <SeverityBadge severity={r.severity} />
                          </div>
                        )}
                        <div style={{
                          background: '#fef9c3', borderRadius: 6, padding: '6px 8px',
                          fontSize: 11, color: '#713f12', marginBottom: 4,
                        }}>
                          ⚠️ {advice.en}
                        </div>
                        <div style={{
                          background: '#fef9c3', borderRadius: 6, padding: '6px 8px',
                          fontSize: 11, color: '#92400e', direction: 'rtl', textAlign: 'right',
                        }}>
                          ⚠️ {advice.ur}
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>
                          {new Date(r.timestamp).toLocaleDateString('ur-PK')}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                  <Circle
                    center={[r.latitude, r.longitude]}
                    radius={r.severity === 'Severe' ? 25000 : r.severity === 'Moderate' ? 18000 : 12000}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: r.severity === 'Severe' ? 0.22 : 0.13,
                      weight: r.severity === 'Severe' ? 2 : 1.5,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* ── Legend ── */}
        <div style={{ ...cardStyle, padding: '16px 20px', marginBottom: 24 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Crop / فصل
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {crops.map(c => (
                  <div key={c.en} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: diseaseColors[c.en] }} />
                    <span style={{ color: '#374151' }}>{c.en}</span>
                    <span style={{ color: '#9ca3af', fontSize: 11 }}>{c.ur}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid #e5e7eb', paddingLeft: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                Severity / شدت
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {severityLevels.map(s => (
                  <div key={s.en} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color }} />
                    <span style={{ color: '#374151' }}>{s.en}</span>
                    <span style={{ color: '#9ca3af', fontSize: 11, direction: 'rtl' }}>{s.ur}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Recent Reports ── */}
        {reports.length > 0 && (
          <div style={{ ...cardStyle, padding: '20px 24px' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#14532d', marginBottom: 4 }}>
              Recent Reports
            </h3>
            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16, direction: 'rtl' }}>
              حالیہ رپورٹس
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...reports].reverse().slice(0, 10).map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 14px', background: '#f9fafb',
                  borderRadius: 10, fontSize: 13,
                  borderLeft: `3px solid ${diseaseColors[r.crop] || '#ef4444'}`,
                }}>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#111827' }}>
                      {r.crop} ({cropUrdu[r.crop]})
                    </span>
                    <span style={{ color: '#6b7280', margin: '0 6px' }}>—</span>
                    <span style={{ color: '#374151' }}>{r.disease}</span>
                  </div>
                  <div style={{ color: '#9ca3af', fontSize: 12 }}>
                    📍 {r.location_name || 'نامعلوم'}
                  </div>
                  {r.severity && <SeverityBadge severity={r.severity} />}
                  <div style={{ color: '#9ca3af', fontSize: 11, minWidth: 70, textAlign: 'right' }}>
                    {new Date(r.timestamp).toLocaleDateString('en-PK')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {reports.length === 0 && !loading && (
          <div style={{
            ...cardStyle, textAlign: 'center', padding: '48px 24px',
          }}>
            <MapPin size={44} color="#d1d5db" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#6b7280', fontSize: 15, fontWeight: 500 }}>
              No disease reports yet.
            </p>
            <p style={{ color: '#9ca3af', fontSize: 13, marginTop: 4 }}>
              Be the first to report a disease in your area!
            </p>
            <p style={{ color: '#16a34a', fontSize: 13, marginTop: 6, direction: 'rtl' }}>
              اپنے علاقے میں بیماری رپورٹ کرنے والے پہلے شخص بنیں!
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                marginTop: 20,
                background: 'linear-gradient(135deg, #16a34a, #15803d)',
                border: 'none', borderRadius: 10, padding: '10px 24px',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}
            >
              🌿 رپورٹ کریں / Report Now
            </button>
          </div>
        )}

      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

export default DiseaseMap;
