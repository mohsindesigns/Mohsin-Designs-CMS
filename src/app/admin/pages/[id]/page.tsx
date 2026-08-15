"use client";

import { useState, useEffect, use } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Loader2, LayoutTemplate, ChevronRight,
  Settings, Type, Image as ImageIcon, Briefcase,
  Star, CircleHelp, Phone, Users, Globe, ArrowUpRight, Trash2, ArrowLeft, ExternalLink,
  ChevronDown, Calendar, Eye
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
          <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
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

            <div className="p-0 overflow-x-auto">
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
                <div className="p-5 sm:p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f1] pb-4">
                    <div>
                      <h3 className="text-base font-bold text-[#1d2327]">Page-Specific FAQs</h3>
                      <p className="text-[12px] text-[#646970] mt-0.5">These FAQs will appear at the bottom of this specific page.</p>
                    </div>
                    <button onClick={() => {
                      const currentFaqs = Array.isArray(content.faqs) ? content.faqs : [];
                      const nf = [...currentFaqs];
                      nf.push({ question: "", answer: "" });
                      setContent({ ...content, faqs: nf });
                    }} className="bg-white border border-[#2271b1] text-[#2271b1] px-3 py-1.5 text-[12px] font-semibold rounded-[3px] hover:bg-[#f0f6fb] transition-colors self-start">+ Add FAQ</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FAQ Section Badge</label>
                      <input
                        type="text"
                        value={content.faqBadge || ""}
                        onChange={e => setContent({ ...content, faqBadge: e.target.value })}
                        placeholder="e.g. Got Questions?"
                        className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FAQ Section Heading</label>
                      <input
                        type="text"
                        value={content.faqTitle || ""}
                        onChange={e => setContent({ ...content, faqTitle: e.target.value })}
                        placeholder="e.g. Frequently Asked Questions"
                        className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">FAQ Section Description</label>
                      <input
                        type="text"
                        value={content.faqDescription || ""}
                        onChange={e => setContent({ ...content, faqDescription: e.target.value })}
                        placeholder="e.g. Answers to common questions..."
                        className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Question & Answer List</h4>
                    {(!content.faqs || content.faqs.length === 0) ? (
                      <div className="text-[13px] text-[#646970] italic bg-[#f6f7f7] p-6 text-center border border-dashed border-[#c3c4c7] rounded-[3px]">No FAQs added for this page yet. Click "+ Add FAQ" above to start.</div>
                    ) : (
                      <div className="space-y-5">
                         {content.faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="bg-white border border-[#c3c4c7] p-5 rounded-[4px] shadow-sm hover:shadow-md transition-all space-y-4 relative">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1 space-y-4">
                                <div className="space-y-4">
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Question {idx + 1}</span>
                                    <RichTextEditor
                                      content={faq.question || ""}
                                      onChange={(val) => {
                                        const nf = [...content.faqs];
                                        nf[idx].question = val;
                                        setContent({ ...content, faqs: nf });
                                      }}
                                      placeholder="Question"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Answer {idx + 1}</span>
                                    <RichTextEditor
                                      content={faq.answer || ""}
                                      onChange={(val) => {
                                        const nf = [...content.faqs];
                                        nf[idx].answer = val;
                                        setContent({ ...content, faqs: nf });
                                      }}
                                      placeholder="Answer"
                                    />
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => {
                                setContent({ ...content, faqs: content.faqs.filter((_: any, i: number) => i !== idx) });
                              }} className="text-[#d63638] hover:bg-red-50 p-1.5 rounded-[3px] transition-colors self-start mt-5" title="Delete FAQ Item"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="pt-5 border-t border-[#c3c4c7] space-y-2">
                    <label className="text-[13px] font-bold text-[#1d2327]">FAQ Schema Markup (Bulk JSON-LD)</label>
                    <p className="text-[12px] text-[#646970] mt-0.5">Paste a single JSON-LD schema block covering all FAQs for this page.</p>
                    <textarea
                      value={content.faqSchemaMarkup || ""}
                      onChange={e => setContent({ ...content, faqSchemaMarkup: e.target.value })}
                      className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      rows={8}
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