"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Type, Trash2, Briefcase, Send, ArrowUp, ArrowDown } from "lucide-react";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import { CAREERS_DEFAULTS, CAREERS_LABEL_FIELDS, slugifyRole } from "@/lib/careersDefaults";

// Editor <-> public page contract (all under `content.careers`, read by CareersTemplate):
//   section.{enabled,badge,headline,description}  intro block (hero)
//   rolesEnabled, roles[{label,value}]            position dropdown on the form
//   formEnabled                                   whole application form
//   success.{title,description}                   confirmation card
//   labels.{name,email,phone,role,roleSelector,attachment,attachmentPlaceholder,summary,submit,submitting}
// Blank text fields fall back to CAREERS_DEFAULTS on the public page (shown here as placeholders).
export default function CareersEditor({ pageId, data, setData, seo, setSeo }: { pageId: string, data: any, setData: (d: any) => void, seo?: any, setSeo?: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  // A brand-new Careers page has no `careers` block yet (note: the page shell always adds
  // `faqs: []`, so "content is empty" is never true - check the careers key itself).
  // Seed it so the editor shows exactly the copy the public page will render.
  useEffect(() => {
    if (data && !data.careers) {
      setData({
        ...data,
        careers: {
          section: { badge: CAREERS_DEFAULTS.section.badge, headline: CAREERS_DEFAULTS.section.headline, description: CAREERS_DEFAULTS.section.description },
          roles: CAREERS_DEFAULTS.roles.map((r) => ({ ...r })),
          success: { title: CAREERS_DEFAULTS.success.title, description: CAREERS_DEFAULTS.success.description },
          // Labels stay empty on purpose: blank = the page uses CAREERS_DEFAULTS.labels (shown as placeholders below).
          labels: {},
        }
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateCareers = (section: string, field: string | null, value: any) => {
    const currentCareers = data.careers || {
      section: { badge: "", headline: "", description: "" },
      roles: [],
      success: { title: "", description: "" },
      labels: {}
    };

    const targetSectionData = currentCareers[section as keyof typeof currentCareers] || {};

    setData({
      ...data,
      careers: {
        ...currentCareers,
        [section]: field ? {
          ...targetSectionData,
          [field]: value,
        } : value,
      },
    });
  };

  const roles: any[] = Array.isArray(data.careers?.roles) ? data.careers.roles : [];
  const labels = data.careers?.labels || {};

  // Internal option value: slug of the title, made unique among the other positions.
  const uniqueRoleValue = (label: string, others: any[]) => {
    const taken = new Set(others.map((r) => r?.value));
    const base = slugifyRole(label || "new-position");
    let value = base;
    for (let n = 2; taken.has(value); n++) value = `${base}-${n}`;
    return value;
  };

  const setRoleLabel = (i: number, label: string) => {
    const next = roles.map((r, idx) => idx === i ? { ...r, label, value: label.trim() ? uniqueRoleValue(label, roles.filter((_, j) => j !== i)) : "" } : r);
    updateCareers("roles", null, next);
  };
  const moveRole = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= roles.length) return;
    const next = [...roles];
    [next[i], next[j]] = [next[j], next[i]];
    updateCareers("roles", null, next);
  };

  const tabs = [
    { id: "header", label: "Recruitment Intro", icon: Type, title: "Careers Page Introduction" },
    { id: "roles", label: "Position Catalog", icon: Briefcase, title: "Available Career Opportunities" },
    { id: "form", label: "Submission Flow", icon: Send, title: "Application Form & Feedback" },
    { id: "schema", label: "Schema Markup", icon: Briefcase, title: "Careers Schema Markup" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  return (
    <div className="bg-white">
      {/* WP Style Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-6 text-[13px] border-b border-[#f0f0f1] pb-1">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
              type="button"
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
           <p className="text-[12px] text-[#646970] -mt-2">Configure the recruitment experience and manage available roles.</p>
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
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Recruitment Intro Visibility</h2>
                    <p className="text-xs text-[#646970]">Show or hide the breadcrumb, badge, headline and description at the top of the page. The application form is controlled separately.</p>
                  </div>
                  <SectionToggle
                    enabled={data.careers?.section?.enabled !== false}
                    onChange={(v) => updateCareers("section", "enabled", v)}
                    label="Recruitment Intro"
                  />
                </div>
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Section Badge</label>
                       <input type="text" value={data.careers?.section?.badge || ""} onChange={(e) => updateCareers("section", "badge", e.target.value)} className={UI.input} placeholder={CAREERS_DEFAULTS.section.badge} />
                       <span className={UI.helpText}>Small label above the headline. Left blank, the page shows &quot;{CAREERS_DEFAULTS.section.badge}&quot;.</span>
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline</label>
                       <input type="text" value={data.careers?.section?.headline || ""} onChange={(e) => updateCareers("section", "headline", e.target.value)} className={UI.inputLarge} placeholder={CAREERS_DEFAULTS.section.headline} />
                       <span className={UI.helpText}>Tip: everything after the word &quot;with&quot; is shown as a highlighted second line (e.g. &quot;Expert hands with Visionary minds&quot;). Left blank, the page shows the example above.</span>
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Recruitment Narrative</label>
                       <RichTextEditor
                         content={data.careers?.section?.description || ""}
                         onChange={(val) => updateCareers("section", "description", val)}
                       />
                       <span className={UI.helpText}>Leave empty to show no description.</span>
                    </div>
                 </div>
              </div>
            )}

            {/* ROLES SECTION */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Position Dropdown Visibility</h2>
                    <p className="text-xs text-[#646970]">Show or hide the &quot;Position Applied For&quot; dropdown on the application form. It is also hidden automatically while the list below is empty.</p>
                  </div>
                  <SectionToggle
                    enabled={data.careers?.rolesEnabled !== false}
                    onChange={(v) => updateCareers("rolesEnabled", null, v)}
                    label="Position Dropdown"
                  />
                </div>
                 <label className={UI.label}>Available Career Opportunities</label>
                  <div className="space-y-4">
                     {roles.length === 0 && (
                       <div className="border border-dashed border-[#c3c4c7] rounded-[3px] py-6 px-4 text-center text-[13px] text-[#646970] bg-[#f6f7f7]">
                         No positions yet. The position dropdown stays hidden on the live form until you add one.
                       </div>
                     )}
                     {roles.map((role: any, i: number) => (
                       <div key={i} className={UI.card + " flex items-center gap-4 group relative !mb-0"}>
                          <div className="w-10 h-10 bg-[#f0f6fb] text-[#2271b1] rounded-[3px] flex items-center justify-center shrink-0 border border-[#dcdcde]">
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                             <label className={UI.label + " mb-0"}>Job Title</label>
                             <input type="text" value={role?.label || ""} onChange={(e) => setRoleLabel(i, e.target.value)} className={UI.input + " font-bold"} placeholder="e.g. Senior Web Developer" />
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button type="button" aria-label="Move position up" title="Move up" disabled={i === 0} onClick={() => moveRole(i, -1)} className="p-1.5 text-slate-400 hover:text-[#2271b1] disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ArrowUp className="w-4 h-4" /></button>
                            <button type="button" aria-label="Move position down" title="Move down" disabled={i === roles.length - 1} onClick={() => moveRole(i, 1)} className="p-1.5 text-slate-400 hover:text-[#2271b1] disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ArrowDown className="w-4 h-4" /></button>
                            <button type="button" aria-label="Delete position" title="Delete" onClick={() => {
                               updateCareers("roles", null, roles.filter((_: any, idx: number) => idx !== i));
                            }} className="p-1.5 text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                          </div>
                       </div>
                     ))}
                     <button type="button" onClick={() => updateCareers("roles", null, [...roles, { label: "", value: "" }])} className={UI.buttonAdd}>
                        + Post New Career Opportunity
                     </button>
                     <span className={UI.helpText}>Positions with an empty title are not shown on the page. The chosen title is included in the application email and in Leads &amp; Inquiries.</span>
                  </div>
              </div>
            )}

            {/* FORM CONFIG SECTION */}
            {activeTab === "form" && (
              <div className="grid grid-cols-1 gap-6 max-w-4xl">
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Application Form Visibility</h2>
                    <p className="text-xs text-[#646970]">Show or hide the whole application form (and its confirmation message) on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={data.careers?.formEnabled !== false}
                    onChange={(v) => updateCareers("formEnabled", null, v)}
                    label="Application Form"
                  />
                </div>
                 <div className="space-y-6">
                    <label className={UI.label}>Submission Success State</label>
                    <div className={UI.card + " space-y-6"}>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                             <label className={UI.label}>Success Headline</label>
                             <input type="text" value={data.careers?.success?.title || ""} onChange={(e) => updateCareers("success", "title", e.target.value)} className={UI.inputLarge} placeholder={CAREERS_DEFAULTS.success.title} />
                             <span className={UI.helpText}>Shown after an application is sent. Left blank, the page shows &quot;{CAREERS_DEFAULTS.success.title}&quot;.</span>
                          </div>
                          <div className="space-y-1.5">
                             <label className={UI.label}>Success Narrative</label>
                             <RichTextEditor
                               content={data.careers?.success?.description || ""}
                               onChange={(val) => updateCareers("success", "description", val)}
                             />
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className={UI.label}>Form Input Labels</label>
                    <div className={UI.card + " space-y-4"}>
                       {CAREERS_LABEL_FIELDS.map(({ key, title, help }) => (
                         <div key={key} className="space-y-1.5">
                            <label className={UI.label}>{title}</label>
                            <input type="text" value={labels[key] || ""} placeholder={CAREERS_DEFAULTS.labels[key]} onChange={(e) => {
                              updateCareers("labels", key, e.target.value);
                            }} className={UI.input} />
                            <span className={UI.helpText + " !mb-0"}>{help} Left blank, the page shows the placeholder text.</span>
                         </div>
                       ))}
                       <p className="text-[12px] text-[#646970] pt-2 border-t border-[#f0f0f1]">
                         Applications are emailed to the site&apos;s contact address and saved under Leads &amp; Inquiries as &quot;Job Application&quot;. The resume upload accepts PDF or Word files up to 10 MB (enforced by the server).
                       </p>
                    </div>
                 </div>
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-4">
                <SchemaEditor
                  value={seo?.schemaData || data.schemaMarkup || data.seo?.schemaData || ""}
                  onChange={(val) => {
                    // The page shell saves `seo.schemaData` (it wins over content.schemaMarkup on save),
                    // so write to BOTH - same as the shell's own Schema tab - or this edit is overwritten.
                    setSeo?.({ ...(seo || {}), schemaData: val });
                    setData({
                      ...data,
                      schemaMarkup: val,
                      // Older saves also kept a copy at content.seo.schemaData - keep it from resurfacing stale text.
                      ...(data.seo?.schemaData !== undefined ? { seo: { ...data.seo, schemaData: val } } : {}),
                    });
                  }}
                  pageTitle="Careers"
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
