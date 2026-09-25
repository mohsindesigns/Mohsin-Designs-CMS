import { cache } from "react";
import Page from "@/models/Page";
export const revalidate = 60; // Cache for 1 minute
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";
import { getCachedSiteContent } from "@/lib/content";
import { getResolvedSchemaBlocks } from "@/lib/dynamicSchema";

/**
 * /gallery/ and the CMS Page that uses the Portfolio ("gallery") template used to render the same template from
 * DIFFERENT data (this route only looked up a Page with slug "gallery" and otherwise fell back to global site
 * content, while the live Page - slug "portfolio" - was served by [...slug]). The Footer/Navbar/blog CTAs link to
 * /gallery while the home page links to /portfolio, so visitors saw two different portfolios.
 *
 * Now /gallery/ resolves the page like this, so it always shows exactly what the admin edits under Pages:
 *   1. published Page with slug "gallery"                          (creating one with that slug works)
 *   2. otherwise the oldest published Page using the gallery template (e.g. "portfolio")
 *   3. otherwise the legacy global `galleryPage` content / built-in defaults.
 * In case 2 the canonical URL points at that page's own address so the two URLs are not duplicate content.
 */
const getGalleryPageDoc = cache(async () => {
  try {
    await connectToDatabase();
    const published = { status: "published", isTrashed: { $ne: true } };

    const exact = await Page.findOne({ ...published, slug: "gallery" }).lean();
    if (exact) return { doc: exact as any, exact: true };

    const other = await Page.findOne({ ...published, template: "gallery" }).sort({ createdAt: 1 }).lean();
    return { doc: (other as any) || null, exact: false };
  } catch (error) {
    console.error("Error resolving gallery page:", error);
    return { doc: null as any, exact: false };
  }
});

const stripTags = (html: any) => (typeof html === "string" ? html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim() : "");

const absoluteUrl = (path: string | undefined) => {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

export async function generateMetadata(): Promise<Metadata> {
  const [{ doc, exact }, globalData] = await Promise.all([getGalleryPageDoc(), getCachedSiteContent()]);
  const isGlobalNoIndex = !!globalData?.settings?.globalNoIndex;

  const page = doc ? JSON.parse(JSON.stringify(doc)) : null;
  const seo = page?.seo || {};

  // Legacy global galleryPage content is only used when there is no Page document at all.
  const galleryData = page?.content?.galleryPage || (page ? {} : globalData?.galleryPage) || {};

  // Address of the page being shown: /gallery/ itself, or the real page's URL when /gallery/ is serving another slug.
  const ownUrl = `${BASE_URL}/${page && !exact ? page.slug : "gallery"}/`;
  const canonicalUrl = seo.canonicalUrl ? (seo.canonicalUrl.endsWith("/") ? seo.canonicalUrl : `${seo.canonicalUrl}/`) : ownUrl;

  const heroTitle =
    (galleryData?.hero?.titlePrefix
      ? [galleryData.hero.titlePrefix, galleryData.hero.titleHighlight].filter(Boolean).join(" ")
      : null) ||
    galleryData?.header?.title ||
    [galleryData?.header?.titlePrefix, galleryData?.header?.titleHighlight, galleryData?.header?.titleSuffix].filter(Boolean).join(" ");

  // Same precedence as the [...slug] route (seo.metaTitle, then the page title) so /gallery/ and /portfolio/ agree.
  const metaTitle = seo.metaTitle || page?.title || heroTitle || "Creative Work. Real Results. | Our Portfolio";
  const metaDescription =
    seo.metaDescription || stripTags(galleryData?.hero?.subtitle) || stripTags(galleryData?.header?.description) || "";

  const image = absoluteUrl(seo.featuredImage || seo.ogImage) || `${BASE_URL}/logo.png`;

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
      images: [{ url: image, width: 1200, height: 630, alt: page?.title || metaTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || metaTitle,
      description: seo.twitterDescription || seo.ogDescription || metaDescription,
      images: [absoluteUrl(seo.featuredImage || seo.twitterImage || seo.ogImage) || `${BASE_URL}/logo.png`],
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
  };
}

export default async function GalleryPage() {
  const [{ doc }, globalDataRaw] = await Promise.all([getGalleryPageDoc(), getCachedSiteContent()]);
  const globalData = globalDataRaw || {};

  const page = doc ? JSON.parse(JSON.stringify(doc)) : null;
  const globalServices = globalData?.services?.services || globalData?.globalServices || [];

  // Same shape [...slug] hands the template for /portfolio/: page content only. The global site content is NOT spread into
  // it (that leaked e.g. global FAQs / video testimonials into /gallery/ that /portfolio/ never showed); the template reads
  // the Admin > Projects catalog from the shared ContentProvider, which TemplateWrapper builds from `globalData` below.
  const pageData = page
    ? {
        ...page,
        content: {
          ...(page.content || {}),
          globalServices
        }
      }
    : {
        title: "Project Gallery",
        template: "gallery",
        slug: "gallery",
        content: {
          // Legacy: portfolio settings that used to live in global content when no Page document existed.
          ...(globalData?.galleryPage ? { galleryPage: globalData.galleryPage } : {}),
          globalServices
        }
      };

  const schema = page
    ? getResolvedSchemaBlocks({ page, globalData, slug: page.slug })
    : globalData?.galleryPage?.seo?.schemaData || globalData?.galleryPage?.schemaMarkup;

  const { TemplateWrapper } = await import('@/components/templates/TemplateRegistry');

  return (
    <>
      <CustomSchemaMarkup schema={schema} />
      <TemplateWrapper
        templateName="gallery"
        pageData={pageData}
        globalData={globalData}
        params={Promise.resolve({ slug: [page?.slug || "gallery"] })}
      />
    </>
  );
}
