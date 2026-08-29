import React from 'react';
import HomeTemplate from './HomeTemplate';
import AboutTemplate from './AboutTemplate';
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
import IndustryTemplate from './IndustryTemplate';
import PageInlineFaqs from '../PageInlineFaqs';

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
  'blog': BlogTemplate,
  'country': CountryTemplate,
  'state': StateTemplate,
  'industry': IndustryTemplate,
  'industries': IndustryTemplate,
};

export const getTemplate = (name: string) => {
  return TEMPLATE_MAP[name] || HomeTemplate;
};

export const TemplateWrapper = ({ templateName, pageData, globalData, params }: any) => {
  const Template = getTemplate(templateName);

  const hasInlineFaqs = !['home', 'faq', 'service-detail', 'about', 'service-area', 'location', 'locations', 'services', 'contact', 'blog', 'country', 'state', 'industry', 'industries'].includes(templateName) &&
    ((pageData?.content?.faqs && Array.isArray(pageData.content.faqs) && pageData.content.faqs.length > 0) ||
      (pageData?.content?.faqSchemaMarkup && typeof pageData.content.faqSchemaMarkup === 'string' && pageData.content.faqSchemaMarkup.trim()));

  // For country and state templates, isolate content completely to prevent any homepage data leakage
  const isIsolatedTemplate = ['country', 'state'].includes(templateName);

  const providerData = isIsolatedTemplate
    ? {
      ...(pageData?.content || {}),
      settings: globalData?.settings || {},
      globalServices: globalData?.services?.services || globalData?.globalServices || [],
    }
    : {
      ...(globalData || {}),
      ...(pageData?.content || {}),
      hero: {
        ...(globalData?.hero || {}),
        ...(pageData?.content?.hero || {}),
      },
    };

  return (
    <ContentProvider initialData={providerData}>
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
