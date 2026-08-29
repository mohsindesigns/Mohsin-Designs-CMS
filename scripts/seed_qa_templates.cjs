const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'mdseo2025';

async function seedAllQATemplates() {
    if (!uri) {
        console.error("❌ MONGODB_URI not found in .env.local");
        process.exit(1);
    }

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log(`🔌 Connected to MongoDB (${dbName}) for QA Template Seeding...`);

        const db = client.db(dbName);
        const pagesCol = db.collection('pages');
        const postsCol = db.collection('posts');

        // 1. DUMMY BLOG POSTS
        const samplePosts = [
            {
                title: "How Next.js 15 Turbopack Accelerates Enterprise Architecture",
                slug: "how-nextjs-15-accelerates-enterprise-architecture",
                excerpt: "Discover how edge caching and modern React Server Components deliver lightning-fast Core Web Vitals.",
                content: "<h2>Next-Generation Web Performance</h2><p>Modern enterprise applications require sub-second load times. By implementing SSR and optimal caching headers, we achieve compounding conversion gains.</p><h3>Key Architectural Decisions</h3><ul><li>Zero-runtime overhead styling</li><li>Dynamic edge routing</li><li>Automated SEO JSON-LD schema generation</li></ul>",
                featuredImage: "/portfolio_card_1.png",
                category: "Engineering",
                author: { name: "Mohsin Lead Architect", role: "Principal Engineer", avatar: "/founder_portrait_nobg.png" },
                status: "published",
                readingTime: "5 min read",
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                title: "Conversion Science: Turning High-Intent Traffic into Revenue",
                slug: "conversion-science-high-intent-traffic-revenue",
                excerpt: "A deep dive into positioning maps, frictionless form funnels, and data attribution dashboards.",
                content: "<h2>The Mechanics of Conversion Yield</h2><p>Traffic alone does not scale a business; behavioral UX pathways and friction removal are the true levers of compounding growth.</p>",
                featuredImage: "/portfolio_card_2.png",
                category: "Growth Strategy",
                author: { name: "Mohsin Growth Team", role: "CRO Strategist", avatar: "/founder_portrait_nobg.png" },
                status: "published",
                readingTime: "4 min read",
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        for (const post of samplePosts) {
            await postsCol.updateOne(
                { slug: post.slug },
                { $set: post },
                { upsert: true }
            );
        }
        console.log(`✅ Seeded ${samplePosts.length} sample blog posts into 'posts' collection.`);

        // 2. COMPREHENSIVE TEMPLATE PAGES
        const qaPages = [
            // HOME TEMPLATE
            {
                slug: 'home',
                title: 'Home Page',
                template: 'home',
                status: 'published',
                seo: {
                    metaTitle: 'Mohsin Designs | Enterprise Digital Architecture & Growth',
                    metaDescription: 'High-performance web architecture, conversion optimization, and technical SEO for market leaders.',
                    canonicalUrl: 'https://mohsindesigns.com/',
                    metaRobotsIndex: 'index',
                    metaRobotsFollow: 'follow'
                },
                content: {},
                updatedAt: new Date()
            },

            // SERVICE DETAIL TEMPLATE 1: Custom Web Development
            {
                slug: 'services/custom-web-development',
                title: 'Custom Web Development & Engineering',
                template: 'service-detail',
                status: 'published',
                seo: {
                    metaTitle: 'Custom Web Development Services | Mohsin Designs',
                    metaDescription: 'Bespoke Next.js web application engineering tailored for speed, security, and maximum conversion rates.',
                    canonicalUrl: 'https://mohsindesigns.com/services/custom-web-development',
                    metaRobotsIndex: 'index',
                    metaRobotsFollow: 'follow'
                },
                content: {
                    serviceDetail: {
                        hero: {
                            eyebrowBadge: "ENTERPRISE WEB ENGINEERING",
                            titleIntro: "Architecting High-Yield",
                            titleHighlight: "Web Platforms",
                            titleSuffix: "For Market Leaders",
                            description: "We engineer bespoke digital platforms built on Next.js, headless architectures, and conversion-first UI/UX to maximize your enterprise revenue.",
                            primaryCtaText: "Request Technical Audit",
                            primaryCtaLink: "#contact",
                            secondaryCtaText: "View Live Showreel",
                            secondaryCtaLink: "/gallery",
                            heroImage: "/portfolio_card_1.png",
                            liveBadge: {
                                label: "PRODUCTION READY // 99.9% UPTIME",
                                sublabel: "Next.js 15 Turbopack Architecture"
                            },
                            statsPills: [
                                { label: "Performance Score", value: "100/100" },
                                { label: "Avg. Conversion Uplift", value: "+320%" }
                            ]
                        },
                        overview: {
                            eyebrow: "01 // OVERVIEW",
                            heading: "Engineering Without Compromise",
                            description: "We don't build generic websites. We build lightning-fast, high-converting revenue engines tailored to your exact business operations.",
                            keyTakeaways: [
                                "Sub-second Page Load Times via Edge Caching",
                                "Full ADA & WCAG Compliance Built-in",
                                "Zero Technical Debt & Modular React Codebase"
                            ],
                            cardHeading: "Core Architecture Highlights",
                            cardFeatures: [
                                { title: "Headless CMS Integration", desc: "Intuitive content publishing with complete editorial freedom." },
                                { title: "Real-time Analytics", desc: "Live event tracking, heatmaps, and conversion funnels." }
                            ]
                        },
                        whatIncluded: {
                            eyebrow: "02 // DELIVERABLES",
                            titleIntro: "What's Included in",
                            titleHighlight: "Our Engagement",
                            pillars: [
                                {
                                    title: "Full-Stack Custom Architecture",
                                    desc: "Custom TypeScript, Next.js, Node APIs, and MongoDB database modeling.",
                                    features: ["Responsive Breakpoints", "SSR & ISR Caching", "API Gateway Setup"]
                                },
                                {
                                    title: "Conversion Optimization & UX",
                                    desc: "Frictionless form flows and psychological triggers to capture leads.",
                                    features: ["Dynamic Quick Quotes", "Interactive Calculators", "Trust Signal Grids"]
                                }
                            ]
                        },
                        benefits: {
                            eyebrow: "03 // ADVANTAGES",
                            titleIntro: "Business Impact &",
                            titleHighlight: "Compounding ROI",
                            list: [
                                { metric: "350%", title: "Organic Visibility", desc: "Top search ranking through automated structured JSON-LD data." },
                                { metric: "4.8x", title: "Lead Generation", desc: "Conversion funnels designed to turn clicks into booked clients." }
                            ]
                        },
                        process: {
                            eyebrow: "04 // PROCESS",
                            titleIntro: "Our Step-by-Step",
                            titleHighlight: "Roadmap",
                            description: "A transparent, milestone-driven execution cycle with real-time progress reports.",
                            steps: [
                                { title: "Technical Diagnostic", desc: "Audit existing assets, bottlenecks, and competitor positioning.", phaseTag: "PHASE 01" },
                                { title: "Rapid Development Sprint", desc: "Component development and high-speed API integration.", phaseTag: "PHASE 02" },
                                { title: "QA & Production Deployment", desc: "Rigorous cross-browser verification, lighthouse audits, and live launch.", phaseTag: "PHASE 03" }
                            ]
                        },
                        faqs: [
                            { q: "How long does a typical custom build take?", a: "Most enterprise projects are delivered in 4 to 6 weeks with weekly sprint checkpoints." },
                            { q: "Do you offer post-launch maintenance?", a: "Yes, our team provides 24/7 telemetry monitoring, security patches, and ongoing optimizations." }
                        ],
                        finalCta: {
                            eyebrow: "ACCELERATE YOUR REVENUE",
                            titleIntro: "Ready to Upgrade Your",
                            titleHighlight: "Digital Edge?",
                            titleLine2: "Let's Build It Together.",
                            description: "Book a complimentary 30-minute discovery session with our lead architect.",
                            primaryCtaText: "Schedule Discovery Session",
                            primaryCtaLink: "/contact-us",
                            secondaryCtaText: "Call Us Direct",
                            secondaryCtaLink: "tel:+16145550199",
                            founderImage: "/founder_portrait_nobg.png"
                        }
                    }
                },
                updatedAt: new Date()
            },

            // SERVICES OVERVIEW TEMPLATE
            {
                slug: 'services',
                title: 'Our Services & Capabilities',
                template: 'services',
                status: 'published',
                seo: {
                    metaTitle: 'Services & Digital Solutions | Mohsin Designs',
                    metaDescription: 'Explore our full suite of enterprise digital engineering, technical SEO, and conversion design services.',
                    canonicalUrl: 'https://mohsindesigns.com/services'
                },
                content: {},
                updatedAt: new Date()
            },

            // SERVICE AREA / LOCATION OVERVIEW TEMPLATE
            {
                slug: 'service-area',
                title: 'Service Areas & Coverage',
                template: 'service-area',
                status: 'published',
                seo: {
                    metaTitle: 'Service Areas | Mohsin Designs',
                    metaDescription: 'Serving commercial and residential clients across major metropolitan hubs.',
                    canonicalUrl: 'https://mohsindesigns.com/service-area'
                },
                content: {},
                updatedAt: new Date()
            },

            // LOCATION DETAIL TEMPLATE: Columbus, OH
            {
                slug: 'location/columbus-ohio',
                title: 'Columbus, OH Digital Agency & Engineering',
                template: 'location',
                status: 'published',
                seo: {
                    metaTitle: 'Columbus OH Web Development & Design | Mohsin Designs',
                    metaDescription: 'Top-tier digital solutions, SEO, and web engineering serving Columbus, Ohio and surrounding regions.',
                    canonicalUrl: 'https://mohsindesigns.com/location/columbus-ohio'
                },
                content: {
                    locationPage: {
                        hero: {
                            eyebrow: "COLUMBUS, OHIO HUB",
                            titleIntro: "Transforming Businesses in ",
                            titleHighlight: "Columbus, Ohio.",
                            description: "Empowering central Ohio brands with modern web architecture and high-velocity lead generation.",
                            ctaPrimaryText: "Explore Projects",
                            ctaPrimaryHref: "/gallery",
                            ctaSecondaryText: "Contact Columbus Team",
                            ctaSecondaryHref: "/contact-us",
                            bgLight: "/locationhero.png",
                            bgDark: "/locationhero.png",
                            stats: [
                                { value: "150+", label: "Columbus Clients", iconName: "Users" },
                                { value: "99.8%", label: "Satisfaction Rate", iconName: "Star" },
                                { value: "10+", label: "Years in Ohio", iconName: "Trophy" }
                            ]
                        },
                        cityInfo: {
                            cityName: "Columbus",
                            stateName: "Ohio",
                            zipCodes: ["43215", "43201", "43202", "43210", "43235"],
                            address: "100 S High St, Columbus, OH 43215",
                            phone: "(614) 555-0199",
                            email: "columbus@mohsindesigns.com",
                            mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d195601.21855673197!2d-83.13627447477546!3d39.98302008779659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x883889c1b990de71%3A0xe43266f8cfb1b533!2sColumbus%2C%20OH!5e0!3m2!1sen!2sus!4v1700000000000"
                        },
                        localHighlights: [
                            { title: "Downtown & Short North", desc: "Supporting retail, hospitality, and tech startups." },
                            { title: "Dublin & Upper Arlington", desc: "High-end corporate portals and medical practice systems." }
                        ]
                    }
                },
                updatedAt: new Date()
            },

            // ABOUT TEMPLATE (Legacy / Classic)
            {
                slug: 'about',
                title: 'About Mohsin Designs',
                template: 'about',
                status: 'published',
                seo: {
                    metaTitle: 'About Us | Mohsin Designs',
                    metaDescription: 'Learn about our journey, vision, and obsessive commitment to engineering craftsmanship.',
                    canonicalUrl: 'https://mohsindesigns.com/about'
                },
                content: {
                    hero: {
                        headline: {
                            line1: "Crafting High-Impact",
                            line2: "Digital Experiences",
                            line3: "Built to Outperform."
                        },
                        description: "Founded on the belief that clean code and scientific UX drive real business outcomes.",
                        cta: "Get in Touch",
                        ctaLink: "/contact-us",
                        trustLabel: "Trusted by 200+ Businesses Worldwide",
                        stats: [
                            { label: "Client Retention", val: "98%", icon: "Shield" },
                            { label: "Projects Delivered", val: "500+", icon: "Award" }
                        ]
                    }
                },
                updatedAt: new Date()
            },

            // NEW ABOUT TEMPLATE
            {
                slug: 'about-us',
                title: 'About Our Firm',
                template: 'new-about',
                status: 'published',
                seo: {
                    metaTitle: 'Our Firm & Philosophy | Mohsin Designs',
                    metaDescription: 'A modern collective of architects, designers, and growth engineers.',
                    canonicalUrl: 'https://mohsindesigns.com/about-us'
                },
                content: {
                    aboutPage: {
                        hero: {
                            badgeText: "ABOUT MOHSIN DESIGNS",
                            titleLine1: "We Engineer Compounding",
                            titleHighlight: "Digital Advantages.",
                            description: "Merging architectural precision with behavioral design to build market-dominating brands.",
                            ctaPrimaryText: "Explore Our Portfolio",
                            ctaPrimaryHref: "/gallery",
                            ctaSecondaryText: "Our Methodology",
                            ctaSecondaryHref: "/services"
                        },
                        stats: {
                            eyebrow: "OUR TRACK RECORD",
                            titleIntro: "Proven Results & ",
                            titleHighlight: "Compounding Growth",
                            description: "Metrics measured across dozens of deployed client platforms.",
                            metrics: [
                                { value: 99, suffix: "%", label: "Client Satisfaction", sublabel: "Verified across all client engagements" },
                                { value: 12, suffix: "+", label: "Years Experience", sublabel: "Leading enterprise engineering sprints" }
                            ]
                        }
                    }
                },
                updatedAt: new Date()
            },

            // TEAM TEMPLATE
            {
                slug: 'about/team',
                title: 'Meet Our Leadership & Engineering Team',
                template: 'team',
                status: 'published',
                seo: {
                    metaTitle: 'Our Team | Mohsin Designs',
                    metaDescription: 'Meet the architects, engineers, and creatives powering Mohsin Designs.',
                    canonicalUrl: 'https://mohsindesigns.com/about/team'
                },
                content: {
                    team: {
                        section: {
                            badge: "LEADERSHIP & ARCHITECTS",
                            headlinePrefix: "The Minds Behind",
                            headlineHighlight: "Exceptional Delivery",
                            headlineSuffix: "",
                            description: "Our multidisciplinary team combines decades of specialized engineering, conversion strategy, and creative execution."
                        },
                        members: [
                            {
                                id: "1",
                                name: "Mohsin Lead Architect",
                                role: "Founder & Chief Architect",
                                description: "With 12+ years in full-stack cloud engineering and conversion design, Mohsin oversees architecture and high-performance delivery.",
                                image: "/founder_portrait_nobg.png",
                                badge1: "Principal Architect",
                                badge2: "12+ Years Exp",
                                linkedin: "https://linkedin.com",
                                email: "mohsin@mohsindesigns.com"
                            },
                            {
                                id: "2",
                                name: "Sarah Jenkins",
                                role: "Head of Product & UX",
                                description: "Specializes in behavioral user flow design, wireframing, and accessibility optimization.",
                                image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80",
                                badge1: "UX Strategist",
                                badge2: "Award Winner",
                                linkedin: "https://linkedin.com",
                                email: "sarah@mohsindesigns.com"
                            }
                        ]
                    }
                },
                updatedAt: new Date()
            },

            // CAREERS TEMPLATE
            {
                slug: 'about/careers',
                title: 'Join Our Team & Careers',
                template: 'careers',
                status: 'published',
                seo: {
                    metaTitle: 'Careers | Mohsin Designs',
                    metaDescription: 'Join our team of elite developers, designers, and growth experts.',
                    canonicalUrl: 'https://mohsindesigns.com/about/careers'
                },
                content: {
                    careers: {
                        section: {
                            badge: "CAREERS AT MOHSIN DESIGNS",
                            headline: "Build the Future with Us",
                            description: "We are always looking for passionate engineers, creative designers, and problem solvers."
                        },
                        labels: {
                            name: "Full Name",
                            email: "Email Address",
                            phone: "Phone Number",
                            role: "Applying For Position",
                            roleSelector: "Choose Open Role...",
                            attachment: "Attach Resume / Portfolio (PDF)",
                            attachmentPlaceholder: "Upload your CV (PDF max 10MB)",
                            summary: "Cover Letter / Why You?"
                        },
                        roles: [
                            { label: "Senior Full-Stack Next.js Engineer", value: "senior-nextjs-engineer" },
                            { label: "Lead UI/UX & Figma Designer", value: "ui-ux-designer" },
                            { label: "Technical SEO & Growth Specialist", value: "seo-growth-specialist" }
                        ],
                        success: {
                            title: "Application Received!",
                            description: "Thank you for applying. Our talent team will review your submission and contact you shortly."
                        }
                    }
                },
                updatedAt: new Date()
            },

            // REVIEWS TEMPLATE
            {
                slug: 'reviews',
                title: 'Client Reviews & Case Studies',
                template: 'reviews',
                status: 'published',
                seo: {
                    metaTitle: 'Reviews & Testimonials | Mohsin Designs',
                    metaDescription: 'Read real verified client feedback, video testimonials, and success metrics.',
                    canonicalUrl: 'https://mohsindesigns.com/reviews'
                },
                content: {},
                updatedAt: new Date()
            },

            // FAQ TEMPLATE
            {
                slug: 'faq',
                title: 'Frequently Asked Questions',
                template: 'faq',
                status: 'published',
                seo: {
                    metaTitle: 'FAQ | Mohsin Designs',
                    metaDescription: 'Find answers to common questions regarding timelines, development stack, and pricing.',
                    canonicalUrl: 'https://mohsindesigns.com/faq'
                },
                content: {
                    faqTitle: "Frequently Asked Questions",
                    faqDescription: "Everything you need to know about our development process, tech stack, and deliverables.",
                    faqBadge: "HELP & SUPPORT",
                    faqs: [
                        { question: "What technologies do you build with?", answer: "We primarily build with Next.js, React, TypeScript, TailwindCSS, and Node.js, backed by MongoDB and cloud edge architectures." },
                        { question: "How does the revision and review process work?", answer: "Every project includes staged development previews with collaborative feedback rounds before production launch." },
                        { question: "Are your websites optimized for mobile and SEO?", answer: "Yes! 100% of our code is mobile-responsive, Core Web Vitals optimized, and populated with rich JSON-LD schema." }
                    ]
                },
                updatedAt: new Date()
            },

            // GALLERY TEMPLATE
            {
                slug: 'gallery',
                title: 'Portfolio & Project Showcase',
                template: 'gallery',
                status: 'published',
                seo: {
                    metaTitle: 'Project Showcase & Gallery | Mohsin Designs',
                    metaDescription: 'Explore our latest web application launches, branding overhauls, and e-commerce platforms.',
                    canonicalUrl: 'https://mohsindesigns.com/gallery'
                },
                content: {
                    galleryPage: {
                        hero: {
                            badge: "PORTFOLIO & CASE STUDIES",
                            titlePrefix: "Precision Engineering.",
                            titleHighlight: "Real Growth.",
                            subtitle: "Explore our recent launches across e-commerce, enterprise SaaS, and bespoke digital platforms.",
                            ctaPrimary: { label: "Request Free Audit", href: "/contact-us" },
                            ctaSecondary: { label: "View Services", href: "/services" }
                        }
                    }
                },
                updatedAt: new Date()
            },

            // CONTACT TEMPLATE
            {
                slug: 'contact-us',
                title: 'Contact Us & Free Estimate',
                template: 'contact',
                status: 'published',
                seo: {
                    metaTitle: 'Contact Us | Mohsin Designs',
                    metaDescription: 'Get in touch with our team for a free strategy session and project estimate.',
                    canonicalUrl: 'https://mohsindesigns.com/contact-us'
                },
                content: {},
                updatedAt: new Date()
            },

            // BLOG INDEX TEMPLATE
            {
                slug: 'blog',
                title: 'Blog & Technical Insights',
                template: 'blog',
                status: 'published',
                seo: {
                    metaTitle: 'Blog & Engineering Insights | Mohsin Designs',
                    metaDescription: 'Read our latest articles on web performance, conversion science, and modern development.',
                    canonicalUrl: 'https://mohsindesigns.com/blog'
                },
                content: {},
                updatedAt: new Date()
            },

            // COUNTRY TEMPLATE
            {
                slug: 'country/united-states',
                title: 'United States Web Design & Engineering',
                template: 'country',
                status: 'published',
                seo: {
                    metaTitle: 'USA Web Development & Design Agency | Mohsin Designs',
                    metaDescription: 'Nationwide enterprise web engineering and digital transformation services.',
                    canonicalUrl: 'https://mohsindesigns.com/country/united-states'
                },
                content: {
                    hero: {
                        headline: { line1: "Nationwide Digital", line2: "Engineering & Growth", line3: "Across the US." },
                        description: "Serving enterprise businesses and high-growth startups across North America."
                    },
                    faqs: [
                        { question: "Do you service clients across all US time zones?", answer: "Yes, our team supports clients across EST, CST, MST, and PST." }
                    ]
                },
                updatedAt: new Date()
            },

            // STATE TEMPLATE
            {
                slug: 'state/ohio',
                title: 'Ohio Web Design & Development Services',
                template: 'state',
                status: 'published',
                seo: {
                    metaTitle: 'Ohio Web Development & SEO | Mohsin Designs',
                    metaDescription: 'Premier digital engineering agency serving Ohio businesses.',
                    canonicalUrl: 'https://mohsindesigns.com/state/ohio'
                },
                content: {
                    hero: {
                        headline: { line1: "Leading Web Engineering", line2: "Across Ohio", line3: "From Columbus to Cleveland." },
                        description: "Transforming regional businesses into statewide digital powerhouses."
                    },
                    faqs: [
                        { question: "Are in-person strategy sessions available in Ohio?", answer: "Yes, our team is based in Columbus and meets clients throughout Ohio." }
                    ]
                },
                updatedAt: new Date()
            },

            // INDUSTRY TEMPLATE
            {
                slug: 'industries/ecommerce-technology',
                title: 'E-Commerce & Digital Retail Architecture',
                template: 'industry',
                status: 'published',
                seo: {
                    metaTitle: 'E-Commerce Web Architecture & Engineering | Mohsin Designs',
                    metaDescription: 'High-yield headless commerce, conversion rate optimization, and custom store architectures.',
                    canonicalUrl: 'https://mohsindesigns.com/industries/ecommerce-technology',
                    metaRobotsIndex: 'index',
                    metaRobotsFollow: 'follow'
                },
                content: {
                    industryPage: {
                        hero: {
                            eyebrowBadge: "RETAIL & E-COMMERCE ARCHITECTURE",
                            titleIntro: "Engineering High-Velocity",
                            titleHighlight: "E-Commerce Platforms",
                            titleSuffix: "that Maximize Cart Yield",
                            description: "We build bespoke headless Shopify architectures, lightning-fast product catalogs, and frictionless checkout funnels tailored to high-volume commercial merchants.",
                            formTitle: "Request E-Commerce Growth Audit",
                            formSubtitle: "Speak directly with our principal conversion architect.",
                            formButtonText: "Get Free E-Commerce Strategy"
                        }
                    }
                },
                updatedAt: new Date()
            }
        ];

        console.log(`📦 Upserting ${qaPages.length} test pages across all template types...`);

        for (const page of qaPages) {
            await pagesCol.updateOne(
                { slug: page.slug },
                { $set: page },
                { upsert: true }
            );
            console.log(`   - Seeded /${page.slug} [Template: ${page.template}]`);
        }

        console.log(`\n🎉 Successfully seeded all ${qaPages.length} templates and QA pages in MongoDB!`);

    } catch (err) {
        console.error("❌ Error seeding QA templates:", err);
    } finally {
        await client.close();
    }
}

seedAllQATemplates();
