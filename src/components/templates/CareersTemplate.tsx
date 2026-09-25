"use client";

import CtaButton from "@/components/ui/CtaButton";
import ThemedSelect from "@/components/ui/ThemedSelect";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useState, useRef, useEffect, useId } from 'react';
import { motion } from 'framer-motion';
import { Upload, Briefcase, FileText, User, Mail, Phone, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from '../ui/RichTextRenderer';
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";
import {
  CAREERS_DEFAULTS,
  CAREERS_RESUME_EXTENSIONS,
  CAREERS_RESUME_MAX_BYTES,
  slugifyRole,
} from "@/lib/careersDefaults";

// A blank/whitespace-only string falls back to the default copy (same rule the editor placeholders show).
const text = (value: any, fallback: string): string =>
  typeof value === "string" && value.trim() ? value : fallback;

// True when rich-text HTML has no visible content (e.g. the editor's empty "<p></p>").
const isBlankHtml = (html: any): boolean =>
  typeof html !== "string" || html.replace(/<[^>]*>|&nbsp;/g, "").trim() === "";

const GENERIC_ERROR =
  "We couldn't send your application right now. Please try again in a moment, or email it to us directly.";

export default function CareersTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const { careers: globalCareersData, contact } = useContent() as any;
  // Prefer page-specific content (saved in editor) over the global fallback.
  const savedCareers = pageData?.content?.careers;
  const careersData: any = savedCareers || globalCareersData || {};
  const D = CAREERS_DEFAULTS;

  // ── Resolved copy: every blank field falls back to the same default the editor shows ──
  const section = careersData.section || {};
  const badge = text(section.badge, D.section.badge);
  const headline = text(section.headline, D.section.headline);
  // Description: default only when it was never saved; an explicitly cleared one stays empty.
  const description = savedCareers && section.description !== undefined ? section.description : D.section.description;
  const success = careersData.success || {};
  const successTitle = text(success.title, D.success.title);
  const successDescription = savedCareers && success.description !== undefined ? success.description : D.success.description;
  const L = (Object.keys(D.labels) as (keyof typeof D.labels)[]).reduce((acc, key) => {
    acc[key] = text(careersData.labels?.[key], D.labels[key]);
    return acc;
  }, {} as Record<keyof typeof D.labels, string>);

  // ── Positions: drop blank titles, guarantee a usable + unique option value ──
  const seenValues = new Set<string>();
  const roleOptions: { value: string; label: string }[] = (Array.isArray(careersData.roles) ? careersData.roles : [])
    .map((r: any) => ({ label: String(r?.label ?? "").trim(), value: String(r?.value ?? "").trim() }))
    .filter((r: { label: string }) => r.label)
    .map((r: { label: string; value: string }) => {
      let value = r.value || slugifyRole(r.label);
      while (seenValues.has(value)) value = `${value}-${seenValues.size + 1}`;
      seenValues.add(value);
      return { label: r.label, value };
    });

  // Section visibility. Only an explicit `false` hides (undefined = visible).
  const introVisible = section.enabled !== false;
  const formVisible = careersData.formEnabled !== false;
  // The position dropdown needs at least one position (it is `required`); with none, hide it
  // rather than block every applicant behind an empty, mandatory dropdown.
  const showRoles = careersData.rolesEnabled !== false && roleOptions.length > 0;

  // Contact inbox for the "email it instead" fallback (same address /api/send notifies).
  const fallbackEmail: string = (contact?.email && String(contact.email).match(/[^\s<>"',;]+@[^\s<>"',;]+\.[a-z]{2,}/i)?.[0]) || "info@mohsindesigns.com";

  const uid = useId();
  const ids = { name: `${uid}-name`, email: `${uid}-email`, phone: `${uid}-phone`, role: `${uid}-role`, file: `${uid}-file`, message: `${uid}-message` };

  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [captchaKey, setCaptchaKey] = useState(0);
  // Only ever used as a prop for the widget (no theme-dependent markup), so reading the DOM here is hydration-safe.
  const [captchaTheme, setCaptchaTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackHref, setFallbackHref] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Turnstile's own theme must follow the SITE toggle (html.dark), not the OS setting.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setCaptchaTheme(root.classList.contains("dark") ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  // The long form collapses into a short confirmation card - bring it back into view.
  useEffect(() => {
    if (isSuccess) cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [isSuccess]);

  const clearFile = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName(null);
    setFileError(null);
  };

  // Same limits /api/send enforces (type + 10MB) so the applicant hears about it BEFORE uploading.
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError(null);
    if (!file) {
      setFileName(null);
      return;
    }
    const dot = file.name.lastIndexOf(".");
    const ext = dot !== -1 ? file.name.slice(dot).toLowerCase() : "";
    if (!(CAREERS_RESUME_EXTENSIONS as readonly string[]).includes(ext)) {
      e.target.value = "";
      setFileName(null);
      setFileError("Please upload your resume as a PDF or Word document (.pdf, .doc, .docx).");
      return;
    }
    if (file.size > CAREERS_RESUME_MAX_BYTES) {
      e.target.value = "";
      setFileName(null);
      setFileError("That file is larger than 10MB. Please upload a smaller resume.");
      return;
    }
    setFileName(file.name);
  };

  // The captcha token is single-use (the server consumes it even when the submission is rejected),
  // so after any attempt we remount the widget to get a fresh one for the retry.
  const resetCaptcha = () => {
    setCaptchaToken("");
    setCaptchaKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return; // double-submit guard (Enter key / double click)
    setIsSubmitting(true);
    setErrorMsg(null);
    setFallbackHref(null);

    const formData = new FormData(e.currentTarget);
    // The dropdown option value is an internal slug - send the readable job title instead.
    const chosenRole = roleOptions.find((o) => o.value === formData.get("role"));
    if (chosenRole) formData.set("role", chosenRole.label);
    // No file chosen -> the browser still sends an empty "attachment" part; drop it.
    const attachment = formData.get("attachment");
    if (attachment instanceof File && attachment.size === 0) formData.delete("attachment");

    const applicant = String(formData.get("name") || "").trim();
    formData.append("type", "Job Application");
    // Email subject the recipient sees: who applied and for what.
    formData.append("_subject", `New Job Application${chosenRole ? ` - ${chosenRole.label}` : ""}${applicant ? ` (${applicant})` : ""}`);
    if (captchaToken) {
      formData.append("captchaToken", captchaToken);
    }

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      // /api/send answers 200 + `submissionId` when the application was saved but the notification
      // email failed - still a success for the applicant. A 200 with neither means nothing was stored.
      if (response.ok && (data.success || data.submissionId)) {
        setIsSuccess(true);
        setCaptchaToken("");
      } else {
        console.error("API Submission Error: ", response.status, data.error, data.details);
        const userFixable = response.status >= 400 && response.status < 500 && typeof data.error === "string";
        setErrorMsg(userFixable ? data.error : GENERIC_ERROR);
        if (!userFixable) setFallbackHref(buildMailto(formData, chosenRole?.label, fallbackEmail));
        resetCaptcha();
      }
    } catch (error: any) {
      console.error("Career form submission failed: ", error);
      setErrorMsg("We couldn't reach the server. Please check your connection and try again, or email your application to us directly.");
      setFallbackHref(buildMailto(formData, chosenRole?.label, fallbackEmail));
      resetCaptcha();
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = "text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2";
  const iconClass = "w-4 h-4 text-brand-blue dark:text-brand-yellow";
  const inputClass = "w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-brand-dark dark:text-white dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-yellow outline-none transition-all";

  return (
    // NOTE: a <div>, not <main> - SiteLayout and the [...slug] route already provide the page <main>.
    <div className="bg-white dark:bg-[#080710] min-h-screen font-body w-full overflow-hidden">
      {(introVisible || formVisible) ? (
      <section className="relative overflow-hidden w-full pt-28 md:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: `linear-gradient(to right, #2563eb 1px, transparent 1px), linear-gradient(to bottom, #2563eb 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50 dark:from-brand-blue/20 to-transparent opacity-80 blur-[100px]" />
        <div className="max-w-5xl mx-auto px-4 relative z-30">
          {introVisible ? (
          // Bottom gap only when the form follows (no dead space when the form is hidden).
          <div className={`max-w-3xl mx-auto text-center ${formVisible ? "mb-12 md:mb-24" : ""}`}>
            <PageBreadcrumbs page={pageData} align="center" className="mb-6" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-300 to-blue-500 dark:from-brand-yellow/40 dark:to-brand-yellow" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-blue dark:text-brand-yellow">{badge}</span>
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-500 to-blue-300 dark:from-brand-yellow dark:to-brand-yellow/40" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] font-light text-brand-dark dark:text-white mb-6 leading-tight">
              {(() => {
                // "Expert hands with Visionary minds" -> plain "Expert hands with" + accent line "Visionary minds".
                // (The word "with" stays visible; only whole-word " with " counts as the split point.)
                const m = headline.trim().match(/^(.+?\swith)\s+(.+)$/i);
                if (!m) return headline.trim();
                return (
                  <>
                    {m[1]}<br />
                    <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-900 dark:from-brand-yellow dark:to-amber-400">
                      {m[2]}
                    </span>
                  </>
                );
              })()}
            </motion.h1>
            {!isBlankHtml(description) && (
              <div className="text-brand-zinc-600 dark:text-zinc-300 text-lg md:text-xl font-light max-w-2xl mx-auto px-4">
                <RichTextRenderer content={description} />
              </div>
            )}
          </div>
          ) : (
            // Intro hidden: keep exactly one <h1> on the page for SEO/screen readers.
            <h1 className="sr-only">{pageData?.title || headline}</h1>
          )}

          {formVisible && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div ref={cardRef} className="relative bg-white/80 dark:bg-[#12121e] backdrop-blur-xl rounded-[2rem] shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden border border-white dark:border-white/10 scroll-mt-28">
              {isSuccess ? (
                <div role="status" aria-live="polite" className="p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-green-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-green-600 dark:text-emerald-400" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white mb-4">{successTitle}</h2>
                  {!isBlankHtml(successDescription) && (
                    <div className="text-lg text-brand-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                      <RichTextRenderer content={successDescription} />
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-3">
                      <label htmlFor={ids.name} className={labelClass}><User className={iconClass} />{L.name}</label>
                      <input id={ids.name} type="text" name="name" required autoComplete="name" className={inputClass} />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor={ids.email} className={labelClass}><Mail className={iconClass} />{L.email}</label>
                      <input id={ids.email} type="email" name="email" required autoComplete="email" className={inputClass} />
                    </div>
                    <div className="space-y-3">
                      <label htmlFor={ids.phone} className={labelClass}><Phone className={iconClass} />{L.phone}</label>
                      <input id={ids.phone} type="tel" name="phone" required autoComplete="tel" className={inputClass} />
                    </div>
                  </div>

                  {showRoles && (
                  <div className="space-y-3">
                    <label htmlFor={ids.role} className={labelClass}><Briefcase className={iconClass} />{L.role}</label>
                    <ThemedSelect
                      id={ids.role}
                      name="role"
                      required
                      className="!rounded-xl bg-slate-50/50 dark:!bg-white/5"
                      placeholder={L.roleSelector}
                      options={roleOptions}
                    />
                  </div>
                  )}

                  <div className="space-y-3">
                    <label htmlFor={ids.file} className={labelClass}>
                      <FileText className={iconClass} />
                      {L.attachment}
                    </label>
                    <div className="relative group">
                      <input
                        ref={fileInputRef}
                        id={ids.file}
                        type="file"
                        name="attachment"
                        accept={CAREERS_RESUME_EXTENSIONS.join(",")}
                        onChange={handleFileChange}
                        aria-describedby={fileError ? `${ids.file}-error` : undefined}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className={`w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border border-dashed rounded-xl flex items-center justify-between gap-3 group-hover:border-blue-400 dark:group-hover:border-brand-yellow transition-all ${fileError ? "border-red-400 dark:border-red-500/60" : "dark:border-white/20"}`}>
                        <span className={`min-w-0 truncate font-medium ${fileName ? "text-brand-dark dark:text-white" : "text-brand-zinc-500 dark:text-zinc-400"}`}>{fileName || L.attachmentPlaceholder}</span>
                        <Upload className="w-5 h-5 shrink-0 text-slate-400 dark:text-zinc-400 group-hover:text-brand-blue dark:group-hover:text-brand-yellow" />
                      </div>
                      {fileName && (
                        // Sits above the invisible file input (z-10) so it can be clicked.
                        <button
                          type="button"
                          onClick={clearFile}
                          aria-label="Remove selected file"
                          className="absolute right-14 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {fileError && (
                      <p id={`${ids.file}-error`} role="alert" className="text-sm text-red-600 dark:text-red-400">{fileError}</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label htmlFor={ids.message} className={labelClass}><FileText className={iconClass} />{L.summary}</label>
                    <textarea id={ids.message} name="message" required rows={4} className={inputClass}></textarea>
                  </div>
                  <TurnstileCaptcha
                    key={captchaKey}
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken("")}
                    theme={captchaTheme}
                  />
                  <CtaButton type="submit" fullWidth loading={isSubmitting}>
                    {isSubmitting ? L.submitting : L.submit}
                  </CtaButton>
                  {errorMsg && (
                    <div role="alert" className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm text-center flex flex-col items-center gap-2">
                      <span className="flex items-start gap-2 text-left"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{errorMsg}</span></span>
                      {fallbackHref && (
                        <a href={fallbackHref} className="font-semibold underline underline-offset-2 hover:no-underline">
                          Email my application to {fallbackEmail}
                        </a>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </section>
      ) : (
        <h1 className="sr-only">{pageData?.title || headline}</h1>
      )}
    </div>
  );
}

/** mailto: draft carrying the applicant's typed answers (a browser can't attach the resume for them). */
function buildMailto(formData: FormData, roleLabel: string | undefined, to: string): string {
  const get = (k: string) => String(formData.get(k) ?? "").trim();
  const body = [
    "NEW JOB APPLICATION - MOHSIN DESIGNS",
    "----------------------------------",
    `Name: ${get("name")}`,
    `Email: ${get("email")}`,
    `Phone: ${get("phone")}`,
    `Position: ${roleLabel || get("role") || "-"}`,
    "",
    "MESSAGE:",
    get("message"),
    "",
    "(Please attach your resume to this email.)",
  ].join("\n");
  return `mailto:${to}?subject=${encodeURIComponent(`Job Application - ${get("name")}`)}&body=${encodeURIComponent(body)}`;
}
