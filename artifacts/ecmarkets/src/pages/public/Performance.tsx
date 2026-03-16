import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';

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
      <div className="pt-24 pb-16 animated-bg border-b border-white/5">
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
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Consistent, risk-adjusted returns driven by quantitative models. Real results from live accounts.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Return (15mo)", value: "+71.4%", color: "text-green-400" },
            { label: "Win Rate", value: "68.2%", color: "text-white" },
            { label: "Max Drawdown", value: "8.3%", color: "text-red-400" },
            { label: "Sharpe Ratio", value: "1.87", color: "text-primary" },
          ].map((stat, i) => (
            <div key={i} className="glass-card p-6 rounded-2xl text-center">
              <p className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Equity Curve */}
        <div className="glass-card p-6 md:p-8 rounded-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
          <h3 className="text-2xl font-bold text-white mb-8">Composite Equity Curve (Initial $100k)</h3>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e90ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1e90ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${(val/1000)}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
                />
                <Area type="monotone" dataKey="value" stroke="#1e90ff" strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Returns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 glass-card p-6 md:p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-white mb-8">Monthly Returns (2023)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#8a99b3" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    contentStyle={{ backgroundColor: '#0d1527', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                    formatter={(value: number) => [`${value}%`, 'Return']}
                  />
                  <Bar dataKey="return" radius={[4, 4, 0, 0]}>
                    {monthlyReturns.map((entry, index) => (
                      <cell key={`cell-${index}`} fill={entry.return > 0 ? '#00d085' : '#ff4d6a'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-6">Risk Statistics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-muted-foreground">Profit Factor</span>
                <span className="font-bold text-white">1.62</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-muted-foreground">Avg. Win Trade</span>
                <span className="font-bold text-green-400">+$425</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-muted-foreground">Avg. Loss Trade</span>
                <span className="font-bold text-red-400">-$262</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-muted-foreground">Max Consec. Wins</span>
                <span className="font-bold text-white">14</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-muted-foreground">Max Consec. Losses</span>
                <span className="font-bold text-white">4</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-muted-foreground">Trade Duration</span>
                <span className="font-bold text-white">4.5 Hrs Avg</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground p-6 rounded-xl bg-white/5 border border-white/5">
          <strong>Disclaimer:</strong> Past performance is not indicative of future results. The performance data presented represents the composite returns of our master algorithms. Individual account returns may vary due to timing of deposits, slippage, and broker spreads.
        </div>
      </div>
    </PublicLayout>
  );
}
