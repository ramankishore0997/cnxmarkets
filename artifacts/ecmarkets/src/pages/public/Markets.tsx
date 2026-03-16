import { PublicLayout } from '@/components/layout/PublicLayout';
import { TradingChartWidget } from '@/components/shared/TradingWidget';
import { Globe, TrendingUp, Activity, Clock } from 'lucide-react';
import { useState } from 'react';

export function Markets() {
  const [activeTab, setActiveTab] = useState('EURUSD');

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Trade <span className="text-primary">Global Markets</span></h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our algorithms operate 24/5 across highly liquid forex pairs, precious metals, and global indices.
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="border-b border-border bg-[#f5f7fb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-primary">24/5</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Trading Hours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">50+</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Instruments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">&lt;5ms</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Execution Latency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">Tier 1</p>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Liquidity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* TRADING SESSIONS */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold text-gray-900">Global Trading Sessions</h2>
          </div>
          <p className="text-gray-600 mb-8 max-w-3xl">
            The forex market is open 24 hours a day, 5 days a week. Our algorithms are designed to exploit volatility across different geographic sessions, particularly during overlaps when liquidity is highest.
          </p>
          
          <div className="card-light p-8 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex text-xs text-gray-500 font-bold mb-2">
                {[...Array(24)].map((_, i) => <div key={i} className="flex-1 text-center">{i}:00</div>)}
              </div>
              <div className="space-y-4">
                <div className="relative h-10 bg-gray-50 rounded-lg flex items-center">
                  <div className="absolute left-[0%] w-[37.5%] h-full bg-blue-100 border border-blue-200 rounded-lg flex items-center justify-center text-sm font-bold text-blue-700">Sydney / Tokyo (Asian)</div>
                </div>
                <div className="relative h-10 bg-gray-50 rounded-lg flex items-center">
                  <div className="absolute left-[33.3%] w-[37.5%] h-full bg-green-100 border border-green-200 rounded-lg flex items-center justify-center text-sm font-bold text-green-700">London (European)</div>
                </div>
                <div className="relative h-10 bg-gray-50 rounded-lg flex items-center">
                  <div className="absolute left-[54%] w-[37.5%] h-full bg-orange-100 border border-orange-200 rounded-lg flex items-center justify-center text-sm font-bold text-orange-700">New York (American)</div>
                </div>
              </div>
              <div className="mt-6 flex justify-center gap-8">
                <span className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div> London: 8am-5pm GMT</span>
                <span className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 bg-orange-100 border border-orange-200 rounded"></div> NY: 1pm-10pm GMT</span>
                <span className="flex items-center gap-2 text-sm text-gray-600"><div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div> Tokyo: 12am-9am GMT</span>
              </div>
            </div>
          </div>
        </div>

        {/* FOREX */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-primary" />
              <h2 className="text-3xl font-bold text-gray-900">Forex Markets</h2>
            </div>
            <p className="text-gray-600 mb-6">
              Forex is the most liquid financial market in the world. Our trend-following and mean-reversion algorithms primarily target major and minor pairs due to tight spreads and deep liquidity, allowing for scale without slippage.
            </p>
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-border">
                  <tr>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Typical Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { pair: "EUR/USD", type: "Major", spread: "0.1 - 0.3 pips" },
                    { pair: "GBP/USD", type: "Major", spread: "0.4 - 0.8 pips" },
                    { pair: "USD/JPY", type: "Major", spread: "0.2 - 0.5 pips" },
                    { pair: "AUD/USD", type: "Major", spread: "0.3 - 0.6 pips" },
                    { pair: "EUR/GBP", type: "Minor", spread: "0.6 - 1.2 pips" },
                  ].map(r => (
                    <tr key={r.pair} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">{r.pair}</td>
                      <td className="px-4 py-3 text-gray-600">{r.type}</td>
                      <td className="px-4 py-3 text-gray-600">{r.spread}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-light p-2 bg-gray-50">
            <TradingChartWidget symbol="FOREXCOM:EURUSD" />
          </div>
        </div>

        {/* GOLD & INDICES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Gold (XAUUSD)</h2>
            <p className="text-gray-600 mb-6">
              Gold offers excellent volatility characteristics for breakout models. It acts as a safe haven during market stress, providing non-correlated returns to standard equity portfolios.
            </p>
            <div className="card-light p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-gray-600 font-medium">Correlation</span>
                <span className="font-bold text-gray-900">Inverse to USD</span>
              </div>
              <div className="flex justify-between items-center border-b border-border pb-2">
                <span className="text-gray-600 font-medium">Best Trading Time</span>
                <span className="font-bold text-gray-900">NY Session Open</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Volatility</span>
                <span className="font-bold text-gray-900 text-red-500">High</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Global Indices</h2>
            <p className="text-gray-600 mb-6">
              Our index algorithms trade momentum on major world markets, capturing broad economic trends without the stock-specific risk of individual equities.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="card-light p-4 text-center">
                <h4 className="font-bold text-gray-900">US30 (Dow)</h4>
                <p className="text-xs text-gray-500">US Industrials</p>
              </div>
              <div className="card-light p-4 text-center">
                <h4 className="font-bold text-gray-900">SPX500</h4>
                <p className="text-xs text-gray-500">US Broad Market</p>
              </div>
              <div className="card-light p-4 text-center">
                <h4 className="font-bold text-gray-900">GER40 (DAX)</h4>
                <p className="text-xs text-gray-500">European Economy</p>
              </div>
              <div className="card-light p-4 text-center">
                <h4 className="font-bold text-gray-900">UK100 (FTSE)</h4>
                <p className="text-xs text-gray-500">British Market</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}
