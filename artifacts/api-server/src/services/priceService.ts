import type { Server as SocketIOServer } from "socket.io";

const BINANCE_SYMBOLS: Record<string, string> = {
  "BTC/USDT": "BTCUSDT",
  "ETH/USDT": "ETHUSDT",
  "SOL/USDT": "SOLUSDT",
  "BNB/USDT": "BNBUSDT",
  "XRP/USDT": "XRPUSDT",
};
const SYMBOL_TO_INST: Record<string, string> = Object.fromEntries(
  Object.entries(BINANCE_SYMBOLS).map(([k, v]) => [v, k])
);

interface PriceState {
  price: number;
  open: number;
  high: number;
  low: number;
  candle_time: number;
}

export const prices: Record<string, PriceState> = {
  "BTC/USDT": { price: 67450.0, open: 67450.0, high: 67520.0, low: 67380.0, candle_time: 0 },
  "ETH/USDT": { price: 3250.0,  open: 3250.0,  high: 3265.0,  low: 3235.0,  candle_time: 0 },
  "SOL/USDT": { price: 148.50,  open: 148.50,  high: 149.20,  low: 147.80,  candle_time: 0 },
  "BNB/USDT": { price: 410.00,  open: 410.00,  high: 411.50,  low: 408.50,  candle_time: 0 },
  "XRP/USDT": { price: 0.5280,  open: 0.5280,  high: 0.5310,  low: 0.5250,  candle_time: 0 },
};

const SIM_VOL: Record<string, number> = {
  "BTC/USDT": 22.0,  "ETH/USDT": 1.2,  "SOL/USDT": 0.18,
  "BNB/USDT": 0.28,  "XRP/USDT": 0.003,
};

const DECIMALS: Record<string, number> = {
  "BTC/USDT": 1, "ETH/USDT": 2, "SOL/USDT": 3, "BNB/USDT": 2, "XRP/USDT": 4,
};

let io: SocketIOServer | null = null;
let simInterval: NodeJS.Timeout | null = null;
let pollInterval: NodeJS.Timeout | null = null;

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
    instrument,
    price: state.price,
    open: state.open,
    high: state.high,
    low: state.low,
    time: minuteTs,
  });
}

function processTick(instrument: string, newPrice: number, tsMs: number): void {
  const state = prices[instrument];
  if (!state) return;
  const newMinuteTs = Math.floor(tsMs / 60000) * 60000;
  if (newMinuteTs > state.candle_time) {
    state.open = newPrice;
    state.high = newPrice;
    state.low = newPrice;
    state.candle_time = newMinuteTs;
  } else {
    if (newPrice > state.high) state.high = newPrice;
    if (newPrice < state.low) state.low = newPrice;
  }
  state.price = newPrice;
  broadcastTick(instrument);
}

function startSimulation(): void {
  if (simInterval) return;
  simInterval = setInterval(() => {
    const now = Date.now();
    for (const sym of Object.keys(prices)) {
      const v = SIM_VOL[sym] ?? 0.01;
      const dec = DECIMALS[sym] ?? 2;
      const prev = prices[sym].price;
      const delta = (Math.random() - 0.5) * 2 * v;
      const next = parseFloat((prev + delta).toFixed(dec));
      processTick(sym, next, now);
    }
  }, 800);
  console.log("[Price] Simulation fallback started for crypto instruments.");
}

async function fetchBinancePrices(): Promise<void> {
  try {
    const symsJson = encodeURIComponent(JSON.stringify(Object.values(BINANCE_SYMBOLS)));
    const url = `https://api.binance.com/api/v3/ticker/price?symbols=${symsJson}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return;
    const data = await res.json() as { symbol: string; price: string }[];
    const now = Date.now();
    for (const item of data) {
      const inst = SYMBOL_TO_INST[item.symbol];
      if (!inst) continue;
      const price = parseFloat(item.price);
      if (price > 0) processTick(inst, price, now);
    }
  } catch {
    // silently ignore network errors
  }
}

export function startPriceService(): void {
  console.log("[Price] Starting Binance REST price polling (every 3s)…");
  fetchBinancePrices().then(() => {
    console.log("[Price] Initial Binance prices fetched.");
  }).catch(() => {
    console.log("[Price] Initial Binance fetch failed — simulation active.");
    startSimulation();
  });

  pollInterval = setInterval(async () => {
    await fetchBinancePrices();
  }, 3000);

  setTimeout(() => {
    const anyLive = Object.values(prices).some(p => p.candle_time > 0);
    if (!anyLive) {
      console.log("[Price] Binance polling not returning data — enabling simulation fallback.");
      startSimulation();
    }
  }, 10000);
}
