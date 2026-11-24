import { handler, ok, parseBody } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { symptomInformation } from "@/lib/ai/assistant";
import { rateLimit } from "@/lib/rate-limit";
import { symptomSchema } from "@/lib/validation";

/** POST /api/ai/symptom-information — structured, rules-based educational information (never a diagnosis) */
export const POST = handler(async (req: Request) => {
  const user = await requireUser();
  rateLimit(`symptom:${user.id}`, 30, 60 * 1000);
  const b = await parseBody(req, symptomSchema);
  return ok(symptomInformation(b.symptoms, b.duration, b.age_group));
});
