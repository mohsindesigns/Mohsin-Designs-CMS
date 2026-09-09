import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import { resolveRobotsMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const services = content?.data?.services?.services || [];
  const service = services.find((s: any) => s.slug === slug && s.status !== 'draft' && !s.isTrashed);

  if (!service) {
    return {
      title: "Service Not Found",
      robots: { index: false, follow: false },
    };
  }

  const isGlobalNoIndex = !!content?.data?.settings?.globalNoIndex;
  const seo = service.seo || {};

  const title = seo.metaTitle || seo.title || service.title;
  const description = seo.metaDescription || seo.description;

  return {
    title,
    description,
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
    alternates: {
      canonical: `${BASE_URL}/services/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/services/${slug}`,
      type: "website",
      images: [
        {
          url: seo.featuredImage || seo.ogImage || `${BASE_URL}/portfolio_hero_bg.png`,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.featuredImage || seo.twitterImage || seo.ogImage || `${BASE_URL}/portfolio_hero_bg.png`],
    },
  };
}

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
