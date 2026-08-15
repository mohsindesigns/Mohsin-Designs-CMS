"use client";

// Redesigned ServiceAreaEditor with fully-featured administration tabs, visual Icon Picker, MediaSelector modal, and dynamic Process / Regions sections
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Type, Globe, CheckCircle, Search, HelpCircle,
  Plus, Trash2, ShieldCheck, Mail, Map, MapPin, BarChart3, Settings, ClipboardList,
  Layers, Star, ShieldAlert, Wrench, Home, Building2, Building, Droplets, Award, Clock, BadgeCheck, TrendingUp, Users, Layout, TreePine,
  Flame, PencilRuler, Shield
} from "lucide-react";
import dynamic from "next/dynamic";
import { UI } from "./styles";
import MediaSelector from "@/components/admin/MediaSelector";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

interface Region {
  name: string;
  cities: string[];
  zipcodes: string[];
  description?: string;
}

// Icon library items with live icon rendering
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
  { name: "ShieldAlert", label: "Storm Damage", icon: ShieldAlert },
  { name: "Flame", label: "Heat / Fire Resilient", icon: Flame },
  { name: "PencilRuler", label: "Custom Architecture", icon: PencilRuler }
];

export default function ServiceAreaEditor({ pageId, data, setData }: { pageId: string, data: any, setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("intro");
  const [activeMediaTarget, setActiveMediaTarget] = useState<{ section: string; field: string } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Keep state hydrated with complete content parameters for all sections
  useEffect(() => {
    if (data && !isHydrated) {
      const needsHydration = !data.regions || !data.stats || !data.process || !data.map || !data.materials || !data.whyChoose || !data.overview || !data.servicesSection || !data.processSection || !data.regionsSection || !data.hero;
      if (needsHydration) {
        setData({
          ...data,
          hero: data.hero || {
            headline: data.hero?.headline || "Our Service Areas",
            description: data.hero?.description || "Proudly serving St. Louis, St. Charles, and surrounding Missouri communities with elite, veteran-owned roofing and home improvements.",
            image: data.hero?.image || "/images/service-area-hero.jpg"
          },
          stats: data.stats || [
            { value: "15+", label: "Years of Local Expertise" },
            { value: "500+", label: "Premium Roofs Installed" },
            { value: "100%", label: "Veteran-Owned & Operated" }
          ],
          process: data.process || data.processSteps || [
            { title: "Free Inspection", description: "We perform a highly detailed visual inspection of your entire roof, shingle layers, gutters, and attic structure." },
            { title: "Custom Quote", description: "Receive an itemized, fully transparent project quote detailing premium materials, scopes, and warranty parameters." },
            { title: "Elite Install", description: "Our certified expert crews complete your roofing or siding replacement with ultimate military precision and focus." },
            { title: "Final Sign-Off", description: "We execute a deep ground clean-up and a final walkthrough with you to verify that our work exceeds your expectations." }
          ],
          processSection: data.processSection || {
            headline: "Our Core Blueprint",
            title: "Our Elite 4-Step Process"
          },
          regions: data.regions || [
            {
              name: "St. Louis County",
              cities: ["Chesterfield", "Wildwood", "Ballwin", "Kirkwood", "Webster Groves", "Florissant", "Hazelwood", "Maryland Heights", "Eureka", "Fenton", "Ladue", "Clayton"],
              zipcodes: ["63017", "63005", "63011", "63021", "63122", "63119", "63031", "63042", "63043", "63025", "63026", "63124", "63105"]
            },
            {
              name: "St. Charles County",
              cities: ["St. Charles", "St. Peters", "O'Fallon", "Wentzville", "Lake St. Louis", "Cottleville", "Weldon Spring", "Defiance"],
              zipcodes: ["63301", "63303", "63304", "63376", "63366", "63368", "63385", "63367"]
            }
          ],
          regionsSection: data.regionsSection || {
            title: "Communities We Serve in This Region",
            description: "Toggle regional counties to view specific community coverage lists."
          },
          map: data.map || {
            headline: "Our Coverage Area",
            title: "Our Operational Coverage Map",
            description: "Centrally dispatched to provide lightning-fast storm response, professional inspections, and veteran-grade roof installations across all primary Missouri counties.",
            iframeUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199426.6823901614!2d-90.3835467!3d38.6531004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sSt.+Louis%2C+MO!5e0!3m2!1sen!2sus!4v1700000000000",
            bullet1Title: "Primary Coverage Area",
            bullet1Text: "St. Louis, St. Charles, Jefferson & surrounding communities.",
            bullet2Title: "Operation Hours",
            bullet2Text: "Mon - Sat: 7:00 AM - 6:00 PM (Emergency storm response 24/7)",
            bullet3Title: "Direct Office Hotline",
            bullet3Text: "(636) 293-9977"
          },
          materials: data.materials || {
            headline: "Certified Excellence",
            title: "Premium Materials We Install",
            items: [
              { title: "Asphalt Shingles", description: "Architectural shingles engineered for ultimate storm protection, wind resilience, and custom color coordination to match your house aesthetics.", icon: "Building" },
              { title: "Standing Seam Metal", description: "High-end modern architectural profile that offers complete storm immunity, maximum energy efficiency, and a lifetime of zero maintenance.", icon: "Flame" },
              { title: "High-End Siding", description: "Fiber cement siding configured to stand strong against moisture rot, pests, and high wind impacts, instantly boosting your curb appeal.", icon: "PencilRuler" },
              { title: "Seamless Gutters", description: "High-capacity aluminum water drainage channels manufactured custom on-site to perfectly fit your roof perimeter and protect your soil foundations.", icon: "Droplets" }
            ]
          },
          servicesSection: data.servicesSection || {
            headline: "What We Provide",
            title: "Services We Provide in This Area",
            items: [
              { title: "Residential Roofing", description: "Pristine asphalt shingle and standing seam metal roof replacements designed for ultimate local storm immunity.", buttonText: "Explore Service", buttonHref: "/services/residential-roofing", icon: "Home" },
              { title: "Commercial Roofing", description: "Heavy-duty TPO, EPDM, and flat roof coatings configured for Missouri commercial properties and corporate facilities.", buttonText: "Explore Service", buttonHref: "/services/commercial-roofing", icon: "Building" },
              { title: "Seamless Gutters", description: "Custom on-site rolled high-capacity aluminum gutter installations to secure proper rain drainage controls.", buttonText: "Explore Service", buttonHref: "/services/seamless-gutters", icon: "Droplets" }
            ]
          },
          whyChoose: data.whyChoose || {
            headline: "Why Choose Us",
            title: "Elite Missouri Roofing Quality",
            items: [
              { title: "Licensed & Fully Insured", description: "Complete compliance for your peace of mind. We hold full general liability, workers' comp, and active licensing across all service counties.", icon: "Shield" },
              { title: "Rapid Storm Dispatch", description: "Expedited emergency tarping and inspections. St. Louis storm damage requires immediate action, and our teams respond directly inside our operational radius.", icon: "Clock" },
              { title: "Veteran Owned Standards", description: "Applying military precision, honor, and elite craftsmanship to every shingle repair, gutter build, and residential siding replacement.", icon: "Award" }
            ]
          },
          overview: data.overview || {
            headline: "Local Overview",
            title: "Elite Roofing & Restoration in This Community",
            description: "<p>Proudly providing premium residential roofing, standing seam metal builds, siding updates, and gutter cleanups to Missouri homeowners. We combine veteran precision with durable local materials.</p>",
            buttonText: "Schedule Free Inspection",
            buttonHref: "#contact",
            image: "/images/service-area-overview.jpg"
          },
          cta: data.cta || {
            headline: "Ready to Start Your Project?",
            description: "Whether you need a minor repair or a complete roof replacement, our expert team is ready to protect your home. Contact us today for an elite-grade service experience.",
            buttonText: "Schedule Free Inspection",
            buttonHref: "#contact"
          }
        });
      }
      setIsHydrated(true);
    }
  }, [data, isHydrated, setData]);

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const updateField = (section: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const current = prev || {};
      if (field === null) {
        return { ...current, [section]: value };
      }
      return {
        ...current,
        [section]: {
          ...(current[section] || {}),
          [field]: value
        }
      };
    });
  };

  const tabs = [
    { id: "intro", label: "Intro & Hero", icon: Type, title: "Hero Banner Configurator" },
    { id: "stats", label: "Statistics Row", icon: BarChart3, title: "Stats Highlights Counter" },
    { id: "map", label: "Map & Dispatch", icon: Map, title: "Coverage Map & Coordinates" },
    { id: "process", label: "Operational Process", icon: ClipboardList, title: "4-Step Blueprint Roadmap" },
    { id: "materials", label: "Premium Materials", icon: Layers, title: "Installed Materials Options" },
    { id: "services", label: "Services Showcase", icon: Wrench, title: "Services Showcase Configuration" },
    { id: "regions", label: "Regions & Cities", icon: MapPin, title: "County Coverage Directories" },
    { id: "whyChoose", label: "Why Choose Us", icon: Star, title: "Core Strengths Showcase" },
    { id: "overview", label: "Overview Section", icon: ShieldAlert, title: "Overview Content Configurator" },
    { id: "cta", label: "Lead Call To Action", icon: ShieldCheck, title: "Final CTA Configurator" },
  ];

  const activeTabTitle = tabs.find(t => t.id === activeTab)?.title;

  return (
    <div className="bg-white">
      {/* Tab Select Header List */}
      <div className="flex flex-wrap items-center gap-1 mb-6 text-[13px] border-b border-[#f0f0f1] pb-1">
        {tabs.map((tab, idx) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
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
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Hero Headline</label>
                    <input
                      type="text"
                      value={data.hero?.headline || ""}
                      onChange={(e) => updateField("hero", "headline", e.target.value)}
                      className={UI.inputLarge}
                    />
                  </div>
                  <RichTextEditor
                    label="Hero Description (100% White on Front)"
                    content={data.hero?.description || ""}
                    onChange={(html) => updateField("hero", "description", html)}
                  />
                  <div className="space-y-2">
                    <label className={UI.label}>Hero Background Banner Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.hero?.image || ""}
                        onChange={(e) => updateField("hero", "image", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. /images/service-area-hero.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMediaTarget({ section: "hero", field: "image" })}
                        className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-4 py-1 text-[12px] font-semibold rounded-sm hover:bg-[#f0f6fb] transition-colors shrink-0"
                      >
                        Select Image
                      </button>
                    </div>
                    {data.hero?.image && (
                      <div className="mt-2 w-32 aspect-video relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={data.hero.image} alt="Hero preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STATISTICS TAB */}
            {activeTab === "stats" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-6"}>
                  <label className={UI.label + " block border-b border-[#f0f0f1] pb-2"}>Statistics Values & Labels</label>

                  {(!data.stats || data.stats.length === 0) ? (
                    <p className="text-slate-400 text-xs italic">No stats configured.</p>
                  ) : (
                    data.stats.map((stat: any, sIdx: number) => (
                      <div key={sIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#e0e0e0] p-4 rounded-xl relative">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#646970] uppercase">Stat Counter Value</label>
                          <input
                            type="text"
                            value={stat.value}
                            onChange={(e) => {
                              const newStats = [...data.stats];
                              newStats[sIdx].value = e.target.value;
                              updateField("stats", null, newStats);
                            }}
                            className={UI.input}
                            placeholder="e.g. 15+ or 100%"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[#646970] uppercase">Stat Subtitle Label</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...data.stats];
                              newStats[sIdx].label = e.target.value;
                              updateField("stats", null, newStats);
                            }}
                            className={UI.input}
                            placeholder="e.g. Years of Local Expertise"
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* MAP & DISPATCH TAB */}
            {activeTab === "map" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Tagline</label>
                      <input
                        type="text"
                        value={data.map?.headline || ""}
                        onChange={(e) => updateField("map", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Title Headline</label>
                      <input
                        type="text"
                        value={data.map?.title || ""}
                        onChange={(e) => updateField("map", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Coverage Narrative Description</label>
                    <textarea
                      value={data.map?.description || ""}
                      onChange={(e) => updateField("map", "description", e.target.value)}
                      className={UI.textarea}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Google Map Embed Source URL</label>
                    <input
                      type="text"
                      value={data.map?.iframeUrl || ""}
                      onChange={(e) => updateField("map", "iframeUrl", e.target.value)}
                      className={UI.input}
                      placeholder="https://www.google.com/maps/embed..."
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Paste the source URL (the value of the iframe src attribute) of your Google Map.</p>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-4">
                    <label className={UI.label + " block font-bold text-slate-700"}>Dispatch Coordinates Info Blocks</label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#e0e0e0] p-4 rounded-xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 1: Title</label>
                        <input
                          type="text"
                          value={data.map?.bullet1Title || ""}
                          onChange={(e) => updateField("map", "bullet1Title", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 1: Text</label>
                        <input
                          type="text"
                          value={data.map?.bullet1Text || ""}
                          onChange={(e) => updateField("map", "bullet1Text", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#e0e0e0] p-4 rounded-xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 2: Title</label>
                        <input
                          type="text"
                          value={data.map?.bullet2Title || ""}
                          onChange={(e) => updateField("map", "bullet2Title", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 2: Text</label>
                        <input
                          type="text"
                          value={data.map?.bullet2Text || ""}
                          onChange={(e) => updateField("map", "bullet2Text", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-[#e0e0e0] p-4 rounded-xl">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 3: Title</label>
                        <input
                          type="text"
                          value={data.map?.bullet3Title || ""}
                          onChange={(e) => updateField("map", "bullet3Title", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[#646970] uppercase">Coordinate 3: Text</label>
                        <input
                          type="text"
                          value={data.map?.bullet3Text || ""}
                          onChange={(e) => updateField("map", "bullet3Text", e.target.value)}
                          className={UI.input}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PROCESS ROADMAP TAB */}
            {activeTab === "process" && (
              <div className="max-w-3xl space-y-6">
                {/* Visual Section Headline/Title Configurator */}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Process Section Tagline</label>
                      <input
                        type="text"
                        value={data.processSection?.headline || ""}
                        onChange={(e) => updateField("processSection", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Process Section Main Title</label>
                      <input
                        type="text"
                        value={data.processSection?.title || ""}
                        onChange={(e) => updateField("processSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {(!data.process || data.process.length === 0) ? (
                    <p className="text-slate-400 text-xs italic">No process roadmap steps configured.</p>
                  ) : (
                    data.process.map((step: any, pIdx: number) => (
                      <div key={pIdx} className={UI.card + " space-y-4 relative"}>
                        <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {pIdx + 1}
                            </span>
                            <span className="text-[11px] font-bold text-[#646970] uppercase tracking-wider">Step blueprint #{pIdx + 1}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newSteps = data.process.filter((_: any, i: number) => i !== pIdx);
                              updateField("process", null, newSteps);
                            }}
                            className="text-[#d63638] hover:text-[#b32b2d] flex items-center gap-1 text-[11px] font-semibold"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1.5">
                            <label className={UI.label}>Step Title</label>
                            <input
                              type="text"
                              value={step.title}
                              onChange={(e) => {
                                const newSteps = [...data.process];
                                newSteps[pIdx].title = e.target.value;
                                updateField("process", null, newSteps);
                              }}
                              className={UI.input}
                              placeholder="e.g. Free Inspection"
                            />
                          </div>

                          {/* VISUAL ICON PICKER FOR PROCESS STEP */}
                          <div className="space-y-3 border border-[#f0f0f1] p-3 bg-white rounded-lg">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-slate-700 block">Select Step Icon</label>
                              <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border">
                                <span>Active:</span>
                                <span className="text-primary font-black uppercase">{step.icon || "ClipboardList"}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                              {AVAILABLE_ICONS.slice(0, 18).map((iConfig) => {
                                const LiveIcon = iConfig.icon;
                                const defaultIcons = ["ClipboardList", "TrendingUp", "Wrench", "Star"];
                                const isSelected = (step.icon || defaultIcons[pIdx % defaultIcons.length]).toLowerCase() === iConfig.name.toLowerCase();
                                return (
                                  <button
                                    key={iConfig.name}
                                    type="button"
                                    onClick={() => {
                                      const newSteps = [...data.process];
                                      newSteps[pIdx].icon = iConfig.name;
                                      updateField("process", null, newSteps);
                                    }}
                                    className={`p-1.5 rounded border flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/40"
                                      }`}
                                  >
                                    <LiveIcon className="w-4 h-4" />
                                    <span className="text-[8px] truncate max-w-full font-bold">{iConfig.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className={UI.label}>Step Description Narrative</label>
                            <textarea
                              value={step.description}
                              onChange={(e) => {
                                const newSteps = [...data.process];
                                newSteps[pIdx].description = e.target.value;
                                updateField("process", null, newSteps);
                              }}
                              className={UI.textarea}
                              rows={3}
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
                      onClick={() => {
                        const newSteps = [...(data.process || [])];
                        newSteps.push({ title: "New Step", description: "", icon: "ClipboardList" });
                        updateField("process", null, newSteps);
                      }}
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
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Materials Section Tagline</label>
                      <input
                        type="text"
                        value={data.materials?.headline || "Certified Excellence"}
                        onChange={(e) => updateField("materials", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Materials Section Title</label>
                      <input
                        type="text"
                        value={data.materials?.title || "Premium Materials We Install"}
                        onChange={(e) => updateField("materials", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-6">
                    <label className={UI.label + " block font-bold text-slate-700"}>Materials Categories Cards</label>

                    {(data.materials?.items || []).map((item: any, mIdx: number) => (
                      <div key={mIdx} className="border border-[#e0e0e0] p-4 rounded-xl space-y-3 bg-slate-50/40">
                        <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-1">
                          <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {mIdx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-[#646970] uppercase">Material Card #{mIdx + 1}</span>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Material Category Title</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...data.materials.items];
                              newItems[mIdx].title = e.target.value;
                              updateField("materials", "items", newItems);
                            }}
                            className={UI.input}
                          />
                        </div>

                        {/* VISUAL ICON PICKER FOR PREMIUM MATERIALS */}
                        <div className="space-y-3 border-y border-[#f0f0f1] py-3 bg-white px-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 block">Select Material Card Icon</label>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border">
                              <span>Active:</span>
                              <span className="text-primary font-black uppercase">{item.icon || "Building"}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                            {AVAILABLE_ICONS.slice(0, 18).map((iConfig) => {
                              const LiveIcon = iConfig.icon;
                              const isSelected = (item.icon || "Building").toLowerCase() === iConfig.name.toLowerCase();
                              return (
                                <button
                                  key={iConfig.name}
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...data.materials.items];
                                    newItems[mIdx].icon = iConfig.name;
                                    updateField("materials", "items", newItems);
                                  }}
                                  className={`p-1.5 rounded border flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/40"
                                    }`}
                                >
                                  <LiveIcon className="w-4 h-4" />
                                  <span className="text-[8px] truncate max-w-full font-bold">{iConfig.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Material Description</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...data.materials.items];
                              newItems[mIdx].description = e.target.value;
                              updateField("materials", "items", newItems);
                            }}
                            className={UI.textarea}
                            rows={2}
                          />
                        </div>

                        {/* Button Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-[#f0f0f1] pt-3">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Button Label <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. Learn More"
                              value={item.buttonLabel || ""}
                              onChange={(e) => {
                                const newItems = [...data.materials.items];
                                newItems[mIdx].buttonLabel = e.target.value;
                                updateField("materials", "items", newItems);
                              }}
                              className={UI.input}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-slate-600">Button Link <span className="text-slate-400 font-normal">(optional)</span></label>
                            <input
                              type="text"
                              placeholder="e.g. /services/residential-roofing"
                              value={item.buttonHref || ""}
                              onChange={(e) => {
                                const newItems = [...data.materials.items];
                                newItems[mIdx].buttonHref = e.target.value;
                                updateField("materials", "items", newItems);
                              }}
                              className={UI.input}
                            />
                          </div>
                          <p className="col-span-2 text-[10px] text-slate-400 italic">Button only appears on the page if both Label and Link are filled in.</p>
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
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Services Section Tagline</label>
                      <input
                        type="text"
                        value={data.servicesSection?.headline || "What We Provide"}
                        onChange={(e) => updateField("servicesSection", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Services Section Main Title</label>
                      <input
                        type="text"
                        value={data.servicesSection?.title || "Services We Provide in This Area"}
                        onChange={(e) => updateField("servicesSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <label className={UI.label + " font-bold text-slate-700"}>Showcased Services Cards List</label>
                      <button
                        onClick={() => {
                          const newItems = [...(data.servicesSection?.items || [])];
                          newItems.push({ title: "New Service", description: "Service description here...", buttonText: "Explore Service", buttonHref: "/services/new-service", icon: "Shield" });
                          updateField("servicesSection", "items", newItems);
                        }}
                        className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[11px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                      >
                        + Add Service Card
                      </button>
                    </div>

                    {(!data.servicesSection?.items || data.servicesSection.items.length === 0) ? (
                      <p className="text-slate-400 text-xs italic">No showcased services configured. Click Add Service Card to start.</p>
                    ) : (
                      data.servicesSection.items.map((item: any, sIdx: number) => (
                        <div key={sIdx} className="border border-[#e0e0e0] p-6 rounded-xl space-y-5 relative bg-slate-50/50">

                          <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-2">
                            <span className="text-[11px] font-bold text-[#646970] uppercase">Service Card #{sIdx + 1}</span>
                            <button
                              onClick={() => {
                                const newItems = data.servicesSection.items.filter((_: any, idx: number) => idx !== sIdx);
                                updateField("servicesSection", "items", newItems);
                              }}
                              className="text-slate-400 hover:text-[#d63638] transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-700 block">Service Name</label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => {
                                const newItems = [...data.servicesSection.items];
                                newItems[sIdx].title = e.target.value;
                                updateField("servicesSection", "items", newItems);
                              }}
                              className={UI.input}
                            />
                          </div>

                          {/* VISUAL ICON PICKER LIBRARY FOR SERVICES */}
                          <div className="space-y-3 border-y border-[#f0f0f1] py-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[12px] font-bold text-slate-700 block">Select Card Icon from Library</label>
                              <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-800">
                                <span>Active Icon:</span>
                                <span className="text-primary font-black uppercase text-[10px]">{item.icon || "Shield"}</span>
                              </div>
                            </div>

                            {/* Icon Grid Picker */}
                            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                              {AVAILABLE_ICONS.map((iConfig) => {
                                const LiveIcon = iConfig.icon;
                                const isSelected = (item.icon || "Shield").toLowerCase() === iConfig.name.toLowerCase();

                                return (
                                  <button
                                    key={iConfig.name}
                                    type="button"
                                    onClick={() => {
                                      const newItems = [...data.servicesSection.items];
                                      newItems[sIdx].icon = iConfig.name;
                                      updateField("servicesSection", "items", newItems);
                                    }}
                                    className={`p-2.5 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all group ${isSelected
                                        ? "border-primary bg-primary/5 text-primary shadow-sm"
                                        : "border-slate-100 hover:border-slate-300 hover:bg-slate-50 text-slate-655"
                                      }`}
                                    title={iConfig.label}
                                  >
                                    <LiveIcon className={`w-5 h-5 transition-transform ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`} />
                                    <span className="text-[8px] font-semibold truncate max-w-full">{iConfig.name}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-[12px] font-bold text-slate-700 block">Service Description Summary</label>
                            <textarea
                              value={item.description}
                              onChange={(e) => {
                                const newItems = [...data.servicesSection.items];
                                newItems[sIdx].description = e.target.value;
                                updateField("servicesSection", "items", newItems);
                              }}
                              className={UI.textarea}
                              rows={2.5}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-655">Button Label Text</label>
                              <input
                                type="text"
                                value={item.buttonText || "Explore Service"}
                                onChange={(e) => {
                                  const newItems = [...data.servicesSection.items];
                                  newItems[sIdx].buttonText = e.target.value;
                                  updateField("servicesSection", "items", newItems);
                                }}
                                className={UI.input}
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[11px] font-bold text-slate-655">Button Destination Link / Slug URL</label>
                              <input
                                type="text"
                                value={item.buttonHref || ""}
                                onChange={(e) => {
                                  const newItems = [...data.servicesSection.items];
                                  newItems[sIdx].buttonHref = e.target.value;
                                  updateField("servicesSection", "items", newItems);
                                }}
                                className={UI.input}
                                placeholder="e.g. /services/residential-roofing"
                              />
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
                {/* Visual Section Headline/Title Configurator */}
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Regions Section Main Title</label>
                      <input
                        type="text"
                        value={data.regionsSection?.title || ""}
                        onChange={(e) => updateField("regionsSection", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Regions Section Subtitle / Help Text</label>
                      <input
                        type="text"
                        value={data.regionsSection?.description || ""}
                        onChange={(e) => updateField("regionsSection", "description", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={UI.label}>Active Regions & Cities Directories</span>
                  <button
                    onClick={() => {
                      const newRegions = [...(data.regions || [])];
                      newRegions.push({ name: "New County Region", cities: [], zipcodes: [] });
                      updateField("regions", null, newRegions);
                    }}
                    className="bg-[#f0f0f1] border border-[#c3c4c7] px-3 py-1 text-[12px] font-semibold rounded-sm hover:bg-white text-[#2c3338] transition-colors"
                  >
                    + Add New Region
                  </button>
                </div>

                <div className="space-y-6">
                  {(!data.regions || data.regions.length === 0) ? (
                    <div className="text-[13px] text-[#646970] italic p-6 border border-dashed border-[#c3c4c7] text-center bg-slate-50">
                      No regions configured. Click Add New Region to start building coverage list.
                    </div>
                  ) : (
                    data.regions.map((region: Region, rIdx: number) => (
                      <div key={rIdx} className={UI.card + " space-y-4 relative"}>
                        <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-[#f0f6fb] text-[#2271b1] rounded-[3px] flex items-center justify-center border border-[#dcdcde]">
                              <Map className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[11px] font-bold text-[#646970]">Region County #{rIdx + 1}</span>
                          </div>
                          <button
                            onClick={() => {
                              const newRegions = data.regions.filter((_: any, idx: number) => idx !== rIdx);
                              updateField("regions", null, newRegions);
                            }}
                            className="text-slate-400 hover:text-[#d63638] transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5 md:col-span-3">
                            <label className={UI.label}>County / Region Name</label>
                            <input
                              type="text"
                              value={region.name}
                              onChange={(e) => {
                                const newRegions = [...data.regions];
                                newRegions[rIdx].name = e.target.value;
                                updateField("regions", null, newRegions);
                              }}
                              className={UI.input + " font-bold"}
                              placeholder="e.g. St. Louis County"
                            />
                          </div>

                          <div className="md:col-span-3">
                            <RichTextEditor
                              label="Region Description / Content Narrative"
                              content={region.description || ""}
                              onChange={(html) => {
                                const newRegions = [...data.regions];
                                newRegions[rIdx].description = html;
                                updateField("regions", null, newRegions);
                              }}
                            />
                          </div>

                          <div className="space-y-1.5 md:col-span-3">
                            <label className={UI.label}>Zip Codes (Comma separated)</label>
                            <textarea
                              value={region.zipcodes ? region.zipcodes.join(", ") : ""}
                              onChange={(e) => {
                                const newRegions = [...data.regions];
                                newRegions[rIdx].zipcodes = e.target.value.split(",").map(z => z.trim()).filter(Boolean);
                                updateField("regions", null, newRegions);
                              }}
                              className={UI.textarea}
                              rows={2}
                              placeholder="63017, 63005, 63011, 63021"
                            />
                            <p className="text-[10px] text-slate-400 mt-1">Separate zip codes with commas. Used for coverage verification lookup.</p>
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
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Tagline</label>
                      <input
                        type="text"
                        value={data.whyChoose?.headline || "Why Choose Us"}
                        onChange={(e) => updateField("whyChoose", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Section Main Title</label>
                      <input
                        type="text"
                        value={data.whyChoose?.title || "Elite Missouri Roofing Quality"}
                        onChange={(e) => updateField("whyChoose", "title", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#f0f0f1] pt-4 space-y-6">
                    <label className={UI.label + " block font-bold text-slate-700"}>Core Strengths Showcased (3 Columns)</label>

                    {(data.whyChoose?.items || []).map((item: any, wIdx: number) => (
                      <div key={wIdx} className="border border-[#e0e0e0] p-4 rounded-xl space-y-3 bg-slate-50/40">
                        <div className="flex items-center gap-2 border-b border-[#f0f0f1] pb-1">
                          <span className="w-5 h-5 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                            {wIdx + 1}
                          </span>
                          <span className="text-[10px] font-bold text-[#646970] uppercase">
                            {wIdx === 1 ? "Featured Center Column" : `Column #${wIdx + 1}`}
                          </span>
                          {wIdx === 1 && (
                            <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Highlighted Dark Mode Card</span>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Column Headline</label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => {
                              const newItems = [...data.whyChoose.items];
                              newItems[wIdx].title = e.target.value;
                              updateField("whyChoose", "items", newItems);
                            }}
                            className={UI.input}
                          />
                        </div>

                        {/* VISUAL ICON PICKER FOR WHY CHOOSE US */}
                        <div className="space-y-3 border-y border-[#f0f0f1] py-3 bg-white px-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700 block">Select Column Icon</label>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded text-[10px] font-bold text-slate-700 border">
                              <span>Active:</span>
                              <span className="text-primary font-black uppercase">{item.icon || "Shield"}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1">
                            {AVAILABLE_ICONS.slice(0, 18).map((iConfig) => {
                              const LiveIcon = iConfig.icon;
                              const isSelected = (item.icon || "Shield").toLowerCase() === iConfig.name.toLowerCase();
                              return (
                                <button
                                  key={iConfig.name}
                                  type="button"
                                  onClick={() => {
                                    const newItems = [...data.whyChoose.items];
                                    newItems[wIdx].icon = iConfig.name;
                                    updateField("whyChoose", "items", newItems);
                                  }}
                                  className={`p-1.5 rounded border flex flex-col items-center justify-center gap-0.5 transition-colors ${isSelected ? "border-primary bg-primary/5 text-primary" : "border-slate-100 hover:border-slate-200 text-slate-500 bg-slate-50/40"
                                    }`}
                                >
                                  <LiveIcon className="w-4 h-4" />
                                  <span className="text-[8px] truncate max-w-full font-bold">{iConfig.name}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-600">Column Narrative Description</label>
                          <textarea
                            value={item.description}
                            onChange={(e) => {
                              const newItems = [...data.whyChoose.items];
                              newItems[wIdx].description = e.target.value;
                              updateField("whyChoose", "items", newItems);
                            }}
                            className={UI.textarea}
                            rows={2}
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
                <div className={UI.card + " space-y-5"}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className={UI.label}>Overview Section Tagline</label>
                      <input
                        type="text"
                        value={data.overview?.headline || ""}
                        onChange={(e) => updateField("overview", "headline", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Overview Section Main Title</label>
                      <input
                        type="text"
                        value={data.overview?.title || ""}
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
                        value={data.overview?.buttonText || ""}
                        onChange={(e) => updateField("overview", "buttonText", e.target.value)}
                        className={UI.input}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link Destination URL</label>
                      <input
                        type="text"
                        value={data.overview?.buttonHref || ""}
                        onChange={(e) => updateField("overview", "buttonHref", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. #contact"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className={UI.label}>Overview Right-Side Image</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={data.overview?.image || ""}
                        onChange={(e) => updateField("overview", "image", e.target.value)}
                        className={UI.input}
                        placeholder="e.g. /images/roofing-about.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => setActiveMediaTarget({ section: "overview", field: "image" })}
                        className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-4 py-1 text-[12px] font-semibold rounded-sm hover:bg-[#f0f6fb] transition-colors shrink-0"
                      >
                        Select Image
                      </button>
                    </div>
                    {data.overview?.image && (
                      <div className="mt-2 w-32 aspect-video relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={data.overview.image} alt="Overview preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CALL TO ACTION TAB */}
            {activeTab === "cta" && (
              <div className="max-w-3xl space-y-6">
                <div className={UI.card + " space-y-5"}>
                  <div className="space-y-1.5">
                    <label className={UI.label}>CTA Headline</label>
                    <input
                      type="text"
                      value={data.cta?.headline || ""}
                      onChange={(e) => updateField("cta", "headline", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>CTA Subheadline Narrative</label>
                    <textarea
                      value={data.cta?.description || ""}
                      onChange={(e) => updateField("cta", "description", e.target.value)}
                      className={UI.textarea}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Button Label</label>
                    <input
                      type="text"
                      value={data.cta?.buttonText || ""}
                      onChange={(e) => updateField("cta", "buttonText", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Button Link / Anchor</label>
                    <input
                      type="text"
                      value={data.cta?.buttonHref || ""}
                      onChange={(e) => updateField("cta", "buttonHref", e.target.value)}
                      className={UI.input}
                    />
                  </div>
                </div>
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
