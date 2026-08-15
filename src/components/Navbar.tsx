"use client"

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "../config/icons";
import { useContent } from "../hooks/useContent";
// import sharedServicesData from "../data/servicesData.json";
import logo from "../assets/eaglelogo.png";

import Image from "next/image";
import Link from "next/link";

const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ");
};

const Navbar = () => {
  const content = useContent();
  const { navbar, settings, services: servicesData } = content;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [expandedMobileLink, setExpandedMobileLink] = useState<string | null>(null);

  const servicesButtonRef = useRef<HTMLButtonElement>(null);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { companyLinks } = navbar;
  const services = (servicesData.services || []).filter((s: any) => s.status === 'published' || s.status === undefined);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleServicesMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMegaMenu("services");
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
    // Reset all menu states
    setActiveMegaMenu(null);
    setIsMenuOpen(false);
    setHoveredService(null);
    setExpandedMobileLink(null);

    // In production, we want to ensure any active mega menus are fully hidden
    // before the page transition shutters cover the screen
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <>
      <nav
        className={`sticky top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled
          ? "bg-white/50 backdrop-blur-xl shadow-lg py-2 border-b border-border"
          : "bg-background/80 backdrop-blur-xl shadow-sm py-4 border-b border-border/10"
          }`}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center group"
              onClick={handleLinkClick}
            >
              <div className="h-12 sm:h-14 md:h-16 lg:h-18 w-24 sm:w-28 md:w-32 lg:w-36 flex items-center justify-center overflow-hidden relative">
                {(navbar.logo && (navbar.logo.startsWith('http') || navbar.logo.startsWith('/uploads') || navbar.logo.startsWith('/cdn-images'))) ? (
                  <img
                    src={navbar.logo}
                    alt={navbar.siteTitle || "Eagle Revolution Logo"}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Image
                    src={navbar.logo || logo}
                    alt={navbar.siteTitle || "Eagle Revolution Logo"}
                    className="object-contain"
                    fill
                    priority
                    quality={100}
                  />
                )}

              </div>
            </Link>

            <div className="hidden lg:flex items-center space-x-1 ml-2">
              {(companyLinks || []).map((link: any, linkIdx: number) => {
                if (link.useMegaMenu) {
                  return (
                    <div key={linkIdx} className={link.useMegaMenu ? "static" : "relative"}>
                      <Link
                        href={link.href}
                        onMouseEnter={() => {
                          if (timeoutRef.current) clearTimeout(timeoutRef.current);
                          setActiveMegaMenu(`mega-${linkIdx}`);
                        }}
                        onMouseLeave={() => {
                          timeoutRef.current = setTimeout(() => {
                            if (!isHoveringMegaMenu) setActiveMegaMenu(null);
                          }, 150);
                        }}
                        className={`flex items-center space-x-2 px-5 py-2.5 transition-all duration-300 font-bold rounded-xl relative group ${scrolled ? "text-black hover:text-primary" : "text-black hover:text-primary"}`}
                      >
                        <Icon name={link.icon || "Wrench"} className="h-4 w-4" />
                        <span>{link.label}</span>
                        {services.length > 0 && (
                          <motion.span animate={{ rotate: activeMegaMenu === `mega-${linkIdx}` ? 180 : 0 }}>
                            <Icon name="ChevronDown" className="h-4 w-4 ml-1" />
                          </motion.span>
                        )}
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-4/5 transition-all duration-500" />
                      </Link>

                      <AnimatePresence>
                        {activeMegaMenu === `mega-${linkIdx}` && (
                          <motion.div
                            ref={megaMenuRef}
                            initial={{ opacity: 0, y: 15, x: "-50%" }}
                            animate={{ opacity: 1, y: 0, x: "-50%" }}
                            exit={{ opacity: 0, y: 10, x: "-50%" }}
                            onMouseEnter={handleMegaMenuMouseEnter}
                            onMouseLeave={handleMegaMenuMouseLeave}
                            className="absolute left-1/2 top-full mt-2 w-[800px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-border p-8"
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
                                    className="group block p-4 rounded-xl hover:bg-primary/5 transition-all duration-300 border border-transparent hover:border-primary/10"
                                  >
                                    <div className="flex items-center space-x-4 mb-3">
                                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300 ${isThisHovered ? "bg-primary shadow-lg shadow-primary/25" : "bg-primary/10"}`}>
                                        <Icon name={service.icon} className={`h-6 w-6 transition-colors duration-300 ${isThisHovered ? "text-white" : "text-primary"}`} />
                                      </div>
                                      <h3 className={`font-bold transition-colors ${isThisHovered ? "text-primary" : "text-foreground"}`}>
                                        {service.title}
                                      </h3>
                                    </div>
                                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
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
                        className={`flex items-center space-x-2 px-4 py-2.5 transition-all duration-300 font-bold rounded-xl relative group ${scrolled ? "text-black hover:text-primary" : "text-black hover:text-primary"}`}
                      >
                        <Icon name={link.icon} className="h-4 w-4" />
                        <span>{link.label}</span>
                        <Icon name="ChevronDown" className="h-3 w-3 ml-1 transition-transform group-hover:rotate-180" />
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-500" />
                      </Link>

                      <div className="absolute left-0 top-full w-48 bg-white rounded-xl shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left -translate-y-2 group-hover:translate-y-0" style={{ zIndex: 1000 }}>
                        <div className="py-2">
                          {link.subLinks.map((subLink: any, sIdx: number) => (
                            <Link
                              key={sIdx}
                              href={subLink.href}
                              className="flex items-center space-x-2 px-4 py-2 text-sm font-bold text-foreground hover:text-primary hover:bg-primary/5 transition-colors"
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
                    className={`flex items-center space-x-2 px-4 py-2.5 transition-all duration-300 font-bold rounded-xl relative group ${scrolled ? "text-black hover:text-primary" : "text-black hover:text-primary"}`}
                  >
                    <Icon name={link.icon} className="h-4 w-4" />
                    <span>{link.label}</span>
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary group-hover:w-3/4 transition-all duration-500" />
                  </Link>
                );
              })}
            </div>

            <motion.div className="hidden lg:flex items-center" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href={navbar.ctaLink || "/contact-us"}
                className="flex items-center space-x-2 px-7 py-3.5 rounded-xl font-bold transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/20 hover:text-white"
              >
                <Icon name="Calendar" className="h-4 w-4" />
                <span>{navbar.ctaText || "Book Now"}</span>
              </Link>
            </motion.div>

            <div className="lg:hidden flex items-center">
              <motion.button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`
                  flex items-center justify-center 
                  h-11 w-11 rounded-xl transition-all duration-300
                  ${scrolled
                    ? "bg-white text-primary shadow-md border border-border"
                    : "bg-white/20 text-primary backdrop-blur-sm"
                  }
                `}
                whileTap={{ scale: 0.9 }}
              >
                {isMenuOpen ? <Icon name="X" className="h-6 w-6" /> : <Icon name="Menu" className="h-6 w-6" />}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 lg:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="relative h-10 w-24">
                  {(navbar.logo && (navbar.logo.startsWith('http') || navbar.logo.startsWith('/uploads') || navbar.logo.startsWith('/cdn-images'))) ? (
                    <img src={navbar.logo} alt="Logo" className="object-contain w-full h-full" />
                  ) : (
                    <Image src={navbar.logo || logo} alt="Logo" className="object-contain" fill quality={100} />
                  )}
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-foreground">
                  <Icon name="X" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                <div className="grid gap-2">
                  {companyLinks.map((link: any, linkIdx: number) => {
                    const isMegaMenu = link.useMegaMenu;
                    const hasSubLinks = link.subLinks && link.subLinks.length > 0;
                    const isExpanded = expandedMobileLink === link.label;

                    return (
                      <div key={linkIdx} className="flex flex-col">
                        <div className="flex items-center justify-between p-3">
                          <Link
                            href={link.href}
                            onClick={handleLinkClick}
                            className="flex items-center space-x-3 font-bold text-foreground hover:text-primary flex-1"
                          >
                            <Icon name={link.icon || "Wrench"} className="h-4 w-4" />
                            <span>{link.label}</span>
                          </Link>
                          {(isMegaMenu || hasSubLinks) && (
                            <button
                              onClick={() => setExpandedMobileLink(isExpanded ? null : link.label)}
                              className="p-2 text-muted-foreground hover:text-primary transition-colors"
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
                              <div className="pl-6 flex flex-col space-y-1 mb-2 border-l-2 border-primary/20 ml-5">
                                {isMegaMenu ? (
                                  services.map((service: any) => (
                                    <Link
                                      key={service.slug}
                                      href={`/services/${service.slug}`}
                                      onClick={handleLinkClick}
                                      className="flex items-center space-x-3 p-2.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                    >
                                      {service.icon && <Icon name={service.icon} className="h-4 w-4" />}
                                      <span>{service.title}</span>
                                    </Link>
                                  ))
                                ) : (
                                  link.subLinks.map((subLink: any, sIdx: number) => (
                                    <Link
                                      key={sIdx}
                                      href={subLink.href}
                                      onClick={handleLinkClick}
                                      className="flex items-center space-x-3 p-2.5 text-sm font-bold text-muted-foreground hover:text-primary transition-colors rounded-lg hover:bg-primary/5"
                                    >
                                      {subLink.icon && <Icon name={subLink.icon} className="h-4 w-4" />}
                                      <span>{subLink.label}</span>
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
                </div>
              </div>

              <div className="p-6 bg-muted/30">
                <Link
                  href={navbar.ctaLink || "/contact-us"}
                  onClick={handleLinkClick}
                  className="block w-full py-4 bg-primary text-white font-bold rounded-xl text-center shadow-lg shadow-primary/20"
                >
                  {navbar.ctaText || "Book Now"}
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;