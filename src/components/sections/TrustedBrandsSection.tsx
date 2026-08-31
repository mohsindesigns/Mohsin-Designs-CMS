"use client";

import React from "react";
import { motion } from "framer-motion";
import { Globe, ArrowUpRight } from "lucide-react";

// Standard vector logos for premier fallbacks
const GoogleLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

const ShopifyLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[#95BF47]">
    <path d="M21.05 6.36c-.1-.28-.35-.48-.65-.51l-4.77-.52-3.17-5.02c-.18-.28-.51-.43-.84-.37-.33.06-.59.3-.66.63l-.75 3.51-2.97.9c-.27.08-.47.3-.53.58l-2.75 13.5c-.06.31.06.63.31.81.25.18.58.19.84.03l8.61-5.18 6.06 4.54c.16.12.35.18.54.18.11 0 .22-.02.32-.07.27-.12.44-.39.44-.69l.33-12.31z" />
  </svg>
);

const StripeLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[#635BFF]">
    <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697.5 12.522.5 6.084.5 2.58 3.927 2.58 8.874c0 6.09 5.86 6.34 8.795 7.429 2.457.914 3.29 1.603 3.29 2.58 0 .977-.852 1.488-2.226 1.488-2.658 0-5.46-1.185-7.307-2.313l-.907 5.568C6.08 24.62 8.995 25.5 12.398 25.5c6.643 0 10.375-3.23 10.375-8.487 0-5.772-5.483-6.425-8.797-7.863z" />
  </svg>
);

const VercelLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0 fill-brand-dark dark:fill-white">
    <path d="M24 22.525H0l12-21.05 12 21.05z" />
  </svg>
);

const MetaLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[#0668E1]">
    <path d="M16.48 7.38c-1.34 0-2.58.55-3.5 1.55-.92-1-2.16-1.55-3.5-1.55-2.73 0-4.96 2.23-4.96 4.96s2.23 4.96 4.96 4.96c1.34 0 2.58-.55 3.5-1.55.92 1 2.16 1.55 3.5 1.55 2.73 0 4.96-2.23 4.96-4.96s-2.23-4.96-4.96-4.96zm-7 8.08c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12zm7 0c-1.72 0-3.12-1.4-3.12-3.12s1.4-3.12 3.12-3.12 3.12 1.4 3.12 3.12-1.4 3.12-3.12 3.12z" />
  </svg>
);

const AWSLogo = () => (
  <svg viewBox="0 0 48 48" className="h-5 w-auto fill-brand-dark dark:fill-white shrink-0">
    <path d="M26.4 12c-6.1 0-10.4 3.6-10.4 9.8 0 5.4 3.2 8.4 8.1 8.4 4 0 6.6-1.9 8.1-3.9v3.1h5.8V12.4h-5.8v3.1c-1.6-2.1-4.2-3.5-8.1-3.5zm.9 12.3c-3 0-4.6-1.6-4.6-4.2s1.6-4.2 4.6-4.2 4.6 1.6 4.6 4.2-1.6 4.2-4.6 4.2z" />
    <path d="M12 38c10.4 6 22.4 4 28-2" stroke="#FF9900" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M38 34l3.5 3.5-1.5 4" fill="#FF9900" />
  </svg>
);

const HubspotLogo = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-[#FF7A59]">
    <path d="M17.8 7.6V4.9c.7-.4 1.2-1.1 1.2-2 0-1.2-1-2.2-2.2-2.2s-2.2 1-2.2 2.2c0 .9.5 1.6 1.2 2v2.7c-1.1.4-2.1 1-2.9 1.8L8.3 6.9c.1-.3.2-.6.2-1 0-1.6-1.3-3-3-3s-3 1.3-3 3 1.3 3 3 3c.5 0 1-.1 1.4-.4l6.5 2.5c-.2.7-.4 1.4-.4 2.2 0 .8.1 1.5.4 2.2L6.9 17c-.4-.3-.9-.4-1.4-.4-1.6 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3c0-.4-.1-.7-.2-1l6.6-2.5c.8.8 1.8 1.4 2.9 1.8v2.7c-.7.4-1.2 1.1-1.2 2 0 1.2 1 2.2 2.2 2.2s2.2-1 2.2-2.2c0-.9-.5-1.6-1.2-2v-2.7c2.5-1 4.2-3.4 4.2-6.3 0-2.8-1.7-5.3-4.2-6.3zm-1 9c-2.6 0-4.6-2.1-4.6-4.6s2.1-4.6 4.6-4.6 4.6 2.1 4.6 4.6-2.1 4.6-4.6 4.6z" />
  </svg>
);

const WebflowLogo = () => (
  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5 shrink-0 fill-[#4353FF]">
    <path d="M19.49 8.16l-3.32 9.42-3.33-9.42h-3.4l-3.32 9.42L2.79 8.16H0l4.7 13.34h3.4l3.32-9.42 3.32 9.42h3.4L24 8.16z" />
  </svg>
);

export default function TrustedBrandsSection({ data }: { data?: any }) {
  const badge = data?.badge || data?.eyebrow || "02 // CLIENT PROOF";
  const titleIntro = data?.titleIntro !== undefined ? data.titleIntro : "Trusted by";
  const titleHighlight = data?.titleHighlight !== undefined ? data.titleHighlight : "Leading Brands";
  const description = data?.description !== undefined
    ? data.description
    : "Powering innovative market disruptors, scaling enterprises, and high-performance industry leaders worldwide.";

  const rawLogos = Array.isArray(data?.logos) && data.logos.length > 0
    ? data.logos
    : Array.isArray(data?.items) && data.items.length > 0
      ? data.items
      : [
          { name: "Google Cloud", sub: "Enterprise Partner", image: "" },
          { name: "Shopify Plus", sub: "Commerce Tier", image: "" },
          { name: "Stripe", sub: "Verified Partner", image: "" },
          { name: "Vercel", sub: "Deployment Fleet", image: "" },
          { name: "AWS", sub: "Cloud Infrastructure", image: "" },
          { name: "Meta", sub: "Performance Ad Hub", image: "" },
          { name: "HubSpot", sub: "Inbound Solutions", image: "" },
          { name: "Webflow", sub: "Visual Engine", image: "" }
        ];

  const speed = Number(data?.speed) || 28;

  const renderLogoIcon = (item: any) => {
    if (item.image) {
      return (
        <img
          src={item.image}
          alt={item.name || "Brand Logo"}
          className="h-6 w-auto max-w-[110px] object-contain shrink-0 filter drop-shadow-sm transition-all duration-300"
        />
      );
    }

    const name = String(item.name || "").toLowerCase();
    if (name.includes("google")) return <GoogleLogo />;
    if (name.includes("shopify")) return <ShopifyLogo />;
    if (name.includes("stripe")) return <StripeLogo />;
    if (name.includes("vercel")) return <VercelLogo />;
    if (name.includes("meta") || name.includes("facebook")) return <MetaLogo />;
    if (name.includes("aws") || name.includes("amazon")) return <AWSLogo />;
    if (name.includes("hubspot")) return <HubspotLogo />;
    if (name.includes("webflow")) return <WebflowLogo />;

    return <Globe className="h-5 w-5 text-brand-blue dark:text-brand-yellow shrink-0" />;
  };

  return (
    <section className="relative overflow-hidden py-16 sm:py-20 border-b border-brand-zinc-200 dark:border-white/10 bg-zinc-50/40 dark:bg-[#0c0b18]/40">
      
      {/* Background Ambience Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-brand-blue/[0.03] dark:bg-brand-yellow/[0.02] blur-[120px] pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 text-center mb-10 sm:mb-12">
        
        {/* Eyebrow Badge */}
        {badge && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-blue/15 dark:border-brand-yellow/20 bg-brand-blue/5 dark:bg-brand-yellow/5 px-3.5 py-1 text-[10px] font-mono font-black tracking-widest text-brand-blue dark:text-brand-yellow uppercase mb-4 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-blue dark:bg-brand-yellow opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-blue dark:bg-brand-yellow" />
            </span>
            {badge}
          </motion.div>
        )}

        {/* Section Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-black text-brand-dark dark:text-white tracking-tight leading-tight"
        >
          {titleIntro}{" "}
          <span className="relative inline-block text-brand-blue dark:text-brand-yellow font-normal font-cursive text-3xl sm:text-4xl lg:text-[46px] ml-1">
            {titleHighlight}
          </span>
        </motion.h2>

        {/* Description */}
        {description && (
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-3 text-xs sm:text-sm text-brand-zinc-555 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal"
          >
            {description}
          </motion.p>
        )}
      </div>

      {/* Infinite Scrolling Logo Marquee with Gradient Mask */}
      <div className="relative w-full overflow-hidden select-none marquee-hover-pause">
        {/* Left and Right Fade Masks */}
        <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-zinc-50 dark:from-[#080710] to-transparent z-20 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-zinc-50 dark:from-[#080710] to-transparent z-20 pointer-events-none" />

        <div className="brand-marquee-track flex gap-5 sm:gap-6 py-2">
          {[...Array(3)].map((_, repIdx) => (
            <div key={repIdx} className="flex gap-5 sm:gap-6 shrink-0 items-center">
              {rawLogos.map((brand: any, bIdx: number) => {
                const CardWrapper = brand.link ? "a" : "div";
                const wrapperProps = brand.link
                  ? { href: brand.link, target: "_blank", rel: "noopener noreferrer" }
                  : {};

                return (
                  <CardWrapper
                    key={bIdx}
                    {...(wrapperProps as any)}
                    className="group relative flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-white/70 dark:bg-[#121124]/60 border border-zinc-200/80 dark:border-white/10 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_30px_-6px_rgba(3,6,172,0.12)] dark:hover:shadow-[0_12px_30px_-6px_rgba(233,189,54,0.08)] hover:border-brand-blue/40 dark:hover:border-brand-yellow/40 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-md cursor-pointer no-underline"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100/80 dark:bg-white/[0.05] border border-zinc-200/60 dark:border-white/5 group-hover:scale-105 group-hover:bg-brand-blue/10 dark:group-hover:bg-brand-yellow/10 transition-transform duration-300 shrink-0">
                      {renderLogoIcon(brand)}
                    </div>

                    <div className="text-left pr-1">
                      <div className="font-heading text-xs sm:text-sm font-black text-brand-dark dark:text-white tracking-tight group-hover:text-brand-blue dark:group-hover:text-brand-yellow transition-colors duration-200 flex items-center gap-1">
                        <span>{brand.name}</span>
                        {brand.link && (
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-blue dark:text-brand-yellow" />
                        )}
                      </div>
                      {brand.sub && (
                        <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                          {brand.sub}
                        </span>
                      )}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marqueeBrandLogos {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .brand-marquee-track {
          display: flex;
          width: max-content;
          animation: marqueeBrandLogos ${speed}s linear infinite;
          will-change: transform;
        }
        .marquee-hover-pause:hover .brand-marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
