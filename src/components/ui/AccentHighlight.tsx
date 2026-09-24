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

// Deterministic pseudo-random in [0, 1), seeded so the same line always gets the same
// "hand-drawn" wobble across re-measures (resize, font load) instead of jittering.
function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// A real highlighter pen does not wash the whole line box - it lays a band across the
// body of the letters (roughly x-height), a bit shorter than the line, with ragged ends
// and an uneven top/bottom edge where the felt tip skipped. Cursive fonts have very tall
// line boxes relative to their glyphs, so covering the full box (what this used to do)
// looked huge. So the stroke is sized from the line's height: a band ~half the height,
// sitting on the lower-middle of the line where the letter bodies are.
function bandFor(height: number) {
  return {
    padX: Math.max(3, height * 0.05),
    top: height * 0.34,
    height: height * 0.5,
  };
}

// Polygon for one rough marker stroke of size w x h. Top and bottom edges are many short
// segments with small vertical wobble (plus a slow drift so the stroke isn't ruler-
// straight), and the left/right ends are torn zig-zags instead of clean vertical cuts.
// Everything is seeded so a line always renders the same wobble across re-measures.
function roughStrokePath(w: number, h: number, seed: number) {
  const j = (n: number, mag: number) => (seededRand(seed * 13.7 + n * 5.17) - 0.5) * 2 * mag;
  const wob = Math.max(0.8, h * 0.07);
  const steps = Math.max(6, Math.round(w / 22));
  const driftTop = j(101, h * 0.06);
  const driftBottom = j(102, h * 0.06);
  const endJag = Math.max(1.5, h * 0.12);

  const pts: string[] = [];
  const push = (x: number, y: number) => pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);

  // Top edge, left -> right
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    push(t * w + (i === 0 || i === steps ? 0 : j(i, w * 0.008)), wob + driftTop * t + j(200 + i, wob));
  }
  // Right end, top -> bottom (torn)
  const rightSegs = 4;
  for (let k = 1; k < rightSegs; k++) {
    const t = k / rightSegs;
    push(w - Math.abs(j(300 + k, endJag)) * (k % 2 ? 1.6 : 0.4), wob + (h - 2 * wob) * t);
  }
  // Bottom edge, right -> left
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    push(t * w + (i === 0 || i === steps ? 0 : j(400 + i, w * 0.008)), h - wob + driftBottom * t + j(500 + i, wob));
  }
  // Left end, bottom -> top (torn)
  for (let k = rightSegs - 1; k >= 1; k--) {
    const t = k / rightSegs;
    push(Math.abs(j(600 + k, endJag)) * (k % 2 ? 0.4 : 1.6), wob + (h - 2 * wob) * t);
  }
  return `M ${pts.join(" L ")} Z`;
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
        const rotate = (seededRand(seed * 3.7) - 0.5) * 1.6; // small per-line tilt
        const band = bandFor(r.height);
        const boxW = r.width + band.padX * 2;
        const boxH = band.height;
        const style = {
          left: r.left - band.padX,
          top: r.top + band.top,
          width: boxW,
          height: boxH,
          rotate,
          transformOrigin: "0% 50%",
        };
        const anim = {
          initial: { scaleX: 0 },
          whileInView: { scaleX: 1 },
          viewport: { once: true },
        };
        return (
          <span key={i} aria-hidden="true" className="pointer-events-none contents">
            {/* Main pass */}
            <motion.svg
              className="absolute -z-10 opacity-[0.3] dark:opacity-[0.34]"
              style={style}
              viewBox={`0 0 ${boxW} ${boxH}`}
              preserveAspectRatio="none"
              {...anim}
              transition={{ duration: 0.5, delay: delay + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d={roughStrokePath(boxW, boxH, seed)} fill="currentColor" />
            </motion.svg>
            {/* Second, thinner overlapping pass - where two marker strokes overlap the
                ink builds up darker, which is a big part of what reads as "real". */}
            <motion.svg
              className="absolute -z-10 opacity-[0.16] dark:opacity-[0.2]"
              style={{
                ...style,
                left: r.left - band.padX * 0.4,
                top: r.top + band.top + boxH * 0.22,
                width: boxW * 0.9,
                height: boxH * 0.62,
                rotate: rotate * -1.4,
              }}
              viewBox={`0 0 ${boxW * 0.9} ${boxH * 0.62}`}
              preserveAspectRatio="none"
              {...anim}
              transition={{ duration: 0.45, delay: delay + 0.12 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <path d={roughStrokePath(boxW * 0.9, boxH * 0.62, seed + 7)} fill="currentColor" />
            </motion.svg>
          </span>
        );
      })}
      <span ref={textRef} className="relative">
        {children}
      </span>
    </span>
  );
}
