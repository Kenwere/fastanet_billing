import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const organizationsTable = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subdomain: text("subdomain").notNull().unique(),
  ownerName: text("owner_name").notNull(),
  ownerEmail: text("owner_email").notNull(),
  phone: text("phone"),
  paymentMethods: text("payment_methods").notNull().default("mpesa"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").notNull().default("#f5c542"),
  welcomeMessage: text("welcome_message"),
  loginStyle: text("login_style").notNull().default("voucher"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOrganizationSchema = createInsertSchema(organizationsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type Organization = typeof organizationsTable.$inferSelect;
