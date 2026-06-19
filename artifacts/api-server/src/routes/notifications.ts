import { Router, Response } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getUserIdFromToken } from "../lib/auth";
import { usersTable } from "@workspace/db";

const router = Router();

const sseClients = new Map<number, Response[]>();

export function pushNotificationToUser(
  userId: number,
  notification: {
    id: number; userId: number; type: string; title: string;
    message: string; isRead: boolean; relatedId: number | null; createdAt: string;
  }
) {
  const clients = sseClients.get(userId);
  if (!clients || clients.length === 0) return;
  const payload = `data: ${JSON.stringify(notification)}\n\n`;
  for (const res of clients) {
    try { res.write(payload); } catch {}
  }
}

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    relatedId: n.relatedId ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/stream", async (req, res) => {
  const token = req.query.token as string | undefined;
  if (!token) { res.status(401).end(); return; }

  const userId = getUserIdFromToken(token);
  if (!userId) { res.status(401).end(); return; }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
  if (!user || user.status === "suspended") { res.status(401).end(); return; }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();
  res.write(`: connected uid=${userId}\n\n`);

  const existing = sseClients.get(userId) ?? [];
  existing.push(res);
  sseClients.set(userId, existing);

  const heartbeat = setInterval(() => {
    try { res.write(`: heartbeat\n\n`); } catch {}
  }, 25000);

  req.on("close", () => {
    clearInterval(heartbeat);
    const remaining = (sseClients.get(userId) ?? []).filter((r) => r !== res);
    if (remaining.length === 0) sseClients.delete(userId);
    else sseClients.set(userId, remaining);
  });
});

router.get("/", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, user.id))
    .orderBy(notificationsTable.createdAt);

  res.json(notifications.map(formatNotification));
});

router.patch("/read-all", requireAuth, async (req, res) => {
  const user = (req as any).user as typeof usersTable.$inferSelect;
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.isRead, false)));

  res.json({ message: "All notifications marked as read" });
});

router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id));
  const user = (req as any).user as typeof usersTable.$inferSelect;

  const [updated] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, user.id)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(formatNotification(updated));
});

export default router;
