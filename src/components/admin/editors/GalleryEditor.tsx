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
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";
import { resolveSelectedProjects, toProjectList } from "@/lib/galleryProjects";

const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { ssr: false });

// What a blank Portfolio page shows publicly (GalleryTemplate has the same fallbacks):
//  - hero / process / CTA banner: the texts below,
//  - project grid: EVERY project from Admin > Projects ("existing" mode with nothing selected). The template no longer
//    invents sample projects, so there are no demo cards here either - use "Custom Project Cards" for hand-made ones.
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
  projectMode: "existing", // "existing" | "custom"
  selectedProjects: [],
  projects: [],
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
    ctaPrimary: { label: "START YOUR PROJECT", href: "/contact-us" },
    ctaSecondary: { label: "GET FREE ESTIMATE", href: "/contact-us" },
    portraitSrc: "/founder_portrait_nobg.png",
    portraitAlt: "Founder & Creative Director"
  }
};

/**
 * "Select from Existing Projects" stores COPIES of catalog projects. If a project is later deleted (or renamed beyond
 * recognition) in Admin > Projects, the public page silently drops it - this tells the admin which selected entries no
 * longer exist and lets them clean the selection up (also refreshes the remaining copies from the live catalog).
 */
function StaleSelectionNotice({ selected, onCleanUp }: { selected: any[]; onCleanUp: (next: any[]) => void }) {
  const [catalog, setCatalog] = useState<any[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/content", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setCatalog(toProjectList(d?.portfolio?.projects));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!catalog || catalog.length === 0 || selected.length === 0) return null;
  const { resolved, stale } = resolveSelectedProjects(selected, catalog);
  if (stale.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-[12px] text-amber-900 space-y-2">
      <p className="font-bold">
        {stale.length} selected project{stale.length > 1 ? "s are" : " is"} no longer in Admin &rsaquo; Projects and will not be shown on the live page:
      </p>
      <ul className="list-disc pl-5">
        {stale.map((p: any, i: number) => (
          <li key={i}>{p.title || p.brand || p.name || "Untitled project"}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => onCleanUp(resolved)}
        className="px-3 py-1 bg-amber-600 text-white rounded text-[11px] font-bold hover:bg-amber-700 transition-colors"
      >
        Remove missing projects from selection
      </button>
    </div>
  );
}

export default function GalleryEditor({
  pageId,
  data,
  setData,
  seo,
  setSeo
}: {
  pageId: string;
  data: any;
  setData: (d: any) => void;
  seo?: any;
  setSeo?: (d: any) => void;
}) {
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
      return;
    }

    // Repair documents saved by the old editor: its "Projects Showcase" visibility toggle spread the projects ARRAY into an
    // object ({0:{...},1:{...},enabled:false}), which destroyed the list. Turn it back into an array and keep the
    // visibility flag under `portfolioGrid.enabled` (where the toggle writes now).
    const gp = data.galleryPage;
    if (gp.projects && !Array.isArray(gp.projects) && typeof gp.projects === "object") {
      setData((prev: any) => {
        const cur = prev?.galleryPage || gp;
        const hidden = cur.projects?.enabled === false;
        return {
          ...(prev || {}),
          galleryPage: {
            ...cur,
            projects: toProjectList(cur.projects),
            portfolioGrid: { ...(cur.portfolioGrid || {}), ...(hidden && cur.portfolioGrid?.enabled === undefined ? { enabled: false } : {}) }
          }
        };
      });
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

  // Projects CRUD. Every mutation is a functional update applied to the LATEST state (several rich-text fields can
  // fire onChange in the same tick; working from this render's snapshot would let one overwrite the other).
  const projects = toProjectList(gallery.projects);
  // Same rule as the template: only an explicit "existing" switches to catalog mode.
  const projectMode = gallery.projectMode === "existing" ? "existing" : "custom";
  const gridVisible = gallery.portfolioGrid?.enabled !== false && gallery.projects?.enabled !== false;

  const updateProjects = (mutate: (list: any[]) => any[]) => {
    setData((prev: any) => {
      const cur = prev?.galleryPage || gallery;
      return {
        ...(prev || {}),
        galleryPage: { ...cur, projects: mutate(toProjectList(cur.projects)) }
      };
    });
  };

  const handleAddProject = () => {
    // Blank starter card: the public card only shows the pieces that are filled in (no fake metric / tech pills / image).
    const newProject = {
      id: Date.now().toString(),
      badge: "",
      brand: "New Project",
      subtitle: "",
      image: "",
      tag: "",
      tech: "",
      link: ""
    };
    updateProjects((list) => [...list, newProject]);
  };

  const handleUpdateProject = (index: number, field: string, value: any) => {
    updateProjects((list) => list.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const handleDeleteProject = (index: number) => {
    updateProjects((list) => list.filter((_: any, idx: number) => idx !== index));
  };

  const handleMoveProject = (index: number, direction: "up" | "down") => {
    updateProjects((list) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= list.length) return list;
      const updated = [...list];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      return updated;
    });
  };

  // Process Steps CRUD (same fallback as the template: no saved steps -> the 4 defaults)
  const processSteps =
    Array.isArray(gallery.process?.steps) && gallery.process.steps.length > 0
      ? gallery.process.steps
      : DEFAULT_GALLERY_DATA.process.steps;

  const handleUpdateStep = (index: number, field: string, value: any) => {
    setData((prev: any) => {
      const cur = prev?.galleryPage || gallery;
      const base =
        Array.isArray(cur.process?.steps) && cur.process.steps.length > 0 ? cur.process.steps : DEFAULT_GALLERY_DATA.process.steps;
      const steps = base.map((st: any, i: number) => (i === index ? { ...st, [field]: value } : st));
      return {
        ...(prev || {}),
        galleryPage: { ...cur, process: { ...(cur.process || {}), steps } }
      };
    });
  };

  const tabs = [
    { id: "hero", label: "Portfolio Hero" },
    { id: "videoTestimonials", label: "Video Testimonials" },
    { id: "projects", label: "Project Showcase" },
    { id: "process", label: "Creative Process" },
    { id: "cta", label: "Bottom CTA Banner" },
    { id: "schema", label: "Schema Markup" }
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
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Portfolio Hero Banner Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={gallery.hero?.enabled !== false}
                  onChange={(v) => updateNested("hero", "enabled", v)}
                  label="Portfolio Hero"
                />
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
                  <RichTextEditor
                    content={gallery.hero?.subtitle || ""}
                    onChange={(val: string) => updateNested("hero", "subtitle", val)}
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
                <p className={UI.helpText}>
                  Links can be a page (<code>/contact-us</code>), a full URL, or an in-page anchor: <code>#projects</code> scrolls to
                  the project grid, <code>#contact</code> to the bottom banner. If that section is hidden, <code>#contact</code>{" "}
                  automatically goes to <code>/contact-us</code> and a <code>#projects</code> button is left out.
                </p>

                <div className="space-y-1.5 pt-3 border-t border-[#f0f0f1]">
                  <ImageField
                    label="Hero Background Graphic Artwork"
                    value={gallery.hero?.backgroundImage ?? "/portfolio_hero_bg.png"}
                    onChange={(val) => updateNested("hero", "backgroundImage", val)}
                    description="Full-bleed graphic overlay behind the navbar and hero text."
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB: VIDEO TESTIMONIALS ──────────────────────────────────── */}
          {activeTab === "videoTestimonials" && (
            <VideoTestimonialsEditor
              value={data.videoTestimonials}
              onChange={(next: any) =>
                setData((prev: any) => ({
                  ...(prev || {}),
                  videoTestimonials: next
                }))
              }
            />
          )}

          {/* ── TAB 2: PROJECTS SHOWCASE (DUAL SELECTION MODE) ───────────── */}
          {activeTab === "projects" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Project Showcase Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying projects grid on the live page.</p>
                </div>
                <SectionToggle
                  enabled={gridVisible}
                  // Stored at portfolioGrid.enabled - NOT on the projects value (spreading the projects array into an
                  // object here used to wipe the custom cards every time the toggle was clicked).
                  onChange={(v) => updateNested("portfolioGrid", "enabled", v)}
                  label="Projects Showcase"
                />
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
                      Pick projects from your Admin &rsaquo; Projects catalog. Nothing selected = show all of them.
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
                      Create, edit, and order custom project cards dedicated specifically to this page. No cards = show the whole catalog.
                    </p>
                  </button>
                </div>
              </div>

              {/* MODE A: Select from existing */}
              {projectMode === "existing" && (
                <div className="space-y-4">
                  <p className={UI.helpText}>
                    The projects below come from <a href="/admin/projects/" className="text-[#2271b1] underline">Admin &rsaquo; Projects</a>. Edits made
                    there show up here automatically; a project deleted there disappears from this page. The card shows the project&apos;s
                    category, first case-study stat, description, image, and location/year.
                  </p>
                  <StaleSelectionNotice
                    selected={toProjectList(gallery.selectedProjects)}
                    onCleanUp={(next) => updateGallery("selectedProjects", next)}
                  />
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

                  {projects.length === 0 && (
                    <p className={UI.helpText}>
                      No custom cards yet - the live page currently shows every project from Admin &rsaquo; Projects. Add a card to take over
                      the grid with your own.
                    </p>
                  )}

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
                            <label className={UI.label}>Growth Metric / Outcome Tag (optional)</label>
                            <input
                              type="text"
                              value={project.tag || ""}
                              onChange={(e) => handleUpdateProject(index, "tag", e.target.value)}
                              className={UI.input + " font-bold text-[#2271b1]"}
                              placeholder="e.g. +320% Traffic, 4.9x ROAS"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className={UI.label}>Tech Stack Tags (comma separated, optional)</label>
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
                          <label className={UI.label}>Card Link (optional)</label>
                          <input
                            type="text"
                            value={project.link || ""}
                            onChange={(e) => handleUpdateProject(index, "link", e.target.value)}
                            className={UI.input}
                            placeholder="e.g. /services/web-design or https://client-site.com"
                          />
                          <p className={UI.helpText}>Makes the whole card clickable. Leave empty for a plain card.</p>
                        </div>

                        <div className="space-y-1.5">
                          <label className={UI.label}>Subtitle / Summary Description</label>
                          <RichTextEditor
                            content={project.subtitle || ""}
                            onChange={(val: string) => handleUpdateProject(index, "subtitle", val)}
                            placeholder="Clean, modern and intuitive interface design..."
                          />
                        </div>

                        <div className="space-y-1.5">
                          <ImageField
                            label="Project Card Cover Image"
                            value={project.image || ""}
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
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Creative Process Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying the process framework on the live page.</p>
                </div>
                <SectionToggle
                  enabled={gallery.process?.enabled !== false}
                  onChange={(v) => updateNested("process", "enabled", v)}
                  label="Creative Process"
                />
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
                  <RichTextEditor
                    content={gallery.process?.subtitle || ""}
                    onChange={(val: string) => updateNested("process", "subtitle", val)}
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
                      <RichTextEditor
                        content={step.desc || ""}
                        onChange={(val: string) => handleUpdateStep(index, "desc", val)}
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
              <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                <div>
                  <h2 className={UI.sectionHeader}>Bottom CTA Banner Visibility</h2>
                  <p className={UI.helpText}>Enable or disable displaying this section on the live page.</p>
                </div>
                <SectionToggle
                  enabled={gallery.ctaBanner?.enabled !== false}
                  onChange={(v) => updateNested("ctaBanner", "enabled", v)}
                  label="CTA Banner"
                />
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
                  <RichTextEditor
                    content={gallery.ctaBanner?.description || ""}
                    onChange={(val: string) => updateNested("ctaBanner", "description", val)}
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
                    value={gallery.ctaBanner?.portraitSrc ?? "/founder_portrait_nobg.png"}
                    onChange={(val) => updateNested("ctaBanner", "portraitSrc", val)}
                    description="Portrait image with transparent background."
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "schema" && (
            <div className="space-y-4">
              <SchemaEditor
                value={seo?.schemaData || data.schemaMarkup || ""}
                onChange={(val) => {
                  // The page save (admin/pages/[id]) takes seo.schemaData FIRST and rewrites content.schemaMarkup from it,
                  // and the public route reads page.seo.schemaData first - so the page-level seo state must be updated
                  // too, or an edit made here is silently reverted on save. (No stray content.seo object any more.)
                  setData((prev: any) => ({ ...(prev || {}), schemaMarkup: val }));
                  setSeo?.((prev: any) => ({ ...(prev || {}), schemaData: val }));
                }}
                pageTitle="Portfolio Page"
              />
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
