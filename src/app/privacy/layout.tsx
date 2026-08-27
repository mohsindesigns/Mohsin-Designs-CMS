import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";
import { Metadata } from "next";
import { resolveRobotsMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const isGlobalNoIndex = !!content?.data?.settings?.globalNoIndex;
  const privacyData = content?.data?.privacyPage || {};
  const seo = privacyData.seo || {};
  const pageUrl = `${BASE_URL}/privacy`;

  return {
    title: seo.metaTitle || "Privacy Policy",
    description: seo.metaDescription,
    alternates: {
      canonical: seo.canonicalUrl || pageUrl,
    },
    robots: resolveRobotsMetadata(seo, isGlobalNoIndex),
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
