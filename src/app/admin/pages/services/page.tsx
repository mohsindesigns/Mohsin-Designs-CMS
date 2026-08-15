"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, Type, ChevronRight, Layout, Plus,
  TrendingUp, Sparkles, Star, Clock, Home as HomeIcon,
  Shield, Award, Users, BadgeCheck, HelpCircle, Image as ImageIcon,
  BookOpen, Trash2, ChevronUp, ChevronDown, CircleHelp, Pencil, Copy,
  CheckCircle, Hammer, ArrowRight, ExternalLink, Search
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import Link from "next/link";
import BlogSelector from "@/components/admin/BlogSelector";
import ImageField from "@/components/admin/ImageField";
import SeoEditor from "@/components/admin/SeoEditor";
import dynamic from "next/dynamic";

const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-48 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Editor...</div>
});

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-20 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

const ICON_LIST = Array.from(new Set([
  "Home", "Layout", "Building2", "Building", "Droplets", "Shield", "ShieldCheck",
  "Award", "Clock", "BadgeCheck", "TrendingUp", "Star", "Zap", "Sparkles",
  "Palette", "Sun", "Snowflake", "Trophy", "Hammer", "Truck", "ClipboardCheck",
  "FileText", "ArrowRight", "CheckCircle", "Check", "Wrench", "HardHat",
  "Ruler", "Paintbrush", "Wind", "Flame", "Thermometer", "Users",
  "Shovel", "Fence", "Drill", "Square", "Box", "Construction", "Tool",
  "Map", "MapPin", "Search", "Settings", "Phone", "Mail", "Globe", "Layers",
  "Warehouse", "Factory", "Store", "Landmark", "Castle", "Mountain", "Trees",
  "Droplet", "FlameKindling", "Lightbulb", "Power",
  "WashingMachine", "Microwave", "Speaker", "Camera", "Video", "Monitor",
  "Smartphone", "Tablet", "Laptop", "Headphones", "Wallet", "CreditCard",
  "ShoppingCart", "Gift", "Coffee", "Utensils", "Pizza", "Beer",
  "Activity", "Anchor", "Aperture", "Archive", "AtSign", "Bell", "Bluetooth",
  "Book", "Bookmark", "Briefcase", "Calendar", "Cast", "Cloud", "Code",
  "Compass", "Copy", "Cpu", "Database", "Disc", "Download", "Edit", "ExternalLink",
  "Eye", "Facebook", "Feather", "File", "Filter", "Flag", "Folder",
  "Github", "Gitlab", "Grid", "HardDrive", "Hash", "Heart", "HelpCircle",
  "Image", "Inbox", "Instagram", "Key", "LifeBuoy", "Link", "Linkedin",
  "List", "Loader", "Lock", "LogIn", "LogOut", "Maximize", "Menu", "MessageCircle",
  "MessageSquare", "Mic", "Minimize", "Minus", "Moon", "MoreHorizontal", "MoreVertical",
  "MousePointer", "Music", "Navigation", "Octagon", "Package", "Paperclip", "Pause",
  "Percent", "PieChart", "Play", "Plus", "Pocket", "Printer", "Radio",
  "RefreshCcw", "Repeat", "Rewind", "RotateCcw", "RotateCw", "Rss", "Save", "Scissors",
  "Send", "Server", "Share", "ShoppingBag",
  "Shuffle", "SkipBack", "SkipForward", "Slack", "Sliders", "Smile", 
  "Sunrise", "Sunset", "Tag",
  "Target", "Terminal", "ThumbsDown", "ThumbsUp", "ToggleLeft",
  "ToggleRight", "Trash", "Trello", "TrendingDown", "Triangle",
  "Tv", "Twitter", "Type", "Umbrella", "Underline", "Unlock", "Upload", "User",
  "Voicemail", "Volume", "Watch", "Wifi", "X", "Youtube"
]));

const IconComponentMap: Record<string, any> = LucideIcons;

function IconSelector({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const SelectedIcon = IconComponentMap[value] || CircleHelp;

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold hover:border-slate-300 transition-all text-slate-700 shadow-sm"
      >
        <SelectedIcon className="w-4 h-4 text-slate-500" />
        <span>{value || "Select Icon"}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 z-50 mt-2 w-72 bg-white border border-slate-200 shadow-xl p-4 rounded-2xl">
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto pr-1">
            {ICON_LIST.map((iconName) => {
              const IconComp = IconComponentMap[iconName];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-2 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors ${
                    value === iconName ? "bg-primary text-white hover:bg-primary" : "text-slate-600"
                  }`}
                  title={iconName}
                >
                  {IconComp ? (
                    <IconComp className="w-4 h-4" />
                  ) : (
                    <div className="w-4 h-4 border border-dashed rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const POPULAR_ICONS = [
  "Clock", "Home", "BadgeCheck", "Shield", "Users", "Award", "Star",
  "ThumbsUp", "Trophy", "Wrench", "HardHat", "Sparkles", "Construction"
];

export default function ServicesPageEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load content:", err));
  }, []);

  const handleSave = async () => {
    // Validate bulk FAQ JSON-LD schema markup
    const bulkSchema = (data?.services?.faqSchemaMarkup || "").trim();
    if (bulkSchema) {
      try {
        let cleaned = bulkSchema;
        if (cleaned.startsWith("<script")) {
          const closeBracket = cleaned.indexOf(">");
          if (closeBracket !== -1) cleaned = cleaned.substring(closeBracket + 1);
        }
        if (cleaned.endsWith("</script>")) {
          cleaned = cleaned.substring(0, cleaned.length - 9);
        }
        JSON.parse(cleaned.trim());
      } catch (e) {
        alert("Invalid JSON in FAQ Schema Markup. Please correct it before saving.");
        return;
      }
    }


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
      } else {
        setMessage("Failed to save changes.");
      }
    } catch (err) {
      console.error("Save failed:", err);
      setMessage("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      services: {
        ...prev.services,
        hero: {
          ...prev.services?.hero,
          [field]: value
        }
      }
    }));
  };

  const updateStatsSection = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      services: {
        ...prev.services,
        statsSection: {
          ...prev.services?.statsSection,
          [field]: value
        }
      }
    }));
  };

  const updateGridSection = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      services: {
        ...prev.services,
        gridSection: {
          ...prev.services?.gridSection,
          [field]: value
        }
      }
    }));
  };

  const updateCta = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      services: {
        ...prev.services,
        cta: {
          ...prev.services?.cta,
          [field]: value
        }
      }
    }));
  };

  const updateBlogSection = (field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      services: {
        ...prev.services,
        blogSection: {
          ...prev.services?.blogSection,
          [field]: value
        }
      }
    }));
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    setData((prev: any) => {
      const newFaqs = [...(prev.services?.faqs || [])];
      if (!newFaqs[index]) newFaqs[index] = { question: "", answer: "" };
      newFaqs[index] = { ...newFaqs[index], [field]: value };
      return {
        ...prev,
        services: {
          ...prev.services,
          faqs: newFaqs
        }
      };
    });
  };

  const addFaqItem = () => {
    setData((prev: any) => {
      const newFaqs = [...(prev.services?.faqs || [])];
      newFaqs.push({ question: "", answer: "" });
      return {
        ...prev,
        services: {
          ...prev.services,
          faqs: newFaqs
        }
      };
    });
  };

  const removeFaqItem = (index: number) => {
    setData((prev: any) => {
      const newFaqs = (prev.services?.faqs || []).filter((_: any, i: number) => i !== index);
      return {
        ...prev,
        services: {
          ...prev.services,
          faqs: newFaqs
        }
      };
    });
  };

  const moveFaq = (index: number, direction: 'up' | 'down') => {
    setData((prev: any) => {
      const newFaqs = [...(prev.services?.faqs || [])];
      if (direction === 'up' && index > 0) {
        const temp = newFaqs[index];
        newFaqs[index] = newFaqs[index - 1];
        newFaqs[index - 1] = temp;
      } else if (direction === 'down' && index < newFaqs.length - 1) {
        const temp = newFaqs[index];
        newFaqs[index] = newFaqs[index + 1];
        newFaqs[index + 1] = temp;
      }
      return {
        ...prev,
        services: {
          ...prev.services,
          faqs: newFaqs
        }
      };
    });
  };

  const updateStatItem = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const stats = [...(prev.services?.stats || [
        { value: "50", suffix: "+", label: "Years Combined Experience", description: "Industry expertise across our team", icon: "Clock" },
        { value: "1,000", suffix: "+", label: "Homes Transformed", description: "Satisfied homeowners", icon: "Home" },
        { value: "100", suffix: "%", label: "Veteran Owned", description: "Proudly serving our community", icon: "BadgeCheck" },
        { value: "10", suffix: "YR", label: "Year Workmanship Guarantee", description: "Peace of mind guaranteed", icon: "Shield" }
      ])];
      if (!stats[index]) stats[index] = {};
      stats[index] = { ...stats[index], [field]: value };
      return {
        ...prev,
        services: {
          ...prev.services,
          stats
        }
      };
    });
  };

  const updateTrustBadgeItem = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const trustBadges = [...(prev.services?.statsSection?.trustBadges || [
        { icon: "Users", text: "500+ 5-Star Reviews" },
        { icon: "Award", text: "A+ BBB Rating" },
        { icon: "Star", text: "Top Rated Contractor" }
      ])];
      if (!trustBadges[index]) trustBadges[index] = {};
      trustBadges[index] = { ...trustBadges[index], [field]: value };
      return {
        ...prev,
        services: {
          ...prev.services,
          statsSection: {
            ...prev.services?.statsSection,
            trustBadges
          }
        }
      };
    });
  };

  if (!data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallbacks for data structures
  const hero = data.services?.hero || {
    backgroundImage: "",
    breadcrumbText: "Services",
    title: "Our Services",
    description: "Comprehensive home improvement solutions with military precision and architectural excellence."
  };

  const statsSection = data.services?.statsSection || {
    badge: "Our Impact",
    headline: "Trusted by Homeowners<br class='hidden sm:block'/><span class='text-primary'> Across the Region</span>",
    description: "Numbers speak louder than words. Here's what we've achieved together with our valued customers.",
    trustBadges: [
      { icon: "Users", text: "500+ 5-Star Reviews" },
      { icon: "Award", text: "A+ BBB Rating" },
      { icon: "Star", text: "Top Rated Contractor" }
    ]
  };

  const stats = data.services?.stats || [
    { value: "50", suffix: "+", label: "Years Combined Experience", description: "Industry expertise across our team", icon: "Clock" },
    { value: "1,000", suffix: "+", label: "Homes Transformed", description: "Satisfied homeowners", icon: "Home" },
    { value: "100", suffix: "%", label: "Veteran Owned", description: "Proudly serving our community", icon: "BadgeCheck" },
    { value: "10", suffix: "YR", label: "Year Workmanship Guarantee", description: "Peace of mind guaranteed", icon: "Shield" }
  ];

  const gridSection = data.services?.gridSection || {
    badge: "Eagle Revolution",
    headline: "World Class <span class='text-primary'>Capabilities</span>",
    description: "Every detail matters when it comes to structural integrity. Our team brings military-grade standards to every project across the St. Louis area."
  };

  const cta = data.services?.cta || {
    ratingText: "500+ 5-Star Reviews",
    title: "Ready for Your Free Estimate?",
    description: "Transform your home with St. Louis's expert builders. Contact us today for quality craftsmanship and unparalleled service.",
    buttonText: "Get Free Estimate",
    buttonLink: "/contact-us"
  };

  const blogSection = data.services?.blogSection || {
    title: "Latest from the Blog",
    subtitle: "Insights & News",
    description: "Stay updated with the latest trends, tips, and news from the roofing and construction industry.",
    selectedPosts: []
  };

  const faqs = data.services?.faqs || [];

  const tabs = [
    { id: "hero", label: "Hero Banner", icon: Layout },
    { id: "stats", label: "Our Impact (Stats)", icon: TrendingUp },
    { id: "capabilities", label: "Capabilities Header", icon: Type },
    { id: "blog", label: "Featured Blog Posts", icon: BookOpen },
    { id: "faqs", label: "Page FAQs", icon: HelpCircle },
    { id: "cta", label: "Call to Action (CTA)", icon: Sparkles }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
            <Link href="/admin/pages" className="hover:text-primary transition-colors">Pages</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-bold">Services Page</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Services Page Editor</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl mb-8 text-center font-bold ${
            message.includes("successfully") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Tabs Control */}
      <div className="flex flex-wrap gap-2 mb-8 bg-slate-100 p-2 rounded-2xl border border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? "bg-white text-primary shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Forms Area */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <AnimatePresence mode="wait">
          {activeTab === "hero" && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Layout className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Hero Banner Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1.5">
                    Breadcrumb Text
                  </label>
                  <input
                    type="text"
                    value={hero.breadcrumbText || ""}
                    onChange={(e) => updateHero("breadcrumbText", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Services"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1.5">
                    Background Image URL
                  </label>
                  <input
                    type="text"
                    value={hero.backgroundImage || ""}
                    onChange={(e) => updateHero("backgroundImage", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. /assets/Breadcrumb-Image.jpeg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Hero Title</label>
                <input
                  type="text"
                  value={hero.title || ""}
                  onChange={(e) => updateHero("title", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                  placeholder="e.g. Our Services"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Hero Description</label>
                <textarea
                  rows={4}
                  value={Array.isArray(hero.description) ? hero.description.join("\n") : (hero.description || "")}
                  onChange={(e) => updateHero("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none"
                  placeholder="Enter high-level banner description..."
                />
              </div>
            </motion.div>
          )}

          {activeTab === "stats" && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Our Impact (Stats) Section</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
                  <input
                    type="text"
                    value={statsSection.badge || ""}
                    onChange={(e) => updateStatsSection("badge", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Our Impact"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1">
                    Headline
                    <span className="text-[10px] text-slate-400 normal-case font-medium">(HTML Tag Support)</span>
                  </label>
                  <input
                    type="text"
                    value={statsSection.headline || ""}
                    onChange={(e) => updateStatsSection("headline", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Trusted by Homeowners <span class='text-primary'>Across Region</span>"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Description</label>
                <textarea
                  rows={3}
                  value={statsSection.description || ""}
                  onChange={(e) => updateStatsSection("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none"
                  placeholder="Enter stats section overview description..."
                />
              </div>

              {/* Metric Cards */}
              <div className="space-y-6 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Metric Counters (4 Grid Items)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {stats.slice(0, 4).map((stat: any, index: number) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase text-primary tracking-wider">Stat Card #{index + 1}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Icon</label>
                          <select
                            value={stat.icon || "Clock"}
                            onChange={(e) => updateStatItem(index, "icon", e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg text-xs font-bold p-1 outline-none text-slate-700 focus:ring-1 focus:ring-primary"
                          >
                            {POPULAR_ICONS.map((iconName) => (
                              <option key={iconName} value={iconName}>{iconName}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Value (Number)</label>
                          <input
                            type="text"
                            value={stat.value || ""}
                            onChange={(e) => updateStatItem(index, "value", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. 50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-500">Suffix</label>
                          <input
                            type="text"
                            value={stat.suffix || ""}
                            onChange={(e) => updateStatItem(index, "suffix", e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                            placeholder="e.g. + / % / YR"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Label</label>
                        <input
                          type="text"
                          value={stat.label || ""}
                          onChange={(e) => updateStatItem(index, "label", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. Years Combined Experience"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-500">Subtext Description</label>
                        <input
                          type="text"
                          value={stat.description || ""}
                          onChange={(e) => updateStatItem(index, "description", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. Industry expertise across our team"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust Badges */}
              <div className="space-y-4 pt-6 border-t border-slate-100">
                <h3 className="text-lg font-bold text-slate-900">Trust Badges (3 items)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {(statsSection.trustBadges || [
                    { icon: "Users", text: "500+ 5-Star Reviews" },
                    { icon: "Award", text: "A+ BBB Rating" },
                    { icon: "Star", text: "Top Rated Contractor" }
                  ]).slice(0, 3).map((badge: any, index: number) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                      <span className="text-[10px] font-black uppercase text-primary tracking-wider">Badge #{index + 1}</span>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Icon</label>
                        <select
                          value={badge.icon || "Star"}
                          onChange={(e) => updateTrustBadgeItem(index, "icon", e.target.value)}
                          className="bg-white w-full border border-slate-200 rounded-xl text-xs font-bold p-2.5 outline-none text-slate-700 focus:ring-1 focus:ring-primary"
                        >
                          {POPULAR_ICONS.map((iconName) => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-slate-400 block">Badge Text</label>
                        <input
                          type="text"
                          value={badge.text || ""}
                          onChange={(e) => updateTrustBadgeItem(index, "text", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-primary/20"
                          placeholder="e.g. A+ BBB Rating"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "capabilities" && (
            <motion.div
              key="capabilities"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Type className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Capabilities Header Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Badge</label>
                  <input
                    type="text"
                    value={gridSection.badge || ""}
                    onChange={(e) => updateGridSection("badge", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Eagle Revolution"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold flex items-center gap-1">
                    Headline
                    <span className="text-[10px] text-slate-400 normal-case font-medium">(HTML Tag Support)</span>
                  </label>
                  <input
                    type="text"
                    value={gridSection.headline || ""}
                    onChange={(e) => updateGridSection("headline", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. World Class <span class='text-primary'>Capabilities</span>"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Description</label>
                <textarea
                  rows={4}
                  value={gridSection.description || ""}
                  onChange={(e) => updateGridSection("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none"
                  placeholder="Enter capabilities section description..."
                />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-slate-600 text-sm font-medium">
                    Note: To edit, create, or rearrange the individual capability cards (like Roofing, Windows, siding etc.), go to the 
                    <Link href="/admin/services" className="text-primary font-bold hover:underline ml-1">Services Management</Link> section.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "blog" && (
            <motion.div
              key="blog"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Featured Blog Posts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Title</label>
                  <input
                    type="text"
                    value={blogSection.title || ""}
                    onChange={(e) => updateBlogSection("title", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Latest from the Blog"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Subtitle</label>
                  <input
                    type="text"
                    value={blogSection.subtitle || ""}
                    onChange={(e) => updateBlogSection("subtitle", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Insights & News"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Section Description</label>
                <textarea
                  rows={3}
                  value={blogSection.description || ""}
                  onChange={(e) => updateBlogSection("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none"
                  placeholder="Enter blog section description..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Selected Blogs</label>
                <BlogSelector
                  selectedIds={blogSection.selectedPosts || []}
                  onChange={(ids) => updateBlogSection("selectedPosts", ids)}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "faqs" && (
            <motion.div
              key="faqs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Page-Specific FAQs</h2>
                </div>
                <button
                  type="button"
                  onClick={addFaqItem}
                  className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add FAQ Item
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl">
                  <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 font-medium">No page-specific FAQs configured.</p>
                  <p className="text-xs text-slate-400 mt-1">Click the button above to add some FAQ items or it will fallback to global FAQs.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faqItem: any, index: number) => (
                    <div key={index} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative group">
                      <div className="flex items-center justify-between mb-4 border-b border-slate-200/60 pb-3">
                        <span className="text-xs font-black uppercase text-primary tracking-wider">FAQ #{index + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveFaq(index, 'up')}
                            disabled={index === 0}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 disabled:opacity-30 transition-all"
                            title="Move Up"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveFaq(index, 'down')}
                            disabled={index === faqs.length - 1}
                            className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 disabled:opacity-30 transition-all"
                            title="Move Down"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFaqItem(index)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                            title="Delete FAQ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Question</label>
                          <RichTextEditor
                            content={faqItem.question || ""}
                            onChange={(val) => updateFaqItem(index, "question", val)}
                            placeholder="e.g. What types of roofing services do you offer?"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Answer</label>
                          <RichTextEditor
                            content={faqItem.answer || ""}
                            onChange={(val) => updateFaqItem(index, "answer", val)}
                            placeholder="e.g. We provide comprehensive roofing services, including residential roofing, TPO commercial roofing, roof inspections, and repairs."
                          />
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setData((prev: any) => {
                                const newFaqs = prev.services?.faqs?.filter((_: any, i: number) => i !== index) || [];
                                return {
                                  ...prev,
                                  services: {
                                    ...prev.services,
                                    faqs: newFaqs
                                  }
                                };
                              });
                            }}
                            className="flex items-center gap-2 text-rose-500 hover:text-rose-600 text-xs font-semibold uppercase tracking-wider transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Remove FAQ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="space-y-2 mt-8 pt-6 border-t border-slate-200">
                    <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">FAQ Schema Markup (Bulk JSON-LD)</label>
                    <p className="text-[11px] text-[#646970]">Paste a single JSON-LD schema block covering all FAQs for this page.</p>
                    <textarea
                      rows={8}
                      value={data?.services?.faqSchemaMarkup || ""}
                      onChange={(e) => {
                        setData((prev: any) => ({
                          ...prev,
                          services: {
                            ...prev.services,
                            faqSchemaMarkup: e.target.value
                          }
                        }));
                      }}
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-mono focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                      placeholder='e.g. {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...]}'
                    />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "cta" && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Call to Action Settings</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Rating/Stars Subtitle</label>
                  <input
                    type="text"
                    value={cta.ratingText || ""}
                    onChange={(e) => updateCta("ratingText", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. 500+ 5-Star Reviews"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Headline</label>
                  <input
                    type="text"
                    value={cta.title || ""}
                    onChange={(e) => updateCta("title", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Ready for Your Free Estimate?"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">CTA Description</label>
                <textarea
                  rows={4}
                  value={cta.description || ""}
                  onChange={(e) => updateCta("description", e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner resize-none"
                  placeholder="Enter bottom CTA text..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Button Label</label>
                  <input
                    type="text"
                    value={cta.buttonText || ""}
                    onChange={(e) => updateCta("buttonText", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. Get Free Estimate"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500 font-extrabold">Button Link</label>
                  <input
                    type="text"
                    value={cta.buttonLink || ""}
                    onChange={(e) => updateCta("buttonLink", e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-inner"
                    placeholder="e.g. /contact"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
