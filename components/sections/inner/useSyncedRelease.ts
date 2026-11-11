"use client";

import { useEffect, type RefObject } from "react";

/**
 * Makes a pinned heading and a pinned card stack "let go" at the same scroll position,
 * so they scroll away together instead of the cards sliding up under the heading.
 *
 * A sticky element is released when its container's bottom reaches it. The heading's
 * container normally ends later than the cards' container, so we pull the heading's
 * container bottom up by exactly the difference (negative margin on the card area, set
 * as `--release` on the section) and give that space back as section padding.
 *
 * `release()` returns the difference in px for the current layout.
 */
export function useSyncedRelease(sectionRef: RefObject<HTMLElement | null>, release: () => number, deps: unknown[] = []) {
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const update = () => {
      const px = window.innerWidth >= 992 ? Math.max(0, Math.round(release())) : 0;
      section.style.setProperty("--release", `${px}px`);
    };
    update();
    document.fonts?.ready.then(update);
    const ro = new ResizeObserver(update);
    ro.observe(section);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
