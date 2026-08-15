"use client";

import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useContent } from "../../hooks/useContent";
import { Icon } from "../../config/icons";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import owner from "@/assets/ownerupdatedimage.jpeg";
import roofingImg from '../../assets/roof1.jpg.jpeg';
import windowsImg from '../../assets/window5.jpeg';
import decksImg from '../../assets/outdoor-sitting-desk.png';
import commercialImg from '../../assets/commercial-tpo.png';
import sidingImg from '../../assets/siding5.jpg.jpeg';
import gutter from '../../assets/gutterinstallation.jpg.jpeg';
import pvcdecks from '../../assets/pvcdecks.jpg.jpeg';

import {
  ShieldCheck,
  ArrowUpRight,
  Clock,
  CheckCircle2 as CheckCircle,
  BadgeCheck,
  TrendingUp,
  Users,
  Award,
  Scale,
  Gem,
  Zap,
  Heart,
  Sparkles,
  ArrowRight,
  Target as LucideTarget,
  Shield as LucideShield,
  Home as LucideHome,
  Building as LucideBuilding,
  Droplet as LucideDroplet,
  Layers as LucideLayers,
  Star as LucideStar,
  Quote,
  Linkedin,
  Mail,
  Flag,
  GlobeIcon
} from 'lucide-react';
import React from 'react';
import RichTextRenderer from "../ui/RichTextRenderer";
import BlogSection from "../sections/BlogSection";
import PageInlineFaqs from "@/components/PageInlineFaqs";

gsap.registerPlugin(ScrollTrigger);

const iconMap: Record<string, any> = {
  Home: LucideHome, Layout: LucideLayers, TreePine: LucideStar, Building2: LucideBuilding, Building: LucideBuilding, Droplets: LucideDroplet,
  Shield: LucideShield, Trophy: Award, Users: Users, ThumbsUp: Heart, FileText: LucideLayers, ClipboardCheck: CheckCircle,
  Truck: LucideLayers, Hammer: LucideStar, CheckCircle: CheckCircle, Award: Award, Clock: Clock,
  Scale, Gem, Zap, Target: LucideTarget, Sparkles, TrendingUp, BadgeCheck, ShieldCheck, Globe: GlobeIcon, Quote, Linkedin, Mail, Flag
};

const imageMap: Record<string, any> = {
  'Residential Roofing': roofingImg,
  'Windows & Doors': windowsImg,
  'Custom Decks': decksImg,
  'Commercial Roofing': commercialImg,
  'Siding, Soffit & Fascia': sidingImg,
  'Gutters & Protection': gutter,
  'PVC Decking': pvcdecks,
};

// ==================== STAT COUNTER COMPONENT ====================
const StatCounter = ({ value, label, suffix = "", delay = 0, iconName, description }: {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
  iconName: string;
  description?: string
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const targetValue = value || 0;
      const increment = targetValue / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= targetValue) {
          setCount(targetValue);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <div
      ref={ref}
      className="group relative bg-card rounded-xl sm:rounded-2xl p-3 sm:p-6 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 text-center sm:text-left"
      style={{ transitionDelay: `${delay}s` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative mb-3 sm:mb-4 md:mb-6 flex justify-center sm:justify-start">
        <div className="inline-flex p-2 sm:p-3 bg-primary/10 rounded-xl sm:rounded-2xl group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
          <Icon name={iconName} className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-primary" strokeWidth={1.5} />
        </div>
      </div>

      <div className="relative">
        <div className="flex items-baseline justify-center sm:justify-start gap-0.5 sm:gap-1 mb-2 sm:mb-3">
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight">
            {count}
          </span>
          <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
            {suffix}
          </span>
        </div>

        <h3 className="text-sm sm:text-base md:text-lg font-semibold text-foreground mb-1 sm:mb-2">
          {label}
        </h3>

        {description && (
          <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 sm:w-12 h-0.5 bg-primary/30 group-hover:w-12 sm:group-hover:w-20 group-hover:bg-primary transition-all duration-500" />
    </div>
  );
};

// ==================== STATS SECTION ====================
const StatsSection = ({ content: passedContent }: { content?: any }) => {
  const { aboutPage } = useContent();
  const statsData = passedContent || aboutPage?.stats || { items: [], trustBadges: [] };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary/10 rounded-full mb-4 sm:mb-6">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[10px] sm:text-xs md:text-sm font-medium text-primary uppercase tracking-wider">
              {statsData.badge || "Impact"}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-2 sm:mb-4 px-2">
            {statsData.headline}
          </h2>
          <RichTextRenderer
            content={statsData.description}
            className="text-xs sm:text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto px-3 sm:px-4"
            stripParagraphs={true}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6 lg:gap-8">
          {(statsData.items || []).map((stat: any, index: number) => (
            <StatCounter
              key={index}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix}
              delay={0.1 + index * 0.1}
              iconName={stat.icon || "Shield"}
              description={stat.description}
            />
          ))}
        </div>

        <div className="mt-8 sm:mt-12 md:mt-16 text-center">
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-8 items-center opacity-60">
            {(statsData.trustBadges || []).map((badge: any, i: number) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <Icon name={badge.icon} className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-primary" />
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== HERO WITH BACKGROUND IMAGE ====================
const Hero = ({ content: passedContent }: { content?: any }) => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const textY = useTransform(scrollY, [0, 500], [0, -50]);
  const { aboutPage } = useContent();
  const hero = passedContent || aboutPage?.hero || { headline: {}, stats: [], phone: "" };

  return (
    <section className="relative min-h-[85vh] sm:min-h-screen w-full bg-background overflow-hidden flex items-center justify-center py-16 sm:py-12">
      <div className="absolute inset-0 z-0">
        <motion.div style={{ y: y1 }} className="absolute inset-0">
          {hero.bgImage && (hero.bgImage.startsWith('http') || hero.bgImage.startsWith('/uploads') || hero.bgImage.startsWith('/cdn-images')) ? (
            <img
              src={hero.bgImage}
              alt={hero.bgImageAlt || "Eagle Revolution Interior"}
              className="object-cover w-full h-full opacity-20 sm:opacity-30 scale-110 grayscale-[0.5]"
            />
          ) : (
            <Image
              src={hero.bgImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070"}
              alt={hero.bgImageAlt || "Eagle Revolution Interior"}
              fill
              quality={100}
              className="object-cover opacity-20 sm:opacity-30 scale-110 grayscale-[0.5]"
            />
          )}
        </motion.div>

        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-10 md:bg-gradient-to-r md:from-background md:via-background/90 md:to-transparent" />

        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] left-[10%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <div className="absolute inset-0 z-10 opacity-[0.03] sm:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: `radial-gradient(hsl(var(--foreground)) 0.5px, transparent 0.5px)`, backgroundSize: '24px 24px' }} />

      <div className="relative z-30 w-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16">

          <motion.div
            style={{ y: textY }}
            className="w-full lg:w-7/12 text-center lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-5xl xs:text-5xl sm:text-5xl md:text-7xl lg:text-[80px] xl:text-[100px] font-black leading-[1.05] sm:leading-[1.1] md:leading-[0.95] lg:leading-[0.85] tracking-tighter text-primary mb-4 sm:mb-6">
              {hero.headline?.line1} <br />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/70 to-foreground/90">
                {hero.headline?.line2}
              </span>
              <br />
              {hero.headline?.line3}
            </h1>

            <RichTextRenderer
              content={hero.description}
              className="text-muted-foreground text-lg sm:text-lg md:text-lg lg:text-xl xl:text-2xl max-w-xl mx-auto lg:mx-0 mb-6 sm:mb-8 font-medium leading-relaxed px-2 sm:px-0"
              stripParagraphs={true}
            />

            <div className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start items-center">
              <Link href={hero.ctaLink || "/contact-us"} className="w-full sm:w-auto">
                <motion.div
                  whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  whileTap={{ scale: 0.98 }}
                  className="px-12 sm:px-14 md:px-16 py-3 sm:py-4 md:py-5 bg-primary text-primary-foreground font-bold text-lg rounded-xl flex items-center justify-center gap-2 sm:gap-3 group transition-all hover:text-white"
                >
                  {hero.cta || "Get a Quote"}
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="w-full max-w-sm lg:w-5/12 mx-auto"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full opacity-50" />
              <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 p-6 sm:p-8 rounded-3xl shadow-2xl">
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <LucideStar key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{hero.trustLabel}</p>
                </div>

                <div className="space-y-4">
                  {(hero.stats || []).map((stat: any, i: number) => {
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-background/40 border border-border/40">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon name={stat.icon || "Shield"} className="text-primary w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-[10px] uppercase tracking-wider font-bold">{stat.label}</p>
                          <p className="text-xl font-black text-foreground">{stat.val}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 pt-4 border-t border-border/60">
                  <div className="text-center">
                    <a
                      href={`tel:${(hero.phone || "").replace(/-/g, '')}`}
                      className="text-lg font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {hero.phone}
                    </a>
                    <p className="text-xs text-muted-foreground mt-1">{hero.phoneLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// ==================== FOUNDER PORTRAIT ====================
const FounderPortrait = ({ content }: { content?: any }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const story = content || { portrait: {}, founder: {} };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/20 to-primary/20 rounded-2xl sm:rounded-3xl blur-lg group-hover:blur-xl transition-all duration-700" />

        <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl shadow-gray-300/50 h-[350px] xs:h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px]">
          {story.portrait?.image && (story.portrait.image.startsWith('http') || story.portrait.image.startsWith('/uploads') || story.portrait.image.startsWith('/cdn-images')) ? (
            <img
              src={story.portrait.image}
              alt={story.portrait?.alt || story.founder?.name || "Founder"}
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src={story.portrait?.image || owner}
              alt={story.portrait?.alt || story.founder?.name || "Founder"}
              className="object-cover"
              fill
              quality={100}
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 80vw, 50vw"
              priority
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-secondary/80 via-secondary/20 to-transparent" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            <motion.rect
              x="2"
              y="2"
              width="calc(100% - 4px)"
              height="calc(100% - 4px)"
              fill="none"
              stroke="url(#founderGradient)"
              strokeWidth="1.2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={isHovered ? { pathLength: 1, opacity: 0.8 } : { pathLength: 0, opacity: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="founderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--primary)/0.8)" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {story.portrait?.badgeLeft && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="absolute top-3 sm:top-4 md:top-6 left-3 sm:left-4 md:left-6 z-10"
          >
            <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-5 py-1 sm:py-2 md:py-2.5 rounded-full shadow-xl border border-border">
              <span className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold text-primary">
                <Icon name="Flag" className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                {story.portrait.badgeLeft}
              </span>
            </div>
          </motion.div>
        )}

        {story.portrait?.badgeRight && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="absolute bottom-3 sm:bottom-4 md:bottom-6 right-3 sm:right-4 md:right-6 z-10"
          >
            <div className="bg-card/95 backdrop-blur-sm px-2 sm:px-3 md:px-5 py-1 sm:py-2 md:py-2.5 rounded-full shadow-xl border border-border">
              <span className="flex items-center gap-1 sm:gap-2 text-[8px] sm:text-[10px] md:text-xs font-bold text-primary">
                <Icon name="Award" className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                {story.portrait.badgeRight}
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ==================== FOUNDER STORY ====================
const FounderStory = ({ content: passedContent }: { content?: any }) => {
  const sectionRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const { aboutPage } = useContent();
  const story = passedContent || aboutPage?.story || { headline: "", highlight: "", description: "", founder: { bio: [], social: {} } };

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!sectionRef.current || !isClient) return;

    const ctx = gsap.context(() => {
      gsap.fromTo('.founder-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [isClient]);

  if (!isClient) return null;

  return (
    <section
      ref={sectionRef}
      id="story"
      className="relative bg-background py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 overflow-hidden"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary)) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px sm:80px 80px',
          }}
        />
      </div>

      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] sm:w-[800px] h-[300px] sm:h-[400px] bg-gradient-to-b from-primary/5 to-transparent opacity-60 blur-3xl" />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 relative z-30">
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16 md:mb-20 founder-reveal">
          {story.badge && (
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-primary/30 to-primary" />
              <span className="text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase text-primary">
                {story.badge}
              </span>
              <div className="w-6 sm:w-8 h-[2px] bg-gradient-to-r from-primary to-primary/30" />
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-light text-foreground mb-4 sm:mb-6 leading-tight px-2">
            {story.headline?.replace(story.highlight || '', '')} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">{story.highlight}</span>
          </h2>

          <RichTextRenderer
            content={story.description}
            className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl font-light max-w-2xl mx-auto px-3 sm:px-4 text-center"
            stripParagraphs={true}
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-start">
          <div className="founder-reveal lg:sticky lg:top-24">
            <FounderPortrait content={story} />
          </div>

          <div className="space-y-6 sm:space-y-8 md:space-y-10 founder-reveal">
            <div>
              <h3 className="text-2xl sm:text-3xl md:text-4xl font-light text-foreground mb-3 sm:mb-4 text-left">
                {story.founder?.name}
                <span className="block text-xs sm:text-sm font-mono text-primary mt-1 sm:mt-2 tracking-[0.15em] sm:tracking-[0.2em] uppercase">
                  {story.founder?.title}
                </span>
              </h3>

              <div className="mt-6 sm:mt-8 relative">
                <div className="absolute -left-2 sm:-left-4 -top-2 text-primary/20">
                  <Icon name="Quote" className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" />
                </div>
                <RichTextRenderer
                  content={story.founder?.quote}
                  className="text-foreground text-base sm:text-lg md:text-xl font-medium leading-relaxed pl-4 sm:pl-6 md:pl-8"
                />
              </div>

              <RichTextRenderer
                content={story.founder?.bio}
                className="mt-6 sm:mt-8 space-y-4"
              />

              <blockquote className="border-l-4 border-primary pl-3 sm:pl-4 md:pl-6 py-2 my-6 sm:my-8">
                <RichTextRenderer
                  content={story.founder?.secondaryQuote}
                  className="text-sm sm:text-base md:text-lg font-medium text-foreground italic"
                />
                <footer className="mt-2 sm:mt-3 font-bold text-[10px] sm:text-xs text-primary uppercase tracking-widest">
                  {story.founder?.footer}
                </footer>
              </blockquote>

              <div className="flex flex-wrap items-center justify-start gap-3 sm:gap-4 mt-8 sm:mt-10 pt-4 border-t border-border">
                <motion.a
                  href={story.founder?.social?.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Icon name="Linkedin" className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
                <motion.a
                  href={`mailto:${story.founder?.email}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 sm:p-3 rounded-full bg-primary/5 text-primary hover:bg-primary/10 transition-colors"
                  aria-label="Email"
                >
                  <Icon name="Mail" className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.a>
                <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground break-all">
                  {story.founder?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ==================== MISSION SECTION ====================
const MissionSection = ({ content: passedContent }: { content?: any }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px", amount: 0.1 });
  const { aboutPage } = useContent();
  const mission = passedContent || aboutPage?.mission || { principles: [], stats: [] };

  return (
    <section ref={ref} className="relative py-8 sm:py-10 lg:py-12 overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <pattern id="light-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border/10" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#light-grid)" />
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 lg:gap-24 items-start">
          <motion.div initial={{ opacity: 0, x: -60 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 1 }} className="w-full lg:w-5/12 text-center lg:text-left">
            <div className="mb-6 sm:mb-8">
              {mission.badge && (
                <span className="inline-block text-primary text-xs font-black uppercase tracking-[0.5em] mb-4">
                  {mission.badge}
                </span>
              )}
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">{mission.headline}</h2>
              <motion.div initial={{ width: 0 }} animate={inView ? { width: 60 } : {}} className="h-[2px] bg-primary mt-3 sm:mt-4 mx-auto lg:mx-0" />
            </div>
            <RichTextRenderer
              content={mission.description}
              className="text-sm sm:text-base md:text-lg text-muted-foreground mb-6 sm:mb-8 px-2 sm:px-0"
              stripParagraphs={true}
            />
            <div className="flex gap-4 sm:gap-6 justify-center lg:justify-start">
              {(mission.stats || []).map((stat: any, i: number) => (
                <div key={i} className="text-center">
                  <div className="text-xl sm:text-2xl font-bold">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="w-full lg:w-7/12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5">
            {(mission.principles || []).map((item: any, i: number) => {
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.15 }} whileHover={{ y: -5 }} className="p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border shadow-md hover:shadow-xl transition bg-card">
                  <div className="flex justify-between mb-3 sm:mb-4">
                    <Icon name={item.icon || "Scale"} className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    <span className="text-[10px] sm:text-xs text-muted-foreground">{item.val}</span>
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold mb-1 sm:mb-2">{item.title}</h3>
                  <RichTextRenderer
                    content={item.desc}
                    className="text-xs sm:text-sm text-muted-foreground"
                  />
                </motion.div>
              );
            })}
          </div>
        </div>
        <motion.div initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}} className="mt-12 sm:mt-16 h-px bg-primary origin-left" />
      </div>
    </section>
  );
};

// ==================== PREMIUM MARQUEE ====================
const RecognitionMarquee = ({ content: passedContent }: { content?: any }) => {
  const { aboutPage } = useContent();
  const certs = passedContent || aboutPage?.recognition || [];
  if (!certs || certs.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 md:py-12 mt-2 overflow-hidden relative bg-background">
      <div className="flex flex-col gap-2">
        <div className="flex whitespace-nowrap leading-none">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ duration: 35, repeat: Infinity, ease: "linear" }} className="flex items-center gap-2 sm:gap-4 md:gap-8">
            {[...certs, ...certs].map((text, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4 md:gap-8 group cursor-default">
                <span className="text-5xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-7xl xl:text-[8rem] font-black uppercase tracking-tighter transition-all duration-500 text-transparent group-hover:text-primary group-hover:[-webkit-text-stroke:1px_hsl(var(--primary))]" style={{ WebkitTextStroke: '1px hsl(var(--border))', WebkitTextStrokeColor: 'hsl(var(--border))' }}>
                  {text}
                </span>
                <div className="w-4 sm:w-6 md:w-8 lg:w-12 xl:w-16 h-[2px] bg-border group-hover:bg-primary group-hover:scale-x-125 transition-all duration-500" />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-y-0 left-0 w-12 sm:w-64 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-12 sm:w-64 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </section>
  );
};

// ==================== SERVICE CARD ====================
const ServiceCard = ({ service, index }: { service: any; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);
  if (!service) return null;

  // Get the image - prioritize overviewImage, then fall back to imported images
  let serviceImage: string | any = roofingImg; // default fallback

  // Try to get overviewImage first (could be string URL)
  if (service.overviewImage) {
    if (typeof service.overviewImage === 'string' && service.overviewImage.trim()) {
      serviceImage = service.overviewImage;
    } else if (typeof service.overviewImage === 'object' && service.overviewImage.src) {
      // Handle case where overviewImage is an object with src property
      serviceImage = service.overviewImage.src || service.overviewImage;
    } else if (typeof service.overviewImage === 'object') {
      // Use the object directly (it might be an imported image)
      serviceImage = service.overviewImage;
    }
  }
  // Fall back to regular image field
  else if (service.image) {
    if (typeof service.image === 'string' && service.image.trim()) {
      serviceImage = service.image;
    } else if (typeof service.image === 'object') {
      serviceImage = service.image;
    }
  }
  // Fall back to imageMap using the service title
  else if (imageMap[service.title]) {
    serviceImage = imageMap[service.title];
  }

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }} className="group" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
      <Link href={`/services/${service.slug}`} className="block h-full">
        <div className="flex flex-col h-full">
          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 shadow-lg transition-all duration-700 group-hover:shadow-2xl">
            <img
              src={service.overviewImage}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />





            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-6 left-6 z-10">
              <div className="px-5 py-2.5 bg-white/95 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{service.tag}</span>
              </div>
            </div>
            <motion.div className="absolute bottom-6 right-6 z-10" initial={{ opacity: 0, scale: 0.8 }} animate={isHovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }} transition={{ duration: 0.3 }}>
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </motion.div>
          </div>
          <div className="flex-1 mt-6 px-4 flex flex-col items-center text-center">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black text-foreground tracking-tighter leading-tight group-hover:text-primary transition-colors duration-300">{service.title}</h3>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ==================== SERVICES SECTION ====================
const ServicesSection = ({ content: passedContent, featuredServices: passedFeatured }: { content?: any, featuredServices?: any[] }) => {
  const { aboutPage, services } = useContent();
  const capabilities = passedContent || aboutPage?.capabilities || {};

  // Robust normalization: Ensure featuredServicesRaw is an array
  const rawData = passedFeatured || aboutPage?.services || [];
  const featuredServicesRaw = Array.isArray(rawData) ? rawData : (rawData?.services || []);

  // Resolve IDs to objects if necessary
  const resolvedFeatured = (Array.isArray(featuredServicesRaw) ? featuredServicesRaw : []).map((s: any) => {
    if (typeof s === 'string') {
      const fullServiceList = Array.isArray(services) ? services : (services as any)?.services || [];
      const fullService = fullServiceList.find((ps: any) => ps._id === s || ps.id === s || ps.slug === s);
      return fullService || null;
    }
    return s;
  }).filter(Boolean);

  const servicesList = resolvedFeatured.length > 0
    ? resolvedFeatured
    : (Array.isArray(services) ? services : (services as any)?.services || [])
      .filter((s: any) => s.status === 'published' || s.status === undefined)
      .slice(0, 6);

  return (
    <section className="py-16 md:py-24 px-6 lg:px-12 bg-transparent relative z-30">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <span className="inline-block text-primary text-xs font-black uppercase tracking-[0.5em] mb-4">{capabilities.badge || "Services"}</span>
          <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 tracking-tighter text-foreground">
            {capabilities.headline ? (
              <>
                {capabilities.headline.replace(capabilities.highlight || '', '')}{' '}
                {capabilities.highlight && (
                  <span className="text-primary">{capabilities.highlight}</span>
                )}
              </>
            ) : (
              "Our Capabilities"
            )}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6" />
          <RichTextRenderer
            content={capabilities.description}
            className="max-w-3xl mx-auto text-muted-foreground text-lg md:text-xl leading-relaxed"
            stripParagraphs={true}
          />
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 relative z-30">
          {servicesList.map((service: any, index: number) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
        <div className="text-center mt-12 sm:mt-16">
          <Link href="/services">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full overflow-hidden shadow-lg">
              <span className="relative z-10 flex items-center gap-2">View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span>
            </motion.button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// ==================== CTA BANNER ====================
const AwardCTABanner = ({ content: passedContent }: { content?: any }) => {
  const { aboutPage } = useContent();
  const ctaBanner = passedContent || aboutPage?.ctaBanner || { features: [] };

  return (
    <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.3 }} className="relative mt-20 mb-20 overflow-hidden bg-card border border-border rounded-3xl p-12">
      <div className="relative flex flex-col lg:flex-row items-center justify-between gap-10 z-30 text-center lg:text-left">
        <div className="max-w-2xl">
          {ctaBanner.badge && (
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-4">
              <span className="w-8 h-[2px] bg-primary" />
              <span className="text-xs font-bold tracking-[0.3em] uppercase text-primary">{ctaBanner.badge}</span>
            </div>
          )}
          <h3 className="text-3xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
            {ctaBanner.headline?.replace(ctaBanner.highlight || '', '')} <span className="text-primary">{ctaBanner.highlight}</span>
          </h3>
          <RichTextRenderer
            content={ctaBanner.description}
            className="text-muted-foreground text-lg leading-relaxed max-w-lg mx-auto lg:mx-0"
            stripParagraphs={true}
          />
          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 mt-6">
            {(ctaBanner.features || []).map((feature: string, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                <span className="text-xs text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href={"https://www.greensky.com/prequal/gs/prequalify-for-loan?merchant=81115616&channel=External-Button-Prequal"}><button className="px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full shadow-lg hover:scale-105 transition-transform">{ctaBanner.primaryCta || "Contact Us"}</button></Link>
          <Link href={"/contact-us"}><button className="px-8 py-4 bg-background text-primary border-2 border-primary font-bold rounded-full hover:bg-primary hover:text-white transition-all">{ctaBanner.secondaryCta || "Free Estimate"}</button></Link>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== CORE VALUES GRID ====================
const ValuesGrid = ({ content: passedContent }: { content?: any }) => {
  const { aboutPage } = useContent();
  const valuesData = passedContent || aboutPage?.values || { items: [] };

  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-muted/30 to-background overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4">
        <div className="text-center mb-20">
          {valuesData.badge && (
            <span className="inline-block text-primary text-xs font-black uppercase tracking-[0.5em] mb-4">
              {valuesData.badge}
            </span>
          )}
          <h2 className="text-4xl lg:text-7xl font-bold tracking-tight mb-6">
            {valuesData.headline?.replace(valuesData.highlight || '', '')} <br />
            <span className="bg-gradient-to-r from-primary to-primary/95 bg-clip-text text-transparent">{valuesData.highlight}</span>
          </h2>
          <RichTextRenderer
            content={valuesData.description}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(valuesData.items || []).map((value: any, idx: number) => {
            return (
              <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-card p-8 rounded-3xl border border-border hover:border-primary/50 transition-all shadow-lg hover:shadow-2xl group">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <Icon name={value.icon || "BadgeCheck"} className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <RichTextRenderer
                  content={value.description}
                  className="text-muted-foreground mb-6"
                />
                <div className="pt-6 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest">{value.statLabel}</span>
                  <span className="text-2xl font-bold text-primary">{value.stat}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ==================== MAIN PAGE COMPONENT ====================
export default function AboutTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const content = pageData?.content || {};
  const { allBlogs, blogSection } = useContent();

  return (
    <main className="bg-background">
      <Hero content={content.hero} />
      <RecognitionMarquee content={content.recognition} />
      <FounderStory content={content.story} />
      <StatsSection content={content.stats} />
      <MissionSection content={content.mission} />
      <ServicesSection content={content.capabilities} featuredServices={content.services} />
      <ValuesGrid content={content.values} />
      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <AwardCTABanner content={content.ctaBanner} />
      </div>

      <PageInlineFaqs
        faqs={content.faqs}
        faqSchemaMarkup={content.faqSchemaMarkup}
        badge={content.faqBadge}
        title={content.faqTitle}
        subtitle={content.faqDescription}
      />

      <BlogSection
        title={content.blogSection?.title || blogSection?.title}
        subtitle={content.blogSection?.subtitle || blogSection?.subtitle}
        description={content.blogSection?.description || blogSection?.description}
        posts={allBlogs.filter((p: any) => (content.blogSection?.selectedPosts || []).includes(p._id))}
      />

    </main>
  );
}
