import bcrypt from "bcryptjs";
import { Errors, handler, ok, parseBody } from "@/lib/api";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { one, query, transaction } from "@/lib/db";
import { DOCTOR_SELECT } from "@/lib/doctors";
import { doctorCreateSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

/** GET /api/doctors?q=&specialization=&city=&include_unverified=1 (admin) */
export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 80);
  const spec = url.searchParams.get("specialization")?.trim();
  const city = url.searchParams.get("city")?.trim();
  const user = await getCurrentUser();
  const includeUnverified = user?.role === "admin" && url.searchParams.get("include_unverified") === "1";

  const where: string[] = [];
  const params: unknown[] = [];
  if (!includeUnverified) where.push("d.is_verified AND u.is_active");
  if (q) {
    params.push(`%${q}%`);
    where.push(`(u.full_name ILIKE $${params.length} OR s.name ILIKE $${params.length} OR d.clinic_name ILIKE $${params.length})`);
  }
  if (spec) {
    params.push(spec);
    where.push(`(s.slug = $${params.length} OR s.id::text = $${params.length})`);
  }
  if (city) {
    params.push(city);
    where.push(`d.city ILIKE $${params.length}`);
  }
  const rows = await query(
    `${DOCTOR_SELECT} ${where.length ? "WHERE " + where.join(" AND ") : ""}
     ORDER BY d.is_verified DESC, d.rating DESC, u.full_name LIMIT 100`,
    params,
  );
  // Email addresses are only visible to admins
  const data = user?.role === "admin" ? rows : rows.map(({ email: _e, ...r }) => r);
  return ok(data);
});

/** POST /api/doctors — admin creates a doctor account + profile */
export const POST = handler(async (req: Request) => {
  await requireUser("admin");
  const b = await parseBody(req, doctorCreateSchema);
  if (await one("SELECT 1 FROM users WHERE email=$1", [b.email])) throw Errors.conflict("An account with this email already exists.");
  if (!(await one("SELECT 1 FROM specializations WHERE id=$1", [b.specialization_id]))) throw Errors.badRequest("Unknown specialization.");
  const hash = await bcrypt.hash(b.password, 12);
  const id = await transaction(async (tx) => {
    const [u] = await tx.query<{ id: string }>(
      "INSERT INTO users (email, password_hash, full_name, role) VALUES ($1,$2,$3,'doctor') RETURNING id",
      [b.email, hash, b.full_name],
    );
    const [d] = await tx.query<{ id: string }>(
      `INSERT INTO doctors (user_id, specialization_id, title, bio, years_experience, consultation_fee, clinic_name, city, languages, is_verified, verified_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CASE WHEN $10 THEN now() ELSE NULL END) RETURNING id`,
      [u.id, b.specialization_id, b.title, b.bio, b.years_experience, b.consultation_fee, b.clinic_name, b.city, b.languages, b.is_verified],
    );
    for (let day = 1; day <= 5; day++) {
      await tx.query("INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time) VALUES ($1,$2,'09:00','17:00')", [d.id, day]);
    }
    return d.id;
  });
  return ok(await one(`${DOCTOR_SELECT} WHERE d.id = $1`, [id]), 201);
});
