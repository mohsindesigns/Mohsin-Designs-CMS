"use client";

import { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Loader2, CircleHelp, Save, X,
  ChevronRight, Globe, Layers, ListFilter, Layout,
  Settings, Info, Shield, CheckCircle, CircleHelp as FaqIcon,
  Search, ExternalLink, Image as ImageIcon, Upload,
  Check, MoveUp, MoveDown, Home, Building2, Building,
  Droplets, ShieldCheck, Clock, Award, Users, TrendingUp,
  BadgeCheck, Star, Zap, Sparkles, Palette, Sun, Snowflake,
  Trophy, Hammer, Truck, ClipboardCheck, FileText, ArrowRight,
  Wrench, HardHat, Ruler, Paintbrush, Wind, Flame, Thermometer,
  Copy, Shovel, Fence, Drill, Square, Box, Construction, PenTool as Tool,
  Home as HomeIcon, Map, MapPin, Search as SearchIcon, Settings as SettingsIcon,
  Phone as PhoneIcon, Mail as MailIcon, Globe as GlobeIcon, Layers as LayersIcon,
  Shield as ShieldIcon, ShieldCheck as ShieldCheckIcon, Award as AwardIcon,
  Trophy as TrophyIcon, Zap as ZapIcon, Sparkles as SparklesIcon, Palette as PaletteIcon,
  Sun as SunIcon, Snowflake as SnowflakeIcon, Truck as TruckIcon,
  ClipboardCheck as ClipboardCheckIcon, FileText as FileTextIcon,
  Hammer as HammerIcon, CheckCircle as CheckCircleIcon, Check as CheckIcon,
  ArrowRight as ArrowRightIcon, Users as UsersIcon, TrendingUp as TrendingUpIcon,
  BadgeCheck as BadgeCheckIcon, Star as StarIcon, Clock as ClockIcon,
  Warehouse, Factory, Store, Landmark, Castle, Mountain, Trees,
  ThermometerSnowflake, Droplet, FlameKindling, Lightbulb, Power,
  WashingMachine, Microwave, Speaker, Camera, Video, Monitor,
  Smartphone, Tablet, Laptop, Headphones, Wallet, CreditCard,
  ShoppingCart, Gift, Coffee, Utensils, Pizza, Beer
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import SeoEditor from "@/components/admin/SeoEditor";
import BlogSelector from "@/components/admin/BlogSelector";
import dynamic from "next/dynamic";
const QuillEditor = dynamic(() => import("@/components/admin/QuillEditor"), {
  ssr: false,
  loading: () => <div className="h-48 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Editor...</div>
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
  "SkipBack", "SkipForward", "Sunrise", "Sunset", "Tag",
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
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1 text-[13px] hover:border-[#2271b1] transition-all"
      >
        <SelectedIcon className="w-3.5 h-3.5 text-[#50575e]" />
        <span>{value || "Select Icon"}</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-[#c3c4c7] shadow-md p-3 rounded-[3px]">
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {ICON_LIST.map((iconName) => {
              const IconComp = IconComponentMap[iconName];
              return (
                <button
                  key={iconName}
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={`p-1.5 rounded hover:bg-[#f0f0f1] ${value === iconName ? "bg-[#2271b1] text-white" : "text-[#50575e]"}`}
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

const DEFAULT_FEATURED_CATEGORY = {
  isFeaturedCategory: false,
  featuredComparison: {
    badge: "Premium Material Showcase",
    titleLine1: "Composite & PVC:",
    titleLine2: "Built Different",
    description: "Two premium paths to your dream outdoor space. Discover why our deck installations are the gold standard.",
    image: "",
    imageBadge: "Award-Winning Craftsmanship",
    imageTitle: "Transform Your Outdoor Living",
    imageDescription: "Every deck we build is a masterpiece of engineering and design, backed by industry-leading warranties.",
    comparisonTitle: "Compare & Choose",
    comparisonSubtitle: "Find Your Perfect Material",
    comparisonDescription: "Side-by-side comparison of our premium decking solutions",
    card1: {
      title: "Capped Composite",
      subtitle: "Wood fiber + polymer blend",
      icon: "TreePine",
      features: [
        "Natural wood look and feel",
        "25+ year fade and stain warranty",
        "Realistic wood grain patterns",
        "Lower cost than premium PVC",
        "Excellent for full sun exposure",
        "Scratch and stain resistant capstock"
      ],
      footerLabel: "Starting at",
      footerValue: "Competitive Pricing"
    },
    card2: {
      title: "Cellular PVC",
      subtitle: "100% pure polymer",
      icon: "Droplets",
      features: [
        "Zero organic material - never rots",
        "Lifetime rot and insect warranty",
        "Lighter, cooler surface in direct sun",
        "Ideal for pools and shaded areas",
        "Superior moisture resistance",
        "Never absorbs water or swells"
      ],
      footerLabel: "Premium Investment",
      footerValue: "Worth Every Penny",
      isRecommended: true
    }
  },
  featuredGrid: {
    cards: [
      {
        icon: "Zap",
        title: "Cool-Touch Technology",
        description: "Advanced heat-mitigating capstock keeps surfaces cooler than traditional composites",
        colorTheme: "amber"
      },
      {
        icon: "Palette",
        title: "Premium Color Range",
        description: "Multi-tonal streaking and authentic wood grain patterns that never fade",
        colorTheme: "blue"
      },
      {
        icon: "Shield",
        title: "Lifetime Protection",
        description: "Industry-leading warranties backed by our military-grade installation",
        colorTheme: "green"
      }
    ]
  }
};

export default function ServicesAdminPage() {
  const [data, setData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [seo, setSeo] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState("");
  const [quickEditing, setQuickEditing] = useState<any>(null);

  const [form, setForm] = useState<any>({
    title: "", slug: "", tagline: "",
    description: "",
    heroDescription: "",
    breadcrumbText: "",
    overviewTitlePrefix: "", overviewTitleHighlight: "", overviewTitleSuffix: "",
    benefitsTitlePrefix: "", benefitsTitleHighlight: "", benefitsTitleSuffix: "",
    benefitsBadge: "",
    benefitsDescription: "",
    processTitlePrefix: "", processTitleHighlight: "", processTitleSuffix: "",
    processBadge: "",
    processDescription: "",
    overview: "", overviewImage: "", overviewStats: [],
    cta: { text: "Start Your Project", link: "/contact-us" }, icon: "Layout", tag: "", status: "published", features: [], stats: [], benefits: [], process: [], faq: [], faqSchemaMarkup: "", faqBadge: "", faqTitle: "", faqDescription: "",
    ...DEFAULT_FEATURED_CATEGORY
  });

  useEffect(() => {
    fetch("/api/content").then(res => res.json()).then(json => {
      setData(json);
      setServices(json.services?.services || []);
    });
  }, []);

  useEffect(() => {
    if (isEditing !== null && form.title && !form.id) { // Only auto-slug for new ones
      const generatedSlug = form.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
      if (form.slug !== generatedSlug) setForm((prev: any) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title]);

  const saveToDb = async (newServices: any[], keepEditingIdx?: number, updatedForm?: any) => {
    setSaving(true);
    const updatedData = { ...data, services: { ...data.services, services: newServices } };
    try {
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedData) });
      if (res.ok) {
        setData(updatedData);
        setServices(newServices);
        setToast({ type: "ok", msg: "Services updated." });
        setTimeout(() => setToast(null), 3000);
        if (keepEditingIdx !== undefined) {
          setIsEditing(keepEditingIdx);
          if (updatedForm) {
            setForm(updatedForm);
          }
        } else {
          setIsEditing(null);
        }
      }
    } catch {
      setToast({ type: "err", msg: "Failed to save." });
    } finally { setSaving(false); }
  };

  const handleQuickEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newServices = [...services];
    const idx = services.findIndex(s => s.id === quickEditing.id);
    if (idx !== -1) {
      newServices[idx] = { ...newServices[idx], ...quickEditing };
      saveToDb(newServices);
      setQuickEditing(null);
    }
  };

  const handleSaveService = () => {
    if (!form.title || !form.slug) return alert("Title and slug are required.");

    // Validate bulk FAQ JSON-LD schema markup
    const bulkSchema = (form.faqSchemaMarkup || "").trim();
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


    const newServices = [...services];
    const serviceData = { ...form, seo: seo, id: form.id || Date.now().toString(), number: form.number || (services.length + 1).toString().padStart(2, '0') };
    
    let targetIdx = isEditing;
    if (isEditing !== null && isEditing < services.length) {
      newServices[isEditing] = serviceData;
    } else {
      targetIdx = services.length;
      newServices.push(serviceData);
    }
    saveToDb(newServices, targetIdx !== null ? targetIdx : undefined, serviceData);
  };

  const handleEdit = (service: any) => {
    const originalIdx = services.findIndex(orig => orig.id === service.id);
    setForm({
      ...DEFAULT_FEATURED_CATEGORY,
      ...service,
      features: (service.features || []).map((f: any) => typeof f === 'string' ? { text: f, icon: "CheckCircle" } : f),
      stats: service.stats || [],
      benefits: service.benefits || [],
      process: service.process || [],
      faq: service.faq || [],
      faqSchemaMarkup: service.faqSchemaMarkup || "",
      faqBadge: service.faqBadge || "",
      faqTitle: service.faqTitle || "",
      faqDescription: service.faqDescription || "",
      benefitsDescription: service.benefitsDescription || "",
      processDescription: service.processDescription || "",
      featuredComparison: {
        ...DEFAULT_FEATURED_CATEGORY.featuredComparison,
        ...(service.featuredComparison || {}),
        card1: {
          ...DEFAULT_FEATURED_CATEGORY.featuredComparison.card1,
          ...(service.featuredComparison?.card1 || {})
        },
        card2: {
          ...DEFAULT_FEATURED_CATEGORY.featuredComparison.card2,
          ...(service.featuredComparison?.card2 || {})
        }
      },
      featuredGrid: {
        ...DEFAULT_FEATURED_CATEGORY.featuredGrid,
        ...(service.featuredGrid || {})
      }
    });
    setSeo(service.seo || {});
    setIsEditing(originalIdx);
    setActiveTab("general");
  };

  const toggleStatus = (service: any) => {
    const newServices = [...services];
    const originalIdx = services.findIndex(orig => orig.id === service.id);
    if (originalIdx === -1) return;
    const s = newServices[originalIdx];
    newServices[originalIdx] = { ...s, status: s.status === 'published' ? 'draft' : 'published' };
    saveToDb(newServices);
  };

  const handleDuplicate = (idx: number) => {
    const s = filteredServices[idx];
    const newService = {
      ...s,
      id: Date.now().toString(),
      title: `${s.title} (Copy)`,
      slug: `${s.slug}-copy`,
      status: 'draft'
    };
    const newServices = [...services, newService];
    saveToDb(newServices);
  };

  const handleBulkAction = async (action: string) => {
    if (!selectedIds.length) return;

    let newServices = [...services];
    if (action === 'delete') {
      if (!confirm(`Permanently delete ${selectedIds.length} services?`)) return;
      newServices = services.filter(s => !selectedIds.includes(s.id));
    } else if (action === 'trash') {
      newServices = services.map(s => selectedIds.includes(s.id) ? { ...s, isTrashed: true, trashedAt: new Date().toISOString() } : s);
    } else if (action === 'restore') {
      newServices = services.map(s => selectedIds.includes(s.id) ? { ...s, isTrashed: false, trashedAt: null } : s);
    } else if (action === 'publish' || action === 'draft') {
      const newStatus = action === 'publish' ? 'published' : 'draft';
      newServices = services.map(s => selectedIds.includes(s.id) ? { ...s, status: newStatus } : s);
    } else {
      return;
    }

    saveToDb(newServices);
    setSelectedIds([]);
  };



  const filteredServices = services.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(search.toLowerCase());
    const isTrashed = s.isTrashed === true;

    if (filter === 'trash') return matchesSearch && isTrashed;
    if (isTrashed) return false;

    return matchesSearch && (filter === 'all' || s.status === filter);
  });

  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Services</h1>
        {isEditing === null && (
          <button
            onClick={() => {
              setIsEditing(services.length);
              setForm({
                title: "", slug: "", tagline: "", description: "",
                heroDescription: "Professional solutions with military precision and architectural excellence.",
                breadcrumbText: "",
                overviewTitlePrefix: "Craftsmanship", overviewTitleHighlight: "Without Compromise", overviewTitleSuffix: ".",
                benefitsTitlePrefix: "Key", benefitsTitleHighlight: "Benefits", benefitsTitleSuffix: "",
                benefitsBadge: "The Eagle Edge",
                benefitsDescription: "Experience the difference with our unwavering commitment to military-grade excellence",
                processTitlePrefix: "Precision", processTitleHighlight: "In Every Detail", processTitleSuffix: ".",
                processBadge: "Methodology",
                processDescription: "A battle-tested framework that ensures consistency, quality, and complete satisfaction—from initial consultation to final walkthrough.",
                overview: "", overviewImage: "", overviewStats: [],
                cta: { text: "Start Your Project", link: "/contact-us" }, icon: "Layout", tag: "", status: "published", features: [], stats: [], benefits: [], process: [], faq: [], faqSchemaMarkup: "", faqBadge: "", faqTitle: "", faqDescription: "",
                ...DEFAULT_FEATURED_CATEGORY
              });
              setSeo({});
              setActiveTab("general");
            }}
            className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
          >
            Add New
          </button>
        )}
      </div>

      {toast && (
        <div className={`px-4 py-2 border-l-4 text-[13px] bg-white shadow-sm mb-4 ${toast.type === 'ok' ? 'border-[#00a32a]' : 'border-[#d63638]'}`}>
          {toast.msg}
        </div>
      )}

      {isEditing !== null ? (
        <div className="space-y-4">
          <div className="flex items-center gap-1 text-[13px] text-[#2271b1] px-1">
            <button onClick={() => setIsEditing(null)} className="hover:underline">Services</button>
            <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
            <span className="text-[#646970] truncate">{form.title || "New Service"}</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Form Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6">
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-[#8c8f94] px-3 py-2 text-[18px] font-medium rounded-[3px] focus:border-[#2271b1] outline-none mb-4"
                placeholder="Enter service title here"
              />

              {/* WP-Style Tabs for Service Editor */}
              <div className="space-y-4 mb-6">
                {/* Line 1: Core Tabs */}
                <div className="flex flex-wrap border-b border-[#c3c4c7]">
                  {[
                    { id: "general", label: "General" },
                    { id: "content", label: "Page Details" },
                    { id: "features", label: "Stats & Benefits" },
                    { id: "steps", label: "Process" },
                    { id: "faq", label: "FAQs" },
                    { id: "blog", label: "Blog" },
                    { id: "seo", label: "SEO" }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 text-[13px] border-b-2 transition-all ${
                        activeTab === tab.id
                          ? 'border-[#2271b1] text-[#1d2327] font-bold'
                          : 'border-transparent text-[#2271b1] hover:text-[#135e96]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Line 2: Featured Sections Tabs */}
                {form.isFeaturedCategory && (
                  <div className="flex flex-wrap border-b border-[#c3c4c7] gap-x-2">
                    {[
                      { id: "featured-comparison", label: "Featured Comparison" },
                      { id: "featured-grid", label: "Featured Grid" }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-1 pb-2 text-[13px] border-b-2 transition-all flex flex-col items-center justify-center ${
                          activeTab === tab.id
                            ? 'border-[#2271b1] text-[#1d2327] font-bold'
                            : 'border-transparent text-[#2271b1] hover:text-[#135e96]'
                        }`}
                      >
                        <span className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0.5 rounded-[3px] mb-0.5 uppercase tracking-wider leading-none">
                          Featured
                        </span>
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-6 min-h-[400px]">
                {activeTab === "general" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Category Tag</label>
                        <input type="text" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Menu Icon</label>
                        <IconSelector value={form.icon} onChange={(v) => setForm({ ...form, icon: v })} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <ImageField label="Breadcrumb Banner Image" value={form.breadcrumbImage || ""} onChange={(v) => setForm({ ...form, breadcrumbImage: v })} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Breadcrumb Overlay Text</label>
                      <input type="text" placeholder="e.g. Expert Solutions" value={form.breadcrumbText || ""} onChange={(e) => setForm({ ...form, breadcrumbText: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Hero Description / Subtitle</label>
                      <textarea placeholder="e.g. Professional services with military precision..." value={form.heroDescription || ""} onChange={(e) => setForm({ ...form, heroDescription: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] h-20" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Short Description (Card View)</label>
                      <QuillEditor
                        content={form.description}
                        onChange={(v) => setForm({ ...form, description: v })}
                        placeholder="Write a short description shown on service cards..."
                      />
                    </div>
                    <div className="space-y-1 p-3 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm mt-4">
                      <label className="flex items-center gap-2 cursor-pointer text-[13px] font-bold">
                        <input
                          type="checkbox"
                          checked={form.isFeaturedCategory || false}
                          onChange={(e) => setForm({ ...form, isFeaturedCategory: e.target.checked })}
                          className="rounded-[3px] border-[#8c8f94] w-4 h-4"
                        />
                        Featured Category Service
                      </label>
                      <p className="text-[11px] text-[#646970] mt-1">
                        If checked, this service details page will feature two custom layout sections (Material Comparison and Features Grid).
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === "featured-comparison" && (
                  <div className="space-y-6">
                    <h3 className="text-[14px] font-bold border-b border-[#c3c4c7] pb-2 text-[#1d2327]">Comparison Header Content</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Header Badge</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.badge || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, badge: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Header Description</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.description || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, description: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Title Line 1</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.titleLine1 || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, titleLine1: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Title Line 2 (Highlighted Gradient)</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.titleLine2 || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, titleLine2: e.target.value }
                          })}
                          className="w-full border border-[#2271b1] px-3 py-1.5 text-[14px] rounded-[3px]"
                        />
                      </div>
                    </div>

                    <h3 className="text-[14px] font-bold border-b border-[#c3c4c7] pb-2 pt-4 text-[#1d2327]">Showcase Banner Image</h3>
                    <div className="space-y-4">
                      <ImageField
                        label="Featured Image Showcase"
                        value={form.featuredComparison?.image || ""}
                        onChange={(url) => setForm({
                          ...form,
                          featuredComparison: { ...form.featuredComparison, image: url }
                        })}
                      />
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Image Floating Badge</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.imageBadge || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, imageBadge: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold">Image Heading Title</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.imageTitle || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: { ...form.featuredComparison, imageTitle: e.target.value }
                            })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[13px] font-bold">Image Description</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.imageDescription || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: { ...form.featuredComparison, imageDescription: e.target.value }
                            })}
                            className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                          />
                        </div>
                      </div>
                    </div>

                    <h3 className="text-[14px] font-bold border-b border-[#c3c4c7] pb-2 pt-4 text-[#1d2327]">Comparison Grid Title</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Comparison Header Title</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.comparisonTitle || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, comparisonTitle: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Comparison Subtitle</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.comparisonSubtitle || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, comparisonSubtitle: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Comparison Description</label>
                        <input
                          type="text"
                          value={form.featuredComparison?.comparisonDescription || ""}
                          onChange={(e) => setForm({
                            ...form,
                            featuredComparison: { ...form.featuredComparison, comparisonDescription: e.target.value }
                          })}
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4 pt-4 border-t border-[#c3c4c7]">
                      {/* Card 1 */}
                      <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-4 rounded-sm space-y-4">
                        <h4 className="font-bold text-[13px] border-b border-[#c3c4c7] pb-1">Comparison Card 1</h4>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970]">Card Title</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.card1?.title || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card1: { ...form.featuredComparison.card1, title: e.target.value }
                              }
                            })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970]">Card Subtitle</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.card1?.subtitle || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card1: { ...form.featuredComparison.card1, subtitle: e.target.value }
                              }
                            })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970] block">Card Icon</label>
                          <IconSelector
                            value={form.featuredComparison?.card1?.icon || "TreePine"}
                            onChange={(v) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card1: { ...form.featuredComparison.card1, icon: v }
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] text-[#646970] font-bold">Bullet Features</label>
                          {(form.featuredComparison?.card1?.features || []).map((f: string, fIdx: number) => (
                            <div key={fIdx} className="flex gap-1.5">
                              <input
                                type="text"
                                value={f}
                                onChange={(e) => {
                                  const nf = [...form.featuredComparison.card1.features];
                                  nf[fIdx] = e.target.value;
                                  setForm({
                                    ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card1: { ...form.featuredComparison.card1, features: nf }
                                    }
                                  });
                                }}
                                className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nf = form.featuredComparison.card1.features.filter((_: any, idx: number) => idx !== fIdx);
                                  setForm({
                                    ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card1: { ...form.featuredComparison.card1, features: nf }
                                    }
                                  });
                                }}
                                className="text-[#d63638] text-xs"
                              >✕</button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const nf = [...(form.featuredComparison?.card1?.features || []), ""];
                              setForm({
                                ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card1: { ...form.featuredComparison.card1, features: nf }
                                    }
                              });
                            }}
                            className="text-[#2271b1] text-xs underline"
                          >+ Add Feature</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Footer Label</label>
                            <input
                              type="text"
                              value={form.featuredComparison?.card1?.footerLabel || ""}
                              onChange={(e) => setForm({
                                ...form,
                                featuredComparison: {
                                  ...form.featuredComparison,
                                  card1: { ...form.featuredComparison.card1, footerLabel: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Footer Value</label>
                            <input
                              type="text"
                              value={form.featuredComparison?.card1?.footerValue || ""}
                              onChange={(e) => setForm({
                                ...form,
                                featuredComparison: {
                                  ...form.featuredComparison,
                                  card1: { ...form.featuredComparison.card1, footerValue: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-[#f6f7f7] border border-[#c3c4c7] p-4 rounded-sm space-y-4">
                        <div className="flex justify-between items-center border-b border-[#c3c4c7] pb-1">
                          <h4 className="font-bold text-[13px]">Comparison Card 2</h4>
                          <label className="flex items-center gap-1 cursor-pointer text-xs font-bold">
                            <input
                              type="checkbox"
                              checked={form.featuredComparison?.card2?.isRecommended || false}
                              onChange={(e) => setForm({
                                ...form,
                                featuredComparison: {
                                  ...form.featuredComparison,
                                  card2: { ...form.featuredComparison.card2, isRecommended: e.target.checked }
                                }
                              })}
                              className="w-3.5 h-3.5 shadow-none"
                            />
                            Recommended
                          </label>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970]">Card Title</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.card2?.title || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card2: { ...form.featuredComparison.card2, title: e.target.value }
                              }
                            })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970]">Card Subtitle</label>
                          <input
                            type="text"
                            value={form.featuredComparison?.card2?.subtitle || ""}
                            onChange={(e) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card2: { ...form.featuredComparison.card2, subtitle: e.target.value }
                              }
                            })}
                            className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-[#646970] block">Card Icon</label>
                          <IconSelector
                            value={form.featuredComparison?.card2?.icon || "Droplets"}
                            onChange={(v) => setForm({
                              ...form,
                              featuredComparison: {
                                ...form.featuredComparison,
                                card2: { ...form.featuredComparison.card2, icon: v }
                              }
                            })}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[11px] text-[#646970] font-bold">Bullet Features</label>
                          {(form.featuredComparison?.card2?.features || []).map((f: string, fIdx: number) => (
                            <div key={fIdx} className="flex gap-1.5">
                              <input
                                type="text"
                                value={f}
                                onChange={(e) => {
                                  const nf = [...form.featuredComparison.card2.features];
                                  nf[fIdx] = e.target.value;
                                  setForm({
                                    ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card2: { ...form.featuredComparison.card2, features: nf }
                                    }
                                  });
                                }}
                                className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px]"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const nf = form.featuredComparison.card2.features.filter((_: any, idx: number) => idx !== fIdx);
                                  setForm({
                                    ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card2: { ...form.featuredComparison.card2, features: nf }
                                    }
                                  });
                                }}
                                className="text-[#d63638] text-xs"
                              >✕</button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const nf = [...(form.featuredComparison?.card2?.features || []), ""];
                              setForm({
                                ...form,
                                    featuredComparison: {
                                      ...form.featuredComparison,
                                      card2: { ...form.featuredComparison.card2, features: nf }
                                    }
                              });
                            }}
                            className="text-[#2271b1] text-xs underline"
                          >+ Add Feature</button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Footer Label</label>
                            <input
                              type="text"
                              value={form.featuredComparison?.card2?.footerLabel || ""}
                              onChange={(e) => setForm({
                                ...form,
                                featuredComparison: {
                                  ...form.featuredComparison,
                                  card2: { ...form.featuredComparison.card2, footerLabel: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Footer Value</label>
                            <input
                              type="text"
                              value={form.featuredComparison?.card2?.footerValue || ""}
                              onChange={(e) => setForm({
                                ...form,
                                featuredComparison: {
                                  ...form.featuredComparison,
                                  card2: { ...form.featuredComparison.card2, footerValue: e.target.value }
                                }
                              })}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "featured-grid" && (
                  <div className="space-y-8">
                    <h3 className="text-[14px] font-bold border-b border-[#c3c4c7] pb-2 text-[#1d2327]">3-Card Featured Detail Grid</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {(form.featuredGrid?.cards || []).map((card: any, cIdx: number) => (
                        <div key={cIdx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-4 rounded-sm space-y-4">
                          <h4 className="font-bold text-[13px] border-b border-[#c3c4c7] pb-1">Feature Card #{cIdx + 1}</h4>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970] block">Icon</label>
                            <IconSelector
                              value={card.icon || "Zap"}
                              onChange={(v) => {
                                const nc = [...form.featuredGrid.cards];
                                nc[cIdx] = { ...nc[cIdx], icon: v };
                                setForm({ ...form, featuredGrid: { ...form.featuredGrid, cards: nc } });
                              }}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Title</label>
                            <input
                              type="text"
                              value={card.title || ""}
                              onChange={(e) => {
                                const nc = [...form.featuredGrid.cards];
                                nc[cIdx] = { ...nc[cIdx], title: e.target.value };
                                setForm({ ...form, featuredGrid: { ...form.featuredGrid, cards: nc } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970]">Description</label>
                            <textarea
                              value={card.description || ""}
                              onChange={(e) => {
                                const nc = [...form.featuredGrid.cards];
                                nc[cIdx] = { ...nc[cIdx], description: e.target.value };
                                setForm({ ...form, featuredGrid: { ...form.featuredGrid, cards: nc } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] h-20"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] text-[#646970] block">Color Theme</label>
                            <select
                              value={card.colorTheme || "amber"}
                              onChange={(e) => {
                                const nc = [...form.featuredGrid.cards];
                                nc[cIdx] = { ...nc[cIdx], colorTheme: e.target.value };
                                setForm({ ...form, featuredGrid: { ...form.featuredGrid, cards: nc } });
                              }}
                              className="w-full border border-[#8c8f94] px-2 py-1 text-xs rounded-[3px] bg-white outline-none"
                            >
                              <option value="amber">Amber / Orange</option>
                              <option value="blue">Blue / Purple</option>
                              <option value="green">Green / Emerald</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "content" && (
                  <div className="space-y-6">
                    {/* Page Tagline */}
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Page Tagline <span className="text-[#8c8f94] font-normal">(shown above the overview heading)</span></label>
                      <input type="text" placeholder="e.g. Expert Roofing Solutions" value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                    </div>

                    {/* Split Overview Heading */}
                    <div className="space-y-2 p-3 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm">
                      <label className="text-[13px] font-bold">Overview Heading <span className="text-[#8c8f94] font-normal">(split into prefix / highlight / suffix)</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Prefix</label>
                          <input type="text" placeholder="e.g. Craftsmanship" value={form.overviewTitlePrefix || ""} onChange={(e) => setForm({ ...form, overviewTitlePrefix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Highlight <span className="text-[#2271b1]">⚡ gradient</span></label>
                          <input type="text" placeholder="e.g. Without Compromise" value={form.overviewTitleHighlight || ""} onChange={(e) => setForm({ ...form, overviewTitleHighlight: e.target.value })} className="w-full border border-[#2271b1] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Suffix</label>
                          <input type="text" placeholder="e.g. ." value={form.overviewTitleSuffix || ""} onChange={(e) => setForm({ ...form, overviewTitleSuffix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#646970]">Preview: <em>{(form.overviewTitlePrefix || "")} <strong className="text-[#2271b1]">{form.overviewTitleHighlight || ""}</strong>{(form.overviewTitleSuffix || "")}</em></p>
                    </div>

                    <ImageField label="Overview Section Image" value={form.overviewImage || ""} onChange={(v) => setForm({ ...form, overviewImage: v })} />

                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Overview Detailed Text</label>
                      <QuillEditor
                        content={form.overview}
                        onChange={(v) => setForm({ ...form, overview: v })}
                        placeholder="Write the full overview text shown on the service detail page..."
                      />
                    </div>

                    {/* Overview Stats (2x2 grid) */}
                    <div className="space-y-3 pt-4 border-t border-[#c3c4c7]">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-[13px] font-bold">Overview Stats Grid <span className="text-[#8c8f94] font-normal">(2×2 grid shown below overview description)</span></h3>
                          <p className="text-[11px] text-[#646970] mt-0.5">Add up to 4 items — each with an icon and a label text.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, overviewStats: [...(form.overviewStats || []), { icon: "CheckCircle", label: "" }] })}
                          className="text-[#2271b1] text-xs underline whitespace-nowrap"
                        >+ Add Stat</button>
                      </div>
                      {(form.overviewStats || []).map((s: any, i: number) => (
                        <div key={i} className="flex gap-2 items-center bg-white border border-[#c3c4c7] p-2 rounded-sm">
                          <IconSelector value={s.icon} onChange={(v) => { const ns = [...form.overviewStats]; ns[i] = { ...ns[i], icon: v }; setForm({ ...form, overviewStats: ns }); }} />
                          <input
                            placeholder="Label (e.g. 10-Year Warranty)"
                            value={s.label}
                            onChange={(e) => { const ns = [...form.overviewStats]; ns[i] = { ...ns[i], label: e.target.value }; setForm({ ...form, overviewStats: ns }); }}
                            className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[2px]"
                          />
                          <button type="button" onClick={() => { const ns = (form.overviewStats || []).filter((_: any, idx: number) => idx !== i); setForm({ ...form, overviewStats: ns }); }} className="text-[#d63638] text-xs shrink-0">✕</button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#c3c4c7]">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">CTA Button Text</label>
                        <input type="text" value={form.cta?.text || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, text: e.target.value } })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">CTA Button Link</label>
                        <input type="text" value={form.cta?.link || ""} onChange={(e) => setForm({ ...form, cta: { ...form.cta, link: e.target.value } })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "features" && (
                  <div className="space-y-8">
                    {/* Benefits Badge */}
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Key Benefits Section Badge <span className="text-[#8c8f94] font-normal">(shown above the heading)</span></label>
                      <input type="text" placeholder="e.g. The Eagle Edge" value={form.benefitsBadge || ""} onChange={(e) => setForm({ ...form, benefitsBadge: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                    </div>

                    {/* Split Benefits Heading */}
                    <div className="space-y-2 p-3 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm">
                      <label className="text-[13px] font-bold">Key Benefits Heading <span className="text-[#8c8f94] font-normal">(split into prefix / highlight / suffix)</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Prefix</label>
                          <input type="text" placeholder="e.g. Key" value={form.benefitsTitlePrefix || ""} onChange={(e) => setForm({ ...form, benefitsTitlePrefix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Highlight <span className="text-[#2271b1]">⚡ gradient</span></label>
                          <input type="text" placeholder="e.g. Benefits" value={form.benefitsTitleHighlight || ""} onChange={(e) => setForm({ ...form, benefitsTitleHighlight: e.target.value })} className="w-full border border-[#2271b1] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Suffix</label>
                          <input type="text" placeholder="e.g. ." value={form.benefitsTitleSuffix || ""} onChange={(e) => setForm({ ...form, benefitsTitleSuffix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#646970]">Preview: <em>{(form.benefitsTitlePrefix || "")} <strong className="text-[#2271b1]">{form.benefitsTitleHighlight || ""}</strong>{(form.benefitsTitleSuffix || "")}</em></p>
                    </div>

                    {/* Benefits Description */}
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Key Benefits Section Description</label>
                      <textarea
                        placeholder="e.g. Experience the difference with our unwavering commitment..."
                        value={form.benefitsDescription || ""}
                        onChange={(e) => setForm({ ...form, benefitsDescription: e.target.value })}
                        className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] h-20"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><h3 className="text-sm font-bold">Service Stats</h3><button type="button" onClick={() => setForm({ ...form, stats: [...(form.stats || []), { value: "", label: "", icon: "Star", category: "Impact" }] })} className="text-[#2271b1] text-xs underline">+ Add Stat</button></div>
                      {form.stats?.map((s: any, i: number) => (
                        <div key={i} className="flex flex-col sm:flex-row gap-2 bg-[#f6f7f7] p-2 border border-[#c3c4c7] rounded-[3px]">
                          <div className="flex gap-2 items-center flex-1">
                            <IconSelector value={s.icon || "Star"} onChange={(v) => { const ns = [...form.stats]; ns[i] = { ...ns[i], icon: v }; setForm({ ...form, stats: ns }); }} />
                            <input placeholder="Category (e.g. Impact)" value={s.category || ""} onChange={(e) => { const ns = [...form.stats]; ns[i] = { ...ns[i], category: e.target.value }; setForm({ ...form, stats: ns }); }} className="w-32 border border-[#8c8f94] px-2 py-1 text-xs rounded-[2px]" />
                            <input placeholder="Value" value={s.value} onChange={(e) => { const ns = [...form.stats]; ns[i] = { ...ns[i], value: e.target.value }; setForm({ ...form, stats: ns }); }} className="w-20 border border-[#8c8f94] px-2 py-1 text-xs rounded-[2px]" />
                            <input placeholder="Label" value={s.label} onChange={(e) => { const ns = [...form.stats]; ns[i] = { ...ns[i], label: e.target.value }; setForm({ ...form, stats: ns }); }} className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs rounded-[2px]" />
                          </div>
                          <button onClick={() => { const ns = form.stats.filter((_: any, idx: number) => idx !== i); setForm({ ...form, stats: ns }); }} className="text-[#d63638] text-xs hover:underline self-center shrink-0">Remove</button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><h3 className="text-sm font-bold">Key Benefits</h3><button onClick={() => setForm({ ...form, benefits: [...(form.benefits || []), { title: "", description: "", icon: "Shield" }] })} className="text-[#2271b1] text-xs underline">+ Add Benefit</button></div>
                      {form.benefits?.map((b: any, i: number) => (
                        <div key={i} className="bg-[#f6f7f7] border border-[#c3c4c7] p-3 space-y-2">
                          <div className="flex gap-2 items-center">
                            <IconSelector value={b.icon} onChange={(v) => { const nb = [...form.benefits]; nb[i] = { ...nb[i], icon: v }; setForm({ ...form, benefits: nb }); }} />
                            <input placeholder="Title" value={b.title} onChange={(e) => { const nb = [...form.benefits]; nb[i] = { ...nb[i], title: e.target.value }; setForm({ ...form, benefits: nb }); }} className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs" />
                          </div>
                          <QuillEditor
                            content={b.description}
                            onChange={(v) => { const nb = [...form.benefits]; nb[i] = { ...nb[i], description: v }; setForm({ ...form, benefits: nb }); }}
                            placeholder="Describe this benefit..."
                          />
                          <button onClick={() => { const nb = form.benefits.filter((_: any, idx: number) => idx !== i); setForm({ ...form, benefits: nb }); }} className="text-[#d63638] text-xs">Remove Benefit</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === "steps" && (
                  <div className="space-y-4">
                    {/* Process Badge */}
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Process Section Badge <span className="text-[#8c8f94] font-normal">(shown above the heading)</span></label>
                      <input type="text" placeholder="e.g. Methodology" value={form.processBadge || ""} onChange={(e) => setForm({ ...form, processBadge: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                    </div>

                    {/* Split Process Heading */}
                    <div className="space-y-2 p-3 bg-[#f6f7f7] border border-[#c3c4c7] rounded-sm">
                      <label className="text-[13px] font-bold">Process Section Heading <span className="text-[#8c8f94] font-normal">(split into prefix / highlight / suffix)</span></label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Prefix</label>
                          <input type="text" placeholder="e.g. Precision" value={form.processTitlePrefix || ""} onChange={(e) => setForm({ ...form, processTitlePrefix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Highlight <span className="text-[#2271b1]">⚡ gradient</span></label>
                          <input type="text" placeholder="e.g. In Every Detail" value={form.processTitleHighlight || ""} onChange={(e) => setForm({ ...form, processTitleHighlight: e.target.value })} className="w-full border border-[#2271b1] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[11px] text-[#646970]">Suffix</label>
                          <input type="text" placeholder="e.g. ." value={form.processTitleSuffix || ""} onChange={(e) => setForm({ ...form, processTitleSuffix: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#646970]">Preview: <em>{(form.processTitlePrefix || "")} <strong className="text-[#2271b1]">{form.processTitleHighlight || ""}</strong>{(form.processTitleSuffix || "")}</em></p>
                    </div>

                    {/* Process Description */}
                    <div className="space-y-1">
                      <label className="text-[13px] font-bold">Process Section Description</label>
                      <textarea
                        placeholder="e.g. A battle-tested framework that ensures consistency..."
                        value={form.processDescription || ""}
                        onChange={(e) => setForm({ ...form, processDescription: e.target.value })}
                        className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] h-20"
                      />
                    </div>

                    <button type="button" onClick={() => setForm({ ...form, process: [...(form.process || []), { title: "", description: "", icon: "Hammer" }] })} className="text-[#2271b1] text-xs underline font-bold">+ Add Step</button>
                    {form.process?.map((step: any, i: number) => (
                      <div key={i} className="bg-[#f6f7f7] border border-[#c3c4c7] p-4 flex gap-4">
                        <div className="w-8 h-8 bg-[#2271b1] text-white rounded-full flex items-center justify-center shrink-0 text-xs font-bold">{i + 1}</div>
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2 items-center">
                            <IconSelector value={step.icon} onChange={(v) => { const np = [...form.process]; np[i] = { ...np[i], icon: v }; setForm({ ...form, process: np }); }} />
                            <input value={step.title} onChange={(e) => { const np = [...form.process]; np[i] = { ...np[i], title: e.target.value }; setForm({ ...form, process: np }); }} placeholder="Step Title" className="flex-1 border border-[#8c8f94] px-2 py-1 text-xs font-bold" />
                          </div>
                          <QuillEditor
                            content={step.description}
                            onChange={(v) => { const np = [...form.process]; np[i] = { ...np[i], description: v }; setForm({ ...form, process: np }); }}
                            placeholder="Describe this process step..."
                          />
                          <button onClick={() => { const np = form.process.filter((_: any, idx: number) => idx !== i); setForm({ ...form, process: np }); }} className="text-[#d63638] text-xs">Remove Step</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "faq" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-[#c3c4c7]">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Badge</label>
                        <input
                          type="text"
                          value={form.faqBadge || ""}
                          onChange={(e) => setForm({ ...form, faqBadge: e.target.value })}
                          placeholder="e.g. Got Questions?"
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-sm focus:border-[#2271b1] outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Heading</label>
                        <input
                          type="text"
                          value={form.faqTitle || ""}
                          onChange={(e) => setForm({ ...form, faqTitle: e.target.value })}
                          placeholder="e.g. Frequently Asked Questions"
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-sm focus:border-[#2271b1] outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Description</label>
                        <input
                          type="text"
                          value={form.faqDescription || ""}
                          onChange={(e) => setForm({ ...form, faqDescription: e.target.value })}
                          placeholder="e.g. Answers to common questions..."
                          className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-sm focus:border-[#2271b1] outline-none bg-white"
                        />
                      </div>
                    </div>

                    <button onClick={() => setForm({ ...form, faq: [...(form.faq || []), { question: "", answer: "" }] })} className="text-[#2271b1] text-xs underline font-bold">+ Add FAQ Item</button>
                    {form.faq?.map((item: any, i: number) => (
                      <div key={i} className="bg-white border border-[#c3c4c7] p-4 space-y-3 shadow-sm">
                        <input value={item.question} onChange={(e) => { const nf = [...form.faq]; nf[i] = { ...nf[i], question: e.target.value }; setForm({ ...form, faq: nf }); }} placeholder="Question" className="w-full border border-[#8c8f94] px-2 py-1 text-xs font-bold" />
                        <QuillEditor
                          content={item.answer}
                          onChange={(v) => { const nf = [...form.faq]; nf[i] = { ...nf[i], answer: v }; setForm({ ...form, faq: nf }); }}
                          placeholder="Write the answer to this FAQ..."
                        />
                        <button onClick={() => { const nf = form.faq.filter((_: any, idx: number) => idx !== i); setForm({ ...form, faq: nf }); }} className="text-[#d63638] text-xs">Remove FAQ</button>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-[#c3c4c7] space-y-1">
                      <label className="text-[13px] font-bold">FAQ Schema Markup (Bulk JSON-LD)</label>
                      <p className="text-[11px] text-[#646970]">Paste a single JSON-LD schema block covering all FAQs for this service.</p>
                      <textarea
                        value={form.faqSchemaMarkup || ""}
                        onChange={(e) => setForm({ ...form, faqSchemaMarkup: e.target.value })}
                        placeholder='e.g. {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...]}'
                        className="w-full border border-[#8c8f94] px-2 py-1.5 text-xs font-mono"
                        rows={8}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "blog" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Blog Section Title</label>
                        <input type="text" value={form.blogSection?.title || ""} onChange={(e) => setForm({ ...form, blogSection: { ...(form.blogSection || {}), title: e.target.value } })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Blog Section Subtitle</label>
                        <input type="text" value={form.blogSection?.subtitle || ""} onChange={(e) => setForm({ ...form, blogSection: { ...(form.blogSection || {}), subtitle: e.target.value } })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[13px] font-bold">Blog Section Description</label>
                        <QuillEditor
                          content={form.blogSection?.description || ""}
                          onChange={(v) => setForm({ ...form, blogSection: { ...(form.blogSection || {}), description: v } })}
                          placeholder="Write a description for the blog section..."
                        />
                      </div>
                    </div>
                    <div className="space-y-4 pt-6 border-t border-[#c3c4c7]">
                      <h3 className="text-sm font-bold">Select Featured Posts</h3>
                      <BlogSelector
                        selectedIds={form.blogSection?.selectedPosts || []}
                        onChange={(ids) => setForm({ ...form, blogSection: { ...(form.blogSection || {}), selectedPosts: ids } })}
                      />
                    </div>
                  </div>
                )}

                {activeTab === "seo" && (
                  <SeoEditor data={seo} setData={setSeo} pageSlug={form.slug} pageTitle={form.title} pageContent={form} />
                )}
              </div>
            </div>
          </div>

          {/* Sidebar: Publish Box */}
          <div className="lg:col-span-1 space-y-6 sticky top-4">
            <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
              <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                <h2 className="text-[14px] font-semibold text-[#1d2327]">Publish</h2>
              </div>
              <div className="p-4 space-y-4 text-[13px] text-[#2c3338]">
                <div className="flex flex-col gap-2">
                  <p><strong>Status:</strong> {form.status === 'published' ? 'Published' : 'Draft'} <Link href="#" className="text-[#2271b1] underline ml-1">Edit</Link></p>
                  <p><strong>Visibility:</strong> Public <Link href="#" className="text-[#2271b1] underline ml-1">Edit</Link></p>
                  {form.slug && (
                    <p className="flex items-center gap-1">
                      <strong>Permalink:</strong>
                      <Link href={`/services/${form.slug}`} target="_blank" className="text-[#2271b1] hover:underline truncate max-w-[150px] inline-flex items-center gap-1">
                        View Service <ExternalLink className="w-3 h-3" />
                      </Link>
                    </p>
                  )}
                </div>
              </div>
              <div className="px-3 py-2 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-between items-center">
                <button onClick={() => setIsEditing(null)} className="text-[#d63638] underline text-[13px]">Cancel</button>
                <button
                  onClick={handleSaveService}
                  disabled={saving}
                  className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold border border-[#2271b1] hover:bg-[#135e96] flex items-center gap-2"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEditing !== null && isEditing < services.length ? "Update" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      ) : (
        /* WP List View */
        <div className="space-y-4">
          {/* Filter Links */}
          <div className="flex items-center gap-2 text-[13px] mb-2">
            <button onClick={() => setFilter("all")} className={`${filter === 'all' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              All <span className="text-[#646970] font-normal">({services.length})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("published")} className={`${filter === 'published' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              Published <span className="text-[#646970] font-normal">({services.filter(s => s.status === 'published').length})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("draft")} className={`${filter === 'draft' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              Drafts <span className="text-[#646970] font-normal">({services.filter(s => s.status === 'draft' && !s.isTrashed).length})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("trash")} className={`${filter === 'trash' ? 'text-black font-bold' : 'text-[#d63638] underline decoration-transparent hover:decoration-current'}`}>
              Trash <span className="text-[#646970] font-normal">({services.filter(s => s.isTrashed).length})</span>
            </button>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <select
                className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px] outline-none"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk actions</option>
                {filter === 'trash' ? (
                  <>
                    <option value="restore">Restore</option>
                    <option value="delete">Delete Permanently</option>
                  </>
                ) : (
                  <>
                    <option value="publish">Mark as Published</option>
                    <option value="draft">Mark as Draft</option>
                    <option value="trash">Move to Trash</option>
                  </>
                )}
              </select>
              <button
                onClick={() => { handleBulkAction(bulkAction); setBulkAction(""); }}
                className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7]"
              >
                Apply
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input type="text" placeholder="Search Services" value={search} onChange={(e) => setSearch(e.target.value)} className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]" />
              <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7]">Search</button>
            </div>
          </div>

          <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c4c7] bg-white text-[#1d2327]">
                  <th className="w-8 py-2 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></th>
                  <th className="py-2 px-3 text-[14px] font-semibold">Service Name</th>
                  <th className="py-2 px-3 text-[14px] font-semibold w-40">Category</th>
                  <th className="py-2 px-3 text-[14px] font-semibold w-32">Status</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                {filteredServices.map((service, idx) => {
                  const ServiceIcon = IconComponentMap[service.icon] || Layout;
                  return (
                    <tr key={idx} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                      <td className="py-4 px-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(service.id)}
                          onChange={() => setSelectedIds(prev => prev.includes(service.id) ? prev.filter(i => i !== service.id) : [...prev, service.id])}
                          className="w-4 h-4 border-[#8c8f94] rounded-[3px]"
                        />
                      </td>
                      <td className="py-4 px-3 align-top">
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-white border border-[#c3c4c7] rounded-[3px] flex items-center justify-center text-[#8c8f94] shrink-0">
                            <ServiceIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="text-[#2271b1] block text-[14px]">{service.title} {service.status === 'draft' && <span className="text-[#646970] font-normal italic">— Draft</span>}</strong>
                            <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => handleEdit(service)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                              <span className="text-[#a7aaad]">|</span>
                              <button onClick={() => setQuickEditing(service)} className="text-[#2271b1] hover:underline text-[12px]">Quick Edit</button>
                              <span className="text-[#a7aaad]">|</span>
                              <button onClick={() => toggleStatus(service)} className="text-[#2271b1] hover:underline text-[12px]">
                                {service.status === 'draft' ? 'Publish' : 'Set as Draft'}
                              </button>
                              <span className="text-[#a7aaad]">|</span>
                              <Link href={`/services/${service.slug}`} target="_blank" className="text-[#2271b1] hover:underline text-[12px]">View</Link>
                              <span className="text-[#a7aaad]">|</span>
                              <button onClick={() => handleDuplicate(idx)} className="text-[#2271b1] hover:underline text-[12px]">Duplicate</button>
                              <span className="text-[#a7aaad]">|</span>
                              {service.isTrashed ? (
                                <>
                                  <button onClick={() => {
                                    const ns = [...services];
                                    const sidx = ns.findIndex(orig => orig.id === service.id);
                                    if (sidx !== -1) { ns[sidx] = { ...ns[sidx], isTrashed: false, trashedAt: null }; saveToDb(ns); }
                                  }} className="text-[#2271b1] hover:underline text-[12px]">Restore</button>
                                  <span className="text-[#a7aaad]">|</span>
                                  <button onClick={() => { if (confirm("Permanently delete this service?")) saveToDb(services.filter(orig => orig.id !== service.id)); }} className="text-[#d63638] hover:underline text-[12px]">Delete Permanently</button>
                                </>
                              ) : (
                                <button onClick={() => {
                                  const ns = [...services];
                                  const sidx = ns.findIndex(orig => orig.id === service.id);
                                  if (sidx !== -1) { ns[sidx] = { ...ns[sidx], isTrashed: true, trashedAt: new Date().toISOString() }; saveToDb(ns); }
                                }} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-3 align-top text-[#50575e]">{service.tag}</td>
                      <td className="py-4 px-3 align-top">
                        <span className={`font-semibold ${service.status === 'draft' ? 'text-[#d63638]' : 'text-[#00a32a]'}`}>
                          {service.status === 'draft' ? 'Draft' : 'Published'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {quickEditing && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setQuickEditing(null)} className="absolute inset-0 bg-[#00000066]" />
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Quick Edit Service</h2>
                <button onClick={() => setQuickEditing(null)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleQuickEditSave}>
                <div className="p-6 bg-[#f0f0f1] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Service Title</label>
                      <input
                        type="text"
                        value={quickEditing.title}
                        onChange={(e) => setQuickEditing({ ...quickEditing, title: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Slug</label>
                      <input
                        type="text"
                        value={quickEditing.slug}
                        onChange={(e) => setQuickEditing({ ...quickEditing, slug: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Category Tag</label>
                      <input
                        type="text"
                        value={quickEditing.tag}
                        onChange={(e) => setQuickEditing({ ...quickEditing, tag: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Status</label>
                      <select
                        value={quickEditing.status}
                        onChange={(e) => setQuickEditing({ ...quickEditing, status: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                  <button type="button" onClick={() => setQuickEditing(null)} className="text-[#2271b1] text-[13px] hover:text-[#135e96]">Cancel</button>
                  <button
                    type="submit"
                    className="bg-[#2271b1] text-white text-[13px] font-bold px-4 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
