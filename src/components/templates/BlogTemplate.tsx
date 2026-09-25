"use client";

import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useState, useMemo, useRef, useEffect, type ImgHTMLAttributes } from "react";
import Link from "@/components/ui/Link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  Star,
  Play,
  BookOpen,
  Search,
  X
} from "lucide-react";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { useContent } from "@/hooks/useContent";

/**
 * <img> that removes itself when the file 404s (a saved-but-missing upload used to leave a broken-image
 * icon + alt text over the hero / CTA). The ref check also catches an image that failed BEFORE hydration,
 * where React never sees the error event.
 */
function SafeImg({
  onFail,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> & { onFail?: () => void }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const fail = () => {
    setFailed(true);
    onFail?.();
  };
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.src]);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} onError={fail} {...props} />;
}

// Deterministic (UTC) label so server and browser always print the same date.
function formatDate(value: unknown): string {
  if (!value) return "";
  const d = new Date(value as any);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

interface CardCategory { name: string; slug: string }
interface Card {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  badge: string;
  categories: CardCategory[];
  date: string;
  readTime: string;
}

// Accepts the server-built cards (src/lib/blog-public.ts) and, defensively, raw Post-shaped objects.
function toCard(p: any, idx: number): Card {
  const cats: CardCategory[] = [];
  const addCat = (c: any) => {
    const name = typeof c === "object" && c ? c.name || c.title : typeof c === "string" ? c : "";
    if (!name || typeof name !== "string") return;
    const slug = (typeof c === "object" && c?.slug) || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    if (!cats.some((x) => x.slug === slug)) cats.push({ name, slug });
  };
  if (Array.isArray(p.categories)) p.categories.forEach(addCat);
  if (cats.length === 0 && p.category) addCat(p.category);
  if (cats.length === 0 && p.badge) addCat(p.badge);

  let readTime = p.readTime as string;
  if (!readTime && typeof p.content === "string") {
    const words = p.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
    readTime = `${Math.max(1, Math.ceil(words / 200))} min read`;
  }

  return {
    id: String(p.id || p._id || idx),
    slug: String(p.slug || p.id || p._id || idx),
    title: p.title || "Untitled Article",
    image: p.image || p.featuredImage || p.coverImage || "",
    imageAlt: p.imageAlt || p.title || "",
    badge: p.badge || cats[0]?.name || "Article",
    categories: cats,
    date: p.date || formatDate(p.publishedAt || p.createdAt),
    readTime: readTime || ""
  };
}

// 1 ... 4 5 6 ... 11 - keeps the pager one row wide however many pages there are.
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const keep = new Set<number>([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => keep.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => keep.add(n));
  const sorted = [...keep].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("gap");
    out.push(n);
  });
  return out;
}

// A blank label means "no button". No saved object at all means "use the default" (fresh page).
function resolveButton(raw: any, defLabel: string, defHref: string) {
  if (!raw) return { label: defLabel, href: defHref };
  const label = String(raw.label ?? defLabel).trim();
  return { label, href: (typeof raw.href === "string" && raw.href.trim()) || defHref };
}

export default function BlogTemplate({
  pageData,
  posts: initialPosts
}: {
  pageData?: any;
  posts?: any[];
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [portraitOk, setPortraitOk] = useState(true);
  const articlesRef = useRef<HTMLElement>(null);

  // Extract blogPage data from CMS pageData or defaults
  const rawData = pageData?.content?.blogPage || pageData?.content || {};

  const hero = {
    // A cleared badge hides the pill; every other text field falls back to its default when blank.
    badgeText: rawData.hero?.badgeText ?? "EXPLORE OUR EDITORIAL // INSIGHTS & STRATEGY",
    titleLine1: rawData.hero?.titleLine1 || "Modern Engineering &",
    titleHighlight: rawData.hero?.titleHighlight || "Growth Insights",
    description: rawData.hero?.description || "Actionable blueprints, architectural deep-dives, and conversion rate science to build compounding market advantage.",
    heroBgImage: rawData.hero?.heroBgImage || rawData.hero?.backgroundImage || rawData.hero?.bgImage || "",
    ctaPrimary: resolveButton(rawData.hero?.ctaPrimary, "Explore Articles", "#articles"),
    ctaSecondary: resolveButton(rawData.hero?.ctaSecondary, "Schedule Strategy Call", "/contact-us")
  };

  const ctaBanner = {
    eyebrow: rawData.ctaBanner?.eyebrow ?? "READY TO ACCELERATE? ",
    titleIntro: rawData.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleHighlight: rawData.ctaBanner?.titleHighlight || "Competitive Edge",
    titleLine2: rawData.ctaBanner?.titleLine2 || "Together.",
    description: rawData.ctaBanner?.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: resolveButton(rawData.ctaBanner?.ctaPrimary, "Book Strategy Session", "/contact-us"),
    ctaSecondary: resolveButton(rawData.ctaBanner?.ctaSecondary, "Watch Showreel", "/gallery"),
    portraitSrc: rawData.ctaBanner?.portraitSrc || "",
    portraitAlt: rawData.ctaBanner?.portraitAlt || "Mohsin Designs Lead Architect"
  };

  const filterMode = rawData.filterMode || "all";
  const selectedBlogIds: string[] = Array.isArray(rawData.selectedBlogIds) ? rawData.selectedBlogIds : [];
  const postsPerPage = Number(rawData.postsPerPage) || 6;

  // Resolve raw source posts. No made-up demo articles: they linked to pages that do not exist.
  const rawPosts: any[] = useMemo((): any[] => {
    if (initialPosts && initialPosts.length > 0) return initialPosts;
    if (Array.isArray(pageData?.posts) && pageData.posts.length > 0) return pageData.posts;
    if (Array.isArray(rawData.blogPosts) && rawData.blogPosts.length > 0) return rawData.blogPosts;
    return [];
  }, [initialPosts, pageData?.posts, rawData.blogPosts]);

  const allFormattedPosts: Card[] = useMemo((): Card[] => rawPosts.map((p: any, i: number) => toCard(p, i)), [rawPosts]);

  // "Curate Selective Blogs" mode (falls back to all posts while nothing is picked yet)
  const activePosts: Card[] = useMemo((): Card[] => {
    if (filterMode === "selective" && selectedBlogIds.length > 0) {
      return allFormattedPosts.filter((p: Card) => selectedBlogIds.includes(p.id));
    }
    return allFormattedPosts;
  }, [allFormattedPosts, filterMode, selectedBlogIds]);

  // Category chips (only real categories that have at least one post)
  const categoryChips = useMemo((): { name: string; slug: string; count: number }[] => {
    const map = new Map<string, { name: string; slug: string; count: number }>();
    activePosts.forEach((p: Card) =>
      p.categories.forEach((c: CardCategory) => {
        const cur = map.get(c.slug);
        if (cur) cur.count += 1;
        else map.set(c.slug, { ...c, count: 1 });
      })
    );
    return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [activePosts]);

  const filteredPosts: Card[] = useMemo((): Card[] => {
    const q = query.trim().toLowerCase();
    return activePosts.filter((p: Card) => {
      if (activeCategory !== "all" && !p.categories.some((c: CardCategory) => c.slug === activeCategory)) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q) || p.categories.some((c: CardCategory) => c.name.toLowerCase().includes(q));
    });
  }, [activePosts, activeCategory, query]);

  const showToolbar = activePosts.length > 1 && (categoryChips.length > 1 || activePosts.length > postsPerPage);
  const isFiltering = activeCategory !== "all" || query.trim() !== "";

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPosts: Card[] = useMemo((): Card[] => {
    const start = (safePage - 1) * postsPerPage;
    return filteredPosts.slice(start, start + postsPerPage);
  }, [filteredPosts, safePage, postsPerPage]);

  const goToPage = (n: number) => {
    setCurrentPage(Math.min(Math.max(1, n), totalPages));
    // Bring the top of the grid back into view so the visitor does not land mid-page.
    articlesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const resetFilters = () => {
    setActiveCategory("all");
    setQuery("");
    setCurrentPage(1);
  };

  const content = useContent();

  const feedEnabled = rawData.feedEnabled !== false;
  const heroEnabled = rawData.hero?.enabled !== false;
  const ctaEnabled = rawData.ctaBanner?.enabled !== false;

  // ── FAQs ─────────────────────────────────────────────────────────────────────
  const isFilledFaq = (f: any) =>
    f && String(f.question ?? f.q ?? f.title ?? "").trim() && String(f.answer ?? f.a ?? f.description ?? "").trim();

  const pageFaqs = (
    Array.isArray(rawData.faqs)
      ? rawData.faqs
      : Array.isArray(pageData?.content?.faqs)
      ? pageData.content.faqs
      : Array.isArray(rawData.faq)
      ? rawData.faq
      : []
  ).filter(isFilledFaq);

  const faqTargets = [pageData?.slug, "blogs", "blog"].filter(Boolean);
  const globalFaqs = (Array.isArray(content?.faq?.items) ? content.faq.items : []).filter(
    (item: any) =>
      isFilledFaq(item) &&
      (item.visibility === "global" ||
        (item.visibility === "specific" && Array.isArray(item.targetPages) && item.targetPages.some((t: string) => faqTargets.includes(t))))
  );

  const faqItems = pageFaqs.length > 0 ? pageFaqs : (globalFaqs.length > 0 ? globalFaqs : (Array.isArray(content?.faq?.items) ? content.faq.items.filter(isFilledFaq) : []));

  const faqEnabled = rawData.faqs?.enabled !== false && rawData.faqSection?.enabled !== false && pageData?.content?.faqSection?.enabled !== false;

  const resolvedStrategyAudit = {
    badge: rawData.strategyAudit?.badge || pageData?.content?.strategyAudit?.badge || content?.faq?.strategyAudit?.badge || "FREE ARCHITECTURE AUDIT",
    title: rawData.strategyAudit?.title || pageData?.content?.strategyAudit?.title || content?.faq?.strategyAudit?.title || "Have a complex custom build in mind?",
    desc: rawData.strategyAudit?.desc || pageData?.content?.strategyAudit?.desc || content?.faq?.strategyAudit?.desc || "Book a 30-minute high-level technical strategy session with our lead engineer.",
    button: rawData.strategyAudit?.button || pageData?.content?.strategyAudit?.button || content?.faq?.strategyAudit?.button || "Book Architecture Call",
    href: rawData.strategyAudit?.href || pageData?.content?.strategyAudit?.href || content?.faq?.strategyAudit?.href || "/contact-us",
  };

  const faqData = {
    ...(pageData?.content || {}),
    ...(rawData || {}),
    strategyAudit: resolvedStrategyAudit,
  };

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-6">

      {/* Floating Blurred Mesh Blobs */}
      <div className="absolute top-[1%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* ── 1. HERO SECTION WITH FULL BLEED BACKGROUND ────────────────── */}
      {heroEnabled && (
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[230px] pb-10 md:pb-14 relative overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] flex items-center border-b border-brand-zinc-200 dark:border-white/10">
        {/* Full Background Graphic (decorative, so no alt text; removed if the file is missing) */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {hero.heroBgImage && (
            <SafeImg
              src={hero.heroBgImage}
              alt=""
              aria-hidden="true"
              className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#080710] dark:via-[#080710]/80 dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 md:py-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-2xl space-y-6 text-left"
          >
            <PageBreadcrumbs page={pageData} />
            {/* Brand Pill Badge */}
            {hero.badgeText.trim() && (
              <div className="inline-flex pointer-events-auto">
                <span className="eyebrow-pill select-none shadow-sm">
                  <Star className="h-3.5 w-3.5 fill-current text-current shrink-0" />
                  {hero.badgeText}
                </span>
              </div>
            )}

            {/* Headline */}
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.18] tracking-tight text-brand-dark dark:text-white">
              {hero.titleLine1} <br />
              <AccentHighlight className="text-brand-blue dark:text-brand-yellow pb-1">
                {hero.titleHighlight}
              </AccentHighlight>
            </h1>

            {/* Subtitle */}
            <RichTextRenderer
              content={hero.description}
              className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg"
            />

            {/* CTAs */}
            {(hero.ctaPrimary.label || hero.ctaSecondary.label) && (
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {hero.ctaPrimary.label && <CtaButton href={hero.ctaPrimary.href}>{hero.ctaPrimary.label}</CtaButton>}

                {hero.ctaSecondary.label && (
                  <CtaButton href={hero.ctaSecondary.href} variant="secondary">{hero.ctaSecondary.label}</CtaButton>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </section>
      )}

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-8 pb-4">

        {/* ── 2. MODERN EDITORIAL CARDS WITH LINK WRAPPER ─────────────── */}
        {feedEnabled && (
        <section id="articles" ref={articlesRef} aria-labelledby="articles-heading" className="section-gap scroll-mt-28">
          <h2 id="articles-heading" className="sr-only">Latest articles</h2>

          {/* Category filter + search (the editor promises "dynamic category filters and pagination") */}
          {showToolbar && (
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {categoryChips.length > 1 ? (
                <div role="group" aria-label="Filter articles by category" className="flex flex-wrap gap-2">
                  {[{ slug: "all", name: "All", count: activePosts.length }, ...categoryChips].map((c: { name: string; slug: string; count: number }) => {
                    const active = activeCategory === c.slug;
                    return (
                      <button
                        key={c.slug}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          setActiveCategory(c.slug);
                          setCurrentPage(1);
                        }}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue dark:focus-visible:outline-brand-yellow ${
                          active
                            ? "bg-brand-blue border-brand-blue text-white dark:bg-brand-yellow dark:border-brand-yellow dark:text-brand-dark"
                            : "bg-white dark:bg-[#12121e] border-brand-zinc-200 dark:border-white/10 text-brand-zinc-600 dark:text-zinc-300 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60"
                        }`}
                      >
                        {c.name}
                        <span className={`text-[10px] ${active ? "opacity-80" : "text-brand-zinc-500 dark:text-zinc-400"}`}>{c.count}</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span />
              )}

              <div className="relative w-full lg:w-72">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-zinc-500 dark:text-zinc-400" aria-hidden="true" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  aria-label="Search articles"
                  placeholder="Search articles..."
                  className="w-full rounded-full border border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#12121e] py-2.5 pl-11 pr-10 text-sm text-brand-dark dark:text-white placeholder:text-brand-zinc-500 dark:placeholder:text-zinc-400 outline-none focus:border-brand-blue dark:focus:border-brand-yellow"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-brand-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
          <p className="sr-only" role="status" aria-live="polite">
            {isFiltering ? `${filteredPosts.length} article${filteredPosts.length === 1 ? "" : "s"} found` : ""}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeCategory}-${safePage}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {paginatedPosts.map((post: Card) => (
                <Link
                  key={post.id}
                  href={`/blogs/${post.slug}`}
                  className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group relative block cursor-pointer"
                >
                  <div>
                    {/* Full-Bleed Cover Image Banner - aspect-ratio matches the generated
                        1200x627 cover graphics exactly, so their baked-in titles never get
                        cropped by a mismatched fixed-height box (was h-64/h-72 + object-cover,
                        which sliced the left edge off every title). */}
                    <div className="relative aspect-[1200/627] w-full overflow-hidden bg-brand-light dark:bg-zinc-950 border-b border-brand-zinc-200/80 dark:border-white/10">
                      {post.image ? (
                        <SafeImg
                          src={post.image}
                          alt={post.imageAlt || post.title}
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        /* No cover image saved: neutral branded tile instead of a random stock photo */
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-blue/[0.03] dark:from-brand-yellow/10 dark:to-transparent">
                          <BookOpen className="h-10 w-10 text-brand-blue/40 dark:text-brand-yellow/40" aria-hidden="true" />
                        </div>
                      )}

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
                    <span className="text-brand-zinc-500 dark:text-zinc-400 font-medium">
                      {post.date}
                    </span>

                    {post.readTime && (
                      <span className="font-mono font-bold text-brand-blue dark:text-brand-yellow flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readTime}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {paginatedPosts.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-[28px] border border-dashed border-brand-zinc-300 dark:border-white/10">
              <BookOpen className="w-10 h-10 text-brand-zinc-400 mx-auto mb-3" />
              <p className="text-lg font-bold text-brand-dark dark:text-white">
                {isFiltering ? "No matching articles" : "No articles published yet"}
              </p>
              <p className="text-sm text-brand-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">
                {isFiltering
                  ? "Try a different category or search term."
                  : "Check back soon for new insights."}
              </p>
              {isFiltering && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-5 rounded-full border border-brand-blue dark:border-brand-yellow px-5 py-2 text-xs font-mono font-black uppercase tracking-wider text-brand-blue dark:text-brand-yellow hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/10 cursor-pointer"
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </section>
        )}

        {/* ── 4. SLEEK FLOATING GLASSMORPHIC PAGINATION CAPSULE ───────── */}
        {(totalPages > 1 && feedEnabled) && (
          <nav aria-label="Blog pagination" className="flex items-center justify-center section-gap">
            <div className="bg-white/90 dark:bg-[#12121e]/90 backdrop-blur-2xl border border-brand-zinc-200/90 dark:border-white/10 shadow-[0_10px_35px_rgba(3,6,172,0.08)] dark:shadow-[0_10px_35px_rgba(0,0,0,0.4)] p-2 rounded-full flex items-center gap-1 sm:gap-2 max-w-full">
              <button
                type="button"
                disabled={safePage === 1}
                onClick={() => goToPage(safePage - 1)}
                aria-label="Previous page"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase text-brand-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 border-x border-brand-zinc-200/80 dark:border-white/10">
                {pageWindow(safePage, totalPages).map((num, i) =>
                  num === "gap" ? (
                    <span key={`gap-${i}`} aria-hidden="true" className="w-5 text-center text-xs text-brand-zinc-500 dark:text-zinc-400">…</span>
                  ) : (
                    <button
                      type="button"
                      key={num}
                      onClick={() => goToPage(num)}
                      aria-label={`Page ${num}`}
                      aria-current={safePage === num ? "page" : undefined}
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full text-xs font-mono font-black flex items-center justify-center transition-all cursor-pointer ${
                        safePage === num
                          ? "bg-brand-blue text-white shadow-md shadow-brand-blue/30 dark:bg-brand-yellow dark:text-brand-dark"
                          : "text-brand-zinc-600 dark:text-zinc-400 hover:bg-brand-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {num}
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                disabled={safePage === totalPages}
                onClick={() => goToPage(safePage + 1)}
                aria-label="Next page"
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-black tracking-wider uppercase text-brand-zinc-600 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span> <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </nav>
        )}

        {/* ── 4.5. FAQS & STICKY STRATEGY AUDIT CTA ──────────────────── */}
        {faqEnabled && (
          <div className="section-gap">
            <PageInlineFaqs
              faqs={faqItems.length > 0 ? faqItems : undefined}
              faqSchemaMarkup={rawData.faqSchemaMarkup || pageData?.content?.faqSchemaMarkup}
              badge={rawData.faqBadge || pageData?.content?.faqBadge}
              title={rawData.faqTitleHighlight || rawData.faqTitle || pageData?.content?.faqTitleHighlight || pageData?.content?.faqTitle}
              titleIntro={rawData.faqTitleIntro !== undefined ? rawData.faqTitleIntro : pageData?.content?.faqTitleIntro}
              description={rawData.faqDescription || pageData?.content?.faqDescription}
              data={faqData}
            />
          </div>
        )}

        {/* ── 5. HIGH-CONVERSION AGENCY CTA BANNER ────────────────────── */}
        {ctaEnabled && (
        <section id="contact" className="relative overflow-hidden section-gap">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[62%]">
              {/* Eyebrow Pill */}
              {ctaBanner.eyebrow.trim() && (
                <div className="eyebrow-pill-yellow">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-accent)] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-accent)]" />
                  </span>
                  {ctaBanner.eyebrow}
                </div>
              )}

              {/* Headline */}
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                {ctaBanner.titleIntro} <br className="hidden sm:block" />
                <span className="inline-block">
                  {ctaBanner.titleLine2}{" "}
                  <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {ctaBanner.titleHighlight}
                  </AccentHighlight>
                </span>
              </h2>

              {/* Description */}
              <RichTextRenderer
                content={ctaBanner.description}
                className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
              />

              {/* CTAs */}
              {(ctaBanner.ctaPrimary.label || ctaBanner.ctaSecondary.label) && (
                <div className="flex items-center gap-4 flex-wrap pt-2">
                  {ctaBanner.ctaPrimary.label && <CtaButton href={ctaBanner.ctaPrimary.href}>{ctaBanner.ctaPrimary.label}</CtaButton>}

                  {ctaBanner.ctaSecondary.label && (
                    <CtaButton href={ctaBanner.ctaSecondary.href} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{ctaBanner.ctaSecondary.label}</CtaButton>
                  )}
                </div>
              )}
            </div>

            {/* Right Side Portrait & Arch Graphic (dropped entirely if the saved image is missing) */}
            {ctaBanner.portraitSrc && portraitOk && (
            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <SafeImg
                  src={ctaBanner.portraitSrc}
                  alt={ctaBanner.portraitAlt}
                  width={320}
                  height={420}
                  loading="lazy"
                  onFail={() => setPortraitOk(false)}
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
            </div>
            )}
          </div>
        </section>
        )}

      </div>
    </div>
  );
}
