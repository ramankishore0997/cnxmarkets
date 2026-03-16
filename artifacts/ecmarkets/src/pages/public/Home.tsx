import { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Shield, Zap, Activity, Globe, Lock, BarChart2, CheckCircle2, 
  ChevronDown, Star, ChevronRight, TrendingUp, Cpu, Server, Smartphone, Play, Plus
} from 'lucide-react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { TradingChartWidget } from '@/components/shared/TradingWidget';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

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

  // Handle decimals format manually if needed, here simple integer
  const display = count === end && String(end).includes('.') ? end : count;
  return <span ref={ref}>{prefix}{display.toLocaleString()}{suffix}</span>;
}

export function Home() {
  const features = [
    { title: "Advanced Algorithms", description: "Proprietary models utilizing multi-factor analysis across diverse market conditions.", icon: Cpu },
    { title: "Low Latency Infrastructure", description: "Co-located servers ensuring millisecond execution to capture fleeting opportunities.", icon: Zap },
    { title: "Real-Time Analytics", description: "Monitor your equity curve, open positions, and algorithmic logic live.", icon: Activity },
    { title: "Risk Management Systems", description: "Hard-coded risk limits, automated kill switches, and strict drawdown controls.", icon: Shield },
    { title: "Secure Platform", description: "Bank-grade encryption, segregated tier-1 accounts, and stringent access controls.", icon: Lock },
    { title: "Mobile Monitoring", description: "Keep track of your portfolio's performance on the go with our responsive app.", icon: Smartphone },
  ];

  const steps = [
    { num: "01", title: "Create Account", desc: "Sign up in minutes with basic details.", icon: Globe },
    { num: "02", title: "Verify Identity", desc: "Complete seamless KYC process.", icon: Shield },
    { num: "03", title: "Fund Account", desc: "Deposit capital securely.", icon: Activity },
    { num: "04", title: "Start Earning", desc: "Allocate to strategies and relax.", icon: TrendingUp },
  ];

  const faqData = [
    { q: "What is algo trading?", a: "Algorithmic trading uses computer programs to execute trades based on predefined rules, eliminating emotional bias and executing faster than humans." },
    { q: "How do I get started?", a: "Simply create an account, verify your identity, deposit funds, and select the strategies you want to allocate capital to." },
    { q: "Are funds safe?", a: "Yes, funds are kept in segregated tier-1 bank accounts. We only have trading authority, not withdrawal authority." },
    { q: "What are minimum deposits?", a: "The minimum deposit to start is ₹50,000 for our Starter Algo account." },
    { q: "Can I withdraw anytime?", a: "Yes, there are no lock-in periods. You can pause trading and withdraw your available balance anytime." },
    { q: "How are strategies chosen?", a: "Our quant team develops strategies based on rigorous backtesting and forward testing in live markets before releasing them." },
    { q: "What markets do you trade?", a: "We primarily trade major Forex pairs, indices, and highly liquid commodities like Gold." },
    { q: "Is there a lock-in period?", a: "No, we believe in complete flexibility. Your capital is yours to access whenever you need it." },
  ];

  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [activeChartTab, setActiveChartTab] = useState("FOREXCOM:EURUSD");
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  const testimonials = [
    { name: "Rajesh K.", loc: "Mumbai", text: "The platform's execution speed is phenomenal. I've completely moved away from manual trading.", stars: 5 },
    { name: "Sarah M.", loc: "London", text: "Transparent performance and excellent risk management. Finally, an institutional tool for retail.", stars: 5 },
    { name: "Amit P.", loc: "Delhi", text: "The automated allocations saved me countless hours. The monthly returns speak for themselves.", stars: 5 },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <PublicLayout>
      {/* Section 1: HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-[#0b0f19]">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            animate={{ 
              x: [0, 100, 0], 
              y: [0, -50, 0], 
              scale: [1, 1.2, 1] 
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" 
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0], 
              y: [0, 100, 0], 
              scale: [1, 1.5, 1] 
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-accent/10 rounded-full blur-[150px]" 
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white text-sm font-medium mb-8 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse glow-green"></span>
                Live Trading Active
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                Institutional Grade <br />
                <span className="text-gradient-blue">Algo Trading</span> Platform
              </h1>
              
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed max-w-lg">
                Automate your portfolio with battle-tested quantitative strategies. Consistent, risk-adjusted returns driven by advanced mathematics.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/auth/register"
                  className="px-8 py-4 rounded-xl text-lg font-bold btn-primary flex items-center justify-center gap-2"
                >
                  Start Trading <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  href="/performance"
                  className="px-8 py-4 rounded-xl text-lg font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  View Performance <Play className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>

            {/* Floating Widget Mockup */}
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="glass-panel p-6 rounded-2xl border border-white/10 relative z-20 shadow-2xl shadow-primary/20 bg-[#0d1527]/80"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-muted-foreground text-sm">Total Equity</p>
                    <h3 className="text-3xl font-bold text-white">$485,290.00</h3>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" /> +12.4%
                  </div>
                </div>
                <div className="h-40 w-full relative">
                  <svg viewBox="0 0 400 150" className="w-full h-full preserve-3d">
                    <defs>
                      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#1e90ff" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#1e90ff" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M0,150 L0,100 C50,110 100,60 150,80 C200,100 250,30 300,50 C350,70 380,20 400,10 L400,150 Z" 
                      fill="url(#chartGrad)"
                    />
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      d="M0,100 C50,110 100,60 150,80 C200,100 250,30 300,50 C350,70 380,20 400,10" 
                      fill="none" 
                      stroke="#1e90ff" 
                      strokeWidth="4"
                      className="glow-blue"
                    />
                  </svg>
                </div>
              </motion.div>
              
              <motion.div 
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -right-8 -bottom-8 glass-panel p-4 rounded-xl border border-white/10 z-30 bg-[#0d1527]/90 w-64 shadow-xl"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-bold">Quantum Algo</p>
                    <p className="text-green-400 text-xs">Active • Trading</p>
                  </div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Today's P&L</span>
                  <span className="text-green-400 font-bold">+$1,240.50</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2: TRUST STATS */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2"><Counter prefix="$" end={120} suffix="M+" /></div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Volume Traded</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2"><Counter end={50000} suffix="+" /></div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Active Traders</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2"><Counter end={120} suffix="+" /></div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Countries</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2"><Counter end={99.99} suffix="%" /></div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: 6-FEATURE GRID */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Institutional Power.<br />Retail Simplicity.</h2>
            <p className="text-lg text-muted-foreground">Everything you need to automate your wealth generation, built on technology previously reserved for hedge funds.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 rounded-3xl glass-card-hover group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity scale-150 transform group-hover:scale-110 duration-500">
                  <feature.icon className="w-32 h-32" />
                </div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 transition-colors">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: PLATFORM PREVIEW */}
      <section className="py-24 bg-gradient-to-b from-transparent to-[#0d1527] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Complete Control in One Dashboard</h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, rotateX: 20 }}
            whileInView={{ opacity: 1, rotateX: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1 }}
            style={{ perspective: "1200px" }}
            className="relative"
          >
            <div className="glass-panel rounded-3xl border border-white/10 shadow-[0_0_100px_rgba(30,144,255,0.15)] overflow-hidden bg-[#0b0f19] transform-gpu">
              {/* Fake Dashboard Header */}
              <div className="border-b border-white/5 p-4 flex justify-between items-center bg-[#0d1527]">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10"></div>
                </div>
              </div>
              
              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  {/* Balance Card */}
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-muted-foreground mb-1">Total Account Value</p>
                      <h2 className="text-5xl font-bold text-white">$485,000.00</h2>
                    </div>
                    <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 -rotate-45" /> +7.2% ($32,400)
                    </div>
                  </div>
                  
                  {/* Mini Chart */}
                  <div className="h-64 w-full bg-[#0d1527] rounded-2xl border border-white/5 p-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[
                        { name: 'Mon', uv: 4000 }, { name: 'Tue', uv: 4200 },
                        { name: 'Wed', uv: 4100 }, { name: 'Thu', uv: 4500 },
                        { name: 'Fri', uv: 4800 }, { name: 'Sat', uv: 4700 },
                        { name: 'Sun', uv: 5200 },
                      ]}>
                        <defs>
                          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#1e90ff" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="uv" stroke="#1e90ff" fillOpacity={1} fill="url(#colorUv)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {/* Allocations */}
                  <div className="bg-[#0d1527] p-6 rounded-2xl border border-white/5">
                    <h4 className="text-white font-bold mb-4">Strategy Allocation</h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Quantum Algo</span>
                          <span className="text-primary font-bold">60%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-primary h-2 rounded-full" style={{width: '60%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-white">Gold Scalper</span>
                          <span className="text-accent font-bold">40%</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="bg-accent h-2 rounded-full" style={{width: '40%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trades */}
                  <div className="bg-[#0d1527] p-6 rounded-2xl border border-white/5">
                    <h4 className="text-white font-bold mb-4">Recent Trades</h4>
                    <div className="space-y-3">
                      {[
                        { pair: "EUR/USD", dir: "BUY", pl: "+$420.50", isProfit: true },
                        { pair: "XAU/USD", dir: "SELL", pl: "+$890.00", isProfit: true },
                        { pair: "GBP/USD", dir: "BUY", pl: "-$150.00", isProfit: false },
                      ].map((t, i) => (
                        <div key={i} className="flex justify-between items-center pb-3 border-b border-white/5 last:border-0 last:pb-0">
                          <div>
                            <p className="text-white font-medium">{t.pair}</p>
                            <p className="text-xs text-muted-foreground">{t.dir}</p>
                          </div>
                          <p className={`font-bold ${t.isProfit ? 'text-green-400' : 'text-red-400'}`}>{t.pl}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 5: LIVE MARKET CHART */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Live Markets</h2>
              <p className="text-muted-foreground">Monitor the assets our algorithms trade 24/5.</p>
            </div>
            <div className="flex gap-2 bg-white/5 p-1 rounded-xl">
              {[
                { id: "FOREXCOM:EURUSD", label: "EUR/USD" },
                { id: "FOREXCOM:GBPUSD", label: "GBP/USD" },
                { id: "OANDA:XAUUSD", label: "XAU/USD" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChartTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeChartTab === tab.id ? 'bg-primary text-white' : 'text-muted-foreground hover:text-white'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="glow-blue rounded-2xl">
            <TradingChartWidget symbol={activeChartTab} />
          </div>
        </div>
      </section>

      {/* Section 6: HOW IT WORKS */}
      <section className="py-24 bg-[#0d1527] relative border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">4 Steps to Institutional Returns</h2>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 hidden lg:block -translate-y-1/2"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
              {steps.map((step, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="w-20 h-20 rounded-full bg-[#0b0f19] border-2 border-primary/30 flex items-center justify-center text-2xl font-bold text-white mb-6 relative group-hover:border-primary group-hover:scale-110 transition-all duration-300 shadow-xl shadow-primary/10">
                    {step.num}
                    <div className="absolute inset-2 rounded-full border border-dashed border-white/10 group-hover:animate-spin"></div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: PERFORMANCE ANALYTICS */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Proven Performance</h2>
              <p className="text-lg text-muted-foreground">Historical metrics from our master algorithms.</p>
            </div>
            <Link href="/performance" className="hidden md:flex items-center gap-2 text-primary hover:text-white transition-colors">
              Full Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 glass-card p-6 rounded-3xl glow-blue">
              <h3 className="text-xl font-bold text-white mb-6">Composite Return (2023)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Jan', val: 4.5 }, { name: 'Feb', val: 3.2 }, { name: 'Mar', val: 5.1 },
                    { name: 'Apr', val: -1.8 }, { name: 'May', val: 6.2 }, { name: 'Jun', val: 4.8 },
                    { name: 'Jul', val: 5.4 }, { name: 'Aug', val: -2.1 }, { name: 'Sep', val: 3.9 },
                    { name: 'Oct', val: 4.2 }, { name: 'Nov', val: 5.8 }, { name: 'Dec', val: 6.1 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#8a99b3" tickLine={false} axisLine={false} />
                    <YAxis stroke="#8a99b3" tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                    <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)'}} />
                    <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                      {
                        [4.5, 3.2, 5.1, -1.8, 6.2, 4.8, 5.4, -2.1, 3.9, 4.2, 5.8, 6.1].map((entry, index) => (
                          <cell key={`cell-${index}`} fill={entry > 0 ? '#00d085' : '#ff4d6a'} />
                        ))
                      }
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl h-full flex flex-col justify-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Win Rate</p>
                  <p className="text-4xl font-bold text-green-400">71.4%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Max Drawdown</p>
                  <p className="text-4xl font-bold text-red-400">8.3%</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Sharpe Ratio</p>
                  <p className="text-4xl font-bold text-primary">1.87</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Avg Monthly</p>
                  <p className="text-4xl font-bold text-white">3.8%</p>
                </div>
              </div>
            </div>
          </div>
          
          <Link href="/performance" className="mt-8 flex md:hidden items-center justify-center gap-2 text-primary">
            Full Report <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Section 8: ACCOUNT TYPES */}
      <section className="py-24 bg-[#0d1527] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Choose Your Tier</h2>
            <p className="text-xl text-muted-foreground">Select the capital level that fits your goals.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="glass-card p-8 rounded-3xl mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Starter Algo</h3>
              <div className="mb-6"><span className="text-4xl font-bold text-white">₹50k</span> <span className="text-muted-foreground">min</span></div>
              <ul className="space-y-4 mb-8">
                {["2 Core Strategies", "Standard Execution", "Email Support", "Daily Reports"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-primary" /> {f}</li>
                ))}
              </ul>
              <Link href="/auth/register" className="block w-full py-4 text-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">Select Starter</Link>
            </div>

            {/* Pro */}
            <div className="glass-card p-8 rounded-3xl border-2 border-primary glow-blue relative transform md:-translate-y-4 z-10 bg-gradient-to-b from-primary/10 to-transparent">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-bold tracking-wider">RECOMMENDED</div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <div className="mb-6"><span className="text-4xl font-bold text-primary">₹1L</span> <span className="text-muted-foreground">min</span></div>
              <ul className="space-y-4 mb-8">
                {["5 Premium Strategies", "Priority Low-Latency", "Dedicated Manager", "Custom Allocations", "Real-time Alerts"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-white"><CheckCircle2 className="w-5 h-5 text-primary" /> {f}</li>
                ))}
              </ul>
              <Link href="/auth/register" className="block w-full py-4 text-center rounded-xl btn-primary font-bold">Select Professional</Link>
            </div>

            {/* Inst */}
            <div className="glass-card p-8 rounded-3xl mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Institutional</h3>
              <div className="mb-6"><span className="text-4xl font-bold text-accent">₹5L</span> <span className="text-muted-foreground">min</span></div>
              <ul className="space-y-4 mb-8">
                {["All Strategies + Beta", "Zero-Latency FIX API", "Quant Desk Access", "Custom Risk Params"].map((f, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground"><CheckCircle2 className="w-5 h-5 text-accent" /> {f}</li>
                ))}
              </ul>
              <Link href="/contact" className="block w-full py-4 text-center rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 9: TESTIMONIALS */}
      <section className="py-24 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-16">Trusted by Investors</h2>
          
          <div className="relative h-64 max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={testimonialIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center glass-card p-8 rounded-3xl border-primary/20"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonials[testimonialIndex].stars)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-2xl text-white italic mb-6">"{testimonials[testimonialIndex].text}"</p>
                <div>
                  <p className="font-bold text-white text-lg">{testimonials[testimonialIndex].name}</p>
                  <p className="text-muted-foreground">{testimonials[testimonialIndex].loc}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button 
                key={i} 
                onClick={() => setTestimonialIndex(i)}
                className={`w-3 h-3 rounded-full transition-all ${i === testimonialIndex ? 'bg-primary w-8' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Section 10: FAQ */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqData.map((faq, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden border-white/5">
                <button 
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex justify-between items-center p-6 text-left"
                >
                  <span className="font-bold text-lg text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${activeFaq === i ? 'rotate-180 text-primary' : ''}`} />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 11: FINAL CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-[#0b0f19] to-accent/10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to Automate Your Success?</h2>
          <p className="text-xl text-muted-foreground mb-12">Join thousands of investors already leveraging institutional-grade strategies.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link href="/auth/register" className="px-10 py-5 rounded-2xl text-xl font-bold btn-primary">
              Open Account Now
            </Link>
            <Link href="/contact" className="px-10 py-5 rounded-2xl text-xl font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
              Speak to Sales
            </Link>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
