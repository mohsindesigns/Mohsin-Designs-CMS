"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Upload, Send, Briefcase, FileText, User, Mail, Phone, CheckCircle, ArrowRight } from 'lucide-react';
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from '../ui/RichTextRenderer';
import PageInlineFaqs from "@/components/PageInlineFaqs";

const Images = {
  Pattern: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
};

const ParallaxLayer = ({ children, speed = 0.1, className = "", sectionRef }: any) => {
  const ref = useRef<any>(null);
  const [scrollTarget, setScrollTarget] = useState<any>(undefined);
  useEffect(() => {
    setScrollTarget(sectionRef);
  }, [sectionRef]);

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
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
    formData.append("_subject", "New Job Application - Eagle Revolution");

    try {
      const response = await fetch("/api/send", {
        method: "POST",
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok || data.success || data.submissionId) {
        setIsSuccess(true);
      } else {
        // Log the specific error from API
        console.error("API Submission Error:", data.error, data.details);
        throw new Error(data.error || "Form submission failed");
      }
    } catch (error: any) {
      console.error("Career form fallback triggered:", error);

      // Fallback to mailto if API fails
      const name = formData.get("name");
      const email = formData.get("email");
      const phone = formData.get("phone");
      const role = formData.get("role");
      const message = formData.get("message");

      const emailContent = `
NEW JOB APPLICATION - EAGLE REVOLUTION
----------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone}
Position: ${role}

MESSAGE:
${message}

(Note: Please attach your resume manually to this email)
      `;

      const mailtoLink = `mailto:banderson@eaglerevolution.com?subject=Job Application - ${name}&body=${encodeURIComponent(emailContent)}`;

      // We still set success to true because the user is being redirected to their email client
      // but we can also set a small note or alert if we want.
      window.location.href = mailtoLink;
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-white min-h-screen font-body w-full overflow-hidden">
      <section className="relative py-16 md:py-32 overflow-hidden w-full">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(to right, #2563eb 1px, transparent 1px), linear-gradient(to bottom, #2563eb 1px, transparent 1px)`, backgroundSize: '80px 80px' }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-50 to-transparent opacity-80 blur-[100px]" />
        <div className="max-w-5xl mx-auto px-4 relative z-30">
          <div className="max-w-3xl mx-auto text-center mb-12 md:mb-24">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-3 mb-6">
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-300 to-blue-500" />
              <span className="text-xs font-medium tracking-[0.2em] uppercase text-blue-600">{careersData?.section?.badge || "Join Eagle Revolution"}</span>
              <div className="w-8 h-[2px] bg-gradient-to-r from-blue-500 to-blue-300" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-light text-slate-900 mb-6 leading-tight">
              {careersData?.section?.headline?.split('with')[0]} <br />
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-900">{careersData?.section?.headline?.split('with')[1]}</span>
            </motion.h1>
            <div className="text-slate-600 text-lg md:text-xl font-light max-w-2xl mx-auto px-4">
              <RichTextRenderer content={careersData?.section?.description} />
            </div>
          </div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-2xl overflow-hidden border border-white">
              {isSuccess ? (
                <div className="p-8 md:p-16 text-center flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">{careersData?.success?.title}</h2>
                  <div className="text-lg text-slate-600 max-w-md mx-auto">
                    <RichTextRenderer content={careersData?.success?.description} />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-8 md:p-16 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><User className="w-4 h-4 text-blue-500" />{careersData?.labels?.name}</label>
                      <input type="text" name="name" required className="w-full px-5 py-4 bg-slate-50/50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Mail className="w-4 h-4 text-blue-500" />{careersData?.labels?.email}</label>
                      <input type="email" name="email" required className="w-full px-5 py-4 bg-slate-50/50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" />{careersData?.labels?.phone || "Phone Number"}</label>
                      <input type="tel" name="phone" required className="w-full px-5 py-4 bg-slate-50/50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><Briefcase className="w-4 h-4 text-blue-500" />{careersData?.labels?.role}</label>
                    <select name="role" required defaultValue="" className="w-full px-5 py-4 bg-slate-50/50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none">
                      <option value="" disabled>{careersData?.labels?.roleSelector || "Select a Position"}</option>
                      {careersData?.roles?.map((role: any, index: number) => <option key={index} value={role.value}>{role.label}</option>)}
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
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
                      <div className="w-full px-5 py-4 bg-slate-50/50 border border-dashed rounded-xl flex items-center justify-between group-hover:border-blue-400 transition-all">
                        <span className="text-slate-500 font-medium">{fileName || careersData?.labels?.attachmentPlaceholder || "Upload your resume (PDF)..."}</span>
                        <Upload className="w-5 h-5 text-slate-400 group-hover:text-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold tracking-widest uppercase text-slate-500 flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" />{careersData?.labels?.summary}</label>
                    <textarea name="message" required rows={4} className="w-full px-5 py-4 bg-slate-50/50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"></textarea>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all disabled:opacity-70">
                    {isSubmitting ? 'SENDING...' : 'SUBMIT APPLICATION'}
                  </button>
                  {errorMsg && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center">
                      {errorMsg}
                    </div>
                  )}
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
