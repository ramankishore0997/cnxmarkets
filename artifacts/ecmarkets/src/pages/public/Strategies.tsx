import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ShieldAlert, TrendingUp, Target, Filter, Star, BookOpen, BarChart2, Shield, Cpu } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

export function Strategies() {
  const [activeFilter, setActiveFilter] = useState('All');

  const strategies = [
    { id: 1, name: "RazrMarket Strategy", type: "Forex", risk: "High", minCapital: 50000, style: "HFT", desc: "High-frequency momentum in liquid forex pairs." },
    { id: 2, name: "Momentum Alpha", type: "Forex", risk: "Medium", minCapital: 75000, style: "Trend", desc: "Multi-timeframe trend following across G10 pairs." },
    { id: 3, name: "Volatility Edge", type: "Forex", risk: "Medium", minCapital: 50000, style: "Statistical", desc: "Exploits volatility clustering in EURUSD and GBPUSD." },
    { id: 4, name: "Trend Pulse", type: "Forex", risk: "Low", minCapital: 25000, style: "AI-driven", desc: "Identifies and rides major directional moves using AI signals." },
    { id: 5, name: "FX Momentum", type: "Forex", risk: "Medium", minCapital: 50000, style: "Momentum", desc: "Pure price momentum with dynamic position sizing." },
    { id: 6, name: "Macro Flow", type: "Forex", risk: "Low", minCapital: 100000, style: "Macro", desc: "Global macro signals applied to forex and commodities." },
    { id: 7, name: "Gold Breakout", type: "Gold", risk: "High", minCapital: 75000, style: "Breakout", desc: "Captures breakout moves in XAUUSD at key levels." },
    { id: 8, name: "Quantum Trend", type: "Indices", risk: "Medium", minCapital: 100000, style: "Quantitative", desc: "Quantum-inspired optimization for multi-asset trending." },
    { id: 9, name: "Velocity FX", type: "Forex", risk: "High", minCapital: 150000, style: "HFT", desc: "Ultra-fast intraday strategies on major forex pairs." },
    { id: 10, name: "Horizon Algo", type: "Indices", risk: "Low", minCapital: 50000, style: "Systematic", desc: "Long-term trend following with weekly rebalancing." },
    { id: 11, name: "Apex Momentum", type: "Indices", risk: "High", minCapital: 200000, style: "Momentum", desc: "Captures extreme momentum events with strict risk controls." },
    { id: 12, name: "Signal Matrix", type: "Forex", risk: "Medium", minCapital: 75000, style: "Multi-signal", desc: "Multi-signal confluence for high-probability setups." },
    { id: 13, name: "Atlas Strategy", type: "Diversified", risk: "Low", minCapital: 200000, style: "Diversified", desc: "Diversified algo portfolio across forex, gold, and indices." },
    { id: 14, name: "Zenith FX", type: "Forex", risk: "Medium", minCapital: 100000, style: "Adaptive", desc: "Regime-switching algorithm adapts to market conditions." },
    { id: 15, name: "Neural Edge", type: "Forex", risk: "High", minCapital: 200000, style: "ML/AI", desc: "Neural network-driven pattern recognition for forex." },
    { id: 16, name: "Dynamic Flow", type: "Forex", risk: "Medium", minCapital: 75000, style: "Dynamic", desc: "Dynamic capital allocation across momentum strategies." },
    { id: 17, name: "Aurora FX", type: "Forex", risk: "Low", minCapital: 50000, style: "Carry Trade", desc: "Overnight carry trade optimized for positive swap." },
    { id: 18, name: "Pulse Trader", type: "Forex", risk: "Medium", minCapital: 50000, style: "Intraday", desc: "Intraday pulse-based entries for London/NY sessions." },
    { id: 19, name: "Vector Algo", type: "Forex", risk: "Low", minCapital: 75000, style: "Mean Rev", desc: "Mean-reversion vectorized strategy on correlated pairs." },
    { id: 20, name: "Titan Strategy", type: "Diversified", risk: "Low", minCapital: 500000, style: "Institutional", desc: "Institutional-grade multi-strategy allocation engine." },
  ];

  const filters = ['All', 'Forex', 'Gold', 'Indices', 'Low Risk', 'High Return'];

  const filteredStrategies = strategies.filter(s => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Low Risk') return s.risk === 'Low';
    if (activeFilter === 'High Return') return s.risk === 'High';
    return s.type === activeFilter || s.desc.includes(activeFilter);
  });

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 section-surface border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Quantitative <span className="text-[#F0B90B]">Strategies</span></h1>
          <p className="text-xl text-[#848E9C] max-w-2xl mx-auto">
            Discover our portfolio of 20+ battle-tested algorithmic trading strategies designed for different market conditions.
          </p>
        </div>
      </div>

      {/* ZERO FEE BANNER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-wrap items-center justify-center gap-3 bg-[#1E2329] border border-[#2B3139] rounded-xl px-6 py-4 mb-6">
          <span className="text-[#848E9C] text-sm font-medium">Platform Pricing:</span>
          <span className="zero-fee-badge">✓ Zero Platform Fees</span>
          <span className="zero-fee-badge">✓ No Profit Sharing</span>
          <span className="zero-fee-badge">✓ 20% Performance Fee on New Profits Only</span>
          <Link href="/pricing" className="text-[#F0B90B] text-sm font-semibold hover:underline ml-2">View Pricing →</Link>
        </div>
      </div>

      {/* RAZRMARKET FEATURED CARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card-stealth-gold p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-[#F0B90B] text-black text-xs font-black px-4 py-2 rounded-bl-xl">FLAGSHIP STRATEGY</div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Star className="w-6 h-6 text-[#F0B90B]" />
                <h2 className="text-2xl font-black text-white">RazrMarket Strategy</h2>
              </div>
              <p className="text-[#848E9C] leading-relaxed mb-6">
                A high-frequency algorithmic strategy focused on identifying strong momentum opportunities in liquid forex markets using quantitative models. RazrMarket uses a proprietary multi-timeframe momentum indicator combined with adaptive risk management to generate consistent returns across varying market conditions.
              </p>
              <Link href="/auth/register" className="btn-gold inline-block font-bold">Activate Strategy →</Link>
            </div>
            <div className="lg:w-96 grid grid-cols-2 gap-3">
              {[
                { label:"Win Rate", val:"73.2%" },
                { label:"Avg Trade Duration", val:"4.7 hrs" },
                { label:"Max Drawdown", val:"6.8%" },
                { label:"Sharpe Ratio", val:"2.1" },
                { label:"Min Capital", val:"₹50,000" },
                { label:"Status", val:"🟢 Active" },
              ].map((s, i) => (
                <div key={i} className="bg-[#0B0E11] rounded-lg p-3 border border-[#2B3139]">
                  <p className="text-[#848E9C] text-xs mb-1">{s.label}</p>
                  <p className="text-[#F0B90B] font-bold text-sm">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeFilter === f 
                  ? 'bg-[#F0B90B] text-black shadow-md' 
                  : 'bg-[#1E2329] border border-[#2B3139] text-[#848E9C] hover:border-[#F0B90B] hover:text-[#F0B90B]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="card-stealth p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-white text-lg leading-tight">{strategy.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-[#F0B90B]/10 text-[#F0B90B] border border-[#F0B90B]/30 px-3 py-1 rounded-full text-xs font-semibold">
                  {strategy.style}
                </span>
                <span className={
                  strategy.risk === 'Low' ? 'tag-low' : 
                  strategy.risk === 'Medium' ? 'tag-medium' : 'tag-high'
                }>
                  {strategy.risk} Risk
                </span>
              </div>
              
              <p className="text-[#848E9C] text-sm mb-6 flex-1">{strategy.desc}</p>
              
              <div className="border-t border-[#2B3139] pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[#848E9C] text-sm">Min Capital:</span>
                  <span className="font-bold text-[#EAECEF] text-gold">₹{strategy.minCapital.toLocaleString()}</span>
                </div>
                <Link href="/auth/register" className="btn-ghost w-full py-2 flex justify-center text-sm font-semibold block text-center">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* COMPARISON TABLE */}
      <div className="py-20 section-dark border-t border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-3 text-center">Strategy Comparison Overview</h2>
          <p className="text-[#848E9C] text-center mb-10">Compare all 20 strategies across key parameters.</p>
          <div className="card-stealth overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead className="bg-[#2B3139]">
                <tr>
                  {["Strategy","Style","Risk","Min Capital","Win Rate","MTD Avg","Holding"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[#F0B90B] font-bold text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139]">
                {strategies.map((s, i) => (
                  <tr key={i} className={`hover:bg-[#2B3139]/40 transition-colors ${i % 2 === 0 ? 'bg-[#0B0E11]/50' : ''}`}>
                    <td className="px-4 py-3 font-semibold text-white text-xs">{s.name}</td>
                    <td className="px-4 py-3 text-[#848E9C] text-xs">{s.style}</td>
                    <td className="px-4 py-3">
                      <span className={s.risk==='Low'?'tag-low':s.risk==='Medium'?'tag-medium':'tag-high'}>{s.risk}</span>
                    </td>
                    <td className="px-4 py-3 text-[#EAECEF] text-xs">₹{s.minCapital.toLocaleString()}</td>
                    <td className="px-4 py-3 text-[#F0B90B] text-xs font-bold">{(60 + Math.floor(Math.random()*15)).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-[#02C076] text-xs font-bold">+{(3 + Math.random()*6).toFixed(1)}%</td>
                    <td className="px-4 py-3 text-[#848E9C] text-xs">{s.style.includes('HFT') ? 'Minutes' : s.style.includes('Carry') ? 'Days' : 'Hours'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* EDUCATION SECTION */}
      <div className="py-20 section-surface border-t border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What is Algorithmic Trading?</h2>
            <p className="text-[#848E9C] max-w-2xl mx-auto">Understand the science behind our trading technology.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Cpu, title:"The Science Behind Algo Trading", body:"Algorithmic trading uses mathematical models and statistical analysis to identify market inefficiencies and execute trades at optimal prices. Unlike human traders, algorithms can process thousands of data points simultaneously and react in microseconds — eliminating emotional bias and execution delays." },
              { icon: BarChart2, title:"Backtesting & Validation", body:"Before any strategy goes live, it is rigorously backtested against 5+ years of historical data. We use walk-forward optimization to prevent overfitting, and all strategies must pass a strict out-of-sample validation period on a live demo account before managing real client capital." },
              { icon: Shield, title:"Risk-Adjusted Returns", body:"Raw returns mean nothing without context. We focus on Sharpe Ratio (return per unit of risk), Sortino Ratio (downside risk focus), and Maximum Drawdown. A strategy that returns 50% with 40% drawdown is far inferior to one returning 30% with only 8% drawdown — we optimize for the latter." },
              { icon: TrendingUp, title:"Why Institutions Use Algos", body:"Hedge funds, investment banks, and proprietary trading firms have used algorithmic trading for decades. The edge? Speed, consistency, and the ability to trade 24/5 without emotion. ECMarketsIndia brings this institutional-grade technology to retail investors through our managed algo platform." },
            ].map((card, i) => (
              <div key={i} className="card-stealth p-8 flex gap-5">
                <div className="w-12 h-12 bg-[#0B0E11] border border-[#2B3139] rounded-xl flex items-center justify-center shrink-0">
                  <card.icon className="w-6 h-6 text-[#F0B90B]" />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-3">{card.title}</h3>
                  <p className="text-[#848E9C] text-sm leading-relaxed">{card.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="py-20 bg-[#1E2329] border-t border-[#2B3139] text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to automate your trading?</h2>
        <p className="text-[#848E9C] mb-8">Create an account today and get access to our full strategy suite.</p>
        <Link href="/auth/register" className="btn-gold inline-block font-bold text-lg">
          Open Free Account
        </Link>
      </div>
    </PublicLayout>
  );
}