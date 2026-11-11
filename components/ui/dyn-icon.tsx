import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/** Renders a lucide icon from its name (as stored in the content files). */
export function DynIcon({ name, className, strokeWidth = 1.5 }: { name: string; className?: string; strokeWidth?: number }) {
  const Icon = (Icons as unknown as Record<string, LucideIcon>)[name] ?? Icons.Sparkles;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
