import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Client logos in public/uploads/wp-media/
const CLIENT_LOGOS = [
  { name: 'American Stone Sealer', logo: '/uploads/wp-media/American-Stone-Sealer.jpg' },
  { name: 'Redtail Roofing', logo: '/uploads/wp-media/Redtail-Roofing.jpg' },
  { name: 'Raise Up Youth', logo: '/uploads/wp-media/Raise-Up-Youth.jpg' },
  { name: 'Precision Gutters', logo: '/uploads/wp-media/Precision-Gutters.jpg' },
  { name: 'Dessert Performance Part', logo: '/uploads/wp-media/Dessert-Performance-Part.jpg' },
  { name: 'Corporate Hiring Solutions', logo: '/uploads/wp-media/Corporate-Hiring-Solutions.jpg' },
  { name: 'Cooper Land Management', logo: '/uploads/wp-media/Cooper-Land-Management.jpg' },
  { name: 'Burks Wood milling', logo: '/uploads/wp-media/Burks-Wood-milling.jpg' },
  { name: 'Adams Pipe And Plumbing', logo: '/uploads/wp-media/Adams-Pipe-And-Plumbing.jpg' },
  { name: 'All Stars Exteriors', logo: '/uploads/wp-media/All-Stars-Exteriors.jpg' }
];

function cleanText(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&#8216;/g, "'").replace(/\s+/g, ' ').trim();
}

function parseState(state, allPages) {
  const html = state.content || '';

  // 1. Hero H1 and Description
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1 = h1Match ? cleanText(h1Match[1]) : state.title;

  let heroDesc = '';
  if (h1Match) {
    const afterH1 = html.substring(h1Match.index + h1Match[0].length, h1Match.index + 4000);
    const pMatch = afterH1.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    if (pMatch) {
      heroDesc = cleanText(pMatch[1]);
    }
  }

  // 2. Services: Title and list
  const servicesH2Match = html.match(/<h2[^>]*>([\s\S]*?(?:Services|Stack|Turn|Intent|Campaigns|Demands)[\s\S]*?)<\/h2>/i);
  const servicesTitle = servicesH2Match ? cleanText(servicesH2Match[1]) : 'Our Services';

  // Extract services from <h3><a ...>Title</a></h3> <p>desc</p>
  const rawServiceMatches = [...html.matchAll(/<h3>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)];
  const servicesList = [];

  const knownServices = [
    'Search Engine Optimization',
    'Content Marketing',
    'Google Ads (PPC)',
    'Meta Ads',
    'Social Media Management',
    'GMB Optimization',
    'Logo Design',
    'Graphic Design',
    'Website Development',
    'UI/UX Design',
    'App Development'
  ];

  for (const m of rawServiceMatches) {
    const t = cleanText(m[1]);
    const d = cleanText(m[2]);
    if (knownServices.some(k => k.toLowerCase() === t.toLowerCase())) {
      servicesList.push({
        title: t,
        category: 'Service',
        tag: 'Service',
        desc: d,
        slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });
    }
  }

  // Fallback to standard 11 services if none parsed
  if (servicesList.length === 0) {
    knownServices.forEach(t => {
      servicesList.push({
        title: t,
        category: 'Growth',
        tag: 'Growth',
        desc: `High-impact ${t} engineered to drive local leads and conversions across your market.`,
        slug: t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });
    });
  }

  // 3. Case Studies:
  // Look for Burish Builders / Roof Improvement, Blue Sky, Palco, 410 Muscle
  const caseStudies = [];
  const csCandidates = [
    {
      name: 'Roof Improvement & Services',
      altName: 'Burish Builders',
      mockup: html.includes('roof-improvement') ? '/uploads/wp-media/roof-improvement-mockup-1024x819.webp' : '/uploads/wp-media/burish-builder-mockup.png'
    },
    {
      name: 'Blue Sky Pediatrics',
      altName: 'Blue Sky Pediatrics',
      mockup: '/uploads/wp-media/blue-sky-mockup.webp'
    },
    {
      name: 'Palco Claims',
      altName: 'Palco Claims',
      mockup: '/uploads/wp-media/Palco-mockup.webp'
    },
    {
      name: '410 Muscle Therapy',
      altName: 'Company Name: 410 Muscle Therapy',
      mockup: '/uploads/wp-media/410-mockup.webp'
    }
  ];

  for (const cand of csCandidates) {
    let searchName = cand.name;
    let idx = html.indexOf(searchName);
    if (idx === -1 && cand.altName) {
      searchName = cand.altName;
      idx = html.indexOf(searchName);
    }

    if (idx !== -1) {
      const chunk = html.substring(idx, idx + 1400);
      const challengeMatch = chunk.match(/The Challenge:?\s*([\s\S]*?)(?=What We Did|The Result|<\/div>|<h\d)/i);
      const approachMatch = chunk.match(/What We Did:?\s*([\s\S]*?)(?=The Result|<\/div>|<h\d)/i);
      const resultMatch = chunk.match(/The Result:?\s*([\s\S]*?)(?=<\/div>|<h\d|<section|$)/i);

      const challenge = challengeMatch ? cleanText(challengeMatch[1]) : 'Client needed elevated digital positioning and a high-converting presence.';
      const approach = approachMatch ? cleanText(approachMatch[1]) : 'Engineered a modern web platform, technical SEO architecture, and strategic lead funnels.';
      const result = resultMatch ? cleanText(resultMatch[1]) : 'Substantial growth in qualified monthly leads and top-tier search visibility.';

      caseStudies.push({
        brand: cand.name.replace('Company Name: ', ''),
        title: cand.name.replace('Company Name: ', ''),
        subtitle: 'Verified Case Study',
        desc: challenge,
        challenge,
        approach,
        whatWeDid: approach,
        image: cand.mockup,
        stats: [
          { label: 'Growth', value: '+200%', iconName: 'TrendingUp' },
          { label: 'Leads', value: 'Record High', iconName: 'Users' },
          { label: 'Timeline', value: '4-6 Months', iconName: 'Award' }
        ]
      });
    }
  }

  // 4. Why Choose Us
  const whyChooseH2Match = html.match(/<h2[^>]*>([\s\S]*?Why[\s\S]*?)<\/h2>/i);
  const whyChooseTitle = whyChooseH2Match ? cleanText(whyChooseH2Match[1]) : `Why Choose Us in ${state.title}`;

  // Look for why choose reasons from <h3>
  const reasonMatches = [...html.matchAll(/<h3>\s*([\s\S]*?)\s*<\/h3>\s*<p>([\s\S]*?)<\/p>/gi)]
    .map(m => ({ title: cleanText(m[1]), desc: cleanText(m[2]) }))
    .filter(r => !knownServices.some(k => k.toLowerCase() === r.title.toLowerCase()) && !r.title.includes('Facebook') && !r.title.includes('Whatsapp') && !r.title.includes('Call Us') && !r.title.includes('Email') && r.title.length < 50 && r.desc.length > 20);

  const reasons = (reasonMatches.length >= 3 ? reasonMatches.slice(0, 5) : [
    { title: '95%+ Client Retention Rate', desc: 'Over ninety percent return for more projects because the results are real and easy to track.' },
    { title: 'Zero Outsourcing', desc: 'Every project runs in-house from first sketch to final launch with zero middlemen.' },
    { title: '7+ Years and 3,000+ Clients', desc: 'Serving ambitious businesses across 50+ industries worldwide since 2019.' },
    { title: 'Proven Revenue Impact', desc: 'Over five million dollars in revenue generated for clients through smart strategy.' },
    { title: 'Clear, Honest Communication', desc: 'Transparent updates, direct collaboration, and dedicated support every step of the way.' }
  ]).map((r, idx) => ({
    num: String(idx + 1).padStart(2, '0'),
    title: r.title,
    desc: r.desc,
    description: r.desc,
    iconName: idx === 0 ? 'Award' : idx === 1 ? 'Shield' : idx === 2 ? 'Sparkles' : idx === 3 ? 'TrendingUp' : 'Rocket'
  }));

  // 5. Service Area & Cities
  const serviceAreaH2Match = html.match(/<h2[^>]*>([\s\S]*?(?:Everywhere|Metro|Lands Fastest|Areas|Regions|Serve)[\s\S]*?)<\/h2>/i);
  const serviceAreaTitle = serviceAreaH2Match ? cleanText(serviceAreaH2Match[1]) : `Serving Every Metro Region`;

  const childCities = allPages.filter(p => p.parent === state.id).map(c => ({
    id: `hub-${state.slug}-${c.slug}`,
    name: `${cleanText(c.title).replace(/^Digital Marketing (?:Agency|Company|Services)\s*(?:in\s*)?/i, '')}, USA`,
    focus: 'Commercial & Economic Hub',
    timezone: 'EST / CST',
    link: c.permalink
  }));

  // 6. FAQs: Exactly 10 questions and answers
  const faqs = [...html.matchAll(/<summary[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/gi)].map(m => {
    const q = cleanText(m[1]).replace(/^\d+\.\s*/, '');
    const a = cleanText(m[2]);
    return { question: q, answer: a, category: 'GENERAL' };
  });

  // 7. Determine Primary Slug (e.g. usa/florida, usa/texas, australia/nsw)
  let primarySlug = state.slug;
  if (state.permalink?.includes('/usa/')) {
    primarySlug = `usa/${state.slug}`;
  } else if (state.permalink?.includes('/australia/')) {
    primarySlug = `australia/${state.slug}`;
  } else if (state.permalink?.includes('/new-zealand/')) {
    primarySlug = `new-zealand/${state.slug}`;
  }

  return {
    slug: primarySlug,
    aliasSlug: state.slug,
    title: state.title,
    template: 'state',
    status: 'published',
    seo: {
      metaTitle: `${state.title} | Growth & Results`,
      metaDescription: heroDesc ? heroDesc.substring(0, 160) : `Grow with Mohsin Designs in ${state.title}. SEO, web design, and branding that drives real results.`,
      focusKeyword: `${state.title} digital marketing agency`,
      canonicalUrl: state.permalink,
      metaRobotsIndex: 'index',
      metaRobotsFollow: 'follow',
      ogTitle: `${state.title} | Growth & Results`,
      ogDescription: heroDesc ? heroDesc.substring(0, 160) : `Grow with Mohsin Designs in ${state.title}.`,
      ogImage: '/uploads/wp-media/hero-image-1.webp',
      twitterCard: 'summary_large_image',
      twitterTitle: `${state.title} | Growth & Results`,
      twitterDescription: heroDesc ? heroDesc.substring(0, 160) : `Grow with Mohsin Designs in ${state.title}.`,
      twitterImage: '/uploads/wp-media/hero-image-1.webp',
      breadcrumbTitle: state.title.replace(/^(?:Digital Marketing (?:Company|Agency)\s*(?:in\s*)?)|(?:\s*Digital Marketing Agency)$/gi, '').trim() || state.title
    },
    content: {
      hero: {
        enabled: true,
        badge: 'Trusted by 3,000+ US Businesses',
        titleLine1: h1,
        titleLine2: '',
        titleConnector: '',
        titleHighlight: '',
        description: `<p>${heroDesc}</p>`,
        image: '/uploads/wp-media/hero-image-1.webp',
        bgImage: '/uploads/wp-media/hero-image-1.webp',
        buttons: [
          { text: 'Get A Free Quote', href: '#contact', primary: true },
          { text: 'Our Services', href: '#services', primary: false }
        ]
      },
      about: { enabled: false },
      aboutOwner: { enabled: false },
      services: {
        enabled: true,
        sectionTag: 'OUR SERVICES',
        titleIntro: servicesTitle,
        titleHighlight: '',
        description: 'A complete growth stack built to capture high-intent buyers across your market.',
        list: servicesList
      },
      portfolio: {
        enabled: true,
        sectionTag: 'CASE STUDIES',
        titleIntro: 'Tracked Wins Proving ',
        titleHighlight: 'Real Growth Happens',
        description: 'Watching a business turn the corner never gets old. Here is proof of our revenue-centric execution:',
        projects: caseStudies
      },
      trustedBrands: {
        enabled: true,
        sectionTag: 'TRUSTED PARTNERS',
        title: 'Trusted By Leading Brands',
        subtitle: 'Here are some of the brands that rely on our creative and digital expertise.',
        brands: CLIENT_LOGOS
      },
      whyChooseUs: {
        enabled: true,
        sectionTag: 'Methodology',
        titleIntro: whyChooseTitle,
        titleHighlight: '',
        subtext: 'We combine precision design, rock-solid engineering, and conversion strategy to build digital experiences that deliver real, measurable growth.',
        stats: [
          { value: '95%', label: 'Client Retention Rate', sublabel: 'Over 90% of clients return for more projects', percentage: 0.99 },
          { value: '0', label: 'Outsourcing', sublabel: 'Every project runs 100% in-house with zero middlemen', percentage: 0.95 },
          { value: '3K+', label: 'Clients Served', sublabel: 'Over 3,000 clients across 50+ industries worldwide', percentage: 0.9 }
        ],
        reasons
      },
      serviceArea: {
        enabled: true,
        titleIntro: serviceAreaTitle,
        titleHighlight: '',
        description: `Serving ambitious local and regional businesses throughout ${state.title}.`,
        ctaText: "Let's Work Together",
        ctaHref: '/contact-us',
        hubs: childCities
      },
      faqs,
      testimonials: {
        enabled: true,
        sectionTag: 'CLIENT PRAISE & REVIEWS',
        titleIntro: 'Trusted by Local Owners, ',
        titleHighlight: 'Proven by Real Reviews',
        description: 'Verified Google reviews from businesses and partners who trust Mohsin Designs for their digital growth.',
        scorecardRating: '5.0/5',
        scorecardRatingLabel: 'OVERALL',
        scorecardTitle: 'TOP RATED ENGINEERING & MARKETING',
        scorecardSub: 'VERIFIED 5-STAR REVIEWS ON GOOGLE',
        reviews: [
          {
            id: `rev-${state.slug}-1`,
            name: 'Cayne Seymour',
            role: 'Business Owner',
            company: 'Google Verified Review',
            quote: 'Great work and detail!',
            rating: 5,
            column: 1,
            avatarBg: 'bg-[#0306AC]'
          },
          {
            id: `rev-${state.slug}-2`,
            name: 'Kayla Lynn',
            role: 'Client',
            company: 'Google Verified Review',
            quote: 'We used Mohsin Designs for our website and 10000% recommend Muhammad. He was so patient with us and really brought our vision to life. He was super helpful and we will definitely use him in the future!',
            rating: 5,
            column: 1,
            avatarBg: 'bg-emerald-600'
          }
        ]
      },
      contact: {
        enabled: true,
        title: 'Let’s Build Something You’re Proud Of!',
        description: 'No corporate jargon. No cookie-cutter templates. Just quality design and marketing, done with care, for people who care about their business.'
      }
    },
    updatedAt: new Date()
  };
}

async function bulkSeedStates() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'mdseo2025';

  if (!uri) {
    console.error('MONGODB_URI is not set in .env.local');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const pagesCol = db.collection('pages');

    const raw = JSON.parse(fs.readFileSync('wp_state_pages.json', 'utf8'));
    const allPages = raw.pages || [];
    const countryIds = [103517, 103544, 103526];
    const statePages = allPages.filter(p => countryIds.includes(p.parent));

    console.log(`🚀 Starting bulk seeding for ${statePages.length} state pages into MongoDB (${dbName})...`);

    let seededCount = 0;

    for (const state of statePages) {
      const parsedDoc = parseState(state, allPages);
      const { aliasSlug, ...mainDoc } = parsedDoc;

      // 1. Upsert primary hierarchical slug (e.g. usa/florida)
      delete mainDoc._id;
      await pagesCol.updateOne(
        { slug: mainDoc.slug },
        { $set: mainDoc },
        { upsert: true }
      );

      // 2. Upsert alias slug (e.g. florida)
      if (aliasSlug && aliasSlug !== mainDoc.slug) {
        const aliasDoc = { ...mainDoc, slug: aliasSlug };
        delete aliasDoc._id;
        await pagesCol.updateOne(
          { slug: aliasSlug },
          { $set: aliasDoc },
          { upsert: true }
        );
      }

      seededCount++;
      console.log(`✅ [${seededCount}/${statePages.length}] Seeded: /${mainDoc.slug} (alias: /${aliasSlug}) - "${mainDoc.title}"`);
    }

    console.log(`\n🎉 All ${seededCount} state pages have been successfully bulk-seeded into MongoDB!`);
  } catch (err) {
    console.error('❌ Bulk seeding error:', err);
  } finally {
    await client.close();
  }
}

bulkSeedStates();
