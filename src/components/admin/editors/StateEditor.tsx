"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import HomeEditor from "./HomeEditor";
import SectionToggle from "@/components/admin/SectionToggle";

// Sections StateTemplate actually renders. A brand-new state page (empty content) is pre-filled
// from the site's home content as a starting point - HomeEditor does this itself but copies
// EVERYTHING (aboutPage ~30KB, images, hours, loader, quickQuote, leadership, faq, quote ...):
// dead data no state page ever shows. Seed only what the template reads.
const STATE_SEED_KEYS = [
  "hero", "about", "portfolio", "testimonials", "whyChooseUs", "serviceArea", "blogSection", "blog",
  "contact", "industries", "trustedBrands", "videoTestimonials",
  "faqs", "faqBadge", "faqTitle", "faqTitleIntro", "faqTitleHighlight", "faqDescription", "strategyAudit",
];

// Used when the home content cannot be fetched. Keeps `hero` present so HomeEditor's own
// seeding (whose failure path REPLACES the whole content object and would wipe the page's
// country/state fields) never runs.
// (a factory: some HomeEditor handlers mutate nested items in place, so never share instances)
const emptyStateSeed = () => ({
  hero: { badge: "", titleLine1: "", titleConnector: "", titleLine2: "", description: "", buttons: [] },
  about: { badge: "", headline: { prefix: "", highlight: "" }, description: "" },
  portfolio: { section: { badge: "", headline: "" }, projects: [] },
});

export default function StateEditor({ pageId, data, setData }: { pageId: string; data: any; setData: (d: any) => void }) {
  const needsSeed = !!data && !data.hero;
  const [seeding, setSeeding] = useState(false);
  const seededOnce = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!needsSeed || seededOnce.current) return;
    seededOnce.current = true;
    setSeeding(true);
    fetch("/api/content?key=complete_data")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((resData) => {
        const source = resData?.data || resData || {};
        const seed: Record<string, any> = {};
        for (const key of STATE_SEED_KEYS) if (source[key] !== undefined) seed[key] = source[key];
        // Order matters: blank scaffold (guarantees `hero`, so this never loops) < home starter
        // content < the page's own fields (countrySlug, stateSlug, parentLocationId, ...), which always win.
        setData((prev: any) => ({ ...emptyStateSeed(), ...seed, ...(prev || {}) }));
      })
      .catch(() => {
        setData((prev: any) => ({ ...emptyStateSeed(), ...(prev || {}) }));
      })
      .finally(() => {
        if (mounted.current) setSeeding(false);
      });
  }, [needsSeed, setData]);

  if (!data || seeding || needsSeed) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-[#2271b1] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      {/* The FAQ section has no toggle in HomeEditor (its questions live in the page's "Page FAQs"
          tab). StateTemplate honours content.faqSection.enabled, so expose it here. */}
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#f0f0f1]">
        <div>
          <h2 className="text-base font-bold text-[#1d2327]">FAQ Section Visibility</h2>
          <p className="text-xs text-[#646970]">
            Show or hide the FAQ section on this state page. The questions themselves are edited in the &quot;Page FAQs&quot; tab.
          </p>
        </div>
        <SectionToggle
          enabled={data.faqSection?.enabled !== false}
          onChange={(v) => setData((prev: any) => ({ ...(prev || {}), faqSection: { ...(prev?.faqSection || {}), enabled: v } }))}
          label="FAQ Section"
        />
      </div>
      <HomeEditor pageId={pageId} data={data} setData={setData} aboutClean={true} />
    </div>
  );
}
