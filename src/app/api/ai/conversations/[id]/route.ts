import { Errors, handler, isUuid, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one, query } from "@/lib/db";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  if (!isUuid(params.id)) throw Errors.notFound("Conversation");
  const conv = await one("SELECT id, title, created_at FROM conversations WHERE id=$1 AND user_id=$2", [params.id, user.id]);
  if (!conv) throw Errors.notFound("Conversation");
  const messages = await query(
    "SELECT id, role, content, is_emergency, source, created_at FROM messages WHERE conversation_id=$1 ORDER BY created_at",
    [params.id],
  );
  return ok({ ...conv, messages });
});

export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  if (!isUuid(params.id)) throw Errors.notFound("Conversation");
  const rows = await query("DELETE FROM conversations WHERE id=$1 AND user_id=$2 RETURNING id", [params.id, user.id]);
  if (!rows.length) throw Errors.notFound("Conversation");
  return ok({ id: params.id, deleted: true });
});
