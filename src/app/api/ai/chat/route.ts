import { Errors, handler, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one, query, transaction } from "@/lib/db";
import { generateReply } from "@/lib/ai/assistant";
import { rateLimit } from "@/lib/rate-limit";
import { chatSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** POST /api/ai/chat — { message, conversation_id? } → stores both messages, returns the reply */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`ai:${user.id}`, 30, 60 * 1000);
  const b = await parseBody(req, chatSchema);

  let conversationId = b.conversation_id ?? null;
  let history: { role: "user" | "assistant"; content: string }[] = [];
  if (conversationId) {
    const conv = await one("SELECT 1 FROM conversations WHERE id=$1 AND user_id=$2", [conversationId, user.id]);
    if (!conv) throw Errors.notFound("Conversation");
    history = await query("SELECT role, content FROM messages WHERE conversation_id=$1 ORDER BY created_at", [conversationId]);
  }

  const reply = await generateReply(history, b.message);

  const result = await transaction(async (tx) => {
    if (!conversationId) {
      const title = b.message.length > 60 ? `${b.message.slice(0, 57)}…` : b.message;
      const [c] = await tx.query<{ id: string }>("INSERT INTO conversations (user_id, title) VALUES ($1,$2) RETURNING id", [user.id, title]);
      conversationId = c.id;
    } else {
      await tx.query("UPDATE conversations SET updated_at = now() WHERE id=$1", [conversationId]);
    }
    const [u] = await tx.query(
      "INSERT INTO messages (conversation_id, role, content, is_emergency, source) VALUES ($1,'user',$2,$3,'user') RETURNING id, role, content, is_emergency, source, created_at",
      [conversationId, b.message, reply.is_emergency],
    );
    const [a] = await tx.query(
      "INSERT INTO messages (conversation_id, role, content, is_emergency, source) VALUES ($1,'assistant',$2,$3,$4) RETURNING id, role, content, is_emergency, source, created_at",
      [conversationId, reply.content, reply.is_emergency, reply.source],
    );
    return { user_message: u, assistant_message: a };
  });

  return ok({ conversation_id: conversationId, mode: reply.mode, ...result });
});
