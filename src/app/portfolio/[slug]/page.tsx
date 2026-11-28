import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/ui/Link";
import { Calendar, MapPin, ExternalLink, Briefcase, Quote, ArrowRight } from "lucide-react";

import connectToDatabase from "@/lib/mongodb";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { getResolvedSchemaBlocks } from "@/lib/dynamicSchema";
import { getCachedSiteContent } from "@/lib/content";
import BeforeAfterSlider from "@/components/ui/BeforeAfterSlider";
import {
  absoluteUrl,
  normalizeCanonicalUrl,
  stripHtml,
  truncate,
} from "@/lib/blog-public";
import { getNextProject, resolvePortfolioItem } from "@/lib/portfolio-public";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [{ item, preview }, contentData] = await Promise.all([resolvePortfolioItem(slug), getCachedSiteContent()]);

  if (!item) return { title: "Case Study Not Found | Mohsin Designs", robots: { index: false, follow: false } };

  const isGlobalNoIndex = !!contentData?.settings?.globalNoIndex;
  const pageTitle = item.seo?.metaTitle || `${item.title} | Mohsin Designs`;
  const challengeDesc = item.sections?.challenge?.enabled !== false ? truncate(stripHtml(item.sections?.challenge?.body), 160) : "";
  const pageDesc = item.seo?.metaDescription || item.summary || challengeDesc || `${item.title} - a Mohsin Designs case study.`;
  const pageImage = absoluteUrl(item.seo?.ogImage || item.seo?.featuredImage || item.thumbnail);
  const twitterImage = absoluteUrl(item.seo?.twitterImage) || pageImage;
  const canonicalUrl = normalizeCanonicalUrl(item.seo?.canonicalUrl, `${BASE_URL}/portfolio/${item.slug}/`, item.slug);

  const publishedIso = item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined;
  const modifiedIso = item.updatedAt ? new Date(item.updatedAt).toISOString() : publishedIso;

  return {
    title: { absolute: pageTitle },
    description: pageDesc,
    alternates: { canonical: canonicalUrl },
    robots: preview ? { index: false, follow: false } : resolveRobotsMetadata(item.seo, isGlobalNoIndex),
    openGraph: {
      title: item.seo?.ogTitle || pageTitle,
      description: item.seo?.ogDescription || pageDesc,
      url: canonicalUrl,
      siteName: "Mohsin Designs",
      type: "article",
      ...(publishedIso ? { publishedTime: publishedIso } : {}),
      ...(modifiedIso ? { modifiedTime: modifiedIso } : {}),
      images: pageImage ? [{ url: pageImage, width: 1200, height: 630, alt: item.seo?.featuredImageAlt || item.title }] : undefined,
    },
    twitter: {
      card: item.seo?.twitterCard || "summary_large_image",
      title: item.seo?.twitterTitle || item.seo?.ogTitle || pageTitle,
      description: item.seo?.twitterDescription || item.seo?.ogDescription || pageDesc,
      images: twitterImage ? [twitterImage] : undefined,
    },
  };
}

export default async function PortfolioCaseStudyPage({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();

  const [{ item, preview }, globalContentData] = await Promise.all([resolvePortfolioItem(slug), getCachedSiteContent()]);

  if (!item) notFound();

  const nextProject = await getNextProject(item);

  const sections = item.sections || {};
  const tags: string[] = Array.isArray(item.tags) ? item.tags : [];
  const publishedIso = item.publishedAt ? new Date(item.publishedAt).toISOString() : undefined;
  const modifiedIso = item.updatedAt ? new Date(item.updatedAt).toISOString() : publishedIso;

  const schemaBlocks = getResolvedSchemaBlocks({
    page: {
      title: item.title,
      slug: `portfolio/${item.slug}`,
      template: "portfolio",
      content: {},
      seo: item.seo || {},
      client: item.client,
      publishedAt: publishedIso,
      updatedAt: modifiedIso,
      featuredImage: item.thumbnail,
      excerpt: item.summary,
    },
    globalData: globalContentData || {},
    slug: `portfolio/${item.slug}`,
  });

  const heroImage = sections.heroImage?.enabled !== false ? sections.heroImage?.image : "";
  const challenge = sections.challenge?.enabled !== false ? sections.challenge : null;
  const approach = sections.approach?.enabled !== false ? sections.approach : null;
  const beforeAfter = sections.beforeAfter?.enabled !== false ? sections.beforeAfter : null;
  const gallery = sections.gallery?.enabled !== false ? sections.gallery : null;
  const results = sections.results?.enabled !== false ? sections.results : null;
  const testimonial = sections.testimonial?.enabled !== false ? sections.testimonial : null;

  const metaRow = [
    item.client ? { label: "Client", value: item.client } : null,
    item.industry ? { label: "Industry", value: item.industry } : null,
    item.location ? { label: "Location", value: item.location } : null,
    item.timeline ? { label: "Timeline", value: item.timeline } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <article className="min-h-screen bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 pb-24 relative overflow-x-clip font-sans">
      <CustomSchemaMarkup schema={schemaBlocks} />

      {preview && (
        <div role="status" className="fixed bottom-4 left-4 z-[110] max-w-[calc(100vw-2rem)] rounded-full bg-amber-400 px-4 py-2 text-xs font-bold text-black shadow-lg">
          Preview only - this case study is a {item.status} and is not visible to the public yet.
        </div>
      )}

      {/* ── 1. INTRO ───────────────────────────────────────────────── */}
      <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[220px] pb-10 border-b border-brand-zinc-200 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <PageBreadcrumbs
            className="mb-5"
            items={[
              { name: "Home", url: "/" },
              { name: "Portfolio", url: "/portfolio/" },
              { name: item.seo?.breadcrumbTitle || item.title, url: `/portfolio/${item.slug}/` },
            ]}
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {tags.map((t, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-brand-dark dark:bg-white/10 text-white px-3.5 py-1.5 text-[13px] font-semibold">
                  {t}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight max-w-3xl">
            {item.title}
          </h1>
          {item.summary && (
            <p className="mt-5 text-base sm:text-lg text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-3xl">{item.summary}</p>
          )}
        </div>
      </section>

      {/* ── 2. HERO IMAGE ──────────────────────────────────────────── */}
      {heroImage && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-8 sm:mt-10">
          <div className="bg-white dark:bg-[#12121e] rounded-[28px] overflow-hidden shadow-xl border border-brand-zinc-200/90 dark:border-white/10 aspect-[16/9] relative">
            <img src={heroImage} alt={sections.heroImage?.alt || item.title} className="w-full h-full object-cover" loading="eager" decoding="async" />
          </div>
        </div>
      )}

      {/* ── 3. META ROW ────────────────────────────────────────────── */}
      {(metaRow.length > 0 || item.liveUrl) && (
        <div className="mx-auto max-w-6xl px-4 sm:px-6 mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-6 pb-8 border-b border-brand-zinc-200 dark:border-white/10">
            {metaRow.map((m) => (
              <div key={m.label}>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-zinc-400">{m.label}</p>
                <p className="text-sm font-semibold text-brand-dark dark:text-white mt-1.5 flex items-center gap-1">
                  {m.label === "Location" && <MapPin className="w-3.5 h-3.5 text-brand-blue dark:text-brand-yellow shrink-0" />}
                  {m.value}
                </p>
              </div>
            ))}
            {item.liveUrl && (
              <div>
                <p className="text-[11px] font-mono font-bold uppercase tracking-widest text-brand-zinc-400">Live site</p>
                <a href={item.liveUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-brand-blue dark:text-brand-yellow mt-1.5 inline-flex items-center gap-1 hover:underline">
                  Visit site <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── 4. CHALLENGE ───────────────────────────────────────────── */}
        {challenge && (challenge.heading || challenge.body || (Array.isArray(challenge.bulletPoints) && challenge.bulletPoints.length > 0)) && (
          <section className="py-14 sm:py-16 flex flex-wrap gap-10">
            <div className="flex-1 min-w-[220px] basis-[280px]">
              <span className="text-xs font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">01 — The Challenge</span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mt-3 leading-tight">{challenge.heading}</h2>
            </div>
            <div className="flex-[2] min-w-[280px] basis-[480px] space-y-5">
              {challenge.body && <p className="text-base text-brand-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-line">{challenge.body}</p>}
              {Array.isArray(challenge.bulletPoints) && challenge.bulletPoints.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 text-brand-zinc-600 dark:text-zinc-300">
                  {challenge.bulletPoints.map((b: string, i: number) => <li key={i}>{b}</li>)}
                </ul>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ── 5. APPROACH (full-width band) ─────────────────────────── */}
      {approach && (approach.heading || (approach.steps || []).length > 0) && (
        <section className="bg-brand-zinc-50 dark:bg-zinc-900/40 border-y border-brand-zinc-200 dark:border-white/10 py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mb-8">{approach.heading}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {(approach.steps || []).map((step: any, i: number) => (
                <div key={i} className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[20px] p-7">
                  <p className="font-heading text-3xl font-black text-brand-blue dark:text-brand-yellow">{step.number || i + 1}</p>
                  <h3 className="font-heading text-lg font-bold text-brand-dark dark:text-white mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-brand-zinc-600 dark:text-zinc-300 leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* ── 6. BEFORE / AFTER + GALLERY ──────────────────────────── */}
        {(beforeAfter && (beforeAfter.beforeImage || beforeAfter.afterImage)) && (
          <section className="py-14 sm:py-16">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mb-7">{beforeAfter.heading || "Before → after"}</h2>
            <BeforeAfterSlider
              beforeImage={beforeAfter.beforeImage}
              afterImage={beforeAfter.afterImage}
              beforeLabel={beforeAfter.beforeLabel || "Before"}
              afterLabel={beforeAfter.afterLabel || "After"}
            />
          </section>
        )}

        {gallery && Array.isArray(gallery.images) && gallery.images.length > 0 && (
          <section className="py-4 pb-14 sm:pb-16">
            {gallery.heading && <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mb-7">{gallery.heading}</h2>}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {gallery.images.map((g: any, i: number) => (
                <div key={i} className="relative aspect-[4/3] rounded-[20px] overflow-hidden border border-brand-zinc-200/90 dark:border-white/10 bg-brand-zinc-100 dark:bg-zinc-900">
                  {g.image && <img src={g.image} alt={g.label || ""} className="w-full h-full object-cover" loading="lazy" />}
                  {g.label && <span className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-2.5 py-1 text-[12px] font-semibold text-white">{g.label}</span>}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── 7. RESULTS (full-width dark band) ───────────────────────── */}
      {results && (results.heading || (results.stats || []).length > 0 || results.proofImage) && (
        <section className="bg-brand-dark dark:bg-[#0c0b18] border-y border-white/10 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-brand-yellow">04 — The Results</span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-white mt-3 mb-10">{results.heading}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(results.stats || []).map((s: any, i: number) => (
                <div key={i} className="border border-white/15 rounded-[20px] p-6">
                  <p className="font-heading text-4xl sm:text-5xl font-black text-brand-yellow leading-none">{s.value}</p>
                  <p className="text-sm text-zinc-300 mt-3">{s.label}</p>
                </div>
              ))}
            </div>
            {results.proofImage && (
              <div className="mt-6 rounded-[20px] overflow-hidden border border-white/10">
                <img src={results.proofImage} alt="Proof of results" className="w-full h-auto object-cover" loading="lazy" />
              </div>
            )}
          </div>
        </section>
      )}

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        {/* ── 8. CLIENT TESTIMONIAL ────────────────────────────────── */}
        {testimonial && testimonial.quote && (
          <section className="py-16 sm:py-20 text-center">
            <Quote className="h-8 w-8 text-brand-blue/40 dark:text-brand-yellow/40 mx-auto mb-5" aria-hidden="true" />
            <blockquote className="font-heading text-xl sm:text-2xl font-normal text-brand-dark dark:text-white leading-relaxed max-w-3xl mx-auto">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <div className="mt-7 flex items-center justify-center gap-3.5">
              {testimonial.authorAvatar ? (
                <img src={testimonial.authorAvatar} alt={testimonial.authorName || ""} className="w-14 h-14 rounded-full object-cover border border-brand-zinc-200 dark:border-white/10" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-brand-zinc-200 dark:bg-zinc-800" />
              )}
              <div className="text-left">
                <p className="font-bold text-brand-dark dark:text-white">{testimonial.authorName}</p>
                {testimonial.authorRole && <p className="text-sm text-brand-zinc-500 dark:text-zinc-400">{testimonial.authorRole}</p>}
              </div>
            </div>
          </section>
        )}

        {/* ── 9. NEXT PROJECT + CTA ────────────────────────────────── */}
        <section className="pb-16 flex flex-wrap gap-5">
          {nextProject && (
            <Link href={`/portfolio/${nextProject.slug}`} className="flex-1 min-w-[260px] basis-[380px] bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[24px] p-9 transition-colors group">
              <span className="text-[13px] text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-1">Next project <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" /></span>
              <p className="font-heading text-2xl font-bold text-brand-dark dark:text-white mt-2 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">
                {nextProject.client || nextProject.title}
              </p>
            </Link>
          )}
          <div className="flex-1 min-w-[260px] basis-[380px] bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark rounded-[24px] p-9 flex flex-col gap-4 justify-center">
            <p className="font-heading text-2xl font-bold leading-tight">Want the same for your business?</p>
            <CtaButton href="/contact-us" className="on-dark-surface self-start">Get a free quote</CtaButton>
          </div>
        </section>
      </div>
    </article>
  );
}
