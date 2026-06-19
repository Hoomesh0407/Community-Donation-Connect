import { Router } from "express";
import { db, requestsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { haversineKm } from "../lib/distance";
import { CreateRequestBody, UpdateRequestBody } from "@workspace/api-zod";

const router = Router();

async function formatRequest(r: typeof requestsTable.$inferSelect, viewerLat?: number, viewerLng?: number) {
  const [receiver] = await db.select().from(usersTable).where(eq(usersTable.id, r.receiverId)).limit(1);
  let distance: number | null = null;
  if (viewerLat != null && viewerLng != null && r.latitude != null && r.longitude != null) {
    distance = Math.round(haversineKm(viewerLat, viewerLng, r.latitude, r.longitude) * 10) / 10;
  }
  return {
    id: r.id,
    receiverId: r.receiverId,
    receiverName: receiver?.fullName ?? "Unknown",
    receiverVerified: receiver?.isVerified ?? false,
    category: r.category,
    itemName: r.itemName,
    quantity: r.quantity,
    reason: r.reason ?? null,
    urgency: r.urgency,
    address: r.address ?? null,
    village: receiver?.village ?? null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    radiusKm: r.radiusKm,
    status: r.status,
    distance,
    createdAt: r.createdAt.toISOString(),
  };
}

router.get("/", async (req, res) => {
  const { category, urgency, status } = req.query as Record<string, string>;

  let query = db.select().from(requestsTable).$dynamic();
  const conditions = [];
  if (category) conditions.push(eq(requestsTable.category, category));
  if (urgency) conditions.push(eq(requestsTable.urgency, urgency as any));
  if (status) conditions.push(eq(requestsTable.status, status as any));
  else conditions.push(eq(requestsTable.status, "active"));

  if (conditions.length > 0) query = query.where(and(...conditions));
  const requests = await query.orderBy(requestsTable.createdAt);

  res.json(await Promise.all(requests.map(r => formatRequest(r))));
});

router.post("/", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  if (user.role !== "receiver" && user.role !== "admin") {
    res.status(403).json({ error: "Only receivers can create requests" }); return;
  }

  const parsed = CreateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input", details: parsed.error.issues }); return; }

  const [request] = await db.insert(requestsTable).values({
    receiverId: user.id,
    ...parsed.data,
    status: "active",
  }).returning();

  res.status(201).json(await formatRequest(request));
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }

  const [request] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
  if (!request) { res.status(404).json({ error: "Request not found" }); return; }

  res.json(await formatRequest(request));
});

router.patch("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [existing] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.receiverId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  const parsed = UpdateRequestBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid input" }); return; }

  const [updated] = await db
    .update(requestsTable)
    .set({ ...parsed.data as any, updatedAt: new Date() })
    .where(eq(requestsTable.id, id))
    .returning();

  res.json(await formatRequest(updated));
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [existing] = await db.select().from(requestsTable).where(eq(requestsTable.id, id)).limit(1);
  if (!existing) { res.status(404).json({ error: "Not found" }); return; }
  if (existing.receiverId !== user.id && user.role !== "admin") {
    res.status(403).json({ error: "Forbidden" }); return;
  }

  await db.update(requestsTable).set({ status: "cancelled", updatedAt: new Date() }).where(eq(requestsTable.id, id));
  res.json({ message: "Request cancelled" });
});

export default router;
