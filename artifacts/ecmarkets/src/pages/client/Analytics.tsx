import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard, useGetPerformance } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  Loader2, TrendingUp, TrendingDown, BarChart3, Target,
  Award, ArrowUpRight, ArrowDownRight, Activity, Zap
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell, PieChart, Pie
} from 'recharts';
import { Link } from 'wouter';

const GreenTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const val = payload[0].value;
    return (
      <div style={{
        background: 'rgba(10,14,28,0.97)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(0,194,116,0.15)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#6B7280', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#00C274', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          {typeof val === 'number' && Math.abs(val) > 100
            ? `${val >= 0 ? '+' : ''}₹${Math.abs(val).toLocaleString('en-IN')}`
            : `${val > 0 ? '+' : ''}${val}%`}
        </p>
      </div>
    );
  }
  return null;
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function Analytics() {
  const { data: dashboard, isLoading } = useGetDashboard({ ...getAuthOptions() });
  const { data: perfRaw } = useGetPerformance({ ...getAuthOptions() });

  const perf = perfRaw as any;

  // Use performance API data (algo + binary combined) — source of truth
  const totalTrades   = perf?.totalTrades   ?? 0;
  const winningTrades = perf?.winningTrades  ?? 0;
  const losingTrades  = perf?.losingTrades   ?? 0;
  const totalProfit   = (perf?.totalProfit   ?? dashboard?.totalProfit) ?? 0;
  const grossWin      = perf?.grossWin  ?? 0;
  const grossLoss     = perf?.grossLoss ?? 0;
  const winRate       = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : null;
  const totalBalance  = dashboard?.totalBalance ?? 0;
  const equityData    = dashboard?.equityCurve?.length ? dashboard.equityCurve : [];

  const profitFactor  = grossLoss > 0 ? (grossWin / grossLoss).toFixed(2) : grossWin > 0 ? '∞' : '—';
  const avgWin        = winningTrades > 0 ? (grossWin / winningTrades) : 0;
  const avgLoss       = losingTrades  > 0 ? (grossLoss / losingTrades) : 0;

  const deposits = dashboard?.totalDeposits ?? 0;
  const profitPercent = deposits > 0 && totalProfit !== 0
    ? ((totalProfit / deposits) * 100).toFixed(1)
    : null;

  const monthlyReturns = (() => {
    if (!perf?.monthlyReturns?.length) return [];
    return perf.monthlyReturns.filter((m: any) => m.return !== 0);
  })();

  const bestMonth      = monthlyReturns.length ? monthlyReturns.reduce((a: any, b: any) => a.return > b.return ? a : b) : null;
  const worstMonth     = monthlyReturns.length ? monthlyReturns.reduce((a: any, b: any) => a.return < b.return ? a : b) : null;
  const positiveMonths = monthlyReturns.filter((m: any) => m.return > 0).length;

  const instrumentList: any[] = [];

  const stats = [
    { label: 'Total Return',   color: '#00C274', value: profitPercent !== null ? `+${profitPercent}%` : '—', icon: TrendingUp },
    { label: 'Win Rate',       color: '#00C274', value: winRate !== null ? `${winRate}%` : '—', icon: Target },
    { label: 'Net Profit',     color: '#00C274', value: totalProfit !== 0 ? `${totalProfit >= 0 ? '+' : ''}₹${Math.abs(totalProfit).toLocaleString('en-IN')}` : '₹0', icon: Zap },
    { label: 'Total Trades',   color: '#4B7CF3', value: String(totalTrades), icon: Activity },
    { label: 'Profit Factor',  color: '#00C274', value: String(profitFactor), icon: Award },
    { label: 'Max Drawdown',   color: '#CF304A', value: '—', icon: TrendingDown },
  ];

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
          <div className="absolute inset-0 border-t-4 border-[#00C274] rounded-full animate-spin" />
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F8FAFC] mb-1">Performance Analytics</h1>
        <p className="text-sm text-[#4B5563] font-medium">Real-time account performance and trading breakdown</p>
      </div>

      {/* ── Stats Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">
        {stats.map((s, i) => (
          <div key={i} className="card-stealth p-4">
            <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.1em] mb-1">{s.label}</p>
            <p className="font-terminal text-lg font-bold tabular-nums"
              style={{
                color: s.label === 'Max Drawdown' ? '#CF304A'
                  : s.label === 'Total Return' || s.label === 'Net Profit' || s.label === 'Win Rate' || s.label === 'Profit Factor' ? '#00C274'
                  : '#F8FAFC'
              }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Equity Curve ─── */}
      <div className="card-stealth p-4 md:p-6 mb-5">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Equity Curve</h3>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {equityData.length > 0 ? 'Portfolio value over time' : 'No equity data yet — make your first deposit'}
            </p>
          </div>
        </div>
        {equityData.length > 0 ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ left: 0, right: 4 }}>
                <defs>
                  <linearGradient id="equityFillA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00C274" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#00C274" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<GreenTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#00C274" strokeWidth={2}
                  fill="url(#equityFillA)" dot={false}
                  activeDot={{ r: 4, fill: '#00C274', stroke: 'rgba(10,14,28,0.9)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-14 h-14 text-white/[0.05] mx-auto mb-3" />
              <p className="text-[#4B5563] text-sm">No equity history yet</p>
              <p className="text-xs text-[#374151] mt-1">Deposit funds and start trading to see your growth curve</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Win/Loss Breakdown + Monthly ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        {/* Win/Loss Donut */}
        <div className="card-stealth p-5">
          <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Win / Loss Breakdown</h3>
          <p className="text-xs text-[#4B5563] mb-5">Closed trade outcomes</p>

          {totalTrades > 0 ? (
            <div className="flex items-center gap-6">
              <div className="relative shrink-0">
                <PieChart width={120} height={120}>
                  <Pie
                    data={[
                      { name: 'Wins', value: winningTrades },
                      { name: 'Losses', value: losingTrades },
                    ]}
                    cx={55} cy={55} innerRadius={38} outerRadius={55}
                    dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}
                  >
                    <Cell fill="#00C274" />
                    <Cell fill="#CF304A" />
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="font-terminal text-lg font-bold text-[#00C274]">{winRate ?? '—'}%</p>
                    <p className="text-[9px] text-[#4B5563] font-semibold uppercase">Win</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00C274] shrink-0" />
                    <span className="text-xs text-[#4B5563] font-semibold">Winning Trades</span>
                  </div>
                  <span className="font-terminal font-bold text-[#00C274] text-sm">{winningTrades}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CF304A] shrink-0" />
                    <span className="text-xs text-[#4B5563] font-semibold">Losing Trades</span>
                  </div>
                  <span className="font-terminal font-bold text-[#CF304A] text-sm">{losingTrades}</span>
                </div>
                <div className="h-px bg-white/[0.05]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4B5563] font-semibold">Avg Win</span>
                  <span className="font-terminal font-bold text-[#00C274] text-xs">+₹{avgWin.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#4B5563] font-semibold">Avg Loss</span>
                  <span className="font-terminal font-bold text-[#CF304A] text-xs">-₹{avgLoss.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center">
              <div className="text-center">
                <Activity className="w-10 h-10 text-white/[0.05] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">No closed trades yet</p>
                <Link href="/dashboard/binary" className="text-xs text-[#00C274] font-semibold mt-2 inline-block hover:text-[#33d494] transition-colors">
                  Start Binary Trading →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Monthly Returns */}
        <div className="card-stealth p-5">
          <h3 className="text-base font-bold text-[#F8FAFC] mb-1">Monthly P&L</h3>
          <p className="text-xs text-[#4B5563] mb-4">
            {monthlyReturns.length > 0 ? 'Month-by-month profit and loss' : 'No closed trades yet'}
          </p>
          {monthlyReturns.length > 0 ? (
            <>
              <div className="h-[140px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyReturns} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis dataKey="month" stroke="#374151" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#374151" fontSize={10} tickLine={false} axisLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip content={<GreenTooltip />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
                    <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                      {monthlyReturns.map((entry, i) => (
                        <Cell key={i} fill={entry.return >= 0 ? '#00C274' : '#CF304A'} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-5 mt-4 pt-4 border-t border-white/[0.05]">
                {bestMonth && (
                  <div>
                    <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Best Month</p>
                    <p className="font-terminal text-[#00C274] font-bold text-sm">
                      +₹{bestMonth.return.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Positive Months</p>
                  <p className="font-terminal text-[#F8FAFC] font-bold text-sm">{positiveMonths} / {monthlyReturns.length}</p>
                </div>
                {worstMonth && (
                  <div>
                    <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Worst Month</p>
                    <p className="font-terminal text-[#CF304A] font-bold text-sm">
                      ₹{worstMonth.return.toLocaleString('en-IN')}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="h-[160px] flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 text-white/[0.05] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">Returns will appear after trades are closed</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Instrument Performance ─── */}
      <div className="card-stealth p-4 md:p-6 pb-8">
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#F8FAFC]">Performance by Instrument</h3>
          <p className="text-xs text-[#4B5563] mt-0.5">Breakdown of profits and win rates per trading pair</p>
        </div>

        {instrumentList.length > 0 ? (
          <>
            {/* Mobile card */}
            <div className="md:hidden space-y-2">
              {instrumentList.map((inst) => (
                <div key={inst.name} className="p-3.5 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <p className="font-bold text-[#F8FAFC] text-sm">{inst.name}</p>
                    <p className="text-[11px] text-[#4B5563]">{inst.trades} trades · {inst.winRate}% win</p>
                  </div>
                  <p className={`font-terminal font-bold text-sm tabular-nums ${inst.profit >= 0 ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                    {inst.profit >= 0 ? '+' : ''}₹{Math.abs(inst.profit).toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    {['Instrument', 'Trades', 'Win Rate', 'Wins', 'Losses', 'Net P&L'].map(h => (
                      <th key={h} className="pb-3 text-left text-[#4B5563] font-bold text-[10px] uppercase tracking-[0.1em] pr-6 border-b border-white/[0.05]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {instrumentList.map((inst) => (
                    <tr key={inst.name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black"
                            style={{ background: 'rgba(0,194,116,0.1)', color: '#00C274', border: '1px solid rgba(0,194,116,0.2)' }}>
                            {inst.name.slice(0, 2)}
                          </div>
                          <span className="font-bold text-[#F8FAFC]">{inst.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-6 font-terminal text-[#F8FAFC] font-bold">{inst.trades}</td>
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/[0.05] rounded-full h-1.5">
                            <div className="h-full bg-[#00C274] rounded-full" style={{ width: `${inst.winRate}%` }} />
                          </div>
                          <span className="font-terminal font-bold text-[#00C274] text-xs">{inst.winRate}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-1.5">
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#00C274]" />
                          <span className="font-terminal font-bold text-[#00C274]">{inst.wins}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-6">
                        <div className="flex items-center gap-1.5">
                          <ArrowDownRight className="w-3.5 h-3.5 text-[#CF304A]" />
                          <span className="font-terminal font-bold text-[#CF304A]">{inst.losses}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span className={`font-terminal font-bold tabular-nums ${inst.profit >= 0 ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                          {inst.profit >= 0 ? '+' : ''}₹{Math.abs(inst.profit).toLocaleString('en-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(0,194,116,0.08)', border: '1px solid rgba(0,194,116,0.15)' }}>
              <BarChart3 className="w-7 h-7 text-[#00C274]/40" />
            </div>
            <p className="text-[#4B5563] text-sm font-medium mb-2">No trading data yet</p>
            <p className="text-xs text-[#374151] mb-4">Start trading to see your performance breakdown by instrument</p>
            <Link href="/dashboard/binary"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'linear-gradient(135deg, #00C274 0%, #00A85E 100%)', color: '#000' }}>
              Open Binary Trading
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
