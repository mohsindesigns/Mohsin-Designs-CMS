"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutTemplate, Type, Image as ImageIcon, 
  Plus, Trash2, Loader2,
  MapPin, Calendar, Layers, Sparkles
} from "lucide-react";
import React from "react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";


export default function GalleryEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         galleryPage: {
           header: { badge: "Our Work", titlePrefix: "Project", titleHighlight: "Gallery", titleSuffix: "", description: "Browse our completed projects across St. Louis." }
         },
         portfolio: {
           projects: []
         }
       });
    } else if (data && data.galleryPage?.header?.title && !data.galleryPage?.header?.titlePrefix && !data.galleryPage?.header?.titleHighlight) {
      // Migrate legacy single title field to the new three-part highlight system
      const words = (data.galleryPage.header.title as string).split(" ");
      const prefix = words.length > 1 ? words.slice(0, Math.ceil(words.length / 2)).join(" ") : words[0];
      const highlight = words.length > 1 ? words.slice(Math.ceil(words.length / 2)).join(" ") : "";
      setData({
        ...data,
        galleryPage: {
          ...data.galleryPage,
          header: {
            ...data.galleryPage.header,
            titlePrefix: prefix,
            titleHighlight: highlight,
            titleSuffix: ""
          }
        }
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateHeader = (field: string, value: any) => {
    setData({
      ...data,
      galleryPage: {
        ...(data.galleryPage || {}),
        header: {
          ...(data.galleryPage?.header || {}),
          [field]: value
        }
      }
    });
  };

  const updateProjects = (value: any) => {
    setData({
      ...data,
      portfolio: {
        ...(data.portfolio || {}),
        projects: value
      }
    });
  };

  const tabs = [
    { id: "header", label: "Gallery Header", icon: Type, title: "Portfolio Introduction" },
    { id: "projects", label: "Project Showcases", icon: ImageIcon, title: "Project Management" },
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
        </div>

        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="space-y-8"
          >
            
            {/* HEADER SECTION */}
            {activeTab === "header" && (
              <div className="max-w-3xl space-y-6">
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Gallery Badge</label>
                       <input type="text" value={data.galleryPage?.header?.badge || ""} onChange={(e) => updateHeader("badge", e.target.value)} className={UI.input} />
                    </div>
                     <div className="space-y-1.5">
                        <label className={UI.label}>Main Headline (With Highlight)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <input
                            type="text"
                            value={data.galleryPage?.header?.titlePrefix || ""}
                            onChange={(e) => updateHeader("titlePrefix", e.target.value)}
                            className={UI.input}
                            placeholder="Prefix (e.g. Project)"
                          />
                          <input
                            type="text"
                            value={data.galleryPage?.header?.titleHighlight || ""}
                            onChange={(e) => updateHeader("titleHighlight", e.target.value)}
                            className={UI.input + " text-[#2271b1] font-bold bg-[#f0f6fb]"}
                            placeholder="Highlight (e.g. Gallery)"
                          />
                          <input
                            type="text"
                            value={data.galleryPage?.header?.titleSuffix || ""}
                            onChange={(e) => updateHeader("titleSuffix", e.target.value)}
                            className={UI.input}
                            placeholder="Suffix (Optional)"
                          />
                        </div>
                        <p className="text-[11px] text-[#8c8f94] mt-1">The <span className="font-semibold text-[#2271b1]">Highlight</span> word will appear with a colored accent on the front-end.</p>
                     </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Intro Description</label>
                       <RichTextEditor 
                         content={data.galleryPage?.header?.description || ""} 
                         onChange={(val) => updateHeader("description", val)} 
                       />
                    </div>
                 </div>
              </div>
            )}

             {/* PROJECTS SECTION */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                 <ContentSelector 
                    type="projects" 
                    label="Showcase Portfolio" 
                    selectedItems={data.portfolio?.projects || []} 
                    onSelect={(items) => updateProjects(items)} 
                 />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
