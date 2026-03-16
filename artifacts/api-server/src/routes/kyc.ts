import { Router } from "express";
import { db } from "@workspace/db";
import { kycDocumentsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [doc] = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);
    if (!doc) { res.json(null); return; }
    res.json({
      id: doc.id, userId: doc.userId, idDocumentType: doc.idDocumentType,
      idDocumentUrl: doc.idDocumentUrl, addressProofType: doc.addressProofType,
      addressProofUrl: doc.addressProofUrl, status: doc.status,
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
    const { idDocumentType, idDocumentUrl, addressProofType, addressProofUrl } = req.body;
    const existing = await db.select().from(kycDocumentsTable).where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);
    let doc;
    if (existing.length > 0) {
      [doc] = await db.update(kycDocumentsTable)
        .set({ idDocumentType, idDocumentUrl, addressProofType, addressProofUrl, status: "submitted" })
        .where(eq(kycDocumentsTable.userId, req.user!.id)).returning();
    } else {
      [doc] = await db.insert(kycDocumentsTable).values({
        userId: req.user!.id, idDocumentType, idDocumentUrl, addressProofType, addressProofUrl, status: "submitted",
      }).returning();
    }
    await db.update(usersTable).set({ kycStatus: "submitted" }).where(eq(usersTable.id, req.user!.id));
    res.json({
      id: doc.id, userId: doc.userId, idDocumentType: doc.idDocumentType,
      idDocumentUrl: doc.idDocumentUrl, addressProofType: doc.addressProofType,
      addressProofUrl: doc.addressProofUrl, status: doc.status,
      submittedAt: doc.submittedAt?.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
