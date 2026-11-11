import type { Metadata } from "next";
import { templates } from "@/content/pages";
import { getPosts } from "@/lib/blog/queries";
import { BlogGrid } from "@/components/blog/BlogGrid";
import { FeaturedPosts } from "@/components/blog/FeaturedPosts";
import { PageHero } from "@/components/PageHero";
import { CtaBanner } from "@/components/sections/CtaBanner";
import { PillButton } from "@/components/ui/pill-button";
import { SectionHeading } from "@/components/ui/section-heading";

export const metadata: Metadata = {
  title: "Blog",
  description: "Practical guides on AI automation, n8n, voice agents, chatbots and speed-to-lead.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <PageHero
        bigLine="Blog"
        subStrong="Practical guides"
        subLight="on AI and automation"
        paragraphs={["No hype — just what works, what doesn't, and how to roll it out in a real business."]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Blog" }]}
      />

      {lead && (
        <section className="bg-white pt-[7.5rem] max-md:pt-12">
          <div className="container-x">
            <SectionHeading top="Fresh" big="Latest" />
            <div className="mt-[3rem] max-md:mt-6">
              <FeaturedPosts lead={lead} more={rest.slice(0, 3)} />
            </div>
          </div>
        </section>
      )}

      <section className="sec-blue bg-white">
        <div className="container-x">
          <SectionHeading top="All" big="Articles" />
          <BlogGrid posts={posts} />

          {/* Free templates band */}
          <div className="relative isolate mt-[5rem] flex items-center justify-between gap-[3rem] overflow-hidden rounded-[1.875rem] bg-[#040404] px-[3.6rem] py-[3.2rem] text-white max-lg:flex-col max-lg:items-start max-md:mt-10 max-md:rounded-[1.4rem] max-md:px-5 max-md:py-7">
            <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:linear-gradient(90deg,transparent,#000)]" />
            <div className="max-w-[60rem]">
              <div className="text-[1rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)] max-md:text-[11px]">Free resource</div>
              <h2 className="mt-[0.8rem] text-[3rem] font-semibold uppercase leading-[1.08] max-lg:text-[3.4rem] max-md:text-[22px]">Steal our n8n workflows</h2>
              <p className="mt-[0.8rem] text-[1.3rem] font-light leading-[1.6] text-white/65 max-lg:text-[1.6rem] max-md:text-[14px]">
                {templates.length} ready-to-import templates we use in real client builds. Plug in your keys and go.
              </p>
            </div>
            <PillButton href="/free-n8n-templates" variant="white">
              Get the templates
            </PillButton>
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
