import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js";
import { startTradeCron } from "./services/tradeCron.js";
import { runStartupSeed } from "./services/startupSeed.js";
import { startPriceService, initPriceService } from "./services/priceService.js";
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

io.on("connection", (socket) => {
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    console.log(`[Socket.io] User ${userId} joined.`);
  }
  socket.on("disconnect", () => {
    if (userId) console.log(`[Socket.io] User ${userId} left.`);
  });
});

initPriceService(io);
setBinaryIo(io);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  runStartupSeed();
  startTradeCron();
  startPriceService();
});
