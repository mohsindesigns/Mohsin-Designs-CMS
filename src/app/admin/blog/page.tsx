"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Search, Filter, MoreVertical, Edit, 
  Trash2, Copy, Eye, EyeOff, Calendar, 
  CheckCircle2, Clock, FileText, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function BlogPosts() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [editingPost, setEditingPost] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, [statusFilter]);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog/posts?all=true');
      const data = await res.json();
      setPosts(data);
      setSelectedPosts([]);
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(search.toLowerCase());
    const isTrashed = post.isTrashed === true;

    if (statusFilter === 'trash') return matchesSearch && isTrashed;
    if (isTrashed) return false;

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && post.status === statusFilter;
  });

  const toggleSelectAll = () => {
    if (selectedPosts.length === filteredPosts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(filteredPosts.map(p => p._id));
    }
  };

  const toggleSelectPost = (id: string) => {
    setSelectedPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedPosts.length === 0) return;
    
    let action = bulkAction;
    let value = "";
    
    if (bulkAction.startsWith('status-')) {
      action = 'status';
      value = bulkAction.replace('status-', '');
    }

    if (action === 'delete') {
      if (statusFilter === 'trash') {
        if (!confirm(`Permanently delete ${selectedPosts.length} posts?`)) return;
        // Proceed to bulk delete
      } else {
        action = 'trash';
      }
    }

    try {
      const res = await fetch('/api/admin/blog/posts/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedPosts, action, value })
      });
      if (res.ok) {
        setBulkAction("");
        fetchPosts();
      }
    } catch (err) {
      alert("Bulk action failed");
    }
  };

  const deletePost = async (id: string) => {
    if (statusFilter === 'trash') {
      if (!confirm("Are you sure you want to permanently delete this post?")) return;
      try {
        const res = await fetch(`/api/admin/blog/posts/${id}`, { method: "DELETE" });
        if (res.ok) {
          fetchPosts();
        } else {
          const error = await res.json();
          alert("Delete failed: " + (error.error || "Unknown error"));
        }
      } catch (err) {
        alert("Delete failed due to network error");
      }
    } else {
      try {
        const res = await fetch(`/api/admin/blog/posts/${id}`, {
          method: "PATCH",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isTrashed: true })
        });
        if (res.ok) {
          fetchPosts();
        }
      } catch (err) {
        alert("Moving to trash failed");
      }
    }
  };

  const restorePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`, {
        method: "PATCH",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTrashed: false })
      });
      if (res.ok) {
        fetchPosts();
      }
    } catch (err) {
      alert("Restore failed");
    }
  };

  const duplicatePost = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/blog/posts/duplicate/${id}`, { method: "POST" });
      if (res.ok) {
        fetchPosts();
      } else {
        const error = await res.json();
        alert("Duplication failed: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert("Duplication failed due to network error");
    }
  };

  const handleQuickEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/blog/posts/${editingPost._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingPost.title,
          slug: editingPost.slug,
          status: editingPost.status
        })
      });
      if (res.ok) {
        setEditingPost(null);
        fetchPosts();
      } else {
        const error = await res.json();
        alert("Update failed: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">Posts</h1>
          <Link href="/admin/blog/new" className="bg-white border border-[#2271b1] text-[#2271b1] text-[13px] px-2 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] transition-colors">Add New</Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 text-[13px]">
        <div className="flex items-center gap-2 text-[#2271b1]">
          <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'text-[#1d2327] font-bold' : ''}`}>All ({posts.filter(p => !p.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter('published')} className={`${statusFilter === 'published' ? 'text-[#1d2327] font-bold' : ''}`}>Published ({posts.filter(p => p.status === 'published' && !p.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter('draft')} className={`${statusFilter === 'draft' ? 'text-[#1d2327] font-bold' : ''}`}>Drafts ({posts.filter(p => p.status === 'draft' && !p.isTrashed).length})</button>
          <span className="text-[#c3c4c7]">|</span>
          <button onClick={() => setStatusFilter('trash')} className={`${statusFilter === 'trash' ? 'text-[#d63638] font-bold' : 'text-[#d63638]'}`}>Trash ({posts.filter(p => p.isTrashed).length || 0})</button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search posts..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white border border-[#8c8f94] px-2 py-1 rounded-[3px] w-48 outline-none focus:border-[#2271b1]"
            />
          </div>
          <button className="bg-white border border-[#8c8f94] px-3 py-1 rounded-[3px] hover:bg-[#f6f7f7]">Search Posts</button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <select 
          value={bulkAction} 
          onChange={(e) => setBulkAction(e.target.value)}
          className="bg-white border border-[#8c8f94] px-2 py-1 text-[13px] rounded-[3px] outline-none"
        >
          <option value="">Bulk Actions</option>
          {statusFilter === 'trash' ? (
            <>
              <option value="restore">Restore</option>
              <option value="delete">Delete Permanently</option>
            </>
          ) : (
            <>
              <option value="status-published">Move to Published</option>
              <option value="status-draft">Move to Draft</option>
              <option value="delete">Move to Trash</option>
            </>
          )}
        </select>
        <button 
          onClick={handleBulkAction}
          disabled={!bulkAction || selectedPosts.length === 0}
          className="bg-white border border-[#8c8f94] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] disabled:opacity-50"
        >
          Apply
        </button>
      </div>

      <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-[#c3c4c7] text-[13px] font-bold text-[#1d2327]">
              <th className="px-3 py-2 w-10 text-center">
                <input 
                  type="checkbox" 
                  checked={selectedPosts.length > 0 && selectedPosts.length === filteredPosts.length}
                  onChange={toggleSelectAll}
                />
              </th>
              <th className="px-3 py-2">Title</th>
              <th className="px-3 py-2">Author</th>
              <th className="px-3 py-2">Categories</th>
              <th className="px-3 py-2">Tags</th>
              <th className="px-3 py-2 w-32"><Calendar className="w-3.5 h-3.5 inline mr-1" /> Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-10 text-center text-[#646970]">Loading posts...</td></tr>
            ) : filteredPosts.length === 0 ? (
              <tr><td colSpan={6} className="p-10 text-center text-[#646970]">No posts found.</td></tr>
            ) : filteredPosts.map((post) => (
              <tr key={post._id} className={`border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group text-[13px] text-[#2c3338] ${selectedPosts.includes(post._id) ? "bg-[#f0f6fb]" : ""}`}>
                <td className="px-3 py-4 text-center">
                  <input 
                    type="checkbox" 
                    checked={selectedPosts.includes(post._id)}
                    onChange={() => toggleSelectPost(post._id)}
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-start gap-3">
                    {post.featuredImage && (
                      <div className="w-12 h-12 rounded border border-[#c3c4c7] overflow-hidden flex-shrink-0">
                        <img src={post.featuredImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      <Link href={`/admin/blog/${post._id}`} className="text-[#2271b1] font-bold hover:text-[#135e96] block mb-1">
                        {post.title} {post.status === 'draft' && <span className="text-[#646970] font-normal">— Draft</span>}
                      </Link>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/blog/${post._id}`} className="text-[#2271b1] hover:text-[#135e96]">Edit</Link>
                        <span className="text-[#c3c4c7]">|</span>
                        <button onClick={() => setEditingPost(post)} className="text-[#2271b1] hover:text-[#135e96]">Quick Edit</button>
                        <span className="text-[#c3c4c7]">|</span>
                        {post.isTrashed ? (
                          <>
                            <button onClick={() => restorePost(post._id)} className="text-[#2271b1] hover:text-[#135e96]">Restore</button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button onClick={() => deletePost(post._id)} className="text-[#d63638] hover:text-[#b32d2e]">Delete Permanently</button>
                          </>
                        ) : (
                          <button onClick={() => deletePost(post._id)} className="text-[#d63638] hover:text-[#b32d2e]">Trash</button>
                        )}
                        <span className="text-[#c3c4c7]">|</span>
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-[#2271b1] hover:text-[#135e96]">View</Link>
                        <span className="text-[#c3c4c7]">|</span>
                        <button onClick={() => duplicatePost(post._id)} className="text-[#2271b1] hover:text-[#135e96]">Duplicate</button>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-[#2271b1]">{post.author?.username || 'admin'}</td>
                <td className="px-3 py-4 text-[#2271b1]">
                  {post.categories?.map((c: any) => c.name).join(', ') || '—'}
                </td>
                <td className="px-3 py-4 text-[#2271b1]">
                  {post.tags?.map((t: any) => t.name).join(', ') || '—'}
                </td>
                <td className="px-3 py-4">
                  <div className="text-[12px]">
                    <span className="block text-[#646970]">{post.status === 'published' ? 'Published' : 'Last Modified'}</span>
                    <span className="block">{new Date(post.updatedAt).toLocaleDateString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quick Edit Modal */}
      {editingPost && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white border border-[#c3c4c7] shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-[#f6f7f7] border-b border-[#c3c4c7] px-4 py-3 flex items-center justify-between">
              <h2 className="text-[14px] font-bold">Quick Edit</h2>
              <button onClick={() => setEditingPost(null)} className="text-[#646970] hover:text-[#d63638]">×</button>
            </div>
            <form onSubmit={handleQuickEditSave} className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#1d2327]">Title</label>
                  <input 
                    type="text" 
                    value={editingPost.title}
                    onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                    className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#1d2327]">Slug</label>
                  <input 
                    type="text" 
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="w-full border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-1 w-48">
                  <label className="block text-[12px] font-semibold text-[#1d2327]">Status</label>
                  <select 
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value })}
                    className="w-full bg-white border border-[#8c8f94] px-3 py-1.5 text-[13px] outline-none focus:border-[#2271b1]"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div className="bg-[#f6f7f7] -mx-4 -mb-4 px-4 py-3 flex items-center justify-end gap-3 border-t border-[#c3c4c7]">
                <button type="button" onClick={() => setEditingPost(null)} className="text-[#2271b1] text-[13px] hover:text-[#135e96]">Cancel</button>
                <button type="submit" className="bg-[#2271b1] text-white text-[13px] font-bold px-4 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]">Update</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
