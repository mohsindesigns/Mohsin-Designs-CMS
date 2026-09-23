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

const PAD = 10; // breathing room around the text the wobbly edge is allowed to roam into

// Deterministic pseudo-random in [0, 1), seeded so the same line always gets the same
// "hand-drawn" wobble across re-measures (resize, font load) instead of jittering.
function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A rectangle traced as if by hand: each of the 4 corners and each edge's midpoint is
// nudged a few px off its "true" position, then the 4 edges are drawn as quadratic
// curves through those midpoints instead of straight lines. That's what actually reads
// as a rough highlighter stroke - a uniform border-radius on an otherwise-crisp
// rectangle is still visibly a geometric shape at this size, a wavy hand-drawn outline
// isn't. Seeded per line so it's stable, not re-randomized on every remeasure.
function roughRectPath(w: number, h: number, seed: number) {
  const jitter = (n: number, mag: number) => (seededRand(seed + n * 7.31) - 0.5) * 2 * mag;
  const corner = (mag: number) => mag;
  const c = corner(4);
  const tl = { x: jitter(1, c), y: jitter(2, c) };
  const tr = { x: w + jitter(3, c), y: jitter(4, c) };
  const br = { x: w + jitter(5, c), y: h + jitter(6, c) };
  const bl = { x: jitter(7, c), y: h + jitter(8, c) };
  const topMid = { x: w / 2 + jitter(9, c), y: jitter(10, c * 1.5) };
  const rightMid = { x: w + jitter(11, c * 1.5), y: h / 2 + jitter(12, c) };
  const bottomMid = { x: w / 2 + jitter(13, c), y: h + jitter(14, c * 1.5) };
  const leftMid = { x: jitter(15, c * 1.5), y: h / 2 + jitter(16, c) };

  return [
    `M ${tl.x} ${tl.y}`,
    `Q ${topMid.x} ${topMid.y} ${tr.x} ${tr.y}`,
    `Q ${rightMid.x} ${rightMid.y} ${br.x} ${br.y}`,
    `Q ${bottomMid.x} ${bottomMid.y} ${bl.x} ${bl.y}`,
    `Q ${leftMid.x} ${leftMid.y} ${tl.x} ${tl.y}`,
    "Z",
  ].join(" ");
}

// Marker-style accent for the cursive highlight word/phrase in headings, e.g.
// "Built to Grow <Your Business>". Used to be an SVG underline drawn under the last
// wrapped line (see git history), but a plain line under a phrase reads as flat and
// dated. This instead washes a soft, slightly rotated, hand-drawn-edged blob of the
// text's own color behind it - like a highlighter pen stroke.
//
// Renders one stroke per *visual line* via getClientRects() (same technique the old
// underline component used) rather than a single CSS-inset box behind the whole
// element - measured on the INNER plain-inline text span, not the outer wrapper.
// The outer wrapper has to stay `inline-block` (so it participates correctly in the
// heading's own line flow as one unit), but `getClientRects()` on an inline-block
// itself returns its own single principal box - one rect, sized to the widest
// wrapped line, spanning the full height of every line combined. Measuring that
// instead of the real per-line fragments is exactly what produced one oversized box
// blotting past the text and leaving dead space over any short wrapped line (e.g. a
// short second line like "Agency" got a box as wide as the longer first line above
// it). The inner span is a plain `inline` element, which genuinely fragments into one
// DOMRect per visual line, so measuring THAT gives an honest per-line box.
//
// Also: only `scaleX` is driven by framer-motion here, never `opacity` - motion writes
// its animated value as an inline style, which beats a plain Tailwind class, so
// animating opacity up to 1 would silently blow away the intended low resting tint
// (opacity-[0.16]) the moment the reveal finished. Opacity stays a static class;
// motion only handles the "swipe" reveal.
export default function AccentHighlight({ children, className = "", delay = 0.45 }: AccentHighlightProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [rects, setRects] = useState<LineRect[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    function measure() {
      if (!wrap || !text) return;
      const clientRects = text.getClientRects();
      if (!clientRects.length) return;
      const wrapRect = wrap.getBoundingClientRect();
      const next: LineRect[] = [];
      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
        // Skip zero-width fragments (can happen for a trailing wrapped space) - they'd
        // otherwise draw a tiny stray mark past the end of the real text.
        if (r.width < 2 || r.height < 2) continue;
        next.push({
          left: r.left - wrapRect.left,
          top: r.top - wrapRect.top,
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
    <span ref={wrapRef} className={`relative inline-block ${className}`}>
      {rects.map((r, i) => {
        const seed = i + 1;
        const rotate = (seededRand(seed * 3.7) - 0.5) * 3; // ~ -1.5deg to 1.5deg, varies per line
        const boxW = r.width + PAD * 2;
        const boxH = r.height + PAD * 2;
        return (
          <motion.svg
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 opacity-[0.16] dark:opacity-[0.22]"
            style={{
              left: r.left - PAD,
              top: r.top - PAD,
              width: boxW,
              height: boxH,
              rotate,
              transformOrigin: "0% 50%",
            }}
            viewBox={`0 0 ${boxW} ${boxH}`}
            preserveAspectRatio="none"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <path d={roughRectPath(boxW, boxH, seed)} fill="currentColor" />
          </motion.svg>
        );
      })}
      <span ref={textRef} className="relative">
        {children}
      </span>
    </span>
  );
}
