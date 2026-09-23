"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface AccentUnderlineProps {
  children: ReactNode;
  /** Color + weight classes for the highlighted text itself (e.g. "text-brand-blue dark:text-brand-yellow font-cursive"). */
  className?: string;
  delay?: number;
}

/**
 * Wraps a highlighted heading phrase and draws the site's hand-drawn accent underline
 * beneath it, the same swoosh used everywhere else (scaleX reveal, static path).
 *
 * Unlike the old approach (an absolutely-positioned, `w-full` SVG sitting on the *outer*
 * `inline-block` span), this measures the span's actual rendered line boxes via
 * getClientRects() and positions the underline under the LAST line specifically. That
 * matters because when the highlighted phrase wraps onto 2+ lines (long headings on
 * narrow viewports), the outer span's bounding box is as wide as its widest line, so a
 * naive `w-full` underline stretched across that box and sat under the wrong line at the
 * wrong width - it never tracked what actually wrapped. Re-measures on resize and once
 * webfonts finish loading (a late font swap can shift line widths after first paint).
 */
export default function AccentUnderline({ children, className = "", delay = 0.45 }: AccentUnderlineProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [rect, setRect] = useState<{ left: number; width: number; top: number } | null>(null);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const rects = el.getClientRects();
      if (!rects.length) return;
      const last = rects[rects.length - 1];
      const parentRect = el.getBoundingClientRect();
      setRect({
        left: last.left - parentRect.left,
        width: last.width,
        top: last.bottom - parentRect.top,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    let cancelled = false;
    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    // Re-measure a beat after mount too, in case a parent's own entrance animation
    // (e.g. the heading's own fade/slide-in) changes layout after this effect first runs.
    const t = setTimeout(measure, 350);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [children]);

  return (
    <span ref={spanRef} className={`relative inline-block ${className}`}>
      {children}
      {rect && (
        <motion.svg
          className="pointer-events-none absolute h-3.5 overflow-visible"
          style={{ left: rect.left, top: rect.top - 5, width: rect.width, transformOrigin: "0% 50%" }}
          viewBox="0 0 100 10"
          preserveAspectRatio="none"
          aria-hidden="true"
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        >
          <path
            d="M2 7.2C24 2.6 54 2.2 77 3.6C87 4.3 94 5.6 98 7.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </motion.svg>
      )}
    </span>
  );
}
