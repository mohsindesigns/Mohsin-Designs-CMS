"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, ArrowRight } from "lucide-react";
import { useState } from "react";
import { useContent } from "@/hooks/useContent";
import RichTextRenderer from "@/components/ui/RichTextRenderer";

interface FAQItem {
  id?: string;
  question: string;
  answer: string;
  category?: string;
}

interface PageInlineFaqsProps {
  data?: any;
  faqs?: FAQItem[];
  title?: string;
  subtitle?: string;
  badge?: string;
  description?: string;
  hideHeader?: boolean;
  faqSchemaMarkup?: string;
  showFilters?: boolean;
}

export default function PageInlineFaqs({
  data: propData,
  faqs: propFaqs,
  title,
  subtitle,
  badge,
  description,
  hideHeader = false,
  faqSchemaMarkup,
  showFilters
}: PageInlineFaqsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const content = useContent();

  const rawFaq = propData || content.faq || {};

  const sectionTag = badge || rawFaq.faqBadge || rawFaq.sectionTag || rawFaq.section?.badge || "FREQUENTLY ASKED QUESTIONS";
  
  // Clean dynamic heading resolution without unwanted hardcoded prefixes
  const explicitIntro = rawFaq.faqTitleIntro !== undefined ? rawFaq.faqTitleIntro : (rawFaq.titleIntro !== undefined ? rawFaq.titleIntro : undefined);
  const explicitHighlight = title || rawFaq.faqTitleHighlight || rawFaq.titleHighlight || rawFaq.faqTitle || rawFaq.section?.headlineHighlight || rawFaq.section?.headline;

  let titleIntro = "";
  let titleHighlight = "";

  const isBoilerplateIntro = explicitIntro === "Common Questions," || explicitIntro === "Common Questions";

  if (explicitIntro !== undefined && explicitIntro.trim() && !isBoilerplateIntro) {
    titleIntro = explicitIntro.trim();
    titleHighlight = (explicitHighlight || "").trim();
  } else if (explicitHighlight && explicitHighlight.trim()) {
    titleIntro = "";
    titleHighlight = explicitHighlight.trim();
  } else {
    titleIntro = "";
    titleHighlight = "Frequently Asked Questions";
  }

  const rawDesc = description || rawFaq.faqDescription || rawFaq.description || rawFaq.section?.description || "";
  // Filter out any legacy St. Louis boilerplate from old database records
  const desc = (typeof rawDesc === 'string' && rawDesc.includes("St. Louis")) ? "" : rawDesc;

  const strategyAudit = {
    badge: rawFaq.strategyAudit?.badge || "FREE ARCHITECTURE AUDIT",
    title: rawFaq.strategyAudit?.title || "Have a complex custom build in mind?",
    desc: rawFaq.strategyAudit?.desc || "Book a 30-minute high-level technical strategy session with our lead engineer.",
    button: rawFaq.strategyAudit?.button || "Book Architecture Call",
    href: rawFaq.strategyAudit?.href || "#contact"
  };

  // Fallback starter FAQs if none exist
  const defaultFaqs: FAQItem[] = [
    {
      question: "What is your typical project timeline?",
      answer: "Most custom web applications, high-converting marketing sites, and bespoke CMS builds launch within 2 to 4 weeks depending on scope and integrations.",
      category: "TIMELINE & PROCESS"
    },
    {
      question: "How do you handle ongoing maintenance and support?",
      answer: "We offer dedicated monthly SLA maintenance packages covering continuous security patches, performance audits, technical SEO adjustments, and feature iterations.",
      category: "SUPPORT & SLA"
    },
    {
      question: "Do you build custom CMS integrations?",
      answer: "Yes! We specialize in lightweight, lightning-fast custom CMS dashboards tailored strictly to your team's workflow without bloating the codebase.",
      category: "ENGINEERING"
    },
    {
      question: "What tech stack do you recommend for high-scale apps?",
      answer: "Our primary stack centers on Next.js (App Router), TypeScript, Tailwind CSS / Vanilla CSS, Framer Motion, and scalable MongoDB or PostgreSQL architectures.",
      category: "TECHNOLOGY"
    },
    {
      question: "How does the pricing and billing structure work?",
      answer: "We operate on fixed-price milestone deliverables for well-defined scopes and transparent weekly sprints for fast-moving agile product development.",
      category: "PRICING"
    }
  ];

  // Resolve list of FAQ items
  let activeFaqs: FAQItem[] = [];
  if (Array.isArray(propFaqs) && propFaqs.length > 0) {
    activeFaqs = propFaqs;
  } else if (Array.isArray(rawFaq.faqs) && rawFaq.faqs.length > 0) {
    activeFaqs = rawFaq.faqs;
  } else if (Array.isArray(rawFaq.list) && rawFaq.list.length > 0) {
    activeFaqs = rawFaq.list;
  } else if (Array.isArray(rawFaq.items) && rawFaq.items.length > 0) {
    activeFaqs = rawFaq.items;
  } else if (Array.isArray(rawFaq.questions) && rawFaq.questions.length > 0) {
    activeFaqs = rawFaq.questions;
  } else if (Array.isArray(content.faq?.list) && content.faq?.list.length > 0) {
    activeFaqs = content.faq.list;
  } else {
    activeFaqs = defaultFaqs;
  }

  const faqs = activeFaqs.map((f: any, idx: number) => ({
    id: f._id || f.id || `faq-${idx}`,
    question: f.question || f.q || f.title || "Frequently Asked Question",
    answer: f.answer || f.a || f.description || "",
    category: f.category || f.tag || "GENERAL"
  }));

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      className="relative overflow-x-clip bg-white dark:bg-[#080710] py-24 md:py-32 border-t border-b border-slate-200 dark:border-white/10"
    >
      {/* Decorative Soft Blur Orb */}
      <div className="absolute -left-32 top-1/3 h-96 w-96 rounded-full bg-primary/5 dark:bg-yellow-400/5 blur-3xl pointer-events-none" />
      <div className="absolute -right-32 bottom-1/3 h-96 w-96 rounded-full bg-primary/5 dark:bg-yellow-400/5 blur-3xl pointer-events-none" />

      {/* Structural accent grid lines */}
      <div className="absolute inset-x-0 top-12 h-[1px] bg-primary/[0.03] pointer-events-none" />
      <div className="absolute inset-x-0 bottom-12 h-[1px] bg-primary/[0.03] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* ── Left Column: Sticky Title & Info ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start space-y-8 flex flex-col justify-start">
            
            <div className="flex flex-col gap-4">
              {/* Category Pill Tag */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 text-xs font-bold uppercase tracking-widest self-start">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-yellow-400" />
                </span>
                {sectionTag}
              </div>
              
              {/* Main Heading */}
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                {titleIntro ? (
                  <>
                    {titleIntro}{" "}
                    <span className="text-primary dark:text-yellow-400 font-serif font-normal italic">
                      {titleHighlight}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-900 dark:text-white">
                    {titleHighlight}
                  </span>
                )}
              </h2>
              
              {/* Subdescription */}
              {desc && (
                <div className="text-sm sm:text-base font-sans text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-sm">
                  <RichTextRenderer content={desc} />
                </div>
              )}
            </div>

            {/* Premium Clean Sticky Strategy Session Box */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-[#020485] to-[#010356] dark:from-[#12121e] dark:via-[#0f0f1a] dark:to-[#080710] border border-primary/20 dark:border-white/10 p-5 xs:p-7 text-white shadow-xl group transition-all duration-300">
              <div className="relative z-20 space-y-5">
                <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[9px] font-mono font-black tracking-wider uppercase text-yellow-400">
                  {strategyAudit.badge}
                </span>
                <div className="space-y-2">
                  <h3 className="font-heading text-xl font-bold leading-tight text-white">
                    {strategyAudit.title}
                  </h3>
                  <p className="text-white/80 dark:text-zinc-300 text-xs leading-relaxed font-sans">
                    {strategyAudit.desc}
                  </p>
                </div>
                <a
                  href={strategyAudit.href}
                  className="inline-flex items-center justify-between w-full px-5 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-yellow-400 hover:text-slate-950 font-heading font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-md group/btn no-underline"
                >
                  <span>{strategyAudit.button}</span>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-950 text-white group-hover/btn:bg-slate-950 group-hover/btn:text-yellow-400 transition-colors">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </a>
              </div>
            </div>

          </div>

          {/* ── Right Column: Accordion Cards ── */}
          <div className="lg:col-span-7 space-y-3.5 w-full">
            
            {faqs.map((f, index) => {
              const doubleDigit = String(index + 1).padStart(2, "0");
              const isOpen = openIndex === index;

              return (
                <div
                  key={index}
                  className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer select-none p-4 xs:p-5 sm:p-6 ${
                    isOpen
                      ? "bg-white dark:bg-[#12121e] border-primary/30 dark:border-yellow-400/30 shadow-md"
                      : "bg-white/60 dark:bg-[#12121e]/60 border-slate-200/80 dark:border-white/10 hover:bg-white dark:hover:bg-[#12121e] hover:border-primary/20 dark:hover:border-yellow-400/20"
                  }`}
                  onClick={() => toggleFAQ(index)}
                >
                  {/* Header Area */}
                  <div className="flex items-start justify-between gap-4 relative z-10">
                    <div className="flex items-start gap-3.5">
                      {/* Double Digit Number */}
                      <span className="font-mono text-xs font-black text-primary dark:text-yellow-400 mt-0.5 select-none">
                        {doubleDigit}
                      </span>
                      
                      <div className="space-y-1">
                        {/* Category Label */}
                        <span className="font-mono text-[9px] font-black text-primary/60 dark:text-yellow-400/60 tracking-widest uppercase select-none block">
                          {f.category}
                        </span>
                        
                        {/* Question */}
                        <h3 className={`font-heading font-extrabold text-base sm:text-lg leading-snug transition-colors duration-300 pr-2 ${
                          isOpen ? "text-primary dark:text-yellow-400" : "text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-yellow-400"
                        }`}>
                          {f.question}
                        </h3>
                      </div>
                    </div>

                    {/* Plus/Minus Indicator */}
                    <div className="shrink-0 mt-0.5">
                      <motion.div
                        animate={{ rotate: isOpen ? 135 : 0 }}
                        transition={{ type: "spring", stiffness: 220, damping: 18 }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300 ${
                          isOpen
                            ? "bg-primary border-primary text-white dark:bg-yellow-400 dark:border-yellow-400 dark:text-[#080710] shadow-sm"
                            : "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-800 dark:text-white group-hover:border-primary dark:group-hover:border-yellow-400"
                        }`}
                      >
                        <Plus className="h-4 w-4 stroke-[2]" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Answer Area */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden relative z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="pl-7 pt-4 mt-4 border-t border-slate-100 dark:border-white/10">
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-300 font-medium leading-relaxed font-sans">
                            {f.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

          </div>

        </div>

      </div>
    </section>
  );
}