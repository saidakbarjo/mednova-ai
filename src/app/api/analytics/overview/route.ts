import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/analytics/overview — role-aware statistics */
export const GET = handler(async () => {
  const user = await requireUser();

  if (user.role === "admin") {
    const [totals] = await query(
      `SELECT (SELECT count(*)::int FROM users) AS users,
              (SELECT count(*)::int FROM users WHERE role='patient') AS patients,
              (SELECT count(*)::int FROM doctors) AS doctors,
              (SELECT count(*)::int FROM doctors WHERE is_verified) AS verified_doctors,
              (SELECT count(*)::int FROM doctors WHERE NOT is_verified) AS pending_verification,
              (SELECT count(*)::int FROM appointments) AS appointments,
              (SELECT count(*)::int FROM appointments WHERE scheduled_at >= now() AND status IN ('pending','confirmed')) AS upcoming_appointments,
              (SELECT count(*)::int FROM messages WHERE role='user') AS ai_questions,
              (SELECT count(*)::int FROM users WHERE NOT is_active) AS inactive_users`,
    );
    const byStatus = await query("SELECT status, count(*)::int AS count FROM appointments GROUP BY status ORDER BY status");
    const monthly = await query(
      `SELECT to_char(date_trunc('month', scheduled_at), 'Mon YY') AS month, date_trunc('month', scheduled_at) AS m,
              count(*)::int AS total,
              count(*) FILTER (WHERE status='completed')::int AS completed,
              count(*) FILTER (WHERE status='cancelled')::int AS cancelled
         FROM appointments WHERE scheduled_at >= date_trunc('month', now()) - interval '5 months'
        GROUP BY 1,2 ORDER BY 2`,
    );
    const bySpecialization = await query(
      `SELECT s.name, count(a.id)::int AS appointments, count(DISTINCT d.id)::int AS doctors
         FROM specializations s LEFT JOIN doctors d ON d.specialization_id = s.id
         LEFT JOIN appointments a ON a.doctor_id = d.id
        GROUP BY s.name ORDER BY appointments DESC`,
    );
    const roles = await query("SELECT role, count(*)::int AS count FROM users GROUP BY role");
    return ok({ role: "admin", totals, by_status: byStatus, monthly, by_specialization: bySpecialization, roles });
  }

  if (user.role === "doctor") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);
    const [totals] = await query(
      `SELECT count(*) FILTER (WHERE scheduled_at >= $2 AND scheduled_at < $3 AND status <> 'cancelled')::int AS today,
              count(*) FILTER (WHERE scheduled_at >= now() AND status IN ('pending','confirmed'))::int AS upcoming,
              count(*) FILTER (WHERE status='pending')::int AS pending,
              count(*) FILTER (WHERE status='completed')::int AS completed,
              count(DISTINCT patient_id)::int AS patients
         FROM appointments WHERE doctor_id = $1`,
      [user.doctor_id, start.toISOString(), end.toISOString()],
    );
    const byStatus = await query("SELECT status, count(*)::int AS count FROM appointments WHERE doctor_id=$1 GROUP BY status", [user.doctor_id]);
    const weekly = await query(
      `SELECT to_char(date_trunc('week', scheduled_at), 'DD Mon') AS week, date_trunc('week', scheduled_at) AS w, count(*)::int AS total
         FROM appointments WHERE doctor_id=$1 AND scheduled_at >= now() - interval '10 weeks' AND scheduled_at < now() + interval '2 weeks'
        GROUP BY 1,2 ORDER BY 2`,
      [user.doctor_id],
    );
    return ok({ role: "doctor", totals, by_status: byStatus, weekly });
  }

  const [totals] = await query(
    `SELECT (SELECT count(*)::int FROM appointments WHERE patient_id=$1 AND scheduled_at >= now() AND status IN ('pending','confirmed')) AS upcoming,
            (SELECT count(*)::int FROM appointments WHERE patient_id=$1 AND status='completed') AS completed_visits,
            (SELECT count(*)::int FROM medical_records WHERE patient_id=$1) AS records,
            (SELECT count(DISTINCT doctor_id)::int FROM appointments WHERE patient_id=$1) AS doctors_seen`,
    [user.patient_id],
  );
  const vitals = await query(
    "SELECT recorded_at, data FROM medical_records WHERE patient_id=$1 AND record_type='vitals' ORDER BY recorded_at ASC LIMIT 60",
    [user.patient_id],
  );
  const [profile] = await query(
    "SELECT height_cm::float AS height_cm, weight_kg::float AS weight_kg, blood_type FROM patients WHERE id=$1",
    [user.patient_id],
  );
  return ok({ role: "patient", totals, vitals, profile });
});
