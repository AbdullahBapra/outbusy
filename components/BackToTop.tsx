"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const R = 22; // ring radius (viewBox 48)
const C = 2 * Math.PI * R;

/**
 * Bottom-right "back to top" button, stacked above the Kirby chat launcher. Appears after the first screen; a thin teal ring
 * around it fills with scroll progress. On hover the arrow swaps (out the top, in from
 * below) and a small label appears.
 */
export function BackToTop() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      setVisible(window.scrollY > window.innerHeight * 0.8);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      className={cn(
        "fixed bottom-[136px] right-[40px] z-40 flex items-center gap-[0.8rem] transition-[opacity,transform] duration-300 max-sm:bottom-[100px] max-sm:right-[28px]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-[1rem] opacity-0",
      )}
    >
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        tabIndex={visible ? 0 : -1}
        className="group/top peer relative flex h-[5.2rem] w-[5.2rem] items-center justify-center rounded-full bg-[#040404] text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)] max-md:h-12 max-md:w-12"
      >
        {/* scroll-progress ring */}
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          <circle
            cx="24"
            cy="24"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
          />
        </svg>
        {/* arrow swap */}
        <span className="relative h-[1.8rem] w-[1.8rem] overflow-hidden max-md:h-4 max-md:w-4" aria-hidden="true">
          {[0, 1].map((k) => (
            <svg
              key={k}
              viewBox="0 0 24 24"
              fill="none"
              className={cn(
                "absolute inset-0 h-full w-full transition-transform duration-300 ease-out motion-reduce:transition-none",
                k === 0 ? "group-hover/top:-translate-y-full" : "translate-y-full group-hover/top:translate-y-0",
              )}
            >
              <path d="M12 20V5m0 0-6 6m6-6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ))}
        </span>
      </button>
      {/* label appears to the left on hover */}
      <span className="pointer-events-none order-first translate-x-[0.4rem] rounded-full bg-white px-[1rem] py-[0.4rem] text-[1rem] font-medium text-[var(--ink)] opacity-0 shadow-[0_6px_18px_rgba(0,0,0,0.08)] transition-[opacity,transform] duration-200 peer-hover:translate-x-0 peer-hover:opacity-100 peer-focus-visible:translate-x-0 peer-focus-visible:opacity-100 max-md:hidden">
        Back to top · {Math.round(progress * 100)}%
      </span>
    </div>
  );
}
