"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bold,
  CheckCircle2,
  ExternalLink,
  Heading2,
  ImagePlus,
  Italic,
  Lightbulb,
  Link2,
  List,
  Loader2,
  Quote,
  UploadCloud,
  X,
} from "lucide-react";
import { api, ApiClientError } from "@/lib/api/client";
import type { PostCreateInput } from "@/lib/blog/schema";
import type { PostRow } from "@/lib/blog/types";
import { parseMarkdown, readTimeFor, slugify } from "@/lib/markdown";
import { uploadBlogImage } from "@/lib/upload-image";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { canOptimizeImage } from "@/lib/blog/format";
import { DeletePostButton } from "@/components/admin/PostRowActions";
import { cn } from "@/lib/utils";

const card = "rounded-xl border border-black/[0.07] bg-white p-5";
const label = "text-xs font-semibold uppercase tracking-[0.15em] text-black/50";
const input =
  "mt-2 w-full rounded-lg border border-black/15 bg-white px-3.5 py-2.5 text-[15px] outline-none transition placeholder:text-black/30 focus:border-[var(--teal)] focus:ring-4 focus:ring-[var(--accent)]/20";

const altFromFile = (name: string) =>
  name
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

type SaveState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const list = (value: string, sep: RegExp) =>
  value
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);

/** Editor form → the JSON body the API accepts (full replace: empty fields are sent as null). */
function formToInput(fd: FormData): PostCreateInput {
  const coverUrl = str(fd, "cover_url");
  return {
    title: str(fd, "title"),
    slug: str(fd, "slug") || undefined,
    tag: str(fd, "tag"),
    excerpt: str(fd, "excerpt"),
    content: str(fd, "content"),
    readTime: str(fd, "read_time") || null,
    cover: coverUrl ? { url: coverUrl, alt: str(fd, "cover_alt") } : null,
    author: { name: str(fd, "author_name") || null, role: str(fd, "author_role") || null },
    takeaways: list(str(fd, "takeaways"), /\n/),
    flow: list(str(fd, "flow"), /,/),
    published: fd.get("published") === "on",
    publishedAt: str(fd, "published_at") || null,
  };
}

export function PostEditor({ post, tags, justCreated = false }: { post?: PostRow; tags: string[]; justCreated?: boolean }) {
  const router = useRouter();
  const [state, setState] = useState<SaveState>({});
  const [pending, setPending] = useState(false);

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post));
  const [content, setContent] = useState(post?.content ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [published, setPublished] = useState(post?.published ?? false);
  const [coverUrl, setCoverUrl] = useState(post?.cover_url ?? "");
  const [coverAlt, setCoverAlt] = useState(post?.cover_alt ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [busy, setBusy] = useState<null | "cover" | "inline">(null);
  const [uploadError, setUploadError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [dragging, setDragging] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const inlineFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const blocks = useMemo(() => (tab === "preview" ? parseMarkdown(content) : []), [tab, content]);
  const autoReadTime = useMemo(() => readTimeFor(content), [content]);

  // Create → POST /api/posts, then open the new post. Edit → PATCH /api/posts/:id.
  const save = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!formRef.current || pending) return;
    setPending(true);
    setState({});
    const input = formToInput(new FormData(formRef.current));
    try {
      if (post) {
        await api.posts.update(post.id, input);
        setState({ ok: true });
        setDirty(false);
        router.refresh();
      } else {
        const created = await api.posts.create(input);
        setDirty(false);
        router.replace(`/admin/posts/${created.id}?created=1`);
      }
    } catch (err) {
      if (err instanceof ApiClientError) setState({ error: err.details[0]?.message ?? err.message, fieldErrors: err.fieldErrors });
      else setState({ error: "Couldn't save. Please try again." });
    } finally {
      setPending(false);
    }
  };

  // Ctrl/Cmd + S saves; warn before leaving with unsaved changes.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", onUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [dirty]);

  // ---------- Markdown helpers ----------
  const edit = (next: string, selStart: number, selEnd = selStart) => {
    setContent(next);
    setDirty(true);
    requestAnimationFrame(() => {
      const t = textRef.current;
      if (!t) return;
      t.focus();
      t.setSelectionRange(selStart, selEnd);
    });
  };

  /** Wrap the selection, e.g. **bold**. */
  const wrap = (before: string, after = before, placeholder = "text") => {
    const t = textRef.current;
    if (!t) return;
    const { selectionStart: a, selectionEnd: b } = t;
    const sel = content.slice(a, b) || placeholder;
    edit(content.slice(0, a) + before + sel + after + content.slice(b), a + before.length, a + before.length + sel.length);
  };

  /** Insert a block on its own paragraph at the cursor. */
  const insertBlock = (block: string, selectFrom?: number, selectLen = 0) => {
    const t = textRef.current;
    const at = t ? t.selectionEnd : content.length;
    const before = content.slice(0, at).replace(/\s*$/, "");
    const after = content.slice(at).replace(/^\s*/, "");
    const lead = before ? "\n\n" : "";
    const next = before + lead + block + (after ? "\n\n" + after : "\n");
    const start = before.length + lead.length + (selectFrom ?? block.length);
    edit(next, start, start + selectLen);
  };

  /** Prefix every selected line (lists / quotes). */
  const prefixLines = (prefix: string, placeholder: string) => {
    const t = textRef.current;
    if (!t) return;
    const { selectionStart: a, selectionEnd: b } = t;
    const sel = content.slice(a, b);
    if (!sel) return insertBlock(prefix + placeholder, prefix.length, placeholder.length);
    const out = sel
      .split("\n")
      .map((l) => (l.trim() ? prefix + l.replace(/^([-*]|>)\s*/, "") : l))
      .join("\n");
    edit(content.slice(0, a) + out + content.slice(b), a, a + out.length);
  };

  // ---------- Uploads ----------
  const uploadInline = async (file: File) => {
    setBusy("inline");
    setUploadError("");
    try {
      const url = await uploadBlogImage(file);
      const alt = altFromFile(file.name);
      insertBlock(`![${alt}](${url})`, 2, alt.length);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  };

  const uploadCover = async (file: File) => {
    setBusy("cover");
    setUploadError("");
    try {
      setCoverUrl(await uploadBlogImage(file));
      if (!coverAlt) setCoverAlt(altFromFile(file.name));
      setDirty(true);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(null);
    }
  };

  const firstImage = (files: FileList | null | undefined) => Array.from(files ?? []).find((f) => f.type.startsWith("image/"));

  const tools = [
    { icon: Heading2, label: "Heading", run: () => insertBlock("## Section heading", 3, 15) },
    { icon: Bold, label: "Bold", run: () => wrap("**") },
    { icon: Italic, label: "Italic", run: () => wrap("*") },
    { icon: Link2, label: "Link", run: () => wrap("[", "](https://)", "link text") },
    { icon: List, label: "List", run: () => prefixLines("- ", "List item") },
    { icon: Quote, label: "Pull quote", run: () => prefixLines("> ", "A memorable line from the article") },
    { icon: Lightbulb, label: "Tip box", run: () => insertBlock("> [!TIP] Tip title\n> Helpful advice for the reader.", 9, 9) },
    { icon: ImagePlus, label: "Image", run: () => inlineFileRef.current?.click() },
  ];

  const err: Record<string, string | undefined> = state.fieldErrors ?? {};

  return (
    <form ref={formRef} onSubmit={save} onChange={() => setDirty(true)} noValidate className="pb-24">
      <input type="hidden" name="id" value={post?.id ?? ""} />
      <input type="hidden" name="slug" value={effectiveSlug} />
      <input type="hidden" name="cover_url" value={coverUrl} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/admin/posts" className="flex items-center gap-1.5 text-sm text-black/55 transition hover:text-black">
          <ArrowLeft className="h-4 w-4" /> All posts
        </Link>
        <div className="flex items-center gap-3 text-sm">
          {(state.ok || justCreated) && !dirty && (
            <span className="flex items-center gap-1.5 text-[var(--teal)]">
              <CheckCircle2 className="h-4 w-4" /> Saved
            </span>
          )}
          {dirty && <span className="text-black/45">Unsaved changes</span>}
        </div>
      </div>

      {state.error && (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {uploadError && (
        <p role="alert" className="mt-4 flex items-center justify-between rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {uploadError}
          <button type="button" aria-label="Dismiss" onClick={() => setUploadError("")}>
            <X className="h-4 w-4" />
          </button>
        </p>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        {/* ---------- Main column ---------- */}
        <div className="space-y-6">
          <div className={card}>
            <textarea
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              rows={2}
              className={cn(
                "w-full resize-none bg-transparent text-3xl font-bold uppercase leading-tight tracking-tight outline-none placeholder:text-black/20 sm:text-4xl",
                err.title && "placeholder:text-red-300",
              )}
            />
            {err.title && <p className="text-sm text-red-600">{err.title}</p>}

            <div className="mt-3 flex items-center gap-1 rounded-lg bg-black/[0.03] px-3 py-2 text-sm">
              <span className="flex-none text-black/40">/blog/</span>
              <input
                aria-label="URL slug"
                value={effectiveSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(slugify(e.target.value));
                }}
                placeholder="url-slug"
                className="min-w-0 flex-1 bg-transparent font-medium outline-none"
              />
            </div>
            {err.slug && <p className="mt-1 text-sm text-red-600">{err.slug}</p>}

            <label className="mt-5 block">
              <span className="flex items-center justify-between">
                <span className={label}>Excerpt</span>
                <span className={cn("text-xs", excerpt.length > 180 ? "text-amber-600" : "text-black/35")}>{excerpt.length}/160</span>
              </span>
              <textarea
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
                placeholder="One or two sentences shown on cards, in search results and under the title."
                className={cn(input, "resize-y")}
              />
            </label>
          </div>

          {/* Content */}
          <div className={cn(card, "p-0")}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.07] px-3 py-2">
              <div className="flex flex-wrap items-center gap-0.5">
                {tools.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    title={t.label}
                    aria-label={t.label}
                    disabled={tab === "preview" || busy === "inline"}
                    onClick={t.run}
                    className="flex h-9 w-9 items-center justify-center rounded-md text-black/60 transition hover:bg-[var(--mint-50)] hover:text-[var(--teal)] disabled:opacity-35"
                  >
                    {t.label === "Image" && busy === "inline" ? <Loader2 className="h-4 w-4 animate-spin" /> : <t.icon className="h-4 w-4" />}
                  </button>
                ))}
              </div>
              <div className="flex rounded-md bg-black/[0.05] p-1 text-xs font-semibold uppercase tracking-wide">
                {(["write", "preview"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTab(t)}
                    className={cn("rounded-md px-3.5 py-1.5 transition", tab === t ? "bg-white text-black shadow-sm" : "text-black/50 hover:text-black")}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              ref={textRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onPaste={(e) => {
                const img = firstImage(e.clipboardData.files);
                if (img) {
                  e.preventDefault();
                  uploadInline(img);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const img = firstImage(e.dataTransfer.files);
                if (img) {
                  e.preventDefault();
                  uploadInline(img);
                }
              }}
              placeholder={"Start writing…\n\n## Use headings to split the article into sections\n\nParagraphs are separated by an empty line. Paste or drop images straight in."}
              className={cn(
                "block min-h-[32rem] w-full resize-y bg-transparent px-5 py-4 text-[15px] leading-7 outline-none placeholder:text-black/25",
                tab === "preview" && "hidden",
              )}
            />
            {tab === "preview" && (
              <div className="min-h-[32rem] px-5 py-6 sm:px-8">
                {blocks.length ? (
                  <div className="[zoom:0.82]">
                    <ArticleBody blocks={blocks} />
                  </div>
                ) : (
                  <p className="text-sm text-black/40">Nothing to preview yet.</p>
                )}
              </div>
            )}
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-black/[0.07] px-5 py-3 text-xs text-black/40">
              <span>
                <code>## </code>heading
              </span>
              <span>
                <code>- </code>list
              </span>
              <span>
                <code>&gt; </code>quote
              </span>
              <span>
                <code>&gt; [!TIP] Title</code> tip box
              </span>
              <span>
                <code>**bold**</code> <code>*italic*</code>
              </span>
              <span className="ml-auto">{autoReadTime} read</span>
            </div>
            {err.content && <p className="px-5 pb-3 text-sm text-red-600">{err.content}</p>}
            <input
              ref={inlineFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) uploadInline(f);
              }}
            />
          </div>
        </div>

        {/* ---------- Sidebar ---------- */}
        <div className="space-y-6 lg:sticky lg:top-24">
          {/* Publish */}
          <div className={card}>
            <div className="flex items-center justify-between">
              <span className={label}>Status</span>
              <label className="flex cursor-pointer items-center gap-2.5 text-sm font-medium">
                {published ? "Published" : "Draft"}
                <input type="checkbox" name="published" checked={published} onChange={(e) => setPublished(e.target.checked)} className="peer sr-only" />
                <span
                  aria-hidden="true"
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--accent)]/30",
                    published ? "bg-[var(--teal)]" : "bg-black/15",
                  )}
                >
                  <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-[left]", published ? "left-[1.375rem]" : "left-0.5")} />
                </span>
              </label>
            </div>
            <label className="mt-4 block">
              <span className={label}>Publish date</span>
              <input type="date" name="published_at" defaultValue={post?.published_at?.slice(0, 10) ?? ""} className={input} />
              <span className="mt-1 block text-xs text-black/40">Leave empty to use today. A future date schedules the post.</span>
            </label>
            <button
              type="submit"
              disabled={pending || busy !== null}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[var(--teal)] text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(0,137,122,0.25)] transition hover:bg-[#006e62] disabled:opacity-60"
            >
              {pending && <Loader2 className="h-4 w-4 animate-spin" />}
              {post ? "Save changes" : published ? "Publish" : "Save draft"}
            </button>
            <div className="mt-2 flex items-center justify-between">
              {post?.published ? (
                <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm text-black/55 transition hover:text-[var(--teal)]">
                  <ExternalLink className="h-4 w-4" /> View post
                </Link>
              ) : (
                <span className="text-xs text-black/35">Ctrl + S to save</span>
              )}
              {post && <DeletePostButton id={post.id} title={post.title} label="Delete" />}
            </div>
          </div>

          {/* Cover */}
          <div className={card}>
            <span className={label}>Cover image</span>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                const img = firstImage(e.dataTransfer.files);
                if (img) uploadCover(img);
              }}
              className={cn(
                "relative mt-2 aspect-[16/10] overflow-hidden rounded-lg border-2 border-dashed transition",
                dragging ? "border-[var(--teal)] bg-[var(--mint-50)]" : coverUrl ? "border-transparent" : "border-black/15 bg-black/[0.02]",
              )}
            >
              {coverUrl ? (
                <>
                  <Image src={coverUrl} alt={coverAlt} fill unoptimized={!canOptimizeImage(coverUrl)} sizes="352px" className="object-cover" />
                  <div className="absolute inset-x-2 bottom-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileRef.current?.click()}
                      className="flex-1 rounded-md bg-white/90 py-1.5 text-xs font-semibold uppercase tracking-wide backdrop-blur transition hover:bg-white"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      aria-label="Remove cover"
                      onClick={() => {
                        setCoverUrl("");
                        setDirty(true);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-white/90 backdrop-blur transition hover:bg-white hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <button type="button" onClick={() => coverFileRef.current?.click()} className="flex h-full w-full flex-col items-center justify-center gap-2 text-center text-sm text-black/50">
                  <UploadCloud className="h-7 w-7 text-[var(--teal)]" />
                  <span>
                    <span className="font-semibold text-[var(--teal)]">Upload</span> or drag an image
                  </span>
                  <span className="text-xs text-black/35">Wide photos work best · 1600 × 900+</span>
                </button>
              )}
              {busy === "cover" && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--teal)]" />
                </div>
              )}
            </div>
            <input
              ref={coverFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) uploadCover(f);
              }}
            />
            <label className="mt-3 block">
              <span className="text-xs text-black/50">Alt text (describe the image)</span>
              <input name="cover_alt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} className={cn(input, "mt-1")} />
            </label>
          </div>

          {/* Details */}
          <div className={cn(card, "space-y-4")}>
            <label className="block">
              <span className={label}>Category</span>
              <input name="tag" list="post-tags" defaultValue={post?.tag ?? ""} placeholder="e.g. Voice AI" className={cn(input, err.tag && "border-red-400")} />
              <datalist id="post-tags">
                {tags.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
              {err.tag && <span className="mt-1 block text-sm text-red-600">{err.tag}</span>}
            </label>
            <label className="block">
              <span className={label}>Read time</span>
              <input name="read_time" defaultValue={post?.read_time ?? ""} placeholder={`Auto · ${autoReadTime}`} className={input} />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className={label}>Author</span>
                <input name="author_name" defaultValue={post?.author_name ?? ""} placeholder="Outbusy Team" className={input} />
              </label>
              <label className="block">
                <span className={label}>Role</span>
                <input name="author_role" defaultValue={post?.author_role ?? ""} placeholder="Engineer" className={input} />
              </label>
            </div>
          </div>

          {/* Takeaways */}
          <div className={card}>
            <label className="block">
              <span className={label}>Key takeaways</span>
              <textarea
                name="takeaways"
                rows={4}
                defaultValue={(post?.takeaways ?? []).join("\n")}
                placeholder={"One per line (up to 3 look best)"}
                className={cn(input, "resize-y")}
              />
            </label>
            <label className="mt-4 block">
              <span className={label}>Fallback cover labels</span>
              <input name="flow" defaultValue={(post?.flow ?? []).join(", ")} placeholder="New Lead, AI Agent, CRM" className={input} />
              <span className="mt-1 block text-xs text-black/40">Shown as an animated workflow when there&apos;s no cover image.</span>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
