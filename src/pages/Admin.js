import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Lock, Save, RefreshCw, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

/* ─── Admin panel for editing fertilizer & spray data ────────────────────────
   Not linked from the navbar — visit /admin directly.
   Loads current live data from the backend, lets you edit it, and saves it
   back (password-protected). The backend also commits the change to the
   Hugging Face Space repo so it survives restarts. ──────────────────────── */

export default function Admin() {
  const [authed, setAuthed]     = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('');
  const [saving, setSaving]   = useState(false);
  const [saveMsg, setSaveMsg] = useState(null); // { type: 'success' | 'error', text }

  const [globalRates, setGlobalRates] = useState({ DAP: '', Urea: '', Potash: '' });

  useEffect(() => {
    if (!authed) return;
    (async () => {
      setLoading(true);
      setLoadError('');
      try {
        const res = await axios.get(`${API_URL}/fertilizer-data`);
        setData(res.data);
        const crops = Object.keys(res.data);
        if (crops.length) setSelectedCrop(crops[0]);
      } catch (e) {
        setLoadError('Could not load current data from the server. Check that the backend is running.');
      } finally {
        setLoading(false);
      }
    })();
  }, [authed]);

  const [authChecking, setAuthChecking] = useState(false);

  const tryLogin = async () => {
    if (password.trim().length === 0) {
      setAuthError('Enter the admin password.');
      return;
    }
    setAuthChecking(true);
    setAuthError('');
    try {
      await axios.post(`${API_URL}/admin/verify`, { password });
      setAuthed(true);
    } catch (e) {
      if (e.response?.status === 401) {
        setAuthError('Incorrect password.');
      } else {
        setAuthError('Could not reach the server to verify — check your connection.');
      }
    } finally {
      setAuthChecking(false);
    }
  };

  const updateCropField = (crop, path, value) => {
    setData(prev => {
      const next = { ...prev, [crop]: JSON.parse(JSON.stringify(prev[crop])) };
      let obj = next[crop];
      for (let i = 0; i < path.length - 1; i++) obj = obj[path[i]];
      obj[path[path.length - 1]] = value;
      return next;
    });
  };

  const applyGlobalRates = () => {
    setData(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      Object.keys(next).forEach(crop => {
        ['DAP', 'Urea', 'Potash'].forEach(fert => {
          if (globalRates[fert] !== '' && next[crop].perAcre?.[fert]) {
            next[crop].perAcre[fert].pricePerBag = parseFloat(globalRates[fert]);
          }
        });
      });
      return next;
    });
    setSaveMsg({ type: 'success', text: 'Applied to all crops in this editor — remember to Save below.' });
  };

  const updateSprayField = (crop, idx, field, value) => {
    setData(prev => {
      const next = { ...prev, [crop]: JSON.parse(JSON.stringify(prev[crop])) };
      next[crop].sprays[idx][field] = field === 'price' ? parseFloat(value) || 0 : value;
      return next;
    });
  };

  const addSpray = (crop) => {
    setData(prev => {
      const next = { ...prev, [crop]: JSON.parse(JSON.stringify(prev[crop])) };
      next[crop].sprays.push({ name: 'New Spray', type: 'Fungicide', target: '', dose: '', price: 0, unit: 'per pack' });
      return next;
    });
  };

  const removeSpray = (crop, idx) => {
    setData(prev => {
      const next = { ...prev, [crop]: JSON.parse(JSON.stringify(prev[crop])) };
      next[crop].sprays.splice(idx, 1);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res = await axios.post(`${API_URL}/admin/fertilizer-data`, { password, data });
      setSaveMsg({
        type: 'success',
        text: res.data.persisted_to_repo
          ? 'Saved and committed to the Space repo — this will survive restarts.'
          : 'Saved to the live server, but repo commit was skipped (check HF_TOKEN/SPACE_ID env vars).',
      });
    } catch (e) {
      if (e.response?.status === 401) {
        setSaveMsg({ type: 'error', text: 'Incorrect password — nothing was saved.' });
      } else {
        setSaveMsg({ type: 'error', text: 'Save failed: ' + (e.response?.data?.detail || e.message) });
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Password gate ── */
  if (!authed) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg border p-8 w-full max-w-sm text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-green-600 mb-4">
            <Lock size={26} color="#fff" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">Admin Panel</h1>
          <p className="text-sm text-gray-500 mb-6">CropGuard AI — internal data editor</p>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && tryLogin()}
            placeholder="Admin password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 mb-3 outline-none focus:border-green-500"
            autoFocus
          />
          {authError && <p className="text-red-500 text-xs mb-3">{authError}</p>}
          <button
            onClick={tryLogin}
            disabled={authChecking}
            className="w-full bg-green-600 text-white rounded-lg py-2.5 font-semibold hover:bg-green-700 transition disabled:opacity-50"
          >
            {authChecking ? 'Verifying…' : 'Continue'}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-500">Loading current data…</div>;
  }

  if (loadError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center px-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700 max-w-md text-center">
          <AlertCircle className="mx-auto mb-2" />
          {loadError}
        </div>
      </div>
    );
  }

  const crops = Object.keys(data);
  const crop = data[selectedCrop];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Fertilizer & Spray Data — Admin</h1>
          <p className="text-sm text-gray-500">Changes here update the live Fertilizer Calculator for everyone.</p>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>

      {saveMsg && (
        <div className={`flex items-center gap-2 rounded-lg px-4 py-3 mb-5 text-sm ${
          saveMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {saveMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {saveMsg.text}
        </div>
      )}

      {/* Global rates */}
      <div className="bg-white rounded-xl shadow-sm border p-5 mb-6">
        <h2 className="font-semibold text-gray-800 mb-3">Global Fertilizer Rates (Rs / 50kg bag)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
          {['DAP', 'Urea', 'Potash'].map(fert => (
            <div key={fert}>
              <label className="text-xs text-gray-500">{fert}</label>
              <input
                type="number"
                value={globalRates[fert]}
                onChange={e => setGlobalRates(p => ({ ...p, [fert]: e.target.value }))}
                placeholder="e.g. 14800"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
              />
            </div>
          ))}
          <button
            onClick={applyGlobalRates}
            className="bg-gray-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-900 transition"
          >
            Apply to All Crops
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Leave a field blank to leave that fertilizer's price unchanged.</p>
      </div>

      {/* Crop selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {crops.map(c => (
          <button
            key={c}
            onClick={() => setSelectedCrop(c)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${
              selectedCrop === c ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            }`}
          >
            {data[c].emoji} {c}
          </button>
        ))}
      </div>

      {crop && (
        <div className="space-y-6">
          {/* Fertilizer per-acre editor */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-semibold text-gray-800 mb-4">{selectedCrop} — Fertilizer per Acre</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {['DAP', 'Urea', 'Potash'].map(fert => (
                crop.perAcre[fert] && (
                  <div key={fert} className="border rounded-lg p-3">
                    <div className="font-bold text-green-700 mb-2">{fert}</div>
                    <label className="text-xs text-gray-500">Bags</label>
                    <input
                      type="number" step="0.1"
                      value={crop.perAcre[fert].bags}
                      onChange={e => {
                        const bags = parseFloat(e.target.value) || 0;
                        updateCropField(selectedCrop, ['perAcre', fert, 'bags'], bags);
                        updateCropField(selectedCrop, ['perAcre', fert, 'kg'], bags * 50);
                      }}
                      className="w-full border rounded px-2 py-1 text-sm mb-2 outline-none focus:border-green-500"
                    />
                    <label className="text-xs text-gray-500">Price / bag (Rs)</label>
                    <input
                      type="number"
                      value={crop.perAcre[fert].pricePerBag}
                      onChange={e => updateCropField(selectedCrop, ['perAcre', fert, 'pricePerBag'], parseFloat(e.target.value) || 0)}
                      className="w-full border rounded px-2 py-1 text-sm outline-none focus:border-green-500"
                    />
                  </div>
                )
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h2 className="font-semibold text-gray-800 mb-2">Agronomy Note</h2>
            <textarea
              value={crop.notes}
              onChange={e => updateCropField(selectedCrop, ['notes'], e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500"
            />
          </div>

          {/* Sprays */}
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-800">{selectedCrop} — Sprays</h2>
              <button
                onClick={() => addSpray(selectedCrop)}
                className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800"
              >
                <Plus size={14} /> Add Spray
              </button>
            </div>
            <div className="space-y-3">
              {crop.sprays.map((s, i) => (
                <div key={i} className="grid sm:grid-cols-6 gap-2 items-center border-b pb-3">
                  <input value={s.name} onChange={e => updateSprayField(selectedCrop, i, 'name', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm sm:col-span-1 outline-none focus:border-green-500" placeholder="Name" />
                  <select value={s.type} onChange={e => updateSprayField(selectedCrop, i, 'type', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm outline-none focus:border-green-500">
                    <option>Fungicide</option><option>Insecticide</option><option>Herbicide</option>
                  </select>
                  <input value={s.target} onChange={e => updateSprayField(selectedCrop, i, 'target', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm sm:col-span-2 outline-none focus:border-green-500" placeholder="Target pest/disease" />
                  <input value={s.dose} onChange={e => updateSprayField(selectedCrop, i, 'dose', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm outline-none focus:border-green-500" placeholder="Dose e.g. 400g/acre" />
                  <div className="flex items-center gap-1">
                    <input type="number" value={s.price} onChange={e => updateSprayField(selectedCrop, i, 'price', e.target.value)}
                      className="border rounded px-2 py-1.5 text-sm w-full outline-none focus:border-green-500" placeholder="Price" />
                    <button onClick={() => removeSpray(selectedCrop, i)} className="text-red-400 hover:text-red-600">
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input value={s.unit} onChange={e => updateSprayField(selectedCrop, i, 'unit', e.target.value)}
                    className="border rounded px-2 py-1.5 text-sm sm:col-span-6 outline-none focus:border-green-500" placeholder="Unit e.g. per 400g pack" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end mt-6">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? 'Saving…' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
