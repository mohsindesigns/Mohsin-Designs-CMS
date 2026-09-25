"use client";

import CtaButton from "@/components/ui/CtaButton";
import { withTrailingSlash } from "@/lib/url";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import Link from "@/components/ui/Link";
import {
  MapPin, CheckCircle, Map, ShieldCheck, Clock, Award, Check, Navigation,
  Building, Compass, ArrowRight, Zap, Star,
  Home, Layout, TreePine, Building2, Droplets, BadgeCheck, TrendingUp, Users,
  Phone, Calendar, ClipboardCheck, Hammer, Sparkles, Globe, ShieldAlert,
  Wrench, PencilRuler, Flame, AlertTriangle, FileCheck2, FileText, Layers, RefreshCw,
  Clipboard, ClipboardList
} from "lucide-react";
import RichTextRenderer from "../ui/RichTextRenderer";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import dynamic from "next/dynamic";
import { parseMapEmbed } from "@/lib/mapEmbed";
import { isSafeHref } from "@/lib/utils";
import { BASE_URL } from "@/lib/constants";
import { SERVICE_AREA_DEFAULTS as D, SERVICE_AREA_DEFAULT_ICONS, isQuoteAnchor } from "@/lib/serviceAreaDefaults";

const QuickQuote = dynamic(() => import("@/components/QuickQuote"), { ssr: false });
const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });

// Every icon name ServiceAreaEditor's picker offers (AVAILABLE_ICONS) must resolve here,
// otherwise the admin's choice silently falls back to a different icon.
const iconMap: Record<string, any> = {
  Home, Layout, TreePine, Building2, Building, Droplets,
  Shield: ShieldCheck, ShieldCheck, Award, Clock, BadgeCheck, TrendingUp, Star, Users,
  ClipboardCheck, ClipboardList, Hammer, Sparkles, Clipboard, ShieldAlert, Flame, PencilRuler, Wrench
};

interface Region {
  name: string;
  cities?: string[] | string;
  zipcodes?: string[] | string;
  description?: string;
}

// ---- small pure helpers -------------------------------------------------------------
const isRecord = (v: any) => !!v && typeof v === "object" && !Array.isArray(v);

// Admin-saved section laid over the built-in defaults. Only `undefined` falls back, so a
// field the admin deliberately cleared ("") stays blank (and its element is hidden)
// instead of resurrecting demo copy.
function mergeSection(saved: any, defaults: Record<string, any>): any {
  if (!isRecord(saved)) return { ...defaults };
  const out: any = { ...defaults };
  for (const k of Object.keys(saved)) if (saved[k] !== undefined) out[k] = saved[k];
  return out;
}

// Comma/newline separated text OR an array -> clean string[]
const toList = (v: any): string[] =>
  Array.isArray(v)
    ? v.map((x) => String(x ?? "").trim()).filter(Boolean)
    : typeof v === "string"
      ? v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean)
      : [];

// True when a rich-text value would actually show something (not "" / "<p></p>")
const hasRich = (v: any): boolean => {
  const html = Array.isArray(v) ? v.join("") : v;
  if (typeof html !== "string") return false;
  if (/<(img|iframe|video)\b/i.test(html)) return true;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
};

// Admin-typed link -> a link that is safe to render; blank/unsafe -> fallback
const safeLink = (href: any, fallback = "#contact") => (isSafeHref(href) ? String(href).trim() : fallback);

// 1. Ultra-Premium Service Card Component (Varying top-border colors based on index)
const ServiceCard = ({ service, index }: any) => {
  const title = String(service?.title ?? "");
  const slug = service.slug || title.toLowerCase().replace(/ & /g, '-').replace(/, /g, '-').replace(/ /g, '-');
  const Icon = iconMap[service.icon] || ShieldCheck;
  const href = service.buttonHref ? safeLink(service.buttonHref, `/services/${slug}`) : `/services/${slug}`;

  // Alternating highlight accent bars for visual diversity
  const borderColors = [
"border-t-brand-blue dark:border-t-brand-yellow",
"border-t-amber-500",
"border-t-indigo-650"
  ];
  const activeBorder = borderColors[index % borderColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link href={href} className="block h-full">
        <div className={`relative h-full bg-white dark:bg-[#12121e] border-t-4 ${activeBorder} border-x border-b border-slate-200 dark:border-x-white/10 dark:border-b-white/10 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:border-slate-300 dark:hover:border-x-white/20 dark:hover:border-b-white/20 transition-all duration-300 group-hover:-translate-y-1`}>
          <div className="relative z-10 flex flex-col h-full">
            {/* Styled Icon */}
            <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-blue group-hover:border-brand-blue dark:group-hover:bg-brand-yellow dark:group-hover:border-brand-yellow transition-colors duration-300">
              <Icon className="w-6 h-6 text-brand-blue dark:text-brand-yellow group-hover:text-white dark:group-hover:text-[#080710] transition-colors duration-300" />
            </div>

            {/* Title */}
            {title && (
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors">
                {title}
              </h3>
            )}

            {/* Description - High readability charcoal */}
            <div className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed mb-6 flex-grow">
              <RichTextRenderer content={service.tagline || service.description} />
            </div>

            {/* Feature Badges (editor: "Badges" field; also comes from global service records) */}
            {(() => {
              const badges = (Array.isArray(service.features)
                ? service.features.map((f: any) => (typeof f === 'string' ? f : f?.text))
                : toList(service.features)
              ).filter((f: any) => typeof f === 'string' && f.trim()).slice(0, 3);
              return badges.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-6">
                  {badges.map((f: string, i: number) => (
                    <span key={i} className="text-xs bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full font-bold">
                      {f}
                    </span>
                  ))}
                </div>
              ) : null;
            })()}

            {/* CTA anchor link */}
            <div className="flex items-center gap-2 text-brand-blue dark:text-brand-yellow font-black text-xs uppercase tracking-wider">
              {service.buttonText || "Explore Service"} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ServiceAreaTemplate({ pageData }: { pageData?: any }) {
  const { services: dataRaw } = useContent();
  // Global service catalogue - only used when the page has no hand-picked service cards.
  const services = ((dataRaw as any)?.services || []).filter((s: any) => s.status === 'published' || s.status === undefined);

  // Safely extract content overrides or fallbacks
  const content = pageData?.content || {};

  // ---- Section data: admin content (page.content.*) laid over the built-in defaults ------
  // (see src/lib/serviceAreaDefaults.ts - the editor pre-fills the very same values)
  const hero = mergeSection(content.hero, D.hero);
  // The <h1> must never be empty: fall back to the CMS page title.
  const heroTitle = (typeof hero.headline === "string" && hero.headline.trim()) || pageData?.title || D.hero.headline;
  const bannerImg = typeof hero.image === "string" ? hero.image.trim() : "";
  const heroVisible = hero.enabled !== false;

  const statsList: any[] = (Array.isArray(content.stats) ? content.stats : (D.stats as any[]))
    .filter((s: any) => s && (String(s.value ?? "").trim() || String(s.label ?? "").trim()));
  // Editor toggle key is `statsEnabled` (stats itself is an array, so it cannot carry `.enabled`).
  const statsVisible = content.statsEnabled !== false && statsList.length > 0;
  const statsCols =
    statsList.length >= 4 ? "md:grid-cols-4" : statsList.length === 3 ? "md:grid-cols-3" : statsList.length === 2 ? "md:grid-cols-2" : "md:grid-cols-1";

  const processSteps: any[] = Array.isArray(content.process)
    ? content.process
    : Array.isArray(content.processSteps)
      ? content.processSteps
      : (D.process as any[]);
  const processSection = mergeSection(content.processSection, D.processSection);
  const processVisible = processSection.enabled !== false && processSteps.length > 0;

  const mapData = mergeSection(content.map, D.map);
  // Only https URLs on known map providers are ever embedded (also accepts a pasted
  // <iframe> snippet or a plain place name) - see src/lib/mapEmbed.ts
  const mapSrc = parseMapEmbed(mapData.iframeUrl);
  const mapPhoneDigits = String(mapData.bullet3Text ?? "").replace(/[^0-9+]/g, "");
  const mapPhoneIsNumber = mapPhoneDigits.replace(/\D/g, "").length >= 7;
  const mapBullets = [
    { title: mapData.bullet1Title, text: mapData.bullet1Text, Icon: MapPin, pulse: true, phone: false },
    { title: mapData.bullet2Title, text: mapData.bullet2Text, Icon: Calendar, pulse: false, phone: false },
    { title: mapData.bullet3Title, text: mapData.bullet3Text, Icon: Phone, pulse: false, phone: true },
  ].filter((b) => String(b.title ?? "").trim() || String(b.text ?? "").trim());

  const materialsData = mergeSection(content.materials, D.materials);
  const materialItems: any[] = Array.isArray(materialsData.items) ? materialsData.items : [];
  const materialsVisible = materialsData.enabled !== false && materialItems.length > 0;

  const servicesSection = mergeSection(content.servicesSection, D.servicesSection);
  // Hand-picked cards win; a saved section WITHOUT `items` shows the global catalogue instead.
  const serviceCards: any[] = (
    Array.isArray(content.servicesSection?.items)
      ? content.servicesSection.items
      : isRecord(content.servicesSection)
        ? services.slice(0, 6)
        : (D.servicesSection.items as any[])
  ).filter((s: any) => s && (String(s.title ?? "").trim() || hasRich(s.description) || hasRich(s.tagline)));
  const servicesVisible = servicesSection.enabled !== false && serviceCards.length > 0;

  const regionsSection = mergeSection(content.regionsSection, D.regionsSection);
  const regions: Region[] = (Array.isArray(content.regions) ? content.regions : (D.regions as any[]))
    .filter((r: any) => r && String(r.name ?? "").trim());
  const regionsVisible = regionsSection.enabled !== false && regions.length > 0;
  const regionHasDetails = (r: Region) =>
    hasRich(r.description) || toList(r.cities).length > 0 || toList(r.zipcodes).length > 0;
  // Selected county tile (its communities / zip codes show in the panel under the grid).
  // Opens on the first county that has anything to show.
  const [openRegion, setOpenRegion] = useState<number | null>(() => {
    const first = regions.findIndex(regionHasDetails);
    return first >= 0 ? first : null;
  });
  const activeRegion = openRegion !== null && regions[openRegion] && regionHasDetails(regions[openRegion]) ? regions[openRegion] : null;

  const whyChooseData = mergeSection(content.whyChoose, D.whyChoose);
  const whyItems: any[] = Array.isArray(whyChooseData.items) ? whyChooseData.items : [];
  const whyVisible = whyChooseData.enabled !== false && whyItems.length > 0;

  const overviewData = mergeSection(content.overview, D.overview);
  const overviewImage = typeof overviewData.image === "string" ? overviewData.image.trim() : "";
  const [overviewImgFailed, setOverviewImgFailed] = useState(false);
  const showOverviewImage = !!overviewImage && !overviewImgFailed;

  const cta = mergeSection(content.cta, D.cta);

  // FAQs are edited in the admin's "Page FAQs" tab (content.faqs / faqBadge / faqTitle* /
  // faqDescription / strategyAudit / faqSchemaMarkup); the section toggle is faqSection.enabled.
  const pageFaqs: any[] = (Array.isArray(content.faqs) ? content.faqs : [])
    .filter((f: any) => f && (String(f.question ?? "").trim() || String(f.answer ?? "").trim()));

  // Every "#contact"-style link on the page (hero/overview/CTA buttons, service cards, the FAQ
  // strategy box, links inside rich text) opens the Quick Quote modal. QuickQuote only exposes
  // its own floating trigger - the first <button> it renders - so we click that. If the (lazy)
  // widget has not loaded yet the link falls back to the normal anchor jump to id="contact"
  // (the final CTA section).
  const quoteRef = useRef<HTMLDivElement>(null);
  const handleQuoteAnchorClick = (e: React.MouseEvent<HTMLElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const anchor = (e.target as HTMLElement | null)?.closest?.("a");
    if (!anchor || !isQuoteAnchor(anchor.getAttribute("href"))) return;
    const trigger = quoteRef.current?.querySelector("button");
    if (trigger) {
      e.preventDefault();
      (trigger as HTMLButtonElement).click();
    }
  };

  const pageUrlDisplay = (() => {
    const slug = pageData?.slug?.toString().trim();
    if (!slug) return BASE_URL;

    const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
    if (/^https?:\/\//i.test(normalizedSlug)) return normalizedSlug;

    return `${BASE_URL}/${normalizedSlug}`;
  })();

  return (
    // When the hero is hidden nothing clears the fixed navbar any more, so pad the top.
    <div onClickCapture={handleQuoteAnchorClick} className={`relative bg-slate-50 dark:bg-[#0c0b18] text-slate-900 dark:text-white min-h-screen font-body overflow-x-hidden ${heroVisible ? "" : "pt-24 sm:pt-28"}`}>

      {/* ================= 1. HERO BANNER - 100% PURE WHITE TEXT OVERRIDES ================= */}
      {heroVisible && (
      <section className="relative pt-36 pb-32 sm:pt-44 sm:pb-36 bg-slate-950 overflow-hidden">
        {/* Background Banner Image (optional - the plain dark banner is the fallback; a
            file that fails to load is hidden instead of showing a broken-image icon) */}
        <div className="absolute inset-0 z-0">
          {bannerImg && (
            <img
              src={bannerImg}
              alt={pageData?.title || "Service Area Banner"}
              className="w-full h-full object-cover opacity-35"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          {/* Guaranteed Deep Contrast Mask Overlay */}
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          {/* Breadcrumbs - High Contrast */}
          <PageBreadcrumbs page={pageData} tone="onDark" align="center" className="mb-8" />

          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-heading font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
            {heroTitle}
          </h1>

          {/* Description - FORCED 100% PURE WHITE LEGIBLE TEXT WITH NESTED CSS OVERRIDES */}
          {hasRich(hero.description) && (
            <div className="max-w-3xl mx-auto text-white text-lg sm:text-xl font-normal leading-relaxed [&_*]:!text-white [&_p]:!text-white [&_span]:!text-white [&_strong]:!text-white">
              <RichTextRenderer content={hero.description} />
            </div>
          )}
        </div>
      </section>
      )}

      {/* ================= 2. STATS SECTION ================= */}
      {statsVisible && (
      <section className={`relative z-20 px-6 max-w-7xl mx-auto ${heroVisible ? "-mt-10" : ""}`}>
        <div className={`grid grid-cols-1 ${statsCols} gap-6 md:gap-0 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl text-center`}>
          {statsList.map((stat: any, idx: number) => (
            <div
              key={idx}
              className={`space-y-2 py-4 ${idx < statsList.length - 1 ? 'md:border-r-2 border-slate-200 dark:border-white/10' : ''}`}
            >
              {/* <p>, not <h3>: a stat number is not a heading (h1 -> h3 skipped h2) */}
              <p className="text-4xl sm:text-5xl font-heading font-black text-slate-900 dark:text-white leading-none">
                {stat.value}
              </p>
              {stat.label && (
                <p className="text-xs sm:text-sm font-black text-slate-600 dark:text-zinc-400 uppercase tracking-widest">
                  {stat.label}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
      )}

      {/* ================= VIDEO TESTIMONIALS ================= */}
      {content.videoTestimonials?.enabled !== false && (
      <section id="video-testimonials">
        <VideoTestimonials data={content.videoTestimonials} />
      </section>
      )}

      {/* ================= MAP SECTION - macOS BROWSER DEVICE MOCKUP (Fully Dynamic) ================= */}
      {mapData.enabled !== false && (
      <section className="px-6 max-w-7xl mx-auto section-y">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Side: Local Highlight Details (spans the full row when there is no map to show) */}
          <div className={`${mapSrc ? "lg:col-span-5" : "lg:col-span-12 max-w-3xl mx-auto w-full"} min-w-0 space-y-8`}>
            {(mapData.headline || mapData.title) && (
              <div>
                {mapData.headline && (
                  <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase mb-3 block">{mapData.headline}</span>
                )}
                {mapData.title && (
                  <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                    {mapData.title}
                  </h2>
                )}
                <div className="w-12 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 mt-4 rounded-full" />
              </div>
            )}

            {hasRich(mapData.description) && (
              <div className="text-slate-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-semibold">
                <RichTextRenderer content={mapData.description} />
              </div>
            )}

            {/* List Widgets with custom borders (a block with no title and no text is skipped) */}
            {mapBullets.length > 0 && (
              <div className="space-y-4">
                {mapBullets.map((b, i) => (
                  <div key={i} className="flex items-start gap-4 p-4.5 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm hover:shadow transition-shadow">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow flex items-center justify-center flex-shrink-0">
                      <b.Icon className={`w-5 h-5 ${b.pulse ? "animate-pulse" : ""}`} />
                    </div>
                    <div>
                      {b.title && <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{b.title}</h3>}
                      {b.phone && mapPhoneIsNumber ? (
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold mt-0.5">
                          Call <a href={`tel:${mapPhoneDigits}`} className="font-black text-brand-blue dark:text-brand-yellow hover:underline">{b.text}</a> to request dispatch.
                        </p>
                      ) : b.text ? (
                        <p className="text-xs text-slate-600 dark:text-zinc-400 font-bold mt-0.5">{b.text}</p>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: macOS styled browser mockup frame around map (only when there is a valid embed) */}
          {mapSrc && (
          <div className="lg:col-span-7 min-w-0 w-full bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* macOS Browser Header */}
            <div className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 px-5 py-3.5 flex items-center gap-4">
              {/* Window Controls Dots */}
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>
              {/* Fake URL Bar */}
              <div className="bg-white dark:bg-[#080710] border border-slate-200/80 dark:border-white/10 rounded-lg text-[11px] text-slate-500 dark:text-zinc-400 font-semibold px-4 py-1 flex-1 flex items-center gap-2 select-none shadow-inner min-w-0">
                <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 flex-shrink-0" />
                <span className="truncate">{pageUrlDisplay}</span>
              </div>
            </div>

            {/* Google Map Frame */}
            <div className="h-[400px] w-full relative">
              <iframe
                src={mapSrc}
                title={mapData.title || "Service area map"}
                className="w-full h-full border-none"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
          )}

        </div>
      </section>
      )}

      {/* ================= PROCESS SECTION - DYNAMIC TIMELINE CARDS ================= */}
      {processVisible && (
      <section className="bg-white dark:bg-[#080710] border-y border-slate-200/60 dark:border-white/10 section-y">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            {processSection.headline && (
              <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase mb-3 block">{processSection.headline}</span>
            )}
            {processSection.title && (
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                {processSection.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {processSteps.map((step: any, pIdx: number) => {
              const defaultIcons = SERVICE_AREA_DEFAULT_ICONS.process;
              const StepIcon = iconMap[step?.icon] || iconMap[defaultIcons[pIdx % defaultIcons.length]] || ClipboardCheck;

              // Alternating dynamic colors for watermark numbers
              const watermarkColors = [
"group-hover:text-brand-blue/10 dark:group-hover:text-brand-yellow/10",
"group-hover:text-amber-500/10 dark:group-hover:text-amber-400/10",
"group-hover:text-indigo-500/10 dark:group-hover:text-indigo-400/10",
"group-hover:text-emerald-500/10 dark:group-hover:text-emerald-400/10"
              ];
              const activeColor = watermarkColors[pIdx % watermarkColors.length];

              return (
                <div
                  key={pIdx}
                  className="bg-slate-50 dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-3xl p-8 relative overflow-hidden group hover:border-brand-blue/40 dark:hover:border-brand-yellow/40 hover:shadow-xl transition-all duration-300"
                >
                  {/* Distinct Color Watermark Numbers */}
                  <span className={`text-6xl font-black text-slate-200/50 dark:text-white/[0.05] ${activeColor} transition-colors absolute -right-2 -bottom-2 z-0 select-none`}>
                    {String(pIdx + 1).padStart(2, '0')}
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow flex items-center justify-center mb-6">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    {step?.title && (
                      <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white">
                        {step.title}
                      </h3>
                    )}
                    {hasRich(step?.description) && (
                      <div className="text-slate-600 dark:text-zinc-300 text-sm leading-relaxed font-semibold">
                        <RichTextRenderer content={step.description} />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>
      )}

      {/* ================= PREMIUM MATERIALS WE INSTALL (Fully Dynamic) ================= */}
      {materialsVisible && (
      <section className="bg-slate-50 dark:bg-[#0c0b18] section-y">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            {materialsData.headline && (
              <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase mb-3 block">{materialsData.headline}</span>
            )}
            {materialsData.title && (
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                {materialsData.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {materialItems.map((item: any, mIdx: number) => {
              // Dynamic themed details based on item index
              const materialIcons = SERVICE_AREA_DEFAULT_ICONS.materials;
              const MaterialIcon = iconMap[item?.icon] || iconMap[materialIcons[mIdx % materialIcons.length]] || Building;

              const cardClasses = [
"border-t-amber-500 hover:border-amber-300 dark:hover:border-x-amber-400/40 dark:hover:border-b-amber-400/40 hover:shadow-2xl",
"border-t-indigo-600 hover:border-indigo-300 dark:hover:border-x-indigo-400/40 dark:hover:border-b-indigo-400/40 hover:shadow-2xl",
"border-t-emerald-600 hover:border-emerald-300 dark:hover:border-x-emerald-400/40 dark:hover:border-b-emerald-400/40 hover:shadow-2xl",
"border-t-sky-500 hover:border-sky-300 dark:hover:border-x-sky-400/40 dark:hover:border-b-sky-400/40 hover:shadow-2xl"
              ];
              const activeCardClass = cardClasses[mIdx % cardClasses.length];

              const iconClasses = [
"bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white",
"bg-indigo-50 text-indigo-650 border border-indigo-105 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 group-hover:bg-indigo-600 group-hover:text-white",
"bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 group-hover:bg-emerald-600 group-hover:text-white",
"bg-sky-50 text-sky-600 border border-sky-100 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20 group-hover:bg-sky-500 group-hover:text-white"
              ];
              const activeIconClass = iconClasses[mIdx % iconClasses.length];

              const textColors = [
"group-hover:text-amber-600 dark:group-hover:text-amber-400",
"group-hover:text-indigo-600 dark:group-hover:text-indigo-400",
"group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
"group-hover:text-sky-550 dark:group-hover:text-sky-400"
              ];
              const activeTextColor = textColors[mIdx % textColors.length];

              return (
                <div key={mIdx} className={`bg-white dark:bg-[#12121e] border-t-4 ${activeCardClass} border-x border-b border-slate-200 dark:border-x-white/10 dark:border-b-white/10 rounded-3xl p-8 shadow-sm transition-all duration-355 flex flex-col h-full group`}>
                  <div className={`w-12 h-12 rounded-2xl ${activeIconClass} flex items-center justify-center mb-6 transition-colors duration-300`}>
                    <MaterialIcon className="w-6 h-6" />
                  </div>
                  {item?.title && (
                    <h3 className={`font-heading font-bold text-xl text-slate-900 dark:text-white mb-3 ${activeTextColor} transition-colors`}>
                      {item.title}
                    </h3>
                  )}
                  <div className="text-slate-600 dark:text-zinc-300 text-xs sm:text-sm leading-relaxed font-semibold flex-grow">
                    <RichTextRenderer content={item?.description} />
                  </div>
                  {item?.buttonLabel && item?.buttonHref && (
                    <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10">
                      <Link
                        href={safeLink(item.buttonHref)}
                        className="inline-flex items-center gap-2 text-brand-blue dark:text-brand-yellow font-black text-xs uppercase tracking-wider hover:gap-3 transition-all duration-200"
                      >
                        {item.buttonLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        </div>
      </section>
      )}

      {/* ================= COMMUNITY COUNTY TILES (select a county -> its communities / zip codes) ================= */}
      {regionsVisible && (
      <section className="px-6 max-w-7xl mx-auto section-y">
        {(regionsSection.title || hasRich(regionsSection.description)) && (
          <div className="text-center mb-12">
            {regionsSection.title && (
              <h2 className="text-2xl sm:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-4">
                {regionsSection.title}
              </h2>
            )}
            {hasRich(regionsSection.description) && (
              <div className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base max-w-lg mx-auto font-semibold">
                <RichTextRenderer content={regionsSection.description} />
              </div>
            )}
          </div>
        )}

        {/* Regions grid - folder structure. A county that has communities / zip codes / a
            description (Regions tab in the editor) is a button that opens the panel below. */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {regions.map((region, idx) => {
            const clickable = regionHasDetails(region);
            const isActive = clickable && openRegion === idx;
            const tileClass = `relative overflow-hidden rounded-2xl border bg-white dark:bg-[#12121e] px-5 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-brand-blue/30 dark:hover:border-brand-yellow/30 hover:shadow-lg ${
              isActive
                ? "border-brand-blue/50 dark:border-brand-yellow/50 shadow-lg"
                : "border-slate-200 dark:border-white/10"
            }`;
            const accentBar = (
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-blue/80 to-brand-blue dark:from-brand-yellow/80 dark:to-brand-yellow transition-opacity duration-300 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            );
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.03 }}
                className="group"
              >
                {clickable ? (
                  <button
                    type="button"
                    onClick={() => setOpenRegion(isActive ? null : idx)}
                    aria-expanded={isActive}
                    aria-controls="service-area-region-panel"
                    className={`${tileClass} w-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:focus-visible:ring-brand-yellow`}
                  >
                    {accentBar}
                    <span className="block font-heading font-bold text-slate-900 dark:text-white text-base tracking-tight">
                      {region.name}
                    </span>
                  </button>
                ) : (
                  <div className={tileClass}>
                    {accentBar}
                    <h3 className="font-heading font-bold text-slate-900 dark:text-white text-base tracking-tight">
                      {region.name}
                    </h3>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected county: description + communities + zip codes */}
        {activeRegion && (
          <div
            id="service-area-region-panel"
            role="region"
            aria-label={`${activeRegion.name} coverage`}
            className="mt-8 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-sm"
          >
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 dark:text-white mb-4">
              {activeRegion.name}
            </h3>
            {hasRich(activeRegion.description) && (
              <div className="text-slate-600 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-semibold mb-6">
                <RichTextRenderer content={activeRegion.description as string} />
              </div>
            )}
            {toList(activeRegion.cities).length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-3">Communities We Serve</p>
                <ul className="flex flex-wrap gap-2">
                  {toList(activeRegion.cities).map((city, i) => (
                    <li key={`${city}-${i}`} className="text-xs sm:text-sm bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full font-bold">
                      {city}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {toList(activeRegion.zipcodes).length > 0 && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow mb-3">Zip Codes</p>
                <ul className="flex flex-wrap gap-2">
                  {toList(activeRegion.zipcodes).map((zip, i) => (
                    <li key={`${zip}-${i}`} className="text-xs sm:text-sm font-mono bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-white/10 px-3 py-1 rounded-full font-bold">
                      {zip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
      )}

      {/* ================= 3. ACTIVE SERVICE CARDS ================= */}
      {servicesVisible && (
      <section className="bg-white dark:bg-[#080710] border-y border-slate-200/60 dark:border-white/10 section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            {servicesSection.headline && (
              <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase mb-3 block">{servicesSection.headline}</span>
            )}
            {servicesSection.title && (
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                {servicesSection.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {serviceCards.map((service: any, index: number) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* ================= WHY CHOOSE US - (Middle Card Highlighted in Premium Dark-Slate) (Fully Dynamic) ================= */}
      {whyVisible && (
      <section className="bg-slate-50 dark:bg-[#0c0b18] section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            {whyChooseData.headline && (
              <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase mb-3 block">{whyChooseData.headline}</span>
            )}
            {whyChooseData.title && (
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">
                {whyChooseData.title}
              </h2>
            )}
            <div className="w-16 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {whyItems.map((item: any, wIdx: number) => {
              const chooseIcons = SERVICE_AREA_DEFAULT_ICONS.whyChoose;
              const ChooseIcon = iconMap[item?.icon] || iconMap[chooseIcons[wIdx % chooseIcons.length]] || ShieldCheck;

              if (wIdx === 1) {
                // Highlighted centerpiece dark-slate card
                return (
                  <div key={wIdx} className="on-dark-surface flex flex-col items-center text-center p-10 bg-slate-900 text-white rounded-3xl shadow-2xl relative scale-105 border-2 border-brand-blue/40 dark:border-brand-yellow/40 group hover:border-brand-blue dark:hover:border-brand-yellow transition-all duration-300 z-10">
                    {whyChooseData.featuredBadge && (
                      <div className="absolute top-4 right-4 bg-brand-blue dark:bg-brand-yellow text-white dark:text-[#080710] text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                        {whyChooseData.featuredBadge}
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-2xl bg-brand-blue dark:bg-brand-yellow text-white dark:text-[#080710] flex items-center justify-center mb-8 shadow-lg group-hover:scale-105 transition-transform">
                      <ChooseIcon className="w-8 h-8 animate-pulse" />
                    </div>
                    {item?.title && <h3 className="font-heading font-black text-2xl text-white mb-4">{item.title}</h3>}
                    <RichTextRenderer
                      content={item?.description}
                      className="text-sm text-white leading-relaxed font-bold"
                    />
                  </div>
                );
              }

              // Standard white card
              return (
                <div key={wIdx} className="flex flex-col items-center text-center p-8 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm relative group hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform">
                    <ChooseIcon className="w-7 h-7" />
                  </div>
                  {item?.title && <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white mb-3">{item.title}</h3>}
                  <div className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed font-semibold">
                    <RichTextRenderer content={item?.description} />
                  </div>
                </div>
              );
            })}

          </div>
        </div>
      </section>
      )}

      {/* ================= DYNAMIC OVERVIEW SECTION (Heading left, Image right) ================= */}
      {overviewData.enabled !== false && (
      <section className="bg-white dark:bg-[#080710] border-y border-slate-200/60 dark:border-white/10 section-y">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Side: Overview Details & CTA (full width when there is no image) */}
            <div className={`${showOverviewImage ? "lg:col-span-6" : "lg:col-span-12 max-w-3xl"} min-w-0 space-y-6`}>
              {overviewData.headline && (
                <span className="text-brand-blue dark:text-brand-yellow text-xs font-bold tracking-widest uppercase block">{overviewData.headline}</span>
              )}
              {overviewData.title && (
                <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {overviewData.title}
                </h2>
              )}
              <div className="w-16 h-0.5 bg-brand-blue/60 dark:bg-brand-yellow/60 rounded-full" />

              {hasRich(overviewData.description) && (
                <div className="text-slate-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed font-semibold [&_p]:!text-slate-700 dark:[&_p]:!text-zinc-300 [&_p]:!font-semibold [&_span]:!text-slate-700 dark:[&_span]:!text-zinc-300 [&_p]:!leading-relaxed">
                  <RichTextRenderer content={overviewData.description} />
                </div>
              )}

              {overviewData.buttonText && (
                <div className="pt-4">
                  <CtaButton href={safeLink(overviewData.buttonHref)}>{overviewData.buttonText}</CtaButton>
                </div>
              )}
            </div>

            {/* Right Side: Showcase Illustration Image (optional; hidden if blank or it fails to load) */}
            {showOverviewImage && (
              <div className="lg:col-span-6 min-w-0">
                <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/80 dark:border-white/10 group">
                  <img
                    src={overviewImage}
                    alt={overviewData.title || pageData?.title || ""}
                    loading="lazy"
                    decoding="async"
                    onError={() => setOverviewImgFailed(true)}
                    className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
                </div>
              </div>
            )}

          </div>
        </div>
      </section>
      )}

      {/* ================= FAQ SECTION ================= */}
      {content.faqSection?.enabled !== false && (
      <section className="bg-white dark:bg-[#080710]">
        {/* Same wiring TemplateWrapper / HomeTemplate use for a page's own FAQ tab: the page
            content is the FAQ data source (badge, title, description, strategy box, items),
            falling back to the global FAQ list when the page has none of its own. */}
        <PageInlineFaqs
          data={{ ...content, faqs: pageFaqs }}
          faqs={pageFaqs.length > 0 ? pageFaqs : undefined}
          faqSchemaMarkup={content.faqSchemaMarkup}
          badge={content.faqBadge}
          title={content.faqTitleHighlight || content.faqTitle}
          description={content.faqDescription}
        />
      </section>
      )}

      {/* ================= FINAL CTA SECTION (id="contact" is the target of every "#contact" button) ================= */}
      {cta.enabled !== false && (
      <section id="contact" className="px-6 max-w-5xl mx-auto section-y scroll-mt-24">
        <div className="on-dark-surface relative bg-slate-950 rounded-[2rem] p-10 sm:p-16 text-center border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/20 dark:from-brand-yellow/20 via-transparent to-brand-blue/10 dark:to-brand-yellow/10 opacity-70" />
          </div>

          <div className="relative z-10 space-y-6">
            {cta.headline && (
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
                {cta.headline}
              </h2>
            )}
            {hasRich(cta.description) && (
              <RichTextRenderer
                content={cta.description}
                className="text-white text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium"
              />
            )}
            {cta.buttonText && (
              <CtaButton href={safeLink(cta.buttonHref)}>{cta.buttonText}</CtaButton>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Floating Quick Quote widget. The wrapper lets "#contact" buttons open its modal. */}
      <div ref={quoteRef}>
        <QuickQuote />
      </div>

    </div>
  );
}
