import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Shield, Zap, TrendingUp, ChevronDown, ChevronUp,
  ArrowRight, Users, Globe, Lock, BarChart2, Wallet, Clock,
  Star, CheckCircle2, Building2, Rocket, Target, Copy,
  Bitcoin, DollarSign, Activity, ChevronRight
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

const FAQS = [
  { q: 'How long does it take to process a withdrawal?', a: 'Withdrawals are processed within 1 hour to your registered bank account, UPI ID, or crypto wallet — one of the fastest in the industry.' },
  { q: 'What leverage does ECMarket Pro offer?', a: 'We offer leverage up to 1:2000 on major forex pairs, allowing you to maximise your trading power with minimal capital.' },
  { q: 'What are the spreads on ECMarket Pro?', a: 'Our spreads start from 0.0 pips on major pairs like EUR/USD and GBP/USD, giving you the most competitive trading conditions available.' },
  { q: 'Are my funds safe?', a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, completely separate from company operating funds. We are regulated and headquartered in the UAE.' },
  { q: 'What deposit methods are accepted?', a: 'We support UPI, Bank Transfer (NEFT/RTGS/IMPS), and Crypto deposits. All deposits are instant and there are no deposit fees.' },
];

// ─── Live Prices Hook ───────────────────────────────────────────────────────
const BASE_PRICES: Record<string, { price: number; label: string; cat: string }> = {
  'EUR/USD': { price: 1.0921, label: 'Euro / US Dollar', cat: 'forex' },
  'GBP/USD': { price: 1.2748, label: 'British Pound / USD', cat: 'forex' },
  'USD/JPY': { price: 149.82, label: 'US Dollar / Yen', cat: 'forex' },
  'AUD/USD': { price: 0.6542, label: 'Australian Dollar', cat: 'forex' },
  'USD/INR': { price: 83.46, label: 'US Dollar / Rupee', cat: 'forex' },
  'XAU/USD': { price: 2341.5, label: 'Gold / US Dollar', cat: 'commodity' },
  'BTC/USD': { price: 67200, label: 'Bitcoin / USD', cat: 'crypto' },
  'ETH/USD': { price: 3480, label: 'Ethereum / USD', cat: 'crypto' },
  'US30':    { price: 38420, label: 'Dow Jones 30', cat: 'index' },
  'NAS100':  { price: 17850, label: 'NASDAQ 100', cat: 'index' },
};

function useLivePrices() {
  const [prices, setPrices] = useState(() =>
    Object.entries(BASE_PRICES).map(([sym, d]) => ({
      sym, ...d, change: (Math.random() - 0.5) * 0.8, up: Math.random() > 0.5
    }))
  );
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const delta = (Math.random() - 0.49) * 0.3;
        const change = +(p.change + (Math.random() - 0.5) * 0.1).toFixed(2);
        return { ...p, change: Math.max(-5, Math.min(5, change)), up: change >= 0 };
      }));
    }, 2200);
    return () => clearInterval(iv);
  }, []);
  return prices;
}

// ─── Phone Mockup ────────────────────────────────────────────────────────────
function PhoneMockup() {
  const [prices, setPrices] = useState([
    { pair: 'EUR/USD', price: 1.0921, up: true },
    { pair: 'GBP/USD', price: 1.2748, up: false },
    { pair: 'XAU/USD', price: 2341.5, up: true },
    { pair: 'BTC/USD', price: 67200, up: true },
  ]);
  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const d = (Math.random() - 0.48) * p.price * 0.0003;
        return { ...p, price: +(p.price + d).toFixed(p.price > 1000 ? 1 : 4), up: d >= 0 };
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div style={{ width: 240, height: 490, background: '#16213e', borderRadius: 36, border: '7px solid #2a2a4a', boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 72, height: 22, background: '#2a2a4a', borderRadius: '0 0 14px 14px', zIndex: 10 }} />
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(160deg, #0d1b35 0%, #091422 100%)' }}>
        <div style={{ padding: '32px 16px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 9, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>ECMarket Pro</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 8, color: '#4ade80', fontWeight: 800 }}>LIVE</span>
            </div>
          </div>
          <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', margin: '0 0 2px', fontWeight: 600 }}>Portfolio Balance</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0, letterSpacing: -0.5 }}>$12,480.50</p>
          <p style={{ fontSize: 10, color: '#4ade80', fontWeight: 700, margin: '2px 0 0' }}>▲ +$284.20 today</p>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ flex: 1, padding: '10px 12px', overflow: 'hidden' }}>
          <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 800, marginBottom: 8 }}>Live Markets</p>
          {prices.map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '7px 10px', marginBottom: 5 }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, color: '#fff', margin: 0 }}>{p.pair}</p>
                <p style={{ fontSize: 8, color: p.up ? '#4ade80' : '#f87171', fontWeight: 700, margin: 0 }}>{p.up ? '▲' : '▼'}</p>
              </div>
              <p style={{ fontSize: 10, fontWeight: 900, color: '#fff', margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                {p.price.toLocaleString(undefined, { minimumFractionDigits: p.price > 1000 ? 1 : 4, maximumFractionDigits: p.price > 1000 ? 1 : 4 })}
              </p>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px 12px 20px' }}>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 10 }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
            {[{ label: 'Deposit', bg: '#1F77B4' }, { label: 'Trade', bg: '#16A34A' }, { label: 'Withdraw', bg: '#374151' }].map(a => (
              <div key={a.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 12, color: '#fff' }}>{a.label === 'Deposit' ? '↓' : a.label === 'Trade' ? '📈' : '↑'}</span>
                </div>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Counter ─────────────────────────────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '', decimals = 0 }: { end: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    let start: number | null = null;
    const step = (ts: number) => { if (!start) start = ts; const p = Math.min((ts - start) / 1800, 1); setVal(+(p * end).toFixed(decimals)); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }, [started, end, decimals]);
  return <span ref={ref}>{prefix}{decimals ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>;
}

// ─── FAN CARDS (Lemonn arc style) ────────────────────────────────────────────
const FAN_FEATURES = [
  { icon: '💱', title: 'Forex Trading', desc: '80+ currency pairs, 0.0 pip spreads', color: '#1F77B4' },
  { icon: '₿', title: 'Crypto CFDs', desc: 'BTC, ETH & top 30 coins 24/7', color: '#F7931A' },
  { icon: '🥇', title: 'Gold & Silver', desc: 'XAU/USD with lowest spreads', color: '#D97706' },
  { icon: '📊', title: 'Index CFDs', desc: 'US30, NAS100, UK100 & more', color: '#16A34A' },
  { icon: '⚡', title: 'Binary Options', desc: 'High/Low trades, 95% payout', color: '#7C3AED' },
  { icon: '👥', title: 'Copy Trading', desc: 'Copy top traders automatically', color: '#0891B2' },
  { icon: '🤖', title: 'Algo Trading', desc: 'Run your EAs with MT4 support', color: '#DC2626' },
];

// x offset, rotation, y-lift, scale for each of 7 cards
const FAN_CFG = [
  { x: -270, rot: -32, y: 60, s: 0.80 },
  { x: -180, rot: -20, y: 28, s: 0.88 },
  { x:  -90, rot: -10, y:  8, s: 0.94 },
  { x:    0, rot:   0, y:  0, s: 1.00 },
  { x:   90, rot:  10, y:  8, s: 0.94 },
  { x:  180, rot:  20, y: 28, s: 0.88 },
  { x:  270, rot:  32, y: 60, s: 0.80 },
];

function FanCards() {
  const [active, setActive] = useState(3);
  return (
    <div style={{ position: 'relative', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'visible' }}>
      {FAN_FEATURES.map((f, i) => {
        const cfg = FAN_CFG[i];
        const isActive = active === i;
        return (
          <div
            key={i}
            onClick={() => setActive(i)}
            style={{
              position: 'absolute',
              bottom: 0,
              left: '50%',
              width: 130,
              height: 185,
              marginLeft: -65,
              borderRadius: 20,
              background: isActive ? f.color : '#fff',
              border: isActive ? 'none' : '1.5px solid #e0e0e0',
              boxShadow: isActive ? `0 16px 48px ${f.color}60` : '0 4px 18px rgba(0,0,0,0.09)',
              transform: `translateX(${cfg.x}px) translateY(${cfg.y}px) rotate(${cfg.rot}deg) scale(${isActive ? cfg.s * 1.1 : cfg.s})`,
              transformOrigin: 'bottom center',
              cursor: 'pointer',
              transition: 'all 0.38s cubic-bezier(0.34,1.4,0.64,1)',
              zIndex: isActive ? 30 : 10 - Math.abs(i - 3),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '14px 10px',
              userSelect: 'none',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 10 }}>{f.icon}</div>
            <p style={{ fontSize: 11, fontWeight: 900, color: isActive ? '#fff' : '#121319', textAlign: 'center', margin: '0 0 5px', lineHeight: 1.3 }}>{f.title}</p>
            <p style={{ fontSize: 9.5, color: isActive ? 'rgba(255,255,255,0.8)' : '#9CA3AF', textAlign: 'center', margin: 0, lineHeight: 1.4 }}>{f.desc}</p>
          </div>
        );
      })}
    </div>
  );
}

// ─── INSTRUMENT PERSPECTIVE STACK ─────────────────────────────────────────────
const INSTRUMENT_CARDS = [
  { sym: 'EUR/USD', ret: '+0.12%', desc: 'Moved +0.12% in last 24h', up: true, cat: 'Forex' },
  { sym: 'XAU/USD', ret: '+0.82%', desc: 'Gold hits weekly high', up: true, cat: 'Gold' },
  { sym: 'BTC/USD', ret: '+1.24%', desc: 'Bitcoin breaks resistance', up: true, cat: 'Crypto' },
  { sym: 'GBP/USD', ret: '-0.08%', desc: 'Pound under pressure', up: false, cat: 'Forex' },
  { sym: 'NAS100',  ret: '+0.54%', desc: 'Tech stocks rally', up: true, cat: 'Index' },
];

function PerspectiveStack() {
  const [activeIdx, setActiveIdx] = useState(2);
  const offsets = [-2, -1, 0, 1, 2];
  return (
    <div className="relative flex justify-center items-center" style={{ height: 320 }}>
      {INSTRUMENT_CARDS.map((card, i) => {
        const offset = i - activeIdx;
        const absOffset = Math.abs(offset);
        return (
          <motion.div
            key={i}
            onClick={() => setActiveIdx(i)}
            style={{
              position: 'absolute',
              width: 220,
              background: i === activeIdx ? '#1F77B4' : '#fff',
              border: i === activeIdx ? 'none' : '1px solid #e8e8e8',
              borderRadius: 20,
              padding: 24,
              boxShadow: i === activeIdx ? '0 20px 50px rgba(31,119,180,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
              transform: `translateX(${offset * 110}px) scale(${1 - absOffset * 0.08}) translateZ(0)`,
              zIndex: INSTRUMENT_CARDS.length - absOffset,
              cursor: 'pointer',
              opacity: absOffset > 2 ? 0 : 1 - absOffset * 0.15,
              transition: 'all 0.4s cubic-bezier(0.34,1.3,0.64,1)',
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: i === activeIdx ? 'rgba(255,255,255,0.6)' : '#6B7280', textTransform: 'uppercase', letterSpacing: 1 }}>{card.cat}</span>
                <p style={{ fontSize: 18, fontWeight: 900, color: i === activeIdx ? '#fff' : '#121319', margin: '2px 0 0' }}>{card.sym}</p>
              </div>
              <span style={{ fontSize: 13, fontWeight: 800, color: card.up ? '#4ade80' : '#f87171', background: card.up ? 'rgba(74,222,128,0.15)' : 'rgba(248,113,113,0.15)', padding: '3px 8px', borderRadius: 8 }}>{card.ret}</span>
            </div>
            <p style={{ fontSize: 11, color: i === activeIdx ? 'rgba(255,255,255,0.7)' : '#9CA3AF', margin: '0 0 16px' }}>{card.desc}</p>
            <div style={{ height: 40, display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              {[35,52,44,62,55,70,62,78,68,85].map((h, j) => (
                <div key={j} style={{ flex: 1, borderRadius: 3, height: `${h}%`, background: card.up ? (i === activeIdx ? 'rgba(255,255,255,0.4)' : 'rgba(74,222,128,0.5)') : 'rgba(248,113,113,0.4)' }} />
              ))}
            </div>
            <button style={{ width: '100%', marginTop: 14, padding: '8px 0', borderRadius: 10, border: 'none', background: i === activeIdx ? 'rgba(255,255,255,0.2)' : 'rgba(31,119,180,0.08)', color: i === activeIdx ? '#fff' : '#1F77B4', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
              Trade Now →
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── LIVE MARKET TABS ─────────────────────────────────────────────────────────
const TABS = ['Forex', 'Crypto', 'Indices', 'Commodities'];
const MARKET_DATA: Record<string, Array<{ sym: string; price: string; change: string; up: boolean }>> = {
  Forex:       [{ sym:'EUR/USD',price:'1.0921',change:'+0.12%',up:true},{ sym:'GBP/USD',price:'1.2748',change:'-0.08%',up:false},{ sym:'USD/JPY',price:'149.82',change:'+0.22%',up:true},{ sym:'AUD/USD',price:'0.6542',change:'-0.14%',up:false},{ sym:'USD/INR',price:'83.46',change:'+0.04%',up:true},{ sym:'EUR/GBP',price:'0.8563',change:'+0.09%',up:true}],
  Crypto:      [{ sym:'BTC/USD',price:'67,200',change:'+1.24%',up:true},{ sym:'ETH/USD',price:'3,480',change:'+0.87%',up:true},{ sym:'BNB/USD',price:'412',change:'-0.32%',up:false},{ sym:'XRP/USD',price:'0.6120',change:'+2.1%',up:true},{ sym:'SOL/USD',price:'178',change:'+1.8%',up:true},{ sym:'ADA/USD',price:'0.455',change:'-0.9%',up:false}],
  Indices:     [{ sym:'US30',price:'38,420',change:'+0.45%',up:true},{ sym:'NAS100',price:'17,850',change:'+0.62%',up:true},{ sym:'SPX500',price:'5,210',change:'+0.38%',up:true},{ sym:'UK100',price:'8,120',change:'-0.12%',up:false},{ sym:'GER40',price:'18,340',change:'+0.28%',up:true},{ sym:'JPN225',price:'38,800',change:'-0.44%',up:false}],
  Commodities: [{ sym:'XAU/USD',price:'2,341',change:'+0.82%',up:true},{ sym:'XAG/USD',price:'27.45',change:'+1.1%',up:true},{ sym:'WTI OIL',price:'81.20',change:'-0.38%',up:false},{ sym:'BRENT',price:'85.40',change:'-0.21%',up:false},{ sym:'NAT GAS',price:'2.185',change:'+0.9%',up:true},{ sym:'COPPER',price:'4.42',change:'+0.5%',up:true}],
};

function LiveMarketTabs() {
  const [tab, setTab] = useState('Forex');
  const items = MARKET_DATA[tab];
  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 20px', borderRadius: 999, border: 'none', fontWeight: 800, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s', background: tab === t ? '#121319' : '#f0f0f0', color: tab === t ? '#fff' : '#374151' }}>
            {t}
          </button>
        ))}
      </div>

      {/* Gainers / Movers split */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#16A34A', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} /> Top Gainers
          </p>
          {items.filter(i => i.up).slice(0, 3).map(item => (
            <div key={item.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#fff', borderRadius: 12, marginBottom: 6, border: '1px solid #e8e8e8' }}>
              <div>
                <p style={{ fontWeight: 800, color: '#121319', margin: 0, fontSize: 13 }}>{item.sym}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{item.sym.includes('/') ? item.sym.split('/')[1] + ' pair' : 'Index'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, color: '#121319', margin: 0, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{item.price}</p>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', background: 'rgba(22,163,74,0.1)', padding: '1px 6px', borderRadius: 6 }}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 800, color: '#DC2626', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrendingUp size={15} style={{ transform: 'scaleY(-1)' }} /> Top Movers
          </p>
          {items.filter(i => !i.up).slice(0, 3).map(item => (
            <div key={item.sym} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#fff', borderRadius: 12, marginBottom: 6, border: '1px solid #e8e8e8' }}>
              <div>
                <p style={{ fontWeight: 800, color: '#121319', margin: 0, fontSize: 13 }}>{item.sym}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{item.sym.includes('/') ? item.sym.split('/')[1] + ' pair' : 'Index'}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: 900, color: '#121319', margin: 0, fontSize: 14, fontVariantNumeric: 'tabular-nums' }}>{item.price}</p>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#DC2626', background: 'rgba(220,38,38,0.1)', padding: '1px 6px', borderRadius: 6 }}>{item.change}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-6">
        <Link href="/markets">
          <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 28px', borderRadius: 999, border: '2px solid #121319', background: 'transparent', color: '#121319', fontWeight: 800, fontSize: 13, cursor: 'pointer', textDecoration: 'none' }}>
            View All Instruments <ArrowRight size={14} />
          </a>
        </Link>
      </div>
    </div>
  );
}

// ─── PROFIT CALCULATOR ────────────────────────────────────────────────────────
function ProfitCalculator() {
  const [investment, setInvestment] = useState(10000);
  const [leverage, setLeverage] = useState(100);
  const [move, setMove] = useState(1);
  const profit = +(investment * (leverage / 100) * (move / 100)).toFixed(2);
  const roi = +((profit / investment) * 100).toFixed(1);

  return (
    <div style={{ background: '#111827', borderRadius: 24, padding: 28 }}>
      <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Profit Calculator</p>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Investment Amount</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>₹{investment.toLocaleString()}</span>
        </div>
        <input type="range" min={1000} max={500000} step={1000} value={investment} onChange={e => setInvestment(+e.target.value)}
          style={{ width: '100%', accentColor: '#1F77B4', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>₹1K</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>₹5L</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Leverage</span>
          <span style={{ fontSize: 13, color: '#1F77B4', fontWeight: 800 }}>1:{leverage}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {[10, 50, 100, 500, 1000, 2000].map(l => (
            <button key={l} onClick={() => setLeverage(l)}
              style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: leverage === l ? '#1F77B4' : 'rgba(255,255,255,0.08)', color: leverage === l ? '#fff' : 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}>
              1:{l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>Market Move</span>
          <span style={{ fontSize: 13, color: '#fff', fontWeight: 800 }}>{move}%</span>
        </div>
        <input type="range" min={0.1} max={10} step={0.1} value={move} onChange={e => setMove(+e.target.value)}
          style={{ width: '100%', accentColor: '#16A34A', cursor: 'pointer' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>0.1%</span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>10%</span>
        </div>
      </div>

      <div style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>Estimated Profit</p>
          <p style={{ fontSize: 26, fontWeight: 900, color: '#4ade80', margin: 0 }}>₹{profit.toLocaleString()}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: '0 0 4px' }}>ROI</p>
          <p style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', margin: 0 }}>{roi}%</p>
        </div>
      </div>
      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 10, textAlign: 'center' }}>* Illustrative only. Past performance ≠ future results.</p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  return (
    <PublicLayout>

      {/* ══════════════════════════════════════════
          §1 HERO — Centered Phone Mockup
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', position: 'relative', overflow: 'hidden' }}>

        {/* Decorative curves */}
        <svg style={{ position: 'absolute', left: 0, top: '30%', width: 220, opacity: 0.15, pointerEvents: 'none' }} viewBox="0 0 200 300" fill="none">
          <path d="M180 20 Q20 80 160 160 Q20 200 140 280" stroke="#1F77B4" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>
        <svg style={{ position: 'absolute', right: 0, top: '20%', width: 220, opacity: 0.15, pointerEvents: 'none' }} viewBox="0 0 200 300" fill="none">
          <path d="M20 20 Q180 80 40 160 Q180 200 60 280" stroke="#1F77B4" strokeWidth="3.5" strokeLinecap="round"/>
        </svg>

        {/* Headline */}
        <motion.div initial="hidden" animate="visible" variants={stagger} style={{ textAlign: 'center', padding: '36px 16px 24px', position: 'relative', zIndex: 1 }}>
          <motion.div variants={fadeUp} style={{ marginBottom: 16 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', background: 'rgba(31,119,180,0.1)', border: '1px solid rgba(31,119,180,0.2)', color: '#1F77B4' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#1F77B4', display: 'inline-block', boxShadow: '0 0 0 3px rgba(31,119,180,0.25)' }} />
              UAE Regulated Forex Broker
            </span>
          </motion.div>
          <motion.h1 variants={fadeUp} style={{ fontSize: 'clamp(36px, 6vw, 68px)', fontWeight: 900, color: '#121319', lineHeight: 1.05, letterSpacing: -1, marginBottom: 16 }}>
            Trade Forex,<br />
            <span style={{ background: 'linear-gradient(90deg, #1F77B4 0%, #16A34A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Crypto & More.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ fontSize: 17, color: '#6B7280', maxWidth: 480, margin: '0 auto 24px', lineHeight: 1.7 }}>
            Access <strong style={{ color: '#1F77B4' }}>200+ global markets</strong> with leverage up to <strong style={{ color: '#1F77B4' }}>1:2000</strong>,
            spreads from <strong style={{ color: '#1F77B4' }}>0.0 pips</strong> & <strong style={{ color: '#1F77B4' }}>1-hour withdrawals</strong>.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(31,119,180,0.35)' }}>
                Open Free Account <ArrowRight size={16} />
              </a>
            </Link>
            <Link href="/markets">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: '#fff', border: '1px solid #e8e8e8', color: '#374151', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                View Markets
              </a>
            </Link>
          </motion.div>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['Spreads from 0.0 pips','Leverage up to 1:2000','Withdraw in 1 hour'].map(t => (
              <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280' }}>
                <CheckCircle2 size={14} color="#1F77B4" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Phone + badges */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', minHeight: 520, padding: '0 16px' }}>
          {/* Left badges */}
          <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ position: 'absolute', left: '4%', top: 40, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 28px rgba(0,0,0,0.1)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color="#1F77B4" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 900, color: '#121319', margin: 0 }}>UAE REGULATED</p>
                <p style={{ fontSize: 10, color: '#6B7280', margin: 0 }}>Licensed Broker</p>
              </div>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0,-8,0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{ position: 'absolute', left: '3%', bottom: 80, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 28px rgba(0,0,0,0.1)', zIndex: 20 }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 2px', fontWeight: 600 }}>Max Leverage</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#1F77B4', margin: 0 }}>1:2000</p>
          </motion.div>

          {/* Right badges */}
          <motion.div animate={{ y: [0,12,0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            style={{ position: 'absolute', right: '4%', top: 50, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 28px rgba(0,0,0,0.1)', zIndex: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={18} color="#16A34A" />
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 900, color: '#121319', margin: 0 }}>256-BIT SSL</p>
                <p style={{ fontSize: 10, color: '#6B7280', margin: 0 }}>Encrypted</p>
              </div>
            </div>
          </motion.div>

          <motion.div animate={{ y: [0,10,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            style={{ position: 'absolute', right: '3%', bottom: 80, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 18, padding: '12px 16px', boxShadow: '0 8px 28px rgba(0,0,0,0.1)', zIndex: 20 }}>
            <p style={{ fontSize: 10, color: '#6B7280', margin: '0 0 2px', fontWeight: 600 }}>Withdrawal</p>
            <p style={{ fontSize: 20, fontWeight: 900, color: '#16A34A', margin: 0 }}>≤ 1 Hour</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} style={{ position: 'relative', zIndex: 10 }}>
            <PhoneMockup />
          </motion.div>
          <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 280, height: 40, background: 'rgba(31,119,180,0.12)', filter: 'blur(28px)', borderRadius: '50%', pointerEvents: 'none' }} />
        </div>

        {/* Trust strip */}
        <div style={{ background: '#fff', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '14px 16px', display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {[{ icon:'⭐', label:'4.8/5 Rating', sub:'10,000+ reviews' },{ icon:'👥', label:'10 Lakh+ Traders', sub:'Worldwide' },{ icon:'🏛️', label:'UAE Regulated', sub:'Licensed broker' },{ icon:'🔒', label:'Segregated Funds', sub:'Tier-1 banks' },{ icon:'⚡', label:'Since 2018', sub:'7+ years' }].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#121319', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §1.5 DASHBOARD MOCKUP
      ══════════════════════════════════════════ */}
      <section style={{ background: 'linear-gradient(180deg, #0B1929 0%, #0d2035 100%)', padding: '80px 16px', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', top: -100, left: '20%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(31,119,180,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -100, right: '15%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 800, color: '#1F77B4', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Professional Platform</motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>A Dashboard Built for<br/>Serious Traders</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 460, margin: '0 auto', fontSize: 15 }}>Monitor all your positions, analyse markets, and manage your portfolio — all in one place.</motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 50, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.4)' }}>
            {/* Browser bar */}
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#DC2626','#F7931A','#16A34A'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />)}
              </div>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.06)', borderRadius: 6, padding: '4px 12px', fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>app.ecmarketpro.in/dashboard</div>
            </div>
            <div style={{ display: 'flex', minHeight: 340 }}>
              {/* Mini sidebar */}
              <div style={{ width: 52, background: 'rgba(11,25,41,0.8)', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: 18 }}>
                {[BarChart2, TrendingUp, Wallet, Globe, Shield].map((Icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: 10, background: i === 0 ? 'rgba(31,119,180,0.2)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={15} color={i === 0 ? '#1F77B4' : 'rgba(255,255,255,0.2)'} />
                  </div>
                ))}
              </div>
              {/* Main content */}
              <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
                  {[{ label:'Portfolio Balance', val:'$12,480.50', color:'#fff', sub:'+$284.20 today' },{ label:"Today's P&L", val:'+$284.20', color:'#16A34A', sub:'+2.33%' },{ label:'Open Positions', val:'3', color:'#fff', sub:'Active' },{ label:'Free Margin', val:'$8,240', color:'#fff', sub:'Available' }].map((s,i) => (
                    <div key={i} style={{ background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'10px 12px', border:'1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ fontSize:9, color:'rgba(255,255,255,0.35)', margin:'0 0 3px', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</p>
                      <p style={{ fontSize:14, fontWeight:900, color:s.color, margin:'0 0 2px' }}>{s.val}</p>
                      <span style={{ fontSize:9, color:'#16A34A', fontWeight:700 }}>{s.sub}</span>
                    </div>
                  ))}
                </div>
                {/* Chart */}
                <div style={{ flex:1, background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', padding:'12px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <div style={{ display:'flex', gap:6 }}>
                      {['EUR/USD','BTC/USD','XAU/USD'].map((p,i) => <span key={p} style={{ fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, background:i===0?'rgba(31,119,180,0.2)':'transparent', color:i===0?'#1F77B4':'rgba(255,255,255,0.25)' }}>{p}</span>)}
                    </div>
                    <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)' }}>1H · 4H · 1D</span>
                  </div>
                  <svg viewBox="0 0 500 90" style={{ width:'100%', height:80 }}>
                    <defs>
                      <linearGradient id="cg1" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1F77B4" stopOpacity="0.25"/>
                        <stop offset="100%" stopColor="#1F77B4" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <path d="M0,70 C30,65 50,72 80,55 C110,38 130,58 160,42 C190,26 210,35 250,22 C290,9 310,18 350,12 C390,6 430,15 500,5" fill="none" stroke="#1F77B4" strokeWidth="2.5"/>
                    <path d="M0,70 C30,65 50,72 80,55 C110,38 130,58 160,42 C190,26 210,35 250,22 C290,9 310,18 350,12 C390,6 430,15 500,5 L500,90 L0,90 Z" fill="url(#cg1)"/>
                    <circle cx="500" cy="5" r="4" fill="#1F77B4"/>
                  </svg>
                </div>
                {/* Positions table */}
                <div style={{ background:'rgba(255,255,255,0.02)', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)', overflow:'hidden' }}>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 60px 60px 80px 70px', padding:'7px 12px', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    {['Instrument','Type','Lot','Open Price','P&L'].map(h => <span key={h} style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.22)', textTransform:'uppercase', letterSpacing:0.5 }}>{h}</span>)}
                  </div>
                  {[{ inst:'EUR/USD', type:'BUY', lot:'0.50', price:'1.09215', pnl:'+$127.40', pos:true },{ inst:'XAU/USD', type:'BUY', lot:'0.10', price:'2341.50', pnl:'+$84.00', pos:true },{ inst:'BTC/USD', type:'SELL', lot:'0.01', price:'67200', pnl:'-$28.80', pos:false }].map((row,i) => (
                    <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 60px 60px 80px 70px', padding:'7px 12px', borderBottom:i<2?'1px solid rgba(255,255,255,0.03)':'none', alignItems:'center' }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#fff' }}>{row.inst}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:row.type==='BUY'?'#16A34A':'#DC2626', background:row.type==='BUY'?'rgba(22,163,74,0.12)':'rgba(220,38,38,0.12)', padding:'2px 6px', borderRadius:4, width:'fit-content' }}>{row.type}</span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{row.lot}</span>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.35)' }}>{row.price}</span>
                      <span style={{ fontSize:11, fontWeight:700, color:row.pos?'#16A34A':'#DC2626' }}>{row.pnl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §2 FAN CARDS — "Make Your Next Trade"
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px 60px' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 56 }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>
            Make Your Next Trade
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 480, margin: '0 auto' }}>
            Access Pro Tools for Every Strategy
          </motion.p>
        </motion.div>

        <FanCards />

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Link href="/auth/register">
            <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 30px', borderRadius: 999, background: '#121319', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
              See All Features <ArrowRight size={15} />
            </a>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §2.5 FEATURE CARDS — Why Choose Us
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Why Traders Choose ECMarket Pro</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 460, margin: '0 auto' }}>Built for the modern trader — fast, reliable, and fully transparent.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
            {[
              { icon: <Zap size={24}/>, color:'#1F77B4', bg:'rgba(31,119,180,0.08)', title:'Zero Commission', desc:'Trade all 200+ instruments with zero commission. Keep 100% of your profits every time.' },
              { icon: <TrendingUp size={24}/>, color:'#16A34A', bg:'rgba(22,163,74,0.08)', title:'1:2000 Leverage', desc:'Maximise your trading power with up to 1:2000 leverage on major forex pairs.' },
              { icon: <Clock size={24}/>, color:'#7C3AED', bg:'rgba(124,58,237,0.08)', title:'1-Hour Withdrawals', desc:'Instant withdrawals to bank, UPI, or crypto wallet — processed in under 60 minutes.' },
              { icon: <Copy size={24}/>, color:'#F7931A', bg:'rgba(247,147,26,0.08)', title:'Copy Trading', desc:'Mirror top-performing traders automatically. Earn while you learn, with zero manual effort.' },
              { icon: <Activity size={24}/>, color:'#DC2626', bg:'rgba(220,38,38,0.08)', title:'Free Trading Signals', desc:'Get daily professional signals with entry, TP, and SL — completely free for all users.' },
              { icon: <Shield size={24}/>, color:'#0891B2', bg:'rgba(8,145,178,0.08)', title:'Bank-Grade Security', desc:'256-bit SSL encryption. Funds held in segregated tier-1 bank accounts — always safe.' },
            ].map((f,i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y:-5, boxShadow:'0 16px 40px rgba(0,0,0,0.10)' }}
                style={{ background:'#fff', borderRadius:22, padding:28, border:'1px solid #E5E7EB', boxShadow:'0 2px 12px rgba(0,0,0,0.04)', transition:'all 0.25s' }}>
                <div style={{ width:52, height:52, borderRadius:16, background:f.bg, display:'flex', alignItems:'center', justifyContent:'center', color:f.color, marginBottom:16 }}>{f.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#121319', marginBottom:8 }}>{f.title}</h3>
                <p style={{ fontSize:13, color:'#6B7280', lineHeight:1.7, margin:0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §3 PREMIUM ACCOUNT BANNER
      ══════════════════════════════════════════ */}
      <section style={{ padding: '24px 16px 60px', background: '#F5F5F5' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
            style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 60%, #E0F2FE 100%)', borderRadius: 28, padding: '40px 36px', display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'center', position: 'relative', overflow: 'hidden', border: '1px solid rgba(31,119,180,0.15)' }}>

            {/* Decorative glow */}
            <div style={{ position: 'absolute', right: -40, top: -40, width: 250, height: 250, borderRadius: '50%', background: 'rgba(31,119,180,0.12)', filter: 'blur(40px)', pointerEvents: 'none' }} />

            {/* Left text */}
            <div style={{ flex: '1 1 280px', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(31,119,180,0.12)', borderRadius: 8, padding: '4px 10px', marginBottom: 14 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: '#1F77B4', letterSpacing: 1, textTransform: 'uppercase' }}>ECMarket Pro Elite</span>
              </div>
              <h2 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 900, color: '#121319', marginBottom: 10, lineHeight: 1.2 }}>
                Premium Trading with<br />Zero Extra Fees
              </h2>
              <p style={{ fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 1.7 }}>
                Unlock elite trading conditions. Enjoy spreads from 0.0 pips, leverage up to 1:2000, priority withdrawals &amp; dedicated account manager.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
                {[{ icon: '✓', text: 'Zero Commission on all trades' }, { icon: '✓', text: 'Priority 1-hour withdrawal' }, { icon: '✓', text: 'Dedicated account manager' }, { icon: '✓', text: 'Exclusive market signals' }].map(f => (
                  <div key={f.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151', fontWeight: 600 }}>
                    <span style={{ color: '#1F77B4', fontWeight: 900 }}>{f.icon}</span> {f.text}
                  </div>
                ))}
              </div>
              <Link href="/auth/register">
                <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 999, background: '#121319', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                  Open Elite Account →
                </a>
              </Link>
            </div>

            {/* Right phone */}
            <div style={{ flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 10, position: 'relative', zIndex: 1 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(31,119,180,0.15)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(31,119,180,0.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={16} color="#1F77B4" />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>Spreads from</p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: '#1F77B4', margin: 0 }}>0.0 pips</p>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(31,119,180,0.15)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(31,119,180,0.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <TrendingUp size={16} color="#16A34A" />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>Max Leverage</p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: '#16A34A', margin: 0 }}>1:2000</p>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(31,119,180,0.15)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(31,119,180,0.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(31,119,180,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#1F77B4" />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>Active traders</p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: '#1F77B4', margin: 0 }}>10 Lakh+</p>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: 16, padding: '12px 16px', border: '1px solid rgba(31,119,180,0.15)', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 4px 14px rgba(31,119,180,0.12)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={16} color="#7C3AED" />
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#9CA3AF', margin: 0 }}>Instruments</p>
                  <p style={{ fontSize: 15, fontWeight: 900, color: '#7C3AED', margin: 0 }}>200+</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §4 BEST INSTRUMENTS — Perspective Stack
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '70px 16px' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 20 }}>
          <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>
            Best Performing Instruments
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 480, margin: '0 auto 8px' }}>
            Trade 200+ instruments with real-time prices and one-click execution
          </motion.p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 8 }}>
            {[{ icon:'📈', label:'Free Signals' },{ icon:'⚡', label:'Instant Execution' },{ icon:'🏆', label:'Top Accuracy' }].map(b => (
              <span key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#374151', fontWeight: 700 }}>
                {b.icon} {b.label}
              </span>
            ))}
          </div>
        </motion.div>
        <PerspectiveStack />
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link href="/markets">
            <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '11px 26px', borderRadius: 999, border: '2px solid #121319', background: 'transparent', color: '#121319', fontWeight: 800, fontSize: 13, textDecoration: 'none' }}>
              Check All Instruments →
            </a>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §4.5 ACCOUNT PRICING CARDS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Choose Your Account Type</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Select the account that fits your trading style and experience level.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20, alignItems: 'start' }}>
            {[
              { name:'Standard', badge:null, popular:false, minDeposit:'$100', leverage:'1:500', spread:'From 1.0 pip', commission:'Zero', withdrawal:'24 hours', color:'#374151', textColor:'#121319', bg:'#fff', border:'#E5E7EB', featureColor:'#374151', features:['200+ instruments','Free education','Email support','Demo account','Basic signals'], cta:'Open Standard Account' },
              { name:'Pro', badge:'MOST POPULAR', popular:true, minDeposit:'$500', leverage:'1:1000', spread:'From 0.2 pip', commission:'Zero', withdrawal:'4 hours', color:'#1F77B4', textColor:'#fff', bg:'linear-gradient(135deg,#0B1929 0%,#0d2035 100%)', border:'#1F77B4', featureColor:'rgba(255,255,255,0.75)', features:['200+ instruments','Priority support','Copy trading','Advanced signals','Dedicated manager'], cta:'Open Pro Account' },
              { name:'Elite', badge:null, popular:false, minDeposit:'$5,000', leverage:'1:2000', spread:'From 0.0 pip', commission:'Zero', withdrawal:'≤1 hour', color:'#F7931A', textColor:'#121319', bg:'#fff', border:'#E5E7EB', featureColor:'#374151', features:['200+ instruments','24/7 VIP support','Copy trading','Premium signals','Dedicated manager','Custom leverage'], cta:'Open Elite Account' },
            ].map((plan,i) => (
              <motion.div key={i} variants={fadeUp}
                style={{ borderRadius:24, padding:28, border:`1px solid ${plan.popular ? plan.color : plan.border}`, background:plan.bg, position:'relative', overflow:'hidden', boxShadow:plan.popular?`0 0 0 3px rgba(31,119,180,0.12), 0 24px 60px rgba(0,0,0,0.15)`:'0 2px 14px rgba(0,0,0,0.04)' }}>
                {plan.popular && <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg,#1F77B4,#16A34A)' }} />}
                {plan.badge && <div style={{ display:'inline-flex', marginBottom:12, padding:'3px 10px', borderRadius:8, background:'rgba(31,119,180,0.15)', fontSize:9, fontWeight:800, color:'#1F77B4', letterSpacing:1.5, textTransform:'uppercase' }}>{plan.badge}</div>}
                <h3 style={{ fontSize:24, fontWeight:900, color:plan.textColor, marginBottom:4 }}>{plan.name}</h3>
                <p style={{ fontSize:12, color:plan.popular?'rgba(255,255,255,0.45)':'#9CA3AF', marginBottom:20 }}>Min. Deposit: <strong style={{ color:plan.color }}>{plan.minDeposit}</strong></p>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:24 }}>
                  {[{label:'Leverage',val:plan.leverage},{label:'Spread',val:plan.spread},{label:'Commission',val:plan.commission},{label:'Withdrawal',val:plan.withdrawal}].map(s => (
                    <div key={s.label} style={{ background:plan.popular?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.02)', borderRadius:10, padding:'8px 10px', border:`1px solid ${plan.popular?'rgba(255,255,255,0.07)':'#F3F4F6'}` }}>
                      <p style={{ fontSize:9, color:plan.popular?'rgba(255,255,255,0.3)':'#9CA3AF', margin:'0 0 2px', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{s.label}</p>
                      <p style={{ fontSize:12, fontWeight:800, color:plan.textColor, margin:0 }}>{s.val}</p>
                    </div>
                  ))}
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:24 }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:plan.featureColor }}>
                      <CheckCircle2 size={14} color={plan.popular?'#16A34A':plan.color} />{f}
                    </div>
                  ))}
                </div>
                <Link href="/auth/register">
                  <a style={{ display:'block', textAlign:'center', padding:'12px 24px', borderRadius:999, background:plan.popular?'#1F77B4':'transparent', border:`2px solid ${plan.popular?'transparent':plan.color}`, color:plan.popular?'#fff':plan.color, fontWeight:800, fontSize:14, textDecoration:'none', boxShadow:plan.popular?'0 8px 24px rgba(31,119,180,0.4)':'none' }}>{plan.cta}</a>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §5 LIVE MARKET TABS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '70px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 36 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>
              What's Hot Today
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280' }}>Live prices across all major asset classes</motion.p>
          </motion.div>
          <LiveMarketTabs />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §6 DARK — Profit Calculator
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0B1929', padding: '70px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 40, alignItems: 'center' }}>
            {/* Left */}
            <div style={{ flex: '1 1 280px' }}>
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Discover Your Potential</p>
                <h2 style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', lineHeight: 1.15, marginBottom: 16 }}>
                  Calculate Your<br />Profit Potential
                </h2>
                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, marginBottom: 28 }}>
                  Use our leverage calculator to estimate your potential returns with ECMarket Pro's 1:2000 leverage and 0.0 pip spreads — with 100% accuracy and clarity.
                </p>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[{ val: '200+', label: 'Instruments' }, { val: '1:2000', label: 'Max Leverage' }, { val: '0.0', label: 'Min Spread' }, { val: '<1 Hr', label: 'Withdrawal' }].map(s => (
                    <div key={s.label} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <p style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 2px' }}>{s.val}</p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600 }}>{s.label}</p>
                    </div>
                  ))}
                </div>

                <Link href="/auth/register" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 28, padding: '12px 26px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 8px 24px rgba(31,119,180,0.35)' }}>
                  Start Trading Now →
                </Link>
              </motion.div>
            </div>
            {/* Right — Calculator */}
            <div style={{ flex: '1 1 300px' }}>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <ProfitCalculator />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §7 TESTIMONIALS — Horizontal scroll
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '70px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 16px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 40 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>
              Trusted by a New Generation<br/>of Traders
            </motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280' }}>Real results from real clients across India.</motion.p>
          </motion.div>
        </div>

        {/* Auto-scrolling testimonials */}
        <style>{`
          @keyframes scroll-reviews {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .reviews-track {
            display: flex;
            gap: 16px;
            width: max-content;
            animation: scroll-reviews 30s linear infinite;
          }
          .reviews-track:hover { animation-play-state: paused; }
        `}</style>
        <div style={{ overflow: 'hidden', paddingBottom: 8 }}>
          <div className="reviews-track">
            {[
              { name: 'Rahul Sharma', city: 'Mumbai', initials: 'RS', color: '#1F77B4', ret: '+38%', months: 4, text: 'This platform completely changed my trading journey. Fund once and the platform handles everything automatically. Withdrawals arrive within 1 hour every single time.' },
              { name: 'Priya Nair', city: 'Bangalore', initials: 'PN', color: '#16A34A', ret: '+52%', months: 6, text: 'The withdrawal process is incredibly smooth and fast. My funds arrived in under an hour with zero issues. ECMarket Pro is genuinely the best forex platform for Indian traders.' },
              { name: 'Amit Verma', city: 'Delhi', initials: 'AV', color: '#7C3AED', ret: '+29%', months: 3, text: 'Best decision I ever made was joining ECMarket Pro. A truly transparent and professional platform. Spreads are genuinely 0.0 pips — I verified it myself live.' },
              { name: 'Suresh Kumar', city: 'Hyderabad', initials: 'SK', color: '#DC2626', ret: '+41%', months: 5, text: 'The copy trading feature made investing so simple. Just follow successful traders and mirror their trades automatically. Absolutely fantastic platform with great results!' },
              { name: 'Anjali Singh', city: 'Chennai', initials: 'AS', color: '#F7931A', ret: '+33%', months: 4, text: 'KYC was completed in under 10 minutes — super fast! The support team is available 24/7 and always responds quickly. Highly recommended for every serious trader.' },
              { name: 'Vikram Reddy', city: 'Pune', initials: 'VR', color: '#0891B2', ret: '+45%', months: 5, text: 'Incredible platform with real institutional spreads. The leverage options up to 1:2000 give you real trading power. Customer service is responsive and professional.' },
              { name: 'Deepa Menon', city: 'Kochi', initials: 'DM', color: '#16A34A', ret: '+27%', months: 3, text: 'I was skeptical at first, but ECMarket Pro delivered on every promise. UPI deposits are instant, trading execution is lightning fast, and profits are real.' },
            // duplicate for infinite loop
              { name: 'Rahul Sharma', city: 'Mumbai', initials: 'RS', color: '#1F77B4', ret: '+38%', months: 4, text: 'This platform completely changed my trading journey. Fund once and the platform handles everything automatically. Withdrawals arrive within 1 hour every single time.' },
              { name: 'Priya Nair', city: 'Bangalore', initials: 'PN', color: '#16A34A', ret: '+52%', months: 6, text: 'The withdrawal process is incredibly smooth and fast. My funds arrived in under an hour with zero issues. ECMarket Pro is genuinely the best forex platform for Indian traders.' },
              { name: 'Amit Verma', city: 'Delhi', initials: 'AV', color: '#7C3AED', ret: '+29%', months: 3, text: 'Best decision I ever made was joining ECMarket Pro. A truly transparent and professional platform. Spreads are genuinely 0.0 pips — I verified it myself live.' },
              { name: 'Suresh Kumar', city: 'Hyderabad', initials: 'SK', color: '#DC2626', ret: '+41%', months: 5, text: 'The copy trading feature made investing so simple. Just follow successful traders and mirror their trades automatically. Absolutely fantastic platform with great results!' },
              { name: 'Anjali Singh', city: 'Chennai', initials: 'AS', color: '#F7931A', ret: '+33%', months: 4, text: 'KYC was completed in under 10 minutes — super fast! The support team is available 24/7 and always responds quickly. Highly recommended for every serious trader.' },
              { name: 'Vikram Reddy', city: 'Pune', initials: 'VR', color: '#0891B2', ret: '+45%', months: 5, text: 'Incredible platform with real institutional spreads. The leverage options up to 1:2000 give you real trading power. Customer service is responsive and professional.' },
              { name: 'Deepa Menon', city: 'Kochi', initials: 'DM', color: '#16A34A', ret: '+27%', months: 3, text: 'I was skeptical at first, but ECMarket Pro delivered on every promise. UPI deposits are instant, trading execution is lightning fast, and profits are real.' },
            ].map((r, i) => (
              <div key={i} style={{ width: 272, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 20, padding: 22, flexShrink: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: r.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>{r.initials}</span>
                </div>
                <div style={{ fontSize: 28, color: '#e0e7ef', lineHeight: 1, marginBottom: 4, fontFamily: 'Georgia, serif' }}>"</div>
                <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.7, marginBottom: 14 }}>{r.text}</p>
                <div style={{ display: 'flex', gap: 2, marginBottom: 10 }}>
                  {[1,2,3,4,5].map(s => <Star key={s} size={11} style={{ fill: '#1F77B4', color: '#1F77B4' }} />)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#121319', margin: 0 }}>{r.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', margin: 0 }}>{r.city}</p>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#16A34A', background: 'rgba(22,163,74,0.1)', padding: '3px 9px', borderRadius: 8 }}>
                    {r.ret} / {r.months}mo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §7.5 TRADING PLATFORM SECTION
      ══════════════════════════════════════════ */}
      <section style={{ background: '#0B1929', padding: '80px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(31,119,180,0.07) 0%, transparent 55%), radial-gradient(circle at 80% 50%, rgba(22,163,74,0.05) 0%, transparent 55%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 960, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.p variants={fadeUp} style={{ fontSize: 11, fontWeight: 800, color: '#1F77B4', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>Multi-Platform Trading</motion.p>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 12 }}>Trade on Any Device, Anywhere</motion.h2>
            <motion.p variants={fadeUp} style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 440, margin: '0 auto' }}>Access your account from desktop, tablet, or mobile — 24/5 trading with zero downtime.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 16 }}>
            {[
              { icon:'🖥️', name:'WebTrader', desc:'Trade directly from your browser. No download, no installation required.', badge:'Browser-Based', color:'#1F77B4' },
              { icon:'📱', name:'Mobile App', desc:'Full-featured iOS and Android apps. Trade on the go, anytime.', badge:'iOS & Android', color:'#16A34A' },
              { icon:'💻', name:'MetaTrader 4', desc:'Industry-standard MT4 with full EA and algorithmic trading support.', badge:'Windows · Mac', color:'#7C3AED' },
              { icon:'📊', name:'MetaTrader 5', desc:'Advanced multi-asset platform with superior charting and analytics.', badge:'All Platforms', color:'#F7931A' },
            ].map((p,i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ background:'rgba(255,255,255,0.07)', borderColor:`rgba(${p.color === '#1F77B4' ? '31,119,180' : '22,163,74'},0.3)` }}
                style={{ background:'rgba(255,255,255,0.04)', borderRadius:20, padding:24, border:'1px solid rgba(255,255,255,0.07)', textAlign:'center', transition:'all 0.25s' }}>
                <div style={{ fontSize:38, marginBottom:14 }}>{p.icon}</div>
                <h3 style={{ fontSize:16, fontWeight:800, color:'#fff', marginBottom:8 }}>{p.name}</h3>
                <p style={{ fontSize:12.5, color:'rgba(255,255,255,0.4)', lineHeight:1.7, marginBottom:14 }}>{p.desc}</p>
                <span style={{ fontSize:10, fontWeight:700, color:p.color, background:`rgba(${p.color==='#1F77B4'?'31,119,180':p.color==='#16A34A'?'22,163,74':p.color==='#7C3AED'?'124,58,237':'247,147,26'},0.12)`, padding:'4px 10px', borderRadius:8 }}>{p.badge}</span>
              </motion.div>
            ))}
          </motion.div>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 52 }}>
            {[{ label:'Execution Speed', val:'<10ms' },{ label:'Uptime', val:'99.9%' },{ label:'Instruments', val:'200+' },{ label:'Charts', val:'50+ types' }].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: 28, fontWeight: 900, color: '#1F77B4', margin: '0 0 4px' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 44 }}>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(31,119,180,0.4)' }}>
                Start Trading Now <ArrowRight size={16}/>
              </a>
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §8 HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '70px 16px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Start in 3 Simple Steps</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280' }}>Simple, fast, and fully online — trade live in minutes.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {[
              { step: '01', icon: <Users size={28} />, title: 'Create Account', desc: 'Register in 2 minutes. Complete KYC with Aadhaar + PAN — instant verification.' },
              { step: '02', icon: <Wallet size={28} />, title: 'Fund Your Account', desc: 'Instant deposit via UPI, Bank Transfer, or Crypto. No deposit fees.' },
              { step: '03', icon: <BarChart2 size={28} />, title: 'Start Trading', desc: 'Access 200+ instruments with 1:2000 leverage and 0.0 pip spreads.' },
            ].map(s => (
              <motion.div key={s.step} variants={fadeUp}
                style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 22, padding: 28, position: 'relative', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div style={{ position: 'absolute', top: 12, right: 16, fontSize: 64, fontWeight: 900, color: 'rgba(31,119,180,0.05)' }}>{s.step}</div>
                <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(31,119,180,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1F77B4', marginBottom: 16 }}>{s.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 900, color: '#121319', marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §8.5 DEPOSIT / WITHDRAWAL STEPS
      ══════════════════════════════════════════ */}
      <section style={{ background: '#F5F5F5', padding: '80px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Deposits & Withdrawals</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Fund your account in seconds. Withdraw in under 1 hour.</motion.p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 40 }}>
            {/* Deposit side */}
            <motion.div initial={{ opacity:0, x:-30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:'rgba(22,163,74,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <DollarSign size={22} color="#16A34A"/>
                </div>
                <div>
                  <h3 style={{ fontSize:20, fontWeight:900, color:'#121319', margin:0 }}>How to Deposit</h3>
                  <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>Instant · Zero Fees</p>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  { step:'1', title:'Login to Your Account', desc:'Access your client portal with email and password.' },
                  { step:'2', title:'Go to Deposit Section', desc:'Navigate to Funds → Deposit from your dashboard.' },
                  { step:'3', title:'Choose Payment Method', desc:'Select from UPI, Bank Transfer, or Crypto wallet.' },
                  { step:'4', title:'Enter Amount & Confirm', desc:'Funds appear in your trading account within seconds.' },
                ].map(s => (
                  <div key={s.step} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:'rgba(22,163,74,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:900, color:'#16A34A' }}>{s.step}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'#121319', margin:'0 0 3px' }}>{s.title}</p>
                      <p style={{ fontSize:12.5, color:'#6B7280', margin:0 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:24, display:'flex', gap:8, flexWrap:'wrap' }}>
                {['UPI','NEFT/RTGS','IMPS','Bitcoin','USDT TRC20','ETH'].map(m => (
                  <span key={m} style={{ fontSize:11, fontWeight:700, padding:'5px 12px', borderRadius:8, background:'#fff', border:'1px solid #E5E7EB', color:'#374151' }}>{m}</span>
                ))}
              </div>
            </motion.div>
            {/* Withdrawal side */}
            <motion.div initial={{ opacity:0, x:30 }} whileInView={{ opacity:1, x:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28 }}>
                <div style={{ width:44, height:44, borderRadius:14, background:'rgba(31,119,180,0.1)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Wallet size={22} color="#1F77B4"/>
                </div>
                <div>
                  <h3 style={{ fontSize:20, fontWeight:900, color:'#121319', margin:0 }}>How to Withdraw</h3>
                  <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>Within 1 Hour · Zero Fees</p>
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {[
                  { step:'1', title:'Go to Withdrawal Section', desc:'Navigate to Funds → Withdraw from your dashboard.' },
                  { step:'2', title:'Enter the Amount', desc:'Type how much you want to withdraw (minimum $10).' },
                  { step:'3', title:'Choose Destination', desc:'Select bank account, UPI ID, or crypto wallet.' },
                  { step:'4', title:'Funds Received in 1 Hour', desc:'Processed and credited to your account in under 60 minutes.' },
                ].map(s => (
                  <div key={s.step} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:'rgba(31,119,180,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontSize:12, fontWeight:900, color:'#1F77B4' }}>{s.step}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'#121319', margin:'0 0 3px' }}>{s.title}</p>
                      <p style={{ fontSize:12.5, color:'#6B7280', margin:0 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:24, background:'rgba(22,163,74,0.06)', borderRadius:14, padding:'14px 18px', border:'1px solid rgba(22,163,74,0.15)' }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#16A34A', margin:'0 0 4px' }}>⚡ Avg. Processing: 23 minutes</p>
                <p style={{ fontSize:12, color:'#6B7280', margin:0 }}>Based on last 30 days. 99.8% withdrawal success rate.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §9 FAQ
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '70px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 40 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319' }}>
              Frequently Asked Questions
            </motion.h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQS.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                style={{ borderRadius: 18, border: '1px solid #e8e8e8', background: '#fff', overflow: 'hidden', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
                <button style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span style={{ fontWeight: 700, color: '#121319', fontSize: 14 }}>{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={16} color="#1F77B4" style={{ flexShrink: 0 }} /> : <ChevronDown size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />}
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div key="c" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
                      <p style={{ padding: '0 20px 16px', margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #e8e8e8', paddingTop: 12 }}>{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          §10 CONTACT / GET IN TOUCH
      ══════════════════════════════════════════ */}
      <section style={{ background: '#fff', padding: '80px 16px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 48 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(26px,4vw,40px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Get in Touch</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280' }}>Have questions? Our support team responds within 10 minutes, 24/7.</motion.p>
          </motion.div>
          <motion.div initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ duration:0.6 }}
            style={{ background:'#fff', borderRadius:24, border:'1px solid #E5E7EB', padding:'36px 32px', boxShadow:'0 4px 28px rgba(0,0,0,0.06)' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Full Name</label>
                <input placeholder="Your full name" style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid #E5E7EB', fontSize:14, color:'#121319', outline:'none', background:'#F9FAFB', boxSizing:'border-box' }}/>
              </div>
              <div>
                <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Email Address</label>
                <input type="email" placeholder="you@example.com" style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid #E5E7EB', fontSize:14, color:'#121319', outline:'none', background:'#F9FAFB', boxSizing:'border-box' }}/>
              </div>
            </div>
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Subject</label>
              <select style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid #E5E7EB', fontSize:14, color:'#121319', outline:'none', background:'#F9FAFB', boxSizing:'border-box' }}>
                <option>Account Opening</option>
                <option>Deposit / Withdrawal</option>
                <option>Technical Support</option>
                <option>Trading Conditions</option>
                <option>KYC Verification</option>
                <option>Other</option>
              </select>
            </div>
            <div style={{ marginBottom:24 }}>
              <label style={{ fontSize:12, fontWeight:700, color:'#374151', display:'block', marginBottom:6 }}>Message</label>
              <textarea rows={4} placeholder="How can we help you?" style={{ width:'100%', padding:'11px 14px', borderRadius:12, border:'1px solid #E5E7EB', fontSize:14, color:'#121319', outline:'none', background:'#F9FAFB', resize:'vertical', boxSizing:'border-box', fontFamily:'inherit' }}/>
            </div>
            <button style={{ width:'100%', padding:'13px 24px', borderRadius:999, background:'#0B1929', color:'#fff', fontWeight:800, fontSize:15, border:'none', cursor:'pointer', boxShadow:'0 4px 20px rgba(0,0,0,0.15)' }}>
              Send Message →
            </button>
          </motion.div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, marginTop:20 }}>
            {[{ icon:'💬', label:'Live Chat', val:'Available 24/7' },{ icon:'📧', label:'Email', val:'support@ecmarketpro.in' },{ icon:'📞', label:'WhatsApp', val:'+91 98765 43210' }].map(c => (
              <div key={c.label} style={{ textAlign:'center', padding:'16px 12px', background:'#F9FAFB', borderRadius:14, border:'1px solid #E5E7EB' }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
                <p style={{ fontSize:10, color:'#9CA3AF', margin:'0 0 2px', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>{c.label}</p>
                <p style={{ fontSize:12, color:'#121319', margin:0, fontWeight:700 }}>{c.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM CTA — Lemonn style
      ══════════════════════════════════════════ */}
      <div style={{ position: 'sticky', bottom: 0, zIndex: 40, background: '#fff', borderTop: '1px solid #e8e8e8', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1,2,3,4].map(i => <Star key={i} size={14} style={{ fill: '#1F77B4', color: '#1F77B4' }} />)}
              <Star size={14} style={{ fill: 'rgba(31,119,180,0.3)', color: 'rgba(31,119,180,0.3)' }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#121319' }}>Loved by 10 Lakh+ traders</span>
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>with a 4.8★ rating. Join now!</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)}
              style={{ padding: '9px 16px', borderRadius: 999, border: '1px solid #e8e8e8', background: '#F5F5F5', fontSize: 13, color: '#121319', outline: 'none', width: 200 }} />
            <Link href={`/auth/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 13, textDecoration: 'none', boxShadow: '0 4px 14px rgba(31,119,180,0.35)', whiteSpace: 'nowrap' }}>
                Open Free Account <ArrowRight size={14} />
              </a>
            </Link>
          </div>
        </div>
      </div>

    </PublicLayout>
  );
}
