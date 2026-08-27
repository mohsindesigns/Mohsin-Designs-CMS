import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { resolveRobotsMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const isGlobalNoIndex = !!content?.data?.settings?.globalNoIndex;
  const termsData = content?.data?.termsPage || {};
  const seo = termsData.seo || {};
  const pageUrl = `${BASE_URL}/terms`;

  return {
    title: seo.metaTitle || "Terms and Conditions",
    description: seo.metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
  };
}

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
