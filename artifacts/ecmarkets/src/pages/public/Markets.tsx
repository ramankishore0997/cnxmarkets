import { PublicLayout } from '@/components/layout/PublicLayout';
import { TradingChartWidget } from '@/components/shared/TradingWidget';
import { Globe, TrendingUp, Activity, Clock } from 'lucide-react';
import { useState } from 'react';

export function Markets() {
  const [activeTab, setActiveTab] = useState('EURUSD');

  return (
    <PublicLayout>
      <div className="pt-24 pb-16 bg-[#0B0E11] border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">Trade <span className="text-gradient-gold">Global Markets</span></h1>
          <p className="text-xl text-[#848E9C] max-w-2xl mx-auto">
            Our algorithms operate 24/5 across highly liquid forex pairs, precious metals, and global indices.
          </p>
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="border-b border-[#2B3139] bg-[#1E2329]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[#F0B90B]">24/5</p>
              <p className="text-sm font-semibold text-[#848E9C] uppercase tracking-wider">Trading Hours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#F0B90B]">50+</p>
              <p className="text-sm font-semibold text-[#848E9C] uppercase tracking-wider">Instruments</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#F0B90B]">&lt;5ms</p>
              <p className="text-sm font-semibold text-[#848E9C] uppercase tracking-wider">Execution Latency</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-[#F0B90B]">Tier 1</p>
              <p className="text-sm font-semibold text-[#848E9C] uppercase tracking-wider">Liquidity</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* TRADING SESSIONS */}
        <div className="mb-24">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-8 h-8 text-[#F0B90B]" />
            <h2 className="text-3xl font-bold text-white">Global Trading Sessions</h2>
          </div>
          <p className="text-[#848E9C] mb-8 max-w-3xl">
            The forex market is open 24 hours a day, 5 days a week. Our algorithms are designed to exploit volatility across different geographic sessions, particularly during overlaps when liquidity is highest.
          </p>
          
          <div className="card-stealth p-8 overflow-x-auto">
            <div className="min-w-[800px]">
              <div className="flex text-xs text-[#848E9C] font-bold mb-2">
                {[...Array(24)].map((_, i) => <div key={i} className="flex-1 text-center">{i}:00</div>)}
              </div>
              <div className="space-y-4">
                <div className="relative h-10 bg-[#0B0E11] rounded-lg flex items-center border border-[#2B3139]">
                  <div className="absolute left-[0%] w-[37.5%] h-full bg-[#1E2329] border border-[#2B3139] rounded-lg flex items-center justify-center text-sm font-bold text-white">Sydney / Tokyo</div>
                </div>
                <div className="relative h-10 bg-[#0B0E11] rounded-lg flex items-center border border-[#2B3139]">
                  <div className="absolute left-[33.3%] w-[37.5%] h-full bg-[#02C076]/20 border border-[#02C076]/40 rounded-lg flex items-center justify-center text-sm font-bold text-[#02C076]">London (European)</div>
                </div>
                <div className="relative h-10 bg-[#0B0E11] rounded-lg flex items-center border border-[#2B3139]">
                  <div className="absolute left-[54%] w-[37.5%] h-full bg-[#F0B90B]/20 border border-[#F0B90B]/40 rounded-lg flex items-center justify-center text-sm font-bold text-[#F0B90B]">New York (American)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOREX */}
        <div className="mb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Globe className="w-8 h-8 text-[#F0B90B]" />
              <h2 className="text-3xl font-bold text-white">Forex Markets</h2>
            </div>
            <p className="text-[#848E9C] mb-6">
              Forex is the most liquid financial market in the world. Our trend-following and mean-reversion algorithms primarily target major and minor pairs due to tight spreads and deep liquidity, allowing for scale without slippage.
            </p>
            <div className="overflow-hidden rounded-xl border border-[#2B3139]">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#2B3139] text-[#EAECEF] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Typical Spread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B3139] bg-[#1E2329]">
                  {[
                    { pair: "EUR/USD", type: "Major", spread: "0.1 - 0.3 pips" },
                    { pair: "GBP/USD", type: "Major", spread: "0.4 - 0.8 pips" },
                    { pair: "USD/JPY", type: "Major", spread: "0.2 - 0.5 pips" },
                    { pair: "AUD/USD", type: "Major", spread: "0.3 - 0.6 pips" },
                    { pair: "EUR/GBP", type: "Minor", spread: "0.6 - 1.2 pips" },
                  ].map(r => (
                    <tr key={r.pair} className="hover:bg-[#2B3139]/50">
                      <td className="px-4 py-3 font-semibold text-white">{r.pair}</td>
                      <td className="px-4 py-3 text-[#848E9C]">{r.type}</td>
                      <td className="px-4 py-3 text-[#02C076]">{r.spread}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="card-stealth p-2">
            <TradingChartWidget symbol="FOREXCOM:EURUSD" />
          </div>
        </div>

        {/* GOLD & INDICES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Gold (XAUUSD)</h2>
            <p className="text-[#848E9C] mb-6">
              Gold offers excellent volatility characteristics for breakout models. It acts as a safe haven during market stress, providing non-correlated returns to standard equity portfolios.
            </p>
            <div className="card-stealth p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-[#2B3139] pb-2">
                <span className="text-[#848E9C] font-medium">Correlation</span>
                <span className="font-bold text-white">Inverse to USD</span>
              </div>
              <div className="flex justify-between items-center border-b border-[#2B3139] pb-2">
                <span className="text-[#848E9C] font-medium">Best Trading Time</span>
                <span className="font-bold text-white">NY Session Open</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#848E9C] font-medium">Volatility</span>
                <span className="font-bold text-[#CF304A]">High</span>
              </div>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Global Indices</h2>
            <p className="text-[#848E9C] mb-6">
              Our index algorithms trade momentum on major world markets, capturing broad economic trends without the stock-specific risk of individual equities.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="card-stealth p-4 text-center">
                <h4 className="font-bold text-white">US30 (Dow)</h4>
                <p className="text-xs text-[#848E9C]">US Industrials</p>
              </div>
              <div className="card-stealth p-4 text-center">
                <h4 className="font-bold text-white">SPX500</h4>
                <p className="text-xs text-[#848E9C]">US Broad Market</p>
              </div>
              <div className="card-stealth p-4 text-center">
                <h4 className="font-bold text-white">GER40 (DAX)</h4>
                <p className="text-xs text-[#848E9C]">European Economy</p>
              </div>
              <div className="card-stealth p-4 text-center">
                <h4 className="font-bold text-white">UK100 (FTSE)</h4>
                <p className="text-xs text-[#848E9C]">British Market</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </PublicLayout>
  );
}