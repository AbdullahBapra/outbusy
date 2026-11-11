import { requireAdminRequest } from "@/lib/api/auth";
import { ok, route } from "@/lib/api/http";
import { returnToAi } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/admin/conversations/:id/release: hands the chat back to the AI assistant. */
export const POST = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req);
  await returnToAi((await ctx.params).id, member);
  return ok({ mode: "ai" });
});
