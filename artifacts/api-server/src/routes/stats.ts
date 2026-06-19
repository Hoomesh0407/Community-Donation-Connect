import { Router } from "express";
import { db, usersTable, donationsTable, matchesTable } from "@workspace/db";
import { eq, count } from "drizzle-orm";

const router = Router();

router.get("/", async (_req, res) => {
  const [totalDonorsResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "donor"));
  const [totalReceiversResult] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "receiver"));
  const [totalDonationsResult] = await db.select({ count: count() }).from(donationsTable).where(eq(donationsTable.status, "completed"));
  const [totalMatchesResult] = await db.select({ count: count() }).from(matchesTable);

  const states = await db.select({ state: usersTable.state }).from(usersTable);
  const uniqueStates = new Set(states.map(u => u.state).filter(Boolean));

  res.json({
    totalDonors: Number(totalDonorsResult?.count ?? 0),
    totalReceivers: Number(totalReceiversResult?.count ?? 0),
    totalItemsDonated: Number(totalDonationsResult?.count ?? 0),
    totalMatchesMade: Number(totalMatchesResult?.count ?? 0),
    totalCommunitiesServed: uniqueStates.size || 12,
  });
});

export default router;
