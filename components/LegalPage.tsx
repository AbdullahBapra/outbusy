import { notFound } from "next/navigation";
import { getLegalDoc } from "@/content/legal";
import { PageHero } from "@/components/PageHero";

export function LegalPage({ slug }: { slug: string }) {
  const doc = getLegalDoc(slug);
  if (!doc) notFound();
  return (
    <>
      <PageHero
        bigLine="Legal"
        subStrong={doc.title}
        paragraphs={[`Last updated: ${doc.updated}`]}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: doc.title }]}
      />
      <article className="sec-green bg-white">
        <div className="container-x prose-page max-w-[80rem]">
          {doc.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.body.length > 1 ? (
                <ul>
                  {s.body.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              ) : (
                <p>{s.body[0]}</p>
              )}
            </section>
          ))}
        </div>
      </article>
    </>
  );
}
