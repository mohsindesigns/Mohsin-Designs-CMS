"use client";

import CtaButton from "@/components/ui/CtaButton";
import ThemedSelect from "@/components/ui/ThemedSelect";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, Send, Briefcase, FileText, User, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from '../ui/RichTextRenderer';
import PageInlineFaqs from "@/components/PageInlineFaqs";
import TurnstileCaptcha from "@/components/ui/TurnstileCaptcha";

const Images = {
  Pattern: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
};

const ParallaxLayer = ({ children, speed = 0.1, className = "", sectionRef }: any) => {
  const ref = useRef<any>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"]
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, speed * 50]);
  return (
    <motion.div ref={ref} style={{ y }} className={`absolute inset-0 will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
};

export default function CareersTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const { careers: globalCareersData } = useContent();
  // Prefer page-specific content (saved in editor) over global fallback
  const careersData = pageData?.content?.careers || globalCareersData;
  const [fileName, setFileName] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    const formData = new FormData(e.currentTarget);
    formData.append("type", "Job Application");
    formData.append("_subject", "New Job Application - Mohsin Designs");
    if (captchaToken) {
      formData.append("captchaToken", captchaToken);
    }

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success || data.submissionId) {
        setIsSuccess(true);
        setCaptchaToken("");
      } else {
        // Log the specific error from API
        console.error("API Submission Error: ", data.error, data.details);
        throw new Error(data.error || "Form submission failed");
      }
    } catch (error: any) {
      console.error("Career form fallback triggered: ", error);

      // Fallback to mailto if API fails
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const role = formData.get("role");
      const message = formData.get("message");

      const emailContent = `
NEW JOB APPLICATION - MOHSIN DESIGNS
----------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Position: ${role}

MESSAGE:
${message}

(Note: Please attach your resume manually to this email)
      `;

      const mailtoLink = `mailto:info@mohsindesigns.com?subject=Job Application - ${name}&body=${encodeURIComponent(emailContent)}`;

      // We still set success to true because the user is being redirected to their email client
      // but we can also set a small note or alert if we want.
      window.location.href = mailtoLink;
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white dark:bg-[#080710] min-h-screen font-body w-full overflow-hidden">
      {(careersData?.enabled !== false) && (
      <section className="relative overflow-hidden w-full pt-28 md:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" style={{ backgroundImage: `linear-gradient(to right, #2563eb 1px, transparent 1px), linear-gradient(to bottom, #2563eb 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50 dark:from-brand-blue/20 to-transparent opacity-80 blur-[100px]" />
        <div className="max-w-5xl mx-auto px-4 relative z-30">
          {careersData?.section?.enabled !== false && (
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-24">
            <PageBreadcrumbs page={pageData} align="center" className="mb-6" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-300 to-blue-500 dark:from-brand-yellow/40 dark:to-brand-yellow" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-brand-blue dark:text-brand-yellow">{careersData?.section?.badge || "Join Mohsin Designs"}</span>
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-500 to-blue-300 dark:from-brand-yellow dark:to-brand-yellow/40" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-3xl sm:text-4xl md:text-[40px] lg:text-[44px] font-light text-brand-dark dark:text-white mb-6 leading-tight">
              {(() => {
                const rawHeadline = careersData?.section?.headline || "Build the Future with Us";
                const parts = rawHeadline.includes('with') ? rawHeadline.split('with') : [rawHeadline, ""];
                return (
                  <>
                    {parts[0]} {parts[1] ? <br /> : null}
                    {parts[1] && (
                      <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-900 dark:from-brand-yellow dark:to-amber-400">
                        {parts[1]}
                      </span>
                    )}
                  </>
                );
              })()}
            </motion.h1>
            <div className="text-brand-zinc-600 dark:text-zinc-300 text-lg md:text-xl font-light max-w-2xl mx-auto px-4">
              <RichTextRenderer content={careersData?.section?.description} />
            </div>
          </div>
          )}

          {(careersData?.formEnabled !== false && careersData?.form?.enabled !== false) && (
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="relative bg-white/80 dark:bg-[#12121e] backdrop-blur-xl rounded-[2rem] shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-hidden border border-white dark:border-white/10">
              {isSuccess ? (
                <div className="p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-green-100 dark:bg-emerald-500/15 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-green-600 dark:text-emerald-400" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-brand-dark dark:text-white mb-4">{careersData?.success?.title}</h2>
                  <div className="text-lg text-brand-zinc-600 dark:text-zinc-300 max-w-md mx-auto">
                    <RichTextRenderer content={careersData?.success?.description} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2"><User className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />{careersData?.labels?.name}</label>
                      <input type="text" name="name" required className="w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-brand-dark dark:text-white dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-yellow outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2"><Mail className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />{careersData?.labels?.email}</label>
                      <input type="email" name="email" required className="w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-brand-dark dark:text-white dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-yellow outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2"><Phone className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />{careersData?.labels?.phone || "Phone Number"}</label>
                      <input type="tel" name="phone" required className="w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-brand-dark dark:text-white dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-yellow outline-none transition-all" />
                    </div>
                  </div>

                  {careersData?.rolesEnabled !== false && (
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2"><Briefcase className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />{careersData?.labels?.role}</label>
                    <ThemedSelect
                      name="role"
                      required
                      className="!rounded-xl bg-slate-50/50 dark:!bg-white/5"
                      placeholder={careersData?.labels?.roleSelector || "Select a Position"}
                      options={(careersData?.roles || []).map((role: any) => ({ value: role.value, label: role.label }))}
                    />
                  </div>
                  )}

                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />
                      {careersData?.labels?.attachment || "CV / RESUME (PDF)"}
                    </label>
                    <div className="relative group">
                      <input
                        type="file"
                        name="attachment"
                        accept=".pdf"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border border-dashed dark:border-white/20 rounded-xl flex items-center justify-between group-hover:border-blue-400 dark:group-hover:border-brand-yellow transition-all">
                        <span className="text-brand-zinc-500 dark:text-zinc-400 font-medium">{fileName || careersData?.labels?.attachmentPlaceholder || "Upload your resume (PDF)..."}</span>
                        <Upload className="w-5 h-5 text-slate-400 dark:text-zinc-400 group-hover:text-brand-blue dark:group-hover:text-brand-yellow" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-brand-zinc-500 dark:text-zinc-400 flex items-center gap-2"><FileText className="w-4 h-4 text-brand-blue dark:text-brand-yellow" />{careersData?.labels?.summary}</label>
                    <textarea name="message" required rows={4} className="w-full px-5 py-4 bg-slate-50/50 dark:bg-white/5 border dark:border-white/10 rounded-xl text-brand-dark dark:text-white dark:placeholder:text-zinc-500 focus:ring-2 focus:ring-brand-blue dark:focus:ring-brand-yellow outline-none transition-all"></textarea>
                  </div>
                  <TurnstileCaptcha
                    onVerify={(token) => setCaptchaToken(token)}
                    onExpire={() => setCaptchaToken("")}
                    theme="light"
                  />
                  <CtaButton type="submit" fullWidth loading={isSubmitting}>
                    {isSubmitting ? 'SENDING...' : 'SUBMIT APPLICATION'}
                  </CtaButton>
                  {errorMsg && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-red-700 dark:text-red-400 text-sm text-center">
                      {errorMsg}
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>
          )}
        </div>
      </section>
      )}

    </main>
  );
}
