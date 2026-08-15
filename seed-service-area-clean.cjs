const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// Read MONGODB_URI from .env.local
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8');
const mongoUriLine = envFile.split('\n').find(line => line.startsWith('MONGODB_URI='));
const uri = mongoUriLine.split('MONGODB_URI=')[1].trim();

const cleanContent = {
  hero: {
    headline: "Missouri Service Areas",
    description: "<p>Proudly serving St. Louis, St. Charles, and surrounding Missouri communities with elite, veteran-owned roofing and home improvements.</p>",
    image: "https://res.cloudinary.com/dytytwyp6/image/upload/v1779110730/hciyariupwcrdluimqcx.webp"
  },
  overview: {
    headline: "Local Overview",
    title: "Elite Roofing & Restoration in This Community",
    description: "<p>Proudly providing premium residential roofing, standing seam metal builds, siding updates, and gutter cleanups to Missouri homeowners. We combine veteran precision with durable local materials.</p>",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact",
    image: "/images/service-area-overview.jpg"
  },
  stats: [
    { value: "15+", label: "Years of Local Expertise" },
    { value: "500+", label: "Premium Roofs Installed" },
    { value: "100%", label: "Veteran-Owned & Operated" }
  ],
  regionsSection: {
    title: "Counties & Regions We Cover",
    description: "Centrally dispatched to provide premium roofing, siding, and gutter solutions across Missouri."
  },
  regions: [
    {
      name: "St. Louis County",
      description: "<p>Proudly serving St. Louis County including Chesterfield, Wildwood, Ballwin, Kirkwood, Webster Groves, Eureka, and Fenton. We deliver veteran-grade residential roofing, commercial roof coatings, and seamless gutter installations with lifetime warranties.</p>",
      zipcodes: ["63017", "63005", "63011", "63021", "63122", "63119", "63031", "63042", "63043", "63025", "63026", "63124", "63105"],
      cities: []
    },
    {
      name: "St. Charles County",
      description: "<p>Providing top-tier storm damage restoration, shingles repair, and gutter installations in St. Charles, St. Peters, O'Fallon, Wentzville, and Lake St. Louis. Active storm response teams are centrally dispatched for quick inspection turnarounds.</p>",
      zipcodes: ["63301", "63303", "63304", "63376", "63366", "63368", "63385", "63367"],
      cities: []
    },
    {
      name: "Jefferson County",
      description: "<p>Your trusted local roofing experts in Arnold, Imperial, Festus, and Hillsboro. We specialize in asphalt shingle replacement, premium vinyl siding, and leaf-guard gutter guards to protect your home's foundation.</p>",
      zipcodes: ["63010", "63052", "63028", "63050", "63051", "63012"],
      cities: []
    }
  ],
  processSection: {
    headline: "Our Core Blueprint",
    title: "Our Elite 4-Step Process"
  },
  process: [
    { title: "Free Inspection", description: "We perform a highly detailed visual inspection of your entire roof, shingle layers, gutters, and attic structure.", icon: "ClipboardList" },
    { title: "Custom Quote", description: "Receive an itemized, fully transparent project quote detailing premium materials, scopes, and warranty parameters.", icon: "PencilRuler" },
    { title: "Elite Install", description: "Our certified expert crews complete your roofing or siding replacement with ultimate military precision and focus.", icon: "Hammer" },
    { title: "Final Sign-Off", description: "We execute a deep ground clean-up and a final walkthrough with you to verify that our work exceeds your expectations.", icon: "Sparkles" }
  ],
  materials: {
    headline: "Certified Excellence",
    title: "Premium Materials We Install",
    items: [
      { title: "Asphalt Shingles", description: "Architectural shingles engineered for ultimate storm protection, wind resilience, and custom color coordination to match your house aesthetics.", icon: "Home" },
      { title: "Standing Seam Metal", description: "High-end modern architectural profile that offers complete storm immunity, maximum energy efficiency, and a lifetime of zero maintenance.", icon: "Flame" },
      { title: "High-End Siding", description: "Fiber cement siding configured to stand strong against moisture rot, pests, and high wind impacts, instantly boosting your curb appeal.", icon: "PencilRuler" },
      { title: "Seamless Gutters", description: "High-capacity aluminum water drainage channels manufactured custom on-site to perfectly fit your roof perimeter and protect your soil foundations.", icon: "Droplets" }
    ]
  },
  servicesSection: {
    headline: "What We Provide",
    title: "Services We Provide in This Area",
    items: [
      { title: "Residential Roofing", description: "Pristine asphalt shingle and standing seam metal roof replacements designed for ultimate local storm immunity.", buttonText: "Explore Service", buttonHref: "/services/residential-roofing", icon: "Home" },
      { title: "Commercial Roofing", description: "Heavy-duty TPO, EPDM, and flat roof coatings configured for Missouri commercial properties and corporate facilities.", buttonText: "Explore Service", buttonHref: "/services/commercial-roofing", icon: "Building2" },
      { title: "Seamless Gutters", description: "Custom on-site rolled high-capacity aluminum gutter installations to secure proper rain drainage controls.", buttonText: "Explore Service", buttonHref: "/services/seamless-gutters", icon: "Droplets" }
    ]
  },
  whyChoose: {
    headline: "Why Choose Us",
    title: "Elite Missouri Roofing Quality",
    items: [
      { title: "Licensed & Fully Insured", description: "Complete compliance for your peace of mind. We hold full general liability, workers' comp, and active licensing across all service counties.", icon: "ShieldCheck" },
      { title: "Rapid Storm Dispatch", description: "Expedited emergency tarping and inspections. St. Louis storm damage requires immediate action, and our teams respond directly inside our operational radius.", icon: "Clock" },
      { title: "Veteran Owned Standards", description: "Applying military precision, honor, and elite craftsmanship to every shingle repair, gutter build, and residential siding replacement.", icon: "Award" }
    ]
  },
  faqs: [
    { question: "How do I know if you serve my exact neighborhood?", answer: "<p>You can use the interactive ZIP code checker at the top of this page! Just type in your 5-digit Missouri ZIP code and it will instantly verify coverage.</p>" },
    { question: "Do you offer emergency storm damage roofing dispatch?", answer: "<p>Yes, we offer 24/7 emergency dispatch for severe storm damage, wind impacts, and hail inspections. Contact our direct hotline immediately at (636) 293-9977.</p>" }
  ],
  cta: {
    headline: "Let's Get Started",
    title: "Protect Your Property Today",
    description: "Contact St. Louis and St. Charles' premium veteran-owned crew for custom inspection reports, detailed replacement bids, and emergency assistance.",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact"
  }
};

async function main() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log("Connected successfully to server");
    const db = client.db('eagle_revolution');
    const pagesCollection = db.collection('pages');
    
    const result = await pagesCollection.updateOne(
      { slug: 'testserviceareapage' },
      { $set: { content: cleanContent } }
    );
    
    console.log(`Updated page successfully:`, result);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
