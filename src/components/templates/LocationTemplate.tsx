"use client";

import CtaButton from "@/components/ui/CtaButton";
import { withTrailingSlash } from "@/lib/url";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useEffect, useMemo, useRef } from "react";
import { motion, useMotionValue, useSpring, useInView, useReducedMotion } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  ArrowRight,
  Play,
  MapPin,
  Clock,
  Trophy,
  Users,
  Smile,
  ArrowUpRight,
  Sparkles,
  Star
} from "lucide-react";
import Link from "@/components/ui/Link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import { isSafeHref } from "@/lib/utils";
import dynamic from "next/dynamic";

const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });

// An admin-typed button link is only used when it is a real page/http(s)/mailto/tel URL;
// anything else ("javascript:...", a typo'd scheme) falls back to the built-in default.
const safeHref = (href: any, fallback: string): string =>
  typeof href === "string" && isSafeHref(href) ? href.trim() : fallback;

// Heading intros are stored with or without a trailing space ("Engineered for Growth Across"
// vs "Scale Your Organic Revenue in Your "). The highlight that follows is a separate inline
// element, so always put exactly one space between the two - otherwise the default hero
// reads "...AcrossGlobal Markets." to screen readers, crawlers and copy/paste.
const withGap = (s: string): string => (s && s.trim() ? `${s.trimEnd()} ` : "");

function slugify(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

// ── STAT VALUE PARSING ──
// The admin types free text ("10+", "99.4%", "1,200+", "$2M", "24/7"). Split it into
// prefix / number / suffix so ONLY the number is animated and every other character is
// kept exactly as typed. (The old parser stripped every non-digit for the count and kept
// every non-digit as the suffix, so "99.4%" rendered as "994.%" and "1,200+" as "1200,+".)
interface ParsedStat { prefix: string; target: number; decimals: number; grouped: boolean; suffix: string }

function parseStat(value: string): ParsedStat | null {
  const m = String(value ?? "").trim().match(/^(\D*?)(\d[\d,]*(?:\.\d+)?)([\s\S]*)$/);
  if (!m) return null; // no digits at all ("N/A", "Top rated") -> shown as plain text
  const numStr = m[2];
  const target = parseFloat(numStr.replace(/,/g, ""));
  if (!Number.isFinite(target)) return null;
  return {
    prefix: m[1],
    target,
    decimals: numStr.includes(".") ? numStr.split(".")[1].length : 0,
    grouped: numStr.includes(","),
    suffix: m[3],
  };
}

function formatStat(p: ParsedStat, n: number): string {
  const num = p.grouped
    ? n.toLocaleString("en-US", { minimumFractionDigits: p.decimals, maximumFractionDigits: p.decimals })
    : n.toFixed(p.decimals);
  return `${p.prefix}${num}${p.suffix}`;
}

// ── 3D SPRING COUNTER COMPONENT ──
// Keyed on the text so the imperatively-written text node can never go stale when the
// value changes (live edit / navigation between hub pages).
function RollerCounter({ value }: { value: string }) {
  return <RollerCounterInner key={value} value={value} />;
}

function RollerCounterInner({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = useMemo(() => parseStat(value), [value]);
  const reduceMotion = useReducedMotion();

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 25,
    stiffness: 80,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!parsed) return;
    // prefers-reduced-motion: no count-up, just show the real number.
    if (reduceMotion) {
      if (ref.current) ref.current.textContent = formatStat(parsed, parsed.target);
      return;
    }
    if (isInView) motionValue.set(parsed.target);
  }, [motionValue, parsed, isInView, reduceMotion]);

  useEffect(() => {
    if (!parsed) return;
    return springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = formatStat(parsed, latest);
    });
  }, [springValue, parsed]);

  // Nothing numeric to animate: render exactly what was typed.
  if (!parsed) return <span className="tabular-nums">{value}</span>;

  return (
    <span className="tabular-nums">
      {/* The animated text starts at 0, so expose the real figure to screen readers / crawlers. */}
      <span ref={ref} aria-hidden="true">{formatStat(parsed, 0)}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

// ── DYNAMIC CURSOR SPOTLIGHT CARD WRAPPER ──
function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // --x / --y must live on the element that CONTAINS the glow layers. They used to be set on
  // a sibling wrapper, so the glow never followed the cursor (custom properties only inherit
  // downwards), and the ref callback also added a new listener on every render.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const offX = mouseX.on("change", (x) => el.style.setProperty("--x", `${x}px`));
    const offY = mouseY.on("change", (y) => el.style.setProperty("--y", `${y}px`));
    return () => {
      offX();
      offY();
    };
  }, [mouseX, mouseY]);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden group/spotlight ${className}`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Spotlight Hover Glow Layer (light mode) */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 group-hover/spotlight:opacity-100 dark:group-hover/spotlight:opacity-0 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(3, 6, 172, 0.08), transparent 80%)`
        }}
      />
      {/* Dark mode Spotlight Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[28px] opacity-0 dark:group-hover/spotlight:opacity-100 transition-opacity duration-500 z-10"
        style={{
          background: `radial-gradient(400px circle at var(--x, 0px) var(--y, 0px), rgba(233, 189, 54, 0.08), transparent 80%)`
        }}
      />

      <div className="w-full h-full relative z-20">
        {children}
      </div>
    </motion.div>
  );
}

// ── CUSTOM AD PLATFORM LOGOS ──
const GoogleAdsLogo = () => (
  <svg viewBox="0 0 48 48" className="h-[22px] w-auto shrink-0 filter drop-shadow-md">
    <path d="M34.7 4.3c-2.1 0-3.9 1-5.1 2.6L12.5 35.8c-1 1.7-1 3.8 0 5.5.9 1.6 2.6 2.5 4.5 2.5h20.3c3.2 0 5.7-2.6 5.7-5.7V10c0-3.1-2.5-5.7-5.7-5.7h-2.6z" fill="#F9BC05" />
    <path d="M12.5 35.8L29.6 6.9c1.2-1.6 3-2.6 5.1-2.6H17c-1.9 0-3.6.9-4.5 2.5L2.6 24.3c-1.8 3.1-.7 7.1 2.4 8.9l7.5 2.6z" fill="#4285F4" />
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-auto fill-[#0668E1] shrink-0 filter drop-shadow-md">
    <path d="M16.48 7.38c-1.34 0-2.58.55-3.5 1.55-.92-1-2.16-1.55-3.5-1.55-2.73 0-4.96 2.23-4.96 4.96s2.23 4.96 4.96 4.96c1.34 0 2.58-.55 3.5-1.55.92 1 2.16 1.55 3.5 1.55 2.73 0 4.96-2.23 4.96-4.96s-2.23-4.96-4.96-4.96zm-7 8.08c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12zm7 0c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12z" />
  </svg>
);

const AmazonLogo = () => (
  <svg viewBox="0 0 48 48" className="h-[18px] w-auto fill-brand-dark dark:fill-white shrink-0">
    <path d="M26.4 12c-6.1 0-10.4 3.6-10.4 9.8 0 5.4 3.2 8.4 8.1 8.4 4 0 6.6-1.9 8.1-3.9v3.1h5.8V12.4h-5.8v3.1c-1.6-2.1-4.2-3.5-8.1-3.5zm.9 12.3c-3 0-4.6-1.6-4.6-4.2s1.6-4.2 4.6-4.2 4.6 1.6 4.6 4.2-1.6 4.2-4.6 4.2z" />
    <path d="M12 38c10.4 6 22.4 4 28-2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M38 34l3.5 3.5-1.5 4" fill="#FF9900" />
  </svg>
);

const BingLogo = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-auto fill-[#008373] dark:fill-[#00b29a] shrink-0">
    <path d="M5 2L15 6v12l-6 4v-9l6-2V6L5 2z" />
  </svg>
);

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-auto fill-brand-dark dark:fill-white shrink-0">
    <path d="M18.7 18.5c-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8s-2 .8-3.2.8c-1.3 0-2.3-1.2-3.1-2.4C4.6 16 3.3 10.9 4.9 8.1c.8-1.4 2.2-2.3 3.8-2.3 1.2 0 2.4.8 3.2.8.7 0 2.1-.9 3.6-.9 1.5 0 2.9.5 3.8 1.8-3.1 1.8-2.6 6-0.1 7.2-.9 2.2-2.1 4.5-3.5 5.8zM15.9 4.2c.8-.9 1.3-2.2 1.1-3.5-1.1.1-2.5.8-3.3 1.8-.7.8-1.3 2.1-1.1 3.4 1.2.1 2.5-.7 3.3-1.7z" />
  </svg>
);

const EbayLogo = () => (
  <svg viewBox="0 0 48 24" className="h-6 w-auto shrink-0">
    <text x="0" y="18" className="font-sans font-black text-lg tracking-tight" fill="#E53238">e</text>
    <text x="11" y="18" className="font-sans font-black text-lg tracking-tight" fill="#0064D2">b</text>
    <text x="23" y="18" className="font-sans font-black text-lg tracking-tight" fill="#F5B100">a</text>
    <text x="34" y="18" className="font-sans font-black text-lg tracking-tight" fill="#86B817">y</text>
  </svg>
);

const RedditLogo = () => (
  <svg viewBox="0 0 24 24" className="h-[22px] w-auto fill-[#FF4500] shrink-0">
    <path d="M24 11.5c0-1.65-1.35-3-3-3-.96 0-1.86.48-2.42 1.24-1.64-1-3.85-1.64-6.23-1.72l1.32-4.14 4.3.92c.04.9.78 1.6 1.7 1.6 1 0 1.8-.8 1.8-1.8s-.8-1.8-1.8-1.8c-.84 0-1.54.58-1.74 1.36l-4.78-1.02c-.2-.04-.4.06-.48.24l-1.54 4.8c-2.42.04-4.66.68-6.32 1.68-.56-.74-1.46-1.2-2.42-1.2-1.65 0-3 1.35-3 3 0 1.1.6 2.06 1.48 2.58-.08.3-.12.62-.12.94 0 3.86 4.48 7 10 7s10-3.14 10-7c0-.32-.04-.64-.12-.94.88-.52 1.48-1.48 1.48-2.58z" />
  </svg>
);

// Dynamic icon resolver helper
const renderStatIcon = (iconName?: string, defaultIconName: string = "Trophy") => {
  const icons = LucideIcons as any;
  const IconComp = (iconName && icons[iconName]) || icons[defaultIconName] || icons.Trophy;
  return <IconComp className="h-5 w-5" />;
};

export default function LocationTemplate({ pageData }: { pageData?: any; params?: any }) {
  const router = useRouter();
  const pageContent = pageData?.content || {};
  // The hub's data lives under content.locationPage. Older documents stored it under
  // content.serviceArea; that key is only honoured when it really has the hub's shape,
  // because the HOMEPAGE's global "serviceArea" section (sectionTag / hubs / mapSrc ...)
  // uses the same key and must never leak into this page.
  const legacyHub = pageContent.serviceArea;
  const legacyLooksLikeHub =
    !!legacyHub && typeof legacyHub === "object" &&
    ["hero", "stats", "brandsStrip", "presence", "ctaBanner"].some((k) => !!legacyHub[k]);
  const locationData = pageContent.locationPage || (legacyLooksLikeHub ? legacyHub : {});

  // ── 1. HERO SECTION DATA ──
  const hero = {
    eyebrow: locationData.hero?.eyebrow || "OUR GLOBAL PRESENCE",
    titleIntro: locationData.hero?.titleIntro || "Engineered for Growth Across",
    titleHighlight: locationData.hero?.titleHighlight || "Global Markets.",
    description: locationData.hero?.description || "Empowering high-growth businesses and enterprise brands with bespoke web architecture, technical SEO, and conversion science tailored for local dominance.",
    ctaPrimaryText: locationData.hero?.ctaPrimaryText || "EXPLORE OUR WORK",
    ctaPrimaryHref: safeHref(locationData.hero?.ctaPrimaryHref, "/gallery"),
    ctaSecondaryText: locationData.hero?.ctaSecondaryText || "GET FREE STRATEGY",
    ctaSecondaryHref: safeHref(locationData.hero?.ctaSecondaryHref, "/contact-us"),
    bgLight: locationData.hero?.bgLight || "/locationhero.png",
    bgDark: locationData.hero?.bgDark || "/locationherodark.png"
  };

  // ── 2. STATS SECTION DATA ──
  const stats = {
    experience: {
      value: locationData.stats?.experience?.value || "10+",
      label: locationData.stats?.experience?.label || "Years Industry Experience",
      icon: locationData.stats?.experience?.icon || "Trophy"
    },
    countries: {
      value: locationData.stats?.countries?.value || "15+",
      label: locationData.stats?.countries?.label || "Active Geographic Hubs",
      icon: locationData.stats?.countries?.icon || "MapPin"
    },
    clients: {
      value: locationData.stats?.clients?.value || "500+",
      label: locationData.stats?.clients?.label || "Global Brands Powered",
      icon: locationData.stats?.clients?.icon || "Users"
    },
    satisfaction: {
      value: locationData.stats?.satisfaction?.value || "99.4%",
      label: locationData.stats?.satisfaction?.label || "Client Satisfaction Rate",
      icon: locationData.stats?.satisfaction?.icon || "Smile"
    }
  };

  // ── 3. BRANDS STRIP DATA ──
  // A saved array is respected even when empty (the editor lets the admin delete every logo;
  // previously the 7 built-in logos came straight back). Only a MISSING array uses defaults.
  const defaultLogos = [
    { name: "Google Ads" },
    { name: "Meta Business" },
    { name: "Amazon Ads" },
    { name: "Microsoft Bing" },
    { name: "Apple Search" },
    { name: "eBay Partner" },
    { name: "Reddit Ads" }
  ];
  const rawLogos = locationData.brandsStrip?.logos;
  const brandsStrip = {
    heading: locationData.brandsStrip?.heading || "TRUSTED AD PLATFORMS // CERTIFIED NETWORKS",
    // Items are {name, image} objects (or plain strings in old documents). Drop rows that have
    // neither a name nor an image so the strip never shows a lone placeholder sparkle.
    logos: (Array.isArray(rawLogos) ? rawLogos : defaultLogos)
      .map((l: any) => (typeof l === "string" ? { name: l } : l))
      .filter((l: any) => l && ((typeof l.name === "string" && l.name.trim()) || l.image)) as Array<{ name?: string; image?: string }>
  };
  // The marquee scrolls one "set" (1/3 of the track) then loops, so each set must be wide
  // enough to cover the viewport - a strip with 1-3 brands used to show an empty gap.
  const marqueeSet = brandsStrip.logos.length > 0
    ? Array.from({ length: Math.max(1, Math.ceil(8 / brandsStrip.logos.length)) }).flatMap(() => brandsStrip.logos)
    : [];

  // ── 4. COUNTRIES WE SERVE DATA ──
  const defaultCountries = [
    {
      id: "USA",
      name: "United States",
      slug: "usa",
      pageSlug: "usa",
      tagline: "NORTH AMERICA HUB",
      subtitle: "48 States & Major Metros",
      description: "Delivering enterprise-grade web development, full-stack architecture, and local organic SEO campaigns across premier US markets.",
      image: "/country_usa.png",
      flag: "/flag_usa.png",
      buttonText: "EXPLORE USA LOCATIONS",
      states: [
        { name: "Texas", pageSlug: "usa/texas" },
        { name: "California", pageSlug: "usa/california" },
        { name: "Florida", pageSlug: "usa/florida" },
        { name: "New York", pageSlug: "usa/new-york" },
        { name: "Washington", pageSlug: "usa/washington" },
        { name: "Illinois", pageSlug: "usa/illinois" },
        { name: "Georgia", pageSlug: "usa/georgia" },
        { name: "Colorado", pageSlug: "usa/colorado" }
      ]
    },
    {
      id: "AU",
      name: "Australia",
      slug: "australia",
      pageSlug: "australia",
      tagline: "ASIA-PACIFIC REGION",
      subtitle: "Sydney, Melbourne & Brisbane",
      description: "Empowering Australian businesses with sub-second website speed, conversion rate optimization, and custom e-commerce web applications.",
      image: "/country_au.png",
      flag: "/flag_au.png",
      buttonText: "EXPLORE AUSTRALIA",
      states: [
        { name: "New South Wales", pageSlug: "australia/nsw" },
        { name: "Victoria", pageSlug: "australia/victoria" },
        { name: "Queensland", pageSlug: "australia/queensland" },
        { name: "Western Australia", pageSlug: "australia/wa" }
      ]
    },
    {
      id: "NZ",
      name: "New Zealand",
      slug: "new-zealand",
      pageSlug: "new-zealand",
      tagline: "OCEANIA EXPANSION",
      subtitle: "Auckland, Wellington & Christchurch",
      description: "High-impact digital design systems and growth marketing architecture built specifically for New Zealand's innovative business landscape.",
      image: "/country_nz.png",
      flag: "/flag_nz.png",
      buttonText: "EXPLORE NEW ZEALAND",
      states: [
        { name: "Auckland", pageSlug: "new-zealand/auckland" },
        { name: "Wellington", pageSlug: "new-zealand/wellington" },
        { name: "Canterbury", pageSlug: "new-zealand/canterbury" }
      ]
    }
  ];

  const presence = {
    eyebrow: locationData.presence?.eyebrow || "GLOBAL COVERAGE",
    titleIntro: locationData.presence?.titleIntro || "Serving High-Growth Brands Across",
    titleHighlight: locationData.presence?.titleHighlight || "3 Continents",
    description: locationData.presence?.description || "Browse our localized service hubs and discover how we engineer high-converting digital assets tailored specifically for regional compliance, language nuances, and target search volume.",
    cursiveText: locationData.presence?.cursiveText || "Explore Locations",
    locationsLabel: locationData.presence?.locationsLabel || "ACTIVE REGIONAL LOCATIONS & STATE HUBS",
    // Same rule as the logos: a saved array (even an empty one) wins, only a missing one uses
    // the built-in example countries.
    countries: (Array.isArray(locationData.presence?.countries) ? locationData.presence.countries : defaultCountries) as any[]
  };

  // ── Link resolution for the directory ──
  // The site's location URLs are strictly hierarchical: /country/, /country/state/,
  // /country/state/city/. Page slugs may be stored bare ("texas"), as "usa/texas" or as a
  // full "usa/texas/dallas" path, so:
  //   country -> "/<pageSlug>/"
  //   state   -> "<country url><last segment of its slug>/"   (never a bare "/texas/", which 404s)
  //   3+ part slug (a city picked in the editor) -> "/<full path>/"
  // A country card with an explicitly empty link (a freshly added, not-yet-linked card) gets
  // NO link instead of a guessed one that would 404.
  const toPath = (v: string) =>
    /^https?:\/\//i.test(v) ? v : (v.startsWith("/") ? v : `/${v}`).replace(/\/+$/, "") + "/";
  const resolveCountryUrl = (country: any): string | null => {
    const explicit = String(country?.pageSlug || country?.url || country?.slug || "").trim();
    if (explicit) return toPath(explicit);
    const hasLinkFields = country?.pageSlug !== undefined || country?.url !== undefined || country?.slug !== undefined;
    if (hasLinkFields) return null;
    // Legacy documents without any link field: derive from the id/name like before.
    if (country?.id === "USA") return "/usa/";
    const derived = slugify(country?.name || "");
    return derived ? `/${derived}/` : null;
  };
  const resolveStateUrl = (countryUrl: string | null, st: any): string | null => {
    const name = typeof st === "string" ? st : st?.name || "";
    const segs = String(typeof st === "string" ? "" : st?.pageSlug || "").split("/").map((p) => p.trim()).filter(Boolean);
    if (segs.length >= 3) return `/${segs.join("/")}/`;
    const last = segs.length ? segs[segs.length - 1] : slugify(name);
    if (!last) return null;
    if (countryUrl) return `${countryUrl}${last}/`;
    return segs.length === 2 ? `/${segs.join("/")}/` : null;
  };

  // ── 5. CTA BANNER DATA ──
  const ctaBanner = {
    eyebrow: locationData.ctaBanner?.eyebrow || "READY FOR LOCAL DOMINANCE? ",
    titleIntro: locationData.ctaBanner?.titleIntro || "Scale Your Organic Revenue in Your",
    titleWord1: locationData.ctaBanner?.titleWord1 || "Target Market",
    titleWord2: locationData.ctaBanner?.titleWord2 || "Today? ",
    description: locationData.ctaBanner?.description || "Schedule a free technical audit with our lead architect. We'll analyze your existing regional footprint and map out a concrete growth strategy.",
    ctaPrimaryText: locationData.ctaBanner?.ctaPrimaryText || "BOOK STRATEGY SESSION",
    ctaPrimaryHref: safeHref(locationData.ctaBanner?.ctaPrimaryHref, "/contact-us"),
    ctaSecondaryText: locationData.ctaBanner?.ctaSecondaryText || "EXPLORE SHOWREEL",
    ctaSecondaryHref: safeHref(locationData.ctaBanner?.ctaSecondaryHref, "/gallery"),
    portraitSrc: locationData.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: locationData.ctaBanner?.portraitAlt || "Founder & Lead Architect"
  };

  // ── SECTION VISIBILITY ──
  // Convention: only an explicit `enabled: false` hides a section. Nothing is left behind when
  // a section is off (no empty wrapper, no orphan anchor, no stray padding).
  const heroOn = locationData.hero?.enabled !== false;
  const statsOn = locationData.stats?.enabled !== false;
  const brandsOn = locationData.brandsStrip?.enabled !== false && marqueeSet.length > 0;
  const presenceOn = locationData.presence?.enabled !== false;
  const ctaOn = locationData.ctaBanner?.enabled !== false;
  // Video testimonials live at the CONTENT root (not under locationPage). The component itself
  // renders nothing without playable items, so don't leave an empty <section id> behind either.
  const videoOn =
    pageContent.videoTestimonials?.enabled !== false &&
    Array.isArray(pageContent.videoTestimonials?.items) &&
    pageContent.videoTestimonials.items.length > 0;

  // ── FAQ ──
  // The admin "Page FAQs" tab (shared by every template) saves content.faqs / faqBadge /
  // faqTitle... The template used to read `pageData.faq` (a field the Page model does not have),
  // so FAQs entered for this page could never appear. Page-specific FAQs only - no fallback
  // to the homepage's global FAQ list.
  const faqItems: any[] = Array.isArray(pageContent.faqs)
    ? pageContent.faqs.filter((f: any) => f && String(f.question || "").trim() && String(f.answer || "").trim())
    : [];
  const faqOn = faqItems.length > 0 && pageContent.faqSection?.enabled !== false;

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-6">

      {/* ── BACKGROUND ART & EFFECTS ── */}
      <div className="absolute top-0 left-[-10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-brand-blue/[0.04] to-indigo-500/[0.02] dark:from-brand-blue/[0.08] dark:to-indigo-500/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[25%] right-[-15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-brand-yellow/[0.03] to-amber-500/[0.01] dark:from-brand-yellow/[0.06] dark:to-amber-500/[0.02] blur-[160px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
      <div className="absolute bottom-[20%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-blue/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute bottom-0 right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.04] blur-[130px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* Modern thin interactive background grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0306ac05_1px,transparent_1px),linear-gradient(to_bottom,#0306ac05_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10" />

      {/* ── 1. HERO SECTION ── */}
      {/* When the hero is hidden the page would have no <h1> at all - keep one for SEO / screen readers. */}
      {!heroOn && <h1 className="sr-only">{pageData?.title || `${hero.titleIntro} ${hero.titleHighlight}`.trim()}</h1>}

      {heroOn && (
      <section className="pt-28 md:pt-36 lg:pt-40 pb-16 lg:pb-24 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 min-h-[500px] lg:min-h-[560px] flex items-center">

        {/* Full-Bleed Background Images */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <img
            src={hero.bgLight}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right block dark:hidden"
          />
          <img
            src={hero.bgDark}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-right hidden dark:block"
          />

          {/* Readability Gradient Vignette */}
          <div className="absolute inset-y-0 left-0 w-full lg:w-[55%] bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent dark:from-[#080710] dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

            {/* Left Info Column */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 min-w-0 space-y-6 text-left"
            >
              <PageBreadcrumbs page={pageData} />
              {/* Star Badge */}
              <div className="inline-flex pointer-events-auto">
                <span className="eyebrow-pill select-none shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-current text-current shrink-0" />
                  {hero.eyebrow}
                </span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.18] text-brand-dark dark:text-white max-w-xl">
                {withGap(hero.titleIntro)}
                <AccentHighlight className="text-brand-blue dark:text-brand-yellow pb-1 font-black">
                  {hero.titleHighlight}
                </AccentHighlight>
              </h1>

              <div className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg">
                <RichTextRenderer content={hero.description} />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <CtaButton href={hero.ctaPrimaryHref}>{hero.ctaPrimaryText}</CtaButton>

                <CtaButton href={hero.ctaSecondaryHref} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{hero.ctaSecondaryText}</CtaButton>
              </div>
            </motion.div>

            {/* Right Column */}
            <div className="lg:col-span-5 min-w-0 hidden lg:block" />

          </div>
        </div>
      </section>
      )}

      {/* ── 2. STATS BAR SECTION with 3D Spring Roller Counters ── */}
      {statsOn && (
      <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/10 dark:bg-[#0c0b18]/10 section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Experience Card */}
            <div className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/5 p-6 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex items-center gap-4 hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 group">
              <div className="h-11 w-11 rounded-full bg-blue-50 dark:bg-blue-500/10 text-brand-blue dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {renderStatIcon(stats.experience.icon, "Trophy")}
              </div>
              <div className="text-left">
                <span className="block font-heading font-black text-3xl text-brand-dark dark:text-white leading-none">
                  <RollerCounter value={stats.experience.value} />
                </span>
                <span className="block text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-1">{stats.experience.label}</span>
              </div>
            </div>

            {/* Countries Card */}
            <div className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/5 p-6 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex items-center gap-4 hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 group">
              <div className="h-11 w-11 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {renderStatIcon(stats.countries.icon, "MapPin")}
              </div>
              <div className="text-left">
                <span className="block font-heading font-black text-3xl text-brand-dark dark:text-white leading-none">
                  <RollerCounter value={stats.countries.value} />
                </span>
                <span className="block text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-1">{stats.countries.label}</span>
              </div>
            </div>

            {/* Clients Card */}
            <div className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/5 p-6 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex items-center gap-4 hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 group">
              <div className="h-11 w-11 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {renderStatIcon(stats.clients.icon, "Users")}
              </div>
              <div className="text-left">
                <span className="block font-heading font-black text-3xl text-brand-dark dark:text-white leading-none">
                  <RollerCounter value={stats.clients.value} />
                </span>
                <span className="block text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-1">{stats.clients.label}</span>
              </div>
            </div>

            {/* Satisfaction Card */}
            <div className="bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/5 p-6 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.01)] flex items-center gap-4 hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 transition-all duration-300 group">
              <div className="h-11 w-11 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
                {renderStatIcon(stats.satisfaction.icon, "Smile")}
              </div>
              <div className="text-left">
                <span className="block font-heading font-black text-3xl text-brand-dark dark:text-white leading-none">
                  <RollerCounter value={stats.satisfaction.value} />
                </span>
                <span className="block text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-1">{stats.satisfaction.label}</span>
              </div>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* ── 3. LOGO RUNS ADS INFINITE MARQUEE ── */}
      {brandsOn && (
      <section className="py-7 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/20 dark:bg-[#0c0b18]/40 select-none overflow-hidden logo-marquee-wrapper relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent dark:from-[#080710] z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-white to-transparent dark:from-[#080710] z-20 pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-6">
          <span className="text-[11px] font-mono font-black text-brand-blue dark:text-brand-yellow uppercase tracking-widest text-center md:text-left shrink-0">
            {brandsStrip.heading}
          </span>

          <div className="flex-1 overflow-hidden relative">
            {/* Three identical sets; the track slides exactly one set (-33.333%) and loops. Each set
                carries its own trailing gap (pr-*) so the three widths are equal and the loop has no seam.
                Sets 2 and 3 are visual duplicates and hidden from assistive tech. */}
            <div className="logo-marquee-track items-center">
              {[0, 1, 2].map((outerIdx) => (
                <div key={outerIdx} aria-hidden={outerIdx > 0 ? true : undefined} className="flex shrink-0 gap-12 md:gap-16 pr-12 md:pr-16 items-center">
                  {marqueeSet.map((logoItem, lIdx: number) => {
                    const logoName = (logoItem?.name || "").trim();
                    const customImage = logoItem?.image || null;
                    const lname = logoName.toLowerCase();

                    // Matched case-insensitively: "google ads" / "Ebay" used to miss their vector logo.
                    const LogoComponent =
                      /google/.test(lname) ? GoogleAdsLogo :
                      /meta|facebook/.test(lname) ? MetaLogo :
                      /amazon/.test(lname) ? AmazonLogo :
                      /bing|microsoft/.test(lname) ? BingLogo :
                      /apple/.test(lname) ? AppleLogo :
                      /ebay/.test(lname) ? EbayLogo :
                      /reddit/.test(lname) ? RedditLogo : null;

                    return (
                      <div key={lIdx} className="flex items-center gap-2.5 font-sans text-xs font-black uppercase text-brand-dark dark:text-white tracking-wider whitespace-nowrap">
                        {customImage ? (
                          // The brand name is printed right next to the image, so the image itself is decorative.
                          <img src={customImage} alt="" loading="lazy" className="h-[22px] w-auto max-w-[90px] object-contain shrink-0 filter drop-shadow-sm" />
                        ) : LogoComponent ? (
                          <LogoComponent />
                        ) : (
                          <Sparkles className="h-4 w-4 text-brand-blue dark:text-brand-yellow shrink-0" />
                        )}
                        {logoName && <span>{logoName}</span>}
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
            animation: marqueeLogos 24s linear infinite;
            will-change: transform;
          }
          .logo-marquee-wrapper:hover .logo-marquee-track {
            animation-play-state: paused;
          }
          @media (prefers-reduced-motion: reduce) {
            .logo-marquee-track { animation: none; }
          }
        `}</style>
      </section>
      )}

      {/* ── VIDEO TESTIMONIALS ── */}
      {videoOn && (
      <section id="video-testimonials">
        <VideoTestimonials data={pageContent.videoTestimonials} />
      </section>
      )}

      {/* ── 4. COUNTRIES WE SERVE ── */}
      {presenceOn && (
      <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">

          {/* Header Block */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="text-left max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-xs font-black tracking-widest text-brand-blue dark:text-brand-yellow uppercase select-none">
                <span>{presence.eyebrow}</span>
                <span className="h-[2px] w-8 bg-brand-blue dark:bg-brand-yellow" />
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {withGap(presence.titleIntro)}
                <AccentHighlight className="text-brand-blue dark:text-brand-yellow font-cursive font-normal">
                  {presence.titleHighlight}
                </AccentHighlight>
              </h2>

              <div className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed">
                <RichTextRenderer content={presence.description} />
              </div>
            </div>

            {/* Cursive Text & Arrow Block */}
            <div className="flex items-center gap-3 shrink-0 self-start md:self-end pb-2 md:pr-10 select-none pointer-events-none">
              <svg className="w-12 h-12 text-brand-blue dark:text-brand-yellow transform rotate-[15deg] animate-bounce-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M20 70 Q 50 60, 70 20" />
                <path d="M55 25 L70 20 L75 35" strokeLinejoin="round" />
              </svg>
              <span className="font-cursive text-2xl text-brand-blue dark:text-brand-yellow font-bold transform -rotate-[5deg]">
                {presence.cursiveText}
              </span>
            </div>
          </div>

          {/* Location Cards Stack with Spotlight Hover Glow (nothing is rendered for an empty list) */}
          {presence.countries.length > 0 && (
          <div className="space-y-10">
            {presence.countries.map((country: any, idx: number) => {
              // See resolveCountryUrl / resolveStateUrl above: hierarchical /country/state/ URLs,
              // and no link at all when the card has no linked page yet.
              const countryUrl = resolveCountryUrl(country);

              const flagSrc = country.flag || (country.id === "NZ" ? "/flag_nz.png" : country.id === "AU" ? "/flag_au.png" : "/flag_usa.png");
              const coverImg = country.image || "/country_usa.png";
              const countryName = String(country.name || "").trim() || "Location";

              // Normalize states: array of {name, pageSlug} objects or plain strings.
              const statesList: { name: string; url: string | null }[] = Array.isArray(country.states)
                ? country.states
                    .map((st: any) => ({
                      name: String(typeof st === "string" ? st : st?.name || "").trim(),
                      url: resolveStateUrl(countryUrl, st),
                    }))
                    .filter((s: { name: string }) => s.name)
                : [];

              return (
                <div
                  key={`${country.id || "country"}-${idx}`}
                  // The whole card is a mouse shortcut to the country page; keyboard / screen-reader
                  // users use the real "Explore" link inside it.
                  onClick={countryUrl ? () => router.push(withTrailingSlash(countryUrl)) : undefined}
                  className={`block no-underline group/card-link ${countryUrl ? "cursor-pointer" : ""}`}
                >
                  <SpotlightCard className="rounded-[28px] border border-brand-zinc-200 dark:border-white/10">
                    <div className={`bg-white dark:bg-[#0c0b18] p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center relative overflow-hidden group/card ${countryUrl ? "cursor-pointer" : ""}`}>

                      {/* Subtle radial glow */}
                      <div className="absolute inset-0 bg-[radial-gradient(#0306ac02_1px,transparent_1.5px)] dark:bg-[radial-gradient(#ffffff01_1px,transparent_1.5px)] bg-[size:24px_24px] pointer-events-none" />

                      {/* Left Column: Visual Artwork & Flag */}
                      <div className="w-full lg:w-[35%] h-[260px] sm:h-[280px] rounded-[22px] overflow-hidden relative border border-brand-zinc-200 dark:border-white/10 shrink-0 bg-[#0c0b18]">
                        <img
                          src={coverImg}
                          alt={countryName}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover/card:scale-[1.05] transition-transform duration-700 pointer-events-none filter contrast-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                        {/* Country Tag Badge */}
                        <div className="absolute top-4 left-4 bg-white/90 dark:bg-[#080710]/90 backdrop-blur-md border border-white/20 dark:border-white/10 px-3 py-1 rounded-full">
                          <span className="text-[10px] font-mono font-black text-brand-blue dark:text-brand-yellow uppercase tracking-wider">
                            {country.subtitle || "REGIONAL HUB"}
                          </span>
                        </div>

                        {/* Floating Flag Badge */}
                        <div className="absolute bottom-4 left-4 h-12 w-12 rounded-full overflow-hidden border-2 border-white dark:border-[#080710] shadow-2xl flex items-center justify-center bg-white dark:bg-[#0c0b18]">
                          <img
                            src={flagSrc}
                            alt={`${countryName} flag`}
                            loading="lazy"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      {/* Right Column: Information & Interactive States */}
                      <div className="flex-1 flex flex-col justify-between space-y-5 text-left relative z-20 w-full">
                        <div className="space-y-4">

                          {/* Title & Button Row */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-zinc-200/80 dark:border-white/10 pb-4">
                            <div>
                              <h3 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight group-hover/card:text-brand-blue dark:group-hover/card:text-brand-yellow transition-colors duration-300">
                                {countryName}
                              </h3>
                              {country.tagline && (
                                <span className="block text-[11px] font-mono font-bold text-brand-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
                                  {country.tagline}
                                </span>
                              )}
                            </div>

                            {countryUrl && (
                              <Link
                                href={countryUrl}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 px-5 py-2 text-[11px] font-mono font-black uppercase text-brand-blue dark:text-brand-yellow group-hover/card:bg-brand-blue dark:group-hover/card:bg-brand-yellow group-hover/card:text-white dark:group-hover/card:text-[#080710] transition-all duration-300 shrink-0 no-underline"
                              >
                                <span>{country.buttonText || `EXPLORE ${countryName.toUpperCase()}`}</span>
                                <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                              </Link>
                            )}
                          </div>

                          {/* Country Description */}
                          {country.description && (
                            <div className="text-xs sm:text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed">
                              <RichTextRenderer content={country.description} />
                            </div>
                          )}

                          {/* States Badge List (hierarchical URL /countrySlug/stateSlug/) - only when there are states */}
                          {statesList.length > 0 && (
                          <div className="pt-2 space-y-2.5">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 text-brand-blue dark:text-brand-yellow" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-zinc-400 dark:text-zinc-500">{presence.locationsLabel}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {statesList.map((stateItem, sIdx: number) => {
                                const chipClass = "inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-3.5 py-1.5 text-[10px] font-mono font-bold text-brand-zinc-700 dark:text-zinc-300 uppercase transition-all duration-200 no-underline";
                                const dot = <span className="h-1.5 w-1.5 rounded-full bg-brand-blue dark:bg-brand-yellow" />;
                                return stateItem.url ? (
                                  <Link
                                    key={sIdx}
                                    href={stateItem.url}
                                    onClick={(e) => e.stopPropagation()}
                                    className={`${chipClass} hover:border-brand-blue dark:hover:border-brand-yellow hover:text-brand-blue dark:hover:text-brand-yellow hover:scale-105`}
                                  >
                                    {dot}
                                    {stateItem.name}
                                  </Link>
                                ) : (
                                  <span key={sIdx} className={chipClass}>
                                    {dot}
                                    {stateItem.name}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          )}

                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              );
            })}
          </div>
          )}

        </div>
      </section>
      )}

      {/* ── 5. CTA BANNER SECTION ── */}
      {ctaOn && (
      <section id="contact" className="relative overflow-hidden bg-white dark:bg-[#080710] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="cta-banner-card">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[58%]">
              <div className="eyebrow-pill-yellow">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-accent)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-accent)]" />
                </span>
                {ctaBanner.eyebrow}
              </div>

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                {withGap(ctaBanner.titleIntro)}
                <span className="inline-block">
                  {withGap(ctaBanner.titleWord1)}
                  <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {ctaBanner.titleWord2}
                  </AccentHighlight>
                </span>
              </h2>

              <RichTextRenderer
                content={ctaBanner.description}
                className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
              />

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <CtaButton href={ctaBanner.ctaPrimaryHref}>{ctaBanner.ctaPrimaryText}</CtaButton>

                <CtaButton href={ctaBanner.ctaSecondaryHref} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{ctaBanner.ctaSecondaryText}</CtaButton>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <img
                  src={ctaBanner.portraitSrc}
                  alt={ctaBanner.portraitAlt}
                  loading="lazy"
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ── PAGE FAQs (admin "Page FAQs" tab -> content.faqs) ──
          Page-specific only: no fallback to the homepage's global FAQ list or built-in sample FAQs. */}
      {faqOn && (
        <PageInlineFaqs
          data={pageContent}
          faqs={faqItems}
          faqSchemaMarkup={pageContent.faqSchemaMarkup}
          badge={pageContent.faqBadge}
          title={pageContent.faqTitleHighlight || pageContent.faqTitle}
          description={pageContent.faqDescription}
        />
      )}

    </div>
  );
}
