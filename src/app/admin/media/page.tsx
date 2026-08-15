"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, Search, Trash2, X, ChevronRight, Loader2,
  Image as ImageIcon, Grid, List, Check, Edit3,
  Download, ExternalLink, Info, FileText, Calendar, HardDrive, Plus, RefreshCw, Filter
} from "lucide-react";

export default function MediaDashboard() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      setMedia(data);
    } catch (err) {
      console.error("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append('file', files[i]);
      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        if (res.ok) {
          const newItem = await res.json();
          setMedia(prev => [newItem, ...prev]);
        }
      } catch (err) {
        console.error("Upload failed");
      }
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUpdateMetadata = async () => {
    if (!editingItem) return;
    try {
      const res = await fetch(`/api/admin/media/${editingItem._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: editingItem.alt, title: editingItem.title, description: editingItem.description })
      });
      if (res.ok) {
        const updated = await res.json();
        setMedia(prev => prev.map(m => m._id === updated._id ? updated : m));
        setEditingItem(null);
      }
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async (ids: string[]) => {
    if (!confirm(`Permanently delete ${ids.length} items?`)) return;
    try {
      const res = await fetch("/api/admin/media", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids }) });
      if (res.ok) {
        setMedia(prev => prev.filter(m => !ids.includes(m._id)));
        setSelectedIds([]);
        if (editingItem && ids.includes(editingItem._id)) setEditingItem(null);
      }
    } catch (err) { alert("Delete failed"); }
  };

  const filteredMedia = media.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.alt?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading Media...</div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Media Library</h1>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-3 py-1 text-[13px] rounded-[3px] transition-colors"
        >
          {uploading ? "Uploading..." : "Add New"}
        </button>
        <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
      </div>

      {/* WP Toolbar Area */}
      <div className="flex items-center justify-between gap-4 py-2">
         <div className="flex items-center gap-2">
            <div className="flex border border-[#8c8f94] rounded-[3px] overflow-hidden">
               <button onClick={() => setViewMode('grid')} className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#f0f0f1] text-black shadow-inner' : 'bg-white text-[#2c3338] hover:bg-[#f6f7f7]'}`}>
                  <Grid className="w-4 h-4" />
               </button>
               <button onClick={() => setViewMode('list')} className={`p-1.5 border-l border-[#8c8f94] ${viewMode === 'list' ? 'bg-[#f0f0f1] text-black shadow-inner' : 'bg-white text-[#2c3338] hover:bg-[#f6f7f7]'}`}>
                  <List className="w-4 h-4" />
               </button>
            </div>
            
            <select className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px]">
               <option>All media items</option>
               <option>Images</option>
               <option>Unattached</option>
            </select>

            <select className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px]">
               <option>All dates</option>
            </select>

            <button onClick={() => setSelectedIds([])} className={`text-[13px] text-[#2271b1] hover:text-[#135e96] ${selectedIds.length > 0 ? 'visible' : 'invisible'}`}>
               Bulk select
            </button>
         </div>

         <div className="flex items-center gap-2">
            <label className="text-[13px] text-[#2c3338]">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
            />
         </div>
      </div>

      {/* Media Grid / List */}
      <div className="min-h-[400px]">
         {filteredMedia.length === 0 ? (
           <div className="bg-white border border-[#c3c4c7] p-8 text-center text-[#50575e] text-[13px]">
              No media items found.
           </div>
         ) : viewMode === 'grid' ? (
           <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {filteredMedia.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setEditingItem(item)}
                  className={`relative aspect-square border-2 cursor-pointer group bg-[#f0f0f1] ${selectedIds.includes(item._id) ? 'border-[#2271b1]' : 'border-transparent hover:border-[#2271b1]'}`}
                >
                   <img src={item.url} className="w-full h-full object-cover" alt={item.alt} />
                   {selectedIds.includes(item._id) && (
                     <div className="absolute top-1 right-1 bg-[#2271b1] text-white p-0.5 rounded-sm">
                        <Check className="w-3 h-3" />
                     </div>
                   )}
                </div>
              ))}
           </div>
         ) : (
           <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="border-b border-[#c3c4c7] text-[#1d2327] bg-white">
                       <th className="w-8 py-2 px-3"><input type="checkbox" className="w-4 h-4" /></th>
                       <th className="py-2 px-3 text-[14px] font-semibold">File</th>
                       <th className="py-2 px-3 text-[14px] font-semibold">Author</th>
                       <th className="py-2 px-3 text-[14px] font-semibold">Uploaded to</th>
                       <th className="py-2 px-3 text-[14px] font-semibold">Date</th>
                    </tr>
                 </thead>
                 <tbody className="text-[13px] text-[#2c3338]">
                    {filteredMedia.map((item, idx) => (
                       <tr key={item._id} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                          <td className="py-2 px-3 align-top"><input type="checkbox" className="w-4 h-4" /></td>
                          <td className="py-2 px-3 align-top flex gap-3">
                             <div className="w-12 h-12 bg-[#f0f0f1] border border-[#c3c4c7] shrink-0">
                                <img src={item.url} className="w-full h-full object-cover" />
                             </div>
                             <div>
                                <strong className="text-[#2271b1] block">{item.name}</strong>
                                <span className="text-[#646970] text-[12px]">{item.type.split('/')[1].toUpperCase()}</span>
                                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => setEditingItem(item)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                                   <span className="text-[#a7aaad]">|</span>
                                   <button onClick={() => handleDelete([item._id])} className="text-[#d63638] hover:underline text-[12px]">Delete Permanently</button>
                                   <span className="text-[#a7aaad]">|</span>
                                   <button className="text-[#2271b1] hover:underline text-[12px]">View</button>
                                </div>
                             </div>
                          </td>
                          <td className="py-2 px-3 align-top text-[#2271b1] underline underline-offset-2">Admin</td>
                          <td className="py-2 px-3 align-top text-[#646970]">(Unattached)</td>
                          <td className="py-2 px-3 align-top text-[#646970]">{new Date(item.createdAt).toLocaleDateString()}</td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
         )}
      </div>

      {/* WP-Style Attachment Details Modal */}
      <AnimatePresence>
         {editingItem && (
           <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingItem(null)} className="absolute inset-0 bg-[#000000cc]" />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="relative w-full max-w-6xl h-[90vh] bg-white border border-[#c3c4c7] shadow-2xl flex flex-col lg:flex-row overflow-hidden"
              >
                 <button onClick={() => setEditingItem(null)} className="absolute top-2 right-2 z-10 p-2 bg-[#f6f7f7] hover:bg-[#d63638] hover:text-white border border-[#c3c4c7] rounded-sm transition-colors">
                    <X className="w-5 h-5" />
                 </button>

                 {/* Left: Preview */}
                 <div className="flex-1 bg-[#f0f0f1] flex items-center justify-center p-8 overflow-hidden">
                    <img src={editingItem.url} className="max-w-full max-h-full object-contain shadow-md" />
                 </div>

                 {/* Right: Metadata Panel */}
                 <div className="w-full lg:w-80 bg-[#f6f7f7] border-l border-[#c3c4c7] p-4 overflow-y-auto space-y-6">
                    <div className="space-y-1">
                       <h2 className="text-[18px] font-bold text-[#1d2327]">Attachment Details</h2>
                       <p className="text-[12px] text-[#646970] font-medium border-b border-[#c3c4c7] pb-4 mb-4">
                          Uploaded on: {new Date(editingItem.createdAt).toLocaleDateString()}<br/>
                          File name: {editingItem.name}<br/>
                          File type: {editingItem.type}<br/>
                          File size: {formatSize(editingItem.size)}
                       </p>
                    </div>

                    <div className="space-y-4 text-[13px]">
                       <div className="space-y-1">
                          <label className="font-semibold block">Alt Text</label>
                           <textarea
                             value={editingItem.alt || ""}
                             onChange={(e) => setEditingItem({ ...editingItem, alt: e.target.value })}
                             className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-sm rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
                             rows={2}
                           />
                          <p className="text-[11px] text-[#646970]">Describe the purpose of the image. Leave empty if decorative.</p>
                       </div>

                       <div className="space-y-1">
                          <label className="font-semibold block">Title</label>
                           <input
                             type="text"
                             value={editingItem.title || ""}
                             onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                             className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-sm rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
                           />
                       </div>

                       <div className="space-y-1">
                          <label className="font-semibold block">Caption</label>
                           <textarea
                             className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-sm rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
                             rows={2}
                           />
                       </div>

                       <div className="space-y-1">
                          <label className="font-semibold block">Description</label>
                           <textarea
                             value={editingItem.description || ""}
                             onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                             className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-sm rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
                             rows={3}
                           />
                       </div>

                       <div className="space-y-1 pt-4 border-t border-[#c3c4c7]">
                          <label className="font-semibold block">File URL:</label>
                          <div className="flex gap-1">
                             <input readOnly value={editingItem.url} className="flex-1 bg-[#f0f0f1] border border-[#c3c4c7] px-2 py-1 text-[11px] rounded-[3px]" />
                             <button onClick={() => { navigator.clipboard.writeText(editingItem.url); alert("URL Copied!"); }} className="bg-white border border-[#8c8f94] px-2 text-[11px] hover:bg-[#f6f7f7] rounded-[3px]">Copy</button>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 flex flex-col gap-2">
                       <button onClick={handleUpdateMetadata} className="bg-[#2271b1] text-white py-1.5 px-4 rounded-[3px] font-bold hover:bg-[#135e96] transition-colors">Save Details</button>
                       <button onClick={() => handleDelete([editingItem._id])} className="text-[#d63638] text-[13px] underline hover:no-underline">Delete Permanently</button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>
    </div>
  );
}
