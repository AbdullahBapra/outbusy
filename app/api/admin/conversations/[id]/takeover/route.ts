import { requireAdminRequest } from "@/lib/api/auth";
import { ok, route } from "@/lib/api/http";
import { takeOver } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/admin/conversations/:id/takeover: a team member takes over or joins the chat (AI stops replying). */
export const POST = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  await takeOver((await ctx.params).id, member);
  return ok({ mode: "human" });
});
