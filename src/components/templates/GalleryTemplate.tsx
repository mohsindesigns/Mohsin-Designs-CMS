"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Star,
  Play,
  Lightbulb,
  PenTool,
  Code,
  Rocket,
  CheckCircle2,
  Sparkles,
  Layers,
  Globe,
  Layout,
  Palette,
  Share2,
  Award
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import PageInlineFaqs from "@/components/PageInlineFaqs";

// Hand-Drawn SVG Brush stroke variants
const drawVariants = {
  hidden: { pathLength: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    pathLength: 1,
    transition: {
      duration: custom?.duration ?? 0.65,
      delay: custom?.delay ?? 0.45,
      ease: "easeOut" as any
    }
  })
};

// Safe icon resolver for dynamic step icons
function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return <Lightbulb className={className} />;
  const icons = LucideIcons as any;
  const IconComp = icons[name] || icons["Lightbulb"] || Lightbulb;
  return <IconComp className={className} />;
}

export default function GalleryTemplate({ pageData }: { pageData?: any; params?: any }) {
  const pageContent = pageData?.content || {};
  const galleryPage = pageContent.galleryPage || {};

  // ── 1. HERO SECTION DATA ───────────────────────────────────────────────
  const hero = {
    badge: galleryPage.hero?.badge || galleryPage.header?.badge || "OUR PORTFOLIO",
    titlePrefix: galleryPage.hero?.titlePrefix || galleryPage.header?.titlePrefix || "Creative Work.",
    titleHighlight: galleryPage.hero?.titleHighlight || galleryPage.header?.titleHighlight || "Real Results.",
    subtitle: galleryPage.hero?.subtitle || galleryPage.header?.description || "Explore our latest projects — beautifully designed, strategically built, and focused on growing brands online.",
    ctaPrimary: {
      label: galleryPage.hero?.ctaPrimary?.label || "GET A FREE CONSULTATION",
      href: galleryPage.hero?.ctaPrimary?.href || "#contact"
    },
    ctaSecondary: {
      label: galleryPage.hero?.ctaSecondary?.label || "EXPLORE WORK",
      href: galleryPage.hero?.ctaSecondary?.href || "#projects"
    },
    backgroundImage: galleryPage.hero?.backgroundImage || "/portfolio_hero_bg.png"
  };

  // ── 2. PORTFOLIO PROJECTS DATA ─────────────────────────────────────────
  const defaultProjects = [
    {
      id: "1",
      badge: "Web Design",
      brand: "Moshin Designs – Creative Agency",
      subtitle: "Modern, responsive and high-performing website built for a leading agency.",
      image: "/portfolio_card_1.png",
      tag: "+320% Traffic",
      tech: ["Next.js 15", "TailwindCSS", "Framer Motion"],
      link: "/contact"
    },
    {
      id: "2",
      badge: "UI/UX Design",
      brand: "Fintech Dashboard UI",
      subtitle: "Clean, modern and intuitive interface design for financial services.",
      image: "/portfolio_card_2.png",
      tag: "4.9x ROAS",
      tech: ["Figma UI", "System Kit", "Dashboard"],
      link: "/contact"
    },
    {
      id: "3",
      badge: "Web Design",
      brand: "E-Commerce Store",
      subtitle: "Visually stunning and conversion-focused online store for a fashion brand.",
      image: "/portfolio_card_3.png",
      tag: "+185% Leads",
      tech: ["Shopify Pro", "React", "E-Commerce"],
      link: "/contact"
    },
    {
      id: "4",
      badge: "Logo Design",
      brand: "Brand Identity – Nexus Solutions",
      subtitle: "A timeless and professional logo design for a global tech company.",
      image: "/portfolio_card_4.png",
      tag: "100% Custom",
      tech: ["Branding", "Vector Art", "Brand Book"],
      link: "/contact"
    },
    {
      id: "5",
      badge: "Social Media",
      brand: "Digital Marketing Campaign",
      subtitle: "Creative social media visuals that build engagement and trust.",
      image: "/portfolio_card_5.png",
      tag: "+450% Reach",
      tech: ["Social Media", "Marketing", "3D Motion"],
      link: "/contact"
    },
    {
      id: "6",
      badge: "Web Design",
      brand: "Real Estate Website",
      subtitle: "Elegant and modern website for a real estate company.",
      image: "/portfolio_card_6.png",
      tag: "Top #1 Rank",
      tech: ["Next.js", "SEO Pro", "Real Estate"],
      link: "/contact"
    }
  ];

  const projectMode = galleryPage.projectMode || "custom";
  const rawProjects = projectMode === "existing"
    ? (galleryPage.selectedProjects && galleryPage.selectedProjects.length > 0 ? galleryPage.selectedProjects : pageContent.portfolio?.projects || defaultProjects)
    : (galleryPage.projects && galleryPage.projects.length > 0 ? galleryPage.projects : pageContent.portfolio?.projects || defaultProjects);

  const projects = useMemo(() => {
    return (rawProjects || []).map((p: any, idx: number) => {
      // Normalize tech stack array or comma string
      let techList: string[] = [];
      if (Array.isArray(p.tech)) {
        techList = p.tech;
      } else if (typeof p.tech === "string" && p.tech.trim()) {
        techList = p.tech.split(",").map((t: string) => t.trim()).filter(Boolean);
      } else if (p.tags && Array.isArray(p.tags)) {
        techList = p.tags;
      }

      return {
        id: p.id || p._id || String(idx + 1),
        badge: p.badge || p.category || "Project",
        brand: p.brand || p.title || `Project #${idx + 1}`,
        subtitle: p.subtitle || p.desc || p.description || "",
        image: p.image || "/portfolio_card_1.png",
        tag: p.tag || p.outcome || "+300% Growth",
        tech: techList.length > 0 ? techList : ["Next.js", "TailwindCSS", "SEO"],
        link: p.link || "#contact"
      };
    });
  }, [rawProjects]);

  // ── 3. CREATIVE PROCESS SECTION DATA ───────────────────────────────────
  const defaultProcessSteps = [
    {
      step: "01",
      tag: "PHASE 01",
      title: "Discovery & Strategy",
      desc: "Deep research into brand goals, target demographics, and market positioning.",
      icon: "Lightbulb"
    },
    {
      step: "02",
      tag: "PHASE 02",
      title: "UI/UX Design System",
      desc: "Crafting wireframes, responsive layouts, and interactive design prototypes.",
      icon: "PenTool"
    },
    {
      step: "03",
      tag: "PHASE 03",
      title: "Full-Stack Build",
      desc: "Engineering high-speed, mobile-optimized, SEO-ready web architecture.",
      icon: "Code"
    },
    {
      step: "04",
      tag: "PHASE 04",
      title: "Launch & Growth",
      desc: "Flawless deployment, speed optimization, and automated conversion tracking.",
      icon: "Rocket"
    }
  ];

  const processSection = {
    badge: galleryPage.process?.badge || "OUR CREATIVE PROCESS",
    titlePrefix: galleryPage.process?.titlePrefix || "From Concept to ",
    titleHighlight: galleryPage.process?.titleHighlight || "Impact",
    subtitle: galleryPage.process?.subtitle || "A proven 4-step framework engineered for maximum conversion and brand authority.",
    steps: galleryPage.process?.steps && galleryPage.process.steps.length > 0 ? galleryPage.process.steps : defaultProcessSteps
  };

  // ── 4. BOTTOM SIGNATURE CTA BANNER DATA ─────────────────────────────────
  const ctaBanner = {
    eyebrow: galleryPage.ctaBanner?.eyebrow || "LET'S BUILD SOMETHING GREAT",
    titleIntro: galleryPage.ctaBanner?.titleIntro || "Ready to Launch Your",
    titleHighlight: galleryPage.ctaBanner?.titleHighlight || "Next Big Project",
    titleCursive: galleryPage.ctaBanner?.titleCursive || "Today?",
    description: galleryPage.ctaBanner?.description || "Let's turn your vision into a stunning digital reality. Get in touch for a custom strategy, competitive pricing, and fast execution.",
    ctaPrimary: {
      label: galleryPage.ctaBanner?.ctaPrimary?.label || "START YOUR PROJECT",
      href: galleryPage.ctaBanner?.ctaPrimary?.href || "/contact"
    },
    ctaSecondary: {
      label: galleryPage.ctaBanner?.ctaSecondary?.label || "GET FREE ESTIMATE",
      href: galleryPage.ctaBanner?.ctaSecondary?.href || "/contact"
    },
    portraitSrc: galleryPage.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: galleryPage.ctaBanner?.portraitAlt || "Founder & Creative Director"
  };

  return (
    <main className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-6">
      
      {/* Cursive Font Imports for CTA highlight matching */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive {
          font-family: 'Dancing Script', cursive;
        }
      `}} />

      {/* Floating Blurred Mesh Blobs */}
      <div className="absolute top-[1%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-yellow/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* ── 1. HERO SECTION WITH FULL-BLEED BACKGROUND IMAGE ───────── */}
      {((hero as any)?.enabled !== false && (galleryPage as any).hero?.enabled !== false) && (
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[180px] sm:pt-[210px] lg:pt-[240px] pb-12 md:pb-16 relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center border-b border-brand-zinc-200 dark:border-white/10">
        {/* Full Background Graphic spanning entire width behind navbar */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src={hero.backgroundImage}
            alt="Portfolio Hero Background"
            className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
          />
          {/* Subtle gradient overlay ensuring left text is crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#080710] dark:via-[#080710]/80 dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 md:py-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-6 text-left"
          >
            {/* Brand Pill Badge */}
            <div className="inline-flex pointer-events-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[10px] font-black tracking-wider uppercase text-[#080710] select-none shadow-sm">
                <Star className="h-3.5 w-3.5 fill-[#080710] text-[#080710] shrink-0" />
                {hero.badge}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight text-brand-dark dark:text-white">
              {hero.titlePrefix} <br />
              <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1">
                {hero.titleHighlight}
                <svg className="absolute -bottom-1.5 left-0 w-full h-3.5 pointer-events-none text-brand-yellow opacity-90" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <motion.path
                    d="M 2 5 Q 50 1.5, 98 3.5 C 99 3.5, 99 4.5, 98 5 Q 50 7, 2 5.5 Z"
                    fill="currentColor"
                    custom={{ delay: 0.45, duration: 0.65 }}
                    variants={drawVariants}
                    initial="hidden"
                    animate="visible"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg">
              {hero.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={hero.ctaPrimary.href} className="btn-primary-cta">
                <span>{hero.ctaPrimary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>

              <Link href={hero.ctaSecondary.href} className="btn-secondary-cta">
                <span>{hero.ctaSecondary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-12 pb-4">

        {/* ── 2. PORTFOLIO GRID (WITHOUT FILTER TABS) ─────────────────── */}
        {(galleryPage.portfolioGrid?.enabled !== false && galleryPage.projects?.enabled !== false) && (
        <section id="projects" className="my-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project: any) => (
              <div
                key={project.id}
                className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[24px] p-5 sm:p-6 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group select-none relative overflow-hidden"
              >
                <div>
                  {/* Header Row: Category Badge & Outcome Tag */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow border border-brand-blue/20 dark:border-brand-yellow/20">
                      <Star className="w-3 h-3 fill-current" />
                      {project.badge}
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono font-black text-brand-blue dark:text-brand-yellow uppercase tracking-wider bg-brand-blue/5 dark:bg-brand-yellow/5 border border-brand-blue/20 dark:border-brand-yellow/20 px-2.5 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-yellow animate-pulse" />
                      {project.tag}
                    </span>
                  </div>

                  {/* Graphic Preview Image Box */}
                  <div className="relative h-64 sm:h-72 w-full rounded-xl overflow-hidden bg-brand-light dark:bg-zinc-950 border border-brand-zinc-200/60 dark:border-white/10 mb-5">
                    <img
                      src={project.image}
                      alt={project.brand}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors mb-2 leading-snug">
                    {project.brand}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed mb-6">
                    {project.subtitle}
                  </p>
                </div>

                {/* Tech Stack Pills Footer */}
                <div className="flex items-center gap-1.5 flex-wrap pt-4 border-t border-brand-zinc-200/80 dark:border-white/10">
                  {project.tech.map((t: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[9.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 bg-brand-zinc-100 dark:bg-zinc-800/90 border border-brand-zinc-200/60 dark:border-white/10 px-2.5 py-1 rounded-md"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
        )}

        {/* ── 3. OUR CREATIVE PROCESS SECTION (CLEAN 4-STEP GRID) ── */}
        {((processSection as any)?.enabled !== false && (galleryPage as any).processSection?.enabled !== false && (galleryPage as any).process?.enabled !== false) && (
        <section className="my-20">
          <div className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[32px] p-8 sm:p-14 text-center relative overflow-hidden shadow-sm">
            {/* Ambient Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-blue/[0.04] dark:bg-brand-blue/[0.08] rounded-full blur-[100px] pointer-events-none" />

            {/* Section Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 text-brand-blue dark:text-brand-yellow text-[10px] font-black tracking-wider uppercase mb-4 relative z-10">
              {processSection.badge}
            </div>

            {/* Section Heading */}
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white mb-3 relative z-10">
              {processSection.titlePrefix}
              <span className="text-brand-blue dark:text-brand-yellow font-cursive font-normal text-4xl sm:text-5xl lg:text-6xl pl-1">
                {processSection.titleHighlight}
              </span>
            </h2>

            {/* Subtitle */}
            <p className="font-sans text-sm sm:text-base text-brand-zinc-600 dark:text-zinc-300 max-w-xl mx-auto mb-12 leading-relaxed relative z-10">
              {processSection.subtitle}
            </p>

            {/* 4 Process Step Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left relative z-10">
              {processSection.steps.map((s: any) => (
                <div
                  key={s.step}
                  className="bg-brand-zinc-50/90 dark:bg-zinc-900/70 border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-7 rounded-[24px] hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-400 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Badge */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <DynamicIcon name={s.icon} className="w-6 h-6" />
                      </div>

                      <span className="text-xs font-mono font-black text-brand-blue dark:text-brand-yellow bg-brand-blue/5 dark:bg-brand-yellow/5 border border-brand-blue/20 dark:border-brand-yellow/20 px-2.5 py-1 rounded-full">
                        STEP {s.step}
                      </span>
                    </div>

                    {/* Phase Eyebrow Tag */}
                    <span className="text-[9px] font-mono font-extrabold text-brand-zinc-400 uppercase tracking-widest block mb-1">
                      {s.tag}
                    </span>

                    {/* Step Title */}
                    <h4 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors mb-2 leading-snug">
                      {s.title}
                    </h4>

                    {/* Step Description */}
                    <p className="font-sans text-xs sm:text-sm text-brand-zinc-600 dark:text-zinc-300 leading-relaxed font-normal">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        )}

        {/* Inline FAQs if attached */}
        {((pageData?.faq && pageData.faq.length > 0) || (pageData?.faqSchemaMarkup && pageData.faqSchemaMarkup.trim())) && (pageData?.faqSection?.enabled !== false && pageData?.faqs?.enabled !== false) && (
          <div className="my-16">
            <PageInlineFaqs
              faqs={pageData.faq}
              faqSchemaMarkup={pageData.faqSchemaMarkup}
              badge={pageData.faqBadge || "PORTFOLIO FAQ"}
              title={pageData.faqTitle || "Frequently Asked Questions"}
              subtitle={pageData.faqDescription || "Key queries about our design and development deliverables."}
            />
          </div>
        )}

        {/* ── 4. BOTTOM SIGNATURE CTA BANNER ─────────────────────────── */}
        {((ctaBanner as any)?.enabled !== false && (galleryPage as any).ctaBanner?.enabled !== false) && (
        <section id="contact" className="my-12 relative overflow-hidden">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[58%]">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                </span>
                {ctaBanner.eyebrow}
              </div>

              {/* Title with Cursive Accent */}
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                {ctaBanner.titleIntro} <br />
                <span className="whitespace-nowrap inline-block">
                  {ctaBanner.titleHighlight}{" "}
                  <span className="relative inline-block">
                    <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                      {ctaBanner.titleCursive}
                    </span>
                    <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M 5 6 C 30 9, 70 9, 95 4" />
                    </svg>
                  </span>
                </span>
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg">
                {ctaBanner.description}
              </p>

              {/* CTAs */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <Link href={ctaBanner.ctaPrimary.href} className="btn-primary-cta">
                  <span>{ctaBanner.ctaPrimary.label}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </Link>

                <Link href={ctaBanner.ctaSecondary.href} className="btn-secondary-cta">
                  <span>{ctaBanner.ctaSecondary.label}</span>
                  <span className="btn-icon"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></span>
                </Link>
              </div>
            </div>

            {/* Right Side Portrait & Arch Graphic */}
            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <img
                  src={ctaBanner.portraitSrc}
                  alt={ctaBanner.portraitAlt}
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
            </div>
          </div>
        </section>
        )}

      </div>
    </main>
  );
}