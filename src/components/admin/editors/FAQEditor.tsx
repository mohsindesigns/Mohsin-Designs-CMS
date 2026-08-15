"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, 
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload, 
  List, Heart, CircleHelp, Check, Target, Award, Shield, 
  ArrowRight, MessageSquare, Filter, BookOpen, Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function FAQEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && !data.faq) {
       setData({
         faq: {
           section: { headline: "Frequently Asked Questions", description: "Find answers to common questions about our services and process." },
           categories: [
             { id: "all", label: "All Questions" },
             { id: "roofing", label: "Roofing" },
             { id: "decks", label: "Decks" },
             { id: "windows", label: "Windows" }
           ],
           items: []
         }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateFAQ = (section: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const currentData = prev || {};
      const currentFAQ = currentData.faq || {
        section: { headline: "", description: "" },
        categories: [],
        items: []
      };

      const targetSectionData = currentFAQ[section as keyof typeof currentFAQ] || {};

      return {
        ...currentData,
        faq: {
          ...currentFAQ,
          [section]: field ? {
            ...targetSectionData,
            [field]: value,
          } : value,
        },
      };
    });
  };

  const tabs = [
    { id: "header", label: "Support Header", icon: Type, title: "Support Knowledge Base Introduction" },
    { id: "categories", label: "Filter Taxonomy", icon: Filter, title: "Filtering Categories" },
    { id: "items", label: "Q&A Database", icon: CircleHelp, title: "Comprehensive Q&A Database" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Configure the knowledge base to help customers find answers quickly.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="space-y-8 pb-10"
          >
            
            {/* HEADER SECTION */}
            {activeTab === "header" && (
              <div className="max-w-3xl space-y-6">
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline</label>
                       <input type="text" value={data.faq?.section?.headline || ""} onChange={(e) => updateFAQ("section", "headline", e.target.value)} className={UI.inputLarge} />
                    </div>
                    <RichTextEditor 
                        label="Knowledge Intro Narrative" 
                        content={data.faq?.section?.description || ""} 
                        onChange={(html) => updateFAQ("section", "description", html)} 
                    />
                 </div>
              </div>
            )}

            {/* CATEGORIES SECTION */}
            {activeTab === "categories" && (
              <div className="space-y-6">
                 <label className={UI.label}>Filtering Taxonomy</label>
                  <div className="space-y-4">
                     {(data.faq?.categories || []).map((cat: any, i: number) => (
                       <div key={i} className={UI.card + " space-y-4 relative"}>
                          <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-2">
                             <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-[#f0f6fb] text-[#2271b1] rounded-[3px] flex items-center justify-center border border-[#dcdcde]">
                                   <Filter className="w-3 h-3" />
                                </div>
                                <span className="text-[10px] font-bold text-[#646970]">Filter Category #{i+1}</span>
                             </div>
                             <button onClick={() => {
                                const newC = data.faq.categories.filter((_: any, idx: number) => idx !== i);
                                updateFAQ("categories", null, newC);
                             }} className="text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Category Label</label>
                             <input type="text" value={cat.label} onChange={(e) => {
                                  const newC = [...data.faq.categories];
                                  newC[i].label = e.target.value;
                                  newC[i].id = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                  updateFAQ("categories", null, newC);
                                }} className={UI.input + " font-bold"} placeholder="Category Label" />
                             <p className="text-[9px] text-slate-400 font-mono uppercase tracking-tighter">System ID: {cat.id}</p>
                          </div>
                       </div>
                     ))}
                     <button onClick={() => updateFAQ("categories", null, [...(data.faq?.categories || []), { id: "new", label: "New Category" }])} className={UI.buttonAdd}>
                        + Add Category
                     </button>
                  </div>
              </div>
            )}

             {/* ITEMS SECTION */}
            {activeTab === "items" && (
              <div className="space-y-6">
                 <ContentSelector 
                    type="faq" 
                    label="Knowledge Inventory (Select from Global Library)" 
                    selectedItems={data.faq?.items || []} 
                    onSelect={(items) => updateFAQ("items", null, items)} 
                 />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
