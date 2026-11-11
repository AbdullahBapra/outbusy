import type { PostCreateInput, PostUpdateInput } from "@/lib/blog/schema";
import type { ApiPost } from "@/lib/blog/types";

/**
 * Typed browser client for the app's own REST API (app/api). Used by the admin panel.
 * Requests are same-origin and carry the admin session cookie automatically.
 */

export type ApiFieldError = { path: string; message: string };

export class ApiClientError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details: ApiFieldError[] = [],
  ) {
    super(message);
    this.name = "ApiClientError";
  }

  /** First error message per top-level field, e.g. { title: "Title is required." }. */
  get fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const d of this.details) {
      const key = d.path.split(".")[0];
      if (key && !out[key]) out[key] = d.message;
    }
    return out;
  }
}

type ErrorBody = { error?: { code?: string; message?: string; details?: ApiFieldError[] } };

async function request<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...rest,
      credentials: "same-origin",
      headers: { Accept: "application/json", ...(json === undefined ? {} : { "Content-Type": "application/json" }), ...headers },
      body: json === undefined ? rest.body : JSON.stringify(json),
    });
  } catch {
    throw new ApiClientError(0, "network_error", "Can't reach the server. Check your connection and try again.");
  }

  if (res.status === 204) return undefined as T;
  const body = (await res.json().catch(() => ({}))) as ErrorBody & { data?: T };
  if (!res.ok) {
    const e = body.error ?? {};
    throw new ApiClientError(res.status, e.code ?? "http_error", e.message ?? `Request failed (${res.status}).`, e.details);
  }
  return body.data as T;
}

const enc = encodeURIComponent;

export const api = {
  auth: {
    login: (email: string, password: string) => request<{ authenticated: true; role: "owner" | "agent" }>("/auth/login", { method: "POST", json: { email, password } }),
    forgot: (email: string) => request<{ sent: true }>("/auth/forgot", { method: "POST", json: { email } }),
    setPassword: (password: string) => request<{ updated: true }>("/auth/password", { method: "POST", json: { password } }),
    logout: () => request<void>("/auth/logout", { method: "POST" }),
    session: () => request<{ authenticated: boolean; role?: "owner" | "agent"; name?: string }>("/auth/session"),
  },
  posts: {
    create: (input: PostCreateInput) => request<ApiPost>("/posts", { method: "POST", json: input }),
    update: (ref: string, input: PostUpdateInput) => request<ApiPost>(`/posts/${enc(ref)}`, { method: "PATCH", json: input }),
    remove: (ref: string) => request<void>(`/posts/${enc(ref)}`, { method: "DELETE" }),
    setPublished: (ref: string, published: boolean) => request<ApiPost>(`/posts/${enc(ref)}`, { method: "PATCH", json: { published } }),
    importStarter: () => request<{ imported: number }>("/posts/import", { method: "POST" }),
  },
  uploads: {
    create: (contentType: string, fileName: string) =>
      request<{ path: string; uploadUrl: string; publicUrl: string; headers: Record<string, string> }>("/uploads", {
        method: "POST",
        json: { contentType, fileName },
      }),
  },
  inbox: {
    takeOver: (id: string) => request<{ mode: "human" }>(`/admin/conversations/${enc(id)}/takeover`, { method: "POST" }),
    release: (id: string) => request<{ mode: "ai" }>(`/admin/conversations/${enc(id)}/release`, { method: "POST" }),
    reply: (id: string, content: string) => request<{ id: string; created_at: string }>(`/admin/conversations/${enc(id)}/messages`, { method: "POST", json: { content } }),
    update: (id: string, patch: { status?: "open" | "closed"; assignedTo?: string | null }) =>
      request<{ updated: true }>(`/admin/conversations/${enc(id)}`, { method: "PATCH", json: patch }),
    markRead: (id: string) => request<void>(`/admin/conversations/${enc(id)}/read`, { method: "POST" }),
    deleteVisitor: (visitorId: string) => request<void>(`/admin/visitors/${enc(visitorId)}`, { method: "DELETE" }),
  },
  leads: {
    update: (id: string, patch: Record<string, unknown>) => request<{ updated: true }>(`/admin/leads/${enc(id)}`, { method: "PATCH", json: patch }),
    addNote: (id: string, note: string) => request<{ added: true }>(`/admin/leads/${enc(id)}/notes`, { method: "POST", json: { note } }),
  },
  kb: {
    sync: (scope: "site" | "blog" | "all") => request<Record<string, { indexed: number; skipped: number; removed: number; failed: string[] }>>("/admin/kb/sync", { method: "POST", json: { scope } }),
    addManual: (entry: { title: string; body: string; url?: string }) => request<{ saved: true }>("/admin/kb/manual", { method: "POST", json: entry }),
    updateManual: (id: string, entry: { title: string; body: string; url?: string }) => request<{ saved: true }>(`/admin/kb/sources/${enc(id)}`, { method: "PATCH", json: entry }),
    remove: (id: string) => request<void>(`/admin/kb/sources/${enc(id)}`, { method: "DELETE" }),
    documentUpload: (contentType: string, fileName: string) => request<{ path: string; uploadUrl: string }>("/admin/kb/documents/upload", { method: "POST", json: { contentType, fileName } }),
    ingestDocument: (path: string, title: string) => request<{ indexed: true }>("/admin/kb/documents", { method: "POST", json: { path, title } }),
    search: (query: string) =>
      request<{ hits: { id: string; title: string; url: string | null; type: string; content: string; similarity: number; score: number }[]; confidence: number }>("/admin/kb/search", {
        method: "POST",
        json: { query },
      }),
  },
  settings: {
    update: (patch: Record<string, unknown>) => request<{ updated: true }>("/admin/settings", { method: "PATCH", json: patch }),
  },
  team: {
    invite: (input: { email: string; fullName: string; role: "owner" | "agent" }) => request<{ invited: true; link?: string }>("/admin/team", { method: "POST", json: input }),
    update: (id: string, patch: { role?: "owner" | "agent"; active?: boolean; alertsEnabled?: boolean; fullName?: string }) =>
      request<{ updated: true }>(`/admin/team/${enc(id)}`, { method: "PATCH", json: patch }),
  },
};
