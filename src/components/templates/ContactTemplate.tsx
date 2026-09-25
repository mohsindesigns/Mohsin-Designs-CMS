"use client";

import ThemedSelect from "@/components/ui/ThemedSelect";
import CtaButton from "@/components/ui/CtaButton";
import { withTrailingSlash } from "@/lib/url";
import { getValidHref } from "@/lib/utils";
import { parseMapEmbed } from "@/lib/mapEmbed";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "@/components/ui/Link";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowRight,
  Check,
} from "lucide-react";
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";

// Dynamic Lucide Icon Resolver (the admin's icon picker offers every Lucide icon)
function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return <Phone className={className} />;
  const icons = LucideIcons as any;
  const IconComp = icons[name] || icons[name.charAt(0).toUpperCase() + name.slice(1)] || Phone;
  const isValidComponent = typeof IconComp ==="function" || (typeof IconComp ==="object" && IconComp !== null);
  if (isValidComponent) {
    return <IconComp className={className} />;
  }
  return <Phone className={className} />;
}

// The dropdown's real options. (The "Select a service" placeholder is handled separately -
// older saved pages still carry it as the first list entry, see `serviceOptions` below.)
const DEFAULT_SERVICES = [
  "Custom Next.js & React Platform",
  "Conversion Rate Optimization (CRO)",
  "Full-Funnel Growth Marketing",
  "UI/UX Design & Brand System",
  "Technical Architecture Audit",
  "General Consultation"
];

const DEFAULT_METHODS = [
  {
    id: "phone",
    icon: "Phone",
    title: "Direct Phone",
    info: "+1 (555) 019-2834",
    sub: "Mon-Fri: 9am-6pm EST",
    actionHref: "tel:+15550192834"
  },
  {
    id: "email",
    icon: "Mail",
    title: "Direct Email",
    info: "hello@mohsindesigns.com",
    sub: "Response within 24h",
    actionHref: "mailto:hello@mohsindesigns.com"
  },
  {
    id: "chat",
    icon: "MessageSquare",
    title: "Live WhatsApp",
    info: "Direct WhatsApp Line",
    sub: "Fastest response channel",
    actionHref: "https://wa.me/15550192834"
  },
  {
    id: "calendar",
    icon: "Calendar",
    title: "Schedule Call",
    info: "Book 30-Min Strategy Call",
    sub: "Instant calendar confirmation",
    actionHref: "#contact-form"
  }
];

const DEFAULT_MAP_EMBED =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.217709322237!2d-73.98785312342557!3d40.75797477138596!2m3!1f0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus";

// First string wins. An admin-cleared field ("") is respected (element is hidden) instead of
// silently snapping back to demo text; only a field that was never saved (undefined) falls back.
const pick = (...vals: any[]): string => {
  for (const v of vals) if (typeof v ==="string") return v;
  return "";
};

// Rich-text fields save "<p></p>" when emptied
const hasText = (html: string) => html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim().length > 0;

const compact = (s: string) => s.replace(/[^0-9+]/g, "");

// Hosts next/image may optimise (see next.config.ts images.remotePatterns); anything else is
// drawn with a plain <img> so an arbitrary admin-pasted URL can never crash the page.
const NEXT_IMAGE_HOSTS = ["images.unsplash.com", "res.cloudinary.com", "mohsindesigns.com"];
const canUseNextImage = (src: string) => {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return NEXT_IMAGE_HOSTS.includes(new URL(src).hostname);
  } catch {
    return false;
  }
};

// Internal paths use the trailing-slash <Link>; tel:/mailto:/#hash/external use <a>.
function SmartLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return <Link href={href} className={className}>{children}</Link>;
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={withTrailingSlash(href)}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  service: "",
  message: "",
  agreePrivacy: false,
  // honeypot: real visitors never see or fill this; bots do (server drops the lead silently)
  trap: ""
};

export default function ContactTemplate({ pageData }: { pageData?: any }) {
  // Extract contact page content with complete fallbacks
  const rawData = pageData?.content?.contactPage || pageData?.content || {};
  const rawForm = rawData.hero?.form || {};

  const heroVisible = rawData.hero?.enabled !== false;

  // Links to the form only make sense while the form section is shown.
  // undefined -> default, "" -> none (button/card hidden), unsafe (javascript: ...) -> none
  const resolveHref = (raw: unknown, fallback: string): string | null => {
    const value = typeof raw ==="string" ? raw.trim() : fallback;
    if (!value) return null;
    const safe = getValidHref(value);
    if (!safe) return null;
    if (safe === "#contact-form" && !heroVisible) return null;
    return safe;
  };

  // Dropdown: every admin-provided entry is a real, selectable option. A legacy first entry like
  // "Select a service" (older saves) is treated as the placeholder, never as a submittable choice.
  const serviceList: string[] = (Array.isArray(rawForm.services) ? rawForm.services : DEFAULT_SERVICES)
    .filter((s: any) => typeof s ==="string" && s.trim())
    .map((s: string) => s.trim());
  const legacyPlaceholder = serviceList.find((s) => /^select\b/i.test(s));
  const serviceOptions = Array.from(new Set(serviceList.filter((s) => !/^select\b/i.test(s))));

  const hero = {
    eyebrow: pick(rawData.hero?.eyebrow, rawData.header?.badge, "DIRECT CHANNEL // FAST RESPONSE"),
    titleLine1: pick(rawData.hero?.titleLine1, "Let's Engineer Your"),
    titleLine2: pick(rawData.hero?.titleLine2, "Next Big"),
    titleHighlight: pick(rawData.hero?.titleHighlight, rawData.header?.headline, "Advantage."),
    description: pick(rawData.hero?.description, rawData.header?.description, "Whether you need a full platform build, conversion optimization, or technical advisory, we're here to accelerate your vision."),
    // No shipped default: /portfolio_hero_bg.png does not exist in /public (guaranteed 404).
    backgroundImage: pick(rawData.hero?.backgroundImage, rawData.hero?.bgImage),
    form: {
      title: pick(rawForm.title, "Send Us a Message"),
      submitButton: pick(rawForm.submitButton) || "Send Message & Request Proposal",
      guaranteeText: pick(rawForm.guaranteeText, "⚡ Guaranteed response within 24 hours. Strict NDA & privacy assured."),
      services: serviceOptions,
      servicePlaceholder: pick(rawForm.servicePlaceholder, legacyPlaceholder, "Select a service") || "Select a service",
      namePlaceholder: pick(rawForm.namePlaceholder) || "Full Name *",
      emailPlaceholder: pick(rawForm.emailPlaceholder) || "Email Address *",
      phonePlaceholder: pick(rawForm.phonePlaceholder) || "Phone Number",
      companyPlaceholder: pick(rawForm.companyPlaceholder) || "Company (Optional)",
      messagePlaceholder: pick(rawForm.messagePlaceholder) || "Tell us about your project *",
      privacyText: pick(rawForm.privacyText, "I agree to the"),
      privacyLinkText: pick(rawForm.privacyLinkText) || "Privacy Policy",
      privacyHref: getValidHref(pick(rawForm.privacyHref) || "/privacy") || "/privacy",
      successTitle: pick(rawForm.successTitle) || "Message Sent Successfully!",
      successMessage: pick(rawForm.successMessage) || "Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours."
    }
  };

  // Cards: `contactMethods.methods` (editor shape) -> legacy `infoCards` -> demo defaults.
  // An explicitly saved empty list means "no cards" (the section hides) - it must not resurrect the demo cards.
  const rawMethods: any[] = Array.isArray(rawData.contactMethods?.methods)
    ? rawData.contactMethods.methods
    : Array.isArray(rawData.infoCards) && rawData.infoCards.length > 0
      ? rawData.infoCards.map((c: any, i: number) => ({
        id: c.type || String(i),
        icon: c.icon || (c.type === 'phone' ? 'Phone' : c.type === 'email' ? 'Mail' : 'MessageSquare'),
        title: c.title || c.label || "Contact Channel",
        info: c.value || "",
        sub: c.sub || c.description || "Direct communication line",
        actionHref: c.type === 'phone' ? `tel:${c.value}` : c.type === 'email' ? `mailto:${c.value}` : '#contact-form'
      }))
      : DEFAULT_METHODS;

  const contactMethods = {
    eyebrow: pick(rawData.contactMethods?.eyebrow, "COMMUNICATION CHANNELS"),
    title: pick(rawData.contactMethods?.title, "Other Ways to Connect"),
    methods: rawMethods
      .filter((m: any) => m && (String(m.title || "").trim() || String(m.info || "").trim()))
      .map((m: any, i: number) => ({
        key: `${m.id || "method"}-${i}`,
        icon: m.icon,
        title: pick(m.title),
        info: pick(m.info),
        sub: pick(m.sub),
        // blank / unsafe link -> a plain, non-clickable card (never a dead "#" link)
        href: resolveHref(m.actionHref, "")
      }))
  };

  const info = rawData.info || {};
  const officeRaw = rawData.office || {};
  const office = {
    title: pick(officeRaw.title, "OUR HEADQUARTERS"),
    addressLine1: pick(officeRaw.addressLine1, info.address, "1540 Broadway, 24th Floor"),
    addressLine2: pick(officeRaw.addressLine2, "Times Square, New York, NY 10036"),
    country: pick(officeRaw.country, "United States"),
    // Only allow-listed map providers are ever embedded (lib/mapEmbed). Never saved -> demo map;
    // saved blank or not an allowed embed -> no map (and no empty grey box).
    mapEmbedUrl: parseMapEmbed(typeof officeRaw.mapEmbedUrl ==="string" ? officeRaw.mapEmbedUrl : DEFAULT_MAP_EMBED),
    mapBadge: pick(officeRaw.mapBadge, "New York Office"),
    hoursWeekdays: pick(officeRaw.hoursWeekdays, info.hours, "Monday – Friday: 9:00 AM – 6:00 PM EST"),
    hoursWeekends: pick(officeRaw.hoursWeekends, "Saturday – Sunday: By Appointment"),
    phone: pick(officeRaw.phone, info.phone, "+1 (555) 019-2834"),
    email: pick(officeRaw.email, info.email, "hello@mohsindesigns.com")
  };
  const officeAddress2 = [office.addressLine2, office.country].filter((s) => s.trim()).join(", ");
  const officeHasHours = !!(office.hoursWeekdays.trim() || office.hoursWeekends.trim());
  const officeHasCard = !!(office.title.trim() || office.addressLine1.trim() || officeAddress2 || officeHasHours || office.phone.trim() || office.email.trim());
  const officeVisible = rawData.office?.enabled !== false && (!!office.mapEmbedUrl || officeHasCard);

  const ctaRaw = rawData.ctaBanner || {};
  const primaryLabel = pick(ctaRaw.ctaPrimary?.label, "Book Strategy Session");
  const primaryHref = resolveHref(ctaRaw.ctaPrimary?.href, "#contact-form");
  const secondaryLabel = pick(ctaRaw.ctaSecondary?.label, "Direct Office Line");
  const secondaryHref = resolveHref(ctaRaw.ctaSecondary?.href, office.phone.trim() ? `tel:${compact(office.phone)}` : "");
  const ctaBanner = {
    eyebrow: pick(ctaRaw.eyebrow, "READY TO ACCELERATE? "),
    titleIntro: pick(ctaRaw.titleIntro, "Let's Build Your Next"),
    titleHighlight: pick(ctaRaw.titleHighlight, "Competitive Edge"),
    titleLine2: pick(ctaRaw.titleLine2, "Together."),
    description: pick(ctaRaw.description, "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth."),
    // a button needs both a label and a working link, otherwise it is not rendered
    ctaPrimary: primaryLabel.trim() && primaryHref ? { label: primaryLabel, href: primaryHref } : null,
    ctaSecondary: secondaryLabel.trim() && secondaryHref ? { label: secondaryLabel, href: secondaryHref } : null,
    // No shipped default: /founder.png does not exist in /public (guaranteed 404).
    portraitSrc: pick(ctaRaw.portraitSrc).trim(),
    portraitAlt: pick(ctaRaw.portraitAlt, "Mohsin Designs Lead Architect")
  };

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [heroImgFailed, setHeroImgFailed] = useState(false);
  const [portraitFailed, setPortraitFailed] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation so keyboard / screen-reader users notice it
  useEffect(() => {
    if (submitted) successRef.current?.focus();
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submit guard (Enter key / fast double click)
    setSubmitError("");
    setIsSubmitting(true);

    const name = formData.fullName.trim();
    const service = formData.service.trim();

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim(),
          // only sent when the visitor actually picked one (never the placeholder text)
          ...(service ? { service } : {}),
          message: formData.message.trim(),
          type: 'Contact Inquiry',
          captchaToken,
          subject: `New Contact Request: ${name}${service ? ` - ${service}` : ""}`,
          // page the lead came from -> shown as "Origin / Page" in Admin > Submissions
          source: typeof window !=="undefined" ? window.location.pathname : "/contact-us/",
          _hp: formData.trap
        })
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok || result.success || result.submissionId) {
        setSubmitted(true);
        setFormData(EMPTY_FORM);
      } else {
        setSubmitError(result.error || 'Failed to send your message. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submit error:', err);
      // Never pretend it worked: the message was NOT delivered.
      setSubmitError('We could not reach the server. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
      // Turnstile tokens are single-use: remount the widget so a retry gets a fresh one.
      setCaptchaToken("");
      setCaptchaKey((k) => k + 1);
    }
  };

  const showHeroImage = !!hero.backgroundImage.trim() && !heroImgFailed;
  const showPortrait = !!ctaBanner.portraitSrc && !portraitFailed;
  const methodsVisible = rawData.contactMethods?.enabled !== false && rawData.methods?.enabled !== false && contactMethods.methods.length > 0;
  const ctaVisible = rawData.ctaBanner?.enabled !== false;

  const cardClass = "bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 p-6 sm:p-7 rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group relative overflow-hidden";

  return (
    <div className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-12">

      {/* Floating Ambient Mesh Blobs */}
      <div className="absolute top-[1%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-blue/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* ── 1. MAIN CONTACT HERO & FORM SECTION ───────────────────────── */}
      {heroVisible && (
        <section id="contact-form" className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[230px] pb-16 sm:pb-24 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10">
          {/* Full Background Bleed Image (decorative; hidden if it is unset or fails to load) */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
            {showHeroImage && (
              <img
                src={hero.backgroundImage}
                alt=""
                aria-hidden="true"
                onError={() => setHeroImgFailed(true)}
                className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

              {/* LEFT COLUMN: Clean Brand Title & Headline */}
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-5 min-w-0 space-y-6 text-left"
              >
                <PageBreadcrumbs page={pageData} />
                {/* Eyebrow Badge */}
                {hero.eyebrow.trim() && (
                  <div className="flex items-center gap-3">
                    <span className="eyebrow-pill shadow-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {hero.eyebrow}
                    </span>
                    <div className="h-[1px] w-12 bg-brand-zinc-300 dark:bg-zinc-700" />
                  </div>
                )}

                {/* Headline */}
                {(hero.titleLine1.trim() || hero.titleLine2.trim() || hero.titleHighlight.trim()) && (
                  <h1 className="font-heading text-3xl sm:text-4xl lg:text-[42px] font-extrabold leading-[1.18] tracking-tight text-brand-dark dark:text-white">
                    {hero.titleLine1.trim() && <>{hero.titleLine1} <br /></>}
                    {hero.titleLine2.trim() && <>{hero.titleLine2}{" "}</>}
                    {hero.titleHighlight.trim() && (
                      <AccentHighlight className="text-brand-blue dark:text-brand-yellow">
                        {hero.titleHighlight}
                      </AccentHighlight>
                    )}
                  </h1>
                )}

                {/* Subtitle */}
                {hasText(hero.description) && (
                  <RichTextRenderer
                    content={hero.description}
                    className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-md"
                  />
                )}
              </motion.div>

              {/* RIGHT COLUMN: Send Us a Message Form Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 min-w-0 flex justify-center"
              >
                <div className="contact-card-glass p-7 sm:p-10 rounded-[32px] shadow-2xl relative border border-brand-zinc-200/90 dark:border-white/10 overflow-hidden w-full max-w-xl">
                  {hero.form.title.trim() && (
                    <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white mb-6">
                      {hero.form.title}
                    </h2>
                  )}

                  <AnimatePresence>
                    {submitted && (
                      <motion.div
                        ref={successRef}
                        tabIndex={-1}
                        role="status"
                        aria-live="polite"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        className="absolute inset-0 bg-white/98 dark:bg-[#12121e]/98 backdrop-blur-md rounded-[32px] p-8 sm:p-12 flex flex-col items-center justify-center text-center z-30 space-y-4 outline-none"
                      >
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                          <Check className="w-8 h-8" />
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-brand-dark dark:text-white">
                          {hero.form.successTitle}
                        </h3>
                        <p className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
                          {hero.form.successMessage}
                        </p>
                        <button
                          type="button"
                          onClick={() => setSubmitted(false)}
                          className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow hover:underline cursor-pointer pt-2"
                        >
                          Send another message <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isSubmitting}>
                    {submitError && (
                      <div role="alert" className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
                        {submitError}
                      </div>
                    )}

                    {/* Grid Row 1: Full Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          aria-label={hero.form.namePlaceholder.replace(/\s*\*$/, "")}
                          placeholder={hero.form.namePlaceholder}
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="contact-input"
                        />
                      </div>
                      <div>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          aria-label={hero.form.emailPlaceholder.replace(/\s*\*$/, "")}
                          placeholder={hero.form.emailPlaceholder}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="contact-input"
                        />
                      </div>
                    </div>

                    {/* Grid Row 2: Phone & Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          id="contact-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          aria-label={hero.form.phonePlaceholder.replace(/\s*\*$/, "")}
                          placeholder={hero.form.phonePlaceholder}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="contact-input"
                        />
                      </div>
                      <div>
                        <input
                          id="contact-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          aria-label={hero.form.companyPlaceholder.replace(/\s*\*$/, "")}
                          placeholder={hero.form.companyPlaceholder}
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                          className="contact-input"
                        />
                      </div>
                    </div>

                    {/* Service Dropdown Select (hidden when the admin has no options) */}
                    {hero.form.services.length > 0 && (
                      <ThemedSelect
                        value={formData.service}
                        onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        placeholder={hero.form.servicePlaceholder}
                        className="contact-input !flex"
                        options={hero.form.services.map((srv: string) => ({ value: srv, label: srv }))}
                      />
                    )}

                    {/* Project Textarea */}
                    <div>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={4}
                        aria-label={hero.form.messagePlaceholder.replace(/\s*\*$/, "")}
                        placeholder={hero.form.messagePlaceholder}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="contact-input resize-none"
                      />
                    </div>

                    {/* Honeypot - invisible to people and assistive tech, bots fill it */}
                    <input
                      type="text"
                      name="contact_extra_info"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={formData.trap}
                      onChange={(e) => setFormData({ ...formData, trap: e.target.value })}
                      className="absolute left-[-9999px] h-0 w-0 opacity-0"
                    />

                    {/* Privacy Checkbox */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <input
                        type="checkbox"
                        id="privacy"
                        required
                        checked={formData.agreePrivacy}
                        onChange={(e) => setFormData({ ...formData, agreePrivacy: e.target.checked })}
                        className="w-4 h-4 rounded border-brand-zinc-300 text-brand-blue focus:ring-brand-blue cursor-pointer"
                      />
                      <label htmlFor="privacy" className="text-xs font-sans text-brand-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                        {hero.form.privacyText}{hero.form.privacyText.trim() ? " " : ""}
                        <Link
                          href={hero.form.privacyHref}
                          onClick={(e) => e.stopPropagation()}
                          className="text-brand-blue dark:text-brand-yellow font-bold underline"
                        >
                          {hero.form.privacyLinkText}
                        </Link>
                      </label>
                    </div>

                    <TurnstileCaptcha
                      key={captchaKey}
                      onVerify={(token) => setCaptchaToken(token)}
                      onExpire={() => setCaptchaToken("")}
                      theme="auto"
                    />

                    {/* Submit Button */}
                    <CtaButton type="submit" fullWidth loading={isSubmitting} icon={<Send />}>
                      {hero.form.submitButton}
                    </CtaButton>

                    {/* Guarantee Footer */}
                    {hero.form.guaranteeText.trim() && (
                      <p className="text-[11px] font-sans text-center text-brand-zinc-500 dark:text-zinc-400 font-medium pt-1">
                        {hero.form.guaranteeText}
                      </p>
                    )}
                  </form>
                </div>
              </motion.div>

            </div>
          </div>
        </section>
      )}

      {/* Main Content Container. When the hero is hidden nothing slides under the fixed navbar
          any more, so this block has to clear the navbar itself. */}
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 ${heroVisible ? "pt-16" : "pt-32 sm:pt-36"}`}>

        {/* ── 2. OTHER WAYS TO CONNECT (CARDS ROW) ─────────────────── */}
        {methodsVisible && (
          <section className="section-gap">
            {(contactMethods.eyebrow.trim() || contactMethods.title.trim()) && (
              <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
                {contactMethods.eyebrow.trim() && (
                  <span className="text-xs font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">
                    {contactMethods.eyebrow}
                  </span>
                )}
                {contactMethods.title.trim() && (
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white">
                    {contactMethods.title}
                  </h2>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactMethods.methods.map((method) => {
                const body = (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue dark:group-hover:bg-brand-yellow transition-all duration-300">
                      <DynamicIcon name={method.icon} className="w-5 h-5 text-brand-blue dark:text-brand-yellow group-hover:text-white dark:group-hover:text-brand-dark transition-colors" />
                    </div>
                    <div>
                      {method.title.trim() && (
                        <h3 className="font-heading text-lg font-bold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors flex items-center justify-between">
                          <span>{method.title}</span>
                          {method.href && <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-brand-blue dark:text-brand-yellow" />}
                        </h3>
                      )}
                      {method.info.trim() && (
                        <p className="text-xs font-mono font-bold text-brand-dark dark:text-white mt-1.5 break-all">
                          {method.info}
                        </p>
                      )}
                      {method.sub.trim() && (
                        <p className="text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-0.5">
                          {method.sub}
                        </p>
                      )}
                    </div>
                  </div>
                );
                return method.href ? (
                  <SmartLink key={method.key} href={method.href} className={`${cardClass} cursor-pointer`}>
                    {body}
                  </SmartLink>
                ) : (
                  <div key={method.key} className={cardClass}>
                    {body}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── 3. INTERACTIVE MAP & OUR OFFICE SECTION ─────────────────── */}
        {officeVisible && (
          <section className="section-gap">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* Left: Custom Styled Embedded Map */}
              {office.mapEmbedUrl && (
                <div className={`${officeHasCard ? "lg:col-span-7" : "lg:col-span-12"} min-w-0 bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[28px] overflow-hidden shadow-lg min-h-[380px] relative group`}>
                  <iframe
                    title="Office Location Map"
                    src={office.mapEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "380px" }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full filter contrast-[1.05] grayscale-[0.2] dark:invert-[0.9] dark:hue-rotate-180"
                  />
                  {/* Floating pin badge (editor: "Floating Map Pin Badge Text") */}
                  {office.mapBadge.trim() && (
                    <div className="pointer-events-none absolute left-4 top-4 z-10 inline-flex max-w-[calc(100%-2rem)] items-center gap-2 rounded-full border border-brand-zinc-200/90 dark:border-white/15 bg-white/95 dark:bg-[#12121e]/95 px-3.5 py-1.5 text-xs font-bold text-brand-dark dark:text-white shadow-lg backdrop-blur">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-blue dark:text-brand-yellow" />
                      <span className="truncate">{office.mapBadge}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Right: Our Office Card */}
              {officeHasCard && (
                <div className={`${office.mapEmbedUrl ? "lg:col-span-5" : "lg:col-span-12"} min-w-0 bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 p-7 sm:p-9 rounded-[28px] shadow-lg flex flex-col justify-between space-y-6`}>
                  <div className="space-y-3">
                    {office.title.trim() && (
                      <div className="flex items-center gap-2 text-brand-blue dark:text-brand-yellow font-mono text-xs font-black uppercase tracking-widest">
                        <MapPin className="w-4 h-4" />
                        <span>{office.title}</span>
                      </div>
                    )}

                    {office.addressLine1.trim() && (
                      <h2 className="font-heading text-2xl font-extrabold text-brand-dark dark:text-white leading-tight">
                        {office.addressLine1}
                      </h2>
                    )}
                    {officeAddress2 && (
                      <p className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 font-medium">
                        {officeAddress2}
                      </p>
                    )}
                  </div>

                  {(officeHasHours || office.phone.trim() || office.email.trim()) && (
                    <div className="space-y-4 pt-4 border-t border-brand-zinc-200/80 dark:border-white/10 text-xs font-sans">
                      {officeHasHours && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                          </div>
                          <div>
                            {office.hoursWeekdays.trim() && <p className="font-bold text-brand-dark dark:text-white">{office.hoursWeekdays}</p>}
                            {office.hoursWeekends.trim() && <p className="text-brand-zinc-500 dark:text-zinc-400">{office.hoursWeekends}</p>}
                          </div>
                        </div>
                      )}

                      {office.phone.trim() && (
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                          </div>
                          <a href={`tel:${compact(office.phone)}`} className="font-bold text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
                            {office.phone}
                          </a>
                        </div>
                      )}

                      {office.email.trim() && (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                            <Mail className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                          </div>
                          <a href={`mailto:${office.email.trim()}`} className="font-bold text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow transition-colors break-all">
                            {office.email}
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </section>
        )}

        {/* ── 4. SIGNATURE AGENCY CTA BANNER ─────────────────────────── */}
        {ctaVisible && (
          <section className="relative overflow-hidden section-gap">
            <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
              <div className={`relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 ${showPortrait ? "lg:max-w-[62%]" : ""}`}>
                {/* Eyebrow Pill */}
                {ctaBanner.eyebrow.trim() && (
                  <div className="eyebrow-pill-yellow">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--cta-accent)] opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--cta-accent)]" />
                    </span>
                    {ctaBanner.eyebrow}
                  </div>
                )}

                {/* Headline */}
                {(ctaBanner.titleIntro.trim() || ctaBanner.titleHighlight.trim() || ctaBanner.titleLine2.trim()) && (
                  <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.35] tracking-tight text-white">
                    {ctaBanner.titleIntro.trim() && <>{ctaBanner.titleIntro}{" "}</>}
                    {ctaBanner.titleHighlight.trim() && (
                      <>
                        <AccentHighlight className="font-cursive text-[var(--cta-accent)] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                          {ctaBanner.titleHighlight}
                        </AccentHighlight>{" "}
                      </>
                    )}
                    {ctaBanner.titleLine2.trim() && (
                      <>
                        <br className="hidden sm:block" />
                        {ctaBanner.titleLine2}
                      </>
                    )}
                  </h2>
                )}

                {/* Description */}
                {hasText(ctaBanner.description) && (
                  <RichTextRenderer
                    content={ctaBanner.description}
                    className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg"
                  />
                )}

                {/* Primary & Secondary CTAs (each only when it has a label AND a working link) */}
                {(ctaBanner.ctaPrimary || ctaBanner.ctaSecondary) && (
                  <div className="flex items-center gap-4 flex-wrap pt-2">
                    {ctaBanner.ctaPrimary && (
                      <CtaButton href={ctaBanner.ctaPrimary.href}>{ctaBanner.ctaPrimary.label}</CtaButton>
                    )}

                    {ctaBanner.ctaSecondary && (
                      <CtaButton
                        href={ctaBanner.ctaSecondary.href}
                        variant="secondary"
                        {...(/^https?:\/\//i.test(ctaBanner.ctaSecondary.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      >
                        {ctaBanner.ctaSecondary.label}
                      </CtaButton>
                    )}
                  </div>
                )}
              </div>

              {/* Right Side Portrait & Arch Graphic */}
              {showPortrait && (
                <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
                  <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
                  <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                    {canUseNextImage(ctaBanner.portraitSrc) ? (
                      <Image
                        src={ctaBanner.portraitSrc}
                        alt={ctaBanner.portraitAlt}
                        width={320}
                        height={420}
                        onError={() => setPortraitFailed(true)}
                        className="w-full h-full object-cover object-top filter contrast-[1.05]"
                      />
                    ) : (
                      <img
                        src={ctaBanner.portraitSrc}
                        alt={ctaBanner.portraitAlt}
                        loading="lazy"
                        onError={() => setPortraitFailed(true)}
                        className="w-full h-full object-cover object-top filter contrast-[1.05]"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[var(--cta-accent)] shadow-[0_0_15px_var(--cta-accent)] z-20" />
                </div>
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
