"use client";

import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, Star } from "lucide-react";
import Image from "next/image";
import { useContent } from "../hooks/useContent";
import { Icon } from "../config/icons";
import RichTextRenderer from "./ui/RichTextRenderer";

const clipVariants = {
  hidden: { width: "0%" },
  visible: (custom: { delay: number; duration: number }) => ({
    width: "100%",
    transition: {
      duration: custom?.duration ?? 0.85,
      delay: custom?.delay ?? 0.5,
      ease: [0.16, 1, 0.3, 1] as any
    }
  })
};

export default function Hero() {
  const content = useContent();
  const { hero } = content;

  // Extract variables with proper default fallbacks for CMS dynamicity
  const badgeText = hero?.badge || hero?.badgeText || "Premium Exterior Solutions";
  const titleLine1 = hero?.titleLine1 || "Exterior Remodeling";
  const titleConnector = hero?.titleConnector || "with";
  const titleLine2 = hero?.titleLine2 || "Honor & Precision";
  const description = hero?.description || "Veteran-owned roofing & home improvement in St. Louis, MO.";
  
  // Resolve buttons dynamically from CMS array or fallback to defaults
  const buttonsList = (Array.isArray(hero?.buttons) && hero.buttons.length > 0)
    ? hero.buttons
    : [
        {
          text: hero?.ctaPrimaryText || "Get Estimate",
          href: hero?.ctaPrimaryHref || "/contact-us",
          icon: hero?.ctaPrimaryIcon || "ArrowRight",
          primary: true,
        },
        {
          text: hero?.ctaSecondaryText || "Our Services",
          href: hero?.ctaSecondaryHref || "/services",
          icon: hero?.ctaSecondaryIcon || "ArrowUpRight",
          primary: false,
        },
      ];
  
  const circleText = hero?.circleText || "VETERAN OWNED • VETERAN OPERATED •";
  const circleLetter = hero?.circleLetter || "M";
  const imageSrc = hero?.imageSrc || hero?.images?.[0] || "";
  const imageAlt = hero?.imageAlt || hero?.bgImageAlt || "Mohsin Designs Showcase";
  const marqueeItems = (hero?.marqueeItems || ["Roofing", "Siding", "Windows", "Decks"]) as string[];
  const stats = hero?.stats || [
    { value: "80%", label: "Increase in Conversions", description: "2x website traffic increase" },
    { value: "3.2x", label: "Return on Investment" }
  ];

  const { scrollY } = useScroll();
  const yText = useTransform(scrollY, [0, 1000], [0, 95]);
  const yGraphic = useTransform(scrollY, [0, 1000], [0, 150]);

  const marqueeRef = useRef<HTMLDivElement>(null);
  const isLoopRunning = useRef(false);

  useEffect(() => {
    if (isLoopRunning.current) return;
    isLoopRunning.current = true;

    let lastScrollY = window.scrollY;
    let smoothScrollVelocity = 0;
    let xPercent = 0;
    let animationFrameId: number;
    let lastTime = performance.now();
    let currentDirection = -1; // -1 for left, 1 for right

    const animate = (time: number) => {
      let delta = time - lastTime;
      if (delta > 100 || delta < 0) delta = 16.6; // Guard against tab switching or startup jumps
      lastTime = time;

      // Calculate scroll velocity
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      // Smooth the velocity using lerp
      smoothScrollVelocity += (scrollDiff - smoothScrollVelocity) * 0.08;

      // Base speed (e.g., 0.015% of marquee width per frame-unit)
      const baseSpeed = 0.015;

      // Determine direction based on scroll velocity
      if (smoothScrollVelocity > 0.5) {
        currentDirection = -1; // Scroll down -> marquee moves left
      } else if (smoothScrollVelocity < -0.5) {
        currentDirection = 1; // Scroll up -> marquee moves right
      }

      // Calculate speed: base speed + absolute velocity factor
      const velocityImpact = Math.abs(smoothScrollVelocity) * 0.001;
      const speed = baseSpeed + velocityImpact;

      // Update position (delta normalized to typical 16.6ms frame time)
      xPercent += currentDirection * speed * (delta / 16.6);

      // Wrap xPercent between -25 and 0
      const min = -25;
      const max = 0;
      const range = max - min;
      xPercent = ((((xPercent - min) % range) + range) % range) + min;

      // Apply style directly to DOM for hardware-accelerated rendering
      if (marqueeRef.current) {
        marqueeRef.current.style.transform = `translate3d(${xPercent}%, 0, 0)`;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      isLoopRunning.current = false;
    };
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 25, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as any },
    },
  };

  return (
    <section className="relative overflow-hidden bg-transparent pt-28 md:pt-36 lg:pt-40 pb-0 flex flex-col justify-between min-h-[65vh] lg:min-h-[80vh]">

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 w-full z-20 relative pointer-events-none lg:flex-1 lg:flex lg:flex-col lg:justify-end">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-stretch">

          {/* Left Column: Headline, Description, Buttons, Social Proof */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.15 }}
            style={{ y: yText }}
            className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start will-change-transform"
          >
            {/* Pill Badge */}
            <motion.div variants={itemVariants} className="inline-flex pointer-events-auto">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-[10px] font-black tracking-wider uppercase text-[#080710] select-none shadow-sm">
                <Star className="h-3.5 w-3.5 fill-[#080710] text-[#080710] shrink-0" />
                {badgeText}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.1] tracking-tight text-brand-dark dark:text-white select-none"
            >
              {titleLine1}{titleConnector ? ` ${titleConnector}` : ""}<br />
              <motion.span
                whileHover="hover"
                className="text-brand-blue dark:text-brand-yellow relative inline-block pointer-events-auto cursor-pointer"
              >
                {titleLine2}
                {/* Custom animated hand-drawn SVG underline with gradient and hover interaction */}
                <svg className="absolute -bottom-3.5 left-0 w-full h-5 pointer-events-none drop-shadow-[0_1.5px_2px_rgba(233,189,54,0.45)]" viewBox="0 0 100 14" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="brushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#E9BD36" />
                      <stop offset="100%" stopColor="#FFA800" />
                    </linearGradient>
                    <clipPath id="underlineClip1">
                      <motion.rect
                        x="0"
                        y="0"
                        height="100%"
                        variants={clipVariants}
                        custom={{ delay: 0.5, duration: 0.85 }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false }}
                      />
                    </clipPath>
                    <clipPath id="underlineClip2">
                      <motion.rect
                        x="0"
                        y="0"
                        height="100%"
                        variants={clipVariants}
                        custom={{ delay: 0.75, duration: 0.75 }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: false }}
                      />
                    </clipPath>
                  </defs>
                  {/* First natural tapered brush stroke (spring animates on hover) */}
                  <motion.path
                    d="M 2 7 Q 50 2, 98 5 C 99 5, 99 6, 98 6.5 Q 50 9, 2 8 C 1 8, 1 7, 2 7 Z"
                    fill="url(#brushGradient)"
                    clipPath="url(#underlineClip1)"
                    variants={{
                      hover: { y: 1.5, scaleX: 1.025, transition: { type: "spring", stiffness: 350, damping: 14 } }
                    }}
                  />
                  {/* Second natural tapered brush stroke (spring animates on hover) */}
                  <motion.path
                    d="M 8 10 Q 50 7, 92 8.5 C 93 8.5, 93 9.5, 92 10 Q 50 12, 8 11 C 7 11, 7 10, 8 10 Z"
                    fill="url(#brushGradient)"
                    opacity="0.85"
                    clipPath="url(#underlineClip2)"
                    variants={{
                      hover: { y: 3.2, x: 1.2, scaleX: 1.035, transition: { type: "spring", stiffness: 350, damping: 14 } }
                    }}
                  />
                </svg>
              </motion.span>
            </motion.h1>

            {/* Description */}
            <motion.div
              variants={itemVariants}
              className="text-sm sm:text-base font-sans text-brand-zinc-600 dark:text-zinc-300 font-normal leading-relaxed max-w-lg"
            >
              <RichTextRenderer content={description} stripParagraphs={true} />
            </motion.div>

            {/* CTA Buttons */}
            {buttonsList.length > 0 && (
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-1 w-full sm:w-auto"
              >
                {buttonsList.map((btn: any, idx: number) => {
                  const btnText = btn.text || btn.label || btn.title || (idx === 0 ? "Get Estimate" : "Our Services");
                  const btnHref = btn.href || btn.link || btn.url || (idx === 0 ? "/contact-us" : "/services");
                  const btnIcon = btn.icon || btn.iconName || (idx === 0 ? "ArrowRight" : "ArrowUpRight");
                  const isPrimary = btn.primary !== undefined ? Boolean(btn.primary) : idx === 0;

                  return (
                    <a
                      key={idx}
                      href={btnHref}
                      className={`${isPrimary ? "btn-primary-cta" : "btn-secondary-cta"} pointer-events-auto`}
                    >
                      <span>{btnText}</span>
                      {btnIcon && (
                        <span className="btn-icon">
                          <Icon name={btnIcon} className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </a>
                  );
                })}
              </motion.div>
            )}

          </motion.div>

          {/* Right Column: Creative Graphic Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.15 }}
            style={{ y: yGraphic }}
            transition={{
              duration: 0.6,
              ease: "easeOut"
            }}
            className="lg:col-span-5 relative hidden lg:flex justify-center items-end mt-6 lg:mt-0 z-10 cursor-pointer pointer-events-auto w-full will-change-transform"
          >
            {/* Rotating Circle Badge */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ ease: "linear", duration: 20, repeat: Infinity }}
              className="absolute -top-4 -right-4 h-24 w-24 z-20 hidden sm:block select-none pointer-events-none"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <defs>
                  <path id="circlePath" d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0" />
                </defs>
                <text className="text-[8.5px] font-black uppercase tracking-widest fill-brand-dark dark:fill-white font-sans">
                  <textPath href="#circlePath" startOffset="0%">
                    {circleText}
                  </textPath>
                </text>
              </svg>
              {/* Inner letter 'M' logo in the center of the rotating circle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-7 w-7 rounded-full bg-brand-blue flex items-center justify-center shadow-md">
                  <span className="text-[10px] font-black text-white font-sans uppercase">{circleLetter}</span>
                </div>
              </div>
            </motion.div>

            {/* Graphic Encased in borderless transparent container matching text height */}
            <div className="relative w-full h-[320px] sm:h-[400px] lg:h-[460px] flex items-end justify-center">
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt={imageAlt}
                  fill
                  priority
                  className="object-contain object-bottom"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              ) : null}
            </div>
          </motion.div>

        </div>
      </div>

      {/* HORIZONTAL MARQUEE: Solid Dark Tape in normal document flow at the bottom with Load Animation */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full h-16 md:h-20 bg-[#080710] dark:bg-[#161622] text-white flex items-center overflow-hidden z-30 border-t border-brand-zinc-800 dark:border-white/10 mt-16 lg:mt-2"
      >
        <div className="flex whitespace-nowrap gap-12 md:gap-16 select-none w-full">
          <div
            ref={marqueeRef}
            className="flex whitespace-nowrap gap-12 md:gap-16 items-center will-change-transform"
          >
            {[...Array(4)].map((_, loopIdx) => (
              <div key={loopIdx} className="flex items-center gap-12 md:gap-16">
                {marqueeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-12 md:gap-16">
                    <span className="font-sans font-black text-xs md:text-sm uppercase tracking-[0.25em] text-white select-none">{item}</span>
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-yellow shrink-0" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

    </section>
  );
}
