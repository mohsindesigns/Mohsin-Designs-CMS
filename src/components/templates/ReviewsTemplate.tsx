"use client";

import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import dynamic from "next/dynamic";
import DOMPurify from "isomorphic-dompurify";
import RichTextRenderer from "../ui/RichTextRenderer";
import CtaButton from "@/components/ui/CtaButton";
import { isSafeHref } from "@/lib/utils";

const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });

// ---------------------------------------------------------------------------
// Data contract (ReviewsEditor <-> this template)
//   content.testimonials = {
//     section: { enabled, badge, headline, description },     "Review Header" tab
//     stats:   { rating, count, label },                       "Review Header" tab (summary strip)
//     reviewCta: { url, label },                               "Review Header" tab (optional "leave a review" button)
//     testimonialsEnabled,                                     "Testimonials" tab toggle
//     testimonials: Review[],                                  "Testimonials" tab (picked from the managed inventory)
//   }
//   content.videoTestimonials = { ... }                        "Video Testimonials" tab (own section component)
// Older / seeded documents may keep the same keys flat on `content`, so that shape is still read.
// ---------------------------------------------------------------------------

interface Review {
    name: string;
    position: string;
    company: string;
    text: string;
    rating: number;
    avatar: string;
}

const asText = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "").trim();
const stripTags = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim();

// The managed inventory holds two shapes: Admin > Reviews writes { text, position, ... } while the
// Home testimonials list uses { quote, role, ... }. Both can end up in a page's selection, so read both.
function normalizeReview(raw: any): Review | null {
    if (!raw || typeof raw !== "object") return null;
    const text = asText(raw.text) || asText(raw.quote) || asText(raw.review);
    if (!stripTags(text)) return null; // a review without any words is just an empty card
    const ratingNum = Number(raw.rating);
    return {
        name: asText(raw.name),
        position: asText(raw.position) || asText(raw.role),
        company: asText(raw.company),
        text,
        // Unset / invalid ratings keep the previous look (5 stars); the admin's select is 1-5.
        rating: Number.isFinite(ratingNum) && ratingNum > 0 ? Math.min(5, ratingNum) : 5,
        avatar: asText(raw.avatar) || asText(raw.image),
    };
}

const initialsOf = (name: string) =>
    name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() || "")
        .join("");

// Headline is a plain-text field in the editor, but older documents may carry inline HTML
// (<em>, <span>...). Render HTML only when it looks like HTML, and always sanitized.
function renderHeadline(headline: string): { html: string } | null {
    if (!/<[a-z][\s\S]*>/i.test(headline)) return null;
    try {
        return { html: DOMPurify.sanitize(headline, { ALLOWED_TAGS: ["em", "strong", "b", "i", "u", "span", "br", "mark"], ALLOWED_ATTR: ["class"] }) };
    } catch {
        return { html: "" };
    }
}

const Stars = ({ value, className = "w-4 h-4" }: { value: number; className?: string }) => {
    const filled = Math.round(Math.min(5, Math.max(0, value)));
    return (
        <div className="flex gap-0.5" role="img" aria-label={`Rated ${value} out of 5`}>
            {[0, 1, 2, 3, 4].map((i) => (
                <svg
                    key={i}
                    aria-hidden="true"
                    className={`${className} ${i < filled ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-300 dark:text-white/15 dark:fill-white/15"}`}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2z" />
                </svg>
            ))}
        </div>
    );
};

const Avatar = ({ name, src }: { name: string; src: string }) => {
    const [failed, setFailed] = useState(false);
    const initials = initialsOf(name);
    if (src && !failed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt=""
                loading="lazy"
                onError={() => setFailed(true)}
                className="w-11 h-11 rounded-full object-cover shrink-0 border border-gray-100 dark:border-white/10"
            />
        );
    }
    if (!initials) return null;
    return (
        <span
            aria-hidden="true"
            className="w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-sm font-bold bg-brand-blue/10 text-brand-blue dark:bg-brand-yellow/15 dark:text-brand-yellow"
        >
            {initials}
        </span>
    );
};

const TestimonialCard = ({ review, index }: { review: Review; index: number }) => {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const textRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);

    // Long reviews are clamped to keep the grid tidy; only offer "Read more" when text is really cut off.
    useEffect(() => {
        const el = textRef.current;
        if (!el) return;
        const measure = () => {
            if (expanded) return;
            setOverflowing(el.scrollHeight - el.clientHeight > 2);
        };
        measure();
        if (typeof ResizeObserver === "undefined") return;
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, [expanded, review.text]);

    const byline = [review.position, review.company].filter(Boolean).join(", ");
    const hasAuthor = !!(review.name || byline || review.avatar);

    return (
        <motion.article
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            // Stagger within a row only: a per-index delay makes cards far down the page wait seconds.
            transition={{ duration: 0.5, delay: (index % 2) * 0.1 }}
            className="group relative flex h-full flex-col bg-white dark:bg-card rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 dark:border-white/5 transition-all duration-300"
        >
            <div aria-hidden="true" className="absolute top-6 right-6 text-5xl leading-none text-brand-blue/10 dark:text-brand-yellow/10 font-cursive select-none">&ldquo;</div>
            <div className="mb-5">
                <Stars value={review.rating} />
            </div>
            <blockquote className="mb-6 text-gray-700 dark:text-foreground/80 text-sm sm:text-base leading-relaxed">
                <div ref={textRef} className={expanded ? "" : "line-clamp-6"}>
                    <RichTextRenderer content={review.text} />
                </div>
                {(overflowing || expanded) && (
                    <button
                        type="button"
                        onClick={() => setExpanded((v) => !v)}
                        aria-expanded={expanded}
                        className="mt-2 text-sm font-semibold text-brand-blue dark:text-brand-yellow hover:underline underline-offset-4"
                    >
                        {expanded ? "Show less" : "Read more"}
                    </button>
                )}
            </blockquote>
            {hasAuthor && (
                <div className="mt-auto flex items-center gap-3 pt-5 border-t border-gray-100 dark:border-white/10">
                    <Avatar name={review.name} src={review.avatar} />
                    <div className="min-w-0">
                        {review.name && <h3 className="font-semibold text-gray-900 dark:text-foreground text-sm">{review.name}</h3>}
                        {byline && <p className="text-xs text-gray-500 dark:text-zinc-400">{byline}</p>}
                    </div>
                </div>
            )}
        </motion.article>
    );
};

export default function ReviewsTemplate({ pageData, params }: { pageData?: any, params?: any }) {
    const content = pageData?.content || {};
    // Page-specific block written by ReviewsEditor. This page deliberately does NOT fall back to the
    // global Home testimonials: those use a different shape (list/quote/role) and their own on/off
    // switch, and would make an un-curated page show the wrong content.
    const block =
        content.testimonials && typeof content.testimonials === "object" && !Array.isArray(content.testimonials)
            ? content.testimonials
            : content;
    const section = block.section && typeof block.section === "object" ? block.section : {};
    const stats = block.stats && typeof block.stats === "object" ? block.stats : {};
    const rawList: any[] = Array.isArray(block.testimonials)
        ? block.testimonials
        : Array.isArray(content.testimonials)
            ? content.testimonials
            : [];
    const reviews = rawList.map(normalizeReview).filter((r): r is Review => !!r);

    const headerVisible = section.enabled !== false;
    const gridVisible = block.testimonialsEnabled !== false;

    const headline = asText(section.headline) || "Customer Stories";
    const headlineHtml = renderHeadline(headline);
    const badge = asText(section.badge);
    const description = asText(section.description);

    const statRating = asText(stats.rating);
    const statCount = asText(stats.count);
    const statLabel = asText(stats.label);
    const ratingValue = parseFloat(statRating);
    const showStats = !!(statRating || statCount);

    const ctaUrl = asText(block.reviewCta?.url);
    const ctaHref = ctaUrl && isSafeHref(ctaUrl) ? ctaUrl : "";
    const ctaLabel = asText(block.reviewCta?.label) || "Leave a Review";

    const videoData = content.videoTestimonials;
    const showVideos =
        videoData?.enabled !== false && Array.isArray(videoData?.items) && videoData.items.length > 0;

    const h1Classes = "text-3xl sm:text-4xl lg:text-[44px] font-bold tracking-tight text-brand-dark dark:text-white";

    return (
        <div className="relative min-h-screen bg-gray-50 dark:bg-background pt-28 md:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
            <div className="max-w-6xl mx-auto px-4 text-center">
                <PageBreadcrumbs page={pageData} align="center" className="mb-8" />

                {headerVisible ? (
                    <>
                        {badge && (
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-blue-300 to-brand-blue dark:from-brand-yellow/30 dark:to-brand-yellow" />
                                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-brand-blue dark:text-brand-yellow">{badge}</span>
                                <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-l from-blue-300 to-brand-blue dark:from-brand-yellow/30 dark:to-brand-yellow" />
                            </div>
                        )}
                        {headlineHtml ? (
                            <h1 className={`${h1Classes} mb-4`} dangerouslySetInnerHTML={{ __html: headlineHtml.html }} />
                        ) : (
                            <h1 className={`${h1Classes} mb-4`}>{headline}</h1>
                        )}
                        {description && (
                            <RichTextRenderer
                                content={description}
                                className={`text-lg text-gray-600 dark:text-zinc-300 max-w-xl mx-auto ${showStats ? "mb-8" : "mb-12"}`}
                            />
                        )}
                        {showStats && (
                            <div className="mx-auto mb-12 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-card px-5 py-2.5 text-sm text-gray-600 dark:text-zinc-300 shadow-sm">
                                {statRating && (
                                    <span className="inline-flex items-center gap-2">
                                        {Number.isFinite(ratingValue) && <Stars value={ratingValue} className="w-4 h-4" />}
                                        <strong className="text-gray-900 dark:text-white font-bold">{statRating}</strong>
                                        {/^\d+(\.\d+)?$/.test(statRating) && <span className="-ml-1.5">/5</span>}
                                    </span>
                                )}
                                {statRating && statCount && <span aria-hidden="true" className="h-4 w-px bg-gray-200 dark:bg-white/15" />}
                                {statCount && (
                                    <span>
                                        <strong className="text-gray-900 dark:text-white font-bold">{statCount}</strong> {statLabel || "Reviews"}
                                    </span>
                                )}
                            </div>
                        )}
                        {!showStats && !description && <div className="mb-8" />}
                    </>
                ) : (
                    // Header hidden: keep the page's single <h1> for SEO / screen readers without showing it.
                    <h1 className="sr-only">{headline}</h1>
                )}

                {gridVisible && reviews.length > 0 && (
                    <section aria-labelledby="reviews-grid-heading">
                        <h2 id="reviews-grid-heading" className="sr-only">Client reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                            {reviews.map((review, i) => (
                                <TestimonialCard key={i} review={review} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty state: nothing to show at all (no reviews picked, no video testimonials). */}
                {gridVisible && reviews.length === 0 && !showVideos && (
                    <div className="mx-auto max-w-md rounded-2xl border border-dashed border-gray-300 dark:border-white/15 px-6 py-12 text-gray-500 dark:text-zinc-400">
                        <p className="font-semibold text-gray-700 dark:text-zinc-200">No reviews to show yet</p>
                        <p className="mt-1 text-sm">New client reviews will appear here soon.</p>
                    </div>
                )}

                {ctaHref && (
                    <div className="mt-12 flex justify-center">
                        <CtaButton href={ctaHref} target="_blank" rel="noopener noreferrer">{ctaLabel}</CtaButton>
                    </div>
                )}
            </div>

            {showVideos && (
                <section id="video-testimonials">
                    <VideoTestimonials data={videoData} />
                </section>
            )}
        </div>
    );
}
