"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader2, Settings, LayoutTemplate, Type, Image as ImageIcon, ChevronRight, Globe, Mail, Phone, MapPin, Share2, Plus, Trash2, List, ExternalLink, Search, Check, X, Upload, ChevronUp, ChevronDown, RefreshCw } from "lucide-react";
import Link from "next/link";
import * as LucideIcons from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-20 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

const COMMON_ICONS = [
  "Home", "Info", "Briefcase", "Phone", "Mail", "MapPin", "Shield", "Star", "Check", "Award",
  "Hammer", "Construction", "Wind", "Sun", "Cloud", "Zap", "Layers", "Box", "Package",
  "Facebook", "Instagram", "Twitter", "Linkedin", "Youtube", "Github", "Globe",
  "Calendar", "Clock", "User", "Users", "Camera", "Image", "Video", "FileText", "File",
  "ShieldCheck", "Trophy", "CreditCard", "Settings", "Layout", "Menu", "ExternalLink",
  "ArrowRight", "ChevronRight", "Search", "Map", "Truck", "HardHat", "Ruler", "Paintbrush"
];

function IconPicker({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredIcons = COMMON_ICONS.filter(icon => icon.toLowerCase().includes(search.toLowerCase()));
  const CurrentIcon = (LucideIcons as any)[value] || LucideIcons.HelpCircle;

  return (
    <div className="relative inline-block">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 bg-white border border-[#8c8f94] rounded-[3px] px-3 py-1 text-[13px] hover:border-[#2271b1] transition-all">
        <CurrentIcon className="w-3.5 h-3.5 text-[#50575e]" />
        <span>{value || "Select Icon"}</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-64 bg-white border border-[#c3c4c7] shadow-md p-3 rounded-[3px]">
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px] mb-2 outline-none focus:border-[#2271b1]" autoFocus />
          <div className="grid grid-cols-6 gap-1 max-h-48 overflow-y-auto">
            {filteredIcons.map(iconName => {
              const Icon = (LucideIcons as any)[iconName];
              return (
                <button key={iconName} onClick={() => { onChange(iconName); setOpen(false); }} className={`p-1.5 rounded hover:bg-[#f0f0f1] ${value === iconName ? "bg-[#2271b1] text-white" : "text-[#50575e]"}`}>
                  {Icon && <Icon className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function PageSelector({ value, pages, onChange, label }: { value: string, pages: any[], onChange: (page: any) => void, label?: string }) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-[12px] font-semibold text-[#1d2327]">{label}</label>}
      <select 
        value={value || ""} 
        onChange={(e) => onChange(pages.find(p => p._id === e.target.value))}
        className="border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]"
      >
        <option value="">-- Custom Link --</option>
        <optgroup label="Pages">
          {pages.filter(p => p.type === 'page').map(page => <option key={page._id} value={page._id}>{page.title}</option>)}
        </optgroup>
        <optgroup label="Services">
          {pages.filter(p => p.type === 'service').map(page => <option key={page._id} value={page._id}>{page.title}</option>)}
        </optgroup>
      </select>
    </div>
  );
}

const SettingsRow = ({ label, children, description }: any) => (
  <div className="py-4 border-b border-[#f0f0f1] flex flex-col md:flex-row gap-4">
    <div className="w-full md:w-64 flex-shrink-0 pt-1">
      <label className="text-[14px] font-semibold text-[#1d2327]">{label}</label>
    </div>
    <div className="flex-1 space-y-2">
      {children}
      {description && <p className="text-[12px] text-[#646970] italic">{description}</p>}
    </div>
  </div>
);

export default function SettingsEditor() {
  const [data, setData] = useState<any>(null);
  const [pages, setPages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Redirect Manager States
  const [redirects, setRedirects] = useState<any[]>([]);
  const [totalRedirects, setTotalRedirects] = useState(0);
  const [redirectsPage, setRedirectsPage] = useState(1);
  const [loadingRedirects, setLoadingRedirects] = useState(false);
  const [redirectSearch, setRedirectSearch] = useState("");
  const [redirectStatusFilter, setRedirectStatusFilter] = useState("");
  const [redirectTypeFilter, setRedirectTypeFilter] = useState("");
  
  const [redirectForm, setRedirectForm] = useState({
    _id: "",
    sourceUrl: "",
    targetUrl: "",
    statusCode: 301,
    queryParamMode: "exact",
    ignoreCase: false,
    ignoreSlash: false,
    isRegex: false,
    status: "active",
    notes: ""
  });
  const [submittingRedirect, setSubmittingRedirect] = useState(false);
  const [redirectError, setRedirectError] = useState("");

  const fetchRedirects = async () => {
    setLoadingRedirects(true);
    try {
      const params = new URLSearchParams();
      if (redirectSearch) params.set("search", redirectSearch);
      if (redirectStatusFilter) params.set("status", redirectStatusFilter);
      if (redirectTypeFilter) params.set("type", redirectTypeFilter);
      params.set("page", redirectsPage.toString());
      params.set("limit", "10");

      const res = await fetch(`/api/admin/redirects?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setRedirects(data.items || []);
        setTotalRedirects(data.total || 0);
      }
    } catch (err) {
      console.error("Error fetching redirects:", err);
    } finally {
      setLoadingRedirects(false);
    }
  };

  const handleSaveRedirect = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingRedirect(true);
    setRedirectError("");
    try {
      const isEdit = !!redirectForm._id;
      const url = "/api/admin/redirects";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redirectForm)
      });

      const data = await res.json();
      if (res.ok) {
        setRedirectForm({
          _id: "",
          sourceUrl: "",
          targetUrl: "",
          statusCode: 301,
          queryParamMode: "exact",
          ignoreCase: false,
          ignoreSlash: false,
          isRegex: false,
          status: "active",
          notes: ""
        });
        setToast({ type: "ok", msg: isEdit ? "Redirect updated." : "Redirect added." });
        setTimeout(() => setToast(null), 3000);
        fetchRedirects();
      } else {
        setRedirectError(data.error || "An error occurred.");
      }
    } catch (err) {
      setRedirectError("Failed to save redirect.");
    } finally {
      setSubmittingRedirect(false);
    }
  };

  const handleDeleteRedirect = async (id: string) => {
    if (!confirm("Are you sure you want to delete this redirect?")) return;
    try {
      const res = await fetch("/api/admin/redirects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [id] })
      });
      if (res.ok) {
        setToast({ type: "ok", msg: "Redirect deleted." });
        setTimeout(() => setToast(null), 3000);
        fetchRedirects();
      }
    } catch (err) {
      console.error("Delete redirect error:", err);
    }
  };

  const handleToggleStatus = async (item: any) => {
    try {
      const updated = {
        ...item,
        status: item.status === "active" ? "disabled" : "active"
      };
      const res = await fetch("/api/admin/redirects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        setToast({ type: "ok", msg: `Redirect ${updated.status === 'active' ? 'enabled' : 'disabled'}.` });
        setTimeout(() => setToast(null), 3000);
        fetchRedirects();
      }
    } catch (err) {
      console.error("Toggle redirect status error:", err);
    }
  };

  useEffect(() => {
    fetch("/api/content").then((res) => res.json()).then((json) => {
        const d = { ...json };
        if (!d.settings) d.settings = { siteTitle: "Eagle Revolution", siteTemplate: "%s | Eagle Revolution", favicon: "/eagle-logo.png" };
        if (!d.navbar) d.navbar = { companyLinks: [], ctaText: "Book Now", ctaLink: "/contact-us", logo: "/eagle-logo.png" };
        setData(d);
      });
    Promise.all([
      fetch("/api/admin/pages").then(res => res.json()),
      fetch("/api/content").then(res => res.json())
    ]).then(([pagesJson, contentJson]) => {
      const pageList = (pagesJson || [])
        .filter((p: any) => p.status === 'published')
        .map((p: any) => ({ ...p, type: 'page' }));
      const serviceList = (contentJson.services?.services || contentJson.services || [])
        .filter((s: any) => s.status === 'published' || s.status === undefined)
        .map((s: any) => ({ ...s, _id: s._id || s.slug, type: 'service', title: s.title, slug: `services/${s.slug}` }));
      setPages([...pageList, ...serviceList]);
    });
  }, []);

  useEffect(() => {
    if (activeTab === "redirects") {
      fetchRedirects();
    }
  }, [activeTab, redirectsPage, redirectSearch, redirectStatusFilter, redirectTypeFilter]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) {
        setToast({ type: "ok", msg: "Settings saved." });
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast({ type: "err", msg: "Error saving settings." });
    } finally { setSaving(false); }
  };

  const updateData = (section: string, field: string | null, value: any) => {
    setData((prev: any) => ({ ...prev, [section]: field ? { ...prev[section], [field]: value } : value }));
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  const tabs = [
    { id: "general", label: "General", icon: Globe },
    { id: "header", label: "Header", icon: LayoutTemplate },
    { id: "footer", label: "Footer", icon: List },
    { id: "contact", label: "Contact", icon: Phone },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "redirects", label: "Redirect Manager", icon: RefreshCw },
  ];


  return (
    <div className="space-y-6">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Settings</h1>
      </div>

      {/* WP Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className={`px-4 py-2 bg-white border-l-4 text-[13px] shadow-sm mb-4 ${toast.type === "ok" ? "border-[#00a32a]" : "border-[#d63638]"}`}>
            <p className="text-[#1d2327] m-0">{toast.msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WP-Style Tabs (Subsubsub) */}
      <div className="flex items-center gap-2 text-[13px] mb-6">
        {tabs.map((tab, idx) => (
          <React.Fragment key={tab.id}>
            <button onClick={() => setActiveTab(tab.id)} className={`${activeTab === tab.id ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7]">|</span>}
          </React.Fragment>
        ))}
      </div>

      {/* Settings Form Container */}
      <div className="bg-white border border-[#c3c4c7] p-8 rounded-sm shadow-sm max-w-4xl">
        <AnimatePresence mode="wait">
          {activeTab === "general" && (
            <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">General Settings</h2>
               <SettingsRow label="Site Title" description="The main name of your business as it appears in the browser tab.">
                  <input type="text" value={data.settings?.siteTitle || ""} onChange={(e) => updateData("settings", "siteTitle", e.target.value)} className="w-full max-w-md border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] outline-none" />
               </SettingsRow>
               <SettingsRow label="Title Template" description="How page titles are constructed. %s will be replaced by the page name.">
                  <input type="text" value={data.settings?.siteTemplate || ""} onChange={(e) => updateData("settings", "siteTemplate", e.target.value)} className="w-full max-w-md border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] outline-none" />
               </SettingsRow>
               <SettingsRow label="Homepage" description="Select which page or service should be displayed on the root (/) URL.">
                  <select 
                    value={data.settings?.homepageId || ""} 
                    onChange={(e) => updateData("settings", "homepageId", e.target.value)}
                    className="w-full max-w-md border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] outline-none"
                  >
                    <option value="">Default (Home Template)</option>
                    <optgroup label="Published Pages">
                      {pages.filter(p => p.type === 'page' && p.published !== false).map(page => (
                        <option key={page._id} value={page._id}>{page.title}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Published Services">
                      {pages.filter(p => p.type === 'service').map(page => (
                        <option key={page._id} value={page._id}>{page.title}</option>
                      ))}
                    </optgroup>
                  </select>
               </SettingsRow>
               <SettingsRow label="Site Favicon" description="Upload the small icon that appears in the browser tab.">
                  <ImageField value={data.settings?.favicon || ""} onChange={(val) => updateData("settings", "favicon", val)} label="Favicon" />
               </SettingsRow>
            </motion.div>
          )}

          {activeTab === "header" && (
            <motion.div key="header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">Header & Navigation</h2>
               <SettingsRow label="Navbar Logo">
                  <ImageField value={data.navbar?.logo || ""} onChange={(val) => updateData("navbar", "logo", val)} label="Logo" />
               </SettingsRow>
               <SettingsRow label="CTA Button">
                  <div className="flex gap-4">
                     <input type="text" placeholder="Text" value={data.navbar?.ctaText || ""} onChange={(e) => updateData("navbar", "ctaText", e.target.value)} className="w-40 border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                     <input type="text" placeholder="Link" value={data.navbar?.ctaLink || ""} onChange={(e) => updateData("navbar", "ctaLink", e.target.value)} className="flex-1 border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
                  </div>
               </SettingsRow>
               
               <div className="mt-8 pt-8 border-t border-[#c3c4c7]">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-normal text-[#1d2327] font-serif">Navigation Menu</h3>
                     <button onClick={() => updateData("navbar", "companyLinks", [...(data.navbar?.companyLinks || []), { label: "New Link", href: "/", icon: "Info", subLinks: [] }])} className="text-[#2271b1] hover:underline text-[13px]">+ Add Link</button>
                  </div>
                  <div className="space-y-6">
                     {(data.navbar?.companyLinks || []).map((link: any, idx: number) => (
                        <div key={idx} className="bg-[#f6f7f7] border border-[#c3c4c7] p-5 rounded-sm space-y-5 relative">
                           <div className="absolute top-2 right-2 flex gap-1">
                              <button 
                                onClick={() => {
                                  if (idx === 0) return;
                                  const nl = [...data.navbar.companyLinks];
                                  const temp = nl[idx - 1];
                                  nl[idx - 1] = nl[idx];
                                  nl[idx] = temp;
                                  updateData("navbar", "companyLinks", nl);
                                }}
                                disabled={idx === 0}
                                className="p-1 text-[#50575e] hover:bg-[#dcdcde] rounded disabled:opacity-30 transition-colors"
                                title="Move Up"
                              >
                                ↑
                              </button>
                              <button 
                                onClick={() => {
                                  if (idx === data.navbar.companyLinks.length - 1) return;
                                  const nl = [...data.navbar.companyLinks];
                                  const temp = nl[idx + 1];
                                  nl[idx + 1] = nl[idx];
                                  nl[idx] = temp;
                                  updateData("navbar", "companyLinks", nl);
                                }}
                                disabled={idx === data.navbar.companyLinks.length - 1}
                                className="p-1 text-[#50575e] hover:bg-[#dcdcde] rounded disabled:opacity-30 transition-colors"
                                title="Move Down"
                              >
                                ↓
                              </button>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pr-16">
                              <PageSelector value={link.pageId} pages={pages} label="Map to Page" onChange={(p) => {
                                 const nl = [...data.navbar.companyLinks];
                                 nl[idx] = { ...nl[idx], pageId: p?._id || "", label: p?.title || nl[idx].label, href: p ? "/"+p.slug : nl[idx].href };
                                 updateData("navbar", "companyLinks", nl);
                              }} />
                              <div className="flex flex-col gap-1">
                                 <label className="text-[12px] font-semibold text-[#1d2327]">Label</label>
                                 <input type="text" value={link.label} onChange={(e) => {
                                    const nl = [...data.navbar.companyLinks];
                                    nl[idx].label = e.target.value;
                                    updateData("navbar", "companyLinks", nl);
                                 }} className="border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-[12px] font-semibold text-[#1d2327]">Path/URL</label>
                                 <input type="text" value={link.href} onChange={(e) => {
                                    const nl = [...data.navbar.companyLinks];
                                    nl[idx].href = e.target.value;
                                    updateData("navbar", "companyLinks", nl);
                                 }} className="border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                              </div>
                              <div className="flex flex-col gap-1">
                                 <label className="text-[12px] font-semibold text-[#1d2327]">Icon</label>
                                 <IconPicker value={link.icon} onChange={(v) => {
                                    const nl = [...data.navbar.companyLinks];
                                    nl[idx].icon = v;
                                    updateData("navbar", "companyLinks", nl);
                                 }} />
                              </div>
                              <div className="flex flex-col gap-2 pt-5">
                                 <label className="flex items-center gap-2 cursor-pointer text-[12px] text-[#1d2327]">
                                   <input type="checkbox" checked={link.useMegaMenu || false} onChange={(e) => {
                                      const nl = [...data.navbar.companyLinks];
                                      nl[idx].useMegaMenu = e.target.checked;
                                      updateData("navbar", "companyLinks", nl);
                                   }} className="rounded-sm border-[#8c8f94]" />
                                   Use Services Mega Menu
                                 </label>
                                 <button onClick={() => updateData("navbar", "companyLinks", data.navbar.companyLinks.filter((_:any,i:number)=>i!==idx))} className="text-[#d63638] hover:underline text-[12px] text-left">Remove Parent</button>
                              </div>
                           </div>

                           {/* SUBMENU EDITOR */}
                           <div className="pl-6 border-l-2 border-[#c3c4c7] space-y-4">
                              <div className="flex items-center justify-between">
                                 <span className="text-[11px] font-bold text-[#646970] uppercase tracking-wider">Submenu Items</span>
                                 <button onClick={() => {
                                    const nl = [...data.navbar.companyLinks];
                                    if(!nl[idx].subLinks) nl[idx].subLinks = [];
                                    nl[idx].subLinks.push({ label: "New Sub Item", href: "/", icon: "ChevronRight", pageId: "" });
                                    updateData("navbar", "companyLinks", nl);
                                 }} className="text-[#2271b1] text-[11px] hover:underline font-bold">+ Add Submenu Item</button>
                              </div>
                              <div className="space-y-3">
                                 {(link.subLinks || []).map((sub: any, sIdx: number) => (
                                    <div key={sIdx} className="bg-white p-4 border border-[#dcdcde] rounded-sm shadow-sm space-y-3">
                                       <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
                                          <PageSelector value={sub.pageId} pages={pages} label="Map Sub Page" onChange={(p) => {
                                             const nl = [...data.navbar.companyLinks];
                                             nl[idx].subLinks[sIdx] = { ...nl[idx].subLinks[sIdx], pageId: p?._id || "", label: p?.title || nl[idx].subLinks[sIdx].label, href: p ? "/"+p.slug : nl[idx].subLinks[sIdx].href };
                                             updateData("navbar", "companyLinks", nl);
                                          }} />
                                          <div className="flex flex-col gap-1">
                                             <label className="text-[11px] font-semibold">Sub Label</label>
                                             <input type="text" value={sub.label} onChange={(e) => {
                                                const nl = [...data.navbar.companyLinks];
                                                nl[idx].subLinks[sIdx].label = e.target.value;
                                                updateData("navbar", "companyLinks", nl);
                                             }} className="border border-[#8c8f94] px-2 py-1 text-[12px] rounded-[3px]" />
                                          </div>
                                          <div className="flex flex-col gap-1">
                                             <label className="text-[11px] font-semibold">Sub Path</label>
                                             <input type="text" value={sub.href} onChange={(e) => {
                                                const nl = [...data.navbar.companyLinks];
                                                nl[idx].subLinks[sIdx].href = e.target.value;
                                                updateData("navbar", "companyLinks", nl);
                                             }} className="border border-[#8c8f94] px-2 py-1 text-[12px] rounded-[3px]" />
                                          </div>
                                          <div className="flex items-center justify-between pt-4">
                                             <IconPicker value={sub.icon || "ChevronRight"} onChange={(v) => {
                                                const nl = [...data.navbar.companyLinks];
                                                nl[idx].subLinks[sIdx].icon = v;
                                                updateData("navbar", "companyLinks", nl);
                                             }} />
                                             <button onClick={() => {
                                                const nl = [...data.navbar.companyLinks];
                                                nl[idx].subLinks = nl[idx].subLinks.filter((_:any, i:number) => i !== sIdx);
                                                updateData("navbar", "companyLinks", nl);
                                             }} className="text-[#d63638] hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                                          </div>
                                       </div>
                                    </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === "footer" && (
            <motion.div key="footer" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">Footer Content</h2>
               <SettingsRow label="Footer Logo">
                  <ImageField value={data.footer?.company?.logo || ""} onChange={(val) => updateData("footer", "company", { ...data.footer.company, logo: val })} label="Logo" />
               </SettingsRow>
               <SettingsRow label="Company Name">
                  <input type="text" value={data.footer?.company?.name || ""} onChange={(e) => updateData("footer", "company", { ...data.footer.company, name: e.target.value })} className="w-full max-w-md border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
               </SettingsRow>
               <SettingsRow label="Footer Description">
                  <RichTextEditor 
                    content={data.footer?.company?.description || ""} 
                    onChange={(v) => updateData("footer", "company", { ...data.footer.company, description: v })} 
                  />
               </SettingsRow>
               <SettingsRow label="Marquee Text" description="Add messages for the scrolling bottom bar.">
                  <div className="space-y-2">
                     {(data.footer?.marquee?.texts || []).map((t: string, i: number) => (
                        <div key={i} className="flex gap-2">
                           <input type="text" value={t} onChange={(e) => {
                              const nt = [...data.footer.marquee.texts];
                              nt[i] = e.target.value;
                              updateData("footer", "marquee", { ...data.footer.marquee, texts: nt });
                           }} className="flex-1 border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                           <button onClick={() => {
                              const nt = data.footer.marquee.texts.filter((_:any, idx:number) => idx !== i);
                              updateData("footer", "marquee", { ...data.footer.marquee, texts: nt });
                           }} className="text-[#d63638] text-xs">Remove</button>
                        </div>
                     ))}
                     <button onClick={() => updateData("footer", "marquee", { ...data.footer.marquee, texts: [...(data.footer.marquee?.texts || []), "New Announcement"] })} className="text-[#2271b1] text-xs underline">+ Add Item</button>
                  </div>
               </SettingsRow>
               <SettingsRow label="Services Menu Title" description="The title for the dynamic services list in the footer.">
                  <input type="text" value={data.footer?.services?.title || "Our Services"} onChange={(e) => updateData("footer", "services", { ...data.footer.services, title: e.target.value })} className="w-full max-w-md border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" />
               </SettingsRow>
               <SettingsRow label="Selected Footer Services" description="Select which services to display in the footer. If none are selected, all published services will be shown.">
                  <div className="flex flex-wrap gap-2">
                     {pages.filter(p => p.type === 'service').map(service => {
                        const isSelected = data.footer?.services?.selectedServices?.includes(service._id);
                        return (
                           <label key={service._id} className="flex items-center gap-2 bg-[#f6f7f7] border border-[#c3c4c7] px-3 py-1.5 rounded-[3px] text-[13px] cursor-pointer hover:bg-white transition-colors">
                              <input
                                 type="checkbox"
                                 checked={!!isSelected}
                                 onChange={(e) => {
                                    const selected = data.footer?.services?.selectedServices || [];
                                    if (e.target.checked) {
                                       updateData("footer", "services", { ...data.footer.services, selectedServices: [...selected, service._id] });
                                    } else {
                                       updateData("footer", "services", { ...data.footer.services, selectedServices: selected.filter((id: string) => id !== service._id) });
                                    }
                                 }}
                              />
                              {service?.title || "Unknown Service"}
                           </label>
                        );
                     })}
                     <div className="w-full mt-2">
                        <select 
                           className="border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px] w-full max-w-xs"
                           value=""
                           onChange={(e) => {
                              const selected = data.footer?.services?.selectedServices || [];
                              if(e.target.value && !selected.includes(e.target.value)) {
                                 updateData("footer", "services", { ...data.footer.services, selectedServices: [...selected, e.target.value] });
                              }
                           }}
                        >
                           <option value="">+ Add Service</option>
                           {pages.filter(p => p.type === 'service' && !(data.footer?.services?.selectedServices || []).includes(p._id)).map(service => (
                              <option key={service._id} value={service._id}>{service.title}</option>
                           ))}
                        </select>
                     </div>
                  </div>
               </SettingsRow>
                <SettingsRow label="Company Menu Title" description="The title for the company links section in the footer (defaults to 'Company').">
                   <input
                     type="text"
                     value={data.footer?.services?.materials?.title || "Company"}
                     onChange={(e) => {
                       const materials = data.footer?.services?.materials || { title: "Company", items: [] };
                       updateData("footer", "services", {
                         ...data.footer.services,
                         materials: { ...materials, title: e.target.value }
                       });
                     }}
                     className="w-full max-w-md border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]"
                   />
                </SettingsRow>
                <SettingsRow label="Company Links" description="Manage the links shown in the Company footer menu. Select from your pages or custom paths.">
                   <div className="space-y-3">
                      {(data.footer?.services?.materials?.items || []).map((link: any, i: number) => (
                         <div key={i} className="flex gap-4 items-center bg-[#f6f7f7] p-3 border border-[#c3c4c7] rounded-sm">
                            <div className="flex-1 space-y-1">
                               <label className="text-[11px] font-bold">Link Label</label>
                               <input
                                 type="text"
                                 value={link.label || ""}
                                 onChange={(e) => {
                                   const items = [...(data.footer.services.materials.items || [])];
                                   items[i].label = e.target.value;
                                   updateData("footer", "services", {
                                     ...data.footer.services,
                                     materials: { ...data.footer.services.materials, items }
                                   });
                                 }}
                                 className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                               />
                            </div>
                            <div className="flex-1 space-y-1">
                               <label className="text-[11px] font-bold">Destination Page</label>
                               <select
                                 value={link.href}
                                 onChange={(e) => {
                                   const items = [...(data.footer.services.materials.items || [])];
                                   items[i].href = e.target.value;
                                   updateData("footer", "services", {
                                     ...data.footer.services,
                                     materials: { ...data.footer.services.materials, items }
                                   });
                                 }}
                                 className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]"
                               >
                                  <option value="/">Home</option>
                                  <option value="/blog">Blog Index</option>
                                  <optgroup label="Pages">
                                     {pages.filter(p => p.type !== 'service').map((p: any) => (
                                        <option key={p._id} value={p.slug.startsWith('/') ? p.slug : `/${p.slug}`}>{p.title}</option>
                                     ))}
                                  </optgroup>
                                  <optgroup label="Services">
                                     {pages.filter(p => p.type === 'service').map((p: any) => (
                                        <option key={p._id} value={`/services/${p.slug}`}>{p.title}</option>
                                     ))}
                                  </optgroup>
                               </select>
                            </div>
                            <button
                              onClick={() => {
                                const items = (data.footer.services.materials.items || []).filter((_: any, idx: number) => idx !== i);
                                updateData("footer", "services", {
                                  ...data.footer.services,
                                  materials: { ...data.footer.services.materials, items }
                                });
                              }}
                              className="text-[#d63638] text-[13px] mt-5 hover:underline"
                            >
                              Remove
                            </button>
                         </div>
                      ))}
                      <button
                        onClick={() => {
                          const materials = data.footer?.services?.materials || { title: "Company", items: [] };
                          const items = materials.items || [];
                          updateData("footer", "services", {
                            ...data.footer.services,
                            materials: { ...materials, items: [...items, { label: "New Link", href: "/" }] }
                          });
                        }}
                        className="text-[#2271b1] text-[13px] hover:underline"
                      >
                        + Add Company Link
                      </button>
                   </div>
                </SettingsRow>
               <SettingsRow label="Certifications">
                  <div className="space-y-4">
                     {(data.footer?.certifications || []).map((cert: any, i: number) => (
                        <div key={i} className="flex gap-4 items-end bg-[#f6f7f7] p-4 border border-[#c3c4c7] rounded-sm">
                           <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-bold">Certification Name</label>
                              <input type="text" value={cert.cert || ""} onChange={(e) => {
                                 const nc = [...data.footer.certifications];
                                 nc[i].cert = e.target.value;
                                 updateData("footer", "certifications", nc);
                              }} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                           </div>
                           <div className="flex-1 space-y-1">
                              <label className="text-[11px] font-bold">License / Number</label>
                              <input type="text" value={cert.number || ""} onChange={(e) => {
                                 const nc = [...data.footer.certifications];
                                 nc[i].number = e.target.value;
                                 updateData("footer", "certifications", nc);
                              }} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                           </div>
                           <div className="space-y-1 w-24">
                              <label className="text-[11px] font-bold">Icon</label>
                              <IconPicker value={cert.icon || "ShieldCheck"} onChange={(v) => {
                                 const nc = [...data.footer.certifications];
                                 nc[i].icon = v;
                                 updateData("footer", "certifications", nc);
                              }} />
                           </div>
                           <button onClick={() => {
                              const nc = data.footer.certifications.filter((_:any, idx:number) => idx !== i);
                              updateData("footer", "certifications", nc);
                           }} className="text-[#d63638] text-[13px] mb-1 hover:underline">Remove</button>
                        </div>
                     ))}
                     <button onClick={() => updateData("footer", "certifications", [...(data.footer.certifications || []), { cert: "New Cert", number: "#123456", icon: "ShieldCheck" }])} className="text-[#2271b1] text-[13px] hover:underline">+ Add Certification</button>
                  </div>
               </SettingsRow>
            </motion.div>
          )}

          {activeTab === "contact" && (
            <motion.div key="contact" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">Global Contact Information</h2>
               <p className="text-[12px] text-[#646970] italic mb-6">HTML is supported in all fields below (e.g. &lt;br&gt;, &lt;strong&gt;, &lt;a href=&quot;...&quot;&gt;, &lt;span&gt;). Content is safely sanitized.</p>
               <SettingsRow label="Primary Email" description="Supports HTML. E.g. &lt;a href='mailto:...'&gt;email&lt;/a&gt;">
                  <RichTextEditor
                    content={data.footer?.contact?.email || ""}
                    onChange={(v) => updateData("footer", "contact", { ...data.footer.contact, email: v })}
                  />
               </SettingsRow>
               <SettingsRow label="Primary Phone" description="Supports HTML. E.g. &lt;a href='tel:...'&gt;number&lt;/a&gt;">
                  <RichTextEditor
                    content={data.footer?.contact?.phone || ""}
                    onChange={(v) => updateData("footer", "contact", { ...data.footer.contact, phone: v })}
                  />
               </SettingsRow>
               <SettingsRow label="Office Address" description="Supports HTML. E.g. use &lt;br&gt; for line breaks.">
                  <RichTextEditor
                    content={data.footer?.contact?.address || ""}
                    onChange={(v) => updateData("footer", "contact", { ...data.footer.contact, address: v })}
                  />
               </SettingsRow>
               <SettingsRow label="24/7 Emergency Text" description="Supports HTML.">
                  <RichTextEditor
                    content={data.footer?.contact?.emergency || ""}
                    onChange={(v) => updateData("footer", "contact", { ...data.footer.contact, emergency: v })}
                  />
               </SettingsRow>
               <SettingsRow label="Service Areas" description="Supports HTML.">
                  <RichTextEditor
                    content={data.footer?.contact?.areas || ""}
                    onChange={(v) => updateData("footer", "contact", { ...data.footer.contact, areas: v })}
                  />
               </SettingsRow>
               <SettingsRow label="Office Hours">
                  <div className="grid grid-cols-3 gap-2">
                     <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Mon-Fri</label>
                        <input type="text" value={data.hours?.monday} onChange={(e) => updateData("hours", "monday", e.target.value)} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Saturday</label>
                        <input type="text" value={data.hours?.saturday} onChange={(e) => updateData("hours", "saturday", e.target.value)} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[11px] text-[#646970]">Sunday</label>
                        <input type="text" value={data.hours?.sunday} onChange={(e) => updateData("hours", "sunday", e.target.value)} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                     </div>
                  </div>
               </SettingsRow>
            </motion.div>
          )}

          {activeTab === "social" && (
            <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">Social Media Profiles</h2>
               <div className="space-y-4">
                  {(data.footer?.social || []).map((s: any, i: number) => (
                     <div key={i} className="flex gap-4 items-end bg-[#f6f7f7] p-4 border border-[#c3c4c7] rounded-sm">
                        <div className="flex-1 space-y-1">
                           <label className="text-[11px] font-bold">Platform Name</label>
                           <input type="text" value={s.platform} onChange={(e) => {
                              const ns = [...data.footer.social];
                              ns[i].platform = e.target.value;
                              updateData("footer", "social", ns);
                           }} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="flex-1 space-y-1">
                           <label className="text-[11px] font-bold">URL</label>
                           <input type="text" value={s.href} onChange={(e) => {
                              const ns = [...data.footer.social];
                              ns[i].href = e.target.value;
                              updateData("footer", "social", ns);
                           }} className="w-full border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px]" />
                        </div>
                        <div className="space-y-1">
                           <label className="text-[11px] font-bold">Icon</label>
                           <IconPicker value={s.icon} onChange={(v) => {
                              const ns = [...data.footer.social];
                              ns[i].icon = v;
                              updateData("footer", "social", ns);
                           }} />
                        </div>
                        <button onClick={() => updateData("footer", "social", data.footer.social.filter((_:any,idx:number)=>idx!==i))} className="p-2 text-[#d63638] hover:bg-white rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                     </div>
                  ))}
                  <button onClick={() => updateData("footer", "social", [...(data.footer?.social || []), { platform: "Facebook", href: "", icon: "Facebook" }])} className="text-[#2271b1] text-xs underline font-bold">+ Add New Social Profile</button>
               </div>
            </motion.div>
          )}

          {activeTab === "redirects" && (
            <motion.div key="redirects" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               <h2 className="text-xl font-normal text-[#1d2327] mb-6 font-serif">Redirect Manager</h2>
               
               {/* Form Container */}
               <form onSubmit={handleSaveRedirect} className="bg-[#f6f7f7] border border-[#c3c4c7] p-6 rounded-sm space-y-4 mb-8">
                  <h3 className="text-sm font-bold text-[#1d2327] border-b border-[#c3c4c7] pb-2 m-0">
                    {redirectForm._id ? "Edit Redirect Rule" : "Add New Redirect Rule"}
                  </h3>
                  
                  {redirectError && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 text-[13px] rounded-sm">
                      {redirectError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#1d2327] flex items-center gap-1">
                          Source URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. /old-page or ^/old-posts/(.*)"
                          value={redirectForm.sourceUrl}
                          onChange={(e) => setRedirectForm({ ...redirectForm, sourceUrl: e.target.value })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                        />
                     </div>

                     <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#1d2327] flex items-center gap-1">
                          Target URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. /new-page or /new-posts/$1"
                          value={redirectForm.targetUrl}
                          onChange={(e) => setRedirectForm({ ...redirectForm, targetUrl: e.target.value })}
                          className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#1d2327]">Redirect Type</label>
                        <select
                          value={redirectForm.statusCode}
                          onChange={(e) => setRedirectForm({ ...redirectForm, statusCode: parseInt(e.target.value, 10) })}
                          className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                        >
                          <option value={301}>301 Permanent Redirect</option>
                          <option value={302}>302 Temporary Redirect</option>
                          <option value={307}>307 Temporary Redirect</option>
                          <option value={308}>308 Permanent Redirect</option>
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#1d2327]">Query Parameters</label>
                        <select
                          value={redirectForm.queryParamMode}
                          onChange={(e) => setRedirectForm({ ...redirectForm, queryParamMode: e.target.value })}
                          className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                        >
                          <option value="exact">Exact match in any order</option>
                          <option value="ignore">Ignore all parameters</option>
                          <option value="pass">Exact match only</option>
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[12px] font-bold text-[#1d2327]">Status</label>
                        <select
                          value={redirectForm.status}
                          onChange={(e) => setRedirectForm({ ...redirectForm, status: e.target.value })}
                          className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="disabled">Disabled</option>
                        </select>
                     </div>
                  </div>

                  {/* Checkbox Options */}
                  <div className="flex flex-wrap items-center gap-6 pt-2">
                     <label className="flex items-center gap-2 text-[13px] text-[#2c3338] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={redirectForm.ignoreCase}
                          onChange={(e) => setRedirectForm({ ...redirectForm, ignoreCase: e.target.checked })}
                          className="rounded-sm border-[#8c8f94]"
                        />
                        Ignore Case
                     </label>
                     <label className="flex items-center gap-2 text-[13px] text-[#2c3338] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={redirectForm.ignoreSlash}
                          onChange={(e) => setRedirectForm({ ...redirectForm, ignoreSlash: e.target.checked })}
                          className="rounded-sm border-[#8c8f94]"
                        />
                        Ignore Slash
                     </label>
                     <label className="flex items-center gap-2 text-[13px] text-[#2c3338] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={redirectForm.isRegex}
                          onChange={(e) => setRedirectForm({ ...redirectForm, isRegex: e.target.checked })}
                          className="rounded-sm border-[#8c8f94]"
                        />
                        Regex Match
                     </label>
                  </div>

                  <div className="space-y-1">
                     <label className="text-[12px] font-bold text-[#1d2327]">Notes</label>
                     <input
                       type="text"
                       placeholder="Optional notes for reference..."
                       value={redirectForm.notes}
                       onChange={(e) => setRedirectForm({ ...redirectForm, notes: e.target.value })}
                       className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                     />
                  </div>

                  <div className="flex gap-2 pt-2">
                     <button
                       type="submit"
                       disabled={submittingRedirect}
                       className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96]"
                     >
                       {submittingRedirect ? "Saving..." : redirectForm._id ? "Update Redirect" : "Add Redirect"}
                     </button>
                     {redirectForm._id && (
                       <button
                         type="button"
                         onClick={() => setRedirectForm({
                           _id: "",
                           sourceUrl: "",
                           targetUrl: "",
                           statusCode: 301,
                           queryParamMode: "exact",
                           ignoreCase: false,
                           ignoreSlash: false,
                           isRegex: false,
                           status: "active",
                           notes: ""
                         })}
                         className="bg-white border border-[#8c8f94] text-[#2c3338] px-4 py-1.5 rounded-[3px] text-[13px] hover:bg-[#f6f7f7]"
                       >
                         Cancel Edit
                       </button>
                     )}
                  </div>
               </form>

               {/* Search, Filter, and Table controls */}
               <div className="flex flex-col sm:flex-row gap-3 items-center justify-between mb-4 pt-4 border-t border-[#c3c4c7]">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                     <input
                       type="text"
                       placeholder="Search redirects..."
                       value={redirectSearch}
                       onChange={(e) => { setRedirectSearch(e.target.value); setRedirectsPage(1); }}
                       className="border border-[#8c8f94] px-3 py-1.5 text-[13px] rounded-[3px] w-full sm:w-64 outline-none focus:border-[#2271b1]"
                     />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
                     <select
                       value={redirectStatusFilter}
                       onChange={(e) => { setRedirectStatusFilter(e.target.value); setRedirectsPage(1); }}
                       className="border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px]"
                     >
                       <option value="">All Statuses</option>
                       <option value="active">Active Only</option>
                       <option value="disabled">Disabled Only</option>
                     </select>

                     <select
                       value={redirectTypeFilter}
                       onChange={(e) => { setRedirectTypeFilter(e.target.value); setRedirectsPage(1); }}
                       className="border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px]"
                     >
                       <option value="">All Types</option>
                       <option value="301">301 Permanent</option>
                       <option value="302">302 Temporary</option>
                       <option value="307">307 Temporary</option>
                       <option value="308">308 Permanent</option>
                     </select>
                  </div>
               </div>

               {/* Table */}
               <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                     <thead>
                        <tr className="border-b border-[#c3c4c7] bg-white text-[#1d2327]">
                           <th className="py-2 px-3 text-[13px] font-semibold">Source</th>
                           <th className="py-2 px-3 text-[13px] font-semibold">Target</th>
                           <th className="py-2 px-3 text-[13px] font-semibold w-24">Type</th>
                           <th className="py-2 px-3 text-[13px] font-semibold w-20">Hits</th>
                           <th className="py-2 px-3 text-[13px] font-semibold w-24">Status</th>
                           <th className="py-2 px-3 text-[13px] font-semibold w-32">Created</th>
                           <th className="py-2 px-3 text-[13px] font-semibold w-28">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="text-[13px] text-[#2c3338] divide-y divide-[#f0f0f1]">
                        {loadingRedirects ? (
                           <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                                Loading redirect rules...
                              </td>
                           </tr>
                        ) : redirects.length === 0 ? (
                           <tr>
                              <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                                No redirect rules found.
                              </td>
                           </tr>
                        ) : (
                           redirects.map((item) => (
                              <tr key={item._id} className="hover:bg-[#f0f0f1] transition-colors group">
                                 <td className="py-3 px-3 align-top font-mono break-all text-[12px] max-w-[200px]">
                                    {item.sourceUrl}
                                    {item.isRegex && (
                                      <span className="ml-1 bg-purple-100 text-purple-800 text-[10px] px-1 rounded font-sans">regex</span>
                                    )}
                                    {item.ignoreCase && (
                                      <span className="ml-1 bg-blue-100 text-blue-800 text-[10px] px-1 rounded font-sans">case</span>
                                    )}
                                    {item.ignoreSlash && (
                                      <span className="ml-1 bg-green-100 text-green-800 text-[10px] px-1 rounded font-sans">slash</span>
                                    )}
                                 </td>
                                 <td className="py-3 px-3 align-top font-mono break-all text-[12px] max-w-[200px]">
                                    {item.targetUrl}
                                 </td>
                                 <td className="py-3 px-3 align-top font-bold text-slate-600">
                                    {item.statusCode}
                                 </td>
                                 <td className="py-3 px-3 align-top text-slate-700">
                                    <span className="font-semibold">{item.hits || 0}</span>
                                    {item.lastAccessed && (
                                      <span className="block text-[10px] text-slate-400 font-sans">
                                        Last: {new Date(item.lastAccessed).toLocaleDateString()}
                                      </span>
                                    )}
                                 </td>
                                 <td className="py-3 px-3 align-top">
                                    <button
                                      type="button"
                                      onClick={() => handleToggleStatus(item)}
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                                        item.status === "active"
                                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                                          : "bg-red-100 text-red-800 hover:bg-red-200"
                                      }`}
                                    >
                                      {item.status}
                                    </button>
                                 </td>
                                 <td className="py-3 px-3 align-top text-slate-500">
                                    {new Date(item.createdAt).toLocaleDateString()}
                                 </td>
                                 <td className="py-3 px-3 align-top">
                                    <div className="flex items-center gap-2">
                                       <button
                                         type="button"
                                         onClick={() => setRedirectForm({ ...item })}
                                         className="text-[#2271b1] hover:underline text-[12px]"
                                       >
                                          Edit
                                       </button>
                                       <span className="text-slate-300">|</span>
                                       <button
                                         type="button"
                                         onClick={() => handleDeleteRedirect(item._id)}
                                         className="text-[#d63638] hover:underline text-[12px]"
                                       >
                                          Delete
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Pagination */}
               {totalRedirects > 10 && (
                  <div className="flex items-center justify-between pt-4">
                     <span className="text-[12px] text-slate-500">
                       Showing {(redirectsPage - 1) * 10 + 1} to {Math.min(redirectsPage * 10, totalRedirects)} of {totalRedirects} redirects
                     </span>
                     <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={redirectsPage === 1}
                          onClick={() => setRedirectsPage((prev) => Math.max(1, prev - 1))}
                          className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 rounded-[3px] text-[12px] hover:bg-[#f6f7f7] disabled:opacity-50"
                        >
                           Prev
                        </button>
                        <button
                          type="button"
                          disabled={redirectsPage * 10 >= totalRedirects}
                          onClick={() => setRedirectsPage((prev) => prev + 1)}
                          className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 rounded-[3px] text-[12px] hover:bg-[#f6f7f7] disabled:opacity-50"
                        >
                           Next
                        </button>
                     </div>
                  </div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== "redirects" && (
          <div className="mt-12 pt-6 border-t border-[#c3c4c7]">
             <button
               onClick={handleSave}
               disabled={saving}
               className="bg-[#2271b1] text-white px-6 py-2 rounded-[3px] text-[13px] font-semibold border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96] transition-all disabled:opacity-50 flex items-center gap-2 shadow-[0_1px_0_#135e96]"
             >
               {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
               Save Changes
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

