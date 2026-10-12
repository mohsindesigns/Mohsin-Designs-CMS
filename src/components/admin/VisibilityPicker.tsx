"use client";

import { useState, useMemo } from "react";
import { Search, CheckSquare, Square, Globe, SlidersHorizontal } from "lucide-react";

export interface TargetOption {
  id: string;
  label: string;
  group?: string;
  hint?: string;
}

interface VisibilityPickerProps {
  visibility: string;
  targetPages: string[];
  onChangeVisibility: (val: "global" | "specific") => void;
  onChangeTargetPages: (pages: string[]) => void;
  availablePages?: TargetOption[];
  availableServices?: TargetOption[];
  currentSlug?: string;
  compact?: boolean;
}

export default function VisibilityPicker({
  visibility = "global",
  targetPages = [],
  onChangeVisibility,
  onChangeTargetPages,
  availablePages = [],
  availableServices = [],
  currentSlug = "",
  compact = false,
}: VisibilityPickerProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentTargets = useMemo(() => {
    return Array.isArray(targetPages) ? targetPages : [];
  }, [targetPages]);

  // Combine and organize all available targets
  const allTargets = useMemo(() => {
    const list: TargetOption[] = [];

    // Core options
    list.push({ id: "home", label: "Homepage", group: "Core Pages", hint: "/" });
    list.push({ id: "services", label: "All Services Hub", group: "Core Pages", hint: "/services" });

    // Custom Pages
    availablePages.forEach((p) => {
      const cleanId = String(p.id).replace(/^\/+|\/+$/g, "");
      if (cleanId !== "home" && cleanId !== "services" && cleanId !== currentSlug) {
        list.push({
          id: p.id,
          label: p.label,
          group: p.group || "Pages",
          hint: p.hint || `/${p.id}`,
        });
      }
    });

    // Services
    availableServices.forEach((s) => {
      const cleanId = String(s.id).replace(/^\/+|\/+$/g, "");
      if (cleanId !== currentSlug) {
        list.push({
          id: s.id,
          label: s.label,
          group: "Other Services",
          hint: s.hint || `/services/${s.id}`,
        });
      }
    });

    return list;
  }, [availablePages, availableServices, currentSlug]);

  const filteredTargets = useMemo(() => {
    if (!searchTerm.trim()) return allTargets;
    const q = searchTerm.toLowerCase();
    return allTargets.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.hint && t.hint.toLowerCase().includes(q))
    );
  }, [allTargets, searchTerm]);

  const handleToggle = (id: string) => {
    const exists = currentTargets.includes(id);
    const updated = exists ? currentTargets.filter((x) => x !== id) : [...currentTargets, id];
    onChangeTargetPages(updated);
  };

  const handleSelectAllFiltered = () => {
    const toAdd = filteredTargets.map((t) => t.id);
    const set = new Set([...currentTargets, ...toAdd]);
    onChangeTargetPages(Array.from(set));
  };

  const handleClearAll = () => {
    onChangeTargetPages([]);
  };

  const isSpecific = visibility === "specific";

  return (
    <div className={`space-y-3 ${compact ? "text-[12px]" : "text-[13px]"}`}>
      {/* Radio options */}
      <div className="space-y-2">
        <label
          className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
            !isSpecific
              ? "bg-[#f0f6fc] border-[#2271b1] text-[#1d2327]"
              : "bg-white border-[#dcdcde] text-[#2c3338] hover:bg-[#f6f7f7]"
          }`}
        >
          <input
            type="radio"
            name="service-visibility"
            checked={!isSpecific}
            onChange={() => onChangeVisibility("global")}
            className="mt-0.5 text-[#2271b1] focus:ring-[#2271b1]"
          />
          <div className="flex-1">
            <span className="font-semibold block flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#2271b1]" />
              Show Everywhere (Global)
            </span>
            <p className="text-[11px] text-[#646970] mt-0.5 leading-snug">
              Appears in carousels, recommended sections, and listings across all pages.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
            isSpecific
              ? "bg-[#f0f6fc] border-[#2271b1] text-[#1d2327]"
              : "bg-white border-[#dcdcde] text-[#2c3338] hover:bg-[#f6f7f7]"
          }`}
        >
          <input
            type="radio"
            name="service-visibility"
            checked={isSpecific}
            onChange={() => onChangeVisibility("specific")}
            className="mt-0.5 text-[#2271b1] focus:ring-[#2271b1]"
          />
          <div className="flex-1">
            <span className="font-semibold block flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#2271b1]" />
              Show on Specific Pages / Services Only
            </span>
            <p className="text-[11px] text-[#646970] mt-0.5 leading-snug">
              Only appears in services sections on the specific pages and services selected below.
            </p>
          </div>
        </label>
      </div>

      {/* Target Pages & Services Selector */}
      {isSpecific && (
        <div className="border border-[#c3c4c7] rounded bg-white p-3 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold text-[#1d2327] uppercase tracking-wider">
              Selected Targets ({currentTargets.length})
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                className="text-[#2271b1] hover:underline cursor-pointer font-medium"
              >
                Select All
              </button>
              <span className="text-[#c3c4c7]">|</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[#d63638] hover:underline cursor-pointer font-medium"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#8c8f94]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter pages & services..."
              className="w-full pl-8 pr-2 py-1 text-[12px] border border-[#8c8f94] rounded-[3px] bg-[#f9f9f9] focus:bg-white focus:border-[#2271b1] outline-none"
            />
          </div>

          {/* Scrollable list */}
          <div className="max-h-56 overflow-y-auto space-y-1 pr-1 border border-[#f0f0f1] rounded p-1.5 bg-[#fafafa]">
            {filteredTargets.length === 0 ? (
              <div className="text-center py-4 text-[12px] text-[#8c8f94] italic">
                No matching pages or services found.
              </div>
            ) : (
              (() => {
                // Group by group name
                const groups: Record<string, TargetOption[]> = {};
                filteredTargets.forEach((t) => {
                  const grp = t.group || "Other";
                  if (!groups[grp]) groups[grp] = [];
                  groups[grp].push(t);
                });

                return Object.entries(groups).map(([groupName, items]) => (
                  <div key={groupName} className="mb-2 last:mb-0">
                    <div className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider px-1 py-0.5 border-b border-[#eee] mb-1">
                      {groupName}
                    </div>
                    <div className="space-y-0.5">
                      {items.map((item) => {
                        const checked = currentTargets.includes(item.id);
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors text-[12px] ${
                              checked
                                ? "bg-[#f0f6fc] text-[#1d2327] font-medium"
                                : "hover:bg-[#f0f0f1] text-[#2c3338]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggle(item.id)}
                              className="rounded text-[#2271b1] focus:ring-[#2271b1] w-3.5 h-3.5"
                            />
                            <span className="truncate flex-1">{item.label}</span>
                            {item.hint && (
                              <span className="text-[10px] text-[#8c8f94] font-mono shrink-0">
                                {item.hint}
                              </span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
          {currentTargets.length === 0 && (
            <p className="text-[11px] text-[#d63638] font-medium">
              * Please select at least one page/service, or switch back to Global.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
