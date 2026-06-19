import { pgTable, serial, text, integer, boolean, real, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userRoleEnum = pgEnum("user_role", ["donor", "receiver", "admin"]);
export const userStatusEnum = pgEnum("user_status", ["active", "suspended"]);
export const trustLevelEnum = pgEnum("trust_level", ["new", "trusted", "highlyTrusted", "champion"]);

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRoleEnum("role").notNull().default("donor"),
  isVerified: boolean("is_verified").notNull().default(false),
  trustScore: integer("trust_score").notNull().default(0),
  trustLevel: trustLevelEnum("trust_level").notNull().default("new"),
  totalDonations: integer("total_donations").notNull().default(0),
  averageRating: real("average_rating"),
  profilePhoto: text("profile_photo"),
  age: integer("age"),
  gender: text("gender"),
  occupation: text("occupation"),
  qualification: text("qualification"),
  address: text("address"),
  village: text("village"),
  district: text("district"),
  state: text("state"),
  pincode: text("pincode"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: userStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
