import { Router } from "express";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { addSseClient, removeSseClient } from "../lib/sse.js";

const JWT_SECRET = process.env.JWT_SECRET || "ecmarkets-secret-key-2024";
const router = Router();

router.get("/stream", (req, res) => {
  const token = req.query.token as string || (req.headers.authorization || "").replace("Bearer ", "");
  if (!token) { res.status(401).json({ message: "Unauthorized" }); return; }

  let userId: number;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: number };
    userId = payload.userId;
  } catch {
    res.status(401).json({ message: "Invalid token" }); return;
  }

  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const connId = randomBytes(8).toString("hex");
  addSseClient(userId, connId, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ userId, connId })}\n\n`);

  req.on("close", () => {
    removeSseClient(userId, connId);
  });
});

export default router;
