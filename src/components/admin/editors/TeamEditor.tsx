"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Type, Users, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import dynamic from "next/dynamic";
import ImageField from "@/components/admin/ImageField";
import { getValidHref } from "@/lib/utils";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Quill Editor...</div>
});

// Public template fallbacks (TeamTemplate.tsx). Shown as placeholders so the admin sees what
// visitors get when a field is left blank.
const PUBLIC_DEFAULT_BADGE = "Our Leadership";
const PUBLIC_DEFAULT_HEADLINE = "Leadership & Engineering Team";

// Seed for a brand-new Team page (content has no `team` yet).
const DEFAULT_TEAM = {
  section: {
    badge: PUBLIC_DEFAULT_BADGE,
    headline: "Expert hands with Visionary minds",
    headlinePrefix: "Expert hands",
    headlineHighlight: "with Visionary minds",
    headlineSuffix: "",
    description: "<p>Meet the dedicated professionals leading the charge at Mohsin Designs.</p>",
  },
  members: [] as any[],
};

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;
// Same acceptance rule as the public template: normalized http(s) URL only.
const isUsableSocialUrl = (v: string) => {
  const h = getValidHref(v);
  return !!h && /^https?:\/\//i.test(h);
};

interface TeamEditorProps {
  pageId: string;
  data: any;
  setData: (d: any) => void;
  /** Page-level SEO state handed down by the page editor (schema markup lives there). */
  seo?: any;
  setSeo?: (s: any) => void;
}

export default function TeamEditor({ data, setData, seo, setSeo }: TeamEditorProps) {
  const [activeTab, setActiveTab] = useState("header");

  // Always-current copy of the content. Several inputs fire two updates in one tick
  // (ImageField calls onChange(url) then onAltChange(alt)); with the render-time `data`
  // closure the second call would overwrite the first. Chaining through this ref keeps both.
  const latest = useRef<any>(data);
  latest.current = data;
  const commit = (next: any) => {
    latest.current = next;
    setData(next);
  };
  const patchTeam = (fn: (team: any) => any) => {
    const cur = latest.current || {};
    commit({ ...cur, team: fn(cur.team || DEFAULT_TEAM) });
  };
  const updateSection = (patch: any) =>
    patchTeam((t) => ({ ...t, section: { ...(t.section || {}), ...patch } }));
  const setMembers = (list: any[]) => patchTeam((t) => ({ ...t, members: list }));
  const updateMember = (i: number, patch: any) =>
    patchTeam((t) => ({
      ...t,
      members: (Array.isArray(t.members) ? t.members : []).map((m: any, idx: number) =>
        idx === i ? { ...m, ...patch } : m
      ),
    }));

  useEffect(() => {
    if (!data) return;
    const team = data.team;
    if (!team) {
      // New page: the page editor always pre-creates `faqs`, so `data` is never empty - seed on the
      // missing `team` key instead so the editor shows the copy the public page will render.
      setData({ ...data, team: DEFAULT_TEAM });
      return;
    }
    const s = team.section || {};
    // Legacy documents only have a single `headline`; split it into the three editable parts once
    // (only while none of the part keys exist - clearing a part later must not re-trigger this).
    if (typeof s.headline === "string" && s.headline && s.headlinePrefix === undefined && s.headlineHighlight === undefined) {
      const idx = s.headline.search(/\bwith\b/i);
      const prefix = idx > 0 ? s.headline.slice(0, idx).trim() : idx === 0 ? "" : s.headline;
      const highlight = idx >= 0 ? s.headline.slice(idx).trim() : "";
      setData({
        ...data,
        team: { ...team, section: { ...s, headlinePrefix: prefix, headlineHighlight: highlight, headlineSuffix: s.headlineSuffix ?? "" } },
      });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const section = data.team?.section || {};
  const members: any[] = Array.isArray(data.team?.members) ? data.team.members : [];

  // The three headline inputs are the source of truth; `headline` is kept in sync as their join so an
  // old single-string reader (and the public fallback) can never resurrect a value the admin cleared.
  const setHeadlinePart = (key: "headlinePrefix" | "headlineHighlight" | "headlineSuffix", value: string) => {
    const next = { headlinePrefix: section.headlinePrefix ?? "", headlineHighlight: section.headlineHighlight ?? "", headlineSuffix: section.headlineSuffix ?? "", [key]: value };
    updateSection({
      ...next,
      headline: [next.headlinePrefix, next.headlineHighlight, next.headlineSuffix].map((p) => String(p).trim()).filter(Boolean).join(" "),
    });
  };

  const moveMember = (from: number, to: number) => {
    if (to < 0 || to >= members.length) return;
    const list = [...members];
    const [m] = list.splice(from, 1);
    list.splice(to, 0, m);
    setMembers(list);
  };

  const tabs = [
    { id: "header", label: "Team Intro", icon: Type, title: "Leadership Roster Introduction" },
    { id: "members", label: `Roster Management (${members.length})`, icon: Users, title: "Individual Team Member Profiles" },
    { id: "schema", label: "Schema Markup", icon: Users, title: "Team Schema Markup" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Manage the leadership and specialists representing Mohsin Designs.</p>
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
                    <h2 className="text-base font-bold text-[#1d2327]">Team Intro Visibility</h2>
                    <p className="text-xs text-[#646970]">Show or hide the badge, headline and intro text at the top of the page (the roster has its own switch).</p>
                  </div>
                  <SectionToggle
                    enabled={section.enabled !== false}
                    onChange={(v) => updateSection({ enabled: v })}
                    label="Team Intro"
                  />
                </div>
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label htmlFor="team-badge" className={UI.label}>Section Badge</label>
                       <input id="team-badge" type="text" value={section.badge || ""} onChange={(e) => updateSection({ badge: e.target.value })} className={UI.input} placeholder={`${PUBLIC_DEFAULT_BADGE} (shown when left blank)`} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline (With Highlight)</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input type="text" aria-label="Headline prefix" value={section.headlinePrefix || ""} onChange={(e) => setHeadlinePart("headlinePrefix", e.target.value)} className={UI.input} placeholder="Prefix (e.g. Leading)" />
                         <input type="text" aria-label="Headline highlight" value={section.headlineHighlight || ""} onChange={(e) => setHeadlinePart("headlineHighlight", e.target.value)} className={UI.input + " text-[#2271b1] font-bold bg-[#f0f6fb]"} placeholder="Highlight (e.g. with Integrity)" />
                         <input type="text" aria-label="Headline suffix" value={section.headlineSuffix || ""} onChange={(e) => setHeadlinePart("headlineSuffix", e.target.value)} className={UI.input} placeholder="Suffix (Optional)" />
                       </div>
                       <p className={UI.helpText}>The prefix sits on the first line, the highlight (colored) on the second, the suffix follows it. Leave all three empty to show &quot;{PUBLIC_DEFAULT_HEADLINE}&quot;.</p>
                    </div>
                    <RichTextEditor
                        label="Intro Narrative"
                        content={section.description || ""}
                        onChange={(html) => updateSection({ description: html })}
                    />
                 </div>
              </div>
            )}

            {/* MEMBERS SECTION */}
            {activeTab === "members" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Team Roster Visibility</h2>
                    <p className="text-xs text-[#646970]">Show or hide all team member profiles on the live page. Members appear in the order listed below, alternating left/right.</p>
                  </div>
                  <SectionToggle
                    enabled={data.team?.membersEnabled !== false}
                    onChange={(v) => patchTeam((t) => ({ ...t, membersEnabled: v }))}
                    label="Team Roster"
                  />
                </div>
                  {members.length === 0 && (
                    <div className="text-[13px] text-[#646970] italic bg-[#f6f7f7] p-6 text-center border border-dashed border-[#c3c4c7] rounded-[3px]">
                      No team members yet. The live page shows only the intro until you add one.
                    </div>
                  )}
                  <div className="space-y-8">
                     {members.map((member: any, i: number) => {
                       const linkedin = member?.linkedin || "";
                       const email = member?.email || "";
                       return (
                       <div key={i} className={UI.card + " space-y-8 relative"}>
                         <div className="flex justify-between items-center text-[10px] font-bold text-[#646970] uppercase tracking-widest border-b border-[#f0f0f1] pb-2">
                            <span>Leadership Profile #{String(i+1).padStart(2, '0')}{member?.name ? ` - ${member.name}` : ""}</span>
                            <span className="flex items-center gap-1">
                              <button type="button" onClick={() => moveMember(i, i - 1)} disabled={i === 0} aria-label="Move up" title="Move up" className="p-1 text-slate-400 hover:text-[#2271b1] disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ChevronUp className="w-4 h-4" /></button>
                              <button type="button" onClick={() => moveMember(i, i + 1)} disabled={i === members.length - 1} aria-label="Move down" title="Move down" className="p-1 text-slate-400 hover:text-[#2271b1] disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"><ChevronDown className="w-4 h-4" /></button>
                              <button type="button" onClick={() => {
                                  if (!window.confirm(`Remove ${member?.name || "this team member"} from the roster?`)) return;
                                  setMembers(members.filter((_: any, idx: number) => idx !== i));
                              }} aria-label="Delete team member" title="Delete team member" className="p-1 text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </span>
                         </div>

                         <div className="space-y-8">
                            <ImageField
                               label="Portrait Photo"
                               description="Leave empty to show an initials placeholder on the live page."
                               value={member?.image || ""}
                               onChange={(url: string) => updateMember(i, { image: url })}
                               altValue={member?.imageAlt || ""}
                               onAltChange={(alt: string) => updateMember(i, { imageAlt: alt })}
                            />

                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <div className="space-y-1.5">
                                     <label htmlFor={`team-m${i}-name`} className={UI.label}>Full Name</label>
                                     <input id={`team-m${i}-name`} type="text" value={member?.name ?? ""} onChange={(e) => updateMember(i, { name: e.target.value })} className={UI.input + " font-bold"} />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label htmlFor={`team-m${i}-role`} className={UI.label}>Professional Role</label>
                                     <input id={`team-m${i}-role`} type="text" value={member?.role ?? ""} onChange={(e) => updateMember(i, { role: e.target.value })} className={UI.input} />
                                  </div>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                       <label htmlFor={`team-m${i}-b1`} className={UI.label}>Top-Left Photo Badge</label>
                                       <input id={`team-m${i}-b1`} type="text" value={member?.badge1 ?? ""} onChange={(e) => updateMember(i, { badge1: e.target.value })} className={UI.input + " text-[10px] font-bold uppercase"} placeholder="e.g. 15 YEARS EXPERIENCE" />
                                    </div>
                                    <div className="space-y-1.5">
                                       <label htmlFor={`team-m${i}-b2`} className={UI.label}>Bottom-Right Photo Badge</label>
                                       <input id={`team-m${i}-b2`} type="text" value={member?.badge2 ?? ""} onChange={(e) => updateMember(i, { badge2: e.target.value })} className={UI.input + " text-[10px] font-bold uppercase"} placeholder="e.g. CERTIFIED EXPERT" />
                                    </div>
                                  </div>
                                  <p className={UI.helpText + " !mt-0 !mb-0"}>Both photo badges are optional - an empty badge is not shown.</p>
                               </div>

                               <QuillEditor
                                   label="Biography"
                                   content={typeof member?.description === 'string' ? member.description : (member?.description || []).join("")}
                                   onChange={(html) => updateMember(i, { description: html })}
                                />

                               <div className="space-y-4 border-t border-[#f0f0f1] pt-6">
                                  <div className="space-y-1.5">
                                     <label htmlFor={`team-m${i}-li`} className={UI.label}>LinkedIn Profile URL</label>
                                     <input id={`team-m${i}-li`} type="text" inputMode="url" value={linkedin} onChange={(e) => updateMember(i, { linkedin: e.target.value })} className={UI.input} placeholder="https://linkedin.com/in/..." />
                                     {linkedin.trim() && !isUsableSocialUrl(linkedin) && (
                                       <p className="text-[12px] text-[#d63638]">This isn&apos;t a usable web address, so the LinkedIn icon is hidden on the live page. Use a full URL such as https://linkedin.com/in/name.</p>
                                     )}
                                  </div>
                                  <div className="space-y-1.5">
                                     <label htmlFor={`team-m${i}-email`} className={UI.label}>Direct Email</label>
                                     <input id={`team-m${i}-email`} type="text" inputMode="email" value={email} onChange={(e) => updateMember(i, { email: e.target.value })} className={UI.input} placeholder="name@mohsindesigns.com" />
                                     {email.trim() && !EMAIL_RE.test(email.trim().replace(/^mailto:/i, "")) && (
                                       <p className="text-[12px] text-[#d63638]">This doesn&apos;t look like an email address, so the email icon is hidden on the live page.</p>
                                     )}
                                  </div>
                                  <p className={UI.helpText + " !mt-0 !mb-0"}>Leave a link blank to hide its icon.</p>
                               </div>
                            </div>
                         </div>
                       </div>
                       );
                     })}
                  </div>
                  <button
                      type="button"
                      onClick={() => setMembers([...members, { name: "New Leader", role: "Management", image: "", imageAlt: "", badge1: "", badge2: "", description: "", linkedin: "", email: "" }])}
                      className={UI.buttonAdd}
                    >
                      + Add Team Member
                    </button>
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-4">
                <SchemaEditor
                  value={seo?.schemaData || data.schemaMarkup || ""}
                  onChange={(val) => {
                    // Same write the page editor's own "Schema Markup" tab does: page-level seo.schemaData
                    // is what handleSave persists (it wins over content.schemaMarkup), so it must be
                    // updated too - writing only into content (as this used to) could be silently discarded.
                    if (setSeo) setSeo({ ...(seo || {}), schemaData: val });
                    commit({ ...(latest.current || {}), schemaMarkup: val });
                  }}
                  pageTitle="Leadership Team"
                />
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
