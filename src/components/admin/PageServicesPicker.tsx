"use client";

import { useEffect, useState } from "react";
import { Loader2, Globe } from "lucide-react";
import { isServiceVisibleOnPage } from "@/lib/servicesVisibility";
import { adminApiUrl } from "@/lib/adminApi";

interface PageServicesPickerProps {
  /** This page's own slug - the identifier every service's targetPages is matched against. */
  pageSlug: string;
  compact?: boolean;
}

type Source = "catalog" | "page";

interface MergedService {
  title: string;
  slug: string;
  visibility: string;
  targetPages: string[];
  source: Source;
  /** Only set for source "page" - the Page document's own _id, needed to PATCH it back. */
  pageId?: string;
}

/**
 * The reverse of a service's own Display Visibility picker: instead of picking, from a service,
 * which pages it should appear on, this picks, from a PAGE, which Selective services appear in its
 * services section. A service can be authored two ways - a catalog entry (Admin > Services) or its
 * own Page (template "service-detail", Admin > Pages) - so this reads and writes BOTH: catalog
 * entries live in site_contents (section "services"), Page-authored ones live in that Page's own
 * `content.visibility`/`content.targetPages` (same flat shape, see getCachedPageServices). Either
 * way, toggling a checkbox here is identical to ticking it on that service's own picker.
 */
export default function PageServicesPicker({ pageSlug, compact = false }: PageServicesPickerProps) {
  const [merged, setMerged] = useState<MergedService[] | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = () => {
    Promise.all([
      fetch(adminApiUrl(`/api/content?t=${Date.now()}`), { cache: "no-store" }).then((r) => r.json()),
      fetch(adminApiUrl(`/api/admin/pages?t=${Date.now()}`), { cache: "no-store" }).then((r) => r.json()),
    ])
      .then(([contentJson, pagesJson]) => {
        const catalog: MergedService[] = (Array.isArray(contentJson?.services?.services) ? contentJson.services.services : [])
          .filter((s: any) => s && s.title && s.slug && s.status !== "draft" && !s.isTrashed)
          .map((s: any) => ({
            title: s.title,
            slug: s.slug,
            visibility: s.visibility || "global",
            targetPages: Array.isArray(s.targetPages) ? s.targetPages : [],
            source: "catalog" as const,
          }));
        const pageServices: MergedService[] = (Array.isArray(pagesJson) ? pagesJson : [])
          .filter((p: any) => p && p.template === "service-detail" && !p.isTrashed && p.status === "published")
          .map((p: any) => ({
            title: p.content?.title || p.title,
            slug: p.slug,
            visibility: p.content?.visibility === "specific" ? "specific" : "global",
            targetPages: Array.isArray(p.content?.targetPages) ? p.content.targetPages : [],
            source: "page" as const,
            pageId: String(p._id),
          }));
        setMerged([...catalog, ...pageServices]);
      })
      .catch(() => setError("Couldn't load the services list."));
  };

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      load();
    };
    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const live = merged || [];
  const globalOnes = live.filter((s) => s.visibility !== "specific" && s.visibility !== "selective");
  const selectiveOnes = live.filter((s) => s.visibility === "specific" || s.visibility === "selective");

  const nextTargetsFor = (s: MergedService) => {
    const isShownHere = isServiceVisibleOnPage(s, pageSlug);
    return isShownHere
      ? s.targetPages.filter((t) => !isServiceVisibleOnPage({ ...s, targetPages: [t] }, pageSlug))
      : [...s.targetPages, pageSlug];
  };

  const toggleCatalog = async (s: MergedService) => {
    // Re-read live first: the PUT below replaces services.services wholesale, no per-item server
    // merge, so acting on a stale copy could discard another tab's unrelated change in between.
    const liveRes = await fetch(adminApiUrl(`/api/content?t=${Date.now()}`), { cache: "no-store" });
    if (!liveRes.ok) throw new Error("couldn't read live catalog");
    const liveJson = await liveRes.json();
    const liveList: any[] = Array.isArray(liveJson?.services?.services) ? liveJson.services.services : [];
    const liveService = liveList.find((x: any) => x.slug === s.slug) || s;
    const targets = nextTargetsFor({ ...s, targetPages: Array.isArray(liveService.targetPages) ? liveService.targetPages : [] });
    const newList = liveList.map((x: any) => (x.slug === s.slug ? { ...x, targetPages: targets } : x));
    const res = await fetch(adminApiUrl("/api/content"), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: "services", services: { services: newList }, globalServices: newList }),
    });
    if (!res.ok) throw new Error("save failed");
  };

  const togglePage = async (s: MergedService) => {
    if (!s.pageId) return;
    // Same reasoning as toggleCatalog: re-read fresh, the PATCH below replaces `content` wholesale.
    const liveRes = await fetch(adminApiUrl(`/api/admin/pages/${s.pageId}`), { cache: "no-store" });
    if (!liveRes.ok) throw new Error("couldn't read live page");
    const liveJson = await liveRes.json();
    const liveContent = liveJson?.content || {};
    const liveTargets: string[] = Array.isArray(liveContent.targetPages) ? liveContent.targetPages : [];
    const targets = nextTargetsFor({ ...s, targetPages: liveTargets });
    const res = await fetch(adminApiUrl(`/api/admin/pages/${s.pageId}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: { ...liveContent, visibility: "specific", targetPages: targets } }),
    });
    if (!res.ok) throw new Error("save failed");
  };

  const toggle = async (s: MergedService) => {
    const key = `${s.source}:${s.slug}`;
    if (!merged || savingKey) return;
    setSavingKey(key);
    setError("");
    try {
      if (s.source === "catalog") await toggleCatalog(s);
      else await togglePage(s);
      load();
    } catch {
      setError("Couldn't save - try again.");
    } finally {
      setSavingKey(null);
    }
  };

  if (!merged) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-[#646970] p-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading services…
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${compact ? "text-[12px]" : "text-[13px]"}`}>
      <p className="text-[11px] text-[#646970] leading-snug">
        Selective services only (catalog entries from Admin &gt; Services, and service pages authored
        directly in Admin &gt; Pages) - this updates that service's own Display Visibility setting, the
        same as checking it from the service's own editor.
      </p>

      {selectiveOnes.length === 0 ? (
        <p className="text-[11px] text-[#8c8f94] italic">
          No Selective (targeted) services yet. Set a service to &quot;Show on Specific Pages / Services
          Only&quot; to control it from here.
        </p>
      ) : (
        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 border border-[#f0f0f1] rounded p-1.5 bg-[#fafafa]">
          {selectiveOnes.map((s) => {
            const key = `${s.source}:${s.slug}`;
            const checked = isServiceVisibleOnPage(s, pageSlug);
            const busy = savingKey === key;
            return (
              <label
                key={key}
                className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors text-[12px] ${
                  checked ? "bg-[#f0f6fc] text-[#1d2327] font-medium" : "hover:bg-[#f0f0f1] text-[#2c3338]"
                } ${busy ? "opacity-60 pointer-events-none" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(s)}
                  className="rounded text-[#2271b1] focus:ring-[#2271b1] w-3.5 h-3.5"
                />
                <span className="truncate flex-1">{s.title}</span>
                {s.source === "page" && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20 shrink-0">
                    Page
                  </span>
                )}
                {busy && <Loader2 className="w-3 h-3 animate-spin text-[#2271b1]" />}
              </label>
            );
          })}
        </div>
      )}

      {globalOnes.length > 0 && (
        <details className="text-[11px] text-[#646970]">
          <summary className="cursor-pointer select-none flex items-center gap-1">
            <Globe className="w-3 h-3" /> {globalOnes.length} global service{globalOnes.length === 1 ? "" : "s"} always shown here too
          </summary>
          <ul className="mt-1 pl-4 list-disc space-y-0.5">
            {globalOnes.map((s) => (
              <li key={`${s.source}:${s.slug}`}>{s.title}</li>
            ))}
          </ul>
        </details>
      )}

      {error && <p className="text-[11px] text-[#d63638]">{error}</p>}
    </div>
  );
}
