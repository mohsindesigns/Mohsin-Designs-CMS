import { cache } from 'react';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import Page from '@/models/Page';

/**
 * Deduplicated React Server Component fetcher for complete_data.
 * Deduplicates multiple calls within a single request (e.g., layout metadata, layout component, page metadata, page component).
 */
export const getCachedSiteContent = cache(async () => {
  try {
    await connectToDatabase();
    const doc = await SiteContent.findOne({ key: 'complete_data' }).lean();
    return (doc as any)?.data || null;
  } catch (error) {
    console.error('Error in getCachedSiteContent:', error);
    return null;
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
    return null;
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
