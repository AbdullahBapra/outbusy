import { supabaseAdmin } from "@/lib/supabase";

/** Records a sensitive admin action (takeover, deletion, role or settings change). Never throws. */
export async function audit(actorId: string | null, action: string, target?: string, data: Record<string, unknown> = {}) {
  const { error } = await supabaseAdmin().from("audit_log").insert({ actor_id: actorId, action, target: target ?? null, data });
  if (error) console.error("[audit] write failed:", error.message);
}
