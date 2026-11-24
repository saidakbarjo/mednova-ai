import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { aiMode } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

/** GET /api/ai/conversations — the caller's chat history list */
export const GET = handler(async () => {
  const user = await requireUser();
  const rows = await query(
    `SELECT c.id, c.title, c.updated_at, count(m.id)::int AS message_count
       FROM conversations c LEFT JOIN messages m ON m.conversation_id = c.id
      WHERE c.user_id = $1 GROUP BY c.id ORDER BY c.updated_at DESC LIMIT 50`,
    [user.id],
  );
  return ok({ mode: aiMode(), conversations: rows });
});
