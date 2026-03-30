import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'wouter';
import { PublicLayout } from '@/components/layout/PublicLayout';
import {
  TrendingUp, TrendingDown, Globe, Activity, BarChart2,
  Bitcoin, DollarSign, ArrowRight, Zap, Shield, Clock,
  ChevronDown, ChevronUp
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const INSTRUMENTS: Record<string, { symbol: string; name: string; price: number; spread: string; leverage: string }[]> = {
  Forex: [
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.09215, spread: '0.0', leverage: '1:2000' },
    { symbol: 'GBP/USD', name: 'British Pound / USD', price: 1.27482, spread: '0.1', leverage: '1:2000' },
    { symbol: 'USD/JPY', name: 'US Dollar / Yen', price: 149.820, spread: '0.2', leverage: '1:2000' },
    { symbol: 'AUD/USD', name: 'Australian Dollar', price: 0.65420, spread: '0.1', leverage: '1:1000' },
    { symbol: 'USD/INR', name: 'US Dollar / Rupee', price: 83.4650, spread: '0.5', leverage: '1:500' },
    { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', price: 0.90125, spread: '0.2', leverage: '1:2000' },
    { symbol: 'NZD/USD', name: 'New Zealand Dollar', price: 0.60840, spread: '0.2', leverage: '1:1000' },
    { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', price: 1.35920, spread: '0.2', leverage: '1:2000' },
  ],
  Crypto: [
    { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', price: 67200.00, spread: '15', leverage: '1:100' },
    { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', price: 3480.00, spread: '2.5', leverage: '1:100' },
    { symbol: 'XRP/USD', name: 'Ripple / US Dollar', price: 0.5240, spread: '0.003', leverage: '1:50' },
    { symbol: 'SOL/USD', name: 'Solana / US Dollar', price: 148.50, spread: '0.5', leverage: '1:50' },
    { symbol: 'BNB/USD', name: 'Binance Coin / USD', price: 412.00, spread: '1.2', leverage: '1:50' },
    { symbol: 'DOGE/USD', name: 'Dogecoin / US Dollar', price: 0.1640, spread: '0.001', leverage: '1:50' },
  ],
  Commodities: [
    { symbol: 'XAU/USD', name: 'Gold / US Dollar', price: 2341.50, spread: '0.3', leverage: '1:500' },
    { symbol: 'XAG/USD', name: 'Silver / US Dollar', price: 29.145, spread: '0.05', leverage: '1:500' },
    { symbol: 'WTI', name: 'Crude Oil WTI', price: 78.420, spread: '0.05', leverage: '1:200' },
    { symbol: 'BRENT', name: 'Brent Crude Oil', price: 82.650, spread: '0.06', leverage: '1:200' },
    { symbol: 'NG', name: 'Natural Gas', price: 1.8640, spread: '0.002', leverage: '1:100' },
  ],
  Indices: [
    { symbol: 'US30', name: 'Dow Jones 30', price: 38420.0, spread: '1.5', leverage: '1:500' },
    { symbol: 'NAS100', name: 'NASDAQ 100', price: 17850.0, spread: '1.2', leverage: '1:500' },
    { symbol: 'SPX500', name: 'S&P 500 Index', price: 5045.0, spread: '0.5', leverage: '1:500' },
    { symbol: 'GER40', name: 'Germany DAX 40', price: 17820.0, spread: '1.8', leverage: '1:500' },
    { symbol: 'UK100', name: 'FTSE 100 Index', price: 7842.0, spread: '1.5', leverage: '1:500' },
    { symbol: 'JPN225', name: 'Nikkei 225', price: 38740.0, spread: '5.0', leverage: '1:500' },
  ],
};

function PriceTicker({ price, digits }: { price: number; digits: number }) {
  const [livePrice, setLivePrice] = useState(price);
  const [dir, setDir] = useState<'up'|'down'|null>(null);
  useEffect(() => {
    const t = setInterval(() => {
      const delta = (Math.random() - 0.5) * price * 0.0004;
      setLivePrice(p => {
        const n = Math.max(0.0001, p + delta);
        setDir(delta >= 0 ? 'up' : 'down');
        return n;
      });
    }, 2000 + Math.random() * 1500);
    return () => clearInterval(t);
  }, [price]);
  const chg = ((livePrice - price) / price * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: dir === 'up' ? '#16A34A' : dir === 'down' ? '#DC2626' : '#121319', fontVariantNumeric: 'tabular-nums', transition: 'color 0.3s' }}>
        {livePrice.toFixed(digits)}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, color: chg >= 0 ? '#16A34A' : '#DC2626', background: chg >= 0 ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)', padding: '2px 7px', borderRadius: 6 }}>
        {chg >= 0 ? '+' : ''}{chg.toFixed(2)}%
      </span>
    </div>
  );
}

export function Markets() {
  const [activeTab, setActiveTab] = useState('Forex');
  const tabs = Object.keys(INSTRUMENTS);
  const instruments = INSTRUMENTS[activeTab] || [];

  const digits: Record<string, number> = {
    'EUR/USD': 5, 'GBP/USD': 5, 'USD/JPY': 3, 'AUD/USD': 5, 'USD/INR': 4,
    'USD/CHF': 5, 'NZD/USD': 5, 'USD/CAD': 5,
    'BTC/USD': 2, 'ETH/USD': 2, 'XRP/USD': 4, 'SOL/USD': 2, 'BNB/USD': 2, 'DOGE/USD': 4,
    'XAU/USD': 2, 'XAG/USD': 3, 'WTI': 3, 'BRENT': 3, 'NG': 4,
    'US30': 1, 'NAS100': 1, 'SPX500': 1, 'GER40': 1, 'UK100': 1, 'JPN225': 1,
  };

  return (
    <PublicLayout>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(135deg, #0B1929 0%, #0d2035 100%)', padding: '80px 16px 60px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -80, left: '25%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(31,119,180,0.08)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(22,163,74,0.06)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(31,119,180,0.15)', border: '1px solid rgba(31,119,180,0.25)', borderRadius: 999, padding: '6px 16px', fontSize: 11, fontWeight: 700, color: '#1F77B4', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#16A34A', boxShadow: '0 0 0 3px rgba(22,163,74,0.25)' }} />
              Live Markets · 200+ Instruments
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
            style={{ fontSize: 'clamp(36px,5.5vw,60px)', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
            Trade Global Markets<br/>
            <span style={{ background: 'linear-gradient(90deg,#1F77B4,#16A34A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              with Ultra-Low Spreads
            </span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ fontSize: 17, color: 'rgba(255,255,255,0.6)', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.7 }}>
            Forex, Crypto, Commodities & Indices — all in one platform. Spreads from <strong style={{ color: '#1F77B4' }}>0.0 pips</strong> with up to <strong style={{ color: '#16A34A' }}>1:2000</strong> leverage.
          </motion.p>
          {/* Quick stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
            style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center' }}>
            {[{ val: '200+', label: 'Instruments' }, { val: '0.0', label: 'Min Spread (pips)' }, { val: '1:2000', label: 'Max Leverage' }, { val: '24/5', label: 'Trading Hours' }].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '14px 24px', textAlign: 'center' }}>
                <p style={{ fontSize: 22, fontWeight: 900, color: '#1F77B4', margin: '0 0 2px' }}>{s.val}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* LIVE MARKETS TABLE */}
      <section style={{ background: '#F5F5F5', padding: '60px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '10px 22px', borderRadius: 999, border: `1.5px solid ${activeTab === tab ? '#1F77B4' : '#E5E7EB'}`, background: activeTab === tab ? '#1F77B4' : '#fff', color: activeTab === tab ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}>
                {tab}
              </button>
            ))}
          </div>

          {/* Table */}
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 1fr 100px', gap: 0, padding: '12px 20px', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
                {['Symbol', 'Name', 'Live Price', 'Spread', 'Leverage', ''].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: 0.8 }}>{h}</span>
                ))}
              </div>
              <AnimatePresence mode="wait">
                {instruments.map((inst, i) => (
                  <motion.div key={inst.symbol} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 2fr 1fr 1fr 100px', alignItems: 'center', padding: '14px 20px', borderBottom: i < instruments.length - 1 ? '1px solid #F3F4F6' : 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <span style={{ fontWeight: 800, color: '#121319', fontSize: 13 }}>{inst.symbol}</span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{inst.name}</span>
                    <PriceTicker price={inst.price} digits={digits[inst.symbol] || 2} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#1F77B4' }}>{inst.spread} pips</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#374151' }}>{inst.leverage}</span>
                    <Link href="/auth/register">
                      <a style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 8, background: '#0B1929', color: '#fff', fontWeight: 700, fontSize: 12, textDecoration: 'none' }}>
                        Trade <ArrowRight size={12}/>
                      </a>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY TRADE WITH US */}
      <section style={{ background: '#fff', padding: '80px 16px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ textAlign: 'center', marginBottom: 52 }}>
            <motion.h2 variants={fadeUp} style={{ fontSize: 'clamp(28px,4vw,42px)', fontWeight: 900, color: '#121319', marginBottom: 8 }}>Why Trade With ECMarket Pro?</motion.h2>
            <motion.p variants={fadeUp} style={{ color: '#6B7280', maxWidth: 440, margin: '0 auto' }}>Institutional-grade conditions for every trader.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 20 }}>
            {[
              { icon: <Zap size={24}/>, color: '#1F77B4', bg: 'rgba(31,119,180,0.08)', title: 'Lightning Execution', desc: 'Sub-10ms order execution with no requotes. Your trade gets filled at the exact price.' },
              { icon: <Globe size={24}/>, color: '#16A34A', bg: 'rgba(22,163,74,0.08)', title: 'Deep Liquidity', desc: 'Connected to 20+ top-tier liquidity providers for best prices and zero slippage.' },
              { icon: <Shield size={24}/>, color: '#7C3AED', bg: 'rgba(124,58,237,0.08)', title: 'Negative Balance Protection', desc: 'Your account can never go below zero. Your maximum loss is limited to your deposit.' },
              { icon: <Clock size={24}/>, color: '#F7931A', bg: 'rgba(247,147,26,0.08)', title: '24/5 Trading', desc: 'Trade forex and other markets round the clock, 5 days a week, from Sunday to Friday.' },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp} whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(0,0,0,0.09)' }}
                style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'all 0.25s' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#121319', marginBottom: 7 }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* DARK CTA BANNER */}
      <section style={{ background: 'linear-gradient(135deg,#0B1929,#0d2035)', padding: '70px 16px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(31,119,180,0.1) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Ready to Start Trading?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            style={{ color: 'rgba(255,255,255,0.55)', fontSize: 16, marginBottom: 32, lineHeight: 1.7 }}>
            Open your free account in 2 minutes. No deposit required to start with a demo account.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 36px', borderRadius: 999, background: '#1F77B4', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none', boxShadow: '0 8px 28px rgba(31,119,180,0.4)' }}>
                Open Free Account <ArrowRight size={16}/>
              </a>
            </Link>
            <Link href="/auth/register">
              <a style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
                Try Demo Account
              </a>
            </Link>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
