/**
 * Which templates render the page's "Page FAQs" (content.faqs) THEMSELVES, as their own
 * <PageInlineFaqs> section. Every other template gets the shared FAQ block that TemplateWrapper
 * appends below the template.
 *
 * This is about the COMPONENT, not the template key (so 'about'/'new-about' behave identically).
 * Re-check whenever a template gains or loses its own FAQ section.
 *
 * Kept in its own dependency-free module so the admin page editor can import it without pulling
 * every template component into the admin bundle. Used by TemplateRegistry.tsx and
 * src/app/admin/pages/[id]/page.tsx (the empty-state text of the Page FAQs tab).
 */
export const TEMPLATES_WITH_OWN_FAQ_SECTION: ReadonlySet<string> = new Set([
  'home',
  'faq',
  'service-detail',
  'services',
  'service-area',
  'country',
  'state',
  'city',
  'industry',
  'industries',
]);
