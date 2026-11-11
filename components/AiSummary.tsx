import { brand } from "@/content/brand";
import { aiAssistants } from "@/lib/aiLinks";

/** The question each assistant receives, pre-filled in its chat box. */
const prompt = `Summarize ${brand.name} (${brand.siteUrl}), an AI automation agency. What services do they offer, which industries do they work with, how do their process and pricing work, and why would a business choose them? Use ${brand.siteUrl} as your main source.`;

const assistants = aiAssistants.map((a) => ({ name: a.name, href: a.url(prompt), logo: a.logo }));

/**
 * "Explore AI summary": opens each AI assistant with a ready-made prompt about the agency,
 * so visitors get an independent summary (and AI tools see the site referenced).
 */
export function AiSummary() {
  return (
    <div>
      <div className="flex items-center gap-[1rem]">
        <span className="flex-none text-[1rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)] max-md:text-xs">Explore AI summary</span>
        <span aria-hidden="true" className="h-px flex-1 bg-white/15" />
      </div>
      <ul className="mt-[1.2rem] grid grid-cols-3 gap-[0.8rem] max-md:gap-2">
        {assistants.map((a) => (
          <li key={a.name}>
            <a
              href={a.href}
              target="_blank"
              rel="noopener noreferrer"
              title={`Ask ${a.name} about ${brand.name}`}
              className="group flex h-full flex-col items-center justify-center gap-[0.7rem] rounded-[1.2rem] border border-white/10 bg-[#1d1d1d] px-[0.6rem] py-[1.3rem] text-center transition-colors duration-200 hover:border-[var(--accent)]/60 hover:bg-[#242424] max-md:gap-2 max-md:py-4"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[2.4rem] w-[2.4rem] text-white transition-colors duration-200 group-hover:text-[var(--accent)] max-md:h-6 max-md:w-6">
                <path d={a.logo.path} fill="currentColor" fillRule={a.logo.evenOdd ? "evenodd" : undefined} />
              </svg>
              <span className="text-[1.1rem] font-medium leading-tight text-white/85 max-md:text-xs">{a.name}</span>
              <span className="sr-only">(opens {a.name} in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
