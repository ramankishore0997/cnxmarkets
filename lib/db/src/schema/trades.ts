import { pgTable, serial, integer, text, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { strategiesTable } from "./strategies";

export const directionEnum = pgEnum("direction", ["buy", "sell"]);
export const tradeStatusEnum = pgEnum("trade_status", ["open", "closed"]);

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  strategyId: integer("strategy_id").references(() => strategiesTable.id),
  market: text("market").notNull(),
  instrument: text("instrument").notNull(),
  direction: directionEnum("direction").notNull(),
  entryPrice: numeric("entry_price", { precision: 15, scale: 5 }).notNull(),
  exitPrice: numeric("exit_price", { precision: 15, scale: 5 }),
  lotSize: numeric("lot_size", { precision: 10, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 15, scale: 2 }),
  profitPercent: numeric("profit_percent", { precision: 8, scale: 4 }),
  status: tradeStatusEnum("status").notNull().default("open"),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
  closedAt: timestamp("closed_at"),
});

export const insertTradeSchema = createInsertSchema(tradesTable).omit({ id: true });
export type InsertTrade = z.infer<typeof insertTradeSchema>;
export type Trade = typeof tradesTable.$inferSelect;
