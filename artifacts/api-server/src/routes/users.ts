import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";
import { comparePassword, hashPassword } from "../lib/auth.js";

const router = Router();

router.patch("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, phone, country } = req.body;
    const [user] = await db.update(usersTable).set({ firstName, lastName, phone, country, updatedAt: new Date() })
      .where(eq(usersTable.id, req.user!.id)).returning();
    res.json({
      id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName,
      phone: user.phone, country: user.country, role: user.role, kycStatus: user.kycStatus,
      isActive: user.isActive, createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/change-password", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id)).limit(1);
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) { res.status(400).json({ message: "Current password is incorrect" }); return; }
    const passwordHash = await hashPassword(newPassword);
    await db.update(usersTable).set({ passwordHash, updatedAt: new Date() }).where(eq(usersTable.id, req.user!.id));
    res.json({ message: "Password changed successfully", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
