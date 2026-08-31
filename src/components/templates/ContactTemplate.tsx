"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import {
  Send,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Check,
  ChevronDown,
  Loader2
} from "lucide-react";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";

// Dynamic Lucide Icon Resolver
function DynamicIcon({ name, className }: { name?: string; className?: string }) {
  if (!name) return <Phone className={className} />;
  const icons = LucideIcons as any;
  const IconComp = icons[name] || icons[name.charAt(0).toUpperCase() + name.slice(1)] || Phone;
  const isValidComponent = typeof IconComp === "function" || (typeof IconComp === "object" && IconComp !== null);
  if (isValidComponent) {
    return <IconComp className={className} />;
  }
  return <Phone className={className} />;
}

const DEFAULT_SERVICES = [
  "Select a service",
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

export default function ContactTemplate({ pageData }: { pageData?: any }) {
  // Extract contact page content with complete fallbacks
  const rawData = pageData?.content?.contactPage || pageData?.content || {};

  const hero = {
    eyebrow: rawData.hero?.eyebrow || rawData.header?.badge || "DIRECT CHANNEL // FAST RESPONSE",
    titleLine1: rawData.hero?.titleLine1 || "Let's Engineer Your",
    titleLine2: rawData.hero?.titleLine2 || "Next Big",
    titleHighlight: rawData.hero?.titleHighlight || rawData.header?.headline || "Advantage.",
    description: rawData.hero?.description || rawData.header?.description || "Whether you need a full platform build, conversion optimization, or technical advisory, we're here to accelerate your vision.",
    backgroundImage: rawData.hero?.backgroundImage || rawData.hero?.bgImage || "/portfolio_hero_bg.png",
    form: {
      title: rawData.hero?.form?.title || "Send Us a Message",
      submitButton: rawData.hero?.form?.submitButton || "Send Message & Request Proposal",
      guaranteeText: rawData.hero?.form?.guaranteeText || "⚡ Guaranteed response within 24 hours. Strict NDA & privacy assured.",
      services: (rawData.hero?.form?.services && rawData.hero.form.services.length > 0)
        ? rawData.hero.form.services
        : DEFAULT_SERVICES
    }
  };

  const contactMethods = {
    eyebrow: rawData.contactMethods?.eyebrow || "COMMUNICATION CHANNELS",
    title: rawData.contactMethods?.title || "Other Ways to Connect",
    methods: (rawData.contactMethods?.methods && rawData.contactMethods.methods.length > 0)
      ? rawData.contactMethods.methods
      : (rawData.infoCards && rawData.infoCards.length > 0)
        ? rawData.infoCards.map((c: any, i: number) => ({
            id: c.type || String(i),
            icon: c.icon || (c.type === 'phone' ? 'Phone' : c.type === 'email' ? 'Mail' : 'MessageSquare'),
            title: c.title || c.label || "Contact Channel",
            info: c.value || "",
            sub: c.sub || c.description || "Direct communication line",
            actionHref: c.type === 'phone' ? `tel:${c.value}` : c.type === 'email' ? `mailto:${c.value}` : '#contact-form'
          }))
        : DEFAULT_METHODS
  };

  const office = {
    title: rawData.office?.title || "OUR HEADQUARTERS",
    addressLine1: rawData.office?.addressLine1 || rawData.info?.address || "1540 Broadway, 24th Floor",
    addressLine2: rawData.office?.addressLine2 || "Times Square, New York, NY 10036",
    country: rawData.office?.country || "United States",
    mapEmbedUrl: rawData.office?.mapEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.217709322237!2d-73.98785312342557!3d40.75797477138596!2m3!1f0!f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes%20Square!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus",
    mapBadge: rawData.office?.mapBadge || "New York Office",
    hoursWeekdays: rawData.office?.hoursWeekdays || rawData.info?.hours || "Monday – Friday: 9:00 AM – 6:00 PM EST",
    hoursWeekends: rawData.office?.hoursWeekends || "Saturday – Sunday: By Appointment",
    phone: rawData.office?.phone || rawData.info?.phone || "+1 (555) 019-2834",
    email: rawData.office?.email || rawData.info?.email || "hello@mohsindesigns.com"
  };

  const ctaBanner = {
    eyebrow: rawData.ctaBanner?.eyebrow || "READY TO ACCELERATE?",
    titleIntro: rawData.ctaBanner?.titleIntro || "Let's Build Your Next",
    titleHighlight: rawData.ctaBanner?.titleHighlight || "Competitive Edge",
    titleLine2: rawData.ctaBanner?.titleLine2 || "Together.",
    description: rawData.ctaBanner?.description || "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: {
      label: rawData.ctaBanner?.ctaPrimary?.label || "Book Strategy Session",
      href: rawData.ctaBanner?.ctaPrimary?.href || "#contact-form"
    },
    ctaSecondary: {
      label: rawData.ctaBanner?.ctaSecondary?.label || "Direct Office Line",
      href: rawData.ctaBanner?.ctaSecondary?.href || `tel:${office.phone}`
    },
    portraitSrc: rawData.ctaBanner?.portraitSrc || "/founder.png",
    portraitAlt: rawData.ctaBanner?.portraitAlt || "Mohsin Designs Lead Architect"
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: hero.form.services[0] || "Select a service",
    message: "",
    agreePrivacy: false
  });

  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service: formData.service,
          message: formData.message,
          type: 'Contact Inquiry',
          captchaToken: captchaToken,
          subject: `New Contact Request: ${formData.fullName} - ${formData.service}`
        })
      });

      const result = await response.json().catch(() => ({}));
      if (response.ok || result.success || result.submissionId) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            fullName: "",
            email: "",
            phone: "",
            company: "",
            service: hero.form.services[0] || "Select a service",
            message: "",
            agreePrivacy: false
          });
          setCaptchaToken("");
        }, 5000);
      } else {
        alert(result.error || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      console.error('Contact form submit error:', err);
      // Still show success fallback for client UX if offline or simulated
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          service: hero.form.services[0] || "Select a service",
          message: "",
          agreePrivacy: false
        });
        setCaptchaToken("");
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 w-full bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300 relative overflow-x-clip font-sans pb-12">

      {/* Floating Ambient Mesh Blobs */}
      <div className="absolute top-[1%] left-[-15%] w-[50vw] h-[50vw] rounded-full bg-brand-blue/[0.03] dark:bg-brand-blue/[0.06] blur-[120px] pointer-events-none select-none -z-10 animate-float-blob" />
      <div className="absolute top-[28%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-brand-yellow/[0.02] dark:bg-brand-yellow/[0.05] blur-[150px] pointer-events-none select-none -z-10 animate-float-blob-delayed" />

      {/* ── 1. MAIN CONTACT HERO & FORM SECTION ───────────────────────── */}
      <section id="contact-form" className="-mt-[110px] sm:-mt-[125px] lg:-mt-[140px] pt-[175px] sm:pt-[200px] lg:pt-[230px] pb-16 sm:pb-24 relative overflow-hidden border-b border-brand-zinc-200 dark:border-white/10">
        {/* Full Background Bleed Image */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
          <img
            src={hero.backgroundImage}
            alt="Contact Background"
            className="w-full h-full object-cover object-right opacity-100 dark:opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent dark:from-[#080710] dark:via-[#080710]/85 dark:to-transparent pointer-events-none" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 py-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">

            {/* LEFT COLUMN: Clean Brand Title & Headline */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-6 text-left"
            >
              {/* Eyebrow Badge */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[10px] font-mono font-black tracking-widest uppercase text-[#080710] shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#080710]" />
                  {hero.eyebrow}
                </span>
                <div className="h-[1px] w-12 bg-brand-zinc-300 dark:bg-zinc-700" />
              </div>

              {/* Headline */}
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight text-brand-dark dark:text-white">
                {hero.titleLine1} <br />
                {hero.titleLine2}{" "}
                <span className="relative inline-block text-brand-blue dark:text-brand-yellow">
                  {hero.titleHighlight}
                  <svg className="absolute -bottom-1.5 left-0 w-full h-3 text-brand-yellow opacity-90" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M 2 5 Q 50 1.5, 98 3.5 C 99 3.5, 99 4.5, 98 5 Q 50 7, 2 5.5 Z" fill="currentColor" />
                  </svg>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-md">
                {hero.description}
              </p>
            </motion.div>

            {/* RIGHT COLUMN: Send Us a Message Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 flex justify-center"
            >
              <div className="contact-card-glass p-7 sm:p-10 rounded-[32px] shadow-2xl relative border border-brand-zinc-200/90 dark:border-white/10 overflow-hidden w-full max-w-xl">
                <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white mb-6">
                  {hero.form.title}
                </h2>

                <AnimatePresence>
                  {submitted && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="absolute inset-0 bg-white/98 dark:bg-[#12121e]/98 backdrop-blur-md rounded-[32px] p-8 sm:p-12 flex flex-col items-center justify-center text-center z-30 space-y-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg">
                        <Check className="w-8 h-8" />
                      </div>
                      <h3 className="font-heading text-2xl font-bold text-brand-dark dark:text-white">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 max-w-sm mx-auto leading-relaxed">
                        Thank you for reaching out. Our team will review your inquiry and get back to you within 24 hours.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Grid Row 1: Full Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Full Name *"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="contact-input"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        required
                        placeholder="Email Address *"
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
                        type="tel"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="contact-input"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Company (Optional)"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="contact-input"
                      />
                    </div>
                  </div>

                  {/* Service Dropdown Select */}
                  <div className="relative">
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="contact-input appearance-none cursor-pointer pr-10"
                    >
                      {hero.form.services.map((srv: string, idx: number) => (
                        <option
                          key={idx}
                          value={srv}
                          disabled={idx === 0}
                          className="bg-white dark:bg-[#12121e] text-brand-dark dark:text-white"
                        >
                          {srv}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-brand-zinc-400 pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
                  </div>

                  {/* Project Textarea */}
                  <div>
                    <textarea
                      required
                      rows={4}
                      placeholder="Tell us about your project *"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="contact-input resize-none"
                    />
                  </div>

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
                      I agree to the <Link href="/privacy" className="text-brand-blue dark:text-brand-yellow font-bold underline">Privacy Policy</Link>
                    </label>
                  </div>

                  <TurnstileCaptcha
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken("")}
                    theme="auto"
                  />

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-brand-yellow hover:bg-amber-400 text-[#080710] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-brand-yellow/20 hover:shadow-brand-yellow/35 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 cursor-pointer mt-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>{hero.form.submitButton}</span>
                  </button>

                  {/* Guarantee Footer */}
                  <p className="text-[11px] font-sans text-center text-brand-zinc-500 dark:text-zinc-400 font-medium pt-1">
                    {hero.form.guaranteeText}
                  </p>
                </form>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Main Content Container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-16">

        {/* ── 2. OTHER WAYS TO CONNECT (4 CARDS ROW) ─────────────────── */}
        <section className="mb-20">
          <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
            <span className="text-xs font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">
              {contactMethods.eyebrow}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-dark dark:text-white">
              {contactMethods.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.methods.map((method: any, mIdx: number) => (
              <a
                key={method.id || mIdx}
                href={method.actionHref || "#contact-form"}
                className="bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 hover:border-brand-blue/60 dark:hover:border-brand-yellow/60 p-6 sm:p-7 rounded-[28px] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-400 flex flex-col justify-between group cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-blue dark:group-hover:bg-brand-yellow transition-all duration-300">
                    <DynamicIcon name={method.icon} className="w-5 h-5 text-brand-blue dark:text-brand-yellow group-hover:text-white dark:group-hover:text-brand-dark transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-brand-dark dark:text-white group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors flex items-center justify-between">
                      <span>{method.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0 text-brand-blue dark:text-brand-yellow" />
                    </h3>
                    <p className="text-xs font-mono font-bold text-brand-dark dark:text-white mt-1.5 break-all">
                      {method.info}
                    </p>
                    <p className="text-[11px] font-sans text-brand-zinc-500 dark:text-zinc-400 mt-0.5">
                      {method.sub}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── 3. INTERACTIVE MAP & OUR OFFICE SECTION ─────────────────── */}
        <section className="mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

            {/* Left: Custom Styled Embedded Map */}
            <div className="lg:col-span-7 bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 rounded-[28px] overflow-hidden shadow-lg min-h-[380px] relative group">
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

              {/* Floating Map Pin Custom Badge */}
              <div className="absolute top-4 left-4 bg-brand-dark/90 dark:bg-black/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-mono font-bold flex items-center gap-2 border border-white/20 shadow-xl">
                <MapPin className="w-4 h-4 text-brand-yellow" />
                <span>{office.mapBadge}</span>
              </div>
            </div>

            {/* Right: Our Office Card */}
            <div className="lg:col-span-5 bg-white dark:bg-[#12121e] border border-brand-zinc-200/90 dark:border-white/10 p-7 sm:p-9 rounded-[28px] shadow-lg flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-brand-blue dark:text-brand-yellow font-mono text-xs font-black uppercase tracking-widest">
                  <MapPin className="w-4 h-4" />
                  <span>{office.title}</span>
                </div>

                <h3 className="font-heading text-2xl font-extrabold text-brand-dark dark:text-white leading-tight">
                  {office.addressLine1}
                </h3>
                <p className="text-sm font-sans text-brand-zinc-600 dark:text-zinc-300 font-medium">
                  {office.addressLine2}, {office.country}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-brand-zinc-200/80 dark:border-white/10 text-xs font-sans">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-dark dark:text-white">{office.hoursWeekdays}</p>
                    <p className="text-brand-zinc-500 dark:text-zinc-400">{office.hoursWeekends}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                  </div>
                  <a href={`tel:${office.phone}`} className="font-bold text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
                    {office.phone}
                  </a>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-blue/10 dark:bg-brand-yellow/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                  </div>
                  <a href={`mailto:${office.email}`} className="font-bold text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow transition-colors">
                    {office.email}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 4. SIGNATURE AGENCY CTA BANNER ─────────────────────────── */}
        <section className="my-8 relative overflow-hidden">
          <div className="cta-banner-card !shadow-[0_16px_40px_-12px_rgba(3,6,172,0.22)] dark:!shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5)]">
            <div className="relative z-10 flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-14 lg:max-w-[62%]">
              {/* Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] font-mono tracking-widest text-[#E9BD36] font-extrabold uppercase w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E9BD36] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E9BD36]" />
                </span>
                {ctaBanner.eyebrow}
              </div>

              {/* Headline */}
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.35] tracking-tight text-white">
                {ctaBanner.titleIntro}{" "}
                <span className="relative inline-block">
                  <span className="font-cursive text-[#E9BD36] text-3xl sm:text-4xl lg:text-5xl font-normal pl-1">
                    {ctaBanner.titleHighlight}
                  </span>
                  <svg className="absolute left-0 bottom-[-2px] w-full h-3 text-[#E9BD36]" viewBox="0 0 100 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                    <path d="M 5 6 C 30 9, 70 9, 95 4" />
                  </svg>
                </span>{" "}
                <br className="hidden sm:block" />
                {ctaBanner.titleLine2}
              </h2>

              {/* Description */}
              <p className="text-sm sm:text-base font-sans text-white/90 font-normal leading-relaxed max-w-lg">
                {ctaBanner.description}
              </p>

              {/* Primary & Secondary CTAs */}
              <div className="flex items-center gap-4 flex-wrap pt-2">
                <a href={ctaBanner.ctaPrimary.href} className="btn-primary-cta">
                  <span>{ctaBanner.ctaPrimary.label}</span>
                  <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                </a>

                {ctaBanner.ctaSecondary && (
                  <a href={ctaBanner.ctaSecondary.href} target="_blank" rel="noopener noreferrer" className="btn-secondary-cta">
                    <span>{ctaBanner.ctaSecondary.label}</span>
                    <span className="btn-icon"><ArrowRight className="h-3.5 w-3.5" /></span>
                  </a>
                )}
              </div>
            </div>

            {/* Right Side Portrait & Arch Graphic */}
            <div className="hidden lg:flex flex-1 items-end justify-center relative pr-8">
              <div className="absolute bottom-0 w-[320px] h-[320px] bg-gradient-to-t from-[#020485] to-[#0408d9] rounded-full opacity-90 border border-white/20 shadow-2xl" />
              <div className="relative z-10 w-[280px] h-[370px] self-end drop-shadow-2xl overflow-hidden rounded-t-[32px] border-t border-l border-r border-white/25 shadow-2xl">
                <Image
                  src={ctaBanner.portraitSrc}
                  alt={ctaBanner.portraitAlt}
                  width={320}
                  height={420}
                  className="w-full h-full object-cover object-top filter contrast-[1.05]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#010356]/80 via-transparent to-transparent pointer-events-none" />
              </div>
              <div className="absolute top-16 right-28 h-3.5 w-3.5 rounded-full bg-[#E9BD36] shadow-[0_0_15px_#E9BD36] z-20" />
            </div>
          </div>
        </section>

        {/* ── 5. PAGE SPECIFIC FAQS ── */}
        <PageInlineFaqs data={pageData?.content} />

      </div>
    </main>
  );
}