import { pgTable, serial, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { strategiesTable } from "./strategies";

export const allocationsTable = pgTable("allocations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  strategyId: integer("strategy_id").notNull().references(() => strategiesTable.id),
  percentage: numeric("percentage", { precision: 5, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAllocationSchema = createInsertSchema(allocationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAllocation = z.infer<typeof insertAllocationSchema>;
export type Allocation = typeof allocationsTable.$inferSelect;
