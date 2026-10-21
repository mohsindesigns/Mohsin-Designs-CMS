/**
 * Centralized service visibility helper.
 * Determines whether a service should appear in services sections, carousels,
 * and recommendation listings on a given page or service.
 */

function normalizePath(val: unknown): string {
  if (val === null || val === undefined) return "";
  return String(val)
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/[^\/]+/i, "")
    .replace(/^\/+|\/+$/g, "");
}

export function isServiceVisibleOnPage(
  service: any,
  currentIdentifier: string | undefined | null
): boolean {
  if (!service) return false;

  const visibility = service.visibility || 'global';
  // 'global' or 'all' means the service can appear everywhere
  if (visibility === 'global' || visibility === 'all') {
    return true;
  }

  // 'specific' or 'selective': only show if the current page/service is in targetPages
  if (visibility === 'specific' || visibility === 'selective') {
    const targets = Array.isArray(service.targetPages) ? service.targetPages : [];
    if (currentIdentifier === null || currentIdentifier === undefined) return false;

    const normalizedCurrent = normalizePath(currentIdentifier);

    return targets.some((target: string) => {
      if (!target) return false;
      const normalizedTarget = normalizePath(target);

      if (normalizedTarget === normalizedCurrent) return true;

      // Handle homepage aliases: '', 'home', 'homepage', '/'
      const isHomeCurrent =
        normalizedCurrent === "" ||
        normalizedCurrent === "home" ||
        normalizedCurrent === "homepage";
      const isHomeTarget =
        normalizedTarget === "" ||
        normalizedTarget === "home" ||
        normalizedTarget === "homepage";
      if (isHomeCurrent && isHomeTarget) return true;

      // Handle about page aliases
      const isAboutCurrent =
        normalizedCurrent === "about" ||
        normalizedCurrent === "about-us" ||
        normalizedCurrent === "about-me";
      const isAboutTarget =
        normalizedTarget === "about" ||
        normalizedTarget === "about-us" ||
        normalizedTarget === "about-me";
      if (isAboutCurrent && isAboutTarget) return true;

      // Handle contact page aliases
      const isContactCurrent =
        normalizedCurrent === "contact" ||
        normalizedCurrent === "contact-us";
      const isContactTarget =
        normalizedTarget === "contact" ||
        normalizedTarget === "contact-us";
      if (isContactCurrent && isContactTarget) return true;

      // Handle services archive alias
      if (
        (normalizedTarget === "services" || normalizedTarget === "services/" || normalizedTarget === "all-services") &&
        (normalizedCurrent === "services" || normalizedCurrent === "services/" || normalizedCurrent === "all-services")
      ) {
        return true;
      }

      // Handle service slug with or without 'services/' prefix
      const strippedCurrent = normalizedCurrent.replace(/^services\//, "");
      const strippedTarget = normalizedTarget.replace(/^services\//, "");
      if (strippedCurrent && strippedCurrent === strippedTarget) {
        return true;
      }

      // A State/City page's `slug` gets rewritten at render time to its canonical nested path
      // (applyLocationHierarchy: "usa/<state-slug>" or "usa/<state-slug>/<city-slug>"), but every
      // admin targeting UI (VisibilityPicker, PageServicesPicker, ContentSelector) lists and saves
      // the page's flat, originally-stored slug - a Country page has no parent so this never comes
      // up there, which is why this only breaks State/City. Page.slug is unique across the whole
      // site (Page.ts: `unique: true`), so the final path segment always traces back to exactly one
      // page - safe to compare as a fallback once every more specific match above has failed.
      const currentLastSegment = normalizedCurrent.split("/").filter(Boolean).pop() || "";
      const targetLastSegment = normalizedTarget.split("/").filter(Boolean).pop() || "";
      if (currentLastSegment && currentLastSegment === targetLastSegment) {
        return true;
      }

      return false;
    });
  }

  return true;
}

/**
 * Page `template` values whose component actually renders a services section, carousel, dropdown
 * or recommendation list (verified against the template source, not just which files this feature
 * happened to touch - see TemplateRegistry.TEMPLATE_MAP for the full set of templates). Used to:
 *  - keep the "target this page" picker on a service free of pages that could never show it anyway
 *    (Team, FAQ, Gallery, Contact, Reviews, Careers, Blog, Location have no services section), and
 *  - decide which pages get the reverse "services shown here" picker in the page editor.
 * 'service-detail' is deliberately included (its own page renders a "Services that pair" list and
 * a service dropdown) but admin/services/page.tsx excludes it from the Pages group specifically,
 * since those pages are already listed once under "Other Services".
 */
export const TEMPLATES_WITH_SERVICES_SECTION = [
  "home",
  "about",
  "new-about",
  "newabout",
  "service-detail",
  "services",
  "service-area",
  "country",
  "state",
  "city",
  "industry",
  "industries",
];

export function filterVisibleServices(
  services: any[],
  currentIdentifier: string | undefined | null
): any[] {
  if (!Array.isArray(services)) return [];
  return services.filter((s) => isServiceVisibleOnPage(s, currentIdentifier));
}

const keyOfService = (s: any): string => String(s?._id || s?.id || s?.slug || "");

/**
 * A location page's (Country/State/City/Service Area) services section was historically built
 * ONLY from that page's own hand-picked "saved" cards - visibility filtering only ever PRUNED that
 * list, it never ADDED to it. That defeats the whole point of targeting a service to a specific
 * page: an admin sets a service to Selective and ticks "Saudi Arabia", expecting it to show there,
 * but if it was never also manually hand-picked into the Saudi Arabia page's own card list, nothing
 * shows - the section just disappears instead of displaying the one targeted service.
 *
 * This appends any catalog service that is specifically (not globally) targeted to this page and
 * isn't already present in the (already visibility-filtered) saved cards, so targeting alone is
 * enough - no redundant hand-pick required. Global services are intentionally left out here: they
 * already reach this page through the saved-cards/catalog-fallback path each template already has.
 */
export function withTargetedServices(
  savedLive: any[],
  catalog: any[],
  pageIdentifier: string | undefined | null
): any[] {
  const saved = Array.isArray(savedLive) ? savedLive : [];
  const pool = Array.isArray(catalog) ? catalog : [];
  const savedKeys = new Set(saved.map(keyOfService).filter(Boolean));
  const targeted = pool.filter(
    (c: any) =>
      c &&
      (c.visibility === "specific" || c.visibility === "selective") &&
      !savedKeys.has(keyOfService(c)) &&
      isServiceVisibleOnPage(c, pageIdentifier)
  );
  return targeted.length > 0 ? [...saved, ...targeted] : saved;
}
