import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Page from '@/models/Page';
import SiteContent from '@/models/Content';
import { Metadata } from 'next';
import { BASE_URL } from '@/lib/constants';
import { TemplateWrapper } from '@/components/templates/TemplateRegistry';

export const revalidate = 60; // Cache for 1 minute

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const [pageDoc, contentDoc] = await Promise.all([
    Page.findOne({ slug: { $in: ['blog', '/blog'] } }).lean() as any,
    SiteContent.findOne({ key: 'complete_data' }).lean() as any
  ]);

  const pageContent = pageDoc?.content?.blogPage || pageDoc?.content || {};
  const globalBlogData = contentDoc?.data?.blogPage || {};
  const seo = pageDoc?.seo || pageContent?.seo || globalBlogData?.seo || {};
  const pageUrl = `${BASE_URL}/blog`;

  const metaTitle = seo.metaTitle || pageContent?.hero?.titleHighlight || globalBlogData?.hero?.title || "Blog & Growth Insights | Mohsin Designs";
  const metaDescription = seo.metaDescription || pageContent?.hero?.description || globalBlogData?.hero?.description || "Actionable blueprints, architectural deep-dives, and conversion rate science.";

  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: seo.ogTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url: pageUrl,
      type: 'website',
      images: seo.featuredImage ? [{ url: seo.featuredImage }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: [seo.featuredImage || seo.twitterImage || seo.ogImage].filter(Boolean) as string[],
    },
    robots: {
      index: seo.metaRobotsIndex !== 'noindex',
      follow: seo.metaRobotsFollow !== 'nofollow',
    }
  };
}

export default async function BlogIndexPage() {
  await connectToDatabase();

  const [pageDoc, contentDoc, posts, categories] = await Promise.all([
    Page.findOne({ slug: { $in: ['blog', '/blog'] } }).lean() as any,
    SiteContent.findOne({ key: 'complete_data' }).lean() as any,
    Post.find({ status: 'published' })
      .populate('categories author')
      .sort({ publishedAt: -1 })
      .lean(),
    Category.find({}).lean()
  ]);

  // Combine page data
  const pageData = {
    ...(pageDoc || {}),
    content: {
      ...(pageDoc?.content || {}),
      blogPage: {
        ...(contentDoc?.data?.blogPage || {}),
        ...(pageDoc?.content?.blogPage || pageDoc?.content || {})
      }
    }
  };

  // Serialize MongoDB documents
  const safePosts = JSON.parse(JSON.stringify(posts || []));
  const safeCategories = JSON.parse(JSON.stringify(categories || []));

  return (
    <TemplateWrapper
      templateName="blog"
      pageData={{
        ...pageData,
        posts: safePosts,
        categories: safeCategories
      }}
      globalData={contentDoc?.data || {}}
    />
  );
}
