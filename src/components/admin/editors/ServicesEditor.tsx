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
import { UI } from "./styles";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

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
    { id: "hero", label: "Hero Banner", title: "1. Hero Banner Section", desc: "Configure top badge, dynamic headlines, description narrative, buttons, and bleed background." },
    { id: "grid", label: "Services Grid Header", title: "2. Services Grid Intro Header", desc: "Introductory eyebrow, title, description, and card action button labels for the catalog." },
    { id: "cta", label: "Bottom CTA Banner", title: "3. Bottom Conversion Banner", desc: "High-converting strategy session CTA banner with portrait photo and action links." },
    { id: "blog", label: "Featured Blog Posts", title: "4. Curated Insights & Articles", desc: "Featured blog articles shown below the services listing." },
  ];

  const currentTabInfo = tabs.find(t => t.id === activeTab) || tabs[0];

  return (
    <div className="bg-white max-w-3xl mx-auto pb-20">
      {/* WP Style Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-8 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button 
              type="button"
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
        <div className="mb-8">
           <h2 className={UI.sectionHeader}>{currentTabInfo.title}</h2>
           <p className="text-[12px] text-[#646970] -mt-2">{currentTabInfo.desc}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-10"
          >

            {/* TAB 1: HERO */}
            {activeTab === "hero" && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Hero Branding & Tagline</h3>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Top Eyebrow Badge</label>
                    <input
                      type="text"
                      value={data.hero?.badgeText || ""}
                      onChange={(e) => updateSection("hero", "badgeText", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. ENGINEERED FOR COMPOUNDING ROI"
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>2. Headline & Description</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className={UI.label}>Headline Highlight (Yellow)</label>
                        <input
                          type="text"
                          value={data.hero?.titleHighlight || ""}
                          onChange={(e) => updateSection("hero", "titleHighlight", e.target.value)}
                          className={UI.inputPrimary}
                          placeholder="Digital Architecture"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={UI.label}>Hero Narrative Description</label>
                      <textarea
                        rows={3}
                        value={data.hero?.description || ""}
                        onChange={(e) => updateSection("hero", "description", e.target.value)}
                        className={UI.textarea}
                        placeholder="From custom Next.js platforms to full-funnel acquisition engines..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>3. Call To Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f6f7f7] p-4 rounded border border-[#dcdcde] space-y-3">
                      <span className="text-xs font-bold text-[#1d2327] uppercase">Primary CTA Button (Yellow)</span>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Button Label</label>
                        <input
                          type="text"
                          placeholder="Schedule Strategy Call"
                          value={data.hero?.ctaPrimary?.label || ""}
                          onChange={(e) => updateSection("hero", "ctaPrimary", { ...(data.hero?.ctaPrimary || {}), label: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Link (URL or Anchor)</label>
                        <input
                          type="text"
                          placeholder="/contact"
                          value={data.hero?.ctaPrimary?.href || ""}
                          onChange={(e) => updateSection("hero", "ctaPrimary", { ...(data.hero?.ctaPrimary || {}), href: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    </div>

                    <div className="bg-[#f6f7f7] p-4 rounded border border-[#dcdcde] space-y-3">
                      <span className="text-xs font-bold text-[#1d2327] uppercase">Secondary CTA Button</span>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Button Label</label>
                        <input
                          type="text"
                          placeholder="Explore Inclusions"
                          value={data.hero?.ctaSecondary?.label || ""}
                          onChange={(e) => updateSection("hero", "ctaSecondary", { ...(data.hero?.ctaSecondary || {}), label: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Link (URL or Anchor)</label>
                        <input
                          type="text"
                          placeholder="#services-grid"
                          value={data.hero?.ctaSecondary?.href || ""}
                          onChange={(e) => updateSection("hero", "ctaSecondary", { ...(data.hero?.ctaSecondary || {}), href: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>4. Bleed Header Background Image</h3>
                  <ImageField
                    label="Hero Background Image (Bleed Header Banner)"
                    value={data.hero?.backgroundImage || data.hero?.bgImage || ""}
                    onChange={(url) => updateSection("hero", "backgroundImage", url)}
                  />
                </div>
              </div>
            )}

            {/* TAB 2: GRID SECTION */}
            {activeTab === "grid" && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Section Headings</h3>
                  <div className="space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <label className={UI.label}>Title Highlight (Yellow)</label>
                        <input
                          type="text"
                          value={data.grid?.titleHighlight || ""}
                          onChange={(e) => updateSection("grid", "titleHighlight", e.target.value)}
                          className={UI.inputPrimary}
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
                        className={UI.textarea}
                        placeholder="Every service is built on scalable modern engineering..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>2. Card Action Label</h3>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Card Action Text (Button label on each grid card)</label>
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
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Banner Headlines</h3>
                  <div className="space-y-4">
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        <label className={UI.label}>Highlight Text</label>
                        <input
                          type="text"
                          value={data.ctaBanner?.titleHighlight || ""}
                          onChange={(e) => updateSection("ctaBanner", "titleHighlight", e.target.value)}
                          className={UI.inputPrimary}
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
                        className={UI.textarea}
                        placeholder="Schedule a free 30-minute technical audit..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>2. Call To Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f6f7f7] p-4 rounded border border-[#dcdcde] space-y-3">
                      <span className="text-xs font-bold text-[#1d2327] uppercase">Primary Action Button</span>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Label</label>
                        <input
                          type="text"
                          placeholder="Book Strategy Session"
                          value={data.ctaBanner?.ctaPrimary?.label || ""}
                          onChange={(e) => updateSection("ctaBanner", "ctaPrimary", { ...(data.ctaBanner?.ctaPrimary || {}), label: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Link</label>
                        <input
                          type="text"
                          placeholder="/contact"
                          value={data.ctaBanner?.ctaPrimary?.href || ""}
                          onChange={(e) => updateSection("ctaBanner", "ctaPrimary", { ...(data.ctaBanner?.ctaPrimary || {}), href: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    </div>

                    <div className="bg-[#f6f7f7] p-4 rounded border border-[#dcdcde] space-y-3">
                      <span className="text-xs font-bold text-[#1d2327] uppercase">Secondary Action Button</span>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Label</label>
                        <input
                          type="text"
                          placeholder="Direct Office Line"
                          value={data.ctaBanner?.ctaSecondary?.label || ""}
                          onChange={(e) => updateSection("ctaBanner", "ctaSecondary", { ...(data.ctaBanner?.ctaSecondary || {}), label: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Link</label>
                        <input
                          type="text"
                          placeholder="/contact"
                          value={data.ctaBanner?.ctaSecondary?.href || ""}
                          onChange={(e) => updateSection("ctaBanner", "ctaSecondary", { ...(data.ctaBanner?.ctaSecondary || {}), href: e.target.value })}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>3. Portrait Graphic / Illustration</h3>
                  <ImageField
                    label="Portrait Image (Arch card on right)"
                    value={data.ctaBanner?.portraitSrc || ""}
                    onChange={(url) => updateSection("ctaBanner", "portraitSrc", url)}
                  />
                </div>
              </div>
            )}

            {/* TAB 4: BLOG */}
            {activeTab === "blog" && (
              <div className="space-y-8">
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Section Heading</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Eyebrow Subtitle</label>
                      <input
                        type="text"
                        value={data.blogSection?.subtitle || ""}
                        onChange={(e) => setData({ ...data, blogSection: { ...(data.blogSection || {}), subtitle: e.target.value } })}
                        className={UI.input}
                        placeholder="LATEST STRATEGIC INSIGHTS"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Title</label>
                      <input
                        type="text"
                        value={data.blogSection?.title || ""}
                        onChange={(e) => setData({ ...data, blogSection: { ...(data.blogSection || {}), title: e.target.value } })}
                        className={UI.inputLarge}
                        placeholder="Engineering & Growth Articles"
                      />
                    </div>
                    <RichTextEditor 
                      label="Description Narrative" 
                      content={data.blogSection?.description || ""} 
                      onChange={(html) => setData({ ...data, blogSection: { ...(data.blogSection || {}), description: html } })} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>2. Curated Articles Selection</h3>
                  <BlogSelector 
                    selectedIds={data.blogSection?.selectedPosts || []} 
                    onChange={(ids) => setData({ ...data, blogSection: { ...(data.blogSection || {}), selectedPosts: ids } })} 
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
