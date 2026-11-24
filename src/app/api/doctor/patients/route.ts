import { Errors, handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/doctor/patients — patients who have had appointments with the signed-in doctor */
export const GET = handler(async () => {
  const user = await requireUser("doctor");
  if (!user.doctor_id) throw Errors.forbidden();
  const rows = await query(
    `SELECT p.id AS patient_id, u.full_name, p.gender, p.blood_type, p.date_of_birth::text AS date_of_birth,
            p.allergies, p.chronic_conditions,
            count(a.id)::int AS total_visits,
            count(a.id) FILTER (WHERE a.status='completed')::int AS completed_visits,
            max(a.scheduled_at) FILTER (WHERE a.status='completed') AS last_visit,
            min(a.scheduled_at) FILTER (WHERE a.status IN ('pending','confirmed') AND a.scheduled_at > now()) AS next_visit
       FROM appointments a
       JOIN patients p ON p.id = a.patient_id
       JOIN users u ON u.id = p.user_id
      WHERE a.doctor_id = $1
      GROUP BY p.id, u.full_name
      ORDER BY max(a.scheduled_at) DESC`,
    [user.doctor_id],
  );
  return ok(rows);
});
