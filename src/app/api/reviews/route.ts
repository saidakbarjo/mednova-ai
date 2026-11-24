import { Errors, handler, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { one, transaction } from "@/lib/db";
import { notify } from "@/lib/notify";
import { reviewSchema } from "@/lib/validation";

/** POST /api/reviews — a patient rates a completed appointment (once). Updates the doctor's rating. */
export const POST = handler(async (req: Request) => {
  const user = await requireUser("patient");
  const b = await parseBody(req, reviewSchema);
  const a = await one<{ id: string; doctor_id: string; status: string; doctor_user_id: string }>(
    `SELECT a.id, a.doctor_id, a.status, d.user_id AS doctor_user_id
       FROM appointments a JOIN doctors d ON d.id = a.doctor_id WHERE a.id = $1 AND a.patient_id = $2`,
    [b.appointment_id, user.patient_id],
  );
  if (!a) throw Errors.notFound("e.apptNotFound");
  if (a.status !== "completed") throw Errors.badRequest("e.reviewNotAllowed");
  if (await one("SELECT 1 FROM reviews WHERE appointment_id = $1", [a.id])) throw Errors.conflict("e.alreadyReviewed");

  const review = await transaction(async (tx) => {
    const [r] = await tx.query(
      "INSERT INTO reviews (appointment_id, patient_id, doctor_id, rating, comment) VALUES ($1,$2,$3,$4,$5) RETURNING id, rating, comment, created_at",
      [a.id, user.patient_id, a.doctor_id, b.rating, b.comment || null],
    );
    // Incremental average keeps historic (seeded) review counts meaningful
    await tx.query(
      `UPDATE doctors SET rating = round(((rating * review_count) + $2) / (review_count + 1)::numeric, 1), review_count = review_count + 1 WHERE id = $1`,
      [a.doctor_id, b.rating],
    );
    await notify(a.doctor_user_id, "review", "newReview", { patient: user.full_name, rating: b.rating }, "/dashboard/doctor", tx);
    return r;
  });
  return ok(review, 201);
});
