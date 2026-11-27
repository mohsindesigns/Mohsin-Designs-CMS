"use client";

import { useMemo, useState } from "react";
import Link from "@/components/ui/Link";
import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import AccentHighlight from "@/components/ui/AccentHighlight";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Briefcase, Quote, Star } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import type { PortfolioCard } from "@/lib/portfolio-public";

interface PortfolioTemplateProps {
  pageData?: any;
}

function resolveButton(raw: any, defLabel: string, defHref: string) {
  if (!raw) return { label: defLabel, href: defHref };
  const label = String(raw.label ?? defLabel).trim();
  return { label, href: (typeof raw.href === "string" && raw.href.trim()) || defHref };
}

export default function PortfolioTemplate({ pageData }: PortfolioTemplateProps) {
  const [activeService, setActiveService] = useState("all");
  const content = useContent();

  const rawData = pageData?.content?.portfolioPage || pageData?.content || {};
  const items: PortfolioCard[] = Array.isArray(pageData?.items) ? pageData.items : [];

  const hero = {
    enabled: rawData.hero?.enabled !== false,
    eyebrow: rawData.hero?.eyebrow || "OUR WORK · REAL RESULTS",
    titleLine1: rawData.hero?.titleLine1 || "Work that moves",
    titleHighlight: rawData.hero?.titleHighlight || "the numbers.",
    description: rawData.hero?.description || "Every project below shows the problem, what we did, and the result it delivered. Filter by the service you need.",
    stat1Value: rawData.hero?.stat1Value || "3,000+",
    stat1Label: rawData.hero?.stat1Label || "US businesses served",
    stat2Value: rawData.hero?.stat2Value || String(items.length || 0),
    stat2Label: rawData.hero?.stat2Label || "Projects delivered",
    stat3Value: rawData.hero?.stat3Value || "300%",
    stat3Label: rawData.hero?.stat3Label || "more customer interaction for a client in 6 months",
  };

  const featuredPanel = {
    enabled: rawData.featuredPanel?.enabled !== false,
    eyebrow: rawData.featuredPanel?.eyebrow || "FEATURED CASE STUDY",
    buttonLabel: rawData.featuredPanel?.buttonLabel || "See the full story",
  };

  const testimonialsConf = {
    enabled: rawData.testimonials?.enabled !== false,
    title: rawData.testimonials?.title || "What clients say",
    items: Array.isArray(rawData.testimonials?.items) ? rawData.testimonials.items.filter((t: any) => t?.quote?.trim()) : [],
  };

  const ctaBanner = {
    enabled: rawData.ctaBanner?.enabled !== false,
    titleIntro: rawData.ctaBanner?.titleIntro || "Want results like these?",
    titleLine2: rawData.ctaBanner?.titleLine2 || "Let's build",
    titleHighlight: rawData.ctaBanner?.titleHighlight || "something you're proud of.",
    description: rawData.ctaBanner?.description || "Tell us about your project and we'll put together a plan to get you there.",
    ctaPrimary: resolveButton(rawData.ctaBanner?.ctaPrimary, "Get a free quote", "/contact-us"),
    ctaSecondary: resolveButton(rawData.ctaBanner?.ctaSecondary, "Schedule a consultation", "/contact-us"),
  };

  // Real services catalog (never hardcoded) -> only services with >=1 published, linked item.
  const serviceFilters = useMemo(() => {
    const catalog: any[] = Array.isArray(content?.globalServices) ? content.globalServices : [];
    const byId = new Map(catalog.map((s: any) => [String(s.id || s._id), String(s.title || s.name || "")]));
    const counts = new Map<string, number>();
    items.forEach((item) => {
      (item.services || []).forEach((sid) => {
        if (!byId.has(sid)) return;
        counts.set(sid, (counts.get(sid) || 0) + 1);
      });
    });
    return [...counts.entries()]
      .map(([id, count]) => ({ id, title: byId.get(id) || "Service", count }))
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title));
  }, [content?.globalServices, items]);

  const filteredItems = useMemo(() => {
    if (activeService === "all") return items;
    return items.filter((item) => (item.services || []).includes(activeService));
  }, [items, activeService]);

  const featuredItem = items.find((i) => i.featured) || null;

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-6">
      {/* ── 1. HERO + STATS ───────────────────────────────────── */}
      {hero.enabled && (
        <section className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[220px] pb-10 md:pb-14 border-b border-brand-zinc-200 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
            <PageBreadcrumbs className="mb-5" items={[{ name: "Home", url: "/" }, { name: "Portfolio", url: "/portfolio/" }]} />
            <div className="flex flex-wrap items-end gap-10 lg:gap-16">
              <div className="flex-1 min-w-[280px] max-w-2xl space-y-5">
                {hero.eyebrow.trim() && (
                  <span className="eyebrow-pill select-none shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-current text-current shrink-0" />
                    {hero.eyebrow}
                  </span>
                )}
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-[64px] font-extrabold leading-[1.02] tracking-tight text-brand-dark dark:text-white">
                  {hero.titleLine1} <br />
                  <AccentHighlight className="text-brand-blue dark:text-brand-yellow pb-1">{hero.titleHighlight}</AccentHighlight>
                </h1>
                <RichTextRenderer content={hero.description} className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-lg" />
              </div>

              <div className="flex-1 min-w-[280px] max-w-[460px] grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white">{hero.stat1Value}</p>
                  <p className="text-xs text-brand-zinc-500 dark:text-zinc-400 mt-1">{hero.stat1Label}</p>
                </div>
                <div className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-2xl p-5 shadow-sm">
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white">{hero.stat2Value}</p>
                  <p className="text-xs text-brand-zinc-500 dark:text-zinc-400 mt-1">{hero.stat2Label}</p>
                </div>
                <div className="col-span-2 bg-brand-dark dark:bg-[#12121e] border border-white/10 rounded-2xl p-5 shadow-sm">
                  <p className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-yellow">{hero.stat3Value}</p>
                  <p className="text-xs text-zinc-300 mt-1">{hero.stat3Label}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-8 pb-4">
        {/* ── 2. FILTER BAR (built from the real services catalog) ──────── */}
        {serviceFilters.length > 0 && (
          <div className="mb-8 border-t border-b border-brand-zinc-200 dark:border-white/10 py-5">
            <div role="group" aria-label="Filter case studies by service" className="flex flex-wrap gap-2">
              {[{ id: "all", title: "All", count: items.length }, ...serviceFilters].map((s) => {
                const active = activeService === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setActiveService(s.id)}
                    className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-mono font-black uppercase tracking-wider transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue dark:focus-visible:outline-brand-yellow ${
                      active
                        ? "bg-brand-blue border-brand-blue text-white dark:bg-brand-yellow dark:border-brand-yellow dark:text-brand-dark"
                        : "bg-white dark:bg-[#12121e] border-brand-zinc-200 dark:border-white/10 text-brand-zinc-600 dark:text-zinc-300 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60"
                    }`}
                  >
                    {s.title}
                    <span className={active ? "opacity-80" : "text-brand-zinc-500 dark:text-zinc-400"}>{s.count}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-brand-zinc-500 dark:text-zinc-400" role="status" aria-live="polite">
              Showing {filteredItems.length} project{filteredItems.length === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {/* ── 3. PROJECT GRID (directly under the filter bar) ───────────── */}
        <section aria-labelledby="portfolio-grid-heading" className="mb-16">
          <h2 id="portfolio-grid-heading" className="sr-only">Case studies</h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeService}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
            >
              {filteredItems.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.slug}`}
                  className="group flex flex-col justify-between bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 rounded-[28px] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-400 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue dark:focus-visible:outline-brand-yellow"
                >
                  <div>
                    <div className="relative h-[200px] w-full overflow-hidden bg-brand-light dark:bg-zinc-950 border-b border-brand-zinc-200/80 dark:border-white/10">
                      {project.thumbnail ? (
                        <img
                          src={project.thumbnail}
                          alt={project.thumbnailLabel || project.title}
                          loading="lazy"
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-brand-blue/10 to-brand-blue/[0.03] dark:from-brand-yellow/10 dark:to-transparent">
                          <Briefcase className="h-9 w-9 text-brand-blue/40 dark:text-brand-yellow/40" aria-hidden="true" />
                        </div>
                      )}
                      {project.thumbnailLabel && (
                        <span className="absolute bottom-3 left-3 rounded-lg bg-white/90 dark:bg-black/70 px-2.5 py-1 text-[12px] font-semibold text-brand-dark dark:text-white">
                          {project.thumbnailLabel}
                        </span>
                      )}
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-2 text-[11px] font-mono font-bold uppercase tracking-wide">
                        {project.industry && <span className="text-brand-zinc-500 dark:text-zinc-400">{project.industry}</span>}
                      </div>
                      <h3 className="font-heading text-xl font-black text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors leading-snug">
                        {project.client || project.title}
                      </h3>
                      {project.summary && (
                        <p className="text-sm text-brand-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-3">{project.summary}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    {project.metrics.length > 0 && (
                      <div className="grid grid-cols-3 gap-2 border-t border-brand-zinc-150 dark:border-white/10 pt-3.5 mb-3">
                        {project.metrics.map((m, i) => (
                          <div key={i}>
                            <p className="font-heading text-base font-bold text-brand-dark dark:text-white">{m.value}</p>
                            <p className="text-[11px] text-brand-zinc-500 dark:text-zinc-400 leading-tight">{m.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue dark:text-brand-yellow">
                      Read case study
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </motion.div>
          </AnimatePresence>

          {filteredItems.length === 0 && (
            <div className="text-center py-20 bg-zinc-50 dark:bg-zinc-900/40 rounded-[28px] border border-dashed border-brand-zinc-300 dark:border-white/10">
              <Briefcase className="w-10 h-10 text-brand-zinc-400 mx-auto mb-3" />
              <p className="text-lg font-bold text-brand-dark dark:text-white">No matching projects</p>
              <p className="text-sm text-brand-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-1">Try a different service filter.</p>
            </div>
          )}
        </section>

        {/* ── 4. FEATURED CASE STUDY PANEL ────────────────────────────── */}
        {featuredPanel.enabled && featuredItem && (
          <section className="mb-16">
            <div className="bg-brand-dark dark:bg-[#12121e] border border-white/10 rounded-[28px] p-8 sm:p-14 flex flex-wrap items-center gap-10">
              <div className="flex-1 min-w-[280px] space-y-5">
                <span className="text-xs font-mono font-black uppercase tracking-widest text-brand-yellow">{featuredPanel.eyebrow}</span>
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                  {featuredItem.client || featuredItem.title}: {featuredItem.summary}
                </h2>
                <CtaButton href={`/portfolio/${featuredItem.slug}`} className="!mt-6">{featuredPanel.buttonLabel}</CtaButton>
              </div>
              {featuredItem.metrics.length > 0 && (
                <div className="flex-1 min-w-[260px] grid grid-cols-3 gap-3">
                  {featuredItem.metrics.map((m, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
                      <p className="font-heading text-2xl font-extrabold text-brand-yellow">{m.value}</p>
                      <p className="text-[11px] text-zinc-300 mt-1 leading-tight">{m.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── 5. TESTIMONIALS ─────────────────────────────────────────── */}
        {testimonialsConf.enabled && testimonialsConf.items.length > 0 && (
          <section className="mb-16">
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mb-7">{testimonialsConf.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonialsConf.items.map((t: any, i: number) => (
                <figure key={i} className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[20px] p-7">
                  <Quote className="h-5 w-5 text-brand-blue/40 dark:text-brand-yellow/40 mb-3" aria-hidden="true" />
                  <blockquote className="text-sm text-brand-zinc-700 dark:text-zinc-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-4 text-sm text-brand-zinc-500 dark:text-zinc-400">
                    <span className="font-bold text-brand-dark dark:text-white">{t.name}</span>
                    {t.role && <> · {t.role}</>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        )}

        {/* ── 6. CTA BAND ──────────────────────────────────────────────── */}
        {ctaBanner.enabled && (
          <section className="relative overflow-hidden mb-6">
            <div className="cta-banner-card">
              <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14">
                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                  {ctaBanner.titleIntro} <br className="hidden sm:block" />
                  <span className="inline-block">
                    {ctaBanner.titleLine2}{" "}
                    <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                      {ctaBanner.titleHighlight}
                    </AccentHighlight>
                  </span>
                </h2>
                <RichTextRenderer content={ctaBanner.description} className="text-sm sm:text-base font-sans text-white/90 leading-relaxed max-w-lg" />
                <div className="flex items-center gap-4 flex-wrap pt-2">
                  {ctaBanner.ctaPrimary.label && <CtaButton href={ctaBanner.ctaPrimary.href}>{ctaBanner.ctaPrimary.label}</CtaButton>}
                  {ctaBanner.ctaSecondary.label && <CtaButton href={ctaBanner.ctaSecondary.href} variant="secondary">{ctaBanner.ctaSecondary.label}</CtaButton>}
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
