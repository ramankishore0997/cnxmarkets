import { PublicLayout } from '@/components/layout/PublicLayout';
import { TradingChartWidget } from '@/components/shared/TradingWidget';
import { Globe, TrendingUp, Activity, Clock } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'wouter';

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

        {/* DETAILED FOREX PAIRS */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">Complete Tradable Instruments</h2>
          <p className="text-[#848E9C] mb-8">All instruments available on ECMarketsIndia, organised by category and liquidity tier.</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <h3 className="text-[#F0B90B] font-bold uppercase tracking-wider text-sm mb-4">Major Forex Pairs</h3>
              <div className="card-stealth overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#2B3139]">
                    <tr>
                      <th className="px-4 py-2 text-left text-[#EAECEF] text-xs">Pair</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Spread</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Daily Vol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]">
                    {[
                      { pair:"EUR/USD", spread:"0.1", vol:"$1.3T" },
                      { pair:"GBP/USD", spread:"0.4", vol:"$800B" },
                      { pair:"USD/JPY", spread:"0.2", vol:"$900B" },
                      { pair:"AUD/USD", spread:"0.3", vol:"$400B" },
                      { pair:"USD/CAD", spread:"0.4", vol:"$350B" },
                      { pair:"USD/CHF", spread:"0.3", vol:"$250B" },
                      { pair:"NZD/USD", spread:"0.5", vol:"$180B" },
                    ].map(r => (
                      <tr key={r.pair} className="hover:bg-[#2B3139]/40">
                        <td className="px-4 py-2.5 font-semibold text-white text-xs">{r.pair}</td>
                        <td className="px-4 py-2.5 text-right text-[#02C076] text-xs">{r.spread} pip</td>
                        <td className="px-4 py-2.5 text-right text-[#848E9C] text-xs">{r.vol}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-[#F0B90B] font-bold uppercase tracking-wider text-sm mb-4">Minor & Cross Pairs</h3>
              <div className="card-stealth overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#2B3139]">
                    <tr>
                      <th className="px-4 py-2 text-left text-[#EAECEF] text-xs">Pair</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Spread</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Sessions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]">
                    {[
                      { pair:"EUR/GBP", spread:"0.6", sessions:"EU" },
                      { pair:"EUR/JPY", spread:"0.7", sessions:"EU+NY" },
                      { pair:"GBP/JPY", spread:"0.9", sessions:"EU+NY" },
                      { pair:"AUD/JPY", spread:"0.8", sessions:"Tokyo" },
                      { pair:"EUR/CHF", spread:"0.7", sessions:"EU" },
                      { pair:"GBP/CHF", spread:"1.2", sessions:"EU" },
                      { pair:"EUR/AUD", spread:"1.0", sessions:"All" },
                    ].map(r => (
                      <tr key={r.pair} className="hover:bg-[#2B3139]/40">
                        <td className="px-4 py-2.5 font-semibold text-white text-xs">{r.pair}</td>
                        <td className="px-4 py-2.5 text-right text-[#02C076] text-xs">{r.spread} pip</td>
                        <td className="px-4 py-2.5 text-right text-[#848E9C] text-xs">{r.sessions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-[#F0B90B] font-bold uppercase tracking-wider text-sm mb-4">Metals & Indices</h3>
              <div className="card-stealth overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#2B3139]">
                    <tr>
                      <th className="px-4 py-2 text-left text-[#EAECEF] text-xs">Instrument</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Type</th>
                      <th className="px-4 py-2 text-right text-[#EAECEF] text-xs">Vol</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]">
                    {[
                      { pair:"XAU/USD", type:"Metal", vol:"High" },
                      { pair:"XAG/USD", type:"Metal", vol:"Med" },
                      { pair:"US30", type:"Index", vol:"High" },
                      { pair:"SPX500", type:"Index", vol:"High" },
                      { pair:"NAS100", type:"Index", vol:"High" },
                      { pair:"GER40", type:"Index", vol:"Med" },
                      { pair:"UK100", type:"Index", vol:"Med" },
                    ].map(r => (
                      <tr key={r.pair} className="hover:bg-[#2B3139]/40">
                        <td className="px-4 py-2.5 font-semibold text-white text-xs">{r.pair}</td>
                        <td className="px-4 py-2.5 text-right text-[#848E9C] text-xs">{r.type}</td>
                        <td className="px-4 py-2.5 text-right text-xs">
                          <span className={r.vol==='High' ? 'text-[#CF304A] font-bold' : 'text-[#F0B90B] font-bold'}>{r.vol}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* GLOBAL MARKET ACCESS */}
        <div className="mt-24">
          <div className="card-stealth-gold p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-4">🌐 Global Market Access via Algorithmic Infrastructure</h2>
                <p className="text-[#848E9C] mb-4 leading-relaxed">
                  ECMarketsIndia provides access to global financial markets through institutional-grade algorithmic trading infrastructure. Our platform connects to Tier-1 liquidity providers and global exchanges, delivering professional execution across forex, commodities, and indices.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    "Direct connectivity to Tier-1 global liquidity providers",
                    "Multi-currency account support with real-time conversion",
                    "Strict AML and KYC verification for all clients",
                    "Full trade transparency with detailed reporting tools",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="text-[#02C076]">✓</span>
                      <span className="text-[#EAECEF]">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="lg:w-80 space-y-3">
                {[
                  { label:"Platform Type", val:"Global Fintech" },
                  { label:"Currency", val:"Multi-Currency" },
                  { label:"Min. Capital", val:"₹20,000" },
                  { label:"Reporting", val:"Full Trade History" },
                ].map((s, i) => (
                  <div key={i} className="bg-[#0B0E11] rounded-lg p-3 flex justify-between border border-[#2B3139]">
                    <span className="text-[#848E9C] text-sm">{s.label}</span>
                    <span className="text-[#F0B90B] font-bold text-sm">{s.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SESSION VOLATILITY GUIDE */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold text-white mb-8">Volatility & Session Guide for Algo Traders</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { session:"Tokyo / Sydney", time:"12:00 AM – 8:00 AM IST", pairs:"JPY pairs, AUD, NZD", vol:"Low to Medium", tip:"Best for carry trade strategies. Calmer conditions with slow, directional moves." },
              { session:"London (European)", time:"1:30 PM – 9:30 PM IST", pairs:"EUR, GBP, CHF pairs", vol:"High", tip:"Peak liquidity session. Our momentum algorithms generate highest signal density during London open." },
              { session:"New York (American)", time:"6:30 PM – 12:30 AM IST", pairs:"USD, Gold, Indices", vol:"Very High", tip:"US economic data releases create major opportunities for breakout and momentum strategies." },
            ].map((sess, i) => (
              <div key={i} className="card-stealth p-6">
                <h3 className="font-bold text-[#F0B90B] mb-1">{sess.session}</h3>
                <p className="text-[#848E9C] text-xs mb-3">{sess.time}</p>
                <p className="text-white text-sm font-semibold mb-1">Active Pairs</p>
                <p className="text-[#848E9C] text-sm mb-3">{sess.pairs}</p>
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-[#F0B90B]" />
                  <span className="text-[#EAECEF] text-sm font-bold">{sess.vol}</span>
                </div>
                <p className="text-[#848E9C] text-xs border-t border-[#2B3139] pt-3">{sess.tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* CTA */}
      <div className="py-16 bg-[#1E2329] border-t border-[#2B3139] text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Access All 50+ Instruments</h2>
        <p className="text-[#848E9C] mb-6">Activate any strategy and let our algorithms do the trading.</p>
        <Link href="/auth/register" className="btn-gold inline-block font-bold">Open Your Account</Link>
      </div>

    </PublicLayout>
  );
}