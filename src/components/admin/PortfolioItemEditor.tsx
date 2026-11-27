"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Loader2, ChevronRight, ExternalLink, Plus, Trash2, Star, AlertTriangle
} from "lucide-react";
import Link from "@/components/ui/Link";
import { motion, AnimatePresence } from "framer-motion";
import ImageField from "./ImageField";
import SectionToggle from "./SectionToggle";
import SeoEditor from "./SeoEditor";
import PortfolioServiceSelector from "./PortfolioServiceSelector";
import { adminApiUrl } from "@/lib/adminApi";
import { BASE_URL } from "@/lib/constants";

interface PortfolioItemEditorProps {
  id?: string;
}

const EMPTY_SEO = {
  metaTitle: "", metaDescription: "", focusKeyword: "", canonicalUrl: "",
  metaRobotsIndex: "index", metaRobotsFollow: "follow",
  ogTitle: "", ogDescription: "", ogImage: "",
  twitterCard: "summary_large_image", twitterTitle: "", twitterDescription: "", twitterImage: "",
  featuredImage: "", featuredImageAlt: "", breadcrumbTitle: "", schemaData: ""
};

const EMPTY_SECTIONS = {
  heroImage: { enabled: true, image: "", alt: "" },
  challenge: { enabled: true, heading: "", body: "", bulletPoints: [] as string[] },
  approach: { enabled: true, heading: "", steps: [] as { number: string; title: string; body: string }[] },
  beforeAfter: { enabled: true, heading: "", beforeImage: "", beforeLabel: "", afterImage: "", afterLabel: "" },
  gallery: { enabled: true, heading: "", images: [] as { image: string; label: string }[] },
  results: { enabled: true, heading: "", stats: [] as { value: string; label: string }[], proofImage: "" },
  testimonial: { enabled: true, quote: "", authorName: "", authorRole: "", authorAvatar: "" },
};

const NEW_ITEM = {
  title: "", slug: "", client: "", industry: "", summary: "",
  services: [] as string[], thumbnail: "", thumbnailLabel: "",
  metrics: [] as { value: string; label: string }[],
  featured: false, location: "", timeline: "", liveUrl: "",
  tags: [] as string[], nextProjectSlug: "",
  status: "draft", publishedAt: "",
  sections: EMPTY_SECTIONS,
  seo: { ...EMPTY_SEO }
};

const slugify = (text: string) =>
  text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const normalizeItem = (data: any) => ({
  ...NEW_ITEM,
  ...data,
  services: Array.isArray(data?.services) ? data.services.map(String) : [],
  tags: Array.isArray(data?.tags) ? data.tags.map(String) : [],
  metrics: Array.isArray(data?.metrics) ? data.metrics : [],
  seo: { ...EMPTY_SEO, ...(data?.seo || {}) },
  sections: {
    heroImage: { ...EMPTY_SECTIONS.heroImage, ...(data?.sections?.heroImage || {}) },
    challenge: { ...EMPTY_SECTIONS.challenge, ...(data?.sections?.challenge || {}), bulletPoints: Array.isArray(data?.sections?.challenge?.bulletPoints) ? data.sections.challenge.bulletPoints : [] },
    approach: { ...EMPTY_SECTIONS.approach, ...(data?.sections?.approach || {}), steps: Array.isArray(data?.sections?.approach?.steps) ? data.sections.approach.steps : [] },
    beforeAfter: { ...EMPTY_SECTIONS.beforeAfter, ...(data?.sections?.beforeAfter || {}) },
    gallery: { ...EMPTY_SECTIONS.gallery, ...(data?.sections?.gallery || {}), images: Array.isArray(data?.sections?.gallery?.images) ? data.sections.gallery.images : [] },
    results: { ...EMPTY_SECTIONS.results, ...(data?.sections?.results || {}), stats: Array.isArray(data?.sections?.results?.stats) ? data.sections.results.stats : [] },
    testimonial: { ...EMPTY_SECTIONS.testimonial, ...(data?.sections?.testimonial || {}) },
  },
  publishedAt: data?.publishedAt || ""
});

const inputCls = "w-full border border-[#8c8f94] px-2.5 py-1.5 text-xs rounded-[3px] bg-white focus:border-[#2271b1] outline-none";
const labelCls = "text-[11px] font-bold text-[#50575e] block mb-1";
const boxCls = "bg-[#f8f9fa] border border-[#dcdcde] p-4 rounded-[4px] space-y-4";

export default function PortfolioItemEditor({ id }: PortfolioItemEditorProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!id);
  const [loadError, setLoadError] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"ok" | "error">("ok");
  const [dirty, setDirty] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sections" | "services" | "seo">("overview");

  const [item, setItemRaw] = useState<any>(normalizeItem(NEW_ITEM));
  const setItem = (next: any) => { setItemRaw(next); setDirty(true); };
  const update = (patch: (prev: any) => any) => setItem(patch(item));

  const [slugTouched, setSlugTouched] = useState(!!id);
  // Raw text while typing, so a typed comma/newline/space is not stripped before the next entry starts.
  const [tagsText, setTagsText] = useState<string | null>(null);
  const [bulletsText, setBulletsText] = useState<string | null>(null);
  const originalSlug = useRef<string>("");

  useEffect(() => {
    if (id) fetchItem();
  }, [id]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const toast = (text: string, type: "ok" | "error" = "ok") => {
    setMessageType(type);
    setMessage(text);
    setTimeout(() => setMessage(""), type === "error" ? 6000 : 3000);
  };

  const fetchItem = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await fetch(adminApiUrl(`/api/admin/portfolio/items/${id}`));
      const data = await res.json();
      if (res.ok) {
        originalSlug.current = data.slug || "";
        setItemRaw(normalizeItem(data));
        setTagsText(null);
        setBulletsText(null);
        setDirty(false);
      } else {
        setLoadError(data?.error || "Could not load this case study.");
      }
    } catch {
      setLoadError("Could not load this case study.");
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = () => {
    if (slugTouched || !item.title) return;
    setItemRaw((p: any) => ({ ...p, slug: slugify(p.title) }));
  };

  const handleSave = async (mode?: "draft" | "publish") => {
    if (saving) return;
    let status = item.status;
    if (mode === "draft") status = "draft";
    if (mode === "publish" && status === "draft") status = "published";

    const title = (item.title || "").trim();
    const slug = slugify(item.slug || title);
    if (!title) return toast("Please enter a title.", "error");
    if (!slug) return toast("Please enter a slug (letters or numbers).", "error");

    const payload: any = { ...item, title, slug, status };
    delete payload._id;
    delete payload.__v;
    delete payload.createdAt;
    delete payload.updatedAt;

    setSaving(true);
    try {
      const url = adminApiUrl(id ? `/api/admin/portfolio/items/${id}` : "/api/admin/portfolio/items");
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setDirty(false);
        if (!id && data._id) {
          router.push(`/admin/portfolio/${String(data._id)}`);
          return;
        }
        originalSlug.current = data.slug || slug;
        setItemRaw(normalizeItem({ ...item, ...data }));
        setTagsText(null);
        setBulletsText(null);
        toast(data.status === "published" ? "Case study saved and live." : "Draft saved.");
      } else {
        toast(data?.error || "Failed to save case study.", "error");
      }
    } catch {
      toast("Failed to save case study.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTrash = async () => {
    if (!id) return;
    if (!confirm("Move this case study to Trash?")) return;
    try {
      const res = await fetch(adminApiUrl(`/api/admin/portfolio/items/${id}`), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isTrashed: true }),
      });
      if (res.ok) { setDirty(false); router.push("/admin/portfolio"); }
      else toast("Failed to move to Trash.", "error");
    } catch {
      toast("Failed to move to Trash.", "error");
    }
  };

  if (loading) return <div className="p-10 text-center text-[#646970]">Loading editor...</div>;
  if (loadError) {
    return (
      <div className="p-10 text-center space-y-3">
        <p className="text-[#d63638] text-[13px]">{loadError}</p>
        <div className="flex items-center justify-center gap-4 text-[13px]">
          <button onClick={fetchItem} className="text-[#2271b1] underline">Try again</button>
          <Link href="/admin/portfolio" className="text-[#2271b1] underline">Back to portfolio</Link>
        </div>
      </div>
    );
  }

  const slugChangedOnLive = !!id && item.status === "published" && !!originalSlug.current && slugify(item.slug) !== originalSlug.current;
  const viewLabel = item.status === "published" ? "View" : "Preview";

  const section = item.sections || EMPTY_SECTIONS;
  const updateSection = (key: keyof typeof EMPTY_SECTIONS, patch: any) =>
    update((prev) => ({ ...prev, sections: { ...prev.sections, [key]: { ...prev.sections[key], ...patch } } }));

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: "overview", label: "01. Overview & Card" },
    { id: "sections", label: "02. Case Study Sections" },
    { id: "services", label: "03. Linked Services" },
    { id: "seo", label: "04. SEO" },
  ];

  return (
    <div className="bg-[#f0f0f1] min-h-screen font-sans pb-10">
      <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-3 px-1">
        <Link href="/admin/portfolio" className="hover:underline">Portfolio</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
        <span className="text-[#646970] truncate">{item.title || (id ? "Edit Case Study" : "Add New Case Study")}</span>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-[23px] font-normal text-[#1d2327] font-serif">{id ? "Edit Case Study" : "Add New Case Study"}</h1>
          {!id && <button type="button" onClick={() => handleSave("draft")} disabled={saving} className="bg-white border border-[#2271b1] text-[#2271b1] text-[13px] px-2 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] disabled:opacity-50">Save Draft</button>}
          {dirty && <span className="text-[11px] text-[#996800]">Unsaved changes</span>}
        </div>
        <div className="flex items-center gap-3">
          {id && item.slug && (
            <Link href={`/portfolio/${item.slug}`} target="_blank" className="flex items-center gap-1.5 text-[#2271b1] text-[13px] hover:text-[#135e96]">
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
            {id ? "Update" : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 items-start">
        <div className="flex-1 w-full min-w-0 space-y-4">
          <div className="bg-white">
            <input
              type="text"
              value={item.title}
              onChange={(e) => setItem({ ...item, title: e.target.value })}
              onBlur={generateSlug}
              placeholder="Case study title (e.g. Burish Builders)"
              className="w-full border border-[#c3c4c7] px-3.5 py-2.5 text-[18px] font-medium text-[#1d2327] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none shadow-sm"
            />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#646970]">
              <strong>Permalink:</strong>
              <span className="whitespace-nowrap">{BASE_URL}/portfolio/</span>
              <input
                type="text"
                value={item.slug}
                onChange={(e) => { setSlugTouched(true); setItem({ ...item, slug: e.target.value }); }}
                onBlur={() => setItemRaw((p: any) => ({ ...p, slug: slugify(p.slug) }))}
                placeholder="case-study-slug"
                className="bg-white px-1.5 py-0.5 rounded border border-[#c3c4c7] min-w-[160px] flex-1 max-w-md text-[12px] text-[#1d2327] outline-none focus:border-[#2271b1]"
              />
            </div>
            {slugChangedOnLive && (
              <p className="mt-1 text-[11px] text-[#996800]">This case study is live: changing the slug changes its public URL.</p>
            )}
          </div>

          <div className="bg-white border border-[#c3c4c7] shadow-sm overflow-hidden">
            <div className="flex overflow-x-auto border-b border-[#f0f0f1] bg-[#f6f7f7] no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2.5 text-[12px] font-semibold border-r border-[#c3c4c7] whitespace-nowrap shrink-0 transition-all ${
                    activeTab === tab.id ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-5">
              {activeTab === "overview" && (
                <>
                  <div className={boxCls}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Card & Client Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={labelCls}>Client</label>
                        <input value={item.client} onChange={(e) => setItem({ ...item, client: e.target.value })} className={inputCls} placeholder="Burish Builders" />
                      </div>
                      <div>
                        <label className={labelCls}>Industry</label>
                        <input value={item.industry} onChange={(e) => setItem({ ...item, industry: e.target.value })} className={inputCls} placeholder="Construction" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Summary (card blurb)</label>
                      <textarea value={item.summary} onChange={(e) => setItem({ ...item, summary: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="New brand and conversion-focused website that turned visitors into quote requests." />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={labelCls}>Location</label>
                        <input value={item.location} onChange={(e) => setItem({ ...item, location: e.target.value })} className={inputCls} placeholder="Casper, WY" />
                      </div>
                      <div>
                        <label className={labelCls}>Timeline</label>
                        <input value={item.timeline} onChange={(e) => setItem({ ...item, timeline: e.target.value })} className={inputCls} placeholder="6 months" />
                      </div>
                      <div>
                        <label className={labelCls}>Live site URL</label>
                        <input value={item.liveUrl} onChange={(e) => setItem({ ...item, liveUrl: e.target.value })} className={inputCls} placeholder="https://client-site.com" />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Tags (pill chips, comma separated)</label>
                      <input
                        value={tagsText ?? (item.tags || []).join(", ")}
                        onChange={(e) => { setTagsText(e.target.value); setItem({ ...item, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) }); }}
                        className={inputCls}
                        placeholder="Logo & Brand, Website Design, Lead Generation"
                      />
                    </div>
                  </div>

                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Thumbnail (listing card)</h3>
                      <label className="flex items-center gap-2 text-[12px] font-semibold text-[#1d2327] cursor-pointer">
                        <input type="checkbox" checked={!!item.featured} onChange={(e) => setItem({ ...item, featured: e.target.checked })} />
                        <Star className={`w-3.5 h-3.5 ${item.featured ? "text-amber-500 fill-amber-500" : "text-[#8c8f94]"}`} /> Featured case study
                      </label>
                    </div>
                    {item.featured && (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-[3px]">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> Only one case study should be featured at a time. Saving this one as featured will un-feature any other.
                      </p>
                    )}
                    <ImageField label="Thumbnail Image" value={item.thumbnail} onChange={(url) => setItem({ ...item, thumbnail: url })} />
                    <div>
                      <label className={labelCls}>Thumbnail label chip</label>
                      <input value={item.thumbnailLabel} onChange={(e) => setItem({ ...item, thumbnailLabel: e.target.value })} className={inputCls} placeholder="Homepage mockup" />
                    </div>
                  </div>

                  <div className={boxCls}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Metrics (up to 3, shown on card &amp; meta row)</h3>
                    {(item.metrics || []).map((m: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          value={m.value}
                          onChange={(e) => update((p) => ({ ...p, metrics: p.metrics.map((x: any, i: number) => (i === idx ? { ...x, value: e.target.value } : x)) }))}
                          className={inputCls + " max-w-[120px]"}
                          placeholder="48%"
                        />
                        <input
                          value={m.label}
                          onChange={(e) => update((p) => ({ ...p, metrics: p.metrics.map((x: any, i: number) => (i === idx ? { ...x, label: e.target.value } : x)) }))}
                          className={inputCls}
                          placeholder="overall boost"
                        />
                        <button type="button" onClick={() => update((p) => ({ ...p, metrics: p.metrics.filter((_: any, i: number) => i !== idx) }))} className="text-[#d63638] p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    {(item.metrics || []).length < 3 && (
                      <button type="button" onClick={() => update((p) => ({ ...p, metrics: [...(p.metrics || []), { value: "", label: "" }] }))} className="text-[#2271b1] text-[12px] font-semibold flex items-center gap-1">
                        <Plus className="w-3.5 h-3.5" /> Add metric
                      </button>
                    )}
                  </div>

                  <div className={boxCls}>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Next project override</h3>
                    <p className="text-[11px] text-[#646970]">Optional. Leave empty to auto-pick the next published case study by date.</p>
                    <input value={item.nextProjectSlug} onChange={(e) => setItem({ ...item, nextProjectSlug: e.target.value })} className={inputCls} placeholder="next-case-study-slug" />
                  </div>
                </>
              )}

              {activeTab === "sections" && (
                <>
                  {/* Hero image */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Hero Image</h3>
                      <SectionToggle enabled={section.heroImage.enabled} onChange={(v) => updateSection("heroImage", { enabled: v })} />
                    </div>
                    <ImageField label="Hero Image" value={section.heroImage.image} onChange={(url) => updateSection("heroImage", { image: url })} />
                    <input value={section.heroImage.alt} onChange={(e) => updateSection("heroImage", { alt: e.target.value })} className={inputCls} placeholder="Alt text" />
                  </div>

                  {/* Challenge */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">01 — The Challenge</h3>
                      <SectionToggle enabled={section.challenge.enabled} onChange={(v) => updateSection("challenge", { enabled: v })} />
                    </div>
                    <input value={section.challenge.heading} onChange={(e) => updateSection("challenge", { heading: e.target.value })} className={inputCls} placeholder="Great work on site, invisible online." />
                    <textarea value={section.challenge.body} onChange={(e) => updateSection("challenge", { body: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="Paragraph describing the starting problem." />
                    <div className="space-y-1.5">
                      <label className={labelCls}>Pain points (one per line)</label>
                      <textarea
                        value={bulletsText ?? (section.challenge.bulletPoints || []).join("\n")}
                        onChange={(e) => { setBulletsText(e.target.value); updateSection("challenge", { bulletPoints: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) }); }}
                        rows={3}
                        className={inputCls + " resize-none"}
                        placeholder={"No clear brand identity\nWebsite not generating leads\nHard to request a quote on mobile"}
                      />
                    </div>
                  </div>

                  {/* Approach */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">02 — Our Approach</h3>
                      <SectionToggle enabled={section.approach.enabled} onChange={(v) => updateSection("approach", { enabled: v })} />
                    </div>
                    <input value={section.approach.heading} onChange={(e) => updateSection("approach", { heading: e.target.value })} className={inputCls} placeholder="Three steps, one goal: more quote requests." />
                    {(section.approach.steps || []).map((s: any, idx: number) => (
                      <div key={idx} className="grid grid-cols-1 sm:grid-cols-[60px_1fr_1fr_auto] gap-2 items-start bg-white border border-[#dcdcde] p-2 rounded-[3px]">
                        <input value={s.number} onChange={(e) => updateSection("approach", { steps: section.approach.steps.map((x: any, i: number) => (i === idx ? { ...x, number: e.target.value } : x)) })} className={inputCls} placeholder="1" />
                        <input value={s.title} onChange={(e) => updateSection("approach", { steps: section.approach.steps.map((x: any, i: number) => (i === idx ? { ...x, title: e.target.value } : x)) })} className={inputCls} placeholder="Brand" />
                        <input value={s.body} onChange={(e) => updateSection("approach", { steps: section.approach.steps.map((x: any, i: number) => (i === idx ? { ...x, body: e.target.value } : x)) })} className={inputCls} placeholder="New logo, colors, typography." />
                        <button type="button" onClick={() => updateSection("approach", { steps: section.approach.steps.filter((_: any, i: number) => i !== idx) })} className="text-[#d63638] p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateSection("approach", { steps: [...(section.approach.steps || []), { number: String((section.approach.steps || []).length + 1), title: "", body: "" }] })} className="text-[#2271b1] text-[12px] font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add step
                    </button>
                  </div>

                  {/* Before/After */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">03 — Before / After</h3>
                      <SectionToggle enabled={section.beforeAfter.enabled} onChange={(v) => updateSection("beforeAfter", { enabled: v })} />
                    </div>
                    <input value={section.beforeAfter.heading} onChange={(e) => updateSection("beforeAfter", { heading: e.target.value })} className={inputCls} placeholder="Before → after" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <ImageField label="Before Image" value={section.beforeAfter.beforeImage} onChange={(url) => updateSection("beforeAfter", { beforeImage: url })} />
                        <input value={section.beforeAfter.beforeLabel} onChange={(e) => updateSection("beforeAfter", { beforeLabel: e.target.value })} className={inputCls} placeholder="BEFORE — old website / logo screenshot" />
                      </div>
                      <div className="space-y-2">
                        <ImageField label="After Image" value={section.beforeAfter.afterImage} onChange={(url) => updateSection("beforeAfter", { afterImage: url })} />
                        <input value={section.beforeAfter.afterLabel} onChange={(e) => updateSection("beforeAfter", { afterLabel: e.target.value })} className={inputCls} placeholder="AFTER — new website / logo" />
                      </div>
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Gallery</h3>
                      <SectionToggle enabled={section.gallery.enabled} onChange={(v) => updateSection("gallery", { enabled: v })} />
                    </div>
                    <input value={section.gallery.heading} onChange={(e) => updateSection("gallery", { heading: e.target.value })} className={inputCls} placeholder="More from this project" />
                    {(section.gallery.images || []).map((g: any, idx: number) => (
                      <div key={idx} className="bg-white border border-[#dcdcde] p-2 rounded-[3px] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-[#646970]">Image {idx + 1}</span>
                          <button type="button" onClick={() => updateSection("gallery", { images: section.gallery.images.filter((_: any, i: number) => i !== idx) })} className="text-[#d63638] p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                        <ImageField label="" value={g.image} onChange={(url) => updateSection("gallery", { images: section.gallery.images.map((x: any, i: number) => (i === idx ? { ...x, image: url } : x)) })} />
                        <input value={g.label} onChange={(e) => updateSection("gallery", { images: section.gallery.images.map((x: any, i: number) => (i === idx ? { ...x, label: e.target.value } : x)) })} className={inputCls} placeholder="Logo + brand board" />
                      </div>
                    ))}
                    <button type="button" onClick={() => updateSection("gallery", { images: [...(section.gallery.images || []), { image: "", label: "" }] })} className="text-[#2271b1] text-[12px] font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add gallery image
                    </button>
                  </div>

                  {/* Results */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">04 — The Results</h3>
                      <SectionToggle enabled={section.results.enabled} onChange={(v) => updateSection("results", { enabled: v })} />
                    </div>
                    <input value={section.results.heading} onChange={(e) => updateSection("results", { heading: e.target.value })} className={inputCls} placeholder="Numbers the client can feel." />
                    {(section.results.stats || []).map((s: any, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input value={s.value} onChange={(e) => updateSection("results", { stats: section.results.stats.map((x: any, i: number) => (i === idx ? { ...x, value: e.target.value } : x)) })} className={inputCls + " max-w-[120px]"} placeholder="300%" />
                        <input value={s.label} onChange={(e) => updateSection("results", { stats: section.results.stats.map((x: any, i: number) => (i === idx ? { ...x, label: e.target.value } : x)) })} className={inputCls} placeholder="increase in customer interaction" />
                        <button type="button" onClick={() => updateSection("results", { stats: section.results.stats.filter((_: any, i: number) => i !== idx) })} className="text-[#d63638] p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => updateSection("results", { stats: [...(section.results.stats || []), { value: "", label: "" }] })} className="text-[#2271b1] text-[12px] font-semibold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add stat
                    </button>
                    <ImageField label="Proof Image / Screenshot (optional)" value={section.results.proofImage} onChange={(url) => updateSection("results", { proofImage: url })} />
                  </div>

                  {/* Testimonial */}
                  <div className={boxCls}>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1d2327]">Client Testimonial</h3>
                      <SectionToggle enabled={section.testimonial.enabled} onChange={(v) => updateSection("testimonial", { enabled: v })} />
                    </div>
                    <textarea value={section.testimonial.quote} onChange={(e) => updateSection("testimonial", { quote: e.target.value })} rows={3} className={inputCls + " resize-none"} placeholder="Client quote about working with us and the results." />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input value={section.testimonial.authorName} onChange={(e) => updateSection("testimonial", { authorName: e.target.value })} className={inputCls} placeholder="Owner name" />
                      <input value={section.testimonial.authorRole} onChange={(e) => updateSection("testimonial", { authorRole: e.target.value })} className={inputCls} placeholder="Owner, Burish Builders" />
                    </div>
                    <ImageField label="Author Avatar (optional)" value={section.testimonial.authorAvatar} onChange={(url) => updateSection("testimonial", { authorAvatar: url })} />
                  </div>
                </>
              )}

              {activeTab === "services" && (
                <PortfolioServiceSelector selectedIds={item.services || []} onChange={(ids) => setItem({ ...item, services: ids })} />
              )}

              {activeTab === "seo" && (
                <SeoEditor
                  data={item.seo}
                  setData={(seo) => setItem({ ...item, seo })}
                  pageSlug={item.slug ? `portfolio/${item.slug}` : ""}
                  pageTitle={item.title}
                  pageContent={item.summary}
                />
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-[280px] space-y-5">
          <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm">
            <div className="px-3 py-2 border-b border-[#c3c4c7] bg-[#f6f7f7]">
              <h2 className="text-[13px] font-semibold text-[#1d2327]">Publish</h2>
            </div>
            <div className="p-3 space-y-3 text-[12px] text-[#2c3338]">
              <div className="flex items-center justify-between">
                <label>Status:</label>
                <select value={item.status} onChange={(e) => setItem({ ...item, status: e.target.value })} className="bg-white border border-[#8c8f94] px-1 py-0.5 rounded outline-none focus:border-[#2271b1]">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              {item.slug && (
                <Link href={`/portfolio/${item.slug}`} target="_blank" className="text-[#2271b1] hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> {viewLabel}
                </Link>
              )}
            </div>
            <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
              {id ? <button type="button" onClick={handleTrash} className="text-[#d63638] underline text-[12px] hover:text-[#b32d2e]">Move to Trash</button> : <span />}
              <button type="button" onClick={() => handleSave(id ? undefined : "publish")} disabled={saving} className="bg-[#2271b1] text-white text-[12px] font-semibold px-3 py-1 rounded-[3px] border border-[#135e96] hover:bg-[#135e96] disabled:opacity-50">
                {saving ? "Saving..." : id ? "Update" : "Publish"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {message && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} role="status"
            className={`fixed bottom-10 right-10 z-[100] px-4 py-2 bg-white border-l-4 text-[12px] shadow-lg max-w-sm ${messageType === "error" ? "border-[#d63638]" : "border-[#00a32a]"}`}>
            <p className="text-[#1d2327] m-0">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
