import { Router } from "express";
import { db, donationsTable, usersTable } from "@workspace/db";
import { eq, and, ilike } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { haversineKm } from "../lib/distance";
import { CreateDonationBody, UpdateDonationBody } from "@workspace/api-zod";

const router = Router();

async function formatDonation(d: typeof donationsTable.$inferSelect, viewerLat?: number, viewerLng?: number) {
  const [donor] = await db.select().from(usersTable).where(eq(usersTable.id, d.donorId)).limit(1);
  let distance: number | null = null;
  if (viewerLat != null && viewerLng != null && d.latitude != null && d.longitude != null) {
    distance = Math.round(haversineKm(viewerLat, viewerLng, d.latitude, d.longitude) * 10) / 10;
  }
  return {
    id: d.id,
    donorId: d.donorId,
    donorName: donor?.fullName ?? "Unknown",
    donorVerified: donor?.isVerified ?? false,
    donorTrustScore: donor?.trustScore ?? 0,
    donorTrustLevel: donor?.trustLevel ?? "new",
    category: d.category,
    itemName: d.itemName,
    quantity: d.quantity,
    brand: d.brand ?? null,
    purchaseYear: d.purchaseYear ?? null,
    condition: d.condition,
    images: d.images ?? [],
    videoUrl: d.videoUrl ?? null,
    address: d.address ?? null,
    village: donor?.village ?? null,
    latitude: d.latitude ?? null,
    longitude: d.longitude ?? null,
    radiusKm: d.radiusKm,
    status: d.status,
    distance,
    createdAt: d.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { category, status, lat, lng, radius } = req.query as Record<string, string>;

  let query = db.select().from(donationsTable).$dynamic();
  const conditions = [];
  if (category) conditions.push(eq(donationsTable.category, category));
  if (status) conditions.push(eq(donationsTable.status, status as any));
  else conditions.push(eq(donationsTable.status, "active"));

  if (conditions.length > 0) query = query.where(and(...conditions));

  const donations = await query.orderBy(donationsTable.createdAt);
  const viewerLat = lat ? parseFloat(lat) : undefined;
  const viewerLng = lng ? parseFloat(lng) : undefined;
  const viewerRadius = radius ? parseInt(radius) : undefined;

  let results = await Promise.all(donations.map(d => formatDonation(d, viewerLat, viewerLng)));

  if (viewerLat != null && viewerLng != null && viewerRadius != null) {
    results = results.filter(r => r.distance == null || r.distance <= viewerRadius);
  }

  res.json(results);
});

router.post("/", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  // Any registered user can donate items

  const parsed = CreateDonationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const [donation] = await db.insert(donationsTable).values({
    donorId: user.id,
    ...parsed.data,
    images: (parsed.data.images ?? []) as string[],
    status: "active",
  }).returning();

  res.status(201).json(await formatDonation(donation));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [donation] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
  if (!donation) { res.status(404).json({ error: "Donation not found" }); return; }

  res.json(await formatDonation(donation));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [existing] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.donorId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = UpdateDonationBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db
    .update(donationsTable)
    .set({ ...parsed.data as any, updatedAt: new Date() })
    .where(eq(donationsTable.id, id))
    .returning();

  res.json(await formatDonation(updated));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [existing] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.donorId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.update(donationsTable).set({ status: "cancelled", updatedAt: new Date() }).where(eq(donationsTable.id, id));
  res.json({ message: "Donation cancelled" });
});

router.patch("/:id/complete", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [existing] = await db.select().from(donationsTable).where(eq(donationsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.donorId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const [updated] = await db
    .update(donationsTable)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(donationsTable.id, id))
    .returning();

  await db
    .update(usersTable)
    .set({ totalDonations: user.totalDonations + 1, updatedAt: new Date() })
    .where(eq(usersTable.id, user.id));

  res.json(await formatDonation(updated));
});

export default router;
