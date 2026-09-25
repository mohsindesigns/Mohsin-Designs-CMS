import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import Page from '@/models/Page';

/**
 * Deduplicated React Server Component fetcher for complete_data.
 * Deduplicates multiple calls within a single request (e.g., layout metadata, layout component, page metadata, page component).
 *
 * NOTE on caching: this is only a per-request memo (React `cache`), not a cross-request cache.
 * Cross-request freshness comes from each route's `revalidate = 60` (ISR) plus the admin API's
 * revalidatePath() calls, so a page is re-rendered (and this is re-read) at most every 60 s or right
 * after an admin save.
 *
 * A database failure is RE-THROWN instead of being turned into `null`: returning null made the page
 * render with empty global content (no navbar/footer/settings) and ISR then cached that broken
 * render for up to a minute. Throwing makes ISR keep serving the last good version.
 * `null` still means "no complete_data document exists".
 */
export const getCachedSiteContent = cache(async () => {
  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: 'complete_data' }).lean();
    const data = (doc as any)?.data || null;

    // The services catalog is stored TWICE in complete_data (`services.services` and the
    // `globalServices` mirror, ~540 KB each; /api/content always writes them from the same list).
    // Every page ships this object to the browser (layout ContentProvider + TemplateWrapper), and the
    // two copies are separate objects, so the RSC payload carried the catalog twice. Aliasing the
    // mirror to the same array lets React's flight serializer send it once - about half of every
    // page's HTML. `services.services` is already the authoritative list everywhere it is read.
    if (data && Array.isArray(data.services?.services) && Array.isArray(data.globalServices)) {
      data.globalServices = data.services.services;
    }
    return data;
  } catch (error) {
    console.error('Error in getCachedSiteContent:', error);
    throw error;
  }
});

/**
 * Deduplicated React Server Component fetcher for site scripts.
 */
export const getCachedSiteScripts = cache(async () => {
  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: 'site_scripts_v2' }).lean();
    return Array.isArray((doc as any)?.data) ? (doc as any).data : [];
  } catch (error) {
    console.error('Error in getCachedSiteScripts:', error);
    return [];
  }
});

/**
 * Deduplicated React Server Component fetcher for published pages.
 * `null` = no such published page. A database failure is re-thrown (not reported as "not found"),
 * otherwise a DB blip would be cached by ISR as a 404 for a live page.
 */
export const getCachedPage = cache(async (slug: string) => {
  try {
    await connectToDatabase();
    const page = await Page.findOne({
      slug,
      status: 'published',
      isTrashed: { $ne: true }
    }).lean();
    return page;
  } catch (error) {
    console.error(`Error in getCachedPage for ${slug}:`, error);
    throw error;
  }
});

/**
 * Deduplicated React Server Component fetcher for published blog posts.
 */
export const getCachedPost = cache(async (slug: string) => {
  try {
    await connectToDatabase();
    const isHexId = /^[0-9a-fA-F]{24}$/.test(slug);
    const query = isHexId
      ? { $or: [{ slug }, { _id: slug }], status: 'published', isTrashed: { $ne: true } }
      : { slug, status: 'published', isTrashed: { $ne: true } };

    const Post = (await import('@/models/Post')).default;
    const post = await Post.findOne(query)
      .populate('categories tags')
      .lean();
    return post;
  } catch (error) {
    console.error(`Error in getCachedPost for ${slug}:`, error);
    return null;
  }
});
