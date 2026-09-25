// Single source of truth for the Service Area page's built-in content.
//
// ServiceAreaTemplate falls back to these when a section is missing from
// page.content, and ServiceAreaEditor writes the very same values into the page the
// first time it is opened (so the admin edits exactly what the public page shows).
// Keeping one copy stops the two from drifting apart (the editor used to ship 2
// regions while the page showed 3, etc).
//
// Pure data - safe to import from both client components and the admin editor.

export const SERVICE_AREA_DEFAULTS: Record<string, any> = {
  hero: {
    headline: "Our Service Areas",
    description:
      "Proudly serving St. Louis, St. Charles, and surrounding Missouri communities with elite, veteran-owned roofing and home improvements.",
    // No stock file ships in /public, so the default is "no image" (plain dark banner).
    image: "",
  },
  stats: [
    { value: "15+", label: "Years of Local Expertise" },
    { value: "500+", label: "Premium Roofs Installed" },
    { value: "100%", label: "Veteran-Owned & Operated" },
  ],
  processSection: {
    headline: "Our Core Blueprint",
    title: "Our Elite 4-Step Process",
  },
  process: [
    { title: "Free Inspection", description: "We perform a highly detailed visual inspection of your entire roof, shingle layers, gutters, and attic structure." },
    { title: "Custom Quote", description: "Receive an itemized, fully transparent project quote detailing premium materials, scopes, and warranty parameters." },
    { title: "Elite Install", description: "Our certified expert crews complete your roofing or siding replacement with ultimate military precision and focus." },
    { title: "Final Sign-Off", description: "We execute a deep ground clean-up and a final walkthrough with you to verify that our work exceeds your expectations." },
  ],
  map: {
    headline: "Our Coverage Area",
    title: "Our Operational Coverage Map",
    description:
      "Centrally dispatched to provide lightning-fast storm response, professional inspections, and veteran-grade roof installations across all primary Missouri counties.",
    iframeUrl:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d199426.6823901614!2d-90.3835467!3d38.6531004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x54eab584e432360b%3A0x1c3bb99243deb742!2sSt.+Louis%2C+MO!5e0!3m2!1sen!2sus!4v1700000000000",
    bullet1Title: "Primary Coverage Area",
    bullet1Text: "St. Louis, St. Charles, Jefferson & surrounding communities.",
    bullet2Title: "Operation Hours",
    bullet2Text: "Mon - Sat: 7:00 AM - 6:00 PM (Emergency storm response 24/7)",
    bullet3Title: "Direct Office Hotline",
    bullet3Text: "(636) 293-9977",
  },
  materials: {
    headline: "Certified Excellence",
    title: "Premium Materials We Install",
    items: [
      { title: "Asphalt Shingles", description: "Architectural shingles engineered for ultimate storm protection, wind resilience, and custom color coordination to match your house aesthetics." },
      { title: "Standing Seam Metal", description: "High-end modern architectural profile that offers complete storm immunity, maximum energy efficiency, and a lifetime of zero maintenance." },
      { title: "High-End Siding", description: "Fiber cement siding configured to stand strong against moisture rot, pests, and high wind impacts, instantly boosting your curb appeal." },
      { title: "Seamless Gutters", description: "High-capacity aluminum water drainage channels manufactured custom on-site to perfectly fit your roof perimeter and protect your soil foundations." },
    ],
  },
  servicesSection: {
    headline: "What We Provide",
    title: "Services We Provide in This Area",
    items: [
      { title: "Residential Roofing", description: "Pristine asphalt shingle and standing seam metal roof replacements designed for ultimate local storm immunity.", buttonText: "Explore Service", buttonHref: "/services/residential-roofing", icon: "Home" },
      { title: "Commercial Roofing", description: "Heavy-duty TPO, EPDM, and flat roof coatings configured for Missouri commercial properties and corporate facilities.", buttonText: "Explore Service", buttonHref: "/services/commercial-roofing", icon: "Building" },
      { title: "Seamless Gutters", description: "Custom on-site rolled high-capacity aluminum gutter installations to secure proper rain drainage controls.", buttonText: "Explore Service", buttonHref: "/services/seamless-gutters", icon: "Droplets" },
    ],
  },
  regionsSection: {
    title: "Communities We Serve in This Region",
    description: "Select a county to view the communities and zip codes we cover.",
  },
  regions: [
    {
      name: "St. Louis County",
      cities: ["Chesterfield", "Wildwood", "Ballwin", "Kirkwood", "Webster Groves", "Florissant", "Hazelwood", "Maryland Heights", "Eureka", "Fenton", "Ladue", "Clayton"],
      zipcodes: ["63017", "63005", "63011", "63021", "63122", "63119", "63031", "63042", "63043", "63025", "63026", "63124", "63105"],
    },
    {
      name: "St. Charles County",
      cities: ["St. Charles", "St. Peters", "O'Fallon", "Wentzville", "Lake St. Louis", "Cottleville", "Weldon Spring", "Defiance"],
      zipcodes: ["63301", "63303", "63304", "63376", "63366", "63368", "63385", "63367"],
    },
    {
      name: "Jefferson County",
      cities: ["Arnold", "Imperial", "Festus", "Hillsboro", "House Springs", "Barnhart"],
      zipcodes: ["63010", "63052", "63028", "63050", "63051", "63012"],
    },
  ],
  whyChoose: {
    headline: "Why Choose Us",
    title: "Elite Missouri Roofing Quality",
    featuredBadge: "Highly Requested",
    items: [
      { title: "Licensed & Fully Insured", description: "Complete compliance for your peace of mind. We hold full general liability, workers' comp, and active licensing across all service counties." },
      { title: "Rapid Storm Dispatch", description: "Expedited emergency tarping and inspections. St. Louis storm damage requires immediate action, and our teams respond directly inside our operational radius." },
      { title: "Veteran Owned Standards", description: "Applying military precision, honor, and elite craftsmanship to every shingle repair, gutter build, and residential siding replacement." },
    ],
  },
  overview: {
    headline: "Local Overview",
    title: "Elite Roofing & Restoration in This Community",
    description:
      "<p>Proudly providing premium residential roofing, standing seam metal builds, siding updates, and gutter cleanups to Missouri homeowners. We combine veteran precision with durable local materials.</p>",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact",
    image: "",
  },
  cta: {
    headline: "Ready to Start Your Project?",
    description:
      "Whether you need a minor repair or a complete roof replacement, our expert team is ready to protect your home. Contact us today for an elite-grade service experience.",
    buttonText: "Schedule Free Inspection",
    buttonHref: "#contact",
  },
};

// Icon each card falls back to when the admin has not picked one (by position).
// The editor uses the same lists so its icon picker highlights what the page really shows.
export const SERVICE_AREA_DEFAULT_ICONS = {
  process: ["ClipboardCheck", "TrendingUp", "Hammer", "Sparkles"],
  materials: ["Building", "Flame", "PencilRuler", "Droplets"],
  whyChoose: ["Shield", "Clock", "Award"],
  services: ["Shield"],
} as const;

// Sections the editor fills in (deep-copied) the first time it opens a page that lacks them.
export const SERVICE_AREA_HYDRATE_KEYS = [
  "hero",
  "stats",
  "process",
  "processSection",
  "regions",
  "regionsSection",
  "map",
  "materials",
  "servicesSection",
  "whyChoose",
  "overview",
  "cta",
] as const;

/** Hero/CTA/Overview buttons that mean "let me get in touch": scroll to #contact / open Quick Quote. */
export const isQuoteAnchor = (href?: string | null) =>
  typeof href === "string" && /^#(contact|contact-form|quote|quick-quote|get-quote)$/i.test(href.trim());
