import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Cell } from 'recharts';
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
      <div className="pt-24 pb-16 section-dark border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-white mb-6"
          >
            Verified <span className="text-gradient-gold">Performance</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-[#848E9C] max-w-3xl mx-auto"
          >
            Consistent, risk-adjusted returns driven by quantitative models. Real results from live accounts.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Return (15mo)", value: "+71.4%", color: "text-[#02C076]" },
            { label: "Win Rate", value: "68.2%", color: "text-[#F0B90B]" },
            { label: "Max Drawdown", value: "8.3%", color: "text-[#CF304A]" },
            { label: "Sharpe Ratio", value: "1.87", color: "text-white" },
          ].map((stat, i) => (
            <div key={i} className="card-stealth p-6 text-center">
              <p className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-[#848E9C] font-semibold uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Equity Curve */}
        <div className="card-stealth p-6 md:p-8 mb-12 border-t-4 border-t-[#F0B90B]">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-white">Composite Equity Curve (Initial ₹10L)</h3>
            <button className="flex items-center gap-2 text-sm font-medium text-[#F0B90B] hover:bg-[#F0B90B]/10 px-4 py-2 rounded-lg transition-colors border border-[#F0B90B]/30">
              <Download className="w-4 h-4" /> Download Report
            </button>
          </div>
          <div className="h-[450px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F0B90B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#F0B90B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                <XAxis dataKey="date" stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val/1000)}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E2329', borderColor: '#2B3139', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#F0B90B', fontWeight: 'bold' }}
                  formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Equity']}
                />
                <Area type="monotone" dataKey="value" stroke="#F0B90B" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-10">
          <div className="lg:col-span-2 card-stealth p-6 md:p-8">
            <h3 className="text-2xl font-bold text-white mb-8">Monthly Returns (2023)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2B3139" vertical={false} />
                  <XAxis dataKey="month" stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#848E9C" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} dx={-10} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#1E2329', borderColor: '#2B3139', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#F0B90B', fontWeight: 'bold' }}
                    formatter={(value: number) => [`${value}%`, 'Return']}
                  />
                  <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.return > 0 ? '#02C076' : '#CF304A'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card-stealth p-6">
            <h3 className="text-xl font-bold text-white mb-6">Risk Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-[#2B3139]">
                <span className="text-[#848E9C] font-medium">Profit Factor</span>
                <span className="font-bold text-white">1.62</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#2B3139]">
                <span className="text-[#848E9C] font-medium">Avg. Win Trade</span>
                <span className="font-bold text-[#02C076]">+₹425</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#2B3139]">
                <span className="text-[#848E9C] font-medium">Avg. Loss Trade</span>
                <span className="font-bold text-[#CF304A]">-₹262</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#2B3139]">
                <span className="text-[#848E9C] font-medium">Max Consec. Wins</span>
                <span className="font-bold text-white">14</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#2B3139]">
                <span className="text-[#848E9C] font-medium">Max Consec. Losses</span>
                <span className="font-bold text-white">4</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-[#848E9C] font-medium">Trade Duration</span>
                <span className="font-bold text-white">4.5 Hrs Avg</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Performance Table */}
        <div className="card-stealth p-8 overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6">Historical Monthly Performance (%)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#2B3139] text-[#EAECEF] font-semibold">
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
                  <th className="px-4 py-3 text-[#F0B90B] font-bold">YTD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B3139] bg-[#1E2329]">
                <tr className="hover:bg-[#2B3139]/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">2024</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">4.2</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">4.9</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">5.8</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#848E9C]">-</td>
                  <td className="px-4 py-3 text-[#F0B90B] font-bold">15.6%</td>
                </tr>
                <tr className="hover:bg-[#2B3139]/50 transition-colors">
                  <td className="px-4 py-3 font-bold text-white">2023</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">4.5</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">3.2</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">5.1</td>
                  <td className="px-4 py-3 text-[#CF304A] font-medium">-1.8</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">6.2</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">4.8</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">5.4</td>
                  <td className="px-4 py-3 text-[#CF304A] font-medium">-2.1</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">3.9</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">4.2</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">5.8</td>
                  <td className="px-4 py-3 text-[#02C076] font-medium">6.1</td>
                  <td className="px-4 py-3 text-[#F0B90B] font-bold">56.2%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-[#848E9C] p-6 rounded-xl bg-[#0B0E11] border border-[#2B3139]">
          <strong className="text-white">Disclaimer:</strong> Past performance is not indicative of future results. The performance data presented represents the composite returns of our master algorithms. Individual account returns may vary due to timing of deposits, slippage, and broker spreads.
        </div>
      </div>
    </PublicLayout>
  );
}