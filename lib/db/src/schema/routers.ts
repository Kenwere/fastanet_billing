import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { organizationsTable } from "./organizations";

export const routersTable = pgTable("routers", {
  id: serial("id").primaryKey(),
  orgId: integer("org_id").notNull().references(() => organizationsTable.id),
  name: text("name").notNull(),
  ipAddress: text("ip_address").notNull(),
  apiPort: integer("api_port").notNull().default(8728),
  username: text("username").notNull(),
  passwordHash: text("password_hash").notNull(),
  model: text("model"),
  location: text("location"),
  status: text("status").notNull().default("unknown"),
  uptimeSeconds: integer("uptime_seconds"),
  activeUsers: integer("active_users"),
  type: text("type").notNull().default("hotspot"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRouterSchema = createInsertSchema(routersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRouter = z.infer<typeof insertRouterSchema>;
export type Router = typeof routersTable.$inferSelect;
