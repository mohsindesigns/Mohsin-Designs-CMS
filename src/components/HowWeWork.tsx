"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
  HeartHandshake,
  Award,
  Monitor,
  Paintbrush,
  Shield,
  Search,
  Users,
  CheckCircle2,
  Rocket,
  Image as ImageIcon
} from "lucide-react";
import { useContent } from "@/hooks/useContent";

// ── Animated Circular Stat ────────────────────────────────────
const RADIUS = 34;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function AnimatedStat({
  value = "0",
  label = "",
  sublabel = "",
  percentage = 0.8,
}: {
  value: string;
  label: string;
  sublabel: string;
  percentage: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: false, margin: "-80px" });
  const [displayed, setDisplayed] = useState(String(value || "").replace(/[0-9.]/g, "0"));
  const [dotProgress, setDotProgress] = useState(0);

  useEffect(() => {
    if (isInView) {
      const valStr = String(value || "0");
      const isFloat = valStr.includes(".");
      const isPercent = valStr.includes("%");
      const suffix = isPercent ? "%" : valStr.replace(/[0-9.]/g, "");
      const numeric = parseFloat(valStr.replace(/[^0-9.]/g, "")) || 0;
      const DURATION = 1400;
      const DELAY = 150;
      const startTime = performance.now() + DELAY;
      let rafId: number;

      const tick = (now: number) => {
        const elapsed = Math.max(0, now - startTime);
        const raw = Math.min(elapsed / DURATION, 1);
        const eased = 1 - Math.pow(1 - raw, 4); // easeOutQuart

        setDisplayed((isFloat ? (eased * numeric).toFixed(1) : Math.round(eased * numeric).toString()) + suffix);
        setDotProgress(eased * (percentage || 0.8));

        if (raw < 1) {
          rafId = requestAnimationFrame(tick);
        } else {
          setDotProgress(percentage || 0.8);
        }
      };

      rafId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafId);
    } else {
      setDisplayed(String(value || "0").replace(/[0-9.]/g, "0"));
      setDotProgress(0);
    }
  }, [isInView, percentage, value]);

  const safePercentage = Math.min(Math.max(dotProgress, 0), 1);
  const dotAngle = 2 * Math.PI * safePercentage;
  const dotX = 41 + RADIUS * Math.cos(dotAngle);
  const dotY = 41 + RADIUS * Math.sin(dotAngle);

  const gradientId = `ringGradient-${String(label || "stat").replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div ref={ref} className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative w-[80px] h-[80px] sm:w-[96px] sm:h-[96px]">
        <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-yellow-400/5 blur-md" />
        <svg viewBox="0 0 82 82" className="relative w-full h-full -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0306AC" />
              <stop offset="100%" stopColor="#E9BD36" />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="41" cy="41" r={RADIUS}
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="5"
            className="dark:stroke-white/10"
          />
          {/* Animated fill */}
          <circle
            cx="41" cy="41" r={RADIUS}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE * (1 - safePercentage)}
          />
          {/* Yellow dot */}
          <circle
            cx={dotX} cy={dotY} r="4.5"
            fill="#E9BD36"
            stroke="white"
            strokeWidth="1.5"
            style={{ filter: "drop-shadow(0 2px 4px rgba(233,189,54,0.5))" }}
          />
        </svg>
        {/* Number */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-heading font-black text-[15px] sm:text-[18px] text-brand-dark dark:text-white leading-none">
            {displayed}
          </span>
        </div>
      </div>
      {/* Labels */}
      <div className="text-center">
        <p className="text-[9px] font-black uppercase tracking-widest text-brand-dark dark:text-white">{label}</p>
        <p className="text-[8.5px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-snug whitespace-pre-line">{sublabel}</p>
      </div>
    </div>
  );
}

const iconMap: Record<string, any> = {
  Sparkles,
  Terminal,
  TrendingUp,
  Zap,
  HeartHandshake,
  Award,
  Monitor,
  Paintbrush,
  Shield,
  Search,
  Users,
  CheckCircle2,
  Rocket
};

export default function HowWeWork({ data: overrideData }: { data?: any }) {
  const content = useContent();
  const rawWhyChoose = overrideData || content.whyChooseUs || {};

  const sectionTag = rawWhyChoose.sectionTag || rawWhyChoose.section?.badge || "HOW WE WORK";
  const titleIntro = rawWhyChoose.titleIntro || rawWhyChoose.section?.headlinePrefix || "Engineered For";
  const titleHighlight = rawWhyChoose.titleHighlight || rawWhyChoose.section?.headlineHighlight || "Peak Performance";
  const subtext = rawWhyChoose.subtext || rawWhyChoose.section?.description || "We combine precision design, rock-solid engineering, and conversion strategy to build digital experiences that deliver real, measurable growth.";

  const rawStats = Array.isArray(rawWhyChoose.stats) && rawWhyChoose.stats.length > 0 ? rawWhyChoose.stats : [
    { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
    { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
    { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
  ];

  const rawReasons = Array.isArray(rawWhyChoose.reasons) && rawWhyChoose.reasons.length > 0 
    ? rawWhyChoose.reasons 
    : (Array.isArray(rawWhyChoose.features) && rawWhyChoose.features.length > 0 
        ? rawWhyChoose.features.map((f: any, idx: number) => ({
            num: String(idx + 1).padStart(2, "0"),
            title: f.title,
            desc: f.description,
            iconName: f.icon || "Sparkles",
            image: f.image || ""
          }))
        : [
            { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles", image: "" },
            { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal", image: "" },
            { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap", image: "" },
            { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp", image: "" },
            { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake", image: "" }
          ]);

  const reasons = rawReasons.map((r: any) => ({
    ...r,
    icon: iconMap[r.iconName] || iconMap[r.icon] || Sparkles
  }));

  return (
    <section
      id="how-we-work"
      className="relative bg-[#F8FAFC] dark:bg-[#0a0a14] border-t border-slate-200 dark:border-white/10 py-20 md:py-28"
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0306AC 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-start gap-12 lg:gap-0">

          {/* ── LEFT STICKY ─────────────────────────────────── */}
          <div className="lg:w-[42%] lg:shrink-0 lg:sticky lg:top-28 flex flex-col justify-start lg:pr-16 lg:border-r border-slate-200 dark:border-white/10">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-7"
            >
              {/* Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 text-xs font-bold uppercase tracking-widest">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-yellow-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-yellow-400" />
                </span>
                {sectionTag}
              </div>

              {/* Heading */}
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight">
                {titleIntro}{" "}
                <span className="text-primary dark:text-yellow-400 font-serif font-normal italic">
                  {titleHighlight}
                </span>
              </h2>

              {/* Subtext */}
              <p className="text-sm sm:text-base font-sans text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-sm">
                {subtext}
              </p>

              {/* Circular stats */}
              <div className="flex items-center justify-between gap-4 pt-6 w-full">
                {rawStats.slice(0, 3).map((stat: any, sIdx: number) => (
                  <div key={sIdx} className="flex items-center gap-4 flex-1 justify-center">
                    <AnimatedStat
                      value={stat.value}
                      label={stat.label}
                      sublabel={stat.sublabel}
                      percentage={Number(stat.percentage) || 0.85}
                    />
                    {sIdx < 2 && (
                      <div className="w-px h-16 bg-slate-200 dark:bg-white/10 self-center hidden sm:block" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT SCROLLING ──────────────────────────────── */}
          <div className="lg:flex-1 lg:pl-14 flex flex-col">
            {reasons.map((reason: any, index: number) => {
              const IconComp = reason.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, margin: "-50px" }}
                  transition={{
                    duration: 0.55,
                    ease: [0.16, 1, 0.3, 1],
                    delay: index * 0.04,
                  }}
                  className="group border-b border-slate-200 dark:border-white/10 last:border-b-0 py-8"
                >
                  {/* Row: icon+text LEFT, image RIGHT */}
                  <div className="flex items-center gap-6">

                    {/* LEFT: Icon + text */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      {/* Icon */}
                      <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl
                        bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 dark:bg-yellow-400/10 dark:border-yellow-400/20
                        group-hover:bg-primary group-hover:text-white dark:group-hover:bg-yellow-400 dark:group-hover:text-[#080710] group-hover:border-primary dark:group-hover:border-yellow-400
                        group-hover:shadow-[0_6px_20px_rgba(3,6,172,0.22)] dark:group-hover:shadow-[0_6px_20px_rgba(233,189,54,0.18)]
                        transition-all duration-300 mt-0.5">
                        <IconComp className="h-[18px] w-[18px]" />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <span className="font-mono text-[10px] font-black text-primary dark:text-yellow-400 tracking-widest">
                          {reason.num || String(index + 1).padStart(2, "0")}
                        </span>
                        <h3 className="font-heading font-extrabold text-[1.1rem] text-slate-900 dark:text-white group-hover:text-primary dark:group-hover:text-yellow-400 transition-colors duration-300 leading-snug">
                          {reason.title}
                        </h3>
                        <p className="text-[13px] text-slate-600 dark:text-zinc-400 leading-relaxed">
                          {reason.desc}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT: Dynamic Image Managed from Dashboard */}
                    <div className="hidden md:block shrink-0 w-[140px] h-[95px] rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 overflow-hidden group-hover:border-primary/30 group-hover:shadow-md transition-all duration-300">
                      {reason.image ? (
                        <img
                          src={reason.image}
                          alt={reason.title || "Step Image"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 dark:text-zinc-600 bg-slate-50 dark:bg-white/[0.02] p-2 text-center">
                          <IconComp className="w-6 h-6 text-primary/40 mb-1" />
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{reason.num || `0${index+1}`}</span>
                        </div>
                      )}
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
