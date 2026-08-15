import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Image from "next/image";
import Link from "next/link";
import RichTextRenderer from "./ui/RichTextRenderer";
import bbblogo from '../assets/bbblogo.png'
import goodcontracterlist from '../assets/goodcontracterlist.png'

import bgfair from "../assets/bgfair.jpg";

gsap.registerPlugin(ScrollTrigger);

const Hero = () => {
  const { hero } = useContent();
  const sectionRef = useRef<HTMLElement>(null);

  // Use MotionValues to avoid React re-renders on every mouse move
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth out the movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Map values to slightly smaller ranges for subtle parallax
  const parallaxX = useTransform(smoothX, (val) => val * 0.8);
  const parallaxY = useTransform(smoothY, (val) => val * 0.8);

  const { 
    badge = "Premium Exterior Solutions", 
    headlines = [], 
    description = "", 
    buttons = [], 
    stats = [], 
    images = [] 
  } = hero || {};

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      mouseX.set((clientX - innerWidth / 2) * 0.005);
      mouseY.set((clientY - innerHeight / 2) * 0.005);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={sectionRef}
      className="relative pt-12 min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 isolate"
    >
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 95%)",
            maskImage: "linear-gradient(to bottom, black 60%, transparent 95%)",
          }}
        >
          {images?.[0]?.startsWith('http') || images?.[0]?.startsWith('/uploads') || images?.[0]?.startsWith('/cdn-images') ? (
            <img
              src={images[0]}
              alt={hero.bgImageAlt || "Eagle Revolution Roofing"}
              className="w-full h-full object-cover scale-105"
            />
          ) : (
            <Image
              src={images?.[0] || bgfair}
              alt={hero.bgImageAlt || "Eagle Revolution Roofing"}
              className="w-full h-full object-cover scale-105"
              fill
              quality={100}
              priority
            />
          )}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-transparent" />

        <motion.div
          className="absolute top-[10%] right-[10%] w-[50rem] h-[50rem] bg-primary/10 rounded-full blur-[90px]"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.15, 0.1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          style={{
            x: parallaxX,
            y: parallaxY,
            willChange: "transform, opacity"
          }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 min-h-screen flex items-center py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <motion.div
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 mx-auto lg:mx-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-white text-xs uppercase tracking-wider font-medium">{badge}</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-[1.2] tracking-tight">
                {headlines.map((line: { text: string; highlight: boolean }, i: number) => (
                  <motion.span
                    key={i}
                    className={`block${line.highlight ? " text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80" : ""}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.7,
                      delay: 0.2 + 0.15 * i,
                    }}
                  >
                    {line.text}
                  </motion.span>
                ))}
              </h1>

              <motion.div
                className="max-w-2xl mx-auto lg:mx-0 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <RichTextRenderer 
                  content={description} 
                  stripParagraphs={true}
                  className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed" 
                />
              </motion.div>

              <motion.div
                className="mb-10 w-full"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
              >
                <div className="flex flex-row flex-wrap sm:flex-nowrap items-center justify-center lg:justify-start gap-3 sm:gap-4 w-full">
                  {buttons.map((button: any, idx: number) => {
                    return button.primary ? (
                      <Link key={idx} href={button.href}>
                        <motion.div
                          className="group relative overflow-hidden min-w-[150px] sm:min-w-[170px] flex-1 sm:flex-initial px-5 sm:px-7 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold tracking-wide bg-primary text-primary-foreground border border-primary/30 shadow-[0_10px_30px_rgba(0,0,0,0.15)] transition-all duration-300 hover:bg-white hover:text-primary hover:border-white/70 hover:shadow-[0_16px_40px_rgba(255,255,255,0.18)] active:scale-[0.98] backdrop-blur-xl cursor-pointer"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">{button.text}</span>
                          {button.icon && <Icon name={button.icon} className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
                          <span className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                      </Link>
                    ) : (
                      <Link key={idx} href={button.href}>
                        <motion.div
                          className="group relative overflow-hidden min-w-[150px] sm:min-w-[170px] flex-1 sm:flex-initial px-5 sm:px-7 py-3.5 rounded-2xl inline-flex items-center justify-center gap-2 text-sm sm:text-base font-semibold tracking-wide backdrop-blur-xl bg-white/10 text-white border border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:bg-white hover:text-slate-900 hover:border-white hover:shadow-[0_16px_40px_rgba(255,255,255,0.16)] active:scale-[0.98] cursor-pointer"
                          whileHover={{ scale: 1.03, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <span className="relative z-10">{button.text}</span>
                          {button.icon && <Icon name={button.icon} className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />}
                          <span className="absolute inset-0 bg-gradient-to-r from-white/15 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                className="grid grid-cols-2 md:flex md:flex-wrap lg:justify-start gap-y-8 gap-x-4 pt-8 border-t border-white/10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.1 }}
              >
                {stats.map((stat: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-3 text-center sm:text-left">
                    <div className="p-2 rounded-lg bg-white/5 md:bg-transparent">
                      <Icon name={stat.icon} className="w-5 h-5 md:w-6 md:h-6 text-primary/80" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xl md:text-2xl font-bold text-white leading-tight">{stat.value}</span>
                      <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/40 font-medium">{stat.label}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

       
            {/* Right Column - Ultra Minimal Financing */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center lg:justify-end      lg:-mt-24 "
            >
              <a
                href="https://www.greensky.com/prequal/gs/prequalify-for-loan?merchant=81115616&channel=External-Button-Prequal"
                target="_blank"
                rel="noopener noreferrer"
                className="relative group"
              >
                <motion.div
                  className="relative bg-slate-800/80 backdrop-blur-md border border-white/20 rounded-2xl px-8 py-12 shadow-2xl transition-all duration-300 group-hover:border-primary/50 group-hover:bg-slate-800/90"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Subtle glow on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Simple Icon + Text */}
                                  <div className="flex flex-col items-center gap-4 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 group-hover:scale-110 transition-all duration-300">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>

                    <div className="text-center">
                      <h4 className="text-white font-bold text-xl mb-1">Financing Available</h4>
                      <p className="text-white/70 text-sm">Quick prequalification • Soft credit check</p>
                    </div>

                    <span className="text-white font-semibold flex items-center gap-2 group-hover:gap-3 transition-all mt-2">
                      Check Your Options
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>

                    {/* Trust Badges */}
                    <div className="w-full border-t border-white/10 pt-5 mt-3 flex flex-col gap-4">
                      <div className="flex items-center gap-4 text-left">
                        <div className="flex-shrink-0 w-16 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center border border-white/20 relative">
                          <Image src={bbblogo} alt="BBB Accredited A+" className="object-contain" fill />
                        </div>
                        <div>
                          <div className="text-xs text-white/50 leading-normal">A+ Rated for integrity & trust</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-left">
                        <div className="flex-shrink-0 w-16 h-10 bg-white rounded-xl p-1.5 flex items-center justify-center border border-white/20 relative">
                          <Image src={goodcontracterlist} alt="Good Contractors List" className="object-contain" fill />
                        </div>
                        <div>
                          <div className="text-xs text-white/50 leading-normal">Vetted, approved, & $25k backed</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
