import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Leaf, MessageCircle, MapPin, Camera, CloudRain,
  Calendar, FlaskConical, ChevronRight, Shield, Bug
} from 'lucide-react';

/* ─── Intersection observer hook ─────────────────────── */
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

/* ─── Animated counter ───────────────────────────────── */
function useCounter(target, duration = 1600, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const isFloat = target.toString().includes('.');
    const numeric = parseFloat(target);
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const t = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setVal(isFloat ? (eased * numeric).toFixed(2) : Math.floor(eased * numeric));
      if (step >= steps) clearInterval(t);
    }, interval);
    return () => clearInterval(t);
  }, [start, target, duration]);
  return val;
}

/* ─── Stat card ──────────────────────────────────────── */
function StatCard({ value, suffix, label, urdu, inView, delay }) {
  const numeric = parseFloat(value.replace(/[^0-9.]/g, ''));
  const counted = useCounter(numeric, 1600, inView);
  const isFloat = value.includes('.');
  const hasPlus = value.includes('+');
  return (
    <div style={{
      textAlign: 'center', padding: '28px 16px',
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(24px)',
      transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    }}>
      <div style={{
        fontSize: 'clamp(1.6rem, 6vw, 2.8rem)',
        fontWeight: 900,
        color: '#166534',
        lineHeight: 1,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
      }}>
        {isFloat ? counted : Number(counted).toLocaleString()}
        {hasPlus ? '+' : ''}{suffix}
      </div>
      <div style={{ fontSize: 14, color: '#374151', marginTop: 8, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#6B7280', marginTop: 3, fontFamily: 'serif' }}>{urdu}</div>
    </div>
  );
}

/* ─── Feature card ───────────────────────────────────── */
function FeatureCard({ icon, title, titleUr, desc, descUr, to, accent, delay, inView }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block', textDecoration: 'none',
        background: '#fff',
        borderRadius: 16,
        padding: '24px',
        border: `1.5px solid ${hovered ? accent : '#E5E7EB'}`,
        boxShadow: hovered ? `0 8px 32px ${accent}22` : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        opacity: inView ? 1 : 0,
        transitionDelay: `${delay}s`,
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: `${accent}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: '0 0 3px' }}>{title}</h3>
      <div style={{ fontSize: 13, color: accent, marginBottom: 10, fontFamily: 'serif' }}>{titleUr}</div>
      <p style={{ fontSize: 13.5, color: '#6B7280', lineHeight: 1.65, margin: '0 0 8px' }}>{desc}</p>
      <p style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.6, margin: 0, fontFamily: 'serif', textAlign: 'right', direction: 'rtl' }}>{descUr}</p>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        marginTop: 14, fontSize: 13, color: accent, fontWeight: 700,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.2s ease',
      }}>
        Open <ChevronRight size={14} />
      </div>
    </Link>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function Home() {
  const [statsRef, statsInView] = useInView(0.2);
  const [featRef,  featInView]  = useInView(0.1);
  const [cropRef,  cropInView]  = useInView(0.2);
  const [howRef,   howInView]   = useInView(0.2);
  const [ctaRef,   ctaInView]   = useInView(0.3);
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { setTimeout(() => setHeroVisible(true), 60); }, []);

  const stats = [
    { value: '94.3',  suffix: '%', label: 'Average Accuracy',   urdu: 'اوسط درستگی'         },
    { value: '51',    suffix: '',  label: 'Disease Classes',     urdu: 'بیماریوں کی اقسام'    },
    { value: '6',     suffix: '',  label: 'Crops Supported',     urdu: 'معاون فصلیں'          },
    { value: '45000', suffix: '+', label: 'Training Images',     urdu: 'تربیتی تصاویر'        },
  ];

  const features = [
    {
      icon: <Camera size={22} color="#16A34A" />,
      title: 'Disease Detection',       titleUr: 'بیماری کی تشخیص',
      desc:  'Photograph a leaf, get an instant AI diagnosis with treatment advice.',
      descUr:'پتے کی تصویر لیں، فوری تشخیص اور علاج کا مشورہ پائیں۔',
      to: '/detect', accent: '#16A34A', delay: 0.0,
    },
    {
      icon: <MessageCircle size={22} color="#0891B2" />,
      title: 'AI Agriculture Chatbot',  titleUr: 'زرعی چیٹ بوٹ',
      desc:  'Ask farming questions in Urdu or English. Expert answers, instantly.',
      descUr:'اردو یا انگریزی میں سوال پوچھیں — ماہرانہ جواب فوراً پائیں۔',
      to: '/chat', accent: '#0891B2', delay: 0.08,
    },
    {
      icon: <MapPin size={22} color="#DC2626" />,
      title: 'Disease Warning Map',     titleUr: 'بیماری وارننگ نقشہ',
      desc:  'See active disease outbreaks near your farm. Stay ahead of threats.',
      descUr:'اپنے کھیت کے قریب بیماریوں کا نقشہ دیکھیں۔',
      to: '/map', accent: '#DC2626', delay: 0.16,
    },
    {
      icon: <CloudRain size={22} color="#7C3AED" />,
      title: 'Weather & Advisory',      titleUr: 'موسم اور زرعی مشورے',
      desc:  '10-day forecasts with farming advice for every Pakistani city.',
      descUr:'۱۰ دن کی موسمی پیشگوئی اور آپ کے شہر کے لیے مشورے۔',
      to: '/weather', accent: '#7C3AED', delay: 0.24,
    },
    {
      icon: <Bug size={22} color="#EA580C" />,
      title: 'Pest Identification',     titleUr: 'کیڑوں کی شناخت',
      desc:  'Identify crop pests from photos and get control recommendations.',
      descUr:'تصویر سے کیڑوں کی شناخت اور تدارک کے مشورے پائیں۔',
      to: '/pest', accent: '#EA580C', delay: 0.32,
    },
    {
      icon: <Calendar size={22} color="#0D9488" />,
      title: 'Crop Calendar',           titleUr: 'فصل کیلنڈر',
      desc:  'Sowing, fertilizing, and harvesting schedule for Pakistani crops.',
      descUr:'پاکستانی فصلوں کے لیے بوائی، کھاد اور کٹائی کا شیڈول۔',
      to: '/calendar', accent: '#0D9488', delay: 0.40,
    },
  ];

  const crops = [
    { emoji: '🌾', en: 'Wheat',     ur: 'گندم',  acc: '90.44%' },
    { emoji: '🌱', en: 'Rice',      ur: 'چاول',  acc: '97.90%' },
    { emoji: '☁️', en: 'Cotton',    ur: 'کپاس',  acc: '97.30%' },
    { emoji: '🎋', en: 'Sugarcane', ur: 'گنا',   acc: '98.20%' },
    { emoji: '🌽', en: 'Corn',      ur: 'مکئی',  acc: '88.50%' },
    { emoji: '🥔', en: 'Potato',    ur: 'آلو',   acc: '93.21%' },
  ];

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#FAFAF8' }}>

      {/* ══ HERO ══════════════════════════════════════════════ */}
      <div style={{
        background: 'linear-gradient(160deg, #14532D 0%, #166534 50%, #15803D 100%)',
        padding: 'clamp(56px, 10vw, 100px) 24px clamp(64px, 12vw, 120px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Subtle texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        <div style={{
          maxWidth: 720, margin: '0 auto', textAlign: 'center',
          position: 'relative', zIndex: 1,
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 999, padding: '7px 18px',
            fontSize: 12, fontWeight: 700, color: '#86EFAC',
            letterSpacing: '0.08em', marginBottom: 28,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block' }} />
            AI-POWERED · FREE TO USE
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.2rem, 6vw, 3.8rem)',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1,
            margin: '0 0 8px',
            letterSpacing: '-0.02em',
          }}>
            CropGuard <span style={{ color: '#4ADE80' }}>AI</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
            color: 'rgba(255,255,255,0.85)',
            margin: '0 0 6px', fontWeight: 400,
          }}>
            Intelligent Crop Disease Detection for Pakistani Farmers
          </p>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
            color: '#86EFAC', margin: '0 0 40px',
            fontFamily: 'serif', direction: 'rtl',
          }}>
            فصلوں کی بیماریوں کی فوری تشخیص — اردو اور انگریزی میں
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/detect" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#166534',
              fontWeight: 800, fontSize: 15,
              padding: '14px 28px', borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              transition: 'transform 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Camera size={18} /> بیماری تشخیص کریں / Detect Disease
            </Link>
            <Link to="/chat" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.12)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              padding: '14px 28px', borderRadius: 12,
              textDecoration: 'none',
              transition: 'background 0.2s ease',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              <MessageCircle size={18} /> AI Expert سے پوچھیں / Ask AI
            </Link>
          </div>

          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 28, letterSpacing: '0.06em' }}>
            TRAINED ON 45,000+ REAL FIELD IMAGES
          </p>
        </div>
      </div>

      {/* ══ STATS ═════════════════════════════════════════════ */}
      <div ref={statsRef} style={{ background: '#fff', borderBottom: '1px solid #F3F4F6' }}>
        <div className="stats-grid" style={{ maxWidth: 860, margin: '0 auto' }}>
          {stats.map((s, i) => (
            <div key={i}>
              <StatCard {...s} inView={statsInView} delay={i * 0.1} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══════════════════════════════════════════ */}
      <div ref={featRef} style={{ background: '#FAFAF8', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 980, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-block',
              background: '#F0FDF4', color: '#166534',
              border: '1px solid #BBF7D0',
              borderRadius: 999, padding: '5px 16px',
              fontSize: 12, fontWeight: 700,
              letterSpacing: '0.08em', marginBottom: 14,
            }}>
              EVERYTHING YOU NEED · آپ کی ضرورت
            </div>
            <h2 style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
              fontWeight: 800, color: '#111827', margin: '0 0 10px',
            }}>
              What CropGuard AI Does
            </h2>
            <p style={{ color: '#6B7280', fontSize: 15, maxWidth: 500, margin: '0 auto' }}>
              Six powerful tools built specifically for Pakistan's farmers
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} inView={featInView} />
            ))}
          </div>
        </div>
      </div>

      {/* ══ CROPS ═════════════════════════════════════════════ */}
      <div ref={cropRef} style={{ background: '#fff', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800, color: '#111827', margin: '0 0 8px',
            }}>
              Supported Crops & Accuracy
            </h2>
            <p style={{ color: '#6B7280', fontSize: 14 }}>
              Individually trained models for each crop
            </p>
            <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'serif', direction: 'rtl' }}>
              ہر فصل کے لیے الگ تربیت یافتہ ماڈل
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}>
            {crops.map((c, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                background: '#FAFAF8',
                border: '1.5px solid #E5E7EB',
                borderRadius: 14, padding: '16px 20px',
                opacity: cropInView ? 1 : 0,
                transform: cropInView ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`,
              }}>
                <span style={{ fontSize: 32, flexShrink: 0 }}>{c.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: '#111827', fontSize: 15 }}>{c.en}</span>
                    <span style={{
                      background: '#F0FDF4', color: '#16A34A',
                      border: '1px solid #BBF7D0',
                      borderRadius: 999, padding: '2px 10px',
                      fontSize: 12, fontWeight: 700,
                    }}>{c.acc}</span>
                  </div>
                  <div style={{ color: '#6B7280', fontSize: 13, fontFamily: 'serif', marginTop: 2 }}>{c.ur}</div>
                  <div style={{
                    height: 4, background: '#E5E7EB', borderRadius: 999, marginTop: 8,
                  }}>
                    <div style={{
                      height: 4, background: '#16A34A', borderRadius: 999,
                      width: cropInView ? c.acc : '0%',
                      transition: `width 1s ease ${i * 0.1 + 0.3}s`,
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ HOW IT WORKS ══════════════════════════════════════ */}
      <div ref={howRef} style={{
        background: '#F0FDF4',
        borderTop: '1px solid #D1FAE5',
        borderBottom: '1px solid #D1FAE5',
        padding: 'clamp(48px, 8vw, 80px) 24px',
      }}>
        <div style={{ maxWidth: 860, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: 800, color: '#14532D', margin: '0 0 8px',
            }}>
              How It Works
            </h2>
            <p style={{ color: '#16A34A', fontSize: 13, fontFamily: 'serif', direction: 'rtl' }}>
              یہ کیسے کام کرتا ہے
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 8, position: 'relative',
          }}>
            {[
              { step: '1', en: 'Take a clear photo of the affected leaf', ur: 'متاثرہ پتے کی واضح تصویر لیں', icon: '📸' },
              { step: '2', en: 'Upload it to CropGuard AI',               ur: 'کراپ گارڈ پر اپلوڈ کریں',    icon: '⬆️' },
              { step: '3', en: 'AI analyses and identifies the disease',   ur: 'اے آئی بیماری شناخت کرے گا',  icon: '🤖' },
              { step: '4', en: 'Receive treatment advice instantly',       ur: 'فوری علاج کا مشورہ پائیں',    icon: '💊' },
            ].map((s, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '24px 16px',
                background: '#fff', borderRadius: 16,
                border: '1.5px solid #BBF7D0',
                opacity: howInView ? 1 : 0,
                transform: howInView ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: '#F0FDF4', border: '2px solid #BBF7D0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 14px', fontSize: 22,
                }}>{s.icon}</div>
                <div style={{
                  display: 'inline-block',
                  background: '#166534', color: '#fff',
                  borderRadius: 999, padding: '2px 10px',
                  fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.06em', marginBottom: 10,
                }}>STEP {s.step}</div>
                <p style={{ fontSize: 13.5, color: '#1F2937', fontWeight: 600, margin: '0 0 6px', lineHeight: 1.5 }}>{s.en}</p>
                <p style={{ fontSize: 12, color: '#6B7280', margin: 0, fontFamily: 'serif', direction: 'rtl' }}>{s.ur}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ CTA ═══════════════════════════════════════════════ */}
      <div ref={ctaRef} style={{ background: '#fff', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', textAlign: 'center',
          opacity: ctaInView ? 1 : 0,
          transform: ctaInView ? 'translateY(0)' : 'translateY(24px)',
          transition: 'opacity 0.7s ease, transform 0.7s ease',
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 18,
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(22,163,74,0.3)',
          }}>
            <Leaf size={30} color="#fff" />
          </div>
          <h2 style={{
            fontSize: 'clamp(1.6rem, 3.5vw, 2.2rem)',
            fontWeight: 800, color: '#111827', margin: '0 0 10px',
          }}>
            Ready to protect your crops?
          </h2>
          <p style={{ color: '#6B7280', fontSize: 15, margin: '0 0 6px' }}>
            Take a photo of your diseased crop and get an instant diagnosis
          </p>
          <p style={{ color: '#9CA3AF', fontSize: 13, fontFamily: 'serif', direction: 'rtl', marginBottom: 32 }}>
            اپنی فصل کی تصویر لیں اور فوری تشخیص حاصل کریں
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/detect" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              color: '#fff', fontWeight: 700, fontSize: 15,
              padding: '14px 28px', borderRadius: 12,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
            }}>
              <Camera size={18} /> تشخیص شروع کریں / Start Detection
            </Link>
            <Link to="/chat" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#F9FAFB', color: '#374151',
              border: '1.5px solid #E5E7EB',
              fontWeight: 600, fontSize: 15,
              padding: '14px 24px', borderRadius: 12,
              textDecoration: 'none',
            }}>
              <MessageCircle size={18} color="#0891B2" /> سوال پوچھیں / Ask a Question
            </Link>
          </div>
        </div>
      </div>

      {/* ══ FOOTER ════════════════════════════════════════════ */}
      <footer style={{
        background: '#111827',
        color: 'rgba(255,255,255,0.4)',
        textAlign: 'center',
        padding: '28px 24px',
        fontSize: 13,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
          <Leaf size={15} color="#4ADE80" />
          <span style={{ color: '#fff', fontWeight: 700 }}>CropGuard AI</span>
          <span>© 2026</span>
        </div>
        <p style={{ margin: '0 0 3px', color: 'rgba(255,255,255,0.55)' }}>
          Muhammad Ali Ejaz &amp; Ahmad Siddique
        </p>
        <p style={{ margin: '0 0 8px', color: 'rgba(255,255,255,0.4)' }}>Final Year Project · Data Science · IUB</p>
        <p style={{ margin: 0, fontFamily: 'serif', fontSize: 12, color: 'rgba(255,255,255,0.25)', direction: 'rtl' }}>
          پاکستانی کسانوں کے لیے — محبت کے ساتھ بنایا گیا
        </p>
      </footer>

    </div>
  );
}
