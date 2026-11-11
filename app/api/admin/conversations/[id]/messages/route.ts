import { z } from "zod";
import { requireAdminRequest } from "@/lib/api/auth";
import { ok, readJson, route } from "@/lib/api/http";
import { replyAsAgent } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.strictObject({ content: z.string().trim().min(1, "Write a reply first.").max(4000) });

/** POST /api/admin/conversations/:id/messages: a team member replies to the visitor (takes over if needed). */
export const POST = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  const { content } = await readJson(req, schema);
  const msg = await replyAsAgent((await ctx.params).id, member, content);
  return ok(msg, { status: 201 });
});
