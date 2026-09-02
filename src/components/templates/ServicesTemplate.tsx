"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Search,
  Monitor,
  Megaphone,
  MousePointerClick,
  Palette,
  PenTool,
  ShoppingCart,
  BarChart2,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Award,
  Globe,
  DollarSign,
  Briefcase,
  TrendingUp,
  Building2,
  Phone,
  Target,
  Terminal,
  Zap,
  HeartHandshake,
  Shield,
  Clock,
  Layout,
  Home,
  TreePine,
  Layers,
  Sparkles
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useContent } from "../../hooks/useContent";
import BlogSection from "../sections/BlogSection";
import PageInlineFaqs from "@/components/PageInlineFaqs";

// ── Icon resolver ─────────────────────────────────────────────────────────────
const iconMap: Record<string, React.ElementType> = {
  Search,
  Monitor,
  Megaphone,
  MousePointerClick,
  Palette,
  PenTool,
  ShoppingCart,
  BarChart2,
  Cpu,
  ShieldCheck,
  Award,
  Globe,
  DollarSign,
  Briefcase,
  TrendingUp,
  Building2,
  Phone,
  Target,
  Terminal,
  Zap,
  HeartHandshake,
  Shield,
  Clock,
  Layout,
  Home,
  TreePine,
  Layers,
  Sparkles,
  ...(LucideIcons as any)
};

// ── SVG underline draw variant ────────────────────────────────────────────────
const drawVariants = {
  hidden: { pathLength: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    pathLength: 1,
    transition: {
      duration: custom?.duration ?? 0.4,
      delay: custom?.delay ?? 0.1,
      ease: "easeOut" as const,
    },
  }),
};

// ── Interactive ServiceCard helper (award-level micro-interactions) ───────────
function ServiceCard({
  card,
  index,
  ctaText = "Explore Inclusions",
}: {
  card: {
    id: string;
    iconName: string;
    tag: string;
    title: string;
    desc: string;
    features: string[];
    slug: string;
  };
  index: number;
  ctaText?: string;
}) {
  const Icon = iconMap[card.iconName] || Search;
  const [coords, setCoords] = useState({ x: "50%", y: "50%" });

  // Calculate cursor position for interactive card spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({ x: `${x}%`, y: `${y}%` });
  };

  const formattedNum = (index + 1).toString().padStart(2, "0");

  return (
    <Link href={`/services/${card.slug}`} className="w-full flex">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: index * 0.07, ease: "easeOut" }}
        onMouseMove={handleMouseMove}
        style={{
          ["--x" as any]: coords.x,
          ["--y" as any]: coords.y,
        }}
        className="group relative bg-white dark:bg-[#0f0e1c] border border-gray-200 dark:border-white/[0.08] hover:border-[#0306ac]/40 dark:hover:border-[#e9bd36]/40 rounded-[24px] xs:rounded-[32px] p-5 xs:p-8 flex flex-col gap-4 xs:gap-6 overflow-hidden cursor-pointer w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
      >
        {/* Border Beam Accent line that slides on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#0306ac] via-blue-500 to-[#0306ac] dark:from-[#e9bd36] dark:via-amber-400 dark:to-[#e9bd36] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

        {/* Premium Grid Dot Background texture */}
        <div className="absolute inset-0 bg-grid-blue-8 bg-[size:24px_24px] opacity-[0.03] dark:opacity-[0.05] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none z-0" />

        {/* Ghost large number — decorative background */}
        <span
          aria-hidden="true"
          className="absolute -right-3 -top-5 font-heading font-black text-[96px] leading-none select-none pointer-events-none
            text-[#0306ac]/[0.04] dark:text-[#e9bd36]/[0.02] group-hover:text-[#0306ac]/[0.08] dark:group-hover:text-[#e9bd36]/[0.05]
            group-hover:-translate-y-1 transition-all duration-500 z-0"
        >
          {formattedNum}
        </span>

        {/* Interactive Cursor Spotlight Glow Effect */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 dark:hidden"
          style={{
            background: "radial-gradient(circle 120px at var(--x) var(--y), rgba(3, 6, 172, 0.05), transparent 80%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0 hidden dark:block"
          style={{
            background: "radial-gradient(circle 120px at var(--x) var(--y), rgba(233, 189, 54, 0.06), transparent 80%)",
          }}
        />

        {/* Decorative colored radial background glow on hover */}
        <div className="absolute -bottom-20 -right-20 w-44 h-44 rounded-full opacity-0 group-hover:opacity-[0.12] blur-3xl transition-all duration-500 pointer-events-none z-0 bg-[#0306ac] dark:bg-[#e9bd36]" />

        {/* Icon Wrapper (Solid fill on hover) */}
        <div className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500
          bg-[#0306ac]/[0.06] border border-[#0306ac]/10 group-hover:bg-gradient-to-br group-hover:from-[#0306ac] group-hover:to-blue-600 group-hover:border-transparent group-hover:shadow-[0_8px_20px_rgba(3,6,172,0.2)]
          dark:bg-[#e9bd36]/[0.10] dark:border-[#e9bd36]/15 dark:group-hover:from-[#e9bd36] dark:group-hover:to-amber-500 dark:group-hover:border-transparent dark:group-hover:shadow-[0_8px_20px_rgba(233,189,54,0.25)]
          group-hover:scale-105 group-hover:rotate-[2deg]"
        >
          <Icon className="w-6 h-6 text-[#0306ac] dark:text-[#e9bd36] transition-all duration-300 group-hover:text-white dark:group-hover:text-[#0c0b18] group-hover:scale-110" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col gap-3.5 flex-1">
          {card.tag && (
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#0306ac] dark:text-[#e9bd36] bg-[#0306ac]/5 dark:bg-[#e9bd36]/10 px-2.5 py-1 rounded-full w-fit">
              {card.tag}
            </span>
          )}
          <h3 className="font-heading text-[18px] font-extrabold leading-snug text-gray-900 dark:text-white transition-colors duration-300 group-hover:text-[#0306ac] dark:group-hover:text-[#e9bd36]">
            {card.title}
          </h3>
          <p className="text-[13px] text-gray-600 dark:text-zinc-400 leading-relaxed font-normal">
            {card.desc}
          </p>

          {/* Feature Checkpoints */}
          {Array.isArray(card.features) && card.features.length > 0 && (
            <ul className="flex flex-col gap-2.5 pt-4 mt-auto border-t border-gray-100 dark:border-white/[0.05] group-hover:border-[#0306ac]/20 dark:group-hover:border-[#e9bd36]/20 transition-colors duration-500">
              {card.features.slice(0, 4).map((feature, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-zinc-300 transition-all duration-300 group-hover:translate-x-1"
                >
                  <span className="w-4 h-4 rounded-full bg-[#0306ac]/[0.08] dark:bg-[#e9bd36]/[0.1] flex items-center justify-center shrink-0 mt-0.5 border border-[#0306ac]/10 dark:border-[#e9bd36]/10 transition-all duration-300 group-hover:bg-[#0306ac] dark:group-hover:bg-[#e9bd36] group-hover:border-transparent">
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#0306ac] dark:text-[#e9bd36] transition-colors duration-300 group-hover:text-white dark:group-hover:text-[#0c0b18]" />
                  </span>
                  <span className="font-semibold leading-normal">{feature}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Bottom Footer Action Area */}
        <div className="relative z-10 flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/[0.05] group-hover:border-[#0306ac]/20 dark:group-hover:border-[#e9bd36]/20 transition-colors duration-500 mt-auto">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 text-gray-600 dark:text-zinc-400 group-hover:text-[#0306ac] dark:group-hover:text-[#e9bd36]">
            {ctaText}
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
          {/* Decorative arrow circle container that slides in on hover */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 border opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0
            border-[#0306ac]/20 bg-[#0306ac]/[0.05] dark:border-[#e9bd36]/20 dark:bg-[#e9bd36]/[0.08]
            group-hover:shadow-[0_4px_12px_rgba(3,6,172,0.15)] dark:group-hover:shadow-[0_4px_12px_rgba(233,189,54,0.2)]"
          >
            <ArrowRight className="w-4 h-4 text-[#0306ac] dark:text-[#e9bd36]" />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export default function ServicesTemplate({ pageData }: { pageData?: any; params?: any }) {
  const { allBlogs, blogSection, faq } = useContent();

  // Strictly use this specific page's own content
  const content = pageData?.content || {};

  const hero = {
    badgeText: content.hero?.badgeText || "ENGINEERED FOR COMPOUNDING ROI",
    titleIntro: content.hero?.titleIntro || "High-Performance Growth &",
    titleHighlight: content.hero?.titleHighlight || "Digital Architecture",
    description: content.hero?.description || "From custom Next.js platforms to full-funnel acquisition engines, we design, engineer, and scale market-leading digital products that dominate competitive categories.",
    bgImage: content.hero?.bgImage || content.hero?.backgroundImage || "/portfolio_hero_bg.png",
    ctaPrimary: {
      label: content.hero?.ctaPrimary?.label || "Schedule Strategy Call",
      href: content.hero?.ctaPrimary?.href || "/contact",
    },
    ctaSecondary: {
      label: content.hero?.ctaSecondary?.label || "Explore Inclusions",
      href: content.hero?.ctaSecondary?.href || "#services-grid",
    },
  };

  const grid = {
    eyebrow: content.grid?.eyebrow || "OUR CORE CAPABILITIES",
    titleIntro: content.grid?.titleIntro || "Engineered Services For",
    titleHighlight: content.grid?.titleHighlight || "Compounding Growth",
    subtext: content.grid?.subtext || "Every service is built on scalable modern engineering, conversion rate science, and relentless performance standards.",
    ctaText: content.grid?.ctaText || "Explore Scope & Inclusions",
  };

  const ctaBanner = {
    eyebrow: content.ctaBanner?.eyebrow || "READY TO ACCELERATE?",
    titleIntro: content.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleHighlight: content.ctaBanner?.titleHighlight || "Competitive Edge",
    titleLine2: content.ctaBanner?.titleLine2 || "Together.",
    description: content.ctaBanner?.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: content.ctaBanner?.ctaPrimary?.label || "Book Strategy Session",
      href: content.ctaBanner?.ctaPrimary?.href || "/contact",
    },
    ctaSecondary: {
      label: content.ctaBanner?.ctaSecondary?.label || "Direct Office Line",
      href: content.ctaBanner?.ctaSecondary?.href || "/contact",
    },
    portraitSrc: content.ctaBanner?.portraitSrc || "/founder.png",
    portraitAlt: content.ctaBanner?.portraitAlt || "Mohsin Designs Lead Architect",
  };

  // Get service inventory list from database
  const rawServices = Array.isArray(content?.globalServices) && content.globalServices.length > 0
    ? content.globalServices
    : (Array.isArray(content?.services) && content.services.length > 0 ? content.services : []);

  const activeServices = rawServices.filter((s: any) => s.status !== "draft");

  // Map each service to cards format
  const cards = activeServices.map((s: any, idx: number) => ({
    id: (idx + 1).toString().padStart(2, "0"),
    iconName: s.icon || "Search",
    tag: s.tag || "Premium Solution",
    title: s.title || "Service Offering",
    desc: s.hero?.description || s.description || "High-performance digital engineering and growth architecture tailored to maximize brand equity.",
    features: s.hero?.benefits || s.features || (s.whatIncluded?.pillars ? s.whatIncluded.pillars.map((p: any) => p.title) : ["Custom Scope Blueprint", "Conversion Rate Optimization", "Dedicated SLA Support"]),
    slug: s.slug || s.title?.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-"),
  }));

  return (
    <main className="flex-1 w-full bg-white dark:bg-[#080710] text-gray-900 dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans">

      {/* ── Floating blobs ─────────────────────────────────────────────────── */}
      <div className="absolute top-[3%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#0306ac]/[0.03] dark:bg-[#0306ac]/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-[#e9bd36]/[0.02] dark:bg-[#e9bd36]/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
      <div className="absolute bottom-[20%] left-[-12%] w-[48vw] h-[48vw] rounded-full bg-[#0306ac]/[0.02] dark:bg-[#0306ac]/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />

      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      {(hero as any)?.enabled !== false && (
        <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[230px] pb-16 sm:pb-24 relative overflow-hidden border-b border-gray-200 dark:border-white/10">

          {/* Full background bleed image */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            <img
              src={hero.bgImage || "/portfolio_hero_bg.png"}
              alt="Services Background"
              className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* LEFT: Text */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as any }}
                className="lg:col-span-8 space-y-6 text-left"
              >
                {/* Badge */}
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#e9bd36] px-4 py-1.5 text-[10px] font-mono font-black tracking-widest uppercase text-[#080710] shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#080710]" />
                    {hero.badgeText}
                  </span>
                  <div className="h-[1px] w-12 bg-gray-300 dark:bg-zinc-700" />
                </div>

                {/* Headline */}
                <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-gray-900 dark:text-white max-w-3xl">
                  {hero.titleIntro}{" "}
                  <span className="relative inline-block text-[#0306ac] dark:text-[#e9bd36] pb-1 ml-1">
                    {hero.titleHighlight}
                    <svg
                      className="absolute -bottom-1.5 left-0 w-full h-3.5 pointer-events-none text-[#e9bd36] opacity-90"
                      viewBox="0 0 100 10"
                      preserveAspectRatio="none"
                    >
                      <motion.path
                        d="M 2 5 Q 50 1.5, 98 3.5 C 99 3.5, 99 4.5, 98 5 Q 50 7, 2 5.5 Z"
                        fill="currentColor"
                        custom={{ delay: 0.5, duration: 0.65 }}
                        variants={drawVariants}
                        initial="hidden"
                        animate="visible"
                      />
                    </svg>
                  </span>
                </h1>

                <p className="text-sm sm:text-base font-sans text-gray-600 dark:text-zinc-300 leading-relaxed max-w-2xl">
                  {hero.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href={hero.ctaPrimary.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#0306ac] text-white hover:bg-[#020485] dark:bg-[#e9bd36] dark:text-[#080710] dark:hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span>{hero.ctaPrimary.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={hero.ctaSecondary.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white dark:bg-white/5 border border-gray-300 dark:border-white/15 text-gray-800 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                  >
                    <span>{hero.ctaSecondary.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      )}

      {/* ── 2. SERVICES GRID ────────────────────────────────────────────────── */}
      {(grid as any)?.enabled !== false && (
        <section id="services-grid" className="relative overflow-hidden py-16 sm:py-20 md:py-24 border-b border-gray-200 dark:border-white/10">

          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-14 space-y-4"
            >
              <div className="flex justify-center">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#0306ac]/5 dark:bg-[#e9bd36]/10 border border-[#0306ac]/10 dark:border-[#e9bd36]/20 px-4 py-1.5 text-[10px] font-mono font-bold tracking-widest uppercase text-[#0306ac] dark:text-[#e9bd36]">
                  {grid.eyebrow}
                </span>
              </div>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-gray-900 dark:text-white">
                {grid.titleIntro}{" "}
                <span className="relative inline-block text-[#0306ac] dark:text-[#e9bd36] pb-1 ml-1">
                  {grid.titleHighlight}
                  <svg
                    className="absolute -bottom-1.5 left-0 w-full h-3.5 pointer-events-none text-[#e9bd36] opacity-90"
                    viewBox="0 0 100 10"
                    preserveAspectRatio="none"
                  >
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
              <p className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                {grid.subtext}
              </p>
            </motion.div>

            {/* Cards — Responsive 1/2/3/4 col grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card: any, i: number) => (
                <ServiceCard key={card.id || i} card={card} index={i} ctaText={grid.ctaText} />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── 3. CTA BANNER ──────────────────────────────────────────────────── */}
      {(ctaBanner as any)?.enabled !== false && (
        <section className="my-16 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0306ac] via-[#020485] to-[#010252] text-white p-8 sm:p-12 lg:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8"
            >
              {/* Left text column */}
              <div className="relative z-10 flex flex-col justify-center gap-5 lg:max-w-[62%]">

                {/* Eyebrow */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                  </span>
                  {ctaBanner.eyebrow}
                </div>

                {/* Headline */}
                <h2 className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.35] tracking-tight text-white">
                  {ctaBanner.titleIntro}{" "}
                  <span className="relative inline-block">
                    <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                      {ctaBanner.titleHighlight}
                    </span>
                    <svg
                      className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]"
                      viewBox="0 0 100 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    >
                      <path d="M 5 6 C 30 9, 70 9, 95 4" />
                    </svg>
                  </span>{" "}
                  {ctaBanner.titleLine2}
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base font-sans text-white/90 leading-relaxed max-w-lg">
                  {ctaBanner.description}
                </p>

                {/* Buttons */}
                <div className="flex items-center gap-4 flex-wrap pt-2">
                  <Link
                    href={ctaBanner.ctaPrimary.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#E9BD36] text-[#080710] hover:bg-amber-400 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <span>{ctaBanner.ctaPrimary.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={ctaBanner.ctaSecondary.href}
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all"
                  >
                    <span>{ctaBanner.ctaSecondary.label}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Right portrait arch */}
              <div className="hidden lg:flex flex-1 items-end justify-center relative pr-4">
                <div className="absolute bottom-0 w-[300px] h-[300px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
                <div className="relative z-10 w-[260px] h-[340px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl bg-[#010252]">
                  <Image
                    src={ctaBanner.portraitSrc || "/founder.png"}
                    alt={ctaBanner.portraitAlt || "Lead Architect"}
                    width={300}
                    height={380}
                    className="w-full h-full object-cover object-top filter contrast-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                </div>
                <div className="absolute top-12 right-24 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ── 4. FAQS ────────────────────────────────────────────────────────── */}
      {(pageData?.content?.faqs?.enabled !== false && pageData?.content?.faqSection?.enabled !== false) && (
        <PageInlineFaqs 
          faqs={(pageData?.content?.faqs && pageData.content.faqs.length > 0) ? pageData.content.faqs : faq?.items} 
          faqSchemaMarkup={pageData?.content?.faqSchemaMarkup || pageData?.faqSchemaMarkup} 
          badge={pageData?.content?.faqBadge}
          title={pageData?.content?.faqTitleHighlight || pageData?.content?.faqTitle}
          description={pageData?.content?.faqDescription}
          data={pageData?.content}
        />
      )}

      {/* ── 5. BLOG SECTION ────────────────────────────────────────────────── */}
      {pageData?.content?.blogSection?.enabled !== false && pageData?.content?.blogSection && Array.isArray(pageData.content.blogSection.selectedPosts) && pageData.content.blogSection.selectedPosts.length > 0 && (
        <BlogSection
          title={pageData.content.blogSection.title}
          subtitle={pageData.content.blogSection.subtitle}
          description={pageData.content.blogSection.description}
          data={pageData.content.blogSection}
          posts={allBlogs ? allBlogs.filter((p: any) => pageData.content.blogSection.selectedPosts.includes(p._id)) : []}
        />
      )}

      {/* Cursive Font Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive {
          font-family: 'Dancing Script', cursive;
        }
      `}} />
    </main>
  );
}
