import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, Eye, FileText, PenLine, Plus, Sparkles } from "lucide-react";
import { requireAdmin } from "@/lib/admin-auth";
import { BlogError, listPostRowsPage, type PostListRow } from "@/lib/blog/service";
import { Pager, pageParam } from "@/components/admin/Pager";
import { isAdminWriteConfigured } from "@/lib/supabase";
import { canOptimizeImage, coverFor, formatPostDate } from "@/lib/blog/format";
import { DeletePostButton, ImportStarterButton, PublishToggle } from "@/components/admin/PostRowActions";
import { SetupGuide } from "@/components/admin/SetupGuide";

export const metadata = { title: "Posts" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

const PAGE_SIZE = 15;

export default async function AdminDashboard({ searchParams }: Props) {
  await requireAdmin();
  if (!isAdminWriteConfigured()) return <SetupGuide />;
  const params = await searchParams;

  const page = pageParam(params.page);
  let rows: PostListRow[] = [];
  let total = 0;
  let published = 0;
  let error: string | null = null;
  try {
    ({ rows, total, published } = await listPostRowsPage(page, PAGE_SIZE));
  } catch (err) {
    if (!(err instanceof BlogError)) throw err;
    error = err.message;
  }

  const notice = params.deleted ? "Post deleted." : params.imported ? "Example posts imported and published." : null;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blog posts</h1>
          <p className="mt-1 text-sm text-black/55">Write, schedule and publish articles for the Outbusy blog.</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex h-11 items-center gap-2 rounded-md bg-[var(--teal)] px-5 text-sm font-semibold uppercase tracking-wide text-white shadow-[0_8px_20px_rgba(0,137,122,0.25)] transition hover:bg-[#006e62]"
        >
          <Plus className="h-4 w-4" /> New post
        </Link>
      </div>

      {notice && (
        <p className="mt-6 flex items-center gap-2 rounded-lg bg-[var(--mint-100)] px-4 py-3 text-sm text-[var(--teal)]">
          <CheckCircle2 className="h-4 w-4" /> {notice}
        </p>
      )}

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <p className="font-semibold">Couldn&apos;t load posts from Supabase.</p>
          <p className="mt-1">{error}</p>
          <p className="mt-2 text-red-700/80">
            If the table doesn&apos;t exist yet, run <code className="rounded bg-red-100 px-1">supabase/schema.sql</code> in the Supabase SQL editor.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { label: "Total", value: total, icon: FileText },
          { label: "Published", value: published, icon: Eye },
          { label: "Drafts", value: total - published, icon: PenLine },
        ].map((s) => (
          <div key={s.label} className="rounded-lg border border-black/[0.07] bg-white p-4 sm:p-5">
            <s.icon className="h-5 w-5 text-[var(--teal)]" />
            <div className="mt-3 text-2xl font-bold">{s.value}</div>
            <div className="text-xs uppercase tracking-[0.15em] text-black/45">{s.label}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {total === 0 && !error ? (
        <div className="mt-8 rounded-xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-[var(--teal)]" />
          <h2 className="mt-4 text-xl font-bold">No posts yet</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-black/55">
            Write your first article, or import the five example guides that currently show on the site so you can edit them here.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/admin/posts/new" className="flex h-11 items-center gap-2 rounded-md bg-[var(--teal)] px-5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#006e62]">
              <Plus className="h-4 w-4" /> Write a post
            </Link>
            <ImportStarterButton />
          </div>
        </div>
      ) : rows.length === 0 ? null : (
        <ul className="mt-8 divide-y divide-black/[0.06] overflow-hidden rounded-xl border border-black/[0.07] bg-white">
          {rows.map((r) => (
            <li key={r.id} className="flex items-center gap-4 p-4 transition hover:bg-[var(--mint-50)]/60 sm:gap-5 sm:p-5">
              <Link href={`/admin/posts/${r.id}`} className="relative h-16 w-24 flex-none overflow-hidden rounded-lg sm:h-20 sm:w-32" style={{ background: coverFor(r) }}>
                {r.cover_url && <Image src={r.cover_url} alt="" fill unoptimized={!canOptimizeImage(r.cover_url)} sizes="128px" className="object-cover" />}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-black/[0.05] px-2 py-0.5 font-medium uppercase tracking-wide text-black/60">{r.tag}</span>
                  {r.published ? (
                    <span className="rounded-md bg-[var(--mint-100)] px-2 py-0.5 font-semibold uppercase tracking-wide text-[var(--teal)]">
                      {r.published_at && new Date(r.published_at) > new Date() ? "Scheduled" : "Published"}
                    </span>
                  ) : (
                    <span className="rounded-md bg-amber-100 px-2 py-0.5 font-semibold uppercase tracking-wide text-amber-800">Draft</span>
                  )}
                  <span className="text-black/40">
                    {r.published_at ? formatPostDate(r.published_at) : `Edited ${formatPostDate(r.updated_at)}`}
                  </span>
                </div>
                <Link href={`/admin/posts/${r.id}`} className="mt-1 block truncate text-base font-semibold hover:text-[var(--teal)] sm:text-lg">
                  {r.title}
                </Link>
                <p className="truncate text-sm text-black/50 max-sm:hidden">{r.excerpt || "No excerpt yet"}</p>
              </div>
              <div className="flex flex-none items-center gap-1">
                <PublishToggle id={r.id} published={r.published} />
                {r.published && (
                  <Link href={`/blog/${r.slug}`} target="_blank" aria-label="View on site" className="flex h-9 w-9 items-center justify-center rounded-md text-black/50 transition hover:bg-black/5 hover:text-black max-sm:hidden">
                    <Eye className="h-4 w-4" />
                  </Link>
                )}
                <Link href={`/admin/posts/${r.id}`} aria-label="Edit" className="flex h-9 w-9 items-center justify-center rounded-md text-black/50 transition hover:bg-black/5 hover:text-black">
                  <PenLine className="h-4 w-4" />
                </Link>
                <DeletePostButton id={r.id} title={r.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pager page={page} pageSize={PAGE_SIZE} total={total} noun="posts" href={(p) => (p > 1 ? `/admin/posts?page=${p}` : "/admin/posts")} />
    </div>
  );
}
