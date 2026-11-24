import type { Queryable } from "./db";
import { query } from "./db";

export async function notify(
  userId: string,
  type: "appointment" | "record" | "system" | "verification",
  title: string,
  body: string,
  link?: string,
  tx?: Queryable,
) {
  const sql = "INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)";
  const params = [userId, type, title, body, link ?? null];
  if (tx) await tx.query(sql, params);
  else await query(sql, params);
}
