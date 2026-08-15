"use client";

import { useState, useEffect } from "react";
import {
  Search, Globe, Share2, Twitter, Info, CheckCircle, AlertCircle,
  ChevronDown, ChevronUp, Eye, Layout, Type, Image as ImageIcon,
  MousePointer2, ExternalLink, Link2, FileJson, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ImageField from "./ImageField";
import { BASE_URL } from "@/lib/constants";

interface SeoData {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  metaRobotsIndex?: string;
  metaRobotsFollow?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  schemaData?: string;
  breadcrumbTitle?: string;
  secondaryKeywords?: string;
  featuredImage?: string;
  featuredImageAlt?: string;
}

interface SeoEditorProps {
  data: SeoData;
  setData: (data: SeoData) => void;
  pageSlug: string;
  pageTitle: string;
  pageContent?: any;
}

export default function SeoEditor({ data, setData, pageSlug, pageTitle, pageContent }: SeoEditorProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'schema' | 'analysis'>('general');
  const [analysis, setAnalysis] = useState<any[]>([]);
  const [score, setScore] = useState(0);

  const updateField = (field: keyof SeoData, value: string) => {
    const newData = { ...data, [field]: value };

    // Sync logic: If featuredImage is updated and ogImage is empty, sync them
    if (field === 'featuredImage' && !data.ogImage) {
      newData.ogImage = value;
    }

    setData(newData);
  };


  useEffect(() => {
    // Auto-suggest canonical URL if missing
    if (!data.canonicalUrl && pageSlug) {
      const slugPart = pageSlug === 'home' ? '' : pageSlug;
      const defaultCanonical = `${BASE_URL}/${slugPart}`;
      setData({ ...data, canonicalUrl: defaultCanonical });
    }
  }, [pageSlug, data.canonicalUrl]);

  const suggestCanonical = () => {
    const slug = pageSlug === 'home' ? '' : pageSlug;
    updateField('canonicalUrl', `${BASE_URL}/${slug}`);
  };

  useEffect(() => {
    runAnalysis();
  }, [data, pageSlug, pageTitle, pageContent]);

  const runAnalysis = () => {
    const issues = [];
    const keyword = data.focusKeyword?.toLowerCase() || "";
    const title = data.metaTitle || pageTitle || "";
    const description = data.metaDescription || "";
    const slug = pageSlug || "";

    if (!data.metaTitle) issues.push({ type: 'warning', text: "Meta title is missing." });
    if (!description) issues.push({ type: 'error', text: "Meta description missing." });

    setAnalysis(issues);
    const successCount = issues.filter(i => i.type === 'success').length;
    const totalCount = issues.filter(i => i.type !== 'info').length;
    setScore(totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0);
  };

  return (
    <div className="flex flex-col bg-white overflow-hidden max-w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#f0f0f1] px-4 py-2 bg-[#f6f7f7]">
        {[
          { id: 'general', label: 'General', icon: Search },
          { id: 'social', label: 'Social', icon: Share2 },
          { id: 'analysis', label: 'Analysis', icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[3px] text-[11px] font-bold uppercase transition-all ${activeTab === tab.id
              ? "bg-white border border-[#c3c4c7] text-[#1d2327]"
              : "text-[#2271b1] hover:text-[#135e96]"
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-[#f0f0f1]">
        {/* Editor Area */}
        <div className="flex-1 p-4 sm:p-5 space-y-6 min-w-0">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div key="general" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Focus Keyword</label>
                    <input type="text" value={data.focusKeyword || ""} onChange={(e) => updateField('focusKeyword', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" placeholder="e.g. roofing st louis" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Secondary Keywords</label>
                    <input type="text" value={data.secondaryKeywords || ""} onChange={(e) => updateField('secondaryKeywords', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" placeholder="comma separated" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">SEO Title</label>
                    <span className="text-[10px] text-[#646970] font-mono">{data.metaTitle?.length || 0} / 60 chars</span>
                  </div>
                  <input type="text" placeholder={pageTitle} value={data.metaTitle || ""} onChange={(e) => updateField('metaTitle', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Meta Description</label>
                    <span className="text-[10px] text-[#646970] font-mono">{data.metaDescription?.length || 0} / 160 chars</span>
                  </div>
                  <textarea rows={4} value={data.metaDescription || ""} onChange={(e) => updateField('metaDescription', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none leading-relaxed" placeholder="Write a summary description for search results..." />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Canonical URL</label>
                      {!data.canonicalUrl && (
                        <button
                          onClick={() => updateField('canonicalUrl', `${BASE_URL}/${pageSlug === 'home' ? '' : pageSlug}`)}
                          className="text-[11px] text-[#2271b1] hover:underline"
                        >
                          Suggest Default
                        </button>
                      )}
                    </div>
                    <input type="text" value={data.canonicalUrl || ""} onChange={(e) => updateField('canonicalUrl', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" placeholder="https://..." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Breadcrumb Title</label>
                    <input type="text" value={data.breadcrumbTitle || ""} onChange={(e) => updateField('breadcrumbTitle', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                  </div>
                </div>

                <div className="space-y-5 pt-2 border-t border-[#f0f0f1]">
                  <div>
                    <ImageField
                      label="Featured Image (Global/Schema)"
                      value={data.featuredImage || ""}
                      onChange={(url) => updateField('featuredImage', url)}
                      altValue={data.featuredImageAlt || ""}
                      onAltChange={(alt) => updateField('featuredImageAlt', alt)}
                      description="Main image used for Schema.org and as a fallback for OG/Twitter social previews."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Robots Index</label>
                      <select value={data.metaRobotsIndex || 'index'} onChange={(e) => updateField('metaRobotsIndex', e.target.value)} className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none">
                        <option value="index">Index (Allow search engines to show page)</option>
                        <option value="noindex">NoIndex (Hide page from search results)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide">Robots Follow</label>
                      <select value={data.metaRobotsFollow || 'follow'} onChange={(e) => updateField('metaRobotsFollow', e.target.value)} className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none">
                        <option value="follow">Follow (Instruct search engines to follow links)</option>
                        <option value="nofollow">NoFollow (Do not crawl links on this page)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'social' && (
              <motion.div key="social" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide border-b border-[#f0f0f1] pb-1.5">Facebook / Open Graph</h3>
                  <div className="space-y-4">
                    <input type="text" placeholder="OG Title (defaults to SEO Title if empty)" value={data.ogTitle || ""} onChange={(e) => updateField('ogTitle', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                    <textarea placeholder="OG Description (defaults to Meta Description if empty)" rows={3} value={data.ogDescription || ""} onChange={(e) => updateField('ogDescription', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none leading-relaxed" />
                    <ImageField label="OG Image" value={data.ogImage || ""} onChange={(url) => updateField('ogImage', url)} />
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-[#f0f0f1]">
                  <h3 className="text-[12px] font-bold text-[#1d2327] uppercase tracking-wide border-b border-[#f0f0f1] pb-1.5">Twitter / X</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1d2327] uppercase">Twitter Title</label>
                        <input type="text" placeholder="Twitter Title" value={data.twitterTitle || ""} onChange={(e) => updateField('twitterTitle', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#1d2327] uppercase">Card Style</label>
                        <select value={data.twitterCard || 'summary_large_image'} onChange={(e) => updateField('twitterCard', e.target.value)} className="w-full border border-[#c3c4c7] bg-white px-3 py-2 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none">
                          <option value="summary">Summary (Small Image Preview)</option>
                          <option value="summary_large_image">Summary with Large Image</option>
                        </select>
                      </div>
                    </div>
                    <textarea placeholder="Twitter Description" rows={3} value={data.twitterDescription || ""} onChange={(e) => updateField('twitterDescription', e.target.value)} className="w-full border border-[#c3c4c7] px-3 py-2 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none resize-none leading-relaxed" />
                    <ImageField label="Twitter Image" value={data.twitterImage || ""} onChange={(url) => updateField('twitterImage', url)} />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'analysis' && (
              <motion.div key="analysis" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {analysis.length === 0 ? (
                  <p className="text-[13px] text-[#00a32a]">All good! No major issues found.</p>
                ) : (
                  analysis.map((issue, idx) => (
                    <div key={idx} className={`flex items-center gap-3 p-3 text-[12px] rounded-[3px] border-l-4 ${issue.type === 'error' ? "bg-red-50 border-red-500 text-red-700" : "bg-amber-50 border-amber-500 text-amber-700"
                      }`}>
                      <AlertCircle className="w-4 h-4" />
                      {issue.text}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Preview Area */}
        <div className="w-full xl:w-[320px] bg-[#f6f7f7] p-4 sm:p-5 space-y-6 flex-shrink-0 min-w-0">
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#646970] uppercase tracking-wider">Search Preview</h3>
            <div className="bg-white border border-[#c3c4c7] p-4 rounded-[3px] shadow-sm space-y-1">
              <div className="text-[11px] text-[#4d5156] line-clamp-1">eaglerevolution.com › {pageSlug}</div>
              <h4 className="text-[15px] text-[#1a0dab] hover:underline cursor-pointer font-normal line-clamp-1">
                {data.metaTitle || pageTitle}
              </h4>
              <p className="text-[12px] text-[#4d5156] line-clamp-2 leading-snug">
                {data.metaDescription || "..."}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold text-[#646970] uppercase tracking-wider">Social Preview</h3>
            <div className="bg-white border border-[#c3c4c7] rounded-[3px] shadow-sm overflow-hidden">
              <div className="aspect-[1.91/1] bg-[#f0f0f1] flex items-center justify-center overflow-hidden">
                {data.ogImage ? <img src={data.ogImage} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-[#c3c4c7]" />}
              </div>
              <div className="p-3 border-t border-[#f0f0f1]">
                <div className="text-[9px] text-[#646970] uppercase font-bold">eaglerevolution.com</div>
                <div className="text-[13px] font-bold text-[#1d2327] line-clamp-1">{data.ogTitle || data.metaTitle || pageTitle}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
