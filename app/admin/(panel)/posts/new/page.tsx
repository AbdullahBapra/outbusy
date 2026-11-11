import { PostEditor } from "@/components/admin/PostEditor";
import { SetupGuide } from "@/components/admin/SetupGuide";
import { requireAdmin } from "@/lib/admin-auth";
import { listTags } from "@/lib/blog/service";
import { isAdminWriteConfigured } from "@/lib/supabase";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireAdmin();
  if (!isAdminWriteConfigured()) return <SetupGuide />;
  const tags = await listTags().catch(() => []);
  return <PostEditor tags={tags} />;
}
