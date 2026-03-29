import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { useLiveUpdates } from '@/hooks/use-live-updates';
import {
  TrendingUp, Download, Upload,
  BarChart2, ArrowUp, ArrowDown, Activity, Wifi
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Link } from 'wouter';
import { LivePriceTicker } from '@/components/shared/LivePriceTicker';

// ─── Live Open Trades Panel ──────────────────────────────────────────────────

interface LiveTrade {
  id: number;
  instrument: string;
  market: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  lotSize: number;
  openedAt: string;
}

interface AnimatedTrade extends LiveTrade {
  currentPrice: number;
  prevPrice: number;
  unrealizedPnl: number;
  priceDirection: 'up' | 'down' | 'flat';
}

const PIP_SIZE: Record<string, number> = {
  'JPY': 0.01,
  'BTC': 10, 'ETH': 0.5, 'SOL': 0.05, 'BNB': 0.1, 'XRP': 0.0002,
};

function getPipSize(instrument: string): number {
  for (const [key, size] of Object.entries(PIP_SIZE)) {
    if (instrument.includes(key)) return size;
  }
  return 0.0001; // default forex
}

function formatPrice(price: number, instrument: string): string {
  const isJpy    = instrument.includes('JPY');
  const isCrypto = ['BTC','ETH','SOL','BNB','XRP'].some(c => instrument.startsWith(c));
  if (isCrypto && price > 10_000) return price.toFixed(2);
  if (isCrypto) return price.toFixed(4);
  if (isJpy) return price.toFixed(3);
  return price.toFixed(5);
}

function calcUnrealizedPnl(trade: LiveTrade, currentPrice: number): number {
  const pip       = getPipSize(trade.instrument);
  const priceDiff = currentPrice - trade.entryPrice;
  const pips      = priceDiff / pip;
  const isCrypto  = ['BTC','ETH','SOL','BNB','XRP'].some(c => trade.instrument.startsWith(c));
  const perPipInr = isCrypto ? trade.lotSize * pip * 83.45 : trade.lotSize * pip * 83.45 * 0.0001;
  const pnl       = trade.direction === 'buy' ? pips * perPipInr : -pips * perPipInr;
  return parseFloat(pnl.toFixed(2));
}

function LiveOpenTrades() {
  const [trades, setTrades]     = useState<AnimatedTrade[]>([]);
  const [loading, setLoading]   = useState(true);
  const animRef = useRef<NodeJS.Timeout | null>(null);

  const fetchOpenTrades = async () => {
    try {
      const token = localStorage.getItem('ecm_token');
      const res = await fetch('/api/trades/open', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const raw: LiveTrade[] = await res.json();
      setTrades(prev => {
        return raw.map(t => {
          const existing = prev.find(p => p.id === t.id);
          const cp = existing?.currentPrice ?? t.entryPrice;
          return {
            ...t,
            currentPrice:   cp,
            prevPrice:      cp,
            unrealizedPnl:  existing?.unrealizedPnl ?? 0,
            priceDirection: 'flat',
          };
        });
      });
    } catch { /* silent */ } finally {
      setLoading(false);
    }
  };

  // Fetch open trades every 15 s
  useEffect(() => {
    fetchOpenTrades();
    const id = setInterval(fetchOpenTrades, 15_000);
    return () => clearInterval(id);
  }, []);

  // Animate price every 2-3 s
  useEffect(() => {
    const animate = () => {
      setTrades(prev => prev.map(t => {
        const pip       = getPipSize(t.instrument);
        const isCrypto  = ['BTC','ETH','SOL','BNB','XRP'].some(c => t.instrument.startsWith(c));
        // Move 1-8 pips randomly, with slight bullish bias (55% up)
        const move      = isCrypto
          ? pip * (Math.random() * 4) * (Math.random() > 0.45 ? 1 : -1)
          : pip * (1 + Math.random() * 7) * (Math.random() > 0.45 ? 1 : -1);
        const newPrice  = Math.max(t.entryPrice * 0.95, t.currentPrice + move);
        return {
          ...t,
          prevPrice:      t.currentPrice,
          currentPrice:   newPrice,
          unrealizedPnl:  calcUnrealizedPnl(t, newPrice),
          priceDirection: newPrice > t.currentPrice ? 'up' : newPrice < t.currentPrice ? 'down' : 'flat',
        };
      }));
      const delay = 2_000 + Math.random() * 1_000;
      animRef.current = setTimeout(animate, delay);
    };
    animRef.current = setTimeout(animate, 2_000);
    return () => { if (animRef.current) clearTimeout(animRef.current); };
  }, []);

  if (loading) {
    return (
      <div className="card-stealth p-8 flex justify-center">
        <div className="w-8 h-8 border-t-2 border-[#1F77B4] rounded-full animate-spin" />
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="card-stealth p-10 text-center">
        <Wifi className="w-12 h-12 text-white/[0.04] mx-auto mb-3" />
        <p className="text-[#4B5563] font-medium text-sm">No open positions right now</p>
        <p className="text-xs text-[#374151] mt-1">The trading engine will open positions shortly</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map(trade => {
        const isUp   = trade.priceDirection === 'up';
        const isDown = trade.priceDirection === 'down';
        const pnlPos = trade.unrealizedPnl >= 0;
        const isBuy  = trade.direction === 'buy';

        return (
          <div key={trade.id}
            className="relative overflow-hidden rounded-2xl transition-all duration-300"
            style={{
              background: '#ffffff',
              border: '1px solid #E5E7EB',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            }}
          >
            {/* Left color bar — blue for buy, red for sell */}
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
              style={{ background: isBuy ? '#1F77B4' : '#DC2626' }} />

            {/* Flash overlay on price tick */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl transition-opacity duration-700"
              style={{
                background: isUp
                  ? 'rgba(31,119,180,0.04)'
                  : isDown ? 'rgba(220,38,38,0.04)' : 'transparent',
                opacity: trade.priceDirection === 'flat' ? 0 : 1,
              }}
            />

            <div className="relative pl-5 pr-4 py-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">

                {/* LEFT — direction badge + instrument */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-base"
                    style={{
                      background: isBuy ? '#EFF6FF' : '#FEF2F2',
                      color: isBuy ? '#1F77B4' : '#DC2626',
                      border: `1px solid ${isBuy ? '#BFDBFE' : '#FECACA'}`,
                    }}>
                    {isBuy ? '▲' : '▼'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[#111827] text-sm">{trade.instrument}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                        style={{ background: '#EFF6FF', color: '#1F77B4', border: '1px solid #BFDBFE' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1F77B4] animate-pulse inline-block" />
                        LIVE
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase"
                        style={{
                          background: isBuy ? '#EFF6FF' : '#FEF2F2',
                          color: isBuy ? '#1F77B4' : '#DC2626',
                        }}>
                        {trade.direction}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#6B7280] font-medium mt-0.5 truncate">
                      {trade.market} · {trade.lotSize} lots
                    </p>
                  </div>
                </div>

                {/* CENTER — entry & current price */}
                <div className="flex items-center gap-5">
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-1">Entry</p>
                    <p className="font-mono text-sm font-semibold text-[#374151] tabular-nums">
                      {formatPrice(trade.entryPrice, trade.instrument)}
                    </p>
                  </div>
                  <div className="text-[#D1D5DB] font-light text-lg">→</div>
                  <div>
                    <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-1">Current</p>
                    <div className="flex items-center gap-1">
                      {isUp   && <ArrowUp   className="w-3 h-3 text-[#1F77B4] shrink-0" />}
                      {isDown && <ArrowDown className="w-3 h-3 text-[#DC2626] shrink-0" />}
                      <p className={`font-mono text-sm font-bold tabular-nums transition-colors duration-300 ${
                        isUp ? 'text-[#1F77B4]' : isDown ? 'text-[#DC2626]' : 'text-[#111827]'
                      }`}>
                        {formatPrice(trade.currentPrice, trade.instrument)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* RIGHT — P&L badge */}
                <div className="shrink-0 text-right">
                  <p className="text-[10px] text-[#9CA3AF] font-semibold uppercase tracking-wider mb-1">Unrealized P&L</p>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono font-black text-sm tabular-nums transition-all duration-300"
                    style={{
                      background: pnlPos ? '#DCFCE7' : '#FEF2F2',
                      color:      pnlPos ? '#16A34A' : '#DC2626',
                      border:     `1px solid ${pnlPos ? '#BBF7D0' : '#FECACA'}`,
                    }}>
                    {pnlPos ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {pnlPos ? '+' : '-'}₹{Math.abs(trade.unrealizedPnl).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────

export function Dashboard() {
  useLiveUpdates();

  const { data, isLoading } = useGetDashboard({
    ...getAuthOptions(),
    query: { refetchInterval: 120_000, staleTime: 60_000, refetchOnWindowFocus: false },
  });

  const totalBalance  = data?.totalBalance  ?? 0;
  const totalProfit   = data?.totalProfit   ?? 0;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-[60vh] items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-white/[0.06] rounded-full" />
            <div className="absolute inset-0 border-t-4 border-[#1F77B4] rounded-full animate-spin" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const equityData    = data?.equityCurve?.length ? data.equityCurve : [];
  const profitPercent = totalBalance > 0 && totalProfit !== 0
    ? (((totalBalance) / (totalBalance - totalProfit) - 1) * 100).toFixed(2)
    : '0.00';

  return (
    <DashboardLayout>

      {/* ── Live ticker ── */}
      <div className="mb-5">
        <LivePriceTicker />
      </div>

      {/* ── Balance Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-5"
        style={{
          background: '#0B1929',
          border: '1px solid #1F3A52',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>

        {/* subtle blue accent strip on top */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
          style={{ background: 'linear-gradient(90deg, #1F77B4 0%, #60C0F0 50%, #1F77B4 100%)' }} />

        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="flex-1">
              {/* Label */}
              <div className="flex items-center gap-2 mb-3">
                <span className="live-dot w-2 h-2 rounded-full bg-[#60C0F0] inline-block" />
                <p className="text-[11px] text-[#60C0F0] font-bold uppercase tracking-[0.18em]">Live Balance</p>
              </div>
              {/* Balance amount */}
              <h2 className="font-terminal text-4xl md:text-5xl font-bold mb-4 tracking-tight tabular-nums leading-none"
                style={{ color: '#FFFFFF' }}>
                ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h2>
              {/* Stats row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-sm border ${
                  parseFloat(profitPercent) >= 0
                    ? 'border-[#16A34A] text-[#4ADE80]'
                    : 'border-[#DC2626] text-[#F87171]'
                }`} style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  {parseFloat(profitPercent) >= 0 ? '+' : ''}{profitPercent}% All-time
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium" style={{ color: '#94A3B8' }}>P&amp;L:</span>
                  <span className={`font-terminal font-bold text-sm ${totalProfit >= 0 ? 'text-[#60C0F0]' : 'text-[#F87171]'}`}>
                    {totalProfit >= 0 ? '+' : ''}₹{Math.abs(totalProfit).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 w-full md:w-auto shrink-0">
              <Link href="/dashboard/deposit"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: '#1F77B4', color: '#FFFFFF', boxShadow: '0 4px 16px rgba(31,119,180,0.4)' }}>
                <Download className="w-4 h-4" /> Deposit
              </Link>
              <Link href="/dashboard/withdraw"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.4)', color: '#FFFFFF' }}>
                <Upload className="w-4 h-4" /> Withdraw
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Open Trades ── */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1F77B4] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#1F77B4]"></span>
            </span>
            <h3 className="text-base font-bold text-[#111827]">Live Open Trades</h3>
          </div>
          <Link href="/dashboard/trades" className="text-xs font-semibold text-[#1F77B4] hover:text-[#60a5fa] transition-colors">
            Full History →
          </Link>
        </div>
        <LiveOpenTrades />
      </div>

      {/* ── Equity Curve ── */}
      <div className="card-stealth p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-[#111827]">Equity Curve</h3>
            {equityData.length === 0 && (
              <p className="text-xs text-[#4B5563] mt-0.5">Appears after your first closed trade</p>
            )}
          </div>
          <BarChart2 className="w-[18px] h-[18px] text-[#374151]" />
        </div>
        {equityData.length > 0 ? (
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#1F77B4" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#1F77B4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis dataKey="date" stroke="#374151" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#374151" fontSize={11} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderColor: 'rgba(31,119,180,0.2)', borderRadius: '10px', color: '#111827', fontSize: 12 }}
                  itemStyle={{ color: '#1F77B4', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}
                  labelStyle={{ color: '#6B7280', fontSize: 11 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Equity']}
                />
                <Area type="monotone" dataKey="value" stroke="#1F77B4" strokeWidth={2}
                  fillOpacity={1} fill="url(#equityFill)" dot={false}
                  activeDot={{ r: 4, fill: '#1F77B4', stroke: 'rgba(15,23,42,0.9)', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <BarChart2 className="w-12 h-12 text-white/[0.05] mx-auto mb-3" />
              <p className="text-[#4B5563] font-medium text-sm">No equity data yet</p>
              <p className="text-xs text-[#374151] mt-1">Deposit funds to get started</p>
            </div>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
