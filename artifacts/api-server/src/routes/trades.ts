import { Router } from "express";
import { db } from "@workspace/db";
import { tradesTable, strategiesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db
      .select({ trade: tradesTable, strategy: strategiesTable })
      .from(tradesTable)
      .leftJoin(strategiesTable, eq(tradesTable.strategyId, strategiesTable.id))
      .where(eq(tradesTable.userId, req.user!.id))
      .orderBy(desc(tradesTable.openedAt))
      .limit(50);
    res.json(trades.map(({ trade, strategy }) => ({
      id: trade.id, userId: trade.userId, strategyId: trade.strategyId,
      strategyName: strategy?.name,
      market: trade.market, instrument: trade.instrument, direction: trade.direction,
      entryPrice: parseFloat(trade.entryPrice as string),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice as string) : undefined,
      lotSize: parseFloat(trade.lotSize as string),
      profit: trade.profit ? parseFloat(trade.profit as string) : undefined,
      profitPercent: trade.profitPercent ? parseFloat(trade.profitPercent as string) : undefined,
      status: trade.status, openedAt: trade.openedAt.toISOString(),
      closedAt: trade.closedAt?.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
