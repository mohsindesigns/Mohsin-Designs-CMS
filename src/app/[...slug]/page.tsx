import { notFound, permanentRedirect } from 'next/navigation';
import { cache } from 'react';

export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { TemplateWrapper, hasTemplate, cleanFaqList } from '@/components/templates/TemplateRegistry';
import { Metadata } from 'next';
import CustomSchemaMarkup from '@/components/CustomSchemaMarkup';
import { BASE_URL } from '@/lib/constants';
import { resolveRobotsMetadata } from '@/lib/seo';
import { getCachedPage, getCachedSiteContent } from '@/lib/content';
import { getResolvedSchemaBlocks } from '@/lib/dynamicSchema';
import {
  validateLocationHierarchy,
  getCanonicalLocationPath,
  applyLocationHierarchy,
  type LocationCheck,
} from '@/lib/locationHierarchy';
import { getAuthSession } from '@/lib/auth';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

const LOCATION_TEMPLATES = new Set(['country', 'state', 'city']);

/**
 * Templates whose components read `useContent().allBlogs` (blog cards). The root layout's provider
 * is replaced by TemplateWrapper's own provider on this route, and nothing else seeds its blog
 * list, so without `initialBlogs` these sections were empty in the server HTML and only appeared
 * after a client-side fetch of /api/blogs (which downloads every post body).
 */
const BLOG_AWARE_TEMPLATES = new Set(['home', 'services', 'service-detail', 'country', 'state', 'city']);

function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * True only for a VERIFIED admin session (JWT signature + expiry checked by getAuthSession) that
 * may read pages. This used to test for the mere presence of a `mohsin_admin_session` cookie, so
 * anyone could add a cookie with any value in their browser and read every draft page.
 * Calling cookies() opts this request out of the static/ISR cache, which is why it is only done
 * on the (rare) path where a published page was not found.
 */
async function canPreviewDrafts(): Promise<boolean> {
  try {
    const session: any = await getAuthSession();
    return !!session?.permissions?.pages?.read;
  } catch {
    return false;
  }
}

type Resolved =
  | { kind: 'page'; page: any; check?: LocationCheck; preview?: boolean }
  | { kind: 'redirect'; to: string }
  | { kind: 'notFound' };

/**
 * Single source of truth for "which Page does this URL show?", shared by generateMetadata and the
 * page component (React `cache` runs it once per request).
 *
 *  1. A published, non-location page stored under exactly this slug.
 *  2. A published Country/State/City page under its canonical /country[/state[/city]]/ URL (the
 *     stored slug can be flat for legacy documents, see lib/locationPath.ts).
 *  3. A location page reached by any other URL (e.g. legacy flat /nevada/) -> 301 to the
 *     canonical URL, or 404 when its parent chain is not published.
 *  4. Admin-only preview of a draft page.
 */
const resolvePage = cache(async (slug: string): Promise<Resolved> => {
  const segments = slug.split('/').filter(Boolean);

  const direct: any = await getCachedPage(slug);
  if (direct && !LOCATION_TEMPLATES.has(direct.template)) {
    return { kind: 'page', page: direct };
  }

  if (segments.length >= 1 && segments.length <= 3) {
    const check = await validateLocationHierarchy(segments);
    if (check.valid && check.page) return { kind: 'page', page: check.page, check };
  }

  if (direct) {
    const canonical = await getCanonicalLocationPath(direct);
    if (canonical && canonical !== segments.join('/')) return { kind: 'redirect', to: `/${canonical}/` };
    return { kind: 'notFound' };
  }

  if (await canPreviewDrafts()) {
    try {
      await connectToDatabase();
      const draft = await Page.findOne({ slug, isTrashed: { $ne: true } }).lean();
      if (draft) return { kind: 'page', page: draft, preview: true };
    } catch {}
  }

  return { kind: 'notFound' };
});

/** Host names this site legitimately serves (used to decide whether a canonical is "ours"). */
function ownHosts(): Set<string> {
  const hosts = new Set<string>(['mohsindesigns.com', 'www.mohsindesigns.com']);
  try {
    hosts.add(new URL(BASE_URL).host);
  } catch {}
  return hosts;
}

function pathOfOwnUrl(url: string): string | null {
  try {
    const u = new URL(url, BASE_URL);
    if (!ownHosts().has(u.host)) return null;
    return u.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = (resolvedParams.slug || []).join('/');

  const [resolved, globalData] = await Promise.all([resolvePage(slug), getCachedSiteContent()]);
  if (resolved.kind !== 'page') return {};

  const page = resolved.page;
  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;
  const seo = page.seo || {};

  // Location pages are only valid at their hierarchical URL; use it for the default canonical.
  const canonicalPath = resolved.check?.canonicalPath || slug;
  const pageUrl = `${BASE_URL}/${canonicalPath}/`;

  let canonicalUrl = seo.canonicalUrl
    ? (seo.canonicalUrl.endsWith('/') ? seo.canonicalUrl : `${seo.canonicalUrl}/`)
    : pageUrl;
  // A stored canonical that points at one of OUR OWN URLs but not this page's URL is stale (it was
  // typed for another slug, or the page was moved); emitting it would tell Google to index the
  // wrong URL. Explicit cross-domain canonicals are left alone.
  if (seo.canonicalUrl) {
    const ownPath = pathOfOwnUrl(seo.canonicalUrl);
    if (ownPath !== null && ownPath !== canonicalPath.toLowerCase() && LOCATION_TEMPLATES.has(page.template)) {
      canonicalUrl = pageUrl;
    }
  }

  const siteName = globalData?.settings?.siteTitle || 'Mohsin Designs';

  return {
    title: {
      absolute: seo.metaTitle || page.title
    },
    description: seo.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    // Draft previews (admin only) must never be indexed.
    robots: resolved.preview ? { index: false, follow: false } : resolveRobotsMetadata(seo, isGlobalNoIndex),
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || page.title,
      description: seo.ogDescription || seo.metaDescription,
      url: canonicalUrl,
      siteName,
      type: "website",
      images: [
        {
          url: getAbsoluteUrl(seo.featuredImage || seo.ogImage) || `${BASE_URL}/logo.png`,
          width: 1200,
          height: 630,
          alt: seo.featuredImageAlt || page.title,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle || page.title,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [getAbsoluteUrl(seo.featuredImage || seo.twitterImage || seo.ogImage) || `${BASE_URL}/logo.png`],
      site: "@MohsinDesigns",
      creator: "@MohsinDesigns",
    },
  };
}

/** Lean, SSR-safe blog cards for the blog-aware templates (see BLOG_AWARE_TEMPLATES). */
async function loadInitialBlogs(): Promise<any[] | undefined> {
  try {
    await connectToDatabase();
    const Post = (await import('@/models/Post')).default;
    const posts: any[] = await Post.find({ status: 'published', isTrashed: { $ne: true } })
      .select('_id title slug excerpt featuredImage publishedAt createdAt categories content')
      .populate('categories', 'name')
      .sort({ publishedAt: -1 })
      .lean();
    return posts.map((p) => {
      const text = typeof p.content === 'string' ? p.content.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim() : '';
      const words = text ? text.split(/\s+/).length : 0;
      return {
        _id: String(p._id),
        title: p.title,
        slug: p.slug,
        excerpt: p.excerpt,
        featuredImage: p.featuredImage,
        publishedAt: p.publishedAt || p.createdAt,
        categories: Array.isArray(p.categories) ? p.categories.map((c: any) => (c && typeof c === 'object' ? { name: c.name } : c)) : [],
        readTime: words ? `${Math.max(1, Math.ceil(words / 200))} min read` : undefined,
      };
    });
  } catch {
    // The client provider falls back to fetching /api/blogs.
    return undefined;
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugSegments = resolvedParams.slug || [];
  const slug = slugSegments.join('/');

  const [resolved, globalDataRaw] = await Promise.all([resolvePage(slug), getCachedSiteContent()]);

  if (resolved.kind === 'redirect') permanentRedirect(resolved.to);
  if (resolved.kind === 'notFound') notFound();

  const pageDoc = resolved.page;

  // An unknown/legacy template key would silently render as the Home template (getTemplate's
  // fallback). Show a 404 instead of a wrong page.
  if (!hasTemplate(pageDoc.template)) {
    console.error(`[pages] "${slug}" has unknown template "${pageDoc.template}" - serving 404`);
    notFound();
  }

  // Convert to plain object to avoid Mongoose serialization issues in Client Components
  const page = JSON.parse(JSON.stringify(pageDoc));
  // Location pages: make slug + country/state/city fields agree with the URL being served.
  if (resolved.check) applyLocationHierarchy(page, resolved.check);
  const schemaSlug: string = resolved.check?.canonicalPath || slug;

  const globalData = globalDataRaw || {};
  const settings = globalData.settings || {};

  // The page that is the site homepage lives at "/", never at its own slug. That is either the page
  // chosen in Settings > Homepage, or - when nothing is chosen - the default home page (slug
  // "home"/"homepage") that "/" falls back to. (Admin draft previews are not redirected.)
  if (!resolved.preview) {
    const isChosenHomepage = !!settings.homepageId && String(pageDoc._id) === String(settings.homepageId);
    const isDefaultHome =
      !settings.homepageId && page.template === 'home' && (slug === 'home' || slug === 'homepage');
    if (isChosenHomepage || isDefaultHome) {
      permanentRedirect("/");
    }
  }

  // Detect FAQs ONLY if this is the FAQ template (as requested)
  if (page.template === 'faq') {
    const pageSpecificFaqs = cleanFaqList(page.content?.faqs);
    if (pageSpecificFaqs.length > 0) {
      page.faqs = pageSpecificFaqs;
    } else {
      const allFaqs = globalData.faq?.items || [];
      page.faqs = allFaqs.filter((item: any) =>
        item.visibility === 'global' ||
        (item.visibility === 'specific' && item.targetPages?.includes(slug))
      );
    }
  }

  // Resolve dynamic schema: supports variable tokens and custom schema
  const resolvedSchemaBlocks = getResolvedSchemaBlocks({
    page,
    globalData,
    slug: schemaSlug
  });

  const initialBlogs = BLOG_AWARE_TEMPLATES.has(page.template) ? await loadInitialBlogs() : undefined;

  return (
    <div>
      <CustomSchemaMarkup schema={resolvedSchemaBlocks} />
      <TemplateWrapper
        templateName={page.template}
        pageData={{
          ...page,
          content: {
            ...(page.content || {}),
            globalServices: globalData?.services?.services || globalData?.globalServices || []
          }
        }}
        globalData={globalData}
        initialBlogs={initialBlogs}
        params={resolvedParams}
      />
    </div>
  );
}
