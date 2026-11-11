// Indexes the website content and published blog posts into the chatbot's knowledge base.
// Unchanged items are skipped, so it is safe to run on every deploy.
//
//   npx tsx --env-file=.env.local scripts/kb-sync.ts [site|blog|all]
import { syncType } from "@/lib/kb/ingest";
import { blogDocs, siteDocs } from "@/lib/kb/sources";

const scope = (process.argv[2] ?? "all") as "site" | "blog" | "all";

async function main() {
  if (scope !== "blog") console.log("website:", await syncType("site", siteDocs()));
  if (scope !== "site") console.log("blog:", await syncType("blog", await blogDocs()));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
