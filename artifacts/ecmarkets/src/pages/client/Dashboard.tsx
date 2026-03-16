import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { ArrowUpRight, ArrowDownRight, Wallet, Activity, CreditCard, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function Dashboard() {
  const { data, isLoading } = useGetDashboard({
    ...getAuthOptions()
  });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback mock data if API is empty
  const equityData = data?.equityCurve?.length ? data.equityCurve : [
    { date: 'Jan', value: 10000 },
    { date: 'Feb', value: 10500 },
    { date: 'Mar', value: 10200 },
    { date: 'Apr', value: 11800 },
    { date: 'May', value: 12400 },
    { date: 'Jun', value: 13200 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Portfolio overview and recent activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Balance</h3>
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">${data?.totalBalance?.toLocaleString() || "0.00"}</p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Total Profit</h3>
            <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-400">
            +${data?.totalProfit?.toLocaleString() || "0.00"}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Net Deposits</h3>
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            ${((data?.totalDeposits || 0) - (data?.totalWithdrawals || 0)).toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-muted-foreground font-medium">Active Strategies</h3>
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{data?.activeStrategies || 0}</p>
        </div>
      </div>

      {/* Main Chart */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h3 className="text-lg font-bold text-white mb-6">Equity Curve</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Recent Trades</h3>
          {data?.recentTrades?.length ? (
            <div className="space-y-4">
              {data.recentTrades.map((trade) => (
                <div key={trade.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium text-white">{trade.instrument}</p>
                    <p className="text-xs text-muted-foreground capitalize">{trade.direction} • {trade.lotSize} Lots</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${trade.profit && trade.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trade.profit && trade.profit > 0 ? '+' : ''}{trade.profit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent trades
            </div>
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold text-white mb-6">Recent Transactions</h3>
          {data?.recentTransactions?.length ? (
            <div className="space-y-4">
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${tx.type === 'deposit' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                      {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-medium text-white capitalize">{tx.type}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">${tx.amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
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
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent transactions
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
