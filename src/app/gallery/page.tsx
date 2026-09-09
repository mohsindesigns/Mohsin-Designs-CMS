import Page from "@/models/Page";
export const revalidate = 60; // Cache for 1 minute
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";


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
  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;

  const page = pageDoc ? JSON.parse(JSON.stringify(pageDoc)) : null;
  const pageContent = page?.content || {};
  
  // Resolve gallery Page data
  const galleryData = pageContent.galleryPage || globalData.galleryPage || globalData.portfolio || {};
  const seo = page?.seo || galleryData?.seo || {};
  const pageUrl = `${BASE_URL}/gallery`;

  const heroTitle = (galleryData?.hero?.titlePrefix ? [galleryData.hero.titlePrefix, galleryData.hero.titleHighlight].filter(Boolean).join(" ") : null) ||
                    galleryData?.header?.title || 
                    [galleryData?.header?.titlePrefix, galleryData?.header?.titleHighlight, galleryData?.header?.titleSuffix].filter(Boolean).join(" ");

  const metaTitle = seo.metaTitle || heroTitle || "Creative Work. Real Results. | Our Portfolio";

  const metaDescription = seo.metaDescription || galleryData?.hero?.subtitle || galleryData?.header?.description?.replace(/<[^>]*>/g, '') || "";

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
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
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
                (galleryData?.hero?.titlePrefix ? [galleryData.hero.titlePrefix, galleryData.hero.titleHighlight].filter(Boolean).join(" ") : null) ||
                galleryData?.header?.title || 
                [galleryData?.header?.titlePrefix, galleryData?.header?.titleHighlight, galleryData?.header?.titleSuffix].filter(Boolean).join(" ") || 
                "Our Portfolio";

  const description = page?.seo?.metaDescription || 
                      galleryData?.hero?.subtitle ||
                      galleryData?.header?.description?.replace(/<[^>]*>/g, '') || 
                      portfolioData?.section?.description || 
                      "";

  const customSchema = page?.seo?.schemaData || page?.content?.schemaMarkup || galleryData?.seo?.schemaData || galleryData?.schemaMarkup;

  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <>
      <CustomSchemaMarkup schema={customSchema} />
      <TemplateWrapper
        templateName="gallery"
        pageData={{
          ...(page || { title: "Project Gallery", template: "gallery", slug: "gallery" }),
          content: {
            ...globalData,
            ...(page?.content || {}),
            globalServices: globalData?.services?.services || []
          }
        }}
        params={Promise.resolve({ slug: ["gallery"] })}
      />
    </>
  );
}

