"use client";

import CtaButton from "@/components/ui/CtaButton";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { motion } from "framer-motion";
import { useMemo, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "@/components/ui/Link";
import { getValidHref } from "@/lib/utils";
// Every icon the admin's IconSelector can pick is a lucide icon, so resolve names
// dynamically (same approach as the other templates) instead of a hand-maintained
// 27-icon map that silently fell back to a default for everything else.
import * as LucideIcons from "lucide-react";
import {
  ArrowRight,
  Play,
  Palette,
  Code,
  ShoppingCart,
  Star,
  Search,
  Globe,
  Target
} from "lucide-react";
import { useContent } from "@/hooks/useContent";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";

const VideoTestimonials = dynamic(() => import("@/components/sections/VideoTestimonials"), { ssr: false });

// Resolves a lucide icon by the name stored in the CMS ("Monitor", "MousePointerClick", ...),
// tolerating a lower-case first letter; anything unknown falls back to `fallback`.
const getIcon = (name?: string, fallback: any = Globe): any => {
  if (!name || typeof name !== "string") return fallback;
  const icons = LucideIcons as any;
  const Comp = icons[name] || icons[name.charAt(0).toUpperCase() + name.slice(1)];
  return Comp && (typeof Comp === "function" || (typeof Comp === "object" && Comp.$$typeof)) ? Comp : fallback;
};

// NOTE on headings: an "Intro" + accent-phrase heading is stored as two fields. The stored intro
// rarely carries a trailing space (an admin can't see one in the input), which used to glue the
// words together ("...WithZero Fluff"). Every such heading below therefore renders an explicit
// {" "} between the two parts; HTML collapses a doubled space, so old data with a trailing space
// is unaffected.

// The site's canonical contact page; the navbar's own CTA link wins when the admin set one.
const DEFAULT_CONTACT_HREF = "/contact-us";

const TickerDigit = ({ digit }: { digit: number }) => {
  const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <span
      className="relative inline-block overflow-hidden select-none"
      style={{
        width: "0.58em",
        height: "1em"
      }}
    >
      <motion.span
        className="absolute left-0 top-0 flex flex-col w-full"
        initial={{ y: 0 }}
        whileInView={{ y: `-${digit}em` }}
        viewport={{ once: true }}
        transition={{
          type: "spring",
          stiffness: 45,
          damping: 12,
          mass: 0.8,
          delay: 0.1
        }}
      >
        {numbers.map((num) => (
          <span
            key={num}
            className="flex items-center justify-center leading-none bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-500 dark:from-brand-yellow dark:to-amber-400"
            style={{
              height: "1em",
              WebkitBackgroundClip: "text"
            }}
          >
            {num}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

const DigitTicker = ({ value }: { value: number }) => {
  const shown = value || 0;
  const digits = String(shown).split("");
  return (
    <>
    <span className="sr-only">{shown}</span>
    <span className="inline-flex items-baseline" aria-hidden="true">
      {digits.map((digit, idx) => {
        if (isNaN(Number(digit))) {
          return (
            <span
              key={idx}
              className="leading-none bg-clip-text text-transparent bg-gradient-to-r from-brand-blue to-blue-500 dark:from-brand-yellow dark:to-amber-400"
              style={{ WebkitBackgroundClip: "text" }}
            >
              {digit}
            </span>
          );
        }
        return <TickerDigit key={idx} digit={Number(digit)} />;
      })}
    </span>
    </>
  );
};

// Shows the WHOLE image whatever its shape: the sharp image is contained (never cropped)
// on top of a blurred copy of itself, so there are no empty bars either.
// Parent must be `relative` + `overflow-hidden` with a fixed height/aspect.
const FullImage = ({ src, alt, className = "" }: { src: string; alt?: string; className?: string }) => (
  <>
    <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full scale-110 object-cover opacity-70 blur-2xl pointer-events-none" />
    <img src={src} alt={alt || ""} loading="lazy" decoding="async" className={`relative h-full w-full object-contain ${className}`} />
  </>
);

export default function NewAboutTemplate({ pageData }: { pageData?: any; params?: any }) {
  const content = useContent();
  // The page document's own content is the source. `content.newAboutPage` is a legacy SiteContent
  // fallback that nothing writes any more (kept so an old install still renders).
  const rawAbout = pageData?.content || content?.newAboutPage || {};

  // Safely extract all 11 sections
  const hero = rawAbout.hero || {};
  const stats = rawAbout.stats || {};
  const whoWeAre = rawAbout.whoWeAre || {};
  const philosophy = rawAbout.philosophy || {};
  const servicesDirectory = rawAbout.servicesDirectory || {};
  const methodology = rawAbout.methodology || {};
  const domainExpertise = rawAbout.domainExpertise || {};
  const whyChooseUs = rawAbout.whyChooseUs || {};
  const executiveLeadership = rawAbout.executiveLeadership || {};
  const reviews = rawAbout.reviews || {};
  const ctaBanner = rawAbout.ctaBanner || {};

  const allMasterServices = Array.isArray(content?.services?.services)
    ? content.services.services
    : (Array.isArray(content?.services)
      ? content.services
      : (Array.isArray((content as any)?.globalServices)
        ? (content as any).globalServices
        : (Array.isArray(content?.services?.list) ? content.services.list : [])));

  const rawStages = Array.isArray(servicesDirectory.stages) && servicesDirectory.stages.length > 0
    ? servicesDirectory.stages
    : (Array.isArray(servicesDirectory.selectedServices) ? servicesDirectory.selectedServices : []);

  // Stages are the services picked in the editor. The editor stores a per-page SNAPSHOT of each
  // service, but the admin can't edit that snapshot anywhere, so the LIVE catalog entry wins
  // (rename/re-image/re-describe a service in the Services admin and this page follows) and the
  // snapshot is only the fallback for a service that has since left the catalog. Drafts and
  // trashed services are skipped: their /services/<slug>/ page 404s.
  const stagesList = useMemo(() => {
    const firstText = (...vals: any[]): string => {
      for (const v of vals) if (typeof v === "string" && v.trim()) return v;
      return "";
    };
    const pickImage = (o: any) => firstText(o?.image, o?.hero?.bgImage, o?.hero?.backgroundImage, o?.deepDive?.image, o?.overviewImage, o?.caseStudy?.image);
    const pickDesc = (o: any) => firstText(o?.desc, o?.description, o?.hero?.description, o?.tagline, o?.shortDescription, o?.deepDive?.desc);
    const pickList = (o: any): any[] => {
      if (Array.isArray(o?.deliverables) && o.deliverables.length > 0) return o.deliverables;
      if (Array.isArray(o?.hero?.benefits) && o.hero.benefits.length > 0) return o.hero.benefits;
      if (Array.isArray(o?.features) && o.features.length > 0) return o.features;
      if (Array.isArray(o?.whatIncluded?.pillars)) return o.whatIncluded.pillars.map((p: any) => p?.title || p?.desc).filter(Boolean);
      return [];
    };

    const out: any[] = [];
    rawStages.forEach((item: any) => {
      if (!item || typeof item !== "object") return;
      const matchedMaster = allMasterServices.find((s: any) =>
        (item.serviceId && (s.id === item.serviceId || s._id === item.serviceId)) ||
        (item.slug && s.slug === item.slug) ||
        (item.title && s.title?.toLowerCase() === item.title?.toLowerCase()) ||
        (item.name && (s.title?.toLowerCase() === item.name?.toLowerCase() || s.name?.toLowerCase() === item.name?.toLowerCase()))
      );
      if (matchedMaster && (matchedMaster.status === "draft" || matchedMaster.isTrashed)) return;

      const live: any = matchedMaster || {};
      const full: any = { ...item, ...live };

      const title = firstText(live.title, live.name, item.title, item.name);
      if (!title) return; // nothing meaningful to show for this stage
      const category = (full.category && full.category !== "DIGITAL ENGINEERING")
        ? full.category
        : (full.tag || (full.badge && full.badge !== "CORE CAPABILITY" ? full.badge : "") || "");
      const badge = (full.badge && full.badge !== "CORE CAPABILITY" && full.badge !== category)
        ? full.badge
        : (full.tag && full.tag !== category ? full.tag : "");
      const liveList = pickList(live);
      const deliverables = (liveList.length > 0 ? liveList : pickList(item))
        .map((d: any) => (typeof d === "string" ? d : d?.title || d?.name || d?.label || ""))
        .filter((d: any) => typeof d === "string" && d.trim());
      const pos = String(out.length + 1).padStart(2, "0");

      out.push({
        // Display number + anchor id come from the position, not from the stored snapshot id.
        id: pos,
        title,
        category,
        badge,
        image: pickImage(live) || pickImage(item),
        desc: (pickDesc(live) || pickDesc(item)).replace(/<[^>]*>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim(),
        deliverables,
        navTitle: firstText(live.navTitle, live.title, live.name, item.navTitle, title),
        navTag: firstText(live.navTag, /^STAGE \d+$/i.test(item.navTag || "") ? "" : item.navTag) || (category ? String(category).toUpperCase() : `STAGE ${pos}`),
        iconName: firstText(live.iconName, live.icon, item.iconName, item.icon) || "Code",
        slug: firstText(live.slug, item.slug)
      });
    });
    return out;
  }, [rawStages, allMasterServices]);

  const [activeService, setActiveService] = useState(0);

  // ── Links ────────────────────────────────────────────────────────────────────
  // This page has no on-page contact form and the Services Directory only exists when services
  // are selected, so "#contact" / "#services-directory" / "#" would be dead anchors. Resolve them.
  const navCta = (content as any)?.navbar?.ctaLink;
  const contactHref = typeof navCta === "string" && /^(\/|https?:\/\/)/i.test(navCta.trim()) ? navCta.trim() : DEFAULT_CONTACT_HREF;
  const servicesVisible = servicesDirectory.enabled !== false && stagesList.length > 0;
  // A button link with a fallback (empty / "#" / dead anchor -> fallback).
  const resolveHref = (raw: any, fallback: string): string => {
    const v = typeof raw === "string" ? raw.trim() : "";
    if (!v || v === "#") return fallback;
    if (v === "#contact") return contactHref;
    if (v === "#services-directory" && !servicesVisible) return fallback;
    return v;
  };
  // Secondary buttons have no sensible default destination: no link -> the button is not shown.
  const explicitHref = (raw: any): string => resolveHref(raw, "");

  // ── Section visibility ───────────────────────────────────────────────────────
  // `enabled !== false` is the admin toggle. On top of that, a section with nothing but its
  // default heading (a brand-new page has `content: {}`) is skipped instead of rendering a hollow
  // block. Rich-text fields count as empty when they hold only blank tags.
  const hasText = (v: any) => typeof v === "string" && v.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;
  const listOf = (v: any): any[] => (Array.isArray(v) ? v : []);
  const founderBio: string =
    executiveLeadership.bioContent ||
    executiveLeadership.bio ||
    [executiveLeadership.bioParagraph1, executiveLeadership.bioParagraph2].filter(Boolean).map((p: string) => `<p>${p}</p>`).join("");
  const whoRows = listOf(whoWeAre.rows).filter((r: any) => r && (hasText(r.title) || hasText(r.desc)));
  const statMetrics = listOf(stats.metrics).filter((m: any) => m && hasText(m.label));
  const statDisciplines = listOf(stats.expertiseList).filter((e: any) => e && hasText(e.label));
  const showPillars = {
    mission: !!philosophy.mission && philosophy.mission.enabled !== false,
    vision: !!philosophy.vision && philosophy.vision.enabled !== false,
    values: !!philosophy.values && philosophy.values.enabled !== false
  };
  // A pillar's image/badge panel is only drawn when it has an image or a badge; otherwise the text
  // uses the full row instead of sitting next to an empty dark box.
  const pillarHasMedia = {
    mission: !!(philosophy.mission?.imgSrc || philosophy.mission?.badgeLatency || philosophy.mission?.badgePerformance),
    vision: !!(philosophy.vision?.imgSrc || philosophy.vision?.badgeAccessibility || philosophy.vision?.badgeLighthouse),
    values: !!(philosophy.values?.imgSrc || philosophy.values?.badgeSync || philosophy.values?.badgeSprint)
  };
  const showStats = stats.enabled !== false && (hasText(stats.description) || statMetrics.length > 0 || statDisciplines.length > 0);
  const showWhoCollage = !!(whoWeAre.imgAbstract || whoWeAre.imgWorkspace || whoWeAre.imgUiDetail || hasText(whoWeAre.parallaxBadge));
  const showWhoWeAre = whoWeAre.enabled !== false && (hasText(whoWeAre.description) || whoRows.length > 0 || !!(whoWeAre.imgAbstract || whoWeAre.imgWorkspace || whoWeAre.imgUiDetail) || hasText(whoWeAre.parallaxBadge));
  const showPhilosophy = philosophy.enabled !== false && (showPillars.mission || showPillars.vision || showPillars.values);
  const showMethodology = methodology.enabled !== false && (hasText(methodology.description) || listOf(methodology.steps).length > 0);
  const showDomains = domainExpertise.enabled !== false && (hasText(domainExpertise.description) || listOf(domainExpertise.domains).length > 0);
  const showWhy = whyChooseUs.enabled !== false && (hasText(whyChooseUs.description) || listOf(whyChooseUs.features).length > 0 || !!whyChooseUs.blueCardImage);
  const showFounder = executiveLeadership.enabled !== false && (hasText(founderBio) || !!executiveLeadership.portraitSrc || listOf(executiveLeadership.metrics).length > 0 || hasText(executiveLeadership.founderName));
  const showReviews = reviews.enabled !== false && listOf(reviews.list).length > 0;
  const ctaPrimaryHref = resolveHref(ctaBanner.ctaPrimaryHref, contactHref);
  const ctaSecondaryHref = explicitHref(ctaBanner.ctaSecondaryHref);
  const showCta = ctaBanner.enabled !== false && (hasText(ctaBanner.description) || hasText(ctaBanner.eyebrow) || hasText(ctaBanner.ctaPrimaryText) || (hasText(ctaBanner.ctaSecondaryText) && !!ctaSecondaryHref) || !!ctaBanner.portraitSrc);
  const heroSecondaryHref = explicitHref(hero.ctaSecondaryHref);

  // Highlights the stage card nearest the top while scrolling. The stage index travels in a
  // data attribute (not parsed out of the id) so any stage number/anchor scheme works.
  const stagesCount = stagesList.length;
  useEffect(() => {
    if (!servicesVisible || stagesCount === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
          const raw = visible[0].target.getAttribute("data-stage-index");
          const idx = raw === null ? NaN : parseInt(raw, 10);
          if (!isNaN(idx) && idx >= 0) {
            setActiveService(idx);
          }
        }
      },
      {
        rootMargin: "-10% 0px -30% 0px",
        threshold: [0.1, 0.3, 0.5],
      }
    );

    document.querySelectorAll("[data-stage-index]").forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, [servicesVisible, stagesCount]);

  return (
    <>
      {/* A <div>, not <main>: SiteLayout and the [...slug] route already provide the page's <main> landmark. */}
      <div className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip">

        {/* Floating Blurred Mesh Blobs */}
        <div className="absolute top-[3%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
        <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />
        <div className="absolute bottom-[30%] left-[-12%] w-[48vw] h-[48vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-blue/[0.04] blur-[140px] pointer-events-none select-none -z-10 animate-float-blob" />
        <div className="absolute bottom-[5%] right-[-12%] w-[42vw] h-[42vw] rounded-full bg-brand-yellow/[0.015] dark:bg-brand-yellow/[0.035] blur-[160px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none -z-10" />

        {/* ── 1. HERO SECTION ── */}
        {hero?.enabled !== false && (
        <section className="relative overflow-hidden pt-28 md:pt-36 lg:pt-40 pb-16 lg:pb-24 border-b border-brand-zinc-200 dark:border-white/10">
          <div className="absolute inset-0 -z-10 bg-linear-grid-blue-4 [background-size:40px_40px] opacity-[0.05] dark:opacity-[0.08]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`${hero.heroImage ? "lg:col-span-6" : "lg:col-span-12"} min-w-0 space-y-6 text-left`}
              >
                <PageBreadcrumbs page={pageData} />
                {hero.badgeText && (
                  <div className="inline-flex pointer-events-auto">
                    <span className="eyebrow-pill select-none shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-current text-current shrink-0" />
                      {hero.badgeText}
                    </span>
                  </div>
                )}

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight leading-[1.18] text-brand-dark dark:text-white max-w-xl">
                  {hero.titleIntro || "Architecting Digital Products With"}{" "}
                  <AccentHighlight className="text-brand-blue dark:text-brand-yellow pb-1">
                    {hero.titleHighlight || "Zero Fluff & Pure Precision."}
                  </AccentHighlight>
                </h1>

                {hero.description && (
                  <RichTextRenderer
                    content={hero.description}
                    className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg"
                  />
                )}

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {hero.ctaPrimaryText && (
                    <CtaButton href={resolveHref(hero.ctaPrimaryHref, servicesVisible ? "#services-directory" : contactHref)}>{hero.ctaPrimaryText}</CtaButton>
                  )}

                  {hero.ctaSecondaryText && heroSecondaryHref && (
                    <CtaButton href={heroSecondaryHref} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{hero.ctaSecondaryText}</CtaButton>
                  )}
                </div>
              </motion.div>

              {hero.heroImage && (
              <div className="lg:col-span-6 min-w-0 relative w-full h-[320px] sm:h-[420px] md:h-[480px] lg:h-[520px] flex items-center justify-center pt-8 lg:pt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.98, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
                  className="relative w-full h-full flex items-center justify-center"
                >
                  <img
                    src={hero.heroImage}
                    alt={hero.heroImageAlt || "About Hero"}
                    decoding="async"
                    className="w-full h-full object-contain filter drop-shadow-2xl"
                  />
                </motion.div>
              </div>
              )}
            </div>
          </div>
        </section>
        )}

        {rawAbout.videoTestimonials?.enabled !== false && (
          <section id="video-testimonials">
            <VideoTestimonials data={rawAbout.videoTestimonials} />
          </section>
        )}

        {/* ── 2. STATS BAR SECTION ── */}
        {showStats && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/10 dark:bg-white/[0.005] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-stretch">
              <div className="lg:col-span-4 min-w-0 flex flex-col justify-between self-stretch text-left">
                <div className="w-full space-y-4">
                  {stats.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
                      </span>
                      {stats.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight leading-[1.12] text-brand-dark dark:text-white">
                    {stats.titleIntro || "Compound Growth &"}{" "}
                    <AccentHighlight className="text-brand-blue dark:text-brand-yellow font-cursive font-normal">
                      {stats.titleHighlight || "Measurable ROI"}
                    </AccentHighlight>
                  </h2>

                  {stats.description && (
                    <RichTextRenderer
                      content={stats.description}
                      className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-xs"
                    />
                  )}
                </div>

                {statDisciplines.length > 0 && (
                  <div className="pt-6 mt-8 border-t border-brand-zinc-100 dark:border-white/5 w-full select-none">
                    <span className="text-[7.5px] font-mono tracking-widest text-brand-blue dark:text-brand-yellow uppercase font-black block mb-3">
                      {stats.expertiseHeader || "CORE DISCIPLINES"}
                    </span>
                    <div className="grid grid-cols-2 gap-y-3.5 gap-x-6">
                      {statDisciplines.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-brand-dark dark:text-white text-[9.5px] font-bold uppercase tracking-wider">
                          <span className="text-[8px] font-mono text-brand-zinc-400 dark:text-zinc-500 font-normal">{item.num || `0${idx + 1}`}</span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 min-w-0 grid grid-cols-2 gap-x-12 gap-y-12 sm:gap-x-16 border-t lg:border-t-0 lg:border-l border-brand-zinc-200/60 dark:border-white/5 pt-10 lg:pt-0 lg:pl-16">
                {statMetrics.map((metric: any, idx: number) => {
                  const MetricIcon = getIcon(metric.iconName, Globe);
                  return (
                    <div key={idx} className="flex flex-col items-start relative w-full group hover:-translate-y-1 transition-transform duration-350 ease-out">
                      <div className="relative flex items-center justify-between w-full pb-2.5 mb-3">
                        <MetricIcon className="h-4.5 w-4.5 text-[#0306AC] dark:text-[#E9BD36] transition-transform duration-300 group-hover:rotate-[15deg]" />
                        <span className="text-[8px] font-mono tracking-widest text-brand-zinc-400 dark:text-zinc-500 select-none">{metric.num || `0${idx + 1}`}</span>
                        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-brand-zinc-100 dark:bg-white/5" />
                        <div className="absolute bottom-0 left-0 w-0 h-[1.5px] bg-[#0306AC] dark:bg-[#E9BD36] group-hover:w-full transition-all duration-500 ease-out" />
                      </div>
                      <div className="flex items-baseline gap-0.5 text-brand-dark dark:text-white">
                        <span className="font-heading font-black text-5xl sm:text-6xl md:text-7xl tracking-tighter leading-none text-brand-dark dark:text-white">
                          <DigitTicker value={Number(metric.value) || 0} />
                        </span>
                        <span className="font-heading font-bold text-2xl sm:text-3xl leading-none text-[#0306AC] dark:text-[#E9BD36]">{metric.suffix}</span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] font-black text-brand-dark dark:text-white uppercase tracking-widest mt-3.5 leading-none transition-colors duration-300 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36]">
                        {metric.label}
                      </p>
                      {metric.sublabel && (
                        <p className="text-[9.5px] text-brand-zinc-400 dark:text-zinc-500 mt-2 font-semibold leading-normal max-w-[200px]">
                          {metric.sublabel}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── 3. WHO WE ARE SECTION ── */}
        {showWhoWeAre && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
          {whoWeAre.watermark && (
            <div className="absolute right-[5%] top-[10%] text-[15vw] sm:text-[12vw] font-heading font-black tracking-tighter text-[#0306AC]/[0.015] dark:text-white/[0.01] pointer-events-none select-none z-0 leading-none">
              {whoWeAre.watermark}
            </div>
          )}

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
              <div className={`${showWhoCollage ? "lg:col-span-6" : "lg:col-span-12"} min-w-0 space-y-10 text-left`}>
                <div className="space-y-4">
                  {whoWeAre.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      {whoWeAre.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                    {whoWeAre.titleIntro || "Built by Engineers,"}{" "}
                    <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                      {whoWeAre.titleHighlight || "Guided by Craft."}
                    </AccentHighlight>
                  </h2>

                  {whoWeAre.description && (
                    <RichTextRenderer
                      content={whoWeAre.description}
                      className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl"
                    />
                  )}
                </div>

                {whoRows.length > 0 && (
                  <div className="border-t border-brand-zinc-200 dark:border-white/10 divide-y divide-brand-zinc-200 dark:divide-white/10 w-full">
                    {whoRows.map((row: any, idx: number) => (
                      <div key={idx} className="group relative py-6 flex items-start justify-between gap-6 overflow-hidden transition-all duration-300">
                        <div className="absolute inset-y-0 left-0 w-0 bg-zinc-50 dark:bg-white/[0.02] group-hover:w-full transition-all duration-500 ease-out -z-10" />

                        <div className="flex items-start gap-4 sm:gap-6">
                          <span className="text-[10px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] mt-1 select-none">{row.num || `0${idx + 1}`}</span>
                          <div className="space-y-1">
                            {hasText(row.title) && (
                            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-300">
                              {row.title}
                            </h3>
                            )}
                            {hasText(row.desc) && (
                            <div className="text-[10px] sm:text-[11px] text-brand-zinc-550 dark:text-zinc-300 font-medium leading-normal max-w-md transition-colors duration-300 group-hover:text-brand-dark dark:group-hover:text-white">
                              <RichTextRenderer content={row.desc} />
                            </div>
                            )}
                          </div>
                        </div>
                        <div className="h-7 w-7 rounded-full border border-brand-zinc-300 dark:border-white/10 flex items-center justify-center text-brand-zinc-400 dark:text-zinc-500 group-hover:border-[#0306AC] dark:group-hover:border-[#E9BD36] group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] group-hover:rotate-45 transition-all duration-300 shrink-0">
                          <ArrowRight className="h-3 w-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {showWhoCollage && (
              <div className="lg:col-span-6 min-w-0 relative h-[380px] sm:h-[480px] w-full flex items-center justify-center select-none">
                <div className="relative w-full h-full max-w-[480px]">
                  {whoWeAre.imgAbstract && (
                    <div className="absolute left-4 top-4 w-[60%] aspect-[1.1] rounded-2xl overflow-hidden border border-brand-zinc-200 dark:border-white/5 shadow-md bg-brand-dark -z-10">
                      <img
                        src={whoWeAre.imgAbstract}
                        alt={whoWeAre.imgAbstractAlt || "Abstract Design"}
                        className="w-full h-full object-cover opacity-60 dark:opacity-80"
                      />
                    </div>
                  )}

                  {whoWeAre.imgWorkspace && (
                    <div className="absolute left-[15%] top-[15%] w-[70%] aspect-[1.3] rounded-2xl overflow-hidden border border-brand-zinc-200 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white dark:bg-[#12121e]">
                      <FullImage src={whoWeAre.imgWorkspace} alt={whoWeAre.imgWorkspaceAlt || "Team Workspace"} />
                      <div className="absolute inset-0 bg-linear-grid-blue-4 opacity-[0.02] [background-size:16px_16px]" />
                    </div>
                  )}

                  {whoWeAre.imgUiDetail && (
                    <div className="absolute right-2 bottom-6 w-[55%] aspect-[1.28] rounded-2xl overflow-hidden border border-[#0306AC]/15 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] bg-white dark:bg-[#12121e]">
                      <FullImage src={whoWeAre.imgUiDetail} alt={whoWeAre.imgUiDetailAlt || "UI Detail"} />
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0306AC]/10 to-transparent mix-blend-overlay pointer-events-none" />
                    </div>
                  )}

                  {whoWeAre.parallaxBadge && (
                    <div className="absolute top-[8%] right-[8%] bg-white/95 dark:bg-[#080710]/95 backdrop-blur-md border border-brand-zinc-200 dark:border-white/10 px-3.5 py-2 rounded-xl flex items-center gap-2.5 shadow-lg select-none">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      <span className="text-[8px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {whoWeAre.parallaxBadge}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* ── 4. MISSION & VISION SECTION ── */}
        {showPhilosophy && (
        <section
          className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] transition-colors duration-300 section-y"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808007_1px,transparent_1px),linear-gradient(to_bottom,#80808007_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-28 sm:space-y-40">
            <div className="text-left max-w-2xl space-y-4">
              {philosophy.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {philosophy.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {philosophy.titleIntro || "The Three Principles That"}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {philosophy.titleHighlight || "Drive Our Work"}
                </AccentHighlight>
              </h2>
            </div>

            <div className="space-y-32 sm:space-y-44">
              {/* Mission */}
              {showPillars.mission && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  <div className={`${pillarHasMedia.mission ? "lg:col-span-5" : "lg:col-span-12 max-w-3xl"} min-w-0 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1`}>
                    <div className="flex items-center gap-4">
 <span className="font-cursive text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.mission.num || "01"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.mission.label || "CORE MISSION"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {(philosophy.mission.titleIntro || "Eliminating Technical Debt Through").trimEnd()}{" "}
 <AccentHighlight className="font-cursive text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.mission.titleHighlight || "Intentional Design"}
                      </AccentHighlight>
                    </h3>

                    {philosophy.mission.desc && (
                      <RichTextRenderer
                        content={philosophy.mission.desc}
                        className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                      />
                    )}

                    {philosophy.mission.quote && (
 <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] text-xs font-heading text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.mission.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.mission.tags) && philosophy.mission.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.mission.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Code className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {pillarHasMedia.mission && (
                  <div className="lg:col-span-7 min-w-0 order-1 lg:order-2">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.mission.imgSrc && (
                        <FullImage src={philosophy.mission.imgSrc} alt={philosophy.mission.imgAlt || "Mission"} className="group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.mission.badgeLatency && (
                        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.mission.badgeLatency}</span>
                        </div>
                      )}
                      {philosophy.mission.badgePerformance && (
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.mission.badgePerformance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              )}

              {/* Vision */}
              {showPillars.vision && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  {pillarHasMedia.vision && (
                  <div className="lg:col-span-7 min-w-0">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.vision.imgSrc && (
                        <FullImage src={philosophy.vision.imgSrc} alt={philosophy.vision.imgAlt || "Vision"} className="group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.vision.badgeAccessibility && (
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.vision.badgeAccessibility}</span>
                        </div>
                      )}
                      {philosophy.vision.badgeLighthouse && (
                        <div className="absolute top-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.vision.badgeLighthouse}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  )}

                  <div className={`${pillarHasMedia.vision ? "lg:col-span-5" : "lg:col-span-12 max-w-3xl"} min-w-0 flex flex-col justify-center space-y-6 text-left`}>
                    <div className="flex items-center gap-4">
 <span className="font-cursive text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.vision.num || "02"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.vision.label || "GLOBAL VISION"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {(philosophy.vision.titleIntro || "Setting the Global Standard in").trimEnd()}{" "}
 <AccentHighlight className="font-cursive text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.vision.titleHighlight || "Modern Web Engineering"}
                      </AccentHighlight>
                    </h3>

                    {philosophy.vision.desc && (
                      <RichTextRenderer
                        content={philosophy.vision.desc}
                        className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                      />
                    )}

                    {philosophy.vision.quote && (
 <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] text-xs font-heading text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.vision.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.vision.tags) && philosophy.vision.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.vision.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Palette className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Values */}
              {showPillars.values && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center group">
                  <div className={`${pillarHasMedia.values ? "lg:col-span-5" : "lg:col-span-12 max-w-3xl"} min-w-0 flex flex-col justify-center space-y-6 text-left order-2 lg:order-1`}>
                    <div className="flex items-center gap-4">
 <span className="font-cursive text-5xl sm:text-6xl font-black text-brand-zinc-200 dark:text-white/10 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors duration-500 leading-none select-none">
                        {philosophy.values.num || "03"}
                      </span>
                      <div className="h-[1px] w-8 bg-[#0306AC]/20 dark:bg-white/10" />
                      <span className="text-[8.5px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-black uppercase">
                        {philosophy.values.label || "SHARED VALUES"}
                      </span>
                    </div>

                    <h3 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-brand-dark dark:text-white leading-[1.15] tracking-tight">
                      {(philosophy.values.titleIntro || "Radical Transparency &").trimEnd()}{" "}
 <AccentHighlight className="font-cursive text-[#0306AC] dark:text-[#E9BD36] font-light">
                        {philosophy.values.titleHighlight || "Relentless Ownership"}
                      </AccentHighlight>
                    </h3>

                    {philosophy.values.desc && (
                      <RichTextRenderer
                        content={philosophy.values.desc}
                        className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                      />
                    )}

                    {philosophy.values.quote && (
 <div className="pl-4 border-l-2 border-[#0306AC] dark:border-[#E9BD36] text-xs font-heading text-brand-dark dark:text-zinc-200 py-0.5">
                        {philosophy.values.quote}
                      </div>
                    )}

                    {Array.isArray(philosophy.values.tags) && philosophy.values.tags.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-2">
                        {philosophy.values.tags.map((tag: string, idx: number) => (
                          <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-zinc-50 dark:bg-white/5 border border-brand-zinc-200/60 dark:border-white/10 px-3.5 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                            <Target className="h-3 w-3 text-[#0306AC] dark:text-[#E9BD36]" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {pillarHasMedia.values && (
                  <div className="lg:col-span-7 min-w-0 order-1 lg:order-2">
                    <div className="aspect-[1.45] w-full rounded-[32px] overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 shadow-sm relative bg-[#090812]">
                      {philosophy.values.imgSrc && (
                        <FullImage src={philosophy.values.imgSrc} alt={philosophy.values.imgAlt || "Values"} className="group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                      )}
                      {philosophy.values.badgeSync && (
                        <div className="absolute top-5 left-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-white uppercase tracking-wider">{philosophy.values.badgeSync}</span>
                        </div>
                      )}
                      {philosophy.values.badgeSprint && (
                        <div className="absolute bottom-5 right-5 bg-black/70 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-xl select-none">
                          <span className="text-[8.5px] font-mono font-black text-[#E9BD36] uppercase tracking-wider">{philosophy.values.badgeSprint}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        )}

        {/* ── 5. OUR SERVICES SECTION ──────── */}
        {servicesVisible && (
          <section id="services-directory" className="relative overflow-x-clip border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
            {/* Mobile / tablet heading: the desktop heading lives inside the sticky card, which is hidden below lg */}
            <div className="lg:hidden mx-auto max-w-7xl px-4 sm:px-6 md:px-12 mb-6 space-y-3 text-left">
              {servicesDirectory.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {servicesDirectory.eyebrow}
                </div>
              )}
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {servicesDirectory.titleIntro || "Full-Spectrum Digital"}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {servicesDirectory.titleHighlight || "Engineering Services"}
                </AccentHighlight>
              </h2>
            </div>

            {/* Mobile Pills */}
            <div className="sticky top-14 sm:top-16 z-30 flex lg:hidden overflow-x-auto no-scrollbar py-3 px-4 gap-2 bg-white/95 dark:bg-[#080710]/95 backdrop-blur-xl border-b border-brand-zinc-200 dark:border-white/10 shadow-sm mb-8 select-none">
              {stagesList.map((item: any, idx: number) => {
                const isActive = activeService === idx;
                return (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={() => {
                      setActiveService(idx);
                      const el = document.getElementById(`service-stage-${item.id}`);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.pageYOffset - 110;
                        window.scrollTo({ top: y, behavior: "smooth" });
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-mono font-bold shrink-0 flex items-center gap-2 transition-all duration-300 ${isActive
                      ? "bg-[#0306AC] text-white dark:bg-[#E9BD36] dark:text-brand-dark shadow-md"
                      : "bg-zinc-100 text-brand-zinc-600 dark:bg-white/5 dark:text-zinc-400"
                      }`}
                  >
                    <span>{item.id}</span>
                    <span>{item.navTitle || item.title}</span>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
                {/* Sticky Nav */}
                <div className="hidden lg:block lg:col-span-5 min-w-0 lg:sticky lg:top-24 self-start z-20">
                  <div className="p-6 sm:p-7 rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18]/90 border border-brand-zinc-200/80 dark:border-white/10 shadow-2xl backdrop-blur-xl space-y-5 text-left relative overflow-hidden">
                    <div className="space-y-3">
                      {servicesDirectory.eyebrow && (
                        <div className="eyebrow-pill">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                          </span>
                          {servicesDirectory.eyebrow}
                        </div>
                      )}

                      <h2 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                        {servicesDirectory.titleIntro || "Full-Spectrum Digital"}{" "}
                        <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                          {servicesDirectory.titleHighlight || "Engineering Services"}
                        </AccentHighlight>
                      </h2>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-brand-zinc-200/80 dark:border-white/10 select-none relative">
                      {stagesList.map((item: any, idx: number) => {
                        const isActive = activeService === idx;
                        return (
                          <a
                            key={item.id || idx}
                            href={`#service-stage-${item.id}`}
                            className={`py-2.5 px-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 group relative ${isActive
                              ? "bg-[#0306AC] text-white dark:bg-[#E9BD36] dark:text-[#080710] shadow-xl scale-[1.02] font-bold"
                              : "hover:bg-zinc-200/60 dark:hover:bg-white/5 text-brand-zinc-600 dark:text-zinc-400"
                              }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveService(idx);
                              const el = document.getElementById(`service-stage-${item.id}`);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                            }}
                          >
                            <div className="flex items-center gap-3">
 <span className={`font-heading text-xs font-black transition-colors ${isActive ? "text-[#E9BD36] dark:text-[#080710]" : "text-brand-zinc-400 dark:text-zinc-400"}`}>{item.id}</span>
                              <span className="font-heading text-xs tracking-tight">{item.navTitle || item.title}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.navTag && (
                                <span className={`text-[8.5px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full transition-colors ${isActive ? "bg-white/20 text-white dark:bg-black/15 dark:text-[#080710]" : "bg-black/5 dark:bg-white/10 text-brand-zinc-550 dark:text-zinc-300"}`}>{item.navTag}</span>
                              )}
                              <ArrowRight className={`h-3.5 w-3.5 transition-transform ${isActive ? "translate-x-1 opacity-100 text-[#E9BD36] dark:text-[#080710]" : "opacity-30 group-hover:opacity-100"}`} />
                            </div>
                          </a>
                        );
                      })}
                    </div>

                    {servicesDirectory.consultationBtnText && (
                      <div className="pt-2 border-t border-brand-zinc-200/80 dark:border-white/10">
                        <CtaButton href={resolveHref(servicesDirectory.consultationBtnHref, contactHref)} fullWidth>{servicesDirectory.consultationBtnText}</CtaButton>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stages List */}
                <div className="lg:col-span-7 min-w-0 space-y-10 sm:space-y-14 lg:space-y-16 text-left">
                  {stagesList.map((stage: any, idx: number) => {
                    const StageIcon = getIcon(stage.iconName, Palette);
                    return (
                      <div
                        id={`service-stage-${stage.id}`}
                        data-stage-index={idx}
                        key={stage.id || idx}
                        className="rounded-[28px] sm:rounded-[36px] bg-zinc-50/80 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-5 sm:p-8 lg:p-10 space-y-6 sm:space-y-8 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-300 shadow-sm hover:shadow-2xl relative overflow-hidden"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
 <span className="font-cursive text-2xl font-black text-[#0306AC] dark:text-[#E9BD36]">{stage.id}</span>
                            {stage.category ? (
                              <>
                                <div className="h-[1px] w-6 bg-brand-zinc-300 dark:bg-white/20" />
                                <span className="text-[9px] font-mono font-bold text-brand-zinc-500 dark:text-zinc-300 uppercase tracking-widest">// {stage.category}</span>
                              </>
                            ) : null}
                          </div>
                          {stage.badge ? (
                            <div className="bg-white dark:bg-white/10 border border-brand-zinc-200 dark:border-white/15 px-3 py-1.5 rounded-xl text-[8.5px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-wider shadow-sm">{stage.badge}</div>
                          ) : null}
                        </div>

                        {stage.image ? (
                          <div className="aspect-[1.65] w-full rounded-2xl overflow-hidden border border-brand-zinc-200/80 dark:border-white/10 relative bg-[#090812]">
                            <FullImage src={stage.image} alt={stage.title} className="group-hover:scale-[1.04] transition-transform duration-700 pointer-events-none" />
                            {stage.category ? (
                              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white select-none">
                                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/15">
                                  <StageIcon className="h-4 w-4 text-[#E9BD36]" />
                                  <span className="text-[9.5px] font-mono font-bold uppercase tracking-wider">{stage.category}</span>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ) : null}

                        <div className="space-y-3">
                          <h3 className="font-heading text-2xl sm:text-3xl font-black text-brand-dark dark:text-white tracking-tight leading-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{stage.title}</h3>
                          {stage.desc && (
                            <p className="text-xs sm:text-sm text-brand-zinc-600 dark:text-zinc-300 font-sans leading-relaxed line-clamp-5">{stage.desc}</p>
                          )}
                        </div>

                        <div className="pt-6 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                          {Array.isArray(stage.deliverables) && stage.deliverables.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {stage.deliverables.map((del: string, dIdx: number) => (
                                <span key={dIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 px-3 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                                  {del}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* A service links to its own page; a stage without a slug uses the optional fallback link, then the contact page. */}
                          <Link
                            href={stage.slug ? `/services/${stage.slug}` : resolveHref(servicesDirectory.getStartedHref, contactHref)}
                            aria-label={`${servicesDirectory.getStartedText || "Explore Service"}: ${stage.title}`}
                            className="inline-flex items-center gap-2 text-xs font-mono font-black text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors"
                          >
                            <span>{servicesDirectory.getStartedText || "Explore Service"}</span>
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Link>
                        </div>
                      </div>
                    );
                  })}

                  {servicesDirectory.consultationBtnText && (
                    <div className="lg:hidden pt-2">
                      <CtaButton href={resolveHref(servicesDirectory.consultationBtnHref, contactHref)} fullWidth>{servicesDirectory.consultationBtnText}</CtaButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── 6. PROCESS SECTION ──────── */}
        {showMethodology && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-12">
              <div className="max-w-2xl space-y-4">
                {methodology.eyebrow && (
                  <div className="eyebrow-pill">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                    </span>
                    {methodology.eyebrow}
                  </div>
                )}
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                  {methodology.titleIntro || "Engineering Precision From"}{" "}
                  <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                    {methodology.titleHighlight || "Concept to Production"}
                  </AccentHighlight>
                </h2>
              </div>
              {methodology.description && (
                <div className="max-w-md space-y-3">
                  <RichTextRenderer
                    content={methodology.description}
                    className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>

            {Array.isArray(methodology.steps) && methodology.steps.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch text-left">
                {methodology.steps.map((process: any, idx: number) => {
                  const StepIcon = getIcon(process.iconName, Search);
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                      className="rounded-[36px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-8 sm:p-9 text-brand-dark dark:text-white flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-500 shadow-sm relative overflow-hidden"
                    >
                      <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
 <span className="font-cursive text-4xl font-black text-[#0306AC] dark:text-[#E9BD36]">{process.step || `0${idx + 1}`}</span>
                            {process.badge && (
                              <>
                                <div className="h-[1px] w-6 bg-brand-zinc-300 dark:bg-white/20" />
                                <span className="text-[9px] font-mono font-bold text-brand-zinc-400 dark:text-zinc-500 uppercase tracking-widest">{process.badge}</span>
                              </>
                            )}
                          </div>
                          <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 group-hover:bg-[#0306AC] group-hover:text-white dark:group-hover:bg-[#E9BD36] dark:group-hover:text-brand-dark transition-all duration-300 shadow-md">
                            <StepIcon className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h3 className="font-heading text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{process.title}</h3>
                          {hasText(process.desc) && (
                            <RichTextRenderer
                              content={process.desc}
                              className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                            />
                          )}
                        </div>
                      </div>

                      {Array.isArray(process.deliverables) && process.deliverables.length > 0 && (
                        <div className="pt-5 border-t border-brand-zinc-200/70 dark:border-white/10 space-y-3 mt-4 relative z-10">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold text-brand-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{methodology.deliverablesLabel || "DELIVERABLES"}</span>
                            <span className="text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] uppercase tracking-wider">{methodology.stepLabelPrefix || "STAGE"} {idx + 1} OF {methodology.steps.length}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {process.deliverables.map((del: string, dIdx: number) => (
                              <span key={dIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-3 py-1 text-[8.5px] font-mono font-bold text-brand-zinc-700 dark:text-zinc-300 uppercase shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                                {del}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        )}

        {/* ── 7. DOMAIN EXPERTISE SECTION ──────── */}
        {showDomains && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-12">
              <div className="max-w-2xl space-y-4">
                {domainExpertise.eyebrow && (
                  <div className="eyebrow-pill">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                    </span>
                    {domainExpertise.eyebrow}
                  </div>
                )}
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                  {domainExpertise.titleIntro || "Deep Experience Across"}{" "}
                  <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                    {domainExpertise.titleHighlight || "Diverse Industries"}
                  </AccentHighlight>
                </h2>
              </div>
              {domainExpertise.description && (
                <div className="max-w-md space-y-3">
                  <RichTextRenderer
                    content={domainExpertise.description}
                    className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                  />
                </div>
              )}
            </div>

            {Array.isArray(domainExpertise.domains) && domainExpertise.domains.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch text-left">
                {domainExpertise.domains.map((domain: any, idx: number) => {
                  const DomainIcon = getIcon(domain.iconName, ShoppingCart);
                  const rawHref = domain.link || domain.href || domain.url;
                  const validHref = getValidHref(rawHref);
                  const isExternal = !!validHref && /^https?:\/\//i.test(validHref);

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
                      className={`rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-500 shadow-sm relative overflow-hidden ${validHref ? "cursor-pointer" : ""}`}
                    >
                      <div className="space-y-5 relative z-10">
                        <div className="flex items-center justify-between">
                          <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 transition-all duration-300 shadow-md">
                            <DomainIcon className="h-5 w-5" />
                          </div>
 <span className="font-cursive text-2xl font-black text-brand-zinc-300 dark:text-zinc-600 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">{domain.id || `0${idx + 1}`}</span>
                        </div>

                        <div className="space-y-2">
                          <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                            {validHref ? (
                              <Link
                                href={validHref}
                                className="hover:underline focus:outline-none after:absolute after:inset-0 after:z-10 inline-flex items-center gap-1.5"
                                {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                              >
                                <span>{domain.title}</span>
                                <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-[#0306AC] dark:text-[#E9BD36]">↗</span>
                              </Link>
                            ) : (
                              domain.title
                            )}
                          </h3>
                          {hasText(domain.desc) && (
                            <RichTextRenderer
                              content={domain.desc}
                              className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed relative z-20 pointer-events-none [&_a]:pointer-events-auto"
                            />
                          )}
                        </div>
                      </div>

                      {Array.isArray(domain.tags) && domain.tags.length > 0 && (
                        <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap gap-1.5 relative z-20">
                          {domain.tags.map((tag: string, tIdx: number) => (
                            <span key={tIdx} className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-2.5 py-0.5 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase shadow-xs">
                              <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
        )}

        {/* ── 8. WHY BUSINESSES CHOOSE US SECTION ──────── */}
        {showWhy && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
            <div className="text-center flex flex-col items-center max-w-3xl mx-auto space-y-4">
              {whyChooseUs.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {whyChooseUs.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {whyChooseUs.titleIntro || "Why Visionary Leaders"}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {whyChooseUs.titleHighlight || "Choose Mohsin Designs"}
                </AccentHighlight>
              </h2>

              {whyChooseUs.description && (
                <RichTextRenderer
                  content={whyChooseUs.description}
                  className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-2xl mx-auto"
                />
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-4 min-w-0 relative flex justify-center z-10">
                <div className="relative w-full rounded-[36px] overflow-hidden bg-brand-blue border border-brand-blue shadow-2xl p-8 sm:p-9 flex flex-col justify-between min-h-[460px] lg:min-h-[520px] z-10">
                  <div className="max-w-[220px] space-y-1.5 z-10 text-left">
                    <div className="h-[2.5px] w-7 bg-brand-yellow mb-4" />
                    <p className="text-white text-sm sm:text-base font-semibold leading-snug tracking-tight">{whyChooseUs.blueCardLine1 || "Direct Founder"}</p>
                    <p className="text-brand-yellow text-lg sm:text-xl font-extrabold leading-none pt-1">{whyChooseUs.blueCardLine2 || "Architecture & Execution"}</p>
                  </div>

                  {whyChooseUs.blueCardImage && (
                    <div className="relative mt-8 -mx-8 sm:-mx-9 -mb-8 sm:-mb-9 rounded-b-[36px] overflow-hidden shadow-inner h-64 sm:h-72 lg:h-80">
                      <FullImage src={whyChooseUs.blueCardImage} alt={whyChooseUs.blueCardImageAlt || "Feature"} />
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-8 min-w-0 relative z-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-left">
                {(Array.isArray(whyChooseUs.features) ? whyChooseUs.features : []).map((feat: any, idx: number) => {
                  const FeatIcon = getIcon(feat.iconName, Target);
                  return (
                    <div key={idx} className="p-7 rounded-[24px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/70 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-start justify-between min-h-[220px] group">
                      <div className={`h-14 w-14 rounded-full flex items-center justify-center ${feat.iconBg ==="amber" ? "bg-amber-50/80 dark:bg-amber-500/10 text-amber-500 dark:text-[#E9BD36]" : "bg-blue-50/80 dark:bg-white/5 text-[#0306AC] dark:text-[#E9BD36]"} group-hover:scale-110 transition-transform`}>
                        <FeatIcon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="h-[2.5px] w-6 bg-[#0306AC] dark:bg-[#E9BD36] mb-3" />
                        <h3 className="font-heading font-extrabold text-base text-brand-dark dark:text-white tracking-tight mb-2">{feat.title}</h3>
                        {hasText(feat.desc) && (
                          <RichTextRenderer
                            content={feat.desc}
                            className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── 9. ABOUT FOUNDER SECTION ──────── */}
        {showFounder && (
        <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
              {executiveLeadership.portraitSrc && (
              <div className="lg:col-span-5 min-w-0 flex justify-center">
                  <div className="relative aspect-[4/5] w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-brand-zinc-200/60 dark:border-white/10 group">
                    <FullImage src={executiveLeadership.portraitSrc} alt={executiveLeadership.portraitAlt || executiveLeadership.founderName || "Founder"} className="group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none" />
                  </div>
              </div>
              )}

              <div className={`${executiveLeadership.portraitSrc ? "lg:col-span-7" : "lg:col-span-12 max-w-4xl"} min-w-0 space-y-8 text-left`}>
                <div className="space-y-4">
                  {executiveLeadership.eyebrow && (
                    <div className="eyebrow-pill">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                      </span>
                      {executiveLeadership.eyebrow}
                    </div>
                  )}

                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                    {executiveLeadership.titleIntro || "Driven by Vision,"}{" "}
                    <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                      {executiveLeadership.titleHighlight || "Grounded in Craft"}
                    </AccentHighlight>
                  </h2>

                  {(hasText(executiveLeadership.founderName) || hasText(executiveLeadership.founderTitle)) && (
                    <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-1">
                      {hasText(executiveLeadership.founderName) && (
                        <span className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white">{executiveLeadership.founderName}</span>
                      )}
                      {hasText(executiveLeadership.founderTitle) && (
                        <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-widest text-[#0306AC] dark:text-[#E9BD36]">{executiveLeadership.founderTitle}</span>
                      )}
                    </p>
                  )}
                </div>

                {hasText(founderBio) && (
                  <div className="space-y-4 text-base sm:text-lg font-sans leading-relaxed text-brand-zinc-600 dark:text-zinc-300">
                    <RichTextRenderer content={founderBio} />
                  </div>
                )}

                {listOf(executiveLeadership.metrics).length > 0 && (
                  <div className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-brand-zinc-200/80 dark:border-white/10 pt-8">
                    {listOf(executiveLeadership.metrics).map((m: any, idx: number) => (
                      <div key={idx} className="space-y-1 text-left">
 <div className="font-cursive text-4xl sm:text-5xl font-black text-[#0306AC] dark:text-[#E9BD36]">{m.value}</div>
                        <span className="text-[10px] font-mono font-bold text-brand-dark dark:text-white uppercase tracking-wider block">{m.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
        )}

        {/* ── 10. REVIEWS CAROUSEL ──────── */}
        {showReviews && (
          <ReviewsCarousel reviewsData={reviews} />
        )}

        {/* ── 11. CTA BANNER SECTION ──────── */}
        {showCta && (
        <section className="relative overflow-hidden bg-white dark:bg-[#080710] section-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
            <div className="cta-banner-card">
              <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[58%] text-left">
                {ctaBanner.eyebrow && (
                  <div className="eyebrow-pill-yellow">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-accent)] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-accent)]" />
                    </span>
                    {ctaBanner.eyebrow}
                  </div>
                )}

                <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                  {ctaBanner.titleIntro || "Let's Engineer Something"}{" "}
                  <span className="inline-block">
                    {ctaBanner.titleWord1 || "Truly"}{" "}
                    <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                      {ctaBanner.titleWord2 || "Remarkable."}
                    </AccentHighlight>
                  </span>
                </h2>

                {ctaBanner.description && (
                  <RichTextRenderer
                    content={ctaBanner.description}
                    className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
                  />
                )}

                <div className="flex items-center gap-4 flex-wrap pt-2">
                  {ctaBanner.ctaPrimaryText && (
                    <CtaButton href={ctaPrimaryHref}>{ctaBanner.ctaPrimaryText}</CtaButton>
                  )}

                  {ctaBanner.ctaSecondaryText && ctaSecondaryHref && (
                    <CtaButton href={ctaSecondaryHref} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{ctaBanner.ctaSecondaryText}</CtaButton>
                  )}
                </div>
              </div>

              <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
                <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
                {ctaBanner.portraitSrc && (
                  <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                    <img src={ctaBanner.portraitSrc} alt={ctaBanner.portraitAlt || ""} loading="lazy" decoding="async" className="w-full h-full object-cover object-top filter contrast-[1.05]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
                <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
              </div>
            </div>
          </div>
        </section>
        )}

      </div>
    </>
  );
}

/* ── Inline Reviews Showcase Component ── */

// One review card. Both marquee rows render this same card (they used to be two hand-copied
// blocks that had drifted: the second row coloured the impact badge differently).
function ReviewCard({ r }: { r: any }) {
  const initial = (r?.name ? String(r.name).trim().charAt(0).toUpperCase() : "") || (typeof r?.initial === "string" ? r.initial.trim() : "");
  return (
    <div className="w-[360px] sm:w-[420px] shrink-0 p-7 sm:p-8 rounded-[32px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/90 dark:border-white/10 shadow-sm relative overflow-hidden flex flex-col justify-between group select-none">
      <div className="space-y-4 relative z-10 text-left">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-1 text-amber-400" aria-hidden="true">
            {[...Array(5)].map((_, si) => (
              <Star key={si} className="h-3.5 w-3.5 fill-current" />
            ))}
          </div>
          {r?.tag && (
            <span className="text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/20 dark:border-white/15 px-3 py-1 rounded-full uppercase tracking-wider">
              ⚡ {r.tag}
            </span>
          )}
        </div>

        {r?.quote && (
          <RichTextRenderer
            content={r.quote}
            className="text-xs sm:text-sm font-sans font-medium text-brand-zinc-700 dark:text-zinc-200 leading-relaxed pt-1"
          />
        )}

        {r?.impact && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 text-[9.5px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>{r.impact}</span>
          </div>
        )}
      </div>

      {(r?.name || r?.role || r?.company) && (
        <div className="pt-5 border-t border-brand-zinc-200/80 dark:border-white/10 mt-6 relative z-10">
          <div className="flex items-center gap-3.5 text-left">
            {initial && (
              <div className="h-10 w-10 rounded-full flex items-center justify-center font-heading font-black text-xs shadow-md shrink-0 border border-white/20" style={{ backgroundColor: r.accent === "#E9BD36" ? "#E9BD36" : "#0306AC", color: r.accent === "#E9BD36" ? "#080710" : "#ffffff" }}>
                {initial}
              </div>
            )}
            <div>
              {r?.name && <span className="block text-xs font-heading font-black text-brand-dark dark:text-white uppercase tracking-wider leading-none">{r.name}</span>}
              {r?.role && <span className="block text-[9.5px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] mt-1 leading-none">{r.role}</span>}
              {r?.company && <span className="block text-[8.5px] font-sans text-brand-zinc-400 dark:text-zinc-400 mt-0.5 leading-none">{r.company}</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsCarousel({ reviewsData }: { reviewsData: any }) {
  const reviewsList: any[] = Array.isArray(reviewsData?.list) ? reviewsData.list : [];
  if (reviewsList.length === 0) return null;

  // The marquee scrolls the track by exactly half its width, so the track is two identical halves
  // and each half must be wider than the viewport or a gap shows at the seam (a couple of
  // reviews on a wide screen used to leave a blank stretch). Repeat the list until a half holds
  // at least 8 cards, and keep the speed constant per card (~4s) whatever the count.
  const reps = Math.max(1, Math.ceil(8 / reviewsList.length));
  const half = Array.from({ length: reps }, () => reviewsList).flat();
  const reversedHalf = half.slice().reverse();
  const track1 = [...half, ...half];
  const track2 = [...reversedHalf, ...reversedHalf];
  const duration = `${Math.max(24, half.length * 4)}s`;

  return (
    <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes marqueeRight {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .marquee-track-left {
          display: flex;
          width: max-content;
          animation: marqueeLeft var(--marquee-duration, 48s) linear infinite;
          will-change: transform;
        }
        .marquee-track-right {
          display: flex;
          width: max-content;
          animation: marqueeRight var(--marquee-duration, 48s) linear infinite;
          will-change: transform;
        }
        .marquee-wrapper:hover .marquee-track-left,
        .marquee-wrapper:hover .marquee-track-right {
          animation-play-state: paused !important;
        }
        @media (prefers-reduced-motion: reduce) {
          .marquee-track-left, .marquee-track-right { animation: none !important; }
        }
      `}</style>

      <div className="relative z-10 space-y-12">
        <div className="text-center flex flex-col items-center space-y-5 max-w-3xl mx-auto px-4">
          {reviewsData.eyebrow && (
            <div className="eyebrow-pill">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
              </span>
              {reviewsData.eyebrow}
            </div>
          )}

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15] max-w-2xl">
            {reviewsData.titleIntro || "Trusted by Founders,"}{" "}
            <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
              {reviewsData.titleHighlight || "Loved by Engineering Teams"}
            </AccentHighlight>
          </h2>

          {reviewsData.description && (
            <RichTextRenderer
              content={reviewsData.description}
              className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 max-w-2xl font-normal leading-relaxed"
            />
          )}

          <div className="pt-1 inline-flex flex-wrap justify-center items-center gap-3 sm:gap-4 rounded-full bg-zinc-100/80 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 px-5 py-2 text-xs font-mono shadow-xs">
            <div className="flex gap-1 text-amber-400" aria-hidden="true">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span className="font-bold text-brand-dark dark:text-white">{reviewsData.ratingValue || "5.0 / 5.0"}</span>
            <span className="text-zinc-300 dark:text-white/20" aria-hidden="true">|</span>
            <span className="text-brand-zinc-600 dark:text-zinc-300 font-medium">{reviewsData.ratingSub || "Verified Reviews"}</span>
          </div>
        </div>

        {/* The repeated cards only exist to make the marquee loop seamlessly: hide the copies from assistive tech. */}
        <div className="marquee-wrapper space-y-8 overflow-hidden py-8" style={{ ["--marquee-duration" as any]: duration }}>
          <div className="flex py-4 overflow-visible" aria-hidden="true">
            <div className="marquee-track-left gap-6 items-stretch py-2">
              {track1.map((r: any, i: number) => (
                <ReviewCard key={`t1-${i}`} r={r} />
              ))}
            </div>
          </div>

          <div className="flex py-4 overflow-visible" aria-hidden="true">
            <div className="marquee-track-right gap-6 items-stretch py-2">
              {track2.map((r: any, i: number) => (
                <ReviewCard key={`t2-${i}`} r={r} />
              ))}
            </div>
          </div>

          {/* One real, screen-reader-only copy of the reviews. */}
          <ul className="sr-only">
            {reviewsList.map((r: any, i: number) => (
              <li key={i}>
                {[r?.name, r?.role, r?.company].filter(Boolean).join(", ")}
                {r?.quote ? `: ${String(r.quote).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}` : ""}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
