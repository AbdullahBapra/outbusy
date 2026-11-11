import { TeamClient, type TeamRow } from "@/components/admin/TeamClient";
import { requireAdmin } from "@/lib/admin-auth";
import { supabaseUser } from "@/lib/supabase/server";

export const metadata = { title: "Team" };

export default async function TeamPage() {
  const member = await requireAdmin("owner");
  const { data } = await (await supabaseUser()).from("profiles").select("id, email, full_name, role, active, alerts_enabled, created_at").order("created_at");
  return <TeamClient me={member.id} members={(data ?? []) as TeamRow[]} />;
}
