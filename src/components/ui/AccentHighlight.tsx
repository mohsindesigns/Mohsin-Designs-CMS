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

// Deterministic pseudo-random in [0, 1), so a line always gets the same stroke shape
// across re-measures (resize, font load) instead of jittering.
function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

// The accent word/phrase in a heading ("Best Digital Marketing Agency", "Leading
// Brands", ...): a dry-brush highlighter swipe behind the text.
//
// The stroke is a plain slightly-skewed band; what makes it read as paint instead of a
// box is the SVG filter it goes through:
//   1. a low-frequency turbulence displacement roughens the outline organically, and
//   2. a high-frequency, horizontally-stretched turbulence becomes an alpha mask, which
//      leaves the thin streaky gaps a dry bristle brush leaves along the stroke.
// (The earlier attempts drew the roughness into the outline as many random points,
// which just looks like a scribble.)
//
// Colour comes from --accent-brush (see globals.css): brand yellow behind the blue text
// in light mode, brand blue behind the yellow text in dark mode / on dark cards - the
// two brand colours always swap, so the text never sits on its own colour. In light mode
// it multiplies into the page like ink instead of covering the letters.
//
// One stroke per visual line, measured from the inner inline text span via
// getClientRects() (the outer wrapper is inline-block and returns a single box), so
// wrapped headings get a stroke per line and no blank space over a short last line.
// Only the reveal (clip-path wipe left -> right) is driven by framer-motion.
export default function AccentHighlight({ children, className = "", delay = 0.3 }: AccentHighlightProps) {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [rects, setRects] = useState<LineRect[]>([]);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

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
        // Zero-width fragments (a trailing wrapped space) would draw a stray mark.
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
      {rects.length > 0 && (
        <svg aria-hidden="true" width="0" height="0" className="absolute pointer-events-none">
          <defs>
            {[0, 1, 2].map((v) => (
              <filter
                key={v}
                id={`${uid}-brush-${v}`}
                x="-5%"
                y="-40%"
                width="110%"
                height="180%"
                colorInterpolationFilters="sRGB"
              >
                <feTurbulence type="fractalNoise" baseFrequency="0.035 0.09" numOctaves="2" seed={4 + v * 7} result="edge" />
                <feDisplacementMap in="SourceGraphic" in2="edge" scale="9" xChannelSelector="R" yChannelSelector="G" result="rough" />
                <feTurbulence type="fractalNoise" baseFrequency="0.006 0.9" numOctaves="2" seed={11 + v * 5} result="streak" />
                <feColorMatrix
                  in="streak"
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  3 0 0 0 -0.6"
                  result="streakAlpha"
                />
                <feComposite in="rough" in2="streakAlpha" operator="in" result="bristled" />
                {/* Uneven pigment: slow low-frequency noise varies how dense the paint is along the stroke. */}
                <feTurbulence type="fractalNoise" baseFrequency="0.011 0.04" numOctaves="2" seed={2 + v * 9} result="density" />
                <feColorMatrix
                  in="density"
                  type="matrix"
                  values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 0.35"
                  result="densityAlpha"
                />
                <feComposite in="bristled" in2="densityAlpha" operator="in" />
              </filter>
            ))}
          </defs>
        </svg>
      )}

      {rects.map((r, i) => {
        const w = r.width + Math.max(6, r.height * 0.12);
        const h = r.height * 0.6;
        const skew = seededRand(i * 5.3 + 1) * 6;
        return (
          <motion.svg
            key={i}
            aria-hidden="true"
            className="accent-brush pointer-events-none absolute -z-10 overflow-visible"
            style={{
              left: r.left - Math.max(3, r.height * 0.06),
              top: r.top + r.height * 0.4,
              width: w,
              height: h,
              rotate: (seededRand(i * 3.1 + 2) - 0.5) * 1.2,
              transformOrigin: "0% 50%",
            }}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            initial={{ clipPath: "inset(-30% 100% -30% -5%)" }}
            whileInView={{ clipPath: "inset(-30% -5% -30% -5%)" }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: delay + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <g filter={`url(#${uid}-brush-${i % 3})`} fill="currentColor">
              {/* main stroke */}
              <path d={`M ${skew} ${h * 0.12} L ${w} 0 L ${w - skew} ${h} L 0 ${h * 0.92} Z`} />
              {/* second, shorter pass laid slightly higher: where two strokes overlap the paint builds up denser */}
              <path
                opacity="0.55"
                d={`M ${w * 0.04} ${h * 0.02} L ${w * 0.93} ${-h * 0.04} L ${w * 0.9} ${h * 0.62} L ${w * 0.02} ${h * 0.58} Z`}
              />
              {/* lift-off bristles: thin dry streaks trailing past the end of the stroke, and a couple at the start */}
              {[0.14, 0.3, 0.5, 0.68, 0.84].map((t, k) => {
                const len = w * (0.012 + seededRand(i * 7.7 + k) * 0.03);
                return <rect key={k} x={w - 1} y={h * t} width={len} height={Math.max(1.2, h * 0.045)} rx="1" />;
              })}
              {[0.3, 0.62, 0.8].map((t, k) => {
                const len = w * (0.008 + seededRand(i * 4.1 + k + 9) * 0.02);
                return <rect key={"l" + k} x={-len} y={h * t} width={len + 2} height={Math.max(1.2, h * 0.04)} rx="1" />;
              })}
            </g>
          </motion.svg>
        );
      })}

      <span ref={textRef} className="accent-text relative">
        {children}
      </span>
    </span>
  );
}
