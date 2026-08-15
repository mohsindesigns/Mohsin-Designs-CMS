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

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const settings = content?.data?.settings;
  const homepageId = settings?.homepageId;

  const pageUrl = BASE_URL;

  let metadata: Metadata = {
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      url: pageUrl,
      siteName: "Eagle Revolution",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      site: "@EagleRevolution",
      creator: "@EagleRevolution",
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
      images: [seo.featuredImage || `${BASE_URL}/eagle-logo.png`].filter(Boolean) as string[],
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
        image: `${BASE_URL}/eagle-logo.png`
      });
      return (
        <>
          <Script id="json-ld-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          <TemplateWrapper 
            templateName={page.template} 
            pageData={{
              ...page,
              content: {
                ...(content?.data || {}),
                ...(page.content || {})
              }
            }} 
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
        image: `${BASE_URL}/eagle-logo.png`
      });
      return (
        <>
          <Script id="json-ld-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          <ServiceDetailTemplate params={Promise.resolve({ slug: service.slug })} />
        </>
      );
    }
  }

  // Default Home Template
  const homeData = content?.data?.home;
  const schema = generateSchema({
    title: settings?.siteTitle || "Eagle Revolution",
    description: homeData?.hero?.subheadline || "Veteran-owned roofing & home improvement in St. Louis, MO.",
    slug: "/",
    type: "WebPage",
    faqs: faqs,
    image: `${BASE_URL}/eagle-logo.png`
  });

  return (
    <>
      <Script
        id="json-ld-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <HomeTemplate />
    </>
  );
}
