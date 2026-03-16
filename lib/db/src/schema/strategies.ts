import { pgTable, serial, text, numeric, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const riskProfileEnum = pgEnum("risk_profile", ["low", "medium", "high"]);

export const strategiesTable = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  riskProfile: riskProfileEnum("risk_profile").notNull(),
  minCapital: numeric("min_capital", { precision: 15, scale: 2 }).notNull(),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).notNull(),
  maxDrawdown: numeric("max_drawdown", { precision: 5, scale: 2 }).notNull(),
  monthlyReturn: numeric("monthly_return", { precision: 5, scale: 2 }).notNull(),
  markets: text("markets").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertStrategySchema = createInsertSchema(strategiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStrategy = z.infer<typeof insertStrategySchema>;
export type Strategy = typeof strategiesTable.$inferSelect;
