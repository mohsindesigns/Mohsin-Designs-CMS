// Single source of truth for the template pickers in the Pages admin (Add New Page modal,
// Quick Edit and the editor sidebar). They used to be three hand-copied lists that had drifted
// (the sidebar offered 'locations' as a second "Locations Hub", the other two lacked it, and
// 'about' / 'new-about' were two entries for the exact same component + editor).
//
// Keys must exist in: the `template` enum (src/models/Page.ts), TEMPLATE_MAP
// (src/components/templates/TemplateRegistry.tsx) and TemplateEditors
// (src/components/admin/editors/index.ts).

export interface TemplateOption {
  id: string;
  label: string;
  /** Short description shown under the picker. */
  hint?: string;
}

export const PAGE_TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: 'home', label: 'Home Template', hint: 'The site homepage. Only one page should use it.' },
  { id: 'new-about', label: 'About Template' },
  { id: 'services', label: 'Services Template' },
  { id: 'service-detail', label: 'Service Detail Template' },
  { id: 'industry', label: 'Industry Template' },
  { id: 'industries', label: 'Industries Hub Template', hint: 'Renders exactly like the Industry template.' },
  { id: 'team', label: 'Team Template' },
  { id: 'careers', label: 'Careers Template' },
  { id: 'gallery', label: 'Portfolio Template' },
  { id: 'reviews', label: 'Reviews Template' },
  { id: 'faq', label: 'FAQ Template' },
  { id: 'contact', label: 'Contact Template', hint: 'Use the slug "contact-us" ("contact" redirects there).' },
  { id: 'location', label: 'Locations Hub Template' },
  { id: 'service-area', label: 'Service Area Template' },
  { id: 'blog', label: 'Blog Template' },
  { id: 'country', label: 'Country Template', hint: 'Top of the Country > State > City hierarchy.' },
  { id: 'state', label: 'State Template', hint: 'Lives under a Country page: /country/state/.' },
  { id: 'city', label: 'City Template', hint: 'Lives under a State page: /country/state/city/.' },
];

/**
 * Legacy keys that are still valid in the database (and in TEMPLATE_MAP) but render identically to
 * a canonical key. Pages using them are shown - and re-saved - under the canonical key.
 */
export const TEMPLATE_ALIASES: Record<string, string> = {
  about: 'new-about',
  newabout: 'new-about',
  locations: 'location',
};

export const canonicalTemplate = (t: string | undefined | null): string => {
  const key = t || '';
  return TEMPLATE_ALIASES[key] || key;
};

export const templateLabel = (t: string | undefined | null): string => {
  const key = canonicalTemplate(t);
  return PAGE_TEMPLATE_OPTIONS.find((o) => o.id === key)?.label || key || 'Unknown';
};

/** Templates whose URL is built from a parent (country/state) - changing to/from them needs care. */
export const LOCATION_TEMPLATE_IDS = ['country', 'state', 'city'];

/**
 * Text for the confirm() shown before switching an EXISTING page to another template.
 * Nothing is deleted - the old content stays in the database - but the new template's editor and
 * layout only know their own fields, so most of the old content will not show up.
 */
export function templateChangeWarning(from: string, to: string): string {
  const extra = LOCATION_TEMPLATE_IDS.includes(to) && !LOCATION_TEMPLATE_IDS.includes(from)
    ? '\n\nCountry / State / City pages are only reachable under their hierarchical URL (/country/state/city/); make sure the slug and parents are set up.'
    : '';
  return `Change the template from "${templateLabel(from)}" to "${templateLabel(to)}"?\n\nThe existing content is kept, but the new template only displays its own fields, so most of what is on the page now will not appear until you re-enter it.${extra}`;
}
