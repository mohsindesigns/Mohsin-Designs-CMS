"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, Star, Image as ImageIcon, ChevronRight, Save, X, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

export default function ReviewsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Form State
  const [form, setForm] = useState({
    name: "",
    position: "",
    company: "",
    text: "",
    avatar: "",
    rating: 5,
    videoId: ""
  });

  useEffect(() => {
    fetch("/api/content").then(res => res.json()).then(json => {
        setData(json);
        setTestimonials(json.testimonials?.testimonials || []);
      });
  }, []);

  const saveToDb = async (newTestimonials: any[]) => {
    setSaving(true);
    const updatedData = { ...data, testimonials: { ...data.testimonials, testimonials: newTestimonials } };
    try {
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedData) });
      if (res.ok) {
        setData(updatedData);
        setTestimonials(newTestimonials);
        setToast({ type: "ok", msg: "Reviews updated." });
        setTimeout(() => setToast(null), 3000);
        setIsEditing(null);
      }
    } catch {
      setToast({ type: "err", msg: "Error saving." });
    } finally { setSaving(false); }
  };

  const handleSaveTestimonial = () => {
    if (!form.name || !form.text) return alert("Name and review text are required!");
    const newTestimonials = [...testimonials];
    if (isEditing !== null && isEditing < testimonials.length) newTestimonials[isEditing] = { ...form };
    else newTestimonials.push({ ...form });
    saveToDb(newTestimonials);
  };

  const handleEdit = (idx: number) => {
    setIsEditing(idx);
    setForm(testimonials[idx]);
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  return (
    <div className="space-y-4">
      {/* WP Header Area */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Reviews</h1>
        {isEditing === null && (
          <button
            onClick={() => {
              setIsEditing(testimonials.length);
              setForm({ name: "", position: "", company: "", text: "", avatar: "", rating: 5, videoId: "" });
            }}
            className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
          >
            Add New Review
          </button>
        )}
      </div>

      {toast && (
        <div className={`px-4 py-2 border-l-4 text-[13px] bg-white shadow-sm mb-4 ${toast.type === 'ok' ? 'border-[#00a32a]' : 'border-[#d63638]'}`}>
          {toast.msg}
        </div>
      )}

      {isEditing !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6">
                 <input
                   type="text"
                   value={form.name}
                   onChange={(e) => setForm({ ...form, name: e.target.value })}
                   className="w-full border border-[#8c8f94] px-3 py-2 text-[18px] font-medium rounded-[3px] focus:border-[#2271b1] outline-none mb-4"
                   placeholder="Enter reviewer name"
                 />
                 
                 <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold">Position</label>
                          <input type="text" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. CEO" />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold">Company / City</label>
                          <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="e.g. Austin, TX" />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[13px] font-bold">Review Text</label>
                       <RichTextEditor 
                         content={form.text} 
                         onChange={(val) => setForm({ ...form, text: val })} 
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold">Rating (1-5)</label>
                          <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[14px] rounded-[3px]">
                             {[1,2,3,4,5].map(r => <option key={r} value={r}>{r} Stars</option>)}
                          </select>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[13px] font-bold">YouTube Video ID</label>
                          <input type="text" value={form.videoId} onChange={(e) => setForm({ ...form, videoId: e.target.value })} className="w-full border border-[#8c8f94] px-3 py-1.5 text-[14px] rounded-[3px]" placeholder="Optional" />
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-1 space-y-6 sticky top-4">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                 <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                    <h2 className="text-[14px] font-semibold text-[#1d2327]">Publish</h2>
                 </div>
                 <div className="p-4 space-y-3">
                    <ImageField label="Reviewer Photo" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} />
                 </div>
                 <div className="px-3 py-2 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-between items-center">
                    <button onClick={() => setIsEditing(null)} className="text-[#d63638] underline text-[13px]">Cancel</button>
                    <button onClick={handleSaveTestimonial} disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold hover:bg-[#135e96]">
                       {saving ? "Saving..." : "Update"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-hidden">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-[#c3c4c7] bg-white text-[#1d2327]">
                    <th className="w-8 py-2 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></th>
                    <th className="py-2 px-3 text-[14px] font-semibold">Reviewer</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-64">Text Snippet</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-24">Rating</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-32">Date</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                 {testimonials.map((test, idx) => (
                    <tr key={idx} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                       <td className="py-4 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></td>
                       <td className="py-4 px-3 align-top">
                          <div className="flex gap-3">
                             <div className="w-10 h-10 bg-[#f0f0f1] border border-[#c3c4c7] rounded-[3px] flex items-center justify-center shrink-0 overflow-hidden">
                                {test.avatar ? <img src={test.avatar} className="w-full h-full object-cover" /> : <Quote className="w-4 h-4 text-[#8c8f94]" />}
                             </div>
                             <div>
                                <strong className="text-[#2271b1] block text-[14px]">{test.name}</strong>
                                <span className="text-[#646970]">{test.position} @ {test.company}</span>
                                <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => handleEdit(idx)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                                   <span className="text-[#a7aaad]">|</span>
                                   <button onClick={() => { if(confirm("Delete?")) saveToDb(testimonials.filter((_,i)=>i!==idx)); }} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                                </div>
                             </div>
                          </div>
                       </td>
                       <td className="py-4 px-3 align-top text-[#50575e] italic line-clamp-2">"{test.text}"</td>
                       <td className="py-4 px-3 align-top">
                          <div className="flex items-center text-amber-500 font-bold">{test.rating || 5} <Star className="w-3 h-3 fill-current ml-1" /></div>
                       </td>
                       <td className="py-4 px-3 align-top text-[#50575e]">Oct 24, 2024</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
    </div>
  );
}
