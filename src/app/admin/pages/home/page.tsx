"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, LayoutTemplate, Type, Image as ImageIcon, ChevronRight, Star, Phone, Plus, Trash2, Mail, Users, MapPin, Globe } from "lucide-react";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import ContentSelector from "@/components/admin/ContentSelector";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

export default function HomeEditor() {
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("hero");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch the raw content from the API directly to get the latest DB state
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
        setMessage("Homepage content saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Failed to save homepage content.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const updateSection = (section: string, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
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
    { id: "hero", label: "Hero Section", icon: LayoutTemplate },
    { id: "about", label: "About Section", icon: Type },
    { id: "services", label: "Services Section", icon: LayoutTemplate },
    { id: "leadership", label: "Leadership", icon: Users },
    { id: "portfolio", label: "Portfolio Section", icon: ImageIcon },
    { id: "testimonials", label: "Testimonials", icon: Type },
    { id: "whyChooseUs", label: "Why Choose Us", icon: ImageIcon },
    { id: "serviceArea", label: "Service Area (Global Map)", icon: MapPin },
    { id: "faq", label: "FAQ Section", icon: LayoutTemplate },
    { id: "quote", label: "Homepage Contact", icon: Mail },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin/pages" className="hover:text-gray-900 transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Home</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Homepage</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-5 py-2.5 rounded-xl font-medium transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${message.includes("success") ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="md:col-span-1 space-y-1">
          {tabs.map((tab: any) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                  ? "bg-primary/10 text-primary border border-primary/20 hover:bg-gray-100"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor Area */}
        <div className="md:col-span-3 bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
          <AnimatePresence mode="wait">
            {activeTab === "hero" && (
              <motion.div key="hero" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-2xl font-extrabold text-slate-900 mb-8 border-b border-slate-100 pb-6">Hero Section</h2>

                {/* Background Image */}
                <ImageField
                  label="Background Image"
                  value={data.hero?.images?.[0] || ""}
                  onChange={(url) => {
                    const currentImages = Array.isArray(data.hero?.images) ? data.hero.images : [];
                    const newImages = [...currentImages];
                    newImages[0] = url;
                    updateSection("hero", "images", newImages);
                  }}
                  altValue={data.hero?.bgImageAlt || ""}
                  onAltChange={(alt) => updateSection("hero", "bgImageAlt", alt)}
                  description="Choose a high-quality background for the homepage hero. Optimal size: 1920x1080px."
                />

                {/* Badge & Description */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Badge</label>
                    <input
                      type="text"
                      value={data.hero?.badge || ""}
                      onChange={(e) => updateSection("hero", "badge", e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Description</label>
                    <RichTextEditor
                      content={data.hero?.description || ""}
                      onChange={(v) => updateSection("hero", "description", v)}
                    />
                  </div>
                </div>

                {/* Headlines */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Headlines</h3>
                  {(data.hero?.headlines || []).map((line: any, idx: number) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="flex-1 space-y-2">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Line {idx + 1} Text</label>
                        <input
                          type="text"
                          value={line.text || ""}
                          onChange={(e) => {
                            const newHeadlines = [...data.hero.headlines];
                            newHeadlines[idx].text = e.target.value;
                            updateSection("hero", "headlines", newHeadlines);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        />
                      </div>
                      <div className="flex flex-col gap-2 items-center justify-center pt-6">
                        <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Highlight?</label>
                        <input
                          type="checkbox"
                          checked={line.highlight || false}
                          onChange={(e) => {
                            const newHeadlines = [...data.hero.headlines];
                            newHeadlines[idx].highlight = e.target.checked;
                            updateSection("hero", "headlines", newHeadlines);
                          }}
                          className="w-5 h-5 accent-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Buttons (CTAs) */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Call to Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.hero?.buttons || []).map((btn: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Button {idx + 1}</p>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Label</label>
                          <input
                            type="text"
                            value={btn.text || ""}
                            onChange={(e) => {
                              const newBtns = [...data.hero.buttons];
                              newBtns[idx].text = e.target.value;
                              updateSection("hero", "buttons", newBtns);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Link (href)</label>
                          <input
                            type="text"
                            value={btn.href || ""}
                            onChange={(e) => {
                              const newBtns = [...data.hero.buttons];
                              newBtns[idx].href = e.target.value;
                              updateSection("hero", "buttons", newBtns);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Icon Name</label>
                          <input
                            type="text"
                            value={btn.icon || ""}
                            onChange={(e) => {
                              const newBtns = [...data.hero.buttons];
                              newBtns[idx].icon = e.target.value;
                              updateSection("hero", "buttons", newBtns);
                            }}
                            placeholder="e.g. ArrowRight, Phone, Calendar"
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                          <p className="text-[11px] text-slate-400 italic">Leave blank for no icon. Uses Lucide icon names.</p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                          <input
                            type="checkbox"
                            checked={btn.primary || false}
                            onChange={(e) => {
                              const newBtns = [...data.hero.buttons];
                              newBtns[idx].primary = e.target.checked;
                              updateSection("hero", "buttons", newBtns);
                            }}
                          />
                          Primary Style (filled background)
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Hero Stats</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(data.hero?.stats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Value</label>
                          <input
                            type="text"
                            value={stat.value || ""}
                            onChange={(e) => {
                              const newStats = [...data.hero.stats];
                              newStats[idx].value = e.target.value;
                              updateSection("hero", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm font-bold focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Label</label>
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const newStats = [...data.hero.stats];
                              newStats[idx].label = e.target.value;
                              updateSection("hero", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "about" && (
              <motion.div key="about" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">About Section</h2>

                {/* Image Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageField
                    label="Left Side Image"
                    value={data.about?.image?.src || ""}
                    onChange={(url) => {
                      setData((prev: any) => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          image: { ...prev.about.image, src: url }
                        }
                      }));
                    }}
                    altValue={data.about?.image?.alt || ""}
                    onAltChange={(alt) => {
                      setData((prev: any) => ({
                        ...prev,
                        about: {
                          ...prev.about,
                          image: { ...prev.about.image, alt: alt }
                        }
                      }));
                    }}
                    description="This image appears on the left side of the About section."
                  />

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Badge Over Image</label>
                      <input
                        type="text"
                        value={data.about?.image?.badge || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, about: { ...prev.about, image: { ...prev.about.image, badge: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. 10+ YEARS EXPERIENCE"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Top Badge</label>
                      <input
                        type="text"
                        value={data.about?.badge || ""}
                        onChange={(e) => updateSection("about", "badge", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Headline */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Section Headline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Prefix</label>
                      <input
                        type="text"
                        value={data.about?.headline?.prefix || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, about: { ...prev.about, headline: { ...prev.about.headline, prefix: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold text-primary">Highlight</label>
                      <input
                        type="text"
                        value={data.about?.headline?.highlight || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, about: { ...prev.about, headline: { ...prev.about.headline, highlight: e.target.value } } }))}
                        className="w-full bg-white border border-primary/30 text-primary font-bold rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Suffix</label>
                      <input
                        type="text"
                        value={data.about?.headline?.suffix || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, about: { ...prev.about, headline: { ...prev.about.headline, suffix: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Description & Core Values */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Description</label>
                    <RichTextEditor
                      content={data.about?.description || ""}
                      onChange={(v) => updateSection("about", "description", v)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">5 Trust Badges (Comma separated)</label>
                    <input
                      type="text"
                      value={(data.about?.coreValues || []).join(", ")}
                      onChange={(e) => updateSection("about", "coreValues", e.target.value.split(",").map((s: any) => s.trim()).filter(Boolean))}
                      placeholder="Licensed, Insured, Veteran Owned..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Buttons (CTAs) */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Call to Action Buttons</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(data.about?.buttons || []).map((btn: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Button {idx + 1}</p>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Label</label>
                          <input
                            type="text"
                            value={btn.text || ""}
                            onChange={(e) => {
                              const newBtns = [...data.about.buttons];
                              newBtns[idx].text = e.target.value;
                              updateSection("about", "buttons", newBtns);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Link (href)</label>
                          <input
                            type="text"
                            value={btn.href || ""}
                            onChange={(e) => {
                              const newBtns = [...data.about.buttons];
                              newBtns[idx].href = e.target.value;
                              updateSection("about", "buttons", newBtns);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">Stats Cards</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(data.about?.stats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Value</label>
                          <input
                            type="number"
                            step="0.1"
                            value={stat.value ?? 0}
                            onChange={(e) => {
                              const newStats = [...data.about.stats];
                              newStats[idx].value = parseFloat(e.target.value);
                              updateSection("about", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm font-bold focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Suffix (e.g. +)</label>
                          <input
                            type="text"
                            value={stat.suffix || ""}
                            onChange={(e) => {
                              const newStats = [...data.about.stats];
                              newStats[idx].suffix = e.target.value;
                              updateSection("about", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Label</label>
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const newStats = [...data.about.stats];
                              newStats[idx].label = e.target.value;
                              updateSection("about", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "services" && (
              <motion.div key="services" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Services Section</h2>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Section 3</span>
                </div>

                {/* Image Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Right Side Media
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ImageField
                      label="Section Image"
                      value={data.services?.image?.src || ""}
                      onChange={(url) => {
                        setData((prev: any) => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            image: { ...prev.services.image, src: url }
                          }
                        }));
                      }}
                      altValue={data.services?.image?.alt || ""}
                      onAltChange={(alt) => {
                        setData((prev: any) => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            image: { ...prev.services.image, alt: alt }
                          }
                        }));
                      }}
                      description="This image appears on the right side of the Services section."
                    />

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Floating Image Badge</label>
                        <input
                          type="text"
                          value={data.services?.image?.badge || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, image: { ...prev.services.image, badge: e.target.value } } }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all transition-colors"
                          placeholder="e.g. 🇺🇸 Veteran Owned & Operated"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Top Badge</label>
                        <input
                          type="text"
                          value={data.services?.badge || ""}
                          onChange={(e) => updateSection("services", "badge", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all transition-colors"
                          placeholder="e.g. Our Expertise"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Text Content
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Prefix</label>
                        <input
                          type="text"
                          value={data.services?.headline?.prefix || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, headline: { ...prev.services.headline, prefix: e.target.value } } }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-primary font-bold">Highlight</label>
                        <input
                          type="text"
                          value={data.services?.headline?.highlight || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, headline: { ...prev.services.headline, highlight: e.target.value } } }))}
                          className="w-full bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Suffix</label>
                        <input
                          type="text"
                          value={data.services?.headline?.suffix || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, headline: { ...prev.services.headline, suffix: e.target.value } } }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold flex justify-between">
                        <span>Description Paragraphs</span>
                      </label>
                      <RichTextEditor
                        content={Array.isArray(data.services?.description) ? data.services.description.join("") : (data.services?.description || "")}
                        onChange={(v) => updateSection("services", "description", [v])}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Description Highlight Text</label>
                      <input
                        type="text"
                        value={data.services?.highlightText || ""}
                        onChange={(e) => updateSection("services", "highlightText", e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. Veteran Owned • Licensed • Bonded & Insured"
                      />
                      <p className="text-xs text-slate-500 italic">This text will be displayed with primary highlight styles right below the description paragraphs on the public site.</p>
                    </div>
                  </div>
                </div>

                {/* Stats Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                    Stats Indicators
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {(data.services?.stats || []).map((stat: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-100 space-y-4">
                        <p className="text-xs font-bold text-primary uppercase tracking-widest border-b border-gray-200 pb-2">Stat #{idx + 1}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Value</label>
                            <input
                              type="number"
                              step="0.1"
                              value={stat.value ?? 0}
                              onChange={(e) => {
                                const newStats = [...data.services.stats];
                                newStats[idx].value = parseFloat(e.target.value);
                                updateSection("services", "stats", newStats);
                              }}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-lg font-bold focus:border-primary/50 focus:outline-none"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Suffix</label>
                            <input
                              type="text"
                              value={stat.suffix || ""}
                              onChange={(e) => {
                                const newStats = [...data.services.stats];
                                newStats[idx].suffix = e.target.value;
                                updateSection("services", "stats", newStats);
                              }}
                              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                              placeholder="e.g. +"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Label</label>
                          <input
                            type="text"
                            value={stat.label || ""}
                            onChange={(e) => {
                              const newStats = [...data.services.stats];
                              newStats[idx].label = e.target.value;
                              updateSection("services", "stats", newStats);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 text-sm focus:border-primary/50 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Panel */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 relative z-10">
                    <ChevronRight className="w-5 h-5 text-primary" />
                    Bottom Call to Action
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Heading</label>
                      <input
                        type="text"
                        value={data.services?.cta?.title || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, cta: { ...prev.services.cta, title: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Button Label</label>
                      <input
                        type="text"
                        value={data.services?.cta?.buttonText || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, cta: { ...prev.services.cta, buttonText: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Description Text</label>
                      <RichTextEditor
                        content={data.services?.cta?.description || ""}
                        onChange={(v) => setData((prev: any) => ({ ...prev, services: { ...prev.services, cta: { ...prev.services.cta, description: v } } }))}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Destination Link</label>
                      <input
                        type="text"
                        value={data.services?.cta?.buttonLink || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, services: { ...prev.services, cta: { ...prev.services.cta, buttonLink: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "leadership" && (
              <motion.div key="leadership" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Leadership Section</h2>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Section 4</span>
                </div>

                {/* Intro Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Section Intro Header
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Badge</label>
                      <input
                        type="text"
                        value={data.leadership?.section?.badge || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, section: { ...prev.leadership.section, badge: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. OUR LEADERSHIP"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Prefix (plain text)</label>
                      <input
                        type="text"
                        value={data.testimonials?.section?.headlinePrefix || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, headlinePrefix: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Highlight (primary color)</label>
                      <input
                        type="text"
                        value={data.leadership?.section?.headlineHighlight || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, section: { ...prev.leadership.section, headlineHighlight: e.target.value } } }))}
                        className="w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Suffix (plain text)</label>
                      <input
                        type="text"
                        value={data.leadership?.section?.headlineSuffix || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, section: { ...prev.leadership.section, headlineSuffix: e.target.value } } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Paragraph</label>
                      <RichTextEditor
                        content={data.leadership?.section?.description || ""}
                        onChange={(v) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, section: { ...prev.leadership.section, description: v } } }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Left Side Panel (Portrait & Badges) */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Leadership Media: Portrait & Badges
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <ImageField
                        label="Leader Portrait"
                        value={data.leadership?.ceo?.image?.src || ""}
                        onChange={(url) => {
                          setData((prev: any) => ({
                            ...prev,
                            leadership: {
                              ...prev.leadership,
                              ceo: {
                                ...prev.leadership.ceo,
                                image: { ...prev.leadership.ceo.image, src: url }
                              }
                            }
                          }));
                        }}
                        altValue={data.leadership?.ceo?.alt || ""}
                        onAltChange={(alt) => {
                          setData((prev: any) => ({
                            ...prev,
                            leadership: {
                              ...prev.leadership,
                              ceo: {
                                ...prev.leadership.ceo,
                                alt: alt
                              }
                            }
                          }));
                        }}
                        description="Professional portrait of the CEO/Founder."
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Top Image Badge</label>
                        <input
                          type="text"
                          value={data.leadership?.ceo?.badges?.top || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, badges: { ...prev.leadership.ceo.badges, top: e.target.value } } } }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all transition-colors"
                          placeholder="e.g. Founder & CEO"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Bottom Image Badge</label>
                        <input
                          type="text"
                          value={data.leadership?.ceo?.badges?.bottom || ""}
                          onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, badges: { ...prev.leadership.ceo.badges, bottom: e.target.value } } } }))}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all transition-colors"
                          placeholder="e.g. 15+ Years Experience"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side Content Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LayoutTemplate className="w-5 h-5 text-primary" />
                    Leadership Details & Text
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Leader/CEO Name</label>
                      <input
                        type="text"
                        value={data.leadership?.ceo?.name || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, name: e.target.value } } }))}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm font-bold focus:border-primary/50 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-primary font-bold">Leader Title / Keypoint</label>
                      <input
                        type="text"
                        value={data.leadership?.ceo?.title || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, title: e.target.value } } }))}
                        className="w-full bg-primary/10 border border-primary/30 text-primary font-bold rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold flex justify-between">
                        <span>Founder Quotes</span>
                        <span className="text-gray-400 lowercase font-normal italic">Hit enter for a new quote</span>
                      </label>
                      <RichTextEditor
                        content={Array.isArray(data.leadership?.ceo?.quotes) ? data.leadership.ceo.quotes.join("") : (data.leadership?.ceo?.quotes || "")}
                        onChange={(v) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, quotes: [v] } } }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold flex justify-between">
                        <span>Complete Description</span>
                      </label>
                      <RichTextEditor
                        content={Array.isArray(data.leadership?.ceo?.description) ? data.leadership.ceo.description.join("") : (data.leadership?.ceo?.description || "")}
                        onChange={(v) => setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, description: [v] } } }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Socials Panel */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <ChevronRight className="w-5 h-5 text-primary" />
                      Leadership Social Links
                    </h3>
                    <button
                      onClick={() => {
                        const newSocials = [...(data.leadership?.ceo?.socials || [])];
                        newSocials.push({ icon: "Linkedin", url: "", label: "" });
                        setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, socials: newSocials } } }));
                      }}
                      className="bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      + Add Social Link
                    </button>
                  </div>

                  <div className="space-y-4">
                    {(data.leadership?.ceo?.socials || []).map((social: any, idx: number) => (
                      <div key={idx} className="flex flex-wrap md:flex-nowrap gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 items-end">
                        <div className="space-y-2 flex-shrink-0 w-full md:w-auto">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Icon</label>
                          <select
                            value={social.icon}
                            onChange={(e) => {
                              const newSocials = [...data.leadership.ceo.socials];
                              newSocials[idx].icon = e.target.value;
                              setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, socials: newSocials } } }));
                            }}
                            className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all appearance-none"
                          >
                            <option value="Linkedin">LinkedIn</option>
                            <option value="Facebook">Facebook</option>
                            <option value="Twitter">Twitter</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Youtube">YouTube</option>
                            <option value="Mail">Email (Mail)</option>
                            <option value="Phone">Phone</option>
                            <option value="Globe">Website (Globe)</option>
                          </select>
                        </div>
                        <div className="space-y-2 flex-grow">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">URL / Link</label>
                          <input
                            type="text"
                            value={social.url || ""}
                            onChange={(e) => {
                              const newSocials = [...data.leadership.ceo.socials];
                              newSocials[idx].url = e.target.value;
                              setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, socials: newSocials } } }));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                            placeholder="e.g. https://linkedin.com/in/... or mailto:ceo@..."
                          />
                        </div>
                        <div className="space-y-2 flex-grow">
                          <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Label (Optional)</label>
                          <input
                            type="text"
                            value={social.label || ""}
                            onChange={(e) => {
                              const newSocials = [...data.leadership.ceo.socials];
                              newSocials[idx].label = e.target.value;
                              setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, socials: newSocials } } }));
                            }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                            placeholder="e.g. admin@example.com"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const newSocials = data.leadership.ceo.socials.filter((_: any, i: number) => i !== idx);
                            setData((prev: any) => ({ ...prev, leadership: { ...prev.leadership, ceo: { ...prev.leadership.ceo, socials: newSocials } } }));
                          }}
                          className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {(!data.leadership?.ceo?.socials || data.leadership.ceo.socials.length === 0) && (
                      <p className="text-gray-500 text-sm text-center py-4 italic">No social links added yet.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "portfolio" && (
              <motion.div key="portfolio" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Portfolio Section</h2>
                    <p className="text-gray-500 text-sm mt-1">Configure the design settings and select featured projects to show in the homepage slider.</p>
                  </div>
                  <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Section 5</span>
                </div>

                {/* Intro Panel */}
                <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Type className="w-5 h-5 text-primary" />
                    Section Headers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Badge / Tag</label>
                      <input
                        type="text"
                        value={data.portfolio?.sectionTag || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, sectionTag: e.target.value } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. CASE STUDIES"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Title Intro</label>
                      <input
                        type="text"
                        value={data.portfolio?.titleIntro || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, titleIntro: e.target.value } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. Our Recent"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Title Highlight</label>
                      <input
                        type="text"
                        value={data.portfolio?.titleHighlight || ""}
                        onChange={(e) => setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, titleHighlight: e.target.value } }))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                        placeholder="e.g. Masterpieces"
                      />
                    </div>
                    <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Description</label>
                    <textarea
                      value={data.portfolio?.description || ""}
                      onChange={(e) => setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, description: e.target.value } }))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all min-h-[80px]"
                      placeholder="e.g. A detailed look at some of our premium agency projects..."
                    />
                  </div>
                </div>

        {/* Filter Categories Manager */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <LayoutTemplate className="w-5 h-5 text-primary" />
              Filter Categories (Tabs)
            </h3>
            <button
              type="button"
              onClick={() => {
                const currentCats = data.portfolio?.categories || [
                  { id: "all", label: "All Work", iconName: "LayoutGrid" },
                  { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                  { id: "dev", label: "Development", iconName: "Monitor" },
                  { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                ];
                const newId = `category-${Date.now()}`;
                setData((prev: any) => ({
                  ...prev,
                  portfolio: {
                    ...prev.portfolio,
                    categories: [
                      ...currentCats,
                      { id: newId, label: "New Category", iconName: "Award" }
                    ]
                  }
                }));
              }}
              className="bg-primary/15 text-primary border border-primary/20 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/20 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Filter Tab
            </button>
          </div>

          <div className="space-y-4">
            {(data.portfolio?.categories || [
              { id: "all", label: "All Work", iconName: "LayoutGrid" },
              { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
              { id: "dev", label: "Development", iconName: "Monitor" },
              { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
            ]).map((cat: any, cIdx: number) => (
              <div key={cIdx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200/50">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tab Label / Name</label>
                  <input
                    type="text"
                    value={cat.label || ""}
                    disabled={cat.id === "all"}
                    onChange={(e) => {
                      const currentCats = [...(data.portfolio?.categories || [
                        { id: "all", label: "All Work", iconName: "LayoutGrid" },
                        { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                        { id: "dev", label: "Development", iconName: "Monitor" },
                        { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                      ])];
                      currentCats[cIdx] = { ...currentCats[cIdx], label: e.target.value };
                      setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, categories: currentCats } }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. UX/UI Design"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique Filter ID (Slug)</label>
                  <input
                    type="text"
                    value={cat.id || ""}
                    disabled={cat.id === "all"}
                    onChange={(e) => {
                      const currentCats = [...(data.portfolio?.categories || [
                        { id: "all", label: "All Work", iconName: "LayoutGrid" },
                        { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                        { id: "dev", label: "Development", iconName: "Monitor" },
                        { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                      ])];
                      currentCats[cIdx] = { ...currentCats[cIdx], id: e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, '') };
                      setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, categories: currentCats } }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:border-primary focus:outline-none"
                    placeholder="e.g. design"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tab Icon</label>
                  <select
                    value={cat.iconName || "Award"}
                    disabled={cat.id === "all"}
                    onChange={(e) => {
                      const currentCats = [...(data.portfolio?.categories || [
                        { id: "all", label: "All Work", iconName: "LayoutGrid" },
                        { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                        { id: "dev", label: "Development", iconName: "Monitor" },
                        { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                      ])];
                      currentCats[cIdx] = { ...currentCats[cIdx], iconName: e.target.value };
                      setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, categories: currentCats } }));
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 text-sm focus:border-primary focus:outline-none"
                  >
                    {["LayoutGrid", "Paintbrush", "Search", "Monitor", "BarChart3", "TrendingUp", "Users", "Shield", "Droplet", "Home", "Zap", "Award"].map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end pt-4 md:pt-0">
                  {cat.id !== "all" ? (
                    <button
                      type="button"
                      onClick={() => {
                        const currentCats = (data.portfolio?.categories || [
                          { id: "all", label: "All Work", iconName: "LayoutGrid" },
                          { id: "design", label: "UX/UI Design", iconName: "Paintbrush" },
                          { id: "dev", label: "Development", iconName: "Monitor" },
                          { id: "marketing", label: "Marketing", iconName: "TrendingUp" }
                        ]).filter((_: any, i: number) => i !== cIdx);
                        setData((prev: any) => ({ ...prev, portfolio: { ...prev.portfolio, categories: currentCats } }));
                      }}
                      className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl border border-red-100 transition-all flex items-center gap-1 text-xs font-bold cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Tab
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-200">Default All</span>
                  )}
                </div>

                {/* Bidirectional Project Assignment Checklist */}
                {cat.id !== "all" && (
                  <div className="col-span-1 md:col-span-4 mt-2 border-t border-slate-200/40 pt-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Projects for this Filter:</label>
                    <div className="flex flex-wrap gap-2">
                      {(data.portfolio?.projects || []).map((project: any, pIdx: number) => {
                        const isAssigned = Array.isArray(project.categories)
                          ? project.categories.includes(cat.id)
                          : (project.category && project.category.toLowerCase() === cat.id);
                        return (
                          <label key={pIdx} className="flex items-center gap-1.5 bg-white border border-slate-200/60 hover:border-slate-300 pl-2.5 pr-3 py-1 rounded-xl text-xs font-semibold cursor-pointer select-none shadow-xs">
                            <input
                              type="checkbox"
                              checked={isAssigned}
                              onChange={(e) => {
                                const updatedProjects = [...(data.portfolio?.projects || [])];
                                const proj = { ...updatedProjects[pIdx] };
                                const cats = Array.isArray(proj.categories) ? [...proj.categories] : (proj.category ? [proj.category.toLowerCase()] : []);
                                if (e.target.checked) {
                                  if (!cats.includes(cat.id)) cats.push(cat.id);
                                } else {
                                  const index = cats.indexOf(cat.id);
                                  if (index > -1) cats.splice(index, 1);
                                }
                                proj.categories = cats;
                                updatedProjects[pIdx] = proj;
                                setData((prev: any) => ({
                                  ...prev,
                                  portfolio: {
                                    ...prev.portfolio,
                                    projects: updatedProjects
                                  }
                                }));
                              }}
                              className="w-3.5 h-3.5 border-[#8c8f94] rounded-[3px]"
                            />
                            {project.title || "Untitled Project"}
                          </label>
                        );
                      })}
                      {(!data.portfolio?.projects || data.portfolio.projects.length === 0) && (
                        <p className="text-xs text-slate-400 italic">No projects found. Add projects first in the Projects module.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Work Selector Panel */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            Work Selection
          </h3>
          <ContentSelector
            type="projects"
            label="Featured Projects"
            selectedItems={data.portfolio?.projects || []}
            onSelect={(items) => setData((prev: any) => ({
              ...prev,
              portfolio: {
                ...prev.portfolio,
                projects: items
              }
            }))}
          />
        </div>
      </motion.div>
            )}

      {activeTab === "testimonials" && (
        <motion.div key="testimonials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Testimonials Section</h2>
              <p className="text-gray-500 text-sm mt-1">Configure the headers and stats for the reviews section. (To add/remove actual reviews, use the Reviews sidebar tab).</p>
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Section 6</span>
          </div>

          {/* Intro Panel */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Type className="w-5 h-5 text-primary" />
              Section Headers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Badge</label>
                <input
                  type="text"
                  value={data.testimonials?.section?.badge || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, badge: e.target.value } } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. TESTIMONIALS"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Prefix (plain text)</label>
                <input
                  type="text"
                  value={data.testimonials?.section?.headlinePrefix || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, headlinePrefix: e.target.value } } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all mb-4"
                />
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Highlight (primary color)</label>
                <input
                  type="text"
                  value={data.testimonials?.section?.headlineHighlight || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, headlineHighlight: e.target.value } } }))}
                  className="w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all font-bold mb-4"
                />
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Heading — Suffix (plain text)</label>
                <input
                  type="text"
                  value={data.testimonials?.section?.headlineSuffix || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, headlineSuffix: e.target.value } } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Section Paragraph</label>
                <RichTextEditor
                  content={data.testimonials?.section?.description || ""}
                  onChange={(v) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, description: v } } }))}
                />
              </div>
            </div>
          </div>

          {/* Stats Panel */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              Bottom Highlights & Stats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Featured Platform Text (Next to Google Icon)</label>
                <input
                  type="text"
                  value={data.testimonials?.section?.featured || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, section: { ...prev.testimonials.section, featured: e.target.value } } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. 5.0 Rating on Google"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Subscribers / Customer Count</label>
                <input
                  type="text"
                  value={data.testimonials?.stats?.subscribers || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, testimonials: { ...prev.testimonials, stats: { ...prev.testimonials.stats, subscribers: e.target.value } } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. 500+ Satisfied Customers"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "whyChooseUs" && (
        <motion.div key="whyChooseUs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">How We Work / Why Choose Us</h2>
              <p className="text-gray-500 text-sm mt-1">Manage header narrative, 3 animated circular progress rings, step-by-step workflow, and graphic badge labels.</p>
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Section 7</span>
          </div>

          {/* Section Headers */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">1. Header Narrative</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Badge / Tag</label>
                <input
                  type="text"
                  value={data.whyChooseUs?.sectionTag || data.whyChooseUs?.section?.badge || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, sectionTag: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. HOW WE WORK"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Intro</label>
                <input
                  type="text"
                  value={data.whyChooseUs?.titleIntro || data.whyChooseUs?.section?.headlinePrefix || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, titleIntro: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. Engineered For"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Highlight (Italic Accent)</label>
                <input
                  type="text"
                  value={data.whyChooseUs?.titleHighlight || data.whyChooseUs?.section?.headlineHighlight || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, titleHighlight: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. Peak Performance"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Description Subtext</label>
                <textarea
                  rows={3}
                  value={data.whyChooseUs?.subtext || data.whyChooseUs?.section?.description || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, subtext: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. We combine precision design, rock-solid engineering, and conversion strategy to build digital experiences that deliver real, measurable growth."
                />
              </div>
            </div>
          </div>

          {/* 3 Circular Stats */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">2. Animated Circular Stats (3 Rings)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {((data.whyChooseUs?.stats && data.whyChooseUs.stats.length > 0)
                ? data.whyChooseUs.stats
                : [
                    { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
                    { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
                    { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
                  ]
              ).slice(0, 3).map((stat: any, idx: number) => {
                const currentStats = (data.whyChooseUs?.stats && data.whyChooseUs.stats.length > 0)
                  ? data.whyChooseUs.stats
                  : [
                      { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
                      { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
                      { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
                    ];
                return (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                    <span className="text-xs font-bold text-primary uppercase">Ring Stat #{idx + 1}</span>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 font-bold">Display Value</label>
                      <input
                        type="text"
                        value={stat.value || ""}
                        onChange={(e) => {
                          const newStats = [...currentStats];
                          newStats[idx] = { ...newStats[idx], value: e.target.value };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, stats: newStats } }));
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold focus:border-primary/50 focus:outline-none"
                        placeholder="e.g. 99.8%"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 font-bold">Fill % (0.1 to 1.0)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="1.0"
                        value={stat.percentage ?? 0.85}
                        onChange={(e) => {
                          const newStats = [...currentStats];
                          newStats[idx] = { ...newStats[idx], percentage: parseFloat(e.target.value) || 0.85 };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, stats: newStats } }));
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary/50 focus:outline-none"
                        placeholder="0.95"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 font-bold">Label</label>
                      <input
                        type="text"
                        value={stat.label || ""}
                        onChange={(e) => {
                          const newStats = [...currentStats];
                          newStats[idx] = { ...newStats[idx], label: e.target.value };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, stats: newStats } }));
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary/50 focus:outline-none"
                        placeholder="e.g. Satisfaction"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-gray-500 font-bold">Sublabel</label>
                      <input
                        type="text"
                        value={stat.sublabel || ""}
                        onChange={(e) => {
                          const newStats = [...currentStats];
                          newStats[idx] = { ...newStats[idx], sublabel: e.target.value };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, stats: newStats } }));
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:border-primary/50 focus:outline-none"
                        placeholder="e.g. Verified Reviews"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workflow Steps / Reasons */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">3. Process Steps & Features</h3>
              <button
                onClick={() => {
                  const currentReasons = (data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                    ? data.whyChooseUs.reasons
                    : (data.whyChooseUs?.features || []);
                  const nextNum = String(currentReasons.length + 1).padStart(2, "0");
                  const newReasons = [...currentReasons, { num: nextNum, title: "New Workflow Step", desc: "Description here...", iconName: "Sparkles" }];
                  setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                }}
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                + Add Step
              </button>
            </div>
            <div className="space-y-4">
              {((data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                ? data.whyChooseUs.reasons
                : (data.whyChooseUs?.features && data.whyChooseUs.features.length > 0
                    ? data.whyChooseUs.features.map((f: any, idx: number) => ({
                        num: String(idx + 1).padStart(2, "0"),
                        title: f.title,
                        desc: f.description,
                        iconName: f.icon || "Sparkles"
                      }))
                    : [
                        { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles" },
                        { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal" },
                        { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap" },
                        { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp" },
                        { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake" }
                      ])
              ).map((reason: any, idx: number) => {
                const currentReasons = (data.whyChooseUs?.reasons && data.whyChooseUs.reasons.length > 0)
                  ? data.whyChooseUs.reasons
                  : (data.whyChooseUs?.features && data.whyChooseUs.features.length > 0
                      ? data.whyChooseUs.features.map((f: any, i: number) => ({
                          num: String(i + 1).padStart(2, "0"),
                          title: f.title,
                          desc: f.description,
                          iconName: f.icon || "Sparkles"
                        }))
                      : [
                          { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles" },
                          { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal" },
                          { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap" },
                          { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp" },
                          { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake" }
                        ]);
                return (
                  <div key={idx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 relative group space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-800">Step #{idx + 1} ({reason.num || `0${idx+1}`})</span>
                      <button
                        onClick={() => {
                          const newReasons = currentReasons.filter((_: any, i: number) => i !== idx);
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                        }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Number</label>
                        <input
                          type="text"
                          value={reason.num || ""}
                          onChange={(e) => {
                            const newReasons = [...currentReasons];
                            newReasons[idx] = { ...newReasons[idx], num: e.target.value };
                            setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono font-bold focus:border-primary/50 focus:outline-none"
                          placeholder="01"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Title</label>
                        <input
                          type="text"
                          value={reason.title || ""}
                          onChange={(e) => {
                            const newReasons = [...currentReasons];
                            newReasons[idx] = { ...newReasons[idx], title: e.target.value };
                            setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. Strategy & Discovery"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Icon</label>
                        <select
                          value={reason.iconName || reason.icon || "Sparkles"}
                          onChange={(e) => {
                            const newReasons = [...currentReasons];
                            newReasons[idx] = { ...newReasons[idx], iconName: e.target.value, icon: e.target.value };
                            setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                        >
                          <option value="Sparkles">Sparkles</option>
                          <option value="Terminal">Terminal</option>
                          <option value="Zap">Zap</option>
                          <option value="TrendingUp">TrendingUp</option>
                          <option value="HeartHandshake">HeartHandshake</option>
                          <option value="Rocket">Rocket</option>
                          <option value="Paintbrush">Paintbrush</option>
                          <option value="Shield">Shield</option>
                          <option value="Search">Search</option>
                          <option value="Users">Users</option>
                          <option value="Award">Award</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase text-gray-500 font-bold">Description</label>
                      <textarea
                        rows={2}
                        value={reason.desc || reason.description || ""}
                        onChange={(e) => {
                          const newReasons = [...currentReasons];
                          newReasons[idx] = { ...newReasons[idx], desc: e.target.value, description: e.target.value };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                        }}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                        placeholder="Detailed description of this workflow step..."
                      />
                    </div>
                    <div className="space-y-1 pt-2 border-t border-gray-200">
                      <ImageField
                        label="Step Image (Replaces SVG)"
                        value={reason.image || ""}
                        onChange={(url) => {
                          const newReasons = [...currentReasons];
                          newReasons[idx] = { ...newReasons[idx], image: url };
                          setData((prev: any) => ({ ...prev, whyChooseUs: { ...prev.whyChooseUs, reasons: newReasons } }));
                        }}
                        description="Upload or choose an image for this workflow step from the Media Library"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graphic Illustration Badges */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">4. Illustration Graphic Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Terminal Score Badge</label>
                <input
                  type="text"
                  value={data.whyChooseUs?.illustrations?.scoreLabel || "100"}
                  onChange={(e) => setData((prev: any) => ({
                    ...prev,
                    whyChooseUs: {
                      ...prev.whyChooseUs,
                      illustrations: { ...(prev.whyChooseUs?.illustrations || {}), scoreLabel: e.target.value }
                    }
                  }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. 100"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Support Rating Badge</label>
                <input
                  type="text"
                  value={data.whyChooseUs?.illustrations?.ratingLabel || "5.0 ★★★★★"}
                  onChange={(e) => setData((prev: any) => ({
                    ...prev,
                    whyChooseUs: {
                      ...prev.whyChooseUs,
                      illustrations: { ...(prev.whyChooseUs?.illustrations || {}), ratingLabel: e.target.value }
                    }
                  }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. 5.0 ★★★★★"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "serviceArea" && (
        <motion.div key="serviceArea" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Service Area (Global Coverage Map)</h2>
              <p className="text-gray-500 text-sm mt-1">Manage global coverage narrative, world map graphic, and interactive location pins with coordinates.</p>
            </div>
            <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">Global Map</span>
          </div>

          {/* Section Headers */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">1. Header Narrative</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Badge / Tag</label>
                <input
                  type="text"
                  value={data.serviceArea?.sectionTag || "GLOBAL COVERAGE"}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), sectionTag: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. GLOBAL COVERAGE"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Intro</label>
                <input
                  type="text"
                  value={data.serviceArea?.titleIntro || "Serving Clients"}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), titleIntro: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. Serving Clients"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Headline Highlight (Accent Italic)</label>
                <input
                  type="text"
                  value={data.serviceArea?.titleHighlight || "Worldwide"}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), titleHighlight: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm font-bold text-primary focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. Worldwide"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Description</label>
                <textarea
                  rows={3}
                  value={data.serviceArea?.description || ""}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), description: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                  placeholder="e.g. With distributed engineering hubs and round-the-clock availability, we partner with industry leaders across North America, Europe, the Middle East, and Asia-Pacific."
                />
              </div>
            </div>
          </div>

          {/* CTA Settings */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">2. CTA Button</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Button Text</label>
                <input
                  type="text"
                  value={data.serviceArea?.ctaText || "Schedule Global Consultation"}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), ctaText: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Button Link</label>
                <input
                  type="text"
                  value={data.serviceArea?.ctaHref || "#contact"}
                  onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), ctaHref: e.target.value } }))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
                />
              </div>
            </div>
          </div>

          {/* Map Graphic */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">3. World Map Image</h3>
            <ImageField
              label="World Map Graphic"
              value={data.serviceArea?.mapSrc || "https://res.cloudinary.com/dyt4m9t6k/image/upload/v1723467823/world-map_h1y3qk.svg"}
              onChange={(url) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), mapSrc: url } }))}
              description="Upload or choose a world map graphic from your Media Library"
            />
            <div className="space-y-2 mt-4">
              <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">Map Image Alt Text</label>
              <input
                type="text"
                value={data.serviceArea?.mapAlt || "Global Service Locations Map"}
                onChange={(e) => setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), mapAlt: e.target.value } }))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Hubs / Pin Locations */}
          <div className="bg-white shadow-sm border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">4. Global Hubs & Location Pins</h3>
                <p className="text-xs text-gray-500">X % and Y % set the exact position of the pin dot on the world map.</p>
              </div>
              <button
                onClick={() => {
                  const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                    ? data.serviceArea.hubs
                    : [
                      { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", x: "27.27%", y: "29.72%" },
                      { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", x: "24.63%", y: "33.63%" },
                      { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", x: "45.97%", y: "45.21%" },
                      { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", x: "49.66%", y: "43.78%" },
                      { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", x: "49.00%", y: "47.84%" },
                      { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", x: "46.49%", y: "46.30%" },
                      { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", x: "50.53%", y: "50.18%" },
                      { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", x: "51.07%", y: "44.34%" },
                      { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", x: "48.27%", y: "44.90%" },
                      { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", x: "26.67%", y: "77.03%" },
                      { id: "bh", name: "Bahrain / GCC", focus: "MENA Regional Hub", timezone: "AST", x: "61.08%", y: "58.22%" },
                      { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", x: "82.34%", y: "82.47%" }
                    ];
                  const newHub = { id: `hub-${Date.now()}`, name: "New Hub Location", focus: "Engineering Hub", timezone: "UTC", x: "50%", y: "50%" };
                  setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: [...currentHubs, newHub] } }));
                }}
                className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg font-semibold transition-colors"
              >
                + Add Hub Pin
              </button>
            </div>

            <div className="space-y-4">
              {((data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                ? data.serviceArea.hubs
                : [
                  { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", x: "27.27%", y: "29.72%" },
                  { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", x: "24.63%", y: "33.63%" },
                  { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", x: "45.97%", y: "45.21%" },
                  { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", x: "49.66%", y: "43.78%" },
                  { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", x: "49.00%", y: "47.84%" },
                  { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", x: "46.49%", y: "46.30%" },
                  { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", x: "50.53%", y: "50.18%" },
                  { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", x: "51.07%", y: "44.34%" },
                  { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", x: "48.27%", y: "44.90%" },
                  { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", x: "26.67%", y: "77.03%" },
                  { id: "bh", name: "Bahrain / GCC", focus: "MENA Regional Hub", timezone: "AST", x: "61.08%", y: "58.22%" },
                  { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", x: "82.34%", y: "82.47%" }
                ]
              ).map((hub: any, hIdx: number) => {
                const currentHubs = (data.serviceArea?.hubs && data.serviceArea.hubs.length > 0)
                  ? data.serviceArea.hubs
                  : [
                    { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", x: "27.27%", y: "29.72%" },
                    { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", x: "24.63%", y: "33.63%" },
                    { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", x: "45.97%", y: "45.21%" },
                    { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", x: "49.66%", y: "43.78%" },
                    { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", x: "49.00%", y: "47.84%" },
                    { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", x: "46.49%", y: "46.30%" },
                    { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", x: "50.53%", y: "50.18%" },
                    { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", x: "51.07%", y: "44.34%" },
                    { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", x: "48.27%", y: "44.90%" },
                    { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", x: "26.67%", y: "77.03%" },
                    { id: "bh", name: "Bahrain / GCC", focus: "MENA Regional Hub", timezone: "AST", x: "61.08%", y: "58.22%" },
                    { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", x: "82.34%", y: "82.47%" }
                  ];
                return (
                  <div key={hIdx} className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3 relative group">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-xs font-bold text-gray-800">Pin #{hIdx + 1}: {hub.name}</span>
                      <button
                        onClick={() => {
                          const newHubs = currentHubs.filter((_: any, i: number) => i !== hIdx);
                          setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                        }}
                        className="text-xs font-semibold text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Country / Hub Name</label>
                        <input
                          type="text"
                          value={hub.name || ""}
                          onChange={(e) => {
                            const newHubs = [...currentHubs];
                            newHubs[hIdx] = { ...newHubs[hIdx], name: e.target.value };
                            setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. United States"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Specialty / Focus</label>
                        <input
                          type="text"
                          value={hub.focus || ""}
                          onChange={(e) => {
                            const newHubs = [...currentHubs];
                            newHubs[hIdx] = { ...newHubs[hIdx], focus: e.target.value };
                            setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. Architecture & Design"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Timezone</label>
                        <input
                          type="text"
                          value={hub.timezone || ""}
                          onChange={(e) => {
                            const newHubs = [...currentHubs];
                            newHubs[hIdx] = { ...newHubs[hIdx], timezone: e.target.value };
                            setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. EST / PST"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Map X Coord (%)</label>
                        <input
                          type="text"
                          value={hub.x || ""}
                          onChange={(e) => {
                            const newHubs = [...currentHubs];
                            newHubs[hIdx] = { ...newHubs[hIdx], x: e.target.value };
                            setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. 27.27%"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold">Map Y Coord (%)</label>
                        <input
                          type="text"
                          value={hub.y || ""}
                          onChange={(e) => {
                            const newHubs = [...currentHubs];
                            newHubs[hIdx] = { ...newHubs[hIdx], y: e.target.value };
                            setData((prev: any) => ({ ...prev, serviceArea: { ...(prev.serviceArea || {}), hubs: newHubs } }));
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono focus:border-primary/50 focus:outline-none"
                          placeholder="e.g. 29.72%"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === "quote" && (
        <motion.div key="quote" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-200 pb-4">Homepage Contact Section (QA Form)</h2>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Badge</label>
              <input
                type="text"
                value={data.quote?.section?.badge || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), section: { ...(prev.quote?.section || {}), badge: e.target.value } } }))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Title — Prefix (plain text)</label>
              <input
                type="text"
                value={data.quote?.section?.headlinePrefix || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), section: { ...(prev.quote?.section || {}), headlinePrefix: e.target.value } } }))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Title — Highlight (primary color)</label>
              <input
                type="text"
                value={data.quote?.section?.headlineHighlight || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), section: { ...(prev.quote?.section || {}), headlineHighlight: e.target.value } } }))}
                className="w-full bg-white border border-primary/30 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Title — Suffix (plain text)</label>
              <input
                type="text"
                value={data.quote?.section?.headlineSuffix || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), section: { ...(prev.quote?.section || {}), headlineSuffix: e.target.value } } }))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Section Description</label>
              <RichTextEditor
                content={data.quote?.section?.description || ""}
                onChange={(v) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), section: { ...(prev.quote?.section || {}), description: v } } }))}
              />
            </div>
            <div className="space-y-2 pt-4 border-t border-gray-100">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Receiver Email</label>
              <input
                type="email"
                value={data.quote?.email || ""}
                onChange={(e) => setData((prev: any) => ({ ...prev, quote: { ...(prev.quote || {}), email: e.target.value } }))}
                placeholder="Email for submissions"
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-slate-900 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none shadow-sm transition-all"
              />
            </div>
          </div>
        </motion.div>
      )}
      {activeTab === "faq" && (
        <motion.div key="faq" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 border-b border-slate-100 pb-6">FAQ Section</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
              <input
                type="text"
                value={data.faq?.section?.badge || ""}
                onChange={(e) => {
                  setData((prev: any) => ({
                    ...prev,
                    faq: { ...prev.faq, section: { ...prev.faq.section, badge: e.target.value } }
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                placeholder="e.g. QUESTIONS"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Heading</label>
              <input
                type="text"
                value={data.faq?.section?.title || ""}
                onChange={(e) => {
                  setData((prev: any) => ({
                    ...prev,
                    faq: { ...prev.faq, section: { ...prev.faq.section, title: e.target.value } }
                  }));
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                placeholder="e.g. Frequently Asked Questions"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Paragraph</label>
              <RichTextEditor
                content={data.faq?.section?.description || ""}
                onChange={(v) => {
                  setData((prev: any) => ({
                    ...prev,
                    faq: { ...prev.faq, section: { ...prev.faq.section, description: v } }
                  }));
                }}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100">
            <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">!</div>
              <p className="text-slate-600 text-sm font-medium">
                Note: This tab only controls the header text on the homepage. To add or edit the actual FAQ questions, go to
                <Link href="/admin/faq" className="text-primary font-bold hover:underline ml-1">FAQ Management</Link> in the sidebar.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
        </div >
      </div >
    </div >
  );
}
