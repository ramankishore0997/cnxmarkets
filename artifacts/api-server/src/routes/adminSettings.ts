import { Router } from "express";
import { randomBytes } from "crypto";
import { db } from "@workspace/db";
import { adminSettingsTable, usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { generateToken } from "../lib/auth.js";
import { requireAdmin, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

/* ── Helpers ─────────────────────────────────────── */
function generateMagicToken(): string {
  return randomBytes(48).toString("hex"); // 96-char hex = cryptographically secure
}

async function getOrCreateSettings() {
  const [existing] = await db.select().from(adminSettingsTable).limit(1);
  if (existing) return existing;
  // First-time seed: create with a fresh token
  const [created] = await db
    .insert(adminSettingsTable)
    .values({ magicLinkToken: generateMagicToken() })
    .returning();
  return created;
}

/* ── GET /api/admin/settings/magic-link ──────────── */
// Returns the current token (admin only — shown inside panel)
router.get("/magic-link", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json({ token: settings.magicLinkToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ── POST /api/admin/settings/rotate-token ───────── */
// Generates a brand-new token, invalidating the old one
router.post("/rotate-token", requireAdmin, async (_req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const newToken = generateMagicToken();
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

/* ── GET /api/admin/auto-login/:token ────────────── */
// Public route — validates magic token, returns a JWT for the admin
// No requireAdmin middleware here (it's the login mechanism itself)
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

    // Get the first admin user
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
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
