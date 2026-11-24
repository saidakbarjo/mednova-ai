import { handler, ok } from "@/lib/api";
import { dbKind, query } from "@/lib/db";
import { aiMode } from "@/lib/ai/assistant";

export const dynamic = "force-dynamic";

export const GET = handler(async () => {
  await query("SELECT 1");
  return ok({ status: "ok", database: await dbKind(), ai_mode: aiMode(), time: new Date().toISOString() });
});
