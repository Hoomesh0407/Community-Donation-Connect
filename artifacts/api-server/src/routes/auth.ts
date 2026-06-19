import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { hashPassword, generateToken, storeToken, removeToken, requireAuth, computeTrustLevel } from "../lib/auth";
import { RegisterUserBody, LoginUserBody } from "@workspace/api-zod";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    role: u.role,
    isVerified: u.isVerified,
    trustScore: u.trustScore,
    trustLevel: u.trustLevel,
    totalDonations: u.totalDonations,
    averageRating: u.averageRating ?? null,
    profilePhoto: u.profilePhoto ?? null,
    village: u.village ?? null,
    district: u.district ?? null,
    state: u.state ?? null,
    status: u.status,
    createdAt: u.createdAt.toISOString(),
  };
}

router.post("/register", async (req, res) => {
  const parsed = RegisterUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.issues });
    return;
  }
  const { fullName, email, phone, password, role } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const [user] = await db.insert(usersTable).values({
    fullName,
    email,
    phone,
    passwordHash: hashPassword(password),
    role: role as "donor" | "receiver",
    trustLevel: "new",
    trustScore: 0,
    totalDonations: 0,
    isVerified: false,
    status: "active",
  }).returning();

  const token = generateToken(user.id);
  storeToken(token, user.id);

  res.status(201).json({ user: formatUser(user), token });
});

router.post("/login", async (req, res) => {
  const parsed = LoginUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  if (user.status === "suspended") {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const token = generateToken(user.id);
  storeToken(token, user.id);

  res.json({ user: formatUser(user), token });
});

router.post("/logout", requireAuth, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  if (token) removeToken(token);
  res.json({ message: "Logged out successfully" });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  res.json(formatUser(user));
});

export default router;
