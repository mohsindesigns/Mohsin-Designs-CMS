"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useState, FormEvent, MouseEvent } from "react";
import contentDefaults from "@/data/content.json";
import { useContent } from "@/hooks/useContent";

export default function ContactForm({ data }: { data?: any }) {
  const dynamicContent = useContent();
  const cmsContact = dynamicContent?.contact || {};
  
  // Merge hierarchy: explicit data prop > CMS dynamic context > content.json defaults
  const contact = {
    ...contentDefaults.contact,
    ...(cmsContact || {}),
    ...(data || {})
  };

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = contact.errorName || "Please enter your full name";
    if (!formData.email.trim()) {
      newErrors.email = contact.errorEmailRequired || "Email address is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = contact.errorEmailInvalid || "Please enter a valid email address";
    }
    if (!formData.phone.trim()) newErrors.phone = contact.errorPhone || "Please enter your phone number";
    if (!formData.message.trim()) newErrors.message = contact.errorMessage || "Please write a message";
    return newErrors;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError("");
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          type: "Contact Form",
          source: typeof window !== "undefined" ? window.location.pathname : "Contact Form",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to submit form. Please try again.");
      }

      setIsSuccess(true);
    } catch (err: any) {
      console.error("Contact Form Submission Error:", err);
      setServerError(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-[#F9FAFB] dark:bg-[#080710] py-24 md:py-32 border-b border-brand-zinc-200 dark:border-white/10"
    >

      {/* Subtle Light Tilted Grid Lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30 z-0">
        <div
          className="absolute -inset-[50%] w-[200%] h-[200%] rotate-[8deg]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(3, 6, 172, 0.035) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(3, 6, 172, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px"
          }}
        />
      </div>

      {/* Crossing structural grid lines */}
      <div className="absolute inset-y-12 left-0 right-0 h-[1px] bg-brand-blue/[0.03] pointer-events-none" />
      <div className="absolute inset-y-36 left-0 right-0 h-[1px] bg-brand-blue/[0.03] pointer-events-none" />
      <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-brand-blue/[0.03] pointer-events-none" />
      <div className="absolute right-1/4 top-0 bottom-0 w-[1px] bg-brand-blue/[0.03] pointer-events-none" />

      {/* Interactive Cursor-Following Glowing Orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-brand-blue/[0.06] blur-[100px] pointer-events-none hidden md:block"
        animate={{
          x: mousePos.x - 200,
          y: mousePos.y - 200
        }}
        transition={{ type: "spring", damping: 35, stiffness: 160, mass: 0.6 }}
      />
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full bg-brand-yellow/[0.08] blur-[80px] pointer-events-none hidden md:block"
        animate={{
          x: mousePos.x - 150 + 50,
          y: mousePos.y - 150 + 50
        }}
        transition={{ type: "spring", damping: 45, stiffness: 120, mass: 0.9 }}
      />

      {/* Static corner blurs for mobile support */}
      <div className="absolute top-1/4 left-1/4 w-[280px] h-[280px] rounded-full bg-brand-blue/[0.04] blur-[80px] pointer-events-none md:hidden" />
      <div className="absolute bottom-1/4 right-1/4 w-[200px] h-[200px] rounded-full bg-brand-yellow/[0.06] blur-[60px] pointer-events-none md:hidden" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">

        {/* Columns Grid with items-center alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left Column: Integrated Header & Contact Badges */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="eyebrow-pill">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
                </span>
                {contact.sectionTag}
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-brand-dark dark:text-white tracking-tight leading-[1.15]">
                {contact.titleIntro}{" "}
                <span className="text-brand-blue dark:text-brand-yellow font-serif font-normal italic">
                  {contact.titleHighlight}
                </span>
              </h2>
              <p className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg">
                {contact.description}
              </p>
            </div>

            {/* Premium Unified Direct Contact Panel */}
            <div className="bg-white/70 dark:bg-[#12121e]/90 backdrop-blur-xl border border-brand-zinc-200/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_10px_35px_rgba(3,6,172,0.03)] space-y-5 max-w-md">
              <div className="flex items-center justify-between pb-3 border-b border-brand-zinc-200/60 dark:border-white/10">
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow">{contact.directChannelsLabel}</span>
                <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {contact.responseGuarantee}
                </span>
              </div>

              <div className="space-y-4">
                {/* Email Item */}
                <a
                  href={`mailto:${contact.email}`}
                  className="flex items-center gap-4 group/item p-2.5 rounded-2xl hover:bg-brand-blue/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center text-brand-blue dark:text-brand-yellow group-hover/item:scale-105 transition-transform shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">{contact.emailLabel}</span>
                    <span className="text-xs font-black text-brand-dark dark:text-white group-hover/item:text-brand-blue dark:group-hover/item:text-brand-yellow transition-colors font-mono truncate block">
                      {contact.email}
                    </span>
                  </div>
                </a>

                {/* Location Item */}
                {contact.locationHref || contact.locationLink || contact.addressLink ? (
                  <a
                    href={contact.locationHref || contact.locationLink || contact.addressLink}
                    className="flex items-center gap-4 group/item p-2.5 rounded-2xl hover:bg-brand-blue/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center text-brand-blue dark:text-brand-yellow group-hover/item:scale-105 transition-transform shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">{contact.locationLabel || "LOCATION"}</span>
                      <span className="text-xs font-black text-brand-dark dark:text-white group-hover/item:text-brand-blue dark:group-hover/item:text-brand-yellow transition-colors font-mono block">
                        {contact.location}
                      </span>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-4 p-2.5 rounded-2xl">
                    <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center text-brand-blue dark:text-brand-yellow shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">{contact.locationLabel || "LOCATION"}</span>
                      <span className="text-xs font-black text-brand-dark dark:text-white font-mono block">
                        {contact.location}
                      </span>
                    </div>
                  </div>
                )}

                {/* Phone Item */}
                <a
                  href={`tel:${(contact.phone || '').replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-4 group/item p-2.5 rounded-2xl hover:bg-brand-blue/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-brand-blue/10 dark:bg-brand-yellow/10 border border-brand-blue/20 dark:border-brand-yellow/20 flex items-center justify-center text-brand-blue dark:text-brand-yellow group-hover/item:scale-105 transition-transform shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] font-mono font-bold text-brand-zinc-400 uppercase tracking-wider">{contact.phoneLabel}</span>
                    <span className="text-xs font-black text-brand-dark dark:text-white group-hover/item:text-brand-blue dark:group-hover/item:text-brand-yellow transition-colors font-mono block">
                      {contact.phone}
                    </span>
                  </div>
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Elite Premium Support Form Card */}
          <div className="lg:col-span-7 w-full bg-white dark:bg-[#12121e] border border-brand-zinc-200/80 dark:border-white/10 p-6 sm:p-9 md:p-11 rounded-[2.5rem] shadow-[0_20px_60px_rgba(3,6,172,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Top subtle accent gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-blue via-brand-yellow to-brand-blue" />

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                  noValidate
                >
                  <div className="space-y-1 mb-2">
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-brand-dark dark:text-white tracking-tight">
                      {contact.formHeading}
                    </h3>
                    <p className="text-xs text-brand-zinc-500 dark:text-zinc-400 font-medium font-sans">
                      {contact.formSubheading}
                    </p>
                  </div>

                  {serverError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400">
                      {serverError}
                    </div>
                  )}

                  {/* 2-Column Inputs Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-brand-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                        {contact.labelName} *
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder={contact.placeholderName}
                          className={`w-full bg-brand-light dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-xs font-semibold text-brand-dark dark:text-white placeholder-brand-zinc-400 dark:placeholder-zinc-500 focus:ring-4 focus:ring-brand-blue/10 dark:focus:ring-brand-yellow/10 focus:border-brand-blue dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-[#161622] outline-none transition-all ${errors.name ? "border-red-400" : "border-brand-zinc-200 dark:border-white/10"
                            }`}
                        />
                      </div>
                      {errors.name && <span className="text-[10px] font-bold text-red-500 block">{errors.name}</span>}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono font-black text-brand-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                        {contact.labelEmail} *
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder={contact.placeholderEmail}
                          className={`w-full bg-brand-light dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-xs font-semibold text-brand-dark dark:text-white placeholder-brand-zinc-400 dark:placeholder-zinc-500 focus:ring-4 focus:ring-brand-blue/10 dark:focus:ring-brand-yellow/10 focus:border-brand-blue dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-[#161622] outline-none transition-all ${errors.email ? "border-red-400" : "border-brand-zinc-200 dark:border-white/10"
                            }`}
                        />
                      </div>
                      {errors.email && <span className="text-[10px] font-bold text-red-500 block">{errors.email}</span>}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-brand-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                      {contact.labelPhone} *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder={contact.placeholderPhone}
                        className={`w-full bg-brand-light dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-xs font-semibold text-brand-dark dark:text-white placeholder-brand-zinc-400 dark:placeholder-zinc-500 focus:ring-4 focus:ring-brand-blue/10 dark:focus:ring-brand-yellow/10 focus:border-brand-blue dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-[#161622] outline-none transition-all ${errors.phone ? "border-red-400" : "border-brand-zinc-200 dark:border-white/10"
                          }`}
                      />
                    </div>
                    {errors.phone && <span className="text-[10px] font-bold text-red-500 block">{errors.phone}</span>}
                  </div>

                  {/* Message */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono font-black text-brand-zinc-500 dark:text-zinc-400 uppercase tracking-widest block">
                      {contact.labelMessage} *
                    </label>
                    <textarea
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder={contact.placeholderMessage}
                      className={`w-full bg-brand-light dark:bg-white/5 border rounded-2xl px-4 py-3.5 text-xs font-semibold text-brand-dark dark:text-white placeholder-brand-zinc-400 dark:placeholder-zinc-500 focus:ring-4 focus:ring-brand-blue/10 dark:focus:ring-brand-yellow/10 focus:border-brand-blue dark:focus:border-brand-yellow focus:bg-white dark:focus:bg-[#161622] outline-none transition-all resize-none ${errors.message ? "border-red-400" : "border-brand-zinc-200 dark:border-white/10"
                        }`}
                    />
                    {errors.message && <span className="text-[10px] font-bold text-red-500 block">{errors.message}</span>}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-between gap-3 rounded-full bg-brand-blue dark:bg-brand-yellow border border-brand-blue dark:border-brand-yellow pl-7 pr-1.5 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-white dark:text-[#080710] shadow-lg hover:bg-[#0408d9] dark:hover:bg-[#f5ca4a] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto min-w-[200px]"
                    >
                      <span className="whitespace-nowrap">
                        {isSubmitting ? contact.btnSubmitting : contact.btnSubmit}
                      </span>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-dark text-brand-yellow">
                        {isSubmitting ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-yellow border-t-transparent" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                      </span>
                    </button>
                  </div>

                </motion.form>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center text-center py-16 space-y-5"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue text-white shadow-xl shadow-brand-blue/20 animate-bounce">
                    <CheckCircle className="h-10 w-10 text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-2xl font-black text-brand-dark dark:text-white">{contact.successTitle}</h3>
                    <p className="text-sm text-brand-zinc-600 dark:text-zinc-300 font-medium leading-relaxed max-w-md">
                      {contact.successParagraph1}
                      <span className="text-brand-blue dark:text-brand-yellow font-black uppercase mx-1">{formData.name}</span>
                      {contact.successParagraph2}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({ name: "", email: "", phone: "", message: "" });
                    }}
                    className="inline-flex items-center gap-2 text-xs font-mono font-black uppercase tracking-widest text-brand-blue dark:text-brand-yellow hover:underline cursor-pointer pt-4"
                  >
                    {contact.btnSendAnother} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}
