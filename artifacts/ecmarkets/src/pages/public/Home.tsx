import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView } from 'framer-motion';
import { 
  Shield, Zap, Activity, Globe, Lock, Cpu, Smartphone, TrendingUp, Check
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from 'recharts';

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
    { q: "What is the minimum deposit?", a: "The minimum deposit to activate the Starter Algo is ₹20,000. However, to access the full suite, we recommend the Professional tier starting at ₹1,00,000." },
    { q: "Is my money safe?", a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority over the accounts via LPOA." },
    { q: "How does the performance fee work?", a: "We charge a 20% performance fee on new profits only, utilizing a High-Water Mark model." },
    { q: "Do I need trading experience?", a: "No prior trading experience is required. ECMarketsIndia is a fully managed quantitative solution." },
    { q: "Can I withdraw my money at any time?", a: "Absolutely. There is zero lock-in period. You can request a withdrawal at any time from your dashboard." },
    { q: "Which markets do your algorithms trade?", a: "Our core strategies operate primarily on major Forex pairs and high-liquidity commodities like Gold." },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(0);

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
                className="bg-[#2B3139]/50 border border-[#F0B90B]/30 text-[#F0B90B] px-4 py-1.5 rounded-full inline-flex text-sm font-semibold mb-6 shadow-[0_0_10px_rgba(240,185,11,0.2)]"
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
                <span className="text-gradient-gold">with Precision</span>
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
                <Link href="/auth/register" className="btn-gold text-lg py-4 px-8 text-center">
                  Start Trading Now
                </Link>
                <Link href="/strategies" className="btn-ghost text-lg py-4 px-8 text-center">
                  Explore Strategies
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-6 text-sm text-[#EAECEF] font-medium"
              >
                <span className="flex items-center gap-2">⚡ Zero Commission</span>
                <span className="flex items-center gap-2">🔒 Bank-Grade Security</span>
                <span className="flex items-center gap-2">📊 Real-Time Analytics</span>
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
                    <p className="text-3xl font-bold text-white mb-1">Total Equity: $485,290.00</p>
                  </div>
                  <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/30 text-[#F0B90B] flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-md">
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
                        <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#F0B90B" strokeWidth={3} fillOpacity={1} fill="url(#colorGold)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
                      <div>
                        <p className="font-semibold text-[#EAECEF]">Quantum Algo • Active</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#02C076]">+$1,240.50</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
                      <div>
                        <p className="font-semibold text-[#EAECEF]">Gold Scalper • Active</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#02C076]">+$890.20</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST METRICS */}
      <section className="section-surface py-12 border-y border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-center divide-y md:divide-y-0 md:divide-x divide-[#2B3139]">
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter end={50000} suffix="+" /></div>
              <div className="text-sm text-[#848E9C] font-semibold tracking-wider">Traders</div>
            </div>
            <div className="flex-1 py-4 md:py-0">
              <div className="text-4xl font-bold text-gold mb-1"><Counter prefix="$" end={120} suffix="M+" /></div>
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
      <section className="py-24 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Built for Performance</h2>
            <p className="text-lg text-[#848E9C]">Experience terminal-grade tools and execution speeds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="card-stealth p-8 group">
                <div className="w-14 h-14 rounded-lg bg-[#0B0E11] border border-[#2B3139] flex items-center justify-center mb-6 group-hover:border-[#F0B90B] transition-colors">
                  <feature.icon className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-[#848E9C] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM PREVIEW */}
      <section className="py-24 section-surface border-y border-[#2B3139]">
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
              <Link href="/dashboard" className="btn-gold inline-block">View Platform</Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="card-stealth p-6 bg-[#0B0E11] border-[#2B3139]">
                <div className="flex gap-6 border-b border-[#2B3139] pb-4 mb-6">
                  <span className="text-[#F0B90B] font-semibold border-b-2 border-[#F0B90B] pb-4 -mb-[17px]">Overview</span>
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
                      <Area type="monotone" dataKey="v" stroke="#F0B90B" fill="transparent" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start in Minutes</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-6 left-[12%] right-[12%] h-[1px] bg-[#2B3139]" />
            {steps.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="w-12 h-12 mx-auto bg-[#F0B90B] text-black rounded-full flex items-center justify-center text-xl font-bold mb-6 relative z-10">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-[#848E9C] text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PERFORMANCE SNAPSHOT */}
      <section className="py-24 section-surface border-y border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Proven Performance</h2>
            <p className="text-[#848E9C]">Consistent risk-adjusted returns</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              { label: "Win Rate", val: "71.4%" },
              { label: "Max Drawdown", val: "8.3%" },
              { label: "Sharpe Ratio", val: "1.87" },
              { label: "Avg Monthly", val: "3.8%" }
            ].map((stat, i) => (
              <div key={i} className="card-stealth p-6 text-center">
                <p className="text-2xl font-bold text-[#F0B90B] mb-1">{stat.val}</p>
                <p className="text-xs text-[#848E9C] uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-stealth p-6">
              <h3 className="text-white font-bold mb-6">Equity Growth</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{m:'Jan',v:100},{m:'Feb',v:105},{m:'Mar',v:112},{m:'Apr',v:110},{m:'May',v:120}]}>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} stroke="#848E9C" />
                    <Tooltip contentStyle={{ backgroundColor: '#1E2329', border: '1px solid #2B3139', color: '#fff' }} />
                    <Area type="monotone" dataKey="v" stroke="#F0B90B" fill="transparent" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-stealth p-6">
              <h3 className="text-white font-bold mb-6">Monthly Returns (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{m:'Jan',v:5},{m:'Feb',v:3},{m:'Mar',v:7},{m:'Apr',v:-2},{m:'May',v:8}]}>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} stroke="#848E9C" />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#1E2329', border: '1px solid #2B3139', color: '#fff' }} />
                    <Bar dataKey="v" radius={[2,2,0,0]}>
                      {[{v:5},{v:3},{v:7},{v:-2},{v:8}].map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.v > 0 ? '#02C076' : '#CF304A'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCOUNT TIERS */}
      <section className="py-24 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Account Tiers</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <div className="card-stealth p-8 text-center border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="text-3xl font-bold text-[#F0B90B] mb-6">₹20,000</div>
              <ul className="space-y-3 mb-8 text-sm text-[#848E9C] text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> Basic Algorithms</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> Standard Execution</li>
              </ul>
              <Link href="/auth/register" className="btn-ghost w-full block text-center">Select Starter</Link>
            </div>
            
            <div className="card-stealth-gold p-10 text-center scale-105 z-10 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F0B90B] text-black text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="text-4xl font-bold text-[#F0B90B] mb-6">₹1,00,000</div>
              <ul className="space-y-3 mb-8 text-sm text-[#EAECEF] text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> All Premium Algos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> Low Latency</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> Priority Support</li>
              </ul>
              <Link href="/auth/register" className="btn-gold w-full block text-center">Select Pro</Link>
            </div>
            
            <div className="card-stealth p-8 text-center border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Institutional</h3>
              <div className="text-3xl font-bold text-[#F0B90B] mb-6">₹5,00,000</div>
              <ul className="space-y-3 mb-8 text-sm text-[#848E9C] text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> FIX API Access</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#02C076]" /> Custom Risk Limits</li>
              </ul>
              <Link href="/auth/register" className="btn-ghost w-full block text-center">Contact Desk</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 section-surface border-y border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="card-stealth p-8">
                <div className="flex text-[#F0B90B] mb-4">★★★★★</div>
                <p className="text-[#848E9C] mb-6">"{t.text}"</p>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-[#F0B90B] text-sm">{t.loc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ PREVIEW */}
      <section className="py-24 section-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Questions?</h2>
          <div className="space-y-4">
            {faqs.slice(0, 4).map((faq, i) => (
              <div key={i} className={`card-stealth overflow-hidden ${activeFaq === i ? 'border-l-2 border-l-[#F0B90B] border-t-[#2B3139] border-r-[#2B3139] border-b-[#2B3139]' : ''}`}>
                <button 
                  className="w-full text-left px-6 py-4 flex justify-between items-center text-white font-semibold"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  {faq.q}
                  <span className={`text-[#F0B90B] transform transition-transform ${activeFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {activeFaq === i && (
                  <div className="px-6 pb-4 text-[#848E9C] text-sm border-t border-[#2B3139] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-[linear-gradient(135deg,#F0B90B,#d4a017)] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-black mb-6">Start Your Algorithmic Trading Journey Today</h2>
          <p className="text-black/80 text-xl mb-10">Join professionals utilizing precision execution and advanced quants.</p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/register" className="bg-[#0B0E11] text-white px-8 py-4 rounded-md font-bold hover:bg-[#1E2329] transition">Open Account</Link>
            <Link href="/contact" className="border-2 border-[#0B0E11] text-[#0B0E11] px-8 py-4 rounded-md font-bold hover:bg-[#0B0E11] hover:text-[#F0B90B] transition">Contact Sales</Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}