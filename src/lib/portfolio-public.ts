// Server-side helpers shared by the PUBLIC portfolio routes (listing, case-study detail page).
// Mirrors src/lib/blog-public.ts's getPublicPostCards / resolvePost pattern for the Portfolio
// collection. Server-only: do not import from a "use client" module.

import { cache } from "react";
import connectToDatabase from "@/lib/mongodb";
import Portfolio from "@/models/Portfolio";
import { getAuthSession } from "@/lib/auth";
import { safeDate } from "@/lib/blog-public";

/** A portfolio item is public when it is published and not in the trash. */
export const PUBLIC_PORTFOLIO_QUERY = { status: "published", isTrashed: { $ne: true } } as const;

const CARD_SELECT =
  "title slug client industry summary services thumbnail thumbnailLabel metrics featured publishedAt createdAt";

export interface PortfolioCard {
  id: string;
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  services: string[];
  thumbnail: string;
  thumbnailLabel: string;
  metrics: { value: string; label: string }[];
  featured: boolean;
  dateISO?: string;
}

export function toPortfolioCard(p: any): PortfolioCard {
  return {
    id: String(p._id),
    slug: String(p.slug || p._id),
    title: String(p.title || "Untitled Project"),
    client: String(p.client || ""),
    industry: String(p.industry || ""),
    summary: String(p.summary || ""),
    services: Array.isArray(p.services) ? p.services.map((s: any) => String(s)) : [],
    thumbnail: String(p.thumbnail || ""),
    thumbnailLabel: String(p.thumbnailLabel || ""),
    metrics: Array.isArray(p.metrics) ? p.metrics.slice(0, 3).map((m: any) => ({ value: String(m?.value || ""), label: String(m?.label || "") })) : [],
    featured: !!p.featured,
    dateISO: (safeDate(p.publishedAt) || safeDate(p.createdAt))?.toISOString(),
  };
}

/** Every public portfolio item as a lean card, newest first. */
export async function getPublicPortfolioCards(): Promise<PortfolioCard[]> {
  await connectToDatabase();
  const items = await Portfolio.find(PUBLIC_PORTFOLIO_QUERY)
    .select(CARD_SELECT)
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();
  return items.map(toPortfolioCard);
}

const HEX_ID = /^[0-9a-fA-F]{24}$/;

async function findItemBySlug(slug: string, extra: Record<string, unknown>) {
  await connectToDatabase();
  const match = HEX_ID.test(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug };
  return Portfolio.findOne({ ...match, ...extra }).lean() as Promise<any>;
}

/**
 * The case study for a public URL, or (for a signed-in admin only) a draft so the editor's
 * "View" link works before publishing. `preview` is true for the latter.
 */
export const resolvePortfolioItem = cache(async (slug: string): Promise<{ item: any | null; preview: boolean }> => {
  try {
    const item = await findItemBySlug(slug, PUBLIC_PORTFOLIO_QUERY);
    if (item) return { item, preview: false };
    const session = await getAuthSession();
    if (!session) return { item: null, preview: false };
    const draft = await findItemBySlug(slug, { isTrashed: { $ne: true } });
    return { item: draft, preview: !!draft };
  } catch (err) {
    console.error(`resolvePortfolioItem failed for ${slug}:`, err);
    throw err;
  }
});

/** Manual override (`nextProjectSlug`) first, else the next published item by date, wrapping to the first. */
export async function getNextProject(current: any): Promise<PortfolioCard | null> {
  await connectToDatabase();
  if (current?.nextProjectSlug) {
    const manual = await Portfolio.findOne({ slug: current.nextProjectSlug, ...PUBLIC_PORTFOLIO_QUERY })
      .select(CARD_SELECT)
      .lean();
    if (manual) return toPortfolioCard(manual);
  }
  const currentDate = safeDate(current?.publishedAt) || safeDate(current?.createdAt) || new Date();
  const after = await Portfolio.findOne({
    ...PUBLIC_PORTFOLIO_QUERY,
    _id: { $ne: current?._id },
    $or: [{ publishedAt: { $lt: currentDate } }, { publishedAt: null, createdAt: { $lt: currentDate } }],
  })
    .select(CARD_SELECT)
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();
  if (after) return toPortfolioCard(after);

  const first = await Portfolio.findOne({ ...PUBLIC_PORTFOLIO_QUERY, _id: { $ne: current?._id } })
    .select(CARD_SELECT)
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();
  return first ? toPortfolioCard(first) : null;
}
