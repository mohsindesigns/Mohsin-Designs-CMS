"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Type, ChevronRight, Image as ImageIcon, Plus } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-40 bg-slate-50 animate-pulse border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 text-xs">Loading Rich Text Editor...</div>
});

export default function GalleryPageEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => setData(json))
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

  const updateHeader = (field: string, value: string) => {
    setData((prev: any) => ({
      ...prev,
      galleryPage: {
        ...prev.galleryPage,
        header: {
          ...prev.galleryPage?.header,
          [field]: value
        }
      }
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
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
            <Link href="/admin/pages" className="hover:text-primary transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Gallery Page</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gallery Page Header</h1>
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

      <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-sm">
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">Header Content</h2>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Page Badge</label>
            <input
              type="text"
              value={data.galleryPage?.header?.badge || ""}
              onChange={(e) => updateHeader("badge", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
              placeholder="e.g. Our Portfolio"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Page Title</label>
            <input
              type="text"
              value={data.galleryPage?.header?.title || ""}
              onChange={(e) => updateHeader("title", e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
              placeholder="e.g. Project Gallery"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Page Description</label>
            <RichTextEditor 
              content={data.galleryPage?.header?.description || ""} 
              onChange={(v) => updateHeader("description", v)} 
            />
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">!</div>
            <p className="text-slate-600 text-sm font-medium">
              Note: This page only controls the gallery header text. To manage the actual images and projects in the grid, visit the 
              <Link href="/admin/projects" className="text-primary font-bold hover:underline ml-1">Portfolio Management</Link> section.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
