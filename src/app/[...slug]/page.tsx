import { notFound, permanentRedirect } from 'next/navigation';
import { cookies } from 'next/headers';

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
import { getResolvedSchemaBlocks } from '@/lib/dynamicSchema';
import { validateLocationHierarchy } from '@/lib/locationHierarchy';

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
  const slugSegments = resolvedParams.slug || [];
  const slug = slugSegments.join('/');

  // If 3 segments (likely country/state/city), perform strict hierarchy validation
  if (slugSegments.length === 3) {
    const check = await validateLocationHierarchy(slugSegments);
    if (!check.valid) return {};
  } else if (slugSegments.length === 2) {
    const check = await validateLocationHierarchy(slugSegments);
    if (!check.valid) {
      // Check if it's an invalid location page
      const pageCheck = await getCachedPage(slug);
      if (pageCheck?.template === 'state' || pageCheck?.template === 'city') return {};
    }
  } else if (slugSegments.length === 1) {
    const pageCheck = await getCachedPage(slug);
    if (pageCheck?.template === 'state' || pageCheck?.template === 'city') return {};
  }

  let [page, globalData] = await Promise.all([
    getCachedPage(slug),
    getCachedSiteContent()
  ]);

  if (!page) {
    try {
      const cookieStore = await cookies();
      if (cookieStore.get('mohsin_admin_session')?.value) {
        await connectToDatabase();
        page = await Page.findOne({ slug, isTrashed: { $ne: true } }).lean();
      }
    } catch {}
  }

  if (!page) return {};

  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;
  const seo = page.seo || {};
  const pageUrl = `${BASE_URL}/${slug}/`;
  const canonicalUrl = seo.canonicalUrl
    ? (seo.canonicalUrl.endsWith('/') ? seo.canonicalUrl : `${seo.canonicalUrl}/`)
    : pageUrl;

  return {
    title: {
      absolute: seo.metaTitle || page.title
    },
    description: seo.metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || page.title,
      description: seo.ogDescription || seo.metaDescription,
      url: canonicalUrl,
      siteName:"Mohsin Designs",
      type:"website",
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
      card:"summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.metaTitle || page.title,
      description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
      images: [getAbsoluteUrl(seo.featuredImage || seo.twitterImage || seo.ogImage) || `${BASE_URL}/logo.png`],
      site:"@MohsinDesigns",
      creator:"@MohsinDesigns",
    },
  };
}

export default async function DynamicPage({ params }: PageProps) {
  const resolvedParams = await params;
  const slugSegments = resolvedParams.slug || [];
  const slug = slugSegments.join('/');

  // Strict location hierarchy validation:
  // - 3 segments: must be a valid published city under that exact country and state
  // - 2 segments: if template is state, must belong to that country
  if (slugSegments.length === 3) {
    const check = await validateLocationHierarchy(slugSegments);
    if (!check.valid) {
      notFound();
    }
  } else if (slugSegments.length === 2) {
    const check = await validateLocationHierarchy(slugSegments);
    if (!check.valid) {
      // If it's a state or city template but failed hierarchy, return 404
      const locCheck = await getCachedPage(slug);
      if (locCheck?.template === 'state' || locCheck?.template === 'city') {
        notFound();
      }
    }
  }

  let [pageDoc, globalDataRaw] = await Promise.all([
    getCachedPage(slug),
    getCachedSiteContent()
  ]);

  if (!pageDoc) {
    try {
      const cookieStore = await cookies();
      if (cookieStore.get('mohsin_admin_session')?.value) {
        await connectToDatabase();
        pageDoc = await Page.findOne({ slug, isTrashed: { $ne: true } }).lean();
      }
    } catch {}
  }

  if (!pageDoc) {
    notFound();
  }

  // City and State pages must not be accessed at 1 segment (e.g. /dallas/ or /texas/); they must use canonical hierarchy
  if (slugSegments.length === 1 && (pageDoc.template === 'city' || pageDoc.template === 'state')) {
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

  // Resolve dynamic schema: supports variable tokens and custom schema
  const resolvedSchemaBlocks = getResolvedSchemaBlocks({
    page,
    globalData,
    slug
  });

  // Use TemplateWrapper to handle local content context overrides
  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <main>
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
        params={resolvedParams}
      />
    </main>
  );
}


