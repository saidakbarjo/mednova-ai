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
  if (!isUuid(id)) throw Errors.notFound("Appointment");
  const a = await one<Appt>(`${APPOINTMENT_SELECT} WHERE a.id = $1`, [id]);
  if (!a) throw Errors.notFound("Appointment");
  const owns = user.role === "admin" || a.patient_id === user.patient_id || a.doctor_id === user.doctor_id;
  if (!owns) throw Errors.notFound("Appointment"); // don't reveal existence
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

  if (b.doctor_notes !== undefined && user.role === "patient") throw Errors.forbidden("Only the doctor can write visit notes.");
  if ((b.scheduled_at || b.reason) && user.role === "doctor") throw Errors.forbidden("Patients reschedule their own bookings.");
  if (b.status && b.status !== a.status) {
    const allowed = TRANSITIONS[user.role][a.status] ?? [];
    if (!allowed.includes(b.status)) throw Errors.badRequest(`Cannot change status from ${a.status} to ${b.status}.`);
  }
  if (b.scheduled_at) {
    if (!["pending", "confirmed"].includes(a.status)) throw Errors.badRequest("Only active appointments can be rescheduled.");
    if (new Date(b.scheduled_at).getTime() < Date.now() + 30 * 60 * 1000) throw Errors.badRequest("Choose a time at least 30 minutes from now.");
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
        [a.patient_id, a.doctor_id, a.id, `Visit — ${a.reason}`.slice(0, 160), b.doctor_notes ?? "Visit completed."],
      );
      await notify(a.patient_user_id, "record", "Visit summary added", `${a.doctor_name} added notes from your visit.`, "/dashboard/patient/records", tx);
    }
    const when = new Date(b.scheduled_at ?? a.scheduled_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    const other = user.role === "patient" ? a.doctor_user_id : a.patient_user_id;
    const otherLink = user.role === "patient" ? "/dashboard/doctor/appointments" : "/dashboard/patient/appointments";
    if (b.status === "confirmed") await notify(other, "appointment", "Appointment confirmed", `${a.doctor_name} confirmed your visit on ${when}.`, otherLink, tx);
    if (b.status === "cancelled") await notify(other, "appointment", "Appointment cancelled", `The visit on ${when} was cancelled by the ${user.role}.`, otherLink, tx);
    if (b.scheduled_at) await notify(a.doctor_user_id, "appointment", "Appointment rescheduled", `${a.patient_name} moved their visit to ${when}.`, "/dashboard/doctor/appointments", tx);
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
  if (!["pending", "confirmed"].includes(a.status)) throw Errors.badRequest("Only active appointments can be cancelled.");
  await transaction(async (tx) => {
    await tx.query("UPDATE appointments SET status='cancelled', cancelled_by=$2 WHERE id=$1", [a.id, user.role]);
    const other = user.role === "patient" ? a.doctor_user_id : a.patient_user_id;
    await notify(other, "appointment", "Appointment cancelled", `${user.full_name} cancelled the visit "${a.reason}".`, undefined, tx);
  });
  return ok({ id: a.id, status: "cancelled" });
});
