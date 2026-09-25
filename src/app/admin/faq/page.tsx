"use client";

import { useState, useEffect } from "react";
import { X, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

function stripHtml(html: string) {
  if (!html) return "";
  return html
    .replace(/<\/(p|div|li|h[1-6])>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// ---------------------------------------------------------------------------
// Categories. The site content stores them as [{ id, label, icon }] (seed data and the FAQ page editor);
// this manager used to flatten them to plain strings on every save (dropping id/icon) and listed the
// "All Questions" pseudo-category as an assignable category. They are now kept as objects end to end, and
// a plain-string list (older saves) is still understood.
// ---------------------------------------------------------------------------
type Cat = { id: string; label: string; [k: string]: any };

const slugify = (s: string) =>
  String(s ?? "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const toCats = (raw: any): Cat[] =>
  (Array.isArray(raw) ? raw : [])
    .map((c: any) => (typeof c === "string" ? { id: slugify(c), label: c } : { ...c, id: c?.id ?? slugify(c?.label), label: String(c?.label ?? c?.id ?? "") }))
    .filter((c: Cat) => c.label.trim());

const isAllCat = (c: Cat) => slugify(c.id) === "all" || slugify(c.label) === "all-questions";

// Only these templates read the global FAQ library (SiteContent.faq.items) and honour an item's
// "specific pages" rule: Home (HomeTemplate), Services (ServicesTemplate) and FAQ (FAQTemplate).
const GLOBAL_FAQ_TEMPLATES = new Set(["home", "services", "faq"]);

export default function FAQAdminPage() {
  const [data, setData] = useState<any>(null);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [categories, setCategories] = useState<Cat[]>([]);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  // If the library could not be read, never show an empty editor: saving from it would overwrite the stored FAQ list.
  const [loadError, setLoadError] = useState(false);

  const [form, setForm] = useState<any>({
    question: "",
    answer: "",
    category: "",
    visibility: "global",
    targetPages: []
  });

  const [availablePages, setAvailablePages] = useState<any[]>([]);

  const showToast = (type: "ok" | "err", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), type === "err" ? 6000 : 3000);
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/content", { cache: "no-store" }).then(res => { if (!res.ok) throw new Error(String(res.status)); return res.json(); }),
      // 403 for users without page access returns { error } (not an array) - handled below.
      fetch("/api/admin/pages").then(res => res.json()).catch(() => [])
    ]).then(([contentJson, pagesJson]) => {
        setData(contentJson);
        setFaqs(Array.isArray(contentJson.faq?.items) ? contentJson.faq.items : []);
        const rawCats = toCats(contentJson.faq?.categories);
        setCategories(rawCats.length > 0 ? rawCats : toCats(["General", "Services", "Pricing"]));

        // Pages an item can be pinned to. Ids are what the templates compare against: the page slug,
        // "home" for the homepage (HomeTemplate also accepts the homepage document's own slug).
        const pages: any[] = [{ id: "home", label: "Homepage" }];
        const seen = new Set(["home"]);
        (Array.isArray(pagesJson) ? pagesJson : [])
          .filter((p: any) => p.status === "published" && !p.isTrashed && GLOBAL_FAQ_TEMPLATES.has(p.template) && p.template !== "home")
          .forEach((p: any) => {
            if (seen.has(p.slug)) return;
            seen.add(p.slug);
            pages.push({ id: p.slug, label: p.title });
          });
        setAvailablePages(pages);
      })
      .catch(() => setLoadError(true));
  }, []);

  // Escape closes the category dialog.
  useEffect(() => {
    if (!showCategoryManager) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowCategoryManager(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCategoryManager]);

  // Label of a stored category value ('general' seed id, 'General' label, 'GENERAL' tag -> "General").
  const categoryLabel = (value: any) => {
    const key = slugify(value);
    const hit = categories.find((c) => !isAllCat(c) && (slugify(c.id) === key || slugify(c.label) === key));
    return hit ? hit.label : String(value ?? "");
  };

  const pageLabel = (id: string) => availablePages.find((p) => p.id === id)?.label || id;

  const saveToDb = async (updatedFaqs: any[], updatedCategories: Cat[], opts: { closeEditor?: boolean; message?: string } = {}) => {
    if (saving) return;
    setSaving(true);
    try {
      // Re-read the stored FAQ block right before writing so sibling keys (section header, toggles...) saved elsewhere
      // since this screen loaded are not overwritten by a stale copy; only items + categories are ours.
      let base = data?.faq || {};
      try {
        const latest = await fetch("/api/content", { cache: "no-store" });
        if (latest.ok) {
          const latestJson = await latest.json();
          if (latestJson?.faq && typeof latestJson.faq === "object") base = latestJson.faq;
        }
      } catch {}
      const updatedFaq = { ...base, items: updatedFaqs, categories: updatedCategories };
      const payload = { section: "faq", faq: updatedFaq };
      const res = await fetch("/api/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (res.ok) {
        setData((prev: any) => ({ ...prev, faq: updatedFaq }));
        setFaqs(updatedFaqs);
        setCategories(updatedCategories);
        showToast("ok", opts.message || "FAQ updated.");
        if (opts.closeEditor !== false) setIsEditing(null);
      } else {
        const err = await res.json().catch(() => ({}));
        showToast("err", `Could not save: ${err?.error || `server error ${res.status}`}`);
      }
    } catch {
      showToast("err", "Error saving. Check your connection and try again.");
    } finally { setSaving(false); }
  };

  const handleSaveFAQ = () => {
    // Plain text as typed (stripHtml would eat a literal "<...>" the admin meant as text); legacy markup is flattened in handleEdit.
    const question = String(form.question || "").replace(/\s+/g, " ").trim();
    const answerHasMedia = /<(img|iframe|video)\b/i.test(form.answer || "");
    if (!question) return showToast("err", "Question is required.");
    if (!stripHtml(form.answer) && !answerHasMedia) return showToast("err", "Answer is required.");
    const specific = form.visibility === "specific";
    const targetPages = specific && Array.isArray(form.targetPages) ? form.targetPages : [];
    if (specific && targetPages.length === 0) return showToast("err", "Pick at least one page, or switch Visibility to Global.");

    const nextId = Math.max(0, ...faqs.map((f) => Number(f?.id) || 0)) + 1;
    const item = {
      ...form,
      id: form.id ?? nextId,
      question,
      category: form.category || "",
      visibility: specific ? "specific" : "global",
      targetPages,
    };
    const newFaqs = [...faqs];
    if (isEditing !== null && isEditing < faqs.length) newFaqs[isEditing] = item;
    else newFaqs.push(item);
    saveToDb(newFaqs, categories);
  };

  const handleEdit = (idx: number) => {
    setIsEditing(idx);
    const item = faqs[idx];
    setForm({
      ...item,
      // Older items were saved from a rich-text editor: the question is a plain heading, so drop any markup.
      question: stripHtml(item.question || ""),
      category: categoryLabel(item.category) || "",
      // Items saved before visibility existed behave as global everywhere.
      visibility: item.visibility === "specific" ? "specific" : "global",
      targetPages: Array.isArray(item.targetPages) ? item.targetPages : []
    });
  };

  const moveFaq = (idx: number, dir: -1 | 1) => {
    const to = idx + dir;
    if (to < 0 || to >= faqs.length) return;
    const next = [...faqs];
    [next[idx], next[to]] = [next[to], next[idx]];
    saveToDb(next, categories, { closeEditor: false, message: "Order updated." });
  };

  if (loadError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 text-[#646970]">
        <p className="text-[14px]">Could not load the FAQ list, so editing is disabled to protect the saved questions.</p>
        <button onClick={() => window.location.reload()} className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] px-3 py-1 text-[13px] rounded-[3px]">Reload</button>
      </div>
    );
  }
  if (!data) return <div className="flex h-screen items-center justify-center text-[#646970] font-serif">Loading...</div>;

  const assignableCats = categories.filter((c) => !isAllCat(c));
  // Keep a not-yet-listed current value selectable so opening an item never silently changes its category.
  const categoryOptions = form.category && !assignableCats.some((c) => c.label === form.category)
    ? [...assignableCats.map((c) => c.label), form.category]
    : assignableCats.map((c) => c.label);

  // Pages this item is already pinned to that are no longer offered (deleted / other template): still listed so they can be unticked.
  const orphanTargets = (Array.isArray(form.targetPages) ? form.targetPages : []).filter((t: string) => !availablePages.some((p) => p.id === t));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">FAQs</h1>
        {isEditing === null && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(faqs.length);
                setForm({ question: "", answer: "", category: assignableCats[0]?.label || "", visibility: "global", targetPages: [] });
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
        <div role="status" className={`px-4 py-2 border-l-4 text-[13px] bg-white shadow-sm mb-4 ${toast.type === 'ok' ? 'border-[#00a32a]' : 'border-[#d63638]'}`}>
          {toast.msg}
        </div>
      )}

      {isEditing !== null ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
           <div className="lg:col-span-3 space-y-6">
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm p-6">
                  <div className="space-y-4">
                     <div className="space-y-1">
                        <label htmlFor="faq-question" className="text-[13px] font-bold">Question</label>
                        {/* Plain text: the public page and the FAQ schema render the question as a heading, not as HTML. */}
                        <input
                          id="faq-question"
                          type="text"
                          value={form.question}
                          onChange={(e) => setForm({ ...form, question: e.target.value })}
                          placeholder="Enter question here"
                          className="w-full border border-[#8c8f94] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] outline-none"
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
                       <label htmlFor="faq-category" className="text-[13px] font-bold">Category</label>
                       <select id="faq-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-[#8c8f94] px-2 py-1.5 text-[14px] rounded-[3px]">
                          {categoryOptions.length === 0 && <option value="">No categories yet</option>}
                          {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[13px] font-bold block">Visibility</span>
                       <div className="space-y-2">
                          <label className="flex items-center gap-2 text-[13px]">
                             <input type="radio" name="faq-visibility" checked={form.visibility === 'global'} onChange={() => setForm({...form, visibility: 'global'})} /> Global
                          </label>
                          <label className="flex items-center gap-2 text-[13px]">
                             <input type="radio" name="faq-visibility" checked={form.visibility === 'specific'} onChange={() => setForm({...form, visibility: 'specific'})} /> Specific Pages
                          </label>
                       </div>
                       <p className="text-[11px] text-[#646970] leading-snug">
                          Global questions appear on every page that shows the shared FAQ list (Homepage, Services, FAQ). A page&apos;s own
                          &ldquo;Page FAQs&rdquo; always take priority on that page.
                       </p>
                    </div>
                    {form.visibility === 'specific' && (
                       <div className="pt-2 border-t border-[#f0f0f1] space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {[...availablePages, ...orphanTargets.map((t: string) => ({ id: t, label: `${t} (page not found)` }))].map(p => {
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
                    <button onClick={handleSaveFAQ} disabled={saving} className="bg-[#2271b1] text-white px-4 py-1.5 rounded-[3px] text-[13px] font-semibold border border-[#2271b1] hover:bg-[#135e96] disabled:opacity-60">
                       {saving ? "Saving..." : (isEditing < faqs.length ? "Update" : "Publish")}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white border border-[#c3c4c7] rounded-sm shadow-sm overflow-x-auto">
           <table className="w-full text-left border-collapse">
              <thead>
                 <tr className="border-b border-[#c3c4c7] bg-white text-[#1d2327]">
                    <th className="py-2 px-3 text-[14px] font-semibold">Question</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-48">Category</th>
                    <th className="py-2 px-3 text-[14px] font-semibold w-56">Visibility</th>
                 </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                 {faqs.length === 0 && (
                    <tr><td colSpan={3} className="py-8 px-3 text-center text-[#646970] italic">No questions yet. Click &ldquo;Add New&rdquo; to create the first one.</td></tr>
                 )}
                 {faqs.map((faq, idx) => (
                    <tr key={faq.id ?? idx} className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1]`}>
                       <td className="py-4 px-3 align-top">
                          <strong className="text-[#2271b1] block text-[14px]">{stripHtml(faq.question) || "(no question)"}</strong>
                          {/* Always visible on touch screens; on desktop shown on hover / keyboard focus. */}
                          <div className="flex flex-wrap items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 [@media(hover:none)]:opacity-100 transition-opacity">
                             <button onClick={() => handleEdit(idx)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                             <span className="text-[#a7aaad]">|</span>
                             <button onClick={() => moveFaq(idx, -1)} disabled={idx === 0 || saving} className="text-[#2271b1] hover:underline text-[12px] disabled:opacity-40 disabled:no-underline">Move up</button>
                             <span className="text-[#a7aaad]">|</span>
                             <button onClick={() => moveFaq(idx, 1)} disabled={idx === faqs.length - 1 || saving} className="text-[#2271b1] hover:underline text-[12px] disabled:opacity-40 disabled:no-underline">Move down</button>
                             <span className="text-[#a7aaad]">|</span>
                             <button onClick={() => { if(confirm(`Delete "${stripHtml(faq.question)}"?`)) saveToDb(faqs.filter((_,i)=>i!==idx), categories, { closeEditor: false, message: "Question deleted." }); }} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                          </div>
                       </td>
                       <td className="py-4 px-3 align-top text-[#50575e] font-bold text-[11px] uppercase">{categoryLabel(faq.category)}</td>
                       <td className="py-4 px-3 align-top text-[#50575e]">
                          {faq.visibility === "specific" ? (
                            <>
                              <span>Specific pages</span>
                              <span className="block text-[11px] text-[#787c82]">
                                {(Array.isArray(faq.targetPages) && faq.targetPages.length > 0) ? faq.targetPages.map(pageLabel).join(", ") : "none selected - not shown anywhere"}
                              </span>
                            </>
                          ) : "Global"}
                       </td>
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
              role="dialog" aria-modal="true" aria-label="Manage Categories"
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-md bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Manage Categories</h2>
                <button onClick={() => setShowCategoryManager(false)} aria-label="Close" className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 bg-[#f0f0f1] space-y-4">
                {/* Add New Category */}
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const trimmed = newCategory.trim();
                    if (!trimmed) return;
                    if (categories.some((c) => slugify(c.label) === slugify(trimmed) || slugify(c.id) === slugify(trimmed))) return showToast("err", "Category already exists.");
                    saveToDb(faqs, [...categories, { id: slugify(trimmed), label: trimmed }], { closeEditor: false, message: "Category added." });
                    setNewCategory("");
                  }}
                >
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    aria-label="New category name"
                    className="flex-1 border border-[#8c8f94] bg-white px-3 py-1.5 text-[13px] rounded-[3px] focus:border-[#2271b1] outline-none"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-[3px] border border-[#2271b1] hover:bg-[#135e96] disabled:opacity-60"
                  >
                    Add
                  </button>
                </form>

                {/* Categories List ("All Questions" is added automatically by the public filter, so it is not listed) */}
                <div className="bg-white border border-[#c3c4c7] rounded-[3px] max-h-60 overflow-y-auto divide-y divide-[#f0f0f1]">
                  {assignableCats.map((cat) => {
                    const used = faqs.filter((f) => slugify(f.category) === slugify(cat.id) || slugify(f.category) === slugify(cat.label)).length;
                    return (
                      <div key={cat.id} className="flex items-center justify-between px-3 py-2 text-[13px]">
                        <span>{cat.label} <span className="text-[#8c8f94] text-[11px]">({used})</span></span>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => {
                            const warn = used > 0 ? ` ${used} question(s) use it and keep their current category text until you re-assign them.` : "";
                            if (confirm(`Delete the category "${cat.label}"?${warn}`)) {
                              saveToDb(faqs, categories.filter((c) => c.id !== cat.id), { closeEditor: false, message: "Category deleted." });
                            }
                          }}
                          className="text-[#d63638] hover:underline flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    );
                  })}
                  {assignableCats.length === 0 && (
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
