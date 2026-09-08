const fs = require('fs');
const mongoose = require('mongoose');

const URI = 'mongodb://mdseo2025_db_user:UElPBA47l5oQf2oX@ac-rtmxchd-shard-00-00.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-01.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-02.havgrhc.mongodb.net:27017/mdseo2025?ssl=true&replicaSet=atlas-qtu58a-shard-0&authSource=admin';

const services = [
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
  const cleaned = clean(h);
  const patterns = [' With ', ' That ', ' For ', ' Around ', ' Behind ', ' Across ', ' Into ', ' To '];
  for (const p of patterns) {
    if (cleaned.includes(p)) {
      const idx = cleaned.indexOf(p);
      return {
        intro: cleaned.substring(0, idx + p.length).trim(),
        highlight: cleaned.substring(idx + p.length).trim()
      };
    }
  }
  const words = cleaned.split(' ');
  if (words.length > 3) {
    return {
      intro: words.slice(0, words.length - 2).join(' '),
      highlight: words.slice(-2).join(' ')
    };
  }
  return { intro: cleaned, highlight: '' };
}

async function extractService(item) {
  console.log(`\nFetching ${item.url}...`);
  const res = await fetch(item.url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' }
  });
  const html = await res.text();

  // 1. Meta & H1
  const metaTitle = clean(html.match(/<title>([^<]*)<\/title>/i)?.[1] || `${item.defaultTitle} | Mohsin Designs`);
  const metaDescription = clean(html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i)?.[1] || '');
  const h1 = clean(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || item.defaultTitle);
  const h1Split = splitHeading(h1);

  // Hero description & bullets
  const h1Idx = html.indexOf('<h1');
  const postH1 = h1Idx !== -1 ? html.substring(h1Idx, h1Idx + 5000) : html;
  const heroParas = [...postH1.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .map(m => clean(m[1]))
    .filter(p => p.length > 40 && !p.includes('Search Engine Optimization GMB') && !p.includes('Home » Services'));
  const heroDesc = heroParas.slice(0, 2).join('\n\n') || metaDescription;

  const heroUl = postH1.match(/<ul[^>]*>([\s\S]*?)<\/ul>/i);
  let heroBullets = [];
  if (heroUl) {
    heroBullets = [...heroUl[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map(m => clean(m[1])).filter(Boolean);
  }
  if (heroBullets.length === 0) {
    heroBullets = ["Discovery & Technical Diagnostics", "Bespoke Strategic Architecture", "Precision High-Performance Build", "Dedicated Ongoing Growth Support"];
  }

  // Get all H2s with their index and text
  const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].map(m => ({
    text: clean(m[1]),
    idx: m.index
  }));

  // Identify key H2 sections by index or text
  // h2Matches[0] is typically form heading "Let's Talk About Your Project"
  // h2Matches[1] is Client Trust
  const trustH2 = h2Matches[1] || { text: "Why Smart Teams Trust Mohsin Designs With Their Product", idx: 0 };
  const s2Chunk = html.substring(trustH2.idx, trustH2.idx + 2500);
  const trustDesc = [...s2Chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(p => p.length > 30)[0]
    || "From ambitious startups to established brands, we've delivered high-performing digital solutions for over 3,000 clients across 50+ industries.";

  // h2Matches[2] is Section 3: Strategic / Turns Clicks/Intent
  const intentH2 = h2Matches[2];
  const intentSplit = intentH2 ? splitHeading(intentH2.text) : { intro: "How Strategic Execution", highlight: "Turns Clicks Into Customers" };
  const s3Chunk = intentH2 && h2Matches[3] ? html.substring(intentH2.idx, h2Matches[3].idx) : "";
  const s3Paras = [...s3Chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(p => p.length > 30);
  const intentDesc = s3Paras[0] || "";
  
  // Extract 3 cards from Section 3
  const s3Cards = [...s3Chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const strategyComponents = s3Cards.slice(0, 3).map((m, i) => ({
    num: (i + 1).toString().padStart(2, '0'),
    title: clean(m[1]),
    desc: clean(m[2])
  }));

  // h2Matches[3] is Section 4: What's Included / Pillars
  const pillarsH2 = h2Matches[3];
  const pillarsSplit = pillarsH2 ? splitHeading(pillarsH2.text) : { intro: "Tailored Solutions Shaped Around", highlight: "How Your Users Behave" };
  const s4Chunk = pillarsH2 && h2Matches[4] ? html.substring(pillarsH2.idx, h2Matches[4].idx) : "";
  const s4Paras = [...s4Chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(p => p.length > 30);
  const pillarsDesc = s4Paras[0] || "";
  
  const s4Cards = [...s4Chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const pillars = s4Cards.map(m => ({
    title: clean(m[1]),
    desc: clean(m[2]),
    features: []
  }));

  // h2Matches[4] is Section 5: Benefits / Why It Decides Long Term Growth
  const benefitsH2 = h2Matches[4];
  const benefitsSplit = benefitsH2 ? splitHeading(benefitsH2.text) : { intro: "Why High Performance Decides", highlight: "Your Long Term Growth" };
  const s5Chunk = benefitsH2 && h2Matches[5] ? html.substring(benefitsH2.idx, h2Matches[5].idx) : "";
  const s5Paras = [...s5Chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(p => p.length > 30);
  const benefitsDesc = s5Paras[0] || "";

  const s5Cards = [...s5Chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const benefitsList = s5Cards.map((m, i) => ({
    metric: `B0${i + 1}`,
    title: clean(m[1]),
    desc: clean(m[2]),
    tag: "Advantage",
    iconName: i === 0 ? "TrendingUp" : i === 1 ? "Target" : i === 2 ? "ShieldCheck" : "Zap"
  }));

  // h2Matches[5] is Section 6: Process (The Step By Step Process)
  const processH2 = h2Matches[5];
  const processSplit = processH2 ? splitHeading(processH2.text) : { intro: "The Step By Step Process", highlight: "Behind Products People Love" };
  
  // Find step items: look for 01, 02, 03... in H2s
  const steps = [];
  for (let i = 0; i < h2Matches.length; i++) {
    const txt = h2Matches[i].text;
    if (/^0[1-6]$/.test(txt)) {
      const stepNum = txt;
      const titleH2 = h2Matches[i + 1];
      const nextH2 = h2Matches[i + 2];
      if (titleH2) {
        const stepChunk = html.substring(titleH2.idx, nextH2 ? nextH2.idx : titleH2.idx + 600);
        const p = [...stepChunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => clean(m[1])).filter(x => x.length > 20)[0] || "";
        steps.push({
          title: titleH2.text,
          desc: p,
          phaseTag: `PHASE ${stepNum}`,
          deliverables: []
        });
      }
    }
  }

  // Section 7: Local Results
  // Find H2 for results
  const resultsH2 = h2Matches.find(h => h.text.toLowerCase().includes('results that prove') || h.text.toLowerCase().includes('wins we have delivered') || h.text.toLowerCase().includes('real business lifts') || h.text.toLowerCase().includes('real results'));
  const metrics = [];
  if (resultsH2) {
    const resultsIdx = h2Matches.indexOf(resultsH2);
    // Look at following H2s that match stats like +320%, 4X ROI, etc.
    for (let j = resultsIdx + 1; j < resultsIdx + 6; j++) {
      if (!h2Matches[j]) break;
      const statText = h2Matches[j].text;
      if (/^[\+\d%X\sROI]+$/.test(statText) && statText.length <= 10) {
        const chunk = html.substring(h2Matches[j].idx, (h2Matches[j + 1]?.idx || h2Matches[j].idx + 600));
        const h3 = clean([...chunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/gi)][0]?.[1] || "Growth Metric");
        const p = clean([...chunk.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)][0]?.[1] || "");
        metrics.push({
          value: statText,
          label: h3,
          desc: p,
          tag: `M0${metrics.length + 1}`
        });
      }
    }
  }

  // Fallback metrics if not found
  if (metrics.length === 0) {
    metrics.push(
      { value: "+320%", label: "Organic Growth", desc: "410 Muscle Therapy lifted organic traffic and appointments by 320% in four months.", tag: "M01" },
      { value: "+210%", label: "Lead Volume", desc: "Roof Improvement & Services doubled inquiries and pushed lead volume up 210% over six months.", tag: "M02" },
      { value: "4X ROI", label: "Revenue Return", desc: "Palco Claims turned far more visitors into clients for a strong 4X return within eight months.", tag: "M03" },
      { value: "+180%", label: "Search Visibility", desc: "Blue Sky Pediatrics lifted search visibility by 180% in five months.", tag: "M04" }
    );
  }

  // Section 8: Industries
  const indH2 = h2Matches.find(h => h.text.toLowerCase().includes('industries where') || h.text.toLowerCase().includes('industries we design') || h.text.toLowerCase().includes('sectors'));
  const industriesList = [];
  if (indH2) {
    const indIdx = h2Matches.indexOf(indH2);
    const nextH2 = h2Matches[indIdx + 1];
    const indChunk = nextH2 ? html.substring(indH2.idx, nextH2.idx) : html.substring(indH2.idx, indH2.idx + 3500);
    const cards = [...indChunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    cards.forEach(m => {
      industriesList.push({
        title: clean(m[1]),
        desc: clean(m[2]),
        iconName: "CheckCircle2"
      });
    });
  }

  // Section 9: Tools
  const toolsH2 = h2Matches.find(h => h.text.toLowerCase().includes('tools') || h.text.toLowerCase().includes('design stack'));

  // Section 10: Why Choose Us / Pick
  const whyH2 = h2Matches.find(h => h.text.toLowerCase().includes('why') && (h.text.toLowerCase().includes('pick') || h.text.toLowerCase().includes('trust') || h.text.toLowerCase().includes('choose')));
  const whyPoints = [];
  if (whyH2) {
    const whyIdx = h2Matches.indexOf(whyH2);
    const nextH2 = h2Matches[whyIdx + 1];
    const whyChunk = nextH2 ? html.substring(whyH2.idx, nextH2.idx) : html.substring(whyH2.idx, whyH2.idx + 3500);
    const cards = [...whyChunk.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi)];
    cards.forEach((m, idx) => {
      whyPoints.push({
        title: clean(m[1]),
        desc: clean(m[2]),
        tag: `Differentiator 0${idx + 1}`,
        icon: "CheckCircle2"
      });
    });
  }

  // Section 11: FAQs from Elementor accordion
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
      enabled: true,
      titleIntro: h1Split.intro,
      titleHighlight: h1Split.highlight,
      description: heroDesc,
      backgroundImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787854939/hero.jpg",
      bgImage: "https://res.cloudinary.com/dytytwyp6/image/upload/v1787854939/hero.jpg",
      primaryCta: { text: "Start Project", link: "/contact-mohsin-designs/" },
      secondaryCta: { text: "Explore Services", link: "#what-included" },
      benefits: heroBullets
    },
    clientTrust: {
      enabled: true,
      heading: trustH2.text,
      description: trustDesc,
      logos: [
        { name: "Clutch", icon: "Award", image: "" },
        { name: "GoodFirms", icon: "Star", image: "" },
        { name: "Upwork Top Rated", icon: "CheckCircle2", image: "" },
        { name: "DesignRush", icon: "Trophy", image: "" }
      ]
    },
    strategy: {
      enabled: true,
      eyebrow: "03 // STRATEGIC APPROACH",
      titleIntro: intentSplit.intro,
      titleHighlight: intentSplit.highlight,
      description: intentDesc,
      components: strategyComponents
    },
    whatIncluded: {
      enabled: true,
      eyebrow: "04 // WHAT'S INCLUDED",
      titleIntro: pillarsSplit.intro,
      titleHighlight: pillarsSplit.highlight,
      description: pillarsDesc,
      pillars: pillars
    },
    benefits: {
      enabled: true,
      eyebrow: "05 // MEASURABLE OUTCOMES",
      titleIntro: benefitsSplit.intro,
      titleHighlight: benefitsSplit.highlight,
      description: benefitsDesc,
      list: benefitsList
    },
    process: {
      enabled: true,
      eyebrow: "06 // EXECUTION PROCESS",
      titleIntro: processSplit.intro,
      titleHighlight: processSplit.highlight,
      description: "We follow a transparent, repeatable system that keeps you informed and your project on track.",
      steps: steps
    },
    results: {
      enabled: true,
      eyebrow: "07 // PROVEN PERFORMANCE",
      titleIntro: resultsH2 ? splitHeading(resultsH2.text).intro : "Local Results That Prove",
      titleHighlight: resultsH2 ? splitHeading(resultsH2.text).highlight : "The Work Pays Off",
      description: "Real outcomes matter far more than pretty screenshots. These quick stories show how our work moved real numbers fast.",
      metrics: metrics,
      caseStudies: [
        {
          title: `${item.defaultTitle} Growth Case Study`,
          outcome: "+280% Growth",
          desc: "Restructured full-funnel strategy resulting in compounding qualified leads and reduced acquisition cost."
        }
      ]
    },
    industries: {
      enabled: true,
      eyebrow: "08 // SECTOR EXPERTISE",
      titleIntro: indH2 ? splitHeading(indH2.text).intro : "Industries Where Our Work",
      titleHighlight: indH2 ? splitHeading(indH2.text).highlight : "Moves The Needle",
      description: "Every industry serves different users with different habits, so we adapt our approach to fit yours.",
      list: industriesList
    },
    tools: {
      enabled: true,
      eyebrow: "09 // TOOLING & TECH STACK",
      titleIntro: toolsH2 ? splitHeading(toolsH2.text).intro : "The Tools We Use To",
      titleHighlight: toolsH2 ? splitHeading(toolsH2.text).highlight : "Get Sharper Results",
      description: "Sharp decisions come from the right tools, not hunches. We work with industry-leading platforms that help us execute faster.",
      list: [
        { name: "Figma", tag: "DESIGN", desc: "Collaborative interface design and rapid prototyping tool." },
        { name: "Adobe Creative Cloud", tag: "CREATIVE", desc: "Industry-standard suite for visual identity and brand asset production." },
        { name: "Google Analytics 4", tag: "ANALYTICS", desc: "Complete event telemetry tracking and conversion funnel analysis." },
        { name: "Next.js", tag: "CORE DEV", desc: "High-performance React framework for blazing speed and SEO indexing." }
      ]
    },
    whyChooseUs: {
      enabled: true,
      eyebrow: "10 // WHY CHOOSE US",
      titleIntro: whyH2 ? splitHeading(whyH2.text).intro : "Why Growing Brands Partner",
      titleHighlight: whyH2 ? splitHeading(whyH2.text).highlight : "With Mohsin Designs",
      description: "We eliminate agency fluff to build genuine partnerships focused on measurable growth.",
      list: whyPoints
    },
    pricing: {
      enabled: false,
      plans: []
    },
    finalCta: {
      enabled: true,
      eyebrow: "11 // START TODAY",
      titleIntro: "Ready To Build Something",
      titleHighlight: "Better?",
      description: "Whether you need design, development, content, or marketing, Mohsin Designs helps your brand look professional, attract customers, and grow online.",
      primaryCtaText: "Start Free Consultation",
      primaryCtaLink: "/contact-mohsin-designs/",
      secondaryCtaText: "View Portfolio",
      secondaryCtaLink: "/portfolio"
    },
    faqBadge: "FREQUENTLY ASKED QUESTIONS",
    faqTitleIntro: "Frequently Asked",
    faqTitleHighlight: "Questions",
    faqDescription: "Explore common questions regarding our turnaround times, process, deliverables, and standards.",
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
  for (const s of services) {
    const doc = await extractService(s);
    docs.push(doc);
    console.log(`Extracted "${doc.title}":`);
    console.log(`  - H1: "${doc.hero.titleIntro} ${doc.hero.titleHighlight}"`);
    console.log(`  - Strategy components: ${doc.strategy.components.length}`);
    console.log(`  - Pillars: ${doc.whatIncluded.pillars.length}`);
    console.log(`  - Benefits: ${doc.benefits.list.length}`);
    console.log(`  - Steps: ${doc.process.steps.length}`);
    console.log(`  - Metrics: ${doc.results.metrics.length}`);
    console.log(`  - Industries: ${doc.industries.list.length}`);
    console.log(`  - Why choose us: ${doc.whyChooseUs.list.length}`);
    console.log(`  - FAQs: ${doc.faqs.length}`);
    console.log(`  - Pricing enabled: ${doc.pricing.enabled}`);
  }

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

  console.log(`\nSuccessfully seeded all 10 services to MongoDB Atlas!`);
  merged.forEach((s, i) => console.log(`  ${i+1}. [${s.status}] ${s.title} -> /services/${s.slug} (Pillars: ${s.whatIncluded?.pillars?.length}, Steps: ${s.process?.steps?.length}, FAQs: ${s.faqs?.length})`));

  await conn.close();
  console.log('DONE!');
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
