import { cache } from 'react';
import { notFound } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';
import { TemplateWrapper } from '@/components/templates/TemplateRegistry';
import { resolveRobotsMetadata } from '@/lib/seo';
import { getCachedSiteContent } from '@/lib/content';
import { getAuthSession } from '@/lib/auth';
import CustomSchemaMarkup from '@/components/CustomSchemaMarkup';
import { getResolvedSchemaBlocks } from '@/lib/dynamicSchema';
import { absoluteUrl, getPublicPostCards, normalizeCanonicalUrl, stripHtml, truncate } from '@/lib/blog-public';

// The ONE blog index route. /blog and /blog/:slug are redirected here by next.config, and
// src/app/blog/* just re-exports this file so the two trees can never drift again.
export const revalidate = 60; // Cache for 1 minute

const BLOG_PAGE_SLUGS = ['blogs', '/blogs', 'blog', '/blog'];

/**
 * The CMS "Blog" page document. Same visibility rule as every other CMS page ([...slug]):
 * a trashed or non-published page is not served (404), except to a signed-in admin. If no
 * document exists at all the index still renders from the template defaults.
 */
const loadBlogPageDoc = cache(async (): Promise<any | null> => {
  await connectToDatabase();
  const doc = (await Page.findOne({ slug: { $in: BLOG_PAGE_SLUGS }, isTrashed: { $ne: true } }).lean()) as any;
  if (!doc) return null;
  if (doc.status && doc.status !== 'published') {
    const session = await getAuthSession();
    if (!session) notFound();
  }
  return doc;
});

export async function generateMetadata(): Promise<Metadata> {
  const [pageDoc, contentData] = await Promise.all([loadBlogPageDoc(), getCachedSiteContent()]);

  const isGlobalNoIndex = !!contentData?.settings?.globalNoIndex;
  const pageContent = pageDoc?.content?.blogPage || pageDoc?.content || {};
  const globalBlogData = contentData?.blogPage || {};
  const seo = pageDoc?.seo || pageContent?.seo || globalBlogData?.seo || {};
  const pageUrl = `${BASE_URL}/blogs/`;
  const canonical = normalizeCanonicalUrl(seo.canonicalUrl, pageUrl);

  // Hero copy is rich text (<p>..</p>), never put raw markup in a meta description.
  const heroText = truncate(stripHtml(pageContent?.hero?.description || globalBlogData?.hero?.description), 160);
  const metaTitle = seo.metaTitle || 'Blog & Growth Insights | Mohsin Designs';
  const metaDescription = seo.metaDescription || heroText || 'Actionable blueprints, architectural deep-dives, and conversion rate science.';
  const ogImage = absoluteUrl(seo.ogImage || seo.featuredImage);
  const twitterImage = absoluteUrl(seo.twitterImage || seo.ogImage || seo.featuredImage);

  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    alternates: { canonical },
    openGraph: {
      title: seo.ogTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url: canonical,
      siteName: 'Mohsin Designs',
      type: 'website',
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: seo.twitterCard || 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: twitterImage ? [twitterImage] : [],
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
  };
}

export default async function BlogIndexPage() {
  const [pageDoc, globalData, cards] = await Promise.all([
    loadBlogPageDoc(),
    getCachedSiteContent(),
    getPublicPostCards(),
  ]);

  // Plain JSON only: a raw Mongo doc (ObjectId, Date) must not cross into client components.
  const safePage = JSON.parse(JSON.stringify(pageDoc || {}));

  const pageData = {
    ...safePage,
    content: {
      ...(safePage.content || {}),
      blogPage: {
        ...(globalData?.blogPage || {}),
        ...(safePage.content?.blogPage || safePage.content || {}),
      },
    },
    posts: cards,
  };

  // The editor's "Schema Markup" tab (content.schemaMarkup / seo.schemaData) was saved but never rendered here.
  const schemaBlocks = pageDoc ? getResolvedSchemaBlocks({ page: safePage, globalData: globalData || {}, slug: 'blogs' }) : [];

  // Seeds the nested ContentProvider so it does not re-download every post from /api/blogs after mount.
  const initialBlogs = cards.slice(0, 10).map((c) => ({
    _id: c.id,
    title: c.title,
    slug: c.slug,
    featuredImage: c.image,
    publishedAt: c.dateISO,
    categories: c.categories,
  }));

  return (
    <>
      <CustomSchemaMarkup schema={schemaBlocks} />
      <TemplateWrapper
        templateName="blogs"
        pageData={pageData}
        globalData={globalData || {}}
        initialBlogs={initialBlogs}
      />
    </>
  );
}
