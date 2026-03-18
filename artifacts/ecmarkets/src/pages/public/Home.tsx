import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  Shield, Zap, Activity, Globe, Lock, Cpu, Smartphone, TrendingUp, Check,
  Database, Server, GitBranch, Eye, BarChart2, BellRing, Users, Award,
  BookOpen, FileText, Headphones, Building2, ChevronDown, Star
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid } from 'recharts';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

function Counter({ end, suffix = "", prefix = "", duration = 2 }: { end: number, suffix?: string, prefix?: string, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      let startTimestamp: number | null = null;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
        setCount(Math.floor(progress * end));
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
  }, [isInView, end, duration]);

  const display = count === end && String(end).includes('.') ? end : count;
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export function Home() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const features = [
    { title: "Advanced Algorithms", description: "Proprietary models utilizing multi-factor analysis across diverse market conditions.", icon: Cpu },
    { title: "Low Latency Infrastructure", description: "Co-located servers ensuring millisecond execution to capture fleeting opportunities.", icon: Zap },
    { title: "Real-Time Analytics", description: "Monitor your equity curve, open positions, and algorithmic logic live.", icon: Activity },
    { title: "Risk Management", description: "Hard-coded risk limits, automated kill switches, and strict drawdown controls.", icon: Shield },
    { title: "Secure Platform", description: "Bank-grade encryption, segregated tier-1 accounts, and stringent access controls.", icon: Lock },
    { title: "Mobile Access", description: "Keep track of your portfolio's performance on the go with our responsive interface.", icon: Smartphone },
  ];

  const steps = [
    { num: "1", title: "Create Account", desc: "Sign up in minutes with basic details." },
    { num: "2", title: "Verify KYC", desc: "Complete seamless identity verification." },
    { num: "3", title: "Fund Account", desc: "Deposit capital securely." },
    { num: "4", title: "Activate Strategy", desc: "Allocate to algorithms and relax." },
  ];

  const testimonials = [
    { name: "Rajesh K.", loc: "Mumbai", text: "The platform's execution speed is phenomenal. I've completely moved away from manual trading." },
    { name: "Sarah M.", loc: "London", text: "Transparent performance and excellent risk management. Finally, an institutional tool for retail." },
    { name: "Amit P.", loc: "Delhi", text: "The automated allocations saved me countless hours. The monthly returns speak for themselves." },
    { name: "Priya S.", loc: "Bangalore", text: "Exceptional platform. The quant strategies provide stable returns even in volatile markets." }
  ];

  const faqs = [
    { q: "What is the minimum capital to get started?", a: "The minimum capital to activate the Starter Account is ₹20,000. The Professional tier starts at ₹1,00,000, providing access to all premium strategies and priority execution." },
    { q: "Is my capital safe?", a: "Yes. Funds are held in segregated tier-1 bank accounts entirely separate from company assets. We hold trading authority only — we cannot withdraw your funds under any circumstances. Only you control deposits and withdrawals." },
    { q: "Do I need prior trading experience?", a: "No prior trading experience is required. CNXMarkets is a fully managed algorithmic trading platform. Once you allocate capital to a strategy, our systems handle all execution and monitoring automatically." },
    { q: "Can I withdraw my capital at any time?", a: "Absolutely. There is zero lock-in period on any account tier. You can pause strategy execution and request a withdrawal at any time directly from your dashboard." },
    { q: "Which markets do your algorithms trade?", a: "Our core strategies operate primarily on major Forex pairs (EUR/USD, GBP/USD, USD/JPY) and high-liquidity commodities like Gold (XAU/USD). All markets are chosen for maximum liquidity." },
    { q: "How do I monitor my portfolio?", a: "You get access to a real-time analytics dashboard showing your live equity curve, open positions, closed trade history, and strategy performance metrics — updated tick-by-tick." },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Growth engine constants
  const STANDARD_DAILY = 4.0;
  const RAZOR_DAILY = 8.0;
  const STANDARD_MONTHLY = parseFloat(((Math.pow(1.04, 30) - 1) * 100).toFixed(2));
  const RAZOR_MONTHLY = parseFloat(((Math.pow(1.08, 30) - 1) * 100).toFixed(2));
  const isRazrName = (n: string) => n.toLowerCase().includes('razr') || n.toLowerCase().includes('razor');

  const stratTableRows = [
    { name: "RazrMarket Strategy", trades: "1,247", wr: "78.0%" },
    { name: "Quantum Trend",       trades: "892",   wr: "68.9%" },
    { name: "Gold Breakout",       trades: "634",   wr: "71.5%" },
    { name: "Momentum Alpha",      trades: "1,089", wr: "66.3%" },
    { name: "Velocity FX",         trades: "2,341", wr: "61.8%" },
  ];

  const [liveRets, setLiveRets] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    stratTableRows.forEach(r => { init[r.name] = isRazrName(r.name) ? RAZOR_DAILY : STANDARD_DAILY; });
    return init;
  });

  useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      tick++;
      setLiveRets(prev => {
        const next = { ...prev };
        stratTableRows.forEach((r, i) => {
          const base = isRazrName(r.name) ? RAZOR_DAILY : STANDARD_DAILY;
          const wave = Math.sin(tick * 0.5 + i * 1.7) * 0.03;
          next[r.name] = parseFloat((base + wave).toFixed(2));
        });
        return next;
      });
    }, 3_200);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="animated-bg min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-[55%]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#181B23]/50 border border-[#00C274]/30 text-[#00C274] px-4 py-1.5 rounded-full inline-flex text-sm font-semibold mb-6 shadow-[0_0_10px_rgba(0,194,116,0.2)]"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-2 mt-1"></span>
                Live Trading Active • 50,000+ Traders
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-[64px] font-bold text-white leading-[1.1] mb-6 tracking-tight"
              >
                Trade the Global Markets<br />
                <span className="text-gradient-green">with Precision</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-[#848E9C] mb-10 max-w-xl leading-relaxed"
              >
                Institutional-grade algorithmic infrastructure designed for modern traders. Access professional quantitative strategies previously reserved for hedge funds.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-col sm:flex-row gap-4 mb-10"
              >
                <Link href="/auth/register" className="btn-green text-lg py-4 px-8 text-center">
                  Start Trading Now
                </Link>
                <Link href="/markets" className="btn-ghost text-lg py-4 px-8 text-center">
                  Explore Markets
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-6 text-sm text-[#EAECEF] font-medium"
              >
                <span className="flex items-center gap-2">⚡ Institutional Execution</span>
                <span className="flex items-center gap-2">🔒 Bank-Grade Security</span>
                <span className="flex items-center gap-2">📊 Real-Time Analytics</span>
                <span className="flex items-center gap-2">🌐 24/5 Global Markets</span>
              </motion.div>
            </div>

            <div className="lg:w-[45%] w-full relative">
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="card-stealth-gold p-6 md:p-8 w-full"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-[#EAECEF] font-semibold">Portfolio Overview</h3>
                      <span className="bg-[#02C076]/20 text-[#02C076] text-[10px] px-2 py-0.5 rounded font-bold uppercase">Live</span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-1">Total Equity: ₹4,85,290.00</p>
                  </div>
                  <div className="bg-[#00C274]/10 border border-[#00C274]/30 text-[#00C274] flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-md">
                    +12.4% MTD
                  </div>
                </div>
                
                <div className="h-32 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      {val: 400}, {val: 430}, {val: 420}, {val: 460}, 
                      {val: 490}, {val: 480}, {val: 520}
                    ]}>
                      <defs>
                        <linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00C274" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#00C274" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#00C274" strokeWidth={3} fillOpacity={1} fill="url(#colorGreen)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-[#060709] rounded-lg border border-[#181B23]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
                      <div>
                        <p className="font-semibold text-[#EAECEF]">Quantum Algo • Active</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#02C076]">+₹1,240.50</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#060709] rounded-lg border border-[#181B23]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
                      <div>
                        <p className="font-semibold text-[#EAECEF]">Gold Scalper • Active</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#02C076]">+₹890.20</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST METRICS */}
      <section className="section-surface py-12 border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center divide-y md:divide-y-0 md:divide-x divide-[#181B23]">
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter end={50000} suffix="+" /></div>
              <div className="text-sm text-[#848E9C] font-semibold tracking-wider">Traders</div>
            </div>
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter prefix="₹" end={120} suffix="M+" /></div>
              <div className="text-sm text-[#848E9C] font-semibold tracking-wider">Volume</div>
            </div>
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter end={120} suffix="+" /></div>
              <div className="text-sm text-[#848E9C] font-semibold tracking-wider">Countries</div>
            </div>
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter end={99.99} suffix="%" /></div>
              <div className="text-sm text-[#848E9C] font-semibold tracking-wider">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Performance</h2>
            <p className="text-lg text-[#848E9C]">Experience terminal-grade tools and execution speeds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-stealth p-8 group">
                <div className="w-14 h-14 rounded-lg bg-[#060709] border border-[#181B23] flex items-center justify-center mb-6 group-hover:border-[#00C274] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#00C274]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#848E9C] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Terminal-Level Control</h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time portfolio tracking and analytics",
                  "One-click strategy allocation and adjustments",
                  "Detailed trade history and performance metrics",
                  "Instant deposits and fast withdrawals"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#02C076] shrink-0 mt-0.5" />
                    <span className="text-[#EAECEF]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-green inline-block">View Platform</Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="card-stealth p-6 bg-[#060709] border-[#181B23]">
                <div className="flex gap-6 border-b border-[#181B23] pb-4 mb-6">
                  <span className="text-[#00C274] font-semibold border-b-2 border-[#00C274] pb-4 -mb-[17px]">Overview</span>
                  <span className="text-[#848E9C]">Analytics</span>
                  <span className="text-[#848E9C]">Strategies</span>
                </div>
                
                <div className="mb-6 flex justify-between items-end">
                  <div>
                    <p className="text-[#848E9C] text-sm mb-1">Balance</p>
                    <h3 className="text-3xl font-bold text-white">₹4,85,290.00</h3>
                  </div>
                  <span className="bg-[#02C076]/20 text-[#02C076] px-2 py-1 rounded text-sm font-bold">+7.2%</span>
                </div>
                
                <div className="h-40 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{v:20},{v:25},{v:22},{v:30},{v:28},{v:35}]}>
                      <Area type="monotone" dataKey="v" stroke="#00C274" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start in Minutes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-[1px] bg-[#181B23]" />
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-12 h-12 mx-auto bg-[#00C274] text-black rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[#848E9C] text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-stealth p-8">
                <div className="flex text-[#00C274] mb-4">★★★★★</div>
                <p className="text-[#848E9C] mb-6">"{t.text}"</p>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-[#00C274] text-sm">{t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="py-16 section-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Questions?</h2>
          <div className="space-y-4">
            {faqs.slice(0, 4).map((faq, i) => (
              <div key={i} className={`card-stealth overflow-hidden ${activeFaq === i ? 'border-l-2 border-l-[#00C274] border-t-[#181B23] border-r-[#181B23] border-b-[#181B23]' : ''}`}>
                <button 
                  className="w-full text-left px-6 py-4 flex justify-between items-center text-white font-semibold"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`text-[#00C274] transform transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-[#848E9C] text-sm border-t border-[#181B23] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S11 — PLATFORM TECHNOLOGY */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built on Institutional Infrastructure</h2>
              <p className="text-[#848E9C] max-w-2xl mx-auto">Three-layer architecture designed for institutional-grade performance and reliability.</p>
            </motion.div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div variants={fadeUp} className="space-y-6">
                {[
                  { layer: "01", title: "Data Ingestion", desc: "50+ market feeds, real-time tick data, institutional liquidity providers", icon: Database },
                  { layer: "02", title: "Strategy Engine", desc: "Proprietary algorithms, risk management, backtesting & signal generation", icon: Cpu },
                  { layer: "03", title: "Execution Layer", desc: "Co-located servers, <5ms latency, smart order routing & trade monitoring", icon: Zap },
                ].map((item, i) => (
                  <div key={i} className="card-stealth p-6 border-l-4 border-l-[#00C274] flex gap-5">
                    <span className="text-2xl font-black text-[#00C274] shrink-0">{item.layer}</span>
                    <div>
                      <h3 className="font-bold text-white mb-1">{item.title}</h3>
                      <p className="text-[#848E9C] text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={stagger} className="grid grid-cols-2 gap-4">
                {[
                  { val: "<5ms", label: "Execution Latency" },
                  { val: "99.99%", label: "System Uptime" },
                  { val: "50+", label: "Integrated Brokers" },
                  { val: "10M+", label: "Signals / Day" },
                ].map((s, i) => (
                  <motion.div key={i} variants={fadeUp} className="card-stealth p-6 text-center">
                    <p className="text-2xl font-black text-[#00C274] mb-1">{s.val}</p>
                    <p className="text-xs text-[#848E9C] uppercase tracking-wider">{s.label}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* S17 — SECURITY */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Bank-Grade Security Infrastructure</h2>
          </div>
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Lock, title:"256-bit AES Encryption", desc:"All data encrypted in transit and at rest using military-grade standards." },
              { icon: Shield, title:"Segregated Client Funds", desc:"Your capital is held in Tier-1 bank accounts, separate from company assets." },
              { icon: Eye, title:"2FA Authentication", desc:"Two-factor authentication required for all account actions and withdrawals." },
              { icon: Award, title:"Client Fund Protection", desc:"All client capital held in segregated tier-1 bank accounts, entirely separate from company assets." },
              { icon: Activity, title:"Real-Time Monitoring", desc:"24/7 automated surveillance of all positions and system performance." },
              { icon: Zap, title:"Instant Kill Switch", desc:"Automatic strategy deactivation when risk thresholds are breached." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="card-stealth p-6 group">
                <div className="w-12 h-12 rounded-lg bg-[#060709] border border-[#181B23] flex items-center justify-center mb-4 group-hover:border-[#00C274] transition-colors">
                  <item.icon className="w-5 h-5 text-[#00C274]" />
                </div>
                <h3 className="font-bold text-white mb-2">{item.title}</h3>
                <p className="text-[#848E9C] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
          <div className="text-center card-stealth-gold p-4 rounded-xl">
            <p className="text-[#00C274] font-bold">🔐 Your capital is protected by institutional-grade security systems. We never have withdrawal authority over your funds.</p>
          </div>
        </div>
      </section>

      {/* S18 — MARKET LIQUIDITY */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Trading the World's Most Liquid Markets</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              { market:"Forex", vol:"₹7.5 Trillion", period:"Daily Volume", desc:"Most liquid market in the world. Tight spreads, deep order books, 24/5 access." },
              { market:"Gold", vol:"₹180 Billion", period:"Daily Volume", desc:"Safe-haven asset with high volatility potential and inverse USD correlation." },
              { market:"Indices", vol:"₹400 Billion", period:"Daily Volume", desc:"Exposure to global equity movements without individual stock risk." },
            ].map((m, i) => (
              <div key={i} className="card-stealth p-8 text-center">
                <h3 className="font-bold text-white text-xl mb-3">{m.market}</h3>
                <p className="text-4xl font-black text-[#00C274] mb-1">{m.vol}</p>
                <p className="text-[#848E9C] text-xs uppercase tracking-wider mb-4">{m.period}</p>
                <p className="text-[#848E9C] text-sm">{m.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-[#848E9C] italic">CNXMarkets operates exclusively in the highest-liquidity instruments to minimize slippage and maximize execution quality.</p>
        </div>
      </section>

      {/* S19 — RISK MANAGEMENT */}
      <section className="py-16 section-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Multi-Layer Risk Management</h2>
            <p className="text-[#848E9C]">Four independent risk controls protect your capital at every level.</p>
          </div>
          <div className="space-y-4">
            {[
              { layer:"1", title:"Position-Level Risk", desc:"Maximum position size per trade is dynamically calculated as a percentage of current account equity, adjusting automatically with portfolio growth or drawdown." },
              { layer:"2", title:"Strategy-Level Risk", desc:"Each individual strategy has a hard daily loss limit. If triggered, the strategy pauses automatically until manual review and reset by the quant team." },
              { layer:"3", title:"Account-Level Risk", desc:"A maximum drawdown threshold is set at the account level. Breaching this threshold triggers instant deactivation of all strategies until the client reviews the situation." },
              { layer:"4", title:"Platform-Level Risk", desc:"Global circuit breakers activate during extreme market events (flash crashes, news spikes, liquidity crises), halting all trading across the platform simultaneously." },
            ].map((l, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="card-stealth p-6 flex gap-6 border-l-4 border-l-[#00C274]">
                <div className="w-10 h-10 rounded-full bg-[#00C274] text-black flex items-center justify-center font-black text-lg shrink-0">{l.layer}</div>
                <div>
                  <h3 className="font-bold text-white mb-2">{l.title}</h3>
                  <p className="text-[#848E9C] text-sm leading-relaxed">{l.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* S20 — MOBILE PREVIEW */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Monitor Your Portfolio Anywhere</h2>
              <ul className="space-y-5 mb-8">
                {[
                  "Real-time P&L tracking with live chart updates",
                  "Push notifications on every trade execution",
                  "One-tap deposit and withdrawal requests",
                  "Strategy activation and deactivation controls",
                  "KYC and account management on mobile",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#02C076] shrink-0 mt-0.5" />
                    <span className="text-[#EAECEF]">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className="btn-green inline-block">Get Started Now</Link>
            </div>
            <div className="flex justify-center">
              <div className="w-64 h-[480px] bg-[#1E2329] border-2 border-[#181B23] rounded-[36px] p-4 shadow-2xl relative">
                <div className="w-20 h-5 bg-[#181B23] rounded-full mx-auto mb-4" />
                <div className="space-y-3">
                  <div className="bg-[#060709] rounded-xl p-4 border border-[#181B23]">
                    <p className="text-[#848E9C] text-xs mb-1">Portfolio Value</p>
                    <p className="text-[#00C274] text-xl font-black">₹4,85,290</p>
                    <p className="text-[#02C076] text-xs">+7.2% MTD</p>
                  </div>
                  <div className="bg-[#060709] rounded-xl p-3 h-24 border border-[#181B23]">
                    <div className="h-full flex items-end gap-1">
                      {[40,55,45,70,60,85,75,90].map((h,i) => (
                        <div key={i} className="flex-1 bg-[#00C274]/60 rounded-sm" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  {[{ name:"Quantum Algo", pl:"+₹1,240" },{ name:"Gold Scalper", pl:"+₹890" }].map((s,i) => (
                    <div key={i} className="bg-[#060709] rounded-xl p-3 flex justify-between items-center border border-[#181B23]">
                      <div>
                        <p className="text-white text-xs font-semibold">{s.name}</p>
                        <p className="text-[#848E9C] text-[10px]">Active</p>
                      </div>
                      <p className="text-[#02C076] text-xs font-bold">{s.pl}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* S26 — AWARDS */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Recognized by the Industry</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { award:"Best Algo Trading Platform 2025", org:"Global FinTech Awards" },
              { award:"Most Innovative Trading Solution", org:"FinTech Innovation Summit" },
              { award:"Top Performing Strategy Platform", org:"Global Wealth Tech Summit" },
              { award:"Client's Choice Award", org:"Trustpilot" },
            ].map((a, i) => (
              <div key={i} className="card-stealth p-6 text-center">
                <Star className="w-8 h-8 text-[#00C274] mx-auto mb-4" />
                <h3 className="font-bold text-white mb-2 text-sm leading-snug">{a.award}</h3>
                <p className="text-[#848E9C] text-xs">{a.org}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S27 — SUPPORT */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">World-Class Support, Always Available</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Headphones, title:"Live Chat", detail:"Available during market hours 9am–7pm IST", time:"~2 min response" },
              { icon: FileText, title:"Email Support", detail:"Detailed technical and account queries", time:"~4 hour response" },
              { icon: Users, title:"Priority Phone", detail:"Dedicated line for Institutional clients", time:"Immediate" },
            ].map((s, i) => (
              <div key={i} className="card-stealth p-8 text-center">
                <div className="w-14 h-14 bg-[#060709] border border-[#181B23] rounded-xl flex items-center justify-center mx-auto mb-5">
                  <s.icon className="w-7 h-7 text-[#00C274]" />
                </div>
                <h3 className="font-bold text-white text-lg mb-2">{s.title}</h3>
                <p className="text-[#848E9C] text-sm mb-4">{s.detail}</p>
                <span className="bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] text-xs font-bold rounded-full px-3 py-1">{s.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* S28 — PARTNER */}
      <section className="py-16 section-surface border-y border-[#181B23]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Institutional & Corporate Partnerships</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card-stealth-gold p-8">
              <Building2 className="w-8 h-8 text-[#00C274] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">White-Label Solution</h3>
              <p className="text-[#848E9C] mb-6 text-sm">For brokers who want to offer algorithmic trading to their existing client base under their own brand.</p>
              <Link href="/contact" className="btn-ghost inline-block text-sm font-bold">Contact Partnership Team →</Link>
            </div>
            <div className="card-stealth-gold p-8">
              <TrendingUp className="w-8 h-8 text-[#00C274] mb-4" />
              <h3 className="text-xl font-bold text-white mb-3">Fund Manager Access</h3>
              <p className="text-[#848E9C] mb-6 text-sm">For portfolio managers seeking institutional-grade algorithmic execution with custom risk parameters.</p>
              <Link href="/contact" className="btn-ghost inline-block text-sm font-bold">Schedule a Call →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* S29 — PLATFORM TRUST */}
      <section className="py-16 section-dark">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Built on a Foundation of Trust & Security</h2>
          </div>
          <div className="card-stealth-gold p-6 mb-8 text-center">
            <p className="text-[#00C274] font-semibold text-sm">⚠️ Trading in financial markets involves significant risk and may not be suitable for all investors. Past performance does not guarantee future results. Only invest capital you can afford to risk.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {["AML Policy","KYC Verification","Segregated Funds","Data Security"].map((item, i) => (
              <div key={i} className="card-stealth p-4 text-center">
                <Check className="w-5 h-5 text-[#02C076] mx-auto mb-2" />
                <p className="text-white text-sm font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-[linear-gradient(135deg,#00C274,#d4a017)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">Start Your Algorithmic Trading Journey Today</h2>
          <p className="text-black/80 text-xl mb-10">Join professionals utilizing precision execution and advanced quants.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register" className="bg-[#060709] text-white px-8 py-4 rounded-md font-bold hover:bg-[#1E2329] transition">Open Account</Link>
            <Link href="/contact" className="border-2 border-[#060709] text-[#060709] px-8 py-4 rounded-md font-bold hover:bg-[#060709] hover:text-[#00C274] transition">Contact Sales</Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}