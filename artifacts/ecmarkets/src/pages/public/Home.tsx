import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Zap, TrendingUp, ChevronDown, ChevronUp,
  ArrowRight, Users, Globe, Lock, BarChart2, Wallet, Clock,
  Star, CheckCircle2
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
    <div className="bg-[#0C0E15] border-b border-[#1A1D27] overflow-hidden">
      <div className="flex items-center" style={{ animation: 'ticker-scroll 30s linear infinite' }}>
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2 px-6 py-2 shrink-0 border-r border-[#1A1D27] last:border-r-0">
            <span className="text-xs">{item.flag}</span>
            <span className="text-[11px] font-semibold text-[#848E9C] tracking-wide">{item.symbol}</span>
            <span className="text-[11px] font-bold text-white tabular-nums">{item.price.toLocaleString()}</span>
            <span className={`text-[10px] font-medium tabular-nums ${item.up ? 'text-[#00C274]' : 'text-red-400'}`}>
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
  { q: 'How long does it take to process a withdrawal?', a: 'Withdrawal requests are processed within 24 hours. The amount is transferred directly to your registered bank account.' },
  { q: 'What is algorithmic trading?', a: 'Algorithmic trading uses pre-programmed rules to automatically execute trades — eliminating emotional bias and operating 24/7 with precision.' },
  { q: 'Do I need any trading experience?', a: 'Not at all. Our platform is designed for beginners and professionals alike. Simply select a strategy and let the system handle the rest.' },
  { q: 'Are my funds safe?', a: 'Yes. Client funds are held in segregated accounts and the platform uses 256-bit SSL encryption to protect all data and transactions.' },
  { q: 'How do I get started?', a: 'Register an account, complete your KYC verification, make a deposit, and activate your preferred trading strategy — it takes just a few minutes.' },
];

export function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <PublicLayout>
      <LiveTicker />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-[#060709] pt-14 pb-24 md:pt-20 md:pb-32">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[600px] w-[600px] rounded-full bg-[#00C274]/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="mb-5">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#00C274]/30 bg-[#00C274]/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-[#00C274]">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C274] opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C274]" />
                  </span>
                  Live Algo Trading — Active Now
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-[68px] font-black text-white leading-[1.05] tracking-tight mb-6">
                Trade Smarter.<br />
                <span className="text-[#00C274]">Profit Daily.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-[#848E9C] mb-8 max-w-md leading-relaxed">
                Driven by precision algorithms, built to grow your wealth consistently. No trading experience required.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-8">
                <Link href="/auth/register">
                  <a className="btn-green flex items-center gap-2 px-7 py-3.5 text-base font-bold rounded-xl">
                    Open Live Account <ArrowRight className="h-4 w-4" />
                  </a>
                </Link>
                <Link href="/auth/login">
                  <a className="flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-white bg-[#181B23] hover:bg-[#1E222D] border border-[#2A2D3A] rounded-xl transition-colors">
                    Sign In
                  </a>
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
                {[
                  'No trading experience needed',
                  '100% secure & transparent',
                  'Segregated client funds',
                ].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-[13px] text-[#848E9C]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#00C274] shrink-0" /> {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Dashboard card */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="relative rounded-2xl border border-[#1A1D27] bg-[#0C0E15] p-6 shadow-2xl shadow-black/50">
                {/* top bar */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-[#848E9C]">Total Portfolio Value</p>
                    <p className="text-3xl font-black text-white mt-1">₹4,85,290<span className="text-lg">.00</span></p>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-[#00C274]/15 px-3 py-1.5 text-[#00C274] text-sm font-bold">
                    <TrendingUp className="h-3.5 w-3.5" /> +12.4% MTD
                  </div>
                </div>

                {/* mini chart */}
                <div className="h-28 mb-5 rounded-xl bg-[#060709] flex items-end overflow-hidden px-1 gap-[3px]">
                  {[40,55,45,65,58,72,68,80,75,90,85,95,88,100].map((h, i) => (
                    <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: `linear-gradient(to top, #00C274, #00C27440)` }} />
                  ))}
                </div>

                {/* stats grid */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Today's Profit", value: '+₹2,840', green: true },
                    { label: 'Active Strategy', value: 'Quantum Algo', green: true },
                    { label: 'Monthly ROI', value: '+8.3%', green: true },
                    { label: 'Status', value: '● Live', green: true },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl bg-[#060709] p-3">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-[#848E9C] mb-1">{s.label}</p>
                      <p className={`text-sm font-bold ${s.green ? 'text-[#00C274]' : 'text-white'}`}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ── */}
      <section className="bg-[#0C0E15] border-y border-[#1A1D27] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { display: '10 Lakh+', label: 'Active Traders' },
              { display: '₹1.2 Lakh Cr+', label: 'Assets Managed' },
              { display: '10 Years', label: 'In the Market' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-black text-[#00C274]">{s.display}</p>
                <p className="text-sm text-[#848E9C] mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRADING INSTRUMENTS ── */}
      <section className="bg-[#060709] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-3">
              Trade the World's Best Markets
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#848E9C] max-w-xl mx-auto">
              Forex, Commodities, Indices, and Crypto — all under one algorithmic roof.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { name: 'Forex', icon: '💱', desc: '40+ pairs', color: '#00C274' },
              { name: 'Gold', icon: '🥇', desc: 'XAU/USD', color: '#FFD700' },
              { name: 'Indices', icon: '📊', desc: 'US30, NAS100', color: '#00C274' },
              { name: 'Crypto', icon: '₿', desc: 'BTC, ETH', color: '#F7931A' },
              { name: 'Commodities', icon: '🛢️', desc: 'Oil, Gas', color: '#00C274' },
              { name: 'Stocks', icon: '📈', desc: 'Top 50', color: '#00C274' },
            ].map(item => (
              <motion.div key={item.name} variants={fadeUp}
                className="group rounded-2xl border border-[#1A1D27] bg-[#0C0E15] p-5 text-center hover:border-[#00C274]/40 transition-all cursor-pointer">
                <div className="text-3xl mb-3">{item.icon}</div>
                <p className="font-bold text-white text-sm">{item.name}</p>
                <p className="text-[11px] text-[#848E9C] mt-1">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-[#0C0E15] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-3">
              Start in 3 Simple Steps
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#848E9C]">No experience needed. We do the heavy lifting.</motion.p>
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
                desc: 'Deposit from ₹20,000 via UPI, IMPS, or bank transfer. Instant credit.',
              },
              {
                step: '03', icon: <BarChart2 className="h-7 w-7" />, title: 'Algo Trades for You',
                desc: 'Our algorithms execute trades 24/7. Monitor profits from your dashboard.',
              },
            ].map((s, i) => (
              <motion.div key={s.step} variants={fadeUp}
                className="relative rounded-2xl border border-[#1A1D27] bg-[#060709] p-8 overflow-hidden group hover:border-[#00C274]/30 transition-all">
                <div className="absolute top-4 right-5 text-6xl font-black text-[#00C274]/5 select-none">{s.step}</div>
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-[#00C274]/10 p-3 text-[#00C274]">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY ECMarket Pro ── */}
      <section className="bg-[#060709] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-4">
                Why Traders Choose ECMarket Pro
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[#848E9C] mb-8 leading-relaxed">
                We combine institutional-grade algorithms with a client-first approach — transparent fees, real-time reporting, and funds you can withdraw anytime.
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  { icon: <Zap className="h-5 w-5" />, title: 'Millisecond Execution', desc: 'Orders placed in &lt;50ms with co-located servers.' },
                  { icon: <Shield className="h-5 w-5" />, title: 'Segregated Funds', desc: 'Your money is held separately — never used for operations.' },
                  { icon: <Clock className="h-5 w-5" />, title: '24/7 Automation', desc: 'Algorithms trade round the clock, even when you sleep.' },
                  { icon: <Globe className="h-5 w-5" />, title: 'Global Markets', desc: 'Access Forex, Crypto, Indices, and Commodities from one account.' },
                ].map(f => (
                  <motion.div key={f.title} variants={fadeUp}
                    className="flex items-start gap-4 rounded-xl border border-[#1A1D27] bg-[#0C0E15] p-4">
                    <div className="rounded-lg bg-[#00C274]/10 p-2.5 text-[#00C274] shrink-0">{f.icon}</div>
                    <div>
                      <p className="font-bold text-white text-sm mb-0.5" dangerouslySetInnerHTML={{ __html: f.title }} />
                      <p className="text-[#848E9C] text-xs" dangerouslySetInnerHTML={{ __html: f.desc }} />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Security trust bars */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
              className="space-y-5">
              <motion.div variants={fadeUp} className="rounded-2xl border border-[#1A1D27] bg-[#0C0E15] p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-[#848E9C] mb-5">Platform Security</p>
                {[
                  { label: 'Fund Security', val: 98 },
                  { label: 'Uptime (12 Months)', val: 99 },
                  { label: 'Trade Accuracy', val: 94 },
                  { label: 'KYC Verification Speed', val: 91 },
                ].map((item, i) => (
                  <div key={item.label} className="mb-4 last:mb-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-white font-medium">{item.label}</span>
                      <span className="text-[#00C274] font-bold">{item.val}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#1A1D27] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.val}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: i * 0.15, ease: 'easeOut' }}
                        className="h-full rounded-full bg-gradient-to-r from-[#00C274] to-[#33d494]"
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
                  <div key={b.label} className="flex flex-col items-center gap-2 rounded-xl border border-[#1A1D27] bg-[#060709] py-4 px-2">
                    <span className="text-[#00C274]">{b.icon}</span>
                    <span className="text-[11px] font-semibold text-[#848E9C] text-center">{b.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-[#0C0E15] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-3">
              What Our Traders Say
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#848E9C]">Real results from real clients.</motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-3 gap-5">
            {[
              { name: 'Rahul Sharma', city: 'Mumbai', ret: '+38% in 4 months', text: 'Platform ne meri zindagi badal di. Ek baar fund karo, algo baaki sab karta hai.', stars: 5 },
              { name: 'Priya Nair', city: 'Bangalore', ret: '+52% in 6 months', text: 'Withdrawal process bahut smooth hai. 24 hours me paise aa gaye bina kisi issue ke.', stars: 5 },
              { name: 'Amit Verma', city: 'Delhi', ret: '+29% in 3 months', text: 'Best decision tha jo maine ECMarket Pro join kiya. Transparent aur professional platform.', stars: 5 },
            ].map(r => (
              <motion.div key={r.name} variants={fadeUp}
                className="rounded-2xl border border-[#1A1D27] bg-[#060709] p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: r.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#00C274] text-[#00C274]" />
                  ))}
                </div>
                <p className="text-sm text-[#848E9C] mb-5 leading-relaxed">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{r.name}</p>
                    <p className="text-[11px] text-[#848E9C]">{r.city}</p>
                  </div>
                  <span className="rounded-full bg-[#00C274]/10 px-3 py-1 text-xs font-bold text-[#00C274]">{r.ret}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-[#060709] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-black text-white mb-3">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-xl border border-[#1A1D27] bg-[#0C0E15] overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-white text-sm">{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="h-4 w-4 text-[#00C274] shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-[#848E9C] shrink-0" />}
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}>
                      <p className="px-5 pb-4 text-sm text-[#848E9C] leading-relaxed border-t border-[#1A1D27] pt-3">
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
      <section className="bg-[#0C0E15] border-t border-[#1A1D27] py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-black text-white mb-4">
              Ready to Let Your <span className="text-[#00C274]">Money Work</span> for You?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#848E9C] mb-8 text-lg">
              Join 10 Lakh+ traders already growing with ECMarket Pro.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              <Link href="/auth/register">
                <a className="btn-green flex items-center gap-2 px-8 py-4 text-base font-bold rounded-xl">
                  Open Free Account <ArrowRight className="h-4 w-4" />
                </a>
              </Link>
              <Link href="/markets">
                <a className="flex items-center gap-2 px-8 py-4 text-base font-semibold text-white bg-[#181B23] hover:bg-[#1E222D] border border-[#2A2D3A] rounded-xl transition-colors">
                  Explore Markets
                </a>
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-5 text-xs text-[#848E9C]">
              No lock-in period · Segregated client funds · 24/7 automated trading
            </motion.p>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
