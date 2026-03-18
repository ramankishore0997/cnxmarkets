import { Router } from "express";
import { db } from "@workspace/db";
import { tradesTable, strategiesTable } from "@workspace/db/schema";
import { eq, desc, and, gte, lte, sql, lt } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

function mapTrade(trade: any, strategy: any) {
  return {
    id: trade.id,
    userId: trade.userId,
    strategyId: trade.strategyId,
    strategyName: strategy?.name,
    market: trade.market,
    instrument: trade.instrument,
    direction: trade.direction,
    entryPrice: parseFloat(trade.entryPrice as string),
    exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice as string) : undefined,
    lotSize: parseFloat(trade.lotSize as string),
    profit: trade.profit ? parseFloat(trade.profit as string) : undefined,
    profitPercent: trade.profitPercent ? parseFloat(trade.profitPercent as string) : undefined,
    status: trade.status,
    openedAt: trade.openedAt.toISOString(),
    closedAt: trade.closedAt?.toISOString(),
  };
}

// Legacy endpoint — returns last 50 trades (used by Dashboard/Analytics)
router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db
      .select({ trade: tradesTable, strategy: strategiesTable })
      .from(tradesTable)
      .leftJoin(strategiesTable, eq(tradesTable.strategyId, strategiesTable.id))
      .where(eq(tradesTable.userId, req.user!.id))
      .orderBy(desc(tradesTable.openedAt))
      .limit(50);
    res.json(trades.map(({ trade, strategy }) => mapTrade(trade, strategy)));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Paginated algo trade history with date-range filtering + full-period stats
router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
    const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

    const conditions = [
      eq(tradesTable.userId, req.user!.id),
      eq(tradesTable.status, "closed" as string),
    ];
    if (fromDate) conditions.push(gte(tradesTable.closedAt, fromDate));
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(tradesTable.closedAt, end));
    }

    const where = and(...conditions);

    // Full-period aggregate stats (across ALL pages)
    const [aggRow] = await db
      .select({
        total:      sql<number>`count(*)::int`,
        periodPnl:  sql<number>`coalesce(sum(profit::numeric), 0)::float`,
        wins:       sql<number>`count(*) filter (where profit::numeric >= 0)::int`,
      })
      .from(tradesTable)
      .where(where);

    const rows = await db
      .select({ trade: tradesTable, strategy: strategiesTable })
      .from(tradesTable)
      .leftJoin(strategiesTable, eq(tradesTable.strategyId, strategiesTable.id))
      .where(where)
      .orderBy(desc(tradesTable.closedAt))
      .limit(limit)
      .offset(offset);

    res.json({
      trades:     rows.map(({ trade, strategy }) => mapTrade(trade, strategy)),
      total:      aggRow.total,
      page,
      pages:      Math.ceil(aggRow.total / limit),
      limit,
      periodPnl:  aggRow.periodPnl,
      periodWins: aggRow.wins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Open trades for logged-in user (shown on dashboard as live trades)
router.get("/open", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db
      .select({ trade: tradesTable })
      .from(tradesTable)
      .where(and(eq(tradesTable.userId, req.user!.id), eq(tradesTable.status, "open")))
      .orderBy(desc(tradesTable.openedAt));
    res.json(trades.map(({ trade }) => mapTrade(trade, null)));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cleanup: delete trades older than 2 years (called by cron)
export async function purgeOldTrades() {
  const twoYearsAgo = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1_000);
  const result = await db.delete(tradesTable).where(lt(tradesTable.closedAt, twoYearsAgo));
  return result;
}

export default router;
