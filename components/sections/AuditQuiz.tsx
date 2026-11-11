"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { brand } from "@/content/brand";
import { insights, questions, scoreAudit, type Answers, type Report } from "@/content/audit";
import { categories, serviceHref } from "@/content/services";
import { industries } from "@/content/industries";
import { PillButton } from "@/components/ui/pill-button";
import { DynIcon } from "@/components/ui/dyn-icon";
import { cn } from "@/lib/utils";

const serviceByHref = new Map(categories.flatMap((c) => c.services.map((s) => [serviceHref(c, s), s] as const)));
const fmtEur = (n: number) => `€${n.toLocaleString("en-US")}`;

/**
 * Free automation audit: 11 questions → email gate → rule-based report.
 * If `brand.auditWebhookUrl` is set, the answers, contact details and report are POSTed
 * there as JSON (e.g. an n8n webhook that creates a CRM lead).
 */
export function AuditQuiz() {
  const total = questions.length;
  const [step, setStep] = useState(0); // 0..total-1 questions, total = email gate, total+1 = report
  const [answers, setAnswers] = useState<Answers>({});
  const [report, setReport] = useState<Report | null>(null);
  const [contact, setContact] = useState({ name: "", email: "" });
  const [note, setNote] = useState<string | null>(null); // insight about the previous answer
  const topRef = useRef<HTMLDivElement>(null);

  const q = questions[step];
  const picked = q ? (answers[q.id] ?? []) : [];

  const go = (next: number) => {
    setStep(next);
    // keep the quiz in view on small screens
    requestAnimationFrame(() => {
      const el = topRef.current;
      if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const choose = (optId: string) => {
    if (!q) return;
    if (q.type === "single") {
      setAnswers((a) => ({ ...a, [q.id]: [optId] }));
      setTimeout(() => {
        setNote(insights[`${q.id}:${optId}`] ?? null);
        go(step + 1);
      }, 220); // auto-advance after a short beat
      return;
    }
    setAnswers((a) => {
      const cur = a[q.id] ?? [];
      if (cur.includes(optId)) return { ...a, [q.id]: cur.filter((x) => x !== optId) };
      if (q.max && cur.length >= q.max) return a;
      return { ...a, [q.id]: [...cur, optId] };
    });
  };

  const submit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    const c = { name: String(data.get("name") ?? ""), email: String(data.get("email") ?? ""), company: String(data.get("company") ?? "") };
    const r = scoreAudit(answers);
    setContact(c);
    setReport(r);
    go(total + 1);
    if (brand.auditWebhookUrl) {
      try {
        await fetch(brand.auditWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: "free-audit", contact: c, answers, report: r, submittedAt: new Date().toISOString() }),
        });
      } catch {
        // Never block the visitor's report on a webhook failure.
      }
    }
  };

  // Keyboard: 1-9 picks an option, Enter continues (multi-choice). Ignored while typing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!q || t?.closest("input, textarea, select") || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= q.options.length) {
        e.preventDefault();
        choose(q.options[n - 1].id);
      } else if (e.key === "Enter" && q.type === "multi" && picked.length > 0) {
        e.preventDefault();
        setNote(null);
        go(step + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Live estimate shown while answering (needs team size + hours first).
  const live = answers.team && answers.hours ? scoreAudit(answers) : null;

  const progress = Math.min(step, total) / total;

  return (
    <div ref={topRef} className="scroll-mt-[2rem] overflow-hidden rounded-[1.875rem] border-[0.8px] border-[var(--line)] bg-white">
      {/* top progress bar */}
      <div className="h-[3px] bg-black/[0.06]">
        <div className="h-full bg-[var(--teal)] transition-[width] duration-500 ease-out" style={{ width: `${(step > total ? 1 : progress) * 100}%` }} />
      </div>

      {step <= total ? (
        <div className="grid grid-cols-[22rem_1fr] max-lg:grid-cols-1">
          {/* step list + live estimate */}
          <div className="flex flex-col border-r border-black/[0.06] bg-[#fafafa] max-lg:hidden">
          <ol className="p-[1.6rem] pb-0">
            {[...questions.map((x) => x.label), "Your report"].map((label, i) => {
              const done = i < step;
              const current = i === step;
              return (
                <li key={label}>
                  <button
                    type="button"
                    disabled={i > step}
                    onClick={() => go(i)}
                    className={cn(
                      "flex w-full items-center gap-[0.9rem] rounded-[0.7rem] px-[0.8rem] py-[0.55rem] text-left text-[1.1rem] transition-colors",
                      current ? "bg-white font-semibold text-[var(--ink)] shadow-[0_1px_2px_rgba(0,0,0,0.05)]" : done ? "text-black/70 hover:bg-white/70" : "text-black/30",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-[1.8rem] w-[1.8rem] flex-none items-center justify-center rounded-full border text-[0.85rem] tabular-nums",
                        done ? "border-[var(--teal)] bg-[var(--teal)] text-white" : current ? "border-[var(--teal)] text-[var(--teal)]" : "border-black/15",
                      )}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    {label}
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="m-[1.6rem] mt-auto rounded-[1rem] border border-black/[0.08] bg-white p-[1.2rem]" aria-live="polite">
            <div className="text-[0.9rem] font-medium uppercase tracking-[0.1em] text-black/40">Time you could win back</div>
            {live ? (
              <>
                <div key={live.hoursPerWeek} className="fade-quick mt-[0.4rem] text-[2.6rem] font-bold leading-none text-[var(--ink)]">
                  ~{live.hoursPerWeek} h<span className="text-[1.2rem] font-medium text-black/45"> / week</span>
                </div>
                <div className="mt-[0.8rem] h-[0.45rem] overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-[var(--teal)] transition-[width] duration-700 ease-out"
                    style={{ width: `${Math.min(100, Math.max(6, live.score))}%` }}
                  />
                </div>
                <div className="mt-[0.5rem] text-[0.95rem] text-black/45">Full score unlocks at the end</div>
              </>
            ) : (
              <div className="mt-[0.5rem] text-[1.05rem] leading-[1.5rem] text-black/45">Answer a few questions to see your estimate.</div>
            )}
          </div>
          </div>

          {/* question / email gate */}
          <div className="flex min-h-[44rem] flex-col p-[3rem] max-md:min-h-0 max-md:p-5">
            <div className="flex items-center justify-between text-[1.05rem] text-black/45">
              <span className="font-medium uppercase tracking-[0.1em]">
                {step < total ? `Question ${step + 1} of ${total}` : "Almost done"}
              </span>
              {step > 0 && (
                <button type="button" onClick={() => go(step - 1)} className="font-medium text-[var(--teal)] hover:underline">
                  ← Back
                </button>
              )}
            </div>

            {q ? (
              <div key={q.id} className="fade-quick flex flex-1 flex-col">
                {note && (
                  <p className="mt-[1.2rem] flex max-w-[56rem] items-start gap-[0.6rem] text-[1.1rem] leading-[1.5rem] text-black/55">
                    <span className="text-[var(--teal)]" aria-hidden="true">↳</span>
                    {note}
                  </p>
                )}
                <h2 className="mt-[1.4rem] max-w-[56rem] text-[3rem] font-semibold leading-[3.5rem] text-[var(--ink)] max-md:text-2xl">{q.title}</h2>
                {q.help && <p className="body-text mt-[0.4rem]">{q.help}</p>}

                <div className="mt-[2.2rem] grid grid-cols-2 gap-[1rem] max-md:grid-cols-1">
                  {q.options.map((o, i) => {
                    const on = picked.includes(o.id);
                    const full = q.type === "multi" && q.max && picked.length >= q.max && !on;
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => choose(o.id)}
                        disabled={Boolean(full)}
                        aria-pressed={on}
                        className={cn(
                          "flex items-center justify-between gap-[1rem] rounded-[1rem] border px-[1.4rem] py-[1.2rem] text-left text-[1.25rem] transition-colors duration-150 max-md:text-base",
                          on ? "border-[var(--teal)] bg-[var(--mint-50)] text-[var(--ink)]" : "border-black/10 text-black/75 hover:border-black/25 hover:bg-[#fafafa]",
                          full && "cursor-not-allowed opacity-40",
                        )}
                      >
                        <span className="flex items-center gap-[1rem]">
                          {o.icon ? (
                            <DynIcon name={o.icon} className={cn("h-[1.6rem] w-[1.6rem] flex-none", on ? "text-[var(--teal)]" : "text-black/40")} strokeWidth={1.7} />
                          ) : (
                            <span className="w-[1.6rem] flex-none text-center text-[0.95rem] tabular-nums text-black/30 max-md:hidden">{i + 1}</span>
                          )}
                          {o.label}
                        </span>
                        <span
                          className={cn(
                            "flex h-[1.8rem] w-[1.8rem] flex-none items-center justify-center border text-[0.9rem]",
                            q.type === "multi" ? "rounded-[0.4rem]" : "rounded-full",
                            on ? "border-[var(--teal)] bg-[var(--teal)] text-white" : "border-black/20 text-transparent",
                          )}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </button>
                    );
                  })}
                </div>

                {q.type === "single" && (
                  <p className="mt-auto pt-[2rem] text-[0.95rem] text-black/35 max-lg:hidden">
                    Tip: press 1–{q.options.length} to answer
                  </p>
                )}
                {q.type === "multi" && (
                  <div className="mt-auto flex items-center justify-between gap-4 pt-[2.4rem]">
                    <span className="text-[1.05rem] text-black/45">
                      {picked.length} selected{q.max ? ` · up to ${q.max}` : ""}
                    </span>
                    <PillButton
                      onClick={() => {
                        setNote(null);
                        go(step + 1);
                      }}
                      disabled={picked.length === 0}
                    >
                      Next
                    </PillButton>
                  </div>
                )}
              </div>
            ) : (
              <form
                className="fade-quick flex flex-1 flex-col"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(e.currentTarget);
                }}
              >
                {note && (
                  <p className="mt-[1.2rem] flex items-start gap-[0.6rem] text-[1.1rem] leading-[1.5rem] text-black/55">
                    <span className="text-[var(--teal)]" aria-hidden="true">↳</span>
                    {note}
                  </p>
                )}
                <h2 className="mt-[1.4rem] text-[3rem] font-semibold leading-[3.5rem] text-[var(--ink)] max-md:text-2xl">Your report is ready.</h2>
                <p className="body-text mt-[0.4rem] max-w-[48rem]">Tell us where to send it — you&apos;ll see it right away on the next screen.</p>
                <div className="mt-[2.2rem] grid max-w-[56rem] grid-cols-2 gap-[1rem] max-md:grid-cols-1">
                  {[
                    { name: "name", ph: "Your name", type: "text", req: true },
                    { name: "email", ph: "Work email", type: "email", req: true },
                    { name: "company", ph: "Company (optional)", type: "text", req: false },
                  ].map((f) => (
                    <input
                      key={f.name}
                      name={f.name}
                      type={f.type}
                      required={f.req}
                      placeholder={f.ph}
                      className={cn(
                        "rounded-[1rem] border border-black/15 px-[1.4rem] py-[1.2rem] text-[1.25rem] focus:border-[var(--teal)] focus:outline-none max-md:text-base",
                        f.name === "company" && "col-span-2 max-md:col-span-1",
                      )}
                    />
                  ))}
                </div>
                <label className="mt-[1.4rem] flex max-w-[56rem] items-start gap-[0.8rem] text-[1.05rem] leading-[1.5rem] text-black/60">
                  <input type="checkbox" required className="mt-[0.3rem] h-[1.4rem] w-[1.4rem] accent-[var(--teal)]" />
                  <span>
                    I agree to be contacted about my results. See our{" "}
                    <Link href="/privacy-policy" className="text-[var(--teal)] underline">
                      privacy policy
                    </Link>
                    .
                  </span>
                </label>
                <div className="mt-auto pt-[2.4rem]">
                  <PillButton type="submit">See My Report</PillButton>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : (
        report && <AuditReport report={report} name={contact.name} onRestart={() => { setAnswers({}); setReport(null); go(0); }} />
      )}
    </div>
  );
}

function ScoreRing({ score: target }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  // Count up from 0 while the ring fills (once). Instant for reduced-motion users.
  const [score, setScore] = useState(0);
  useEffect(() => {
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1100;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = duration ? Math.min((now - start) / duration, 1) : 1;
      setScore(Math.round(target * (1 - Math.pow(1 - t, 3)))); // ease-out
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <div className="relative h-[15rem] w-[15rem] flex-none">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="8" />
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--teal)" strokeWidth="8" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[4.4rem] font-bold leading-none text-[var(--ink)]">{score}</span>
        <span className="mt-[0.3rem] text-[0.95rem] uppercase tracking-[0.1em] text-black/45">of 100</span>
      </div>
    </div>
  );
}

function AuditReport({ report, name, onRestart }: { report: Report; name: string; onRestart: () => void }) {
  const ind = useMemo(() => industries.find((i) => i.slug === report.industry), [report.industry]);
  const recTitles = report.recommendations.map((r) => serviceByHref.get(r.href)?.title ?? r.href);
  const topic = `Free audit results — score ${report.score}/100 · ${recTitles.join(", ")}`;

  return (
    <div className="fade-quick p-[3rem] max-md:p-5" id="audit-report">
      <div className="flex items-center justify-between gap-4 text-[1.05rem] text-black/45">
        <span className="font-medium uppercase tracking-[0.1em]">Your automation report</span>
        <span className="no-print flex gap-[1.4rem]">
          <button type="button" onClick={() => window.print()} className="font-medium text-[var(--teal)] hover:underline">
            Save as PDF
          </button>
          <button type="button" onClick={onRestart} className="font-medium text-black/50 hover:underline">
            Retake
          </button>
        </span>
      </div>

      {/* score + headline numbers */}
      <div className="mt-[2rem] grid grid-cols-[auto_1fr] items-center gap-[3rem] max-md:grid-cols-1">
        <ScoreRing score={report.score} />
        <div>
          <div className="text-[1.1rem] font-medium uppercase tracking-[0.1em] text-[var(--teal)]">{report.level}</div>
          <h2 className="mt-[0.4rem] text-[3rem] font-semibold leading-[3.5rem] text-[var(--ink)] max-md:text-2xl">
            {name ? `${name.split(" ")[0]}, there's` : "There's"} real time to win back.
          </h2>
          <div className="mt-[1.6rem] grid max-w-[52rem] grid-cols-2 gap-[1rem]">
            <div className="rounded-[1rem] bg-[var(--mint-50)] p-[1.4rem]">
              <div className="text-[3rem] font-bold leading-none text-[var(--ink)] max-md:text-2xl">~{report.hoursPerWeek} h</div>
              <div className="mt-[0.4rem] text-[1.05rem] text-black/55">could be automated each week</div>
            </div>
            <div className="rounded-[1rem] bg-[var(--mint-50)] p-[1.4rem]">
              <div className="text-[3rem] font-bold leading-none text-[var(--ink)] max-md:text-2xl">~{fmtEur(report.monthlyValue)}</div>
              <div className="mt-[0.4rem] text-[1.05rem] text-black/55">in team time per month</div>
            </div>
          </div>
          <p className="mt-[0.8rem] text-[0.95rem] text-black/40">
            Estimates based on your answers, assuming half of repetitive work can be automated at €35/hour.
          </p>
        </div>
      </div>

      {/* recommendations */}
      <div className="mt-[3rem] border-t border-black/[0.08] pt-[2.4rem]">
        <div className="text-[1.1rem] font-medium uppercase tracking-[0.1em] text-black/45">Where we&apos;d start</div>
        <div className="mt-[1.2rem] grid grid-cols-3 gap-[1.2rem] max-lg:grid-cols-1">
          {report.recommendations.map((r, i) => {
            const s = serviceByHref.get(r.href);
            return (
              <Link
                key={r.href}
                href={r.href}
                className="group flex flex-col rounded-[1.2rem] border border-black/10 p-[1.6rem] transition-colors duration-150 hover:border-[var(--teal)]/40 hover:bg-[#fafafa]"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-[3rem] w-[3rem] items-center justify-center rounded-[0.7rem] border border-black/[0.08] text-[var(--teal)]">
                    <DynIcon name={s?.icon ?? "Sparkles"} className="h-[1.5rem] w-[1.5rem]" strokeWidth={1.7} />
                  </span>
                  <span className="text-[1rem] font-medium tabular-nums text-black/35">0{i + 1}</span>
                </div>
                <div className="mt-[1.2rem] text-[1.5rem] font-semibold text-[var(--ink)] group-hover:text-[var(--teal)]">{s?.title}</div>
                <p className="mt-[0.4rem] text-[1.1rem] leading-[1.6rem] text-black/55">{r.reason}</p>
                <span className="mt-auto pt-[1rem] text-[1.05rem] font-medium text-[var(--teal)]">See how it works →</span>
              </Link>
            );
          })}
        </div>
        {ind && (
          <p className="mt-[1.4rem] text-[1.1rem] text-black/55">
            Working in {ind.name.toLowerCase()}?{" "}
            <Link href={`/industries/${ind.slug}`} className="font-medium text-[var(--teal)] hover:underline">
              See the systems we build for your industry →
            </Link>
          </p>
        )}
      </div>

      {/* CTA */}
      <div className="no-print mt-[3rem] flex items-center justify-between gap-[2rem] rounded-[1.4rem] bg-[#040404] p-[2.4rem] text-white max-md:flex-col max-md:items-start max-md:p-5">
        <div>
          <div className="text-[2rem] font-semibold leading-tight max-md:text-xl">Turn this into a real plan</div>
          <p className="mt-[0.4rem] max-w-[48rem] text-[1.1rem] leading-[1.6rem] text-white/65">
            Book a free 30-minute strategy call — we&apos;ll validate these numbers and map your first automation.
          </p>
        </div>
        <PillButton variant="white" href={`/contact?topic=${encodeURIComponent(topic)}#contact`}>
          Book Strategy Call
        </PillButton>
      </div>
    </div>
  );
}
