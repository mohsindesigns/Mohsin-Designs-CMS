"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, ChevronRight, Star, Phone, Plus, Trash2, Mail, Award, Target, Heart } from "lucide-react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

export default function AboutEditor() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => {
        const d = { ...json };
        if (!d.aboutPage) d.aboutPage = {};
        if (!d.aboutPage.hero) d.aboutPage.hero = { headline: {}, stats: [] };
        if (!d.aboutPage.story) d.aboutPage.story = { portrait: {}, founder: { bio: [], social: {} } };
        if (!d.aboutPage.stats) d.aboutPage.stats = { items: [], trustBadges: [] };
        if (!d.aboutPage.mission) d.aboutPage.mission = { principles: [], stats: [] };
        if (!d.aboutPage.capabilities) d.aboutPage.capabilities = {};
        if (!d.aboutPage.services) d.aboutPage.services = [];
        if (!d.aboutPage.recognition) d.aboutPage.recognition = [];
        if (!d.aboutPage.ctaBanner) d.aboutPage.ctaBanner = { features: [] };
        setData(d);
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
        setMessage("About page content saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save content.");
      }
    } catch (err) {
      setMessage("Error saving content.");
    } finally {
      setSaving(false);
    }
  };

  const updateAbout = (section: string, field: string | null, value: any) => {
    setData((prev: any) => ({
      ...prev,
      aboutPage: {
        ...prev.aboutPage,
        [section]: field ? {
          ...prev.aboutPage[section],
          [field]: value,
        } : value,
      },
    }));
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: "hero", label: "1. Hero Section (Top of Page)", icon: LayoutTemplate },
    { id: "story", label: "2. Founder Story & Quotes", icon: Type },
    { id: "stats", label: "3. Company Impact Stats", icon: Award },
    { id: "mission", label: "4. Mission & Values", icon: Target },
    { id: "capabilities", label: "5. Capabilities & Services Selection", icon: LayoutTemplate },
    { id: "cta", label: "6. Awards & Bottom CTA", icon: Heart },
  ];

  const { aboutPage } = data;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/pages" className="hover:text-gray-900 transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 font-bold">About Page</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Edit About Page</h1>
          <p className="text-slate-500 mt-1 italic font-medium">Manage your company story, mission, and stats.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.includes("success") ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-red-500/10 text-red-600 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-1">
          {tabs.map((tab: any) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="lg:col-span-3 bg-white shadow-xl shadow-slate-200/50 border border-slate-200 rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {activeTab === "hero" && (
              <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Hero Section</h2>

                <ImageField 
                  label="Hero Background Image"
                  value={aboutPage.hero?.bgImage || ""}
                  onChange={(url) => updateAbout("hero", "bgImage", url)}
                  altValue={aboutPage.hero?.bgImageAlt || ""}
                  onAltChange={(alt) => updateAbout("hero", "bgImageAlt", alt)}
                  description="Choose a high-quality background for the about page hero. Optimal size: 1920x1080px."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   {["line1", "line2", "line3"].map((line) => (
                      <div key={line} className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Headline {line}</label>
                        <input
                          type="text"
                          value={aboutPage.hero?.headline?.[line] || ""}
                          onChange={(e) => {
                             const newHeadline = { ...aboutPage.hero?.headline, [line]: e.target.value };
                             updateAbout("hero", "headline", newHeadline);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        />
                      </div>
                   ))}
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Hero Description</label>
                  <RichTextEditor 
                    content={aboutPage.hero?.description || ""} 
                    onChange={(v) => updateAbout("hero", "description", v)} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                   <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">CTA Button Text</label>
                      <input
                        type="text"
                        value={aboutPage.hero?.cta || ""}
                        onChange={(e) => updateAbout("hero", "cta", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">CTA Button Link</label>
                      <input
                        type="text"
                        value={aboutPage.hero?.ctaLink || ""}
                        onChange={(e) => updateAbout("hero", "ctaLink", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium"
                        placeholder="/contact-us"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                   <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Trust Label (Over Stars)</label>
                      <input
                        type="text"
                        value={aboutPage.hero?.trustLabel || ""}
                        onChange={(e) => updateAbout("hero", "trustLabel", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                   <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Contact Phone</label>
                      <input
                        type="text"
                        value={aboutPage.hero?.phone || ""}
                        onChange={(e) => updateAbout("hero", "phone", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Phone Label</label>
                      <input
                        type="text"
                        value={aboutPage.hero?.phoneLabel || ""}
                        onChange={(e) => updateAbout("hero", "phoneLabel", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                   </div>
                </div>
              </motion.div>
            )}

            {activeTab === "story" && (
              <motion.div key="story" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Founder Story</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
                    <input
                      type="text"
                      value={aboutPage.story?.badge || ""}
                      onChange={(e) => {
                        const newStory = { ...aboutPage.story, badge: e.target.value };
                        updateAbout("story", null, newStory);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Headline</label>
                    <input
                      type="text"
                      value={aboutPage.story?.headline || ""}
                      onChange={(e) => {
                        const newStory = { ...aboutPage.story, headline: e.target.value };
                        updateAbout("story", null, newStory);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Highlight Word(s)</label>
                    <input
                      type="text"
                      value={aboutPage.story?.highlight || ""}
                      onChange={(e) => {
                        const newStory = { ...aboutPage.story, highlight: e.target.value };
                        updateAbout("story", null, newStory);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Intro Description</label>
                    <input
                      type="text"
                      value={aboutPage.story?.description || ""}
                      onChange={(e) => {
                        const newStory = { ...aboutPage.story, description: e.target.value };
                        updateAbout("story", null, newStory);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                    />
                  </div>
                </div>

                {/* Founder Info Section */}
                <div className="pt-8 border-t border-slate-100 space-y-6">
                  <h3 className="text-lg font-black text-slate-800">Founder Portrait & Identity</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <ImageField 
                      label="Portrait Image"
                      value={aboutPage.story?.portrait?.image || ""}
                      onChange={(url) => updateAbout("story", "portrait", { ...aboutPage.story?.portrait, image: url })}
                      altValue={aboutPage.story?.portrait?.alt || ""}
                      onAltChange={(alt) => updateAbout("story", "portrait", { ...aboutPage.story?.portrait, alt: alt })}
                      description="Choose a professional portrait of the founder."
                    />

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Portrait Badge (Left)</label>
                        <input
                          type="text"
                          value={aboutPage.story?.portrait?.badgeLeft || ""}
                          onChange={(e) => updateAbout("story", "portrait", { ...aboutPage.story?.portrait, badgeLeft: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                          placeholder="e.g. SINCE 2012"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Portrait Badge (Right)</label>
                        <input
                          type="text"
                          value={aboutPage.story?.portrait?.badgeRight || ""}
                          onChange={(e) => updateAbout("story", "portrait", { ...aboutPage.story?.portrait, badgeRight: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                          placeholder="e.g. CERTIFIED MASTER"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Founder Email</label>
                        <input
                          type="email"
                          value={aboutPage.story?.founder?.email || ""}
                          onChange={(e) => updateAbout("story", "founder", { ...aboutPage.story.founder, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Name</label>
                      <input
                        type="text"
                        value={aboutPage.story?.founder?.name || ""}
                        onChange={(e) => {
                          const newFounder = { ...aboutPage.story.founder, name: e.target.value };
                          updateAbout("story", "founder", newFounder);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Title</label>
                      <input
                        type="text"
                        value={aboutPage.story?.founder?.title || ""}
                        onChange={(e) => {
                          const newFounder = { ...aboutPage.story.founder, title: e.target.value };
                          updateAbout("story", "founder", newFounder);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Main Quote</label>
                    <RichTextEditor 
                      content={aboutPage.story?.founder?.quote || ""} 
                      onChange={(v) => updateAbout("story", "founder", { ...aboutPage.story.founder, quote: v })} 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Secondary Quote (Italic)</label>
                      <input
                        type="text"
                        value={aboutPage.story?.founder?.secondaryQuote || ""}
                        onChange={(e) => updateAbout("story", "founder", { ...aboutPage.story.founder, secondaryQuote: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium italic"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Quote Footer (Name/Date)</label>
                      <input
                        type="text"
                        value={aboutPage.story?.founder?.footer || ""}
                        onChange={(e) => updateAbout("story", "founder", { ...aboutPage.story.founder, footer: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">LinkedIn URL</label>
                      <input
                        type="text"
                        value={aboutPage.story?.founder?.social?.linkedin || ""}
                        onChange={(e) => updateAbout("story", "founder", { ...aboutPage.story.founder, social: { ...aboutPage.story.founder.social, linkedin: e.target.value } })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Full Biography</label>
                    <RichTextEditor 
                      content={(aboutPage.story?.founder?.bio || []).join("")} 
                      onChange={(v) => updateAbout("story", "founder", { ...aboutPage.story.founder, bio: [v] })} 
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "stats" && (
              <motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Company Impact Stats</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Impact Headline</label>
                      <input
                        type="text"
                        value={aboutPage.stats?.headline || ""}
                        onChange={(e) => {
                          const newStats = { ...aboutPage.stats, headline: e.target.value };
                          updateAbout("stats", null, newStats);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Description</label>
                      <input
                        type="text"
                        value={aboutPage.stats?.description || ""}
                        onChange={(e) => {
                          const newStats = { ...aboutPage.stats, description: e.target.value };
                          updateAbout("stats", null, newStats);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-slate-800">Counter Cards</h3>
                      <button 
                        onClick={() => {
                          const newItems = [...(aboutPage.stats?.items || []), { value: 0, label: "New Stat", suffix: "", icon: "Shield", description: "" }];
                          updateAbout("stats", "items", newItems);
                        }}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add Stat
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(aboutPage.stats?.items || []).map((item: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 relative group">
                          <button 
                            onClick={() => {
                              const newItems = aboutPage.stats.items.filter((_: any, i: number) => i !== idx);
                              updateAbout("stats", "items", newItems);
                            }}
                            className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Value</label>
                              <input type="number" value={item.value} onChange={(e) => {
                                const newItems = [...aboutPage.stats.items];
                                newItems[idx].value = parseInt(e.target.value) || 0;
                                updateAbout("stats", "items", newItems);
                              }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Suffix</label>
                              <input type="text" value={item.suffix} onChange={(e) => {
                                const newItems = [...aboutPage.stats.items];
                                newItems[idx].suffix = e.target.value;
                                updateAbout("stats", "items", newItems);
                              }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Label</label>
                            <input type="text" value={item.label} onChange={(e) => {
                              const newItems = [...aboutPage.stats.items];
                              newItems[idx].label = e.target.value;
                              updateAbout("stats", "items", newItems);
                            }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "mission" && (
              <motion.div key="mission" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Mission & Principles</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <ImageField 
                    label="Mission Illustration"
                    value={aboutPage.mission?.image || ""}
                    onChange={(url) => updateAbout("mission", "image", url)}
                    altValue={aboutPage.mission?.imageAlt || ""}
                    onAltChange={(alt) => updateAbout("mission", "imageAlt", alt)}
                    description="Visual representation of your company's mission."
                  />
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Mission Headline</label>
                      <input
                        type="text"
                        value={aboutPage.mission?.headline || ""}
                        onChange={(e) => {
                          const newMission = { ...aboutPage.mission, headline: e.target.value };
                          updateAbout("mission", null, newMission);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Mission Paragraph</label>
                      <RichTextEditor 
                        content={aboutPage.mission?.description || ""} 
                        onChange={(v) => updateAbout("mission", "description", v)} 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <ImageField 
                    label="Core Values Illustration"
                    value={aboutPage.values?.image || ""}
                    onChange={(url) => updateAbout("values", "image", url)}
                    altValue={aboutPage.values?.imageAlt || ""}
                    onAltChange={(alt) => updateAbout("values", "imageAlt", alt)}
                    description="Visual representation of your company's core values."
                  />
                </div>

                <div className="pt-8 border-t border-slate-100">
                  <h3 className="text-lg font-black text-slate-800 mb-6">Core Principles Grid</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(aboutPage.mission?.principles || []).map((principle: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
                         <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Title</label>
                              <input type="text" value={principle.title} onChange={(e) => {
                                const newPrinciples = [...aboutPage.mission.principles];
                                newPrinciples[idx].title = e.target.value;
                                updateAbout("mission", "principles", newPrinciples);
                              }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase">Top Badge (e.g. 01)</label>
                              <input type="text" value={principle.val} onChange={(e) => {
                                const newPrinciples = [...aboutPage.mission.principles];
                                newPrinciples[idx].val = e.target.value;
                                updateAbout("mission", "principles", newPrinciples);
                              }} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold" />
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                            <RichTextEditor 
                               content={principle.desc} 
                               onChange={(v) => {
                                 const newPrinciples = [...aboutPage.mission.principles];
                                 newPrinciples[idx].desc = v;
                                 updateAbout("mission", "principles", newPrinciples);
                               }} 
                            />
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "capabilities" && (
              <motion.div key="capabilities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Capabilities Section Header</h2>
                <p className="text-sm text-slate-500 italic font-medium">This section updates the title and intro text above the services grid.</p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
                    <input
                      type="text"
                      value={aboutPage.capabilities?.badge || ""}
                      onChange={(e) => {
                        const newCap = { ...aboutPage.capabilities, badge: e.target.value };
                        updateAbout("capabilities", null, newCap);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Headline</label>
                    <input
                      type="text"
                      value={aboutPage.capabilities?.headline || ""}
                      onChange={(e) => {
                        const newCap = { ...aboutPage.capabilities, headline: e.target.value };
                        updateAbout("capabilities", null, newCap);
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Intro Description</label>
                    <RichTextEditor 
                      content={aboutPage.capabilities?.description || ""} 
                      onChange={(v) => updateAbout("capabilities", "description", v)} 
                    />
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-black text-slate-800">Featured Service Selection</h3>
                  <p className="text-xs text-slate-500 italic">Select which services to feature in the capabilities section on the public About page. Drag and drop or use the arrows to reorder.</p>
                  <ContentSelector
                    type="services"
                    label="Featured Services"
                    selectedItems={aboutPage.services || []}
                    onSelect={(items) => updateAbout("services", null, items)}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "cta" && (
              <motion.div key="cta" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <h2 className="text-2xl font-black text-slate-900 border-b border-slate-100 pb-6">Awards & Call to Action</h2>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Recognition Marquee Items</label>
                      <button 
                        onClick={() => {
                          const newCerts = [...(aboutPage.recognition || []), "NEW CERTIFICATION"];
                          updateAbout("recognition", null, newCerts);
                        }}
                        className="text-xs font-bold text-primary flex items-center gap-1 hover:underline"
                      >
                        <Plus className="w-3 h-3" /> Add Item
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(aboutPage.recognition || []).map((text: string, idx: number) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-200 group">
                          <input
                            type="text"
                            value={text}
                            onChange={(e) => {
                              const newCerts = [...aboutPage.recognition];
                              newCerts[idx] = e.target.value;
                              updateAbout("recognition", null, newCerts);
                            }}
                            className="flex-1 bg-white border border-slate-100 rounded-lg px-3 py-2 text-sm font-bold"
                          />
                          <button 
                            onClick={() => {
                              const newCerts = aboutPage.recognition.filter((_: any, i: number) => i !== idx);
                              updateAbout("recognition", null, newCerts);
                            }}
                            className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-slate-100 space-y-6">
                    <h3 className="text-lg font-black text-slate-800">Bottom CTA Banner</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Headline</label>
                          <input type="text" value={aboutPage.ctaBanner?.headline || ""} onChange={(e) => updateAbout("ctaBanner", "headline", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold text-primary">Highlight Word</label>
                          <input type="text" value={aboutPage.ctaBanner?.highlight || ""} onChange={(e) => updateAbout("ctaBanner", "highlight", e.target.value)} className="w-full bg-slate-50 border border-primary/30 rounded-xl px-4 py-3 text-primary font-bold" />
                       </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Description</label>
                      <RichTextEditor 
                        content={aboutPage.ctaBanner?.description || ""} 
                        onChange={(v) => updateAbout("ctaBanner", "description", v)} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Primary Button Text</label>
                          <input type="text" value={aboutPage.ctaBanner?.primaryCta || ""} onChange={(e) => updateAbout("ctaBanner", "primaryCta", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Primary Button Link</label>
                          <input type="text" value={aboutPage.ctaBanner?.primaryLink || ""} onChange={(e) => updateAbout("ctaBanner", "primaryLink", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium" placeholder="/contact-us" />
                       </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Secondary Button Text</label>
                          <input type="text" value={aboutPage.ctaBanner?.secondaryCta || ""} onChange={(e) => updateAbout("ctaBanner", "secondaryCta", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Secondary Button Link</label>
                          <input type="text" value={aboutPage.ctaBanner?.secondaryLink || ""} onChange={(e) => updateAbout("ctaBanner", "secondaryLink", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium" placeholder="/contact-us" />
                       </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
