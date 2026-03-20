import { Router } from "express";
import { randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable, kycDocumentsTable, transactionsTable, strategiesTable, accountsTable, notificationsTable, tradesTable, adminSettingsTable, binaryTradesTable } from "@workspace/db/schema";
import { eq, desc, sql, and, gte, lte, inArray, ne } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/authMiddleware.js";
import { generateToken, hashPassword } from "../lib/auth.js";
import { closeUserOpenTradesNow } from "../services/tradeCron.js";

const JWT_SECRET = process.env.JWT_SECRET || "ecmarkets-secret-key-2024";

const SUPABASE_URL = "https://walzicfjkwiifeldzppx.supabase.co";
const SUPABASE_BUCKET = "kyc-documents";

async function getSignedUrl(filePath: string | null | undefined): Promise<string | null> {
  if (!filePath) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return filePath;
  if (!filePath.includes(SUPABASE_BUCKET)) return filePath;

  const filename = filePath.split(`/${SUPABASE_BUCKET}/`)[1];
  if (!filename) return filePath;

  try {
    const signUrl = `${SUPABASE_URL}/storage/v1/object/sign/${SUPABASE_BUCKET}/${filename}`;
    const response = await fetch(signUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    });
    if (!response.ok) return filePath;
    const data = (await response.json()) as { signedURL?: string };
    return data.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : filePath;
  } catch {
    return filePath;
  }
}

const router = Router();

router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    const [activeCount] = await db.select({ count: sql<number>`count(*)` }).from(usersTable).where(eq(usersTable.isActive, true));
    const deposits = await db.select({ sum: sql<string>`sum(amount)`, count: sql<number>`count(*)` }).from(transactionsTable).where(eq(transactionsTable.type, "deposit"));
    const withdrawals = await db.select({ sum: sql<string>`sum(amount)`, count: sql<number>`count(*)` }).from(transactionsTable).where(eq(transactionsTable.type, "withdrawal"));
    const pendingDeposits = await db.select({ count: sql<number>`count(*)` }).from(transactionsTable).where(sql`type = 'deposit' AND status = 'pending'`);
    const pendingWithdrawals = await db.select({ count: sql<number>`count(*)` }).from(transactionsTable).where(sql`type = 'withdrawal' AND status = 'pending'`);
    const pendingKyc = await db.select({ count: sql<number>`count(*)` }).from(kycDocumentsTable).where(eq(kycDocumentsTable.status, "submitted"));
    const [stratCount] = await db.select({ count: sql<number>`count(*)` }).from(strategiesTable);
    res.json({
      totalUsers: Number(userCount.count),
      activeUsers: Number(activeCount.count),
      totalDeposits: parseFloat(deposits[0]?.sum || "0"),
      totalWithdrawals: parseFloat(withdrawals[0]?.sum || "0"),
      pendingDeposits: Number(pendingDeposits[0]?.count),
      pendingWithdrawals: Number(pendingWithdrawals[0]?.count),
      pendingKyc: Number(pendingKyc[0]?.count),
      totalStrategies: Number(stratCount.count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/users", requireAdmin, async (_req, res) => {
  try {
    const users = await db
      .select({ user: usersTable, account: accountsTable })
      .from(usersTable)
      .leftJoin(accountsTable, eq(usersTable.id, accountsTable.userId))
      .orderBy(desc(usersTable.createdAt));
    res.json(users.map(({ user, account }) => ({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
      isActive: user.isActive,
      totalBalance: account ? parseFloat(account.totalBalance as string) : 0,
      assignedStrategyId: account?.assignedStrategyId ?? null,
      assignedStrategy: account?.assignedStrategy ?? null,
      dailyGrowthTarget: account?.dailyGrowthTarget ? parseFloat(account.dailyGrowthTarget as string) : null,
      createdAt: user.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/users/:id", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { isActive, role, kycStatus, totalBalance, assignedStrategy, dailyGrowthTarget } = req.body;

    const userUpdates: Record<string, unknown> = { updatedAt: new Date() };
    if (isActive !== undefined) userUpdates.isActive = isActive;
    if (role !== undefined) userUpdates.role = role;
    if (kycStatus !== undefined) userUpdates.kycStatus = kycStatus;

    const [user] = await db.update(usersTable).set(userUpdates).where(eq(usersTable.id, userId)).returning();

    const { assignedStrategyId } = req.body;

    let resolvedStrategyName: string | null = assignedStrategy ?? undefined;
    let resolvedStrategyId: number | null = assignedStrategyId ?? undefined;

    if (assignedStrategyId !== undefined) {
      if (assignedStrategyId === null || assignedStrategyId === 0) {
        resolvedStrategyName = null;
        resolvedStrategyId = null;
      } else {
        const [strat] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, parseInt(String(assignedStrategyId)))).limit(1);
        if (strat) {
          resolvedStrategyName = strat.name;
          resolvedStrategyId = strat.id;
        }
      }
    } else if (assignedStrategy !== undefined) {
      resolvedStrategyName = assignedStrategy || null;
      resolvedStrategyId = undefined as any;
    }

    const accountUpdates: Record<string, unknown> = { updatedAt: new Date() };

    if (totalBalance !== undefined) {
      // Dashboard uses canonical formula: deposits - withdrawals + profit.
      // To make admin-set balance actually show up, we must back-calculate totalDeposits.
      const [acc] = await db.select().from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);
      const [algoAgg] = await db.select({ sum: sql<number>`coalesce(sum(profit::numeric), 0)::float` })
        .from(tradesTable).where(and(eq(tradesTable.userId, userId), eq(tradesTable.status, "closed")));
      const [binAgg] = await db.select({ sum: sql<number>`coalesce(sum(profit::numeric), 0)::float` })
        .from(binaryTradesTable).where(and(eq(binaryTradesTable.userId, userId), ne(binaryTradesTable.status, "open")));
      const computedProfit = (algoAgg?.sum ?? 0) + (binAgg?.sum ?? 0);
      const currentWithdrawals = acc ? parseFloat(acc.totalWithdrawals as string) : 0;
      // newDeposits such that: newDeposits - currentWithdrawals + computedProfit = desiredBalance
      const newDeposits = Math.max(0, totalBalance - computedProfit + currentWithdrawals);
      accountUpdates.totalBalance   = totalBalance.toString();
      accountUpdates.totalDeposits  = newDeposits.toFixed(2);
      accountUpdates.totalProfit    = computedProfit.toFixed(2);
      console.log(`[AdminUpdateBalance] userId=${userId} desiredBalance=${totalBalance} computedProfit=${computedProfit} currentWithdrawals=${currentWithdrawals} newDeposits=${newDeposits}`);
    }

    if (resolvedStrategyId !== undefined) accountUpdates.assignedStrategyId = resolvedStrategyId;
    if (resolvedStrategyName !== undefined) accountUpdates.assignedStrategy = resolvedStrategyName;
    if (dailyGrowthTarget !== undefined) accountUpdates.dailyGrowthTarget = dailyGrowthTarget?.toString() ?? null;

    if (Object.keys(accountUpdates).length > 1) {
      const existing = await db.select().from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);
      if (existing.length > 0) {
        await db.update(accountsTable).set(accountUpdates).where(eq(accountsTable.userId, userId));
      } else {
        await db.insert(accountsTable).values({
          userId,
          totalBalance: (totalBalance ?? 0).toString(),
          totalProfit: "0", totalDeposits: (totalBalance ?? 0).toString(), totalWithdrawals: "0",
          assignedStrategy: assignedStrategy ?? null,
          dailyGrowthTarget: dailyGrowthTarget?.toString() ?? null,
        });
      }
    }

    // Force-close open trades if admin sets growth = 0 or balance = 0
    const growthSetToZero = dailyGrowthTarget !== undefined && parseFloat(String(dailyGrowthTarget ?? 0)) <= 0;
    const balanceSetToZero = totalBalance !== undefined && Number(totalBalance) <= 0;
    if (growthSetToZero || balanceSetToZero) {
      const reason = growthSetToZero ? "admin_set_growth=0" : "admin_set_balance=0";
      void closeUserOpenTradesNow(userId, reason);
    }

    const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);

    res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
      isActive: user.isActive,
      totalBalance: account ? parseFloat(account.totalBalance as string) : 0,
      assignedStrategy: account?.assignedStrategy ?? null,
      dailyGrowthTarget: account?.dailyGrowthTarget ? parseFloat(account.dailyGrowthTarget as string) : null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Change a user's password
router.patch("/users/:id/password", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }
    const hashed = await hashPassword(password);
    await db.update(usersTable).set({ passwordHash: hashed, updatedAt: new Date() } as any).where(eq(usersTable.id, userId));
    res.json({ message: "Password updated successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get KYC document for a specific user
router.get("/users/:id/kyc", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, userId)).limit(1);
    if (!doc) { res.json(null); return; }
    const [panFront, panBack, aadharFront, aadharBack] = await Promise.all([
      getSignedUrl(doc.panCardFrontUrl),
      getSignedUrl(doc.panCardBackUrl),
      getSignedUrl(doc.aadharCardFrontUrl),
      getSignedUrl(doc.aadharCardBackUrl),
    ]);
    res.json({
      id: doc.id, userId: doc.userId,
      panNumber: doc.panNumber, aadharNumber: doc.aadharNumber,
      panCardFrontUrl: panFront, panCardBackUrl: panBack,
      aadharCardFrontUrl: aadharFront, aadharCardBackUrl: aadharBack,
      status: doc.status, rejectionReason: doc.rejectionReason,
      submittedAt: doc.submittedAt?.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kyc", requireAdmin, async (_req, res) => {
  try {
    console.log("[AdminKYC] GET /admin/kyc called — fetching all KYC records...");
    // Fetch all kyc_documents with user info
    const docs = await db
      .select({ doc: kycDocumentsTable, user: usersTable })
      .from(kycDocumentsTable)
      .leftJoin(usersTable, eq(kycDocumentsTable.userId, usersTable.id))
      .orderBy(desc(kycDocumentsTable.submittedAt));

    const docsWithUserIds = new Set(docs.map(({ doc }) => doc.userId));

    // Also find users with any non-pending kycStatus who have NO document record
    const usersWithStatus = await db
      .select()
      .from(usersTable)
      .where(inArray(usersTable.kycStatus, ["submitted", "approved", "rejected"]));

    const ghostEntries = usersWithStatus
      .filter(u => !docsWithUserIds.has(u.id))
      .map(u => ({
        id: -(u.id),
        userId: u.id,
        userEmail: u.email || "",
        userName: `${u.firstName} ${u.lastName}`,
        panNumber: null,
        aadharNumber: null,
        panCardFrontUrl: null,
        panCardBackUrl: null,
        aadharCardFrontUrl: null,
        aadharCardBackUrl: null,
        idDocumentType: null,
        idDocumentUrl: null,
        addressProofType: null,
        addressProofUrl: null,
        status: u.kycStatus,
        rejectionReason: null,
        submittedAt: null,
        noDocuments: true,
      }));

    const signedDocs = await Promise.all(
      docs.map(async ({ doc, user }) => {
        const [panFront, panBack, aadharFront, aadharBack] = await Promise.all([
          getSignedUrl(doc.panCardFrontUrl),
          getSignedUrl(doc.panCardBackUrl),
          getSignedUrl(doc.aadharCardFrontUrl),
          getSignedUrl(doc.aadharCardBackUrl),
        ]);
        return {
          id: doc.id, userId: doc.userId,
          userEmail: user?.email || "", userName: `${user?.firstName} ${user?.lastName}`,
          panNumber: doc.panNumber,
          aadharNumber: doc.aadharNumber,
          panCardFrontUrl: panFront,
          panCardBackUrl: panBack,
          aadharCardFrontUrl: aadharFront,
          aadharCardBackUrl: aadharBack,
          idDocumentType: doc.idDocumentType, idDocumentUrl: doc.idDocumentUrl,
          addressProofType: doc.addressProofType, addressProofUrl: doc.addressProofUrl,
          status: doc.status, rejectionReason: doc.rejectionReason,
          submittedAt: doc.submittedAt?.toISOString(),
          noDocuments: false,
        };
      })
    );

    const result = [...signedDocs, ...ghostEntries];

    console.log(`[AdminKYC] Returning ${result.length} entries (${docs.length} real docs + ${ghostEntries.length} ghost entries). Statuses: ${result.map(r => `${r.userId}=${r.status}(docs:${!r.noDocuments})`).join(", ")}`);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/kyc/:id", requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const rawId = parseInt(req.params.id);

    if (rawId < 0) {
      // Ghost entry: no document record, only update user kycStatus
      const userId = Math.abs(rawId);
      await db.update(usersTable).set({ kycStatus: status }).where(eq(usersTable.id, userId));
      res.json({ message: "KYC status updated successfully", success: true });
      return;
    }

    const [doc] = await db.update(kycDocumentsTable)
      .set({ status, rejectionReason, reviewedAt: new Date() })
      .where(eq(kycDocumentsTable.id, rawId)).returning();
    await db.update(usersTable).set({ kycStatus: status }).where(eq(usersTable.id, doc.userId));
    res.json({ message: "KYC updated successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/kyc/:id", requireAdmin, async (req, res) => {
  try {
    const kycId = parseInt(req.params.id);
    const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.id, kycId)).limit(1);
    if (!doc) { res.status(404).json({ message: "KYC record not found" }); return; }
    await db.delete(kycDocumentsTable).where(eq(kycDocumentsTable.id, kycId));
    await db.update(usersTable).set({ kycStatus: "pending" }).where(eq(usersTable.id, doc.userId));
    res.json({ message: "KYC record deleted successfully", success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/trades", requireAdmin, async (req, res) => {
  try {
    const { userId, instrument, market, direction, entryPrice, exitPrice, lotSize, profit, profitPercent, status, openedAt, closedAt } = req.body;
    if (!userId || !instrument || !market || !direction || !entryPrice || !lotSize) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const [trade] = await db.insert(tradesTable).values({
      userId,
      instrument,
      market,
      direction,
      entryPrice: entryPrice.toString(),
      exitPrice: exitPrice?.toString() ?? null,
      lotSize: lotSize.toString(),
      profit: profit?.toString() ?? null,
      profitPercent: profitPercent?.toString() ?? null,
      status: status || "closed",
      openedAt: openedAt ? new Date(openedAt) : new Date(),
      closedAt: closedAt ? new Date(closedAt) : (status === "closed" ? new Date() : null),
    }).returning();

    if (profit && parseFloat(profit.toString()) !== 0) {
      const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, userId)).limit(1);
      if (account) {
        const currentBalance = parseFloat(account.totalBalance as string);
        const currentProfit = parseFloat(account.totalProfit as string);
        const profitAmt = parseFloat(profit.toString());
        await db.update(accountsTable).set({
          totalBalance: (currentBalance + profitAmt).toString(),
          totalProfit: (currentProfit + profitAmt).toString(),
          updatedAt: new Date(),
        }).where(eq(accountsTable.userId, userId));
      }
    }

    res.status(201).json({
      id: trade.id, userId: trade.userId, market: trade.market, instrument: trade.instrument,
      direction: trade.direction, entryPrice: parseFloat(trade.entryPrice as string),
      exitPrice: trade.exitPrice ? parseFloat(trade.exitPrice as string) : undefined,
      lotSize: parseFloat(trade.lotSize as string),
      profit: trade.profit ? parseFloat(trade.profit as string) : undefined,
      profitPercent: trade.profitPercent ? parseFloat(trade.profitPercent as string) : undefined,
      status: trade.status, openedAt: trade.openedAt.toISOString(),
      closedAt: trade.closedAt?.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/transactions", requireAdmin, async (_req, res) => {
  try {
    const txs = await db
      .select({ tx: transactionsTable, user: usersTable })
      .from(transactionsTable)
      .leftJoin(usersTable, eq(transactionsTable.userId, usersTable.id))
      .orderBy(desc(transactionsTable.createdAt));
    res.json(txs.map(({ tx, user }) => ({
      id: tx.id, userId: tx.userId, userEmail: user?.email || "",
      userName: `${user?.firstName} ${user?.lastName}`, type: tx.type,
      amount: parseFloat(tx.amount as string), currency: tx.currency, status: tx.status,
      paymentMethod: tx.paymentMethod, transactionReference: tx.transactionReference,
      notes: tx.notes,
      bankName: tx.bankName, accountNumber: tx.accountNumber,
      ifscCode: tx.ifscCode, accountHolderName: tx.accountHolderName,
      createdAt: tx.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/transactions/:id", requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    const txId = parseInt(req.params.id);
    const [tx] = await db.update(transactionsTable)
      .set({ status, notes, updatedAt: new Date() })
      .where(eq(transactionsTable.id, txId)).returning();

    if (status === "approved" && tx.type === "deposit") {
      const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, tx.userId)).limit(1);
      if (account) {
        const amount = parseFloat(tx.amount as string);
        await db.update(accountsTable).set({
          totalBalance: (parseFloat(account.totalBalance as string) + amount).toString(),
          totalDeposits: (parseFloat(account.totalDeposits as string) + amount).toString(),
          updatedAt: new Date(),
        }).where(eq(accountsTable.userId, tx.userId));
      }
    }
    if (status === "approved" && tx.type === "withdrawal") {
      const [account] = await db.select().from(accountsTable).where(eq(accountsTable.userId, tx.userId)).limit(1);
      if (account) {
        const amount = parseFloat(tx.amount as string);
        await db.update(accountsTable).set({
          totalBalance: Math.max(0, parseFloat(account.totalBalance as string) - amount).toString(),
          totalWithdrawals: (parseFloat(account.totalWithdrawals as string) + amount).toString(),
          updatedAt: new Date(),
        }).where(eq(accountsTable.userId, tx.userId));
      }
    }

    res.json({ message: "Transaction updated successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── Update USDT address for a specific withdrawal transaction ── */
router.patch("/transactions/:id/usdt-address", requireAdmin, async (req, res) => {
  try {
    const txId = parseInt(req.params.id);
    const { usdtAddress } = req.body;
    if (!usdtAddress || typeof usdtAddress !== "string" || usdtAddress.trim().length < 10) {
      return res.status(400).json({ message: "Invalid USDT address" });
    }
    const [tx] = await db.select().from(transactionsTable).where(eq(transactionsTable.id, txId)).limit(1);
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    if (tx.type !== "withdrawal") return res.status(400).json({ message: "Not a withdrawal transaction" });

    await db.update(transactionsTable)
      .set({ usdtAddress: usdtAddress.trim(), updatedAt: new Date() })
      .where(eq(transactionsTable.id, txId));

    res.json({ success: true, message: "USDT address updated" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/strategies", requireAdmin, async (_req, res) => {
  try {
    const strats = await db.select().from(strategiesTable).orderBy(strategiesTable.name);
    res.json(strats.map(s => ({
      id: s.id, name: s.name, description: s.description, riskProfile: s.riskProfile,
      minCapital: parseFloat(s.minCapital as string), winRate: parseFloat(s.winRate as string),
      maxDrawdown: parseFloat(s.maxDrawdown as string), monthlyReturn: parseFloat(s.monthlyReturn as string),
      markets: s.markets, isActive: s.isActive, createdAt: s.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/strategies", requireAdmin, async (req, res) => {
  try {
    const { name, description, riskProfile, minCapital, winRate, maxDrawdown, monthlyReturn, markets, isActive } = req.body;
    const [strategy] = await db.insert(strategiesTable).values({
      name, description, riskProfile, minCapital: minCapital.toString(), winRate: winRate.toString(),
      maxDrawdown: maxDrawdown.toString(), monthlyReturn: monthlyReturn.toString(), markets,
      isActive: isActive ?? true,
    }).returning();
    res.status(201).json({
      id: strategy.id, name: strategy.name, description: strategy.description, riskProfile: strategy.riskProfile,
      minCapital: parseFloat(strategy.minCapital as string), winRate: parseFloat(strategy.winRate as string),
      maxDrawdown: parseFloat(strategy.maxDrawdown as string), monthlyReturn: parseFloat(strategy.monthlyReturn as string),
      markets: strategy.markets, isActive: strategy.isActive, createdAt: strategy.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/strategies/:id", requireAdmin, async (req, res) => {
  try {
    const { name, description, riskProfile, minCapital, winRate, maxDrawdown, monthlyReturn, markets, isActive } = req.body;
    const [strategy] = await db.update(strategiesTable).set({
      name, description, riskProfile, minCapital: minCapital?.toString(), winRate: winRate?.toString(),
      maxDrawdown: maxDrawdown?.toString(), monthlyReturn: monthlyReturn?.toString(), markets, isActive, updatedAt: new Date(),
    }).where(eq(strategiesTable.id, parseInt(req.params.id))).returning();
    res.json({
      id: strategy.id, name: strategy.name, description: strategy.description, riskProfile: strategy.riskProfile,
      minCapital: parseFloat(strategy.minCapital as string), winRate: parseFloat(strategy.winRate as string),
      maxDrawdown: parseFloat(strategy.maxDrawdown as string), monthlyReturn: parseFloat(strategy.monthlyReturn as string),
      markets: strategy.markets, isActive: strategy.isActive, createdAt: strategy.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/strategies/:id", requireAdmin, async (req, res) => {
  try {
    const stratId = parseInt(req.params.id);
    await db.delete(strategiesTable).where(eq(strategiesTable.id, stratId));
    res.json({ message: "Strategy deleted", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: paginated trade history for a specific user
router.get("/trades/user/:userId", requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;
    const fromDate = req.query.from ? new Date(req.query.from as string) : undefined;
    const toDate = req.query.to ? new Date(req.query.to as string) : undefined;

    const conditions: any[] = [eq(tradesTable.userId, userId)];
    if (fromDate) conditions.push(gte(tradesTable.closedAt, fromDate));
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(tradesTable.closedAt, end));
    }
    const where = and(...conditions);

    const [{ total }] = await db
      .select({ total: sql<number>`count(*)::int` })
      .from(tradesTable)
      .where(where);

    const rows = await db
      .select()
      .from(tradesTable)
      .where(where)
      .orderBy(desc(tradesTable.closedAt))
      .limit(limit)
      .offset(offset);

    const trades = rows.map(t => ({
      id: t.id,
      userId: t.userId,
      strategyId: t.strategyId,
      market: t.market,
      instrument: t.instrument,
      direction: t.direction,
      entryPrice: parseFloat(t.entryPrice as string),
      exitPrice: t.exitPrice ? parseFloat(t.exitPrice as string) : undefined,
      lotSize: parseFloat(t.lotSize as string),
      profit: t.profit ? parseFloat(t.profit as string) : undefined,
      profitPercent: t.profitPercent ? parseFloat(t.profitPercent as string) : undefined,
      status: t.status,
      openedAt: t.openedAt.toISOString(),
      closedAt: t.closedAt?.toISOString(),
    }));

    res.json({ trades, total, page, pages: Math.ceil(total / limit), limit });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/live-trades", requireAdmin, async (_req, res) => {
  try {
    const rows = await db
      .select({
        id:          tradesTable.id,
        userId:      tradesTable.userId,
        market:      tradesTable.market,
        instrument:  tradesTable.instrument,
        direction:   tradesTable.direction,
        entryPrice:  tradesTable.entryPrice,
        lotSize:     tradesTable.lotSize,
        status:      tradesTable.status,
        openedAt:    tradesTable.openedAt,
        firstName:   usersTable.firstName,
        lastName:    usersTable.lastName,
        email:       usersTable.email,
      })
      .from(tradesTable)
      .innerJoin(usersTable, eq(tradesTable.userId, usersTable.id))
      .where(eq(tradesTable.status, "open"))
      .orderBy(desc(tradesTable.openedAt));

    res.json(rows.map(r => ({
      ...r,
      entryPrice: parseFloat(r.entryPrice as string),
      lotSize:    parseFloat(r.lotSize as string),
      openedAt:   r.openedAt.toISOString(),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/notifications/send", requireAdmin, async (req, res) => {
  try {
    const { title, message, type, targetUserId } = req.body;
    if (targetUserId) {
      await db.insert(notificationsTable).values({ userId: targetUserId, title, message, type: type || "info" });
    } else {
      const users = await db.select({ id: usersTable.id }).from(usersTable);
      for (const user of users) {
        await db.insert(notificationsTable).values({ userId: user.id, title, message, type: type || "info" });
      }
    }
    res.json({ message: "Notification sent", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── Magic Link helpers ───────────────────────────── */
async function getOrCreateMagicLinkSettings() {
  const [existing] = await db.select().from(adminSettingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(adminSettingsTable)
    .values({ magicLinkToken: randomBytes(48).toString("hex") })
    .returning();
  return created;
}

/* ── GET /api/admin/settings/magic-link ─────────── */
router.get("/settings/magic-link", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateMagicLinkSettings();
    res.json({ token: settings.magicLinkToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/admin/settings/rotate-token ──────── */
router.post("/settings/rotate-token", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateMagicLinkSettings();
    const newToken = randomBytes(48).toString("hex");
    const [updated] = await db
      .update(adminSettingsTable)
      .set({ magicLinkToken: newToken, updatedAt: new Date() })
      .where(eq(adminSettingsTable.id, settings.id))
      .returning();
    res.json({ token: updated.magicLinkToken, message: "Token rotated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── GET /api/admin/force-login ────────────────────
   TEMPORARY — bypasses auth, issues 24-hour admin JWT.
   Remove this route once the custom domain is confirmed working. */
router.get("/force-login", async (_req, res) => {
  try {
    let result = await db.execute(
      sql`SELECT id, email, role, first_name, last_name FROM users WHERE role = 'admin' ORDER BY id ASC LIMIT 1`
    );
    let rows = result.rows as any[];

    if (!rows || rows.length === 0) {
      result = await db.execute(
        sql`SELECT id, email, role, first_name, last_name FROM users WHERE email = 'admin@ecmarketsindia.com' LIMIT 1`
      );
      rows = result.rows as any[];
    }

    if (!rows || rows.length === 0) {
      result = await db.execute(
        sql`SELECT id, email, role, first_name, last_name FROM users ORDER BY id ASC LIMIT 1`
      );
      rows = result.rows as any[];
    }

    if (!rows || rows.length === 0) {
      const allUsers = await db.execute(sql`SELECT id, email, role FROM users ORDER BY id ASC LIMIT 10`);
      res.status(404).json({ message: "No users found in database", debug: allUsers.rows });
      return;
    }

    const admin = rows[0];
    const token = jwt.sign(
      { id: Number(admin.id), email: String(admin.email), role: String(admin.role) },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({
      token,
      user: {
        id: Number(admin.id),
        email: String(admin.email),
        firstName: String(admin.first_name || "Admin"),
        lastName: String(admin.last_name || ""),
        role: String(admin.role),
      },
    });
  } catch (err: any) {
    console.error("force-login error:", err);
    res.status(500).json({ message: "Internal server error", error: String(err?.message) });
  }
});

/* ── GET /api/admin/auto-login/:token ─────────────
   Public — no requireAdmin, this IS the login mechanism */
router.get("/auto-login/:token", async (req, res) => {
  try {
    const { token } = req.params;
    if (!token || token.length < 32) {
      res.status(401).json({ message: "Invalid access token" });
      return;
    }
    const [settings] = await db.select().from(adminSettingsTable).limit(1);
    if (!settings || settings.magicLinkToken !== token) {
      res.status(401).json({ message: "Invalid or expired magic link" });
      return;
    }
    const [admin] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.role, "admin"))
      .limit(1);
    if (!admin) {
      res.status(404).json({ message: "Admin account not found" });
      return;
    }
    const jwtToken = generateToken({ id: admin.id, email: admin.email, role: admin.role });
    res.json({
      token: jwtToken,
      user: { id: admin.id, email: admin.email, firstName: admin.firstName, lastName: admin.lastName, role: admin.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/binary-trades", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { userId, status, page = '1', limit = '50' } = req.query;
    const pageN = Math.max(1, parseInt(String(page)) || 1);
    const limitN = Math.min(200, parseInt(String(limit)) || 50);
    const offset = (pageN - 1) * limitN;

    const conditions: any[] = [];
    if (userId) conditions.push(eq(binaryTradesTable.userId, parseInt(String(userId))));
    if (status && status !== 'all') conditions.push(eq(binaryTradesTable.status, String(status)));

    const baseQuery = db
      .select({
        id: binaryTradesTable.id,
        userId: binaryTradesTable.userId,
        instrument: binaryTradesTable.instrument,
        direction: binaryTradesTable.direction,
        entryPrice: binaryTradesTable.entryPrice,
        closingPrice: binaryTradesTable.closingPrice,
        amount: binaryTradesTable.amount,
        duration: binaryTradesTable.duration,
        payoutPct: binaryTradesTable.payoutPct,
        status: binaryTradesTable.status,
        profit: binaryTradesTable.profit,
        openedAt: binaryTradesTable.openedAt,
        closedAt: binaryTradesTable.closedAt,
        userEmail: usersTable.email,
        userFirstName: usersTable.firstName,
        userLastName: usersTable.lastName,
      })
      .from(binaryTradesTable)
      .leftJoin(usersTable, eq(binaryTradesTable.userId, usersTable.id));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const [allRows, trades] = await Promise.all([
      whereClause
        ? db.select({ id: binaryTradesTable.id }).from(binaryTradesTable).where(whereClause)
        : db.select({ id: binaryTradesTable.id }).from(binaryTradesTable),
      whereClause
        ? baseQuery.where(whereClause).orderBy(desc(binaryTradesTable.openedAt)).limit(limitN).offset(offset)
        : baseQuery.orderBy(desc(binaryTradesTable.openedAt)).limit(limitN).offset(offset),
    ]);

    res.json({ trades, total: allRows.length, pages: Math.ceil(allRows.length / limitN) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/binary-trades/:id", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) { res.status(400).json({ message: "Invalid ID" }); return; }
    await db.delete(binaryTradesTable).where(eq(binaryTradesTable.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
