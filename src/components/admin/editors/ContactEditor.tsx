"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, 
  ChevronRight, Star, Phone, Plus, Trash2, Mail, Upload, 
  List, Heart, CircleHelp, Check, Target, Award, Shield, 
  ArrowRight, MapPin, Clock, Facebook, Instagram, Linkedin, Send,
  User, MessageSquare, Smartphone, Hash, Sparkles
} from "lucide-react";
import IconSelector from "@/components/admin/IconSelector";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";

export default function ContactEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  useEffect(() => {
    if (data && Object.keys(data).length === 0) {
       setData({
         contactPage: {
           header: { badge: "Contact Us", headline: "Expert hands with Visionary minds", description: "Get in touch with St. Louis's leading roofing and exterior specialists." },
           formFields: [
             { name: "name", label: "Full Name", type: "text", required: true, icon: "User" },
             { name: "email", label: "Email Address", type: "email", required: true, icon: "Mail" },
             { name: "phone", label: "Phone Number", type: "tel", required: false, icon: "Phone" },
             { name: "message", label: "Your Message", type: "textarea", required: true, icon: "MessageSquare" }
           ],
           info: { address: "St. Louis, MO", phone: "314-XXX-XXXX", email: "info@eaglerevolution.com", hours: "Mon-Fri: 8am-6pm" },
           social: { facebook: "#", instagram: "#", linkedin: "#" }
         }
       });
    }
  }, [data, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateContact = (section: string, field: string | null, value: any) => {
    const currentData = data.contactPage || {
      header: { badge: "", headline: "", description: "" },
      formFields: [],
      info: {},
      social: {}
    };

    const targetSectionData = currentData[section as keyof typeof currentData] || {};

    setData({
      ...data,
      contactPage: {
        ...currentData,
        [section]: field ? {
          ...targetSectionData,
          [field]: value,
        } : value,
      },
    });
  };

  const tabs = [
    { id: "header", label: "Contact Header", icon: Type, title: "Introduction & Narrative" },
    { id: "form", label: "Form Architect", icon: Send, title: "Lead Generation Form Builder" },
    { id: "info", label: "Business Vitals", icon: MapPin, title: "Contact Information & Socials" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  const inputTypes = ["text", "email", "tel", "textarea", "number"];

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
           <p className="text-[12px] text-[#646970] -mt-2">Manage how customers interact with your brand through the contact page.</p>
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
                       <input type="text" value={data.contactPage?.header?.badge || ""} onChange={(e) => updateContact("header", "badge", e.target.value)} className={UI.input} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Main Headline</label>
                       <input type="text" value={data.contactPage?.header?.headline || ""} onChange={(e) => updateContact("header", "headline", e.target.value)} className={UI.inputLarge} />
                    </div>
                    <div className="space-y-1.5">
                       <label className={UI.label}>Intro Narrative</label>
                       <RichTextEditor 
                         content={data.contactPage?.header?.description || ""} 
                         onChange={(val) => updateContact("header", "description", val)} 
                       />
                    </div>
                 </div>
              </div>
            )}

            {/* FORM SECTION */}
            {activeTab === "form" && (
              <div className="space-y-6">
                 <label className={UI.label}>Lead Form Architect</label>
                 <div className="grid grid-cols-1 gap-4 max-w-4xl">
                    {(data.contactPage?.formFields || []).map((field: any, i: number) => (
                      <div key={i} className={UI.card + " space-y-4 relative group"}>
                        <button onClick={() => {
                          const newF = (data.contactPage?.formFields || []).filter((_: any, idx: number) => idx !== i);
                          updateContact("formFields", null, newF);
                        }} className="absolute top-6 right-6 text-slate-400 hover:text-[#d63638] transition-colors"><Trash2 className="w-4 h-4" /></button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className={UI.label}>Field Label</label>
                                 <input type="text" value={field.label} onChange={(e) => {
                                   const newF = [...(data.contactPage?.formFields || [])]; newF[i].label = e.target.value; updateContact("formFields", null, newF);
                                 }} className={UI.input} />
                              </div>
                              <div className="space-y-1.5">
                                 <label className={UI.label}>Data Name (Slug)</label>
                                 <input type="text" value={field.name} onChange={(e) => {
                                   const newF = [...data.contactPage.formFields]; newF[i].name = e.target.value; updateContact("formFields", null, newF);
                                 }} className={UI.input + " font-mono text-[11px]"} />
                              </div>
                           </div>
                           <div className="space-y-4">
                              <div className="space-y-1.5">
                                 <label className={UI.label}>Input Type</label>
                                 <select value={field.type} onChange={(e) => {
                                   const newF = [...data.contactPage.formFields]; newF[i].type = e.target.value; updateContact("formFields", null, newF);
                                 }} className={UI.input}>
                                    {inputTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                 </select>
                              </div>
                              <IconSelector 
                                label="Field Icon"
                                value={field.icon} 
                                onChange={(val) => {
                                  const newF = [...data.contactPage.formFields]; newF[i].icon = val; updateContact("formFields", null, newF);
                                }} 
                              />
                           </div>
                        </div>
                        <div className="pt-2">
                           <label className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" className="rounded-sm border-[#c3c4c7]" checked={field.required} onChange={(e) => {
                                const newF = [...data.contactPage.formFields]; newF[i].required = e.target.checked; updateContact("formFields", null, newF);
                              }} />
                              <span className="text-[12px] text-[#1d2327]">Required Field</span>
                           </label>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => updateContact("formFields", null, [...(data.contactPage?.formFields || []), { name: "new_field", label: "New Field", type: "text", required: false, icon: "User" }])} className={UI.buttonAdd}>
                       + Add Form Field
                    </button>
                 </div>
              </div>
            )}

            {/* INFO SECTION */}
            {activeTab === "info" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-6">
                    <label className={UI.label}>Direct Contact Channels</label>
                    <div className={UI.card + " space-y-4"}>
                       {[
                         { key: 'phone', icon: Phone, label: 'Phone Number' },
                         { key: 'email', icon: Mail, label: 'Email Address' },
                         { key: 'address', icon: MapPin, label: 'Physical Address' },
                         { key: 'hours', icon: Clock, label: 'Business Hours' }
                       ].map((item) => (
                         <div key={item.key} className="space-y-1.5">
                            <label className={UI.label}>{item.label}</label>
                            <input type="text" value={data.contactPage?.info?.[item.key] || ""} onChange={(e) => updateContact("info", item.key, e.target.value)} className={UI.input} />
                         </div>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <label className={UI.label}>Social Connectivity</label>
                    <div className={UI.card + " space-y-4"}>
                       {[
                         { key: 'facebook', icon: Facebook, label: 'Facebook' },
                         { key: 'instagram', icon: Instagram, label: 'Instagram' },
                         { key: 'linkedin', icon: Linkedin, label: 'LinkedIn' }
                       ].map((item) => (
                         <div key={item.key} className="space-y-1.5">
                            <label className={UI.label}>{item.label} URL</label>
                            <input type="text" value={data.contactPage?.social?.[item.key] || ""} onChange={(e) => updateContact("social", item.key, e.target.value)} className={UI.input} placeholder="https://..." />
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
