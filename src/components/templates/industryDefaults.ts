// Built-in sample content for the Industry template.
//
// Shared by IndustryTemplate (shows these when the admin has not saved any cards yet) and
// IndustryEditor (offers a "Load the built-in examples" button so the admin can EDIT exactly
// what the public page is showing instead of staring at an empty list). Keep the two in sync
// by importing from here - do not duplicate these arrays.

export interface IndustryDomain {
  id: string;
  title: string;
  desc: string;
  iconName: string;
  tags: string[];
  link?: string;
}

export interface IndustryFeature {
  title: string;
  desc: string;
  iconName: string;
  iconBg: "amber" | "blue";
}

export const DEFAULT_INDUSTRY_DOMAINS: IndustryDomain[] = [
  {
    id: "01",
    title: "Healthcare & MedTech",
    desc: "HIPAA-compliant, trustworthy patient portals and medical practice booking systems.",
    iconName: "Heart",
    tags: ["HIPAA Compliance", "Telehealth", "Patient Portals"],
  },
  {
    id: "02",
    title: "FinTech & Financial Services",
    desc: "Ultra-secure financial dashboards, loan calculators, and bank-grade digital security.",
    iconName: "ShieldCheck",
    tags: ["FinTech", "SOC2 Compliant", "Real-time Telemetry"],
  },
  {
    id: "03",
    title: "E-Commerce & High-Volume Retail",
    desc: "Sub-second product catalogs, custom Shopify headless setups, and frictionless checkouts.",
    iconName: "ShoppingCart",
    tags: ["Headless Commerce", "Shopify Plus", "Conversion Rate"],
  },
  {
    id: "04",
    title: "Legal & Professional Services",
    desc: "Authoritative, lead-generating corporate websites for law firms and consultancy practices.",
    iconName: "Scale",
    tags: ["Lead Capture", "Case Studies", "SEO Authority"],
  },
  {
    id: "05",
    title: "B2B SaaS & Enterprise Technology",
    desc: "Product tour interfaces, documentation hubs, and high-velocity SaaS landing systems.",
    iconName: "Cpu",
    tags: ["SaaS Funnels", "Product Tours", "API Portals"],
  },
  {
    id: "06",
    title: "Real Estate & Architecture",
    desc: "High-resolution property showcases, dynamic MLS mapping, and interactive floorplans.",
    iconName: "Building2",
    tags: ["Property Hubs", "Interactive Maps", "Luxury Design"],
  },
];

export const DEFAULT_INDUSTRY_FEATURES: IndustryFeature[] = [
  {
    title: "Sub-Second Edge Speeds",
    desc: "Lightning fast asset delivery and edge routing boosting Core Web Vitals to 100/100.",
    iconName: "Zap",
    iconBg: "amber",
  },
  {
    title: "Conversion-First UX Flow",
    desc: "Psychologically optimized layouts engineered to maximize form completions and discovery calls.",
    iconName: "Target",
    iconBg: "blue",
  },
  {
    title: "Clean Modular Code",
    desc: "Zero technical debt. Modular React and Next.js components built to scale effortlessly.",
    iconName: "Code",
    iconBg: "blue",
  },
  {
    title: "Guaranteed Security & Uptime",
    desc: "Serverless cloud infrastructure backed by automatic SSL and 99.9% uptime guarantees.",
    iconName: "ShieldCheck",
    iconBg: "amber",
  },
];

/** Zero-padded card number: 1 -> "01", 12 -> "12" (the old `0${n}` produced "010" from card 10 on). */
export const padIndex = (n: number) => String(n).padStart(2, "0");
