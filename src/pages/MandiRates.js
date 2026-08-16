import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { TrendingUp, RefreshCw, MapPin } from 'lucide-react';
import { API_URL } from '../config';

const CROP_EMOJI = {
  Wheat: '🌾', Rice: '🌱', Cotton: '☁️', Sugarcane: '🎋', Corn: '🌽',
  Potato: '🥔', Sunflower: '🌻', Canola: '🌼', Gram: '🫘', Barley: '🌾',
  Millet: '🌾', Sorghum: '🌾', Groundnut: '🥜', Onion: '🧅',
};

export default function MandiRates() {
  const [data, setData] = useState({ last_updated: '', rates: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [cropFilter, setCropFilter] = useState('All');

  const fetchRates = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/mandi-rates`);
      setData(res.data && res.data.rates ? res.data : { last_updated: '', rates: [] });
    } catch {
      setError('Could not load mandi rates from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRates(); }, []);

  const crops = useMemo(() => {
    const set = new Set(data.rates.map(r => r.crop));
    return ['All', ...Array.from(set)];
  }, [data.rates]);

  const filtered = cropFilter === 'All' ? data.rates : data.rates.filter(r => r.crop === cropFilter);

  // Group by crop for card display
  const grouped = useMemo(() => {
    const g = {};
    filtered.forEach(r => {
      if (!g[r.crop]) g[r.crop] = { urdu: r.urdu, rows: [] };
      g[r.crop].rows.push(r);
    });
    return g;
  }, [filtered]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-8 px-6 py-10 text-center"
           style={{ background: 'linear-gradient(160deg, #14532D 0%, #166534 50%, #15803D 100%)' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
             style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <TrendingUp size={26} color="#fff" />
        </div>
        <h1 className="text-3xl font-bold text-white">Daily Mandi Rates</h1>
        <p className="text-white/80 mt-2">Wholesale crop prices across Pakistani markets</p>
        <p className="mt-1" style={{ color: '#86EFAC' }}>پاکستانی منڈیوں میں فصلوں کی تھوک قیمتیں</p>
        {data.last_updated && (
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-1.5 rounded-full text-xs font-semibold"
               style={{ background: 'rgba(255,255,255,0.12)', color: '#dcfce7', border: '1px solid rgba(255,255,255,0.2)' }}>
            📅 Last updated: {data.last_updated}
          </div>
        )}
      </div>

      {loading && <div className="text-center text-gray-400 py-16">Loading mandi rates…</div>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-center">{error}</div>
      )}

      {!loading && !error && data.rates.length === 0 && (
        <div className="bg-white rounded-xl border text-center py-16 text-gray-400">
          No mandi rates available yet.
        </div>
      )}

      {!loading && !error && data.rates.length > 0 && (
        <>
          {/* Filter + refresh */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {crops.map(c => (
                <button key={c} onClick={() => setCropFilter(c)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
                    cropFilter === c ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
                  }`}>
                  {c !== 'All' && CROP_EMOJI[c] ? `${CROP_EMOJI[c]} ` : ''}{c}
                </button>
              ))}
            </div>
            <button onClick={fetchRates}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:border-green-400 transition">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Crop cards */}
          <div className="space-y-6">
            {Object.entries(grouped).map(([crop, { urdu, rows }]) => (
              <div key={crop} className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{CROP_EMOJI[crop] || '🌾'}</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{crop}</h3>
                    <p className="text-xs text-gray-400" dir="rtl">{urdu}</p>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {rows.map((r, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        {r.city}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-700">Rs {r.price.toLocaleString()}</div>
                        <div className="text-xs text-gray-400">{r.unit}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800 mt-6">
            💡 Rates are updated periodically and may vary by exact market, quality, and daily trading activity. Use as a general guide, not a guaranteed price.
          </div>
        </>
      )}
    </div>
  );
}
