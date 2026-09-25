import { createElement } from 'react';
import dynamic from 'next/dynamic';

// Shows a placeholder while an editor chunk loads (the big editors take a moment; without this the
// Page Content tab was just blank). Every entry below keeps a literal `() => import('./X')` at
// the dynamic() call site, which next/dynamic requires for its chunk pre-loading.
const loading = () =>
  createElement(
    'div',
    { className: 'p-10 text-center text-[#646970] text-[13px]', role: 'status' },
    'Loading editor...'
  );

/**
 * Page editors keyed by Page.template. Keep this in step with:
 *   - the `template` enum in src/models/Page.ts,
 *   - TEMPLATE_MAP in src/components/templates/TemplateRegistry.tsx,
 *   - the template picker (src/app/admin/pages/templateOptions.ts).
 * (The dead aliases 'homepage', 'home-page', 'about-page' and 'servicedetail' were removed: no
 * page can have those template keys, the model enum rejects them.)
 * The legacy AboutEditor/AboutTemplate pair is intentionally NOT registered - 'about' renders
 * NewAboutTemplate and is edited with NewAboutEditor.
 */
export const TemplateEditors: Record<string, any> = {
  home: dynamic(() => import('./HomeEditor'), { loading }),
  about: dynamic(() => import('./NewAboutEditor'), { loading }),
  'new-about': dynamic(() => import('./NewAboutEditor'), { loading }),
  newabout: dynamic(() => import('./NewAboutEditor'), { loading }),
  services: dynamic(() => import('./ServicesEditor'), { loading }),
  'service-detail': dynamic(() => import('./ServiceDetailEditor'), { loading }),
  team: dynamic(() => import('./TeamEditor'), { loading }),
  careers: dynamic(() => import('./CareersEditor'), { loading }),
  gallery: dynamic(() => import('./GalleryEditor'), { loading }),
  faq: dynamic(() => import('./FAQEditor'), { loading }),
  contact: dynamic(() => import('./ContactEditor'), { loading }),
  reviews: dynamic(() => import('./ReviewsEditor'), { loading }),
  blog: dynamic(() => import('./BlogEditor'), { loading }),
  'service-area': dynamic(() => import('./ServiceAreaEditor'), { loading }),
  location: dynamic(() => import('./LocationEditor'), { loading }),
  locations: dynamic(() => import('./LocationEditor'), { loading }),
  country: dynamic(() => import('./CountryEditor'), { loading }),
  state: dynamic(() => import('./StateEditor'), { loading }),
  city: dynamic(() => import('./CityEditor'), { loading }),
  industry: dynamic(() => import('./IndustryEditor'), { loading }),
  industries: dynamic(() => import('./IndustryEditor'), { loading }),
};
