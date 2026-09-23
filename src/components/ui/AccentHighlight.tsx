"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

interface AccentHighlightProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// Marker-style accent for the cursive highlight word/phrase in headings, e.g.
// "Built to Grow <Your Business>". Used to be an SVG underline drawn under the last
// wrapped line (see git history), but a plain line under a phrase reads as flat and
// dated. This instead washes a soft, slightly rotated blob of the text's own color
// behind it - like a highlighter pen stroke - which also sidesteps the old underline's
// hardest problem for free: a highlighter naturally covers a whole wrapped phrase as
// one shape, so there's no need to measure individual wrapped lines the way the
// underline had to.
export default function AccentHighlight({ children, className = "", delay = 0.45 }: AccentHighlightProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-2.5 -inset-y-1.5 sm:-inset-x-3.5 sm:-inset-y-2 -z-10 -rotate-1 rounded-2xl bg-current opacity-[0.16] dark:opacity-[0.22]"
        style={{ transformOrigin: "0% 50%" }}
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="relative">{children}</span>
    </span>
  );
}
