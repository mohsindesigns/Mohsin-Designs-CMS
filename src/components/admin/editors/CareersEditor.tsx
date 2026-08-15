"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, 
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload, 
  List, Heart, CircleHelp, Check, Target, Award, Shield, 
  ArrowRight, Briefcase, Send, Sparkles, CheckCircle, PenTool
} from "lucide-react";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function CareersEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         careers: {
           section: { badge: "Join Eagle Revolution", headline: "Expert hands with Visionary minds", description: "Build your future with a team that values precision, integrity, and craftsmanship." },
           roles: [
             { label: "Project Manager", value: "project-manager" },
             { label: "Roofing Specialist", value: "roofing-specialist" },
             { label: "Sales Consultant", value: "sales-consultant" }
           ],
           success: { title: "Application Received", description: "Thank you for your interest. Our recruitment team will review your profile and reach out shortly." },
           labels: { name: "Full Name", email: "Email Address", phone: "Phone Number", role: "Position Applied For", summary: "Tell us about your experience" }
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

  const tabs = [
    { id: "header", label: "Recruitment Intro", icon: Type, title: "Careers Page Introduction" },
    { id: "roles", label: "Position Catalog", icon: Briefcase, title: "Available Career Opportunities" },
    { id: "form", label: "Submission Flow", icon: Send, title: "Application Form & Feedback" },
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
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Section Badge</label>
                       <input type="text" value={data.careers?.section?.badge || ""} onChange={(e) => updateCareers("section", "badge", e.target.value)} className={UI.input} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline</label>
                       <input type="text" value={data.careers?.section?.headline || ""} onChange={(e) => updateCareers("section", "headline", e.target.value)} className={UI.inputLarge} placeholder="Expert hands with Visionary minds" />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Recruitment Narrative</label>
                       <RichTextEditor 
                         content={data.careers?.section?.description || ""} 
                         onChange={(val) => updateCareers("section", "description", val)} 
                       />
                    </div>
                 </div>
              </div>
            )}

            {/* ROLES SECTION */}
            {activeTab === "roles" && (
              <div className="space-y-6">
                 <label className={UI.label}>Available Career Opportunities</label>
                  <div className="space-y-4">
                     {(data.careers?.roles || []).map((role: any, i: number) => (
                       <div key={i} className={UI.card + " flex items-center gap-4 group relative"}>
                          <div className="w-10 h-10 bg-[#f0f6fb] text-[#2271b1] rounded-[3px] flex items-center justify-center shrink-0 border border-[#dcdcde]">
                             <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1 space-y-1">
                             <label className={UI.label + " mb-0"}>Job Title</label>
                             <input type="text" value={role.label} onChange={(e) => {
                                  const newR = [...(data.careers?.roles || [])];
                                  newR[i].label = e.target.value;
                                  newR[i].value = e.target.value.toLowerCase().replace(/\s+/g, '-');
                                  updateCareers("roles", null, newR);
                                }} className={UI.input + " font-bold"} placeholder="Job Title" />
                          </div>
                          <button onClick={() => {
                             const newR = data.careers.roles.filter((_: any, idx: number) => idx !== i);
                             updateCareers("roles", null, newR);
                          }} className="text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                       </div>
                     ))}
                     <button onClick={() => updateCareers("roles", null, [...(data.careers?.roles || []), { label: "New Position", value: "new-position" }])} className={UI.buttonAdd}>
                        + Post New Career Opportunity
                     </button>
                  </div>
              </div>
            )}

            {/* FORM CONFIG SECTION */}
            {activeTab === "form" && (
              <div className="grid grid-cols-1 gap-6 max-w-4xl">
                 <div className="space-y-6">
                    <label className={UI.label}>Submission Success State</label>
                    <div className={UI.card + " space-y-6"}>
                       <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                             <label className={UI.label}>Success Headline</label>
                             <input type="text" value={data.careers?.success?.title || ""} onChange={(e) => updateCareers("success", "title", e.target.value)} className={UI.inputLarge} placeholder="Success Headline" />
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
                       {Object.entries({
                         name: "Full Name",
                         email: "Email Address",
                         phone: "Phone Number",
                         role: "Position Applied For",
                         summary: "Tell us about your experience",
                         attachment: "Resume / CV",
                         attachmentPlaceholder: "Upload your resume (PDF)...",
                         roleSelector: "Select a Position",
                         ...(data.careers?.labels || {})
                       }).map(([key, val]: [string, any]) => (
                         <div key={key} className="space-y-1.5">
                            <label className={UI.label}>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} Field Label</label>
                            <input type="text" value={val} onChange={(e) => {
                              const newLabels = { 
                                name: "Full Name",
                                email: "Email Address",
                                phone: "Phone Number",
                                role: "Position Applied For",
                                summary: "Tell us about your experience",
                                attachment: "Resume / CV",
                                roleSelector: "Select a Position",
                                ...(data.careers?.labels || {}), 
                                [key]: e.target.value 
                              };
                              updateCareers("labels", null, newLabels);
                            }} className={UI.input} />
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
