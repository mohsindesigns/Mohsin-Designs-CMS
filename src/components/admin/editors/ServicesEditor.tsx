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
import ImageField from "@/components/admin/ImageField";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function ServicesEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
      setData({
        hero: {
          badgeText: "ENGINEERED FOR COMPOUNDING ROI",
          titleIntro: "High-Performance Growth &",
          titleHighlight: "Digital Architecture",
          description: "From custom Next.js platforms to full-funnel acquisition engines, we design, engineer, and scale market-leading digital products that dominate competitive categories.",
          ctaPrimary: { label: "Schedule Strategy Call", href: "/contact" },
          ctaSecondary: { label: "Explore Inclusions", href: "#services-grid" }
        },
        grid: {
          eyebrow: "OUR CORE CAPABILITIES",
          titleIntro: "Engineered Services For",
          titleHighlight: "Compounding Growth",
          subtext: "Every service is built on scalable modern engineering, conversion rate science, and relentless performance standards.",
          ctaText: "Explore Scope & Inclusions"
        },
        ctaBanner: {
          eyebrow: "READY TO ACCELERATE?",
          titleIntro: "Let's Build Your Next",
          titleHighlight: "Competitive Edge",
          titleLine2: "Together.",
          description: "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
          ctaPrimary: { label: "Book Strategy Session", href: "/contact" },
          ctaSecondary: { label: "Direct Office Line", href: "/contact" },
          portraitSrc: "/founder.png",
          portraitAlt: "Mohsin Designs Lead Architect"
        }
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateSection = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...(prev?.[section] || {}),
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: "hero", label: "Hero Banner", icon: Type, title: "Hero Section" },
    { id: "grid", label: "Services Grid Header", icon: Layout, title: "Grid Section Intro" },
    { id: "cta", label: "Bottom CTA Banner", icon: Sparkles, title: "Conversion Banner" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Configure header, grid text, and bottom CTA banner for the services overview page.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 pb-10"
          >

            {/* TAB 1: HERO */}
            {activeTab === "hero" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Top Badge Text</label>
                    <input
                      type="text"
                      value={data.hero?.badgeText || ""}
                      onChange={(e) => updateSection("hero", "badgeText", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. ENGINEERED FOR COMPOUNDING ROI"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Headline Prefix / Intro</label>
                      <input
                        type="text"
                        value={data.hero?.titleIntro || ""}
                        onChange={(e) => updateSection("hero", "titleIntro", e.target.value)}
                        className={UI.input}
                        placeholder="High-Performance Growth &"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Headline Highlight (Curved Underline)</label>
                      <input
                        type="text"
                        value={data.hero?.titleHighlight || ""}
                        onChange={(e) => updateSection("hero", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1]"}
                        placeholder="Digital Architecture"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Hero Description</label>
                    <textarea
                      rows={3}
                      value={data.hero?.description || ""}
                      onChange={(e) => updateSection("hero", "description", e.target.value)}
                      className={UI.input}
                      placeholder="From custom Next.js platforms to full-funnel acquisition engines..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#c3c4c7]">
                    <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                      <label className="text-xs font-bold text-[#1d2327]">Primary CTA Button (Yellow / Blue)</label>
                      <input
                        type="text"
                        placeholder="Label"
                        value={data.hero?.ctaPrimary?.label || ""}
                        onChange={(e) => updateSection("hero", "ctaPrimary", { ...(data.hero?.ctaPrimary || {}), label: e.target.value })}
                        className={UI.input}
                      />
                      <input
                        type="text"
                        placeholder="Link / URL (e.g. /contact)"
                        value={data.hero?.ctaPrimary?.href || ""}
                        onChange={(e) => updateSection("hero", "ctaPrimary", { ...(data.hero?.ctaPrimary || {}), href: e.target.value })}
                        className={UI.input + " font-mono text-xs"}
                      />
                    </div>
                    <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                      <label className="text-xs font-bold text-[#1d2327]">Secondary CTA Button</label>
                      <input
                        type="text"
                        placeholder="Label"
                        value={data.hero?.ctaSecondary?.label || ""}
                        onChange={(e) => updateSection("hero", "ctaSecondary", { ...(data.hero?.ctaSecondary || {}), label: e.target.value })}
                        className={UI.input}
                      />
                      <input
                        type="text"
                        placeholder="Link / Anchor (e.g. #services-grid)"
                        value={data.hero?.ctaSecondary?.href || ""}
                        onChange={(e) => updateSection("hero", "ctaSecondary", { ...(data.hero?.ctaSecondary || {}), href: e.target.value })}
                        className={UI.input + " font-mono text-xs"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#c3c4c7]">
                    <ImageField
                      label="Hero Background Image (Bleed Header Banner)"
                      value={data.hero?.backgroundImage || data.hero?.bgImage || ""}
                      onChange={(url) => updateSection("hero", "backgroundImage", url)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GRID SECTION */}
            {activeTab === "grid" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Eyebrow Badge Tag</label>
                    <input
                      type="text"
                      value={data.grid?.eyebrow || ""}
                      onChange={(e) => updateSection("grid", "eyebrow", e.target.value)}
                      className={UI.input}
                      placeholder="OUR CORE CAPABILITIES"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Title Intro</label>
                      <input
                        type="text"
                        value={data.grid?.titleIntro || ""}
                        onChange={(e) => updateSection("grid", "titleIntro", e.target.value)}
                        className={UI.input}
                        placeholder="Engineered Services For"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight (Curved Underline)</label>
                      <input
                        type="text"
                        value={data.grid?.titleHighlight || ""}
                        onChange={(e) => updateSection("grid", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1]"}
                        placeholder="Compounding Growth"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Grid Subtitle / Description</label>
                    <textarea
                      rows={2}
                      value={data.grid?.subtext || ""}
                      onChange={(e) => updateSection("grid", "subtext", e.target.value)}
                      className={UI.input}
                      placeholder="Every service is built on scalable modern engineering..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Card Action Text (Button Label on each card)</label>
                    <input
                      type="text"
                      value={data.grid?.ctaText || ""}
                      onChange={(e) => updateSection("grid", "ctaText", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Explore Scope & Inclusions"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CTA BANNER */}
            {activeTab === "cta" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Eyebrow Tag</label>
                    <input
                      type="text"
                      value={data.ctaBanner?.eyebrow || ""}
                      onChange={(e) => updateSection("ctaBanner", "eyebrow", e.target.value)}
                      className={UI.input}
                      placeholder="READY TO ACCELERATE?"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={data.ctaBanner?.titleIntro || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleIntro", e.target.value)}
                        className={UI.input}
                        placeholder="Let's Build Your Next"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Cursive Highlight</label>
                      <input
                        type="text"
                        value={data.ctaBanner?.titleHighlight || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleHighlight", e.target.value)}
                        className={UI.input + " font-bold border-[#2271b1] text-amber-600"}
                        placeholder="Competitive Edge"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Line 2</label>
                      <input
                        type="text"
                        value={data.ctaBanner?.titleLine2 || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleLine2", e.target.value)}
                        className={UI.input}
                        placeholder="Together."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Description</label>
                    <textarea
                      rows={3}
                      value={data.ctaBanner?.description || ""}
                      onChange={(e) => updateSection("ctaBanner", "description", e.target.value)}
                      className={UI.input}
                      placeholder="Schedule a free 30-minute technical audit..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#c3c4c7]">
                    <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                      <label className="text-xs font-bold text-[#1d2327]">Primary Button</label>
                      <input
                        type="text"
                        placeholder="Label"
                        value={data.ctaBanner?.ctaPrimary?.label || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaPrimary", { ...(data.ctaBanner?.ctaPrimary || {}), label: e.target.value })}
                        className={UI.input}
                      />
                      <input
                        type="text"
                        placeholder="Link / URL"
                        value={data.ctaBanner?.ctaPrimary?.href || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaPrimary", { ...(data.ctaBanner?.ctaPrimary || {}), href: e.target.value })}
                        className={UI.input + " font-mono text-xs"}
                      />
                    </div>
                    <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                      <label className="text-xs font-bold text-[#1d2327]">Secondary Button</label>
                      <input
                        type="text"
                        placeholder="Label"
                        value={data.ctaBanner?.ctaSecondary?.label || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaSecondary", { ...(data.ctaBanner?.ctaSecondary || {}), label: e.target.value })}
                        className={UI.input}
                      />
                      <input
                        type="text"
                        placeholder="Link / URL"
                        value={data.ctaBanner?.ctaSecondary?.href || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaSecondary", { ...(data.ctaBanner?.ctaSecondary || {}), href: e.target.value })}
                        className={UI.input + " font-mono text-xs"}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-3 border-t border-[#c3c4c7]">
                    <ImageField
                      label="Portrait Image (Arch card on right)"
                      value={data.ctaBanner?.portraitSrc || ""}
                      onChange={(url) => updateSection("ctaBanner", "portraitSrc", url)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: BLOG */}
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
