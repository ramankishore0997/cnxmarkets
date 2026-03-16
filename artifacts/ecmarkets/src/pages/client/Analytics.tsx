import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard, useGetPerformance, useGetTrades } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { Loader2, TrendingUp, TrendingDown, BarChart3, Target, Zap, Award } from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell
} from 'recharts';

const mockEquity = [
  { date: 'Jan', value: 100000 }, { date: 'Feb', value: 106200 },
  { date: 'Mar', value: 103800 }, { date: 'Apr', value: 112500 },
  { date: 'May', value: 118900 }, { date: 'Jun', value: 115400 },
  { date: 'Jul', value: 124700 }, { date: 'Aug', value: 131200 },
  { date: 'Sep', value: 128600 }, { date: 'Oct', value: 138900 },
  { date: 'Nov', value: 144300 }, { date: 'Dec', value: 152800 },
];

const mockMonthly = [
  { month: 'Jan', return: 6.2 }, { month: 'Feb', return: -2.3 },
  { month: 'Mar', return: 8.4 }, { month: 'Apr', return: 5.7 },
  { month: 'May', return: -1.2 }, { month: 'Jun', return: 8.1 },
  { month: 'Jul', return: 5.2 }, { month: 'Aug', return: -0.8 },
  { month: 'Sep', return: 7.9 }, { month: 'Oct', return: 3.8 },
  { month: 'Nov', return: 4.4 }, { month: 'Dec', return: -1.1 },
];

const strategyPerf = [
  { name: 'Quantum Core', winRate: 74.2, trades: 312, pnl: '+$28,450', risk: 'Medium', status: 'Active' },
  { name: 'Gold Scalper', winRate: 68.5, trades: 198, pnl: '+$14,320', risk: 'High', status: 'Active' },
  { name: 'Index Momentum', winRate: 61.8, trades: 87, pnl: '+$7,890', risk: 'Low', status: 'Active' },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[#1E2329] border border-[#2B3139] rounded-xl px-4 py-3 shadow-xl">
        <p className="text-[#848E9C] text-xs font-medium mb-1">{label}</p>
        <p className="text-white font-bold">
          {typeof payload[0].value === 'number' && payload[0].value > 1000
            ? `$${payload[0].value.toLocaleString()}`
            : `${payload[0].value > 0 ? '+' : ''}${payload[0].value}%`}
        </p>
      </div>
    );
  }
  return null;
};

export function Analytics() {
  const { data: dashboard, isLoading } = useGetDashboard({ ...getAuthOptions() });

  const equityData = dashboard?.equityCurve?.length ? dashboard.equityCurve : mockEquity;
  const totalReturn = ((152800 - 100000) / 100000 * 100).toFixed(1);

  const stats = [
    { label: 'Total Return', value: `+${totalReturn}%`, icon: TrendingUp, color: '#02C076', bg: '#02C076' },
    { label: 'Sharpe Ratio', value: '2.14', icon: BarChart3, color: '#F0B90B', bg: '#F0B90B' },
    { label: 'Max Drawdown', value: '-8.2%', icon: TrendingDown, color: '#CF304A', bg: '#CF304A' },
    { label: 'Win Rate', value: '72.4%', icon: Target, color: '#F0B90B', bg: '#F0B90B' },
    { label: 'Profit Factor', value: '2.87', icon: Zap, color: '#02C076', bg: '#02C076' },
    { label: 'Total Trades', value: '597', icon: Award, color: '#2a6df4', bg: '#2a6df4' },
  ];

  if (isLoading) return (
    <DashboardLayout>
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-[#2B3139] rounded-full"></div>
          <div className="absolute inset-0 border-t-4 border-[#F0B90B] rounded-full animate-spin"></div>
        </div>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Performance Analytics</h1>
        <p className="text-[#848E9C] font-medium">Deep-dive into your strategy performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card-stealth p-5">
            <div className="w-9 h-9 rounded-lg mb-3 flex items-center justify-center" style={{ background: `${s.bg}20`, border: `1px solid ${s.bg}40` }}>
              <s.icon className="w-4 h-4" style={{ color: s.color }} />
            </div>
            <p className="text-[#848E9C] text-xs font-semibold uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-xl font-bold text-white" style={{ color: s.label === 'Max Drawdown' ? '#CF304A' : s.label === 'Total Return' || s.label === 'Profit Factor' ? '#02C076' : 'white' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Equity Curve */}
      <div className="card-stealth p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Equity Curve</h3>
            <p className="text-[#848E9C] text-sm mt-1">12-month portfolio growth trajectory</p>
          </div>
          <div className="flex gap-2">
            {['1M','3M','6M','1Y'].map((t) => (
              <button key={t} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${t === '1Y' ? 'bg-[#F0B90B] text-black' : 'bg-[#2B3139] text-[#848E9C] hover:text-white'}`}>{t}</button>
            ))}
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={equityData}>
              <defs>
                <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
              <XAxis dataKey="date" stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="value" stroke="#F0B90B" strokeWidth={3} fill="url(#equityGrad)" dot={false} activeDot={{ r: 6, fill: '#F0B90B', stroke: '#1E2329', strokeWidth: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Returns */}
      <div className="card-stealth p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">Monthly Returns</h3>
          <p className="text-[#848E9C] text-sm mt-1">Month-by-month performance breakdown</p>
        </div>
        <div className="h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockMonthly} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
              <XAxis dataKey="month" stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#2B3139" strokeWidth={2} />
              <Bar dataKey="return" radius={[6, 6, 0, 0]}>
                {mockMonthly.map((entry, i) => (
                  <Cell key={i} fill={entry.return >= 0 ? '#02C076' : '#CF304A'} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-4 pt-4 border-t border-[#2B3139]">
          <div className="text-center">
            <p className="text-[#848E9C] text-xs font-semibold mb-1">Best Month</p>
            <p className="text-[#02C076] font-bold">+8.4% (Mar)</p>
          </div>
          <div className="text-center">
            <p className="text-[#848E9C] text-xs font-semibold mb-1">Worst Month</p>
            <p className="text-[#CF304A] font-bold">-2.3% (Feb)</p>
          </div>
          <div className="text-center">
            <p className="text-[#848E9C] text-xs font-semibold mb-1">Positive Months</p>
            <p className="text-white font-bold">9 / 12</p>
          </div>
          <div className="text-center">
            <p className="text-[#848E9C] text-xs font-semibold mb-1">Avg Monthly</p>
            <p className="text-[#02C076] font-bold">+3.8%</p>
          </div>
        </div>
      </div>

      {/* Strategy Breakdown Table */}
      <div className="card-stealth p-6 pb-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white">Strategy Performance Breakdown</h3>
          <p className="text-[#848E9C] text-sm mt-1">Individual strategy metrics and contribution</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2B3139]">
                {['Strategy', 'Win Rate', 'Total Trades', 'Net P&L', 'Risk Level', 'Status'].map((h) => (
                  <th key={h} className="pb-4 text-left text-[#848E9C] font-semibold text-xs uppercase tracking-wider pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B3139]">
              {strategyPerf.map((s, i) => (
                <tr key={i} className="group hover:bg-[#0B0E11]/40 transition-colors">
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0B90B]/20 border border-[#F0B90B]/30 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#F0B90B]" />
                      </div>
                      <span className="font-bold text-white">{s.name}</span>
                    </div>
                  </td>
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#2B3139] rounded-full h-1.5 w-20">
                        <div className="h-full bg-[#02C076] rounded-full" style={{ width: `${s.winRate}%` }}></div>
                      </div>
                      <span className="text-white font-bold">{s.winRate}%</span>
                    </div>
                  </td>
                  <td className="py-4 pr-6 text-[#EAECEF] font-medium">{s.trades}</td>
                  <td className="py-4 pr-6 text-[#02C076] font-bold">{s.pnl}</td>
                  <td className="py-4 pr-6">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                      s.risk === 'High' ? 'bg-[#CF304A]/20 text-[#CF304A]' :
                      s.risk === 'Medium' ? 'bg-[#F0B90B]/20 text-[#F0B90B]' :
                      'bg-[#02C076]/20 text-[#02C076]'
                    }`}>{s.risk}</span>
                  </td>
                  <td className="py-4">
                    <span className="flex items-center gap-1.5 text-[#02C076] font-bold text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#02C076] animate-pulse"></div> {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
