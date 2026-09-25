// Server-side helpers shared by the ADMIN blog API routes (posts, bulk, duplicate, categories, tags).
// Keeps slug rules, publish/schedule rules, revalidation and error messages in one place.

import { NextResponse } from 'next/server';
import { safeDate } from '@/lib/blog-public';

export const POST_STATUSES = ['draft', 'published', 'scheduled'] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

/** URL-safe slug: lowercase a-z0-9 and single hyphens. */
export function slugify(text: unknown): string {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Only these fields may be written from the request body (mass-assignment guard). */
const POST_FIELDS = [
  'title', 'slug', 'content', 'excerpt', 'featuredImage', 'categories', 'tags', 'location',
  'status', 'publishedAt', 'seo', 'faq', 'faqSchemaMarkup', 'faqBadge', 'faqTitle', 'faqDescription',
] as const;

/** Accept ids or populated objects ({_id,...}) for categories / tags and return a clean id list. */
export function toIdList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((v: any) => (v && typeof v === 'object' ? v._id ?? v.id : v))
    .map((v) => (v == null ? '' : String(v)))
    .filter((v) => /^[0-9a-fA-F]{24}$/.test(v));
  return [...new Set(ids)];
}

export function pickPostFields(body: any): Record<string, any> {
  const out: Record<string, any> = {};
  if (!body || typeof body !== 'object') return out;
  for (const key of POST_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  if ('categories' in out) out.categories = toIdList(out.categories);
  if ('tags' in out) out.tags = toIdList(out.tags);
  if (typeof out.title === 'string') out.title = out.title.trim();
  if (typeof out.slug === 'string') out.slug = slugify(out.slug);
  if ('faq' in out) {
    out.faq = (Array.isArray(out.faq) ? out.faq : [])
      .map((f: any) => ({ question: String(f?.question ?? '').trim(), answer: String(f?.answer ?? '').trim() }))
      .filter((f: any) => f.question || f.answer);
  }
  if (out.seo && typeof out.seo === 'object') {
    // Mongoose adds an _id to the nested object when it round-trips through the editor; drop it.
    delete out.seo._id;
  }
  return out;
}

/**
 * Status / publish-date rules, applied on every create + update so the public site and the admin agree:
 *  - "scheduled" with a future date stays scheduled; with a past/missing date it is simply published now
 *  - "published" with a FUTURE date becomes scheduled (it must not go live early)
 *  - a post that becomes published for the first time gets "now" as its publish date unless the editor
 *    deliberately set one (it used to keep the draft's creation date as "Published on")
 */
export function applyPublishRules(
  fields: Record<string, any>,
  prev?: { status?: string; publishedAt?: unknown } | null
): Record<string, any> {
  const out = { ...fields };
  const now = new Date();

  if ('publishedAt' in out) {
    const d = safeDate(out.publishedAt);
    if (d) out.publishedAt = d;
    else delete out.publishedAt;
  }

  const status: string | undefined = out.status ?? undefined;
  if (!status) return out;

  const prevDate = safeDate(prev?.publishedAt);
  const chosen = safeDate(out.publishedAt); // explicit in THIS request
  const changedDate = !!chosen && (!prevDate || chosen.getTime() !== prevDate.getTime());
  const effective = chosen ?? prevDate;

  if (status === 'scheduled') {
    if (effective && effective.getTime() > now.getTime()) {
      out.publishedAt = effective;
    } else {
      out.status = 'published';
      out.publishedAt = changedDate && chosen ? chosen : now;
    }
  } else if (status === 'published') {
    if (changedDate && chosen && chosen.getTime() > now.getTime()) {
      out.status = 'scheduled';
      out.publishedAt = chosen;
    } else if (prev?.status !== 'published' && !changedDate) {
      out.publishedAt = now;
    }
  }
  return out;
}

/** Refreshes the cached public pages that show a post. */
export async function revalidateBlog(slugs: Array<string | undefined | null> = []) {
  try {
    const { revalidatePath } = await import('next/cache');
    for (const slug of new Set(slugs.filter(Boolean) as string[])) {
      revalidatePath(`/blogs/${slug}`);
      revalidatePath(`/blog/${slug}`);
    }
    revalidatePath('/blogs');
    revalidatePath('/blog');
  } catch (err) {
    console.error('Failed to revalidate path:', err);
  }
}

/** Turns a Mongo/Mongoose error into { status, message } an editor can act on. */
export function dbErrorResponse(error: any, what = 'item') {
  if (error?.code === 11000) {
    const field = Object.keys(error?.keyPattern || error?.keyValue || {})[0] || 'slug';
    return NextResponse.json(
      { error: `Another ${what} already uses this ${field}. Choose a different ${field}.`, field },
      { status: 409 }
    );
  }
  if (error?.name === 'ValidationError') {
    const msg = Object.values(error.errors || {})
      .map((e: any) => e?.message)
      .filter(Boolean)
      .join(' ');
    return NextResponse.json({ error: msg || 'Validation failed.' }, { status: 400 });
  }
  if (error?.name === 'CastError') {
    return NextResponse.json({ error: 'Invalid id.' }, { status: 400 });
  }
  return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
}
