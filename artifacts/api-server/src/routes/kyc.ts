import { Router } from "express";
import multer from "multer";
import path from "path";
import { db } from "@workspace/db";
import { kycDocumentsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const SUPABASE_URL = "https://walzicfjkwiifeldzppx.supabase.co";
const SUPABASE_BUCKET = "kyc-documents";

async function uploadToSupabase(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string> {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_KEY not configured");

  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filename}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": mimetype,
      "x-upsert": "true",
    },
    body: buffer,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Supabase upload failed: ${err}`);
  }

  return `${SUPABASE_URL}/storage/v1/object/${SUPABASE_BUCKET}/${filename}`;
}

async function getSignedUrl(filePath: string): Promise<string> {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return filePath;

  const filename = filePath.includes(`/${SUPABASE_BUCKET}/`)
    ? filePath.split(`/${SUPABASE_BUCKET}/`)[1]
    : filePath;

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
}

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(null, true);
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

    const [aadharFrontSigned, aadharBackSigned, panFrontSigned, panBackSigned] =
      await Promise.all([
        doc?.aadharCardFrontUrl ? getSignedUrl(doc.aadharCardFrontUrl) : Promise.resolve(null),
        doc?.aadharCardBackUrl  ? getSignedUrl(doc.aadharCardBackUrl)  : Promise.resolve(null),
        doc?.panCardFrontUrl    ? getSignedUrl(doc.panCardFrontUrl)    : Promise.resolve(null),
        doc?.panCardBackUrl     ? getSignedUrl(doc.panCardBackUrl)     : Promise.resolve(null),
      ]);

    res.json({
      id: doc?.id ?? null,
      userId: req.user!.id,
      panNumber: doc?.panNumber ?? null,
      aadharNumber: doc?.aadharNumber ?? null,
      panCardFrontUrl: panFrontSigned,
      panCardBackUrl: panBackSigned,
      aadharCardFrontUrl: aadharFrontSigned,
      aadharCardBackUrl: aadharBackSigned,
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
      const userId = req.user!.id;

      const files = (req as any).files as Record<string, Express.Multer.File[]> | undefined;

      async function uploadField(field: string): Promise<string | undefined> {
        const arr = files?.[field];
        if (!arr || arr.length === 0) return undefined;
        const file = arr[0];
        const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
        const filename = `${userId}/${field}_${Date.now()}${ext}`;
        return uploadToSupabase(file.buffer, filename, file.mimetype);
      }

      const [aadhaarFrontUrl, aadhaarBackUrl, panFrontUrl, panBackUrl] = await Promise.all([
        uploadField("aadhaarFront"),
        uploadField("aadhaarBack"),
        uploadField("panFront"),
        uploadField("panBack"),
      ]);

      const photoCount = [aadhaarFrontUrl, aadhaarBackUrl, panFrontUrl, panBackUrl].filter(Boolean).length;
      console.log(`[KYC] User ${userId} submitting — PAN: ${pan}, Aadhaar: ${aadhar}, photos: ${photoCount}/4`);

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
        .where(eq(kycDocumentsTable.userId, userId)).limit(1);

      let doc;
      if (existing.length > 0) {
        [doc] = await db.update(kycDocumentsTable)
          .set(updates)
          .where(eq(kycDocumentsTable.userId, userId))
          .returning();
      } else {
        [doc] = await db.insert(kycDocumentsTable)
          .values({ userId, ...updates })
          .returning();
      }

      await db.update(usersTable)
        .set({ kycStatus: "submitted" })
        .where(eq(usersTable.id, userId));

      console.log(`[KYC] Saved to Supabase Storage — docId: ${doc.id}, userId: ${userId}`);

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
            `📷 Photos: ${photoCount}/4 uploaded to Supabase Storage`,
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
