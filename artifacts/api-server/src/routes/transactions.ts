import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

function fmtTx(tx: typeof transactionsTable.$inferSelect) {
  return {
    id: tx.id, userId: tx.userId, type: tx.type, amount: parseFloat(tx.amount as string),
    currency: tx.currency, status: tx.status, paymentMethod: tx.paymentMethod,
    transactionReference: tx.transactionReference, notes: tx.notes,
    createdAt: tx.createdAt.toISOString(), updatedAt: tx.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const txs = await db.select().from(transactionsTable).where(eq(transactionsTable.userId, req.user!.id)).orderBy(desc(transactionsTable.createdAt));
    res.json(txs.map(fmtTx));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/deposit", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, currency, paymentMethod, transactionReference, notes } = req.body;
    if (!amount || !currency || !paymentMethod) {
      res.status(400).json({ message: "amount, currency and paymentMethod are required" });
      return;
    }
    const [tx] = await db.insert(transactionsTable).values({
      userId: req.user!.id, type: "deposit", amount: amount.toString(), currency,
      status: "pending", paymentMethod, transactionReference, notes,
    }).returning();
    res.status(201).json(fmtTx(tx));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/withdraw", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, currency, bankName, accountNumber, ifscCode, accountHolderName, notes } = req.body;
    if (!amount || !currency || !bankName || !accountNumber || !ifscCode || !accountHolderName) {
      res.status(400).json({ message: "All bank details are required" });
      return;
    }
    const [tx] = await db.insert(transactionsTable).values({
      userId: req.user!.id, type: "withdrawal", amount: amount.toString(), currency,
      status: "pending", bankName, accountNumber, ifscCode, accountHolderName, notes,
    }).returning();
    res.status(201).json(fmtTx(tx));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
