import Page from "@/models/Page";
export const revalidate = 60; // Cache for 1 minute
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";
import { getResolvedSchemaBlocks } from "@/lib/dynamicSchema";

// This one implementation serves BOTH /locations/ (this file) and /location/
// (src/app/location/page.tsx re-exports it). Both URLs render the same hub and both
// declare /locations/ as canonical, so search engines only index one of them.

/**
 * Find the hub's Page document. Two slugs are accepted ("locations" and the older
 * "location"); when BOTH documents exist, "locations" wins deterministically. (A bare
 * `findOne({ slug: { $in: [...] } })` returned whichever document happened to be stored
 * first, so the admin could edit one page while the site showed the other.)
 */
async function findHubPage(): Promise<any | null> {
  const docs = (await Page.find({
    slug: { $in: ["locations", "location"] },
    status: "published",
    isTrashed: { $ne: true },
  }).lean()) as any[];
  return docs.find((d) => d.slug === "locations") || docs[0] || null;
}

// Rich-text hero descriptions are HTML ("<p>...</p>"); a meta description must be plain text.
const toPlainText = (v: unknown): string =>
  typeof v === "string" ? v.replace(/<[^>]*>/g, " ").replace(/&nbsp;/gi, " ").replace(/\s+/g, " ").trim() : "";

const absUrl = (path: string | undefined) =>
  !path ? undefined : /^https?:\/\//i.test(path) ? path : `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();

  // Try to find the page in MongoDB Page collection first (slug: "locations" or "location")
  const pageDoc = await findHubPage();

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};
  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const pageContent = page?.content || {};

  const locationData = pageContent.locationPage || globalData.locationPage || {};
  const seo = page?.seo || locationData?.seo || {};
  const pageUrl = `${BASE_URL}/locations/`;
  const canonicalUrl = seo.canonicalUrl
    ? (seo.canonicalUrl.endsWith("/") ? seo.canonicalUrl : `${seo.canonicalUrl}/`)
    : pageUrl;

  const metaTitle = seo.metaTitle ||
                    (locationData?.hero?.titleIntro && locationData?.hero?.titleHighlight ? `${String(locationData.hero.titleIntro).trim()} ${locationData.hero.titleHighlight}` : null) ||
"Global Service Locations & Regional Hubs | Mohsin Designs";

  const metaDescription = seo.metaDescription || toPlainText(locationData?.hero?.description) || "Browse our localized service hubs and discover how we engineer high-converting digital assets across premier global markets.";

  // Same image precedence as the catch-all page route: featuredImage, then the dedicated OG / Twitter fields.
  const ogImage = absUrl(seo.featuredImage || seo.ogImage);
  const twitterImage = absUrl(seo.featuredImage || seo.twitterImage || seo.ogImage);

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      absolute: metaTitle
    },
    description: metaDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url: canonicalUrl,
      siteName: "Mohsin Designs",
      type: "website",
      images: ogImage ? [{ url: ogImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: [twitterImage].filter(Boolean) as string[],
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
  };
}

export default async function LocationsPage() {
  await connectToDatabase();

  // Find the page in MongoDB Page collection
  const pageDoc = await findHubPage();

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const locationData = page?.content?.locationPage || globalData?.locationPage || {};

  const title = page?.seo?.metaTitle ||
                (locationData?.hero?.titleIntro && locationData?.hero?.titleHighlight ? `${String(locationData.hero.titleIntro).trim()} ${locationData.hero.titleHighlight}` : null) ||
"Our Global Locations";

  const description = page?.seo?.metaDescription ||
                      toPlainText(locationData?.hero?.description) ||
"Explore our international locations and regional service areas.";

  const effectivePage = page || {
    title: title || "Our Global Locations",
    template: "location",
    slug: "locations",
    seo: { metaTitle: title, metaDescription: description },
    content: {
      locationPage: locationData,
      schemaMarkup: page?.content?.schemaMarkup || locationData?.schemaMarkup
    }
  };

  const resolvedSchemaBlocks = getResolvedSchemaBlocks({
    page: effectivePage,
    globalData,
    slug: "locations"
  });

  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <>
      <CustomSchemaMarkup schema={resolvedSchemaBlocks} />
      <TemplateWrapper
        templateName="location"
        globalData={globalData}
        pageData={{
          // "Locations" (not "Locations Hub") is what the breadcrumb shows when no page document exists yet.
          ...(page || { title: "Locations", template: "location", slug: "locations" }),
          // The hub gets ONLY its own page content. It used to be `{ ...globalData, ...page.content }`,
          // which leaked the homepage's global sections (videoTestimonials, faqs, serviceArea, hero ...)
          // into this page whenever the hub document did not define the same key itself.
          // The one legacy global the hub honours (SiteContent.locationPage) is passed explicitly.
          content: {
            ...(page?.content || {}),
            ...(page?.content?.locationPage || !globalData?.locationPage ? {} : { locationPage: globalData.locationPage }),
            globalServices: globalData?.services?.services || []
          }
        }}
        params={Promise.resolve({ slug: ["locations"] })}
      />
    </>
  );
}
