"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface AccentHighlightProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

// The accent word/phrase in a heading ("Behind Your Growth", "Leading Brands", ...).
//
// Premium gradient-type treatment instead of a drawn shape behind the text (underlines,
// boxes and marker strokes all looked cheap next to the heading type):
//   - the text itself is filled with a gradient built from the caller's own text color
//     (brand blue in light mode, brand yellow in dark / on dark cards), running into a
//     lighter tint of that same color, so it always matches whatever color class the
//     caller passes and still reads as brand blue/yellow;
//   - a soft colored glow lifts it off the page;
//   - a single light sheen sweeps across it once when it scrolls into view;
//   - a small four-point sparkle finishes the phrase.
// No measuring, no per-line boxes: it wraps naturally with the heading and can never
// overlap the lines above/below. Falls back to the plain colored text on browsers
// without background-clip:text / color-mix (see .accent-gradient in globals.css).
export default function AccentHighlight({ children, className = "", delay = 0.35 }: AccentHighlightProps) {
  return (
    <span className={`accent-wrap relative inline-block ${className}`}>
      <motion.span
        className="accent-gradient"
        initial={{ backgroundPosition: "135% 0, 0 0" }}
        whileInView={{ backgroundPosition: "-35% 0, 0 0" }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.span>
      {/* U+2060 word-joiner keeps the sparkle glued to the last word instead of orphaning onto its own line. */}
      {"\u2060"}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="accent-sparkle"
        initial={{ scale: 0, rotate: -60, opacity: 0 }}
        whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 14, delay: delay + 0.9 }}
      >
        <path d="M12 0C12.6 7 17 11.4 24 12c-7 .6-11.4 5-12 12-.6-7-5-11.4-12-12C7 11.4 11.4 7 12 0Z" fill="currentColor" />
      </motion.svg>
    </span>
  );
}
