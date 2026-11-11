import { requireAdminRequest } from "@/lib/api/auth";
import { noContent, route } from "@/lib/api/http";
import { markRead } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

/** POST /api/admin/conversations/:id/read: clears the unread badge. */
export const POST = route(async (req, ctx: Ctx) => {
  await requireAdminRequest(req);
  await markRead((await ctx.params).id);
  return noContent();
});
