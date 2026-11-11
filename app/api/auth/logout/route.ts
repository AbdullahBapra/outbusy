import { assertSameOrigin } from "@/lib/api/auth";
import { noContent, route } from "@/lib/api/http";
import { supabaseUser } from "@/lib/supabase/server";

/** POST /api/auth/logout: ends the Supabase session and clears its cookies. */
export const POST = route(async (req) => {
  assertSameOrigin(req);
  await (await supabaseUser()).auth.signOut();
  return noContent();
});
