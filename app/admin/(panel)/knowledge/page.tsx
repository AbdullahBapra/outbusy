import { KnowledgeClient, type KbSourceRow } from "@/components/admin/knowledge/KnowledgeClient";
import { requireAdmin } from "@/lib/admin-auth";
import { isEmbeddingConfigured } from "@/lib/kb/embed";
import { supabaseUser } from "@/lib/supabase/server";

export const metadata = { title: "Knowledge base" };

export default async function KnowledgePage() {
  const member = await requireAdmin();
  const { data } = await (await supabaseUser())
    .from("kb_sources")
    .select("id, type, ref, title, url, body, status, error, chunk_count, updated_at")
    .order("type")
    .order("title");

  return <KnowledgeClient sources={(data ?? []) as KbSourceRow[]} canEdit={member.role === "owner"} embeddingsOn={isEmbeddingConfigured()} />;
}
