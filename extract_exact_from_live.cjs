const fs = require('fs');
const mongoose = require('mongoose');

const URI = 'mongodb://mdseo2025_db_user:UElPBA47l5oQf2oX@ac-rtmxchd-shard-00-00.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-01.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-02.havgrhc.mongodb.net:27017/mdseo2025?ssl=true&replicaSet=atlas-qtu58a-shard-0&authSource=admin';

const allServicesList = [
  { slug: 'google-ads-management', url: 'https://mohsindesigns.com/services/google-ads-management/', defaultTitle: 'Google Ads Management' },
  { slug: 'meta-ads-management', url: 'https://mohsindesigns.com/services/meta-ads-management/', defaultTitle: 'Meta Ads Management' },
  { slug: 'social-media-management', url: 'https://mohsindesigns.com/services/social-media-management/', defaultTitle: 'Social Media Management' },
  { slug: 'ui-ux-design', url: 'https://mohsindesigns.com/services/ui-ux-design/', defaultTitle: 'UI/UX Design' },
  { slug: 'website-design', url: 'https://mohsindesigns.com/services/website-design/', defaultTitle: 'Website Design' },
  { slug: 'content-marketing', url: 'https://mohsindesigns.com/services/content-marketing/', defaultTitle: 'Content Marketing' },
  { slug: 'gmb-optimization', url: 'https://mohsindesigns.com/services/gmb-optimization/', defaultTitle: 'GMB Optimization' },
  { slug: 'logo-design', url: 'https://mohsindesigns.com/services/logo-design/', defaultTitle: 'Logo Design' },
  { slug: 'graphic-design', url: 'https://mohsindesigns.com/services/graphic-design/', defaultTitle: 'Graphic Design' },
  { slug: 'app-development', url: 'https://mohsindesigns.com/services/app-development/', defaultTitle: 'App Development' }
];

function clean(t) {
  if (!t) return '';
  return t
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8211;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitHeading(h) {
  if (!h) return { intro: '', highlight: '' };
  const patterns = [' With ', ' That ', ' For ', ' Around ', ' Behind ', ' Across ', ' Into '];
  for (const p of patterns) {
    if (h.includes(p)) {
      const idx = h.indexOf(p);
      return {
        intro: h.substring(0, idx + p.length).trim(),
        highlight: h.substring(idx + p.length).trim()
      };
    }
  }
  const words = h.split(' ');
  if (words.length > 3) {
    return {
      intro: words.slice(0, words.length - 2).join(' '),
      highlight: words.slice(-2).join(' ')
    };
  }
  return { intro: h, highlight: '' };
}

async function extractExactService(item) {
  console.log(`\nFetching ${item.url}...`);
  const res = await fetch(item.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();

  // 1. Meta & Title
  const metaTitle = clean(html.match(/<title>([^<]*)<\/title>/i)?.[1] || `${item.defaultTitle} | Mohsin Designs`);
  const metaDescription = clean(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '');
  const h1 = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || item.defaultTitle);
  const h1Split = splitHeading(h1);

  // 2. Hero description
  const h1Idx = html.indexOf('<h1');
  const postH1 = h1Idx !== -1 ? html.substring(h1Idx, h1Idx + 5000) : html;
  const rawParas = [...postH1.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => clean(m[1]))
    .filter(p => p.length > 50 && !p.includes('Search Engine Optimization GMB') && !p.includes('Home » Services'));
  const heroDescription = rawParas.slice(0, 2).join('\n\n') || metaDescription;

  // 3. Hero bullets
  // Find list items in hero
  const heroUl = postH1.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let heroBullets = [];
  if (heroUl) {
    heroBullets = [...heroUl[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => clean(m[1])).filter(Boolean);
  }
  if (heroBullets.length === 0) {
    heroBullets = ["Research & Discovery", "Bespoke Strategy", "Precision Execution", "Dedicated Ongoing Support"];
  }

  // 4. Client Trust Section (H2 after hero)
  // Look for "Why Smart Teams Trust" or "Built For Owners"
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => ({ title: clean(m[1]), index: m.index }));

  // Find Section 2 (Client Trust)
  const trustH2 = h2Matches.find(h => h.title.toLowerCase().includes('trust') || h.title.toLowerCase().includes('built for'));
  let trustDesc = "From ambitious startups to established brands, we've delivered high-performing digital solutions for over 3,000 clients across 50+ industries, contributing more than $5M to the economy.";
  if (trustH2) {
    const chunk = html.substring(trustH2.index, trustH2.index + 2000);
    const p = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 30)[0];
    if (p) trustDesc = p;
  }

  // 5. Section 3: "Turns Clicks Into Customers" / "Turns Intent Into Income"
  const intentH2 = h2Matches.find(h => h.title.toLowerCase().includes('turns') || h.title.toLowerCase().includes('behind the scenes') || h.title.toLowerCase().includes('actually do'));
  let strategySplit = { intro: "How Strategic Execution", highlight: "Drives Growth" };
  let strategyDesc = "";
  let strategyComponents = [];
  if (intentH2) {
    strategySplit = splitHeading(intentH2.title);
    const chunk = html.substring(intentH2.index, intentH2.index + 3000);
    const p = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 40)[0];
    if (p) strategyDesc = p;

    // Get cards in this section
    const h3s = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    strategyComponents = h3s.slice(0, 4).map((m, i) => ({
      num: (i + 1).toString().padStart(2, '0'),
      title: clean(m[1]),
      desc: clean(m[2])
    }));
  }

  // 6. Section 4: What's Included / Solutions Shaped Around You (Pillars)
  const solutionsH2 = h2Matches.find(h => h.title.toLowerCase().includes('solutions') || h.title.toLowerCase().includes('services we tailor') || h.title.toLowerCase().includes('campaigns shaped') || h.title.toLowerCase().includes('web design services'));
  let whatSplit = { intro: "Comprehensive Solutions Built For", highlight: "Real Business Impact" };
  let whatDesc = "";
  let pillars = [];
  if (solutionsH2) {
    whatSplit = splitHeading(solutionsH2.title);
    const chunk = html.substring(solutionsH2.index, solutionsH2.index + 5000);
    const p = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 40)[0];
    if (p) whatDesc = p;

    const cards = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    pillars = cards.slice(0, 6).map(m => ({
      title: clean(m[1]),
      desc: clean(m[2]),
      features: []
    }));
  }

  // 7. Section 5: Why It Matters / Benefits
  const whyH2 = h2Matches.find(h => h.title.toLowerCase().includes('why') && (h.title.toLowerCase().includes('growth') || h.title.toLowerCase().includes('beats') || h.title.toLowerCase().includes('decides')));
  let benefitsSplit = { intro: "Key Commercial Advantages For", highlight: "Your Bottom Line" };
  let benefitsDesc = "";
  let benefitsList = [];
  if (whyH2) {
    benefitsSplit = splitHeading(whyH2.title);
    const chunk = html.substring(whyH2.index, whyH2.index + 4000);
    const p = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 40)[0];
    if (p) benefitsDesc = p;

    const cards = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    benefitsList = cards.slice(0, 4).map((m, i) => ({
      num: (i + 1).toString().padStart(2, '0'),
      title: clean(m[1]),
      desc: clean(m[2]),
      tag: "Advantage"
    }));
  }

  // 8. Section 6: Step By Step System / Process
  const processH2 = h2Matches.find(h => h.title.toLowerCase().includes('step by step'));
  let processSplit = { intro: "The Step By Step Process", highlight: "Behind Every Project" };
  let processDesc = "";
  let steps = [];
  if (processH2) {
    processSplit = splitHeading(processH2.title);
    const chunk = html.substring(processH2.index, processH2.index + 6000);
    const p = [...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 40)[0];
    if (p) processDesc = p;

    // Steps have H2 numbers like 01, 02 followed by H2 title and p
    const stepCards = [...chunk.matchAll(/<h2[^>]*>(?:0\d|\d)<\/h2>[\s\S]*?<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    steps = stepCards.slice(0, 6).map((m, i) => ({
      step: (i + 1).toString().padStart(2, '0'),
      title: clean(m[1]),
      desc: clean(m[2]),
      badge: `PHASE ${(i + 1).toString().padStart(2, '0')}`
    }));
  }

  // 9. Section 7: Local Results (Metrics)
  const resultsH2 = h2Matches.find(h => h.title.toLowerCase().includes('results that prove'));
  let metrics = [
    { value: "+320%", label: "Organic Growth", subtext: "410 Muscle Therapy grew organic traffic and appointments by 320% in four months." },
    { value: "+210%", label: "Lead Volume", subtext: "Roof Improvement & Services pushed lead volume up 210% over six months." },
    { value: "4X ROI", label: "Revenue Return", subtext: "Palco Claims turned far more visitors into clients for a strong 4X return within eight months." },
    { value: "+180%", label: "Search Visibility", subtext: "Blue Sky Pediatrics lifted search visibility by 180% in five months." }
  ];
  if (resultsH2) {
    const chunk = html.substring(resultsH2.index, resultsH2.index + 4000);
    const cards = [...chunk.matchAll(/<h2[^>]*>([\+\d%X\sROI]+)<\/h2>[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    if (cards.length >= 3) {
      metrics = cards.slice(0, 4).map(m => ({
        value: clean(m[1]),
        label: clean(m[2]),
        subtext: clean(m[3])
      }));
    }
  }

  // 10. Section 8: Industries
  const indH2 = h2Matches.find(h => h.title.toLowerCase().includes('industries where'));
  let industriesList = [
    { name: "Home & Local Services", desc: "Contractors, remodelers, and emergency service providers.", icon: "Home" },
    { name: "E-Commerce & Retail", desc: "High-volume online storefronts and consumer brands.", icon: "ShoppingCart" },
    { name: "Professional & B2B Services", desc: "Consultants, legal firms, and corporate service providers.", icon: "Briefcase" },
    { name: "Healthcare & Specialized Clinics", desc: "Practices attracting local patients with confidence.", icon: "Shield" }
  ];
  if (indH2) {
    const chunk = html.substring(indH2.index, indH2.index + 4000);
    const cards = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    if (cards.length >= 3) {
      industriesList = cards.slice(0, 4).map(m => ({
        name: clean(m[1]),
        desc: clean(m[2]),
        icon: "CheckCircle2"
      }));
    }
  }

  // 11. Section 10: Why Choose Us
  const whyChooseH2 = h2Matches.find(h => h.title.toLowerCase().includes('why') && (h.title.toLowerCase().includes('trust') || h.title.toLowerCase().includes('pick')));
  let whyPoints = [
    { title: "Research-Led, Not Trend-Led", desc: "Every choice is backed by real user behavior and verified data.", icon: "CheckCircle2" },
    { title: "Proven Design Framework", desc: "Our repeatable system strengthens structure, clarity, and trust without wasted time.", icon: "Award" },
    { title: "Clear, Honest Collaboration", desc: "Direct communication with lead specialists who respect deadlines and speak plain English.", icon: "Users" }
  ];
  if (whyChooseH2) {
    const chunk = html.substring(whyChooseH2.index, whyChooseH2.index + 4000);
    const cards = [...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    if (cards.length >= 3) {
      whyPoints = cards.slice(0, 3).map(m => ({
        title: clean(m[1]),
        desc: clean(m[2]),
        icon: "CheckCircle2"
      }));
    }
  }

  // 12. FAQs from Elementor Accordion
  const faqs = [];
  const detailsRegex = /<details[^>]*class=["'][^"']*e-n-accordion-item[^"']*["'][^>]*>([\s\S]*?)<\/details>/gi;
  let dMatch;
  while ((dMatch = detailsRegex.exec(html)) !== null) {
    const detailHtml = dMatch[1];
    const qMatch = detailHtml.match(/class=["'][^"']*e-n-accordion-item-title-text[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const question = clean(qMatch ? qMatch[1] : '').replace(/^\d+\.\s*/, '');
    const ansMatch = detailHtml.match(/<div\s+role=["']region["'][^>]*>([\s\S]*)/i);
    const answer = clean(ansMatch ? ansMatch[1] : '');
    if (question && answer) {
      faqs.push({ question, answer, category: "GENERAL" });
    }
  }

  return {
    id: Date.now().toString() + '_' + item.slug,
    title: item.defaultTitle,
    slug: item.slug,
    tag: "Premium Solution",
    icon: "Sparkles",
    status: "published",
    isTrashed: false,
    createdAt: new Date().toISOString(),
    hero: {
      titleIntro: h1Split.intro,
      titleHighlight: h1Split.highlight,
      description: heroDescription,
      backgroundImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787854939/hero.jpg",
      bgImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787854939/hero.jpg",
      primaryCta: { text: "Start Project", link: "/contact-mohsin-designs/" },
      secondaryCta: { text: "Explore Services", link: "#what-included" },
      benefits: heroBullets
    },
    clientTrust: {
      heading: trustH2 ? trustH2.title : "Why Smart Teams Trust Mohsin Designs",
      description: trustDesc,
      logos: [
        { name: "Clutch", icon: "Award", image: "" },
        { name: "GoodFirms", icon: "Star", image: "" },
        { name: "Upwork Top Rated", icon: "CheckCircle2", image: "" },
        { name: "DesignRush", icon: "Trophy", image: "" }
      ]
    },
    strategy: {
      eyebrow: "03 // STRATEGIC APPROACH",
      titleIntro: strategySplit.intro,
      titleHighlight: strategySplit.highlight,
      description: strategyDesc,
      components: strategyComponents
    },
    whatIncluded: {
      eyebrow: "04 // WHAT'S INCLUDED",
      titleIntro: whatSplit.intro,
      titleHighlight: whatSplit.highlight,
      description: whatDesc,
      pillars: pillars
    },
    benefits: {
      eyebrow: "05 // MEASURABLE OUTCOMES",
      titleIntro: benefitsSplit.intro,
      titleHighlight: benefitsSplit.highlight,
      description: benefitsDesc,
      list: benefitsList
    },
    process: {
      eyebrow: "06 // EXECUTION PROCESS",
      titleIntro: processSplit.intro,
      titleHighlight: processSplit.highlight,
      description: processDesc,
      steps: steps
    },
    results: {
      eyebrow: "07 // PROVEN PERFORMANCE",
      titleIntro: "Local Results That Prove",
      titleHighlight: "The Work Pays Off",
      description: "Real outcomes matter far more than pretty screenshots. These quick stories show how our work moved real numbers fast.",
      metrics: metrics,
      caseStudy: {
        title: `${item.defaultTitle} Case Study`,
        metric: "+280% Inbound Inquiries",
        desc: "Restructured full-funnel strategy resulting in compounding qualified leads and reduced acquisition cost.",
        image: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787835311/mohsin-design-website-image.webp",
        link: "/portfolio"
      }
    },
    industries: {
      eyebrow: "08 // SECTOR EXPERTISE",
      titleIntro: indH2 ? splitHeading(indH2.title).intro : "Industries Where Our Work",
      titleHighlight: indH2 ? splitHeading(indH2.title).highlight : "Moves The Needle",
      description: "Every industry serves different users with different habits, so we adapt our approach to fit yours.",
      items: industriesList
    },
    tools: {
      eyebrow: "09 // TOOLING & TECH STACK",
      titleIntro: "The Tools We Use To",
      titleHighlight: "Get Sharper Results",
      description: "Sharp decisions come from the right tools, not hunches. We work with industry-leading platforms that help us execute faster.",
      categories: [
        { category: "Primary Tools", items: ["Figma", "Adobe Creative Cloud", "Webflow", "Next.js", "React"] },
        { category: "Analytics & Telemetry", items: ["Google Analytics 4", "Search Console", "Google Tag Manager", "Hotjar"] }
      ]
    },
    whyChooseUs: {
      eyebrow: "10 // WHY CHOOSE US",
      titleIntro: whyChooseH2 ? splitHeading(whyChooseH2.title).intro : "Why Growing Brands Partner",
      titleHighlight: whyChooseH2 ? splitHeading(whyChooseH2.title).highlight : "With Mohsin Designs",
      description: "We eliminate agency fluff to build genuine partnerships focused on measurable growth.",
      points: whyPoints
    },
    pricing: {
      enabled: false,
      plans: []
    },
    finalCta: {
      eyebrow: "11 // START TODAY",
      titleIntro: "Ready To Build Something",
      titleHighlight: "Better?",
      description: "Whether you need design, development, content, or marketing, Mohsin Designs helps your brand look professional, attract customers, and grow online.",
      primaryCta: { text: "Start Free Consultation", link: "/contact-mohsin-designs/" },
      secondaryCta: { text: "View Portfolio", link: "/portfolio" },
      backgroundImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787835311/mohsin-design-website-image.webp"
    },
    faqBadge: "FREQUENTLY ASKED QUESTIONS",
    faqTitleIntro: "Frequently Asked",
    faqTitleHighlight: "Questions",
    faqDescription: "Explore common questions regarding our turnaround times, process, deliverables, and standards.",
    faqSchemaMarkup: "",
    faqs: faqs,
    seo: {
      canonicalUrl: `https://mohsindesigns.com/services/${item.slug}/`,
      featuredImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787835311/mohsin-design-website-image.webp",
      featuredImageAlt: `${item.defaultTitle} - Mohsin Designs`,
      ogImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787835311/mohsin-design-website-image.webp",
      twitterImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787835311/mohsin-design-website-image.webp",
      metaTitle: metaTitle,
      metaDescription: metaDescription,
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      twitterTitle: metaTitle,
      twitterDescription: metaDescription,
      focusKeyword: item.defaultTitle
    }
  };
}

async function run() {
  const docs = [];
  for (const s of allServicesList) {
    const doc = await extractExactService(s);
    docs.push(doc);
    console.log(`Extracted "${doc.title}":`);
    console.log(`  - H1: "${doc.hero.titleIntro} ${doc.hero.titleHighlight}"`);
    console.log(`  - Pillars: ${doc.whatIncluded.pillars.length} | Strategy: ${doc.strategy.components.length} | Steps: ${doc.process.steps.length} | FAQs: ${doc.faqs.length}`);
  }

  // Connect to DB and update
  console.log('\nConnecting to MongoDB Atlas...');
  const conn = await mongoose.createConnection(URI).asPromise();
  const db = conn.db;

  const currentDoc = await db.collection('site_contents').findOne({ key: 'complete_data' });
  const existingServices = currentDoc.data?.services?.services || [];

  const seededSlugs = docs.map(d => d.slug);
  const retained = existingServices.filter(s => !seededSlugs.includes(s.slug));
  const merged = [...retained, ...docs];

  await db.collection('site_contents').updateOne(
    { key: 'complete_data' },
    {
      $set: {
        "data.services.services": merged,
        "data.globalServices": merged,
        lastUpdated: new Date()
      }
    }
  );

  console.log(`\nSuccessfully updated all 10 services! Total services in database: ${merged.length}`);
  merged.forEach((s, i) => console.log(`  ${i+1}. [${s.status}] ${s.title} -> /services/${s.slug} (Pillars: ${s.whatIncluded?.pillars?.length}, FAQs: ${s.faqs?.length})`));

  await conn.close();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
