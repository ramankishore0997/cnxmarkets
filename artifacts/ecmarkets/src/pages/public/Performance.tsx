import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import { Download } from 'lucide-react';

export function Performance() {
  const equityData = [
    { date: 'Jan 2023', value: 100000 },
    { date: 'Feb 2023', value: 104500 },
    { date: 'Mar 2023', value: 108200 },
    { date: 'Apr 2023', value: 106100 },
    { date: 'May 2023', value: 112400 },
    { date: 'Jun 2023', value: 118900 },
    { date: 'Jul 2023', value: 124500 },
    { date: 'Aug 2023', value: 129800 },
    { date: 'Sep 2023', value: 127200 },
    { date: 'Oct 2023', value: 135400 },
    { date: 'Nov 2023', value: 142100 },
    { date: 'Dec 2023', value: 148500 },
    { date: 'Jan 2024', value: 154200 },
    { date: 'Feb 2024', value: 161800 },
    { date: 'Mar 2024', value: 171400 },
  ];

  const monthlyReturns = [
    { month: 'Jan', return: 4.5 },
    { month: 'Feb', return: 3.2 },
    { month: 'Mar', return: 5.1 },
    { month: 'Apr', return: -1.8 },
    { month: 'May', return: 6.2 },
    { month: 'Jun', return: 4.8 },
    { month: 'Jul', return: 5.4 },
    { month: 'Aug', return: -2.1 },
    { month: 'Sep', return: 3.9 },
    { month: 'Oct', return: 4.2 },
    { month: 'Nov', return: 5.8 },
    { month: 'Dec', return: 6.1 },
  ];

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
          >
            Verified <span className="text-primary">Performance</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Consistent, risk-adjusted returns driven by quantitative models. Real results from live accounts.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Return (15mo)", value: "+71.4%", color: "text-green-600" },
            { label: "Win Rate", value: "68.2%", color: "text-primary" },
            { label: "Max Drawdown", value: "8.3%", color: "text-red-500" },
            { label: "Sharpe Ratio", value: "1.87", color: "text-gray-900" },
          ].map((stat, i) => (
            <div key={i} className="card-light p-6 text-center">
              <p className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Equity Curve */}
        <div className="card-light p-6 md:p-8 mb-12 border-t-4 border-t-primary">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">Composite Equity Curve (Initial $100k)</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-primary hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors border border-blue-100">
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2a6df4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2a6df4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val/1000)}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
                />
                <Area type="monotone" dataKey="value" stroke="#2a6df4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 card-light p-6 md:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Monthly Returns (2023)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} dx={-10} />
                  <Tooltip 
                    cursor={{fill: 'rgba(0,0,0,0.02)'}}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    itemStyle={{ color: '#111827', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value}%`, 'Return']}
                  />
                  <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.return > 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card-light p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Risk Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-gray-600 font-medium">Profit Factor</span>
                <span className="font-bold text-gray-900">1.62</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-gray-600 font-medium">Avg. Win Trade</span>
                <span className="font-bold text-green-600">+$425</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-gray-600 font-medium">Avg. Loss Trade</span>
                <span className="font-bold text-red-500">-$262</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-gray-600 font-medium">Max Consec. Wins</span>
                <span className="font-bold text-gray-900">14</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <span className="text-gray-600 font-medium">Max Consec. Losses</span>
                <span className="font-bold text-gray-900">4</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 font-medium">Trade Duration</span>
                <span className="font-bold text-gray-900">4.5 Hrs Avg</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Table */}
        <div className="card-light p-8 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Historical Monthly Performance (%)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-border">
                <tr>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Jan</th>
                  <th className="px-4 py-3">Feb</th>
                  <th className="px-4 py-3">Mar</th>
                  <th className="px-4 py-3">Apr</th>
                  <th className="px-4 py-3">May</th>
                  <th className="px-4 py-3">Jun</th>
                  <th className="px-4 py-3">Jul</th>
                  <th className="px-4 py-3">Aug</th>
                  <th className="px-4 py-3">Sep</th>
                  <th className="px-4 py-3">Oct</th>
                  <th className="px-4 py-3">Nov</th>
                  <th className="px-4 py-3">Dec</th>
                  <th className="px-4 py-3 text-primary font-bold">YTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-900">2024</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4.2</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4.9</td>
                  <td className="px-4 py-3 text-green-600 font-medium">5.8</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3">-</td>
                  <td className="px-4 py-3 text-primary font-bold">15.6%</td>
                </tr>
                <tr className="bg-white hover:bg-gray-50">
                  <td className="px-4 py-3 font-bold text-gray-900">2023</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4.5</td>
                  <td className="px-4 py-3 text-green-600 font-medium">3.2</td>
                  <td className="px-4 py-3 text-green-600 font-medium">5.1</td>
                  <td className="px-4 py-3 text-red-500 font-medium">-1.8</td>
                  <td className="px-4 py-3 text-green-600 font-medium">6.2</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4.8</td>
                  <td className="px-4 py-3 text-green-600 font-medium">5.4</td>
                  <td className="px-4 py-3 text-red-500 font-medium">-2.1</td>
                  <td className="px-4 py-3 text-green-600 font-medium">3.9</td>
                  <td className="px-4 py-3 text-green-600 font-medium">4.2</td>
                  <td className="px-4 py-3 text-green-600 font-medium">5.8</td>
                  <td className="px-4 py-3 text-green-600 font-medium">6.1</td>
                  <td className="px-4 py-3 text-primary font-bold">56.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-gray-500 p-6 rounded-xl bg-gray-50 border border-border">
          <strong>Disclaimer:</strong> Past performance is not indicative of future results. The performance data presented represents the composite returns of our master algorithms. Individual account returns may vary due to timing of deposits, slippage, and broker spreads.
        </div>
      </div>
    </PublicLayout>
  );
}
