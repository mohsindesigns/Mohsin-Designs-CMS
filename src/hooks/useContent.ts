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
            const s = getSafe(completeData, 'services', {});
            const normalized = Array.isArray(s) ? { services: s, list: s } : { ...s };
            if ((!normalized.services || normalized.services.length === 0)) {
                if (Array.isArray(completeData.globalServices) && completeData.globalServices.length > 0) {
                    normalized.services = completeData.globalServices;
                } else if (Array.isArray(normalized.list) && normalized.list.length > 0) {
                    normalized.services = normalized.list;
                }
            }
            if (!normalized.list || normalized.list.length === 0) {
                normalized.list = normalized.services || [];
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
        testimonials: (() => {
            const raw = getSafe(completeData, 'testimonials', {});
            const defaults = {
                sectionTag: "CLIENT PRAISE & REVIEWS",
                titleIntro: "Trusted by Founders,",
                titleHighlight: "Loved by Teams",
                description: "Real feedback from visionary founders and engineering leaders who transformed their digital platforms with our expertise.",
                scorecardRating: "4.9/5",
                scorecardRatingLabel: "OVERALL",
                scorecardTitle: "TOP RATED ENGINEERING",
                scorecardSub: "BASED ON 120+ CLIENT REVIEWS",
                list: [
                    { id: "rev-1", name: "Marcus Vance", role: "VP of Engineering", company: "FinScale", quote: "Mohsin's team revamped our core web application in record time. Performance increased by 300% and user engagement reached all-time highs.", rating: 5, column: 1, avatarBg: "bg-[#0306AC]" },
                    { id: "rev-2", name: "Elena Rostova", role: "Chief Design Officer", company: "Aura AI", quote: "The attention to typography, micro-interactions, and responsive layout is world-class. Our design system was delivered ahead of schedule.", rating: 5, column: 1, avatarBg: "bg-purple-600" },
                    { id: "rev-3", name: "David Chen", role: "Founder & CEO", company: "NexPath Logistics", quote: "From discovery to deployment, the execution was flawless. Their architectural decisions saved us months of rework down the line.", rating: 5, column: 1, avatarBg: "bg-emerald-600" },
                    { id: "rev-4", name: "Sarah Jenkins", role: "Head of Product", company: "CloudCore", quote: "Super intuitive CMS and stunning frontend animations. Our non-technical marketing team can now update high-converting pages effortlessly.", rating: 5, column: 2, avatarBg: "bg-amber-600" },
                    { id: "rev-5", name: "Liam O'Connor", role: "Technical Director", company: "Verve Media", quote: "Incredible speed, clean code, and zero bugs on launch day. Mohsin Designs is our go-to engineering partner for every enterprise build.", rating: 5, column: 2, avatarBg: "bg-indigo-600" },
                    { id: "rev-6", name: "Amina Al-Mansoor", role: "Director of Digital", company: "Apex Gulf Group", quote: "They understood our complex requirements instantly and delivered a modern portal that exceeds international enterprise standards.", rating: 5, column: 2, avatarBg: "bg-rose-600" },
                    { id: "rev-7", name: "Julian Meyer", role: "Co-Founder", company: "StackFlow Analytics", quote: "The speed and polish of the final product blew our investors away. Truly state-of-the-art UI with rock-solid Next.js architecture.", rating: 5, column: 3, avatarBg: "bg-cyan-600" },
                    { id: "rev-8", name: "Clara Johansson", role: "Growth Lead", company: "Nordic Ventures", quote: "Conversion rates jumped by 42% in the first 30 days after re-platforming. The ROI speaks for itself.", rating: 5, column: 3, avatarBg: "bg-teal-600" },
                    { id: "rev-9", name: "Tariq Mahmood", role: "Head of Engineering", company: "PulseTech", quote: "Best agency collaboration we've had in 8 years. Highly responsive, deep technical chops, and unmatched creative execution.", rating: 5, column: 3, avatarBg: "bg-[#0306AC]" }
                ]
            };
            return {
                ...defaults,
                ...raw,
                sectionTag: raw.sectionTag || raw.section?.badge || defaults.sectionTag,
                titleIntro: raw.titleIntro || raw.section?.headlinePrefix || defaults.titleIntro,
                titleHighlight: raw.titleHighlight || raw.section?.headlineHighlight || defaults.titleHighlight,
                description: raw.description || raw.section?.description || defaults.description,
                scorecardRating: raw.scorecardRating || defaults.scorecardRating,
                scorecardRatingLabel: raw.scorecardRatingLabel || defaults.scorecardRatingLabel,
                scorecardTitle: raw.scorecardTitle || defaults.scorecardTitle,
                scorecardSub: raw.scorecardSub || defaults.scorecardSub,
                list: (Array.isArray(raw.list) && raw.list.length > 0) ? raw.list : defaults.list
            };
        })(),
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
        serviceArea: (() => {
            const raw = getSafe(completeData, 'serviceArea', {});
            const defaults = {
                sectionTag: "GLOBAL COVERAGE",
                titleIntro: "Serving Clients",
                titleHighlight: "Worldwide",
                description: "With distributed engineering hubs and round-the-clock availability, we partner with industry leaders across North America, Europe, the Middle East, and Asia-Pacific.",
                ctaText: "Schedule Global Consultation",
                ctaHref: "#contact",
                mapSrc: "https://res.cloudinary.com/dyt4m9t6k/image/upload/v1723467823/world-map_h1y3qk.svg",
                mapAlt: "Global Service Locations Map",
                hubs: [
                    { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", x: "27.27%", y: "29.72%" },
                    { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", x: "24.63%", y: "33.63%" },
                    { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", x: "45.97%", y: "45.21%" },
                    { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", x: "49.66%", y: "43.78%" },
                    { id: "fr", name: "France", focus: "Branding & Strategy", timezone: "CET", x: "49.00%", y: "47.84%" },
                    { id: "es", name: "Spain", focus: "Frontend Development", timezone: "CET", x: "46.49%", y: "46.30%" },
                    { id: "it", name: "Italy", focus: "Creative Design", timezone: "CET", x: "50.53%", y: "50.18%" },
                    { id: "at", name: "Austria", focus: "Mobile Apps & API", timezone: "CET", x: "51.07%", y: "44.34%" },
                    { id: "be", name: "Belgium", focus: "Digital Platforms", timezone: "CET", x: "48.27%", y: "44.90%" },
                    { id: "br", name: "Brazil", focus: "Latin America Hub", timezone: "BRT", x: "26.67%", y: "77.03%" },
                    { id: "bh", name: "Bahrain / GCC", focus: "MENA Regional Hub", timezone: "AST", x: "61.08%", y: "58.22%" },
                    { id: "au", name: "Australia", focus: "APAC Delivery", timezone: "AEST", x: "82.34%", y: "82.47%" }
                ]
            };
            return {
                ...defaults,
                ...raw,
                sectionTag: raw.sectionTag || raw.section?.badge || defaults.sectionTag,
                titleIntro: raw.titleIntro || raw.section?.headlinePrefix || defaults.titleIntro,
                titleHighlight: raw.titleHighlight || raw.section?.headlineHighlight || defaults.titleHighlight,
                description: raw.description || raw.section?.description || defaults.description,
                ctaText: raw.ctaText || defaults.ctaText,
                ctaHref: raw.ctaHref || defaults.ctaHref,
                mapSrc: raw.mapSrc || defaults.mapSrc,
                mapAlt: raw.mapAlt || defaults.mapAlt,
                hubs: Array.isArray(raw.hubs) && raw.hubs.length > 0 ? raw.hubs : defaults.hubs
            };
        })(),

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
        faq: (() => {
            const raw = getSafe(completeData, 'faq', {});
            const defaults = {
                sectionTag: "FREQUENTLY ASKED QUESTIONS",
                titleIntro: "Common Questions,",
                titleHighlight: "Clear Answers",
                description: "Everything you need to know about our modern engineering process, turnaround times, and pricing models.",
                strategyAudit: {
                    badge: "FREE ARCHITECTURE AUDIT",
                    title: "Have a complex custom build in mind?",
                    desc: "Book a 30-minute high-level technical strategy session with our lead engineer.",
                    button: "Book Architecture Call",
                    href: "#contact"
                },
                list: [
                    {
                        question: "What is your typical project timeline?",
                        answer: "Most custom web applications, high-converting marketing sites, and bespoke CMS builds launch within 2 to 4 weeks depending on scope and integrations.",
                        category: "TIMELINE & PROCESS"
                    },
                    {
                        question: "How do you handle ongoing maintenance and support?",
                        answer: "We offer dedicated monthly SLA maintenance packages covering continuous security patches, performance audits, technical SEO adjustments, and feature iterations.",
                        category: "SUPPORT & SLA"
                    },
                    {
                        question: "Do you build custom CMS integrations?",
                        answer: "Yes! We specialize in lightweight, lightning-fast custom CMS dashboards tailored strictly to your team's workflow without bloating the codebase.",
                        category: "ENGINEERING"
                    },
                    {
                        question: "What tech stack do you recommend for high-scale apps?",
                        answer: "Our primary stack centers on Next.js (App Router), TypeScript, Tailwind CSS / Vanilla CSS, Framer Motion, and scalable MongoDB or PostgreSQL architectures.",
                        category: "TECHNOLOGY"
                    },
                    {
                        question: "How does the pricing and billing structure work?",
                        answer: "We operate on fixed-price milestone deliverables for well-defined scopes and transparent weekly sprints for fast-moving agile product development.",
                        category: "PRICING"
                    }
                ]
            };
            return {
                ...defaults,
                ...raw,
                sectionTag: raw.sectionTag || raw.section?.badge || defaults.sectionTag,
                titleIntro: raw.titleIntro || raw.section?.headlinePrefix || defaults.titleIntro,
                titleHighlight: raw.titleHighlight || raw.section?.headlineHighlight || defaults.titleHighlight,
                description: raw.description || raw.section?.description || defaults.description,
                strategyAudit: {
                    ...defaults.strategyAudit,
                    ...(raw.strategyAudit || {})
                },
                list: (Array.isArray(raw.list) && raw.list.length > 0)
                    ? raw.list
                    : (Array.isArray(raw.items) && raw.items.length > 0 ? raw.items : defaults.list)
            };
        })(),
        blogSection: (() => {
            const raw = getSafe(completeData, 'blogSection', {});
            const defaults = {
                sectionTag: "LATEST ARTICLES & INSIGHTS",
                titleIntro: "Thinking, Strategies &",
                titleHighlight: "Industry Insights",
                description: "Explore our latest thoughts on high-performance web engineering, modern UI/UX design architectures, and conversion rate optimization.",
                featuredLabel: "Read Full Article",
                dateSeparator: " • ",
                selectedPosts: []
            };
            return {
                ...defaults,
                ...raw,
                sectionTag: raw.sectionTag || raw.subtitle || defaults.sectionTag,
                titleIntro: raw.titleIntro || defaults.titleIntro,
                titleHighlight: raw.titleHighlight || raw.title || defaults.titleHighlight,
                description: raw.description || defaults.description,
                featuredLabel: raw.featuredLabel || defaults.featuredLabel,
                dateSeparator: raw.dateSeparator || defaults.dateSeparator,
                selectedPosts: Array.isArray(raw.selectedPosts) ? raw.selectedPosts : defaults.selectedPosts
            };
        })(),
        allBlogs: Array.isArray(completeData?.allBlogs) ? completeData.allBlogs : [],
    };
};
