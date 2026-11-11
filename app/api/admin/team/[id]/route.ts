import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { HttpError, ok, readJson, route } from "@/lib/api/http";
import { audit } from "@/lib/audit";
import { supabaseAdmin } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.strictObject({
  role: z.enum(["owner", "agent"]).optional(),
  active: z.boolean().optional(),
  alertsEnabled: z.boolean().optional(),
  fullName: z.string().trim().min(1).max(80).optional(),
});

/**
 * PATCH /api/admin/team/:id: owners change roles and deactivate members; everyone can change
 * their own name and alert preference. The last active owner can't be demoted or deactivated.
 */
export const PATCH = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  const id = (await ctx.params).id;
  const input = await readJson(req, schema);
  const self = id === member.id;
  const privileged = input.role !== undefined || input.active !== undefined;

  if (!self && member.role !== "owner") throw new HttpError(403, "forbidden", "Only owners can change other team members.");
  if (privileged && member.role !== "owner") throw new HttpError(403, "forbidden", "Only owners can change roles or access.");

  const db = supabaseAdmin();
  const { data: target } = await db.from("profiles").select("id, role, active").eq("id", id).maybeSingle();
  if (!target) throw new HttpError(404, "not_found", "Team member not found.");

  const losesOwner = target.role === "owner" && target.active && (input.role === "agent" || input.active === false);
  if (losesOwner) {
    const { count } = await db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "owner").eq("active", true);
    if ((count ?? 0) <= 1) throw new HttpError(409, "last_owner", "Keep at least one active owner.");
  }

  const patch: Record<string, unknown> = {};
  if (input.role) patch.role = input.role;
  if (input.active !== undefined) patch.active = input.active;
  if (input.alertsEnabled !== undefined) patch.alerts_enabled = input.alertsEnabled;
  if (input.fullName) patch.full_name = input.fullName;
  await db.from("profiles").update(patch).eq("id", id);

  // Deactivating someone also ends their sessions.
  if (input.active === false) await db.auth.admin.signOut(id).catch(() => {});
  if (privileged) await audit(member.id, "team.update", id, patch);
  return ok({ updated: true });
});
