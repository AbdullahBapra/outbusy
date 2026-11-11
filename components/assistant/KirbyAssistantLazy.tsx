"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const KirbyAssistant = dynamic(() => import("./KirbyAssistant").then((m) => m.KirbyAssistant), { ssr: false });

/**
 * Mounts the Kirby assistant once the browser is idle, so the avatar engine never
 * competes with the page's first paint.
 */
export function KirbyAssistantLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const show = () => setReady(true);
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(show, { timeout: 2500 });
      return () => window.cancelIdleCallback(id);
    }
    const t = setTimeout(show, 1200);
    return () => clearTimeout(t);
  }, []);

  return ready ? <KirbyAssistant /> : null;
}
