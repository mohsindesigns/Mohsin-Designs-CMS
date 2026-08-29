export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import HomeTemplate from "@/components/templates/HomeTemplate";
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import Page from "@/models/Page";
import Script from "next/script";
import { generateSchema } from "@/lib/schema-generator";
import { TemplateWrapper } from "@/components/templates/TemplateRegistry";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const settings = content?.data?.settings;
  const homepageId = settings?.homepageId;
  const isGlobalNoIndex = !!settings?.globalNoIndex;

  const pageUrl = BASE_URL;

  let metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      url: pageUrl,
      siteName: "Mohsin Designs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@MohsinDesigns",
      creator: "@MohsinDesigns",
    }
  };

  if (homepageId) {
    // Check if it's a page
    const page = await Page.findById(homepageId).lean();
    if (page) {
      const seo = page.seo || {};
      return {
        ...metadata,
        title: { absolute: seo.metaTitle || page.title },
        description: seo.metaDescription,
        openGraph: {
          ...metadata.openGraph,
          title: seo.ogTitle || seo.metaTitle || page.title,
          description: seo.ogDescription || seo.metaDescription,
          images: seo.featuredImage ? [{ url: seo.featuredImage }] : [],
        },
        twitter: {
          ...metadata.twitter,
          title: seo.twitterTitle || seo.ogTitle || seo.metaTitle || page.title,
          description: seo.twitterDescription || seo.ogDescription || seo.metaDescription,
          images: [seo.featuredImage || seo.twitterImage || seo.ogImage].filter(Boolean) as string[],
        },
        robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
      };
    }
    // Check if it's a service
    const service = content?.data?.services?.services?.find((s: any) => s._id === homepageId || s.slug === homepageId);
    if (service) {
      const seo = service.seo || {};
      return {
        ...metadata,
        title: { absolute: seo.metaTitle || service.title },
        description: seo.metaDescription || service.description,
        openGraph: {
          ...metadata.openGraph,
          title: seo.ogTitle || seo.metaTitle || service.title,
          description: seo.ogDescription || seo.metaDescription || service.description,
          images: seo.featuredImage ? [{ url: seo.featuredImage }] : [],
        },
        twitter: {
          ...metadata.twitter,
          title: seo.twitterTitle || seo.ogTitle || seo.metaTitle || service.title,
          description: seo.twitterDescription || seo.ogDescription || seo.metaDescription || service.description,
          images: [seo.featuredImage || seo.twitterImage || seo.ogImage].filter(Boolean) as string[],
        },
        robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
      };
    }
  }

  // Default to Home data
  const homeData = content?.data?.home;
  const seo = homeData?.seo || {};
  return {
    ...metadata,
    title: {
      absolute: seo.metaTitle || homeData?.hero?.headline || settings?.siteTitle
    },
    description: seo.metaDescription || homeData?.hero?.subheadline,
    openGraph: {
      ...metadata.openGraph,
      title: seo.ogTitle || seo.metaTitle || homeData?.hero?.headline || settings?.siteTitle,
      description: seo.ogDescription || seo.metaDescription || homeData?.hero?.subheadline,
      images: [seo.featuredImage || `${BASE_URL}/portfolio_hero_bg.png`].filter(Boolean) as string[],
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
  };
}

export default async function Index() {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const settings = content?.data?.settings;
  const homepageId = settings?.homepageId;

  // Detect FAQs for Homepage (Global + specific to home)
  const allFaqs = content?.data?.faq?.items || [];
  const faqs = allFaqs.filter((item: any) => 
    item.visibility === 'global' || 
    (item.visibility === 'specific' && item.targetPages?.includes('home'))
  );

  // Find published blog posts to provide to ContentProvider
  const Post = (await import("@/models/Post")).default;
  const postsDoc = await Post.find({ status: 'published' }).sort({ publishedAt: -1 }).limit(10).lean();
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
      const schema = generateSchema({
        title: page.seo?.metaTitle || page.title,
        description: page.seo?.metaDescription || "",
        slug: "/",
        type: "WebPage",
        faqs: faqs,
        image: `${BASE_URL}/portfolio_hero_bg.png`
      });
      return (
        <>
          <Script id="json-ld-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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
      const schema = generateSchema({
        title: service.seo?.metaTitle || service.title,
        description: service.seo?.metaDescription || service.description || "",
        slug: "/",
        type: "Service",
        faqs: faqs,
        image: `${BASE_URL}/portfolio_hero_bg.png`
      });
      return (
        <>
          <Script id="json-ld-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
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

  const schema = generateSchema({
    title: homePage?.seo?.metaTitle || homePage?.title || settings?.siteTitle || "Mohsin Designs",
    description: homePage?.seo?.metaDescription || "",
    slug: "/",
    type: "WebPage",
    faqs: faqs,
    image: `${BASE_URL}/logo.png`
  });

  return (
    <>
      <Script
        id="json-ld-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
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
