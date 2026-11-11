"use client";

import { useCallback, useEffect, useRef } from "react";

/** How long after the visitor's last keystroke / click they still count as busy. */
const TYPING_GRACE_MS = 5_000;
const CLICK_GRACE_MS = 10_000;

const INTERACTIVE = "a[href], button, [role='button'], summary, input, select, textarea, label";
const isEditable = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.matches("input:not([type=hidden]):not([type=button]):not([type=submit]), textarea, select") || el.isContentEditable);

/**
 * Knows when the visitor is in the middle of something on the page, so Kirby never
 * interrupts: typing in a form, watching a video, just clicked something, or selecting text.
 * Activity inside the assistant widget (`ignore`) doesn't count.
 */
export function useCalm(ignore: React.RefObject<HTMLElement | null>) {
  const state = useRef({ lastKey: 0, lastClick: 0, fieldFocused: false, playing: new Set<HTMLMediaElement>() });

  useEffect(() => {
    const s = state.current;
    const outside = (el: EventTarget | null) => !(el instanceof Node && ignore.current?.contains(el));

    const onKeyDown = (e: KeyboardEvent) => {
      if (outside(e.target) && isEditable(e.target)) s.lastKey = Date.now();
    };
    const onPointerDown = (e: PointerEvent) => {
      if (outside(e.target) && (e.target as Element).closest?.(INTERACTIVE)) s.lastClick = Date.now();
    };
    const onFocusIn = (e: FocusEvent) => {
      s.fieldFocused = outside(e.target) && isEditable(e.target);
    };
    const onFocusOut = () => {
      s.fieldFocused = false;
    };
    // Media events don't bubble, so listen in the capture phase.
    const onPlay = (e: Event) => e.target instanceof HTMLMediaElement && !e.target.muted && s.playing.add(e.target);
    const onStop = (e: Event) => e.target instanceof HTMLMediaElement && s.playing.delete(e.target);

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("play", onPlay, true);
    document.addEventListener("pause", onStop, true);
    document.addEventListener("ended", onStop, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("play", onPlay, true);
      document.removeEventListener("pause", onStop, true);
      document.removeEventListener("ended", onStop, true);
      s.playing.clear();
    };
  }, [ignore]);

  /**
   * Whether now is a bad moment to interrupt. `"typing-only"` ignores recent clicks and text
   * selection (for urgent, helpful bubbles such as "something not working?").
   */
  const isBusy = useCallback((level: "any" | "typing-only" = "any") => {
    const s = state.current;
    const now = Date.now();
    if (s.fieldFocused || now - s.lastKey < TYPING_GRACE_MS || s.playing.size > 0) return true;
    if (level === "typing-only") return false;
    if (now - s.lastClick < CLICK_GRACE_MS) return true;
    return Boolean(document.getSelection()?.toString().trim());
  }, []);

  return { isBusy };
}
