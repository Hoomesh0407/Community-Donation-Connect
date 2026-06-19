import { pgTable, serial, integer, text, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const urgencyEnum = pgEnum("urgency_level", ["low", "medium", "high", "critical"]);
export const requestStatusEnum = pgEnum("request_status", ["active", "matched", "fulfilled", "cancelled"]);

export const requestsTable = pgTable("receiver_requests", {
  id: serial("id").primaryKey(),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  reason: text("reason"),
  urgency: urgencyEnum("urgency").notNull().default("medium"),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  radiusKm: integer("radius_km").notNull().default(5),
  status: requestStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertRequestSchema = createInsertSchema(requestsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type ReceiverRequest = typeof requestsTable.$inferSelect;
