"use client";

import React, { useState, useEffect } from "react";
import {
  Plus, Pencil, Trash2, Loader2, Save, X,
  ChevronRight, ExternalLink, Image as ImageIcon,
  Check, MoveUp, MoveDown, Star, Sparkles, Layout,
  Layers, Settings, Info, Shield, CheckCircle2,
  Search, ArrowRight, Eye, Copy, RefreshCw, FileText,
  Calendar, Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ImageField from "@/components/admin/ImageField";
import IconSelector from "@/components/admin/IconSelector";
import SeoEditor from "@/components/admin/SeoEditor";
import MediaSelector from "@/components/admin/MediaSelector";
import { BASE_URL } from "@/lib/constants";
import { UI } from "@/components/admin/editors/styles";
import { AVAILABLE_COUNTRIES, resolveCountryLocation, COUNTRIES_DATABASE } from "@/lib/countryLocations";

// ── Bullet Point / Array Input Helper ────────────────────────────────────────
function BulletListEditor({
  label,
  items = [],
  onChange,
  placeholder = "Add an item..."
}: {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  const currentItems = Array.isArray(items) ? items : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className={UI.label}>{label}</label>
        <button
          type="button"
          onClick={() => onChange([...currentItems, ""])}
          className="text-[12px] font-bold text-[#2271b1] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Add Point
        </button>
      </div>

      <div className="space-y-2">
        {currentItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-[12px] font-mono font-bold text-[#8c8f94] w-6 text-right shrink-0">
              {idx + 1}.
            </span>
            <input
              type="text"
              value={item}
              placeholder={placeholder}
              onChange={(e) => {
                const updated = [...currentItems];
                updated[idx] = e.target.value;
                onChange(updated);
              }}
              className={UI.input}
            />
            <button
              type="button"
              onClick={() => {
                const updated = currentItems.filter((_, i) => i !== idx);
                onChange(updated);
              }}
              className="text-[#d63638] hover:text-red-700 p-1.5 shrink-0"
              title="Delete point"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {currentItems.length === 0 && (
          <div className="text-[12px] text-[#8c8f94] italic py-1">
            No items yet. Click <span className="font-bold text-[#2271b1] cursor-pointer" onClick={() => onChange([""])}>+ Add Point</span> to add entries.
          </div>
        )}
      </div>
    </div>
  );
}

// ── Comma Separated Text Input ───────────────────────────────────────────────
function CommaSeparatedInput({
  value,
  onChange,
  className,
  placeholder,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  className?: string;
  placeholder?: string;
}) {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.join(", ") : ""));

  useEffect(() => {
    const current = Array.isArray(value) ? value.join(", ") : "";
    const parsedCurrent = current.split(",").map((s) => s.trim()).filter(Boolean);
    const parsedText = text.split(",").map((s) => s.trim()).filter(Boolean);
    if (JSON.stringify(parsedCurrent) !== JSON.stringify(parsedText)) {
      setText(current);
    }
  }, [value]);

  return (
    <input
      type="text"
      autoComplete="off"
      value={text}
      onChange={(e) => {
        const raw = e.target.value;
        setText(raw);
        const parsed = raw.split(",").map((s) => s.trim()).filter(Boolean);
        onChange(parsed);
      }}
      className={className}
      placeholder={placeholder}
    />
  );
}

// ── Default Template ─────────────────────────────────────────────────────────
const DEFAULT_SERVICE_TEMPLATE = {
  title: "",
  slug: "",
  tag: "Premium Solution",
  icon: "Search",
  status: "published",
  createdAt: new Date().toISOString(),
  hero: {
    titleIntro: "Transform Your Business With",
    titleHighlight: "Expert Solutions",
    description: "High-performance digital engineering and growth architecture tailored to maximize brand equity.",
    backgroundImage: "/portfolio_hero_bg.png",
    bgImage: "/portfolio_hero_bg.png",
    primaryCta: {
      text: "Start Your Project",
      link: "#contact-form"
    },
    secondaryCta: {
      text: "Explore Inclusions",
      link: "#what-included"
    },
    benefits: [
      "Data-Driven Growth Strategies",
      "Next.js Speed & Performance",
      "Conversion-Focused Architecture",
      "Dedicated Support & Real-Time Sync"
    ],
    formHeading: "Request a Free Audit",
    formSubheading: "Direct architect consultation and custom scope estimation within 24 hours.",
    formButtonText: "Request Free Proposal"
  },
  clientTrust: {
    heading: "ENTERPRISE PLATFORMS WE INTEGRATE & ACCELERATE",
    logos: [
      { name: "Google Ads", icon: "Search", image: "" },
      { name: "Meta Business", icon: "Monitor", image: "" },
      { name: "Amazon Ads", icon: "ShoppingCart", image: "" },
      { name: "Bing Ads", icon: "Search", image: "" },
      { name: "Apple Search", icon: "Cpu", image: "" }
    ]
  },
  whatIncluded: {
    eyebrow: "03 // CORE CAPABILITIES",
    titleIntro: "What's Included in",
    titleHighlight: "Our Delivery",
    pillars: [
      {
        title: "Strategic Discovery & Architecture",
        desc: "Deep analysis of existing infrastructure, competitor positioning, and high-impact revenue paths.",
        features: ["Technical Infrastructure Audit", "Competitor Matrix Analysis", "Custom Scope Blueprint"]
      },
      {
        title: "High-Performance Execution",
        desc: "Implementation powered by clean modular code, fast edge rendering, and conversion-optimized UI/UX.",
        features: ["Precision Development", "Conversion Rate Optimization", "Automated QA Protocols"]
      },
      {
        title: "Attribution & Scalable Growth",
        desc: "Continuous monitoring, live telemetry tracking, and iterative growth loops to ensure positive ROI.",
        features: ["Real-time Data Dashboards", "A/B Multivariate Testing", "Ongoing Growth Support"]
      }
    ]
  },
  strategy: {
    eyebrow: "04 // STRATEGIC APPROACH",
    titleIntro: "Engineered For",
    titleHighlight: "Compounding Impact",
    description: "A custom implementation plan targeting bottlenecks and compounding acquisition flows.",
    components: [
      { num: "01", title: "Diagnostic Audit & Benchmark", desc: "We isolate inefficiencies, crawl errors, and technical bottlenecks before deploying capital." },
      { num: "02", title: "High-Intent Positioning Map", desc: "Prioritizing high-margin conversions and capturing immediate commercial purchase intent." },
      { num: "03", title: "Systemic Deployment & Scale", desc: "Launching verified updates across digital touchpoints to capture maximum market share." }
    ]
  },
  benefits: {
    eyebrow: "05 // MEASURABLE OUTCOMES",
    titleIntro: "Key Business",
    titleHighlight: "Advantages",
    description: "Delivering concrete enterprise value through robust technical architecture and conversion science.",
    list: [
      { num: "01", title: "Compounding Traffic & Authority", desc: "Sustainable search visibility built on clean semantic markup and fast core web vitals.", tag: "Organic Reach" },
      { num: "02", title: "Maximized Conversion Velocity", desc: "User flows and page speed optimized to turn first-time visitors into long-term enterprise clients.", tag: "Conversion" },
      { num: "03", title: "Enterprise Scalability", desc: "Zero technical debt architecture ready to scale without performance degradation.", tag: "Engineering" }
    ]
  },
  process: {
    eyebrow: "06 // EXECUTION PROCESS",
    titleIntro: "A Systematic Path To",
    titleHighlight: "Market Leadership",
    description: "From discovery to post-launch optimization, our methodology is built for speed and precision.",
    calloutTag: "// PROCESS COMPLIANCE",
    calloutText: "Every milestone is cataloged in the shared workspace, providing real-time deployment logs and verification reports.",
    steps: [
      { step: "01", title: "Discovery & Analysis", desc: "Comprehensive technical review and competitive audit.", badge: "PHASE 01", deliverables: ["Technical Audit", "Stack Mapping"] },
      { step: "02", title: "System Architecture", desc: "Designing scalable blueprints and modular component design.", badge: "PHASE 02", deliverables: ["Figma Wireframes", "UX Flows"] },
      { step: "03", title: "Production Build", desc: "Writing clean, performant Next.js code with zero compromises.", badge: "PHASE 03", deliverables: ["Next.js Build", "API Endpoints"] },
      { step: "04", title: "QA & Deployment", desc: "Rigorous automated testing and live production deployment.", badge: "PHASE 04", deliverables: ["WCAG 2.1 Audit", "Stress Testing"] }
    ]
  },
  results: {
    eyebrow: "07 // PROVEN IMPACT",
    titleIntro: "Real Results For",
    titleHighlight: "Ambitious Brands",
    description: "Data-driven outcomes delivered across high-growth industries.",
    metrics: [
      { value: "+340%", label: "Organic Search Lift", subtext: "Average client lift within 90 days of rollout" },
      { value: "<0.8s", label: "Page Load Speed", subtext: "Global average largest contentful paint" },
      { value: "4.9/5", label: "Client Satisfaction", subtext: "Across 120+ custom enterprise deployments" }
    ],
    caseStudies: [
      {
        title: "Enterprise Brand Growth",
        challenge: "Outdated legacy site experiencing slow load speeds and declining conversions.",
        strategy: "Engineered headless architecture with streamlined conversion pathways.",
        outcome: "+240% Qualified Inbound Inquiries",
        outcomeLabel: "Campaign Outcome"
      }
    ],
    caseStudy: {
      title: "Global Logistics Redesign",
      metric: "+420% Inbound Pipeline",
      desc: "Complete re-architecture of the enterprise booking flow resulting in 4.2x qualified inbound lead volume.",
      image: "/portfolio_hero_bg.png",
      link: "/portfolio"
    }
  },
  industries: {
    eyebrow: "08 // DOMAIN EXPERTISE",
    titleIntro: "Tailored For High-Growth",
    titleHighlight: "Industry Verticals",
    description: "Specialized engineering tailored to the unique regulatory, technical, and conversion demands of your sector.",
    items: [
      { name: "SaaS & Enterprise Tech", desc: "Product-led growth architecture, interactive documentation, and high-converting onboarding funnels.", icon: "Cpu" },
      { name: "E-Commerce & Retail", desc: "Headless storefronts, ultra-fast checkout flows, and dynamic inventory synchronization.", icon: "ShoppingCart" },
      { name: "Finance & Fintech", desc: "SOC2 compliant UI, data encryption standards, and real-time transaction dashboards.", icon: "DollarSign" },
      { name: "Healthcare & MedTech", desc: "HIPAA-aligned web infrastructure, patient portals, and accessible responsive interfaces.", icon: "Shield" }
    ]
  },
  tools: {
    eyebrow: "09 // TECHNICAL STACK",
    titleIntro: "Modern Technologies We",
    titleHighlight: "Master & Deploy",
    description: "We build on an elite, battle-tested modern web stack for maximum performance, security, and long-term maintainability.",
    categories: [
      { category: "Frontend & Frameworks", items: ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "Framer Motion"] },
      { category: "Backend & Database", items: ["Node.js", "MongoDB", "PostgreSQL", "Prisma", "Redis"] },
      { category: "Infrastructure & Edge", items: ["Vercel Edge", "AWS CloudFront", "Cloudflare", "Docker", "GitHub Actions"] }
    ]
  },
  whyChooseUs: {
    eyebrow: "10 // WHY CHOOSE US",
    titleIntro: "Why Industry Leaders",
    titleHighlight: "Partner With Us",
    description: "We don't just build websites; we engineer durable competitive advantages for market-leading brands.",
    points: [
      { title: "Zero Technical Debt", desc: "Clean, modular, fully typed codebase structured for lifetime extensibility.", icon: "CheckCircle2" },
      { title: "Direct Architect Access", desc: "Work directly with senior engineers and designers with zero middle-management bloat.", icon: "Users" },
      { title: "Performance Guarantees", desc: "Every deployment is guaranteed 95+ Google Lighthouse scores across all metrics.", icon: "Zap" },
      { title: "Transparent Fixed Pricing", desc: "Clear milestones, defined deliverables, and predictable timelines with zero hidden fees.", icon: "Award" }
    ]
  },
  pricing: {
    eyebrow: "11 // ENGAGEMENT MODELS",
    titleIntro: "Transparent Pricing For",
    titleHighlight: "Every Scale",
    description: "Choose the right engagement tier for your immediate goals, with flexible scaling as your brand expands.",
    plans: [
      {
        name: "Growth Sprint",
        price: "$4,500",
        period: "/ project",
        description: "Ideal for growing brands needing a high-performance targeted overhaul or single core feature.",
        popular: false,
        features: [
          "Complete Technical & UX Audit",
          "Custom Single-Page Architecture",
          "Mobile-First Performance Tuning",
          "Basic Analytics & Tracking Setup",
          "2 Weeks Dedicated Support"
        ],
        ctaText: "Start Growth Sprint",
        ctaLink: "/contact"
      },
      {
        name: "Enterprise Architecture",
        price: "$9,500",
        period: "/ project",
        description: "Full-scale custom engineering, brand positioning, and conversion architecture for established market leaders.",
        popular: true,
        features: [
          "Full Multi-Page Next.js Architecture",
          "Headless CMS Integration",
          "Custom Interactive UI & Animations",
          "Advanced Telemetry & A/B Setup",
          "Full SEO Schema & Speed Optimization",
          "60 Days Priority Engineering Support"
        ],
        ctaText: "Book Architecture Session",
        ctaLink: "/contact"
      }
    ]
  },
  serviceArea: {
    sectionTag: "12 // GLOBAL OPERATIONAL HUBS",
    titleIntro: "Serving Clients Across ",
    titleHighlight: "Prime Global Markets",
    description: "Deploying high-performance digital platforms and engineering solutions worldwide.",
    ctaText: "Schedule Global Consultation",
    ctaHref: "#contact-form",
    hubs: [
      { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
      { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
      { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
      { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
    ]
  },
  finalCta: {
    eyebrow: "12 // START BUILDING",
    titleIntro: "Ready to Transform Your",
    titleHighlight: "Digital Presence?",
    description: "Schedule a technical consultation today. We'll audit your current bottlenecks and build a concrete roadmap.",
    primaryCta: { text: "Schedule Strategy Call", link: "/contact" },
    secondaryCta: { text: "View Portfolio", link: "/portfolio" },
    backgroundImage: "/portfolio_hero_bg.png"
  },
  faqBadge: "FREQUENTLY ASKED QUESTIONS",
  faqTitleIntro: "Got Questions?",
  faqTitleHighlight: "We Have Answers.",
  faqDescription: "Explore common questions regarding our turnaround times, process, deliverables, and engineering standards.",
  faqSchemaMarkup: "",
  faqs: [
    { question: "What is your typical turnaround time for this service?", answer: "Most standard deployments take 2 to 4 weeks depending on scope, custom design requirements, and integrations.", category: "Timeline" },
    { question: "Do you offer post-launch maintenance and support?", answer: "Yes, every deployment includes 30-60 days of guaranteed priority engineering support, with optional monthly retainer plans available.", category: "Support" },
    { question: "Can this service be customized for our specific technology stack?", answer: "Absolutely. We adapt our architectures to integrate seamlessly with your existing APIs, third-party databases, and cloud infrastructure.", category: "Technical" }
  ]
};

// ── Main Component ───────────────────────────────────────────────────────────
export default function ServicesAdminPage() {
  const [data, setData] = useState<any>(null);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [mainTab, setMainTab] = useState<'content' | 'seo' | 'faqs'>('content');
  const [activeSubTab, setActiveSubTab] = useState("hero");
  const [seo, setSeo] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Directory View States (Matching /admin/pages UI)
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(false);

  // New Service Quick Creation Form State
  const [newService, setNewService] = useState({
    title: "",
    slug: "",
    tag: "Premium Solution",
    status: "published"
  });

  const [form, setForm] = useState<any>(DEFAULT_SERVICE_TEMPLATE);

  const fetchServices = async () => {
    try {
      const res = await fetch(`/api/content?t=${Date.now()}`);
      const json = await res.json();
      setData(json);
      const list = Array.isArray(json.services?.services) && json.services.services.length > 0
        ? json.services.services
        : (Array.isArray(json.services) && json.services.length > 0
          ? json.services
          : (Array.isArray(json.globalServices) && json.globalServices.length > 0
            ? json.globalServices
            : (Array.isArray(json.services?.list) && json.services.list.length > 0 ? json.services.list : [])));
      setServices(list);
    } catch (err) {
      console.error("Failed to fetch services:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (isEditing !== null && form.title && !form.id) {
      const generatedSlug = form.title.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
      if (form.slug !== generatedSlug) setForm((prev: any) => ({ ...prev, slug: generatedSlug }));
    }
  }, [form.title]);

  const saveToDb = async (newServices: any[], keepEditingIdx?: number, updatedForm?: any) => {
    setSaving(true);
    const prevServicesObj = (typeof data?.services === 'object' && !Array.isArray(data?.services)) ? data.services : {};
    const updatedData = {
      ...data,
      services: {
        ...prevServicesObj,
        services: newServices
      },
      globalServices: newServices
    };
    try {
      const res = await fetch("/api/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        setData(updatedData);
        setServices(newServices);
        setMessage("Service updated.");
        setTimeout(() => setMessage(""), 3000);
        if (keepEditingIdx !== undefined) {
          setIsEditing(keepEditingIdx);
          if (updatedForm) {
            setForm(updatedForm);
          }
        } else {
          setIsEditing(null);
        }
      } else {
        setMessage("Error saving changes.");
      }
    } catch {
      setMessage("Error saving changes.");
    } finally { setSaving(false); }
  };

  const handleSaveService = () => {
    if (!form.title || !form.slug) return alert("Title and slug are required.");

    const newServices = [...services];
    const serviceData = {
      ...DEFAULT_SERVICE_TEMPLATE,
      ...form,
      seo: seo,
      id: form.id || Date.now().toString(),
      number: form.number || (services.length + 1).toString().padStart(2, '0')
    };

    let targetIdx = isEditing;
    if (isEditing !== null && isEditing < services.length) {
      newServices[isEditing] = serviceData;
    } else {
      targetIdx = services.length;
      newServices.push(serviceData);
    }
    saveToDb(newServices, targetIdx !== null ? targetIdx : undefined, serviceData);
  };

  const handleEdit = (service: any) => {
    const originalIdx = services.findIndex(orig => (orig.id && orig.id === service.id) || orig.slug === service.slug);
    setForm({
      ...DEFAULT_SERVICE_TEMPLATE,
      ...service,
      hero: {
        ...DEFAULT_SERVICE_TEMPLATE.hero,
        ...(service.hero || {}),
        primaryCta: {
          ...DEFAULT_SERVICE_TEMPLATE.hero.primaryCta,
          ...(service.hero?.primaryCta || {})
        },
        secondaryCta: {
          ...DEFAULT_SERVICE_TEMPLATE.hero.secondaryCta,
          ...(service.hero?.secondaryCta || {})
        },
        benefits: service.hero?.benefits || service.features || DEFAULT_SERVICE_TEMPLATE.hero.benefits
      },
      clientTrust: {
        ...DEFAULT_SERVICE_TEMPLATE.clientTrust,
        ...(service.clientTrust || {}),
        logos: (service.clientTrust?.logos && service.clientTrust.logos.length > 0)
          ? service.clientTrust.logos
          : DEFAULT_SERVICE_TEMPLATE.clientTrust.logos
      },
      whatIncluded: {
        ...DEFAULT_SERVICE_TEMPLATE.whatIncluded,
        ...(service.whatIncluded || {})
      },
      strategy: {
        ...DEFAULT_SERVICE_TEMPLATE.strategy,
        ...(service.strategy || {})
      },
      benefits: {
        ...DEFAULT_SERVICE_TEMPLATE.benefits,
        ...(service.benefits || {}),
        list: service.benefits?.list || DEFAULT_SERVICE_TEMPLATE.benefits.list
      },
      process: {
        ...DEFAULT_SERVICE_TEMPLATE.process,
        ...(service.process || {}),
        steps: service.process?.steps || DEFAULT_SERVICE_TEMPLATE.process.steps
      },
      results: {
        ...DEFAULT_SERVICE_TEMPLATE.results,
        ...(service.results || {})
      },
      industries: {
        ...DEFAULT_SERVICE_TEMPLATE.industries,
        ...(service.industries || {})
      },
      tools: {
        ...DEFAULT_SERVICE_TEMPLATE.tools,
        ...(service.tools || {})
      },
      whyChooseUs: {
        ...DEFAULT_SERVICE_TEMPLATE.whyChooseUs,
        ...(service.whyChooseUs || {})
      },
      pricing: {
        ...DEFAULT_SERVICE_TEMPLATE.pricing,
        ...(service.pricing || {})
      },
      serviceArea: {
        ...DEFAULT_SERVICE_TEMPLATE.serviceArea,
        ...(service.serviceArea || {})
      },
      faqBadge: service.faqBadge || service.sectionTag || DEFAULT_SERVICE_TEMPLATE.faqBadge,
      faqTitleIntro: service.faqTitleIntro || DEFAULT_SERVICE_TEMPLATE.faqTitleIntro,
      faqTitleHighlight: service.faqTitleHighlight || DEFAULT_SERVICE_TEMPLATE.faqTitleHighlight,
      faqDescription: service.faqDescription || DEFAULT_SERVICE_TEMPLATE.faqDescription,
      faqSchemaMarkup: service.faqSchemaMarkup || "",
      faqs: service.faqs || service.faq || DEFAULT_SERVICE_TEMPLATE.faqs,
      finalCta: {
        ...DEFAULT_SERVICE_TEMPLATE.finalCta,
        ...(service.finalCta || {})
      }
    });
    setSeo(service.seo || {});
    setIsEditing(originalIdx !== -1 ? originalIdx : 0);
    setMainTab("content");
    setActiveSubTab("hero");
  };

  const handleCreateNewService = () => {
    if (!newService.title || !newService.slug) return alert("Title and Slug are required.");

    const created = {
      ...DEFAULT_SERVICE_TEMPLATE,
      id: Date.now().toString(),
      title: newService.title,
      slug: newService.slug,
      tag: newService.tag || "Premium Solution",
      status: newService.status || "published",
      createdAt: new Date().toISOString()
    };

    const newServices = [...services, created];
    saveToDb(newServices, services.length, created);
    setShowAddModal(false);
  };

  const handleQuickEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const originalIdx = services.findIndex(orig => (orig.id && orig.id === editingService.id) || orig.slug === editingService.slug);
    if (originalIdx !== -1) {
      const newServices = [...services];
      newServices[originalIdx] = {
        ...newServices[originalIdx],
        title: editingService.title,
        slug: editingService.slug,
        tag: editingService.tag,
        status: editingService.status
      };
      saveToDb(newServices);
      setEditingService(null);
    }
  };

  const toggleStatus = (service: any) => {
    const newServices = [...services];
    const originalIdx = services.findIndex(orig => (orig.id && orig.id === service.id) || orig.slug === service.slug);
    if (originalIdx !== -1) {
      newServices[originalIdx] = {
        ...newServices[originalIdx],
        status: newServices[originalIdx].status === 'draft' ? 'published' : 'draft'
      };
      saveToDb(newServices);
    }
  };

  const handleMoveToTrash = (service: any) => {
    const newServices = [...services];
    const originalIdx = services.findIndex(orig => (orig.id && orig.id === service.id) || orig.slug === service.slug);
    if (originalIdx !== -1) {
      newServices[originalIdx] = {
        ...newServices[originalIdx],
        isTrashed: true
      };
      saveToDb(newServices);
    }
  };

  const handleRestore = (service: any) => {
    const newServices = [...services];
    const originalIdx = services.findIndex(orig => (orig.id && orig.id === service.id) || orig.slug === service.slug);
    if (originalIdx !== -1) {
      newServices[originalIdx] = {
        ...newServices[originalIdx],
        isTrashed: false
      };
      saveToDb(newServices);
    }
  };

  const handleDeletePermanently = (service: any) => {
    if (!confirm("Permanently delete this service?")) return;
    const newServices = services.filter(s => (s.id ? s.id !== service.id : s.slug !== service.slug));
    saveToDb(newServices);
  };

  const handleDuplicate = (service: any) => {
    const duplicated = {
      ...service,
      id: Date.now().toString(),
      title: `${service.title} (Copy)`,
      slug: `${service.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    const newServices = [...services, duplicated];
    saveToDb(newServices);
  };

  const handleBulkAction = (action: string) => {
    if (!action || selectedIds.length === 0) return;

    if (action === 'delete') {
      if (!confirm(`Permanently delete ${selectedIds.length} services?`)) return;
      const newServices = services.filter(s => !selectedIds.includes(s.id || s.slug));
      setSelectedIds([]);
      saveToDb(newServices);
      return;
    }

    if (action === 'trash') {
      const newServices = services.map(s => selectedIds.includes(s.id || s.slug) ? { ...s, isTrashed: true } : s);
      setSelectedIds([]);
      saveToDb(newServices);
      return;
    }

    if (action === 'restore') {
      const newServices = services.map(s => selectedIds.includes(s.id || s.slug) ? { ...s, isTrashed: false } : s);
      setSelectedIds([]);
      saveToDb(newServices);
      return;
    }

    if (action === 'publish' || action === 'draft') {
      const status = action === 'publish' ? 'published' : 'draft';
      const newServices = services.map(s => selectedIds.includes(s.id || s.slug) ? { ...s, status } : s);
      setSelectedIds([]);
      saveToDb(newServices);
      return;
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredServices.length) setSelectedIds([]);
    else setSelectedIds(filteredServices.map(s => s.id || s.slug));
  };

  const toggleSelect = (idOrSlug: string) => {
    setSelectedIds(prev =>
      prev.includes(idOrSlug) ? prev.filter(i => i !== idOrSlug) : [...prev, idOrSlug]
    );
  };

  const handleAddNew = () => {
    setNewService({
      title: "",
      slug: "",
      tag: "Premium Solution",
      status: "published"
    });
    setShowAddModal(true);
  };

  const publishedCount = services.filter((s: any) => s.status !== 'draft' && !s.isTrashed).length;
  const draftCount = services.filter((s: any) => s.status === 'draft' && !s.isTrashed).length;
  const trashCount = services.filter((s: any) => !!s.isTrashed).length;

  const filteredServices = services.filter((s: any) => {
    const matchesSearch = (s.title || "").toLowerCase().includes(search.toLowerCase()) || (s.slug || "").toLowerCase().includes(search.toLowerCase());
    const isTrashed = !!s.isTrashed;

    if (filter === 'trash') return matchesSearch && isTrashed;
    if (isTrashed) return false;

    if (filter === "all") return matchesSearch;
    return matchesSearch && (s.status || "published") === filter;
  });

  const subTabs = [
    { id: "hero", label: "1. Hero & Form" },
    { id: "trust", label: "2. Trust Bar" },
    { id: "what-included", label: "3. Deliverables" },
    { id: "strategy", label: "4. Strategy Roadmap" },
    { id: "benefits", label: "5. Outcomes" },
    { id: "process", label: "6. Execution Process" },
    { id: "results", label: "7. Case Studies" },
    { id: "industries", label: "8. Target Industries" },
    { id: "tools", label: "9. Tech Stack" },
    { id: "why-us", label: "10. Why Partner" },
    { id: "pricing", label: "11. Pricing Packages" },
    { id: "serviceArea", label: "12. Global Coverage" },
    { id: "final-cta", label: "13. CTA Banner" },
  ];

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#2271b1]" /></div>;
  }

  return (
    <div className="bg-[#f0f0f1] font-sans pb-10 max-w-full overflow-hidden">
      {isEditing !== null ? (
        /* ──────────────────────────────────────────────────────────────────────────
           EXACT WORDPRESS CLASSIC SERVICE EDITOR (MATCHING /admin/pages/[id] UI)
        ────────────────────────────────────────────────────────────────────────── */
        <div>
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 text-[13px] text-[#2271b1] mb-3 px-1">
            <button onClick={() => setIsEditing(null)} className="hover:underline">Services</button>
            <ChevronRight className="w-3.5 h-3.5 text-[#646970] shrink-0" />
            <span className="text-[#646970] truncate">{form.title || "Edit Service"}</span>
          </div>

          {/* WP Header Area */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h1 className="text-[20px] font-normal text-[#1d2327] font-serif">Edit Service</h1>
              <button
                type="button"
                onClick={handleAddNew}
                className="bg-white border border-[#2271b1] text-[#2271b1] text-[12px] px-1.5 py-0.5 rounded-[3px] hover:bg-[#f0f6fb] transition-colors"
              >
                Add New
              </button>
              {form.slug && (
                <Link
                  href={`/services/${form.slug}`}
                  target="_blank"
                  className="bg-white border border-[#c3c4c7] text-[#2c3338] text-[12px] px-1.5 py-0.5 rounded-[3px] hover:bg-[#f6f7f7] transition-colors flex items-center gap-1"
                >
                  View Service <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start">
            {/* Main Content (Left Column) */}
            <div className="flex-1 min-w-0 w-full space-y-4">
              {/* Title Input Field */}
              <div className="bg-white">
                <input
                  type="text"
                  value={form.title || ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-[#c3c4c7] px-3 py-1.5 text-[16px] font-medium text-[#1d2327] focus:border-[#2271b1] focus:ring-0 outline-none placeholder:text-[#c3c4c7]"
                  placeholder="Enter title here"
                />
              </div>

              {/* Permalink / Slug Area */}
              <div className="flex flex-wrap items-center gap-1 text-[12px] text-[#646970] px-1">
                <strong>Permalink:</strong>
                <span className="bg-[#f0f0f1] border border-[#c3c4c7] px-1 rounded-sm text-[#1d2327] break-all">
                  {BASE_URL}/services/{form.slug}
                </span>
                <button
                  onClick={() => {
                    const ns = prompt("Enter new slug:", form.slug);
                    if (ns) setForm({ ...form, slug: ns });
                  }}
                  className="bg-white border border-[#c3c4c7] px-1.5 py-0.5 rounded-[3px] text-[#2c3338] hover:bg-[#f6f7f7]"
                >
                  Edit
                </button>
              </div>

              {/* Main Editor Tabs (Page Content | SEO Settings | Service FAQs) */}
              <div className="bg-white border border-[#c3c4c7] shadow-sm">
                <div className="flex border-b border-[#f0f0f1] bg-[#f6f7f7]">
                  <button
                    onClick={() => setMainTab('content')}
                    className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${
                      mainTab === 'content' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                    }`}
                  >
                    Service Content
                  </button>
                  <button
                    onClick={() => setMainTab('seo')}
                    className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${
                      mainTab === 'seo' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                    }`}
                  >
                    SEO Settings
                  </button>
                  <button
                    onClick={() => setMainTab('faqs')}
                    className={`px-3 py-2 text-[12px] font-semibold border-r border-[#c3c4c7] transition-all ${
                      mainTab === 'faqs' ? "bg-white text-[#1d2327]" : "text-[#2271b1] hover:text-[#135e96]"
                    }`}
                  >
                    Service FAQs
                  </button>
                </div>

                <div className="p-0">
                  {/* TAB 1: SERVICE CONTENT */}
                  {mainTab === 'content' && (
                    <div className="p-4 sm:p-5">
                      <div className="bg-white max-w-3xl mx-auto pb-20">
                        {/* Sub-tabs Navigation */}
                        <div className="flex flex-wrap items-center gap-1 mb-10 text-[13px] border-b border-[#f0f0f1] pb-1 sticky top-0 bg-white z-10 pt-2">
                          {subTabs.map((tab, idx) => (
                            <React.Fragment key={tab.id}>
                              <button
                                type="button"
                                onClick={() => setActiveSubTab(tab.id)}
                                className={`px-1 py-1 transition-colors ${
                                  activeSubTab === tab.id
                                    ? 'text-[#1d2327] font-bold border-b-2 border-[#2271b1]'
                                    : 'text-[#2271b1] hover:text-[#135e96]'
                                }`}
                              >
                                {tab.label}
                              </button>
                              {idx < subTabs.length - 1 && <span className="text-[#c3c4c7] px-1">|</span>}
                            </React.Fragment>
                          ))}
                        </div>

                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeSubTab}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-12"
                          >
                            {/* SUBTAB: HERO */}
                            {activeSubTab === "hero" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Branding & Icon</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Category Tag</label>
                                      <input
                                        type="text"
                                        value={form.tag || ""}
                                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                                        className={UI.input}
                                        placeholder="e.g. Premium Solution"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Menu Icon</label>
                                      <IconSelector value={form.icon || "Search"} onChange={(v) => setForm({ ...form, icon: v })} />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Premium Hero Title</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Title Intro</label>
                                      <input
                                        type="text"
                                        value={form.hero?.titleIntro || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleIntro: e.target.value } })}
                                        className={UI.input}
                                        placeholder="Transform Your Business With"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Title Highlight (Underlined / Accent)</label>
                                      <input
                                        type="text"
                                        value={form.hero?.titleHighlight || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, titleHighlight: e.target.value } })}
                                        className={UI.input + " font-bold border-[#2271b1]"}
                                        placeholder="Expert Solutions"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Hero Narrative Description</label>
                                      <textarea
                                        rows={3}
                                        value={form.hero?.description || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, description: e.target.value } })}
                                        className={UI.input}
                                        placeholder="High-performance digital engineering..."
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>3. Action Buttons</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={UI.card + " space-y-4"}>
                                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                        <span className="text-[10px] font-bold text-[#646970] uppercase">Primary Button</span>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Text / Label</label>
                                        <input
                                          type="text"
                                          value={form.hero?.primaryCta?.text || ""}
                                          onChange={(e) => setForm({
                                            ...form,
                                            hero: { ...form.hero, primaryCta: { ...form.hero?.primaryCta, text: e.target.value } }
                                          })}
                                          className={UI.input}
                                          placeholder="Start Your Project"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Link (href)</label>
                                        <input
                                          type="text"
                                          value={form.hero?.primaryCta?.link || ""}
                                          onChange={(e) => setForm({
                                            ...form,
                                            hero: { ...form.hero, primaryCta: { ...form.hero?.primaryCta, link: e.target.value } }
                                          })}
                                          className={UI.input}
                                          placeholder="#contact-form"
                                        />
                                      </div>
                                    </div>

                                    <div className={UI.card + " space-y-4"}>
                                      <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                        <span className="text-[10px] font-bold text-[#646970] uppercase">Secondary Button</span>
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Text / Label</label>
                                        <input
                                          type="text"
                                          value={form.hero?.secondaryCta?.text || ""}
                                          onChange={(e) => setForm({
                                            ...form,
                                            hero: { ...form.hero, secondaryCta: { ...form.hero?.secondaryCta, text: e.target.value } }
                                          })}
                                          className={UI.input}
                                          placeholder="Explore Inclusions"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Link (href)</label>
                                        <input
                                          type="text"
                                          value={form.hero?.secondaryCta?.link || ""}
                                          onChange={(e) => setForm({
                                            ...form,
                                            hero: { ...form.hero, secondaryCta: { ...form.hero?.secondaryCta, link: e.target.value } }
                                          })}
                                          className={UI.input}
                                          placeholder="#what-included"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>4. Media</h3>
                                  <ImageField
                                    label="Hero Bleed Background Banner"
                                    value={form.hero?.backgroundImage || form.hero?.bgImage || ""}
                                    onChange={(url) => setForm({
                                      ...form,
                                      hero: { ...form.hero, backgroundImage: url, bgImage: url }
                                    })}
                                  />
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>5. Highlights & Checklist</h3>
                                  <BulletListEditor
                                    label="Hero Checklist Inclusions"
                                    items={form.hero?.benefits || []}
                                    onChange={(b) => setForm({ ...form, hero: { ...form.hero, benefits: b } })}
                                    placeholder="e.g. Data-Driven Growth Strategies"
                                  />
                                </div>

                                <div className="space-y-6 pt-6 border-t border-[#f0f0f1]">
                                  <h3 className={UI.sectionHeader}>6. Hero Embedded Consultation Form</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Form Heading / Title</label>
                                      <input
                                        type="text"
                                        value={form.hero?.formHeading || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, formHeading: e.target.value } })}
                                        className={UI.input + " font-bold"}
                                        placeholder="e.g. Request a Free Technical Audit"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Form Subheading / Subtitle</label>
                                      <input
                                        type="text"
                                        value={form.hero?.formSubheading || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, formSubheading: e.target.value } })}
                                        className={UI.input}
                                        placeholder="e.g. Direct architect consultation within 24 hours."
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Submit Button Label</label>
                                      <input
                                        type="text"
                                        value={form.hero?.formButtonText || ""}
                                        onChange={(e) => setForm({ ...form, hero: { ...form.hero, formButtonText: e.target.value } })}
                                        className={UI.input}
                                        placeholder="e.g. Request Free Proposal"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: TRUST */}
                            {activeSubTab === "trust" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Heading</h3>
                                  <div className="space-y-1.5">
                                    <label className={UI.label}>Marquee Heading</label>
                                    <input
                                      type="text"
                                      value={form.clientTrust?.heading || ""}
                                      onChange={(e) => setForm({ ...form, clientTrust: { ...form.clientTrust, heading: e.target.value } })}
                                      className={UI.input}
                                      placeholder="ENTERPRISE PLATFORMS WE INTEGRATE & ACCELERATE"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Platform Logos</h3>
                                  <div className="space-y-4">
                                    {(form.clientTrust?.logos || []).map((logo: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Platform Logo #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const l = form.clientTrust.logos.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Brand Name</label>
                                            <input
                                              type="text"
                                              value={logo.name || ""}
                                              onChange={(e) => {
                                                const l = [...form.clientTrust.logos];
                                                l[idx] = { ...l[idx], name: e.target.value };
                                                setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                              }}
                                              className={UI.input}
                                              placeholder="e.g. Google Ads, Shopify"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Fallback Icon</label>
                                            <IconSelector
                                              value={logo.icon || "Search"}
                                              onChange={(v) => {
                                                const l = [...form.clientTrust.logos];
                                                l[idx] = { ...l[idx], icon: v };
                                                setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <ImageField
                                          label="Brand Logo Image (Replaces icon if uploaded)"
                                          value={logo.image || ""}
                                          onChange={(url) => {
                                            const l = [...form.clientTrust.logos];
                                            l[idx] = { ...l[idx], image: url };
                                            setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                          }}
                                        />
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const l = [...(form.clientTrust?.logos || [])];
                                        l.push({ name: "Platform Name", icon: "Search", image: "" });
                                        setForm({ ...form, clientTrust: { ...form.clientTrust, logos: l } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Platform Logo
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: WHAT'S INCLUDED */}
                            {activeSubTab === "what-included" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow Tag</label>
                                      <input
                                        type="text"
                                        value={form.whatIncluded?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="03 // CORE CAPABILITIES"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.whatIncluded?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="What's Included in"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.whatIncluded?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, whatIncluded: { ...form.whatIncluded, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Our Delivery"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Capability Pillars</h3>
                                  <div className="space-y-4">
                                    {(form.whatIncluded?.pillars || []).map((pillar: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Pillar #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const p = form.whatIncluded.pillars.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Title</label>
                                          <input
                                            type="text"
                                            value={pillar.title || ""}
                                            onChange={(e) => {
                                              const p = [...form.whatIncluded.pillars];
                                              p[idx] = { ...p[idx], title: e.target.value };
                                              setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                            }}
                                            className={UI.input}
                                            placeholder="Strategic Discovery & Architecture"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={pillar.desc || ""}
                                            onChange={(e) => {
                                              const p = [...form.whatIncluded.pillars];
                                              p[idx] = { ...p[idx], desc: e.target.value };
                                              setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                        <BulletListEditor
                                          label="Deliverables Checklist"
                                          items={pillar.features || []}
                                          onChange={(feats) => {
                                            const p = [...form.whatIncluded.pillars];
                                            p[idx] = { ...p[idx], features: feats };
                                            setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                          }}
                                          placeholder="e.g. Technical Infrastructure Audit"
                                        />
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const p = [...(form.whatIncluded?.pillars || [])];
                                        p.push({ title: "New Capability Pillar", desc: "Description...", features: ["Inclusion 1", "Inclusion 2"] });
                                        setForm({ ...form, whatIncluded: { ...form.whatIncluded, pillars: p } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Capability Pillar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: STRATEGY */}
                            {activeSubTab === "strategy" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.strategy?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="04 // STRATEGIC APPROACH"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.strategy?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Engineered For"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.strategy?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Compounding Impact"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.strategy?.description || ""}
                                        onChange={(e) => setForm({ ...form, strategy: { ...form.strategy, description: e.target.value } })}
                                        className={UI.input}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Strategy Steps</h3>
                                  <div className="space-y-4">
                                    {(form.strategy?.components || []).map((comp: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Step #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const c = form.strategy.components.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-4">
                                          <div className="col-span-1 space-y-1.5">
                                            <label className={UI.label}>Step #</label>
                                            <input
                                              type="text"
                                              value={comp.num || `0${idx + 1}`}
                                              onChange={(e) => {
                                                const c = [...form.strategy.components];
                                                c[idx] = { ...c[idx], num: e.target.value };
                                                setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                              }}
                                              className={UI.input}
                                            />
                                          </div>
                                          <div className="col-span-3 space-y-1.5">
                                            <label className={UI.label}>Title</label>
                                            <input
                                              type="text"
                                              value={comp.title || ""}
                                              onChange={(e) => {
                                                const c = [...form.strategy.components];
                                                c[idx] = { ...c[idx], title: e.target.value };
                                                setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                              }}
                                              className={UI.input}
                                              placeholder="Diagnostic Audit & Benchmark"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={comp.desc || ""}
                                            onChange={(e) => {
                                              const c = [...form.strategy.components];
                                              c[idx] = { ...c[idx], desc: e.target.value };
                                              setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const c = [...(form.strategy?.components || [])];
                                        c.push({ num: `0${c.length + 1}`, title: "New Strategic Phase", desc: "Description..." });
                                        setForm({ ...form, strategy: { ...form.strategy, components: c } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Strategy Step
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: OUTCOMES / BENEFITS */}
                            {activeSubTab === "benefits" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.benefits?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="05 // MEASURABLE OUTCOMES"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.benefits?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Key Business"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.benefits?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Advantages"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.benefits?.description || ""}
                                        onChange={(e) => setForm({ ...form, benefits: { ...form.benefits, description: e.target.value } })}
                                        className={UI.input}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Benefit Cards</h3>
                                  <div className="space-y-4">
                                    {(form.benefits?.list || []).map((b: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Benefit Card #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const l = form.benefits.list.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Tag / Badge</label>
                                            <input
                                              type="text"
                                              value={b.tag || ""}
                                              onChange={(e) => {
                                                const l = [...form.benefits.list];
                                                l[idx] = { ...l[idx], tag: e.target.value };
                                                setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                              }}
                                              className={UI.input}
                                              placeholder="Organic Reach"
                                            />
                                          </div>
                                          <div className="md:col-span-2 space-y-1.5">
                                            <label className={UI.label}>Title</label>
                                            <input
                                              type="text"
                                              value={b.title || ""}
                                              onChange={(e) => {
                                                const l = [...form.benefits.list];
                                                l[idx] = { ...l[idx], title: e.target.value };
                                                setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                              }}
                                              className={UI.input}
                                              placeholder="Compounding Traffic & Authority"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={b.desc || ""}
                                            onChange={(e) => {
                                              const l = [...form.benefits.list];
                                              l[idx] = { ...l[idx], desc: e.target.value };
                                              setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const l = [...(form.benefits?.list || [])];
                                        l.push({ num: `0${l.length + 1}`, title: "New Outcome", desc: "Details...", tag: "Advantage" });
                                        setForm({ ...form, benefits: { ...form.benefits, list: l } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Benefit Card
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: PROCESS */}
                            {activeSubTab === "process" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.process?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, process: { ...form.process, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="06 // EXECUTION PROCESS"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.process?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, process: { ...form.process, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="A Systematic Path To"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.process?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, process: { ...form.process, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Market Leadership"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.process?.description || ""}
                                        onChange={(e) => setForm({ ...form, process: { ...form.process, description: e.target.value } })}
                                        className={UI.input}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#f0f0f1]">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Process Callout Tag / Badge (Optional)</label>
                                        <input
                                          type="text"
                                          value={form.process?.calloutTag || ""}
                                          onChange={(e) => setForm({ ...form, process: { ...form.process, calloutTag: e.target.value } })}
                                          className={UI.input + " font-mono text-xs"}
                                          placeholder="e.g. // PROCESS COMPLIANCE"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Process Callout Description (Optional)</label>
                                        <input
                                          type="text"
                                          value={form.process?.calloutText || ""}
                                          onChange={(e) => setForm({ ...form, process: { ...form.process, calloutText: e.target.value } })}
                                          className={UI.input}
                                          placeholder="e.g. Every milestone is cataloged in the shared workspace..."
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Process Roadmap Steps</h3>
                                  <div className="space-y-4">
                                    {(form.process?.steps || []).map((step: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Step #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const s = form.process.steps.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, process: { ...form.process, steps: s } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Phase Badge</label>
                                            <input
                                              type="text"
                                              value={step.badge || step.phaseTag || `PHASE 0${idx + 1}`}
                                              onChange={(e) => {
                                                const s = [...form.process.steps];
                                                s[idx] = { ...s[idx], badge: e.target.value, phaseTag: e.target.value };
                                                setForm({ ...form, process: { ...form.process, steps: s } });
                                              }}
                                              className={UI.input}
                                              placeholder="PHASE 01"
                                            />
                                          </div>
                                          <div className="md:col-span-2 space-y-1.5">
                                            <label className={UI.label}>Step Title</label>
                                            <input
                                              type="text"
                                              value={step.title || ""}
                                              onChange={(e) => {
                                                const s = [...form.process.steps];
                                                s[idx] = { ...s[idx], title: e.target.value };
                                                setForm({ ...form, process: { ...form.process, steps: s } });
                                              }}
                                              className={UI.input}
                                              placeholder="Discovery & Architecture"
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Step Description</label>
                                          <textarea
                                            rows={2}
                                            value={step.desc || ""}
                                            onChange={(e) => {
                                              const s = [...form.process.steps];
                                              s[idx] = { ...s[idx], desc: e.target.value };
                                              setForm({ ...form, process: { ...form.process, steps: s } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const s = [...(form.process?.steps || [])];
                                        s.push({ step: `0${s.length + 1}`, title: "New Roadmap Step", desc: "Step details...", badge: `PHASE 0${s.length + 1}` });
                                        setForm({ ...form, process: { ...form.process, steps: s } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Process Step
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: RESULTS */}
                            {activeSubTab === "results" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Performance Metrics</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(form.results?.metrics || []).map((m: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-3"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Metric #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const metrics = form.results.metrics.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, results: { ...form.results, metrics } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Value</label>
                                          <input
                                            type="text"
                                            value={m.value || ""}
                                            onChange={(e) => {
                                              const metrics = [...form.results.metrics];
                                              metrics[idx] = { ...metrics[idx], value: e.target.value };
                                              setForm({ ...form, results: { ...form.results, metrics } });
                                            }}
                                            className={UI.input + " font-bold border-[#2271b1]"}
                                            placeholder="+340%"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Label</label>
                                          <input
                                            type="text"
                                            value={m.label || ""}
                                            onChange={(e) => {
                                              const metrics = [...form.results.metrics];
                                              metrics[idx] = { ...metrics[idx], label: e.target.value };
                                              setForm({ ...form, results: { ...form.results, metrics } });
                                            }}
                                            className={UI.input}
                                            placeholder="Organic Lift"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Subtext</label>
                                          <input
                                            type="text"
                                            value={m.subtext || ""}
                                            onChange={(e) => {
                                              const metrics = [...form.results.metrics];
                                              metrics[idx] = { ...metrics[idx], subtext: e.target.value };
                                              setForm({ ...form, results: { ...form.results, metrics } });
                                            }}
                                            className={UI.input}
                                            placeholder="Within 90 days"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const metrics = [...(form.results?.metrics || [])];
                                      metrics.push({ value: "99.9%", label: "Uptime SLA", subtext: "Enterprise availability" });
                                      setForm({ ...form, results: { ...form.results, metrics } });
                                    }}
                                    className={UI.buttonAdd}
                                  >
                                    + Add Metric
                                  </button>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Spotlight Case Study Card</h3>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title</label>
                                        <input
                                          type="text"
                                          value={form.results?.caseStudy?.title || ""}
                                          onChange={(e) => setForm({ ...form, results: { ...form.results, caseStudy: { ...form.results?.caseStudy, title: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="Global Logistics Redesign"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Metric Highlight</label>
                                        <input
                                          type="text"
                                          value={form.results?.caseStudy?.metric || ""}
                                          onChange={(e) => setForm({ ...form, results: { ...form.results, caseStudy: { ...form.results?.caseStudy, metric: e.target.value } } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="+420% Inbound Pipeline"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.results?.caseStudy?.desc || ""}
                                        onChange={(e) => setForm({ ...form, results: { ...form.results, caseStudy: { ...form.results?.caseStudy, desc: e.target.value } } })}
                                        className={UI.input}
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Case Link</label>
                                        <input
                                          type="text"
                                          value={form.results?.caseStudy?.link || ""}
                                          onChange={(e) => setForm({ ...form, results: { ...form.results, caseStudy: { ...form.results?.caseStudy, link: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="/portfolio"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <ImageField
                                          label="Cover Image"
                                          value={form.results?.caseStudy?.image || ""}
                                          onChange={(url) => setForm({ ...form, results: { ...form.results, caseStudy: { ...form.results?.caseStudy, image: url } } })}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: INDUSTRIES */}
                            {activeSubTab === "industries" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.industries?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, industries: { ...form.industries, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="08 // DOMAIN EXPERTISE"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.industries?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, industries: { ...form.industries, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Tailored For High-Growth"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.industries?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, industries: { ...form.industries, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Industry Verticals"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.industries?.description || ""}
                                        onChange={(e) => setForm({ ...form, industries: { ...form.industries, description: e.target.value } })}
                                        className={UI.input}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Industry Sectors</h3>
                                  <div className="space-y-4">
                                    {(form.industries?.items || []).map((item: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Sector #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const items = form.industries.items.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, industries: { ...form.industries, items } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Name</label>
                                            <input
                                              type="text"
                                              value={item.name || ""}
                                              onChange={(e) => {
                                                const items = [...form.industries.items];
                                                items[idx] = { ...items[idx], name: e.target.value };
                                                setForm({ ...form, industries: { ...form.industries, items } });
                                              }}
                                              className={UI.input}
                                              placeholder="SaaS & Enterprise Tech"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Icon</label>
                                            <IconSelector
                                              value={item.icon || "Cpu"}
                                              onChange={(v) => {
                                                const items = [...form.industries.items];
                                                items[idx] = { ...items[idx], icon: v };
                                                setForm({ ...form, industries: { ...form.industries, items } });
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={item.desc || ""}
                                            onChange={(e) => {
                                              const items = [...form.industries.items];
                                              items[idx] = { ...items[idx], desc: e.target.value };
                                              setForm({ ...form, industries: { ...form.industries, items } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const items = [...(form.industries?.items || [])];
                                        items.push({ name: "New Industry Sector", desc: "Description...", icon: "Cpu" });
                                        setForm({ ...form, industries: { ...form.industries, items } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Industry Sector
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: TECH STACK */}
                            {activeSubTab === "tools" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.tools?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, tools: { ...form.tools, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="09 // TECHNICAL STACK"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.tools?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, tools: { ...form.tools, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Modern Technologies We"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.tools?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, tools: { ...form.tools, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Master & Deploy"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Tech Stack Category Groups</h3>
                                  <div className="space-y-4">
                                    {(form.tools?.categories || []).map((cat: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Category #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const categories = form.tools.categories.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, tools: { ...form.tools, categories } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Category Name</label>
                                          <input
                                            type="text"
                                            value={cat.category || ""}
                                            onChange={(e) => {
                                              const categories = [...form.tools.categories];
                                              categories[idx] = { ...categories[idx], category: e.target.value };
                                              setForm({ ...form, tools: { ...form.tools, categories } });
                                            }}
                                            className={UI.input}
                                            placeholder="Frontend & Frameworks"
                                          />
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Tool Items (Comma-separated)</label>
                                          <CommaSeparatedInput
                                            value={cat.items || []}
                                            onChange={(newItems) => {
                                              const categories = [...form.tools.categories];
                                              categories[idx] = { ...categories[idx], items: newItems };
                                              setForm({ ...form, tools: { ...form.tools, categories } });
                                            }}
                                            className={UI.input}
                                            placeholder="Next.js 16, React 19, TypeScript, Tailwind CSS"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const categories = [...(form.tools?.categories || [])];
                                        categories.push({ category: "New Tech Category", items: ["Tool 1", "Tool 2", "Tool 3"] });
                                        setForm({ ...form, tools: { ...form.tools, categories } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Tech Category Group
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: WHY PARTNER */}
                            {activeSubTab === "why-us" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.whyChooseUs?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="10 // WHY CHOOSE US"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.whyChooseUs?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Why Industry Leaders"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.whyChooseUs?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Partner With Us"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Value Proposition Points</h3>
                                  <div className="space-y-4">
                                    {(form.whyChooseUs?.points || []).map((pt: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <span className="text-[10px] font-bold text-[#646970] uppercase">Point #{idx + 1}</span>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const points = form.whyChooseUs.points.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, points } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Title</label>
                                            <input
                                              type="text"
                                              value={pt.title || ""}
                                              onChange={(e) => {
                                                const points = [...form.whyChooseUs.points];
                                                points[idx] = { ...points[idx], title: e.target.value };
                                                setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, points } });
                                              }}
                                              className={UI.input}
                                              placeholder="Zero Technical Debt"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Icon</label>
                                            <IconSelector
                                              value={pt.icon || "CheckCircle2"}
                                              onChange={(v) => {
                                                const points = [...form.whyChooseUs.points];
                                                points[idx] = { ...points[idx], icon: v };
                                                setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, points } });
                                              }}
                                            />
                                          </div>
                                        </div>
                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={pt.desc || ""}
                                            onChange={(e) => {
                                              const points = [...form.whyChooseUs.points];
                                              points[idx] = { ...points[idx], desc: e.target.value };
                                              setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, points } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const points = [...(form.whyChooseUs?.points || [])];
                                        points.push({ title: "New Value Point", desc: "Description...", icon: "CheckCircle2" });
                                        setForm({ ...form, whyChooseUs: { ...form.whyChooseUs, points } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Value Point
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: PRICING */}
                            {activeSubTab === "pricing" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.pricing?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="11 // ENGAGEMENT MODELS"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.pricing?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Transparent Pricing For"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.pricing?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, pricing: { ...form.pricing, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Every Scale"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Pricing Tier Packages</h3>
                                  <div className="space-y-4">
                                    {(form.pricing?.plans || []).map((plan: any, idx: number) => (
                                      <div key={idx} className={UI.card + " space-y-4"}>
                                        <div className="flex justify-between items-center pb-2 border-b border-[#f0f0f1]">
                                          <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-bold text-[#646970] uppercase">Plan #{idx + 1}: {plan.name || "Untitled"}</span>
                                            {plan.popular && (
                                              <span className="bg-[#E9BD36] text-[#080710] text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                                                Popular
                                              </span>
                                            )}
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() => {
                                              const plans = form.pricing.plans.filter((_: any, i: number) => i !== idx);
                                              setForm({ ...form, pricing: { ...form.pricing, plans } });
                                            }}
                                            className="text-[#d63638]"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Plan Name</label>
                                            <input
                                              type="text"
                                              value={plan.name || ""}
                                              onChange={(e) => {
                                                const plans = [...form.pricing.plans];
                                                plans[idx] = { ...plans[idx], name: e.target.value };
                                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                                              }}
                                              className={UI.input}
                                              placeholder="Growth Sprint"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Price</label>
                                            <input
                                              type="text"
                                              value={plan.price || ""}
                                              onChange={(e) => {
                                                const plans = [...form.pricing.plans];
                                                plans[idx] = { ...plans[idx], price: e.target.value };
                                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                                              }}
                                              className={UI.input + " font-bold border-[#2271b1]"}
                                              placeholder="$4,500"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Period</label>
                                            <input
                                              type="text"
                                              value={plan.period || ""}
                                              onChange={(e) => {
                                                const plans = [...form.pricing.plans];
                                                plans[idx] = { ...plans[idx], period: e.target.value };
                                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                                              }}
                                              className={UI.input}
                                              placeholder="/ project"
                                            />
                                          </div>
                                        </div>

                                        <div className="space-y-1.5">
                                          <label className={UI.label}>Description</label>
                                          <textarea
                                            rows={2}
                                            value={plan.description || ""}
                                            onChange={(e) => {
                                              const plans = [...form.pricing.plans];
                                              plans[idx] = { ...plans[idx], description: e.target.value };
                                              setForm({ ...form, pricing: { ...form.pricing, plans } });
                                            }}
                                            className={UI.input}
                                          />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Button Text</label>
                                            <input
                                              type="text"
                                              value={plan.ctaText || ""}
                                              onChange={(e) => {
                                                const plans = [...form.pricing.plans];
                                                plans[idx] = { ...plans[idx], ctaText: e.target.value };
                                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                                              }}
                                              className={UI.input}
                                              placeholder="Start Growth Sprint"
                                            />
                                          </div>
                                          <div className="space-y-1.5">
                                            <label className={UI.label}>Button Link</label>
                                            <input
                                              type="text"
                                              value={plan.ctaLink || ""}
                                              onChange={(e) => {
                                                const plans = [...form.pricing.plans];
                                                plans[idx] = { ...plans[idx], ctaLink: e.target.value };
                                                setForm({ ...form, pricing: { ...form.pricing, plans } });
                                              }}
                                              className={UI.input}
                                              placeholder="/contact"
                                            />
                                          </div>
                                        </div>

                                        <label className="flex items-center gap-2 cursor-pointer text-[12px] font-bold text-[#1d2327]">
                                          <input
                                            type="checkbox"
                                            checked={!!plan.popular}
                                            onChange={(e) => {
                                              const plans = [...form.pricing.plans];
                                              plans[idx] = { ...plans[idx], popular: e.target.checked };
                                              setForm({ ...form, pricing: { ...form.pricing, plans } });
                                            }}
                                          />
                                          Mark as Most Popular
                                        </label>

                                        <BulletListEditor
                                          label="Included Scope & Features"
                                          items={plan.features || []}
                                          onChange={(feats) => {
                                            const plans = [...form.pricing.plans];
                                            plans[idx] = { ...plans[idx], features: feats };
                                            setForm({ ...form, pricing: { ...form.pricing, plans } });
                                          }}
                                          placeholder="e.g. Complete Technical & UX Audit"
                                        />
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const plans = [...(form.pricing?.plans || [])];
                                        plans.push({
                                          name: "Custom Enterprise Scope",
                                          price: "Custom",
                                          period: "/ quote",
                                          description: "Tailored architecture...",
                                          popular: false,
                                          features: ["Dedicated Lead Architect", "Custom Scope"],
                                          ctaText: "Request Quote",
                                          ctaLink: "/contact"
                                        });
                                        setForm({ ...form, pricing: { ...form.pricing, plans } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Pricing Tier
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: GLOBAL COVERAGE / SERVICE AREA */}
                            {activeSubTab === "serviceArea" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Section Header & Narrative</h3>
                                  <div className="space-y-1.5">
                                    <label className={UI.label}>Badge / Tag</label>
                                    <input
                                      type="text"
                                      value={form.serviceArea?.sectionTag || "12 // GLOBAL REACH"}
                                      onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), sectionTag: e.target.value } })}
                                      className={UI.input}
                                      placeholder="e.g. 12 // GLOBAL REACH"
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Title Intro</label>
                                      <input
                                        type="text"
                                        value={form.serviceArea?.titleIntro || "Serving Clients Across "}
                                        onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), titleIntro: e.target.value } })}
                                        className={UI.input}
                                        placeholder="e.g. Serving Clients Across "
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Title Highlight</label>
                                      <input
                                        type="text"
                                        value={form.serviceArea?.titleHighlight || "Prime Global Markets"}
                                        onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), titleHighlight: e.target.value } })}
                                        className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                                        placeholder="e.g. Prime Global Markets"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className={UI.label}>Description</label>
                                    <textarea
                                      rows={2}
                                      value={form.serviceArea?.description || "Deploying high-performance digital platforms across North America, Europe, and worldwide."}
                                      onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), description: e.target.value } })}
                                      className={UI.input}
                                      placeholder="e.g. Deploying high-performance digital platforms across North America, Europe, and worldwide."
                                    />
                                  </div>
                                </div>

                                {/* 2. CTA Button */}
                                <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                                  <h3 className={UI.sectionHeader}>2. Call to Action Button</h3>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Button Text</label>
                                      <input
                                        type="text"
                                        value={form.serviceArea?.ctaText || "Schedule Global Consultation"}
                                        onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), ctaText: e.target.value } })}
                                        className={UI.input}
                                        placeholder="e.g. Schedule Global Consultation"
                                      />
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Button Link</label>
                                      <input
                                        type="text"
                                        value={form.serviceArea?.ctaHref || "#contact-form"}
                                        onChange={(e) => setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), ctaHref: e.target.value } })}
                                        className={UI.input}
                                        placeholder="e.g. #contact-form or /contact"
                                      />
                                    </div>
                                  </div>
                                </div>

                                {/* 3. Global Operating Locations (Hubs) */}
                                <div className="space-y-6 pt-8 border-t border-[#f0f0f1]">
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <h3 className={UI.sectionHeader}>3. Active Global Operating Locations</h3>
                                      <p className="text-xs text-[#646970]">Choose or type any country or state. Real GPS coordinates are automatically mapped on the live interactive globe.</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentHubs = (Array.isArray(form.serviceArea?.hubs) && form.serviceArea.hubs.length > 0)
                                          ? form.serviceArea.hubs
                                          : [
                                            { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                            { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                            { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                            { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                                          ];
                                        const newHub = { id: `hub-${Date.now()}`, name: "California, USA", focus: "Regional Hub", timezone: "PST", link: "/locations" };
                                        setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: [...currentHubs, newHub] } });
                                      }}
                                      className={UI.buttonAdd}
                                    >
                                      + Add Location Hub
                                    </button>
                                  </div>

                                  <div className="space-y-4">
                                    {((Array.isArray(form.serviceArea?.hubs) && form.serviceArea.hubs.length > 0)
                                      ? form.serviceArea.hubs
                                      : [
                                        { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                        { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                        { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                        { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                                      ]
                                    ).map((hub: any, hIdx: number) => {
                                      const currentHubs = (Array.isArray(form.serviceArea?.hubs) && form.serviceArea.hubs.length > 0)
                                        ? form.serviceArea.hubs
                                        : [
                                          { id: "us", name: "United States", focus: "Architecture & Design", timezone: "EST / PST", link: "/locations" },
                                          { id: "ca", name: "Canada", focus: "Cloud & Security", timezone: "EST", link: "/locations" },
                                          { id: "uk", name: "United Kingdom", focus: "Fintech & Enterprise UI", timezone: "GMT", link: "/locations" },
                                          { id: "de", name: "Germany", focus: "High Performance Web", timezone: "CET", link: "/locations" }
                                        ];

                                      return (
                                        <div key={hIdx} className={UI.card + " space-y-4 relative"}>
                                          <div className="flex justify-between items-center border-b border-[#f0f0f1] pb-2">
                                            <span className="text-xs font-bold text-[#1d2327]">Location Hub #{hIdx + 1}: {hub.name || "Unnamed"}</span>
                                            <button
                                              type="button"
                                              onClick={() => {
                                                const updated = currentHubs.filter((_: any, idx: number) => idx !== hIdx);
                                                setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                              }}
                                              className="text-[#d63638] hover:text-[#b32d2e] p-1 text-xs font-semibold"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                              <label className={UI.label}>Country or US State</label>
                                              <input
                                                type="text"
                                                list="service-countries-list"
                                                value={hub.name || ""}
                                                onChange={(e) => {
                                                  const val = e.target.value;
                                                  const resolved = resolveCountryLocation(val);
                                                  const updated = [...currentHubs];
                                                  updated[hIdx] = {
                                                    ...updated[hIdx],
                                                    name: val,
                                                    id: (resolved as any)?.id || hub.id || val.toLowerCase().replace(/[^a-z0-9]/g, "-"),
                                                    timezone: resolved?.timezone || hub.timezone || "UTC",
                                                    x: resolved?.x || hub.x || "50%",
                                                    y: resolved?.y || hub.y || "50%"
                                                  };
                                                  setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                                }}
                                                className={UI.input + " font-bold text-[#2271b1]"}
                                                placeholder="e.g. Germany, Florida, United Kingdom..."
                                              />
                                              <datalist id="service-countries-list">
                                                {AVAILABLE_COUNTRIES.map((c) => (
                                                  <option key={c} value={c} />
                                                ))}
                                              </datalist>
                                            </div>

                                            <div className="space-y-1.5">
                                              <label className={UI.label}>Regional Focus / Specialization</label>
                                              <input
                                                type="text"
                                                value={hub.focus || ""}
                                                onChange={(e) => {
                                                  const updated = [...currentHubs];
                                                  updated[hIdx] = { ...updated[hIdx], focus: e.target.value };
                                                  setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                                }}
                                                className={UI.input}
                                                placeholder="e.g. High Performance Web, Enterprise UI"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="space-y-1.5">
                                              <label className={UI.label}>Timezone</label>
                                              <input
                                                type="text"
                                                value={hub.timezone || ""}
                                                onChange={(e) => {
                                                  const updated = [...currentHubs];
                                                  updated[hIdx] = { ...updated[hIdx], timezone: e.target.value };
                                                  setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                                }}
                                                className={UI.input}
                                                placeholder="e.g. CET, EST, GMT"
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <label className={UI.label}>Map Pin X% Coordinate</label>
                                              <input
                                                type="text"
                                                value={hub.x || ""}
                                                onChange={(e) => {
                                                  const updated = [...currentHubs];
                                                  updated[hIdx] = { ...updated[hIdx], x: e.target.value };
                                                  setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                                }}
                                                className={UI.input}
                                                placeholder="e.g. 49.66%"
                                              />
                                            </div>
                                            <div className="space-y-1.5">
                                              <label className={UI.label}>Map Pin Y% Coordinate</label>
                                              <input
                                                type="text"
                                                value={hub.y || ""}
                                                onChange={(e) => {
                                                  const updated = [...currentHubs];
                                                  updated[hIdx] = { ...updated[hIdx], y: e.target.value };
                                                  setForm({ ...form, serviceArea: { ...(form.serviceArea || {}), hubs: updated } });
                                                }}
                                                className={UI.input}
                                                placeholder="e.g. 43.78%"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* SUBTAB: CTA BANNER */}
                            {activeSubTab === "final-cta" && (
                              <div className="space-y-12">
                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>1. Banner Content</h3>
                                  <div className="space-y-4">
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Eyebrow</label>
                                      <input
                                        type="text"
                                        value={form.finalCta?.eyebrow || ""}
                                        onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, eyebrow: e.target.value } })}
                                        className={UI.input}
                                        placeholder="12 // START BUILDING"
                                      />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Intro</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.titleIntro || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, titleIntro: e.target.value } })}
                                          className={UI.input}
                                          placeholder="Ready to Transform Your"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Title Highlight</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.titleHighlight || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, titleHighlight: e.target.value } })}
                                          className={UI.input + " font-bold border-[#2271b1]"}
                                          placeholder="Digital Presence?"
                                        />
                                      </div>
                                    </div>
                                    <div className="space-y-1.5">
                                      <label className={UI.label}>Description</label>
                                      <textarea
                                        rows={2}
                                        value={form.finalCta?.description || ""}
                                        onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, description: e.target.value } })}
                                        className={UI.input}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>2. Buttons</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className={UI.card + " space-y-3"}>
                                      <span className="text-xs font-bold text-[#1d2327] uppercase">Primary Button</span>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Text</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.primaryCta?.text || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, primaryCta: { ...form.finalCta?.primaryCta, text: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="Schedule Strategy Call"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Link</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.primaryCta?.link || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, primaryCta: { ...form.finalCta?.primaryCta, link: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="/contact"
                                        />
                                      </div>
                                    </div>

                                    <div className={UI.card + " space-y-3"}>
                                      <span className="text-xs font-bold text-[#1d2327] uppercase">Secondary Button</span>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Text</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.secondaryCta?.text || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, secondaryCta: { ...form.finalCta?.secondaryCta, text: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="View Portfolio"
                                        />
                                      </div>
                                      <div className="space-y-1.5">
                                        <label className={UI.label}>Link</label>
                                        <input
                                          type="text"
                                          value={form.finalCta?.secondaryCta?.link || ""}
                                          onChange={(e) => setForm({ ...form, finalCta: { ...form.finalCta, secondaryCta: { ...form.finalCta?.secondaryCta, link: e.target.value } } })}
                                          className={UI.input}
                                          placeholder="/portfolio"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-6">
                                  <h3 className={UI.sectionHeader}>3. Media</h3>
                                  <ImageField
                                    label="CTA Background Graphic"
                                    value={form.finalCta?.backgroundImage || ""}
                                    onChange={(url) => setForm({ ...form, finalCta: { ...form.finalCta, backgroundImage: url } })}
                                  />
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SEO SETTINGS */}
                  {mainTab === 'seo' && (
                    <SeoEditor
                      data={seo}
                      setData={setSeo}
                      pageSlug={form.slug || ""}
                      pageTitle={form.title || ""}
                      pageContent={form}
                    />
                  )}

                  {/* TAB 3: SERVICE FAQS */}
                  {mainTab === 'faqs' && (
                    <div className="p-5 sm:p-6 space-y-8">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f0f0f1] pb-4">
                        <div>
                          <h3 className="text-base font-bold text-[#1d2327]">Service-Specific FAQs & Accordions</h3>
                          <p className="text-[12px] text-[#646970] mt-0.5">These FAQs and schema blocks will appear on this service detail page.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const currentFaqs = Array.isArray(form.faqs) ? form.faqs : [];
                            const nf = [...currentFaqs];
                            nf.push({ question: "", answer: "", category: "GENERAL" });
                            setForm({ ...form, faqs: nf });
                          }}
                          className="bg-white border border-[#2271b1] text-[#2271b1] px-3.5 py-1.5 text-[12px] font-bold rounded-[3px] hover:bg-[#f0f6fb] transition-colors self-start"
                        >
                          + Add FAQ Question
                        </button>
                      </div>

                      {/* 1. Header Narrative */}
                      <div className="space-y-4">
                        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">1. Section Header Narrative</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Badge / Tag</label>
                            <input
                              type="text"
                              value={form.faqBadge || ""}
                              onChange={e => setForm({ ...form, faqBadge: e.target.value })}
                              placeholder="e.g. FREQUENTLY ASKED QUESTIONS"
                              className={UI.input}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Headline Intro</label>
                            <input
                              type="text"
                              value={form.faqTitleIntro || ""}
                              onChange={e => setForm({ ...form, faqTitleIntro: e.target.value })}
                              placeholder="e.g. Got Questions?"
                              className={UI.input}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Headline Highlight</label>
                            <input
                              type="text"
                              value={form.faqTitleHighlight || ""}
                              onChange={e => setForm({ ...form, faqTitleHighlight: e.target.value })}
                              placeholder="e.g. Clear Answers"
                              className={UI.input + " font-bold border-[#2271b1] text-[#2271b1]"}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Description Subtext</label>
                          <textarea
                            rows={2}
                            value={form.faqDescription || ""}
                            onChange={e => setForm({ ...form, faqDescription: e.target.value })}
                            placeholder="Explore answers to common questions..."
                            className={UI.input}
                          />
                        </div>
                      </div>

                      {/* 2. Questions List */}
                      <div className="space-y-4">
                        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1d2327]">2. FAQ Accordion Items</h4>
                        {(form.faqs || []).map((faq: any, idx: number) => (
                          <div key={idx} className={UI.card + " space-y-3"}>
                            <div className="flex items-center justify-between border-b border-[#f0f0f1] pb-2">
                              <span className="text-xs font-bold text-[#1d2327]">Question #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const nf = form.faqs.filter((_: any, i: number) => i !== idx);
                                  setForm({ ...form, faqs: nf });
                                }}
                                className="text-[#d63638] text-xs font-bold hover:underline"
                              >
                                Remove
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                              <div className="sm:col-span-3 space-y-1.5">
                                <label className={UI.label}>Question</label>
                                <input
                                  type="text"
                                  value={faq.question || ""}
                                  onChange={e => {
                                    const nf = [...form.faqs];
                                    nf[idx].question = e.target.value;
                                    setForm({ ...form, faqs: nf });
                                  }}
                                  placeholder="What is your typical turnaround time?"
                                  className={UI.input}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <label className={UI.label}>Category</label>
                                <input
                                  type="text"
                                  value={faq.category || ""}
                                  onChange={e => {
                                    const nf = [...form.faqs];
                                    nf[idx].category = e.target.value;
                                    setForm({ ...form, faqs: nf });
                                  }}
                                  placeholder="TIMELINE"
                                  className={UI.input}
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <label className={UI.label}>Answer</label>
                              <textarea
                                rows={3}
                                value={faq.answer || ""}
                                onChange={e => {
                                  const nf = [...form.faqs];
                                  nf[idx].answer = e.target.value;
                                  setForm({ ...form, faqs: nf });
                                }}
                                placeholder="Write clear, detailed answer here..."
                                className={UI.input}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 3. Schema Markup */}
                      <div className="pt-5 border-t border-[#c3c4c7] space-y-2">
                        <label className="text-[13px] font-bold text-[#1d2327]">FAQ Schema Markup (Bulk JSON-LD)</label>
                        <p className="text-[12px] text-[#646970] mt-0.5">Paste a single JSON-LD schema block covering all FAQs for this service page.</p>
                        <textarea
                          value={form.faqSchemaMarkup || ""}
                          onChange={e => setForm({ ...form, faqSchemaMarkup: e.target.value })}
                          className="w-full border border-[#c3c4c7] px-3 py-2 text-[13px] font-mono rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                          rows={6}
                          placeholder='e.g. {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [...]}'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar (Right Column - Exact WP Style matching /admin/pages/[id]) */}
            <div className="w-full lg:w-[260px] flex-shrink-0 space-y-4">
              {/* Publish Box */}
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                  <h2 className="text-[13px] font-semibold text-[#1d2327]">Publish</h2>
                </div>
                <div className="p-3 space-y-2 text-[12px] text-[#2c3338]">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5 text-[#82878c]" /> Status:</span>
                    <select
                      value={form.status || "published"}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                      className="bg-white border border-[#8c8f94] text-[12px] px-1 py-0.5 rounded-[3px] outline-none focus:border-[#2271b1]"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-[#82878c]" /> Date:</span>
                    <strong>{new Date().toLocaleDateString()}</strong>
                  </div>
                  {form.slug && (
                    <div className="pt-2 border-t border-[#f0f0f1] mt-2">
                      <Link
                        href={`/services/${form.slug}`}
                        target="_blank"
                        className="text-[#2271b1] hover:underline flex items-center gap-1"
                      >
                        View Service <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </div>
                <div className="bg-[#f6f7f7] border-t border-[#c3c4c7] px-3 py-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleMoveToTrash(form)}
                    className="text-[#d63638] underline text-[12px] hover:text-[#b32d2e]"
                  >
                    Trash
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveService}
                    disabled={saving}
                    className="bg-[#2271b1] text-white text-[12px] font-semibold px-3 py-1 rounded-[3px] border border-[#135e96] shadow-[0_1px_0_#135e96] hover:bg-[#135e96] disabled:opacity-50"
                  >
                    {saving ? "..." : "Update"}
                  </button>
                </div>
              </div>

              {/* Service Attributes Box */}
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                  <h2 className="text-[13px] font-semibold text-[#1d2327]">Service Attributes</h2>
                </div>
                <div className="p-3 space-y-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#1d2327]">Category Tag</label>
                    <input
                      type="text"
                      value={form.tag || ""}
                      onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[12px] rounded-[3px] outline-none focus:border-[#2271b1]"
                      placeholder="e.g. Premium Solution"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#1d2327]">Menu Icon</label>
                    <IconSelector value={form.icon || "Search"} onChange={(v) => setForm({ ...form, icon: v })} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-[#1d2327]">Order / Position</label>
                    <input
                      type="text"
                      value={form.number || "01"}
                      onChange={(e) => setForm({ ...form, number: e.target.value })}
                      className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[12px] rounded-[3px] outline-none focus:border-[#2271b1]"
                    />
                  </div>
                </div>
              </div>

              {/* Featured Image Box */}
              <div className="bg-white border border-[#c3c4c7] shadow-sm rounded-sm overflow-hidden">
                <div className="px-3 py-1.5 border-b border-[#c3c4c7] bg-[#f6f7f7]">
                  <h2 className="text-[13px] font-semibold text-[#1d2327]">Featured Image</h2>
                </div>
                <div className="p-3">
                  {(seo?.featuredImage || form.hero?.backgroundImage) ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video bg-slate-50 border border-[#c3c4c7] rounded-sm overflow-hidden group">
                        <img
                          src={seo.featuredImage || form.hero?.backgroundImage}
                          alt="Featured"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => {
                            setSeo({ ...seo, featuredImage: '' });
                            setForm({ ...form, hero: { ...form.hero, backgroundImage: '', bgImage: '' } });
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => setShowMediaSelector(true)}
                        className="text-[#2271b1] underline text-[12px] hover:text-[#135e96]"
                      >
                        Set featured image
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowMediaSelector(true)}
                      className="text-[#2271b1] underline text-[12px] hover:text-[#135e96]"
                    >
                      Set featured image
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ──────────────────────────────────────────────────────────────────────────
           ALL SERVICES DIRECTORY TABLE VIEW (EXACT MATCH OF /admin/pages UI)
        ────────────────────────────────────────────────────────────────────────── */
        <div className="space-y-4">
          {/* WP Header Area */}
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-[23px] font-normal text-[#1d2327] font-serif m-0">Services</h1>
            <button
              onClick={handleAddNew}
              className="bg-white border border-[#2271b1] text-[#2271b1] hover:bg-[#f6f7f7] hover:text-[#135e96] hover:border-[#135e96] px-2 py-1 text-[13px] rounded-[3px] transition-colors"
            >
              Add New Service
            </button>
          </div>

          {/* Filter Links */}
          <div className="flex items-center gap-2 text-[13px]">
            <button onClick={() => setFilter("all")} className={`${filter === 'all' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              All <span className="text-[#646970] font-normal">({services.filter(s => !s.isTrashed).length})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("published")} className={`${filter === 'published' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              Published <span className="text-[#646970] font-normal">({publishedCount})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("draft")} className={`${filter === 'draft' ? 'text-black font-bold' : 'text-[#2271b1] hover:text-[#135e96] underline decoration-transparent hover:decoration-current'}`}>
              Drafts <span className="text-[#646970] font-normal">({draftCount})</span>
            </button>
            <span className="text-[#c3c4c7]">|</span>
            <button onClick={() => setFilter("trash")} className={`${filter === 'trash' ? 'text-black font-bold' : 'text-[#d63638] underline decoration-transparent hover:decoration-current'}`}>
              Trash <span className="text-[#646970] font-normal">({trashCount})</span>
            </button>
          </div>

          {/* Top Bar: Bulk Actions & Search */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <select
                className="border border-[#8c8f94] bg-white text-[#2c3338] px-2 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
              >
                <option value="">Bulk actions</option>
                {filter === 'trash' ? (
                  <>
                    <option value="restore">Restore</option>
                    <option value="delete">Delete Permanently</option>
                  </>
                ) : (
                  <>
                    <option value="publish">Mark as Published</option>
                    <option value="draft">Mark as Draft</option>
                    <option value="trash">Move to Trash</option>
                  </>
                )}
              </select>
              <button
                onClick={() => { handleBulkAction(bulkAction); setBulkAction(""); }}
                className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors"
              >
                Apply
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search Services"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1]"
              />
              <button className="bg-white border border-[#8c8f94] text-[#2c3338] px-3 py-1 text-[13px] rounded-[3px] hover:bg-[#f6f7f7] transition-colors">
                Search Services
              </button>
            </div>
          </div>

          {/* Table Pagination Info */}
          <div className="flex justify-end text-[13px] text-[#50575e]">
            {filteredServices.length} items
          </div>

          {/* WP-Style Table */}
          <div className="bg-white border border-[#c3c4c7] rounded-sm overflow-hidden shadow-[0_1px_1px_rgba(0,0,0,0.04)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#c3c4c7] text-[#1d2327]">
                  <th className="w-8 py-2 px-3">
                    <input
                      type="checkbox"
                      checked={filteredServices.length > 0 && selectedIds.length === filteredServices.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                    />
                  </th>
                  <th className="py-2 px-3 text-[14px] font-semibold">Title</th>
                  <th className="py-2 px-3 text-[14px] font-semibold w-48">Category Tag</th>
                  <th className="py-2 px-3 text-[14px] font-semibold w-40">Status</th>
                  <th className="py-2 px-3 text-[14px] font-semibold w-32">Date</th>
                </tr>
              </thead>
              <tbody className="text-[13px] text-[#2c3338]">
                {filteredServices.length === 0 ? (
                  <tr><td colSpan={5} className="py-6 px-4 text-[#50575e]">No services found.</td></tr>
                ) : (
                  filteredServices.map((service, idx) => (
                    <tr
                      key={service.id || service.slug || idx}
                      className={`border-b border-[#f0f0f1] group ${idx % 2 === 0 ? "bg-[#f9f9f9]" : "bg-white"} hover:bg-[#f0f0f1] transition-colors`}
                    >
                      <td className="py-3 px-3 align-top">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(service.id || service.slug)}
                          onChange={() => toggleSelect(service.id || service.slug)}
                          className="w-4 h-4 border-[#8c8f94] rounded-[3px] text-[#2271b1] focus:ring-[#2271b1]"
                        />
                      </td>
                      <td className="py-3 px-3 align-top">
                        <strong className="text-[#2271b1] block text-[14px]">
                          {service.title || "Untitled Service"} — {service.status === 'draft' ? <span className="text-[#646970] font-normal italic">Draft</span> : <span className="text-[#00a32a] font-normal italic">Published</span>}
                        </strong>
                        <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEdit(service)} className="text-[#2271b1] hover:underline text-[12px]">Edit</button>
                          <span className="text-[#a7aaad]">|</span>
                          <button onClick={() => setEditingService(service)} className="text-[#2271b1] hover:underline text-[12px]">Quick Edit</button>
                          <span className="text-[#a7aaad]">|</span>
                          <button onClick={() => handleDuplicate(service)} className="text-[#2271b1] hover:underline text-[12px]">Duplicate</button>
                          <span className="text-[#a7aaad]">|</span>
                          <button onClick={() => toggleStatus(service)} className="text-[#2271b1] hover:underline text-[12px]">
                            {service.status === 'published' ? 'Keep as Draft' : 'Publish Now'}
                          </button>
                          <span className="text-[#a7aaad]">|</span>
                          {service.slug && (
                            <>
                              <Link href={`/services/${service.slug}`} target="_blank" className="text-[#2271b1] hover:underline text-[12px]">View</Link>
                              <span className="text-[#a7aaad]">|</span>
                            </>
                          )}
                          {service.isTrashed ? (
                            <>
                              <button onClick={() => handleRestore(service)} className="text-[#2271b1] hover:underline text-[12px]">Restore</button>
                              <span className="text-[#a7aaad]">|</span>
                              <button onClick={() => handleDeletePermanently(service)} className="text-[#d63638] hover:underline text-[12px]">Delete Permanently</button>
                            </>
                          ) : (
                            <button onClick={() => handleMoveToTrash(service)} className="text-[#d63638] hover:underline text-[12px]">Trash</button>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 align-top capitalize text-[#50575e]">
                        {service.tag || "General"}
                      </td>
                      <td className="py-3 px-3 align-top">
                        <span className={`font-semibold ${service.status === 'published' ? 'text-[#00a32a]' : 'text-[#d63638]'}`}>
                          {service.status === 'published' ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-top text-[#50575e]">
                        {new Date(service.createdAt || Date.now()).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* WP-Style Modal for Add New Service */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-[#00000066]" />
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Add New Service</h2>
                <button onClick={() => setShowAddModal(false)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-4 space-y-4 bg-[#f0f0f1]">
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Title</label>
                  <input
                    type="text"
                    value={newService.title}
                    onChange={(e) => {
                      const slug = e.target.value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, "-");
                      setNewService({ ...newService, title: e.target.value, slug });
                    }}
                    placeholder="Enter service title here"
                    className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.07)] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Slug</label>
                  <input
                    type="text"
                    value={newService.slug}
                    onChange={(e) => setNewService({ ...newService, slug: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Category Tag</label>
                  <input
                    type="text"
                    value={newService.tag}
                    onChange={(e) => setNewService({ ...newService, tag: e.target.value })}
                    placeholder="e.g. Premium Solution"
                    className="w-full border border-[#8c8f94] bg-white px-3 py-1.5 text-[14px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#1d2327] text-sm font-semibold mb-1">Status</label>
                  <select
                    value={newService.status}
                    onChange={(e) => setNewService({ ...newService, status: e.target.value })}
                    className="w-full border border-[#8c8f94] bg-white px-2 py-1.5 text-[14px] rounded-[3px] outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                <button
                  type="button"
                  onClick={handleCreateNewService}
                  className="bg-[#2271b1] text-white text-[13px] px-4 py-1.5 rounded-[3px] border border-[#2271b1] hover:bg-[#135e96] hover:border-[#135e96] transition-colors"
                >
                  Publish & Edit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WP-Style Quick Edit Modal */}
      <AnimatePresence>
        {editingService && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingService(null)} className="absolute inset-0 bg-[#00000066]" />
            <motion.div
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -10, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#f1f1f1] border border-[#c3c4c7] shadow-lg rounded-[3px] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#c3c4c7]">
                <h2 className="text-[#1d2327] text-lg font-normal font-serif">Quick Edit</h2>
                <button onClick={() => setEditingService(null)} className="text-[#787c82] hover:text-[#d63638]"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleQuickEditSave}>
                <div className="p-6 bg-[#f0f0f1] grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Title</label>
                      <input
                        type="text"
                        value={editingService.title || ""}
                        onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Slug</label>
                      <input
                        type="text"
                        value={editingService.slug || ""}
                        onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Category Tag</label>
                      <input
                        type="text"
                        value={editingService.tag || ""}
                        onChange={(e) => setEditingService({ ...editingService, tag: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-3 py-1 text-[13px] rounded-[3px] outline-none focus:border-[#2271b1]"
                      />
                    </div>
                    <div>
                      <label className="block text-[#1d2327] text-[12px] font-bold mb-1">Status</label>
                      <select
                        value={editingService.status || "published"}
                        onChange={(e) => setEditingService({ ...editingService, status: e.target.value })}
                        className="w-full border border-[#8c8f94] bg-white px-2 py-1 text-[13px] rounded-[3px] outline-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 px-4 py-3 bg-[#f6f7f7] border-t border-[#c3c4c7]">
                  <button type="button" onClick={() => setEditingService(null)} className="text-[#2271b1] text-[13px] hover:text-[#135e96]">Cancel</button>
                  <button
                    type="submit"
                    className="bg-[#2271b1] text-white text-[13px] font-bold px-4 py-1.5 rounded-[3px] border border-[#135e96] hover:bg-[#135e96]"
                  >
                    Update
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Media Selector Modal */}
      <AnimatePresence>
        {showMediaSelector && (
          <MediaSelector
            onSelect={(item: any) => {
              const url = item.url;
              const altText = item.alt || '';
              setSeo((prev: any) => ({
                ...prev,
                featuredImage: url,
                featuredImageAlt: altText,
                ogImage: prev.ogImage || url,
                twitterImage: prev.twitterImage || url,
              }));
              setForm((prev: any) => ({
                ...prev,
                hero: {
                  ...prev.hero,
                  backgroundImage: url,
                  bgImage: url
                }
              }));
              setShowMediaSelector(false);
            }}
            onClose={() => setShowMediaSelector(false)}
          />
        )}
      </AnimatePresence>

      {/* Floating Toast Alert */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`fixed bottom-10 right-10 z-[100] px-4 py-2 bg-white border-l-4 text-[12px] shadow-lg ${
              message.includes("Error") ? "border-[#d63638]" : "border-[#00a32a]"
            }`}
          >
            <p className="text-[#1d2327] m-0">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
