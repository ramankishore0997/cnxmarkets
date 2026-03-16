import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { ShieldAlert, TrendingUp, Target, Filter } from 'lucide-react';
import { Link } from 'wouter';

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
      <div className="pt-24 pb-16 section-gray border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Quantitative <span className="text-primary">Strategies</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover our portfolio of 20+ battle-tested algorithmic trading strategies designed for different market conditions.
          </p>
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
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white border border-border text-gray-600 hover:border-primary/50 hover:text-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStrategies.map((strategy) => (
            <div key={strategy.id} className="card-light p-6 flex flex-col h-full group">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{strategy.name}</h3>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="blue-badge">{strategy.style}</span>
                <span className={
                  strategy.risk === 'Low' ? 'tag-low' : 
                  strategy.risk === 'Medium' ? 'tag-medium' : 'tag-high'
                }>
                  {strategy.risk} Risk
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-6 flex-1">{strategy.desc}</p>
              
              <div className="border-t border-border pt-4 mt-auto">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500 text-sm">Min Capital:</span>
                  <span className="font-bold text-gray-900">₹{strategy.minCapital.toLocaleString()}</span>
                </div>
                <Link href="/auth/register" className="btn-outline w-full py-2 flex justify-center text-sm font-semibold">
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="py-20 bg-primary/5 border-t border-primary/10 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to automate your trading?</h2>
        <p className="text-gray-600 mb-8">Create an account today and get access to our full strategy suite.</p>
        <Link href="/auth/register" className="btn-primary px-8 py-4 inline-block font-bold text-lg">
          Open Free Account
        </Link>
      </div>
    </PublicLayout>
  );
}
