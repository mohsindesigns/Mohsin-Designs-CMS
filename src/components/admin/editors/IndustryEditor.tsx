"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Loader2, Plus, Sparkles, CheckCircle2 } from "lucide-react";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";

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

export default function IndustryEditor({
  pageId,
  data,
  setData
}: {
  pageId: string;
  data: any;
  setData: (d: any) => void;
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

  const tabs = [
    { id: "hero", label: "1. Hero & Form" },
    { id: "services", label: "2. Services Selection" },
    { id: "sectors", label: "3. Industry Sectors" },
    { id: "founder", label: "4. About Founder" },
    { id: "whyChooseUs", label: "5. Why Choose Us" },
    { id: "cta", label: "6. Final CTA Banner" }
  ];

  return (
    <div className="bg-white max-w-4xl mx-auto pb-20 text-left">
      {/* WordPress Navigation Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-10 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
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
                  <textarea
                    rows={3}
                    value={industryData.hero?.description || ""}
                    onChange={(e) => updateSection("hero", "description", e.target.value)}
                    placeholder="We engineer bespoke web applications, custom digital architectures..."
                    className={UI.textarea}
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
                <div className="space-y-4">
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
                    <textarea
                      rows={2}
                      value={industryData.servicesSection?.description || ""}
                      onChange={(e) => updateSection("servicesSection", "description", e.target.value)}
                      placeholder="Modular, high-performance web engineering services built to address your sector..."
                      className={UI.textarea}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Curated Services for This Industry</h3>
                <p className={UI.helpText}>
                  Choose which services from your master services catalog will appear in the services grid on this industry page.
                </p>

                <ContentSelector
                  type="services"
                  label="Select Services to Display"
                  selectedItems={industryData.servicesSection?.selectedServices || []}
                  onSelect={(items) => updateSection("servicesSection", "selectedServices", items)}
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
                    <textarea
                      rows={2}
                      value={industryData.domainExpertise?.description || ""}
                      onChange={(e) => updateSection("domainExpertise", "description", e.target.value)}
                      placeholder="Every industry has distinct compliance, customer acquisition funnels, and technical requirements..."
                      className={UI.textarea}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>2. Industry Vertical Cards</h3>
                <div className="space-y-6">
                  {(industryData.domainExpertise?.domains || []).map((domain: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">
                          Sector Card #{idx + 1} ({domain.id || `0${idx + 1}`})
                        </span>
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
                          <label className={UI.label}>Numeric Index</label>
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
                        <label className={UI.label}>Sector Description</label>
                        <textarea
                          rows={2}
                          value={domain.desc || domain.description || ""}
                          onChange={(e) => {
                            const updated = [...(industryData.domainExpertise?.domains || [])];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            updateSection("domainExpertise", "domains", updated);
                          }}
                          placeholder="HIPAA-compliant, trustworthy patient portals and medical practice booking systems..."
                          className={UI.textarea}
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
                          id: `0${current.length + 1}`,
                          title: "New Sector Vertical",
                          desc: "Tailored architecture and compliant digital workflows.",
                          iconName: "Briefcase",
                          tags: ["Custom Architecture", "Compliance"]
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
                    <label className={UI.label}>Founder Full Name</label>
                    <input
                      type="text"
                      value={industryData.founder?.founderName || ""}
                      onChange={(e) => updateSection("founder", "founderName", e.target.value)}
                      placeholder="e.g. Mohsin Lead Architect"
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Founder Official Title</label>
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
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Bio Narrative Paragraphs</h3>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Bio Paragraph 1</label>
                    <textarea
                      rows={3}
                      value={industryData.founder?.bioParagraph1 || ""}
                      onChange={(e) => updateSection("founder", "bioParagraph1", e.target.value)}
                      className={UI.textarea}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Bio Paragraph 2</label>
                    <textarea
                      rows={3}
                      value={industryData.founder?.bioParagraph2 || ""}
                      onChange={(e) => updateSection("founder", "bioParagraph2", e.target.value)}
                      className={UI.textarea}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>4. Credibility Metrics</h3>
                <div className="space-y-4">
                  {(industryData.founder?.metrics || []).map((m: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Metric #{idx + 1}</span>
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
                    <textarea
                      rows={2}
                      value={industryData.whyChooseUs?.description || ""}
                      onChange={(e) => updateSection("whyChooseUs", "description", e.target.value)}
                      placeholder="We deliver measurable advantages through clean code, direct communication..."
                      className={UI.textarea}
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
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className={UI.sectionHeader}>3. Value Proposition Pillars</h3>
                <div className="space-y-6">
                  {(industryData.whyChooseUs?.features || []).map((feat: any, idx: number) => (
                    <div key={idx} className={UI.card + " space-y-4"}>
                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                        <span className="text-[10px] font-bold text-[#646970] uppercase">Pillar #{idx + 1}</span>
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
                      <div className="space-y-1.5">
                        <label className={UI.label}>Description</label>
                        <textarea
                          rows={2}
                          value={feat.desc || ""}
                          onChange={(e) => {
                            const updated = [...(industryData.whyChooseUs?.features || [])];
                            updated[idx] = { ...updated[idx], desc: e.target.value };
                            updateSection("whyChooseUs", "features", updated);
                          }}
                          className={UI.textarea}
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
          {/* 6. FINAL CTA BANNER                                           */}
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
                    <textarea
                      rows={2}
                      value={industryData.ctaBanner?.description || ""}
                      onChange={(e) => updateSection("ctaBanner", "description", e.target.value)}
                      placeholder="Schedule a free 30-minute industry strategy session..."
                      className={UI.textarea}
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
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
