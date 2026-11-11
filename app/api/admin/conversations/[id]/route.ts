import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { updateConversationMeta } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.strictObject({ status: z.enum(["open", "closed"]).optional(), assignedTo: z.uuid().nullable().optional() });

/** PATCH /api/admin/conversations/:id: close/reopen, or assign to a team member. */
export const PATCH = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  await updateConversationMeta((await ctx.params).id, member, await readJson(req, schema));
  return ok({ updated: true });
});
