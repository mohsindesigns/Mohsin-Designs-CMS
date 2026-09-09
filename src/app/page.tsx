export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import HomeTemplate from "@/components/templates/HomeTemplate";
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import Page from "@/models/Page";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { TemplateWrapper } from "@/components/templates/TemplateRegistry";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";
import { getCachedSiteContent } from "@/lib/content";

function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function generateMetadata(): Promise<Metadata> {
  const globalData = await getCachedSiteContent();
  const settings = globalData?.settings;
  const homepageId = settings?.homepageId;
  const isGlobalNoIndex = !!settings?.globalNoIndex;

  const pageUrl = BASE_URL;

  let targetSeo: any = {};
  let fallbackTitle = settings?.siteTitle || "Mohsin Designs";
  let fallbackDesc = "High-performance web architecture, modern software engineering, and digital growth systems.";

  if (homepageId) {
    // 1. Check if assigned homepage is a Page
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(homepageId);
    if (isObjectId) {
      const page = await Page.findOne({
        _id: homepageId,
        status: 'published',
        isTrashed: { $ne: true }
      }).lean() as any;

      if (page) {
        targetSeo = page.seo || {};
        fallbackTitle = page.title || fallbackTitle;
        fallbackDesc = page.seo?.metaDescription || fallbackDesc;
      }
    }

    // 2. Check if assigned homepage is a Service
    if (!targetSeo.metaTitle) {
      const service = globalData?.services?.services?.find((s: any) =>
        (s._id === homepageId || s.slug === homepageId) && s.status !== 'draft' && !s.isTrashed
      );
      if (service) {
        targetSeo = service.seo || {};
        fallbackTitle = service.title || fallbackTitle;
        fallbackDesc = service.description || fallbackDesc;
      }
    }
  }

  // 3. If no homepageId or not found, check the default Home Page in Page collection
  if (!targetSeo.metaTitle) {
    const defaultHomePageDoc = await Page.findOne({
      $or: [{ slug: 'home' }, { template: 'home' }],
      status: 'published',
      isTrashed: { $ne: true }
    }).lean() as any;

    if (defaultHomePageDoc?.seo) {
      targetSeo = defaultHomePageDoc.seo;
      fallbackTitle = defaultHomePageDoc.title || fallbackTitle;
      fallbackDesc = defaultHomePageDoc.seo.metaDescription || fallbackDesc;
    }
  }

  // 4. Fallback to globalData.home if still not set
  if (!targetSeo.metaTitle && globalData?.home) {
    const homeData = globalData.home;
    targetSeo = homeData.seo || {};
    fallbackTitle = homeData.hero?.headline || fallbackTitle;
    fallbackDesc = homeData.hero?.subheadline || fallbackDesc;
  }

  const finalTitle = targetSeo.metaTitle || fallbackTitle;
  const finalDesc = targetSeo.metaDescription || fallbackDesc;
  const rawImage = targetSeo.featuredImage || targetSeo.ogImage || targetSeo.twitterImage;
  const finalImage = getAbsoluteUrl(rawImage) || `${BASE_URL}/portfolio_hero_bg.png`;

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      absolute: finalTitle
    },
    description: finalDesc,
    alternates: {
      canonical: targetSeo.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: targetSeo.ogTitle || finalTitle,
      description: targetSeo.ogDescription || finalDesc,
      url: pageUrl,
      siteName: settings?.siteTitle || "Mohsin Designs",
      type: "website",
      images: [
        {
          url: finalImage,
          width: 1200,
          height: 630,
          alt: finalTitle,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: targetSeo.twitterTitle || targetSeo.ogTitle || finalTitle,
      description: targetSeo.twitterDescription || targetSeo.ogDescription || finalDesc,
      images: [finalImage],
      site: "@MohsinDesigns",
      creator: "@MohsinDesigns",
    },
    robots: resolveRobotsMetadata(targetSeo, isGlobalNoIndex)
  };
}

export default async function Index() {
  const content = { data: await getCachedSiteContent() };
  const settings = content?.data?.settings;
  const homepageId = settings?.homepageId;

  // Detect FAQs for Homepage (Global + specific to home)
  const allFaqs = content?.data?.faq?.items || [];
  const faqs = allFaqs.filter((item: any) => 
    item.visibility === 'global' || 
    (item.visibility === 'specific' && item.targetPages?.includes('home'))
  );

  // Find published blog posts to provide to ContentProvider (project lean fields)
  const Post = (await import("@/models/Post")).default;
  const postsDoc = await Post.find({ status: 'published' })
    .select('_id title slug excerpt featuredImage publishedAt date categories')
    .sort({ publishedAt: -1 })
    .limit(10)
    .lean();
  const initialBlogs = postsDoc ? JSON.parse(JSON.stringify(postsDoc)) : [];

  if (homepageId) {
    // Check if it's a page
    // Check if it's a page and ensure it's published and not trashed
    const pageDoc = await Page.findOne({ 
      _id: homepageId, 
      status: 'published', 
      isTrashed: { $ne: true } 
    }).lean();
    if (pageDoc) {
      const page = JSON.parse(JSON.stringify(pageDoc));
      const customSchema = page?.seo?.schemaData || page?.content?.schemaMarkup || page?.content?.customSchema || page?.content?.faqSchemaMarkup;
      return (
        <>
          <CustomSchemaMarkup schema={customSchema} />
          <TemplateWrapper 
            templateName={page.template} 
            pageData={{
              ...page,
              content: {
                ...(page.content || {}),
                globalServices: content?.data?.services?.services || []
              }
            }} 
            globalData={content?.data || {}}
            initialBlogs={initialBlogs}
            params={Promise.resolve({ slug: ['/'] })} 
          />
        </>
      );
    }

    // Check if it's a service
    // Check if it's a service and ensure it's not a draft
    const serviceDoc = content?.data?.services?.services?.find((s: any) => 
      (s._id === homepageId || s.slug === homepageId) && s.status !== 'draft'
    );
    if (serviceDoc) {
      const service = JSON.parse(JSON.stringify(serviceDoc));
      const customSchema = service?.seo?.schemaData || service?.schemaMarkup || service?.customSchema;
      return (
        <>
          <CustomSchemaMarkup schema={customSchema} />
          <ServiceDetailTemplate params={Promise.resolve({ slug: service.slug })} />
        </>
      );
    }
  }

  // Find published Home Page in MongoDB
  const defaultHomePageDoc = await Page.findOne({
    $or: [{ slug: 'home' }, { template: 'home' }],
    status: 'published',
    isTrashed: { $ne: true }
  }).lean();

  const homePage = defaultHomePageDoc ? JSON.parse(JSON.stringify(defaultHomePageDoc)) : null;
  const homeCustomSchema = homePage?.seo?.schemaData || 
                           homePage?.content?.schemaMarkup || 
                           homePage?.content?.customSchema || 
                           content?.data?.home?.seo?.schemaData || 
                           content?.data?.home?.schemaMarkup;

  return (
    <>
      <CustomSchemaMarkup schema={homeCustomSchema} />
      <TemplateWrapper 
        templateName="home"
        pageData={homePage || {
          content: {
            ...(content?.data?.home || {}),
            globalServices: content?.data?.services?.services || []
          }
        }}
        globalData={content?.data || {}}
        initialBlogs={initialBlogs}
        params={Promise.resolve({ slug: ['/'] })}
      />
    </>
  );
}
