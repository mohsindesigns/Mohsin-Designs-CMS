"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Search, Upload, Check, Loader2, 
  Image as ImageIcon, Plus, Info
} from "lucide-react";

interface MediaSelectorProps {
  onSelect: (item: any) => void;
  onClose: () => void;
  title?: string;
}

export default function MediaSelector({ onSelect, onClose, title = "Select Asset" }: MediaSelectorProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [uploading, setUploading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
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

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const res = await fetch("/api/admin/media", {
        method: "POST",
        body: formData
      });
      if (res.ok) {
        const newItem = await res.json();
        // Update local media list
        setMedia(prev => [newItem, ...prev]);
        // Switch to library tab and select the new item
        setActiveTab('library');
        setSelectedItem(newItem);
      }
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const filteredMedia = media.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.alt?.toLowerCase().includes(search.toLowerCase()) ||
    m.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-0 md:p-10">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative w-full max-w-6xl h-full md:h-[90vh] bg-white shadow-2xl flex flex-col border border-[#c3c4c7]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#c3c4c7] bg-white shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-[18px] font-bold text-[#1d2327]">{title}</h2>
            <div className="flex items-center border-b border-transparent translate-y-[13px]">
              {(['upload', 'library'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 text-[14px] transition-all border-b-2 ${
                    activeTab === tab
                      ? "border-[#2271b1] text-[#2271b1] font-bold"
                      : "border-transparent text-[#2271b1] hover:text-[#135e96]"
                  }`}
                >
                  {tab === 'library' ? 'Media Library' : 'Upload Files'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={onClose} className="text-[#646970] hover:text-[#1d2327]">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'library' && (
              <div className="px-4 py-3 border-b border-[#c3c4c7] flex items-center justify-between bg-[#f6f7f7]">
                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#646970]" />
                  <input
                    type="text"
                    placeholder="Search media items..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-white border border-[#c3c4c7] rounded-sm pl-9 pr-3 py-1 text-[13px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                  />
                </div>
                <div className="text-[12px] text-[#646970] font-medium">
                  {filteredMedia.length} items
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {activeTab === 'library' ? (
                loading ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#2271b1]" />
                    <p className="text-[13px] text-[#646970]">Loading media library...</p>
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 py-20">
                    <p className="text-[14px] text-[#646970]">No media items found.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                    {filteredMedia.map((item) => (
                      <div
                        key={String(item._id)}
                        onClick={() => setSelectedItem(item)}
                        onDoubleClick={() => {
                          onSelect(item);
                          onClose();
                        }}
                        className={`relative aspect-square cursor-pointer border-2 transition-all group overflow-hidden ${
                          selectedItem && String(selectedItem._id) === String(item._id)
                            ? "border-[#2271b1] ring-2 ring-[#2271b1] ring-inset" 
                            : "border-[#dcdcde] hover:border-[#c3c4c7]"
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.alt || item.name}
                          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                            selectedItem && String(selectedItem._id) === String(item._id) ? "opacity-90" : ""
                          }`}
                        />
                        {selectedItem && String(selectedItem._id) === String(item._id) && (
                          <div className="absolute inset-0 bg-[#2271b1]/10 flex items-center justify-center">
                            <div className="bg-[#2271b1] p-1.5 rounded-full shadow-lg">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* ── Upload Tab ── */
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="border-4 border-dashed border-[#c3c4c7] p-20 flex flex-col items-center gap-6 max-w-xl w-full">
                    {uploading ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-[#2271b1]" />
                        <p className="text-[16px] font-bold text-[#1d2327]">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center space-y-2">
                          <h3 className="text-[20px] font-medium text-[#1d2327]">Drop files to upload</h3>
                          <p className="text-[14px] text-[#646970]">or</p>
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] px-6 py-2 rounded-sm hover:bg-[#f0f0f1] transition-colors text-[13px] font-medium"
                        >
                          Select Files
                        </button>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={fileInputRef}
                          onChange={handleDirectUpload}
                        />
                        <p className="text-[12px] text-[#646970] mt-10">Maximum upload file size: 64 MB.</p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          {activeTab === 'library' && (
            <div className="w-[280px] border-l border-[#c3c4c7] bg-[#f6f7f7] overflow-y-auto p-4 hidden md:block">
              <h3 className="text-[12px] font-bold text-[#646970] uppercase mb-4 tracking-wider">Attachment Details</h3>
              {selectedItem ? (
                <div className="space-y-4">
                  <div className="aspect-square bg-white border border-[#c3c4c7] p-2">
                    <img src={selectedItem.url} alt="" className="w-full h-full object-contain" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[13px] font-bold text-[#1d2327] truncate">{selectedItem.name}</p>
                    <p className="text-[11px] text-[#646970]">{new Date(selectedItem.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="pt-4 border-t border-[#c3c4c7] space-y-4">
                     <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#646970] uppercase">Alt Text</label>
                        <div className="flex flex-col gap-1">
                          <input 
                            type="text" 
                            value={selectedItem.alt || ""} 
                            onChange={(e) => {
                              const newAlt = e.target.value;
                              // Update local state for immediate feedback
                              setSelectedItem({ ...selectedItem, alt: newAlt });
                              setMedia(prev => prev.map(m => m._id === selectedItem._id ? { ...m, alt: newAlt } : m));
                              
                              // Debounced save
                              if ((window as any).mediaDebounce) clearTimeout((window as any).mediaDebounce);
                              (window as any).mediaDebounce = setTimeout(async () => {
                                try {
                                  await fetch("/api/admin/media", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ id: selectedItem._id, alt: newAlt })
                                  });
                                } catch (err) {
                                  console.error("Failed to save alt text");
                                }
                              }, 500);
                            }}
                            className="w-full bg-white border border-[#c3c4c7] px-2 py-1 text-[12px] outline-none focus:border-[#2271b1]" 
                            placeholder="Describe this image..."
                          />
                          <p className="text-[10px] text-[#646970] italic">Changes are saved automatically.</p>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#646970] uppercase">File URL</label>
                        <input type="text" readOnly value={selectedItem.url} className="w-full bg-[#f0f0f1] border border-[#c3c4c7] px-2 py-1 text-[11px] outline-none" />
                     </div>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-[#646970] italic">Select an image to view details.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[#c3c4c7] bg-white flex justify-end items-center shrink-0">
          <div className="flex items-center gap-4">
            {selectedItem && activeTab === 'library' && (
              <button
                onClick={() => { onSelect(selectedItem); onClose(); }}
                className="bg-[#2271b1] text-white text-[13px] px-6 py-1.5 rounded-sm hover:bg-[#135e96] transition-colors font-medium"
              >
                Select
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
