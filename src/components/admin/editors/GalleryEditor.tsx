"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Loader2, Image as ImageIcon,
  Type, Settings, Star, Sparkles, Layers,
  MoveUp, MoveDown, CheckCircle2, List, Check
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
import IconSelector from "@/components/admin/IconSelector";
import ImageField from "@/components/admin/ImageField";
import { UI } from "./styles";

const DEFAULT_GALLERY_DATA = {
  hero: {
    badge: "OUR PORTFOLIO",
    titlePrefix: "Creative Work.",
    titleHighlight: "Real Results.",
    subtitle: "Explore our latest projects — beautifully designed, strategically built, and focused on growing brands online.",
    ctaPrimary: { label: "GET A FREE CONSULTATION", href: "#contact" },
    ctaSecondary: { label: "EXPLORE WORK", href: "#projects" },
    backgroundImage: "/portfolio_hero_bg.png"
  },
  projectMode: "custom", // "existing" | "custom"
  selectedProjects: [],
  projects: [
    {
      id: "1",
      badge: "Web Design",
      brand: "Moshin Designs – Creative Agency",
      subtitle: "Modern, responsive and high-performing website built for a leading agency.",
      image: "/portfolio_card_1.png",
      tag: "+320% Traffic",
      tech: ["Next.js 15", "TailwindCSS", "Framer Motion"],
      link: "/contact"
    },
    {
      id: "2",
      badge: "UI/UX Design",
      brand: "Fintech Dashboard UI",
      subtitle: "Clean, modern and intuitive interface design for financial services.",
      image: "/portfolio_card_2.png",
      tag: "4.9x ROAS",
      tech: ["Figma UI", "System Kit", "Dashboard"],
      link: "/contact"
    },
    {
      id: "3",
      badge: "Web Design",
      brand: "E-Commerce Store",
      subtitle: "Visually stunning and conversion-focused online store for a fashion brand.",
      image: "/portfolio_card_3.png",
      tag: "+185% Leads",
      tech: ["Shopify Pro", "React", "E-Commerce"],
      link: "/contact"
    },
    {
      id: "4",
      badge: "Logo Design",
      brand: "Brand Identity – Nexus Solutions",
      subtitle: "A timeless and professional logo design for a global tech company.",
      image: "/portfolio_card_4.png",
      tag: "100% Custom",
      tech: ["Branding", "Vector Art", "Brand Book"],
      link: "/contact"
    },
    {
      id: "5",
      badge: "Social Media",
      brand: "Digital Marketing Campaign",
      subtitle: "Creative social media visuals that build engagement and trust.",
      image: "/portfolio_card_5.png",
      tag: "+450% Reach",
      tech: ["Social Media", "Marketing", "3D Motion"],
      link: "/contact"
    },
    {
      id: "6",
      badge: "Web Design",
      brand: "Real Estate Website",
      subtitle: "Elegant and modern website for a real estate company.",
      image: "/portfolio_card_6.png",
      tag: "Top #1 Rank",
      tech: ["Next.js", "SEO Pro", "Real Estate"],
      link: "/contact"
    }
  ],
  process: {
    badge: "OUR CREATIVE PROCESS",
    titlePrefix: "From Concept to ",
    titleHighlight: "Impact",
    subtitle: "A proven 4-step framework engineered for maximum conversion and brand authority.",
    steps: [
      {
        step: "01",
        tag: "PHASE 01",
        title: "Discovery & Strategy",
        desc: "Deep research into brand goals, target demographics, and market positioning.",
        icon: "Lightbulb"
      },
      {
        step: "02",
        tag: "PHASE 02",
        title: "UI/UX Design System",
        desc: "Crafting wireframes, responsive layouts, and interactive design prototypes.",
        icon: "PenTool"
      },
      {
        step: "03",
        tag: "PHASE 03",
        title: "Full-Stack Build",
        desc: "Engineering high-speed, mobile-optimized, SEO-ready web architecture.",
        icon: "Code"
      },
      {
        step: "04",
        tag: "PHASE 04",
        title: "Launch & Growth",
        desc: "Flawless deployment, speed optimization, and automated conversion tracking.",
        icon: "Rocket"
      }
    ]
  },
  ctaBanner: {
    eyebrow: "LET'S BUILD SOMETHING GREAT",
    titleIntro: "Ready to Launch Your",
    titleHighlight: "Next Big Project",
    titleCursive: "Today?",
    description: "Let's turn your vision into a stunning digital reality. Get in touch for a custom strategy, competitive pricing, and fast execution.",
    ctaPrimary: { label: "START YOUR PROJECT", href: "/contact" },
    ctaSecondary: { label: "GET FREE ESTIMATE", href: "/contact" },
    portraitSrc: "/founder_portrait_nobg.png",
    portraitAlt: "Founder & Creative Director"
  }
};

export default function GalleryEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("hero");

  // Ensure galleryPage is properly structured
  useEffect(() => {
    if (!data || Object.keys(data).length === 0 || !data.galleryPage) {
      setData((prev: any) => ({
        ...(prev || {}),
        galleryPage: {
          ...DEFAULT_GALLERY_DATA,
          ...(prev?.galleryPage || {})
        }
      }));
    }
  }, [data, setData]);

  if (!data || !data.galleryPage) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" />
      </div>
    );
  }

  const gallery = data.galleryPage;

  const updateGallery = (field: string, value: any) => {
    setData((prev: any) => ({
      ...(prev || {}),
      galleryPage: {
        ...(prev?.galleryPage || gallery),
        [field]: value
      }
    }));
  };

  const updateNested = (parent: string, field: string, value: any) => {
    setData((prev: any) => {
      const currentGallery = prev?.galleryPage || gallery;
      return {
        ...(prev || {}),
        galleryPage: {
          ...currentGallery,
          [parent]: {
            ...(currentGallery[parent] || {}),
            [field]: value
          }
        }
      };
    });
  };

  // Projects CRUD
  const projects = gallery.projects || DEFAULT_GALLERY_DATA.projects;
  const projectMode = gallery.projectMode || "custom";

  const handleAddProject = () => {
    const newProject = {
      id: Date.now().toString(),
      badge: "Web Design",
      brand: "New Project Showcase",
      subtitle: "Strategic design and engineering built for measurable commercial impact.",
      image: "/portfolio_card_1.png",
      tag: "+200% ROI",
      tech: ["Next.js", "TailwindCSS"],
      link: "/contact"
    };
    updateGallery("projects", [...projects, newProject]);
  };

  const handleUpdateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    updateGallery("projects", updated);
  };

  const handleDeleteProject = (index: number) => {
    const updated = projects.filter((_: any, idx: number) => idx !== index);
    updateGallery("projects", updated);
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === projects.length - 1)) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    updateGallery("projects", updated);
  };

  // Process Steps CRUD
  const processSteps = gallery.process?.steps || DEFAULT_GALLERY_DATA.process.steps;

  const handleUpdateStep = (index: number, field: string, value: any) => {
    const updated = [...processSteps];
    updated[index] = { ...updated[index], [field]: value };
    updateNested("process", "steps", updated);
  };

  const tabs = [
    { id: "hero", label: "Gallery Hero" },
    { id: "projects", label: "Project Showcase" },
    { id: "process", label: "Creative Process" },
    { id: "cta", label: "Bottom CTA Banner" }
  ];

  return (
    <div className="bg-white max-w-3xl mx-auto pb-20">
      {/* WordPress-style Sticky Sub-tabs Header */}
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

          {/* ── TAB 1: HERO SECTION ──────────────────────────────────────── */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div>
                <h2 className={UI.sectionHeader}>Gallery Hero Banner</h2>
                <p className={UI.helpText}>Configure the top full-bleed intro hero section and headline accents.</p>
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Hero Badge Pill</label>
                  <input
                    type="text"
                    value={gallery.hero?.badge || ""}
                    onChange={(e) => updateNested("hero", "badge", e.target.value)}
                    className={UI.input}
                    placeholder="OUR PORTFOLIO"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Headline Line 1 (Prefix)</label>
                    <input
                      type="text"
                      value={gallery.hero?.titlePrefix || ""}
                      onChange={(e) => updateNested("hero", "titlePrefix", e.target.value)}
                      className={UI.input}
                      placeholder="Creative Work."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Headline Highlight (Brush Stroke Accent)</label>
                    <input
                      type="text"
                      value={gallery.hero?.titleHighlight || ""}
                      onChange={(e) => updateNested("hero", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold text-[#2271b1] bg-[#f0f6fb]"}
                      placeholder="Real Results."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Subtitle Description</label>
                  <textarea
                    rows={3}
                    value={gallery.hero?.subtitle || ""}
                    onChange={(e) => updateNested("hero", "subtitle", e.target.value)}
                    className={UI.input}
                    placeholder="Explore our latest projects — beautifully designed..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f1]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Primary Action Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={gallery.hero?.ctaPrimary?.label || ""}
                        onChange={(e) =>
                          updateNested("hero", "ctaPrimary", {
                            ...(gallery.hero?.ctaPrimary || {}),
                            label: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="GET A FREE CONSULTATION"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={gallery.hero?.ctaPrimary?.href || ""}
                        onChange={(e) =>
                          updateNested("hero", "ctaPrimary", {
                            ...(gallery.hero?.ctaPrimary || {}),
                            href: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="#contact"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Secondary Action Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={gallery.hero?.ctaSecondary?.label || ""}
                        onChange={(e) =>
                          updateNested("hero", "ctaSecondary", {
                            ...(gallery.hero?.ctaSecondary || {}),
                            label: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="EXPLORE WORK"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={gallery.hero?.ctaSecondary?.href || ""}
                        onChange={(e) =>
                          updateNested("hero", "ctaSecondary", {
                            ...(gallery.hero?.ctaSecondary || {}),
                            href: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="#projects"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#f0f0f1]">
                  <ImageField
                    label="Hero Background Graphic Artwork"
                    value={gallery.hero?.backgroundImage || "/portfolio_hero_bg.png"}
                    onChange={(val) => updateNested("hero", "backgroundImage", val)}
                    description="Full-bleed graphic overlay behind the navbar and hero text."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: PROJECTS SHOWCASE (DUAL SELECTION MODE) ───────────── */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div>
                <h2 className={UI.sectionHeader}>Project Showcase Grid</h2>
                <p className={UI.helpText}>Choose between selecting from your existing project catalog or adding custom projects.</p>
              </div>

              {/* Selection Mode Toggle */}
              <div className="bg-[#f0f6fb] border border-[#c5d9ed] p-4 rounded-xl space-y-3">
                <label className="text-xs font-bold text-[#1d2327] uppercase tracking-wider block">
                  Project Source Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateGallery("projectMode", "existing")}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      projectMode === "existing"
                        ? "bg-white border-[#2271b1] ring-2 ring-[#2271b1]/20 shadow-sm"
                        : "bg-white/60 border-[#c3c4c7] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1d2327]">1. Select from Existing Projects</span>
                      {projectMode === "existing" && <CheckCircle2 className="w-4 h-4 text-[#2271b1]" />}
                    </div>
                    <p className="text-[11px] text-[#50575e] mt-1">
                      Pick and choose specific items from your centralized portfolio catalog.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => updateGallery("projectMode", "custom")}
                    className={`p-3.5 rounded-lg border text-left transition-all ${
                      projectMode === "custom"
                        ? "bg-white border-[#2271b1] ring-2 ring-[#2271b1]/20 shadow-sm"
                        : "bg-white/60 border-[#c3c4c7] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1d2327]">2. Add &amp; Manage Custom Projects</span>
                      {projectMode === "custom" && <CheckCircle2 className="w-4 h-4 text-[#2271b1]" />}
                    </div>
                    <p className="text-[11px] text-[#50575e] mt-1">
                      Create, edit, and order custom project cards dedicated specifically to this page.
                    </p>
                  </button>
                </div>
              </div>

              {/* MODE A: Select from existing */}
              {projectMode === "existing" && (
                <div className="space-y-4">
                  <ContentSelector
                    type="projects"
                    label="Select Projects to Showcase"
                    selectedItems={gallery.selectedProjects || []}
                    onSelect={(items) => updateGallery("selectedProjects", items)}
                  />
                </div>
              )}

              {/* MODE B: Add new / Custom projects */}
              {projectMode === "custom" && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#50575e] uppercase tracking-wider">
                      Custom Project Cards ({projects.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleAddProject}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#2271b1] text-white rounded text-xs font-bold hover:bg-[#135e96] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add New Project
                    </button>
                  </div>

                  <div className="space-y-5">
                    {projects.map((project: any, index: number) => (
                      <div key={project.id || index} className={UI.card + " space-y-4 border-l-4 border-l-[#2271b1]"}>
                        <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold bg-[#f0f0f1] px-2 py-0.5 rounded text-[#1d2327]">
                              #{index + 1}
                            </span>
                            <span className="text-xs font-bold text-[#1d2327]">
                              {project.brand || "Untitled Project"}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleMoveProject(index, "up")}
                              disabled={index === 0}
                              className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                              title="Move Up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveProject(index, "down")}
                              disabled={index === projects.length - 1}
                              className="p-1 text-[#50575e] hover:text-[#1d2327] disabled:opacity-30"
                              title="Move Down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProject(index)}
                              className="p-1 text-red-600 hover:text-red-700 ml-2"
                              title="Delete Project"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className={UI.label}>Project Title / Brand</label>
                            <input
                              type="text"
                              value={project.brand || ""}
                              onChange={(e) => handleUpdateProject(index, "brand", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. Fintech Dashboard UI"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className={UI.label}>Category Badge</label>
                            <input
                              type="text"
                              value={project.badge || ""}
                              onChange={(e) => handleUpdateProject(index, "badge", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. Web Design, UI/UX Design"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className={UI.label}>Growth Metric / Outcome Tag</label>
                            <input
                              type="text"
                              value={project.tag || ""}
                              onChange={(e) => handleUpdateProject(index, "tag", e.target.value)}
                              className={UI.input + " font-bold text-[#2271b1]"}
                              placeholder="e.g. +320% Traffic, 4.9x ROAS"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className={UI.label}>Tech Stack Tags (Comma separated)</label>
                            <input
                              type="text"
                              value={Array.isArray(project.tech) ? project.tech.join(", ") : project.tech || ""}
                              onChange={(e) => handleUpdateProject(index, "tech", e.target.value)}
                              className={UI.input}
                              placeholder="e.g. Next.js 15, TailwindCSS, Framer Motion"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className={UI.label}>Subtitle / Summary Description</label>
                          <textarea
                            rows={2}
                            value={project.subtitle || ""}
                            onChange={(e) => handleUpdateProject(index, "subtitle", e.target.value)}
                            className={UI.input}
                            placeholder="Clean, modern and intuitive interface design..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <ImageField
                            label="Project Card Cover Image"
                            value={project.image || "/portfolio_card_1.png"}
                            onChange={(val) => handleUpdateProject(index, "image", val)}
                            description="Recommended resolution 1200x800."
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 3: CREATIVE PROCESS ──────────────────────────────────── */}
          {activeTab === "process" && (
            <div className="space-y-6">
              <div>
                <h2 className={UI.sectionHeader}>4-Step Creative Framework</h2>
                <p className={UI.helpText}>Configure the 4-phase creative methodology showcase section.</p>
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Section Badge</label>
                  <input
                    type="text"
                    value={gallery.process?.badge || ""}
                    onChange={(e) => updateNested("process", "badge", e.target.value)}
                    className={UI.input}
                    placeholder="OUR CREATIVE PROCESS"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={gallery.process?.titlePrefix || ""}
                      onChange={(e) => updateNested("process", "titlePrefix", e.target.value)}
                      className={UI.input}
                      placeholder="From Concept to "
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight (Cursive)</label>
                    <input
                      type="text"
                      value={gallery.process?.titleHighlight || ""}
                      onChange={(e) => updateNested("process", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold text-[#2271b1] bg-[#f0f6fb]"}
                      placeholder="Impact"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Section Subtitle</label>
                  <textarea
                    rows={2}
                    value={gallery.process?.subtitle || ""}
                    onChange={(e) => updateNested("process", "subtitle", e.target.value)}
                    className={UI.input}
                    placeholder="A proven 4-step framework engineered for maximum conversion..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-[#1d2327] uppercase tracking-wider">
                  4 Phase Step Cards
                </h3>

                {processSteps.map((step: any, index: number) => (
                  <div key={index} className={UI.card + " space-y-4 border-l-4 border-l-amber-500"}>
                    <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f1]">
                      <span className="text-xs font-mono font-bold text-[#1d2327]">
                        STEP {step.step || String(index + 1).padStart(2, "0")} — {step.tag || `PHASE 0${index + 1}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className={UI.label}>Step Number</label>
                        <input
                          type="text"
                          value={step.step || ""}
                          onChange={(e) => handleUpdateStep(index, "step", e.target.value)}
                          className={UI.input}
                          placeholder="01"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className={UI.label}>Phase Eyebrow Tag</label>
                        <input
                          type="text"
                          value={step.tag || ""}
                          onChange={(e) => handleUpdateStep(index, "tag", e.target.value)}
                          className={UI.input}
                          placeholder="PHASE 01"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <IconSelector
                          label="Step Icon"
                          value={step.icon || "Lightbulb"}
                          onChange={(val) => handleUpdateStep(index, "icon", val)}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className={UI.label}>Step Title</label>
                      <input
                        type="text"
                        value={step.title || ""}
                        onChange={(e) => handleUpdateStep(index, "title", e.target.value)}
                        className={UI.input + " font-bold"}
                        placeholder="e.g. Discovery & Strategy"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={UI.label}>Step Description</label>
                      <textarea
                        rows={2}
                        value={step.desc || ""}
                        onChange={(e) => handleUpdateStep(index, "desc", e.target.value)}
                        className={UI.input}
                        placeholder="Deep research into brand goals..."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 4: BOTTOM SIGNATURE CTA BANNER ────────────────────────── */}
          {activeTab === "cta" && (
            <div className="space-y-6">
              <div>
                <h2 className={UI.sectionHeader}>Bottom Signature CTA Banner</h2>
                <p className={UI.helpText}>Configure the bottom high-converting signature banner.</p>
              </div>

              <div className={UI.card + " space-y-5"}>
                <div className="space-y-1.5">
                  <label className={UI.label}>Eyebrow Badge</label>
                  <input
                    type="text"
                    value={gallery.ctaBanner?.eyebrow || ""}
                    onChange={(e) => updateNested("ctaBanner", "eyebrow", e.target.value)}
                    className={UI.input}
                    placeholder="LET'S BUILD SOMETHING GREAT"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Intro</label>
                    <input
                      type="text"
                      value={gallery.ctaBanner?.titleIntro || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleIntro", e.target.value)}
                      className={UI.input}
                      placeholder="Ready to Launch Your"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Title Highlight</label>
                    <input
                      type="text"
                      value={gallery.ctaBanner?.titleHighlight || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleHighlight", e.target.value)}
                      className={UI.input + " font-bold"}
                      placeholder="Next Big Project"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={UI.label}>Cursive Accent</label>
                    <input
                      type="text"
                      value={gallery.ctaBanner?.titleCursive || ""}
                      onChange={(e) => updateNested("ctaBanner", "titleCursive", e.target.value)}
                      className={UI.input + " font-bold text-amber-600 bg-amber-50"}
                      placeholder="Today?"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className={UI.label}>Description</label>
                  <textarea
                    rows={3}
                    value={gallery.ctaBanner?.description || ""}
                    onChange={(e) => updateNested("ctaBanner", "description", e.target.value)}
                    className={UI.input}
                    placeholder="Let's turn your vision into a stunning digital reality..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#f0f0f1]">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#1d2327]">Primary Button</h4>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Text</label>
                      <input
                        type="text"
                        value={gallery.ctaBanner?.ctaPrimary?.label || ""}
                        onChange={(e) =>
                          updateNested("ctaBanner", "ctaPrimary", {
                            ...(gallery.ctaBanner?.ctaPrimary || {}),
                            label: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="START YOUR PROJECT"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={gallery.ctaBanner?.ctaPrimary?.href || ""}
                        onChange={(e) =>
                          updateNested("ctaBanner", "ctaPrimary", {
                            ...(gallery.ctaBanner?.ctaPrimary || {}),
                            href: e.target.value
                          })
                        }
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
                        value={gallery.ctaBanner?.ctaSecondary?.label || ""}
                        onChange={(e) =>
                          updateNested("ctaBanner", "ctaSecondary", {
                            ...(gallery.ctaBanner?.ctaSecondary || {}),
                            label: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="GET FREE ESTIMATE"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={UI.label}>Button Link</label>
                      <input
                        type="text"
                        value={gallery.ctaBanner?.ctaSecondary?.href || ""}
                        onChange={(e) =>
                          updateNested("ctaBanner", "ctaSecondary", {
                            ...(gallery.ctaBanner?.ctaSecondary || {}),
                            href: e.target.value
                          })
                        }
                        className={UI.input}
                        placeholder="/contact"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-3 border-t border-[#f0f0f1]">
                  <ImageField
                    label="Portrait Image for Arch Graphic"
                    value={gallery.ctaBanner?.portraitSrc || "/founder_portrait_nobg.png"}
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
