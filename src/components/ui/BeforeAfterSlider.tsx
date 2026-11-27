"use client";

import { useCallback, useId, useRef, useState } from "react";
import { GripVertical } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

/**
 * A draggable before/after comparison slider. Reveals more of the "after" image as the divider
 * moves right (width-based clip via a simple absolute-positioned overlay, no clip-path layout
 * thrash). Pointer events cover mouse + touch; arrow keys nudge the divider 2% per press for
 * keyboard users. Reusable - not tied to the Portfolio feature.
 */
export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Before",
  afterLabel = "After",
  className = "",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50); // % from the left where the divider sits
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const sliderId = useId();

  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return; // not laid out yet (e.g. display:none ancestor) - avoid NaN
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(pct));
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updateFromClientX(e.clientX);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    // Only meaningful if this pointer actually has capture; releasing an uncaptured
    // pointer throws in some browsers, so guard it rather than letting onPointerLeave/
    // onPointerCancel (which reuse this handler) crash when capture was never set.
    try { (e.target as HTMLElement).releasePointerCapture?.(e.pointerId); } catch {}
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setPosition((p) => clamp(p - 2));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setPosition((p) => clamp(p + 2));
    } else if (e.key === "Home") {
      e.preventDefault();
      setPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setPosition(100);
    }
  };

  if (!beforeImage && !afterImage) return null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[4/3] sm:aspect-[16/10] select-none overflow-hidden rounded-[20px] sm:rounded-[28px] border border-brand-zinc-200 dark:border-white/10 bg-brand-zinc-100 dark:bg-[#0c0b18] touch-none ${className}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {/* Base layer: AFTER (full width, always visible underneath) */}
      <div className="absolute inset-0">
        {afterImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={afterImage} alt={afterLabel} className="h-full w-full object-cover pointer-events-none" draggable={false} />
        ) : (
          <div className="h-full w-full bg-brand-zinc-200 dark:bg-zinc-900" />
        )}
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-[13px] font-semibold text-white shadow-md backdrop-blur-sm">
          {afterLabel}
        </span>
      </div>

      {/* Overlay layer: BEFORE, full-size image clipped to the divider position via clip-path
          (not width-based) so the image is never re-measured/re-scaled on drag or resize. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)`, willChange: "clip-path" }}
      >
        {beforeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beforeImage} alt={beforeLabel} className="h-full w-full object-cover pointer-events-none" draggable={false} />
        ) : (
          <div className="h-full w-full bg-brand-zinc-300 dark:bg-zinc-800" />
        )}
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-black/70 px-3 py-1.5 text-[13px] font-semibold text-white shadow-md backdrop-blur-sm whitespace-nowrap">
          {beforeLabel}
        </span>
      </div>

      {/* Divider handle */}
      <div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.15)] cursor-ew-resize"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        <div
          role="slider"
          tabIndex={0}
          aria-label="Drag to compare before and after"
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${Math.round(position)}% before, ${Math.round(100 - position)}% after`}
          id={sliderId}
          onKeyDown={onKeyDown}
          className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize items-center justify-center rounded-full border-2 border-brand-blue dark:border-brand-yellow bg-white shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-blue dark:focus-visible:ring-brand-yellow transition-transform hover:scale-110 active:scale-95"
        >
          <GripVertical className="h-5 w-5 text-brand-blue dark:text-brand-dark" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
