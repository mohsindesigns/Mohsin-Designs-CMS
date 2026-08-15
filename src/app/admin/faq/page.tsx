"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Loader2, CircleHelp, Save, X, ChevronRight, Globe, Layers, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), { 
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

function stripHtml(html: string) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
}


export default function FAQAdminPage() {
  const [data, setData] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");

  const [form, setForm] = useState<any>({
    question: "",
    answer: "",
    category: "",
    visibility: "global",
    targetPages: []
  });

  const [availablePages, setAvailablePages] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/content").then(res => res.json()),
      fetch("/api/admin/pages").then(res => res.json())
    ]).then(([contentJson, pagesJson]) => {
        setData(contentJson);
        setFaqs(contentJson.faq?.items || []);
        const rawCats = contentJson.faq?.categories || ["General", "Services", "Pricing"];
        setCategories(rawCats.map((cat: any) => typeof cat === 'string' ? cat : (cat.label || cat.id)));

        // Process pages and services
        const staticPages = [
          { id: "home", label: "Homepage" },
          { id: "about", label: "About" },
          { id: "services", label: "Services" },
          { id: "gallery", label: "Gallery" },
          { id: "reviews", label: "Reviews" },
          { id: "faq", label: "FAQ" },
          { id: "contact", label: "Contact" }
        ];

        const dbPages = (pagesJson || []).filter((p: any) => p.status === 'published').map((p: any) => ({
          id: p.slug,
          label: p.title
        }));

        const services = (contentJson.services?.services || contentJson.services || [])
          .filter((s: any) => s.published !== false)
          .map((s: any) => ({
            id: `services/${s.slug}`,
            label: `Service: ${s.title}`
          }));

        setAvailablePages([...staticPages, ...dbPages, ...services]);
      });
  }, []);

  const saveToDb = async (updatedFaqs: any[], updatedCategories: string[]) => {
    setSaving(true);
    const updatedData = { ...data, faq: { ...data.faq, items: updatedFaqs, categories: updatedCategories } };
    try {
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updatedData) });
      if (res.ok) {
        setData(updatedData);
        setFaqs(updatedFaqs);
        setCategories(updatedCategories);
        setToast({ type: "ok", msg: "FAQ updated." });
        setTimeout(() => setToast(null), 3000);
        setIsEditing(null);
      }
    } catch {
      setToast({ type: "err", msg: "Error saving." });
    } finally { setSaving(false); }
  };

  const handleSaveFAQ = () => {
    if (!form.question || !form.answer) return alert("Question and Answer are required.");



    const newFaqs = [...faqs];
    if (isEditing !== null && isEditing < faqs.length) newFaqs[isEditing] = { ...form };
    else newFaqs.push({ ...form });
    saveToDb(newFaqs, categories);
  };

  const handleEdit = (idx: number) => {
    setIsEditing(idx);
    const item = faqs[idx];
    setForm({
      ...item,
      targetPages: Array.isArray(item.targetPages) ? item.targetPages : []
    });
  };

  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">FAQs</h1>
        {isEditing === null && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(faqs.length);
                setForm({ question: "", answer: "", category: categories[0] || "General", visibility: "global", targetPages: [] });
              }}
              className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
            >
              Add New
            </button>
            <button
              onClick={() => setShowCategoryManager(true)}
              className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
            >
              Manage Categories
            </button>
          </div>
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
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">Question</label>
                        <RichTextEditor 
                          content={form.question} 
                          onChange={(val) => setForm({ ...form, question: val })} 
                          placeholder="Enter question here"
                        />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[13px] font-bold">Answer</label>
                        <RichTextEditor 
                          content={form.answer} 
                          onChange={(val) => setForm({ ...form, answer: val })} 
                        />
                     </div>
                  </div>
              </div>
           </div>

           <div className="lg:col-span-1 space-y-6 sticky top-4">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                 <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                    <h2 className="text-[14px] font-semibold text-[#1d2327]">Settings</h2>
                 </div>
                 <div className="p-4 space-y-4">
                    <div className="space-y-1">
                       <label className="text-[13px] font-bold">Category</label>
                       <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[14px] rounded-[3px]">
                          {categories.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <label className="text-[13px] font-bold">Visibility</label>
                       <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[13px]">
                             <input type="radio" checked={form.visibility === 'global'} onChange={() => setForm({...form, visibility: 'global'})} /> Global
                          </label>
                          <label className="flex items-center gap-2 text-[13px]">
                             <input type="radio" checked={form.visibility === 'specific'} onChange={() => setForm({...form, visibility: 'specific'})} /> Specific Pages
                          </label>
                       </div>
                    </div>
                    {form.visibility === 'specific' && (
                       <div className="pt-2 border-t border-[#f0f0f1] space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {availablePages.map(p => {
                             const isChecked = Array.isArray(form.targetPages) && form.targetPages.includes(p.id);
                             return (
                               <label key={p.id} className="flex items-center gap-2 text-[12px] hover:text-[#2271b1] cursor-pointer py-0.5">
                                  <input type="checkbox" checked={isChecked} onChange={() => {
                                     const currentPages = Array.isArray(form.targetPages) ? form.targetPages : [];
                                     const nt = currentPages.includes(p.id) ? currentPages.filter((x: string) => x !== p.id) : [...currentPages, p.id];
                                     setForm({...form, targetPages: nt});
                                  }} /> {p.label}
                               </label>
                             );
                          })}
                       </div>
                    )}
                 </div>
                 <div className="px-3 py-2 bg-[#f6f7f7] border-t border-[#c3c4c7] flex justify-between items-center">
                    <button onClick={() => setIsEditing(null)} className="text-[#d63638] underline text-[13px]">Cancel</button>
                    <button onClick={handleSaveFAQ} disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold border border-[#2271b1] hover:bg-[#135e96]">
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
                    <th className="py-2 px-3 text-[14px] font-semibold">Question</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-48">Category</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-40">Visibility</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                 {faqs.map((faq, idx) => (
                    <tr key={idx} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                       <td className="py-4 px-3 align-top"><input type="checkbox" className="w-4 h-4 border-[#8c8f94] rounded-[3px]" /></td>
                       <td className="py-4 px-3 align-top">
                          <strong className="text-[#2271b1] block text-[14px]">{stripHtml(faq.question)}</strong>
                          <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(idx)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                             <span className="text-[#a7aaad]">|</span>
                             <button onClick={() => { if(confirm("Delete?")) saveToDb(faqs.filter((_,i)=>i!==idx), categories); }} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                          </div>
                       </td>
                       <td className="py-4 px-3 align-top text-[#50575e] font-bold text-[11px] uppercase">{faq.category}</td>
                       <td className="py-4 px-3 align-top capitalize text-[#50575e]">{faq.visibility}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
        </div>
      )}
      {/* Category Manager Modal */}
      <AnimatePresence>
        {showCategoryManager && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCategoryManager(false)} className="absolute inset-0 bg-[#00000066]" />
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-md bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Manage Categories</h2>
                <button onClick={() => setShowCategoryManager(false)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 bg-[#f0f0f1] space-y-4">
                {/* Add New Category */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    className="flex-1 border border-[#8c8f94] bg-white px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = newCategory.trim();
                      if (!trimmed) return;
                      if (categories.includes(trimmed)) return alert("Category already exists.");
                      const updated = [...categories, trimmed];
                      saveToDb(faqs, updated);
                      setNewCategory("");
                    }}
                    className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-[3px] border border-[#2271b1] hover:bg-[#135e96]"
                  >
                    Add
                  </button>
                </div>

                {/* Categories List */}
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] max-h-60 overflow-y-auto divide-y divide-[#f0f0f1]">
                  {categories.map((cat) => (
                    <div key={cat} className="flex items-center justify-between px-3 py-2 text-[13px]">
                      <span>{cat}</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete the category "${cat}"? Questions in this category will need to be re-assigned.`)) {
                            const updated = categories.filter((c) => c !== cat);
                            saveToDb(faqs, updated);
                          }
                        }}
                        className="text-[#d63638] hover:underline flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  ))}
                  {categories.length === 0 && (
                    <div className="p-3 text-[#8c8f94] text-center italic">No categories found.</div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                <button type="button" onClick={() => setShowCategoryManager(false)} className="bg-white border border-[#8c8f94] text-[#2c3338] text-[13px] px-4 py-1.5 rounded-[3px] hover:bg-[#f6f7f7]">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
