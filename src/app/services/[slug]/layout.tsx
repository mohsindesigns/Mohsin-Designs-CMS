import type { Metadata } from "next";
import connectToDatabase from "@/lib/mongodb";
import SiteContent from "@/models/Content";
import { BASE_URL } from "@/lib/constants";

// ─────────────────────────────────────────────
// Per-page SEO map — title, description, keywords, JSON-LD
// ─────────────────────────────────────────────
const seoMap: Record<
  string,
  {
    title: string;
    description: string;
    keywords: string[];
    faqJsonLd: object;
    serviceJsonLd: object;
  }
> = {
  "residential-roofing": {
    title:
      "Residential Roofing St. Louis MO | Roof Replacement & Repair | Eagle Revolution",
    description:
      "Expert residential roof replacement & repair in St. Louis, MO. 50-year warranty, Class 4 impact-resistant shingles, IKO & CertainTeed certified. Veteran-owned. Free drone inspection. Hail & storm damage specialists. Call 636-449-9714.",
    keywords: [
      "residential roofing St. Louis MO",
      "roof replacement St. Louis",
      "roof repair St. Louis MO",
      "storm damage roof repair Missouri",
      "hail damage roof repair St. Louis",
      "emergency roof repair St. Louis MO",
      "asphalt shingle roof replacement Missouri",
      "architectural shingles St. Louis",
      "50 year roofing warranty Missouri",
      "Class 4 impact resistant shingles St. Louis",
      "IKO certified roofing contractor Missouri",
      "CertainTeed certified roofer St. Louis",
      "free roof inspection St. Louis MO",
      "free roofing estimate St. Louis",
      "best roofer St. Louis MO",
      "top rated roofing company Missouri",
      "veteran owned roofing company St. Louis",
      "roof insurance claim help Missouri",
      "will insurance cover roof replacement",
      "how much does a roof replacement cost St. Louis",
      "roof replacement near me Missouri",
      "Owens Corning shingles installer St. Louis",
      "GAF Timberline installer Missouri",
      "roof decking OSB replacement St. Louis",
      "ice and water shield installation Missouri",
      "ridge vent installation St. Louis",
      "roof inspection after hail storm Missouri",
      "spring roof inspection St. Louis",
      "post storm roof inspection Missouri",
      "roof financing St. Louis MO",
      "roofing contractor Chesterfield MO",
      "roofing contractor O'Fallon MO",
      "roofing contractor Ballwin MO",
      "roofing contractor Wildwood MO",
      "roofing contractor Kirkwood MO",
      "roofing contractor Creve Coeur MO",
      "roofing contractor Wentzville MO",
      "when should I replace my roof",
      "signs I need a new roof",
      "how long does a roof last Missouri",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/residential-roofing/#service`,
      name: "Residential Roofing St. Louis MO",
      alternateName: ["Roof Replacement St. Louis", "Roof Repair St. Louis"],
      serviceType: "Residential Roofing",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: [
        { "@type": "City", name: "St. Louis" },
        { "@type": "City", name: "Chesterfield" },
        { "@type": "City", name: "O'Fallon" },
        { "@type": "City", name: "Wildwood" },
        { "@type": "City", name: "Ballwin" },
        { "@type": "State", name: "Missouri" },
      ],
      description:
        "Expert residential roof replacement, repair, and storm damage restoration in St. Louis, MO. Architectural asphalt shingles with 50-year manufacturer warranties. Free drone inspections and full insurance claim assistance.",
      url: `${BASE_URL}/services/residential-roofing`,
      image: `${BASE_URL}/eagle-logo.png`,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          minPrice: "8000",
          maxPrice: "25000",
        },
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How long does a residential roof replacement take in St. Louis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most residential roofs in St. Louis are fully replaced and cleaned up in just 1–2 days by Eagle Revolution's disciplined crews. Larger or more complex homes may take 2–3 days.",
          },
        },
        {
          "@type": "Question",
          name: "Does Eagle Revolution help with roof insurance claims?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eagle Revolution works directly with your insurance adjuster to document all storm and hail damage, ensuring you receive the maximum coverage for a complete roof replacement — often at no out-of-pocket cost beyond your deductible.",
          },
        },
        {
          "@type": "Question",
          name: "What roofing warranty does Eagle Revolution offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eagle Revolution offers industry-leading 50-year fully transferable manufacturer warranties on premium shingle installations. We are IKO Certified Pro and CertainTeed Certified Shingle Masters, qualifying us to offer the highest warranty tiers available.",
          },
        },
        {
          "@type": "Question",
          name: "How do I know if my roof has hail damage?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Look for dents on gutters or downspouts, dark spots or bruising on shingle surfaces, granule loss in gutters, and cracked or missing shingles. Eagle Revolution offers free drone-assisted roof inspections to accurately assess storm damage without disturbing your roof.",
          },
        },
        {
          "@type": "Question",
          name: "When is storm season in St. Louis Missouri?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "St. Louis storm season peaks from April through June, with severe hail and tornado-producing storms most common in May and June. Eagle Revolution recommends a professional roof inspection every spring and after every major storm event.",
          },
        },
      ],
    },
  },

  "commercial-roofing": {
    title:
      "Commercial Roofing St. Louis MO | TPO, EPDM & Flat Roof | Eagle Revolution",
    description:
      "Expert commercial roofing in St. Louis, MO. TPO & EPDM flat roof systems with No Dollar Limit (NDL) warranties. 5M+ sqft installed. 24/7 emergency response. Certified by leading manufacturers. Free estimate. Call 636-449-9714.",
    keywords: [
      "commercial roofing St. Louis MO",
      "TPO roofing St. Louis",
      "EPDM roofing Missouri",
      "flat roof contractor St. Louis MO",
      "commercial roof replacement Missouri",
      "commercial roof repair St. Louis",
      "flat roof installation St. Louis",
      "no dollar limit warranty roofing Missouri",
      "warehouse roofing contractor St. Louis",
      "industrial roofing Missouri",
      "TPO vs EPDM roofing St. Louis",
      "commercial roofing company Missouri",
      "certified commercial roofing contractor St. Louis",
      "hot air welded TPO roofing Missouri",
      "commercial flat roof leak repair St. Louis",
      "tapered insulation flat roof St. Louis MO",
      "HVAC flashing roofing contractor Missouri",
      "commercial roof inspection St. Louis",
      "24 hour commercial roof repair Missouri",
      "best commercial roofer St. Louis MO",
      "restaurant roofing contractor Missouri",
      "office building roofing St. Louis",
      "retail roofing contractor Missouri",
      "warehouse flat roof replacement St. Louis",
      "roofing contractor St. Charles MO commercial",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/commercial-roofing/#service`,
      name: "Commercial Roofing St. Louis MO",
      serviceType: "Commercial Roofing",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Missouri" },
      description:
        "TPO, EPDM, and flat-roof commercial roofing systems with No Dollar Limit warranties. Zero downtime installation, complex HVAC flashing, and tapered insulation for standing water correction.",
      url: `${BASE_URL}/services/commercial-roofing`,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the difference between TPO and EPDM commercial roofing?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TPO is a white heat-reflective membrane hot-air welded for superior seam strength and energy savings. EPDM (rubber) is highly impact-resistant but absorbs heat. Eagle Revolution recommends TPO for most St. Louis commercial buildings due to its energy efficiency and watertight seam integrity.",
          },
        },
        {
          "@type": "Question",
          name: "What is a No Dollar Limit (NDL) warranty?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "An NDL warranty covers 100% of all labor and material costs required to repair a leak during the warranty period, backed directly by the manufacturer — not just the contractor. Eagle Revolution's certifications allow us to offer NDL warranties of up to 20 years.",
          },
        },
        {
          "@type": "Question",
          name: "Will commercial roof work disrupt my business operations?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eagle Revolution strategically stages all equipment, cranes, and dumpsters to minimize impact on your parking, loading docks, and daily operations. We can schedule phased installations or weekend work to ensure zero business disruption.",
          },
        },
      ],
    },
  },

  "custom-decks": {
    title:
      "Custom Deck Builder St. Louis MO | Composite & PVC Decks | Eagle Revolution",
    description:
      "Expert custom deck builder in St. Louis, MO. Premium composite & PVC decking, pergolas, built-in lighting & outdoor kitchens. Free 3D CAD design. 50-year fade warranty. Permit handling included. Veteran-owned. Call 636-449-9714.",
    keywords: [
      "custom deck builder St. Louis MO",
      "composite deck installation Missouri",
      "deck contractor St. Louis",
      "deck builder St. Louis MO",
      "outdoor deck construction St. Louis",
      "backyard deck builder Missouri",
      "Trex deck installer St. Louis",
      "composite vs PVC decking Missouri",
      "low maintenance deck builder St. Louis",
      "pergola installation St. Louis MO",
      "deck with built-in lighting Missouri",
      "outdoor kitchen deck St. Louis",
      "pool deck builder Missouri",
      "free 3D deck design St. Louis",
      "deck permit handling Missouri",
      "deck builder Chesterfield MO",
      "deck builder Wildwood MO",
      "deck builder O'Fallon MO",
      "deck builder Ballwin MO",
      "deck builder Kirkwood MO",
      "deck builder Creve Coeur MO",
      "deck builder Wentzville MO",
      "how much does a deck cost St. Louis",
      "average cost composite deck Missouri",
      "deck replacement St. Louis MO",
      "multi-level deck builder Missouri",
      "wraparound deck design St. Louis",
      "covered deck builder Missouri",
      "screened porch deck enclosure St. Louis",
      "deck financing options Missouri",
      "does a deck add value to home Missouri",
      "best deck builder near me St. Louis",
      "veteran owned deck contractor Missouri",
      "deck building permit requirements Missouri",
      "frost line deck footings Missouri",
      "Trex Transcend installer St. Louis",
      "Azek TimberTech deck builder Missouri",
      "Fiberon deck installer St. Louis",
      "hidden fastener deck system Missouri",
      "deck railing installation St. Louis MO",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/custom-decks/#service`,
      name: "Custom Composite & PVC Deck Builder St. Louis MO",
      alternateName: ["Deck Installation St. Louis", "Deck Builder Missouri"],
      serviceType: "Deck Construction",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: [
        { "@type": "City", name: "St. Louis" },
        { "@type": "City", name: "Chesterfield" },
        { "@type": "City", name: "Wildwood" },
        { "@type": "City", name: "O'Fallon" },
        { "@type": "City", name: "Ballwin" },
        { "@type": "State", name: "Missouri" },
      ],
      description:
        "Custom outdoor living deck design and construction in St. Louis, MO. Premium composite and PVC decking with 50-year warranties. Free 3D CAD design, full permit handling, and built-in lighting available.",
      url: `${BASE_URL}/services/custom-decks`,
      image: `${BASE_URL}/eagle-logo.png`,
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          minPrice: "15000",
          maxPrice: "50000",
        },
        availability: "https://schema.org/InStock",
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the best decking material: composite or PVC?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Both are excellent low-maintenance options. Composite decking blends wood fibers and plastic for a natural look. Cellular PVC is 100% polymer — fully waterproof, lighter, and available in brighter colors, making it ideal for pool decks or shaded areas in St. Louis. Eagle Revolution offers free 3D design consultations for both.",
          },
        },
        {
          "@type": "Question",
          name: "How much does a composite deck cost in St. Louis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "A custom composite deck in St. Louis typically costs between $15,000 and $45,000+ depending on size, materials, railings, and add-ons like pergolas or built-in lighting. Eagle Revolution provides free, no-obligation detailed quotes.",
          },
        },
        {
          "@type": "Question",
          name: "Do I need a permit to build a deck in Missouri?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Most Missouri municipalities require a building permit for attached decks or decks above a certain height. Eagle Revolution handles the entire permitting process — from rendering blueprints to meeting city inspectors — so you never have to worry about it.",
          },
        },
        {
          "@type": "Question",
          name: "How long does it take to build a custom deck?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Most custom decks built by Eagle Revolution take 1–2 weeks from breaking ground, depending on size and municipal inspection timelines. We provide a complete project schedule upfront so you always know what to expect.",
          },
        },
        {
          "@type": "Question",
          name: "Does a new deck increase home value in St. Louis?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes — a professionally built composite deck can return 60–80% of its cost at resale and significantly increases your home's marketability in the St. Louis market. It also expands usable living space and enhances curb appeal.",
          },
        },
      ],
    },
  },

  "pvc-decking": {
    title:
      "PVC Decking Installation St. Louis MO | 100% Waterproof Decks | Eagle Revolution",
    description:
      "100% waterproof cellular PVC decking installation in St. Louis, MO. Lifetime rot warranty, mold-proof, pool-ready. Lighter & cooler than composite. Azek, TimberTech & Fiberon installers. Free design consultation. Call 636-449-9714.",
    keywords: [
      "PVC decking St. Louis MO",
      "PVC deck builder Missouri",
      "waterproof deck installation St. Louis",
      "cellular PVC decking contractor Missouri",
      "pool deck builder St. Louis MO",
      "Azek deck installer Missouri",
      "TimberTech PVC deck St. Louis",
      "100% waterproof deck Missouri",
      "mold proof deck St. Louis",
      "low maintenance PVC deck Missouri",
      "PVC deck vs composite deck St. Louis",
      "does PVC decking get hot",
      "does PVC decking fade",
      "how long does PVC decking last",
      "cellular PVC deck contractor St. Louis",
      "PVC deck builder Chesterfield MO",
      "PVC deck Wildwood MO",
      "pool surround deck builder Missouri",
      "best PVC decking material St. Louis",
      "Cortex hidden screw PVC decking Missouri",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/pvc-decking/#service`,
      name: "PVC Decking Installation St. Louis MO",
      serviceType: "PVC Deck Construction",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Missouri" },
      description:
        "100% cellular PVC decking installation — fully waterproof, mold-proof, and pool-ready. Lighter and cooler than composite with 50-year rot warranties.",
      url: `${BASE_URL}/services/pvc-decking`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the difference between PVC and composite decking?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Composite decking contains wood fibers blended with plastic and can absorb trace moisture. PVC decking is 100% polymer — fully waterproof, lighter, and available in brighter, cooler colors. It's the superior choice for pool decks, shaded areas, or any high-moisture environment.",
          },
        },
        {
          "@type": "Question",
          name: "Does PVC decking get hot in summer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "PVC decking in lighter colors stays significantly cooler than darker composite boards in direct summer sun. Eagle Revolution recommends specific cool-touch PVC lines for pool areas and sunny Missouri decks to ensure barefoot comfort even in July.",
          },
        },
        {
          "@type": "Question",
          name: "Is PVC decking slippery when wet?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Premium PVC brands feature an embossed wood-grain texture that provides excellent traction even around pools. Eagle Revolution specifically recommends wet-application PVC lines for pool surrounds and dock areas.",
          },
        },
      ],
    },
  },

  "siding-soffit-fascia": {
    title:
      "Siding, Soffit & Fascia Installation St. Louis MO | Eagle Revolution",
    description:
      "Premium vinyl & composite siding installation in St. Louis, MO. 500+ color options, 200+ MPH wind rating, insulated upgrade R-10. Soffit & fascia aluminum capping. Veteran-owned. Free estimate. Call 636-449-9714.",
    keywords: [
      "siding installation St. Louis MO",
      "vinyl siding contractor Missouri",
      "soffit and fascia repair St. Louis",
      "soffit and fascia replacement Missouri",
      "insulated siding St. Louis",
      "aluminum fascia capping Missouri",
      "exterior siding contractor St. Louis",
      "home siding replacement Missouri",
      "siding and roofing contractor St. Louis",
      "board and batten siding Missouri",
      "wood grain vinyl siding St. Louis",
      "fiber cement siding Missouri",
      "siding contractor Chesterfield MO",
      "siding contractor Wildwood MO",
      "siding contractor O'Fallon MO",
      "best siding contractor St. Louis MO",
      "how long does vinyl siding last",
      "insulated siding energy savings Missouri",
      "vented soffit installation St. Louis",
      "rot repair siding Missouri",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/siding-soffit-fascia/#service`,
      name: "Siding, Soffit & Fascia Installation St. Louis MO",
      serviceType: "Siding Installation",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Missouri" },
      description:
        "Premium vinyl and composite siding installation with 200+ MPH wind resistance, lifetime fade warranty, and optional R-10 insulated upgrade. Soffit and fascia aluminum capping available.",
      url: `${BASE_URL}/services/siding-soffit-fascia`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How long does vinyl siding last in Missouri?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "High-quality premium vinyl siding can last 30–50 years or longer in Missouri's climate, maintaining its color without needing to be repainted. Eagle Revolution installs siding with fade-resistant finishes backed by lifetime manufacturer warranties.",
          },
        },
        {
          "@type": "Question",
          name: "Why should I replace my soffit and fascia?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Rotting soffit and fascia allow pests into your attic, restrict necessary airflow leading to mold growth, and signal water damage. Wrapping them in aluminum permanently solves these issues and eliminates future painting needs.",
          },
        },
      ],
    },
  },

  "windows-doors": {
    title:
      "Window & Door Replacement St. Louis MO | Energy Star Rated | Eagle Revolution",
    description:
      "Energy Star rated window & door replacement in St. Louis, MO. Save up to 35% on energy bills. Low-E glass, argon gas, custom vinyl options. Sound-reducing insulation. Multi-point door locks. Veteran-owned. Call 636-449-9714.",
    keywords: [
      "window replacement St. Louis MO",
      "energy efficient windows Missouri",
      "door replacement St. Louis",
      "entry door installation Missouri",
      "Energy Star windows St. Louis",
      "Low-E window installer Missouri",
      "double pane window replacement St. Louis",
      "vinyl window contractor Missouri",
      "window and door contractor St. Louis MO",
      "argon gas windows Missouri",
      "window replacement near me St. Louis",
      "best window replacement company St. Louis",
      "window replacement Chesterfield MO",
      "window replacement O'Fallon MO",
      "window replacement Wildwood MO",
      "how much does window replacement cost St. Louis",
      "energy savings window upgrade Missouri",
      "sound proof windows St. Louis",
      "home window upgrade Missouri",
      "window financing St. Louis MO",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/windows-doors/#service`,
      name: "Window & Door Replacement St. Louis MO",
      serviceType: "Window Replacement",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Missouri" },
      description:
        "Energy Star certified window and entry door installation with up to 35% energy savings. Low-E glass, argon fills, and multi-point locking systems for security and efficiency.",
      url: `${BASE_URL}/services/windows-doors`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "How much can I save on energy bills with new windows?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Homeowners in St. Louis typically save 25–35% on heating and cooling costs after installing Energy Star rated windows with Low-E coating and argon gas fills. Eagle Revolution exclusively installs Energy Star certified products backed by up to 99-year glass warranties.",
          },
        },
        {
          "@type": "Question",
          name: "Are your windows Energy Star certified?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Eagle Revolution exclusively installs Energy Star rated windows utilizing Low-E coatings and argon gas technology. All our window installations meet or exceed Missouri's climate zone energy efficiency requirements.",
          },
        },
      ],
    },
  },

  "gutters-protection": {
    title:
      "Seamless Gutter Installation St. Louis MO | Leaf Guards | Eagle Revolution",
    description:
      "Seamless aluminum gutter installation & micro-mesh leaf guards in St. Louis, MO. On-site fabrication, 6-inch capacity, zero-clog guarantee. Foundation protection specialist. Veteran-owned. 24h turnaround. Call 636-449-9714.",
    keywords: [
      "gutter installation St. Louis MO",
      "seamless gutter contractor Missouri",
      "leaf guard installation St. Louis",
      "gutter replacement St. Louis MO",
      "micro mesh gutter guard Missouri",
      "6 inch seamless gutters St. Louis",
      "gutter protection contractor Missouri",
      "gutter cleaning and repair St. Louis",
      "gutter and downspout replacement Missouri",
      "foundation protection gutters St. Louis",
      "seamless aluminum gutters near me",
      "best gutter company St. Louis MO",
      "gutter contractor Chesterfield MO",
      "gutter contractor O'Fallon MO",
      "gutter contractor Wildwood MO",
      "how much does gutter installation cost Missouri",
      "do I need leaf guards Missouri",
      "6 inch vs 5 inch gutters",
      "gutter guard that works Missouri",
      "clog free gutters St. Louis",
    ],
    serviceJsonLd: {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${BASE_URL}/services/gutters-protection/#service`,
      name: "Seamless Gutter Installation & Leaf Guards St. Louis MO",
      serviceType: "Gutter Installation",
      provider: { "@id": `${BASE_URL}/#organization` },
      areaServed: { "@type": "State", name: "Missouri" },
      description:
        "On-site fabricated seamless 6-inch aluminum gutters with micro-mesh leaf protection. Zero-clog guaranteed, hidden bracket system, and foundation protection drainage engineering.",
      url: `${BASE_URL}/services/gutters-protection`,
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
      },
    },
    faqJsonLd: {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Why choose 6-inch gutters over 5-inch gutters?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "6-inch gutters hold roughly 40% more water than 5-inch gutters. Given the severity of midwestern storms in St. Louis, this added capacity prevents devastating overflow that can erode your foundation and flood your basement.",
          },
        },
        {
          "@type": "Question",
          name: "How do seamless gutters work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Eagle Revolution brings a machine directly to your home that rolls out a single continuous piece of aluminum cut to the exact length of your roofline. No mid-run seams means no mid-run leaks — ever.",
          },
        },
      ],
    },
  },
};

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectToDatabase();
  const content = await SiteContent.findOne({ key: "complete_data" }).lean() as any;
  const services = content?.data?.services?.services || [];
  const service = services.find((s: any) => s.slug === slug);

  if (!service) {
    return {
      title: "Service Not Found",
      robots: { index: false, follow: false },
    };
  }

  const seo = service.seo || {};

  const title = seo.metaTitle || seo.title || service.title;
  const description = seo.metaDescription || seo.description;

  return {
    title,
    description,
    robots: {
      index: seo.metaRobotsIndex !== 'noindex',
      follow: seo.metaRobotsFollow !== 'nofollow',
      ...(seo.metaRobotsIndex !== 'noindex' && {
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      })
    },
    alternates: {
      canonical: `${BASE_URL}/services/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/services/${slug}`,
      type: "website",
      images: [
        {
          url: seo.featuredImage || seo.ogImage || `${BASE_URL}/eagle-logo.png`,
          width: 1200,
          height: 630,
          alt: service.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [seo.featuredImage || seo.twitterImage || seo.ogImage || `${BASE_URL}/eagle-logo.png`],
    },
  };
}

export default function ServiceDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

export { seoMap };
