"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, ChevronUp, ChevronDown } from "lucide-react";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
import { UI } from "./styles";
import dynamic from "next/dynamic";
import SectionToggle from "@/components/admin/SectionToggle";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-40 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

/**
 * Resilient Comma-Separated Input that buffers local string state
 * so typing spaces and commas does NOT immediately get wiped/swallowed by .join(", ")!
 */
function CommaSeparatedInput({
  value,
  onChange,
  className = UI.input,
  placeholder = "Item 1, Item 2, Item 3..."
}: {
  value: string[] | undefined;
  onChange: (val: string[]) => void;
  className?: string;
  placeholder?: string;
}) {
  const formatArray = (arr: any) => (Array.isArray(arr) ? arr.join(", ") : typeof arr === "string" ? arr : "");
  const [text, setText] = useState(() => formatArray(value));

  useEffect(() => {
    const formatted = formatArray(value);
    const currentTokens = text.split(",").map((s) => s.trim()).filter(Boolean).join(", ");
    const incomingTokens = Array.isArray(value) ? value.filter(Boolean).join(", ") : "";
    if (currentTokens !== incomingTokens) {
      setText(formatted);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newText = e.target.value;
    setText(newText);
    const arr = newText.split(",").map((s) => s.trim()).filter(Boolean);
    onChange(arr);
  };

  return (
    <input
      type="text"
      autoComplete="off"
      value={text}
      onChange={handleChange}
      className={className}
      placeholder={placeholder}
    />
  );
}

/** Move up / move down / remove controls for a list card (metrics, rows, steps, domains, ...). */
function ItemControls({ index, count, onMove, onRemove }: { index: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void }) {
  const btn = "p-1 rounded text-[#50575e] hover:bg-[#f0f0f1] disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-0.5">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0} className={btn} title="Move up" aria-label="Move up"><ChevronUp className="w-4 h-4" /></button>
      <button type="button" onClick={() => onMove(1)} disabled={index >= count - 1} className={btn} title="Move down" aria-label="Move down"><ChevronDown className="w-4 h-4" /></button>
      <button type="button" onClick={onRemove} className="p-1 rounded text-[#d63638] hover:bg-[#fcf0f1]" title="Remove" aria-label="Remove"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}

// Schema markup (JSON-LD) is edited in the page shell's own "Schema" tab, which knows the page's real
// title and slug (this editor used to carry a second, hard-coded "about" copy that was discarded on save).
export default function NewAboutEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateSection = (section: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const currentData = prev || {};
      if (field) {
        const prevSectionData = currentData[section] || {};
        // Supports a functional updater `(prevFieldValue) => nextFieldValue`, same as React's
        // setState. This matters for fields like the mission/vision image, where the ImageField
        // component fires onChange (imgSrc) and onAltChange (imgAlt) back-to-back synchronously
        // on select: both handlers otherwise close over the same pre-update `data` prop, so the
        // second call would spread the stale object and silently clobber the first call's write
        // (e.g. the just-set imgSrc gets wiped out by the imgAlt update). Resolving against the
        // live `prevSectionData` here avoids that race regardless of call order.
        const resolvedValue = typeof value === "function" ? value(prevSectionData[field]) : value;
        return {
          ...currentData,
          [section]: {
            ...prevSectionData,
            [field]: resolvedValue
          }
        };
      }
      return {
        ...currentData,
        [section]: typeof value === "function" ? value(currentData[section]) : value
      };
    });
  };

  // List helpers. Every list edit is a FUNCTIONAL update on the live section, so a stale render can
  // never overwrite a sibling edit (the old handlers copied the array out of the render-time
  // `data` and mutated the item object in place).
  const updateItem = (section: string, field: string, index: number, patch: Record<string, any>) =>
    updateSection(section, field, (prev: any) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      list[index] = { ...(list[index] || {}), ...patch };
      return list;
    });
  const removeItem = (section: string, field: string, index: number) =>
    updateSection(section, field, (prev: any) => (Array.isArray(prev) ? prev.filter((_: any, i: number) => i !== index) : []));
  const moveItem = (section: string, field: string, index: number, dir: -1 | 1) =>
    updateSection(section, field, (prev: any) => {
      const list = Array.isArray(prev) ? [...prev] : [];
      const target = index + dir;
      if (target < 0 || target >= list.length) return list;
      [list[index], list[target]] = [list[target], list[index]];
      return list;
    });
  // Mission / Vision / Values pillars live under `philosophy`; patch one without touching the others.
  const setPillar = (key: string, patch: Record<string, any>) =>
    updateSection("philosophy", key, (prev: any) => ({ ...(prev || {}), ...patch }));

  const tabs = [
    { id: "hero", label: "1. Hero Section" },
    { id: "videoTestimonials", label: "Video Testimonials" },
    { id: "stats", label: "2. Stats & Metrics" },
    { id: "whoWeAre", label: "3. Who We Are" },
    { id: "philosophy", label: "4. Mission & Vision" },
    { id: "servicesDirectory", label: "5. Services Directory" },
    { id: "methodology", label: "6. Process Blueprint" },
    { id: "domainExpertise", label: "7. Domain Expertise" },
    { id: "whyChooseUs", label: "8. Why Choose Us" },
    { id: "executiveLeadership", label: "9. Founder & Leadership" },
    { id: "reviews", label: "10. Client Reviews" },
    { id: "ctaBanner", label: "11. CTA Banner" }
  ];

  return (
    <div className="bg-white max-w-5xl mx-auto pb-20">
      {/* WordPress Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-8 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`px-2 py-1.5 transition-colors text-xs font-semibold ${activeTab === tab.id ? "text-[#1d2327] font-bold border-b-2 border-[#2271b1]" : "text-[#2271b1] hover:text-[#135e96]"}`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7]">|</span>}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-8"
        >
          {/* 1. HERO SECTION */}
          {activeTab === "hero" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Hero Section Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={data.hero?.enabled !== false}
                  onChange={(v) => updateSection("hero", "enabled", v)}
                  label="Hero Section"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Hero Badges & Headlines</h3>
                <p className={UI.helpText}>The two title parts are joined with a space. If a title part is left empty, the placeholder text shown in grey is what the page displays.</p>
                <div className="space-y-1.5">
                  <label className={UI.label}>Top Badge Text</label>
                  <input type="text" autoComplete="off" value={data.hero?.badgeText || ""} onChange={(e) => updateSection("hero", "badgeText", e.target.value)} className={UI.input} placeholder="e.g. PREMIER DIGITAL ENGINEERING STUDIO" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title — Intro (Plain)</label>
                    <input type="text" autoComplete="off" value={data.hero?.titleIntro || ""} onChange={(e) => updateSection("hero", "titleIntro", e.target.value)} className={UI.input} placeholder="Architecting Digital Products With" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title — Highlight (Underlined Accent)</label>
                    <input type="text" autoComplete="off" value={data.hero?.titleHighlight || ""} onChange={(e) => updateSection("hero", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Zero Fluff & Pure Precision." />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description Narrative</label>
                  <RichTextEditor
                    content={data.hero?.description || ""}
                    onChange={(val) => updateSection("hero", "description", val)}
                    placeholder="Hero description paragraph..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Call to Action Buttons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={UI.card}>
                    <span className="text-[11px] font-bold text-[#2271b1] uppercase block mb-3">Primary Button</span>
                    <div className="space-y-3">
                      <div className="space-y-1"><label className={UI.label}>Button Text</label><input type="text" autoComplete="off" value={data.hero?.ctaPrimaryText || ""} onChange={(e) => updateSection("hero", "ctaPrimaryText", e.target.value)} className={UI.input} placeholder="e.g. Explore Our Capabilities" /></div>
                      <div className="space-y-1"><label className={UI.label}>Button Link</label><input type="text" autoComplete="off" value={data.hero?.ctaPrimaryHref || ""} onChange={(e) => updateSection("hero", "ctaPrimaryHref", e.target.value)} className={UI.input} placeholder="#services-directory" /><span className={UI.helpText}>Empty = scrolls to the Services Directory (or the contact page if that section is not shown).</span></div>
                    </div>
                  </div>
                  <div className={UI.card}>
                    <span className="text-[11px] font-bold text-[#646970] uppercase block mb-3">Secondary Button</span>
                    <div className="space-y-3">
                      <div className="space-y-1"><label className={UI.label}>Button Text</label><input type="text" autoComplete="off" value={data.hero?.ctaSecondaryText || ""} onChange={(e) => updateSection("hero", "ctaSecondaryText", e.target.value)} className={UI.input} placeholder="e.g. Watch Studio Reel" /></div>
                      <div className="space-y-1"><label className={UI.label}>Button Link</label><input type="text" autoComplete="off" value={data.hero?.ctaSecondaryHref || ""} onChange={(e) => updateSection("hero", "ctaSecondaryHref", e.target.value)} className={UI.input} placeholder="e.g. /portfolio or a video URL" /><span className={UI.helpText}>The secondary button is only shown when it has both text and a link.</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Hero Showcase Media</h3>
                <ImageField
                  label="Hero Showcase Image / Illustration"
                  value={data.hero?.heroImage || ""}
                  onChange={(url) => updateSection("hero", "heroImage", url)}
                  altValue={data.hero?.heroImageAlt || ""}
                  onAltChange={(alt) => updateSection("hero", "heroImageAlt", alt)}
                  description="High-resolution image or mockup for the right side of the Hero."
                />
              </div>
            </div>
          )}

          {activeTab === "videoTestimonials" && (
            <VideoTestimonialsEditor
              value={data.videoTestimonials}
              onChange={(next: any) => updateSection("videoTestimonials", null, next)}
            />
          )}

          {/* 2. STATS & METRICS */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Stats & Metrics Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.stats?.enabled !== false}
                  onChange={(v) => updateSection("stats", "enabled", v)}
                  label="Stats & Metrics"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Section Header Narrative</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Eyebrow Pill</label>
                  <input type="text" autoComplete="off" value={data.stats?.eyebrow || ""} onChange={(e) => updateSection("stats", "eyebrow", e.target.value)} className={UI.input} placeholder="e.g. PROVEN ENTERPRISE IMPACT" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input type="text" autoComplete="off" value={data.stats?.titleIntro || ""} onChange={(e) => updateSection("stats", "titleIntro", e.target.value)} className={UI.input} placeholder="Compound Growth &" />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight (Italic Accent)</label>
                    <input type="text" autoComplete="off" value={data.stats?.titleHighlight || ""} onChange={(e) => updateSection("stats", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Measurable ROI" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.stats?.description || ""}
                    onChange={(val) => updateSection("stats", "description", val)}
                    placeholder="Stats section description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Core Disciplines / Expertise List</h3>
                <div className="space-y-1.5"><label className={UI.label}>Header Label</label><input type="text" autoComplete="off" value={data.stats?.expertiseHeader || ""} onChange={(e) => updateSection("stats", "expertiseHeader", e.target.value)} className={UI.input} placeholder="e.g. CORE DISCIPLINES" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(data.stats?.expertiseList || []).map((exp: any, i: number) => (
                    <div key={i} className="flex items-center gap-2 bg-[#f6f7f7] p-2.5 rounded border border-[#dcdcde]">
                      <input type="text" autoComplete="off" value={exp.num || ""} onChange={(e) => updateItem("stats", "expertiseList", i, { num: e.target.value })} className="w-14 bg-white px-2 py-1 text-xs border rounded" placeholder="01" />
                      <input type="text" autoComplete="off" value={exp.label || ""} onChange={(e) => updateItem("stats", "expertiseList", i, { label: e.target.value })} className="flex-1 bg-white px-2 py-1 text-xs border rounded" placeholder="Discipline label" />
                      <button type="button" onClick={() => removeItem("stats", "expertiseList", i)} className="text-[#d63638]" title="Remove" aria-label="Remove discipline"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("stats", "expertiseList", [...(data.stats?.expertiseList || []), { num: `0${(data.stats?.expertiseList || []).length + 1}`, label: "" }])} className={UI.buttonAdd}>+ Add Discipline</button>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Live Rolling Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.stats?.metrics || []).map((m: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Metric #{i + 1}</span>
                        <ItemControls index={i} count={(data.stats?.metrics || []).length} onMove={(dir) => moveItem("stats", "metrics", i, dir)} onRemove={() => removeItem("stats", "metrics", i)} />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1"><label className={UI.label}>Number</label><input type="number" value={m.value ?? ""} onChange={(e) => updateItem("stats", "metrics", i, { value: Number(e.target.value) })} className={UI.input} /></div>
                        <div className="space-y-1"><label className={UI.label}>Suffix</label><input type="text" autoComplete="off" value={m.suffix || ""} onChange={(e) => updateItem("stats", "metrics", i, { suffix: e.target.value })} className={UI.input} placeholder="+" /></div>
                        <div className="space-y-1"><label className={UI.label}>Badge ID</label><input type="text" autoComplete="off" value={m.num || ""} onChange={(e) => updateItem("stats", "metrics", i, { num: e.target.value })} className={UI.input} placeholder="01" /></div>
                      </div>
                      <div className="space-y-1"><label className={UI.label}>Label</label><input type="text" autoComplete="off" value={m.label || ""} onChange={(e) => updateItem("stats", "metrics", i, { label: e.target.value })} className={UI.input} placeholder="e.g. BRANDS SCALED" /></div>
                      <div className="space-y-1"><label className={UI.label}>Sublabel</label><input type="text" autoComplete="off" value={m.sublabel || ""} onChange={(e) => updateItem("stats", "metrics", i, { sublabel: e.target.value })} className={UI.input} placeholder="Description sentence" /></div>
                      <IconSelector label="Icon" value={m.iconName} onChange={(val) => updateItem("stats", "metrics", i, { iconName: val })} />
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("stats", "metrics", [...(data.stats?.metrics || []), { num: `0${(data.stats?.metrics || []).length + 1}`, value: 100, suffix: "+", label: "NEW METRIC", sublabel: "", iconName: "Globe" }])} className={UI.buttonAdd}>+ Add Metric Card</button>
              </div>
            </div>
          )}

          {/* 3. WHO WE ARE */}
          {activeTab === "whoWeAre" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Who We Are Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.whoWeAre?.enabled !== false}
                  onChange={(v) => updateSection("whoWeAre", "enabled", v)}
                  label="Who We Are"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Header & Watermark</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Eyebrow Pill</label><input type="text" autoComplete="off" value={data.whoWeAre?.eyebrow || ""} onChange={(e) => updateSection("whoWeAre", "eyebrow", e.target.value)} className={UI.input} placeholder="e.g. OUR IDENTITY & APPROACH" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Background Watermark</label><input type="text" autoComplete="off" value={data.whoWeAre?.watermark || ""} onChange={(e) => updateSection("whoWeAre", "watermark", e.target.value)} className={UI.input} placeholder="e.g. WHO WE ARE" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.whoWeAre?.titleIntro || ""} onChange={(e) => updateSection("whoWeAre", "titleIntro", e.target.value)} className={UI.input} placeholder="Built by Engineers," /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.whoWeAre?.titleHighlight || ""} onChange={(e) => updateSection("whoWeAre", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Guided by Craft." /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.whoWeAre?.description || ""}
                    onChange={(val) => updateSection("whoWeAre", "description", val)}
                    placeholder="Who we are description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Features / Approach Rows</h3>
                <div className="space-y-4">
                  {(data.whoWeAre?.rows || []).map((row: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Row #{i + 1}</span>
                        <ItemControls index={i} count={(data.whoWeAre?.rows || []).length} onMove={(dir) => moveItem("whoWeAre", "rows", i, dir)} onRemove={() => removeItem("whoWeAre", "rows", i)} />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-1 space-y-1"><label className={UI.label}>Number</label><input type="text" autoComplete="off" value={row.num || ""} onChange={(e) => updateItem("whoWeAre", "rows", i, { num: e.target.value })} className={UI.input} placeholder="01" /></div>
                        <div className="col-span-3 space-y-1"><label className={UI.label}>Title</label><input type="text" autoComplete="off" value={row.title || ""} onChange={(e) => updateItem("whoWeAre", "rows", i, { title: e.target.value })} className={UI.input} placeholder="Row title" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Description</label>
                        <RichTextEditor
                          content={row.desc || ""}
                          onChange={(val) => updateItem("whoWeAre", "rows", i, { desc: val })}
                          placeholder="Row description..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("whoWeAre", "rows", [...(data.whoWeAre?.rows || []), { num: `0${(data.whoWeAre?.rows || []).length + 1}`, title: "", desc: "" }])} className={UI.buttonAdd}>+ Add Row</button>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Collage Visual Assets & Badges</h3>
                <div className="space-y-1.5"><label className={UI.label}>Floating Parallax Badge Text</label><input type="text" autoComplete="off" value={data.whoWeAre?.parallaxBadge || ""} onChange={(e) => updateSection("whoWeAre", "parallaxBadge", e.target.value)} className={UI.input} placeholder="e.g. STUDIO ARCHITECTURE // VERIFIED" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <ImageField label="Abstract Image (Top Left)" value={data.whoWeAre?.imgAbstract || ""} onChange={(url) => updateSection("whoWeAre", "imgAbstract", url)} altValue={data.whoWeAre?.imgAbstractAlt || ""} onAltChange={(alt) => updateSection("whoWeAre", "imgAbstractAlt", alt)} />
                  <ImageField label="Workspace Image (Center)" value={data.whoWeAre?.imgWorkspace || ""} onChange={(url) => updateSection("whoWeAre", "imgWorkspace", url)} altValue={data.whoWeAre?.imgWorkspaceAlt || ""} onAltChange={(alt) => updateSection("whoWeAre", "imgWorkspaceAlt", alt)} />
                  <ImageField label="UI Detail Image (Bottom Right)" value={data.whoWeAre?.imgUiDetail || ""} onChange={(url) => updateSection("whoWeAre", "imgUiDetail", url)} altValue={data.whoWeAre?.imgUiDetailAlt || ""} onAltChange={(alt) => updateSection("whoWeAre", "imgUiDetailAlt", alt)} />
                </div>
              </div>
            </div>
          )}

          {/* 4. PHILOSOPHY (MISSION, VISION, VALUES) */}
          {activeTab === "philosophy" && (
            <div className="space-y-10">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Mission & Vision Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.philosophy?.enabled !== false}
                  onChange={(v) => updateSection("philosophy", "enabled", v)}
                  label="Mission & Vision"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>Header Narrative</h3>
                <p className={UI.helpText}>A pillar appears on the page once you fill in any of its fields; use its own switch below to hide it without deleting anything.</p>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.philosophy?.eyebrow || ""} onChange={(e) => updateSection("philosophy", "eyebrow", e.target.value)} className={UI.input} placeholder="e.g. CORE PHILOSOPHY & PILLARS" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.philosophy?.titleIntro || ""} onChange={(e) => updateSection("philosophy", "titleIntro", e.target.value)} className={UI.input} placeholder="The Three Principles That" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.philosophy?.titleHighlight || ""} onChange={(e) => updateSection("philosophy", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Drive Our Work" /></div>
                </div>
              </div>

              {/* Mission Card */}
              <div className={UI.card + " space-y-4"}>
                <div className="flex items-center justify-between gap-3 border-b pb-2">
                  <span className="text-[13px] font-bold text-[#2271b1] uppercase">Pillar 1: Core Mission</span>
                  <SectionToggle enabled={data.philosophy?.mission?.enabled !== false} onChange={(v) => setPillar("mission", { enabled: v })} label="Pillar 1: Core Mission" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Num</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.num || ""} onChange={(e) => setPillar("mission", { num: e.target.value })} className={UI.input} placeholder="01" /></div>
                  <div className="space-y-1"><label className={UI.label}>Label</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.label || ""} onChange={(e) => setPillar("mission", { label: e.target.value })} className={UI.input} placeholder="CORE MISSION" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.titleIntro || ""} onChange={(e) => setPillar("mission", { titleIntro: e.target.value })} className={UI.input} placeholder="Eliminating Technical Debt Through" /></div>
                  <div className="space-y-1"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.titleHighlight || ""} onChange={(e) => setPillar("mission", { titleHighlight: e.target.value })} className={UI.input} placeholder="Intentional Design" /></div>
                </div>
                <div className="space-y-1">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.philosophy?.mission?.desc || ""}
                    onChange={(val) => setPillar("mission", { desc: val })}
                    placeholder="Mission description..."
                  />
                </div>
                <div className="space-y-1"><label className={UI.label}>Quote / Callout</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.quote || ""} onChange={(e) => setPillar("mission", { quote: e.target.value })} className={UI.input} /></div>
                <div className="space-y-1">
                  <label className={UI.label}>Tags (Comma Separated)</label>
                  <CommaSeparatedInput
                    value={data.philosophy?.mission?.tags}
                    onChange={(tags) => setPillar("mission", { tags })}
                    placeholder="Clean Code, Scalability..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Top Badge (Latency)</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.badgeLatency || ""} onChange={(e) => setPillar("mission", { badgeLatency: e.target.value })} className={UI.input} placeholder="< 45ms P99" /></div>
                  <div className="space-y-1"><label className={UI.label}>Bottom Badge (Performance)</label><input type="text" autoComplete="off" value={data.philosophy?.mission?.badgePerformance || ""} onChange={(e) => setPillar("mission", { badgePerformance: e.target.value })} className={UI.input} placeholder="100 Score" /></div>
                </div>
                <ImageField label="Mission Media Image" value={data.philosophy?.mission?.imgSrc || ""} onChange={(url) => updateSection("philosophy", "mission", (prev: any) => ({ ...(prev || {}), imgSrc: url }))} altValue={data.philosophy?.mission?.imgAlt || ""} onAltChange={(alt) => updateSection("philosophy", "mission", (prev: any) => ({ ...(prev || {}), imgAlt: alt }))} />
              </div>

              {/* Vision Card */}
              <div className={UI.card + " space-y-4"}>
                <div className="flex items-center justify-between gap-3 border-b pb-2">
                  <span className="text-[13px] font-bold text-[#2271b1] uppercase">Pillar 2: Global Vision</span>
                  <SectionToggle enabled={data.philosophy?.vision?.enabled !== false} onChange={(v) => setPillar("vision", { enabled: v })} label="Pillar 2: Global Vision" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Num</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.num || ""} onChange={(e) => setPillar("vision", { num: e.target.value })} className={UI.input} placeholder="02" /></div>
                  <div className="space-y-1"><label className={UI.label}>Label</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.label || ""} onChange={(e) => setPillar("vision", { label: e.target.value })} className={UI.input} placeholder="GLOBAL VISION" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.titleIntro || ""} onChange={(e) => setPillar("vision", { titleIntro: e.target.value })} className={UI.input} placeholder="Setting the Global Standard in" /></div>
                  <div className="space-y-1"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.titleHighlight || ""} onChange={(e) => setPillar("vision", { titleHighlight: e.target.value })} className={UI.input} placeholder="Modern Web Engineering" /></div>
                </div>
                <div className="space-y-1">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.philosophy?.vision?.desc || ""}
                    onChange={(val) => setPillar("vision", { desc: val })}
                    placeholder="Vision description..."
                  />
                </div>
                <div className="space-y-1"><label className={UI.label}>Quote / Callout</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.quote || ""} onChange={(e) => setPillar("vision", { quote: e.target.value })} className={UI.input} /></div>
                <div className="space-y-1">
                  <label className={UI.label}>Tags (Comma Separated)</label>
                  <CommaSeparatedInput
                    value={data.philosophy?.vision?.tags}
                    onChange={(tags) => setPillar("vision", { tags })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Top Badge (Lighthouse)</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.badgeLighthouse || ""} onChange={(e) => setPillar("vision", { badgeLighthouse: e.target.value })} className={UI.input} /></div>
                  <div className="space-y-1"><label className={UI.label}>Bottom Badge (Accessibility)</label><input type="text" autoComplete="off" value={data.philosophy?.vision?.badgeAccessibility || ""} onChange={(e) => setPillar("vision", { badgeAccessibility: e.target.value })} className={UI.input} /></div>
                </div>
                <ImageField label="Vision Media Image" value={data.philosophy?.vision?.imgSrc || ""} onChange={(url) => updateSection("philosophy", "vision", (prev: any) => ({ ...(prev || {}), imgSrc: url }))} altValue={data.philosophy?.vision?.imgAlt || ""} onAltChange={(alt) => updateSection("philosophy", "vision", (prev: any) => ({ ...(prev || {}), imgAlt: alt }))} />
              </div>

              {/* Values Card */}
              <div className={UI.card + " space-y-4"}>
                <div className="flex items-center justify-between gap-3 border-b pb-2">
                  <span className="text-[13px] font-bold text-[#2271b1] uppercase">Pillar 3: Shared Values</span>
                  <SectionToggle enabled={data.philosophy?.values?.enabled !== false} onChange={(v) => setPillar("values", { enabled: v })} label="Pillar 3: Shared Values" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Num</label><input type="text" autoComplete="off" value={data.philosophy?.values?.num || ""} onChange={(e) => setPillar("values", { num: e.target.value })} className={UI.input} placeholder="03" /></div>
                  <div className="space-y-1"><label className={UI.label}>Label</label><input type="text" autoComplete="off" value={data.philosophy?.values?.label || ""} onChange={(e) => setPillar("values", { label: e.target.value })} className={UI.input} placeholder="SHARED VALUES" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.philosophy?.values?.titleIntro || ""} onChange={(e) => setPillar("values", { titleIntro: e.target.value })} className={UI.input} placeholder="Radical Transparency &" /></div>
                  <div className="space-y-1"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.philosophy?.values?.titleHighlight || ""} onChange={(e) => setPillar("values", { titleHighlight: e.target.value })} className={UI.input} placeholder="Relentless Ownership" /></div>
                </div>
                <div className="space-y-1">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.philosophy?.values?.desc || ""}
                    onChange={(val) => setPillar("values", { desc: val })}
                    placeholder="Values description..."
                  />
                </div>
                <div className="space-y-1"><label className={UI.label}>Quote / Callout</label><input type="text" autoComplete="off" value={data.philosophy?.values?.quote || ""} onChange={(e) => setPillar("values", { quote: e.target.value })} className={UI.input} /></div>
                <div className="space-y-1">
                  <label className={UI.label}>Tags (Comma Separated)</label>
                  <CommaSeparatedInput
                    value={data.philosophy?.values?.tags}
                    onChange={(tags) => setPillar("values", { tags })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><label className={UI.label}>Badge 1</label><input type="text" autoComplete="off" value={data.philosophy?.values?.badgeSync || ""} onChange={(e) => setPillar("values", { badgeSync: e.target.value })} className={UI.input} /></div>
                  <div className="space-y-1"><label className={UI.label}>Badge 2</label><input type="text" autoComplete="off" value={data.philosophy?.values?.badgeSprint || ""} onChange={(e) => setPillar("values", { badgeSprint: e.target.value })} className={UI.input} /></div>
                </div>
                <ImageField label="Values Media Image" value={data.philosophy?.values?.imgSrc || ""} onChange={(url) => updateSection("philosophy", "values", (prev: any) => ({ ...(prev || {}), imgSrc: url }))} altValue={data.philosophy?.values?.imgAlt || ""} onAltChange={(alt) => updateSection("philosophy", "values", (prev: any) => ({ ...(prev || {}), imgAlt: alt }))} />
              </div>
            </div>
          )}

          {/* 5. SERVICES DIRECTORY & STICKY STAGES */}
          {activeTab === "servicesDirectory" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Services Directory Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.servicesDirectory?.enabled !== false}
                  onChange={(v) => updateSection("servicesDirectory", "enabled", v)}
                  label="Services Directory"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Section Headlines & CTA</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.servicesDirectory?.eyebrow || ""} onChange={(e) => updateSection("servicesDirectory", "eyebrow", e.target.value)} className={UI.input} placeholder="OUR CORE CAPABILITIES" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.servicesDirectory?.titleIntro || ""} onChange={(e) => updateSection("servicesDirectory", "titleIntro", e.target.value)} className={UI.input} placeholder="Full-Spectrum Digital" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.servicesDirectory?.titleHighlight || ""} onChange={(e) => updateSection("servicesDirectory", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Engineering Services" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Service Card Link Text</label><input type="text" autoComplete="off" value={data.servicesDirectory?.getStartedText || ""} onChange={(e) => updateSection("servicesDirectory", "getStartedText", e.target.value)} className={UI.input} placeholder="Explore Service" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Fallback Card Link (only for a service without its own page)</label><input type="text" autoComplete="off" value={data.servicesDirectory?.getStartedHref || ""} onChange={(e) => updateSection("servicesDirectory", "getStartedHref", e.target.value)} className={UI.input} placeholder="/contact-us" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Sticky Consultation Button Text</label><input type="text" autoComplete="off" value={data.servicesDirectory?.consultationBtnText || ""} onChange={(e) => updateSection("servicesDirectory", "consultationBtnText", e.target.value)} className={UI.input} placeholder="Schedule Technical Consultation" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Sticky Consultation Button Link</label><input type="text" autoComplete="off" value={data.servicesDirectory?.consultationBtnHref || ""} onChange={(e) => updateSection("servicesDirectory", "consultationBtnHref", e.target.value)} className={UI.input} placeholder="/contact-us" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Select Services to Display in Interactive Stages</h3>
                <p className="text-xs text-[#646970]">
                  Select the services from your CMS catalog to display in this interactive section, in the order shown under "Display Order". Each card's title, description, image, deliverables and link come from the service itself, so editing a service in the Services admin updates this page automatically. Draft or trashed services are skipped. If you select none, the entire section is hidden on the page.
                </p>
                <div className="bg-[#f6f7f7] p-5 rounded border border-[#dcdcde]">
                  <ContentSelector
                    type="services"
                    label="Active Services Catalog"
                    selectedItems={data.servicesDirectory?.selectedServices || []}
                    onSelect={(items) => {
                      const stages = items.map((srv: any, idx: number) => {
                        const title = srv.title || srv.name || "";
                        const category = srv.category || srv.tag || "";
                        const badge = srv.badge || (srv.tag && srv.tag !== category ? srv.tag : "") || "";
                        const image = srv.image || srv.hero?.bgImage || srv.hero?.backgroundImage || srv.overviewImage || srv.deepDive?.image || srv.caseStudy?.image || "";
                        const desc = srv.description || srv.hero?.description || srv.desc || srv.tagline || srv.shortDescription || srv.deepDive?.desc || "";
                        const deliverables = Array.isArray(srv.deliverables) && srv.deliverables.length > 0
                          ? srv.deliverables
                          : (Array.isArray(srv.hero?.benefits) && srv.hero.benefits.length > 0
                            ? srv.hero.benefits
                            : (Array.isArray(srv.features) && srv.features.length > 0
                              ? srv.features
                              : (Array.isArray(srv.whatIncluded?.pillars)
                                ? srv.whatIncluded.pillars.map((p: any) => p.title || p.desc).filter(Boolean)
                                : (srv.materials?.items || []))));
                        const navTitle = srv.title || srv.name || "";
                        const navTag = category ? category.toUpperCase() : `STAGE ${String(idx + 1).padStart(2, "0")}`;
                        const iconName = srv.icon || srv.iconName || "Code";
                        const slug = srv.slug || "";

                        return {
                          id: String(idx + 1).padStart(2, "0"),
                          serviceId: srv.id || srv._id || srv.slug,
                          category,
                          badge,
                          image,
                          title,
                          desc,
                          deliverables,
                          navTitle,
                          navTag,
                          iconName,
                          slug
                        };
                      });

                      setData((prev: any) => ({
                        ...(prev || {}),
                        servicesDirectory: {
                          ...((prev || {}).servicesDirectory || {}),
                          // Keep only what the picker needs to recognise a service (the full catalog
                          // objects used to be copied into the page document, tens of KB each).
                          selectedServices: items.map((srv: any) => ({ id: srv.id, _id: srv._id, slug: srv.slug, title: srv.title || srv.name })),
                          stages: stages
                        }
                      }));
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. METHODOLOGY & 6-STEP PROCESS */}
          {activeTab === "methodology" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Process Blueprint Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.methodology?.enabled !== false}
                  onChange={(v) => updateSection("methodology", "enabled", v)}
                  label="Process Blueprint"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Section Header</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.methodology?.eyebrow || ""} onChange={(e) => updateSection("methodology", "eyebrow", e.target.value)} className={UI.input} placeholder="OUR 6-STEP BLUEPRINT" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.methodology?.titleIntro || ""} onChange={(e) => updateSection("methodology", "titleIntro", e.target.value)} className={UI.input} placeholder="Engineering Precision From" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.methodology?.titleHighlight || ""} onChange={(e) => updateSection("methodology", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Concept to Production" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Card Label: Deliverables</label><input type="text" autoComplete="off" value={data.methodology?.deliverablesLabel || ""} onChange={(e) => updateSection("methodology", "deliverablesLabel", e.target.value)} className={UI.input} placeholder="DELIVERABLES" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Card Counter Word (STAGE 1 OF 6)</label><input type="text" autoComplete="off" value={data.methodology?.stepLabelPrefix || ""} onChange={(e) => updateSection("methodology", "stepLabelPrefix", e.target.value)} className={UI.input} placeholder="STAGE" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.methodology?.description || ""}
                    onChange={(val) => updateSection("methodology", "description", val)}
                    placeholder="Methodology description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Methodology Step Cards</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.methodology?.steps || []).map((step: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Step #{i + 1} ({step.step || i + 1})</span>
                        <ItemControls index={i} count={(data.methodology?.steps || []).length} onMove={(dir) => moveItem("methodology", "steps", i, dir)} onRemove={() => removeItem("methodology", "steps", i)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className={UI.label}>Step Number</label><input type="text" autoComplete="off" value={step.step || ""} onChange={(e) => updateItem("methodology", "steps", i, { step: e.target.value })} className={UI.input} placeholder="01" /></div>
                        <div className="space-y-1"><label className={UI.label}>Badge</label><input type="text" autoComplete="off" value={step.badge || ""} onChange={(e) => updateItem("methodology", "steps", i, { badge: e.target.value })} className={UI.input} placeholder="DISCOVERY & AUDIT" /></div>
                      </div>
                      <div className="space-y-1"><label className={UI.label}>Title</label><input type="text" autoComplete="off" value={step.title || ""} onChange={(e) => updateItem("methodology", "steps", i, { title: e.target.value })} className={UI.input} /></div>
                      <div className="space-y-1">
                        <label className={UI.label}>Description</label>
                        <RichTextEditor
                          content={step.desc || ""}
                          onChange={(val) => updateItem("methodology", "steps", i, { desc: val })}
                          placeholder="Step description..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Deliverables (Comma Separated)</label>
                        <CommaSeparatedInput
                          value={step.deliverables}
                          onChange={(deliverables) => updateItem("methodology", "steps", i, { deliverables: deliverables })}
                        />
                      </div>
                      <IconSelector label="Step Icon" value={step.iconName} onChange={(val) => updateItem("methodology", "steps", i, { iconName: val })} />
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("methodology", "steps", [...(data.methodology?.steps || []), { step: `0${(data.methodology?.steps || []).length + 1}`, badge: "PHASE", iconName: "Search", title: "New Step", desc: "", deliverables: [] }])} className={UI.buttonAdd}>+ Add Process Step</button>
              </div>
            </div>
          )}

          {/* 7. DOMAIN EXPERTISE */}
          {activeTab === "domainExpertise" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Domain Expertise Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.domainExpertise?.enabled !== false}
                  onChange={(v) => updateSection("domainExpertise", "enabled", v)}
                  label="Domain Expertise"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Header</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.domainExpertise?.eyebrow || ""} onChange={(e) => updateSection("domainExpertise", "eyebrow", e.target.value)} className={UI.input} placeholder="VERTICAL EXPERTISE" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.domainExpertise?.titleIntro || ""} onChange={(e) => updateSection("domainExpertise", "titleIntro", e.target.value)} className={UI.input} placeholder="Deep Experience Across" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.domainExpertise?.titleHighlight || ""} onChange={(e) => updateSection("domainExpertise", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Diverse Industries" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.domainExpertise?.description || ""}
                    onChange={(val) => updateSection("domainExpertise", "description", val)}
                    placeholder="Domain expertise description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Industry Domains</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.domainExpertise?.domains || []).map((dom: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Domain #{i + 1}</span>
                        <ItemControls index={i} count={(data.domainExpertise?.domains || []).length} onMove={(dir) => moveItem("domainExpertise", "domains", i, dir)} onRemove={() => removeItem("domainExpertise", "domains", i)} />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <div className="col-span-1 space-y-1"><label className={UI.label}>ID</label><input type="text" autoComplete="off" value={dom.id || ""} onChange={(e) => updateItem("domainExpertise", "domains", i, { id: e.target.value })} className={UI.input} placeholder="01" /></div>
                        <div className="col-span-3 space-y-1"><label className={UI.label}>Title</label><input type="text" autoComplete="off" value={dom.title || ""} onChange={(e) => updateItem("domainExpertise", "domains", i, { title: e.target.value })} className={UI.input} placeholder="e.g. B2B SaaS & Tech" /></div>
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Link URL (optional)</label>
                        <input
                          type="text"
                          autoComplete="off"
                          value={dom.link || dom.href || dom.url || ""}
                          onChange={(e) => updateItem("domainExpertise", "domains", i, { link: e.target.value, href: e.target.value, url: e.target.value })}
                          className={UI.input}
                          placeholder="e.g. /services/custom-web-applications"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Description</label>
                        <RichTextEditor
                          content={dom.desc || ""}
                          onChange={(val) => updateItem("domainExpertise", "domains", i, { desc: val })}
                          placeholder="Domain description..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Pill Tags (Comma Separated)</label>
                        <CommaSeparatedInput
                          value={dom.tags}
                          onChange={(tags) => updateItem("domainExpertise", "domains", i, { tags: tags })}
                          placeholder="SaaS Funnels, SOC2..."
                        />
                      </div>
                      <IconSelector label="Domain Icon" value={dom.iconName} onChange={(val) => updateItem("domainExpertise", "domains", i, { iconName: val })} />
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("domainExpertise", "domains", [...(data.domainExpertise?.domains || []), { id: `0${(data.domainExpertise?.domains || []).length + 1}`, title: "New Domain", desc: "", iconName: "Building2", tags: [], link: "", href: "", url: "" }])} className={UI.buttonAdd}>+ Add Domain</button>
              </div>
            </div>
          )}

          {/* 8. WHY BUSINESSES CHOOSE US */}
          {activeTab === "whyChooseUs" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Why Choose Us Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.whyChooseUs?.enabled !== false}
                  onChange={(v) => updateSection("whyChooseUs", "enabled", v)}
                  label="Why Choose Us"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Header</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.whyChooseUs?.eyebrow || ""} onChange={(e) => updateSection("whyChooseUs", "eyebrow", e.target.value)} className={UI.input} placeholder="THE STUDIO ADVANTAGE" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.whyChooseUs?.titleIntro || ""} onChange={(e) => updateSection("whyChooseUs", "titleIntro", e.target.value)} className={UI.input} placeholder="Why Visionary Leaders" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.whyChooseUs?.titleHighlight || ""} onChange={(e) => updateSection("whyChooseUs", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Choose Mohsin Designs" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.whyChooseUs?.description || ""}
                    onChange={(val) => updateSection("whyChooseUs", "description", val)}
                    placeholder="Why choose us description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Left Featured Blue Card</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Line 1 (Top)</label><input type="text" autoComplete="off" value={data.whyChooseUs?.blueCardLine1 || ""} onChange={(e) => updateSection("whyChooseUs", "blueCardLine1", e.target.value)} className={UI.input} placeholder="Direct Founder" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Line 2 (Gold Accent)</label><input type="text" autoComplete="off" value={data.whyChooseUs?.blueCardLine2 || ""} onChange={(e) => updateSection("whyChooseUs", "blueCardLine2", e.target.value)} className={UI.input} placeholder="Architecture & Execution" /></div>
                </div>
                <ImageField label="Blue Card Bottom Image" value={data.whyChooseUs?.blueCardImage || ""} onChange={(url) => updateSection("whyChooseUs", "blueCardImage", url)} altValue={data.whyChooseUs?.blueCardImageAlt || ""} onAltChange={(alt) => updateSection("whyChooseUs", "blueCardImageAlt", alt)} />
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Right Feature Grid Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {(data.whyChooseUs?.features || []).map((feat: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Feature #{i + 1}</span>
                        <ItemControls index={i} count={(data.whyChooseUs?.features || []).length} onMove={(dir) => moveItem("whyChooseUs", "features", i, dir)} onRemove={() => removeItem("whyChooseUs", "features", i)} />
                      </div>
                      <div className="space-y-1"><label className={UI.label}>Title</label><input type="text" autoComplete="off" value={feat.title || ""} onChange={(e) => updateItem("whyChooseUs", "features", i, { title: e.target.value })} className={UI.input} /></div>
                      <div className="space-y-1">
                        <label className={UI.label}>Description</label>
                        <RichTextEditor
                          content={feat.desc || ""}
                          onChange={(val) => updateItem("whyChooseUs", "features", i, { desc: val })}
                          placeholder="Feature description..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Icon Background Accent</label>
                        <select value={feat.iconBg || "blue"} onChange={(e) => updateItem("whyChooseUs", "features", i, { iconBg: e.target.value })} className={UI.input}>
                          <option value="blue">Blue Accent</option>
                          <option value="amber">Amber / Gold Accent</option>
                        </select>
                      </div>
                      <IconSelector label="Feature Icon" value={feat.iconName} onChange={(val) => updateItem("whyChooseUs", "features", i, { iconName: val })} />
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("whyChooseUs", "features", [...(data.whyChooseUs?.features || []), { title: "New Feature", desc: "", iconName: "Target", iconBg: "blue" }])} className={UI.buttonAdd}>+ Add Feature</button>
              </div>
            </div>
          )}

          {/* 9. FOUNDER & LEADERSHIP */}
          {activeTab === "executiveLeadership" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Founder & Leadership Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.executiveLeadership?.enabled !== false}
                  onChange={(v) => updateSection("executiveLeadership", "enabled", v)}
                  label="Founder & Leadership"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Section Header & Bio</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.executiveLeadership?.eyebrow || ""} onChange={(e) => updateSection("executiveLeadership", "eyebrow", e.target.value)} className={UI.input} placeholder="STUDIO LEADERSHIP" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.executiveLeadership?.titleIntro || ""} onChange={(e) => updateSection("executiveLeadership", "titleIntro", e.target.value)} className={UI.input} placeholder="Driven by Vision," /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.executiveLeadership?.titleHighlight || ""} onChange={(e) => updateSection("executiveLeadership", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Grounded in Craft" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Founder Name (shown under the heading)</label><input type="text" autoComplete="off" value={data.executiveLeadership?.founderName || ""} onChange={(e) => updateSection("executiveLeadership", "founderName", e.target.value)} className={UI.input} placeholder="e.g. Mohsin" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Founder Title / Role (shown next to the name)</label><input type="text" autoComplete="off" value={data.executiveLeadership?.founderTitle || ""} onChange={(e) => updateSection("executiveLeadership", "founderTitle", e.target.value)} className={UI.input} placeholder="e.g. FOUNDER & PRINCIPAL ARCHITECT" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Founder Biography</label>
                  <RichTextEditor
                    content={
                      data.executiveLeadership?.bioContent !== undefined
                        ? data.executiveLeadership?.bioContent
                        : data.executiveLeadership?.bio !== undefined
                          ? data.executiveLeadership?.bio
                          : [data.executiveLeadership?.bioParagraph1, data.executiveLeadership?.bioParagraph2]
                            .filter(Boolean)
                            .map((p: string) => `<p>${p}</p>`)
                            .join("")
                    }
                    onChange={(val) => {
                      updateSection("executiveLeadership", "bioContent", val);
                      updateSection("executiveLeadership", "bio", val);
                    }}
                    placeholder="Write the founder's biography, background, and vision..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Portrait Image</h3>
                <ImageField label="Founder Portrait" value={data.executiveLeadership?.portraitSrc || ""} onChange={(url) => updateSection("executiveLeadership", "portraitSrc", url)} altValue={data.executiveLeadership?.portraitAlt || ""} onAltChange={(alt) => updateSection("executiveLeadership", "portraitAlt", alt)} />
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Leadership Stats / Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(data.executiveLeadership?.metrics || []).map((m: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-2"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Stat #{i + 1}</span>
                        <ItemControls index={i} count={(data.executiveLeadership?.metrics || []).length} onMove={(dir) => moveItem("executiveLeadership", "metrics", i, dir)} onRemove={() => removeItem("executiveLeadership", "metrics", i)} />
                      </div>
                      <div className="space-y-1"><label className={UI.label}>Value</label><input type="text" autoComplete="off" value={m.value || ""} onChange={(e) => updateItem("executiveLeadership", "metrics", i, { value: e.target.value })} className={UI.input} placeholder="12+" /></div>
                      <div className="space-y-1"><label className={UI.label}>Label</label><input type="text" autoComplete="off" value={m.label || ""} onChange={(e) => updateItem("executiveLeadership", "metrics", i, { label: e.target.value })} className={UI.input} placeholder="Years Experience" /></div>
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("executiveLeadership", "metrics", [...(data.executiveLeadership?.metrics || []), { value: "100%", label: "Dedication" }])} className={UI.buttonAdd}>+ Add Stat</button>
              </div>
            </div>
          )}

          {/* 10. CLIENT REVIEWS */}
          {activeTab === "reviews" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Client Reviews Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.reviews?.enabled !== false}
                  onChange={(v) => updateSection("reviews", "enabled", v)}
                  label="Client Reviews"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Header & Rating Pill</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.reviews?.eyebrow || ""} onChange={(e) => updateSection("reviews", "eyebrow", e.target.value)} className={UI.input} placeholder="VERIFIED CLIENT PRAISE" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.reviews?.titleIntro || ""} onChange={(e) => updateSection("reviews", "titleIntro", e.target.value)} className={UI.input} placeholder="Trusted by Founders," /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Highlight</label><input type="text" autoComplete="off" value={data.reviews?.titleHighlight || ""} onChange={(e) => updateSection("reviews", "titleHighlight", e.target.value)} className={UI.inputPrimary} placeholder="Loved by Engineering Teams" /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.reviews?.description || ""}
                    onChange={(val) => updateSection("reviews", "description", val)}
                    placeholder="Client reviews description..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Rating Value</label><input type="text" autoComplete="off" value={data.reviews?.ratingValue || ""} onChange={(e) => updateSection("reviews", "ratingValue", e.target.value)} className={UI.input} placeholder="5.0 / 5.0" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Rating Sublabel</label><input type="text" autoComplete="off" value={data.reviews?.ratingSub || ""} onChange={(e) => updateSection("reviews", "ratingSub", e.target.value)} className={UI.input} placeholder="Verified Reviews" /></div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Marquee Reviews List</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(data.reviews?.list || []).map((rev: any, i: number) => (
                    <div key={i} className={UI.card + " space-y-3"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[11px] font-bold text-[#646970] uppercase">Review #{i + 1}</span>
                        <ItemControls index={i} count={(data.reviews?.list || []).length} onMove={(dir) => moveItem("reviews", "list", i, dir)} onRemove={() => removeItem("reviews", "list", i)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1"><label className={UI.label}>Industry / Tag</label><input type="text" autoComplete="off" value={rev.tag || ""} onChange={(e) => updateItem("reviews", "list", i, { tag: e.target.value })} className={UI.input} placeholder="Enterprise SaaS" /></div>
                        <div className="space-y-1"><label className={UI.label}>Impact Badge</label><input type="text" autoComplete="off" value={rev.impact || ""} onChange={(e) => updateItem("reviews", "list", i, { impact: e.target.value })} className={UI.input} placeholder="+340% Performance" /></div>
                        <div className="space-y-1"><label className={UI.label}>Client Name</label><input type="text" autoComplete="off" value={rev.name || ""} onChange={(e) => updateItem("reviews", "list", i, { name: e.target.value })} className={UI.input} /></div>
                        <div className="space-y-1"><label className={UI.label}>Role</label><input type="text" autoComplete="off" value={rev.role || ""} onChange={(e) => updateItem("reviews", "list", i, { role: e.target.value })} className={UI.input} /></div>
                        <div className="space-y-1"><label className={UI.label}>Company</label><input type="text" autoComplete="off" value={rev.company || ""} onChange={(e) => updateItem("reviews", "list", i, { company: e.target.value })} className={UI.input} /></div>
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Quote</label>
                        <RichTextEditor
                          content={rev.quote || ""}
                          onChange={(val) => updateItem("reviews", "list", i, { quote: val })}
                          placeholder="Client review quote..."
                        />
                      </div>
                      <div className="space-y-1">
                        <label className={UI.label}>Avatar Color (initial is taken from the client name)</label>
                        <select value={rev.accent || "#0306AC"} onChange={(e) => updateItem("reviews", "list", i, { accent: e.target.value })} className={UI.input}>
                          <option value="#0306AC">Brand Blue (#0306AC)</option>
                          <option value="#E9BD36">Brand Yellow (#E9BD36)</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => updateSection("reviews", "list", [...(data.reviews?.list || []), { tag: "Client Build", impact: "High Growth", quote: "<p>Outstanding execution and delivery.</p>", name: "Client Name", role: "Founder", company: "Company Inc", accent: "#0306AC" }])} className={UI.buttonAdd}>+ Add Review</button>
              </div>
            </div>
          )}

          {/* 11. CTA BANNER */}
          {activeTab === "ctaBanner" && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">CTA Banner Visibility</h2>
                  <p className="text-xs text-[#646970]">Show or hide this section on the live page. A section that has no content yet is not shown either.</p>
                </div>
                <SectionToggle
                  enabled={data.ctaBanner?.enabled !== false}
                  onChange={(v) => updateSection("ctaBanner", "enabled", v)}
                  label="CTA Banner"
                />
              </div>
              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>1. Banner Headlines</h3>
                <div className="space-y-1.5"><label className={UI.label}>Eyebrow</label><input type="text" autoComplete="off" value={data.ctaBanner?.eyebrow || ""} onChange={(e) => updateSection("ctaBanner", "eyebrow", e.target.value)} className={UI.input} placeholder="READY TO SCALE YOUR VISION?" /></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5"><label className={UI.label}>Title Intro</label><input type="text" autoComplete="off" value={data.ctaBanner?.titleIntro || ""} onChange={(e) => updateSection("ctaBanner", "titleIntro", e.target.value)} className={UI.input} placeholder="Let's Engineer Something" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Word 1 (Plain)</label><input type="text" autoComplete="off" value={data.ctaBanner?.titleWord1 || ""} onChange={(e) => updateSection("ctaBanner", "titleWord1", e.target.value)} className={UI.input} placeholder="Truly" /></div>
                  <div className="space-y-1.5"><label className={UI.label}>Title Word 2 (Cursive & Underlined)</label><input type="text" autoComplete="off" value={data.ctaBanner?.titleWord2 || ""} onChange={(e) => updateSection("ctaBanner", "titleWord2", e.target.value)} className={UI.inputPrimary} placeholder="Remarkable." /></div>
                </div>
                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <RichTextEditor
                    content={data.ctaBanner?.description || ""}
                    onChange={(val) => updateSection("ctaBanner", "description", val)}
                    placeholder="CTA banner description..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>2. Call to Action Buttons</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={UI.card}>
                    <span className="text-[11px] font-bold text-[#2271b1] uppercase block mb-3">Primary Button</span>
                    <div className="space-y-3">
                      <div className="space-y-1"><label className={UI.label}>Button Text</label><input type="text" autoComplete="off" value={data.ctaBanner?.ctaPrimaryText || ""} onChange={(e) => updateSection("ctaBanner", "ctaPrimaryText", e.target.value)} className={UI.input} placeholder="Book Architecture Call" /></div>
                      <div className="space-y-1"><label className={UI.label}>Button Link</label><input type="text" autoComplete="off" value={data.ctaBanner?.ctaPrimaryHref || ""} onChange={(e) => updateSection("ctaBanner", "ctaPrimaryHref", e.target.value)} className={UI.input} placeholder="/contact-us" /><span className={UI.helpText}>Empty = the contact page.</span></div>
                    </div>
                  </div>
                  <div className={UI.card}>
                    <span className="text-[11px] font-bold text-[#646970] uppercase block mb-3">Secondary Button</span>
                    <div className="space-y-3">
                      <div className="space-y-1"><label className={UI.label}>Button Text</label><input type="text" autoComplete="off" value={data.ctaBanner?.ctaSecondaryText || ""} onChange={(e) => updateSection("ctaBanner", "ctaSecondaryText", e.target.value)} className={UI.input} placeholder="View Case Studies" /></div>
                      <div className="space-y-1"><label className={UI.label}>Button Link</label><input type="text" autoComplete="off" value={data.ctaBanner?.ctaSecondaryHref || ""} onChange={(e) => updateSection("ctaBanner", "ctaSecondaryHref", e.target.value)} className={UI.input} placeholder="/portfolio" /><span className={UI.helpText}>The secondary button is only shown when it has both text and a link.</span></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className={UI.sectionHeader}>3. Floating Portrait (desktop only)</h3>
                <ImageField label="CTA Floating Portrait" value={data.ctaBanner?.portraitSrc || ""} onChange={(url) => updateSection("ctaBanner", "portraitSrc", url)} altValue={data.ctaBanner?.portraitAlt || ""} onAltChange={(alt) => updateSection("ctaBanner", "portraitAlt", alt)} />
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
