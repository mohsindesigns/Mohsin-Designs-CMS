"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface AccentHighlightProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

interface LineRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

// Marker-style accent for the cursive highlight word/phrase in headings, e.g.
// "Built to Grow <Your Business>". Used to be an SVG underline drawn under the last
// wrapped line (see git history), but a plain line under a phrase reads as flat and
// dated. This instead washes a soft, slightly rotated blob of the text's own color
// behind it - like a highlighter pen stroke.
//
// Renders one stroke per *visual line* via getClientRects() (same technique the old
// underline component used) rather than a single CSS-inset box behind the whole
// element. A naive inset box looked right for one-line phrases, but a `position:
// relative` inline element that wraps across multiple lines does not give an
// absolutely-positioned child a per-line containing block - Chromium resolves the
// inset against something closer to the union of the whole flow, so the "blob" came
// out as one huge, badly-placed rectangle blotting out the text entirely on any
// heading that wraps. Measuring each line's own rect and drawing a stroke per line
// sidesteps that and also happens to be more true to how an actual highlighter marks
// text (one pass per line).
//
// Also: only `scaleX` is driven by framer-motion here, never `opacity` - motion writes
// its animated value as an inline style, which beats a plain Tailwind class, so
// animating opacity up to 1 would silently blow away the intended low resting tint
// (opacity-[0.16]) the moment the reveal finished. Opacity stays a static class;
// motion only handles the "swipe" reveal.
export default function AccentHighlight({ children, className = "", delay = 0.45 }: AccentHighlightProps) {
  const spanRef = useRef<HTMLSpanElement>(null);
  const [rects, setRects] = useState<LineRect[]>([]);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    function measure() {
      if (!el) return;
      const clientRects = el.getClientRects();
      if (!clientRects.length) return;
      const parentRect = el.getBoundingClientRect();
      const next: LineRect[] = [];
      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
        next.push({
          left: r.left - parentRect.left,
          top: r.top - parentRect.top,
          width: r.width,
          height: r.height,
        });
      }
      setRects(next);
    }

    measure();
    window.addEventListener("resize", measure);
    let cancelled = false;
    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (!cancelled) measure();
      });
    }
    const t = setTimeout(measure, 350);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
      clearTimeout(t);
    };
  }, [children]);

  return (
    <span ref={spanRef} className={`relative inline-block ${className}`}>
      {rects.map((r, i) => (
        <motion.span
          key={i}
          aria-hidden="true"
          className="pointer-events-none absolute -z-10 -rotate-1 rounded-xl bg-current opacity-[0.16] dark:opacity-[0.22]"
          style={{
            left: r.left - 8,
            top: r.top - 3,
            width: r.width + 16,
            height: r.height + 6,
            transformOrigin: "0% 50%",
          }}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
      <span className="relative">{children}</span>
    </span>
  );
}
