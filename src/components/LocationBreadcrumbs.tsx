"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface LocationBreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function LocationBreadcrumbs({ items, className = "" }: LocationBreadcrumbsProps) {
  if (!items || items.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`w-full py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex items-center text-xs sm:text-sm text-slate-500 dark:text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-none ${className}`}
    >
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.url || index} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
              )}
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-none"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.url}
                  className="hover:text-primary dark:hover:text-yellow-400 transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 mr-0.5" />}
                  <span>{item.name}</span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
