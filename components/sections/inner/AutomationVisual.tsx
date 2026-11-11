import { cn } from "@/lib/utils";

/**
 * Animated "automation network" panel — trigger → AI → actions, with flowing lines.
 * Used wherever the layout calls for an image/video. Swap for real imagery any time.
 */
export function AutomationVisual({
  labels = ["Trigger", "AI Agent", "CRM", "Calendar", "Slack"],
  caption,
  className,
}: {
  labels?: string[];
  caption?: string;
  className?: string;
}) {
  const [input, core, ...outs] = labels;
  const outputs = outs.slice(0, 3);
  const ys = outputs.length === 1 ? [150] : outputs.length === 2 ? [95, 205] : [70, 150, 230];

  return (
    <div className={cn("relative isolate overflow-hidden rounded-[1.875rem] bg-[#040404]", className)}>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem]" />

      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <g stroke="#00efd4" strokeWidth="1.5" fill="none" opacity="0.85">
          <path d="M92 150 H170" className="flow-line" />
          {ys.map((y) => (
            <path key={y} d={`M230 150 C270 150 270 ${y} 300 ${y}`} className="flow-line" />
          ))}
        </g>
        {/* input node */}
        <rect x="18" y="128" width="74" height="44" rx="12" fill="#0f1f1d" stroke="#00efd4" strokeOpacity="0.5" />
        <text x="55" y="155" textAnchor="middle" fill="#fff" fontSize="11" fontFamily="inherit">{input}</text>
        {/* core node */}
        <circle cx="200" cy="150" r="32" fill="#040404" stroke="#00efd4" strokeWidth="2" />
        <circle cx="200" cy="150" r="32" fill="none" stroke="#00efd4" strokeOpacity="0.35" className="pulse-ring" />
        <text x="200" y="154" textAnchor="middle" fill="#00efd4" fontSize="10" fontWeight="700" fontFamily="inherit">{core}</text>
        {/* output nodes */}
        {outputs.map((o, i) => (
          <g key={o}>
            <rect x="300" y={ys[i] - 18} width="84" height="36" rx="10" fill="#0f1f1d" stroke="#00efd4" strokeOpacity="0.5" />
            <text x="342" y={ys[i] + 4} textAnchor="middle" fill="#fff" fontSize="10.5" fontFamily="inherit">{o}</text>
          </g>
        ))}
      </svg>

      {caption && (
        <p className="absolute inset-x-[1.6rem] bottom-[1.4rem] text-[1.125rem] font-light leading-[1.6rem] text-white/85 max-md:inset-x-3 max-md:bottom-3 max-md:rounded-xl max-md:bg-black/75 max-md:px-3 max-md:py-2 max-md:text-xs max-md:leading-snug max-md:backdrop-blur-sm">{caption}</p>
      )}
    </div>
  );
}
