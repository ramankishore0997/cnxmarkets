import { useEffect, useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { io as connectSocket, type Socket } from 'socket.io-client';
import {
  createChart, CandlestickSeries,
  type IChartApi, type ISeriesApi, type CandlestickData, type UTCTimestamp,
} from 'lightweight-charts';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { TrendingUp, TrendingDown, Zap, CheckCircle, XCircle, RefreshCw, Wallet, Activity, Clock, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

const INSTRUMENTS = [
  { id: 'EUR/USD', label: 'EUR/USD', category: 'Forex', decimals: 5, vol: 0.00014, base: 1.08540 },
  { id: 'GBP/USD', label: 'GBP/USD', category: 'Forex', decimals: 5, vol: 0.00016, base: 1.27230 },
  { id: 'USD/JPY', label: 'USD/JPY', category: 'Forex', decimals: 3, vol: 0.012,   base: 149.850 },
  { id: 'AUD/USD', label: 'AUD/USD', category: 'Forex', decimals: 5, vol: 0.00012, base: 0.65430 },
  { id: 'USD/CAD', label: 'USD/CAD', category: 'Forex', decimals: 5, vol: 0.00013, base: 1.36420 },
  { id: 'EUR/JPY', label: 'EUR/JPY', category: 'Forex', decimals: 3, vol: 0.015,   base: 162.540 },
  { id: 'BTC/USDT', label: 'BTC/USDT', category: 'Crypto', decimals: 1, vol: 22.0,  base: 67450.0 },
  { id: 'ETH/USDT', label: 'ETH/USDT', category: 'Crypto', decimals: 2, vol: 1.2,   base: 3250.0  },
  { id: 'SOL/USDT', label: 'SOL/USDT', category: 'Crypto', decimals: 3, vol: 0.18,  base: 148.50  },
  { id: 'BNB/USDT', label: 'BNB/USDT', category: 'Crypto', decimals: 2, vol: 0.28,  base: 410.00  },
];
const INST_MAP = Object.fromEntries(INSTRUMENTS.map(i => [i.id, i]));
const BASE_PRICES = Object.fromEntries(INSTRUMENTS.map(i => [i.id, i.base]));

const SEED_24H: Record<string, number> = {
  'EUR/USD': 0.32, 'GBP/USD': -0.18, 'USD/JPY': 0.54, 'AUD/USD': -0.41,
  'USD/CAD': 0.12, 'EUR/JPY': 0.87, 'BTC/USDT': 2.14, 'ETH/USDT': -1.32,
  'SOL/USDT': 3.45, 'BNB/USDT': 0.78,
};

const DURATIONS = [
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1m' },
  { seconds: 120, label: '2m' },
  { seconds: 300, label: '5m' },
];
const TIMEFRAMES = [
  { minutes: 1, label: '1m' },
  { minutes: 5, label: '5m' },
  { minutes: 15, label: '15m' },
  { minutes: 60, label: '1h' },
];

const FAKE_USERS = [
  'Rahul K.', 'Priya S.', 'Amit J.', 'Sneha P.', 'Vikram M.',
  'Anjali R.', 'Deepak T.', 'Sunita B.', 'Rajesh N.', 'Kavya L.',
  'Suresh M.', 'Pooja V.', 'Arjun R.', 'Meera K.', 'Rohit S.',
  'Divya T.', 'Karan B.', 'Nisha R.', 'Anil P.', 'Ritu M.',
];
const FAKE_AMTS = [500, 1000, 2000, 2500, 5000, 10000];

function getUserIdFromToken(): number | null {
  try {
    const token = localStorage.getItem('ecm_token');
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1])).id ?? null;
  } catch { return null; }
}

function fmt(price: number, inst: string): string {
  return price.toFixed(INST_MAP[inst]?.decimals ?? 5);
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function generateCandles(instrument: string, count = 120, tfMinutes = 1): CandlestickData[] {
  const base = BASE_PRICES[instrument] ?? 1;
  const vol = (INST_MAP[instrument]?.vol ?? 0.0001) * Math.sqrt(tfMinutes);
  const dec = INST_MAP[instrument]?.decimals ?? 5;
  const nowBucket = Math.floor(Date.now() / (tfMinutes * 60000));
  const bars: CandlestickData[] = [];
  let price = base;
  for (let i = count; i >= 0; i--) {
    const t = ((nowBucket - i) * tfMinutes * 60) as UTCTimestamp;
    const open = price;
    const drift = (Math.random() - 0.49) * vol;
    const noise = Math.abs((Math.random() - 0.5) * vol * 0.5);
    const close = parseFloat((open + drift).toFixed(dec));
    const high = parseFloat((Math.max(open, close) + noise).toFixed(dec));
    const low  = parseFloat((Math.min(open, close) - noise).toFixed(dec));
    bars.push({ time: t, open, high, low, close });
    price = close;
  }
  return bars;
}

function aggregateCandles(bars: CandlestickData[], tfMinutes: number): CandlestickData[] {
  if (tfMinutes === 1) return bars;
  const tfSec = tfMinutes * 60;
  const map = new Map<number, CandlestickData>();
  for (const b of bars) {
    const key = Math.floor((b.time as number) / tfSec) * tfSec;
    const ex = map.get(key);
    if (!ex) map.set(key, { time: key as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close });
    else { ex.high = Math.max(ex.high, b.high); ex.low = Math.min(ex.low, b.low); ex.close = b.close; }
  }
  return Array.from(map.values()).sort((a, b) => (a.time as number) - (b.time as number));
}

function getLastAggBar(bars: CandlestickData[], tfMinutes: number): CandlestickData | null {
  if (!bars.length) return null;
  if (tfMinutes === 1) return bars[bars.length - 1];
  const tfSec = tfMinutes * 60;
  const last = bars[bars.length - 1];
  const bucketStart = Math.floor((last.time as number) / tfSec) * tfSec;
  let open = 0, high = -Infinity, low = Infinity, close = 0;
  let first = true;
  for (const b of bars) {
    if ((b.time as number) < bucketStart) continue;
    if (first) { open = b.open; first = false; }
    high = Math.max(high, b.high);
    low  = Math.min(low, b.low);
    close = b.close;
  }
  return { time: bucketStart as UTCTimestamp, open, high, low, close };
}

interface ActiveTrade {
  id: number; instrument: string; direction: string; entryPrice: number;
  amount: number; duration: number; payoutPct: number; openedAt: string; endsAt: number;
}
interface FeedEntry {
  key: string; user: string; instrument: string; amount: number;
  direction: 'call' | 'put'; status: string; ts: number;
}
interface SettledResult {
  tradeId: number; instrument: string; direction: string; entryPrice: number;
  exitPrice: number; amount: number; profit: number; payout: number; status: string; payoutPct: number;
}

export function BinaryTrading() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: dashboard } = useGetDashboard({ ...getAuthOptions(), query: { staleTime: 0 } });
  const balance = dashboard?.totalBalance ?? 0;

  const [instrument, setInstrument] = useState('BTC/USDT');
  const [timeframe, setTimeframe] = useState(1);
  const [duration, setDuration] = useState(60);
  const [amount, setAmount] = useState('1000');
  const [placing, setPlacing] = useState(false);
  const [payoutPct, setPayoutPct] = useState(90);
  const [connected, setConnected] = useState(false);
  const [prices, setPrices] = useState<Record<string, number>>(BASE_PRICES);
  const [priceDir, setPriceDir] = useState<Record<string, 'up' | 'down'>>({});
  const [activeTrades, setActiveTrades] = useState<ActiveTrade[]>([]);
  const [result, setResult] = useState<SettledResult | null>(null);
  const [liveFeed, setLiveFeed] = useState<FeedEntry[]>([]);
  const [tick, setTick] = useState(0);

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const minuteCandles = useRef<Record<string, CandlestickData[]>>({});
  const tfRef = useRef(1);
  const instRef = useRef('BTC/USDT');
  const prevPrices = useRef<Record<string, number>>({ ...BASE_PRICES });

  const token = localStorage.getItem('ecm_token');
  const userId = getUserIdFromToken();
  const authHdr = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => { tfRef.current = timeframe; }, [timeframe]);
  useEffect(() => { instRef.current = instrument; }, [instrument]);

  const ensureCandles = useCallback((inst: string) => {
    if (!minuteCandles.current[inst]) {
      minuteCandles.current[inst] = generateCandles(inst, 120, 1);
    }
  }, []);

  useEffect(() => {
    fetch('/api/binary/settings', { headers: authHdr })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPayoutPct(d.payoutPct ?? 90); })
      .catch(() => {});

    fetch('/api/binary/active', { headers: authHdr })
      .then(r => r.ok ? r.json() : [])
      .then((trades: any[]) => setActiveTrades(trades.map(t => ({ ...t, endsAt: new Date(t.openedAt).getTime() + t.duration * 1000 }))))
      .catch(() => {});

    fetch('/api/binary/recent', { headers: authHdr })
      .then(r => r.ok ? r.json() : [])
      .then((trades: any[]) => {
        const entries: FeedEntry[] = trades.map(t => ({
          key: `real-${t.id}`, user: t.user, instrument: t.instrument,
          amount: t.amount, direction: t.direction, status: t.status,
          ts: new Date(t.openedAt).getTime(),
        }));
        setLiveFeed(entries);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const instruments = INSTRUMENTS.map(i => i.id);
      const entry: FeedEntry = {
        key: `sim-${Date.now()}-${Math.random()}`,
        user: rand(FAKE_USERS),
        instrument: rand(instruments),
        amount: rand(FAKE_AMTS),
        direction: Math.random() > 0.5 ? 'call' : 'put',
        status: 'pending',
        ts: Date.now(),
      };
      setLiveFeed(prev => [entry, ...prev].slice(0, 25));
    }, 2200 + Math.random() * 1800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = createChart(chartRef.current, {
      layout: { background: { color: '#050810' }, textColor: '#6B7280' },
      grid: { vertLines: { color: '#111827' }, horzLines: { color: '#111827' } },
      crosshair: { mode: 1 },
      rightPriceScale: { borderColor: '#1F2937', scaleMargins: { top: 0.1, bottom: 0.1 } },
      timeScale: { borderColor: '#1F2937', timeVisible: true, secondsVisible: false },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight || 360,
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#02C076', downColor: '#CF304A',
      borderUpColor: '#02C076', borderDownColor: '#CF304A',
      wickUpColor: '#02C076', wickDownColor: '#CF304A',
    });
    chartInstance.current = chart;
    seriesRef.current = series;

    ensureCandles(instRef.current);
    const data = aggregateCandles(minuteCandles.current[instRef.current], tfRef.current);
    series.setData(data);

    const ro = new ResizeObserver(() => {
      if (chartRef.current) chart.applyOptions({ width: chartRef.current.clientWidth, height: chartRef.current.clientHeight });
    });
    if (chartRef.current.parentElement) ro.observe(chartRef.current.parentElement);

    return () => { ro.disconnect(); chart.remove(); chartInstance.current = null; seriesRef.current = null; };
  }, []);

  useEffect(() => {
    if (!seriesRef.current) return;
    ensureCandles(instrument);
    const data = aggregateCandles(minuteCandles.current[instrument], timeframe);
    seriesRef.current.setData(data);
  }, [instrument, timeframe]);

  useEffect(() => {
    const socket = connectSocket(window.location.origin, {
      path: '/api/socket.io',
      auth: { userId },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('price:tick', (d: { instrument: string; price: number; open: number; high: number; low: number; time: number }) => {
      const { instrument: inst, price, open, high, low, time } = d;

      setPrices(prev => {
        const old = prev[inst] ?? price;
        setPriceDir(pd => ({ ...pd, [inst]: price >= old ? 'up' : 'down' }));
        prevPrices.current[inst] = old;
        return { ...prev, [inst]: price };
      });

      const bar: CandlestickData = { time: time as UTCTimestamp, open, high, low, close: price };
      ensureCandles(inst);
      const candles = minuteCandles.current[inst];
      const last = candles[candles.length - 1];
      if (last && (last.time as number) === (bar.time as number)) candles[candles.length - 1] = bar;
      else { candles.push(bar); if (candles.length > 720) candles.shift(); }

      if (inst === instRef.current && seriesRef.current) {
        const aggregated = aggregateCandles(minuteCandles.current[inst], tfRef.current);
        try { seriesRef.current.setData(aggregated); } catch {}
      }
    });

    socket.on('binary:settled', (data: SettledResult) => {
      setResult(data);
      setActiveTrades(prev => prev.filter(t => t.id !== data.tradeId));
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
      const won = data.status === 'won', push = data.status === 'push';
      toast({
        title: push ? '↔ Refunded' : won ? '🎉 Trade Won!' : '❌ Trade Lost',
        description: push ? `₹${data.amount.toLocaleString('en-IN')} refunded`
          : won ? `+₹${data.profit.toLocaleString('en-IN', { maximumFractionDigits: 2 })} profit`
          : `−₹${data.amount.toLocaleString('en-IN')} lost`,
        variant: won || push ? 'default' : 'destructive',
      });
    });

    return () => { socket.disconnect(); };
  }, [userId]);

  const handlePlace = async (dir: 'call' | 'put') => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { toast({ title: 'Minimum ₹100', variant: 'destructive' }); return; }
    if (amt > balance) { toast({ title: 'Insufficient balance', variant: 'destructive' }); return; }
    setPlacing(true);
    try {
      const res = await fetch('/api/binary/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr },
        body: JSON.stringify({ instrument, direction: dir, amount: amt, duration }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.message || 'Trade failed', variant: 'destructive' }); return; }
      setActiveTrades(prev => [...prev, { ...data, endsAt: Date.now() + duration * 1000 }]);
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
      const myFeed: FeedEntry = {
        key: `my-${data.id}`, user: 'You', instrument,
        amount: amt, direction: dir, status: 'pending', ts: Date.now(),
      };
      setLiveFeed(prev => [myFeed, ...prev].slice(0, 25));
      toast({ title: `${dir === 'call' ? '↑ Higher' : '↓ Lower'} trade placed`, description: `₹${amt.toLocaleString('en-IN')} · ${DURATIONS.find(d => d.seconds === duration)?.label}` });
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally { setPlacing(false); }
  };

  const instInfo = INST_MAP[instrument]!;
  const livePrice = prices[instrument] ?? instInfo.base;
  const dir24 = SEED_24H[instrument] ?? 0;
  const priceDirCurrent = priceDir[instrument] ?? 'up';
  const amtNum = parseFloat(amount) || 0;

  const forex = INSTRUMENTS.filter(i => i.category === 'Forex');
  const crypto = INSTRUMENTS.filter(i => i.category === 'Crypto');

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 90px)' }}>
        {/* Header Bar */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#FFB800]" />
              <span className="text-lg font-black text-white tracking-tight">Binary Terminal</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(255,184,0,0.08)', border: '1px solid rgba(255,184,0,0.15)' }}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#02C076] animate-pulse' : 'bg-[#CF304A]'}`} />
              <span className={connected ? 'text-[#02C076]' : 'text-[#CF304A]'}>{connected ? 'Live' : 'Connecting'}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-white font-bold">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
            </span>
            <span className="text-[#1F2937]">|</span>
            <span className="text-[#FFB800] font-black text-sm">{payoutPct}% Payout</span>
          </div>
        </div>

        {/* 3-Column Terminal */}
        <div className="flex gap-2 flex-1 min-h-0">
          {/* LEFT: Asset Sidebar */}
          <div className="w-[175px] flex-shrink-0 flex flex-col gap-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            {[['Forex', forex], ['Crypto', crypto]].map(([cat, items]) => (
              <div key={cat as string}>
                <p className="text-[9px] font-black text-[#374151] uppercase tracking-[0.15em] px-2 py-1.5">{cat as string}</p>
                {(items as typeof INSTRUMENTS).map(inst => {
                  const p = prices[inst.id] ?? inst.base;
                  const ch = SEED_24H[inst.id] ?? 0;
                  const isActive = instrument === inst.id;
                  const pd = priceDir[inst.id] ?? 'up';
                  return (
                    <button
                      key={inst.id}
                      onClick={() => setInstrument(inst.id)}
                      className="w-full text-left px-2.5 py-2 rounded-xl transition-all mb-0.5"
                      style={{
                        background: isActive ? 'rgba(255,184,0,0.10)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isActive ? 'rgba(255,184,0,0.30)' : 'rgba(255,255,255,0.04)'}`,
                      }}
                    >
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-black ${isActive ? 'text-[#FFB800]' : 'text-[#9CA3AF]'}`}>{inst.label}</span>
                        <span className={`text-[9px] font-bold ${pd === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                          {pd === 'up' ? '▲' : '▼'}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <span className="text-[10px] font-mono text-white leading-tight">{p.toFixed(inst.decimals)}</span>
                        <span className={`text-[9px] font-bold ${ch >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                          {ch >= 0 ? '+' : ''}{ch.toFixed(2)}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* CENTER: Chart + Feed */}
          <div className="flex-1 flex flex-col gap-2 min-w-0 min-h-0">
            {/* Chart Card */}
            <div className="flex-1 flex flex-col rounded-2xl overflow-hidden min-h-0" style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)' }}>
              {/* Chart Header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-3">
                  <span className="text-white font-black text-base tracking-tight">{instrument}</span>
                  <span className={`text-xl font-black font-mono tabular-nums ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                    {fmt(livePrice, instrument)}
                  </span>
                  <span className={`text-xs font-bold ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                    {priceDirCurrent === 'up' ? '▲' : '▼'} {dir24 >= 0 ? '+' : ''}{dir24.toFixed(2)}%
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.minutes}
                      onClick={() => setTimeframe(tf.minutes)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: timeframe === tf.minutes ? '#FFB800' : 'rgba(255,255,255,0.04)',
                        color: timeframe === tf.minutes ? '#000' : '#6B7280',
                      }}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div ref={chartRef} className="flex-1 w-full" style={{ minHeight: 0 }} />
            </div>

            {/* Active Trades Strip */}
            {activeTrades.length > 0 && (
              <div className="flex-shrink-0 rounded-xl px-3 py-2 flex gap-2 overflow-x-auto" style={{ background: 'rgba(255,184,0,0.05)', border: '1px solid rgba(255,184,0,0.15)' }}>
                {activeTrades.map(trade => {
                  const remaining = Math.max(0, Math.ceil((trade.endsAt - Date.now()) / 1000));
                  const pct = Math.min(((trade.duration - remaining) / trade.duration) * 100, 100);
                  const cp = prices[trade.instrument] ?? trade.entryPrice;
                  const winning = trade.direction === 'call' ? cp > trade.entryPrice : cp < trade.entryPrice;
                  return (
                    <div key={trade.id} className="flex-shrink-0 rounded-xl px-3 py-2 min-w-[200px]" style={{ background: 'rgba(0,0,0,0.4)', border: `1px solid ${winning ? 'rgba(2,192,118,0.3)' : 'rgba(207,48,74,0.3)'}` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${trade.direction === 'call' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                          {trade.direction === 'call' ? '↑ CALL' : '↓ PUT'}
                        </span>
                        <span className="text-[10px] font-black text-[#FFB800] flex items-center gap-1">
                          <Clock className="w-3 h-3" />{remaining}s
                        </span>
                      </div>
                      <div className="text-xs text-[#848E9C]">{trade.instrument} · ₹{trade.amount.toLocaleString('en-IN')}</div>
                      <div className="mt-1.5 h-1 rounded-full bg-[#1F2937] overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${winning ? 'bg-[#02C076]' : 'bg-[#CF304A]'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Live Feed */}
            <div className="flex-shrink-0 rounded-2xl overflow-hidden" style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', maxHeight: '180px' }}>
              <div className="flex items-center gap-2 px-4 py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <Users className="w-3.5 h-3.5 text-[#FFB800]" />
                <span className="text-xs font-black text-[#EAECEF] uppercase tracking-wide">Live Trades</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#02C076] animate-pulse ml-1" />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '140px', scrollbarWidth: 'none' }}>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#374151]" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <th className="px-4 py-1.5 text-left font-semibold">Trader</th>
                      <th className="px-2 py-1.5 text-left font-semibold">Pair</th>
                      <th className="px-2 py-1.5 text-right font-semibold">Amount</th>
                      <th className="px-2 py-1.5 text-center font-semibold">Direction</th>
                      <th className="px-4 py-1.5 text-right font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveFeed.slice(0, 15).map(entry => (
                      <tr key={entry.key} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td className="px-4 py-1.5 font-bold text-[#9CA3AF]">{entry.user}</td>
                        <td className="px-2 py-1.5 font-bold text-white">{entry.instrument}</td>
                        <td className="px-2 py-1.5 text-right text-[#9CA3AF]">₹{entry.amount.toLocaleString('en-IN')}</td>
                        <td className="px-2 py-1.5 text-center">
                          <span className={`font-black ${entry.direction === 'call' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                            {entry.direction === 'call' ? '↑ Higher' : '↓ Lower'}
                          </span>
                        </td>
                        <td className="px-4 py-1.5 text-right">
                          {entry.status === 'pending' && <span className="text-[#FFB800] font-bold flex items-center justify-end gap-1"><RefreshCw className="w-2.5 h-2.5 animate-spin" />Pending</span>}
                          {entry.status === 'won' && <span className="text-[#02C076] font-bold flex items-center justify-end gap-1"><CheckCircle className="w-2.5 h-2.5" />Won</span>}
                          {entry.status === 'lost' && <span className="text-[#CF304A] font-bold flex items-center justify-end gap-1"><XCircle className="w-2.5 h-2.5" />Lost</span>}
                          {entry.status === 'open' && <span className="text-[#FFB800] font-bold flex items-center justify-end gap-1"><Activity className="w-2.5 h-2.5 animate-pulse" />Active</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Trading Panel */}
          <div className="w-[270px] flex-shrink-0 flex flex-col gap-2">
            {result && (
              <div className={`rounded-2xl p-4 text-center flex-shrink-0`} style={{ background: result.status === 'won' ? 'rgba(2,192,118,0.08)' : result.status === 'push' ? 'rgba(43,49,57,0.8)' : 'rgba(207,48,74,0.08)', border: `1px solid ${result.status === 'won' ? 'rgba(2,192,118,0.35)' : result.status === 'push' ? 'rgba(255,255,255,0.08)' : 'rgba(207,48,74,0.35)'}` }}>
                <div className="text-3xl mb-1">{result.status === 'won' ? '🎉' : result.status === 'push' ? '↔' : '❌'}</div>
                <p className={`font-black text-lg ${result.status === 'won' ? 'text-[#02C076]' : result.status === 'push' ? 'text-white' : 'text-[#CF304A]'}`}>
                  {result.status === 'won' ? `+₹${result.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : result.status === 'push' ? 'Push' : `−₹${result.amount.toLocaleString('en-IN')}`}
                </p>
                <p className="text-[10px] text-[#6B7280] mt-1">{fmt(result.entryPrice, result.instrument)} → {fmt(result.exitPrice, result.instrument)}</p>
                <button onClick={() => setResult(null)} className="text-[10px] text-[#4B5563] underline mt-1.5">Dismiss</button>
              </div>
            )}

            {/* Glassmorphism Trading Box */}
            <div className="flex-1 rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'rgba(8, 11, 22, 0.92)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,184,0,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>
              {/* Current Price */}
              <div className="text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-widest mb-0.5">{instrument}</p>
                <p className={`text-2xl font-black font-mono tabular-nums ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                  {fmt(livePrice, instrument)}
                </p>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1.5 block">Investment</label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C] font-bold text-sm">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-white font-bold text-sm focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="1000"
                    min="100"
                  />
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[500, 1000, 5000, 10000].map(v => (
                    <button
                      key={v}
                      onClick={() => setAmount(String(v))}
                      className="py-1.5 rounded-lg text-[10px] font-black transition-all"
                      style={{ background: amount === String(v) ? 'rgba(255,184,0,0.15)' : 'rgba(255,255,255,0.04)', color: amount === String(v) ? '#FFB800' : '#6B7280', border: `1px solid ${amount === String(v) ? 'rgba(255,184,0,0.3)' : 'transparent'}` }}
                    >
                      {v >= 1000 ? `${v / 1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1.5 block">Expiry</label>
                <div className="grid grid-cols-4 gap-1">
                  {DURATIONS.map(d => (
                    <button
                      key={d.seconds}
                      onClick={() => setDuration(d.seconds)}
                      className="py-2 rounded-xl text-xs font-black transition-all"
                      style={{ background: duration === d.seconds ? '#FFB800' : 'rgba(255,255,255,0.04)', color: duration === d.seconds ? '#000' : '#6B7280' }}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payout Info */}
              <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.12)' }}>
                <div>
                  <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">Payout</p>
                  <p className="text-xl font-black text-[#FFB800]">{payoutPct}%</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">Win Return</p>
                  <p className="text-sm font-black text-[#02C076]">₹{(amtNum * (1 + payoutPct / 100)).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>

              {/* Call / Put Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  onClick={() => handlePlace('call')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1.5 py-4 rounded-2xl font-black text-white text-sm transition-all disabled:opacity-50 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #02C076 0%, #018a53 100%)', boxShadow: placing ? 'none' : '0 0 24px rgba(2,192,118,0.55), 0 0 48px rgba(2,192,118,0.25)', border: '1px solid rgba(2,192,118,0.4)' }}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>Higher</span>
                  <span className="text-[10px] font-semibold opacity-80">↑ CALL</span>
                </button>
                <button
                  onClick={() => handlePlace('put')}
                  disabled={placing}
                  className="flex flex-col items-center gap-1.5 py-4 rounded-2xl font-black text-white text-sm transition-all disabled:opacity-50 active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #CF304A 0%, #a01f36 100%)', boxShadow: placing ? 'none' : '0 0 24px rgba(207,48,74,0.55), 0 0 48px rgba(207,48,74,0.25)', border: '1px solid rgba(207,48,74,0.4)' }}
                >
                  <TrendingDown className="w-5 h-5" />
                  <span>Lower</span>
                  <span className="text-[10px] font-semibold opacity-80">↓ PUT</span>
                </button>
              </div>

              {/* Balance Footer */}
              <div className="text-center pt-1">
                <p className="text-[10px] text-[#4B5563] font-semibold">Balance: <span className="text-white font-black">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
