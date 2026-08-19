"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, LayoutTemplate, ChevronRight,
  Settings, Type, Image as ImageIcon, Briefcase,
  Star, CircleHelp, Phone, Users, Globe, ArrowUpRight, Trash2, ArrowLeft, ExternalLink,
  ChevronDown, Calendar, Eye, BookOpen
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TemplateEditors } from "@/components/admin/editors";
import SeoEditor from "@/components/admin/SeoEditor";
import MediaSelector from "@/components/admin/MediaSelector";
import { BASE_URL } from "@/lib/constants";
import dynamic from "next/dynamic";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-20 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});

const EDITOR_TEMPLATES = [
  { id: 'home', label: 'Home Page', icon: LayoutTemplate },
  { id: 'about', label: 'About Us', icon: Type },
  { id: 'services', label: 'Services Index', icon: Briefcase },
  { id: 'gallery', label: 'Project Gallery', icon: ImageIcon },
  { id: 'team', label: 'Team Directory', icon: Users },
  { id: 'careers', label: 'Career Board', icon: Briefcase },
  { id: 'reviews', label: 'Client Reviews', icon: Star },
  { id: 'faq', label: 'Support FAQ', icon: CircleHelp },
  { id: 'contact', label: 'Contact Center', icon: Phone },
  { id: 'service-area', label: 'Service Area', icon: Globe },
  { id: 'blog', label: 'Blog Index', icon: BookOpen },
];

export default function DynamicPageEditor({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [page, setPage] = useState<any>(null);
  const [content, setContent] = useState<any>(null);
  const [seo, setSeo] = useState<any>({});
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'faqs'>('content');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  useEffect(() => {
    fetchPage();
  }, [id]);

  const fetchPage = async () => {
    try {
      const res = await fetch(`/api/admin/pages/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPage(data);
        const pageContent = data.content || {};
        if (!pageContent.faqs) pageContent.faqs = [];
        setContent(pageContent);
        setSeo(data.seo || {});
        if (data.template === 'faq') {
          setActiveTab('faqs');
        }
      } else {
        router.push('/admin/pages');
      }
    } catch (err) {
      console.error("Failed to fetch page:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate bulk FAQ JSON-LD schema markup
    const bulkSchema = (content.faqSchemaMarkup || "").trim();
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
        alert("Invalid JSON in FAQ Schema Markup. Please correct it before saving.");
        return;
      }
    }


    setSaving(true);
    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: page.title,
          slug: page.slug,
          template: page.template,
          status: page.status,
          seo: seo,
          content: content
        }),
      });
      if (res.ok) {
        setMessage("Page updated.");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch (err) {
      setMessage("Error saving changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to move this page to Trash?")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (res.ok) router.push("/admin/pages");
    } catch (err) {
      alert("Delete failed.");
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[#646970] font-serif">Loading...</div>;

  return (
    <div className="bg-[#f0f0f1] font-sans pb-10 max-w-full overflow-hidden">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-3 px-1">
        <Link href="/admin/pages" className="hover:underline">Pages</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
        <span className="text-[#646970] truncate">{page?.title || "Edit Page"}</span>
      </div>

      {/* WP Header Area */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-[20px] font-normal text-[#1d2327] font-serif">Edit Page</h1>
          <Link href="/admin/pages" className="bg-white border border-[#2271b1] text-[#2271b1] text-[12px] px-1.5 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] transition-colors">Add New</Link>
          {page?.slug && (
            <Link
              href={page.slug === 'home' ? '/' : `/${page.slug}`}
              target="_blank"
              className="bg-white border border-[#c3c4c7] text-[#2c3338] text-[12px] px-1.5 py-0.5 rounded-[3px] hover:bg-[#f6f7f7] transition-colors flex items-center gap-1"
            >
              View Page <ExternalLink className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* Main Content (Left Column) */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Title Input Field */}
          <div className="bg-white">
            <input
              type="text"
              value={page.title || ""}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[16px] font-medium text-[#1d2327] focus:border-[#2271b1] focus:ring-0 outline-none placeholder:text-[#c3c4c7]"
              placeholder="Enter title here"
            />
          </div>

          {/* Permalink / Slug Area */}
          <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#646970] px-1">
            <strong>Permalink:</strong>
            <span className="bg-[#f0f0f1] border border-[#c3c4c7] px-1 rounded-sm text-[#1d2327] break-all">
              {BASE_URL}/{page.slug}
            </span>
            <button
              onClick={() => {
                const ns = prompt("Enter new slug:", page.slug);
                if (ns) setPage({ ...page, slug: ns });
              }}
              className="bg-white border border-[#c3c4c7] px-1.5 py-0.5 rounded-[3px] text-[#2c3338] hover:bg-[#f6f7f7]"
            >
              Edit
            </button>
          </div>

          {/* Main Editor Tabs */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm">
            <div className="flex border-b border-[#f0f0f1] bg-[#f6f7f7]">
              {page?.template !== 'faq' && (
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'content' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                    }`}
                >
                  Page Content
                </button>
              )}
              <button
                onClick={() => setActiveTab('seo')}
                className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'seo' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                  }`}
              >
                SEO Settings
              </button>
              <button
                onClick={() => setActiveTab('faqs')}
                className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${activeTab === 'faqs' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                  }`}
              >
                Page FAQs
              </button>
            </div>

            <div className="p-0">
              {activeTab === 'content' ? (
                <div className="p-4 sm:p-5">
                  {TemplateEditors[page.template] ? (
                    (() => {
                      const Editor = TemplateEditors[page.template];
                      return <Editor pageId={id} data={content} setData={setContent} />;
                    })()
                  ) : (
                    <div className="p-10 text-center text-[#646970] text-[13px]">
                      Select a template in the right sidebar to start editing.
                    </div>
                  )}
                </div>
              ) : activeTab === 'seo' ? (
                <SeoEditor
                  data={seo}
                  setData={setSeo}
                  pageSlug={page.slug}
                  pageTitle={page.title}
                  pageContent={content}
                />
              ) : (
                <div className="p-5 sm:p-6 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f1] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1d2327]">Page-Specific FAQs & Sticky Strategy Session</h3>
                      <p className="text-[12px] text-[#646970] mt-0.5">These FAQs and strategy audit box will appear on this page.</p>
                    </div>
                    <button onClick={() => {
                      const currentFaqs = Array.isArray(content.faqs) ? content.faqs : [];
                      const nf = [...currentFaqs];
                      nf.push({ question: "", answer: "", category: "GENERAL" });
                      setContent({ ...content, faqs: nf });
                    }} className="bg-white border border-[#2271b1] text-[#2271b1] px-3.5 py-1.5 text-[12px] font-bold rounded-[3px] hover:bg-[#f0f6fb] transition-colors self-start">+ Add FAQ Question</button>
                  </div>

                  {/* 1. Header Narrative */}
                  <div className="space-y-4">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">1. Section Header Narrative</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Badge / Tag</label>
                        <input
                          type="text"
                          value={content.faqBadge || content.sectionTag || ""}
                          onChange={e => setContent({ ...content, faqBadge: e.target.value, sectionTag: e.target.value })}
                          placeholder="e.g. FREQUENTLY ASKED QUESTIONS"
                          className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Headline Intro (Prefix - Optional)</label>
                        <input
                          type="text"
                          value={content.faqTitleIntro !== undefined ? content.faqTitleIntro : (content.faqTitle ? "" : "")}
                          onChange={e => setContent({ ...content, faqTitleIntro: e.target.value })}
                          placeholder="e.g. Common Questions,"
                          className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Headline Highlight / Title</label>
                        <input
                          type="text"
                          value={content.faqTitleHighlight !== undefined ? content.faqTitleHighlight : (content.faqTitle || "")}
                          onChange={e => setContent({ ...content, faqTitleHighlight: e.target.value, faqTitle: e.target.value })}
                          placeholder="e.g. Clear Answers"
                          className="w-full border border-[#2271b1] text-[#2271b1] font-bold px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description Subtext</label>
                      <textarea
                        rows={2}
                        value={content.faqDescription || ""}
                        onChange={e => setContent({ ...content, faqDescription: e.target.value })}
                        placeholder="e.g. Everything you need to know about our modern engineering process, turnaround times, and pricing models."
                        className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                      />
                    </div>
                  </div>

                  {/* 2. Strategy Session Box */}
                  <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">2. Sticky Strategy Session Box</h4>
                    <div className="bg-[#f6f7f7] border border-[#dcdcde] p-4 rounded-[4px] space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Badge Label</label>
                          <input
                            type="text"
                            value={content.strategyAudit?.badge || "FREE ARCHITECTURE AUDIT"}
                            onChange={e => setContent({
                              ...content,
                              strategyAudit: { ...(content.strategyAudit || {}), badge: e.target.value }
                            })}
                            className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-[#50575e]">Card Headline</label>
                          <input
                            type="text"
                            value={content.strategyAudit?.title || "Have a complex custom build in mind?"}
                            onChange={e => setContent({
                              ...content,
                              strategyAudit: { ...(content.strategyAudit || {}), title: e.target.value }
                            })}
                            className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[13px] font-bold bg-white rounded-[3px]"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase text-[#50575e]">Card Description</label>
                        <textarea
                          rows={2}
                          value={content.strategyAudit?.desc || "Book a 30-minute high-level technical strategy session with our lead engineer."}
                          onChange={e => setContent({
                            ...content,
                            strategyAudit: { ...(content.strategyAudit || {}), desc: e.target.value }
                          })}
                          className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white rounded-[3px]"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-[#50575e]">CTA Button Text</label>
                          <input
                            type="text"
                            value={content.strategyAudit?.button || "Book Architecture Call"}
                            onChange={e => setContent({
                              ...content,
                              strategyAudit: { ...(content.strategyAudit || {}), button: e.target.value }
                            })}
                            className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white rounded-[3px]"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase text-[#50575e]">CTA Button Link</label>
                          <input
                            type="text"
                            value={content.strategyAudit?.href || "#contact"}
                            onChange={e => setContent({
                              ...content,
                              strategyAudit: { ...(content.strategyAudit || {}), href: e.target.value }
                            })}
                            className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[13px] bg-white rounded-[3px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 3. Question & Answer Accordion List */}
                  <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                    <div className="flex justify-between items-center">
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">3. Question & Answer List (Accordion)</h4>
                      <button onClick={() => {
                        const currentFaqs = Array.isArray(content.faqs) ? content.faqs : [];
                        const nf = [...currentFaqs];
                        nf.push({ question: "", answer: "", category: "GENERAL" });
                        setContent({ ...content, faqs: nf });
                      }} className="text-[#2271b1] text-xs font-bold hover:underline">+ Add FAQ</button>
                    </div>

                    {(!content.faqs || content.faqs.length === 0) ? (
                      <div className="text-[13px] text-[#646970] italic bg-[#f6f7f7] p-6 text-center border border-dashed border-[#c3c4c7] rounded-[3px]">
                        No custom FAQs added for this page yet. It will use the default global FAQ items. Click "+ Add FAQ Question" to create page-specific ones.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {content.faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="bg-white border border-[#c3c4c7] p-4 sm:p-5 rounded-[4px] shadow-sm space-y-3 relative">
                            <div className="flex justify-between items-center pb-2 border-b border-[#e2e4e7]">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-[#2271b1]">#{String(idx + 1).padStart(2, "0")}</span>
                                <span className="text-[12px] font-bold text-[#1d2327]">Question {idx + 1}</span>
                              </div>
                              <button
                                onClick={() => {
                                  setContent({ ...content, faqs: content.faqs.filter((_: any, i: number) => i !== idx) });
                                }}
                                className="text-[#d63638] hover:bg-red-50 p-1 rounded text-xs font-semibold flex items-center gap-1"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-[#50575e]">Category Tag</label>
                                <input
                                  type="text"
                                  value={faq.category || "GENERAL"}
                                  onChange={e => {
                                    const nf = [...content.faqs];
                                    nf[idx].category = e.target.value;
                                    setContent({ ...content, faqs: nf });
                                  }}
                                  placeholder="e.g. PRICING"
                                  className="w-full border border-[#c3c4c7] px-2.5 py-1.5 text-xs font-mono font-bold uppercase rounded-[3px] bg-white"
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-3">
                                <label className="text-[10px] font-bold uppercase text-[#50575e]">Question Headline</label>
                                <input
                                  type="text"
                                  value={faq.question || ""}
                                  onChange={e => {
                                    const nf = [...content.faqs];
                                    nf[idx].question = e.target.value;
                                    setContent({ ...content, faqs: nf });
                                  }}
                                  placeholder="e.g. What is your typical project timeline?"
                                  className="w-full border border-[#c3c4c7] px-3 py-1.5 text-sm font-bold rounded-[3px] bg-white"
                                />
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold uppercase text-[#50575e]">Answer Content</label>
                              <textarea
                                rows={3}
                                value={faq.answer || ""}
                                onChange={e => {
                                  const nf = [...content.faqs];
                                  nf[idx].answer = e.target.value;
                                  setContent({ ...content, faqs: nf });
                                }}
                                placeholder="Write clear, detailed answer here..."
                                className="w-full border border-[#c3c4c7] px-3 py-2 text-xs leading-relaxed rounded-[3px] bg-white"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 4. Schema Markup */}
                  <div className="pt-5 border-t border-[#c3c4c7] space-y-2">
                    <label className="text-[13px] font-bold text-[#1d2327]">FAQ Schema Markup (Bulk JSON-LD)</label>
                    <p className="text-[12px] text-[#646970] mt-0.5">Paste a single JSON-LD schema block covering all FAQs for this page.</p>
                    <textarea
                      value={content.faqSchemaMarkup || ""}
                      onChange={e => setContent({ ...content, faqSchemaMarkup: e.target.value })}
                      className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      rows={6}
                      placeholder='e.g. {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...]}'
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar (Right Column) */}
        <div className="w-full lg:w-[260px] flex-shrink-0 space-y-4">
          {/* Publish Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Publish</h2>
            </div>
            <div className="p-3 space-y-2 text-[12px] text-[#2c3338]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#82878c]" /> Status:</span>
                <select
                  value={page.status || "published"}
                  onChange={(e) => setPage({ ...page, status: e.target.value })}
                  className="bg-white border border-[#8c8f94] text-[12px] px-1 py-0.5 rounded-[3px] outline-none focus:border-[#2271b1]"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#82878c]" /> Date:</span>
                <strong>{new Date().toLocaleDateString()}</strong>
              </div>
              {page?.slug && (
                <div className="pt-2 border-t border-[#f0f0f1] mt-2">
                  <Link
                    href={page.slug === 'home' ? '/' : `/${page.slug}`}
                    target="_blank"
                    className="text-[#2271b1] hover:underline flex items-center gap-1"
                  >
                    View Page <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
            <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
              <button onClick={handleDelete} className="text-[#d63638] underline text-[12px] hover:text-[#b32d2e]">Trash</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#2271b1] text-white text-[12px] font-semibold px-3 py-1 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] disabled:opacity-50"
              >
                {saving ? "..." : "Update"}
              </button>
            </div>
          </div>

          {/* Page Attributes Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Attributes</h2>
            </div>
            <div className="p-3 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-[#1d2327]">Template</label>
                <select
                  value={page.template}
                  onChange={(e) => setPage({ ...page, template: e.target.value })}
                  className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[12px] rounded-[3px] outline-none focus:border-[#2271b1]"
                >
                  {EDITOR_TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Featured Image Box */}
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
            <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Featured Image</h2>
            </div>
            <div className="p-3">
              {seo?.featuredImage ? (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-slate-50 border border-[#c3c4c7] rounded-sm overflow-hidden group">
                    <img
                      src={seo.featuredImage}
                      alt="Featured"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSeo({ ...seo, featuredImage: '' })}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowMediaSelector(true)}
                    className="text-[#2271b1] underline text-[12px] hover:text-[#135e96]"
                  >
                    Set featured image
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowMediaSelector(true)}
                  className="text-[#2271b1] underline text-[12px] hover:text-[#135e96]"
                >
                  Set featured image
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showMediaSelector && (
          <MediaSelector
            onSelect={(item: any) => {
              const url = item.url;
              const altText = item.alt || '';
              setSeo((prev: any) => ({
                ...prev,
                featuredImage: url,
                featuredImageAlt: altText,
                ogImage: prev.ogImage || url,
                twitterImage: prev.twitterImage || url,
              }));
              setShowMediaSelector(false);
            }}
            onClose={() => setShowMediaSelector(false)}
          />
        )}
      </AnimatePresence>

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