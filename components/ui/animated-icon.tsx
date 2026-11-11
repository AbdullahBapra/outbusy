import { cn } from "@/lib/utils";
import { DynIcon } from "@/components/ui/dyn-icon";

/**
 * Animated line icons (animated WebP, black + teal on white, 160px) in public/icons/animated, keyed by
 * the lucide name used in the content files. Icons from Flaticon (free license, attribution in the footer),
 * converted from MP4: an animated image loops forever on its own, with no video-player limits or
 * decoder stalls. Add a name here once its file exists; anything missing falls back to the lucide icon.
 */
const ANIMATED = new Set([
  "Bot", "BookOpen", "Brain", "Building2", "Calculator", "ClipboardList", "Clock", "Download", "FileText", "Filter",
  "Globe", "GraduationCap", "Hammer", "Handshake", "Headphones", "Home", "LayoutDashboard", "LayoutTemplate", "LifeBuoy", "LineChart",
  "Mail", "Map", "Megaphone", "MessageCircle", "MessageSquare", "MessagesSquare", "Mic", "PhoneCall", "Plug", "Repeat", "Rocket", "Scale",
  "Search", "ShoppingCart", "Sparkles", "Stethoscope", "Target", "Timer", "UserPlus", "Users", "Workflow", "Wrench", "Zap",
]);

const fileFor = (name: string) => `/icons/animated/${name.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase()}.webp`;

export const hasAnimatedIcon = (name: string) => ANIMATED.has(name);

export function AnimatedIcon({ name, className, strokeWidth }: { name: string; className?: string; strokeWidth?: number }) {
  if (!ANIMATED.has(name)) return <DynIcon name={name} className={className} strokeWidth={strokeWidth} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- animated WebP must skip the image optimizer, which would flatten it to one frame
    <img
      src={fileFor(name)}
      alt=""
      aria-hidden="true"
      width={160}
      height={160}
      loading="lazy"
      decoding="async"
      draggable={false}
      // multiply drops the white background on white and mint surfaces
      className={cn("pointer-events-none flex-none select-none object-contain mix-blend-multiply", className)}
    />
  );
}
