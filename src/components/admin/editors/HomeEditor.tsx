"use client";

import React, { useState, useEffect } from "react";
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

export default function HomeEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
   const [activeTab, setActiveTab] = useState("hero");

   useEffect(() => {
      if (data && Object.keys(data).length === 0) {
         setData({
            hero: { badge: "", headlines: [{ text: "", highlight: false }], description: "", buttons: [{ text: "", href: "", primary: true }], stats: [], images: [], bgImageAlt: "" },
            about: { badge: "", headline: { prefix: "", highlight: "", suffix: "" }, description: "", image: { src: "", alt: "", badge: "" }, points: [] },
            services: { badge: "", headline: { prefix: "", highlight: "", suffix: "" }, description: [], stats: [], services: [] },
            whyChooseUs: { section: { badge: "", headline: "", description: "" }, features: [], stats: [] },
            leadership: {
               section: { badge: "", headline: "", description: "" },
               ceo: { name: "", title: "", image: { src: "", alt: "" }, badges: { top: "", bottom: "" }, quotes: [""], description: "", socials: [] }
            },
            portfolio: { section: { badge: "", headline: "" }, projects: [], button: { text: "", link: "" } },
            testimonials: { section: { badge: "", headline: "", featured: "" }, stats: { subscribers: "" }, testimonials: [] },
            quote: { section: { badge: "", headline: "", description: "" }, success: { title: "", message: "", buttonText: "" }, services: [], timelines: [] }
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

   const tabs = [
      { id: "hero", label: "Home" },
      { id: "about", label: "About" },
      { id: "services", label: "Services" },
      { id: "portfolio", label: "Work" },
      { id: "testimonials", label: "Reviews" },
      { id: "whyChooseUs", label: "Value Props" },
      { id: "serviceArea", label: "Global Coverage" },
      { id: "blog", label: "Blog" },
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
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Branding</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.hero?.badge ?? data.hero?.badgeText ?? ""} onChange={(e) => updateSection("hero", "badge", e.target.value)} className={UI.input} placeholder="e.g. Premium Exterior Solutions" /></div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Premium Hero Title</h3>
                        <div className="space-y-4">
                           <div className="space-y-1.5"><label className={UI.label}>Title Line 1</label><input type="text" value={data.hero?.titleLine1 || ""} onChange={(e) => updateSection("hero", "titleLine1", e.target.value)} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Title Connector (e.g. "with")</label><input type="text" value={data.hero?.titleConnector || ""} onChange={(e) => updateSection("hero", "titleConnector", e.target.value)} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Title Line 2 (Highlighted/Underlined)</label><input type="text" value={data.hero?.titleLine2 || ""} onChange={(e) => updateSection("hero", "titleLine2", e.target.value)} className={UI.input} /></div>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <RichTextEditor
                           label="3. Description Narrative"
                           content={data.hero?.description || ""}
                           onChange={(html) => updateSection("hero", "description", html)}
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
                        <h3 className={UI.sectionHeader}>5. Trust Stats</h3>
                        <div className="space-y-4">
                           {(data.hero?.stats || []).map((s: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                                    <button onClick={() => { updateSection("hero", "stats", (prev: any[]) => prev.filter((_: any, idx: number) => idx !== i)); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value</label><input type="text" value={s.value || ""} onChange={(e) => { const val = e.target.value; updateSection("hero", "stats", (prev: any[]) => { const newS = [...prev]; newS[i].value = val; return newS; }); }} className={UI.inputLarge} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Label</label><input type="text" value={s.label || ""} onChange={(e) => { const val = e.target.value; updateSection("hero", "stats", (prev: any[]) => { const newS = [...prev]; newS[i].label = val; return newS; }); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Sub-label / Description</label><input type="text" value={s.description || ""} onChange={(e) => { const val = e.target.value; updateSection("hero", "stats", (prev: any[]) => { const newS = [...prev]; newS[i].description = val; return newS; }); }} className={UI.input} placeholder="e.g. 2x website traffic increase" /></div>
                                 <IconSelector label="Icon" value={s.icon} onChange={(val) => { updateSection("hero", "stats", (prev: any[]) => { const newS = [...prev]; newS[i].icon = val; return newS; }); }} />
                              </div>
                           ))}
                           <button onClick={() => updateSection("hero", "stats", (prev: any[]) => [...(prev || []), { value: "", label: "", icon: "Star" }])} className={UI.buttonAdd}>+ Add Stat</button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>6. Showcase / Hero Image</h3>
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
                        <h3 className={UI.sectionHeader}>7. Interactive Elements</h3>
                        <div className="space-y-4">
                           <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Text</label><input type="text" value={data.hero?.circleText || ""} onChange={(e) => updateSection("hero", "circleText", e.target.value)} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Center Letter</label><input type="text" value={data.hero?.circleLetter || ""} onChange={(e) => updateSection("hero", "circleLetter", e.target.value)} className={UI.input} /></div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Marquee Items (Comma separated)</label>
                              <input
                                 type="text"
                                 value={(data.hero?.marqueeItems || []).join(", ")}
                                 onChange={(e) => updateSection("hero", "marqueeItems", e.target.value.split(",").map((s: string) => s.trim()))}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               {/* ABOUT SECTION */}
               {activeTab === "about" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Identity</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.about?.badge || ""} onChange={(e) => updateSection("about", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-4">
                           <label className={UI.label}>Headline (Structured)</label>
                           <div className="space-y-2">
                              <input type="text" value={data.about?.headline?.prefix || ""} onChange={(e) => updateSection("about", "headline", { ...(data.about?.headline || {}), prefix: e.target.value })} className={UI.input} placeholder="Prefix" />
                              <input type="text" value={data.about?.headline?.highlight || ""} onChange={(e) => updateSection("about", "headline", { ...(data.about?.headline || {}), highlight: e.target.value })} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlighted" />

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
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Action Buttons</h3>
                        <div className="space-y-4">
                           {(data.about?.buttons || []).map((btn: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Button #{i + 1}</span>
                                    <button onClick={() => { const newB = data.about.buttons.filter((_: any, idx: number) => idx !== i); updateSection("about", "buttons", newB); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Text</label><input type="text" value={btn.text || ""} onChange={(e) => { const newB = [...data.about.buttons]; newB[i].text = e.target.value; updateSection("about", "buttons", newB); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Link</label><input type="text" value={btn.href || ""} onChange={(e) => { const newB = [...data.about.buttons]; newB[i].href = e.target.value; updateSection("about", "buttons", newB); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Icon Name</label><input type="text" value={btn.icon || ""} onChange={(e) => { const newB = [...data.about.buttons]; newB[i].icon = e.target.value; updateSection("about", "buttons", newB); }} className={UI.input} placeholder="e.g. ArrowRight" /></div>
                                 <label className="flex items-center gap-2 cursor-pointer text-[12px]"><input type="checkbox" checked={btn.primary || false} onChange={(e) => { const newB = [...data.about.buttons]; newB[i].primary = e.target.checked; updateSection("about", "buttons", newB); }} /> Primary Style</label>
                              </div>
                           ))}
                           <button onClick={() => updateSection("about", "buttons", [...(data.about?.buttons || []), { text: "", href: "", primary: false, icon: "ArrowRight" }])} className={UI.buttonAdd}>+ Add Button</button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>4. Stats</h3>
                        <div className="space-y-4">
                           {(data.about?.stats || []).map((s: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                                    <button onClick={() => { const newS = data.about.stats.filter((_: any, idx: number) => idx !== i); updateSection("about", "stats", newS); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value</label><input type="number" value={s.value || 0} onChange={(e) => { const newS = [...data.about.stats]; newS[i].value = parseInt(e.target.value); updateSection("about", "stats", newS); }} className={UI.inputLarge} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Suffix (e.g. +, %)</label><input type="text" value={s.suffix || ""} onChange={(e) => { const newS = [...data.about.stats]; newS[i].suffix = e.target.value; updateSection("about", "stats", newS); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Label</label><input type="text" value={s.label || ""} onChange={(e) => { const newS = [...data.about.stats]; newS[i].label = e.target.value; updateSection("about", "stats", newS); }} className={UI.input} /></div>
                              </div>
                           ))}
                           <button onClick={() => updateSection("about", "stats", [...(data.about?.stats || []), { value: 0, suffix: "+", label: "" }])} className={UI.buttonAdd}>+ Add Stat</button>
                        </div>
                     </div>

                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>5. Media</h3>
                        <ImageField
                           label="Section Image"
                           value={data.about?.image?.src || ""}
                           onChange={(url) => updateSection("about", "image", { ...(data.about?.image || {}), src: url })}
                           altValue={data.about?.image?.alt || ""}
                           onAltChange={(alt) => updateSection("about", "image", { ...(data.about?.image || {}), alt: alt })}
                        />
                        <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Text</label><input type="text" value={data.about?.circleText || ""} onChange={(e) => updateSection("about", "circleText", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Rotating Circle Center Letter</label><input type="text" value={data.about?.circleLetter || ""} onChange={(e) => updateSection("about", "circleLetter", e.target.value)} className={UI.input} /></div>
                     </div>
                  </div>
               )}

               {/* SERVICES SECTION */}
               {activeTab === "services" && (
                  <div className="space-y-12">

                     {/* 1. Section Header */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Section Tag (Eyebrow Label)</label><input type="text" value={data.services?.sectionTag || ""} onChange={(e) => updateSection("services", "sectionTag", e.target.value)} className={UI.input} placeholder="OUR SERVICES" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title — Intro (plain)</label><input type="text" value={data.services?.titleIntro || ""} onChange={(e) => updateSection("services", "titleIntro", e.target.value)} className={UI.input} placeholder="What We" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title — Highlight <span className="text-[#2271b1] font-bold">(italic, brand color)</span></label><input type="text" value={data.services?.titleHighlight || ""} onChange={(e) => updateSection("services", "titleHighlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Deliver." /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Section Description</label><textarea rows={3} value={typeof data.services?.description === "string" ? data.services.description : (Array.isArray(data.services?.description) ? (data.services.description as string[]).join("") : "")} onChange={(e) => updateSection("services", "description", e.target.value)} className={UI.input} placeholder="Explore our full suite of premium digital services." /></div>
                        <div className="grid grid-cols-2 gap-3">
                           <div className="space-y-1.5"><label className={UI.label}>Prev Arrow Aria Label</label><input type="text" value={data.services?.ariaPrev || ""} onChange={(e) => updateSection("services", "ariaPrev", e.target.value)} className={UI.input} placeholder="Previous service" /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Next Arrow Aria Label</label><input type="text" value={data.services?.ariaNext || ""} onChange={(e) => updateSection("services", "ariaNext", e.target.value)} className={UI.input} placeholder="Next service" /></div>
                        </div>
                        <div className="space-y-1.5"><label className={UI.label}>Card Footer Label (e.g. "SERVICE")</label><input type="text" value={data.services?.serviceLabel || ""} onChange={(e) => updateSection("services", "serviceLabel", e.target.value)} className={UI.input} placeholder="SERVICE" /></div>
                     </div>

                     {/* 2. Service Cards */}
                     <div className="space-y-6 pt-10 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Service Cards</h3>
                        <p className="text-[11px] text-[#646970] italic -mt-3">Select from your existing services. Order can be rearranged after selection.</p>
                        <ContentSelector
                           type="services"
                           label="Featured Services (shown in carousel)"
                           selectedItems={data.services?.list || []}
                           onSelect={(items) => updateSection("services", "list", items)}
                        />
                     </div>

                  </div>
               )}

               {/* HOW WE WORK / WHY CHOOSE US */}
               {activeTab === "whyChooseUs" && (
                  <div className="space-y-12">
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
                           <textarea
                              rows={3}
                              value={data.whyChooseUs?.subtext || data.whyChooseUs?.section?.description || ""}
                              onChange={(e) => updateSection("whyChooseUs", "subtext", e.target.value)}
                              className={UI.input}
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
                                          value={s.percentage ?? 0.85}
                                          onChange={(e) => {
                                             const newS = [...currentStats];
                                             newS[i] = { ...newS[i], percentage: parseFloat(e.target.value) || 0.85 };
                                             updateSection("whyChooseUs", "stats", newS);
                                          }}
                                          className={UI.input}
                                          placeholder="0.95"
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
                                 const currentReasons = (data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                                    ? data.whyChooseUs.reasons
                                    : (data.whyChooseUs?.features || []);
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
                                       <textarea
                                          rows={2}
                                          value={r.desc || r.description || ""}
                                          onChange={(e) => {
                                             const newR = [...currentReasons];
                                             newR[i] = { ...newR[i], desc: e.target.value, description: e.target.value };
                                             updateSection("whyChooseUs", "reasons", newR);
                                          }}
                                          className={UI.input}
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
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Badge / Tag</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.sectionTag || "GLOBAL COVERAGE"}
                                 onChange={(e) => updateSection("serviceArea", "sectionTag", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. GLOBAL COVERAGE"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.titleIntro || "Serving Clients"}
                                 onChange={(e) => updateSection("serviceArea", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Serving Clients"
                              />
                           </div>
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Headline Highlight <span className="text-primary font-bold">(Italic / Highlight color)</span></label>
                           <input
                              type="text"
                              value={data.serviceArea?.titleHighlight || "Worldwide"}
                              onChange={(e) => updateSection("serviceArea", "titleHighlight", e.target.value)}
                              className={UI.input + " font-bold border-[#2271b1]"}
                              placeholder="e.g. Worldwide"
                           />
                        </div>

                        <div className="space-y-1.5">
                           <label className={UI.label}>Intro Description</label>
                           <textarea
                              rows={3}
                              value={data.serviceArea?.description || ""}
                              onChange={(e) => updateSection("serviceArea", "description", e.target.value)}
                              className={UI.input}
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
                                 value={data.serviceArea?.ctaText || "Schedule Global Consultation"}
                                 onChange={(e) => updateSection("serviceArea", "ctaText", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Schedule Global Consultation"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Button Link</label>
                              <input
                                 type="text"
                                 value={data.serviceArea?.ctaHref || "#contact"}
                                 onChange={(e) => updateSection("serviceArea", "ctaHref", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. #contact or /contact"
                              />
                           </div>
                        </div>
                     </div>

                     {/* 3. GLOBAL HUBS (AUTO-PINNED TO REAL WORLD MAP) */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <div className="flex justify-between items-center">
                           <div>
                              <h3 className={UI.sectionHeader}>3. Active Global Operating Countries</h3>
                              <p className="text-xs text-[#646970]">Simply choose or type a country. Real GPS coordinates are automatically mapped to the interactive live globe.</p>
                           </div>
                           <button
                              onClick={() => {
                                 const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                                    ? data.serviceArea.hubs
                                    : [
                                       { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST" },
                                       { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST" },
                                       { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT" },
                                       { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET" },
                                       { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET" },
                                       { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET" },
                                       { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET" },
                                       { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET" },
                                       { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET" },
                                       { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT" },
                                       { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST" },
                                       { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST" }
                                    ];
                                 const newHub = { id: `hub-${Date.now()}`, name: "United Arab Emirates", focus: "Regional Hub", timezone: "GST" };
                                 updateSection("serviceArea", "hubs", [...currentHubs, newHub]);
                              }}
                              className={UI.buttonAdd}
                           >
                              + Add Operating Country
                           </button>
                        </div>

                        <div className="space-y-4">
                           {((data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                              ? data.serviceArea.hubs
                              : [
                                 { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST" },
                                 { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST" },
                                 { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT" },
                                 { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET" },
                                 { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET" },
                                 { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET" },
                                 { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET" },
                                 { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET" },
                                 { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET" },
                                 { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT" },
                                 { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST" },
                                 { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST" }
                              ]
                           ).map((hub: any, hIdx: number) => {
                              const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                                 ? data.serviceArea.hubs
                                 : [
                                    { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST" },
                                    { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST" },
                                    { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT" },
                                    { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET" },
                                    { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET" },
                                    { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET" },
                                    { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET" },
                                    { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET" },
                                    { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET" },
                                    { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT" },
                                    { id: "bh", name: "Bahrain", focus: "MENA Regional Hub", timezone: "AST" },
                                    { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST" }
                                 ];
                              const geo = resolveCountryLocation(hub.name);

                              return (
                                 <div key={hIdx} className={UI.card + " space-y-3 bg-[#f6f7f7] border border-[#dcdcde]"}>
                                    <div className="flex justify-between items-center pb-2 border-b border-[#e2e4e7]">
                                       <div className="flex items-center gap-2">
                                          <MapPin className="w-4 h-4 text-[#2271b1]" />
                                          <span className="text-[13px] font-bold text-[#1d2327]">{hub.name || `Country #${hIdx + 1}`}</span>
                                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                                             📍 Auto-Geolocated ({geo.region})
                                          </span>
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

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                       <div className="space-y-1">
                                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Country Name</label>
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
                                             placeholder="Type or select a country..."
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
                                             placeholder="e.g. Full-Stack & UI/UX"
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
                                             placeholder="e.g. EST / PST"
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



               {/* PORTFOLIO SECTION */}
               {activeTab === "portfolio" && (
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Branding</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge / Tag</label><input type="text" value={data.portfolio?.sectionTag || data.portfolio?.section?.badge || ""} onChange={(e) => updateSection("portfolio", "sectionTag", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" value={data.portfolio?.titleIntro || data.portfolio?.section?.headlinePrefix || ""} onChange={(e) => updateSection("portfolio", "titleIntro", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" value={data.portfolio?.titleHighlight || data.portfolio?.section?.headlineHighlight || ""} onChange={(e) => updateSection("portfolio", "titleHighlight", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Description</label><textarea value={data.portfolio?.description || data.portfolio?.section?.description || ""} onChange={(e) => updateSection("portfolio", "description", e.target.value)} className={UI.input + " min-h-[80px]"} /></div>
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
                     {/* 1. SECTION INTRO */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Intro & Narrative</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Badge / Tag</label>
                           <input
                              type="text"
                              value={data.testimonials?.sectionTag || data.testimonials?.section?.badge || "CLIENT PRAISE & REVIEWS"}
                              onChange={(e) => updateSection("testimonials", "sectionTag", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. CLIENT PRAISE & REVIEWS"
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro (Prefix)</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.titleIntro || data.testimonials?.section?.headlinePrefix || "Trusted by Founders,"}
                                 onChange={(e) => updateSection("testimonials", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Trusted by Founders,"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Highlight (Accent Italic)</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.titleHighlight || data.testimonials?.section?.headlineHighlight || "Loved by Teams"}
                                 onChange={(e) => updateSection("testimonials", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                                 placeholder="e.g. Loved by Teams"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <textarea
                              rows={3}
                              value={data.testimonials?.description || data.testimonials?.section?.description || ""}
                              onChange={(e) => updateSection("testimonials", "description", e.target.value)}
                              className={UI.input}
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
                                 value={data.testimonials?.scorecardRating || "4.9/5"}
                                 onChange={(e) => updateSection("testimonials", "scorecardRating", e.target.value)}
                                 className={UI.input + " font-bold"}
                                 placeholder="e.g. 4.9/5 or 5.0"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Rating Label</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardRatingLabel || "OVERALL"}
                                 onChange={(e) => updateSection("testimonials", "scorecardRatingLabel", e.target.value)}
                                 className={UI.input + " uppercase font-mono"}
                                 placeholder="e.g. OVERALL"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Scorecard Headline</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardTitle || "TOP RATED ENGINEERING"}
                                 onChange={(e) => updateSection("testimonials", "scorecardTitle", e.target.value)}
                                 className={UI.input + " font-bold"}
                                 placeholder="e.g. TOP RATED ENGINEERING"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Scorecard Subtitle</label>
                              <input
                                 type="text"
                                 value={data.testimonials?.scorecardSub || "BASED ON 120+ CLIENT REVIEWS"}
                                 onChange={(e) => updateSection("testimonials", "scorecardSub", e.target.value)}
                                 className={UI.input + " uppercase"}
                                 placeholder="e.g. BASED ON 120+ CLIENT REVIEWS"
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
                           </div>
                           <button
                              onClick={() => {
                                 const currentList = (data.testimonials?.list && data.testimonials.list.length > 0)
                                    ? data.testimonials.list
                                    : [
                                       { id: "rev-1", name: "Marcus Vance", role: "VP of Engineering", company: "FinScale", quote: "Mohsin's team revamped our core web application in record time. Performance increased by 300% and user engagement reached all-time highs.", rating: 5, column: 1, avatarBg: "bg-[#0306AC]" },
                                       { id: "rev-2", name: "Elena Rostova", role: "Chief Design Officer", company: "Aura AI", quote: "The attention to typography, micro-interactions, and responsive layout is world-class. Our design system was delivered ahead of schedule.", rating: 5, column: 1, avatarBg: "bg-purple-600" },
                                       { id: "rev-3", name: "David Chen", role: "Founder & CEO", company: "NexPath Logistics", quote: "From discovery to deployment, the execution was flawless. Their architectural decisions saved us months of rework down the line.", rating: 5, column: 1, avatarBg: "bg-emerald-600" },
                                       { id: "rev-4", name: "Sarah Jenkins", role: "Head of Product", company: "CloudCore", quote: "Super intuitive CMS and stunning frontend animations. Our non-technical marketing team can now update high-converting pages effortlessly.", rating: 5, column: 2, avatarBg: "bg-amber-600" },
                                       { id: "rev-5", name: "Liam O'Connor", role: "Technical Director", company: "Verve Media", quote: "Incredible speed, clean code, and zero bugs on launch day. Mohsin Designs is our go-to engineering partner for every enterprise build.", rating: 5, column: 2, avatarBg: "bg-indigo-600" },
                                       { id: "rev-6", name: "Amina Al-Mansoor", role: "Director of Digital", company: "Apex Gulf Group", quote: "They understood our complex requirements instantly and delivered a modern portal that exceeds international enterprise standards.", rating: 5, column: 2, avatarBg: "bg-rose-600" },
                                       { id: "rev-7", name: "Julian Meyer", role: "Co-Founder", company: "StackFlow Analytics", quote: "The speed and polish of the final product blew our investors away. Truly state-of-the-art UI with rock-solid Next.js architecture.", rating: 5, column: 3, avatarBg: "bg-cyan-600" },
                                       { id: "rev-8", name: "Clara Johansson", role: "Growth Lead", company: "Nordic Ventures", quote: "Conversion rates jumped by 42% in the first 30 days after re-platforming. The ROI speaks for itself.", rating: 5, column: 3, avatarBg: "bg-teal-600" },
                                       { id: "rev-9", name: "Tariq Mahmood", role: "Head of Engineering", company: "PulseTech", quote: "Best agency collaboration we've had in 8 years. Highly responsive, deep technical chops, and unmatched creative execution.", rating: 5, column: 3, avatarBg: "bg-[#0306AC]" }
                                    ];
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
                           {((data.testimonials?.list && data.testimonials.list.length > 0)
                              ? data.testimonials.list
                              : [
                                 { id: "rev-1", name: "Marcus Vance", role: "VP of Engineering", company: "FinScale", quote: "Mohsin's team revamped our core web application in record time. Performance increased by 300% and user engagement reached all-time highs.", rating: 5, column: 1, avatarBg: "bg-[#0306AC]" },
                                 { id: "rev-2", name: "Elena Rostova", role: "Chief Design Officer", company: "Aura AI", quote: "The attention to typography, micro-interactions, and responsive layout is world-class. Our design system was delivered ahead of schedule.", rating: 5, column: 1, avatarBg: "bg-purple-600" },
                                 { id: "rev-3", name: "David Chen", role: "Founder & CEO", company: "NexPath Logistics", quote: "From discovery to deployment, the execution was flawless. Their architectural decisions saved us months of rework down the line.", rating: 5, column: 1, avatarBg: "bg-emerald-600" },
                                 { id: "rev-4", name: "Sarah Jenkins", role: "Head of Product", company: "CloudCore", quote: "Super intuitive CMS and stunning frontend animations. Our non-technical marketing team can now update high-converting pages effortlessly.", rating: 5, column: 2, avatarBg: "bg-amber-600" },
                                 { id: "rev-5", name: "Liam O'Connor", role: "Technical Director", company: "Verve Media", quote: "Incredible speed, clean code, and zero bugs on launch day. Mohsin Designs is our go-to engineering partner for every enterprise build.", rating: 5, column: 2, avatarBg: "bg-indigo-600" },
                                 { id: "rev-6", name: "Amina Al-Mansoor", role: "Director of Digital", company: "Apex Gulf Group", quote: "They understood our complex requirements instantly and delivered a modern portal that exceeds international enterprise standards.", rating: 5, column: 2, avatarBg: "bg-rose-600" },
                                 { id: "rev-7", name: "Julian Meyer", role: "Co-Founder", company: "StackFlow Analytics", quote: "The speed and polish of the final product blew our investors away. Truly state-of-the-art UI with rock-solid Next.js architecture.", rating: 5, column: 3, avatarBg: "bg-cyan-600" },
                                 { id: "rev-8", name: "Clara Johansson", role: "Growth Lead", company: "Nordic Ventures", quote: "Conversion rates jumped by 42% in the first 30 days after re-platforming. The ROI speaks for itself.", rating: 5, column: 3, avatarBg: "bg-teal-600" },
                                 { id: "rev-9", name: "Tariq Mahmood", role: "Head of Engineering", company: "PulseTech", quote: "Best agency collaboration we've had in 8 years. Highly responsive, deep technical chops, and unmatched creative execution.", rating: 5, column: 3, avatarBg: "bg-[#0306AC]" }
                              ]
                           ).map((rev: any, rIdx: number) => {
                              const currentList = (data.testimonials?.list && data.testimonials.list.length > 0)
                                 ? data.testimonials.list
                                 : [
                                    { id: "rev-1", name: "Marcus Vance", role: "VP of Engineering", company: "FinScale", quote: "Mohsin's team revamped our core web application in record time. Performance increased by 300% and user engagement reached all-time highs.", rating: 5, column: 1, avatarBg: "bg-[#0306AC]" },
                                    { id: "rev-2", name: "Elena Rostova", role: "Chief Design Officer", company: "Aura AI", quote: "The attention to typography, micro-interactions, and responsive layout is world-class. Our design system was delivered ahead of schedule.", rating: 5, column: 1, avatarBg: "bg-purple-600" },
                                    { id: "rev-3", name: "David Chen", role: "Founder & CEO", company: "NexPath Logistics", quote: "From discovery to deployment, the execution was flawless. Their architectural decisions saved us months of rework down the line.", rating: 5, column: 1, avatarBg: "bg-emerald-600" },
                                    { id: "rev-4", name: "Sarah Jenkins", role: "Head of Product", company: "CloudCore", quote: "Super intuitive CMS and stunning frontend animations. Our non-technical marketing team can now update high-converting pages effortlessly.", rating: 5, column: 2, avatarBg: "bg-amber-600" },
                                    { id: "rev-5", name: "Liam O'Connor", role: "Technical Director", company: "Verve Media", quote: "Incredible speed, clean code, and zero bugs on launch day. Mohsin Designs is our go-to engineering partner for every enterprise build.", rating: 5, column: 2, avatarBg: "bg-indigo-600" },
                                    { id: "rev-6", name: "Amina Al-Mansoor", role: "Director of Digital", company: "Apex Gulf Group", quote: "They understood our complex requirements instantly and delivered a modern portal that exceeds international enterprise standards.", rating: 5, column: 2, avatarBg: "bg-rose-600" },
                                    { id: "rev-7", name: "Julian Meyer", role: "Co-Founder", company: "StackFlow Analytics", quote: "The speed and polish of the final product blew our investors away. Truly state-of-the-art UI with rock-solid Next.js architecture.", rating: 5, column: 3, avatarBg: "bg-cyan-600" },
                                    { id: "rev-8", name: "Clara Johansson", role: "Growth Lead", company: "Nordic Ventures", quote: "Conversion rates jumped by 42% in the first 30 days after re-platforming. The ROI speaks for itself.", rating: 5, column: 3, avatarBg: "bg-teal-600" },
                                    { id: "rev-9", name: "Tariq Mahmood", role: "Head of Engineering", company: "PulseTech", quote: "Best agency collaboration we've had in 8 years. Highly responsive, deep technical chops, and unmatched creative execution.", rating: 5, column: 3, avatarBg: "bg-[#0306AC]" }
                                 ];

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
                                       <textarea
                                          rows={2}
                                          value={rev.quote || ""}
                                          onChange={(e) => {
                                             const newList = [...currentList];
                                             newList[rIdx] = { ...newList[rIdx], quote: e.target.value };
                                             updateSection("testimonials", "list", newList);
                                          }}
                                          className={UI.input}
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



               {/* CONTACT FORM SECTION */}
               {activeTab === "quote" && (
                  <div className="space-y-10">
                     {/* 1. Header & Badges */}
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header & Eyebrow Badges</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Eyebrow Section Tag</label>
                           <input
                              type="text"
                              value={data.contact?.sectionTag || "GET IN TOUCH"}
                              onChange={(e) => updateSection("contact", "sectionTag", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. GET IN TOUCH"
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro (Prefix)</label>
                              <input
                                 type="text"
                                 value={data.contact?.titleIntro || "Let's Build Something"}
                                 onChange={(e) => updateSection("contact", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Let's Build Something"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Highlight (Accent)</label>
                              <input
                                 type="text"
                                 value={data.contact?.titleHighlight || "Extraordinary."}
                                 onChange={(e) => updateSection("contact", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                                 placeholder="e.g. Extraordinary."
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <textarea
                              rows={3}
                              value={data.contact?.description || "Have a project in mind or want to discuss modern digital architecture? Reach out directly or fill out the form below."}
                              onChange={(e) => updateSection("contact", "description", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Direct Channels Label</label>
                              <input
                                 type="text"
                                 value={data.contact?.directChannelsLabel || "DIRECT CHANNELS"}
                                 onChange={(e) => updateSection("contact", "directChannelsLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Response Guarantee Badge</label>
                              <input
                                 type="text"
                                 value={data.contact?.responseGuarantee || "< 2hr response time"}
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
                                 value={data.contact?.emailLabel || "DIRECT INBOX"}
                                 onChange={(e) => updateSection("contact", "emailLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Email</label>
                              <input
                                 type="text"
                                 value={data.contact?.email || "hello@mohsindesigns.com"}
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
                                 value={data.contact?.phoneLabel || "PHONE / WHATSAPP"}
                                 onChange={(e) => updateSection("contact", "phoneLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Phone</label>
                              <input
                                 type="text"
                                 value={data.contact?.phone || "+1 (555) 234-5678"}
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
                                 value={data.contact?.locationLabel || "HEADQUARTERS"}
                                 onChange={(e) => updateSection("contact", "locationLabel", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Display Location</label>
                              <input
                                 type="text"
                                 value={data.contact?.location || "Austin, TX & Remote Worldwide"}
                                 onChange={(e) => updateSection("contact", "location", e.target.value)}
                                 className={UI.input}
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
                              value={data.contact?.formHeading || "Send a Direct Message"}
                              onChange={(e) => updateSection("contact", "formHeading", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Form Card Subheading</label>
                           <input
                              type="text"
                              value={data.contact?.formSubheading || "Fill out the details below and our team will get back to you within 2 business hours."}
                              onChange={(e) => updateSection("contact", "formSubheading", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Submit Button Text</label>
                              <input
                                 type="text"
                                 value={data.contact?.btnSubmit || "Send Message"}
                                 onChange={(e) => updateSection("contact", "btnSubmit", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Submitting Button Text</label>
                              <input
                                 type="text"
                                 value={data.contact?.btnSubmitting || "Sending Message..."}
                                 onChange={(e) => updateSection("contact", "btnSubmitting", e.target.value)}
                                 className={UI.input}
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Success Title</label>
                           <input
                              type="text"
                              value={data.contact?.successTitle || "Message Sent Successfully!"}
                              onChange={(e) => updateSection("contact", "successTitle", e.target.value)}
                              className={UI.input}
                           />
                        </div>
                     </div>
                  </div>
               )}

               {/* BLOG SECTION */}
               {activeTab === "blog" && (
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Section Intro & Narrative</h3>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Badge / Tag</label>
                           <input
                              type="text"
                              value={data.blogSection?.sectionTag || data.blogSection?.subtitle || "LATEST ARTICLES & INSIGHTS"}
                              onChange={(e) => updateSection("blogSection", "sectionTag", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. LATEST ARTICLES & INSIGHTS"
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Intro (Prefix)</label>
                              <input
                                 type="text"
                                 value={data.blogSection?.titleIntro || "Thinking, Strategies &"}
                                 onChange={(e) => updateSection("blogSection", "titleIntro", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Thinking, Strategies &"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Headline Highlight (Accent Italic)</label>
                              <input
                                 type="text"
                                 value={data.blogSection?.titleHighlight || data.blogSection?.title || "Industry Insights"}
                                 onChange={(e) => updateSection("blogSection", "titleHighlight", e.target.value)}
                                 className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                                 placeholder="e.g. Industry Insights"
                              />
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className={UI.label}>Description</label>
                           <textarea
                              rows={3}
                              value={data.blogSection?.description || ""}
                              onChange={(e) => updateSection("blogSection", "description", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. Explore our latest thoughts on high-performance web engineering, modern UI/UX design architectures, and conversion rate optimization."
                           />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Featured Card CTA Label</label>
                              <input
                                 type="text"
                                 value={data.blogSection?.featuredLabel || "Read Full Article"}
                                 onChange={(e) => updateSection("blogSection", "featuredLabel", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g. Read Full Article"
                              />
                           </div>
                           <div className="space-y-1.5">
                              <label className={UI.label}>Date Separator Symbol</label>
                              <input
                                 type="text"
                                 value={data.blogSection?.dateSeparator || " • "}
                                 onChange={(e) => updateSection("blogSection", "dateSeparator", e.target.value)}
                                 className={UI.input}
                                 placeholder="e.g.  • "
                              />
                           </div>
                        </div>
                     </div>

                     {/* FEATURED MAIN CARD OVERRIDES (OPTIONAL) */}
                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>2. Main Featured Card (Optional Overrides)</h3>
                        <p className="text-xs text-[#646970]">By default, the main featured card automatically pulls the headline, live excerpt/content, category, and image from the selected post. You can optionally override any of them here.</p>

                        <div className="space-y-4 bg-[#f6f7f7] border border-[#dcdcde] p-5 rounded-sm">
                           <div className="space-y-1.5">
                              <label className={UI.label}>Custom Excerpt / Summary (Overrides Auto-Generated Snippet)</label>
                              <textarea
                                 rows={3}
                                 value={data.blogSection?.featuredExcerpt || ""}
                                 onChange={(e) => updateSection("blogSection", "featuredExcerpt", e.target.value)}
                                 className={UI.input}
                                 placeholder="Leave blank to automatically extract from the post content..."
                              />
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                 <label className={UI.label}>Custom Headline (Optional Override)</label>
                                 <input
                                    type="text"
                                    value={data.blogSection?.featuredTitle || ""}
                                    onChange={(e) => updateSection("blogSection", "featuredTitle", e.target.value)}
                                    className={UI.input}
                                    placeholder="Leave blank to use post title"
                                 />
                              </div>
                              <div className="space-y-1.5">
                                 <label className={UI.label}>Custom Category Badge (Optional Override)</label>
                                 <input
                                    type="text"
                                    value={data.blogSection?.featuredCategory || ""}
                                    onChange={(e) => updateSection("blogSection", "featuredCategory", e.target.value)}
                                    className={UI.input}
                                    placeholder="Leave blank to use post category"
                                 />
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                        <h3 className={UI.sectionHeader}>3. Selected Posts (Selector)</h3>
                        <p className="text-xs text-[#646970]">Select the articles you want to highlight. The first post will be showcased in the large featured card, and the rest in the recent list.</p>
                        <BlogSelector
                           selectedIds={data.blogSection?.selectedPosts || []}
                           onChange={(ids) => updateSection("blogSection", "selectedPosts", ids)}
                        />
                     </div>
                  </div>
               )}
            </motion.div>
         </AnimatePresence>
      </div>
   );
}
