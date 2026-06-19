import { pgTable, serial, integer, text, real, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const conditionEnum = pgEnum("item_condition", ["likeNew", "excellent", "good", "fair", "poor"]);
export const donationStatusEnum = pgEnum("donation_status", ["active", "matched", "completed", "cancelled"]);

export const donationsTable = pgTable("donations", {
  id: serial("id").primaryKey(),
  donorId: integer("donor_id").notNull().references(() => usersTable.id),
  category: text("category").notNull(),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  brand: text("brand"),
  purchaseYear: integer("purchase_year"),
  condition: conditionEnum("condition").notNull().default("good"),
  images: text("images").array().notNull().default([]),
  videoUrl: text("video_url"),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  radiusKm: integer("radius_km").notNull().default(5),
  status: donationStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertDonationSchema = createInsertSchema(donationsTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertDonation = z.infer<typeof insertDonationSchema>;
export type Donation = typeof donationsTable.$inferSelect;
