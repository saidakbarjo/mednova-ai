import { handler, ok } from "@/lib/api";
import { publicUser, requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  const user = await requireUser();
  const [{ unread }] = await query<{ unread: number }>(
    "SELECT count(*)::int AS unread FROM notifications WHERE user_id = $1 AND NOT is_read",
    [user.id],
  );
  return ok({ user: publicUser(user), unread_notifications: unread });
});
