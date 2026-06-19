import { Router } from "express";
import { db, reviewsTable, usersTable, matchesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, computeTrustLevel, trustPointsForRating } from "../lib/auth";
import { CreateReviewBody } from "@workspace/api-zod";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const parsed = CreateReviewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { matchId, qualityRating, conditionRating, satisfactionRating, feedback } = parsed.data;

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, matchId)).limit(1);
  if (!match) { res.status(404).json({ error: "Match not found" }); return; }
  if (user.id !== match.receiverId) { res.status(403).json({ error: "Only receiver can review" }); return; }

  const [review] = await db.insert(reviewsTable).values({
    matchId,
    donorId: match.donorId,
    receiverId: user.id,
    qualityRating,
    conditionRating,
    satisfactionRating,
    feedback: feedback ?? undefined,
  }).returning();

  // Update donor's trust score
  const avgRating = Math.round((qualityRating + conditionRating + satisfactionRating) / 3);
  const points = trustPointsForRating(avgRating);

  const [donor] = await db.select().from(usersTable).where(eq(usersTable.id, match.donorId)).limit(1);
  if (donor) {
    const newScore = donor.trustScore + points;
    const newLevel = computeTrustLevel(newScore);

    const allReviews = await db.select().from(reviewsTable).where(eq(reviewsTable.donorId, match.donorId));
    const totalRatings = allReviews.map(r => (r.qualityRating + r.conditionRating + r.satisfactionRating) / 3);
    const newAvg = totalRatings.reduce((a, b) => a + b, 0) / totalRatings.length;

    await db.update(usersTable).set({
      trustScore: newScore,
      trustLevel: newLevel,
      averageRating: Math.round(newAvg * 10) / 10,
      updatedAt: new Date(),
    }).where(eq(usersTable.id, match.donorId));
  }

  res.status(201).json({
    id: review.id,
    matchId: review.matchId,
    donorId: review.donorId,
    receiverId: review.receiverId,
    qualityRating: review.qualityRating,
    conditionRating: review.conditionRating,
    satisfactionRating: review.satisfactionRating,
    feedback: review.feedback ?? null,
    createdAt: review.createdAt.toISOString(),
  });
});

router.get("/donor/:donorId", async (req, res) => {
  const donorId = parseInt(req.params.donorId);
  if (isNaN(donorId)) { res.status(400).json({ error: "Invalid id" }); return; }

  const reviews = await db.select().from(reviewsTable).where(eq(reviewsTable.donorId, donorId));

  res.json(reviews.map(r => ({
    id: r.id,
    matchId: r.matchId,
    donorId: r.donorId,
    receiverId: r.receiverId,
    qualityRating: r.qualityRating,
    conditionRating: r.conditionRating,
    satisfactionRating: r.satisfactionRating,
    feedback: r.feedback ?? null,
    createdAt: r.createdAt.toISOString(),
  })));
});

export default router;
