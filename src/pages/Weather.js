import React, { useState, useEffect } from 'react';

// ─── Open-Meteo Geocoding + Forecast — NO API KEY NEEDED ───────────────────

const pakistanCities = [
  'Lahore', 'Karachi', 'Islamabad', 'Faisalabad', 'Multan',
  'Bahawalpur', 'Okara', 'Sahiwal', 'Sargodha', 'Gujranwala',
  'Hyderabad', 'Sukkur', 'Larkana', 'Peshawar', 'Mardan',
  'Quetta', 'Dera Ghazi Khan', 'Rahim Yar Khan', 'Sialkot', 'Nawabshah'
];

// WMO Weather Interpretation Codes → label + urdu + emoji
const WMO = {
  0:  { label: 'Clear sky',            urdu: 'صاف آسمان',           emoji: '☀️',  day: true  },
  1:  { label: 'Mainly clear',         urdu: 'زیادہ تر صاف',        emoji: '🌤️', day: true  },
  2:  { label: 'Partly cloudy',        urdu: 'جزوی طور پر بادل',    emoji: '⛅',  day: true  },
  3:  { label: 'Overcast',             urdu: 'ابر آلود',             emoji: '☁️',  day: false },
  45: { label: 'Foggy',                urdu: 'دھند',                 emoji: '🌫️', day: false },
  48: { label: 'Icy fog',              urdu: 'برفیلی دھند',          emoji: '🌫️', day: false },
  51: { label: 'Light drizzle',        urdu: 'ہلکی پھوار',           emoji: '🌦️', day: false },
  53: { label: 'Drizzle',              urdu: 'پھوار',                emoji: '🌦️', day: false },
  55: { label: 'Heavy drizzle',        urdu: 'تیز پھوار',            emoji: '🌧️', day: false },
  61: { label: 'Slight rain',          urdu: 'ہلکی بارش',            emoji: '🌧️', day: false },
  63: { label: 'Moderate rain',        urdu: 'درمیانی بارش',         emoji: '🌧️', day: false },
  65: { label: 'Heavy rain',           urdu: 'تیز بارش',             emoji: '🌧️', day: false },
  71: { label: 'Slight snowfall',      urdu: 'ہلکی برف باری',        emoji: '🌨️', day: false },
  73: { label: 'Moderate snowfall',    urdu: 'درمیانی برف باری',     emoji: '❄️',  day: false },
  75: { label: 'Heavy snowfall',       urdu: 'شدید برف باری',        emoji: '❄️',  day: false },
  77: { label: 'Snow grains',          urdu: 'برف کے ذرات',          emoji: '🌨️', day: false },
  80: { label: 'Slight showers',       urdu: 'ہلکی بوچھاڑ',         emoji: '🌦️', day: false },
  81: { label: 'Moderate showers',     urdu: 'درمیانی بوچھاڑ',      emoji: '🌧️', day: false },
  82: { label: 'Violent showers',      urdu: 'شدید بوچھاڑ',          emoji: '🌧️', day: false },
  85: { label: 'Snow showers',         urdu: 'برفانی بوچھاڑ',       emoji: '🌨️', day: false },
  86: { label: 'Heavy snow showers',   urdu: 'شدید برفانی بوچھاڑ',  emoji: '❄️',  day: false },
  95: { label: 'Thunderstorm',         urdu: 'گرج چمک',              emoji: '⛈️',  day: false },
  96: { label: 'Thunderstorm w/ hail', urdu: 'ژالہ باری کے ساتھ طوفان', emoji: '⛈️', day: false },
  99: { label: 'Thunderstorm w/ hail', urdu: 'ژالہ باری کے ساتھ طوفان', emoji: '⛈️', day: false },
};

const getWMO = (code, isNight = false) => {
  const w = WMO[code] || { label: 'Unknown', urdu: 'نامعلوم', emoji: '🌤️' };
  if (isNight && w.day) return { ...w, emoji: '🌙' };
  return w;
};

const getWindDir = (deg) => {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
};

const formatHour = (isoStr) => {
  const h = new Date(isoStr).getHours();
  if (h === 0)  return '12 AM';
  if (h === 12) return '12 PM';
  return h > 12 ? `${h - 12} PM` : `${h} AM`;
};

const getDayName = (dateStr, idx) => {
  if (idx === 0) return 'Today';
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
};

// Urdu day names
const getDayNameUrdu = (dateStr, idx) => {
  if (idx === 0) return 'آج';
  const days = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'];
  return days[new Date(dateStr).getDay()];
};

const getUVLabel = (uv) => {
  if (uv >= 11) return 'Extreme';
  if (uv >= 8)  return 'Very High';
  if (uv >= 6)  return 'High';
  if (uv >= 3)  return 'Moderate';
  return 'Low';
};

const getUVLabelUrdu = (uv) => {
  if (uv >= 11) return 'انتہائی زیادہ';
  if (uv >= 8)  return 'بہت زیادہ';
  if (uv >= 6)  return 'زیادہ';
  if (uv >= 3)  return 'درمیانہ';
  return 'کم';
};

// Farming advice engine
const farmingAdvice = (temp, humidity, wmoCode, windKph, uv) => {
  const advice = [];
  const isRain   = [51,53,55,61,63,65,80,81,82].includes(wmoCode);
  const isStorm  = [95,96,99].includes(wmoCode);
  const isSnow   = [71,73,75,77,85,86].includes(wmoCode);
  const isClear  = [0,1].includes(wmoCode);

  if (temp > 42)  advice.push({ en: 'Dangerous heat — use shade nets for sensitive crops', ur: 'خطرناک گرمی — نازک فصلوں کے لیے سایہ دار جال استعمال کریں' });
  else if (temp > 38) advice.push({ en: 'Very hot — irrigate only at dawn or dusk', ur: 'بہت زیادہ گرمی — صرف صبح یا شام کو پانی دیں' });
  if (temp < 0)   advice.push({ en: 'Severe frost — irrigate fields to limit frost damage', ur: 'سخت پالہ — نقصان کم کرنے کے لیے کھیت کو پانی دیں' });
  else if (temp < 5) advice.push({ en: 'Frost risk — cover sensitive crops and seedlings', ur: 'پالے کا خطرہ — نازک فصلوں اور پودوں کو ڈھانپیں' });
  if (humidity > 85) advice.push({ en: 'Very high humidity — apply fungicide, disease risk is high', ur: 'بہت زیادہ نمی — پھپھوندی کش دوا لگائیں، بیماری کا خطرہ زیادہ ہے' });
  else if (humidity > 75) advice.push({ en: 'High humidity — inspect crops for fungal symptoms', ur: 'زیادہ نمی — فصل میں پھپھوندی کی علامات دیکھیں' });
  if (isRain)  advice.push({ en: 'Rain today — postpone fertilizer and pesticide application', ur: 'آج بارش ہے — کھاد اور کیڑے مار دوا کا استعمال ملتوی کریں' });
  if (isStorm) advice.push({ en: 'Thunderstorm — secure equipment and stay indoors', ur: 'آندھی — آلات محفوظ کریں اور گھر کے اندر رہیں' });
  if (isSnow)  advice.push({ en: 'Snow expected — protect crops and drainage channels', ur: 'برف متوقع — فصلوں اور نکاسی نہروں کو محفوظ کریں' });
  if (windKph > 30) advice.push({ en: 'Strong winds — avoid spraying, chemicals will drift', ur: 'تیز ہوا — سپرے نہ کریں، دوا اڑ جائے گی' });
  if (uv >= 8) advice.push({ en: 'Very high UV — avoid open field work between 11am–3pm', ur: 'بہت زیادہ الٹراوائلٹ — صبح 11 سے 3 بجے تک کھلے میں کام نہ کریں' });
  if (isClear && temp >= 15 && temp <= 35 && windKph < 20 && humidity < 75) {
    advice.push({ en: 'Ideal conditions — great day for spraying, harvesting and field work', ur: 'بہترین موسم — سپرے، کٹائی اور کھیت کے کام کے لیے اچھا دن' });
  }
  if (advice.length === 0) advice.push({ en: 'Normal conditions — routine farming can proceed as planned', ur: 'معمول کا موسم — روزانہ کے زرعی کام معمول کے مطابق جاری رکھیں' });
  return advice;
};

// ── Temp bar for 10-day ──────────────────────────────────────────────────────
function TempBar({ low, high, globalLow, globalHigh }) {
  const range = globalHigh - globalLow || 1;
  const left  = ((low  - globalLow) / range) * 100;
  const width = ((high - low)       / range) * 100;
  return (
    <div style={{ flex: 1, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 2, position: 'relative', margin: '0 8px' }}>
      <div style={{ position: 'absolute', left: `${left}%`, width: `${Math.max(width, 6)}%`, height: '100%', background: 'linear-gradient(90deg,#4fc3f7,#ff7043)', borderRadius: 2 }} />
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function Weather() {
  const [query,      setQuery]      = useState('');
  const [suggestions,setSuggestions]= useState([]);
  const [weather,    setWeather]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [activeTab,  setActiveTab]  = useState('today');

  const geocode = async (cityName) => {
    const res  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=5&language=en&format=json`);
    const json = await res.json();
    if (!json.results?.length) throw new Error('City not found / شہر نہیں ملا');
    const pk = json.results.find(r => r.country_code === 'PK') || json.results[0];
    return pk;
  };

  const fetchForecast = async (lat, lon, tz) => {
    const params = [
      `latitude=${lat}`,
      `longitude=${lon}`,
      `timezone=${encodeURIComponent(tz)}`,
      'forecast_days=10',
      'current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,visibility',
      'hourly=temperature_2m,relative_humidity_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_direction_10m,uv_index,visibility,is_day',
      'daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant',
      'wind_speed_unit=kmh',
      'temperature_unit=celsius',
    ].join('&');

    const res  = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    const json = await res.json();
    if (json.error) throw new Error(json.reason || 'Forecast error');
    return json;
  };

  const search = async (cityName) => {
    const target = cityName || query;
    if (!target.trim()) return;
    setLoading(true);
    setError('');
    setWeather(null);
    setSuggestions([]);

    try {
      const geo      = await geocode(target);
      const forecast = await fetchForecast(geo.latitude, geo.longitude, geo.timezone);
      setWeather({ geo, forecast });
      setActiveTab('today');
    } catch (e) {
      setError(e.message || 'City not found. Try another name. / شہر نہیں ملا، دوسرا نام آزمائیں۔');
    } finally {
      setLoading(false);
    }
  };

  // Free, no-key reverse geocoding — turns GPS coordinates into a place name
  const reverseGeocode = async (lat, lon) => {
    try {
      const res  = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const json = await res.json();
      return {
        name:   json.city || json.locality || 'Your Location',
        admin1: json.principalSubdivision || '',
      };
    } catch {
      return { name: 'Your Location', admin1: '' };
    }
  };

  // Load weather directly from GPS coordinates (used for the auto-detected location)
  const loadByCoords = async (lat, lon, name, admin1) => {
    setLoading(true);
    setError('');
    setWeather(null);
    try {
      const forecast = await fetchForecast(lat, lon, 'auto'); // 'auto' → Open-Meteo detects the correct timezone
      const geo = {
        name: name || 'Your Location',
        admin1: admin1 || '',
        latitude: lat,
        longitude: lon,
        timezone: forecast.timezone,
        elevation: forecast.elevation,
      };
      setWeather({ geo, forecast });
      setActiveTab('today');
    } catch (e) {
      setError('Could not load weather for your location. / آپ کے مقام کا موسم لوڈ نہیں ہو سکا۔');
    } finally {
      setLoading(false);
    }
  };

  // On first load: try the browser's GPS location, fall back to Lahore if
  // it's denied, unavailable, or times out. This is what makes the page show
  // real weather immediately instead of an empty "search a city" screen.
  useEffect(() => {
    if (!navigator.geolocation) {
      search('Lahore');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const place = await reverseGeocode(latitude, longitude);
        loadByCoords(latitude, longitude, place.name, place.admin1);
      },
      () => {
        // Permission denied, unavailable, or timed out — fall back to a sensible default.
        search('Lahore');
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = async (val) => {
    setQuery(val);
    if (val.length < 2) { setSuggestions([]); return; }
    try {
      const res  = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(val)}&count=5&language=en&format=json`);
      const json = await res.json();
      const pkFirst = (json.results || []).sort((a, b) => (b.country_code === 'PK') - (a.country_code === 'PK'));
      setSuggestions(pkFirst.slice(0, 5));
    } catch { setSuggestions([]); }
  };

  // ── Derived data ────────────────────────────────────────────────────────────
  const geo      = weather?.geo;
  const fc       = weather?.forecast;
  const cur      = fc?.current;
  const daily    = fc?.daily;
  const hourly   = fc?.hourly;

  const currentHourIndex = cur ? fc.hourly.time.findIndex(t => t === cur.time.slice(0, 13) + ':00') : 0;
  const safeIdx  = currentHourIndex >= 0 ? currentHourIndex : 0;
  const hourlySlice = hourly ? hourly.time.slice(safeIdx, safeIdx + 24) : [];

  const globalLow  = daily ? Math.min(...daily.temperature_2m_min.map(Math.round)) : 0;
  const globalHigh = daily ? Math.max(...daily.temperature_2m_max.map(Math.round)) : 40;

  const advice = cur
    ? farmingAdvice(cur.temperature_2m, cur.relative_humidity_2m, cur.weather_code, cur.wind_speed_10m, cur.uv_index)
    : [];

  const wmo = cur ? getWMO(cur.weather_code, !cur.is_day) : null;

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg,#1a237e 0%,#1565c0 35%,#0277bd 65%,#0288d1 100%)',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: '#fff',
      paddingBottom: 60,
    }}>

      {/* ── Search bar ── */}
      <div style={{ padding: '20px 20px 0', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
            borderRadius: 28, padding: '10px 20px', alignItems: 'center', gap: 10,
            border: '1px solid rgba(255,255,255,0.25)',
          }}>
            <span style={{ fontSize: 20 }}>🔍</span>
            <input
              value={query}
              onChange={e => handleInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
              placeholder="کوئی بھی شہر تلاش کریں... / Search any city in Pakistan..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15 }}
            />
            <button
              onClick={() => search()}
              disabled={loading || !query.trim()}
              style={{
                background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                borderRadius: 20, padding: '6px 18px', color: '#fff', cursor: 'pointer', fontSize: 14,
                opacity: (!query.trim() || loading) ? 0.5 : 1,
              }}
            >
              {loading ? 'لوڈ ہو رہا ہے…' : 'تلاش کریں / Search'}
            </button>
          </div>

          {/* Autocomplete */}
          {suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: '#1565c0', borderRadius: 12, overflow: 'hidden', zIndex: 100,
              border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {suggestions.map((s, i) => (
                <div key={i}
                  onClick={() => { setQuery(s.name); search(s.name); setSuggestions([]); }}
                  style={{
                    padding: '12px 20px', cursor: 'pointer', fontSize: 14,
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  📍 {s.name}{s.admin1 ? `, ${s.admin1}` : ''}, {s.country}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick chips */}
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          {pakistanCities.slice(0, 9).map(c => (
            <button key={c} onClick={() => { setQuery(c); search(c); }}
              style={{
                background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
                borderRadius: 20, padding: '5px 14px', color: '#fff', fontSize: 13, cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && !weather && (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.75 }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>📍</div>
          <p style={{ fontSize: 18, fontWeight: 300 }}>Detecting your location…</p>
          <p style={{ fontSize: 15, marginTop: 6, direction: 'rtl' }}>آپ کا مقام معلوم کیا جا رہا ہے…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ textAlign: 'center', padding: 40, opacity: 0.8 }}>
          <div style={{ fontSize: 48 }}>🔍</div>
          <p style={{ marginTop: 12 }}>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!weather && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '80px 20px', opacity: 0.6 }}>
          <div style={{ fontSize: 80, marginBottom: 20 }}>🌤️</div>
          <p style={{ fontSize: 20, fontWeight: 300 }}>Search for a city to see weather</p>
          <p style={{ fontSize: 16, marginTop: 6, direction: 'rtl' }}>موسم دیکھنے کے لیے شہر تلاش کریں</p>
          <p style={{ fontSize: 14, marginTop: 8, opacity: 0.8, direction: 'rtl' }}>شہر منتخب کریں — موسم اور زرعی مشورے دیکھیں</p>
        </div>
      )}

      {/* ── Main content ── */}
      {weather && cur && (
        <div style={{ maxWidth: 900, margin: '24px auto 0', padding: '0 20px' }}>

          {/* Current weather card */}
          <div style={{
            background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(12px)',
            borderRadius: 20, padding: '28px 32px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 4 }}>
                  📍 {geo.name}{geo.admin1 ? `, ${geo.admin1}` : ''}, Pakistan &nbsp;·&nbsp; {geo.elevation}m بلندی
                </div>
                <div style={{ fontSize: 72, fontWeight: 200, lineHeight: 1, marginBottom: 4 }}>
                  {Math.round(cur.temperature_2m)}°
                </div>
                {/* English + Urdu condition */}
                <div style={{ fontSize: 18, opacity: 0.9, marginBottom: 2 }}>{wmo.label}</div>
                <div style={{ fontSize: 15, opacity: 0.75, direction: 'rtl', marginBottom: 6 }}>{wmo.urdu}</div>
                <div style={{ fontSize: 14, opacity: 0.75 }}>
                  Feels like {Math.round(cur.apparent_temperature)}° &nbsp;·&nbsp;
                  H:{Math.round(daily.temperature_2m_max[0])}° &nbsp;L:{Math.round(daily.temperature_2m_min[0])}°
                </div>
                {/* Urdu feels like */}
                <div style={{ fontSize: 13, opacity: 0.65, direction: 'rtl', marginTop: 2 }}>
                  محسوس ہوتا ہے {Math.round(cur.apparent_temperature)}° &nbsp;·&nbsp;
                  زیادہ: {Math.round(daily.temperature_2m_max[0])}° &nbsp;کم: {Math.round(daily.temperature_2m_min[0])}°
                </div>
                <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>
                  Updated / اپ ڈیٹ: {new Date(cur.time).toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div style={{ fontSize: 100 }}>{wmo.emoji}</div>
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: 12, marginTop: 28, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.15)',
            }}>
              {[
                { icon: '💧', label: 'Humidity',    urdu: 'نمی',             value: `${cur.relative_humidity_2m}%` },
                { icon: '💨', label: 'Wind',        urdu: 'ہوا',             value: `${Math.round(cur.wind_speed_10m)} km/h ${getWindDir(cur.wind_direction_10m)}` },
                { icon: '🌬️', label: 'Gusts',       urdu: 'جھکڑ',            value: `${Math.round(cur.wind_gusts_10m)} km/h` },
                { icon: '🌡️', label: 'Pressure',    urdu: 'دباؤ',            value: `${Math.round(cur.pressure_msl)} mb` },
                { icon: '👁️', label: 'Visibility',  urdu: 'وضاحت',           value: `${(cur.visibility / 1000).toFixed(1)} km` },
                { icon: '🌞', label: 'UV Index',    urdu: 'الٹراوائلٹ',     value: `${cur.uv_index} (${getUVLabel(cur.uv_index)})` },
                { icon: '☁️', label: 'Cloud Cover', urdu: 'بادل',            value: `${cur.cloud_cover}%` },
                { icon: '🌧️', label: 'Precip.',     urdu: 'بارش',            value: `${cur.precipitation} mm` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.55, direction: 'rtl' }}>{s.urdu}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginTop: 2 }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 4 }}>
            {[
              { id: 'today',   label: 'Today',      urdu: 'آج'          },
              { id: 'hourly',  label: 'Hourly',     urdu: 'گھنٹہ وار'   },
              { id: 'tenday',  label: '10-Day',     urdu: '۱۰ دن'       },
              { id: 'farming', label: '🌾 Farming', urdu: 'کھیتی'       },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                flex: 1, padding: '8px 8px 6px', border: 'none', borderRadius: 10, cursor: 'pointer',
                background: activeTab === tab.id ? 'rgba(255,255,255,0.25)' : 'transparent',
                color: '#fff', transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400 }}>{tab.label}</div>
                <div style={{ fontSize: 11, opacity: 0.65, direction: 'rtl' }}>{tab.urdu}</div>
              </button>
            ))}
          </div>

          {/* ── TODAY TAB ── */}
          {activeTab === 'today' && daily && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Sunrise / Sunset / etc */}
              <div style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 24px',
                border: '1px solid rgba(255,255,255,0.15)',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 20,
              }}>
                {[
                  { icon: '🌅', label: 'Sunrise',      urdu: 'طلوع آفتاب',   value: new Date(daily.sunrise[0]).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'}) },
                  { icon: '🌇', label: 'Sunset',       urdu: 'غروب آفتاب',   value: new Date(daily.sunset[0]).toLocaleTimeString('en-PK',{hour:'2-digit',minute:'2-digit'}) },
                  { icon: '🌧️', label: 'Rain Chance',  urdu: 'بارش کا امکان', value: `${daily.precipitation_probability_max[0]}%` },
                  { icon: '🌂', label: 'Total Rain',   urdu: 'کل بارش',       value: `${daily.precipitation_sum[0]} mm` },
                  { icon: '💨', label: 'Max Wind',     urdu: 'زیادہ ہوا',     value: `${Math.round(daily.wind_speed_10m_max[0])} km/h` },
                  { icon: '🌬️', label: 'Max Gusts',    urdu: 'زیادہ جھکڑ',   value: `${Math.round(daily.wind_gusts_10m_max[0])} km/h` },
                  { icon: '🌞', label: 'Max UV',       urdu: 'زیادہ الٹراوائلٹ', value: `${daily.uv_index_max[0]} (${getUVLabel(daily.uv_index_max[0])})` },
                  { icon: '🌡️', label: 'Feels Like H', urdu: 'زیادہ محسوس',   value: `${Math.round(daily.apparent_temperature_max[0])}°C` },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <div>
                      <div style={{ fontSize: 11, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.55, direction: 'rtl' }}>{s.urdu}</div>
                      <div style={{ fontSize: 15, fontWeight: 500, marginTop: 2 }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hourly strip for today */}
              <div style={{
                background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '16px 20px',
                border: '1px solid rgba(255,255,255,0.15)', overflowX: 'auto',
              }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>Hourly Overview</div>
                <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 12, direction: 'rtl' }}>گھنٹہ وار جائزہ</div>
                <div style={{ display: 'flex', gap: 4, minWidth: 'max-content' }}>
                  {hourlySlice.map((t, i) => {
                    const idx = safeIdx + i;
                    const code = hourly.weather_code[idx];
                    const isNight = !hourly.is_day[idx];
                    const rain = hourly.precipitation_probability[idx];
                    return (
                      <div key={i} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center',
                        padding: '8px 10px', borderRadius: 10, minWidth: 56,
                        background: i === 0 ? 'rgba(255,255,255,0.2)' : 'transparent',
                      }}>
                        <div style={{ fontSize: 11, opacity: 0.75 }}>{i === 0 ? 'ابھی' : formatHour(t)}</div>
                        <div style={{ fontSize: 20, margin: '6px 0' }}>{getWMO(code, isNight).emoji}</div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{Math.round(hourly.temperature_2m[idx])}°</div>
                        {rain > 10 && <div style={{ fontSize: 10, color: '#4fc3f7', marginTop: 2 }}>{rain}%</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── HOURLY TAB ── */}
          {activeTab === 'hourly' && hourly && (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>24-Hour Forecast</div>
                <div style={{ fontSize: 12, opacity: 0.55, direction: 'rtl', marginTop: 2 }}>۲۴ گھنٹے کی پیشگوئی</div>
              </div>
              {hourlySlice.map((t, i) => {
                const idx  = safeIdx + i;
                const code = hourly.weather_code[idx];
                const w    = getWMO(code, !hourly.is_day[idx]);
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', padding: '13px 24px', gap: 12, flexWrap: 'wrap',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    background: i === 0 ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}>
                    <div style={{ minWidth: 55, fontSize: 14, fontWeight: i === 0 ? 600 : 400 }}>
                      {i === 0 ? 'ابھی' : formatHour(t)}
                    </div>
                    <div style={{ fontSize: 22, width: 36, textAlign: 'center' }}>{w.emoji}</div>
                    <div style={{ minWidth: 120 }}>
                      <div style={{ fontSize: 13 }}>{w.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.6, direction: 'rtl' }}>{w.urdu}</div>
                    </div>
                    <div style={{ minWidth: 44, fontSize: 18, fontWeight: 600 }}>{Math.round(hourly.temperature_2m[idx])}°</div>
                    <div style={{ flex: 1, display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, opacity: 0.8 }}>
                      <span>💧 {hourly.relative_humidity_2m[idx]}%</span>
                      <span>💨 {Math.round(hourly.wind_speed_10m[idx])} km/h {getWindDir(hourly.wind_direction_10m[idx])}</span>
                      <span>👁️ {(hourly.visibility[idx]/1000).toFixed(1)} km</span>
                      {hourly.precipitation_probability[idx] > 0 && (
                        <span style={{ color: '#4fc3f7' }}>🌧️ {hourly.precipitation_probability[idx]}%</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, opacity: 0.65 }}>UV {hourly.uv_index[idx]}</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── 10-DAY TAB ── */}
          {activeTab === 'tenday' && daily && (
            <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>10-Day Forecast</div>
                <div style={{ fontSize: 12, opacity: 0.55, direction: 'rtl', marginTop: 2 }}>۱۰ دن کی پیشگوئی</div>
              </div>
              {daily.time.map((date, i) => {
                const w    = getWMO(daily.weather_code[i]);
                const low  = Math.round(daily.temperature_2m_min[i]);
                const high = Math.round(daily.temperature_2m_max[i]);
                const rain = daily.precipitation_probability_max[i];
                return (
                  <div key={i} style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.07)',
                    background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
                  }}>
                    {/* TOP ROW: Day name | emoji+condition | H°/L° */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

                      {/* Day name */}
                      <div style={{ minWidth: 72, flexShrink: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 500 }}>{getDayName(date, i)}</div>
                        <div style={{ fontSize: 11, opacity: 0.6, direction: 'rtl' }}>{getDayNameUrdu(date, i)}</div>
                      </div>

                      {/* Emoji */}
                      <span style={{ fontSize: 26, flexShrink: 0 }}>{w.emoji}</span>

                      {/* Condition — grows to fill space */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, opacity: 0.9, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{w.label}</div>
                        <div style={{ fontSize: 11, opacity: 0.55, direction: 'rtl' }}>{w.urdu}</div>
                      </div>

                      {/* H / L temps — always visible, right-aligned */}
                      <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <span style={{ fontSize: 15, fontWeight: 700 }}>{high}°</span>
                        <span style={{ fontSize: 13, opacity: 0.55, marginLeft: 4 }}>{low}°</span>
                      </div>
                    </div>

                    {/* BOTTOM ROW: temp bar + rain */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, paddingLeft: 82 }}>
                      {/* Temp gradient bar */}
                      <div style={{ flex: 1 }}>
                        <TempBar low={low} high={high} globalLow={globalLow} globalHigh={globalHigh} />
                      </div>
                      {/* Rain chance */}
                      <div style={{ flexShrink: 0, fontSize: 12, color: '#4fc3f7', minWidth: 36, textAlign: 'right' }}>
                        🌧️ {rain}%
                      </div>
                      {/* Wind */}
                      <div style={{ flexShrink: 0, fontSize: 11, opacity: 0.55, minWidth: 52, textAlign: 'right' }}>
                        💨 {Math.round(daily.wind_speed_10m_max[i])}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── FARMING TAB ── */}
          {activeTab === 'farming' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Today's advice */}
              <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.15)' }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>🌾 Today's Farming Advice</div>
                  <div style={{ fontSize: 13, opacity: 0.65, direction: 'rtl', marginTop: 4 }}>آج کے زرعی مشورے</div>
                </div>
                {advice.map((a, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '14px 18px',
                    borderLeft: '3px solid rgba(129,199,132,0.8)', marginBottom: 10,
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 6 }}>🇬🇧 {a.en}</div>
                    <div style={{ fontSize: 14, opacity: 0.85, direction: 'rtl', textAlign: 'right' }}>🇵🇰 {a.ur}</div>
                  </div>
                ))}
              </div>

              {/* 10-day farming outlook */}
              {daily && (
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(255,255,255,0.15)' }}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: 1 }}>10-Day Farming Outlook</div>
                    <div style={{ fontSize: 13, opacity: 0.65, direction: 'rtl', marginTop: 4 }}>۱۰ دن کا زرعی جائزہ</div>
                  </div>
                  {daily.time.map((date, i) => {
                    const dayAdvice = farmingAdvice(
                      (daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2,
                      cur.relative_humidity_2m,
                      daily.weather_code[i],
                      daily.wind_speed_10m_max[i],
                      daily.uv_index_max[i]
                    );
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14, paddingBottom: 14, marginBottom: 14,
                        borderBottom: i < daily.time.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      }}>
                        <div style={{ minWidth: 80, fontSize: 13 }}>
                          <div style={{ fontWeight: 600 }}>{getDayName(date, i)}</div>
                          <div style={{ opacity: 0.65, fontSize: 12, direction: 'rtl' }}>{getDayNameUrdu(date, i)}</div>
                          <div style={{ opacity: 0.45, fontSize: 11 }}>{date.slice(5)}</div>
                        </div>
                        <div style={{ fontSize: 22 }}>{getWMO(daily.weather_code[i]).emoji}</div>
                        <div style={{ flex: 1 }}>
                          {dayAdvice.map((a, j) => (
                            <div key={j} style={{ marginBottom: 6 }}>
                              <div style={{ fontSize: 13, opacity: 0.9 }}>• {a.en}</div>
                              <div style={{ fontSize: 12, opacity: 0.7, direction: 'rtl', textAlign: 'right', marginTop: 2 }}>• {a.ur}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attribution note */}
              <div style={{
                background: 'rgba(255,255,255,0.08)', borderRadius: 12, padding: '14px 18px',
                fontSize: 12, opacity: 0.75, border: '1px solid rgba(255,255,255,0.1)',
              }}>
                ℹ️ Weather data powered by{' '}
                <a href="https://open-meteo.com" target="_blank" rel="noreferrer" style={{ color: '#90caf9' }}>Open-Meteo.com</a>
                {' '}(CC BY 4.0) — ECMWF, NOAA GFS, JMA models. Updated every hour.
                For official Pakistan forecasts visit{' '}
                <a href="https://pmd.gov.pk" target="_blank" rel="noreferrer" style={{ color: '#90caf9' }}>pmd.gov.pk</a>
                <br /><br />
                <span style={{ direction: 'rtl', display: 'block', textAlign: 'right' }}>
                  موسم کی معلومات اوپن میٹیو سے لی گئی ہے جو ECMWF اور NOAA کے ڈیٹا پر مبنی ہے۔ سرکاری موسمیاتی معلومات کے لیے پاکستان محکمہ موسمیات کی ویب سائٹ دیکھیں۔
                </span>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
