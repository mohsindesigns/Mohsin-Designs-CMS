"use client";

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Loader2 } from "lucide-react";
import Link from "@/components/ui/Link";
import { withTrailingSlash } from "@/lib/url";

/**
 * THE button for the whole site. Do not hand-roll CTA buttons - use this.
 *
 * Look (all defined once in globals.css, "UNIVERSAL CTA BUTTON SYSTEM"):
 *   light theme -> brand blue pill, yellow icon chip
 *   dark theme  -> brand yellow pill, dark icon chip
 *   inside .cta-banner-card / .on-dark-surface it always uses the dark-theme look.
 *
 * Renders <Link> for internal paths, <a> for external/mailto/tel/#hash, <button> when no href.
 */

type Variant = "primary" | "secondary";
type Size = "sm" | "md" | "lg";

// Full literal class names on purpose: Tailwind only keeps classes it can see in source.
const VARIANT_CLASS: Record<Variant, string> = {
  primary: "btn-primary-cta",
  secondary: "btn-secondary-cta",
};
const SIZE_CLASS: Record<Size, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  /** Custom icon for the chip, or `false` for a text-only button. */
  icon?: ReactNode | false;
  fullWidth?: boolean;
  /** Shows a spinner in the chip and disables the button. */
  loading?: boolean;
  className?: string;
  children: ReactNode;
}

type LinkProps = CommonProps & { href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children" | "className">;
type NativeButtonProps = CommonProps & { href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className">;
export type CtaButtonProps = LinkProps | NativeButtonProps;

const isInternalPath = (href: string) => href.startsWith("/") && !href.startsWith("//");

export default function CtaButton(props: CtaButtonProps) {
  const { variant = "primary", size = "md", icon, fullWidth, loading, className = "", children, ...rest } = props;

  const classes = [VARIANT_CLASS[variant], SIZE_CLASS[size], fullWidth ? "w-full" : "", className]
    .filter(Boolean)
    .join("");

  const chip =
    loading ? (
      <span className="btn-icon" aria-hidden="true">
        <Loader2 className="animate-spin" />
      </span>
    ) : icon === false ? null : (
      <span className="btn-icon" aria-hidden="true">
        {icon ?? (variant ==="primary" ? <ArrowUpRight /> : <ArrowRight />)}
      </span>
    );

  const inner = (
    <>
      <span>{children}</span>
      {chip}
    </>
  );

  if ("href" in rest && typeof rest.href ==="string") {
    const { href, ...anchorRest } = rest as LinkProps;
    if (isInternalPath(href)) {
      return (
        <Link href={href} className={classes} {...anchorRest}>
          {inner}
        </Link>
      );
    }
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={withTrailingSlash(href)}
        className={classes}
        {...(external && (anchorRest as any).target ==="_blank" ? { rel: "noopener noreferrer" } : {})}
        {...anchorRest}
      >
        {inner}
      </a>
    );
  }

  const { type = "button", disabled, ...buttonRest } = rest as NativeButtonProps;
  return (
    <button type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={classes} {...buttonRest}>
      {inner}
    </button>
  );
}
