import dynamic from 'next/dynamic';

export const TemplateEditors: Record<string, any> = {
  home: dynamic(() => import('./HomeEditor')),
  'new-about': dynamic(() => import('./NewAboutEditor')),
  newabout: dynamic(() => import('./NewAboutEditor')),
  services: dynamic(() => import('./ServicesEditor')),
  team: dynamic(() => import('./TeamEditor')),
  careers: dynamic(() => import('./CareersEditor')),
  gallery: dynamic(() => import('./GalleryEditor')),
  faq: dynamic(() => import('./FAQEditor')),
  contact: dynamic(() => import('./ContactEditor')),
  reviews: dynamic(() => import('./ReviewsEditor')),
  blog: dynamic(() => import('./BlogEditor')),
  'service-detail': dynamic(() => import('./ServiceDetailEditor')),
  settings: dynamic(() => import('./SettingsEditor')),
  'service-area': dynamic(() => import('./LocationEditor')),
  location: dynamic(() => import('./LocationEditor')),
  locations: dynamic(() => import('./LocationEditor')),
  country: dynamic(() => import('./CountryEditor')),
  state: dynamic(() => import('./StateEditor')),
};
