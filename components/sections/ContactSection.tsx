"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { brand } from "@/content/brand";
import { categories } from "@/content/services";
import { SectionHeading } from "@/components/ui/section-heading";
import { PillButton } from "@/components/ui/pill-button";
import { DynIcon } from "@/components/ui/dyn-icon";
import { cn } from "@/lib/utils";

type Path = "request" | "call";

const areas = [
  ...categories.map((c) => ({ id: c.slug, label: c.title, icon: c.icon })),
  { id: "unsure", label: "Not sure yet", icon: "HelpCircle" },
];
const timelines = ["As soon as possible", "This month", "Next quarter", "Just exploring"];
const nextSteps = [
  { title: "We reply within 1 business day", body: "A real person reads your request — no bots, no sales sequence." },
  { title: "30-minute discovery call", body: "We map your process and point out the quickest wins." },
  { title: "Fixed-price proposal", body: "Clear scope, timeline and price. No obligation." },
];

/**
 * Contact section: pick a path (send a request / book a call / take the audit), a guided
 * request form, and a "what happens next" timeline.
 * - `brand.bookingUrl` (Calendly / Cal.com embed) shows a live calendar under "Book a call".
 * - `brand.contactWebhookUrl` receives each request as JSON (e.g. an n8n webhook → CRM).
 * - Links like /contact?topic=… pre-fill the message and show what the visitor asks about.
 */
export function ContactSection() {
  return (
    <Suspense fallback={<ContactInner topic="" />}>
      <ContactWithTopic />
    </Suspense>
  );
}

function ContactWithTopic() {
  const topic = useSearchParams().get("topic")?.slice(0, 160) ?? "";
  return <ContactInner key={topic} topic={topic} />;
}

function Chip({ on, onClick, icon, children }: { on: boolean; onClick: () => void; icon?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={cn(
        "flex items-center gap-[0.6rem] rounded-full border px-[1.1rem] py-[0.6rem] text-[1.1rem] transition-colors duration-150 max-md:text-sm",
        on ? "border-[var(--teal)] bg-[var(--mint-50)] text-[var(--ink)]" : "border-black/12 text-black/65 hover:border-black/25",
      )}
    >
      {icon && <DynIcon name={icon} className={cn("h-[1.3rem] w-[1.3rem]", on ? "text-[var(--teal)]" : "text-black/40")} strokeWidth={1.8} />}
      {children}
    </button>
  );
}

function ContactInner({ topic }: { topic: string }) {
  const [path, setPath] = useState<Path>("request");
  const [picked, setPicked] = useState<string[]>([]);
  const [timeline, setTimeline] = useState<string>("");
  const [sentName, setSentName] = useState<string | null>(null);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const submit = async (form: HTMLFormElement) => {
    const d = new FormData(form);
    const payload = {
      source: "contact",
      name: String(d.get("name") ?? ""),
      email: String(d.get("email") ?? ""),
      company: String(d.get("company") ?? ""),
      areas: picked.map((id) => areas.find((a) => a.id === id)?.label ?? id),
      timeline,
      message: String(d.get("message") ?? ""),
      topic,
      submittedAt: new Date().toISOString(),
    };
    setSentName(payload.name.split(" ")[0] || "there");
    if (brand.contactWebhookUrl) {
      try {
        await fetch(brand.contactWebhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } catch {
        // Don't block the thank-you state on a webhook error.
      }
    }
  };

  const paths: { id: Path | "audit"; title: string; sub: string; icon: string }[] = [
    { id: "request", title: "Send a request", sub: "Tell us what you need", icon: "Send" },
    { id: "call", title: "Book a call", sub: "Pick a 30-min slot", icon: "Phone" },
    { id: "audit", title: "Not sure yet?", sub: "Take the 5-min audit", icon: "ClipboardList" },
  ];

  return (
    <section id="contact" className="sec-red scroll-mt-[2rem] bg-white">
      <div className="container-x">
        <SectionHeading big="Let's Talk" light="tell us what you want to automate" />

        <div className="mt-[3rem] grid grid-cols-[1fr_32rem] gap-[4rem] max-lg:grid-cols-1">
          {/* Left: path picker + form / calendar */}
          <div>
            <div className="grid grid-cols-3 gap-[1rem] max-md:grid-cols-1" role="tablist" aria-label="How would you like to get in touch?">
              {paths.map((p) => {
                const on = p.id === path;
                const inner = (
                  <>
                    <span
                      className={cn(
                        "flex h-[3rem] w-[3rem] flex-none items-center justify-center rounded-[0.8rem] border transition-colors duration-150",
                        on ? "border-[var(--teal)] bg-[var(--teal)] text-white" : "border-black/10 text-[var(--teal)]",
                      )}
                    >
                      <DynIcon name={p.icon} className="h-[1.4rem] w-[1.4rem]" strokeWidth={1.8} />
                    </span>
                    <span className="text-left">
                      <span className="block text-[1.25rem] font-semibold text-[var(--ink)]">{p.title}</span>
                      <span className="block text-[1rem] text-black/50">{p.sub}</span>
                    </span>
                  </>
                );
                const cls = cn(
                  "flex items-center gap-[1rem] rounded-[1.2rem] border p-[1.1rem] transition-colors duration-150",
                  on ? "border-[var(--teal)] bg-[var(--mint-50)]" : "border-black/10 hover:border-black/25 hover:bg-[#fafafa]",
                );
                return p.id === "audit" ? (
                  <Link key={p.id} href="/free-audit" className={cls}>
                    {inner}
                  </Link>
                ) : (
                  <button key={p.id} type="button" role="tab" aria-selected={on} onClick={() => setPath(p.id as Path)} className={cls}>
                    {inner}
                  </button>
                );
              })}
            </div>

            <div className="mt-[1.6rem] rounded-[1.875rem] border-[0.8px] border-[var(--line)] p-[2.6rem] max-md:p-5">
              {path === "call" ? (
                <div className="fade-quick">
                  <h3 className="text-[2rem] font-semibold text-[var(--ink)] max-md:text-xl">Book a free 30-minute call</h3>
                  {brand.bookingUrl ? (
                    <iframe src={brand.bookingUrl} title="Book a call" className="mt-[1.6rem] h-[64rem] w-full rounded-[1.2rem] border border-black/10 max-md:h-[40rem]" />
                  ) : (
                    <div className="mt-[1.2rem] space-y-[1rem]">
                      <p className="body-text">Our calendar isn&apos;t embedded yet — reach us directly and we&apos;ll find a time within a day.</p>
                      <div className="flex flex-wrap gap-[1rem]">
                        <PillButton href={`mailto:${brand.email}?subject=${encodeURIComponent("Book a call")}`}>Email Us</PillButton>
                        <PillButton href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} variant="white" className="!border-black/15">
                          Call {brand.phone}
                        </PillButton>
                      </div>
                    </div>
                  )}
                </div>
              ) : sentName ? (
                <div className="fade-quick py-[2rem]">
                  <span className="flex h-[4rem] w-[4rem] items-center justify-center rounded-full bg-[var(--mint-100)] text-[2rem] text-[var(--teal)]">✓</span>
                  <h3 className="mt-[1.4rem] text-[2.6rem] font-semibold text-[var(--ink)] max-md:text-xl">Thanks, {sentName} — request received.</h3>
                  <p className="body-text mt-[0.4rem] max-w-[46rem]">We&apos;ll reply within one business day. While you wait, see where automation would help most:</p>
                  <div className="mt-[1.6rem]">
                    <PillButton href="/free-audit">Take the 5-Min Audit</PillButton>
                  </div>
                </div>
              ) : (
                <form
                  className="fade-quick space-y-[2rem]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit(e.currentTarget);
                  }}
                >
                  {topic && (
                    <div className="flex items-start gap-[0.6rem] rounded-[0.9rem] bg-[var(--mint-50)] px-[1.2rem] py-[0.8rem] text-[1.1rem] leading-[1.5rem] text-[var(--ink)] max-md:text-sm">
                      <span className="text-[var(--teal)]">●</span>
                      <span>
                        <span className="text-black/50">Enquiring about: </span>
                        {topic}
                      </span>
                    </div>
                  )}

                  <fieldset>
                    <legend className="text-[1.2rem] font-semibold text-[var(--ink)]">
                      What do you want to automate? <span className="font-normal text-black/40">· pick any</span>
                    </legend>
                    <div className="mt-[0.9rem] flex flex-wrap gap-[0.6rem]">
                      {areas.map((a) => (
                        <Chip key={a.id} on={picked.includes(a.id)} onClick={() => toggle(a.id)} icon={a.icon}>
                          {a.label}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid grid-cols-3 gap-[1rem] max-md:grid-cols-1">
                    {[
                      { name: "name", ph: "Your name", type: "text", req: true },
                      { name: "email", ph: "Work email", type: "email", req: true },
                      { name: "company", ph: "Company or website", type: "text", req: false },
                    ].map((f) => (
                      <input
                        key={f.name}
                        name={f.name}
                        type={f.type}
                        required={f.req}
                        placeholder={f.ph}
                        aria-label={f.ph}
                        className="rounded-[1rem] border border-black/15 px-[1.3rem] py-[1.1rem] text-[1.2rem] focus:border-[var(--teal)] focus:outline-none max-md:text-base"
                      />
                    ))}
                  </div>

                  <fieldset>
                    <legend className="text-[1.2rem] font-semibold text-[var(--ink)]">When would you like to start?</legend>
                    <div className="mt-[0.9rem] flex flex-wrap gap-[0.6rem]">
                      {timelines.map((t) => (
                        <Chip key={t} on={timeline === t} onClick={() => setTimeline(timeline === t ? "" : t)}>
                          {t}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>

                  <textarea
                    name="message"
                    required
                    rows={4}
                    defaultValue={topic ? `I'm interested in ${topic}.\n\n` : undefined}
                    placeholder="Which tasks eat most of your team's time?"
                    aria-label="Your message"
                    className="h-[10rem] w-full resize-none rounded-[1rem] border border-black/15 px-[1.3rem] py-[1.1rem] text-[1.2rem] focus:border-[var(--teal)] focus:outline-none max-md:text-base"
                  />

                  <div className="flex items-center justify-between gap-[1.6rem] max-md:flex-col max-md:items-start">
                    <p className="text-[1rem] leading-[1.5rem] text-black/45">
                      By sending you agree to our{" "}
                      <Link href="/privacy-policy" className="underline">
                        privacy policy
                      </Link>
                      . We never share your details.
                    </p>
                    <PillButton type="submit">Send Request</PillButton>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Right: what happens next + direct contact */}
          <aside className="self-start lg:sticky lg:top-[3rem]">
            <div className="rounded-[1.875rem] bg-[#fafafa] p-[2.2rem]">
              <div className="text-[0.95rem] font-medium uppercase tracking-[0.1em] text-black/40">What happens next</div>
              <ol className="mt-[1.4rem]">
                {nextSteps.map((s, i) => (
                  <li key={s.title} className="relative flex gap-[1.2rem] pb-[1.8rem] last:pb-0">
                    {i < nextSteps.length - 1 && <span className="absolute bottom-0 left-[1.15rem] top-[2.6rem] w-px bg-black/10" aria-hidden="true" />}
                    <span className="flex h-[2.3rem] w-[2.3rem] flex-none items-center justify-center rounded-full border border-[var(--teal)] bg-white text-[1rem] font-semibold text-[var(--teal)]">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[1.25rem] font-semibold text-[var(--ink)]">{s.title}</span>
                      <span className="mt-[0.2rem] block text-[1.05rem] leading-[1.5rem] text-black/55">{s.body}</span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-[2rem] space-y-[0.6rem] border-t border-black/[0.08] pt-[1.6rem] text-[1.1rem]">
                <a href={`mailto:${brand.email}`} className="flex items-center gap-[0.8rem] text-[var(--ink)] hover:text-[var(--teal)]">
                  <DynIcon name="Mail" className="h-[1.4rem] w-[1.4rem] text-black/40" strokeWidth={1.8} />
                  {brand.email}
                </a>
                <a href={`tel:${brand.phone.replace(/[^+\d]/g, "")}`} className="flex items-center gap-[0.8rem] text-[var(--ink)] hover:text-[var(--teal)]">
                  <DynIcon name="Phone" className="h-[1.4rem] w-[1.4rem] text-black/40" strokeWidth={1.8} />
                  {brand.phone}
                </a>
              </div>
              <p className="mt-[1.4rem] text-[1rem] text-black/40">No obligation · NDA on request · EU hosting available</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
