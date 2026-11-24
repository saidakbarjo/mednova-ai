import { handler, ok } from "@/lib/api";
import { endSession } from "@/lib/auth";

export const POST = handler(async () => {
  endSession();
  return ok({ signed_out: true });
});
