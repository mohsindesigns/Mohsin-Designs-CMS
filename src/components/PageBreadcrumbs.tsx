"use client";

import React from "react";
import Link from "@/components/ui/Link";
import { usePathname } from "next/navigation";
import { buildPageBreadcrumbs, type BreadcrumbItem } from "@/lib/breadcrumbs";

interface PageBreadcrumbsProps {
  /** CMS page doc (slug/title/template/content/seo). Trail is derived from it. */
  page?: any;
  /** Explicit trail; wins over `page` (used by service/blog detail pages). */
  items?: BreadcrumbItem[];
  /**"onDark" for heroes with a dark photo/solid background. */
  tone?: "default" | "onDark";
  align?: "left" | "center";
  className?: string;
}

/**
 * The one breadcrumb used by every template hero, service page and blog post.
 * Renders nothing on the homepage (a lone"Home" crumb is noise).
 */
export default function PageBreadcrumbs({
  page,
  items,
  tone = "default",
  align = "left",
  className = "",
}: PageBreadcrumbsProps) {
  const pathname = usePathname();
  const trail = items && items.length > 0 ? items : buildPageBreadcrumbs(page, pathname || "");

  if (trail.length <= 1) return null;

  const onDark = tone ==="onDark";
  const wrapper = onDark
    ? "inline-flex max-w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md text-white"
    : "flex text-brand-zinc-500 dark:text-zinc-400";
  const linkColor = onDark
    ? "text-white/80 hover:text-white"
    : "hover:text-brand-blue dark:hover:text-brand-yellow";
  const currentColor = onDark ? "text-white font-black" : "text-brand-blue dark:text-brand-yellow font-black";
  const sepColor = onDark ? "text-white/40" : "text-brand-zinc-300 dark:text-zinc-600";

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${wrapper} ${align ==="center" ? "justify-center" : ""} select-none ${className}`}
    >
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider ${align ==="center" ? "justify-center" : ""}`}>
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1;
          return (
            <li key={`${item.url}-${index}`} className="flex min-w-0 items-center gap-2">
              {index > 0 && (
                <span aria-hidden="true" className={sepColor}>/</span>
              )}
              {isLast ? (
                <span aria-current="page" className={`${currentColor} truncate max-w-[220px] sm:max-w-md`}>
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className={`${linkColor} transition-colors`}>
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
