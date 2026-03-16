import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, kycDocumentsTable, transactionsTable, strategiesTable, accountsTable, notificationsTable } from "@workspace/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { requireAdmin, type AuthRequest } from "../middlewares/authMiddleware.js";

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
      isActive: user.isActive, totalBalance: account ? parseFloat(account.totalBalance as string) : 0,
      createdAt: user.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/users/:id", requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { isActive, role, kycStatus } = req.body;
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (isActive !== undefined) updates.isActive = isActive;
    if (role !== undefined) updates.role = role;
    if (kycStatus !== undefined) updates.kycStatus = kycStatus;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, parseInt(req.params.id))).returning();
    res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
      isActive: user.isActive, createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/kyc", requireAdmin, async (_req, res) => {
  try {
    const docs = await db
      .select({ doc: kycDocumentsTable, user: usersTable })
      .from(kycDocumentsTable)
      .leftJoin(usersTable, eq(kycDocumentsTable.userId, usersTable.id))
      .orderBy(desc(kycDocumentsTable.submittedAt));
    res.json(docs.map(({ doc, user }) => ({
      id: doc.id, userId: doc.userId,
      userEmail: user?.email || "", userName: `${user?.firstName} ${user?.lastName}`,
      idDocumentType: doc.idDocumentType, idDocumentUrl: doc.idDocumentUrl,
      addressProofType: doc.addressProofType, addressProofUrl: doc.addressProofUrl,
      status: doc.status, rejectionReason: doc.rejectionReason,
      submittedAt: doc.submittedAt?.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/kyc/:id", requireAdmin, async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    const [doc] = await db.update(kycDocumentsTable)
      .set({ status, rejectionReason, reviewedAt: new Date() })
      .where(eq(kycDocumentsTable.id, parseInt(req.params.id))).returning();
    await db.update(usersTable).set({ kycStatus: status }).where(eq(usersTable.id, doc.userId));
    res.json({ message: "KYC updated successfully", success: true });
  } catch (err) {
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
      notes: tx.notes, createdAt: tx.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/transactions/:id", requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.update(transactionsTable)
      .set({ status, notes, updatedAt: new Date() })
      .where(eq(transactionsTable.id, parseInt(req.params.id)));
    res.json({ message: "Transaction updated successfully", success: true });
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

export default router;
