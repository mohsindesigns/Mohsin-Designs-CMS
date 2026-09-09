import { notFound, permanentRedirect } from 'next/navigation';

export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import SiteContent from '@/models/Content';
import { getTemplate } from '@/components/templates/TemplateRegistry';
import { Metadata } from 'next';
import CustomSchemaMarkup from '@/components/CustomSchemaMarkup';
import { BASE_URL } from '@/lib/constants';
import { resolveRobotsMetadata } from '@/lib/seo';
import { getCachedPage, getCachedSiteContent } from '@/lib/content';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  const [page, globalData] = await Promise.all([
    getCachedPage(slug),
    getCachedSiteContent()
  ]);

  if (!page) return {};

  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;
  const seo = page.seo || {};
  const pageUrl = `${BASE_URL}/${slug}`;

  return {
    title: {
      absolute: seo.metaTitle || page.title
    },
    description: seo.metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || page.title,
      description: seo.ogDescription || seo.metaDescription,
      url: pageUrl,
      siteName: "Mohsin Designs",
      type: "website",
      images: [
        {
          url: getAbsoluteUrl(seo.featuredImage || seo.ogImage) || `${BASE_URL}/logo.png`,
          width: 1200,
          height: 630,
          alt: page.title,
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

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  const [pageDoc, globalDataRaw] = await Promise.all([
    getCachedPage(slug),
    getCachedSiteContent()
  ]);

  if (!pageDoc) {
    notFound();
  }

  // Convert to plain object to avoid Mongoose serialization issues in Client Components
  const page = JSON.parse(JSON.stringify(pageDoc));

  const globalData = globalDataRaw || {};
  const settings = globalData.settings || {};

  // If this page is set as the homepage, redirect slug to root /
  if (settings.homepageId && String(pageDoc._id) === String(settings.homepageId)) {
    permanentRedirect("/");
  }

  // Helper to validate FAQ items
  const isValidFaq = (items: any) => Array.isArray(items) && items.length > 0 && items.every((i: any) => i.question && i.answer);

  // Detect FAQs ONLY if this is the FAQ template (as requested)
  if (page.template === 'faq') {
    const pageSpecificFaqs = page.content?.faqs || [];
    if (Array.isArray(pageSpecificFaqs) && pageSpecificFaqs.length > 0) {
      page.faqs = pageSpecificFaqs;
    } else {
      const allFaqs = globalData.faq?.items || [];
      page.faqs = allFaqs.filter((item: any) =>
        item.visibility === 'global' ||
        (item.visibility === 'specific' && item.targetPages?.includes(slug))
      );
    }
  }

  // Resolve custom schema configured in Page SEO or Content
  const customSchema = page.seo?.schemaData || page.content?.schemaMarkup || page.content?.customSchema || page.content?.faqSchemaMarkup;

  // Use TemplateWrapper to handle local content context overrides
  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <main>
      <CustomSchemaMarkup schema={customSchema} />
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
        params={resolvedParams}
      />
    </main>
  );
}

