"use client";

import type { MouseEvent } from "react";

type Edge = "left" | "right" | "top" | "bottom";

const offscreen: Record<Edge, string> = {
  left: "translate3d(-101%,0,0)",
  right: "translate3d(101%,0,0)",
  top: "translate3d(0,-101%,0)",
  bottom: "translate3d(0,101%,0)",
};

const EASE = "transform 0.45s cubic-bezier(0.65, 0, 0.35, 1)";

/** Which edge of `el` is the pointer closest to? */
function nearestEdge(e: MouseEvent, el: HTMLElement): Edge {
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  const d = { left: x, right: r.width - x, top: y, bottom: r.height - y };
  return (Object.keys(d) as Edge[]).reduce((a, b) => (d[a] <= d[b] ? a : b));
}

/**
 * Hover fill that slides in from the edge the pointer enters and out through the
 * edge it leaves. The card needs `relative overflow-hidden` and a child with
 * `data-fill` (absolute, inset-0). Respects prefers-reduced-motion.
 */
export const directionalFill = {
  onMouseEnter(e: MouseEvent<HTMLElement>) {
    const card = e.currentTarget;
    const fill = card.querySelector<HTMLElement>("[data-fill]");
    if (!fill) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    fill.style.transition = "none";
    fill.style.transform = offscreen[nearestEdge(e, card)];
    void fill.offsetWidth; // commit the start position before animating
    fill.style.transition = reduce ? "none" : EASE;
    fill.style.transform = "translate3d(0,0,0)";
  },
  onMouseLeave(e: MouseEvent<HTMLElement>) {
    const card = e.currentTarget;
    const fill = card.querySelector<HTMLElement>("[data-fill]");
    if (!fill) return;
    fill.style.transform = offscreen[nearestEdge(e, card)];
  },
};
