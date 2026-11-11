"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Infinite horizontal marquee that also supports dragging.
 * - Auto-scrolls at `speed` px/s (optionally reversed) and loops seamlessly
 *   (the children are rendered twice).
 * - Pauses while hovered so cards are easy to read and click.
 * - Drag with mouse / swipe with touch; auto-scroll resumes on release.
 * - A drag of more than a few pixels suppresses the click so links don't open by accident.
 * - Respects prefers-reduced-motion (no auto-scroll, dragging still works).
 */
export function DragMarquee({
  children,
  speed = 40,
  reverse = false,
  className,
  trackClassName,
}: {
  children: ReactNode;
  speed?: number;
  reverse?: boolean;
  className?: string;
  trackClassName?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const state = useRef({ offset: 0, hovered: false, dragging: false, startX: 0, startOffset: 0, moved: 0 });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();

    const wrap = (v: number) => {
      const half = track.scrollWidth / 2;
      if (!half) return v;
      // keep offset in (-half, 0]
      let o = v % half;
      if (o > 0) o -= half;
      return o;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const s = state.current;
      if (!reduce && !s.hovered && !s.dragging && !document.hidden) {
        s.offset += (reverse ? 1 : -1) * speed * dt;
      }
      s.offset = wrap(s.offset);
      track.style.transform = `translate3d(${s.offset}px,0,0)`;
      raf = requestAnimationFrame(tick);
    };
    // Reverse rows start half-way so they don't all line up.
    if (reverse) state.current.offset = -track.scrollWidth / 4;
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [speed, reverse]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const s = state.current;
    s.dragging = true;
    s.startX = e.clientX;
    s.startOffset = s.offset;
    s.moved = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - s.startX;
    s.moved = Math.max(s.moved, Math.abs(dx));
    // Only capture once it's clearly a horizontal drag, so plain clicks keep working.
    if (s.moved > 4 && !wrapRef.current?.hasPointerCapture(e.pointerId)) {
      wrapRef.current?.setPointerCapture(e.pointerId);
    }
    s.offset = s.startOffset + dx;
  };
  const endDrag = (e: React.PointerEvent) => {
    const s = state.current;
    s.dragging = false;
    if (wrapRef.current?.hasPointerCapture(e.pointerId)) wrapRef.current.releasePointerCapture(e.pointerId);
    if (e.pointerType !== "mouse") s.hovered = false;
  };

  return (
    <div
      ref={wrapRef}
      className={cn("cursor-grab select-none overflow-hidden touch-pan-y active:cursor-grabbing", className)}
      onMouseEnter={() => (state.current.hovered = true)}
      onMouseLeave={() => (state.current.hovered = false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (state.current.moved > 5) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div ref={trackRef} className={cn("flex w-max will-change-transform", trackClassName)}>
        {children}
        {children}
      </div>
    </div>
  );
}
