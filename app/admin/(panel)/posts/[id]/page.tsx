import { notFound } from "next/navigation";
import { PostEditor } from "@/components/admin/PostEditor";
import { SetupGuide } from "@/components/admin/SetupGuide";
import { requireAdmin } from "@/lib/admin-auth";
import { findPostRow, listTags } from "@/lib/blog/service";
import { isAdminWriteConfigured } from "@/lib/supabase";

export const metadata = { title: "Edit post" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditPostPage({ params, searchParams }: Props) {
  await requireAdmin();
  if (!isAdminWriteConfigured()) return <SetupGuide />;
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [post, tags] = await Promise.all([findPostRow(id), listTags().catch(() => [])]);
  if (!post) notFound();
  // `key` resets the editor's local state if you navigate between posts.
  return <PostEditor key={post.id} post={post} tags={tags} justCreated={query.created === "1"} />;
}
