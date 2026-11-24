import bcrypt from "bcryptjs";
import { ApiError, handler, ok, parseBody } from "@/lib/api";
import { publicUser, startSession, type CurrentUser } from "@/lib/auth";
import { one, query } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

// Used to keep response time constant when the email does not exist (prevents user enumeration).
const DUMMY_HASH = bcrypt.hashSync("mednova-timing-equaliser", 12);

export const POST = handler(async (req: Request) => {
  const body = await parseBody(req, loginSchema);
  rateLimit(`login:${clientIp(req)}:${body.email}`, 8, 5 * 60 * 1000);

  const row = await one<CurrentUser & { password_hash: string }>(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.is_demo, u.password_hash,
            p.id AS patient_id, d.id AS doctor_id
       FROM users u LEFT JOIN patients p ON p.user_id = u.id LEFT JOIN doctors d ON d.user_id = u.id
      WHERE u.email = $1`,
    [body.email],
  );
  const valid = await bcrypt.compare(body.password, row?.password_hash ?? DUMMY_HASH);
  if (!row || !valid) throw new ApiError(401, "INVALID_CREDENTIALS", "Incorrect email or password.");
  if (!row.is_active) throw new ApiError(403, "ACCOUNT_DISABLED", "This account has been deactivated. Contact support.");

  await query("UPDATE users SET last_login_at = now() WHERE id = $1", [row.id]);
  await startSession({ sub: row.id, role: row.role, name: row.full_name, email: row.email });
  return ok({ user: publicUser(row) });
});
