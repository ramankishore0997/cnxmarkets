import type { Response } from "express";

interface SseClient {
  userId: number;
  res: Response;
  lastPing: number;
}

const clients = new Map<string, SseClient>();

function makeKey(userId: number, connId: string) {
  return `${userId}:${connId}`;
}

export function addSseClient(userId: number, connId: string, res: Response) {
  clients.set(makeKey(userId, connId), { userId, res, lastPing: Date.now() });
}

export function removeSseClient(userId: number, connId: string) {
  clients.delete(makeKey(userId, connId));
}

export function emitToUser(userId: number, event: string, data: Record<string, unknown> = {}) {
  for (const [, client] of clients) {
    if (client.userId === userId) {
      try {
        client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      } catch { /* client disconnected */ }
    }
  }
}

export function emitToAll(event: string, data: Record<string, unknown> = {}) {
  for (const [, client] of clients) {
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch { /* client disconnected */ }
  }
}

// Heartbeat every 25s to keep connections alive
setInterval(() => {
  const now = Date.now();
  for (const [key, client] of clients) {
    try {
      client.res.write(`:ping\n\n`);
      client.lastPing = now;
    } catch {
      clients.delete(key);
    }
  }
}, 25_000);
