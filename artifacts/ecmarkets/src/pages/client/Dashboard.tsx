import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
  CreditCard, TrendingUp, Download, Upload, Zap,
  BarChart2, Target, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'wouter';
import { LivePriceTicker } from '@/components/shared/LivePriceTicker';

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };
const RISK_BG: Record<string, string>    = { low: '#02C07615', medium: '#F0B90B15', high: '#CF304A15' };

const getISTProgress = () => {
  const now = new Date();
  const istMs = now.getTime() + (5.5 * 3600 * 1000);
  const istDate = new Date(istMs);
  const s = (istDate.getUTCHours() * 3600) + (istDate.getUTCMinutes() * 60) + istDate.getUTCSeconds();
  return Math.min(s / 86400, 1);
};

export function Dashboard() {
  const { data, isLoading } = useGetDashboard({
    ...getAuthOptions(),
    query: { refetchInterval: 8_000 },
  });

  const totalBalance  = data?.totalBalance  ?? 0;
  const totalProfit   = data?.totalProfit   ?? 0;
  const strategy      = (data as any)?.assignedStrategyDetails;
  const strategyName: string | undefined = strategy?.name || (data as any)?.assignedStrategy;
  const dailyTarget   = (data as any)?.dailyGrowthTarget;
  const isRazr        = (n?: string) => n?.toLowerCase().includes('razr') || n?.toLowerCase().includes('razor');
  const dailyRatePct  = isRazr(strategyName) ? 8.0 : (dailyTarget ?? 4.0);
  const dailyTargetAmt = totalBalance > 0 ? totalBalance * (dailyRatePct / 100) : 0;

  const [liveProfit, setLiveProfit] = useState<number>(() => dailyTargetAmt * getISTProgress());

  useEffect(() => {
    if (!dailyTargetAmt) return;
    setLiveProfit(dailyTargetAmt * getISTProgress());
    const id = setInterval(() => {
      setLiveProfit(prev => {
        const inc = dailyTargetAmt * 0.0012 * (0.6 + Math.random() * 0.8);
        return Math.min(prev + inc, dailyTargetAmt);
      });
    }, 4_500);
    return () => clearInterval(id);
  }, [dailyTargetAmt]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-4 border-[#FFB800] rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const equityData    = data?.equityCurve?.length ? data.equityCurve : [];
  const profitPercent = totalBalance > 0 && totalProfit !== 0
    ? (((totalBalance) / (totalBalance - totalProfit) - 1) * 100).toFixed(2)
    : '0.00';
  const monthlyReturn   = parseFloat(strategy?.monthlyReturn ?? dailyRatePct * 30 / 10);
  const progressPct     = dailyTargetAmt > 0 ? Math.min((liveProfit / dailyTargetAmt) * 100, 100) : 0;
  const dailyGainPct    = totalBalance > 0 ? (liveProfit / totalBalance) * 100 : 0;

  return (
    <DashboardLayout>

      {/* ── Page header ─── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Portfolio Overview</h1>
          <p className="text-sm text-[#4B5563] font-medium">Real-time algorithmic performance</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/dashboard/deposit"  className="flex-1 md:flex-none btn-gold flex items-center justify-center gap-2 text-sm">
            <Download className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/dashboard/withdraw" className="flex-1 md:flex-none btn-ghost flex items-center justify-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* ── Live ticker ─── */}
      <div className="mb-6">
        <LivePriceTicker />
      </div>

      {/* ── Main Balance Hero ─── */}
      <div className="card-stealth p-7 mb-6 relative overflow-hidden">
        {/* Ambient glow blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.07) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(2,192,118,0.04) 0%, transparent 70%)' }} />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Balance */}
          <div className="flex-1">
            <p className="text-[10px] text-[#4B5563] uppercase tracking-[0.16em] font-bold mb-2">Total Account Value</p>
            <h2 className="font-terminal text-glow-amber text-4xl md:text-5xl font-bold mb-4 tracking-tight tabular-nums leading-none">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm ${
                parseFloat(profitPercent) >= 0
                  ? 'bg-[#02C076]/12 border border-[#02C076]/25 text-[#02C076]'
                  : 'bg-[#CF304A]/12 border border-[#CF304A]/25 text-[#CF304A]'
              }`}>
                <TrendingUp className="w-3.5 h-3.5" />
                {parseFloat(profitPercent) >= 0 ? '+' : ''}{profitPercent}%
              </div>
              <span className="text-[#4B5563] text-sm font-medium">
                All-time P&L:&nbsp;
                <strong className={`font-terminal ${totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                  {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          {/* Status mini-tiles */}
          <div className="w-full md:w-[220px] flex flex-col gap-2 shrink-0">
            <div className="glass-tile flex items-center justify-between">
              <span className="text-[11px] text-[#4B5563] font-semibold uppercase tracking-wider">Status</span>
              <span className="text-[#02C076] text-xs font-bold flex items-center gap-1.5">
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#02C076] inline-block" />
                Live
              </span>
            </div>
            <div className="glass-tile flex items-center justify-between">
              <span className="text-[11px] text-[#4B5563] font-semibold uppercase tracking-wider">Net Deposits</span>
              <span className="font-terminal text-[#F8FAFC] text-xs font-bold tabular-nums">
                ₹{((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString('en-IN')}
              </span>
            </div>
            <div className="glass-tile flex items-center justify-between">
              <span className="text-[11px] text-[#4B5563] font-semibold uppercase tracking-wider">Closed Trades</span>
              <span className="font-terminal text-[#F8FAFC] text-xs font-bold tabular-nums">
                {data?.recentTrades?.filter((t: any) => t.status === 'closed').length ?? 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Active Strategy ─── */}
      {strategyName ? (
        <div className="card-stealth-gold p-6 mb-6 relative overflow-hidden">
          {/* Gold glow behind icon */}
          <div className="absolute left-5 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,184,0,0.18) 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-[#FFB800]/15 border border-[#FFB800]/35 flex items-center justify-center shrink-0 shadow-lg shadow-[#FFB800]/10">
              <Zap className="w-6 h-6 text-[#FFB800]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="text-[10px] font-bold text-[#FFB800] uppercase tracking-[0.14em]">Active Strategy</p>
                {strategy?.riskProfile && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ background: RISK_BG[strategy.riskProfile], color: RISK_COLORS[strategy.riskProfile], border: `1px solid ${RISK_COLORS[strategy.riskProfile]}40` }}>
                    {strategy.riskProfile} Risk
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-[#F8FAFC] mb-0.5">{strategyName}</h3>
              {strategy?.description && (
                <p className="text-xs text-[#4B5563] truncate max-w-xl">{strategy.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-5 shrink-0">
              {strategy?.monthlyReturn != null && (
                <div className="text-center">
                  <p className="font-terminal text-lg font-bold text-[#02C076]">+{strategy.monthlyReturn}%</p>
                  <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">Monthly</p>
                </div>
              )}
              {strategy?.winRate != null && (
                <div className="text-center">
                  <p className="font-terminal text-lg font-bold text-[#F8FAFC]">{strategy.winRate}%</p>
                  <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">Win Rate</p>
                </div>
              )}
              {strategy?.maxDrawdown != null && (
                <div className="text-center">
                  <p className="font-terminal text-lg font-bold text-[#CF304A]">{strategy.maxDrawdown}%</p>
                  <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">Max DD</p>
                </div>
              )}
              {dailyTarget != null && (
                <div className="text-center">
                  <p className="font-terminal text-lg font-bold text-[#FFB800]">{dailyTarget}%</p>
                  <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">Daily Target</p>
                </div>
              )}
              {totalBalance > 0 && dailyTargetAmt > 0 && (
                <div className="text-center">
                  <p className={`font-terminal text-lg font-bold ${dailyGainPct >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                    {dailyGainPct >= 0 ? '+' : ''}{dailyGainPct.toFixed(2)}%
                  </p>
                  <p className="text-[10px] text-[#4B5563] font-medium mt-0.5">Daily Return</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-stealth p-5 mb-6 flex items-center gap-4 border-dashed">
          <div className="w-10 h-10 rounded-xl icon-squircle-gold flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#FFB800]" />
          </div>
          <div>
            <p className="font-semibold text-[#F8FAFC] text-sm">No Strategy Assigned</p>
            <p className="text-xs text-[#4B5563] mt-0.5">Contact your account manager to activate an algorithmic strategy.</p>
          </div>
          <Link href="/dashboard/kyc" className="ml-auto text-xs font-bold text-[#FFB800] hover:text-[#ffd240] transition-colors shrink-0">Complete KYC →</Link>
        </div>
      )}

      {/* ── Live Profit Counter ─── */}
      {strategyName && dailyTargetAmt > 0 && (
        <div className="card-stealth p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(2,192,118,0.06) 0%, transparent 70%)' }} />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Live number */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot w-2 h-2 rounded-full bg-[#02C076] inline-block" />
                <p className="text-[10px] font-bold text-[#02C076] uppercase tracking-[0.14em]">Live Profit Today</p>
              </div>
              <div className="flex items-end gap-3 flex-wrap">
                <p className="font-terminal text-glow-green-breathe text-4xl font-black tabular-nums leading-none">
                  +₹{liveProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                {totalBalance > 0 && dailyTargetAmt > 0 && (
                  <span className={`mb-1 px-2.5 py-1 rounded-lg text-sm font-terminal font-bold tabular-nums border ${
                    dailyGainPct >= 0
                      ? 'bg-[#02C076]/12 border-[#02C076]/30 text-[#02C076]'
                      : 'bg-[#CF304A]/12 border-[#CF304A]/30 text-[#CF304A]'
                  }`}>
                    {dailyGainPct >= 0 ? '+' : ''}{dailyGainPct.toFixed(2)}% Daily Gain
                  </span>
                )}
              </div>
              <p className="text-xs text-[#4B5563] mt-2 font-medium">
                Target:&nbsp;
                <span className="font-terminal text-[#F8FAFC] font-bold">
                  ₹{dailyTargetAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="ml-1.5 text-[#FFB800] font-bold">({dailyRatePct}%/day)</span>
              </p>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-3 md:min-w-[260px]">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#4B5563]">Daily Progress</span>
                <span className="font-terminal text-[#02C076]">{progressPct.toFixed(1)}%</span>
              </div>
              {/* Gradient progress bar with glowing tip */}
              <div className="w-full h-2.5 bg-white/[0.05] rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full progress-bar-gradient transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2.5 mt-1">
                <div className="glass-tile text-center">
                  <p className="font-terminal text-sm font-bold text-[#FFB800]">{dailyRatePct}%</p>
                  <p className="text-[10px] text-[#4B5563] mt-0.5">Daily Target</p>
                </div>
                <div className="glass-tile text-center">
                  <p className="font-terminal text-sm font-bold text-[#02C076]">+{monthlyReturn}%</p>
                  <p className="text-[10px] text-[#4B5563] mt-0.5">Monthly Return</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Metrics Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Net Deposits */}
        <div className="card-stealth p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.12em]">Net Deposits</h3>
            <div className="w-9 h-9 icon-squircle-gold flex items-center justify-center">
              <Wallet className="w-4 h-4 text-[#FFB800]" />
            </div>
          </div>
          <p className="font-terminal text-xl font-bold text-[#F8FAFC] tabular-nums">
            ₹{((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Profit */}
        <div className="card-stealth p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.12em]">Total Profit</h3>
            <div className={`w-9 h-9 flex items-center justify-center ${totalProfit >= 0 ? 'icon-squircle-green' : 'icon-squircle-red'}`}>
              <Activity className={`w-4 h-4 ${totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`} />
            </div>
          </div>
          <p className={`font-terminal text-xl font-bold tabular-nums ${totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
            {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
          </p>
        </div>

        {/* Strategy */}
        <div className="card-stealth p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.12em]">Strategy</h3>
            <div className="w-9 h-9 icon-squircle-gold flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-[#FFB800]" />
            </div>
          </div>
          <p className="text-base font-bold text-[#F8FAFC] truncate">{strategyName || '—'}</p>
        </div>

        {/* Daily Target */}
        <div className="card-stealth p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] text-[#4B5563] font-bold uppercase tracking-[0.12em]">Daily Target</h3>
            <div className="w-9 h-9 icon-squircle-gold flex items-center justify-center">
              <Target className="w-4 h-4 text-[#FFB800]" />
            </div>
          </div>
          <p className="font-terminal text-xl font-bold text-[#F8FAFC] tabular-nums">
            {dailyTarget != null ? `${dailyTarget}%` : '—'}
          </p>
        </div>
      </div>

      {/* ── Equity Curve ─── */}
      <div className="card-stealth p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Equity Curve</h3>
            {equityData.length === 0 && (
              <p className="text-xs text-[#4B5563] mt-0.5">Appears after your first closed trade</p>
            )}
          </div>
          <BarChart2 className="w-4.5 h-4.5 w-[18px] h-[18px] text-[#374151]" />
        </div>
        {equityData.length > 0 ? (
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#FFB800" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="#FFB800" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="date" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(12px)', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F8FAFC', fontSize: 12 }}
                  itemStyle={{ color: '#FFB800', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                  labelStyle={{ color: '#6B7280', fontSize: 11 }}
                />
                <Area type="monotone" dataKey="value" stroke="#FFB800" strokeWidth={2.5}
                  fillOpacity={1} fill="url(#equityFill)" dot={false}
                  activeDot={{ r: 5, fill: '#FFB800', stroke: 'rgba(15,23,42,0.9)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[260px] flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-14 h-14 text-white/[0.06] mx-auto mb-4" />
              <p className="text-[#4B5563] font-medium text-sm">No equity data yet</p>
              <p className="text-xs text-[#374151] mt-1">Deposit funds to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-10">

        {/* Execution Feed */}
        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-[#F8FAFC]">Live Execution Feed</h3>
            <Link href="/dashboard/analytics" className="text-xs font-semibold text-[#FFB800] hover:text-[#ffd240] transition-colors">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.recentTrades?.length ? data.recentTrades : []).length === 0 ? (
              <div className="text-center py-10">
                <Activity className="w-11 h-11 text-white/[0.06] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">No trades yet</p>
              </div>
            ) : (
              (data?.recentTrades || []).map((trade: any) => (
                <div key={trade.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-[#FFB800]/20 transition-all duration-200 hover:bg-white/[0.035]">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-black ${
                      trade.direction === 'buy' ? 'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/25' : 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25'
                    }`}>
                      {trade.direction === 'buy' ? 'B' : 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-sm">{trade.instrument}</p>
                      <p className="text-[11px] text-[#4B5563] font-medium capitalize">{trade.direction} · {trade.lotSize} lots</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.status === 'open' ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#FFB800]/15 text-[#FFB800] text-[10px] font-bold uppercase tracking-wider border border-[#FFB800]/25">
                        Open
                      </span>
                    ) : (
                      <p className={`font-terminal font-bold text-base tabular-nums ${(trade.profit || 0) >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}₹{Math.abs(trade.profit || 0).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-[#F8FAFC]">Recent Transactions</h3>
            <Link href="/dashboard/deposit" className="text-xs font-semibold text-[#FFB800] hover:text-[#ffd240] transition-colors">
              Manage Funds
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.recentTransactions?.length ? data.recentTransactions : []).length === 0 ? (
              <div className="text-center py-10">
                <CreditCard className="w-11 h-11 text-white/[0.06] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">No transactions yet</p>
              </div>
            ) : (
              (data?.recentTransactions || []).map((tx: any) => (
                <div key={tx.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'deposit' ? 'icon-squircle-green' : 'icon-squircle-gold'}`}>
                      {tx.type === 'deposit'
                        ? <ArrowDownRight className="w-4 h-4 text-[#02C076]" />
                        : <ArrowUpRight className="w-4 h-4 text-[#FFB800]" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-sm capitalize">{tx.type}</p>
                      <p className="text-[11px] text-[#4B5563] font-medium">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-terminal font-bold text-[#F8FAFC] tabular-nums">₹{tx.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-1 ${
                      tx.status === 'approved' ? 'bg-[#02C076]/15 text-[#02C076] border border-[#02C076]/25' :
                      tx.status === 'pending'  ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/25' :
                      'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
