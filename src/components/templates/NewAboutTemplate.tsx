"use client";

import { motion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Play,
  Compass,
  Palette,
  Code,
  Rocket,
  ShoppingCart,
  Building2,
  Heart,
  GraduationCap,
  Database,
  Utensils,
  Scale,
  Star,
  Users,
  ShieldCheck,
  Search,
  Megaphone,
  Globe,
  Trophy,
  Target,
  Lightbulb,
  MessageSquare,
  Clock,
  Headphones,
  Handshake,
  TrendingUp,
  Zap
} from "lucide-react";
import { useContent } from "@/hooks/useContent";

// ── Drawing Animation for Hand-Drawn SVG Underlines ────────────────
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

const TickerDigit = ({ digit }: { digit: number }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <span
      className="relative inline-block overflow-hidden select-none"
      style={{
        width: "0.58em",
        height: "1em"
      }}
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col w-full"
        initial={{ y: 0 }}
        whileInView={{ y: `-${digit}em` }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 45,
          damping: 12,
          mass: 0.8,
          delay: 0.1
        }}
      >
        {numbers.map((num) => (
          <span
            key={num}
            className="flex items-center justify-center leading-none bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-500 dark:from-brand-yellow dark:to-amber-400"
            style={{
              height: "1em",
              WebkitBackgroundClip: "text"
            }}
          >
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

const DigitTicker = ({ value }: { value: number }) => {
  const digits = String(value || 0).split("");
  return (
    <span className="inline-flex items-baseline">
      {digits.map((digit, idx) => {
        if (isNaN(Number(digit))) {
          return (
            <span
              key={idx}
              className="leading-none bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-500 dark:from-brand-yellow dark:to-amber-400"
              style={{ WebkitBackgroundClip: "text" }}
            >
              {digit}
            </span>
          );
        }
        return <TickerDigit key={idx} digit={Number(digit)} />;
      })}
    </span>
  );
};

export default function NewAboutTemplate({ pageData }: { pageData?: any; params?: any }) {
  const content = useContent();
  const rawAbout = pageData?.content || content?.newAboutPage || {};

  // Safely extract all 11 sections
  const hero = rawAbout.hero || {};
  const stats = rawAbout.stats || {};
  const whoWeAre = rawAbout.whoWeAre || {};
  const philosophy = rawAbout.philosophy || {};
  const servicesDirectory = rawAbout.servicesDirectory || {};

  const allMasterServices = Array.isArray(content?.services?.services)
    ? content.services.services
    : (Array.isArray(content?.services)
      ? content.services
      : (Array.isArray((content as any)?.globalServices)
        ? (content as any).globalServices
        : (Array.isArray(content?.services?.list) ? content.services.list : [])));

  const rawStages = Array.isArray(servicesDirectory.stages) && servicesDirectory.stages.length > 0
    ? servicesDirectory.stages
    : (Array.isArray(servicesDirectory.selectedServices) ? servicesDirectory.selectedServices : []);

  const stagesList = rawStages.map((item: any, idx: number) => {
    const matchedMaster = allMasterServices.find((s: any) =>
      (item.serviceId && (s.id === item.serviceId || s._id === item.serviceId)) ||
      (item.slug && s.slug === item.slug) ||
      (item.title && s.title?.toLowerCase() === item.title?.toLowerCase()) ||
      (item.name && (s.title?.toLowerCase() === item.name?.toLowerCase() || s.name?.toLowerCase() === item.name?.toLowerCase()))
    ) || {};

    const full = { ...matchedMaster, ...item };

    const title = full.title || full.name || "";
    const category = (full.category && full.category !== "DIGITAL ENGINEERING")
      ? full.category
      : (full.tag || (full.badge && full.badge !== "CORE CAPABILITY" ? full.badge : "") || "");
    const badge = (full.badge && full.badge !== "CORE CAPABILITY" && full.badge !== category)
      ? full.badge
      : (full.tag && full.tag !== category ? full.tag : "");
    const image = full.image || full.hero?.bgImage || full.hero?.backgroundImage || full.deepDive?.image || full.overviewImage || full.caseStudy?.image || "";
    const desc = full.desc || full.description || full.hero?.description || full.tagline || full.shortDescription || full.deepDive?.desc || "";
    const deliverables = Array.isArray(full.deliverables) && full.deliverables.length > 0
      ? full.deliverables
      : (Array.isArray(full.hero?.benefits) && full.hero.benefits.length > 0
        ? full.hero.benefits
        : (Array.isArray(full.features) && full.features.length > 0
          ? full.features
          : (Array.isArray(full.whatIncluded?.pillars)
            ? full.whatIncluded.pillars.map((p: any) => p.title || p.desc).filter(Boolean)
            : [])));
    const navTitle = full.navTitle || title;
    const navTag = full.navTag || (category ? category.toUpperCase() : `STAGE 0${idx + 1}`);
    const iconName = full.iconName || full.icon || "Code";
    const slug = full.slug || "";

    return {
      id: full.id || `0${idx + 1}`,
      title,
      category,
      badge,
      image,
      desc,
      deliverables,
      navTitle,
      navTag,
      iconName,
      slug
    };
  });
  const methodology = rawAbout.methodology || {};
  const domainExpertise = rawAbout.domainExpertise || {};
  const whyChooseUs = rawAbout.whyChooseUs || {};
  const executiveLeadership = rawAbout.executiveLeadership || {};
  const reviews = rawAbout.reviews || {};
  const ctaBanner = rawAbout.ctaBanner || {};

  const [activeService, setActiveService] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);

  const iconMap: Record<string, any> = {
    Globe,
    Rocket,
    Heart,
    Trophy,
    Palette,
    Code,
    Search,
    Megaphone,
    Users,
    Video: Code,
    Compass,
    ShieldCheck,
    ShoppingCart,
    Building2,
    GraduationCap,
    Coins: Trophy,
    Database,
    Utensils,
    Scale,
    Target,
    Lightbulb,
    MessageSquare,
    Clock,
    Headphones,
    Handshake,
    TrendingUp,
    Zap
  };

  const getIcon = (name?: string, fallback = Globe) => {
    if (!name) return fallback;
    return iconMap[name] || fallback;
  };

  useEffect(() => {
    if (stagesList.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
          const topEntry = visible[0];
          const id = topEntry.target.getAttribute("id");
          if (id) {
            const numStr = id.replace("service-stage-", "");
            const idx = parseInt(numStr, 10) - 1;
            if (!isNaN(idx) && idx >= 0) {
              setActiveService(idx);
            }
          }
        }
      },
      {
        rootMargin: "-10% 0px -30% 0px",
        threshold: [0.1, 0.3, 0.5],
      }
    );

    const stages = document.querySelectorAll("[id^='service-stage-']");
    stages.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [stagesList]);

  return (
    <>
      <main className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip">

        {/* Floating Blurred Mesh Blobs */}
        <div className="absolute top-[3%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
        <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-yellow/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
        <div className="absolute bottom-[30%] left-[-12%] w-[48vw] h-[48vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />
        <div className="absolute bottom-[5%] right-[-12%] w-[42vw] h-[42vw] rounded-full bg-brand-yellow/[0.015] dark:bg-brand-yellow/[0.035] blur-[160px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

        {/* ── 1. HERO SECTION ── */}
        <section className="relative overflow-hidden py-4 sm:py-6 md:py-8 border-b border-brand-zinc-200 dark:border-white/10">
          <div className="absolute inset-0 -z-10 bg-linear-grid-blue-4 [background-size:40px_40px] opacity-[0.05] dark:opacity-[0.08]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left"
              >
                {hero.badgeText && (
                  <div className="inline-flex pointer-events-auto">
                    <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[10px] font-black tracking-wider uppercase text-[#080710] select-none shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-[#080710] text-[#080710] shrink-0" />
                      {hero.badgeText}
                    </span>
                  </div>
                )}

                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12] text-brand-dark dark:text-white max-w-xl">
                  {hero.titleIntro || "Architecting Digital Products With "}
                  <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1">
                    {hero.titleHighlight || "Zero Fluff & Pure Precision."}
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

                {hero.description && (
                  <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg">
                    {hero.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {hero.ctaPrimaryText && (
                    <a href={hero.ctaPrimaryHref || "#"} className="btn-primary-cta">
                      <span>{hero.ctaPrimaryText}</span>
                      <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                    </a>
                  )}

                  {hero.ctaSecondaryText && (
                    <a href={hero.ctaSecondaryHref || "#"} className="btn-secondary-cta">
                      <span>{hero.ctaSecondaryText}</span>
                      <span className="btn-icon"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></span>
                    </a>
                  )}
                </div>
              </motion.div>

              <div className="lg:col-span-6 relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center pt-8 lg:pt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  {hero.heroImage ? (
                    <img
                      src={hero.heroImage}
                      alt={hero.heroImageAlt || "About Hero"}
                      className="w-full h-full object-contain filter drop-shadow-2xl"
                    />
                  ) : null}
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 2. STATS BAR SECTION ── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/10 dark:bg-white/[0.005]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
              <div className="lg:col-span-4 flex flex-col justify-between self-stretch text-left">
                <div className="w-full space-y-4">
                  {stats.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
                      </span>
                      {stats.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight leading-[1.12] text-brand-dark dark:text-white">
                    {stats.titleIntro || "Compound Growth & "}
                    <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                      {stats.titleHighlight || "Measurable ROI"}
                    </span>
                  </h2>

                  {stats.description && (
                    <p className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-xs">
                      {stats.description}
                    </p>
                  )}
                </div>

                {Array.isArray(stats.expertiseList) && stats.expertiseList.length > 0 && (
                  <div className="pt-6 mt-8 border-t border-brand-zinc-100 dark:border-white/5 w-full select-none">
                    <span className="text-[7.5px] font-mono tracking-widest text-brand-blue dark:text-brand-yellow uppercase font-black block mb-3">
                      {stats.expertiseHeader || "CORE DISCIPLINES"}
                    </span>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
                      {stats.expertiseList.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-brand-dark dark:text-white text-[9.5px] font-bold uppercase tracking-wider">
                          <span className="text-[8px] font-mono text-brand-zinc-400 dark:text-zinc-500 font-normal">{item.num || `0${idx + 1}`}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 grid grid-cols-2 gap-x-12 gap-y-12 sm:gap-x-16 border-t lg:border-t-0 lg:border-l border-brand-zinc-200/60 dark:border-white/5 pt-10 lg:pt-0 lg:pl-16">
                {(Array.isArray(stats.metrics) ? stats.metrics : []).map((metric: any, idx: number) => {
                  const MetricIcon = getIcon(metric.iconName, Globe);
                  return (
                    <div key={idx} className="flex flex-col items-start relative w-full group hover:-translate-y-1 transition-transform duration-350 ease-out">
                      <div className="relative flex items-center justify-between w-full pb-2.5 mb-3">
                        <MetricIcon className="h-4.5 w-4.5 text-[#0306AC] dark:text-[#E9BD36] transition-transform duration-300 group-hover:rotate-[15deg]" />
                        <span className="text-[8px] font-mono tracking-widest text-brand-zinc-400 dark:text-zinc-500 select-none">{metric.num || `0${idx + 1}`}</span>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-zinc-100 dark:bg-white/5" />
                        <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0306AC] dark:text-[#E9BD36] group-hover:w-full transition-all duration-500 ease-out" />
                      </div>
                      <div className="flex items-baseline gap-0.5 text-brand-dark dark:text-white">
                        <span className="font-heading font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-none text-brand-dark dark:text-white">
                          <DigitTicker value={Number(metric.value) || 0} />
                        </span>
                        <span className="font-heading font-bold text-2xl sm:text-3xl leading-none text-[#0306AC] dark:text-[#E9BD36]">{metric.suffix}</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-black text-brand-dark dark:text-white uppercase tracking-widest mt-3.5 leading-none transition-colors duration-300 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36]">
                        {metric.label}
                      </p>
                      {metric.sublabel && (
                        <p className="text-[9.5px] text-brand-zinc-400 dark:text-zinc-500 mt-2 font-semibold leading-normal max-w-[200px]">
                          {metric.sublabel}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. WHO WE ARE SECTION ── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
          {whoWeAre.watermark && (
            <div className="absolute right-[5%] top-[10%] text-[15vw] sm:text-[12vw] font-heading font-black tracking-tighter text-[#0306AC]/[0.015] dark:text-white/[0.01] pointer-events-none select-none z-0 leading-none">
              {whoWeAre.watermark}
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              <div className="lg:col-span-6 space-y-10 text-left">
                <div className="space-y-4">
                  {whoWeAre.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      {whoWeAre.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                    {whoWeAre.titleIntro || "Built by Engineers, "}
                    <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                      {whoWeAre.titleHighlight || "Guided by Craft."}
                    </span>
                  </h2>

                  {whoWeAre.description && (
                    <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl">
                      {whoWeAre.description}
                    </p>
                  )}
                </div>

                {Array.isArray(whoWeAre.rows) && whoWeAre.rows.length > 0 && (
                  <div className="border-t border-brand-zinc-200 dark:border-white/10 divide-y divide-brand-zinc-200 dark:divide-white/10 w-full">
                    {whoWeAre.rows.map((row: any, idx: number) => (
                      <div key={idx} className="group relative py-6 flex items-start justify-between gap-6 cursor-pointer overflow-hidden transition-all duration-300">
                        <div className="absolute inset-y-0 left-0 w-0 bg-zinc-50 dark:bg-white/[0.02] group-hover:w-full transition-all duration-500 ease-out -z-10" />

                        <div className="flex items-start gap-4 sm:gap-6">
                          <span className="text-[10px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] mt-1 select-none">{row.num || `0${idx + 1}`}</span>
                          <div className="space-y-1">
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-300">
                              {row.title}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-brand-zinc-550 dark:text-zinc-300 font-medium leading-normal max-w-md transition-colors duration-300 group-hover:text-brand-dark dark:group-hover:text-white">
                              {row.desc}
                            </p>
                          </div>
                        </div>
                        <div className="h-7 w-7 rounded-full border border-brand-zinc-300 dark:border-white/10 flex items-center justify-center text-brand-zinc-400 dark:text-zinc-500 group-hover:border-[#0306AC] dark:group-hover:border-[#E9BD36] group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] group-hover:rotate-45 transition-all duration-300 shrink-0">
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:col-span-6 relative h-[380px] sm:h-[480px] w-full flex items-center justify-center select-none">
                <div className="relative w-full h-full max-w-[480px]">
                  {whoWeAre.imgAbstract && (
                    <div className="absolute left-4 top-4 w-[60%] aspect-[1.1] rounded-2xl overflow-hidden border border-brand-zinc-200 dark:border-white/5 shadow-md bg-brand-dark -z-10">
                      <img
                        src={whoWeAre.imgAbstract}
                        alt={whoWeAre.imgAbstractAlt || "Abstract Design"}
                        className="w-full h-full object-cover opacity-60 dark:opacity-80"
                      />
                    </div>
                  )}

                  {whoWeAre.imgWorkspace && (
                    <div className="absolute left-[15%] top-[15%] w-[70%] aspect-[1.3] rounded-2xl overflow-hidden border border-brand-zinc-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#12121e]">
                      <img
                        src={whoWeAre.imgWorkspace}
                        alt={whoWeAre.imgWorkspaceAlt || "Team Workspace"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-grid-blue-4 opacity-[0.02] [background-size:16px_16px]" />
                    </div>
                  )}

                  {whoWeAre.imgUiDetail && (
                    <div className="absolute right-2 bottom-6 w-[55%] aspect-[1.28] rounded-2xl overflow-hidden border border-[#E9BD36]/20 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white dark:bg-[#12121e]">
                      <img
                        src={whoWeAre.imgUiDetail}
                        alt={whoWeAre.imgUiDetailAlt || "UI Detail"}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0306AC]/10 to-transparent mix-blend-overlay pointer-events-none" />
                    </div>
                  )}

                  {whoWeAre.parallaxBadge && (
                    <div className="absolute top-[8%] right-[8%] bg-white/95 dark:bg-[#080710]/95 backdrop-blur-md border border-brand-zinc-200 dark:border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-lg select-none">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      <span className="text-[8px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {whoWeAre.parallaxBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 4. MISSION & VISION SECTION ── */}
        <section
          ref={sectionRef}
          className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] transition-colors duration-300"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-28 sm:space-y-40">
            <div className="text-left max-w-2xl space-y-4">
              {philosophy.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {philosophy.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {philosophy.titleIntro || "The Three Principles That "}
                <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                  {philosophy.titleHighlight || "Drive Our Work"}
                </span>
              </h2>
            </div>

            <div className="space-y-32 sm:space-y-44">
              {/* Mission */}
              {philosophy.mission && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1">
                    <div className="flex items-center gap-4">
                      <span className="font-serif italic text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.mission.num || "01"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.mission.label || "CORE MISSION"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {philosophy.mission.titleIntro || "Eliminating Technical Debt Through "}
                      <span className="font-serif italic text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.mission.titleHighlight || "Intentional Design"}
                      </span>
                    </h3>

                    {philosophy.mission.desc && (
                      <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">
                        {philosophy.mission.desc}
                      </p>
                    )}

                    {philosophy.mission.quote && (
                      <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] italic text-xs font-serif text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.mission.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.mission.tags) && philosophy.mission.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.mission.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Code className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.mission.imgSrc && (
                        <img src={philosophy.mission.imgSrc} alt={philosophy.mission.imgAlt || "Mission"} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.mission.badgeLatency && (
                        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.mission.badgeLatency}</span>
                        </div>
                      )}
                      {philosophy.mission.badgePerformance && (
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.mission.badgePerformance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vision */}
              {philosophy.vision && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  <div className="lg:col-span-7">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.vision.imgSrc && (
                        <img src={philosophy.vision.imgSrc} alt={philosophy.vision.imgAlt || "Vision"} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.vision.badgeAccessibility && (
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.vision.badgeAccessibility}</span>
                        </div>
                      )}
                      {philosophy.vision.badgeLighthouse && (
                        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.vision.badgeLighthouse}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left">
                    <div className="flex items-center gap-4">
                      <span className="font-serif italic text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.vision.num || "02"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.vision.label || "GLOBAL VISION"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {philosophy.vision.titleIntro || "Setting the Global Standard in "}
                      <span className="font-serif italic text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.vision.titleHighlight || "Modern Web Engineering"}
                      </span>
                    </h3>

                    {philosophy.vision.desc && (
                      <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">
                        {philosophy.vision.desc}
                      </p>
                    )}

                    {philosophy.vision.quote && (
                      <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] italic text-xs font-serif text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.vision.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.vision.tags) && philosophy.vision.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.vision.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Palette className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Values */}
              {philosophy.values && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  <div className="lg:col-span-5 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1">
                    <div className="flex items-center gap-4">
                      <span className="font-serif italic text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.values.num || "03"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.values.label || "SHARED VALUES"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {philosophy.values.titleIntro || "Radical Transparency & "}
                      <span className="font-serif italic text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.values.titleHighlight || "Relentless Ownership"}
                      </span>
                    </h3>

                    {philosophy.values.desc && (
                      <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">
                        {philosophy.values.desc}
                      </p>
                    )}

                    {philosophy.values.quote && (
                      <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] italic text-xs font-serif text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.values.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.values.tags) && philosophy.values.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.values.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Target className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="lg:col-span-7 order-1 lg:order-2">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.values.imgSrc && (
                        <img src={philosophy.values.imgSrc} alt={philosophy.values.imgAlt || "Values"} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.values.badgeSync && (
                        <div className="absolute top-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.values.badgeSync}</span>
                        </div>
                      )}
                      {philosophy.values.badgeSprint && (
                        <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.values.badgeSprint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── 5. OUR SERVICES SECTION ──────── */}
        {stagesList.length > 0 && (
          <section id="services-directory" className="relative overflow-x-clip py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
            {/* Mobile Pills */}
            <div className="sticky top-14 sm:top-16 z-30 flex lg:hidden overflow-x-auto no-scrollbar py-3 px-4 gap-2 bg-white/95 dark:bg-[#080710]/95 backdrop-blur-xl border-b border-brand-zinc-200 dark:border-white/10 shadow-sm mb-8 select-none">
              {stagesList.map((item: any, idx: number) => {
                const isActive = activeService === idx;
                return (
                  <button
                    key={item.id || idx}
                    onClick={() => {
                      setActiveService(idx);
                      const el = document.getElementById(`service-stage-${item.id || idx + 1}`);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.pageYOffset - 110;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 flex items-center gap-2 transition-all duration-300 ${isActive
                      ? "bg-[#0306AC] text-white dark:bg-[#E9BD36] dark:text-brand-dark shadow-md"
                      : "bg-zinc-100 text-brand-zinc-600 dark:bg-white/5 dark:text-zinc-400"
                      }`}
                  >
                    <span>{item.id || `0${idx + 1}`}</span>
                    <span>{item.navTitle || item.title || item.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                {/* Sticky Nav */}
                <div className="hidden lg:block lg:col-span-5 lg:sticky lg:top-24 self-start z-20">
                  <div className="p-6 sm:p-7 rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18]/90 border border-brand-zinc-200/80 dark:border-white/10 shadow-2xl backdrop-blur-xl space-y-5 text-left relative overflow-hidden">
                    <div className="space-y-3">
                      {servicesDirectory.eyebrow && (
                        <div className="eyebrow-pill">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                          </span>
                          {servicesDirectory.eyebrow}
                        </div>
                      )}

                      <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                        {servicesDirectory.titleIntro || "Full-Spectrum Digital "}
                        <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                          {servicesDirectory.titleHighlight || "Engineering Services"}
                        </span>
                      </h2>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-brand-zinc-200/80 dark:border-white/10 select-none relative">
                      {stagesList.map((item: any, idx: number) => {
                        const isActive = activeService === idx;
                        return (
                          <a
                            key={item.id || idx}
                            href={`#service-stage-${item.id || idx + 1}`}
                            className={`py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 group relative ${isActive
                              ? "bg-[#0306AC] text-white dark:bg-[#E9BD36] dark:text-[#080710] shadow-xl scale-[1.02] font-bold"
                              : "hover:bg-zinc-200/60 dark:hover:bg-white/5 text-brand-zinc-600 dark:text-zinc-400"
                              }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveService(idx);
                              const el = document.getElementById(`service-stage-${item.id || idx + 1}`);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`font-serif italic text-xs font-black transition-colors ${isActive ? "text-[#E9BD36] dark:text-[#080710]" : "text-brand-zinc-400 dark:text-zinc-400"}`}>{item.id || `0${idx + 1}`}</span>
                              <span className="font-heading text-xs tracking-tight">{item.navTitle || item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.navTag && (
                                <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${isActive ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#080710]" : "bg-black/5 dark:bg-white/10 text-brand-zinc-550 dark:text-zinc-300"}`}>{item.navTag}</span>
                              )}
                              <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isActive ? "translate-x-1 opacity-100 text-[#E9BD36] dark:text-[#080710]" : "opacity-30 group-hover:opacity-100"}`} />
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {servicesDirectory.consultationBtnText && (
                      <div className="pt-2 border-t border-brand-zinc-200/80 dark:border-white/10">
                        <a
                          href={servicesDirectory.consultationBtnHref || "#contact"}
                          className="w-full py-3.5 rounded-2xl bg-[#E9BD36] text-[#080710] font-mono text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#ffe554] hover:scale-[1.02] transition-all duration-300 shadow-lg"
                        >
                          <span>{servicesDirectory.consultationBtnText}</span>
                          <ArrowRight className="h-4 w-4 text-[#080710]" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stages List */}
                <div className="lg:col-span-7 space-y-10 sm:space-y-14 lg:space-y-16 text-left">
                  {stagesList.map((stage: any, idx: number) => {
                    const StageIcon = getIcon(stage.iconName, Palette);
                    return (
                      <div
                        id={`service-stage-${stage.id || idx + 1}`}
                        key={stage.id || idx}
                        className="rounded-[28px] sm:rounded-[36px] bg-zinc-50/80 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-300 shadow-sm hover:shadow-2xl relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-serif italic text-2xl font-black text-[#0306AC] dark:text-[#E9BD36]">{stage.id || `0${idx + 1}`}</span>
                            {stage.category ? (
                              <>
                                <div className="h-[1px] w-6 bg-brand-zinc-300 dark:bg-white/20" />
                                <span className="text-[9px] font-mono font-bold text-brand-zinc-500 dark:text-zinc-300 uppercase tracking-widest">// {stage.category}</span>
                              </>
                            ) : null}
                          </div>
                          {stage.badge ? (
                            <div className="bg-white dark:bg-white/10 border border-brand-zinc-200 dark:border-white/15 px-3 py-1.5 rounded-xl text-[8.5px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-wider shadow-sm">{stage.badge}</div>
                          ) : null}
                        </div>

                        {stage.image ? (
                          <div className="aspect-[1.65] w-full rounded-2xl overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 relative bg-[#090812]">
                            <img src={stage.image} alt={stage.title} className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 pointer-events-none" />
                            {stage.category ? (
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white select-none">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                                  <StageIcon className="h-4 w-4 text-[#E9BD36]" />
                                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">{stage.category}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="space-y-3">
                          <h3 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight leading-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{stage.title}</h3>
                          {stage.desc && (
                            <p className="text-xs sm:text-sm text-brand-zinc-600 dark:text-zinc-300 font-sans leading-relaxed">{stage.desc}</p>
                          )}
                        </div>

                        <div className="pt-6 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                          {Array.isArray(stage.deliverables) && stage.deliverables.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {stage.deliverables.map((del: string, dIdx: number) => (
                                <span key={dIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 px-3 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                                  {del}
                                </span>
                              ))}
                            </div>
                          )}

                          <a href={servicesDirectory.getStartedHref || (stage.slug ? `/services/${stage.slug}` : "#contact")} className="inline-flex items-center gap-2 text-xs font-mono font-black text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                            <span>{servicesDirectory.getStartedText || "Explore Service"}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 6. PROCESS SECTION ──────── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-12">
              <div className="max-w-2xl space-y-4">
                {methodology.eyebrow && (
                  <div className="eyebrow-pill">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                    </span>
                    {methodology.eyebrow}
                  </div>
                )}
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                  {methodology.titleIntro || "Engineering Precision From "}
                  <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                    {methodology.titleHighlight || "Concept to Production"}
                  </span>
                </h2>
              </div>
              {methodology.description && (
                <div className="max-w-md space-y-3">
                  <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{methodology.description}</p>
                </div>
              )}
            </div>

            {Array.isArray(methodology.steps) && methodology.steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch text-left">
                {methodology.steps.map((process: any, idx: number) => {
                  const StepIcon = getIcon(process.iconName, Search);
                  return (
                    <motion.div
                      key={process.step || idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-[36px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-8 sm:p-9 text-brand-dark dark:text-white flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-500 shadow-sm relative overflow-hidden"
                    >
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-serif italic text-4xl font-black text-[#0306AC] dark:text-[#E9BD36]">{process.step || `0${idx + 1}`}</span>
                            <div className="h-[1px] w-6 bg-brand-zinc-300 dark:bg-white/20" />
                            <span className="text-[9px] font-mono font-bold text-brand-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{process.badge}</span>
                          </div>
                          <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 group-hover:bg-[#0306AC] group-hover:text-white dark:group-hover:bg-[#E9BD36] dark:group-hover:text-brand-dark transition-all duration-300 shadow-md">
                            <StepIcon className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-heading text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{process.title}</h3>
                          <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{process.desc}</p>
                        </div>
                      </div>

                      {Array.isArray(process.deliverables) && process.deliverables.length > 0 && (
                        <div className="pt-5 border-t border-brand-zinc-200/70 dark:border-white/10 space-y-3 mt-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-brand-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{methodology.deliverablesLabel || "DELIVERABLES"}</span>
                            <span className="text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] uppercase tracking-wider">{methodology.stepLabelPrefix || "STAGE"} {idx + 1} OF {methodology.steps.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {process.deliverables.map((del: string, dIdx: number) => (
                              <span key={dIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-3 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-700 dark:text-zinc-300 uppercase shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── 7. DOMAIN EXPERTISE SECTION ──────── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-12">
              <div className="max-w-2xl space-y-4">
                {domainExpertise.eyebrow && (
                  <div className="eyebrow-pill">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                    </span>
                    {domainExpertise.eyebrow}
                  </div>
                )}
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                  {domainExpertise.titleIntro || "Deep Experience Across "}
                  <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                    {domainExpertise.titleHighlight || "Diverse Industries"}
                  </span>
                </h2>
              </div>
              {domainExpertise.description && (
                <div className="max-w-md space-y-3">
                  <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{domainExpertise.description}</p>
                </div>
              )}
            </div>

            {Array.isArray(domainExpertise.domains) && domainExpertise.domains.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch text-left">
                {domainExpertise.domains.map((domain: any, idx: number) => {
                  const DomainIcon = getIcon(domain.iconName, ShoppingCart);
                  return (
                    <motion.div
                      key={domain.id || idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-500 shadow-sm relative overflow-hidden"
                    >
                      <div className="space-y-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 transition-all duration-300 shadow-md">
                            <DomainIcon className="h-5 w-5" />
                          </div>
                          <span className="font-serif italic text-2xl font-black text-brand-zinc-300 dark:text-zinc-600 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{domain.id || `0${idx + 1}`}</span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{domain.title}</h3>
                          <p className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{domain.desc}</p>
                        </div>
                      </div>

                      {Array.isArray(domain.tags) && domain.tags.length > 0 && (
                        <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap gap-1.5 relative z-10">
                          {domain.tags.map((tag: string, tIdx: number) => (
                            <span key={tIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-2.5 py-0.5 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase shadow-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* ── 8. WHY BUSINESSES CHOOSE US SECTION ──────── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="text-center flex flex-col items-center max-w-3xl mx-auto space-y-4">
              {whyChooseUs.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {whyChooseUs.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {whyChooseUs.titleIntro || "Why Visionary Leaders "}
                <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                  {whyChooseUs.titleHighlight || "Choose Mohsin Designs"}
                </span>
              </h2>

              {whyChooseUs.description && (
                <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
                  {whyChooseUs.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4 relative flex justify-center z-10">
                <div className="relative w-full rounded-[36px] overflow-hidden bg-brand-blue border border-brand-blue shadow-2xl p-8 sm:p-9 flex flex-col justify-between min-h-[460px] lg:min-h-[520px] z-10">
                  <div className="max-w-[220px] space-y-1.5 z-10 text-left">
                    <div className="h-[2.5px] w-7 bg-brand-yellow mb-4" />
                    <p className="text-white text-sm sm:text-base font-semibold leading-snug tracking-tight">{whyChooseUs.blueCardLine1 || "Direct Founder"}</p>
                    <p className="text-brand-yellow text-lg sm:text-xl font-extrabold leading-none pt-1">{whyChooseUs.blueCardLine2 || "Architecture & Execution"}</p>
                  </div>

                  {whyChooseUs.blueCardImage && (
                    <div className="relative mt-8 -mx-8 sm:-mx-9 -mb-8 sm:-mb-9 rounded-b-[36px] overflow-hidden shadow-inner">
                      <img src={whyChooseUs.blueCardImage} alt={whyChooseUs.blueCardImageAlt || "Feature"} className="w-full h-64 sm:h-72 lg:h-80 object-cover object-center" />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 relative z-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                {(Array.isArray(whyChooseUs.features) ? whyChooseUs.features : []).map((feat: any, idx: number) => {
                  const FeatIcon = getIcon(feat.iconName, Target);
                  return (
                    <div key={idx} className="p-7 rounded-[24px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/70 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-start justify-between min-h-[220px] group">
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${feat.iconBg === "amber" ? "bg-amber-50/80 dark:bg-amber-500/10 text-amber-500 dark:text-[#E9BD36]" : "bg-blue-50/80 dark:bg-white/5 text-[#0306AC] dark:text-[#E9BD36]"} group-hover:scale-110 transition-transform`}>
                        <FeatIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="h-[2.5px] w-6 bg-[#0306AC] dark:bg-[#E9BD36] mb-3" />
                        <h3 className="font-heading font-extrabold text-base text-brand-dark dark:text-white tracking-tight mb-2">{feat.title}</h3>
                        <p className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{feat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ── 9. ABOUT FOUNDER SECTION ──────── */}
        <section className="relative overflow-hidden py-12 sm:py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              <div className="lg:col-span-5 flex justify-center">
                {executiveLeadership.portraitSrc && (
                  <div className="relative aspect-[4/5] w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-brand-zinc-200/60 dark:border-white/10 relative group">
                    <img src={executiveLeadership.portraitSrc} alt={executiveLeadership.portraitAlt || "Founder"} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute left-6 bottom-6 text-white text-left z-10 select-none">
                      <div className="font-heading font-extrabold text-xl tracking-tight leading-none text-white">{executiveLeadership.founderName || "Mohsin"}</div>
                      <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block mt-1">{executiveLeadership.founderTitle || "FOUNDER & PRINCIPAL ARCHITECT"}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-7 space-y-8 text-left">
                <div className="space-y-4">
                  {executiveLeadership.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      {executiveLeadership.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                    {executiveLeadership.titleIntro || "Driven by Vision, "}
                    <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                      {executiveLeadership.titleHighlight || "Grounded in Craft"}
                    </span>
                  </h2>
                </div>

                <div className="space-y-4 text-base sm:text-lg font-sans leading-relaxed text-brand-zinc-600 dark:text-zinc-300">
                  {executiveLeadership.bioParagraph1 && <p>{executiveLeadership.bioParagraph1}</p>}
                  {executiveLeadership.bioParagraph2 && <p>{executiveLeadership.bioParagraph2}</p>}
                </div>

                {Array.isArray(executiveLeadership.metrics) && executiveLeadership.metrics.length > 0 && (
                  <div className="grid grid-cols-3 gap-8 border-t border-brand-zinc-200/80 dark:border-white/10 pt-8">
                    {executiveLeadership.metrics.map((m: any, idx: number) => (
                      <div key={idx} className="space-y-1 text-left">
                        <div className="font-serif italic text-4xl sm:text-5xl font-black text-[#0306AC] dark:text-[#E9BD36]">{m.value}</div>
                        <span className="text-[10px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-wider block">{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 10. REVIEWS CAROUSEL ──────── */}
        <ReviewsCarousel reviewsData={reviews} />

        {/* Cursive Font Injector */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
          .font-cursive {
            font-family: 'Dancing Script', cursive;
          }
        `}} />

        {/* ── 11. CTA BANNER SECTION ──────── */}
        <section className="relative overflow-hidden py-8 sm:py-12 bg-white dark:bg-[#080710]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="cta-banner-card">
              <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[58%] text-left">
                {ctaBanner.eyebrow && (
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                    </span>
                    {ctaBanner.eyebrow}
                  </div>
                )}

                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                  {ctaBanner.titleIntro || "Let's Engineer Something "}
                  <span className="whitespace-nowrap inline-block">
                    {ctaBanner.titleWord1 || "Truly "}
                    <span className="relative inline-block">
                      <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">{ctaBanner.titleWord2 || "Remarkable."}</span>
                      <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M 5 6 C 30 9, 70 9, 95 4" />
                      </svg>
                    </span>
                  </span>
                </h2>

                {ctaBanner.description && (
                  <p className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg">
                    {ctaBanner.description}
                  </p>
                )}

                <div className="flex items-center gap-4 flex-wrap pt-2">
                  {ctaBanner.ctaPrimaryText && (
                    <a href={ctaBanner.ctaPrimaryHref || "#contact"} className="btn-primary-cta">
                      <span>{ctaBanner.ctaPrimaryText}</span>
                      <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                    </a>
                  )}

                  {ctaBanner.ctaSecondaryText && (
                    <a href={ctaBanner.ctaSecondaryHref || "#"} className="btn-secondary-cta">
                      <span>{ctaBanner.ctaSecondaryText}</span>
                      <span className="btn-icon"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></span>
                    </a>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
                <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
                {ctaBanner.portraitSrc && (
                  <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                    <Image src={ctaBanner.portraitSrc} alt={ctaBanner.portraitAlt || "Portrait"} width={320} height={420} className="w-full h-full object-cover object-top filter contrast-[1.05]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
                <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
              </div>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

/* ── Inline Reviews Showcase Component ── */
function ReviewsCarousel({ reviewsData }: { reviewsData: any }) {
  const reviewsList = Array.isArray(reviewsData?.list) ? reviewsData.list : [];
  if (reviewsList.length === 0) return null;

  const marqueeTrack1 = [...reviewsList, ...reviewsList, ...reviewsList, ...reviewsList];
  const marqueeTrack2 = [...reviewsList.slice().reverse(), ...reviewsList.slice().reverse(), ...reviewsList.slice().reverse(), ...reviewsList.slice().reverse()];

  return (
    <section className="relative overflow-hidden pt-10 sm:pt-14 pb-4 sm:pb-6 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marqueeRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft 48s linear infinite;
          will-change: transform;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marqueeRight 48s linear infinite;
          will-change: transform;
        }
        .marquee-wrapper:hover .marquee-track-left,
        .marquee-wrapper:hover .marquee-track-right {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className="relative z-10 space-y-12">
        <div className="text-center flex flex-col items-center space-y-5 max-w-3xl mx-auto px-4">
          {reviewsData.eyebrow && (
            <div className="eyebrow-pill">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
              </span>
              {reviewsData.eyebrow}
            </div>
          )}

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15] max-w-2xl">
            {reviewsData.titleIntro || "Trusted by Founders, "}
            <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
              {reviewsData.titleHighlight || "Loved by Engineering Teams"}
            </span>
          </h2>

          {reviewsData.description && (
            <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 max-w-2xl font-normal leading-relaxed">
              {reviewsData.description}
            </p>
          )}

          <div className="pt-1 inline-flex items-center gap-3 sm:gap-4 rounded-full bg-zinc-100/80 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 px-5 py-2 text-xs font-mono shadow-xs">
            <div className="flex gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-brand-dark dark:text-white">{reviewsData.ratingValue || "5.0 / 5.0"}</span>
            <span className="text-zinc-300 dark:text-white/20">|</span>
            <span className="text-brand-zinc-600 dark:text-zinc-300 font-medium">{reviewsData.ratingSub || "Verified Reviews"}</span>
          </div>
        </div>

        <div className="marquee-wrapper space-y-8 overflow-hidden py-8">
          <div className="flex py-4 overflow-visible">
            <div className="marquee-track-left gap-6 items-stretch py-2">
              {marqueeTrack1.map((r: any, i: number) => (
                <div key={`t1-${i}`} className="w-[360px] sm:w-[420px] shrink-0 p-7 sm:p-8 rounded-[32px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/90 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between group select-none cursor-pointer">
                  <div className="space-y-4 relative z-10 text-left">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      {r.tag && (
                        <span className="text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/20 dark:border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                          ⚡ {r.tag}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-sans font-medium text-brand-zinc-700 dark:text-zinc-200 leading-relaxed italic pt-1">
                      "{r.quote}"
                    </p>

                    {r.impact && (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-[9.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{r.impact}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-brand-zinc-200/80 dark:border-white/10 mt-6 relative z-10">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center font-heading font-black text-xs shadow-md shrink-0 border border-white/20" style={{ backgroundColor: r.accent === "#E9BD36" ? "#E9BD36" : "#0306AC", color: r.accent === "#E9BD36" ? "#080710" : "#ffffff" }}>
                        {r.initial || (r.name ? r.name.charAt(0) : "M")}
                      </div>
                      <div>
                        <span className="block text-xs font-heading font-black text-brand-dark dark:text-white uppercase tracking-wider leading-none">{r.name}</span>
                        <span className="block text-[9.5px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] mt-1 leading-none">{r.role}</span>
                        <span className="block text-[8.5px] font-sans text-brand-zinc-400 dark:text-zinc-400 mt-0.5 leading-none">{r.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex py-4 overflow-visible">
            <div className="marquee-track-right gap-6 items-stretch py-2">
              {marqueeTrack2.map((r: any, i: number) => (
                <div key={`t2-${i}`} className="w-[360px] sm:w-[420px] shrink-0 p-7 sm:p-8 rounded-[32px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/90 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between group select-none cursor-pointer">
                  <div className="space-y-4 relative z-10 text-left">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex gap-1 text-amber-400">
                        {[...Array(5)].map((_, si) => (
                          <Star key={si} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </div>
                      {r.tag && (
                        <span className="text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/20 dark:border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
                          ⚡ {r.tag}
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-sans font-medium text-brand-zinc-700 dark:text-zinc-200 leading-relaxed italic pt-1">
                      "{r.quote}"
                    </p>

                    {r.impact && (
                      <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-[9.5px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>{r.impact}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-brand-zinc-200/80 dark:border-white/10 mt-6 relative z-10">
                    <div className="flex items-center gap-3.5 text-left">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center font-heading font-black text-xs shadow-md shrink-0 border border-white/20" style={{ backgroundColor: r.accent === "#E9BD36" ? "#E9BD36" : "#0306AC", color: r.accent === "#E9BD36" ? "#080710" : "#ffffff" }}>
                        {r.initial || (r.name ? r.name.charAt(0) : "M")}
                      </div>
                      <div>
                        <span className="block text-xs font-heading font-black text-brand-dark dark:text-white uppercase tracking-wider leading-none">{r.name}</span>
                        <span className="block text-[9.5px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] mt-1 leading-none">{r.role}</span>
                        <span className="block text-[8.5px] font-sans text-brand-zinc-400 dark:text-zinc-400 mt-0.5 leading-none">{r.company}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
