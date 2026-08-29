"use client";

import { useState, useEffect } from "react";
import { Search, Check, Loader2, Image as ImageIcon, ChevronUp, ChevronDown, X } from "lucide-react";
import { motion } from "framer-motion";

interface ContentSelectorProps {
  type: "services" | "projects" | "reviews" | "faq";
  selectedItems: any[];
  onSelect: (items: any[]) => void;
  label: string;
}

export default function ContentSelector({ type, selectedItems = [], onSelect, label }: ContentSelectorProps) {
  const safeSelectedItems = Array.isArray(selectedItems) ? selectedItems : [];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchMasterList = async () => {
      try {
        const res = await fetch("/api/content", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        let masterList: any[] = [];
        if (type === "services") {
          if (Array.isArray(data?.services?.services) && data.services.services.length > 0) {
            masterList = data.services.services;
          } else if (Array.isArray(data?.services) && data.services.length > 0) {
            masterList = data.services;
          } else if (Array.isArray(data?.globalServices) && data.globalServices.length > 0) {
            masterList = data.globalServices;
          } else if (Array.isArray(data?.services?.list) && data.services.list.length > 0) {
            masterList = data.services.list;
          } else {
            masterList = [
              { id: "srv-1", title: "Custom Web Applications", slug: "custom-web-applications", tagline: "Scalable Full-Stack Engineering", category: "DEVELOPMENT", icon: "Code" },
              { id: "srv-2", title: "UI/UX & Product Design", slug: "ui-ux-design-architecture", tagline: "Modern High-Converting Interfaces", category: "DESIGN", icon: "Palette" },
              { id: "srv-3", title: "E-Commerce Systems", slug: "e-commerce-platforms", tagline: "High-Volume Transaction Stores", category: "COMMERCE", icon: "ShoppingCart" },
              { id: "srv-4", title: "Performance & Technical SEO", slug: "performance-technical-seo", tagline: "Sub-Second Page Load Optimization", category: "OPTIMIZATION", icon: "Zap" },
              { id: "srv-5", title: "Cloud Architecture & APIs", slug: "full-stack-cloud-development", tagline: "Secure, Distributed Backend Systems", category: "INFRASTRUCTURE", icon: "Server" },
              { id: "srv-6", title: "Monthly SLA & Maintenance", slug: "dedicated-maintenance-support", tagline: "Continuous Proactive Management", category: "SUPPORT", icon: "ShieldCheck" }
            ];
          }
        } else if (type === "projects") {
          masterList = data?.portfolio?.projects || data?.galleryPage?.projects || [];
        } else if (type === "reviews") {
          masterList = data?.testimonials?.list || data?.testimonials?.testimonials || [];
        } else if (type === "faq") {
          masterList = data?.faq?.list || data?.faq?.items || [];
        }

        if (isMounted) setItems(masterList);
      } catch (err) {
        console.warn("ContentSelector using fallback master items:", err);
        if (isMounted) {
          if (type === "services") {
            setItems([
              { id: "srv-1", title: "Custom Web Applications", slug: "custom-web-applications", tagline: "Scalable Full-Stack Engineering", category: "DEVELOPMENT", icon: "Code" },
              { id: "srv-2", title: "UI/UX & Product Design", slug: "ui-ux-design-architecture", tagline: "Modern High-Converting Interfaces", category: "DESIGN", icon: "Palette" },
              { id: "srv-3", title: "E-Commerce Systems", slug: "e-commerce-platforms", tagline: "High-Volume Transaction Stores", category: "COMMERCE", icon: "ShoppingCart" },
              { id: "srv-4", title: "Performance & Technical SEO", slug: "performance-technical-seo", tagline: "Sub-Second Page Load Optimization", category: "OPTIMIZATION", icon: "Zap" },
              { id: "srv-5", title: "Cloud Architecture & APIs", slug: "full-stack-cloud-development", tagline: "Secure, Distributed Backend Systems", category: "INFRASTRUCTURE", icon: "Server" },
              { id: "srv-6", title: "Monthly SLA & Maintenance", slug: "dedicated-maintenance-support", tagline: "Continuous Proactive Management", category: "SUPPORT", icon: "ShieldCheck" }
            ]);
          } else {
            setItems([]);
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchMasterList();
    return () => {
      isMounted = false;
    };
  }, [type]);

  const getItemKey = (item: any) => {
    // For reviews/testimonials, build a composite key since they lack stable IDs
    if (type === 'reviews') {
      return `${item.name || ''}::${(item.text || '').slice(0, 30)}`;
    }
    return item._id || item.id || item.slug || item.title || item.name || item.question || '';
  };

  const isSelected = (item: any) => {
    const itemKey = getItemKey(item);
    if (!itemKey) return false;
    return safeSelectedItems.some((s) => getItemKey(s) === itemKey);
  };

  const toggleSelection = (item: any) => {
    if (isSelected(item)) {
      const itemKey = getItemKey(item);
      onSelect(safeSelectedItems.filter((s) => getItemKey(s) !== itemKey));
    } else {
      onSelect([...safeSelectedItems, item]);
    }
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...safeSelectedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;

    const [moved] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, moved);
    onSelect(newItems);
  };

  const removeItem = (index: number) => {
    const newItems = safeSelectedItems.filter((_, i) => i !== index);
    onSelect(newItems);
  };

  const filteredItems = items.filter(item => {
    const title = item.title || item.question || item.name || "";
    return title.toLowerCase().includes(search.toLowerCase());
  });

  if (loading) return <div className="flex items-center gap-2 text-xs text-slate-400 p-4"><Loader2 className="w-4 h-4 animate-spin" /> Loading available {type}...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{label}</label>
        <div className="text-[10px] font-bold text-primary bg-primary/5 px-3 py-1 rounded-full uppercase">
          {safeSelectedItems.length} Selected
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search available ${type}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-12 pr-4 py-3 text-sm outline-none focus:border-primary/40 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {filteredItems.length > 0 ? filteredItems.map((item, idx) => {
          const selected = isSelected(item);
          const title = item.title || item.question || item.name || "Untitled Item";
          const subtitle = item.category || item.tag || item.position || (item.answer ? "FAQ Entry" : "");
          const image = item.image || item.avatar || item.overviewImage || null;

          return (
            <button
              key={idx}
              onClick={() => toggleSelection(item)}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${selected
                ? "bg-primary/5 border-primary shadow-sm"
                : "bg-white border-slate-100 hover:border-slate-200"
                }`}
            >
              <div className={`w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 bg-slate-50 border border-slate-100 flex items-center justify-center ${selected ? "border-primary/20" : ""}`}>
                {image ? (
                  <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-4 h-4 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold truncate ${selected ? "text-primary" : "text-slate-700"}`}>
                  {title}
                </p>
                <p className="text-[10px] text-slate-400 truncate uppercase tracking-wider mt-0.5">
                  {subtitle}
                </p>
              </div>

              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${selected
                ? "bg-primary border-primary text-white"
                : "border-slate-300 text-transparent group-hover:border-primary/60"
                }`}>
                <Check className="w-3.5 h-3.5" />
              </div>
            </button>
          );
        }) : (
          <div className="col-span-2 py-10 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400 font-medium">No items found matching your search.</p>
          </div>
        )}
      </div>

      {safeSelectedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-100">
          <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mb-4">Display Order</p>
          <div className="flex flex-wrap gap-2">
            {safeSelectedItems.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 pl-3 pr-1 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-slate-700 shadow-sm">
                {s.title || s.question || s.name}
                <div className="flex items-center gap-0.5">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(idx, 'up')}
                      disabled={idx === 0}
                      className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-3 h-3 text-slate-500" />
                    </button>
                    <button
                      onClick={() => moveItem(idx, 'down')}
                      disabled={idx === safeSelectedItems.length - 1}
                      className="p-0.5 hover:bg-slate-100 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}