"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import IconSelector from "@/components/admin/IconSelector";
import BlogSelector from "@/components/admin/BlogSelector";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
   ssr: false,
   loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
   ssr: false,
   loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function AboutEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
   const [activeTab, setActiveTab] = useState("hero");

   useEffect(() => {
      if (data && Object.keys(data).length === 0) {
         setData({
            hero: { headline: { line1: "", line2: "", line3: "" }, description: "", cta: "", ctaLink: "", phone: "", phoneLabel: "", trustLabel: "", stats: [], bgImage: "", bgImageAlt: "" },
            mission: { badge: "", headline: "", highlight: "", description: "", stats: [], principles: [] },
            story: { badge: "", headline: "", highlight: "", description: "", portrait: { image: "", alt: "", badgeLeft: "", badgeRight: "" }, founder: { name: "", title: "", quote: "", bio: "", secondaryQuote: "", footer: "", email: "", social: { linkedin: "" } } },
            values: { badge: "", headline: "", highlight: "", description: "", items: [] },
            capabilities: { badge: "", headline: "", highlight: "", description: "", cta: "" },
            ctaBanner: { badge: "", headline: "", highlight: "", description: "", features: [], primaryCta: "", secondaryCta: "" },
            stats: { badge: "", headline: "", description: "", items: [], trustBadges: [] },
            services: []
         });
      }
   }, [data, setData]);

   if (!data || Object.keys(data).length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

   const updateSection = (section: string, field: string | null, value: any) => {
      setData((prev: any) => {
         const currentData = prev || {};
         if (field) {
            return {
               ...currentData,
               [section]: {
                  ...(currentData[section] || {}),
                  [field]: value
               }
            };
         }
         return {
            ...currentData,
            [section]: value
         };
      });
   };

   const tabs = [
      { id: "hero", label: "1. Hero Section (Top of Page)" },
      { id: "mission", label: "2. Mission Section" },
      { id: "story", label: "3. Founder's Story & Quotes" },
      { id: "values", label: "4. Core Values Grid" },
      { id: "capabilities", label: "5. Capabilities & Service Selection" },
      { id: "stats", label: "6. Impact Stats & Trust Badges" },
      { id: "blog", label: "7. Featured Blog Posts" },
      { id: "ctaBanner", label: "8. Call to Action Banner (Bottom)" }
   ];

   return (
      <div className="bg-white max-w-4xl mx-auto pb-20">
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
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Headline</h3>
                        <div className="space-y-2">
                           <input type="text" value={data.hero?.headline?.line1 || ""} onChange={(e) => updateSection("hero", "headline", { ...(data.hero?.headline || {}), line1: e.target.value })} className={UI.input} placeholder="Line 1" />
                           <input type="text" value={data.hero?.headline?.line2 || ""} onChange={(e) => updateSection("hero", "headline", { ...(data.hero?.headline || {}), line2: e.target.value })} className={UI.input} placeholder="Line 2" />
                           <input type="text" value={data.hero?.headline?.line3 || ""} onChange={(e) => updateSection("hero", "headline", { ...(data.hero?.headline || {}), line3: e.target.value })} className={UI.input} placeholder="Line 3" />
                        </div>
                        <RichTextEditor
                           label="Description"
                           content={data.hero?.description || ""}
                           onChange={(html) => updateSection("hero", "description", html)}
                        />
                        <div className="pt-4 border-t border-[#f0f0f1]">
                           <h4 className={UI.label}>Background Media</h4>
                           <ImageField
                              label="Hero Background"
                              value={data.hero?.bgImage || ""}
                              onChange={(url) => updateSection("hero", "bgImage", url)}
                              altValue={data.hero?.bgImageAlt || ""}
                              onAltChange={(alt) => updateSection("hero", "bgImageAlt", alt)}
                           />
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Contact Info</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Phone</label><input type="text" value={data.hero?.phone || ""} onChange={(e) => updateSection("hero", "phone", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Phone Label</label><input type="text" value={data.hero?.phoneLabel || ""} onChange={(e) => updateSection("hero", "phoneLabel", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>CTA Text</label><input type="text" value={data.hero?.cta || ""} onChange={(e) => updateSection("hero", "cta", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>CTA Link</label><input type="text" value={data.hero?.ctaLink || ""} onChange={(e) => updateSection("hero", "ctaLink", e.target.value)} className={UI.input} placeholder="/contact-us" /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Trust Label</label><input type="text" value={data.hero?.trustLabel || ""} onChange={(e) => updateSection("hero", "trustLabel", e.target.value)} className={UI.input} /></div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Stats</h3>
                        <div className="space-y-4">
                           {(data.hero?.stats || []).map((s: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                                    <button onClick={() => { const newS = data.hero.stats.filter((_: any, idx: number) => idx !== i); updateSection("hero", "stats", newS); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value</label><input type="text" value={s.val || ""} onChange={(e) => { const newS = [...data.hero.stats]; newS[i].val = e.target.value; updateSection("hero", "stats", newS); }} className={UI.inputLarge} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Label</label><input type="text" value={s.label || ""} onChange={(e) => { const newS = [...data.hero.stats]; newS[i].label = e.target.value; updateSection("hero", "stats", newS); }} className={UI.input} /></div>
                                 <IconSelector label="Icon" value={s.icon || ""} onChange={(val) => { const newS = [...data.hero.stats]; newS[i].icon = val; updateSection("hero", "stats", newS); }} />
                              </div>
                           ))}
                           <button onClick={() => updateSection("hero", "stats", [...(data.hero?.stats || []), { val: "", label: "", icon: "Star" }])} className={UI.buttonAdd}>+ Add Stat</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* MISSION SECTION */}
               {activeTab === "mission" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.mission?.badge || ""} onChange={(e) => updateSection("mission", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-2">
                           <label className={UI.label}>Headline & Highlight</label>
                           <input type="text" value={data.mission?.headline || ""} onChange={(e) => updateSection("mission", "headline", e.target.value)} className={UI.input} placeholder="Headline" />
                           <input type="text" value={data.mission?.highlight || ""} onChange={(e) => updateSection("mission", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlight" />
                        </div>
                        <RichTextEditor
                           label="Description"
                           content={data.mission?.description || ""}
                           onChange={(html) => updateSection("mission", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Stats</h3>
                        <div className="space-y-4">
                           {(data.mission?.stats || []).map((s: any, i: number) => (
                              <div key={i} className="flex gap-2">
                                 <input type="text" value={s.value || ""} onChange={(e) => { const newS = [...data.mission.stats]; newS[i].value = e.target.value; updateSection("mission", "stats", newS); }} className={UI.input} placeholder="Value" />
                                 <input type="text" value={s.label || ""} onChange={(e) => { const newS = [...data.mission.stats]; newS[i].label = e.target.value; updateSection("mission", "stats", newS); }} className={UI.input} placeholder="Label" />
                                 <button onClick={() => { const newS = data.mission.stats.filter((_: any, idx: number) => idx !== i); updateSection("mission", "stats", newS); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           ))}
                           <button onClick={() => updateSection("mission", "stats", [...(data.mission?.stats || []), { value: "", label: "" }])} className={UI.buttonAdd}>+ Add Stat</button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Principles</h3>
                        <div className="space-y-4">
                           {(data.mission?.principles || []).map((p: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Principle #{i + 1}</span>
                                    <button onClick={() => { const newP = data.mission.principles.filter((_: any, idx: number) => idx !== i); updateSection("mission", "principles", newP); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Title</label><input type="text" value={p.title || ""} onChange={(e) => { const newP = [...data.mission.principles]; newP[i].title = e.target.value; updateSection("mission", "principles", newP); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value Num</label><input type="text" value={p.val || ""} onChange={(e) => { const newP = [...data.mission.principles]; newP[i].val = e.target.value; updateSection("mission", "principles", newP); }} className={UI.input} /></div>
                                 <RichTextEditor
                                    label="Description"
                                    content={p.desc || ""}
                                    onChange={(html) => { const newP = [...data.mission.principles]; newP[i].desc = html; updateSection("mission", "principles", newP); }}
                                 />
                                 <IconSelector label="Icon" value={p.icon || ""} onChange={(val) => { const newP = [...data.mission.principles]; newP[i].icon = val; updateSection("mission", "principles", newP); }} />
                              </div>
                           ))}
                           <button onClick={() => updateSection("mission", "principles", [...(data.mission?.principles || []), { title: "", desc: "", val: "", icon: "Star" }])} className={UI.buttonAdd}>+ Add Principle</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* STORY SECTION */}
               {activeTab === "story" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.story?.badge || ""} onChange={(e) => updateSection("story", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-2">
                           <label className={UI.label}>Headline & Highlight</label>
                           <input type="text" value={data.story?.headline || ""} onChange={(e) => updateSection("story", "headline", e.target.value)} className={UI.input} placeholder="Headline" />
                           <input type="text" value={data.story?.highlight || ""} onChange={(e) => updateSection("story", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlight" />
                        </div>
                        <QuillEditor
                           label="Description"
                           content={data.story?.description || ""}
                           onChange={(html) => updateSection("story", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Portrait & Badges</h3>
                        <div className="space-y-6 mb-6">
                           <ImageField
                              label="Founder Portrait"
                              value={data.story?.portrait?.image || ""}
                              onChange={(url) => updateSection("story", "portrait", { ...(data.story?.portrait || {}), image: url })}
                              altValue={data.story?.portrait?.alt || ""}
                              onAltChange={(alt) => updateSection("story", "portrait", { ...(data.story?.portrait || {}), alt: alt })}
                           />
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5"><label className={UI.label}>Left Badge</label><input type="text" value={data.story?.portrait?.badgeLeft || ""} onChange={(e) => updateSection("story", "portrait", { ...(data.story?.portrait || {}), badgeLeft: e.target.value })} className={UI.input} /></div>
                              <div className="space-y-1.5"><label className={UI.label}>Right Badge</label><input type="text" value={data.story?.portrait?.badgeRight || ""} onChange={(e) => updateSection("story", "portrait", { ...(data.story?.portrait || {}), badgeRight: e.target.value })} className={UI.input} /></div>
                           </div>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Founder Info</h3>
                        <div className="space-y-4">
                           <div className="space-y-1.5"><label className={UI.label}>Name</label><input type="text" value={data.story?.founder?.name || ""} onChange={(e) => updateSection("story", "founder", { ...(data.story?.founder || {}), name: e.target.value })} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Title</label><input type="text" value={data.story?.founder?.title || ""} onChange={(e) => updateSection("story", "founder", { ...(data.story?.founder || {}), title: e.target.value })} className={UI.input} /></div>
                           <QuillEditor
                              label="Primary Quote"
                              content={data.story?.founder?.quote || ""}
                              onChange={(html) => updateSection("story", "founder", { ...(data.story?.founder || {}), quote: html })}
                           />
                           <QuillEditor
                              label="Secondary Quote"
                              content={data.story?.founder?.secondaryQuote || ""}
                              onChange={(html) => updateSection("story", "founder", { ...(data.story?.founder || {}), secondaryQuote: html })}
                           />
                           <div className="space-y-1.5"><label className={UI.label}>Quote Footer</label><input type="text" value={data.story?.founder?.footer || ""} onChange={(e) => updateSection("story", "founder", { ...(data.story?.founder || {}), footer: e.target.value })} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>Email</label><input type="text" value={data.story?.founder?.email || ""} onChange={(e) => updateSection("story", "founder", { ...(data.story?.founder || {}), email: e.target.value })} className={UI.input} /></div>
                           <div className="space-y-1.5"><label className={UI.label}>LinkedIn</label><input type="text" value={data.story?.founder?.social?.linkedin || ""} onChange={(e) => updateSection("story", "founder", { ...(data.story?.founder || {}), social: { ...(data.story?.founder?.social || {}), linkedin: e.target.value } })} className={UI.input} /></div>
                        </div>
                     </div>
                     <QuillEditor
                        label="Biography"
                        content={typeof data.story?.founder?.bio === 'string' ? data.story.founder.bio : (data.story?.founder?.bio || []).join("")}
                        onChange={(html) => updateSection("story", "founder", { ...(data.story?.founder || {}), bio: html })}
                     />
                  </div>
               )}

               {/* VALUES SECTION */}
               {activeTab === "values" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.values?.badge || ""} onChange={(e) => updateSection("values", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-2">
                           <label className={UI.label}>Headline & Highlight</label>
                           <input type="text" value={data.values?.headline || ""} onChange={(e) => updateSection("values", "headline", e.target.value)} className={UI.input} placeholder="Headline" />
                           <input type="text" value={data.values?.highlight || ""} onChange={(e) => updateSection("values", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlight" />
                        </div>
                        <RichTextEditor
                           label="Description"
                           content={data.values?.description || ""}
                           onChange={(html) => updateSection("values", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Core Values</h3>
                        <div className="space-y-4">
                           {(data.values?.items || []).map((item: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Value #{i + 1}</span>
                                    <button onClick={() => { const newI = data.values.items.filter((_: any, idx: number) => idx !== i); updateSection("values", "items", newI); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Number/Prefix</label><input type="text" value={item.number || ""} onChange={(e) => { const newI = [...data.values.items]; newI[i].number = e.target.value; updateSection("values", "items", newI); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Title</label><input type="text" value={item.title || ""} onChange={(e) => { const newI = [...data.values.items]; newI[i].title = e.target.value; updateSection("values", "items", newI); }} className={UI.input} /></div>
                                 <RichTextEditor
                                    label="Description"
                                    content={item.description || ""}
                                    onChange={(html) => { const newI = [...data.values.items]; newI[i].description = html; updateSection("values", "items", newI); }}
                                 />
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5"><label className={UI.label}>Stat Value</label><input type="text" value={item.stat || ""} onChange={(e) => { const newI = [...data.values.items]; newI[i].stat = e.target.value; updateSection("values", "items", newI); }} className={UI.input} /></div>
                                    <div className="space-y-1.5"><label className={UI.label}>Stat Label</label><input type="text" value={item.statLabel || ""} onChange={(e) => { const newI = [...data.values.items]; newI[i].statLabel = e.target.value; updateSection("values", "items", newI); }} className={UI.input} /></div>
                                 </div>
                                 <IconSelector label="Icon" value={item.icon || ""} onChange={(val) => { const newI = [...data.values.items]; newI[i].icon = val; updateSection("values", "items", newI); }} />
                              </div>
                           ))}
                           <button onClick={() => updateSection("values", "items", [...(data.values?.items || []), { title: "", description: "", number: "", stat: "", statLabel: "", icon: "Star" }])} className={UI.buttonAdd}>+ Add Value</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* CAPABILITIES SECTION */}
               {activeTab === "capabilities" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.capabilities?.badge || ""} onChange={(e) => updateSection("capabilities", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-2">
                           <label className={UI.label}>Headline & Highlight</label>
                           <input type="text" value={data.capabilities?.headline || ""} onChange={(e) => updateSection("capabilities", "headline", e.target.value)} className={UI.input} placeholder="Headline" />
                           <input type="text" value={data.capabilities?.highlight || ""} onChange={(e) => updateSection("capabilities", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlight" />
                        </div>
                        <RichTextEditor
                           label="Description"
                           content={data.capabilities?.description || ""}
                           onChange={(html) => updateSection("capabilities", "description", html)}
                        />
                        <div className="space-y-1.5"><label className={UI.label}>CTA Text</label><input type="text" value={data.capabilities?.cta || ""} onChange={(e) => updateSection("capabilities", "cta", e.target.value)} className={UI.input} /></div>
                     </div>

                     <div className="space-y-6 pt-6 border-t border-slate-100">
                        <h3 className={UI.sectionHeader}>Featured Service Selection</h3>
                        <p className="text-xs text-slate-500 italic">Select which services to feature in the capabilities section on the public About page. Drag and drop or use the arrows to reorder.</p>
                        <ContentSelector
                           type="services"
                           label="Featured Services"
                           selectedItems={data.services || []}
                           onSelect={(items) => updateSection("services", null, items)}
                        />
                     </div>
                  </div>
               )}

               {/* STATS SECTION */}
               {activeTab === "stats" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.stats?.badge || ""} onChange={(e) => updateSection("stats", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Headline</label><input type="text" value={data.stats?.headline || ""} onChange={(e) => updateSection("stats", "headline", e.target.value)} className={UI.input} /></div>
                        <RichTextEditor
                           label="Description"
                           content={data.stats?.description || ""}
                           onChange={(html) => updateSection("stats", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Stat Items</h3>
                        <div className="space-y-4">
                           {(data.stats?.items || []).map((s: any, i: number) => (
                              <div key={i} className={UI.card + " space-y-4"}>
                                 <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                    <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                                    <button onClick={() => { const newS = data.stats.items.filter((_: any, idx: number) => idx !== i); updateSection("stats", "items", newS); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                                 </div>
                                 <div className="space-y-1.5"><label className={UI.label}>Value (Number)</label><input type="number" value={s.value || 0} onChange={(e) => { const newS = [...data.stats.items]; newS[i].value = parseInt(e.target.value); updateSection("stats", "items", newS); }} className={UI.inputLarge} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Suffix (e.g. +, %)</label><input type="text" value={s.suffix || ""} onChange={(e) => { const newS = [...data.stats.items]; newS[i].suffix = e.target.value; updateSection("stats", "items", newS); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Label</label><input type="text" value={s.label || ""} onChange={(e) => { const newS = [...data.stats.items]; newS[i].label = e.target.value; updateSection("stats", "items", newS); }} className={UI.input} /></div>
                                 <div className="space-y-1.5"><label className={UI.label}>Description</label><textarea value={s.description || ""} onChange={(e) => { const newS = [...data.stats.items]; newS[i].description = e.target.value; updateSection("stats", "items", newS); }} rows={2} className={UI.textarea} /></div>
                                 <IconSelector label="Icon" value={s.icon || ""} onChange={(val) => { const newS = [...data.stats.items]; newS[i].icon = val; updateSection("stats", "items", newS); }} />
                              </div>
                           ))}
                           <button onClick={() => updateSection("stats", "items", [...(data.stats?.items || []), { value: 0, label: "", suffix: "", description: "", icon: "Star" }])} className={UI.buttonAdd}>+ Add Stat Item</button>
                        </div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Trust Badges</h3>
                        <div className="space-y-4">
                           {(data.stats?.trustBadges || []).map((t: any, i: number) => (
                              <div key={i} className="flex gap-4 items-center">
                                 <div className="flex-1 space-y-1.5">
                                    <input type="text" value={t.text || ""} onChange={(e) => { const newT = [...data.stats.trustBadges]; newT[i].text = e.target.value; updateSection("stats", "trustBadges", newT); }} className={UI.input} placeholder="Text" />
                                 </div>
                                 <div className="w-48"><IconSelector label="" value={t.icon || ""} onChange={(val) => { const newT = [...data.stats.trustBadges]; newT[i].icon = val; updateSection("stats", "trustBadges", newT); }} /></div>
                                 <button onClick={() => { const newT = data.stats.trustBadges.filter((_: any, idx: number) => idx !== i); updateSection("stats", "trustBadges", newT); }} className="text-[#d63638] mt-2"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           ))}
                           <button onClick={() => updateSection("stats", "trustBadges", [...(data.stats?.trustBadges || []), { text: "", icon: "Award" }])} className={UI.buttonAdd}>+ Add Trust Badge</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* CTA BANNER SECTION */}
               {activeTab === "ctaBanner" && (
                  <div className="space-y-10">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.ctaBanner?.badge || ""} onChange={(e) => updateSection("ctaBanner", "badge", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-2">
                           <label className={UI.label}>Headline & Highlight</label>
                           <input type="text" value={data.ctaBanner?.headline || ""} onChange={(e) => updateSection("ctaBanner", "headline", e.target.value)} className={UI.input} placeholder="Headline" />
                           <input type="text" value={data.ctaBanner?.highlight || ""} onChange={(e) => updateSection("ctaBanner", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlight" />
                        </div>
                        <RichTextEditor
                           label="Description"
                           content={data.ctaBanner?.description || ""}
                           onChange={(html) => updateSection("ctaBanner", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Buttons</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Primary CTA</label><input type="text" value={data.ctaBanner?.primaryCta || ""} onChange={(e) => updateSection("ctaBanner", "primaryCta", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Secondary CTA</label><input type="text" value={data.ctaBanner?.secondaryCta || ""} onChange={(e) => updateSection("ctaBanner", "secondaryCta", e.target.value)} className={UI.input} /></div>
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>3. Features (Bullets)</h3>
                        <div className="space-y-3">
                           {(data.ctaBanner?.features || []).map((f: string, i: number) => (
                              <div key={i} className="flex gap-2">
                                 <input type="text" value={f || ""} onChange={(e) => { const newF = [...data.ctaBanner.features]; newF[i] = e.target.value; updateSection("ctaBanner", "features", newF); }} className={UI.input} />
                                 <button onClick={() => { const newF = data.ctaBanner.features.filter((_: any, idx: number) => idx !== i); updateSection("ctaBanner", "features", newF); }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                              </div>
                           ))}
                           <button onClick={() => updateSection("ctaBanner", "features", [...(data.ctaBanner?.features || []), ""])} className={UI.buttonAdd}>+ Add Feature</button>
                        </div>
                     </div>
                  </div>
               )}

               {/* BLOG SECTION */}
               {activeTab === "blog" && (
                  <div className="space-y-12">
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>1. Header</h3>
                        <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.blogSection?.subtitle || ""} onChange={(e) => updateSection("blogSection", "subtitle", e.target.value)} className={UI.input} /></div>
                        <div className="space-y-1.5"><label className={UI.label}>Headline</label><input type="text" value={data.blogSection?.title || ""} onChange={(e) => updateSection("blogSection", "title", e.target.value)} className={UI.inputLarge} /></div>
                        <RichTextEditor
                           label="Description Narrative"
                           content={data.blogSection?.description || ""}
                           onChange={(html) => updateSection("blogSection", "description", html)}
                        />
                     </div>
                     <div className="space-y-6">
                        <h3 className={UI.sectionHeader}>2. Selected Posts</h3>
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
