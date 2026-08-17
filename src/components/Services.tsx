"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/hooks/useContent";

export default function Services() {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, scrollLeft: 0 });

  const content = useContent();
  const raw = content?.services;

  // Map CMS fields with fallbacks
  const services = {
    sectionTag:    raw?.sectionTag    || raw?.badge                 || "OUR SERVICES",
    titleIntro:    raw?.titleIntro    || raw?.headline?.prefix      || "What We",
    titleHighlight:raw?.titleHighlight|| raw?.headline?.highlight   || "Deliver.",
    description:   raw?.description   || "",
    ariaPrev:      raw?.ariaPrev      || "Previous service",
    ariaNext:      raw?.ariaNext      || "Next service",
    serviceLabel:  raw?.serviceLabel  || "SERVICE",
    list:          (raw?.list || raw?.services || []) as any[],
  };

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
    <section id="services" className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0a0a14] py-24 md:py-32 border-t border-brand-zinc-200 dark:border-white/10">

      <style>{`
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
        .carousel-grab { cursor: grab; }
        .carousel-grab:active { cursor: grabbing; }
        .card-sweep { position: relative; overflow: hidden; }
        .card-sweep::before {
          content: '';
          position: absolute; top: 0; left: -110%; width: 60%; height: 100%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.28) 50%, rgba(255,255,255,0) 100%);
          transform: skewX(-28deg);
          transition: left 0.85s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none; z-index: 20;
        }
        .group:hover.card-sweep::before { left: 160%; }
      `}</style>

      {/* Structural grid lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-brand-blue/[0.04] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 mb-8 md:mb-12"
        >
          <div className="eyebrow-pill self-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
            </span>
            {services.sectionTag}
          </div>

          <div className="flex items-center justify-between gap-4 w-full">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
              {services.titleIntro}{" "}
              <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                {services.titleHighlight}
              </span>
            </h2>

            {/* Arrow navigation */}
            <div className="flex gap-2 sm:gap-3 select-none shrink-0">
              <button
                onClick={() => scroll("prev")}
                className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-brand-zinc-300 dark:border-white/20 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-dark transition-all duration-300 active:scale-95 shadow-sm"
                aria-label={services.ariaPrev}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </button>
              <button
                onClick={() => scroll("next")}
                className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border border-brand-zinc-300 dark:border-white/20 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:border-brand-yellow dark:hover:bg-brand-yellow dark:hover:text-brand-dark transition-all duration-300 active:scale-95 shadow-sm"
                aria-label={services.ariaNext}
              >
                <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
              </button>
            </div>
          </div>

          <p className="text-brand-zinc-500 dark:text-zinc-300 font-medium leading-relaxed text-xs md:text-sm max-w-xl">
            {typeof services.description === "string"
              ? services.description
              : Array.isArray(services.description)
              ? (services.description as string[]).join("")
              : ""}
          </p>
        </motion.div>

        {/* Carousel */}
        <motion.div
          ref={carouselRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth scrollbar-none w-full -mx-2 px-2 md:mx-0 md:px-0 py-8 carousel-grab select-none"
        >
          {services.list.map((service: any, index: number) => {
            const globalService = (content?.services?.services || []).find(
              (s: any) => s.title === service.title || s.slug === service.slug
            );
            const imgSrc = service.image || service.overviewImage || globalService?.image || globalService?.overviewImage || "";
            const num = service.num || String(index + 1).padStart(2, "0");

            return (
              <div key={service._id || index} className="w-[86%] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] shrink-0 snap-start">
                <Link
                  href={`/services/${globalService?.slug || service.slug || ""}`}
                  className="group relative flex flex-col justify-between rounded-[2rem] border border-brand-blue/20 dark:border-white/10 hover:border-transparent bg-white dark:bg-zinc-900 p-6 xs:p-7 md:p-8 transition-all duration-500 hover:-translate-y-3 h-full min-h-[490px] sm:min-h-[520px] md:min-h-[540px] shadow-[0_2px_20px_rgba(3,6,172,0.04)] hover:shadow-[0_32px_64px_rgba(3,6,172,0.28)] dark:hover:shadow-[0_32px_64px_rgba(233,189,54,0.08)] cursor-pointer card-sweep block no-underline"
                >

                  {/* Hover fill overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0306AC] via-[#0306AC] to-[#020485] opacity-0 group-hover:opacity-100 dark:group-hover:opacity-0 transition-opacity duration-500 z-0 rounded-[2rem]" />

                  {/* Top accent bar */}
                  <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[2rem] bg-gradient-to-r from-brand-blue/40 via-brand-blue to-brand-blue/40 group-hover:from-brand-yellow/60 group-hover:via-brand-yellow group-hover:to-brand-yellow/60 transition-all duration-500" />

                  {/* Dot grid bg */}
                  <div className="absolute inset-0 opacity-[0.035] group-hover:opacity-0 transition-opacity duration-500 pointer-events-none z-0 rounded-[2rem]"
                    style={{ backgroundImage: 'radial-gradient(#0306AC 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

                  {/* Glow orbs */}
                  <div className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-brand-yellow/5 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none z-0" />

                  {/* Giant background number */}
                  <span className="font-heading font-black text-[6rem] md:text-[7rem] absolute -right-2 -top-2 select-none pointer-events-none z-0 text-transparent bg-clip-text bg-gradient-to-b from-brand-blue/20 to-transparent group-hover:from-white/15 group-hover:to-transparent transition-all duration-500 leading-none">
                    {num}
                  </span>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <div className="flex flex-col">

                      {/* Category pill */}
                      {service.category && (
                        <div className="inline-flex items-center self-start gap-1.5 mb-5 px-3 py-1 rounded-full bg-brand-blue/8 border border-brand-blue/15 text-brand-blue dark:text-brand-yellow group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-brand-yellow transition-all duration-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span className="font-mono text-[8px] font-black uppercase tracking-widest">{service.category}</span>
                        </div>
                      )}

                      {/* Service image */}
                      <div className="relative w-full aspect-[16/9] mb-5 rounded-2xl border border-brand-blue/10 group-hover:border-white/15 transition-all duration-500 overflow-hidden bg-brand-blue/3">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={service.title || "Service"}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 90vw, 33vw"
                          />
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-blue/20 group-hover:text-white/20 transition-colors duration-300">
                            <ArrowUpRight className="w-8 h-8" />
                            <span className="text-[9px] font-mono uppercase tracking-widest">No Image</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-brand-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      </div>

                      {/* Title */}
                      <h3 className="font-heading text-lg md:text-xl font-black mb-2 leading-tight text-brand-dark dark:text-white group-hover:text-white dark:group-hover:text-brand-yellow transition-colors duration-300">
                        {service.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs md:text-[13px] font-medium leading-relaxed text-brand-zinc-500 dark:text-zinc-300 group-hover:text-blue-100 dark:group-hover:text-zinc-200 transition-colors duration-300 line-clamp-3">
                        {service.desc || service.description || service.shortDescription || ""}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-6 pt-5 border-t border-brand-blue/10 dark:border-white/10 group-hover:border-white/15 transition-colors duration-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-black text-brand-blue/60 dark:text-zinc-400 group-hover:text-white/60 transition-colors duration-300 uppercase tracking-widest">{services.serviceLabel}</span>
                        <span className="text-[11px] font-mono font-black text-brand-blue dark:text-brand-yellow group-hover:text-brand-yellow transition-colors duration-300">{num}</span>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/8 border border-brand-blue/20 text-brand-blue dark:text-brand-yellow dark:border-brand-yellow/30 group-hover:bg-brand-yellow group-hover:border-brand-yellow group-hover:text-brand-dark group-hover:rotate-45 transition-all duration-500 shadow-sm">
                        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
                      </div>
                    </div>
                  </div>

                </Link>
              </div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}