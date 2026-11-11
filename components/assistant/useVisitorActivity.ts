"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** How long without any input before Kirby gets bored → drowsy → falls asleep. */
const BORED_MS = 20_000;
const DROWSY_MS = 40_000;
const ASLEEP_MS = 70_000;
/** How long the "waking up" stretch lasts after the visitor comes back. */
const WAKE_MS = 2_400;
/** Scroll speed (px/ms) above which the visitor is skimming rather than reading. */
const FAST_SCROLL = 1.2;

export type Attention = "active" | "bored" | "drowsy" | "asleep" | "waking";
/** still: not scrolling · reading: slow scroll down · fast: skimming · up: scrolling back up */
export type ScrollMode = "still" | "reading" | "fast" | "up";
export type Milestone = 25 | 50 | 75 | 100;

/**
 * Tracks how the visitor behaves on the page (pointer, keys, touch, tab visibility and
 * scroll speed/direction). Drives Kirby's ambient mood.
 */
export function useVisitorActivity() {
  const [attention, setAttention] = useState<Attention>("active");
  const [scrollMode, setScrollMode] = useState<ScrollMode>("still");
  const lastActive = useRef(0);
  const attentionRef = useRef<Attention>("active");

  useEffect(() => {
    let wakeTimer: ReturnType<typeof setTimeout> | undefined;
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    let lastScrollY = window.scrollY;
    let lastScrollT = performance.now();
    lastActive.current = Date.now();

    const set = (next: Attention) => {
      if (attentionRef.current === next) return;
      attentionRef.current = next;
      setAttention(next);
    };

    const onActivity = () => {
      lastActive.current = Date.now();
      const current = attentionRef.current;
      if (current === "asleep" || current === "drowsy") {
        set("waking");
        clearTimeout(wakeTimer);
        wakeTimer = setTimeout(() => set("active"), WAKE_MS);
      } else if (current === "bored") {
        set("active");
      }
    };

    const onScroll = () => {
      onActivity();
      const now = performance.now();
      const dy = window.scrollY - lastScrollY;
      const speed = Math.abs(dy) / Math.max(now - lastScrollT, 1);
      lastScrollY = window.scrollY;
      lastScrollT = now;
      if (Math.abs(dy) > 2) setScrollMode(dy < 0 ? "up" : speed > FAST_SCROLL ? "fast" : "reading");
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setScrollMode("still"), 650);
    };

    const onVisibility = () => {
      if (document.hidden) set("asleep");
      else onActivity();
    };

    // Re-evaluate idleness every second (cheap; no work when nothing changes).
    const tick = setInterval(() => {
      if (document.hidden || attentionRef.current === "waking") return;
      const idle = Date.now() - lastActive.current;
      set(idle > ASLEEP_MS ? "asleep" : idle > DROWSY_MS ? "drowsy" : idle > BORED_MS ? "bored" : "active");
    }, 1000);

    const opts = { passive: true } as const;
    window.addEventListener("pointermove", onActivity, opts);
    window.addEventListener("pointerdown", onActivity, opts);
    window.addEventListener("keydown", onActivity, opts);
    window.addEventListener("touchstart", onActivity, opts);
    window.addEventListener("scroll", onScroll, opts);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      clearInterval(tick);
      clearTimeout(wakeTimer);
      clearTimeout(scrollTimer);
      window.removeEventListener("pointermove", onActivity);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("touchstart", onActivity);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { attention, scrollMode };
}

/**
 * Calls `onMilestone` once per page when the visitor first scrolls past 25 / 50 / 75 %
 * and reaches the end. Resets on client-side navigation.
 */
export function useScrollMilestones(onMilestone: (m: Milestone) => void) {
  const pathname = usePathname();
  const cb = useRef(onMilestone);

  useEffect(() => {
    cb.current = onMilestone;
  });

  useEffect(() => {
    const reached = new Set<Milestone>();
    let raf = 0;
    const check = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max < window.innerHeight) return; // too short a page to be interesting
      const pct = (window.scrollY / max) * 100;
      // Announce only the deepest new milestone (a fast scroll can pass several at once).
      const deepest = ([100, 75, 50, 25] as const).find((m) => pct >= (m === 100 ? 98 : m));
      if (!deepest || reached.has(deepest)) return;
      ([25, 50, 75, 100] as const).forEach((m) => m <= deepest && reached.add(m));
      cb.current(deepest);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pathname]);
}

/** A short-lived reaction (e.g. "confused" for 3s) layered on top of the ambient mood. */
export function useReaction<T extends string>() {
  const [reaction, setReaction] = useState<T | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const react = (mood: T, ms = 2500) => {
    clearTimeout(timer.current);
    setReaction(mood);
    timer.current = setTimeout(() => setReaction(null), ms);
  };

  const clear = () => {
    clearTimeout(timer.current);
    setReaction(null);
  };

  return { reaction, react, clear };
}
