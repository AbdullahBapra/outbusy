"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, FileUp, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export type KbSourceRow = {
  id: string;
  type: "site" | "blog" | "manual" | "document";
  ref: string;
  title: string;
  url: string | null;
  body: string | null;
  status: "pending" | "indexed" | "error";
  error: string | null;
  chunk_count: number;
  updated_at: string;
};

const TYPES = [
  { id: "all", label: "All" },
  { id: "site", label: "Website" },
  { id: "blog", label: "Blog" },
  { id: "manual", label: "Manual" },
  { id: "document", label: "Documents" },
] as const;

const DOC_MIME: Record<string, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  txt: "text/plain",
  md: "text/markdown",
};

const PAGE_SIZE = 20;

type Editing = { id?: string; title: string; body: string; url: string };

export function KnowledgeClient({ sources, canEdit, embeddingsOn }: { sources: KbSourceRow[]; canEdit: boolean; embeddingsOn: boolean }) {
  const router = useRouter();
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof api.kb.search>> | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [filterText, setFilterText] = useState("");
  const [page, setPage] = useState(1);
  const matching = useMemo(() => {
    const t = filterText.trim().toLowerCase();
    return sources.filter((s) => (type === "all" || s.type === type) && (!t || s.title.toLowerCase().includes(t) || s.url?.toLowerCase().includes(t)));
  }, [sources, type, filterText]);
  const pages = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const shown = matching.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const counts = useMemo(() => Object.fromEntries(TYPES.map((t) => [t.id, t.id === "all" ? sources.length : sources.filter((s) => s.type === t.id).length])), [sources]);
  const errors = sources.filter((s) => s.status === "error").length;

  const run = async (label: string, fn: () => Promise<string | void>) => {
    setBusy(label);
    setMessage(null);
    try {
      const text = await fn();
      if (text) setMessage({ kind: "ok", text });
      router.refresh();
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof ApiClientError ? err.message : "Something went wrong." });
    } finally {
      setBusy(null);
    }
  };

  const sync = () =>
    run("sync", async () => {
      const r = await api.kb.sync("all");
      const parts = Object.entries(r).map(([k, v]) => `${k === "site" ? "Website" : "Blog"}: ${v.indexed} updated, ${v.skipped} unchanged${v.removed ? `, ${v.removed} removed` : ""}${v.failed.length ? `, ${v.failed.length} failed` : ""}`);
      return `Sync finished. ${parts.join(" · ")}`;
    });

  const upload = (file: File) =>
    run("upload", async () => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const mime = DOC_MIME[ext];
      if (!mime) throw new ApiClientError(400, "bad_type", "Upload a PDF, Word (.docx), text or markdown file.");
      if (file.size > 20 * 1024 * 1024) throw new ApiClientError(400, "too_big", "Files can be up to 20 MB.");
      const { path, uploadUrl } = await api.kb.documentUpload(mime, file.name);
      const res = await fetch(uploadUrl, { method: "PUT", headers: { "Content-Type": mime }, body: file });
      if (!res.ok) throw new ApiClientError(res.status, "upload_failed", "The upload failed. Please try again.");
      await api.kb.ingestDocument(path, file.name.replace(/\.[a-z0-9]+$/i, ""));
      return `"${file.name}" was added to the knowledge base.`;
    });

  const saveEntry = () => {
    if (!editing) return;
    const entry = { title: editing.title, body: editing.body, url: editing.url };
    void run("save", async () => {
      if (editing.id) await api.kb.updateManual(editing.id, entry);
      else await api.kb.addManual(entry);
      setEditing(null);
      return "Saved and indexed.";
    });
  };

  const search = () =>
    run("search", async () => {
      if (query.trim().length < 2) return;
      setResults(await api.kb.search(query));
    });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Knowledge base</h1>
          <p className="mt-1 max-w-2xl text-sm text-black/55">
            Everything the assistant is allowed to answer from. Website pages and published blog posts sync automatically; add your own entries and documents for anything else.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={!!busy || !embeddingsOn} onClick={sync} className="flex h-9 items-center gap-1.5 rounded-md border border-black/15 px-3.5 text-sm transition hover:border-black disabled:opacity-50">
              {busy === "sync" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} Resync website & blog
            </button>
            <button type="button" disabled={!!busy || !embeddingsOn} onClick={() => fileRef.current?.click()} className="flex h-9 items-center gap-1.5 rounded-md border border-black/15 px-3.5 text-sm transition hover:border-black disabled:opacity-50">
              {busy === "upload" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileUp className="h-4 w-4" />} Upload document
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void upload(f);
              }}
            />
            <button type="button" disabled={!!busy || !embeddingsOn} onClick={() => setEditing({ title: "", body: "", url: "" })} className="flex h-9 items-center gap-1.5 rounded-md bg-[var(--ink)] px-3.5 text-sm font-medium text-white disabled:opacity-50">
              <Plus className="h-4 w-4" /> Add entry
            </button>
          </div>
        )}
      </div>

      {!embeddingsOn && (
        <p className="mt-6 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Add <code className="rounded bg-amber-100 px-1">VOYAGE_API_KEY</code> to the server environment to index and search the knowledge base.
        </p>
      )}
      {message && (
        <p className={cn("mt-6 flex items-start gap-2 rounded-lg px-4 py-3 text-sm", message.kind === "ok" ? "bg-[var(--mint-100)] text-[#0b4f47]" : "bg-red-50 text-red-700")}>
          {message.kind === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" /> : <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />} {message.text}
        </p>
      )}

      {/* Test search */}
      <section className="mt-6 rounded-lg border border-black/[0.07] bg-white p-5">
        <h2 className="font-semibold">Test a question</h2>
        <p className="text-sm text-black/50">See which knowledge the assistant would use to answer it.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void search();
          }}
          className="mt-3 flex gap-2"
        >
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. How much does a voice agent cost?" className="h-10 flex-1 rounded-lg border border-black/10 px-3 text-sm outline-none focus:border-[var(--teal)]" />
          <button type="submit" disabled={!!busy || !embeddingsOn} className="flex h-10 items-center gap-1.5 rounded-lg bg-[var(--ink)] px-4 text-sm text-white disabled:opacity-50">
            {busy === "search" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} Search
          </button>
        </form>
        {results && (
          <div className="mt-4">
            <p className="text-sm text-black/55">
              Best match {(results.confidence * 100).toFixed(0)}%{" "}
              {results.confidence < 0.45 && <span className="text-amber-700">· weak, so the assistant would offer a person instead of guessing</span>}
            </p>
            <ol className="mt-2 space-y-2">
              {results.hits.map((h) => (
                <li key={h.id} className="rounded-lg border border-black/[0.07] p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="font-medium">
                      {h.title} <span className="text-xs font-normal text-black/40">({h.type})</span>
                    </span>
                    <span className="flex-none text-xs tabular-nums text-black/45">{(h.similarity * 100).toFixed(0)}%</span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-[13px] text-black/55">{h.content}</p>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>

      {/* Sources */}
      <div className="mt-6 flex flex-wrap items-center gap-1.5">
        {TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              setType(t.id);
              setPage(1);
            }}
            className={cn("rounded-md px-3 py-1 text-xs transition", type === t.id ? "bg-[var(--ink)] text-white" : "bg-black/[0.04] text-black/60 hover:bg-black/10")}>
            {t.label} <span className="opacity-60">{counts[t.id]}</span>
          </button>
        ))}
        {errors > 0 && <span className="ml-2 text-xs text-red-600">{errors} failed to index</span>}
        <label className="relative ml-auto max-sm:ml-0 max-sm:w-full">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" />
          <input
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value);
              setPage(1);
            }}
            placeholder="Filter by title or URL"
            className="h-8 w-60 rounded-md border border-black/10 bg-white pl-8 pr-3 text-[13px] outline-none focus:border-[var(--teal)] max-sm:w-full"
          />
        </label>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-black/[0.07] bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-black/[0.07] text-[11px] uppercase tracking-[0.12em] text-black/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Updated</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {shown.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3">
                  <span className="block font-medium">{s.title}</span>
                  {s.url && (
                    <Link href={s.url} target="_blank" className="text-xs text-black/45 hover:underline">
                      {s.url}
                    </Link>
                  )}
                </td>
                <td className="px-4 py-3 capitalize text-black/60">{s.type === "site" ? "website" : s.type}</td>
                <td className="px-4 py-3">
                  {s.status === "indexed" ? (
                    <span className="text-[var(--teal)]">Indexed · {s.chunk_count} part{s.chunk_count === 1 ? "" : "s"}</span>
                  ) : s.status === "error" ? (
                    <span className="text-red-600" title={s.error ?? ""}>
                      Failed
                    </span>
                  ) : (
                    <span className="text-black/45">Pending</span>
                  )}
                </td>
                <td className="px-4 py-3 text-black/45">{new Date(s.updated_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">
                  {canEdit && s.type === "manual" && (
                    <button type="button" onClick={() => setEditing({ id: s.id, title: s.title, body: s.body ?? "", url: s.url ?? "" })} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5" aria-label={`Edit ${s.title}`}>
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  {canEdit && (s.type === "manual" || s.type === "document") && (
                    <button
                      type="button"
                      disabled={!!busy}
                      onClick={() => confirm(`Remove "${s.title}" from the knowledge base?`) && void run("delete", async () => void (await api.kb.remove(s.id)))}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-red-600 hover:bg-red-50"
                      aria-label={`Remove ${s.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!shown.length && (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-black/45">
                  Nothing here yet. {canEdit && type !== "manual" && type !== "document" && "Run “Resync website & blog” to index the site."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {matching.length > PAGE_SIZE && (
        <nav aria-label="Pagination" className="mt-3 flex items-center justify-between text-[13px] text-black/55">
          <span className="tabular-nums">
            {(current - 1) * PAGE_SIZE + 1}–{Math.min(matching.length, current * PAGE_SIZE)} of {matching.length} sources
          </span>
          <span className="flex items-center gap-2">
            <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)} className="flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 hover:border-black/40 disabled:opacity-40">
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)} className="flex h-8 items-center gap-1 rounded-md border border-black/10 bg-white px-2.5 hover:border-black/40 disabled:opacity-40">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </span>
        </nav>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true" aria-label="Knowledge entry">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{editing.id ? "Edit entry" : "New knowledge entry"}</h2>
              <button type="button" onClick={() => setEditing(null)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-black/5" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1 text-sm text-black/50">Write it as you&apos;d want the assistant to explain it. Use ## headings to split long entries.</p>
            <label className="mt-4 block text-xs font-medium text-black/50">
              Title
              <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-[var(--teal)]" placeholder="e.g. Refund and cancellation policy" />
            </label>
            <label className="mt-3 block text-xs font-medium text-black/50">
              Link (optional)
              <input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} className="mt-1 h-10 w-full rounded-md border border-black/10 px-3 text-sm outline-none focus:border-[var(--teal)]" placeholder="/terms or https://…" />
            </label>
            <label className="mt-3 block text-xs font-medium text-black/50">
              Content
              <textarea value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value })} rows={12} className="mt-1 w-full rounded-md border border-black/10 p-3 font-mono text-[13px] leading-relaxed outline-none focus:border-[var(--teal)]" />
            </label>
            {message?.kind === "error" && <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{message.text}</p>}
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="h-10 rounded-md px-4 text-sm text-black/60 hover:bg-black/5">
                Cancel
              </button>
              <button type="button" disabled={!!busy} onClick={saveEntry} className="flex h-10 items-center gap-1.5 rounded-md bg-[var(--ink)] px-5 text-sm font-medium text-white disabled:opacity-50">
                {busy === "save" && <Loader2 className="h-4 w-4 animate-spin" />} Save and index
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
