"use client";

import { useState, useEffect } from "react";
import Link from "@/components/ui/Link";
import { Calendar, Star } from "lucide-react";
import { motion } from "framer-motion";
import { adminApiUrl } from "@/lib/adminApi";

export default function PortfolioAdminList() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    setSelected([]);
  }, [statusFilter]);

  const fetchItems = async () => {
    try {
      const res = await fetch(adminApiUrl("/api/admin/portfolio/items?all=true"), { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setItems(data);
        setLoadError("");
      } else {
        setLoadError(data?.error || "Failed to load portfolio items.");
      }
      setSelected([]);
    } catch {
      setLoadError("Failed to load portfolio items.");
    } finally {
      setLoading(false);
    }
  };

  const fmtDate = (v: any) => {
    const d = v ? new Date(v) : null;
    return d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString() : "—";
  };

  const filtered = items.filter((it) => {
    const matchesSearch = (it.title || "").toLowerCase().includes(search.toLowerCase()) || (it.client || "").toLowerCase().includes(search.toLowerCase());
    const isTrashed = it.isTrashed === true;
    if (statusFilter === "trash") return matchesSearch && isTrashed;
    if (isTrashed) return false;
    if (statusFilter === "all") return matchesSearch;
    return matchesSearch && it.status === statusFilter;
  });

  const toggleSelectAll = () => {
    setSelected(selected.length === filtered.length ? [] : filtered.map((i) => i._id));
  };
  const toggleSelect = (id: string) => setSelected((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const itemUrl = (id: string) => `/api/admin/portfolio/items/${id}/`;

  const handleBulkAction = async () => {
    if (!bulkAction || selected.length === 0) return;
    let action = bulkAction;
    let value = "";
    if (bulkAction.startsWith("status-")) {
      action = "status";
      value = bulkAction.replace("status-", "");
    }
    if (action === "force-delete") {
      if (!confirm(`Permanently delete ${selected.length} item(s)? This cannot be undone.`)) return;
      action = "delete";
    } else if (action === "delete") {
      if (statusFilter === "trash") {
        if (!confirm(`Permanently delete ${selected.length} item(s)?`)) return;
      } else {
        action = "trash";
      }
    }
    try {
      const res = await fetch(adminApiUrl("/api/admin/portfolio/items/bulk/"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selected, action, value }),
      });
      if (res.ok) setBulkAction("");
      else {
        const err = await res.json().catch(() => ({}));
        alert("Bulk action failed: " + (err.error || `HTTP ${res.status}`));
      }
    } catch {
      alert("Bulk action failed");
    } finally {
      fetchItems();
    }
  };

  const permanentlyDelete = async (id: string) => {
    if (!confirm("Permanently delete this case study? This cannot be undone.")) return;
    try {
      const res = await fetch(itemUrl(id), { method: "DELETE" });
      if (!res.ok && res.status !== 404) {
        const err = await res.json().catch(() => ({}));
        alert("Delete failed: " + (err.error || `HTTP ${res.status}`));
      }
    } catch {
      alert("Delete failed due to network error");
    } finally {
      fetchItems();
    }
  };

  const trashItem = async (id: string) => {
    if (statusFilter === "trash") return permanentlyDelete(id);
    try {
      const res = await fetch(itemUrl(id), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isTrashed: true }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Moving to trash failed: " + (err.error || `HTTP ${res.status}`));
      }
    } catch {
      alert("Moving to trash failed");
    } finally {
      fetchItems();
    }
  };

  const restoreItem = async (id: string) => {
    try {
      const res = await fetch(itemUrl(id), { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isTrashed: false }) });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert("Restore failed: " + (err.error || `HTTP ${res.status}`));
      }
    } catch {
      alert("Restore failed");
    } finally {
      fetchItems();
    }
  };

  const originalQuickEditStatus = items.find((i) => i._id === editing?._id)?.status;

  const handleQuickEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(itemUrl(editing._id), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editing.title,
          slug: editing.slug,
          ...(editing.status !== originalQuickEditStatus ? { status: editing.status } : {}),
        }),
      });
      if (res.ok) {
        setEditing(null);
        fetchItems();
      } else {
        const err = await res.json();
        alert("Update failed: " + (err.error || "Unknown error"));
      }
    } catch {
      alert("Update failed");
    }
  };

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">Portfolio</h1>
          <Link href="/admin/portfolio/new" className="bg-white border border-[#2271b1] text-[#2271b1] text-[13px] px-2 py-0.5 rounded-[3px] hover:bg-[#f0f6fb]">Add New</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-[13px]">
        <div className="flex items-center gap-2 text-[#2271b1]">
          <button onClick={() => setStatusFilter("all")} className={statusFilter === "all" ? "text-[#1d2327] font-bold" : ""}>All ({items.filter((i) => !i.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter("published")} className={statusFilter === "published" ? "text-[#1d2327] font-bold" : ""}>Published ({items.filter((i) => i.status === "published" && !i.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter("draft")} className={statusFilter === "draft" ? "text-[#1d2327] font-bold" : ""}>Drafts ({items.filter((i) => i.status === "draft" && !i.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter("trash")} className={statusFilter === "trash" ? "text-[#d63638] font-bold" : "text-[#d63638]"}>Trash ({items.filter((i) => i.isTrashed).length || 0})</button>
        </div>
        <div className="flex items-center gap-2">
          <input type="text" placeholder="Search case studies..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white border border-[#8c8f94] px-2 py-1 rounded-[3px] w-56 outline-none focus:border-[#2271b1]" />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} className="bg-white border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px] outline-none">
          <option value="">Bulk Actions</option>
          {statusFilter === "trash" ? (
            <>
              <option value="restore">Restore</option>
              <option value="delete">Delete Permanently</option>
            </>
          ) : (
            <>
              <option value="status-published">Move to Published</option>
              <option value="status-draft">Move to Draft</option>
              <option value="delete">Move to Trash</option>
              <option value="force-delete">Delete Permanently</option>
            </>
          )}
        </select>
        <button onClick={handleBulkAction} disabled={!bulkAction || selected.length === 0} className="bg-white border border-[#8c8f94] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50">Apply</button>
      </div>

      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7] text-[13px] font-bold text-[#1d2327]">
              <th className="px-3 py-2 w-10 text-center">
                <input type="checkbox" checked={selected.length > 0 && selected.length === filtered.length} onChange={toggleSelectAll} />
              </th>
              <th className="px-3 py-2">Case Study</th>
              <th className="px-3 py-2 w-36">Client</th>
              <th className="px-3 py-2 w-36">Industry</th>
              <th className="px-3 py-2 w-24 text-center">Featured</th>
              <th className="px-3 py-2 w-36"><Calendar className="w-3.5 h-3.5 inline mr-1" /> Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-[#646970]">Loading...</td></tr>
            ) : loadError ? (
              <tr><td colSpan={6} className="p-10 text-center text-[#d63638]">{loadError}</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-[#646970]">No case studies found.</td></tr>
            ) : filtered.map((it) => (
              <tr key={it._id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group text-[13px] text-[#2c3338] ${selected.includes(it._id) ? "bg-[#f0f6fb]" : ""}`}>
                <td className="px-3 py-4 text-center align-top">
                  <input type="checkbox" checked={selected.includes(it._id)} onChange={() => toggleSelect(it._id)} />
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="flex items-start gap-3">
                    {it.thumbnail && (
                      <div className="w-12 h-12 rounded border border-[#c3c4c7] overflow-hidden flex-shrink-0">
                        <img src={it.thumbnail} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/admin/portfolio/${it._id}`} className="text-[#2271b1] font-bold hover:text-[#135e96] block mb-1 leading-snug">
                        {it.title} {it.status === "draft" && <span className="text-[#646970] font-normal">— Draft</span>}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity">
                        <Link href={`/admin/portfolio/${it._id}`} className="text-[#2271b1] hover:text-[#135e96]">Edit</Link>
                        <span className="text-[#c3c4c7]">|</span>
                        <button onClick={() => setEditing(it)} className="text-[#2271b1] hover:text-[#135e96]">Quick Edit</button>
                        <span className="text-[#c3c4c7]">|</span>
                        {it.isTrashed ? (
                          <>
                            <button onClick={() => restoreItem(it._id)} className="text-[#2271b1] hover:text-[#135e96]">Restore</button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button onClick={() => permanentlyDelete(it._id)} className="text-[#d63638] hover:text-[#b32d2e]">Delete Permanently</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => trashItem(it._id)} className="text-[#d63638] hover:text-[#b32d2e]">Trash</button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button onClick={() => permanentlyDelete(it._id)} className="text-[#d63638] hover:text-[#b32d2e]">Delete Permanently</button>
                          </>
                        )}
                        {!it.isTrashed && (
                          <>
                            <span className="text-[#c3c4c7]">|</span>
                            <Link href={`/portfolio/${it.slug}`} target="_blank" className="text-[#2271b1] hover:text-[#135e96]">
                              {it.status === "published" ? "View" : "Preview"}
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 align-top">{it.client || "—"}</td>
                <td className="px-3 py-4 align-top">{it.industry || "—"}</td>
                <td className="px-3 py-4 align-top text-center">
                  {it.featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500 inline" />}
                </td>
                <td className="px-3 py-4 align-top">
                  <div className="text-[12px]">
                    <span className="block text-[#646970]">{it.status === "published" ? "Published" : "Last Modified"}</span>
                    <span className="block">{fmtDate(it.status === "published" ? it.publishedAt || it.updatedAt : it.updatedAt)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-[#c3c4c7] shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold">Quick Edit</h2>
              <button onClick={() => setEditing(null)} className="text-[#646970] hover:text-[#d63638]">×</button>
            </div>
            <form onSubmit={handleQuickEditSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#1d2327]">Title</label>
                  <input type="text" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]" />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#1d2327]">Slug</label>
                  <input type="text" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]" />
                </div>
              </div>
              <div className="space-y-1 w-48">
                <label className="block text-[12px] font-semibold text-[#1d2327]">Status</label>
                <select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className="w-full bg-white border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <div className="bg-[#f6f7f7] -mx-4 -mb-4 px-4 py-3 flex items-center justify-end gap-3 border-t border-[#c3c4c7]">
                <button type="button" onClick={() => setEditing(null)} className="text-[#2271b1] text-[13px] hover:text-[#135e96]">Cancel</button>
                <button type="submit" className="bg-[#2271b1] text-white text-[13px] font-bold px-4 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]">Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
