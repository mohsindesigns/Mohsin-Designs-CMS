"use client";

import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useRef, useEffect, useState } from "react";
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from "../ui/RichTextRenderer";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getValidHref } from "@/lib/utils";

// NOTE on the FAQ block: this template does NOT render FAQs itself. TemplateRegistry's
// TemplateWrapper appends <PageInlineFaqs> after every template that is not in its exclusion
// list (Team is not), driven by content.faqs / content.faqSchemaMarkup which the shared
// "Page FAQs" tab in the page editor writes. Nothing to wire here.

if (typeof window !=="undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Legacy image keys: old seeded members stored e.g. image: "BrandonAnderson" instead of a URL.
// Kept so already-saved documents keep resolving; the editor now always stores a real URL.
const Images = {
  BrandonAnderson: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  ChrissyLong: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Austin: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  BrandonSales: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Allan: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  Pattern: "https://images.unsplash.com/photo-1502691876148-a84978e59af8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  Studio: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80",
};

const Icons = {
  Linkedin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h4v12H4V8z" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8h4v2c.6-.8 1.5-2 3-2 2.5 0 4 1.5 4 4v8h-4v-6c0-1.5-.5-2-2-2s-2 .5-2 2v6h-4V8z" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Mail: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  Quote: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 11H6V7h4v4z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M18 11h-4V7h4v4z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  Sparkle: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" fill="currentColor" />
    </svg>
  ),
  Award: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 14l-2 6 6-2 6 2-2-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
};

/* ── Small pure helpers (admin-entered data is free text: never trust its shape) ── */

const asText = (v: any): string => (typeof v === "string" ? v.trim() : "");

/** True when a rich-text value (HTML string, or legacy array of HTML strings) has visible content. */
const hasRichText = (v: any): boolean => {
  if (Array.isArray(v)) return v.some(hasRichText);
  if (typeof v !== "string") return false;
  if (/<img\b/i.test(v)) return true;
  return v.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim().length > 0;
};

/** Portrait URL: real URL/path as-is, legacy stock keys mapped, anything else -> "" (initials placeholder). */
const resolveImage = (raw: any): string => {
  const v = asText(raw);
  if (!v) return "";
  if (v.startsWith("/") || v.startsWith("http")) return v;
  return Images[v as keyof typeof Images] || "";
};

/** LinkedIn/social URL: normalized ("linkedin.com/in/x" -> https) and only http(s) allowed (blocks javascript:, bare handles). */
const socialHref = (raw: any): string | null => {
  const h = getValidHref(typeof raw === "string" ? raw : "");
  return h && /^https?:\/\//i.test(h) ? h : null;
};

/** mailto: link only for something that looks like an email address; anything else hides the icon. */
const emailHref = (raw: any): string | null => {
  const e = asText(raw).replace(/^mailto:/i, "");
  return /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(e) ? `mailto:${e}` : null;
};

const initialsOf = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

const TeamPortrait = ({ image, alt, initials, badge1, badge2, alignRight = false, priority = false }: any) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const ref = useRef<any>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  // The <img> is server-rendered, so a broken URL can fail BEFORE React hydrates and attaches
  // onError - the error event is then lost and the browser's broken-image icon stays. Check the
  // element's state once mounted (complete + zero width = already failed).
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth === 0) setImageError(true);
  }, [image]);

  // No photo (or a broken one): show a neutral initials tile instead of a stock photo of a stranger.
  const showImage = !!image && !imageError;
  const sizeCls = "w-full h-[280px] min-[350px]:h-[380px] sm:h-[450px] lg:h-[550px]";

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={`relative group w-full ${alignRight ? 'lg:ml-auto' : ''}`} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <div className="relative z-10 w-full max-w-[500px] mx-auto lg:mx-0">
        <div className="absolute -inset-2 sm:-inset-3 bg-gradient-to-br from-blue-500/10 via-slate-500/10 to-blue-700/10 dark:from-brand-yellow/10 dark:via-white/5 dark:to-brand-yellow/10 rounded-[2rem] sm:rounded-[2.5rem] blur-xl sm:blur-2xl group-hover:from-blue-500/20 group-hover:via-slate-500/20 group-hover:to-blue-700/20 dark:group-hover:from-brand-yellow/20 dark:group-hover:via-white/10 dark:group-hover:to-brand-yellow/20 transition-all duration-700" />
        <div className="relative rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_10px_40px_rgb(0,0,0,0.08)] group-hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-shadow duration-700">
          {showImage ? (
            <motion.img
              ref={imgRef}
              src={image}
              alt={alt}
              loading={priority ? "eager" : "lazy"}
              decoding="async"
              onError={() => setImageError(true)}
              animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={`${sizeCls} object-cover`}
            />
          ) : (
            <div
              role="img"
              aria-label={alt}
              className={`${sizeCls} flex items-center justify-center bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-[#1a1a2e] dark:via-[#12121e] dark:to-[#0c0b18]`}
            >
              <span aria-hidden="true" className="select-none text-7xl sm:text-8xl font-light tracking-widest text-slate-400 dark:text-white/20">{initials}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-80" />
        </div>
        {/* Badges are optional: an empty badge used to render as a bare icon-only pill. */}
        {badge1 && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.3 }} className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
            <div className="bg-white/95 dark:bg-[#12121e]/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white dark:border-white/10 group-hover:-translate-y-1 transition-transform duration-500">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] min-[350px]:text-[10px] sm:text-xs font-bold text-slate-800 dark:text-white tracking-[0.1em]"><Icons.Sparkle />{badge1}</span>
            </div>
          </motion.div>
        )}
        {badge2 && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ delay: 0.4 }} className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
            <div className="bg-slate-900/95 dark:bg-[#080710]/95 backdrop-blur-md px-3 py-2 sm:px-5 sm:py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-700/50 dark:border-white/10 group-hover:-translate-y-1 transition-transform duration-500">
              <span className="flex items-center gap-1.5 sm:gap-2 text-[9px] min-[350px]:text-[10px] sm:text-xs font-bold text-blue-400 dark:text-brand-yellow tracking-[0.1em]"><Icons.Award />{badge2}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const DEFAULT_BADGE = "Our Leadership";
const DEFAULT_HEADLINE = "Leadership & Engineering Team";

export default function TeamTemplate({ pageData }: { pageData?: any, params?: any }) {
  const sectionRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const { team: globalTeamData } = useContent();
  // Page content wins; the global fallback only matters for a page that has never saved a `team`.
  const teamData = pageData?.content?.team || globalTeamData;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const section = teamData?.section || {};
  const showIntro = section.enabled !== false;
  const members: any[] = Array.isArray(teamData?.members)
    ? teamData.members.filter((m: any) => m && typeof m === "object")
    : [];
  // Roster toggle (editor: "Team Roster Visibility"). An empty roster renders nothing - and no gap.
  const showMembers = teamData?.membersEnabled !== false && members.length > 0;
  const showSection = showIntro || showMembers;

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.leadership-reveal', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power2.out", scrollTrigger: { trigger: sectionRef.current, start: "top 85%", toggleActions: "play none none reverse" } });
    }, sectionRef);
    return () => ctx.revert();
  }, [isClient, showSection]);

  // Headline = prefix / highlight / suffix parts (editor "Main Headline"). Old documents only have a
  // single `headline` string: split it on the word "with" but KEEP the word (the editor's own
  // migration does the same - the old code dropped it: "Expert hands with Visionary minds" lost "with").
  const prefix = asText(section.headlinePrefix);
  const highlight = asText(section.headlineHighlight);
  const suffix = asText(section.headlineSuffix);
  let line1 = prefix;
  let line2 = highlight;
  if (!prefix && !highlight && !suffix) {
    const rawHeadline = asText(section.headline) || DEFAULT_HEADLINE;
    const m = rawHeadline.match(/^(.*?)\s*\b(with\b.*)$/i);
    line1 = m ? m[1].trim() : rawHeadline;
    line2 = m ? m[2].trim() : "";
  }

  return (
    <div className="bg-white dark:bg-[#080710] text-brand-dark dark:text-white transition-colors duration-300">
      {showSection && (
      <section ref={sectionRef} className="relative overflow-x-clip pt-28 md:pt-36 lg:pt-40 pb-16 sm:pb-20 lg:pb-24">
        <div className="absolute inset-0 pointer-events-none bg-[#f8fafc] dark:bg-[#0c0b18]">
          <div className="absolute inset-0 opacity-[0.03] dark:invert" style={{ backgroundImage: `linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)`, backgroundSize: '100px 100px' }} />
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-blue-100/50 dark:from-brand-blue/20 to-transparent opacity-80 blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 relative z-30">
          {showIntro ? (
          <div className={`max-w-3xl mx-auto text-center ${showMembers ? "mb-16 sm:mb-24 md:mb-32" : ""} leadership-reveal relative z-20`}>
            <PageBreadcrumbs page={pageData} align="center" className="mb-6" />
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6">
              <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-blue-300 to-blue-500 dark:from-brand-yellow/30 dark:to-brand-yellow" />
              <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] uppercase text-brand-blue dark:text-brand-yellow">{asText(section.badge) || DEFAULT_BADGE}</span>
              <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-blue-500 to-blue-300 dark:from-brand-yellow dark:to-brand-yellow/30" />
            </div>
            <h1 className="text-3xl min-[350px]:text-4xl sm:text-4xl lg:text-[42px] font-light text-brand-dark dark:text-white mb-4 leading-tight">
              {line1}
              {/* only break the line when BOTH lines exist (a lone highlight used to get an empty first line) */}
              {line1 && line2 ? <> <br /></> : null}
              {line2 && (
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-blue-950 dark:from-brand-yellow dark:to-brand-yellow">
                  {line2}
                </span>
              )}
              {suffix ? ` ${suffix}` : ""}
            </h1>
            {hasRichText(section.description) && (
              <div className="text-slate-500 dark:text-zinc-300 text-[13px] min-[350px]:text-sm sm:text-lg font-light max-w-2xl mx-auto px-4 leading-relaxed">
                <RichTextRenderer content={section.description} />
              </div>
            )}
          </div>
          ) : (
            // Intro hidden: keep the breadcrumb trail (navigation, not intro content) above the roster.
            <PageBreadcrumbs page={pageData} align="center" className="mb-10 relative z-20" />
          )}

          {showMembers && members.map((member: any, index: number) => {
            const alignRight = index % 2 !== 0;
            const name = asText(member.name);
            const role = asText(member.role);
            const linkedinUrl = socialHref(member.linkedin);
            const mailUrl = emailHref(member.email);
            const image = resolveImage(member.image);
            const imageAlt = asText(member.imageAlt) || [name, role].filter(Boolean).join(" - ") || "Team member";
            return (
              <div key={member.id || index} className="grid lg:grid-cols-12 gap-8 items-center lg:items-start mb-24 sm:mb-32 md:mb-40 last:mb-0 relative">
                <div className={`lg:col-span-7 min-w-0 space-y-8 ${alignRight ? 'order-2 lg:order-1 lg:pr-6' : 'lg:pl-6 order-2 lg:order-2'} leadership-reveal relative z-10 w-full`}>
                  <div className="bg-white/70 dark:bg-[#12121e]/70 backdrop-blur-xl rounded-[2rem] p-6 sm:p-10 border border-white dark:border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                      {/* h2: the page's only h1 is the intro headline; member names were h3 (skipped a level) */}
                      <h2 className="text-2xl sm:text-5xl font-light text-brand-dark dark:text-white">
                        {name}
                        {role && <span className="block text-[10px] sm:text-xs font-mono font-bold text-brand-blue dark:text-brand-yellow mt-2 tracking-[0.2em] uppercase">{role}</span>}
                      </h2>
                      {(linkedinUrl || mailUrl) && (
                      <div className="flex items-center gap-3">
                        {linkedinUrl && (
                          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label={`${name || "Team member"} on LinkedIn`} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow hover:border-blue-200 dark:hover:border-brand-yellow/40 transition-all">
                            <Icons.Linkedin />
                          </a>
                        )}
                        {mailUrl && (
                          <a href={mailUrl} aria-label={`Email ${name || "team member"}`} className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow hover:border-blue-200 dark:hover:border-brand-yellow/40 transition-all">
                            <Icons.Mail />
                          </a>
                        )}
                      </div>
                      )}
                    </div>
                    {hasRichText(member.description) && (
                    <div className="mt-8 relative">
                      <div className="absolute -left-3 sm:-left-6 -top-4 text-blue-100/60 dark:text-brand-yellow/10 scale-[1.2] sm:scale-[1.8] pointer-events-none"><Icons.Quote /></div>
                      <div className="space-y-4 text-slate-600 dark:text-zinc-300 text-[13px] sm:text-lg leading-relaxed relative z-10">
                        <RichTextRenderer content={member.description} />
                      </div>
                    </div>
                    )}
                  </div>
                </div>
                <div className={`lg:col-span-5 min-w-0 ${alignRight ? 'order-1 lg:order-2' : 'order-1 lg:order-1'} leadership-reveal lg:sticky lg:top-32 relative z-10 w-full max-w-[400px] lg:max-w-none mx-auto lg:mx-0`}>
                  <TeamPortrait
                    image={image}
                    alt={imageAlt}
                    initials={initialsOf(name)}
                    badge1={asText(member.badge1)}
                    badge2={asText(member.badge2)}
                    alignRight={alignRight}
                    priority={index === 0}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}

    </div>
  );
}
