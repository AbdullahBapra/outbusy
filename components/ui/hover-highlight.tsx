"use client";

import { useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { DynIcon } from "@/components/ui/dyn-icon";
import { AnimatedIcon, hasAnimatedIcon } from "@/components/ui/animated-icon";

type Box = { x: number; y: number; w: number; h: number };

/**
 * Wraps a list/grid of links and draws one soft highlight that glides to whichever
 * item (marked with `data-hl`) is hovered or focused. It fades in in place on first
 * hover, then slides between items, and fades out when the pointer leaves the group.
 * Items should be `relative` so they sit above the highlight.
 */
export function HoverHighlight({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [visible, setVisible] = useState(false);

  const track = (target: EventTarget | null) => {
    const root = ref.current;
    const item = (target as HTMLElement | null)?.closest<HTMLElement>("[data-hl]");
    if (!root || !item || !root.contains(item)) return;
    const r = root.getBoundingClientRect();
    const b = item.getBoundingClientRect();
    setBox({ x: b.left - r.left, y: b.top - r.top, w: b.width, h: b.height });
    setVisible(true);
  };

  return (
    <div
      ref={ref}
      className={cn("relative", className)}
      onMouseOver={(e) => track(e.target)}
      onFocus={(e) => track(e.target)}
      onMouseLeave={() => setVisible(false)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setVisible(false);
      }}
    >
      {box && (
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-0 top-0 rounded-[0.8rem] bg-[#f3f6f6] motion-reduce:transition-none",
            // Only animate position/size while already visible, so the first hover fades in
            // on the item instead of flying in from the previous spot.
            visible ? "opacity-100 transition-[transform,width,height,opacity] duration-200 ease-out" : "opacity-0 transition-opacity duration-150",
          )}
          style={{ transform: `translate(${box.x}px, ${box.y}px)`, width: box.w, height: box.h }}
        />
      )}
      {children}
    </div>
  );
}

/**
 * Standard mega-menu item content: teal marker on the left, title that turns teal,
 * and a small arrow that fades in. Use inside a `group/hl` link marked with `data-hl`.
 */
export function HighlightTitle({ children }: { children: ReactNode }) {
  return (
    <span className="flex items-center gap-[0.5rem] text-[1.15rem] font-semibold text-[var(--ink)] transition-colors duration-150 group-hover/hl:text-[var(--teal)] group-focus-visible/hl:text-[var(--teal)]">
      {children}
      <span aria-hidden="true" className="text-[1rem] opacity-0 transition-opacity duration-150 group-hover/hl:opacity-100 group-focus-visible/hl:opacity-100">
        →
      </span>
    </span>
  );
}

/**
 * Small outline icon in a light tile. On hover the icon's lines redraw themselves once
 * (stroke animation) and turn teal. Styles: `.draw-icon` in globals.css.
 */
export function HighlightIcon({ name }: { name: string }) {
  return (
    <span className="flex h-[4rem] w-[4rem] flex-none items-center justify-center rounded-[0.7rem] border border-black/[0.08] bg-white text-black/45 transition-colors duration-200 group-hover/hl:border-[var(--teal)]/30 group-hover/hl:text-[var(--teal)] group-focus-visible/hl:text-[var(--teal)]">
      {hasAnimatedIcon(name) ? (
        <AnimatedIcon name={name} className="h-[3.5rem] w-[3.5rem]" />
      ) : (
        <DynIcon name={name} className="draw-icon h-[1.5rem] w-[1.5rem]" strokeWidth={1.7} />
      )}
    </span>
  );
}

/** Thin teal marker shown on the left edge of the hovered item. */
export function HighlightMarker() {
  return (
    <span
      aria-hidden="true"
      className="absolute left-0 top-1/2 h-[1.6rem] w-[2px] -translate-y-1/2 scale-y-0 rounded-full bg-[var(--teal)] transition-transform duration-200 ease-out group-hover/hl:scale-y-100 group-focus-visible/hl:scale-y-100"
    />
  );
}
