import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { Upload, Loader, CheckCircle, AlertCircle, Leaf, Camera, Info, ChevronRight, X } from 'lucide-react';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';

const CROPS = [
  { id: 'wheat',     label: 'Wheat',     urdu: 'گندم',  emoji: '🌾', color: '#D4A017', bg: '#FDF6E3', border: '#F0D080' },
  { id: 'rice',      label: 'Rice',      urdu: 'چاول',  emoji: '🌱', color: '#2D8A4E', bg: '#EBF7EF', border: '#A8DFB8' },
  { id: 'cotton',    label: 'Cotton',    urdu: 'کپاس',  emoji: '☁️', color: '#5B8DB8', bg: '#EBF3FA', border: '#A8CCE8' },
  { id: 'sugarcane', label: 'Sugarcane', urdu: 'گنا',   emoji: '🎋', color: '#4CAF50', bg: '#E8F5E9', border: '#A5D6A7' },
  { id: 'corn',      label: 'Corn',      urdu: 'مکئی',  emoji: '🌽', color: '#E67E22', bg: '#FEF0E6', border: '#F5C694' },
  { id: 'potato',    label: 'Potato',    urdu: 'آلو',   emoji: '🥔', color: '#8B6914', bg: '#F5EFE0', border: '#D4B87A' },
];

const PHOTO_TIPS = [
  { en: 'Take a clear, close-up photo of a single leaf', ur: 'ایک پتے کی واضح اور قریب سے تصویر لیں' },
  { en: 'Ensure good lighting — natural daylight is best', ur: 'اچھی روشنی یقینی بنائیں — قدرتی دھوپ بہترین ہے' },
  { en: 'Show the affected area clearly in the frame', ur: 'متاثرہ حصہ واضح طور پر فریم میں دکھائیں' },
  { en: 'Avoid blurry or dark photos for accurate results', ur: 'درست نتائج کے لیے دھندلی یا تاریک تصاویر سے بچیں' },
];

function Detect() {
  const [crop, setCrop]         = useState(null);
  const [image, setImage]       = useState(null);
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);
  const [showUrdu, setShowUrdu] = useState(false);
  const [showTips, setShowTips] = useState(true);
  const fileRef = useRef();

  const selectedCrop = CROPS.find((c) => c.id === crop);

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError(null);
    setShowTips(false);
  };

  const changeCrop = () => {
    setCrop(null); setImage(null); setPreview(null);
    setResult(null); setError(null); setShowTips(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const predict = async () => {
    if (!image || !crop) return;
    setLoading(true); setError(null);
    try {
      const formData = new FormData();
      formData.append('file', image);
      formData.append('crop', crop);
      const res = await axios.post(`${API_URL}/predict`, formData);
      setResult(res.data);
    } catch {
      setError('Failed to analyze image. Please try again. / تصویر کا تجزیہ ناکام ہوا، دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  const parseExplanation = (text) => {
    if (!text) return { english: '', urdu: '' };
    const parts = text.split('🇵🇰');
    return {
      english: parts[0].replace('🇬🇧 English:', '').trim(),
      urdu: parts[1] ? parts[1].replace('اردو:', '').trim() : '',
    };
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #fefce8 100%)', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#166534', color: 'white', borderRadius: '999px',
            padding: '6px 16px', fontSize: '13px', fontWeight: '600',
            marginBottom: '12px', letterSpacing: '0.05em'
          }}>
            <Leaf size={14} /> AI-POWERED DIAGNOSIS
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#14532d', marginBottom: '6px' }}>
            Crop Disease Detection
          </h1>
          <p style={{ color: '#4B5563', fontSize: '15px' }}>Upload a leaf photo for instant AI diagnosis</p>
          <p style={{ color: '#16A34A', fontSize: '15px', fontFamily: 'serif' }}>فصل کے پتے کی تصویر اپلوڈ کریں</p>
        </div>

        {/* Crop Selection */}
        {!crop ? (
          <div>
            <h2 style={{ textAlign: 'center', color: '#374151', fontWeight: '700', marginBottom: '16px', fontSize: '16px' }}>
              Select your crop / فصل منتخب کریں
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
              {CROPS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCrop(c.id)}
                  style={{
                    background: c.bg,
                    border: `2px solid ${c.border}`,
                    borderRadius: '16px',
                    padding: '20px 12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '36px' }}>{c.emoji}</span>
                  <span style={{ fontWeight: '700', color: '#1F2937', fontSize: '15px' }}>{c.label}</span>
                  <span style={{ color: c.color, fontSize: '14px', fontFamily: 'serif', fontWeight: '600' }}>{c.urdu}</span>
                </button>
              ))}
            </div>

            {/* Photo Tips */}
            <div style={{
              background: '#EFF6FF', border: '1px solid #BFDBFE',
              borderRadius: '16px', padding: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Camera size={18} color="#2563EB" />
                <span style={{ fontWeight: '700', color: '#1E40AF', fontSize: '15px' }}>
                  Photo Tips for Best Results / بہترین نتائج کے لیے تصویر کی ہدایات
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {PHOTO_TIPS.map((tip, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <span style={{
                      background: '#2563EB', color: 'white', borderRadius: '50%',
                      width: '22px', height: '22px', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0
                    }}>{i + 1}</span>
                    <div>
                      <p style={{ color: '#1E40AF', fontSize: '14px', fontWeight: '500', margin: 0 }}>{tip.en}</p>
                      <p style={{ color: '#3B82F6', fontSize: '13px', fontFamily: 'serif', margin: '2px 0 0' }}>{tip.ur}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        ) : (
          <>
            {/* Selected Crop Badge */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: selectedCrop.bg, border: `1px solid ${selectedCrop.border}`,
              borderRadius: '12px', padding: '12px 16px', marginBottom: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{selectedCrop.emoji}</span>
                <div>
                  <span style={{ fontWeight: '700', color: '#1F2937', fontSize: '15px' }}>
                    {selectedCrop.label}
                  </span>
                  <span style={{ color: selectedCrop.color, fontSize: '13px', fontFamily: 'serif', marginLeft: '8px' }}>
                    {selectedCrop.urdu}
                  </span>
                </div>
              </div>
              <button
                onClick={changeCrop}
                style={{ color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
              >
                <X size={14} /> Change / بدلیں
              </button>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => !preview && fileRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              style={{
                border: `2px dashed ${preview ? '#16A34A' : '#86EFAC'}`,
                borderRadius: '20px',
                padding: preview ? '16px' : '40px 20px',
                textAlign: 'center',
                cursor: preview ? 'default' : 'pointer',
                background: preview ? '#F0FDF4' : 'white',
                marginBottom: '16px',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {preview ? (
                <div>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ maxHeight: '280px', margin: '0 auto', borderRadius: '12px', objectFit: 'contain', display: 'block' }}
                  />
                  <button
                    onClick={() => fileRef.current.click()}
                    style={{
                      marginTop: '12px', background: 'white', border: '1px solid #D1FAE5',
                      color: '#16A34A', padding: '8px 20px', borderRadius: '999px',
                      cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                    }}
                  >
                    Change Photo / تصویر بدلیں
                  </button>
                </div>
              ) : (
                <div>
                  <div style={{
                    width: '72px', height: '72px', background: '#F0FDF4', border: '2px solid #BBF7D0',
                    borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px'
                  }}>
                    <Upload size={32} color="#16A34A" />
                  </div>
                  <p style={{ color: '#1F2937', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                    Tap to upload a leaf photo
                  </p>
                  <p style={{ color: '#6B7280', fontSize: '14px', marginBottom: '16px' }}>
                    پتے کی تصویر اپلوڈ کرنے کے لیے یہاں دبائیں
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {['Single leaf only', 'Clear & focused', 'Good lighting'].map((t) => (
                      <span key={t} style={{
                        background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#15803D',
                        padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: '600'
                      }}>{t}</span>
                    ))}
                  </div>
                  <p style={{ color: '#9CA3AF', fontSize: '12px', marginTop: '12px' }}>JPG, PNG supported</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            {/* Tips reminder (compact) */}
            {!preview && (
              <div style={{
                background: '#FFFBEB', border: '1px solid #FDE68A',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Info size={16} color="#D97706" />
                  <span style={{ color: '#92400E', fontSize: '13px', fontWeight: '600' }}>
                    For best results: Take a clear close-up of a single diseased leaf in good lighting.
                  </span>
                </div>
                <p style={{ color: '#B45309', fontSize: '13px', fontFamily: 'serif', marginTop: '4px', marginLeft: '24px' }}>
                  بہترین نتائج کے لیے: اچھی روشنی میں ایک بیمار پتے کی واضح تصویر لیں۔
                </p>
              </div>
            )}
          </>
        )}

        {/* Analyze Button */}
        {crop && preview && (
          <button
            onClick={predict}
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#86EFAC' : 'linear-gradient(135deg, #16A34A, #15803D)',
              color: 'white', fontWeight: '800', fontSize: '17px',
              padding: '16px', borderRadius: '14px', border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              marginBottom: '24px', boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
              transition: 'all 0.2s',
            }}
          >
            {loading
              ? <><Loader size={22} style={{ animation: 'spin 1s linear infinite' }} /> Analyzing your crop...</>
              : <><Leaf size={22} /> Detect Disease / بیماری تشخیص کریں <ChevronRight size={20} /></>
            }
          </button>
        )}

        {/* Error */}
        {error && (
          <div style={{
            background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626',
            padding: '14px 16px', borderRadius: '12px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '500'
          }}>
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Main Result Card */}
            <div style={{
              borderRadius: '20px', overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
            }}>
              <div style={{
                background: result.prediction.is_healthy
                  ? 'linear-gradient(135deg, #16A34A, #15803D)'
                  : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                padding: '24px', color: 'white'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  {result.prediction.is_healthy
                    ? <CheckCircle size={40} />
                    : <AlertCircle size={40} />}
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: '800' }}>
                      {result.prediction.is_healthy ? '✅ Healthy Crop!' : '⚠️ Disease Detected'}
                    </div>
                    <div style={{ opacity: 0.85, fontSize: '14px', fontFamily: 'serif' }}>
                      {result.prediction.is_healthy ? 'آپ کی فصل صحت مند ہے' : 'بیماری کی تشخیص ہوئی'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Crop / فصل</div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{result.prediction.crop}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px' }}>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Disease / بیماری</div>
                    <div style={{ fontSize: '18px', fontWeight: '800' }}>{result.prediction.disease}</div>
                  </div>
                </div>

                <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '14px', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', opacity: 0.8, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence / اعتماد</span>
                    <span style={{ fontSize: '20px', fontWeight: '800' }}>{result.prediction.confidence.toFixed(1)}%</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.25)', borderRadius: '999px', height: '8px' }}>
                    <div style={{
                      background: 'white', borderRadius: '999px', height: '8px',
                      width: `${result.prediction.confidence}%`, transition: 'width 1s ease'
                    }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Predictions */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontWeight: '800', color: '#111827', marginBottom: '16px', fontSize: '16px' }}>
                Top 3 Predictions / تین بہترین تشخیص
              </h3>
              {result.top3.map((t, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? '14px' : 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: i === 0 ? '#16A34A' : '#E5E7EB',
                        color: i === 0 ? 'white' : '#6B7280',
                        borderRadius: '50%', width: '22px', height: '22px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700', flexShrink: 0
                      }}>{i + 1}</span>
                      <span style={{ fontWeight: '600', color: '#1F2937', fontSize: '14px' }}>
                        {t.crop} — {t.disease}
                      </span>
                    </div>
                    <span style={{ color: '#6B7280', fontSize: '14px', fontWeight: '600' }}>
                      {t.confidence.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ background: '#F3F4F6', borderRadius: '999px', height: '6px' }}>
                    <div style={{
                      background: i === 0 ? '#16A34A' : '#9CA3AF',
                      borderRadius: '999px', height: '6px',
                      width: `${t.confidence}%`
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Expert Guidance */}
            <div style={{ background: 'white', borderRadius: '16px', padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontWeight: '800', color: '#111827', fontSize: '16px' }}>
                  🌿 Expert Guidance / ماہر مشورہ
                </h3>
                <button
                  onClick={() => setShowUrdu(!showUrdu)}
                  style={{
                    background: '#F0FDF4', color: '#16A34A', border: '1px solid #BBF7D0',
                    padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
                    fontWeight: '600', cursor: 'pointer'
                  }}
                >
                  {showUrdu ? '🇬🇧 English' : '🇵🇰 اردو'}
                </button>
              </div>
              <div className="cgai-explanation" style={{
                color: '#374151', lineHeight: '1.8', fontSize: '14px',
                fontFamily: showUrdu ? 'serif' : 'inherit',
                direction: showUrdu ? 'rtl' : 'ltr',
                textAlign: showUrdu ? 'right' : 'left',
              }}>
                <ReactMarkdown>
                  {showUrdu
                    ? parseExplanation(result.explanation).urdu
                    : parseExplanation(result.explanation).english}
                </ReactMarkdown>
              </div>
            </div>

            {/* Ask AI CTA */}
            <div style={{
              background: 'linear-gradient(135deg, #F0FDF4, #ECFDF5)',
              border: '1px solid #BBF7D0', borderRadius: '16px', padding: '20px', textAlign: 'center'
            }}>
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
              <p style={{ color: '#1F2937', fontWeight: '700', fontSize: '16px', marginBottom: '4px' }}>
                Have questions about {result.prediction.disease}?
              </p>
              <p style={{ color: '#6B7280', fontSize: '13px', fontFamily: 'serif', marginBottom: '16px' }}>
                {result.prediction.disease} کے بارے میں مزید سوالات ہیں؟
              </p>
              <Link
                to={`/chat?crop=${result.prediction.crop}&disease=${result.prediction.disease}`}
                style={{
                  background: 'linear-gradient(135deg, #16A34A, #15803D)',
                  color: 'white', fontWeight: '700', padding: '12px 28px',
                  borderRadius: '12px', textDecoration: 'none',
                  display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '15px'
                }}
              >
                Ask AI Chatbot / AI سے پوچھیں <ChevronRight size={18} />
              </Link>
            </div>

            {/* Scan Again */}
            <button
              onClick={changeCrop}
              style={{
                width: '100%', background: 'white', border: '2px solid #E5E7EB',
                color: '#374151', fontWeight: '700', fontSize: '15px',
                padding: '14px', borderRadius: '14px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              <Leaf size={18} /> Scan Another Crop / دوسری فصل اسکین کریں
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .cgai-explanation p { margin: 0 0 12px; }
        .cgai-explanation p:last-child { margin-bottom: 0; }
        .cgai-explanation strong { font-weight: 700; color: #14532d; }
        .cgai-explanation ul, .cgai-explanation ol { margin: 4px 0 12px; padding-inline-start: 24px; }
        .cgai-explanation li { margin-bottom: 5px; }
        .cgai-explanation h1, .cgai-explanation h2, .cgai-explanation h3 {
          font-size: 15px; font-weight: 800; color: #14532d; margin: 14px 0 6px;
        }
        .cgai-explanation h1:first-child, .cgai-explanation h2:first-child, .cgai-explanation h3:first-child { margin-top: 0; }
        .cgai-explanation hr { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
      `}</style>
    </div>
  );
}

export default Detect;
