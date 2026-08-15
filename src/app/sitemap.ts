import { MetadataRoute } from 'next';
import connectToDatabase from '@/lib/mongodb';
import SiteContent from '@/models/Content';
import Page from '@/models/Page';
import Post from '@/models/Post';
import { BASE_URL } from '@/lib/constants';
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  // Fetch dynamic content from DB
  let dynamicServices: any[] = [];
  let dynamicPages: any[] = [];
  let dynamicBlogPosts: any[] = [];
  try {
    await connectToDatabase();

    // Fetch Services
    const content = await SiteContent.findOne({ key: 'complete_data' });
    if (content?.data?.services) {
      const sData = content.data.services;
      dynamicServices = Array.isArray(sData) ? sData : (sData.services || []);
    }

    // Fetch dynamic Pages
    const pages = await Page.find({
      status: 'published',
      isTrashed: { $ne: true }
    }).lean();

    dynamicPages = pages;

    // Fetch published blog posts
    const posts = await Post.find({
      status: 'published',
      isTrashed: { $ne: true }
    }).lean();

    dynamicBlogPosts = posts;
  } catch (e) {
    console.error("Sitemap: Failed to fetch dynamic data", e);
  }

  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
  ];

  // Dynamic service detail pages
  const serviceRoutes: MetadataRoute.Sitemap = dynamicServices.map((service: any) => {
    const slug = String(service.slug || '')
      .replace(/^\/+/, '')
      .replace(/\/+$|^services\//, '');

    return {
      url: `${BASE_URL}/services/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    };
  });

  const blogRoutes: MetadataRoute.Sitemap = dynamicBlogPosts.map((post: any) => {
    const slug = String(post.slug || '').replace(/^\/+/, '').replace(/\/+$/, '');

    return {
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: post.updatedAt ? new Date(post.updatedAt).toISOString() : now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    };
  });

  // Dynamic custom pages
  // Filter out slugs that are already in staticRoutes to avoid duplicates
  const staticSlugs = staticRoutes.map(r => r.url.replace(BASE_URL, '').replace(/^\//, ''));
  const customPageRoutes: MetadataRoute.Sitemap = dynamicPages
    .filter((page: any) =>
      !staticSlugs.includes(page.slug) &&
      page.slug !== '' &&
      page.slug !== 'home'
    )
    .map((page: any) => ({
      url: `${BASE_URL}/${page.slug}`,
      lastModified: page.updatedAt ? new Date(page.updatedAt).toISOString() : now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes, ...customPageRoutes];
}
