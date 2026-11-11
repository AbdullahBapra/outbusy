"use client";

import { useState } from "react";
import { templates } from "@/content/pages";
import { DynIcon } from "@/components/ui/dyn-icon";
import { AnimatedIcon } from "@/components/ui/animated-icon";
import { cn } from "@/lib/utils";
import { PillButton } from "@/components/ui/pill-button";

/**
 * Email-gated template library. On submit it unlocks the downloads client-side.
 * To capture the email, POST it to your CRM / n8n webhook inside `onSubmit`,
 * and point each template's download link at the real .json file (e.g. /templates/<file>.json).
 */
export function TemplatesGate() {
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("");

  return (
    <section className="sec-green bg-white">
      <div className="container-x">
        {!unlocked && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setUnlocked(true);
            }}
            className="mb-[3rem] grid grid-cols-[1fr_auto] items-center gap-[2rem] rounded-[1.875rem] bg-[#040404] p-[3rem] text-white max-md:grid-cols-1 max-md:p-6"
          >
            <div>
              <h2 className="text-[3.125rem] font-light uppercase leading-[3.75rem] max-md:text-2xl">
                Unlock <strong className="font-bold text-[var(--accent)]">All {templates.length} Templates</strong>
              </h2>
              <p className="mt-[0.6rem] text-[1.2rem] font-light text-white/70 max-md:text-sm">Enter your email and get instant access, plus new templates as we publish them.</p>
            </div>
            <div className="flex gap-[0.6rem] max-md:flex-col">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                aria-label="Email address"
                className="w-[24rem] rounded-full border border-white/20 bg-white/5 px-[1.4rem] py-[1rem] text-[1.3rem] text-white placeholder:text-white/40 focus:border-[var(--accent)] focus:outline-none max-md:w-full max-md:text-base"
              />
              <PillButton type="submit" variant="white">
                Get Templates
              </PillButton>
            </div>
          </form>
        )}
        {unlocked && (
          <p className="mb-[3rem] rounded-[1.2rem] bg-[var(--mint-100)] p-[1.4rem] text-[1.3rem] text-[var(--ink)] max-md:text-sm">
            ✓ Unlocked — thanks! Downloads are now available below.
          </p>
        )}

        <div className="grid grid-cols-3 gap-[2rem] max-lg:grid-cols-2 max-md:grid-cols-1">
          {templates.map((t, i) => (
            <div key={t.title} className="flex min-h-[20rem] flex-col justify-between rounded-[1.875rem] border-[0.8px] border-[var(--line)] p-[2rem]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full" style={{ background: i % 2 ? "var(--mint-200)" : "var(--mint-50)" }}>
                    <AnimatedIcon name="Workflow" className="h-[3.9rem] w-[3.9rem] text-[var(--ink)]" />
                  </span>
                  <span className="text-[1rem] uppercase tracking-wide text-black/50">{t.tools}</span>
                </div>
                <h3 className="mt-[1.4rem] text-[2rem] font-semibold uppercase leading-[2.4rem] text-[var(--ink)] max-md:text-lg">{t.title}</h3>
                <p className="body-thin mt-[0.4rem]">{t.desc}</p>
              </div>
              <button
                type="button"
                disabled={!unlocked}
                className={cn(
                  "mt-[1.6rem] flex w-fit items-center gap-[0.6rem] rounded-full px-[1.4rem] py-[0.8rem] text-[1.1rem] font-semibold uppercase transition-colors max-md:text-sm",
                  unlocked ? "bg-[var(--teal)] text-white hover:bg-[#006e62]" : "cursor-not-allowed bg-black/5 text-black/40",
                )}
              >
                <DynIcon name={unlocked ? "Download" : "Lock"} className="h-[1.3rem] w-[1.3rem]" strokeWidth={2} />
                {unlocked ? "Download JSON" : "Locked"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
