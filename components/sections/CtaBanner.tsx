import { brand } from "@/content/brand";
import { PillButton } from "@/components/ui/pill-button";
import { TimeSavedPanel } from "@/components/sections/TimeSavedPanel";

export function CtaBanner({
  lead = "Ready to",
  big = "Automate",
  tail = "Your Growth?",
  title = "Get Your Free AI Audit",
  body = "In one call we'll map your biggest time sinks, show you what's automatable and give you an honest estimate — no obligation.",
  button = brand.ctaLabel,
  href = brand.ctaHref,
  tasks,
}: {
  lead?: string;
  big?: string;
  tail?: string;
  title?: string;
  body?: string;
  button?: string;
  href?: string;
  /** Tasks listed as "Automated" in the report card (defaults to generic examples). */
  tasks?: string[];
}) {
  return (
    <section className="sec-blue bg-white">
      <div className="container-x">
        <h2 className="flex flex-col">
          <span className="sub-strong">{lead}</span>
          <span className="display accent">{big}</span>
          <span className="display">{tail}</span>
        </h2>

        <div className="mt-[3rem] grid grid-cols-[53.12rem_1fr] gap-[2.4rem] max-lg:grid-cols-1">
          <div className="flex min-h-[28.88rem] items-center rounded-[1.875rem] border-[0.8px] border-[var(--line)] bg-white pl-[4.25rem] pr-[3rem] max-md:p-6">
            <div>
              <h3 className="card-title max-w-[30rem]">{title}</h3>
              <p className="body-thin mt-[1rem] max-w-[36rem]">{body}</p>
              <div className="mt-[2rem]">
                <PillButton href={href}>{button}</PillButton>
              </div>
            </div>
          </div>
          {/* Before/after "weekly report" — makes the offer concrete */}
          <TimeSavedPanel tasks={tasks} />
        </div>
      </div>
    </section>
  );
}
