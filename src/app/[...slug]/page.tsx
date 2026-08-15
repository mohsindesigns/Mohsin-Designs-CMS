import { notFound, permanentRedirect } from 'next/navigation';

export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import connectToDatabase from '@/lib/mongodb';
import Page from '@/models/Page';
import SiteContent from '@/models/Content';
import { getTemplate } from '@/components/templates/TemplateRegistry';
import { Metadata } from 'next';
import Script from 'next/script';
import { generateSchema } from '@/lib/schema-generator';
import { BASE_URL } from '@/lib/constants';

interface PageProps {
  params: Promise<{ slug: string[] }>;
}


function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Auto-schema logic moved to centralized generator

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  await connectToDatabase();
  const page = await Page.findOne({ slug, status: 'published' }).lean();

  if (!page) return {};

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
    robots: {
      index: seo.metaRobotsIndex !== 'noindex',
      follow: seo.metaRobotsFollow !== 'nofollow',
      ...(seo.metaRobotsIndex !== 'noindex' && {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || page.title,
      description: seo.ogDescription || seo.metaDescription,
      url: pageUrl,
      siteName: "Eagle Revolution",
      type: "website",
      images: [
        {
          url: getAbsoluteUrl(seo.featuredImage || seo.ogImage) || `${BASE_URL}/eagle-logo.png`,
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
      images: [getAbsoluteUrl(seo.featuredImage || seo.twitterImage || seo.ogImage) || `${BASE_URL}/eagle-logo.png`],
      site: "@EagleRevolution",
      creator: "@EagleRevolution",
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  await connectToDatabase();

  // Find the page in MongoDB
  const pageDoc = await Page.findOne({
    slug: slug,
    status: 'published'
  }).lean();

  if (!pageDoc) {
    notFound();
  }

  // Convert to plain object to avoid Mongoose serialization issues in Client Components
  const page = JSON.parse(JSON.stringify(pageDoc));

  // Fetch global content for FAQ detection and settings
  const globalContent = await SiteContent.findOne({ key: 'complete_data' }).lean() as any;
  const globalData = globalContent?.data || {};
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

  // Determine page type for schema
  let pageType: any = "WebPage";
  if (page.template === 'about') pageType = "AboutPage";
  if (page.template === 'contact') pageType = "ContactPage";
  if (page.template === 'gallery') pageType = "CollectionPage";

  // Determine featured image for schema (Manual SEO Featured Image > OG Image > Hero Image)
  const featuredImage = getAbsoluteUrl(page.seo?.featuredImage || page.seo?.ogImage || page.seo?.twitterImage || page.content?.hero?.image);

  const schema = generateSchema({
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription || "",
    slug: page.slug,
    type: pageType,
    faqs: page.faqs,
    breadcrumbTitle: page.seo?.breadcrumbTitle,
    image: featuredImage
  });

  // Use TemplateWrapper to handle local content context overrides
  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <main>
      <Script
        id="json-ld-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <TemplateWrapper
        templateName={page.template}
        pageData={{
          ...page,
          content: {
            ...globalData,
            ...(page.content || {})
          }
        }}
        params={resolvedParams}
      />
    </main>
  );
}

