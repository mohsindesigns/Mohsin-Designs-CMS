"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Play, X, Film } from "lucide-react";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import { parseVideoEmbed, youtubeThumbnail } from "@/lib/videoEmbed";

type VideoType = "upload" | "embed" | "url";

interface TestimonialItem {
  name?: string;
  role?: string;
  avatar?: string;
  thumbnail?: string;
  videoType?: VideoType;
  videoUrl?: string;
}

// The admin picks a source type per video, but a YouTube/Vimeo link pasted into the
// "Direct URL" (or "Upload") field would otherwise be fed to a <video> tag and simply
// never play. Trust the link itself: if it is a recognised YouTube/Vimeo URL it is an
// embed, whatever tab it was pasted in.
function resolveSource(item: TestimonialItem): { mode: "embed" | "file" | "invalid"; embedUrl: string } {
  const url = (item.videoUrl || "").trim();
  if (!url) return { mode: "invalid", embedUrl: "" };
  const embed = parseVideoEmbed(url);
  if (embed.embedUrl) return { mode: "embed", embedUrl: embed.embedUrl };
  // Chose "embed" but the link isn't a supported host -> nothing safe to play.
  if (item.videoType === "embed") return { mode: "invalid", embedUrl: "" };
  return { mode: "file", embedUrl: "" };
}

function cardThumbnail(item: TestimonialItem): { kind: "image" | "video" | "none"; src: string } {
  if (item.thumbnail) return { kind: "image", src: item.thumbnail };
  const source = resolveSource(item);
  if (source.mode === "embed") {
    const yt = youtubeThumbnail(item.videoUrl);
    return yt ? { kind: "image", src: yt } : { kind: "none", src: "" };
  }
  if (source.mode === "file") {
    // "#t=0.1" makes browsers paint a real frame instead of a black first frame.
    return { kind: "video", src: `${item.videoUrl}#t=0.1` };
  }
  return { kind: "none", src: "" };
}

const CARD_GAP = 20;

export default function VideoTestimonials({ data }: { data?: any }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, scrollLeft: 0 });
  const dragDistance = useRef(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [scrollState, setScrollState] = useState({ canPrev: false, canNext: true, active: 0 });

  const sectionTag = data?.sectionTag || "CLIENT VOICES";
  const titleIntro = data?.titleIntro !== undefined ? data.titleIntro : "Hear What Our";
  const titleHighlight = data?.titleHighlight !== undefined ? data.titleHighlight : "Customers Are Saying";
  const description = data?.description || "";
  const rawItems = data?.items;

  const playable = useMemo(
    () =>
      (Array.isArray(rawItems) ? (rawItems as TestimonialItem[]) : []).filter(
        (it) => it && resolveSource(it).mode !== "invalid"
      ),
    [rawItems]
  );

  const updateScrollState = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.getBoundingClientRect().width + CARD_GAP : 1;
    const max = el.scrollWidth - el.clientWidth;
    setScrollState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
      active: Math.max(0, Math.round(el.scrollLeft / step)),
    });
  }, []);

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [updateScrollState, playable.length]);

  if (playable.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    dragDistance.current = 0;
    dragStart.current = { x: e.pageX, scrollLeft: carouselRef.current.scrollLeft };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !carouselRef.current) return;
    const delta = e.pageX - dragStart.current.x;
    dragDistance.current = Math.max(dragDistance.current, Math.abs(delta));
    if (dragDistance.current > 4) e.preventDefault();
    carouselRef.current.scrollLeft = dragStart.current.scrollLeft - delta * 1.4;
  };

  const endDrag = () => setIsDragging(false);

  const scroll = (dir: "prev" | "next") => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    if (!card) return;
    el.scrollBy({ left: (dir === "next" ? 1 : -1) * (card.getBoundingClientRect().width + CARD_GAP), behavior: "smooth" });
  };

  const scrollToCard = (i: number) => {
    const el = carouselRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollTo({ left: i * (card.getBoundingClientRect().width + CARD_GAP), behavior: "smooth" });
  };

  // A drag that ends over a card must not count as a click on it.
  const openCard = (index: number) => {
    if (dragDistance.current > 6) return;
    setOpenIndex(index);
  };

  const arrowClass =
    "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-brand-zinc-300 dark:border-white/20 text-brand-dark dark:text-white shadow-sm transition-all duration-300 hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-[#080710] active:scale-95 disabled:opacity-35 disabled:pointer-events-none";

  return (
    // Top padding is deliberately tighter than the bottom: this section always follows a
    // hero / logo strip that already ends with its own generous bottom padding, and two
    // full section-y paddings stacked left a big dead gap between them.
    <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0a0a14] pt-8 sm:pt-10 lg:pt-12 pb-16 sm:pb-20 lg:pb-24">
      <style>{`
        .video-testi-scroll::-webkit-scrollbar { display: none; }
        .video-testi-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .video-testi-grab { cursor: grab; }
        .video-testi-grab.is-dragging { cursor: grabbing; }
        @keyframes video-testi-ring { 0% { transform: scale(1); opacity: .55; } 70%,100% { transform: scale(1.55); opacity: 0; } }
        .video-testi-ring { animation: video-testi-ring 2.4s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .video-testi-ring { animation: none; opacity: 0; } }
      `}</style>

      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-brand-blue/[0.06] dark:bg-brand-yellow/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-blue/[0.05] dark:bg-brand-yellow/[0.04] blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12"
        >
          <div className="flex flex-col gap-4 min-w-0">
            <div className="eyebrow-pill self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
              </span>
              {sectionTag}
            </div>

            <h2 className="font-heading text-3xl/[1.2] sm:text-4xl/[1.2] lg:text-5xl/[1.2] font-black text-brand-dark dark:text-white tracking-tight">
              {titleIntro}{" "}
              <AccentHighlight className="text-brand-blue dark:text-brand-yellow font-cursive font-normal">
                {titleHighlight}
              </AccentHighlight>
            </h2>

            {description && (
              <RichTextRenderer
                content={description}
                className="text-brand-zinc-500 dark:text-zinc-300 font-medium leading-relaxed text-xs md:text-sm max-w-xl"
              />
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 select-none shrink-0">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!scrollState.canPrev}
              className={arrowClass}
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("next")}
              disabled={!scrollState.canNext}
              className={arrowClass}
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div
            ref={carouselRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={endDrag}
            onMouseLeave={endDrag}
            onScroll={updateScrollState}
            onDragStart={(e) => e.preventDefault()}
            // Snapping is turned off while dragging by hand so it doesn't fight the pointer,
            // and comes back on release so the cards settle neatly.
            className={`flex overflow-x-auto video-testi-scroll video-testi-grab select-none w-full py-6 -my-6 ${
              isDragging ? "is-dragging" : "snap-x snap-mandatory scroll-smooth"
            }`}
            style={{ gap: CARD_GAP }}
          >
            {playable.map((item, index) => {
              const thumb = cardThumbnail(item);
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => openCard(index)}
                  aria-label={`Play video testimonial${item.name ? ` from ${item.name}` : ""}`}
                  className="group relative w-[68%] xs:w-[55%] sm:w-[38%] lg:w-[23.5%] shrink-0 snap-start text-left rounded-[28px] outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:focus-visible:ring-brand-yellow focus-visible:ring-offset-4 focus-visible:ring-offset-[#F8FAFC] dark:focus-visible:ring-offset-[#0a0a14]"
                >
                  <div className="relative aspect-[3/4] rounded-[28px] overflow-hidden border border-brand-zinc-200 dark:border-white/10 bg-brand-zinc-100 dark:bg-white/[0.04] shadow-[0_12px_22px_-12px_rgba(3,6,172,0.3)] dark:shadow-[0_12px_22px_-12px_rgba(0,0,0,0.7)] transition-all duration-500 group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_28px_-12px_rgba(3,6,172,0.4)] dark:group-hover:shadow-[0_18px_28px_-12px_rgba(233,189,54,0.24)]">
                    {thumb.kind === "image" && (
                      <img
                        src={thumb.src}
                        alt=""
                        draggable={false}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                    {thumb.kind === "video" && (
                      <video
                        src={thumb.src}
                        muted
                        playsInline
                        preload="metadata"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 pointer-events-none"
                      />
                    )}
                    {thumb.kind === "none" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/15 to-brand-blue/5 dark:from-brand-yellow/15 dark:to-brand-yellow/5">
                        <Film className="h-10 w-10 text-brand-blue/30 dark:text-brand-yellow/30" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/10" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="relative flex h-16 w-16 items-center justify-center">
                        <span className="video-testi-ring absolute inset-0 rounded-full bg-white/60 dark:bg-brand-yellow/60" />
                        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-blue dark:bg-brand-yellow dark:text-[#080710] shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-transform duration-300 group-hover:scale-110">
                          <Play className="h-6 w-6 fill-current translate-x-0.5" />
                        </span>
                      </span>
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white">
                      <p className="truncate text-sm sm:text-[15px] font-bold text-white drop-shadow">{item.name || "Happy Client"}</p>
                      {item.role && <p className="truncate text-[11px] sm:text-xs font-medium text-white/75 drop-shadow">{item.role}</p>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {playable.length > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Testimonial position">
              {playable.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === scrollState.active}
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => scrollToCard(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === scrollState.active
                      ? "w-6 bg-brand-blue dark:bg-brand-yellow"
                      : "w-1.5 bg-brand-zinc-300 dark:bg-white/25 hover:bg-brand-blue/50 dark:hover:bg-brand-yellow/50"
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>

      <VideoLightbox items={playable} openIndex={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </section>
  );
}

function VideoLightbox({
  items,
  openIndex,
  onClose,
  onNavigate,
}: {
  items: TestimonialItem[];
  openIndex: number | null;
  onClose: () => void;
  onNavigate: (i: number) => void;
}) {
  // Keep the latest callbacks/index in a ref so the key listener is attached once per
  // open, not re-attached on every parent render.
  const latest = useRef({ openIndex, count: items.length, onClose, onNavigate });
  latest.current = { openIndex, count: items.length, onClose, onNavigate };
  const isOpen = openIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      const { openIndex: i, count, onClose: close, onNavigate: go } = latest.current;
      if (i === null) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && i < count - 1) go(i + 1);
      if (e.key === "ArrowLeft" && i > 0) go(i - 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const item = openIndex !== null ? items[openIndex] : null;
  const source = item ? resolveSource(item) : null;
  const btn = "flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-30 disabled:pointer-events-none";

  return (
    <AnimatePresence>
      {item && source && openIndex !== null && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200]"
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-8 pointer-events-none" role="dialog" aria-modal="true" aria-label="Video testimonial">
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="relative w-full max-w-3xl pointer-events-auto"
            >
              <div className="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-black shadow-2xl">
                {source.mode === "embed" ? (
                  <div className="relative aspect-video w-full">
                    <iframe
                      key={openIndex}
                      src={`${source.embedUrl}?autoplay=1&rel=0`}
                      className="absolute inset-0 h-full w-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      title={item.name || "Video testimonial"}
                    />
                  </div>
                ) : (
                  // Natural size, capped to the viewport, so portrait phone clips aren't
                  // squashed into a landscape box.
                  <video
                    key={openIndex}
                    src={item.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="block max-h-[76vh] min-h-[220px] w-full bg-black object-contain"
                  />
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3 min-w-0">
                  {item.avatar ? (
                    <img src={item.avatar} alt="" className="h-10 w-10 rounded-full object-cover shrink-0 border border-white/20" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-black text-white">
                      {(item.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-white">{item.name || "Happy Client"}</p>
                    {item.role && <p className="truncate text-xs font-medium text-white/60">{item.role}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {items.length > 1 && (
                    <span className="mr-1 text-xs font-medium tabular-nums text-white/60">
                      {openIndex + 1} / {items.length}
                    </span>
                  )}
                  <button type="button" onClick={() => onNavigate(openIndex - 1)} disabled={openIndex <= 0} className={btn} aria-label="Previous">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => onNavigate(openIndex + 1)} disabled={openIndex >= items.length - 1} className={btn} aria-label="Next">
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={onClose} className={btn} aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
