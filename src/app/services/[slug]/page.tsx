import { Metadata } from "next";
export const revalidate = 60; // Cache for 1 minute
import { notFound, permanentRedirect } from "next/navigation";
import CustomSchemaMarkup from "@/components/CustomSchemaMarkup";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import ServiceDetailTemplate from "@/components/templates/ServiceDetailTemplate";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";

import { getCachedSiteContent } from "@/lib/content";
import { extractLocationInfo, getResolvedSchemaBlocks } from "@/lib/dynamicSchema";

function getAbsoluteUrl(path: string | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCachedSiteContent();
  const isGlobalNoIndex = !!data?.settings?.globalNoIndex;
  const services = data?.services?.services || [];
  const service = services.find((s: any) => s.slug === slug && s.status !== 'draft' && !s.isTrashed);

  if (!service) return {};

  const seo = service.seo || {};
  const title = seo.metaTitle || seo.title || `${service.title} | Mohsin Designs`;
  const description = seo.metaDescription || service.description || service.tagline || `Professional ${service.title} architecture and digital solutions by Mohsin Designs.`;
  const canonicalUrl = seo.canonicalUrl || `${BASE_URL}/services/${slug}/`;

  const publishedIso = service.createdAt ? new Date(service.createdAt).toISOString() : "2025-01-01T00:00:00.000Z";
  const modifiedIso = service.updatedAt ? new Date(service.updatedAt).toISOString() : (data?.lastUpdated ? new Date(data.lastUpdated).toISOString() : new Date().toISOString());

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
    openGraph: {
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      url: canonicalUrl,
      type: "article",
      publishedTime: publishedIso,
      modifiedTime: modifiedIso,
      images: [
        {
          url: seo.ogImage || service.heroImage || `${BASE_URL}/portfolio_hero_bg.png`,
          width: 1200,
          height: 630,
          alt: service.title,
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: seo.ogTitle || title,
      description: seo.ogDescription || description,
      images: [seo.ogImage || service.heroImage || `${BASE_URL}/portfolio_hero_bg.png`]
    },
    other: {
      "article:published_time": publishedIso,
      "article:modified_time": modifiedIso,
      "publish-date": publishedIso,
      "date": publishedIso,
    }
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;

  const data = await getCachedSiteContent();
  if (!data) {
    return notFound();
  }

  const services = data?.services?.services || [];
  const serviceDoc = services.find((s: any) => {
    return s.slug === resolvedParams.slug && s.status !== 'draft' && !s.isTrashed;
  });

  if (!serviceDoc) {
    return notFound();
  }

  const settings = data?.settings || {};

  // If this service is set as the homepage, redirect slug to root /
  if (settings.homepageId && (String(serviceDoc._id) === String(settings.homepageId) || serviceDoc.slug === settings.homepageId)) {
    permanentRedirect("/");
  }

  const service = JSON.parse(JSON.stringify(serviceDoc));
  const globalData = data || {};
  const allFaqs = globalData.faq?.items || [];

  const faqs = allFaqs.filter((item: any) =>
    item.visibility === 'global' ||
    (item.visibility === 'specific' && item.targetPages?.includes(resolvedParams.slug))
  );

  // Resolve dynamic schema for the service page, merging any custom schema with auto-generated structures.
  const serviceLocationInfo = extractLocationInfo(resolvedParams.slug, service.title, service.template || "", service.content || {});
    const locationSchemaBlock = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Place",
      "name": serviceLocationInfo.name,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": serviceLocationInfo.country,
        "addressRegion": serviceLocationInfo.code || ""
      }
    });
    const resolvedSchemaBlocksBase = typeof getResolvedSchemaBlocks === "function" ? getResolvedSchemaBlocks({
      page: service,
      globalData,
      slug: resolvedParams.slug,
    }) : [];
    const resolvedSchemaBlocks = [...resolvedSchemaBlocksBase, locationSchemaBlock];

  return (
    <>
      {/* Compute dates for meta tags */}
      {(() => {
        const publishedIso = service.createdAt ? new Date(service.createdAt).toISOString() : new Date().toISOString();
        const modifiedIso = service.updatedAt ? new Date(service.updatedAt).toISOString() : publishedIso;
        return (
          <>
            {/* Render resolved JSON-LD blocks */}
            <CustomSchemaMarkup schema={resolvedSchemaBlocks} />
            <meta property="article:published_time" content={publishedIso} />
            <meta property="article:modified_time" content={modifiedIso} />
            <ServiceDetailTemplate params={resolvedParams} pageData={service} />
          </>
        );
      })()}
    </>
  );
}