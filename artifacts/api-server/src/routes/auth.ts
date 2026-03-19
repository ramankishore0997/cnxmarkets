import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, accountsTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, comparePassword, generateToken } from "../lib/auth.js";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { sendTelegram } from "../lib/telegram.js";

const SUPABASE_URL = "https://walzicfjkwiifeldzppx.supabase.co";

async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) return;
  try {
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${serviceKey}`,
        "apikey": serviceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        email_confirm: false,
        user_metadata: { firstName },
        app_metadata: { provider: "cnxmarkets" },
      }),
    });
  } catch {
    // fire and forget — never block registration
  }
}

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, country } = req.body;
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ message: "Email already registered" });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      email: normalizedEmail, passwordHash, firstName, lastName, phone, country,
      role: "client", kycStatus: "pending", isActive: true,
    }).returning();
    await db.insert(accountsTable).values({ userId: user.id, totalBalance: "0", totalProfit: "0", totalDeposits: "0", totalWithdrawals: "0" });
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.status(201).json({
      token,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
        isActive: user.isActive, createdAt: user.createdAt.toISOString(),
      }
    });
    // Fire-and-forget: trigger Supabase welcome email
    sendWelcomeEmail(user.email, user.firstName);
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (user) {
      await sendTelegram(
        `🔐 *Password Reset Request*\n\nA client has requested a password reset:\n\n*Name:* ${user.firstName} ${user.lastName}\n*Email:* \`${user.email}\`\n*User ID:* ${user.id}\n\nPlease reset their password from the Admin Panel → Users section.`
      ).catch(() => {});
    }
    res.json({ message: "If this email is registered, our team will contact you shortly." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and password required" });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, normalizedEmail)).limit(1);
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    if (!user.isActive) {
      res.status(401).json({ message: "Account is deactivated" });
      return;
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    res.json({
      token,
      user: {
        id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
        phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
        isActive: user.isActive, createdAt: user.createdAt.toISOString(),
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
      isActive: user.isActive, profilePhoto: user.profilePhoto ?? null,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", requireAuth, (_req, res) => {
  res.json({ message: "Logged out successfully", success: true });
});

export default router;
