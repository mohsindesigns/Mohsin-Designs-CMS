import React from 'react';
import HomeTemplate from './HomeTemplate';
import NewAboutTemplate from './NewAboutTemplate';
import ServiceDetailTemplate from './ServiceDetailTemplate';
import TeamTemplate from './TeamTemplate';
import CareersTemplate from './CareersTemplate';
import ReviewsTemplate from './ReviewsTemplate';
import FAQTemplate from './FAQTemplate';
import ContactTemplate from './ContactTemplate';
import GalleryTemplate from './GalleryTemplate';
import ServicesTemplate from './ServicesTemplate';
import ServiceAreaTemplate from './ServiceAreaTemplate';
import LocationTemplate from './LocationTemplate';
import BlogTemplate from './BlogTemplate';
import CountryTemplate from './CountryTemplate';
import StateTemplate from './StateTemplate';
import CityTemplate from './CityTemplate';
import IndustryTemplate from './IndustryTemplate';
import PageInlineFaqs from '../PageInlineFaqs';
import { TEMPLATES_WITH_OWN_FAQ_SECTION } from './templateFaqPolicy';

import { ContentProvider } from "@/context/ContentContext";

export const TEMPLATE_MAP: Record<string, React.ComponentType<any>> = {
  'home': HomeTemplate,
  'about': NewAboutTemplate,
  'new-about': NewAboutTemplate,
  'newabout': NewAboutTemplate,
  'service-detail': ServiceDetailTemplate,
  'team': TeamTemplate,
  'careers': CareersTemplate,
  'reviews': ReviewsTemplate,
  'faq': FAQTemplate,
  'contact': ContactTemplate,
  'gallery': GalleryTemplate,
  'services': ServicesTemplate,
  'service-area': ServiceAreaTemplate,
  'location': LocationTemplate,
  'locations': LocationTemplate,
  'blogs': BlogTemplate,
  'blog': BlogTemplate,
  'country': CountryTemplate,
  'state': StateTemplate,
  'city': CityTemplate,
  'industry': IndustryTemplate,
  'industries': IndustryTemplate,
};

/**
 * Falls back to the Home template for an unknown key. Public routes should call `hasTemplate()`
 * first and 404 instead (a page with a mistyped/legacy template key must not silently render as
 * the homepage).
 */
export const getTemplate = (name: string) => {
  return TEMPLATE_MAP[name] || HomeTemplate;
};

export const hasTemplate = (name: string) => Object.prototype.hasOwnProperty.call(TEMPLATE_MAP, name);

/*
 * TEMPLATES_WITH_OWN_FAQ_SECTION (./templateFaqPolicy) lists the templates whose own component
 * already renders the page's "Page FAQs". It used to also contain 'about', 'contact',
 * 'location(s)' and 'blog(s)', but AboutTemplate is NewAboutTemplate (no FAQ section),
 * ContactTemplate and BlogTemplate have none either, and LocationTemplate only reads a top-level
 * `pageData.faq` that no Page document ever has - so FAQs entered on those pages' "Page FAQs"
 * tab were saved but never shown (and 'about' vs 'new-about' behaved differently even though they
 * are the same component).
 */

const plainText = (v: unknown) =>
  typeof v === 'string' ? v.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').trim() : '';

/**
 * Drops FAQ rows that are missing a question or an answer (the editor's "+ Add FAQ" button adds a
 * blank row; PageInlineFaqs would render it as a generic "Frequently Asked Question" with an
 * empty body). Non-array values (legacy shapes) are returned untouched by the callers.
 */
export function cleanFaqList(items: unknown): any[] {
  if (!Array.isArray(items)) return [];
  return items.filter(
    (i: any) =>
      i &&
      plainText(i.question ?? i.q ?? i.title) &&
      plainText(i.answer ?? i.a ?? i.description)
  );
}

export const TemplateWrapper = ({ templateName, pageData: rawPageData, globalData, initialBlogs, params }: any) => {
  const Template = getTemplate(templateName);

  // Strip blank FAQ rows once, for every template (see cleanFaqList).
  const pageData = Array.isArray(rawPageData?.content?.faqs)
    ? { ...rawPageData, content: { ...rawPageData.content, faqs: cleanFaqList(rawPageData.content.faqs) } }
    : rawPageData;

  // The shared FAQ block only appears when the page really has FAQs. (It used to also appear when
  // only a leftover `faqSchemaMarkup` string existed, which rendered the hardcoded starter FAQs
  // for a page whose FAQs had been deleted.)
  const hasInlineFaqs =
    !TEMPLATES_WITH_OWN_FAQ_SECTION.has(templateName) &&
    Array.isArray(pageData?.content?.faqs) &&
    pageData.content.faqs.length > 0;

  // For country, state and city templates, isolate content completely to prevent any homepage data leakage
  const isIsolatedTemplate = ['country', 'state', 'city'].includes(templateName);

  const providerData = isIsolatedTemplate
    ? {
      ...(pageData?.content || {}),
      settings: globalData?.settings || {},
      navbar: globalData?.navbar || {},
      footer: globalData?.footer || {},
      globalServices: globalData?.services?.services || globalData?.globalServices || [],
    }
    : {
      ...(globalData || {}),
      ...(pageData?.content || {}),
      // Crucial: pageData.content must NEVER override global site layout (navbar, footer)
      navbar: globalData?.navbar || {},
      footer: globalData?.footer || {},
      settings: {
        ...(globalData?.settings || {}),
        ...(pageData?.content?.settings || {})
      },
      hero: {
        ...(globalData?.hero || {}),
        ...(pageData?.content?.hero || {}),
      },
    };

  return (
    <ContentProvider initialData={providerData} initialBlogs={initialBlogs}>
      <Template pageData={pageData} params={params} />
      {hasInlineFaqs && (
        <PageInlineFaqs
          faqs={pageData.content.faqs}
          faqSchemaMarkup={pageData.content.faqSchemaMarkup}
          badge={pageData.content.faqBadge}
          title={pageData.content.faqTitleHighlight || pageData.content.faqTitle}
          description={pageData.content.faqDescription}
          data={pageData.content}
        />
      )}
    </ContentProvider>
  );
};
