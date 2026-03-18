import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
  CreditCard, TrendingUp, Download, Upload,
  BarChart2, Bot, Zap, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'wouter';
import { LivePriceTicker } from '@/components/shared/LivePriceTicker';

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
  const dailyTarget   = (data as any)?.dailyGrowthTarget ?? 4.0;
  const dailyTargetAmt = totalBalance > 0 ? totalBalance * (dailyTarget / 100) : 0;
  const monthlyReturn  = dailyTarget * 30;

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
            <div className="absolute inset-0 border-t-4 border-[#00C274] rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const equityData    = data?.equityCurve?.length ? data.equityCurve : [];
  const profitPercent = totalBalance > 0 && totalProfit !== 0
    ? (((totalBalance) / (totalBalance - totalProfit) - 1) * 100).toFixed(2)
    : '0.00';
  const progressPct   = dailyTargetAmt > 0 ? Math.min((liveProfit / dailyTargetAmt) * 100, 100) : 0;
  const dailyGainPct  = totalBalance > 0 ? (liveProfit / totalBalance) * 100 : 0;

  return (
    <DashboardLayout>

      {/* ── Live ticker ─── */}
      <div className="mb-5">
        <LivePriceTicker />
      </div>

      {/* ── Main Balance Hero (Olymp Trade style) ─── */}
      <div className="relative rounded-2xl overflow-hidden mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(0,194,116,0.08) 0%, rgba(15,23,42,0.9) 50%, rgba(0,0,0,0.7) 100%)',
          border: '1px solid rgba(0,194,116,0.2)',
          boxShadow: '0 0 40px rgba(0,194,116,0.06), 0 20px 40px rgba(0,0,0,0.5)',
        }}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,194,116,0.09) 0%, transparent 70%)' }} />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            {/* Balance Display */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="live-dot w-2 h-2 rounded-full bg-[#00C274] inline-block" />
                <p className="text-[11px] text-[#00C274] font-bold uppercase tracking-[0.16em]">Live Balance</p>
              </div>
              <h2 className="font-terminal text-4xl md:text-5xl font-bold mb-3 tracking-tight tabular-nums leading-none text-white"
                style={{ textShadow: '0 0 30px rgba(0,194,116,0.2)' }}>
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 text-sm ${
                  parseFloat(profitPercent) >= 0
                    ? 'bg-[#00C274]/12 border border-[#00C274]/30 text-[#00C274]'
                    : 'bg-[#CF304A]/12 border border-[#CF304A]/30 text-[#CF304A]'
                }`}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {parseFloat(profitPercent) >= 0 ? '+' : ''}{profitPercent}% All-time
                </div>
                <span className="text-[#4B5563] text-sm font-medium">
                  P&L:&nbsp;
                  <strong className={`font-terminal ${totalProfit >= 0 ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                    {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
                  </strong>
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <Link href="/dashboard/deposit"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{
                  background: 'linear-gradient(135deg, #00C274 0%, #00A85E 100%)',
                  color: '#000',
                  boxShadow: '0 4px 20px rgba(0,194,116,0.35)',
                }}>
                <Download className="w-4 h-4" /> Deposit
              </Link>
              <Link href="/dashboard/withdraw"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm border border-white/10 text-[#EAECEF] hover:border-white/25 hover:text-white transition-all"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Upload className="w-4 h-4" /> Withdraw
              </Link>
            </div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/[0.05]">
            <div>
              <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Net Deposits</p>
              <p className="font-terminal text-sm font-bold text-[#F8FAFC] tabular-nums">
                ₹{((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Daily Target</p>
              <p className="font-terminal text-sm font-bold text-[#00C274] tabular-nums">+{dailyTarget}%</p>
            </div>
            <div>
              <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Monthly Est.</p>
              <p className="font-terminal text-sm font-bold text-[#00C274] tabular-nums">+{monthlyReturn}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Two column row: Auto Trading + Live Profit ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        {/* Auto Trading Status */}
        <div className="card-stealth p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,194,116,0.08) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(0,194,116,0.12)', border: '1px solid rgba(0,194,116,0.25)' }}>
                  <Bot className="w-5 h-5 text-[#00C274]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#F8FAFC]">Auto Trading</p>
                  <p className="text-[11px] text-[#4B5563]">Algorithm is running</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.25)' }}>
                <span className="live-dot w-1.5 h-1.5 rounded-full bg-[#00C274] inline-block" />
                <span className="text-[10px] font-bold text-[#00C274] uppercase tracking-wide">Active</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-1 font-semibold">Daily Rate</p>
                <p className="font-terminal text-lg font-bold text-[#00C274]">+{dailyTarget}%</p>
              </div>
              <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[10px] text-[#4B5563] uppercase tracking-wider mb-1 font-semibold">Trades Today</p>
                <p className="font-terminal text-lg font-bold text-[#F8FAFC]">
                  {data?.recentTrades?.length ?? 0}
                </p>
              </div>
            </div>
            <Link href="/dashboard/binary"
              className="flex items-center justify-center gap-2 mt-4 w-full py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)', color: '#00C274' }}>
              <Zap className="w-4 h-4" /> Open Binary Trading
            </Link>
          </div>
        </div>

        {/* Live Profit Today */}
        <div className="card-stealth p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(0,194,116,0.07) 0%, transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="live-dot w-2 h-2 rounded-full bg-[#00C274] inline-block" />
              <p className="text-[11px] font-bold text-[#00C274] uppercase tracking-[0.14em]">Live Profit Today</p>
            </div>
            <p className="font-terminal text-glow-green-breathe text-3xl font-black tabular-nums leading-none mb-2">
              +₹{liveProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-[#4B5563] mb-4 font-medium">
              Target:&nbsp;
              <span className="font-terminal text-[#F8FAFC] font-bold">
                ₹{dailyTargetAmt.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </p>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#4B5563]">Daily Progress</span>
                <span className="font-terminal text-[#00C274]">{progressPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 bg-white/[0.05] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${progressPct}%`,
                    background: 'linear-gradient(90deg, #00C274 0%, #00FF9D 100%)',
                    boxShadow: '0 0 8px rgba(0,194,116,0.5)',
                  }} />
              </div>
              <p className="text-[11px] text-[#4B5563] font-medium">
                {dailyGainPct >= 0 ? '+' : ''}{dailyGainPct.toFixed(2)}% gained today
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Tiles ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        <Link href="/dashboard/deposit" className="group card-stealth p-5 hover:border-[#00C274]/30 transition-all">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-all"
            style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)' }}>
            <Download className="w-4 h-4 text-[#00C274]" />
          </div>
          <p className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Total Deposits</p>
          <p className="font-terminal text-base font-bold text-[#F8FAFC] tabular-nums">
            ₹{(data?.totalDeposits || 0).toLocaleString('en-IN')}
          </p>
        </Link>

        <Link href="/dashboard/trades" className="group card-stealth p-5 hover:border-[#00C274]/30 transition-all">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)' }}>
            <Activity className="w-4 h-4 text-[#00C274]" />
          </div>
          <p className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Total Profit</p>
          <p className={`font-terminal text-base font-bold tabular-nums ${totalProfit >= 0 ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
            {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
          </p>
        </Link>

        <Link href="/dashboard/analytics" className="group card-stealth p-5 hover:border-[#00C274]/30 transition-all">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)' }}>
            <BarChart2 className="w-4 h-4 text-[#00C274]" />
          </div>
          <p className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Closed Trades</p>
          <p className="font-terminal text-base font-bold text-[#F8FAFC] tabular-nums">
            {data?.recentTrades?.filter((t: any) => t.status === 'closed').length ?? 0}
          </p>
        </Link>

        <Link href="/dashboard/kyc" className="group card-stealth p-5 hover:border-[#00C274]/30 transition-all">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
            style={{ background: 'rgba(0,194,116,0.1)', border: '1px solid rgba(0,194,116,0.2)' }}>
            <ShieldCheck className="w-4 h-4 text-[#00C274]" />
          </div>
          <p className="text-xs text-[#4B5563] font-semibold uppercase tracking-wider mb-1">Account</p>
          <p className="text-base font-bold text-[#F8FAFC] capitalize">
            {(data as any)?.kycStatus === 'approved' ? 'Verified' : 'Pending'}
          </p>
        </Link>
      </div>

      {/* ── Equity Curve ─── */}
      <div className="card-stealth p-6 mb-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#F8FAFC]">Equity Curve</h3>
            {equityData.length === 0 && (
              <p className="text-xs text-[#4B5563] mt-0.5">Appears after your first closed trade</p>
            )}
          </div>
          <BarChart2 className="w-[18px] h-[18px] text-[#374151]" />
        </div>
        {equityData.length > 0 ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00C274" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#00C274" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,194,116,0.2)', borderRadius: '10px', color: '#F8FAFC', fontSize: 12 }}
                  itemStyle={{ color: '#00C274', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                  labelStyle={{ color: '#6B7280', fontSize: 11 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Equity']}
                />
                <Area type="monotone" dataKey="value" stroke="#00C274" strokeWidth={2}
                  fillOpacity={1} fill="url(#equityFill)" dot={false}
                  activeDot={{ r: 4, fill: '#00C274', stroke: 'rgba(15,23,42,0.9)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 text-white/[0.05] mx-auto mb-3" />
              <p className="text-[#4B5563] font-medium text-sm">No equity data yet</p>
              <p className="text-xs text-[#374151] mt-1">Deposit funds to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Activity Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-10">

        {/* Recent Trades */}
        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-[#F8FAFC]">Recent Trades</h3>
            <Link href="/dashboard/trades" className="text-xs font-semibold text-[#00C274] hover:text-[#33d494] transition-colors">
              View All →
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.recentTrades?.length ? data.recentTrades : []).length === 0 ? (
              <div className="text-center py-10">
                <Activity className="w-10 h-10 text-white/[0.05] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">No trades yet</p>
                <Link href="/dashboard/binary" className="text-xs text-[#00C274] font-semibold mt-2 inline-block hover:text-[#33d494] transition-colors">
                  Start Binary Trading →
                </Link>
              </div>
            ) : (
              (data?.recentTrades || []).slice(0, 5).map((trade: any) => (
                <div key={trade.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                      trade.direction === 'buy'
                        ? 'bg-[#00C274]/15 text-[#00C274] border border-[#00C274]/25'
                        : 'bg-[#CF304A]/15 text-[#CF304A] border border-[#CF304A]/25'
                    }`}>
                      {trade.direction === 'buy' ? '▲' : '▼'}
                    </div>
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-sm">{trade.instrument}</p>
                      <p className="text-[10px] text-[#4B5563] font-medium capitalize">{trade.direction} · {trade.lotSize} lots</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.status === 'open' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border"
                        style={{ background: 'rgba(0,194,116,0.1)', color: '#00C274', borderColor: 'rgba(0,194,116,0.25)' }}>
                        Open
                      </span>
                    ) : (
                      <p className={`font-terminal font-bold text-sm tabular-nums ${(trade.profit || 0) >= 0 ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}₹{Math.abs(trade.profit || 0).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-base font-bold text-[#F8FAFC]">Recent Transactions</h3>
            <Link href="/dashboard/deposit" className="text-xs font-semibold text-[#00C274] hover:text-[#33d494] transition-colors">
              Manage →
            </Link>
          </div>
          <div className="space-y-2">
            {(data?.recentTransactions?.length ? data.recentTransactions : []).length === 0 ? (
              <div className="text-center py-10">
                <CreditCard className="w-10 h-10 text-white/[0.05] mx-auto mb-3" />
                <p className="text-[#4B5563] text-sm">No transactions yet</p>
                <Link href="/dashboard/deposit" className="text-xs text-[#00C274] font-semibold mt-2 inline-block hover:text-[#33d494] transition-colors">
                  Make a Deposit →
                </Link>
              </div>
            ) : (
              (data?.recentTransactions || []).slice(0, 5).map((tx: any) => (
                <div key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      tx.type === 'deposit'
                        ? 'bg-[#00C274]/12 border border-[#00C274]/20'
                        : 'bg-[#CF304A]/12 border border-[#CF304A]/20'
                    }`}>
                      {tx.type === 'deposit'
                        ? <ArrowDownRight className="w-4 h-4 text-[#00C274]" />
                        : <ArrowUpRight className="w-4 h-4 text-[#CF304A]" />}
                    </div>
                    <div>
                      <p className="font-bold text-[#F8FAFC] text-sm capitalize">{tx.type}</p>
                      <p className="text-[10px] text-[#4B5563] font-medium">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-terminal font-bold text-[#F8FAFC] tabular-nums text-sm">
                      ₹{tx.amount.toLocaleString('en-IN')}
                    </p>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider inline-block mt-1 ${
                      tx.status === 'approved' ? 'bg-[#00C274]/12 text-[#00C274] border border-[#00C274]/25' :
                      tx.status === 'pending'  ? 'bg-[#00C274]/12 text-[#00C274] border border-[#00C274]/25' :
                      'bg-[#CF304A]/12 text-[#CF304A] border border-[#CF304A]/25'
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
