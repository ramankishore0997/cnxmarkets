import { Router } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const notifs = await db.select().from(notificationsTable)
      .where(eq(notificationsTable.userId, req.user!.id))
      .orderBy(desc(notificationsTable.createdAt))
      .limit(50);
    res.json(notifs.map(n => ({
      id: n.id, userId: n.userId, title: n.title, message: n.message,
      type: n.type, isRead: n.isRead, createdAt: n.createdAt.toISOString(),
    })));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.patch("/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.update(notificationsTable).set({ isRead: true })
      .where(eq(notificationsTable.id, parseInt(req.params.id)));
    res.json({ message: "Notification marked as read", success: true });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
