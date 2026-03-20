import { pgTable, serial, text, timestamp, numeric, boolean } from "drizzle-orm/pg-core";

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  magicLinkToken: text("magic_link_token").notNull(),
  binaryPayoutPct: numeric("binary_payout_pct", { precision: 5, scale: 2 }).notNull().default("90"),
  houseEdgeEnabled: boolean("house_edge_enabled").notNull().default(false),
  usdtTrc20Address: text("usdt_trc20_address"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type AdminSettings = typeof adminSettingsTable.$inferSelect;
