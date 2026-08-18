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
    const footerCompany = getSafe(footer, 'company', { name: "Mohsin Designs", tagline: "Premium Exterior Solutions", description: "", logo: "" });
    const footerBottom = getSafe(footer, 'bottom', { copyright: "© 2026 Mohsin Designs", rights: "All Rights Reserved", tagline: "", links: [] });
    const footerMarquee = getSafe(footer, 'marquee', { texts: [], speed: 30, repeats: 8 });
    const footerCertifications = getSafe(footer, 'certifications', []);

    return {
        navbar: getSafe(completeData, 'navbar', { menu: [], logo: "", cta: { text: "Get Quote", href: "/contact-us" } }),
        hero: getSafe(completeData, 'hero', { headlines: [], description: "", buttons: [], stats: [], images: [] }),
        about: getSafe(completeData, 'about'),
        services: (() => {
            const s = getSafe(completeData, 'services', { services: [] });
            // Normalize: if it's already an array, wrap it in the expected object structure
            const normalized = Array.isArray(s) ? { services: s } : s;
            if ((!normalized.services || normalized.services.length === 0) && completeData.globalServices) {
                normalized.services = completeData.globalServices;
            }
            return normalized;
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
        whyChooseUs: (() => {
            const raw = getSafe(completeData, 'whyChooseUs', {});
            const defaults = {
                sectionTag: "HOW WE WORK",
                titleIntro: "Engineered For",
                titleHighlight: "Peak Performance",
                subtext: "We combine precision design, rock-solid engineering, and conversion strategy to build digital experiences that deliver real, measurable growth.",
                stats: [
                    { value: "99.8%", label: "Satisfaction", sublabel: "Verified Reviews", percentage: 0.99 },
                    { value: "10x", label: "Speed Increase", sublabel: "Faster Load Times", percentage: 0.95 },
                    { value: "<24h", label: "Turnaround", sublabel: "Average Response", percentage: 0.9 }
                ],
                illustrations: {
                    scoreLabel: "100",
                    ratingLabel: "5.0 ★★★★★"
                },
                reasons: [
                    { num: "01", title: "Strategy & Discovery", desc: "Deep analysis of your market, competitors, and audience to lay the foundation for high-conversion outcomes.", iconName: "Sparkles", image: "" },
                    { num: "02", title: "Custom UX/UI & Prototyping", desc: "Bespoke, brand-aligned interfaces crafted with pixel precision and optimized for seamless user journeys.", iconName: "Terminal", image: "" },
                    { num: "03", title: "High-Speed Clean Development", desc: "Modern, performant code built on scalable architectures with ultra-fast page speeds and airtight security.", iconName: "Zap", image: "" },
                    { num: "04", title: "Conversion Optimization & SEO", desc: "Built-in technical SEO, structured data markup, and high-impact conversion funnels that drive revenue.", iconName: "TrendingUp", image: "" },
                    { num: "05", title: "Ongoing Partnership & Support", desc: "Continuous proactive monitoring, performance audits, and rapid updates to keep you ahead of the competition.", iconName: "HeartHandshake", image: "" }
                ]
            };
            return {
                ...defaults,
                ...raw,
                sectionTag: raw.sectionTag || raw.section?.badge || defaults.sectionTag,
                titleIntro: raw.titleIntro || raw.section?.headlinePrefix || defaults.titleIntro,
                titleHighlight: raw.titleHighlight || raw.section?.headlineHighlight || defaults.titleHighlight,
                subtext: raw.subtext || raw.section?.description || defaults.subtext,
                stats: (Array.isArray(raw.stats) && raw.stats.length > 0) ? raw.stats : defaults.stats,
                illustrations: { ...defaults.illustrations, ...(raw.illustrations || {}) },
                reasons: (Array.isArray(raw.reasons) && raw.reasons.length > 0) 
                    ? raw.reasons 
                    : (Array.isArray(raw.features) && raw.features.length > 0 
                        ? raw.features.map((f: any, idx: number) => ({
                            num: String(idx + 1).padStart(2, "0"),
                            title: f.title,
                            desc: f.description,
                            iconName: f.icon || "Sparkles",
                            image: f.image || ""
                          })) 
                        : defaults.reasons)
            };
        })(),
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
        loader: getSafe(completeData, 'loader', { company: { name: "Mohsin Designs", tagline: "Premium Agency Solutions" }, phases: { simpleDark: 200, roofDraw: 300, logoText: 400, ready: 100 } }),
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
        settings: completeData?.settings || { siteTitle: "Mohsin Designs", siteTemplate: "%s | Mohsin Designs", favicon: "/mohsin-logo.png" },
        faqPage: getSafe(completeData, 'faqPage'),
        blogSection: getSafe(completeData, 'blogSection', {
            title: "Latest from the Blog",
            subtitle: "Insights & News",
            description: "Stay updated with the latest trends, tips, and news from the creative design and development industry.",
            selectedPosts: []
        }),
        allBlogs: Array.isArray(completeData?.allBlogs) ? completeData.allBlogs : [],
    };
};
