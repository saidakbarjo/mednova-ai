import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { getT } from "@/i18n/server";
import type { Params } from "@/i18n";

/**
 * Consistent API envelope:
 *   success → { success: true,  data }
 *   failure → { success: false, error: { code, message, details? } }
 * Messages are i18n keys translated into the caller's language (cookie `mednova_lang`).
 * Internal errors are logged server-side and never leaked to clients.
 */
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public params?: Params) {
    super(message);
  }
}

export const Errors = {
  unauthorized: () => new ApiError(401, "UNAUTHORIZED", "e.unauthorized"),
  forbidden: (key = "e.forbidden") => new ApiError(403, "FORBIDDEN", key),
  notFound: (key = "e.notFound") => new ApiError(404, "NOT_FOUND", key),
  conflict: (key: string) => new ApiError(409, "CONFLICT", key),
  badRequest: (key: string, params?: Params) => new ApiError(400, "BAD_REQUEST", key, params),
  tooMany: () => new ApiError(429, "RATE_LIMITED", "e.tooMany"),
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status, headers: { "Cache-Control": "no-store" } });
}

export function fail(err: unknown) {
  const { t, dict } = getT();
  const tr = (key: string, params?: Params) => (key in dict ? t(key, params) : key);
  if (err instanceof ApiError) {
    return NextResponse.json({ success: false, error: { code: err.code, message: tr(err.message, err.params) } }, { status: err.status });
  }
  if (err instanceof ZodError) {
    const msg = (i: ZodError["issues"][number]) =>
      i.message in dict ? t(i.message) : i.code === "invalid_type" && i.received === "undefined" ? t("v.required") : t("v.invalid");
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: err.issues[0] ? msg(err.issues[0]) : t("v.invalid"),
          details: err.issues.map((i) => ({ field: i.path.join("."), message: msg(i) })),
        },
      },
      { status: 422 },
    );
  }
  if (typeof err === "object" && err && "code" in err && (err as { code: string }).code === "23505") {
    return NextResponse.json({ success: false, error: { code: "CONFLICT", message: t("e.conflict") } }, { status: 409 });
  }
  console.error("[api] unexpected error", err);
  return NextResponse.json({ success: false, error: { code: "INTERNAL_ERROR", message: t("e.internal") } }, { status: 500 });
}

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
    throw Errors.badRequest("e.badJson");
  }
  return schema.parse(json);
}

export function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}
