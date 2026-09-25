"use client";

import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useState } from "react";
import Link from "@/components/ui/Link";
import Image from "next/image";
import dynamic from "next/dynamic";
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
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import { cleanMojibake, isSafeHref } from "@/lib/utils";

const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });

// ── Small helpers ─────────────────────────────────────────────────────────────

// Admin-entered CTA links: keep them only when they are safe (no javascript: etc.),
// otherwise fall back to the template default so a button never goes nowhere.
const safeHref = (href: unknown, fallback: string): string =>
  typeof href === "string" && href.trim() && isSafeHref(href) ? href.trim() : fallback;

// Service cards are wrapped in a <Link>, so their summary must be plain text: rendering
// rich text (or [text](url) markdown) inside would nest an <a> in an <a> (invalid DOM +
// hydration warning). Strip markup, decode the common entities, collapse whitespace.
const toPlainText = (value: unknown): string => {
  if (typeof value !== "string" || !value) return "";
  return cleanMojibake(value)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
};

// The service's "Order / Position" field is free text ("05", "5", ""). Non-numeric /
// missing values sort last; ties keep the catalog's own order.
const parseOrder = (value: unknown): number => {
  const n = parseFloat(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : Infinity;
};

// Card feature bullets: first non-empty list among the candidates. Items can be plain
// strings or objects ({ title } pillars), so normalise to trimmed, non-empty strings.
const toFeatureList = (...sources: any[]): string[] => {
  for (const src of sources) {
    if (!Array.isArray(src)) continue;
    const list = src
      .map((f: any) => (typeof f === "string" ? f : f?.title || f?.text || f?.label || f?.name || ""))
      .map((f: any) => cleanMojibake(String(f)).trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  return [];
};

// next/image throws for absolute URLs on hosts missing from next.config remotePatterns,
// which would take the whole page down when an admin pastes an arbitrary image URL.
const isConfiguredImageHost = (src: string) =>
  !/^https?:\/\//i.test(src) || /^https:\/\/(res\.cloudinary\.com|images\.unsplash\.com|mohsindesigns\.com)\//i.test(src);

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
  const hasFeatures = Array.isArray(card.features) && card.features.length > 0;
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
          {/* Plain text on purpose: the whole card is a link (see toPlainText). */}
          {card.desc && (
            <p className="text-[13px] text-gray-600 dark:text-zinc-400 leading-relaxed font-normal line-clamp-4">
              {card.desc}
            </p>
          )}

          {/* Feature Checkpoints */}
          {hasFeatures && (
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
  const { allBlogs, faq } = useContent();

  // Strictly use this specific page's own content
  const content = pageData?.content || {};

  // Section visibility. Only an explicit `enabled: false` hides a section (undefined = visible).
  // NB: these must read the saved CONTENT flags - the normalised `hero`/`grid`/`ctaBanner`
  // objects below never carry `enabled`, so testing them (as this used to) made the editor's
  // hide/show switches do nothing.
  const showHero = content.hero?.enabled !== false;
  const showGrid = content.grid?.enabled !== false;
  const showCta = content.ctaBanner?.enabled !== false;

  const hero = {
    badgeText: content.hero?.badgeText || "ENGINEERED FOR COMPOUNDING ROI",
    titleIntro: content.hero?.titleIntro || "High-Performance Growth &",
    titleHighlight: content.hero?.titleHighlight || "Digital Architecture",
    description: content.hero?.description || "From custom Next.js platforms to full-funnel acquisition engines, we design, engineer, and scale market-leading digital products that dominate competitive categories.",
    // The editor writes `backgroundImage` (and reads it first), so it must win over the legacy
    // `bgImage`. No hardcoded default file: /portfolio_hero_bg.png is not in /public (404), so a
    // blank field simply renders the hero without a photo instead of a broken image.
    bgImage: content.hero?.backgroundImage || content.hero?.bgImage || "",
    ctaPrimary: {
      label: content.hero?.ctaPrimary?.label || "Schedule Strategy Call",
      href: safeHref(content.hero?.ctaPrimary?.href, "/contact-us"),
    },
    ctaSecondary: {
      label: content.hero?.ctaSecondary?.label || "Explore Inclusions",
      href: safeHref(content.hero?.ctaSecondary?.href, "#services-grid"),
    },
  };

  // The default secondary button scrolls to the grid; with the grid hidden that anchor would
  // be dead, so drop the button rather than ship a link that goes nowhere.
  const showHeroSecondary = !(hero.ctaSecondary.href === "#services-grid" && !showGrid);

  const grid = {
    eyebrow: content.grid?.eyebrow || "OUR CORE CAPABILITIES",
    titleIntro: content.grid?.titleIntro || "Engineered Services For",
    titleHighlight: content.grid?.titleHighlight || "Compounding Growth",
    subtext: content.grid?.subtext || "Every service is built on scalable modern engineering, conversion rate science, and relentless performance standards.",
    ctaText: content.grid?.ctaText || "Explore Scope & Inclusions",
  };

  const ctaBanner = {
    eyebrow: content.ctaBanner?.eyebrow || "READY TO ACCELERATE? ",
    titleIntro: content.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleHighlight: content.ctaBanner?.titleHighlight || "Competitive Edge",
    titleLine2: content.ctaBanner?.titleLine2 || "Together.",
    description: content.ctaBanner?.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: content.ctaBanner?.ctaPrimary?.label || "Book Strategy Session",
      href: safeHref(content.ctaBanner?.ctaPrimary?.href, "/contact-us"),
    },
    ctaSecondary: {
      label: content.ctaBanner?.ctaSecondary?.label || "Direct Office Line",
      href: safeHref(content.ctaBanner?.ctaSecondary?.href, "/contact-us"),
    },
    // No hardcoded /founder.png default (not in /public -> 404). Blank = no portrait column.
    portraitSrc: content.ctaBanner?.portraitSrc || "",
    portraitAlt: content.ctaBanner?.portraitAlt || "",
  };

  // Get service inventory list from database
  const rawServices = Array.isArray(content?.globalServices) && content.globalServices.length > 0
    ? content.globalServices
    : (Array.isArray(content?.services) && content.services.length > 0 ? content.services : []);

  // Same visibility rule as the /services/[slug]/ route (status !== 'draft' && !isTrashed), plus
  // it needs a real slug and title: a card without a slug would link to a 404 and one without a
  // title has nothing to show. Then order by the service's "Order / Position" (number) field.
  // (Duplicate slugs keep the first entry in catalog order - the one /services/[slug]/ resolves.)
  const seenSlugs = new Set<string>();
  const cards = rawServices
    .filter((s: any) => {
      if (
        !s ||
        s.status === "draft" ||
        s.isTrashed ||
        typeof s.slug !== "string" || !s.slug.trim() ||
        typeof s.title !== "string" || !s.title.trim()
      ) return false;
      const key = s.slug.trim();
      if (seenSlugs.has(key)) return false;
      seenSlugs.add(key);
      return true;
    })
    .map((s: any, i: number) => ({ s, i, order: parseOrder(s.number) }))
    .sort((a: any, b: any) => (a.order === b.order ? a.i - b.i : a.order < b.order ? -1 : 1))
    .map(({ s }: any, idx: number) => ({
      id: (idx + 1).toString().padStart(2, "0"),
      iconName: s.icon || "Search",
      // No invented "Premium Solution" label: blank tag = no pill.
      tag: cleanMojibake(String(s.tag || s.category || "")).trim(),
      title: cleanMojibake(String(s.title)).trim(),
      // The short catalog summary reads best on a card; the hero copy is several paragraphs.
      desc: toPlainText(s.description || s.shortDescription || s.hero?.description || s.tagline),
      // No invented bullet points either: only what the service really lists.
      features: toFeatureList(s.hero?.benefits, s.features, s.whatIncluded?.pillars),
      slug: String(s.slug).trim(),
    }));

  // ── Featured blog posts ──────────────────────────────────────────────────────
  // Resolve the admin's picks (ids) against the post pool, keeping the picked order (the first
  // one is the large featured card). Deleted / trashed / draft posts are dropped: /api/blogs
  // also returns trashed posts, and their /blogs/<slug>/ pages 404. The section only renders
  // when at least one pick resolves - BlogSection would otherwise fall back to its built-in
  // demo articles (fake titles, dead links) while the post list is still loading.
  const blogCfg = content.blogSection;
  const blogPool: any[] = Array.isArray(allBlogs) ? allBlogs : [];
  const blogPosts: any[] = [];
  if (Array.isArray(blogCfg?.selectedPosts)) {
    const seen = new Set<string>();
    for (const pick of blogCfg.selectedPosts) {
      const id = String(pick && typeof pick === "object" ? (pick._id || pick.id || "") : pick ?? "");
      if (!id || seen.has(id)) continue;
      const post = blogPool.find((p: any) => p && (String(p._id ?? p.id ?? "") === id || (p.slug && p.slug === id)));
      if (!post || post.status === "draft" || post.isTrashed) continue;
      seen.add(id);
      blogPosts.push(post);
    }
  }
  const showBlog = blogCfg?.enabled !== false && blogPosts.length > 0;

  // ── FAQs ─────────────────────────────────────────────────────────────────────
  // Page FAQs (admin "Page FAQs" tab) win. Otherwise fall back to the global FAQ manager's items
  // using its visibility rule (global, or "specific" pages that include this one) - the raw
  // list used to be shown unfiltered, leaking items meant for other pages. No items at all = no
  // FAQ section (PageInlineFaqs would otherwise invent its own starter questions).
  const isFilledFaq = (f: any) => f && String(f.question ?? f.q ?? "").trim() && String(f.answer ?? f.a ?? "").trim();
  const pageFaqs = (Array.isArray(content.faqs) ? content.faqs : []).filter(isFilledFaq);
  const faqTargets = [pageData?.slug, "services"].filter(Boolean);
  const globalFaqs = (Array.isArray(faq?.items) ? faq.items : []).filter(
    (item: any) =>
      isFilledFaq(item) &&
      (item.visibility === "global" ||
        (item.visibility === "specific" && Array.isArray(item.targetPages) && item.targetPages.some((t: string) => faqTargets.includes(t))))
  );
  const faqItems = pageFaqs.length > 0 ? pageFaqs : globalFaqs;
  const showFaqs = content.faqs?.enabled !== false && content.faqSection?.enabled !== false && faqItems.length > 0;
  // PageInlineFaqs' strategy-session button defaults to "#contact", an anchor this page does not have.
  const faqData = {
    ...content,
    strategyAudit: {
      ...(content.strategyAudit || {}),
      href: safeHref(content.strategyAudit?.href, "/contact-us"),
    },
  };

  // Video testimonials: only mount (and download the chunk) when there is something to play.
  const videoItems = content.videoTestimonials?.items;
  const showVideos =
    content.videoTestimonials?.enabled !== false && Array.isArray(videoItems) && videoItems.length > 0;

  // With the hero hidden the grid header becomes the first thing on the page: it must carry the
  // page's single <h1> and clear the fixed navbar (the hero normally provides that top offset).
  const GridHeading = showHero ? "h2" : "h1";

  return (
    // <div>, not <main>: [...slug]/page.tsx and SiteLayout already provide the page's <main> landmark.
    // With the hero hidden, pad the top so the first section clears the fixed navbar.
    <div className={`flex-1 w-full bg-white dark:bg-[#080710] text-gray-900 dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans ${showHero ? "" : "pt-24 md:pt-32"}`}>

      {/* ── Floating blobs ─────────────────────────────────────────────────── */}
      <div className="absolute top-[3%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-[#0306ac]/[0.03] dark:bg-[#0306ac]/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
      <div className="absolute bottom-[20%] left-[-12%] w-[48vw] h-[48vw] rounded-full bg-[#0306ac]/[0.02] dark:bg-[#0306ac]/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />

      {/* ── 1. HERO ────────────────────────────────────────────────────────── */}
      {showHero && (
        <section className="pt-28 md:pt-36 lg:pt-40 pb-16 lg:pb-24 relative overflow-hidden border-b border-gray-200 dark:border-white/10">

          {/* Full background bleed image (decorative: empty alt, skipped when no image is set) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            {hero.bgImage && (
              <img
                src={hero.bgImage}
                alt=""
                aria-hidden="true"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* LEFT: Text */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as any }}
                className="lg:col-span-8 min-w-0 space-y-6 text-left"
              >
                <PageBreadcrumbs page={pageData} />
                {/* Badge */}
                <div className="flex items-center gap-3">
                  <span className="eyebrow-pill shadow-sm">
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {hero.badgeText}
                  </span>
                  <div className="h-[1px] w-12 bg-gray-300 dark:bg-zinc-700" />
                </div>

                {/* Headline */}
                <h1 className="font-heading text-3xl xs:text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.18] text-gray-900 dark:text-white max-w-3xl">
                  {hero.titleIntro}{" "}
                  <AccentHighlight className="text-[#0306ac] dark:text-[#e9bd36] pb-1 ml-1">
                    {hero.titleHighlight}
                  </AccentHighlight>
                </h1>

                <RichTextRenderer
                  content={hero.description}
                  className="text-sm sm:text-base font-sans text-gray-600 dark:text-zinc-300 leading-relaxed max-w-2xl"
                />

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <CtaButton href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}</CtaButton>
                  {showHeroSecondary && (
                    <CtaButton href={hero.ctaSecondary.href} variant="secondary">{hero.ctaSecondary.label}</CtaButton>
                  )}
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      )}

      {/* ── VIDEO TESTIMONIALS ─────────────────────────────────────────────── */}
      {showVideos && (
        <section id="video-testimonials">
          <VideoTestimonials data={content.videoTestimonials} />
        </section>
      )}

      {/* ── 2. SERVICES GRID ────────────────────────────────────────────────── */}
      {showGrid && (
        <section id="services-grid" className="relative overflow-hidden border-b border-gray-200 dark:border-white/10 section-y scroll-mt-24">

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
                <span className="eyebrow-pill">
                  {grid.eyebrow}
                </span>
              </div>
              <GridHeading className="font-heading text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] text-gray-900 dark:text-white">
                {grid.titleIntro}{" "}
                <AccentHighlight className="text-[#0306ac] dark:text-[#e9bd36] pb-1 ml-1">
                  {grid.titleHighlight}
                </AccentHighlight>
              </GridHeading>
              <RichTextRenderer
                content={grid.subtext}
                className="text-sm sm:text-base text-gray-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed"
              />
            </motion.div>

            {/* Cards — Responsive 1/2/3 col grid (or a friendly empty state) */}
            {cards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card: any, i: number) => (
                  <ServiceCard key={card.slug} card={card} index={i} ctaText={grid.ctaText} />
                ))}
              </div>
            ) : (
              <p className="text-center text-sm sm:text-base text-gray-600 dark:text-zinc-400 py-10">
                Our services are being updated. Please check back soon.
              </p>
            )}

          </div>
        </section>
      )}

      {/* ── 3. CTA BANNER ──────────────────────────────────────────────────── */}
      {showCta && (
        <section className="relative overflow-hidden section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="on-dark-surface relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#0306ac] via-[#020485] to-[#010252] dark:from-[#12121e] dark:via-[#0f0f1a] dark:to-[#080710] text-white p-8 sm:p-12 lg:p-14 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8"
            >
              {/* Left text column */}
              <div className={`relative z-10 flex flex-col justify-center gap-5 ${ctaBanner.portraitSrc ? "lg:max-w-[62%]" : "lg:max-w-3xl"}`}>

                {/* Eyebrow */}
                <div className="eyebrow-pill-yellow">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-accent)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-accent)]" />
                  </span>
                  {ctaBanner.eyebrow}
                </div>

                {/* Headline */}
                <h2 className="font-heading text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.35] tracking-tight text-white">
                  {ctaBanner.titleIntro}{" "}
                  <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {ctaBanner.titleHighlight}
                  </AccentHighlight>{" "}
                  {ctaBanner.titleLine2}
                </h2>

                {/* Description */}
                <RichTextRenderer
                  content={ctaBanner.description}
                  className="text-sm sm:text-base font-sans text-white/90 leading-relaxed max-w-lg"
                />

                {/* Buttons */}
                <div className="flex items-center gap-4 flex-wrap pt-2">
                  <CtaButton href={ctaBanner.ctaPrimary.href}>{ctaBanner.ctaPrimary.label}</CtaButton>
                  <CtaButton href={ctaBanner.ctaSecondary.href} variant="secondary">{ctaBanner.ctaSecondary.label}</CtaButton>
                </div>
              </div>

              {/* Right portrait arch - only when a portrait image is set (blank = text-only banner) */}
              {ctaBanner.portraitSrc && (
                <div className="hidden lg:flex flex-1 items-end justify-center relative pr-4">
                  <div className="absolute bottom-0 w-[300px] h-[300px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
                  <div className="relative z-10 w-[260px] h-[340px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl bg-[#010252]">
                    <Image
                      src={ctaBanner.portraitSrc}
                      // Decorative unless the admin describes the photo (see the CTA tab's "Portrait alt text").
                      alt={ctaBanner.portraitAlt}
                      width={300}
                      height={380}
                      unoptimized={!isConfiguredImageHost(ctaBanner.portraitSrc)}
                      className="w-full h-full object-cover object-top filter contrast-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute top-12 right-24 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
                </div>
              )}
            </motion.div>
          </div>
        </section>
      )}

      {/* ── 4. FAQS ────────────────────────────────────────────────────────── */}
      {showFaqs && (
        <PageInlineFaqs
          faqs={faqItems}
          faqSchemaMarkup={content.faqSchemaMarkup || pageData?.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
          data={faqData}
        />
      )}

      {/* ── 5. BLOG SECTION ────────────────────────────────────────────────── */}
      {showBlog && (
        <BlogSection
          title={blogCfg.title}
          subtitle={blogCfg.subtitle}
          description={blogCfg.description}
          data={blogCfg}
          posts={blogPosts}
        />
      )}

      {/* .font-cursive + the Dancing Script font already come from globals.css; the inline
          <style>/@import that used to sit here only re-requested the same font. */}
    </div>
  );
}
