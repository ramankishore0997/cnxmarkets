import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { startTradeCron } from "./services/tradeCron.js";
import { runStartupSeed } from "./services/startupSeed.js";
import {
  startPriceService,
  initPriceService,
  resumePriceService,
  scheduleIdlePause,
} from "./services/priceService.js";
import { setBinaryIo } from "./routes/binary.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error("PORT environment variable is required but was not provided.");
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  path: "/api/socket.io",
  cors: {
    origin: (_origin, callback) => callback(null, true),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* ─── FIX 2: Smart ON/OFF — track connected clients ─────────────── */
let connectedClients = 0;

const getClientCount = () => connectedClients;

io.on("connection", (socket) => {
  connectedClients++;

  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`[Socket.io] User ${userId} joined. Active clients: ${connectedClients}`);
  }

  /* First client connected → resume price service if it was paused */
  if (connectedClients === 1) {
    resumePriceService();
  }

  socket.on("disconnect", () => {
    connectedClients = Math.max(0, connectedClients - 1);
    if (userId) {
      console.log(`[Socket.io] User ${userId} left. Active clients: ${connectedClients}`);
    }

    /* Last client disconnected → schedule idle pause (60 s grace period) */
    if (connectedClients === 0) {
      scheduleIdlePause(getClientCount);
    }
  });
});

initPriceService(io);
setBinaryIo(io);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  runStartupSeed();
  startTradeCron();
  startPriceService(); /* Warm start — will auto-pause if no clients connect */
});
