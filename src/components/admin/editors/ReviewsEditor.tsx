"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Type, Quote
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function ReviewsEditor({ data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         testimonials: {
           section: { badge: "Social Proof", headline: "What Our Customers Say", description: "Discover why homeowners across St. Louis trust Eagle Revolution." },
           testimonials: [],
           stats: { rating: 5.0, count: 500, label: "Google Reviews" }
         }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateTestimonials = (section: string, field: string | null, value: any) => {
    const currentData = data.testimonials || {
      section: { badge: "", headline: "", description: "" },
      testimonials: [],
      stats: {}
    };

    const targetSectionData = currentData[section as keyof typeof currentData] || {};

    setData({
      ...data,
      testimonials: {
        ...currentData,
        [section]: field ? {
          ...targetSectionData,
          [field]: value,
        } : value,
      },
    });
  };

  const tabs = [
    { id: "header", label: "Review Header", icon: Type, title: "Social Proof Introduction" },
    { id: "items", label: "Testimonials", icon: Quote, title: "Individual Review Management" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Manage testimonials and global social proof metrics.</p>
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
                       <label className={UI.label}>Section Badge</label>
                       <input type="text" value={data.testimonials?.section?.badge || ""} onChange={(e) => updateTestimonials("section", "badge", e.target.value)} className={UI.input} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline</label>
                       <input type="text" value={data.testimonials?.section?.headline || ""} onChange={(e) => updateTestimonials("section", "headline", e.target.value)} className={UI.inputLarge} />
                    </div>
                    <RichTextEditor 
                        label="Intro Narrative" 
                        content={data.testimonials?.section?.description || ""} 
                        onChange={(html) => updateTestimonials("section", "description", html)} 
                    />
                 </div>

                 <div className="space-y-6">
                    <label className={UI.label}>Review Summary Stats</label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className={UI.card + " space-y-1.5"}>
                          <label className={UI.label}>Avg Rating</label>
                          <input type="text" value={data.testimonials?.stats?.rating || ""} onChange={(e) => updateTestimonials("stats", "rating", e.target.value)} className={UI.inputLarge} />
                       </div>
                       <div className={UI.card + " space-y-1.5"}>
                          <label className={UI.label}>Total Count</label>
                          <input type="text" value={data.testimonials?.stats?.count || ""} onChange={(e) => updateTestimonials("stats", "count", e.target.value)} className={UI.inputLarge} />
                       </div>
                       <div className={UI.card + " space-y-1.5"}>
                          <label className={UI.label}>Source Label</label>
                          <input type="text" value={data.testimonials?.stats?.label || ""} onChange={(e) => updateTestimonials("stats", "label", e.target.value)} className={UI.input} />
                       </div>
                    </div>
                 </div>
              </div>
            )}

             {/* TESTIMONIALS SECTION */}
            {activeTab === "items" && (
              <div className="space-y-6">
                 <ContentSelector 
                    type="reviews" 
                    label="Review Repository (Select from Managed Inventory)" 
                    selectedItems={data.testimonials?.testimonials || []} 
                    onSelect={(items) => updateTestimonials("testimonials", null, items)} 
                 />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
