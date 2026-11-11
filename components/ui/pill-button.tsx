import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowCircleIcon } from "@/components/icons";

type Variant = "teal" | "white" | "ghost";

/**
 * The one button used across the site: pill shape, arrow icon that turns on hover and a
 * colour fill that grows out of the arrow (see `.btn` in globals.css).
 * - Renders a link when `href` is given, otherwise a <button> (form submit or `onClick`).
 * - `size="sm"` for tight spots (header, dropdowns), `full` to span the container.
 */
export function PillButton({
  children,
  href,
  variant = "teal",
  size = "md",
  full = false,
  type = "button",
  onClick,
  disabled = false,
  className,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: "md" | "sm";
  full?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  const cls = cn(
    "btn",
    variant === "white" && "btn-white",
    variant === "ghost" && "btn-ghost",
    size === "sm" && "btn-sm",
    full && "btn-full",
    disabled && "pointer-events-none opacity-40",
    className,
  );
  const inner = (
    <>
      <span>{children}</span>
      <ArrowCircleIcon
        className="btn-icon"
        circle={variant === "teal" ? "#ffffff" : "#00efd4"}
        arrow={variant === "teal" ? "#00897a" : "#000000"}
      />
    </>
  );

  if (href === undefined && (type === "submit" || onClick)) {
    return (
      <button type={type} onClick={onClick} disabled={disabled} className={cls}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href ?? "/contact"} className={cls}>
      {inner}
    </Link>
  );
}
