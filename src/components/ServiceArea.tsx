"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, MapPin, Globe } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useContent } from "@/hooks/useContent";
import { resolveCountryLocation, COUNTRIES_DATABASE } from "@/lib/countryLocations";

// Dynamic import with SSR disabled for Leaflet map
const RealWorldMap = dynamic(() => import("@/components/RealWorldMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] bg-slate-100 dark:bg-[#12121e] rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-3 border border-slate-200 dark:border-white/10 animate-pulse">
      <Globe className="w-8 h-8 text-primary animate-spin" />
      <span className="text-xs font-semibold">Loading Global Live Map...</span>
    </div>
  ),
});

export default function ServiceArea({ data: overrideData }: { data?: any }) {
  const [activeHub, setActiveHub] = useState<string | null>(null);
  const content = useContent();
  const serviceArea = overrideData || content.serviceArea || {};

  const sectionTag = serviceArea.sectionTag || "GLOBAL COVERAGE";
  const titleIntro = serviceArea.titleIntro || "Serving Clients";
  const titleHighlight = serviceArea.titleHighlight || "Worldwide";
  const description = serviceArea.description || "With distributed engineering hubs and round-the-clock availability, we partner with industry leaders across North America, Europe, the Middle East, and Asia-Pacific.";
  const ctaText = serviceArea.ctaText || "Schedule Global Consultation";
  const ctaHref = serviceArea.ctaHref || serviceArea.ctaLink || "#contact-form";

  // Auto-enrich hubs with geocoded coordinates & timezone if missing
  const rawHubs: any[] = Array.isArray(serviceArea.hubs) && serviceArea.hubs.length > 0 ? serviceArea.hubs : [
    { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
    { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
    { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
    { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" },
    { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", link: "/locations" },
    { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", link: "/locations" },
    { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", link: "/locations" },
    { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", link: "/locations" },
    { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", link: "/locations" },
    { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", link: "/locations" },
    { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST", link: "/locations" },
    { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", link: "/locations" }
  ];

  const hubs = rawHubs.map((hub: any, idx: number) => {
    const resolved = resolveCountryLocation(hub.name);
    const dbData = COUNTRIES_DATABASE[resolved.name];
    return {
      id: hub.id || `hub-${idx}`,
      name: hub.name,
      focus: hub.focus || "Global Partner Delivery",
      timezone: hub.timezone || resolved.timezone || "UTC",
      link: hub.link || hub.href || hub.url || "",
      lat: hub.lat || dbData?.lat || resolved.lat || 20,
      lng: hub.lng || dbData?.lng || resolved.lng || 0,
    };
  });

  const selectedHubObj = hubs.find((h) => h.id === activeHub);

  return (
    <section
      id="service-area"
      className="relative overflow-hidden bg-transparent py-24 md:py-32 border-t border-b border-slate-200 dark:border-white/10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-10 lg:gap-16 items-start lg:items-center">

          {/* ── Left Column: Narrative & Hub Chips ── */}
          <div className="w-full lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left gap-6">

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-yellow-400 text-xs font-bold uppercase tracking-widest self-center lg:self-start">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary dark:bg-yellow-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary dark:bg-yellow-400" />
              </span>
              {sectionTag}
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
              {titleIntro}{" "}
              <span className="text-primary dark:text-yellow-400 font-serif font-normal italic">
                {titleHighlight}
              </span>
            </h2>

            <p className="text-sm sm:text-base font-sans text-slate-600 dark:text-zinc-300 font-normal leading-relaxed max-w-md">
              {description}
            </p>

            {/* ── Country / State chip grid ── */}
            <div className="w-full flex flex-wrap justify-center lg:justify-start gap-2">
              {hubs.map((hub) => {
                const isActive = activeHub === hub.id;

                return (
                  <motion.button
                    key={hub.id}
                    onClick={() => {
                      if (isActive && hub.link) {
                        window.location.href = hub.link;
                      } else {
                        setActiveHub(isActive ? null : hub.id);
                      }
                    }}
                    onMouseEnter={() => setActiveHub(hub.id)}
                    whileTap={{ scale: 0.96 }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold tracking-wide transition-all duration-200 cursor-pointer select-none focus:outline-none ${
                      isActive
                        ? "border-[#0306AC] dark:border-[#E9BD36] bg-[#EFF6FF] dark:bg-[#E9BD36]/10 text-[#0306AC] dark:text-[#E9BD36] shadow-sm"
                        : "border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-400 hover:border-[#0306AC] dark:hover:border-[#E9BD36] hover:text-[#0306AC] dark:hover:text-[#E9BD36]"
                    }`}
                    aria-pressed={isActive}
                  >
                    <MapPin
                      className={`shrink-0 transition-colors duration-250 h-2.5 w-2.5 ${
                        isActive
                          ? "text-[#0306AC] dark:text-[#E9BD36]"
                          : "text-slate-400 dark:text-zinc-500"
                      }`}
                      strokeWidth={3}
                    />
                    <span>{hub.name}</span>
                    {hub.link && (
                      <ArrowUpRight className={`h-2.5 w-2.5 opacity-60 ${isActive ? 'opacity-100 text-primary dark:text-[#E9BD36]' : ''}`} />
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Fixed-height active hub info panel with Link navigation */}
            <div className="relative w-full min-h-[64px] overflow-hidden">
              <AnimatePresence mode="wait">
                {selectedHubObj ? (
                  <motion.div
                    key={selectedHubObj.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="w-full flex items-center gap-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#161622] px-4 py-2.5 shadow-lg shadow-slate-900/5 dark:shadow-black/40 transition-colors"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-white dark:bg-[#E9BD36] dark:text-[#080710] shadow-sm transition-colors">
                      <MapPin className="h-4 w-4" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1 text-left">
                      <p className="truncate text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {selectedHubObj.name}
                      </p>
                      <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-normal">
                        {selectedHubObj.focus}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-auto shrink-0">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-[#0306AC] dark:text-[#E9BD36] uppercase whitespace-nowrap bg-[#EFF6FF] dark:bg-white/10 border border-[#0306AC]/20 dark:border-[#E9BD36]/20 px-2.5 py-1 rounded-lg">
                        {selectedHubObj.timezone}
                      </span>
                      {selectedHubObj.link && (
                        <a
                          href={selectedHubObj.link}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-primary hover:bg-primary/90 dark:bg-[#E9BD36] dark:text-black dark:hover:bg-[#E9BD36]/90 px-3 py-1 rounded-lg transition-all shadow-sm group/link cursor-pointer"
                        >
                          <span>Explore</span>
                          <ArrowRight className="h-3 w-3 group-hover/link:translate-x-0.5 transition-transform" />
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-16 flex items-center justify-center text-xs text-slate-400 dark:text-zinc-500 border border-dashed border-slate-200 dark:border-white/10 rounded-2xl px-4"
                  >
                    Hover or click any location or map pin to inspect regional operations
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Solid CTA Button (Contrasting White text with no hover bleeding) */}
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-primary hover:bg-primary/90 !text-white active:scale-95 px-6 py-3.5 text-xs sm:text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl transition-all self-center lg:self-start group cursor-pointer"
            >
              <span className="!text-white font-bold">{ctaText}</span>
              <ArrowRight className="h-4 w-4 !text-white group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* ── Right Column: Real Interactive World Map ── */}
          <div className="w-full lg:col-span-7 bg-white dark:bg-[#12121e] border border-slate-200 dark:border-white/10 rounded-2xl sm:rounded-3xl p-2 sm:p-4 shadow-xl relative overflow-hidden">
            <div className="w-full h-[380px] sm:h-[460px] rounded-xl overflow-hidden relative">
              <RealWorldMap
                hubs={hubs}
                activeHubId={activeHub}
                onSelectHub={setActiveHub}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
