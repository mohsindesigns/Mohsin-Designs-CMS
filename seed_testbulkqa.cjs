const mongoose = require('mongoose');

const MONGODB_URI = "mongodb://mdseo2025_db_user:UElPBA47l5oQf2oX@ac-rtmxchd-shard-00-00.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-01.havgrhc.mongodb.net:27017,ac-rtmxchd-shard-00-02.havgrhc.mongodb.net:27017/mdseo2025?ssl=true&replicaSet=atlas-qtu58a-shard-0&authSource=admin";

const testbulkqaService = {
  _id: new mongoose.Types.ObjectId().toString(),
  title: "testbulkqa",
  slug: "testbulkqa",
  tag: "testbulkqa",
  status: "published",
  hero: {
    titleIntro: "testbulkqa",
    titleHighlight: "testbulkqa",
    description: "testbulkqa\ntestbulkqa line 2\ntestbulkqa paragraph 2",
    backgroundImage: "/portfolio_hero_bg.png",
    primaryCta: { text: "testbulkqa", link: "#contact-form" },
    secondaryCta: { text: "testbulkqa", link: "#what-included" },
    benefits: [
      "testbulkqa benefit 1",
      "testbulkqa benefit 2",
      "testbulkqa benefit 3"
    ],
    formHeading: "testbulkqa form heading",
    formSubheading: "testbulkqa form subheading",
    formButtonText: "testbulkqa submit"
  },
  clientTrust: {
    heading: "testbulkqa trust heading",
    logos: [
      { name: "testbulkqa logo 1" },
      { name: "testbulkqa logo 2" }
    ]
  },
  whatIncluded: {
    eyebrow: "testbulkqa deliverables eyebrow",
    titleIntro: "testbulkqa deliverables intro",
    titleHighlight: "testbulkqa deliverables highlight",
    description: "testbulkqa deliverables description overview",
    pillars: [
      {
        title: "testbulkqa pillar 1",
        desc: "testbulkqa pillar 1 desc",
        features: ["testbulkqa feature 1", "testbulkqa feature 2"]
      },
      {
        title: "testbulkqa pillar 2",
        desc: "testbulkqa pillar 2 desc",
        features: ["testbulkqa feature 3", "testbulkqa feature 4"]
      },
      {
        title: "testbulkqa pillar 3",
        desc: "testbulkqa pillar 3 desc",
        features: ["testbulkqa feature 5", "testbulkqa feature 6"]
      }
    ]
  },
  strategy: {
    eyebrow: "testbulkqa strategy eyebrow",
    titleIntro: "testbulkqa strategy intro",
    titleHighlight: "testbulkqa strategy highlight",
    description: "testbulkqa strategy description",
    components: [
      { num: "01", title: "testbulkqa step 1", desc: "testbulkqa step 1 desc" },
      { num: "02", title: "testbulkqa step 2", desc: "testbulkqa step 2 desc" },
      { num: "03", title: "testbulkqa step 3", desc: "testbulkqa step 3 desc" }
    ]
  },
  benefits: {
    eyebrow: "testbulkqa outcomes eyebrow",
    titleIntro: "testbulkqa outcomes intro",
    titleHighlight: "testbulkqa outcomes highlight",
    outcomeText: "testbulkqa outcome text",
    list: [
      { metric: "testbulkqa 1", title: "testbulkqa outcome 1", desc: "testbulkqa outcome 1 desc", iconName: "TrendingUp" },
      { metric: "testbulkqa 2", title: "testbulkqa outcome 2", desc: "testbulkqa outcome 2 desc", iconName: "Target" },
      { metric: "testbulkqa 3", title: "testbulkqa outcome 3", desc: "testbulkqa outcome 3 desc", iconName: "ShieldCheck" },
      { metric: "testbulkqa 4", title: "testbulkqa outcome 4", desc: "testbulkqa outcome 4 desc", iconName: "Zap" }
    ]
  },
  process: {
    eyebrow: "testbulkqa process eyebrow",
    titleIntro: "testbulkqa process intro",
    titleHighlight: "testbulkqa process highlight",
    description: "testbulkqa process description",
    calloutTag: "testbulkqa callout tag",
    calloutText: "testbulkqa callout text",
    steps: [
      {
        title: "testbulkqa process step 1",
        desc: "testbulkqa process step 1 desc",
        phaseTag: "testbulkqa phase 1",
        deliverables: ["testbulkqa deliverable 1", "testbulkqa deliverable 2"],
        footerLeft: "testbulkqa footer left",
        footerRight: "testbulkqa footer right"
      },
      {
        title: "testbulkqa process step 2",
        desc: "testbulkqa process step 2 desc",
        phaseTag: "testbulkqa phase 2",
        deliverables: ["testbulkqa deliverable 3", "testbulkqa deliverable 4"],
        footerLeft: "testbulkqa footer left",
        footerRight: "testbulkqa footer right"
      }
    ]
  },
  results: {
    eyebrow: "testbulkqa results eyebrow",
    titleIntro: "testbulkqa results intro",
    titleHighlight: "testbulkqa results highlight",
    description: "testbulkqa results description",
    caseStudiesEyebrow: "testbulkqa case studies eyebrow",
    caseStudies: [
      {
        title: "testbulkqa case study 1",
        challenge: "testbulkqa challenge 1",
        strategy: "testbulkqa strategy 1",
        outcome: "testbulkqa outcome 1",
        outcomeLabel: "testbulkqa outcome label"
      }
    ],
    metrics: [
      { value: "testbulkqa 1", label: "testbulkqa metric 1", desc: "testbulkqa metric 1 desc", tag: "testbulkqa tag 1" },
      { value: "testbulkqa 2", label: "testbulkqa metric 2", desc: "testbulkqa metric 2 desc", tag: "testbulkqa tag 2" },
      { value: "testbulkqa 3", label: "testbulkqa metric 3", desc: "testbulkqa metric 3 desc", tag: "testbulkqa tag 3" },
      { value: "testbulkqa 4", label: "testbulkqa metric 4", desc: "testbulkqa metric 4 desc", tag: "testbulkqa tag 4" }
    ]
  },
  industries: {
    eyebrow: "testbulkqa industries eyebrow",
    titleIntro: "testbulkqa industries intro",
    titleHighlight: "testbulkqa industries highlight",
    description: "testbulkqa industries description",
    footerLeft: "testbulkqa industries left",
    footerRight: "testbulkqa industries right",
    list: [
      { title: "testbulkqa industry 1", desc: "testbulkqa industry 1 desc", watermark: "QA", iconName: "Building2" },
      { title: "testbulkqa industry 2", desc: "testbulkqa industry 2 desc", watermark: "QA", iconName: "Cpu" },
      { title: "testbulkqa industry 3", desc: "testbulkqa industry 3 desc", watermark: "QA", iconName: "Globe" }
    ]
  },
  tools: {
    eyebrow: "testbulkqa tech eyebrow",
    titleIntro: "testbulkqa tech intro",
    titleHighlight: "testbulkqa tech highlight",
    description: "testbulkqa tech description",
    list: [
      { name: "testbulkqa tool 1", tag: "testbulkqa tag 1", desc: "testbulkqa tool 1 desc", iconName: "Monitor" },
      { name: "testbulkqa tool 2", tag: "testbulkqa tag 2", desc: "testbulkqa tool 2 desc", iconName: "Cpu" }
    ]
  },
  whyChooseUs: {
    eyebrow: "testbulkqa why eyebrow",
    titleIntro: "testbulkqa why intro",
    titleHighlight: "testbulkqa why highlight",
    description: "testbulkqa why description",
    stats: [
      { value: "testbulkqa 1", label: "testbulkqa stat 1", sublabel: "testbulkqa sub 1", percentage: 1.0 },
      { value: "testbulkqa 2", label: "testbulkqa stat 2", sublabel: "testbulkqa sub 2", percentage: 0.9 }
    ],
    list: [
      { tag: "testbulkqa diff tag 1", title: "testbulkqa diff 1", desc: "testbulkqa diff 1 desc" },
      { tag: "testbulkqa diff tag 2", title: "testbulkqa diff 2", desc: "testbulkqa diff 2 desc" }
    ]
  },
  pricing: {
    eyebrow: "testbulkqa pricing eyebrow",
    titleIntro: "testbulkqa pricing intro",
    titleHighlight: "testbulkqa pricing highlight",
    description: "testbulkqa pricing description",
    plans: [
      {
        name: "testbulkqa plan 1",
        tag: "testbulkqa plan tag 1",
        desc: "testbulkqa plan 1 desc",
        price: "$testbulkqa",
        period: "testbulkqa",
        features: ["testbulkqa plan feature 1", "testbulkqa plan feature 2"],
        ctaText: "testbulkqa plan cta 1",
        isPopular: true
      },
      {
        name: "testbulkqa plan 2",
        tag: "testbulkqa plan tag 2",
        desc: "testbulkqa plan 2 desc",
        price: "$testbulkqa",
        period: "testbulkqa",
        features: ["testbulkqa plan feature 3", "testbulkqa plan feature 4"],
        ctaText: "testbulkqa plan cta 2",
        isPopular: false
      }
    ]
  },
  serviceArea: {
    sectionTag: "testbulkqa global reach tag",
    titleIntro: "testbulkqa global reach intro",
    titleHighlight: "testbulkqa global reach highlight",
    description: "testbulkqa global reach description"
  },
  faqs: [
    { q: "testbulkqa question 1?", a: "testbulkqa answer 1" },
    { q: "testbulkqa question 2?", a: "testbulkqa answer 2" }
  ],
  faqSection: {
    sectionTag: "testbulkqa faq tag",
    titleIntro: "testbulkqa faq intro",
    titleHighlight: "testbulkqa faq highlight",
    description: "testbulkqa faq description"
  },
  finalCta: {
    eyebrow: "testbulkqa cta eyebrow",
    titleIntro: "testbulkqa cta intro",
    titleHighlight: "testbulkqa cta highlight",
    titleLine2: "testbulkqa cta line 2",
    description: "testbulkqa cta description",
    primaryCtaText: "testbulkqa primary cta",
    primaryCtaLink: "#contact-form",
    secondaryCtaText: "testbulkqa secondary cta",
    secondaryCtaLink: "/contact",
    founderImage: "/founder_portrait_nobg.png"
  }
};

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB.");

  const collection = mongoose.connection.collection('site_contents');
  const doc = await collection.findOne({ key: 'complete_data' });

  if (!doc) {
    console.error("complete_data not found in site_contents!");
    process.exit(1);
  }

  let services = doc.data?.services?.services || [];
  // Remove if exists
  services = services.filter(s => s.slug !== 'testbulkqa');
  // Add new
  services.push(testbulkqaService);

  await collection.updateOne(
    { key: 'complete_data' },
    { $set: { "data.services.services": services } }
  );

  console.log("Successfully inserted/updated testbulkqa into site_contents -> complete_data.services.services!");

  // Also check pages collection and insert/update page
  const pagesCollection = mongoose.connection.collection('pages');
  const existingPage = await pagesCollection.findOne({ slug: 'services/testbulkqa' });
  const pagePayload = {
    title: "testbulkqa",
    slug: "services/testbulkqa",
    template: "service-detail",
    status: "published",
    content: testbulkqaService,
    updatedAt: new Date()
  };

  if (existingPage) {
    await pagesCollection.updateOne({ slug: 'services/testbulkqa' }, { $set: pagePayload });
  } else {
    pagePayload.createdAt = new Date();
    await pagesCollection.insertOne(pagePayload);
  }

  console.log("Successfully inserted/updated testbulkqa in pages collection!");
  await mongoose.disconnect();
  console.log("Done!");
}

seed().catch(err => {
  console.error("Seed error:", err);
  process.exit(1);
});
