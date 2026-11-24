import { handler, ok } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/admin/users?q=&role= */
export const GET = handler(async (req: Request) => {
  await requireUser("admin");
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim().slice(0, 80);
  const role = url.searchParams.get("role");
  const where: string[] = [];
  const params: unknown[] = [];
  if (q) { params.push(`%${q}%`); where.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length})`); }
  if (role && ["patient", "doctor", "admin"].includes(role)) { params.push(role); where.push(`u.role = $${params.length}`); }
  const rows = await query(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.is_demo, u.last_login_at, u.created_at,
            d.is_verified, (SELECT count(*)::int FROM appointments a WHERE a.patient_id = p.id OR a.doctor_id = d.id) AS appointments
       FROM users u LEFT JOIN patients p ON p.user_id = u.id LEFT JOIN doctors d ON d.user_id = u.id
       ${where.length ? "WHERE " + where.join(" AND ") : ""}
      ORDER BY u.created_at DESC LIMIT 500`,
    params,
  );
  return ok(rows);
});
