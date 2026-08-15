import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const galleryData = content?.data?.galleryPage || content?.data?.gallery || {};
  const seo = galleryData.seo || {};
  const pageUrl = `${BASE_URL}/gallery`;

  return {
    title: seo.metaTitle || "Project Gallery",
    description: seo.metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.metaTitle || "Project Gallery",
      description: seo.ogDescription || seo.metaDescription,
      url: pageUrl,
      type: "website",
    },
  };
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
