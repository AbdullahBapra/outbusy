import { brand } from "@/content/brand";
import { caseStudies } from "@/content/caseStudies";
import { industries } from "@/content/industries";
import { faqs, posts as starterPosts, pricing, processSteps, type Post, type PostBlock } from "@/content/pages";
import { categories, serviceHref } from "@/content/services";
import { rowToPost } from "@/lib/blog/mappers";
import type { PostRow } from "@/lib/blog/types";
import { POSTS_TABLE, supabaseAdmin } from "@/lib/supabase";
import type { KbDoc } from "@/lib/kb/ingest";

/**
 * Knowledge documents built from the same content files that render the website, so the
 * assistant's answers always match the site. One document per entity keeps retrieval precise
 * and gives every answer a page to link to.
 */
export function siteDocs(): KbDoc[] {
  const docs: KbDoc[] = [];
  const add = (ref: string, title: string, url: string, lines: (string | false | undefined)[]) =>
    docs.push({ type: "site", ref, title, url, body: lines.filter(Boolean).join("\n") });

  add("company", `About ${brand.name}`, "/about", [
    `${brand.name}: ${brand.tagline}.`,
    `Contact: ${brand.email}, ${brand.phone}. Book a free AI audit call: ${brand.ctaHref}.`,
    `Services are grouped into: ${categories.map((c) => c.title).join(", ")}.`,
    `Industries served: ${industries.map((i) => i.name).join(", ")}.`,
    "Free resources: automation audit quiz (/free-audit), ROI calculator (/roi-calculator), free n8n templates (/free-n8n-templates).",
  ]);

  for (const c of categories) {
    add(`category:${c.slug}`, c.title, serviceHref(c), [c.intro, `Services in ${c.title}: ${c.services.map((s) => s.title).join(", ")}.`]);
    for (const s of c.services) {
      add(`service:${s.slug}`, s.title, serviceHref(c, s), [
        `${s.title} (part of ${c.title}). ${s.summary}`,
        s.intro,
        "",
        "## Problems it solves",
        ...s.problems.map((p) => `- ${p}`),
        "",
        "## What's included",
        ...s.deliverables.map((d) => `- ${d.title}: ${d.body}`),
        "",
        `## Tools\n${s.tools.join(", ")}`,
        "",
        "## Outcomes",
        ...s.outcomes.map((o) => `- ${o}`),
        s.faqs.length > 0 && "\n## FAQ",
        ...s.faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`),
      ]);
    }
  }

  add("pricing", "Pricing", "/pricing", [
    "All prices are in EUR and are starting points; the team confirms a fixed quote after the audit.",
    `- ${pricing.audit.title}: ${pricing.audit.price}. ${pricing.audit.note}. Includes: ${pricing.audit.points.join(", ")}.`,
    ...pricing.packages.map((p) => `- ${p.name}: ${p.price}. ${p.desc} Includes: ${p.points.join(", ")}.`),
    ...pricing.care.map((c) => `- Care plan ${c.name}: ${c.price}. Includes: ${c.points.join(", ")}.`),
  ]);

  add("process", "How we work", "/process", processSteps.map((s, i) => `${i + 1}. ${s.title}: ${s.body} (${s.points.join(", ")})`));

  for (const ind of industries) {
    add(`industry:${ind.slug}`, `${ind.name} automation`, `/industries/${ind.slug}`, [
      ind.short,
      ind.headline,
      `## ${ind.problem.title}\n${ind.problem.body}`,
      ...ind.problem.points.map((p) => `- ${p}`),
      "## Typical systems we build",
      ...ind.systems.map((s) => `- ${s.title}: ${s.body}`),
    ]);
  }

  for (const cs of caseStudies) {
    add(`case:${cs.slug}`, cs.title, `/case-studies/${cs.slug}`, [
      cs.sample && "EXAMPLE PROJECT: illustrative, not a real named client. Never present it as a real customer or a guaranteed result.",
      `Industry: ${cs.industry}.`,
      `Problem: ${cs.problem}`,
      "## System built",
      ...cs.system.map((s) => `- ${s.title}: ${s.body}`),
      `## Results${cs.sample ? " (example targets)" : ""}`,
      ...cs.results.map((r) => `- ${r.value} ${r.label}`),
      `Stack: ${cs.stack.join(", ")}.`,
    ]);
  }

  add("faq", "Frequently asked questions", "/faq", faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`));
  return docs;
}

function blocksToText(blocks: PostBlock[]) {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `## ${b.text}`;
        case "p":
        case "quote":
          return b.text;
        case "list":
          return b.items.map((i) => `- ${i}`).join("\n");
        case "tip":
          return `${b.title}: ${b.text}`;
        case "image":
          return b.caption ?? "";
      }
    })
    .filter(Boolean)
    .join("\n\n");
}

export function postDoc(p: Post): KbDoc {
  return {
    type: "blog",
    ref: p.slug,
    title: p.title,
    url: `/blog/${p.slug}`,
    body: [`Blog article (${p.tag}, ${p.date}). ${p.excerpt}`, p.takeaways.length ? `Key takeaways:\n${p.takeaways.map((t) => `- ${t}`).join("\n")}` : "", blocksToText(p.body)]
      .filter(Boolean)
      .join("\n\n"),
  };
}

/** Published blog posts (uncached): the database when it has any, else the built-in posts. */
export async function blogDocs(): Promise<KbDoc[]> {
  const { data, error } = await supabaseAdmin()
    .from(POSTS_TABLE)
    .select("*")
    .eq("published", true)
    .lte("published_at", new Date().toISOString());
  if (error) throw new Error(`Couldn't read blog posts: ${error.message}`);
  const list = data && data.length > 0 ? (data as PostRow[]).map(rowToPost) : starterPosts;
  return list.map(postDoc);
}
