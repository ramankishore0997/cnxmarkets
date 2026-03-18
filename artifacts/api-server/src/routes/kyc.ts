import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { db } from "@workspace/db";
import { kycDocumentsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.resolve(__dirname, "..", "..", "uploads", "kyc");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (req: any, file, cb) => {
    const userId = req.user?.id ?? "unknown";
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${userId}_${file.fieldname}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  },
});

const kycUpload = upload.fields([
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack",  maxCount: 1 },
  { name: "panFront",     maxCount: 1 },
  { name: "panBack",      maxCount: 1 },
]);

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select({ kycStatus: usersTable.kycStatus })
      .from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    const [doc] = await db.select().from(kycDocumentsTable)
      .where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);

    if (!doc && (!user || user.kycStatus === "pending")) { res.json(null); return; }

    const effectiveStatus = user?.kycStatus || doc?.status || "pending";

    res.json({
      id: doc?.id ?? null,
      userId: req.user!.id,
      panNumber: doc?.panNumber ?? null,
      aadharNumber: doc?.aadharNumber ?? null,
      panCardFrontUrl: doc?.panCardFrontUrl ?? null,
      panCardBackUrl: doc?.panCardBackUrl ?? null,
      aadharCardFrontUrl: doc?.aadharCardFrontUrl ?? null,
      aadharCardBackUrl: doc?.aadharCardBackUrl ?? null,
      status: effectiveStatus,
      rejectionReason: doc?.rejectionReason ?? null,
      submittedAt: doc?.submittedAt?.toISOString() ?? null,
      reviewedAt: doc?.reviewedAt?.toISOString() ?? null,
    });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post(
  "/",
  requireAuth,
  (req: any, res: any, next: any) => {
    kycUpload(req, res, (err: any) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE")
          return res.status(400).json({ message: "Each photo must be under 10 MB." });
        return res.status(400).json({ message: err.message });
      }
      if (err) return res.status(400).json({ message: err.message });
      next();
    });
  },
  async (req: AuthRequest, res: any) => {
    try {
      const { panNumber, aadharNumber } = req.body;

      if (!panNumber || !aadharNumber) {
        res.status(400).json({ message: "PAN number and Aadhaar number are required" });
        return;
      }

      const pan    = String(panNumber).toUpperCase().trim();
      const aadhar = String(aadharNumber).replace(/\s/g, "").trim();

      const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;
      const toUrl = (field: string) => {
        const arr = files?.[field];
        return arr && arr.length > 0 ? `/api/uploads/kyc/${arr[0].filename}` : undefined;
      };

      const aadhaarFrontUrl = toUrl("aadhaarFront");
      const aadhaarBackUrl  = toUrl("aadhaarBack");
      const panFrontUrl     = toUrl("panFront");
      const panBackUrl      = toUrl("panBack");

      console.log(`[KYC] User ${req.user!.id} submitting — PAN: ${pan}, Aadhaar: ${aadhar}, photos: ${[aadhaarFrontUrl, aadhaarBackUrl, panFrontUrl, panBackUrl].filter(Boolean).length}/4`);

      const updates: Record<string, any> = {
        panNumber: pan,
        aadharNumber: aadhar,
        status: "submitted",
        submittedAt: new Date(),
        rejectionReason: null,
        reviewedAt: null,
      };
      if (aadhaarFrontUrl) updates.aadharCardFrontUrl = aadhaarFrontUrl;
      if (aadhaarBackUrl)  updates.aadharCardBackUrl  = aadhaarBackUrl;
      if (panFrontUrl)     updates.panCardFrontUrl    = panFrontUrl;
      if (panBackUrl)      updates.panCardBackUrl     = panBackUrl;

      const existing = await db.select().from(kycDocumentsTable)
        .where(eq(kycDocumentsTable.userId, req.user!.id)).limit(1);

      let doc;
      if (existing.length > 0) {
        [doc] = await db.update(kycDocumentsTable)
          .set(updates)
          .where(eq(kycDocumentsTable.userId, req.user!.id))
          .returning();
      } else {
        [doc] = await db.insert(kycDocumentsTable)
          .values({ userId: req.user!.id, ...updates })
          .returning();
      }

      await db.update(usersTable)
        .set({ kycStatus: "submitted" })
        .where(eq(usersTable.id, req.user!.id));

      console.log(`[KYC] Saved — docId: ${doc.id}, userId: ${req.user!.id}`);

      const userId = req.user!.id;
      const userEmail = req.user!.email;
      void (async () => {
        try {
          const [u] = await db.select({ firstName: usersTable.firstName, lastName: usersTable.lastName })
            .from(usersTable).where(eq(usersTable.id, userId)).limit(1);
          const name = u ? `${u.firstName} ${u.lastName}`.trim() || userEmail : userEmail;
          await sendTelegram([
            `📄 <b>KYC SUBMITTED</b>`,
            `👤 User: ${name}`,
            `💳 PAN: ${pan}`,
            `🆔 Aadhaar: ${aadhar}`,
            `📷 Photos: ${[aadhaarFrontUrl, aadhaarBackUrl, panFrontUrl, panBackUrl].filter(Boolean).length}/4 uploaded`,
          ].join("\n"));
        } catch { /* silent */ }
      })();

      res.json({
        id: doc.id, userId: doc.userId,
        panNumber: doc.panNumber, aadharNumber: doc.aadharNumber,
        panCardFrontUrl: doc.panCardFrontUrl, panCardBackUrl: doc.panCardBackUrl,
        aadharCardFrontUrl: doc.aadharCardFrontUrl, aadharCardBackUrl: doc.aadharCardBackUrl,
        status: doc.status, submittedAt: doc.submittedAt?.toISOString(),
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
