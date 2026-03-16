import { pgTable, serial, integer, text, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const binaryTradesTable = pgTable("binary_trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  instrument: text("instrument").notNull(),
  direction: text("direction").notNull(),
  entryPrice: numeric("entry_price", { precision: 18, scale: 8 }).notNull(),
  closingPrice: numeric("closing_price", { precision: 18, scale: 8 }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  duration: integer("duration").notNull(),
  payoutPct: numeric("payout_pct", { precision: 5, scale: 2 }).notNull().default("90"),
  status: text("status").notNull().default("open"),
  profit: numeric("profit", { precision: 15, scale: 2 }),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export type BinaryTrade = typeof binaryTradesTable.$inferSelect;
