import { pgTable, serial, integer, real, boolean, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { donationsTable } from "./donations";
import { requestsTable } from "./requests";

export const matchStatusEnum = pgEnum("match_status", ["pending", "accepted", "confirmed", "completed", "cancelled"]);
export const deliveryTypeEnum = pgEnum("delivery_type", ["pickup", "delivery"]);

export const matchesTable = pgTable("matches", {
  id: serial("id").primaryKey(),
  donationId: integer("donation_id").notNull().references(() => donationsTable.id),
  requestId: integer("request_id").notNull().references(() => requestsTable.id),
  donorId: integer("donor_id").notNull().references(() => usersTable.id),
  receiverId: integer("receiver_id").notNull().references(() => usersTable.id),
  status: matchStatusEnum("status").notNull().default("pending"),
  distanceKm: real("distance_km").notNull(),
  donorAccepted: boolean("donor_accepted").notNull().default(false),
  receiverAccepted: boolean("receiver_accepted").notNull().default(false),
  deliveryType: deliveryTypeEnum("delivery_type"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertMatchSchema = createInsertSchema(matchesTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type Match = typeof matchesTable.$inferSelect;
