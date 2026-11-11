import { getTeamMember } from "@/lib/admin-auth";
import { ok, route } from "@/lib/api/http";

/** GET /api/auth/session: whether the caller is a signed-in team member, and their role. */
export const GET = route(async () => {
  const member = await getTeamMember();
  return ok(member ? { authenticated: true, role: member.role, name: member.fullName } : { authenticated: false });
});
