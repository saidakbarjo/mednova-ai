import { handler, ok } from "@/lib/api";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

export const GET = handler(async () =>
  ok(await query(
    `SELECT s.id, s.name, s.slug, s.description, s.icon, count(d.id) FILTER (WHERE d.is_verified)::int AS doctor_count
       FROM specializations s LEFT JOIN doctors d ON d.specialization_id = s.id GROUP BY s.id ORDER BY s.name`,
  )),
);
