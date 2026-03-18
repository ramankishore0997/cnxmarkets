import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { Shield, Zap, TrendingUp, Check, Lock, Headphones, ChevronDown } from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

function Counter({ end, suffix = "", prefix = "", decimals = 0 }: { end: number; suffix?: string; prefix?: string; decimals?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1800, 1);
      setCount(parseFloat((p * end).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, end, decimals]);
  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const equityData = [
  { v: 72 }, { v: 78 }, { v: 75 }, { v: 84 }, { v: 82 },
  { v: 90 }, { v: 88 }, { v: 96 }, { v: 94 }, { v: 102 },
];

const INSTRUMENTS = [
  { pair: 'EUR/USD', base: 1.08542, change: +0.0012, pct: +0.11 },
  { pair: 'GBP/USD', base: 1.27180, change: -0.0024, pct: -0.19 },
  { pair: 'Gold',    base: 2345.60, change: +8.40,   pct: +0.36 },
  { pair: 'USD/JPY', base: 154.320, change: +0.430,  pct: +0.28 },
  { pair: 'US30',    base: 38420.0, change: -125.0,  pct: -0.32 },
  { pair: 'USD/INR', base: 83.450,  change: +0.085,  pct: +0.10 },
];

export function Home() {
  const [prices, setPrices] = useState(INSTRUMENTS.map(i => i.base));
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setPrices(INSTRUMENTS.map((inst, i) => {
        const wave = Math.sin(tick * 0.4 + i * 1.9) * inst.base * 0.0003;
        return parseFloat((inst.base + wave).toFixed(inst.pair === 'Gold' || inst.pair === 'US30' ? 2 : inst.pair === 'USD/INR' ? 3 : 5));
      }));
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const faqs = [
    { q: "What is the minimum deposit?", a: "The minimum deposit to activate your account is ₹20,000. This gives you access to all core algorithmic strategies." },
    { q: "Is my capital safe?", a: "Yes. All client funds are held in segregated Tier-1 bank accounts, completely separate from company funds. We hold trading authority only — you control all deposits and withdrawals." },
    { q: "Do I need trading experience?", a: "No experience needed. CNXMarkets is a fully automated platform. Once you fund your account, our algorithms handle everything — signal generation, execution, and risk management." },
    { q: "Can I withdraw anytime?", a: "Yes. There is no lock-in period. You can pause trading and request a withdrawal at any time directly from your dashboard. Withdrawals are processed within 24–48 hours." },
  ];

  return (
    <PublicLayout>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden py-20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00C274]/6 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#00C274]/4 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="visible">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-[#00C274]/10 border border-[#00C274]/25 text-[#00C274] text-sm font-semibold px-4 py-1.5 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-[#00C274] animate-pulse" />
                Live Algorithmic Trading — Active Now
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] mb-6">
                Trade Smarter.<br />
                <span className="text-gradient-green">Profit Daily.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-[#848E9C] mb-10 leading-relaxed max-w-lg">
                Institutional-grade algorithmic trading — automated, precise, and built for consistent returns. Start with just ₹20,000.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/register" className="btn-green text-base py-4 px-8 text-center font-bold">
                  Open Live Account
                </Link>
                <Link href="/auth/login" className="btn-ghost text-base py-4 px-8 text-center font-semibold">
                  Sign In
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-6 mt-10 text-sm text-[#848E9C]">
                {[
                  { icon: Check, text: "No trading experience needed" },
                  { icon: Check, text: "Withdraw anytime" },
                  { icon: Check, text: "Segregated client funds" },
                ].map((item, i) => (
                  <span key={i} className="flex items-center gap-1.5">
                    <item.icon className="w-4 h-4 text-[#00C274]" />{item.text}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Portfolio Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="relative bg-[#0C0E15]/90 border border-[#181B23] rounded-2xl p-6 shadow-2xl backdrop-blur">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-[#848E9C] text-xs font-semibold uppercase tracking-wider mb-1">Total Portfolio Value</p>
                    <h2 className="text-3xl font-black text-white">₹4,85,290.00</h2>
                  </div>
                  <div className="flex items-center gap-2 bg-[#00C274]/15 border border-[#00C274]/30 rounded-xl px-4 py-2">
                    <TrendingUp className="w-4 h-4 text-[#00C274]" />
                    <span className="text-[#00C274] font-black text-sm">+12.4% MTD</span>
                  </div>
                </div>

                <div className="h-36 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityData}>
                      <defs>
                        <linearGradient id="heroGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C274" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#00C274" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke="#00C274" strokeWidth={2.5} fill="url(#heroGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Today's Profit", val: "+₹2,840", pos: true },
                    { label: "Active Strategy", val: "Quantum Algo", pos: true },
                    { label: "Win Rate (MTD)", val: "71.4%", pos: true },
                    { label: "Status", val: "● Live", pos: true },
                  ].map((s, i) => (
                    <div key={i} className="bg-[#060709] border border-[#181B23] rounded-xl px-4 py-3">
                      <p className="text-[#848E9C] text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
                      <p className={`font-bold text-sm ${s.pos ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── LIVE INSTRUMENTS ─────────────────────────────── */}
      <section className="py-10 border-y border-[#181B23] bg-[#060709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00C274] animate-pulse" />
            <span className="text-[#848E9C] text-sm font-semibold uppercase tracking-wider">Live Market Prices</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {INSTRUMENTS.map((inst, i) => {
              const live = prices[i];
              const isUp = inst.pct > 0;
              return (
                <div key={inst.pair} className="bg-[#0C0E15] border border-[#181B23] rounded-xl p-4 hover:border-[#00C274]/40 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-bold text-sm">{inst.pair}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isUp ? 'bg-[#00C274]/10 text-[#00C274]' : 'bg-[#CF304A]/10 text-[#CF304A]'}`}>
                      {isUp ? '+' : ''}{inst.pct.toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-white font-black text-lg tabular-nums">{live}</p>
                  <p className={`text-xs font-semibold mt-1 ${isUp ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                    {isUp ? '▲' : '▼'} {Math.abs(inst.change).toFixed(inst.pair === 'Gold' || inst.pair === 'US30' ? 2 : inst.pair === 'USD/INR' ? 3 : 4)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── PLATFORM STATS ───────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { label: "Active Traders", val: 50000, suffix: "+", prefix: "" },
              { label: "Avg Monthly Return", val: 7.2, suffix: "%", prefix: "+", decimals: 1 },
              { label: "Win Rate", val: 71.4, suffix: "%", prefix: "", decimals: 1 },
              { label: "Uptime SLA", val: 99.99, suffix: "%", prefix: "", decimals: 2 },
            ].map((s, i) => (
              <motion.div key={i} variants={fadeUp} className="p-6">
                <p className="text-4xl font-black text-[#00C274] mb-2">
                  <Counter end={s.val} suffix={s.suffix} prefix={s.prefix} decimals={s.decimals ?? 0} />
                </p>
                <p className="text-[#848E9C] text-sm font-semibold">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY CNXMARKETS ───────────────────────────────── */}
      <section className="py-16 border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Why CNXMarkets?</h2>
            <p className="text-[#848E9C] text-lg max-w-xl mx-auto">Everything you need to trade algorithmically — nothing you don't.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: "Sub-5ms Execution", desc: "Co-located servers ensure your trades execute in milliseconds, never missing a move." },
              { icon: TrendingUp, title: "4–8% Daily ROI", desc: "Our algorithms target consistent daily returns across Forex, Gold, and Indices." },
              { icon: Lock, title: "Segregated Funds", desc: "Your capital is held in Tier-1 bank accounts. Completely separate from company assets." },
              { icon: Headphones, title: "Dedicated Support", desc: "A real account manager is assigned to every client. We're always available." },
            ].map((f, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-[#0C0E15] border border-[#181B23] rounded-2xl p-7 hover:border-[#00C274]/40 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-[#00C274]/10 border border-[#00C274]/20 flex items-center justify-center mb-5 group-hover:bg-[#00C274]/20 transition-all">
                  <f.icon className="w-6 h-6 text-[#00C274]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Start in 3 Simple Steps</h2>
            <p className="text-[#848E9C] text-lg">From registration to live trading in under 24 hours.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-8 left-[18%] right-[18%] h-px bg-gradient-to-r from-transparent via-[#00C274]/40 to-transparent" />
            {[
              { num: "01", title: "Create Account", desc: "Register in minutes. Fill in your basic details and verify your email to get started." },
              { num: "02", title: "Complete KYC & Fund", desc: "Submit your PAN & Aadhaar for verification, then deposit your capital securely via bank transfer." },
              { num: "03", title: "Algorithms Go Live", desc: "Our system assigns the best strategy for your profile. Sit back — the algorithms do the work." },
            ].map((step, i) => (
              <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-[#00C274] text-black flex items-center justify-center text-xl font-black mb-6 shadow-lg shadow-[#00C274]/25">
                  {step.num}
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mt-12">
            <Link href="/auth/register" className="btn-green text-base py-4 px-10 font-bold">
              Open Free Account
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── TRADING INSTRUMENTS DETAIL ───────────────────── */}
      <section className="py-16 border-y border-[#181B23] bg-[#060709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">What We Trade</h2>
            <p className="text-[#848E9C] text-lg">Our algorithms operate only in the most liquid markets.</p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Forex", emoji: "💱",
                pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF"],
                desc: "The world's largest market — ₹7.5T daily volume. Tight spreads, 24/5 access, deep liquidity.",
                stat: "4% daily ROI target",
              },
              {
                name: "Gold (XAU/USD)", emoji: "🏅",
                pairs: ["XAU/USD Spot", "Gold Futures", "XAUEUR", "Gold CFD"],
                desc: "High-volatility safe-haven with strong trend momentum — ideal for our breakout strategies.",
                stat: "Avg 68% win rate",
              },
              {
                name: "Indices", emoji: "📈",
                pairs: ["US30 (Dow Jones)", "S&P 500", "NASDAQ 100", "Nifty 50"],
                desc: "Capture macro equity movements without individual stock risk. Traded around global sessions.",
                stat: "24/5 auto-trading",
              },
            ].map((m, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-[#0C0E15] border border-[#181B23] rounded-2xl p-7 hover:border-[#00C274]/30 transition-all">
                <div className="text-4xl mb-4">{m.emoji}</div>
                <h3 className="text-white font-black text-xl mb-3">{m.name}</h3>
                <p className="text-[#848E9C] text-sm mb-5 leading-relaxed">{m.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {m.pairs.map(p => (
                    <span key={p} className="bg-[#060709] border border-[#181B23] text-[#EAECEF] text-xs font-semibold px-3 py-1 rounded-lg">{p}</span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 text-[#00C274] text-sm font-bold">
                  <TrendingUp className="w-4 h-4" />{m.stat}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SECURITY ─────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <motion.div variants={fadeUp}>
                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Your Funds Are<br /><span className="text-gradient-green">100% Safe</span></h2>
                <p className="text-[#848E9C] text-lg mb-8 leading-relaxed">We take security seriously — your capital is protected by the same systems used by institutional banks.</p>
              </motion.div>
              <div className="space-y-4">
                {[
                  { icon: Lock, title: "Segregated Tier-1 Bank Accounts", desc: "Client funds are held completely separate from company assets. Always." },
                  { icon: Shield, title: "256-bit AES Encryption", desc: "All data and transactions are protected with military-grade encryption." },
                  { icon: Check, title: "KYC & AML Compliant", desc: "Full identity verification on every account. No anonymous trading." },
                  { icon: Zap, title: "Instant Kill Switch", desc: "If risk thresholds are breached, all strategies pause automatically." },
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#00C274]/10 border border-[#00C274]/20 flex items-center justify-center shrink-0">
                      <item.icon className="w-5 h-5 text-[#00C274]" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-[#848E9C] text-sm">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <div className="bg-[#0C0E15] border border-[#181B23] rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-[#00C274]/10 border-2 border-[#00C274]/30 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-10 h-10 text-[#00C274]" />
                  </div>
                  <h3 className="text-white font-black text-xl">Platform Trust Score</h3>
                </div>
                {[
                  { label: "Fund Safety", pct: 100 },
                  { label: "Execution Reliability", pct: 99.99 },
                  { label: "Strategy Win Rate", pct: 71.4 },
                  { label: "Client Satisfaction", pct: 94.8 },
                ].map((s, i) => (
                  <div key={i} className="mb-5">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[#848E9C]">{s.label}</span>
                      <span className="text-[#00C274] font-bold">{s.pct}%</span>
                    </div>
                    <div className="h-2 bg-[#181B23] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: i * 0.15 }}
                        className="h-full bg-gradient-to-r from-[#00C274] to-[#33d494] rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section className="py-16 border-y border-[#181B23] bg-[#060709]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Clients Who Changed How They Trade</h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Rajesh K.", city: "Mumbai", returns: "+36.8% in 3 months", text: "I was skeptical at first, but the returns have been incredibly consistent. The platform literally does all the work — I just check my account every morning." },
              { name: "Priya S.", city: "Bangalore", returns: "+41.2% in 4 months", text: "Exceptional execution. No emotional trading, no sleepless nights watching charts. The algorithms handle everything and my portfolio keeps growing." },
              { name: "Amit P.", city: "Delhi", returns: "+39.0% in 3.5 months", text: "The transparency is what I love most. I can see every trade, every P&L, every decision the algorithm makes. Complete confidence in the platform." },
            ].map((t, i) => (
              <motion.div key={i} variants={fadeUp}
                className="bg-[#0C0E15] border border-[#181B23] rounded-2xl p-7">
                <div className="flex text-[#00C274] text-lg mb-4">★★★★★</div>
                <p className="text-[#EAECEF] text-sm leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center justify-between border-t border-[#181B23] pt-5">
                  <div>
                    <p className="text-white font-bold">{t.name}</p>
                    <p className="text-[#848E9C] text-xs">{t.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#00C274] font-black text-sm">{t.returns}</p>
                    <p className="text-[#848E9C] text-xs">Verified Client</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-3">Common Questions</h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}
                className={`bg-[#0C0E15] border rounded-xl overflow-hidden transition-all ${activeFaq === i ? 'border-[#00C274]/50' : 'border-[#181B23]'}`}>
                <button
                  className="w-full text-left px-6 py-5 flex justify-between items-center"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="text-white font-semibold pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-[#00C274] shrink-0 transition-transform duration-200 ${activeFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-5 text-[#848E9C] text-sm leading-relaxed border-t border-[#181B23] pt-4">
                    {faq.a}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────── */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#00C274]/15 via-transparent to-[#00C274]/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C274]/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00C274]/50 to-transparent" />

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              Start Earning with<br /><span className="text-gradient-green">Algorithmic Trading</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#848E9C] text-lg mb-10">
              Join 50,000+ traders who have automated their trading.<br />Minimum deposit ₹20,000. No experience required.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="btn-green text-lg py-4 px-12 font-bold">
                Open Live Account
              </Link>
              <Link href="/contact" className="btn-ghost text-lg py-4 px-12 font-semibold">
                Talk to an Advisor
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-[#848E9C] text-xs mt-8">
              ⚠️ Trading involves risk. Only invest capital you can afford to lose. Past performance does not guarantee future results.
            </motion.p>
          </motion.div>
        </div>
      </section>

    </PublicLayout>
  );
}
