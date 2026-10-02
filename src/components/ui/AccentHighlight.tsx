"use client";

import type { ReactNode } from "react";
// import { useEffect, useId, useRef, useState } from "react";
// import { motion } from "framer-motion";

interface AccentHighlightProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

/*
// [Paint brush heading accent stroke commented out per request]
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
*/

// The accent word/phrase in a heading ("Best Digital Marketing Agency", "Leading
// Brands", ...): dry-brush highlighter swipe commented out per request.
export default function AccentHighlight({ children, className = "", delay = 0.3 }: AccentHighlightProps) {
  /*
  --- Paint-brush SVG stroke effect commented out ---
  const wrapRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [rects, setRects] = useState<LineRect[]>([]);
  const [solid, setSolid] = useState(false);
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");

  useEffect(() => {
    const wrap = wrapRef.current;
    const text = textRef.current;
    if (!wrap || !text) return;

    function measure() {
      if (!wrap || !text) return;
      setSolid(!!wrap.closest(".cta-banner-card, .on-dark-surface, .cta-on-dark"));
      const clientRects = text.getClientRects();
      if (!clientRects.length) return;
      const wrapRect = wrap.getBoundingClientRect();
      const next: LineRect[] = [];
      for (let i = 0; i < clientRects.length; i++) {
        const r = clientRects[i];
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

    let cancelled = false;
    const safeMeasure = () => {
      if (!cancelled) measure();
    };

    measure();

    const fonts: any = typeof document !== "undefined" ? (document as any).fonts : null;
    if (fonts?.load) {
      try {
        const cs = getComputedStyle(text);
        const family = cs.fontFamily.split(",")[0].trim();
        fonts.load(`${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${family}`).then(safeMeasure, safeMeasure);
      } catch {}
      fonts.ready?.then(safeMeasure);
    }
    const onFontsDone = () => safeMeasure();
    fonts?.addEventListener?.("loadingdone", onFontsDone);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => safeMeasure());
      ro.observe(wrap);
      if (wrap.parentElement) ro.observe(wrap.parentElement);
    }
    window.addEventListener("resize", safeMeasure);
    window.addEventListener("orientationchange", safeMeasure);

    const timers = [350, 1200, 2500].map((ms) => setTimeout(safeMeasure, ms));

    return () => {
      cancelled = true;
      ro?.disconnect();
      fonts?.removeEventListener?.("loadingdone", onFontsDone);
      window.removeEventListener("resize", safeMeasure);
      window.removeEventListener("orientationchange", safeMeasure);
      timers.forEach(clearTimeout);
    };
  }, [children]);
  */

  return (
    <span className={`relative inline-block ${className}`}>
      {/*
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
        const padX = solid ? Math.max(8, r.height * 0.2) : Math.max(6, r.height * 0.12);
        const w = r.width + padX;
        const h = solid ? r.height * 0.9 : r.height * 0.6;
        const skew = seededRand(i * 5.3 + 1) * (solid ? 8 : 6);
        return (
          <motion.svg
            key={i}
            aria-hidden="true"
            className="accent-brush pointer-events-none absolute -z-10 overflow-visible"
            style={{
              left: r.left - (solid ? padX / 2 : Math.max(3, r.height * 0.06)),
              top: r.top + r.height * (solid ? 0.06 : 0.4),
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
            {solid && (
              <rect x={w * 0.03} y={h * 0.12} width={w * 0.94} height={h * 0.76} rx={h * 0.14} fill="currentColor" />
            )}
            <g filter={`url(#${uid}-brush-${i % 3})`} fill="currentColor">
              <path d={`M ${skew} ${h * 0.12} L ${w} 0 L ${w - skew} ${h} L 0 ${h * 0.92} Z`} />
              <path
                opacity="0.55"
                d={`M ${w * 0.04} ${h * 0.02} L ${w * 0.93} ${-h * 0.04} L ${w * 0.9} ${h * 0.62} L ${w * 0.02} ${h * 0.58} Z`}
              />
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
      */}

      <span className="accent-text relative">
        {children}
      </span>
    </span>
  );
}
