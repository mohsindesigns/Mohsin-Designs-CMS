"use client";

import React, { useState } from "react";
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
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

export default function ServicesEditor({ pageId, data, setData, seo, setSeo }: { pageId: string, data: any, setData: (d: any) => void, seo?: any, setSeo?: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  // (A "seed defaults when content is empty" effect used to live here. It could never fire: the
  // page host always adds `faqs: []` to a new page's content, so `data` is never empty. It was
  // also redundant - the public template already falls back to the same defaults for any blank
  // field, and the inputs below show them as placeholders.)

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

  // Tab order mirrors the order the sections appear on the public page.
  const tabs = [
    { id: "hero", label: "Hero Banner", title: "1. Hero Banner Section", desc: "Configure top badge, dynamic headlines, description narrative, buttons, and bleed background." },
    { id: "videoTestimonials", label: "Video Testimonials", title: "2. Video Testimonials", desc: "Manage the video testimonial carousel shown below the hero." },
    { id: "grid", label: "Services Grid Header", title: "3. Services Grid Intro Header", desc: "Introductory eyebrow, title, description, and card action button labels for the catalog." },
    { id: "cta", label: "Bottom CTA Banner", title: "4. Bottom Conversion Banner", desc: "High-converting strategy session CTA banner with portrait photo and action links." },
    { id: "faqs", label: "FAQs", title: "5. FAQ Section", desc: "Show or hide the FAQ block below the banner. The questions themselves live in this page's \"Page FAQs\" tab." },
    { id: "blog", label: "Featured Blog Posts", title: "6. Curated Insights & Articles", desc: "Featured blog articles shown below the services listing." },
    { id: "schema", label: "Schema Markup", title: "7. Schema Markup", desc: "Structured data JSON-LD configuration for the services listing page." },
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
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Hero Banner Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={data.hero?.enabled !== false}
                    onChange={(v) => updateSection("hero", "enabled", v)}
                    label="Hero Banner"
                  />
                </div>
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
                        <label className={UI.label}>Headline Highlight (accent word)</label>
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
                      <RichTextEditor
                        content={data.hero?.description || ""}
                        onChange={(val) => updateSection("hero", "description", val)}
                        placeholder="From custom Next.js platforms to full-funnel acquisition engines..."
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>3. Call To Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#f6f7f7] p-4 rounded border border-[#dcdcde] space-y-3">
                      <span className="text-xs font-bold text-[#1d2327] uppercase">Primary CTA Button</span>
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
                          placeholder="/contact-us"
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
                    onChange={(url) =>
                      // Older pages stored the photo under `bgImage`; write both keys so
                      // changing/removing it here always wins over a stale legacy value.
                      setData((prev: any) => ({
                        ...prev,
                        hero: { ...(prev?.hero || {}), backgroundImage: url, bgImage: url },
                      }))
                    }
                  />
                  <p className="text-[11px] text-[#646970] -mt-2">Leave empty for a clean hero without a background photo.</p>
                </div>
              </div>
            )}

            {/* TAB: VIDEO TESTIMONIALS */}
            {activeTab === "videoTestimonials" && (
              <VideoTestimonialsEditor
                value={data.videoTestimonials}
                onChange={(next) => setData((prev: any) => ({ ...(prev || {}), videoTestimonials: next }))}
              />
            )}

            {/* TAB 2: GRID SECTION */}
            {activeTab === "grid" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Services Grid Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={data.grid?.enabled !== false}
                    onChange={(v) => updateSection("grid", "enabled", v)}
                    label="Services Grid"
                  />
                </div>
                <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3 text-[12px] text-[#50575e] space-y-1">
                  <p className="font-semibold text-[#1d2327]">Where do the service cards come from?</p>
                  <p>
                    The cards are generated automatically from your service catalog (Admin &rarr; Services). Draft and trashed
                    services are left out, and the rest are ordered by their &ldquo;Order / Position&rdquo; number. Each card&apos;s
                    icon, tag, summary and bullet points come from that service, and it links to the service page. Edit a
                    service there to change its card; this tab only controls the heading above the cards.
                  </p>
                </div>
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
                        <label className={UI.label}>Title Highlight (accent word)</label>
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
                      <RichTextEditor
                        content={data.grid?.subtext || ""}
                        onChange={(val) => updateSection("grid", "subtext", val)}
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
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">CTA Banner Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={data.ctaBanner?.enabled !== false}
                    onChange={(v) => updateSection("ctaBanner", "enabled", v)}
                    label="CTA Banner"
                  />
                </div>
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
                      <RichTextEditor
                        content={data.ctaBanner?.description || ""}
                        onChange={(val) => updateSection("ctaBanner", "description", val)}
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
                          placeholder="/contact-us"
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
                          placeholder="/contact-us"
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
                    altValue={data.ctaBanner?.portraitAlt || ""}
                    onAltChange={(alt) => updateSection("ctaBanner", "portraitAlt", alt)}
                  />
                  <p className="text-[11px] text-[#646970] -mt-2">Leave empty to show a text-only banner (the portrait is desktop-only). The alt text field appears once an image is set; leave it blank to mark the photo as decorative.</p>
                </div>
              </div>
            )}

            {/* TAB: FAQS (visibility only - the questions are edited in the host's "Page FAQs" tab) */}
            {activeTab === "faqs" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">FAQ Section Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={data.faqs?.enabled !== false && data.faqSection?.enabled !== false}
                    onChange={(v) => updateSection("faqSection", "enabled", v)}
                    label="FAQ Section"
                  />
                </div>
                <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-3 text-[12px] text-[#50575e] space-y-1">
                  <p className="font-semibold text-[#1d2327]">Where are the questions?</p>
                  <p>
                    Add, edit and reorder them in this page&apos;s <strong>Page FAQs</strong> tab (next to &ldquo;Page Content&rdquo;).
                    If that list is empty, FAQs from the global FAQ manager that are set to &ldquo;Global&rdquo; or targeted at this
                    page are shown instead. With no FAQs at all, the section is not displayed.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 4: BLOG */}
            {activeTab === "blog" && (
              <div className="space-y-8">
                <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Featured Blog Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                  </div>
                  {/* The template reads `blogSection.enabled` only. (This used to also write a
                      `blog.enabled` key that nothing reads, and that shadowed the site-wide
                      `blog` object in the page's content context.) */}
                  <SectionToggle
                    enabled={data.blogSection?.enabled !== false}
                    onChange={(v) => updateSection("blogSection", "enabled", v)}
                    label="Featured Blog"
                  />
                </div>
                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>1. Section Heading</h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Eyebrow Subtitle</label>
                      <input
                        type="text"
                        value={data.blogSection?.subtitle || ""}
                        onChange={(e) => updateSection("blogSection", "subtitle", e.target.value)}
                        className={UI.input}
                        placeholder="LATEST STRATEGIC INSIGHTS"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Title</label>
                      <input
                        type="text"
                        value={data.blogSection?.title || ""}
                        onChange={(e) => updateSection("blogSection", "title", e.target.value)}
                        className={UI.inputLarge}
                        placeholder="Engineering & Growth Articles"
                      />
                    </div>
                    <RichTextEditor 
                      label="Description Narrative" 
                      content={data.blogSection?.description || ""} 
                      onChange={(html) => updateSection("blogSection", "description", html)} 
                    />
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className={UI.sectionHeader}>2. Curated Articles Selection</h3>
                  <p className="text-[11px] text-[#646970] -mt-2">
                    The first article you pick becomes the large featured card. The section only appears on the live page
                    once at least one published article is selected (deleted or trashed articles are skipped).
                  </p>
                  <BlogSelector
                    selectedIds={data.blogSection?.selectedPosts || []}
                    onChange={(ids) => updateSection("blogSection", "selectedPosts", ids)}
                  />
                </div>
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-4">
                {/* The public page emits page.seo.schemaData first, then content.schemaMarkup, and the
                    host's Save button copies seo.schemaData over content.schemaMarkup. So this tab has
                    to read AND write the host's `seo` state too - writing only into content (as it
                    did) was silently overwritten on save whenever seo.schemaData already existed. */}
                <SchemaEditor
                  value={seo?.schemaData || data.schemaMarkup || data.seo?.schemaData || ""}
                  onChange={(val) => {
                    setData((prev: any) => ({
                      ...(prev || {}),
                      schemaMarkup: val,
                      seo: {
                        ...(prev?.seo || {}),
                        schemaData: val
                      }
                    }));
                    setSeo?.((prev: any) => ({ ...(prev || {}), schemaData: val }));
                  }}
                  pageTitle={data.title || "Services Overview"}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
