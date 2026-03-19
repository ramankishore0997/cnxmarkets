import { Router } from "express";
import multer from "multer";
import path from "path";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { comparePassword, hashPassword } from "../lib/auth.js";

const SUPABASE_URL    = "https://walzicfjkwiifeldzppx.supabase.co";
const PROFILE_BUCKET  = "profile-photos";

const router = Router();

/* ── helpers ──────────────────────────────────────── */
function userPayload(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    country: user.country,
    role: user.role,
    kycStatus: user.kycStatus,
    isActive: user.isActive,
    profilePhoto: user.profilePhoto ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}

/* ── multer for profile photo ─────────────────────── */
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error("Only JPG, PNG, or WEBP images are allowed"));
  },
}).single("photo");

/* ── PATCH /api/users/profile ─────────────────────── */
router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, phone, country } = req.body;
    const [user] = await db
      .update(usersTable)
      .set({ firstName, lastName, phone, country, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id))
      .returning();
    res.json(userPayload(user));
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/users/upload-photo ─────────────────── */
router.post("/upload-photo", requireAuth, (req: any, res: any, next: any) => {
  photoUpload(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE")
        return res.status(400).json({ message: "Photo must be under 5 MB." });
      return res.status(400).json({ message: err.message });
    }
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, async (req: AuthRequest, res: any) => {
  try {
    const userId = req.user!.id;
    const file = (req as any).file as Express.Multer.File | undefined;

    let profilePhoto: string;

    if (file) {
      // New flow: upload to Supabase Storage
      const serviceKey = process.env.SUPABASE_SERVICE_KEY;
      if (!serviceKey) {
        res.status(500).json({ message: "Storage not configured" });
        return;
      }
      const ext      = path.extname(file.originalname).toLowerCase() || ".jpg";
      const filename = `${userId}/photo_${Date.now()}${ext}`;
      const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${PROFILE_BUCKET}/${filename}`;

      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${serviceKey}`,
          "Content-Type": file.mimetype,
          "x-upsert": "true",
        },
        body: file.buffer,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        console.error("[Photo] Supabase upload failed:", err);
        res.status(500).json({ message: "Upload to storage failed" });
        return;
      }

      profilePhoto = `${SUPABASE_URL}/storage/v1/object/public/${PROFILE_BUCKET}/${filename}`;
      console.log(`[Photo] User ${userId} photo uploaded to Supabase: ${filename}`);
    } else if (req.body?.profilePhoto?.startsWith("data:image/")) {
      // Legacy base64 fallback
      if ((req.body.profilePhoto as string).length > 2_800_000) {
        res.status(400).json({ message: "Image too large (max ~2 MB)" });
        return;
      }
      profilePhoto = req.body.profilePhoto;
    } else {
      res.status(400).json({ message: "No photo provided" });
      return;
    }

    const [user] = await db
      .update(usersTable)
      .set({ profilePhoto, updatedAt: new Date() })
      .where(eq(usersTable.id, userId))
      .returning();
    res.json(userPayload(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/users/change-password ─────────────── */
router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.user!.id))
      .limit(1);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ message: "Current password is incorrect" }); return; }
    const passwordHash = await hashPassword(newPassword);
    await db
      .update(usersTable)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id));
    res.json({ message: "Password changed successfully", success: true });
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
