import { useEffect, useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { io as connectSocket, type Socket } from 'socket.io-client';
import { createChart, CandlestickSeries, type IChartApi, type ISeriesApi, type CandlestickData, type UTCTimestamp } from 'lightweight-charts';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { TrendingUp, TrendingDown, Clock, Zap, History, CheckCircle, XCircle, RefreshCw, Wallet, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const INSTRUMENTS = [
  { id: 'EUR/USD', label: 'EUR/USD', flag: '🇪🇺', decimals: 5 },
  { id: 'GBP/USD', label: 'GBP/USD', flag: '🇬🇧', decimals: 5 },
  { id: 'BTC/USD', label: 'BTC/USD', flag: '₿', decimals: 2 },
];

const DURATIONS = [
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1m' },
  { seconds: 120, label: '2m' },
  { seconds: 300, label: '5m' },
];

const BASE_PRICES: Record<string, number> = {
  'EUR/USD': 1.08540,
  'GBP/USD': 1.27230,
  'BTC/USD': 67450.0,
};

function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('ecm_token');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || payload.userId || null;
  } catch {
    return null;
  }
}

function formatPrice(price: number, instrument: string): string {
  const inst = INSTRUMENTS.find(i => i.id === instrument);
  return price.toFixed(inst?.decimals ?? 5);
}

function generateHistoricalCandles(instrument: string, count = 60): CandlestickData[] {
  const base = BASE_PRICES[instrument] ?? 1;
  const nowMinute = Math.floor(Date.now() / 60000);
  const bars: CandlestickData[] = [];
  let price = base;
  const vol = instrument === 'BTC/USD' ? 30 : 0.00020;
  const dec = instrument === 'BTC/USD' ? 2 : 5;
  for (let i = count; i >= 0; i--) {
    const t = ((nowMinute - i) * 60) as UTCTimestamp;
    const open = price;
    const c1 = (Math.random() - 0.5) * 2 * vol;
    const c2 = (Math.random() - 0.5) * 2 * vol * 0.4;
    const close = parseFloat((open + c1).toFixed(dec));
    const high = parseFloat((Math.max(open, close) + Math.abs(c2)).toFixed(dec));
    const low = parseFloat((Math.min(open, close) - Math.abs(c2)).toFixed(dec));
    bars.push({ time: t, open, high, low, close });
    price = close;
  }
  return bars;
}

interface ActiveTrade {
  id: number;
  instrument: string;
  direction: string;
  entryPrice: number;
  amount: number;
  duration: number;
  payoutPct: number;
  openedAt: string;
  endsAt: number;
}

interface HistoryTrade {
  id: number;
  instrument: string;
  direction: string;
  entryPrice: number;
  closingPrice: number | null;
  amount: number;
  profit: number | null;
  status: string;
  openedAt: string;
}

interface SettledResult {
  tradeId: number;
  instrument: string;
  direction: string;
  entryPrice: number;
  exitPrice: number;
  amount: number;
  profit: number;
  payout: number;
  status: string;
  payoutPct: number;
}

export function BinaryTrading() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: dashboard } = useGetDashboard({ ...getAuthOptions(), query: { staleTime: 0, refetchOnMount: true } });
  const balance = dashboard?.totalBalance ?? 0;

  const [instrument, setInstrument] = useState('EUR/USD');
  const [duration, setDuration] = useState(60);
  const [amount, setAmount] = useState('500');
  const [placing, setPlacing] = useState(false);
  const [payoutPct, setPayoutPct] = useState(90);

  const [currentPrice, setCurrentPrice] = useState<Record<string, number>>(BASE_PRICES);
  const [priceChange, setPriceChange] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);

  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [history, setHistory] = useState<HistoryTrade[]>([]);
  const [result, setResult] = useState<SettledResult | null>(null);
  const [tick, setTick] = useState(0);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const currentCandles = useRef<Record<string, CandlestickData[]>>({});
  const prevPrice = useRef<Record<string, number>>({ ...BASE_PRICES });

  const token = localStorage.getItem('ecm_token');
  const userId = getUserIdFromToken();
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/binary/settings', { headers: authHeaders });
      if (res.ok) {
        const data = await res.json();
        setPayoutPct(data.payoutPct ?? 90);
      }
    } catch {}
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/binary/history', { headers: authHeaders });
      if (res.ok) setHistory(await res.json());
    } catch {}
  }, []);

  const fetchActive = useCallback(async () => {
    try {
      const res = await fetch('/api/binary/active', { headers: authHeaders });
      if (res.ok) {
        const trades = await res.json();
        setActiveTrades(trades.map((t: any) => ({
          ...t,
          endsAt: new Date(t.openedAt).getTime() + t.duration * 1000,
        })));
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchHistory();
    fetchActive();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: '#07091A' },
        textColor: '#848E9C',
      },
      grid: {
        vertLines: { color: '#1E2329' },
        horzLines: { color: '#1E2329' },
      },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#2B3139' },
      timeScale: { borderColor: '#2B3139', timeVisible: true, secondsVisible: false },
      width: chartRef.current.clientWidth,
      height: 340,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#02C076',
      downColor: '#CF304A',
      borderUpColor: '#02C076',
      borderDownColor: '#CF304A',
      wickUpColor: '#02C076',
      wickDownColor: '#CF304A',
    });

    chartInstance.current = chart;
    seriesRef.current = series;

    const initialData = generateHistoricalCandles(instrument);
    currentCandles.current[instrument] = initialData;
    series.setData(initialData);

    const handleResize = () => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartInstance.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    if (!currentCandles.current[instrument]) {
      const data = generateHistoricalCandles(instrument);
      currentCandles.current[instrument] = data;
    }
    seriesRef.current.setData(currentCandles.current[instrument]);
  }, [instrument]);

  useEffect(() => {
    const socket = connectSocket(window.location.origin, {
      path: '/api/socket.io',
      auth: { userId },
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('price:tick', (data: { instrument: string; price: number; open: number; high: number; low: number; time: number }) => {
      const { instrument: inst, price, open, high, low, time } = data;

      setCurrentPrice(prev => {
        const oldPrice = prev[inst] ?? price;
        setPriceChange(pc => ({ ...pc, [inst]: price - oldPrice }));
        prevPrice.current[inst] = oldPrice;
        return { ...prev, [inst]: price };
      });

      if (!currentCandles.current[inst]) {
        currentCandles.current[inst] = generateHistoricalCandles(inst);
      }

      const bar: CandlestickData = {
        time: time as UTCTimestamp,
        open,
        high,
        low,
        close: price,
      };

      const candles = currentCandles.current[inst];
      const last = candles[candles.length - 1];
      if (last && last.time === bar.time) {
        candles[candles.length - 1] = bar;
      } else {
        candles.push(bar);
        if (candles.length > 500) candles.shift();
      }

      if (inst === instrument && seriesRef.current) {
        seriesRef.current.update(bar);
      }
    });

    socket.on('binary:settled', (data: SettledResult) => {
      setResult(data);
      setActiveTrades(prev => prev.filter(t => t.id !== data.tradeId));
      fetchHistory();
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });

      const won = data.status === 'won';
      const push = data.status === 'push';
      toast({
        title: push ? '↔ Push — Refunded' : won ? '🎉 Trade Won!' : '❌ Trade Lost',
        description: push
          ? `₹${data.amount.toLocaleString('en-IN')} refunded`
          : won
          ? `+₹${data.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })} profit`
          : `−₹${data.amount.toLocaleString('en-IN')} lost`,
        variant: won || push ? 'default' : 'destructive',
      });
    });

    return () => { socket.disconnect(); };
  }, [userId, instrument]);

  const handlePlace = async (dir: 'call' | 'put') => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) {
      toast({ title: 'Minimum ₹100 required', variant: 'destructive' });
      return;
    }
    if (amt > balance) {
      toast({ title: 'Insufficient balance', variant: 'destructive' });
      return;
    }
    setPlacing(true);
    try {
      const res = await fetch('/api/binary/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify({ instrument, direction: dir, amount: amt, duration }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: data.message || 'Trade failed', variant: 'destructive' });
        return;
      }
      const endsAt = Date.now() + duration * 1000;
      setActiveTrades(prev => [...prev, { ...data, endsAt }]);
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
      toast({ title: `Trade placed: ${dir === 'call' ? '↑ Higher' : '↓ Lower'}`, description: `₹${amt.toLocaleString('en-IN')} on ${instrument} for ${DURATIONS.find(d => d.seconds === duration)?.label}` });
    } catch {
      toast({ title: 'Network error', variant: 'destructive' });
    } finally {
      setPlacing(false);
    }
  };

  const instInfo = INSTRUMENTS.find(i => i.id === instrument)!;
  const price = currentPrice[instrument] ?? BASE_PRICES[instrument];
  const change = priceChange[instrument] ?? 0;
  const priceDir = change >= 0 ? 'up' : 'down';

  return (
    <DashboardLayout>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-6 h-6 text-[#FFB800]" />
            Live Binary Trading
          </h1>
          <p className="text-[#848E9C] text-sm mt-0.5">Higher/Lower predictions · {payoutPct}% payout on wins</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-[#02C076] animate-pulse' : 'bg-[#CF304A]'}`} />
          <span className={connected ? 'text-[#02C076]' : 'text-[#CF304A]'}>{connected ? 'Live Feed Connected' : 'Connecting…'}</span>
          <span className="text-[#2B3139]">|</span>
          <span className="text-[#848E9C]">Balance: <span className="text-white font-bold">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="space-y-4">
          <div className="card-stealth p-4">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {INSTRUMENTS.map(inst => (
                <button
                  key={inst.id}
                  onClick={() => setInstrument(inst.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${instrument === inst.id ? 'bg-[#FFB800] text-black' : 'bg-[#2B3139] text-[#848E9C] hover:text-white'}`}
                >
                  <span>{inst.flag}</span>
                  {inst.label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <span className={`text-2xl font-black font-mono tabular-nums ${priceDir === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                  {formatPrice(price, instrument)}
                </span>
                <span className={`text-sm font-bold ${priceDir === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                  {priceDir === 'up' ? '▲' : '▼'} {Math.abs(change).toFixed(instInfo.decimals)}
                </span>
              </div>
            </div>
            <div ref={chartRef} className="w-full rounded-xl overflow-hidden" />
          </div>

          {activeTrades.length > 0 && (
            <div className="card-stealth p-4">
              <h3 className="text-sm font-bold text-[#EAECEF] mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#FFB800]" />
                Active Trades ({activeTrades.length})
              </h3>
              <div className="space-y-2">
                {activeTrades.map(trade => {
                  const remaining = Math.max(0, Math.ceil((trade.endsAt - Date.now()) / 1000));
                  const elapsed = trade.duration - remaining;
                  const pct = Math.min((elapsed / trade.duration) * 100, 100);
                  const tradePrice = currentPrice[trade.instrument] ?? trade.entryPrice;
                  const winning = trade.direction === 'call' ? tradePrice > trade.entryPrice : tradePrice < trade.entryPrice;
                  return (
                    <div key={trade.id} className={`rounded-xl p-3 border ${winning ? 'border-[#02C076]/30 bg-[#02C076]/5' : 'border-[#CF304A]/30 bg-[#CF304A]/5'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-black px-2 py-0.5 rounded ${trade.direction === 'call' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                            {trade.direction === 'call' ? '↑ HIGHER' : '↓ LOWER'}
                          </span>
                          <span className="text-xs font-bold text-white">{trade.instrument}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[#848E9C]">₹{trade.amount.toLocaleString('en-IN')}</span>
                          <span className={`font-bold font-mono ${winning ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                            {winning ? '+' : '−'}₹{(trade.amount * trade.payoutPct / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                          <span className="flex items-center gap-1 text-[#FFB800] font-bold">
                            <Clock className="w-3 h-3" />
                            {remaining}s
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-[#2B3139] rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${winning ? 'bg-[#02C076]' : 'bg-[#CF304A]'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-[#848E9C] mt-1">
                        <span>Entry: {formatPrice(trade.entryPrice, trade.instrument)}</span>
                        <span>Now: {formatPrice(tradePrice, trade.instrument)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {history.length > 0 && (
            <div className="card-stealth p-4">
              <h3 className="text-sm font-bold text-[#EAECEF] mb-3 flex items-center gap-2">
                <History className="w-4 h-4 text-[#848E9C]" />
                Recent History
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#848E9C] border-b border-[#2B3139]">
                      <th className="pb-2 text-left">Instrument</th>
                      <th className="pb-2 text-left">Direction</th>
                      <th className="pb-2 text-right">Amount</th>
                      <th className="pb-2 text-right">Entry</th>
                      <th className="pb-2 text-right">Exit</th>
                      <th className="pb-2 text-right">P&L</th>
                      <th className="pb-2 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B3139]">
                    {history.slice(0, 15).map(t => (
                      <tr key={t.id} className="hover:bg-[#2B3139]/30 transition-colors">
                        <td className="py-2 font-bold text-white">{t.instrument}</td>
                        <td className="py-2">
                          <span className={`px-1.5 py-0.5 rounded font-bold ${t.direction === 'call' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                            {t.direction === 'call' ? '↑' : '↓'} {t.direction === 'call' ? 'Higher' : 'Lower'}
                          </span>
                        </td>
                        <td className="py-2 text-right text-[#EAECEF]">₹{t.amount.toLocaleString('en-IN')}</td>
                        <td className="py-2 text-right font-mono">{t.entryPrice.toFixed(INSTRUMENTS.find(i => i.id === t.instrument)?.decimals ?? 5)}</td>
                        <td className="py-2 text-right font-mono">{t.closingPrice?.toFixed(INSTRUMENTS.find(i => i.id === t.instrument)?.decimals ?? 5) ?? '—'}</td>
                        <td className={`py-2 text-right font-bold ${(t.profit ?? 0) >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                          {t.profit != null ? `${t.profit >= 0 ? '+' : ''}₹${Math.abs(t.profit).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-2 text-right">
                          {t.status === 'won' && <span className="flex items-center justify-end gap-1 text-[#02C076] font-bold"><CheckCircle className="w-3 h-3" />Won</span>}
                          {t.status === 'lost' && <span className="flex items-center justify-end gap-1 text-[#CF304A] font-bold"><XCircle className="w-3 h-3" />Lost</span>}
                          {t.status === 'push' && <span className="text-[#848E9C] font-bold">Push</span>}
                          {t.status === 'open' && <span className="text-[#FFB800] font-bold flex items-center justify-end gap-1"><RefreshCw className="w-3 h-3 animate-spin" />Open</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {result && (
            <div className={`rounded-2xl p-5 border text-center ${result.status === 'won' ? 'bg-[#02C076]/10 border-[#02C076]/40' : result.status === 'push' ? 'bg-[#2B3139] border-[#2B3139]' : 'bg-[#CF304A]/10 border-[#CF304A]/40'}`}>
              <div className="text-4xl mb-2">{result.status === 'won' ? '🎉' : result.status === 'push' ? '↔' : '❌'}</div>
              <p className={`text-xl font-black ${result.status === 'won' ? 'text-[#02C076]' : result.status === 'push' ? 'text-white' : 'text-[#CF304A]'}`}>
                {result.status === 'won' ? 'Trade Won!' : result.status === 'push' ? 'Push — Refunded' : 'Trade Lost'}
              </p>
              <p className={`text-2xl font-black font-mono mt-1 ${result.status === 'won' ? 'text-[#02C076]' : result.status === 'push' ? 'text-white' : 'text-[#CF304A]'}`}>
                {result.status === 'push' ? `₹${result.amount.toLocaleString('en-IN')}` : result.status === 'won' ? `+₹${result.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })}` : `−₹${result.amount.toLocaleString('en-IN')}`}
              </p>
              <div className="text-xs text-[#848E9C] mt-2 space-y-0.5">
                <p>Entry: {result.entryPrice.toFixed(INSTRUMENTS.find(i => i.id === result.instrument)?.decimals ?? 5)}</p>
                <p>Exit: {result.exitPrice.toFixed(INSTRUMENTS.find(i => i.id === result.instrument)?.decimals ?? 5)}</p>
              </div>
              <button onClick={() => setResult(null)} className="mt-3 text-xs text-[#848E9C] underline">Dismiss</button>
            </div>
          )}

          <div className="card-stealth p-5">
            <h3 className="text-sm font-bold text-[#EAECEF] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FFB800]" />
              Place Trade
            </h3>

            <div className="mb-4">
              <label className="text-xs text-[#848E9C] font-semibold uppercase tracking-wide mb-2 block">Trade Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C] font-bold text-sm">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full bg-[#2B3139] border border-[#3B4149] rounded-xl pl-8 pr-4 py-3 text-white font-bold text-sm focus:outline-none focus:border-[#FFB800] transition-colors"
                  placeholder="500"
                  min="100"
                />
              </div>
              <div className="flex gap-1.5 mt-2">
                {[100, 500, 1000, 5000].map(v => (
                  <button key={v} onClick={() => setAmount(String(v))} className="flex-1 py-1 rounded-lg bg-[#2B3139] text-[#848E9C] text-xs font-bold hover:text-white hover:bg-[#3B4149] transition-all">
                    ₹{v >= 1000 ? `${v / 1000}K` : v}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="text-xs text-[#848E9C] font-semibold uppercase tracking-wide mb-2 block">Expiry Time</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATIONS.map(d => (
                  <button
                    key={d.seconds}
                    onClick={() => setDuration(d.seconds)}
                    className={`py-2 rounded-xl font-bold text-sm transition-all ${duration === d.seconds ? 'bg-[#FFB800] text-black' : 'bg-[#2B3139] text-[#848E9C] hover:text-white'}`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0B0E11] rounded-xl p-3 mb-4 border border-[#2B3139] text-xs">
              <div className="flex justify-between text-[#848E9C] mb-1">
                <span>Payout if Win</span>
                <span className="text-[#02C076] font-bold">{payoutPct}%</span>
              </div>
              <div className="flex justify-between text-[#848E9C] mb-1">
                <span>Win Amount</span>
                <span className="text-[#02C076] font-bold">+₹{((parseFloat(amount) || 0) * payoutPct / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-[#848E9C]">
                <span>Total Return</span>
                <span className="text-white font-bold">₹{((parseFloat(amount) || 0) * (1 + payoutPct / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handlePlace('call')}
                disabled={placing}
                className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-[#02C076] hover:bg-[#00a864] text-white font-black text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <TrendingUp className="w-6 h-6" />
                <span>Higher</span>
                <span className="text-xs font-semibold opacity-80">↑ Call</span>
              </button>
              <button
                onClick={() => handlePlace('put')}
                disabled={placing}
                className="flex flex-col items-center gap-1 py-4 rounded-2xl bg-[#CF304A] hover:bg-[#b52740] text-white font-black text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <TrendingDown className="w-6 h-6" />
                <span>Lower</span>
                <span className="text-xs font-semibold opacity-80">↓ Put</span>
              </button>
            </div>
          </div>

          <div className="card-stealth p-5">
            <h3 className="text-xs font-bold text-[#848E9C] uppercase tracking-wide mb-3">Live Prices</h3>
            <div className="space-y-3">
              {INSTRUMENTS.map(inst => {
                const p = currentPrice[inst.id] ?? BASE_PRICES[inst.id];
                const ch = priceChange[inst.id] ?? 0;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setInstrument(inst.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${instrument === inst.id ? 'bg-[#FFB800]/10 border border-[#FFB800]/30' : 'bg-[#2B3139]/50 border border-transparent hover:border-[#3B4149]'}`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{inst.flag}</span>
                      <span className={`text-sm font-bold ${instrument === inst.id ? 'text-[#FFB800]' : 'text-white'}`}>{inst.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-sm text-white">{formatPrice(p, inst.id)}</p>
                      <p className={`text-xs font-bold ${ch >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                        {ch >= 0 ? '+' : ''}{ch.toFixed(inst.decimals)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card-stealth p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-[#848E9C]" />
              <span className="text-xs text-[#848E9C] font-semibold uppercase tracking-wide">Available Balance</span>
            </div>
            <p className="text-2xl font-black text-white">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</p>
            <p className="text-xs text-[#848E9C] mt-1">Updates after each settled trade</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
