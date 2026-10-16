"use client";

import { useState } from "react";
import { Plus, Trash2, Home, ChevronRight } from "lucide-react";

export interface BreadcrumbCrumb {
  name: string;
  url: string;
}

export interface PageOption {
  id: string;
  label: string;
  /** Already-formatted href, e.g. "/saudia/". */
  url: string;
}

interface BreadcrumbEditorProps {
  mode: "default" | "custom";
  items: BreadcrumbCrumb[];
  onChangeMode: (mode: "default" | "custom") => void;
  onChangeItems: (items: BreadcrumbCrumb[]) => void;
  /** This service's own title - always the last, non-editable crumb. */
  serviceTitle: string;
  availablePages: PageOption[];
  compact?: boolean;
}

/**
 * Lets an admin choose, per service, whether the breadcrumb trail on its detail page is the
 * default (Home / Services / {title}) or a custom middle section - e.g. Home / Saudi Arabia /
 * {title} when a service was built specifically for a location page. The last crumb (this
 * service's own title) is always auto-appended and never editable here.
 */
export default function BreadcrumbEditor({
  mode = "default",
  items = [],
  onChangeMode,
  onChangeItems,
  serviceTitle,
  availablePages,
  compact = false,
}: BreadcrumbEditorProps) {
  const [pickerOpenFor, setPickerOpenFor] = useState<number | null>(null);

  const isCustom = mode === "custom";

  const updateItem = (index: number, patch: Partial<BreadcrumbCrumb>) => {
    const next = items.map((it, i) => (i === index ? { ...it, ...patch } : it));
    onChangeItems(next);
  };

  const addItem = () => {
    onChangeItems([...items, { name: "", url: "/" }]);
  };

  const removeItem = (index: number) => {
    onChangeItems(items.filter((_, i) => i !== index));
  };

  const pickPage = (index: number, page: PageOption) => {
    updateItem(index, { name: page.label, url: page.url });
    setPickerOpenFor(null);
  };

  const previewTrail: BreadcrumbCrumb[] = isCustom
    ? [{ name: "Home", url: "/" }, ...items.filter((it) => it.name.trim()), { name: serviceTitle || "This service", url: "#" }]
    : [{ name: "Home", url: "/" }, { name: "Services", url: "/services/" }, { name: serviceTitle || "This service", url: "#" }];

  return (
    <div className={`space-y-3 ${compact ? "text-[12px]" : "text-[13px]"}`}>
      {/* Mode radios */}
      <div className="space-y-2">
        <label
          className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
            !isCustom ? "bg-[#f0f6fc] border-[#2271b1] text-[#1d2327]" : "bg-white border-[#dcdcde] text-[#2c3338] hover:bg-[#f6f7f7]"
          }`}
        >
          <input
            type="radio"
            name="breadcrumb-mode"
            checked={!isCustom}
            onChange={() => onChangeMode("default")}
            className="mt-0.5 text-[#2271b1] focus:ring-[#2271b1]"
          />
          <div className="flex-1">
            <span className="font-semibold block">Use the default trail</span>
            <p className="text-[11px] text-[#646970] mt-0.5 leading-snug">Home / Services / {serviceTitle || "This service"}</p>
          </div>
        </label>

        <label
          className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
            isCustom ? "bg-[#f0f6fc] border-[#2271b1] text-[#1d2327]" : "bg-white border-[#dcdcde] text-[#2c3338] hover:bg-[#f6f7f7]"
          }`}
        >
          <input
            type="radio"
            name="breadcrumb-mode"
            checked={isCustom}
            onChange={() => onChangeMode("custom")}
            className="mt-0.5 text-[#2271b1] focus:ring-[#2271b1]"
          />
          <div className="flex-1">
            <span className="font-semibold block">Build a custom trail</span>
            <p className="text-[11px] text-[#646970] mt-0.5 leading-snug">
              Replace &quot;Services&quot; with your own crumb(s) - e.g. link to a location page. The last
              crumb is always this service&apos;s own title.
            </p>
          </div>
        </label>
      </div>

      {isCustom && (
        <div className="border border-[#c3c4c7] rounded bg-white p-3 space-y-2.5">
          {items.length === 0 ? (
            <p className="text-[11px] text-[#8c8f94] italic">No crumbs added yet - click "Add Crumb" below.</p>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="border border-[#dcdcde] rounded p-2 space-y-1.5 bg-[#fafafa]">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#8c8f94] uppercase tracking-wider">Crumb {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-[#d63638] hover:text-[#b32d2e]"
                      aria-label="Remove crumb"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateItem(index, { name: e.target.value })}
                      placeholder="Label (e.g. Saudi Arabia)"
                      className="px-2 py-1 text-[12px] border border-[#8c8f94] rounded-[3px] bg-white focus:border-[#2271b1] outline-none"
                    />
                    <input
                      type="text"
                      value={item.url}
                      onChange={(e) => updateItem(index, { url: e.target.value })}
                      placeholder="/saudia/"
                      className="px-2 py-1 text-[12px] font-mono border border-[#8c8f94] rounded-[3px] bg-white focus:border-[#2271b1] outline-none"
                    />
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPickerOpenFor(pickerOpenFor === index ? null : index)}
                      className="text-[11px] text-[#2271b1] hover:underline"
                    >
                      Or pick an existing page...
                    </button>
                    {pickerOpenFor === index && (
                      <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto border border-[#c3c4c7] rounded bg-white shadow-md">
                        {availablePages.length === 0 ? (
                          <p className="px-2 py-1.5 text-[11px] text-[#8c8f94] italic">No pages found.</p>
                        ) : (
                          availablePages.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => pickPage(index, p)}
                              className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-[#f0f6fc] flex items-center justify-between gap-2"
                            >
                              <span className="truncate">{p.label}</span>
                              <span className="text-[10px] text-[#8c8f94] font-mono shrink-0">{p.url}</span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-[12px] font-medium text-[#2271b1] hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add Crumb
          </button>
        </div>
      )}

      {/* Live preview */}
      <div className="flex items-center flex-wrap gap-1 px-2.5 py-2 rounded border border-[#dcdcde] bg-[#f6f7f7] text-[11px] font-mono text-[#50575e]">
        {previewTrail.map((c, i) => (
          <span key={i} className="flex items-center gap-1">
            {i === 0 && <Home className="w-3 h-3" />}
            <span className={i === previewTrail.length - 1 ? "font-bold text-[#1d2327]" : ""}>{c.name || "(empty)"}</span>
            {i < previewTrail.length - 1 && <ChevronRight className="w-3 h-3 text-[#c3c4c7]" />}
          </span>
        ))}
      </div>
    </div>
  );
}
