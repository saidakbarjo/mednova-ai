import { Errors, handler, isUuid, ok, parseBody } from "@/lib/api";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { one, query, transaction } from "@/lib/db";
import { DOCTOR_SELECT, SCHEDULE_SELECT } from "@/lib/doctors";
import { notify } from "@/lib/notify";
import { doctorUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  if (!isUuid(params.id)) throw Errors.notFound("e.doctorNotFound");
  const user = await getCurrentUser();
  const doctor = await one<Record<string, unknown>>(`${DOCTOR_SELECT} WHERE d.id = $1`, [params.id]);
  const canSeeUnverified = user && (user.role === "admin" || user.doctor_id === params.id);
  if (!doctor || (!doctor.is_verified && !canSeeUnverified)) throw Errors.notFound("e.doctorNotFound");
  const schedule = await query(SCHEDULE_SELECT, [params.id]);
  const [stats] = await query<{ completed: number; patients: number }>(
    "SELECT count(*) FILTER (WHERE status='completed')::int AS completed, count(DISTINCT patient_id)::int AS patients FROM appointments WHERE doctor_id=$1",
    [params.id],
  );
  if (user?.role !== "admin" && user?.doctor_id !== params.id) delete doctor.email;
  return ok({ ...doctor, schedule, stats });
});

/** PUT /api/doctors/:id — the doctor edits their own profile/schedule; admin can edit any + verify */
export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser("doctor", "admin");
  if (!isUuid(params.id)) throw Errors.notFound("e.doctorNotFound");
  if (user.role === "doctor" && user.doctor_id !== params.id) throw Errors.forbidden("e.ownProfileOnly");
  const b = await parseBody(req, doctorUpdateSchema);
  if (b.is_verified !== undefined && user.role !== "admin") throw Errors.forbidden("e.adminVerifyOnly");

  const existing = await one<{ user_id: string; is_verified: boolean }>("SELECT user_id, is_verified FROM doctors WHERE id=$1", [params.id]);
  if (!existing) throw Errors.notFound("e.doctorNotFound");

  await transaction(async (tx) => {
    const fields: [string, unknown][] = [];
    for (const key of ["specialization_id", "title", "bio", "years_experience", "consultation_fee", "clinic_name", "city", "languages"] as const) {
      if (b[key] !== undefined) fields.push([key, b[key]]);
    }
    if (b.is_verified !== undefined) {
      fields.push(["is_verified", b.is_verified]);
      fields.push(["verified_at", b.is_verified ? new Date().toISOString() : null]);
    }
    if (fields.length) {
      const sets = fields.map(([k], i) => `${k} = $${i + 2}`).join(", ");
      await tx.query(`UPDATE doctors SET ${sets} WHERE id = $1`, [params.id, ...fields.map(([, v]) => v)]);
    }
    if (b.full_name) await tx.query("UPDATE users SET full_name=$2 WHERE id=$1", [existing.user_id, b.full_name]);
    if (b.schedule) {
      await tx.query("DELETE FROM doctor_schedules WHERE doctor_id=$1", [params.id]);
      for (const s of b.schedule) {
        await tx.query(
          "INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_minutes, is_active) VALUES ($1,$2,$3,$4,$5,$6)",
          [params.id, s.day_of_week, s.start_time, s.end_time, s.slot_minutes, s.is_active],
        );
      }
    }
    if (b.is_verified !== undefined && b.is_verified !== existing.is_verified) {
      await notify(existing.user_id, "verification", b.is_verified ? "verified" : "unverified", {}, "/dashboard/doctor", tx);
    }
  });
  const doctor = await one(`${DOCTOR_SELECT} WHERE d.id = $1`, [params.id]);
  return ok({ ...doctor, schedule: await query(SCHEDULE_SELECT, [params.id]) });
});
