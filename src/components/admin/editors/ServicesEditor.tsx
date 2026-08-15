"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon,
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload,
  List, Heart, CircleHelp, Check, Target, Award, Shield,
  ArrowRight, Zap, Globe, ShieldCheck, Building2, Droplets, Building,
  Home, Layout, TreePine, TrendingUp, BadgeCheck, Sparkles, Box, PenTool as Tool
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
import BlogSelector from "@/components/admin/BlogSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function ServicesEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
      setData({
        services: {
          badge: "Our Services",
          headline: { prefix: "Comprehensive Solutions for", highlight: "Modern Living", suffix: "" },
          description: "Discover our range of premium roofing, exterior, and renovation services tailored to your needs.",
          services: []
        }
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateServices = (section: string | null, field: string | null, value: any) => {
    setData((prev: any) => {
      const currentData = prev || {};
      const servicesContent = currentData.services || {
        badge: "",
        headline: { prefix: "", highlight: "", suffix: "" },
        description: "",
        services: []
      };

      let newValue = value;
      if (typeof value === 'function') {
        const currentValue = section ? servicesContent[section as keyof typeof servicesContent] : servicesContent;
        const targetValue = field && section ? (currentValue as any)[field] : currentValue;
        newValue = value(targetValue);
      }

      if (!section) {
        return {
          ...currentData,
          services: { ...servicesContent, [field as string]: newValue }
        };
      }

      const targetSectionData = servicesContent[section as keyof typeof servicesContent] || {};

      return {
        ...currentData,
        services: {
          ...servicesContent,
          [section]: field ? {
            ...targetSectionData,
            [field]: newValue,
          } : newValue,
        },
      };
    });
  };

  const tabs = [
    { id: "header", label: "Page Introduction", icon: Type, title: "Services Hero Narrative" },
    { id: "catalog", label: "Service Catalog", icon: List, title: "Individual Service Management" },
    { id: "blog", label: "Featured Blog Posts", icon: Star, title: "Curate Blog Content" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Configure the global services overview page and manage individual offerings.</p>
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
                    <label className={UI.label}>Intro Badge</label>
                    <input type="text" value={data.services?.badge || ""} onChange={(e) => updateServices(null, "badge", e.target.value)} className={UI.input} />
                  </div>
                  <div className="space-y-4">
                    <label className={UI.label}>Main Headline Architect</label>
                    <div className="space-y-2">
                      <input type="text" value={data.services?.headline?.prefix || ""} onChange={(e) => updateServices("headline", "prefix", e.target.value)} className={UI.input} placeholder="Prefix Text" />
                      <input type="text" value={data.services?.headline?.highlight || ""} onChange={(e) => updateServices("headline", "highlight", e.target.value)} className={UI.input + " font-bold border-[#2271b1]"} placeholder="Highlighted Text" />
                      <input type="text" value={data.services?.headline?.suffix || ""} onChange={(e) => updateServices("headline", "suffix", e.target.value)} className={UI.input} placeholder="Suffix Text" />
                    </div>
                  </div>
                  <RichTextEditor 
                    label="Page Narrative" 
                    content={data.services?.description || ""} 
                    onChange={(html) => updateServices(null, "description", html)} 
                  />
                </div>
              </div>
            )}

             {/* CATALOG SECTION */}
            {activeTab === "catalog" && (
              <div className="space-y-6">
                 <ContentSelector 
                    type="services" 
                    label="Service Catalog (Select from Managed Inventory)" 
                    selectedItems={data.services?.services || []} 
                    onSelect={(items) => updateServices(null, "services", items)} 
                 />
              </div>
            )}

            {/* BLOG SECTION */}
            {activeTab === "blog" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                   <div className="space-y-1.5"><label className={UI.label}>Badge</label><input type="text" value={data.blogSection?.subtitle || ""} onChange={(e) => setData({ ...data, blogSection: { ...(data.blogSection || {}), subtitle: e.target.value } })} className={UI.input} /></div>
                   <div className="space-y-1.5"><label className={UI.label}>Headline</label><input type="text" value={data.blogSection?.title || ""} onChange={(e) => setData({ ...data, blogSection: { ...(data.blogSection || {}), title: e.target.value } })} className={UI.inputLarge} /></div>
                   <RichTextEditor 
                      label="Description Narrative" 
                      content={data.blogSection?.description || ""} 
                      onChange={(html) => setData({ ...data, blogSection: { ...(data.blogSection || {}), description: html } })} 
                   />
                </div>
                <BlogSelector 
                  selectedIds={data.blogSection?.selectedPosts || []} 
                  onChange={(ids) => setData({ ...data, blogSection: { ...(data.blogSection || {}), selectedPosts: ids } })} 
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
