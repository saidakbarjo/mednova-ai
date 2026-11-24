import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await requireUser();
  return ok(await query("SELECT id, type, title, body, params, link, is_read, created_at FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 30", [user.id]));
});

/** PUT /api/notifications — mark all as read */
export const PUT = handler(async () => {
  const user = await requireUser();
  await query("UPDATE notifications SET is_read = TRUE WHERE user_id=$1 AND NOT is_read", [user.id]);
  return ok({ marked_read: true });
});
