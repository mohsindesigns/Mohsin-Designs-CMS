"use client";

import React from "react";
import { motion, useMotionValue } from "framer-motion";
import {
  Globe,
  Cpu,
  Building2,
  ShoppingCart,
  Star,
  Briefcase,
  Heart,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Monitor,
  Search,
  PenTool,
  Palette,
  BarChart2
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Globe,
  Cpu,
  Building2,
  ShoppingCart,
  Star,
  Briefcase,
  Heart,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Monitor,
  Search,
  PenTool,
  Palette,
  BarChart2
};

// Draw underline variant
const drawVariants = {
  hidden: { pathLength: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    pathLength: 1,
    transition: {
      duration: custom?.duration ?? 0.5,
      delay: custom?.delay ?? 0.1,
      ease: "easeOut" as any
    }
  })
};

// Spotlight Card
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group/spotlight ${className}`}
    >
      {children}
    </div>
  );
}

interface IndustriesSectionProps {
  data?: any;
}

export default function IndustriesSection({ data }: IndustriesSectionProps) {
  const industries = {
    eyebrow: data?.eyebrow || data?.sectionTag || "08 // SECTORS WE ACCELERATE",
    titleIntro: data?.titleIntro !== undefined ? data.titleIntro : "Industries",
    titleHighlight: data?.titleHighlight || data?.title || "We Specialize In",
    description: data?.description || "Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical.",
    list: (Array.isArray(data?.list) && data.list.length > 0)
      ? data.list
      : (Array.isArray(data?.items) && data.items.length > 0)
        ? data.items
        : [
            { title: "Home Services & Contracting", desc: "Roofing, decking, remodeling, and local trade contractors scaling regional territories.", iconName: "Building2", watermark: "HS" },
            { title: "Technology & SaaS", desc: "Fast-growth software startups and tech firms demanding high conversion rates.", iconName: "Cpu", watermark: "TS" },
            { title: "Commercial Real Estate", desc: "Property developers, architectural firms, and luxury real estate agencies.", iconName: "Building2", watermark: "CR" },
            { title: "E-Commerce & Retail", desc: "Direct-to-consumer and B2B brands scaling transactions with seamless checkout.", iconName: "ShoppingCart", watermark: "EC" },
            { title: "Professional Services", desc: "Law firms, financial consultancies, and executive agencies building trust.", iconName: "Briefcase", watermark: "PS" },
            { title: "Healthcare & Wellness", desc: "Clinics, medical practices, and private health facilities seeking patient acquisition.", iconName: "Heart", watermark: "HW" }
          ]
  };

  const defaultIcons = [Building2, Cpu, Globe, ShoppingCart, Briefcase, Heart];

  return (
    <section id="industries" className="relative overflow-hidden py-20 md:py-28 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14 space-y-4 max-w-3xl mx-auto"
        >
          {industries.eyebrow && (
            <div className="flex justify-center">
              <span className="eyebrow-pill">{industries.eyebrow}</span>
            </div>
          )}

          <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
            {industries.titleIntro}{" "}
            <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
              {industries.titleHighlight}
              <svg className="absolute -bottom-1.5 left-0 w-full h-3.5 pointer-events-none text-brand-yellow opacity-90" viewBox="0 0 100 10" preserveAspectRatio="none">
                <motion.path
                  d="M 2 5 Q 50 1.5, 98 3.5 C 99 3.5, 99 4.5, 98 5 Q 50 7, 2 5.5 Z"
                  fill="currentColor"
                  custom={{ delay: 0.3, duration: 0.65 }}
                  variants={drawVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                />
              </svg>
            </span>
          </h2>

          {industries.description && (
            <p className="text-sm sm:text-base text-brand-zinc-600 dark:text-zinc-300 font-sans leading-relaxed pt-2">
              {industries.description}
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {industries.list.map((ind: any, idx: number) => {
            const FallbackIcon = defaultIcons[idx % defaultIcons.length];
            const words = String(ind.title || "").split(" ");
            const abbreviation = ind.watermark || words.map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

            return (
              <SpotlightCard
                key={idx}
                className="bg-white dark:bg-[#0c0b18] border border-slate-200/80 dark:border-white/10 p-6 sm:p-8 rounded-[28px] hover:shadow-2xl hover:border-blue-600/30 dark:hover:border-yellow-400/30 transition-all duration-500 flex flex-col justify-between min-h-[250px] relative group text-left overflow-hidden"
              >
                {/* Floating Watermark */}
                <span className="absolute top-5 right-7 font-serif italic text-6xl sm:text-7xl font-black text-slate-100 dark:text-white/[0.04] select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">
                  {abbreviation}
                </span>

                <div className="space-y-5 relative z-10">
                  {/* Icon Container with subtle shadow and hover transition */}
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 dark:bg-[#1e1e2e] border border-slate-200/90 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.03)] group-hover:bg-[#0306AC] dark:group-hover:bg-[#E9BD36] group-hover:border-transparent transition-all duration-500 ease-out shrink-0">
                    {(() => {
                      const IndIcon = (ind.iconName && iconMap[ind.iconName]) || FallbackIcon;
                      return <IndIcon className="h-6 w-6 text-[#0306AC] dark:text-[#E9BD36] group-hover:text-white dark:group-hover:text-[#080710] transition-all duration-300 stroke-[1.75]" />;
                    })()}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors leading-snug">
                      {ind.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-brand-zinc-600 dark:text-zinc-400 font-sans leading-relaxed font-normal">
                      {ind.desc || ind.description}
                    </p>
                  </div>
                </div>

                {Array.isArray(ind.tags) && ind.tags.length > 0 && (
                  <div className="pt-4 mt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap gap-1.5 relative z-10">
                    {ind.tags.map((tag: string, tIdx: number) => (
                      <span
                        key={tIdx}
                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-2.5 py-0.5 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase shadow-xs"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </SpotlightCard>
            );
          })}
        </div>

      </div>
    </section>
  );
}
