import { Errors, handler, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { APPOINTMENT_SELECT } from "@/lib/appointments";
import { one, query, transaction } from "@/lib/db";
import { buildSlots } from "@/lib/doctors";
import { notify } from "@/lib/notify";
import { appointmentCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/appointments?scope=upcoming|past|today|all&status=&from=&to= — scoped to the caller's role */
export const GET = handler(async (req: Request) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope") ?? "all";
  const status = url.searchParams.get("status");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");

  const where: string[] = [];
  const params: unknown[] = [];
  if (user.role === "patient") { params.push(user.patient_id); where.push(`a.patient_id = $${params.length}`); }
  if (user.role === "doctor") { params.push(user.doctor_id); where.push(`a.doctor_id = $${params.length}`); }
  if (scope === "upcoming") where.push("a.scheduled_at >= now() AND a.status IN ('pending','confirmed')");
  if (scope === "past") where.push("(a.scheduled_at < now() OR a.status IN ('completed','cancelled'))");
  if (scope === "today") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    params.push(start.toISOString()); where.push(`a.scheduled_at >= $${params.length}`);
    params.push(new Date(start.getTime() + 86400000).toISOString()); where.push(`a.scheduled_at < $${params.length}`);
  }
  if (status && ["pending", "confirmed", "completed", "cancelled"].includes(status)) { params.push(status); where.push(`a.status = $${params.length}`); }
  if (from && !isNaN(Date.parse(from))) { params.push(new Date(from).toISOString()); where.push(`a.scheduled_at >= $${params.length}`); }
  if (to && !isNaN(Date.parse(to))) { params.push(new Date(to).toISOString()); where.push(`a.scheduled_at < $${params.length}`); }

  const order = scope === "past" ? "DESC" : "ASC";
  const rows = await query(
    `${APPOINTMENT_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""} ORDER BY a.scheduled_at ${order} LIMIT 300`,
    params,
  );
  return ok(rows);
});

/** POST /api/appointments — a patient books a slot */
export const POST = handler(async (req: Request) => {
  const user = await requireUser("patient");
  if (!user.patient_id) throw Errors.forbidden();
  const b = await parseBody(req, appointmentCreateSchema);
  const when = new Date(b.scheduled_at);
  if (when.getTime() < Date.now() + 30 * 60 * 1000) throw Errors.badRequest("e.tooSoon");
  if (when.getTime() > Date.now() + 180 * 86400000) throw Errors.badRequest("e.tooFar");

  const doctor = await one<{ id: string; user_id: string; is_verified: boolean; full_name: string }>(
    "SELECT d.id, d.user_id, d.is_verified, u.full_name FROM doctors d JOIN users u ON u.id=d.user_id WHERE d.id=$1 AND u.is_active",
    [b.doctor_id],
  );
  if (!doctor || !doctor.is_verified) throw Errors.notFound("e.doctorNotFound");

  // Server-side check that the time is a real slot in the doctor's working hours
  const pad = (n: number) => String(n).padStart(2, "0");
  const localDate = `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}`;
  const sched = await one<{ start_time: string; end_time: string; slot_minutes: number }>(
    `SELECT to_char(start_time,'HH24:MI') AS start_time, to_char(end_time,'HH24:MI') AS end_time, slot_minutes
       FROM doctor_schedules WHERE doctor_id=$1 AND day_of_week=$2 AND is_active`,
    [doctor.id, when.getDay()],
  );
  const valid = sched && buildSlots(localDate, sched.start_time, sched.end_time, sched.slot_minutes).some((s) => s.getTime() === when.getTime());
  if (!valid) throw Errors.badRequest("e.outsideHours");

  const clash = await one(
    "SELECT 1 FROM appointments WHERE patient_id=$1 AND scheduled_at=$2 AND status IN ('pending','confirmed')",
    [user.patient_id, when.toISOString()],
  );
  if (clash) throw Errors.conflict("e.patientClash");

  const id = await transaction(async (tx) => {
    const [a] = await tx.query<{ id: string }>(
      `INSERT INTO appointments (patient_id, doctor_id, scheduled_at, duration_minutes, reason, visit_type)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [user.patient_id, doctor.id, when.toISOString(), sched!.slot_minutes, b.reason, b.visit_type],
    );
    const whenIso = when.toISOString();
    await notify(doctor.user_id, "appointment", "bookingRequest", { patient: user.full_name, when: whenIso }, "/dashboard/doctor/appointments", tx);
    await notify(user.id, "appointment", "bookingSent", { doctor: doctor.full_name, when: whenIso }, "/dashboard/patient/appointments", tx);
    return a.id;
  });
  return ok(await one(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id]), 201);
});
