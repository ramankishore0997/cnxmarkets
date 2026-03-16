import { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useGetStrategies } from '@workspace/api-client-react';
import { TrendingUp, Filter, BarChart2, Shield, Cpu, Loader2, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };
const RISK_BG: Record<string, string> = { low: '#02C07620', medium: '#F0B90B20', high: '#CF304A20' };

export function Strategies() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: strategiesRaw, isLoading } = useGetStrategies();

  const allStrategies = ((strategiesRaw as any[]) || []).filter((s: any) => s.isActive);

  const filters = ['All', 'Forex', 'Gold', 'Indices', 'low', 'medium', 'high'];
  const filterLabels: Record<string, string> = { All: 'All', Forex: 'Forex', Gold: 'Gold', Indices: 'Indices', low: 'Low Risk', medium: 'Med Risk', high: 'High Risk' };

  const filteredStrategies = allStrategies.filter((s: any) => {
    if (activeFilter === 'All') return true;
    if (['low', 'medium', 'high'].includes(activeFilter)) return s.riskProfile === activeFilter;
    return s.markets?.includes(activeFilter);
  });

  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

  return (
    <PublicLayout>
      {/* HERO */}
      <section className="animated-bg py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#2B3139]/50 border border-[#F0B90B]/30 text-[#F0B90B] px-4 py-1.5 rounded-full inline-flex text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse mr-2 mt-1"></span>
            {isLoading ? '...' : `${allStrategies.length} Active Strategies Available`}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold text-white mb-6">
            Institutional Algo<br /><span className="text-gradient-gold">Strategy Catalogue</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-[#848E9C] max-w-2xl mx-auto mb-8">
            Browse our full library of battle-tested quantitative strategies. From low-risk systematic approaches to high-frequency momentum — there's a strategy for every risk profile.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-gold text-lg py-4 px-8">Start Trading</Link>
            <Link href="/auth/login" className="btn-ghost text-lg py-4 px-8">Client Portal</Link>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="section-surface border-y border-[#2B3139] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Live Strategies', value: isLoading ? null : allStrategies.length },
              { label: 'Low Risk Options', value: isLoading ? null : allStrategies.filter((s: any) => s.riskProfile === 'low').length },
              { label: 'Avg Win Rate', value: isLoading ? null : (allStrategies.length ? `${(allStrategies.reduce((sum: number, s: any) => sum + parseFloat(s.winRate), 0) / allStrategies.length).toFixed(1)}%` : '—') },
              { label: 'Avg Monthly Return', value: isLoading ? null : (allStrategies.length ? `+${(allStrategies.reduce((sum: number, s: any) => sum + parseFloat(s.monthlyReturn), 0) / allStrategies.length).toFixed(1)}%` : '—') },
            ].map((s, i) => (
              <div key={i} className="py-2">
                <p className="text-2xl font-bold text-[#F0B90B]">
                  {s.value === null ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#F0B90B]" /> : s.value}
                </p>
                <p className="text-sm text-[#848E9C] font-medium mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGY GRID */}
      <section className="py-16 section-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white">All Strategies</h2>
              <p className="text-[#848E9C] mt-1">{isLoading ? 'Loading...' : `${filteredStrategies.length} of ${allStrategies.length} strategies shown`}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all border ${activeFilter === f ? 'bg-[#F0B90B] text-black border-[#F0B90B]' : 'border-[#2B3139] text-[#848E9C] hover:border-[#F0B90B]/50 hover:text-white'}`}
                >
                  <Filter className="w-3.5 h-3.5" /> {filterLabels[f] || f}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#F0B90B]" />
            </div>
          ) : filteredStrategies.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-[#2B3139] mx-auto mb-4" />
              <p className="text-[#848E9C] font-medium">No strategies match this filter.</p>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStrategies.map((s: any, i: number) => (
                <motion.div key={s.id || i} variants={fadeUp} className="card-stealth p-6 flex flex-col hover:border-[#F0B90B]/30 transition-all group">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: RISK_BG[s.riskProfile], border: `1px solid ${RISK_COLORS[s.riskProfile]}40` }}>
                      <Zap className="w-5 h-5" style={{ color: RISK_COLORS[s.riskProfile] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">{s.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold capitalize px-2 py-0.5 rounded" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile} risk</span>
                        <span className="text-xs text-[#848E9C]">{s.markets}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#848E9C] mb-5 leading-relaxed flex-1">{s.description}</p>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-[#0B0E11] rounded-xl p-3 text-center border border-[#2B3139]">
                      <p className="text-sm font-bold text-[#02C076]">+{s.monthlyReturn}%</p>
                      <p className="text-[10px] text-[#848E9C] mt-0.5">Monthly</p>
                    </div>
                    <div className="bg-[#0B0E11] rounded-xl p-3 text-center border border-[#2B3139]">
                      <p className="text-sm font-bold text-[#F0B90B]">{s.winRate}%</p>
                      <p className="text-[10px] text-[#848E9C] mt-0.5">Win Rate</p>
                    </div>
                    <div className="bg-[#0B0E11] rounded-xl p-3 text-center border border-[#2B3139]">
                      <p className="text-sm font-bold text-white">
                        ₹{s.minCapital >= 100000 ? `${(s.minCapital / 100000).toFixed(0)}L` : `${(s.minCapital / 1000).toFixed(0)}K`}
                      </p>
                      <p className="text-[10px] text-[#848E9C] mt-0.5">Min Capital</p>
                    </div>
                  </div>

                  <Link href="/auth/register" className="btn-gold text-sm py-2.5 text-center w-full block">
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* COMPARISON TABLE */}
      {!isLoading && allStrategies.length > 0 && (
        <section className="py-16 section-surface border-y border-[#2B3139]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-white mb-3">Full Strategy Comparison</h2>
              <p className="text-[#848E9C] max-w-2xl mx-auto">Side-by-side metrics for all available strategies</p>
            </div>
            <div className="card-stealth overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2B3139]">
                      {['Strategy', 'Risk', 'Min Capital', 'Win Rate', 'Monthly Return', 'Max Drawdown', 'Markets'].map(h => (
                        <th key={h} className="px-4 py-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]">
                    {allStrategies.map((s: any, i: number) => (
                      <tr key={s.id || i} className={`hover:bg-[#2B3139]/40 transition-colors ${i % 2 === 0 ? 'bg-[#0B0E11]/50' : ''}`}>
                        <td className="px-4 py-3 font-semibold text-white text-xs">{s.name}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile}</span>
                        </td>
                        <td className="px-4 py-3 text-[#EAECEF] text-xs">₹{Number(s.minCapital).toLocaleString('en-IN')}</td>
                        <td className="px-4 py-3 text-[#F0B90B] text-xs font-bold">{s.winRate}%</td>
                        <td className="px-4 py-3 text-[#02C076] text-xs font-bold">+{s.monthlyReturn}%</td>
                        <td className="px-4 py-3 text-[#CF304A] text-xs font-bold">{s.maxDrawdown}%</td>
                        <td className="px-4 py-3 text-[#848E9C] text-xs">{s.markets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      <section className="py-20 section-surface border-t border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">What is Algorithmic Trading?</h2>
            <p className="text-[#848E9C] max-w-2xl mx-auto">Understand the science behind our trading technology.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { icon: Cpu, title: 'The Science Behind Algo Trading', body: 'Algorithmic trading uses mathematical models and statistical analysis to identify market inefficiencies and execute trades at optimal prices. Unlike human traders, algorithms can process thousands of data points simultaneously and react in microseconds — eliminating emotional bias and execution delays.' },
              { icon: BarChart2, title: 'Backtesting & Validation', body: 'Before any strategy goes live, it is rigorously backtested against 5+ years of historical data. We use walk-forward optimization to prevent overfitting, and all strategies must pass a strict out-of-sample validation period on a live demo account before managing real client capital.' },
              { icon: Shield, title: 'Risk-Adjusted Returns', body: 'Raw returns mean nothing without context. We focus on Sharpe Ratio, Sortino Ratio, and Maximum Drawdown. A strategy that returns 50% with 40% drawdown is far inferior to one returning 30% with only 8% drawdown — we optimize for the latter.' },
              { icon: TrendingUp, title: 'Why Institutions Use Algos', body: 'Hedge funds, investment banks, and proprietary trading firms have used algorithmic trading for decades. The edge? Speed, consistency, and the ability to trade 24/5 without emotion. ECMarketsIndia brings this institutional-grade technology to retail investors.' },
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
      </section>

      {/* CTA */}
      <section className="py-16 section-dark text-center border-t border-[#2B3139]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Activate a Strategy?</h2>
          <p className="text-[#848E9C] mb-8">Open your account in minutes. No trading experience required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-gold text-lg py-4 px-8">Create Account</Link>
            <Link href="/auth/login" className="btn-ghost text-lg py-4 px-8">Login to Portal</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
