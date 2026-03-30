import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, TrendingUp, ChevronDown, ChevronUp,
  ArrowRight, Users, Globe, Lock, BarChart2, Wallet, Clock,
  Star, CheckCircle2, Building2
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// --- FAQ ---
const FAQS = [
  { q: 'How long does it take to process a withdrawal?', a: 'Withdrawals are processed within 1 hour to your registered bank account, UPI ID, or crypto wallet — one of the fastest in the industry.' },
  { q: 'What leverage does ECMarket Pro offer?', a: 'We offer leverage up to 1:2000 on major forex pairs, allowing you to maximise your trading power with minimal capital.' },
  { q: 'What are the spreads on ECMarket Pro?', a: 'Our spreads start from 0.0 pips on major pairs like EUR/USD and GBP/USD, giving you the most competitive trading conditions available.' },
  { q: 'Are my funds safe?', a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, completely separate from company operating funds. We are regulated and headquartered in the UAE.' },
  { q: 'What deposit methods are accepted?', a: 'We support UPI, Bank Transfer (NEFT/RTGS/IMPS), and Crypto deposits. All deposits are instant and there are no deposit fees.' },
];

// Phone mockup component
function PhoneMockup() {
  const [prices, setPrices] = useState([
    { pair: 'EUR/USD', price: 1.0921, change: '+0.12%', up: true },
    { pair: 'GBP/USD', price: 1.2748, change: '-0.08%', up: false },
    { pair: 'XAU/USD', price: 2341.5, change: '+0.82%', up: true },
    { pair: 'BTC/USD', price: 67200, change: '+1.24%', up: true },
  ]);

  useEffect(() => {
    const iv = setInterval(() => {
      setPrices(prev => prev.map(p => {
        const delta = (Math.random() - 0.48) * p.price * 0.0004;
        const newPrice = +(p.price + delta).toFixed(p.price > 1000 ? 1 : 4);
        const chg = +(((newPrice - p.price) / p.price) * 100).toFixed(2);
        return { ...p, price: newPrice, change: `${chg >= 0 ? '+' : ''}${chg}%`, up: chg >= 0 };
      }));
    }, 2000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      className="relative mx-auto"
      style={{
        width: 260,
        height: 520,
        background: '#1a1a2e',
        borderRadius: 38,
        border: '8px solid #2d2d4a',
        boxShadow: '0 40px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 0 1px rgba(255,255,255,0.03)',
        overflow: 'hidden',
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-6 rounded-b-xl z-10" style={{ background: '#2d2d4a' }} />

      {/* Screen content */}
      <div className="h-full flex flex-col" style={{ background: 'linear-gradient(160deg, #0d1b35 0%, #0a1628 100%)' }}>
        {/* App header */}
        <div className="pt-8 px-4 pb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">ECMarket Pro</span>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-green-400 font-bold">LIVE</span>
            </div>
          </div>

          {/* Balance */}
          <div className="mt-2">
            <p className="text-[10px] text-white/40 font-medium">Portfolio Balance</p>
            <p className="text-2xl font-black text-white tracking-tight">$12,480.50</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[11px] font-bold text-green-400">▲ +$284.20</span>
              <span className="text-[10px] text-white/40">today</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />

        {/* Prices */}
        <div className="flex-1 px-3 pt-3 space-y-1 overflow-hidden">
          <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold px-1 mb-2">Live Markets</p>
          {prices.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-2 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)' }}
            >
              <div>
                <p className="text-[11px] font-bold text-white">{p.pair}</p>
                <p className={`text-[9px] font-semibold ${p.up ? 'text-green-400' : 'text-red-400'}`}>{p.change}</p>
              </div>
              <p className="text-[11px] font-black text-white tabular-nums">
                {p.price.toLocaleString(undefined, { minimumFractionDigits: p.price > 1000 ? 1 : 4, maximumFractionDigits: p.price > 1000 ? 1 : 4 })}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom actions */}
        <div className="px-3 pb-5 pt-3">
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 12 }} />
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Deposit', icon: '↓', color: '#1F77B4' },
              { label: 'Trade', icon: '📈', color: '#16A34A' },
              { label: 'Withdraw', icon: '↑', color: '#374151' },
            ].map(a => (
              <div key={a.label} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,0.08)', color: '#fff' }}>
                  {a.icon}
                </div>
                <span className="text-[9px] text-white/50 font-medium">{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Counter
function Counter({ end, suffix = '', prefix = '', decimals = 0 }: { end: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [val, setVal] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  useEffect(() => {
    if (!started) return;
    const dur = 1800;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      setVal(+(p * end).toFixed(decimals));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, decimals]);
  return <span ref={ref}>{prefix}{decimals ? val.toFixed(decimals) : val.toLocaleString()}{suffix}</span>;
}

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [email, setEmail] = useState('');

  return (
    <PublicLayout>

      {/* ══════════════════════════════════════════
          HERO — Lemonn style centered phone mockup
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-0" style={{ background: '#F5F5F5' }}>

        {/* Decorative SVG curves (like Lemonn's green squiggles) */}
        <svg className="absolute left-0 top-1/3 w-48 md:w-64 opacity-20 pointer-events-none" viewBox="0 0 200 300" fill="none">
          <path d="M180 20 Q20 80 160 160 Q20 200 140 280" stroke="#1F77B4" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>
        <svg className="absolute right-0 top-1/4 w-48 md:w-64 opacity-20 pointer-events-none" viewBox="0 0 200 300" fill="none">
          <path d="M20 20 Q180 80 40 160 Q180 200 60 280" stroke="#1F77B4" strokeWidth="3" strokeLinecap="round" fill="none"/>
        </svg>

        {/* Headline */}
        <motion.div
          initial="hidden" animate="visible" variants={stagger}
          className="text-center px-4 pt-4 pb-6 relative z-10"
        >
          <motion.div variants={fadeUp} className="mb-4">
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest"
              style={{ background: 'rgba(31,119,180,0.1)', border: '1px solid rgba(31,119,180,0.2)', color: '#1F77B4' }}>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1F77B4] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1F77B4]" />
              </span>
              UAE Regulated Forex Broker
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black text-[#121319] leading-[1.05] tracking-tight mb-4">
            Trade Forex,<br />
            <span style={{ background: 'linear-gradient(90deg, #1F77B4 0%, #16A34A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Crypto & More.
            </span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base md:text-lg text-[#6B7280] max-w-lg mx-auto mb-6 leading-relaxed">
            Access <strong style={{ color: '#1F77B4' }}>200+ global markets</strong> with leverage up to <strong style={{ color: '#1F77B4' }}>1:2000</strong>,
            spreads from <strong style={{ color: '#1F77B4' }}>0.0 pips</strong>, instant deposits & <strong style={{ color: '#1F77B4' }}>1-hour withdrawals</strong>.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <Link href="/auth/register">
              <a className="flex items-center gap-2 px-8 py-3.5 text-base font-bold rounded-full text-white transition-all"
                style={{ background: '#1F77B4', boxShadow: '0 8px 24px rgba(31,119,180,0.35)' }}>
                Open Free Account <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
            <Link href="/markets">
              <a className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-full transition-all"
                style={{ background: '#fff', border: '1px solid #e8e8e8', color: '#374151', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                View Markets
              </a>
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-5 text-[13px] text-[#6B7280]">
            {['Spreads from 0.0 pips', 'Leverage up to 1:2000', 'Withdraw in 1 hour'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#1F77B4] shrink-0" /> {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Phone mockup + floating badges */}
        <div className="relative flex justify-center items-end px-4 pb-0" style={{ minHeight: 560 }}>

          {/* Left floating badge — UAE Regulated */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute left-4 md:left-[10%] lg:left-[18%] top-8 rounded-2xl px-4 py-3 z-20"
            style={{ background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(31,119,180,0.1)' }}>
                <Building2 className="w-5 h-5 text-[#1F77B4]" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#121319]">UAE REGULATED</p>
                <p className="text-[10px] text-[#6B7280]">Licensed Broker</p>
              </div>
            </div>
          </motion.div>

          {/* Right floating badge — ISO / SSL */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute right-4 md:right-[10%] lg:right-[18%] top-12 rounded-2xl px-4 py-3 z-20"
            style={{ background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(22,163,74,0.1)' }}>
                <Shield className="w-5 h-5 text-[#16A34A]" />
              </div>
              <div>
                <p className="text-[11px] font-black text-[#121319]">256-BIT SSL</p>
                <p className="text-[10px] text-[#6B7280]">Encrypted</p>
              </div>
            </div>
          </motion.div>

          {/* Bottom-left floating badge — 1:2000 */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            className="absolute left-4 md:left-[8%] lg:left-[14%] bottom-24 rounded-2xl px-4 py-3 z-20"
            style={{ background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <p className="text-[10px] text-[#6B7280] font-medium">Max Leverage</p>
            <p className="text-lg font-black text-[#1F77B4]">1:2000</p>
          </motion.div>

          {/* Bottom-right floating badge — Withdrawal */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute right-4 md:right-[8%] lg:right-[14%] bottom-20 rounded-2xl px-4 py-3 z-20"
            style={{ background: '#fff', border: '1px solid #e8e8e8', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
          >
            <p className="text-[10px] text-[#6B7280] font-medium">Withdrawal</p>
            <p className="text-lg font-black text-[#16A34A]">≤ 1 Hour</p>
          </motion.div>

          {/* Phone */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10"
          >
            <PhoneMockup />
          </motion.div>

          {/* Soft glow under phone */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-20 blur-3xl rounded-full pointer-events-none"
            style={{ background: 'rgba(31,119,180,0.15)' }} />
        </div>

        {/* ── TRUST STRIP ── */}
        <div className="mt-0" style={{ background: '#fff', borderTop: '1px solid #e8e8e8', borderBottom: '1px solid #e8e8e8' }}>
          <div className="max-w-5xl mx-auto px-4 py-4">
            <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 md:gap-6">
              {[
                { icon: '⭐', label: '4.8/5 Rating', sub: '10,000+ reviews' },
                { icon: '👥', label: '10 Lakh+ Traders', sub: 'Worldwide' },
                { icon: '🏛️', label: 'UAE Regulated', sub: 'Licensed broker' },
                { icon: '🔒', label: 'Segregated Funds', sub: 'Tier-1 banks' },
                { icon: '⚡', label: 'Since 2018', sub: '7+ years experience' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-[11px] font-bold text-[#121319] leading-tight">{item.label}</p>
                    <p className="text-[10px] text-[#6B7280]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          WHY TRADERS — Lemonn-style "Why Investors"
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">
              Why Traders Choose ECMarket Pro
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] max-w-xl mx-auto">
              Institutional-grade trading conditions, local payment methods, and the fastest withdrawals — all from a UAE regulated broker.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <Zap className="h-6 w-6" />, title: '0.0 Pip Spreads', desc: 'Ultra-tight spreads on all major forex pairs, crypto and commodities.', color: '#1F77B4' },
              { icon: <TrendingUp className="h-6 w-6" />, title: '1:2000 Leverage', desc: 'Industry-leading leverage to maximise your trading capital.', color: '#16A34A' },
              { icon: <Clock className="h-6 w-6" />, title: '1-Hour Withdrawals', desc: 'Get your money back in under 1 hour — anytime, any day.', color: '#1F77B4' },
              { icon: <Globe className="h-6 w-6" />, title: '200+ Instruments', desc: 'Forex, Crypto, Indices, Commodities & Stocks in one account.', color: '#16A34A' },
            ].map(f => (
              <motion.div key={f.title} variants={fadeUp}
                className="rounded-2xl p-7 border border-[#e8e8e8] bg-white hover:shadow-md transition-all group"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="font-black text-[#121319] mb-2">{f.title}</h3>
                <p className="text-sm text-[#6B7280] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          PLATFORM STATS
      ══════════════════════════════════════════ */}
      <section className="py-14" style={{ background: '#0B1929' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { end: 200, suffix: '+', label: 'Instruments', prefix: '' },
              { end: 2000, suffix: '', label: 'Max Leverage', prefix: '1:' },
              { end: 0, suffix: '.0', label: 'Min Spread (pips)', prefix: '' },
              { end: 1, suffix: ' Hr', label: 'Max Withdrawal', prefix: '<' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-white mb-1">
                  <Counter end={s.end} suffix={s.suffix} prefix={s.prefix} />
                </p>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TRADING INSTRUMENTS
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#F5F5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">
              Trade the World's Best Markets
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] max-w-xl mx-auto">
              200+ instruments across Forex, Crypto, Commodities, Indices & Stocks — all from one account.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Forex', icon: '💱', desc: '80+ pairs' },
              { name: 'Gold', icon: '🥇', desc: 'XAU/USD' },
              { name: 'Indices', icon: '📊', desc: 'US30, NAS100' },
              { name: 'Crypto', icon: '₿', desc: 'BTC, ETH' },
              { name: 'Commodities', icon: '🛢️', desc: 'Oil, Gas' },
              { name: 'Stocks', icon: '📈', desc: 'Top 50' },
            ].map(item => (
              <motion.div key={item.name} variants={fadeUp}
                className="rounded-2xl border border-[#e8e8e8] bg-white p-5 text-center hover:border-[#1F77B4]/40 hover:shadow-md transition-all cursor-pointer"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-black text-[#121319] text-sm">{item.name}</p>
                <p className="text-[11px] text-[#6B7280] mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">
              Start in 3 Simple Steps
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280]">Simple, fast, and fully online — trade live in minutes.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: <Users className="h-7 w-7" />, title: 'Create Account', desc: 'Register in 2 minutes. Complete KYC with Aadhaar + PAN and get verified instantly.' },
              { step: '02', icon: <Wallet className="h-7 w-7" />, title: 'Fund Your Account', desc: 'Instant deposit via UPI, Bank Transfer, or Crypto. No deposit fees, credited immediately.' },
              { step: '03', icon: <BarChart2 className="h-7 w-7" />, title: 'Start Trading', desc: 'Access 200+ instruments with leverage up to 1:2000 and spreads from 0.0 pips.' },
            ].map((s) => (
              <motion.div key={s.step} variants={fadeUp}
                className="relative rounded-2xl border border-[#e8e8e8] bg-white p-8 overflow-hidden hover:border-[#1F77B4]/30 hover:shadow-md transition-all"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="absolute top-4 right-5 text-7xl font-black select-none" style={{ color: 'rgba(31,119,180,0.06)' }}>{s.step}</div>
                <div className="mb-4 inline-flex items-center justify-center rounded-xl p-3 text-[#1F77B4]" style={{ background: 'rgba(31,119,180,0.08)' }}>
                  {s.icon}
                </div>
                <h3 className="text-xl font-black text-[#121319] mb-2">{s.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DEPOSIT & WITHDRAWAL
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#F5F5F5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">
              Local Deposits & Fast Withdrawals
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] max-w-xl mx-auto">
              Fund your account instantly and withdraw within 1 hour using your preferred local method.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {[
              {
                icon: <Wallet className="h-6 w-6" />, title: 'Deposit Methods', badge: '⚡ Instant',
                methods: [
                  { method: 'UPI', detail: 'PhonePe, GPay, Paytm & all UPI apps', time: 'Instant' },
                  { method: 'Bank Transfer', detail: 'NEFT / RTGS / IMPS', time: 'Instant' },
                  { method: 'Crypto', detail: 'USDT, BTC, ETH & more', time: 'Instant' },
                ]
              },
              {
                icon: <Clock className="h-6 w-6" />, title: 'Withdrawal Methods', badge: '🕐 ≤ 1 Hour',
                methods: [
                  { method: 'Bank Transfer', detail: 'Direct to your registered bank account', time: '≤ 1 Hr' },
                  { method: 'UPI', detail: 'Instant UPI payout to your ID', time: '≤ 1 Hr' },
                  { method: 'Crypto', detail: 'USDT, BTC, ETH withdrawal', time: '≤ 1 Hr' },
                ]
              }
            ].map(card => (
              <motion.div key={card.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
                className="rounded-2xl border border-[#e8e8e8] bg-white p-7"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-xl p-2.5 text-[#1F77B4]" style={{ background: 'rgba(31,119,180,0.08)' }}>{card.icon}</div>
                  <div>
                    <p className="font-black text-[#121319]">{card.title}</p>
                    <p className="text-xs text-[#1F77B4] font-semibold">{card.badge}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {card.methods.map(m => (
                    <div key={m.method} className="flex items-center justify-between rounded-xl border border-[#e8e8e8] px-4 py-3">
                      <div>
                        <p className="text-sm font-bold text-[#121319]">{m.method}</p>
                        <p className="text-[11px] text-[#6B7280]">{m.detail}</p>
                      </div>
                      <span className="text-xs font-bold text-[#1F77B4] rounded-full px-2.5 py-1" style={{ background: 'rgba(31,119,180,0.08)' }}>{m.time}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="rounded-2xl border p-5 text-center"
            style={{ borderColor: 'rgba(31,119,180,0.2)', background: 'rgba(31,119,180,0.04)' }}>
            <p className="text-sm text-[#6B7280]">
              <span className="font-bold text-[#121319]">Zero deposit fees</span> · <span className="font-bold text-[#121319]">No hidden charges</span> · <span className="font-bold text-[#121319]">Funds always in your control</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#fff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">What Our Traders Say</motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280]">Real results from real clients.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Rahul Sharma', city: 'Mumbai', ret: '+38% in 4 months', text: 'Platform ne meri zindagi badal di. Ek baar fund karo, algo baaki sab karta hai.', stars: 5 },
              { name: 'Priya Nair', city: 'Bangalore', ret: '+52% in 6 months', text: 'Withdrawal process bahut smooth hai. 24 hours me paise aa gaye bina kisi issue ke.', stars: 5 },
              { name: 'Amit Verma', city: 'Delhi', ret: '+29% in 3 months', text: 'Best decision tha jo maine ECMarket Pro join kiya. Transparent aur professional platform.', stars: 5 },
            ].map(r => (
              <motion.div key={r.name} variants={fadeUp}
                className="rounded-2xl border border-[#e8e8e8] bg-white p-6 hover:shadow-md transition-all"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#1F77B4] text-[#1F77B4]" />
                  ))}
                </div>
                <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-[#121319] text-sm">{r.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{r.city}</p>
                  </div>
                  <span className="rounded-full px-3 py-1 text-xs font-bold text-[#1F77B4]" style={{ background: 'rgba(31,119,180,0.08)' }}>{r.ret}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════ */}
      <section className="py-20" style={{ background: '#F5F5F5' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#121319] mb-3">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-[#e8e8e8] bg-white overflow-hidden"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-bold text-[#121319] text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-[#1F77B4] shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-[#6B7280] shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-4 text-sm text-[#6B7280] leading-relaxed border-t border-[#e8e8e8] pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          STICKY BOTTOM CTA — Lemonn style
      ══════════════════════════════════════════ */}
      <div className="sticky bottom-0 z-40 w-full" style={{ background: '#fff', borderTop: '1px solid #e8e8e8', boxShadow: '0 -4px 24px rgba(0,0,0,0.08)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left — Rating */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex gap-0.5">
              {[1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-[#1F77B4] text-[#1F77B4]" />)}
              <Star className="h-4 w-4 fill-[#1F77B4]/40 text-[#1F77B4]/40" />
            </div>
            <span className="text-sm font-bold text-[#121319]">Loved by 10 Lakh+ traders</span>
            <span className="text-sm text-[#6B7280] hidden sm:inline">· 4.8★ rating. Join now!</span>
          </div>

          {/* Right — Input + CTA */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 sm:w-52 px-4 py-2.5 text-sm rounded-full outline-none"
              style={{ border: '1px solid #e8e8e8', background: '#f6f6f6', color: '#121319' }}
            />
            <Link href={`/auth/register${email ? `?email=${encodeURIComponent(email)}` : ''}`}>
              <a className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-bold rounded-full text-white whitespace-nowrap transition-all"
                style={{ background: '#1F77B4', boxShadow: '0 4px 14px rgba(31,119,180,0.35)' }}>
                Open Free Account <ArrowRight className="h-4 w-4" />
              </a>
            </Link>
          </div>
        </div>
      </div>

    </PublicLayout>
  );
}
