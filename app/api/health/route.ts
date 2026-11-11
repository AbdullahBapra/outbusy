import { json, route } from "@/lib/api/http";
import { POSTS_TABLE, isAdminWriteConfigured, isSupabaseConfigured, supabasePublic } from "@/lib/supabase";

/**
 * GET /api/health — uptime / monitoring check.
 * 200 when the API can serve requests (database reachable, or running on built-in posts);
 * 503 when the database is configured but unreachable.
 */
export const GET = route(async () => {
  let database: "ok" | "not_configured" | "error" = "not_configured";
  if (isSupabaseConfigured()) {
    const { error } = await supabasePublic().from(POSTS_TABLE).select("id", { head: true, count: "exact" }).limit(1);
    database = error ? "error" : "ok";
  }
  const healthy = database !== "error";
  return json(
    {
      status: healthy ? "ok" : "degraded",
      database,
      admin: isAdminWriteConfigured() ? "enabled" : "disabled",
      time: new Date().toISOString(),
    },
    { status: healthy ? 200 : 503 },
  );
});
