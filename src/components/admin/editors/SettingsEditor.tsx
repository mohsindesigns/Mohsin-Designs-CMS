"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, 
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload, 
  List, Heart, CircleHelp, Check, Target, Award, Shield, 
  ArrowRight, Globe, Share2, Facebook, Instagram, Linkedin,
  Navigation, PanelBottom as FooterIcon, Clock, MapPin, Sparkles,
  Zap, Calendar, Settings as SettingsIcon, MousePointer2, X
} from "lucide-react";
import { UI } from "./styles";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";


export default function SettingsEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("branding");
  const [publishedPages, setPublishedPages] = useState<any[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const res = await fetch("/api/admin/pages");
        const pages = await res.json();
        setPublishedPages(pages.filter((p: any) => p.status === "published"));
      } catch (err) {
        console.error("Failed to fetch pages:", err);
      }
    };
    fetchPages();
  }, []);

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         settings: { siteTitle: "Eagle Revolution", siteTemplate: "%s | Eagle Revolution", favicon: "" },
         navbar: { logo: "", siteTitle: "Eagle Revolution", ctaText: "Book Now", ctaLink: "/contact-us", companyLinks: [] },
         footer: { 
           company: { name: "Eagle Revolution", tagline: "Heritage. Integrity. Precision.", description: "", logo: "" },
           newsletter: { placeholder: "Enter your email", buttonText: "Subscribe" },
           services: { title: "Our Expertise", materials: { title: "Premium Materials", items: [] } },
           contact: { title: "Contact Us", email: "", phone: "", address: "", emergency: "", areas: "" },
           certifications: [],
           social: [],
           marquee: { speed: 30, repeats: 8, texts: ["Heritage", "Precision", "Integrity"] },
           bottom: { copyright: "© 2024 Eagle Revolution", rights: "All Rights Reserved", tagline: "Crafted with Precision", links: [] }
         },
         hours: { monday: "8am - 6pm", saturday: "9am - 3pm", sunday: "Closed" }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateNested = (path: string[], value: any) => {
    const newData = { ...data };
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setData(newData);
  };

  const tabs = [
    { id: "branding", label: "Branding", icon: Sparkles, title: "Site Identity & Branding" },
    { id: "navigation", label: "Navigation", icon: Navigation, title: "Header & Menu Structure" },
    { id: "footer", label: "Footer", icon: FooterIcon, title: "Footer Content & Socials" },
    { id: "vitals", label: "Business Vitals", icon: Clock, title: "Operating Hours & Areas" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  return (
    <div className="bg-white">
      {/* WP Style Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-6 text-[13px] border-b border-[#f0f0f1] pb-1">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button 
              onClick={() => setActiveTab(tab.id)} 
              className={`px-1 py-1 transition-colors ${activeTab === tab.id ? 'text-[#1d2327] font-bold' : 'text-[#2271b1] hover:text-[#135e96]'}`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <div className="mb-6">
           <h2 className={UI.sectionHeader}>{activeTabTitle}</h2>
           <p className="text-[12px] text-[#646970] -mt-2">Manage global configuration, navigation, and brand consistency across the entire site.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8 pb-10">
            
            {/* BRANDING TAB */}
            {activeTab === "branding" && (
              <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                 <div className="space-y-6">
                    <div className={UI.card + " space-y-5"}>
                       <label className={UI.sectionHeader}>Brand Identity</label>
                       <div className="space-y-1.5">
                          <label className={UI.label}>Global Site Title</label>
                          <input type="text" value={data.settings?.siteTitle || ""} onChange={(e) => updateNested(["settings", "siteTitle"], e.target.value)} className={UI.inputLarge} />
                       </div>
                       <div className="space-y-1.5 pt-4 border-t border-[#f0f0f1]">
                           <label className={UI.label}>Static Homepage</label>
                           <p className="text-[10px] text-muted-foreground mb-2">Select which page or service should be served at the root (/) URL.</p>
                           <select 
                             value={data.settings?.homepageId || ""} 
                             onChange={(e) => updateNested(["settings", "homepageId"], e.target.value)} 
                             className={UI.input}
                           >
                              <option value="">Default Home Template</option>
                              <optgroup label="Published Pages">
                                 {publishedPages.map(p => (
                                   <option key={p._id} value={p._id}>{p.title}</option>
                                 ))}
                              </optgroup>
                              <optgroup label="Services">
                                 {(data.services?.services || []).filter((s: any) => !s.status || s.status === 'published').map((s: any) => (
                                   <option key={s._id || s.slug} value={s._id || s.slug}>{s.title}</option>
                                 ))}
                              </optgroup>
                           </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className={UI.label}>Metadata Template (e.g. %s | Brand)</label>
                          <input type="text" value={data.settings?.siteTemplate || ""} onChange={(e) => updateNested(["settings", "siteTemplate"], e.target.value)} className={UI.input + " font-mono text-[11px]"} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-6">
                     <ImageField label="Global Favicon / Icon" value={data.settings?.favicon || ""} onChange={(url: string) => updateNested(["settings", "favicon"], url)} />
                     <ImageField label="Primary Header Logo" value={data.navbar?.logo || ""} onChange={(url: string) => updateNested(["navbar", "logo"], url)} />
                 </div>
              </div>
            )}

            {/* NAVIGATION TAB */}
            {activeTab === "navigation" && (
              <div className="space-y-6">
                 <div className="max-w-3xl space-y-6">
                    <div className={UI.card + " space-y-5"}>
                       <label className={UI.sectionHeader}>Header Action</label>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                             <label className={UI.label}>Navbar CTA Text</label>
                             <input type="text" value={data.navbar?.ctaText || ""} onChange={(e) => updateNested(["navbar", "ctaText"], e.target.value)} className={UI.input} />
                          </div>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Navbar CTA Link</label>
                             <select 
                               value={data.navbar?.ctaLink || ""} 
                               onChange={(e) => updateNested(["navbar", "ctaLink"], e.target.value)} 
                               className={UI.input}
                             >
                                <option value="/contact-us">Contact Portal (Default)</option>
                                <option value="/gallery">Gallery Portfolio</option>
                                {publishedPages.map(p => (
                                  <option key={p._id} value={`/${p.slug}`}>{p.title}</option>
                                ))}
                             </select>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className={UI.label}>Main Menu Links</label>
                    <div className="grid grid-cols-1 gap-4 max-w-4xl">
                       {(data.navbar?.companyLinks || []).map((link: any, i: number) => (
                         <div key={i} className={UI.card + " space-y-4 relative"}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <div className="space-y-1.5">
                                  <label className={UI.label}>Link Label</label>
                                  <input type="text" value={link.label || ""} onChange={(e) => {
                                    const newL = [...(data.navbar?.companyLinks || [])]; newL[i].label = e.target.value; updateNested(["navbar", "companyLinks"], newL);
                                  }} className={UI.input + " font-bold"} placeholder="Link Label" />
                               </div>
                               <div className="space-y-1.5">
                                  <label className={UI.label}>URL Path</label>
                                  <select 
                                    value={link.href} 
                                    onChange={(e) => {
                                      const newL = [...(data.navbar?.companyLinks || [])]; 
                                      newL[i].href = e.target.value; 
                                      updateNested(["navbar", "companyLinks"], newL);
                                    }} 
                                    className={UI.input}
                                  >
                                     <option value="/">Home Page</option>
                                     <option value="/services">Services</option>
                                     <option value="/gallery">Gallery</option>
                                     <option value="/contact-us">Contact</option>
                                     <optgroup label="Custom Published Pages">
                                        {publishedPages.map(p => (
                                          <option key={p._id} value={`/${p.slug}`}>{p.title}</option>
                                        ))}
                                     </optgroup>
                                  </select>
                               </div>
                            </div>
                            
                            <div className="pl-6 border-l border-[#dcdcde] space-y-3">
                               {(link.subLinks || []).map((sub: any, j: number) => (
                                 <div key={j} className="flex items-center gap-3">
                                    <input type="text" value={sub.label || ""} onChange={(e) => {
                                      const newL = [...(data.navbar?.companyLinks || [])]; newL[i].subLinks[j].label = e.target.value; updateNested(["navbar", "companyLinks"], newL);
                                    }} className={UI.input + " py-1 text-[11px]"} placeholder="Sub-link Label" />
                                    <select 
                                      value={sub.href} 
                                      onChange={(e) => {
                                        const newL = [...(data.navbar?.companyLinks || [])]; 
                                        newL[i].subLinks[j].href = e.target.value; 
                                        updateNested(["navbar", "companyLinks"], newL);
                                      }} 
                                      className={UI.input + " py-1 text-[11px]"}
                                    >
                                       <option value="/">Home</option>
                                       {publishedPages.map(p => (
                                         <option key={p._id} value={`/${p.slug}`}>{p.title}</option>
                                       ))}
                                    </select>
                                    <button onClick={() => {
                                      const newL = [...(data.navbar?.companyLinks || [])]; newL[i].subLinks = (link.subLinks || []).filter((_: any, idx: number) => idx !== j); updateNested(["navbar", "companyLinks"], newL);
                                    }} className="text-slate-400 hover:text-[#d63638]"><X className="w-4 h-4" /></button>
                                 </div>
                               ))}
                               <button onClick={() => {
                                 const newL = [...(data.navbar?.companyLinks || [])]; if (!newL[i].subLinks) newL[i].subLinks = [];
                                 newL[i].subLinks.push({ label: "New Sub-link", href: "/" }); updateNested(["navbar", "companyLinks"], newL);
                               }} className="text-[10px] font-bold text-[#2271b1] uppercase hover:underline">+ Add Sub-Menu Link</button>
                            </div>

                            <button onClick={() => {
                               const newL = (data.navbar?.companyLinks || []).filter((_: any, idx: number) => idx !== i); updateNested(["navbar", "companyLinks"], newL);
                            }} className="absolute top-6 right-6 text-slate-400 hover:text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                         </div>
                       ))}
                       <button onClick={() => updateNested(["navbar", "companyLinks"], [...(data.navbar?.companyLinks || []), { label: "New Page", href: "/", icon: "Globe", subLinks: [] }])} className={UI.buttonAdd}>
                          + Insert Header Menu Item
                       </button>
                    </div>
                 </div>
              </div>
            )}

            {/* FOOTER TAB */}
            {activeTab === "footer" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className={UI.label}>Footer Identity</label>
                       <div className={UI.card + " space-y-4"}>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Footer Narrative</label>
                             <RichTextEditor 
                               content={data.footer?.company?.description || ""} 
                               onChange={(val) => updateNested(["footer", "company", "description"], val)} 
                             />
                          </div>
                           <ImageField label="Footer Specific Logo" value={data.footer?.company?.logo || ""} onChange={(url: string) => updateNested(["footer", "company", "logo"], url)} />
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className={UI.label}>Marquee Text Bar</label>
                       <div className={UI.card + " space-y-3"}>
                          {(data.footer?.marquee?.texts || []).map((text: string, idx: number) => (
                            <div key={idx} className="flex gap-2">
                               <input type="text" value={text || ""} onChange={(e) => {
                                  const newT = [...(data.footer?.marquee?.texts || [])]; newT[idx] = e.target.value; updateNested(["footer", "marquee", "texts"], newT);
                               }} className={UI.input + " font-bold uppercase tracking-widest text-[11px]"} />
                               <button onClick={() => {
                                 const newT = (data.footer?.marquee?.texts || []).filter((_: any, i: number) => i !== idx); updateNested(["footer", "marquee", "texts"], newT);
                               }} className="text-slate-400 hover:text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          ))}
                          <button onClick={() => updateNested(["footer", "marquee", "texts"], [...(data.footer?.marquee?.texts || []), "NEW VALUE"])} className="text-[10px] font-bold text-[#2271b1] uppercase hover:underline">+ Add Word</button>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-4">
                       <label className={UI.label}>Bottom Bar & Links</label>
                       <div className={UI.card + " space-y-5"}>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Copyright Text</label>
                             <input type="text" value={data.footer?.bottom?.copyright || ""} onChange={(e) => updateNested(["footer", "bottom", "copyright"], e.target.value)} className={UI.input} />
                          </div>
                          <div className="space-y-2">
                             <label className={UI.label}>Secondary Bar Links</label>
                             <div className="space-y-2">
                                {(data.footer?.bottom?.links || []).map((link: any, idx: number) => (
                                   <div key={idx} className="flex gap-2 items-center">
                                      <input type="text" value={link.label || ""} onChange={(e) => {
                                         const newL = [...(data.footer?.bottom?.links || [])]; newL[idx].label = e.target.value; updateNested(["footer", "bottom", "links"], newL);
                                      }} className={UI.input + " py-1 text-[11px]"} placeholder="Label" />
                                      <select 
                                        value={link.href} 
                                        onChange={(e) => {
                                           const newL = [...(data.footer?.bottom?.links || [])]; newL[idx].href = e.target.value; updateNested(["footer", "bottom", "links"], newL);
                                        }} 
                                        className={UI.input + " py-1 text-[11px]"}
                                      >
                                         <option value="/">Home</option>
                                         <option value="/privacy">Privacy Policy</option>
                                         <option value="/terms">Terms of Service</option>
                                         <optgroup label="Published Content">
                                           {publishedPages.map(p => (
                                             <option key={p._id} value={`/${p.slug}`}>{p.title}</option>
                                           ))}
                                         </optgroup>
                                      </select>
                                      <button onClick={() => {
                                         const newL = (data.footer?.bottom?.links || []).filter((_: any, i: number) => i !== idx); updateNested(["footer", "bottom", "links"], newL);
                                      }} className="text-slate-400 hover:text-[#d63638]"><X className="w-4 h-4" /></button>
                                   </div>
                                 ))}
                                <button onClick={() => updateNested(["footer", "bottom", "links"], [...(data.footer?.bottom?.links || []), { label: "Legal", href: "/legal" }])} className="text-[10px] font-bold text-[#2271b1] uppercase hover:underline">+ Add Legal Link</button>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <label className={UI.label}>Newsletter Config</label>
                       <div className={UI.card + " grid grid-cols-1 sm:grid-cols-2 gap-4"}>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Placeholder</label>
                             <input type="text" value={data.footer?.newsletter?.placeholder || ""} onChange={(e) => updateNested(["footer", "newsletter", "placeholder"], e.target.value)} className={UI.input} />
                          </div>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Btn Text</label>
                             <input type="text" value={data.footer?.newsletter?.buttonText || ""} onChange={(e) => updateNested(["footer", "newsletter", "buttonText"], e.target.value)} className={UI.input} />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* VITALS TAB */}
            {activeTab === "vitals" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                 <div className="space-y-6">
                    <label className={UI.label}>Opening Hours</label>
                    <div className={UI.card + " space-y-3"}>
                       {Object.entries(data.hours || {}).map(([day, val]: [string, any]) => (
                         <div key={day} className="flex items-center justify-between">
                            <label className={UI.label + " mb-0 capitalize"}>{day}</label>
                            <input type="text" value={val || ""} onChange={(e) => updateNested(["hours", day], e.target.value)} className={UI.input + " w-40 text-right font-bold"} />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className={UI.label}>Service Areas Coverage</label>
                    <div className={UI.card}>
                       <RichTextEditor 
                         content={data.footer?.contact?.areas || ""} 
                         onChange={(val) => updateNested(["footer", "contact", "areas"], val)} 
                       />
                    </div>
                 </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
