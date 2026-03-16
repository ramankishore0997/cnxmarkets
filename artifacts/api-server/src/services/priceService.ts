import WebSocket from "ws";
import type { Server as SocketIOServer } from "socket.io";

const FINNHUB_TOKEN = process.env.FINNHUB_API_KEY || "";

const INSTRUMENT_MAP: Record<string, string> = {
  "OANDA:EUR_USD": "EUR/USD",
  "OANDA:GBP_USD": "GBP/USD",
  "BINANCE:BTCUSDT": "BTC/USD",
};

interface PriceState {
  price: number;
  open: number;
  high: number;
  low: number;
  candle_time: number;
}

const prices: Record<string, PriceState> = {
  "EUR/USD": { price: 1.08540, open: 1.08540, high: 1.08560, low: 1.08520, candle_time: 0 },
  "GBP/USD": { price: 1.27230, open: 1.27230, high: 1.27260, low: 1.27200, candle_time: 0 },
  "BTC/USD": { price: 67450.0, open: 67450.0, high: 67520.0, low: 67380.0, candle_time: 0 },
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
  const vol: Record<string, number> = {
    "EUR/USD": 0.00014,
    "GBP/USD": 0.00016,
    "BTC/USD": 22.0,
  };
  simInterval = setInterval(() => {
    const now = Date.now();
    for (const sym of Object.keys(prices)) {
      const v = vol[sym] ?? 0.0001;
      const prev = prices[sym].price;
      const delta = (Math.random() - 0.5) * 2 * v;
      const next = parseFloat((prev + delta).toFixed(sym === "BTC/USD" ? 2 : 5));
      processTick(sym, next, now);
    }
  }, 1000);
  console.log("[Price] Simulation started.");
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
