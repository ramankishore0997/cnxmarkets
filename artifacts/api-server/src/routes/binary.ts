import { Router } from "express";
import { db } from "@workspace/db";
import { binaryTradesTable, accountsTable, adminSettingsTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/authMiddleware.js";
import { getCurrentPrice } from "../services/priceService.js";
import type { Server as SocketIOServer } from "socket.io";

const VALID_INSTRUMENTS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "EUR/JPY",
  "BTC/USDT", "ETH/USDT", "SOL/USDT", "BNB/USDT",
];
const VALID_DURATIONS = [30, 60, 120, 300];
const MIN_TRADE = 100;

let io: SocketIOServer | null = null;

export function setBinaryIo(socketServer: SocketIOServer): void {
  io = socketServer;
}

const router = Router();

router.get("/settings", requireAuth, async (_req, res) => {
  try {
    const [settings] = await db.select().from(adminSettingsTable).limit(1);
    res.json({
      payoutPct: settings ? parseFloat(settings.binaryPayoutPct as string) : 90,
      houseEdgeEnabled: settings?.houseEdgeEnabled ?? false,
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/settings", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { payoutPct, houseEdgeEnabled } = req.body;
    const [settings] = await db.select().from(adminSettingsTable).limit(1);
    if (settings) {
      await db
        .update(adminSettingsTable)
        .set({
          binaryPayoutPct: payoutPct != null ? String(payoutPct) : settings.binaryPayoutPct,
          houseEdgeEnabled: houseEdgeEnabled != null ? houseEdgeEnabled : settings.houseEdgeEnabled,
          updatedAt: new Date(),
        })
        .where(eq(adminSettingsTable.id, settings.id));
    }
    res.json({ message: "Settings updated" });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/place", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { instrument, direction, amount, duration } = req.body;

    if (!VALID_INSTRUMENTS.includes(instrument)) {
      res.status(400).json({ message: "Invalid instrument" });
      return;
    }
    if (!["call", "put"].includes(direction)) {
      res.status(400).json({ message: "Direction must be 'call' or 'put'" });
      return;
    }
    const amt = parseFloat(amount);
    if (!amt || amt < MIN_TRADE) {
      res.status(400).json({ message: `Minimum trade amount is ₹${MIN_TRADE}` });
      return;
    }
    if (!VALID_DURATIONS.includes(Number(duration))) {
      res.status(400).json({ message: "Invalid duration" });
      return;
    }

    const [account] = await db
      .select()
      .from(accountsTable)
      .where(eq(accountsTable.userId, userId))
      .limit(1);

    if (!account || parseFloat(account.totalBalance as string) < amt) {
      res.status(400).json({ message: "Insufficient balance" });
      return;
    }

    const [settings] = await db.select().from(adminSettingsTable).limit(1);
    const payoutPct = settings ? parseFloat(settings.binaryPayoutPct as string) : 90;
    const houseEdge = settings?.houseEdgeEnabled ?? false;

    const newBalance = parseFloat(account.totalBalance as string) - amt;
    await db
      .update(accountsTable)
      .set({ totalBalance: newBalance.toFixed(2), updatedAt: new Date() })
      .where(eq(accountsTable.userId, userId));

    const entryPrice = getCurrentPrice(instrument);

    const [trade] = await db
      .insert(binaryTradesTable)
      .values({
        userId,
        instrument,
        direction,
        entryPrice: entryPrice.toString(),
        amount: amt.toString(),
        duration: Number(duration),
        payoutPct: payoutPct.toString(),
        status: "open",
      })
      .returning();

    const tradeId = trade.id;
    const dur = Number(duration);

    setTimeout(async () => {
      try {
        let exitPrice = getCurrentPrice(instrument);

        if (houseEdge && Math.random() < 0.15) {
          const pip = instrument === "BTC/USD" ? 8 : 0.0001;
          exitPrice = direction === "call"
            ? entryPrice - pip * 2
            : entryPrice + pip * 2;
        }

        const diff = exitPrice - entryPrice;
        const won = direction === "call" ? diff > 0 : diff < 0;
        const push = Math.abs(diff) < (instrument === "BTC/USD" ? 0.01 : 0.000001);

        let profit = 0;
        let payout = 0;
        let status = "lost";

        if (push) {
          payout = amt;
          profit = 0;
          status = "push";
        } else if (won) {
          profit = amt * payoutPct / 100;
          payout = amt + profit;
          status = "won";
        } else {
          profit = -amt;
          payout = 0;
          status = "lost";
        }

        await db
          .update(binaryTradesTable)
          .set({
            closingPrice: exitPrice.toString(),
            status,
            profit: profit.toString(),
            closedAt: new Date(),
          })
          .where(eq(binaryTradesTable.id, tradeId));

        if (payout > 0) {
          const [acc] = await db
            .select()
            .from(accountsTable)
            .where(eq(accountsTable.userId, userId))
            .limit(1);
          if (acc) {
            const bal = parseFloat(acc.totalBalance as string) + payout;
            const totalProfit = parseFloat(acc.totalProfit as string) + Math.max(profit, 0);
            await db
              .update(accountsTable)
              .set({
                totalBalance: bal.toFixed(2),
                totalProfit: totalProfit.toFixed(2),
                updatedAt: new Date(),
              })
              .where(eq(accountsTable.userId, userId));
          }
        }

        if (io) {
          io.to(`user:${userId}`).emit("binary:settled", {
            tradeId,
            instrument,
            direction,
            entryPrice,
            exitPrice,
            amount: amt,
            profit,
            payout,
            status,
            payoutPct,
          });
        }
      } catch (err) {
        console.error("[Binary] Settlement error:", err);
      }
    }, dur * 1000);

    res.json({
      id: trade.id,
      instrument,
      direction,
      entryPrice,
      amount: amt,
      duration: dur,
      payoutPct,
      status: "open",
      openedAt: trade.openedAt,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/active", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db
      .select()
      .from(binaryTradesTable)
      .where(and(eq(binaryTradesTable.userId, req.user!.id), eq(binaryTradesTable.status, "open")))
      .orderBy(desc(binaryTradesTable.openedAt));

    res.json(
      trades.map((t) => ({
        id: t.id,
        instrument: t.instrument,
        direction: t.direction,
        entryPrice: parseFloat(t.entryPrice as string),
        amount: parseFloat(t.amount as string),
        duration: t.duration,
        payoutPct: parseFloat(t.payoutPct as string),
        status: t.status,
        openedAt: t.openedAt,
      }))
    );
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db
      .select()
      .from(binaryTradesTable)
      .where(eq(binaryTradesTable.userId, req.user!.id))
      .orderBy(desc(binaryTradesTable.openedAt))
      .limit(50);

    res.json(
      trades.map((t) => ({
        id: t.id,
        instrument: t.instrument,
        direction: t.direction,
        entryPrice: parseFloat(t.entryPrice as string),
        closingPrice: t.closingPrice ? parseFloat(t.closingPrice as string) : null,
        amount: parseFloat(t.amount as string),
        duration: t.duration,
        payoutPct: parseFloat(t.payoutPct as string),
        profit: t.profit ? parseFloat(t.profit as string) : null,
        status: t.status,
        openedAt: t.openedAt,
        closedAt: t.closedAt,
      }))
    );
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/recent", requireAuth, async (_req, res) => {
  try {
    const trades = await db
      .select({
        id: binaryTradesTable.id,
        instrument: binaryTradesTable.instrument,
        direction: binaryTradesTable.direction,
        amount: binaryTradesTable.amount,
        status: binaryTradesTable.status,
        openedAt: binaryTradesTable.openedAt,
        userId: binaryTradesTable.userId,
      })
      .from(binaryTradesTable)
      .orderBy(desc(binaryTradesTable.openedAt))
      .limit(30);

    res.json(
      trades.map((t) => ({
        id: t.id,
        instrument: t.instrument,
        direction: t.direction,
        amount: parseFloat(t.amount as string),
        status: t.status,
        openedAt: t.openedAt,
        user: `User${String(t.userId).padStart(4, "0")}`,
      }))
    );
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
