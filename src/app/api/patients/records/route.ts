import { Errors, handler, isUuid, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { notify } from "@/lib/notify";
import { vitalsSchema } from "@/lib/validation";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SELECT = `SELECT r.id, r.record_type, r.title, r.summary, r.data, r.recorded_at, r.appointment_id,
                       du.full_name AS doctor_name, s.name AS specialization
                  FROM medical_records r
                  LEFT JOIN doctors d ON d.id = r.doctor_id
                  LEFT JOIN users du ON du.id = d.user_id
                  LEFT JOIN specializations s ON s.id = d.specialization_id`;

/**
 * GET /api/patients/records?type=&patient_id=
 *  • patient → own records
 *  • doctor  → records of a patient they have treated (patient_id required)
 *  • admin   → forbidden: administrators manage accounts, not clinical data (least privilege)
 */
export const GET = handler(async (req: Request) => {
  const user = await requireUser("patient", "doctor");
  const url = new URL(req.url);
  let patientId = user.patient_id;
  if (user.role === "doctor") {
    patientId = url.searchParams.get("patient_id");
    if (!patientId || !isUuid(patientId)) throw Errors.badRequest("patient_id is required.");
    const rel = await one("SELECT 1 FROM appointments WHERE doctor_id=$1 AND patient_id=$2", [user.doctor_id, patientId]);
    if (!rel) throw Errors.forbidden("You can only view records of your own patients.");
  }
  const type = url.searchParams.get("type");
  const params: unknown[] = [patientId];
  let where = "WHERE r.patient_id = $1";
  if (type && ["visit_note", "lab_result", "vitals", "vaccination", "imaging"].includes(type)) {
    params.push(type);
    where += " AND r.record_type = $2";
  }
  return ok(await query(`${SELECT} ${where} ORDER BY r.recorded_at DESC LIMIT 200`, params));
});

const doctorNoteSchema = z.object({
  patient_id: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  summary: z.string().trim().max(2000).default(""),
  record_type: z.enum(["visit_note", "lab_result", "imaging", "vaccination"]).default("visit_note"),
});

/** POST /api/patients/records — patient logs vitals; doctor adds a note for their patient */
export const POST = handler(async (req: Request) => {
  const user = await requireUser("patient", "doctor");
  if (user.role === "patient") {
    const v = await parseBody(req, vitalsSchema);
    const [row] = await query(
      `INSERT INTO medical_records (patient_id, record_type, title, summary, data)
       VALUES ($1,'vitals','Home vitals log','Self-recorded measurements',$2) RETURNING id, record_type, title, summary, data, recorded_at`,
      [user.patient_id, JSON.stringify(v)],
    );
    if (v.weight_kg) await query("UPDATE patients SET weight_kg=$2 WHERE id=$1", [user.patient_id, v.weight_kg]);
    return ok(row, 201);
  }
  const b = await parseBody(req, doctorNoteSchema);
  const rel = await one<{ user_id: string }>(
    "SELECT p.user_id FROM appointments a JOIN patients p ON p.id=a.patient_id WHERE a.doctor_id=$1 AND a.patient_id=$2 LIMIT 1",
    [user.doctor_id, b.patient_id],
  );
  if (!rel) throw Errors.forbidden("You can only add records for your own patients.");
  const [row] = await query(
    `INSERT INTO medical_records (patient_id, doctor_id, record_type, title, summary) VALUES ($1,$2,$3,$4,$5)
     RETURNING id, record_type, title, summary, data, recorded_at`,
    [b.patient_id, user.doctor_id, b.record_type, b.title, b.summary],
  );
  await notify(rel.user_id, "record", "New medical record", `${user.full_name} added "${b.title}".`, "/dashboard/patient/records");
  return ok(row, 201);
});
