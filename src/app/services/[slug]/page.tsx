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
  const title = seo.metaTitle || seo.title;
  const description = seo.metaDescription;

  return {
    title,
    description,
    alternates: {
      canonical: seo.canonicalUrl || `${BASE_URL}/services/${slug}`,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex)
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

  const customSchema = service?.seo?.schemaData || service?.schemaMarkup || service?.customSchema || service?.faqSchemaMarkup;

  return (
    <>
      <CustomSchemaMarkup schema={customSchema} />
      <ServiceDetailTemplate params={resolvedParams} pageData={service} />
    </>
  );
}