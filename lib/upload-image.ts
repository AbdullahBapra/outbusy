import { api, ApiClientError } from "@/lib/api/client";

const MAX_WIDTH = 2400;

/** Downscale large photos and re-encode as WebP in the browser (GIFs are left untouched). */
async function optimise(file: File): Promise<File> {
  if (file.type === "image/gif" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_WIDTH / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    // Keep the original if re-encoding didn't help (e.g. already a small, optimised file).
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/**
 * Uploads an image for the blog and returns its public URL:
 * POST /api/uploads (admin) → one-time signed URL → PUT the file straight to Supabase Storage.
 */
export async function uploadBlogImage(original: File): Promise<string> {
  const file = await optimise(original);
  const ticket = await api.uploads.create(file.type, file.name);

  let res: Response;
  try {
    res = await fetch(ticket.uploadUrl, { method: "PUT", headers: ticket.headers, body: file });
  } catch {
    throw new ApiClientError(0, "network_error", "The image upload failed. Check your connection and try again.");
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new ApiClientError(res.status, "upload_failed", `The image upload failed (${res.status})${detail ? `: ${detail.slice(0, 120)}` : "."}`);
  }
  return ticket.publicUrl;
}
