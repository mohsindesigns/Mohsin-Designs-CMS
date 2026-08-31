"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUp, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useContent } from "../hooks/useContent";
 
export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const content = useContent();
  const { footer } = content;
  const contact = footer?.contact;
 
  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        await fetch('/api/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: 'Newsletter',
            subject: 'New Newsletter Subscription',
            name: 'Newsletter Subscriber',
            email: email,
            message: `New subscription from: ${email}`
          })
        });
      } catch (error) {
        console.error('Newsletter submission failed:', error);
      }
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };
 
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
 
  const wordmarkText = (footer?.wordmarkText || "MOHSIN DESIGNS") as string;
  const wordmarkLetters = Array.from(wordmarkText) as string[];
 
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.03
      }
    }
  };
 
  const letterVariants = {
    hidden: { y: "100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
    }
  };
 
  const socialIcons: Record<string, React.ReactNode> = {
    Twitter: <Twitter className="h-4 w-4" />,
    Linkedin: <Linkedin className="h-4 w-4" />,
    Instagram: <Instagram className="h-4 w-4" />,
    Github: <Github className="h-4 w-4" />
  };
 
  // Safely extract data arrays
  const socialLinks = footer?.socialLinks || [];
  const quickLinks = footer?.quickLinks || [];
  const servicesList = footer?.servicesList || [];
 
  return (
    <footer className="relative bg-[#090A29] dark:bg-[#080710] text-white pt-24 pb-12 overflow-hidden border-t border-white/5 dark:border-white/10">
      
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-blue/5 dark:bg-brand-yellow/5 blur-[150px] pointer-events-none" />
 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-0 pb-20 border-b border-white/10">
          
          {/* Logo & Description Column */}
          <div className="lg:col-span-3 space-y-6 lg:pr-6">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 overflow-hidden border border-white/10">
                <div className="absolute top-1 left-1 w-6 h-6 rounded-full bg-brand-yellow/80 mix-blend-screen" />
                <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-brand-blue/80 mix-blend-screen" />
                <span className="relative font-heading font-extrabold text-white text-base z-10">{footer?.logoLetter || "M"}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-lg leading-none tracking-tight text-white uppercase">
                  {footer?.logoText || "MOHSIN"}
                </span>
                <span className="font-sans font-bold text-[9px] tracking-widest text-brand-yellow uppercase leading-none mt-1">
                  {footer?.logoSub || "DESIGNS"}
                </span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-brand-zinc-300 leading-relaxed max-w-xs font-semibold">
              {footer?.description}
            </p>
            
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest text-brand-zinc-400">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                {footer?.studioStatus}
              </div>
              <span className="text-[9px] font-mono text-brand-zinc-500 tracking-wider">
                {footer?.coordinates}
              </span>
            </div>
 
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.href}
                  aria-label={link.ariaLabel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-brand-zinc-300 hover:bg-brand-blue hover:text-white dark:hover:text-[#080710] hover:border-brand-blue transition-all duration-300 shadow-sm"
                >
                  {socialIcons[link.name] || <ArrowRight className="h-4 w-4" />}
                </a>
              ))}
            </div>
          </div>
 
          {/* Quick Links Column */}
          <div className="lg:col-span-2 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-[10px] uppercase tracking-widest text-brand-yellow">
              {footer?.labelQuickLinks || "Navigation"}
            </p>
            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-brand-zinc-300">
              {quickLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <Link href={link.href} className="inline-block hover:text-brand-yellow dark:hover:text-brand-blue hover:translate-x-1 transition-all duration-200">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-2 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-[10px] uppercase tracking-widest text-brand-yellow">
              {footer?.labelServices || "Services"}
            </p>
            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-brand-zinc-300">
              {servicesList.map((item: any, idx: number) => (
                <li key={idx}>
                  <span className="inline-block hover:text-brand-yellow dark:hover:text-brand-blue hover:translate-x-1 transition-all duration-200 cursor-default">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-3 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-[10px] uppercase tracking-widest text-brand-yellow">
              {footer?.labelContactInfo || "Contact Info"}
            </p>
            <ul className="space-y-4 text-xs md:text-sm font-semibold text-brand-zinc-300">
              <li className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-black text-brand-zinc-500 uppercase tracking-widest">{footer?.labelEmail || "Email"}</span>
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="text-white hover:text-brand-yellow dark:hover:text-brand-blue transition-colors font-mono break-all xs:break-normal">
                    {contact.email}
                  </a>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-black text-brand-zinc-500 uppercase tracking-widest">{footer?.labelPhone || "Phone"}</span>
                {contact?.phone && (
                  <a href={`tel:${contact.phone.replace(/[^0-9+]/g, "")}`} className="text-white hover:text-brand-yellow dark:hover:text-brand-blue transition-colors font-mono break-all xs:break-normal">
                    {contact.phone}
                  </a>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-black text-brand-zinc-500 uppercase tracking-widest">{footer?.labelAddress || "Address"}</span>
                <span className="text-white leading-relaxed">
                  {footer?.valueAddress}
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-[10px] uppercase tracking-widest text-brand-yellow">
              {footer?.labelNewsletter || "Newsletter"}
            </p>
            <p className="text-xs text-brand-zinc-300 font-semibold leading-relaxed">
              {footer?.newsletterDesc}
            </p>
            
            <AnimatePresence mode="wait">
              {!subscribed ? (
                <motion.form 
                  key="form"
                  onSubmit={handleSubscribe} 
                  className="flex rounded-xl overflow-hidden bg-white/5 border border-white/10"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-xs text-white focus:outline-none placeholder-brand-zinc-400 font-semibold"
                    placeholder={footer?.newsletterPlaceholder || "Your email"}
                  />
                  <button
                    type="submit"
                    className="bg-brand-blue text-white dark:text-brand-dark px-3.5 flex items-center justify-center hover:bg-brand-yellow hover:text-brand-dark dark:hover:text-white transition-colors duration-300 cursor-pointer"
                    aria-label={footer?.ariaSubscribe || "Subscribe"}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.form>
              ) : (
                <motion.span 
                  key="success"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="block text-xs font-bold text-brand-yellow dark:text-brand-blue"
                >
                  {footer?.newsletterSuccess || "Subscribed successfully!"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
 
        </div>
 
      </div>
 
      {/* Full-Width Backdrop Wordmark */}
      <div className="select-none text-center pointer-events-none mt-12 md:mt-20 mb-6 overflow-hidden w-full px-4 relative z-0">
        <motion.span 
          className="font-sans font-black text-[7.8vw] leading-none tracking-tighter uppercase flex flex-nowrap justify-center w-full whitespace-nowrap"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.01 }}
        >
          {wordmarkLetters.map((letter, idx) => (
            <motion.span
              key={idx}
              variants={letterVariants}
              className={`inline-block transition-all duration-300 cursor-default hover:scale-110 ${
                idx >= 7 
                  ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.28)] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.12)] hover:[-webkit-text-stroke:1px_#E9BD36] pointer-events-auto" 
                  : "text-white/20 dark:text-white/[0.06] hover:text-brand-yellow dark:hover:text-brand-blue pointer-events-auto"
              }`}
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.span>
      </div>
 
      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
        <p className="text-[10px] font-bold text-brand-zinc-500 dark:text-brand-zinc-400 uppercase tracking-widest text-center md:text-left">
          {footer?.copyrightPrefix}{currentYear}{footer?.copyrightSuffix}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-4 sm:gap-6 text-[10px] font-bold text-brand-zinc-500 dark:text-brand-zinc-400 uppercase tracking-wider">
            {footer?.privacyHref && (
              <Link href={footer.privacyHref} className="hover:text-brand-yellow dark:hover:text-brand-blue transition-colors">{footer.privacyText}</Link>
            )}
            <span>{footer?.linkSeparator || "|"}</span>
            {footer?.termsHref && (
              <Link href={footer.termsHref} className="hover:text-brand-yellow dark:hover:text-brand-blue transition-colors">{footer.termsText}</Link>
            )}
          </div>
 
          <button
            onClick={scrollToTop}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-brand-zinc-300 hover:bg-brand-yellow dark:hover:bg-brand-blue hover:text-[#080710] dark:hover:text-[#080710] hover:border-brand-yellow dark:hover:border-brand-blue transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            aria-label={footer?.ariaScrollTop || "Scroll to Top"}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}