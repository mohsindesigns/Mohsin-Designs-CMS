"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Type, ChevronRight, Briefcase, Plus, Trash2, Edit2, CheckCircle } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-40 bg-slate-50 animate-pulse border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs">Loading Rich Text Editor...</div>
});

export default function CareersPageEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => {
        if (!json.careers) json.careers = {};
        if (!json.careers.roles) json.careers.roles = [];
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
      careers: {
        ...prev.careers,
        section: {
          ...prev.careers?.section,
          [field]: value
        }
      }
    }));
  };

  const addRole = () => {
    const newRole = { label: "New Position", value: "new_position" };
    setData((prev: any) => ({
      ...prev,
      careers: {
        ...prev.careers,
        roles: [...(prev.careers.roles || []), newRole]
      }
    }));
  };

  const updateRole = (index: number, field: "label" | "value", value: string) => {
    const newRoles = [...data.careers.roles];
    newRoles[index] = { ...newRoles[index], [field]: value };
    setData((prev: any) => ({
      ...prev,
      careers: { ...prev.careers, roles: newRoles }
    }));
  };

  const removeRole = (index: number) => {
    const newRoles = data.careers.roles.filter((_: any, i: number) => i !== index);
    setData((prev: any) => ({
      ...prev,
      careers: { ...prev.careers, roles: newRoles }
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
            <span className="text-slate-900 font-bold">Careers Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Careers Page</h1>
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
          className={`p-4 rounded-2xl mb-6 text-center font-bold ${message.includes("success") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
            }`}
        >
          {message}
        </motion.div>
      )}

      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Header Content</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
              <input
                type="text"
                value={data.careers?.section?.badge || ""}
                onChange={(e) => updateSection("badge", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                placeholder="e.g. Join Eagle Revolution"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Headline</label>
              <input
                type="text"
                value={data.careers?.section?.headline || ""}
                onChange={(e) => updateSection("headline", e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                placeholder="e.g. Construct your future with absolute precision"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Description</label>
            <RichTextEditor 
              content={data.careers?.section?.description || ""} 
              onChange={(v) => updateSection("description", v)} 
            />
          </div>
        </div>

        {/* Roles Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Open Roles</h2>
            </div>
            <button
              onClick={addRole}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Add Role
            </button>
          </div>

          <p className="text-slate-500 text-sm font-medium">Manage the positions that appear in the career application form dropdown.</p>

          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {data.careers?.roles?.map((role: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="group bg-slate-50 border border-slate-200 p-4 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:bg-white transition-all"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">Display Name</label>
                      <input
                        type="text"
                        value={role.label}
                        onChange={(e) => updateRole(index, "label", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="e.g. Project Manager"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-extrabold text-slate-400 tracking-widest">Technical Value (No spaces)</label>
                      <input
                        type="text"
                        value={role.value}
                        onChange={(e) => updateRole(index, "value", e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-700 font-mono text-xs focus:ring-2 focus:ring-primary/20 outline-none"
                        placeholder="e.g. project_manager"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeRole(index)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {(!data.careers?.roles || data.careers.roles.length === 0) && (
              <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                <p className="text-slate-400 font-medium">No roles defined. Click "Add Role" to start.</p>
              </div>
            )}
          </div>
        </div>

        {/* Success Message Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-5 h-5 text-emerald-500" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Post-Submission Content</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Success Title</label>
              <input
                type="text"
                value={data.careers?.success?.title || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, careers: { ...prev.careers, success: { ...prev.careers.success, title: e.target.value } } }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Success Description</label>
              <input
                type="text"
                value={data.careers?.success?.description || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, careers: { ...prev.careers, success: { ...prev.careers.success, description: e.target.value } } }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
