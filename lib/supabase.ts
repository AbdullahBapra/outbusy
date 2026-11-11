import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase wiring for the blog.
 *  - NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY: public, read-only (RLS allows
 *    reading published posts and blog images, nothing else).
 *  - SUPABASE_SERVICE_ROLE_KEY: server-only, used by admin Server Actions after the admin
 *    session is verified. Never prefix it with NEXT_PUBLIC_.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const BLOG_BUCKET = "blog";
export const POSTS_TABLE = "posts";

export const isSupabaseConfigured = () => Boolean(url && anonKey);
export const isAdminWriteConfigured = () => Boolean(url && process.env.SUPABASE_SERVICE_ROLE_KEY);

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

let publicClient: SupabaseClient | null = null;
export function supabasePublic() {
  if (!isSupabaseConfigured()) throw new Error("Supabase is not configured (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).");
  publicClient ??= createClient(url, anonKey, opts);
  return publicClient;
}

/** Service-role client. Only call from server code that has already checked the admin session. */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Supabase admin access is not configured (SUPABASE_SERVICE_ROLE_KEY).");
  return createClient(url, key, opts);
}
