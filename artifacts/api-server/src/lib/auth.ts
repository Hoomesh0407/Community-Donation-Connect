import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "cdc_salt_2024").digest("hex");
}

export function generateToken(userId: number): string {
  return crypto.createHash("sha256").update(`${userId}:${Date.now()}:cdc_secret`).digest("hex");
}

const tokenStore = new Map<string, number>();

export function storeToken(token: string, userId: number) {
  tokenStore.set(token, userId);
}

export function getUserIdFromToken(token: string): number | null {
  return tokenStore.get(token) ?? null;
}

export function removeToken(token: string) {
  tokenStore.delete(token);
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const userId = getUserIdFromToken(token);
  if (!userId) {
    res.status(401).json({ error: "Invalid token" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || user.status === "suspended") {
    res.status(401).json({ error: "User not found or suspended" });
    return;
  }
  (req as any).user = user;
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, async () => {
    const user = (req as any).user;
    if (user?.role !== "admin") {
      res.status(403).json({ error: "Admin access required" });
      return;
    }
    next();
  });
}

export function computeTrustLevel(score: number): "new" | "trusted" | "highlyTrusted" | "champion" {
  if (score >= 301) return "champion";
  if (score >= 151) return "highlyTrusted";
  if (score >= 51) return "trusted";
  return "new";
}

export function trustPointsForRating(rating: number): number {
  if (rating >= 5) return 20;
  if (rating >= 4) return 15;
  if (rating >= 3) return 10;
  if (rating >= 2) return 5;
  return 0;
}
