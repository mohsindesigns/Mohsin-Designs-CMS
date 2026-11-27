// Server-side helpers shared by the ADMIN portfolio API routes. Mirrors src/lib/blog-admin.ts
// (whitelisted-field picking, publish rules, revalidation) for the Portfolio collection.

import { safeDate } from '@/lib/blog-public';

export { slugify, dbErrorResponse, toIdList } from '@/lib/blog-admin';

export const PORTFOLIO_STATUSES = ['draft', 'published'] as const;
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];

/** Only these top-level fields may be written from the request body (mass-assignment guard). */
const PORTFOLIO_FIELDS = [
  'title', 'slug', 'client', 'industry', 'summary', 'services', 'thumbnail', 'thumbnailLabel',
  'metrics', 'featured', 'location', 'timeline', 'liveUrl', 'tags', 'nextProjectSlug',
  'status', 'publishedAt', 'sections', 'seo',
] as const;

export function pickPortfolioFields(body: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!body || typeof body !== 'object') return out;
  for (const key of PORTFOLIO_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if (typeof out.title === 'string') out.title = out.title.trim();
  if (Array.isArray(out.services)) {
    out.services = [...new Set(out.services.map((s: any) => String(s ?? '').trim()).filter(Boolean))];
  }
  if (Array.isArray(out.tags)) {
    out.tags = out.tags.map((t: any) => String(t ?? '').trim()).filter(Boolean);
  }
  if (Array.isArray(out.metrics)) {
    out.metrics = out.metrics
      .slice(0, 3)
      .map((m: any) => ({ value: String(m?.value ?? '').trim(), label: String(m?.label ?? '').trim() }))
      .filter((m: any) => m.value || m.label);
  }
  if (out.seo && typeof out.seo === 'object') {
    delete out.seo._id;
  }
  return out;
}

/**
 * Simpler than blog-admin's applyPublishRules (no "scheduled" status for Portfolio items): a
 * freshly-published item that never had a publish date gets "now".
 */
export function applyPortfolioPublishRules(
  fields: Record<string, any>,
  prev?: { status?: string; publishedAt?: unknown } | null
): Record<string, any> {
  const out = { ...fields };
  if ('publishedAt' in out) {
    const d = safeDate(out.publishedAt);
    if (d) out.publishedAt = d;
    else delete out.publishedAt;
  }
  if (out.status === 'published' && prev?.status !== 'published' && !safeDate(out.publishedAt)) {
    out.publishedAt = new Date();
  }
  return out;
}

/** Refreshes the cached public pages that show a portfolio item. */
export async function revalidatePortfolio(slugs: Array<string | undefined | null> = []) {
  try {
    const { revalidatePath } = await import('next/cache');
    for (const slug of new Set(slugs.filter(Boolean) as string[])) {
      revalidatePath(`/portfolio/${slug}`);
    }
    revalidatePath('/portfolio');
  } catch (err) {
    console.error('Failed to revalidate portfolio path:', err);
  }
}
