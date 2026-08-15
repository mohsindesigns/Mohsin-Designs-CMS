"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, Eye, Calendar, Settings,
  Image as ImageIcon, Tag, Folder,
  ChevronRight, ArrowLeft, ExternalLink, Globe,
  CheckCircle2, AlertCircle, BarChart3, Search,
  Plus, Trash2, CircleHelp
} from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import MediaSelector from "./MediaSelector";
import SeoEditor from "./SeoEditor";
import { BASE_URL } from "@/lib/constants";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

interface BlogPostEditorProps {
  id?: string;
  initialData?: any;
}

export default function BlogPostEditor({ id, initialData }: BlogPostEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id && !initialData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [post, setPost] = useState(initialData || {
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    featuredImage: "",
    location: "",
    status: "draft",
    categories: [],
    tags: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      focusKeyword: "",
      canonicalUrl: "",
      metaRobotsIndex: "index",
      metaRobotsFollow: "follow",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      twitterCard: "summary_large_image"
    },
    faq: []
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faq'>('content');
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  useEffect(() => {
    if (id && !initialData) {
      fetchPost();
    }
    fetchCategories();
    fetchTags();
  }, [id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/admin/blog/posts/${id}`);
      const data = await res.json();
      if (res.ok) setPost(data);
    } catch (err) {
      console.error("Failed to fetch post:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const res = await fetch('/api/admin/blog/categories');
    const data = await res.json();
    if (res.ok) setCategories(data);
  };

  const fetchTags = async () => {
    const res = await fetch('/api/admin/blog/tags');
    const data = await res.json();
    if (res.ok) setTags(data);
  };
  const handleSave = async () => {
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
        alert('Invalid JSON in FAQ Schema Markup. Please correct it before saving.');
        return;
      }
    }

    setSaving(true);
    try {
      const url = id ? `/api/admin/blog/posts/${id}` : '/api/admin/blog/posts';
      const method = id ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Post saved successfully!");
        if (!id && data._id) {
          const newId = String(data._id);
          router.push(`/admin/blog/${newId}`);
        }
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage("Error: " + data.error);
      }
    } catch (err) {
      setMessage("Failed to save post");
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = () => {
    if (!post.title) return;
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setPost({ ...post, slug });
  };

  if (loading) return <div className="p-10 text-center text-[#646970]">Loading editor...</div>;

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans pb-10">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-3 px-1">
        <Link href="/admin/blog" className="hover:underline">Blog Posts</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
        <span className="text-[#646970] truncate">{post.title || (id ? "Edit Post" : "Add New Post")}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">{id ? 'Edit Post' : 'Add New Post'}</h1>
          {!id && <button onClick={handleSave} className="bg-white border border-[#2271b1] text-[#2271b1] text-[13px] px-2 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] transition-colors">Save Draft</button>}
        </div>
        <div className="flex items-center gap-3">
          {id && (
            <Link href={`/blog/${post.slug}`} target="_blank" className="flex items-center gap-1.5 text-[#2271b1] text-[13px] hover:text-[#135e96]">
              <ExternalLink className="w-4 h-4" /> View Post
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2271b1] text-white text-[13px] font-semibold px-4 py-1.5 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {id ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        {/* Main Column */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="bg-white">
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({ ...post, title: e.target.value })}
              onBlur={generateSlug}
              placeholder="Enter title here"
              className="w-full border border-[#c3c4c7] px-3.5 py-2.5 text-[18px] font-medium text-[#1d2327] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center gap-1 text-[12px] text-[#646970]">
            <strong>Permalink:</strong>
            <span className="bg-[#f0f0f1] px-1 rounded border border-[#c3c4c7] truncate max-w-[200px] sm:max-w-md">{BASE_URL}/blog/{post.slug}</span>
            <button onClick={() => {
              const s = prompt("Enter slug:", post.slug);
              if (s) setPost({ ...post, slug: s });
            }} className="border border-[#c3c4c7] px-2 rounded hover:bg-[#f6f7f7]">Edit</button>
          </div>

          {/* Editor Tabs */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
            <div className="flex border-b border-[#f0f0f1] bg-[#f6f7f7]">
              <button
                onClick={() => setActiveTab('content')}
                className={`px-4 py-2.5 text-[13px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'content' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"}`}
              >
                Post Content
              </button>
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-4 py-2.5 text-[13px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'seo' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"}`}
              >
                SEO (Yoast-style)
              </button>
              <button
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
                  pageSlug={post.slug}
                  pageTitle={post.title}
                  pageContent={post.content}
                />
              ) : (
                <div className="p-6 bg-white min-h-[500px]">
                  <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="text-lg font-medium text-slate-900">Manage FAQs</h3>
                      <p className="text-sm text-slate-500">Add questions and answers that will appear at the bottom of your post.</p>
                    </div>
                    <button
                      onClick={() => {
                        const newFaq = [...(post.faq || []), { question: "", answer: "" }];
                        setPost({ ...post, faq: newFaq });
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
                        placeholder="e.g. Got Questions?"
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Heading</label>
                      <input
                        type="text"
                        value={post.faqTitle || ""}
                        onChange={e => setPost({ ...post, faqTitle: e.target.value })}
                        placeholder="e.g. Frequently Asked Questions"
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Section Description</label>
                      <input
                        type="text"
                        value={post.faqDescription || ""}
                        onChange={e => setPost({ ...post, faqDescription: e.target.value })}
                        placeholder="e.g. Answers to common questions..."
                        className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm rounded outline-none focus:border-[#2271b1] bg-white shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {(post.faq || []).map((item: any, idx: number) => (
                      <div key={idx} className="p-6 border border-slate-200 rounded-lg bg-slate-50/30 relative group hover:border-primary/30 transition-colors">
                        <button
                          onClick={() => {
                            const newFaq = post.faq.filter((_: any, i: number) => i !== idx);
                            setPost({ ...post, faq: newFaq });
                          }}
                          className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                          title="Remove FAQ"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>

                        <div className="grid gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Question {idx + 1}</label>
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const newFaq = [...post.faq];
                                newFaq[idx].question = e.target.value;
                                setPost({ ...post, faq: newFaq });
                              }}
                              placeholder="e.g. What are the benefits of professional roofing?"
                              className="w-full border border-[#c3c4c7] px-4 py-2.5 text-sm outline-none focus:border-[#2271b1] bg-white rounded shadow-sm"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Answer</label>
                            <textarea
                              value={item.answer}
                              onChange={(e) => {
                                const newFaq = [...post.faq];
                                newFaq[idx].answer = e.target.value;
                                setPost({ ...post, faq: newFaq });
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

                  {/* Bulk FAQ Schema Markup */}
                  <div className="mt-8 space-y-2 border-t border-slate-200 pt-6">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">FAQ Schema Markup (Bulk JSON-LD)</label>
                    <p className="text-xs text-slate-400">Paste a single JSON-LD schema block covering all your FAQs. This will be injected into the page as structured data.</p>
                    <textarea
                      value={post.faqSchemaMarkup || ""}
                      onChange={(e) => setPost({ ...post, faqSchemaMarkup: e.target.value })}
                      rows={8}
                      placeholder='{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", ...}]}'
                      className="w-full border border-[#c3c4c7] p-4 text-sm font-mono outline-none focus:border-[#2271b1] resize-y bg-white rounded shadow-sm"
                    />
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
                <span className="flex items-center gap-1.5"><Settings className="w-3.5 h-3.5 text-[#82878c]" /> Status:</span>
                <select
                  value={post.status}
                  onChange={(e) => setPost({ ...post, status: e.target.value })}
                  className="bg-white border border-[#8c8f94] px-1 py-0.5 rounded outline-none focus:border-[#2271b1]"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#82878c]" /> Visibility:</span>
                <strong>Public</strong>
              </div>
              {post.slug && (
                <div className="pt-1">
                  <Link href={`/blog/${post.slug}`} target="_blank" className="text-[#2271b1] hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> View Post
                  </Link>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#82878c]" /> {post.status === 'published' ? 'Published on:' : 'Publish immediately'}</span>
                <strong>{new Date(post.publishedAt || Date.now()).toLocaleDateString()}</strong>
              </div>
            </div>
            <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
              <button className="text-[#d63638] underline text-[12px] hover:text-[#b32d2e]">Move to Trash</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2271b1] text-white text-[12px] font-semibold px-3 py-1 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96]"
              >
                {saving ? "..." : id ? "Update" : "Publish"}
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
                className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] bg-white transition-all"
              />
            </div>
          </div>

          {/* Excerpt Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Excerpt</h2>
            </div>
            <div className="p-3">
              <textarea
                value={post.excerpt}
                onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                rows={4}
                placeholder="Write a brief summary..."
                className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] rounded-[3px] resize-none leading-relaxed bg-white transition-all"
              />
              <p className="text-[10px] text-[#646970] mt-1.5 leading-normal">Excerpts are optional hand-crafted summaries of your content.</p>
            </div>
          </div>

          {/* Categories Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Categories</h2>
            </div>
            <div className="p-3 max-h-48 overflow-y-auto space-y-1.5">
              {categories.map(cat => (
                <label key={cat._id} className="flex items-center gap-2 text-[12px] text-[#2c3338] cursor-pointer hover:text-[#2271b1]">
                  <input
                    type="checkbox"
                    checked={post.categories?.includes(cat._id)}
                    onChange={(e) => {
                      const newCats = e.target.checked
                        ? [...post.categories, cat._id]
                        : post.categories.filter((id: string) => id !== cat._id);
                      setPost({ ...post, categories: newCats });
                    }}
                  />
                  {cat.name}
                </label>
              ))}
              <button onClick={() => router.push('/admin/blog/categories')} className="text-[#2271b1] underline text-[11px] block mt-2">+ Add New Category</button>
            </div>
          </div>


          {/* Tags Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Tags</h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="flex flex-wrap gap-1.5 min-h-6 border border-[#c3c4c7] p-2 rounded-sm bg-slate-50/30">
                {post.tags?.map((tagId: string) => {
                  const tag = tags.find(t => t._id === tagId);
                  if (!tag) return null;
                  return (
                    <span key={tagId} className="inline-flex items-center gap-1 bg-[#f0f0f1] px-2 py-0.5 rounded-full text-[11px] text-[#2c3338] border border-[#dcdcde]">
                      {tag.name}
                      <button onClick={() => setPost({ ...post, tags: post.tags.filter((t: string) => t !== tagId) })} className="hover:text-red-500 font-bold">×</button>
                    </span>
                  );
                })}
              </div>
              <div className="flex gap-1">
                <select
                  onChange={(e) => {
                    if (e.target.value && !post.tags.includes(e.target.value)) {
                      setPost({ ...post, tags: [...post.tags, e.target.value] });
                    }
                    e.target.value = "";
                  }}
                  className="flex-1 bg-white border border-[#c3c4c7] px-2 py-1 text-[11px] outline-none"
                >
                  <option value="">Select Tag...</option>
                  {tags.filter(t => !post.tags.includes(t._id)).map(tag => (
                    <option key={tag._id} value={tag._id}>{tag.name}</option>
                  ))}
                </select>
              </div>
              <button onClick={() => router.push('/admin/blog/tags')} className="text-[#2271b1] underline text-[11px]">+ Manage Tags</button>
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
                    <button onClick={() => setPost({ ...post, featuredImage: "" })} className="text-white text-[12px] font-bold underline">Remove image</button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-[#c3c4c7] p-5 rounded-sm flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-[#dcdcde]" />
                  <p className="text-[11px] text-[#646970]">Set featured image</p>
                </div>
              )}
              <button
                onClick={() => setShowMediaSelector(true)}
                className="bg-[#f6f7f7] border border-[#2271b1] text-[#2271b1] text-[12px] font-semibold px-4 py-1.5 rounded-[3px] hover:bg-[#f0f6fb]"
              >
                {post.featuredImage ? "Replace image" : "Set featured image"}
              </button>
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
                featuredImage: post.seo.featuredImage || item.url,
                featuredImageAlt: post.seo.featuredImageAlt || item.alt || "",
                ogImage: post.seo.ogImage || item.url
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
            className={`fixed bottom-10 right-10 z-[100] px-4 py-2 bg-white border-l-4 text-[12px] shadow-lg ${message.includes("Error") ? "border-[#d63638]" : "border-[#00a32a]"}`}>
            <p className="text-[#1d2327] m-0">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}