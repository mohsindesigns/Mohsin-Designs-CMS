"use client";

import { useMemo, useState, type ReactNode } from "react";
import PageBreadcrumbs from "@/components/PageBreadcrumbs";
import { useContent } from "../../hooks/useContent";
import PageInlineFaqs from "@/components/PageInlineFaqs";
import RichTextRenderer from "@/components/ui/RichTextRenderer";
import AccentHighlight from "@/components/ui/AccentHighlight";

// ---------------------------------------------------------------------------
// Data contract of the FAQ page (template: "faq")
//
// Two admin surfaces feed this page and BOTH are honoured here:
//   1. "Page FAQs" tab (src/app/admin/pages/[id]/page.tsx) -> content.faqs[],
//      faqBadge / sectionTag, faqTitleIntro, faqTitleHighlight / faqTitle,
//      faqDescription, strategyAudit{}, faqSchemaMarkup.
//   2. FAQEditor (Page Content tab) -> content.faq{ section{headline,
//      description,badge,enabled}, categories[], categoriesEnabled, items[]
//      (curated selection from the global library), itemsEnabled }.
// Global library = SiteContent.faq.items, managed in /admin/faq
// ({question, answer, category, visibility: 'global'|'specific', targetPages[]}).
//
// Question source priority: content.faqs  >  content.faq.items  >  global library.
// ---------------------------------------------------------------------------

const asList = (v: any): any[] => (Array.isArray(v) ? v.filter((x) => x && typeof x === "object") : []);

/** Questions are rendered as plain-text headings. The global FAQ manager used to save them from a
 *  rich-text editor (`<p>..</p>`), so already-saved questions may contain markup: flatten it. */
function plainText(v: unknown): string {
  if (typeof v !== "string") return "";
  return v
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

/** Loose category identity: 'roofing' (seeded id) === 'Roofing' (manager label) === 'ROOFING' (page tag). */
const catKey = (v: unknown) =>
  String(v ?? "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/** Drops half-empty entries (blank question/answer would otherwise render as a fallback title or an empty card). */
function cleanItem(raw: any) {
  if (!raw || raw.enabled === false) return null;
  const question = plainText(raw.question ?? raw.q ?? raw.title);
  const answerRaw = raw.answer ?? raw.a ?? raw.description;
  const answer = typeof answerRaw === "string" ? answerRaw : "";
  const hasAnswer = !!plainText(answer) || /<(img|iframe|video)\b/i.test(answer);
  if (!question || !hasAnswer) return null;
  return { ...raw, question, answer };
}

export default function FAQTemplate({ pageData, params }: { pageData?: any, params?: any }) {
  const { faq: globalFaq } = useContent();
  const [activeCat, setActiveCat] = useState("");

  const content = pageData?.content || {};
  const slug = String(pageData?.slug || "").replace(/^\/+|\/+$/g, "");
  // FAQEditor's own object. (useContent().faq is this object when it exists, otherwise the global FAQ block.)
  const pageFaq = content.faq && typeof content.faq === "object" && !Array.isArray(content.faq) ? content.faq : null;
  const faq: any = pageFaq ? { ...(globalFaq || {}), ...pageFaq } : (globalFaq || {});
  const section = faq.section || {};

  // ---- 1. Which questions ------------------------------------------------
  const items = useMemo(() => {
    const own = asList(content.faqs);            // "Page FAQs" tab
    const selected = asList(pageFaq?.items);     // FAQEditor "Q&A Database" selection
    // Global library. /admin/faq stamps `visibility` on every item it saves, but older seeded items have
    // none - treat those as global (the same default the manager applies) instead of hiding them.
    const library = pageFaq ? [] : asList(globalFaq?.items).filter((it) => {
      if (it.visibility !== "specific") return true;
      const targets = Array.isArray(it.targetPages) ? it.targetPages : [];
      // "faq" is the manager's static "FAQ" checkbox - it always means this template, whatever the slug is.
      return targets.some((t: any) => { const k = String(t).replace(/^\/+|\/+$/g, ""); return k === slug || k === "faq"; });
    });
    // The route (`[...slug]/page.tsx`) pre-computes the same global list into `pageData.faqs`; only used
    // as a last resort when the FAQEditor object hides the library from the content context.
    const routeList = asList(pageData?.faqs);
    const source = own.length ? own : selected.length ? selected : library.length ? library : routeList;
    return source.map(cleanItem).filter(Boolean) as any[];
  }, [content.faqs, pageFaq, globalFaq, pageData?.faqs, slug]);

  // ---- 2. Header copy (page-level "Page FAQs" tab wins over FAQEditor / global) ----
  const badge = content.faqBadge || content.sectionTag || section.badge || undefined;
  const title = content.faqTitleHighlight || content.faqTitle || section.headline || undefined;
  const titleIntro = typeof content.faqTitleIntro === "string" ? content.faqTitleIntro : undefined;
  const description = content.faqDescription || section.description || undefined;
  // PageInlineFaqs reads `strategyAudit` from its `data` prop (or the global faq block), so the page's own
  // "Sticky Strategy Session Box" fields (content.strategyAudit) are handed over through `data`.
  // Its default CTA target "#contact" is an anchor this page does not have (dead button) -> /contact-us,
  // the site's contact page.
  const auditHref = String(content.strategyAudit?.href || faq.strategyAudit?.href || "").trim();
  const data = {
    ...faq,
    strategyAudit: {
      ...(faq.strategyAudit || {}),
      ...(content.strategyAudit || {}),
      href: !auditHref || auditHref === "#contact" ? "/contact-us" : auditHref,
    },
  };

  // ---- 3. Visibility toggles -----------------------------------------------
  const sectionEnabled =
    content.faqs?.enabled !== false && content.faqSection?.enabled !== false && section.enabled !== false;
  const itemsEnabled = faq.itemsEnabled !== false;
  const filtersEnabled = faq.categoriesEnabled !== false;

  // ---- 4. Category filter chips (FAQEditor "Filter Taxonomy" + /admin/faq categories) ----
  const { chips, allLabel } = useMemo(() => {
    const declared = asList(Array.isArray(faq.categories) ? faq.categories.map((c: any) => (typeof c === "string" ? { label: c } : c)) : [])
      .map((c) => ({ id: catKey(c.id ?? c.label), label: String(c.label ?? c.id ?? "").trim() }))
      .filter((c) => c.label);
    const isAll = (c: { id: string; label: string }) => c.id === "all" || catKey(c.label) === "all-questions";
    const all = declared.find(isAll);
    const found: { key: string; label: string; match: string[] }[] = [];
    const seen = new Set<string>();
    for (const c of declared) {
      if (isAll(c)) continue;
      const match = [c.id, catKey(c.label)];
      if (items.some((it) => match.includes(catKey(it.category)))) {
        found.push({ key: c.id || catKey(c.label), label: c.label, match });
        match.forEach((m) => seen.add(m));
      }
    }
    // Categories that only exist as free-text tags on the questions (e.g. the "Category Tag" field of the Page FAQs tab).
    for (const it of items) {
      const k = catKey(it.category);
      if (!k || k === "all" || seen.has(k)) continue;
      seen.add(k);
      found.push({ key: k, label: String(it.category).trim(), match: [k] });
    }
    return { chips: found, allLabel: all?.label || "All" };
  }, [faq.categories, items]);

  const active = chips.find((c) => c.key === activeCat);
  const visibleItems = active ? items.filter((it) => active.match.includes(catKey(it.category))) : items;
  const showFilters = filtersEnabled && chips.length >= 2;

  const pageTitle = plainText(pageData?.title) || "Frequently Asked Questions";
  const breadcrumb = <PageBreadcrumbs page={pageData} />;

  return (
    // <div>, not <main>: [...slug]/page.tsx and SiteLayout already provide the page's <main> landmark.
    // With filter chips the top toolbar (breadcrumb + chips) carries its own navbar clearance.
    <div className={showFilters && sectionEnabled && itemsEnabled && items.length > 0 ? "" : "pt-12 lg:pt-8"}>
      {/* PageInlineFaqs starts at <h2>; give the standalone FAQ page its single <h1>. */}
      <h1 className="sr-only">{pageTitle}</h1>

      {sectionEnabled && (
        itemsEnabled && items.length > 0 ? (
          <>
            {showFilters && (
              <FilterBar
                breadcrumb={breadcrumb}
                chips={chips}
                allLabel={allLabel}
                activeKey={active?.key || ""}
                onChange={setActiveCat}
                count={visibleItems.length}
              />
            )}
            {/* The toolbar above already holds the breadcrumb and its own spacing, so the section's top padding is
                tightened when it is shown. key: re-mount on filter change so the first question of the new list
                opens (single-open accordion). */}
            <div className={showFilters ? "[&>section]:!pt-8 sm:[&>section]:!pt-10 lg:[&>section]:!pt-12" : undefined}>
              <PageInlineFaqs
                key={active?.key || "all"}
                faqs={visibleItems}
                badge={badge}
                title={title}
                titleIntro={titleIntro}
                description={description}
                data={data}
                breadcrumb={showFilters ? undefined : breadcrumb}
              />
            </div>
          </>
        ) : (
          // PageInlineFaqs would fall back to its built-in sample questions for an empty list - never show those here.
          <FaqHeaderOnly
            breadcrumb={breadcrumb}
            badge={badge || section.badge || "FREQUENTLY ASKED QUESTIONS"}
            intro={titleIntro}
            title={title || "Frequently Asked Questions"}
            description={description}
            message={itemsEnabled ? "Questions and answers for this page are on the way. Check back soon." : undefined}
          />
        )
      )}
    </div>
  );
}

function FilterBar({
  breadcrumb,
  chips,
  allLabel,
  activeKey,
  onChange,
  count,
}: {
  breadcrumb: ReactNode;
  chips: { key: string; label: string }[];
  allLabel: string;
  activeKey: string;
  onChange: (key: string) => void;
  count: number;
}) {
  const base =
    "rounded-full border px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue dark:focus-visible:ring-brand-yellow";
  const on = "border-brand-blue bg-brand-blue text-white dark:border-brand-yellow dark:bg-brand-yellow dark:text-[#080710]";
  const off =
    "border-slate-200 bg-slate-100 text-slate-700 hover:border-brand-blue/40 hover:text-brand-blue dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:border-brand-yellow/40 dark:hover:text-brand-yellow";
  return (
    // pt-* clears the fixed navbar (the page's normal top offset lives on the section below).
    <div className="bg-white pt-24 dark:bg-[#080710] lg:pt-28">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 md:px-12 lg:flex-row lg:items-center lg:justify-between">
        {breadcrumb}
        <div role="group" aria-label="Filter questions by topic" className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={activeKey === ""} onClick={() => onChange("")} className={`${base} ${activeKey === "" ? on : off}`}>
            {allLabel}
          </button>
          {chips.map((c) => (
            <button key={c.key} type="button" aria-pressed={activeKey === c.key} onClick={() => onChange(c.key)} className={`${base} ${activeKey === c.key ? on : off}`}>
              {c.label}
            </button>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          Showing {count} {count === 1 ? "question" : "questions"}
        </p>
      </div>
    </div>
  );
}

function FaqHeaderOnly({
  breadcrumb,
  badge,
  intro,
  title,
  description,
  message,
}: {
  breadcrumb: ReactNode;
  badge: string;
  intro?: string;
  title: string;
  description?: string;
  message?: string;
}) {
  const boilerplate = intro === "Common Questions, " || intro === "Common Questions";
  const introText = intro && intro.trim() && !boilerplate ? intro.trim() : "";
  return (
    <section id="faq" className="relative overflow-x-clip border-y border-slate-200 bg-white section-y dark:border-white/10 dark:bg-[#080710]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-12">
        <div className="flex max-w-2xl flex-col gap-4">
          {breadcrumb}
          <div className="eyebrow-pill self-start">{badge}</div>
          <h2 className="font-heading text-3xl font-black leading-[1.15] tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
            {introText ? (
              <>
                {introText}{" "}
                <AccentHighlight className="font-cursive font-normal text-primary dark:text-yellow-400">{title}</AccentHighlight>
              </>
            ) : (
              title
            )}
          </h2>
          {description && typeof description === "string" && (
            <div className="font-sans text-sm font-normal leading-relaxed text-slate-600 dark:text-zinc-300 sm:text-base">
              <RichTextRenderer content={description} />
            </div>
          )}
          {message && <p className="font-sans text-sm text-slate-600 dark:text-zinc-300 sm:text-base">{message}</p>}
        </div>
      </div>
    </section>
  );
}
