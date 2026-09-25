// Server-side helpers shared by the PUBLIC blog routes (listing, article page, public API).
//
// Everything that decides "is this post visible to the public?", how a post is turned into a
// card, how article HTML is sanitised / gets its table of contents, and how canonical URLs are
// normalised lives here ONCE. Before this, /blog/* and /blogs/* each carried a private copy that
// drifted (different filters, different related-post links, canonical pointing at redirecting
// URLs). Server-only: do not import from a "use client" module (it pulls in mongoose + jsdom).

import { cache } from "react";
import DOMPurify from "isomorphic-dompurify";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { getAuthSession } from "@/lib/auth";
import { BASE_URL } from "@/lib/constants";

/** A post is public when it is published and not in the trash. */
export const PUBLIC_POST_QUERY = { status: "published", isTrashed: { $ne: true } } as const;

/** Lean field list used for cards (listing, related posts). `content` is only used to derive read time. */
const CARD_SELECT = "title slug featuredImage seo.featuredImageAlt categories publishedAt createdAt content";

// ── Text / date helpers ──────────────────────────────────────────────────────

const ENTITIES: Record<string, string> = {
  "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&#x27;": "'", "&apos;": "'", "&nbsp;": " ",
  "&ndash;": "–", "&mdash;": "—", "&rsquo;": "’", "&lsquo;": "‘", "&rdquo;": "”", "&ldquo;": "“", "&hellip;": "…",
};

export function decodeEntities(text: string): string {
  return String(text || "")
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|ndash|mdash|rsquo|lsquo|rdquo|ldquo|hellip|#39|#x27);/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/&#(\d+);/g, (_m, n) => { try { return String.fromCodePoint(Number(n)); } catch { return ""; } })
    .replace(/&#x([0-9a-f]+);/gi, (_m, n) => { try { return String.fromCodePoint(parseInt(n, 16)); } catch { return ""; } });
}

/** HTML -> plain text (tags become spaces, entities decoded, whitespace collapsed). */
export function stripHtml(html: unknown): string {
  if (typeof html !== "string" || !html) return "";
  return decodeEntities(html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

export function wordCount(html: unknown): number {
  const text = stripHtml(html);
  return text ? text.split(" ").length : 0;
}

/** ~200 wpm, never below 1 minute. */
export function readMinutes(html: unknown): number {
  return Math.max(1, Math.ceil(wordCount(html) / 200));
}

/** Truncates at a word boundary. */
export function truncate(text: string, max = 160): string {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max - 30)).replace(/[\s,.;:!?-]+$/, "") + "…";
}

/** Returns a valid Date or null (an invalid Date object must never reach toISOString(), it throws). */
export function safeDate(value: unknown): Date | null {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value as any);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Fixed to UTC so the label is identical on the server and in any visitor's timezone. */
export function formatPostDate(value: unknown): string {
  const d = safeDate(value);
  if (!d) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}

export function postDateIso(post: any): string | undefined {
  return (safeDate(post?.publishedAt) || safeDate(post?.createdAt))?.toISOString();
}

export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Canonical URL for a blog article / the blog index.
 * - own-site canonicals get the trailing slash the site uses (`trailingSlash: true`)
 * - legacy `/blog/<slug>` (301 -> /blogs/) and the auto-suggested `/<slug>` (a 404) collapse to `/blogs/<slug>/`
 * - external canonicals are honoured untouched
 */
export function normalizeCanonicalUrl(raw: unknown, fallback: string, slug?: string): string {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return fallback;
  let url: URL;
  try {
    url = new URL(value, BASE_URL);
  } catch {
    return fallback;
  }
  const host = (h: string) => h.replace(/^www\./, "");
  if (host(url.hostname) !== host(new URL(BASE_URL).hostname)) return url.toString();

  let path = url.pathname.replace(/\/+$/, "") || "/";
  if (slug && (path === `/${slug}` || path === `/blog/${slug}`)) path = `/blogs/${slug}`;
  else if (path === "/blog" || path.startsWith("/blog/")) path = `/blogs${path.slice(5)}`;
  if (!path.endsWith("/") && !/\.[a-z0-9]+$/i.test(path.split("/").pop() || "")) path += "/";
  return `${BASE_URL}${path}${url.search}`;
}

// ── Cards ────────────────────────────────────────────────────────────────────

export interface BlogCard {
  id: string;
  slug: string;
  title: string;
  image: string;
  imageAlt: string;
  badge: string;
  categoryKey: string;
  categories: { name: string; slug: string }[];
  date: string;
  dateISO?: string;
  readTime: string;
}

/** Turns a lean Post (categories populated) into the small serialisable shape the templates render. */
export function toBlogCard(p: any): BlogCard {
  const cats = (Array.isArray(p?.categories) ? p.categories : [])
    .filter((c: any) => c && typeof c === "object" && c.name)
    .map((c: any) => ({ name: String(c.name), slug: String(c.slug || String(c.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")) }));
  const first = cats[0];
  return {
    id: String(p._id),
    slug: String(p.slug || p._id),
    title: String(p.title || "Untitled Article"),
    image: p.featuredImage || "",
    imageAlt: p.seo?.featuredImageAlt || p.title || "",
    badge: first?.name || "Article",
    categoryKey: first?.slug || "general",
    categories: cats,
    date: formatPostDate(p.publishedAt || p.createdAt),
    dateISO: postDateIso(p),
    readTime: `${readMinutes(p.content)} min read`,
  };
}

// ── Queries ──────────────────────────────────────────────────────────────────

/**
 * Scheduled posts: the editor offers a "Scheduled" status + publish date, but nothing ever flipped
 * them to published, so they stayed invisible forever. Every public entry point calls this first, so
 * a scheduled post goes live on the first request after its date (cached once per request).
 */
export const promoteDueScheduledPosts = cache(async () => {
  try {
    await connectToDatabase();
    await Post.updateMany(
      { status: "scheduled", isTrashed: { $ne: true }, publishedAt: { $lte: new Date() } },
      { $set: { status: "published" } }
    );
  } catch (err) {
    console.error("promoteDueScheduledPosts failed:", err);
  }
});

const HEX_ID = /^[0-9a-fA-F]{24}$/;

async function findPostBySlug(slug: string, extra: Record<string, unknown>) {
  await connectToDatabase();
  const match = HEX_ID.test(slug) ? { $or: [{ slug }, { _id: slug }] } : { slug };
  return Post.findOne({ ...match, ...extra })
    .populate("categories", "name slug")
    .populate("tags", "name slug")
    .lean() as Promise<any>;
}

/**
 * The article for a public URL, or (for a signed-in admin only) a draft / scheduled post so the
 * editor's "View Post" link works before publishing. `preview` is true for the latter.
 * `cookies()` is only touched when the post is NOT publicly visible, so normal article renders stay cacheable.
 */
export const resolvePost = cache(async (slug: string): Promise<{ post: any | null; preview: boolean }> => {
  try {
    await promoteDueScheduledPosts();
    const post = await findPostBySlug(slug, PUBLIC_POST_QUERY);
    if (post) return { post, preview: false };
    const session = await getAuthSession();
    if (!session) return { post: null, preview: false };
    const draft = await findPostBySlug(slug, { isTrashed: { $ne: true } });
    return { post: draft, preview: !!draft };
  } catch (err) {
    // Re-thrown (not "not found"): ISR must keep the last good page instead of caching a 404 for a DB blip.
    console.error(`resolvePost failed for ${slug}:`, err);
    throw err;
  }
});

/** Every public post as a lean card, newest first. */
export async function getPublicPostCards(): Promise<BlogCard[]> {
  await connectToDatabase();
  await promoteDueScheduledPosts();
  const posts = await Post.find(PUBLIC_POST_QUERY)
    .select(CARD_SELECT)
    .populate("categories", "name slug")
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean();
  return posts.map(toBlogCard);
}

/** Up to `limit` related cards: same category / tag first, topped up with the newest posts. */
export async function getRelatedCards(post: any, limit = 3): Promise<BlogCard[]> {
  await connectToDatabase();
  const ids = (list: any) => (Array.isArray(list) ? list : []).map((x: any) => x?._id || x).filter(Boolean);
  const catIds = ids(post.categories);
  const tagIds = ids(post.tags);
  const base = { ...PUBLIC_POST_QUERY };

  let related: any[] = [];
  if (catIds.length || tagIds.length) {
    related = await Post.find({
      ...base,
      _id: { $ne: post._id },
      $or: [{ categories: { $in: catIds } }, { tags: { $in: tagIds } }],
    })
      .select(CARD_SELECT)
      .populate("categories", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }
  if (related.length < limit) {
    const more = await Post.find({ ...base, _id: { $nin: [post._id, ...related.map((r) => r._id)] } })
      .select(CARD_SELECT)
      .populate("categories", "name slug")
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(limit - related.length)
      .lean();
    related = related.concat(more);
  }
  return related.map(toBlogCard);
}

// ── Article HTML: sanitising + table of contents ─────────────────────────────

/**
 * Post HTML is authored in the admin (Tiptap / WordPress import) and stored verbatim, and the article
 * page injects it with dangerouslySetInnerHTML, so it is sanitised with real DOMPurify (jsdom on the
 * server) before anything is derived from it. Fails closed. `target` is kept (editor links use
 * target=_blank) and such links always get rel="noopener noreferrer".
 */
export function sanitizePostHtml(html: string): string {
  if (!html) return "";
  let clean = "";
  try {
    clean = DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
  } catch {
    return "";
  }
  return clean.replace(/<a\b([^>]*)>/gi, (m, attrs: string) => {
    if (!/\btarget\s*=\s*["']?_blank/i.test(attrs)) return m;
    const rel = /\brel\s*=\s*(["'])(.*?)\1/i.exec(attrs);
    if (!rel) return `<a${attrs} rel="noopener noreferrer">`;
    const tokens = new Set(rel[2].split(/\s+/).filter(Boolean));
    tokens.add("noopener");
    tokens.add("noreferrer");
    return `<a${attrs.replace(rel[0], `rel="${[...tokens].join(" ")}"`)}>`;
  });
}

export interface TocItem { id: string; text: string; level: number }

const slugifyHeading = (text: string) =>
  text.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

/**
 * Adds an id + styling to every h1-h3 and returns the table of contents.
 * - h1 inside article content is demoted to h2 (the page title is the single h1)
 * - duplicate heading texts get -2, -3 ... so anchors never collide
 * - a heading that already carries an id keeps it
 * - headings that span several lines are handled
 */
export function addHeadingAnchors(html: string): { html: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  const used = new Map<string, number>();
  const out = html.replace(/<(h[123])\b([^>]*)>([\s\S]*?)<\/\1>/gi, (full, rawTag: string, attrs: string, inner: string) => {
    const text = decodeEntities(inner.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
    if (text.length < 2) return full;

    let level = parseInt(rawTag[1], 10);
    if (level === 1) level = 2;
    const tag = `h${level}`;

    // Only ever re-emit a conservative id charset (never echo arbitrary attribute text back into markup).
    const existing = (/(?:^|\s)id\s*=\s*(["'])(.*?)\1/i.exec(attrs)?.[2] || "").replace(/[^A-Za-z0-9_.:-]/g, "");
    const base = existing || slugifyHeading(text) || `section-${toc.length + 1}`;
    const n = (used.get(base) || 0) + 1;
    used.set(base, n);
    const id = n === 1 ? base : `${base}-${n}`;

    toc.push({ id, text, level });
    return `<${tag} id="${id}" class="scroll-mt-32 font-heading ${
      level <= 2 ? "text-2xl sm:text-3xl mt-12 mb-4" : "text-xl sm:text-2xl mt-8 mb-3"
    } font-black text-brand-dark dark:text-white leading-snug">${inner}</${tag}>`;
  });
  return { html: out, toc };
}
