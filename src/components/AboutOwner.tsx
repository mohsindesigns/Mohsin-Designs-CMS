"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { useContent } from "../hooks/useContent";
import RichTextRenderer from "./ui/RichTextRenderer";

// Variants for repeating hand-drawn paths animations on scroll
const drawVariants = {
  hidden: { pathLength: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    pathLength: 1,
    transition: {
      duration: custom?.duration ?? 0.4,
      delay: custom?.delay ?? 0.1,
      ease: "easeOut" as any
    }
  })
};

// 3D rolling odometer-style digit component
function Digit({ char, isActive }: { char: string; isActive: boolean }) {
  const isNumber = !isNaN(parseInt(char));
  const targetDigit = isNumber ? parseInt(char) : 0;

  if (!isNumber) {
    return <span className="inline-block">{char}</span>;
  }

  return (
    <span className="relative inline-block h-[1.1em] overflow-hidden leading-none select-none">
      {/* Pre-rendered invisible digit keeps width static to prevent layout jitter */}
      <span className="invisible block">9</span>
      <motion.span
        initial={{ y: "0%" }}
        animate={isActive ? { y: `-${targetDigit * 10}%` } : { y: "0%" }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 flex flex-col font-heading font-black"
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <span key={n} className="h-[1.1em] flex items-center justify-center">
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

// 3D rolling number counter
function RollingNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, margin: "-50px" });
  const valueString = value.toString();
  const digits = valueString.split("");

  return (
    <span ref={ref} className="inline-flex items-baseline font-heading font-black">
      {digits.map((char, index) => (
        <Digit key={index} char={char} isActive={isInView} />
      ))}
      {suffix && <span className="inline-block font-heading font-black">{suffix}</span>}
    </span>
  );
}

export default function AboutOwner() {
  const content = useContent();
  const { about } = content;

  // Sync CMS fields with fallback defaults
  const sectionTag = about?.badge || "ABOUT THE OWNER";
  const titleIntro = about?.headline?.prefix || "Leading with Vision,";
  const titleHighlight = about?.headline?.highlight || "Building with Trust.";
  
  // Rich description from QuillEditor (falls back to plain bio paragraphs for legacy data)
  const description = about?.description || "";
  const legacyBio = about?.bioParagraph1 || about?.bioParagraph2
    ? `<p><strong>${about?.bioParagraph1 || ""}</strong></p><p>${about?.bioParagraph2 || ""}</p>`
    : "";
  const bioContent = description || legacyBio || "<p><strong>I help brands scale dynamically using advanced design and tech systems.</strong></p><p>With over a decade of design experience, we specialize in high-end design systems, custom development, and comprehensive marketing architectures.</p>";
  
  // Only use image if it looks like a real path/URL
  const rawPortraitSrc = about?.image?.src || "";
  const portraitSrc = rawPortraitSrc.startsWith("/") || rawPortraitSrc.startsWith("http") ? rawPortraitSrc : "";
  const portraitAlt = about?.image?.alt || "Mohsin Designs Biography";
  
  const circleText = about?.circleText || "CREATIVE POWER • MOHSIN DESIGNS •";
  const circleLetter = about?.circleLetter || "M";

  const statsList = about?.stats || [
    { value: 12, suffix: "+", label: "Years Experience" },
    { value: 150, suffix: "+", label: "Brands Scaled" },
    { value: 99, suffix: "%", label: "Success Rate" }
  ];

  const ctaText = about?.buttons?.[0]?.text || "Let's Collaborate";
  const ctaHref = about?.buttons?.[0]?.href || "/contact";

  return (
    <section id="about" className="relative overflow-hidden bg-transparent py-24 md:py-32 border-b border-brand-zinc-200 dark:border-white/10">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">

          {/* Left Column: Premium Portrait with Hand-Drawn Outline Frame */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="lg:col-span-5 relative w-full flex justify-center"
          >

            {/* Background Pixel Grid decoration */}
            <div className="absolute -inset-4 z-0 grid grid-cols-6 w-[105%] h-[105%] overflow-hidden pointer-events-none opacity-30 border border-brand-blue/5">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="aspect-square border-r border-b border-brand-blue/5" />
              ))}
            </div>

            {/* Hand-drawn marker/brush drawing frame */}
            <svg
              className="absolute -inset-5 sm:-inset-6 w-[110%] sm:w-[112%] h-[110%] sm:h-[112%] pointer-events-none stroke-[#E9BD36] fill-none z-0 opacity-90"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Stroke 1: Top line (Left to Right) */}
              <motion.path
                d="M -2 4 C 30 1, 70 2, 102 3.5"
                strokeWidth="3.5"
                strokeLinecap="round"
                variants={drawVariants}
                custom={{ delay: 0.1, duration: 0.4 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              />
              {/* Stroke 2: Right line (Top to Bottom) */}
              <motion.path
                d="M 96.5 -2 C 98.5 30, 95 70, 96 102"
                strokeWidth="3.5"
                strokeLinecap="round"
                variants={drawVariants}
                custom={{ delay: 0.4, duration: 0.4 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              />
              {/* Stroke 3: Bottom line (Right to Left) */}
              <motion.path
                d="M 102 96 C 70 94.5, 30 96.5, -2 95"
                strokeWidth="3.5"
                strokeLinecap="round"
                variants={drawVariants}
                custom={{ delay: 0.7, duration: 0.4 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              />
              {/* Stroke 4: Left line (Bottom to Top) */}
              <motion.path
                d="M 4 102 C 1.5 70, 4.5 30, 3 -2"
                strokeWidth="3.5"
                strokeLinecap="round"
                variants={drawVariants}
                custom={{ delay: 1.0, duration: 0.4 }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: false }}
              />
            </svg>

            {/* Rotating Star Badge */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ ease: "linear", duration: 15, repeat: Infinity }}
              className="absolute -top-6 -left-6 h-20 w-20 z-20 hidden sm:block select-none pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <path id="aboutCirclePath" d="M 50, 50 m -30, 0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0" />
                </defs>
                <text className="text-[7.5px] font-black uppercase tracking-wider fill-brand-zinc-400 font-sans">
                  <textPath href="#aboutCirclePath" startOffset="0%">
                    {circleText}
                  </textPath>
                </text>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-[#E9BD36] flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-black text-[#080710]">{circleLetter}</span>
                </div>
              </div>
            </motion.div>

            {/* Portrait Image Container */}
            <div className="relative aspect-[3/4] w-full max-w-[420px] overflow-hidden rounded-2xl border border-brand-zinc-200 dark:border-white/10 shadow-md bg-brand-zinc-50 dark:bg-zinc-900 z-10 group cursor-pointer">
              {portraitSrc ? (
                <Image
                  src={portraitSrc}
                  alt={portraitAlt}
                  fill
                  priority
                  className="object-cover grayscale group-hover:grayscale-0 scale-[1.01] group-hover:scale-103 transition-all duration-700 ease-out"
                  sizes="(max-width: 768px) 100vw, 420px"
                />
              ) : null}

              {/* Overlay glow on hover */}
              <div className="absolute inset-0 bg-brand-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>

          </motion.div>

          {/* Right Column: Narrative Biography & Clean Stats */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.3 }}
            className="lg:col-span-7 space-y-8 lg:pl-6 z-20 text-center lg:text-left flex flex-col items-center lg:items-start w-full"
          >

            {/* Section Tag */}
            <div className="space-y-4">
              <div className="eyebrow-pill self-start">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
                </span>
                {sectionTag}
              </div>

              {/* Header */}
              <h2 className="font-heading text-4xl sm:text-5xl font-black leading-[1.15] text-brand-dark dark:text-white tracking-tight">
                {titleIntro}{" "}
                <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                  {titleHighlight}
                </span>
              </h2>
            </div>

            {/* Narrative biography */}
            <div className="space-y-5 font-sans prose prose-sm sm:prose-base max-w-none prose-p:text-brand-zinc-600 dark:prose-p:text-zinc-400 prose-p:leading-relaxed prose-strong:text-brand-dark dark:prose-strong:text-zinc-100 prose-strong:text-lg md:prose-strong:text-xl prose-strong:leading-relaxed prose-strong:font-semibold">
              <RichTextRenderer content={bioContent} />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-1.5 xs:gap-3 sm:gap-6 pt-8 border-t border-brand-zinc-200 dark:border-white/10 mt-8 w-full">
              {statsList.map((s: any, i: number) => (
                <div key={i} className="relative pl-2 sm:pl-6 border-l-2 border-brand-yellow">
                  <div className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-heading font-black text-brand-blue dark:text-white leading-none">
                    <RollingNumber value={s.value || 0} suffix={s.suffix || ""} />
                  </div>
                  <div className="text-[8px] sm:text-[10px] font-bold text-brand-zinc-500 dark:text-zinc-300 uppercase tracking-widest mt-3 leading-none">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Premium CTA Button */}
            <div className="pt-4">
              <a
                href={ctaHref}
                className="btn-secondary-cta"
              >
                <span>{ctaText}</span>
                <span className="btn-icon">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </a>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
