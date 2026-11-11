"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** What a visitor's action targets: the free-audit CTA, any other button, or a plain link. */
export type Target = "audit" | "cta" | "link";
/** The kind of page section currently in the middle of the screen. */
export type SectionTopic = "pricing" | "results" | "faq" | "process" | "industries" | "services" | "contact";

/** A meaningful moment in how the visitor uses the website. */
export type SiteSignal =
  | { kind: "hover"; target: Target }
  | { kind: "click"; target: Target }
  | { kind: "rage-click" } // several rapid clicks in one spot: frustration
  | { kind: "select-text" }
  | { kind: "copy" }
  | { kind: "exit-intent" } // pointer left through the top of the window: about to leave
  | { kind: "section"; topic: SectionTopic };

const INTERACTIVE = "a[href], button, [role='button'], summary, label[for]";
const CTA = ".btn, [data-cta]";
const AUDIT = /audit|book|get started|contact/i;

const SECTION_TOPICS: [SectionTopic, RegExp][] = [
  ["pricing", /pric|package|plans?\b|cost/i],
  ["results", /result|case stud|proof|impact|outcome/i],
  ["faq", /faq|question/i],
  ["process", /how we|process|steps?\b|work$/i],
  ["industries", /industr/i],
  ["contact", /contact|ready to|let'?s|free (ai )?audit/i],
  ["services", /automate|services?\b|what we/i],
];

function targetOf(el: Element): Target {
  const text = `${el.textContent ?? ""} ${el.getAttribute("href") ?? ""} ${el.getAttribute("aria-label") ?? ""}`;
  if ((el.matches(CTA) || el.closest(CTA)) && AUDIT.test(text)) return "audit";
  if (/\/(contact|free-audit)\b/.test(el.getAttribute("href") ?? "")) return "audit";
  return el.matches(CTA) || el.closest(CTA) ? "cta" : "link";
}

function topicOf(section: Element): SectionTopic | null {
  const heading = section.querySelector("h1, h2")?.textContent ?? "";
  return SECTION_TOPICS.find(([, re]) => re.test(heading))?.[0] ?? null;
}

/**
 * Listens to how the visitor uses the website (outside the widget) and reports meaningful
 * moments. Also reports whether a form field elsewhere has focus, and streams the mouse
 * position to `onPointer` (once per frame; `null` after a few seconds without movement).
 */
export function useSiteInteractions(
  onSignal: (s: SiteSignal) => void,
  onPointer: (p: { x: number; y: number } | null) => void,
  ignore: React.RefObject<HTMLElement | null>,
) {
  const pathname = usePathname();
  const cb = useRef(onSignal);
  const pointerCb = useRef(onPointer);
  const [fieldFocused, setFieldFocused] = useState(false);

  useEffect(() => {
    cb.current = onSignal;
    pointerCb.current = onPointer;
  });

  // Pointer, clicks, selection, copy, exit intent, form focus.
  useEffect(() => {
    const inWidget = (el: EventTarget | null) => el instanceof Node && !!ignore.current?.contains(el);
    let lastHover: Element | null = null;
    let clicks: { t: number; x: number; y: number }[] = [];
    let selectTimer: ReturnType<typeof setTimeout> | undefined;
    let restTimer: ReturnType<typeof setTimeout> | undefined;
    let raf = 0;
    let latest = { x: 0, y: 0 };

    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || inWidget(e.target)) return;
      const el = (e.target as Element).closest?.(INTERACTIVE) ?? null;
      if (el === lastHover) return;
      lastHover = el;
      if (el) cb.current({ kind: "hover", target: targetOf(el) });
    };

    const onClick = (e: MouseEvent) => {
      if (inWidget(e.target)) return;
      const now = performance.now();
      clicks = [...clicks.filter((c) => now - c.t < 900), { t: now, x: e.clientX, y: e.clientY }];
      if (clicks.length >= 4 && clicks.every((c) => Math.hypot(c.x - e.clientX, c.y - e.clientY) < 40)) {
        clicks = [];
        cb.current({ kind: "rage-click" });
        return;
      }
      const el = (e.target as Element).closest?.(INTERACTIVE);
      if (el) cb.current({ kind: "click", target: targetOf(el) });
    };

    const onSelection = () => {
      clearTimeout(selectTimer);
      selectTimer = setTimeout(() => {
        const sel = document.getSelection();
        if (!sel || sel.isCollapsed || inWidget(sel.anchorNode)) return;
        if (sel.toString().trim().length >= 12) cb.current({ kind: "select-text" });
      }, 350);
    };

    const onCopy = (e: ClipboardEvent) => !inWidget(e.target) && cb.current({ kind: "copy" });

    const onLeave = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0) cb.current({ kind: "exit-intent" });
    };

    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && !inWidget(el) && (el.matches("input:not([type=hidden]), textarea, select") || el.isContentEditable);
    const onFocusIn = (e: FocusEvent) => setFieldFocused(isField(e.target));
    const onFocusOut = () => setFieldFocused(false);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      latest = { x: e.clientX, y: e.clientY };
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          pointerCb.current(latest);
        });
      // After a few still seconds Kirby looks back at the visitor (straight ahead).
      clearTimeout(restTimer);
      restTimer = setTimeout(() => pointerCb.current(null), 4000);
    };

    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("click", onClick, { passive: true });
    document.addEventListener("selectionchange", onSelection);
    document.addEventListener("copy", onCopy);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      clearTimeout(selectTimer);
      clearTimeout(restTimer);
      cancelAnimationFrame(raf);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("click", onClick);
      document.removeEventListener("selectionchange", onSelection);
      document.removeEventListener("copy", onCopy);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("pointermove", onMove);
    };
  }, [ignore]);

  // Which section is in the middle of the screen (re-scanned on every page).
  useEffect(() => {
    let last: SectionTopic | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const topic = topicOf(entry.target);
          if (topic && topic !== last) {
            last = topic;
            cb.current({ kind: "section", topic });
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    // Wait a frame so the new page's sections are in the DOM.
    const t = setTimeout(() => document.querySelectorAll("main section").forEach((s) => io.observe(s)), 300);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, [pathname]);

  return { fieldFocused };
}
