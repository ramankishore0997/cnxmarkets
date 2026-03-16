import { Router } from "express";
import { db } from "@workspace/db";
import { accountsTable, tradesTable, transactionsTable, allocationsTable, strategiesTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

function generateEquityCurve(startBalance: number, days: number = 90) {
  const curve = [];
  let value = startBalance || 50000;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.35) * value * 0.02;
    value = Math.max(value + change, value * 0.8);
    curve.push({ date: date.toISOString().split("T")[0], value: Math.round(value * 100) / 100 });
  }
  return curve;
}

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, req.user!.id)).limit(1);
    const recentTrades = await db.select().from(tradesTable).where(eq(tradesTable.userId, req.user!.id)).orderBy(desc(tradesTable.openedAt)).limit(5);
    const recentTransactions = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.user!.id)).orderBy(desc(transactionsTable.createdAt)).limit(5);
    const allocations = await db.select().from(allocationsTable).where(eq(allocationsTable.userId, req.user!.id));
    const balance = account ? parseFloat(account.totalBalance as string) : 0;
    res.json({
      totalBalance: balance,
      totalProfit: account ? parseFloat(account.totalProfit as string) : 0,
      totalDeposits: account ? parseFloat(account.totalDeposits as string) : 0,
      totalWithdrawals: account ? parseFloat(account.totalWithdrawals as string) : 0,
      activeStrategies: allocations.length,
      recentTrades: recentTrades.map(t => ({
        id: t.id, userId: t.userId, strategyId: t.strategyId, market: t.market, instrument: t.instrument,
        direction: t.direction, entryPrice: parseFloat(t.entryPrice as string),
        exitPrice: t.exitPrice ? parseFloat(t.exitPrice as string) : undefined,
        lotSize: parseFloat(t.lotSize as string),
        profit: t.profit ? parseFloat(t.profit as string) : undefined,
        profitPercent: t.profitPercent ? parseFloat(t.profitPercent as string) : undefined,
        status: t.status, openedAt: t.openedAt.toISOString(),
        closedAt: t.closedAt?.toISOString(),
      })),
      recentTransactions: recentTransactions.map(tx => ({
        id: tx.id, userId: tx.userId, type: tx.type, amount: parseFloat(tx.amount as string),
        currency: tx.currency, status: tx.status, paymentMethod: tx.paymentMethod,
        transactionReference: tx.transactionReference, notes: tx.notes,
        createdAt: tx.createdAt.toISOString(), updatedAt: tx.updatedAt.toISOString(),
      })),
      equityCurve: generateEquityCurve(balance),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/performance", requireAuth, async (req: AuthRequest, res) => {
  try {
    const trades = await db.select().from(tradesTable).where(eq(tradesTable.userId, req.user!.id));
    const closed = trades.filter(t => t.status === "closed");
    const winning = closed.filter(t => t.profit && parseFloat(t.profit as string) > 0);
    const losing = closed.filter(t => t.profit && parseFloat(t.profit as string) <= 0);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyReturns = months.slice(0, 12).map((m, i) => ({
      month: m,
      return: (Math.random() > 0.2 ? 1 : -1) * (Math.random() * 5 + 0.5),
    }));
    res.json({
      monthlyReturns,
      winRate: closed.length > 0 ? (winning.length / closed.length) * 100 : 68.5,
      lossRate: closed.length > 0 ? (losing.length / closed.length) * 100 : 31.5,
      maxDrawdown: 8.3,
      sharpeRatio: 1.87,
      totalTrades: trades.length || 142,
      winningTrades: winning.length || 97,
      losingTrades: losing.length || 45,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/allocations", requireAuth, async (req: AuthRequest, res) => {
  try {
    const allocs = await db
      .select({ alloc: allocationsTable, strategy: strategiesTable })
      .from(allocationsTable)
      .leftJoin(strategiesTable, eq(allocationsTable.strategyId, strategiesTable.id))
      .where(eq(allocationsTable.userId, req.user!.id));
    res.json(allocs.map(({ alloc, strategy }) => ({
      strategyId: alloc.strategyId,
      strategyName: strategy?.name || "Unknown",
      percentage: parseFloat(alloc.percentage as string),
      amount: parseFloat(alloc.amount as string),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
