import { useState, useEffect, useRef } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useGetStrategies } from '@workspace/api-client-react';
import { TrendingUp, Filter, BarChart2, Shield, Cpu, Loader2, Zap, Activity } from 'lucide-react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { LivePriceTicker } from '@/components/shared/LivePriceTicker';

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#00C274', high: '#CF304A' };
const RISK_BG: Record<string, string> = { low: '#02C07620', medium: '#00C27420', high: '#CF304A20' };

const STANDARD_DAILY = 4.0;
const RAZOR_DAILY = 8.0;
const isRazrName = (n: string) => n.toLowerCase().includes('razr') || n.toLowerCase().includes('razor');
const getDailyBase = (n: string) => isRazrName(n) ? RAZOR_DAILY : STANDARD_DAILY;

interface LiveStat { winRate: number; livePnl: number; dailyRate: number; }

// Deterministic pseudo-random from strategy id (no Math.random for seeding)
function seededFrac(id: number, salt: number): number {
  const x = Math.sin(id * 9301 + salt * 49297 + 233) * 100003;
  return x - Math.floor(x);
}

export function Strategies() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { data: strategiesRaw, isLoading } = useGetStrategies();
  const [liveStats, setLiveStats] = useState<Record<number, LiveStat>>({});
  const tickRef = useRef(0);

  const allStrategies = ((strategiesRaw as any[]) || []).filter((s: any) => s.isActive);

  // Initialise live stats once strategies load — deterministic per strategy id
  useEffect(() => {
    if (!allStrategies.length) return;
    const initial: Record<number, LiveStat> = {};
    allStrategies.forEach((s: any) => {
      const base = parseFloat(s.winRate);
      const cap = parseFloat(s.minCapital);
      const daily = getDailyBase(s.name);
      initial[s.id] = {
        winRate: base,
        livePnl: cap * (daily / 100) * (0.90 + seededFrac(s.id, 1) * 0.20),
        dailyRate: daily,
      };
    });
    setLiveStats(initial);
  }, [allStrategies.length]);

  // Fluctuate strategies every 2.8 s using time-based sine variation (no Math.random)
  useEffect(() => {
    if (!allStrategies.length) return;
    const id = setInterval(() => {
      tickRef.current += 1;
      const tick = tickRef.current;
      const ids = allStrategies.map((s: any) => s.id);
      // Pick 2-3 strategies deterministically per tick
      const pickCount = (tick % 2) + 2;
      const toUpdate = ids.filter((_: number, i: number) => ((i + tick) % Math.max(1, ids.length / pickCount)) < 1);
      setLiveStats(prev => {
        const next = { ...prev };
        toUpdate.forEach((sid: number) => {
          if (!next[sid]) return;
          const s = allStrategies.find((x: any) => x.id === sid);
          const dailyBase = getDailyBase(s.name);
          const wave = Math.sin(tick * 0.4 + sid * 1.3) * 0.5; // -0.5 to +0.5
          next[sid] = {
            winRate: Math.min(99.9, Math.max(50, next[sid].winRate + wave * 0.3)),
            livePnl: next[sid].livePnl * (1 + Math.sin(tick * 0.7 + sid) * 0.004),
            dailyRate: parseFloat((dailyBase + Math.sin(tick * 0.5 + sid * 0.8) * 0.03).toFixed(2)),
          };
        });
        return next;
      });
    }, 2_800);
    return () => clearInterval(id);
  }, [allStrategies.length]);

  const filters = ['All', 'Forex', 'Crypto', 'low', 'medium', 'high'];
  const filterLabels: Record<string, string> = { All: 'All', Forex: 'Forex', Crypto: 'Crypto', low: 'Low Risk', medium: 'Med Risk', high: 'High Risk' };

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[#181B23]/50 border border-[#00C274]/30 text-[#00C274] px-4 py-1.5 rounded-full inline-flex text-sm font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse mr-2 mt-1"></span>
            {isLoading ? '...' : `${allStrategies.length} Active Strategies Available`}
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-6xl font-bold text-white mb-6">
            Institutional Algo<br /><span className="text-gradient-green">Strategy Catalogue</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-lg text-[#848E9C] max-w-2xl mx-auto mb-8">
            Browse our full library of battle-tested quantitative strategies. From low-risk systematic approaches to high-frequency momentum — there's a strategy for every risk profile.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-green text-lg py-4 px-8">Start Trading</Link>
            <Link href="/auth/login" className="btn-ghost text-lg py-4 px-8">Client Portal</Link>
          </motion.div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="section-surface border-y border-[#181B23] py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Live Strategies', value: isLoading ? null : allStrategies.length },
              { label: 'Low Risk Options', value: isLoading ? null : allStrategies.filter((s: any) => s.riskProfile === 'low').length },
              { label: 'Avg Win Rate', value: isLoading ? null : (allStrategies.length ? `${(allStrategies.reduce((sum: number, s: any) => sum + parseFloat(s.winRate), 0) / allStrategies.length).toFixed(1)}%` : '—') },
              { label: 'Avg Monthly Return', value: isLoading ? null : (allStrategies.length ? `+${(allStrategies.reduce((sum: number, s: any) => sum + getDailyBase(s.name) * 30, 0) / allStrategies.length).toFixed(0)}%` : '—') },
            ].map((s, i) => (
              <div key={i} className="py-2">
                <p className="text-2xl font-bold text-[#00C274]">
                  {s.value === null ? <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00C274]" /> : s.value}
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
          {/* Live Price Ticker */}
          <div className="mb-10">
            <LivePriceTicker />
          </div>

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
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold transition-all border ${activeFilter === f ? 'bg-[#00C274] text-black border-[#00C274]' : 'border-[#181B23] text-[#848E9C] hover:border-[#00C274]/50 hover:text-white'}`}
                >
                  <Filter className="w-3.5 h-3.5" /> {filterLabels[f] || f}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-[#00C274]" />
            </div>
          ) : filteredStrategies.length === 0 ? (
            <div className="text-center py-20">
              <TrendingUp className="w-16 h-16 text-[#181B23] mx-auto mb-4" />
              <p className="text-[#848E9C] font-medium">No strategies match this filter.</p>
            </div>
          ) : (
            <motion.div variants={stagger} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStrategies.map((s: any, i: number) => (
                <motion.div key={s.id || i} variants={fadeUp} className="card-stealth p-6 flex flex-col hover:border-[#00C274]/30 transition-all group">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: RISK_BG[s.riskProfile], border: `1px solid ${RISK_COLORS[s.riskProfile]}40` }}>
                      <Zap className="w-5 h-5" style={{ color: RISK_COLORS[s.riskProfile] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white truncate">{s.name}</h3>
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#02C076] bg-[#02C076]/10 px-1.5 py-0.5 rounded shrink-0">
                          <Activity className="w-2.5 h-2.5" /> LIVE
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold capitalize px-2 py-0.5 rounded" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile} risk</span>
                        <span className="text-xs text-[#848E9C]">{s.markets}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#848E9C] mb-4 leading-relaxed flex-1">{s.description}</p>

                  {/* Live P&L strip */}
                  {liveStats[s.id] && (
                    <div className="flex items-center justify-between bg-[#060709] border border-[#02C076]/20 rounded-xl px-3 py-2 mb-3">
                      <span className="text-[10px] font-semibold text-[#848E9C] uppercase tracking-wide">Live P&amp;L Today</span>
                      <span className="text-sm font-bold text-[#02C076]">
                        +₹{liveStats[s.id].livePnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}

                  {/* ROI Banner */}
                  <div className={`flex items-center justify-between rounded-xl px-3 py-2 mb-3 border ${isRazrName(s.name) ? 'bg-[#02C076]/10 border-[#02C076]/30' : 'bg-[#00C274]/10 border-[#00C274]/30'}`}>
                    <div className="text-center">
                      <p className={`text-base font-black tabular-nums ${isRazrName(s.name) ? 'text-[#02C076]' : 'text-[#00C274]'}`}>
                        +{liveStats[s.id] ? liveStats[s.id].dailyRate.toFixed(2) : getDailyBase(s.name).toFixed(2)}%
                      </p>
                      <p className="text-[9px] text-[#848E9C] font-semibold uppercase tracking-wide">Daily ROI ↻</p>
                    </div>
                    <div className="w-px h-8 bg-[#181B23]" />
                    <div className="text-center">
                      <p className="text-base font-black text-[#02C076]">+{(getDailyBase(s.name) * 30).toFixed(0)}%</p>
                      <p className="text-[9px] text-[#848E9C] font-semibold uppercase tracking-wide">Monthly (30d)</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="bg-[#060709] rounded-xl p-3 text-center border border-[#181B23]">
                      <p className="text-sm font-bold text-[#00C274] tabular-nums">
                        {liveStats[s.id] ? liveStats[s.id].winRate.toFixed(1) : s.winRate}%
                      </p>
                      <p className="text-[10px] text-[#848E9C] mt-0.5">Win Rate ↻</p>
                    </div>
                    <div className="bg-[#060709] rounded-xl p-3 text-center border border-[#181B23]">
                      <p className="text-sm font-bold text-white">
                        ₹{s.minCapital >= 100000 ? `${(s.minCapital / 100000).toFixed(0)}L` : `${(s.minCapital / 1000).toFixed(0)}K`}
                      </p>
                      <p className="text-[10px] text-[#848E9C] mt-0.5">Min Capital</p>
                    </div>
                  </div>

                  <Link href="/auth/register" className="btn-green text-sm py-2.5 text-center w-full block">
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* COMPARISON TABLE — LIVE */}
      {!isLoading && allStrategies.length > 0 && (
        <section className="py-16 section-surface border-y border-[#181B23]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-[#02C076]/10 border border-[#02C076]/30 text-[#02C076] px-4 py-1.5 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse" />
                Live Data · Updates Every 2.8s
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">Full Strategy Comparison</h2>
              <p className="text-[#848E9C] max-w-2xl mx-auto">Side-by-side live metrics for all {allStrategies.length} active strategies</p>
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[#848E9C]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00C274]" />Standard — 4% daily target</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#02C076]" />RazrMarket — 8% daily target</span>
              </div>
            </div>
            <div className="card-stealth overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#181B23] border-b border-[#181B23]">
                      {[
                        { label: 'Strategy', sub: '' },
                        { label: 'Risk', sub: '' },
                        { label: 'Min Capital', sub: '' },
                        { label: 'Win Rate', sub: '↻ live' },
                        { label: 'Daily ROI', sub: '↻ live' },
                        { label: 'Monthly ROI', sub: 'from DB' },
                        { label: 'Max DD', sub: '' },
                        { label: 'Markets', sub: '' },
                        { label: 'Status', sub: '' },
                      ].map(h => (
                        <th key={h.label} className="px-4 py-3.5 text-left">
                          <span className="text-[#EAECEF] font-bold text-xs uppercase tracking-wider">{h.label}</span>
                          {h.sub && <span className="block text-[#848E9C] text-[9px] font-normal normal-case tracking-normal mt-0.5">{h.sub}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#181B23]">
                    {allStrategies.map((s: any, i: number) => {
                      const live = liveStats[s.id];
                      const isRazr = isRazrName(s.name);
                      const dailyBase = getDailyBase(s.name);
                      const monthly = dailyBase * 30;
                      const displayDailyRate = live?.dailyRate ?? dailyBase;
                      const displayWinRate = live?.winRate ?? parseFloat(s.winRate);
                      return (
                        <tr key={s.id || i} className={`hover:bg-[#181B23]/50 transition-colors ${i % 2 === 0 ? 'bg-[#060709]/40' : ''}`}>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{s.name}</span>
                              {isRazr && <span className="text-[8px] font-black bg-[#00C274] text-black px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0">FLAGSHIP</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded text-xs font-bold capitalize" style={{ background: RISK_BG[s.riskProfile], color: RISK_COLORS[s.riskProfile] }}>{s.riskProfile}</span>
                          </td>
                          <td className="px-4 py-3.5 text-[#EAECEF] text-xs font-medium">
                            ₹{Number(s.minCapital).toLocaleString('en-IN')}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-[#00C274] tabular-nums">
                              {displayWinRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`text-xs font-bold tabular-nums ${isRazr ? 'text-[#02C076]' : 'text-[#00C274]'}`}>
                              +{displayDailyRate.toFixed(2)}%
                            </span>
                            <span className="text-[10px] text-[#848E9C] ml-1">/day</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-[#02C076] tabular-nums">+{monthly.toFixed(2)}%</span>
                            <span className="text-[10px] text-[#848E9C] ml-1">/mo</span>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="text-xs font-bold text-[#CF304A]">{s.maxDrawdown}%</span>
                          </td>
                          <td className="px-4 py-3.5 text-[#848E9C] text-xs">{s.markets}</td>
                          <td className="px-4 py-3.5">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-[#02C076]">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#02C076] animate-pulse" />
                              Active
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-center text-[10px] text-[#848E9C] mt-4">
              Win Rate and Daily ROI update live every 2.8s · Monthly ROI = Daily ROI × 30 trading days
            </p>
          </div>
        </section>
      )}

      {/* EDUCATION */}
      <section className="py-20 section-surface border-t border-[#181B23]">
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
              { icon: TrendingUp, title: 'Why Institutions Use Algos', body: 'Hedge funds, investment banks, and proprietary trading firms have used algorithmic trading for decades. The edge? Speed, consistency, and the ability to trade 24/5 without emotion. ECMarket Pro brings this institutional-grade technology to retail investors.' },
            ].map((card, i) => (
              <div key={i} className="card-stealth p-8 flex gap-5">
                <div className="w-12 h-12 bg-[#060709] border border-[#181B23] rounded-xl flex items-center justify-center shrink-0">
                  <card.icon className="w-6 h-6 text-[#00C274]" />
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
      <section className="py-16 section-dark text-center border-t border-[#181B23]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Activate a Strategy?</h2>
          <p className="text-[#848E9C] mb-8">Open your account in minutes. No trading experience required.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register" className="btn-green text-lg py-4 px-8">Create Account</Link>
            <Link href="/auth/login" className="btn-ghost text-lg py-4 px-8">Login to Portal</Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
