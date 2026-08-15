"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Type, ChevronRight, Users, Plus, Trash2, Image as ImageIcon, Briefcase, Quote, Star } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-40 bg-slate-50 animate-pulse border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs">Loading Rich Text Editor...</div>
});
import ImageField from "@/components/admin/ImageField";

export default function TeamPageEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => {
        // Ensure structure exists
        if (!json.team) json.team = {};
        if (!json.team.section) json.team.section = {};
        if (!json.team.members) json.team.members = [];
        
        // Migrate old headline format if new fields are empty
        if (json.team.section.headline && !json.team.section.headlinePrefix && !json.team.section.headlineHighlight) {
          const parts = json.team.section.headline.split('with');
          if (parts.length > 1) {
            json.team.section.headlinePrefix = parts[0];
            json.team.section.headlineHighlight = "with" + parts[1];
            json.team.section.headlineSuffix = "";
          } else {
            json.team.section.headlinePrefix = json.team.section.headline;
          }
        }
        
        setData(json);
      })
      .catch((err) => console.error("Failed to load content:", err));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setMessage("Changes saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      team: {
        ...prev.team,
        section: {
          ...prev.team?.section,
          [field]: value
        }
      }
    }));
  };

  const updateMember = (index: number, field: string, value: any) => {
    const newMembers = [...data.team.members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setData((prev: any) => ({
      ...prev,
      team: { ...prev.team, members: newMembers }
    }));
  };

  const updateMemberDescription = (memberIndex: number, pIndex: number, value: string) => {
    const newMembers = [...data.team.members];
    const newDesc = [...newMembers[memberIndex].description];
    newDesc[pIndex] = value;
    newMembers[memberIndex].description = newDesc;
    setData((prev: any) => ({
      ...prev,
      team: { ...prev.team, members: newMembers }
    }));
  };

  const addParagraph = (memberIndex: number) => {
    const newMembers = [...data.team.members];
    newMembers[memberIndex].description = [...(newMembers[memberIndex].description || []), ""];
    setData((prev: any) => ({
      ...prev,
      team: { ...prev.team, members: newMembers }
    }));
  };

  const removeParagraph = (memberIndex: number, pIndex: number) => {
    const newMembers = [...data.team.members];
    newMembers[memberIndex].description = newMembers[memberIndex].description.filter((_: any, i: number) => i !== pIndex);
    setData((prev: any) => ({
      ...prev,
      team: { ...prev.team, members: newMembers }
    }));
  };

  const addMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: "New Member",
      role: "Position",
      image: "",
      linkedin: "",
      email: "",
      description: ["Member bio goes here..."],
      badge1: "Certified Specialist",
      badge2: "Award Winner"
    };
    setData((prev: any) => ({
      ...prev,
      team: {
        ...prev.team,
        members: [...prev.team.members, newMember]
      }
    }));
  };

  const removeMember = (index: number) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    const newMembers = data.team.members.filter((_: any, i: number) => i !== index);
    setData((prev: any) => ({
      ...prev,
      team: { ...prev.team, members: newMembers }
    }));
  };

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
            <Link href="/admin/pages" className="hover:text-primary transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Team Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Meet the Team</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl mb-6 text-center font-bold ${
            message.includes("success") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message}
        </motion.div>
      )}

      <div className="space-y-12">
        {/* Header Section */}
        <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Page Header Content</h2>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
              <input
                type="text"
                value={data.team?.section?.badge || ""}
                onChange={(e) => updateSection("badge", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner md:w-1/2"
                placeholder="e.g. Our Leadership"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1">
                Section Headline (With Highlight)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={data.team?.section?.headlinePrefix || ""}
                  onChange={(e) => updateSection("headlinePrefix", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Prefix (e.g. Leading)"
                />
                <input
                  type="text"
                  value={data.team?.section?.headlineHighlight || ""}
                  onChange={(e) => updateSection("headlineHighlight", e.target.value)}
                  className="w-full bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 text-primary font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner placeholder:text-primary/50"
                  placeholder="Highlight (e.g. with Integrity)"
                />
                <input
                  type="text"
                  value={data.team?.section?.headlineSuffix || ""}
                  onChange={(e) => updateSection("headlineSuffix", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="Suffix (Optional)"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Description</label>
            <RichTextEditor 
              content={data.team?.section?.description || ""} 
              onChange={(v) => updateSection("description", v)} 
            />
          </div>
        </section>

        {/* Members Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Team Members</h2>
            </div>
            <button
              onClick={addMember}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {data.team.members.map((member: any, mIdx: number) => (
              <motion.div
                key={member.id || mIdx}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Photo Column */}
                  <div className="lg:col-span-4 bg-slate-50 border-r border-slate-100 p-8 flex flex-col items-center justify-center text-center">
                    <ImageField 
                      label="Member Photo"
                      value={member.image || ""}
                      onChange={(url) => updateMember(mIdx, "image", url)}
                      description="Upload a high-quality headshot."
                    />
                    
                    <div className="space-y-4 w-full">
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Left</label>
                        <input
                          type="text"
                          value={member.badge1 || ""}
                          onChange={(e) => updateMember(mIdx, "badge1", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 text-center"
                          placeholder="e.g. Certified Specialist"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Badge Right</label>
                        <input
                          type="text"
                          value={member.badge2 || ""}
                          onChange={(e) => updateMember(mIdx, "badge2", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold text-slate-700 text-center"
                          placeholder="e.g. Award Winner"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Content Column */}
                  <div className="lg:col-span-8 p-8 lg:p-10 space-y-8">
                    <div className="flex items-start justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 pr-6">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Full Name</label>
                          <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={member.name || ""}
                              onChange={(e) => updateMember(mIdx, "name", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="e.g. John Doe"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Professional Role</label>
                          <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                              type="text"
                              value={member.role || ""}
                              onChange={(e) => updateMember(mIdx, "role", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="e.g. Senior Project Manager"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">LinkedIn URL</label>
                          <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none"><path d="M4 8h4v12H4V8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="6" cy="4" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M10 8h4v2c.6-.8 1.5-2 3-2 2.5 0 4 1.5 4 4v8h-4v-6c0-1.5-.5-2-2-2s-2 .5-2 2v6h-4V8z" stroke="currentColor" strokeWidth="1.5"/></svg>
                            <input
                              type="url"
                              value={member.linkedin || ""}
                              onChange={(e) => updateMember(mIdx, "linkedin", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="https://linkedin.com/in/..."
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Email Address</label>
                          <div className="relative">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M22 7l-10 7L2 7" stroke="currentColor" strokeWidth="1.5"/></svg>
                            <input
                              type="email"
                              value={member.email || ""}
                              onChange={(e) => updateMember(mIdx, "email", e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-6 py-3.5 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                              placeholder="member@example.com"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMember(mIdx)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100"
                        title="Remove Member"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                      <div className="space-y-4">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-2">
                          <Quote className="w-4 h-4" />
                          Biography / Story
                        </label>
                        <RichTextEditor 
                          content={typeof member.description === 'string' ? member.description : (member.description || []).join("")} 
                          onChange={(v) => updateMember(mIdx, "description", v)} 
                        />
                      </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
