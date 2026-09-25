"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
// Built-in sample sectors / pillars the public page shows while nothing is saved yet.
import { DEFAULT_INDUSTRY_DOMAINS, DEFAULT_INDUSTRY_FEATURES, padIndex } from "@/components/templates/industryDefaults";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-20 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

/**
 * Resilient Comma-Separated Input that buffers local string state
 * so typing spaces and commas does NOT get wiped or swallowed by array serialization.
 */
function CommaSeparatedInput({
  value,
  onChange,
  className = UI.input,
  placeholder = "Tag 1, Tag 2, Tag 3..."
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

/** Returns a copy of `arr` with the item at `from` moved to index `to` (no-op when out of range). */
function moveInArray<T>(arr: T[], from: number, to: number): T[] {
  if (to < 0 || to >= arr.length || from === to) return arr;
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** Up / down arrows for reordering a repeatable card. */
function MoveButtons({ index, count, onMove }: { index: number; count: number; onMove: (to: number) => void }) {
  const cls = "p-1 rounded text-[#50575e] hover:bg-[#f0f0f1] disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <span className="inline-flex items-center gap-0.5">
      <button type="button" aria-label="Move up" title="Move up" disabled={index === 0} onClick={() => onMove(index - 1)} className={cls}>
        <ArrowUp className="h-3.5 w-3.5" />
      </button>
      <button type="button" aria-label="Move down" title="Move down" disabled={index === count - 1} onClick={() => onMove(index + 1)} className={cls}>
        <ArrowDown className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

export default function IndustryEditor({
  pageId,
  data,
  setData,
  seo,
  setSeo
}: {
  pageId: string;
  data: any;
  setData: (d: any) => void;
  /** Page-level SEO state handed down by the admin page shell (schema JSON-LD lives in seo.schemaData). */
  seo?: any;
  setSeo?: (s: any) => void;
}) {
  const [activeTab, setActiveTab] = useState("hero");

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" />
      </div>
    );
  }

  const industryData = data?.industryPage || data || {};

  const updateSection = (section: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const currentData = prev || {};
      const currentIndustry = currentData.industryPage || currentData;
      const sectionData = currentIndustry[section] || {};

      let newSectionState = sectionData;
      if (field) {
        newSectionState = {
          ...sectionData,
          [field]: value
        };
      } else {
        newSectionState = value;
      }

      return {
        ...currentData,
        industryPage: {
          ...currentIndustry,
          [section]: newSectionState
        }
      };
    });
  };

  // The FAQ section is driven by the page shell's generic "Page FAQs" tab (content.faqs,
  // faqBadge, faqTitle..., strategyAudit), so its hide/show switch lives at the TOP level of the
  // content object - not inside `industryPage` like the other sections.
  const setFaqVisible = (visible: boolean) => {
    setData((prev: any) => ({
      ...(prev || {}),
      faqSection: { ...((prev || {}).faqSection || {}), enabled: visible }
    }));
  };
  const faqVisible = data?.faqSection?.enabled !== false;

  const tabs = [
    { id: "hero", label: "1. Hero & Form" },
    { id: "services", label: "2. Services Selection" },
    { id: "sectors", label: "3. Industry Sectors" },
    { id: "founder", label: "4. About Founder" },
    { id: "whyChooseUs", label: "5. Why Choose Us" },
    { id: "faqs", label: "6. FAQs" },
    { id: "cta", label: "7. Final CTA Banner" },
    { id: "schema", label: "8. Schema Markup" }
  ];

  return (
    <div className="bg-white max-w-4xl mx-auto pb-20 text-left">
      {/* WordPress Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-10 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-1.5 py-1 transition-colors ${
                activeTab === tab.id
                  ? "text-[#1d2327] font-bold border-b-2 border-[#2271b1]"
                  : "text-[#2271b1] hover:text-[#135e96]"
              }`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
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
          className="space-y-12"
        >
          {/* ───────────────────────────────────────────────────────────── */}
          {/* 1. HERO SECTION & FORM                                        */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Hero & Form Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.hero?.enabled !== false}
                  onChange={(v) => updateSection("hero", "enabled", v)}
                  label="Hero & Form"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Hero Branding & Badges</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Eyebrow Badge Text</label>
                  <input
                    type="text"
                    value={industryData.hero?.eyebrowBadge || ""}
                    onChange={(e) => updateSection("hero", "eyebrowBadge", e.target.value)}
                    placeholder="e.g. INDUSTRY-SPECIFIC DIGITAL ARCHITECTURE"
                    className={UI.input}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. High-Converting Hero Headline</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={industryData.hero?.titleIntro || ""}
                      onChange={(e) => updateSection("hero", "titleIntro", e.target.value)}
                      placeholder="e.g. High-Converting Platforms Built for"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight (Accent Color & Underline)</label>
                    <input
                      type="text"
                      value={industryData.hero?.titleHighlight || ""}
                      onChange={(e) => updateSection("hero", "titleHighlight", e.target.value)}
                      placeholder="e.g. Industry Leaders"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Suffix</label>
                    <input
                      type="text"
                      value={industryData.hero?.titleSuffix || ""}
                      onChange={(e) => updateSection("hero", "titleSuffix", e.target.value)}
                      placeholder="e.g. that Compound Revenue"
                      className={UI.input}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Subtitle Description</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Hero Description Narrative</label>
                  <RichTextEditor
                    content={industryData.hero?.description || ""}
                    onChange={(val: string) => updateSection("hero", "description", val)}
                    placeholder="We engineer bespoke web applications, custom digital architectures..."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>4. Action Buttons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={UI.card + " space-y-3 !mb-0"}>
                    <span className="text-[10px] font-bold text-[#2271b1] uppercase">Primary CTA Button</span>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={industryData.hero?.primaryCtaText || ""}
                        onChange={(e) => updateSection("hero", "primaryCtaText", e.target.value)}
                        placeholder="e.g. Request Industry Audit"
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link (href)</label>
                      <input
                        type="text"
                        value={industryData.hero?.primaryCtaLink || ""}
                        onChange={(e) => updateSection("hero", "primaryCtaLink", e.target.value)}
                        placeholder="e.g. #industry-form"
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className={UI.card + " space-y-3 !mb-0"}>
                    <span className="text-[10px] font-bold text-[#646970] uppercase">Secondary CTA Button</span>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={industryData.hero?.secondaryCtaText || ""}
                        onChange={(e) => updateSection("hero", "secondaryCtaText", e.target.value)}
                        placeholder="e.g. Explore Sectors"
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link (href)</label>
                      <input
                        type="text"
                        value={industryData.hero?.secondaryCtaLink || ""}
                        onChange={(e) => updateSection("hero", "secondaryCtaLink", e.target.value)}
                        placeholder="e.g. #sectors"
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>5. Conversion Highlights (Green Checkmarks)</h3>
                <div className="space-y-3">
                  {(industryData.hero?.highlights || []).map((highlight: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={highlight}
                        onChange={(e) => {
                          const updated = [...(industryData.hero?.highlights || [])];
                          updated[idx] = e.target.value;
                          updateSection("hero", "highlights", updated);
                        }}
                        className={UI.input}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (industryData.hero?.highlights || []).filter((_: any, i: number) => i !== idx);
                          updateSection("hero", "highlights", updated);
                        }}
                        className="text-[#d63638] hover:bg-red-50 p-2 rounded text-xs font-bold"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const current = industryData.hero?.highlights || [];
                      updateSection("hero", "highlights", [...current, "New Key Industry Guarantee"]);
                    }}
                    className={UI.buttonAdd}
                  >
                    + Add Highlight Point
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>6. Telemetry & Stats Pills</h3>
                <div className="space-y-4">
                  {(industryData.hero?.statsPills || []).map((stat: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Stat #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <MoveButtons
                            index={idx}
                            count={(industryData.hero?.statsPills || []).length}
                            onMove={(to) => updateSection("hero", "statsPills", moveInArray(industryData.hero?.statsPills || [], idx, to))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (industryData.hero?.statsPills || []).filter((_: any, i: number) => i !== idx);
                              updateSection("hero", "statsPills", updated);
                            }}
                            className="text-[#d63638] text-[11px] font-bold hover:underline"
                          >
                            Remove Stat
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Stat Value</label>
                          <input
                            type="text"
                            value={stat.value || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.hero?.statsPills || [])];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              updateSection("hero", "statsPills", updated);
                            }}
                            placeholder="e.g. 99.8%"
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Stat Label</label>
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.hero?.statsPills || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              updateSection("hero", "statsPills", updated);
                            }}
                            placeholder="e.g. Client Retention"
                            className={UI.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const current = industryData.hero?.statsPills || [];
                      updateSection("hero", "statsPills", [...current, { value: "100/100", label: "Performance Score" }]);
                    }}
                    className={UI.buttonAdd}
                  >
                    + Add Stat Pill
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>7. Right-Side Consultation Form Box</h3>
                <p className={UI.helpText}>
                  The form's "Industry / Sector" dropdown is built automatically from the cards in the
                  "Industry Sectors" tab (plus an "Other" choice). Leads are e-mailed to the receiver set on the Contact page.
                </p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Form Badge (small line above the title)</label>
                    <input
                      type="text"
                      value={industryData.hero?.formBadge || ""}
                      onChange={(e) => updateSection("hero", "formBadge", e.target.value)}
                      placeholder="e.g. DIRECT ARCHITECT ACCESS"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Form Title</label>
                    <input
                      type="text"
                      value={industryData.hero?.formTitle || ""}
                      onChange={(e) => updateSection("hero", "formTitle", e.target.value)}
                      placeholder="e.g. Get a Free Industry Strategy Session"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Form Subtitle</label>
                    <input
                      type="text"
                      value={industryData.hero?.formSubtitle || ""}
                      onChange={(e) => updateSection("hero", "formSubtitle", e.target.value)}
                      placeholder="e.g. Direct architecture consultation with zero sales pressure."
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Submit Button Label</label>
                    <input
                      type="text"
                      value={industryData.hero?.formButtonText || ""}
                      onChange={(e) => updateSection("hero", "formButtonText", e.target.value)}
                      placeholder="e.g. Get Free Strategy"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Success Message - Title (shown after the form is sent)</label>
                    <input
                      type="text"
                      value={industryData.hero?.successTitle || ""}
                      onChange={(e) => updateSection("hero", "successTitle", e.target.value)}
                      placeholder="e.g. Consultation Request Received!"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Success Message - Text</label>
                    <textarea
                      rows={2}
                      value={industryData.hero?.successMessage || ""}
                      onChange={(e) => updateSection("hero", "successMessage", e.target.value)}
                      placeholder="e.g. Thank you! Our lead architect will review your project requirements and get in touch within 24 hours."
                      className={UI.textarea}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Privacy Note (small print under the button)</label>
                    <input
                      type="text"
                      value={industryData.hero?.privacyNote || ""}
                      onChange={(e) => updateSection("hero", "privacyNote", e.target.value)}
                      placeholder="e.g. 100% Confidential. Zero spam. We never share your data."
                      className={UI.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 2. SERVICES SELECTION SECTION                                 */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "services" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Services Section Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying services grid on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.servicesSection?.enabled !== false}
                  onChange={(v) => updateSection("servicesSection", "enabled", v)}
                  label="Services Section"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Section Header & Messaging</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Eyebrow</label>
                    <input
                      type="text"
                      value={industryData.servicesSection?.eyebrow || ""}
                      onChange={(e) => updateSection("servicesSection", "eyebrow", e.target.value)}
                      placeholder="e.g. OUR CORE DISCIPLINES"
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={industryData.servicesSection?.titleIntro || ""}
                        onChange={(e) => updateSection("servicesSection", "titleIntro", e.target.value)}
                        placeholder="e.g. Comprehensive Solutions Tailored for "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={industryData.servicesSection?.titleHighlight || ""}
                        onChange={(e) => updateSection("servicesSection", "titleHighlight", e.target.value)}
                        placeholder="e.g. Market Dominance"
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Description</label>
                    <RichTextEditor
                      content={industryData.servicesSection?.description || ""}
                      onChange={(val) => updateSection("servicesSection", "description", val)}
                      placeholder="Modular, high-performance web engineering services built to address your sector..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Curated Services for This Industry</h3>
                <p className={UI.helpText}>
                  Choose which services from your master services catalog will appear in the services grid on this industry page.
                  Nothing selected = the page shows every published service from the catalog. Each card links to the service's own page,
                  and always shows the service's current name and link (drafts and trashed services are skipped).
                </p>

                <ContentSelector
                  type="services"
                  label="Select Services to Display"
                  selectedItems={industryData.servicesSection?.selectedServices || []}
                  onSelect={(items) =>
                    // ContentSelector hands back the WHOLE service document (hero, FAQs, pricing...).
                    // Keep only what this page needs plus the keys the selector uses to recognise a pick,
                    // otherwise every ticked service is copied in full into this page's content.
                    updateSection(
                      "servicesSection",
                      "selectedServices",
                      (items || []).map((s: any) => ({
                        _id: s._id,
                        id: s.id,
                        slug: s.slug,
                        title: s.title || s.name,
                        tag: s.tag,
                        category: s.category,
                        tagline: s.tagline,
                        icon: s.icon || s.iconName,
                        status: s.status
                      }))
                    )
                  }
                />
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 3. INDUSTRY SECTORS (DOMAIN EXPERTISE)                        */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "sectors" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Industry Sectors Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying domain sectors on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.domainExpertise?.enabled !== false}
                  onChange={(v) => updateSection("domainExpertise", "enabled", v)}
                  label="Industry Sectors"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Section Header</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Eyebrow</label>
                    <input
                      type="text"
                      value={industryData.domainExpertise?.eyebrow || ""}
                      onChange={(e) => updateSection("domainExpertise", "eyebrow", e.target.value)}
                      placeholder="e.g. INDUSTRY SECTORS WE SERVE"
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={industryData.domainExpertise?.titleIntro || ""}
                        onChange={(e) => updateSection("domainExpertise", "titleIntro", e.target.value)}
                        placeholder="e.g. Proven Experience Across "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={industryData.domainExpertise?.titleHighlight || ""}
                        onChange={(e) => updateSection("domainExpertise", "titleHighlight", e.target.value)}
                        placeholder="e.g. Key Market Verticals"
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Description</label>
                    <RichTextEditor
                      content={industryData.domainExpertise?.description || ""}
                      onChange={(val) => updateSection("domainExpertise", "description", val)}
                      placeholder="Every industry has distinct compliance, customer acquisition funnels, and technical requirements..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Industry Vertical Cards</h3>
                <p className={UI.helpText}>
                  These cards also fill the "Industry / Sector" dropdown of the hero form. A card with a Link URL becomes clickable.
                </p>
                {(industryData.domainExpertise?.domains || []).length === 0 && (
                  <div className="border border-dashed border-[#2271b1] bg-[#f0f6fb] rounded-[3px] p-4 space-y-3">
                    <p className="text-[13px] text-[#1d2327]">
                      No sector cards saved yet, so the live page is showing {DEFAULT_INDUSTRY_DOMAINS.length} built-in example sectors.
                      Load them here to edit, reorder or delete them (removing every card brings the examples back).
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(
                          "domainExpertise",
                          "domains",
                          DEFAULT_INDUSTRY_DOMAINS.map((d) => ({ ...d, tags: [...d.tags], link: "" }))
                        )
                      }
                      className={UI.buttonAdd}
                    >
                      Load the built-in example sectors
                    </button>
                  </div>
                )}
                <div className="space-y-6">
                  {(industryData.domainExpertise?.domains || []).map((domain: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">
                          Sector Card #{idx + 1} ({domain.id || padIndex(idx + 1)})
                        </span>
                        <div className="flex items-center gap-3">
                          <MoveButtons
                            index={idx}
                            count={(industryData.domainExpertise?.domains || []).length}
                            onMove={(to) =>
                              updateSection("domainExpertise", "domains", moveInArray(industryData.domainExpertise?.domains || [], idx, to))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (industryData.domainExpertise?.domains || []).filter((_: any, i: number) => i !== idx);
                              updateSection("domainExpertise", "domains", updated);
                            }}
                            className="text-[#d63638] text-[11px] font-bold hover:underline"
                          >
                            Remove Sector
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Sector Title</label>
                          <input
                            type="text"
                            value={domain.title || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.domainExpertise?.domains || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              updateSection("domainExpertise", "domains", updated);
                            }}
                            placeholder="e.g. Healthcare & MedTech"
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Card Number (shown in cursive)</label>
                          <input
                            type="text"
                            value={domain.id || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.domainExpertise?.domains || [])];
                              updated[idx] = { ...updated[idx], id: e.target.value };
                              updateSection("domainExpertise", "domains", updated);
                            }}
                            placeholder="01"
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Icon Selection</label>
                          <IconSelector
                            value={domain.iconName || "Briefcase"}
                            onChange={(icon) => {
                              const updated = [...(industryData.domainExpertise?.domains || [])];
                              updated[idx] = { ...updated[idx], iconName: icon };
                              updateSection("domainExpertise", "domains", updated);
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Link URL (optional)</label>
                        <input
                          type="text"
                          value={domain.link || domain.href || domain.url || ""}
                          onChange={(e) => {
                            const updated = [...(industryData.domainExpertise?.domains || [])];
                            updated[idx] = { ...updated[idx], link: e.target.value, href: e.target.value, url: e.target.value };
                            updateSection("domainExpertise", "domains", updated);
                          }}
                          placeholder="e.g. /services/custom-web-applications"
                          className={UI.input}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Sector Description</label>
                        <RichTextEditor
                          content={domain.desc || domain.description || ""}
                          onChange={(val: string) => {
                            const updated = [...(industryData.domainExpertise?.domains || [])];
                            updated[idx] = { ...updated[idx], desc: val };
                            updateSection("domainExpertise", "domains", updated);
                          }}
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Tags (Comma-Separated)</label>
                        <CommaSeparatedInput
                          value={domain.tags}
                          onChange={(tagsArray) => {
                            const updated = [...(industryData.domainExpertise?.domains || [])];
                            updated[idx] = { ...updated[idx], tags: tagsArray };
                            updateSection("domainExpertise", "domains", updated);
                          }}
                          placeholder="e.g. HIPAA Compliance, Telehealth, Patient Portals"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      const current = industryData.domainExpertise?.domains || [];
                      updateSection("domainExpertise", "domains", [
                        ...current,
                        {
                          id: padIndex(current.length + 1),
                          title: "New Sector Vertical",
                          desc: "Tailored architecture and compliant digital workflows.",
                          iconName: "Briefcase",
                          tags: ["Custom Architecture", "Compliance"],
                          link: ""
                        }
                      ]);
                    }}
                    className={UI.buttonAdd}
                  >
                    + Add Industry Sector Card
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 4. ABOUT FOUNDER SECTION                                      */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "founder" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">About Founder Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying founder leadership on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.founder?.enabled !== false}
                  onChange={(v) => updateSection("founder", "enabled", v)}
                  label="About Founder"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Executive Leadership Header</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Section Eyebrow</label>
                    <input
                      type="text"
                      value={industryData.founder?.eyebrow || ""}
                      onChange={(e) => updateSection("founder", "eyebrow", e.target.value)}
                      placeholder="e.g. EXECUTIVE LEADERSHIP & CRAFT"
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={industryData.founder?.titleIntro || ""}
                        onChange={(e) => updateSection("founder", "titleIntro", e.target.value)}
                        placeholder="e.g. Architectural Rigor with "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={industryData.founder?.titleHighlight || ""}
                        onChange={(e) => updateSection("founder", "titleHighlight", e.target.value)}
                        placeholder="e.g. Direct Founder Involvement"
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Founder Identity & Portrait</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Founder Full Name (caption on the portrait)</label>
                    <input
                      type="text"
                      value={industryData.founder?.founderName || ""}
                      onChange={(e) => updateSection("founder", "founderName", e.target.value)}
                      placeholder="e.g. Mohsin Lead Architect"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Founder Official Title (caption on the portrait)</label>
                    <input
                      type="text"
                      value={industryData.founder?.founderTitle || ""}
                      onChange={(e) => updateSection("founder", "founderTitle", e.target.value)}
                      placeholder="e.g. FOUNDER & PRINCIPAL ARCHITECT"
                      className={UI.input}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Founder Portrait Media</label>
                  <ImageField
                    value={industryData.founder?.portraitSrc || ""}
                    onChange={(url) => updateSection("founder", "portraitSrc", url)}
                    altValue={industryData.founder?.portraitAlt || ""}
                    onAltChange={(alt) => updateSection("founder", "portraitAlt", alt)}
                    description="Leave empty to use the default portrait. If the image file cannot be loaded, the portrait is simply not shown."
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Bio Narrative</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>Founder Bio Narrative</label>
                  <RichTextEditor
                    content={
                      industryData.founder?.bioContent !== undefined
                        ? industryData.founder?.bioContent
                        : industryData.founder?.bio !== undefined
                          ? industryData.founder?.bio
                          : [industryData.founder?.bioParagraph1, industryData.founder?.bioParagraph2]
                            .filter(Boolean)
                            .map((p: string) => `<p>${p}</p>`)
                            .join("")
                    }
                    onChange={(val: string) => {
                      updateSection("founder", "bioContent", val);
                      updateSection("founder", "bio", val);
                    }}
                    placeholder="Write founder leadership narrative and bio..."
                  />
                  <p className={UI.helpText}>
                    Use rich formatting (bold, links, lists, headings) for the founder bio.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>4. Credibility Metrics</h3>
                <div className="space-y-4">
                  {(industryData.founder?.metrics || []).map((m: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Metric #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <MoveButtons
                            index={idx}
                            count={(industryData.founder?.metrics || []).length}
                            onMove={(to) => updateSection("founder", "metrics", moveInArray(industryData.founder?.metrics || [], idx, to))}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (industryData.founder?.metrics || []).filter((_: any, i: number) => i !== idx);
                              updateSection("founder", "metrics", updated);
                            }}
                            className="text-[#d63638] text-[11px] font-bold hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className={UI.label}>Metric Value</label>
                          <input
                            type="text"
                            value={m.value || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.founder?.metrics || [])];
                              updated[idx] = { ...updated[idx], value: e.target.value };
                              updateSection("founder", "metrics", updated);
                            }}
                            placeholder="e.g. 12+"
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Metric Label</label>
                          <input
                            type="text"
                            value={m.label || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.founder?.metrics || [])];
                              updated[idx] = { ...updated[idx], label: e.target.value };
                              updateSection("founder", "metrics", updated);
                            }}
                            placeholder="e.g. Years Experience"
                            className={UI.input}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const current = industryData.founder?.metrics || [];
                      updateSection("founder", "metrics", [...current, { value: "100%", label: "Senior Lead Dedication" }]);
                    }}
                    className={UI.buttonAdd}
                  >
                    + Add Credibility Metric
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 5. WHY BUSINESSES CHOOSE US                                   */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "whyChooseUs" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Why Choose Us Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying differentiators on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.whyChooseUs?.enabled !== false}
                  onChange={(v) => updateSection("whyChooseUs", "enabled", v)}
                  label="Why Choose Us"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Section Header & Value Proposition</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Eyebrow Badge</label>
                    <input
                      type="text"
                      value={industryData.whyChooseUs?.eyebrow || ""}
                      onChange={(e) => updateSection("whyChooseUs", "eyebrow", e.target.value)}
                      placeholder="e.g. THE MOHSIN ADVANTAGE"
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={industryData.whyChooseUs?.titleIntro || ""}
                        onChange={(e) => updateSection("whyChooseUs", "titleIntro", e.target.value)}
                        placeholder="e.g. Why Market Leaders Choose "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Highlight</label>
                      <input
                        type="text"
                        value={industryData.whyChooseUs?.titleHighlight || ""}
                        onChange={(e) => updateSection("whyChooseUs", "titleHighlight", e.target.value)}
                        placeholder="e.g. Mohsin Designs"
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Description</label>
                    <RichTextEditor
                      content={industryData.whyChooseUs?.description || ""}
                      onChange={(val) => updateSection("whyChooseUs", "description", val)}
                      placeholder="We deliver measurable advantages through clean code, direct communication..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Featured Blue Card</h3>
                <div className={UI.card + " space-y-4"}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Card Line 1</label>
                      <input
                        type="text"
                        value={industryData.whyChooseUs?.blueCardLine1 || ""}
                        onChange={(e) => updateSection("whyChooseUs", "blueCardLine1", e.target.value)}
                        placeholder="e.g. Direct Senior Architect"
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Card Line 2 (Gold Accent)</label>
                      <input
                        type="text"
                        value={industryData.whyChooseUs?.blueCardLine2 || ""}
                        onChange={(e) => updateSection("whyChooseUs", "blueCardLine2", e.target.value)}
                        placeholder="e.g. Zero Junior Hand-Offs"
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Featured Card Image</label>
                    <ImageField
                      value={industryData.whyChooseUs?.blueCardImage || ""}
                      onChange={(url) => updateSection("whyChooseUs", "blueCardImage", url)}
                      altValue={industryData.whyChooseUs?.blueCardImageAlt || ""}
                      onAltChange={(alt) => updateSection("whyChooseUs", "blueCardImageAlt", alt)}
                      description="Shown at the bottom of the blue card. Leave empty to use the default image."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Value Proposition Pillars</h3>
                {(industryData.whyChooseUs?.features || []).length === 0 && (
                  <div className="border border-dashed border-[#2271b1] bg-[#f0f6fb] rounded-[3px] p-4 space-y-3">
                    <p className="text-[13px] text-[#1d2327]">
                      No pillars saved yet, so the live page is showing {DEFAULT_INDUSTRY_FEATURES.length} built-in example pillars.
                      Load them here to edit, reorder or delete them (removing every pillar brings the examples back).
                    </p>
                    <button
                      type="button"
                      onClick={() => updateSection("whyChooseUs", "features", DEFAULT_INDUSTRY_FEATURES.map((f) => ({ ...f })))}
                      className={UI.buttonAdd}
                    >
                      Load the built-in example pillars
                    </button>
                  </div>
                )}
                <div className="space-y-6">
                  {(industryData.whyChooseUs?.features || []).map((feat: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Pillar #{idx + 1}</span>
                        <div className="flex items-center gap-3">
                          <MoveButtons
                            index={idx}
                            count={(industryData.whyChooseUs?.features || []).length}
                            onMove={(to) =>
                              updateSection("whyChooseUs", "features", moveInArray(industryData.whyChooseUs?.features || [], idx, to))
                            }
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (industryData.whyChooseUs?.features || []).filter((_: any, i: number) => i !== idx);
                              updateSection("whyChooseUs", "features", updated);
                            }}
                            className="text-[#d63638] text-[11px] font-bold hover:underline"
                          >
                            Remove Pillar
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className={UI.label}>Pillar Title</label>
                          <input
                            type="text"
                            value={feat.title || ""}
                            onChange={(e) => {
                              const updated = [...(industryData.whyChooseUs?.features || [])];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              updateSection("whyChooseUs", "features", updated);
                            }}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className={UI.label}>Icon Selection</label>
                          <IconSelector
                            value={feat.iconName || "Zap"}
                            onChange={(icon) => {
                              const updated = [...(industryData.whyChooseUs?.features || [])];
                              updated[idx] = { ...updated[idx], iconName: icon };
                              updateSection("whyChooseUs", "features", updated);
                            }}
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5 max-w-xs">
                        <label className={UI.label}>Icon Tile Colour</label>
                        <select
                          value={feat.iconBg === "amber" ? "amber" : "blue"}
                          onChange={(e) => {
                            const updated = [...(industryData.whyChooseUs?.features || [])];
                            updated[idx] = { ...updated[idx], iconBg: e.target.value };
                            updateSection("whyChooseUs", "features", updated);
                          }}
                          className={UI.input}
                        >
                          <option value="blue">Blue</option>
                          <option value="amber">Gold / Amber</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <RichTextEditor
                          content={feat.desc || ""}
                          onChange={(val) => {
                            const updated = [...(industryData.whyChooseUs?.features || [])];
                            updated[idx] = { ...updated[idx], desc: val };
                            updateSection("whyChooseUs", "features", updated);
                          }}
                          placeholder="Feature description..."
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const current = industryData.whyChooseUs?.features || [];
                      updateSection("whyChooseUs", "features", [
                        ...current,
                        {
                          title: "New Competitive Advantage",
                          desc: "Measurable commercial outcome backed by robust architecture.",
                          iconName: "Zap",
                          iconBg: "amber"
                        }
                      ]);
                    }}
                    className={UI.buttonAdd}
                  >
                    + Add Value Proposition Pillar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 6. FAQ SECTION (visibility only - questions live in "Page FAQs") */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "faqs" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">FAQ Section Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying the FAQ section on the live page.</p>
                </div>
                <SectionToggle enabled={faqVisible} onChange={setFaqVisible} label="FAQ Section" />
              </div>
              <div className={UI.card + " space-y-3"}>
                <p className="text-[13px] text-[#1d2327]">
                  The questions and answers, the section heading and description, and the sticky "Book a call" box are edited in the{" "}
                  <strong>Page FAQs</strong> tab at the top of this page (next to "Page Content" and "SEO Settings").
                </p>
                <p className={UI.helpText + " !mb-0"}>
                  Currently {Array.isArray(data?.faqs) ? data.faqs.length : 0} question(s) saved. With none saved, the live page shows 4 built-in
                  industry FAQs. The box's call-to-action button jumps to the hero lead form unless you give it a different link there.
                </p>
              </div>
            </div>
          )}

          {/* ───────────────────────────────────────────────────────────── */}
          {/* 7. FINAL CTA BANNER                                           */}
          {/* ───────────────────────────────────────────────────────────── */}
          {activeTab === "cta" && (
            <div className="space-y-12">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className="text-base font-bold text-[#1d2327]">Final CTA Banner Visibility</h2>
                  <p className="text-xs text-[#646970]">Enable or disable displaying bottom CTA banner on the live page.</p>
                </div>
                <SectionToggle
                  enabled={industryData.ctaBanner?.enabled !== false}
                  onChange={(v) => updateSection("ctaBanner", "enabled", v)}
                  label="CTA Banner"
                />
              </div>
              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>1. Banner Headlines</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Eyebrow Badge</label>
                    <input
                      type="text"
                      value={industryData.ctaBanner?.eyebrow || ""}
                      onChange={(e) => updateSection("ctaBanner", "eyebrow", e.target.value)}
                      placeholder="e.g. READY TO ACCELERATE YOUR GROWTH?"
                      className={UI.input}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Intro</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.titleIntro || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleIntro", e.target.value)}
                        placeholder="e.g. Let's Build Your Next "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Word 1</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.titleWord1 || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleWord1", e.target.value)}
                        placeholder="e.g. Competitive "
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Title Word 2 (Cursive Accent)</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.titleWord2 || ""}
                        onChange={(e) => updateSection("ctaBanner", "titleWord2", e.target.value)}
                        placeholder="e.g. Advantage."
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Description</label>
                    <RichTextEditor
                      content={industryData.ctaBanner?.description || ""}
                      onChange={(val) => updateSection("ctaBanner", "description", val)}
                      placeholder="Schedule a free 30-minute industry strategy session..."
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Conversion Action Buttons</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className={UI.card + " space-y-3 !mb-0"}>
                    <span className="text-[10px] font-bold text-[#2271b1] uppercase">Primary CTA</span>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.ctaPrimaryText || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaPrimaryText", e.target.value)}
                        placeholder="e.g. Book Strategy Session"
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link (href)</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.ctaPrimaryHref || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaPrimaryHref", e.target.value)}
                        placeholder="e.g. #industry-form"
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className={UI.card + " space-y-3 !mb-0"}>
                    <span className="text-[10px] font-bold text-[#646970] uppercase">Secondary CTA</span>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.ctaSecondaryText || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaSecondaryText", e.target.value)}
                        placeholder="e.g. Explore Our Work"
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link (href)</label>
                      <input
                        type="text"
                        value={industryData.ctaBanner?.ctaSecondaryHref || ""}
                        onChange={(e) => updateSection("ctaBanner", "ctaSecondaryHref", e.target.value)}
                        placeholder="e.g. /gallery"
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Media Graphic / Portrait</h3>
                <div className="space-y-1.5">
                  <label className={UI.label}>CTA Banner Portrait Media</label>
                  <ImageField
                    value={industryData.ctaBanner?.portraitSrc || ""}
                    onChange={(url) => updateSection("ctaBanner", "portraitSrc", url)}
                    altValue={industryData.ctaBanner?.portraitAlt || ""}
                    onAltChange={(alt) => updateSection("ctaBanner", "portraitAlt", alt)}
                    description="Desktop only (hidden on phones and tablets). Leave empty to use the default portrait."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4">
              {/* Same wiring as the page shell's own "Schema Markup" tab. On save the shell sends
                  seo.schemaData and mirrors it into content.schemaMarkup (seo wins), and the public
                  route renders exactly those two - so seo.schemaData MUST be updated here too, or an
                  edit made in this tab is silently overwritten by the older seo value. */}
              <SchemaEditor
                value={seo?.schemaData || data.schemaMarkup || ""}
                onChange={(val) => {
                  if (setSeo) setSeo({ ...(seo || {}), schemaData: val });
                  setData((prev: any) => ({ ...(prev || {}), schemaMarkup: val }));
                }}
                pageTitle="Industry Page"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
