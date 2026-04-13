import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const pppoeAccountsTable = pgTable("pppoe_accounts", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id),
  routerId: integer("router_id").notNull(),
  packageId: integer("package_id"),
  userId: integer("user_id"),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  service: text("service").notNull().default("pppoe"),
  profile: text("profile"),
  status: text("status").notNull().default("active"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPppoeAccountSchema = createInsertSchema(pppoeAccountsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPppoeAccount = z.infer<typeof insertPppoeAccountSchema>;
export type PppoeAccount = typeof pppoeAccountsTable.$inferSelect;
