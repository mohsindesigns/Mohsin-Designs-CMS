"use client";

import React, { useCallback, useEffect, useRef } from "react";
import HomeEditor from "./HomeEditor";

// Top-level content keys that a Country page can really render (CountryTemplate) and that
// the HomeEditor tabs edit. FAQs (`faqs`, `faqBadge`, `strategyAudit`, ...) are managed by
// the admin page shell's own "Page FAQs" tab, not by these tabs.
const STARTER_KEEP = new Set([
  "hero",
  "about",
  "trustedBrands",
  "videoTestimonials",
  "services",
  "industries",
  "portfolio",
  "testimonials",
  "whyChooseUs",
  "serviceArea",
  "blogSection",
  "blog",
  "contact",
]);

/**
 * When a Country page has no `hero` yet, HomeEditor pre-fills the page with a copy of the
 * whole global/Home content blob (leadership, aboutPage, hours, loader, images, the legacy
 * `faq`/`quote` objects, Home's schemaMarkup, ...). None of that is rendered by a Country
 * page, but it was being saved into the page document (a real Country page ended up with
 * ~290 KB of unused content) and Home's JSON-LD could leak into the new page's schema.
 *
 * That pre-fill is the only thing that ever adds several new top-level keys in a single
 * update (every normal edit adds at most one section), so we detect it that way and keep
 * only the sections this page can actually show. Everything the admin types is untouched.
 */
function dropUnusedStarterKeys(prev: any, next: any) {
  if (!next || typeof next !== "object" || Array.isArray(next)) return next;
  const before = prev && typeof prev === "object" ? prev : {};
  const out: any = { ...next };

  // HomeEditor's own "Schema Markup" tab also mirrors the value into `content.seo`, which
  // nothing reads (the live page reads page.seo.schemaData / content.schemaMarkup).
  if (out.seo && typeof out.seo === "object" && Object.keys(out.seo).every((k) => k === "schemaData")) {
    delete out.seo;
  }

  const added = Object.keys(out).filter((k) => !(k in before));
  if (added.length >= 3) {
    for (const k of added) {
      if (!STARTER_KEEP.has(k)) delete out[k];
    }
  }
  return out;
}

export default function CountryEditor({
  pageId,
  data,
  setData,
  setSeo,
}: {
  pageId: string;
  data: any;
  setData: (d: any) => void;
  // Passed by the admin page shell (src/app/admin/pages/[id]/page.tsx); optional so the
  // editor still works when it is mounted without it.
  seo?: any;
  setSeo?: (updater: any) => void;
}) {
  const guardedSetData = useCallback(
    (updater: any) => {
      setData((prev: any) => dropUnusedStarterKeys(prev, typeof updater === "function" ? updater(prev) : updater));
    },
    [setData]
  );

  // The public page reads the JSON-LD from page.seo.schemaData first and only falls back to
  // content.schemaMarkup, and the shell's Save writes `seo.schemaData ?? content.schemaMarkup`
  // back over the content copy. HomeEditor's "Schema Markup" tab only edits the content copy,
  // so once a page has a saved schema an edit made in that tab was silently discarded.
  // Mirror tab edits into the shell's `seo` state (only on a real change, never on mount).
  const lastSchema = useRef<any>(data?.schemaMarkup);
  useEffect(() => {
    const current = data?.schemaMarkup;
    if (current === lastSchema.current) return;
    lastSchema.current = current;
    if (typeof setSeo === "function" && typeof current === "string") {
      setSeo((prev: any) => (prev?.schemaData === current ? prev : { ...(prev || {}), schemaData: current }));
    }
  }, [data?.schemaMarkup, setSeo]);

  return (
    <>
      <div className="max-w-3xl mx-auto mb-6 border-l-4 border-[#72aee6] bg-[#f0f6fc] px-3.5 py-3 text-[12px] leading-relaxed text-[#1d2327]">
        <p className="font-bold">How a Country page is built</p>
        <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[#3c434a]">
          <li>
            A section appears on the live page only once it has content. A tab left blank stays hidden - a Country page never
            borrows Home page content.
          </li>
          <li>
            The list of states / regions is the <strong>Global Coverage</strong> tab: add each state as a location and set its
            page link (for example <code>/usa/texas/</code>).
          </li>
          <li>
            FAQs live in the <strong>Page FAQs</strong> tab above; meta title, description and schema are in{" "}
            <strong>SEO Settings</strong> / <strong>Schema Markup</strong>.
          </li>
        </ul>
      </div>
      <HomeEditor pageId={pageId} data={data} setData={guardedSetData} aboutClean={true} />
    </>
  );
}
