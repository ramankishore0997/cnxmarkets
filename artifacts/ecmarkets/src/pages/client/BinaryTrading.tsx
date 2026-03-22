import { useEffect, useRef, useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { io as connectSocket, type Socket } from 'socket.io-client';
import {
  createChart, CandlestickSeries,
  type IChartApi, type ISeriesApi, type CandlestickData, type UTCTimestamp,
} from 'lightweight-charts';
import { useGetDashboard } from '@workspace/api-client-react';
import { getAuthOptions } from '@/lib/api-utils';
import { TrendingUp, TrendingDown, Zap, RefreshCw, Wallet, Activity, Clock, History, Flame, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

/* ─── Instruments ─────────────────────────────────────────────── */
const INSTRUMENTS = [
  { id: 'BTC/USDT',   label: 'BTC/USDT',   decimals: 1, vol: 22.0,       base: 67450.0    },
  { id: 'ETH/USDT',   label: 'ETH/USDT',   decimals: 2, vol: 1.2,        base: 3250.0     },
  { id: 'SOL/USDT',   label: 'SOL/USDT',   decimals: 3, vol: 0.18,       base: 148.50     },
  { id: 'BNB/USDT',   label: 'BNB/USDT',   decimals: 2, vol: 0.28,       base: 410.00     },
  { id: 'XRP/USDT',   label: 'XRP/USDT',   decimals: 4, vol: 0.003,      base: 0.5280     },
  { id: 'DOGE/USDT',  label: 'DOGE/USDT',  decimals: 5, vol: 0.0004,     base: 0.16200    },
  { id: 'ADA/USDT',   label: 'ADA/USDT',   decimals: 4, vol: 0.002,      base: 0.4650     },
  { id: 'AVAX/USDT',  label: 'AVAX/USDT',  decimals: 3, vol: 0.08,       base: 38.500     },
  { id: 'MATIC/USDT', label: 'MATIC/USDT', decimals: 4, vol: 0.0012,     base: 0.8750     },
  { id: 'DOT/USDT',   label: 'DOT/USDT',   decimals: 3, vol: 0.025,      base: 7.850      },
  { id: 'LINK/USDT',  label: 'LINK/USDT',  decimals: 3, vol: 0.045,      base: 14.200     },
  { id: 'LTC/USDT',   label: 'LTC/USDT',   decimals: 2, vol: 0.35,       base: 82.50      },
  { id: 'TRX/USDT',   label: 'TRX/USDT',   decimals: 5, vol: 0.0005,     base: 0.11800    },
  { id: 'SHIB/USDT',  label: 'SHIB/USDT',  decimals: 8, vol: 0.0000003,  base: 0.00002450 },
];
const INST_MAP   = Object.fromEntries(INSTRUMENTS.map(i => [i.id, i]));
const BASE_PRICES = Object.fromEntries(INSTRUMENTS.map(i => [i.id, i.base]));

const BINANCE_SYMBOL: Record<string, string> = {
  'BTC/USDT':'btcusdt','ETH/USDT':'ethusdt','SOL/USDT':'solusdt',
  'BNB/USDT':'bnbusdt','XRP/USDT':'xrpusdt','DOGE/USDT':'dogeusdt',
  'ADA/USDT':'adausdt','AVAX/USDT':'avaxusdt','MATIC/USDT':'maticusdt',
  'DOT/USDT':'dotusdt','LINK/USDT':'linkusdt','LTC/USDT':'ltcusdt',
  'TRX/USDT':'trxusdt','SHIB/USDT':'shibusdt',
};
const BINANCE_TO_INST: Record<string, string> = Object.fromEntries(
  Object.entries(BINANCE_SYMBOL).map(([k, v]) => [v, k])
);

const TIMEFRAMES = [
  { id: '15s',  label: '15s',  bucketSec: 15   },
  { id: '30s',  label: '30s',  bucketSec: 30   },
  { id: '1m',   label: '1m',   bucketSec: 60,  binanceInterval: '1m'  },
  { id: '5m',   label: '5m',   bucketSec: 300, binanceInterval: '5m'  },
  { id: '15m',  label: '15m',  bucketSec: 900, binanceInterval: '15m' },
  { id: '1h',   label: '1h',   bucketSec: 3600,binanceInterval: '1h'  },
];
const TF_MAP = Object.fromEntries(TIMEFRAMES.map(t => [t.id, t]));

const SEED_24H: Record<string, number> = {
  'BTC/USDT':2.14,'ETH/USDT':-1.32,'SOL/USDT':3.45,'BNB/USDT':0.78,
  'XRP/USDT':1.95,'DOGE/USDT':4.21,'ADA/USDT':-0.87,'AVAX/USDT':2.63,
  'MATIC/USDT':1.14,'DOT/USDT':-1.55,'LINK/USDT':3.82,'LTC/USDT':0.44,
  'TRX/USDT':1.27,'SHIB/USDT':5.33,
};
const DURATIONS = [
  { seconds: 30, label: '30s' },
  { seconds: 60, label: '1m'  },
  { seconds: 120,label: '2m'  },
  { seconds: 300,label: '5m'  },
];
/* ─── Helpers ─────────────────────────────────────────────────── */
function getUserIdFromToken(): number | null {
  try { return JSON.parse(atob(localStorage.getItem('ecm_token')!.split('.')[1])).id ?? null; } catch { return null; }
}
function fmt(price: number | null | undefined, inst: string) {
  const dec = INST_MAP[inst]?.decimals ?? 2;
  return (price ?? 0).toFixed(Math.min(dec, 6));
}
function generateCandles(inst: string, count = 200, bucketSec = 60): CandlestickData[] {
  const base = BASE_PRICES[inst] ?? 1;
  const vol  = (INST_MAP[inst]?.vol ?? 0.001) * Math.sqrt(bucketSec / 60);
  const dec  = INST_MAP[inst]?.decimals ?? 2;
  const nowBucket = Math.floor(Date.now() / (bucketSec * 1000));
  const bars: CandlestickData[] = [];
  let price = base;
  for (let i = count; i >= 0; i--) {
    const t = ((nowBucket - i) * bucketSec) as UTCTimestamp;
    const open  = price;
    const drift = (Math.random() - 0.49) * vol;
    const noise = Math.abs((Math.random() - 0.5) * vol * 0.5);
    const close = parseFloat((open + drift).toFixed(dec));
    const high  = parseFloat((Math.max(open,close) + noise).toFixed(dec));
    const low   = parseFloat((Math.min(open,close) - noise).toFixed(dec));
    bars.push({ time: t, open, high, low, close });
    price = close;
  }
  return bars;
}
function subdivideCandles(bars: CandlestickData[], bucketSec: number): CandlestickData[] {
  if (bucketSec >= 60) return bars;
  const subsPerBar = Math.floor(60 / bucketSec);
  const dec = 2;
  const result: CandlestickData[] = [];
  for (const bar of bars) {
    let prev = bar.open;
    const range = bar.high - bar.low;
    for (let i = 0; i < subsPerBar; i++) {
      const t = ((bar.time as number) + i * bucketSec) as UTCTimestamp;
      const isLast = i === subsPerBar - 1;
      const close = isLast ? bar.close : parseFloat((prev + (bar.close - bar.open) / subsPerBar + (Math.random() - 0.5) * range * 0.2).toFixed(dec));
      const high  = parseFloat((Math.max(prev, close) + Math.random() * range * 0.15).toFixed(dec));
      const low   = parseFloat((Math.min(prev, close) - Math.random() * range * 0.15).toFixed(dec));
      result.push({ time: t, open: prev, high, low, close });
      prev = close;
    }
  }
  return result;
}
function aggregateCandlesBucket(bars: CandlestickData[], bucketSec: number): CandlestickData[] {
  const map = new Map<number, CandlestickData>();
  for (const b of bars) {
    const key = Math.floor((b.time as number) / bucketSec) * bucketSec;
    const ex = map.get(key);
    if (!ex) map.set(key, { time: key as UTCTimestamp, open: b.open, high: b.high, low: b.low, close: b.close });
    else { ex.high = Math.max(ex.high, b.high); ex.low = Math.min(ex.low, b.low); ex.close = b.close; }
  }
  return Array.from(map.values()).sort((a, b) => (a.time as number) - (b.time as number));
}

/* ─── Circular Timer ──────────────────────────────────────────── */
function CircularTimer({ totalSec, endsAt, winning }: { totalSec: number; endsAt: number; winning: boolean }) {
  const [rem, setRem] = useState(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => setRem(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))), 100);
    return () => clearInterval(id);
  }, [endsAt]);
  const r = 20, circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.max(0, rem / totalSec));
  const color  = winning ? '#02C076' : '#CF304A';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" style={{ flexShrink: 0 }}>
      <circle cx="26" cy="26" r={r} fill="none" stroke="#1F2937" strokeWidth="4" />
      <circle cx="26" cy="26" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform="rotate(-90 26 26)" style={{ transition: 'stroke-dashoffset 0.1s linear' }} />
      <text x="26" y="30" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{rem}s</text>
    </svg>
  );
}

/* ─── Interfaces ──────────────────────────────────────────────── */
interface ActiveTrade {
  id: number; instrument: string; direction: string; entryPrice: number;
  amount: number; duration: number; payoutPct: number; openedAt: string; endsAt: number;
}
interface HistEntry {
  id: number; instrument: string; direction: string; entryPrice: number;
  exitPrice: number; amount: number; profit: number; status: string; payoutPct: number; openedAt: string;
}
interface SettledResult {
  tradeId: number; instrument: string; direction: string; entryPrice: number;
  exitPrice: number; amount: number; profit: number; payout: number; status: string; payoutPct: number;
}

/* ─── Main Component ──────────────────────────────────────────── */
export function BinaryTrading() {
  const { toast }        = useToast();
  const queryClient      = useQueryClient();
  const { data: dashboard } = useGetDashboard(getAuthOptions());
  const balance          = dashboard?.totalBalance ?? 0;

  /* chart state */
  const [instrument, setInstrument] = useState('BTC/USDT');
  const [tfId,       setTfId]       = useState('1m');
  const [prices,     setPrices]     = useState<Record<string,number>>({ ...BASE_PRICES });
  const [priceDir,   setPriceDir]   = useState<Record<string,'up'|'down'>>({});
  const [binanceLive, setBinanceLive] = useState(false);

  /* trade state */
  const [amount,      setAmount]      = useState('1000');
  const [duration,    setDuration]    = useState(60);
  const [placing,     setPlacing]     = useState(false);
  const [payoutPct,   setPayoutPct]   = useState(90);
  const [activeTrades,setActiveTrades]= useState<ActiveTrade[]>([]);
  const [result,      setResult]      = useState<SettledResult|null>(null);
  const [myHistory,   setMyHistory]   = useState<HistEntry[]>([]);
  const [connected,   setConnected]   = useState(false);

  /* engagement */
  const [hotPairs,    setHotPairs]    = useState<string[]>(['BTC/USDT','SOL/USDT','DOGE/USDT']);
  const [moodCall,    setMoodCall]    = useState<Record<string,number>>({});
  const [aiSignal,    setAiSignal]    = useState<Record<string,'call'|'put'|'neutral'>>({});
  const [callHov,     setCallHov]     = useState(false);
  const [callPress,   setCallPress]   = useState(false);
  const [putHov,      setPutHov]      = useState(false);
  const [putPress,    setPutPress]    = useState(false);
  const [mobileTab,   setMobileTab]   = useState<'chart'|'history'>('chart');

  /* refs */
  const chartRef       = useRef<HTMLDivElement>(null);
  const chartInstance  = useRef<IChartApi|null>(null);
  const seriesRef      = useRef<ISeriesApi<'Candlestick'>|null>(null);
  const socketRef      = useRef<Socket|null>(null);
  const minuteCandles  = useRef<Record<string,CandlestickData[]>>({});
  const pricesRef      = useRef<Record<string,number>>({ ...BASE_PRICES });
  const instRef        = useRef('BTC/USDT');
  const tfRef          = useRef('1m');
  const priceLineRef   = useRef<any>(null);
  const entryLinesRef  = useRef<Map<number,any>>(new Map());
  const binanceWsRef   = useRef<WebSocket|null>(null);
  const binanceOHLC    = useRef<Record<string,{ open:number;high:number;low:number;close:number;bucketMs:number }>>({});
  const binanceLiveRef = useRef<Record<string,boolean>>({});
  const tfBucketRef    = useRef(60);

  const token  = localStorage.getItem('ecm_token');
  const userId = getUserIdFromToken();
  const authHdr = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => { instRef.current  = instrument; }, [instrument]);
  useEffect(() => { tfRef.current    = tfId; tfBucketRef.current = TF_MAP[tfId]?.bucketSec ?? 60; }, [tfId]);
  useEffect(() => { pricesRef.current = prices; }, [prices]);

  const ensureCandles = useCallback((inst: string) => {
    if (!minuteCandles.current[inst]) {
      minuteCandles.current[inst] = generateCandles(inst, 200, 60);
    }
  }, []);

  /* ── Initial data fetch ── */
  useEffect(() => {
    fetch('/api/binary/settings', { headers: authHdr }).then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setPayoutPct(d.payoutPct ?? 90); }).catch(() => {});
    fetch('/api/binary/active', { headers: authHdr }).then(r => r.ok ? r.json() : [])
      .then((t: any[]) => setActiveTrades(t.map(tr => ({ ...tr, endsAt: new Date(tr.openedAt).getTime() + tr.duration * 1000 }))))
      .catch(() => {});
    fetch('/api/binary/history?limit=30', { headers: authHdr }).then(r => r.ok ? r.json() : null)
      .then((d: any) => { if (d?.trades) setMyHistory(d.trades.slice(0, 30)); }).catch(() => {});
  }, []);

  /* ── Hot pairs rotation ── */
  useEffect(() => {
    const update = () => {
      const shuffled = [...INSTRUMENTS].sort(() => Math.random() - 0.5);
      setHotPairs(shuffled.slice(0, 4).map(i => i.id));
    };
    update();
    const id = setInterval(update, 25000);
    return () => clearInterval(id);
  }, []);

  /* ── Market mood + AI signal ── */
  useEffect(() => {
    const update = () => {
      const mood: Record<string,number> = {};
      const sig:  Record<string,'call'|'put'|'neutral'> = {};
      for (const inst of INSTRUMENTS) {
        const base = 45 + Math.random() * 30;
        mood[inst.id] = Math.round(base);
        const ch = SEED_24H[inst.id] ?? 0;
        sig[inst.id] = Math.abs(ch) < 0.5 ? 'neutral' : ch > 0 ? 'call' : 'put';
      }
      setMoodCall(mood);
      setAiSignal(sig);
    };
    update();
    const id = setInterval(update, 8000);
    return () => clearInterval(id);
  }, []);

  /* ── Chart creation ── */
  useEffect(() => {
    if (!chartRef.current) return;
    let chart: IChartApi | null = null;
    try {
      chart = createChart(chartRef.current, {
        layout: { background: { color: '#050810' }, textColor: '#6B7280' },
        grid:   { vertLines: { color: '#111827' }, horzLines: { color: '#111827' } },
        crosshair: { mode: 1 },
        rightPriceScale: { borderColor: '#1F2937', scaleMargins: { top: 0.1, bottom: 0.1 } },
        timeScale: { borderColor: '#1F2937', timeVisible: true, secondsVisible: true },
        autoSize: true,
      });
      const series = chart.addSeries(CandlestickSeries, {
        upColor: '#02C076', downColor: '#CF304A',
        borderUpColor: '#02C076', borderDownColor: '#CF304A',
        wickUpColor: '#02C076', wickDownColor: '#CF304A',
      });
      chartInstance.current = chart;
      seriesRef.current = series;
      ensureCandles(instRef.current);
      const data = aggregateCandlesBucket(minuteCandles.current[instRef.current] ?? [], TF_MAP[tfRef.current]?.bucketSec ?? 60);
      try { series.setData(data); } catch {}
      const initPrice = BASE_PRICES[instRef.current] ?? 1;
      try {
        const pl = series.createPriceLine({ price: initPrice, color: '#00C274', lineWidth: 1, lineStyle: 2, axisLabelVisible: true, title: 'Live' });
        priceLineRef.current = pl;
      } catch {}
    } catch (err) {
      console.error('[Chart] Init failed:', err);
    }
    return () => {
      priceLineRef.current = null;
      entryLinesRef.current.clear();
      try { chart?.remove(); } catch {}
      chartInstance.current = null;
      seriesRef.current = null;
    };
  }, []);

  /* ── Chart data refresh on instrument/timeframe change ── */
  useEffect(() => {
    if (!seriesRef.current) return;
    ensureCandles(instrument);
    const bSec = TF_MAP[tfId]?.bucketSec ?? 60;
    let data: CandlestickData[];
    if (bSec < 60) {
      data = subdivideCandles(minuteCandles.current[instrument], bSec);
    } else {
      data = aggregateCandlesBucket(minuteCandles.current[instrument], bSec);
    }
    try { seriesRef.current.setData(data); } catch {}
    const cp = pricesRef.current[instrument] ?? BASE_PRICES[instrument] ?? 1;
    if (priceLineRef.current) { try { priceLineRef.current.applyOptions({ price: cp }); } catch {} }
    entryLinesRef.current.forEach(line => { try { seriesRef.current?.removePriceLine(line); } catch {} });
    entryLinesRef.current.clear();
  }, [instrument, tfId]);

  /* ── Klines fetch from Binance ── */
  useEffect(() => {
    const sym  = BINANCE_SYMBOL[instrument];
    if (!sym) return;
    const bSec = TF_MAP[tfId]?.bucketSec ?? 60;
    const controller = new AbortController();
    const binInterval = bSec < 60 ? '1m' : (TF_MAP[tfId]?.binanceInterval ?? '1m');
    const fetchCount  = bSec < 60 ? 200 : 200;
    const dec = INST_MAP[instrument]?.decimals ?? 2;
    fetch(`https://api.binance.com/api/v3/klines?symbol=${sym.toUpperCase()}&interval=${binInterval}&limit=${fetchCount}`, { signal: controller.signal })
      .then(r => r.ok ? r.json() : null)
      .then((data: any) => {
        if (!Array.isArray(data) || data.length === 0) return;
        let bars: CandlestickData[] = data.map((k: any) => ({
          time:  Math.floor(k[0] / 1000) as UTCTimestamp,
          open:  parseFloat(parseFloat(k[1]).toFixed(dec)),
          high:  parseFloat(parseFloat(k[2]).toFixed(dec)),
          low:   parseFloat(parseFloat(k[3]).toFixed(dec)),
          close: parseFloat(parseFloat(k[4]).toFixed(dec)),
        })).filter((k: any) => k.open > 0);
        if (bars.length === 0) return;
        minuteCandles.current[instrument] = bars;
        if (bSec < 60) bars = subdivideCandles(bars, bSec);
        else if (bSec > 60) bars = aggregateCandlesBucket(bars, bSec);
        if (seriesRef.current && instRef.current === instrument) {
          try { seriesRef.current.setData(bars); } catch {}
          const last = bars[bars.length - 1];
          if (last) {
            if (priceLineRef.current) { try { priceLineRef.current.applyOptions({ price: last.close }); } catch {} }
            setPrices(prev => ({ ...prev, [instrument]: last.close }));
            pricesRef.current = { ...pricesRef.current, [instrument]: last.close };
          }
        }
      }).catch(() => {});
    return () => controller.abort();
  }, [instrument, tfId]);

  /* ── Entry lines for active trades ── */
  useEffect(() => {
    if (!seriesRef.current) return;
    const series = seriesRef.current;
    const existingIds = new Set(entryLinesRef.current.keys());
    activeTrades.forEach(trade => {
      if (trade.instrument !== instrument || entryLinesRef.current.has(trade.id)) return;
      try {
        const line = series.createPriceLine({ price: trade.entryPrice,
          color: trade.direction === 'call' ? '#02C076' : '#CF304A', lineWidth: 1, lineStyle: 1,
          axisLabelVisible: true, title: `Entry ${trade.direction === 'call' ? '↑' : '↓'}` });
        entryLinesRef.current.set(trade.id, line);
      } catch {}
    });
    const activeIds = new Set(activeTrades.filter(t => t.instrument === instrument).map(t => t.id));
    existingIds.forEach(id => {
      if (!activeIds.has(id)) {
        const line = entryLinesRef.current.get(id);
        if (line) { try { series.removePriceLine(line); } catch {} }
        entryLinesRef.current.delete(id);
      }
    });
  }, [activeTrades, instrument]);

  /* ── Binance WebSocket ── */
  useEffect(() => {
    let ws: WebSocket|null = null;
    let reconnTimer: ReturnType<typeof setTimeout>|null = null;

    const applyTick = (streamSym: string, kline: any) => {
      const inst = BINANCE_TO_INST[streamSym];
      if (!inst) return;
      const dec   = INST_MAP[inst]?.decimals ?? 2;
      const price = parseFloat(parseFloat(kline.c).toFixed(dec));
      if (!price || price <= 0) return;
      if (!binanceLiveRef.current[inst]) { binanceLiveRef.current[inst] = true; setBinanceLive(true); }

      const bSec   = tfBucketRef.current;
      const now    = Date.now();
      const bucketMs = bSec < 60
        ? Math.floor(now / (bSec * 1000)) * (bSec * 1000)
        : parseInt(kline.t, 10);
      const barTs  = Math.floor(bucketMs / 1000) as UTCTimestamp;
      const open   = parseFloat(parseFloat(kline.o).toFixed(dec));
      const high   = parseFloat(parseFloat(kline.h).toFixed(dec));
      const low    = parseFloat(parseFloat(kline.l).toFixed(dec));
      const ohlc   = binanceOHLC.current[inst];
      if (!ohlc || ohlc.bucketMs !== bucketMs) {
        binanceOHLC.current[inst] = { open, high, low, close: price, bucketMs };
      } else {
        ohlc.high  = Math.max(ohlc.high, high);
        ohlc.low   = Math.min(ohlc.low, low);
        ohlc.close = price;
      }
      const s   = binanceOHLC.current[inst];
      const bar: CandlestickData = { time: barTs, open: s.open, high: s.high, low: s.low, close: s.close };
      ensureCandles(inst);
      const candles = minuteCandles.current[inst];
      const last = candles[candles.length - 1];
      if (last && (last.time as number) === (barTs as number)) candles[candles.length - 1] = bar;
      else { candles.push(bar); if (candles.length > 1440) candles.shift(); }
      const oldPrice = pricesRef.current[inst] ?? price;
      const dir: 'up' | 'down' = price >= oldPrice ? 'up' : 'down';
      pricesRef.current = { ...pricesRef.current, [inst]: price };
      setPrices(prev => ({ ...prev, [inst]: price }));
      setPriceDir(prev => ({ ...prev, [inst]: dir }));
      if (inst === instRef.current && seriesRef.current) {
        try { seriesRef.current.update(bar); }
        catch { try { seriesRef.current.setData(aggregateCandlesBucket(candles, tfBucketRef.current)); } catch {} }
        if (priceLineRef.current) { try { priceLineRef.current.applyOptions({ price }); } catch {} }
      }
    };

    const streams = Object.values(BINANCE_SYMBOL).map(s => `${s}@kline_1m`).join('/');
    const connect = () => {
      ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      binanceWsRef.current = ws;
      ws.onmessage = (evt: MessageEvent) => {
        try {
          const msg = JSON.parse(evt.data as string);
          if (msg.stream && msg.data?.k) applyTick(msg.stream.split('@')[0], msg.data.k);
        } catch {}
      };
      ws.onerror  = () => {};
      ws.onclose  = () => { binanceWsRef.current = null; reconnTimer = setTimeout(connect, 4000); };
    };
    connect();
    return () => {
      if (reconnTimer) clearTimeout(reconnTimer);
      if (ws) { try { ws.close(); } catch {} }
      binanceWsRef.current = null;
    };
  }, []);

  /* ── Socket.io (settlement) ── */
  useEffect(() => {
    const socket = connectSocket(window.location.origin, {
      path: '/api/socket.io', auth: { userId }, transports: ['websocket','polling'],
    });
    socketRef.current = socket;
    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('price:tick', (d: { instrument: string; price: number; open: number; high: number; low: number; time: number }) => {
      if (binanceLiveRef.current[d.instrument]) return;
      const { instrument: inst, price } = d;
      const oldP = pricesRef.current[inst] ?? price;
      const dir2: 'up'|'down' = price >= oldP ? 'up' : 'down';
      pricesRef.current = { ...pricesRef.current, [inst]: price };
      setPrices(prev => ({ ...prev, [inst]: price }));
      setPriceDir(prev => ({ ...prev, [inst]: dir2 }));
    });
    socket.on('binary:settled', (data: SettledResult) => {
      setResult(data);
      setActiveTrades(prev => prev.filter(t => t.id !== data.tradeId));
      setMyHistory(prev => [{
        id: data.tradeId, instrument: data.instrument, direction: data.direction,
        entryPrice: data.entryPrice, exitPrice: data.exitPrice, amount: data.amount,
        profit: data.profit, status: data.status, payoutPct: data.payoutPct, openedAt: new Date().toISOString(),
      }, ...prev].slice(0, 30));
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
      const won = data.status === 'won', push = data.status === 'push';
      toast({
        title: push ? '↔ Refunded' : won ? '🎉 Trade Won!' : '❌ Trade Lost',
        description: push ? `₹${data.amount.toLocaleString('en-IN')} refunded`
          : won  ? `+₹${data.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })} profit`
          : `−₹${data.amount.toLocaleString('en-IN')} lost`,
        variant: won || push ? 'default' : 'destructive',
      });
    });
    return () => { socket.disconnect(); };
  }, [userId]);

  /* ── Place trade ── */
  const handlePlace = async (dir: 'call'|'put') => {
    const amt = parseFloat(amount);
    if (!amt || amt < 100) { toast({ title: 'Minimum ₹100', variant: 'destructive' }); return; }
    if (amt > balance) { toast({ title: 'Insufficient balance', variant: 'destructive' }); return; }
    setPlacing(true);
    try {
      const res  = await fetch('/api/binary/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHdr },
        body: JSON.stringify({ instrument, direction: dir, amount: amt, duration }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: data.message || 'Trade failed', variant: 'destructive' }); return; }
      setActiveTrades(prev => [...prev, { ...data, endsAt: Date.now() + duration * 1000 }]);
      queryClient.invalidateQueries({ queryKey: ['/api/accounts/dashboard'] });
      toast({ title: `${dir === 'call' ? '↑ Higher' : '↓ Lower'} placed`, description: `₹${amt.toLocaleString('en-IN')} · ${DURATIONS.find(d => d.seconds === duration)?.label}` });
    } catch { toast({ title: 'Network error', variant: 'destructive' }); }
    finally { setPlacing(false); }
  };

  /* ─── Derived values ─────────────────────────────────────────── */
  const livePrice = prices[instrument] ?? INST_MAP[instrument]?.base ?? 0;
  const amtNum    = parseFloat(amount) || 0;
  const priceDirCurrent = priceDir[instrument] ?? 'up';
  const ch24 = SEED_24H[instrument] ?? 0;
  const curMood   = moodCall[instrument] ?? 55;
  const curSignal = aiSignal[instrument] ?? 'neutral';
  const tf        = TF_MAP[tfId];
  const wins      = myHistory.filter(h => h.status === 'won').length;
  const winRate   = myHistory.length > 0 ? Math.round((wins / myHistory.length) * 100) : 0;
  let streak = 0;
  for (const h of myHistory) { if (h.status === 'won') streak++; else break; }

  const activeTradeStatus = (() => {
    if (!activeTrades.length) return 'none';
    const wc = activeTrades.filter(t => {
      const cp = prices[t.instrument] ?? t.entryPrice;
      return t.direction === 'call' ? cp > t.entryPrice : cp < t.entryPrice;
    }).length;
    if (wc === activeTrades.length) return 'winning';
    if (wc === 0) return 'losing';
    return wc >= activeTrades.length / 2 ? 'winning' : 'losing';
  })();

  const screenGlow = activeTradeStatus === 'winning'
    ? '0 0 0 2px rgba(2,192,118,0.5), 0 0 40px rgba(2,192,118,0.15)'
    : activeTradeStatus === 'losing'
    ? '0 0 0 2px rgba(207,48,74,0.5), 0 0 40px rgba(207,48,74,0.15)'
    : 'none';

  /* ─── JSX ────────────────────────────────────────────────────── */
  return (
    <DashboardLayout>
      <div className="flex flex-col binary-terminal-h"
        style={{ borderRadius: 16, boxShadow: screenGlow, transition: 'box-shadow 0.8s ease', gap: 8 }}>

        {/* ── MOBILE: pair chips ── */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-1 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
          {INSTRUMENTS.map(inst => {
            const p  = prices[inst.id] ?? inst.base;
            const ch = SEED_24H[inst.id] ?? 0;
            const isActive = instrument === inst.id;
            const pd = priceDir[inst.id] ?? 'up';
            return (
              <button key={inst.id} onClick={() => setInstrument(inst.id)}
                className="flex-shrink-0 flex flex-col items-start px-3 py-2 rounded-xl transition-all relative"
                style={{ background: isActive ? 'rgba(0,194,116,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${isActive ? 'rgba(0,194,116,0.4)' : 'rgba(255,255,255,0.08)'}`, minWidth: 86 }}>
                {hotPairs.includes(inst.id) && <span className="absolute -top-1 -right-1 text-[9px]">🔥</span>}
                <span className={`text-[11px] font-black leading-tight ${isActive ? 'text-[#00C274]' : 'text-[#C9D1D9]'}`}>{inst.label}</span>
                <span className={`text-[11px] font-mono font-bold leading-tight mt-0.5 ${pd === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{p.toFixed(Math.min(inst.decimals, 4))}</span>
                <span className={`text-[10px] font-bold mt-0.5 ${ch >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{ch >= 0 ? '+' : ''}{ch.toFixed(2)}%</span>
              </button>
            );
          })}
        </div>

        {/* ── MAIN GRID ── */}
        <div className="flex flex-col md:flex-row gap-2 flex-1 min-h-0">

          {/* ── LEFT: Sidebar ── */}
          <div className="hidden md:flex flex-col w-[160px] flex-shrink-0 rounded-2xl overflow-hidden"
            style={{ background: '#080C18', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <p className="text-[9px] font-black text-[#374151] uppercase tracking-[0.18em]">Crypto Pairs</p>
            </div>
            <div className="flex-1 overflow-y-auto p-1.5" style={{ scrollbarWidth: 'none' }}>
              {INSTRUMENTS.map(inst => {
                const p  = prices[inst.id] ?? inst.base;
                const ch = SEED_24H[inst.id] ?? 0;
                const isActive = instrument === inst.id;
                const pd = priceDir[inst.id] ?? 'up';
                const isHot = hotPairs.includes(inst.id);
                return (
                  <button key={inst.id} onClick={() => setInstrument(inst.id)}
                    className="w-full text-left px-2.5 py-2 rounded-xl transition-all mb-0.5 relative"
                    style={{ background: isActive ? 'rgba(0,194,116,0.12)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isActive ? 'rgba(0,194,116,0.35)' : 'rgba(255,255,255,0.04)'}` }}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-black ${isActive ? 'text-[#00C274]' : 'text-[#9CA3AF]'}`}>{inst.label}</span>
                        {isHot && <span className="text-[9px]">🔥</span>}
                      </div>
                      <span className={`text-[9px] font-bold ${pd === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{pd === 'up' ? '▲' : '▼'}</span>
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-[10px] font-mono text-white">{p.toFixed(Math.min(inst.decimals, 5))}</span>
                      <span className={`text-[9px] font-bold ${ch >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{ch >= 0 ? '+' : ''}{ch.toFixed(2)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── CENTER: Chart + Trades + History ── */}
          <div className="flex flex-col gap-2 flex-1 min-w-0 min-h-0">

            {/* Chart Card */}
            <div className="flex flex-col rounded-2xl overflow-hidden flex-1 min-h-0"
              style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', minHeight: 220 }}>

              {/* Chart header */}
              <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0 flex-wrap"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <span className="text-white font-black text-sm tracking-tight">{instrument}</span>
                  <span className={`text-lg font-black font-mono tabular-nums ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                    {fmt(livePrice, instrument)}
                  </span>
                  <span className={`hidden sm:inline text-xs font-bold ${ch24 >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>
                    {ch24 >= 0 ? '+' : ''}{ch24.toFixed(2)}%
                  </span>
                </div>
                {/* 24h mini stats */}
                <div className="hidden lg:flex items-center gap-3 text-[10px] text-[#4B5563] font-semibold">
                  <span>H: <span className="text-[#02C076]">{fmt(livePrice * 1.015, instrument)}</span></span>
                  <span>L: <span className="text-[#CF304A]">{fmt(livePrice * 0.985, instrument)}</span></span>
                  <span>Vol: <span className="text-[#9CA3AF]">{(12400 + Math.random() * 1000).toFixed(0)}</span></span>
                </div>
                {/* Status indicators */}
                <div className="flex items-center gap-1 ml-auto">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                    style={{ background: 'rgba(0,194,116,0.08)', border: '1px solid rgba(0,194,116,0.12)' }}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#02C076] animate-pulse' : 'bg-[#CF304A]'}`} />
                    <span className={connected ? 'text-[#02C076]' : 'text-[#CF304A]'}>{connected ? 'Live' : 'Off'}</span>
                  </div>
                  {binanceLive && (
                    <div className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                      style={{ background: 'rgba(2,192,118,0.08)', border: '1px solid rgba(2,192,118,0.2)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#02C076] animate-pulse" />
                      <span className="text-[#02C076]">Binance</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Signal + Market Mood + Timeframes */}
              <div className="flex items-center gap-2 px-3 py-1.5 flex-shrink-0 flex-wrap"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.01)' }}>
                {/* AI Signal */}
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black"
                  style={{ background: curSignal === 'call' ? 'rgba(2,192,118,0.12)' : curSignal === 'put' ? 'rgba(207,48,74,0.12)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${curSignal === 'call' ? 'rgba(2,192,118,0.3)' : curSignal === 'put' ? 'rgba(207,48,74,0.3)' : 'rgba(255,255,255,0.1)'}` }}>
                  <span className="text-[#6B7280]">AI:</span>
                  <span className={curSignal === 'call' ? 'text-[#02C076]' : curSignal === 'put' ? 'text-[#CF304A]' : 'text-[#9CA3AF]'}>
                    {curSignal === 'call' ? '↑ BULLISH' : curSignal === 'put' ? '↓ BEARISH' : '↔ NEUTRAL'}
                  </span>
                </div>
                {/* Market Mood */}
                <div className="flex items-center gap-1.5 hidden sm:flex">
                  <span className="text-[10px] text-[#6B7280] font-semibold">Mood:</span>
                  <div className="flex rounded-full overflow-hidden" style={{ width: 60, height: 8 }}>
                    <div style={{ width: `${curMood}%`, background: '#02C076' }} />
                    <div style={{ width: `${100 - curMood}%`, background: '#CF304A' }} />
                  </div>
                  <span className="text-[10px] font-black text-[#02C076]">{curMood}%↑</span>
                </div>
                {/* Timeframes */}
                <div className="flex items-center gap-1 ml-auto">
                  {TIMEFRAMES.map(tf2 => (
                    <button key={tf2.id} onClick={() => setTfId(tf2.id)}
                      className="px-2 py-0.5 rounded-md text-[10px] font-black transition-all"
                      style={{ background: tfId === tf2.id ? '#00C274' : 'rgba(255,255,255,0.04)', color: tfId === tf2.id ? '#000' : '#6B7280' }}>
                      {tf2.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart canvas */}
              <div ref={chartRef} className="flex-1 w-full" style={{ minHeight: 260 }} />
            </div>

            {/* Active Trades */}
            {activeTrades.length > 0 && (
              <div className="flex-shrink-0 rounded-xl px-3 py-2 flex gap-2 overflow-x-auto"
                style={{ background: 'rgba(0,194,116,0.04)', border: '1px solid rgba(0,194,116,0.12)', scrollbarWidth: 'none' }}>
                {activeTrades.map(trade => {
                  const cp      = prices[trade.instrument] ?? trade.entryPrice;
                  const winning = trade.direction === 'call' ? cp > trade.entryPrice : cp < trade.entryPrice;
                  const pnl     = winning ? Math.round(trade.amount * (trade.payoutPct / 100)) : -trade.amount;
                  return (
                    <div key={trade.id} className="flex-shrink-0 flex items-center gap-3 rounded-xl px-3 py-2"
                      style={{ minWidth: 230, background: winning ? 'rgba(2,192,118,0.06)' : 'rgba(207,48,74,0.06)', border: `1px solid ${winning ? 'rgba(2,192,118,0.3)' : 'rgba(207,48,74,0.3)'}` }}>
                      <CircularTimer totalSec={trade.duration} endsAt={trade.endsAt} winning={winning} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${trade.direction === 'call' ? 'bg-[#02C076]/20 text-[#02C076]' : 'bg-[#CF304A]/20 text-[#CF304A]'}`}>
                            {trade.direction === 'call' ? '↑ CALL' : '↓ PUT'}
                          </span>
                          <span className={`text-[10px] font-black ${winning ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{winning ? '▲ Win' : '▼ Loss'}</span>
                        </div>
                        <p className="text-[10px] text-[#848E9C]">{trade.instrument} · ₹{trade.amount.toLocaleString('en-IN')}</p>
                        <p className={`text-xs font-black ${winning ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{winning ? '+' : ''}₹{Math.abs(pnl).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Trade History */}
            <div className="hidden md:flex flex-col rounded-2xl overflow-hidden flex-shrink-0"
              style={{ height: 170, background: '#050810', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 px-3 py-2 flex-shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <History className="w-3.5 h-3.5 text-[#00C274]" />
                <span className="text-[11px] font-black text-[#EAECEF] uppercase tracking-wide">My Trade History</span>
                {myHistory.length > 0 && (
                  <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(0,194,116,0.1)', color: '#00C274' }}>{myHistory.length}</span>
                )}
              </div>
              <div className="overflow-y-auto flex-1" style={{ scrollbarWidth: 'none' }}>
                {myHistory.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full gap-1">
                    <Activity className="w-5 h-5 text-[#1F2937]" />
                    <p className="text-[#374151] text-xs">No trades yet</p>
                  </div>
                )}
                {myHistory.map((h, i) => {
                  const won = h.status === 'won', push = h.status === 'push';
                  return (
                    <div key={h.id ?? i} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.02]"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderLeft: `2px solid ${won ? '#02C076' : push ? '#00C274' : '#CF304A'}` }}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-black text-white">{h.instrument}</span>
                          <span className={`text-[9px] font-black ${h.direction === 'call' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{h.direction === 'call' ? '↑ CALL' : '↓ PUT'}</span>
                        </div>
                        <p className="text-[9px] text-[#4B5563]">{fmt(h.entryPrice, h.instrument)} → {fmt(h.exitPrice, h.instrument)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-xs font-black ${won ? 'text-[#02C076]' : push ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                          {won ? `+₹${(h.profit ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : push ? 'Push' : `−₹${(h.amount ?? 0).toLocaleString('en-IN')}`}
                        </p>
                        <span className={`text-[9px] font-black uppercase ${won ? 'text-[#02C076]' : push ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>{h.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Trading Panel ── */}
          <div className="md:w-[272px] flex-shrink-0 flex flex-col gap-2">

            {/* Stats row — desktop: 3 cards, mobile: compact horizontal bar */}
            <div className="hidden md:grid grid-cols-3 gap-1.5 flex-shrink-0">
              <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <Wallet className="w-3 h-3 text-[#6B7280] mx-auto mb-0.5" />
                <p className="text-[9px] text-[#6B7280]">Balance</p>
                <p className="text-[11px] font-black text-white">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
              </div>
              <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: 'rgba(0,194,116,0.06)', border: '1px solid rgba(0,194,116,0.12)' }}>
                <BarChart2 className="w-3 h-3 text-[#00C274] mx-auto mb-0.5" />
                <p className="text-[9px] text-[#6B7280]">Win Rate</p>
                <p className="text-[11px] font-black text-[#00C274]">{winRate}%</p>
              </div>
              <div className="rounded-xl px-2 py-1.5 text-center" style={{ background: streak >= 2 ? 'rgba(255,180,0,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${streak >= 2 ? 'rgba(255,180,0,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
                <Flame className="w-3 h-3 mx-auto mb-0.5" style={{ color: streak >= 2 ? '#F59E0B' : '#374151' }} />
                <p className="text-[9px] text-[#6B7280]">Streak</p>
                <p className="text-[11px] font-black" style={{ color: streak >= 2 ? '#F59E0B' : '#6B7280' }}>{streak}🔥</p>
              </div>
            </div>
            {/* Mobile compact stats bar */}
            <div className="md:hidden flex items-center justify-between px-4 py-2.5 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-[#848E9C]" />
                <div>
                  <p className="text-[9px] text-[#6B7280] leading-none">Balance</p>
                  <p className="text-sm font-black text-white leading-tight">₹{balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                </div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#00C274]" />
                <div>
                  <p className="text-[9px] text-[#6B7280] leading-none">Win Rate</p>
                  <p className="text-sm font-black text-[#00C274] leading-tight">{winRate}%</p>
                </div>
              </div>
              <div className="w-px h-8" style={{ background: 'rgba(255,255,255,0.08)' }} />
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5" style={{ color: streak >= 2 ? '#F59E0B' : '#374151' }} />
                <div>
                  <p className="text-[9px] text-[#6B7280] leading-none">Streak</p>
                  <p className="text-sm font-black leading-tight" style={{ color: streak >= 2 ? '#F59E0B' : '#6B7280' }}>{streak} 🔥</p>
                </div>
              </div>
            </div>

            {/* Result popup */}
            {result && (
              <div className="rounded-2xl p-3 text-center flex-shrink-0"
                style={{ background: result.status === 'won' ? 'rgba(2,192,118,0.08)' : result.status === 'push' ? 'rgba(43,49,57,0.8)' : 'rgba(207,48,74,0.08)', border: `1px solid ${result.status === 'won' ? 'rgba(2,192,118,0.35)' : result.status === 'push' ? 'rgba(255,255,255,0.08)' : 'rgba(207,48,74,0.35)'}` }}>
                <div className="text-2xl mb-0.5">{result.status === 'won' ? '🎉' : result.status === 'push' ? '↔' : '❌'}</div>
                <p className={`font-black text-base ${result.status === 'won' ? 'text-[#02C076]' : result.status === 'push' ? 'text-white' : 'text-[#CF304A]'}`}>
                  {result.status === 'won' ? `+₹${result.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : result.status === 'push' ? 'Push — Refunded' : `−₹${result.amount.toLocaleString('en-IN')}`}
                </p>
                <p className="text-[10px] text-[#6B7280] mt-0.5">{fmt(result.entryPrice, result.instrument)} → {fmt(result.exitPrice, result.instrument)}</p>
                <button onClick={() => setResult(null)} className="text-[10px] text-[#4B5563] underline mt-1">Dismiss</button>
              </div>
            )}

            {/* Trade Box */}
            <div className="flex-1 rounded-2xl p-4 flex flex-col gap-3"
              style={{ background: 'rgba(8,11,22,0.96)', backdropFilter: 'blur(24px)', border: '1px solid rgba(0,194,116,0.12)', boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)' }}>

              {/* Live price — hidden on mobile (already in chart header) */}
              <div className="hidden md:block text-center py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-widest mb-0.5">{instrument}</p>
                <p className={`text-2xl font-black font-mono tabular-nums ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{fmt(livePrice, instrument)}</p>
                <div className="flex items-center justify-center gap-2 mt-0.5">
                  <span className={`text-[10px] font-bold ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{priceDirCurrent === 'up' ? '▲ Rising' : '▼ Falling'}</span>
                  <span className="text-[10px] text-[#374151]">·</span>
                  <span className={`text-[10px] font-bold ${ch24 >= 0 ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{ch24 >= 0 ? '+' : ''}{ch24.toFixed(2)}%</span>
                </div>
              </div>
              {/* Mobile: compact price strip */}
              <div className="md:hidden flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs text-[#6B7280] font-semibold">{instrument}</span>
                <span className={`text-lg font-black font-mono tabular-nums ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{fmt(livePrice, instrument)}</span>
                <span className={`text-xs font-bold ${priceDirCurrent === 'up' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{priceDirCurrent === 'up' ? '▲' : '▼'} {ch24 >= 0 ? '+' : ''}{ch24.toFixed(2)}%</span>
              </div>

              {/* Amount */}
              <div>
                <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1.5 block">Investment Amount</label>
                <div className="relative mb-2">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#848E9C] font-bold text-sm">₹</span>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl text-white font-bold text-sm focus:outline-none transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 16 }}
                    placeholder="1000" min="100" />
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[500,1000,5000,10000,25000].map(v => (
                    <button key={v} onClick={() => setAmount(String(v))}
                      className="py-1.5 rounded-lg text-[9px] font-black transition-all"
                      style={{ background: amount === String(v) ? 'rgba(0,194,116,0.15)' : 'rgba(255,255,255,0.04)', color: amount === String(v) ? '#00C274' : '#6B7280', border: `1px solid ${amount === String(v) ? 'rgba(0,194,116,0.3)' : 'transparent'}` }}>
                      {v >= 1000 ? `${v/1000}K` : v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mb-1.5 block">Expiry Time</label>
                <div className="grid grid-cols-4 gap-1">
                  {DURATIONS.map(d => (
                    <button key={d.seconds} onClick={() => setDuration(d.seconds)}
                      className="py-2 rounded-xl text-xs font-black transition-all"
                      style={{ background: duration === d.seconds ? '#00C274' : 'rgba(255,255,255,0.04)', color: duration === d.seconds ? '#000' : '#6B7280' }}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profit Calculator */}
              <div className="rounded-xl px-3 py-2.5" style={{ background: 'rgba(0,194,116,0.05)', border: '1px solid rgba(0,194,116,0.1)' }}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">Payout</p>
                    <p className="text-xl font-black text-[#00C274]">{payoutPct}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">If Win</p>
                    <p className="text-base font-black text-[#02C076]">+₹{Math.round(amtNum * payoutPct / 100).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-[#6B7280] font-semibold uppercase tracking-wider">Return</p>
                    <p className="text-base font-black text-white">₹{Math.round(amtNum * (1 + payoutPct/100)).toLocaleString('en-IN')}</p>
                  </div>
                </div>
                {/* Win probability bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-[#6B7280] font-semibold">Win Probability</span>
                    <span className="text-[9px] font-black text-[#00C274]">{curMood}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1F2937] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[#00C274] to-[#02C076] transition-all duration-500"
                      style={{ width: `${curMood}%` }} />
                  </div>
                </div>
              </div>

              {/* HIGHER / LOWER */}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => handlePlace('call')} disabled={placing}
                  onMouseEnter={() => setCallHov(true)} onMouseLeave={() => { setCallHov(false); setCallPress(false); }}
                  onPointerDown={() => setCallPress(true)} onPointerUp={() => setCallPress(false)}
                  className="flex flex-col items-center gap-1.5 py-4 md:py-4 rounded-2xl font-black text-white text-sm disabled:opacity-50"
                  style={{ paddingTop: 'clamp(16px, 5vw, 20px)', paddingBottom: 'clamp(16px, 5vw, 20px)',
                    background: 'linear-gradient(135deg,#02C076 0%,#018a53 100%)', border: '1px solid rgba(2,192,118,0.4)',
                    boxShadow: placing ? 'none' : callHov ? '0 0 24px #10b981, 0 0 48px rgba(16,185,129,0.5)' : '0 0 24px rgba(2,192,118,0.4)',
                    transform: callPress ? 'scale(0.95)' : callHov ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.2s ease' }}>
                  <TrendingUp className="w-6 h-6" />
                  <span className="text-lg leading-tight">Higher</span>
                  <span className="text-[11px] opacity-80 font-semibold">↑ CALL</span>
                </button>
                <button onClick={() => handlePlace('put')} disabled={placing}
                  onMouseEnter={() => setPutHov(true)} onMouseLeave={() => { setPutHov(false); setPutPress(false); }}
                  onPointerDown={() => setPutPress(true)} onPointerUp={() => setPutPress(false)}
                  className="flex flex-col items-center gap-1.5 rounded-2xl font-black text-white text-sm disabled:opacity-50"
                  style={{ paddingTop: 'clamp(16px, 5vw, 20px)', paddingBottom: 'clamp(16px, 5vw, 20px)',
                    background: 'linear-gradient(135deg,#CF304A 0%,#8b0e21 100%)', border: '1px solid rgba(207,48,74,0.4)',
                    boxShadow: placing ? 'none' : putHov ? '0 0 24px #ef4444, 0 0 48px rgba(239,68,68,0.5)' : '0 0 24px rgba(207,48,74,0.4)',
                    transform: putPress ? 'scale(0.95)' : putHov ? 'scale(1.03)' : 'scale(1)', transition: 'all 0.2s ease' }}>
                  <TrendingDown className="w-6 h-6" />
                  <span className="text-lg leading-tight">Lower</span>
                  <span className="text-[11px] opacity-80 font-semibold">↓ PUT</span>
                </button>
              </div>
            </div>

            {/* Mobile: Trade History Tab */}
            <div className="md:hidden">
              <div className="flex rounded-xl overflow-hidden mb-2" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                {(['chart','history'] as const).map(tab => (
                  <button key={tab} onClick={() => setMobileTab(tab)}
                    className="flex-1 py-2 text-xs font-black capitalize transition-all"
                    style={{ background: mobileTab === tab ? '#00C274' : 'rgba(255,255,255,0.02)', color: mobileTab === tab ? '#000' : '#6B7280' }}>
                    {tab === 'chart' ? 'Active' : 'History'}
                  </button>
                ))}
              </div>
              {mobileTab === 'history' && (
                <div className="rounded-2xl overflow-hidden" style={{ background: '#050810', border: '1px solid rgba(255,255,255,0.06)', maxHeight: 220 }}>
                  <div className="overflow-y-auto" style={{ maxHeight: 220, scrollbarWidth: 'none' }}>
                    {myHistory.length === 0 && <div className="flex items-center justify-center py-8 text-[#374151] text-xs">No trades yet</div>}
                    {myHistory.map((h, i) => {
                      const won = h.status === 'won', push = h.status === 'push';
                      return (
                        <div key={h.id ?? i} className="flex items-center gap-2 px-3 py-2"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderLeft: `2px solid ${won ? '#02C076' : push ? '#00C274' : '#CF304A'}` }}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-black text-white">{h.instrument}</span>
                              <span className={`text-[9px] font-black ${h.direction === 'call' ? 'text-[#02C076]' : 'text-[#CF304A]'}`}>{h.direction === 'call' ? '↑' : '↓'}</span>
                            </div>
                          </div>
                          <p className={`text-xs font-black ${won ? 'text-[#02C076]' : push ? 'text-[#00C274]' : 'text-[#CF304A]'}`}>
                            {won ? `+₹${(h.profit ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}` : push ? 'Push' : `−₹${(h.amount ?? 0).toLocaleString('en-IN')}`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
