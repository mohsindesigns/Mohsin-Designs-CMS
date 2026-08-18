"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  LayoutGrid,
  Paintbrush,
  Search,
  Monitor,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Droplet,
  Home,
  Zap,
  Award
} from "lucide-react";
import { useContent } from "../hooks/useContent";

const iconMap: Record<string, any> = {
  LayoutGrid,
  Paintbrush,
  Search,
  Monitor,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Droplet,
  Home,
  Zap,
  Award
};

const DEFAULT_PORTFOLIO = {
  sectionTag: "CASE STUDIES",
  titleIntro: "Our Recent",
  titleHighlight: "Masterpieces",
  description: "A detailed look at some of our premium agency projects and the measurable results we achieved.",
  swipeHint: "Swipe or drag to navigate",
  labelCaseStudy: "Case Study",
  labelChallenge: "The Challenge",
  labelWhatWeDid: "Our Approach",
  ariaPrev: "Previous project",
  ariaNext: "Next project",
  categories: [
    { id: "all", label: "All Work", iconName: "LayoutGrid" },
    { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
    { id: "dev", label: "Development", iconName: "Monitor" },
    { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
  ],
  caseStudies: [
    {
      num: "01",
      brand: "Veloce SaaS",
      subtitle: "Enterprise-grade Product Design",
      challenge: "Veloce needed a modern, highly converting landing page and product dashboard to decrease churn and improve activation rates.",
      whatWeDid: "We designed a futuristic glassmorphic landing page and fully customized SaaS dashboard with micro-interactions and interactive charts.",
      categories: ["design", "dev"],
      glowClass: "from-orange-500/20 via-red-500/10 to-transparent",
      screenshot: {
        logo: "V",
        brandName: "VELOCE",
        navHome: "Product",
        navServices: "Pricing",
        navCall: "Start Free",
        tag: "Next-Gen SaaS Platform",
        title: "Scale Your Velocity",
        button: "Get Started Now",
        footerTag: "Trusted by 10k+ developers"
      },
      stats: [
        { value: "48%", label: "Activation Boost", iconName: "Zap" },
        { value: "14ms", label: "Core Latency", iconName: "TrendingUp" },
        { value: "99.9%", label: "Platform Uptime", iconName: "Shield" }
      ]
    },
    {
      num: "02",
      brand: "Acme Store",
      subtitle: "E-Commerce Re-platform & Scale",
      challenge: "Struggling with slow page loads and high acquisition costs, Acme needed a headless Shopify storefront designed to scale.",
      whatWeDid: "Created a lightning-fast React storefront and optimized paid ads funnel yielding lower cost-per-acquisition.",
      categories: ["dev", "marketing"],
      glowClass: "from-emerald-500/20 via-teal-500/10 to-transparent",
      screenshot: {
        logo: "A",
        brandName: "ACME STORE",
        subTitle: "Premium Apparel",
        tag: "Fashion Tech",
        title: "Summer Collection",
        price: "$89.00",
        button: "Shop Now",
        labelRoas: "Ad Spend ROAS",
        valueRoas: "5.4x",
        labelCpa: "Avg. CPA",
        valueCpa: "$12.50"
      },
      stats: [
        { value: "5.4x", label: "ROAS Increase", iconName: "BarChart3" },
        { value: "-35%", label: "CPA Reduction", iconName: "TrendingUp" },
        { value: "98/100", label: "Lighthouse Score", iconName: "Zap" }
      ]
    },
    {
      num: "03",
      brand: "Nova Analytics",
      subtitle: "Data Visualization & Dashboard UI",
      challenge: "Users were overwhelmed by complex data models. Nova required a simplified visual representation of multi-source business intelligence.",
      whatWeDid: "Crafted interactive charts, streamlined navigation pathways, and built real-time streaming data visualizers.",
      categories: ["design"],
      glowClass: "from-blue-500/20 via-cyan-500/10 to-transparent",
      screenshot: {
        logo: "N",
        brandName: "NOVA",
        tag: "Analytics",
        labelDemos: "Monthly Active Users",
        valueDemos: "142.8k",
        valuePercent: "+24.2%"
      },
      stats: [
        { value: "2.4h", label: "Time Saved/Week", iconName: "Users" },
        { value: "+24%", label: "User Engagement", iconName: "TrendingUp" },
        { value: "4.9/5", label: "User Rating", iconName: "Award" }
      ]
    },
    {
      num: "04",
      brand: "Aether Agency",
      subtitle: "Immersive Creative Brand Identity",
      challenge: "Aether wanted an ultra-premium, minimalistic portfolio that showcase their art direction and creative design projects.",
      whatWeDid: "Engineered an immersive web experience with smooth scroll, SVG-masked imagery, and dark-theme premium aesthetics.",
      categories: ["design", "marketing"],
      glowClass: "from-yellow-500/20 via-amber-500/10 to-transparent",
      screenshot: {
        brandName: "ÆTHER",
        navWork: "Work",
        navPhilosophy: "About",
        navInquire: "Inquire",
        tag: "Creative Studio",
        title: "Immersive Art Direction",
        photoLabel: "Interactive Exhibition"
      },
      stats: [
        { value: "12+", label: "Design Awards", iconName: "Award" },
        { value: "2.1s", label: "Fully Interactive", iconName: "Zap" },
        { value: "99.8%", label: "Positive Sentiment", iconName: "Users" }
      ]
    }
  ]
};

const getPortfolioScreenshot = (num: string, study: any) => {
  const s = study.screenshot || {};
  switch (num) {
    case "01":
      return (
        <div className="w-full h-full bg-[#FCFCFD] flex flex-col justify-between p-2.5 text-brand-dark font-sans overflow-hidden select-none relative border border-slate-100/50">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white/70 pointer-events-none z-30" />
          <div className="flex items-center justify-between border-b border-brand-zinc-200 pb-1 mb-1 shrink-0 z-10 bg-white/70">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-orange-500 flex items-center justify-center font-bold text-[6.5px] text-white">{s.logo}</div>
              <span className="text-[7px] font-black tracking-tight text-brand-dark">{s.brandName}</span>
            </div>
            <div className="flex items-center gap-2 text-[5.5px] text-brand-zinc-500 font-bold">
              <span>{s.navHome}</span>
              <span>{s.navServices}</span>
              <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-xs font-bold scale-90">{s.navCall}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center text-center p-2.5 relative overflow-hidden z-10 bg-white border border-brand-zinc-200/50 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.02)] my-1">
            <div className="relative z-10 space-y-1 w-full max-w-[180px]">
              <span className="text-[4.5px] text-orange-600 font-extrabold uppercase tracking-wider block leading-none">{s.tag}</span>
              <h4 className="text-[7px] font-black text-brand-dark leading-snug uppercase">{s.title}</h4>
              <span className="inline-block bg-brand-blue text-white font-black text-[4.5px] px-2 py-0.5 rounded-xs mt-1 scale-90 shadow-md">{s.button}</span>
            </div>
          </div>
          <div className="bg-white text-brand-dark py-1 text-center shrink-0 border-t border-slate-100 rounded-b-xs z-10 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
            <span className="text-[5.5px] font-black tracking-tight text-brand-blue">{s.footerTag}</span>
          </div>
        </div>
      );
    case "02":
      return (
        <div className="w-full h-full bg-[#FCFCFD] flex flex-col justify-between p-2.5 text-brand-dark font-sans overflow-hidden select-none relative border border-slate-100/50">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-white/70 pointer-events-none z-30" />
          <div className="flex items-center justify-between border-b border-brand-zinc-200 pb-1 mb-1 shrink-0 z-10">
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-3.5 rounded-full bg-emerald-100 border border-emerald-500/20 flex items-center justify-center font-bold text-[6px] text-emerald-700">{s.logo}</div>
              <div>
                <span className="text-[6.5px] font-black block leading-none text-brand-dark">{s.brandName}</span>
                <span className="text-[4.5px] text-brand-zinc-400 font-semibold block leading-none mt-0.5">{s.subTitle}</span>
              </div>
            </div>
            <span className="text-[5.5px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-xs font-black">{s.tag}</span>
          </div>
          <div className="flex-1 flex gap-2 items-center min-h-0 z-10">
            <div className="flex-1 aspect-[4/3] rounded border border-brand-zinc-200 bg-white p-1 flex flex-col justify-between relative overflow-hidden shadow-xs">
              <span className="text-[5.5px] font-black text-emerald-800 uppercase leading-none block">{s.title}</span>
              <div className="w-8 h-8 rounded bg-emerald-50 mx-auto my-0.5 flex items-center justify-center border border-emerald-100">
                <div className="w-2.5 h-5 bg-emerald-500 rounded-sm shadow-sm" />
              </div>
              <div className="flex justify-between items-center leading-none">
                <span className="text-[6.5px] font-black text-brand-dark">{s.price}</span>
                <span className="text-[4.5px] bg-brand-yellow text-brand-dark font-black px-1.5 py-0.5 rounded-xs scale-90">{s.button}</span>
              </div>
            </div>
            <div className="w-16 shrink-0 flex flex-col gap-1">
              <div className="bg-white border border-brand-zinc-200/80 rounded p-1 text-center leading-none shadow-xs">
                <span className="text-[4.5px] text-brand-zinc-400 font-bold block uppercase">{s.labelRoas}</span>
                <span className="text-[9px] font-black text-brand-blue block mt-0.5">{s.valueRoas}</span>
              </div>
              <div className="bg-white border border-brand-zinc-200/80 rounded p-1 text-center leading-none shadow-xs">
                <span className="text-[4.5px] text-brand-zinc-400 font-bold block uppercase">{s.labelCpa}</span>
                <span className="text-[9px] font-black text-emerald-600 block mt-0.5">{s.valueCpa}</span>
              </div>
            </div>
          </div>
        </div>
      );
    case "03":
      return (
        <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-2.5 text-slate-800 font-sans overflow-hidden select-none relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/75 pointer-events-none z-30" />
          <div className="flex items-center justify-between border-b border-slate-200 pb-1 mb-1 shrink-0 z-10 bg-white/50">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-brand-blue flex items-center justify-center font-bold text-[6px] text-white">{s.logo}</div>
              <span className="text-[6.5px] font-black text-brand-dark">{s.brandName}</span>
            </div>
            <span className="text-[5.5px] bg-brand-blue/10 text-brand-blue px-1.5 py-0.5 rounded-xs font-black">{s.tag}</span>
          </div>
          <div className="flex-1 flex gap-1.5 items-stretch min-h-0 py-1 z-10">
            <div className="w-4 bg-slate-100 border-r border-slate-200 pr-0.5 flex flex-col gap-1 pt-0.5 shrink-0">
              <span className="h-0.5 w-full rounded bg-brand-blue/40" />
              <span className="h-0.5 w-2/3 rounded bg-slate-300" />
              <span className="h-0.5 w-1/2 rounded bg-slate-300" />
            </div>
            <div className="flex-1 flex flex-col justify-between pt-0.5">
              <div className="flex justify-between items-center leading-none">
                <div>
                  <span className="text-[4.5px] text-slate-400 font-bold uppercase block">{s.labelDemos}</span>
                  <span className="text-[10px] font-black text-slate-800 tracking-tight">{s.valueDemos} <span className="text-[5.5px] text-emerald-600 font-black">{s.valuePercent}</span></span>
                </div>
              </div>
              <div className="relative h-9 w-full flex items-end mt-1">
                <svg className="w-full h-full text-brand-blue" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path d="M 0 25 Q 25 22, 45 12 T 90 2 L 100 2" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M 0 25 Q 25 22, 45 12 T 90 2 L 100 2 L 100 30 L 0 30 Z" fill="currentColor" fillOpacity="0.05" />
                  <circle cx="90" cy="2" r="2.5" fill="#E9BD36" stroke="currentColor" strokeWidth="1" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      );
    case "04":
      return (
        <div className="w-full h-full bg-[#fcfbf9] flex flex-col justify-between p-2.5 text-[#080710] font-serif overflow-hidden select-none relative">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/15 pointer-events-none z-30" />
          <div className="flex items-center justify-between border-b border-[#080710]/5 pb-1 mb-1 shrink-0 z-10">
            <span className="text-[7.5px] font-black tracking-widest text-[#080710]">{s.brandName}</span>
            <div className="flex gap-1.5 text-[4.5px] font-sans text-neutral-500 uppercase">
              <span>{s.navWork}</span>
              <span>{s.navPhilosophy}</span>
              <span>{s.navInquire}</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col justify-between py-1 relative z-10">
            <div className="space-y-0.5 text-center">
              <span className="text-[4.5px] text-neutral-400 uppercase tracking-widest font-sans block">{s.tag}</span>
              <h4 className="text-[7.5px] font-black text-[#080710] leading-tight">{s.title}</h4>
            </div>
            <div className="w-full h-11 bg-neutral-200 rounded border border-neutral-300/30 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-x-0 bottom-0 h-4 bg-neutral-300" />
              <div className="absolute bottom-1 left-4 w-10 h-3 bg-neutral-800 rounded-sm shadow-md" />
              <div className="absolute bottom-0.5 left-15 w-4 h-4 bg-amber-800 rounded-full opacity-40 blur-xs" />
              <span className="text-[4.5px] font-sans font-black text-neutral-600 tracking-wider absolute bottom-1">{s.photoLabel}</span>
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-[#080710] relative overflow-hidden flex items-center justify-center">
          {study.image ? (
            <img src={study.image} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="text-[7px] text-white/40 uppercase tracking-widest font-mono">No Preview</div>
          )}
        </div>
      );
  }
};

const detailsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15
    }
  }
} as const;

const detailsItemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 220, damping: 20 }
  }
} as const;

const statsContainerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.25
    }
  }
} as const;

const statItemVariants = {
  hidden: { opacity: 0, x: 20 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 250, damping: 22 }
  }
} as const;

export default function Portfolio({ data }: { data?: any }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const { portfolio: cmsPortfolio } = useContent();
  const rawProjects = cmsPortfolio?.projects || [];

  const portfolio = {
    ...DEFAULT_PORTFOLIO,
    ...cmsPortfolio,
    categories: cmsPortfolio?.categories && cmsPortfolio.categories.length > 0
      ? cmsPortfolio.categories
      : DEFAULT_PORTFOLIO.categories,
  };

  const categories = portfolio.categories.map((c: any) => ({
    ...c,
    icon: iconMap[c.iconName] || LayoutGrid
  }));

  const caseStudies = rawProjects.length > 0
    ? rawProjects.map((p: any, idx: number) => {
        const num = String(idx + 1).padStart(2, "0");
        return {
          num,
          brand: p.title || p.brand || "",
          subtitle: p.subtitle || "",
          challenge: p.challenge || p.desc || p.description || "",
          whatWeDid: p.approach || p.whatWeDid || "",
          categories: Array.isArray(p.categories) ? p.categories : (p.category ? [p.category.toLowerCase()] : ["design"]),
          glowClass: p.glowClass || (
            idx % 4 === 0 ? "from-orange-500/20 via-red-500/10 to-transparent" :
            idx % 4 === 1 ? "from-emerald-500/20 via-teal-500/10 to-transparent" :
            idx % 4 === 2 ? "from-blue-500/20 via-cyan-500/10 to-transparent" :
            "from-yellow-500/20 via-amber-500/10 to-transparent"
          ),
          screenshot: p.screenshot || {
            logo: (p.title || p.brand || "A").charAt(0),
            brandName: (p.title || p.brand || "").toUpperCase(),
            tag: p.subtitle || "",
            title: p.title || "",
            button: "Learn More",
            footerTag: "Verified Project",
            navHome: "Home",
            navServices: "Services",
            navCall: "Contact",
            subTitle: p.subtitle || "",
            price: "$0",
            labelRoas: "Growth",
            valueRoas: p.stats?.[0]?.value || "10x",
            labelCpa: "Performance",
            valueCpa: p.stats?.[1]?.value || "Elite",
            labelDemos: "Users",
            valueDemos: p.stats?.[2]?.value || "10k",
            valuePercent: "+100%",
            navWork: "Work",
            navPhilosophy: "Philosophy",
            navInquire: "Inquire",
            photoLabel: "Case Study View"
          },
          stats: p.stats ? p.stats.map((s: any) => ({
            ...s,
            icon: iconMap[s.iconName] || Award
          })) : [],
          image: p.image || ""
        };
      })
    : DEFAULT_PORTFOLIO.caseStudies.map((cs: any) => ({
        ...cs,
        stats: cs.stats ? cs.stats.map((s: any) => ({
          ...s,
          icon: iconMap[s.iconName] || Award
        })) : []
      }));

  // Filter case studies by active category
  const filteredCaseStudies = caseStudies.filter((item: any) =>
    activeCategory === "all" ? true : item.categories?.includes(activeCategory)
  );

  // Ensure active index stays within bounds of filtered items
  const activeIndex = activeSlideIndex >= filteredCaseStudies.length ? 0 : activeSlideIndex;
  const activeSlide = filteredCaseStudies[activeIndex] || filteredCaseStudies[0];

  const handleNext = () => {
    if (filteredCaseStudies.length === 0) return;
    setActiveSlideIndex((prev) => (prev + 1) % filteredCaseStudies.length);
  };

  const handlePrev = () => {
    if (filteredCaseStudies.length === 0) return;
    setActiveSlideIndex((prev) => (prev - 1 + filteredCaseStudies.length) % filteredCaseStudies.length);
  };

  const selectCategory = (catId: string) => {
    setActiveCategory(catId);
    setActiveSlideIndex(0);
  };

  return (
    <section id="portfolio" className="relative overflow-hidden bg-transparent py-24 md:py-32 border-t border-b border-brand-zinc-200 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 mb-6 md:mb-8 text-center items-center max-w-3xl mx-auto"
        >
          <div className="eyebrow-pill self-center">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
            </span>
            {portfolio.sectionTag}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
            {portfolio.titleIntro}{" "}
            <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
              {portfolio.titleHighlight}
            </span>
          </h2>
          <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto">
            {portfolio.description}
          </p>
        </motion.div>

        {/* Categories Navigation Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-4xl mx-auto mb-8"
        >
          <div className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/60 dark:border-white/10 shadow-sm p-1.5 rounded-full flex overflow-x-auto lg:flex-wrap items-center justify-start lg:justify-center gap-1 sm:gap-2 scrollbar-none w-full whitespace-nowrap px-4 py-1">
            {categories.map((cat: any) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <motion.button
                  key={cat.id}
                  onClick={() => selectCategory(cat.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-semibold transition-colors duration-300 cursor-pointer text-brand-zinc-500 hover:text-brand-dark shrink-0"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryTab"
                      className="absolute inset-0 bg-brand-blue dark:bg-brand-yellow rounded-full shadow-md z-0"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 flex items-center gap-2 transition-colors duration-300 ${isActive ? "text-white dark:text-[#080710] font-black" : "text-brand-zinc-500 dark:text-zinc-400 hover:text-brand-dark dark:hover:text-white"}`}>
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Interactive Case Study Slider Container */}
        <div className="relative w-full max-w-6xl mx-auto">

          {/* Active Case Study Details Card */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(event, info) => {
              const swipe = info.offset.x;
              if (swipe < -60) {
                handleNext();
              } else if (swipe > 60) {
                handlePrev();
              }
            }}
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="w-full rounded-[2.5rem] border border-brand-zinc-200/60 dark:border-white/10 bg-white dark:bg-[#12121e] shadow-[0_4px_30px_rgba(3, 6, 172,0.01)] hover:shadow-[0_25px_60px_rgba(3, 6, 172,0.06)] transition-all duration-500 p-6 xs:p-8 md:p-12 relative overflow-hidden group cursor-grab active:cursor-grabbing select-none"
          >
            {/* Subtle grid pattern inside card for premium texture */}
            <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1.2px,transparent_1.2px)] [background-size:24px_24px] opacity-40 dark:opacity-[0.08] pointer-events-none z-0" />

            {/* Drag/Swipe Indicator Badge */}
            <div className="absolute top-4 right-4 md:top-6 md:right-8 z-20 flex items-center gap-1.5 px-3 py-1 bg-slate-50/90 dark:bg-white/10 border border-slate-200/40 dark:border-white/10 rounded-full text-[9px] font-bold text-neutral-400 dark:text-neutral-300 select-none pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
              <span>{portfolio.swipeHint}</span>
            </div>

            <AnimatePresence mode="wait">
              {activeSlide && (
                <motion.div
                  key={activeSlide.brand}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10"
                >
                  {/* Column 1: CSS Laptop Mockup on Fluted Pedestal */}
                  <div className="lg:col-span-5 flex flex-col justify-end overflow-visible min-h-[190px] xs:min-h-[220px] relative">
                    <motion.div
                      animate={{ y: [0, -6, 0] }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                      className="relative w-full max-w-[280px] xs:max-w-[320px] mx-auto z-10 flex flex-col items-center cursor-pointer group/laptop"
                    >
                      {/* Dynamic Backlight Glow matching the active brand */}
                      <motion.div
                        animate={{
                          scale: [1, 1.15, 1],
                          opacity: [0.35, 0.5, 0.35]
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 4,
                          ease: "easeInOut"
                        }}
                        className={`absolute -inset-14 rounded-full blur-[75px] bg-gradient-to-tr ${activeSlide.glowClass} pointer-events-none z-0`}
                      />

                      {/* Laptop Screen with glare overlay */}
                      <div className="w-[85%] aspect-[16/10] bg-neutral-900 rounded-t-xl p-1.5 border border-neutral-800 shadow-[0_20px_40px_rgba(8,7,16,0.3)] relative z-10">
                        <div className="w-full h-full rounded-md overflow-hidden bg-[#080710] relative">
                          {activeSlide.image ? (
                            <img src={activeSlide.image.startsWith('/') || activeSlide.image.startsWith('http') || activeSlide.image.startsWith('data:') ? activeSlide.image : `/${activeSlide.image}`} className="w-full h-full object-cover" alt="" />
                          ) : (
                            getPortfolioScreenshot(activeSlide.num, activeSlide)
                          )}
                        </div>
                      </div>

                      {/* Laptop Keyboard & Deck */}
                      <div className="w-[100%] h-3 bg-neutral-200 border-t border-b border-neutral-300 rounded-b-lg shadow-md relative z-10 flex justify-center items-center">
                        {/* Keyboard keys slot decoration */}
                        <div className="w-14 h-0.5 bg-neutral-400 rounded-xs mb-0.5" />
                        {/* Display Open Notch in center */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.75 bg-neutral-300 rounded-b-xs border-b border-neutral-400" />
                      </div>
                    </motion.div>

                    {/* Architectural Fluted Column Pedestal Base */}
                    <div className="w-[180px] sm:w-[220px] mx-auto h-20 sm:h-24 relative overflow-hidden flex flex-col justify-between items-center -mt-2.5 z-0 select-none pointer-events-none">
                      {/* Column Cap */}
                      <div className="w-[140px] sm:w-[160px] h-2 bg-gradient-to-b from-brand-zinc-300 to-brand-zinc-200 rounded border border-brand-zinc-400/30 shadow-sm" />
                      {/* Flutes - vertically repeating stripes */}
                      <div
                        className="w-[100px] sm:w-[120px] flex-1 border-l border-r border-brand-zinc-300/40 opacity-70"
                        style={{
                          background: 'linear-gradient(90deg, #f4f4f5 0%, #e4e4e7 15%, #f4f4f5 30%, #d4d4d8 50%, #f4f4f5 70%, #e4e4e7 85%, #f4f4f5 100%)'
                        }}
                      />
                      {/* Column Plinth Base */}
                      <div className="w-[160px] sm:w-[180px] h-3.5 bg-gradient-to-t from-brand-zinc-400 to-brand-zinc-200 rounded border border-brand-zinc-400/40 shadow-sm" />
                    </div>
                  </div>

                  {/* Column 2: Detailed Text & Case Metrics */}
                  <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <motion.div
                      variants={detailsContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="space-y-6 w-full"
                    >
                      {/* Badge Row */}
                      <motion.div variants={detailsItemVariants} className="flex flex-wrap justify-center lg:justify-start items-center gap-2.5">
                        <span className="text-[10px] font-mono font-black text-brand-blue dark:text-brand-yellow uppercase tracking-widest bg-brand-blue/5 border border-brand-blue/15 px-3 py-1 rounded-full">
                          {portfolio.labelCaseStudy} {activeSlide.num}
                        </span>
                        <h3 className="font-heading font-black text-xl text-brand-dark dark:text-white">
                          {activeSlide.brand}
                        </h3>
                      </motion.div>

                      {/* Main Subtitle */}
                      <motion.p variants={detailsItemVariants} className="text-sm font-bold tracking-wide uppercase text-brand-zinc-400 dark:text-zinc-300">
                        {activeSlide.subtitle}
                      </motion.p>

                      {/* Challenge / What we did grid */}
                      <motion.div variants={detailsItemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans text-brand-zinc-500 dark:text-zinc-400 leading-relaxed border-t border-b border-brand-zinc-100 dark:border-white/10 py-5">
                        <div>
                          <strong className="block text-brand-dark dark:text-white font-extrabold uppercase tracking-wide text-[9px] mb-1">{portfolio.labelChallenge}</strong>
                          {activeSlide.challenge}
                        </div>
                        <div className="border-t sm:border-t-0 sm:border-l border-brand-zinc-100 dark:border-white/10 pt-4 sm:pt-0 sm:pl-4">
                          <strong className="block text-brand-dark dark:text-white font-extrabold uppercase tracking-wide text-[9px] mb-1">{portfolio.labelWhatWeDid}</strong>
                          {activeSlide.whatWeDid}
                        </div>
                      </motion.div>

                      {/* Metric Stat Ring rows */}
                      <motion.div
                        variants={statsContainerVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-3 gap-3 pt-2"
                      >
                        {activeSlide.stats.map((stat: any, index: number) => {
                          const StatIcon = stat.icon;
                          return (
                            <motion.div
                              key={index}
                              variants={statItemVariants}
                              className="bg-brand-light dark:bg-[#161622] border border-brand-zinc-200/50 dark:border-white/10 rounded-2xl p-4 flex flex-col justify-between min-h-[96px] shadow-xs relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-heading font-black text-base sm:text-xl text-brand-blue dark:text-brand-yellow leading-none tracking-tight">
                                  {stat.value}
                                </span>
                                <StatIcon className="h-4.5 w-4.5 text-brand-yellow fill-brand-yellow/10" strokeWidth={2.5} />
                              </div>
                              <p className="text-[9px] font-bold text-brand-zinc-500 dark:text-zinc-400 uppercase tracking-widest mt-3 leading-snug">
                                {stat.label}
                              </p>
                            </motion.div>
                          );
                        })}
                      </motion.div>

                      {/* Slider Navigation Buttons inside details section */}
                      <motion.div variants={detailsItemVariants} className="flex justify-between items-center pt-4 border-t border-brand-zinc-100 dark:border-white/10">
                        <div className="flex gap-2">
                          <button
                            onClick={handlePrev}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:text-[#080710] transition-all duration-300 shadow-xs cursor-pointer"
                            aria-label={portfolio.ariaPrev}
                          >
                            <ArrowLeft className="h-4.5 w-4.5" />
                          </button>
                          <button
                            onClick={handleNext}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 text-brand-dark dark:text-white hover:border-brand-blue hover:bg-brand-blue hover:text-white dark:hover:text-[#080710] transition-all duration-300 shadow-xs cursor-pointer"
                            aria-label={portfolio.ariaNext}
                          >
                            <ArrowRight className="h-4.5 w-4.5" />
                          </button>
                        </div>

                        {/* Project counter indicator */}
                        <span className="text-[10px] font-mono font-black text-brand-zinc-400 select-none">
                          {activeIndex + 1} / {filteredCaseStudies.length} Projects
                        </span>
                      </motion.div>

                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

        </div>

      </div>
    </section>
  );
}