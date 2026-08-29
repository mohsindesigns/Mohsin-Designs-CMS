import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  Calendar,
  User,
  Tag as TagIcon,
  Clock,
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Share2,
  CheckCircle2,
  ChevronLeft,
  Star
} from "lucide-react";

import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import Page from "@/models/Page";
import SiteContent from "@/models/Content";
import ReadingProgress from "@/components/blog/ReadingProgress";
import ShareButton from "@/components/blog/ShareButton";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import { BASE_URL } from "@/lib/constants";
import { makeLinksDoFollow } from "@/lib/utils";
import { resolveRobotsMetadata } from "@/lib/seo";

export const revalidate = 60; // Revalidate every 60s

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();

  const [post, contentDoc] = await Promise.all([
    Post.findOne({
      $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
      status: "published"
    }).populate("categories"),
    SiteContent.findOne({ key: 'complete_data' }).lean() as any
  ]);

  if (!post) return { title: "Article Not Found | Mohsin Designs" };

  const isGlobalNoIndex = !!contentDoc?.data?.settings?.globalNoIndex;
  const pageTitle = post.seo?.metaTitle || `${post.title} | Mohsin Designs`;
  const pageDesc = post.seo?.metaDescription || post.excerpt || `${post.title} - Strategic insights and architectural blueprints from Mohsin Designs.`;
  const pageImage = post.seo?.ogImage || post.featuredImage || "/portfolio_hero_bg.png";
  const canonicalUrl = post.seo?.canonicalUrl || `${BASE_URL}/blog/${post.slug}`;

  return {
    title: {
      absolute: pageTitle
    },
    description: pageDesc,
    alternates: {
      canonical: canonicalUrl
    },
    robots: resolveRobotsMetadata(post.seo, isGlobalNoIndex),
    openGraph: {
      title: post.seo?.ogTitle || pageTitle,
      description: post.seo?.ogDescription || pageDesc,
      url: `${BASE_URL}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.publishedAt?.toISOString?.() || post.createdAt?.toISOString?.(),
      modifiedTime: (post.updatedAt || post.publishedAt)?.toISOString?.(),
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo?.ogTitle || pageTitle,
      description: post.seo?.ogDescription || pageDesc,
      images: [pageImage]
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();

  // 1. Fetch Post from MongoDB
  const post = await Post.findOne({
    $or: [{ slug }, { _id: slug.match(/^[0-9a-fA-F]{24}$/) ? slug : null }],
    status: "published"
  })
    .populate("categories tags")
    .lean();

  if (!post) notFound();

  // 2. Fetch Blog Page Settings for CMS-managed CTAs and Global Defaults
  const blogPageDoc = await Page.findOne({
    $or: [{ slug: "blog" }, { template: "blog" }]
  }).lean();

  const blogPageData = (blogPageDoc as any)?.content?.blogPage || (blogPageDoc as any)?.content || {};

  // Resolve Sidebar Consultation CTA
  const sidebarCta = {
    badge: blogPageData.detailSidebarCta?.badge || "EXPERT CONSULTATION",
    title: blogPageData.detailSidebarCta?.title || "Scale Your Organic Revenue Today",
    description: blogPageData.detailSidebarCta?.description || "Get a custom local SEO and web architecture strategy tailored for your business.",
    buttonText: blogPageData.detailSidebarCta?.buttonText || "GET FREE ESTIMATE",
    buttonHref: blogPageData.detailSidebarCta?.buttonHref || "/#contact"
  };

  // Resolve Signature Detail CTA Banner (Syncs with Blog Page CTA)
  const ctaSource = blogPageData.ctaBanner || blogPageData.detailCtaBanner || {};
  const detailCtaBanner = {
    eyebrow: ctaSource.eyebrow || "READY TO ACCELERATE?",
    titleIntro: ctaSource.titleIntro || "Let's Build Your Next",
    titleHighlight: ctaSource.titleHighlight || "Competitive Edge",
    titleLine2: ctaSource.titleLine2 || "Together.",
    description: ctaSource.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: ctaSource.ctaPrimary?.label || "Book Strategy Session",
      href: ctaSource.ctaPrimary?.href || "/contact"
    },
    ctaSecondary: {
      label: ctaSource.ctaSecondary?.label || "Watch Showreel",
      href: ctaSource.ctaSecondary?.href || "/gallery"
    },
    portraitSrc: ctaSource.portraitSrc || "/founder.png",
    portraitAlt: ctaSource.portraitAlt || "Mohsin Designs Lead Architect"
  };

  // Resolve Related Section Header
  const relatedSection = {
    eyebrow: blogPageData.relatedSection?.eyebrow || "EXPLORE MORE INSIGHTS",
    title: blogPageData.relatedSection?.title || "Related Articles & Guides"
  };

  // 3. Fetch 3 Related Articles (excluding current post)
  const relatedPostsRaw = await Post.find({
    _id: { $ne: post._id },
    status: "published"
  })
    .populate("categories")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(3)
    .lean();

  const relatedPosts = relatedPostsRaw.map((r: any, idx: number) => {
    let catBadge = "Article";
    if (Array.isArray(r.categories) && r.categories.length > 0) {
      catBadge = r.categories[0]?.name || "Article";
    }

    let rDate = "Recent";
    if (r.publishedAt || r.createdAt) {
      try {
        rDate = new Date(r.publishedAt || r.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric"
        });
      } catch {
        rDate = "Recent";
      }
    }

    let rReadTime = "5 min read";
    if (r.content) {
      const words = String(r.content).replace(/<[^>]*>/g, "").split(/\s+/).length;
      rReadTime = `${Math.max(3, Math.ceil(words / 200))} min read`;
    }

    return {
      id: String(r._id),
      slug: r.slug || String(r._id),
      title: r.title,
      badge: catBadge,
      image: r.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      date: rDate,
      readTime: rReadTime
    };
  });

  // 4. Resolve Post Metadata & Author Information (Sanitized to pure string primitives)
  let categoryBadge = "Article";
  if (Array.isArray(post.categories) && post.categories.length > 0) {
    categoryBadge = post.categories[0]?.name || "Article";
  }

  let formattedDate = "Recent";
  if (post.publishedAt || post.createdAt) {
    try {
      formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    } catch {
      formattedDate = "Recent";
    }
  }

  const rawHtmlContent = post.content || `<p>${post.excerpt || post.title}</p>`;
  const wordCount = rawHtmlContent.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  const readTimeDisplay = `${Math.max(3, Math.ceil(wordCount / 200))} min read`;
  const featuredImage = post.featuredImage || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop";

  // Sanitize Author details so no ObjectId or Buffer is passed
  const rawAuthor = post.author as any;
  let cleanName = "Mohsin";
  if (rawAuthor) {
    if (rawAuthor.name && typeof rawAuthor.name === "string" && rawAuthor.name.trim()) {
      cleanName = rawAuthor.name.trim();
    } else if (rawAuthor.username && typeof rawAuthor.username === "string" && rawAuthor.username.toLowerCase() !== "admin") {
      cleanName = rawAuthor.username;
    }
  }

  let cleanRole = "Founder & Creative Director";
  if (rawAuthor?.role) {
    if (typeof rawAuthor.role === "object" && rawAuthor.role?.name) {
      cleanRole = String(rawAuthor.role.name);
    } else if (typeof rawAuthor.role === "string" && !rawAuthor.role.match(/^[0-9a-fA-F]{24}$/)) {
      cleanRole = rawAuthor.role;
    }
  }

  let cleanAvatar = "/founder.png";
  if (rawAuthor) {
    const candidate = rawAuthor.image || rawAuthor.avatar;
    if (candidate && typeof candidate === "string" && candidate.startsWith("http")) {
      cleanAvatar = candidate;
    } else if (candidate && typeof candidate === "string" && candidate.startsWith("/")) {
      cleanAvatar = candidate;
    }
  }

  const authorInfo = {
    name: String(cleanName),
    role: String(cleanRole),
    avatar: String(cleanAvatar)
  };

  // 5. Schema.org Article Graph JSON-LD
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "headline": post.title,
        "description": post.excerpt || post.title,
        "datePublished": post.publishedAt || post.createdAt,
        "dateModified": post.updatedAt || post.publishedAt || post.createdAt,
        "author": {
          "@type": "Person",
          "name": authorInfo.name,
          "jobTitle": authorInfo.role
        },
        "publisher": {
          "@type": "Organization",
          "name": "Mohsin Designs",
          "url": BASE_URL
        },
        "image": featuredImage,
        "wordCount": wordCount,
        "inLanguage": "en-US"
      }
    ]
  };

  // 6. Automated Table of Contents Logic
  let tableOfContents: { id: string; text: string; level: number }[] = [];
  let processedContent = rawHtmlContent;

  const headingRegex = /<(h[123])\b[^>]*>(.*?)<\/h[123]>/gi;
  let match;
  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  while ((match = headingRegex.exec(rawHtmlContent)) !== null) {
    const tag = match[1].toLowerCase();
    const cleanText = match[2].replace(/<[^>]*>/g, "").trim();
    if (!cleanText || cleanText.length < 2) continue;

    const id = slugify(cleanText) || `section-${tableOfContents.length + 1}`;
    const level = parseInt(tag[1]);

    tableOfContents.push({ id, text: cleanText, level });

    const originalTag = match[0];
    const newTag = `<${tag} id="${id}" class="scroll-mt-32 font-heading ${
      level <= 2 ? "text-2xl sm:text-3xl mt-12 mb-4" : "text-xl sm:text-2xl mt-8 mb-3"
    } font-black text-brand-dark dark:text-white leading-snug">${match[2]}</${tag}>`;
    processedContent = processedContent.replace(originalTag, newTag);
  }

  processedContent = makeLinksDoFollow(processedContent);

  return (
    <article className="min-h-screen bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 pb-24 relative overflow-x-clip font-sans">
      <Script
        id="blog-post-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
      />
      <ReadingProgress />

      {/* ── 1. HERO SECTION WITH FULL BLEED BACKGROUND ────────────────── */}
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[180px] sm:pt-[210px] lg:pt-[280px] pb-12 sm:pb-16 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10">
        {/* Background Graphic Bleed */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src="/portfolio_hero_bg.png"
            alt="Header Background"
            className="absolute inset-0 w-full h-full object-cover object-right opacity-30 dark:opacity-20"
          />
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
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand-zinc-500 dark:text-zinc-400 mb-5">
            <Link href="/" className="hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
              Home
            </Link>
            <span className="text-brand-zinc-300 dark:text-zinc-600">/</span>
            <Link href="/blog" className="hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
              Blog
            </Link>
            <span className="text-brand-zinc-300 dark:text-zinc-600">/</span>
            <span className="text-brand-blue dark:text-brand-yellow font-black">{categoryBadge}</span>
          </div>

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

            <span className="inline-flex items-center gap-1.5 text-brand-zinc-500 dark:text-zinc-400 font-medium">
              <Calendar className="w-3.5 h-3.5 text-brand-blue dark:text-brand-yellow" />
              {formattedDate}
            </span>

            <span className="inline-flex items-center gap-1.5 font-mono font-bold text-brand-blue dark:text-brand-yellow">
              <Clock className="w-3.5 h-3.5" />
              {readTimeDisplay}
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. FEATURED COVER IMAGE CONTAINER ────────────────────────── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 sm:mt-10 relative z-20">
        <div className="bg-white dark:bg-[#12121e] rounded-[28px] overflow-hidden shadow-xl border border-brand-zinc-200/90 dark:border-white/10 aspect-[21/9] relative group">
          <img
            src={featuredImage}
            alt={post.title}
            className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        </div>
      </div>

      {/* ── 3. MAIN CONTENT LAYOUT WITH STICKY SIDEBAR ────────────────── */}
      <div className="container mx-auto px-4 mt-16 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

          {/* Left: Blog Content */}
          <div className="lg:w-[65%] min-w-0 w-full">

            {/* Author Attribution Card */}
            {authorInfo && (
              <div className="flex flex-col min-[400px]:flex-row items-center gap-5 mb-12 p-6 min-[400px]:p-8 bg-brand-zinc-50 dark:bg-zinc-900/60 border border-brand-zinc-200 dark:border-white/10 rounded-2xl min-[400px]:rounded-3xl">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-xl border-2 border-brand-blue dark:border-brand-yellow">
                    <img
                      src={authorInfo.avatar}
                      alt={authorInfo.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-brand-blue dark:text-brand-yellow mb-1 block">
                    Article Strategist
                  </span>
                  <h4 className="text-xl font-bold text-brand-dark dark:text-white leading-tight">
                    {authorInfo.name}
                  </h4>
                  <p className="text-brand-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mt-0.5 font-medium">
                    {authorInfo.role}
                  </p>
                </div>
              </div>
            )}

            {/* Main Content Body */}
            <div
              className="prose prose-slate dark:prose-invert max-w-none 
              prose-headings:font-heading prose-headings:font-black prose-headings:text-brand-dark dark:prose-headings:text-white
              prose-p:text-brand-zinc-600 dark:prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:text-base sm:prose-p:text-lg
              prose-a:text-brand-blue dark:prose-a:text-brand-yellow prose-a:font-bold prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-2xl md:prose-img:rounded-3xl prose-img:my-8 prose-img:shadow-xl
              prose-blockquote:border-l-4 prose-blockquote:border-brand-blue dark:prose-blockquote:border-brand-yellow prose-blockquote:bg-brand-zinc-50 dark:prose-blockquote:bg-zinc-900/60 prose-blockquote:p-6 md:prose-blockquote:p-8 prose-blockquote:rounded-2xl"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />
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
                    <h3 className="text-xs font-mono font-black uppercase tracking-widest text-brand-dark dark:text-white">
                      Navigation
                    </h3>
                    <p className="text-[9px] text-brand-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                      Quick Select
                    </p>
                  </div>
                </div>

                {/* Table of Contents Links */}
                {tableOfContents.length > 0 ? (
                  <nav className="space-y-1.5 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                    {tableOfContents.map((item, idx) => (
                      <a
                        key={idx}
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
                              : "bg-brand-zinc-300 dark:bg-zinc-700 scale-75 group-hover:bg-brand-blue group-hover:scale-100"
                          }`}
                        />
                        <span className="text-xs sm:text-sm font-semibold line-clamp-1 flex-1">
                          {item.text}
                        </span>
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="py-2 space-y-2">
                    <p className="text-xs text-brand-zinc-400 italic">
                      Detailed structure available above.
                    </p>
                  </div>
                )}

                {/* Article Impact / Quick Stats */}
                <div className="mt-6 pt-6 border-t border-brand-zinc-200/80 dark:border-white/10">
                  <h5 className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-zinc-400 mb-3">
                    Article Impact
                  </h5>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-brand-zinc-50 dark:bg-zinc-900/80 p-3.5 rounded-2xl border border-brand-zinc-200/80 dark:border-white/5 text-left">
                      <p className="text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">Words</p>
                      <p className="text-lg font-mono font-black text-brand-dark dark:text-white mt-0.5">{wordCount}</p>
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
                  <ShareButton title={post.title} url={post.slug} />
                </div>
              </div>

              {/* Sidebar Agency CTA Box */}
              <div className="bg-gradient-to-br from-[#0306AC] via-[#020485] to-[#010356] dark:from-[#12121e] dark:via-[#161628] dark:to-[#0d0c18] border border-white/10 dark:border-white/10 rounded-[2rem] p-7 text-white relative overflow-hidden group shadow-2xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.5)] space-y-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-yellow/15 dark:bg-brand-yellow/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-brand-yellow/25 transition-colors duration-700 pointer-events-none" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9.5px] font-mono font-black uppercase bg-white/10 dark:bg-brand-yellow/15 text-brand-yellow border border-white/20 dark:border-brand-yellow/30">
                  <Star className="w-3 h-3 fill-current" /> {sidebarCta.badge}
                </span>
                <h4 className="font-heading text-2xl font-black text-white leading-tight">
                  {sidebarCta.title}
                </h4>
                <p className="text-white/80 dark:text-zinc-300 text-xs leading-relaxed font-sans font-normal">
                  {sidebarCta.description}
                </p>
                <Link
                  href={sidebarCta.buttonHref}
                  className="btn-primary-cta w-full justify-center text-xs py-3.5 mt-2"
                >
                  <span>{sidebarCta.buttonText}</span>
                  <span className="btn-icon">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </Link>
              </div>

            </div>
          </aside>

        </div>
      </div>

      {/* Inline FAQs attached to this post */}
      {((post.faq && post.faq.length > 0) || (post.faqSchemaMarkup && post.faqSchemaMarkup.trim())) && (
        <div className="mt-16 pt-8 border-t border-brand-zinc-200 dark:border-white/10">
          <PageInlineFaqs
            faqs={post.faq}
            faqSchemaMarkup={post.faqSchemaMarkup}
            badge={post.faqBadge || "ARTICLE FAQ"}
            title={post.faqTitle || "Frequently Asked Questions"}
            subtitle={post.faqDescription || "Key insights and technical queries answered."}
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
                href={`/blog/${rPost.slug || rPost.id}`}
                className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group select-none relative block cursor-pointer"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-brand-light dark:bg-zinc-950 border-b border-brand-zinc-200/80 dark:border-white/10">
                    <img
                      src={rPost.image}
                      alt={rPost.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
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
                  <span className="text-brand-zinc-400 dark:text-zinc-400 font-medium">
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
              <span className="whitespace-nowrap inline-block">
                {detailCtaBanner.titleLine2}{" "}
                <span className="relative inline-block">
                  <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {detailCtaBanner.titleHighlight}
                  </span>
                  <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M 5 6 C 30 9, 70 9, 95 4" />
                  </svg>
                </span>
              </span>
            </h2>

            {/* Description */}
            <p className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg">
              {detailCtaBanner.description}
            </p>

            {/* CTAs */}
            <div className="flex items-center gap-4 flex-wrap pt-2">
              <a href={detailCtaBanner.ctaPrimary.href} className="btn-primary-cta">
                <span>{detailCtaBanner.ctaPrimary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </a>

              <a href={detailCtaBanner.ctaSecondary.href} className="btn-secondary-cta">
                <span>{detailCtaBanner.ctaSecondary.label}</span>
                <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
              </a>
            </div>
          </div>

          {/* Right Side Portrait & Arch Graphic */}
          <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
            <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
            <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
              <img
                src={detailCtaBanner.portraitSrc}
                alt={detailCtaBanner.portraitAlt}
                className="w-full h-full object-cover object-top filter contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
            </div>
            <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
          </div>
        </div>
      </section>
    </article>
  );
}
