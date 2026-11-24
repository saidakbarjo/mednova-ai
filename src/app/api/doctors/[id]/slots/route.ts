import { Errors, handler, isUuid, ok } from "@/lib/api";
import { one, query } from "@/lib/db";
import { buildSlots } from "@/lib/doctors";

export const dynamic = "force-dynamic";

/** GET /api/doctors/:id/slots?date=YYYY-MM-DD → available start times */
export const GET = handler(async (req: Request, { params }: { params: { id: string } }) => {
  if (!isUuid(params.id)) throw Errors.notFound("Doctor");
  const date = new URL(req.url).searchParams.get("date") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw Errors.badRequest("Provide date as YYYY-MM-DD.");
  const doctor = await one<{ is_verified: boolean }>("SELECT is_verified FROM doctors WHERE id=$1", [params.id]);
  if (!doctor || !doctor.is_verified) throw Errors.notFound("Doctor");

  const dow = new Date(`${date}T12:00:00`).getDay();
  const sched = await one<{ start_time: string; end_time: string; slot_minutes: number }>(
    `SELECT to_char(start_time,'HH24:MI') AS start_time, to_char(end_time,'HH24:MI') AS end_time, slot_minutes
       FROM doctor_schedules WHERE doctor_id=$1 AND day_of_week=$2 AND is_active`,
    [params.id, dow],
  );
  if (!sched) return ok({ date, working: false, slots: [] });

  const dayStart = new Date(`${date}T00:00:00`);
  const dayEnd = new Date(dayStart.getTime() + 86400000);
  const booked = await query<{ scheduled_at: Date }>(
    "SELECT scheduled_at FROM appointments WHERE doctor_id=$1 AND status IN ('pending','confirmed') AND scheduled_at >= $2 AND scheduled_at < $3",
    [params.id, dayStart.toISOString(), dayEnd.toISOString()],
  );
  const taken = new Set(booked.map((b) => new Date(b.scheduled_at).getTime()));
  const now = Date.now();
  const slots = buildSlots(date, sched.start_time, sched.end_time, sched.slot_minutes).map((d) => ({
    time: d.toISOString(),
    label: d.toTimeString().slice(0, 5),
    available: d.getTime() > now + 30 * 60 * 1000 && !taken.has(d.getTime()),
  }));
  return ok({ date, working: true, slot_minutes: sched.slot_minutes, slots });
});
