"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Calendar, Settings,
  Image as ImageIcon,
  ChevronRight, ExternalLink,
  AlertCircle,
  Plus, Trash2
} from "lucide-react";
import Link from "@/components/ui/Link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import MediaSelector from "./MediaSelector";
import SeoEditor from "./SeoEditor";
import { BASE_URL } from "@/lib/constants";
import { syncFaqSchema } from "@/lib/faqSchema";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface BlogPostEditorProps {
  id?: string;
  initialData?: any;
}

const EMPTY_SEO = {
  metaTitle: "",
  metaDescription: "",
  focusKeyword: "",
  canonicalUrl: "",
  metaRobotsIndex: "index",
  metaRobotsFollow: "follow",
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  twitterCard: "summary_large_image",
  featuredImage: "",
  featuredImageAlt: ""
};

const NEW_POST = {
  title: "",
  slug: "",
  content: "",
  excerpt: "",
  featuredImage: "",
  location: "",
  status: "draft",
  publishedAt: "",
  categories: [] as string[],
  tags: [] as string[],
  seo: { ...EMPTY_SEO },
  faq: [] as any[]
};

// Same rules as the server (lib/blog-admin slugify).
const slugify = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * The API returns categories/tags POPULATED ([{_id,name,...}]) but every control here works with plain ids,
 * so on an existing post no category was ever shown as ticked, no tag chip appeared, and un-ticking a
 * category did nothing. Normalise once on load. Also guarantees `seo` / `faq` exist (old posts have none).
 */
const toIds = (list: any): string[] =>
  (Array.isArray(list) ? list : [])
    .map((v: any) => (v && typeof v === "object" ? v._id : v))
    .filter(Boolean)
    .map(String);

const normalizePost = (data: any) => ({
  ...NEW_POST,
  ...data,
  categories: toIds(data?.categories),
  tags: toIds(data?.tags),
  seo: { ...EMPTY_SEO, ...(data?.seo || {}) },
  faq: Array.isArray(data?.faq) ? data.faq : [],
  publishedAt: data?.publishedAt || ""
});

// <input type="datetime-local"> works in the browser's local time.
const pad = (n: number) => String(n).padStart(2, "0");
const toLocalInput = (v: any) => {
  const d = v ? new Date(v) : null;
  if (!d || Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (s: string) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
};

export default function BlogPostEditor({ id, initialData }: BlogPostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id && !initialData);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");
  const [dirty, setDirty] = useState(false);

  const [post, setPostRaw] = useState<any>(normalizePost(initialData || NEW_POST));
  // Any user edit marks the form dirty (drives the "unsaved changes" browser prompt).
  const setPost = (next: any) => {
    setPostRaw(next);
    setDirty(true);
  };

  // An existing post's slug is its public URL, so it is never regenerated from the title behind the author's back.
  const [slugTouched, setSlugTouched] = useState(!!id || !!initialData?.slug);
  const originalSlug = useRef<string>(initialData?.slug || "");

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faq'>('content');
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  useEffect(() => {
    if (id && !initialData) {
      fetchPost();
    }
    fetchCategories();
    fetchTags();
  }, [id]);

  // Warn before closing the tab / reloading with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const toast = (text: string, type: "ok" | "error" = "ok") => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(""), type === "error" ? 6000 : 3000);
  };

  const fetchPost = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(`/api/admin/blogs/posts/${id}`);
      const data = await res.json();
      if (res.ok) {
        originalSlug.current = data.slug || "";
        setPostRaw(normalizePost(data));
        setDirty(false);
      } else {
        setLoadError(data?.error || "Could not load this post.");
      }
    } catch (err) {
      console.error("Failed to fetch post:", err);
      setLoadError("Could not load this post.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/blogs/categories');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
    }
  };

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/blogs/tags');
      const data = await res.json();
      if (res.ok && Array.isArray(data)) setTags(data);
    } catch (err) {
      console.error("Failed to fetch tags:", err);
    }
  };

  // Create a category / tag without leaving the editor (the old link navigated away and lost unsaved work).
  const quickAddTerm = async (kind: "categories" | "tags", name: string) => {
    const clean = name.trim();
    if (!clean) return;
    try {
      const res = await fetch(`/api/admin/blogs/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: clean })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast(data?.error || `Could not add the ${kind === "categories" ? "category" : "tag"}.`, "error");
        return;
      }
      if (kind === "categories") {
        setCategories((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setPost({ ...post, categories: [...post.categories, data._id] });
        setNewCategory("");
      } else {
        setTags((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
        setPost({ ...post, tags: [...post.tags, data._id] });
        setNewTag("");
      }
    } catch {
      toast("Network error while adding.", "error");
    }
  };

  const hasBodyContent = (html: string) => !!(html || "").replace(/<[^>]*>/g, "").trim() || /<img\b/i.test(html || "");

  const handleSave = async (mode?: "draft" | "publish") => {
    if (saving) return;

    // Validate bulk FAQ JSON-LD schema markup
    const bulkSchema = (post.faqSchemaMarkup || '').trim();
    if (bulkSchema) {
      try {
        let cleaned = bulkSchema;
        if (cleaned.startsWith("<script")) {
          const closeBracket = cleaned.indexOf(">");
          if (closeBracket !== -1) cleaned = cleaned.substring(closeBracket + 1);
        }
        if (cleaned.endsWith("</script>")) {
          cleaned = cleaned.substring(0, cleaned.length - 9);
        }
        JSON.parse(cleaned.trim());
      } catch (e) {
        toast('Invalid JSON in FAQ Schema Markup. Please correct it before saving.', "error");
        setActiveTab('faq');
        return;
      }
    }

    // "Save Draft" always saves a draft; "Publish" publishes a draft (or keeps "scheduled").
    let status = post.status;
    if (mode === "draft") status = "draft";
    if (mode === "publish" && status === "draft") status = "published";

    const title = (post.title || "").trim();
    let slug = slugify(post.slug || title);
    if (!title) {
      toast("Please enter a title.", "error");
      return;
    }
    if (!slug) {
      toast("Please enter a slug (letters or numbers).", "error");
      return;
    }
    if (status !== "draft" && !hasBodyContent(post.content)) {
      toast("Write some content before publishing.", "error");
      return;
    }
    if (status === "scheduled") {
      const when = post.publishedAt ? new Date(post.publishedAt) : null;
      if (!when || Number.isNaN(when.getTime()) || when.getTime() <= Date.now()) {
        toast("Pick a future publish date to schedule this post.", "error");
        return;
      }
    }

    const payload: any = { ...post, title, slug, status };
    delete payload._id;
    delete payload.__v;
    delete payload.author;
    delete payload.createdAt;
    delete payload.updatedAt;

    setSaving(true);
    try {
      const url = id ? `/api/admin/blogs/posts/${id}` : '/api/admin/blogs/posts';
      const method = id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDirty(false);
        if (!id && data._id) {
          router.push(`/admin/blogs/${String(data._id)}`);
          return;
        }
        // Reflect what the server decided (e.g. a past "scheduled" date is published immediately).
        originalSlug.current = data.slug || slug;
        setPostRaw(normalizePost({ ...post, ...data }));
        toast(
          data.status === "scheduled" ? "Post scheduled." : data.status === "published" ? "Post saved and live." : "Draft saved."
        );
      } else {
        toast(data?.error || "Failed to save post", "error");
      }
    } catch (err) {
      toast("Failed to save post", "error");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    // Only for a NEW post whose slug the author has not typed themselves.
    if (slugTouched || !post.title) return;
    setPostRaw((p: any) => ({ ...p, slug: slugify(p.title) }));
  };

  const handleTrash = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to move this post to Trash?")) return;
    try {
      const res = await fetch(`/api/admin/blogs/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrashed: true }),
      });
      if (res.ok) {
        setDirty(false);
        router.push("/admin/blogs");
      } else {
        toast("Failed to move post to Trash.", "error");
      }
    } catch (err) {
      toast("Failed to move post to Trash.", "error");
    }
  };

  if (loading) return <div className="p-10 text-center text-[#646970]">Loading editor...</div>;

  if (loadError) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-[#d63638] text-[13px]">{loadError}</p>
        <div className="flex items-center justify-center gap-4 text-[13px]">
          <button onClick={fetchPost} className="text-[#2271b1] underline">Try again</button>
          <Link href="/admin/blogs" className="text-[#2271b1] underline">Back to posts</Link>
        </div>
      </div>
    );
  }

  const slugChangedOnLivePost = !!id && post.status === "published" && !!originalSlug.current && slugify(post.slug) !== originalSlug.current;
  const viewLabel = post.status === "published" ? "View Post" : "Preview Post";
  const publishDateInput = toLocalInput(post.publishedAt);
  const futureDate = !!post.publishedAt && new Date(post.publishedAt).getTime() > Date.now();

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans pb-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-3 px-1">
        <Link href="/admin/blogs" className="hover:underline">Blog Posts</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
        <span className="text-[#646970] truncate">{post.title || (id ? "Edit Post" : "Add New Post")}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">{id ? 'Edit Post' : 'Add New Post'}</h1>
          {!id && <button type="button" onClick={() => handleSave("draft")} disabled={saving} className="bg-white border border-[#2271b1] text-[#2271b1] text-[13px] px-2 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] transition-colors disabled:opacity-50">Save Draft</button>}
          {dirty && <span className="text-[11px] text-[#996800]">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-3">
          {id && post.slug && (
            <Link href={`/blogs/${post.slug}`} target="_blank" className="flex items-center gap-1.5 text-[#2271b1] text-[13px] hover:text-[#135e96]">
              <ExternalLink className="w-4 h-4" /> {viewLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={() => handleSave(id ? undefined : "publish")}
            disabled={saving}
            className="bg-[#2271b1] text-white text-[13px] font-semibold px-4 py-1.5 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {id ? 'Update' : post.status === "scheduled" ? 'Schedule' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main Column */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="bg-white">
            <label htmlFor="post-title" className="sr-only">Post title</label>
            <input
              id="post-title"
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              onBlur={generateSlug}
              placeholder="Enter title here"
              className="w-full border border-[#c3c4c7] px-3.5 py-2.5 text-[18px] font-medium text-[#1d2327] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#646970]">
              <label htmlFor="post-slug"><strong>Permalink:</strong></label>
              <span className="whitespace-nowrap">{BASE_URL}/blogs/</span>
              <input
                id="post-slug"
                type="text"
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setPost({ ...post, slug: e.target.value });
                }}
                onBlur={() => setPostRaw((p: any) => ({ ...p, slug: slugify(p.slug) }))}
                placeholder="post-slug"
                className="bg-white px-1.5 py-0.5 rounded border border-[#c3c4c7] min-w-[160px] flex-1 max-w-md text-[12px] text-[#1d2327] outline-none focus:border-[#2271b1]"
              />
            </div>
            {slugChangedOnLivePost && (
              <p className="mt-1 text-[11px] text-[#996800]">
                This post is live: changing the slug changes its public URL, and the old link will stop working.
              </p>
            )}
          </div>

          {/* Editor Tabs */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
            <div className="flex border-b border-[#f0f0f1] bg-[#f6f7f7]">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2.5 text-[13px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'content' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"}`}
              >
                Post Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 text-[13px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'seo' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"}`}
              >
                SEO (Yoast-style)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('faq')}
                className={`px-4 py-2.5 text-[13px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'faq' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"}`}
              >
                FAQs
              </button>
            </div>

            <div className="p-0">
              {activeTab === 'content' ? (
                <div className="p-0 min-h-[500px]">
                  <RichTextEditor
                    content={post.content}
                    onChange={(html) => setPost({ ...post, content: html })}
                    showStatusBar={true}
                  />
                </div>
              ) : activeTab === 'seo' ? (
                <SeoEditor
                  data={post.seo}
                  setData={(seo) => setPost({ ...post, seo })}
                  // The SEO helper builds its suggested canonical as BASE_URL/<pageSlug>. Posts live under /blogs/,
                  // so hand it the real path (it used to suggest BASE_URL/<slug>, a URL that 404s) and nothing while the slug is empty.
                  pageSlug={post.slug ? `blogs/${post.slug}` : ""}
                  pageTitle={post.title}
                  pageContent={post.content}
                />
              ) : (
                <div className="p-6 bg-white min-h-[500px]">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Manage FAQs</h3>
                      <p className="text-sm text-slate-500">Add questions and answers that will appear at the bottom of your post. Rows missing a question or an answer are not shown.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newFaq = [...(post.faq || []), { question: "", answer: "" }];
                        setPost({ ...post, faq: newFaq, faqSchemaAutoSync: false });
                      }}
                      className="bg-[#2271b1] text-white text-[12px] font-semibold px-4 py-1.5 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add New FAQ
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pb-6 mb-6 border-b border-slate-200">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Badge</label>
                      <input
                        type="text"
                        value={post.faqBadge || ""}
                        onChange={e => setPost({ ...post, faqBadge: e.target.value })}
                        placeholder="ARTICLE FAQ"
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Heading</label>
                      <input
                        type="text"
                        value={post.faqTitle || ""}
                        onChange={e => setPost({ ...post, faqTitle: e.target.value })}
                        placeholder="Frequently Asked Questions"
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Description</label>
                      <input
                        type="text"
                        value={post.faqDescription || ""}
                        onChange={e => setPost({ ...post, faqDescription: e.target.value })}
                        placeholder="Key insights and technical queries answered."
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(post.faq || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-6 border border-slate-200 rounded-lg bg-slate-50/30 relative group hover:border-primary/30 transition-colors">
                        <button
                          type="button"
                          onClick={() => {
                            const newFaq = post.faq.filter((_: any, i: number) => i !== idx);
                            setPost({ ...post, faq: newFaq, faqSchemaAutoSync: false });
                          }}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove FAQ"
                          aria-label={`Remove FAQ ${idx + 1}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="grid gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={item.question || ""}
                              onChange={(e) => {
                                const newFaq = post.faq.map((f: any, i: number) => (i === idx ? { ...f, question: e.target.value } : f));
                                setPost({ ...post, faq: newFaq, faqSchemaAutoSync: false });
                              }}
                              placeholder="e.g. What are the benefits of professional roofing?"
                              className="w-full border border-[#c3c4c7] px-4 py-2.5 text-sm outline-none focus:border-[#2271b1] bg-white rounded shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Answer</label>
                            <textarea
                              value={item.answer || ""}
                              onChange={(e) => {
                                const newFaq = post.faq.map((f: any, i: number) => (i === idx ? { ...f, answer: e.target.value } : f));
                                setPost({ ...post, faq: newFaq, faqSchemaAutoSync: false });
                              }}
                              rows={4}
                              placeholder="Provide a detailed answer here..."
                              className="w-full border border-[#c3c4c7] p-4 text-sm outline-none focus:border-[#2271b1] resize-none bg-white rounded shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    {(!post.faq || post.faq.length === 0) && (
                      <div className="text-center py-20 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                        <AlertCircle className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h4 className="text-slate-900 font-medium">No FAQs Yet</h4>
                        <p className="text-slate-500 text-sm mt-1">Click the button above to add your first question.</p>
                      </div>
                    )}
                  </div>

                  {/* FAQ Schema Sync */}
                  <div className="mt-8 space-y-3 border-t border-slate-200 pt-6">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Schema (FAQPage)</label>
                      <p className="text-xs text-slate-400 mt-0.5">Generates FAQPage structured data from the questions above. Click &quot;Sync&quot; again after editing FAQs to refresh it.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const result = syncFaqSchema(post.faq, post.faqSchemaMarkup, post.faqSchemaAutoSync === true);
                        if (result.status === "empty") {
                          alert("Add at least one FAQ with both a question and an answer before syncing.");
                          return;
                        }
                        if (result.status === "cancelled") return;
                        setPost({ ...post, faqSchemaMarkup: result.schemaString, faqSchemaAutoSync: true });
                      }}
                      className="bg-[#2271b1] text-white px-3.5 py-2 text-[12px] font-bold rounded-[3px] hover:bg-[#135e96] transition-colors"
                    >
                      Sync FAQs to Schema
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[280px] space-y-5">
          {/* Publish Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Publish</h2>
            </div>
            <div className="p-3 space-y-3 text-[12px] text-[#2c3338]">
              <div className="flex items-center justify-between">
                <label htmlFor="post-status" className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#82878c]" /> Status:</label>
                <select
                  id="post-status"
                  value={post.status}
                  onChange={(e) => {
                    const status = e.target.value;
                    // "Published" can never carry a future date (it would not go live): fall back to "now".
                    setPost({ ...post, status, ...(status === "published" && futureDate ? { publishedAt: "" } : {}) });
                  }}
                  className="bg-white border border-[#8c8f94] px-1 py-0.5 rounded outline-none focus:border-[#2271b1]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              {post.slug && (
                <div className="pt-1">
                  <Link href={`/blogs/${post.slug}`} target="_blank" className="text-[#2271b1] hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> {viewLabel}
                  </Link>
                </div>
              )}
              <div className="space-y-1">
                <label htmlFor="post-date" className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#82878c]" />
                  {post.status === 'scheduled' ? 'Publish on:' : post.status === 'published' ? 'Published on:' : 'Publish date:'}
                </label>
                <input
                  id="post-date"
                  type="datetime-local"
                  value={publishDateInput}
                  onChange={(e) => setPost({ ...post, publishedAt: fromLocalInput(e.target.value) })}
                  className="w-full bg-white border border-[#8c8f94] px-1.5 py-1 rounded outline-none focus:border-[#2271b1]"
                />
                <p className="text-[10px] text-[#646970] leading-snug">
                  {post.status === 'scheduled'
                    ? 'Required: the post goes live automatically at this time.'
                    : post.status === 'draft'
                      ? 'Leave empty to publish immediately when you click Publish.'
                      : futureDate
                        ? 'This date is in the future, so saving will schedule the post instead of publishing it.'
                        : 'Change to back-date the article.'}
                </p>
              </div>
            </div>
            <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
              {id ? (
                <button type="button" onClick={handleTrash} className="text-[#d63638] underline text-[12px] hover:text-[#b32d2e]">Move to Trash</button>
              ) : <span />}
              <button
                type="button"
                onClick={() => handleSave(id ? undefined : "publish")}
                disabled={saving}
                className="bg-[#2271b1] text-white text-[12px] font-semibold px-3 py-1 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] disabled:opacity-50"
              >
                {saving ? "Saving..." : id ? "Update" : post.status === "scheduled" ? "Schedule" : "Publish"}
              </button>
            </div>
          </div>

          {/* Location Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Location</h2>
            </div>
            <div className="p-3">
              <input
                type="text"
                value={post.location || ""}
                onChange={(e) => setPost({ ...post, location: e.target.value })}
                placeholder="e.g. New York, USA"
                aria-label="Location"
                className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] bg-white transition-all"
              />
              <p className="text-[10px] text-[#646970] mt-1.5 leading-normal">Optional. Shown next to the date at the top of the article.</p>
            </div>
          </div>

          {/* Excerpt Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Excerpt</h2>
            </div>
            <div className="p-3">
              <textarea
                value={post.excerpt || ""}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                rows={4}
                placeholder="Write a brief summary..."
                aria-label="Excerpt"
                className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] rounded-[3px] resize-none leading-relaxed bg-white transition-all"
              />
              <p className="text-[10px] text-[#646970] mt-1.5 leading-normal">Optional hand-written summary. Used for the blog cards on other pages and as the search-result description when the SEO description is empty.</p>
            </div>
          </div>

          {/* Categories Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Categories</h2>
            </div>
            <div className="p-3 space-y-2">
              <div className="max-h-48 overflow-y-auto space-y-1.5">
                {categories.length === 0 && <p className="text-[11px] text-[#646970]">No categories yet.</p>}
                {categories.map(cat => (
                  <label key={cat._id} className="flex items-center gap-2 text-[12px] text-[#2c3338] cursor-pointer hover:text-[#2271b1]">
                    <input
                      type="checkbox"
                      checked={post.categories.includes(cat._id)}
                      onChange={(e) => {
                        const newCats = e.target.checked
                          ? [...post.categories, cat._id]
                          : post.categories.filter((cid: string) => cid !== cat._id);
                        setPost({ ...post, categories: newCats });
                      }}
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-1 pt-1">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); quickAddTerm("categories", newCategory); } }}
                  placeholder="New category name"
                  aria-label="New category name"
                  className="flex-1 min-w-0 border border-[#c3c4c7] px-2 py-1 text-[11px] outline-none focus:border-[#2271b1]"
                />
                <button type="button" onClick={() => quickAddTerm("categories", newCategory)} className="border border-[#2271b1] text-[#2271b1] text-[11px] px-2 rounded-[3px] hover:bg-[#f0f6fb]">Add</button>
              </div>
              <Link href="/admin/blogs/categories" target="_blank" className="text-[#2271b1] underline text-[11px] block">Manage categories</Link>
            </div>
          </div>

          {/* Tags Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Tags</h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-6 border border-[#c3c4c7] p-2 rounded-sm bg-slate-50/30">
                {post.tags.length === 0 && <span className="text-[11px] text-[#646970]">No tags selected.</span>}
                {post.tags.map((tagId: string) => {
                  const tag = tags.find(t => t._id === tagId);
                  if (!tag) return null;
                  return (
                    <span key={tagId} className="inline-flex items-center gap-1 bg-[#f0f0f1] px-2 py-0.5 rounded-full text-[11px] text-[#2c3338] border border-[#dcdcde]">
                      {tag.name}
                      <button type="button" aria-label={`Remove tag ${tag.name}`} onClick={() => setPost({ ...post, tags: post.tags.filter((t: string) => t !== tagId) })} className="hover:text-red-500 font-bold">×</button>
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-1">
                <select
                  aria-label="Add an existing tag"
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !post.tags.includes(e.target.value)) {
                      setPost({ ...post, tags: [...post.tags, e.target.value] });
                    }
                  }}
                  className="flex-1 bg-white border border-[#c3c4c7] px-2 py-1 text-[11px] outline-none"
                >
                  <option value="">Select Tag...</option>
                  {tags.filter(t => !post.tags.includes(t._id)).map(tag => (
                    <option key={tag._id} value={tag._id}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); quickAddTerm("tags", newTag); } }}
                  placeholder="New tag name"
                  aria-label="New tag name"
                  className="flex-1 min-w-0 border border-[#c3c4c7] px-2 py-1 text-[11px] outline-none focus:border-[#2271b1]"
                />
                <button type="button" onClick={() => quickAddTerm("tags", newTag)} className="border border-[#2271b1] text-[#2271b1] text-[11px] px-2 rounded-[3px] hover:bg-[#f0f6fb]">Add</button>
              </div>
              <Link href="/admin/blogs/tags" target="_blank" className="text-[#2271b1] underline text-[11px]">Manage tags</Link>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Featured Image</h2>
            </div>
            <div className="p-3 space-y-3 text-center">
              {post.featuredImage ? (
                <div className="relative group">
                  <img src={post.featuredImage} alt="" className="w-full aspect-video object-cover rounded border border-[#c3c4c7]" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                    <button type="button" onClick={() => setPost({ ...post, featuredImage: "" })} className="text-white text-[12px] font-bold underline">Remove image</button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#c3c4c7] p-5 rounded-sm flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-[#dcdcde]" />
                  <p className="text-[11px] text-[#646970]">Set featured image</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowMediaSelector(true)}
                className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] text-[12px] font-semibold px-4 py-1.5 rounded-[3px] hover:bg-[#f0f6fb]"
              >
                {post.featuredImage ? "Replace image" : "Set featured image"}
              </button>
              {post.featuredImage && (
                <div className="text-left space-y-1">
                  <label htmlFor="post-image-alt" className="text-[11px] font-semibold text-[#1d2327]">Alt text</label>
                  <input
                    id="post-image-alt"
                    type="text"
                    value={post.seo?.featuredImageAlt || ""}
                    onChange={(e) => setPost({ ...post, seo: { ...post.seo, featuredImageAlt: e.target.value } })}
                    placeholder="Describe the image (defaults to the post title)"
                    className="w-full border border-[#c3c4c7] px-2 py-1 text-[12px] outline-none focus:border-[#2271b1]"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showMediaSelector && (
        <MediaSelector
          onSelect={(item) => {
            setPost({
              ...post,
              featuredImage: item.url,
              seo: {
                ...post.seo,
                featuredImage: post.seo?.featuredImage || item.url,
                featuredImageAlt: post.seo?.featuredImageAlt || item.alt || "",
                ogImage: post.seo?.ogImage || item.url
              }
            });
            setShowMediaSelector(false);
          }}
          onClose={() => setShowMediaSelector(false)}
          title="Select Featured Image"
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            role="status"
            className={`fixed bottom-10 right-10 z-[100] px-4 py-2 bg-white border-l-4 text-[12px] shadow-lg max-w-sm ${messageType === "error" ? "border-[#d63638]" : "border-[#00a32a]"}`}>
            <p className="text-[#1d2327] m-0">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
