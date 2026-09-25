"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus, Trash2, Loader2, Image as ImageIcon,
   LayoutTemplate, Type, Settings, Star,
   CheckCircle2, List, CircleHelp, Mail, Briefcase,
   ChevronRight, X, MapPin, Globe
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import BlogSelector from "@/components/admin/BlogSelector";
import { AVAILABLE_COUNTRIES, resolveCountryLocation, COUNTRIES_DATABASE } from "@/lib/countryLocations";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
   ssr: false,
   loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
   ssr: false,
   loading: () => <div className="h-40 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading editor...</div>
});
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";

// ── Defaults the LIVE page falls back to when a list was never saved ─────────────────────────
// The editor must show exactly what the page shows, and every edit must start from that same list
// (otherwise the first edit of an unsaved default entry wrote a sparse array with holes, which the
// page then crashed on).
const DEFAULT_TRUSTED_LOGOS = [
   { name: "Google Cloud", sub: "Enterprise Partner", image: "" },
   { name: "Shopify Plus", sub: "Commerce Tier", image: "" },
   { name: "Stripe", sub: "Verified Partner", image: "" },
   { name: "Vercel", sub: "Deployment Fleet", image: "" },
   { name: "AWS", sub: "Cloud Infrastructure", image: "" },
   { name: "Meta", sub: "Performance Ad Hub", image: "" },
   { name: "HubSpot", sub: "Inbound Solutions", image: "" },
   { name: "Webflow", sub: "Visual Engine", image: "" }
];

const DEFAULT_INDUSTRIES = [
   { title: "Home Services & Contracting", desc: "Roofing, decking, remodeling, and local trade contractors scaling regional territories.", iconName: "Building2", watermark: "HS" },
   { title: "Technology & SaaS", desc: "Fast-growth software startups and tech firms demanding high conversion rates.", iconName: "Cpu", watermark: "TS" },
   { title: "Commercial Real Estate", desc: "Property developers, architectural firms, and luxury real estate agencies.", iconName: "Building2", watermark: "CR" },
   { title: "E-Commerce & Retail", desc: "Direct-to-consumer and B2B brands scaling transactions with seamless checkout.", iconName: "ShoppingCart", watermark: "EC" },
   { title: "Professional Services", desc: "Law firms, financial consultancies, and executive agencies building trust.", iconName: "Briefcase", watermark: "PS" },
   { title: "Healthcare & Wellness", desc: "Clinics, medical practices, and private health facilities seeking patient acquisition.", iconName: "Heart", watermark: "HW" }
];

// The only icons IndustriesSection can draw (its own iconMap). The old free-form icon picker offered
// every Lucide icon, and any pick outside this list silently rendered a fallback icon instead.
const INDUSTRY_ICONS = ["Building2", "Cpu", "Globe", "ShoppingCart", "Briefcase", "Heart", "Star", "TrendingUp", "Target", "ShieldCheck", "Zap", "Monitor", "Search", "PenTool", "Palette", "BarChart2"];

const DEFAULT_WHY_REASONS = [
   { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles" },
   { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal" },
   { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap" },
   { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp" },
   { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake" }
];

// AboutOwner shows these when the About tab never saved a buttons / stats list, so the editor lists them too.
const DEFAULT_ABOUT_BUTTONS = [{ text: "Let's Collaborate", href: "/contact-us", icon: "ArrowUpRight", primary: false }];
const DEFAULT_ABOUT_STATS = [
   { value: 12, suffix: "+", label: "Years Experience" },
   { value: 150, suffix: "+", label: "Brands Scaled" },
   { value: 99, suffix: "%", label: "Success Rate" }
];

// The featured-services picker returns whole service records (heroes, FAQs, pricing...). Only a
// reference is stored: the homepage always resolves title / description / image from the LIVE catalog,
// so a renamed service or a new image in Admin > Services shows up without re-picking it here.
const slimService = (s: any) => {
   const out: any = { _id: s._id, id: s.id, slug: s.slug, title: s.title, tagline: s.tagline, category: s.category || s.tag, icon: s.icon };
   Object.keys(out).forEach((k) => out[k] === undefined && delete out[k]);
   return out;
};

// Every text the ContactForm component renders that the tab did not expose before (labels, placeholders,
// validation errors, the success message). A blank field falls back to the default shown as placeholder.
const CONTACT_FORM_TEXT_FIELDS: { key: string; label: string; placeholder: string }[] = [
   { key: "labelName", label: "Name Field Label", placeholder: "Full Name" },
   { key: "placeholderName", label: "Name Field Placeholder", placeholder: "e.g. John Doe" },
   { key: "errorName", label: "Name Error Message", placeholder: "Please enter your full name" },
   { key: "labelEmail", label: "Email Field Label", placeholder: "Work Email" },
   { key: "placeholderEmail", label: "Email Field Placeholder", placeholder: "john@company.com" },
   { key: "errorEmailRequired", label: "Email Missing Error", placeholder: "Email address is required" },
   { key: "errorEmailInvalid", label: "Email Invalid Error", placeholder: "Please enter a valid email address" },
   { key: "labelPhone", label: "Phone Field Label", placeholder: "Phone Number" },
   { key: "placeholderPhone", label: "Phone Field Placeholder", placeholder: "+1 (555) 000-0000" },
   { key: "errorPhone", label: "Phone Error Message", placeholder: "Please enter your phone number" },
   { key: "labelService", label: "Service Dropdown Label", placeholder: "Service Interested In" },
   { key: "placeholderService", label: "Service Dropdown Placeholder", placeholder: "Select a service (optional)" },
   { key: "labelMessage", label: "Message Field Label", placeholder: "Project Details / Message" },
   { key: "placeholderMessage", label: "Message Field Placeholder", placeholder: "Tell us about your project goals, scope, and timeline..." },
   { key: "errorMessage", label: "Message Error", placeholder: "Please write a message" },
   { key: "successParagraph1", label: "Success Text - Before Name", placeholder: "Thank you," },
   { key: "successParagraph2", label: "Success Text - After Name", placeholder: ". We have received your inquiry and will respond within 2 business hours." },
   { key: "btnSendAnother", label: "Send Another Button", placeholder: "Send Another Message" },
];

// Testimonials distributes reviews over 3 marquee rows by their "column" (falling back to thirds) and, if a
// row is STILL empty, fills it with built-in sample reviews (invented names). Mirrors that logic so the
// editor can warn before fake reviews appear on the live page.
function reviewRowsUseSamples(list: any[]): boolean {
   const items = list.map((t: any, idx: number) => ({ column: t?.column || (idx % 3) + 1 }));
   const n = items.length;
   const rows = [1, 2, 3].map((c) => items.filter((t) => t.column === c));
   if (rows[0].length === 0) rows[0] = items.slice(0, Math.ceil(n / 3));
   if (rows[1].length === 0) rows[1] = items.slice(Math.ceil(n / 3), Math.ceil((n * 2) / 3));
   if (rows[2].length === 0) rows[2] = items.slice(Math.ceil((n * 2) / 3));
   return rows.some((r) => r.length === 0);
}

// Same resolution HowWeWork uses: saved "reasons", else legacy "features", else the built-in steps.
function getEffectiveReasons(why: any): any[] {
   if (Array.isArray(why?.reasons) && why.reasons.length > 0) return why.reasons;
   if (Array.isArray(why?.features) && why.features.length > 0) {
      return why.features.map((f: any, idx: number) => ({
         num: String(idx + 1).padStart(2, "0"),
         title: f.title,
         desc: f.description,
         iconName: f.icon || "Sparkles"
      }));
   }
   return DEFAULT_WHY_REASONS;
}

// Comma-separated list input. Keeps the raw text in local state while typing: re-deriving the text
// from the parsed array on every keystroke re-inserted the ", " separator, so a trailing comma
// could never be deleted and empty entries were saved as blank ticker items.
function CommaListInput({ value, onChange, className, placeholder }: { value: string[]; onChange: (list: string[]) => void; className?: string; placeholder?: string }) {
   const asList = (v: any): string[] => (Array.isArray(v) ? v : []);
   const [text, setText] = useState(() => asList(value).join(", "));
   const lastEmitted = useRef(JSON.stringify(asList(value)));
   useEffect(() => {
      // Only resync when the list changed from OUTSIDE this input (e.g. the initial prefill).
      const incoming = JSON.stringify(asList(value));
      if (incoming !== lastEmitted.current) {
         lastEmitted.current = incoming;
         setText(asList(value).join(", "));
      }
   }, [value]);
   return (
      <input
         type="text"
         value={text}
         className={className}
         placeholder={placeholder}
         onChange={(e) => {
            setText(e.target.value);
            const list = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
            lastEmitted.current = JSON.stringify(list);
            onChange(list);
         }}
      />
   );
}

// Sections that belong to the Home / location-page templates. On first open of an empty page the
// editor prefills from the site's saved content, but ONLY these keys: copying the whole
// complete_data snapshot (settings, loader, hours, images, quickQuote, aboutPage, leadership, faq...)
// left stale duplicates of global data on the page document that then shadowed later edits.
const PREFILL_KEYS = ["hero", "trustedBrands", "videoTestimonials", "about", "industries", "portfolio", "testimonials", "whyChooseUs", "serviceArea", "blogSection", "blog", "contact", "quote", "faqs", "faqBadge", "faqTitle", "faqTitleIntro", "faqTitleHighlight", "faqDescription", "strategyAudit"];

export default function HomeEditor({ pageId, data, setData, aboutClean = false }: { pageId: string, data: any, setData: (d: any) => void, aboutClean?: boolean }) {
   const [activeTab, setActiveTab] = useState("hero");

   // Prefill an empty page once. Guarded by a ref: this effect re-runs on every data change, so
   // without the guard it re-fetched in an endless loop whenever the fetched content had no hero.
   const prefilled = useRef(false);
   useEffect(() => {
      if (prefilled.current) return;
      if (data && (!data.hero || Object.keys(data).length === 0)) {
         prefilled.current = true;
         fetch("/api/content?key=complete_data")
            .then(res => res.json())
            .then(resData => {
               const source = resData?.data || resData || {};
               const defaultData: any = {};
               for (const key of PREFILL_KEYS) if (source[key] !== undefined) defaultData[key] = source[key];
               setData((prev: any) => ({
                  ...defaultData,
                  ...(prev || {}),
               }));
            })
            .catch(() => {
               // Offline / API error: start from an empty hero override (blank fields fall back to the
               // site's own hero) instead of the old skeleton, which also created a blank hero button.
               setData((prev: any) => ({ hero: {}, ...(prev || {}) }));
            });
      }
   }, [data, setData]);

   if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

   const updateSection = (section: string | null, field: string | null, value: any) => {
      setData((prev: any) => {
         const currentData = prev || {};

         if (!section) {
            let newValue = value;
            if (typeof value === 'function') {
               newValue = value(currentData[field as string]);
            }
            return { ...currentData, [field as string]: newValue };
         }

         const sectionData = currentData[section] || {};
         let newValue = value;
         if (typeof value === 'function') {
            const currentValue = field ? sectionData[field] : sectionData;
            newValue = value(currentValue);
         }

         if (field) {
            return {
               ...currentData,
               [section]: {
                  ...sectionData,
                  [field]: newValue
               }
            };
         }
         return {
            ...currentData,
            [section]: newValue
         };
      });
   };

   // What the live page renders for each list (see the DEFAULT_* notes above): every handler below
   // edits THIS list, so touching a default entry materialises the whole default set instead of a sparse array.
   const trustedLogos: any[] = Array.isArray(data.trustedBrands?.logos) && data.trustedBrands.logos.length > 0 ? data.trustedBrands.logos : DEFAULT_TRUSTED_LOGOS;
   const industryList: any[] = Array.isArray(data.industries?.list) && data.industries.list.length > 0 ? data.industries.list : DEFAULT_INDUSTRIES;
   // Reviews: only what is really saved. (The list used to start with the 9 built-in SAMPLE reviews, so the
   // first "Add Review Card" silently saved nine invented testimonials as real content - on location pages
   // that also published a section which would otherwise stay hidden.)
   const reviewList: any[] = Array.isArray(data.testimonials?.list) ? data.testimonials.list : [];
   const aboutButtons: any[] = Array.isArray(data.about?.buttons) ? data.about.buttons : DEFAULT_ABOUT_BUTTONS;
   const aboutStats: any[] = Array.isArray(data.about?.stats) ? data.about.stats : DEFAULT_ABOUT_STATS;

   const tabs = [
      { id: "hero", label: "Hero" },
      { id: "trustedBrands", label: "Trusted Brands" },
      { id: "videoTestimonials", label: "Video Testimonials" },
      { id: "about", label: "About" },
      { id: "services", label: "Services" },
      { id: "industries", label: "Industries" },
      { id: "portfolio", label: "Work" },
      { id: "testimonials", label: "Reviews" },
      { id: "whyChooseUs", label: "Value Props" },
      { id: "serviceArea", label: "Global Coverage" },
      { id: "blog", label: "Blog" },
      { id: "faqs", label: "FAQs" },
      { id: "quote", label: "Contact Form" },
   ];

   return (
      <div className="bg-white max-w-3xl mx-auto pb-20">
         {/* WP Tabs */}
         <div className="flex flex-wrap items-center gap-1 mb-10 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
            {tabs.map((tab: any, idx: number) => (
               <React.Fragment key={tab.id}>
                  <button
                     onClick={() => setActiveTab(tab.id)}
                     className={`px-1 py-1 transition-colors ${activeTab === tab.id ? 'text-[#1d2327] font-bold border-b-2 border-[#2271b1]' : 'text-[#2271b1] hover:text-[#135e96]'}`}
                  >
                     {tab.label}
                  </button>
                  {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
               </React.Fragment>
            ))}
         </div>

         <AnimatePresence mode="wait">
            <motion.div
               key={activeTab}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
               className="space-y-12"
            >
               {/* HERO SECTION */}
               {activeTab === "hero" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Hero Section Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.hero?.enabled !== false}
                           onChange={(v) => updateSection("hero", "enabled", v)}
                           label="Hero Section"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Branding</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.hero?.badge ?? data.hero?.badgeText ?? ""} onChange={(e) => updateSection("hero", "badge", e.target.value)} className={UI.input} placeholder="Trusted by 3,000+ US Businesses" /></div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Premium Hero Title</h3>
                        <div className="space-y-4">
                           <div className="space-y-1.5"><label className={UI.label}>Title Line 1</label><input type="text" value={data.hero?.titleLine1 || ""} onChange={(e) => updateSection("hero", "titleLine1", e.target.value)} className={UI.input} placeholder="Digital Marketing & Design" /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Title Connector (e.g. "with")</label><input type="text" value={data.hero?.titleConnector || ""} onChange={(e) => updateSection("hero", "titleConnector", e.target.value)} className={UI.input} placeholder="(optional) e.g. with" /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Title Line 2 (Highlighted/Underlined)</label><input type="text" value={data.hero?.titleLine2 || ""} onChange={(e) => updateSection("hero", "titleLine2", e.target.value)} className={UI.input} placeholder="Built to Grow Your Brand" /></div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <RichTextEditor
                           label="3. Description Narrative"
                           content={data.hero?.description || ""}
                           onChange={(html) => updateSection("hero", "description", html)}
                           placeholder="High-performance digital engineering, branding, SEO, and web design."
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>4. Buttons</h3>
                        <div className="space-y-4">
                           {((Array.isArray(data.hero?.buttons) && data.hero.buttons.length > 0)
                              ? data.hero.buttons
                              : [
                                 { text: data.hero?.ctaPrimaryText || "Get Estimate", href: data.hero?.ctaPrimaryHref || "/contact-us", icon: "ArrowRight", primary: true },
                                 { text: data.hero?.ctaSecondaryText || "Our Services", href: data.hero?.ctaSecondaryHref || "/services", icon: "ArrowUpRight", primary: false }
                              ]
                           ).map((btn: any, i: number) => {
                              const heroButtons = (Array.isArray(data.hero?.buttons) && data.hero.buttons.length > 0)
                                 ? data.hero.buttons
                                 : [
                                    { text: data.hero?.ctaPrimaryText || "Get Estimate", href: data.hero?.ctaPrimaryHref || "/contact-us", icon: "ArrowRight", primary: true },
                                    { text: data.hero?.ctaSecondaryText || "Our Services", href: data.hero?.ctaSecondaryHref || "/services", icon: "ArrowUpRight", primary: false }
                                 ];

                              return (
                                 <div key={i} className={UI.card + " space-y-4"}>
                                    <div className="space-y-1.5">
                                       <label className={UI.label}>Text / Label</label>
                                       <input
                                          type="text"
                                          value={btn.text ?? btn.label ?? ""}
                                          onChange={(e) => {
                                             const newB = [...heroButtons];
                                             newB[i] = { ...newB[i], text: e.target.value };
                                             updateSection("hero", "buttons", newB);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. Get Estimate"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className={UI.label}>Link (href)</label>
                                       <input
                                          type="text"
                                          value={btn.href ?? btn.link ?? ""}
                                          onChange={(e) => {
                                             const newB = [...heroButtons];
                                             newB[i] = { ...newB[i], href: e.target.value };
                                             updateSection("hero", "buttons", newB);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. /contact-us"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className={UI.label}>Icon Name</label>
                                       <input
                                          type="text"
                                          value={btn.icon ?? btn.iconName ?? ""}
                                          onChange={(e) => {
                                             const newB = [...heroButtons];
                                             newB[i] = { ...newB[i], icon: e.target.value };
                                             updateSection("hero", "buttons", newB);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. ArrowRight, ArrowUpRight, Phone"
                                       />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer text-[12px]">
                                       <input
                                          type="checkbox"
                                          checked={btn.primary !== undefined ? btn.primary : i === 0}
                                          onChange={(e) => {
                                             const newB = [...heroButtons];
                                             newB[i] = { ...newB[i], primary: e.target.checked };
                                             updateSection("hero", "buttons", newB);
                                          }}
                                       />
                                       Primary Style
                                    </label>
                                    <button
                                       onClick={() => {
                                          const newB = heroButtons.filter((_: any, idx: number) => idx !== i);
                                          updateSection("hero", "buttons", newB);
                                       }}
                                       className="text-[#d63638] text-[11px] font-bold"
                                    >
                                       Remove Button
                                    </button>
                                 </div>
                              );
                           })}
                           <button
                              onClick={() => {
                                 const heroButtons = (Array.isArray(data.hero?.buttons) && data.hero.buttons.length > 0)
                                    ? data.hero.buttons
                                    : [
                                       { text: data.hero?.ctaPrimaryText || "Get Estimate", href: data.hero?.ctaPrimaryHref || "/contact-us", icon: "ArrowRight", primary: true },
                                       { text: data.hero?.ctaSecondaryText || "Our Services", href: data.hero?.ctaSecondaryHref || "/services", icon: "ArrowUpRight", primary: false }
                                    ];
                                 updateSection("hero", "buttons", [...heroButtons, { text: "", href: "", primary: heroButtons.length === 0, icon: "ArrowRight" }]);
                              }}
                              className={UI.buttonAdd}
                           >
                              + Add Button
                           </button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>5. Showcase / Hero Image</h3>
                        <ImageField
                           label="Hero Showcase Image"
                           value={data.hero?.image || data.hero?.imageSrc || data.hero?.images?.[0] || data.hero?.bgImage || ""}
                           onChange={(url) => {
                              updateSection("hero", "image", url);
                              updateSection("hero", "imageSrc", url);
                              updateSection("hero", "bgImage", url);
                              updateSection("hero", "images", [url]);
                           }}
                           altValue={data.hero?.imageAlt || data.hero?.bgImageAlt || ""}
                           onAltChange={(alt) => {
                              updateSection("hero", "imageAlt", alt);
                              updateSection("hero", "bgImageAlt", alt);
                           }}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>6. Interactive Elements</h3>
                        <div className="space-y-4">
                           <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Text</label><input type="text" value={data.hero?.circleText || ""} onChange={(e) => updateSection("hero", "circleText", e.target.value)} className={UI.input} placeholder="VETERAN OWNED • VETERAN OPERATED •" /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Center Letter</label><input type="text" value={data.hero?.circleLetter || ""} onChange={(e) => updateSection("hero", "circleLetter", e.target.value)} className={UI.input} placeholder="M" /></div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Marquee Items (Comma separated)</label>
                              <CommaListInput
                                 value={data.hero?.marqueeItems || []}
                                 onChange={(list) => updateSection("hero", "marqueeItems", list)}
                                 className={UI.input}
                                 placeholder="e.g. SEO, Web Design, Branding, Social Media"
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* TRUSTED BRANDS / CLIENT TRUST MARQUEE SECTION */}
               {activeTab === "trustedBrands" && (
                  <div className="space-y-10">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Trusted Brands Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.trustedBrands?.enabled !== false}
                           onChange={(v) => updateSection("trustedBrands", "enabled", v)}
                           label="Trusted Brands"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Badge / Eyebrow</label>
                           <input
                              type="text"
                              value={data.trustedBrands?.badge ?? data.trustedBrands?.eyebrow ?? ""}
                              onChange={(e) => updateSection("trustedBrands", "badge", e.target.value)}
                              className={UI.input}
                              placeholder="02 // CLIENT PROOF"
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Title Intro</label>
                              <input
                                 type="text"
                                 value={data.trustedBrands?.titleIntro !== undefined ? data.trustedBrands.titleIntro : "Trusted by"}
                                 onChange={(e) => updateSection("trustedBrands", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Trusted by"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Title Highlight (Accent/Italic)</label>
                              <input
                                 type="text"
                                 value={data.trustedBrands?.titleHighlight !== undefined ? data.trustedBrands.titleHighlight : "Leading Brands"}
                                 onChange={(e) => updateSection("trustedBrands", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                                 placeholder="e.g. Leading Brands"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description Narrative</label>
                           <RichTextEditor
                              content={data.trustedBrands?.description !== undefined ? data.trustedBrands.description : "Powering innovative market disruptors, scaling enterprises, and high-performance industry leaders worldwide."}
                              onChange={(val) => updateSection("trustedBrands", "description", val)}
                              placeholder="Describe the client proof or partnerships."
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Marquee Animation Speed (Seconds)</label>
                           <input
                              type="number"
                              value={data.trustedBrands?.speed ?? ""}
                              onChange={(e) => updateSection("trustedBrands", "speed", e.target.value === "" ? "" : Number(e.target.value))}
                              className={UI.input + " max-w-xs"}
                              placeholder="28"
                           />
                        </div>
                     </div>

                     <div className="space-y-6 pt-4 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <h3 className={UI.sectionHeader}>2. Brand Logos & Cards</h3>
                           <button
                              type="button"
                              onClick={() => {
                                 updateSection("trustedBrands", "logos", [
                                    ...trustedLogos,
                                    { name: "New Brand", sub: "Strategic Client", image: "", link: "" }
                                 ]);
                              }}
                              className={UI.buttonAdd}
                           >
                              <Plus className="w-3.5 h-3.5" /> Add Brand Logo
                           </button>
                        </div>

                        <div className="space-y-4">
                           {trustedLogos.map((brand: any, bIdx: number) => (
                              <div key={bIdx} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Brand #{bIdx + 1}</span>
                                    <button
                                       type="button"
                                       onClick={() => {
                                          const list = trustedLogos.filter((_: any, i: number) => i !== bIdx);
                                          updateSection("trustedBrands", "logos", list);
                                       }}
                                       className="text-[#d63638] hover:text-[#b32d2e] p-1"
                                    >
                                       <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                 </div>

                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                       <label className={UI.label}>Brand Name</label>
                                       <input
                                          type="text"
                                          value={brand.name || ""}
                                          onChange={(e) => {
                                             const list = [...trustedLogos];
                                             list[bIdx] = { ...list[bIdx], name: e.target.value };
                                             updateSection("trustedBrands", "logos", list);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. Google Cloud"
                                       />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label className={UI.label}>Category / Sub-label</label>
                                       <input
                                          type="text"
                                          value={brand.sub || ""}
                                          onChange={(e) => {
                                             const list = [...trustedLogos];
                                             list[bIdx] = { ...list[bIdx], sub: e.target.value };
                                             updateSection("trustedBrands", "logos", list);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. Enterprise Partner"
                                       />
                                    </div>
                                 </div>

                                 <div className="space-y-1.5">
                                    <label className={UI.label}>Target URL / Website (Optional)</label>
                                    <input
                                       type="text"
                                       value={brand.link || ""}
                                       onChange={(e) => {
                                          const list = [...trustedLogos];
                                          list[bIdx] = { ...list[bIdx], link: e.target.value };
                                          updateSection("trustedBrands", "logos", list);
                                       }}
                                       className={UI.input}
                                       placeholder="e.g. https://google.com"
                                    />
                                 </div>

                                 <ImageField
                                    label="Custom Logo Image (Optional — if blank, matches recognized SVG)"
                                    value={brand.image || ""}
                                    onChange={(url) => {
                                       const list = [...trustedLogos];
                                       list[bIdx] = { ...list[bIdx], image: url };
                                       updateSection("trustedBrands", "logos", list);
                                    }}
                                 />
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               {/* VIDEO TESTIMONIALS SECTION */}
               {activeTab === "videoTestimonials" && (
                  <VideoTestimonialsEditor
                     value={data.videoTestimonials}
                     onChange={(next) => updateSection("videoTestimonials", null, next)}
                  />
               )}

               {/* ABOUT SECTION */}
               {activeTab === "about" && (
                  <div className="space-y-10">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">About Section Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.about?.enabled !== false}
                           onChange={(v) => updateSection("about", "enabled", v)}
                           label="About Section"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Identity</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.about?.badge || ""} onChange={(e) => updateSection("about", "badge", e.target.value)} className={UI.input} placeholder="ABOUT THE OWNER" /></div>
                        <div className="space-y-4">
                           <label className={UI.label}>Headline (Structured)</label>
                           <div className="space-y-2">
                              <input type="text" value={data.about?.headline?.prefix || ""} onChange={(e) => updateSection("about", "headline", { ...(data.about?.headline || {}), prefix: e.target.value })} className={UI.input} placeholder="Leading with Vision, " />
                              <input type="text" value={data.about?.headline?.highlight || ""} onChange={(e) => updateSection("about", "headline", { ...(data.about?.headline || {}), highlight: e.target.value })} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Building with Trust." />

                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <QuillEditor
                           label="2. Brand Narrative"
                           content={data.about?.description || ""}
                           onChange={(html) => updateSection("about", "description", html)}
                        />

                     </div>
                     {!aboutClean && (
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Action Buttons</h3>
                        <p className="text-[11px] text-[#646970] italic -mt-3">Shown under the biography. Buttons with no text are not displayed; remove every button to show none.</p>
                        <div className="space-y-4">
                           {aboutButtons.map((btn: any, i: number) => {
                              const setBtn = (fields: any) => updateSection("about", "buttons", aboutButtons.map((b: any, idx: number) => (idx === i ? { ...b, ...fields } : b)));
                              return (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Button #{i + 1}</span>
                                    <button type="button" aria-label="Remove button" onClick={() => updateSection("about", "buttons", aboutButtons.filter((_: any, idx: number) => idx !== i))} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Text</label><input type="text" value={btn.text || ""} onChange={(e) => setBtn({ text: e.target.value })} className={UI.input} placeholder="e.g. Let's Collaborate" /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Link</label><input type="text" value={btn.href || ""} onChange={(e) => setBtn({ href: e.target.value })} className={UI.input} placeholder="/contact-us" /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Icon Name</label><input type="text" value={btn.icon || ""} onChange={(e) => setBtn({ icon: e.target.value })} className={UI.input} placeholder="e.g. ArrowUpRight, ArrowRight, Phone" /></div>
                                 <label className="flex items-center gap-2 cursor-pointer text-[12px]"><input type="checkbox" checked={btn.primary || false} onChange={(e) => setBtn({ primary: e.target.checked })} /> Primary Style</label>
                              </div>
                              );
                           })}
                           <button type="button" onClick={() => updateSection("about", "buttons", [...aboutButtons, { text: "", href: "", primary: false, icon: "ArrowRight" }])} className={UI.buttonAdd}>+ Add Button</button>
                        </div>
                     </div>
                     )}
                     {!aboutClean && (
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>4. Stats</h3>
                        <p className="text-[11px] text-[#646970] italic -mt-3">The animated counters under the biography. Remove every stat to hide the row.</p>
                        <div className="space-y-4">
                           {aboutStats.map((s: any, i: number) => {
                              const setStat = (fields: any) => updateSection("about", "stats", aboutStats.map((x: any, idx: number) => (idx === i ? { ...x, ...fields } : x)));
                              return (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                                    <button type="button" aria-label="Remove stat" onClick={() => updateSection("about", "stats", aboutStats.filter((_: any, idx: number) => idx !== i))} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value</label><input type="number" min={0} value={s.value ?? 0} onChange={(e) => setStat({ value: Number.isFinite(parseInt(e.target.value)) ? parseInt(e.target.value) : 0 })} className={UI.inputLarge} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Suffix (e.g. +, %)</label><input type="text" value={s.suffix || ""} onChange={(e) => setStat({ suffix: e.target.value })} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Label</label><input type="text" value={s.label || ""} onChange={(e) => setStat({ label: e.target.value })} className={UI.input} /></div>
                              </div>
                              );
                           })}
                           <button type="button" onClick={() => updateSection("about", "stats", [...aboutStats, { value: 0, suffix: "+", label: "" }])} className={UI.buttonAdd}>+ Add Stat</button>
                        </div>
                     </div>
                     )}

                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>5. Media</h3>
                        <ImageField
                           label="Section Image"
                           value={data.about?.image?.src || ""}
                           onChange={(url) => updateSection("about", "image", { ...(data.about?.image || {}), src: url })}
                           altValue={data.about?.image?.alt || ""}
                           onAltChange={(alt) => updateSection("about", "image", { ...(data.about?.image || {}), alt: alt })}
                        />
                        <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Text</label><input type="text" value={data.about?.circleText || ""} onChange={(e) => updateSection("about", "circleText", e.target.value)} className={UI.input} placeholder="CREATIVE POWER • MOHSIN DESIGNS •" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Center Letter</label><input type="text" value={data.about?.circleLetter || ""} onChange={(e) => updateSection("about", "circleLetter", e.target.value)} className={UI.input} placeholder="M" /></div>
                     </div>
                  </div>
               )}

               {/* SERVICES SECTION */}
               {activeTab === "services" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Services Section Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.services?.enabled !== false}
                           onChange={(v) => updateSection("services", "enabled", v)}
                           label="Services Section"
                        />
                     </div>

                     {/* 1. Section Header */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Section Tag (Eyebrow Label)</label><input type="text" value={data.services?.sectionTag || ""} onChange={(e) => updateSection("services", "sectionTag", e.target.value)} className={UI.input} placeholder="OUR SERVICES" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title — Intro (plain)</label><input type="text" value={data.services?.titleIntro || ""} onChange={(e) => updateSection("services", "titleIntro", e.target.value)} className={UI.input} placeholder="What We" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title — Highlight <span className="text-[#2271b1] font-bold">(italic, brand color)</span></label><input type="text" value={data.services?.titleHighlight || ""} onChange={(e) => updateSection("services", "titleHighlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Deliver." /></div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Section Description</label>
                           <RichTextEditor
                              content={typeof data.services?.description === "string" ? data.services.description : (Array.isArray(data.services?.description) ? (data.services.description as string[]).join("") : "")}
                              onChange={(val) => updateSection("services", "description", val)}
                              placeholder="Explore our full suite of premium digital services."
                           />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5"><label className={UI.label}>Prev Arrow Aria Label</label><input type="text" value={data.services?.ariaPrev || ""} onChange={(e) => updateSection("services", "ariaPrev", e.target.value)} className={UI.input} placeholder="Previous service" /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Next Arrow Aria Label</label><input type="text" value={data.services?.ariaNext || ""} onChange={(e) => updateSection("services", "ariaNext", e.target.value)} className={UI.input} placeholder="Next service" /></div>
                        </div>
                        <div className="space-y-1.5"><label className={UI.label}>Card Footer Label (e.g. "SERVICE")</label><input type="text" value={data.services?.serviceLabel || ""} onChange={(e) => updateSection("services", "serviceLabel", e.target.value)} className={UI.input} placeholder="SERVICE" /></div>
                     </div>

                     {/* 2. Service Cards */}
                     <div className="space-y-6 pt-10 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Service Cards</h3>
                        <p className="text-[11px] text-[#646970] italic -mt-3">Select from your existing services. Order can be rearranged after selection. Title, description and image always come from Admin &gt; Services. If nothing is selected, every published service is shown.</p>
                        <ContentSelector
                           type="services"
                           label="Featured Services (shown in carousel)"
                           selectedItems={data.services?.list || []}
                           onSelect={(items) => updateSection("services", "list", items.map(slimService))}
                        />
                     </div>

                     {/* 3. Bottom Services CTA Banner */}
                     <div className="space-y-6 pt-10 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>3. Bottom Services Conversion Banner (CTA)</h3>
                        <p className="text-[11px] text-[#646970] italic -mt-3">Configure the conversion call-to-action banner displayed at the bottom of the services carousel.</p>
                        
                        <div className="space-y-4 bg-[#f8f9fa] p-4 border border-[#c3c4c7] rounded-sm">
                           <div className="space-y-1.5">
                              <label className={UI.label}>CTA Eyebrow Tag</label>
                              <input
                                 type="text"
                                 value={data.services?.ctaEyebrow || ""}
                                 placeholder="STRATEGY & SCOPING"
                                 onChange={(e) => updateSection("services", "ctaEyebrow", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>CTA Headline / Question</label>
                              <input
                                 type="text"
                                 value={data.services?.ctaHeading || ""}
                                 placeholder="Need a Custom Architecture or Specialized Solution?"
                                 onChange={(e) => updateSection("services", "ctaHeading", e.target.value)}
                                 className={UI.input + " font-bold"}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>CTA Description Narrative</label>
                              <RichTextEditor
                                 content={data.services?.ctaDescription || ""}
                                 placeholder="Discuss your technical requirements directly with our principal engineer. We map out full-funnel architectures and execute with pixel perfection."
                                 onChange={(val) => updateSection("services", "ctaDescription", val)}
                              />
                           </div>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className={UI.label}>CTA Button Label</label>
                                 <input
                                    type="text"
                                    value={data.services?.ctaButtonText || ""}
                                    placeholder="Schedule Technical Consultation"
                                    onChange={(e) => updateSection("services", "ctaButtonText", e.target.value)}
                                    className={UI.input}
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className={UI.label}>CTA Button Destination URL</label>
                                 <input
                                    type="text"
                                    value={data.services?.ctaButtonHref || ""}
                                    placeholder="/contact"
                                    onChange={(e) => updateSection("services", "ctaButtonHref", e.target.value)}
                                    className={UI.input}
                                 />
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* HOW WE WORK / WHY CHOOSE US */}
               {activeTab === "whyChooseUs" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Value Props / How We Work Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.whyChooseUs?.enabled !== false}
                           onChange={(v) => updateSection("whyChooseUs", "enabled", v)}
                           label="Value Props"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Badge / Tag</label>
                              <input
                                 type="text"
                                 value={data.whyChooseUs?.sectionTag || data.whyChooseUs?.section?.badge || ""}
                                 onChange={(e) => updateSection("whyChooseUs", "sectionTag", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. HOW WE WORK"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro</label>
                              <input
                                 type="text"
                                 value={data.whyChooseUs?.titleIntro || data.whyChooseUs?.section?.headlinePrefix || ""}
                                 onChange={(e) => updateSection("whyChooseUs", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Engineered For"
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Headline Highlight <span className="text-primary font-bold">(Italic / Highlight color)</span></label>
                           <input
                              type="text"
                              value={data.whyChooseUs?.titleHighlight || data.whyChooseUs?.section?.headlineHighlight || ""}
                              onChange={(e) => updateSection("whyChooseUs", "titleHighlight", e.target.value)}
                              className={UI.input + " font-bold border-[#2271b1]"}
                              placeholder="e.g. Peak Performance"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Intro Subtext</label>
                           <RichTextEditor
                              content={data.whyChooseUs?.subtext || data.whyChooseUs?.section?.description || ""}
                              onChange={(val) => updateSection("whyChooseUs", "subtext", val)}
                              placeholder="e.g. We combine precision design, rock-solid engineering, and conversion strategy to build digital experiences that deliver real, measurable growth."
                           />
                        </div>
                     </div>

                     {/* 2. CIRCULAR STATS */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <h3 className={UI.sectionHeader}>2. Animated Circular Stats (3 Rings)</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {((data.whyChooseUs?.stats && data.whyChooseUs.stats.length > 0)
                              ? data.whyChooseUs.stats
                              : [
                                 { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
                                 { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
                                 { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
                              ]
                           ).slice(0, 3).map((s: any, i: number) => {
                              const currentStats = (data.whyChooseUs?.stats && data.whyChooseUs.stats.length > 0)
                                 ? data.whyChooseUs.stats
                                 : [
                                    { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
                                    { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
                                    { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
                                 ];
                              return (
                                 <div key={i} className={UI.card + " space-y-3 bg-[#f6f7f7]"}>
                                    <span className="text-[11px] font-bold text-[#2271b1] uppercase">Ring Stat #{i + 1}</span>
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e]">Value</label>
                                       <input
                                          type="text"
                                          value={s.value || ""}
                                          onChange={(e) => {
                                             const newS = [...currentStats];
                                             newS[i] = { ...newS[i], value: e.target.value };
                                             updateSection("whyChooseUs", "stats", newS);
                                          }}
                                          className={UI.input + " font-bold text-base"}
                                          placeholder="e.g. 99.8%"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e]">Ring Fill % (0.1 to 1.0)</label>
                                       <input
                                          type="number"
                                          step="0.05"
                                          min="0.1"
                                          max="1.0"
                                          value={s.percentage ?? ""}
                                          onChange={(e) => {
                                             const newS = [...currentStats];
                                             const v = parseFloat(e.target.value);
                                             newS[i] = { ...newS[i], percentage: Number.isFinite(v) ? v : undefined };
                                             updateSection("whyChooseUs", "stats", newS);
                                          }}
                                          className={UI.input}
                                          placeholder="0.85 (default)"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e]">Label</label>
                                       <input
                                          type="text"
                                          value={s.label || ""}
                                          onChange={(e) => {
                                             const newS = [...currentStats];
                                             newS[i] = { ...newS[i], label: e.target.value };
                                             updateSection("whyChooseUs", "stats", newS);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. Satisfaction"
                                       />
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e]">Sublabel</label>
                                       <input
                                          type="text"
                                          value={s.sublabel || ""}
                                          onChange={(e) => {
                                             const newS = [...currentStats];
                                             newS[i] = { ...newS[i], sublabel: e.target.value };
                                             updateSection("whyChooseUs", "stats", newS);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. Verified Reviews"
                                       />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>

                     {/* 3. PROCESS STEPS / REASONS */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <h3 className={UI.sectionHeader}>3. Process Steps & Features</h3>
                           <button
                              onClick={() => {
                                 const currentReasons = getEffectiveReasons(data.whyChooseUs);
                                 const nextNum = String(currentReasons.length + 1).padStart(2, "0");
                                 const newReasons = [...currentReasons, { num: nextNum, title: "New Process Step", desc: "Description here...", iconName: "Sparkles" }];
                                 updateSection("whyChooseUs", "reasons", newReasons);
                              }}
                              className={UI.buttonAdd}
                           >
                              + Add Step
                           </button>
                        </div>
                        <div className="space-y-4">
                           {((data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                              ? data.whyChooseUs.reasons
                              : (data.whyChooseUs?.features && data.whyChooseUs.features.length > 0
                                 ? data.whyChooseUs.features.map((f: any, idx: number) => ({
                                    num: String(idx + 1).padStart(2, "0"),
                                    title: f.title,
                                    desc: f.description,
                                    iconName: f.icon || "Sparkles"
                                 }))
                                 : [
                                    { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles" },
                                    { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal" },
                                    { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap" },
                                    { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp" },
                                    { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake" }
                                 ])
                           ).map((r: any, i: number) => {
                              const currentReasons = (data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                                 ? data.whyChooseUs.reasons
                                 : (data.whyChooseUs?.features && data.whyChooseUs.features.length > 0
                                    ? data.whyChooseUs.features.map((f: any, idx: number) => ({
                                       num: String(idx + 1).padStart(2, "0"),
                                       title: f.title,
                                       desc: f.description,
                                       iconName: f.icon || "Sparkles"
                                    }))
                                    : [
                                       { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles" },
                                       { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal" },
                                       { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap" },
                                       { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp" },
                                       { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake" }
                                    ]);
                              return (
                                 <div key={i} className={UI.card + " space-y-4"}>
                                    <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                       <span className="text-[12px] font-bold text-[#1d2327]">Step #{i + 1} ({r.num || `0${i + 1}`})</span>
                                       <button
                                          onClick={() => {
                                             const newR = currentReasons.filter((_: any, idx: number) => idx !== i);
                                             updateSection("whyChooseUs", "reasons", newR);
                                          }}
                                          className="text-[#d63638] hover:opacity-80 p-1"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                       </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                       <div className="space-y-1">
                                          <label className="text-[11px] font-bold text-[#50575e]">Number Prefix</label>
                                          <input
                                             type="text"
                                             value={r.num || ""}
                                             onChange={(e) => {
                                                const newR = [...currentReasons];
                                                newR[i] = { ...newR[i], num: e.target.value };
                                                updateSection("whyChooseUs", "reasons", newR);
                                             }}
                                             className={UI.input + " font-mono font-bold"}
                                             placeholder="e.g. 01"
                                          />
                                       </div>
                                       <div className="space-y-1 md:col-span-2">
                                          <label className="text-[11px] font-bold text-[#50575e]">Title</label>
                                          <input
                                             type="text"
                                             value={r.title || ""}
                                             onChange={(e) => {
                                                const newR = [...currentReasons];
                                                newR[i] = { ...newR[i], title: e.target.value };
                                                updateSection("whyChooseUs", "reasons", newR);
                                             }}
                                             className={UI.input + " font-bold"}
                                             placeholder="e.g. Strategy & Architecture"
                                          />
                                       </div>
                                    </div>
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e]">Icon</label>
                                       <select
                                          value={r.iconName || r.icon || "Sparkles"}
                                          onChange={(e) => {
                                             const newR = [...currentReasons];
                                             newR[i] = { ...newR[i], iconName: e.target.value, icon: e.target.value };
                                             updateSection("whyChooseUs", "reasons", newR);
                                          }}
                                          className={UI.input}
                                       >
                                          <option value="Sparkles">Sparkles (Strategy / Creativity)</option>
                                          <option value="Terminal">Terminal (Coding / Architecture)</option>
                                          <option value="Zap">Zap (Performance / Speed)</option>
                                          <option value="TrendingUp">TrendingUp (Growth / Conversion)</option>
                                          <option value="HeartHandshake">HeartHandshake (Support / Partnership)</option>
                                          <option value="Rocket">Rocket (Launch)</option>
                                          <option value="Paintbrush">Paintbrush (Design)</option>
                                          <option value="Shield">Shield (Security / Quality)</option>
                                          <option value="Search">Search (SEO / Analytics)</option>
                                          <option value="Users">Users (User Experience)</option>
                                          <option value="Award">Award (Excellence)</option>
                                       </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-[#50575e]">Description</label>
                                        <RichTextEditor
                                           content={r.desc || r.description || ""}
                                           onChange={(val) => {
                                              const newR = [...currentReasons];
                                              newR[i] = { ...newR[i], desc: val, description: val };
                                              updateSection("whyChooseUs", "reasons", newR);
                                           }}
                                           placeholder="Detailed description of this step..."
                                        />
                                     </div>
                                    <div className="space-y-1 pt-2 border-t border-[#f0f0f1]">
                                       <ImageField
                                          label="Step Image (Replaces SVG)"
                                          value={r.image || ""}
                                          onChange={(url) => {
                                             const newR = [...currentReasons];
                                             newR[i] = { ...newR[i], image: url };
                                             updateSection("whyChooseUs", "reasons", newR);
                                          }}
                                          description="Upload or choose an image for this workflow step from the Media Library"
                                       />
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               )}

               {/* GLOBAL SERVICE AREA / MAP */}
               {activeTab === "serviceArea" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Global Coverage / Service Area Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.serviceArea?.enabled !== false}
                           onChange={(v) => updateSection("serviceArea", "enabled", v)}
                           label="Global Coverage"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Badge / Tag</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.sectionTag || ""}
                                 placeholder="GLOBAL COVERAGE"
                                 onChange={(e) => updateSection("serviceArea", "sectionTag", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.titleIntro || ""}
                                 placeholder="Serving Clients"
                                 onChange={(e) => updateSection("serviceArea", "titleIntro", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Headline Highlight <span className="text-primary font-bold">(Italic / Highlight color)</span></label>
                           <input
                              type="text"
                              value={data.serviceArea?.titleHighlight || ""}
                              placeholder="Worldwide"
                              onChange={(e) => updateSection("serviceArea", "titleHighlight", e.target.value)}
                              className={UI.input + " font-bold border-[#2271b1]"}
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Intro Description</label>
                           <RichTextEditor
                              content={data.serviceArea?.description || ""}
                              onChange={(val) => updateSection("serviceArea", "description", val)}
                              placeholder="e.g. With distributed engineering hubs and round-the-clock availability, we partner with industry leaders across North America, Europe, the Middle East, and Asia-Pacific."
                           />
                        </div>
                     </div>

                     {/* 2. CTA BUTTON */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Call to Action Button</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Button Text</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.ctaText || ""}
                                 placeholder="Schedule Global Consultation"
                                 onChange={(e) => updateSection("serviceArea", "ctaText", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Button Link</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.ctaHref || ""}
                                 placeholder="#contact"
                                 onChange={(e) => updateSection("serviceArea", "ctaHref", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                     </div>

                     {/* 3. GLOBAL HUBS (AUTO-PINNED TO REAL WORLD MAP) */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <div>
                              <h3 className={UI.sectionHeader}>3. Active Global Operating Locations (Countries & States)</h3>
                              <p className="text-xs text-[#646970]">Choose or type any country or US/global state. Real GPS coordinates are automatically mapped to the interactive live globe. Add custom specialties, timezones, and page navigation links.</p>
                           </div>
                           <button
                              onClick={() => {
                                 const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                                    ? data.serviceArea.hubs
                                    : [
                                       { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                       { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                       { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                       { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" },
                                       { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", link: "/locations" },
                                       { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", link: "/locations" },
                                       { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", link: "/locations" },
                                       { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", link: "/locations" },
                                       { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", link: "/locations" },
                                       { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", link: "/locations" },
                                       { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST", link: "/locations" },
                                       { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", link: "/locations" }
                                    ];
                                 const newHub = { id: `hub-${Date.now()}`, name: "California, USA", focus: "Innovation Hub", timezone: "PST", link: "/locations" };
                                 updateSection("serviceArea", "hubs", [...currentHubs, newHub]);
                              }}
                              className={UI.buttonAdd}
                           >
                              + Add Operating Location
                           </button>
                        </div>

                        <div className="space-y-4">
                           {((data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                              ? data.serviceArea.hubs
                              : [
                                 { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                 { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                 { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                 { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" },
                                 { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", link: "/locations" },
                                 { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", link: "/locations" },
                                 { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", link: "/locations" },
                                 { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", link: "/locations" },
                                 { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", link: "/locations" },
                                 { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", link: "/locations" },
                                 { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST", link: "/locations" },
                                 { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", link: "/locations" }
                              ]
                           ).map((hub: any, hIdx: number) => {
                              const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                                 ? data.serviceArea.hubs
                                 : [
                                    { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                    { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                    { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                    { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" },
                                    { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", link: "/locations" },
                                    { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", link: "/locations" },
                                    { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", link: "/locations" },
                                    { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", link: "/locations" },
                                    { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", link: "/locations" },
                                    { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", link: "/locations" },
                                    { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST", link: "/locations" },
                                    { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", link: "/locations" }
                                 ];
                              const geo = resolveCountryLocation(hub.name);

                              return (
                                 <div key={hIdx} className={UI.card + " space-y-3 bg-[#f6f7f7] border border-[#dcdcde]"}>
                                    <div className="flex justify-between items-center pb-2 border-b border-[#e2e4e7]">
                                       <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4 text-[#2271b1]" />
                                          <span className="text-[13px] font-bold text-[#1d2327]">{hub.name || `Location #${hIdx + 1}`}</span>
                                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                             📍 Auto-Geolocated ({geo.region})
                                          </span>
                                          {hub.link && (
                                             <span className="text-[10px] bg-blue-50 text-[#2271b1] border border-blue-200 px-2 py-0.5 rounded font-mono truncate max-w-[200px]">
                                                🔗 {hub.link}
                                             </span>
                                          )}
                                       </div>
                                       <button
                                          onClick={() => {
                                             const newHubs = currentHubs.filter((_: any, i: number) => i !== hIdx);
                                             updateSection("serviceArea", "hubs", newHubs);
                                          }}
                                          className="text-[#d63638] hover:opacity-80 p-1 flex items-center gap-1 text-xs font-semibold"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                          Remove
                                       </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Country / State Name</label>
                                          <input
                                             list={`countries-list-${hIdx}`}
                                             type="text"
                                             value={hub.name || ""}
                                             onChange={(e) => {
                                                const countryVal = e.target.value;
                                                const newHubs = [...currentHubs];
                                                const autoGeo = resolveCountryLocation(countryVal);
                                                newHubs[hIdx] = {
                                                   ...newHubs[hIdx],
                                                   name: countryVal,
                                                   timezone: newHubs[hIdx].timezone || autoGeo.timezone
                                                };
                                                updateSection("serviceArea", "hubs", newHubs);
                                             }}
                                             className={UI.input + " font-bold"}
                                             placeholder="e.g. California, USA or Germany"
                                          />
                                          <datalist id={`countries-list-${hIdx}`}>
                                             {AVAILABLE_COUNTRIES.map((c) => (
                                                <option key={c} value={c} />
                                             ))}
                                          </datalist>
                                       </div>

                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Specialty / Focus</label>
                                          <input
                                             type="text"
                                             value={hub.focus || ""}
                                             onChange={(e) => {
                                                const newHubs = [...currentHubs];
                                                newHubs[hIdx] = { ...newHubs[hIdx], focus: e.target.value };
                                                updateSection("serviceArea", "hubs", newHubs);
                                             }}
                                             className={UI.input}
                                             placeholder="e.g. Architecture & Design"
                                          />
                                       </div>

                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Timezone Badge</label>
                                          <input
                                             type="text"
                                             value={hub.timezone || geo.timezone || ""}
                                             onChange={(e) => {
                                                const newHubs = [...currentHubs];
                                                newHubs[hIdx] = { ...newHubs[hIdx], timezone: e.target.value };
                                                updateSection("serviceArea", "hubs", newHubs);
                                             }}
                                             className={UI.input + " font-mono"}
                                             placeholder="e.g. PST, EST, GMT, CET"
                                          />
                                       </div>

                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Navigation Link (URL)</label>
                                          <input
                                             type="text"
                                             value={hub.link || ""}
                                             onChange={(e) => {
                                                const newHubs = [...currentHubs];
                                                newHubs[hIdx] = { ...newHubs[hIdx], link: e.target.value };
                                                updateSection("serviceArea", "hubs", newHubs);
                                             }}
                                             className={UI.input}
                                             placeholder="e.g. /locations/california or #contact"
                                          />
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </div>
               )}

                {/* INDUSTRIES SECTION */}
                {activeTab === "industries" && (
                   <div className="space-y-12">
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                         <div>
                            <h2 className="text-base font-bold text-[#1d2327]">Industries Section Visibility</h2>
                            <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                         </div>
                         <SectionToggle
                            enabled={data.industries?.enabled !== false}
                            onChange={(v) => updateSection("industries", "enabled", v)}
                            label="Industries Section"
                         />
                      </div>
                      <div className="space-y-6">
                         <h3 className={UI.sectionHeader}>1. Section Intro & Narrative</h3>
                         <div className="space-y-1.5">
                            <label className={UI.label}>Badge / Eyebrow</label>
                            <input
                               type="text"
                               value={data.industries?.eyebrow || ""}
                               placeholder="08 // SECTORS WE ACCELERATE"
                               onChange={(e) => updateSection("industries", "eyebrow", e.target.value)}
                               className={UI.input}
                            />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className={UI.label}>Headline Intro</label>
                               <input
                                  type="text"
                                  value={data.industries?.titleIntro !== undefined ? data.industries.titleIntro : "Industries"}
                                  placeholder="(leave empty for no intro word)"
                                  onChange={(e) => updateSection("industries", "titleIntro", e.target.value)}
                                  className={UI.input}
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className={UI.label}>Headline Highlight (Accent)</label>
                               <input
                                  type="text"
                                  value={data.industries?.titleHighlight || ""}
                                  placeholder="We Specialize In"
                                  onChange={(e) => updateSection("industries", "titleHighlight", e.target.value)}
                                  className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                               />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className={UI.label}>Section Description</label>
                            <RichTextEditor
                               content={data.industries?.description || ""}
                               placeholder="Every industry has distinct compliance, customer acquisition funnels, and technical requirements. We tailor our engineering to your exact vertical."
                               onChange={(val: string) => updateSection("industries", "description", val)}
                            />
                         </div>
                      </div>

                      <div className="space-y-6 border-t border-[#f0f0f1] pt-10">
                         <div className="flex items-center justify-between">
                            <h3 className={UI.sectionHeader}>2. Industry Sector Cards</h3>
                            <button
                               type="button"
                               onClick={() => {
                                  updateSection("industries", "list", [
                                     ...industryList,
                                     { title: "New Industry Sector", desc: "Specialized vertical capability tailored for growth.", iconName: "Building2", watermark: "IS", link: "" }
                                  ]);
                               }}
                               className={UI.buttonAdd}
                            >
                               <Plus className="w-3 h-3" /> Add Industry Card
                            </button>
                         </div>

                         <div className="space-y-4">
                            {industryList.map((ind: any, i: number) => (
                               <div key={i} className={UI.card + " space-y-4"}>
                                  <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                                     <span className="text-[10px] font-bold text-[#646970] uppercase">Sector Card #{i + 1}</span>
                                     <button
                                        type="button"
                                        onClick={() => {
                                           updateSection("industries", "list", industryList.filter((_: any, idx: number) => idx !== i));
                                        }}
                                        className="text-[#d63638] hover:text-[#b32d2e] p-1"
                                     >
                                        <Trash2 className="w-3.5 h-3.5" />
                                     </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                     <div className="space-y-1.5 sm:col-span-2">
                                        <label className={UI.label}>Industry Title</label>
                                        <input
                                           type="text"
                                           value={ind.title || ""}
                                           onChange={(e) => {
                                              const list = [...industryList];
                                              list[i] = { ...list[i], title: e.target.value };
                                              updateSection("industries", "list", list);
                                           }}
                                           className={UI.input}
                                        />
                                     </div>
                                     <div className="space-y-1.5">
                                        <label className={UI.label}>Watermark (2-3 chars)</label>
                                        <input
                                           type="text"
                                           value={ind.watermark || ""}
                                           onChange={(e) => {
                                              const list = [...industryList];
                                              list[i] = { ...list[i], watermark: e.target.value };
                                              updateSection("industries", "list", list);
                                           }}
                                           className={UI.input}
                                           placeholder="e.g. HS"
                                        />
                                     </div>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                     <div className="space-y-1.5">
                                        <label className={UI.label}>Card Icon</label>
                                        <select
                                           value={INDUSTRY_ICONS.includes(ind.iconName) ? ind.iconName : ""}
                                           onChange={(e) => {
                                              const list = [...industryList];
                                              list[i] = { ...list[i], iconName: e.target.value };
                                              updateSection("industries", "list", list);
                                           }}
                                           className={UI.input}
                                        >
                                           {!INDUSTRY_ICONS.includes(ind.iconName) && (
                                              <option value="">{ind.iconName ? ind.iconName + " (not available here - a default icon is shown)" : "Default icon"}</option>
                                           )}
                                           {INDUSTRY_ICONS.map((name) => <option key={name} value={name}>{name}</option>)}
                                        </select>
                                     </div>
                                     <div className="space-y-1.5">
                                        <label className={UI.label}>Link URL (optional)</label>
                                        <input
                                           type="text"
                                           value={ind.link || ""}
                                           onChange={(e) => {
                                              const list = [...industryList];
                                              list[i] = { ...list[i], link: e.target.value };
                                              updateSection("industries", "list", list);
                                           }}
                                           className={UI.input}
                                           placeholder="e.g. /services/custom-web-applications"
                                        />
                                     </div>
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Description</label>
                                     <RichTextEditor
                                        content={ind.desc || ind.description || ""}
                                        onChange={(val: string) => {
                                           const list = [...industryList];
                                           list[i] = { ...list[i], desc: val };
                                           updateSection("industries", "list", list);
                                        }}
                                     />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Tags (optional, comma separated)</label>
                                     <CommaListInput
                                        value={Array.isArray(ind.tags) ? ind.tags : []}
                                        onChange={(tags) => {
                                           const list = [...industryList];
                                           list[i] = { ...list[i], tags };
                                           updateSection("industries", "list", list);
                                        }}
                                        className={UI.input}
                                        placeholder="e.g. SEO, PPC, Web Design"
                                     />
                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}


               {/* PORTFOLIO SECTION */}
               {activeTab === "portfolio" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Work / Portfolio Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.portfolio?.enabled !== false}
                           onChange={(v) => updateSection("portfolio", "enabled", v)}
                           label="Work / Portfolio"
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Branding</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge / Tag</label><input type="text" value={data.portfolio?.sectionTag || ""} onChange={(e) => updateSection("portfolio", "sectionTag", e.target.value)} className={UI.input} placeholder="CASE STUDIES" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" value={data.portfolio?.titleIntro || ""} onChange={(e) => updateSection("portfolio", "titleIntro", e.target.value)} className={UI.input} placeholder="Our Recent" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" value={data.portfolio?.titleHighlight || ""} onChange={(e) => updateSection("portfolio", "titleHighlight", e.target.value)} className={UI.input} placeholder="Masterpieces" /></div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <RichTextEditor
                              content={data.portfolio?.description || ""}
                              onChange={(val) => updateSection("portfolio", "description", val)}
                              placeholder="A detailed look at some of our premium agency projects and the measurable results we achieved."
                           />
                        </div>
                     </div>

                     {/* 2. FILTER CATEGORIES */}
                     <div className="space-y-6">
                        <div className="flex items-center justify-between pb-2.5 border-b border-[#dcdcde]">
                           <h3 className="text-[15px] font-bold text-[#1d2327] tracking-wide">2. Filter Categories (Tabs)</h3>
                           <button
                              type="button"
                              onClick={() => {
                                 const currentCats = data.portfolio?.categories || [
                                    { id: "all", label: "All Work", iconName: "LayoutGrid" },
                                    { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                                    { id: "dev", label: "Development", iconName: "Monitor" },
                                    { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                                 ];
                                 const newId = `category-${Date.now()}`;
                                 updateSection("portfolio", "categories", [
                                    ...currentCats,
                                    { id: newId, label: "New Category", iconName: "Award" }
                                 ]);
                              }}
                              className="bg-[#2271b1] text-white px-3 py-1.5 rounded-[3px] text-xs font-semibold hover:bg-[#135e96] transition-all flex items-center gap-1 cursor-pointer"
                           >
                              <Plus className="w-3.5 h-3.5" />
                              Add Filter Tab
                           </button>
                        </div>

                        <div className="space-y-4">
                           {(data.portfolio?.categories || [
                              { id: "all", label: "All Work", iconName: "LayoutGrid" },
                              { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                              { id: "dev", label: "Development", iconName: "Monitor" },
                              { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                           ]).map((cat: any, cIdx: number) => (
                              <div key={cIdx} className="bg-[#f6f7f7] p-4 rounded-[4px] border border-[#c3c4c7] space-y-3">
                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e] uppercase">Tab Label / Name</label>
                                       <input
                                          type="text"
                                          value={cat.label || ""}
                                          disabled={cat.id === "all"}
                                          onChange={(e) => {
                                             const currentCats = [...(data.portfolio?.categories || [
                                                { id: "all", label: "All Work", iconName: "LayoutGrid" },
                                                { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                                                { id: "dev", label: "Development", iconName: "Monitor" },
                                                { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                                             ])];
                                             currentCats[cIdx] = { ...currentCats[cIdx], label: e.target.value };
                                             updateSection("portfolio", "categories", currentCats);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. UX/UI Design"
                                       />
                                    </div>

                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e] uppercase">Unique Filter ID (Slug)</label>
                                       <input
                                          type="text"
                                          value={cat.id || ""}
                                          disabled={cat.id === "all"}
                                          onChange={(e) => {
                                             const currentCats = [...(data.portfolio?.categories || [
                                                { id: "all", label: "All Work", iconName: "LayoutGrid" },
                                                { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                                                { id: "dev", label: "Development", iconName: "Monitor" },
                                                { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                                             ])];
                                             currentCats[cIdx] = { ...currentCats[cIdx], id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') };
                                             updateSection("portfolio", "categories", currentCats);
                                          }}
                                          className={UI.input}
                                          placeholder="e.g. design"
                                       />
                                    </div>

                                    <div className="space-y-1">
                                       <label className="text-[11px] font-bold text-[#50575e] uppercase">Tab Icon</label>
                                       <select
                                          value={cat.iconName || "Award"}
                                          disabled={cat.id === "all"}
                                          onChange={(e) => {
                                             const currentCats = [...(data.portfolio?.categories || [
                                                { id: "all", label: "All Work", iconName: "LayoutGrid" },
                                                { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                                                { id: "dev", label: "Development", iconName: "Monitor" },
                                                { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                                             ])];
                                             currentCats[cIdx] = { ...currentCats[cIdx], iconName: e.target.value };
                                             updateSection("portfolio", "categories", currentCats);
                                          }}
                                          className={UI.input}
                                       >
                                          {["LayoutGrid", "Paintbrush", "Search", "Monitor", "BarChart3", "TrendingUp", "Users", "Shield", "Droplet", "Home", "Zap", "Award"].map((icon) => (
                                             <option key={icon} value={icon}>{icon}</option>
                                          ))}
                                       </select>
                                    </div>

                                    <div className="flex justify-end pt-2 md:pt-4">
                                       {cat.id !== "all" ? (
                                          <button
                                             type="button"
                                             onClick={() => {
                                                const currentCats = (data.portfolio?.categories || [
                                                   { id: "all", label: "All Work", iconName: "LayoutGrid" },
                                                   { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                                                   { id: "dev", label: "Development", iconName: "Monitor" },
                                                   { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                                                ]).filter((_: any, i: number) => i !== cIdx);
                                                updateSection("portfolio", "categories", currentCats);
                                             }}
                                             className="text-[#d63638] hover:bg-red-50 p-2 rounded-[3px] border border-red-200 transition-all flex items-center gap-1 text-xs font-semibold cursor-pointer"
                                          >
                                             <Trash2 className="w-4 h-4" />
                                             Delete Tab
                                          </button>
                                       ) : (
                                          <span className="text-[11px] font-bold text-[#8c8f94] uppercase bg-[#e0e0e0] px-2.5 py-1 rounded-[3px]">Default All</span>
                                       )}
                                    </div>
                                 </div>

                                 {/* Bidirectional Project Assignment Checklist */}
                                 {cat.id !== "all" && (
                                    <div className="mt-2 border-t border-[#dcdcde] pt-2 space-y-1.5">
                                       <label className="text-[11px] font-bold text-[#50575e] uppercase block">Assigned Projects for this Filter:</label>
                                       <div className="flex flex-wrap gap-2">
                                          {(data.portfolio?.projects || []).map((project: any, pIdx: number) => {
                                             const isAssigned = Array.isArray(project.categories)
                                                ? project.categories.includes(cat.id)
                                                : (project.category && project.category.toLowerCase() === cat.id);
                                             return (
                                                <label key={pIdx} className="flex items-center gap-1.5 bg-white border border-[#c3c4c7] pl-2 pr-2.5 py-1 rounded-[3px] text-xs font-medium cursor-pointer select-none shadow-xs">
                                                   <input
                                                      type="checkbox"
                                                      checked={isAssigned}
                                                      onChange={(e) => {
                                                         const updatedProjects = [...(data.portfolio?.projects || [])];
                                                         const proj = { ...updatedProjects[pIdx] };
                                                         const cats = Array.isArray(proj.categories) ? [...proj.categories] : (proj.category ? [proj.category.toLowerCase()] : []);
                                                         if (e.target.checked) {
                                                            if (!cats.includes(cat.id)) cats.push(cat.id);
                                                         } else {
                                                            const index = cats.indexOf(cat.id);
                                                            if (index > -1) cats.splice(index, 1);
                                                         }
                                                         proj.categories = cats;
                                                         updatedProjects[pIdx] = proj;
                                                         updateSection("portfolio", "projects", updatedProjects);
                                                      }}
                                                      className="w-3.5 h-3.5 rounded-[2px]"
                                                   />
                                                   {project.title || "Untitled Project"}
                                                </label>
                                             );
                                          })}
                                          {(!data.portfolio?.projects || data.portfolio.projects.length === 0) && (
                                             <p className="text-xs text-[#8c8f94] italic">No projects found. Add projects first in the Projects module or select them below.</p>
                                          )}
                                       </div>
                                    </div>
                                 )}
                              </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Work Selection</h3>
                        <ContentSelector type="projects" label="Featured Projects" selectedItems={data.portfolio?.projects} onSelect={(items) => updateSection("portfolio", "projects", items)} />
                     </div>
                  </div>
               )}

               {/* TESTIMONIALS SECTION */}
               {activeTab === "testimonials" && (
                  <div className="space-y-12">
                     <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                        <div>
                           <h2 className="text-base font-bold text-[#1d2327]">Client Reviews Visibility</h2>
                           <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                        </div>
                        <SectionToggle
                           enabled={data.testimonials?.enabled !== false}
                           onChange={(v) => updateSection("testimonials", "enabled", v)}
                           label="Client Reviews"
                        />
                     </div>
                     {/* 1. SECTION INTRO */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Intro & Narrative</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Badge / Tag</label>
                           <input
                              type="text"
                              value={data.testimonials?.sectionTag || data.testimonials?.section?.badge || ""}
                              placeholder="CLIENT PRAISE & REVIEWS"
                              onChange={(e) => updateSection("testimonials", "sectionTag", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro (Prefix)</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.titleIntro || data.testimonials?.section?.headlinePrefix || ""}
                                 placeholder="Trusted by Founders,"
                                 onChange={(e) => updateSection("testimonials", "titleIntro", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Highlight (Accent Italic)</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.titleHighlight || data.testimonials?.section?.headlineHighlight || ""}
                                 placeholder="Loved by Teams"
                                 onChange={(e) => updateSection("testimonials", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <RichTextEditor
                              content={data.testimonials?.description || data.testimonials?.section?.description || ""}
                              onChange={(val) => updateSection("testimonials", "description", val)}
                              placeholder="e.g. Real feedback from visionary founders and engineering leaders who transformed their digital platforms with our expertise."
                           />
                        </div>
                     </div>

                     {/* 2. SCORECARD WIDGET */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Header Scorecard Widget</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Rating Score</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardRating || ""}
                                 placeholder="4.9/5"
                                 onChange={(e) => updateSection("testimonials", "scorecardRating", e.target.value)}
                                 className={UI.input + " font-bold"}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Rating Label</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardRatingLabel || ""}
                                 placeholder="OVERALL"
                                 onChange={(e) => updateSection("testimonials", "scorecardRatingLabel", e.target.value)}
                                 className={UI.input + " uppercase font-mono"}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Scorecard Headline</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardTitle || ""}
                                 placeholder="TOP RATED ENGINEERING"
                                 onChange={(e) => updateSection("testimonials", "scorecardTitle", e.target.value)}
                                 className={UI.input + " font-bold"}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Scorecard Subtitle</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardSub || ""}
                                 placeholder="BASED ON 120+ CLIENT REVIEWS"
                                 onChange={(e) => updateSection("testimonials", "scorecardSub", e.target.value)}
                                 className={UI.input + " uppercase"}
                              />
                           </div>
                        </div>
                     </div>

                     {/* 3. REVIEWS & TESTIMONIALS LIST (3-ROW MARQUEE) */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <div>
                              <h3 className={UI.sectionHeader}>3. Client Reviews (3-Row Marquee)</h3>
                              <p className="text-xs text-[#646970]">Assign each review to Row 1, 2, or 3 for continuous horizontal scrolling.</p>
                              {reviewList.length === 0 && (
                                 <p className="text-[12px] text-[#8a6d1d] bg-[#fcf9e8] border border-[#dba617] rounded-[3px] px-3 py-2 mt-2">
                                    {aboutClean
                                       ? "No reviews added yet - this page will not show a reviews section until you add one."
                                       : "No reviews added yet - the website currently shows built-in SAMPLE reviews (invented names). Add your first real review to replace them, or switch the section off with the Visible switch above."}
                                 </p>
                              )}
                              {reviewList.length > 0 && reviewRowsUseSamples(reviewList) && (
                                 <p className="text-[12px] text-[#8a6d1d] bg-[#fcf9e8] border border-[#dba617] rounded-[3px] px-3 py-2 mt-2">
                                    At least one marquee row has no review, so the website fills it with built-in SAMPLE reviews (invented names). Add reviews (at least 3) or give every row one.
                                 </p>
                              )}
                           </div>
                           <button
                              onClick={() => {
                                 const currentList = reviewList;
                                 const newRev = {
                                    id: `rev-${Date.now()}`,
                                    name: "New Client",
                                    role: "Founder & CEO",
                                    company: "TechCorp",
                                    quote: "Exceptional speed, world-class UI design, and flawless execution.",
                                    rating: 5,
                                    column: 1,
                                    avatarBg: "bg-[#0306AC]"
                                 };
                                 updateSection("testimonials", "list", [...currentList, newRev]);
                              }}
                              className={UI.buttonAdd}
                           >
                              + Add Review Card
                           </button>
                        </div>

                        <div className="space-y-4">
                           {reviewList.map((rev: any, rIdx: number) => {
                              const currentList = reviewList;

                              return (
                                 <div key={rIdx} className={UI.card + " space-y-4 bg-[#f6f7f7] border border-[#dcdcde]"}>
                                    <div className="flex justify-between items-center pb-2 border-b border-[#e2e4e7]">
                                       <div className="flex items-center gap-2">
                                          <span className="text-[13px] font-bold text-[#1d2327]">Review #{rIdx + 1}: {rev.name}</span>
                                          <span className="text-[10px] font-bold uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                             Row {rev.column || 1}
                                          </span>
                                       </div>
                                       <button
                                          onClick={() => {
                                             const newList = currentList.filter((_: any, i: number) => i !== rIdx);
                                             updateSection("testimonials", "list", newList);
                                          }}
                                          className="text-[#d63638] hover:opacity-80 p-1 flex items-center gap-1 text-xs font-semibold"
                                       >
                                          <Trash2 className="w-4 h-4" />
                                          Delete
                                       </button>
                                    </div>

                                    {/* Quote Text */}
                                    <div className="space-y-1">
                                       <label className="text-[10px] font-bold uppercase text-[#50575e]">Review Quote</label>
                                       <RichTextEditor
                                          content={rev.quote || ""}
                                          onChange={(val) => {
                                             const newList = [...currentList];
                                             newList[rIdx] = { ...newList[rIdx], quote: val };
                                             updateSection("testimonials", "list", newList);
                                          }}
                                          placeholder="e.g. Exceptional service and outstanding deliverables."
                                       />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Client Name</label>
                                          <input
                                             type="text"
                                             value={rev.name || ""}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], name: e.target.value };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input + " font-bold"}
                                             placeholder="e.g. Marcus Vance"
                                          />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Role / Title</label>
                                          <input
                                             type="text"
                                             value={rev.role || ""}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], role: e.target.value };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input}
                                             placeholder="e.g. VP of Engineering"
                                          />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Company</label>
                                          <input
                                             type="text"
                                             value={rev.company || ""}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], company: e.target.value };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input + " font-bold text-[#2271b1]"}
                                             placeholder="e.g. FinScale"
                                          />
                                       </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[#e2e4e7]">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Marquee Row (1, 2, or 3)</label>
                                          <select
                                             value={rev.column || 1}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], column: Number(e.target.value) };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input + " font-bold"}
                                          >
                                             <option value={1}>Row 1 (Scrolls Left)</option>
                                             <option value={2}>Row 2 (Scrolls Right)</option>
                                             <option value={3}>Row 3 (Scrolls Left)</option>
                                          </select>
                                       </div>

                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Rating (Stars 1-5)</label>
                                          <select
                                             value={rev.rating || 5}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], rating: Number(e.target.value) };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input}
                                          >
                                             <option value={5}>★★★★★ (5 Stars)</option>
                                             <option value={4}>★★★★☆ (4 Stars)</option>
                                             <option value={3}>★★★☆☆ (3 Stars)</option>
                                          </select>
                                       </div>

                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Avatar Badge Color</label>
                                          <select
                                             value={rev.avatarBg || "bg-[#0306AC]"}
                                             onChange={(e) => {
                                                const newList = [...currentList];
                                                newList[rIdx] = { ...newList[rIdx], avatarBg: e.target.value };
                                                updateSection("testimonials", "list", newList);
                                             }}
                                             className={UI.input}
                                          >
                                             <option value="bg-[#0306AC]">Navy (#0306AC)</option>
                                             <option value="bg-purple-600">Purple</option>
                                             <option value="bg-emerald-600">Emerald Green</option>
                                             <option value="bg-amber-600">Amber / Gold</option>
                                             <option value="bg-indigo-600">Indigo</option>
                                             <option value="bg-rose-600">Rose Red</option>
                                             <option value="bg-cyan-600">Cyan</option>
                                             <option value="bg-teal-600">Teal</option>
                                          </select>
                                       </div>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                              </div>
                )}

                {/* BLOG SECTION */}
                {activeTab === "blog" && (
                   <div className="space-y-12">
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                         <div>
                            <h2 className="text-base font-bold text-[#1d2327]">Blog Section Visibility</h2>
                            <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                         </div>
                         <SectionToggle
                            enabled={data.blogSection?.enabled !== false && data.blog?.enabled !== false}
                            onChange={(v) => {
                               updateSection("blogSection", "enabled", v);
                               updateSection("blog", "enabled", v);
                            }}
                            label="Blog Section"
                         />
                      </div>
                      <div className="space-y-6">
                         <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                         <div className="space-y-1.5">
                            <label className={UI.label}>Badge / Tag (Eyebrow)</label>
                            <input
                               type="text"
                               value={data.blogSection?.sectionTag || data.blogSection?.subtitle || data.blog?.sectionTag || ""}
                               placeholder="LATEST ARTICLES & INSIGHTS"
                               onChange={(e) => {
                                  updateSection("blogSection", "sectionTag", e.target.value);
                                  updateSection("blog", "sectionTag", e.target.value);
                               }}
                               className={UI.input}
                            />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className={UI.label}>Headline Intro</label>
                               <input
                                  type="text"
                                  value={data.blogSection?.titleIntro || data.blog?.titleIntro || ""}
                                  placeholder="Thinking, Strategies &"
                                  onChange={(e) => {
                                     updateSection("blogSection", "titleIntro", e.target.value);
                                     updateSection("blog", "titleIntro", e.target.value);
                                  }}
                                  className={UI.input}
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className={UI.label}>Headline Highlight <span className="text-primary font-bold">(Italic / Highlight color)</span></label>
                               <input
                                  type="text"
                                  value={data.blogSection?.titleHighlight || data.blogSection?.title || data.blog?.titleHighlight || ""}
                                  placeholder="Industry Insights"
                                  onChange={(e) => {
                                     updateSection("blogSection", "titleHighlight", e.target.value);
                                     updateSection("blogSection", "title", e.target.value);
                                     updateSection("blog", "titleHighlight", e.target.value);
                                  }}
                                  className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                               />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className={UI.label}>Intro Description</label>
                            <RichTextEditor
                               content={data.blogSection?.description || data.blog?.description || ""}
                               placeholder="Explore our latest thoughts on high-performance web engineering, modern UI/UX design architectures, and conversion rate optimization."
                               onChange={(val) => {
                                  updateSection("blogSection", "description", val);
                                  updateSection("blog", "description", val);
                               }}
                            />
                         </div>
                      </div>

                      {/* Blog Post Selection */}
                      <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                         <h3 className={UI.sectionHeader}>2. Featured Blog Articles Selection</h3>
                         <p className="text-[11px] text-[#646970] italic -mt-3">
                            Pick the published blog posts to display on the homepage. If none are selected, the latest published posts are automatically displayed.
                         </p>
                         <BlogSelector
                            selectedIds={Array.isArray(data.blogSection?.selectedPosts)
                               ? data.blogSection.selectedPosts
                               : (Array.isArray(data.blog?.selectedPosts) ? data.blog.selectedPosts : [])}
                            onChange={(selectedIds) => {
                               updateSection("blogSection", "selectedPosts", selectedIds);
                               updateSection("blog", "selectedPosts", selectedIds);
                            }}
                            label="Select Featured Homepage Articles"
                         />
                      </div>
                   </div>
                )}
                {/* CONTACT FORM SECTION */}
                {activeTab === "quote" && (
                   <div className="space-y-10">
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                         <div>
                            <h2 className="text-base font-bold text-[#1d2327]">Contact Form Visibility</h2>
                            <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                         </div>
                         <SectionToggle
                            enabled={data.contact?.enabled !== false && data.quote?.enabled !== false}
                            onChange={(v) => {
                               updateSection("contact", "enabled", v);
                               updateSection("quote", "enabled", v);
                            }}
                            label="Contact Form"
                         />
                      </div>
                      {/* 1. Header & Badges */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header & Eyebrow Badges</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Eyebrow Section Tag</label>
                           <input
                              type="text"
                              value={data.contact?.sectionTag || ""}
                              placeholder="GET IN TOUCH"
                              onChange={(e) => updateSection("contact", "sectionTag", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro (Prefix)</label>
                              <input
                                 type="text"
                                 value={data.contact?.titleIntro || ""}
                                 placeholder="Let's Build Something"
                                 onChange={(e) => updateSection("contact", "titleIntro", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Highlight (Accent)</label>
                              <input
                                 type="text"
                                 value={data.contact?.titleHighlight || ""}
                                 placeholder="Extraordinary."
                                 onChange={(e) => updateSection("contact", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <RichTextEditor
                              content={data.contact?.description || ""}
                              placeholder="Have a project in mind or want to discuss modern digital architecture? Reach out directly or fill out the form below."
                              onChange={(val) => updateSection("contact", "description", val)}
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Direct Channels Label</label>
                              <input
                                 type="text"
                                 value={data.contact?.directChannelsLabel || ""}
                                 placeholder="DIRECT CHANNELS"
                                 onChange={(e) => updateSection("contact", "directChannelsLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Response Guarantee Badge</label>
                              <input
                                 type="text"
                                 value={data.contact?.responseGuarantee || ""}
                                 placeholder="< 2hr response time"
                                 onChange={(e) => updateSection("contact", "responseGuarantee", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                     </div>

                     {/* 2. Direct Channels */}
                     <div className="space-y-6 pt-6 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Direct Contact Channels</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 border border-[#c3c4c7] rounded-sm">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Email Label</label>
                              <input
                                 type="text"
                                 value={data.contact?.emailLabel || ""}
                                 placeholder="DIRECT INBOX"
                                 onChange={(e) => updateSection("contact", "emailLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Email</label>
                              <p className="text-[11px] text-[#646970] -mt-1 mb-1.5">Also the address form submissions are sent to, unless a receiver email is set on the Contact page.</p>
                              <input
                                 type="text"
                                 value={data.contact?.email || ""}
                                 placeholder="hello@mohsindesigns.com"
                                 onChange={(e) => updateSection("contact", "email", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 border border-[#c3c4c7] rounded-sm">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Phone Label</label>
                              <input
                                 type="text"
                                 value={data.contact?.phoneLabel || ""}
                                 placeholder="PHONE / WHATSAPP"
                                 onChange={(e) => updateSection("contact", "phoneLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Phone</label>
                              <input
                                 type="text"
                                 value={data.contact?.phone || ""}
                                 placeholder="+1 (555) 234-5678"
                                 onChange={(e) => updateSection("contact", "phone", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f9fa] p-4 border border-[#c3c4c7] rounded-sm">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Location Label</label>
                              <input
                                 type="text"
                                 value={data.contact?.locationLabel || ""}
                                 placeholder="HEADQUARTERS"
                                 onChange={(e) => updateSection("contact", "locationLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Location</label>
                              <input
                                 type="text"
                                 value={data.contact?.location || ""}
                                 placeholder="Austin, TX & Remote Worldwide"
                                 onChange={(e) => updateSection("contact", "location", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5 sm:col-span-2">
                              <label className={UI.label}>Location Link / Page URL (Optional Interlink)</label>
                              <input
                                 type="text"
                                 value={data.contact?.locationHref || data.contact?.locationLink || data.contact?.addressLink || ""}
                                 onChange={(e) => updateSection("contact", "locationHref", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. /locations/austin or https://maps.google.com/..."
                              />
                           </div>
                        </div>
                     </div>

                     {/* 3. Form Card & Success */}
                     <div className="space-y-6 pt-6 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>3. Form Headings & Success Message</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Form Card Heading</label>
                           <input
                              type="text"
                              value={data.contact?.formHeading || ""}
                              placeholder="Send a Direct Message"
                              onChange={(e) => updateSection("contact", "formHeading", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                                     <div className="space-y-1.5">
                            <label className={UI.label}>Form Card Subheading</label>
                            <input
                               type="text"
                               value={data.contact?.formSubheading || ""}
                               placeholder="Fill out the details below and our team will get back to you within 2 business hours."
                               onChange={(e) => updateSection("contact", "formSubheading", e.target.value)}
                               className={UI.input}
                            />
                         </div>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                               <label className={UI.label}>Submit Button Text</label>
                               <input
                                  type="text"
                                  value={data.contact?.btnSubmit || ""}
                                  placeholder="Send Message"
                                  onChange={(e) => updateSection("contact", "btnSubmit", e.target.value)}
                                  className={UI.input}
                               />
                            </div>
                            <div className="space-y-1.5">
                               <label className={UI.label}>Submitting Button Text</label>
                               <input
                                  type="text"
                                  value={data.contact?.btnSubmitting || ""}
                                  placeholder="Sending Message..."
                                  onChange={(e) => updateSection("contact", "btnSubmitting", e.target.value)}
                                  className={UI.input}
                               />
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <label className={UI.label}>Success Title</label>
                            <input
                               type="text"
                               value={data.contact?.successTitle || ""}
                               placeholder="Message Sent Successfully!"
                               onChange={(e) => updateSection("contact", "successTitle", e.target.value)}
                               className={UI.input}
                            />
                         </div>
                      </div>

                      {/* 4. Field labels, placeholders & messages */}
                      <div className="space-y-6 pt-6 border-t border-[#f0f0f1]">
                         <h3 className={UI.sectionHeader}>4. Form Labels, Placeholders & Messages</h3>
                         <p className="text-[11px] text-[#646970] italic -mt-3">Leave a field empty to use the default text shown in grey.</p>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {CONTACT_FORM_TEXT_FIELDS.map((f) => (
                               <div key={f.key} className="space-y-1.5">
                                  <label className={UI.label}>{f.label}</label>
                                  <input
                                     type="text"
                                     value={data.contact?.[f.key] || ""}
                                     placeholder={f.placeholder}
                                     onChange={(e) => updateSection("contact", f.key, e.target.value)}
                                     className={UI.input}
                                  />
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                 )}

                {/* FAQ SECTION (visibility - the questions themselves live in the page's "Page FAQs" tab) */}
                {activeTab === "faqs" && (
                   <div className="space-y-8">
                      <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                         <div>
                            <h2 className="text-base font-bold text-[#1d2327]">FAQ Section Visibility</h2>
                            <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live website.</p>
                         </div>
                         <SectionToggle
                            enabled={data.faqSection?.enabled !== false}
                            onChange={(v) => updateSection("faqSection", "enabled", v)}
                            label="FAQ Section"
                         />
                      </div>
                      <div className="bg-[#f6f7f7] border border-[#dcdcde] rounded-[4px] p-5 text-[13px] text-[#50575e] space-y-2">
                         <p><strong>Where to write the questions:</strong> open the <em>Page FAQs</em> tab at the top of this page (next to SEO Settings). It holds this page's questions, the section heading and the strategy-session box.</p>
                         <p>
                            {Array.isArray(data.faqs) && data.faqs.length > 0
                               ? data.faqs.length + " question" + (data.faqs.length === 1 ? "" : "s") + " added to this page."
                               : "No questions added to this page yet - the site-wide FAQ list is shown instead."}
                         </p>
                         <p>Structured data (FAQPage schema) for these questions is managed with the <em>Sync FAQs to Schema</em> button in the same tab; the Schema Markup tab (also at the top of this page) holds any custom JSON-LD.</p>
                      </div>
                   </div>
                )}
            </motion.div>
         </AnimatePresence>
      </div>
   );
}
