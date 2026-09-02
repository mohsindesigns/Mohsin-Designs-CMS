"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/hooks/useContent";

export default function Services({ data: propData }: { data?: any }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, scrollLeft: 0 });

  const content = useContent();
  const raw = propData || content?.services;

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
    ctaHeading:    raw?.ctaHeading    || raw?.cta?.heading          || "Need a Custom Architecture or Specialized Solution?",
    ctaDescription:raw?.ctaDescription|| raw?.cta?.description      || "Discuss your technical requirements directly with our principal engineer. We map out full-funnel architectures and execute with pixel perfection.",
    ctaButtonText: raw?.ctaButtonText || raw?.cta?.buttonText       || "Schedule Technical Consultation",
    ctaButtonHref: raw?.ctaButtonHref || raw?.cta?.buttonHref       || "/contact",
    ctaEyebrow:    raw?.ctaEyebrow    || raw?.cta?.eyebrow          || "STRATEGY & SCOPING"
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

  // Build comprehensive master list of all available global services for robust fallback resolution
  const anyContent = content as any;
  const masterServices = [
    ...(Array.isArray(anyContent?.services?.services) ? anyContent.services.services : []),
    ...(Array.isArray(anyContent?.services) ? anyContent.services : []),
    ...(Array.isArray(anyContent?.globalServices) ? anyContent.globalServices : []),
    ...(Array.isArray(anyContent?.services?.list) ? anyContent.services.list : [])
  ];

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
            const globalService = masterServices.find(
              (s: any) =>
                (service?._id && s?._id === service._id) ||
                (service?.id && (s?.id === service.id || s?._id === service.id)) ||
                (service?.slug && s?.slug === service.slug) ||
                (typeof service === 'string' && (s?._id === service || s?.id === service || s?.slug === service || s?.title === service)) ||
                (service?.title && s?.title?.toLowerCase() === service.title?.toLowerCase())
            );

            const title = service?.title || globalService?.title || (typeof service === 'string' ? service : "Service");
            const desc = service?.desc || service?.description || service?.shortDescription || service?.tagline || globalService?.desc || globalService?.description || globalService?.shortDescription || globalService?.tagline || globalService?.hero?.description || "";
            const imgSrc = service?.image || service?.overviewImage || service?.heroImage || service?.featuredImage || globalService?.image || globalService?.overviewImage || globalService?.heroImage || globalService?.featuredImage || globalService?.hero?.bgImage || globalService?.hero?.backgroundImage || "";
            const category = service?.category || service?.tag || globalService?.category || globalService?.tag || "";
            const slug = service?.slug || globalService?.slug || "";
            const num = service?.num || String(index + 1).padStart(2, "0");

            return (
              <div key={service?._id || service?.id || index} className="w-[86%] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] shrink-0 snap-start">
                <Link
                  href={slug ? `/services/${slug}` : "/services"}
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
                      {category && (
                        <div className="inline-flex items-center self-start gap-1.5 mb-5 px-3 py-1 rounded-full bg-brand-blue/8 border border-brand-blue/15 text-brand-blue dark:text-brand-yellow group-hover:bg-white/15 group-hover:border-white/20 group-hover:text-brand-yellow transition-all duration-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span className="font-mono text-[8px] font-black uppercase tracking-widest">{category}</span>
                        </div>
                      )}

                      {/* Service image */}
                      <div className="relative w-full aspect-[16/9] mb-5 rounded-2xl border border-brand-blue/10 group-hover:border-white/15 transition-all duration-500 overflow-hidden bg-brand-blue/3">
                        {imgSrc ? (
                          <Image
                            src={imgSrc}
                            alt={title}
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
                        {title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs md:text-[13px] font-medium leading-relaxed text-brand-zinc-500 dark:text-zinc-300 group-hover:text-blue-100 dark:group-hover:text-zinc-200 transition-colors duration-300 line-clamp-3">
                        {desc}
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

        {/* Services Bottom CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 md:mt-24 relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0306AC] via-[#020485] to-[#010356] dark:from-[#12121e] dark:via-[#0f0f1a] dark:to-[#080710] border border-brand-blue/20 dark:border-white/10 p-8 sm:p-12 md:p-16 text-white shadow-2xl"
        >
          {/* Subtle glowing ambient lights */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-brand-yellow/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4 max-w-2xl text-center lg:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 dark:bg-yellow-400/10 px-4 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest text-brand-yellow dark:text-yellow-400 border border-white/10">
                {services.ctaEyebrow}
              </span>
              <h3 className="font-heading text-2xl sm:text-3xl md:text-4xl font-black text-white leading-tight tracking-tight">
                {services.ctaHeading}
              </h3>
              <p className="text-white/80 dark:text-zinc-300 text-sm md:text-base font-sans font-normal leading-relaxed">
                {services.ctaDescription}
              </p>
            </div>

            <div className="shrink-0 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-4">
              <Link
                href={services.ctaButtonHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-brand-yellow text-brand-dark hover:bg-white hover:text-brand-blue font-heading font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-lg group active:scale-95 no-underline"
              >
                <span>{services.ctaButtonText}</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}