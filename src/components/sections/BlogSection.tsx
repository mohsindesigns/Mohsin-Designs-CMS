"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "@/hooks/useContent";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

interface BlogPost {
  _id?: string;
  id?: string;
  title: string;
  slug?: string;
  link?: string;
  featuredImage?: string;
  image?: string;
  excerpt?: string;
  publishedAt?: string;
  date?: string;
  category?: string;
  categories?: string[];
  readTime?: string;
  readingTime?: string;
  author?: string | { name: string };
}

interface BlogSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  posts?: BlogPost[];
  viewAllLink?: string;
  data?: any;
}

export default function BlogSection({
  title,
  subtitle,
  description,
  posts: propPosts,
  data: overrideData,
  viewAllLink = "/blog"
}: BlogSectionProps) {
  const content = useContent();
  const rawBlog = overrideData || content.blogSection || {};

  // Headers and narrative defaults
  const sectionTag = rawBlog.sectionTag || subtitle || rawBlog.subtitle || "LATEST ARTICLES & INSIGHTS";
  
  // Clean dynamic heading without unwanted hardcoded prefixes
  const explicitIntro = rawBlog.titleIntro !== undefined ? rawBlog.titleIntro : undefined;
  const explicitHighlight = title || rawBlog.titleHighlight || rawBlog.title;

  let titleIntro = "";
  let titleHighlight = "";

  if (explicitIntro !== undefined && explicitIntro.trim()) {
    titleIntro = explicitIntro.trim();
    titleHighlight = (explicitHighlight || "").trim();
  } else if (explicitHighlight && explicitHighlight.trim()) {
    titleIntro = "";
    titleHighlight = explicitHighlight.trim();
  } else {
    titleIntro = "Thinking, Strategies &";
    titleHighlight = "Industry Insights";
  }

  const descText = rawBlog.description || description || "";
  const featuredLabel = rawBlog.featuredLabel || "Read Full Article";
  const dateSeparator = rawBlog.dateSeparator || " • ";

  // Fallback demo posts if no posts are found
  const defaultPosts: BlogPost[] = [
    {
      _id: "demo-1",
      title: "Building High-Conversion SaaS Landing Pages with Next.js 15 & Framer Motion",
      slug: "building-high-conversion-saas-landing-pages",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      excerpt: "A comprehensive deep dive into sub-second page loads, micro-animations that convert, and scalable architecture patterns for modern SaaS.",
      date: "Oct 24, 2026",
      category: "Engineering",
      readTime: "5 min read"
    },
    {
      _id: "demo-2",
      title: "The Architecture of World-Class Design Systems in 2026",
      slug: "architecture-of-world-class-design-systems",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
      excerpt: "How unified component tokens and strict accessibility audits transform team velocity.",
      date: "Oct 18, 2026",
      category: "UI/UX Design",
      readTime: "4 min read"
    },
    {
      _id: "demo-3",
      title: "Optimizing Core Web Vitals for Enterprise Applications",
      slug: "optimizing-core-web-vitals-for-enterprise",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      excerpt: "Eliminating layout shifts, mastering dynamic hydration, and hitting 99+ Lighthouse scores.",
      date: "Oct 12, 2026",
      category: "Performance",
      readTime: "6 min read"
    },
    {
      _id: "demo-4",
      title: "From Figma to Production: A Frictionless Developer Workflow",
      slug: "from-figma-to-production-workflow",
      image: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
      excerpt: "Bridging the designer-developer divide with automated token pipelines and live specs.",
      date: "Oct 05, 2026",
      category: "Workflow",
      readTime: "3 min read"
    }
  ];

  const [liveBlogs, setLiveBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    // If allBlogs is empty in context, fetch fresh from /api/blog
    if (!content.allBlogs || content.allBlogs.length === 0) {
      fetch('/api/blog')
        .then(res => res.ok ? res.json() : [])
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setLiveBlogs(data);
          }
        })
        .catch(() => {});
    }
  }, [content.allBlogs]);

  const poolOfBlogs = (Array.isArray(content.allBlogs) && content.allBlogs.length > 0)
    ? content.allBlogs
    : liveBlogs;

  // Resolve posts strictly from props, page-specific selectedPosts, or blog pool
  let activePosts: BlogPost[] = [];
  
  if (Array.isArray(propPosts) && propPosts.length > 0) {
    activePosts = propPosts;
  } else if (Array.isArray(rawBlog.selectedPosts) && rawBlog.selectedPosts.length > 0) {
    if (rawBlog.selectedPosts.every((s: any) => typeof s === 'object' && s && s.title)) {
      activePosts = rawBlog.selectedPosts;
    } else if (Array.isArray(poolOfBlogs) && poolOfBlogs.length > 0) {
      const matched = poolOfBlogs.filter((p: any) => {
        const pId = String(p._id || p.id || '');
        const pSlug = String(p.slug || '');
        return rawBlog.selectedPosts.some((s: any) => {
          if (typeof s === 'string') return s === pId || s === pSlug;
          if (typeof s === 'object' && s) return String(s._id || s.id || '') === pId || String(s.slug || '') === pSlug;
          return false;
        });
      });
      if (matched.length > 0) activePosts = matched;
    }
  }
  
  if (activePosts.length === 0 && Array.isArray(poolOfBlogs) && poolOfBlogs.length > 0) {
    activePosts = poolOfBlogs.slice(0, 4);
  }

  if (activePosts.length === 0) {
    activePosts = defaultPosts;
  }

  // Helper to extract clean text from blog post content or SEO description
  const getPostExcerpt = (p: any): string => {
    if (p.excerpt && typeof p.excerpt === "string" && p.excerpt.trim().length > 0) {
      return p.excerpt.trim();
    }
    if (p.seo?.metaDescription && typeof p.seo.metaDescription === "string" && p.seo.metaDescription.trim().length > 0) {
      return p.seo.metaDescription.trim();
    }
    if (p.seo?.ogDescription && typeof p.seo.ogDescription === "string" && p.seo.ogDescription.trim().length > 0) {
      return p.seo.ogDescription.trim();
    }
    if (p.description && typeof p.description === "string" && p.description.trim().length > 0) {
      const clean = p.description.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
      if (clean.length > 0) return clean.length > 160 ? clean.slice(0, 157) + "..." : clean;
    }
    if (p.content && typeof p.content === "string") {
      const clean = p.content.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
      if (clean.length > 0) return clean.length > 160 ? clean.slice(0, 157) + "..." : clean;
    }
    return "";
  };

  const getPostReadingTime = (p: any): string => {
    if (p.readTime) return p.readTime;
    if (p.readingTime) return p.readingTime;
    if (p.content && typeof p.content === "string") {
      const text = p.content.replace(/<[^>]*>?/gm, "").replace(/&nbsp;/g, " ").trim();
      const words = text.split(/\s+/).filter(Boolean).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      return `${mins} min read`;
    }
    return "4 min read";
  };

  const getPostCategory = (p: any, idx: number): string => {
    if (typeof p.category === "string" && p.category.trim()) return p.category.trim();
    if (Array.isArray(p.categories) && p.categories.length > 0) {
      const first = p.categories[0];
      if (typeof first === "string" && first.trim()) return first.trim();
      if (first && typeof first === "object" && first.name) return first.name;
    }
    return defaultPosts[idx % defaultPosts.length].category || "Article";
  };

  // Normalize post fields
  const posts = activePosts.map((p, idx) => {
    let cat = getPostCategory(p, idx);
    let formattedDate = p.date || (p.publishedAt ? new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recent");
    let reading = getPostReadingTime(p);
    let img = p.featuredImage || p.image || defaultPosts[idx % defaultPosts.length].image!;
    let href = p.link || (p.slug ? `/blog/${p.slug}` : `/blog/${p._id || idx}`);
    let extractedExcerpt = getPostExcerpt(p);

    return {
      id: p._id || p.id || `post-${idx}`,
      title: p.title || (idx === 0 && rawBlog.featuredTitle ? rawBlog.featuredTitle : "Untitled Post"),
      link: href,
      image: p.featuredImage || p.image || (idx === 0 && rawBlog.featuredImage ? rawBlog.featuredImage : img),
      excerpt: extractedExcerpt,
      category: cat || (idx === 0 && rawBlog.featuredCategory ? rawBlog.featuredCategory : "Article"),
      date: formattedDate,
      readTime: reading
    };
  });

  return (
    <section
      id="blog"
      className="relative overflow-hidden bg-white dark:bg-[#080710] py-24 md:py-32 border-t border-b border-slate-200 dark:border-white/10"
    >
      {/* Decorative Background Glows */}
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#E9BD36]/10 blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/3 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none z-0" />

      {/* Crossing structural grid lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-primary/[0.03] pointer-events-none" />

      {/* Local keyframe animations for premium hover card glass sweep reflections */}
      <style>{`
        .card-sweep-glare {
          position: relative;
        }
        .card-sweep-glare::before {
          content: '';
          position: absolute;
          top: 0;
          left: -120%;
          width: 60%;
          height: 100%;
          background: linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0.28) 50%,
            rgba(255, 255, 255, 0) 100%
          );
          transform: skewX(-25deg);
          transition: left 0.85s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 20;
        }
        .group:hover.card-sweep-glare::before {
          left: 160%;
        }
        .dark .card-sweep-glare::before {
          display: none;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col gap-4 mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 text-xs font-bold uppercase tracking-widest self-start">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-yellow-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-yellow-400" />
            </span>
            {sectionTag}
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
            {titleIntro ? (
              <>
                {titleIntro}{" "}
                <span className="text-primary dark:text-yellow-400 font-serif font-normal italic">
                  {titleHighlight}
                </span>
              </>
            ) : (
              <span className="text-slate-900 dark:text-white">
                {titleHighlight}
              </span>
            )}
          </h2>
          {descText && (
            <div className="text-sm sm:text-base font-sans text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-xl">
              <RichTextRenderer content={descText} />
            </div>
          )}
        </motion.div>

        {/* Asymmetrical Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">

          {/* Left Column: Featured Post (lg:col-span-7) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7"
          >
            {posts[0] && (
              <Link
                href={posts[0].link}
                className="group flex flex-col rounded-[2.5rem] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#12121e] p-6 md:p-8 shadow-[0_2px_12px_rgba(3,6,172,0.015)] hover:shadow-[0_20px_40px_rgba(3,6,172,0.08)] hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 overflow-hidden card-sweep-glare select-none block no-underline"
              >
                {/* Image Wrapper */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/40 dark:border-white/10 rounded-3xl mb-6">
                  <Image
                    src={posts[0].image}
                    alt={posts[0].title}
                    fill
                    unoptimized={posts[0].image?.startsWith('http') || posts[0].image?.startsWith('/uploads') || posts[0].image?.startsWith('/cdn-images')}
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 100vw, 680px"
                    priority
                  />
                </div>

                {/* Card Body */}
                <div className="space-y-4">
                  {/* Date and Read Time Meta */}
                  <div className="flex items-center justify-between">
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                      {posts[0].date}{dateSeparator}{posts[0].readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading text-lg sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary dark:group-hover:text-yellow-400 transition-colors duration-300">
                    {posts[0].title}
                  </h3>

                  {/* Excerpt */}
                  {posts[0].excerpt ? (
                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-zinc-300 font-medium leading-relaxed line-clamp-3">
                      {posts[0].excerpt}
                    </p>
                  ) : null}

                  {/* Read More button */}
                  <div className="flex items-center gap-2 pt-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary dark:text-yellow-400">{featuredLabel}</span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/5 dark:bg-yellow-400/10 border border-primary/10 dark:border-yellow-400/20 text-primary dark:text-yellow-400 group-hover:bg-primary group-hover:text-white dark:group-hover:bg-yellow-400 dark:group-hover:text-[#080710] transition-all duration-300">
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            )}
          </motion.div>

          {/* Right Column: Recent Posts List (lg:col-span-5) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
            className="lg:col-span-5 space-y-6"
          >
            {posts.slice(1).map((post: any, idx: number) => (
              <Link
                key={idx}
                href={post.link}
                className="group block rounded-[2rem] border border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#12121e] p-4 sm:p-5 shadow-[0_2px_12px_rgba(3,6,172,0.01)] hover:shadow-[0_16px_36px_rgba(3,6,172,0.06)] hover:border-primary/30 dark:hover:border-primary/30 transition-all duration-300 overflow-hidden card-sweep-glare select-none no-underline"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full">
                  {/* Small Thumbnail */}
                  <div className="relative w-full sm:w-24 aspect-[16/10] sm:aspect-square overflow-hidden bg-slate-100 dark:bg-zinc-800 border border-slate-200/40 dark:border-white/10 rounded-2xl shrink-0">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      unoptimized={post.image?.startsWith('http') || post.image?.startsWith('/uploads') || post.image?.startsWith('/cdn-images')}
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 100px"
                    />
                  </div>

                  {/* Text Details */}
                  <div className="flex-1 min-w-0 space-y-1.5 w-full">
                    {/* Meta date row */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                        {post.date}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-heading text-xs sm:text-[13px] md:text-sm font-black text-slate-900 dark:text-white leading-snug group-hover:text-primary dark:group-hover:text-yellow-400 transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Read info */}
                    <div className="flex items-center gap-1 text-[9px] font-bold text-slate-400 group-hover:text-primary dark:group-hover:text-yellow-400 transition-colors duration-300 pt-0.5">
                      <span>{post.readTime}</span>
                      <ArrowUpRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>

        </div>

      </div>
    </section>
  );
}
