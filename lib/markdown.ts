import type { PostBlock } from "@/content/pages";

/**
 * The small Markdown dialect used by the admin editor.
 *
 *   ## Section heading
 *   - list item
 *   > A pull quote
 *   > [!TIP] Tip title
 *   > Tip text
 *   ![Alt text](https://image.url "Optional caption")
 *
 * Paragraphs are separated by blank lines. Inside text: **bold**, *italic*, [link](url).
 */
export function parseMarkdown(src: string): PostBlock[] {
  const blocks: PostBlock[] = [];
  const chunks = src.replace(/\r\n?/g, "\n").split(/\n\s*\n/);

  for (const raw of chunks) {
    const chunk = raw.trim();
    if (!chunk) continue;
    const lines = chunk.split("\n").map((l) => l.trim());

    const img = chunk.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/);
    if (img) {
      blocks.push({ type: "image", alt: img[1], url: img[2], ...(img[3] ? { caption: img[3] } : {}) });
      continue;
    }
    if (lines[0].startsWith("## ")) {
      blocks.push({ type: "h2", text: lines[0].slice(3).trim() });
      // Anything typed straight under a heading becomes its own paragraph.
      const rest = lines.slice(1).join(" ").trim();
      if (rest) blocks.push({ type: "p", text: rest });
      continue;
    }
    if (lines.every((l) => /^[-*]\s+/.test(l))) {
      blocks.push({ type: "list", items: lines.map((l) => l.replace(/^[-*]\s+/, "")) });
      continue;
    }
    if (lines.every((l) => l.startsWith(">"))) {
      const text = lines.map((l) => l.replace(/^>\s?/, ""));
      const tip = text[0].match(/^\[!TIP\]\s*(.*)$/i);
      if (tip) blocks.push({ type: "tip", title: tip[1] || "Tip", text: text.slice(1).join(" ").trim() });
      else blocks.push({ type: "quote", text: text.join(" ").trim() });
      continue;
    }
    blocks.push({ type: "p", text: lines.join(" ") });
  }
  return blocks;
}

/** Inverse of parseMarkdown — used to import the built-in posts into the database. */
export function toMarkdown(blocks: PostBlock[]): string {
  return blocks
    .map((b) => {
      switch (b.type) {
        case "h2":
          return `## ${b.text}`;
        case "p":
          return b.text;
        case "list":
          return b.items.map((i) => `- ${i}`).join("\n");
        case "quote":
          return `> ${b.text}`;
        case "tip":
          return `> [!TIP] ${b.title}\n> ${b.text}`;
        case "image":
          return `![${b.alt}](${b.url}${b.caption ? ` "${b.caption}"` : ""})`;
      }
    })
    .join("\n\n");
}

export type InlineToken =
  | { kind: "text"; text: string }
  | { kind: "bold"; text: string }
  | { kind: "italic"; text: string }
  | { kind: "link"; text: string; href: string };

/** Splits a line into plain text, **bold**, *italic* and [link](url) runs. */
export function tokenizeInline(text: string): InlineToken[] {
  const out: InlineToken[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const m of text.matchAll(re)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ kind: "text", text: text.slice(last, i) });
    if (m[1]) out.push({ kind: "bold", text: m[1] });
    else if (m[2]) out.push({ kind: "italic", text: m[2] });
    else out.push({ kind: "link", text: m[3], href: m[4] });
    last = i + m[0].length;
  }
  if (last < text.length) out.push({ kind: "text", text: text.slice(last) });
  return out;
}

/** ~200 words per minute, rounded up, minimum 1. */
export function readTimeFor(markdown: string) {
  const words = markdown.replace(/[#>*\-!\[\]()]/g, " ").split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
