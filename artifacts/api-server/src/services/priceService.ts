import WebSocket from "ws";
import type { Server as SocketIOServer } from "socket.io";

const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY || "";

const INSTRUMENT_MAP: Record<string, string> = {
  "OANDA:EUR_USD":    "EUR/USD",
  "OANDA:GBP_USD":    "GBP/USD",
  "OANDA:USD_JPY":    "USD/JPY",
  "OANDA:AUD_USD":    "AUD/USD",
  "OANDA:USD_CAD":    "USD/CAD",
  "OANDA:EUR_JPY":    "EUR/JPY",
  "BINANCE:BTCUSDT":  "BTC/USDT",
  "BINANCE:ETHUSDT":  "ETH/USDT",
  "BINANCE:SOLUSDT":  "SOL/USDT",
  "BINANCE:BNBUSDT":  "BNB/USDT",
};

interface PriceState {
  price: number;
  open: number;
  high: number;
  low: number;
  candle_time: number;
}

export const prices: Record<string, PriceState> = {
  "EUR/USD":  { price: 1.08540,  open: 1.08540,  high: 1.08560,  low: 1.08520,  candle_time: 0 },
  "GBP/USD":  { price: 1.27230,  open: 1.27230,  high: 1.27260,  low: 1.27200,  candle_time: 0 },
  "USD/JPY":  { price: 149.850,  open: 149.850,  high: 149.870,  low: 149.830,  candle_time: 0 },
  "AUD/USD":  { price: 0.65430,  open: 0.65430,  high: 0.65450,  low: 0.65410,  candle_time: 0 },
  "USD/CAD":  { price: 1.36420,  open: 1.36420,  high: 1.36450,  low: 1.36390,  candle_time: 0 },
  "EUR/JPY":  { price: 162.540,  open: 162.540,  high: 162.580,  low: 162.500,  candle_time: 0 },
  "BTC/USDT": { price: 67450.0,  open: 67450.0,  high: 67520.0,  low: 67380.0,  candle_time: 0 },
  "ETH/USDT": { price: 3250.0,   open: 3250.0,   high: 3265.0,   low: 3235.0,   candle_time: 0 },
  "SOL/USDT": { price: 148.50,   open: 148.50,   high: 149.20,   low: 147.80,   candle_time: 0 },
  "BNB/USDT": { price: 410.00,   open: 410.00,   high: 411.50,   low: 408.50,   candle_time: 0 },
};

const SIM_VOL: Record<string, number> = {
  "EUR/USD":  0.00014,
  "GBP/USD":  0.00016,
  "USD/JPY":  0.012,
  "AUD/USD":  0.00012,
  "USD/CAD":  0.00013,
  "EUR/JPY":  0.015,
  "BTC/USDT": 22.0,
  "ETH/USDT": 1.2,
  "SOL/USDT": 0.18,
  "BNB/USDT": 0.28,
};

const DECIMALS: Record<string, number> = {
  "EUR/USD": 5, "GBP/USD": 5, "AUD/USD": 5, "USD/CAD": 5,
  "USD/JPY": 3, "EUR/JPY": 3,
  "BTC/USDT": 1, "ETH/USDT": 2, "SOL/USDT": 3, "BNB/USDT": 2,
};

let io: SocketIOServer | null = null;
let simInterval: NodeJS.Timeout | null = null;

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
      const v = SIM_VOL[sym] ?? 0.0001;
      const dec = DECIMALS[sym] ?? 5;
      const prev = prices[sym].price;
      const delta = (Math.random() - 0.5) * 2 * v;
      const next = parseFloat((prev + delta).toFixed(dec));
      processTick(sym, next, now);
    }
  }, 800);
  console.log("[Price] Simulation started for all 10 instruments.");
}

export function startPriceService(): void {
  if (!FINNHUB_TOKEN) {
    console.log("[Price] No FINNHUB_API_KEY — using simulated prices.");
    startSimulation();
    return;
  }

  let dataReceived = false;

  const connect = () => {
    const ws = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_TOKEN}`);

    ws.on("open", () => {
      console.log("[Price] Finnhub WS connected.");
      Object.keys(INSTRUMENT_MAP).forEach((sym) => {
        ws.send(JSON.stringify({ type: "subscribe", symbol: sym }));
      });
    });

    ws.on("message", (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "trade" && Array.isArray(msg.data)) {
          msg.data.forEach((tick: any) => {
            const friendly = INSTRUMENT_MAP[tick.s as string];
            if (!friendly) return;
            dataReceived = true;
            processTick(friendly, tick.p, tick.t);
          });
        }
      } catch {}
    });

    ws.on("error", (err: Error) => {
      console.error("[Price] Finnhub WS error:", err.message);
    });

    ws.on("close", () => {
      console.log("[Price] Finnhub WS closed — reconnecting in 5s…");
      setTimeout(connect, 5000);
    });
  };

  connect();

  setTimeout(() => {
    if (!dataReceived) {
      console.log("[Price] No Finnhub data received — enabling simulation fallback.");
      startSimulation();
    }
  }, 6000);
}
