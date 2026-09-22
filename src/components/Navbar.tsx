"use client";

import { withTrailingSlash } from "@/lib/url";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUpRight, Globe, MapPin, Menu, X, Star, Sun, Moon } from "lucide-react";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
import Image from "next/image";
import Link from "@/components/ui/Link";
import CtaButton from "@/components/ui/CtaButton";
import { parseMapEmbed } from "@/lib/mapEmbed";

// Shared look of the dropdown / mega-menu panels. The nav bar itself is uppercase + bold + wide
// tracking; panels must reset that or their titles and descriptions become unreadable.
const PANEL_BASE =
"absolute left-1/2 top-full mt-3 max-w-[calc(100vw-3rem)] overflow-hidden rounded-3xl border border-brand-zinc-200/80 dark:border-white/10 bg-white dark:bg-[#12121e] text-left font-sans text-sm font-normal normal-case tracking-normal text-brand-dark dark:text-white shadow-[0_30px_70px_-20px_rgba(3,6,172,0.28)] dark:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.7)] pointer-events-auto";

type MapSource = { kind: "embed" | "image" | "none"; value: string };

// Which map to show in the Locations dropdown: the hovered location's own map if it has one,
// otherwise the dropdown's default (embed or image).
function resolveLocationMap(menu: any, item?: any): MapSource {
  const itemEmbed = parseMapEmbed(item?.mapEmbed);
  if (itemEmbed) return { kind: "embed", value: itemEmbed };
  if (item?.mapImage) return { kind: "image", value: item.mapImage };
  const menuEmbed = parseMapEmbed(menu?.mapEmbed);
  if (menu?.mapType ==="image" && menu?.mapImage) return { kind: "image", value: menu.mapImage };
  if (menuEmbed) return { kind: "embed", value: menuEmbed };
  if (menu?.mapImage) return { kind: "image", value: menu.mapImage };
  return { kind: "none", value: "" };
}

export default function Navbar() {
  const content = useContent();
  const { navbar, settings, services: servicesData } = content;
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<number | null>(null);
  const [expandedMobileLink, setExpandedMobileLink] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const companyLinks = navbar?.companyLinks || [];
  const services = (servicesData.services || []).filter((s: any) =>
    (s.status === 'published' || s.status === undefined) && !s.isTrashed && s.title && String(s.title).trim()
  );

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

  const openMenu = (id: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu(id);
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
      setHoveredLocation(null);
    }, 150);
  };

  const handleLinkClick = () => {
    setActiveMegaMenu(null);
    setIsOpen(false);
    setHoveredService(null);
    setHoveredLocation(null);
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
          {navbar.logo || navbar.logoDark ? (
            <div className="h-10 sm:h-12 w-24 sm:w-28 flex items-center justify-center overflow-hidden relative">
              {/* Light-theme logo (navbar.logo). Falls back to the dark one if only that is set. */}
              <img
                src={navbar.logo || navbar.logoDark}
                alt={settings.siteTitle || "Mohsin Designs Logo"}
                className="object-contain w-full h-full max-h-10 dark:hidden"
              />
              {/* Dark-theme logo (navbar.logoDark). Falls back to the light one. */}
              <img
                src={navbar.logoDark || navbar.logo}
                alt={settings.siteTitle || "Mohsin Designs Logo"}
                loading="lazy"
                className="object-contain w-full h-full max-h-10 hidden dark:block"
              />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full bg-brand-blue shadow-md border border-brand-blue/10">
                <span className="font-sans font-black text-white text-sm sm:text-base leading-none">
                  {navbar.logoLetter || (settings.siteTitle ? settings.siteTitle.charAt(0) : "M")}
                </span>
                <div className="absolute -top-0.5 -right-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-brand-accent flex items-center justify-center border border-white">
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
              const menuId = `mega-${linkIdx}`;
              const isOpen = activeMegaMenu === menuId;
              return (
                <div key={linkIdx} className="static">
                  <Link
                    href={link.href}
                    onMouseEnter={() => openMenu(menuId)}
                    onMouseLeave={handleServicesMouseLeave}
                    onClick={handleLinkClick}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="relative py-1 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    {services.length > 0 && (
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                        <Icon name="ChevronDown" className="h-3 w-3 ml-0.5" />
                      </motion.span>
                    )}
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue dark:bg-brand-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>

                  <AnimatePresence>
                    {isOpen && services.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        onMouseEnter={handleMegaMenuMouseEnter}
                        onMouseLeave={handleMegaMenuMouseLeave}
                        className={`${PANEL_BASE} w-[960px]`}
                        style={{ zIndex: 1000 }}
                      >
                        {/* Header */}
                        <div className="flex items-end justify-between gap-6 px-8 pt-7 pb-3">
                          <div>
                            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-brand-blue dark:text-brand-yellow">
                              {link.megaMenuEyebrow || "Our Services"}
                            </p>
                            <h3 className="mt-1.5 font-heading text-2xl font-black leading-tight tracking-tight text-brand-dark dark:text-white">
                              {link.megaMenuTitle || "Everything you need to grow"}
                            </h3>
                          </div>
                          <Link
                            href={link.href}
                            onClick={handleLinkClick}
                            className="group/all inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-blue dark:text-brand-yellow hover:underline underline-offset-4"
                          >
                            View all services
                            <ArrowRight className="h-4 w-4 transition-transform group-hover/all:translate-x-0.5" />
                          </Link>
                        </div>

                        {/* Service cards - each is its own bordered card at rest (not just on
                            hover) so the grid reads as clearly separated tiles, and the whole
                            grid scrolls once it's taller than the viewport can fit, so the
                            footer strip below is never pushed off-screen. */}
                        <div className="custom-scrollbar grid max-h-[min(56vh,460px)] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 overflow-y-auto px-5 pb-5 pt-2">
                          {services.map((service: any) => (
                            <Link
                              key={service.slug}
                              href={`/services/${service.slug}`}
                              onClick={handleLinkClick}
                              className="group flex items-center gap-3.5 rounded-2xl border border-brand-zinc-100 bg-brand-zinc-50/60 p-3.5 transition-all duration-300 hover:border-brand-blue/25 hover:bg-brand-blue/[0.05] hover:shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] dark:hover:border-brand-yellow/25 dark:hover:bg-brand-yellow/[0.07]"
                            >
                              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand-blue shadow-sm transition-all duration-300 group-hover:bg-brand-blue group-hover:text-white group-hover:shadow-lg group-hover:shadow-brand-blue/25 dark:bg-white/5 dark:text-brand-yellow dark:group-hover:bg-brand-yellow dark:group-hover:text-brand-dark">
                                <Icon name={service.icon} className="h-5 w-5" />
                              </span>
                              <span className="min-w-0 block text-[15px] font-bold leading-snug text-brand-dark transition-colors group-hover:text-brand-blue dark:text-white dark:group-hover:text-brand-yellow">
                                {service.title}
                              </span>
                            </Link>
                          ))}
                        </div>

                        {/* Footer strip */}
                        <div className="flex items-center justify-between gap-6 border-t border-brand-zinc-200/80 bg-brand-blue/[0.03] px-8 py-4 dark:border-white/10 dark:bg-white/[0.03]">
                          <p className="text-[13px] font-medium text-brand-zinc-600 dark:text-zinc-300">
                            {link.megaMenuFooterText || "Not sure which service fits? Talk to our team - the first consultation is free."}
                          </p>
                          <CtaButton size="sm" href={navbar.ctaLink || "/contact-us"} onClick={handleLinkClick}>
                            {navbar.ctaText || "Book Now"}
                          </CtaButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            if (link.useLocationsMenu) {
              const menuId = `loc-${linkIdx}`;
              const isOpen = activeMegaMenu === menuId;
              const menu = link.locationsMenu || {};
              const locItems = (Array.isArray(menu.items) ? menu.items : []).filter((i: any) => i?.label && i?.href);
              const activeItem = hoveredLocation !== null ? locItems[hoveredLocation] : null;
              const map = resolveLocationMap(menu, activeItem);
              const caption = activeItem?.label || menu.title || link.label;

              return (
                <div key={linkIdx} className="static">
                  <Link
                    href={link.href}
                    onMouseEnter={() => openMenu(menuId)}
                    onMouseLeave={handleServicesMouseLeave}
                    onClick={handleLinkClick}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    className="relative py-1 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors group flex items-center gap-1"
                  >
                    <span>{link.label}</span>
                    <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                      <Icon name="ChevronDown" className="h-3 w-3 ml-0.5" />
                    </motion.span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-brand-blue dark:bg-brand-yellow transition-all duration-300 group-hover:w-full" />
                  </Link>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, x: "-50%" }}
                        animate={{ opacity: 1, y: 0, x: "-50%" }}
                        exit={{ opacity: 0, y: 10, x: "-50%" }}
                        onMouseEnter={handleMegaMenuMouseEnter}
                        onMouseLeave={handleMegaMenuMouseLeave}
                        className={`${PANEL_BASE} w-[980px]`}
                        style={{ zIndex: 1000 }}
                      >
                        <div className="grid grid-cols-12">
                          {/* Col 1: intro */}
                          <div className="col-span-4 flex flex-col justify-center border-r border-brand-zinc-100 dark:border-white/10 p-7">
                            <p className="flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-brand-zinc-500 dark:text-zinc-400">
                              <MapPin className="h-3.5 w-3.5" />
                              {menu.eyebrow || "Where we work"}
                            </p>
                            <h3 className="mt-3 font-heading text-3xl font-black leading-[1.05] tracking-tight text-brand-dark dark:text-white">
                              {menu.title || "Our Locations"}
                            </h3>

                            <span className="mt-5 block h-[3px] w-9 rounded-full bg-brand-blue dark:bg-brand-yellow" />

                            {menu.ctaLabel && menu.ctaHref && (
                              <Link
                                href={menu.ctaHref}
                                onClick={handleLinkClick}
                                className="group/all mt-5 inline-flex items-center gap-2.5"
                              >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue transition-colors group-hover/all:bg-brand-blue group-hover/all:text-white dark:bg-brand-yellow/10 dark:text-brand-yellow dark:group-hover/all:bg-brand-yellow dark:group-hover/all:text-brand-dark">
                                  <Globe className="h-4 w-4" />
                                </span>
                                <span className="text-sm font-bold text-brand-dark dark:text-white">
                                  {menu.ctaLabel}
                                </span>
                                <ArrowRight className="h-4 w-4 text-brand-blue transition-transform group-hover/all:translate-x-0.5 dark:text-brand-yellow" />
                              </Link>
                            )}
                          </div>

                          {/* Col 2: locations list */}
                          <div className="custom-scrollbar col-span-3 flex max-h-[420px] flex-col gap-2 overflow-y-auto p-5">
                            {locItems.map((item: any, i: number) => {
                              const active = hoveredLocation === i;
                              return (
                                <Link
                                  key={i}
                                  href={item.href}
                                  onMouseEnter={() => setHoveredLocation(i)}
                                  onFocus={() => setHoveredLocation(i)}
                                  onClick={handleLinkClick}
                                  className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-3 transition-colors ${
                                    active
                                      ? "bg-brand-blue/[0.08] dark:bg-brand-yellow/[0.1]"
                                      : "bg-brand-zinc-50 hover:bg-brand-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]"
                                  }`}
                                >
                                  <span
                                    className={`absolute inset-y-0 left-0 w-[3px] rounded-r-full transition-colors ${
                                      active ? "bg-brand-blue dark:bg-brand-yellow" : "bg-transparent"
                                    }`}
                                  />
                                  <span
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors ${
                                      active
                                        ? "bg-brand-blue text-white dark:bg-brand-yellow dark:text-brand-dark"
                                        : "bg-white text-brand-zinc-400 dark:bg-white/10 dark:text-zinc-400"
                                    }`}
                                  >
                                    <MapPin className="h-4 w-4" />
                                  </span>
                                  <span className="min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight text-brand-dark dark:text-white">
                                    {item.label}
                                  </span>
                                  <ArrowRight
                                    className={`h-4 w-4 shrink-0 transition-all ${
                                      active
                                        ? "translate-x-0 text-brand-blue dark:text-brand-yellow"
                                        : "-translate-x-1 text-brand-zinc-400 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                                    }`}
                                  />
                                </Link>
                              );
                            })}
                            {locItems.length === 0 && (
                              <p className="px-2 py-3 text-[13px] text-brand-zinc-600 dark:text-zinc-400">
                                Add locations in Admin &gt; Settings &gt; Header.
                              </p>
                            )}
                          </div>

                          {/* Col 3: featured map / image */}
                          <div className="relative col-span-5 min-h-[420px] overflow-hidden bg-brand-blue/[0.05] dark:bg-white/[0.04]">
                            {map.kind === "embed" ? (
                              <iframe
                                key={map.value}
                                src={map.value}
                                title={`Map - ${caption}`}
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                                className="absolute inset-0 h-full w-full border-0 dark:[filter:invert(0.92)_hue-rotate(180deg)_contrast(0.9)]"
                              />
                            ) : map.kind === "image" ? (
                              <img key={map.value} src={map.value} alt={`${caption} map`} className="absolute inset-0 h-full w-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-brand-blue/40 dark:text-brand-yellow/40">
                                <MapPin className="h-10 w-10" />
                                <span className="text-[13px] font-medium">Add a map in Admin &gt; Settings &gt; Header</span>
                              </div>
                            )}
                            {/* Text overlay only makes sense over a static photo we control. A live Google
                                Maps embed draws its own place card / rating / attribution chrome wherever
                                it wants, inside a cross-origin iframe we can't reposition or suppress - any
                                overlay here WILL eventually collide with it. So: image gets the full
                                editorial treatment, embed gets left alone to just be an interactive map. */}
                            {map.kind === "image" && (
                              <>
                                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/65" />
                                <div className="pointer-events-none absolute inset-x-0 top-0 p-6">
                                  <span className="text-[11px] font-mono font-bold uppercase tracking-[0.18em] text-white/80">
                                    Featured Location
                                  </span>
                                  <h4 className="mt-1 font-heading text-3xl font-black leading-none text-white">
                                    {caption}
                                  </h4>
                                  {activeItem?.subtitle && (
                                    <p className="mt-1.5 text-[13px] font-medium text-white/85">
                                      {activeItem.subtitle}
                                    </p>
                                  )}
                                  <span className="mt-2.5 block h-[3px] w-9 rounded-full bg-brand-yellow" />
                                </div>
                                <div className="pointer-events-none absolute inset-x-0 bottom-0 px-5 pb-4 pt-10">
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-[13px] font-semibold text-brand-dark shadow-md">
                                    <MapPin className="h-3.5 w-3.5 text-brand-blue" />
                                    {caption}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
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
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 bg-brand-light dark:bg-white/10 hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/20 transition-all duration-300 text-brand-dark dark:text-white"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <CtaButton href={navbar.ctaLink || "/contact-us"}>{navbar.ctaText || "Book Now"}</CtaButton>
        </div>

        {/* Mobile: Theme toggle + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-zinc-200 dark:border-white/15 bg-brand-light dark:bg-white/10 hover:bg-brand-blue/10 dark:hover:bg-brand-yellow/20 transition-all duration-300 text-brand-dark dark:text-white"
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
              const isLocations = !!link.useLocationsMenu;
              const locationItems = isLocations
                ? (link.locationsMenu?.items || []).filter((i: any) => i?.label && i?.href)
                : [];
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
                    {(isMegaMenu || isLocations || hasSubLinks) && (
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
                    {(isMegaMenu || isLocations || hasSubLinks) && isExpanded && (
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
                          ) : isLocations ? (
                            locationItems.map((item: any, lIdx: number) => (
                              <Link
                                key={lIdx}
                                href={item.href}
                                onClick={handleLinkClick}
                                className="flex items-center gap-2 py-1 text-xs text-brand-zinc-500 dark:text-brand-zinc-400 hover:text-brand-blue dark:hover:text-brand-yellow transition-colors"
                              >
                                <MapPin className="h-3 w-3 shrink-0" />
                                {item.label}
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
            <CtaButton href={navbar.ctaLink || "/contact-us"} onClick={handleLinkClick} fullWidth>{navbar.ctaText || "Book Now"}</CtaButton>
          </nav>
        </motion.div>
      )}
    </header>
  );
}