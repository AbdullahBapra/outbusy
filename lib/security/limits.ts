import { supabaseAdmin } from "@/lib/supabase";

/**
 * Abuse limits shared across server instances (stored in Postgres, not in memory, so they
 * hold on serverless). Both tables are server-only: RLS on, no policies.
 */

const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 5;

/** True when this email or IP has failed too often in the last 15 minutes. */
export async function isLoginLocked(email: string, ip: string) {
  const since = new Date(Date.now() - LOCK_WINDOW_MS).toISOString();
  const db = supabaseAdmin();
  const count = async (column: "email" | "ip", value: string) => {
    const { count } = await db
      .from("login_attempts")
      .select("id", { count: "exact", head: true })
      .eq(column, value)
      .eq("success", false)
      .gte("created_at", since);
    return count ?? 0;
  };
  const [byEmail, byIp] = await Promise.all([count("email", email), count("ip", ip)]);
  // The IP limit is looser so one office sharing an address isn't locked out by a single typo-prone user.
  return byEmail >= MAX_FAILED_LOGINS || byIp >= MAX_FAILED_LOGINS * 4;
}

export async function recordLogin(email: string, ip: string, success: boolean) {
  await supabaseAdmin().from("login_attempts").insert({ email, ip, success });
}

/**
 * Sliding-window limiter: records a hit for `key` and returns true when the key has made
 * more than `max` hits within `windowMs`.
 */
export async function rateLimited(key: string, max: number, windowMs: number) {
  const db = supabaseAdmin();
  const since = new Date(Date.now() - windowMs).toISOString();
  const [{ count }] = await Promise.all([
    db.from("rate_limits").select("key", { count: "exact", head: true }).eq("key", key).gte("created_at", since),
    db.from("rate_limits").insert({ key }),
  ]);
  return (count ?? 0) >= max;
}
