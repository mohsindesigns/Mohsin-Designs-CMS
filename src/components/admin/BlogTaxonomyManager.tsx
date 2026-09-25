"use client";

import { useState, useEffect, useCallback } from "react";

type Kind = "categories" | "tags";

interface Term {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  count?: number;
}

// Same rules as the server (lib/blog-admin slugify) so what the editor sees is what gets stored.
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Shared list + add/edit/delete screen for blog Categories and Tags.
 * (Both pages used to be near-identical copies whose Edit / Delete links did nothing and whose
 * failed saves were silent.)
 */
export default function BlogTaxonomyManager({ kind }: { kind: Kind }) {
  const isCat = kind === "categories";
  const singular = isCat ? "category" : "tag";
  const Singular = isCat ? "Category" : "Tag";
  const endpoint = `/api/admin/blogs/${kind}`;

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({ name: "", slug: "", description: "" });
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", slug: "", description: "" });
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      if (res.ok && Array.isArray(data)) {
        setTerms(data);
        setLoadError("");
      } else {
        setLoadError(data?.error || `Could not load ${kind}.`);
      }
    } catch {
      setLoadError(`Could not load ${kind}.`);
    } finally {
      setLoading(false);
    }
  }, [endpoint, kind]);

  useEffect(() => {
    load();
  }, [load]);

  const flash = (type: "ok" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!form.name.trim()) {
      flash("error", `${Singular} name is required.`);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, slug: form.slug || form.name, description: form.description }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm({ name: "", slug: "", description: "" });
        setSlugTouched(false);
        flash("ok", `${Singular} added.`);
        load();
      } else {
        flash("error", data?.error || `Failed to create ${singular}.`);
      }
    } catch {
      flash("error", `Failed to create ${singular}.`);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (t: Term) => {
    setEditingId(t._id);
    setEditForm({ name: t.name, slug: t.slug, description: t.description || "" });
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim()) {
      flash("error", `${Singular} name is required.`);
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch(`${endpoint}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCat ? editForm : { name: editForm.name, slug: editForm.slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEditingId(null);
        flash("ok", `${Singular} updated.`);
        load();
      } else {
        flash("error", data?.error || `Failed to update ${singular}.`);
      }
    } catch {
      flash("error", `Failed to update ${singular}.`);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (t: Term) => {
    const used = t.count || 0;
    const warning = used
      ? `"${t.name}" is used by ${used} post${used === 1 ? "" : "s"}. Deleting it removes it from ${used === 1 ? "that post" : "those posts"} (the posts themselves are kept).\n\nDelete this ${singular}?`
      : `Delete the ${singular} "${t.name}"?`;
    if (!confirm(warning)) return;
    setBusyId(t._id);
    try {
      const res = await fetch(`${endpoint}/${t._id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        flash("ok", `${Singular} deleted.`);
        load();
      } else {
        flash("error", data?.error || `Failed to delete ${singular}.`);
      }
    } catch {
      flash("error", `Failed to delete ${singular}.`);
    } finally {
      setBusyId(null);
    }
  };

  const inputCls = "w-full border border-[#c3c4c7] px-2 py-1.5 bg-white outline-none focus:border-[#2271b1]";
  const colSpan = isCat ? 4 : 3;

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans">
      <h1 className="text-[23px] font-normal text-[#1d2327] font-serif mb-4">{isCat ? "Categories" : "Tags"}</h1>

      {message && (
        <div
          role="status"
          className={`mb-4 border-l-4 bg-white px-3 py-2 text-[13px] shadow-sm ${message.type === "ok" ? "border-[#00a32a]" : "border-[#d63638]"}`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Add New form */}
        <div className="w-full md:w-1/3">
          <h2 className="text-[14px] font-semibold mb-3">Add New {Singular}</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label htmlFor="term-name" className="block text-[13px] mb-1">Name</label>
              <input
                id="term-name"
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value, slug: slugTouched ? form.slug : slugify(e.target.value) })
                }
                className={inputCls}
              />
              <p className="text-[11px] text-[#646970] mt-1">The name is how it appears on your site.</p>
            </div>
            <div>
              <label htmlFor="term-slug" className="block text-[13px] mb-1">Slug</label>
              <input
                id="term-slug"
                type="text"
                value={form.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setForm({ ...form, slug: e.target.value });
                }}
                onBlur={() => setForm((f) => ({ ...f, slug: slugify(f.slug) }))}
                className={inputCls}
              />
              <p className="text-[11px] text-[#646970] mt-1">The &quot;slug&quot; is the URL-friendly version of the name (lowercase letters, numbers and hyphens).</p>
            </div>
            {isCat && (
              <div>
                <label htmlFor="term-desc" className="block text-[13px] mb-1">Description</label>
                <textarea
                  id="term-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className={inputCls}
                />
              </div>
            )}
            <button
              disabled={saving}
              className="bg-[#2271b1] text-white text-[13px] px-3 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96] disabled:opacity-60"
            >
              {saving ? "Adding..." : `Add New ${Singular}`}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="flex-1 min-w-0">
          <div className="bg-white border border-[#c3c4c7] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[520px]">
              <thead>
                <tr className="border-b border-[#c3c4c7] text-[13px] font-bold">
                  <th className="px-3 py-2">Name</th>
                  {isCat && <th className="px-3 py-2">Description</th>}
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2" title="Posts (not in trash) that use it">Count</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={colSpan} className="p-10 text-center text-[#646970]">Loading...</td></tr>
                ) : loadError ? (
                  <tr><td colSpan={colSpan} className="p-10 text-center text-[#d63638]">{loadError}</td></tr>
                ) : terms.length === 0 ? (
                  <tr><td colSpan={colSpan} className="p-10 text-center text-[#646970]">No {kind} yet.</td></tr>
                ) : (
                  terms.map((t) =>
                    editingId === t._id ? (
                      <tr key={t._id} className="border-b border-[#f0f0f1] bg-[#f6f7f7] text-[13px] align-top">
                        <td className="px-3 py-3">
                          <input
                            aria-label={`${Singular} name`}
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className={inputCls}
                          />
                          <div className="flex items-center gap-2 mt-2 text-[12px]">
                            <button
                              onClick={() => saveEdit(t._id)}
                              disabled={busyId === t._id}
                              className="bg-[#2271b1] text-white px-2.5 py-1 rounded-[3px] border border-[#135e96] disabled:opacity-60"
                            >
                              {busyId === t._id ? "Saving..." : "Update"}
                            </button>
                            <button onClick={() => setEditingId(null)} className="text-[#2271b1] hover:text-[#135e96]">Cancel</button>
                          </div>
                        </td>
                        {isCat && (
                          <td className="px-3 py-3">
                            <textarea
                              aria-label="Description"
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              rows={2}
                              className={inputCls}
                            />
                          </td>
                        )}
                        <td className="px-3 py-3">
                          <input
                            aria-label={`${Singular} slug`}
                            value={editForm.slug}
                            onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                            className={inputCls}
                          />
                        </td>
                        <td className="px-3 py-3">{t.count || 0}</td>
                      </tr>
                    ) : (
                      <tr key={t._id} className="border-b border-[#f0f0f1] hover:bg-[#f6f7f7] group text-[13px]">
                        <td className="px-3 py-3 font-bold text-[#2271b1]">
                          {t.name}
                          <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 transition-opacity flex items-center gap-2 mt-1 font-normal text-[11px]">
                            <button onClick={() => startEdit(t)} className="hover:text-[#135e96]">Edit</button>
                            <span className="text-[#c3c4c7]">|</span>
                            <button onClick={() => remove(t)} disabled={busyId === t._id} className="text-[#d63638] hover:text-[#b32d2e] disabled:opacity-60">
                              {busyId === t._id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </td>
                        {isCat && <td className="px-3 py-3 text-[#646970]">{t.description || "—"}</td>}
                        <td className="px-3 py-3">{t.slug}</td>
                        <td className="px-3 py-3">{t.count || 0}</td>
                      </tr>
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
