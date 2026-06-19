import { Router } from "express";
import { db, usersTable, donationsTable, requestsTable, matchesTable } from "@workspace/db";
import { eq, count, sql } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../lib/auth";
import { SuspendUserBody } from "@workspace/api-zod";

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

router.get("/stats", requireAdmin, async (_req, res) => {
  const [totalUsersResult] = await db.select({ count: count() }).from(usersTable);
  const [totalDonorsResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "donor"));
  const [totalReceiversResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "receiver"));
  const [totalDonationsResult] = await db.select({ count: count() }).from(donationsTable);
  const [totalRequestsResult] = await db.select({ count: count() }).from(requestsTable);
  const [totalMatchesResult] = await db.select({ count: count() }).from(matchesTable);
  const [completedResult] = await db.select({ count: count() }).from(matchesTable).where(eq(matchesTable.status, "confirmed"));
  const [verifiedResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.isVerified, true));
  const [suspendedResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.status, "suspended"));

  const totalMatches = Number(totalMatchesResult?.count ?? 0);
  const totalCompleted = Number(completedResult?.count ?? 0);

  res.json({
    totalUsers: Number(totalUsersResult?.count ?? 0),
    totalDonors: Number(totalDonorsResult?.count ?? 0),
    totalReceivers: Number(totalReceiversResult?.count ?? 0),
    totalDonations: Number(totalDonationsResult?.count ?? 0),
    totalRequests: Number(totalRequestsResult?.count ?? 0),
    totalMatches,
    totalCompleted,
    matchSuccessRate: totalMatches > 0 ? Math.round((totalCompleted / totalMatches) * 100) : 0,
    verifiedUsers: Number(verifiedResult?.count ?? 0),
    suspendedUsers: Number(suspendedResult?.count ?? 0),
  });
});

router.get("/users", requireAdmin, async (req, res) => {
  const { role, status } = req.query as Record<string, string>;
  let query = db.select().from(usersTable).$dynamic();
  if (role) query = query.where(eq(usersTable.role, role as any));
  if (status) query = query.where(eq(usersTable.status, status as any));
  const users = await query.orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

router.patch("/users/:id/verify", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const [updated] = await db
    .update(usersTable)
    .set({ isVerified: true, updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(updated));
});

router.patch("/users/:id/suspend", requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id);
  const parsed = SuspendUserBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db
    .update(usersTable)
    .set({ status: parsed.data.suspended ? "suspended" : "active", updatedAt: new Date() })
    .where(eq(usersTable.id, id))
    .returning();
  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  res.json(formatUser(updated));
});

router.get("/categories/stats", requireAdmin, async (_req, res) => {
  const donations = await db.select({ category: donationsTable.category }).from(donationsTable);
  const total = donations.length;
  const counts: Record<string, number> = {};
  for (const d of donations) {
    counts[d.category] = (counts[d.category] ?? 0) + 1;
  }
  const stats = Object.entries(counts).map(([category, c]) => ({
    category,
    count: c,
    percentage: total > 0 ? Math.round((c / total) * 100) : 0,
  })).sort((a, b) => b.count - a.count);

  res.json(stats);
});

export default router;
