"use client";

import { useCallback, useEffect, useState } from "react";
import type { AnimationName } from "@/components/avatar/kirby";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** Whole-body moves layered on top of Kirby's facial expressions (CSS in globals.css). */
export type Gesture = "jump" | "shake" | "yawn" | "peek";

/** Entering one of these moods triggers a gesture once. */
const GESTURE_FOR_MOOD: Partial<Record<AnimationName, Gesture>> = {
  celebrate: "jump",
  confused: "shake",
  drowsy: "yawn",
};

const PEEKED_KEY = "kirby-peeked";

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Peek in from the screen edge only on the first page of a visit. */
function firstPeek(): Gesture | null {
  if (prefersReducedMotion()) return null;
  try {
    return sessionStorage.getItem(PEEKED_KEY) ? null : "peek";
  } catch {
    return null;
  }
}

/**
 * Returns the gesture to play right now (or null). Apply `kirby-g-<gesture>` as a class and
 * call `onGestureEnd` from `onAnimationEnd` so the same gesture can play again later.
 */
export function useGesture(mood: AnimationName) {
  const [gesture, setGesture] = useState<Gesture | null>(firstPeek);
  const [prevMood, setPrevMood] = useState(mood);
  // With reduced motion the CSS plays no animation (and never ends), so skip gestures entirely.
  const reduced = usePrefersReducedMotion();

  // Adjust state while rendering when the mood changes (no effect needed).
  if (mood !== prevMood) {
    setPrevMood(mood);
    const next = GESTURE_FOR_MOOD[mood];
    if (next && !reduced && gesture !== "peek") setGesture(next);
  }

  useEffect(() => {
    try {
      sessionStorage.setItem(PEEKED_KEY, "1");
    } catch {}
  }, []);

  const onGestureEnd = useCallback(() => setGesture(null), []);
  return { gesture, onGestureEnd };
}
