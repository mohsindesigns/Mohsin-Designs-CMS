// Pure (client-safe) breadcrumb trail builder. Keep free of DB/server imports:
// it is used by client components via <PageBreadcrumbs />.

export interface BreadcrumbItem {
  name: string;
  url: string;
}

const trimSlashes = (s: string) => s.replace(/^\/+|\/+$/g, "");

const titleCase = (segment: string) =>
  segment
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

/**
 * Builds the breadcrumb trail for any CMS page. The first crumb is always Home;
 * the homepage itself yields just [Home] (callers render nothing for that).
 * `fallbackPath` (e.g. from usePathname) is used when the page has no slug.
 */
export function buildPageBreadcrumbs(page: any, fallbackPath = ""): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ name: "Home", url: "/" }];
  const slug = trimSlashes(page?.slug || fallbackPath || "");

  if (!slug || page?.template === "home") return crumbs;

  const template = page?.template;
  const content = page?.content || {};
  const pageName = page?.seo?.breadcrumbTitle || page?.title;

  if (template === "city") {
    const countrySlug = content.countrySlug || "usa";
    crumbs.push({ name: content.country || "USA", url: `/${countrySlug}/` });
    if (content.stateSlug) {
      crumbs.push({ name: content.state || "State", url: `/${countrySlug}/${content.stateSlug}/` });
    }
    crumbs.push({ name: content.city || pageName || titleCase(slug.split("/").pop() || ""), url: `/${slug}/` });
    return crumbs;
  }

  if (template === "state") {
    const countrySlug = content.countrySlug || "usa";
    crumbs.push({ name: content.country || "USA", url: `/${countrySlug}/` });
    crumbs.push({ name: pageName || titleCase(slug.split("/").pop() || ""), url: `/${slug}/` });
    return crumbs;
  }

  // Everything else (incl. country): one crumb per path segment.
  const parts = slug.split("/");
  let accum = "";
  parts.forEach((part, i) => {
    accum += `/${part}`;
    const isLast = i === parts.length - 1;
    crumbs.push({
      name: isLast ? pageName || titleCase(part) : titleCase(part),
      url: `${accum}/`,
    });
  });
  return crumbs;
}
