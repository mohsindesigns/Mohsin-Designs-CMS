import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/ui/Link";
import {
  Calendar,
  Clock,
  BookOpen,
  MapPin,
  Tag as TagIcon,
  Star
} from "lucide-react";

import connectToDatabase from "@/lib/mongodb";
import Page from "@/models/Page";
import ReadingProgress from "@/components/blogs/ReadingProgress";
import ShareButton from "@/components/blogs/ShareButton";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { BASE_URL } from "@/lib/constants";
import { makeLinksDoFollow } from "@/lib/utils";
import { resolveRobotsMetadata } from "@/lib/seo";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import { getResolvedSchemaBlocks } from "@/lib/dynamicSchema";
import { getCachedSiteContent } from "@/lib/content";
import {
  absoluteUrl,
  addHeadingAnchors,
  formatPostDate,
  getRelatedCards,
  normalizeCanonicalUrl,
  postDateIso,
  readMinutes,
  resolvePost,
  safeDate,
  sanitizePostHtml,
  stripHtml,
  truncate,
  wordCount
} from "@/lib/blog-public";

// The ONE article route (/blog/:slug is redirected here by next.config; src/app/blog/[slug] re-exports this file).
export const revalidate = 60; // Revalidate every 60s

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [{ post, preview }, contentData] = await Promise.all([
    resolvePost(slug),
    getCachedSiteContent()
  ]);

  if (!post) return { title: "Article Not Found | Mohsin Designs", robots: { index: false, follow: false } };

  const isGlobalNoIndex = !!contentData?.settings?.globalNoIndex;
  const pageTitle = post.seo?.metaTitle || `${post.title} | Mohsin Designs`;
  const pageDesc =
    post.seo?.metaDescription ||
    post.excerpt ||
    truncate(stripHtml(post.content), 160) ||
    `${post.title} - Strategic insights and architectural blueprints from Mohsin Designs.`;
  const pageImage = absoluteUrl(post.seo?.ogImage || post.seo?.featuredImage || post.featuredImage);
  const twitterImage = absoluteUrl(post.seo?.twitterImage) || pageImage;
  const canonicalUrl = normalizeCanonicalUrl(post.seo?.canonicalUrl, `${BASE_URL}/blogs/${post.slug}/`, post.slug);

  const publishedIso = postDateIso(post);
  const modifiedIso = safeDate(post.updatedAt)?.toISOString() || publishedIso;

  return {
    title: {
      absolute: pageTitle
    },
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl
    },
    // A draft/scheduled post opened by a signed-in admin is never indexable.
    robots: preview ? { index: false, follow: false } : resolveRobotsMetadata(post.seo, isGlobalNoIndex),
    openGraph: {
      title: post.seo?.ogTitle || pageTitle,
      description: post.seo?.ogDescription || pageDesc,
      url: canonicalUrl,
      siteName: "Mohsin Designs",
      type: "article",
      ...(publishedIso ? { publishedTime: publishedIso } : {}),
      ...(modifiedIso ? { modifiedTime: modifiedIso } : {}),
      images: pageImage
        ? [
            {
              url: pageImage,
              width: 1200,
              height: 630,
              alt: post.seo?.featuredImageAlt || post.title
            }
          ]
        : undefined
    },
    twitter: {
      card: post.seo?.twitterCard || "summary_large_image",
      title: post.seo?.twitterTitle || post.seo?.ogTitle || pageTitle,
      description: post.seo?.twitterDescription || post.seo?.ogDescription || pageDesc,
      images: twitterImage ? [twitterImage] : undefined
    },
    other: {
      ...(publishedIso ? { "article:published_time": publishedIso, "publish-date": publishedIso, "date": publishedIso } : {}),
      ...(modifiedIso ? { "article:modified_time": modifiedIso } : {}),
    }
  };
}

const BLOG_PAGE_SLUGS = ["blogs", "/blogs", "blog", "/blog"];

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();

  // 1. Fetch Post (published only; signed-in admins may also preview drafts/scheduled) + page settings
  const [{ post, preview }, globalContentData, blogPageDoc] = await Promise.all([
    resolvePost(slug),
    getCachedSiteContent(),
    // The CMS Blog page holds the "Detail Page" settings. Ignore trashed pages / unrelated look-alikes.
    Page.findOne({
      isTrashed: { $ne: true },
      $or: [{ slug: { $in: BLOG_PAGE_SLUGS } }, { template: { $in: ["blog", "blogs"] } }]
    }).lean()
  ]);

  if (!post) notFound();

  const blogPageData = (blogPageDoc as any)?.content?.blogPage || (blogPageDoc as any)?.content || {};

  // Detail Page CTAs Visibility (controlled from Blog Editor > Detail Page tab)
  const detailCtaEnabled = blogPageData.detailCtaBanner?.enabled !== false;

  // Resolve Sidebar Consultation CTA
  const sidebarCta = {
    badge: blogPageData.detailSidebarCta?.badge || "EXPERT CONSULTATION",
    title: blogPageData.detailSidebarCta?.title || "Scale Your Organic Revenue Today",
    description: blogPageData.detailSidebarCta?.description || "Get a custom local SEO and web architecture strategy tailored for your business.",
    buttonText: blogPageData.detailSidebarCta?.buttonText || "GET FREE ESTIMATE",
    buttonHref: blogPageData.detailSidebarCta?.buttonHref || "/#contact"
  };

  // Resolve the bottom CTA banner. The editor has a dedicated "Detail Page Bottom Signature CTA
  // Banner" (detailCtaBanner) - it used to be ignored in favour of the INDEX banner (ctaBanner), so
  // editing it did nothing. Now: detail banner field -> index banner field -> default.
  const dCta = blogPageData.detailCtaBanner || {};
  const iCta = blogPageData.ctaBanner || {};
  const detailCtaBanner = {
    eyebrow: dCta.eyebrow || iCta.eyebrow || "READY TO ACCELERATE? ",
    titleIntro: dCta.titleIntro || iCta.titleIntro || "Let's Build Your Next",
    titleHighlight: dCta.titleHighlight || iCta.titleHighlight || "Competitive Edge",
    titleLine2: dCta.titleLine2 || iCta.titleLine2 || "Together.",
    description: dCta.description || iCta.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: dCta.ctaPrimary?.label || iCta.ctaPrimary?.label || "Book Strategy Session",
      href: dCta.ctaPrimary?.href || iCta.ctaPrimary?.href || "/contact-us"
    },
    ctaSecondary: {
      label: dCta.ctaSecondary?.label || iCta.ctaSecondary?.label || "Watch Showreel",
      href: dCta.ctaSecondary?.href || iCta.ctaSecondary?.href || "/gallery"
    },
    portraitSrc: dCta.portraitSrc || iCta.portraitSrc || "",
    portraitAlt: dCta.portraitAlt || iCta.portraitAlt || "Mohsin Designs Lead Architect"
  };

  // Resolve Related Section Header
  const relatedSection = {
    eyebrow: blogPageData.relatedSection?.eyebrow || "EXPLORE MORE INSIGHTS",
    title: blogPageData.relatedSection?.title || "Related Articles & Guides"
  };

  // Author box (Blog Editor > Detail Page tab). Deliberately NOT the CMS login username: the old code
  // tried to read a name off an un-populated author id, so it always showed the hardcoded fallback.
  const authorSource = blogPageData.authorBox || {};
  const authorEnabled = authorSource.enabled !== false;
  const authorInfo = {
    label: authorSource.label || "Article Strategist",
    name: String(authorSource.name || "Mohsin"),
    role: String(authorSource.role ?? "Founder & Creative Director"),
    avatar: typeof authorSource.avatar === "string" ? authorSource.avatar.trim() : ""
  };

  // 2. Related articles (same category/tag first, then newest)
  const relatedPosts = await getRelatedCards(post, 3);

  // 3. Post metadata
  const categories: { name: string }[] = (Array.isArray(post.categories) ? post.categories : []).filter((c: any) => c?.name);
  const categoryBadge = categories[0]?.name || "Article";
  const tags: { name: string }[] = (Array.isArray(post.tags) ? post.tags : []).filter((t: any) => t?.name);

  const publishedIso = postDateIso(post);
  const modifiedIso = safeDate(post.updatedAt)?.toISOString() || publishedIso;
  const formattedDate = formatPostDate(post.publishedAt || post.createdAt);

  // 4. Sanitise FIRST (real DOMPurify), then derive the table of contents from the clean HTML.
  const rawHtmlContent = post.content || `<p>${stripHtml(post.excerpt || post.title)}</p>`;
  const cleanHtml = sanitizePostHtml(rawHtmlContent);
  const words = wordCount(cleanHtml);
  const readTimeDisplay = `${readMinutes(cleanHtml)} min read`;
  const featuredImage: string = post.featuredImage || "";
  const featuredAlt: string = post.seo?.featuredImageAlt || post.title;

  const { html: anchoredHtml, toc: tableOfContents } = addHeadingAnchors(cleanHtml);
  const processedContent = makeLinksDoFollow(anchoredHtml);

  // 5. Custom schema. Auto-generated schema is intentionally not injected site-wide (see lib/dynamicSchema);
  // only what the editor entered in the post's Schema tab (seo.schemaData) + the synced FAQ schema is
  // rendered, with {{tokens}} resolved and the FAQ block de-duplicated.
  const schemaBlocks = getResolvedSchemaBlocks({
    page: {
      title: post.title,
      slug: `blogs/${post.slug}`,
      template: "blog",
      content: {},
      seo: post.seo || {},
      schemaMarkup: post.schemaMarkup,
      faqSchemaMarkup: post.faqSchemaMarkup
    },
    globalData: globalContentData || {},
    slug: `blogs/${post.slug}`
  });

  // Resolve FAQs (Post-specific first, falling back to Blog Page FAQs, then Global FAQs)
  const isFilledFaq = (f: any) =>
    f && typeof (f.question ?? f.q ?? f.title) === "string" && (f.question ?? f.q ?? f.title).trim() &&
    typeof (f.answer ?? f.a ?? f.description) === "string" && (f.answer ?? f.a ?? f.description).trim();

  const postFaqs = (Array.isArray(post.faq) ? post.faq : []).filter(isFilledFaq);
  const blogPageFaqs = (
    Array.isArray(blogPageData?.faqs)
      ? blogPageData.faqs
      : Array.isArray((blogPageDoc as any)?.content?.faqs)
      ? (blogPageDoc as any).content.faqs
      : Array.isArray(blogPageData?.faq)
      ? blogPageData.faq
      : []
  ).filter(isFilledFaq);
  const globalFaqs = (Array.isArray(globalContentData?.faq?.items) ? globalContentData.faq.items : []).filter(isFilledFaq);

  const visibleFaqs = postFaqs.length > 0 ? postFaqs : (blogPageFaqs.length > 0 ? blogPageFaqs : globalFaqs);

  // Strategy audit box resolution (Post -> Blog Editor / Page Doc -> Global)
  const resolvedStrategyAudit = {
    badge: (post as any)?.strategyAudit?.badge || blogPageData?.strategyAudit?.badge || (blogPageDoc as any)?.content?.strategyAudit?.badge || globalContentData?.faq?.strategyAudit?.badge || "FREE ARCHITECTURE AUDIT",
    title: (post as any)?.strategyAudit?.title || blogPageData?.strategyAudit?.title || (blogPageDoc as any)?.content?.strategyAudit?.title || globalContentData?.faq?.strategyAudit?.title || "Have a complex custom build in mind?",
    desc: (post as any)?.strategyAudit?.desc || blogPageData?.strategyAudit?.desc || (blogPageDoc as any)?.content?.strategyAudit?.desc || globalContentData?.faq?.strategyAudit?.desc || "Book a 30-minute high-level technical strategy session with our lead engineer.",
    button: (post as any)?.strategyAudit?.button || blogPageData?.strategyAudit?.button || (blogPageDoc as any)?.content?.strategyAudit?.button || globalContentData?.faq?.strategyAudit?.button || "Book Architecture Call",
    href: (post as any)?.strategyAudit?.href || blogPageData?.strategyAudit?.href || (blogPageDoc as any)?.content?.strategyAudit?.href || globalContentData?.faq?.strategyAudit?.href || "/contact-us",
  };

  const faqData = {
    ...((blogPageDoc as any)?.content || {}),
    ...(blogPageData || {}),
    strategyAudit: resolvedStrategyAudit,
  };

  const hasPostFaqs = postFaqs.length > 0;
  const faqBadge = hasPostFaqs ? (post.faqBadge || "ARTICLE FAQ") : (blogPageData?.faqBadge || (blogPageDoc as any)?.content?.faqBadge || "FREQUENTLY ASKED QUESTIONS");
  const faqTitle = hasPostFaqs ? (post.faqTitle || "Frequently Asked Questions") : (blogPageData?.faqTitleHighlight || blogPageData?.faqTitle || (blogPageDoc as any)?.content?.faqTitleHighlight || (blogPageDoc as any)?.content?.faqTitle || "Frequently Asked Questions");
  const faqTitleIntro = hasPostFaqs ? "" : (blogPageData?.faqTitleIntro !== undefined ? blogPageData.faqTitleIntro : (blogPageDoc as any)?.content?.faqTitleIntro);
  const faqDescription = hasPostFaqs ? (post.faqDescription || "Key insights and technical queries answered.") : (blogPageData?.faqDescription || (blogPageDoc as any)?.content?.faqDescription || "Key insights and technical queries answered.");
  const faqSchema = hasPostFaqs ? post.faqSchemaMarkup : (blogPageData?.faqSchemaMarkup || (blogPageDoc as any)?.content?.faqSchemaMarkup);

  return (
    <article className="min-h-screen bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 pb-24 relative overflow-x-clip font-sans">
      <CustomSchemaMarkup schema={schemaBlocks} />
      <ReadingProgress />

      {preview && (
        <div
          role="status"
          className="fixed bottom-4 left-4 z-[110] max-w-[calc(100vw-2rem)] rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg"
        >
          Preview only - this post is a {post.status} and is not visible to the public yet.
        </div>
      )}

      {/* ── 1. HERO SECTION WITH FULL BLEED BACKGROUND ────────────────── */}
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[180px] sm:pt-[210px] lg:pt-[280px] pb-12 sm:pb-16 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10">
        {/* Background Graphic Bleed */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          {/* Solid white/dark background mask layer to prevent bleed-through */}
          <div
            className="absolute inset-0 bg-white dark:bg-[#080710]"
            style={{
              maskImage: "linear-gradient(to right, white 55%, transparent 90%)",
              WebkitMaskImage: "linear-gradient(to right, white 55%, transparent 90%)"
            }}
          />
          {/* Additional gradient layer */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-transparent dark:from-[#080710] dark:via-[#080710]/95 dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6 relative z-10 w-full">
          {/* Breadcrumb Row */}
          <PageBreadcrumbs
            className="mb-5"
            items={[
              { name: "Home", url: "/" },
              { name: "Blogs", url: "/blogs/" },
              { name: post.seo?.breadcrumbTitle || post.title, url: `/blogs/${post.slug}/` },
            ]}
          />

          {/* Title */}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white leading-[1.18] tracking-tight mb-6 max-w-3xl drop-shadow-sm">
            {post.title}
          </h1>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-brand-blue text-white shadow-md">
              <Star className="w-3 h-3 fill-current" />
              {categoryBadge}
            </span>

            {formattedDate && (
              <span className="inline-flex items-center gap-1.5 text-brand-zinc-500 dark:text-zinc-400 font-medium">
                <Calendar className="w-3.5 h-3.5 text-brand-blue dark:text-brand-yellow" />
                <time dateTime={publishedIso}>{formattedDate}</time>
              </span>
            )}

            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-brand-blue dark:text-brand-yellow">
              <Clock className="w-3.5 h-3.5" />
              {readTimeDisplay}
            </span>

            {post.location && String(post.location).trim() && (
              <span className="inline-flex items-center gap-1.5 text-brand-zinc-500 dark:text-zinc-400 font-medium">
                <MapPin className="w-3.5 h-3.5 text-brand-blue dark:text-brand-yellow" />
                {String(post.location).trim()}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED COVER IMAGE CONTAINER ────────────────────────── */}
      {featuredImage && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 sm:mt-10 relative z-20">
          <div className="bg-white dark:bg-[#12121e] rounded-[28px] overflow-hidden shadow-xl border border-brand-zinc-200/90 dark:border-white/10 aspect-[1200/627] relative group">
            <img
              src={featuredImage}
              alt={featuredAlt}
              width={1200}
              height={627}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      )}

      {/* ── 3. MAIN CONTENT LAYOUT WITH STICKY SIDEBAR ────────────────── */}
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left: Blog Content */}
          <div className="lg:w-[65%] min-w-0 w-full">

            {/* Author Attribution Card */}
            {authorEnabled && (
              <div className="flex flex-col min-[400px]:flex-row items-center gap-5 mb-12 p-6 min-[400px]:p-8 bg-brand-zinc-50 dark:bg-zinc-900/60 border border-brand-zinc-200 dark:border-white/10 rounded-2xl min-[400px]:rounded-3xl">
                {authorInfo.avatar && (
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-brand-blue dark:border-brand-yellow">
                      <img
                        src={authorInfo.avatar}
                        alt={authorInfo.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>
                )}
                <div>
                  {authorInfo.label && (
                    <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-brand-blue dark:text-brand-yellow mb-1 block">
                      {authorInfo.label}
                    </span>
                  )}
                  <p className="text-xl font-bold text-brand-dark dark:text-white leading-tight">
                    {authorInfo.name}
                  </p>
                  {authorInfo.role && (
                    <p className="text-brand-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 font-medium">
                      {authorInfo.role}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Main Content Body (sanitised above with DOMPurify) */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none
              prose-headings:font-heading prose-headings:font-black prose-headings:text-brand-dark dark:prose-headings:text-white
              prose-p:text-brand-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg
              prose-a:text-brand-blue dark:prose-a:text-brand-yellow prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl md:prose-img:rounded-3xl prose-img:my-8 prose-img:shadow-xl
              prose-blockquote:border-l-4 prose-blockquote:border-brand-blue dark:prose-blockquote:border-brand-yellow prose-blockquote:bg-brand-zinc-50 dark:prose-blockquote:bg-zinc-900/60 prose-blockquote:p-6 md:prose-blockquote:p-8 prose-blockquote:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* Tags (saved in the post editor; there are no tag archive pages, so these are labels) */}
            {tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-brand-zinc-200 dark:border-white/10 flex flex-wrap items-center gap-2">
                <TagIcon className="w-4 h-4 text-brand-blue dark:text-brand-yellow shrink-0" aria-hidden="true" />
                <span className="sr-only">Tags:</span>
                {tags.map((t, i) => (
                  <span
                    key={`${t.name}-${i}`}
                    className="px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-brand-zinc-50 dark:bg-zinc-900/60 border border-brand-zinc-200 dark:border-white/10 text-brand-zinc-600 dark:text-zinc-300"
                  >
                    {t.name}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Right: Sticky Table of Contents (Sidebar) */}
          <aside className="lg:w-[35%] shrink-0 lg:sticky lg:top-28 w-full">
            <div className="space-y-6 md:space-y-8">

              {/* Table of Contents Box */}
              <div className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[28px] p-6 sm:p-8 shadow-xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-zinc-200/80 dark:border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                  </div>
                  <div>
                    <h2 className="text-xs font-mono font-black uppercase tracking-widest text-brand-dark dark:text-white">
                      Navigation
                    </h2>
                    <p className="text-[9px] text-brand-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                      Quick Select
                    </p>
                  </div>
                </div>

                {/* Table of Contents Links */}
                {tableOfContents.length > 0 ? (
                  <nav aria-label="Table of contents" className="space-y-1.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {tableOfContents.map((item, idx) => (
                      <a
                        key={`${item.id}-${idx}`}
                        href={`#${item.id}`}
                        className={`flex items-center gap-3.5 py-2 px-3 rounded-xl transition-all duration-300 group ${
                          item.level <= 2
                            ? "text-brand-dark dark:text-white font-bold hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/10 hover:text-brand-blue dark:hover:text-brand-yellow bg-brand-zinc-50/50 dark:bg-zinc-900/40"
                            : "pl-7 text-brand-zinc-500 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow hover:bg-brand-zinc-50 dark:hover:bg-zinc-900/40"
                        }`}
                      >
                        <div
                          className={`shrink-0 w-2 h-2 rounded-full transition-all duration-300 ${
                            item.level <= 2
                              ? "bg-brand-blue dark:bg-brand-yellow scale-100 shadow-[0_0_8px_rgba(3,6,172,0.4)] dark:shadow-[0_0_8px_rgba(233,189,54,0.4)]"
                              : "bg-brand-zinc-300 dark:bg-zinc-700 scale-75 group-hover:bg-brand-blue dark:group-hover:bg-brand-yellow group-hover:scale-100"
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-semibold line-clamp-1 flex-1">
                          {item.text}
                        </span>
                      </a>
                    ))}
                  </nav>
                ) : (
                  <p className="text-xs text-brand-zinc-400">
                    This article has no sections to jump to.
                  </p>
                )}

                {/* Article Impact / Quick Stats */}
                <div className="mt-6 pt-6 border-t border-brand-zinc-200/80 dark:border-white/10">
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-zinc-400 mb-3">
                    Article Impact
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-brand-zinc-50 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-brand-zinc-200/80 dark:border-white/5 text-left">
                      <p className="text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">Words</p>
                      <p className="text-lg font-mono font-black text-brand-dark dark:text-white mt-0.5">{words.toLocaleString("en-US")}</p>
                    </div>
                    <div className="bg-brand-zinc-50 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-brand-zinc-200/80 dark:border-white/5 text-left">
                      <p className="text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">Read Time</p>
                      <p className="text-lg font-mono font-black text-brand-dark dark:text-white mt-0.5">{readTimeDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* Engage */}
                <div className="mt-6 pt-6 border-t border-brand-zinc-200/80 dark:border-white/10">
                  <p className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-zinc-400 mb-3">
                    Engage
                  </p>
                  <ShareButton title={post.title} />
                </div>
              </div>

              {/* Sidebar Agency CTA Box */}
              {detailCtaEnabled && (
              <div className="bg-gradient-to-br from-[#0306AC] via-[#020485] to-[#010356] dark:from-[#12121e] dark:via-[#161628] dark:to-[#0d0c18] border border-white/10 dark:border-white/10 rounded-[2rem] p-7 text-white relative overflow-hidden group shadow-2xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/15 dark:bg-brand-yellow/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-yellow/25 transition-colors duration-700 pointer-events-none" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-mono font-black uppercase bg-white/10 dark:bg-brand-yellow/15 text-brand-yellow border border-white/20 dark:border-brand-yellow/30">
                  <Star className="w-3 h-3 fill-current" /> {sidebarCta.badge}
                </span>
                <h2 className="font-heading text-2xl font-black text-white leading-tight">
                  {sidebarCta.title}
                </h2>
                <RichTextRenderer
                  content={sidebarCta.description}
                  className="text-white/80 dark:text-zinc-300 text-xs leading-relaxed font-sans font-normal"
                />
                <CtaButton href={sidebarCta.buttonHref} fullWidth className="mt-2">{sidebarCta.buttonText}</CtaButton>
              </div>
              )}

            </div>
          </aside>

        </div>
      </div>

      {/* Inline FAQs attached to this post or blog page fallback */}
      {visibleFaqs.length > 0 && (
        <div className="mt-16 pt-8 border-t border-brand-zinc-200 dark:border-white/10">
          <PageInlineFaqs
            faqs={visibleFaqs}
            faqSchemaMarkup={faqSchema}
            badge={faqBadge}
            title={faqTitle}
            titleIntro={faqTitleIntro}
            description={faqDescription}
            data={faqData}
          />
        </div>
      )}

      {/* ── 4. RELATED ARTICLES SECTION ───────────────────────────── */}
      {relatedPosts.length > 0 && (
        <section className="container mx-auto px-4 my-20 pt-12 border-t border-brand-zinc-200 dark:border-white/10 max-w-6xl">
          <div className="text-left mb-8 space-y-2">
            <span className="text-xs font-mono font-black uppercase text-brand-blue dark:text-brand-yellow tracking-widest">
              {relatedSection.eyebrow}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white">
              {relatedSection.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedPosts.map((rPost) => (
              <Link
                key={rPost.id}
                href={`/blogs/${rPost.slug}`}
                className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group select-none relative block cursor-pointer"
              >
                <div>
                  <div className="relative aspect-[1200/627] w-full overflow-hidden bg-brand-light dark:bg-zinc-950 border-b border-brand-zinc-200/80 dark:border-white/10">
                    {rPost.image ? (
                      <img
                        src={rPost.image}
                        alt={rPost.imageAlt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-blue/[0.03] dark:from-brand-yellow/10 dark:to-transparent">
                        <BookOpen className="w-10 h-10 text-brand-blue/40 dark:text-brand-yellow/40" aria-hidden="true" />
                      </div>
                    )}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-mono font-black uppercase tracking-wider bg-brand-blue text-white shadow-md">
                      <Star className="w-3 h-3 fill-current" />
                      {rPost.badge}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-heading text-lg font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors leading-snug">
                      {rPost.title}
                    </h3>
                  </div>
                </div>

                <div className="px-6 pb-6 flex items-center justify-between text-xs font-sans">
                  <span className="text-brand-zinc-500 dark:text-zinc-400 font-medium">
                    {rPost.date}
                  </span>
                  <span className="font-mono font-bold text-brand-blue dark:text-brand-yellow flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {rPost.readTime}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. SIGNATURE AGENCY CTA BANNER ─────────────────────────── */}
      {detailCtaEnabled && (
      <section id="contact" className="container mx-auto px-4 my-8 relative overflow-hidden max-w-6xl">
        <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
          <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[62%]">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
              </span>
              {detailCtaBanner.eyebrow}
            </div>

            {/* Headline */}
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
              {detailCtaBanner.titleIntro} <br className="hidden sm:block" />
              <span className="inline-block">
                {detailCtaBanner.titleLine2}{" "}
                <AccentHighlight className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                  {detailCtaBanner.titleHighlight}
                </AccentHighlight>
              </span>
            </h2>

            {/* Description */}
            <RichTextRenderer
              content={detailCtaBanner.description}
              className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
            />

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <CtaButton href={detailCtaBanner.ctaPrimary.href}>{detailCtaBanner.ctaPrimary.label}</CtaButton>

              <CtaButton href={detailCtaBanner.ctaSecondary.href} variant="secondary">{detailCtaBanner.ctaSecondary.label}</CtaButton>
            </div>
          </div>

          {/* Right Side Portrait & Arch Graphic */}
          {detailCtaBanner.portraitSrc && (
          <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
            <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
            <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
              <img
                src={detailCtaBanner.portraitSrc}
                alt={detailCtaBanner.portraitAlt}
                loading="lazy"
                className="w-full h-full object-cover object-top filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
          </div>
          )}
        </div>
      </section>
      )}
    </article>
  );
}
