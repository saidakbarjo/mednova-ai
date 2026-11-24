import type { Queryable } from "./db";
import { query } from "./db";

/**
 * Notifications are stored as i18n keys + params, so each user reads them in their own language.
 * title = n.<key>.t, body = n.<key>.b. A param named "when" holds an ISO date and is formatted on the client.
 */
export async function notify(
  userId: string,
  type: "appointment" | "record" | "system" | "verification" | "review",
  key: string,
  params: Record<string, string | number> = {},
  link?: string | null,
  tx?: Queryable,
) {
  const sql = "INSERT INTO notifications (user_id, type, title, body, params, link) VALUES ($1,$2,$3,$4,$5,$6)";
  const values = [userId, type, `n.${key}.t`, `n.${key}.b`, JSON.stringify(params), link ?? null];
  if (tx) await tx.query(sql, values);
  else await query(sql, values);
}
