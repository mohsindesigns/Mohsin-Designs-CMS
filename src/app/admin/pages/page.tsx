"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X } from "lucide-react";

export type DisplayRow = {
  page: any;
  depth: number;
  hasChildren: boolean;
  childCount: number;
  isExpanded: boolean;
};

/**
 * Builds a clean WordPress-style hierarchical page list.
 * - Parent pages are root (depth 0).
 * - Child pages (e.g. States) appear directly under their parent with depth 1.
 * - Sub-child pages (e.g. Cities) appear directly under their state with depth 2.
 * - By default, every parent is collapsed unless explicitly expanded or in search mode.
 */
function buildDisplayRows(
  list: any[],
  expandedIds: Set<string>,
  isSearching: boolean = false
): DisplayRow[] {
  const byId = new Map<string, any>();
  const bySlug = new Map<string, any>();

  list.forEach((p) => {
    byId.set(String(p._id), p);
    if (p.slug) {
      bySlug.set(p.slug.toLowerCase().trim().replace(/^\/+|\/+$/g, ""), p);
    }
  });

  const childrenOf = new Map<string, any[]>();
  const childIds = new Set<string>();

  // Determine parent-child relationships
  list.forEach((p) => {
    const pId = String(p._id);
    let parentId: string | null = null;

    // 1. By parentLocationId
    if (p.content?.parentLocationId) {
      const pLocId = String(p.content.parentLocationId);
      if (byId.has(pLocId) && pLocId !== pId) {
        parentId = pLocId;
      }
    }

    // 2. Slug-based fallback (e.g. usa/texas/fort-worth -> usa/texas -> usa)
    if (!parentId && p.slug && p.slug.includes("/")) {
      const parts = p.slug.split("/").filter(Boolean);
      if (parts.length > 1) {
        const parentSlug = parts.slice(0, -1).join("/").toLowerCase();
        const parentDoc = bySlug.get(parentSlug);
        if (parentDoc && String(parentDoc._id) !== pId) {
          parentId = String(parentDoc._id);
        }
      }
    }

    if (parentId) {
      if (!childrenOf.has(parentId)) childrenOf.set(parentId, []);
      childrenOf.get(parentId)!.push(p);
      childIds.add(pId);
    }
  });

  // Sort children alphabetically under each parent
  for (const [_, childList] of childrenOf) {
    childList.sort((a, b) =>
      (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" })
    );
  }

  // Count total descendants recursively for child count indicator
  const countDescendants = (pageId: string): number => {
    const children = childrenOf.get(pageId) || [];
    let count = children.length;
    for (const child of children) {
      count += countDescendants(String(child._id));
    }
    return count;
  };

  const rows: DisplayRow[] = [];
  const seen = new Set<string>();

  const appendPageAndChildren = (page: any, depth: number) => {
    const pId = String(page._id);
    if (seen.has(pId)) return;
    seen.add(pId);

    const children = childrenOf.get(pId) || [];
    const hasChildren = children.length > 0;
    const isExpanded = isSearching || expandedIds.has(pId);

    rows.push({
      page,
      depth,
      hasChildren,
      childCount: countDescendants(pId),
      isExpanded
    });

    // Only render children if this parent is expanded (or when actively searching)
    if (isExpanded) {
      children.forEach((child) => appendPageAndChildren(child, depth + 1));
    }
  };

  // Identify root pages
  const roots: any[] = [];
  list.forEach((p) => {
    if (!childIds.has(String(p._id))) {
      roots.push(p);
    }
  });

  // Sort roots: Location country pages first, then other pages alphabetically
  roots.sort((a, b) => {
    const isCountryA = a.template === "country";
    const isCountryB = b.template === "country";
    if (isCountryA && !isCountryB) return -1;
    if (!isCountryA && isCountryB) return 1;

    return (a.title || "").localeCompare(b.title || "", undefined, { numeric: true, sensitivity: "base" });
  });

  roots.forEach((root) => appendPageAndChildren(root, 0));

  // Guard: unvisited pages due to circular chains
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

  // By default, every parent is collapsed (empty set)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

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

  const countryPages = useMemo(
    () => pages.filter((p) => p.template === "country" && !p.isTrashed),
    [pages]
  );

  const statePages = useMemo(
    () => pages.filter((p) => p.template === "state" && !p.isTrashed),
    [pages]
  );

  const availableStatesForCountry = useMemo(() => {
    const cSlug = newPage.selectedCountrySlug || "usa";
    return statePages.filter((s) => {
      if (s.slug.startsWith(`${cSlug}/`)) return true;
      if (s.content?.countrySlug === cSlug) return true;
      if (cSlug === "usa" && !s.slug.includes("/")) return true;
      return false;
    });
  }, [statePages, newPage.selectedCountrySlug]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    const allParentIds = new Set<string>();
    pages.forEach((p) => {
      allParentIds.add(String(p._id));
    });
    setExpandedIds(allParentIds);
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
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
        const stateDoc = statePages.find(
          (s) => s.slug === newPage.selectedStateSlug || String(s._id) === newPage.parentLocationId
        );

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
      return matchesSearch && p.status === filter;
    });
  }, [pages, search, filter]);

  // Display rows with WordPress tree structure (collapsed by default)
  const displayRows = useMemo(() => {
    return buildDisplayRows(filteredPages, expandedIds, search.trim().length > 0);
  }, [filteredPages, expandedIds, search]);

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
      <div className="flex items-center gap-4 mb-2">
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
          className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
        >
          Add New Page
        </button>
      </div>

      {/* WordPress Standard Filter Links + Collapse / Expand Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`${filter === "all" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
          >
            All <span className="text-[#646970] font-normal">({pages.filter((p) => !p.isTrashed).length})</span>
          </button>
          <span className="text-[#c3c4c7]">|</span>
          <button
            onClick={() => setFilter("published")}
            className={`${filter === "published" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
          >
            Published <span className="text-[#646970] font-normal">({pages.filter((p) => p.status === "published" && !p.isTrashed).length})</span>
          </button>
          <span className="text-[#c3c4c7]">|</span>
          <button
            onClick={() => setFilter("draft")}
            className={`${filter === "draft" ? "text-black font-bold" : "text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current"}`}
          >
            Drafts <span className="text-[#646970] font-normal">({pages.filter((p) => p.status === "draft" && !p.isTrashed).length})</span>
          </button>
          <span className="text-[#c3c4c7]">|</span>
          <button
            onClick={() => setFilter("trash")}
            className={`${filter === "trash" ? "text-black font-bold" : "text-[#d63638] underline decoration-transparent hover:decoration-current"}`}
          >
            Trash <span className="text-[#646970] font-normal">({pages.filter((p) => p.isTrashed).length})</span>
          </button>
        </div>

        {/* Clean, simple Expand All / Collapse All utilities */}
        <div className="flex items-center gap-2 text-[12px] text-[#50575e]">
          <button
            type="button"
            onClick={expandAll}
            className="text-[#2271b1] hover:text-[#135e96] hover:underline"
          >
            Expand All
          </button>
          <span className="text-[#c3c4c7]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="text-[#2271b1] hover:text-[#135e96] hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Top Bar: Bulk Actions & Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <select
            className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
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
            Apply
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search Pages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
          />
          <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors">
            Search Pages
          </button>
        </div>
      </div>

      {/* Table Pagination Info */}
      <div className="flex justify-end text-[13px] text-[#50575e]">
        {filteredPages.length} items
      </div>

      {/* WordPress-Style Table */}
      <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#c3c4c7] text-[#1d2327]">
              <th className="w-8 py-2 px-3">
                <input
                  type="checkbox"
                  checked={filteredPages.length > 0 && selectedIds.length === filteredPages.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                />
              </th>
              <th className="py-2 px-3 text-[14px] font-semibold">Title</th>
              <th className="py-2 px-3 text-[14px] font-semibold w-40">Template</th>
              <th className="py-2 px-3 text-[14px] font-semibold w-36">Status</th>
              <th className="py-2 px-3 text-[14px] font-semibold w-32">Date</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#2c3338]">
            {displayRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 px-4 text-[#50575e]">
                  No pages found.
                </td>
              </tr>
            ) : (
              displayRows.map(({ page, depth, hasChildren, childCount, isExpanded }, idx) => {
                const isSelected = selectedIds.includes(page._id);

                return (
                  <tr
                    key={page._id}
                    className={`border-b border-[#f0f0f1] group ${
                      idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"
                    } hover:bg-[#f0f0f1] transition-colors`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-3 align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(page._id)}
                        className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                      />
                    </td>

                    {/* Title with WordPress-style em-dash indentation & collapsible toggle */}
                    <td
                      className="py-3 px-3 align-top"
                      style={
                        depth === 1
                          ? { paddingLeft: "28px" }
                          : depth >= 2
                          ? { paddingLeft: "48px" }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Classic WordPress em-dashes */}
                        {depth === 1 && (
                          <span className="text-[#a7aaad] font-bold mr-0.5 select-none">—</span>
                        )}
                        {depth >= 2 && (
                          <span className="text-[#a7aaad] font-bold mr-0.5 select-none">— —</span>
                        )}

                        {/* Expand / Collapse toggle arrow if page has children */}
                        {hasChildren ? (
                          <button
                            type="button"
                            onClick={() => toggleExpand(String(page._id))}
                            className="text-[#646970] hover:text-[#2271b1] p-0.5 text-[10px] font-mono leading-none focus:outline-none select-none transition-colors"
                            title={isExpanded ? "Collapse subpages" : "Expand subpages"}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        ) : null}

                        {/* Title Link */}
                        <strong className="text-[#2271b1] text-[14px]">
                          <Link href={`/admin/pages/${page._id}`} className="hover:underline">
                            {page.title}
                          </Link>
                        </strong>

                        {/* If collapsed, show subtle count indicator */}
                        {hasChildren && !isExpanded && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(String(page._id))}
                            className="text-[#646970] hover:text-[#2271b1] text-[11px] font-normal cursor-pointer hover:underline select-none"
                          >
                            ({childCount} {childCount === 1 ? "subpage" : "subpages"})
                          </button>
                        )}

                        {page.status === "draft" && (
                          <span className="text-[#646970] font-normal italic text-[12px]">
                            — Draft
                          </span>
                        )}
                      </div>

                      {/* Classic WordPress row hover actions */}
                      <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/admin/pages/${page._id}`}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          Edit
                        </Link>
                        <span className="text-[#a7aaad]">|</span>
                        <button
                          onClick={() => setEditingPage(page)}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          Quick Edit
                        </button>
                        <span className="text-[#a7aaad]">|</span>
                        <button
                          onClick={(e) => handleIndividualAction(e, "duplicate", page._id)}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          Duplicate
                        </button>
                        <span className="text-[#a7aaad]">|</span>
                        <button
                          onClick={(e) => handleIndividualAction(e, "status", page._id)}
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          {page.status === "published" ? "Keep as Draft" : "Publish Now"}
                        </button>
                        <span className="text-[#a7aaad]">|</span>
                        <Link
                          href={page.slug === "home" ? "/" : `/${page.slug}/`}
                          target="_blank"
                          className="text-[#2271b1] hover:underline text-[12px]"
                        >
                          View
                        </Link>
                        <span className="text-[#a7aaad]">|</span>
                        {page.isTrashed ? (
                          <>
                            <button
                              onClick={(e) => handleIndividualAction(e, "restore", page._id)}
                              className="text-[#2271b1] hover:underline text-[12px]"
                            >
                              Restore
                            </button>
                            <span className="text-[#a7aaad]">|</span>
                            <button
                              onClick={(e) => handleIndividualAction(e, "delete", page._id)}
                              className="text-[#d63638] hover:underline text-[12px]"
                            >
                              Delete Permanently
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => handleIndividualAction(e, "trash", page._id)}
                            className="text-[#d63638] hover:underline text-[12px]"
                          >
                            Trash
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Template */}
                    <td className="py-3 px-3 align-top capitalize text-[#50575e]">
                      {page.template}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 align-top">
                      <span
                        className={`font-semibold ${
                          page.status === "published" ? "text-[#00a32a]" : "text-[#d63638]"
                        }`}
                      >
                        {page.status === "published" ? "Active" : "Draft"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 align-top text-[#50575e]">
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
              className="relative w-full max-w-xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Add New Page</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-[#787c82] hover:text-[#d63638]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-4 bg-[#f0f0f1] max-h-[80vh] overflow-y-auto">
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Title</label>
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
                    placeholder="Enter page title here"
                    className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                </div>

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
                    className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[14px] rounded-[3px] outline-none"
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

                {/* Cascading selectors for location templates */}
                {newPage.template === "city" && (
                  <div className="space-y-3 bg-white p-3 rounded border border-[#c3c4c7]">
                    <div>
                      <label className="block text-[#1d2327] text-xs font-semibold mb-1">Parent Country</label>
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
                          setNewPage({
                            ...newPage,
                            selectedCountrySlug: cSlug,
                            selectedStateSlug: firstState,
                            slug: `${cSlug}/${sSeg}/${ownSegment}`
                          });
                        }}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                      >
                        {countryPages.map((c) => (
                          <option key={c._id} value={c.slug}>
                            {c.title} ({c.slug})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#1d2327] text-xs font-semibold mb-1">Parent State</label>
                      <select
                        value={newPage.selectedStateSlug}
                        onChange={(e) => {
                          const sSlug = e.target.value;
                          const selectedState = statePages.find((s) => s.slug === sSlug);
                          const cSlug = newPage.selectedCountrySlug || "usa";
                          const sSeg = sSlug.split("/").pop() || "";
                          const ownSegment = (newPage.slug || "").split("/").pop() || "";

                          setNewPage({
                            ...newPage,
                            selectedStateSlug: sSlug,
                            parentLocationId: selectedState?._id || "",
                            parentLocationSlug: sSlug,
                            slug: `${cSlug}/${sSeg}/${ownSegment}`
                          });
                        }}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="">Select a state...</option>
                        {availableStatesForCountry.map((s) => (
                          <option key={s._id} value={s.slug}>
                            {s.title} ({s.slug})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {newPage.template === "state" && (
                  <div className="bg-white p-3 rounded border border-[#c3c4c7]">
                    <label className="block text-[#1d2327] text-xs font-semibold mb-1">Parent Country</label>
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
                      className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                    >
                      {countryPages.map((c) => (
                        <option key={c._id} value={c.slug}>
                          {c.title} ({c.slug})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    value={newPage.slug}
                    onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                  <p className="text-[11px] text-[#646970] mt-1">
                    Preview: {BASE_URL}/{newPage.slug ? `${newPage.slug}/` : ""}
                  </p>
                </div>

                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Status</label>
                  <select
                    value={newPage.status}
                    onChange={(e) => setNewPage({ ...newPage, status: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[14px] rounded-[3px] outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                <button
                  onClick={handleCreatePage}
                  className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-[3px] border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96] transition-colors"
                >
                  Publish
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
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Quick Edit</h2>
                <button
                  onClick={() => setEditingPage(null)}
                  className="text-[#787c82] hover:text-[#d63638]"
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
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Slug</label>
                      <input
                        type="text"
                        value={editingPage.slug}
                        onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Template</label>
                      <select
                        value={editingPage.template}
                        onChange={(e) => setEditingPage({ ...editingPage, template: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
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
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                  <button
                    type="button"
                    onClick={() => setEditingPage(null)}
                    className="text-[#2271b1] text-[13px] hover:text-[#135e96]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2271b1] text-white text-[13px] font-bold px-4 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]"
                  >
                    Update
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
