import { useContentContext } from "../context/ContentContext";
import { cleanMojibake } from "../lib/utils";

function sanitizeEncoding(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return cleanMojibake(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeEncoding(item));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = sanitizeEncoding(obj[key]);
    }
    return res;
  }
  return obj;
}

function proxyAllUrls(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.includes("https://res.cloudinary.com/dytytwyp6/image/upload/")) {
      return obj.replace(/https:\/\/res\.cloudinary\.com\/dytytwyp6\/image\/upload\//g, "/cdn-images/");
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => proxyAllUrls(item));
  }
  if (typeof obj === 'object') {
    const res: any = {};
    for (const key in obj) {
      res[key] = proxyAllUrls(obj[key]);
    }
    return res;
  }
  return obj;
}

export const useContent = () => {
    const rawData = useContentContext();
    const completeData = sanitizeEncoding(proxyAllUrls(rawData));

    // Deep fallback helper to prevent undefined.property crashes
    const getSafe = (data: any, key: string, fallback: any = {}) => {
        return data?.[key] || fallback;
    };

    const footer = getSafe(completeData, 'footer');
    const footerServices = getSafe(footer, 'services', { title: "Our Services", materials: { title: "Premium Materials", items: [] } });
    const footerContact = getSafe(footer, 'contact', { title: "Contact Us", email: "", phone: "", address: "", emergency: "", areas: "" });
    const footerCompany = getSafe(footer, 'company', { name: "Eagle Revolution", tagline: "Veteran Owned & Operated", description: "", logo: "" });
    const footerBottom = getSafe(footer, 'bottom', { copyright: "© 2026 Eagle Revolution", rights: "All Rights Reserved", tagline: "", links: [] });
    const footerMarquee = getSafe(footer, 'marquee', { texts: [], speed: 30, repeats: 8 });
    const footerCertifications = getSafe(footer, 'certifications', []);

    return {
        navbar: getSafe(completeData, 'navbar', { menu: [], logo: "", cta: { text: "Get Quote", href: "/contact-us" } }),
        hero: getSafe(completeData, 'hero', { headlines: [], description: "", buttons: [], stats: [], images: [] }),
        about: getSafe(completeData, 'about'),
        services: (() => {
            const s = getSafe(completeData, 'services', { services: [] });
            // Normalize: if it's already an array, wrap it in the expected object structure
            return Array.isArray(s) ? { services: s } : s;
        })(),
        leadership: getSafe(completeData, 'leadership', {
            section: { badge: "", headline: "", description: "" },
            ceo: { name: "", title: "", image: { src: "" }, badges: { top: "", bottom: "" }, quotes: [], description: "", socials: [] }
        }),
        portfolio: (() => {
            const p = getSafe(completeData, 'portfolio', {});
            const selectedProjects = Array.isArray(p.projects) ? p.projects : [];

            // If no projects specifically selected for home, use from galleryPage
            if (selectedProjects.length === 0) {
                const galleryProjects = completeData?.galleryPage?.projects || [];
                if (Array.isArray(galleryProjects) && galleryProjects.length > 0) {
                    return {
                        ...p,
                        projects: galleryProjects.slice(0, 8) // Show up to 8 featured
                    };
                }
            }

            return {
                ...p,
                projects: selectedProjects
            };
        })(),
        testimonials: getSafe(completeData, 'testimonials', {
            section: { badge: "", headline: "", description: "" },
            items: []
        }),
        whyChooseUs: getSafe(completeData, 'whyChooseUs', {
            section: { badge: "", headline: "", description: "" },
            features: [],
            stats: [],
            cta: { badge: "", title: "", description: "", trustBadges: [], buttons: [] }
        }),
        faq: getSafe(completeData, 'faq', {
            section: { badge: "", headline: "", title: "", description: "" },
            categories: [],
            items: []
        }),
        quote: getSafe(completeData, 'quote', {
            section: { badge: "", headline: "", description: "" },
            services: [],
            projectTypes: [],
            timelines: [],
            success: { title: "", message: "", response: "", buttonText: "" }
        }),
        footer: {
            ...footer,
            services: footerServices,
            contact: footerContact,
            company: footerCompany,
            bottom: footerBottom,
            marquee: footerMarquee,
            certifications: footerCertifications,
            newsletter: getSafe(footer, 'newsletter', { placeholder: "Enter your email", buttonText: "Subscribe" })
        },
        team: getSafe(completeData, 'team', {
            section: { badge: "", headline: "", description: "" },
            members: []
        }),
        careers: getSafe(completeData, 'careers', {
            section: { badge: "", headline: "", description: "" },
            roles: [],
            success: { title: "", description: "" },
            labels: { name: "", email: "", role: "", summary: "" }
        }),
        aboutPage: {
            ...(completeData?.aboutPage || {}),
            // Root-level overrides for dynamic pages
            ...(completeData?.hero ? { hero: completeData.hero } : {}),
            ...(completeData?.mission ? { mission: completeData.mission } : {}),
            ...(completeData?.story ? { story: completeData.story } : {}),
            ...(completeData?.values ? { values: completeData.values } : {}),
            ...(completeData?.capabilities ? { capabilities: completeData.capabilities } : {}),
            ...(completeData?.stats ? { stats: completeData.stats } : {}),
            ...(completeData?.ctaBanner ? { ctaBanner: completeData.ctaBanner } : {}),
            ...(completeData?.recognition ? { recognition: completeData.recognition } : {}),
        },
        images: getSafe(completeData, 'images', {}),
        loader: getSafe(completeData, 'loader', { company: { name: "Eagle Revolution", tagline: "Veteran Owned" }, phases: { simpleDark: 200, roofDraw: 300, logoText: 400, ready: 100 } }),
        quickQuote: getSafe(completeData, 'quickQuote', {
            title: "",
            description: "",
            buttonText: ""
        }),
        hours: getSafe(completeData, 'hours'),
        contactPage: getSafe(completeData, 'contactPage', {
            header: { badge: "", headline: "", description: "" },
            formFields: [],
            info: {},
            social: {}
        }),
        galleryPage: getSafe(completeData, 'galleryPage', {
            header: { badge: "", title: "", description: "" }
        }),
        brandStore: getSafe(completeData, 'brandStore', {
            section: { badge: "", headline: "", description: "" },
            items: []
        }),
        serviceDetailPage: getSafe(completeData, 'serviceDetailPage'),
        settings: completeData?.settings || { siteTitle: "Eagle Revolution", siteTemplate: "%s | Eagle Revolution", favicon: "/eagle-logo.png" },
        faqPage: getSafe(completeData, 'faqPage'),
        blogSection: getSafe(completeData, 'blogSection', {
            title: "Latest from the Blog",
            subtitle: "Insights & News",
            description: "Stay updated with the latest trends, tips, and news from the roofing and construction industry.",
            selectedPosts: []
        }),
        allBlogs: Array.isArray(completeData?.allBlogs) ? completeData.allBlogs : [],
    };
};
