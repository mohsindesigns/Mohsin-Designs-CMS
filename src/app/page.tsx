export const revalidate = 60; // Cache for 1 minute, updated via revalidatePath in admin panel

import HomeTemplate from "@/components/templates/HomeTemplate";
import { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import Page from "@/models/Page";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import { TemplateWrapper } from "@/components/templates/TemplateRegistry";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";
import { getCachedSiteContent } from "@/lib/content";
import { getResolvedSchemaBlocks } from "@/lib/dynamicSchema";
// One definition of "publicly visible post", read time and excerpt for the whole site.
import { PUBLIC_POST_QUERY, promoteDueScheduledPosts, readMinutes, stripHtml, truncate } from "@/lib/blog-public";

function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Keys that are OWNED by global settings / other editors. The Home editor used to copy a whole
// snapshot of `complete_data` into the page document, so older Home docs carry stale copies of
// these. TemplateWrapper spreads `pageData.content` OVER the global data, so a stale copy would
// silently shadow later edits made in Settings / the FAQ manager (e.g. a changed favicon or a new
// global FAQ never showing on the homepage). The PATCH route already refuses to sync
// settings/loader/hours back; drop the rest of the pure copies at render time as well.
const HOME_STALE_GLOBAL_KEYS = ["settings", "loader", "hours", "images", "quickQuote", "aboutPage", "faq", "leadership"];

function cleanHomeContent(content: any) {
  const cleaned = { ...(content || {}) };
  for (const key of HOME_STALE_GLOBAL_KEYS) delete cleaned[key];
  return cleaned;
}

/**
 * Posts for the homepage blog section: the latest published posts PLUS every post the admin
 * picked in the Blog tab (a plain "latest 10" pool silently dropped picks older than the 10
 * newest, so they vanished from the section). Trashed posts are excluded exactly like the /blogs
 * pages do - they used to leak in here and then 404 when clicked.
 * `content` is only used server-side to derive a real reading time and an excerpt (the client
 * payload must stay small); it is not sent to the browser.
 */
async function getHomeBlogPool(selectedRefs: any[]) {
  try {
    await connectToDatabase();
    await promoteDueScheduledPosts();
    const Post = (await import("@/models/Post")).default;
    const published = PUBLIC_POST_QUERY;
    const fields = "_id title slug excerpt featuredImage publishedAt date content seo.metaDescription";

    const ids: string[] = [];
    const slugs: string[] = [];
    for (const ref of Array.isArray(selectedRefs) ? selectedRefs : []) {
      const value = typeof ref === "string" ? ref : String(ref?._id || ref?.id || ref?.slug || "");
      if (!value) continue;
      if (/^[0-9a-fA-F]{24}$/.test(value)) ids.push(value);
      else slugs.push(value);
    }

    const [latest, picked] = await Promise.all([
      Post.find(published).select(fields).sort({ publishedAt: -1 }).limit(10).lean(),
      ids.length || slugs.length
        ? Post.find({ ...published, $or: [{ _id: { $in: ids } }, { slug: { $in: slugs } }] }).select(fields).lean()
        : Promise.resolve([]),
    ]);

    const seen = new Set<string>();
    const merged: any[] = [];
    for (const post of [...(latest as any[]), ...(picked as any[])]) {
      const key = String(post._id);
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(post);
    }
    merged.sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime());

    return merged.map((post: any) => {
      const { content, seo, ...lean } = post;
      const excerpt =
        (typeof post.excerpt === "string" && post.excerpt.trim()) ||
        (typeof seo?.metaDescription === "string" && seo.metaDescription.trim()) ||
        truncate(stripHtml(content), 160);
      // _id must be a plain string: a raw ObjectId cannot be passed from a Server to a Client Component.
      return { ...lean, _id: String(post._id), excerpt, readTime: `${readMinutes(content)} min read` };
    });
  } catch (error) {
    console.error("Error loading homepage blog posts:", error);
    return [];
  }
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
  // Fresh service catalog (site_contents.data.services.services) - see the masterCatalog notes in Services.tsx.
  const globalServices = content?.data?.services?.services || [];

  // A page assigned as homepage in Settings is looked up by _id. homepageId can also be a service
  // slug (handled below); querying Page.findOne({ _id: "some-slug" }) throws a CastError, which
  // used to take the whole homepage down with a 500 whenever a service was chosen as the homepage.
  const isObjectId = typeof homepageId === "string" && /^[0-9a-fA-F]{24}$/.test(homepageId);

  const assignedPageDoc = isObjectId
    ? await Page.findOne({
        _id: homepageId,
        status: 'published',
        isTrashed: { $ne: true }
      }).lean()
    : null;

  if (assignedPageDoc) {
    const page = JSON.parse(JSON.stringify(assignedPageDoc));
    const pageContent = page.template === 'home' ? cleanHomeContent(page.content) : (page.content || {});
    const initialBlogs = await getHomeBlogPool(pageContent?.blogSection?.selectedPosts || pageContent?.blog?.selectedPosts || []);
    // Custom + synced FAQ schema, with {{tokens}} resolved - same helper every other page uses.
    const schemaBlocks = getResolvedSchemaBlocks({ page, globalData: content?.data || {}, slug: '/' });
    return (
      <>
        <CustomSchemaMarkup schema={schemaBlocks} />
        <TemplateWrapper
          templateName={page.template}
          pageData={{
            ...page,
            content: {
              ...pageContent,
              globalServices
            }
          }}
          globalData={content?.data || {}}
          initialBlogs={initialBlogs}
          params={Promise.resolve({ slug: ['/'] })}
        />
      </>
    );
  }

  if (homepageId) {
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
  const homeContent = homePage ? cleanHomeContent(homePage.content) : (content?.data?.home || {});
  const initialBlogs = await getHomeBlogPool(homeContent?.blogSection?.selectedPosts || homeContent?.blog?.selectedPosts || []);

  // Custom schema from the CMS Schema tab + the synced FAQPage schema, {{tokens}} resolved.
  // (The old inline lookup ignored `faqSchemaMarkup` completely, so "Sync FAQs to Schema" on the
  // homepage never produced any structured data on the live page.)
  const schemaBlocks = getResolvedSchemaBlocks({
    page: homePage
      ? { ...homePage, content: homeContent }
      : { title: 'Home', slug: '', template: 'home', seo: content?.data?.home?.seo, content: homeContent },
    globalData: content?.data || {},
    slug: '/'
  });

  return (
    <>
      <CustomSchemaMarkup schema={schemaBlocks} />
      <TemplateWrapper
        templateName="home"
        pageData={homePage ? {
          ...homePage,
          content: {
            ...homeContent,
            // Always refresh from the live master catalog rather than trusting
            // whatever globalServices snapshot happened to be last saved on this
            // Page doc - that mirror can go stale (see Services.tsx enrichment).
            globalServices
          }
        } : {
          content: {
            ...homeContent,
            globalServices
          }
        }}
        globalData={content?.data || {}}
        initialBlogs={initialBlogs}
        params={Promise.resolve({ slug: ['/'] })}
      />
    </>
  );
}
