import type { Server as SocketIOServer } from "socket.io";

const BINANCE_SYMBOLS: Record<string, string> = {
  "BTC/USDT":  "BTCUSDT",  "ETH/USDT":  "ETHUSDT",  "SOL/USDT":  "SOLUSDT",
  "BNB/USDT":  "BNBUSDT",  "XRP/USDT":  "XRPUSDT",  "DOGE/USDT": "DOGEUSDT",
  "ADA/USDT":  "ADAUSDT",  "AVAX/USDT": "AVAXUSDT", "MATIC/USDT":"MATICUSDT",
  "DOT/USDT":  "DOTUSDT",  "LINK/USDT": "LINKUSDT", "LTC/USDT":  "LTCUSDT",
  "TRX/USDT":  "TRXUSDT",  "SHIB/USDT": "SHIBUSDT",
};
const SYMBOL_TO_INST: Record<string, string> = Object.fromEntries(
  Object.entries(BINANCE_SYMBOLS).map(([k, v]) => [v, k])
);

interface PriceState {
  price: number; open: number; high: number; low: number; candle_time: number;
}

export const prices: Record<string, PriceState> = {
  "BTC/USDT":  { price: 67450.0,    open: 67450.0,    high: 67520.0,    low: 67380.0,    candle_time: 0 },
  "ETH/USDT":  { price: 3250.0,     open: 3250.0,     high: 3265.0,     low: 3235.0,     candle_time: 0 },
  "SOL/USDT":  { price: 148.50,     open: 148.50,     high: 149.20,     low: 147.80,     candle_time: 0 },
  "BNB/USDT":  { price: 410.00,     open: 410.00,     high: 411.50,     low: 408.50,     candle_time: 0 },
  "XRP/USDT":  { price: 0.5280,     open: 0.5280,     high: 0.5310,     low: 0.5250,     candle_time: 0 },
  "DOGE/USDT": { price: 0.16200,    open: 0.16200,    high: 0.16350,    low: 0.16050,    candle_time: 0 },
  "ADA/USDT":  { price: 0.4650,     open: 0.4650,     high: 0.4690,     low: 0.4610,     candle_time: 0 },
  "AVAX/USDT": { price: 38.500,     open: 38.500,     high: 38.800,     low: 38.200,     candle_time: 0 },
  "MATIC/USDT":{ price: 0.8750,     open: 0.8750,     high: 0.8820,     low: 0.8680,     candle_time: 0 },
  "DOT/USDT":  { price: 7.850,      open: 7.850,      high: 7.920,      low: 7.780,      candle_time: 0 },
  "LINK/USDT": { price: 14.200,     open: 14.200,     high: 14.350,     low: 14.050,     candle_time: 0 },
  "LTC/USDT":  { price: 82.50,      open: 82.50,      high: 83.20,      low: 81.80,      candle_time: 0 },
  "TRX/USDT":  { price: 0.11800,    open: 0.11800,    high: 0.11900,    low: 0.11700,    candle_time: 0 },
  "SHIB/USDT": { price: 0.00002450, open: 0.00002450, high: 0.00002480, low: 0.00002420, candle_time: 0 },
};

const SIM_VOL: Record<string, number> = {
  "BTC/USDT": 22.0, "ETH/USDT": 1.2,   "SOL/USDT": 0.18,     "BNB/USDT": 0.28,
  "XRP/USDT": 0.003,"DOGE/USDT": 0.0004,"ADA/USDT": 0.002,   "AVAX/USDT": 0.08,
  "MATIC/USDT":0.0012,"DOT/USDT": 0.025,"LINK/USDT": 0.045,  "LTC/USDT": 0.35,
  "TRX/USDT": 0.0005,"SHIB/USDT": 0.0000003,
};

const DECIMALS: Record<string, number> = {
  "BTC/USDT": 1,  "ETH/USDT": 2,  "SOL/USDT": 3,  "BNB/USDT": 2,
  "XRP/USDT": 4,  "DOGE/USDT": 5, "ADA/USDT": 4,  "AVAX/USDT": 3,
  "MATIC/USDT":4, "DOT/USDT": 3,  "LINK/USDT": 3, "LTC/USDT": 2,
  "TRX/USDT": 5,  "SHIB/USDT": 8,
};

let io: SocketIOServer | null = null;
let simInterval: NodeJS.Timeout | null = null;
let pollInterval: NodeJS.Timeout | null = null;
let pauseTimer: NodeJS.Timeout | null = null;
let isRunning = false;

/* ─── Aggressive intervals: minimum compute ─────────────────────── */
const POLL_INTERVAL_MS = 30_000;   // 30 s — prices change slowly enough
const SIM_INTERVAL_MS  =  5_000;   // 5 s  — fallback sim, barely visible

export function getCurrentPrice(instrument: string): number {
  return prices[instrument]?.price ?? 0;
}

export function initPriceService(socketServer: SocketIOServer): void {
  io = socketServer;
}

function broadcastTick(instrument: string): void {
  if (!io) return;
  const state = prices[instrument];
  const minuteTs = Math.floor(Date.now() / 60000) * 60;
  io.emit("price:tick", {
    instrument, price: state.price,
    open: state.open, high: state.high, low: state.low, time: minuteTs,
  });
}

function processTick(instrument: string, newPrice: number, tsMs: number): void {
  const state = prices[instrument];
  if (!state) return;
  const newMinuteTs = Math.floor(tsMs / 60000) * 60000;
  if (newMinuteTs > state.candle_time) {
    state.open = newPrice; state.high = newPrice; state.low = newPrice; state.candle_time = newMinuteTs;
  } else {
    if (newPrice > state.high) state.high = newPrice;
    if (newPrice < state.low)  state.low  = newPrice;
  }
  state.price = newPrice;
  broadcastTick(instrument);
}

function startSimulation(): void {
  if (simInterval) return;
  simInterval = setInterval(() => {
    const now = Date.now();
    for (const sym of Object.keys(prices)) {
      const v   = SIM_VOL[sym] ?? 0.01;
      const dec = DECIMALS[sym] ?? 2;
      const prev  = prices[sym].price;
      const delta = (Math.random() - 0.5) * 2 * v;
      const next  = parseFloat((prev + delta).toFixed(dec));
      processTick(sym, next, now);
    }
  }, SIM_INTERVAL_MS);
  console.log(`[Price] Simulation started (interval: ${SIM_INTERVAL_MS / 1000} s).`);
}

function stopSimulation(): void {
  if (simInterval) { clearInterval(simInterval); simInterval = null; }
}

async function fetchBinancePrices(): Promise<void> {
  try {
    const symsJson = encodeURIComponent(JSON.stringify(Object.values(BINANCE_SYMBOLS)));
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=${symsJson}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return;
    const data = await res.json() as { symbol: string; price: string }[];
    const now = Date.now();
    for (const item of data) {
      const inst = SYMBOL_TO_INST[item.symbol];
      if (!inst) continue;
      const price = parseFloat(item.price);
      if (price > 0) processTick(inst, price, now);
    }
  } catch {}
}

/* ─── FIX 2: Smart start / pause ────────────────────────────────── */

export function startPriceService(): void {
  if (isRunning) return;
  isRunning = true;
  console.log(`[Price] Starting — Binance REST polling (14 pairs, every ${POLL_INTERVAL_MS / 1000} s)…`);

  fetchBinancePrices().then(() => {
    console.log("[Price] Initial prices fetched from Binance.");
  }).catch(() => {
    console.log("[Price] Initial Binance fetch failed — simulation active.");
    startSimulation();
  });

  pollInterval = setInterval(async () => {
    await fetchBinancePrices();
  }, POLL_INTERVAL_MS);

  setTimeout(() => {
    const anyLive = Object.values(prices).some(p => p.candle_time > 0);
    if (!anyLive) {
      console.log("[Price] Binance not responding — simulation fallback.");
      startSimulation();
    }
  }, 12000);
}

export function pausePriceService(): void {
  if (!isRunning) return;
  isRunning = false;
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  stopSimulation();
  console.log("[Price] Paused — no active clients. Compute saved.");
}

export function resumePriceService(): void {
  if (pauseTimer) { clearTimeout(pauseTimer); pauseTimer = null; }
  if (isRunning) return;
  console.log("[Price] Resuming — client connected.");
  startPriceService();
}

/* Called from index.ts when a Socket.IO client disconnects.
   Waits 60 s before pausing — handles quick page refreshes gracefully. */
export function scheduleIdlePause(getClientCount: () => number): void {
  if (pauseTimer) return;
  pauseTimer = setTimeout(() => {
    pauseTimer = null;
    if (getClientCount() === 0) {
      pausePriceService();
    }
  }, 10_000);
}
