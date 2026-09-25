"use client";

// Editor for the "Service Area" page template (page.content -> ServiceAreaTemplate).
//
// Every field below is read by src/components/templates/ServiceAreaTemplate.tsx - keep the two in
// sync. Built-in copy lives in src/lib/serviceAreaDefaults.ts (shared with the template), so
// what this editor pre-fills is exactly what the public page shows for a blank page.
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Type, Plus, Trash2, ShieldCheck, Map, MapPin, BarChart3, Settings, ClipboardList,
  Layers, Star, ShieldAlert, Wrench, Home, Building2, Building, Droplets, Award, Clock, BadgeCheck,
  TrendingUp, Users, Layout, TreePine, Flame, PencilRuler, ChevronUp, ChevronDown, HelpCircle, Video,
  ClipboardCheck, Hammer, Sparkles
} from "lucide-react";
import dynamic from "next/dynamic";
import { UI } from "./styles";
import MediaSelector from "@/components/admin/MediaSelector";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";
import { parseMapEmbed } from "@/lib/mapEmbed";
import {
  SERVICE_AREA_DEFAULTS as D,
  SERVICE_AREA_DEFAULT_ICONS as DEFAULT_ICONS,
  SERVICE_AREA_HYDRATE_KEYS,
} from "@/lib/serviceAreaDefaults";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

interface Region {
  name: string;
  cities?: string[];
  zipcodes?: string[];
  description?: string;
}

// Icon library. Every name here MUST exist in ServiceAreaTemplate's `iconMap`
// (otherwise the page silently shows a different icon than the one picked).
const AVAILABLE_ICONS = [
  { name: "Home", label: "Residential Roofing", icon: Home },
  { name: "Building2", label: "Commercial Roofing", icon: Building2 },
  { name: "Building", label: "Property / Office", icon: Building },
  { name: "Droplets", label: "Seamless Gutters", icon: Droplets },
  { name: "Shield", label: "Storm Protection", icon: ShieldCheck },
  { name: "Award", label: "Elite / Quality", icon: Award },
  { name: "Clock", label: "Rapid Response", icon: Clock },
  { name: "BadgeCheck", label: "Veteran Owned", icon: BadgeCheck },
  { name: "TrendingUp", label: "Energy Efficiency", icon: TrendingUp },
  { name: "Star", label: "5-Star Rating", icon: Star },
  { name: "Users", label: "Local Crew", icon: Users },
  { name: "Layout", label: "Modern Siding", icon: Layout },
  { name: "TreePine", label: "Cedar Siding", icon: TreePine },
  { name: "Wrench", label: "Expert Repairs", icon: Wrench },
  { name: "ClipboardList", label: "Free Inspection", icon: ClipboardList },
  { name: "ClipboardCheck", label: "Inspection Checklist", icon: ClipboardCheck },
  { name: "ShieldAlert", label: "Storm Damage", icon: ShieldAlert },
  { name: "Flame", label: "Heat / Fire Resilient", icon: Flame },
  { name: "PencilRuler", label: "Custom Architecture", icon: PencilRuler },
  { name: "Hammer", label: "Installation", icon: Hammer },
  { name: "Sparkles", label: "Final Clean-up", icon: Sparkles },
];

// ---- immutable path helpers (all updates go through setData(prev => ...), so a stale
// closure or a sibling edit can never clobber another field) ---------------------------
type Path = string[];
const getAt = (obj: any, path: Path): any => path.reduce((o, k) => (o == null ? undefined : o[k]), obj);
const setAt = (obj: any, path: Path, value: any): any => {
  if (path.length === 0) return value;
  const [head, ...rest] = path;
  const base = obj && typeof obj === "object" && !Array.isArray(obj) ? obj : {};
  return { ...base, [head]: setAt(base[head], rest, value) };
};
const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));
const toArr = (v: any): string[] =>
  Array.isArray(v) ? v.map((x) => String(x ?? "")) : typeof v === "string" ? v.split(/[,\n]/).map((x) => x.trim()).filter(Boolean) : [];

// ---- small presentational pieces (module level on purpose: defining components inside the
// editor body would remount them - and drop input focus - on every keystroke) -------------

/** Icon grid. `fallback` is the icon the page shows when none is picked, so it is highlighted. */
function IconPicker({ value, fallback, onChange, wide = false, label }: {
  value?: string; fallback: string; onChange: (name: string) => void; wide?: boolean; label: string;
}) {
  const current = value || fallback;
  return (
    <div className="space-y-3 border border-[#f0f0f1] p-3 bg-white rounded-lg">
      <div className="flex items-center justify-between gap-2">
        <label className="text-[11px] font-bold text-slate-700 block">{label}</label>
        <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border">
          <span>Active:</span>
          <span className="text-primary font-black uppercase">{current}{value ? "" : " (auto)"}</span>
        </div>
      </div>
      <div className={`grid grid-cols-4 sm:grid-cols-7 ${wide ? "gap-2" : "gap-1"}`}>
        {AVAILABLE_ICONS.map((iConfig) => {
          const LiveIcon = iConfig.icon;
          const isSelected = current.toLowerCase() === iConfig.name.toLowerCase();
          return (
            <button
              key={iConfig.name}
              type="button"
              onClick={() => onChange(iConfig.name)}
              title={iConfig.label}
              aria-pressed={isSelected}
              className={`p-1.5 rounded border flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/40"}`}
            >
              <LiveIcon className="w-4 h-4" />
              <span className="text-[8px] truncate max-w-full font-bold">{iConfig.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Card header: title + move up / move down / remove. */
function ItemBar({ label, index, count, onMove, onRemove, removable = true }: {
  label: string; index: number; count: number; onMove: (dir: -1 | 1) => void; onRemove: () => void; removable?: boolean;
}) {
  const btn = "p-1 rounded text-slate-400 hover:text-[#2271b1] hover:bg-[#f0f6fb] disabled:opacity-30 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition-colors";
  return (
    <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2 mb-2 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-6 h-6 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{index + 1}</span>
        <span className="text-[11px] font-bold text-[#646970] uppercase tracking-wider truncate">{label}</span>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <button type="button" className={btn} onClick={() => onMove(-1)} disabled={index === 0} title="Move up" aria-label={`Move ${label} up`}>
          <ChevronUp className="w-4 h-4" />
        </button>
        <button type="button" className={btn} onClick={() => onMove(1)} disabled={index === count - 1} title="Move down" aria-label={`Move ${label} down`}>
          <ChevronDown className="w-4 h-4" />
        </button>
        {removable && (
          <button type="button" onClick={onRemove} className="ml-1 text-[#d63638] hover:text-[#b32b2d] flex items-center gap-1 text-[11px] font-semibold" title="Remove" aria-label={`Remove ${label}`}>
            <Trash2 className="w-3.5 h-3.5" /> Remove
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Textarea for "a, b, c" style lists. It keeps its own raw text while typing (parsing on every
 * keystroke would swallow the comma you just typed) and only re-syncs when the list changes
 * from outside (e.g. the card above was removed).
 */
function ListTextarea({ value, onChange, placeholder, rows = 2 }: {
  value: any; onChange: (next: string[]) => void; placeholder?: string; rows?: number;
}) {
  const arr = toArr(value);
  const signature = arr.join("\u0001");
  const [text, setText] = useState(arr.join(", "));
  const lastEmitted = useRef(signature);
  useEffect(() => {
    if (signature !== lastEmitted.current) {
      lastEmitted.current = signature;
      setText(arr.join(", "));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);
  return (
    <textarea
      value={text}
      rows={rows}
      placeholder={placeholder}
      className={UI.textarea}
      onChange={(e) => {
        const t = e.target.value;
        setText(t);
        const next = t.split(/[,\n]/).map((x) => x.trim()).filter(Boolean);
        lastEmitted.current = next.join("\u0001");
        onChange(next);
      }}
    />
  );
}

/** Map embed input with a live "will this show?" check (same rules the page applies). */
function MapEmbedField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const parsed = parseMapEmbed(value);
  return (
    <div className="space-y-1.5">
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        placeholder={'Paste a Google Maps "Embed a map" <iframe> code, its embed link, or just a place name like "St. Louis, MO"'}
        className={`${UI.textarea} font-mono text-[12px]`}
      />
      {value?.trim() ? (
        parsed ? (
          <p className="text-[11px] text-[#00a32a]">
            &#10003; Map ready{/^https:\/\/www\.google\.com\/maps\?q=/.test(parsed) ? " (Google Maps search for that place)" : ""}.
          </p>
        ) : (
          <p className="text-[11px] text-[#d63638]">
            &#10007; Not a supported map link, so no map will show on the page. Use a Google Maps, OpenStreetMap, Bing, Mapbox, ArcGIS or MapQuest embed (https only).
          </p>
        )
      ) : (
        <p className="text-[11px] text-slate-400">Leave empty to hide the map and show the details full width.</p>
      )}
    </div>
  );
}

export default function ServiceAreaEditor({ pageId, data, setData, seo, setSeo }: {
  pageId: string; data: any; setData: (d: any) => void; seo?: any; setSeo?: (s: any) => void;
}) {
  const [activeTab, setActiveTab] = useState("intro");
  const [activeMediaTarget, setActiveMediaTarget] = useState<{ section: string; field: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // First open of a page that lacks sections: pre-fill them with the built-in content the
  // public page already shows, so the admin edits exactly what visitors see.
  useEffect(() => {
    if (data && !isHydrated) {
      setIsHydrated(true);
      const missing = SERVICE_AREA_HYDRATE_KEYS.filter((k) => data[k] === undefined || data[k] === null);
      if (missing.length > 0) {
        setData((prev: any) => {
          const cur = prev || {};
          const next = { ...cur };
          for (const k of SERVICE_AREA_HYDRATE_KEYS) {
            if (cur[k] !== undefined && cur[k] !== null) continue;
            // legacy pages stored the steps under `processSteps`
            next[k] = k === "process" && Array.isArray(cur.processSteps) ? cur.processSteps : clone((D as any)[k]);
          }
          return next;
        });
      }
    }
  }, [data, isHydrated, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  // ---- updaters -----------------------------------------------------------------------
  const updateField = (section: string, field: string | null, value: any) =>
    setData((prev: any) => setAt(prev || {}, field === null ? [section] : [section, field], value));

  const updateList = (path: Path, fn: (list: any[]) => any[]) =>
    setData((prev: any) => {
      const cur = prev || {};
      const list = getAt(cur, path);
      return setAt(cur, path, fn(Array.isArray(list) ? list : []));
    });
  const patchItem = (path: Path, i: number, patch: any) =>
    updateList(path, (l) => l.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = (path: Path, item: any) => updateList(path, (l) => [...l, item]);
  const removeItem = (path: Path, i: number) => updateList(path, (l) => l.filter((_, idx) => idx !== i));
  const moveItem = (path: Path, i: number, dir: -1 | 1) =>
    updateList(path, (l) => {
      const j = i + dir;
      if (j < 0 || j >= l.length) return l;
      const next = [...l];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const list = (path: Path): any[] => {
    const v = getAt(data, path);
    return Array.isArray(v) ? v : [];
  };

  const tabs = [
    { id: "intro", label: "Intro & Hero", icon: Type, title: "Hero Banner Configurator" },
    { id: "stats", label: "Statistics Row", icon: BarChart3, title: "Stats Highlights Counter" },
    { id: "map", label: "Map & Dispatch", icon: Map, title: "Coverage Map & Coordinates" },
    { id: "process", label: "Operational Process", icon: ClipboardList, title: "Process Roadmap Steps" },
    { id: "materials", label: "Premium Materials", icon: Layers, title: "Installed Materials Options" },
    { id: "services", label: "Services Showcase", icon: Wrench, title: "Services Showcase Configuration" },
    { id: "regions", label: "Regions & Cities", icon: MapPin, title: "County Coverage Directories" },
    { id: "whyChoose", label: "Why Choose Us", icon: Star, title: "Core Strengths Showcase" },
    { id: "overview", label: "Overview Section", icon: ShieldAlert, title: "Overview Content Configurator" },
    { id: "videoTestimonials", label: "Video Testimonials", icon: Video, title: "Video Testimonials" },
    { id: "faq", label: "FAQ Section", icon: HelpCircle, title: "FAQ Section Visibility" },
    { id: "cta", label: "Lead Call To Action", icon: ShieldCheck, title: "Final CTA Configurator" },
    { id: "schema", label: "Schema Markup", icon: Settings, title: "Schema Markup Configurator" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  const stats = list(["stats"]);
  const processSteps = list(["process"]);
  const materialItems = list(["materials", "items"]);
  const serviceItems = list(["servicesSection", "items"]);
  const regions: Region[] = list(["regions"]);
  const whyItems = list(["whyChoose", "items"]);

  const imageField = (section: string, label: string, placeholder: string, help: string) => (
    <div className="space-y-2">
      <label className={UI.label}>{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={data[section]?.image || ""}
          onChange={(e) => updateField(section, "image", e.target.value)}
          className={UI.input}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setActiveMediaTarget({ section, field: "image" })}
          className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-4 py-1 text-[12px] font-semibold rounded-sm hover:bg-[#f0f6fb] transition-colors shrink-0"
        >
          Select Image
        </button>
        {data[section]?.image && (
          <button
            type="button"
            onClick={() => updateField(section, "image", "")}
            className="text-[#d63638] text-[12px] font-semibold hover:underline shrink-0 px-1"
          >
            Remove
          </button>
        )}
      </div>
      <p className="text-[10px] text-slate-400">{help}</p>
      {data[section]?.image && (
        <div className="mt-2 w-32 aspect-video relative rounded-lg overflow-hidden border border-slate-200">
          <img src={data[section].image} alt={`${label} preview`} className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );

  const visibilityHeader = (title: string, help: string, enabled: boolean, onChange: (v: boolean) => void, label: string) => (
    <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1] gap-4">
      <div>
        <h2 className="text-base font-bold text-[#1d2327]">{title}</h2>
        <p className="text-xs text-[#646970]">{help}</p>
      </div>
      <SectionToggle enabled={enabled} onChange={onChange} label={label} />
    </div>
  );

  return (
    <div className="bg-white">
      {/* Tab Select Header List */}
      <div className="flex flex-wrap items-center gap-1 mb-6 text-[13px] border-b border-[#f0f0f1] pb-1">
        {tabs.map((tab, idx) => (
          <React.Fragment key={tab.id}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`px-1 py-1 transition-colors ${activeTab === tab.id ? 'text-[#1d2327] font-bold' : 'text-[#2271b1] hover:text-[#135e96]'}`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <div className="mb-6">
          <h2 className={UI.sectionHeader}>{activeTabTitle}</h2>
          <p className="text-[12px] text-[#646970] -mt-2">Provide custom content blocks, regions lists, and action items that fully structure the Service Area layout.</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 pb-10"
          >
            {/* INTRO HERO TAB */}
            {activeTab === "intro" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Hero Banner Visibility",
                  "Enable or disable displaying this section on the live page.",
                  data.hero?.enabled !== false,
                  (v) => updateField("hero", "enabled", v),
                  "Hero Banner"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Hero Headline (page H1)</label>
                    <input
                      type="text"
                      value={data.hero?.headline ?? ""}
                      onChange={(e) => updateField("hero", "headline", e.target.value)}
                      className={UI.inputLarge}
                      placeholder="Leave empty to use the page title"
                    />
                  </div>
                  <RichTextEditor
                    label="Hero Description (100% White on Front)"
                    content={data.hero?.description || ""}
                    onChange={(html) => updateField("hero", "description", html)}
                  />
                  {imageField("hero", "Hero Background Banner Image", "e.g. /uploads/service-area-hero.jpg", "Optional. Leave empty for a plain dark banner.")}
                </div>
              </div>
            )}

            {/* STATISTICS TAB */}
            {activeTab === "stats" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Statistics Counter Visibility",
                  "Enable or disable displaying statistics on the live page.",
                  data.statsEnabled !== false,
                  (v) => updateField("statsEnabled", null, v),
                  "Statistics Counter"
                )}
                <div className={UI.card + " space-y-6"}>
                  <label className={UI.label + " block border-b border-[#f0f0f1] pb-2"}>Statistics Values &amp; Labels</label>

                  {stats.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No stats configured - the statistics row is hidden on the live page.</p>
                  ) : (
                    stats.map((stat: any, sIdx: number) => (
                      <div key={sIdx} className="border border-[#e0e0e0] p-4 rounded-xl relative space-y-3">
                        <ItemBar
                          label={`Stat #${sIdx + 1}`}
                          index={sIdx}
                          count={stats.length}
                          onMove={(dir) => moveItem(["stats"], sIdx, dir)}
                          onRemove={() => removeItem(["stats"], sIdx)}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#646970] uppercase">Stat Counter Value</label>
                            <input
                              type="text"
                              value={stat?.value ?? ""}
                              onChange={(e) => patchItem(["stats"], sIdx, { value: e.target.value })}
                              className={UI.input}
                              placeholder="e.g. 15+ or 100%"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[#646970] uppercase">Stat Subtitle Label</label>
                            <input
                              type="text"
                              value={stat?.label ?? ""}
                              onChange={(e) => patchItem(["stats"], sIdx, { label: e.target.value })}
                              className={UI.input}
                              placeholder="e.g. Years of Local Expertise"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  {stats.length < 4 && (
                    <button
                      type="button"
                      onClick={() => addItem(["stats"], { value: "", label: "" })}
                      className="inline-flex items-center gap-2 bg-[#f0f0f1] hover:bg-white text-[#2c3338] border border-[#c3c4c7] px-4 py-2 text-xs font-bold rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Stat
                    </button>
                  )}
                  <p className="text-[10px] text-slate-400">Up to 4 stats. Three fit best. A stat with no value and no label is not shown.</p>
                </div>
              </div>
            )}

            {/* MAP & DISPATCH TAB */}
            {activeTab === "map" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Map & Dispatch Visibility",
                  "Enable or disable displaying map section on the live page.",
                  data.map?.enabled !== false,
                  (v) => updateField("map", "enabled", v),
                  "Map & Dispatch"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Tagline</label>
                      <input
                        type="text"
                        value={data.map?.headline ?? ""}
                        onChange={(e) => updateField("map", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Title Headline</label>
                      <input
                        type="text"
                        value={data.map?.title ?? ""}
                        onChange={(e) => updateField("map", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Coverage Narrative Description</label>
                    <RichTextEditor
                      content={data.map?.description || ""}
                      onChange={(val: string) => updateField("map", "description", val)}
                      placeholder="Describe the service coverage area..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Google Map Embed</label>
                    <MapEmbedField value={data.map?.iframeUrl || ""} onChange={(v) => updateField("map", "iframeUrl", v)} />
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-4">
                    <label className={UI.label + " block font-bold text-slate-700"}>Dispatch Coordinates Info Blocks</label>
                    <p className="text-[10px] text-slate-400 -mt-2">A block with an empty title and text is not shown. Block 3 becomes a tap-to-call link when its text is a phone number.</p>

                    {[
                      { n: 1, hint: "Pin icon" },
                      { n: 2, hint: "Calendar icon" },
                      { n: 3, hint: "Phone icon" },
                    ].map(({ n, hint }) => (
                      <div key={n} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#e0e0e0] p-4 rounded-xl">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate {n}: Title <span className="font-normal normal-case text-slate-400">({hint})</span></label>
                          <input
                            type="text"
                            value={data.map?.[`bullet${n}Title`] ?? ""}
                            onChange={(e) => updateField("map", `bullet${n}Title`, e.target.value)}
                            className={UI.input}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate {n}: Text</label>
                          <input
                            type="text"
                            value={data.map?.[`bullet${n}Text`] ?? ""}
                            onChange={(e) => updateField("map", `bullet${n}Text`, e.target.value)}
                            className={UI.input}
                            placeholder={n === 3 ? "e.g. (636) 293-9977" : ""}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* PROCESS ROADMAP TAB */}
            {activeTab === "process" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Operational Process Visibility",
                  "Enable or disable displaying process steps on the live page.",
                  data.processSection?.enabled !== false,
                  (v) => updateField("processSection", "enabled", v),
                  "Process Roadmap"
                )}
                {/* Visual Section Headline/Title Configurator */}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Process Section Tagline</label>
                      <input
                        type="text"
                        value={data.processSection?.headline ?? ""}
                        onChange={(e) => updateField("processSection", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Process Section Main Title</label>
                      <input
                        type="text"
                        value={data.processSection?.title ?? ""}
                        onChange={(e) => updateField("processSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {processSteps.length === 0 ? (
                    <p className="text-slate-400 text-xs italic">No process steps configured - the whole process section is hidden on the live page.</p>
                  ) : (
                    processSteps.map((step: any, pIdx: number) => (
                      <div key={pIdx} className={UI.card + " space-y-4 relative"}>
                        <ItemBar
                          label={`Step blueprint #${pIdx + 1}`}
                          index={pIdx}
                          count={processSteps.length}
                          onMove={(dir) => moveItem(["process"], pIdx, dir)}
                          onRemove={() => removeItem(["process"], pIdx)}
                        />

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label className={UI.label}>Step Title</label>
                            <input
                              type="text"
                              value={step?.title ?? ""}
                              onChange={(e) => patchItem(["process"], pIdx, { title: e.target.value })}
                              className={UI.input}
                              placeholder="e.g. Free Inspection"
                            />
                          </div>

                          <IconPicker
                            label="Select Step Icon"
                            value={step?.icon}
                            fallback={DEFAULT_ICONS.process[pIdx % DEFAULT_ICONS.process.length]}
                            onChange={(name) => patchItem(["process"], pIdx, { icon: name })}
                          />

                          <div className="space-y-1.5">
                            <label className={UI.label}>Step Description Narrative</label>
                            <RichTextEditor
                              content={step?.description || ""}
                              onChange={(val: string) => patchItem(["process"], pIdx, { description: val })}
                              placeholder="Describe the step visual parameters..."
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => addItem(["process"], { title: "New Step", description: "" })}
                      className="inline-flex items-center gap-2 bg-[#f0f0f1] hover:bg-white text-[#2c3338] border border-[#c3c4c7] px-4 py-2 text-xs font-bold rounded transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Process Step
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PREMIUM MATERIALS TAB */}
            {activeTab === "materials" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Premium Materials Visibility",
                  "Enable or disable displaying materials section on the live page.",
                  data.materials?.enabled !== false,
                  (v) => updateField("materials", "enabled", v),
                  "Premium Materials"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Materials Section Tagline</label>
                      <input
                        type="text"
                        value={data.materials?.headline ?? ""}
                        onChange={(e) => updateField("materials", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Materials Section Title</label>
                      <input
                        type="text"
                        value={data.materials?.title ?? ""}
                        onChange={(e) => updateField("materials", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-6">
                    <div className="flex items-center justify-between">
                      <label className={UI.label + " block font-bold text-slate-700 !mb-0"}>Materials Categories Cards</label>
                      <button
                        type="button"
                        onClick={() => addItem(["materials", "items"], { title: "New Material", description: "" })}
                        className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[11px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                      >
                        + Add Material Card
                      </button>
                    </div>

                    {materialItems.length === 0 && (
                      <p className="text-slate-400 text-xs italic">No material cards - the whole materials section is hidden on the live page.</p>
                    )}

                    {materialItems.map((item: any, mIdx: number) => (
                      <div key={mIdx} className="border border-[#e0e0e0] p-4 rounded-xl space-y-3 bg-slate-50/40">
                        <ItemBar
                          label={`Material Card #${mIdx + 1}`}
                          index={mIdx}
                          count={materialItems.length}
                          onMove={(dir) => moveItem(["materials", "items"], mIdx, dir)}
                          onRemove={() => removeItem(["materials", "items"], mIdx)}
                        />

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Material Category Title</label>
                          <input
                            type="text"
                            value={item?.title ?? ""}
                            onChange={(e) => patchItem(["materials", "items"], mIdx, { title: e.target.value })}
                            className={UI.input}
                          />
                        </div>

                        <IconPicker
                          label="Select Material Card Icon"
                          value={item?.icon}
                          fallback={DEFAULT_ICONS.materials[mIdx % DEFAULT_ICONS.materials.length]}
                          onChange={(name) => patchItem(["materials", "items"], mIdx, { icon: name })}
                        />

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Material Description</label>
                          <RichTextEditor
                            content={item?.description || ""}
                            onChange={(val: string) => patchItem(["materials", "items"], mIdx, { description: val })}
                            placeholder="Describe this material or product..."
                          />
                        </div>

                        {/* Button Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#f0f0f1] pt-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Button Label <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. Learn More"
                              value={item?.buttonLabel ?? ""}
                              onChange={(e) => patchItem(["materials", "items"], mIdx, { buttonLabel: e.target.value })}
                              className={UI.input}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Button Link <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. /services/residential-roofing or #contact"
                              value={item?.buttonHref ?? ""}
                              onChange={(e) => patchItem(["materials", "items"], mIdx, { buttonHref: e.target.value })}
                              className={UI.input}
                            />
                          </div>
                          <p className="sm:col-span-2 text-[10px] text-slate-400 italic">Button only appears on the page if both Label and Link are filled in. "#contact" opens the Quick Quote form.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SERVICES SHOWCASE CONFIGURATOR TAB */}
            {activeTab === "services" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Services Showcase Visibility",
                  "Enable or disable displaying services showcase on the live page.",
                  data.servicesSection?.enabled !== false,
                  (v) => updateField("servicesSection", "enabled", v),
                  "Services Showcase"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Services Section Tagline</label>
                      <input
                        type="text"
                        value={data.servicesSection?.headline ?? ""}
                        onChange={(e) => updateField("servicesSection", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Services Section Main Title</label>
                      <input
                        type="text"
                        value={data.servicesSection?.title ?? ""}
                        onChange={(e) => updateField("servicesSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <label className={UI.label + " font-bold text-slate-700 !mb-0"}>Showcased Services Cards List</label>
                      <button
                        type="button"
                        onClick={() => addItem(["servicesSection", "items"], { title: "New Service", description: "", buttonText: "Explore Service", buttonHref: "", icon: "Shield" })}
                        className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[11px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                      >
                        + Add Service Card
                      </button>
                    </div>

                    {serviceItems.length === 0 ? (
                      <p className="text-slate-400 text-xs italic">No showcased services configured - the whole section is hidden on the live page. Click Add Service Card to start.</p>
                    ) : (
                      serviceItems.map((item: any, sIdx: number) => (
                        <div key={sIdx} className="border border-[#e0e0e0] p-6 rounded-xl space-y-5 relative bg-slate-50/50">
                          <ItemBar
                            label={`Service Card #${sIdx + 1}`}
                            index={sIdx}
                            count={serviceItems.length}
                            onMove={(dir) => moveItem(["servicesSection", "items"], sIdx, dir)}
                            onRemove={() => removeItem(["servicesSection", "items"], sIdx)}
                          />

                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-700 block">Service Name</label>
                            <input
                              type="text"
                              value={item?.title ?? ""}
                              onChange={(e) => patchItem(["servicesSection", "items"], sIdx, { title: e.target.value })}
                              className={UI.input}
                            />
                          </div>

                          <IconPicker
                            wide
                            label="Select Card Icon from Library"
                            value={item?.icon}
                            fallback="Shield"
                            onChange={(name) => patchItem(["servicesSection", "items"], sIdx, { icon: name })}
                          />

                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-700 block">Service Description Summary</label>
                            <RichTextEditor
                              content={item?.description || ""}
                              onChange={(val: string) => patchItem(["servicesSection", "items"], sIdx, { description: val })}
                              placeholder="Describe this service offering..."
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-700 block">Badges <span className="text-slate-400 font-normal">(optional, comma separated - the first 3 show as small pills)</span></label>
                            <ListTextarea
                              rows={1}
                              value={item?.features}
                              onChange={(next) => patchItem(["servicesSection", "items"], sIdx, { features: next })}
                              placeholder="e.g. Free estimates, Storm damage, 24/7"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-655">Button Label Text</label>
                              <input
                                type="text"
                                value={item?.buttonText ?? ""}
                                onChange={(e) => patchItem(["servicesSection", "items"], sIdx, { buttonText: e.target.value })}
                                className={UI.input}
                                placeholder="Explore Service"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-655">Button Destination Link / Slug URL</label>
                              <input
                                type="text"
                                value={item?.buttonHref ?? ""}
                                onChange={(e) => patchItem(["servicesSection", "items"], sIdx, { buttonHref: e.target.value })}
                                className={UI.input}
                                placeholder="e.g. /services/residential-roofing"
                              />
                              <p className="text-[10px] text-slate-400">Blank = links to /services/&lt;service name&gt;. The whole card is clickable.</p>
                            </div>
                          </div>

                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* REGIONS AND CITIES DIRECTORIES */}
            {activeTab === "regions" && (
              <div className="space-y-6">
                {visibilityHeader(
                  "Regions & Cities Visibility",
                  "Enable or disable displaying regional county coverage on the live page.",
                  data.regionsSection?.enabled !== false,
                  (v) => updateField("regionsSection", "enabled", v),
                  "Regions & Cities"
                )}
                {/* Visual Section Headline/Title Configurator */}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Regions Section Main Title</label>
                      <input
                        type="text"
                        value={data.regionsSection?.title ?? ""}
                        onChange={(e) => updateField("regionsSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Regions Section Subtitle / Help Text</label>
                      <input
                        type="text"
                        value={data.regionsSection?.description ?? ""}
                        onChange={(e) => updateField("regionsSection", "description", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={UI.label + " !mb-0"}>Active Regions &amp; Cities Directories</span>
                  <button
                    type="button"
                    onClick={() => addItem(["regions"], { name: "New County Region", description: "", cities: [], zipcodes: [] })}
                    className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[12px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                  >
                    + Add New Region
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 -mt-3">Each region is a tile on the page. Visitors click a tile to see its description, communities and zip codes; a region with none of those is just a label.</p>

                <div className="space-y-6">
                  {regions.length === 0 ? (
                    <div className="text-[13px] text-[#646970] italic p-6 border border-dashed border-[#c3c4c7] text-center bg-slate-50">
                      No regions configured - the whole section is hidden on the live page. Click Add New Region to start building the coverage list.
                    </div>
                  ) : (
                    regions.map((region: Region, rIdx: number) => (
                      <div key={rIdx} className={UI.card + " space-y-4 relative"}>
                        <ItemBar
                          label={`Region County #${rIdx + 1}`}
                          index={rIdx}
                          count={regions.length}
                          onMove={(dir) => moveItem(["regions"], rIdx, dir)}
                          onRemove={() => removeItem(["regions"], rIdx)}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5 md:col-span-3">
                            <label className={UI.label}>County / Region Name</label>
                            <input
                              type="text"
                              value={region?.name ?? ""}
                              onChange={(e) => patchItem(["regions"], rIdx, { name: e.target.value })}
                              className={UI.input + " font-bold"}
                              placeholder="e.g. St. Louis County"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <RichTextEditor
                              label="Region Description / Content Narrative (optional)"
                              content={region?.description || ""}
                              onChange={(html) => patchItem(["regions"], rIdx, { description: html })}
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                            <label className={UI.label}>Communities / Cities (comma separated)</label>
                            <ListTextarea
                              value={region?.cities}
                              onChange={(next) => patchItem(["regions"], rIdx, { cities: next })}
                              placeholder="Chesterfield, Wildwood, Ballwin, Kirkwood"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Shown as pills under "Communities We Serve".</p>
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                            <label className={UI.label}>Zip Codes (comma separated)</label>
                            <ListTextarea
                              value={region?.zipcodes}
                              onChange={(next) => patchItem(["regions"], rIdx, { zipcodes: next })}
                              placeholder="63017, 63005, 63011, 63021"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Shown as pills under "Zip Codes" when the visitor opens this region.</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* WHY CHOOSE US TAB */}
            {activeTab === "whyChoose" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Why Choose Us Visibility",
                  "Enable or disable displaying strengths on the live page.",
                  data.whyChoose?.enabled !== false,
                  (v) => updateField("whyChoose", "enabled", v),
                  "Why Choose Us"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Tagline</label>
                      <input
                        type="text"
                        value={data.whyChoose?.headline ?? ""}
                        onChange={(e) => updateField("whyChoose", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Main Title</label>
                      <input
                        type="text"
                        value={data.whyChoose?.title ?? ""}
                        onChange={(e) => updateField("whyChoose", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Featured Card Badge</label>
                    <input
                      type="text"
                      value={data.whyChoose?.featuredBadge ?? ""}
                      onChange={(e) => updateField("whyChoose", "featuredBadge", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. Highly Requested (leave empty for no badge)"
                    />
                    <p className="text-[10px] text-slate-400">The little tag on the highlighted center card (column #2).</p>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-6">
                    <div className="flex items-center justify-between">
                      <label className={UI.label + " block font-bold text-slate-700 !mb-0"}>Core Strengths Showcased (3 Columns)</label>
                      <button
                        type="button"
                        onClick={() => addItem(["whyChoose", "items"], { title: "New Strength", description: "" })}
                        className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[11px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                      >
                        + Add Column
                      </button>
                    </div>
                    {whyItems.length === 0 && (
                      <p className="text-slate-400 text-xs italic">No columns - the whole section is hidden on the live page.</p>
                    )}

                    {whyItems.map((item: any, wIdx: number) => (
                      <div key={wIdx} className="border border-[#e0e0e0] p-4 rounded-xl space-y-3 bg-slate-50/40">
                        <ItemBar
                          label={wIdx === 1 ? "Featured Center Column" : `Column #${wIdx + 1}`}
                          index={wIdx}
                          count={whyItems.length}
                          onMove={(dir) => moveItem(["whyChoose", "items"], wIdx, dir)}
                          onRemove={() => removeItem(["whyChoose", "items"], wIdx)}
                        />
                        {wIdx === 1 && (
                          <span className="inline-block text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Highlighted Dark Card</span>
                        )}

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Column Headline</label>
                          <input
                            type="text"
                            value={item?.title ?? ""}
                            onChange={(e) => patchItem(["whyChoose", "items"], wIdx, { title: e.target.value })}
                            className={UI.input}
                          />
                        </div>

                        <IconPicker
                          label="Select Column Icon"
                          value={item?.icon}
                          fallback={DEFAULT_ICONS.whyChoose[wIdx % DEFAULT_ICONS.whyChoose.length]}
                          onChange={(name) => patchItem(["whyChoose", "items"], wIdx, { icon: name })}
                        />

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Column Narrative Description</label>
                          <RichTextEditor
                            content={item?.description || ""}
                            onChange={(val: string) => patchItem(["whyChoose", "items"], wIdx, { description: val })}
                            placeholder="Describe why customers should choose this..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* DYNAMIC OVERVIEW SECTION TAB */}
            {activeTab === "overview" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Overview Section Visibility",
                  "Enable or disable displaying community overview on the live page.",
                  data.overview?.enabled !== false,
                  (v) => updateField("overview", "enabled", v),
                  "Overview Section"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Overview Section Tagline</label>
                      <input
                        type="text"
                        value={data.overview?.headline ?? ""}
                        onChange={(e) => updateField("overview", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Overview Section Main Title</label>
                      <input
                        type="text"
                        value={data.overview?.title ?? ""}
                        onChange={(e) => updateField("overview", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <RichTextEditor
                    label="Overview Description Content (Left Side Text)"
                    content={data.overview?.description || ""}
                    onChange={(html) => updateField("overview", "description", html)}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={data.overview?.buttonText ?? ""}
                        onChange={(e) => updateField("overview", "buttonText", e.target.value)}
                        className={UI.input}
                        placeholder="Leave empty for no button"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link Destination URL</label>
                      <input
                        type="text"
                        value={data.overview?.buttonHref ?? ""}
                        onChange={(e) => updateField("overview", "buttonHref", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. #contact (opens the Quick Quote form)"
                      />
                    </div>
                  </div>

                  {imageField("overview", "Overview Right-Side Image", "e.g. /uploads/roofing-about.jpg", "Optional. Leave empty and the text uses the full width.")}
                </div>
              </div>
            )}

            {/* VIDEO TESTIMONIALS TAB (content.videoTestimonials) */}
            {activeTab === "videoTestimonials" && (
              <div className="max-w-3xl">
                <VideoTestimonialsEditor
                  value={data.videoTestimonials}
                  onChange={(next) => setData((prev: any) => ({ ...(prev || {}), videoTestimonials: next }))}
                />
              </div>
            )}

            {/* FAQ SECTION (visibility only - the questions live in the page-level "Page FAQs" tab) */}
            {activeTab === "faq" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "FAQ Section Visibility",
                  "Show or hide the FAQ block on the live page.",
                  data.faqSection?.enabled !== false,
                  (v) => updateField("faqSection", "enabled", v),
                  "FAQ Section"
                )}
                <div className={UI.card + " space-y-2"}>
                  <p className="text-[13px] text-[#1d2327]">
                    The questions, section heading, description, the "strategy session" box and the FAQ schema are edited in the
                    <strong> Page FAQs </strong>tab at the top of this page.
                  </p>
                  <p className="text-[12px] text-[#646970]">
                    If this page has no FAQs of its own, the site-wide FAQ list is shown instead.
                  </p>
                </div>
              </div>
            )}

            {/* CALL TO ACTION TAB */}
            {activeTab === "cta" && (
              <div className="max-w-3xl space-y-6">
                {visibilityHeader(
                  "Lead Call To Action Visibility",
                  "Enable or disable displaying CTA banner on the live page.",
                  data.cta?.enabled !== false,
                  (v) => updateField("cta", "enabled", v),
                  "Call To Action"
                )}
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>CTA Headline</label>
                    <input
                      type="text"
                      value={data.cta?.headline ?? ""}
                      onChange={(e) => updateField("cta", "headline", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>CTA Subheadline Narrative</label>
                    <RichTextEditor
                      content={data.cta?.description || ""}
                      onChange={(val: string) => updateField("cta", "description", val)}
                      placeholder="Describe the call to action..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Button Label</label>
                    <input
                      type="text"
                      value={data.cta?.buttonText ?? ""}
                      onChange={(e) => updateField("cta", "buttonText", e.target.value)}
                      className={UI.input}
                      placeholder="Leave empty for no button"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Button Link / Anchor</label>
                    <input
                      type="text"
                      value={data.cta?.buttonHref ?? ""}
                      onChange={(e) => updateField("cta", "buttonHref", e.target.value)}
                      className={UI.input}
                      placeholder="e.g. #contact (opens the Quick Quote form) or /contact-us"
                    />
                    <p className="text-[10px] text-slate-400">This section is the page's <code>#contact</code> anchor. A blank link behaves like <code>#contact</code>.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schema" && (
              <div className="space-y-4">
                {/* Same source of truth as the page-level "Schema Markup" tab (page seo.schemaData,
                    mirrored into content.schemaMarkup). Writing only content.* here used to be
                    overwritten on save by the page's own seo.schemaData. */}
                <SchemaEditor
                  value={seo?.schemaData || data.schemaMarkup || ""}
                  onChange={(val) => {
                    if (setSeo) setSeo({ ...(seo || {}), schemaData: val });
                    setData((prev: any) => ({ ...(prev || {}), schemaMarkup: val }));
                  }}
                  pageTitle={data.title || "Service Area"}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {activeMediaTarget && (
        <MediaSelector
          onSelect={(item) => {
            updateField(activeMediaTarget.section, activeMediaTarget.field, item.url);
            setActiveMediaTarget(null);
          }}
          onClose={() => setActiveMediaTarget(null)}
          title={`Select Image for ${activeMediaTarget.section === 'hero' ? 'Hero Banner' : 'Overview Section'}`}
        />
      )}
    </div>
  );
}
