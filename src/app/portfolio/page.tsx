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
import { absoluteUrl, normalizeCanonicalUrl, stripHtml, truncate } from '@/lib/blog-public';
import { getPublicPortfolioCards } from '@/lib/portfolio-public';

// The ONE portfolio index route. Mirrors src/app/blogs/page.tsx's dual-source pattern: the Page
// document (template "portfolio") holds the hub chrome, the Portfolio collection holds the items.
export const revalidate = 60;

const PORTFOLIO_PAGE_SLUGS = ['portfolio', '/portfolio'];

const loadPortfolioPageDoc = cache(async (): Promise<any | null> => {
  await connectToDatabase();
  const doc = (await Page.findOne({ slug: { $in: PORTFOLIO_PAGE_SLUGS }, isTrashed: { $ne: true } }).lean()) as any;
  if (!doc) return null;
  if (doc.status && doc.status !== 'published') {
    const session = await getAuthSession();
    if (!session) notFound();
  }
  return doc;
});

export async function generateMetadata(): Promise<Metadata> {
  const [pageDoc, contentData] = await Promise.all([loadPortfolioPageDoc(), getCachedSiteContent()]);

  const isGlobalNoIndex = !!contentData?.settings?.globalNoIndex;
  const pageContent = pageDoc?.content?.portfolioPage || pageDoc?.content || {};
  const seo = pageDoc?.seo || pageContent?.seo || {};
  const pageUrl = `${BASE_URL}/portfolio/`;
  const canonical = normalizeCanonicalUrl(seo.canonicalUrl, pageUrl);

  const heroText = truncate(stripHtml(pageContent?.hero?.description), 160);
  const metaTitle = seo.metaTitle || 'Portfolio & Case Studies | Mohsin Designs';
  const metaDescription = seo.metaDescription || heroText || 'Real projects, the problems they solved, and the results they delivered.';
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

export default async function PortfolioIndexPage() {
  const [pageDoc, globalData, items] = await Promise.all([
    loadPortfolioPageDoc(),
    getCachedSiteContent(),
    getPublicPortfolioCards(),
  ]);

  const safePage = JSON.parse(JSON.stringify(pageDoc || {}));

  const pageData = {
    ...safePage,
    content: {
      ...(safePage.content || {}),
      portfolioPage: {
        ...(globalData?.portfolioPage || {}),
        ...(safePage.content?.portfolioPage || safePage.content || {}),
      },
    },
    items,
  };

  const schemaBlocks = pageDoc ? getResolvedSchemaBlocks({ page: { ...safePage, template: 'portfolio' }, globalData: globalData || {}, slug: 'portfolio' }) : [];

  return (
    <>
      <CustomSchemaMarkup schema={schemaBlocks} />
      <TemplateWrapper templateName="portfolio" pageData={pageData} globalData={globalData || {}} />
    </>
  );
}
