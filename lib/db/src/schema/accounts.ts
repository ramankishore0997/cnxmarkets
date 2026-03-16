import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { strategiesTable } from "./strategies";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  totalBalance: numeric("total_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  totalProfit: numeric("total_profit", { precision: 15, scale: 2 }).notNull().default("0"),
  totalDeposits: numeric("total_deposits", { precision: 15, scale: 2 }).notNull().default("0"),
  totalWithdrawals: numeric("total_withdrawals", { precision: 15, scale: 2 }).notNull().default("0"),
  assignedStrategyId: integer("assigned_strategy_id").references(() => strategiesTable.id),
  assignedStrategy: text("assigned_strategy"),
  dailyGrowthTarget: numeric("daily_growth_target", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
