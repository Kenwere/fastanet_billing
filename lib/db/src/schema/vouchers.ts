import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const vouchersTable = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id),
  packageId: integer("package_id").notNull(),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("unused"),
  usedAt: timestamp("used_at", { withTimezone: true }),
  usedByUserId: integer("used_by_user_id"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVoucherSchema = createInsertSchema(vouchersTable).omit({ id: true, createdAt: true });
export type InsertVoucher = z.infer<typeof insertVoucherSchema>;
export type Voucher = typeof vouchersTable.$inferSelect;
