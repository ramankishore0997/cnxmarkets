import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const accountsTable = pgTable("accounts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id).unique(),
  totalBalance: numeric("total_balance", { precision: 15, scale: 2 }).notNull().default("0"),
  totalProfit: numeric("total_profit", { precision: 15, scale: 2 }).notNull().default("0"),
  totalDeposits: numeric("total_deposits", { precision: 15, scale: 2 }).notNull().default("0"),
  totalWithdrawals: numeric("total_withdrawals", { precision: 15, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAccountSchema = createInsertSchema(accountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accountsTable.$inferSelect;
