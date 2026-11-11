type IconProps = { className?: string };

export function ArrowCircleIcon({
  className,
  circle = "#ffffff",
  arrow = "#00897a",
}: IconProps & { circle?: string; arrow?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill={circle} />
      <path
        d="M13 24h21m0 0-8.5-8.5M34 24l-8.5 8.5"
        stroke={arrow}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="m12 2.5 2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
      />
    </svg>
  );
}

/** Simple geometric mark — replace with your own logo. */
export function LogoMark({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="28" height="28" rx="9" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="16" cy="16" r="5.5" fill="#00efd4" />
    </svg>
  );
}

export function LinkedInIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11H3zM9.5 9.75h3.8v1.5h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1v5.46h-4v-4.84c0-1.16-.02-2.64-1.61-2.64-1.61 0-1.86 1.26-1.86 2.56v4.92h-4z"
      />
    </svg>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
    </svg>
  );
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function GitHubIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.1-1.46-1.1-1.46-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2z"
      /> 
    </svg>
  );
}

/** Line-art glyphs used on service / industry tiles (original drawings). */
export function TileGlyph({ index, className }: IconProps & { index: number }) {
  const shapes = [
    <path key="a" d="M6 30V14l12-8 12 8v16H6zm8 0v-9h8v9" />,
    <path key="b" d="M6 8h24v16H6zM12 30h12M18 24v6" />,
    <path key="c" d="M18 4l4 9 10 1-7.5 6.5L27 30l-9-5-9 5 2.5-9.5L4 14l10-1z" />,
    <path key="d" d="M4 18h6l3-8 5 16 4-11 2 3h8" />,
    <path key="e" d="M18 4a14 14 0 1 0 0 28 14 14 0 0 0 0-28zm0 0v28M4 18h28" />,
    <path key="f" d="M8 6h20v24H8zM13 12h10M13 18h10M13 24h6" />,
    <path key="g" d="M6 26l8-8 5 5 11-11M24 12h6v6" />,
    <path key="h" d="M10 14a8 8 0 0 1 16 0v4l3 6H7l3-6zM15 28a3 3 0 0 0 6 0" />,
  ];
  return (
    <svg className={className} viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {shapes[index % shapes.length]}
    </svg>
  );
}
