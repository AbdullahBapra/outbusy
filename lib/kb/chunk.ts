/**
 * Splits a document into retrieval chunks of roughly CHUNK_CHARS characters (~450 tokens).
 * Splits on markdown headings first, then paragraphs, then sentences, so a chunk rarely cuts
 * an idea in half. Every chunk starts with the document title (and its section heading) so it
 * still makes sense on its own when it's retrieved.
 */
const CHUNK_CHARS = 1800;
const OVERLAP_CHARS = 200;

function splitLong(text: string): string[] {
  if (text.length <= CHUNK_CHARS) return [text];
  const sentences = text.match(/[^.!?\n]+[.!?]*\s*/g) ?? [text];
  const out: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (cur && cur.length + s.length > CHUNK_CHARS) {
      out.push(cur.trim());
      cur = cur.slice(-OVERLAP_CHARS);
    }
    cur += s;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

export function chunkDocument(title: string, body: string): string[] {
  const sections: { heading: string; text: string }[] = [];
  let heading = "";
  let buf: string[] = [];
  const flush = () => {
    const text = buf.join("\n").trim();
    if (text) sections.push({ heading, text });
    buf = [];
  };
  for (const line of body.replace(/\r\n/g, "\n").split("\n")) {
    const m = /^#{1,4}\s+(.+)/.exec(line);
    if (m) {
      flush();
      heading = m[1].trim();
    } else buf.push(line);
  }
  flush();

  const chunks: string[] = [];
  for (const { heading: h, text } of sections) {
    const prefix = h && h !== title ? `${title} — ${h}\n` : `${title}\n`;
    // Pack paragraphs together until the chunk is full.
    let cur = "";
    for (const para of text.split(/\n{2,}/)) {
      for (const piece of splitLong(para.trim())) {
        if (cur && cur.length + piece.length > CHUNK_CHARS) {
          chunks.push(prefix + cur.trim());
          cur = "";
        }
        cur += piece + "\n\n";
      }
    }
    if (cur.trim()) chunks.push(prefix + cur.trim());
  }
  return chunks.length ? chunks : [`${title}\n${body.trim()}`];
}
