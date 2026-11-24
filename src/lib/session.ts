import { SignJWT, jwtVerify } from "jose";

/** Edge-safe session helpers (used by middleware and route handlers). */
export const SESSION_COOKIE = "mednova_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type Role = "patient" | "doctor" | "admin";
export interface SessionPayload {
  sub: string; // user id
  role: Role;
  name: string;
  email: string;
}

const DEV_FALLBACK = "mednova-dev-only-secret-change-me-in-production-0123456789";

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production" && process.env.MEDNOVA_ALLOW_DEV_SECRET !== "1") {
      throw new Error("JWT_SECRET must be set (≥ 32 characters) in production");
    }
    return new TextEncoder().encode(DEV_FALLBACK);
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, name: payload.name, email: payload.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("mednova-ai")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { issuer: "mednova-ai", algorithms: ["HS256"] });
    if (!payload.sub || !["patient", "doctor", "admin"].includes(payload.role as string)) return null;
    return { sub: payload.sub, role: payload.role as Role, name: String(payload.name), email: String(payload.email) };
  } catch {
    return null;
  }
}

export function dashboardPath(role: Role) {
  return `/dashboard/${role}`;
}
