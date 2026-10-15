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

/**
 * The reverse of VisibilityPicker: instead of picking, from a SERVICE, which pages it should
 * appear on, this picks, from a PAGE, which Selective services should appear in its services
 * section. Both read and write the exact same field (service.targetPages), via the same
 * isServiceVisibleOnPage() matcher used everywhere services are filtered for display, so toggling
 * a checkbox here is identical to ticking it on that service's own "Display Visibility" picker.
 */
export default function PageServicesPicker({ pageSlug, compact = false }: PageServicesPickerProps) {
  const [catalog, setCatalog] = useState<any[] | null>(null);
  const [savingSlug, setSavingSlug] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(adminApiUrl(`/api/content?t=${Date.now()}`), { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const list = Array.isArray(json?.services?.services) ? json.services.services : [];
        setCatalog(list);
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load the services catalog.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const live = (catalog || []).filter((s: any) => s && s.title && s.slug && s.status !== "draft" && !s.isTrashed);
  const globalOnes = live.filter((s: any) => (s.visibility || "global") !== "specific" && s.visibility !== "selective");
  const selectiveOnes = live.filter((s: any) => s.visibility === "specific" || s.visibility === "selective");

  const toggle = async (service: any) => {
    if (!catalog || savingSlug) return;
    const slug = service.slug;
    setSavingSlug(slug);
    setError("");
    try {
      // The PUT below replaces services.services wholesale - no per-item server merge - so this
      // must act on a FRESH read, not the `catalog` this component loaded on mount: another tab
      // (or the service's own editor) may have changed something else in the meantime, and
      // writing back our stale copy of the whole list would silently discard that change (the
      // same stale-save failure admin/services/page.tsx's saveToDb guards against).
      const liveRes = await fetch(adminApiUrl(`/api/content?t=${Date.now()}`), { cache: "no-store" });
      if (!liveRes.ok) throw new Error("couldn't read live catalog");
      const liveJson = await liveRes.json();
      const liveList: any[] = Array.isArray(liveJson?.services?.services) ? liveJson.services.services : [];
      const liveService = liveList.find((s: any) => s.slug === slug) || service;

      const currentTargets: string[] = Array.isArray(liveService.targetPages) ? liveService.targetPages : [];
      const isShownHere = isServiceVisibleOnPage(liveService, pageSlug);
      // Unchecking removes every saved target that currently resolves to this page - not just a
      // literal match - so an alias entry (e.g. "about-us" when this page's slug is "about") still
      // gets cleared instead of silently staying and leaving the box looking unchecked but ineffective.
      const nextTargets = isShownHere
        ? currentTargets.filter((t) => !isServiceVisibleOnPage({ ...liveService, targetPages: [t] }, pageSlug))
        : [...currentTargets, pageSlug];

      const newList = liveList.map((s: any) => (s.slug === slug ? { ...s, targetPages: nextTargets } : s));
      const res = await fetch(adminApiUrl("/api/content"), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "services",
          services: { services: newList },
          globalServices: newList,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setCatalog(newList);
    } catch {
      setError("Couldn't save - try again.");
    } finally {
      setSavingSlug(null);
    }
  };

  if (!catalog) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-[#646970] p-2">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading services…
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${compact ? "text-[12px]" : "text-[13px]"}`}>
      <p className="text-[11px] text-[#646970] leading-snug">
        Selective services only - this updates that service's own Display Visibility setting, the same
        as checking it from the service editor.
      </p>

      {selectiveOnes.length === 0 ? (
        <p className="text-[11px] text-[#8c8f94] italic">
          No Selective (targeted) services yet. Set a service to &quot;Show on Specific Pages / Services
          Only&quot; to control it from here.
        </p>
      ) : (
        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-1 border border-[#f0f0f1] rounded p-1.5 bg-[#fafafa]">
          {selectiveOnes.map((s: any) => {
            const checked = isServiceVisibleOnPage(s, pageSlug);
            const busy = savingSlug === s.slug;
            return (
              <label
                key={s.slug}
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
            {globalOnes.map((s: any) => (
              <li key={s.slug}>{s.title}</li>
            ))}
          </ul>
        </details>
      )}

      {error && <p className="text-[11px] text-[#d63638]">{error}</p>}
    </div>
  );
}
