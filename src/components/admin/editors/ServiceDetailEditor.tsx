"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Type, Image as ImageIcon, 
  Plus, Trash2, Mail, List, Heart, CircleHelp, 
  Check, Target, Award, Shield, ArrowRight, 
  Settings, Info, Box, TrendingUp, X
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import BlogSelector from "@/components/admin/BlogSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function ServiceDetailEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("identity");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         title: "New Service",
         tagline: "",
         overviewTitle: "",
         overview: "",
         overviewImage: "",
         badge: "Service Offering",
         features: [{ text: "", icon: "CheckCircle" }],
         stats: [{ label: "", value: "", icon: "Shield" }],
         benefits: [{ title: "", description: "", icon: "Zap" }],
         process: [{ title: "", description: "", icon: "Settings" }],
         faq: [{ question: "", answer: "" }],
         cta: { text: "Start Your Project", link: "/contact-us" }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateField = (field: string, value: any) => {
    setData({
      ...data,
      [field]: value,
    });
  };

  const tabs = [
    { id: "identity", label: "Core Identity", title: "Service Core Branding" },
    { id: "features", label: "Capabilities", title: "Features & Performance" },
    { id: "benefits", label: "Value", title: "Consumer Benefits" },
    { id: "process", label: "Methodology", title: "Workflow Process" },
    { id: "faq", label: "Support", title: "Service FAQ" },
    { id: "cta", label: "Conversion", title: "Action Logic" },
    { id: "blog", label: "Insights", title: "Related Blog Posts" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  return (
    <div className="bg-white max-w-3xl mx-auto pb-20">
      {/* WP Style Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-8 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
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

      <div className="space-y-6">
        <div className="mb-10">
           <h2 className={UI.sectionHeader}>{activeTabTitle}</h2>
           <p className="text-[12px] text-[#646970] -mt-2">Configure the technical and narrative details for this service.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
            className="space-y-12"
          >
            {/* IDENTITY SECTION */}
            {activeTab === "identity" && (
              <div className="space-y-10">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Hero Branding</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Service Badge</label>
                      <input type="text" value={data.badge || ""} onChange={(e) => updateField("badge", e.target.value)} className={UI.input} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Service Name</label>
                      <input type="text" value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} className={UI.inputLarge} />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Hero Tagline</label>
                      <input type="text" value={data.tagline || ""} onChange={(e) => updateField("tagline", e.target.value)} className={UI.input} />
                    </div>
                  </div>
                </div>

                <div className="space-y-6 border-t border-[#f0f0f1] pt-10">
                  <h3 className={UI.sectionHeader}>2. Detailed Narrative</h3>
                  <div className="space-y-6">
                    <ImageField label="Featured Image" value={data.overviewImage || ""} onChange={(url: string) => updateField("overviewImage", url)} altValue={data.overviewImageAlt || ""} onAltChange={(alt: string) => updateField("overviewImageAlt", alt)} />
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className={UI.label}>Headline</label>
                        <input type="text" value={data.overviewTitle || ""} onChange={(e) => updateField("overviewTitle", e.target.value)} className={UI.input + " font-bold"} />
                      </div>
                      <RichTextEditor 
                        label="Long Description" 
                        content={data.overview || ""} 
                        onChange={(html) => updateField("overview", html)} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FEATURES & CAPABILITIES */}
            {activeTab === "features" && (
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h3 className={UI.sectionHeader}>1. Technical Features</h3>
                    <div className="space-y-4">
                       {(Array.isArray(data.features) ? data.features : []).map((f: any, i: number) => (
                         <div key={i} className={UI.card + " space-y-4 relative group"}>
                            <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                               <span className="text-[10px] font-bold text-[#646970] uppercase">Feature #{i+1}</span>
                               <button onClick={() => {
                                 const newF = (data.features || []).filter((_: any, idx: number) => idx !== i); updateField("features", newF);
                               }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className={UI.label}>Label</label>
                                  <input 
                                    type="text" 
                                    value={(typeof f === 'string' ? f : f.text) || ""} 
                                    onChange={(e) => {
                                      const newF = [...(data.features || [])]; 
                                      if (typeof f === 'string') {
                                        newF[i] = { text: e.target.value, icon: "CheckCircle" };
                                      } else {
                                        newF[i] = { ...newF[i], text: e.target.value };
                                      }
                                      updateField("features", newF);
                                    }} 
                                    className={UI.input + " font-bold"} 
                                  />
                               </div>
                               <IconSelector 
                                  label="Icon Representation"
                                  value={f.icon || "CheckCircle"} 
                                  onChange={(val) => {
                                    const newF = [...(data.features || [])]; 
                                    if (typeof f === 'string') {
                                      newF[i] = { text: f, icon: val };
                                    } else {
                                      newF[i] = { ...newF[i], icon: val };
                                    }
                                    updateField("features", newF);
                                  }} 
                               />
                            </div>
                         </div>
                       ))}
                       <button onClick={() => updateField("features", [...(data.features || []), { text: "", icon: "CheckCircle" }])} className={UI.buttonAdd}>+ Add Feature</button>
                    </div>
                 </div>

                 <div className="space-y-6 border-t border-[#f0f0f1] pt-10">
                    <h3 className={UI.sectionHeader}>2. Impact Metrics</h3>
                    <div className="space-y-4">
                       {(Array.isArray(data.stats) ? data.stats : []).map((s: any, i: number) => (
                         <div key={i} className={UI.card + " space-y-4"}>
                            <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-2">
                               <span className="text-[10px] font-bold text-[#646970] uppercase">Metric #{i+1}</span>
                               <button onClick={() => {
                                 const newS = (data.stats || []).filter((_: any, idx: number) => idx !== i); updateField("stats", newS);
                               }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                            </div>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                  <label className={UI.label}>Metric Value</label>
                                  <input 
                                    type="text" 
                                    value={s.value || ""} 
                                    onChange={(e) => {
                                      const newS = [...(data.stats || [])]; 
                                      newS[i] = { ...newS[i], value: e.target.value }; 
                                      updateField("stats", newS);
                                    }} 
                                    className={UI.inputLarge} 
                                    placeholder="500+" 
                                  />
                               </div>
                               <div className="space-y-1.5">
                                  <label className={UI.label}>Label</label>
                                  <input 
                                    type="text" 
                                    value={s.label || ""} 
                                    onChange={(e) => {
                                      const newS = [...(data.stats || [])]; 
                                      newS[i] = { ...newS[i], label: e.target.value }; 
                                      updateField("stats", newS);
                                    }} 
                                    className={UI.input} 
                                  />
                               </div>
                               <IconSelector 
                                 label="Icon"
                                 value={s.icon || "Shield"} 
                                 onChange={(val) => {
                                   const newS = [...(data.stats || [])]; 
                                   newS[i] = { ...newS[i], icon: val }; 
                                   updateField("stats", newS);
                                 }} 
                               />
                            </div>
                         </div>
                       ))}
                       <button onClick={() => updateField("stats", [...(data.stats || []), { value: "", label: "", icon: "Shield" }])} className={UI.buttonAdd}>+ Add Stat</button>
                    </div>
                 </div>
              </div>
            )}

            {/* BENEFITS SECTION */}
            {activeTab === "benefits" && (
              <div className="space-y-8">
                 <h3 className={UI.sectionHeader}>Key Value Propositions</h3>
                 <div className="space-y-6">
                    {(Array.isArray(data.benefits) ? data.benefits : []).map((b: any, i: number) => (
                      <div key={i} className={UI.card + " space-y-6"}>
                         <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                            <span className="text-[10px] font-bold text-[#646970] uppercase">Benefit #{i+1}</span>
                            <button onClick={() => {
                              const newB = (data.benefits || []).filter((_: any, idx: number) => idx !== i); updateField("benefits", newB);
                            }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <div className="space-y-6">
                            <IconSelector label="Visual Icon" value={b.icon || "Zap"} onChange={(val) => {
                               const newB = [...(data.benefits || [])]; newB[i].icon = val; updateField("benefits", newB);
                            }} />
                            <div className="space-y-1.5">
                               <label className={UI.label}>Headline</label>
                               <input type="text" value={b.title} onChange={(e) => {
                                  const newB = [...(data.benefits || [])]; newB[i].title = e.target.value; updateField("benefits", newB);
                               }} className={UI.inputLarge} />
                            </div>
                             <RichTextEditor 
                                label="Narrative" 
                                content={b.description} 
                                onChange={(html) => { const newB = [...(data.benefits || [])]; newB[i].description = html; updateField("benefits", newB); }} 
                             />
                         </div>
                      </div>
                    ))}
                    <button onClick={() => updateField("benefits", [...(data.benefits || []), { title: "", description: "", icon: "Zap" }])} className={UI.buttonAdd}>+ Add Benefit</button>
                 </div>
              </div>
            )}

            {/* WORKFLOW PROCESS */}
            {activeTab === "process" && (
              <div className="space-y-8">
                 <h3 className={UI.sectionHeader}>Project Methodology</h3>
                 <div className="space-y-6">
                    {(Array.isArray(data.process) ? data.process : []).map((p: any, i: number) => (
                      <div key={i} className={UI.card + " space-y-6 relative"}>
                         <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                            <div className="flex items-center gap-3">
                               <div className="w-6 h-6 bg-[#2271b1] text-white rounded-full flex items-center justify-center text-[11px] font-bold">{i+1}</div>
                               <span className="text-[10px] font-bold text-[#646970] uppercase tracking-widest">Phase</span>
                            </div>
                            <button onClick={() => {
                              const newP = (data.process || []).filter((_: any, idx: number) => idx !== i); updateField("process", newP);
                            }} className="text-[#d63638]"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         <div className="space-y-6">
                            <IconSelector label="Phase Icon" value={p.icon || "Settings"} onChange={(val) => {
                               const newP = [...(data.process || [])]; newP[i].icon = val; updateField("process", newP);
                            }} />
                            <div className="space-y-1.5">
                               <label className={UI.label}>Phase Title</label>
                               <input type="text" value={p.title} onChange={(e) => {
                                 const newP = [...(data.process || [])]; newP[i].title = e.target.value; updateField("process", newP);
                               }} className={UI.input + " font-bold"} />
                            </div>
                             <RichTextEditor 
                                label="Process Details" 
                                content={p.description} 
                                onChange={(html) => { const newP = [...(data.process || [])]; newP[i].description = html; updateField("process", newP); }} 
                             />
                         </div>
                      </div>
                    ))}
                    <button onClick={() => updateField("process", [...(data.process || []), { title: "", description: "", icon: "Settings" }])} className={UI.buttonAdd}>+ Add Methodology Phase</button>
                 </div>
              </div>
            )}

            {/* FAQ SECTION */}
            {activeTab === "faq" && (
              <div className="space-y-6">
                 <h3 className={UI.sectionHeader}>Service Support</h3>
                 <ContentSelector 
                    type="faq" 
                    label="Associated FAQ Items" 
                    selectedItems={(() => {
                      if (Array.isArray(data.faq)) return data.faq;
                      if (Array.isArray(data.faq?.questions)) return data.faq.questions;
                      return [];
                    })()} 
                    onSelect={(items) => updateField("faq", items)} 
                 />
              </div>
            )}

            {/* CTA SECTION */}
            {activeTab === "cta" && (
              <div className="space-y-6">
                 <h3 className={UI.sectionHeader}>Conversion Strategy</h3>
                 <div className={UI.card + " space-y-6"}>
                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className={UI.label}>Button Call-to-Action</label>
                          <input type="text" value={data.cta?.text || ""} onChange={(e) => updateField("cta", { ...(data.cta || {}), text: e.target.value })} className={UI.input} />
                       </div>
                       <div className="space-y-1.5">
                          <label className={UI.label}>Target Destination (URL)</label>
                          <input type="text" value={data.cta?.link || ""} onChange={(e) => updateField("cta", { ...(data.cta || {}), link: e.target.value })} className={UI.input} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* BLOG SECTION */}
            {activeTab === "blog" && (
              <div className="space-y-12">
                 <div className="space-y-6">
                    <h3 className={UI.sectionHeader}>1. Header</h3>
                    <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.blogSection?.subtitle || ""} onChange={(e) => updateField("blogSection", { ...(data.blogSection || {}), subtitle: e.target.value })} className={UI.input} /></div>
                    <div className="space-y-1.5"><label className={UI.label}>Headline</label><input type="text" value={data.blogSection?.title || ""} onChange={(e) => updateField("blogSection", { ...(data.blogSection || {}), title: e.target.value })} className={UI.inputLarge} /></div>
                    <RichTextEditor 
                       label="Description Narrative" 
                       content={data.blogSection?.description || ""} 
                       onChange={(html) => updateField("blogSection", { ...(data.blogSection || {}), description: html })} 
                    />
                 </div>
                 <div className="space-y-6">
                    <h3 className={UI.sectionHeader}>2. Selected Posts</h3>
                    <BlogSelector 
                     selectedIds={data.blogSection?.selectedPosts || []} 
                     onChange={(ids) => updateField("blogSection", { ...(data.blogSection || {}), selectedPosts: ids })} 
                    />
                 </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
