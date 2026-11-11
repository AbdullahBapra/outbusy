"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Kirby's speech-bubble scheduler. Callers *request* bubbles; the scheduler decides when
 * (and whether) to show them, so bubbles feel timely instead of random:
 *
 *  - Requests wait in a queue — they're delayed, never silently dropped, until the moment is
 *    right: panel closed, tab visible, visitor not busy, enough time since the last bubble.
 *  - Highest priority wins; each request expires if it can't be shown in time.
 *  - Spacing rules reset on navigation, so a new page always gets its own chance.
 *  - `onceKey`s are remembered for the visit, so the same bubble never repeats.
 *  - Dismissing (✕) snoozes bubbles for a while instead of turning them off for good.
 */

export type NudgeRequest<Mood extends string> = {
  /** Same id replaces an earlier queued request (e.g. a newer section). */
  id: string;
  text: string;
  /** Sent to the chat when the bubble is clicked (AI mode). */
  prompt?: string;
  mood: Mood;
  /** Higher shows first. */
  priority: number;
  /** Skips spacing limits and only waits for typing to stop (help / exit bubbles). */
  urgent?: boolean;
  /** Remembered for the visit once shown, so this bubble never repeats. */
  onceKey?: string;
  /** How long the request may wait for a good moment. Default 30s. */
  ttlMs?: number;
};

export type Bubble = { id: string; text: string; prompt?: string };

const SEEN_KEY = "kirby-bubbles-seen";
const SNOOZE_KEY = "kirby-bubbles-snoozed-until";
const SPACING_MS = 15_000;
const MAX_PER_PAGE = 3;
/** How long a bubble stays up (paused while hovered/focused). Exported for the timer bar. */
export const BUBBLE_VISIBLE_MS = 8_000;
const SNOOZE_MS = 15 * 60_000;
const TICK_MS = 500;

const debug = (...args: unknown[]) => {
  if (process.env.NODE_ENV === "development") console.debug("[kirby bubbles]", ...args);
};

function readSeen(): string[] {
  try {
    return JSON.parse(sessionStorage.getItem(SEEN_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function useNudges<Mood extends string>(opts: {
  pathname: string;
  /** False while the panel is open or after the visitor has converted. */
  canShow: () => boolean;
  /** "typing-only" = the visitor is typing/watching a video; "any" also counts recent clicks/selection. */
  isBusy: (level: "any" | "typing-only") => boolean;
  /** Called when a bubble appears (set Kirby's mood, play a sound…). */
  onShow: (mood: Mood) => void;
}) {
  const [bubble, setBubble] = useState<Bubble | null>(null);
  const queue = useRef(new Map<string, NudgeRequest<Mood> & { expires: number }>());
  const page = useRef({ shown: 0, lastShownAt: 0 });
  const hovering = useRef(false);
  const hideAt = useRef(0);
  /** Time left on the visible bubble when hovering paused it. */
  const remaining = useRef(0);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  const request = useCallback((req: NudgeRequest<Mood>) => {
    if (req.onceKey && readSeen().includes(req.onceKey)) return debug("skip (already seen):", req.id);
    queue.current.set(req.id, { ...req, expires: Date.now() + (req.ttlMs ?? 30_000) });
    debug("queued:", req.id);
  }, []);

  const cancel = useCallback((id: string) => {
    queue.current.delete(id);
  }, []);

  /** Hide the current bubble (e.g. it was clicked). */
  const hide = useCallback(() => setBubble(null), []);

  /** ✕: hide and snooze all bubbles for a while. */
  const dismiss = useCallback(() => {
    setBubble(null);
    queue.current.clear();
    try {
      sessionStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
    } catch {}
  }, []);

  /** Hover/focus pauses the countdown exactly (the CSS timer bar pauses with it). */
  const setHovering = useCallback((on: boolean) => {
    if (on === hovering.current) return;
    hovering.current = on;
    if (on) remaining.current = Math.max(0, hideAt.current - Date.now());
    else hideAt.current = Date.now() + Math.max(remaining.current, 1500); // at least a moment to move away
  }, []);

  // A new page gets a fresh allowance; requests meant for the old page are dropped.
  useEffect(() => {
    queue.current.clear();
    page.current = { shown: 0, lastShownAt: 0 };
  }, [opts.pathname]);

  // The scheduler loop.
  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      const { canShow, isBusy, onShow } = optsRef.current;

      // Auto-hide the visible bubble (never while hovered).
      setBubble((current) => (current && !hovering.current && now >= hideAt.current ? null : current));

      for (const [id, r] of queue.current) if (now > r.expires) queue.current.delete(id);
      if (queue.current.size === 0) return;

      let snoozedUntil = 0;
      try {
        snoozedUntil = Number(sessionStorage.getItem(SNOOZE_KEY)) || 0;
      } catch {}
      if (now < snoozedUntil || document.hidden || !canShow()) return;

      const next = [...queue.current.values()].sort((a, b) => b.priority - a.priority)[0];
      if (isBusy(next.urgent ? "typing-only" : "any")) return;
      if (!next.urgent) {
        if (page.current.shown >= MAX_PER_PAGE) return;
        if (now - page.current.lastShownAt < SPACING_MS) return;
      }

      queue.current.delete(next.id);
      if (next.onceKey) {
        const seen = readSeen();
        if (seen.includes(next.onceKey)) return;
        try {
          sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen, next.onceKey].slice(-100)));
        } catch {}
      }
      page.current = { shown: page.current.shown + 1, lastShownAt: now };
      hideAt.current = now + BUBBLE_VISIBLE_MS;
      hovering.current = false;
      setBubble({ id: next.id, text: next.text, prompt: next.prompt });
      onShow(next.mood);
      debug("shown:", next.id);
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  return { bubble, request, cancel, hide, dismiss, setHovering };
}
