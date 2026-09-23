"use client";

import { useEffect, useRef, useState } from "react";
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

function cardThumbnail(item: TestimonialItem): { kind: "image" | "video" | "none"; src: string } {
  if (item.thumbnail) return { kind: "image", src: item.thumbnail };
  if (item.videoType === "embed") {
    const yt = youtubeThumbnail(item.videoUrl);
    if (yt) return { kind: "image", src: yt };
    return { kind: "none", src: "" };
  }
  if (item.videoUrl) return { kind: "video", src: item.videoUrl };
  return { kind: "none", src: "" };
}

export default function VideoTestimonials({ data }: { data?: any }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, scrollLeft: 0 });
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const content = {
    sectionTag: data?.sectionTag || "CLIENT VOICES",
    titleIntro: data?.titleIntro !== undefined ? data.titleIntro : "Hear What Our",
    titleHighlight: data?.titleHighlight !== undefined ? data.titleHighlight : "Customers Are Saying",
    description: data?.description || "",
    items: (Array.isArray(data?.items) ? data.items : []) as TestimonialItem[],
  };

  const playable = content.items.filter((it) => it?.videoUrl);
  if (playable.length === 0) return null;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.pageX - carouselRef.current.offsetLeft, scrollLeft: carouselRef.current.scrollLeft };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    carouselRef.current.scrollLeft = dragStartPos.current.scrollLeft - (x - dragStartPos.current.x) * 1.5;
  };

  const handleMouseUpOrLeave = () => setIsDragging(false);

  const scroll = (dir: "prev" | "next") => {
    if (!carouselRef.current) return;
    const card = carouselRef.current.firstElementChild as HTMLElement;
    if (card) carouselRef.current.scrollBy({ left: (dir === "next" ? 1 : -1) * (card.getBoundingClientRect().width + 24), behavior: "smooth" });
  };

  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0a0a14] border-t border-brand-zinc-200 dark:border-white/10 section-y">
      <style>{`
        .video-testi-scroll::-webkit-scrollbar { display: none; }
        .video-testi-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .video-testi-grab { cursor: grab; }
        .video-testi-grab:active { cursor: grabbing; }
      `}</style>

      <div className="absolute inset-x-0 top-12 h-[1px] bg-brand-blue/[0.04] dark:bg-brand-yellow/[0.04] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-brand-blue/[0.04] dark:bg-brand-yellow/[0.04] pointer-events-none" />

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
              {content.sectionTag}
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
              {content.titleIntro}{" "}
              <AccentHighlight className="text-brand-blue dark:text-brand-yellow font-cursive font-normal">
                {content.titleHighlight}
              </AccentHighlight>
            </h2>

            {content.description && (
              <RichTextRenderer
                content={content.description}
                className="text-brand-zinc-500 dark:text-zinc-300 font-medium leading-relaxed text-xs md:text-sm max-w-xl"
              />
            )}
          </div>

          <div className="flex gap-2 sm:gap-3 select-none shrink-0">
            <button
              onClick={() => scroll("prev")}
              className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-brand-zinc-300 dark:border-white/20 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-dark transition-all duration-300 active:scale-95 shadow-sm"
              aria-label="Previous testimonial"
            >
              <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              onClick={() => scroll("next")}
              className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-brand-zinc-300 dark:border-white/20 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-dark transition-all duration-300 active:scale-95 shadow-sm"
              aria-label="Next testimonial"
            >
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          </div>
        </motion.div>

        <motion.div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth video-testi-scroll w-full -mx-2 px-2 md:mx-0 md:px-0 py-2 video-testi-grab select-none"
        >
          {playable.map((item, index) => {
            const thumb = cardThumbnail(item);
            return (
              <button
                key={index}
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group relative w-[68%] xs:w-[55%] sm:w-[38%] lg:w-[24%] shrink-0 snap-start text-left"
              >
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-brand-zinc-200 dark:border-white/10 bg-brand-zinc-100 dark:bg-white/[0.04] shadow-[0_10px_30px_-10px_rgba(3,6,172,0.15)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] transition-transform duration-300 group-hover:-translate-y-1">
                  {thumb.kind === "image" && (
                    <img src={thumb.src} alt={item.name || "Video testimonial"} className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {thumb.kind === "video" && (
                    <video src={thumb.src} muted playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  {thumb.kind === "none" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-blue/5 dark:from-brand-yellow/10 dark:to-brand-yellow/5">
                      <Film className="h-10 w-10 text-brand-blue/30 dark:text-brand-yellow/30" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

                  {/* Play button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-white/90 shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                      <Play className="h-5 w-5 sm:h-6 sm:w-6 text-brand-blue fill-brand-blue translate-x-0.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2.5 px-1">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name || ""} className="h-8 w-8 rounded-full object-cover shrink-0 border border-brand-zinc-200 dark:border-white/10" />
                  ) : (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 text-[11px] font-black text-brand-blue dark:text-brand-yellow">
                      {(item.name || "?").trim().charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-brand-dark dark:text-white">{item.name || "Happy Client"}</p>
                    {item.role && <p className="truncate text-[11px] font-medium text-brand-zinc-500 dark:text-zinc-400">{item.role}</p>}
                  </div>
                </div>
              </button>
            );
          })}
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
  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && openIndex < items.length - 1) onNavigate(openIndex + 1);
      if (e.key === "ArrowLeft" && openIndex > 0) onNavigate(openIndex - 1);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, items.length, onClose, onNavigate]);

  const item = openIndex !== null ? items[openIndex] : null;
  const embed = item?.videoType === "embed" ? parseVideoEmbed(item.videoUrl) : null;

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-[200]"
          />
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 20 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl">
                {item.videoType === "embed" && embed?.embedUrl ? (
                  <iframe
                    src={`${embed.embedUrl}?autoplay=1`}
                    className="absolute inset-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={item.name || "Video testimonial"}
                  />
                ) : (
                  <video src={item.videoUrl} controls autoPlay playsInline className="absolute inset-0 h-full w-full object-contain" />
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-3 min-w-0">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name || ""} className="h-10 w-10 rounded-full object-cover shrink-0 border border-white/20" />
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
                  {openIndex !== null && openIndex > 0 && (
                    <button
                      onClick={() => onNavigate(openIndex - 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Previous"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                  )}
                  {openIndex !== null && openIndex < items.length - 1 && (
                    <button
                      onClick={() => onNavigate(openIndex + 1)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                      aria-label="Next"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                    aria-label="Close"
                  >
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
