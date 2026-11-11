import { supabaseAdmin } from "@/lib/supabase";
import { embedQuery, toVector } from "@/lib/kb/embed";

export type KbHit = { id: string; sourceId: string; content: string; title: string; url: string | null; type: string; similarity: number; score: number };

/**
 * Hybrid search over the knowledge base (vector similarity + full text, fused in Postgres by
 * match_kb). `confidence` is the best vector similarity, used to decide whether the answer is
 * grounded well enough or the assistant should offer a human instead.
 */
export async function searchKnowledge(query: string, k = 6): Promise<{ hits: KbHit[]; confidence: number }> {
  const embedding = await embedQuery(query);
  const { data, error } = await supabaseAdmin().rpc("match_kb", { query_embedding: toVector(embedding), query_text: query, match_count: k });
  if (error) throw new Error(`Knowledge search failed: ${error.message}`);
  const hits: KbHit[] = (data ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    sourceId: r.source_id as string,
    content: r.content as string,
    title: r.title as string,
    url: (r.url as string | null) ?? null,
    type: r.type as string,
    similarity: Number(r.similarity),
    score: Number(r.score),
  }));
  return { hits, confidence: hits.reduce((m, h) => Math.max(m, h.similarity), 0) };
}
