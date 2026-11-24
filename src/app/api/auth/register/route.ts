import bcrypt from "bcryptjs";
import { Errors, handler, ok, parseBody } from "@/lib/api";
import { publicUser, startSession } from "@/lib/auth";
import { one, query, transaction } from "@/lib/db";
import { notify } from "@/lib/notify";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { registerSchema } from "@/lib/validation";
import { getLocale } from "@/i18n/server";

export const POST = handler(async (req: Request) => {
  rateLimit(`register:${clientIp(req)}`, 10, 60 * 60 * 1000);
  const body = await parseBody(req, registerSchema);

  const exists = await one("SELECT 1 FROM users WHERE email = $1", [body.email]);
  if (exists) throw Errors.conflict("e.emailTaken");
  if (body.role === "doctor" && !body.specialization_id) throw Errors.badRequest("e.chooseSpec");

  const hash = await bcrypt.hash(body.password, 12);
  const user = await transaction(async (tx) => {
    const [u] = await tx.query<{ id: string }>(
      "INSERT INTO users (email, password_hash, full_name, role, locale) VALUES ($1,$2,$3,$4,$5) RETURNING id",
      [body.email, hash, body.full_name, body.role, getLocale()],
    );
    if (body.role === "patient") {
      await tx.query("INSERT INTO patients (user_id) VALUES ($1)", [u.id]);
      await notify(u.id, "system", "welcome", {}, "/dashboard/profile", tx);
    } else {
      const spec = await tx.query("SELECT 1 FROM specializations WHERE id = $1", [body.specialization_id]);
      if (!spec.length) throw Errors.badRequest("e.unknownSpec");
      await tx.query("INSERT INTO doctors (user_id, specialization_id) VALUES ($1,$2)", [u.id, body.specialization_id]);
      await notify(u.id, "verification", "verifyPending", {}, "/dashboard/profile", tx);
      const admins = await tx.query<{ id: string }>("SELECT id FROM users WHERE role = 'admin' AND is_active");
      for (const a of admins) {
        await notify(a.id, "verification", "newDoctor", { name: body.full_name }, "/dashboard/admin/doctors", tx);
      }
    }
    return u;
  });

  const [full] = await query<Parameters<typeof publicUser>[0]>(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.is_demo, p.id AS patient_id, d.id AS doctor_id
       FROM users u LEFT JOIN patients p ON p.user_id = u.id LEFT JOIN doctors d ON d.user_id = u.id WHERE u.id = $1`,
    [user.id],
  );
  await startSession({ sub: full.id, role: full.role, name: full.full_name, email: full.email });
  return ok({ user: publicUser(full) }, 201);
});
