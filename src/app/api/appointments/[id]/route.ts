import { Errors, handler, isUuid, ok, parseBody } from "@/lib/api";
import { requireUser, type CurrentUser } from "@/lib/auth";
import { APPOINTMENT_SELECT } from "@/lib/appointments";
import { one, query, transaction } from "@/lib/db";
import { notify } from "@/lib/notify";
import { appointmentUpdateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";
type Ctx = { params: { id: string } };
type Appt = {
  id: string; status: string; scheduled_at: Date; patient_id: string; doctor_id: string;
  patient_user_id: string; doctor_user_id: string; patient_name: string; doctor_name: string; reason: string;
};

async function load(id: string, user: CurrentUser) {
  if (!isUuid(id)) throw Errors.notFound("e.apptNotFound");
  const a = await one<Appt>(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id]);
  if (!a) throw Errors.notFound("e.apptNotFound");
  const owns = user.role === "admin" || a.patient_id === user.patient_id || a.doctor_id === user.doctor_id;
  if (!owns) throw Errors.notFound("e.apptNotFound"); // don't reveal existence
  return a;
}

// Allowed status transitions per role
const TRANSITIONS: Record<string, Record<string, string[]>> = {
  patient: { pending: ["cancelled"], confirmed: ["cancelled"] },
  doctor: { pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled"] },
  admin: { pending: ["confirmed", "cancelled"], confirmed: ["completed", "cancelled", "pending"], cancelled: ["pending"], completed: [] },
};

export const GET = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  return ok(await load(params.id, user));
});

export const PUT = handler(async (req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const a = await load(params.id, user);
  const b = await parseBody(req, appointmentUpdateSchema);

  if (b.doctor_notes !== undefined && user.role === "patient") throw Errors.forbidden("e.notesDoctorOnly");
  if ((b.scheduled_at || b.reason) && user.role === "doctor") throw Errors.forbidden("e.patientReschedules");
  if (b.status && b.status !== a.status) {
    const allowed = TRANSITIONS[user.role][a.status] ?? [];
    if (!allowed.includes(b.status)) throw Errors.badRequest("e.badTransition");
  }
  if (b.scheduled_at) {
    if (!["pending", "confirmed"].includes(a.status)) throw Errors.badRequest("e.onlyActiveResched");
    if (new Date(b.scheduled_at).getTime() < Date.now() + 30 * 60 * 1000) throw Errors.badRequest("e.tooSoon");
  }

  await transaction(async (tx) => {
    const sets: string[] = [];
    const vals: unknown[] = [a.id];
    const push = (col: string, v: unknown) => { vals.push(v); sets.push(`${col} = $${vals.length}`); };
    if (b.status && b.status !== a.status) {
      push("status", b.status);
      if (b.status === "cancelled") push("cancelled_by", user.role);
    }
    if (b.scheduled_at) { push("scheduled_at", new Date(b.scheduled_at).toISOString()); push("status", "pending"); }
    if (b.reason) push("reason", b.reason);
    if (b.doctor_notes !== undefined) push("doctor_notes", b.doctor_notes);
    if (sets.length) await tx.query(`UPDATE appointments SET ${sets.join(", ")} WHERE id = $1`, vals);

    if (b.status === "completed" && (b.create_visit_record ?? true)) {
      await tx.query(
        `INSERT INTO medical_records (patient_id, doctor_id, appointment_id, record_type, title, summary)
         VALUES ($1,$2,$3,'visit_note',$4,$5)`,
        [a.patient_id, a.doctor_id, a.id, a.reason.slice(0, 160), b.doctor_notes ?? ""],
      );
      await notify(a.patient_user_id, "record", "visitSummary", { doctor: a.doctor_name }, "/dashboard/patient/records", tx);
    }
    const when = new Date(b.scheduled_at ?? a.scheduled_at).toISOString();
    const other = user.role === "patient" ? a.doctor_user_id : a.patient_user_id;
    const otherLink = user.role === "patient" ? "/dashboard/doctor/appointments" : "/dashboard/patient/appointments";
    if (b.status === "confirmed") await notify(other, "appointment", "apptConfirmed", { doctor: a.doctor_name, when }, otherLink, tx);
    if (b.status === "cancelled") await notify(other, "appointment", "apptCancelled", { name: user.full_name, when }, otherLink, tx);
    if (b.scheduled_at) await notify(a.doctor_user_id, "appointment", "apptRescheduled", { patient: a.patient_name, when }, "/dashboard/doctor/appointments", tx);
  });
  return ok(await one(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [a.id]));
});

/**
 * DELETE /api/appointments/:id
 *  • patient / doctor → cancels (soft delete — the medical audit trail is preserved)
 *  • admin            → permanently deletes the record
 */
export const DELETE = handler(async (_req: Request, { params }: Ctx) => {
  const user = await requireUser();
  const a = await load(params.id, user);
  if (user.role === "admin") {
    await query("DELETE FROM appointments WHERE id = $1", [a.id]);
    return ok({ id: a.id, deleted: true });
  }
  if (!["pending", "confirmed"].includes(a.status)) throw Errors.badRequest("e.onlyActiveCancel");
  await transaction(async (tx) => {
    await tx.query("UPDATE appointments SET status='cancelled', cancelled_by=$2 WHERE id=$1", [a.id, user.role]);
    const other = user.role === "patient" ? a.doctor_user_id : a.patient_user_id;
    await notify(other, "appointment", "apptCancelled", { name: user.full_name, when: new Date(a.scheduled_at).toISOString() }, null, tx);
  });
  return ok({ id: a.id, status: "cancelled" });
});
