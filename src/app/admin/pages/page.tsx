"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, ChevronRight, Loader2, Search, Trash2, X, ExternalLink, Edit3, Check, Copy, MoreHorizontal,
  Info, Briefcase, CircleHelp, Mail, UserCheck, ArrowRight, Eye, EyeOff, Image as GalleryIcon
} from "lucide-react";

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

  // New Page Form
  const [newPage, setNewPage] = useState({
    title: "",
    slug: "",
    template: "about",
    status: "draft"
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const res = await fetch(`/api/admin/pages?t=${Date.now()}`);
      const data = await res.json();
      setPages(data);
    } catch (err) {
      console.error("Failed to fetch pages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePage = async () => {
    if (!newPage.title || !newPage.slug) return alert("Title and Slug are required.");

    try {
      const res = await fetch("/api/admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage)
      });
      if (res.ok) {
        const created = await res.json();
        window.location.href = `/admin/pages/${created._id}`;
      }
    } catch (err) {
      alert("Failed to create page.");
    }
  };

  const handleBulkAction = async (action: string) => {
    if (action === 'delete') {
      if (!confirm(`Permanently delete ${selectedIds.length} pages?`)) return;
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
      } catch (err) { alert("Bulk delete failed."); }
      finally { setActionLoading(false); }
    }

    if (action === 'trash' || action === 'restore') {
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
      } catch (err) { alert(`Bulk ${action} failed.`); }
      finally { setActionLoading(false); }
    }

    if (action === 'publish' || action === 'draft') {
      const status = action === 'publish' ? 'published' : 'draft';
      setActionLoading(true);
      try {
        const res = await fetch("/api/admin/pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 'status', ids: selectedIds, status })
        });
        if (res.ok) {
          setSelectedIds([]);
          fetchPages();
        }
      } catch (err) { alert("Bulk status update failed."); }
      finally { setActionLoading(false); }
    }
  };

  const handleIndividualAction = async (e: React.MouseEvent, action: string, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (action === 'trash' || action === 'restore') {
      try {
        const res = await fetch(`/api/admin/pages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isTrashed: action === 'trash' })
        });
        if (res.ok) {
          fetchPages();
        } else {
          const errData = await res.json();
          alert(`${action === 'trash' ? 'Trash' : 'Restore'} failed: ${errData.error || 'Unknown error'}`);
        }
      } catch (err) { alert(`${action === 'trash' ? 'Trash' : 'Restore'} failed due to network error.`); }
    }

    if (action === 'delete') {
      if (!confirm("Permanently delete this page?")) return;
      try {
        const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
        if (res.ok) fetchPages();
      } catch (err) { alert("Delete failed."); }
    }

    if (action === 'duplicate') {
      try {
        const res = await fetch("/api/admin/pages", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: 'duplicate', ids: [id] })
        });
        if (res.ok) fetchPages();
      } catch (err) { alert("Duplication failed."); }
    }

    if (action === 'status') {
      const page = pages.find(p => p._id === id);
      const newStatus = page.status === 'published' ? 'draft' : 'published';
      try {
        const res = await fetch(`/api/admin/pages/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) fetchPages();
      } catch (err) { alert("Status update failed."); }
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
      alert("Update failed");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredPages.length) setSelectedIds([]);
    else setSelectedIds(filteredPages.map(p => p._id));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredPages = pages.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.slug.toLowerCase().includes(search.toLowerCase());
    const isTrashed = !!p.isTrashed;
    
    if (filter === 'trash') return matchesSearch && isTrashed;
    if (isTrashed) return false;
    
    if (filter === "all") return matchesSearch;
    return matchesSearch && p.status === filter;
  });

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" /></div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Pages</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
        >
          Add New Page
        </button>
      </div>

      {/* Filter Links */}
      <div className="flex items-center gap-2 text-[13px]">
        <button onClick={() => setFilter("all")} className={`${filter === 'all' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
          All <span className="text-[#646970] font-normal">({pages.filter(p => !p.isTrashed).length})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button onClick={() => setFilter("published")} className={`${filter === 'published' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
          Published <span className="text-[#646970] font-normal">({pages.filter(p => p.status === 'published' && !p.isTrashed).length})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button onClick={() => setFilter("draft")} className={`${filter === 'draft' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
          Drafts <span className="text-[#646970] font-normal">({pages.filter(p => p.status === 'draft' && !p.isTrashed).length})</span>
        </button>
        <span className="text-[#c3c4c7]">|</span>
        <button onClick={() => setFilter("trash")} className={`${filter === 'trash' ? 'text-black font-bold' : 'text-[#d63638] underline decoration-transparent hover:decoration-current'}`}>
          Trash <span className="text-[#646970] font-normal">({pages.filter(p => p.isTrashed).length})</span>
        </button>
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
            {filter === 'trash' ? (
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
            onClick={() => { handleBulkAction(bulkAction); setBulkAction(""); }}
            className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors"
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
           <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors">Search Pages</button>
        </div>
      </div>

      {/* Table Pagination Info */}
      <div className="flex justify-end text-[13px] text-[#50575e]">
         {filteredPages.length} items
      </div>

      {/* WP-Style Table */}
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
              <th className="py-2 px-3 text-[14px] font-semibold w-40">Status</th>
              <th className="py-2 px-3 text-[14px] font-semibold w-32">Date</th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#2c3338]">
            {filteredPages.length === 0 ? (
              <tr><td colSpan={5} className="py-6 px-4 text-[#50575e]">No pages found.</td></tr>
            ) : (
              filteredPages.map((page, idx) => (
                <tr
                  key={page._id}
                  className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1] transition-colors`}
                >
                  <td className="py-3 px-3 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(page._id)}
                      onChange={() => toggleSelect(page._id)}
                      className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                    />
                  </td>
                  <td className="py-3 px-3 align-top">
                    <strong className="text-[#2271b1] block text-[14px]">{page.title} — {page.status === 'draft' ? <span className="text-[#646970] font-normal italic">Draft</span> : <span className="text-[#00a32a] font-normal italic">Published</span>}</strong>
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/admin/pages/${page._id}`} className="text-[#2271b1] hover:underline text-[12px]">Edit</Link>
                      <span className="text-[#a7aaad]">|</span>
                      <button onClick={() => setEditingPage(page)} className="text-[#2271b1] hover:underline text-[12px]">Quick Edit</button>
                      <span className="text-[#a7aaad]">|</span>
                      <button onClick={(e) => handleIndividualAction(e, 'duplicate', page._id)} className="text-[#2271b1] hover:underline text-[12px]">Duplicate</button>
                      <span className="text-[#a7aaad]">|</span>
                      <button onClick={(e) => handleIndividualAction(e, 'status', page._id)} className="text-[#2271b1] hover:underline text-[12px]">
                        {page.status === 'published' ? 'Keep as Draft' : 'Publish Now'}
                      </button>
                      <span className="text-[#a7aaad]">|</span>
                      <Link href={`/${page.slug}`} target="_blank" className="text-[#2271b1] hover:underline text-[12px]">View</Link>
                      <span className="text-[#a7aaad]">|</span>
                      {page.isTrashed ? (
                        <>
                          <button onClick={(e) => handleIndividualAction(e, 'restore', page._id)} className="text-[#2271b1] hover:underline text-[12px]">Restore</button>
                          <span className="text-[#a7aaad]">|</span>
                          <button onClick={(e) => handleIndividualAction(e, 'delete', page._id)} className="text-[#d63638] hover:underline text-[12px]">Delete Permanently</button>
                        </>
                      ) : (
                        <button onClick={(e) => handleIndividualAction(e, 'trash', page._id)} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-3 align-top capitalize text-[#50575e]">
                    {page.template}
                  </td>
                  <td className="py-3 px-3 align-top">
                    <span className={`font-semibold ${page.status === 'published' ? 'text-[#00a32a]' : 'text-[#d63638]'}`}>
                      {page.status === 'published' ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="py-3 px-3 align-top text-[#50575e]">
                    {new Date(page.createdAt || Date.now()).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WP-Style Modal for Add New Page */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-[#00000066]" />
             <motion.div
               initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
               className="relative w-full max-w-xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
             >
                <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                   <h2 className="text-[#1d2327] text-lg font-normal font-serif">Add New Page</h2>
                   <button onClick={() => setShowAddModal(false)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 space-y-4 bg-[#f0f0f1]">
                   <div>
                      <label className="block text-[#1d2327] text-sm font-semibold mb-1">Title</label>
                      <input
                        type="text"
                        value={newPage.title}
                        onChange={(e) => {
                          const slug = e.target.value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
                          setNewPage({ ...newPage, title: e.target.value, slug });
                        }}
                        placeholder="Enter page title here"
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[#1d2327] text-sm font-semibold mb-1">Slug</label>
                      <input
                        type="text"
                        value={newPage.slug}
                        onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                   </div>
                   <div>
                      <label className="block text-[#1d2327] text-sm font-semibold mb-1">Template</label>
                      <select
                        value={newPage.template}
                        onChange={(e) => setNewPage({ ...newPage, template: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[14px] rounded-[3px] outline-none"
                      >
                        <option value="home">Home Template</option>
                        <option value="about">About Template</option>
                        <option value="services">Services Template</option>
                        <option value="team">Team Template</option>
                        <option value="careers">Careers Template</option>
                        <option value="gallery">Gallery Template</option>
                        <option value="reviews">Reviews Template</option>
                        <option value="faq">FAQ Template</option>
                        <option value="contact">Contact Template</option>
                        <option value="service-area">Service Area Template</option>
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
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingPage(null)} className="absolute inset-0 bg-[#00000066]" />
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Quick Edit</h2>
                <button onClick={() => setEditingPage(null)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
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
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
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
                        <option value="services">Services Template</option>
                        <option value="team">Team Template</option>
                        <option value="careers">Careers Template</option>
                        <option value="gallery">Gallery Template</option>
                        <option value="reviews">Reviews Template</option>
                        <option value="faq">FAQ Template</option>
                        <option value="contact">Contact Template</option>
                        <option value="service-area">Service Area Template</option>
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
                  <button type="button" onClick={() => setEditingPage(null)} className="text-[#2271b1] text-[13px] hover:text-[#135e96]">Cancel</button>
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
