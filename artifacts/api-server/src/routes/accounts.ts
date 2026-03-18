import { Router } from "express";
import { db } from "@workspace/db";
import { accountsTable, tradesTable, transactionsTable, allocationsTable, strategiesTable, usersTable } from "@workspace/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const RAZR_MIN_BALANCE = 20_000;

const router = Router();

router.get("/dashboard", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, req.user!.id)).limit(1);
    const [userRow] = await db.select({ kycStatus: usersTable.kycStatus }).from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    const recentTrades = await db.select().from(tradesTable).where(eq(tradesTable.userId, req.user!.id)).orderBy(desc(tradesTable.openedAt)).limit(5);
    const recentTransactions = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.user!.id)).orderBy(desc(transactionsTable.createdAt)).limit(5);
    const allocations = await db.select().from(allocationsTable).where(eq(allocationsTable.userId, req.user!.id));

    const rawDeposits    = account ? parseFloat(account.totalDeposits    as string) : 0;
    const rawWithdrawals = account ? parseFloat(account.totalWithdrawals as string) : 0;
    const rawProfit      = account ? parseFloat(account.totalProfit      as string) : 0;
    // Canonical balance = net deposited + net profit (prevents drift from incremental updates)
    const balance = rawDeposits - rawWithdrawals + rawProfit;
    // Auto-repair stored totalBalance if it drifted
    if (account && Math.abs(parseFloat(account.totalBalance as string) - balance) > 0.01) {
      await db.update(accountsTable).set({ totalBalance: balance.toFixed(2), updatedAt: new Date() }).where(eq(accountsTable.userId, req.user!.id));
    }

    let assignedStrategyDetails = null;
    if (account?.assignedStrategyId) {
      const [strat] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, account.assignedStrategyId)).limit(1);
      if (strat) {
        assignedStrategyDetails = {
          id: strat.id, name: strat.name, description: strat.description,
          riskProfile: strat.riskProfile, minCapital: parseFloat(strat.minCapital as string),
          winRate: parseFloat(strat.winRate as string), maxDrawdown: parseFloat(strat.maxDrawdown as string),
          monthlyReturn: parseFloat(strat.monthlyReturn as string), markets: strat.markets,
          isActive: strat.isActive, createdAt: strat.createdAt.toISOString(),
        };
      }
    }

    // Build equity curve from actual closed trades (no random values)
    const allClosedTrades = await db
      .select()
      .from(tradesTable)
      .where(and(eq(tradesTable.userId, req.user!.id), eq(tradesTable.status, "closed")))
      .orderBy(tradesTable.closedAt);

    let equityCurve: { date: string; value: number }[] = [];
    if (balance > 0) {
      const now = new Date();
      // Build a date → daily profit sum map from real trades
      const dailyProfits: Record<string, number> = {};
      allClosedTrades.forEach(t => {
        if (t.closedAt && t.profit) {
          const dateStr = new Date(t.closedAt).toISOString().split("T")[0];
          dailyProfits[dateStr] = (dailyProfits[dateStr] || 0) + parseFloat(t.profit as string);
        }
      });
      // Starting value = balance minus all-time profit (i.e. original capital)
      const totalProfitVal = account ? parseFloat(account.totalProfit as string) : 0;
      let running = Math.max(balance - totalProfitVal, 0);
      if (running === 0) running = balance;
      for (let i = 30; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        running = Math.max(running + (dailyProfits[dateStr] || 0), 0.01);
        equityCurve.push({ date: dateStr, value: Math.round(running * 100) / 100 });
      }
    }

    res.json({
      totalBalance: balance,
      totalProfit: account ? parseFloat(account.totalProfit as string) : 0,
      totalDeposits: account ? parseFloat(account.totalDeposits as string) : 0,
      totalWithdrawals: account ? parseFloat(account.totalWithdrawals as string) : 0,
      activeStrategies: allocations.length,
      assignedStrategyId: account?.assignedStrategyId ?? null,
      assignedStrategy: account?.assignedStrategy ?? null,
      assignedStrategyDetails,
      kycStatus: userRow?.kycStatus ?? 'pending',
      dailyGrowthTarget: account?.dailyGrowthTarget ? parseFloat(account.dailyGrowthTarget as string) : null,
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
      equityCurve,
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

    const monthlyReturnMap: Record<string, number> = {};
    closed.forEach(t => {
      if (t.closedAt && t.profit) {
        const month = new Date(t.closedAt).toLocaleString("default", { month: "short" });
        monthlyReturnMap[month] = (monthlyReturnMap[month] || 0) + parseFloat(t.profit as string);
      }
    });
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyReturns = months.map(m => ({ month: m, return: monthlyReturnMap[m] || 0 }));

    const winRate = closed.length > 0 ? (winning.length / closed.length) * 100 : 0;
    const lossRate = closed.length > 0 ? (losing.length / closed.length) * 100 : 0;
    const totalProfit = closed.reduce((s, t) => s + (t.profit ? parseFloat(t.profit as string) : 0), 0);

    res.json({
      monthlyReturns,
      winRate,
      lossRate,
      maxDrawdown: 0,
      sharpeRatio: 0,
      totalTrades: trades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      totalProfit,
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

router.post("/select-strategy", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { strategyId } = req.body;
    const userId = req.user!.id;
    const isAdmin = req.user!.role === 'admin';

    let resolvedName: string | null = null;
    let resolvedId: number | null = null;

    if (strategyId && strategyId !== 0) {
      const [strat] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, parseInt(String(strategyId)))).limit(1);
      if (!strat) { res.status(404).json({ message: "Strategy not found" }); return; }
      if (!strat.isActive) { res.status(400).json({ message: "Strategy is not available" }); return; }
      resolvedName = strat.name;
      resolvedId = strat.id;

      // Admin bypasses all checks
      if (!isAdmin) {
        // Step 1: KYC must be approved
        const [userRow] = await db.select({ kycStatus: usersTable.kycStatus }).from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        if (!userRow || userRow.kycStatus !== 'approved') {
          res.status(403).json({ message: "KYC verification required. Please complete your KYC before activating a strategy." });
          return;
        }

        // Step 2: Balance check for RazrMarket
        const nameLower = resolvedName.toLowerCase();
        if (nameLower.includes('razr') || nameLower.includes('razor')) {
          const [account] = await db.select({ totalBalance: accountsTable.totalBalance }).from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);
          const balance = account ? parseFloat(account.totalBalance as string) : 0;
          if (balance < RAZR_MIN_BALANCE) {
            res.status(403).json({
              message: `Insufficient Funds: A minimum balance of ₹${RAZR_MIN_BALANCE.toLocaleString('en-IN')} is required to activate the RazrMarket Strategy. Please deposit funds to continue.`
            });
            return;
          }
        }
      }
    }

    // Determine daily growth target: RazrMarket = 8% fixed, others = 4% fixed
    let dailyGrowthTarget: string | null = null;
    if (resolvedName) {
      const nameLower = resolvedName.toLowerCase();
      if (nameLower.includes('razr') || nameLower.includes('razor')) {
        dailyGrowthTarget = '8.0000'; // Fixed 8% for Razor Market
      } else {
        dailyGrowthTarget = '4.0000';
      }
    }

    const [existing] = await db.select().from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);
    if (existing) {
      await db.update(accountsTable).set({ assignedStrategyId: resolvedId, assignedStrategy: resolvedName, dailyGrowthTarget, updatedAt: new Date() }).where(eq(accountsTable.userId, userId));
    } else {
      await db.insert(accountsTable).values({ userId, totalBalance: "0", totalProfit: "0", totalDeposits: "0", totalWithdrawals: "0", assignedStrategyId: resolvedId, assignedStrategy: resolvedName, dailyGrowthTarget });
    }

    res.json({ message: "Strategy updated successfully", assignedStrategyId: resolvedId, assignedStrategy: resolvedName, dailyGrowthTarget });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
