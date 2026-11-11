import { supabaseAdmin } from "@/lib/supabase";
import { upsertSource } from "@/lib/kb/ingest";

/** Uploaded knowledge documents live in the private `kb-docs` bucket (owners only, via the server). */
export const KB_BUCKET = "kb-docs";

export const DOC_TYPES = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "text/plain": "txt",
  "text/markdown": "md",
} as const;
export type DocContentType = keyof typeof DOC_TYPES;

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "document";

/** One-time signed URL; the browser uploads the file straight to Storage. */
export async function createDocumentUpload(contentType: DocContentType, fileName: string) {
  const path = `${new Date().toISOString().slice(0, 7)}/${slug(fileName)}-${crypto.randomUUID().slice(0, 8)}.${DOC_TYPES[contentType]}`;
  const { data, error } = await supabaseAdmin().storage.from(KB_BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(`Couldn't prepare the upload: ${error.message}`);
  return { path: data.path, uploadUrl: data.signedUrl };
}

async function extractText(bytes: Buffer, ext: string): Promise<string> {
  if (ext === "pdf") {
    const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await pdfText(pdf, { mergePages: true });
    return text;
  }
  if (ext === "docx") {
    const mammoth = await import("mammoth");
    return (await mammoth.extractRawText({ buffer: bytes })).value;
  }
  return bytes.toString("utf8");
}

/** Downloads an uploaded file, extracts its text and indexes it as a `document` source. */
export async function ingestDocument({ path, title, createdBy }: { path: string; title: string; createdBy: string }) {
  if (!/^[\w-]+\/[\w.-]+$/.test(path)) throw new Error("Invalid file path.");
  const ext = path.split(".").pop() ?? "";
  const { data, error } = await supabaseAdmin().storage.from(KB_BUCKET).download(path);
  if (error || !data) throw new Error(`Couldn't read the uploaded file: ${error?.message}`);

  const text = (await extractText(Buffer.from(await data.arrayBuffer()), ext)).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (text.length < 20) throw new Error("No readable text found in that file (scanned PDFs need OCR first).");

  return upsertSource({ type: "document", ref: path, title, body: text, filePath: path, createdBy });
}

export async function deleteDocumentFile(path: string) {
  await supabaseAdmin().storage.from(KB_BUCKET).remove([path]);
}
