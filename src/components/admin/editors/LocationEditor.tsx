"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Loader2, Image as ImageIcon,
  Type, Settings, Star, Sparkles, Layers,
  MoveUp, MoveDown, CheckCircle2, Globe, MapPin,
  Trophy, Users, Smile, ArrowRight, ExternalLink,
  ChevronDown, Search, Link2
} from "lucide-react";
import ImageField from "@/components/admin/ImageField";
import IconSelector from "@/components/admin/IconSelector";
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";

const DEFAULT_LOCATION_DATA = {
  hero: {
    eyebrow: "OUR GLOBAL PRESENCE",
    titleIntro: "Engineered for Growth Across ",
    titleHighlight: "Global Markets.",
    description: "Empowering high-growth businesses and enterprise brands with bespoke web architecture, technical SEO, and conversion science tailored for local dominance.",
    ctaPrimaryText: "EXPLORE OUR WORK",
    ctaPrimaryHref: "/gallery",
    ctaSecondaryText: "GET FREE STRATEGY",
    ctaSecondaryHref: "/contact",
    bgLight: "/locationhero.png",
    bgDark: "/locationherodark.png"
  },
  stats: {
    experience: { value: "10+", label: "Years Industry Experience", icon: "Trophy" },
    countries: { value: "15+", label: "Active Geographic Hubs", icon: "MapPin" },
    clients: { value: "500+", label: "Global Brands Powered", icon: "Users" },
    satisfaction: { value: "99.4%", label: "Client Satisfaction Rate", icon: "Smile" }
  },
  brandsStrip: {
    heading: "TRUSTED AD PLATFORMS // CERTIFIED NETWORKS",
    logos: [
      { name: "Google Ads" },
      { name: "Meta Business" },
      { name: "Amazon Ads" },
      { name: "Microsoft Bing" },
      { name: "Apple Search" },
      { name: "eBay Partner" },
      { name: "Reddit Ads" }
    ]
  },
  presence: {
    eyebrow: "GLOBAL COVERAGE",
    titleIntro: "Serving High-Growth Brands Across ",
    titleHighlight: "3 Continents",
    description: "Browse our localized service hubs and discover how we engineer high-converting digital assets tailored specifically for regional compliance, language nuances, and target search volume.",
    cursiveText: "Explore Locations",
    locationsLabel: "ACTIVE REGIONAL LOCATIONS & STATE HUBS",
    countries: [
      {
        id: "USA",
        name: "United States",
        slug: "usa",
        pageSlug: "usa",
        tagline: "NORTH AMERICA HUB",
        subtitle: "48 States & Major Metros",
        description: "Delivering enterprise-grade web development, full-stack architecture, and local organic SEO campaigns across premier US markets.",
        image: "/country_usa.png",
        flag: "/flag_usa.png",
        buttonText: "EXPLORE USA LOCATIONS",
        states: [
          { name: "Texas", pageSlug: "usa/texas" },
          { name: "California", pageSlug: "usa/california" },
          { name: "Florida", pageSlug: "usa/florida" },
          { name: "New York", pageSlug: "usa/new-york" },
          { name: "Washington", pageSlug: "usa/washington" },
          { name: "Illinois", pageSlug: "usa/illinois" },
          { name: "Georgia", pageSlug: "usa/georgia" },
          { name: "Colorado", pageSlug: "usa/colorado" }
        ]
      },
      {
        id: "AU",
        name: "Australia",
        slug: "australia",
        pageSlug: "australia",
        tagline: "ASIA-PACIFIC REGION",
        subtitle: "Sydney, Melbourne & Brisbane",
        description: "Empowering Australian businesses with sub-second website speed, conversion rate optimization, and custom e-commerce web applications.",
        image: "/country_au.png",
        flag: "/flag_au.png",
        buttonText: "EXPLORE AUSTRALIA",
        states: [
          { name: "New South Wales", pageSlug: "australia/nsw" },
          { name: "Victoria", pageSlug: "australia/victoria" },
          { name: "Queensland", pageSlug: "australia/queensland" },
          { name: "Western Australia", pageSlug: "australia/wa" }
        ]
      },
      {
        id: "NZ",
        name: "New Zealand",
        slug: "new-zealand",
        pageSlug: "new-zealand",
        tagline: "OCEANIA EXPANSION",
        subtitle: "Auckland, Wellington & Christchurch",
        description: "High-impact digital design systems and growth marketing architecture built specifically for New Zealand's innovative business landscape.",
        image: "/country_nz.png",
        flag: "/flag_nz.png",
        buttonText: "EXPLORE NEW ZEALAND",
        states: [
          { name: "Auckland", pageSlug: "new-zealand/auckland" },
          { name: "Wellington", pageSlug: "new-zealand/wellington" },
          { name: "Canterbury", pageSlug: "new-zealand/canterbury" }
        ]
      }
    ]
  },
  ctaBanner: {
    eyebrow: "READY FOR LOCAL DOMINANCE?",
    titleIntro: "Scale Your Organic Revenue in Your ",
    titleWord1: "Target Market ",
    titleWord2: "Today?",
    description: "Schedule a free technical audit with our lead architect. We'll analyze your existing regional footprint and map out a concrete growth strategy.",
    ctaPrimaryText: "BOOK STRATEGY SESSION",
    ctaPrimaryHref: "/contact",
    ctaSecondaryText: "EXPLORE SHOWREEL",
    ctaSecondaryHref: "/gallery",
    portraitSrc: "/founder_portrait_nobg.png",
    portraitAlt: "Founder & Lead Architect"
  }
};

export default function LocationEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");
  const [availablePages, setAvailablePages] = useState<any[]>([]);

  // Fetch available CMS pages for dynamic dropdown selection
  useEffect(() => {
    fetch("/api/admin/pages")
      .then((res) => res.json())
      .then((pages) => {
        if (Array.isArray(pages)) {
          setAvailablePages(pages);
        }
      })
      .catch((err) => console.error("Failed to load CMS pages list:", err));
  }, []);

  // Ensure locationPage structure exists
  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || !data.locationPage) {
      setData((prev: any) => ({
        ...(prev || {}),
        locationPage: {
          ...DEFAULT_LOCATION_DATA,
          ...(prev?.locationPage || prev?.serviceArea || {})
        }
      }));
    }
  }, [data, setData]);

  if (!data || !data.locationPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" />
      </div>
    );
  }

  const loc = data.locationPage;

  const updateNested = (parent: string, field: string, value: any) => {
    setData((prev: any) => {
      const currentLoc = prev?.locationPage || loc;
      return {
        ...(prev || {}),
        locationPage: {
          ...currentLoc,
          [parent]: {
            ...(currentLoc[parent] || {}),
            [field]: value
          }
        }
      };
    });
  };

  // ── BRAND MARQUEE CRUD ──
  const logos = loc.brandsStrip?.logos || DEFAULT_LOCATION_DATA.brandsStrip.logos;

  const handleAddLogo = () => {
    const newLogos = [...logos, { name: "New Brand Platform", image: "" }];
    updateNested("brandsStrip", "logos", newLogos);
  };

  const handleUpdateLogo = (index: number, field: string, val: any) => {
    const updated = [...logos];
    const current = typeof updated[index] === "string" ? { name: updated[index], image: "" } : { ...(updated[index] || {}) };
    updated[index] = { ...current, [field]: val };
    updateNested("brandsStrip", "logos", updated);
  };

  const handleDeleteLogo = (index: number) => {
    const updated = logos.filter((_: any, idx: number) => idx !== index);
    updateNested("brandsStrip", "logos", updated);
  };

  const handleMoveLogo = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === logos.length - 1)) return;
    const target = direction === "up" ? index - 1 : index + 1;
    const updated = [...logos];
    const temp = updated[index];
    updated[index] = updated[target];
    updated[target] = temp;
    updateNested("brandsStrip", "logos", updated);
  };

  // ── COUNTRIES CRUD ──
  const rawCountries = loc.presence?.countries || DEFAULT_LOCATION_DATA.presence.countries;

  // Normalize legacy string states to objects if any
  const countries = rawCountries.map((c: any) => {
    let normalizedStates = c.states;
    if (Array.isArray(c.states) && typeof c.states[0] === "string") {
      normalizedStates = c.states.map((s: string) => ({
        name: s,
        pageSlug: `${c.slug || c.id?.toLowerCase() || "location"}/${s.toLowerCase().replace(/\s+/g, "-")}`
      }));
    } else if (typeof c.states === "string") {
      normalizedStates = c.states.split(",").map((s: string) => ({
        name: s.trim(),
        pageSlug: `${c.slug || "location"}/${s.trim().toLowerCase().replace(/\s+/g, "-")}`
      })).filter((s: any) => s.name);
    }
    return {
      ...c,
      states: Array.isArray(normalizedStates) ? normalizedStates : []
    };
  });

  const handleAddCountry = () => {
    const newCountry = {
      id: Date.now().toString(),
      name: "United States",
      slug: "usa",
      pageSlug: "usa",
      tagline: "REGIONAL HUB",
      subtitle: "Major Cities & Districts",
      description: "Localized design, architecture, and organic search growth campaigns.",
      image: "/country_usa.png",
      flag: "/flag_usa.png",
      buttonText: "EXPLORE LOCATION",
      states: [
        { name: "Texas", pageSlug: "usa/texas" }
      ]
    };
    updateNested("presence", "countries", [...countries, newCountry]);
  };

  const handleUpdateCountry = (index: number, field: string, value: any) => {
    const updated = [...countries];
    updated[index] = { ...updated[index], [field]: value };
    updateNested("presence", "countries", updated);
  };

  const handleDeleteCountry = (index: number) => {
    const updated = countries.filter((_: any, idx: number) => idx !== index);
    updateNested("presence", "countries", updated);
  };

  const handleMoveCountry = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === countries.length - 1)) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...countries];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateNested("presence", "countries", updated);
  };

  // ── STATE ITEM CRUD PER COUNTRY ──
  const handleAddStateToCountry = (countryIndex: number) => {
    const updated = [...countries];
    const country = updated[countryIndex];
    const currentStates = country.states || [];
    const newState = {
      name: "New State / City",
      pageSlug: country.slug ? `${country.slug}/new-location` : "new-location"
    };
    updated[countryIndex] = {
      ...country,
      states: [...currentStates, newState]
    };
    updateNested("presence", "countries", updated);
  };

  const handleUpdateStateInCountry = (countryIndex: number, stateIndex: number, field: string, value: string) => {
    const updated = [...countries];
    const country = updated[countryIndex];
    const states = [...(country.states || [])];
    states[stateIndex] = { ...states[stateIndex], [field]: value };
    updated[countryIndex] = { ...country, states };
    updateNested("presence", "countries", updated);
  };

  const handleDeleteStateFromCountry = (countryIndex: number, stateIndex: number) => {
    const updated = [...countries];
    const country = updated[countryIndex];
    const states = country.states.filter((_: any, idx: number) => idx !== stateIndex);
    updated[countryIndex] = { ...country, states };
    updateNested("presence", "countries", updated);
  };

  const tabs = [
    { id: "hero", label: "01. Hero Banner" },
    { id: "stats", label: "02. Stats Counters" },
    { id: "marquee", label: "03. Brand Marquee" },
    { id: "presence", label: "04. Countries & States" },
    { id: "cta", label: "05. Bottom CTA Banner" }
  ];

  return (
    <div className="bg-white max-w-3xl mx-auto pb-20">
      {/* WordPress-style Sticky Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-10 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
              onClick={() => setActiveTab(tab.id)}
              className={`px-1 py-1 transition-colors ${
                activeTab === tab.id
                  ? "text-[#1d2327] font-bold border-b-2 border-[#2271b1]"
                  : "text-[#2271b1] hover:text-[#135e96]"
              }`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="space-y-10"
        >

          {/* ── TAB 1: HERO BANNER ────────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Locations Hero Banner Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={loc.hero?.enabled !== false}
                  onChange={(v) => updateNested("hero", "enabled", v)}
                  label="Hero Banner"
                />
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Eyebrow Badge</label>
                  <input
                    type="text"
                    value={loc.hero?.eyebrow || ""}
                    onChange={(e) => updateNested("hero", "eyebrow", e.target.value)}
                    className={UI.input}
                    placeholder="OUR GLOBAL PRESENCE"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Headline Line 1 (Prefix)</label>
                    <input
                      type="text"
                      value={loc.hero?.titleIntro || ""}
                      onChange={(e) => updateNested("hero", "titleIntro", e.target.value)}
                      className={UI.input}
                      placeholder="Engineered for Growth Across "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Headline Highlight (Brush Stroke Accent)</label>
                    <input
                      type="text"
                      value={loc.hero?.titleHighlight || ""}
                      onChange={(e) => updateNested("hero", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold text-[#2271b1] bg-[#f0f6fb]"}
                      placeholder="Global Markets."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Subtitle Description</label>
                  <textarea
                    rows={3}
                    value={loc.hero?.description || ""}
                    onChange={(e) => updateNested("hero", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Empowering high-growth businesses and enterprise brands..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f1]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Primary Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Label</label>
                      <input
                        type="text"
                        value={loc.hero?.ctaPrimaryText || ""}
                        onChange={(e) => updateNested("hero", "ctaPrimaryText", e.target.value)}
                        className={UI.input}
                        placeholder="EXPLORE OUR WORK"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={loc.hero?.ctaPrimaryHref || ""}
                        onChange={(e) => updateNested("hero", "ctaPrimaryHref", e.target.value)}
                        className={UI.input}
                        placeholder="/gallery"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Secondary Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Label</label>
                      <input
                        type="text"
                        value={loc.hero?.ctaSecondaryText || ""}
                        onChange={(e) => updateNested("hero", "ctaSecondaryText", e.target.value)}
                        className={UI.input}
                        placeholder="GET FREE STRATEGY"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={loc.hero?.ctaSecondaryHref || ""}
                        onChange={(e) => updateNested("hero", "ctaSecondaryHref", e.target.value)}
                        className={UI.input}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f1]">
                  <ImageField
                    label="Hero Background Artwork (Light Mode)"
                    value={loc.hero?.bgLight || "/locationhero.png"}
                    onChange={(val) => updateNested("hero", "bgLight", val)}
                  />
                  <ImageField
                    label="Hero Background Artwork (Dark Mode)"
                    value={loc.hero?.bgDark || "/locationherodark.png"}
                    onChange={(val) => updateNested("hero", "bgDark", val)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: STATS COUNTERS ─────────────────────────────────────── */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Stats Counters Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying metric cards on the live page.</p>
                </div>
                <SectionToggle
                  enabled={loc.stats?.enabled !== false}
                  onChange={(v) => updateNested("stats", "enabled", v)}
                  label="Stats Counters"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* 1. Experience */}
                <div className={UI.card + " space-y-3"}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-blue-600" />
                      <h4 className="text-xs font-bold text-[#1d2327]">Card 1: Industry Experience</h4>
                    </div>
                  </div>

                  <IconSelector
                    label="Card Icon"
                    value={loc.stats?.experience?.icon || "Trophy"}
                    onChange={(val) =>
                      updateNested("stats", "experience", {
                        ...(loc.stats?.experience || {}),
                        icon: val
                      })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className={UI.label}>Metric Value</label>
                    <input
                      type="text"
                      value={loc.stats?.experience?.value || ""}
                      onChange={(e) =>
                        updateNested("stats", "experience", {
                          ...(loc.stats?.experience || {}),
                          value: e.target.value
                        })
                      }
                      className={UI.input + " font-black text-lg text-[#2271b1]"}
                      placeholder="10+"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Label Text</label>
                    <input
                      type="text"
                      value={loc.stats?.experience?.label || ""}
                      onChange={(e) =>
                        updateNested("stats", "experience", {
                          ...(loc.stats?.experience || {}),
                          label: e.target.value
                        })
                      }
                      className={UI.input}
                      placeholder="Years Industry Experience"
                    />
                  </div>
                </div>

                {/* 2. Countries */}
                <div className={UI.card + " space-y-3"}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-[#1d2327]">Card 2: Geographic Hubs</h4>
                    </div>
                  </div>

                  <IconSelector
                    label="Card Icon"
                    value={loc.stats?.countries?.icon || "MapPin"}
                    onChange={(val) =>
                      updateNested("stats", "countries", {
                        ...(loc.stats?.countries || {}),
                        icon: val
                      })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className={UI.label}>Metric Value</label>
                    <input
                      type="text"
                      value={loc.stats?.countries?.value || ""}
                      onChange={(e) =>
                        updateNested("stats", "countries", {
                          ...(loc.stats?.countries || {}),
                          value: e.target.value
                        })
                      }
                      className={UI.input + " font-black text-lg text-indigo-600"}
                      placeholder="15+"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Label Text</label>
                    <input
                      type="text"
                      value={loc.stats?.countries?.label || ""}
                      onChange={(e) =>
                        updateNested("stats", "countries", {
                          ...(loc.stats?.countries || {}),
                          label: e.target.value
                        })
                      }
                      className={UI.input}
                      placeholder="Active Geographic Hubs"
                    />
                  </div>
                </div>

                {/* 3. Clients */}
                <div className={UI.card + " space-y-3"}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      <h4 className="text-xs font-bold text-[#1d2327]">Card 3: Global Brands</h4>
                    </div>
                  </div>

                  <IconSelector
                    label="Card Icon"
                    value={loc.stats?.clients?.icon || "Users"}
                    onChange={(val) =>
                      updateNested("stats", "clients", {
                        ...(loc.stats?.clients || {}),
                        icon: val
                      })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className={UI.label}>Metric Value</label>
                    <input
                      type="text"
                      value={loc.stats?.clients?.value || ""}
                      onChange={(e) =>
                        updateNested("stats", "clients", {
                          ...(loc.stats?.clients || {}),
                          value: e.target.value
                        })
                      }
                      className={UI.input + " font-black text-lg text-purple-600"}
                      placeholder="500+"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Label Text</label>
                    <input
                      type="text"
                      value={loc.stats?.clients?.label || ""}
                      onChange={(e) =>
                        updateNested("stats", "clients", {
                          ...(loc.stats?.clients || {}),
                          label: e.target.value
                        })
                      }
                      className={UI.input}
                      placeholder="Global Brands Powered"
                    />
                  </div>
                </div>

                {/* 4. Satisfaction */}
                <div className={UI.card + " space-y-3"}>
                  <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                    <div className="flex items-center gap-2">
                      <Smile className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-xs font-bold text-[#1d2327]">Card 4: Client Satisfaction</h4>
                    </div>
                  </div>

                  <IconSelector
                    label="Card Icon"
                    value={loc.stats?.satisfaction?.icon || "Smile"}
                    onChange={(val) =>
                      updateNested("stats", "satisfaction", {
                        ...(loc.stats?.satisfaction || {}),
                        icon: val
                      })
                    }
                  />

                  <div className="space-y-1.5">
                    <label className={UI.label}>Metric Value</label>
                    <input
                      type="text"
                      value={loc.stats?.satisfaction?.value || ""}
                      onChange={(e) =>
                        updateNested("stats", "satisfaction", {
                          ...(loc.stats?.satisfaction || {}),
                          value: e.target.value
                        })
                      }
                      className={UI.input + " font-black text-lg text-emerald-600"}
                      placeholder="99.4%"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className={UI.label}>Label Text</label>
                    <input
                      type="text"
                      value={loc.stats?.satisfaction?.label || ""}
                      onChange={(e) =>
                        updateNested("stats", "satisfaction", {
                          ...(loc.stats?.satisfaction || {}),
                          label: e.target.value
                        })
                      }
                      className={UI.input}
                      placeholder="Client Satisfaction Rate"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: BRAND MARQUEE STRIP ────────────────────────────────── */}
          {activeTab === "marquee" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Brand Marquee Strip Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying the partner marquee on the live page.</p>
                </div>
                <SectionToggle
                  enabled={loc.brandsStrip?.enabled !== false}
                  onChange={(v) => updateNested("brandsStrip", "enabled", v)}
                  label="Brand Marquee"
                />
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Marquee Section Heading</label>
                  <input
                    type="text"
                    value={loc.brandsStrip?.heading || ""}
                    onChange={(e) => updateNested("brandsStrip", "heading", e.target.value)}
                    className={UI.input + " font-mono text-xs font-bold text-[#2271b1]"}
                    placeholder="TRUSTED AD PLATFORMS // CERTIFIED NETWORKS"
                  />
                </div>

                <div className="pt-4 border-t border-[#f0f0f1] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#50575e] uppercase tracking-wider">
                      Marquee Brand Items ({logos.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddLogo}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] text-white rounded text-xs font-bold hover:bg-[#135e96] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Brand Logo
                    </button>
                  </div>

                  <div className="space-y-4">
                    {logos.map((logo: any, idx: number) => {
                      const logoItem = typeof logo === "string" ? { name: logo, image: "" } : logo;
                      return (
                        <div key={idx} className="p-4 bg-[#f8f9fa] border border-[#dcdcde] rounded-[4px] space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-[#e5e5e5]">
                            <span className="text-xs font-mono font-bold text-[#50575e]">
                              Logo Item #{idx + 1}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleMoveLogo(idx, "up")}
                                disabled={idx === 0}
                                className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                                title="Move Up"
                              >
                                <MoveUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveLogo(idx, "down")}
                                disabled={idx === logos.length - 1}
                                className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                                title="Move Down"
                              >
                                <MoveDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteLogo(idx)}
                                className="p-1 text-red-600 hover:text-red-700 ml-1"
                                title="Delete Logo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className={UI.label}>Brand / Platform Name</label>
                              <input
                                type="text"
                                value={logoItem.name || ""}
                                onChange={(e) => handleUpdateLogo(idx, "name", e.target.value)}
                                className={UI.input}
                                placeholder="e.g. Google Ads, Meta, Stripe, Shopify"
                              />
                              <p className="text-[11px] text-[#646970]">
                                Enter platform name or brand title.
                              </p>
                            </div>

                            <div className="space-y-1.5">
                              <ImageField
                                label="Brand Logo Image (Optional)"
                                value={logoItem.image || ""}
                                onChange={(val) => handleUpdateLogo(idx, "image", val)}
                                description="Custom logo image. If left empty, matches default platform vector."
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: COUNTRIES & STATES ─────────────────────────────────── */}
          {activeTab === "presence" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Countries &amp; State Hubs Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying geographic hub directories on the live page.</p>
                </div>
                <SectionToggle
                  enabled={loc.presence?.enabled !== false}
                  onChange={(v) => updateNested("presence", "enabled", v)}
                  label="Countries & States"
                />
              </div>

              {/* Section Header Settings */}
              <div className={UI.card + " space-y-5"}>
                <h3 className="text-xs font-bold text-[#1d2327] uppercase tracking-wider border-b border-[#f0f0f1] pb-2">
                  Directory Section Header
                </h3>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Eyebrow</label>
                  <input
                    type="text"
                    value={loc.presence?.eyebrow || ""}
                    onChange={(e) => updateNested("presence", "eyebrow", e.target.value)}
                    className={UI.input}
                    placeholder="GLOBAL COVERAGE"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={loc.presence?.titleIntro || ""}
                      onChange={(e) => updateNested("presence", "titleIntro", e.target.value)}
                      className={UI.input}
                      placeholder="Serving High-Growth Brands Across "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight (Italic Serif)</label>
                    <input
                      type="text"
                      value={loc.presence?.titleHighlight || ""}
                      onChange={(e) => updateNested("presence", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold text-[#2271b1] bg-[#f0f6fb]"}
                      placeholder="3 Continents"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Cursive Arrow Text</label>
                  <input
                    type="text"
                    value={loc.presence?.cursiveText || ""}
                    onChange={(e) => updateNested("presence", "cursiveText", e.target.value)}
                    className={UI.input + " font-bold text-amber-600 bg-amber-50"}
                    placeholder="Explore Locations"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Description</label>
                  <textarea
                    rows={2}
                    value={loc.presence?.description || ""}
                    onChange={(e) => updateNested("presence", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Browse our localized service hubs..."
                  />
                </div>
              </div>

              {/* Countries List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#50575e] uppercase tracking-wider">
                    Country Spotlight Cards ({countries.length})
                  </span>
                  <button
                    type="button"
                    onClick={handleAddCountry}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] text-white rounded text-xs font-bold hover:bg-[#135e96] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Country Hub
                  </button>
                </div>

                {countries.map((country: any, index: number) => (
                  <div key={country.id || index} className={UI.card + " space-y-5 border-l-4 border-l-[#2271b1]"}>
                    <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f1]">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-[#f0f0f1] px-2 py-0.5 rounded text-[#1d2327]">
                          #{index + 1}
                        </span>
                        <span className="text-sm font-bold text-[#1d2327]">
                          {country.name || "Untitled Country"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveCountry(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveCountry(index, "down")}
                          disabled={index === countries.length - 1}
                          className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCountry(index)}
                          className="p-1 text-red-600 hover:text-red-700 ml-2"
                          title="Delete Country"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={UI.label}>Country Name</label>
                        <input
                          type="text"
                          value={country.name || ""}
                          onChange={(e) => handleUpdateCountry(index, "name", e.target.value)}
                          className={UI.input}
                          placeholder="e.g. United States"
                        />
                      </div>

                      {/* Select Linked Page from Dashboard */}
                      <div className="space-y-1.5">
                        <label className={UI.label}>Linked Country Page</label>
                        <select
                          value={country.pageSlug || country.slug || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            handleUpdateCountry(index, "pageSlug", val);
                            handleUpdateCountry(index, "slug", val);
                          }}
                          className={UI.input + " font-mono text-xs text-[#2271b1] bg-white"}
                        >
                          <option value="">-- Select Linked Page from Dashboard --</option>
                          {availablePages.map((p: any) => (
                            <option key={p._id} value={p.slug}>
                              /{p.slug} &nbsp; ({p.title})
                            </option>
                          ))}
                        </select>
                        <p className="text-[11px] text-[#646970]">
                          Clicking this country or its explore button will navigate directly to: <span className="font-mono text-[#2271b1]">/{country.pageSlug || country.slug || "..."}</span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={UI.label}>Tagline</label>
                        <input
                          type="text"
                          value={country.tagline || ""}
                          onChange={(e) => handleUpdateCountry(index, "tagline", e.target.value)}
                          className={UI.input}
                          placeholder="e.g. NORTH AMERICA HUB"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Badge Subtitle (e.g. 48 States &amp; Metros)</label>
                        <input
                          type="text"
                          value={country.subtitle || ""}
                          onChange={(e) => handleUpdateCountry(index, "subtitle", e.target.value)}
                          className={UI.input}
                          placeholder="e.g. 48 States & Major Metros"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className={UI.label}>Button Text</label>
                        <input
                          type="text"
                          value={country.buttonText || ""}
                          onChange={(e) => handleUpdateCountry(index, "buttonText", e.target.value)}
                          className={UI.input}
                          placeholder="e.g. EXPLORE USA LOCATIONS"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Country Description</label>
                        <textarea
                          rows={2}
                          value={country.description || ""}
                          onChange={(e) => handleUpdateCountry(index, "description", e.target.value)}
                          className={UI.input}
                          placeholder="Delivering enterprise-grade web development..."
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#f0f0f1]">
                      <ImageField
                        label="Country Cover Image"
                        value={country.image || "/country_usa.png"}
                        onChange={(val) => handleUpdateCountry(index, "image", val)}
                      />
                      <ImageField
                        label="Floating Flag Icon"
                        value={country.flag || "/flag_usa.png"}
                        onChange={(val) => handleUpdateCountry(index, "flag", val)}
                      />
                    </div>

                    {/* ── DEDICATED STATES / CITIES MANAGER ── */}
                    <div className="pt-4 border-t border-[#dcdcde] space-y-3 bg-[#fbfbfb] p-4 rounded-[4px] border">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-[#1d2327] uppercase tracking-wide">
                            States &amp; Regional Hubs ({country.states?.length || 0})
                          </h4>
                          <p className="text-[11px] text-[#646970]">
                            Add individual states or cities and connect each to its specific page.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddStateToCountry(index)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#2271b1] hover:text-white rounded text-xs font-bold transition-all shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Add State / City
                        </button>
                      </div>

                      <div className="space-y-2.5">
                        {(country.states || []).map((stateItem: any, sIdx: number) => (
                          <div key={sIdx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 bg-white border border-[#dcdcde] rounded-[3px] shadow-sm">
                            <div className="flex items-center gap-1.5 flex-1 min-w-[140px]">
                              <span className="text-[11px] font-mono text-[#8c8f94] font-bold">#{sIdx + 1}</span>
                              <input
                                type="text"
                                value={stateItem.name || ""}
                                onChange={(e) => handleUpdateStateInCountry(index, sIdx, "name", e.target.value)}
                                className="w-full bg-[#f6f7f7] border border-[#c3c4c7] px-2.5 py-1 text-xs font-bold text-[#1d2327] rounded outline-none focus:border-[#2271b1]"
                                placeholder="State / City Name (e.g. Texas, Lahore)"
                              />
                            </div>

                            <div className="flex items-center gap-2 flex-1">
                              <select
                                value={stateItem.pageSlug || ""}
                                onChange={(e) => handleUpdateStateInCountry(index, sIdx, "pageSlug", e.target.value)}
                                className="w-full bg-white border border-[#c3c4c7] px-2 py-1 text-[11px] font-mono text-[#2271b1] rounded outline-none focus:border-[#2271b1]"
                              >
                                <option value="">-- Select Target Page Slug --</option>
                                {availablePages.map((p: any) => (
                                  <option key={p._id} value={p.slug}>
                                    /{p.slug} &nbsp; ({p.title})
                                  </option>
                                ))}
                              </select>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteStateFromCountry(index, sIdx)}
                                className="p-1 text-red-600 hover:text-red-700 shrink-0"
                                title="Delete State"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        {(!country.states || country.states.length === 0) && (
                          <div className="text-center py-3 bg-white border border-dashed border-[#c3c4c7] rounded text-xs text-[#8c8f94]">
                            No states added yet. Click &quot;Add State / City&quot; above.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 5: BOTTOM SIGNATURE CTA BANNER ────────────────────────── */}
          {activeTab === "cta" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Bottom CTA Banner Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={loc.ctaBanner?.enabled !== false}
                  onChange={(v) => updateNested("ctaBanner", "enabled", v)}
                  label="CTA Banner"
                />
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Eyebrow Badge</label>
                  <input
                    type="text"
                    value={loc.ctaBanner?.eyebrow || ""}
                    onChange={(e) => updateNested("ctaBanner", "eyebrow", e.target.value)}
                    className={UI.input}
                    placeholder="READY FOR LOCAL DOMINANCE?"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={loc.ctaBanner?.titleIntro || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleIntro", e.target.value)}
                      className={UI.input}
                      placeholder="Scale Your Organic Revenue in Your "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Word 1</label>
                    <input
                      type="text"
                      value={loc.ctaBanner?.titleWord1 || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleWord1", e.target.value)}
                      className={UI.input + " font-bold"}
                      placeholder="Target Market "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Word 2 (Cursive Highlight)</label>
                    <input
                      type="text"
                      value={loc.ctaBanner?.titleWord2 || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleWord2", e.target.value)}
                      className={UI.input + " font-bold text-amber-600 bg-amber-50"}
                      placeholder="Today?"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={3}
                    value={loc.ctaBanner?.description || ""}
                    onChange={(e) => updateNested("ctaBanner", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Schedule a free technical audit with our lead architect..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f1]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Primary Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={loc.ctaBanner?.ctaPrimaryText || ""}
                        onChange={(e) => updateNested("ctaBanner", "ctaPrimaryText", e.target.value)}
                        className={UI.input}
                        placeholder="BOOK STRATEGY SESSION"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={loc.ctaBanner?.ctaPrimaryHref || ""}
                        onChange={(e) => updateNested("ctaBanner", "ctaPrimaryHref", e.target.value)}
                        className={UI.input}
                        placeholder="/contact"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Secondary Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={loc.ctaBanner?.ctaSecondaryText || ""}
                        onChange={(e) => updateNested("ctaBanner", "ctaSecondaryText", e.target.value)}
                        className={UI.input}
                        placeholder="EXPLORE SHOWREEL"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={loc.ctaBanner?.ctaSecondaryHref || ""}
                        onChange={(e) => updateNested("ctaBanner", "ctaSecondaryHref", e.target.value)}
                        className={UI.input}
                        placeholder="/gallery"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#f0f0f1]">
                  <ImageField
                    label="Portrait Image for Arch Graphic"
                    value={loc.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png"}
                    onChange={(val) => updateNested("ctaBanner", "portraitSrc", val)}
                    description="Portrait image with transparent background."
                  />
                </div>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
