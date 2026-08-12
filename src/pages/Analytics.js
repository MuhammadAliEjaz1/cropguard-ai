import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { BarChart3, RefreshCw, AlertTriangle, MapPin, Bug } from 'lucide-react';
import { API_URL } from '../config';

const CROP_COLORS = {
  Wheat: '#f59e0b', Rice: '#10b981', Cotton: '#8b5cf6', Sugarcane: '#06b6d4',
  Corn: '#f97316', Potato: '#6b7280', Sunflower: '#eab308', Canola: '#facc15',
  Gram: '#a3e635', Barley: '#84cc16', Millet: '#22c55e', Sorghum: '#059669',
  Groundnut: '#d97706', Onion: '#dc2626',
};
const SEVERITY_COLORS = { Mild: '#f59e0b', Moderate: '#f97316', Severe: '#ef4444' };
const FALLBACK_COLORS = ['#16a34a', '#0891b2', '#7c3aed', '#dc2626', '#d97706', '#0d9488'];

// ── Proximity-based outbreak detection (same logic as the Disease Map) ──────
const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
    Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const countOutbreaks = (reports) => {
  const used = new Set();
  let count = 0;
  reports.forEach((r, i) => {
    if (used.has(i)) return;
    const cluster = [i];
    reports.forEach((r2, j) => {
      if (i === j || used.has(j)) return;
      if (r.crop === r2.crop && r.disease?.toLowerCase() === r2.disease?.toLowerCase()) {
        if (haversineKm(r.latitude, r.longitude, r2.latitude, r2.longitude) <= 100) cluster.push(j);
      }
    });
    if (cluster.length >= 2) {
      cluster.forEach(idx => used.add(idx));
      count++;
    }
  });
  return count;
};

function StatCard({ icon, label, labelUr, value, color }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex items-center gap-4">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18` }}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="text-xs text-gray-400" dir="rtl">{labelUr}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, titleUr, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <h3 className="font-bold text-gray-800">{title}</h3>
      <p className="text-xs text-gray-400 mb-4" dir="rtl">{titleUr}</p>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/reports`);
      setReports(res.data.reports || []);
    } catch {
      setError('Could not load report data from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const stats = useMemo(() => {
    const cropCounts = {};
    const diseaseCounts = {};
    const severityCounts = { Mild: 0, Moderate: 0, Severe: 0 };
    const monthMap = {};
    const locations = new Set();

    reports.forEach(r => {
      if (r.crop) cropCounts[r.crop] = (cropCounts[r.crop] || 0) + 1;
      const dKey = r.disease || 'Unknown';
      diseaseCounts[dKey] = (diseaseCounts[dKey] || 0) + 1;
      if (r.severity && severityCounts[r.severity] !== undefined) severityCounts[r.severity]++;
      if (r.location_name) locations.add(r.location_name);
      if (r.timestamp) {
        const d = new Date(r.timestamp);
        if (!isNaN(d)) {
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthMap[key]) {
            monthMap[key] = { key, label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }), count: 0 };
          }
          monthMap[key].count++;
        }
      }
    });

    const cropData = Object.entries(cropCounts)
      .map(([crop, count]) => ({ crop, count, fill: CROP_COLORS[crop] || '#16a34a' }))
      .sort((a, b) => b.count - a.count);

    const severityData = Object.entries(severityCounts)
      .map(([severity, count]) => ({ severity, count, fill: SEVERITY_COLORS[severity] }));

    const topDiseases = Object.entries(diseaseCounts)
      .map(([disease, count]) => ({ disease, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const trendData = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));

    return {
      total: reports.length,
      outbreaks: countOutbreaks(reports),
      uniqueCrops: Object.keys(cropCounts).length,
      uniqueLocations: locations.size,
      cropData, severityData, topDiseases, trendData,
    };
  }, [reports]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl mb-8 px-6 py-10 text-center"
           style={{ background: 'linear-gradient(160deg, #14532D 0%, #166534 50%, #15803D 100%)' }}>
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
             style={{ background: 'rgba(255,255,255,0.14)', border: '1px solid rgba(255,255,255,0.25)' }}>
          <BarChart3 size={26} color="#fff" />
        </div>
        <h1 className="text-3xl font-bold text-white">Insights & Analytics</h1>
        <p className="text-white/80 mt-2">Trends from real farmer-submitted disease reports across Pakistan</p>
        <p className="mt-1" style={{ color: '#86EFAC' }}>پاکستان بھر سے کسانوں کی رپورٹس کے رجحانات</p>
      </div>

      {loading && <div className="text-center text-gray-400 py-16">Loading report data…</div>}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-5 text-center">{error}</div>
      )}

      {!loading && !error && reports.length === 0 && (
        <div className="bg-white rounded-xl border text-center py-16 text-gray-400">
          No disease reports yet — insights will appear here once farmers start submitting reports on the Disease Map.
        </div>
      )}

      {!loading && !error && reports.length > 0 && (
        <>
          {/* Refresh */}
          <div className="flex justify-end mb-4">
            <button onClick={fetchReports}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:border-green-400 transition">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<MapPin size={20} color="#16a34a" />} color="#16a34a"
              label="Total Reports" labelUr="کل رپورٹس" value={stats.total} />
            <StatCard icon={<AlertTriangle size={20} color="#dc2626" />} color="#dc2626"
              label="Active Outbreaks" labelUr="فعال وبائی علاقے" value={stats.outbreaks} />
            <StatCard icon={<Bug size={20} color="#7c3aed" />} color="#7c3aed"
              label="Crops Affected" labelUr="متاثرہ فصلیں" value={stats.uniqueCrops} />
            <StatCard icon={<MapPin size={20} color="#0891b2" />} color="#0891b2"
              label="Locations Reporting" labelUr="رپورٹنگ مقامات" value={stats.uniqueLocations} />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Reports by crop */}
            <ChartCard title="Reports by Crop" titleUr="فصل کے لحاظ سے رپورٹس">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.cropData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} fontSize={12} />
                  <YAxis type="category" dataKey="crop" width={80} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {stats.cropData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Severity breakdown */}
            <ChartCard title="Severity Breakdown" titleUr="شدت کے لحاظ سے تقسیم">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={stats.severityData} dataKey="count" nameKey="severity"
                       cx="50%" cy="50%" outerRadius={90} label={({ severity, count }) => count > 0 ? `${severity}: ${count}` : ''}>
                    {stats.severityData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Top diseases */}
            <ChartCard title="Most Reported Diseases" titleUr="سب سے زیادہ رپورٹ ہونے والی بیماریاں">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats.topDiseases} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="disease" fontSize={11} angle={-30} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {stats.topDiseases.map((_, i) => <Cell key={i} fill={FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Trend over time */}
            <ChartCard title="Reports Over Time" titleUr="وقت کے ساتھ رپورٹس کا رجحان">
              {stats.trendData.length < 2 ? (
                <div className="h-[280px] flex items-center justify-center text-sm text-gray-400 text-center px-6">
                  Not enough data yet to show a trend — check back once more reports come in across different dates.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={stats.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#16a34a" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
