"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useInView } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Clock,
  Trophy,
  Sparkles,
  Star,
  Send,
  Mail,
  Check,
  ChevronDown,
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
  Layers,
  Home,
  Droplet
} from "lucide-react";

import { useContent } from "@/hooks/useContent";
import FAQ from "@/components/FAQ";
import Blog from "@/components/Blog";
import ServiceArea from "@/components/ServiceArea";

// ── Icon Map Resolver ──
const iconMap: Record<string, React.ElementType> = {
  Search,
  Monitor,
  Megaphone,
  MousePointerClick,
  Palette,
  PenTool,
  ShoppingCart,
  BarChart2,
  CheckCircle2,
  Globe,
  MapPin,
  Star,
  Trophy,
  ShieldCheck,
  Award,
  DollarSign,
  Briefcase,
  Cpu,
  TrendingUp,
  Building2,
  Target,
  Terminal,
  Zap,
  HeartHandshake,
  Shield,
  Layers,
  Home,
  Droplet,
  Clock
};

// ── Custom Ad Platform Logos for Client Trust ──
const GoogleAdsLogo = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-auto shrink-0 filter drop-shadow-md">
    <path d="M34.7 4.3c-2.1 0-3.9 1-5.1 2.6L12.5 35.8c-1 1.7-1 3.8 0 5.5.9 1.6 2.6 2.5 4.5 2.5h20.3c3.2 0 5.7-2.6 5.7-5.7V10c0-3.1-2.5-5.7-5.7-5.7h-2.6z" fill="#F9BC05" />
    <path d="M12.5 35.8L29.6 6.9c1.2-1.6 3-2.6 5.1-2.6H17c-1.9 0-3.6.9-4.5 2.5L2.6 24.3c-1.8 3.1-.7 7.1 2.4 8.9l7.5 2.6z" fill="#4285F4" />
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-auto fill-[#0668E1] shrink-0 filter drop-shadow-md">
    <path d="M16.48 7.38c-1.34 0-2.58.55-3.5 1.55-.92-1-2.16-1.55-3.5-1.55-2.73 0-4.96 2.23-4.96 4.96s2.23 4.96 4.96 4.96c1.34 0 2.58-.55 3.5-1.55.92 1 2.16 1.55 3.5 1.55 2.73 0 4.96-2.23 4.96-4.96s-2.23-4.96-4.96-4.96zm-7 8.08c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12zm7 0c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12z" />
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 48 48" className="h-4.5 w-auto fill-brand-dark dark:fill-white shrink-0">
    <path d="M26.4 12c-6.1 0-10.4 3.6-10.4 9.8 0 5.4 3.2 8.4 8.1 8.4 4 0 6.6-1.9 8.1-3.9v3.1h5.8V12.4h-5.8v3.1c-1.6-2.1-4.2-3.5-8.1-3.5zm.9 12.3c-3 0-4.6-1.6-4.6-4.2s1.6-4.2 4.6-4.2 4.6 1.6 4.6 4.2-1.6 4.2-4.6 4.2z" />
    <path d="M12 38c10.4 6 22.4 4 28-2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M38 34l3.5 3.5-1.5 4" fill="#FF9900" />
  </svg>
);

const BingLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-auto fill-[#008373] dark:fill-[#00b29a] shrink-0">
    <path d="M5 2L15 6v12l-6 4v-9l6-2V6L5 2z" />
  </svg>
);

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-auto fill-brand-dark dark:fill-white shrink-0">
    <path d="M18.7 18.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8s-2 .8-3.2.8c-1.3 0-2.3-1.2-3.1-2.4C4.6 16 3.3 10.9 4.9 8.1c.8-1.4 2.2-2.3 3.8-2.3 1.2 0 2.4.8 3.2.8.7 0 2.1-.9 3.6-.9 1.5 0 2.9.5 3.8 1.8-3.1 1.8-2.6 6-0.1 7.2-.9 2.2-2.1 4.5-3.5 5.8zM15.9 4.2c.8-.9 1.3-2.2 1.1-3.5-1.1.1-2.5.8-3.3 1.8-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.5-.7 3.3-1.7z" />
  </svg>
);

// ── SVG Underline Variant ──
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

// ── Digit Ticker Components ──
const TickerDigit = ({ digit }: { digit: number }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <span
      className="relative inline-block overflow-hidden select-none"
      style={{
        width: "0.58em",
        height: "1.02em"
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

const DigitTicker = ({ value }: { value: string | number }) => {
  const digits = String(value || "0").split("");
  return (
    <span className="inline-flex items-baseline">
      {digits.map((digit, idx) => {
        if (!/[0-9]/.test(digit)) {
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

// ── Dynamic Cursor Spotlight Card Wrapper ──
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group/spotlight rounded-[28px] ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 group-hover/spotlight:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(3, 6, 172, 0.03), transparent 80%)`
        }}
      />
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 dark:group-hover/spotlight:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(233, 189, 54, 0.03), transparent 80%)`
        }}
      />

      <div
        ref={(el) => {
          if (el) {
            mouseX.on("change", (x: number) => el.style.setProperty("--x", `${x}px`));
            mouseY.on("change", (y: number) => el.style.setProperty("--y", `${y}px`));
          }
        }}
        className="w-full h-full relative z-20"
      >
        {children}
      </div>
    </motion.div>
  );
}

// ── Animated Circular Stat ──
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function AnimatedStat({
  value,
  label,
  sublabel,
  percentage,
}: {
  value: string;
  label: string;
  sublabel: string;
  percentage: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });
  const [displayed, setDisplayed] = useState(value.replace(/[0-9.]/g, "0"));
  const [dotProgress, setDotProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      let numeric = 0;
      let suffix = "";
      if (value.includes("/")) {
        const parts = value.split("/");
        numeric = parseFloat(parts[0]);
        suffix = "/" + parts[1];
      } else {
        const isPercent = value.includes("%");
        suffix = isPercent ? "%" : value.replace(/[0-9.]/g, "");
        numeric = parseFloat(value.replace(/[^0-9.]/g, ""));
      }
      const isFloat = value.includes(".");
      const DURATION = 1400;
      const DELAY = 150;
      const startTime = performance.now() + DELAY;
      let rafId: number;
      
      const tick = (now: number) => {
        const elapsed = Math.max(0, now - startTime);
        const raw = Math.min(elapsed / DURATION, 1);
        const eased = 1 - Math.pow(1 - raw, 4);
        
        setDisplayed((isFloat ? (eased * numeric).toFixed(1) : Math.round(eased * numeric).toString()) + suffix);
        setDotProgress(eased * percentage);
        
        if (raw < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDotProgress(percentage);
        }
      };
      
      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    } else {
      setDisplayed(value.replace(/[0-9.]/g, "0"));
      setDotProgress(0);
    }
  }, [isInView, percentage, value]);

  const dotAngle = 2 * Math.PI * dotProgress;
  const dotX = 41 + RADIUS * Math.cos(dotAngle);
  const dotY = 41 + RADIUS * Math.sin(dotAngle);
  const gradientId = `ringGradient-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      <div className="relative w-[80px] h-[80px] sm:w-[90px] sm:h-[90px]">
        <div className="absolute inset-0 rounded-full bg-brand-blue/5 dark:bg-brand-yellow/5 blur-md" />
        <svg viewBox="0 0 82 82" className="relative w-full h-full -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0306AC" />
              <stop offset="100%" stopColor="#E9BD36" />
            </linearGradient>
          </defs>
          <circle
            cx="41" cy="41" r={RADIUS}
            fill="none"
            stroke="rgba(3, 6, 172, 0.08)"
            strokeWidth="5"
          />
          <circle
            cx="41" cy="41" r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - dotProgress)}
          />
          <circle
            cx={dotX} cy={dotY} r="4.5"
            fill="#E9BD36"
            stroke="white"
            strokeWidth="1.5"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-black text-[14px] sm:text-[16px] text-brand-dark dark:text-white leading-none">
            {displayed}
          </span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark dark:text-white">{label}</p>
        <p className="text-[8px] text-brand-zinc-400 dark:text-zinc-400 mt-0.5 leading-snug">
          {sublabel.split('\\n').map((line, i) => (
            <span key={i} className="block">{line}</span>
          ))}
        </p>
      </div>
    </div>
  );
}

// ── Vectors Illustrations for differentiators ──
const differentiatorsIllustrations = [
  <svg key="1" viewBox="0 0 160 100" fill="none" className="w-full h-full">
    <rect x="8" y="10" width="62" height="80" rx="8" fill="#0306AC" fillOpacity="0.07" stroke="#0306AC" strokeWidth="1" strokeOpacity="0.2" />
    <rect x="16" y="20" width="46" height="7" rx="3.5" fill="#0306AC" fillOpacity="0.18" />
    <rect x="16" y="33" width="30" height="5" rx="2.5" fill="#0306AC" fillOpacity="0.1" />
    <rect x="16" y="43" width="40" height="5" rx="2.5" fill="#0306AC" fillOpacity="0.1" />
    <circle cx="16" cy="73" r="6" fill="#0306AC" />
    <circle cx="28" cy="73" r="6" fill="#E9BD36" />
    <rect x="84" y="8" width="68" height="42" rx="8" fill="#0306AC" fillOpacity="0.07" stroke="#0306AC" strokeWidth="1" strokeOpacity="0.18" />
    <circle cx="102" cy="28" r="10" fill="#0306AC" fillOpacity="0.15" />
    <rect x="118" y="21" width="26" height="4" rx="2" fill="#0306AC" fillOpacity="0.2" />
  </svg>,
  <svg key="2" viewBox="0 0 160 100" fill="none" className="w-full h-full">
    <rect x="8" y="8" width="144" height="84" rx="9" fill="#0306AC" fillOpacity="0.06" stroke="#0306AC" strokeWidth="1" strokeOpacity="0.18" />
    <rect x="8" y="8" width="144" height="18" rx="9" fill="#0306AC" fillOpacity="0.08" />
    <circle cx="22" cy="17" r="3.5" fill="#0306AC" fillOpacity="0.35" />
    <circle cx="33" cy="17" r="3.5" fill="#0306AC" fillOpacity="0.2" />
    <rect x="18" y="34" width="20" height="4" rx="2" fill="#0306AC" fillOpacity="0.5" />
    <rect x="44" y="34" width="48" height="4" rx="2" fill="#0306AC" fillOpacity="0.2" />
    <rect x="98" y="34" width="24" height="4" rx="2" fill="#E9BD36" fillOpacity="0.7" />
  </svg>,
  <svg key="3" viewBox="0 0 160 100" fill="none" className="w-full h-full">
    <line x1="8" y1="92" x2="152" y2="92" stroke="#0306AC" strokeWidth="1" strokeOpacity="0.12" />
    <rect x="16" y="68" width="16" height="24" rx="3" fill="#0306AC" fillOpacity="0.12" />
    <rect x="38" y="52" width="16" height="40" rx="3" fill="#0306AC" fillOpacity="0.2" />
    <rect x="60" y="38" width="16" height="54" rx="3" fill="#0306AC" fillOpacity="0.32" />
    <polyline points="24,66 46,50 68,36 90,22 112,10" stroke="#E9BD36" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="24" cy="66" r="3.5" fill="#E9BD36" />
    <circle cx="46" cy="50" r="3.5" fill="#E9BD36" />
    <circle cx="68" cy="36" r="3.5" fill="#E9BD36" />
  </svg>,
  <svg key="4" viewBox="0 0 160 100" fill="none" className="w-full h-full">
    <rect x="8" y="8" width="88" height="34" rx="10" fill="#0306AC" fillOpacity="0.09" stroke="#0306AC" strokeWidth="1" strokeOpacity="0.18" />
    <path d="M18 42 L14 50 L24 42" fill="#0306AC" fillOpacity="0.09" />
    <rect x="16" y="18" width="64" height="4" rx="2" fill="#0306AC" fillOpacity="0.3" />
    <rect x="64" y="52" width="88" height="34" rx="10" fill="#E9BD36" fillOpacity="0.22" stroke="#E9BD36" strokeOpacity="0.55" strokeWidth="1" />
    <rect x="72" y="62" width="64" height="4" rx="2" fill="#0306AC" fillOpacity="0.22" />
  </svg>
];

const defaultRoadmapDeliverables: Record<number, string[]> = {
  0: ["Google Search Console crawl diagnostics log", "Competitor backlinks overlapping index", "Core Web Vitals loading bottleneck check"],
  1: ["Commercial search priority map authoring", "Intent-based topic structure planning", "Semantic keyword clusters setup"],
  2: ["H1-H4 headings structures rewrite rules", "Title & Meta description tags optimizations", "JSON-LD schema structured data injection"],
  3: ["Render-blocking scripts async tags setup", "Vercel edge CDN cache configuration", "Image formats (WebP/AVIF) audit fixes"],
  4: ["High-authority editorial mentions pitches", "Niche local citation indexes registry", "Toxic backlink removal & disavow log"],
  5: ["Custom GA4 key event tracking logs", "Attributed phone calls & forms tracking", "Bi-weekly Looker Studio conversion audit"]
};

const getServiceIcon = (slug: string) => {
  switch (slug) {
    case "seo": return <Search className="w-5 h-5" />;
    case "web-design": return <Monitor className="w-5 h-5" />;
    case "social-media": return <Megaphone className="w-5 h-5" />;
    case "paid-ads": return <TrendingUp className="w-5 h-5" />;
    case "branding": return <Palette className="w-5 h-5" />;
    case "content-marketing": return <PenTool className="w-5 h-5" />;
    case "e-commerce": return <ShoppingCart className="w-5 h-5" />;
    case "analytics": return <BarChart2 className="w-5 h-5" />;
    default: return <Sparkles className="w-5 h-5" />;
  }
};

const getToolDescription = (name: string) => {
  const specs: Record<string, { desc: string; tag: string }> = {
    "Google Search": { desc: "Indexation audits, keyword position mapping, and search volume gap tracing.", tag: "SEO CORE" },
    "Google Maps": { desc: "GBP optimization, geographical radius reviews, and local map pack positioning.", tag: "LOCAL SEO" },
    "Google Business": { desc: "Lead citation indexation and customer review generation workflows.", tag: "REPUTATION" },
    "Bing Search": { desc: "Secondary index submittals and webmaster console indexing validation.", tag: "SEARCH INDEX" },
    "React.js": { desc: "Modular, reactive front-end library built for speedy interaction states.", tag: "FRONTEND" },
    "Next.js": { desc: "Headless rendering backend with automatic static optimization and route pre-fetching.", tag: "CORE DEV" },
    "Tailwind CSS": { desc: "Utility-first CSS compiler to keep stylesheet sizes down and performance high.", tag: "STYLING" },
    "Vercel": { desc: "Serverless global edge CDN network offering 99.9% uptime and instant caching.", tag: "EDGE NETWORK" },
    "Framer Motion": { desc: "Clean React animations library built for hardware-accelerated 60fps renders.", tag: "UX ANIMATIONS" },
    "Instagram": { desc: "Social asset template curation, reels outreach, and caption formatting setups.", tag: "SOCIAL ENGAGE" },
    "TikTok": { desc: "Viral video visual scripting, trend syncer, and hook timer calibration.", tag: "VIRAL CAPTURE" },
    "LinkedIn": { desc: "High-intent corporate networking templates, B2B lead generation lists, and outreach.", tag: "B2B LEADS" },
    "Google Ads": { desc: "Intent-targeted keyword bidding and negative keyword filters for immediate ROAS.", tag: "PPC SEARCH" },
    "Meta Ads": { desc: "Lookalike targeting, customer pixel tracking, and retargeting workflows.", tag: "PPC SOCIAL" },
    "Shopify API": { desc: "Headless storefront catalogs synchronizations, checkout webhooks, and automation.", tag: "E-COMM BACKEND" },
    "Stripe": { desc: "Encrypt-level single-click credit card payments processing with local currency support.", tag: "GATEWAY" },
    "Google Analytics 4": { desc: "Server-side tag setup to capture 100% of campaign lead and attribution logs.", tag: "DATA RUN" },
    "Google Tag Manager": { desc: "Container mapping setup to safely deploy marketing pixels and clicks logs.", tag: "TAG RUN" },
    "Looker Studio": { desc: "Attribution dashboards compiling all conversion sources into real-time ROI reports.", tag: "REPORTING" },
    "SEMrush": { desc: "Competitor organic keywords volume checks and domain backlink audits.", tag: "AUDITS" },
    "Ahrefs": { desc: "Contextual link building directories research and authority ratings checks.", tag: "LINK MAP" },
    "Klaviyo": { desc: "Behavioral emails flows scripts targeting abandoned carts and user lists.", tag: "RETENTION" }
  };
  return specs[name] || {
    desc: "Strategic tool configuration customized to scale lead capture and brand authority.",
    tag: "CAMPAIGN"
  };
};

export default function ServiceDetailTemplate({ params, pageData }: any) {
  const content = useContent();

  // Resolve slug safely (handling Promise or plain object)
  const unwrappedParams = (params && typeof params.then === 'function') ? use(params) as any : params;
  const resolvedSlug = unwrappedParams?.slug ? String(unwrappedParams.slug) : (pageData?.slug || '');

  // Extract all services
  const rawServices = Array.isArray(content?.services?.services) && content.services.services.length > 0
    ? content.services.services
    : (Array.isArray(content?.services?.list) && content.services.list.length > 0
      ? content.services.list
      : (Array.isArray(content?.services) && content.services.length > 0 ? content.services : []));

  // Find target service
  const dbService = rawServices.find((s: any) => s.slug === resolvedSlug) || pageData;

  // Defaults fallback
  const service = {
    title: dbService?.title || "Professional Service",
    slug: dbService?.slug || resolvedSlug,
    tag: dbService?.tag || "Premium Solution",
    hero: {
      titleIntro: dbService?.hero?.titleIntro || dbService?.heroTitleIntro || dbService?.title || "Transform Your Business With",
      titleHighlight: dbService?.hero?.titleHighlight || dbService?.heroTitleHighlight || "Expert Solutions",
      description: dbService?.hero?.description || dbService?.heroDescription || dbService?.description || "High-performance digital engineering and growth architecture tailored to maximize brand equity.",
      primaryCta: {
        text: dbService?.hero?.primaryCta?.text || "Start Your Project",
        link: dbService?.hero?.primaryCta?.link || "#contact-form"
      },
      secondaryCta: {
        text: dbService?.hero?.secondaryCta?.text || "Explore Inclusions",
        link: dbService?.hero?.secondaryCta?.link || "#what-included"
      },
      benefits: (dbService?.hero?.benefits && dbService.hero.benefits.length > 0)
        ? dbService.hero.benefits
        : (dbService?.features && dbService.features.length > 0 ? dbService.features : [
            "Data-Driven Growth Strategies",
            "Next.js Speed & Performance",
            "Conversion-Focused Architecture",
            "Dedicated Support & Real-Time Sync"
          ])
    },
    clientTrust: {
      heading: dbService?.clientTrust?.heading || "ENTERPRISE PLATFORMS WE INTEGRATE & ACCELERATE",
      logos: (dbService?.clientTrust?.logos && dbService.clientTrust.logos.length > 0)
        ? dbService.clientTrust.logos
        : [
            { name: "Google Ads" },
            { name: "Meta Business" },
            { name: "Amazon Ads" },
            { name: "Bing Ads" },
            { name: "Apple Search" }
          ]
    },
    whatIncluded: {
      eyebrow: dbService?.whatIncluded?.eyebrow || "03 // CORE CAPABILITIES",
      titleIntro: dbService?.whatIncluded?.titleIntro || "What's Included in",
      titleHighlight: dbService?.whatIncluded?.titleHighlight || "Our Delivery",
      pillars: (dbService?.whatIncluded?.pillars && dbService.whatIncluded.pillars.length > 0)
        ? dbService.whatIncluded.pillars
        : [
            {
              title: "Strategic Discovery & Architecture",
              desc: "Deep analysis of existing infrastructure, competitor positioning, and high-impact revenue paths.",
              features: ["Technical Infrastructure Audit", "Competitor Matrix Analysis", "Custom Scope Blueprint"]
            },
            {
              title: "High-Performance Execution",
              desc: "Implementation powered by clean modular code, fast edge rendering, and conversion-optimized UI/UX.",
              features: ["Precision Development", "Conversion Rate Optimization", "Automated QA Protocols"]
            },
            {
              title: "Attribution & Scalable Growth",
              desc: "Continuous monitoring, live telemetry tracking, and iterative growth loops to ensure positive ROI.",
              features: ["Real-time Data Dashboards", "A/B Multivariate Testing", "Ongoing Growth Support"]
            }
          ]
    },
    strategy: {
      eyebrow: dbService?.strategy?.eyebrow || "04 // STRATEGIC APPROACH",
      titleIntro: dbService?.strategy?.titleIntro || "Engineered For",
      titleHighlight: dbService?.strategy?.titleHighlight || "Compounding Impact",
      description: dbService?.strategy?.description || "A custom implementation plan targeting bottlenecks and compounding acquisition flows.",
      components: (dbService?.strategy?.components && dbService.strategy.components.length > 0)
        ? dbService.strategy.components
        : [
            { num: "01", title: "Diagnostic Audit & Benchmark", desc: "We isolate inefficiencies, crawl errors, and technical bottlenecks before deploying capital." },
            { num: "02", title: "High-Intent Positioning Map", desc: "Prioritizing high-margin conversions and capturing immediate commercial purchase intent." },
            { num: "03", title: "Systemic Deployment & Scale", desc: "Launching verified updates across digital touchpoints to capture maximum market share." }
          ]
    },
    benefits: {
      eyebrow: dbService?.benefits?.eyebrow || "05 // MEASURABLE OUTCOMES",
      titleIntro: dbService?.benefits?.titleIntro || "Key Business",
      titleHighlight: dbService?.benefits?.titleHighlight || "Advantages",
      outcomeText: dbService?.benefits?.outcomeText || "Guaranteed Outcome",
      list: (dbService?.benefits?.list && dbService.benefits.list.length > 0)
        ? dbService.benefits.list
        : (dbService?.benefits && Array.isArray(dbService.benefits) && dbService.benefits.length > 0
            ? dbService.benefits.map((b: any) => ({ metric: b.metric || "100%", title: b.title || "Guaranteed Quality", desc: b.desc || b.description || "Delivering verifiable improvements.", outcomeText: b.outcomeText }))
            : [
                { metric: "350%", title: "Organic Visibility", desc: "Accelerating discovery on top search engines through clean structured code.", outcomeText: "Guaranteed Outcome" },
                { metric: "4.8x", title: "Conversion Yield", desc: "Frictionless UX funnels designed specifically to capture and convert leads.", outcomeText: "Guaranteed Outcome" },
                { metric: "99.9%", title: "Reliability & Uptime", desc: "Enterprise infrastructure built on modern serverless edge architecture.", outcomeText: "Guaranteed Outcome" },
                { metric: "<1s", title: "Load Performance", desc: "Lightning fast asset delivery boosting Core Web Vitals and SEO rankings.", outcomeText: "Guaranteed Outcome" }
              ])
    },
    process: {
      eyebrow: dbService?.process?.eyebrow || "06 // IMPLEMENTATION ROADMAP",
      titleIntro: dbService?.process?.titleIntro || "Our Step-by-Step",
      titleHighlight: dbService?.process?.titleHighlight || "Roadmap",
      description: dbService?.process?.description || "We orchestrate campaigns sequentially, guaranteeing structured code deliverables and auditable checkpoints at each stage of your roadmap.",
      calloutTag: dbService?.process?.calloutTag || "// PROCESS COMPLIANCE",
      calloutText: dbService?.process?.calloutText || "Every milestone is cataloged in the shared workspace, providing real-time deployment logs and verification reports.",
      steps: (dbService?.process?.steps && dbService.process.steps.length > 0)
        ? dbService.process.steps
        : (dbService?.process && Array.isArray(dbService.process) && dbService.process.length > 0
            ? dbService.process.map((p: any, idx: number) => ({
                title: p.title || p.name || "Milestone",
                desc: p.desc || p.description || "Structured sprint execution.",
                phaseTag: p.phaseTag || `PHASE 0${idx + 1} // CAMPAIGN`,
                deliverables: p.deliverables || defaultRoadmapDeliverables[idx] || [],
                footerLeft: p.footerLeft || "Verification Checkpoint",
                footerRight: p.footerRight || "Verified Node"
              }))
            : [
                {
                  title: "Discovery & Technical Diagnostics",
                  desc: "Full audit of your digital ecosystem, tech stack, and user funnels.",
                  phaseTag: "PHASE 01 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[0],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                },
                {
                  title: "Architecture & Wireframing",
                  desc: "Structuring high-converting user flows and component hierarchies.",
                  phaseTag: "PHASE 02 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[1],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                },
                {
                  title: "Production Build & Optimization",
                  desc: "Clean development with modern frameworks and strict performance standards.",
                  phaseTag: "PHASE 03 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[2],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                },
                {
                  title: "Verification & Quality Assurance",
                  desc: "Multi-device cross-browser testing and performance stress audits.",
                  phaseTag: "PHASE 04 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[3],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                },
                {
                  title: "Deployment & Attribution Sync",
                  desc: "Live rollout with custom event telemetry and analytics tracking.",
                  phaseTag: "PHASE 05 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[4],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                },
                {
                  title: "Iterative Growth & Scaling",
                  desc: "Continuous improvements driven by verified performance data.",
                  phaseTag: "PHASE 06 // CAMPAIGN",
                  deliverables: defaultRoadmapDeliverables[5],
                  footerLeft: "Verification Checkpoint",
                  footerRight: "Verified Node"
                }
              ])
    },
    results: {
      eyebrow: dbService?.results?.eyebrow || "07 // PROVEN PERFORMANCE",
      titleIntro: dbService?.results?.titleIntro || "Real-World",
      titleHighlight: dbService?.results?.titleHighlight || "Impact & ROI",
      description: dbService?.results?.description || "Verifiable metric indicators driven by precise performance scaling and custom coding.",
      caseStudiesEyebrow: dbService?.results?.caseStudiesEyebrow || "Featured Case Studies",
      caseStudies: (dbService?.results?.caseStudies && dbService.results.caseStudies.length > 0)
        ? dbService.results.caseStudies
        : [
            {
              title: "Enterprise Brand Growth",
              challenge: "Outdated legacy site experiencing slow load speeds and declining conversions.",
              strategy: "Engineered headless architecture with streamlined conversion pathways.",
              outcome: "+240% Qualified Inbound Inquiries",
              outcomeLabel: "Campaign Outcome"
            },
            {
              title: "Commercial Multi-Location Reach",
              challenge: "Fragmented map listings and poor regional organic rankings.",
              strategy: "Deployed localized landing architecture and high-authority citation schema.",
              outcome: "+410% Map Pack Actions",
              outcomeLabel: "Campaign Outcome"
            }
          ],
      metrics: (dbService?.results?.metrics && dbService.results.metrics.length > 0)
        ? dbService.results.metrics
        : [
            { value: "450%", label: "TRAFFIC GROWTH", desc: "Average organic session boost across 12-month engagements.", tag: "M01" },
            { value: "3.8x", label: "ROI MULTIPLIER", desc: "Documented revenue acceleration from attributed funnels.", tag: "M02" },
            { value: "99%", label: "CLIENT RETENTION", desc: "Long-term client partnerships built on consistent delivery.", tag: "M03" },
            { value: "24/7", label: "SUPPORT SYNC", desc: "Continuous uptime and real-time response capability.", tag: "M04" }
          ]
    },
    industries: {
      eyebrow: dbService?.industries?.eyebrow || "08 // SECTORS WE ACCELERATE",
      titleIntro: dbService?.industries?.titleIntro || "Industries",
      titleHighlight: dbService?.industries?.titleHighlight || "We Specialize In",
      footerLeft: dbService?.industries?.footerLeft || "Target Sector",
      footerRight: dbService?.industries?.footerRight || "Verified Optimization",
      list: (dbService?.industries?.list && dbService.industries.list.length > 0)
        ? dbService.industries.list
        : [
            { title: "Home Services & Contracting", desc: "Roofing, decking, remodeling, and local trade contractors scaling regional territories.", watermark: "HS" },
            { title: "Technology & SaaS", desc: "Fast-growth software startups and tech firms demanding high conversion rates.", watermark: "TS" },
            { title: "Commercial Real Estate", desc: "Property developers, architectural firms, and luxury real estate agencies.", watermark: "CR" },
            { title: "E-Commerce & Retail", desc: "Direct-to-consumer and B2B brands scaling transactions with seamless checkout.", watermark: "EC" },
            { title: "Professional Services", desc: "Law firms, financial consultancies, and executive agencies building trust.", watermark: "PS" },
            { title: "Healthcare & Wellness", desc: "Clinics, medical practices, and private health facilities seeking patient acquisition.", watermark: "HW" }
          ]
    },
    tools: {
      eyebrow: dbService?.tools?.eyebrow || "09 // TECH STACK",
      titleIntro: dbService?.tools?.titleIntro || "Modern",
      titleHighlight: dbService?.tools?.titleHighlight || "Frameworks & Tools",
      description: dbService?.tools?.description || "High-performance frameworks and analytics systems driving client ROI metrics.",
      list: (dbService?.tools?.list && dbService.tools.list.length > 0)
        ? dbService.tools.list
        : [
            { name: "Next.js", iconName: "Monitor", tag: "CORE DEV", desc: "Headless rendering backend with automatic static optimization and route pre-fetching." },
            { name: "React.js", iconName: "Cpu", tag: "FRONTEND", desc: "Modular, reactive front-end library built for speedy interaction states." },
            { name: "Tailwind CSS", iconName: "Palette", tag: "STYLING", desc: "Utility-first CSS compiler to keep stylesheet sizes down and performance high." },
            { name: "Google Analytics 4", iconName: "BarChart2", tag: "DATA RUN", desc: "Server-side tag setup to capture 100% of campaign lead and attribution logs." },
            { name: "Google Search", iconName: "Search", tag: "SEO CORE", desc: "Indexation audits, keyword position mapping, and search volume gap tracing." },
            { name: "Vercel", iconName: "Globe", tag: "EDGE NETWORK", desc: "Serverless global edge CDN network offering 99.9% uptime and instant caching." }
          ]
    },
    whyChooseUs: {
      eyebrow: dbService?.whyChooseUs?.eyebrow || "10 // OUR ADVANTAGE",
      titleIntro: dbService?.whyChooseUs?.titleIntro || "Why Leaders Choose",
      titleHighlight: dbService?.whyChooseUs?.titleHighlight || "Mohsin Designs",
      description: dbService?.whyChooseUs?.description || "We design fully custom solutions engineered around revenue metrics, performance, and transparency.",
      stats: (dbService?.whyChooseUs?.stats && dbService.whyChooseUs.stats.length > 0)
        ? dbService.whyChooseUs.stats
        : [
            { value: "100%", label: "PERFORMANCE", sublabel: "Next.js Headless\nSpeed Optimization", percentage: 1.0 },
            { value: "4.5x", label: "AVERAGE ROI", sublabel: "Attributed Leads\nGrowth Scaling", percentage: 0.9 },
            { value: "24/7", label: "DATA SYNC", sublabel: "Live Tracking\nReal-time Reports", percentage: 0.85 }
          ],
      list: (dbService?.whyChooseUs?.list && dbService.whyChooseUs.list.length > 0)
        ? dbService.whyChooseUs.list
        : [
            { title: "Engineered For Speed & ROI", desc: "We write clean, high-performance code with zero bloated themes or brittle templates.", tag: "Differentiator 01" },
            { title: "Direct Strategic Communication", desc: "No junior middlemen — work directly with senior architects dedicated to your vision.", tag: "Differentiator 02" },
            { title: "Transparent Telemetry & Ownership", desc: "Full ownership of your code, design assets, and marketing data at every step.", tag: "Differentiator 03" },
            { title: "Compounding Growth Systems", desc: "Solutions designed to build continuous momentum that outperforms competitors over time.", tag: "Differentiator 04" }
          ]
    },
    pricing: {
      eyebrow: dbService?.pricing?.eyebrow || "11 // TRANSPARENT TIERS",
      titleIntro: dbService?.pricing?.titleIntro || "Scalable Growth",
      titleHighlight: dbService?.pricing?.titleHighlight || "Investment Packages",
      plans: (dbService?.pricing?.plans && dbService.pricing.plans.length > 0)
        ? dbService.pricing.plans
        : [
            {
              name: "Sprint Tier",
              desc: "Targeted execution for focused optimization and rapid turnaround.",
              price: "$2,450",
              period: "sprint",
              isPopular: false,
              isCustom: false,
              badgeText: "",
              ctaText: "Select Sprint",
              features: ["Full Technical Diagnostic", "Core Feature Implementation", "Speed & Security Hardening", "2 Weeks Dedicated Support"]
            },
            {
              name: "Growth Tier",
              desc: "Complete comprehensive solution built to dominate competitive markets.",
              price: "$4,850",
              period: "project",
              isPopular: true,
              isCustom: false,
              badgeText: "Most Popular",
              ctaText: "Start Growth Plan",
              features: ["End-to-End Custom Build", "Conversion Rate Optimization", "Custom Analytics & Tracking", "SEO & Speed Maxima", "30 Days Hypercare Support"]
            },
            {
              name: "Enterprise Tier",
              desc: "Custom architected multi-location and enterprise-grade infrastructure.",
              price: "Custom",
              period: "custom scope",
              isPopular: false,
              isCustom: true,
              badgeText: "Custom Scoped",
              ctaText: "Request Scope",
              features: ["Unlimited Dynamic Architecture", "Headless CMS Integration", "Dedicated Lead Engineering", "Priority SLA & SLA Support"]
            }
          ]
    },
    faqs: (dbService?.faqs && dbService.faqs.length > 0)
      ? dbService.faqs
      : (dbService?.faq && Array.isArray(dbService.faq) && dbService.faq.length > 0
          ? dbService.faq.map((f: any) => ({ q: f.q || f.question, a: f.a || f.answer }))
          : [
              { q: "How quickly can we get started?", a: "We typically onboard new projects within 3-5 business days following the initial strategy discovery call." },
              { q: "Do you offer ongoing support and updates?", a: "Yes, we provide flexible retainer and maintenance support options to ensure your platform remains fast, secure, and continuously optimized." },
              { q: "Will I have complete ownership of all assets?", a: "100%. You retain full ownership of all code, design files, domains, and analytics accounts upon project completion." }
            ]),
    finalCta: {
      eyebrow: dbService?.finalCta?.eyebrow || "READY TO ACCELERATE?",
      titleIntro: dbService?.finalCta?.titleIntro || "Let's Build Your Next",
      titleHighlight: dbService?.finalCta?.titleHighlight || "Competitive Edge",
      titleLine2: dbService?.finalCta?.titleLine2 || "Together.",
      description: dbService?.finalCta?.description || "Schedule a free strategic consultation. We'll audit your existing presence and map out a concrete blueprint for scalable growth."
    },
    serviceArea: dbService?.serviceArea
  };

  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: service.title,
    message: "",
    agreePrivacy: false
  });
  const [submitted, setSubmitted] = useState(false);
  const [activeCaseIdx, setActiveCaseIdx] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        company: "",
        service: service.title,
        message: "",
        agreePrivacy: false
      });
    }, 4500);
  };

  // Recommended services list from CMS or fallback
  const recommendedServices = rawServices.filter((s: any) => s.slug !== service.slug && s.status !== 'draft');

  return (
    <main className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans">
      
      {/* ── Background Grid Pattern ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

      {/* ── Ambient Blobs ── */}
      <div className="absolute top-[2%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-yellow/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
      <div className="absolute bottom-[20%] left-[-12%] w-[48vw] h-[48vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />

      {/* ── 01. SERVICE HERO ── */}
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[135px] sm:pt-[150px] lg:pt-[165px] pb-16 sm:pb-24 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10">
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src="/portfolio_hero_bg.png"
            alt="Hero Background"
            className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* LEFT: Text & Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 space-y-6 text-left"
            >
              {/* Breadcrumbs */}
              <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-wider uppercase text-brand-zinc-400 dark:text-zinc-550 select-none">
                <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
                  Home
                </Link>
                <span className="text-brand-zinc-300 dark:text-zinc-700">/</span>
                <Link href="/services" className="hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
                  Services
                </Link>
                <span className="text-brand-zinc-300 dark:text-zinc-700">/</span>
                <span className="text-brand-blue dark:text-brand-yellow font-black">
                  {service.title}
                </span>
              </nav>

              <h1 className="font-heading text-3xl xs:text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight leading-[1.12] text-brand-dark dark:text-white max-w-2xl">
                {service.hero.titleIntro}{" "}
                <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
                  {service.hero.titleHighlight}
                  <svg className="absolute -bottom-1.5 left-0 w-full h-3.5 pointer-events-none text-brand-yellow opacity-90" viewBox="0 0 100 10" preserveAspectRatio="none">
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

              <p className="text-sm sm:text-base font-sans text-brand-zinc-655 dark:text-zinc-300 leading-relaxed max-w-xl font-normal">
                {service.hero.description}
              </p>

              {/* Benefits Checklist */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {service.hero.benefits.map((b: string, i: number) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs font-semibold text-brand-zinc-700 dark:text-zinc-355 group/item">
                    <span className="h-4.5 w-4.5 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0 mt-0.5 text-brand-blue dark:text-brand-yellow border border-brand-blue/15 dark:border-brand-yellow/15 shadow-sm group-hover/item:scale-105 transition-transform duration-300">
                      <Check className="h-3 w-3 stroke-[2.5]" />
                    </span>
                    <span className="leading-snug">{b}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <a href={service.hero.primaryCta?.link || "#contact-form"} className="btn-primary-cta">
                  <span>{service.hero.primaryCta?.text || "Start Your Project"}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>
                <a href={service.hero.secondaryCta?.link || "#what-included"} className="btn-secondary-cta">
                  <span>{service.hero.secondaryCta?.text || "Explore Inclusions"}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>
              </div>
            </motion.div>

            {/* RIGHT: Contact Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 flex justify-center w-full"
            >
              <div id="contact-form" className="contact-card-glass p-4.5 xs:p-6 sm:p-9 rounded-[24px] xs:rounded-[32px] shadow-2xl relative border border-brand-zinc-200/95 dark:border-white/10 overflow-hidden w-full max-w-xl">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white mb-5">
                  Request a Free Audit
                </h2>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      className="absolute inset-0 bg-white/98 dark:bg-[#12121e]/98 backdrop-blur-md rounded-[32px] p-6 sm:p-10 flex flex-col items-center justify-center text-center z-30 space-y-4"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-md animate-pulse">
                        <Check className="w-7 h-7" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-brand-dark dark:text-white">
                        Consultation Booked!
                      </h3>
                      <p className="text-xs font-sans text-brand-zinc-655 dark:text-zinc-355 max-w-xs mx-auto leading-relaxed">
                        Thanks for reaching out! We'll audit your brand's presence and email you a customized growth strategy within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="text"
                      required
                      placeholder="Full Name *"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="contact-input text-xs sm:text-sm"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="contact-input text-xs sm:text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="contact-input text-xs sm:text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Company Name (Optional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="contact-input text-xs sm:text-sm"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="contact-input appearance-none cursor-pointer pr-10 text-xs sm:text-sm bg-transparent"
                    >
                      <option value={service.title}>{service.title}</option>
                      {rawServices.filter((s: any) => s.title !== service.title).map((srv: any, idx: number) => (
                        <option key={idx} value={srv.title} className="bg-white dark:bg-[#12121e]">
                          {srv.title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-brand-zinc-400 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>

                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about your business goals *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="contact-input resize-none text-xs sm:text-sm"
                  />

                  <div className="flex items-center gap-2.5 pt-1">
                    <input
                      type="checkbox"
                      id="privacy"
                      required
                      checked={formData.agreePrivacy}
                      onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                      className="w-4 h-4 rounded border-brand-zinc-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                    />
                    <label htmlFor="privacy" className="text-[11px] font-sans text-brand-zinc-655 dark:text-zinc-400 cursor-pointer select-none">
                      I agree to the <Link href="/privacy" className="text-brand-blue dark:text-brand-yellow font-bold underline">Privacy Policy</Link>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-2xl bg-brand-yellow hover:bg-amber-400 text-[#080710] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-yellow/15 hover:shadow-brand-yellow/30 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer mt-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Request Free Proposal</span>
                  </button>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ── 02. CLIENT TRUST MARQUEE ── */}
      <section className="py-7 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/20 dark:bg-[#0c0b18]/40 select-none overflow-hidden logo-marquee-track-container relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-[#080710] z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-[#080710] z-20 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-6">
          <span className="text-[11px] font-mono font-black text-brand-blue dark:text-brand-yellow uppercase tracking-widest text-center md:text-left shrink-0">
            {service.clientTrust.heading}
          </span>

          <div className="flex-1 overflow-hidden relative">
            <div className="logo-marquee-track gap-12 md:gap-16 items-center">
              {[...Array(3)].map((_, outerIdx) => (
                <div key={outerIdx} className="flex gap-12 md:gap-16 items-center">
                  {service.clientTrust.logos.map((logoItem: any, lIdx: number) => {
                    const logoName = String(logoItem.name || "");
                    const CustomIcon = logoItem.icon && iconMap[logoItem.icon] ? iconMap[logoItem.icon] : null;

                    return (
                      <div key={lIdx} className="flex items-center gap-2.5 font-sans text-xs font-black uppercase text-brand-dark dark:text-white tracking-wider whitespace-nowrap">
                        {logoItem.image ? (
                          <img
                            src={logoItem.image}
                            alt={logoItem.name || "Logo"}
                            className="h-5 w-auto object-contain shrink-0 filter drop-shadow-sm max-w-[120px]"
                          />
                        ) : CustomIcon ? (
                          <CustomIcon className="h-4.5 w-4.5 text-brand-blue dark:text-brand-yellow shrink-0" />
                        ) : logoName.includes("Google Ads") || logoName.includes("Google Search") ? (
                          <GoogleAdsLogo />
                        ) : logoName.includes("Meta") ? (
                          <MetaLogo />
                        ) : logoName.includes("Amazon") ? (
                          <AmazonLogo />
                        ) : logoName.includes("Bing") ? (
                          <BingLogo />
                        ) : (
                          <AppleLogo />
                        )}
                        {logoItem.name && <span>{logoItem.name}</span>}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes marqueeLogos {
            0% { transform: translate3d(0, 0, 0); }
            100% { transform: translate3d(-33.33%, 0, 0); }
          }
          .logo-marquee-track {
            display: flex;
            width: max-content;
            animation: marqueeLogos 22s linear infinite;
            will-change: transform;
          }
          .logo-marquee-track-container:hover .logo-marquee-track {
            animation-play-state: paused;
          }
        `}</style>
      </section>

      {/* ── 03. WHAT'S INCLUDED (3 Core Pillars) ── */}
      <section id="what-included" className="relative overflow-hidden py-20 md:py-24 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-4"
          >
            <div className="flex justify-center">
              <span className="eyebrow-pill">{service.whatIncluded.eyebrow}</span>
            </div>
            <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
              {service.whatIncluded.titleIntro}{" "}
              <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
                {service.whatIncluded.titleHighlight}
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
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
            {service.whatIncluded.pillars.map((pillar: any, idx: number) => (
              <SpotlightCard key={idx} className="bg-zinc-50/80 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-5 xs:p-7 sm:p-8 flex flex-col justify-between h-full min-h-[280px] sm:min-h-[340px] hover:shadow-2xl hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 transition-all duration-300 relative overflow-hidden group">
                <div className="space-y-5">
                  <span className="font-serif italic text-4xl sm:text-5xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-500 leading-none select-none">
                    0{idx + 1}
                  </span>
                  <div className="space-y-2 text-left">
                    <h3 className="font-heading text-lg sm:text-xl font-extrabold text-brand-dark dark:text-white leading-tight">
                      {pillar.title}
                    </h3>
                    <p className="text-[13px] font-sans text-brand-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {pillar.desc}
                    </p>
                  </div>
                </div>

                <ul className="space-y-2.5 pt-6 mt-6 border-t border-brand-zinc-150 dark:border-white/5 text-left">
                  {(pillar.features || []).map((feature: string, fIdx: number) => (
                    <li key={fIdx} className="flex items-center gap-2.5 text-xs text-brand-zinc-655 dark:text-zinc-355 font-bold group/item">
                      <span className="w-5 h-5 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow flex items-center justify-center shrink-0 border border-brand-blue/15 dark:border-brand-yellow/15 group-hover/item:scale-105 transition-transform duration-300">
                        <Check className="w-3 h-3 stroke-[2.5]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            ))}
          </div>

        </div>
      </section>

      {/* ── 04. SERVICE STRATEGY (Left Sticky Right Scroll) ── */}
      <section className="relative overflow-x-clip py-20 md:py-24 bg-zinc-50/15 dark:bg-[#0c0b18]/10 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

            {/* Left Column Sticky info */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 self-start space-y-4 text-left">
              <span className="eyebrow-pill">{service.strategy.eyebrow}</span>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12] max-w-sm">
                {service.strategy.titleIntro}{" "}
                <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                  {service.strategy.titleHighlight}
                </span>
              </h2>
              <p className="text-sm sm:text-base font-sans text-brand-zinc-605 dark:text-zinc-350 font-normal leading-relaxed max-w-sm">
                {service.strategy.description}
              </p>
            </div>

            {/* Right Column Staggered List (Scrollable) */}
            <div className="lg:col-span-7 space-y-8 text-left">
              {service.strategy.components.map((comp: any, idx: number) => (
                <div
                  key={idx}
                  className="flex gap-6 sm:gap-8 items-start border-b border-brand-zinc-200/80 dark:border-white/5 pb-8 last:border-none last:pb-0 group"
                >
                  <span className="font-serif italic text-4xl sm:text-5xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-500 leading-none select-none">
                    {comp.num || `0${idx + 1}`}
                  </span>
                  
                  <div className="space-y-2 flex-1">
                    <h3 className="font-heading text-lg sm:text-xl font-extrabold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300 leading-tight">
                      {comp.title}
                    </h3>
                    <p className="text-xs sm:text-[13.5px] font-sans text-brand-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                      {comp.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── 05. BUSINESS BENEFITS (4 Key Benefits) ── */}
      <section className="relative overflow-hidden py-20 md:py-24 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-4"
          >
            <div className="flex justify-center">
              <span className="eyebrow-pill">{service.benefits.eyebrow}</span>
            </div>
            <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
              {service.benefits.titleIntro}{" "}
              <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
                {service.benefits.titleHighlight}
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
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {service.benefits.list.map((b: any, idx: number) => {
              const benefitIcons = [TrendingUp, Target, Award, DollarSign];
              const BenefitIcon = benefitIcons[idx % benefitIcons.length];

              return (
                <SpotlightCard key={idx} className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 p-4.5 xs:p-6 sm:p-7 rounded-[20px] xs:rounded-[26px] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[250px] relative overflow-hidden group">
                  <div className="relative flex items-center justify-between w-full pb-2.5 mb-3">
                    <BenefitIcon className="h-4.5 w-4.5 text-[#0306AC] dark:text-[#E9BD36] transition-transform duration-300 group-hover:rotate-[15deg]" />
                    <span className="text-[8.5px] font-mono tracking-widest text-brand-zinc-400 dark:text-zinc-500 select-none">BENEFIT 0{idx + 1}</span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-zinc-150 dark:bg-white/5" />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0306AC] dark:bg-[#E9BD36] group-hover:w-full transition-all duration-500 ease-out" />
                  </div>

                  <div className="space-y-2 text-left">
                    <div className="flex items-baseline gap-0.5 text-brand-dark dark:text-white">
                      <span className="font-heading font-black text-3xl sm:text-4xl tracking-tighter leading-none">
                        <DigitTicker value={b.metric} />
                      </span>
                    </div>
                    <h3 className="font-heading text-sm sm:text-base font-extrabold text-brand-dark dark:text-white mt-2 transition-colors duration-300 group-hover:text-brand-blue dark:group-hover:text-brand-yellow">
                      {b.title}
                    </h3>
                    <p className="text-xs font-sans text-brand-zinc-555 dark:text-zinc-400 leading-relaxed font-normal">
                      {b.desc}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-brand-zinc-150 dark:border-white/5 flex items-center justify-between text-brand-blue dark:text-brand-yellow font-mono text-[9px] font-black uppercase tracking-wider mt-5">
                    <span>{b.outcomeText || service.benefits.outcomeText || "Guaranteed Outcome"}</span>
                    <Sparkles className="w-3.5 h-3.5 animate-pulse shrink-0" />
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 06. OUR PROCESS / ROADMAP (Sticky Left, Scroll Right Editorial Cards) ── */}
      <section className="relative overflow-x-clip py-20 md:py-24 bg-zinc-50/15 dark:bg-[#0c0b18]/10 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left Sticky Panel */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 self-start space-y-4 text-left">
              <span className="eyebrow-pill">{service.process.eyebrow}</span>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12] max-w-sm">
                {service.process.titleIntro}{" "}
                <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                  {service.process.titleHighlight}
                </span>
              </h2>
              <p className="text-sm font-sans text-brand-zinc-605 dark:text-zinc-355 font-normal leading-relaxed max-w-sm">
                {service.process.description}
              </p>
              
              {/* Premium Callout Box */}
              {(service.process.calloutTag || service.process.calloutText) && (
                <div className="hidden lg:block border border-brand-zinc-200 dark:border-white/10 bg-white/40 dark:bg-[#12121e]/20 p-5 rounded-2xl text-xs space-y-2.5 max-w-sm">
                  <p className="font-mono text-[9px] uppercase tracking-wider text-[#0306AC] dark:text-[#E9BD36] font-extrabold">
                    {service.process.calloutTag}
                  </p>
                  <p className="text-brand-zinc-500 dark:text-zinc-400 font-normal leading-relaxed">
                    {service.process.calloutText}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Process Cards */}
            <div className="lg:col-span-7 space-y-6 text-left relative pl-1">
              {service.process.steps.map((step: any, idx: number) => {
                const deliverables = (step.deliverables && step.deliverables.length > 0)
                  ? step.deliverables
                  : (defaultRoadmapDeliverables[idx] || []);

                return (
                  <SpotlightCard
                    key={idx}
                    className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200 dark:border-white/10 p-4.5 xs:p-6 sm:p-8 rounded-[22px] xs:rounded-[30px] hover:shadow-2xl hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 flex flex-col justify-between group min-h-[220px]"
                  >
                    <div className="space-y-4">
                      {/* Top Header */}
                      <div className="flex items-center justify-between pb-3.5 border-b border-brand-zinc-150 dark:border-white/5">
                        <span className="font-serif italic text-3xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300 leading-none select-none">
                          0{idx + 1}
                        </span>
                        <span className="font-mono text-[8.5px] font-black tracking-widest text-[#0306AC] dark:text-[#E9BD36] bg-brand-blue/5 dark:bg-[#E9BD36]/10 px-3 py-1 rounded-full uppercase">
                          {step.phaseTag || `PHASE 0${idx + 1} // CAMPAIGN`}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-heading text-lg font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-xs sm:text-[13px] font-sans text-brand-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                          {step.desc}
                        </p>
                      </div>

                      {/* Technical Deliverables Checklist */}
                      {deliverables.length > 0 && (
                        <ul className="space-y-2 pt-3 border-t border-brand-zinc-150 dark:border-white/5">
                          {deliverables.map((item: string, dIdx: number) => (
                            <li key={dIdx} className="flex items-start gap-2 text-xs text-brand-zinc-550 dark:text-zinc-350 font-bold group/item">
                              <span className="h-4 w-4 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/15">
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              </span>
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-4 mt-5 border-t border-brand-zinc-150 dark:border-white/5 flex items-center justify-between text-brand-zinc-400 dark:text-zinc-555 font-mono text-[8px] font-bold uppercase tracking-widest">
                      <span>{step.footerLeft || "Verification Checkpoint"}</span>
                      <span>{step.footerRight || "Verified Node"}</span>
                    </div>
                  </SpotlightCard>
                );
              })}
            </div>

          </div>

        </div>
      </section>

      {/* ── 07. RESULTS (Metrics & Dynamic Cases Switcher) ── */}
      <section className="relative overflow-hidden py-16 md:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-[#F9FAFB]/50 dark:bg-[#0c0b18]/15">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* Left side text & Dynamic Case switcher */}
            <div className="lg:col-span-5 text-left space-y-6 lg:sticky lg:top-28">
              <div className="space-y-4">
                <span className="eyebrow-pill">{service.results.eyebrow}</span>
                <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl font-black text-brand-dark dark:text-white leading-[1.15]">
                  {service.results.titleIntro}
                  <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic block mt-1">
                    {service.results.titleHighlight}
                  </span>
                </h2>
                <p className="text-xs sm:text-sm font-sans text-brand-zinc-655 dark:text-zinc-355 leading-relaxed font-normal">
                  {service.results.description}
                </p>
              </div>

              {/* Dynamic Case Studies Switcher */}
              <div className="space-y-4 pt-4 border-t border-brand-zinc-200 dark:border-white/15 w-full">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="font-mono text-[9px] font-black uppercase text-brand-zinc-400 tracking-widest">
                    {service.results.caseStudiesEyebrow}
                  </h4>
                  <div className="flex items-center gap-1.5 select-none">
                    {service.results.caseStudies.map((_: any, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveCaseIdx(idx)}
                        className={`h-2.5 rounded-full transition-all duration-300 ${
                          activeCaseIdx === idx
                            ? "w-6 bg-[#0306AC] dark:bg-[#E9BD36]"
                            : "w-2.5 bg-brand-zinc-300 dark:bg-zinc-700 hover:bg-brand-zinc-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[195px] xs:min-h-[165px] w-full">
                  <AnimatePresence mode="wait">
                    {service.results.caseStudies.map((cs: any, idx: number) => {
                      if (activeCaseIdx !== idx) return null;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -15 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          className="p-5 rounded-2xl bg-white dark:bg-[#12121e]/50 border border-brand-zinc-200/60 dark:border-white/5 text-xs text-left space-y-2.5 shadow-sm absolute inset-0 w-full h-full flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                              <span className="font-heading font-extrabold text-[13px] text-brand-dark dark:text-white leading-tight">
                                {cs.title}
                              </span>
                            </div>
                            <p className="text-brand-zinc-555 dark:text-zinc-400 font-normal leading-relaxed text-[11.5px] line-clamp-3">
                              {cs.challenge} {cs.strategy}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between pt-2.5 border-t border-brand-zinc-100 dark:border-white/5">
                            <span className="font-mono text-[9px] uppercase tracking-wider text-brand-zinc-400">{cs.outcomeLabel || "Campaign Outcome"}</span>
                            <span className="font-mono text-[10px] font-black text-brand-blue dark:text-brand-yellow">{cs.outcome}</span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right side stats counters */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {service.results.metrics.map((metric: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200 dark:border-white/5 p-4.5 xs:p-6 rounded-[20px] xs:rounded-[22px] shadow-[0_4px_25px_rgba(0,0,0,0.015)] flex flex-col justify-between hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 group min-h-[170px] relative overflow-hidden">
                  <div className="relative flex items-center justify-between w-full pb-2 mb-3">
                    <Trophy className="h-4.5 w-4.5 text-brand-blue dark:text-brand-yellow transition-transform duration-300 group-hover:rotate-[15deg]" />
                    <span className="text-[8px] font-mono tracking-widest text-brand-zinc-400 dark:text-zinc-500 select-none">{metric.tag || `M0${idx + 1}`}</span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-zinc-150 dark:bg-white/5" />
                    <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-brand-blue dark:bg-brand-yellow group-hover:w-full transition-all duration-500 ease-out" />
                  </div>

                  <div className="text-left space-y-1">
                    <span className="block font-heading font-black text-3xl sm:text-4xl text-brand-dark dark:text-white leading-none">
                      <DigitTicker value={metric.value} />
                    </span>
                    <span className="block font-mono text-[9px] font-black uppercase text-brand-blue dark:text-brand-yellow tracking-widest pt-1">{metric.label}</span>
                    <span className="block text-[11px] font-sans text-brand-zinc-555 dark:text-zinc-400 pt-1 leading-snug font-normal">{metric.desc}</span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ── 08. INDUSTRIES WE SERVE (Dashed Icon Container Style) ── */}
      <section className="relative overflow-hidden py-20 md:py-24 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14 space-y-4"
          >
            <div className="flex justify-center">
              <span className="eyebrow-pill">{service.industries.eyebrow}</span>
            </div>
            <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
              {service.industries.titleIntro}{" "}
              <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
                {service.industries.titleHighlight}
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
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {service.industries.list.map((ind: any, idx: number) => {
              const indIcons = [Globe, Cpu, Building2, ShoppingCart, Star, Briefcase];
              const IndustryIcon = indIcons[idx % indIcons.length];
              
              const words = String(ind.title || "").split(" ");
              const abbreviation = ind.watermark || words.map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "IN";

              return (
                <SpotlightCard key={idx} className="bg-zinc-50/80 dark:bg-[#0c0b18] border border-brand-zinc-200/90 dark:border-white/5 p-5 xs:p-7 sm:p-8 rounded-[20px] xs:rounded-[28px] hover:shadow-2xl hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-500 flex flex-col justify-between min-h-[240px] relative group text-left">
                  
                  {/* Floating Watermark */}
                  <span className="absolute top-4 right-6 font-serif italic text-6xl font-black text-brand-zinc-200/20 dark:text-white/5 select-none pointer-events-none transition-transform duration-500 group-hover:scale-110">
                    {abbreviation}
                  </span>

                  <div className="space-y-5">
                    {/* Icon Container with double ring on hover */}
                    <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-zinc-100 dark:bg-[#1e1e2e] border border-brand-zinc-200 dark:border-white/10 group-hover:bg-[#0306AC] dark:group-hover:bg-[#E9BD36] group-hover:border-none transition-all duration-500 ease-out shadow-sm group-hover:shadow-md shrink-0">
                      <div className="absolute inset-0 rounded-2xl border border-dashed border-[#0306AC]/0 dark:border-[#E9BD36]/0 group-hover:border-[#0306AC]/30 dark:group-hover:border-[#E9BD36]/30 group-hover:scale-110 transition-all duration-500" />
                      <IndustryIcon className="h-6.5 w-6.5 text-[#0306AC] dark:text-[#E9BD36] group-hover:text-white dark:group-hover:text-brand-dark transition-all duration-300 group-hover:scale-110" />
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-heading text-base font-extrabold text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-300">
                        {ind.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] font-sans text-brand-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {ind.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-5 border-t border-brand-zinc-150 dark:border-white/5 flex items-center justify-between text-brand-blue/60 dark:text-brand-yellow/60 font-mono text-[8px] font-black uppercase tracking-widest">
                    <span>{ind.footerLeft || service.industries.footerLeft || "Target Sector"}</span>
                    <span>{ind.footerRight || service.industries.footerRight || "Verified Optimization"}</span>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 09. TOOLS & TECHNOLOGY (Console Mockup Style) ── */}
      <section className="relative overflow-hidden py-20 md:py-24 bg-zinc-50/10 dark:bg-[#0c0b18]/10 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-14 text-left">
            <div className="space-y-3">
              <span className="eyebrow-pill">{service.tools.eyebrow}</span>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl font-black text-brand-dark dark:text-white tracking-tight leading-tight">
                {service.tools.titleIntro}{" "}
                <span className="text-brand-blue dark:text-brand-yellow ml-1 font-black">
                  {service.tools.titleHighlight}
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-sans text-brand-zinc-655 dark:text-zinc-355 max-w-sm leading-relaxed font-normal">
              {service.tools.description}
            </p>
          </div>

          {/* Console Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {service.tools.list.map((tool: any, idx: number) => {
              const ToolIcon = iconMap[tool.iconName] || Search;
              const specs = getToolDescription(tool.name);

              return (
                <SpotlightCard
                  key={idx}
                  className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200 dark:border-white/10 rounded-[20px] xs:rounded-[28px] hover:shadow-2xl transition-all duration-300 flex flex-col justify-between min-h-[220px] relative text-left group"
                >
                  {/* Console Header Bar */}
                  <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-brand-zinc-150 dark:border-white/5 select-none bg-zinc-50/50 dark:bg-white/[0.01]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <span className="font-mono text-[8px] tracking-widest text-brand-zinc-400 dark:text-zinc-550 font-bold uppercase">
                      {tool.tag || specs.tag}
                    </span>
                  </div>

                  {/* Console Body */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-brand-blue/5 dark:bg-brand-yellow/5 flex items-center justify-center shrink-0 border border-brand-blue/10 dark:border-brand-yellow/10">
                          <ToolIcon className="w-4.5 h-4.5 text-brand-blue dark:text-brand-yellow" />
                        </div>
                        <h3 className="font-heading text-base font-extrabold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300">
                          {tool.name}
                        </h3>
                      </div>
                      <p className="text-xs sm:text-[13px] font-sans text-brand-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                        {tool.desc || tool.description || specs.desc}
                      </p>
                    </div>

                    {/* Progress Gauge */}
                    <div className="pt-4 mt-4 border-t border-brand-zinc-150 dark:border-white/5 space-y-1">
                      <div className="h-1 w-full bg-brand-zinc-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-brand-blue to-[#10b981] dark:from-[#E9BD36] dark:to-emerald-400 w-[90%] rounded-full group-hover:w-full transition-all duration-700 ease-out" />
                      </div>
                    </div>
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── 10. WHY CHOOSE US (Sticky Left, Scroll Right Differentiators) ── */}
      <section className="relative overflow-x-clip py-20 md:py-24 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="absolute inset-0 opacity-[0.022] pointer-events-none" style={{ backgroundImage: "radial-gradient(#0306AC 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-0">

            {/* Left Sticky Column with Stat Rings */}
            <div className="lg:w-[42%] lg:shrink-0 lg:sticky lg:top-28 self-start flex flex-col justify-start lg:pr-16 lg:border-r border-brand-zinc-200 dark:border-white/10 text-left space-y-7">
              <div className="space-y-4">
                <span className="eyebrow-pill">{service.whyChooseUs.eyebrow}</span>
                <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                  {service.whyChooseUs.titleIntro}{" "}
                  <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                    {service.whyChooseUs.titleHighlight}
                  </span>
                </h2>
                <p className="text-sm font-sans text-brand-zinc-655 dark:text-zinc-355 leading-relaxed font-normal">
                  {service.whyChooseUs.description}
                </p>
              </div>

              {/* 3 Circular Stat Rings */}
              <div className="flex items-center justify-between gap-2 pt-6 w-full select-none">
                {service.whyChooseUs.stats.map((st: any, sIdx: number) => (
                  <React.Fragment key={sIdx}>
                    <AnimatedStat
                      value={st.value}
                      label={st.label}
                      sublabel={st.sublabel}
                      percentage={(() => {
                        if (typeof st.percentage === "number") return st.percentage;
                        // Auto-derive percentage from value string
                        const raw = String(st.value || "0").replace(/[^0-9.]/g, "");
                        const num = parseFloat(raw);
                        if (isNaN(num) || num === 0) return 0.85;
                        // If value ends with %, use it directly (e.g. "11%" → 0.11)
                        if (String(st.value).includes("%")) return Math.min(num / 100, 1);
                        // Otherwise cap to 0.9 as a visual fallback
                        return Math.min(num / 100, 0.95);
                      })()}
                    />
                    {sIdx < service.whyChooseUs.stats.length - 1 && (
                      <div className="w-px h-12 bg-brand-zinc-200 dark:bg-white/10 shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right Column: Differentiators Rows with custom inline vector illustrations */}
            <div className="lg:flex-1 lg:pl-14 flex flex-col text-left">
              {service.whyChooseUs.list.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="group border-b border-brand-zinc-200 dark:border-white/10 last:border-b-0 py-8 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-6">
                    
                    {/* Left details */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue/8 border border-brand-blue/15 text-brand-blue dark:text-brand-yellow dark:bg-brand-yellow/10 dark:border-brand-yellow/20 group-hover:bg-[#0306AC] group-hover:text-white dark:group-hover:bg-[#E9BD36] dark:group-hover:text-brand-dark group-hover:border-none transition-all duration-300 mt-0.5 shadow-sm">
                        <Check className="h-[18px] w-[18px] stroke-[3]" />
                      </div>
                      
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <span className="font-mono text-[9px] font-black text-brand-blue/60 dark:text-brand-yellow/60 tracking-widest uppercase">
                          {item.tag || `Differentiator 0${idx + 1}`}
                        </span>
                        <h3 className="font-heading font-extrabold text-[1.1rem] text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300 leading-snug">
                          {item.title}
                        </h3>
                        <p className="text-[13px] text-brand-zinc-500 dark:text-zinc-400 leading-relaxed font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right Illustration container */}
                    <div className="hidden md:block shrink-0 w-[140px] h-[88px] rounded-2xl border border-brand-blue/10 bg-gradient-to-br from-brand-blue/4 to-transparent overflow-hidden group-hover:border-brand-blue/20 group-hover:from-brand-blue/8 transition-all duration-400">
                      <div className="w-full h-full p-2 group-hover:scale-[1.03] transition-transform duration-400 origin-center">
                        {differentiatorsIllustrations[idx % differentiatorsIllustrations.length]}
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── 10.5 PRICING PLANS ── */}
      {service.pricing && service.pricing.plans && (
        <section className="relative overflow-hidden py-20 md:py-24 bg-zinc-50/5 dark:bg-[#0c0b18]/5 border-b border-brand-zinc-200 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-14 space-y-4"
            >
              <div className="flex justify-center">
                <span className="eyebrow-pill">{service.pricing.eyebrow}</span>
              </div>
              <h2 className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
                {service.pricing.titleIntro}{" "}
                <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-1 font-black">
                  {service.pricing.titleHighlight}
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
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {service.pricing.plans.map((plan: any, idx: number) => {
                const isPopular = plan.isPopular;
                const isCustom = plan.isCustom;

                return (
                  <SpotlightCard
                    key={idx}
                    className={`bg-white/45 dark:bg-[#0c0b18]/45 backdrop-blur-xl border transition-all duration-500 flex flex-col justify-between h-full p-6 xs:p-7 sm:p-8 rounded-[28px] group relative overflow-hidden ${
                      isPopular
                        ? "border-brand-blue/70 dark:border-brand-yellow/70 shadow-[0_20px_50px_rgba(3,6,172,0.08)] dark:shadow-[0_20px_50px_rgba(233,189,54,0.06)] scale-[1.01] lg:scale-[1.03] z-20"
                        : "border-brand-zinc-200/90 dark:border-white/5 shadow-md hover:border-brand-blue/30 dark:hover:border-brand-yellow/30"
                    }`}
                  >
                    {(plan.badgeText || isPopular || isCustom) && (
                      <div className={`absolute top-0 right-0 font-mono text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-bl-2xl shadow-sm z-20 ${
                        isCustom
                          ? "bg-emerald-500 text-white"
                          : "bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark"
                      }`}>
                        {plan.badgeText || (isPopular ? "Most Popular" : isCustom ? "Custom Scoped" : "")}
                      </div>
                    )}

                    {/* Dynamic Ambient Glow inside the card */}
                    <div className={`absolute -bottom-16 -right-16 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none -z-10 ${
                      isPopular ? "bg-brand-blue dark:bg-brand-yellow" : "bg-blue-400 dark:bg-amber-400"
                    }`} />

                    <div className="space-y-6 text-left relative z-10">
                      <div className="space-y-2">
                        <span className="font-mono text-[9px] font-black text-brand-zinc-400 dark:text-zinc-550 uppercase tracking-widest block">
                          {plan.tag || `PLAN 0${idx + 1}`}
                        </span>
                        <h3 className="font-heading text-2xl font-black tracking-tight text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-300">
                          {plan.name}
                        </h3>
                        <p className="text-[12.5px] font-sans text-brand-zinc-555 dark:text-zinc-400 leading-relaxed font-normal min-h-[50px]">
                          {plan.desc}
                        </p>
                      </div>

                      <div className="py-4.5 border-t border-b border-brand-zinc-200/80 dark:border-white/5 flex items-baseline gap-1 bg-zinc-50/30 dark:bg-white/[0.005] px-2 rounded-xl">
                        <span className="font-heading font-black text-4xl sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-500 dark:from-brand-yellow dark:to-amber-400 leading-none">
                          {plan.price}
                        </span>
                        <span className="font-mono text-[9px] text-brand-zinc-400 dark:text-zinc-550 uppercase tracking-wider pl-1 whitespace-nowrap shrink-0">
                          / {plan.period}
                        </span>
                      </div>

                      <ul className="space-y-4 pt-1">
                        {(plan.features || []).map((feature: string, fIdx: number) => (
                          <li key={fIdx} className="flex items-start gap-3 text-xs text-brand-zinc-655 dark:text-zinc-300 font-semibold group/item hover:translate-x-0.5 transition-transform duration-200">
                            <span className="h-5 w-5 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow flex items-center justify-center shrink-0 mt-0.5 border border-brand-blue/15 dark:border-brand-yellow/15 group-hover:scale-110 group-hover:bg-brand-blue group-hover:text-white dark:group-hover:bg-brand-yellow dark:group-hover:text-brand-dark transition-all duration-300">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </span>
                            <span className="leading-snug pt-0.5">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 mt-8 border-t border-brand-zinc-200/80 dark:border-white/5 w-full relative z-10">
                      <Link
                        href={`/contact?service=${service.slug}&plan=${plan.name}`}
                        className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-sm ${
                          isPopular
                            ? "bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark hover:shadow-[0_8px_25px_rgba(3,6,172,0.25)] dark:hover:shadow-[0_8px_25px_rgba(233,189,54,0.3)] hover:-translate-y-0.5"
                            : "bg-brand-zinc-100 hover:bg-brand-blue dark:bg-white/5 dark:hover:bg-brand-yellow text-brand-dark dark:text-white hover:text-white dark:hover:text-brand-dark hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                      >
                        <span>{plan.ctaText || "Select Plan"}</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>

                  </SpotlightCard>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ── 11. RECOMMENDED SERVICES ── */}
      {recommendedServices.length > 0 && (
        <section className="relative overflow-hidden py-20 md:py-24 bg-zinc-50/10 dark:bg-[#0c0b18]/15 border-b border-brand-zinc-200 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14 text-left">
              <div className="space-y-4">
                <div className="flex">
                  <span className="eyebrow-pill">11 // RECOMMENDATION</span>
                </div>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.12]">
                  Services That Pair{" "}
                  <span className="relative inline-block text-brand-blue dark:text-brand-yellow pb-1 ml-2 font-black font-serif italic font-normal">
                    Perfect Together
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-brand-zinc-555 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Scale faster by pairing multi-channel growth campaigns and high-performance visual coding solutions.
                </p>
              </div>

              {/* Slider Control Buttons */}
              <div className="flex items-center gap-3 shrink-0 self-start sm:self-end select-none">
                <button
                  onClick={scrollLeft}
                  className="w-11 h-11 rounded-full border border-brand-zinc-200 dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-yellow text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Scroll left"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
                <button
                  onClick={scrollRight}
                  className="w-11 h-11 rounded-full border border-brand-zinc-200 dark:border-white/10 hover:border-brand-blue dark:hover:border-brand-yellow text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow flex items-center justify-center transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  aria-label="Scroll right"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pt-6 pb-6 px-3 scroll-smooth"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {recommendedServices.map((recSrv: any, idx: number) => (
                <Link
                  key={idx}
                  href={`/services/${recSrv.slug}`}
                  className="snap-start shrink-0 w-[290px] xs:w-[325px] sm:w-[360px] flex flex-col group/rec cursor-pointer no-underline"
                >
                  <SpotlightCard className="bg-white/45 dark:bg-[#0c0b18]/45 border border-brand-zinc-200/90 dark:border-white/5 p-6 xs:p-7 rounded-[28px] hover:shadow-[0_20px_40px_-15px_rgba(3,6,172,0.06)] dark:hover:shadow-[0_20px_40px_-15px_rgba(233,189,54,0.04)] group-hover/rec:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between h-full min-h-[220px] relative overflow-hidden">
                    
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(3,6,172,0.02),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(233,189,54,0.015),transparent_70%)] pointer-events-none -z-10" />

                    <div className="flex items-center justify-between w-full relative z-10">
                      <div className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue/5 border border-brand-blue/10 text-brand-blue dark:text-brand-yellow dark:bg-brand-yellow/5 dark:border-brand-yellow/10 group-hover/rec:bg-brand-blue group-hover/rec:text-white dark:group-hover/rec:bg-brand-yellow dark:group-hover/rec:text-brand-dark group-hover/rec:border-transparent transition-all duration-300">
                        {getServiceIcon(recSrv.slug)}
                      </div>
                      <span className="font-mono text-[9px] font-black text-brand-zinc-400 dark:text-zinc-550 uppercase tracking-widest">
                        Rec. 0{idx + 1}
                      </span>
                    </div>

                    <div className="space-y-3 text-left relative z-10 mt-5 flex-1">
                      <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white group-hover/rec:text-brand-blue dark:group-hover/rec:text-brand-yellow transition-colors duration-300 leading-snug">
                        {recSrv.title}
                      </h3>
                      <p className="text-[12.5px] font-sans text-brand-zinc-555 dark:text-zinc-400 leading-relaxed font-normal">
                        {recSrv.heroDescription || recSrv.description || "High-impact growth strategies designed to accelerate conversions."}
                      </p>
                    </div>

                    <div className="relative z-10 flex items-center justify-between pt-4 mt-6">
                      <span className="text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 text-brand-zinc-600 dark:text-zinc-455 group-hover/rec:text-brand-blue dark:group-hover/rec:text-brand-yellow">
                        Explore Service
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/rec:translate-x-1" />
                      </span>
                    </div>
                  </SpotlightCard>
                </Link>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ── 12. LATEST ARTICLES ── */}
      <Blog />

      {/* ── 13. SERVICE AREA SECTION ── */}
      {service.serviceArea && <ServiceArea data={service.serviceArea} />}

      {/* ── 14. FAQ SECTION ── */}
      <FAQ
        data={{
          sectionTag: "14 // FREQUENTLY ASKED",
          titleIntro: "Service ",
          titleHighlight: "FAQ",
          list: (service.faqs || []).map((f: any) => ({
            category: service.title,
            question: f.q || f.question,
            answer: f.a || f.answer
          }))
        }}
      />

      {/* ── 14. FINAL CTA BANNER ── */}
      <section className="my-10 relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="relative z-10 flex flex-col justify-center gap-5 p-5 xs:p-7 sm:p-11 lg:p-14 lg:max-w-[62%] text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                </span>
                {service.finalCta.eyebrow}
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[46px] font-black leading-[1.25] tracking-tight text-white">
                {service.finalCta.titleIntro}{" "}
                <span className="relative inline-block">
                  <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-[46px] font-normal pl-1">
                    {service.finalCta.titleHighlight}
                  </span>
                  <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M 5 6 C 30 9, 70 9, 95 4" />
                  </svg>
                </span>{" "}
                <br />
                {service.finalCta.titleLine2}
              </h2>

              <p className="text-xs sm:text-sm font-sans text-white/90 leading-relaxed max-w-lg font-normal">
                {service.finalCta.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a href="#contact-form" className="btn-primary-cta">
                  <span>Schedule Discovery Session</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>
                <a href="/contact" className="btn-secondary-cta">
                  <span>Contact Office</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <Image
                  src="/founder_portrait_nobg.png"
                  alt="Founder Strategy Session"
                  width={320}
                  height={420}
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
            </div>
          </motion.div>
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive {
          font-family: 'Dancing Script', cursive;
        }
      `}} />
    </main>
  );
}
