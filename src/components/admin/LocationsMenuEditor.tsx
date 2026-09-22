"use client";

import React from "react";
import { MapPin, Plus, Trash2 } from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import { parseMapEmbed } from "@/lib/mapEmbed";

// Page templates that make sense in a "Locations" dropdown (used for the quick-add list).
const LOCATION_TEMPLATES = ["country", "state", "city", "location", "locations", "service-area"];

const inputCls = "border border-[#8c8f94] bg-white px-2 py-1.5 text-[13px] rounded-[3px] w-full outline-none focus:border-[#2271b1]";
const labelCls = "text-[11px] font-semibold text-[#1d2327]";

const EMPTY_MENU = {
  eyebrow: "Where we work",
  title: "Our locations",
  description: "",
  mapType: "embed",
  mapEmbed: "",
  mapImage: "",
  ctaLabel: "",
  ctaHref: "",
  items: [] as any[],
};

function subtitleFor(page: any): string {
  const c = page?.content || {};
  if (page?.template === "city") return [c.state, c.country].filter(Boolean).join(", ");
  if (page?.template === "state") return c.country || "";
  return "";
}

/** Textarea that accepts an <iframe> snippet, a maps URL, or a plain place name, and says whether it is usable. */
function EmbedField({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const parsed = parseMapEmbed(value);
  return (
    <div className="space-y-1">
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={placeholder || 'Paste a Google Maps "Embed a map" <iframe> code, an embed link, or just a place name like "Dallas, Texas, USA"'}
        className={`${inputCls} font-mono text-[12px]`}
      />
      {value?.trim() ? (
        parsed ? (
          <p className="text-[11px] text-[#00a32a]">✓ Map ready{/^https:\/\/www\.google\.com\/maps\?q=/.test(parsed) ? " (searching Google Maps for that place)" : ""}.</p>
        ) : (
          <p className="text-[11px] text-[#d63638]">✗ Not a supported map link. Use Google Maps, OpenStreetMap, Bing, Mapbox, ArcGIS or MapQuest embeds (https only).</p>
        )
      ) : null}
    </div>
  );
}

export default function LocationsMenuEditor({
  value,
  onChange,
  pages,
}: {
  value: any;
  onChange: (v: any) => void;
  pages: any[];
}) {
  const menu = { ...EMPTY_MENU, ...(value || {}) };
  const items: any[] = Array.isArray(menu.items) ? menu.items : [];
  const set = (patch: any) => onChange({ ...menu, ...patch });
  const setItem = (i: number, patch: any) => set({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    set({ items: next });
  };

  const locationPages = pages.filter((p) => p.type === "page" && LOCATION_TEMPLATES.includes(p.template));
  const pageAdded = (p: any) => items.some((it) => it.pageId === p._id);

  return (
    <div className="space-y-5 rounded-sm border border-[#2271b1]/30 bg-[#f0f6fc] p-5">
      <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#2271b1]">
        <MapPin className="h-4 w-4" /> Locations dropdown (with map)
      </div>

      {/* Text */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Small heading</label>
          <input className={inputCls} value={menu.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} placeholder="Where we work" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Heading</label>
          <input className={inputCls} value={menu.title} onChange={(e) => set({ title: e.target.value })} placeholder="Our locations" />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className={labelCls}>Description (optional)</label>
          <textarea className={inputCls} rows={2} value={menu.description} onChange={(e) => set({ description: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Bottom link text (optional)</label>
          <input className={inputCls} value={menu.ctaLabel} onChange={(e) => set({ ctaLabel: e.target.value })} placeholder="View all locations" />
        </div>
        <div className="flex flex-col gap-1">
          <label className={labelCls}>Bottom link URL</label>
          <input className={inputCls} value={menu.ctaHref} onChange={(e) => set({ ctaHref: e.target.value })} placeholder="/locations" />
        </div>
      </div>

      {/* Default map */}
      <div className="space-y-3 rounded-sm border border-[#dcdcde] bg-white p-4">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#646970]">Default map (right side of the dropdown)</div>
        <div className="flex gap-5 text-[13px]">
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" checked={menu.mapType !== "image"} onChange={() => set({ mapType: "embed" })} /> Embedded map
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input type="radio" checked={menu.mapType === "image"} onChange={() => set({ mapType: "image" })} /> Image
          </label>
        </div>
        {menu.mapType === "image" ? (
          <ImageField label="Map image" value={menu.mapImage || ""} onChange={(url) => set({ mapImage: url })} description="Any image works: a map screenshot, a styled map, a photo of the city." />
        ) : (
          <EmbedField value={menu.mapEmbed} onChange={(v) => set({ mapEmbed: v })} />
        )}
      </div>

      {/* Locations */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#646970]">Locations in the list</span>
          <div className="flex flex-wrap items-center gap-3">
            {locationPages.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  const p = locationPages.find((x) => x._id === e.target.value);
                  if (p) set({ items: [...items, { pageId: p._id, label: p.title, href: "/" + p.slug, subtitle: subtitleFor(p), mapEmbed: "", mapImage: "" }] });
                }}
                className="border border-[#8c8f94] bg-white px-2 py-1 text-[12px] rounded-[3px]"
              >
                <option value="">+ Add from location pages...</option>
                {locationPages.map((p) => (
                  <option key={p._id} value={p._id} disabled={pageAdded(p)}>
                    {p.title}
                    {pageAdded(p) ? " (added)" : ""}
                  </option>
                ))}
              </select>
            )}
            <button
              type="button"
              onClick={() => set({ items: [...items, { pageId: "", label: "New location", href: "/", subtitle: "", mapEmbed: "", mapImage: "" }] })}
              className="inline-flex items-center gap-1 text-[12px] font-bold text-[#2271b1] hover:underline"
            >
              <Plus className="h-3.5 w-3.5" /> Add custom location
            </button>
          </div>
        </div>

        {items.length === 0 && <p className="text-[12px] italic text-[#646970]">No locations yet. Add some from your location pages or add custom ones.</p>}

        {items.map((item, i) => (
          <div key={i} className="space-y-3 rounded-sm border border-[#dcdcde] bg-white p-4 shadow-sm">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
              <div className="flex flex-col gap-1 lg:col-span-3">
                <label className={labelCls}>Map to page</label>
                <select
                  value={item.pageId || ""}
                  onChange={(e) => {
                    const p = pages.find((x) => x._id === e.target.value);
                    setItem(i, p ? { pageId: p._id, label: p.title, href: "/" + p.slug, subtitle: item.subtitle || subtitleFor(p) } : { pageId: "" });
                  }}
                  className={inputCls}
                >
                  <option value="">-- Custom link --</option>
                  {pages.filter((p) => p.type === "page").map((p) => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1 lg:col-span-3">
                <label className={labelCls}>Name</label>
                <input className={inputCls} value={item.label || ""} onChange={(e) => setItem(i, { label: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1 lg:col-span-3">
                <label className={labelCls}>Small text (optional)</label>
                <input className={inputCls} value={item.subtitle || ""} onChange={(e) => setItem(i, { subtitle: e.target.value })} placeholder="Texas, USA" />
              </div>
              <div className="flex flex-col gap-1 lg:col-span-2">
                <label className={labelCls}>URL</label>
                <input className={inputCls} value={item.href || ""} onChange={(e) => setItem(i, { href: e.target.value })} />
              </div>
              <div className="flex items-end justify-end gap-1 lg:col-span-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1.5 text-[#50575e] hover:bg-[#dcdcde] disabled:opacity-30" title="Move up">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} className="rounded p-1.5 text-[#50575e] hover:bg-[#dcdcde] disabled:opacity-30" title="Move down">↓</button>
                <button type="button" onClick={() => set({ items: items.filter((_, idx) => idx !== i) })} className="rounded p-1.5 text-[#d63638] hover:bg-red-50" title="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <details className="group rounded-sm border border-dashed border-[#c3c4c7] bg-[#fafafa] p-3">
              <summary className="cursor-pointer text-[12px] font-semibold text-[#2271b1]">
                Custom map for this location (optional){item.mapEmbed || item.mapImage ? " - set" : ""}
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-[12px] text-[#646970]">Shown on the right when a visitor hovers this location. Leave empty to keep the default map.</p>
                <EmbedField value={item.mapEmbed || ""} onChange={(v) => setItem(i, { mapEmbed: v })} />
                <ImageField label="Or an image" value={item.mapImage || ""} onChange={(url) => setItem(i, { mapImage: url })} />
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
