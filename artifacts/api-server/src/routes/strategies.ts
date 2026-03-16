import { Router } from "express";
import { db } from "@workspace/db";
import { strategiesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

function formatStrategy(s: typeof strategiesTable.$inferSelect) {
  return {
    id: s.id, name: s.name, description: s.description, riskProfile: s.riskProfile,
    minCapital: parseFloat(s.minCapital as string), winRate: parseFloat(s.winRate as string),
    maxDrawdown: parseFloat(s.maxDrawdown as string), monthlyReturn: parseFloat(s.monthlyReturn as string),
    markets: s.markets, isActive: s.isActive, createdAt: s.createdAt.toISOString(),
  };
}

router.get("/", async (_req, res) => {
  try {
    const strategies = await db.select().from(strategiesTable).where(eq(strategiesTable.isActive, true));
    res.json(strategies.map(formatStrategy));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [strategy] = await db.select().from(strategiesTable).where(eq(strategiesTable.id, parseInt(req.params.id))).limit(1);
    if (!strategy) { res.status(404).json({ message: "Strategy not found" }); return; }
    res.json(formatStrategy(strategy));
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
