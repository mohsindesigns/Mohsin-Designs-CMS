import Page from "@/models/Page";
export const revalidate = 60; // Cache for 1 minute
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import Script from "next/script";
import { generateSchema } from "@/lib/schema-generator";
import { BASE_URL } from "@/lib/constants";

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  
  // Try to find the page in MongoDB Page collection first (slug: "locations" or "location")
  const pageDoc = await Page.findOne({
    slug: { $in: ["locations", "location"] },
    status: 'published',
    isTrashed: { $ne: true }
  }).lean() as any;

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const pageContent = page?.content || {};
  
  const locationData = pageContent.locationPage || globalData.locationPage || globalData.serviceArea || {};
  const seo = page?.seo || locationData?.seo || {};
  const pageUrl = `${BASE_URL}/locations`;

  const metaTitle = seo.metaTitle || 
                    (locationData?.hero?.titleIntro && locationData?.hero?.titleHighlight ? `${locationData.hero.titleIntro} ${locationData.hero.titleHighlight}` : null) ||
                    "Global Service Locations & Regional Hubs | Mohsin Designs";

  const metaDescription = seo.metaDescription || locationData?.hero?.description || "Browse our localized service hubs and discover how we engineer high-converting digital assets across premier global markets.";

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      absolute: metaTitle
    },
    description: metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || metaTitle,
      description: seo.ogDescription || metaDescription,
      url: pageUrl,
      siteName: "Mohsin Designs",
      type: "website",
      images: seo.featuredImage ? [{ url: seo.featuredImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: [seo.featuredImage || seo.twitterImage || seo.ogImage].filter(Boolean) as string[],
    },
    robots: {
      index: seo.metaRobotsIndex !== 'noindex',
      follow: seo.metaRobotsFollow !== 'nofollow',
      ...(seo.metaRobotsIndex !== 'noindex' && {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    }
  };
}

export default async function LocationsPage() {
  await connectToDatabase();

  // Find the page in MongoDB Page collection
  const pageDoc = await Page.findOne({
    slug: { $in: ["locations", "location"] },
    status: 'published',
    isTrashed: { $ne: true }
  }).lean();

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const locationData = page?.content?.locationPage || globalData?.locationPage || {};

  const title = page?.seo?.metaTitle || 
                (locationData?.hero?.titleIntro && locationData?.hero?.titleHighlight ? `${locationData.hero.titleIntro} ${locationData.hero.titleHighlight}` : null) ||
                "Our Global Locations";

  const description = page?.seo?.metaDescription || 
                      locationData?.hero?.description || 
                      "Explore our international locations and regional service areas.";

  const schema = generateSchema({
    title,
    description,
    slug: "/locations",
    type: "CollectionPage"
  });

  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <>
      <Script
        id="json-ld-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <TemplateWrapper
        templateName="location"
        pageData={{
          ...(page || { title: "Locations Hub", template: "location", slug: "locations" }),
          content: {
            ...globalData,
            ...(page?.content || {}),
            globalServices: globalData?.services?.services || []
          }
        }}
        params={Promise.resolve({ slug: ["locations"] })}
      />
    </>
  );
}
