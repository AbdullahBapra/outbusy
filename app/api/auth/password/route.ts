import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { newPasswordSchema, passwordProblem } from "@/lib/security/password";
import { supabaseUser } from "@/lib/supabase/server";

const schema = z.strictObject({ password: newPasswordSchema });

/** POST /api/auth/password: sets a new password for the signed-in team member (after invite or reset). */
export const POST = route(async (req) => {
  const member = await requireAdminRequest(req);
  const { password } = await readJson(req, schema);
  const problem = passwordProblem(password, member.email);
  if (problem) throw new HttpError(400, "weak_password", problem);

  const { error } = await (await supabaseUser()).auth.updateUser({ password });
  if (error) throw new HttpError(400, "password_rejected", error.message);
  return ok({ updated: true });
});
