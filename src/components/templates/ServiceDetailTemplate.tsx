"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform
} from 'framer-motion';
import {
  Home, Layout, TreePine, Building2, Building, Droplets,
  CheckCircle, ArrowRight, Phone, Clock, Shield, Award,
  ChevronRight, Star, ThumbsUp, Truck,
  ChevronDown, ArrowUpRight, Users, Trophy, Loader2,
  FileText, ClipboardCheck, Hammer, Minus, Plus, Sparkles, Zap, Palette, Sun, Snowflake,
  ShieldCheck, BadgeCheck, TrendingUp, Check, Wrench, HardHat, Ruler, Paintbrush, Wind, Flame, Thermometer,
  Shovel, Fence, Drill, Square, Box, Construction, PenTool as Tool,
  Map, MapPin, Search, Settings, Mail, Globe, Layers,
  Warehouse, Factory, Store, Landmark, Castle, Mountain, Trees,
  Droplet, FlameKindling, Lightbulb, Power
} from 'lucide-react';
import { notFound } from 'next/navigation';
import breakcrumb from '@/assets/Breadcrumb-Image.jpeg';
import { useContent } from "../../hooks/useContent";
import RichTextRenderer from "../ui/RichTextRenderer";
import PageInlineFaqs from "../PageInlineFaqs";
import BlogSection from "../sections/BlogSection";
import FeaturedComparison from '../FeaturedComparison';
import FeaturedDetailGrid from '../FeaturedDetailGrid';

import roofingImg from '@/assets/roof1.jpg.jpeg';
import windowsImg from '@/assets/window5.jpeg';
import decksImg from '@/assets/outdoor-sitting-desk.png';
import commercialImg from '@/assets/commercial-tpo.png';
import sidingImg from '@/assets/siding5.jpg.jpeg';
import gutter from '@/assets/gutterinstallation.jpg.jpeg';
import pvcdecks from '@/assets/pvcdecks.jpg.jpeg';

const iconMap: Record<string, any> = {
  Home, Layout, TreePine, Building2, Building, Droplets,
  Shield, Trophy, Users, ThumbsUp, FileText, ClipboardCheck,
  Truck, Hammer, CheckCircle, Award, Clock, Sparkles, Zap, Palette, Sun, Snowflake, Star,
  ShieldCheck, BadgeCheck, TrendingUp, Check, Wrench, HardHat, Ruler, Paintbrush, Wind, Flame, Thermometer,
  Shovel, Fence, Drill, Square, Box, Construction, Tool,
  Map, MapPin, Search, Settings, Phone, Mail, Globe, Layers,
  Warehouse, Factory, Store, Landmark, Castle, Mountain, Trees,
  Droplet, FlameKindling, Lightbulb, Power
};

const imageMap: Record<string, any> = {
  'Residential Roofing': roofingImg,
  'Windows & Doors': windowsImg,
  'Custom Decks': decksImg,
  'Commercial Roofing': commercialImg,
  'Siding, Soffit & Fascia': sidingImg,
  'Gutters & Protection': gutter,
  'PVC Decking': pvcdecks
};

// --- Counter Component ---
const parseStatValue = (val: string) => {
  const str = String(val || "").trim();
  const match = str.match(/^([^0-9]*)([0-9]+)([^0-9]*)$/);
  if (match) {
    return {
      prefix: match[1] || "",
      number: parseInt(match[2].replace(/,/g, ''), 10) || 0,
      suffix: match[3] || ""
    };
  }
  return {
    prefix: "",
    number: parseInt(str.replace(/[^0-9]/g, ''), 10) || 0,
    suffix: str.replace(/[0-9]/g, '')
  };
};

const Counter = ({ value, prefix = "", suffix = "", duration = 2, start = false }: any) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (start) {
      let startTime: number | undefined;
      const animate = (timestamp: any) => {
        if (startTime === undefined) startTime = timestamp;
        const progress = Math.min((timestamp - startTime!) / (duration * 1000), 1);
        const easedProgress = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easedProgress * value));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }
  }, [start, value, duration]);

  return (
    <span className="tabular-nums">
      {prefix}
      {(count ?? 0).toLocaleString()}
      {suffix}
    </span>
  );
};

// --- StatCard Component ---
const StatCard = ({ stat, index }: any) => {
  const cardRef = useRef<any>(null);
  const inView = useInView(cardRef, { once: true, margin: "50px" });
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [10, -10]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-10, 10]);

  const handleMouseMove = (e: any) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / rect.width - 0.5;
    const mouseY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const StatIcon = iconMap[stat.icon] || Shield;
  const parsed = parseStatValue(stat.value);
  const hasNumber = /[0-9]/.test(String(stat.value || ""));

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
      transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      className="relative group lg:px-2"
    >
      <div className="relative h-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl sm:rounded-3xl p-3 sm:p-8 overflow-hidden transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-primary/30 group-hover:shadow-[0_20px_50px_rgba(36,48,210,0.15)]">
        <div className="absolute -inset-24 bg-primary/5 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="icon-container w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl sm:rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:!bg-primary group-hover:!border-primary transition-all duration-300">
              <StatIcon className="icon w-5 h-5 sm:w-6 sm:h-6 !text-primary group-hover:!text-white transition-all duration-300" />
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-primary/40 group-hover:text-primary transition-colors">
              {stat.category || "Impact"}
            </div>
          </div>

          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="text-2xl xs:text-4xl sm:text-5xl font-black text-foreground tracking-tight">
              {hasNumber ? (
                <Counter
                  value={parsed.number}
                  prefix={parsed.prefix}
                  suffix={parsed.suffix}
                  start={inView}
                />
              ) : (
                stat.value
              )}
            </h3>
            <p className="text-[10px] sm:text-sm font-semibold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {stat.label}
            </p>
          </div>

          <div className="mt-4 sm:mt-8 flex items-center gap-2 sm:gap-4">
            <div className="h-[1.5px] sm:h-[2px] w-6 sm:w-8 bg-primary/20 group-hover:w-full group-hover:bg-primary transition-all duration-500 rounded-full" />
            <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all duration-500" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Process Card Component ---
const ProcessCard = ({ step, index }: { step: any, index: number }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-50px" });
  const StepIcon = iconMap[step.icon] || Shield;
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      className="relative group h-full"
      style={{ opacity: 1, transform: "perspective(1500px)" }}
    >
      <div className="relative h-full bg-card/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-border/50 overflow-hidden transition-all duration-300">
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, hsl(var(--primary)/0.08), transparent 50%)`,
          }}
        />
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-0 transition-all duration-700 ease-out pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 translate-x-[100%] group-hover:translate-x-0 transition-all duration-700 ease-out pointer-events-none" />
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 border-t-2 border-l-2 border-primary/20 transition-colors duration-300 group-hover:border-primary/40 pointer-events-none" />
        <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-6 h-6 sm:w-8 sm:h-8 border-b-2 border-r-2 border-primary/20 transition-colors duration-300 group-hover:border-primary/40 pointer-events-none" />
        <div className="relative p-4 sm:p-8 lg:p-10 flex flex-col h-full z-10">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 mb-6 sm:mb-8 flex-shrink-0">
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl border border-primary/20 transition-transform duration-700 group-hover:rotate-45" />
            <div className="absolute inset-1 sm:inset-1.5 rounded-lg sm:rounded-xl border border-primary/10 transition-transform duration-500 group-hover:-rotate-45" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-primary transition-transform duration-300 group-hover:scale-110">
                <StepIcon className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
            </div>
          </div>
          <div className="mb-3 sm:mb-4">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-primary/50">Phase {String(index + 1).padStart(2, '0')}</span>
          </div>
          <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl font-heading font-bold text-foreground mb-2 xs:mb-3 sm:mb-4 group-hover:text-primary transition-colors duration-300">{step.title}</h3>
          <RichTextRenderer
            content={step.description}
            className="text-muted-foreground text-xs sm:text-base leading-relaxed flex-1"
          />
          <div className="mt-5 sm:mt-6 h-[2px] bg-gradient-to-r from-primary to-primary/40 rounded-full w-0 group-hover:w-full transition-all duration-700 ease-out" />
        </div>
      </div>
    </motion.div>
  );
};

// --- Benefit Card Component ---
const BenefitCard = ({ benefit, index }: { benefit: any, index: number }) => {
  const Icon = iconMap[benefit.icon] || Shield;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-8 border border-border hover:border-primary/30 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 rounded-xl sm:rounded-2xl transition-opacity duration-500 pointer-events-none" />
      <div className="relative z-10">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:bg-primary transition-all duration-300">
          <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary group-hover:text-white transition-colors duration-300" />
        </div>
        <h3 className="text-base sm:text-xl font-heading font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
          {benefit.title}
        </h3>
        <RichTextRenderer
          content={benefit.description}
          className="text-muted-foreground text-sm sm:text-base leading-relaxed"
        />
        <div className="mt-4 sm:mt-6 w-6 sm:w-8 h-px bg-primary/30 group-hover:w-12 sm:group-hover:w-16 group-hover:bg-primary transition-all duration-300" />
      </div>
    </motion.div>
  );
};

// --- FAQ Item Component removed as PageInlineFaqs is now used ---
// --- End of FAQ Item Component ---

export default function ServiceDetailTemplate({ pageData, params: syncParams }: { pageData?: any, params?: any }) {
  const { services: servicesData, allBlogs, blogSection } = useContent();
  const [slug, setSlug] = useState<string | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  useEffect(() => {
    if (pageData?.slug) setSlug(pageData.slug);
    else if (syncParams?.slug) {
      const pSlug = syncParams.slug;
      setSlug(Array.isArray(pSlug) ? pSlug.join('/') : pSlug);
    }
  }, [pageData, syncParams]);

  const servicesList = (servicesData as any).services || [];
  const service = servicesList.find((s: any) => s.slug === slug);

  useEffect(() => {
    if (service) {
      setIsDataLoaded(true);
    }
  }, [service]);



  if (!service || !isDataLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest animate-pulse">Syncing Service Intelligence...</p>
      </div>
    );
  }

  const faqs = service.faq || [];
  const processSteps = service.process || [];
  const statsData = service.stats || [];
  const benefits = service.benefits || [];

  const recommendedServices = servicesList
    .filter((s: any) => s.slug !== slug && (s.status === 'published' || s.status === undefined || s.status === 'publish'))
    .slice(0, 3);

  return (
    <main className="bg-background text-foreground font-body">
      {/* Hero Section */}
      <section className="relative h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] w-full">
        {service.breadcrumbImage ? (
          <img src={service.breadcrumbImage} alt={service.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Image src={breakcrumb} alt={service.title} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="max-w-3xl">
              <div className="flex items-center gap-1 sm:gap-2 text-[10px] xs:text-xs sm:text-sm mb-3 sm:mb-6">
                <Link href="/" className="text-white/70 hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/40" />
                <Link href="/services" className="text-white/70 hover:text-white transition-colors">Services</Link>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/40" />
                <span className="text-white truncate max-w-[120px] xs:max-w-[150px] sm:max-w-none">{service.breadcrumbText || service.title}</span>
              </div>
              <h1 className="text-2xl xs:text-3xl sm:text-5xl md:text-7xl font-heading font-bold text-white mb-3 sm:mb-6 leading-tight">
                {service.title}
              </h1>
              <div className="w-16 sm:w-20 h-0.5 sm:h-1 bg-primary mb-4 sm:mb-6" />
              <p className="text-white/80 text-sm xs:text-base sm:text-xl max-w-2xl">
                {service.heroDescription || "Professional solutions with military precision and architectural excellence."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-6 sm:py-8 px-4 sm:px-8 w-full z-20">
        <div className="w-full max-w-7xl mx-auto">
          <div className="relative bg-background/80 backdrop-blur-2xl border border-border/50 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-12 lg:p-16 shadow-2xl overflow-hidden shadow-primary/5">
            <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-gradient-to-br from-primary/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-primary/5 to-transparent blur-3xl pointer-events-none" />
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(hsl(var(--primary)) 0.5px, transparent 0.5px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
              {statsData.map((stat: any, idx: number) => (
                <StatCard key={idx} stat={stat} index={idx} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-6 xs:py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 lg:gap-16 items-center">

            {/* Text Column — order-2 on mobile, order-1 on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1 text-center lg:text-left flex flex-col items-center lg:items-start"
            >
              {/* Tagline badge */}
              {service.tagline && (
                <div className="flex justify-center lg:justify-start w-full mb-2">
                  <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-primary/10">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider">{service.tagline}</span>
                  </div>
                </div>
              )}

              {/* Overview Heading — split highlight or legacy fallback */}
              <h2 className="text-2xl xs:text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 sm:mb-6 leading-tight">
                {(service.overviewTitlePrefix || service.overviewTitleHighlight || service.overviewTitleSuffix) ? (
                  <>
                    {service.overviewTitlePrefix && (
                      <span className="text-foreground">{service.overviewTitlePrefix}<br /></span>
                    )}
                    {service.overviewTitleHighlight && (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                        {service.overviewTitleHighlight}
                      </span>
                    )}
                    {service.overviewTitleSuffix && (
                      <span className="text-foreground">{service.overviewTitleSuffix}</span>
                    )}
                  </>
                ) : (
                  service.overviewTitle || "Craftsmanship Without Compromise."
                )}
              </h2>

              {/* Description */}
              <RichTextRenderer
                content={service.overview}
                className="text-sm sm:text-base lg:text-lg text-muted-foreground mb-6 sm:mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0"
              />

              {/* Overview Stats — icon + label checklist, 2-col grid */}
              {Array.isArray(service.overviewStats) && service.overviewStats.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10 w-full lg:max-w-none mx-auto lg:mx-0">
                  {service.overviewStats.slice(0, 4).map((stat: any, i: number) => {
                    const StatIcon = iconMap[stat.icon] || CheckCircle;
                    return (
                      <div key={i} className="flex items-center justify-center lg:justify-start gap-2 sm:gap-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <StatIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                        </div>
                        <span className="text-foreground text-sm sm:text-base font-medium">{stat.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}



              {/* CTA Button */}
              <motion.div className="mb-10 w-full" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center lg:justify-start gap-4 w-full">
                  <Link href={service.cta?.link || "/contact-us"} className="flex-1 sm:flex-initial">
                    <div className="group relative overflow-hidden h-full px-7 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 text-base font-semibold tracking-wide bg-primary text-white border border-primary/30 transition-all duration-300 active:scale-[0.98] hover:text-white w-full sm:w-auto">
                      <span className="relative z-10">{service.cta?.text || "Start Your Project"}</span>
                      <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>

            {/* Image Column — order-1 on mobile, order-2 on desktop */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <div className="relative aspect-[4/5] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src={service.overviewImage || (imageMap[service.title] ? (imageMap[service.title] as any).src : "/src/assets/roof1.jpg.jpeg")}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Featured Category Sections */}
      {service.isFeaturedCategory && (
        <>
          <FeaturedComparison data={service.featuredComparison} />
          <FeaturedDetailGrid data={service.featuredGrid} />
        </>
      )}

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <section className="py-6 xs:py-8 sm:py-10 md:py-12 bg-muted/30 border-y border-border">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div className="w-8 sm:w-12 h-px bg-primary/30" />
                <span className="text-[8px] xs:text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary">
                  {service.benefitsBadge || "The Eagle Edge"}
                </span>
                <div className="w-8 sm:w-12 h-px bg-primary/30" />
              </div>
              <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-3 sm:mb-4">
                {(service.benefitsTitlePrefix || service.benefitsTitleHighlight || service.benefitsTitleSuffix) ? (
                  <>
                    {service.benefitsTitlePrefix && <span>{service.benefitsTitlePrefix}</span>}
                    {service.benefitsTitleHighlight && (
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80 mx-1.5 sm:mx-2 inline-block">
                        {service.benefitsTitleHighlight}
                      </span>
                    )}
                    {service.benefitsTitleSuffix && <span>{service.benefitsTitleSuffix}</span>}
                  </>
                ) : service.benefitsTitle ? (
                  <span>{service.benefitsTitle}</span>
                ) : (
                  <>
                    Engineered To{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
                      Outlast
                    </span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
                {service.benefitsDescription || `Experience the difference with our unwavering commitment to military-grade excellence`}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {benefits.map((benefit: any, idx: number) => (
                <BenefitCard key={idx} benefit={benefit} index={idx} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Process Section */}
      <section className="relative py-16 xs:py-20 sm:py-24 md:py-32 bg-background overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{
              x: [-15, 15, -15],
              y: [15, -15, 15],
              scale: [0.95, 1.05, 0.95]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-40 -right-40 w-[300px] xs:w-[400px] sm:w-[600px] h-[300px] xs:h-[400px] sm:h-[600px] bg-primary/[0.02] rounded-full blur-[80px] xs:blur-[100px] sm:blur-[120px]"
          />
          <motion.div
            animate={{
              x: [15, -15, 15],
              y: [-15, 15, -15],
              scale: [1.02, 0.98, 1.02]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -bottom-40 -left-40 w-[300px] xs:w-[400px] sm:w-[500px] h-[300px] xs:h-[400px] sm:h-[500px] bg-primary/[0.02] rounded-full blur-[80px] xs:blur-[100px] sm:blur-[120px]"
          />
        </div>
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-10 xs:mb-16 sm:mb-20">
            <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-6">
              <div className="w-6 sm:w-12 h-[1px] sm:h-[1.5px] bg-gradient-to-r from-transparent to-primary/40" />
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.4em] text-primary">
                {service.processBadge || "Methodology"}
              </span>
              <div className="w-6 sm:w-12 h-[1px] sm:h-[1.5px] bg-gradient-to-l from-transparent to-primary/40" />
            </div>
            <h2 className="text-2xl xs:text-4xl sm:text-4xl md:text-6xl lg:text-6xl font-heading font-bold text-foreground mb-3 sm:mb-6 leading-tight sm:leading-[1.05]">
              {(service.processTitlePrefix || service.processTitleHighlight || service.processTitleSuffix) ? (
                <>
                  {service.processTitlePrefix && <span>{service.processTitlePrefix} </span>}
                  {service.processTitleHighlight && (
                    <span className="text-primary">
                      {service.processTitleHighlight}
                    </span>
                  )}
                  {service.processTitleSuffix && <span> {service.processTitleSuffix}</span>}
                </>
              ) : service.processTitle ? (
                <span>{service.processTitle}</span>
              ) : (
                <>
                  Precision in <br className="hidden sm:block" />
                  <span className="text-primary">every detail</span>
                </>
              )}
            </h2>
            <p className="text-sm sm:text-base lg:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
              {service.processDescription || "A battle-tested framework that ensures consistency, quality, and complete satisfaction—from initial consultation to final walkthrough."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-7">
            {processSteps.map((step: any, idx: number) => (
              <ProcessCard key={idx} step={step} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <PageInlineFaqs 
        faqs={faqs} 
        faqSchemaMarkup={service.faqSchemaMarkup} 
        badge={service.faqBadge}
        title={service.faqTitle}
        subtitle={service.faqDescription}
      />

      {/* Why Choose Us CTA Card */}
      <div className="w-full max-w-7xl mx-auto px-4 py-4">
        <div className="relative mt-4 overflow-hidden" style={{ opacity: 1, transform: "none" }}>
          <div className="relative bg-card border border-border rounded-2xl">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rotate-12" style={{ transform: "rotate(12.3581deg)" }}></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 -rotate-12" style={{ transform: "rotate(-12.3581deg)" }}></div>
            </div>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" style={{ transform: "translateX(-43.1333%)" }}></div>
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" style={{ transform: "translateX(43.1333%)" }}></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/30"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/30"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/30"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/30"></div>
            <div className="relative px-5 sm:px-8 py-10 sm:py-12 flex flex-col lg:flex-row items-center justify-between gap-8 sm:gap-10 z-30">
              <div className="max-w-2xl text-center lg:text-left flex flex-col items-center lg:items-start">
                <div className="flex justify-center lg:justify-start w-full">
                  <div className="flex items-center gap-2 mb-4 mt-4" style={{ opacity: 1, transform: "none" }}>
                    <span className="w-8 h-[2px] bg-primary"></span>
                    <span className="text-base sm:text-lg font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-primary">Why Choose Us</span>
                  </div>
                </div>
                <h3 className="text-2xl xs:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 leading-tight">One Of America's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">Top Rated</span><br />Home Improvement Team</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg leading-relaxed max-w-lg mb-6">Join thousands of satisfied homeowners who trusted us with their most valuable investment.</p>
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">A+ BBB Rating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">24/7 Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-wider">Free Estimates</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link className="relative flex-1 sm:flex-initial" href="/contact-us">
                  <div className="h-full px-8 py-4 bg-primary text-white font-bold rounded-full shadow-sm hover:text-white overflow-hidden flex items-center justify-center gap-2" tabIndex={0} style={{ transform: "none" }}>
                    <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">Get Free Quote<ArrowRight className="w-4 h-4" /></span>
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </div>
                </Link>
                <a href="tel:636-449-9714" className="relative px-8 py-4 bg-white text-primary border-2 border-primary font-bold rounded-full shadow-sm hover:bg-primary hover:text-white hover:shadow-md transition-all duration-300 overflow-hidden flex items-center justify-center gap-2 mb-4" tabIndex={0}>
                  <span className="relative z-10 flex items-center gap-2 text-sm md:text-base">Call Now: 636-449-9714<Phone className="w-4 h-4" /></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Explore More Services Section */}
      <section className="py-16 xs:py-20 sm:py-24 md:py-28 bg-background">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16" style={{ opacity: 1, transform: "none" }}>
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 sm:w-12 h-px bg-primary/30"></div>
              <span className="text-[8px] xs:text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-primary">Our Portfolio</span>
              <div className="w-8 sm:w-12 h-px bg-primary/30"></div>
            </div>
            <h2 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-3 sm:mb-4">Explore More Services</h2>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg px-2">Discover our full range of premium home improvement solutions</p>
          </div>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {recommendedServices.map((recService: any, idx: number) => {
              const serviceSlug = recService.slug || recService.title.toLowerCase().replace(/ & /g, '-').replace(/, /g, '-').replace(/ /g, '-');
              const Icon = iconMap[recService.icon] || Droplets;
              const serviceImage = recService.overviewImage || (imageMap[recService.title] ? (imageMap[recService.title] as any).src : roofingImg.src);
              return (
                <div key={idx} style={{ opacity: 1, transform: "none" }}>
                  <Link 
                    className="group block relative overflow-hidden rounded-2xl sm:rounded-3xl bg-card border border-border shadow-lg hover:shadow-2xl transition-all duration-500 h-full" 
                    href={`/services/${serviceSlug}`}
                  >
                    <div className="relative h-48 xs:h-52 sm:h-56 overflow-hidden">
                      <img 
                        alt={recService.title} 
                        loading="lazy" 
                        decoding="async" 
                        className="object-cover group-hover:scale-110 transition-transform duration-700 w-full h-full" 
                        src={serviceImage}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 lg:p-7 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-2 sm:mb-3">
                        <span className="text-[10px] xs:text-xs font-bold uppercase tracking-wider text-primary">
                          {recService.tagline || recService.category || "Premium Service"}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-xl font-heading font-bold text-foreground mb-2 sm:mb-3 group-hover:text-primary transition-colors">
                        {recService.title}
                      </h3>
                      <p className="text-muted-foreground text-xs xs:text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 line-clamp-2">
                        {recService.heroDescription || recService.description || "Professional dynamic service."}
                      </p>
                      <div className="flex items-center gap-2 text-primary text-sm sm:text-base font-semibold group-hover:gap-3 transition-all mt-auto">
                        <span>Learn More</span>
                        <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8 sm:mt-12" style={{ opacity: 1 }}>
            <Link 
              className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-4 border-2 border-primary text-primary text-sm sm:text-base font-semibold rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
              href="/services"
            >
              View All Services
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Link>
          </div>
        </div>
      </section>

      <BlogSection
        title={service.blogSection?.title || blogSection?.title}
        subtitle={service.blogSection?.subtitle || blogSection?.subtitle}
        description={service.blogSection?.description || blogSection?.description}
        posts={allBlogs.filter((p: any) => (service.blogSection?.selectedPosts || []).includes(p._id))}
      />
    </main>
  );
}
