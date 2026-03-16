import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Activity, 
  CreditCard, Clock, TrendingUp, Download, Upload, Server
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Link } from 'wouter';

export function Dashboard() {
  const { data, isLoading } = useGetDashboard({
    ...getAuthOptions()
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-r-4 border-accent rounded-full animate-spin animate-reverse"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback mock data if API is empty
  const equityData = data?.equityCurve?.length ? data.equityCurve : [
    { date: '1M', value: 100000 },
    { date: '2M', value: 104500 },
    { date: '3M', value: 102200 },
    { date: '4M', value: 108800 },
    { date: '5M', value: 114400 },
    { date: '6M', value: 121200 },
  ];

  const strategyData = [
    { name: 'Quantum Core', value: 60, color: '#1e90ff' },
    { name: 'Gold Scalper', value: 30, color: '#f5c542' },
    { name: 'Index Momentum', value: 10, color: '#00d085' },
  ];

  const totalBalance = data?.totalBalance || 121200;
  const totalProfit = data?.totalProfit || 21200;
  const profitPercent = ((totalProfit / (totalBalance - totalProfit)) * 100).toFixed(2);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio Overview</h1>
          <p className="text-muted-foreground">Real-time metrics and algorithmic performance</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/dashboard/deposit" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl btn-primary font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/dashboard/withdraw" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-colors flex items-center justify-center gap-2">
            <Upload className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Main Balance Hero Card */}
      <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden border-primary/20 glow-blue">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-muted-foreground uppercase tracking-wider font-semibold text-sm mb-2">Total Account Value</p>
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              ${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h2>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +{profitPercent}%
              </div>
              <span className="text-muted-foreground text-sm">All-time profit: <strong className="text-green-400">+${totalProfit.toLocaleString()}</strong></span>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 bg-black/40 rounded-2xl p-5 border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground text-sm">Status</span>
              <span className="text-green-400 text-sm font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Algorithms Active</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-muted-foreground text-sm">Server Latency</span>
              <span className="text-white text-sm font-bold">2.4 ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Open Positions</span>
              <span className="text-white text-sm font-bold">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Net Deposits</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            ${((data?.totalDeposits || 100000) - (data?.totalWithdrawals || 0)).toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Daily P&L</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-400">
            +$420.50
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Win Rate</h3>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">72.4%</p>
        </div>

        <div className="glass-card p-6 rounded-2xl hover:border-white/20 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Active Strategies</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">{data?.activeStrategies || 3}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Equity Curve</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1e90ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#1e90ff" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-2">Strategy Allocation</h3>
          <p className="text-sm text-muted-foreground mb-6">Capital distribution across algos</p>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={strategyData}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {strategyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Live Execution Feed</h3>
            <Link href="/dashboard/analytics" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-4">
            {/* Mock recent trades if api is empty */}
            {(data?.recentTrades?.length ? data.recentTrades : [
              { id: 1, instrument: "EUR/USD", direction: "buy", lotSize: 1.5, profit: 124.50, status: "closed", time: "2 mins ago" },
              { id: 2, instrument: "XAU/USD", direction: "sell", lotSize: 0.5, profit: 340.00, status: "closed", time: "15 mins ago" },
              { id: 3, instrument: "GBP/USD", direction: "buy", lotSize: 2.0, profit: -45.00, status: "closed", time: "1 hour ago" },
              { id: 4, instrument: "US30", direction: "buy", lotSize: 1.0, profit: 0, status: "open", time: "Active now" },
            ]).map((trade: any) => (
              <div key={trade.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${trade.direction === 'buy' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {trade.direction === 'buy' ? 'B' : 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{trade.instrument}</p>
                    <p className="text-xs text-muted-foreground capitalize">{trade.direction} • {trade.lotSize} Lots • {trade.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {trade.status === 'open' ? (
                    <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-bold uppercase">Open</span>
                  ) : (
                    <p className={`font-bold text-lg ${trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit > 0 ? '+' : ''}${Math.abs(trade.profit).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
            <Link href="/dashboard/deposit" className="text-sm text-primary hover:underline">Manage Funds</Link>
          </div>
          
          <div className="space-y-4">
            {(data?.recentTransactions?.length ? data.recentTransactions : [
              { id: 1, type: "deposit", amount: 50000, status: "approved", createdAt: new Date().toISOString() },
              { id: 2, type: "withdrawal", amount: 5000, status: "pending", createdAt: new Date(Date.now() - 86400000).toISOString() },
            ]).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${tx.type === 'deposit' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-400'}`}>
                    {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white capitalize text-lg">{tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white text-lg">${tx.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider inline-block mt-1 ${
                    tx.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
