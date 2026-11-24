import { Errors, handler, isUuid, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one } from "@/lib/db";
import { userAdminUpdateSchema } from "@/lib/validation";

/** PUT /api/admin/users/:id — activate / deactivate accounts */
export const PUT = handler(async (req: Request, { params }: { params: { id: string } }) => {
  const admin = await requireUser("admin");
  if (!isUuid(params.id)) throw Errors.notFound("e.userNotFound");
  const b = await parseBody(req, userAdminUpdateSchema);
  if (params.id === admin.id) throw Errors.badRequest("e.selfChange");
  if (b.role !== undefined) throw Errors.badRequest("e.roleChange");
  const row = await one(
    "UPDATE users SET is_active = COALESCE($2, is_active) WHERE id = $1 RETURNING id, email, full_name, role, is_active",
    [params.id, b.is_active ?? null],
  );
  if (!row) throw Errors.notFound("e.userNotFound");
  return ok(row);
});
