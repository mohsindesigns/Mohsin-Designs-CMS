"use client";

import { motion } from "framer-motion";
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

export default function AboutOwnerClean({ data: propData }: { data?: any }) {
  const content = useContent();
  const about = propData || content?.about || (content as any)?.aboutOwner || {};

  // Sync CMS fields with fallback defaults
  const sectionTag = about?.badge || about?.eyebrow || about?.sectionTag || "ABOUT THE OWNER";
  const titleIntro = about?.headline?.prefix || about?.headlinePrefix || about?.titleIntro || "Leading with Vision,";
  const titleHighlight = about?.headline?.highlight || about?.headlineHighlight || about?.titleHighlight || "Building with Trust.";
  
  // Rich description from QuillEditor (falls back to plain bio paragraphs for legacy data)
  const description = about?.description || "";
  const legacyBio = about?.bioParagraph1 || about?.bioParagraph2
    ? `<p><strong>${about?.bioParagraph1 || ""}</strong></p><p>${about?.bioParagraph2 || ""}</p>`
    : "";
  const bioContent = description || legacyBio || "<p><strong>I help brands scale dynamically using advanced design and tech systems.</strong></p><p>With over a decade of design experience, we specialize in high-end design systems, custom development, and comprehensive marketing architectures.</p>";
  
  // Only use image if it looks like a real path/URL
  const rawPortraitSrc = about?.image?.src || (typeof about?.image === 'string' ? about?.image : "") || about?.avatar || about?.teamImage || "";
  const portraitSrc = rawPortraitSrc.startsWith("/") || rawPortraitSrc.startsWith("http") ? rawPortraitSrc : "";
  const portraitAlt = about?.image?.alt || about?.imageAlt || "Mohsin Designs Biography";
  
  const circleText = about?.circleText || "CREATIVE POWER • MOHSIN DESIGNS •";
  const circleLetter = about?.circleLetter || "M";

  return (
    <section id="about" className="relative overflow-hidden bg-white dark:bg-[#080710] py-24 md:py-32 border-t border-brand-zinc-200 dark:border-white/10">

      {/* Structural background grid lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-brand-blue/[0.04] pointer-events-none" />
      <div className="absolute right-1/3 top-0 bottom-0 w-[1px] bg-brand-blue/[0.04] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Portrait Showcase with Rotating Monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative flex justify-center items-center w-full"
          >

            {/* Ambient background glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-brand-blue/15 to-brand-yellow/15 rounded-3xl blur-2xl opacity-70 pointer-events-none" />

            {/* Rotating Monogram Badge in top corner */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: 24, repeat: Infinity }}
              className="absolute -top-6 -left-6 h-24 w-24 z-20 select-none pointer-events-none hidden sm:block"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <path id="aboutCleanCirclePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text className="text-[8.5px] font-black uppercase tracking-widest fill-brand-dark dark:fill-white font-sans">
                  <textPath href="#aboutCleanCirclePath" startOffset="0%">
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

          {/* Right Column: Narrative Biography (Clean - No stats, No CTA) */}
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
            <div className="space-y-5 font-sans prose dark:prose-invert prose-sm sm:prose-base max-w-none prose-p:text-brand-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-brand-dark dark:prose-strong:text-white prose-strong:text-lg md:prose-strong:text-xl prose-strong:leading-relaxed prose-strong:font-semibold prose-headings:text-brand-dark dark:prose-headings:text-white">
              <RichTextRenderer content={bioContent} />
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
}
