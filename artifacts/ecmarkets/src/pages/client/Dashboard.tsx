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
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-t-4 border-primary rounded-full animate-spin"></div>
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
    { name: 'Quantum Core', value: 60, color: '#2a6df4' },
    { name: 'Gold Scalper', value: 30, color: '#60a5fa' },
    { name: 'Index Momentum', value: 10, color: '#93c5fd' },
  ];

  const totalBalance = data?.totalBalance || 121200;
  const totalProfit = data?.totalProfit || 21200;
  const profitPercent = ((totalProfit / (totalBalance - totalProfit)) * 100).toFixed(2);

  return (
    <DashboardLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Portfolio Overview</h1>
          <p className="text-gray-500 font-medium">Real-time metrics and algorithmic performance</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Link href="/dashboard/deposit" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl btn-primary font-bold flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Deposit
          </Link>
          <Link href="/dashboard/withdraw" className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Upload className="w-4 h-4" /> Withdraw
          </Link>
        </div>
      </div>

      {/* Main Balance Hero Card */}
      <div className="bg-white rounded-3xl p-8 mb-8 relative overflow-hidden border border-gray-200 shadow-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="text-gray-500 uppercase tracking-wider font-semibold text-sm mb-2">Total Account Value</p>
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4 tracking-tight">
              ${totalBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}
            </h2>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-green-100 text-green-700 font-bold flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> +{profitPercent}%
              </div>
              <span className="text-gray-500 text-sm font-medium">All-time profit: <strong className="text-green-600">+${totalProfit.toLocaleString()}</strong></span>
            </div>
          </div>
          
          <div className="w-full md:w-1/3 bg-gray-50 rounded-2xl p-5 border border-gray-100 shadow-inner">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm font-medium">Status</span>
              <span className="text-green-600 text-sm font-bold flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Active</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-600 text-sm font-medium">Server Latency</span>
              <span className="text-gray-900 text-sm font-bold">2.4 ms</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 text-sm font-medium">Open Positions</span>
              <span className="text-gray-900 text-sm font-bold">14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Net Deposits</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            ${((data?.totalDeposits || 100000) - (data?.totalWithdrawals || 0)).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Daily P&L</h3>
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">
            +$420.50
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Win Rate</h3>
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-primary">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">72.4%</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wider">Active Algos</h3>
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data?.activeStrategies || 3}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Equity Curve</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a6df4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2a6df4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#2a6df4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Strategy Allocation</h3>
          <p className="text-sm text-gray-500 mb-6">Capital distribution across algos</p>
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
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '14px', color: '#4b5563', fontWeight: '500' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Live Execution Feed</h3>
            <Link href="/dashboard/analytics" className="text-sm font-semibold text-primary hover:underline">View All</Link>
          </div>
          
          <div className="space-y-3">
            {/* Mock recent trades if api is empty */}
            {(data?.recentTrades?.length ? data.recentTrades : [
              { id: 1, instrument: "EUR/USD", direction: "buy", lotSize: 1.5, profit: 124.50, status: "closed", time: "2 mins ago" },
              { id: 2, instrument: "XAU/USD", direction: "sell", lotSize: 0.5, profit: 340.00, status: "closed", time: "15 mins ago" },
              { id: 3, instrument: "GBP/USD", direction: "buy", lotSize: 2.0, profit: -45.00, status: "closed", time: "1 hour ago" },
              { id: 4, instrument: "US30", direction: "buy", lotSize: 1.0, profit: 0, status: "open", time: "Active now" },
            ]).map((trade: any) => (
              <div key={trade.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${trade.direction === 'buy' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {trade.direction === 'buy' ? 'B' : 'S'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{trade.instrument}</p>
                    <p className="text-xs text-gray-500 font-medium capitalize">{trade.direction} • {trade.lotSize} Lots • {trade.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  {trade.status === 'open' ? (
                    <span className="px-2.5 py-1 rounded-md bg-yellow-100 text-yellow-700 text-xs font-bold uppercase tracking-wider">Open</span>
                  ) : (
                    <p className={`font-bold text-lg ${trade.profit > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {trade.profit > 0 ? '+' : ''}${Math.abs(trade.profit).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
            <Link href="/dashboard/deposit" className="text-sm font-semibold text-primary hover:underline">Manage Funds</Link>
          </div>
          
          <div className="space-y-3">
            {(data?.recentTransactions?.length ? data.recentTransactions : [
              { id: 1, type: "deposit", amount: 50000, status: "approved", createdAt: new Date().toISOString() },
              { id: 2, type: "withdrawal", amount: 5000, status: "pending", createdAt: new Date(Date.now() - 86400000).toISOString() },
            ]).map((tx: any) => (
              <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${tx.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-600'}`}>
                    {tx.type === 'deposit' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize">{tx.type}</p>
                    <p className="text-xs text-gray-500 font-medium">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-lg">${tx.amount.toLocaleString()}</p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider inline-block mt-1 ${
                    tx.status === 'approved' ? 'bg-green-100 text-green-700' :
                    tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
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
