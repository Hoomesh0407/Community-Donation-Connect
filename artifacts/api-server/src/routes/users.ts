import { Router } from "express";
import { db, usersTable, reviewsTable } from "@workspace/db";
import { eq, desc, avg } from "drizzle-orm";
import { requireAuth, computeTrustLevel } from "../lib/auth";
import { UpdateUserBody } from "@workspace/api-zod";

const router = Router();

function formatUserPublic(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    fullName: u.fullName,
    role: u.role,
    isVerified: u.isVerified,
    trustScore: u.trustScore,
    trustLevel: u.trustLevel,
    totalDonations: u.totalDonations,
    averageRating: u.averageRating ?? null,
    profilePhoto: u.profilePhoto ?? null,
    village: u.village ?? null,
    district: u.district ?? null,
    createdAt: u.createdAt.toISOString(),
  };
}

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

router.get("/leaderboard", async (_req, res) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.role, "donor"))
    .orderBy(desc(usersTable.trustScore))
    .limit(20);

  const leaderboard = users.map((u, i) => ({
    rank: i + 1,
    userId: u.id,
    fullName: u.fullName,
    profilePhoto: u.profilePhoto ?? null,
    trustScore: u.trustScore,
    trustLevel: u.trustLevel,
    totalDonations: u.totalDonations,
    averageRating: u.averageRating ?? null,
  }));

  res.json(leaderboard);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  res.json(formatUserPublic(user));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const currentUser = (req as any).user as typeof usersTable.$inferSelect;
  if (currentUser.id !== id && currentUser.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(updated));
});

router.get("/:id/trust", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const levelLabels: Record<string, string> = {
    new: "New Donor",
    trusted: "Trusted Donor",
    highlyTrusted: "Highly Trusted Donor",
    champion: "Community Champion",
  };
  const badgeLabels: Record<string, string> = {
    new: "New",
    trusted: "Trusted",
    highlyTrusted: "Highly Trusted",
    champion: "Champion",
  };

  res.json({
    userId: user.id,
    score: user.trustScore,
    level: levelLabels[user.trustLevel] ?? user.trustLevel,
    totalDonations: user.totalDonations,
    averageRating: user.averageRating ?? null,
    badge: badgeLabels[user.trustLevel] ?? user.trustLevel,
  });
});

export default router;
