"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Menu, X, Star, Sun, Moon } from "lucide-react";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Image from "next/image";
import Link from "next/link";

const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
};

export default function Navbar() {
  const content = useContent();
  const { navbar, settings, services: servicesData } = content;
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [expandedMobileLink, setExpandedMobileLink] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { companyLinks } = navbar;
  const services = (servicesData.services || []).filter((s: any) => s.status === 'published' || s.status === undefined);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleServicesMouseEnter = (linkIdx: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(`mega-${linkIdx}`);
  };

  const handleServicesMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      if (!isHoveringMegaMenu) setActiveMegaMenu(null);
    }, 150);
  };

  const handleMegaMenuMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHoveringMegaMenu(true);
  };

  const handleMegaMenuMouseLeave = () => {
    setIsHoveringMegaMenu(false);
    timeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
      setHoveredService(null);
    }, 150);
  };

  const handleLinkClick = () => {
    setActiveMegaMenu(null);
    setIsOpen(false);
    setHoveredService(null);
    setExpandedMobileLink(null);

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-full px-4 py-3 sm:px-6 sm:py-4 md:px-12 pointer-events-none">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-7xl rounded-full border border-brand-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-[#12121e]/80 px-3 sm:px-6 py-2.5 sm:py-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md flex items-center justify-between pointer-events-auto"
      >
        {/* Brand Logo - Supporting dynamic image & fallback premium styling */}
        <Link href="/" className="flex items-center group pointer-events-auto" onClick={handleLinkClick}>
          {navbar.logo ? (
            <div className="h-10 sm:h-12 w-24 sm:w-28 flex items-center justify-center overflow-hidden relative">
              <img
                src={navbar.logo}
                alt={settings.siteTitle || "Mohsin Designs Logo"}
                className="object-contain w-full h-full max-h-10"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue shadow-md border border-brand-blue/10">
                <span className="font-sans font-black text-white text-sm sm:text-base leading-none">
                  {navbar.logoLetter || (settings.siteTitle ? settings.siteTitle.charAt(0) : "M")}
                </span>
                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-brand-yellow flex items-center justify-center border border-white">
                  <Star className="h-1.5 w-1.5 sm:h-2 sm:w-2 fill-brand-dark text-brand-dark" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-black text-xs sm:text-base tracking-tight text-brand-dark dark:text-white leading-none">
                  {navbar.logoText || "MOHSIN"}
                </span>
                <span className="font-sans font-bold text-[7.5px] sm:text-[8.5px] tracking-[0.2em] text-brand-blue dark:text-brand-yellow uppercase leading-none mt-1">
                  {navbar.logoSub || "DESIGNS"}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Desktop Nav - Dynamic links mapping */}
        <nav className="hidden md:flex items-center gap-8 font-sans font-bold text-xs uppercase tracking-wider text-brand-dark dark:text-white">
          {(companyLinks || []).map((link: any, linkIdx: number) => {
            if (link.useMegaMenu) {
              return (
                <div key={linkIdx} className="static">
                  <Link
                    href={link.href}
                    onMouseEnter={() => handleServicesMouseEnter(linkIdx)}
                    onMouseLeave={handleServicesMouseLeave}
                    className="relative py-1 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    {services.length > 0 && (
                      <motion.span animate={{ rotate: activeMegaMenu === `mega-${linkIdx}` ? 180 : 0 }}>
                        <Icon name="ChevronDown" className="h-3 w-3 ml-0.5" />
                      </motion.span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue dark:bg-brand-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>

                  <AnimatePresence>
                    {activeMegaMenu === `mega-${linkIdx}` && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        onMouseEnter={handleMegaMenuMouseEnter}
                        onMouseLeave={handleMegaMenuMouseLeave}
                        className="absolute left-1/2 top-full mt-2 w-[800px] bg-white dark:bg-[#12121e] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-brand-zinc-200/80 dark:border-white/10 p-8 pointer-events-auto"
                        style={{ zIndex: 1000 }}
                      >
                        <div className="grid grid-cols-3 gap-6">
                          {services.map((service: any) => {
                            const isThisHovered = hoveredService === service.title;
                            return (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                onMouseEnter={() => setHoveredService(service.title)}
                                onMouseLeave={() => setHoveredService(null)}
                                onClick={handleLinkClick}
                                className="group block p-4 rounded-xl hover:bg-brand-blue/5 dark:hover:bg-brand-yellow/5 transition-all duration-300 border border-transparent hover:border-brand-blue/10 dark:hover:border-brand-yellow/10"
                              >
                                <div className="flex items-center space-x-4 mb-3">
                                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isThisHovered ? "bg-brand-blue dark:bg-brand-yellow text-white dark:text-brand-dark shadow-lg shadow-brand-blue/25" : "bg-brand-blue/10 dark:bg-brand-yellow/10 text-brand-blue dark:text-brand-yellow"}`}>
                                    <Icon name={service.icon} className="h-6 w-6" />
                                  </div>
                                  <h3 className={`font-bold transition-colors ${isThisHovered ? "text-brand-blue dark:text-brand-yellow" : "text-brand-dark dark:text-white"}`}>
                                    {service.title}
                                  </h3>
                                </div>
                                <p className="text-brand-zinc-500 dark:text-brand-zinc-400 text-xs leading-relaxed line-clamp-2">
                                  {stripHtml(service.description)}
                                </p>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if (link.subLinks && link.subLinks.length > 0) {
              return (
                <div key={linkIdx} className="relative group">
                  <Link
                    href={link.href}
                    onClick={handleLinkClick}
                    className="relative py-1 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    <Icon name="ChevronDown" className="h-3 w-3 ml-0.5 transition-transform group-hover:rotate-180" />
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue dark:bg-brand-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>

                  <div className="absolute left-0 top-full w-48 bg-white dark:bg-[#12121e] rounded-xl shadow-lg border border-brand-zinc-200/80 dark:border-white/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0" style={{ zIndex: 1000 }}>
                    <div className="py-2">
                      {link.subLinks.map((subLink: any, sIdx: number) => (
                        <Link
                          key={sIdx}
                          href={subLink.href}
                          className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow hover:bg-brand-blue/5 dark:hover:bg-brand-yellow/5 transition-colors"
                          onClick={handleLinkClick}
                        >
                          {subLink.icon && <Icon name={subLink.icon} className="h-4 w-4" />}
                          <span>{subLink.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={linkIdx}
                href={link.href}
                onClick={handleLinkClick}
                className="relative py-1 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group flex items-center gap-1"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue dark:bg-brand-yellow transition-all duration-300 group-hover:w-full" />
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle + CTA Button */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 bg-brand-light dark:bg-white/10 hover:bg-brand-yellow/20 transition-all duration-300 text-brand-dark dark:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <a
            href={navbar.ctaLink || "/contact-us"}
            className="btn-primary-cta"
          >
            <span>{navbar.ctaText || "Book Now"}</span>
            <span className="btn-icon">
              <ArrowUpRight className="h-3.5 w-3.5" />
            </span>
          </a>
        </div>

        {/* Mobile: Theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 bg-brand-light dark:bg-white/10 hover:bg-brand-yellow/20 transition-all duration-300 text-brand-dark dark:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="rounded-full p-2 text-brand-dark dark:text-white hover:bg-brand-zinc-100 dark:hover:bg-white/10 transition-colors"
            aria-label={navbar.ariaToggleMenu || "Toggle Menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </motion.div>

      {/* Mobile Nav Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute left-4 right-4 mt-2 rounded-2xl border border-brand-zinc-200 dark:border-white/10 bg-white dark:bg-[#12121e] p-5 sm:p-6 shadow-xl md:hidden pointer-events-auto"
        >
          <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider">
            {companyLinks.map((link: any, linkIdx: number) => {
              const isMegaMenu = link.useMegaMenu;
              const hasSubLinks = link.subLinks && link.subLinks.length > 0;
              const isExpanded = expandedMobileLink === link.label;

              return (
                <div key={linkIdx} className="flex flex-col">
                  <div className="flex items-center justify-between py-2">
                    <Link
                      href={link.href}
                      onClick={handleLinkClick}
                      className="block text-brand-dark dark:text-white hover:text-brand-blue dark:hover:text-brand-yellow transition-colors flex-1"
                    >
                      {link.label}
                    </Link>
                    {(isMegaMenu || hasSubLinks) && (
                      <button
                        onClick={() => setExpandedMobileLink(isExpanded ? null : link.label)}
                        className="p-2 text-brand-zinc-500 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon name="ChevronDown" className="h-4 w-4" />
                        </motion.div>
                      </button>
                    )}
                  </div>

                  <AnimatePresence>
                    {(isMegaMenu || hasSubLinks) && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 flex flex-col gap-2.5 mb-2 border-l border-brand-blue/20 ml-2 mt-1">
                          {isMegaMenu ? (
                            services.map((service: any) => (
                              <Link
                                key={service.slug}
                                href={`/services/${service.slug}`}
                                onClick={handleLinkClick}
                                className="block py-1 text-xs text-brand-zinc-500 dark:text-brand-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
                              >
                                {service.title}
                              </Link>
                            ))
                          ) : (
                            link.subLinks.map((subLink: any, sIdx: number) => (
                              <Link
                                key={sIdx}
                                href={subLink.href}
                                onClick={handleLinkClick}
                                className="block py-1 text-xs text-brand-zinc-500 dark:text-brand-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
                              >
                                {subLink.label}
                              </Link>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
            <hr className="border-brand-zinc-100 dark:border-white/10" />
            <a
              href={navbar.ctaLink || "/contact-us"}
              onClick={handleLinkClick}
              className="btn-primary-cta w-full"
            >
              <span>{navbar.ctaText || "Book Now"}</span>
              <span className="btn-icon">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </a>
          </nav>
        </motion.div>
      )}
    </header>
  );
}