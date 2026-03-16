import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Zap, Activity, Globe, Lock, CheckCircle2, 
  TrendingUp, Cpu, Smartphone, Play, Check
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
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const features = [
    { title: "Advanced Algorithms", description: "Proprietary models utilizing multi-factor analysis across diverse market conditions.", icon: Cpu },
    { title: "Low Latency Infrastructure", description: "Co-located servers ensuring millisecond execution to capture fleeting opportunities.", icon: Zap },
    { title: "Real-Time Analytics", description: "Monitor your equity curve, open positions, and algorithmic logic live.", icon: Activity },
    { title: "Risk Management Systems", description: "Hard-coded risk limits, automated kill switches, and strict drawdown controls.", icon: Shield },
    { title: "Secure Platform", description: "Bank-grade encryption, segregated tier-1 accounts, and stringent access controls.", icon: Lock },
    { title: "Mobile Monitoring", description: "Keep track of your portfolio's performance on the go with our responsive app.", icon: Smartphone },
  ];

  const steps = [
    { num: "1", title: "Create Account", desc: "Sign up in minutes with basic details.", icon: Globe },
    { num: "2", title: "Verify Identity", desc: "Complete seamless KYC process.", icon: Shield },
    { num: "3", title: "Fund Account", desc: "Deposit capital securely.", icon: Activity },
    { num: "4", title: "Activate Strategy", desc: "Allocate to strategies and relax.", icon: TrendingUp },
  ];

  const testimonials = [
    { name: "Rajesh K.", loc: "Mumbai", text: "The platform's execution speed is phenomenal. I've completely moved away from manual trading.", stars: 5 },
    { name: "Sarah M.", loc: "London", text: "Transparent performance and excellent risk management. Finally, an institutional tool for retail.", stars: 5 },
    { name: "Amit P.", loc: "Delhi", text: "The automated allocations saved me countless hours. The monthly returns speak for themselves.", stars: 5 },
    { name: "Priya S.", loc: "Bangalore", text: "Exceptional platform. The quant strategies provide stable returns even in volatile markets.", stars: 5 }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <PublicLayout>
      {/* SECTION 1 — HERO */}
      <section className="bg-white min-h-[90vh] flex items-center relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-[55%]">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="blue-badge inline-flex mb-6"
              >
                Trusted by 50,000+ traders across 120 countries
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl lg:text-[56px] font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight"
              >
                Advanced Algorithmic<br />
                <span className="text-primary">Trading Technology</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl text-gray-600 font-medium mb-4"
              >
                Institutional-grade infrastructure designed for modern traders.
              </motion.p>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-gray-500 mb-10 max-w-lg"
              >
                ECMarketsIndia delivers quantitative trading strategies powered by advanced algorithms, real-time analytics, and bank-grade infrastructure.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row gap-4 mb-8"
              >
                <Link href="/auth/register" className="btn-primary px-8 py-4 text-center font-semibold text-lg flex items-center justify-center gap-2">
                  Open Account <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/strategies" className="btn-outline px-8 py-4 text-center font-semibold text-lg">
                  Explore Strategies
                </Link>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-6 text-sm text-gray-600 font-medium"
              >
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> No hidden fees</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Regulated platform</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Instant KYC</span>
              </motion.div>
            </div>

            <div className="lg:w-[45%] w-full relative">
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="card-light p-6 md:p-8 w-full shadow-2xl shadow-primary/10 bg-white"
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">Total Equity</p>
                    <h3 className="text-4xl font-bold text-primary">$485,290</h3>
                  </div>
                  <div className="tag-low flex items-center gap-1 text-sm px-3 py-1">
                    <TrendingUp className="w-4 h-4" /> +12.4% MTD
                  </div>
                </div>
                
                <div className="h-32 w-full mb-8 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      {val: 400}, {val: 430}, {val: 420}, {val: 460}, 
                      {val: 490}, {val: 480}, {val: 520}
                    ]}>
                      <defs>
                        <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2a6df4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#2a6df4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="val" stroke="#2a6df4" strokeWidth={3} fillOpacity={1} fill="url(#colorPrimary)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-semibold text-gray-900">Quantum Algo</p>
                        <p className="text-xs text-gray-500">Active • Low Risk</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+$1,240.50</span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border border-border">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <div>
                        <p className="font-semibold text-gray-900">Gold Scalper</p>
                        <p className="text-xs text-gray-500">Active • High Risk</p>
                      </div>
                    </div>
                    <span className="font-bold text-green-600">+$890.20</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — TRUST METRICS */}
      <section className="section-gray py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2"><Counter end={50000} suffix="+" /></div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Traders</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2"><Counter prefix="$" end={120} suffix="M+" /></div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Volume</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2"><Counter end={120} suffix="+" /></div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2"><Counter end={99.99} suffix="%" /></div>
              <div className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — WHY CHOOSE US */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Built for Performance</h2>
            <p className="text-lg text-gray-600">Our platform combines cutting-edge technology with sophisticated quantitative models to deliver consistent results.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="card-light p-8 group cursor-pointer">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6 line-clamp-2">{feature.description}</p>
                <span className="text-primary font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — PLATFORM PREVIEW */}
      <section className="py-24 section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Complete Control at Your Fingertips</h2>
              <ul className="space-y-4 mb-8">
                {[
                  "Real-time portfolio tracking and analytics",
                  "One-click strategy allocation and adjustments",
                  "Detailed trade history and performance metrics",
                  "Instant deposits and fast withdrawals"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/dashboard" className="btn-primary px-6 py-3 inline-block font-semibold">View Dashboard</Link>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="card-light p-6 md:p-8 shadow-[0_20px_50px_rgba(42,109,244,0.1)] border-t-4 border-t-primary">
                <div className="flex gap-4 border-b border-border pb-4 mb-6">
                  <button className="text-primary font-semibold border-b-2 border-primary pb-4 -mb-[17px]">Overview</button>
                  <button className="text-gray-500 font-medium pb-4 -mb-[17px]">Analytics</button>
                  <button className="text-gray-500 font-medium pb-4 -mb-[17px]">Strategies</button>
                </div>
                
                <div className="mb-8">
                  <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
                  <div className="flex items-end gap-4">
                    <h3 className="text-3xl font-bold text-gray-900">₹4,85,290</h3>
                    <span className="tag-low">+7.2%</span>
                  </div>
                </div>
                
                <div className="h-40 w-full mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[{v:20},{v:25},{v:22},{v:30},{v:28},{v:35}]}>
                      <Area type="monotone" dataKey="v" stroke="#2a6df4" fill="#eff4ff" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border">
                    <span className="font-medium text-gray-900">Momentum Alpha</span>
                    <span className="text-green-600 font-bold">+₹12,450</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-900">FX Scalper</span>
                    <span className="text-green-600 font-bold">+₹8,230</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — HOW IT WORKS */}
      <section className="py-24 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">Start trading with institutional algorithms in four simple steps.</p>
          </div>
          
          <div className="relative">
            <div className="hidden lg:block absolute top-10 left-1/2 -translate-x-1/2 w-[80%] border-t-2 border-dashed border-blue-200" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {steps.map((step, i) => (
                <div key={i} className="text-center">
                  <div className="w-20 h-20 mx-auto bg-white border-4 border-blue-100 text-primary rounded-full flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">
                    {step.num}
                  </div>
                  <div className="w-12 h-12 mx-auto bg-blue-50 text-primary rounded-xl flex items-center justify-center mb-4">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — PERFORMANCE SNAPSHOT */}
      <section className="py-24 section-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Proven Performance</h2>
            <p className="text-lg text-gray-600">Transparent, verifiable results from our core strategies.</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="card-light p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Cumulative Equity Curve</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{m:'Jan',v:100},{m:'Feb',v:105},{m:'Mar',v:112},{m:'Apr',v:110},{m:'May',v:120}]}>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} stroke="#6b7280" />
                    <Tooltip cursor={{fill: 'transparent'}} />
                    <Area type="monotone" dataKey="v" stroke="#2a6df4" fill="#eff4ff" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="card-light p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Returns (%)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{m:'Jan',v:5},{m:'Feb',v:3},{m:'Mar',v:7},{m:'Apr',v:-2},{m:'May',v:8}]}>
                    <XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={12} stroke="#6b7280" />
                    <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} />
                    <Bar dataKey="v" radius={[4,4,0,0]}>
                      {[{v:5},{v:3},{v:7},{v:-2},{v:8}].map((entry, index) => (
                        <cell key={`cell-${index}`} fill={entry.v > 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="card-light p-6 flex flex-wrap justify-around items-center gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">71.4%</p>
            </div>
            <div className="w-px h-10 bg-border hidden md:block"></div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Max Drawdown</p>
              <p className="text-2xl font-bold text-red-500">8.3%</p>
            </div>
            <div className="w-px h-10 bg-border hidden md:block"></div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Sharpe Ratio</p>
              <p className="text-2xl font-bold text-gray-900">1.87</p>
            </div>
            <div className="w-px h-10 bg-border hidden md:block"></div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase">Avg Monthly Return</p>
              <p className="text-2xl font-bold text-green-500">3.8%</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7 — ACCOUNT TYPES */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Account Tiers</h2>
            <p className="text-lg text-gray-600">Choose the account size that fits your investment goals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center max-w-5xl mx-auto">
            <div className="card-light p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-primary mb-6">₹20,000</div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600 text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Basic Algorithms</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Standard Execution</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Daily Reports</li>
              </ul>
              <Link href="/auth/register" className="btn-outline w-full py-3 block font-semibold">Select Starter</Link>
            </div>
            
            <div className="card-light p-10 text-center bg-gradient-to-b from-primary to-[#1a5de4] text-white border-none shadow-[0_20px_40px_rgba(42,109,244,0.3)] scale-105 z-10">
              <div className="text-xs font-bold uppercase tracking-wider bg-white/20 inline-block px-3 py-1 rounded-full mb-4">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <div className="text-4xl font-bold text-white mb-6">₹1,00,000</div>
              <ul className="space-y-3 mb-8 text-sm text-white/90 text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> All Premium Algos</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Low Latency Execution</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Priority Support</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-white" /> Real-time Alerts</li>
              </ul>
              <Link href="/auth/register" className="bg-white text-primary w-full py-3 block font-bold rounded-lg hover:bg-gray-50 transition-colors">Select Pro</Link>
            </div>
            
            <div className="card-light p-8 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Institutional</h3>
              <div className="text-3xl font-bold text-primary mb-6">₹5,00,000</div>
              <ul className="space-y-3 mb-8 text-sm text-gray-600 text-left">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Custom Strategies</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> API Access</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-green-500" /> Dedicated Manager</li>
              </ul>
              <Link href="/contact" className="btn-outline w-full py-3 block font-semibold">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — TESTIMONIALS */}
      <section className="py-24 section-gray overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">What Our Clients Say</h2>
          
          <div className="relative h-48 max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="absolute inset-0 card-light p-8 flex flex-col items-center justify-center"
              >
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(testimonials[testimonialIndex].stars)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className="text-lg text-gray-700 font-medium mb-4 italic">"{testimonials[testimonialIndex].text}"</p>
                <div className="text-sm">
                  <span className="font-bold text-gray-900">{testimonials[testimonialIndex].name}</span>
                  <span className="text-gray-500 ml-2">{testimonials[testimonialIndex].loc}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* SECTION 9 — FAQ PREVIEW */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Is my money safe?", a: "Yes. Funds are held in segregated tier-1 bank accounts. We only have trading authority, not withdrawal authority." },
              { q: "What is the minimum deposit?", a: "The minimum deposit to start is ₹20,000 for our Starter Algo account." },
              { q: "Can I withdraw anytime?", a: "Yes, there are no lock-in periods. You can withdraw your available balance anytime." },
              { q: "Do I need trading experience?", a: "No prior experience is required. Our algorithms handle 100% of the analysis and execution." }
            ].map((faq, i) => (
              <div key={i} className="card-light rounded-xl overflow-hidden border border-border">
                <button
                  className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                >
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                  <div className={`transition-transform duration-300 ${activeFaq === i ? 'rotate-180' : ''}`}>▼</div>
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-6 pb-4 text-gray-600 border-t border-gray-100 pt-2">{faq.a}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/faq" className="text-primary font-semibold hover:underline">View all FAQs</Link>
          </div>
        </div>
      </section>

      {/* SECTION 10 — FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-primary to-[#1a5de4]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Start Your Algo Trading Journey Today</h2>
          <p className="text-xl text-white/90 mb-10">Join thousands of traders generating consistent automated returns.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="bg-white text-primary px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg shadow-black/10">
              Create Free Account
            </Link>
            <Link href="/contact" className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
