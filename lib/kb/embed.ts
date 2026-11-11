/**
 * Voyage AI embeddings (Anthropic's recommended embedding partner). 1024 dimensions, matching
 * the kb_chunks.embedding column. Documents and queries use different `input_type`s, which
 * Voyage tunes for asymmetric search.
 */
const MODEL = "voyage-3.5";
const DIMENSIONS = 1024;
const BATCH = 64;

export const isEmbeddingConfigured = () => Boolean(process.env.VOYAGE_API_KEY);

export class EmbeddingError extends Error {}

async function embedBatch(input: string[], inputType: "document" | "query"): Promise<number[][]> {
  const key = process.env.VOYAGE_API_KEY;
  if (!key) throw new EmbeddingError("VOYAGE_API_KEY is not set.");

  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.voyageai.com/v1/embeddings", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ input, model: MODEL, input_type: inputType, output_dimension: DIMENSIONS }),
      signal: AbortSignal.timeout(30_000),
    });
    // Back off on rate limits and transient server errors. Accounts without a payment method
    // are limited to 3 requests a minute, so rate limits wait ~20s before retrying.
    if (res.status === 429 && attempt < 6) {
      await new Promise((r) => setTimeout(r, 21_000));
      continue;
    }
    if (res.status >= 500 && attempt < 3) {
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
      continue;
    }
    if (!res.ok) throw new EmbeddingError(`Voyage responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const json = (await res.json()) as { data: { embedding: number[]; index: number }[] };
    return json.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
  }
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) out.push(...(await embedBatch(texts.slice(i, i + BATCH), "document")));
  return out;
}

export async function embedQuery(text: string): Promise<number[]> {
  const [v] = await embedBatch([text.slice(0, 4000)], "query");
  return v;
}

/** pgvector's text format: "[0.1,0.2,…]". */
export const toVector = (v: number[]) => `[${v.join(",")}]`;
