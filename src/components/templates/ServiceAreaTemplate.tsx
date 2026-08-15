"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  MapPin, CheckCircle, Map, ShieldCheck, Clock, Award, Check, Navigation,
  Building, Compass, ArrowRight, Zap, Star, ChevronRight,
  Home, Layout, TreePine, Building2, Droplets, BadgeCheck, TrendingUp, Users,
  Phone, Calendar, ClipboardCheck, Hammer, Sparkles, Globe, ShieldAlert,
  Wrench, PencilRuler, Flame, AlertTriangle, FileCheck2, FileText, Layers, RefreshCw,
  Clipboard, ClipboardList
} from "lucide-react";
import RichTextRenderer from "../ui/RichTextRenderer";
import { useContent } from "@/hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import dynamic from "next/dynamic";

const QuickQuote = dynamic(() => import("@/components/QuickQuote"), { ssr: false });

const iconMap: Record<string, any> = {
  Home, Layout, TreePine, Building2, Building, Droplets,
  Shield: ShieldCheck, Award, Clock, BadgeCheck, TrendingUp, Star, Users,
  ClipboardCheck, Hammer, Sparkles, Clipboard, ShieldAlert, Flame, PencilRuler, Wrench
};

interface Region {
  name: string;
  cities: string[];
  zipcodes: string[];
  description?: string;
}

// 1. Ultra-Premium Service Card Component (Varying top-border colors based on index)
const ServiceCard = ({ service, index }: any) => {
  const slug = service.slug || service.title.toLowerCase().replace(/ & /g, '-').replace(/, /g, '-').replace(/ /g, '-');
  const Icon = iconMap[service.icon] || ShieldCheck;

  // Alternating highlight accent bars for visual diversity
  const borderColors = [
    "border-t-primary",
    "border-t-amber-500",
    "border-t-indigo-650"
  ];
  const activeBorder = borderColors[index % borderColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link href={service.buttonHref || `/services/${slug}`} className="block h-full">
        <div className={`relative h-full bg-white border-t-4 ${activeBorder} border-x border-b border-slate-200 rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-300 group-hover:-translate-y-1`}>
          <div className="relative z-10 flex flex-col h-full">
            {/* Styled Icon */}
            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:border-primary transition-colors duration-300">
              <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors duration-300" />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors">
              {service.title}
            </h3>

            {/* Description - High readability charcoal */}
            <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">
              {service.tagline || service.description}
            </p>

            {/* Feature Badges */}
            {service.features && service.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {service.features.slice(0, 3).map((f: any, i: number) => (
                  <span key={i} className="text-xs bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1 rounded-full font-bold">
                    {typeof f === 'string' ? f : f.text}
                  </span>
                ))}
              </div>
            )}

            {/* CTA anchor link */}
            <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider">
              {service.buttonText || "Explore Service"} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function ServiceAreaTemplate({ pageData }: { pageData?: any }) {
  const { services: dataRaw, faq } = useContent();
  const services = ((dataRaw as any)?.services || []).filter((s: any) => s.status === 'published' || s.status === undefined);

  // Safely extract content overrides or fallbacks
  const content = pageData?.content || {};

  const hero = content.hero || {
    headline: pageData?.title || "Our Service Areas",
    description: "Proudly serving St. Louis, St. Charles, and surrounding Missouri communities with elite, veteran-owned roofing and home improvements.",
    image: "/images/service-area-hero.jpg"
  };

  const bannerImg = hero.image || "/images/service-area-hero.jpg";

  const regions: Region[] = content.regions || [
    {
      name: "St. Louis County",
      cities: ["Chesterfield", "Wildwood", "Ballwin", "Kirkwood", "Webster Groves", "Florissant", "Hazelwood", "Maryland Heights", "Eureka", "Fenton", "Ladue", "Clayton"],
      zipcodes: ["63017", "63005", "63011", "63021", "63122", "63119", "63031", "63042", "63043", "63025", "63026", "63124", "63105"]
    },
    {
      name: "St. Charles County",
      cities: ["St. Charles", "St. Peters", "O'Fallon", "Wentzville", "Lake St. Louis", "Cottleville", "Weldon Spring", "Defiance"],
      zipcodes: ["63301", "63303", "63304", "63376", "63366", "63368", "63385", "63367"]
    },
    {
      name: "Jefferson County",
      cities: ["Arnold", "Imperial", "Festus", "Hillsboro", "House Springs", "Barnhart"],
      zipcodes: ["63010", "63052", "63028", "63050", "63051", "63012"]
    }
  ];

  const stats = content.stats || [
    { value: "15+", label: "Years of Local Expertise" },
    { value: "500+", label: "Premium Roofs Installed" },
    { value: "100%", label: "Veteran-Owned & Operated" }
  ];

  const processSteps = content.process || content.processSteps || [
    { title: "Free Inspection", description: "We perform a highly detailed visual inspection of your entire roof, shingle layers, gutters, and attic structure." },
    { title: "Custom Quote", description: "Receive an itemized, fully transparent project quote detailing premium materials, scopes, and warranty parameters." },
    { title: "Elite Install", description: "Our certified expert crews complete your roofing or siding replacement with ultimate military precision and focus." },
    { title: "Final Sign-Off", description: "We execute a deep ground clean-up and a final walkthrough with you to verify that our work exceeds your expectations." }
  ];

  const processSection = content.processSection || {
    headline: "Our Core Blueprint",
    title: "Our Elite 4-Step Process"
  };

  const mapData = content.map || {
    headline: "Our Coverage Area",
    title: "Our Operational Coverage Map",
    description: "Centrally dispatched to provide lightning-fast storm response, professional inspections, and veteran-grade roof installations across all primary Missouri counties.",
    iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199426.6823901614!2d-90.3835467!3d38.6531004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sSt.+Louis%2C+MO!5e0!3m2!1sen!2sus!4v1700000000000",
    bullet1Title: "Primary Coverage Area",
    bullet1Text: "St. Louis, St. Charles, Jefferson & surrounding communities.",
    bullet2Title: "Operation Hours",
    bullet2Text: "Mon - Sat: 7:00 AM - 6:00 PM (Emergency storm response 24/7)",
    bullet3Title: "Direct Office Hotline",
    bullet3Text: "(636) 293-9977"
  };

  const materialsData = content.materials || {
    headline: "Certified Excellence",
    title: "Premium Materials We Install",
    items: [
      { title: "Asphalt Shingles", description: "Architectural shingles engineered for ultimate storm protection, wind resilience, and custom color coordination to match your house aesthetics." },
      { title: "Standing Seam Metal", description: "High-end modern architectural profile that offers complete storm immunity, maximum energy efficiency, and a lifetime of zero maintenance." },
      { title: "High-End Siding", description: "Fiber cement siding configured to stand strong against moisture rot, pests, and high wind impacts, instantly boosting your curb appeal." },
      { title: "Seamless Gutters", description: "High-capacity aluminum water drainage channels manufactured custom on-site to perfectly fit your roof perimeter and protect your soil foundations." }
    ]
  };

  const servicesSection = content.servicesSection || {
    headline: "What We Provide",
    title: "Services We Provide in This Area",
    items: [
      { title: "Residential Roofing", description: "Pristine asphalt shingle and standing seam metal roof replacements designed for ultimate local storm immunity.", buttonText: "Explore Service", buttonHref: "/services/residential-roofing", icon: "Home" },
      { title: "Commercial Roofing", description: "Heavy-duty TPO, EPDM, and flat roof coatings configured for Missouri commercial properties and corporate facilities.", buttonText: "Explore Service", buttonHref: "/services/commercial-roofing", icon: "Building" },
      { title: "Seamless Gutters", description: "Custom on-site rolled high-capacity aluminum gutter installations to secure proper rain drainage controls.", buttonText: "Explore Service", buttonHref: "/services/seamless-gutters", icon: "Droplets" }
    ]
  };

  const whyChooseData = content.whyChoose || {
    headline: "Why Choose Us",
    title: "Elite Missouri Roofing Quality",
    items: [
      { title: "Licensed & Fully Insured", description: "Complete compliance for your peace of mind. We hold full general liability, workers' comp, and active licensing across all service counties." },
      { title: "Rapid Storm Dispatch", description: "Expedited emergency tarping and inspections. St. Louis storm damage requires immediate action, and our teams respond directly inside our operational radius." },
      { title: "Veteran Owned Standards", description: "Applying military precision, honor, and elite craftsmanship to every shingle repair, gutter build, and residential siding replacement." }
    ]
  };

  const overviewData = content.overview || {
    headline: "Local Overview",
    title: "Elite Roofing & Restoration in This Community",
    description: "<p>Proudly providing premium residential roofing, standing seam metal builds, siding updates, and gutter cleanups to Missouri homeowners. We combine veteran precision with durable local materials.</p>",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact",
    image: "/images/service-area-overview.jpg"
  };

  const regionsSection = content.regionsSection || {
    title: "Communities We Serve in This Region",
    description: "Toggle regional counties to view specific community coverage lists."
  };

  const cta = content.cta || {
    headline: "Ready to Start Your Project?",
    description: "Whether you need a minor repair or a complete roof replacement, our expert team is ready to protect your home. Contact us today for an elite-grade service experience.",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact"
  };

  const pageUrlDisplay = (() => {
    const slug = pageData?.slug?.toString().trim();
    if (!slug) return "https://eaglerevolution.com";

    const normalizedSlug = slug.replace(/^\/+|\/+$/g, "");
    if (/^https?:\/\//i.test(normalizedSlug)) return normalizedSlug;

    return `https://eaglerevolution.com/${normalizedSlug}`;
  })();

  return (
    <div className="relative bg-slate-50 text-slate-900 min-h-screen font-body overflow-x-hidden">

      {/* ================= 1. HERO BANNER - 100% PURE WHITE TEXT OVERRIDES ================= */}
      <section className="relative pt-36 pb-32 sm:pt-44 sm:pb-36 bg-slate-950 overflow-hidden">
        {/* Background Banner Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={bannerImg}
            alt={pageData?.title || "Service Area Banner"}
            className="w-full h-full object-cover opacity-35"
          />
          {/* Guaranteed Deep Contrast Mask Overlay */}
          <div className="absolute inset-0 bg-slate-950/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-950/40" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">

          {/* Breadcrumbs - High Contrast */}
          <nav className="inline-flex items-center gap-2 text-xs sm:text-sm  text-white mb-8 uppercase tracking-wider bg-white/10 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/20">
            <Link href="/" className=" text-white transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 text-slate-400" />

            <span className="text-white font-black">{pageData?.title || "Coverage"}</span>
          </nav>

          {/* Page Title */}
          <h1 className="text-4xl sm:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
            {hero.headline}
          </h1>

          {/* Description - FORCED 100% PURE WHITE LEGIBLE TEXT WITH NESTED CSS OVERRIDES */}
          <div className="max-w-3xl mx-auto text-white text-lg sm:text-xl font-normal leading-relaxed [&_*]:!text-white [&_p]:!text-white [&_span]:!text-white [&_strong]:!text-white">
            <RichTextRenderer content={hero.description} />
          </div>
        </div>
      </section>

      {/* ================= 2. STATS SECTION ================= */}
      <section className="relative z-20 -mt-10 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0 bg-white border border-slate-200 rounded-3xl p-8 md:p-10 shadow-xl text-center">
          {stats.map((stat: any, idx: number) => (
            <div
              key={idx}
              className={`space-y-2 py-4 ${idx < stats.length - 1 ? 'md:border-r-2 border-slate-200' : ''}`}
            >
              <h3 className="text-4xl sm:text-5xl font-heading font-black text-slate-900 leading-none">
                {stat.value}
              </h3>
              <p className="text-xs sm:text-sm font-black text-slate-600 uppercase tracking-widest">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= MAP SECTION - macOS BROWSER DEVICE MOCKUP (Fully Dynamic) ================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Side: Local Highlight Details */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">{mapData.headline}</span>
              <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
                {mapData.title}
              </h2>
              <div className="w-12 h-0.5 bg-primary/60 mt-4 rounded-full" />
            </div>

            <p className="text-slate-700 text-sm sm:text-base leading-relaxed font-semibold">
              {mapData.description}
            </p>

            {/* List Widgets with custom borders */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{mapData.bullet1Title}</h4>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">{mapData.bullet1Text}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{mapData.bullet2Title}</h4>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">{mapData.bullet2Text}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4.5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">{mapData.bullet3Title}</h4>
                  <p className="text-xs text-slate-600 font-bold mt-0.5">
                    Call <a href={`tel:${mapData.bullet3Text.replace(/[^0-9]/g, '')}`} className="font-black text-primary hover:underline">{mapData.bullet3Text}</a> to request dispatch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: macOS styled browser mockup frame around map */}
          <div className="lg:col-span-7 w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

            {/* macOS Browser Header */}
            <div className="bg-slate-100 border-b border-slate-200 px-5 py-3.5 flex items-center gap-4">
              {/* Window Controls Dots */}
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
              </div>
              {/* Fake URL Bar */}
              <div className="bg-white border border-slate-200/80 rounded-lg text-[11px] text-slate-500 font-semibold px-4 py-1 flex-1 flex items-center gap-2 select-none shadow-inner">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{pageUrlDisplay}</span>
              </div>
            </div>

            {/* Google Map Frame */}
            <div className="h-[400px] w-full relative">
              <iframe
                src={mapData.iframeUrl}
                className="w-full h-full border-none"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ================= PROCESS SECTION - DYNAMIC TIMELINE CARDS ================= */}
      <section className="py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            {processSection.headline && (
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">{processSection.headline}</span>
            )}
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              {processSection.title}
            </h2>
            <div className="w-16 h-0.5 bg-primary/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {processSteps.map((step: any, pIdx: number) => {
              const defaultIcons = [ClipboardCheck, TrendingUp, Hammer, Sparkles];
              const StepIcon = iconMap[step.icon] || defaultIcons[pIdx % defaultIcons.length];

              // Alternating dynamic colors for watermark numbers
              const watermarkColors = [
                "group-hover:text-primary/10",
                "group-hover:text-amber-500/10",
                "group-hover:text-indigo-500/10",
                "group-hover:text-emerald-500/10"
              ];
              const activeColor = watermarkColors[pIdx % watermarkColors.length];

              return (
                <div
                  key={pIdx}
                  className="bg-slate-50 border border-slate-200 rounded-3xl p-8 relative overflow-hidden group hover:border-primary/40 hover:shadow-xl transition-all duration-300"
                >
                  {/* Distinct Color Watermark Numbers */}
                  <span className={`text-6xl font-black text-slate-200/50 ${activeColor} transition-colors absolute -right-2 -bottom-2 z-0 select-none`}>
                    {String(pIdx + 1).padStart(2, '0')}
                  </span>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading font-bold text-xl text-slate-900">
                      {step.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed font-semibold">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ================= PREMIUM MATERIALS WE INSTALL (Fully Dynamic) ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">{materialsData.headline}</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              {materialsData.title}
            </h2>
            <div className="w-16 h-0.5 bg-primary/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {materialsData.items.map((item: any, mIdx: number) => {
              // Dynamic themed details based on item index
              const materialIcons = [Building, Flame, PencilRuler, Droplets];
              const MaterialIcon = iconMap[item.icon] || materialIcons[mIdx % materialIcons.length];

              const cardClasses = [
                "border-t-amber-500 hover:border-amber-300 hover:shadow-2xl",
                "border-t-indigo-600 hover:border-indigo-300 hover:shadow-2xl",
                "border-t-emerald-600 hover:border-emerald-300 hover:shadow-2xl",
                "border-t-sky-500 hover:border-sky-300 hover:shadow-2xl"
              ];
              const activeCardClass = cardClasses[mIdx % cardClasses.length];

              const iconClasses = [
                "bg-amber-50 text-amber-600 border border-amber-100 group-hover:bg-amber-500 group-hover:text-white",
                "bg-indigo-50 text-indigo-650 border border-indigo-105 group-hover:bg-indigo-600 group-hover:text-white",
                "bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white",
                "bg-sky-50 text-sky-600 border border-sky-100 group-hover:bg-sky-500 group-hover:text-white"
              ];
              const activeIconClass = iconClasses[mIdx % iconClasses.length];

              const textColors = [
                "group-hover:text-amber-600",
                "group-hover:text-indigo-600",
                "group-hover:text-emerald-600",
                "group-hover:text-sky-550"
              ];
              const activeTextColor = textColors[mIdx % textColors.length];

              return (
                <div key={mIdx} className={`bg-white border-t-4 ${activeCardClass} border-x border-b border-slate-200 rounded-3xl p-8 shadow-sm transition-all duration-355 flex flex-col h-full group`}>
                  <div className={`w-12 h-12 rounded-2xl ${activeIconClass} flex items-center justify-center mb-6 transition-colors duration-300`}>
                    <MaterialIcon className="w-6 h-6" />
                  </div>
                  <h3 className={`font-heading font-bold text-xl text-slate-900 mb-3 ${activeTextColor} transition-colors`}>
                    {item.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-semibold flex-grow">
                    {item.description}
                  </p>
                  {item.buttonLabel && item.buttonHref && (
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <Link
                        href={item.buttonHref}
                        className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-wider hover:gap-3 transition-all duration-200"
                      >
                        {item.buttonLabel}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}

          </div>

        </div>
      </section>

      {/* ================= COMMUNITY ACCORDION COUNTY CARD GROUPS ================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-4xl font-heading font-bold text-slate-900 mb-4">
            {regionsSection.title}
          </h2>
          {regionsSection.description && (
            <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto font-semibold">
              {regionsSection.description}
            </p>
          )}
        </div>

        {/* Regions grid - folder structure */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {regions.map((region, idx) => (
    <motion.div
      key={region.name}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.03 }}
      className="group"
    >
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
        
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 to-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <h3 className="font-heading font-bold text-slate-900 text-base tracking-tight">
          {region.name}
        </h3>

      </div>
    </motion.div>
  ))}
</div>
      </section>

      {/* ================= 3. ACTIVE SERVICE CARDS ================= */}
      <section className="bg-white py-24 border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">{servicesSection.headline}</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              {servicesSection.title}
            </h2>
            <div className="w-16 h-0.5 bg-primary/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(servicesSection.items || services.slice(0, 6)).map((service: any, index: number) => (
              <ServiceCard key={index} service={service} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* ================= WHY CHOOSE US - (Middle Card Highlighted in Premium Dark-Slate) (Fully Dynamic) ================= */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-primary text-xs font-bold tracking-widest uppercase mb-3 block">{whyChooseData.headline}</span>
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight">
              {whyChooseData.title}
            </h2>
            <div className="w-16 h-0.5 bg-primary/60 mx-auto mt-5 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">

            {whyChooseData.items.map((item: any, wIdx: number) => {
              const chooseIcons = [ShieldCheck, Clock, Award];
              const ChooseIcon = iconMap[item.icon] || chooseIcons[wIdx % chooseIcons.length];

              if (wIdx === 1) {
                // Highlighted centerpiece dark-slate card
                return (
                  <div key={wIdx} className="flex flex-col items-center text-center p-10 bg-slate-900 text-white rounded-3xl shadow-2xl relative scale-105 border-2 border-primary/40 group hover:border-primary transition-all duration-300 z-10">
                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md">
                      Highly Requested
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-8 shadow-lg group-hover:scale-105 transition-transform">
                      <ChooseIcon className="w-8 h-8 animate-pulse " />
                    </div>
                    <h3 className="font-heading font-black text-2xl text-white mb-4">{item.title}</h3>
                    <p className="text-sm text-white leading-relaxed font-bold">
                      {item.description}
                    </p>
                  </div>
                );
              }

              // Standard white card
              return (
                <div key={wIdx} className="flex flex-col items-center text-center p-8 bg-white border border-slate-200 rounded-3xl shadow-sm relative group hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-inner group-hover:scale-105 transition-transform">
                    <ChooseIcon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-semibold">
                    {item.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ================= DYNAMIC OVERVIEW SECTION (Heading left, Image right) ================= */}
      <section className="py-24 bg-white border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Side: Overview Details & CTA */}
            <div className="lg:col-span-6 space-y-6">
              {overviewData.headline && (
                <span className="text-primary text-xs font-bold tracking-widest uppercase block">{overviewData.headline}</span>
              )}
              <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
                {overviewData.title}
              </h2>
              <div className="w-16 h-0.5 bg-primary/60 rounded-full" />

              <div className="text-slate-700 text-sm sm:text-base leading-relaxed font-semibold [&_p]:!text-slate-700 [&_p]:!font-semibold [&_span]:!text-slate-700 [&_p]:!leading-relaxed">
                <RichTextRenderer content={overviewData.description} />
              </div>

              {overviewData.buttonText && (
                <div className="pt-4">
                  <a
                    href={overviewData.buttonHref || "#contact"}
                    className="inline-flex items-center justify-center bg-primary hover:bg-primary/95 text-white font-black px-8 py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] text-xs uppercase tracking-wider gap-2 group"
                  >
                    {overviewData.buttonText}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              )}
            </div>

            {/* Right Side: Showcase Illustration Image */}
            <div className="lg:col-span-6">
              <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200/80 group">
                <img
                  src={overviewData.image || "/images/service-area-overview.jpg"}
                  alt={overviewData.title}
                  className="w-full h-[450px] object-cover hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 to-transparent pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section className="bg-white">
        <PageInlineFaqs 
          faqs={(content.faqs && content.faqs.length > 0) ? content.faqs : faq.items} 
          faqSchemaMarkup={content.faqSchemaMarkup} 
          badge={content.faqBadge}
          title={content.faqTitle}
          subtitle={content.faqDescription}
        />
      </section>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <div className="relative bg-slate-950 rounded-[2rem] p-10 sm:p-16 text-center border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 opacity-70" />
          </div>

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight">
              {cta.headline}
            </h2>
            <p className="text-white text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-medium">
              {cta.description}
            </p>
            <a
              href={cta.buttonHref}
              className="inline-flex items-center justify-center bg-white hover:bg-slate-100 text-slate-950 font-black px-8 py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] text-xs sm:text-sm uppercase tracking-wider gap-2 group"
            >
              {cta.buttonText} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>
      </section>

      <QuickQuote />

    </div>
  );
}
