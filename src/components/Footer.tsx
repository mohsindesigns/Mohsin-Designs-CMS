"use client";
 
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowUp } from "lucide-react";
import { FormEvent, useState } from "react";
import Link from "@/components/ui/Link";
import { useContent } from "../hooks/useContent";
import RichTextRenderer from "./ui/RichTextRenderer";
import { Icon } from "../config/icons";
 
const stripHtml = (html: string) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, "").trim();
};

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const content = useContent();
  const { footer, services: servicesData } = content;
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
 
  // Wordmark reveal: each letter slides up, then its fill sweeps in left -> right
  // (background-size 0% -> 100% on a text-clipped gradient) so the giant backdrop text reads as a
  // deliberate "filling up" effect instead of a barely-visible ghost.
  const letterVariants = {
    hidden: { y: "100%", opacity: 0, backgroundSize: "0% 100%" },
    visible: {
      y: 0,
      opacity: 1,
      backgroundSize: "100% 100%",
      transition: {
        y: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
        opacity: { duration: 0.5 },
        backgroundSize: { duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
      }
    }
  };
 
  // Social profiles are managed at Admin > Settings > Social, saved as
  // footer.social ({platform, href, icon}) - not footer.socialLinks, which
  // has no admin UI and was never actually populated.
  const socialLinks = (footer?.social || []).filter((l: any) => l?.href && String(l.href).trim());

  //"Company Links" are managed at Admin > Settings > Footer ("Company Links"),
  // saved as footer.services.materials.items ({label, href}) - not
  // footer.quickLinks, which has no admin UI.
  const quickLinksTitle = footer?.services?.materials?.title || footer?.labelQuickLinks || "Company";
  const quickLinks = (footer?.services?.materials?.items || []).filter(
    (l: any) => l?.label && String(l.label).trim()
  );

  // Trashed services keep status "published" in the catalogue, so `isTrashed` must be excluded
  // explicitly (like the Navbar does) or the footer links to pages that 404. Read the full
  // catalogue (`globalServices`) so a page-level "featured services" subset never shrinks it.
  const catalogue: any[] = (content as any).globalServices?.length ? (content as any).globalServices : (servicesData?.services || []);
  const allPublishedServices = catalogue.filter(
    (s: any) => (s.status === 'published' || s.status === undefined) && !s.isTrashed && s.title && String(s.title).trim() && s.slug
  );

  //"Selected Footer Services" is managed at Admin > Settings > Footer as a
  // list of service ids (footer.services.selectedServices). Per that UI's
  // own description, an empty selection means"show all published services".
  const selectedServiceIds: string[] = footer?.services?.selectedServices || [];
  const matchedSelectedServices = selectedServiceIds.length > 0
    ? allPublishedServices.filter((s: any) => selectedServiceIds.includes(s._id) || selectedServiceIds.includes(s.id) || selectedServiceIds.includes(s.slug))
    : [];
  const servicesListTitle = footer?.services?.title || footer?.labelServices || "Services";
  const servicesList = (matchedSelectedServices.length > 0 ? matchedSelectedServices : allPublishedServices)
    .map((s: any) => ({ label: s.title, href: `/services/${s.slug}` }));
 
  return (
    <footer className="relative bg-[#090A29] dark:bg-[#080710] text-white pt-24 pb-12 overflow-hidden border-t border-white/5 dark:border-white/10">
      
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] rounded-full bg-brand-blue/5 dark:bg-brand-yellow/5 blur-[150px] pointer-events-none" />
 
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-0 pb-20 border-b border-white/10">
          
          {/* Logo & Description Column */}
          <div className="lg:col-span-3 min-w-0 space-y-6 lg:pr-6">
            <div className="flex items-center gap-2.5">
              {footer?.company?.logo || footer?.company?.logoDark ? (
                <div className="relative flex h-14 w-36 items-center justify-start overflow-hidden">
                  {/* Light-theme logo (footer.company.logo). Falls back to the dark one if only that is set. */}
                  <img
                    src={footer.company.logo || footer.company.logoDark}
                    alt={footer?.company?.name || "Mohsin Designs Logo"}
                    className="object-contain h-full max-w-full dark:hidden"
                  />
                  {/* Dark-theme logo (footer.company.logoDark). Falls back to the light one - if no
                      separate dark-mode logo has been uploaded in Admin > Settings, this renders
                      the exact same light-mode logo image, including whatever accent color is baked
                      into that image file. No amount of CSS can recolor an arbitrary uploaded raster/
                      vector logo's internal colors; a real dark-mode variant needs to be uploaded
                      there for the logo to carry an actually-visible accent in dark mode. */}
                  <img
                    src={footer.company.logoDark || footer.company.logo}
                    alt={footer?.company?.name || "Mohsin Designs Logo"}
                    loading="lazy"
                    className="object-contain h-full max-w-full hidden dark:block"
                  />
                </div>
              ) : (
                <>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 overflow-hidden border border-white/10">
                    <div className="absolute top-1 left-1 w-8 h-8 rounded-full bg-brand-yellow/80 mix-blend-screen" />
                    <div className="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-brand-blue/80 mix-blend-screen" />
                    <span className="relative font-heading font-extrabold text-white text-xl z-10">{footer?.logoLetter || "M"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-sans font-black text-2xl leading-none tracking-tight text-white uppercase">
                      {footer?.logoText || "MOHSIN"}
                    </span>
                    <span className="font-sans font-bold text-xs tracking-widest text-[var(--cta-accent)] uppercase leading-none mt-1.5">
                      {footer?.logoSub || "DESIGNS"}
                    </span>
                  </div>
                </>
              )}
            </div>
            {(footer?.company?.description || footer?.description) && (
              <RichTextRenderer
                content={footer?.company?.description || footer?.description}
                className="text-xs md:text-sm text-slate-300 dark:text-zinc-300 [&_*]:!text-slate-300 dark:[&_*]:!text-zinc-300 leading-relaxed max-w-xs font-medium"
                stripParagraphs
              />
            )}
            
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center gap-2 text-[9px] font-mono tracking-widest text-slate-300 dark:text-zinc-400">
                {footer?.studioStatus}
              </div>
              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-400 tracking-wider">
                {footer?.coordinates}
              </span>
            </div>
 
            {/* Social Icons */}
            <div className="flex gap-3 pt-2">
              {socialLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.href}
                  aria-label={link.ariaLabel || link.platform}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-[var(--cta-accent)] hover:text-[#080710] hover:border-[var(--cta-accent)] transition-all duration-300 shadow-sm"
                >
                  {link.icon ? <Icon name={link.icon} className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                </a>
              ))}
            </div>
          </div>
 
          {/* Quick Links Column */}
          <div className="lg:col-span-2 min-w-0 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--cta-accent)]">
              {quickLinksTitle}
            </p>
            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-slate-300 dark:text-zinc-300">
              {quickLinks.map((link: any, idx: number) => (
                <li key={idx}>
                  <Link href={link.href || "/"} className="inline-block text-slate-300 dark:text-zinc-300 hover:!text-[var(--cta-accent)] hover:translate-x-1 transition-all duration-200">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div className="lg:col-span-2 min-w-0 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--cta-accent)]">
              {servicesListTitle}
            </p>
            <ul className="space-y-2.5 text-xs md:text-sm font-semibold text-slate-300 dark:text-zinc-300">
              {servicesList.map((item: any, idx: number) => (
                <li key={idx}>
                  <Link href={item.href} className="inline-block text-slate-300 dark:text-zinc-300 hover:!text-[var(--cta-accent)] hover:translate-x-1 transition-all duration-200">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div className="lg:col-span-3 min-w-0 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--cta-accent)]">
              {footer?.labelContactInfo || "Contact Info"}
            </p>
            <ul className="space-y-4 text-xs md:text-sm font-semibold text-slate-300 dark:text-zinc-300">
              <li className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">{footer?.labelEmail || "Email"}</span>
                {contact?.email && (
                  <a href={`mailto:${contact.email}`} className="text-white hover:text-[var(--cta-accent)] transition-colors font-mono break-all xs:break-normal">
                    {contact.email}
                  </a>
                )}
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[8px] font-mono font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">{footer?.labelPhone || "Phone"}</span>
                {contact?.phone && (
                  <a href={`tel:${stripHtml(contact.phone).replace(/[^0-9+]/g, "")}`} className="text-white hover:text-[var(--cta-accent)] transition-colors font-mono break-all xs:break-normal">
                    {stripHtml(contact.phone)}
                  </a>
                )}
              </li>
              {(contact?.address || footer?.valueAddress) && (
                <li className="flex flex-col gap-1">
                  <span className="text-[8px] font-mono font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">{footer?.labelAddress || "Address"}</span>
                  <div className="text-white leading-relaxed [&_a]:!text-white hover:[&_a]:!text-[var(--cta-accent)] [&_a]:underline [&_p]:m-0"><RichTextRenderer content={contact?.address || footer?.valueAddress} className="text-white [&_*]:!text-white hover:[&_a]:!text-[var(--cta-accent)] text-xs md:text-sm" stripParagraphs /></div>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-2 min-w-0 space-y-4 lg:pl-6 lg:border-l lg:border-white/5">
            <p className="font-mono font-bold text-sm uppercase tracking-widest text-[var(--cta-accent)]">
              {footer?.labelNewsletter || "Newsletter"}
            </p>
            <p className="text-xs text-slate-300 dark:text-zinc-300 font-medium leading-relaxed">
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
                    className="w-full bg-transparent px-3 py-2.5 text-base sm:text-xs text-white focus:outline-none placeholder:text-slate-400 dark:placeholder:text-zinc-500 font-medium"
                    placeholder={footer?.newsletterPlaceholder || "Your email"}
                  />
                  <button
                    type="submit"
                    className="bg-brand-blue text-white dark:bg-brand-yellow dark:text-[#080710] px-3.5 flex items-center justify-center hover:bg-[var(--cta-bg-hover)] transition-colors duration-300 cursor-pointer"
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
                  className="block text-xs font-bold text-[var(--cta-accent)]"
                >
                  {footer?.newsletterSuccess || "Subscribed successfully!"}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
 
        </div>
 
      </div>
 
      {/* Full-Width Backdrop Wordmark */}
      {/* The footer is a dark surface in BOTH themes, so the wordmark must be equally visible in both
          (it used to be dimmer in dark mode: 6% white fill / 12% outline on near-black). Accent =
          soft blue on the navy light-mode footer, brand yellow in dark mode. */}
      <div className="select-none text-center pointer-events-none mt-12 md:mt-20 mb-6 overflow-hidden w-full px-4 pb-[0.08em] relative z-0 [--wm-accent:#A6B8FF] dark:[--wm-accent:#E9BD36]">
        <motion.span
          className="font-sans font-black text-[7.8vw] leading-[1.05] tracking-tighter uppercase flex flex-nowrap justify-center w-full whitespace-nowrap"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.01 }}
          aria-label={wordmarkText}
        >
          {wordmarkLetters.map((letter, idx) => (
            <motion.span
              key={idx}
              variants={letterVariants}
              aria-hidden="true"
              style={{
                // Vertical fade: solid accent at the cap line, dissolving toward the baseline.
                backgroundImage: "linear-gradient(to bottom, var(--wm-accent) 0%, color-mix(in srgb, var(--wm-accent) 8%, transparent) 100%)",
                backgroundRepeat: "no-repeat",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
              }}
              className="inline-block text-transparent [-webkit-text-stroke:1.5px_color-mix(in_srgb,var(--wm-accent)_55%,transparent)] transition-transform duration-300 cursor-default hover:scale-110 hover:[-webkit-text-stroke:1.5px_var(--wm-accent)] pointer-events-auto"
            >
              {letter === " " ? "\u00A0" : letter}
            </motion.span>
          ))}
        </motion.span>
      </div>
 
      {/* Bottom Bar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12 relative z-10 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-white/5">
        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-widest text-center md:text-left">
          {footer?.copyrightPrefix || "©"}{currentYear}{footer?.copyrightSuffix || " Mohsin Designs. All rights reserved."}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-between md:justify-end">
          <div className="flex gap-4 sm:gap-6 text-[10px] font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
            <Link href={footer?.privacyHref || "/privacy"} className="text-slate-400 dark:text-zinc-400 hover:!text-[var(--cta-accent)] transition-colors">{footer?.privacyText || "Privacy Policy"}</Link>
            <span>{footer?.linkSeparator || "| "}</span>
            <Link href={footer?.termsHref || "/terms"} className="text-slate-400 dark:text-zinc-400 hover:!text-[var(--cta-accent)] transition-colors">{footer?.termsText || "Terms & Conditions"}</Link>
          </div>
 
          <button
            onClick={scrollToTop}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-[var(--cta-accent)] hover:text-[#080710] hover:border-[var(--cta-accent)] transition-all duration-300 cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            aria-label={footer?.ariaScrollTop || "Scroll to Top"}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}