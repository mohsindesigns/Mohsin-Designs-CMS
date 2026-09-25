"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2, Type, Quote
} from "lucide-react";
import dynamic from "next/dynamic";
import ContentSelector from "@/components/admin/ContentSelector";
const RichTextEditor = dynamic(() => import("@/components/admin/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-64 bg-[#f6f7f7] animate-pulse border border-[#c3c4c7] rounded-sm flex items-center justify-center text-[#8c8f94] text-xs">Loading Rich Text Editor...</div>
});
import { UI } from "./styles";
import SectionToggle from "@/components/admin/SectionToggle";
import SchemaEditor from "@/components/admin/SchemaEditor";
import VideoTestimonialsEditor from "./VideoTestimonialsEditor";

// What the editor writes (ReviewsTemplate reads exactly these keys):
//   content.testimonials = {
//     section:   { enabled, badge, headline, description },
//     stats:     { rating, count, label },
//     reviewCta: { url, label },
//     testimonialsEnabled,
//     testimonials: [ ...reviews picked from the managed inventory ],
//   }
//   content.videoTestimonials = { ... }   (VideoTestimonialsEditor)
//   content.schemaMarkup + page-level seo.schemaData (Schema tab)
const isPlainObject = (v: any) => !!v && typeof v === "object" && !Array.isArray(v);

// Legacy documents may keep section/stats/testimonials flat on `content`; carry that over instead of
// silently dropping it the first time the page is saved from this editor.
const readBlock = (d: any): any => {
  const t = d?.testimonials;
  if (isPlainObject(t)) return t;
  if (Array.isArray(t) || d?.section || d?.stats) {
    return {
      section: d?.section,
      stats: d?.stats,
      testimonialsEnabled: d?.testimonialsEnabled,
      reviewCta: d?.reviewCta,
      testimonials: Array.isArray(t) ? t : [],
    };
  }
  return {};
};

// Same rule the public template uses: a review with no words in it is not rendered.
const hasReviewText = (r: any) => {
  const raw = [r?.text, r?.quote, r?.review].find((v) => typeof v === "string" && v.trim()) || "";
  return raw.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").trim().length > 0;
};

export default function ReviewsEditor({ data, setData, seo, setSeo }: { pageId: string, data: any, setData: (d: any) => void, seo?: any, setSeo?: (d: any) => void }) {
  const [activeTab, setActiveTab] = useState("header");

  if (!data) return <div className="flex items-center justify-center h-64"><Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" /></div>;

  const block = readBlock(data);
  const section = isPlainObject(block.section) ? block.section : {};
  const stats = isPlainObject(block.stats) ? block.stats : {};
  const reviewCta = isPlainObject(block.reviewCta) ? block.reviewCta : {};
  const selectedReviews: any[] = Array.isArray(block.testimonials) ? block.testimonials : [];
  const unrenderable = selectedReviews.filter((r) => !hasReviewText(r)).length;

  // Functional update: RichTextEditor / inputs can fire in quick succession and must not overwrite siblings
  // (or other tabs' keys such as videoTestimonials / schemaMarkup) with a stale `data` snapshot.
  const updateTestimonials = (key: string, field: string | null, value: any) => {
    setData((prev: any) => {
      const base = prev || {};
      const current = readBlock(base);
      const target = isPlainObject(current[key]) ? current[key] : {};
      return {
        ...base,
        testimonials: {
          ...current,
          [key]: field ? { ...target, [field]: value } : value,
        },
      };
    });
  };

  const tabs = [
    { id: "header", label: "Review Header", icon: Type, title: "Social Proof Introduction", desc: "Heading, intro text, summary stats and an optional review button shown at the top of the Reviews page." },
    { id: "items", label: "Testimonials", icon: Quote, title: "Individual Review Management", desc: "Choose which written reviews appear in the grid on this page and in what order." },
    { id: "videoTestimonials", label: "Video Testimonials", icon: Quote, title: "Video Testimonials", desc: "A swipeable carousel of video reviews shown below the written reviews." },
    { id: "schema", label: "Schema Markup", icon: Quote, title: "Reviews Schema Markup", desc: "Structured data (JSON-LD) added to this page for search engines." },
  ];

  const activeTabMeta = tabs.find(t => t.id === activeTab);

  return (
    <div className="bg-white">
      {/* WP Style Sub-tabs */}
      <div className="flex flex-wrap items-center gap-1 mb-6 text-[13px] border-b border-[#f0f0f1] pb-1">
        {tabs.map((tab: any, idx: number) => (
          <React.Fragment key={tab.id}>
            <button
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? "page" : undefined}
              className={`px-1 py-1 transition-colors ${activeTab === tab.id ? 'text-[#1d2327] font-bold' : 'text-[#2271b1] hover:text-[#135e96]'}`}
            >
              {tab.label}
            </button>
            {idx < tabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
          </React.Fragment>
        ))}
      </div>

      <div className="space-y-6">
        <div className="mb-6">
           <h2 className={UI.sectionHeader}>{activeTabMeta?.title}</h2>
           <p className="text-[12px] text-[#646970] -mt-2">{activeTabMeta?.desc}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8 pb-10"
          >

            {/* HEADER SECTION */}
            {activeTab === "header" && (
              <div className="max-w-3xl space-y-6">
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Review Header Visibility</h2>
                    <p className="text-xs text-[#646970]">Shows or hides the heading, intro text and summary stats on the live page. (The page keeps an invisible H1 for search engines.)</p>
                  </div>
                  <SectionToggle
                    enabled={section.enabled !== false}
                    onChange={(v) => updateTestimonials("section", "enabled", v)}
                    label="Review Header"
                  />
                </div>
                 <div className={UI.card + " space-y-5"}>
                    <div className="space-y-1.5">
                       <label htmlFor="reviews-badge" className={UI.label}>Section Badge</label>
                       <input id="reviews-badge" type="text" value={section.badge || ""} onChange={(e) => updateTestimonials("section", "badge", e.target.value)} className={UI.input} placeholder="Small label above the heading (optional), e.g. Social Proof" />
                    </div>
                    <div className="space-y-1.5">
                       <label htmlFor="reviews-headline" className={UI.label}>Main Headline (page H1)</label>
                       <input id="reviews-headline" type="text" value={section.headline || ""} onChange={(e) => updateTestimonials("section", "headline", e.target.value)} className={UI.inputLarge} placeholder="Customer Stories" />
                       <span className={UI.helpText}>Leave blank to show &quot;Customer Stories&quot;.</span>
                    </div>
                    <RichTextEditor
                        label="Intro Narrative"
                        content={section.description || ""}
                        onChange={(html) => updateTestimonials("section", "description", html)}
                    />
                 </div>

                 <div className="space-y-2">
                    <label className={UI.label}>Review Summary Stats</label>
                    <span className={UI.helpText}>Shown as a small summary strip under the intro, e.g. &quot;4.9/5 &middot; 500+ Google Reviews&quot;. Leave both the rating and the count blank to hide it. Use real numbers only.</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className={UI.card + " space-y-1.5"}>
                          <label htmlFor="reviews-stat-rating" className={UI.label}>Avg Rating</label>
                          <input id="reviews-stat-rating" type="text" inputMode="decimal" value={stats.rating ?? ""} onChange={(e) => updateTestimonials("stats", "rating", e.target.value)} className={UI.inputLarge} placeholder="e.g. 4.9" />
                       </div>
                       <div className={UI.card + " space-y-1.5"}>
                          <label htmlFor="reviews-stat-count" className={UI.label}>Total Count</label>
                          <input id="reviews-stat-count" type="text" value={stats.count ?? ""} onChange={(e) => updateTestimonials("stats", "count", e.target.value)} className={UI.inputLarge} placeholder="e.g. 500+" />
                       </div>
                       <div className={UI.card + " space-y-1.5"}>
                          <label htmlFor="reviews-stat-label" className={UI.label}>Source Label</label>
                          <input id="reviews-stat-label" type="text" value={stats.label ?? ""} onChange={(e) => updateTestimonials("stats", "label", e.target.value)} className={UI.input} placeholder="Reviews (e.g. Google Reviews)" />
                       </div>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className={UI.label}>&quot;Leave a Review&quot; Button</label>
                    <span className={UI.helpText}>Optional button shown under the reviews, e.g. your Google review link. It is hidden until you enter a link.</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                       <div className="sm:col-span-2 space-y-1.5">
                          <label htmlFor="reviews-cta-url" className={UI.label}>Review Link</label>
                          <input id="reviews-cta-url" type="text" value={reviewCta.url ?? ""} onChange={(e) => updateTestimonials("reviewCta", "url", e.target.value)} className={UI.input} placeholder="https://g.page/r/..." />
                       </div>
                       <div className="space-y-1.5">
                          <label htmlFor="reviews-cta-label" className={UI.label}>Button Label</label>
                          <input id="reviews-cta-label" type="text" value={reviewCta.label ?? ""} onChange={(e) => updateTestimonials("reviewCta", "label", e.target.value)} className={UI.input} placeholder="Leave a Review" />
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* VIDEO TESTIMONIALS SECTION */}
            {activeTab === "videoTestimonials" && (
              <VideoTestimonialsEditor
                value={data.videoTestimonials}
                onChange={(next: any) => setData((prev: any) => ({ ...(prev || {}), videoTestimonials: next }))}
              />
            )}

             {/* TESTIMONIALS SECTION */}
            {activeTab === "items" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 mb-2 border-b border-[#f0f0f1]">
                  <div>
                    <h2 className="text-base font-bold text-[#1d2327]">Testimonials Grid Visibility</h2>
                    <p className="text-xs text-[#646970]">Enable or disable displaying testimonials grid on the live page.</p>
                  </div>
                  <SectionToggle
                    enabled={block.testimonialsEnabled !== false}
                    onChange={(v) => updateTestimonials("testimonialsEnabled", null, v)}
                    label="Testimonials Grid"
                  />
                </div>
                 <p className="text-[12px] text-[#646970]">
                   Only the reviews you select below appear on this page (nothing is shown automatically). Each selected review is copied to this page, so later edits in Admin &gt; Reviews do not change it here - remove and re-select to refresh. With none selected the page shows a &quot;No reviews to show yet&quot; message.
                 </p>
                 {unrenderable > 0 && (
                   <p className="text-[12px] text-[#b32d2e]">
                     {unrenderable} selected review{unrenderable === 1 ? " has" : "s have"} no review text and will not be shown.
                   </p>
                 )}
                 <ContentSelector
                    type="reviews"
                    label="Review Repository (Select from Managed Inventory)"
                    selectedItems={selectedReviews}
                    onSelect={(items) => updateTestimonials("testimonials", null, items)}
                 />
              </div>
            )}

             {activeTab === "schema" && (
               <div className="space-y-4">
                 <p className="text-[12px] text-[#646970]">
                   Tip: if you add an AggregateRating here, keep its ratingValue / reviewCount in line with the Summary Stats on the Review Header tab.
                 </p>
                 <SchemaEditor
                   value={seo?.schemaData || data.schemaMarkup || ""}
                   onChange={(val) => {
                     // The page save (admin/pages/[id]) takes seo.schemaData first and rewrites content.schemaMarkup
                     // from it, and the public route reads page.seo.schemaData before content.schemaMarkup - so the
                     // page-level seo state must be updated too, or an edit is silently reverted on save.
                     setData((prev: any) => ({ ...(prev || {}), schemaMarkup: val }));
                     setSeo?.((prev: any) => ({ ...(prev || {}), schemaData: val }));
                   }}
                   pageTitle="Client Reviews"
                 />
               </div>
             )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
