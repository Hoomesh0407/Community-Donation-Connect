import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../lib/auth";
import { usersTable } from "@workspace/db";

const router = Router();

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
  const id = parseInt(req.params.id);
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
