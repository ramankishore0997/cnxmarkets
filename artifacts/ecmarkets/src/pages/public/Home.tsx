import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, TrendingUp, ChevronDown, ChevronUp,
  ArrowRight, Users, Globe, Lock, BarChart2, Wallet, Clock,
  Star, CheckCircle2, Activity
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

// --- Live Ticker ---
const TICKER_ITEMS = [
  { symbol: 'EUR/USD', base: 1.0921, flag: '🇪🇺' },
  { symbol: 'GBP/USD', base: 1.2748, flag: '🇬🇧' },
  { symbol: 'USD/JPY', base: 149.82, flag: '🇯🇵' },
  { symbol: 'USD/INR', base: 83.46, flag: '🇮🇳' },
  { symbol: 'XAU/USD', base: 2341.5, flag: '🥇' },
  { symbol: 'US30',   base: 38420, flag: '📈' },
  { symbol: 'BTC/USD', base: 67200, flag: '₿' },
  { symbol: 'EUR/GBP', base: 0.8563, flag: '🇪🇺' },
];

function useLivePrices() {
  const [prices, setPrices] = useState(() =>
    TICKER_ITEMS.map(i => ({ ...i, price: i.base, change: 0, up: true }))
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(item => {
        const delta = (Math.random() - 0.49) * item.base * 0.0006;
        const price = +(item.price + delta).toFixed(item.base > 1000 ? 1 : item.base > 100 ? 2 : 4);
        const change = +(((price - item.base) / item.base) * 100).toFixed(2);
        return { ...item, price, change, up: delta >= 0 };
      }));
    }, 1800);
    return () => clearInterval(interval);
  }, []);
  return prices;
}

function LiveTicker() {
  const prices = useLivePrices();
  const doubled = [...prices, ...prices];
  return (
    <div className="bg-[#FFFFFF] border-b border-[#E5E7EB] overflow-hidden">
      <div className="flex items-center" style={{ animation: 'ticker-scroll 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 py-2 shrink-0 border-r border-[#E5E7EB] last:border-r-0">
            <span className="text-xs">{item.flag}</span>
            <span className="text-[11px] font-semibold text-[#6B7280] tracking-wide">{item.symbol}</span>
            <span className="text-[11px] font-bold text-[#111827] tabular-nums">{item.price.toLocaleString()}</span>
            <span className={`text-[10px] font-medium tabular-nums ${item.up ? 'text-[#1F77B4]' : 'text-red-400'}`}>
              {item.up ? '+' : ''}{item.change}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Counter ---
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

// --- FAQ ---
const FAQS = [
  { q: 'How long does it take to process a withdrawal?', a: 'Withdrawals are processed within 1 hour to your registered bank account, UPI ID, or crypto wallet — one of the fastest in the industry.' },
  { q: 'What leverage does ECMarket Pro offer?', a: 'We offer leverage up to 1:2000 on major forex pairs, allowing you to maximise your trading power with minimal capital.' },
  { q: 'What are the spreads on ECMarket Pro?', a: 'Our spreads start from 0.0 pips on major pairs like EUR/USD and GBP/USD, giving you the most competitive trading conditions available.' },
  { q: 'Are my funds safe?', a: 'Yes. Client funds are held in segregated accounts at tier-1 banks, completely separate from company operating funds. We are regulated and headquartered in the UAE.' },
  { q: 'What deposit methods are accepted?', a: 'We support UPI, Bank Transfer (NEFT/RTGS/IMPS), and Crypto deposits. All deposits are instant and there are no deposit fees.' },
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <LiveTicker />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#FFFFFF] pt-14 pb-20 md:pt-20 md:pb-28">
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-20 left-1/4 w-[500px] h-[500px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(31,119,180,0.08) 0%, transparent 70%)' }}
          />
          <motion.div
            animate={{ x: [0, -20, 0], y: [0, 25, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute top-1/3 right-0 w-[400px] h-[400px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(31,119,180,0.05) 0%, transparent 70%)' }}
          />
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(11,60,93,0.06) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-6">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#1F77B4]/30 bg-[#1F77B4]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#1F77B4]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1F77B4] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1F77B4]" />
                  </span>
                  UAE Regulated Forex Broker
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-[68px] font-black text-[#111827] leading-[1.05] tracking-tight mb-6">
                Trade Forex,<br />
                <span style={{ background: 'linear-gradient(90deg, #1F77B4 0%, #2e8fd1 50%, #16A34A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Crypto & More.
                </span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-[#6B7280] mb-8 max-w-md leading-relaxed">
                Access 200+ global markets with leverage up to <span className="font-semibold" style={{ color: "#1F77B4" }}>1:2000</span>, spreads from <span className="font-semibold" style={{ color: "#1F77B4" }}>0.0 pips</span>, instant deposits & <span className="font-semibold" style={{ color: "#1F77B4" }}>1-hour withdrawals</span>.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
                <Link href="/auth/register">
                  <a className="btn-green flex items-center gap-2 px-7 py-3.5 text-base font-bold rounded-xl shadow-lg shadow-[#1F77B4]/20">
                    Open Live Account <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
                <Link href="/auth/login">
                  <a className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold rounded-xl transition-all"
                    style={{ background: '#F7F9FC', border: '1px solid #E5E7EB', color: '#374151' }}>
                    Sign In
                  </a>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
                {[
                  'Spreads from 0.0 pips',
                  'Leverage up to 1:2000',
                  'Funds in 1 hour',
                ].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-[13px] text-[#6B7280]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#1F77B4] shrink-0" /> {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Live Markets Terminal */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative"
            >
              {/* Glow behind card */}
              <div className="absolute inset-0 rounded-3xl blur-3xl" style={{ background: 'radial-gradient(ellipse, rgba(31,119,180,0.12) 0%, transparent 70%)' }} />

              {/* Main terminal card */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/60"
                style={{ background: '#0B3C5D', border: '1px solid rgba(255,255,255,0.1)' }}>

                {/* Terminal header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#1F77B4]" />
                    <span className="text-xs font-bold text-white tracking-wider uppercase">Live Markets</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1F77B4] opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1F77B4]" />
                    </span>
                    <span className="text-[10px] font-bold text-[#1F77B4]">LIVE</span>
                  </div>
                </div>

                {/* Instrument rows */}
                <div className="divide-y divide-white/[0.04]">
                  {[
                    { sym: 'EUR/USD', price: '1.0921', chg: '+0.12%', up: true, bars: [35,50,42,58,52,68,62,75,70,82] },
                    { sym: 'GBP/USD', price: '1.2748', chg: '-0.08%', up: false, bars: [80,72,78,65,70,58,62,55,50,45] },
                    { sym: 'XAU/USD', price: '2,341.5', chg: '+0.82%', up: true, bars: [40,52,48,60,55,70,65,78,72,88] },
                    { sym: 'BTC/USD', price: '67,200', chg: '+1.24%', up: true, bars: [30,45,38,55,50,65,60,72,68,85] },
                  ].map(item => (
                    <div key={item.sym} className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                      <div className="w-20 shrink-0">
                        <p className="text-[12px] font-bold text-white">{item.sym}</p>
                        <p className={`text-[10px] font-semibold ${item.up ? 'text-[#1F77B4]' : 'text-red-400'}`}>{item.chg}</p>
                      </div>
                      <div className="flex-1 h-8 flex items-end gap-[2px]">
                        {item.bars.map((h, i) => (
                          <div key={i} className="flex-1 rounded-sm transition-all"
                            style={{ height: `${h}%`, background: item.up ? `rgba(31,119,180,${0.3 + (i/item.bars.length)*0.5})` : `rgba(239,68,68,${0.3 + (i/item.bars.length)*0.5})` }} />
                        ))}
                      </div>
                      <div className="w-16 text-right shrink-0">
                        <p className="text-[12px] font-black text-white tabular-nums">{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buy/Sell strip */}
                <div className="px-5 py-4 border-t border-white/[0.05]" style={{ background: 'rgba(0,0,0,0.3)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] text-[#6B7280]">EUR/USD</span>
                    <div className="flex items-center gap-1 text-[10px] text-[#6B7280]">
                      <span>Spread:</span>
                      <span className="text-[#1F77B4] font-bold">0.0 pips</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2.5 rounded-xl text-xs font-black tracking-wide text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #DC2626, #A52040)' }}>
                      SELL<br/><span className="text-[11px] font-normal opacity-80">1.0918</span>
                    </button>
                    <button className="py-2.5 rounded-xl text-xs font-black tracking-wide text-white transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(135deg, #155D8B, #1F77B4)' }}>
                      BUY<br/><span className="text-[11px] font-normal opacity-80">1.0921</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Floating badge — top left */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -left-4 rounded-2xl px-4 py-3 shadow-xl"
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(11,60,93,0.15)' }}
              >
                <p className="text-[10px] text-[#6B7280] font-medium">Max Leverage</p>
                <p className="text-lg font-black text-[#1F77B4]">1:2000</p>
              </motion.div>

              {/* Floating badge — bottom right */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                className="absolute -bottom-4 -right-4 rounded-2xl px-4 py-3 shadow-xl"
                style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', boxShadow: '0 8px 24px rgba(11,60,93,0.15)' }}
              >
                <p className="text-[10px] text-[#6B7280] font-medium">Withdrawal</p>
                <p className="text-lg font-black text-[#1F77B4]">≤ 1 Hour</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-y border-[#E5E7EB]" style={{ background: '#F7F9FC' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-center md:justify-between gap-4 md:gap-0">
            {[
              { icon: '⭐', label: '4.8/5 Rating', sub: '10,000+ reviews' },
              { icon: '👥', label: '10 Lakh+ Traders', sub: 'Worldwide' },
              { icon: '🏛️', label: 'UAE Regulated', sub: 'Licensed broker' },
              { icon: '🔒', label: 'Segregated Funds', sub: 'Tier-1 banks' },
              { icon: '⚡', label: 'Since 2018', sub: '7+ years experience' },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2.5">
                <span className="text-xl">{item.icon}</span>
                <div>
                  <p className="text-[12px] font-bold text-[#111827] leading-tight">{item.label}</p>
                  <p className="text-[10px] text-[#6B7280]">{item.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ── */}
      <section className="bg-[#FFFFFF] border-y border-[#E5E7EB] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { display: '200+', label: 'Instruments' },
              { display: '1:2000', label: 'Max Leverage' },
              { display: '0.0', label: 'Spreads From (pips)' },
              { display: 'UAE', label: 'Regulated & HQ' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-[#1F77B4]">{s.display}</p>
                <p className="text-sm text-[#6B7280] mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADING INSTRUMENTS ── */}
      <section className="py-20" style={{ background: "#F7F9FC" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-3">
              Trade the World's Best Markets
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] max-w-xl mx-auto">
              200+ instruments across Forex, Crypto, Commodities, Indices & Stocks — all from one account.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Forex', icon: '💱', desc: '80+ pairs', color: '#1F77B4' },
              { name: 'Gold', icon: '🥇', desc: 'XAU/USD', color: '#FFD700' },
              { name: 'Indices', icon: '📊', desc: 'US30, NAS100', color: '#1F77B4' },
              { name: 'Crypto', icon: '₿', desc: 'BTC, ETH', color: '#F7931A' },
              { name: 'Commodities', icon: '🛢️', desc: 'Oil, Gas', color: '#1F77B4' },
              { name: 'Stocks', icon: '📈', desc: 'Top 50', color: '#1F77B4' },
            ].map(item => (
              <motion.div key={item.name} variants={fadeUp}
                className="group rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-5 text-center hover:border-[#1F77B4]/40 transition-all cursor-pointer">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-[#111827] text-sm">{item.name}</p>
                <p className="text-[11px] text-[#6B7280] mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#FFFFFF] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-3">
              Start in 3 Simple Steps
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280]">Simple, fast, and fully online — trade live in minutes.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01', icon: <Users className="h-7 w-7" />, title: 'Create Account',
                desc: 'Register in 2 minutes. Complete KYC with Aadhaar + PAN and get verified.',
              },
              {
                step: '02', icon: <Wallet className="h-7 w-7" />, title: 'Fund Your Account',
                desc: 'Instant deposit via UPI, Bank Transfer, or Crypto. No deposit fees, credited immediately.',
              },
              {
                step: '03', icon: <BarChart2 className="h-7 w-7" />, title: 'Start Trading',
                desc: 'Access 200+ instruments with leverage up to 1:2000 and spreads from 0.0 pips.',
              },
            ].map((s, i) => (
              <motion.div key={s.step} variants={fadeUp}
                className="relative rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-8 overflow-hidden group hover:border-[#1F77B4]/30 transition-all">
                <div className="absolute top-4 right-5 text-6xl font-black text-[#1F77B4]/5 select-none">{s.step}</div>
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[#1F77B4]/10 p-3 text-[#1F77B4]">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-2">{s.title}</h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY ECMarket Pro ── */}
      <section className="py-20" style={{ background: "#F7F9FC" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-4">
                Why Traders Choose ECMarket Pro
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#6B7280] mb-8 leading-relaxed">
                Institutional-grade trading conditions, local payment methods, and the fastest withdrawals — all from a UAE regulated broker.
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  { icon: <Zap className="h-5 w-5" />, title: 'Spreads From 0.0 Pips', desc: 'Ultra-competitive spreads on all major forex pairs and crypto.' },
                  { icon: <TrendingUp className="h-5 w-5" />, title: 'Up to 1:2000 Leverage', desc: 'Maximise your trading power with industry-leading leverage.' },
                  { icon: <Clock className="h-5 w-5" />, title: '1 Hour Withdrawals', desc: 'Funds in your account within 1 hour — anytime, any day.' },
                  { icon: <Globe className="h-5 w-5" />, title: '200+ Instruments', desc: 'Forex, Crypto, Indices, Commodities & Stocks from one account.' },
                ].map(f => (
                  <motion.div key={f.title} variants={fadeUp}
                    className="flex items-start gap-4 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] p-4">
                    <div className="rounded-lg bg-[#1F77B4]/10 p-2.5 text-[#1F77B4] shrink-0">{f.icon}</div>
                    <div>
                      <p className="font-bold text-[#111827] text-sm mb-0.5" dangerouslySetInnerHTML={{ __html: f.title }} />
                      <p className="text-[#6B7280] text-xs" dangerouslySetInnerHTML={{ __html: f.desc }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Security trust bars */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="space-y-5">
              <motion.div variants={fadeUp} className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#6B7280] mb-5">Platform Security</p>
                {[
                  { label: 'Fund Security', val: 98 },
                  { label: 'Uptime (12 Months)', val: 99 },
                  { label: 'Trade Accuracy', val: 94 },
                  { label: 'KYC Verification Speed', val: 91 },
                ].map((item, i) => (
                  <div key={item.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-medium" style={{ color: "#374151" }}>{item.label}</span>
                      <span className="text-[#1F77B4] font-bold">{item.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#1F77B4] to-[#60a5fa]"
                      />
                    </div>
                  </div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp}
                className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Lock className="h-5 w-5" />, label: '256-bit SSL' },
                  { icon: <Shield className="h-5 w-5" />, label: '2FA Auth' },
                  { icon: <CheckCircle2 className="h-5 w-5" />, label: 'KYC Verified' },
                ].map(b => (
                  <div key={b.label} className="flex flex-col items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] py-4 px-2">
                    <span className="text-[#1F77B4]">{b.icon}</span>
                    <span className="text-[11px] font-semibold text-[#6B7280] text-center">{b.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DEPOSIT & WITHDRAWAL ── */}
      <section className="bg-[#FFFFFF] py-20 border-y border-[#E5E7EB]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-3">
              Local Deposits & Fast Withdrawals
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] max-w-xl mx-auto">
              Fund your account instantly and withdraw within 1 hour using your preferred local method.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Deposit */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-[#1F77B4]/10 p-2.5 text-[#1F77B4]"><Wallet className="h-6 w-6" /></div>
                <div>
                  <p className="font-bold text-[#111827]">Deposit Methods</p>
                  <p className="text-xs text-[#1F77B4] font-semibold">⚡ Instant Credit</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { method: 'UPI', detail: 'PhonePe, GPay, Paytm & all UPI apps', time: 'Instant' },
                  { method: 'Bank Transfer', detail: 'NEFT / RTGS / IMPS', time: 'Instant' },
                  { method: 'Crypto', detail: 'USDT, BTC, ETH & more', time: 'Instant' },
                ].map(m => (
                  <div key={m.method} className="flex items-center justify-between rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{m.method}</p>
                      <p className="text-[11px] text-[#6B7280]">{m.detail}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1F77B4] bg-[#1F77B4]/10 px-2.5 py-1 rounded-full">{m.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Withdrawal */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
              className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-xl bg-[#1F77B4]/10 p-2.5 text-[#1F77B4]"><Clock className="h-6 w-6" /></div>
                <div>
                  <p className="font-bold text-[#111827]">Withdrawal Methods</p>
                  <p className="text-xs text-[#1F77B4] font-semibold">🕐 Within 1 Hour</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { method: 'Bank Transfer', detail: 'Direct to your registered bank account', time: '≤ 1 Hour' },
                  { method: 'UPI', detail: 'Instant UPI payout to your ID', time: '≤ 1 Hour' },
                  { method: 'Crypto', detail: 'USDT, BTC, ETH withdrawal', time: '≤ 1 Hour' },
                ].map(m => (
                  <div key={m.method} className="flex items-center justify-between rounded-xl bg-[#FFFFFF] border border-[#E5E7EB] px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-[#111827]">{m.method}</p>
                      <p className="text-[11px] text-[#6B7280]">{m.detail}</p>
                    </div>
                    <span className="text-xs font-bold text-[#1F77B4] bg-[#1F77B4]/10 px-2.5 py-1 rounded-full">{m.time}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="rounded-2xl border border-[#1F77B4]/20 bg-[#1F77B4]/5 p-5 text-center">
            <p className="text-sm text-[#6B7280]">
              <span className="font-semibold text-[#111827]">Zero deposit fees</span> · <span className="font-semibold text-[#111827]">No hidden charges</span> · <span className="font-semibold text-[#111827]">Funds always in your control</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20" style={{ background: "#F7F9FC" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-3">
              What Our Traders Say
            </motion.h2>
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
                className="rounded-2xl border border-[#E5E7EB] bg-[#FFFFFF] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#1F77B4] text-[#1F77B4]" />
                  ))}
                </div>
                <p className="text-sm text-[#6B7280] mb-5 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#111827] text-sm">{r.name}</p>
                    <p className="text-[11px] text-[#6B7280]">{r.city}</p>
                  </div>
                  <span className="rounded-full bg-[#1F77B4]/10 px-3 py-1 text-xs font-bold text-[#1F77B4]">{r.ret}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20" style={{ background: "#F7F9FC" }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-[#111827] mb-3">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-[#E5E7EB] bg-[#FFFFFF] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-[#111827] text-sm">{faq.q}</span>
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
                      <p className="px-5 pb-4 text-sm text-[#6B7280] leading-relaxed border-t border-[#E5E7EB] pt-3">
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

      {/* ── FINAL CTA ── */}
      <section className="bg-[#FFFFFF] border-t border-[#E5E7EB] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-[#111827] mb-4">
              Ready to Let Your <span className="text-[#1F77B4]">Money Work</span> for You?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6B7280] mb-8 text-lg">
              Join 10 Lakh+ traders already growing with ECMarket Pro.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              <Link href="/auth/register">
                <a className="btn-green flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl">
                  Open Free Account <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
              <Link href="/markets">
                <a className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-[#374151] bg-[#F7F9FC] hover:bg-[#F0F0F0] border border-[#E5E7EB] rounded-xl transition-colors">
                  Explore Markets
                </a>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 text-xs text-[#6B7280]">
              No lock-in period · Segregated client funds · 24/7 automated trading
            </motion.p>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
