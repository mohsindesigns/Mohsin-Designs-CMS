"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
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

// Deterministic pseudo-random in [0, 1), seeded so the same line always gets the same
// "hand-drawn" wobble across re-measures (resize, font load) instead of jittering.
function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A highlighter pen lays one solid band across the body of the letters - not the whole
// line box (cursive/heading fonts have very tall line boxes, which made the old
// full-box version look huge) and not a scribble. The band covers roughly x-height plus
// a bit, so the ascenders/descenders poke out above and below it like on a real marker
// swipe. Sized from the line's own height so it scales with the font.
function bandFor(height: number) {
  return {
    padX: Math.max(4, height * 0.08),
    top: height * 0.33,
    height: height * 0.56,
  };
}

// One smooth marker stroke: a slightly wavy band with chisel-tip slanted ends. The
// roughness itself is NOT baked into this outline (many tiny random points just looks
// like a scribble) - the outline stays smooth and an SVG turbulence displacement filter
// (see the <filter> below) roughens the edges organically, like felt on paper.
function markerStrokePath(w: number, h: number, seed: number) {
  const j = (n: number, mag: number) => (seededRand(seed * 9.13 + n * 3.71) - 0.5) * 2 * mag;
  const slant = Math.min(h * 0.22, w * 0.25);
  const lean = j(1, 1) > 0 ? 1 : -1; // which way this line's tip is cut
  const topL = lean > 0 ? slant : 0;
  const botL = lean > 0 ? 0 : slant;
  const topR = lean > 0 ? w : w - slant;
  const botR = lean > 0 ? w - slant : w;
  const y0 = h * 0.06 + j(2, h * 0.03);
  const y1 = h * 0.94 + j(3, h * 0.03);
  const wave = h * 0.07;
  return [
    `M ${topL} ${y0}`,
    `Q ${w * 0.3} ${y0 + j(4, wave) - wave} ${w * 0.55} ${y0 + j(5, wave)}`,
    `T ${topR} ${y0 + j(6, wave)}`,
    `L ${botR} ${y1}`,
    `Q ${w * 0.65} ${y1 + j(7, wave) + wave} ${w * 0.4} ${y1 + j(8, wave)}`,
    `T ${botL} ${y1 + j(9, wave)}`,
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
  const filterId = "hl-rough-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");

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
        const rotate = (seededRand(seed * 3.7) - 0.5) * 1.4; // small per-line tilt
        const band = bandFor(r.height);
        const boxW = r.width + band.padX * 2;
        const boxH = band.height;
        return (
          <motion.svg
            key={i}
            aria-hidden="true"
            className="pointer-events-none absolute -z-10 overflow-visible opacity-[0.26] dark:opacity-[0.3]"
            style={{
              left: r.left - band.padX,
              top: r.top + band.top,
              width: boxW,
              height: boxH,
              rotate,
              transformOrigin: "0% 50%",
            }}
            viewBox={`0 0 ${boxW} ${boxH}`}
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <defs>
              <filter id={filterId + "-" + i} x="-10%" y="-40%" width="120%" height="180%">
                <feTurbulence type="fractalNoise" baseFrequency="0.028 0.11" numOctaves="2" seed={seed * 4 + 3} result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale={Math.max(4, boxH * 0.28)} xChannelSelector="R" yChannelSelector="G" />
              </filter>
            </defs>
            <path d={markerStrokePath(boxW, boxH, seed)} fill="currentColor" filter={`url(#${filterId}-${i})`} />
          </motion.svg>
        );
      })}
      <span ref={textRef} className="relative">
        {children}
      </span>
    </span>
  );
}
