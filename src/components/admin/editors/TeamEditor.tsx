"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, 
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload, 
  List, Heart, CircleHelp, Check, Target, Award, Shield, 
  ArrowRight, Users, Linkedin, Sparkles, Quote, UserPlus, X
} from "lucide-react";
import { UI } from "./styles";
import dynamic from "next/dynamic";
import ImageField from "@/components/admin/ImageField";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Quill Editor...</div>
});


export default function TeamEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         team: {
           section: { badge: "Our Leadership", headline: "Expert hands with Visionary minds", description: "Meet the dedicated professionals leading the charge at Eagle Revolution." },
           members: []
         }
       });
    } else if (data && data.team && data.team.section && data.team.section.headline && !data.team.section.headlinePrefix && !data.team.section.headlineHighlight) {
       const parts = data.team.section.headline.split('with');
       const prefix = parts.length > 1 ? parts[0].trim() + " " : data.team.section.headline;
       const highlight = parts.length > 1 ? "with" + parts[1] : "";
       
       setData({
         ...data,
         team: {
           ...data.team,
           section: {
             ...data.team.section,
             headlinePrefix: prefix,
             headlineHighlight: highlight,
             headlineSuffix: ""
           }
         }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateTeam = (section: string, field: string | null, value: any) => {
    const currentTeam = data.team || {
      section: { badge: "", headline: "", description: "" },
      members: []
    };

    const targetSectionData = currentTeam[section as keyof typeof currentTeam] || {};

    setData({
      ...data,
      team: {
        ...currentTeam,
        [section]: field ? {
          ...targetSectionData,
          [field]: value,
        } : value,
      },
    });
  };

  const tabs = [
    { id: "header", label: "Team Intro", icon: Type, title: "Leadership Roster Introduction" },
    { id: "members", label: "Roster Management", icon: Users, title: "Individual Team Member Profiles" },
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
           <p className="text-[12px] text-[#646970] -mt-2">Manage the leadership and specialists representing Eagle Revolution.</p>
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
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Section Badge</label>
                       <input type="text" value={data.team?.section?.badge || ""} onChange={(e) => updateTeam("section", "badge", e.target.value)} className={UI.input} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline (With Highlight)</label>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input type="text" value={data.team?.section?.headlinePrefix || ""} onChange={(e) => updateTeam("section", "headlinePrefix", e.target.value)} className={UI.input} placeholder="Prefix (e.g. Leading)" />
                         <input type="text" value={data.team?.section?.headlineHighlight || ""} onChange={(e) => updateTeam("section", "headlineHighlight", e.target.value)} className={UI.input + " text-[#2271b1] font-bold bg-[#f0f6fb]"} placeholder="Highlight (e.g. with Integrity)" />
                         <input type="text" value={data.team?.section?.headlineSuffix || ""} onChange={(e) => updateTeam("section", "headlineSuffix", e.target.value)} className={UI.input} placeholder="Suffix (Optional)" />
                       </div>
                    </div>
                    <RichTextEditor 
                        label="Intro Narrative" 
                        content={data.team?.section?.description || ""} 
                        onChange={(html) => updateTeam("section", "description", html)} 
                    />
                 </div>
              </div>
            )}

            {/* MEMBERS SECTION */}
            {activeTab === "members" && (
              <div className="space-y-6">
                  <div className="space-y-8">
                     {(data.team?.members || []).map((member: any, i: number) => (
                       <div key={i} className={UI.card + " space-y-8 relative"}>
                         <div className="flex justify-between items-center text-[10px] font-bold text-[#646970] uppercase tracking-widest border-b border-[#f0f0f1] pb-2">
                            <span>Leadership Profile #{String(i+1).padStart(2, '0')}</span>
                            <button onClick={() => {
                                const newM = data.team.members.filter((_: any, idx: number) => idx !== i);
                                updateTeam("members", null, newM);
                            }} className="text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                         </div>
                         
                         <div className="space-y-8">
                            <ImageField
                               label="Cinematic Portrait"
                               value={member.image || ""}
                               onChange={(url: string) => {
                                 const newM = [...data.team.members]; newM[i].image = url; updateTeam("members", null, newM);
                               }}
                               altValue={member.imageAlt || ""}
                               onAltChange={(alt: string) => {
                                 const newM = [...data.team.members]; newM[i].imageAlt = alt; updateTeam("members", null, newM);
                               }}
                            />

                            <div className="space-y-6">
                               <div className="space-y-4">
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Full Name</label>
                                     <input type="text" value={member.name} onChange={(e) => {
                                       const newM = [...data.team.members]; newM[i].name = e.target.value; updateTeam("members", null, newM);
                                     }} className={UI.input + " font-bold"} />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Professional Role</label>
                                     <input type="text" value={member.role} onChange={(e) => {
                                       const newM = [...data.team.members]; newM[i].role = e.target.value; updateTeam("members", null, newM);
                                     }} className={UI.input} />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Top Accent Badge</label>
                                     <input type="text" value={member.badge1} onChange={(e) => {
                                       const newM = [...data.team.members]; newM[i].badge1 = e.target.value; updateTeam("members", null, newM);
                                     }} className={UI.input + " text-[10px] font-bold uppercase"} />
                                  </div>
                               </div>

                               <QuillEditor 
                                   label="Biography" 
                                   content={typeof member.description === 'string' ? member.description : (member.description || []).join("")} 
                                   onChange={(html) => { const newM = [...data.team.members]; newM[i].description = html; updateTeam("members", null, newM); }} 
                                />

                               <div className="space-y-4 border-t border-[#f0f0f1] pt-6">
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>LinkedIn Profile URL</label>
                                     <input type="text" value={member.linkedin || ""} onChange={(e) => {
                                        const newM = [...data.team.members]; newM[i].linkedin = e.target.value; updateTeam("members", null, newM);
                                     }} className={UI.input} placeholder="https://linkedin.com/..." />
                                  </div>
                                  <div className="space-y-1.5">
                                     <label className={UI.label}>Direct Email</label>
                                     <input type="text" value={member.email || ""} onChange={(e) => {
                                        const newM = [...data.team.members]; newM[i].email = e.target.value; updateTeam("members", null, newM);
                                     }} className={UI.input} placeholder="name@eaglerevolution.com" />
                                  </div>
                               </div>
                            </div>
                         </div>
                       </div>
                     ))}
                  </div>  <button 
                      onClick={() => updateTeam("members", null, [...(data.team?.members || []), { name: "New Leader", role: "Management", image: "", badge1: "EXPERTISE", badge2: "QUALITIES", description: [""] }])}
                      className={UI.buttonAdd}
                    >
                      + Recruit New Team Leader
                    </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
