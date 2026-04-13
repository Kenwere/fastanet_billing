import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const ispUsersTable = pgTable("isp_users", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id),
  routerId: integer("router_id"),
  packageId: integer("package_id"),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  macAddress: text("mac_address"),
  ipAddress: text("ip_address"),
  username: text("username"),
  status: text("status").notNull().default("active"),
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertIspUserSchema = createInsertSchema(ispUsersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertIspUser = z.infer<typeof insertIspUserSchema>;
export type IspUser = typeof ispUsersTable.$inferSelect;
