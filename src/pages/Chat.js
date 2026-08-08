import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Send, Leaf, Loader2, ChevronRight, Sprout, Droplets, Bug, Wheat, Sun, FlaskConical } from 'lucide-react';
import { API_URL } from '../config';
import { useLocation } from 'react-router-dom';

/* ─── TYPING DOTS ──────────────────────────────────────────── */
function TypingDots() {
  return (
    <div className="cgai-typing">
      <span /><span /><span />
    </div>
  );
}

/* ─── AI AVATAR ────────────────────────────────────────────── */
function AIAvatar() {
  return (
    <div className="cgai-avatar cgai-avatar-ai">
      <Leaf size={13} strokeWidth={2.5} />
    </div>
  );
}

/* ─── WELCOME CARD ─────────────────────────────────────────── */
const capabilities = [
  { icon: <Bug size={14} />,        label: 'Crop diseases & treatment' },
  { icon: <FlaskConical size={14}/>, label: 'Fertilizers & pesticides' },
  { icon: <Wheat size={14} />,      label: 'Crop seasons in Pakistan' },
  { icon: <Sprout size={14} />,     label: 'Seeds & varieties' },
  { icon: <Droplets size={14} />,   label: 'Weather & irrigation' },
];

function WelcomeCard() {
  return (
    <div className="cgai-welcome">
      <div className="cgai-welcome-top">
        <span className="cgai-welcome-greeting">السلام علیکم! 👋</span>
        <p className="cgai-welcome-intro">
          I'm <strong>CropGuard AI</strong> — your agricultural expert assistant for Pakistan.
        </p>
      </div>
      <div className="cgai-welcome-divider" />
      <p className="cgai-welcome-can">I can help you with:</p>
      <div className="cgai-caps-grid">
        {capabilities.map((c, i) => (
          <div key={i} className="cgai-cap">
            <span className="cgai-cap-icon">{c.icon}</span>
            <span>{c.label}</span>
          </div>
        ))}
      </div>
      <div className="cgai-welcome-divider" />
      <p className="cgai-welcome-urdu">اردو یا انگریزی میں سوال پوچھیں۔</p>
    </div>
  );
}

/* ─── CONTEXT WELCOME ──────────────────────────────────────── */
function ContextCard({ crop, disease }) {
  return (
    <div className="cgai-welcome cgai-welcome-ctx">
      <span className="cgai-welcome-greeting">السلام علیکم! 👋</span>
      <p className="cgai-welcome-intro" style={{ marginTop: 6 }}>
        I can see you have a <strong>{crop}</strong> crop affected by <strong>{disease}</strong>.
      </p>
      <div className="cgai-ctx-badge">
        <Sprout size={13} /> {crop} · {disease}
      </div>
      <p style={{ fontSize: '0.82rem', color: '#374151', marginTop: 10, marginBottom: 0 }}>
        Ask me anything about this — causes, treatment, prevention — in Urdu or English.
      </p>
      <p className="cgai-welcome-urdu" style={{ marginTop: 8 }}>اردو میں سوال پوچھ سکتے ہیں۔</p>
    </div>
  );
}

/* ─── REGULAR MESSAGE ──────────────────────────────────────── */
function Message({ msg, isNew }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`cgai-msg-row ${isUser ? 'cgai-row-user' : 'cgai-row-ai'} ${isNew ? 'cgai-anim' : ''}`}>
      {!isUser && <AIAvatar />}
      <div className={`cgai-bubble ${isUser ? 'cgai-bubble-user' : 'cgai-bubble-ai'}`}>
        {msg.content}
      </div>
      {isUser && <div className="cgai-avatar cgai-avatar-user"><span>You</span></div>}
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────────────────── */
export default function Chat() {
  const location = useLocation();
  const params      = new URLSearchParams(location.search);
  const initCrop    = params.get('crop')    || '';
  const initDisease = params.get('disease') || '';

  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [newIdx, setNewIdx]       = useState(-1);
  const [crop]    = useState(initCrop);
  const [disease] = useState(initDisease);
  const bottomRef = useRef();
  const inputRef  = useRef();

  useEffect(() => {
    setMessages([{ role: 'assistant', content: '__welcome__' }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const userMsg = (text || input).trim();
    if (!userMsg || loading) return;
    setInput('');
    const nextAiIdx = messages.length + 1;
    setNewIdx(messages.length);
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const history = messages
        .filter(m => m.content !== '__welcome__')
        .map(m => ({ role: m.role, content: m.content }));

      const res = await axios.post(
        `${API_URL}/chat`,
        { message: userMsg, crop, disease, chat_history: history },
        { timeout: 60000 }  // ← 60 second timeout (model rotation can take ~10s)
      );

      // ── FIXED: handle both res.data.response and res.data.result ──
      const reply = res.data.response || res.data.result || res.data.message;

      if (!reply) {
        // Backend returned 200 but empty/unexpected shape — log it
        console.error('Unexpected API response shape:', res.data);
        throw new Error('Empty response from server');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      setNewIdx(nextAiIdx);
    } catch (err) {
      // Log the real error so you can debug in browser console
      console.error('Chat error:', err?.response?.data || err?.message || err);

      const status = err?.response?.status;
      let errorMsg = 'معذرت، کچھ غلطی ہوئی۔ دوبارہ کوشش کریں۔\n\nSorry, something went wrong. Please try again.';

      if (status === 500) {
        errorMsg = 'سرور میں خرابی ہے۔ تھوڑی دیر بعد کوشش کریں۔\n\nServer error. Please try again in a moment.';
      } else if (status === 429) {
        errorMsg = 'بہت زیادہ سوالات ہو گئے۔ ایک منٹ بعد کوشش کریں۔\n\nToo many requests. Please wait a minute and try again.';
      } else if (err?.code === 'ECONNABORTED') {
        errorMsg = 'جواب آنے میں بہت دیر لگی۔ دوبارہ کوشش کریں۔\n\nRequest timed out. Please try again.';
      }

      setMessages(prev => [...prev, { role: 'assistant', content: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@300;400;500;600;700&display=swap');

        /* PAGE */
        .cgai-page {
          font-family: 'Figtree', system-ui, sans-serif;
          display: flex; flex-direction: column;
          height: calc(100vh - 64px);
          max-width: 760px; margin: 0 auto; padding: 0 16px;
        }

        /* HEADER */
        .cgai-header {
          padding: 16px 0 14px;
          display: flex; align-items: center; gap: 13px;
          flex-shrink: 0;
          border-bottom: 1.5px solid #e2f5e9;
        }
        .cgai-hdr-icon {
          width: 42px; height: 42px; border-radius: 13px;
          background: linear-gradient(135deg, #15803d 0%, #4ade80 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(21,128,61,.32);
          flex-shrink: 0;
        }
        .cgai-hdr-title {
          font-size: 1.05rem; font-weight: 700;
          color: #111827; letter-spacing: -.02em; margin: 0 0 2px;
        }
        .cgai-hdr-sub { font-size: 0.76rem; color: #6b7280; margin: 0; }
        .cgai-hdr-ctx {
          margin-top: 4px;
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #15803d; font-size: 0.7rem; font-weight: 600;
          padding: 2px 9px; border-radius: 20px;
        }
        .cgai-status {
          margin-left: auto; display: flex; align-items: center; gap: 6px;
          font-size: 0.7rem; font-weight: 700;
          color: #16a34a; letter-spacing: .05em; text-transform: uppercase;
        }
        .cgai-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 0 2px rgba(74,222,128,.3);
          animation: pdot 2s ease infinite;
        }
        @keyframes pdot {
          0%,100% { box-shadow: 0 0 0 2px rgba(74,222,128,.3); }
          50%      { box-shadow: 0 0 0 5px rgba(74,222,128,.1); }
        }

        /* MESSAGES SCROLL */
        .cgai-messages {
          flex: 1; overflow-y: auto;
          padding: 18px 0 8px;
          display: flex; flex-direction: column; gap: 12px;
          scroll-behavior: smooth;
        }
        .cgai-messages::-webkit-scrollbar { width: 3px; }
        .cgai-messages::-webkit-scrollbar-track { background: transparent; }
        .cgai-messages::-webkit-scrollbar-thumb {
          background: #bbf7d0; border-radius: 3px;
        }

        /* DATE CHIP */
        .cgai-date {
          text-align: center; display: flex; align-items: center; gap: 10px;
          font-size: 0.65rem; color: #9ca3af;
          font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
        }
        .cgai-date::before, .cgai-date::after {
          content:''; flex:1; height:1px; background:#f0fdf4;
        }

        /* AVATARS */
        .cgai-avatar {
          width: 28px; height: 28px; border-radius: 9px;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .cgai-avatar-ai {
          background: linear-gradient(135deg, #15803d, #4ade80);
          color: #fff;
          box-shadow: 0 2px 6px rgba(21,128,61,.3);
          align-self: flex-end;
        }
        .cgai-avatar-user {
          background: #1f2937; color: #d1fae5;
          font-size: 0.58rem; font-weight: 700; letter-spacing: .02em;
          align-self: flex-end;
        }

        /* MESSAGE ROWS */
        .cgai-msg-row { display: flex; align-items: flex-end; gap: 9px; }
        .cgai-row-ai  { justify-content: flex-start; }
        .cgai-row-user { justify-content: flex-end; }

        .cgai-anim .cgai-bubble, .cgai-anim .cgai-welcome {
          animation: msgIn .28s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes msgIn {
          from { opacity:0; transform: translateY(10px) scale(.96); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* BUBBLES */
        .cgai-bubble {
          max-width: 74%;
          padding: 11px 15px;
          font-size: 0.865rem; line-height: 1.65;
          white-space: pre-wrap; word-break: break-word;
        }
        .cgai-bubble-ai {
          background: #fff;
          color: #1f2937;
          border-radius: 3px 16px 16px 16px;
          border: 1.5px solid #e2f5e9;
          box-shadow: 0 1px 4px rgba(0,0,0,.06), 0 0 0 0 transparent;
        }
        .cgai-bubble-user {
          background: linear-gradient(135deg, #15803d 0%, #16a34a 100%);
          color: #fff;
          border-radius: 16px 3px 16px 16px;
          box-shadow: 0 2px 10px rgba(21,128,61,.28);
        }

        /* WELCOME CARD */
        .cgai-welcome {
          background: #fff;
          border: 1.5px solid #e2f5e9;
          border-radius: 3px 18px 18px 18px;
          box-shadow: 0 2px 12px rgba(21,128,61,.08);
          padding: 18px 20px;
          max-width: 78%;
          font-size: 0.865rem;
        }
        .cgai-welcome-ctx { border-color: #bbf7d0; }
        .cgai-welcome-greeting {
          font-size: 1rem; font-weight: 700; color: #111827;
          display: block; margin-bottom: 6px;
        }
        .cgai-welcome-intro { color: #374151; margin: 0 0 0; line-height: 1.55; }
        .cgai-welcome-intro strong { color: #15803d; }
        .cgai-welcome-divider {
          height: 1px; background: #f0fdf4; margin: 12px 0;
        }
        .cgai-welcome-can {
          font-size: 0.72rem; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          color: #9ca3af; margin: 0 0 9px;
        }
        .cgai-caps-grid {
          display: flex; flex-direction: column; gap: 6px;
        }
        .cgai-cap {
          display: flex; align-items: center; gap: 9px;
          font-size: 0.82rem; color: #374151;
        }
        .cgai-cap-icon {
          width: 26px; height: 26px; border-radius: 7px;
          background: #f0fdf4;
          display: flex; align-items: center; justify-content: center;
          color: #16a34a; flex-shrink: 0;
        }
        .cgai-welcome-urdu {
          font-size: 0.82rem; color: #16a34a;
          font-weight: 600; margin: 0;
          direction: rtl; text-align: right;
        }
        .cgai-ctx-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #15803d; font-size: 0.72rem; font-weight: 600;
          padding: 3px 10px; border-radius: 20px; margin-top: 8px;
        }

        /* TYPING */
        .cgai-typing-wrap {
          display: flex; align-items: flex-end; gap: 9px;
        }
        .cgai-typing-bub {
          background: #fff;
          border: 1.5px solid #e2f5e9;
          border-radius: 3px 16px 16px 16px;
          padding: 13px 16px;
          box-shadow: 0 1px 4px rgba(0,0,0,.06);
        }
        .cgai-typing { display: flex; gap: 4px; align-items: center; }
        .cgai-typing span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #4ade80;
          animation: bdot 1.2s ease infinite;
        }
        .cgai-typing span:nth-child(2) { animation-delay:.2s; background:#22c55e; }
        .cgai-typing span:nth-child(3) { animation-delay:.4s; background:#16a34a; }
        @keyframes bdot {
          0%,80%,100% { transform:translateY(0); }
          40%          { transform:translateY(-5px); }
        }

        /* INPUT */
        .cgai-input-area {
          padding: 10px 0 6px; flex-shrink: 0;
          border-top: 1.5px solid #e2f5e9;
        }
        .cgai-input-row {
          display: flex; gap: 10px; align-items: center;
          background: #fff;
          border: 1.5px solid #d1fae5;
          border-radius: 15px;
          padding: 8px 8px 8px 16px;
          box-shadow: 0 2px 10px rgba(21,128,61,.07);
          transition: border-color .18s, box-shadow .18s;
        }
        .cgai-input-row:focus-within {
          border-color: #4ade80;
          box-shadow: 0 2px 16px rgba(21,128,61,.14);
        }
        .cgai-input {
          flex: 1; border: none; outline: none;
          font-size: 0.875rem; color: #111827;
          background: transparent;
          font-family: 'Figtree', sans-serif;
        }
        .cgai-input::placeholder { color: #9ca3af; }
        .cgai-send {
          width: 37px; height: 37px; border-radius: 10px;
          background: linear-gradient(135deg, #15803d, #16a34a);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          color: #fff; flex-shrink: 0;
          box-shadow: 0 2px 7px rgba(21,128,61,.35);
          transition: all .17s ease;
        }
        .cgai-send:hover:not(:disabled) {
          transform: scale(1.07);
          box-shadow: 0 3px 10px rgba(21,128,61,.42);
        }
        .cgai-send:disabled { opacity: .4; cursor: not-allowed; transform: none; }

        /* SUGGESTIONS */
        .cgai-sug { padding: 10px 0 16px; flex-shrink: 0; }
        .cgai-sug-label {
          font-size: 0.66rem; font-weight: 700;
          letter-spacing: .09em; text-transform: uppercase;
          color: #9ca3af; margin-bottom: 8px;
        }
        .cgai-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .cgai-chip {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          color: #15803d; font-size: 0.775rem; font-weight: 500;
          padding: 5px 12px; border-radius: 20px;
          cursor: pointer; font-family: 'Figtree', sans-serif;
          transition: all .15s ease;
        }
        .cgai-chip:hover {
          background: #dcfce7; border-color: #4ade80;
          transform: translateY(-1px);
          box-shadow: 0 2px 7px rgba(21,128,61,.15);
        }
        .cgai-chip-arr { color: #4ade80; flex-shrink: 0; }
      `}</style>

      <div className="cgai-page">

        {/* HEADER */}
        <div className="cgai-header">
          <div className="cgai-hdr-icon">
            <Leaf size={19} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <p className="cgai-hdr-title">AI Agriculture Expert</p>
            <p className="cgai-hdr-sub">Ask anything about farming in Urdu or English</p>
            {crop && disease && (
              <span className="cgai-hdr-ctx">
                <Sprout size={11} /> {crop} — {disease}
              </span>
            )}
          </div>
          <div className="cgai-status">
            <div className="cgai-dot" />
            Online
          </div>
        </div>

        {/* MESSAGES */}
        <div className="cgai-messages">
          <div className="cgai-date">Today</div>

          {messages.map((m, i) => {
            if (m.content === '__welcome__') {
              return (
                <div key={i} className="cgai-row-ai" style={{ display:'flex', alignItems:'flex-end', gap:9 }}>
                  <AIAvatar />
                  {crop && disease
                    ? <ContextCard crop={crop} disease={disease} />
                    : <WelcomeCard />
                  }
                </div>
              );
            }
            return <Message key={i} msg={m} isNew={i === newIdx} />;
          })}

          {loading && (
            <div className="cgai-typing-wrap">
              <AIAvatar />
              <div className="cgai-typing-bub"><TypingDots /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="cgai-input-area">
          <div className="cgai-input-row">
            <input
              ref={inputRef}
              className="cgai-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask in Urdu or English — اردو میں پوچھیں..."
            />
            <button
              className="cgai-send"
              onClick={() => send()}
              disabled={loading || !input.trim()}
            >
              {loading
                ? <Loader2 size={15} className="animate-spin" />
                : <Send size={15} />
              }
            </button>
          </div>
        </div>


      </div>
    </>
  );
}
