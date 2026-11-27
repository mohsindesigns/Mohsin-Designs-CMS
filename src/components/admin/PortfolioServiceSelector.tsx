"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Check, Briefcase, Loader2 } from "lucide-react";
import { adminApiUrl } from "@/lib/adminApi";

interface ServiceItem {
  id: string;
  title: string;
  slug?: string;
  icon?: string;
}

interface PortfolioServiceSelectorProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  label?: string;
}

// Mirrors BlogSelector.tsx, but sourced from the SiteContent services catalog
// (data.services.services / data.globalServices) instead of blog posts - there is no separate
// Services Mongoose collection.
export default function PortfolioServiceSelector({
  selectedIds = [],
  onChange,
  label = "Linked Services",
}: PortfolioServiceSelectorProps) {
  const [search, setSearch] = useState("");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(adminApiUrl("/api/content"));
        if (res.ok) {
          const data = await res.json();
          const list: any[] = Array.isArray(data?.services?.services)
            ? data.services.services
            : Array.isArray(data?.globalServices)
            ? data.globalServices
            : [];
          setServices(
            list
              .filter((s) => s && (s.id || s._id) && (s.title || s.name))
              .map((s) => ({ id: String(s.id || s._id), title: String(s.title || s.name), slug: s.slug, icon: s.icon }))
          );
        }
      } catch (err) {
        console.error("Failed to fetch services catalog:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(
    () => services.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())),
    [services, search]
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((i) => i !== id));
    else onChange([...selectedIds, id]);
  };

  return (
    <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden">
      <div className="p-4 bg-[#f6f7f7] border-b border-[#c3c4c7] flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[13px] font-bold text-[#1d2327] uppercase tracking-tight">{label}</label>
          <p className="text-[11px] text-[#646970]">
            Pick the services this case study belongs to ({selectedIds.length} selected). Drives the public filter bar.
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#8c8f94]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter services..."
            className="bg-white border border-[#8c8f94] pl-9 pr-4 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none min-w-[220px]"
          />
        </div>
      </div>

      <div className="p-2 bg-white">
        {loading ? (
          <div className="py-16 text-center">
            <Loader2 className="w-7 h-7 text-[#2271b1] animate-spin mx-auto" />
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto p-1 custom-scrollbar">
            {filtered.map((service) => {
              const isSelected = selectedIds.includes(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggle(service.id)}
                  className={`relative flex items-center gap-3 text-left border rounded-[3px] p-3 transition-all ${
                    isSelected
                      ? "border-[#2271b1] ring-1 ring-[#2271b1] bg-[#f0f6fb]"
                      : "border-[#c3c4c7] hover:border-[#2271b1] bg-white"
                  }`}
                >
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full border flex items-center justify-center ${
                      isSelected ? "bg-[#2271b1] border-[#2271b1] text-white" : "bg-[#f0f0f1] border-[#c3c4c7] text-[#8c8f94]"
                    }`}
                  >
                    {isSelected ? <Check className="w-4 h-4" /> : <Briefcase className="w-3.5 h-3.5" />}
                  </div>
                  <span className={`text-[13px] font-semibold leading-snug ${isSelected ? "text-[#2271b1]" : "text-[#1d2327]"}`}>
                    {service.title}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-[#dcdcde] rounded-sm m-2">
            <Briefcase className="w-9 h-9 text-[#dcdcde] mx-auto mb-2" />
            <p className="text-[13px] text-[#646970]">
              {services.length === 0 ? "No services found in the Services catalog yet." : `No services match "${search}".`}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-[#f6f7f7] border-t border-[#c3c4c7] flex items-center justify-between">
        <span className="text-[11px] text-[#646970] font-medium uppercase tracking-wide">Total Services: {services.length}</span>
        {selectedIds.length > 0 && (
          <button onClick={() => onChange([])} className="text-[#d63638] text-[11px] font-bold uppercase hover:underline">
            Deselect All
          </button>
        )}
      </div>
    </div>
  );
}
