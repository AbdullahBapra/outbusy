import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand } from "@/content/brand";
import { canOptimizeImage, coverFor, formatPostDate, postToc } from "@/lib/blog/format";
import { getPost, getPosts } from "@/lib/blog/queries";
import { ArrowCircleIcon } from "@/components/icons";
import { WaveCanvas } from "@/components/WaveCanvas";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { AutomationVisual } from "@/components/sections/inner/AutomationVisual";
import { ReadingProgress } from "@/components/blog/ReadingProgress";
import { ArticleActionsRail, ArticleSidebar } from "@/components/blog/ArticleSidebar";
import { ArticleBody } from "@/components/blog/ArticleBody";
import { PostCard } from "@/components/blog/PostCard";
import { CtaBanner } from "@/components/sections/CtaBanner";
import mark from "@/public/images/outbusy-mark.png";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const found = await getPost(slug);
  const post = found?.post;
  return post
    ? {
        title: post.title,
        description: post.excerpt,
        openGraph: {
          type: "article",
          title: post.title,
          description: post.excerpt,
          publishedTime: post.date,
          ...(post.cover ? { images: [{ url: post.cover.url, alt: post.cover.alt }] } : {}),
        },
      }
    : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const found = await getPost(slug);
  if (!found) notFound();

  const { post, index, all: posts } = found;
  const toc = postToc(post.body);
  const prev = posts[(index - 1 + posts.length) % posts.length];
  const next = posts[(index + 1) % posts.length];
  const related = [...posts.slice(index + 1), ...posts.slice(0, index)].slice(0, 3);
  const summaryPrompt = `Read this article from ${brand.name}: ${brand.siteUrl}/blog/${post.slug} ("${post.title}"). Summarize it in 5 key points, then suggest how the ideas could apply to a business like mine.`;
  const meta = [
    { label: "Written by", value: post.author.name },
    { label: "Published", value: formatPostDate(post.date) },
    { label: "Reading time", value: `${post.readTime} read` },
    { label: "Topic", value: post.tag },
  ];

  return (
    <>
      <ReadingProgress targetId="article" />

      {/* ---------- Hero: the site's dark wave card, sized for a headline ---------- */}
      <section className="bg-white pt-[10rem] max-md:pt-[6rem]">
        <div className="container-x">
          <div className="relative isolate overflow-hidden rounded-[1.875rem] bg-[#040404]">
            <WaveCanvas className="absolute inset-0 -z-10 h-full w-full" />
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_15%_25%,rgba(4,4,4,0.92),rgba(4,4,4,0.35)_65%)]" />

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] items-center gap-[4rem] px-[3.6rem] pb-[3.6rem] pt-[4.4rem] max-lg:grid-cols-1 max-lg:gap-[3rem] max-md:gap-7 max-md:px-5 max-md:pb-5 max-md:pt-8">
              <div>
                <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.tag }]} />
                <h1 className="text-balance text-[4.4rem] font-semibold uppercase leading-[1.04] tracking-[-0.01em] text-white max-lg:text-[4.8rem] max-md:text-[28px] max-md:leading-[1.1]">
                  {post.title}
                </h1>
                {post.excerpt && (
                  <p className="mt-[1.8rem] max-w-[52rem] text-[1.45rem] font-light leading-[1.6] text-white/70 max-lg:text-[1.7rem] max-md:text-[15px]">
                    {post.excerpt}
                  </p>
                )}
              </div>

              <div
                className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] ring-1 ring-white/10 max-lg:aspect-[16/9] max-md:rounded-2xl"
                style={post.cover ? undefined : { background: coverFor(post) }}
              >
                {post.cover ? (
                  <Image
                    src={post.cover.url}
                    alt={post.cover.alt}
                    fill
                    priority
                    unoptimized={!canOptimizeImage(post.cover.url)}
                    sizes="(max-width: 1024px) 100vw, 46vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-[8%]">
                    <AutomationVisual labels={post.flow} className="h-full w-full" />
                  </div>
                )}
              </div>
            </div>

            {/* Meta strip: echoes the stats strip of the other page heroes */}
            <div className="mx-[3.6rem] h-px bg-[linear-gradient(90deg,#0a0a0a,rgba(255,255,255,0.55)_40%,rgba(255,255,255,0.55)_60%,#0a0a0a)] max-md:mx-5" />
            <dl className="grid grid-cols-4 px-[3.6rem] py-[2.4rem] max-md:grid-cols-2 max-md:gap-y-5 max-md:px-5 max-md:py-6">
              {meta.map((m, i) => (
                <div key={m.label} className={i > 0 ? "border-l border-white/10 pl-[2.4rem] max-md:pl-4 max-md:[&:nth-child(3)]:border-l-0 max-md:[&:nth-child(3)]:pl-0" : ""}>
                  <dt className="text-[1rem] uppercase tracking-[0.15em] text-white/45 max-md:text-[10px]">{m.label}</dt>
                  <dd className="mt-[0.5rem] flex items-center gap-[0.6rem] text-[1.4rem] font-medium text-white max-md:text-[14px]">
                    {i === 0 && (
                      <span className="flex h-[2.4rem] w-[2.4rem] flex-none items-center justify-center rounded-full bg-white p-[0.4rem] max-md:h-6 max-md:w-6 max-md:p-1">
                        <Image src={mark} alt="" className="h-full w-full object-contain" />
                      </span>
                    )}
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ---------- Article: contents · reading column · share ---------- */}
      <section className="bg-white pb-[7rem] pt-[6rem] max-md:pb-12 max-md:pt-8">
        <div className="container-x grid gap-[4rem] max-md:gap-8 lg:grid-cols-[19rem_minmax(0,1fr)] xl:grid-cols-[19rem_minmax(0,720px)_19rem] xl:justify-between">
          <ArticleSidebar toc={toc} title={post.title} summaryPrompt={summaryPrompt} />

          <article id="article" className="min-w-0 max-w-[720px] max-lg:mx-auto max-lg:w-full">
            {post.takeaways.length > 0 && (
              <div className="mb-12 rounded-[1.875rem] border-[0.8px] border-black/15 p-7 max-md:rounded-2xl max-md:p-5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
                  <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" /> Key takeaways
                </div>
                <ol className="mt-5 space-y-4">
                  {post.takeaways.map((t, n) => (
                    <li key={t} className="flex items-start gap-4 text-[16px] leading-[1.6] text-[#2f3436]">
                      <span aria-hidden="true" className="mt-[2px] w-6 flex-none text-[13px] font-semibold tabular-nums text-[var(--teal)]">
                        {String(n + 1).padStart(2, "0")}
                      </span>
                      {t}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <ArticleBody blocks={post.body} />

            {/* Author */}
            <div className="mt-14 flex items-center gap-4 rounded-[1.875rem] bg-[var(--mint-50)] p-6 max-md:rounded-2xl max-md:p-5">
              <span className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-white p-3 ring-1 ring-black/5">
                <Image src={mark} alt="" className="h-full w-full object-contain" />
              </span>
              <div className="min-w-0">
                <div className="text-[11px] uppercase tracking-[0.16em] text-black/45">Written by</div>
                <div className="mt-0.5 text-[17px] font-semibold text-[var(--ink)]">{post.author.name}</div>
                <p className="text-[14px] leading-[1.5] text-black/55">
                  {post.author.role} at {brand.name}. Lessons from real client builds, written for busy owners.
                </p>
              </div>
            </div>

            {/* Previous / next */}
            <nav aria-label="More articles" className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { p: prev, label: "Previous article", end: false },
                { p: next, label: "Next article", end: true },
              ].map(({ p, label, end }) => (
                <Link
                  key={label}
                  href={`/blog/${p.slug}`}
                  className={`group flex flex-col gap-3 rounded-[1.875rem] border-[0.8px] border-black/15 p-6 transition-[border-color,box-shadow] duration-300 hover:border-black/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] max-md:rounded-2xl max-md:p-5 ${end ? "sm:items-end sm:text-right" : ""}`}
                >
                  <span className={`flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-black/45 ${end ? "sm:flex-row-reverse" : ""}`}>
                    <ArrowCircleIcon
                      className={`h-7 w-7 transition-transform duration-300 ${end ? "group-hover:-rotate-[40deg]" : "rotate-180 group-hover:rotate-[140deg]"}`}
                      circle="#00efd4"
                      arrow="#ffffff"
                    />
                    {label}
                  </span>
                  <span className="text-[16px] font-semibold uppercase leading-[1.35] text-[var(--ink)] transition-colors group-hover:text-[var(--teal)]">
                    {p.title}
                  </span>
                </Link>
              ))}
            </nav>
          </article>

          <ArticleActionsRail title={post.title} summaryPrompt={summaryPrompt} />
        </div>
      </section>

      {/* ---------- Keep reading ---------- */}
      <section className="sec-green bg-[#fafbfb]">
        <div className="container-x">
          <div className="flex items-end justify-between gap-6 max-md:flex-col max-md:items-start">
            <SectionHeading top="Keep" big="Reading" />
            <PillButton href="/blog">All articles</PillButton>
          </div>
          <div className="mt-[3rem] grid grid-cols-3 gap-[2.4rem] max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-4">
            {related.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
