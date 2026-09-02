"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";
import {
  ArrowRight,
  Play,
  Star,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Award,
  Globe,
  Briefcase,
  TrendingUp,
  Building2,
  Phone,
  Target,
  Zap,
  Clock,
  Layers,
  ChevronDown,
  Mail,
  User,
  Check,
  ShoppingCart,
  Heart,
  Scale,
  GraduationCap,
  Database,
  Cpu,
  Palette,
  Search,
  Monitor,
  Code,
  Lock,
  MessageSquare
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

// ── Icon Resolver Helper ──────────────────────────────────────────────────────
function getIcon(name?: string, FallbackComponent = Briefcase) {
  if (!name) return FallbackComponent;
  const icons = LucideIcons as any;
  return icons[name] || FallbackComponent;
}

// ── SVG Drawing Underline Animation ──────────────────────────────────────────
const drawVariants = {
  hidden: { pathLength: 0 },
  visible: (custom: { delay: number; duration: number }) => ({
    pathLength: 1,
    transition: {
      duration: custom?.duration ?? 0.5,
      delay: custom?.delay ?? 0.1,
      ease: "easeOut" as any
    }
  })
};

export default function IndustryTemplate({ pageData, params }: { pageData?: any; params?: any }) {
  const { services: cmsServicesData } = useContent();
  const pageContent = pageData?.content || {};
  const industryData = pageContent.industryPage || pageContent || {};

  // ───────────────────────────────────────────────────────────────────────────
  // 1. HERO SECTION DATA & FORM STATE
  // ───────────────────────────────────────────────────────────────────────────
  const hero = {
    eyebrowBadge: industryData.hero?.eyebrowBadge || "INDUSTRY-SPECIFIC DIGITAL ARCHITECTURE",
    titleIntro: industryData.hero?.titleIntro || "High-Converting Platforms Built for",
    titleHighlight: industryData.hero?.titleHighlight || "Industry Leaders",
    titleSuffix: industryData.hero?.titleSuffix || "that Compound Revenue",
    description: industryData.hero?.description || "We engineer bespoke web applications, custom digital architectures, and conversion-first UI/UX tailored specifically for regulated and high-yield commercial industries.",
    primaryCtaText: industryData.hero?.primaryCtaText || "Request Industry Audit",
    primaryCtaLink: industryData.hero?.primaryCtaLink || "#industry-form",
    secondaryCtaText: industryData.hero?.secondaryCtaText || "Explore Sectors",
    secondaryCtaLink: industryData.hero?.secondaryCtaLink || "#sectors",
    highlights: (Array.isArray(industryData.hero?.highlights) && industryData.hero.highlights.length > 0)
      ? industryData.hero.highlights
      : [
        "Tailored Compliance & WCAG / ADA Standards",
        "Sub-Second Page Load Speed on Edge Cloud",
        "Behavioral Funnels Capturing Qualified Commercial Leads"
      ],
    statsPills: (Array.isArray(industryData.hero?.statsPills) && industryData.hero.statsPills.length > 0)
      ? industryData.hero.statsPills
      : [
        { label: "Client Satisfaction", value: "99.8%" },
        { label: "Avg. ROI Compounding", value: "4.8x" }
      ],
    formTitle: industryData.hero?.formTitle || "Get a Free Industry Strategy Session",
    formSubtitle: industryData.hero?.formSubtitle || "Direct architecture consultation with zero sales pressure.",
    formButtonText: industryData.hero?.formButtonText || "Get Free Strategy"
  };

  // Quick Hero Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    industry: "",
    message: ""
  });
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const handleHeroFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          type: "Industry Consultation Request",
          captchaToken: captchaToken,
          subject: `New Industry Lead: ${formData.name} (${formData.industry || "General"})`,
          message: formData.message || `Interested in strategy session for ${formData.industry || "Industry Page"}.`,
          industry: formData.industry
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok || data.success || data.submissionId) {
        setFormSubmitted(true);
        setCaptchaToken("");
      } else {
        setFormError(data.error || "Failed to submit request. Please try again.");
      }
    } catch (err: any) {
      setFormError(err.message || "Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 2. SERVICES SECTION DATA (From ContentSelector or Global Services)
  // ───────────────────────────────────────────────────────────────────────────
  const rawServices = (Array.isArray(industryData.servicesSection?.selectedServices) && industryData.servicesSection.selectedServices.length > 0)
    ? industryData.servicesSection.selectedServices
    : (Array.isArray(industryData.servicesSection?.items) && industryData.servicesSection.items.length > 0)
      ? industryData.servicesSection.items
      : (Array.isArray(cmsServicesData?.services) && cmsServicesData.services.length > 0)
        ? cmsServicesData.services
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
    titleIntro: industryData.servicesSection?.titleIntro || "Comprehensive Solutions Tailored for ",
    titleHighlight: industryData.servicesSection?.titleHighlight || "Market Dominance",
    description: industryData.servicesSection?.description || "Modular, high-performance web engineering services built to address the unique commercial requirements of your sector.",
    items: rawServices.map((srv: any) => ({
      id: srv.id || srv.slug,
      title: srv.title || srv.name || "Specialized Service",
      desc: srv.desc || srv.tagline || srv.description || "Tailored industry digital engineering solution.",
      iconName: srv.iconName || srv.icon || "Code",
      tag: srv.tag || srv.category || "Service",
      href: srv.href || (srv.slug ? `/services/${srv.slug}` : "/services")
    }))
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 3. DOMAIN EXPERTISE / INDUSTRIES SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const domainExpertise = {
    eyebrow: industryData.domainExpertise?.eyebrow || "INDUSTRY SECTORS WE SERVE",
    titleIntro: industryData.domainExpertise?.titleIntro || "Proven Experience Across ",
    titleHighlight: industryData.domainExpertise?.titleHighlight || "Key Market Verticals",
    description: industryData.domainExpertise?.description || "Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical.",
    domains: (Array.isArray(industryData.domainExpertise?.domains) && industryData.domainExpertise.domains.length > 0)
      ? industryData.domainExpertise.domains
      : [
        {
          id: "01",
          title: "Healthcare & MedTech",
          desc: "HIPAA-compliant, trustworthy patient portals and medical practice booking systems.",
          iconName: "Heart",
          tags: ["HIPAA Compliance", "Telehealth", "Patient Portals"]
        },
        {
          id: "02",
          title: "FinTech & Financial Services",
          desc: "Ultra-secure financial dashboards, loan calculators, and bank-grade digital security.",
          iconName: "ShieldCheck",
          tags: ["FinTech", "SOC2 Compliant", "Real-time Telemetry"]
        },
        {
          id: "03",
          title: "E-Commerce & High-Volume Retail",
          desc: "Sub-second product catalogs, custom Shopify headless setups, and frictionless checkouts.",
          iconName: "ShoppingCart",
          tags: ["Headless Commerce", "Shopify Plus", "Conversion Rate"]
        },
        {
          id: "04",
          title: "Legal & Professional Services",
          desc: "Authoritative, lead-generating corporate websites for law firms and consultancy practices.",
          iconName: "Scale",
          tags: ["Lead Capture", "Case Studies", "SEO Authority"]
        },
        {
          id: "05",
          title: "B2B SaaS & Enterprise Technology",
          desc: "Product tour interfaces, documentation hubs, and high-velocity SaaS landing systems.",
          iconName: "Cpu",
          tags: ["SaaS Funnels", "Product Tours", "API Portals"]
        },
        {
          id: "06",
          title: "Real Estate & Architecture",
          desc: "High-resolution property showcases, dynamic MLS mapping, and interactive floorplans.",
          iconName: "Building2",
          tags: ["Property Hubs", "Interactive Maps", "Luxury Design"]
        }
      ]
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 4. ABOUT FOUNDER SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const founder = {
    eyebrow: industryData.founder?.eyebrow || "EXECUTIVE LEADERSHIP & CRAFT",
    titleIntro: industryData.founder?.titleIntro || "Architectural Rigor with ",
    titleHighlight: industryData.founder?.titleHighlight || "Direct Founder Involvement",
    founderName: industryData.founder?.founderName || "Mohsin Lead Architect",
    founderTitle: industryData.founder?.founderTitle || "FOUNDER & PRINCIPAL ARCHITECT",
    portraitSrc: industryData.founder?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: industryData.founder?.portraitAlt || "Mohsin Founder",
    bioParagraph1: industryData.founder?.bioParagraph1 || "At Mohsin Designs, we reject the bloated agency model of endless account managers. Every client works directly with experienced senior engineers and conversion architects.",
    bioParagraph2: industryData.founder?.bioParagraph2 || "We treat every project as a critical revenue engine, combining clean, scalable code with obsessive attention to UI micro-interactions and performance optimization.",
    metrics: (Array.isArray(industryData.founder?.metrics) && industryData.founder.metrics.length > 0)
      ? industryData.founder.metrics
      : [
        { value: "12+", label: "Years Experience" },
        { value: "500+", label: "Projects Delivered" },
        { value: "99.8%", label: "Client Retention" }
      ]
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 5. WHY BUSINESSES CHOOSE US SECTION DATA
  // ───────────────────────────────────────────────────────────────────────────
  const whyChooseUs = {
    eyebrow: industryData.whyChooseUs?.eyebrow || "THE MOHSIN ADVANTAGE",
    titleIntro: industryData.whyChooseUs?.titleIntro || "Why Market Leaders Choose ",
    titleHighlight: industryData.whyChooseUs?.titleHighlight || "Mohsin Designs",
    description: industryData.whyChooseUs?.description || "We deliver measurable advantages through clean code, direct communication, and relentless performance standards.",
    blueCardLine1: industryData.whyChooseUs?.blueCardLine1 || "Direct Senior Architect",
    blueCardLine2: industryData.whyChooseUs?.blueCardLine2 || "Zero Junior Hand-Offs",
    blueCardImage: industryData.whyChooseUs?.blueCardImage || "/founder.png",
    blueCardImageAlt: industryData.whyChooseUs?.blueCardImageAlt || "Architect",
    features: (Array.isArray(industryData.whyChooseUs?.features) && industryData.whyChooseUs.features.length > 0)
      ? industryData.whyChooseUs.features
      : [
        {
          title: "Sub-Second Edge Speeds",
          desc: "Lightning fast asset delivery and edge routing boosting Core Web Vitals to 100/100.",
          iconName: "Zap",
          iconBg: "amber"
        },
        {
          title: "Conversion-First UX Flow",
          desc: "Psychologically optimized layouts engineered to maximize form completions and discovery calls.",
          iconName: "Target",
          iconBg: "blue"
        },
        {
          title: "Clean Modular Code",
          desc: "Zero technical debt. Modular React and Next.js components built to scale effortlessly.",
          iconName: "Code",
          iconBg: "blue"
        },
        {
          title: "Guaranteed Security & Uptime",
          desc: "Serverless cloud infrastructure backed by automatic SSL and 99.9% uptime guarantees.",
          iconName: "ShieldCheck",
          iconBg: "amber"
        }
      ]
  };

  // ───────────────────────────────────────────────────────────────────────────
  // 6. PAGE INLINE FAQS DATA
  // ───────────────────────────────────────────────────────────────────────────
  const faqsList = (Array.isArray(pageContent.faqs) && pageContent.faqs.length > 0)
    ? pageContent.faqs
    : (Array.isArray(pageData?.content?.faqs) && pageData.content.faqs.length > 0)
      ? pageData.content.faqs
      : (Array.isArray(industryData.faqs) && industryData.faqs.length > 0)
        ? industryData.faqs
      : [
        {
          question: "How do you tailor development for regulated industries?",
          answer: "We incorporate industry-specific compliance rules (such as HIPAA, ADA WCAG 2.1, and SOC2 best practices) directly into the code architecture, ensuring rigorous data protection and audit compliance."
        },
        {
          question: "What is your typical project timeline for an industry platform?",
          answer: "Most custom builds are completed in 4 to 6 weeks through structured agile sprints with live staged previews and weekly progress checkpoints."
        },
        {
          question: "Can you migrate our existing site data and SEO rankings safely?",
          answer: "Yes. We implement automated 301 redirect mapping, semantic HTML preservation, and complete metadata transfer so you retain and accelerate your organic search rankings."
        },
        {
          question: "Do we have complete editorial control over content and pages?",
          answer: "Absolutely. Our headless CMS allows your internal marketing team to add new pages, edit text, publish articles, and update media without touching code."
        }
      ];

  // ───────────────────────────────────────────────────────────────────────────
  // 7. FINAL CTA BANNER DATA
  // ───────────────────────────────────────────────────────────────────────────
  const ctaBanner = {
    eyebrow: industryData.ctaBanner?.eyebrow || "READY TO ACCELERATE YOUR GROWTH?",
    titleIntro: industryData.ctaBanner?.titleIntro || "Let's Build Your Next ",
    titleWord1: industryData.ctaBanner?.titleWord1 || "Competitive ",
    titleWord2: industryData.ctaBanner?.titleWord2 || "Advantage.",
    description: industryData.ctaBanner?.description || "Schedule a free 30-minute industry strategy session. We will audit your current presence and deliver an actionable architecture blueprint.",
    ctaPrimaryText: industryData.ctaBanner?.ctaPrimaryText || "Book Strategy Session",
    ctaPrimaryHref: industryData.ctaBanner?.ctaPrimaryHref || "#industry-form",
    ctaSecondaryText: industryData.ctaBanner?.ctaSecondaryText || "Explore Our Work",
    ctaSecondaryHref: industryData.ctaBanner?.ctaSecondaryHref || "/gallery",
    portraitSrc: industryData.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png",
    portraitAlt: industryData.ctaBanner?.portraitAlt || "Mohsin Lead Architect"
  };

  return (
    <main className="min-h-screen bg-white dark:bg-[#06050b] text-brand-dark dark:text-white selection:bg-[#0306AC] selection:text-white transition-colors duration-300">
      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 1. HERO SECTION WITH EMBEDDED RIGHT FORM                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {((hero as any)?.enabled !== false && (industryData as any).hero?.enabled !== false) && (
      <section className="relative overflow-hidden pt-28 pb-16 lg:pt-36 lg:pb-24 border-b border-brand-zinc-200 dark:border-white/10">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#0306AC]/15 dark:from-[#0306AC]/25 to-transparent rounded-full blur-[140px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-gradient-to-br from-[#E9BD36]/10 dark:from-[#E9BD36]/15 to-transparent rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* Left Column: Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {hero.eyebrowBadge && (
                <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 dark:bg-white/10 border border-blue-200/80 dark:border-white/15 px-3.5 py-1.5 text-[10px] font-mono tracking-widest text-[#0306AC] dark:text-[#E9BD36] font-bold uppercase w-fit shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0306AC] dark:bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0306AC] dark:bg-[#E9BD36]" />
                  </span>
                  {hero.eyebrowBadge}
                </div>
              )}

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black leading-[1.12] tracking-tight text-brand-dark dark:text-white">
                {hero.titleIntro}{" "}
                <span className="relative inline-block text-[#0306AC] dark:text-[#E9BD36]">
                  <span className="font-serif italic font-normal">{hero.titleHighlight}</span>
                  <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M 5 6 C 30 9, 70 9, 95 4" />
                  </svg>
                </span>{" "}
                {hero.titleSuffix}
              </h1>

              {hero.description && (
                <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-xl font-normal">
                  {hero.description}
                </p>
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
                      <span className="text-sm sm:text-base font-serif italic font-black text-[#0306AC] dark:text-[#E9BD36]">{stat.value}</span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-zinc-500 dark:text-zinc-400">{stat.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3.5 flex-wrap pt-2">
                {hero.primaryCtaText && (
                  <a href={hero.primaryCtaLink || "#industry-form"} className="btn-primary-cta">
                    <span>{hero.primaryCtaText}</span>
                    <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                  </a>
                )}
                {hero.secondaryCtaText && (
                  <a href={hero.secondaryCtaLink || "#sectors"} className="btn-secondary-cta">
                    <span>{hero.secondaryCtaText}</span>
                    <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Column: High-Converting Lead Form Card */}
            <div id="industry-form" className="lg:col-span-5 relative">
              <div className="relative rounded-[32px] bg-white/95 dark:bg-[#0d0c1b]/95 backdrop-blur-xl border border-brand-zinc-200/90 dark:border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(3,6,172,0.15)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]">

                {/* Form Header */}
                <div className="space-y-1.5 mb-6 text-left">
                  <div className="inline-flex items-center gap-2 text-[9px] font-mono font-bold text-[#0306AC] dark:text-[#E9BD36] uppercase tracking-widest">
                    <Sparkles className="h-3 w-3" />
                    <span>DIRECT ARCHITECT ACCESS</span>
                  </div>
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                    {hero.formTitle}
                  </h3>
                  <p className="text-xs text-brand-zinc-500 dark:text-zinc-400 font-sans">
                    {hero.formSubtitle}
                  </p>
                </div>

                {formSubmitted ? (
                  <div className="p-8 text-center space-y-4 min-h-[300px] flex flex-col items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h4 className="font-heading text-xl font-bold text-brand-dark dark:text-white">Consultation Request Received!</h4>
                    <p className="text-xs text-brand-zinc-550 dark:text-zinc-300 leading-relaxed">
                      Thank you! Our lead architect will review your project requirements and get in touch within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleHeroFormSubmit} className="space-y-4 text-left">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Your Name"
                          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-xs sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                          Work Email *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="you@company.com"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-xs sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-zinc-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="(555) 000-0000"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-xs sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Industry / Sector
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-xs sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all appearance-none"
                      >
                        <option value="" className="text-black dark:text-black">Select Your Industry...</option>
                        <option value="Healthcare & MedTech" className="text-black">Healthcare & MedTech</option>
                        <option value="FinTech & Finance" className="text-black">FinTech & Financial Services</option>
                        <option value="E-Commerce & Retail" className="text-black">E-Commerce & Retail</option>
                        <option value="B2B SaaS & Tech" className="text-black">B2B SaaS & Enterprise Tech</option>
                        <option value="Legal & Professional" className="text-black">Legal & Professional Services</option>
                        <option value="Real Estate & Construction" className="text-black">Real Estate & Construction</option>
                        <option value="Other Industry" className="text-black">Other Commercial Industry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-brand-zinc-700 dark:text-zinc-300 mb-1.5">
                        Project Goals / Notes (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Briefly describe what you're building..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-white/5 border border-brand-zinc-200 dark:border-white/10 text-xs sm:text-sm text-brand-dark dark:text-white focus:border-[#0306AC] dark:focus:border-[#E9BD36] focus:ring-1 focus:ring-[#0306AC] dark:focus:ring-[#E9BD36] outline-none transition-all resize-none"
                      />
                    </div>

                    {formError && (
                      <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs rounded-xl">
                        {formError}
                      </div>
                    )}

                    <TurnstileCaptcha
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken("")}
                      theme="auto"
                    />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-2xl bg-[#0306AC] hover:bg-[#02058e] text-white dark:bg-[#E9BD36] dark:hover:bg-[#ffe554] dark:text-[#080710] font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 cursor-pointer"
                    >
                      <span>{isSubmitting ? "TRANSMITTING..." : hero.formButtonText}</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="text-[10px] text-center text-brand-zinc-400 dark:text-zinc-500 pt-1">
                      🔒 100% Confidential. Zero spam. We never share your data.
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
      {((servicesSec as any)?.enabled !== false && (industryData as any).servicesSection?.enabled !== false && (industryData as any).services?.enabled !== false) && (
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.01]">
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
                {servicesSec.titleIntro}
                <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                  {servicesSec.titleHighlight}
                </span>
              </h2>
            </div>
            {servicesSec.description && (
              <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed max-w-md">
                {servicesSec.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch text-left">
            {servicesSec.items.map((service: any, idx: number) => {
              const ServiceIcon = getIcon(service.iconName || service.icon, Code);
              return (
                <div
                  key={service.id || idx}
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
                        {service.desc || service.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex items-center justify-between">
                    <Link
                      href={service.href || "/services"}
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
      {((domainExpertise as any)?.enabled !== false && (industryData as any).domainExpertise?.enabled !== false) && (
      <section id="sectors" className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
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
                {domainExpertise.titleIntro}
                <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                  {domainExpertise.titleHighlight}
                </span>
              </h2>
            </div>
            {domainExpertise.description && (
              <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed max-w-md">
                {domainExpertise.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch text-left">
            {domainExpertise.domains.map((domain: any, idx: number) => {
              const DomainIcon = getIcon(domain.iconName, ShoppingCart);
              return (
                <div
                  key={domain.id || idx}
                  className="rounded-[32px] bg-zinc-50/90 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between space-y-6 group hover:border-[#0306AC]/60 dark:hover:border-[#E9BD36]/60 transition-all duration-300 shadow-sm hover:shadow-2xl relative overflow-hidden"
                >
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="h-12 w-12 rounded-2xl bg-[#0306AC]/10 dark:bg-white/10 border border-[#0306AC]/15 dark:border-white/15 flex items-center justify-center text-[#0306AC] dark:text-[#E9BD36] group-hover:scale-110 transition-all duration-300 shadow-md">
                        <DomainIcon className="h-5 w-5" />
                      </div>
                      <span className="font-serif italic text-2xl font-black text-brand-zinc-300 dark:text-zinc-600 group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                        {domain.id || `0${idx + 1}`}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-heading text-lg sm:text-xl font-black text-brand-dark dark:text-white tracking-tight group-hover:text-[#0306AC] dark:group-hover:text-[#E9BD36] transition-colors">
                        {domain.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">
                        {domain.desc || domain.description}
                      </p>
                    </div>
                  </div>

                  {Array.isArray(domain.tags) && domain.tags.length > 0 && (
                    <div className="pt-4 border-t border-brand-zinc-200/70 dark:border-white/10 flex flex-wrap gap-1.5 relative z-10">
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
      {((founder as any)?.enabled !== false && (industryData as any).founder?.enabled !== false) && (
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-white/[0.01]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

            {/* Founder Portrait */}
            <div className="lg:col-span-5 flex justify-center">
              {founder.portraitSrc && (
                <div className="relative aspect-[4/5] w-full max-w-[440px] rounded-[32px] overflow-hidden shadow-2xl border border-brand-zinc-200/60 dark:border-white/10 group">
                  <img
                    src={founder.portraitSrc}
                    alt={founder.portraitAlt || "Founder"}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 pointer-events-none"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute left-6 bottom-6 text-white text-left z-10 select-none">
                    <div className="font-heading font-extrabold text-xl tracking-tight leading-none text-white">{founder.founderName}</div>
                    <span className="text-[10px] font-mono text-zinc-300 uppercase tracking-widest block mt-1">{founder.founderTitle}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Founder Narrative & Metrics */}
            <div className="lg:col-span-7 space-y-6 text-left">
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
                {founder.titleIntro}
                <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                  {founder.titleHighlight}
                </span>
              </h2>

              <div className="space-y-4 text-sm sm:text-base font-sans leading-relaxed text-brand-zinc-600 dark:text-zinc-300">
                {founder.bioParagraph1 && <p>{founder.bioParagraph1}</p>}
                {founder.bioParagraph2 && <p>{founder.bioParagraph2}</p>}
              </div>

              {Array.isArray(founder.metrics) && founder.metrics.length > 0 && (
                <div className="grid grid-cols-3 gap-6 sm:gap-8 border-t border-brand-zinc-200/80 dark:border-white/10 pt-6">
                  {founder.metrics.map((m: any, idx: number) => (
                    <div key={idx} className="space-y-1 text-left">
                      <div className="font-serif italic text-3xl sm:text-4xl lg:text-5xl font-black text-[#0306AC] dark:text-[#E9BD36]">{m.value}</div>
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
      {((whyChooseUs as any)?.enabled !== false && (industryData as any).whyChooseUs?.enabled !== false) && (
      <section className="relative overflow-hidden py-16 sm:py-20 lg:py-24 border-b border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#080710]">
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
              {whyChooseUs.titleIntro}
              <span className="text-[#0306AC] dark:text-[#E9BD36] font-serif font-normal italic">
                {whyChooseUs.titleHighlight}
              </span>
            </h2>

            {whyChooseUs.description && (
              <p className="text-xs sm:text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
                {whyChooseUs.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Blue Highlight Card */}
            <div className="lg:col-span-4 relative flex justify-center z-10">
              <div className="relative w-full rounded-[36px] overflow-hidden bg-[#0306AC] border border-[#0306AC] shadow-2xl p-8 sm:p-9 flex flex-col justify-between min-h-[440px] lg:min-h-[500px]">
                <div className="max-w-[220px] space-y-1.5 z-10 text-left">
                  <div className="h-[2.5px] w-7 bg-[#E9BD36] mb-4" />
                  <p className="text-white text-sm sm:text-base font-semibold leading-snug tracking-tight">{whyChooseUs.blueCardLine1}</p>
                  <p className="text-[#E9BD36] text-lg sm:text-xl font-extrabold leading-none pt-1">{whyChooseUs.blueCardLine2}</p>
                </div>

                {whyChooseUs.blueCardImage && (
                  <div className="relative mt-8 -mx-8 sm:-mx-9 -mb-8 sm:-mb-9 rounded-b-[36px] overflow-hidden shadow-inner">
                    <img src={whyChooseUs.blueCardImage} alt={whyChooseUs.blueCardImageAlt || "Feature"} className="w-full h-64 sm:h-72 lg:h-80 object-cover object-center" />
                  </div>
                )}
              </div>
            </div>

            {/* Right Features Grid */}
            <div className="lg:col-span-8 relative z-20 grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {whyChooseUs.features.map((feat: any, idx: number) => {
                const FeatIcon = getIcon(feat.iconName, Target);
                return (
                  <div key={idx} className="p-7 rounded-[28px] bg-zinc-50 dark:bg-[#0c0b18] border border-brand-zinc-200/80 dark:border-white/10 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-start justify-between min-h-[220px] group">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${feat.iconBg === "amber" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-[#E9BD36]" : "bg-blue-50 dark:bg-white/10 text-[#0306AC] dark:text-[#E9BD36]"} group-hover:scale-110 transition-transform`}>
                      <FeatIcon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="h-[2px] w-6 bg-[#0306AC] dark:bg-[#E9BD36] mb-3" />
                      <h3 className="font-heading font-extrabold text-base text-brand-dark dark:text-white tracking-tight mb-1.5">{feat.title}</h3>
                      <p className="text-xs text-brand-zinc-550 dark:text-zinc-400 font-sans leading-relaxed">{feat.desc}</p>
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
      {(pageContent?.faqs?.enabled !== false && pageContent?.faqSection?.enabled !== false && industryData?.faqs?.enabled !== false) && (
        <PageInlineFaqs
          faqs={faqsList}
          faqSchemaMarkup={pageContent.faqSchemaMarkup || industryData.faqSchemaMarkup}
          badge={pageContent.faqBadge || industryData.faqBadge || "INDUSTRY FAQS"}
          title={pageContent.faqTitle || industryData.faqTitle || "Frequently Asked Questions"}
          description={pageContent.faqDescription || industryData.faqDescription || "Key answers regarding our industry-specific architectural workflows and delivery."}
          data={pageContent}
        />
      )}


      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* 7. FINAL HIGH-CONVERSION CTA BANNER SECTION                         */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {((ctaBanner as any)?.enabled !== false && (industryData as any).ctaBanner?.enabled !== false) && (
      <section className="relative overflow-hidden py-12 sm:py-16 bg-white dark:bg-[#080710]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[58%] text-left">
              {ctaBanner.eyebrow && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                  </span>
                  {ctaBanner.eyebrow}
                </div>
              )}

              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.18] tracking-tight text-white">
                {ctaBanner.titleIntro}
                <span className="whitespace-nowrap inline-block">
                  {ctaBanner.titleWord1}
                  <span className="relative inline-block">
                    <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">{ctaBanner.titleWord2}</span>
                    <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                      <path d="M 5 6 C 30 9, 70 9, 95 4" />
                    </svg>
                  </span>
                </span>
              </h2>

              {ctaBanner.description && (
                <p className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg">
                  {ctaBanner.description}
                </p>
              )}

              <div className="flex items-center gap-4 flex-wrap pt-2">
                <a href={ctaBanner.ctaPrimaryHref || "#industry-form"} className="btn-primary-cta">
                  <span>{ctaBanner.ctaPrimaryText}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>
                <a href={ctaBanner.ctaSecondaryHref || "/gallery"} className="btn-secondary-cta">
                  <span>{ctaBanner.ctaSecondaryText}</span>
                  <span className="btn-icon"><Play className="h-3.5 w-3.5 fill-current ml-0.5" /></span>
                </a>
              </div>
            </div>

            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              {ctaBanner.portraitSrc && (
                <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                  <Image src={ctaBanner.portraitSrc} alt={ctaBanner.portraitAlt || "Portrait"} width={320} height={420} className="w-full h-full object-cover object-top filter contrast-[1.05]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                </div>
              )}
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Cursive Font Style Injector */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        .font-cursive {
          font-family: 'Dancing Script', cursive;
        }
      `}} />
    </main>
  );
}
