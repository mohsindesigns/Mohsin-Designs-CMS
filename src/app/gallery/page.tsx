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
  
  // Try to find the page in MongoDB Page collection first
  const pageDoc = await Page.findOne({
    slug: "gallery",
    status: 'published',
    isTrashed: { $ne: true }
  }).lean() as any;

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const pageContent = page?.content || {};
  
  // Resolve gallery Page data
  const galleryData = pageContent.galleryPage || globalData.galleryPage || globalData.portfolio || {};
  const seo = page?.seo || galleryData?.seo || {};
  const pageUrl = `${BASE_URL}/gallery`;

  const metaTitle = seo.metaTitle || 
                    galleryData?.header?.title || 
                    [galleryData?.header?.titlePrefix, galleryData?.header?.titleHighlight, galleryData?.header?.titleSuffix].filter(Boolean).join(" ") || 
                    "Project Gallery";

  const metaDescription = seo.metaDescription || galleryData?.header?.description?.replace(/<[^>]*>/g, '') || "";

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
      siteName: "Eagle Revolution",
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

export default async function GalleryPage() {
  await connectToDatabase();

  // Find the page in MongoDB Page collection
  const pageDoc = await Page.findOne({
    slug: "gallery",
    status: 'published',
    isTrashed: { $ne: true }
  }).lean();

  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const globalData = content?.data || {};

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;

  // Determine metadata values for schema
  const galleryData = page?.content?.galleryPage || globalData?.galleryPage || {};
  const portfolioData = page?.content?.portfolio || globalData?.portfolio || {};

  const title = page?.seo?.metaTitle || 
                galleryData?.header?.title || 
                [galleryData?.header?.titlePrefix, galleryData?.header?.titleHighlight, galleryData?.header?.titleSuffix].filter(Boolean).join(" ") || 
                "Project Gallery";

  const description = page?.seo?.metaDescription || 
                      galleryData?.header?.description?.replace(/<[^>]*>/g, '') || 
                      portfolioData?.section?.description || 
                      "";

  const schema = generateSchema({
    title,
    description,
    slug: "/gallery",
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
        templateName="gallery"
        pageData={{
          ...(page || { title: "Project Gallery", template: "gallery", slug: "gallery" }),
          content: {
            ...globalData,
            ...(page?.content || {})
          }
        }}
        params={Promise.resolve({ slug: ["gallery"] })}
      />
    </>
  );
}

