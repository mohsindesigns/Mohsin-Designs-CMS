"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  LayoutGrid,
  Globe,
  Palette,
  Share2,
  BookOpen,
  Search,
  Tag,
  Calendar,
  Sparkles,
  Zap,
  Shield,
  Layers,
  Code,
  Smartphone
} from "lucide-react";
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

// Dynamic Lucide Icon Resolver
function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return <LayoutGrid className={className} />;
  const icons = LucideIcons as any;
  const IconComp = icons[name] || icons[name.charAt(0).toUpperCase() + name.slice(1)] || LayoutGrid;
  const isValidComponent = typeof IconComp === "function" || (typeof IconComp === "object" && IconComp !== null);
  if (isValidComponent) {
    return <IconComp className={className} />;
  }
  return <LayoutGrid className={className} />;
}

// Fallback seed posts if database has no articles yet
const FALLBACK_POSTS = [
  {
    _id: "1",
    id: "1",
    slug: "nextjs-growth-architecture",
    title: "How Next.js 16 & Server Actions Compound Organic Search Rankings",
    categoryKey: "engineering",
    categoryName: "Technical SEO",
    badge: "Technical SEO",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
    date: "Aug 15, 2026",
    readTime: "6 min read"
  },
  {
    _id: "2",
    id: "2",
    slug: "conversion-rate-heuristics",
    title: "11 Friction Points That Cut B2B SaaS Landing Page Conversions in Half",
    categoryKey: "cro",
    categoryName: "Conversion Rate",
    badge: "Conversion Rate",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    date: "Aug 10, 2026",
    readTime: "8 min read"
  },
  {
    _id: "3",
    id: "3",
    slug: "modern-brand-identity-systems",
    title: "Building Modern High-Yield Design Systems for Enterprise Scale",
    categoryKey: "design",
    categoryName: "UI/UX Architecture",
    badge: "UI/UX Architecture",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop",
    date: "Aug 04, 2026",
    readTime: "5 min read"
  },
  {
    _id: "4",
    id: "4",
    slug: "edge-rendering-performance",
    title: "Core Web Vitals Optimization: Slashing INP and LCP Below 200ms",
    categoryKey: "engineering",
    categoryName: "Engineering",
    badge: "Engineering",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    date: "Jul 28, 2026",
    readTime: "7 min read"
  },
  {
    _id: "5",
    id: "5",
    slug: "full-funnel-attribution-guide",
    title: "Multi-Touch Attribution in 2026: Tracking Compounding Lead Velocity",
    categoryKey: "growth",
    categoryName: "Growth Strategy",
    badge: "Growth Strategy",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1200&auto=format&fit=crop",
    date: "Jul 20, 2026",
    readTime: "9 min read"
  },
  {
    _id: "6",
    id: "6",
    slug: "ai-search-generative-optimization",
    title: "Optimizing Digital Brand Footprints for Google Search Generative Experience",
    categoryKey: "growth",
    categoryName: "AI Search",
    badge: "AI Search",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
    date: "Jul 12, 2026",
    readTime: "6 min read"
  }
];

export default function BlogTemplate({
  pageData,
  posts: initialPosts,
  categories: initialCategories
}: {
  pageData?: any;
  posts?: any[];
  categories?: any[];
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Extract blogPage data from CMS pageData or defaults
  const rawData = pageData?.content?.blogPage || pageData?.content || {};

  const hero = {
    badgeText: rawData.hero?.badgeText || "EXPLORE OUR EDITORIAL // INSIGHTS & STRATEGY",
    titleLine1: rawData.hero?.titleLine1 || "Modern Engineering &",
    titleHighlight: rawData.hero?.titleHighlight || "Growth Insights",
    description: rawData.hero?.description || "Actionable blueprints, architectural deep-dives, and conversion rate science to build compounding market advantage.",
    heroBgImage: rawData.hero?.heroBgImage || rawData.hero?.backgroundImage || rawData.hero?.bgImage || "/portfolio_hero_bg.png",
    heroBgAlt: rawData.hero?.heroBgAlt || "Blog Header Background",
    ctaPrimary: {
      label: rawData.hero?.ctaPrimary?.label || "Explore Articles",
      href: rawData.hero?.ctaPrimary?.href || "#articles"
    },
    ctaSecondary: {
      label: rawData.hero?.ctaSecondary?.label || "Schedule Strategy Call",
      href: rawData.hero?.ctaSecondary?.href || "/contact"
    }
  };

  const ctaBanner = {
    eyebrow: rawData.ctaBanner?.eyebrow || "READY TO ACCELERATE?",
    titleIntro: rawData.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleHighlight: rawData.ctaBanner?.titleHighlight || "Competitive Edge",
    titleLine2: rawData.ctaBanner?.titleLine2 || "Together.",
    description: rawData.ctaBanner?.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: rawData.ctaBanner?.ctaPrimary?.label || "Book Strategy Session",
      href: rawData.ctaBanner?.ctaPrimary?.href || "/contact"
    },
    ctaSecondary: {
      label: rawData.ctaBanner?.ctaSecondary?.label || "Watch Showreel",
      href: rawData.ctaBanner?.ctaSecondary?.href || "/gallery"
    },
    portraitSrc: rawData.ctaBanner?.portraitSrc || "/founder.png",
    portraitAlt: rawData.ctaBanner?.portraitAlt || "Mohsin Designs Lead Architect"
  };

  const filterMode = rawData.filterMode || "all";
  const selectedBlogIds: string[] = Array.isArray(rawData.selectedBlogIds) ? rawData.selectedBlogIds : [];
  const postsPerPage = Number(rawData.postsPerPage) || 6;

  // Resolve raw source posts
  const rawPosts = useMemo(() => {
    if (initialPosts && initialPosts.length > 0) {
      return initialPosts;
    }
    if (pageData?.posts && Array.isArray(pageData.posts) && pageData.posts.length > 0) {
      return pageData.posts;
    }
    if (rawData.blogPosts && Array.isArray(rawData.blogPosts) && rawData.blogPosts.length > 0) {
      return rawData.blogPosts;
    }
    return FALLBACK_POSTS;
  }, [initialPosts, pageData?.posts, rawData.blogPosts]);

  // Transform posts to uniform shape
  const allFormattedPosts = useMemo(() => {
    return rawPosts.map((p: any, idx: number) => {
      // Resolve category
      let categoryName = "Article";
      let categoryKey = "general";
      if (Array.isArray(p.categories) && p.categories.length > 0) {
        const firstCat = p.categories[0];
        categoryName = typeof firstCat === 'object' ? (firstCat.name || firstCat.title || "Article") : String(firstCat);
        categoryKey = typeof firstCat === 'object' ? (firstCat.slug || firstCat._id || firstCat.name?.toLowerCase().replace(/\s+/g, '-') || "cat") : String(firstCat).toLowerCase().replace(/\s+/g, '-');
      } else if (p.category) {
        categoryName = typeof p.category === 'object' ? (p.category.name || "Article") : String(p.category);
        categoryKey = categoryName.toLowerCase().replace(/\s+/g, '-');
      } else if (p.badge) {
        categoryName = p.badge;
        categoryKey = p.categoryKey || p.badge.toLowerCase().replace(/\s+/g, '-');
      }

      // Format date
      let displayDate = p.date || "";
      if (!displayDate && p.publishedAt) {
        try {
          displayDate = new Date(p.publishedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        } catch {
          displayDate = "Recent";
        }
      }
      if (!displayDate && p.createdAt) {
        try {
          displayDate = new Date(p.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
          });
        } catch {
          displayDate = "Recent";
        }
      }
      if (!displayDate) displayDate = "Aug 2026";

      // Calculate read time
      let readTime = p.readTime || "";
      if (!readTime && p.content) {
        const words = String(p.content).replace(/<[^>]*>/g, "").split(/\s+/).length;
        const minutes = Math.max(3, Math.ceil(words / 200));
        readTime = `${minutes} min read`;
      }
      if (!readTime) readTime = "5 min read";

      return {
        id: p._id || p.id || String(idx),
        _id: p._id || p.id || String(idx),
        slug: p.slug || p._id || String(idx),
        title: p.title || "Untitled Article",
        categoryKey,
        categoryName,
        badge: p.badge || categoryName,
        image: p.featuredImage || p.image || p.coverImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
        date: displayDate,
        readTime
      };
    });
  }, [rawPosts]);

  // Apply Selective Mode filtering if configured
  const activePosts = useMemo(() => {
    if (filterMode === "selective" && selectedBlogIds.length > 0) {
      return allFormattedPosts.filter((p: any) => selectedBlogIds.includes(p.id) || selectedBlogIds.includes(p._id));
    }
    return allFormattedPosts;
  }, [allFormattedPosts, filterMode, selectedBlogIds]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(activePosts.length / postsPerPage));
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * postsPerPage;
    return activePosts.slice(start, start + postsPerPage);
  }, [activePosts, currentPage, postsPerPage]);

  return (
    <main className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-6">

      {/* Floating Blurred Mesh Blobs */}
      <div className="absolute top-[1%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-yellow/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* ── 1. HERO SECTION WITH FULL BLEED BACKGROUND ────────────────── */}
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[230px] pb-10 md:pb-14 relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center border-b border-brand-zinc-200 dark:border-white/10">
        {/* Full Background Graphic */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src={hero.heroBgImage}
            alt={hero.heroBgAlt}
            className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
          />
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
                {hero.badgeText}
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-[1.12] tracking-tight text-brand-dark dark:text-white">
              {hero.titleLine1} <br />
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
              {hero.description}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a href={hero.ctaPrimary.href} className="btn-primary-cta">
                <span>{hero.ctaPrimary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </a>

              <a href={hero.ctaSecondary.href} className="btn-secondary-cta">
                <span>{hero.ctaSecondary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-8 pb-4">

        {/* ── 2. MODERN EDITORIAL CARDS WITH LINK WRAPPER ─────────────── */}
        <section id="articles" className="my-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {paginatedPosts.map((post: any) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug || post.id}`}
                  className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group select-none relative block cursor-pointer"
                >
                  <div>
                    {/* Full-Bleed Cover Image Banner */}
                    <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-brand-light dark:bg-zinc-950 border-b border-brand-zinc-200/80 dark:border-white/10">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        unoptimized
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Single Category Badge Overlay (Top Left) */}
                      <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-brand-blue text-white shadow-md">
                        <Star className="w-3 h-3 fill-current" />
                        {post.badge}
                      </span>
                    </div>

                    {/* Editorial Content Padding Box */}
                    <div className="p-6 sm:p-7">
                      <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors leading-[1.25] mb-2">
                        {post.title}
                      </h3>
                    </div>
                  </div>

                  {/* Clean Editorial Footer Row */}
                  <div className="px-6 sm:px-7 pb-6 sm:pb-7 flex items-center justify-between text-xs font-sans">
                    <span className="text-brand-zinc-400 dark:text-zinc-400 font-medium">
                      {post.date}
                    </span>

                    <span className="font-mono font-bold text-brand-blue dark:text-brand-yellow flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {paginatedPosts.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-[28px] border border-dashed border-brand-zinc-300 dark:border-white/10">
              <BookOpen className="w-10 h-10 text-brand-zinc-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-brand-dark dark:text-white">No Articles Found</h3>
              <p className="text-sm text-brand-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                There are no articles available in this category yet. Check back soon for new insights.
              </p>
            </div>
          )}
        </section>

        {/* ── 4. SLEEK FLOATING GLASSMORPHIC PAGINATION CAPSULE ───────── */}
        {totalPages > 1 && (
          <section className="my-14 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-[#12121e]/90 backdrop-blur-2xl border border-brand-zinc-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(3,6,172,0.08)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] p-2 rounded-full flex items-center gap-2 max-w-fit">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase text-brand-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex items-center gap-1 px-2 border-x border-brand-zinc-200/80 dark:border-white/10">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num: number) => (
                  <button
                    key={num}
                    onClick={() => setCurrentPage(num)}
                    className={`w-9 h-9 rounded-full text-xs font-mono font-black flex items-center justify-center transition-all cursor-pointer ${
                      currentPage === num
                        ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30 dark:bg-brand-yellow dark:text-brand-dark"
                        : "text-brand-zinc-600 dark:text-zinc-400 hover:bg-brand-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase text-brand-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        {/* ── 5. HIGH-CONVERSION AGENCY CTA BANNER ────────────────────── */}
        <section id="contact" className="my-8 relative overflow-hidden">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[62%]">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                </span>
                {ctaBanner.eyebrow}
              </div>

              {/* Headline */}
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                {ctaBanner.titleIntro} <br className="hidden sm:block" />
                <span className="whitespace-nowrap inline-block">
                  {ctaBanner.titleLine2}{" "}
                  <span className="relative inline-block">
                    <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                      {ctaBanner.titleHighlight}
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
                <a href={ctaBanner.ctaPrimary.href} className="btn-primary-cta">
                  <span>{ctaBanner.ctaPrimary.label}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>

                <a href={ctaBanner.ctaSecondary.href} className="btn-secondary-cta">
                  <span>{ctaBanner.ctaSecondary.label}</span>
                  <span className="btn-icon"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></span>
                </a>
              </div>
            </div>

            {/* Right Side Portrait & Arch Graphic */}
            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <Image
                  src={ctaBanner.portraitSrc}
                  alt={ctaBanner.portraitAlt}
                  width={320}
                  height={420}
                  unoptimized
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
            </div>
          </div>
        </section>

        {/* ── 6. PAGE SPECIFIC FAQS ── */}
        <PageInlineFaqs data={pageData?.content} />

      </div>
    </main>
  );
}
