"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Type, Star, Sparkles, MessageSquare, Settings, Trash2, Plus } from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

// Hub/landing page chrome for the Portfolio listing (/portfolio) - mirrors BlogEditor.tsx's shape.
// The actual case-study ITEMS live in their own Portfolio collection (admin/portfolio), this only
// edits the listing page's hero copy, stat tiles, featured-panel/testimonials toggles and CTA band.

const DEFAULT_PORTFOLIO_DATA = {
  hero: {
    enabled: true,
    eyebrow: "OUR WORK · REAL RESULTS",
    titleLine1: "Work that moves",
    titleHighlight: "the numbers.",
    description: "Every project below shows the problem, what we did, and the result it delivered. Filter by the service you need.",
    stat1Value: "3,000+",
    stat1Label: "US businesses served",
    stat2Value: "250+",
    stat2Label: "Projects delivered",
    stat3Value: "300%",
    stat3Label: "more customer interaction for a client in 6 months",
  },
  featuredPanel: {
    enabled: true,
    eyebrow: "FEATURED CASE STUDY",
    buttonLabel: "See the full story",
  },
  testimonials: {
    enabled: true,
    title: "What clients say",
    items: [] as { quote: string; name: string; role: string }[],
  },
  ctaBanner: {
    enabled: true,
    titleIntro: "Want results like these?",
    titleHighlight: "something you're proud of.",
    titleLine2: "Let's build",
    description: "Tell us about your project and we'll put together a plan to get you there.",
    ctaPrimary: { label: "Get a free quote", href: "/contact-us" },
    ctaSecondary: { label: "Schedule a consultation", href: "/contact-us" },
  },
};

const mergePortfolio = (saved: any) => ({
  ...DEFAULT_PORTFOLIO_DATA,
  ...(saved || {}),
  hero: { ...DEFAULT_PORTFOLIO_DATA.hero, ...(saved?.hero || {}) },
  featuredPanel: { ...DEFAULT_PORTFOLIO_DATA.featuredPanel, ...(saved?.featuredPanel || {}) },
  testimonials: { ...DEFAULT_PORTFOLIO_DATA.testimonials, ...(saved?.testimonials || {}), items: Array.isArray(saved?.testimonials?.items) ? saved.testimonials.items : [] },
  ctaBanner: { ...DEFAULT_PORTFOLIO_DATA.ctaBanner, ...(saved?.ctaBanner || {}) },
});

const inputCls = "w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white focus:border-[#2271b1] outline-none";
const labelCls = "text-[11px] font-bold text-[#50575e] block mb-1";

export default function PortfolioEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || !data.portfolioPage) {
      setData((prev: any) => ({
        ...(prev || {}),
        portfolioPage: { ...DEFAULT_PORTFOLIO_DATA, ...(prev?.portfolioPage || {}) },
      }));
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const portfolio = mergePortfolio(data.portfolioPage);

  const update = (updater: (prev: typeof portfolio) => typeof portfolio) => {
    setData((prev: any) => ({ ...prev, portfolioPage: updater(mergePortfolio(prev?.portfolioPage)) }));
  };

  const tabs = [
    { id: "hero", label: "01. Hero & Stats", icon: Type },
    { id: "featured", label: "02. Featured Case Study", icon: Star },
    { id: "testimonials", label: "03. Testimonials", icon: MessageSquare },
    { id: "cta", label: "04. CTA Band", icon: Sparkles },
    { id: "schema", label: "05. Schema Markup", icon: Settings },
  ];

  return (
    <div className="bg-white">
      <div className="flex overflow-x-auto border-b border-[#c3c4c7] bg-[#f0f0f1] no-scrollbar mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2.5 text-[12px] font-medium border-r border-[#dcdcde] whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === tab.id ? "bg-white text-[#1d2327] font-bold border-b-2 border-b-[#2271b1] -mb-[1px] shadow-sm" : "text-[#50575e] hover:bg-white/60 hover:text-[#1d2327]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === "hero" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Hero & Stats Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable this section on the live listing page.</p>
              </div>
              <SectionToggle enabled={portfolio.hero.enabled !== false} onChange={(v) => update((p) => ({ ...p, hero: { ...p.hero, enabled: v } }))} label="Hero" />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Eyebrow</label>
                <input value={portfolio.hero.eyebrow} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, eyebrow: e.target.value } }))} className={inputCls} placeholder="OUR WORK · REAL RESULTS" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Title Line 1</label>
                  <input value={portfolio.hero.titleLine1} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, titleLine1: e.target.value } }))} className={inputCls} placeholder="Work that moves" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#2271b1] block mb-1">Title Highlight</label>
                  <input value={portfolio.hero.titleHighlight} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, titleHighlight: e.target.value } }))} className={inputCls + " font-bold border-[#2271b1]"} placeholder="the numbers." />
                </div>
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Lead Description</label>
                <RichTextEditor content={portfolio.hero.description || ""} onChange={(val: string) => update((p) => ({ ...p, hero: { ...p.hero, description: val } }))} placeholder="Every project below shows the problem..." />
              </div>
              <div className="pt-3 border-t border-[#dcdcde] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Stat Tile 1</h4>
                  <input value={portfolio.hero.stat1Value} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat1Value: e.target.value } }))} className={inputCls} placeholder="3,000+" />
                  <input value={portfolio.hero.stat1Label} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat1Label: e.target.value } }))} className={inputCls} placeholder="US businesses served" />
                </div>
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Stat Tile 2</h4>
                  <input value={portfolio.hero.stat2Value} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat2Value: e.target.value } }))} className={inputCls} placeholder="250+" />
                  <input value={portfolio.hero.stat2Label} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat2Label: e.target.value } }))} className={inputCls} placeholder="Projects delivered" />
                </div>
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Stat Tile 3 (dark, wide)</h4>
                  <input value={portfolio.hero.stat3Value} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat3Value: e.target.value } }))} className={inputCls} placeholder="300%" />
                  <input value={portfolio.hero.stat3Label} onChange={(e) => update((p) => ({ ...p, hero: { ...p.hero, stat3Label: e.target.value } }))} className={inputCls} placeholder="more customer interaction..." />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "featured" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Featured Case Study Panel</h2>
                <p className="text-xs text-[#646970]">Shows whichever case study is marked "Featured" in Portfolio &gt; the item editor. Only one item should be featured at a time.</p>
              </div>
              <SectionToggle enabled={portfolio.featuredPanel.enabled !== false} onChange={(v) => update((p) => ({ ...p, featuredPanel: { ...p.featuredPanel, enabled: v } }))} label="Featured Panel" />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Eyebrow</label>
                <input value={portfolio.featuredPanel.eyebrow} onChange={(e) => update((p) => ({ ...p, featuredPanel: { ...p.featuredPanel, eyebrow: e.target.value } }))} className={inputCls} placeholder="FEATURED CASE STUDY" />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Button Label</label>
                <input value={portfolio.featuredPanel.buttonLabel} onChange={(e) => update((p) => ({ ...p, featuredPanel: { ...p.featuredPanel, buttonLabel: e.target.value } }))} className={inputCls} placeholder="See the full story" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "testimonials" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">Testimonials Section</h2>
                <p className="text-xs text-[#646970]">"What clients say" cards shown on the listing page.</p>
              </div>
              <SectionToggle enabled={portfolio.testimonials.enabled !== false} onChange={(v) => update((p) => ({ ...p, testimonials: { ...p.testimonials, enabled: v } }))} label="Testimonials" />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <div className="space-y-1">
                <label className={labelCls}>Section Title</label>
                <input value={portfolio.testimonials.title} onChange={(e) => update((p) => ({ ...p, testimonials: { ...p.testimonials, title: e.target.value } }))} className={inputCls} placeholder="What clients say" />
              </div>
              {(portfolio.testimonials.items || []).map((t: any, idx: number) => (
                <div key={idx} className="bg-white border border-[#dcdcde] p-3 rounded-[3px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#646970]">Testimonial {idx + 1}</span>
                    <button type="button" onClick={() => update((p) => ({ ...p, testimonials: { ...p.testimonials, items: p.testimonials.items.filter((_: any, i: number) => i !== idx) } }))} className="text-[#d63638] p-1"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <textarea value={t.quote} onChange={(e) => update((p) => ({ ...p, testimonials: { ...p.testimonials, items: p.testimonials.items.map((x: any, i: number) => (i === idx ? { ...x, quote: e.target.value } : x)) } }))} rows={2} className={inputCls + " resize-none"} placeholder="Client quote..." />
                  <div className="grid grid-cols-2 gap-2">
                    <input value={t.name} onChange={(e) => update((p) => ({ ...p, testimonials: { ...p.testimonials, items: p.testimonials.items.map((x: any, i: number) => (i === idx ? { ...x, name: e.target.value } : x)) } }))} className={inputCls} placeholder="Client name" />
                    <input value={t.role} onChange={(e) => update((p) => ({ ...p, testimonials: { ...p.testimonials, items: p.testimonials.items.map((x: any, i: number) => (i === idx ? { ...x, role: e.target.value } : x)) } }))} className={inputCls} placeholder="Role, Company" />
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => update((p) => ({ ...p, testimonials: { ...p.testimonials, items: [...(p.testimonials.items || []), { quote: "", name: "", role: "" }] } }))} className="text-[#2271b1] text-[12px] font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add testimonial
              </button>
            </div>
          </div>
        )}

        {activeTab === "cta" && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
              <div>
                <h2 className="text-base font-bold text-[#1d2327]">CTA Band Visibility</h2>
                <p className="text-xs text-[#646970]">Enable or disable the closing conversion band.</p>
              </div>
              <SectionToggle enabled={portfolio.ctaBanner.enabled !== false} onChange={(v) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, enabled: v } }))} label="CTA Band" />
            </div>
            <div className="bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className={labelCls}>Title Intro</label>
                  <input value={portfolio.ctaBanner.titleIntro} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, titleIntro: e.target.value } }))} className={inputCls} placeholder="Want results like these?" />
                </div>
                <div className="space-y-1">
                  <label className={labelCls}>Title Line 2</label>
                  <input value={portfolio.ctaBanner.titleLine2} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, titleLine2: e.target.value } }))} className={inputCls} placeholder="Let's build" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2271b1] block mb-1">Title Highlight</label>
                <input value={portfolio.ctaBanner.titleHighlight} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, titleHighlight: e.target.value } }))} className={inputCls + " font-bold border-[#2271b1]"} placeholder="something you're proud of." />
              </div>
              <div className="space-y-1">
                <label className={labelCls}>Description</label>
                <RichTextEditor content={portfolio.ctaBanner.description || ""} onChange={(val: string) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, description: val } }))} placeholder="Tell us about your project..." />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[#dcdcde]">
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Primary Button</h4>
                  <input value={portfolio.ctaBanner.ctaPrimary?.label || ""} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, ctaPrimary: { ...p.ctaBanner.ctaPrimary, label: e.target.value } } }))} className={inputCls} placeholder="Get a free quote" />
                  <input value={portfolio.ctaBanner.ctaPrimary?.href || ""} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, ctaPrimary: { ...p.ctaBanner.ctaPrimary, href: e.target.value } } }))} className={inputCls + " font-mono text-[11px]"} placeholder="/contact-us" />
                </div>
                <div className="bg-white border border-[#c3c4c7] p-3 rounded-[3px] space-y-2">
                  <h4 className="font-bold text-xs text-[#1d2327]">Secondary Button</h4>
                  <input value={portfolio.ctaBanner.ctaSecondary?.label || ""} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, ctaSecondary: { ...p.ctaBanner.ctaSecondary, label: e.target.value } } }))} className={inputCls} placeholder="Schedule a consultation" />
                  <input value={portfolio.ctaBanner.ctaSecondary?.href || ""} onChange={(e) => update((p) => ({ ...p, ctaBanner: { ...p.ctaBanner, ctaSecondary: { ...p.ctaBanner.ctaSecondary, href: e.target.value } } }))} className={inputCls + " font-mono text-[11px]"} placeholder="/contact-us" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schema" && (
          <div className="space-y-4">
            <SchemaEditor
              value={data.schemaMarkup || data.seo?.schemaData || ""}
              onChange={(val) => {
                setData((prev: any) => ({ ...(prev || {}), schemaMarkup: val, seo: { ...(prev?.seo || {}), schemaData: val } }));
              }}
              pageTitle="Portfolio"
            />
          </div>
        )}
      </div>
    </div>
  );
}
