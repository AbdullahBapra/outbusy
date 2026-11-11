"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Faq({ items, title = "FAQs" }: { items: { q: string; a: string }[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="sec-red bg-white">
      <div className="container-x">
        <h2 className="display">{title}</h2>

        <div className="mt-[2rem]">
          {items.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q} className="border-b-[0.8px] border-black/20">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex min-h-[8rem] w-full items-center justify-between gap-6 py-4 text-left"
                >
                  <h3 className="text-[1.375rem] font-semibold uppercase leading-[1.65rem] text-black max-md:text-base">{f.q}</h3>
                  <svg
                    viewBox="0 0 40 24"
                    className={cn("h-[1.9rem] w-[3rem] flex-none text-black transition-transform duration-300", isOpen && "rotate-90")}
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M2 12h35m0 0L26 1m11 11L26 23" stroke="currentColor" strokeWidth="1.3" />
                  </svg>
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-500 ease-in-out", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="max-w-[92rem] pb-[2.4rem] text-[1.5rem] font-light leading-[2.1rem] text-[var(--text)] max-md:text-base">{f.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
