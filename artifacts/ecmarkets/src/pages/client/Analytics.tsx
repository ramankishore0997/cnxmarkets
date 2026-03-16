import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard, useGetTrades } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Target, Zap, Award } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell
} from 'recharts';

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    const val = payload[0].value;
    return (
      <div style={{
        background: 'rgba(10, 14, 28, 0.95)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px',
        padding: '10px 14px',
        boxShadow: '0 16px 32px rgba(0,0,0,0.5)',
      }}>
        <p style={{ color: '#6B7280', fontSize: 11, marginBottom: 4 }}>{label}</p>
        <p style={{ color: '#FFB800', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          {typeof val === 'number' && Math.abs(val) > 100
            ? `₹${val.toLocaleString('en-IN')}`
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
  const { data: tradesRaw } = useGetTrades({ ...getAuthOptions() });

  const trades       = (tradesRaw as any[]) || [];
  const closedTrades = trades.filter((t: any) => t.status === 'closed' && t.profit !== undefined);

  const totalTrades     = closedTrades.length;
  const winningTrades   = closedTrades.filter((t: any) => (t.profit || 0) > 0).length;
  const winRate         = totalTrades > 0 ? ((winningTrades / totalTrades) * 100).toFixed(1) : null;
  const totalProfit     = dashboard?.totalProfit ?? 0;
  const totalBalance    = dashboard?.totalBalance ?? 0;
  const equityData      = dashboard?.equityCurve?.length ? dashboard.equityCurve : [];

  const profitPercent   = totalBalance > 0 && totalProfit !== 0
    ? (((totalBalance) / (totalBalance - totalProfit) - 1) * 100).toFixed(1)
    : null;

  const monthlyReturns = (() => {
    if (closedTrades.length === 0) return [];
    const byMonth: Record<string, number> = {};
    closedTrades.forEach((t: any) => {
      const d = new Date(t.closedAt || t.openedAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      byMonth[key] = (byMonth[key] || 0) + (t.profit || 0);
    });
    return Object.entries(byMonth)
      .map(([key, profit]) => {
        const [year, month] = key.split('-').map(Number);
        return { month: `${MONTH_NAMES[month]} ${year.toString().slice(-2)}`, return: Number(profit.toFixed(2)) };
      })
      .sort((a, b) => {
        const ai = MONTH_NAMES.findIndex(m => a.month.startsWith(m));
        const bi = MONTH_NAMES.findIndex(m => b.month.startsWith(m));
        return ai - bi;
      })
      .slice(-12);
  })();

  const bestMonth      = monthlyReturns.length ? monthlyReturns.reduce((a, b) => a.return > b.return ? a : b) : null;
  const worstMonth     = monthlyReturns.length ? monthlyReturns.reduce((a, b) => a.return < b.return ? a : b) : null;
  const positiveMonths = monthlyReturns.filter(m => m.return > 0).length;
  const avgMonthly     = monthlyReturns.length
    ? (monthlyReturns.reduce((s, m) => s + m.return, 0) / monthlyReturns.length).toFixed(2)
    : null;

  const strategy     = (dashboard as any)?.assignedStrategyDetails;
  const strategyName = strategy?.name || (dashboard as any)?.assignedStrategy;
  const isRazrStrat  = (n: string) => n?.toLowerCase().includes('razr') || n?.toLowerCase().includes('razor');
  const dailyRoi     = isRazrStrat(strategyName) ? 8.0 : 4.0;
  const monthlyRoi   = dailyRoi * 30;

  const stats = [
    { label: 'Total Return',   icon: TrendingUp,  color: '#02C076', value: profitPercent !== null ? `+${profitPercent}%` : '—' },
    { label: 'Win Rate',       icon: Target,      color: '#FFB800', value: winRate !== null ? `${winRate}%` : '—' },
    { label: 'Max Drawdown',   icon: TrendingDown,color: '#CF304A', value: strategy?.maxDrawdown != null ? `-${strategy.maxDrawdown}%` : '—' },
    { label: 'Monthly Return', icon: BarChart3,   color: '#FFB800', value: strategyName ? `+${monthlyRoi}%` : (avgMonthly ? `${Number(avgMonthly) >= 0 ? '+' : ''}₹${Number(avgMonthly).toLocaleString()}` : '—') },
    { label: 'Net Profit',     icon: Zap,         color: '#02C076', value: totalProfit !== 0 ? `${totalProfit >= 0 ? '+' : ''}₹${Math.abs(totalProfit).toLocaleString('en-IN')}` : '₹0' },
    { label: 'Total Trades',   icon: Award,       color: '#3b82f6', value: String(totalTrades) },
  ];

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
          <div className="absolute inset-0 border-t-4 border-[#FFB800] rounded-full animate-spin" />
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-[#F8FAFC] mb-1">Performance Analytics</h1>
        <p className="text-sm text-[#4B5563] font-medium">Strategy performance and portfolio breakdown</p>
      </div>

      {/* ── Stats Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="card-stealth p-4">
            <div className="w-8 h-8 rounded-xl mb-3 flex items-center justify-center"
              style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.1em] mb-1">{s.label}</p>
            <p className="font-terminal text-lg font-bold tabular-nums"
              style={{
                color: s.label === 'Max Drawdown' ? '#CF304A'
                  : s.label === 'Total Return' || s.label === 'Net Profit' ? '#02C076'
                  : '#F8FAFC'
              }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Equity Curve ─── */}
      <div className="card-stealth p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Equity Curve</h3>
            <p className="text-xs text-[#4B5563] mt-0.5">
              {equityData.length > 0 ? 'Portfolio value over time' : 'No equity data yet — make your first deposit'}
            </p>
          </div>
        </div>
        {equityData.length > 0 ? (
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData} margin={{ left: 0, right: 4 }}>
                <defs>
                  <linearGradient id="equityFillA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FFB800" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="value" stroke="#FFB800" strokeWidth={2.5}
                  fill="url(#equityFillA)" dot={false}
                  activeDot={{ r: 5, fill: '#FFB800', stroke: 'rgba(10,14,28,0.9)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-14 h-14 text-white/[0.05] mx-auto mb-3" />
              <p className="text-[#4B5563] text-sm">No equity history yet</p>
              <p className="text-xs text-[#374151] mt-1">Deposit funds and start trading to see your growth curve</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Monthly Returns ─── */}
      <div className="card-stealth p-6 mb-5">
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#F8FAFC]">Monthly Returns</h3>
          <p className="text-xs text-[#4B5563] mt-0.5">
            {monthlyReturns.length > 0 ? 'Month-by-month P&L from closed trades' : 'No closed trades yet'}
          </p>
        </div>
        {monthlyReturns.length > 0 ? (
          <>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns} barCategoryGap="32%">
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="month" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} />
                  <Bar dataKey="return" radius={[5, 5, 0, 0]}>
                    {monthlyReturns.map((entry, i) => (
                      <Cell key={i} fill={entry.return >= 0 ? '#02C076' : '#CF304A'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <hr className="divider-faint my-4" />
            <div className="flex flex-wrap gap-6">
              {bestMonth && (
                <div>
                  <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Best Month</p>
                  <p className="font-terminal text-[#02C076] font-bold text-sm">
                    +₹{bestMonth.return.toLocaleString('en-IN')} <span className="text-[#4B5563] font-normal">({bestMonth.month})</span>
                  </p>
                </div>
              )}
              {worstMonth && (
                <div>
                  <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Worst Month</p>
                  <p className="font-terminal text-[#CF304A] font-bold text-sm">
                    ₹{worstMonth.return.toLocaleString('en-IN')} <span className="text-[#4B5563] font-normal">({worstMonth.month})</span>
                  </p>
                </div>
              )}
              {monthlyReturns.length > 0 && (
                <div>
                  <p className="text-[10px] text-[#4B5563] font-bold uppercase tracking-wider mb-1">Positive Months</p>
                  <p className="font-terminal text-[#F8FAFC] font-bold text-sm">{positiveMonths} / {monthlyReturns.length}</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="h-[180px] flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-white/[0.05] mx-auto mb-3" />
              <p className="text-[#4B5563] text-sm">Returns will appear after trades are closed</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Strategy Details ─── */}
      <div className="card-stealth p-6 pb-8">
        <div className="mb-5">
          <h3 className="text-base font-bold text-[#F8FAFC]">Active Strategy Details</h3>
          <p className="text-xs text-[#4B5563] mt-0.5">Performance profile of your current algorithm</p>
        </div>
        {strategyName && strategy ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  {['Strategy', 'Win Rate', 'Monthly Return', 'Max Drawdown', 'Risk Level', 'Markets'].map(h => (
                    <th key={h} className="pb-4 text-left text-[#4B5563] font-bold text-[10px] uppercase tracking-[0.1em] pr-6
                      border-b border-white/[0.05]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl icon-squircle-gold flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-[#FFB800]" />
                      </div>
                      <span className="font-bold text-[#F8FAFC]">{strategy.name}</span>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/[0.05] rounded-full h-1.5 w-20">
                        <div className="h-full bg-[#02C076] rounded-full" style={{ width: `${strategy.winRate}%` }} />
                      </div>
                      <span className="font-terminal font-bold text-[#F8FAFC]">{strategy.winRate}%</span>
                    </div>
                  </td>
                  <td className="py-5 pr-6">
                    <span className="font-terminal font-bold text-[#02C076]">+{monthlyRoi}%</span>
                  </td>
                  <td className="py-5 pr-6">
                    <span className="font-terminal font-bold text-[#CF304A]">{strategy.maxDrawdown}%</span>
                  </td>
                  <td className="py-5 pr-6">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${
                      strategy.riskProfile === 'high'   ? 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25' :
                      strategy.riskProfile === 'medium' ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/25' :
                      'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/25'
                    }`}>{strategy.riskProfile}</span>
                  </td>
                  <td className="py-5 text-[#4B5563] font-medium text-sm">{strategy.markets}</td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <Zap className="w-12 h-12 text-white/[0.05] mx-auto mb-3" />
            <p className="text-[#4B5563] text-sm font-medium">No strategy assigned</p>
            <p className="text-xs text-[#374151] mt-1">Visit the Strategy Selection page to activate one</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
