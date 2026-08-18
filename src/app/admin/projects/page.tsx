"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Folder, Image as ImageIcon, ChevronRight, Save, X, Calendar, MapPin, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

export default function ProjectsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    category: "",
    year: "",
    desc: "",
    challenge: "",
    approach: "",
    image: "",
    number: "",
    location: "",
    architect: "",
    accent: "from-primary to-primary/80",
    glowClass: "",
    featured: false,
    stats: [
      { value: "", label: "", iconName: "Award" },
      { value: "", label: "", iconName: "TrendingUp" },
      { value: "", label: "", iconName: "Zap" }
    ]
  });

  useEffect(() => {
    fetch("/api/content").then(res => res.json()).then(json => {
        setData(json);
        setProjects(json.portfolio?.projects || []);
      });
  }, []);

  const saveToDb = async (newProjects: any[]) => {
    setSaving(true);
    const updatedData = { ...data, portfolio: { ...data.portfolio, projects: newProjects } };
    try {
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedData) });
      if (res.ok) {
        setData(updatedData);
        setProjects(newProjects);
        setToast({ type: "ok", msg: "Projects updated." });
        setTimeout(() => setToast(null), 3000);
        setIsEditing(null);
      }
    } catch {
      setToast({ type: "err", msg: "Error saving." });
    } finally { setSaving(false); }
  };

  const handleSaveProject = () => {
    if (!form.title || !form.image) return alert("Project title and image are required!");
    const newProjects = [...projects];
    if (isEditing !== null && isEditing < projects.length) newProjects[isEditing] = { ...form };
    else {
      const number = String(newProjects.length + 1).padStart(2, '0');
      newProjects.push({ ...form, number });
    }
    saveToDb(newProjects);
  };

  const handleEdit = (idx: number) => {
    setIsEditing(idx);
    const p = projects[idx];
    setForm({
      title: p.title || "",
      subtitle: p.subtitle || "",
      category: p.category || "",
      year: p.year || "",
      desc: p.desc || "",
      challenge: p.challenge || "",
      approach: p.approach || "",
      image: p.image || "",
      number: p.number || "",
      location: p.location || "",
      architect: p.architect || "",
      accent: p.accent || "from-primary to-primary/80",
      glowClass: p.glowClass || "",
      featured: p.featured || false,
      stats: p.stats || [
        { value: "", label: "", iconName: "Award" },
        { value: "", label: "", iconName: "TrendingUp" },
        { value: "", label: "", iconName: "Zap" }
      ]
    });
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Projects</h1>
        {isEditing === null && (
          <button
            onClick={() => {
              setIsEditing(projects.length);
              setForm({
                title: "",
                subtitle: "",
                category: "",
                year: "",
                desc: "",
                challenge: "",
                approach: "",
                image: "",
                number: "",
                location: "",
                architect: "",
                accent: "from-primary to-primary/80",
                glowClass: "",
                featured: false,
                stats: [
                  { value: "", label: "", iconName: "Award" },
                  { value: "", label: "", iconName: "TrendingUp" },
                  { value: "", label: "", iconName: "Zap" }
                ]
              });
            }}
            className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
          >
            Add New Project
          </button>
        )}
      </div>

      {toast && (
        <div className={`px-4 py-2 border-l-4 text-[13px] bg-white shadow-sm mb-4 ${toast.type === 'ok' ? 'border-[#00a32a]' : 'border-[#d63638]'}`}>
          {toast.msg}
        </div>
      )}

      {isEditing !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6">
                 <input
                   type="text"
                   value={form.title}
                   onChange={(e) => setForm({ ...form, title: e.target.value })}
                   className="w-full border border-[#8c8f94] px-3 py-2 text-[18px] font-medium rounded-[3px] focus:border-[#2271b1] outline-none mb-4"
                   placeholder="Enter project title"
                 />
                 
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">Project Subtitle / Tagline</label>
                        <input type="text" value={form.subtitle || ""} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. Enterprise-grade Product Design" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[13px] font-bold">Category</label>
                           <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. UX/UI Design" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[13px] font-bold">Location</label>
                           <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. Dallas, TX" />
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                           <label className="text-[13px] font-bold">Year</label>
                           <input type="text" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. 2024" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[13px] font-bold">Backlight Glow CSS Class</label>
                           <input type="text" value={form.glowClass || ""} onChange={(e) => setForm({ ...form, glowClass: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. from-orange-500/20 via-red-500/10 to-transparent" />
                        </div>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">The Challenge</label>
                        <textarea value={form.challenge || ""} onChange={(e) => setForm({ ...form, challenge: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] min-h-[80px]" placeholder="Describe the challenge..." />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">Our Approach / What We Did</label>
                        <textarea value={form.approach || ""} onChange={(e) => setForm({ ...form, approach: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] min-h-[80px]" placeholder="Describe the approach/solution..." />
                     </div>

                     <div className="flex items-center gap-2 py-2">
                        <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 border-[#8c8f94] rounded-[3px]" />
                        <label htmlFor="feat" className="text-[13px] font-semibold">Feature this project</label>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">Project Description</label>
                        <RichTextEditor 
                          content={form.desc} 
                          onChange={(val) => setForm({ ...form, desc: val })} 
                        />
                     </div>

                     {/* Case Study Stats Editor */}
                     <div className="space-y-3 p-4 border border-[#c3c4c7] rounded-[3px] bg-[#fbfbfb] mt-4">
                        <h4 className="text-[14px] font-bold text-[#1d2327]">Case Study Stats (3 Items Recommended)</h4>
                        <div className="space-y-4">
                           {(form.stats || [
                              { value: "", label: "", iconName: "Award" },
                              { value: "", label: "", iconName: "TrendingUp" },
                              { value: "", label: "", iconName: "Zap" }
                           ]).map((stat: any, sIdx: number) => (
                              <div key={sIdx} className="grid grid-cols-3 gap-3 border-b border-[#f0f0f1] pb-3 last:border-0 last:pb-0">
                                 <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[#50575e]">Stat Value</label>
                                    <input
                                       type="text"
                                       value={stat.value || ""}
                                       onChange={(e) => {
                                          const newStats = [...(form.stats || [])];
                                          newStats[sIdx] = { ...(newStats[sIdx] || {}), value: e.target.value };
                                          setForm({ ...form, stats: newStats });
                                       }}
                                       className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                                       placeholder="e.g. 48%"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[#50575e]">Stat Label</label>
                                    <input
                                       type="text"
                                       value={stat.label || ""}
                                       onChange={(e) => {
                                          const newStats = [...(form.stats || [])];
                                          newStats[sIdx] = { ...(newStats[sIdx] || {}), label: e.target.value };
                                          setForm({ ...form, stats: newStats });
                                       }}
                                       className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                                       placeholder="e.g. Activation Boost"
                                    />
                                 </div>
                                 <div className="space-y-1">
                                    <label className="text-[11px] font-semibold text-[#50575e]">Stat Icon</label>
                                    <select
                                       value={stat.iconName || "Award"}
                                       onChange={(e) => {
                                          const newStats = [...(form.stats || [])];
                                          newStats[sIdx] = { ...(newStats[sIdx] || {}), iconName: e.target.value };
                                          setForm({ ...form, stats: newStats });
                                       }}
                                       className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] bg-white rounded-[3px]"
                                    >
                                       {["Award", "TrendingUp", "Zap", "BarChart3", "Users", "Shield", "Droplet", "Home", "Monitor", "Search", "Paintbrush", "LayoutGrid"].map((icon) => (
                                          <option key={icon} value={icon}>{icon}</option>
                                       ))}
                                    </select>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </div>
              </div>
           </div>

           <div className="lg:col-span-1 space-y-6 sticky top-4">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                 <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                    <h2 className="text-[14px] font-semibold text-[#1d2327]">Publish</h2>
                 </div>
                 <div className="p-4 space-y-3">
                    <ImageField label="Project Image" value={form.image} onChange={(v) => setForm({ ...form, image: v })} />
                 </div>
                 <div className="px-3 py-2 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-between items-center">
                    <button onClick={() => setIsEditing(null)} className="text-[#d63638] underline text-[13px]">Cancel</button>
                    <button onClick={handleSaveProject} disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#135e96]">
                       {saving ? "Saving..." : "Update"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-[#c3c4c7] bg-white text-[#1d2327]">
                    <th className="w-8 py-2 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></th>
                    <th className="py-2 px-3 text-[14px] font-semibold">Project</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-40">Category</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-32">Location</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-24">Year</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                 {projects.map((proj, idx) => (
                    <tr key={idx} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                       <td className="py-4 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></td>
                       <td className="py-4 px-3 align-top">
                          <div className="flex gap-3">
                             <div className="w-10 h-10 bg-[#f0f0f1] border border-[#c3c4c7] rounded-[3px] flex items-center justify-center shrink-0 overflow-hidden">
                                {proj.image ? <img src={proj.image} className="w-full h-full object-cover" /> : <ImageIcon className="w-4 h-4 text-[#8c8f94]" />}
                             </div>
                             <div>
                                <strong className="text-[#2271b1] block text-[14px]">{proj.title} {proj.featured && <Star className="w-3 h-3 inline fill-amber-500 text-amber-500 ml-1" />}</strong>
                                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => handleEdit(idx)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                                   <span className="text-[#a7aaad]">|</span>
                                   <button onClick={() => { if(confirm("Delete?")) saveToDb(projects.filter((_,i)=>i!==idx)); }} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="py-4 px-3 align-top text-[#50575e] uppercase text-[11px] font-bold">{proj.category}</td>
                       <td className="py-4 px-3 align-top text-[#50575e]">{proj.location}</td>
                       <td className="py-4 px-3 align-top text-[#50575e]">{proj.year}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
