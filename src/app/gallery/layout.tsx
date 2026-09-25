// Metadata for /gallery/ lives in page.tsx (it needs the resolved Page document). A layout-level generateMetadata used
// to sit here reading global `galleryPage.seo`, but page.tsx defines every key it set (title, description, canonical,
// robots, openGraph), so that copy was always overridden - dead code plus an extra DB query. Layout is now a passthrough.
export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
