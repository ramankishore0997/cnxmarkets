import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import {
  ArrowUpRight, ArrowDownRight, Wallet, Activity,
  CreditCard, TrendingUp, Download, Upload, Server, Zap,
  BarChart2, Target, ShieldCheck
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'wouter';

const RISK_COLORS: Record<string, string> = { low: '#02C076', medium: '#F0B90B', high: '#CF304A' };
const RISK_BG: Record<string, string> = { low: '#02C07620', medium: '#F0B90B20', high: '#CF304A20' };

export function Dashboard() {
  const { data, isLoading } = useGetDashboard({ ...getAuthOptions() });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-[#2B3139] rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-[#F0B90B] rounded-full animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const equityData = data?.equityCurve?.length ? data.equityCurve : [];
  const totalBalance = data?.totalBalance ?? 0;
  const totalProfit = data?.totalProfit ?? 0;
  const profitPercent = totalBalance > 0 && totalProfit !== 0
    ? (((totalBalance) / (totalBalance - totalProfit) - 1) * 100).toFixed(2)
    : '0.00';

  const strategy = (data as any)?.assignedStrategyDetails;
  const strategyName = strategy?.name || (data as any)?.assignedStrategy;
  const dailyTarget = (data as any)?.dailyGrowthTarget;

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
          <p className="text-[#848E9C] font-medium">Real-time metrics and algorithmic performance</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/dashboard/deposit" className="flex-1 md:flex-none btn-gold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/dashboard/withdraw" className="flex-1 md:flex-none btn-ghost flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Main Balance Hero Card */}
      <div className="card-stealth p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F0B90B]/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-[#848E9C] uppercase tracking-wider font-semibold text-sm mb-2">Total Account Value</p>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-lg border font-bold flex items-center gap-1 ${parseFloat(profitPercent) >= 0 ? 'bg-[#02C076]/20 border-[#02C076]/30 text-[#02C076]' : 'bg-[#CF304A]/20 border-[#CF304A]/30 text-[#CF304A]'}`}>
                <TrendingUp className="w-4 h-4" /> {parseFloat(profitPercent) >= 0 ? '+' : ''}{profitPercent}%
              </div>
              <span className="text-[#848E9C] text-sm font-medium">
                All-time P&L: <strong className={totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}>
                  {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
                </strong>
              </span>
            </div>
          </div>

          <div className="w-full md:w-1/3 bg-[#0B0E11] rounded-2xl p-5 border border-[#2B3139]">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#848E9C] text-sm font-medium">Status</span>
              <span className="text-[#02C076] text-sm font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse"></div> Active</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#848E9C] text-sm font-medium">Net Deposits</span>
              <span className="text-white text-sm font-bold">₹{((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#848E9C] text-sm font-medium">Total Trades</span>
              <span className="text-white text-sm font-bold">{(data?.recentTrades?.length ?? 0) > 0 ? '—' : '0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Strategy Card (shown when strategy is assigned) */}
      {strategyName ? (
        <div className="card-stealth-gold p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#F0B90B]/10 rounded-full blur-[40px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#F0B90B]/20 border border-[#F0B90B]/40 flex items-center justify-center shrink-0">
              <Zap className="w-7 h-7 text-[#F0B90B]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-1">
                <p className="text-xs font-semibold text-[#F0B90B] uppercase tracking-wider">Active Strategy</p>
                {strategy?.riskProfile && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded capitalize" style={{ background: RISK_BG[strategy.riskProfile], color: RISK_COLORS[strategy.riskProfile] }}>
                    {strategy.riskProfile} Risk
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{strategyName}</h3>
              {strategy?.description && <p className="text-sm text-[#848E9C] truncate max-w-xl">{strategy.description}</p>}
            </div>

            <div className="flex flex-wrap gap-5 shrink-0">
              {strategy?.monthlyReturn != null && (
                <div className="text-center">
                  <p className="text-xl font-bold text-[#02C076]">+{strategy.monthlyReturn}%</p>
                  <p className="text-xs text-[#848E9C] font-medium">Monthly Return</p>
                </div>
              )}
              {strategy?.winRate != null && (
                <div className="text-center">
                  <p className="text-xl font-bold text-white">{strategy.winRate}%</p>
                  <p className="text-xs text-[#848E9C] font-medium">Win Rate</p>
                </div>
              )}
              {strategy?.maxDrawdown != null && (
                <div className="text-center">
                  <p className="text-xl font-bold text-[#CF304A]">{strategy.maxDrawdown}%</p>
                  <p className="text-xs text-[#848E9C] font-medium">Max Drawdown</p>
                </div>
              )}
              {dailyTarget != null && (
                <div className="text-center">
                  <p className="text-xl font-bold text-[#F0B90B]">{dailyTarget}%</p>
                  <p className="text-xs text-[#848E9C] font-medium">Daily Target</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="card-stealth p-5 mb-8 flex items-center gap-4 border-dashed">
          <div className="w-10 h-10 rounded-xl bg-[#2B3139] flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-[#848E9C]" />
          </div>
          <div>
            <p className="font-semibold text-[#EAECEF]">No Strategy Assigned</p>
            <p className="text-xs text-[#848E9C]">Contact your account manager to activate an algorithmic strategy.</p>
          </div>
          <Link href="/dashboard/kyc" className="ml-auto text-xs font-bold text-[#F0B90B] hover:underline shrink-0">Complete KYC →</Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card-stealth p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#848E9C] font-semibold text-sm uppercase tracking-wider">Net Deposits</h3>
            <div className="w-10 h-10 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center text-[#F0B90B]">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            ₹{((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="card-stealth p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#848E9C] font-semibold text-sm uppercase tracking-wider">Total Profit</h3>
            <div className={`w-10 h-10 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center ${totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
            {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
          </p>
        </div>

        <div className="card-stealth p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#848E9C] font-semibold text-sm uppercase tracking-wider">Strategy</h3>
            <div className="w-10 h-10 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center text-[#F0B90B]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg font-bold text-white truncate">{strategyName || '—'}</p>
        </div>

        <div className="card-stealth p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[#848E9C] font-semibold text-sm uppercase tracking-wider">Daily Target</h3>
            <div className="w-10 h-10 rounded-lg bg-[#1E2329] border border-[#2B3139] flex items-center justify-center text-[#F0B90B]">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{dailyTarget != null ? `${dailyTarget}%` : '—'}</p>
        </div>
      </div>

      {/* Equity Curve */}
      <div className="card-stealth p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Equity Curve</h3>
            {equityData.length === 0 && <p className="text-xs text-[#848E9C] mt-1">Equity curve will appear after your first trade.</p>}
          </div>
          <BarChart2 className="w-5 h-5 text-[#848E9C]" />
        </div>
        {equityData.length > 0 ? (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                <XAxis dataKey="date" stroke="#848E9C" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#848E9C" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#1E2329', borderColor: '#2B3139', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#F0B90B', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="value" stroke="#F0B90B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[280px] flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-16 h-16 text-[#2B3139] mx-auto mb-4" />
              <p className="text-[#848E9C] font-medium">No equity data yet</p>
              <p className="text-xs text-[#2B3139] mt-1">Deposit funds and start trading to see your performance curve</p>
            </div>
          </div>
        )}
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Live Execution Feed</h3>
            <Link href="/dashboard/analytics" className="text-sm font-semibold text-[#F0B90B] hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {(data?.recentTrades?.length ? data.recentTrades : []).length === 0 ? (
              <div className="text-center py-10">
                <Activity className="w-12 h-12 text-[#2B3139] mx-auto mb-3" />
                <p className="text-[#848E9C] text-sm font-medium">No trades yet</p>
                <p className="text-xs text-[#2B3139] mt-1">Trades will appear here after execution</p>
              </div>
            ) : (
              (data?.recentTrades || []).map((trade: any) => (
                <div key={trade.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139] hover:border-[#F0B90B]/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${trade.direction === 'buy' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                      {trade.direction === 'buy' ? 'B' : 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-white">{trade.instrument}</p>
                      <p className="text-xs text-[#848E9C] font-medium capitalize">{trade.direction} · {trade.lotSize} lots · {trade.market}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {trade.status === 'open' ? (
                      <span className="px-2.5 py-1 rounded-md bg-[#F0B90B]/20 text-[#F0B90B] text-xs font-bold uppercase tracking-wider">Open</span>
                    ) : (
                      <p className={`font-bold text-lg ${(trade.profit || 0) >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                        {(trade.profit || 0) >= 0 ? '+' : ''}₹{Math.abs(trade.profit || 0).toLocaleString('en-IN')}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card-stealth p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-white">Recent Transactions</h3>
            <Link href="/dashboard/deposit" className="text-sm font-semibold text-[#F0B90B] hover:underline">Manage Funds</Link>
          </div>

          <div className="space-y-3">
            {(data?.recentTransactions?.length ? data.recentTransactions : []).length === 0 ? (
              <div className="text-center py-10">
                <CreditCard className="w-12 h-12 text-[#2B3139] mx-auto mb-3" />
                <p className="text-[#848E9C] text-sm font-medium">No transactions yet</p>
                <p className="text-xs text-[#2B3139] mt-1">Make your first deposit to get started</p>
              </div>
            ) : (
              (data?.recentTransactions || []).map((tx: any) => (
                <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-[#0B0E11] border border-[#2B3139]">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-lg ${tx.type === 'deposit' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#2B3139] text-[#EAECEF]'}`}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-bold text-white capitalize">{tx.type}</p>
                      <p className="text-xs text-[#848E9C] font-medium">{new Date(tx.createdAt).toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white text-lg">₹{tx.amount.toLocaleString('en-IN')}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mt-1 ${
                      tx.status === 'approved' ? 'bg-[#02C076]/20 text-[#02C076]' :
                      tx.status === 'pending' ? 'bg-[#F0B90B]/20 text-[#F0B90B]' :
                      'bg-[#CF304A]/20 text-[#CF304A]'
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
