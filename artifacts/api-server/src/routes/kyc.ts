import { Router } from "express";
import { db } from "@workspace/db";
import { kycDocumentsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);
    if (!doc) { res.json(null); return; }
    res.json({
      id: doc.id, userId: doc.userId,
      panNumber: doc.panNumber,
      aadharNumber: doc.aadharNumber,
      panCardFrontUrl: doc.panCardFrontUrl,
      panCardBackUrl: doc.panCardBackUrl,
      aadharCardFrontUrl: doc.aadharCardFrontUrl,
      aadharCardBackUrl: doc.aadharCardBackUrl,
      idDocumentType: doc.idDocumentType,
      idDocumentUrl: doc.idDocumentUrl,
      addressProofType: doc.addressProofType,
      addressProofUrl: doc.addressProofUrl,
      status: doc.status,
      rejectionReason: doc.rejectionReason,
      submittedAt: doc.submittedAt?.toISOString(),
      reviewedAt: doc.reviewedAt?.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const {
      panNumber, aadharNumber,
      panCardFrontUrl, panCardBackUrl,
      aadharCardFrontUrl, aadharCardBackUrl,
      idDocumentType, idDocumentUrl,
      addressProofType, addressProofUrl,
    } = req.body;

    const existing = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);
    let doc;
    if (existing.length > 0) {
      [doc] = await db.update(kycDocumentsTable)
        .set({
          panNumber, aadharNumber,
          panCardFrontUrl, panCardBackUrl,
          aadharCardFrontUrl, aadharCardBackUrl,
          idDocumentType, idDocumentUrl,
          addressProofType, addressProofUrl,
          status: "submitted",
          submittedAt: new Date(),
          rejectionReason: null,
          reviewedAt: null,
        })
        .where(eq(kycDocumentsTable.userId, req.user!.id)).returning();
    } else {
      [doc] = await db.insert(kycDocumentsTable).values({
        userId: req.user!.id,
        panNumber, aadharNumber,
        panCardFrontUrl, panCardBackUrl,
        aadharCardFrontUrl, aadharCardBackUrl,
        idDocumentType, idDocumentUrl,
        addressProofType, addressProofUrl,
        status: "submitted",
      }).returning();
    }
    await db.update(usersTable).set({ kycStatus: "submitted" }).where(eq(usersTable.id, req.user!.id));

    // Fire-and-forget Telegram notification — never blocks or throws
    const userId = req.user!.id;
    const userEmail = req.user!.email;
    const pan    = panNumber    || "N/A";
    const aadhar = aadharNumber || "N/A";
    void (async () => {
      try {
        const [user] = await db
          .select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
          .from(usersTable)
          .where(eq(usersTable.id, userId))
          .limit(1);
        const name = user
          ? `${user.firstName} ${user.lastName}`.trim() || userEmail
          : userEmail;
        const lines = [
          `📄 <b>KYC DOCUMENTS SUBMITTED</b>`,
          `👤 User: ${name}`,
          `💳 PAN: ${pan}`,
          `🆔 Aadhar: ${aadhar}`,
        ];
        await sendTelegram(lines.join("\n"));
      } catch {
        // silent — main response already sent
      }
    })();

    res.json({
      id: doc.id, userId: doc.userId,
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
