import { Errors, handler, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one, transaction } from "@/lib/db";
import { patientProfileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

const SELECT = `SELECT p.id, u.full_name, u.email, p.date_of_birth::text AS date_of_birth, p.gender, p.phone, p.blood_type,
                       p.height_cm::float AS height_cm, p.weight_kg::float AS weight_kg, p.allergies, p.chronic_conditions,
                       p.emergency_contact, p.updated_at
                  FROM patients p JOIN users u ON u.id = p.user_id WHERE p.id = $1`;

export const GET = handler(async () => {
  const user = await requireUser("patient");
  if (!user.patient_id) throw Errors.notFound("e.profileNotFound");
  return ok(await one(SELECT, [user.patient_id]));
});

export const PUT = handler(async (req: Request) => {
  const user = await requireUser("patient");
  if (!user.patient_id) throw Errors.notFound("e.profileNotFound");
  const b = await parseBody(req, patientProfileSchema);
  await transaction(async (tx) => {
    const cols = ["date_of_birth", "gender", "phone", "blood_type", "height_cm", "weight_kg", "allergies", "chronic_conditions", "emergency_contact"] as const;
    const entries = cols.filter((c) => b[c] !== undefined).map((c) => [c, b[c] === "" ? null : b[c]] as const);
    if (entries.length) {
      await tx.query(
        `UPDATE patients SET ${entries.map(([c], i) => `${c} = $${i + 2}`).join(", ")} WHERE id = $1`,
        [user.patient_id, ...entries.map(([, v]) => v)],
      );
    }
    if (b.full_name) await tx.query("UPDATE users SET full_name = $2 WHERE id = $1", [user.id, b.full_name]);
  });
  return ok(await one(SELECT, [user.patient_id]));
});
