import { z } from "zod";
import { assertSameOrigin, clientIp } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { getTeamMember } from "@/lib/admin-auth";
import { isLoginLocked, recordLogin } from "@/lib/security/limits";
import { supabaseUser } from "@/lib/supabase/server";

const loginSchema = z.strictObject({
  email: z.email("Enter your email address.").max(254),
  password: z.string({ error: "Enter your password." }).min(1, "Enter your password.").max(200),
});

// One message for every failure, so the response never reveals which accounts exist.
const INVALID = "That email and password don't match an active team account.";

/** POST /api/auth/login: { email, password } sets the Supabase session cookies. */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  const { email: rawEmail, password } = await readJson(req, loginSchema);
  const email = rawEmail.toLowerCase();
  const ip = clientIp(req);

  if (await isLoginLocked(email, ip)) {
    throw new HttpError(429, "locked", "Too many failed attempts. Try again in 15 minutes.");
  }

  const supabase = await supabaseUser();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  const member = error ? null : await getTeamMember();

  if (!member) {
    if (!error) await supabase.auth.signOut(); // a real Supabase user, but not an active team member
    await recordLogin(email, ip, false);
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    throw new HttpError(401, "invalid_credentials", INVALID);
  }

  await recordLogin(email, ip, true);
  return ok({ authenticated: true, role: member.role });
});
