import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Per-request Supabase client bound to the signed-in team member's session cookies.
 * Queries run as that user, so row-level security (is_team / is_owner) decides what they
 * can read and write. Create a new one for every request; never share it.
 */
export async function supabaseUser() {
  const store = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "", {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. The proxy refreshes
          // the session on the next request, so this is safe to ignore.
        }
      },
    },
  });
}
