import { requireAdminRequest } from "@/lib/api/auth";
import { noContent, route } from "@/lib/api/http";
import { deleteVisitorData } from "@/lib/inbox";

type Ctx = { params: Promise<{ id: string }> };

/** DELETE /api/admin/visitors/:id: deletes a visitor's chats, messages and leads (owner; for privacy requests). */
export const DELETE = route(async (req, ctx: Ctx) => {
  const member = await requireAdminRequest(req, "owner");
  await deleteVisitorData((await ctx.params).id, member);
  return noContent();
});
