import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BackToTop } from "@/components/BackToTop";
import { KirbyAssistantLazy } from "@/components/assistant/KirbyAssistantLazy";
import { getPosts } from "@/lib/blog/queries";

/** Public site chrome: header, footer and back-to-top. The admin panel has its own layout. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [latest] = await getPosts();
  return (
    <>
      <Navbar latestPost={latest} />
      <main className="relative">{children}</main>
      <Footer />
      <BackToTop />
      <KirbyAssistantLazy />
    </>
  );
}
