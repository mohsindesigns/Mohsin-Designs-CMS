"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef } from "react";
import { useContent } from "@/hooks/useContent";

export default function Testimonials({ data: overrideData }: { data?: any }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const content = useContent();
  const rawData = overrideData || content.testimonials || {};

  const sectionTag = rawData.sectionTag || rawData.section?.badge || "CLIENT PRAISE & REVIEWS";
  const titleIntro = rawData.titleIntro || rawData.section?.headlinePrefix || "Trusted by Founders,";
  const titleHighlight = rawData.titleHighlight || rawData.section?.headlineHighlight || "Loved by Teams";
  const description = rawData.description || rawData.section?.description || "Real feedback from visionary founders and engineering leaders who transformed their digital platforms with our expertise.";

  const scorecardRating = rawData.scorecardRating || "4.9/5";
  const scorecardRatingLabel = rawData.scorecardRatingLabel || "OVERALL";
  const scorecardTitle = rawData.scorecardTitle || "TOP RATED ENGINEERING";
  const scorecardSub = rawData.scorecardSub || "BASED ON 120+ CLIENT REVIEWS";

  // Fallback reviews list if none exist
  const defaultReviews = [
    {
      id: "rev-1",
      name: "Marcus Vance",
      role: "VP of Engineering",
      company: "FinScale",
      quote: "Mohsin's team revamped our core web application in record time. Performance increased by 300% and user engagement reached all-time highs.",
      rating: 5,
      column: 1,
      avatarBg: "bg-[#0306AC]"
    },
    {
      id: "rev-2",
      name: "Elena Rostova",
      role: "Chief Design Officer",
      company: "Aura AI",
      quote: "The attention to typography, micro-interactions, and responsive layout is world-class. Our design system was delivered ahead of schedule.",
      rating: 5,
      column: 1,
      avatarBg: "bg-purple-600"
    },
    {
      id: "rev-3",
      name: "David Chen",
      role: "Founder & CEO",
      company: "NexPath Logistics",
      quote: "From discovery to deployment, the execution was flawless. Their architectural decisions saved us months of rework down the line.",
      rating: 5,
      column: 1,
      avatarBg: "bg-emerald-600"
    },
    {
      id: "rev-4",
      name: "Sarah Jenkins",
      role: "Head of Product",
      company: "CloudCore",
      quote: "Super intuitive CMS and stunning frontend animations. Our non-technical marketing team can now update high-converting pages effortlessly.",
      rating: 5,
      column: 2,
      avatarBg: "bg-amber-600"
    },
    {
      id: "rev-5",
      name: "Liam O'Connor",
      role: "Technical Director",
      company: "Verve Media",
      quote: "Incredible speed, clean code, and zero bugs on launch day. Mohsin Designs is our go-to engineering partner for every enterprise build.",
      rating: 5,
      column: 2,
      avatarBg: "bg-indigo-600"
    },
    {
      id: "rev-6",
      name: "Amina Al-Mansoor",
      role: "Director of Digital",
      company: "Apex Gulf Group",
      quote: "They understood our complex requirements instantly and delivered a modern portal that exceeds international enterprise standards.",
      rating: 5,
      column: 2,
      avatarBg: "bg-rose-600"
    },
    {
      id: "rev-7",
      name: "Julian Meyer",
      role: "Co-Founder",
      company: "StackFlow Analytics",
      quote: "The speed and polish of the final product blew our investors away. Truly state-of-the-art UI with rock-solid Next.js architecture.",
      rating: 5,
      column: 3,
      avatarBg: "bg-cyan-600"
    },
    {
      id: "rev-8",
      name: "Clara Johansson",
      role: "Growth Lead",
      company: "Nordic Ventures",
      quote: "Conversion rates jumped by 42% in the first 30 days after re-platforming. The ROI speaks for itself.",
      rating: 5,
      column: 3,
      avatarBg: "bg-teal-600"
    },
    {
      id: "rev-9",
      name: "Tariq Mahmood",
      role: "Head of Engineering",
      company: "PulseTech",
      quote: "Best agency collaboration we've had in 8 years. Highly responsive, deep technical chops, and unmatched creative execution.",
      rating: 5,
      column: 3,
      avatarBg: "bg-[#0306AC]"
    }
  ];

  // Raw list normalization
  let rawList: any[] = [];
  if (Array.isArray(rawData.list) && rawData.list.length > 0) {
    rawList = rawData.list;
  } else if (Array.isArray(rawData.items) && rawData.items.length > 0) {
    rawList = rawData.items.map((it: any, idx: number) => ({
      id: it.id || `item-${idx}`,
      name: it.name || "Client",
      role: it.position || it.role || "Client",
      company: it.company || "Enterprise",
      quote: it.text || it.quote || "",
      rating: it.rating || 5,
      column: (idx % 3) + 1,
      avatarBg: "bg-[#0306AC]"
    }));
  } else if (Array.isArray(rawData.testimonials) && rawData.testimonials.length > 0) {
    rawList = rawData.testimonials.map((it: any, idx: number) => ({
      id: it._id || it.id || `test-${idx}`,
      name: it.name || "Client",
      role: it.position || it.role || "Client",
      company: it.company || "Enterprise",
      quote: it.text || it.quote || "",
      rating: it.rating || 5,
      column: (idx % 3) + 1,
      avatarBg: "bg-[#0306AC]"
    }));
  } else {
    rawList = defaultReviews;
  }

  const testimonials = rawList.map((t: any, idx: number) => ({
    id: t.id || `rev-${idx}`,
    name: t.name || "Verified Client",
    role: t.role || "Executive",
    company: t.company || "Enterprise",
    quote: t.quote || t.text || "Exceptional service and outstanding deliverables.",
    rating: typeof t.rating === "number" ? t.rating : 5,
    column: t.column || (idx % 3) + 1,
    avatarBg: t.avatarBg || "bg-[#0306AC]"
  }));

  // Scroll tracking for parallax offset
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Soft physics-based spring smoothing to ease scroll translation jumps
  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 25,
    restDelta: 0.001
  });

  // Calculate horizontal parallax offsets (Row 1 & 3 shift right, Row 2 shifts left)
  const xRow1 = useTransform(smoothScrollProgress, [0, 1], [-80, 80]);
  const xRow2 = useTransform(smoothScrollProgress, [0, 1], [80, -80]);
  const xRow3 = useTransform(smoothScrollProgress, [0, 1], [-60, 60]);

  // Separate testimonials by rows (distribute if column not set)
  let row1 = testimonials.filter((t) => t.column === 1);
  let row2 = testimonials.filter((t) => t.column === 2);
  let row3 = testimonials.filter((t) => t.column === 3);

  if (row1.length === 0) row1 = testimonials.slice(0, Math.ceil(testimonials.length / 3));
  if (row2.length === 0) row2 = testimonials.slice(Math.ceil(testimonials.length / 3), Math.ceil((testimonials.length * 2) / 3));
  if (row3.length === 0) row3 = testimonials.slice(Math.ceil((testimonials.length * 2) / 3));

  // Fallbacks if any row is still empty
  if (row1.length === 0) row1 = defaultReviews.slice(0, 3);
  if (row2.length === 0) row2 = defaultReviews.slice(3, 6);
  if (row3.length === 0) row3 = defaultReviews.slice(6, 9);

  // Helper to repeat array for seamless looping marquee
  const tripleArray = <T,>(arr: T[]): T[] => [...arr, ...arr, ...arr];

  return (
    <section
      id="testimonials"
      ref={containerRef}
      className="relative overflow-hidden bg-[#F8FAFC] dark:bg-[#0a0a14] py-24 md:py-32 border-t border-b border-slate-200 dark:border-white/10"
    >
      {/* Styles for horizontal marquee animations & hover pause */}
      <style>{`
        @keyframes marquee-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        @keyframes marquee-right {
          0% { transform: translate3d(-33.333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .marquee-row-left {
          animation: marquee-left 42s linear infinite;
          will-change: transform;
        }
        .marquee-row-right {
          animation: marquee-right 42s linear infinite;
          will-change: transform;
        }
        .marquee-container:hover .marquee-row-left,
        .marquee-container:hover .marquee-row-right {
          animation-play-state: paused;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Premium hover card glass swipe effect */
        .card-sweep-glare {
          position: relative;
        }
        .card-sweep-glare::before {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: left 0.85s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 20;
        }
        .group:hover.card-sweep-glare::before {
          left: 160%;
        }
        .dark .card-sweep-glare::before {
          display: none;
        }
      `}</style>

      {/* Decorative Background Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-yellow-400/10 blur-3xl pointer-events-none z-0" />

      {/* Crossing structural grid lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-primary/[0.03] pointer-events-none" />

      <div className="w-full relative z-10">

        {/* Header Section & Scorecard (Side by Side) */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="flex flex-col gap-4 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 text-xs font-bold uppercase tracking-widest self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-yellow-400" />
              </span>
              {sectionTag}
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {titleIntro}{" "}
              <span className="text-primary dark:text-yellow-400 font-serif font-normal italic">
                {titleHighlight}
              </span>
            </h2>
            <p className="text-sm sm:text-base font-sans text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl">
              {description}
            </p>
          </div>

          {/* Premium Scorecard Widget */}
          <div className="bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(3,6,172,0.04)] relative overflow-hidden group/scorecard shrink-0 min-w-[260px] md:max-w-sm">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-primary to-primary/40 dark:from-yellow-400 dark:to-yellow-400/40" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex flex-col items-center justify-center h-14 w-14 rounded-xl bg-primary dark:bg-yellow-400 text-white dark:text-slate-950 shadow-sm border border-primary/10">
                <span className="font-heading font-black text-lg leading-none">{scorecardRating}</span>
                <span className="font-mono text-[7px] font-bold uppercase tracking-widest text-white/80 dark:text-slate-950/80 mt-1">{scorecardRatingLabel}</span>
              </div>
              <div className="space-y-1 text-left">
                <div className="flex gap-0.5 text-[#E9BD36]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[#E9BD36] text-[#E9BD36]" />
                  ))}
                </div>
                <span className="block text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-none">
                  {scorecardTitle}
                </span>
                <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest">
                  {scorecardSub}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-8 -right-8 w-20 h-20 rounded-full bg-primary/5 blur-xl group-hover/scorecard:scale-150 transition-transform duration-500" />
          </div>
        </div>

        {/* 3-Row Horizontal Scrolling Marquee Area */}
        <div className="relative w-full space-y-6 overflow-hidden py-4">
          {/* Left/Right edge gradients to fade text at viewport boundaries */}
          <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#F8FAFC] dark:from-[#0a0a14] to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#F8FAFC] dark:from-[#0a0a14] to-transparent z-20 pointer-events-none" />

          {/* Row 1: Leftward moving cards */}
          <div className="marquee-container flex overflow-x-auto scrollbar-none py-1">
            <motion.div
              style={{ x: xRow1 }}
              className="marquee-row-left flex gap-6 shrink-0"
            >
              {tripleArray(row1).map((item, idx) => (
                <div
                  key={idx}
                  className="group w-[320px] sm:w-[350px] shrink-0 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-[180px] sm:h-[190px] card-sweep-glare text-left"
                >
                  <div className="space-y-3">
                    <div className="flex gap-0.5 text-[#E9BD36]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#E9BD36] text-[#E9BD36]" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 dark:border-white/10 pt-3 mt-2">
                    <div className={`relative h-9 w-9 rounded-full ${item.avatarBg} flex items-center justify-center text-white font-heading font-black text-xs border border-white/20 shadow-sm shrink-0`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-none truncate">{item.name}</span>
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest mt-1 truncate">
                        {item.role} <span className="opacity-40 mx-0.5">·</span> <span className="text-primary dark:text-yellow-400 font-black">{item.company}</span>
                      </span>
                    </div>
                    <Quote className="h-5 w-5 ml-auto text-primary/10 dark:text-white/10 shrink-0" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 2: Rightward moving cards */}
          <div className="marquee-container flex overflow-x-auto scrollbar-none py-1">
            <motion.div
              style={{ x: xRow2 }}
              className="marquee-row-right flex gap-6 shrink-0"
            >
              {tripleArray(row2).map((item, idx) => (
                <div
                  key={idx}
                  className="group w-[320px] sm:w-[350px] shrink-0 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-[180px] sm:h-[190px] card-sweep-glare text-left"
                >
                  <div className="space-y-3">
                    <div className="flex gap-0.5 text-[#E9BD36]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#E9BD36] text-[#E9BD36]" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 dark:border-white/10 pt-3 mt-2">
                    <div className={`relative h-9 w-9 rounded-full ${item.avatarBg} flex items-center justify-center text-white font-heading font-black text-xs border border-white/20 shadow-sm shrink-0`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-none truncate">{item.name}</span>
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest mt-1 truncate">
                        {item.role} <span className="opacity-40 mx-0.5">·</span> <span className="text-primary dark:text-yellow-400 font-black">{item.company}</span>
                      </span>
                    </div>
                    <Quote className="h-5 w-5 ml-auto text-primary/10 dark:text-white/10 shrink-0" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Row 3: Leftward moving cards */}
          <div className="marquee-container flex overflow-x-auto scrollbar-none py-1">
            <motion.div
              style={{ x: xRow3 }}
              className="marquee-row-left flex gap-6 shrink-0"
            >
              {tripleArray(row3).map((item, idx) => (
                <div
                  key={idx}
                  className="group w-[320px] sm:w-[350px] shrink-0 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-primary/20 dark:hover:border-primary/30 transition-all duration-300 flex flex-col justify-between h-[180px] sm:h-[190px] card-sweep-glare text-left"
                >
                  <div className="space-y-3">
                    <div className="flex gap-0.5 text-[#E9BD36]">
                      {[...Array(item.rating)].map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-[#E9BD36] text-[#E9BD36]" />
                      ))}
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-relaxed line-clamp-3">
                      "{item.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 border-t border-slate-100 dark:border-white/10 pt-3 mt-2">
                    <div className={`relative h-9 w-9 rounded-full ${item.avatarBg} flex items-center justify-center text-white font-heading font-black text-xs border border-white/20 shadow-sm shrink-0`}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[11px] font-black text-slate-900 dark:text-white leading-none truncate">{item.name}</span>
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest mt-1 truncate">
                        {item.role} <span className="opacity-40 mx-0.5">·</span> <span className="text-primary dark:text-yellow-400 font-black">{item.company}</span>
                      </span>
                    </div>
                    <Quote className="h-5 w-5 ml-auto text-primary/10 dark:text-white/10 shrink-0" />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

        </div>

      </div>
    </section>
  );
}