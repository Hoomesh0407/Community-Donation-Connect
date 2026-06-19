import { Router } from "express";
import { db, matchesTable, donationsTable, requestsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { haversineKm } from "../lib/distance";
import { FindMatchesBody } from "@workspace/api-zod";

const router = Router();

async function formatMatch(m: typeof matchesTable.$inferSelect, currentUserId: number) {
  const [donor] = await db.select().from(usersTable).where(eq(usersTable.id, m.donorId)).limit(1);
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, m.receiverId)).limit(1);
  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, m.donationId)).limit(1);

  const bothAccepted = m.donorAccepted && m.receiverAccepted;

  return {
    id: m.id,
    donationId: m.donationId,
    requestId: m.requestId,
    donorId: m.donorId,
    receiverId: m.receiverId,
    donorName: donor?.fullName ?? "Unknown",
    receiverName: receiver?.fullName ?? "Unknown",
    donorPhone: bothAccepted ? donor?.phone ?? null : null,
    receiverPhone: bothAccepted ? receiver?.phone ?? null : null,
    donorEmail: bothAccepted ? donor?.email ?? null : null,
    receiverEmail: bothAccepted ? receiver?.email ?? null : null,
    itemName: donation?.itemName ?? "Unknown item",
    category: donation?.category ?? "",
    status: m.status,
    distanceKm: m.distanceKm,
    donorAccepted: m.donorAccepted,
    receiverAccepted: m.receiverAccepted,
    deliveryType: m.deliveryType ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const matches = await db
    .select()
    .from(matchesTable)
    .where(or(eq(matchesTable.donorId, user.id), eq(matchesTable.receiverId, user.id)));

  res.json(await Promise.all(matches.map(m => formatMatch(m, user.id))));
});

router.post("/find", requireAuth, async (req, res) => {
  const parsed = FindMatchesBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const { type, id } = parsed.data;

  if (type === "donation") {
    const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
    if (!donation) { res.status(404).json({ error: "Donation not found" }); return; }

    const activeRequests = await db
      .select()
      .from(requestsTable)
      .where(eq(requestsTable.status, "active"));

    const matches = [];
    for (const req2 of activeRequests) {
      if (req2.category !== donation.category) continue;
      if (donation.latitude == null || donation.longitude == null || req2.latitude == null || req2.longitude == null) continue;

      const dist = haversineKm(donation.latitude, donation.longitude, req2.latitude, req2.longitude);
      if (dist > Math.max(donation.radiusKm, req2.radiusKm)) continue;

      const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, req2.receiverId)).limit(1);
      matches.push({
        id: req2.id,
        type: "request",
        firstName: receiver?.fullName.split(" ")[0] ?? "Unknown",
        village: receiver?.village ?? null,
        category: req2.category,
        itemName: req2.itemName,
        distanceKm: Math.round(dist * 10) / 10,
        urgency: req2.urgency,
        trustScore: receiver?.trustScore ?? 0,
        isVerified: receiver?.isVerified ?? false,
      });
    }

    matches.sort((a, b) => {
      const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const uA = urgencyOrder[a.urgency as keyof typeof urgencyOrder] ?? 0;
      const uB = urgencyOrder[b.urgency as keyof typeof urgencyOrder] ?? 0;
      if (uA !== uB) return uB - uA;
      if (b.isVerified !== a.isVerified) return Number(b.isVerified) - Number(a.isVerified);
      return b.trustScore - a.trustScore;
    });

    res.json(matches);
  } else {
    const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
    if (!request) { res.status(404).json({ error: "Request not found" }); return; }

    const activeDonations = await db
      .select()
      .from(donationsTable)
      .where(eq(donationsTable.status, "active"));

    const matches = [];
    for (const don of activeDonations) {
      if (don.category !== request.category) continue;
      if (don.latitude == null || don.longitude == null || request.latitude == null || request.longitude == null) continue;

      const dist = haversineKm(don.latitude, don.longitude, request.latitude, request.longitude);
      if (dist > Math.max(don.radiusKm, request.radiusKm)) continue;

      const [donor] = await db.select().from(usersTable).where(eq(usersTable.id, don.donorId)).limit(1);
      matches.push({
        id: don.id,
        type: "donation",
        firstName: donor?.fullName.split(" ")[0] ?? "Unknown",
        village: donor?.village ?? null,
        category: don.category,
        itemName: don.itemName,
        distanceKm: Math.round(dist * 10) / 10,
        urgency: null,
        trustScore: donor?.trustScore ?? 0,
        isVerified: donor?.isVerified ?? false,
      });
    }

    matches.sort((a, b) => {
      if (b.isVerified !== a.isVerified) return Number(b.isVerified) - Number(a.isVerified);
      return b.trustScore - a.trustScore;
    });

    res.json(matches);
  }
});

router.patch("/:id/accept", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, id)).limit(1);
  if (!match) { res.status(404).json({ error: "Match not found" }); return; }

  const updates: Partial<typeof match> = {};
  if (user.id === match.donorId) updates.donorAccepted = true;
  else if (user.id === match.receiverId) updates.receiverAccepted = true;
  else { res.status(403).json({ error: "Forbidden" }); return; }

  const donorAccepted = updates.donorAccepted ?? match.donorAccepted;
  const receiverAccepted = updates.receiverAccepted ?? match.receiverAccepted;
  if (donorAccepted && receiverAccepted) {
    updates.status = "accepted";
    // Notify both parties
    await db.insert(notificationsTable).values([
      {
        userId: match.donorId,
        type: "accepted",
        title: "Match Accepted",
        message: "Your match has been accepted by both parties. Contact details are now visible.",
        relatedId: match.id,
      },
      {
        userId: match.receiverId,
        type: "accepted",
        title: "Match Accepted",
        message: "Your match has been accepted by both parties. Contact details are now visible.",
        relatedId: match.id,
      },
    ]);
  }

  const [updated] = await db
    .update(matchesTable)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(matchesTable.id, id))
    .returning();

  res.json(await formatMatch(updated, user.id));
});

router.patch("/:id/confirm", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [match] = await db.select().from(matchesTable).where(eq(matchesTable.id, id)).limit(1);
  if (!match) { res.status(404).json({ error: "Match not found" }); return; }
  if (user.id !== match.donorId && user.id !== match.receiverId) {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db
    .update(matchesTable)
    .set({ status: "confirmed", updatedAt: new Date() })
    .where(eq(matchesTable.id, id))
    .returning();

  // Notify receiver to leave a review
  await db.insert(notificationsTable).values({
    userId: match.receiverId,
    type: "review",
    title: "Please Leave a Review",
    message: "Your donation has been confirmed. Please leave a review for the donor.",
    relatedId: match.id,
  });

  res.json(await formatMatch(updated, user.id));
});

export default router;
