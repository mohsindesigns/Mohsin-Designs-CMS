"use client";

import React, { useState, useEffect } from "react";
import {
  Save, Loader2, Type, Image as ImageIcon,
  Sparkles, BookOpen, Star, Filter, Grid, Check,
  Layers, Settings, Tag, Plus, Trash2
} from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import BlogSelector from "@/components/admin/BlogSelector";
import IconSelector from "@/components/admin/IconSelector";

const DEFAULT_BLOG_DATA = {
  hero: {
    badgeText: "EXPLORE OUR EDITORIAL // INSIGHTS & STRATEGY",
    titleLine1: "Modern Engineering &",
    titleHighlight: "Growth Insights",
    description: "Actionable blueprints, architectural deep-dives, and conversion rate science to build compounding market advantage.",
    backgroundImage: "/portfolio_hero_bg.png",
    heroBgImage: "/portfolio_hero_bg.png",
    heroBgAlt: "Blog Header Background",
    ctaPrimary: { label: "Explore Articles", href: "#articles" },
    ctaSecondary: { label: "Schedule Strategy Call", href: "/contact" }
  },
  filterMode: "all", // "all" | "selective"
  selectedBlogIds: [],
  postsPerPage: 6,
  categorySettings: {
    allTabLabel: "All Articles",
    allTabIcon: "LayoutGrid",
    customCategories: [
      { id: "engineering", label: "Engineering & Architecture", icon: "Code", slug: "engineering" },
      { id: "cro", label: "Conversion Rate (CRO)", icon: "Zap", slug: "cro" },
      { id: "growth", label: "Growth Strategy", icon: "Globe", slug: "growth" },
      { id: "design", label: "UI/UX Design", icon: "Palette", slug: "design" }
    ]
  },
  ctaBanner: {
    eyebrow: "READY TO ACCELERATE?",
    titleIntro: "Let's Build Your Next",
    titleHighlight: "Competitive Edge",
    titleLine2: "Together.",
    description: "Schedule a free 30-minute technical audit. We'll diagnose bottlenecks in your existing presence and map out a concrete blueprint for compounding growth.",
    ctaPrimary: { label: "Book Strategy Session", href: "/contact" },
    ctaSecondary: { label: "Watch Showreel", href: "/gallery" },
    portraitSrc: "/founder.png",
    portraitAlt: "Mohsin Designs Lead Architect"
  }
};

export default function BlogEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  // Ensure blogPage has complete structure
  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || !data.blogPage) {
      setData((prev: any) => ({
        ...(prev || {}),
        blogPage: {
          ...DEFAULT_BLOG_DATA,
          ...(prev?.blogPage || {})
        }
      }));
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const blog = {
    ...DEFAULT_BLOG_DATA,
    ...(data.blogPage || {}),
    hero: { ...DEFAULT_BLOG_DATA.hero, ...(data.blogPage?.hero || {}) },
    ctaBanner: { ...DEFAULT_BLOG_DATA.ctaBanner, ...(data.blogPage?.ctaBanner || {}) }
  };

  const updateBlog = (updater: (prev: typeof blog) => typeof blog) => {
    const updated = updater(blog);
    setData((prev: any) => ({
      ...prev,
      blogPage: updated
    }));
  };

  const tabs = [
    { id: "hero", label: "01. Hero Banner & Intro", icon: Type },
    { id: "feed", label: "02. Blog Selection & Mode", icon: BookOpen },
    { id: "cta", label: "03. Conversion CTA Banner", icon: Sparkles },
  ];

  return (
    <div className="bg-white">
      {/* WordPress Sub-tabs Bar */}
      <div className="flex overflow-x-auto border-b border-[#c3c4c7] bg-[#f0f0f1] no-scrollbar mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 text-[12px] font-medium border-r border-[#dcdcde] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id
                ? "bg-white text-[#1d2327] font-bold border-b-2 border-b-[#2271b1] -mb-[1px] shadow-sm"
                : "text-[#50575e] hover:bg-white/60 hover:text-[#1d2327]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* ── TAB 1: HERO BANNER & INTRO ── */}
        {activeTab === "hero" && (
          <div className="space-y-5">
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Hero Headline & Narrative</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Badge Pill Text</label>
                  <input
                    type="text"
                    value={blog.hero.badgeText}
                    onChange={(e) => updateBlog(prev => ({ ...prev, hero: { ...prev.hero, badgeText: e.target.value } }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="EXPLORE OUR EDITORIAL // INSIGHTS & STRATEGY"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Line 1</label>
                  <input
                    type="text"
                    value={blog.hero.titleLine1}
                    onChange={(e) => updateBlog(prev => ({ ...prev, hero: { ...prev.hero, titleLine1: e.target.value } }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Modern Engineering &"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2271b1]">Title Highlight (Underlined Brush Stroke)</label>
                <input
                  type="text"
                  value={blog.hero.titleHighlight}
                  onChange={(e) => updateBlog(prev => ({ ...prev, hero: { ...prev.hero, titleHighlight: e.target.value } }))}
                  className="w-full border border-[#2271b1] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-bold"
                  placeholder="Growth Insights"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Subtitle Description</label>
                <textarea
                  rows={3}
                  value={blog.hero.description}
                  onChange={(e) => updateBlog(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="Actionable blueprints, architectural deep-dives..."
                />
              </div>

              {/* Background Bleed Image */}
              <div className="pt-2 border-t border-[#dcdcde]">
                <ImageField
                  label="Hero Background Bleed Image Banner"
                  value={blog.hero.backgroundImage || blog.hero.heroBgImage || ""}
                  onChange={(url) => updateBlog(prev => ({
                    ...prev,
                    hero: { ...prev.hero, backgroundImage: url, heroBgImage: url }
                  }))}
                />
              </div>

              {/* Dual Hero Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#dcdcde]">
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Primary Button (Yellow)</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={blog.hero.ctaPrimary?.label || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          ctaPrimary: { ...prev.hero.ctaPrimary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Explore Articles"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={blog.hero.ctaPrimary?.href || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          ctaPrimary: { ...prev.hero.ctaPrimary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="#articles"
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Secondary Button (White Outline)</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={blog.hero.ctaSecondary?.label || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          ctaSecondary: { ...prev.hero.ctaSecondary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Schedule Strategy Call"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={blog.hero.ctaSecondary?.href || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        hero: {
                          ...prev.hero,
                          ctaSecondary: { ...prev.hero.ctaSecondary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="/contact"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: BLOG SELECTION & MODE ── */}
        {activeTab === "feed" && (
          <div className="space-y-5">
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Blog Feed Configuration</h3>

              {/* Mode Switcher */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#50575e] block">Display Mode</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => updateBlog(prev => ({ ...prev, filterMode: "all" }))}
                    className={`flex items-start gap-3 p-3.5 rounded-[4px] border cursor-pointer transition-all ${
                      blog.filterMode === "all"
                        ? "bg-white border-[#2271b1] shadow-sm ring-1 ring-[#2271b1]"
                        : "bg-[#f0f0f1] border-[#dcdcde] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="filterMode"
                      checked={blog.filterMode === "all"}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#1d2327]">Show All Published Blogs</h4>
                      <p className="text-[11px] text-[#646970] mt-0.5">
                        Automatically pulls all published articles from MongoDB and lists them with dynamic category filters and pagination.
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => updateBlog(prev => ({ ...prev, filterMode: "selective" }))}
                    className={`flex items-start gap-3 p-3.5 rounded-[4px] border cursor-pointer transition-all ${
                      blog.filterMode === "selective"
                        ? "bg-white border-[#2271b1] shadow-sm ring-1 ring-[#2271b1]"
                        : "bg-[#f0f0f1] border-[#dcdcde] hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="filterMode"
                      checked={blog.filterMode === "selective"}
                      onChange={() => {}}
                      className="mt-0.5"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-[#1d2327]">Curate Selective Blogs</h4>
                      <p className="text-[11px] text-[#646970] mt-0.5">
                        Pick specific curated blog articles to feature on this page using the selector below.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Items Per Page */}
              <div className="space-y-1 pt-2 max-w-xs">
                <label className="text-[11px] font-bold text-[#50575e]">Articles Per Page (Pagination Limit)</label>
                <select
                  value={blog.postsPerPage || 6}
                  onChange={(e) => updateBlog(prev => ({ ...prev, postsPerPage: Number(e.target.value) }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                >
                  <option value={3}>3 Articles per page</option>
                  <option value={6}>6 Articles per page (Recommended)</option>
                  <option value={9}>9 Articles per page</option>
                  <option value={12}>12 Articles per page</option>
                  <option value={18}>18 Articles per page</option>
                </select>
              </div>
            </div>

            {/* If Selective Mode, show interactive BlogSelector */}
            {blog.filterMode === "selective" && (
              <div className="space-y-3 pt-2">
                <BlogSelector
                  selectedIds={blog.selectedBlogIds || []}
                  onChange={(ids) => updateBlog(prev => ({ ...prev, selectedBlogIds: ids }))}
                  label="Select Featured Blogs"
                />
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: BOTTOM CONVERSION CTA BANNER ── */}
        {activeTab === "cta" && (
          <div className="space-y-5">
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Signature Agency CTA Banner</h3>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Eyebrow Badge Pill</label>
                <input
                  type="text"
                  value={blog.ctaBanner.eyebrow}
                  onChange={(e) => updateBlog(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, eyebrow: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="READY TO ACCELERATE?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Intro (Line 1)</label>
                  <input
                    type="text"
                    value={blog.ctaBanner.titleIntro}
                    onChange={(e) => updateBlog(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleIntro: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Let's Build Your Next"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2271b1]">Title Highlight (Cursive Yellow)</label>
                  <input
                    type="text"
                    value={blog.ctaBanner.titleHighlight}
                    onChange={(e) => updateBlog(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleHighlight: e.target.value }
                    }))}
                    className="w-full border border-[#2271b1] px-2.5 py-1.5 text-xs rounded-[3px] bg-white font-bold"
                    placeholder="Competitive Edge"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Title Line 2</label>
                  <input
                    type="text"
                    value={blog.ctaBanner.titleLine2}
                    onChange={(e) => updateBlog(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, titleLine2: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Together."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#50575e]">Banner Description</label>
                <textarea
                  rows={3}
                  value={blog.ctaBanner.description}
                  onChange={(e) => updateBlog(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, description: e.target.value }
                  }))}
                  className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                  placeholder="Schedule a free 30-minute technical audit..."
                />
              </div>

              {/* Dual CTA Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#dcdcde]">
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Primary Button (Yellow)</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={blog.ctaBanner.ctaPrimary?.label || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaPrimary: { ...prev.ctaBanner.ctaPrimary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Book Strategy Session"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={blog.ctaBanner.ctaPrimary?.href || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaPrimary: { ...prev.ctaBanner.ctaPrimary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="/contact"
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Secondary Button (White Outline)</h4>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Label</label>
                    <input
                      type="text"
                      value={blog.ctaBanner.ctaSecondary?.label || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaSecondary: { ...prev.ctaBanner.ctaSecondary, label: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                      placeholder="Watch Showreel"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[#50575e]">Link / Anchor</label>
                    <input
                      type="text"
                      value={blog.ctaBanner.ctaSecondary?.href || ""}
                      onChange={(e) => updateBlog(prev => ({
                        ...prev,
                        ctaBanner: {
                          ...prev.ctaBanner,
                          ctaSecondary: { ...prev.ctaBanner.ctaSecondary, href: e.target.value }
                        }
                      }))}
                      className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] font-mono text-[11px]"
                      placeholder="/gallery"
                    />
                  </div>
                </div>
              </div>

              {/* Portrait Image */}
              <div className="pt-3 border-t border-[#dcdcde] space-y-3">
                <ImageField
                  label="Portrait Image (Arch Shape Graphics)"
                  value={blog.ctaBanner.portraitSrc || ""}
                  onChange={(url) => updateBlog(prev => ({
                    ...prev,
                    ctaBanner: { ...prev.ctaBanner, portraitSrc: url }
                  }))}
                />
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#50575e]">Portrait Alt Text</label>
                  <input
                    type="text"
                    value={blog.ctaBanner.portraitAlt || ""}
                    onChange={(e) => updateBlog(prev => ({
                      ...prev,
                      ctaBanner: { ...prev.ctaBanner, portraitAlt: e.target.value }
                    }))}
                    className="w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white"
                    placeholder="Mohsin Designs Lead Architect"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
