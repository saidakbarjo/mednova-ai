import { cookies } from "next/headers";
import { Errors } from "./api";
import { one } from "./db";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession, type Role, type SessionPayload } from "./session";

export interface CurrentUser {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  is_demo: boolean;
  patient_id: string | null;
  doctor_id: string | null;
}

/**
 * Loads the user from the DB on every request (not just from the token),
 * so deactivated accounts or role changes take effect immediately.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await verifySession(cookies().get(SESSION_COOKIE)?.value);
  if (!session) return null;
  const user = await one<CurrentUser>(
    `SELECT u.id, u.email, u.full_name, u.role, u.is_active, u.is_demo,
            p.id AS patient_id, d.id AS doctor_id
       FROM users u
       LEFT JOIN patients p ON p.user_id = u.id
       LEFT JOIN doctors  d ON d.user_id = u.id
      WHERE u.id = $1`,
    [session.sub],
  );
  if (!user || !user.is_active) return null;
  return user;
}

export async function requireUser(...roles: Role[]): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw Errors.unauthorized();
  if (roles.length && !roles.includes(user.role)) throw Errors.forbidden();
  return user;
}

export async function startSession(payload: SessionPayload) {
  const token = await signSession(payload);
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.MEDNOVA_INSECURE_COOKIES !== "1",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function endSession() {
  cookies().set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function publicUser(u: CurrentUser) {
  return {
    id: u.id,
    email: u.email,
    full_name: u.full_name,
    role: u.role,
    is_demo: u.is_demo,
    patient_id: u.patient_id,
    doctor_id: u.doctor_id,
  };
}
