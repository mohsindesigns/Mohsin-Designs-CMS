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
