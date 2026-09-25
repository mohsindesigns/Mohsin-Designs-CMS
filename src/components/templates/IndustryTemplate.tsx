"use client";

import CtaButton from "@/components/ui/CtaButton";
import ThemedSelect from "@/components/ui/ThemedSelect";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useEffect, useId, useRef, useState } from "react";
import Link from "@/components/ui/Link";
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";
import { getValidHref } from "@/lib/utils";
import {
  ArrowRight,
  Play,
  CheckCircle2,
  Sparkles,
  Briefcase,
  Target,
  Phone,
  Code,
  Mail,
  User,
  Check,
  ShoppingCart
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";
import { DEFAULT_INDUSTRY_DOMAINS, DEFAULT_INDUSTRY_FEATURES, padIndex } from "./industryDefaults";

// ── Icon Resolver Helper ──────────────────────────────────────────────────────
// Same namespace the admin IconSelector lists from, so every name it can save resolves here.
function getIcon(name?: string, FallbackComponent = Briefcase) {
  if (!name) return FallbackComponent;
  const icons = LucideIcons as any;
  return icons[name] || FallbackComponent;
}

// ── Small text helpers ────────────────────────────────────────────────────────
// Rich-text fields come back from the editor as HTML ("<p></p>" when cleared), so a plain
// truthiness check treats an emptied field as filled. These look at the visible text instead.
const stripHtml = (v: any): string =>
  typeof v === "string" ? v.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim() : "";
const hasText = (v: any): boolean =>
  Array.isArray(v) ? v.some(hasText) : /<img\b/i.test(String(v ?? "")) || stripHtml(v).length > 0;
/** v when it has visible text, otherwise the fallback (blank rich-text -> built-in default). */
const richOr = (v: any, fallback: any) => (hasText(v) ? v : fallback);
const excerpt = (v: any, max = 140): string => {
  const t = stripHtml(v);
  return t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "..." : t;
};
/** Admin-typed link -> a normalised, safe href; falls back when blank/unsafe (never javascript:). */
const safeLink = (raw: any, fallback: string): string => getValidHref(typeof raw === "string" ? raw : "") || fallback;

/**
 * <img> for admin-picked / default artwork. A missing or 404 file used to render the browser's
 * broken-image icon; this reports the failure (onFail) so the caller can drop the frame, and
 * covers the case where the error fired before React hydrated (checks img.complete on mount).
 */
function SafeImg({ src, alt, className, onFail }: { src: string; alt: string; className?: string; onFail?: () => void }) {
  const ref = useRef<HTMLImageElement>(null);
  const [failed, setFailed] = useState(false);
  const fail = () => { setFailed(true); onFail?.(); };
  useEffect(() => {
    setFailed(false);
    const el = ref.current;
    // (SVGs without intrinsic width/height report naturalWidth 0 even when they loaded fine.)
    if (el && el.complete && el.naturalWidth === 0 && !/\.svg(\?|#|$)/i.test(src)) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  if (failed) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt={alt} className={className} loading="lazy" decoding="async" onError={fail} />;
}

export default function IndustryTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { services: cmsServicesData } = useContent();
  const pageContent = pageData?.content || {};
  const industryData = pageContent.industryPage || pageContent || {};
  const formUid = useId();

  // Section visibility, read up-front: several default links depend on it ("#industry-form"
  // only exists while the hero is shown, "#sectors" only while the sectors section is).
  const heroEnabled = industryData.hero?.enabled !== false;
  const servicesEnabled = industryData.servicesSection?.enabled !== false && industryData.services?.enabled !== false;
  const sectorsEnabled = industryData.domainExpertise?.enabled !== false;
  const founderEnabled = industryData.founder?.enabled !== false;
  const whyEnabled = industryData.whyChooseUs?.enabled !== false;
  // FAQ visibility: the FAQ questions live in the admin's generic "Page FAQs" tab, but the
  // hide/show switch is in this template's own editor (writes content.faqSection.enabled).
  const faqEnabled =
    pageContent.faqSection?.enabled !== false &&
    pageContent.faqs?.enabled !== false &&
    industryData.faqs?.enabled !== false;
  const ctaEnabled = industryData.ctaBanner?.enabled !== false;
  // Where "get in touch" links land: the lead form when it is on the page, else the contact page.
  const formHref = heroEnabled ? "#industry-form" : "/contact-us/";

  // ───────────────────────────────────────────────────────────────────────────
  // 1. HERO SECTION DATA & FORM STATE
  // ───────────────────────────────────────────────────────────────────────────
  const hero = {
    eyebrowBadge: industryData.hero?.eyebrowBadge || "INDUSTRY-SPECIFIC DIGITAL ARCHITECTURE",
    titleIntro: industryData.hero?.titleIntro || "High-Converting Platforms Built for",
    titleHighlight: industryData.hero?.titleHighlight || "Industry Leaders",
    titleSuffix: industryData.hero?.titleSuffix || "that Compound Revenue",
    description: industryData.hero?.description !== undefined
      ? industryData.hero.description
      : "We engineer bespoke web applications, custom digital architectures, and conversion-first UI/UX tailored specifically for regulated and high-yield commercial industries.",
    primaryCtaText: industryData.hero?.primaryCtaText || "Request Industry Audit",
    primaryCtaLink: safeLink(industryData.hero?.primaryCtaLink, formHref),
    secondaryCtaText: industryData.hero?.secondaryCtaText || "",
    secondaryCtaLink: safeLink(industryData.hero?.secondaryCtaLink, sectorsEnabled ? "#sectors" : formHref),
    highlights: (Array.isArray(industryData.hero?.highlights))
      ? industryData.hero.highlights.filter((h: any) => typeof h ==="string" && h.trim().length > 0)
      : [],
    statsPills: (Array.isArray(industryData.hero?.statsPills))
      ? industryData.hero.statsPills.filter((s: any) => s && ((typeof s.value ==="string" && s.value.trim().length > 0) || (typeof s.label ==="string" && s.label.trim().length > 0)))
      : [],
    formBadge: industryData.hero?.formBadge || "DIRECT ARCHITECT ACCESS",
    formTitle: industryData.hero?.formTitle || "Get a Free Industry Strategy Session",
    formSubtitle: industryData.hero?.formSubtitle || "Direct architecture consultation with zero sales pressure.",
    formButtonText: industryData.hero?.formButtonText || "Get Free Strategy",
    successTitle: industryData.hero?.successTitle || "Consultation Request Received!",
    successMessage: industryData.hero?.successMessage || "Thank you! Our lead architect will review your project requirements and get in touch within 24 hours.",
    privacyNote: industryData.hero?.privacyNote || "100% Confidential. Zero spam. We never share your data."
  };

  // Quick Hero Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    message: ""
  });
  const [honeypot, setHoneypot] = useState("");
  const [captchaToken, setCaptchaToken] = useState<string>("");
  // Turnstile tokens are single-use: after a failed submit the widget is remounted (new key)
  // to issue a fresh one, otherwise every retry would be rejected as a duplicate token.
  const [captchaKey, setCaptchaKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  // Artwork whose file fails to load is dropped instead of showing a broken-image icon.
  const [founderImgOk, setFounderImgOk] = useState(true);
  const [blueImgOk, setBlueImgOk] = useState(true);
  const [ctaImgOk, setCtaImgOk] = useState(true);

  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaKey((k) => k + 1);
  };

  const handleHeroFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submit guard (the button is also disabled while loading)
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          type: "Industry Consultation Request",
          captchaToken: captchaToken,
          subject: `New Industry Lead: ${formData.name} (${formData.industry || "General"})`,
          message: formData.message || `Interested in strategy session for ${formData.industry || "Industry Page"}.`,
          industry: formData.industry,
          // Which industry page the lead came from (same field the other site forms send).
          source: typeof window !== "undefined" ? window.location.pathname : "Industry Page",
          // Honeypot: hidden from people, bots fill it and /api/send silently drops those.
          _hp: honeypot
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success || data.submissionId) {
        setFormSubmitted(true);
        setCaptchaToken("");
      } else {
        setFormError(data.error || "Failed to submit request. Please try again.");
        resetCaptcha();
      }
    } catch {
      setFormError("Network error. Please check your connection and try again.");
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. SERVICES SECTION DATA (From ContentSelector or Global Services)
  // ───────────────────────────────────────────────────────────────────────────
  // The route injects the live catalog on pageContent.globalServices; the useContent() context
  // copy is only the fallback (see the Services.tsx note about that chain being fragile).
  const catalogAll: any[] = Array.isArray(pageContent.globalServices) && pageContent.globalServices.length > 0
    ? pageContent.globalServices
    : Array.isArray(cmsServicesData?.services) ? cmsServicesData.services : [];
  const isLiveService = (s: any) => !!s && s.status !== "draft" && !s.isTrashed;
  const findLiveService = (sel: any) =>
    catalogAll.find((s: any) => s && ((sel?.slug && s.slug === sel.slug) || (sel?._id && s._id === sel._id) || (sel?.id && s.id === sel.id)));
  // ContentSelector stores a full SNAPSHOT of every ticked service, which goes stale when the
  // service is later renamed / re-slugged / trashed. Re-read each pick from the live catalog;
  // a pick that has since been trashed or set to draft is dropped instead of linking to a 404.
  const curatedServices = (Array.isArray(industryData.servicesSection?.selectedServices) ? industryData.servicesSection.selectedServices : [])
    .filter((sel: any) => sel && typeof sel === "object")
    .map((sel: any) => {
      const live = findLiveService(sel);
      if (!live) return sel;
      return isLiveService(live) ? { ...sel, ...live } : null;
    })
    .filter(Boolean);
  const rawServices = curatedServices.length > 0
    ? curatedServices
    : (Array.isArray(industryData.servicesSection?.items) && industryData.servicesSection.items.length > 0)
      ? industryData.servicesSection.items
      : catalogAll.filter(isLiveService).length > 0
        ? catalogAll.filter(isLiveService)
        : [
            {
              title: "Custom Web Application Engineering",
              desc: "Full-stack React & Next.js architectures built for lightning-fast speeds and high concurrent traffic.",
              iconName: "Code",
              tag: "Next.js 15",
              href: "/services"
            },
            {
              title: "Conversion-Focused UI/UX Design",
              desc: "Clean, frictionless interface design tailored to guide decision-makers through your pipeline.",
              iconName: "Palette",
              tag: "High Yield",
              href: "/services"
            },
            {
              title: "Technical SEO & Schema Optimization",
              desc: "Comprehensive structured data markup and site architectures to dominate commercial keywords.",
              iconName: "Search",
              tag: "Rank #1",
              href: "/services"
            },
            {
              title: "Headless CMS & Content Publishing",
              desc: "Empower your marketing team with flexible, zero-lag editing workflows that scale effortlessly.",
              iconName: "Layers",
              tag: "Modular",
              href: "/services"
            }
          ];

  const servicesSec = {
    eyebrow: industryData.servicesSection?.eyebrow || "OUR CORE DISCIPLINES",
    titleIntro: industryData.servicesSection?.titleIntro || "Comprehensive Solutions Tailored for",
    titleHighlight: industryData.servicesSection?.titleHighlight || "Market Dominance",
    description: richOr(industryData.servicesSection?.description, "Modular, high-performance web engineering services built to address the unique commercial requirements of your sector."),
    items: rawServices.map((srv: any) => ({
      id: srv.id || srv.slug,
      title: srv.title || srv.name || "Specialized Service",
      // Cards are plain text: tagline first, else a short excerpt of the service's own intro.
      desc: stripHtml(srv.desc || srv.tagline || srv.description) || excerpt(srv.hero?.description) || "Tailored industry digital engineering solution.",
      iconName: srv.iconName || srv.icon || "Code",
      tag: srv.tag || srv.category || "Service",
      href: safeLink(srv.href || (srv.slug ? `/services/${srv.slug}` : ""), "/services")
    }))
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. DOMAIN EXPERTISE / INDUSTRIES SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const savedDomains = (Array.isArray(industryData.domainExpertise?.domains) ? industryData.domainExpertise.domains : [])
    .filter((d: any) => d && typeof d === "object");
  const domainExpertise = {
    eyebrow: industryData.domainExpertise?.eyebrow || "INDUSTRY SECTORS WE SERVE",
    titleIntro: industryData.domainExpertise?.titleIntro || "Proven Experience Across",
    titleHighlight: industryData.domainExpertise?.titleHighlight || "Key Market Verticals",
    description: richOr(industryData.domainExpertise?.description, "Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical."),
    // No saved cards yet -> the built-in samples (same list the editor offers to load and edit).
    domains: savedDomains.length > 0 ? savedDomains : DEFAULT_INDUSTRY_DOMAINS
  };

  // "Industry / Sector" dropdown in the lead form: the sectors this page actually lists (so it
  // follows whatever the admin put in the Industry Sectors tab) plus a catch-all.
  const industryOptions = (() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    domainExpertise.domains.forEach((d: any) => {
      const t = stripHtml(d.title);
      if (t && !seen.has(t)) {
        seen.add(t);
        opts.push({ value: t, label: t });
      }
    });
    opts.push({ value: "Other Industry", label: "Other Commercial Industry" });
    return opts;
  })();

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ABOUT FOUNDER SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const founder = {
    eyebrow: industryData.founder?.eyebrow || "EXECUTIVE LEADERSHIP & CRAFT",
    titleIntro: industryData.founder?.titleIntro || "Architectural Rigor with",
    titleHighlight: industryData.founder?.titleHighlight || "Direct Founder Involvement",
    founderName: industryData.founder?.founderName || "",
    founderTitle: industryData.founder?.founderTitle || "",
    portraitSrc: industryData.founder?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: industryData.founder?.portraitAlt || industryData.founder?.founderName || "Mohsin Founder",
    bio: industryData.founder?.bioContent !== undefined
      ? industryData.founder?.bioContent
      : industryData.founder?.bio !== undefined
        ? industryData.founder?.bio
        : (industryData.founder?.bioParagraph1 || industryData.founder?.bioParagraph2)
          ? [industryData.founder?.bioParagraph1, industryData.founder?.bioParagraph2].filter(Boolean).map((p: string) => `<p>${p}</p>`).join("")
          : "<p>At Mohsin Designs, we reject the bloated agency model of endless account managers. Every client works directly with experienced senior engineers and conversion architects.</p><p>We treat every project as a critical revenue engine, combining clean, scalable code with obsessive attention to UI micro-interactions and performance optimization.</p>",
    metrics: (Array.isArray(industryData.founder?.metrics))
      ? industryData.founder.metrics.filter((m: any) => m && ((typeof m.value ==="string" && m.value.trim().length > 0) || (typeof m.label ==="string" && m.label.trim().length > 0)))
      : []
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 5. WHY BUSINESSES CHOOSE US SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const savedFeatures = (Array.isArray(industryData.whyChooseUs?.features) ? industryData.whyChooseUs.features : [])
    .filter((f: any) => f && typeof f === "object");
  const whyChooseUs = {
    eyebrow: industryData.whyChooseUs?.eyebrow || "THE MOHSIN ADVANTAGE",
    titleIntro: industryData.whyChooseUs?.titleIntro || "Why Market Leaders Choose",
    titleHighlight: industryData.whyChooseUs?.titleHighlight || "Mohsin Designs",
    description: richOr(industryData.whyChooseUs?.description, "We deliver measurable advantages through clean code, direct communication, and relentless performance standards."),
    blueCardLine1: industryData.whyChooseUs?.blueCardLine1 || "Direct Senior Architect",
    blueCardLine2: industryData.whyChooseUs?.blueCardLine2 || "Zero Junior Hand-Offs",
    blueCardImage: industryData.whyChooseUs?.blueCardImage || "/founder.png",
    blueCardImageAlt: industryData.whyChooseUs?.blueCardImageAlt || "Architect",
    features: savedFeatures.length > 0 ? savedFeatures : DEFAULT_INDUSTRY_FEATURES
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PAGE INLINE FAQS DATA
  // ───────────────────────────────────────────────────────────────────────────
  // Questions / heading / description / strategy box come from the admin's generic
  // "Page FAQs" tab (content.faqs, faqBadge, faqTitle..., strategyAudit). With none saved
  // the page shows the four industry-specific starters below.
  const faqsList = (Array.isArray(pageContent.faqs) && pageContent.faqs.length > 0)
    ? pageContent.faqs
    : (Array.isArray(industryData.faqs) && industryData.faqs.length > 0)
      ? industryData.faqs
      : [
        {
          question: "How do you tailor development for regulated industries? ",
          answer: "We incorporate industry-specific compliance rules (such as HIPAA, ADA WCAG 2.1, and SOC2 best practices) directly into the code architecture, ensuring rigorous data protection and audit compliance."
        },
        {
          question: "What is your typical project timeline for an industry platform? ",
          answer: "Most custom builds are completed in 4 to 6 weeks through structured agile sprints with live staged previews and weekly progress checkpoints."
        },
        {
          question: "Can you migrate our existing site data and SEO rankings safely? ",
          answer: "Yes. We implement automated 301 redirect mapping, semantic HTML preservation, and complete metadata transfer so you retain and accelerate your organic search rankings."
        },
        {
          question: "Do we have complete editorial control over content and pages? ",
          answer: "Absolutely. Our headless CMS allows your internal marketing team to add new pages, edit text, publish articles, and update media without touching code."
        }
      ];

  // The FAQ box's "Book ... Call" button defaults to the shared "#contact" anchor, which does
  // not exist on this page. Unless the admin typed their own link, point it at the lead form.
  const faqData = {
    ...pageContent,
    strategyAudit: {
      ...(pageContent.strategyAudit || {}),
      href: (typeof pageContent.strategyAudit?.href === "string" && pageContent.strategyAudit.href.trim())
        ? pageContent.strategyAudit.href
        : formHref
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 7. FINAL CTA BANNER DATA
  // ───────────────────────────────────────────────────────────────────────────
  const ctaBanner = {
    eyebrow: industryData.ctaBanner?.eyebrow || "READY TO ACCELERATE YOUR GROWTH? ",
    titleIntro: industryData.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleWord1: industryData.ctaBanner?.titleWord1 || "Competitive",
    titleWord2: industryData.ctaBanner?.titleWord2 || "Advantage.",
    description: richOr(industryData.ctaBanner?.description, "Schedule a free 30-minute industry strategy session. We will audit your current presence and deliver an actionable architecture blueprint."),
    ctaPrimaryText: industryData.ctaBanner?.ctaPrimaryText || "Book Strategy Session",
    ctaPrimaryHref: safeLink(industryData.ctaBanner?.ctaPrimaryHref, formHref),
    ctaSecondaryText: industryData.ctaBanner?.ctaSecondaryText || "Explore Our Work",
    ctaSecondaryHref: safeLink(industryData.ctaBanner?.ctaSecondaryHref, "/gallery"),
    portraitSrc: industryData.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: industryData.ctaBanner?.portraitAlt || "Mohsin Lead Architect"
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#06050b] text-brand-dark dark:text-white selection:bg-[#0306AC] selection:text-white transition-colors duration-300">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION WITH EMBEDDED RIGHT FORM                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {heroEnabled && (
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-brand-zinc-200 dark:border-white/10">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#0306AC]/15 dark:from-[#0306AC]/25 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-gradient-to-br from-[#0306AC]/10 dark:from-[#E9BD36]/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 min-w-0 space-y-6 text-left">
              <PageBreadcrumbs page={pageData} />
              {hero.eyebrowBadge && (
                <div className="eyebrow-pill shadow-xs">
                  {hero.eyebrowBadge}
                </div>
              )}

              <h1 className="font-heading text-3xl sm:text-3xl md:text-[36px] lg:text-[40px] font-black leading-[1.18] tracking-tight text-brand-dark dark:text-white">
                {hero.titleIntro}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-heading font-normal">
                  {hero.titleHighlight}
                </AccentHighlight>{" "}
                {hero.titleSuffix}
              </h1>

              {hasText(hero.description) && (
                <div className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl font-normal">
                  <RichTextRenderer content={hero.description} />
                </div>
              )}

              {/* Highlights Bullet Points */}
              {Array.isArray(hero.highlights) && hero.highlights.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  {hero.highlights.map((point: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-xs sm:text-sm font-medium text-brand-zinc-700 dark:text-zinc-200">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Pills Bar */}
              {Array.isArray(hero.statsPills) && hero.statsPills.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-brand-zinc-200/80 dark:border-white/10">
                  {hero.statsPills.map((stat: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200/70 dark:border-white/10 px-3.5 py-2 rounded-2xl">
 <span className="text-sm sm:text-base font-cursive font-black text-[#0306AC] dark:text-[#E9BD36]">{stat.value}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-zinc-500 dark:text-zinc-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3.5 flex-wrap pt-2">
                {hero.primaryCtaText && (
                  <CtaButton href={hero.primaryCtaLink}>{hero.primaryCtaText}</CtaButton>
                )}
                {hero.secondaryCtaText && (
                  <CtaButton href={hero.secondaryCtaLink} variant="secondary">{hero.secondaryCtaText}</CtaButton>
                )}
              </div>
            </div>

            {/* Right Column: High-Converting Lead Form Card */}
            <div id="industry-form" className="lg:col-span-5 min-w-0 relative">
              <div className="relative rounded-[32px] bg-white/95 dark:bg-[#0d0c1b]/95 backdrop-blur-xl border border-brand-zinc-200/90 dark:border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(3,6,172,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">

                {/* Form Header */}
                <div className="space-y-1.5 mb-6 text-left">
                  {hero.formBadge && (
                    <div className="inline-flex items-center gap-2 text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" />
                      <span>{hero.formBadge}</span>
                    </div>
                  )}
                  {/* h2, not h3: the h1 above is followed directly by this heading */}
                  <h2 className="font-heading text-xl sm:text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                    {hero.formTitle}
                  </h2>
                  <p className="text-xs text-brand-zinc-500 dark:text-zinc-400 font-sans">
                    {hero.formSubtitle}
                  </p>
                </div>

                {formSubmitted ? (
                  <div role="status" aria-live="polite" className="p-8 text-center space-y-4 min-h-[300px] flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="font-heading text-xl font-bold text-brand-dark dark:text-white">{hero.successTitle}</h3>
                    <p className="text-xs text-brand-zinc-550 dark:text-zinc-300 leading-relaxed">
                      {hero.successMessage}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleHeroFormSubmit} className="space-y-4 text-left">
                    <div>
                      <label htmlFor={`${formUid}-name`} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                        <input
                          id={`${formUid}-name`}
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-base sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor={`${formUid}-email`} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                          <input
                            id={`${formUid}-email`}
                            name="email"
                            type="email"
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@company.com"
                            className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-base sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor={`${formUid}-phone`} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                          <input
                            id={`${formUid}-phone`}
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 000-0000"
                            className="w-full pl-9 pr-2 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-base sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`${formUid}-industry`} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Industry / Sector
                      </label>
                      {/* Options = the sector cards listed further down this page (+ "Other"), so the
                          dropdown always matches what the admin put in the Industry Sectors tab. */}
                      <ThemedSelect
                        id={`${formUid}-industry`}
                        name="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="!rounded-xl !py-2.5 !px-3.5 text-base sm:text-sm bg-zinc-50 dark:bg-white/5"
                        placeholder="Select Your Industry..."
                        options={industryOptions}
                      />
                    </div>

                    <div>
                      <label htmlFor={`${formUid}-message`} className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Project Goals / Notes (Optional)
                      </label>
                      <textarea
                        id={`${formUid}-message`}
                        name="message"
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Briefly describe what you're building..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-base sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all resize-none"
                      />
                    </div>

                    {/* Honeypot (see handleHeroFormSubmit): off-screen, unreachable by keyboard, ignored by assistive tech. */}
                    <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                      <label htmlFor={`${formUid}-hp`}>Leave this field empty</label>
                      <input
                        id={`${formUid}-hp`}
                        type="text"
                        name="_hp"
                        tabIndex={-1}
                        autoComplete="off"
                        value={honeypot}
                        onChange={(e) => setHoneypot(e.target.value)}
                      />
                    </div>

                    {formError && (
                      <div role="alert" className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                        {formError}
                      </div>
                    )}

                    <TurnstileCaptcha
                      key={captchaKey}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken("")}
                      theme="auto"
                    />

                    <CtaButton type="submit" fullWidth loading={isSubmitting} icon={<ArrowRight />}>
                      {isSubmitting ? "TRANSMITTING..." : hero.formButtonText}
                    </CtaButton>

                    <p className="text-[10px] text-center text-brand-zinc-400 dark:text-zinc-500 pt-1">
                      <span aria-hidden="true">🔒 </span>{hero.privacyNote}
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 2. SERVICES CAPABILITIES GRID SECTION                               */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {servicesEnabled && (
      <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.01] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-8">
            <div className="max-w-2xl space-y-3">
              {servicesSec.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {servicesSec.eyebrow}
                </div>
              )}
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {servicesSec.titleIntro}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {servicesSec.titleHighlight}
                </AccentHighlight>
              </h2>
            </div>
            {hasText(servicesSec.description) && (
              <RichTextRenderer
                content={servicesSec.description}
                className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed max-w-md"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left">
            {servicesSec.items.map((service: any, idx: number) => {
              const ServiceIcon = getIcon(service.iconName || service.icon, Code);
              return (
                <div
                  key={`${service.id || "service"}-${idx}`}
                  className="rounded-[32px] bg-white dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-7 flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden"
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 group-hover:bg-[#0306AC] group-hover:text-white dark:group-hover:bg-[#E9BD36] dark:group-hover:text-brand-dark transition-all duration-300">
                        <ServiceIcon className="h-5 w-5" />
                      </div>
                      {service.tag && (
                        <span className="bg-zinc-100 dark:bg-white/10 text-brand-dark dark:text-white text-[8.5px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-brand-zinc-200 dark:border-white/10">
                          {service.tag}
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">
                        {service.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex items-center justify-between">
                    <Link
                      href={service.href}
                      className="inline-flex items-center gap-2 text-xs font-mono font-black text-brand-dark dark:text-white group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors"
                    >
                      <span>Learn More</span>
                      <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 3. DOMAIN EXPERTISE / INDUSTRIES SECTION                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {sectorsEnabled && (
      <section id="sectors" className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-left border-b border-brand-zinc-200/80 dark:border-white/10 pb-10">
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
                {domainExpertise.titleIntro}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {domainExpertise.titleHighlight}
                </AccentHighlight>
              </h2>
            </div>
            {hasText(domainExpertise.description) && (
              <div className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed max-w-md">
                <RichTextRenderer content={domainExpertise.description} />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch text-left">
            {domainExpertise.domains.map((domain: any, idx: number) => {
              const DomainIcon = getIcon(domain.iconName, ShoppingCart);
              const rawHref = domain.link || domain.href || domain.url;
              const validHref = getValidHref(rawHref);
              const isExternal = !!validHref && /^https?:\/\//i.test(validHref);

              return (
                <div
                  key={`${domain.id || "domain"}-${idx}`}
                  className={`rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-300 shadow-sm hover:shadow-2xl relative overflow-hidden ${validHref ? "cursor-pointer" : ""}`}
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 transition-all duration-300 shadow-md">
                        <DomainIcon className="h-5 w-5" />
                      </div>
                      <span aria-hidden="true" className="font-cursive text-2xl font-black text-brand-zinc-300 dark:text-zinc-600 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                        {domain.id || padIndex(idx + 1)}
                      </span>
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
                      <div className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed relative z-20 pointer-events-none [&_a]:pointer-events-auto">
                        <RichTextRenderer content={domain.desc || domain.description || ""} />
                      </div>
                    </div>
                  </div>

                  {Array.isArray(domain.tags) && domain.tags.length > 0 && (
                    <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap gap-1.5 relative z-20">
                      {domain.tags.map((tag: string, tIdx: number) => (
                        <span
                          key={tIdx}
                          className="inline-flex items-center gap-1.5 rounded-full bg-white dark:bg-white/5 border border-brand-zinc-200/80 dark:border-white/10 px-2.5 py-0.5 text-[8.5px] font-mono font-bold text-brand-zinc-600 dark:text-zinc-300 uppercase shadow-xs"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-[#0306AC] dark:bg-[#E9BD36]" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 4. ABOUT FOUNDER SECTION                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {founderEnabled && (
      <section className="relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.01] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Founder Portrait (dropped entirely if the image file is missing, so no broken-image frame) */}
            {founder.portraitSrc && founderImgOk && (
              <div className="lg:col-span-5 min-w-0 flex justify-center">
                <div className="relative aspect-[4/5] w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-brand-zinc-200/60 dark:border-white/10 group">
                  <SafeImg
                    src={founder.portraitSrc}
                    alt={founder.portraitAlt || "Founder"}
                    onFail={() => setFounderImgOk(false)}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                  />
                  {/* Name / title caption: over a permanent dark scrim so it reads in light AND dark theme */}
                  {(founder.founderName || founder.founderTitle) && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-6 pb-6 pt-16 text-left">
                      {founder.founderName && (
                        <p className="font-heading text-lg sm:text-xl font-black leading-tight text-white">{founder.founderName}</p>
                      )}
                      {founder.founderTitle && (
                        <p className="mt-1 text-[10px] font-mono font-bold uppercase tracking-wider text-[#E9BD36]">{founder.founderTitle}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Founder Narrative & Metrics */}
            <div className={`${founder.portraitSrc && founderImgOk ? "lg:col-span-7" : "lg:col-span-12"} min-w-0 space-y-6 text-left`}>
              {founder.eyebrow && (
                <div className="eyebrow-pill">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {founder.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {founder.titleIntro}{" "}
                <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                  {founder.titleHighlight}
                </AccentHighlight>
              </h2>

              {hasText(founder.bio) && (
                <div className="text-sm sm:text-base font-sans leading-relaxed text-brand-zinc-600 dark:text-zinc-300">
                  <RichTextRenderer content={founder.bio} className="space-y-4" />
                </div>
              )}

              {Array.isArray(founder.metrics) && founder.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-6 sm:gap-8 border-t border-brand-zinc-200/80 dark:border-white/10 pt-6">
                  {founder.metrics.map((m: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-left">
                      <div className="font-cursive text-3xl sm:text-4xl lg:text-5xl font-black text-[#0306AC] dark:text-[#E9BD36]">{m.value}</div>
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

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 5. WHY BUSINESSES CHOOSE US SECTION                                 */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {whyEnabled && (
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
              {whyChooseUs.titleIntro}{" "}
              <AccentHighlight className="text-[#0306AC] dark:text-[#E9BD36] font-cursive font-normal">
                {whyChooseUs.titleHighlight}
              </AccentHighlight>
            </h2>

            {hasText(whyChooseUs.description) && (
              <RichTextRenderer
                content={whyChooseUs.description}
                className="text-xs sm:text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto"
              />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Blue Highlight Card */}
            <div className="lg:col-span-4 min-w-0 relative flex justify-center z-10">
              <div className="relative w-full rounded-[36px] overflow-hidden bg-[#0306AC] border border-[#0306AC] shadow-2xl p-8 sm:p-9 flex flex-col justify-between min-h-[440px] lg:min-h-[500px]">
                <div className="max-w-[220px] space-y-1.5 z-10 text-left">
                  <div className="h-[2.5px] w-7 bg-[#E9BD36] mb-4" />
                  <p className="text-white text-sm sm:text-base font-semibold leading-snug tracking-tight">{whyChooseUs.blueCardLine1}</p>
                  <p className="text-[#E9BD36] text-lg sm:text-xl font-extrabold leading-none pt-1">{whyChooseUs.blueCardLine2}</p>
                </div>

                {whyChooseUs.blueCardImage && blueImgOk && (
                  <div className="relative mt-8 -mx-8 sm:-mx-9 -mb-8 sm:-mb-9 rounded-b-[36px] overflow-hidden shadow-inner">
                    <SafeImg
                      src={whyChooseUs.blueCardImage}
                      alt={whyChooseUs.blueCardImageAlt || "Feature"}
                      onFail={() => setBlueImgOk(false)}
                      className="w-full h-64 sm:h-72 lg:h-80 object-cover object-center"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Right Features Grid */}
            <div className="lg:col-span-8 min-w-0 relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {whyChooseUs.features.map((feat: any, idx: number) => {
                const FeatIcon = getIcon(feat.iconName, Target);
                return (
                  <div key={`${feat.title || "feature"}-${idx}`} className="p-7 rounded-[28px] bg-zinc-50 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-start justify-between min-h-[220px] group">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${feat.iconBg ==="amber" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#E9BD36]" : "bg-blue-50 dark:bg-white/10 text-[#0306AC] dark:text-[#E9BD36]"} group-hover:scale-110 transition-transform`}>
                      <FeatIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="h-[2px] w-6 bg-[#0306AC] dark:bg-[#E9BD36] mb-3" />
                      <h3 className="font-heading font-extrabold text-base text-brand-dark dark:text-white tracking-tight mb-1.5">{feat.title}</h3>
                      <RichTextRenderer
                        content={feat.desc}
                        className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 6. PAGE INLINE FAQS SECTION                                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {faqEnabled && (
        <PageInlineFaqs
          faqs={faqsList}
          faqSchemaMarkup={pageContent.faqSchemaMarkup || industryData.faqSchemaMarkup}
          badge={pageContent.faqBadge || industryData.faqBadge || "INDUSTRY FAQS"}
          title={pageContent.faqTitle || industryData.faqTitle || "Frequently Asked Questions"}
          description={pageContent.faqDescription || industryData.faqDescription || "Key answers regarding our industry-specific architectural workflows and delivery."}
          data={faqData}
        />
      )}


      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. FINAL HIGH-CONVERSION CTA BANNER SECTION                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {ctaEnabled && (
      <section className="relative overflow-hidden bg-white dark:bg-[#080710] section-y">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
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
                {ctaBanner.titleIntro}{" "}
                <span className="inline-block">
                  {ctaBanner.titleWord1}
                  <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {ctaBanner.titleWord2}
                  </AccentHighlight>
                </span>
              </h2>

              {hasText(ctaBanner.description) && (
                <RichTextRenderer
                  content={ctaBanner.description}
                  className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
                />
              )}

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <CtaButton href={ctaBanner.ctaPrimaryHref}>{ctaBanner.ctaPrimaryText}</CtaButton>
                <CtaButton href={ctaBanner.ctaSecondaryHref} variant="secondary" icon={<Play className="fill-current ml-0.5" />}>{ctaBanner.ctaSecondaryText}</CtaButton>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              {ctaBanner.portraitSrc && ctaImgOk && (
                <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                  {/* plain <img>: the admin can pick any media URL, and next/image throws for hosts missing from next.config */}
                  <SafeImg src={ctaBanner.portraitSrc} alt={ctaBanner.portraitAlt || "Portrait"} onFail={() => setCtaImgOk(false)} className="w-full h-full object-cover object-top filter contrast-[1.05]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
            </div>
          </div>
        </div>
      </section>
      )}
      {/* .font-cursive (Dancing Script) is defined once in globals.css + tailwind.config - no per-page @import injector needed */}
    </div>
  );
}
