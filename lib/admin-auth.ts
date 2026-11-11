import { redirect } from "next/navigation";
import { cache } from "react";
import { supabaseUser } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * Team login for /admin, backed by Supabase Auth (email + password, invite-only).
 * A signed-in Supabase user only counts as a team member when they have an active row in
 * `profiles`; anyone else is treated as signed out.
 */

export type Role = "owner" | "agent";
export type TeamMember = { id: string; email: string; fullName: string; role: Role; alertsEnabled: boolean };

/** The current team member, or null. Cached per request. */
export const getTeamMember = cache(async (): Promise<TeamMember | null> => {
  const supabase = await supabaseUser();
  // getUser() validates the token with Supabase Auth (getSession() would trust the cookie blindly).
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: p } = await supabaseAdmin()
    .from("profiles")
    .select("id, email, full_name, role, active, alerts_enabled")
    .eq("id", data.user.id)
    .maybeSingle();
  if (!p || !p.active) return null;
  return { id: p.id, email: p.email, fullName: p.full_name || p.email, role: p.role as Role, alertsEnabled: p.alerts_enabled };
});

export const isAdmin = async () => Boolean(await getTeamMember());

/** Use at the top of every admin page and Server Action. Owners pass every role check. */
export async function requireAdmin(role: Role = "agent"): Promise<TeamMember> {
  const member = await getTeamMember();
  if (!member) redirect("/admin/login");
  if (role === "owner" && member.role !== "owner") redirect("/admin?denied=1");
  return member;
}
