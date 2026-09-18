"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ChevronRight, ChevronDown, Loader2, Search, Trash2, X, ExternalLink,
  Edit3, Check, Copy, MoreHorizontal, Info, Globe, MapPin, Layers, CornerDownRight,
  FolderTree, Eye, EyeOff, FileText, CheckCircle2
} from "lucide-react";

export type DisplayRow = {
  page: any;
  depth: number;
  parentTitle?: string;
  parentSlug?: string;
  childCount: number;
  directChildCount: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  tier: "root" | "child" | "subchild";
};

/**
 * Builds a hierarchical WordPress-style display list.
 * Groups children directly under their parents, sorted alphabetically.
 * Resolves parents via:
 * 1. content.parentLocationId (normalized string ID)
 * 2. Multi-segment slug path fallback (e.g. usa/texas/fort-worth -> usa/texas -> usa)
 */
function buildDisplayRows(
  list: any[],
  allPagesLookup: Map<string, any>,
  collapsedIds: Set<string>,
  isHierarchyView: boolean = true,
  isSearching: boolean = false
): DisplayRow[] {
  if (!isHierarchyView) {
    // Flat view: simply return depth 0 for all items
    return list.map((page) => ({
      page,
      depth: 0,
      childCount: 0,
      directChildCount: 0,
      hasChildren: false,
      isCollapsed: false,
      tier: "root"
    }));
  }

  const byId = new Map<string, any>();
  const bySlug = new Map<string, any>();

  // Register all pages in lookup
  list.forEach((p) => {
    byId.set(String(p._id), p);
    if (p.slug) bySlug.set(p.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, ""), p);
  });

  const childrenOf = new Map<string, any[]>();
  const parentOf = new Map<string, any>();
  const childIds = new Set<string>();

  // Resolve parent for each page
  list.forEach((p) => {
    const pId = String(p._id);
    let resolvedParent: any = null;

    // 1. By parentLocationId
    const parentLocId = p.content?.parentLocationId ? String(p.content.parentLocationId) : null;
    if (parentLocId && parentLocId !== pId) {
      if (byId.has(parentLocId)) {
        resolvedParent = byId.get(parentLocId);
      } else if (allPagesLookup.has(parentLocId)) {
        resolvedParent = allPagesLookup.get(parentLocId);
      }
    }

    // 2. Slug-based fallback
    if (!resolvedParent && p.slug && p.slug.includes("/")) {
      const parts = p.slug.split("/").filter(Boolean);
      if (parts.length > 1) {
        const parentSlug = parts.slice(0, -1).join("/").toLowerCase();
        if (bySlug.has(parentSlug)) {
          resolvedParent = bySlug.get(parentSlug);
        } else {
          // Check in global lookup
          for (const [_, gp] of allPagesLookup) {
            if (gp.slug && gp.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, "") === parentSlug) {
              resolvedParent = gp;
              break;
            }
          }
        }
      }
    }

    if (resolvedParent && String(resolvedParent._id) !== pId) {
      const parentKey = String(resolvedParent._id);
      if (!childrenOf.has(parentKey)) childrenOf.set(parentKey, []);
      childrenOf.get(parentKey)!.push(p);
      parentOf.set(pId, resolvedParent);
      childIds.add(pId);
    }
  });

  // Sort children alphabetically under each parent
  for (const [_, childList] of childrenOf) {
    childList.sort((a, b) => (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" }));
  }

  // Count total descendants recursively
  const countDescendants = (pageId: string): number => {
    const directChildren = childrenOf.get(pageId) || [];
    let total = directChildren.length;
    for (const ch of directChildren) {
      total += countDescendants(String(ch._id));
    }
    return total;
  };

  const rows: DisplayRow[] = [];
  const seen = new Set<string>();

  const appendPageAndChildren = (page: any, depth: number, parent?: any) => {
    const pId = String(page._id);
    if (seen.has(pId)) return; // prevent cyclical loops
    seen.add(pId);

    const directChildren = childrenOf.get(pId) || [];
    const directChildCount = directChildren.length;
    const totalChildCount = countDescendants(pId);
    const hasChildren = directChildCount > 0;
    const isCollapsed = !isSearching && collapsedIds.has(pId);

    const tier: "root" | "child" | "subchild" = depth === 0 ? "root" : depth === 1 ? "child" : "subchild";

    rows.push({
      page,
      depth,
      parentTitle: parent?.title,
      parentSlug: parent?.slug,
      childCount: totalChildCount,
      directChildCount,
      hasChildren,
      isCollapsed,
      tier
    });

    // If not collapsed (or if searching), recurse into children
    if (!isCollapsed || isSearching) {
      directChildren.forEach((child) => {
        appendPageAndChildren(child, depth + 1, page);
      });
    }
  };

  // Identify roots (pages that are not children of any active page in this list)
  const roots: any[] = [];
  list.forEach((p) => {
    if (!childIds.has(String(p._id))) {
      roots.push(p);
    }
  });

  // Sort roots: Location parents (country) first, then other roots alphabetically
  roots.sort((a, b) => {
    const isCountryA = a.template === "country";
    const isCountryB = b.template === "country";
    if (isCountryA && !isCountryB) return -1;
    if (!isCountryA && isCountryB) return 1;

    const isLocA = ["location", "service-area"].includes(a.template);
    const isLocB = ["location", "service-area"].includes(b.template);
    if (isLocA && !isLocB) return -1;
    if (!isLocA && isLocB) return 1;

    return (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" });
  });

  roots.forEach((root) => appendPageAndChildren(root, 0));

  // Guard: if any pages were not visited (e.g. circular parent links), append them at root
  list.forEach((p) => {
    if (!seen.has(String(p._id))) {
      appendPageAndChildren(p, 0);
    }
  });

  return rows;
}

export default function PagesDashboard() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState("all");
  const [bulkAction, setBulkAction] = useState("");
  const [editingPage, setEditingPage] = useState<any>(null);
  const [viewMode, setViewMode] = useState<"tree" | "flat">("tree");
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Page Form State
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    template: "home",
    status: "published",
    parentLocationId: "",
    parentLocationSlug: "",
    selectedCountrySlug: "usa",
    selectedStateSlug: ""
  });

  const BASE_URL = "https://mohsindesigns.com";

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/admin/pages?t=${Date.now()}`);
      const data = await res.json();
      setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setLoading(false);
    }
  };

  // Quick lookups
  const allPagesLookup = useMemo(() => {
    const map = new Map<string, any>();
    pages.forEach((p) => map.set(String(p._id), p));
    return map;
  }, [pages]);

  const countryPages = useMemo(
    () => pages.filter((p) => p.template === "country" && !p.isTrashed),
    [pages]
  );

  const statePages = useMemo(
    () => pages.filter((p) => p.template === "state" && !p.isTrashed),
    [pages]
  );

  // Available states for selected country in Add Modal
  const availableStatesForCountry = useMemo(() => {
    const cSlug = newPage.selectedCountrySlug || "usa";
    return statePages.filter((s) => {
      if (s.slug.startsWith(`${cSlug}/`)) return true;
      if (s.content?.countrySlug === cSlug) return true;
      if (cSlug === "usa" && !s.slug.includes("/")) return true;
      return false;
    });
  }, [statePages, newPage.selectedCountrySlug]);

  const handleCopyUrl = (url: string, slug: string) => {
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setCollapsedIds(new Set());
  };

  const collapseAll = () => {
    const parentIds = new Set<string>();
    pages.forEach((p) => {
      if (p.template === "country" || p.template === "state") {
        parentIds.add(String(p._id));
      }
    });
    setCollapsedIds(parentIds);
  };

  const handleCreatePage = async () => {
    if (!newPage.title || !newPage.slug) {
      return alert("Title and Slug are required.");
    }

    try {
      let finalSlug = newPage.slug.trim().toLowerCase().replace(/^\/+|\/+$/g, "");
      const contentPayload: any = {};

      if (newPage.template === "city") {
        const countryDoc = countryPages.find((c) => c.slug === newPage.selectedCountrySlug) || countryPages[0];
        const stateDoc = statePages.find((s) => s.slug === newPage.selectedStateSlug || String(s._id) === newPage.parentLocationId);

        const countrySlug = newPage.selectedCountrySlug || "usa";
        const stateSegment = (stateDoc?.slug || newPage.selectedStateSlug || "").split("/").pop() || "";
        const citySegment = finalSlug.split("/").pop() || "";

        finalSlug = `${countrySlug}/${stateSegment}/${citySegment}`;

        contentPayload.countrySlug = countrySlug;
        contentPayload.country = countryDoc?.title || "United States";
        contentPayload.stateSlug = stateSegment;
        contentPayload.state = stateDoc?.title || stateSegment;
        contentPayload.citySlug = citySegment;
        contentPayload.city = newPage.title;
        contentPayload.parentLocationId = stateDoc?._id || newPage.parentLocationId;
        contentPayload.parentLocationSlug = stateDoc?.slug || `${countrySlug}/${stateSegment}`;
      } else if (newPage.template === "state") {
        const countryDoc = countryPages.find((c) => c.slug === newPage.selectedCountrySlug) || countryPages[0];
        const countrySlug = newPage.selectedCountrySlug || "usa";
        const stateSegment = finalSlug.split("/").pop() || "";

        finalSlug = `${countrySlug}/${stateSegment}`;

        contentPayload.countrySlug = countrySlug;
        contentPayload.country = countryDoc?.title || "United States";
        contentPayload.stateSlug = stateSegment;
        contentPayload.state = newPage.title;
        contentPayload.parentLocationId = countryDoc?._id;
        contentPayload.parentLocationSlug = countrySlug;
      }

      const canonicalUrl = `${BASE_URL}/${finalSlug}/`;

      const payload = {
        title: newPage.title,
        slug: finalSlug,
        template: newPage.template,
        status: newPage.status,
        content: contentPayload,
        seo: {
          canonicalUrl
        }
      };

      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        window.location.href = `/admin/pages/${created._id}`;
      } else {
        const error = await res.json().catch(() => ({}));
        alert("Failed to create page: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert("Failed to create page.");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (!action || selectedIds.length === 0) return;

    if (action === "delete") {
      if (!confirm(`Permanently delete ${selectedIds.length} pages? This cannot be undone.`)) return;
      setActionLoading(true);
      try {
        const res = await fetch("/api/admin/pages", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: selectedIds })
        });
        if (res.ok) {
          setSelectedIds([]);
          fetchPages();
        }
      } catch (err) {
        alert("Bulk delete failed.");
      } finally {
        setActionLoading(false);
      }
    }

    if (action === "trash" || action === "restore") {
      setActionLoading(true);
      try {
        const res = await fetch("/api/admin/pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, ids: selectedIds })
        });
        if (res.ok) {
          setSelectedIds([]);
          fetchPages();
        }
      } catch (err) {
        alert(`Bulk ${action} failed.`);
      } finally {
        setActionLoading(false);
      }
    }

    if (action === "publish" || action === "draft") {
      const status = action === "publish" ? "published" : "draft";
      setActionLoading(true);
      try {
        const res = await fetch("/api/admin/pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "status", ids: selectedIds, status })
        });
        if (res.ok) {
          setSelectedIds([]);
          fetchPages();
        }
      } catch (err) {
        alert("Bulk status update failed.");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleIndividualAction = async (e: React.MouseEvent, action: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === "trash" || action === "restore") {
      try {
        const res = await fetch(`/api/admin/pages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTrashed: action === "trash" })
        });
        if (res.ok) fetchPages();
        else {
          const errData = await res.json();
          alert(`${action === "trash" ? "Trash" : "Restore"} failed: ${errData.error || "Unknown error"}`);
        }
      } catch (err) {
        alert(`${action === "trash" ? "Trash" : "Restore"} failed.`);
      }
    }

    if (action === "delete") {
      if (!confirm("Permanently delete this page?")) return;
      try {
        const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
        if (res.ok) fetchPages();
      } catch (err) {
        alert("Delete failed.");
      }
    }

    if (action === "duplicate") {
      try {
        const res = await fetch("/api/admin/pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "duplicate", ids: [id] })
        });
        if (res.ok) fetchPages();
        else {
          const error = await res.json().catch(() => ({}));
          alert("Duplication failed: " + (error.error || "Unknown error"));
        }
      } catch (err) {
        alert("Duplication failed.");
      }
    }

    if (action === "status") {
      const page = pages.find((p) => p._id === id);
      const newStatus = page.status === "published" ? "draft" : "published";
      try {
        const res = await fetch(`/api/admin/pages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) fetchPages();
      } catch (err) {
        alert("Status update failed.");
      }
    }
  };

  const handleQuickEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/pages/${editingPage._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingPage.title,
          slug: editingPage.slug,
          status: editingPage.status,
          template: editingPage.template
        })
      });
      if (res.ok) {
        setEditingPage(null);
        fetchPages();
      } else {
        const error = await res.json();
        alert("Update failed: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert("Update failed.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPages.length) setSelectedIds([]);
    else setSelectedIds(filteredPages.map((p) => p._id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Filter pages according to active tab filter and search
  const filteredPages = useMemo(() => {
    return pages.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase()) ||
        p.template.toLowerCase().includes(search.toLowerCase());

      const isTrashed = !!p.isTrashed;

      if (filter === "trash") return matchesSearch && isTrashed;
      if (isTrashed) return false;

      if (filter === "all") return matchesSearch;
      if (filter === "locations") {
        return matchesSearch && ["country", "state", "city", "location", "service-area"].includes(p.template);
      }
      if (filter === "standard") {
        return matchesSearch && !["country", "state", "city", "location", "service-area"].includes(p.template);
      }
      return matchesSearch && p.status === filter;
    });
  }, [pages, search, filter]);

  // Display rows with WordPress tree structure
  const displayRows = useMemo(() => {
    return buildDisplayRows(
      filteredPages,
      allPagesLookup,
      collapsedIds,
      viewMode === "tree",
      search.trim().length > 0
    );
  }, [filteredPages, allPagesLookup, collapsedIds, viewMode, search]);

  // Quick stats
  const stats = useMemo(() => {
    const active = pages.filter((p) => !p.isTrashed);
    const locations = active.filter((p) => ["country", "state", "city", "location", "service-area"].includes(p.template));
    const standard = active.filter((p) => !["country", "state", "city", "location", "service-area"].includes(p.template));
    const published = active.filter((p) => p.status === "published");
    const drafts = active.filter((p) => p.status === "draft");
    const trash = pages.filter((p) => p.isTrashed);
    return {
      all: active.length,
      locations: locations.length,
      standard: standard.length,
      published: published.length,
      drafts: drafts.length,
      trash: trash.length
    };
  }, [pages]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-12 font-sans">
      {/* WordPress Header Area */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-3">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Pages</h1>
          <button
            onClick={() => {
              setNewPage({
                title: "",
                slug: "",
                template: "home",
                status: "published",
                parentLocationId: "",
                parentLocationSlug: "",
                selectedCountrySlug: "usa",
                selectedStateSlug: ""
              });
              setShowAddModal(true);
            }}
            className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f0f6fb] hover:text-[#135e96] hover:border-[#135e96] px-2.5 py-1 text-[13px] font-medium rounded-[3px] transition-colors shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> Add New Page
          </button>
        </div>

        {/* View Switcher & Expand/Collapse Controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-[3px] border border-[#c3c4c7] bg-white p-0.5 shadow-sm text-[12px]">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                viewMode === "tree"
                  ? "bg-[#2271b1] text-white"
                  : "text-[#50575e] hover:text-[#1d2327] hover:bg-[#f0f0f1]"
              }`}
              title="WordPress Menu / Parent-Child Hierarchy View"
            >
              <FolderTree className="w-3.5 h-3.5" />
              Hierarchy Tree
            </button>
            <button
              onClick={() => setViewMode("flat")}
              className={`px-2.5 py-1 rounded-[2px] font-medium transition-colors inline-flex items-center gap-1.5 ${
                viewMode === "flat"
                  ? "bg-[#2271b1] text-white"
                  : "text-[#50575e] hover:text-[#1d2327] hover:bg-[#f0f0f1]"
              }`}
              title="Flat Chronological View"
            >
              <Layers className="w-3.5 h-3.5" />
              Flat View
            </button>
          </div>

          {viewMode === "tree" && (
            <div className="inline-flex gap-1 text-[12px]">
              <button
                onClick={expandAll}
                className="bg-white border border-[#c3c4c7] hover:border-[#8c8f94] text-[#2c3338] px-2 py-1 rounded-[3px] hover:bg-[#f6f7f7] transition-colors"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="bg-white border border-[#c3c4c7] hover:border-[#8c8f94] text-[#2c3338] px-2 py-1 rounded-[3px] hover:bg-[#f6f7f7] transition-colors"
              >
                Collapse All
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Links Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-[13px]">
        <button
          onClick={() => setFilter("all")}
          className={`${filter === "all" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
        >
          All <span className="text-[#646970] font-normal">({stats.all})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button
          onClick={() => setFilter("locations")}
          className={`${filter === "locations" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
        >
          Locations Hierarchy <span className="text-[#646970] font-normal">({stats.locations})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button
          onClick={() => setFilter("standard")}
          className={`${filter === "standard" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
        >
          Standard Pages <span className="text-[#646970] font-normal">({stats.standard})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button
          onClick={() => setFilter("published")}
          className={`${filter === "published" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
        >
          Published <span className="text-[#646970] font-normal">({stats.published})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button
          onClick={() => setFilter("draft")}
          className={`${filter === "draft" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
        >
          Drafts <span className="text-[#646970] font-normal">({stats.drafts})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button
          onClick={() => setFilter("trash")}
          className={`${filter === "trash" ? "text-black font-bold" : "text-[#d63638] underline decoration-transparent hover:decoration-current"}`}
        >
          Trash <span className="text-[#646970] font-normal">({stats.trash})</span>
        </button>
      </div>

      {/* Top Bar: Bulk Actions & Search */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            className="border border-[#8c8f94] bg-white text-[#2c3338] px-2.5 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
          >
            <option value="">Bulk actions</option>
            {filter === "trash" ? (
              <>
                <option value="restore">Restore</option>
                <option value="delete">Delete Permanently</option>
              </>
            ) : (
              <>
                <option value="publish">Mark as Published</option>
                <option value="draft">Mark as Draft</option>
                <option value="trash">Move to Trash</option>
              </>
            )}
          </select>
          <button
            onClick={() => {
              handleBulkAction(bulkAction);
              setBulkAction("");
            }}
            disabled={actionLoading || !bulkAction || selectedIds.length === 0}
            className="bg-white border border-[#8c8f94] disabled:opacity-50 text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors"
          >
            {actionLoading ? "Applying..." : "Apply"}
          </button>
          {selectedIds.length > 0 && (
            <span className="text-[12px] text-[#646970]">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, slug, or template..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] w-64 md:w-80 shadow-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <span className="text-[13px] text-[#50575e]">
            {filteredPages.length} {filteredPages.length === 1 ? "item" : "items"}
          </span>
        </div>
      </div>

      {/* WordPress-Style Hierarchy Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#c3c4c7] text-[#1d2327] bg-[#fdfdfd]">
              <th className="w-9 py-2.5 px-3">
                <input
                  type="checkbox"
                  checked={filteredPages.length > 0 && selectedIds.length === filteredPages.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                />
              </th>
              <th className="py-2.5 px-3 text-[14px] font-semibold text-[#1d2327]">
                Title & Hierarchy
              </th>
              <th className="py-2.5 px-3 text-[13px] font-semibold text-[#1d2327] w-48">
                Hierarchy Tier
              </th>
              <th className="py-2.5 px-3 text-[13px] font-semibold text-[#1d2327] w-36">
                Template
              </th>
              <th className="py-2.5 px-3 text-[13px] font-semibold text-[#1d2327] w-28">
                Status
              </th>
              <th className="py-2.5 px-3 text-[13px] font-semibold text-[#1d2327] w-32">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#2c3338] divide-y divide-[#f0f0f1]">
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 px-4 text-center text-[#50575e]">
                  No pages found matching your filters.
                </td>
              </tr>
            ) : (
              displayRows.map(({ page, depth, parentTitle, childCount, directChildCount, hasChildren, isCollapsed, tier }, idx) => {
                const isSelected = selectedIds.includes(page._id);
                const canonicalPath = `/${page.slug}/`;

                // Indentation styling based on depth
                const indentPadding =
                  depth === 0 ? "12px" : depth === 1 ? "36px" : depth === 2 ? "64px" : `${depth * 28 + 12}px`;

                return (
                  <tr
                    key={page._id}
                    className={`group transition-colors ${
                      isSelected
                        ? "bg-[#edf5fa]"
                        : depth === 0
                        ? "bg-[#ffffff] hover:bg-[#f6f7f7]"
                        : depth === 1
                        ? "bg-[#fafafa] hover:bg-[#f0f6fb]"
                        : "bg-[#fcfcfc] hover:bg-[#f0f6fb]"
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(page._id)}
                        className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1] mt-0.5"
                      />
                    </td>

                    {/* Title with WordPress Em-Dash & Hierarchy Visualization */}
                    <td className="py-3 px-3 align-top" style={{ paddingLeft: indentPadding }}>
                      <div className="flex items-start gap-1.5 flex-wrap">
                        {/* Tree Branch Markers & WordPress Em-Dash */}
                        {depth === 1 && (
                          <span className="text-[#8c8f94] font-semibold select-none inline-flex items-center gap-1 font-mono text-[13px]">
                            <span>├─</span>
                            <span className="text-[#a7aaad] font-bold">—</span>
                          </span>
                        )}
                        {depth >= 2 && (
                          <span className="text-[#8c8f94] font-semibold select-none inline-flex items-center gap-1 font-mono text-[13px]">
                            <span>└─</span>
                            <span className="text-[#a7aaad] font-bold">— —</span>
                          </span>
                        )}

                        {/* Title & Edit Link */}
                        <strong className="text-[#2271b1] text-[14px] leading-tight">
                          <Link
                            href={`/admin/pages/${page._id}`}
                            className={`hover:underline ${
                              depth === 0 ? "font-bold text-[#135e96]" : depth === 1 ? "font-semibold text-[#2271b1]" : "font-normal text-[#2c3338] hover:text-[#2271b1]"
                            }`}
                          >
                            {page.title}
                          </Link>
                        </strong>

                        {/* Status Tag inline if Draft */}
                        {page.status === "draft" && (
                          <span className="text-[#646970] text-[12px] italic font-normal">
                            — Draft
                          </span>
                        )}

                        {/* Expand/Collapse Toggle Button */}
                        {hasChildren && viewMode === "tree" && (
                          <button
                            onClick={() => toggleCollapse(String(page._id))}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2271b1] hover:text-[#135e96] bg-[#f0f6fb] hover:bg-[#e4eff8] px-1.5 py-0.5 rounded border border-[#c5d9e8] transition-colors ml-1"
                            title={isCollapsed ? "Expand child pages" : "Collapse child pages"}
                          >
                            {isCollapsed ? (
                              <>
                                <ChevronRight className="w-3 h-3 text-[#2271b1]" />
                                <span>Expand ({childCount})</span>
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-3 h-3 text-[#2271b1]" />
                                <span>Collapse ({childCount})</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* URL Preview Line with Copy */}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#646970]">
                        <span className="font-mono bg-[#f0f0f1] px-1.5 py-0.5 rounded border border-[#e2e4e7] text-[#2c3338] select-all">
                          {canonicalPath}
                        </span>
                        <button
                          onClick={() => handleCopyUrl(`${BASE_URL}${canonicalPath}`, page.slug)}
                          className="text-[#2271b1] hover:text-[#135e96] hover:underline text-[11px] inline-flex items-center gap-0.5"
                        >
                          {copiedSlug === page.slug ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Row Action Links on Hover */}
                      <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity text-[12px]">
                        <Link href={`/admin/pages/${page._id}`} className="text-[#2271b1] hover:underline font-medium">
                          Edit
                        </Link>
                        <span className="text-[#c3c4c7]">|</span>
                        <button
                          onClick={() => setEditingPage(page)}
                          className="text-[#2271b1] hover:underline"
                        >
                          Quick Edit
                        </button>
                        <span className="text-[#c3c4c7]">|</span>
                        <button
                          onClick={(e) => handleIndividualAction(e, "duplicate", page._id)}
                          className="text-[#2271b1] hover:underline"
                        >
                          Duplicate
                        </button>
                        <span className="text-[#c3c4c7]">|</span>
                        <button
                          onClick={(e) => handleIndividualAction(e, "status", page._id)}
                          className="text-[#2271b1] hover:underline"
                        >
                          {page.status === "published" ? "Mark as Draft" : "Publish"}
                        </button>
                        <span className="text-[#c3c4c7]">|</span>
                        <Link
                          href={page.slug === "home" ? "/" : canonicalPath}
                          target="_blank"
                          className="text-[#2271b1] hover:underline inline-flex items-center gap-0.5"
                        >
                          View <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                        <span className="text-[#c3c4c7]">|</span>
                        {page.isTrashed ? (
                          <>
                            <button
                              onClick={(e) => handleIndividualAction(e, "restore", page._id)}
                              className="text-[#2271b1] hover:underline"
                            >
                              Restore
                            </button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button
                              onClick={(e) => handleIndividualAction(e, "delete", page._id)}
                              className="text-[#d63638] hover:underline"
                            >
                              Delete Permanently
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => handleIndividualAction(e, "trash", page._id)}
                            className="text-[#d63638] hover:underline"
                          >
                            Trash
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Hierarchy Tier Badge (WordPress Menu Style) */}
                    <td className="py-3 px-3 align-top">
                      {tier === "root" && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 shadow-sm">
                            <Globe className="w-3 h-3 text-blue-600" />
                            {page.template === "country" ? "Parent (Country)" : "Parent / Root"}
                          </span>
                          {childCount > 0 && (
                            <div className="text-[11px] text-[#646970] mt-1">
                              {childCount} {childCount === 1 ? "child page" : "child pages"}
                            </div>
                          )}
                        </div>
                      )}

                      {tier === "child" && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                            <MapPin className="w-3 h-3 text-amber-600" />
                            {page.template === "state" ? "Child (State)" : "Child Page"}
                          </span>
                          {parentTitle && (
                            <div className="text-[11px] text-[#50575e] mt-1">
                              Parent: <strong className="text-[#2c3338]">{parentTitle}</strong>
                            </div>
                          )}
                          {childCount > 0 && (
                            <div className="text-[10px] text-[#646970]">
                              ({childCount} {childCount === 1 ? "sub-child" : "sub-children"})
                            </div>
                          )}
                        </div>
                      )}

                      {tier === "subchild" && (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                            <CornerDownRight className="w-3 h-3 text-emerald-600" />
                            {page.template === "city" ? "Sub-child (City)" : "Sub-child Page"}
                          </span>
                          {parentTitle && (
                            <div className="text-[11px] text-[#50575e] mt-1">
                              Parent: <strong className="text-[#2c3338]">{parentTitle}</strong>
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Template */}
                    <td className="py-3 px-3 align-top">
                      <span className="inline-block capitalize text-[12px] bg-[#f0f0f1] text-[#2c3338] px-2 py-0.5 rounded border border-[#dcdcde]">
                        {page.template}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-[3px] text-[11px] font-semibold ${
                          page.status === "published"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {page.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 align-top text-[#50575e] text-[12px]">
                      {new Date(page.createdAt || Date.now()).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric"
                      })}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* WordPress-Style Modal for Add New Page */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-[#00000066]"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-xl rounded-[4px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Add New Page</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#787c82] hover:text-[#d63638] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-4 bg-[#f0f0f1] max-h-[80vh] overflow-y-auto">
                {/* Title */}
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">
                    Page Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPage.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const rawSlug = title
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9 ]/g, "")
                        .replace(/\s+/g, "-");

                      let computedSlug = rawSlug;
                      if (newPage.template === "city" && newPage.selectedStateSlug) {
                        const cSlug = newPage.selectedCountrySlug || "usa";
                        const sSeg = newPage.selectedStateSlug.split("/").pop();
                        computedSlug = `${cSlug}/${sSeg}/${rawSlug}`;
                      } else if (newPage.template === "state") {
                        const cSlug = newPage.selectedCountrySlug || "usa";
                        computedSlug = `${cSlug}/${rawSlug}`;
                      }

                      setNewPage({ ...newPage, title, slug: computedSlug });
                    }}
                    placeholder="e.g. Fort Worth Web Design"
                    className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-[14px] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                </div>

                {/* Template Selection */}
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Template</label>
                  <select
                    value={newPage.template}
                    onChange={(e) => {
                      const template = e.target.value;
                      const ownSlug = (newPage.slug || "").split("/").pop() || "";
                      let computedSlug = ownSlug;

                      if (template === "city") {
                        const cSlug = newPage.selectedCountrySlug || "usa";
                        const firstState = statePages[0]?.slug || "usa/texas";
                        const sSeg = firstState.split("/").pop();
                        computedSlug = `${cSlug}/${sSeg}/${ownSlug}`;
                        setNewPage({
                          ...newPage,
                          template,
                          selectedCountrySlug: cSlug,
                          selectedStateSlug: firstState,
                          slug: computedSlug
                        });
                      } else if (template === "state") {
                        const cSlug = newPage.selectedCountrySlug || "usa";
                        computedSlug = `${cSlug}/${ownSlug}`;
                        setNewPage({
                          ...newPage,
                          template,
                          selectedCountrySlug: cSlug,
                          selectedStateSlug: "",
                          slug: computedSlug
                        });
                      } else {
                        setNewPage({
                          ...newPage,
                          template,
                          parentLocationId: "",
                          parentLocationSlug: "",
                          selectedStateSlug: "",
                          slug: ownSlug
                        });
                      }
                    }}
                    className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-[14px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  >
                    <optgroup label="Core Pages">
                      <option value="home">Home Template</option>
                      <option value="about">About Template</option>
                      <option value="new-about">New About Template</option>
                      <option value="services">Services Template</option>
                      <option value="service-detail">Service Detail Template</option>
                      <option value="gallery">Portfolio Template</option>
                      <option value="team">Team Template</option>
                      <option value="careers">Careers Template</option>
                      <option value="reviews">Reviews Template</option>
                      <option value="faq">FAQ Template</option>
                      <option value="contact">Contact Template</option>
                      <option value="blog">Blog Template</option>
                    </optgroup>
                    <optgroup label="Locations Hierarchy">
                      <option value="country">Country Template (Parent Level 0)</option>
                      <option value="state">State Template (Child Level 1)</option>
                      <option value="city">City Template (Sub-child Level 2)</option>
                      <option value="location">Locations Hub Template</option>
                      <option value="service-area">Service Area Template</option>
                    </optgroup>
                    <optgroup label="Industries">
                      <option value="industry">Industry Template</option>
                      <option value="industries">Industries Hub Template</option>
                    </optgroup>
                  </select>
                </div>

                {/* Cascading Location Parent Selectors */}
                {newPage.template === "city" && (
                  <div className="bg-white p-3.5 rounded border border-[#c3c4c7] space-y-3">
                    <div className="font-semibold text-[13px] text-[#1d2327] flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#2271b1]" />
                      Location Hierarchy Assignment
                    </div>

                    {/* Country Selector */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#50575e] mb-1">
                        1. Parent Country
                      </label>
                      <select
                        value={newPage.selectedCountrySlug}
                        onChange={(e) => {
                          const cSlug = e.target.value;
                          const ownSegment = (newPage.slug || "").split("/").pop() || "";
                          const availableStates = statePages.filter(
                            (s) => s.slug.startsWith(`${cSlug}/`) || s.content?.countrySlug === cSlug
                          );
                          const firstState = availableStates[0]?.slug || "";
                          const sSeg = firstState.split("/").pop() || "";
                          const computed = `${cSlug}/${sSeg}/${ownSegment}`;
                          setNewPage({
                            ...newPage,
                            selectedCountrySlug: cSlug,
                            selectedStateSlug: firstState,
                            slug: computed
                          });
                        }}
                        className="w-full border border-[#8c8f94] bg-white px-2.5 py-1.5 text-[13px] rounded-[3px] outline-none"
                      >
                        {countryPages.map((c) => (
                          <option key={c._id} value={c.slug}>
                            {c.title} (/{c.slug}/)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* State Selector */}
                    <div>
                      <label className="block text-[12px] font-semibold text-[#50575e] mb-1">
                        2. Parent State
                      </label>
                      <select
                        value={newPage.selectedStateSlug}
                        onChange={(e) => {
                          const sSlug = e.target.value;
                          const selectedState = statePages.find((s) => s.slug === sSlug);
                          const cSlug = newPage.selectedCountrySlug || "usa";
                          const sSeg = sSlug.split("/").pop() || "";
                          const ownSegment = (newPage.slug || "").split("/").pop() || "";
                          const computed = `${cSlug}/${sSeg}/${ownSegment}`;

                          setNewPage({
                            ...newPage,
                            selectedStateSlug: sSlug,
                            parentLocationId: selectedState?._id || "",
                            parentLocationSlug: sSlug,
                            slug: computed
                          });
                        }}
                        className="w-full border border-[#8c8f94] bg-white px-2.5 py-1.5 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="">Select a Parent State...</option>
                        {availableStatesForCountry.map((s) => (
                          <option key={s._id} value={s.slug}>
                            {s.title} (/{s.slug}/)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {newPage.template === "state" && (
                  <div className="bg-white p-3.5 rounded border border-[#c3c4c7] space-y-3">
                    <div className="font-semibold text-[13px] text-[#1d2327] flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-[#2271b1]" />
                      Parent Country Assignment
                    </div>
                    <div>
                      <label className="block text-[12px] font-semibold text-[#50575e] mb-1">
                        Parent Country
                      </label>
                      <select
                        value={newPage.selectedCountrySlug}
                        onChange={(e) => {
                          const cSlug = e.target.value;
                          const ownSegment = (newPage.slug || "").split("/").pop() || "";
                          const countryDoc = countryPages.find((c) => c.slug === cSlug);
                          setNewPage({
                            ...newPage,
                            selectedCountrySlug: cSlug,
                            parentLocationId: countryDoc?._id || "",
                            parentLocationSlug: cSlug,
                            slug: `${cSlug}/${ownSegment}`
                          });
                        }}
                        className="w-full border border-[#8c8f94] bg-white px-2.5 py-1.5 text-[13px] rounded-[3px] outline-none"
                      >
                        {countryPages.map((c) => (
                          <option key={c._id} value={c.slug}>
                            {c.title} (/{c.slug}/)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Slug Input */}
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-[14px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                  <p className="text-[11px] text-[#646970] mt-1">
                    Canonical Preview: <span className="font-mono text-[#2271b1] font-medium">{BASE_URL}/{newPage.slug ? `${newPage.slug}/` : ""}</span>
                  </p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Publish Status</label>
                  <select
                    value={newPage.status}
                    onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-3 py-2 text-[14px] rounded-[3px] outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 px-5 py-3.5 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white border border-[#c3c4c7] text-[#2c3338] px-3.5 py-1.5 text-[13px] rounded-[3px] hover:bg-[#f0f0f1]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePage}
                  className="bg-[#2271b1] text-white text-[13px] font-medium px-4 py-1.5 rounded-[3px] border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96] transition-colors shadow-sm"
                >
                  Publish Page
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Quick Edit Modal */}
      <AnimatePresence>
        {editingPage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPage(null)}
              className="absolute inset-0 bg-[#00000066]"
            />
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-xl rounded-[4px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#2271b1]" />
                  Quick Edit: {editingPage.title}
                </h2>
                <button
                  onClick={() => setEditingPage(null)}
                  className="text-[#787c82] hover:text-[#d63638] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleQuickEditSave}>
                <div className="p-6 bg-[#f0f0f1] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Title</label>
                      <input
                        type="text"
                        value={editingPage.title}
                        onChange={(e) => setEditingPage({ ...editingPage, title: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Slug</label>
                      <input
                        type="text"
                        value={editingPage.slug}
                        onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[13px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                      <p className="text-[11px] text-[#646970] mt-1">
                        Note: Updating the slug automatically updates the canonical URL and creates a 301 redirect.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Template</label>
                      <select
                        value={editingPage.template}
                        onChange={(e) => setEditingPage({ ...editingPage, template: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2.5 py-1.5 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="home">Home Template</option>
                        <option value="about">About Template</option>
                        <option value="new-about">New About Template</option>
                        <option value="industry">Industry Template</option>
                        <option value="industries">Industries Hub Template</option>
                        <option value="services">Services Template</option>
                        <option value="service-detail">Service Detail Template</option>
                        <option value="team">Team Template</option>
                        <option value="careers">Careers Template</option>
                        <option value="gallery">Portfolio Template</option>
                        <option value="reviews">Reviews Template</option>
                        <option value="faq">FAQ Template</option>
                        <option value="contact">Contact Template</option>
                        <option value="location">Locations Hub Template</option>
                        <option value="service-area">Service Area Template</option>
                        <option value="blog">Blog Template</option>
                        <option value="country">Country Template</option>
                        <option value="state">State Template</option>
                        <option value="city">City Template</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Status</label>
                      <select
                        value={editingPage.status}
                        onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2.5 py-1.5 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="bg-white border border-[#c3c4c7] text-[#2c3338] px-3.5 py-1 text-[13px] rounded-[3px] hover:bg-[#f0f0f1]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2271b1] text-white text-[13px] font-medium px-4 py-1 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]"
                  >
                    Update Page
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
