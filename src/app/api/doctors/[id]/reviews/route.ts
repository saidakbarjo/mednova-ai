import { Errors, handler, isUuid, ok } from "@/lib/api";
import { query } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET /api/doctors/:id/reviews — public, patient names shortened for privacy */
export const GET = handler(async (_req: Request, { params }: { params: { id: string } }) => {
  if (!isUuid(params.id)) throw Errors.notFound("e.doctorNotFound");
  const rows = await query<{ full_name: string }>(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.full_name
       FROM reviews r JOIN patients p ON p.id = r.patient_id JOIN users u ON u.id = p.user_id
      WHERE r.doctor_id = $1 ORDER BY r.created_at DESC LIMIT 30`,
    [params.id],
  );
  return ok(rows.map(({ full_name, ...r }) => {
    const [first, last] = full_name.split(" ");
    return { ...r, author: `${first}${last ? ` ${last[0]}.` : ""}` };
  }));
});
