import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

/**
 * Consistent API envelope:
 *   success → { success: true,  data }
 *   failure → { success: false, error: { code, message, details? } }
 * Internal errors are logged server-side and never leaked to clients.
 */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message);
  }
}

export const Errors = {
  unauthorized: () => new ApiError(401, "UNAUTHORIZED", "Please sign in to continue."),
  forbidden: (msg = "You do not have permission to perform this action.") => new ApiError(403, "FORBIDDEN", msg),
  notFound: (what = "Resource") => new ApiError(404, "NOT_FOUND", `${what} not found.`),
  conflict: (msg: string) => new ApiError(409, "CONFLICT", msg),
  badRequest: (msg: string, details?: unknown) => new ApiError(400, "BAD_REQUEST", msg, details),
  tooMany: () => new ApiError(429, "RATE_LIMITED", "Too many requests. Please wait a moment and try again."),
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(err: unknown) {
  if (err instanceof ApiError) {
    return NextResponse.json(
      { success: false, error: { code: err.code, message: err.message, ...(err.details ? { details: err.details } : {}) } },
      { status: err.status },
    );
  }
  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.issues[0]?.message ?? "Invalid input.",
          details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
        },
      },
      { status: 422 },
    );
  }
  // Postgres unique violation → 409 without leaking internals
  if (typeof err === "object" && err && "code" in err && (err as { code: string }).code === "23505") {
    return NextResponse.json({ success: false, error: { code: "CONFLICT", message: "This record already exists or the slot is taken." } }, { status: 409 });
  }
  console.error("[api] unexpected error", err);
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." } }, { status: 500 });
}

/** Wrap a route handler so every thrown error becomes a safe JSON response. */
export function handler<A extends unknown[]>(fn: (...args: A) => Promise<Response>) {
  return async (...args: A) => {
    try {
      return await fn(...args);
    } catch (e) {
      return fail(e);
    }
  };
}

export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    throw Errors.badRequest("Request body must be valid JSON.");
  }
  return schema.parse(json);
}

export function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
