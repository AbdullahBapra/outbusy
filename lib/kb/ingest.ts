import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { chunkDocument } from "@/lib/kb/chunk";
import { embedDocuments, toVector } from "@/lib/kb/embed";

export type KbType = "site" | "blog" | "manual" | "document";
export type KbDoc = { type: KbType; ref: string; title: string; url?: string | null; body: string; createdBy?: string | null; filePath?: string | null };

const checksumOf = (d: KbDoc) => createHash("sha256").update(`${d.title}\n${d.url ?? ""}\n${d.body}`).digest("hex");

/**
 * Creates or updates one knowledge source and (re)indexes its chunks. Unchanged documents
 * (same checksum, already indexed) are skipped, so syncing everything is cheap.
 * Returns "skipped" | "indexed"; on failure the source is marked `error` and the error rethrown.
 */
export async function upsertSource(doc: KbDoc): Promise<"skipped" | "indexed"> {
  const db = supabaseAdmin();
  const checksum = checksumOf(doc);

  const { data: existing } = await db.from("kb_sources").select("id, checksum, status").eq("type", doc.type).eq("ref", doc.ref).maybeSingle();
  if (existing && existing.checksum === checksum && existing.status === "indexed") return "skipped";

  const fields = {
    type: doc.type,
    ref: doc.ref,
    title: doc.title,
    url: doc.url ?? null,
    body: doc.type === "manual" ? doc.body : null,
    file_path: doc.filePath ?? null,
    status: "pending",
    error: null,
    updated_at: new Date().toISOString(),
    ...(doc.createdBy ? { created_by: doc.createdBy } : {}),
  };
  const { data: source, error } = await db.from("kb_sources").upsert(fields, { onConflict: "type,ref" }).select("id").single();
  if (error || !source) throw new Error(`Couldn't save the knowledge source: ${error?.message}`);

  try {
    const chunks = chunkDocument(doc.title, doc.body);
    const vectors = await embedDocuments(chunks);
    // Insert the new chunks first, then remove the old ones, so search never sees an empty source.
    const { data: inserted, error: insertError } = await db
      .from("kb_chunks")
      .insert(chunks.map((content, ord) => ({ source_id: source.id, ord, content, embedding: toVector(vectors[ord]) })))
      .select("id");
    if (insertError) throw new Error(insertError.message);
    const keep = (inserted ?? []).map((r) => r.id);
    await db.from("kb_chunks").delete().eq("source_id", source.id).not("id", "in", `(${keep.join(",")})`);
    await db.from("kb_sources").update({ status: "indexed", checksum, chunk_count: chunks.length, error: null }).eq("id", source.id);
    return "indexed";
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await db.from("kb_sources").update({ status: "error", error: message.slice(0, 500) }).eq("id", source.id);
    throw err;
  }
}

export async function removeSource(type: KbType, ref: string) {
  await supabaseAdmin().from("kb_sources").delete().eq("type", type).eq("ref", ref);
}

/** Upserts every doc of one type and deletes sources of that type that no longer exist. */
export async function syncType(type: KbType, docs: KbDoc[]) {
  const result = { indexed: 0, skipped: 0, removed: 0, failed: [] as string[] };
  for (const doc of docs) {
    try {
      result[await upsertSource(doc)]++;
    } catch (err) {
      result.failed.push(`${doc.ref}: ${err instanceof Error ? err.message : err}`);
    }
  }
  const db = supabaseAdmin();
  const { data: current } = await db.from("kb_sources").select("ref").eq("type", type);
  const wanted = new Set(docs.map((d) => d.ref));
  const stale = (current ?? []).map((r) => r.ref).filter((ref) => !wanted.has(ref));
  if (stale.length) {
    await db.from("kb_sources").delete().eq("type", type).in("ref", stale);
    result.removed = stale.length;
  }
  return result;
}
